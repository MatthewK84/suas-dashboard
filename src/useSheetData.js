import { useState, useEffect, useCallback, useRef } from "react";
import Papa from "papaparse";

const VALID_STATUSES = new Set(["PASS", "FAIL", "PENDING", "WAIVER"]);
const VALID_CATEGORIES = new Set(["OFFENSIVE", "DEFENSIVE", "DUAL-USE"]);
const COMPLIANCE_COLUMNS = ["funded","dowContract","blueSuasNdaa","jagReview","muaTechAssess","warfighterCapability","centcomReady"];

function normalizeStatus(raw) {
  if (typeof raw !== "string") return "PENDING";
  const c = raw.trim().toUpperCase();
  return VALID_STATUSES.has(c) ? c : "PENDING";
}
function normalizeCategory(raw) {
  if (typeof raw !== "string") return "OFFENSIVE";
  const c = raw.trim().toUpperCase();
  if (VALID_CATEGORIES.has(c)) return c;
  if (c === "DUAL" || c === "DUALUSE" || c === "DUAL_USE") return "DUAL-USE";
  return "OFFENSIVE";
}
function safeInt(raw, fb) {
  if (raw == null || raw === "") return fb;
  const p = parseInt(String(raw).replace(/[$,\s]/g, ""), 10);
  return Number.isNaN(p) ? fb : p;
}
function rowToPlatform(row, idx) {
  const id = (row.id || "").trim();
  const name = (row.name || "").trim();
  if (!id && !name) return null;
  const compliance = {};
  for (const col of COMPLIANCE_COLUMNS) compliance[col] = normalizeStatus(row[col]);
  return {
    id: id || `AUTO-${String(idx+1).padStart(3,"0")}`,
    name: name || "Unnamed Platform",
    manufacturer: (row.manufacturer || "Unknown").trim(),
    category: normalizeCategory(row.category),
    subcategory: (row.subcategory || "Unspecified").trim(),
    description: (row.description || "").trim(),
    trl: Math.max(1, Math.min(9, safeInt(row.trl, 5))),
    unitCost: safeInt(row.unitCost, 0),
    qty: safeInt(row.qty, 0),
    compliance,
    notes: (row.notes || "").trim(),
  };
}
function buildCsvUrl(input, gid) {
  if (typeof input !== "string" || !input.trim()) return "";
  const m = input.trim().match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  const sheetId = m ? m[1] : input.trim();
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid || "0"}`;
}

export function useSheetData({ sheetUrl = "", gid = "0", refreshMs = 300000, fallbackData = [] } = {}) {
  const [platforms, setPlatforms] = useState(fallbackData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [source, setSource] = useState(sheetUrl ? "sheet" : "fallback");
  const intervalRef = useRef(null);
  const csvUrl = buildCsvUrl(sheetUrl, gid);

  const fetchAndParse = useCallback(async () => {
    if (!csvUrl) { setPlatforms(fallbackData); setSource("fallback"); setError(null); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csv = await res.text();
      const result = Papa.parse(csv, { header: true, skipEmptyLines: "greedy", transformHeader: h => h.trim() });
      const parsed = result.data.map((r, i) => rowToPlatform(r, i)).filter(Boolean);
      if (!parsed.length) throw new Error("0 valid rows");
      setPlatforms(parsed); setSource("sheet"); setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      if (!platforms.length) { setPlatforms(fallbackData); setSource("fallback"); }
    } finally { setLoading(false); }
  }, [csvUrl, fallbackData]);

  useEffect(() => { fetchAndParse(); }, [fetchAndParse]);
  useEffect(() => {
    if (!csvUrl || refreshMs <= 0) return;
    intervalRef.current = setInterval(fetchAndParse, refreshMs);
    return () => clearInterval(intervalRef.current);
  }, [fetchAndParse, csvUrl, refreshMs]);

  return { platforms, loading, error, lastUpdated, source, refresh: fetchAndParse };
}
