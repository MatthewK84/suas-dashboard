// ── useSheetData.js ─────────────────────────────────────────────────────────
// Fetches a published Google Sheets CSV and transforms each row into the
// platform data structure the dashboard expects.
//
// GOOGLE SHEET COLUMN CONTRACT (Row 1 = headers, exact names below):
//   A: id              → e.g. "SYS-025"
//   B: name            → e.g. "Switchblade 600"
//   C: manufacturer    → e.g. "AeroVironment"
//   D: category        → OFFENSIVE | DEFENSIVE | DUAL-USE
//   E: subcategory     → e.g. "Loitering Munition"
//   F: description     → free text
//   G: trl             → integer 1-9
//   H: unitCost        → integer (no $ or commas)
//   I: qty             → integer
//   J: funded          → PASS | FAIL | PENDING | WAIVER
//   K: dowContract     → PASS | FAIL | PENDING | WAIVER
//   L: blueSuasNdaa    → PASS | FAIL | PENDING | WAIVER
//   M: jagReview       → PASS | FAIL | PENDING | WAIVER
//   N: muaTechAssess   → PASS | FAIL | PENDING | WAIVER
//   O: warfighterCapability → PASS | FAIL | PENDING | WAIVER
//   P: centcomReady    → PASS | FAIL | PENDING | WAIVER
//   Q: notes           → free text (optional)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import Papa from "papaparse";

const VALID_STATUSES = new Set(["PASS", "FAIL", "PENDING", "WAIVER"]);
const VALID_CATEGORIES = new Set(["OFFENSIVE", "DEFENSIVE", "DUAL-USE"]);

const COMPLIANCE_COLUMNS = [
  "funded",
  "dowContract",
  "blueSuasNdaa",
  "jagReview",
  "muaTechAssess",
  "warfighterCapability",
  "centcomReady",
];

/**
 * Normalizes a single compliance cell value to a known status string.
 * Treats blank or unrecognized values as "PENDING" to surface visibility.
 */
function normalizeStatus(raw) {
  if (typeof raw !== "string") return "PENDING";
  const cleaned = raw.trim().toUpperCase();
  if (VALID_STATUSES.has(cleaned)) return cleaned;
  return "PENDING";
}

/**
 * Normalizes category string to a known category.
 * Defaults to "OFFENSIVE" if unrecognized — surfaces clearly in UI.
 */
function normalizeCategory(raw) {
  if (typeof raw !== "string") return "OFFENSIVE";
  const cleaned = raw.trim().toUpperCase();
  if (VALID_CATEGORIES.has(cleaned)) return cleaned;
  if (cleaned === "DUAL" || cleaned === "DUALUSE" || cleaned === "DUAL_USE") return "DUAL-USE";
  return "OFFENSIVE";
}

/**
 * Safely parses an integer, returning the fallback on failure.
 */
function safeInt(raw, fallback) {
  if (raw === null || raw === undefined || raw === "") return fallback;
  const cleaned = String(raw).replace(/[$,\s]/g, "");
  const parsed = parseInt(cleaned, 10);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

/**
 * Transforms one parsed CSV row object into a platform record.
 * Returns null if the row is missing required fields (id + name).
 */
function rowToPlatform(row, index) {
  const id = (row.id || "").trim();
  const name = (row.name || "").trim();

  if (id === "" && name === "") return null;

  const effectiveId = id || `AUTO-${String(index + 1).padStart(3, "0")}`;

  const compliance = {};
  for (const col of COMPLIANCE_COLUMNS) {
    compliance[col] = normalizeStatus(row[col]);
  }

  return {
    id: effectiveId,
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

/**
 * Converts a standard Google Sheets share/edit URL to the published CSV
 * export URL.  Accepts URLs in these forms:
 *   - https://docs.google.com/spreadsheets/d/SHEET_ID/edit...
 *   - https://docs.google.com/spreadsheets/d/SHEET_ID/pub...
 *   - Just a raw sheet ID string
 *
 * Optionally targets a specific GID (tab) via the second argument.
 */
function buildCsvUrl(input, gid) {
  if (typeof input !== "string" || input.trim() === "") return "";

  const trimmed = input.trim();
  const effectiveGid = gid || "0";

  // Extract sheet ID from full URL
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  const sheetId = urlMatch ? urlMatch[1] : trimmed;

  return (
    `https://docs.google.com/spreadsheets/d/${sheetId}` +
    `/gviz/tq?tqx=out:csv&gid=${effectiveGid}`
  );
}

/**
 * useSheetData — Custom React hook.
 *
 * Params:
 *   sheetUrl       – Google Sheets URL or sheet ID (empty = use fallback)
 *   gid            – Tab/GID within the sheet (default "0")
 *   refreshMs      – Auto-refresh interval in ms (default 300000 = 5 min)
 *   fallbackData   – Array of platform objects used when no URL is set
 *
 * Returns:
 *   { platforms, loading, error, lastUpdated, refresh, source }
 */
export function useSheetData({
  sheetUrl = "",
  gid = "0",
  refreshMs = 300000,
  fallbackData = [],
} = {}) {
  const [platforms, setPlatforms] = useState(fallbackData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [source, setSource] = useState(sheetUrl ? "sheet" : "fallback");
  const intervalRef = useRef(null);

  const csvUrl = buildCsvUrl(sheetUrl, gid);

  const fetchAndParse = useCallback(async () => {
    if (csvUrl === "") {
      setPlatforms(fallbackData);
      setSource("fallback");
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(csvUrl);

      if (!response.ok) {
        throw new Error(
          `Sheet fetch failed: HTTP ${response.status} — verify the sheet is published.`
        );
      }

      const csvText = await response.text();

      const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (h) => h.trim(),
      });

      if (parseResult.errors.length > 0) {
        const firstError = parseResult.errors[0];
        console.warn("[useSheetData] CSV parse warnings:", parseResult.errors);
        if (parseResult.data.length === 0) {
          throw new Error(`CSV parse error: ${firstError.message}`);
        }
      }

      const parsed = [];
      for (let i = 0; i < parseResult.data.length; i++) {
        const platform = rowToPlatform(parseResult.data[i], i);
        if (platform !== null) {
          parsed.push(platform);
        }
      }

      if (parsed.length === 0) {
        throw new Error(
          "Sheet returned 0 valid rows. Check column headers match the expected schema."
        );
      }

      setPlatforms(parsed);
      setSource("sheet");
      setLastUpdated(new Date());
    } catch (err) {
      console.error("[useSheetData] Fetch error:", err);
      setError(err.message);
      // Keep existing data on refresh failure (only clear on first load)
      if (platforms.length === 0) {
        setPlatforms(fallbackData);
        setSource("fallback");
      }
    } finally {
      setLoading(false);
    }
  }, [csvUrl, fallbackData]);

  // Initial fetch
  useEffect(() => {
    fetchAndParse();
  }, [fetchAndParse]);

  // Auto-refresh interval
  useEffect(() => {
    if (csvUrl === "" || refreshMs <= 0) return;
    intervalRef.current = setInterval(fetchAndParse, refreshMs);
    return () => clearInterval(intervalRef.current);
  }, [fetchAndParse, csvUrl, refreshMs]);

  return {
    platforms,
    loading,
    error,
    lastUpdated,
    source,
    refresh: fetchAndParse,
  };
}
