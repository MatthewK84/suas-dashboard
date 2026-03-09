import { useState, useEffect } from "react";

// ── Fonts (shared constants) ────────────────────────────────────────────────
const FONTS = {
  header: "'Oswald', 'Bebas Neue', 'Impact', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  body: "'IBM Plex Sans', 'Segoe UI', sans-serif",
};

// ── Animated Connector Line ─────────────────────────────────────────────────
function Connector({ delay = 0 }) {
  return (
    <div style={{
      display: "flex", justifyContent: "center", padding: "0",
      animation: `fadeSlideIn 0.6s ease ${delay}s both`,
    }}>
      <div style={{
        width: "3px", height: "32px",
        background: "linear-gradient(180deg, #3b82f6 0%, #1e3a5f 100%)",
        borderRadius: "2px",
        boxShadow: "0 0 8px rgba(59,130,246,0.3)",
      }} />
    </div>
  );
}

// ── Layer Box ───────────────────────────────────────────────────────────────
function LayerBox({ children, label, sublabel, color, borderColor, delay = 0, glow = false }) {
  return (
    <div style={{
      animation: `fadeSlideIn 0.7s ease ${delay}s both`,
    }}>
      {label && (
        <div style={{
          fontFamily: FONTS.mono, fontSize: "9px", fontWeight: 700, color: "#6b7280",
          letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "6px",
          textAlign: "center",
        }}>
          {label}
        </div>
      )}
      <div style={{
        background: color || "#0d1117",
        border: `2px solid ${borderColor || "#21262d"}`,
        borderRadius: "8px",
        padding: "0",
        overflow: "hidden",
        boxShadow: glow
          ? `0 0 20px rgba(59,130,246,0.15), 0 8px 32px rgba(0,0,0,0.4)`
          : "0 8px 32px rgba(0,0,0,0.3)",
        position: "relative",
      }}>
        {children}
      </div>
      {sublabel && (
        <div style={{
          fontFamily: FONTS.mono, fontSize: "9px", color: "#4b5563",
          letterSpacing: "0.1em", marginTop: "6px", textAlign: "center",
        }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

// ── Main Introduction Tab ───────────────────────────────────────────────────
export default function IntroTab() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0e14", color: "#e5e7eb",
      fontFamily: FONTS.body, padding: "0",
      opacity: visible ? 1 : 0, transition: "opacity 0.5s ease",
    }}>
      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(180deg, #0d1117 0%, #0a0e14 100%)",
        borderBottom: "1px solid #21262d", padding: "28px 32px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "8px",
        }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a",
            boxShadow: "0 0 8px #16a34a", animation: "pulse 2s infinite",
          }} />
          <span style={{
            fontFamily: FONTS.mono, fontSize: "10px", color: "#4ade80",
            letterSpacing: "0.2em", fontWeight: 700,
          }}>
            CLASSIFICATION: CUI // UNCLASSIFIED — FOUO
          </span>
        </div>
        <h1 style={{
          fontFamily: FONTS.header, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700,
          color: "#f3f4f6", letterSpacing: "0.06em", margin: "0",
          lineHeight: 1.1,
        }}>
          sUAS PROGRAM OVERVIEW
        </h1>
        <p style={{
          fontFamily: FONTS.mono, fontSize: "12px", color: "#6b7280",
          margin: "10px 0 0 0", letterSpacing: "0.08em",
        }}>
          ORGANIZATIONAL STRUCTURE & CAPABILITY DELIVERY FRAMEWORK
        </p>
      </div>

      {/* ── Layered Graphic ── */}
      <div style={{
        maxWidth: "800px", margin: "48px auto", padding: "0 24px",
      }}>

        {/* LAYER 1: GOFO */}
        <LayerBox
          label="DECISION AUTHORITY"
          borderColor="#3b82f6"
          color="linear-gradient(135deg, #0c1929 0%, #0d1117 100%)"
          delay={0.1}
          glow
        >
          <div style={{
            padding: "28px 24px", textAlign: "center",
            background: "radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)",
          }}>
            <div style={{
              fontFamily: FONTS.mono, fontSize: "10px", color: "#3b82f6",
              letterSpacing: "0.2em", marginBottom: "6px", fontWeight: 700,
            }}>
              ★ ★ ★
            </div>
            <div style={{
              fontFamily: FONTS.header, fontSize: "42px", fontWeight: 700,
              color: "#e5e7eb", letterSpacing: "0.1em", lineHeight: 1,
            }}>
              GOFO
            </div>
            <div style={{
              fontFamily: FONTS.mono, fontSize: "11px", color: "#6b7280",
              letterSpacing: "0.12em", marginTop: "8px",
            }}>
              GENERAL OFFICER / FLAG OFFICER
            </div>
            <div style={{
              fontFamily: FONTS.body, fontSize: "13px", color: "#9ca3af",
              marginTop: "12px", maxWidth: "500px", margin: "12px auto 0",
              lineHeight: 1.5,
            }}>
              Program authority, resource allocation, and strategic direction for sUAS capability fielding
            </div>
          </div>
        </LayerBox>

        <Connector delay={0.3} />

        {/* LAYER 2: C2 / P2 / I2 / FC */}
        <LayerBox
          label="FUNCTIONAL PILLARS"
          borderColor="#60a5fa"
          color="#0d1117"
          delay={0.4}
          glow
        >
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0",
          }}>
            {[
              {
                code: "C2",
                title: "COMMAND & CONTROL",
                desc: "Operational authority, mission command, and decision-making chains",
                icon: "◆",
                accent: "#ef4444",
              },
              {
                code: "P2",
                title: "PLANS & PROGRAMS",
                desc: "Strategic planning, roadmaps, acquisition milestones, and capability gaps",
                icon: "◆",
                accent: "#f59e0b",
              },
              {
                code: "I2",
                title: "INTEL & INFO",
                desc: "Threat intelligence, target development, and information operations integration",
                icon: "◆",
                accent: "#10b981",
              },
              {
                code: "FC",
                title: "FIRES & COORD",
                desc: "Joint fires coordination, airspace deconfliction, and effects integration",
                icon: "◆",
                accent: "#8b5cf6",
              },
            ].map((pillar, i) => (
              <div
                key={pillar.code}
                style={{
                  padding: "24px 16px",
                  textAlign: "center",
                  borderRight: i < 3 ? "1px solid #21262d" : "none",
                  background: `radial-gradient(ellipse at center bottom, ${pillar.accent}08 0%, transparent 70%)`,
                  transition: "background 0.3s ease",
                }}
              >
                <div style={{
                  fontFamily: FONTS.mono, fontSize: "11px", color: pillar.accent,
                  letterSpacing: "0.15em", marginBottom: "6px", fontWeight: 700,
                }}>
                  {pillar.icon}
                </div>
                <div style={{
                  fontFamily: FONTS.header, fontSize: "36px", fontWeight: 700,
                  color: "#e5e7eb", letterSpacing: "0.08em", lineHeight: 1,
                }}>
                  {pillar.code}
                </div>
                <div style={{
                  fontFamily: FONTS.mono, fontSize: "8px", color: "#6b7280",
                  letterSpacing: "0.15em", marginTop: "8px", lineHeight: 1.4,
                }}>
                  {pillar.title}
                </div>
                <div style={{
                  fontFamily: FONTS.body, fontSize: "11px", color: "#4b5563",
                  marginTop: "10px", lineHeight: 1.4,
                }}>
                  {pillar.desc}
                </div>
              </div>
            ))}
          </div>
        </LayerBox>

        <Connector delay={0.6} />

        {/* LAYER 3: CAPES + STATUS */}
        <LayerBox
          label="CAPABILITY & STATUS TRACKING"
          borderColor="#10b981"
          color="#0d1117"
          delay={0.7}
        >
          <div style={{
            padding: "24px",
            background: "linear-gradient(135deg, rgba(16,185,129,0.04) 0%, transparent 100%)",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: FONTS.header, fontSize: "32px", fontWeight: 700,
                color: "#e5e7eb", letterSpacing: "0.08em", lineHeight: 1,
              }}>
                CAPES + STATUS
              </div>
              <div style={{
                fontFamily: FONTS.mono, fontSize: "10px", color: "#10b981",
                letterSpacing: "0.15em", marginTop: "8px", fontWeight: 700,
              }}>
                CAPABILITY ASSESSMENTS & READINESS POSTURE
              </div>
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
              marginTop: "20px",
            }}>
              {[
                { label: "BLUE sUAS / NDAA", desc: "Compliance verification & approved systems list" },
                { label: "MUA / TECH ASSESS", desc: "Military utility & technical readiness evaluations" },
                { label: "CENTCOM AOR", desc: "Theater-specific fielding & ruggedization status" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "14px",
                    background: "#161b22",
                    border: "1px solid #21262d",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  <div style={{
                    fontFamily: FONTS.mono, fontSize: "10px", color: "#10b981",
                    letterSpacing: "0.1em", fontWeight: 700, marginBottom: "6px",
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontFamily: FONTS.body, fontSize: "11px", color: "#6b7280", lineHeight: 1.4,
                  }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LayerBox>

        <Connector delay={0.9} />

        {/* LAYER 4: VENDORS */}
        <LayerBox
          label="INDUSTRY BASE"
          borderColor="#f59e0b"
          color="#0d1117"
          delay={1.0}
          sublabel="DoW CONTRACT VEHICLES • FUNDED PROGRAMS • WARFIGHTER DELIVERY"
        >
          <div style={{
            padding: "24px",
            background: "linear-gradient(135deg, rgba(245,158,11,0.04) 0%, transparent 100%)",
          }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{
                fontFamily: FONTS.header, fontSize: "32px", fontWeight: 700,
                color: "#e5e7eb", letterSpacing: "0.08em", lineHeight: 1,
              }}>
                VENDORS
              </div>
              <div style={{
                fontFamily: FONTS.mono, fontSize: "10px", color: "#f59e0b",
                letterSpacing: "0.15em", marginTop: "8px", fontWeight: 700,
              }}>
                DEFENSE INDUSTRIAL BASE — CONTRACTED PROVIDERS
              </div>
            </div>
            <div style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px",
            }}>
              {[
                "AeroVironment", "Anduril Industries", "Raytheon / RTX",
                "Lockheed Martin", "L3Harris", "SAIC", "Northrop Grumman",
                "SRC Inc.", "D-Fend Solutions", "Flex Force",
                "Dedrone (Axon)", "Aevex Aerospace", "AFRL / Leidos",
              ].map((vendor) => (
                <span
                  key={vendor}
                  style={{
                    padding: "5px 12px",
                    background: "#161b22",
                    border: "1px solid #21262d",
                    borderRadius: "4px",
                    fontFamily: FONTS.mono,
                    fontSize: "10px",
                    color: "#9ca3af",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {vendor}
                </span>
              ))}
            </div>
          </div>
        </LayerBox>
      </div>

      {/* ── Footer Note ── */}
      <div style={{
        textAlign: "center", padding: "0 24px 48px",
        fontFamily: FONTS.mono, fontSize: "10px", color: "#4b5563",
        letterSpacing: "0.1em",
      }}>
        USE TABS ABOVE TO ACCESS CAPABILITY DASHBOARD, PROCESS STATUS, AND IDEA INTAKE
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
