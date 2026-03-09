import { useState, useEffect, useCallback } from "react";

const FONTS = {
  header: "'Oswald', 'Bebas Neue', 'Impact', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  body: "'IBM Plex Sans', 'Segoe UI', sans-serif",
};

const API_BASE = "";

const PRIORITY_CONFIG = {
  low:    { bg: "#0d3320", border: "#16a34a", color: "#4ade80", label: "LOW" },
  medium: { bg: "#3b2e10", border: "#ca8a04", color: "#facc15", label: "MED" },
  high:   { bg: "#3b1318", border: "#dc2626", color: "#f87171", label: "HIGH" },
};

const STATUS_CONFIG = {
  new:          { color: "#60a5fa", label: "NEW" },
  under_review: { color: "#facc15", label: "UNDER REVIEW" },
  approved:     { color: "#4ade80", label: "APPROVED" },
  in_progress:  { color: "#c084fc", label: "IN PROGRESS" },
  completed:    { color: "#16a34a", label: "COMPLETED" },
  declined:     { color: "#ef4444", label: "DECLINED" },
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// ── Idea Card ───────────────────────────────────────────────────────────────
function IdeaCard({ idea, subgroups, isAdmin, onStatusChange, onComment, expanded, onToggle }) {
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const priority = PRIORITY_CONFIG[idea.priority] || PRIORITY_CONFIG.medium;
  const status = STATUS_CONFIG[idea.status] || STATUS_CONFIG.new;
  const subgroup = subgroups.find((s) => s.id === idea.subgroupId);

  function handleComment() {
    if (!commentText.trim() || !commentAuthor.trim()) return;
    onComment(idea.id, commentAuthor.trim(), commentText.trim());
    setCommentText("");
    setCommentAuthor("");
  }

  return (
    <div style={{
      background: "#0d1117", border: "1px solid #21262d", borderRadius: "6px",
      overflow: "hidden", transition: "border-color 0.2s ease",
    }}>
      {/* Header row */}
      <div
        onClick={onToggle}
        style={{
          padding: "14px 20px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "12px",
          borderBottom: expanded ? "1px solid #21262d" : "none",
        }}
      >
        {/* Priority badge */}
        <span style={{
          padding: "2px 8px", fontSize: "9px", fontWeight: 700, fontFamily: FONTS.mono,
          letterSpacing: "0.08em", background: priority.bg, border: `1px solid ${priority.border}`,
          color: priority.color, borderRadius: "3px", flexShrink: 0,
        }}>
          {priority.label}
        </span>

        {/* Status badge */}
        <span style={{
          padding: "2px 8px", fontSize: "9px", fontWeight: 700, fontFamily: FONTS.mono,
          letterSpacing: "0.08em", background: "#161b22", border: "1px solid #30363d",
          color: status.color, borderRadius: "3px", flexShrink: 0,
        }}>
          {status.label}
        </span>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: FONTS.header, fontSize: "15px", fontWeight: 600, color: "#f3f4f6",
            letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {idea.title}
          </div>
        </div>

        {/* Subgroup */}
        {subgroup && (
          <span style={{
            padding: "2px 8px", fontSize: "9px", fontWeight: 700, fontFamily: FONTS.mono,
            letterSpacing: "0.08em", background: "#1e2a3b", border: "1px solid #3b82f640",
            color: "#60a5fa", borderRadius: "3px", flexShrink: 0,
          }}>
            → {subgroup.name.toUpperCase()}
          </span>
        )}

        {/* Meta */}
        <span style={{
          fontFamily: FONTS.mono, fontSize: "9px", color: "#4b5563", flexShrink: 0,
        }}>
          {idea.submitter}
        </span>
        <span style={{
          fontFamily: FONTS.mono, fontSize: "9px", color: "#4b5563", flexShrink: 0,
        }}>
          {formatDate(idea.createdAt)}
        </span>

        {/* Comment count */}
        {idea.comments?.length > 0 && (
          <span style={{
            fontFamily: FONTS.mono, fontSize: "9px", color: "#6b7280",
            background: "#161b22", border: "1px solid #21262d",
            padding: "2px 6px", borderRadius: "3px",
          }}>
            {idea.comments.length} 💬
          </span>
        )}

        <span style={{
          fontFamily: "monospace", fontSize: "12px", color: "#6b7280",
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
        }}>▼</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "16px 20px" }}>
          <p style={{
            fontFamily: FONTS.body, fontSize: "13px", color: "#d1d5db",
            lineHeight: 1.6, margin: "0 0 16px 0",
          }}>
            {idea.description}
          </p>

          {/* Admin status controls */}
          {isAdmin && (
            <div style={{
              display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap",
              padding: "10px", background: "#161b22", borderRadius: "4px",
              border: "1px solid #21262d",
            }}>
              <span style={{
                fontFamily: FONTS.mono, fontSize: "9px", color: "#6b7280",
                letterSpacing: "0.1em", alignSelf: "center", marginRight: "4px",
              }}>
                SET STATUS:
              </span>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => onStatusChange(idea.id, key)}
                  style={{
                    padding: "3px 10px", fontSize: "9px", fontWeight: 700, fontFamily: FONTS.mono,
                    letterSpacing: "0.06em",
                    background: idea.status === key ? "#1e3a5f" : "#0d1117",
                    border: `1px solid ${idea.status === key ? val.color : "#30363d"}`,
                    color: idea.status === key ? val.color : "#6b7280",
                    borderRadius: "3px", cursor: "pointer",
                  }}
                >
                  {val.label}
                </button>
              ))}
            </div>
          )}

          {/* Comments */}
          {idea.comments?.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div style={{
                fontFamily: FONTS.mono, fontSize: "9px", color: "#6b7280",
                letterSpacing: "0.12em", marginBottom: "8px", fontWeight: 700,
              }}>COMMENTS</div>
              {idea.comments.map((c) => (
                <div key={c.id} style={{
                  padding: "8px 12px", background: "#161b22", border: "1px solid #21262d",
                  borderRadius: "4px", marginBottom: "4px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#60a5fa", fontWeight: 700 }}>
                      {c.author}
                    </span>
                    <span style={{ fontFamily: FONTS.mono, fontSize: "9px", color: "#4b5563" }}>
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: FONTS.body, fontSize: "12px", color: "#d1d5db",
                    margin: 0, lineHeight: 1.4,
                  }}>
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add comment */}
          <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
            <input
              type="text" placeholder="Your name" value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              style={{
                padding: "6px 10px", background: "#161b22", border: "1px solid #30363d",
                borderRadius: "4px", color: "#e5e7eb", fontFamily: FONTS.mono,
                fontSize: "11px", outline: "none", width: "120px",
              }}
            />
            <input
              type="text" placeholder="Add a comment..." value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              style={{
                flex: 1, padding: "6px 10px", background: "#161b22", border: "1px solid #30363d",
                borderRadius: "4px", color: "#e5e7eb", fontFamily: FONTS.mono,
                fontSize: "11px", outline: "none",
              }}
            />
            <button onClick={handleComment} style={{
              padding: "6px 14px", background: "#1e3a5f", border: "1px solid #3b82f6",
              borderRadius: "4px", color: "#93c5fd", fontFamily: FONTS.mono,
              fontSize: "10px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            }}>
              POST
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Ideas Tab ──────────────────────────────────────────────────────────
export default function IdeasTab() {
  const [ideas, setIdeas] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitter, setSubmitter] = useState("");
  const [subgroupId, setSubgroupId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [showForm, setShowForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filter state
  const [filterSubgroup, setFilterSubgroup] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ideas`);
      const data = await res.json();
      setIdeas(data.ideas || []);
      setSubgroups(data.subgroups || []);
    } catch (err) {
      console.error("[IdeasTab] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Check admin session
  useEffect(() => {
    const pin = sessionStorage.getItem("adminPin");
    if (pin) setIsAdmin(true);
  }, []);

  async function handleSubmit() {
    if (!title.trim() || !description.trim() || !submitter.trim() || !subgroupId) return;
    try {
      const res = await fetch(`${API_BASE}/api/ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          submitter: submitter.trim(),
          subgroupId,
          priority,
        }),
      });
      const newIdea = await res.json();
      setIdeas((prev) => [newIdea, ...prev]);
      setTitle(""); setDescription(""); setSubmitter(""); setSubgroupId(""); setPriority("medium");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStatusChange(ideaId, newStatus) {
    const pin = sessionStorage.getItem("adminPin");
    try {
      await fetch(`${API_BASE}/api/ideas/${ideaId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": pin || "" },
        body: JSON.stringify({ status: newStatus, pin }),
      });
      setIdeas((prev) => prev.map((i) => i.id === ideaId ? { ...i, status: newStatus } : i));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleComment(ideaId, author, text) {
    try {
      const res = await fetch(`${API_BASE}/api/ideas/${ideaId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, text }),
      });
      const updated = await res.json();
      setIdeas((prev) => prev.map((i) => i.id === ideaId ? updated : i));
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = ideas.filter((idea) => {
    if (filterSubgroup !== "ALL" && idea.subgroupId !== filterSubgroup) return false;
    if (filterStatus !== "ALL" && idea.status !== filterStatus) return false;
    return true;
  });

  const inputStyle = {
    width: "100%", padding: "8px 12px", background: "#161b22",
    border: "1px solid #30363d", borderRadius: "4px", color: "#e5e7eb",
    fontFamily: FONTS.mono, fontSize: "12px", outline: "none",
  };

  const labelStyle = {
    fontFamily: FONTS.mono, fontSize: "9px", fontWeight: 700, color: "#6b7280",
    letterSpacing: "0.12em", marginBottom: "4px", display: "block",
  };

  const btnStyle = (active) => ({
    padding: "5px 12px", fontSize: "10px", fontWeight: 700, fontFamily: FONTS.mono,
    letterSpacing: "0.08em",
    border: active ? "1px solid #60a5fa" : "1px solid #30363d",
    background: active ? "#1e3a5f" : "#161b22",
    color: active ? "#93c5fd" : "#6b7280",
    borderRadius: "4px", cursor: "pointer",
  });

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0e14", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: "12px", color: "#6b7280", letterSpacing: "0.2em" }}>
          LOADING IDEAS...
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
            IDEA INTAKE
          </h1>
          <p style={{ fontFamily: FONTS.mono, fontSize: "11px", color: "#6b7280", margin: "4px 0 0 0", letterSpacing: "0.05em" }}>
            SUBMIT AND ROUTE IDEAS TO FUNCTIONAL SUBGROUPS
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            fontFamily: FONTS.mono, fontSize: "10px", color: "#4b5563",
          }}>
            {ideas.length} IDEA{ideas.length !== 1 ? "S" : ""} SUBMITTED
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "8px 20px", fontFamily: FONTS.mono, fontSize: "11px",
              fontWeight: 700, letterSpacing: "0.1em",
              background: showForm ? "#3b1318" : "#1e3a5f",
              border: `1px solid ${showForm ? "#dc2626" : "#3b82f6"}`,
              color: showForm ? "#f87171" : "#93c5fd",
              borderRadius: "4px", cursor: "pointer",
            }}
          >
            {showForm ? "✕ CANCEL" : "+ SUBMIT IDEA"}
          </button>
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {/* ── Success Toast ── */}
        {submitSuccess && (
          <div style={{
            padding: "10px 20px", background: "#0d3320", border: "1px solid #16a34a",
            borderRadius: "6px", marginBottom: "16px",
            fontFamily: FONTS.mono, fontSize: "11px", color: "#4ade80",
            letterSpacing: "0.08em",
          }}>
            ✓ IDEA SUBMITTED SUCCESSFULLY AND ROUTED TO SUBGROUP
          </div>
        )}

        {/* ── Submission Form ── */}
        {showForm && (
          <div style={{
            background: "#0d1117", border: "1px solid #3b82f6", borderRadius: "6px",
            padding: "24px", marginBottom: "24px",
            boxShadow: "0 0 20px rgba(59,130,246,0.08)",
          }}>
            <div style={{
              fontFamily: FONTS.mono, fontSize: "10px", fontWeight: 700, color: "#60a5fa",
              letterSpacing: "0.15em", marginBottom: "16px",
            }}>
              NEW IDEA SUBMISSION
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={labelStyle}>YOUR NAME</label>
                <input type="text" value={submitter} onChange={(e) => setSubmitter(e.target.value)}
                  placeholder="Name / Rank" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>IDEA TITLE</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title for your idea" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>DESCRIPTION</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the idea, expected impact, and any supporting rationale..."
                rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>ROUTE TO SUBGROUP</label>
                <select value={subgroupId} onChange={(e) => setSubgroupId(e.target.value)} style={inputStyle}>
                  <option value="">Select subgroup...</option>
                  {subgroups.map((sg) => (
                    <option key={sg.id} value={sg.id}>{sg.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>PRIORITY</label>
                <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                  {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setPriority(key)}
                      style={{
                        flex: 1, padding: "8px", fontFamily: FONTS.mono, fontSize: "10px",
                        fontWeight: 700, letterSpacing: "0.08em",
                        background: priority === key ? val.bg : "#161b22",
                        border: `1px solid ${priority === key ? val.border : "#30363d"}`,
                        color: priority === key ? val.color : "#6b7280",
                        borderRadius: "4px", cursor: "pointer",
                      }}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !description.trim() || !submitter.trim() || !subgroupId}
              style={{
                padding: "10px 28px", fontFamily: FONTS.mono, fontSize: "12px",
                fontWeight: 700, letterSpacing: "0.1em",
                background: "#1e3a5f", border: "1px solid #3b82f6",
                color: "#93c5fd", borderRadius: "4px", cursor: "pointer",
                opacity: (!title.trim() || !description.trim() || !submitter.trim() || !subgroupId) ? 0.4 : 1,
              }}
            >
              SUBMIT IDEA →
            </button>
          </div>
        )}

        {/* ── Filters ── */}
        <div style={{
          display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap",
          marginBottom: "16px", padding: "12px 16px",
          background: "#0d1117", border: "1px solid #21262d", borderRadius: "6px",
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#6b7280", letterSpacing: "0.12em" }}>
            SUBGROUP
          </span>
          <button style={btnStyle(filterSubgroup === "ALL")} onClick={() => setFilterSubgroup("ALL")}>ALL</button>
          {subgroups.map((sg) => (
            <button key={sg.id} style={btnStyle(filterSubgroup === sg.id)}
              onClick={() => setFilterSubgroup(sg.id)}>
              {sg.name.toUpperCase()}
            </button>
          ))}
          <span style={{ width: "1px", height: "16px", background: "#30363d" }} />
          <span style={{ fontFamily: FONTS.mono, fontSize: "10px", color: "#6b7280", letterSpacing: "0.12em" }}>
            STATUS
          </span>
          <button style={btnStyle(filterStatus === "ALL")} onClick={() => setFilterStatus("ALL")}>ALL</button>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <button key={key} style={btnStyle(filterStatus === key)}
              onClick={() => setFilterStatus(key)}>
              {val.label}
            </button>
          ))}
        </div>

        {/* ── Ideas List ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {filtered.length === 0 && (
            <div style={{
              padding: "48px 20px", textAlign: "center", background: "#0d1117",
              border: "1px solid #21262d", borderRadius: "6px",
            }}>
              <div style={{ fontFamily: FONTS.header, fontSize: "20px", color: "#4b5563", marginBottom: "8px" }}>
                {ideas.length === 0 ? "NO IDEAS YET" : "NO MATCHING IDEAS"}
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: "11px", color: "#4b5563" }}>
                {ideas.length === 0
                  ? "Use the SUBMIT IDEA button above to get started."
                  : "Try adjusting your filters."}
              </div>
            </div>
          )}
          {filtered.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              subgroups={subgroups}
              isAdmin={isAdmin}
              expanded={expandedId === idea.id}
              onToggle={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
              onStatusChange={handleStatusChange}
              onComment={handleComment}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
