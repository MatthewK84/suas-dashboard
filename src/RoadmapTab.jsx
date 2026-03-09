const F = { h:"'Oswald','Bebas Neue','Impact',sans-serif", m:"'JetBrains Mono','Fira Code','Consolas',monospace", b:"'IBM Plex Sans','Segoe UI',sans-serif" };

const PHASES = ["AS-IS","CUOPS","FUOPS","RESOURCING","INTEGRATION","ASSESSMENT"];
const PILLARS = [
  { title:"CONNECT THE FORCE", bg:"linear-gradient(180deg,#1e40af,#1d4ed8)", color:"#1d4ed8", icons:["\u{1F4E1}","\u{1F6F0}\uFE0F"], desc:"C4ISR, SATCOM, tactical data links, mesh networks" },
  { title:"PROTECT THE FORCE", bg:"linear-gradient(180deg,#991b1b,#dc2626)", color:"#dc2626", icons:["\u{1F6E1}\uFE0F","\u2708\uFE0F"], desc:"C-sUAS, force protection, EW, base defense" },
  { title:"ISR", bg:"linear-gradient(180deg,#166534,#16a34a)", color:"#16a34a", icons:["\u{1F50D}","\u{1F4CD}"], desc:"Intelligence, surveillance, reconnaissance, targeting" },
  { title:"FIRES", bg:"linear-gradient(180deg,#c2410c,#ea580c)", color:"#ea580c", icons:["\u{1F3AF}","\u{1F4A5}"], desc:"Precision strike, loitering munitions, effects coordination" },
];
const PIPELINE = [
  { label:"NEED", c:"#1d4ed8" },{ label:"DECISION", c:"#2563eb" },{ label:"RESOURCED", c:"#16a34a" },
  { label:"CONTRACT", c:"#ca8a04" },{ label:"DELIVERY", c:"#ea580c" },{ label:"OPERATIONAL", c:"#dc2626" },
];
const COMPONENTS = [
  { branch:"NUMBERED ARMY", icon:"\u2694\uFE0F", desc:"Ground maneuver, fires, air defense", color:"#2d5016" },
  { branch:"NUMBERED AIR FORCE", icon:"\u2708\uFE0F", desc:"Air superiority, ISR, mobility, strike", color:"#1e3a5f" },
  { branch:"NUMBERED NAVY", icon:"\u2693", desc:"Maritime domain, naval fires, sea control", color:"#1e3a5f" },
];

function Arrow({ color }) {
  return (<div style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
    <div style={{ width:20, height:3, background:color||"#f59e0b" }} />
    <div style={{ width:0, height:0, borderTop:"7px solid transparent", borderBottom:"7px solid transparent", borderLeft:`10px solid ${color||"#f59e0b"}` }} />
  </div>);
}

export default function RoadmapTab() {
  return (
    <div style={{ minHeight:"100vh", position:"relative", overflow:"hidden", background:"linear-gradient(160deg, #1a1025 0%, #1e1530 15%, #1a1228 30%, #16182a 50%, #0f1a30 70%, #0a1628 100%)", fontFamily:F.b }}>
      {/* Flag stripes top/bottom */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg, #dc2626 0%, #dc2626 33%, #ffffff 33%, #ffffff 50%, #1d4ed8 50%, #1d4ed8 100%)" }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4, background:"linear-gradient(90deg, #dc2626 0%, #dc2626 33%, #ffffff 33%, #ffffff 50%, #1d4ed8 50%, #1d4ed8 100%)" }} />
      {/* Atmospheric glows */}
      <div style={{ position:"absolute", top:"5%", right:"10%", width:400, height:400, background:"radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)", borderRadius:"50%" }} />
      <div style={{ position:"absolute", bottom:"15%", left:"5%", width:350, height:350, background:"radial-gradient(circle, rgba(29,78,216,0.06) 0%, transparent 70%)", borderRadius:"50%" }} />

      <div style={{ position:"relative", zIndex:1, padding:"40px 40px", maxWidth:1100, margin:"0 auto" }}>

        {/* TITLE */}
        <div style={{ textAlign:"center", marginBottom:10 }}>
          <div style={{ fontFamily:F.m, fontSize:10, color:"#f59e0b", letterSpacing:"0.3em", marginBottom:6 }}>&#9733; &#9733; &#9733;</div>
          <h1 style={{ fontFamily:F.h, fontSize:"clamp(26px,4vw,44px)", fontWeight:700, color:"#ffffff", letterSpacing:"0.05em", margin:0, lineHeight:1.1, textShadow:"0 2px 16px rgba(245,158,11,0.2)" }}>
            REJTF Roadmap to Full Operational Capability (FOC)
          </h1>
        </div>

        {/* PHASE FLOW */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, padding:"16px 0", marginBottom:28, flexWrap:"wrap" }}>
          {PHASES.map((p,i)=>(
            <div key={p} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ padding:"8px 20px", background:"linear-gradient(180deg, rgba(30,58,95,0.9), rgba(15,30,60,0.9))", border:"1px solid rgba(59,130,246,0.3)", borderRadius:4, fontFamily:F.h, fontSize:15, fontWeight:700, color:"#93c5fd", letterSpacing:"0.08em", boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>{p}</div>
              {i<PHASES.length-1 && <Arrow color="#60a5fa" />}
            </div>
          ))}
        </div>

        {/* FOUR PILLARS */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12, marginBottom:32 }}>
          {PILLARS.map(p=>(
            <div key={p.title} style={{ background:p.bg, borderRadius:8, border:`1px solid ${p.color}80`, overflow:"hidden", boxShadow:`0 4px 24px ${p.color}20`, transition:"transform 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
              <div style={{ padding:"16px 14px 12px", textAlign:"center", borderBottom:`1px solid ${p.color}60` }}>
                <div style={{ fontFamily:F.h, fontSize:16, fontWeight:700, color:"#ffffff", letterSpacing:"0.06em", textShadow:"0 1px 4px rgba(0,0,0,0.4)" }}>{p.title}</div>
              </div>
              <div style={{ padding:"20px 14px", textAlign:"center", background:`linear-gradient(180deg, transparent, ${p.color}15)` }}>
                <div style={{ fontSize:40, marginBottom:10, display:"flex", justifyContent:"center", gap:12 }}>{p.icons.map((ic,i)=><span key={i}>{ic}</span>)}</div>
                <div style={{ fontFamily:F.b, fontSize:11, color:"rgba(255,255,255,0.75)", lineHeight:1.4 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CAPABILITY PIPELINE */}
        <div style={{ textAlign:"center", marginBottom:12 }}>
          <div style={{ display:"inline-block", padding:"6px 20px", background:"rgba(30,58,95,0.6)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:4, fontFamily:F.h, fontSize:18, fontWeight:700, color:"#fde68a", letterSpacing:"0.1em" }}>CAPABILITY PIPELINE</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, padding:"12px 0", marginBottom:32, flexWrap:"wrap" }}>
          {PIPELINE.map((s,i)=>(
            <div key={s.label} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ padding:"10px 24px", background:`linear-gradient(180deg, ${s.c}ee, ${s.c}bb)`, fontFamily:F.h, fontSize:14, fontWeight:700, color:"#ffffff", letterSpacing:"0.06em", borderRadius:i===0?"6px 0 0 6px":i===PIPELINE.length-1?"0 6px 6px 0":"0", boxShadow:`0 2px 8px ${s.c}40`, textShadow:"0 1px 3px rgba(0,0,0,0.4)" }}>{s.label}</div>
              {i<PIPELINE.length-1 && <div style={{ width:0, height:0, borderTop:"20px solid transparent", borderBottom:"20px solid transparent", borderLeft:`14px solid ${s.c}bb` }} />}
            </div>
          ))}
          <div style={{ marginLeft:4 }}><Arrow color="#dc2626" /></div>
        </div>

        {/* COMPONENT EXECUTION */}
        <div style={{ textAlign:"center", marginBottom:14 }}>
          <div style={{ display:"inline-block", padding:"6px 20px", background:"rgba(30,58,95,0.6)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:4, fontFamily:F.h, fontSize:18, fontWeight:700, color:"#fde68a", letterSpacing:"0.1em" }}>COMPONENT EXECUTION</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14, marginBottom:32 }}>
          {COMPONENTS.map(c=>(
            <div key={c.branch} style={{ background:"rgba(13,17,23,0.7)", backdropFilter:"blur(8px)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:8, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }}>
              <div style={{ padding:"24px 16px 16px", textAlign:"center", background:`linear-gradient(180deg, ${c.color}30, transparent)` }}>
                <div style={{ fontSize:48, marginBottom:10 }}>{c.icon}</div>
              </div>
              <div style={{ padding:"0 16px 16px", textAlign:"center" }}>
                <div style={{ fontFamily:F.h, fontSize:16, fontWeight:700, color:"#ffffff", letterSpacing:"0.06em", marginBottom:6 }}>{c.branch}</div>
                <div style={{ fontFamily:F.b, fontSize:11, color:"#9ca3af", lineHeight:1.4 }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
