import { useState, useMemo, useCallback } from "react";
import { useSheetData } from "./useSheetData.js";
import {
  CRITERIA_KEYS,
  STATUS,
  CATEGORIES,
  SAMPLE_PLATFORMS,
} from "./sampleData.js";

// ── Configuration ───────────────────────────────────────────────────────────
const SHEET_URL = import.meta.env.VITE_SHEET_URL || "";
const SHEET_GID = import.meta.env.VITE_SHEET_GID || "0";
const REFRESH_MS = parseInt(import.meta.env.VITE_REFRESH_MS || "300000", 10);

// ── Utility Functions ───────────────────────────────────────────────────────
function getComplianceScore(platform) {
  const vals = Object.values(platform.compliance);
  return vals.filter((v) => v === STATUS.PASS || v === STATUS.WAIVER).length;
}

function isFullyCompliant(platform) {
  return getComplianceScore(platform) === 7;
}

function formatCurrency(val) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val}`;
}

function formatTimestamp(date) {
  if (!date) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}

// ── Shared Styles ───────────────────────────────────────────────────────────
const FONTS = {
  header: "'Oswald', 'Bebas Neue', 'Impact', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  body: "'IBM Plex Sans', 'Segoe UI', sans-serif",
};

// ── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    PASS: { bg: "#0d3320", border: "#16a34a", text: "#4ade80", label: "PASS" },
    FAIL: { bg: "#3b1318", border: "#dc2626", text: "#f87171", label: "FAIL" },
    PENDING: { bg: "#3b2e10", border: "#ca8a04", text: "#facc15", label: "PEND" },
    WAIVER: { bg: "#1e2a3b", border: "#3b82f6", text: "#60a5fa", label: "WVRD" },
  };
  const c = config[status] || config.PENDING;
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", fontSize: "10px", fontWeight: 700,
      fontFamily: FONTS.mono, letterSpacing: "0.08em", background: c.bg,
      border: `1px solid ${c.border}`, color: c.text, borderRadius: "3px", textTransform: "uppercase",
    }}>
      {c.label}
    </span>
  );
}

// ── Category Tag ────────────────────────────────────────────────────────────
function CategoryTag({ category }) {
  const config = {
    OFFENSIVE: { bg: "#3b1318", border: "#b91c1c", text: "#fca5a5", icon: "⬆" },
    DEFENSIVE: { bg: "#0c2d1e", border: "#15803d", text: "#86efac", icon: "⬇" },
    "DUAL-USE": { bg: "#2d2310", border: "#a16207", text: "#fde68a", icon: "⬍" },
  };
  const c = config[category] || config.OFFENSIVE;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px",
      fontSize: "10px", fontWeight: 800, fontFamily: FONTS.mono, letterSpacing: "0.12em",
      background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: "3px",
    }}>
      <span style={{ fontSize: "12px" }}>{c.icon}</span>
      {category}
    </span>
  );
}

// ── Compliance Bar ──────────────────────────────────────────────────────────
function ComplianceBar({ score }) {
  const pct = (score / 7) * 100;
  const color = score === 7 ? "#16a34a" : score >= 5 ? "#ca8a04" : "#dc2626";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{
        width: "80px", height: "6px", background: "#1a1f2e", borderRadius: "3px",
        overflow: "hidden", border: "1px solid #2a3040",
      }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "3px", transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontFamily: FONTS.mono, fontSize: "11px", fontWeight: 700, color }}>{score}/7</span>
    </div>
  );
}

// ── TRL Indicator ───────────────────────────────────────────────────────────
function TRLIndicator({ trl }) {
  const color = trl >= 9 ? "#16a34a" : trl >= 7 ? "#ca8a04" : "#dc2626";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {[...Array(9)].map((_, i) => (
        <div key={i} style={{
          width: "5px", height: i < trl ? "14px" : "6px",
          background: i < trl ? color : "#1a1f2e",
          border: `1px solid ${i < trl ? color : "#2a3040"}`,
          borderRadius: "1px", transition: "all 0.3s ease", opacity: i < trl ? 1 : 0.3,
        }} />
      ))}
      <span style={{ marginLeft: "4px", fontFamily: FONTS.mono, fontSize: "10px", fontWeight: 700, color }}>
        TRL-{trl}
      </span>
    </div>
  );
}

// ── Data Source Indicator ────────────────────────────────────────────────────
function DataSourceBar({ source, loading, error, lastUpdated, onRefresh }) {
  const sourceColor = source === "sheet" ? "#16a34a" : "#ca8a04";
  const sourceLabel = source === "sheet" ? "GOOGLE SHEETS — LIVE" : "SAMPLE DATA — FALLBACK";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap",
      gap: "10px", padding: "10px 20px", background: "#0d1117",
      border: `1px solid ${error ? "#dc2626" : "#21262d"}`, borderRadius: "6px", marginBottom: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: loading ? "#facc15" : sourceColor,
          boxShadow: `0 0 6px ${loading ? "#facc15" : sourceColor}`,
          animation: loading ? "pulse 0.8s infinite" : "none",
        }} />
        <span style={{ fontFamily: FONTS.mono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: sourceColor }}>
          {loading ? "FETCHING..." : sourceLabel}
        </span>
        {lastUpdated && (
          <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#4b5563" }}>
            LAST SYNC: {formatTimestamp(lastUpdated)}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {error && (
          <span style={{
            fontFamily: FONTS.mono, fontSize: "10px", color: "#f87171",
            maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            ERR: {error}
          </span>
        )}
        {source === "sheet" && (
          <button onClick={onRefresh} disabled={loading} style={{
            padding: "4px 12px", fontSize: "10px", fontWeight: 700, fontFamily: FONTS.mono,
            letterSpacing: "0.1em", border: "1px solid #30363d", background: "#161b22",
            color: loading ? "#4b5563" : "#9ca3af", borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            ↻ REFRESH
          </button>
        )}
        {source === "fallback" && (
          <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#6b7280" }}>
            SET VITE_SHEET_URL TO CONNECT
          </span>
        )}
      </div>
    </div>
  );
}

// ── Platform Detail Panel ───────────────────────────────────────────────────
function PlatformDetail({ platform, onClose }) {
  if (!platform) return null;
  const score = getComplianceScore(platform);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#0d1117", border: "1px solid #30363d", borderRadius: "8px",
        maxWidth: "720px", width: "100%", maxHeight: "85vh", overflowY: "auto",
        padding: "32px", boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: "12px", color: "#6b7280" }}>{platform.id}</span>
              <CategoryTag category={platform.category} />
            </div>
            <h2 style={{
              fontFamily: FONTS.header, fontSize: "28px", fontWeight: 700, color: "#e5e7eb",
              letterSpacing: "0.02em", margin: 0,
            }}>
              {platform.name}
            </h2>
            <p style={{ fontFamily: FONTS.mono, fontSize: "12px", color: "#9ca3af", margin: "4px 0 0 0" }}>
              {platform.manufacturer} — {platform.subcategory}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid #30363d", color: "#9ca3af",
            cursor: "pointer", fontSize: "18px", padding: "4px 10px", borderRadius: "4px", fontFamily: "monospace",
          }}>✕</button>
        </div>

        <p style={{ fontFamily: FONTS.body, fontSize: "14px", color: "#d1d5db", lineHeight: 1.6, margin: "0 0 24px 0" }}>
          {platform.description}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "TRL", value: platform.trl },
            { label: "UNIT COST", value: formatCurrency(platform.unitCost) },
            { label: "QTY ON CONTRACT", value: platform.qty.toLocaleString() },
            { label: "COMPLIANCE", value: `${score}/7` },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#161b22", border: "1px solid #21262d", borderRadius: "6px", padding: "14px", textAlign: "center",
            }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: "9px", color: "#6b7280", letterSpacing: "0.15em", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontFamily: FONTS.header, fontSize: "22px", fontWeight: 700, color: "#e5e7eb" }}>{s.value}</div>
            </div>
          ))}
        </div>

        <h3 style={{
          fontFamily: FONTS.mono, fontSize: "11px", fontWeight: 700, color: "#6b7280",
          letterSpacing: "0.15em", margin: "0 0 12px 0", textTransform: "uppercase",
        }}>Compliance Gate Assessment</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px" }}>
          {CRITERIA_KEYS.map((crit) => (
            <div key={crit.key} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 14px", background: "#161b22", border: "1px solid #21262d", borderRadius: "4px",
            }}>
              <span style={{ fontFamily: FONTS.body, fontSize: "13px", color: "#d1d5db" }}>{crit.label}</span>
              <StatusBadge status={platform.compliance[crit.key]} />
            </div>
          ))}
        </div>

        {platform.notes && (
          <div style={{
            padding: "14px 18px", background: "#161b22", border: "1px solid #21262d",
            borderLeft: "3px solid #3b82f6", borderRadius: "4px", fontFamily: FONTS.body,
            fontSize: "13px", color: "#9ca3af", lineHeight: 1.5,
          }}>
            <strong style={{ color: "#60a5fa", fontFamily: FONTS.mono, fontSize: "10px", letterSpacing: "0.1em" }}>REMARKS: </strong>
            {platform.notes}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function SUASDashboard() {
  const { platforms, loading, error, lastUpdated, source, refresh } = useSheetData({
    sheetUrl: SHEET_URL,
    gid: SHEET_GID,
    refreshMs: REFRESH_MS,
    fallbackData: SAMPLE_PLATFORMS,
  });

  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterCompliance, setFilterCompliance] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [sortBy, setSortBy] = useState("compliance");

  const filtered = useMemo(() => {
    let data = [...platforms];
    if (filterCategory !== "ALL") data = data.filter((p) => p.category === filterCategory);
    if (filterCompliance === "FULL") data = data.filter((p) => isFullyCompliant(p));
    if (filterCompliance === "PARTIAL") data = data.filter((p) => !isFullyCompliant(p) && getComplianceScore(p) >= 5);
    if (filterCompliance === "GATED") data = data.filter((p) => getComplianceScore(p) < 5);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((p) =>
        p.name.toLowerCase().includes(term) ||
        p.manufacturer.toLowerCase().includes(term) ||
        p.subcategory.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term)
      );
    }
    if (sortBy === "compliance") data.sort((a, b) => getComplianceScore(b) - getComplianceScore(a));
    else if (sortBy === "trl") data.sort((a, b) => b.trl - a.trl);
    else if (sortBy === "cost") data.sort((a, b) => a.unitCost - b.unitCost);
    else if (sortBy === "name") data.sort((a, b) => a.name.localeCompare(b.name));
    return data;
  }, [platforms, filterCategory, filterCompliance, searchTerm, sortBy]);

  const stats = useMemo(() => {
    const total = platforms.length;
    const compliant = platforms.filter(isFullyCompliant).length;
    const offensive = platforms.filter((p) => p.category === CATEGORIES.OFFENSIVE).length;
    const defensive = platforms.filter((p) => p.category === CATEGORIES.DEFENSIVE).length;
    const dualUse = platforms.filter((p) => p.category === CATEGORIES.DUAL_USE).length;
    const pending = platforms.filter((p) => Object.values(p.compliance).some((v) => v === STATUS.PENDING)).length;
    const totalValue = platforms.reduce((s, p) => s + p.unitCost * p.qty, 0);
    return { total, compliant, offensive, defensive, dualUse, pending, totalValue };
  }, [platforms]);

  const btnStyle = useCallback((active) => ({
    padding: "6px 14px", fontSize: "10px", fontWeight: 700, fontFamily: FONTS.mono,
    letterSpacing: "0.1em", border: active ? "1px solid #60a5fa" : "1px solid #30363d",
    background: active ? "#1e3a5f" : "#161b22", color: active ? "#93c5fd" : "#6b7280",
    borderRadius: "4px", cursor: "pointer", transition: "all 0.2s ease", textTransform: "uppercase",
  }), []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e14", color: "#e5e7eb", fontFamily: FONTS.body, padding: 0 }}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* ═══ HEADER ═══ */}
      <div style={{ background: "linear-gradient(180deg, #0d1117 0%, #0a0e14 100%)", borderBottom: "1px solid #21262d", padding: "20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 8px #16a34a", animation: "pulse 2s infinite" }} />
              <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#4ade80", letterSpacing: "0.2em", fontWeight: 700 }}>
                CLASSIFICATION: CUI // UNCLASSIFIED — FOUO
              </span>
            </div>
            <h1 style={{ fontFamily: FONTS.header, fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 700, color: "#f3f4f6", letterSpacing: "0.05em", margin: 0, lineHeight: 1.1 }}>
              sUAS CAPABILITY READINESS DASHBOARD
            </h1>
            <p style={{ fontFamily: FONTS.mono, fontSize: "11px", color: "#6b7280", margin: "6px 0 0 0", letterSpacing: "0.05em" }}>
              USCENTCOM AOR — FIELDING & COMPLIANCE STATUS TRACKER
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#6b7280", letterSpacing: "0.1em" }}>PORTFOLIO VALUE</div>
            <div style={{ fontFamily: FONTS.header, fontSize: "28px", fontWeight: 700, color: "#60a5fa" }}>
              ${(stats.totalValue / 1e9).toFixed(2)}B
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {/* ═══ DATA SOURCE BAR ═══ */}
        <DataSourceBar source={source} loading={loading} error={error} lastUpdated={lastUpdated} onRefresh={refresh} />

        {/* ═══ KPI STRIP ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "TOTAL SYSTEMS", value: stats.total, color: "#e5e7eb" },
            { label: "FULLY COMPLIANT", value: stats.compliant, color: "#4ade80" },
            { label: "OFFENSIVE", value: stats.offensive, color: "#f87171" },
            { label: "DEFENSIVE", value: stats.defensive, color: "#86efac" },
            { label: "DUAL-USE", value: stats.dualUse, color: "#fde68a" },
            { label: "PENDING GATES", value: stats.pending, color: "#facc15" },
          ].map((kpi) => (
            <div key={kpi.label} style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: "6px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: "9px", color: "#6b7280", letterSpacing: "0.15em", marginBottom: "6px" }}>{kpi.label}</div>
              <div style={{ fontFamily: FONTS.header, fontSize: "32px", fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* ═══ COMPLIANCE GATE SUMMARY BAR ═══ */}
        <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: "6px", padding: "16px 20px", marginBottom: "24px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
          {CRITERIA_KEYS.map((crit) => {
            const passCount = platforms.filter((p) => p.compliance[crit.key] === STATUS.PASS || p.compliance[crit.key] === STATUS.WAIVER).length;
            const pct = platforms.length > 0 ? Math.round((passCount / platforms.length) * 100) : 0;
            const color = pct === 100 ? "#16a34a" : pct >= 80 ? "#ca8a04" : "#dc2626";
            return (
              <div key={crit.key} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: "9px", color: "#6b7280", letterSpacing: "0.1em", marginBottom: "6px" }}>{crit.short}</div>
                <div style={{ fontFamily: FONTS.header, fontSize: "22px", fontWeight: 700, color }}>{pct}%</div>
                <div style={{ height: "4px", background: "#1a1f2e", borderRadius: "2px", marginTop: "6px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "2px", transition: "width 0.6s ease" }} />
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "9px", color: "#4b5563", marginTop: "4px" }}>{passCount}/{platforms.length}</div>
              </div>
            );
          })}
        </div>

        {/* ═══ FILTERS ═══ */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "20px", padding: "16px 20px", background: "#0d1117", border: "1px solid #21262d", borderRadius: "6px" }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#6b7280", letterSpacing: "0.12em" }}>CATEGORY</span>
          {["ALL", "OFFENSIVE", "DEFENSIVE", "DUAL-USE"].map((cat) => (
            <button key={cat} style={btnStyle(filterCategory === cat)} onClick={() => setFilterCategory(cat)}>{cat}</button>
          ))}
          <span style={{ width: "1px", height: "20px", background: "#30363d", margin: "0 4px" }} />
          <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#6b7280", letterSpacing: "0.12em" }}>COMPLIANCE</span>
          {[
            { val: "ALL", label: "ALL" },
            { val: "FULL", label: "7/7 PASS" },
            { val: "PARTIAL", label: "≥5 PASS" },
            { val: "GATED", label: "GATED" },
          ].map((f) => (
            <button key={f.val} style={btnStyle(filterCompliance === f.val)} onClick={() => setFilterCompliance(f.val)}>{f.label}</button>
          ))}
          <span style={{ width: "1px", height: "20px", background: "#30363d", margin: "0 4px" }} />
          <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#6b7280", letterSpacing: "0.12em" }}>SORT</span>
          {[
            { val: "compliance", label: "COMPLIANCE" },
            { val: "trl", label: "TRL" },
            { val: "cost", label: "COST" },
            { val: "name", label: "NAME" },
          ].map((s) => (
            <button key={s.val} style={btnStyle(sortBy === s.val)} onClick={() => setSortBy(s.val)}>{s.label}</button>
          ))}
          <div style={{ marginLeft: "auto" }}>
            <input type="text" placeholder="SEARCH PLATFORMS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "4px", padding: "7px 14px", fontFamily: FONTS.mono, fontSize: "11px", color: "#e5e7eb", outline: "none", width: "200px", letterSpacing: "0.05em" }}
            />
          </div>
        </div>

        {/* ═══ PLATFORM TABLE ═══ */}
        <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 2fr 1.5fr 100px 90px 1fr 80px", gap: "8px", padding: "12px 20px", background: "#161b22", borderBottom: "1px solid #21262d", alignItems: "center" }}>
            {["SYS-ID", "PLATFORM", "MANUFACTURER", "CATEGORY", "TRL", "COMPLIANCE", "COST"].map((h) => (
              <div key={h} style={{ fontFamily: FONTS.mono, fontSize: "9px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {filtered.map((platform, idx) => (
            <div key={platform.id} onClick={() => setSelectedPlatform(platform)}
              style={{
                display: "grid", gridTemplateColumns: "80px 2fr 1.5fr 100px 90px 1fr 80px",
                gap: "8px", padding: "14px 20px", borderBottom: "1px solid #21262d",
                cursor: "pointer", transition: "background 0.15s ease", alignItems: "center",
                background: idx % 2 === 0 ? "transparent" : "rgba(22,27,34,0.4)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1c2333")}
              onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "rgba(22,27,34,0.4)")}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: "11px", color: "#6b7280" }}>{platform.id}</div>
              <div>
                <div style={{ fontFamily: FONTS.header, fontSize: "15px", fontWeight: 600, color: "#f3f4f6", letterSpacing: "0.02em" }}>{platform.name}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#4b5563", marginTop: "2px" }}>{platform.subcategory}</div>
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: "12px", color: "#9ca3af" }}>{platform.manufacturer}</div>
              <CategoryTag category={platform.category} />
              <TRLIndicator trl={platform.trl} />
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ComplianceBar score={getComplianceScore(platform)} />
                <div style={{ display: "flex", gap: "3px" }}>
                  {CRITERIA_KEYS.map((crit) => (
                    <div key={crit.key} title={`${crit.label}: ${platform.compliance[crit.key]}`}
                      style={{
                        width: "8px", height: "8px", borderRadius: "2px",
                        background: platform.compliance[crit.key] === STATUS.PASS ? "#16a34a"
                          : platform.compliance[crit.key] === STATUS.WAIVER ? "#3b82f6"
                          : platform.compliance[crit.key] === STATUS.PENDING ? "#ca8a04" : "#dc2626",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: "12px", color: "#9ca3af", fontWeight: 600 }}>{formatCurrency(platform.unitCost)}</div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: FONTS.mono, fontSize: "12px", color: "#4b5563" }}>
              NO PLATFORMS MATCH CURRENT FILTER CRITERIA
            </div>
          )}
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{ marginTop: "20px", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #21262d" }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#4b5563", letterSpacing: "0.1em" }}>
            DISPLAYING {filtered.length} OF {platforms.length} SYSTEMS
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#4b5563", letterSpacing: "0.1em" }}>
            AFCENT CTDO // sUAS CAPABILITY TRACKER // CLICK ROW FOR DETAIL
          </span>
        </div>
      </div>

      {selectedPlatform && <PlatformDetail platform={selectedPlatform} onClose={() => setSelectedPlatform(null)} />}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0e14; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #484f58; }
      `}</style>
    </div>
  );
}
