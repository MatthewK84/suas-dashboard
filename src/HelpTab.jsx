import { useState, useEffect, useCallback } from "react";
const F = { h:"'Oswald','Bebas Neue','Impact',sans-serif", m:"'JetBrains Mono','Fira Code','Consolas',monospace", b:"'IBM Plex Sans','Segoe UI',sans-serif" };
const API_BASE = "";
const REQ_TYPES = [
  { id:"format", label:"Format / Layout Change", desc:"Adjust how data is displayed, column widths, color coding" },
  { id:"content", label:"Content / Data Update", desc:"Add, remove, or correct platform data, vendor info, or compliance status" },
  { id:"feature", label:"New Feature Request", desc:"Request a new capability, tab, filter, or workflow" },
  { id:"access", label:"Access / Permissions", desc:"Request admin access, vendor assignment, or role changes" },
  { id:"bug", label:"Bug Report", desc:"Report something broken or not functioning as expected" },
  { id:"other", label:"Other", desc:"General inquiry or request not covered above" },
];
const PRI = { low:{bg:"#0d3320",br:"#16a34a",c:"#4ade80",l:"LOW"}, medium:{bg:"#3b2e10",br:"#ca8a04",c:"#facc15",l:"MED"}, high:{bg:"#3b1318",br:"#dc2626",c:"#f87171",l:"HIGH"} };
const STAT = { new:{c:"#60a5fa",l:"NEW"}, acknowledged:{c:"#facc15",l:"ACKNOWLEDGED"}, in_progress:{c:"#c084fc",l:"IN PROGRESS"}, completed:{c:"#16a34a",l:"COMPLETED"}, declined:{c:"#ef4444",l:"DECLINED"} };
function fmtD(iso){if(!iso)return"";const d=new Date(iso);return d.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" "+d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false});}

export default function HelpTab() {
  const [requests,setRequests]=useState([]); const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false); const [success,setSuccess]=useState(false);
  const [name,setName]=useState(""); const [org,setOrg]=useState(""); const [reqType,setReqType]=useState("");
  const [tabRef,setTabRef]=useState(""); const [title,setTitle]=useState(""); const [desc,setDesc]=useState(""); const [pri,setPri]=useState("medium");
  const [expId,setExpId]=useState(null);
  const isAdmin = !!sessionStorage.getItem("adminPin");

  const fetchData = useCallback(async()=>{
    try { const r=await fetch(`${API_BASE}/api/help`); if(r.ok){const d=await r.json();setRequests(d.requests||[]);}} catch(e){console.error(e);}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{fetchData();},[fetchData]);

  async function handleSubmit(){
    if(!name.trim()||!title.trim()||!desc.trim()||!reqType) return;
    try {
      const r=await fetch(`${API_BASE}/api/help`,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name:name.trim(),org:org.trim(),reqType,tabRef,title:title.trim(),description:desc.trim(),priority:pri})});
      const item=await r.json();
      if(item.id){setRequests(p=>[item,...p]);setName("");setOrg("");setReqType("");setTabRef("");setTitle("");setDesc("");setPri("medium");setSuccess(true);setTimeout(()=>setSuccess(false),3000);setShowForm(false);}
    }catch(e){console.error(e);}
  }

  async function handleStatus(id,status){
    const pin=sessionStorage.getItem("adminPin");
    try{await fetch(`${API_BASE}/api/help/${id}/status`,{method:"PUT",headers:{"Content-Type":"application/json","X-Admin-Pin":pin||""},body:JSON.stringify({status,pin})});setRequests(p=>p.map(r=>r.id===id?{...r,status}:r));}catch(e){console.error(e);}
  }

  const inp={width:"100%",padding:"8px 12px",background:"#161b22",border:"1px solid #30363d",borderRadius:4,color:"#e5e7eb",fontFamily:F.m,fontSize:12,outline:"none"};
  const lbl={fontFamily:F.m,fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.12em",marginBottom:4,display:"block"};

  return (
    <div style={{minHeight:"100vh",background:"#0a0e14",color:"#e5e7eb",fontFamily:F.b}}>
      <div style={{background:"linear-gradient(180deg,#0d1117,#0a0e14)",borderBottom:"1px solid #21262d",padding:"20px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div>
          <h1 style={{fontFamily:F.h,fontSize:"clamp(22px,4vw,32px)",fontWeight:700,color:"#f3f4f6",letterSpacing:"0.05em",margin:0}}>HELP — ADJUST TOOL</h1>
          <p style={{fontFamily:F.m,fontSize:11,color:"#6b7280",margin:"4px 0 0",letterSpacing:"0.05em"}}>SUBMIT FORMAT, CONTENT, OR FEATURE CHANGE REQUESTS TO TOOL OWNERS</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:F.m,fontSize:10,color:"#4b5563"}}>{requests.length} REQUEST{requests.length!==1?"S":""}</span>
          <button onClick={()=>setShowForm(!showForm)} style={{padding:"8px 20px",fontFamily:F.m,fontSize:11,fontWeight:700,letterSpacing:"0.1em",background:showForm?"#3b1318":"#1e3a5f",border:`1px solid ${showForm?"#dc2626":"#3b82f6"}`,color:showForm?"#f87171":"#93c5fd",borderRadius:4,cursor:"pointer"}}>{showForm?"✕ CANCEL":"+ SUBMIT REQUEST"}</button>
        </div>
      </div>
      <div style={{padding:"24px 32px"}}>
        {success&&<div style={{padding:"10px 20px",background:"#0d3320",border:"1px solid #16a34a",borderRadius:6,marginBottom:16,fontFamily:F.m,fontSize:11,color:"#4ade80"}}>✓ REQUEST SUBMITTED — TOOL OWNERS WILL BE NOTIFIED</div>}

        {/* PROCESS INFO */}
        <div style={{background:"#0d1117",border:"1px solid #21262d",borderRadius:6,padding:"16px 20px",marginBottom:20}}>
          <div style={{fontFamily:F.m,fontSize:10,fontWeight:700,color:"#60a5fa",letterSpacing:"0.15em",marginBottom:10}}>HOW IT WORKS</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {[{n:"1",t:"SUBMIT",d:"Fill out the request form with your change details"},{n:"2",t:"ROUTED",d:"Request is routed to the tool owner team"},{n:"3",t:"REVIEW",d:"Tool owners review feasibility and prioritize"},{n:"4",t:"IMPLEMENTED",d:"Changes are made and you are notified"}].map(s=>(
              <div key={s.n} style={{padding:12,background:"#161b22",border:"1px solid #21262d",borderRadius:6,textAlign:"center"}}>
                <div style={{fontFamily:F.h,fontSize:24,fontWeight:700,color:"#60a5fa",marginBottom:4}}>{s.n}</div>
                <div style={{fontFamily:F.m,fontSize:10,fontWeight:700,color:"#e5e7eb",letterSpacing:"0.08em",marginBottom:4}}>{s.t}</div>
                <div style={{fontFamily:F.b,fontSize:11,color:"#6b7280",lineHeight:1.4}}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FORM */}
        {showForm&&<div style={{background:"#0d1117",border:"1px solid #3b82f6",borderRadius:6,padding:24,marginBottom:24,boxShadow:"0 0 20px rgba(59,130,246,0.08)"}}>
          <div style={{fontFamily:F.m,fontSize:10,fontWeight:700,color:"#60a5fa",letterSpacing:"0.15em",marginBottom:16}}>NEW CHANGE REQUEST</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={lbl}>YOUR NAME / RANK</label><input type="text" value={name} onChange={e=>setName(e.target.value)} style={inp}/></div>
            <div><label style={lbl}>ORGANIZATION / UNIT</label><input type="text" value={org} onChange={e=>setOrg(e.target.value)} style={inp}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={lbl}>REQUEST TYPE</label><select value={reqType} onChange={e=>setReqType(e.target.value)} style={inp}><option value="">Select type...</option>{REQ_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
            <div><label style={lbl}>AFFECTED TAB (OPTIONAL)</label><select value={tabRef} onChange={e=>setTabRef(e.target.value)} style={inp}><option value="">Any / General</option>{["COTS COP","Rapid Fielding","Process Status","Acquisition","Roadmap","Idea Intake"].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
          </div>
          <div style={{marginBottom:12}}><label style={lbl}>TITLE</label><input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Brief description of the change" style={inp}/></div>
          <div style={{marginBottom:12}}><label style={lbl}>DETAILED DESCRIPTION</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} placeholder="What should change? Why? Include any references..." style={{...inp,resize:"vertical",lineHeight:1.5}}/></div>
          <div style={{marginBottom:16}}><label style={lbl}>PRIORITY</label><div style={{display:"flex",gap:6}}>{Object.entries(PRI).map(([k,v])=>(<button key={k} onClick={()=>setPri(k)} style={{flex:1,padding:8,fontFamily:F.m,fontSize:10,fontWeight:700,background:pri===k?v.bg:"#161b22",border:`1px solid ${pri===k?v.br:"#30363d"}`,color:pri===k?v.c:"#6b7280",borderRadius:4,cursor:"pointer"}}>{v.l}</button>))}</div></div>
          <button onClick={handleSubmit} disabled={!name.trim()||!title.trim()||!desc.trim()||!reqType} style={{padding:"10px 28px",fontFamily:F.m,fontSize:12,fontWeight:700,letterSpacing:"0.1em",background:"#1e3a5f",border:"1px solid #3b82f6",color:"#93c5fd",borderRadius:4,cursor:"pointer",opacity:(!name.trim()||!title.trim()||!desc.trim()||!reqType)?0.4:1}}>SUBMIT REQUEST →</button>
        </div>}

        {/* REQUEST LIST */}
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {requests.length===0&&!loading&&<div style={{padding:"48px 20px",textAlign:"center",background:"#0d1117",border:"1px solid #21262d",borderRadius:6}}>
            <div style={{fontFamily:F.h,fontSize:20,color:"#4b5563",marginBottom:8}}>NO REQUESTS YET</div>
            <div style={{fontFamily:F.m,fontSize:11,color:"#4b5563"}}>Use SUBMIT REQUEST to send a change to the tool owners.</div>
          </div>}
          {requests.map(req=>{
            const st=STAT[req.status]||STAT.new; const pr=PRI[req.priority]||PRI.medium;
            const rt=REQ_TYPES.find(t=>t.id===req.reqType);
            const expanded=expId===req.id;
            return (
              <div key={req.id} style={{background:"#0d1117",border:"1px solid #21262d",borderRadius:6,overflow:"hidden"}}>
                <div onClick={()=>setExpId(expanded?null:req.id)} style={{padding:"14px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,borderBottom:expanded?"1px solid #21262d":"none"}}>
                  <span style={{padding:"2px 8px",fontSize:9,fontWeight:700,fontFamily:F.m,background:pr.bg,border:`1px solid ${pr.br}`,color:pr.c,borderRadius:3}}>{pr.l}</span>
                  <span style={{padding:"2px 8px",fontSize:9,fontWeight:700,fontFamily:F.m,background:"#161b22",border:"1px solid #30363d",color:st.c,borderRadius:3}}>{st.l}</span>
                  {rt&&<span style={{padding:"2px 8px",fontSize:9,fontFamily:F.m,background:"#1e2a3b",border:"1px solid #3b82f640",color:"#60a5fa",borderRadius:3}}>{rt.label.toUpperCase()}</span>}
                  <div style={{flex:1,fontFamily:F.h,fontSize:15,fontWeight:600,color:"#f3f4f6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{req.title}</div>
                  <span style={{fontFamily:F.m,fontSize:9,color:"#4b5563"}}>{req.name}</span>
                  <span style={{fontFamily:F.m,fontSize:9,color:"#4b5563"}}>{fmtD(req.createdAt)}</span>
                  <span style={{fontFamily:"monospace",fontSize:12,color:"#6b7280",transform:expanded?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>▼</span>
                </div>
                {expanded&&<div style={{padding:"16px 20px"}}>
                  <p style={{fontFamily:F.b,fontSize:13,color:"#d1d5db",lineHeight:1.6,margin:"0 0 12px"}}>{req.description}</p>
                  {req.tabRef&&<div style={{fontFamily:F.m,fontSize:10,color:"#6b7280",marginBottom:12}}>AFFECTED TAB: <span style={{color:"#60a5fa"}}>{req.tabRef}</span></div>}
                  {req.org&&<div style={{fontFamily:F.m,fontSize:10,color:"#6b7280",marginBottom:12}}>ORGANIZATION: <span style={{color:"#9ca3af"}}>{req.org}</span></div>}
                  {isAdmin&&<div style={{display:"flex",gap:6,flexWrap:"wrap",padding:10,background:"#161b22",borderRadius:4,border:"1px solid #21262d"}}>
                    <span style={{fontFamily:F.m,fontSize:9,color:"#6b7280",alignSelf:"center",marginRight:4}}>SET STATUS:</span>
                    {Object.entries(STAT).map(([k,v])=>(<button key={k} onClick={()=>handleStatus(req.id,k)} style={{padding:"3px 10px",fontSize:9,fontWeight:700,fontFamily:F.m,background:req.status===k?"#1e3a5f":"#0d1117",border:`1px solid ${req.status===k?v.c:"#30363d"}`,color:req.status===k?v.c:"#6b7280",borderRadius:3,cursor:"pointer"}}>{v.l}</button>))}
                  </div>}
                </div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
