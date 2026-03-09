import { useState, useEffect } from "react";
const F = { h:"'Oswald','Bebas Neue','Impact',sans-serif", m:"'JetBrains Mono','Fira Code','Consolas',monospace", b:"'IBM Plex Sans','Segoe UI',sans-serif" };

function Connector({ delay=0 }) {
  return (<div style={{ display:"flex", justifyContent:"center", animation:`fadeIn 0.6s ease ${delay}s both` }}>
    <div style={{ width:3, height:32, background:"linear-gradient(180deg,#3b82f6,#1e3a5f)", borderRadius:2, boxShadow:"0 0 8px rgba(59,130,246,0.3)" }} />
  </div>);
}

function Layer({ children, label, borderColor, delay=0, glow=false, sublabel }) {
  return (<div style={{ animation:`fadeIn 0.7s ease ${delay}s both` }}>
    {label && <div style={{ fontFamily:F.m, fontSize:9, fontWeight:700, color:"#6b7280", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:6, textAlign:"center" }}>{label}</div>}
    <div style={{ background:"#0d1117", border:`2px solid ${borderColor||"#21262d"}`, borderRadius:8, overflow:"hidden", boxShadow:glow?"0 0 20px rgba(59,130,246,0.15),0 8px 32px rgba(0,0,0,0.4)":"0 8px 32px rgba(0,0,0,0.3)", position:"relative" }}>{children}</div>
    {sublabel && <div style={{ fontFamily:F.m, fontSize:9, color:"#4b5563", letterSpacing:"0.1em", marginTop:6, textAlign:"center" }}>{sublabel}</div>}
  </div>);
}

export default function IntroTab() {
  const [v,setV]=useState(false); useEffect(()=>{setV(true);},[]);
  return (
    <div style={{ minHeight:"100vh", background:"#0a0e14", color:"#e5e7eb", fontFamily:F.b, opacity:v?1:0, transition:"opacity 0.5s" }}>
      <div style={{ background:"linear-gradient(180deg,#0d1117,#0a0e14)", borderBottom:"1px solid #21262d", padding:"28px 32px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:12, marginBottom:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#16a34a", boxShadow:"0 0 8px #16a34a", animation:"pulse 2s infinite" }} />
          <span style={{ fontFamily:F.m, fontSize:10, color:"#4ade80", letterSpacing:"0.2em", fontWeight:700 }}>CLASSIFICATION: CUI // UNCLASSIFIED — FOUO</span>
        </div>
        <h1 style={{ fontFamily:F.h, fontSize:"clamp(28px,5vw,44px)", fontWeight:700, color:"#f3f4f6", letterSpacing:"0.06em", margin:0 }}>sUAS PROGRAM OVERVIEW</h1>
        <p style={{ fontFamily:F.m, fontSize:12, color:"#6b7280", margin:"10px 0 0", letterSpacing:"0.08em" }}>ORGANIZATIONAL STRUCTURE & CAPABILITY DELIVERY FRAMEWORK</p>
      </div>
      <div style={{ maxWidth:800, margin:"48px auto", padding:"0 24px" }}>
        {/* GOFO */}
        <Layer label="DECISION AUTHORITY" borderColor="#3b82f6" delay={0.1} glow>
          <div style={{ padding:"28px 24px", textAlign:"center", background:"radial-gradient(ellipse at center,rgba(59,130,246,0.08),transparent 70%)" }}>
            <div style={{ fontFamily:F.m, fontSize:10, color:"#3b82f6", letterSpacing:"0.2em", marginBottom:6, fontWeight:700 }}>★ ★ ★</div>
            <div style={{ fontFamily:F.h, fontSize:42, fontWeight:700, color:"#e5e7eb", letterSpacing:"0.1em", lineHeight:1 }}>GOFO</div>
            <div style={{ fontFamily:F.m, fontSize:11, color:"#6b7280", letterSpacing:"0.12em", marginTop:8 }}>GENERAL OFFICER / FLAG OFFICER</div>
            <div style={{ fontFamily:F.b, fontSize:13, color:"#9ca3af", marginTop:12, maxWidth:500, margin:"12px auto 0", lineHeight:1.5 }}>Program authority, resource allocation, and strategic direction for sUAS capability fielding</div>
          </div>
        </Layer>
        <Connector delay={0.3} />

        {/* C2 / P2 / I2 / FC */}
        <Layer label="FUNCTIONAL PILLARS" borderColor="#60a5fa" delay={0.4} glow>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
            {[{code:"C2",title:"COMMAND & CONTROL",desc:"Operational authority and decision-making chains",accent:"#ef4444"},
              {code:"P2",title:"PLANS & PROGRAMS",desc:"Strategic planning, roadmaps, and acquisition milestones",accent:"#f59e0b"},
              {code:"I2",title:"INTEL & INFO",desc:"Threat intelligence, target development, and info ops",accent:"#10b981"},
              {code:"FC",title:"FIRES & COORD",desc:"Joint fires coordination and airspace deconfliction",accent:"#8b5cf6"},
            ].map((p,i)=>(
              <div key={p.code} style={{ padding:"24px 16px", textAlign:"center", borderRight:i<3?"1px solid #21262d":"none", background:`radial-gradient(ellipse at center bottom,${p.accent}08,transparent 70%)` }}>
                <div style={{ fontFamily:F.m, fontSize:11, color:p.accent, letterSpacing:"0.15em", marginBottom:6, fontWeight:700 }}>◆</div>
                <div style={{ fontFamily:F.h, fontSize:36, fontWeight:700, color:"#e5e7eb", letterSpacing:"0.08em", lineHeight:1 }}>{p.code}</div>
                <div style={{ fontFamily:F.m, fontSize:8, color:"#6b7280", letterSpacing:"0.15em", marginTop:8, lineHeight:1.4 }}>{p.title}</div>
                <div style={{ fontFamily:F.b, fontSize:11, color:"#4b5563", marginTop:10, lineHeight:1.4 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </Layer>
        <Connector delay={0.6} />

        {/* CAPES + STATUS */}
        <Layer label="CAPABILITY & STATUS TRACKING" borderColor="#10b981" delay={0.7}>
          <div style={{ padding:24, background:"linear-gradient(135deg,rgba(16,185,129,0.04),transparent)" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:F.h, fontSize:32, fontWeight:700, color:"#e5e7eb", letterSpacing:"0.08em" }}>CAPES + STATUS</div>
              <div style={{ fontFamily:F.m, fontSize:10, color:"#10b981", letterSpacing:"0.15em", marginTop:8, fontWeight:700 }}>CAPABILITY ASSESSMENTS & READINESS POSTURE</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:20 }}>
              {[{l:"BLUE sUAS / NDAA",d:"Compliance verification & approved systems list"},
                {l:"MUA / TECH ASSESS",d:"Military utility & technical readiness evaluations"},
                {l:"CENTCOM AOR",d:"Theater-specific fielding & ruggedization status"},
              ].map(x=>(
                <div key={x.l} style={{ padding:14, background:"#161b22", border:"1px solid #21262d", borderRadius:6, textAlign:"center" }}>
                  <div style={{ fontFamily:F.m, fontSize:10, color:"#10b981", letterSpacing:"0.1em", fontWeight:700, marginBottom:6 }}>{x.l}</div>
                  <div style={{ fontFamily:F.b, fontSize:11, color:"#6b7280", lineHeight:1.4 }}>{x.d}</div>
                </div>
              ))}
            </div>
          </div>
        </Layer>
        <Connector delay={0.9} />

        {/* VENDORS */}
        <Layer label="INDUSTRY BASE" borderColor="#f59e0b" delay={1.0} sublabel="DoW CONTRACT VEHICLES • FUNDED PROGRAMS • WARFIGHTER DELIVERY">
          <div style={{ padding:24, background:"linear-gradient(135deg,rgba(245,158,11,0.04),transparent)" }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontFamily:F.h, fontSize:32, fontWeight:700, color:"#e5e7eb", letterSpacing:"0.08em" }}>VENDORS</div>
              <div style={{ fontFamily:F.m, fontSize:10, color:"#f59e0b", letterSpacing:"0.15em", marginTop:8, fontWeight:700 }}>DEFENSE INDUSTRIAL BASE — CONTRACTED PROVIDERS</div>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:8 }}>
              {["AeroVironment","Anduril Industries","Raytheon / RTX","Lockheed Martin","L3Harris","SAIC","Northrop Grumman","SRC Inc.","D-Fend Solutions","Flex Force","Dedrone (Axon)","Aevex Aerospace","AFRL / Leidos"].map(v=>(
                <span key={v} style={{ padding:"5px 12px", background:"#161b22", border:"1px solid #21262d", borderRadius:4, fontFamily:F.m, fontSize:10, color:"#9ca3af", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{v}</span>
              ))}
            </div>
          </div>
        </Layer>
      </div>
      <div style={{ textAlign:"center", padding:"0 24px 48px", fontFamily:F.m, fontSize:10, color:"#4b5563", letterSpacing:"0.1em" }}>USE TABS ABOVE TO ACCESS CAPABILITY DASHBOARD, PROCESS STATUS, AND IDEA INTAKE</div>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
