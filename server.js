// ── server.js ───────────────────────────────────────────────────────────────
// Express server: serves Vite-built static files and provides JSON API
// endpoints for process status management and idea intake.
//
// Data is stored in a JSON file on disk. Railway's filesystem persists
// during runtime but resets on redeploy. For production, swap to a
// database (Railway Postgres, SQLite, etc.).
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
const DATA_FILE = join(__dirname, "data.json");

app.use(express.json());

// ── Data Layer ──────────────────────────────────────────────────────────────

const DEFAULT_PROCESS_ITEMS = [
  { id: "ma",      label: "Mission Analysis",  short: "MA",      group: "core",  status: "red",    assignedAdmin: "" },
  { id: "rwg",     label: "Requirements Working Group", short: "RWG", group: "core", status: "red", assignedAdmin: "" },
  { id: "fm",      label: "Financial Management", short: "FM",    group: "core",  status: "red",    assignedAdmin: "" },
  { id: "cont",    label: "Contracting",        short: "CONT",   group: "core",  status: "red",    assignedAdmin: "" },
  { id: "admin",   label: "Administrative",     short: "ADMIN",  group: "core",  status: "red",    assignedAdmin: "" },
  { id: "abl",     label: "Receive, Locate, Inventory & W+V", short: "ABL", group: "core", status: "red", assignedAdmin: "" },
  { id: "otti_mf", label: "Maiden Flight",      short: "MF",     group: "otti",  status: "red",    assignedAdmin: "" },
  { id: "otti_test", label: "Test",             short: "TEST",   group: "otti",  status: "red",    assignedAdmin: "" },
  { id: "otti_ttp", label: "TTP",               short: "TTP",    group: "otti",  status: "red",    assignedAdmin: "" },
  { id: "otti_fg", label: "FG/Check Ride",      short: "FG/CR",  group: "otti",  status: "red",    assignedAdmin: "" },
  { id: "otti_eval", label: "Evaluate",         short: "EVAL",   group: "otti",  status: "red",    assignedAdmin: "" },
  { id: "cuops",   label: "Current Operations", short: "CUOPS",  group: "ops",   status: "red",    assignedAdmin: "" },
  { id: "fuops",   label: "Future Operations",  short: "FUOPS",  group: "ops",   status: "red",    assignedAdmin: "" },
  { id: "transcom", label: "TRANSCOM Coordination", short: "TRANSCOM", group: "ops", status: "red", assignedAdmin: "" },
];

const DEFAULT_SUBGROUPS = [
  { id: "ops",      name: "Operations" },
  { id: "logistics", name: "Logistics" },
  { id: "intel",    name: "Intelligence" },
  { id: "comms",    name: "Communications" },
  { id: "fires",    name: "Fires" },
  { id: "eng",      name: "Engineering" },
  { id: "leadership", name: "Leadership" },
];

function loadData() {
  if (existsSync(DATA_FILE)) {
    try {
      return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
    } catch {
      console.warn("[server] Corrupt data file, resetting to defaults.");
    }
  }
  const defaults = {
    processItems: DEFAULT_PROCESS_ITEMS,
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

// ── Auth Middleware ──────────────────────────────────────────────────────────

function requirePin(req, res, next) {
  const pin = req.headers["x-admin-pin"] || req.body?.pin;
  if (pin !== ADMIN_PIN) {
    return res.status(401).json({ error: "Invalid admin PIN." });
  }
  next();
}

// ── Process Status Endpoints ────────────────────────────────────────────────

app.get("/api/process", (_req, res) => {
  const data = loadData();
  res.json({ items: data.processItems, admins: data.admins });
});

app.put("/api/process/:id/status", requirePin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ["red", "yellow", "green"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Status must be red, yellow, or green." });
  }
  const data = loadData();
  const item = data.processItems.find((i) => i.id === id);
  if (!item) return res.status(404).json({ error: "Item not found." });
  item.status = status;
  saveData(data);
  res.json(item);
});

app.put("/api/process/:id/admin", requirePin, (req, res) => {
  const { id } = req.params;
  const { assignedAdmin } = req.body;
  const data = loadData();
  const item = data.processItems.find((i) => i.id === id);
  if (!item) return res.status(404).json({ error: "Item not found." });
  item.assignedAdmin = assignedAdmin || "";
  saveData(data);
  res.json(item);
});

// Bulk update all items at once
app.put("/api/process/bulk", requirePin, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Items must be an array." });
  }
  const data = loadData();
  for (const update of items) {
    const existing = data.processItems.find((i) => i.id === update.id);
    if (existing) {
      if (update.status) existing.status = update.status;
      if (update.assignedAdmin !== undefined) existing.assignedAdmin = update.assignedAdmin;
    }
  }
  saveData(data);
  res.json({ items: data.processItems });
});

// ── Admin Management ────────────────────────────────────────────────────────

app.post("/api/admins", requirePin, (req, res) => {
  const { name, role } = req.body;
  if (!name) return res.status(400).json({ error: "Name required." });
  const data = loadData();
  const admin = { id: randomUUID(), name, role: role || "Process Admin", createdAt: new Date().toISOString() };
  data.admins.push(admin);
  saveData(data);
  res.status(201).json(admin);
});

app.delete("/api/admins/:id", requirePin, (req, res) => {
  const data = loadData();
  data.admins = data.admins.filter((a) => a.id !== req.params.id);
  // Clear assignments for removed admin
  for (const item of data.processItems) {
    if (item.assignedAdmin === req.params.id) item.assignedAdmin = "";
  }
  saveData(data);
  res.json({ ok: true });
});

// ── Verify PIN ──────────────────────────────────────────────────────────────

app.post("/api/auth/verify", (req, res) => {
  const pin = req.body?.pin;
  if (pin === ADMIN_PIN) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

// ── Ideas Endpoints ─────────────────────────────────────────────────────────

app.get("/api/ideas", (_req, res) => {
  const data = loadData();
  res.json({ ideas: data.ideas, subgroups: data.subgroups });
});

app.post("/api/ideas", (req, res) => {
  const { title, description, submitter, subgroupId, priority } = req.body;
  if (!title || !description || !submitter || !subgroupId) {
    return res.status(400).json({ error: "title, description, submitter, and subgroupId are required." });
  }
  const data = loadData();
  const idea = {
    id: randomUUID(),
    title,
    description,
    submitter,
    subgroupId,
    priority: priority || "medium",
    status: "new",
    createdAt: new Date().toISOString(),
    comments: [],
  };
  data.ideas.unshift(idea);
  saveData(data);
  res.status(201).json(idea);
});

app.put("/api/ideas/:id/status", requirePin, (req, res) => {
  const { status } = req.body;
  const allowed = ["new", "under_review", "approved", "in_progress", "completed", "declined"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(", ")}` });
  }
  const data = loadData();
  const idea = data.ideas.find((i) => i.id === req.params.id);
  if (!idea) return res.status(404).json({ error: "Idea not found." });
  idea.status = status;
  saveData(data);
  res.json(idea);
});

app.post("/api/ideas/:id/comments", (req, res) => {
  const { author, text } = req.body;
  if (!author || !text) return res.status(400).json({ error: "author and text required." });
  const data = loadData();
  const idea = data.ideas.find((i) => i.id === req.params.id);
  if (!idea) return res.status(404).json({ error: "Idea not found." });
  idea.comments.push({ id: randomUUID(), author, text, createdAt: new Date().toISOString() });
  saveData(data);
  res.json(idea);
});

// ── Static Files (Vite build output) ────────────────────────────────────────

app.use(express.static(join(__dirname, "dist")));
app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

// ── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] sUAS Dashboard running on port ${PORT}`);
});
