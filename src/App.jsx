import { useState } from "react";
import IntroTab from "./IntroTab.jsx";
import CapabilityTab from "./CapabilityTab.jsx";
import ProcessTab from "./ProcessTab.jsx";
import IdeasTab from "./IdeasTab.jsx";

const FONTS = {
  header: "'Oswald', 'Bebas Neue', 'Impact', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};

const TABS = [
  { id: "intro",      label: "OVERVIEW",       icon: "◈" },
  { id: "capability",  label: "CAPABILITIES",   icon: "◆" },
  { id: "process",     label: "PROCESS STATUS", icon: "◉" },
  { id: "ideas",       label: "IDEA INTAKE",    icon: "◇" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("intro");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e14" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* ═══ TAB NAVIGATION BAR ═══ */}
      <nav style={{
        display: "flex",
        alignItems: "stretch",
        background: "#0d1117",
        borderBottom: "2px solid #21262d",
        position: "sticky",
        top: 0,
        zIndex: 900,
        overflowX: "auto",
      }}>
        {/* Brand mark */}
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderRight: "1px solid #21262d",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: FONTS.header,
            fontSize: "16px",
            fontWeight: 700,
            color: "#60a5fa",
            letterSpacing: "0.12em",
          }}>
            sUAS
          </span>
        </div>

        {/* Tab buttons */}
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                background: isActive
                  ? "linear-gradient(180deg, #161b22 0%, #0d1117 100%)"
                  : "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid #60a5fa" : "2px solid transparent",
                color: isActive ? "#e5e7eb" : "#6b7280",
                fontFamily: FONTS.mono,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
                marginBottom: "-2px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "#9ca3af";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "#6b7280";
              }}
            >
              <span style={{
                fontSize: "14px",
                color: isActive ? "#60a5fa" : "#4b5563",
                transition: "color 0.2s ease",
              }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ═══ ACTIVE TAB CONTENT ═══ */}
      <main>
        {activeTab === "intro" && <IntroTab />}
        {activeTab === "capability" && <CapabilityTab />}
        {activeTab === "process" && <ProcessTab />}
        {activeTab === "ideas" && <IdeasTab />}
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0a0e14; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #484f58; }
      `}</style>
    </div>
  );
}
