import { useState, useEffect, useCallback } from "react";

const FONTS = {
  header: "'Oswald', 'Bebas Neue', 'Impact', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  body: "'IBM Plex Sans', 'Segoe UI', sans-serif",
};

const STATUS_COLORS = {
  red:    { bg: "#3b1318", border: "#dc2626", glow: "#dc2626", fill: "#ef4444", label: "NOT STARTED" },
  yellow: { bg: "#3b2e10", border: "#ca8a04", glow: "#ca8a04", fill: "#facc15", label: "IN PROGRESS" },
  green:  { bg: "#0d3320", border: "#16a34a", glow: "#16a34a", fill: "#4ade80", label: "COMPLETE" },
};

const CYCLE_ORDER = ["red", "yellow", "green"];

const API_BASE = "";

// ── Status Indicator ────────────────────────────────────────────────────────
function StatusLight({ status, size = 40, clickable = false, onClick }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.red;
  return (
    <div
      onClick={clickable ? onClick : undefined}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${c.fill}dd, ${c.fill}88 60%, ${c.fill}44)`,
        border: `2px solid ${c.border}`,
        boxShadow: `0 0 ${size / 3}px ${c.glow}60, inset 0 -2px 4px rgba(0,0,0,0.3)`,
        cursor: clickable ? "pointer" : "default",
        transition: "all 0.25s ease",
        transform: clickable ? "scale(1)" : "none",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { if (clickable) e.currentTarget.style.transform = "scale(1.15)"; }}
      onMouseLeave={(e) => { if (clickable) e.currentTarget.style.transform = "scale(1)"; }}
      title={clickable ? "Click to cycle status" : c.label}
    />
  );
}

// ── Process Item Card ───────────────────────────────────────────────────────
function ProcessCard({ item, isAdmin, admins, onStatusChange, onAdminAssign }) {
  const c = STATUS_COLORS[item.status] || STATUS_COLORS.red;
  const assignedAdmin = admins.find((a) => a.id === item.assignedAdmin);

  function handleCycle() {
    const idx = CYCLE_ORDER.indexOf(item.status);
    const next = CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
    onStatusChange(item.id, next);
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
      padding: "16px 12px", background: "#0d1117", border: `1px solid ${c.border}30`,
      borderRadius: "8px", minWidth: "100px", flex: "1 1 100px",
      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      boxShadow: `0 0 12px ${c.glow}10`,
    }}>
      <StatusLight
        status={item.status}
        size={44}
        clickable={isAdmin}
        onClick={handleCycle}
      />
      <div style={{
        fontFamily: FONTS.header, fontSize: "16px", fontWeight: 700,
        color: "#e5e7eb", letterSpacing: "0.04em", textAlign: "center",
      }}>
        {item.short}
      </div>
      <div style={{
        fontFamily: FONTS.mono, fontSize: "8px", color: "#6b7280",
        letterSpacing: "0.1em", textAlign: "center", lineHeight: 1.3,
        textTransform: "uppercase",
      }}>
        {item.label}
      </div>
      <div style={{
        fontFamily: FONTS.mono, fontSize: "9px", fontWeight: 700,
        color: c.fill, letterSpacing: "0.08em",
      }}>
        {c.label}
      </div>

      {/* Admin assignment */}
      {isAdmin && (
        <select
          value={item.assignedAdmin || ""}
          onChange={(e) => onAdminAssign(item.id, e.target.value)}
          style={{
            width: "100%", padding: "3px 4px", fontSize: "9px",
            fontFamily: FONTS.mono, background: "#161b22", color: "#9ca3af",
            border: "1px solid #30363d", borderRadius: "3px", outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="">Unassigned</option>
          {admins.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      )}
      {!isAdmin && assignedAdmin && (
        <div style={{
          fontFamily: FONTS.mono, fontSize: "9px", color: "#4b5563",
          letterSpacing: "0.05em",
        }}>
          {assignedAdmin.name}
        </div>
      )}
    </div>
  );
}

// ── Admin Panel ─────────────────────────────────────────────────────────────
function AdminPanel({ admins, onAddAdmin, onRemoveAdmin }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    onAddAdmin(name.trim(), role.trim());
    setName("");
    setRole("");
  }

  return (
    <div style={{
      background: "#0d1117", border: "1px solid #21262d", borderRadius: "6px",
      padding: "16px 20px", marginBottom: "20px",
    }}>
      <div style={{
        fontFamily: FONTS.mono, fontSize: "10px", fontWeight: 700, color: "#60a5fa",
        letterSpacing: "0.15em", marginBottom: "12px",
      }}>
        ADMIN MANAGEMENT
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "12px" }}>
        <input
          type="text" placeholder="Name" value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          style={{
            padding: "6px 10px", background: "#161b22", border: "1px solid #30363d",
            borderRadius: "4px", color: "#e5e7eb", fontFamily: FONTS.mono,
            fontSize: "11px", outline: "none", flex: "1", minWidth: "120px",
          }}
        />
        <input
          type="text" placeholder="Role (optional)" value={role}
          onChange={(e) => setRole(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          style={{
            padding: "6px 10px", background: "#161b22", border: "1px solid #30363d",
            borderRadius: "4px", color: "#e5e7eb", fontFamily: FONTS.mono,
            fontSize: "11px", outline: "none", flex: "1", minWidth: "120px",
          }}
        />
        <button onClick={handleAdd} style={{
          padding: "6px 16px", background: "#1e3a5f", border: "1px solid #3b82f6",
          borderRadius: "4px", color: "#93c5fd", fontFamily: FONTS.mono,
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer",
        }}>
          + ADD
        </button>
      </div>
      {admins.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {admins.map((admin) => (
            <div key={admin.id} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "4px 10px", background: "#161b22", border: "1px solid #21262d",
              borderRadius: "4px",
            }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: "11px", color: "#d1d5db" }}>
                {admin.name}
              </span>
              {admin.role && (
                <span style={{ fontFamily: FONTS.mono, fontSize: "9px", color: "#6b7280" }}>
                  ({admin.role})
                </span>
              )}
              <button onClick={() => onRemoveAdmin(admin.id)} style={{
                background: "none", border: "none", color: "#ef4444",
                cursor: "pointer", fontSize: "14px", padding: "0 2px",
                fontFamily: "monospace",
              }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Process Tab ────────────────────────────────────────────────────────
export default function ProcessTab() {
  const [items, setItems] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Data Fetching ───────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/process`);
      const data = await res.json();
      setItems(data.items || []);
      setAdmins(data.admins || []);
    } catch (err) {
      console.error("[ProcessTab] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── PIN Auth ────────────────────────────────────────────────────────────
  async function handlePinSubmit() {
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();
      if (data.valid) {
        setIsAdmin(true);
        setShowPinModal(false);
        setPinInput("");
        setPinError(false);
      } else {
        setPinError(true);
      }
    } catch {
      setPinError(true);
    }
  }

  // ── Status Change ───────────────────────────────────────────────────────
  async function handleStatusChange(itemId, newStatus) {
    // Optimistic update
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, status: newStatus } : i));
    try {
      await fetch(`${API_BASE}/api/process/${itemId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": pinInput || sessionStorage.getItem("adminPin") || "" },
        body: JSON.stringify({ status: newStatus, pin: sessionStorage.getItem("adminPin") }),
      });
    } catch (err) {
      console.error("[ProcessTab] Status update failed:", err);
      fetchData(); // revert on failure
    }
  }

  // ── Admin Assignment ────────────────────────────────────────────────────
  async function handleAdminAssign(itemId, adminId) {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, assignedAdmin: adminId } : i));
    try {
      await fetch(`${API_BASE}/api/process/${itemId}/admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": sessionStorage.getItem("adminPin") || "" },
        body: JSON.stringify({ assignedAdmin: adminId, pin: sessionStorage.getItem("adminPin") }),
      });
    } catch (err) {
      fetchData();
    }
  }

  // ── Admin Management ────────────────────────────────────────────────────
  async function handleAddAdmin(name, role) {
    try {
      const res = await fetch(`${API_BASE}/api/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": sessionStorage.getItem("adminPin") || "" },
        body: JSON.stringify({ name, role, pin: sessionStorage.getItem("adminPin") }),
      });
      const newAdmin = await res.json();
      setAdmins((prev) => [...prev, newAdmin]);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemoveAdmin(id) {
    try {
      await fetch(`${API_BASE}/api/admins/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Pin": sessionStorage.getItem("adminPin") || "", "Content-Type": "application/json" },
        body: JSON.stringify({ pin: sessionStorage.getItem("adminPin") }),
      });
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      setItems((prev) => prev.map((i) => i.assignedAdmin === id ? { ...i, assignedAdmin: "" } : i));
    } catch (err) {
      console.error(err);
    }
  }

  // Store pin in session for subsequent requests
  function loginWithPin() {
    sessionStorage.setItem("adminPin", pinInput);
    handlePinSubmit();
  }

  // ── Separate items by group ─────────────────────────────────────────────
  const coreItems = items.filter((i) => i.group === "core");
  const ottiItems = items.filter((i) => i.group === "otti");
  const opsItems = items.filter((i) => i.group === "ops");

  // ── Summary stats ───────────────────────────────────────────────────────
  const totalGreen = items.filter((i) => i.status === "green").length;
  const totalYellow = items.filter((i) => i.status === "yellow").length;
  const totalRed = items.filter((i) => i.status === "red").length;

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0e14", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: "12px", color: "#6b7280", letterSpacing: "0.2em" }}>
          LOADING PROCESS DATA...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e14", color: "#e5e7eb", fontFamily: FONTS.body }}>
      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(180deg, #0d1117 0%, #0a0e14 100%)",
        borderBottom: "1px solid #21262d", padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
      }}>
        <div>
          <h1 style={{
            fontFamily: FONTS.header, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700,
            color: "#f3f4f6", letterSpacing: "0.05em", margin: 0,
          }}>
            PROCESS STATUS DASHBOARD
          </h1>
          <p style={{ fontFamily: FONTS.mono, fontSize: "11px", color: "#6b7280", margin: "4px 0 0 0", letterSpacing: "0.05em" }}>
            sUAS FIELDING WORKFLOW — GATE STATUS TRACKER
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Summary lights */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {[
              { status: "green", count: totalGreen },
              { status: "yellow", count: totalYellow },
              { status: "red", count: totalRed },
            ].map((s) => (
              <div key={s.status} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <StatusLight status={s.status} size={16} />
                <span style={{ fontFamily: FONTS.header, fontSize: "18px", fontWeight: 700, color: STATUS_COLORS[s.status].fill }}>
                  {s.count}
                </span>
              </div>
            ))}
          </div>
          {/* Admin toggle */}
          <button
            onClick={() => isAdmin ? setIsAdmin(false) : setShowPinModal(true)}
            style={{
              padding: "6px 14px", fontSize: "10px", fontWeight: 700, fontFamily: FONTS.mono,
              letterSpacing: "0.1em",
              border: isAdmin ? "1px solid #16a34a" : "1px solid #30363d",
              background: isAdmin ? "#0d3320" : "#161b22",
              color: isAdmin ? "#4ade80" : "#6b7280",
              borderRadius: "4px", cursor: "pointer",
            }}
          >
            {isAdmin ? "🔓 ADMIN MODE" : "🔒 ADMIN LOGIN"}
          </button>
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {/* Admin panel (visible when authenticated) */}
        {isAdmin && (
          <AdminPanel admins={admins} onAddAdmin={handleAddAdmin} onRemoveAdmin={handleRemoveAdmin} />
        )}

        {/* ── Legend ── */}
        <div style={{
          display: "flex", gap: "24px", marginBottom: "24px", padding: "12px 20px",
          background: "#0d1117", border: "1px solid #21262d", borderRadius: "6px",
          alignItems: "center", flexWrap: "wrap",
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#6b7280", letterSpacing: "0.12em" }}>LEGEND</span>
          {Object.entries(STATUS_COLORS).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <StatusLight status={key} size={14} />
              <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: val.fill, letterSpacing: "0.08em" }}>
                {val.label}
              </span>
            </div>
          ))}
          {isAdmin && (
            <>
              <span style={{ width: "1px", height: "16px", background: "#30363d" }} />
              <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#60a5fa", letterSpacing: "0.08em" }}>
                CLICK INDICATORS TO CYCLE STATUS
              </span>
            </>
          )}
        </div>

        {/* ── CORE PROCESS ITEMS ── */}
        <div style={{
          fontFamily: FONTS.mono, fontSize: "10px", fontWeight: 700, color: "#6b7280",
          letterSpacing: "0.15em", marginBottom: "10px",
        }}>
          FIELDING PROCESS GATES
        </div>
        <div style={{
          display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap",
        }}>
          {coreItems.map((item) => (
            <ProcessCard
              key={item.id} item={item} isAdmin={isAdmin} admins={admins}
              onStatusChange={handleStatusChange} onAdminAssign={handleAdminAssign}
            />
          ))}
        </div>

        {/* ── OTTI SUBSECTION ── */}
        <div style={{
          background: "#0d1117", border: "2px solid #8b5cf6", borderRadius: "8px",
          padding: "20px", marginBottom: "24px",
          boxShadow: "0 0 16px rgba(139,92,246,0.08)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px",
          }}>
            <div style={{
              fontFamily: FONTS.header, fontSize: "20px", fontWeight: 700, color: "#c4b5fd",
              letterSpacing: "0.08em",
            }}>
              OTTI
            </div>
            <div style={{
              fontFamily: FONTS.mono, fontSize: "9px", color: "#8b5cf6",
              letterSpacing: "0.15em", fontWeight: 700,
              padding: "3px 10px", background: "#1e1533", border: "1px solid #8b5cf640",
              borderRadius: "3px",
            }}>
              OPERATIONAL TEST & TACTICAL INTEGRATION
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {ottiItems.map((item) => (
              <ProcessCard
                key={item.id} item={item} isAdmin={isAdmin} admins={admins}
                onStatusChange={handleStatusChange} onAdminAssign={handleAdminAssign}
              />
            ))}
          </div>
        </div>

        {/* ── OPERATIONS ITEMS ── */}
        <div style={{
          fontFamily: FONTS.mono, fontSize: "10px", fontWeight: 700, color: "#6b7280",
          letterSpacing: "0.15em", marginBottom: "10px",
        }}>
          OPERATIONS & COORDINATION
        </div>
        <div style={{
          display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap",
        }}>
          {opsItems.map((item) => (
            <ProcessCard
              key={item.id} item={item} isAdmin={isAdmin} admins={admins}
              onStatusChange={handleStatusChange} onAdminAssign={handleAdminAssign}
            />
          ))}
        </div>

        {/* ── Timeline View ── */}
        <div style={{
          background: "#0d1117", border: "1px solid #21262d", borderRadius: "6px",
          padding: "20px", overflow: "hidden",
        }}>
          <div style={{
            fontFamily: FONTS.mono, fontSize: "10px", fontWeight: 700, color: "#6b7280",
            letterSpacing: "0.15em", marginBottom: "16px",
          }}>
            FULL PROCESS FLOW — LEFT TO RIGHT
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "4px", overflowX: "auto",
            padding: "8px 0",
          }}>
            {items.map((item, idx) => {
              const c = STATUS_COLORS[item.status];
              const isOttiStart = item.id === "otti_mf";
              const isOttiEnd = item.id === "otti_eval";
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {isOttiStart && (
                    <div style={{
                      fontFamily: FONTS.mono, fontSize: "8px", color: "#8b5cf6",
                      letterSpacing: "0.1em", marginRight: "4px", writingMode: "vertical-rl",
                      textOrientation: "mixed", fontWeight: 700,
                    }}>OTTI</div>
                  )}
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                    padding: isOttiStart || item.group === "otti" ? "8px 6px" : "0 6px",
                    background: item.group === "otti" ? "#8b5cf608" : "transparent",
                    borderTop: item.group === "otti" ? "1px solid #8b5cf630" : "none",
                    borderBottom: item.group === "otti" ? "1px solid #8b5cf630" : "none",
                    borderLeft: isOttiStart ? "1px solid #8b5cf630" : "none",
                    borderRight: isOttiEnd ? "1px solid #8b5cf630" : "none",
                    borderRadius: isOttiStart ? "4px 0 0 4px" : isOttiEnd ? "0 4px 4px 0" : "0",
                  }}>
                    <StatusLight status={item.status} size={20} clickable={isAdmin}
                      onClick={() => {
                        const next = CYCLE_ORDER[(CYCLE_ORDER.indexOf(item.status) + 1) % 3];
                        handleStatusChange(item.id, next);
                      }}
                    />
                    <span style={{
                      fontFamily: FONTS.mono, fontSize: "8px", fontWeight: 700,
                      color: c.fill, letterSpacing: "0.05em", whiteSpace: "nowrap",
                    }}>
                      {item.short}
                    </span>
                  </div>
                  {idx < items.length - 1 && !isOttiEnd && item.group === items[idx + 1]?.group && (
                    <div style={{
                      width: "12px", height: "2px",
                      background: `linear-gradient(90deg, ${c.fill}80, ${STATUS_COLORS[items[idx + 1]?.status]?.fill || "#666"}80)`,
                    }} />
                  )}
                  {idx < items.length - 1 && (isOttiEnd || item.group !== items[idx + 1]?.group) && (
                    <div style={{ width: "20px", height: "2px", background: "#30363d" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PIN Modal ── */}
      {showPinModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000,
        }} onClick={() => setShowPinModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#0d1117", border: "1px solid #30363d", borderRadius: "8px",
            padding: "32px", width: "320px", textAlign: "center",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}>
            <div style={{
              fontFamily: FONTS.header, fontSize: "20px", fontWeight: 700,
              color: "#e5e7eb", letterSpacing: "0.05em", marginBottom: "4px",
            }}>
              ADMIN ACCESS
            </div>
            <div style={{
              fontFamily: FONTS.mono, fontSize: "10px", color: "#6b7280",
              letterSpacing: "0.1em", marginBottom: "20px",
            }}>
              ENTER ADMIN PIN TO MODIFY STATUS
            </div>
            <input
              type="password"
              placeholder="PIN"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
              onKeyDown={(e) => e.key === "Enter" && loginWithPin()}
              autoFocus
              style={{
                width: "100%", padding: "10px", fontSize: "18px", fontFamily: FONTS.mono,
                textAlign: "center", letterSpacing: "0.3em",
                background: "#161b22", border: `1px solid ${pinError ? "#dc2626" : "#30363d"}`,
                borderRadius: "4px", color: "#e5e7eb", outline: "none",
                marginBottom: "8px",
              }}
            />
            {pinError && (
              <div style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#ef4444", marginBottom: "8px" }}>
                INVALID PIN
              </div>
            )}
            <button onClick={loginWithPin} style={{
              width: "100%", padding: "10px", fontFamily: FONTS.mono, fontSize: "12px",
              fontWeight: 700, letterSpacing: "0.1em", background: "#1e3a5f",
              border: "1px solid #3b82f6", borderRadius: "4px", color: "#93c5fd",
              cursor: "pointer", marginTop: "4px",
            }}>
              AUTHENTICATE
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
