// ── server.js ───────────────────────────────────────────────────────────────
// ADMIN PIN: Set via ADMIN_PIN env var (default: "1234"). Shared by all admins.
// DATA: Stored in data.json. Persists during Railway runtime, resets on redeploy
// unless a volume is attached.
// ─────────────────────────────────────────────────────────────────────────────

import express from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PIN = process.env.ADMIN_PIN || "1234";
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = join(DATA_DIR, "data.json");

app.use(express.json());

// ── Process Gate Template (14 gates per vendor) ─────────────────────────────

function createGateTemplate() {
  return [
    { id: "ma",        label: "Mission Analysis",                  short: "MA",       group: "core",  status: "red", assignedAdmin: "" },
    { id: "rwg",       label: "Requirements Working Group",        short: "RWG",      group: "core",  status: "red", assignedAdmin: "" },
    { id: "fm",        label: "Financial Management",              short: "FM",       group: "core",  status: "red", assignedAdmin: "" },
    { id: "cont",      label: "Contracting",                      short: "CONT",     group: "core",  status: "red", assignedAdmin: "" },
    { id: "admin",     label: "Administrative",                   short: "ADMIN",    group: "core",  status: "red", assignedAdmin: "" },
    { id: "abl",       label: "Receive, Locate, Inventory & W+V", short: "ABL",      group: "core",  status: "red", assignedAdmin: "" },
    { id: "otti_mf",   label: "Maiden Flight",                    short: "MF",       group: "otti",  status: "red", assignedAdmin: "" },
    { id: "otti_test", label: "Test",                              short: "TEST",     group: "otti",  status: "red", assignedAdmin: "" },
    { id: "otti_ttp",  label: "TTP",                              short: "TTP",      group: "otti",  status: "red", assignedAdmin: "" },
    { id: "otti_fg",   label: "FG/Check Ride",                    short: "FG/CR",    group: "otti",  status: "red", assignedAdmin: "" },
    { id: "otti_eval", label: "Evaluate",                         short: "EVAL",     group: "otti",  status: "red", assignedAdmin: "" },
    { id: "cuops",     label: "Current Operations",               short: "CUOPS",    group: "ops",   status: "red", assignedAdmin: "" },
    { id: "fuops",     label: "Future Operations",                short: "FUOPS",    group: "ops",   status: "red", assignedAdmin: "" },
    { id: "transcom",  label: "TRANSCOM Coordination",            short: "TRANSCOM", group: "ops",   status: "red", assignedAdmin: "" },
  ];
}

const DEFAULT_VENDOR_NAMES = [
  "AeroVironment", "Anduril Industries", "Raytheon / RTX", "Lockheed Martin",
  "L3Harris / Textron", "SAIC / Northrop Grumman", "SRC Inc.", "D-Fend Solutions",
  "Flex Force Enterprises", "Dedrone (Axon)", "Aevex Aerospace", "AFRL / Leidos",
  "Applied Physical Sciences (General Dynamics)",
];

function createDefaultVendors() {
  return DEFAULT_VENDOR_NAMES.map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name,
    processItems: createGateTemplate(),
    createdAt: new Date().toISOString(),
  }));
}

const DEFAULT_SUBGROUPS = [
  { id: "ops", name: "Operations" }, { id: "logistics", name: "Logistics" },
  { id: "intel", name: "Intelligence" }, { id: "comms", name: "Communications" },
  { id: "fires", name: "Fires" }, { id: "eng", name: "Engineering" },
  { id: "leadership", name: "Leadership" },
];

// ── Data Layer ──────────────────────────────────────────────────────────────

function loadData() {
  if (existsSync(DATA_FILE)) {
    try {
      const raw = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
      // Auto-migrate old flat format → per-vendor format
      if (raw.processItems && !raw.vendors) {
        raw.vendors = createDefaultVendors();
        delete raw.processItems;
        saveData(raw);
      }
      return raw;
    } catch {
      console.warn("[server] Corrupt data file, resetting.");
    }
  }
  const defaults = {
    vendors: createDefaultVendors(),
    admins: [],
    ideas: [],
    subgroups: DEFAULT_SUBGROUPS,
  };
  saveData(defaults);
  return defaults;
}

function saveData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function requirePin(req, res, next) {
  const pin = req.headers["x-admin-pin"] || req.body?.pin;
  if (pin !== ADMIN_PIN) return res.status(401).json({ error: "Invalid admin PIN." });
  next();
}

// ── Auth ────────────────────────────────────────────────────────────────────

app.post("/api/auth/verify", (req, res) => {
  res.json({ valid: req.body?.pin === ADMIN_PIN });
});

// ── Vendors ─────────────────────────────────────────────────────────────────

app.get("/api/vendors", (_req, res) => {
  const data = loadData();
  res.json({ vendors: data.vendors, admins: data.admins });
});

app.post("/api/vendors", requirePin, (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Vendor name required." });
  const data = loadData();
  const trimmed = name.trim();
  if (data.vendors.some((v) => v.name.toLowerCase() === trimmed.toLowerCase())) {
    return res.status(409).json({ error: "Vendor already exists." });
  }
  const vendor = {
    id: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36),
    name: trimmed,
    processItems: createGateTemplate(),
    createdAt: new Date().toISOString(),
  };
  data.vendors.push(vendor);
  saveData(data);
  res.status(201).json(vendor);
});

app.delete("/api/vendors/:vendorId", requirePin, (req, res) => {
  const data = loadData();
  const idx = data.vendors.findIndex((v) => v.id === req.params.vendorId);
  if (idx === -1) return res.status(404).json({ error: "Vendor not found." });
  data.vendors.splice(idx, 1);
  saveData(data);
  res.json({ ok: true });
});

// ── Per-Vendor Gates ────────────────────────────────────────────────────────

app.put("/api/vendors/:vendorId/gates/:gateId/status", requirePin, (req, res) => {
  const { status } = req.body;
  if (!["red", "yellow", "green"].includes(status)) {
    return res.status(400).json({ error: "Status must be red, yellow, or green." });
  }
  const data = loadData();
  const vendor = data.vendors.find((v) => v.id === req.params.vendorId);
  if (!vendor) return res.status(404).json({ error: "Vendor not found." });
  const gate = vendor.processItems.find((g) => g.id === req.params.gateId);
  if (!gate) return res.status(404).json({ error: "Gate not found." });
  gate.status = status;
  saveData(data);
  res.json(gate);
});

app.put("/api/vendors/:vendorId/gates/:gateId/admin", requirePin, (req, res) => {
  const data = loadData();
  const vendor = data.vendors.find((v) => v.id === req.params.vendorId);
  if (!vendor) return res.status(404).json({ error: "Vendor not found." });
  const gate = vendor.processItems.find((g) => g.id === req.params.gateId);
  if (!gate) return res.status(404).json({ error: "Gate not found." });
  gate.assignedAdmin = req.body.assignedAdmin || "";
  saveData(data);
  res.json(gate);
});

// ── Admins ──────────────────────────────────────────────────────────────────

app.post("/api/admins", requirePin, (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: "Name required." });
  const data = loadData();
  const admin = { id: randomUUID(), name: req.body.name, role: req.body.role || "Process Admin", createdAt: new Date().toISOString() };
  data.admins.push(admin);
  saveData(data);
  res.status(201).json(admin);
});

app.delete("/api/admins/:id", requirePin, (req, res) => {
  const data = loadData();
  data.admins = data.admins.filter((a) => a.id !== req.params.id);
  for (const vendor of data.vendors) {
    for (const gate of vendor.processItems) {
      if (gate.assignedAdmin === req.params.id) gate.assignedAdmin = "";
    }
  }
  saveData(data);
  res.json({ ok: true });
});

// ── Ideas ───────────────────────────────────────────────────────────────────

app.get("/api/ideas", (_req, res) => {
  const data = loadData();
  res.json({ ideas: data.ideas, subgroups: data.subgroups });
});

app.post("/api/ideas", (req, res) => {
  const { title, description, submitter, subgroupId, priority } = req.body;
  if (!title || !description || !submitter || !subgroupId) {
    return res.status(400).json({ error: "title, description, submitter, and subgroupId required." });
  }
  const data = loadData();
  const idea = { id: randomUUID(), title, description, submitter, subgroupId, priority: priority || "medium", status: "new", createdAt: new Date().toISOString(), comments: [] };
  data.ideas.unshift(idea);
  saveData(data);
  res.status(201).json(idea);
});

app.put("/api/ideas/:id/status", requirePin, (req, res) => {
  const allowed = ["new", "under_review", "approved", "in_progress", "completed", "declined"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: "Invalid status." });
  const data = loadData();
  const idea = data.ideas.find((i) => i.id === req.params.id);
  if (!idea) return res.status(404).json({ error: "Idea not found." });
  idea.status = req.body.status;
  saveData(data);
  res.json(idea);
});

app.post("/api/ideas/:id/comments", (req, res) => {
  if (!req.body.author || !req.body.text) return res.status(400).json({ error: "author and text required." });
  const data = loadData();
  const idea = data.ideas.find((i) => i.id === req.params.id);
  if (!idea) return res.status(404).json({ error: "Idea not found." });
  idea.comments.push({ id: randomUUID(), author: req.body.author, text: req.body.text, createdAt: new Date().toISOString() });
  saveData(data);
  res.json(idea);
});

// ── Static + SPA fallback ───────────────────────────────────────────────────

app.use(express.static(join(__dirname, "dist")));
app.get("*", (_req, res) => res.sendFile(join(__dirname, "dist", "index.html")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] sUAS Dashboard on port ${PORT}`);
  console.log(`[server] Admin PIN: ${ADMIN_PIN === "1234" ? "DEFAULT (1234) — set ADMIN_PIN env var" : "custom"}`);
});
