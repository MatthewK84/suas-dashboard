import { useState } from "react";
import IntroTab from "./IntroTab.jsx";
import CapabilityTab from "./CapabilityTab.jsx";
import ProcessTab from "./ProcessTab.jsx";
import IdeasTab from "./IdeasTab.jsx";

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
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <nav style={{ display:"flex", alignItems:"stretch", background:"#0d1117", borderBottom:"2px solid #21262d", position:"sticky", top:0, zIndex:900, overflowX:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", padding:"0 20px", borderRight:"1px solid #21262d", flexShrink:0 }}>
          <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:16, fontWeight:700, color:"#60a5fa", letterSpacing:"0.12em" }}>sUAS</span>
        </div>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display:"flex", alignItems:"center", gap:8, padding:"12px 24px",
                background: active ? "linear-gradient(180deg,#161b22,#0d1117)" : "transparent",
                border:"none", borderBottom: active ? "2px solid #60a5fa" : "2px solid transparent",
                color: active ? "#e5e7eb" : "#6b7280",
                fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
                letterSpacing:"0.1em", cursor:"pointer", transition:"all 0.2s ease",
                whiteSpace:"nowrap", flexShrink:0, marginBottom:"-2px",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#9ca3af"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#6b7280"; }}
            >
              <span style={{ fontSize:14, color: active ? "#60a5fa" : "#4b5563" }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </nav>
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
      `}</style>
    </div>
  );
}
