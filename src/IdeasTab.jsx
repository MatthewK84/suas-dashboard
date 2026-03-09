import { useState, useEffect, useCallback } from "react";
const F = { h:"'Oswald','Bebas Neue','Impact',sans-serif", m:"'JetBrains Mono','Fira Code','Consolas',monospace", b:"'IBM Plex Sans','Segoe UI',sans-serif" };

const PRI = { low:{bg:"#0d3320",br:"#16a34a",c:"#4ade80",l:"LOW"}, medium:{bg:"#3b2e10",br:"#ca8a04",c:"#facc15",l:"MED"}, high:{bg:"#3b1318",br:"#dc2626",c:"#f87171",l:"HIGH"} };
const STAT = { new:{c:"#60a5fa",l:"NEW"}, under_review:{c:"#facc15",l:"UNDER REVIEW"}, approved:{c:"#4ade80",l:"APPROVED"}, in_progress:{c:"#c084fc",l:"IN PROGRESS"}, completed:{c:"#16a34a",l:"COMPLETED"}, declined:{c:"#ef4444",l:"DECLINED"} };
function fmtD(iso) { if(!iso) return ""; const d=new Date(iso); return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+" "+d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false}); }

function IdeaCard({ idea, subgroups, isAdmin, onStatus, onComment, expanded, onToggle }) {
  const [ct,setCt]=useState(""); const [ca,setCa]=useState("");
  const p=PRI[idea.priority]||PRI.medium; const s=STAT[idea.status]||STAT.new; const sg=subgroups.find(x=>x.id===idea.subgroupId);
  const post=()=>{ if(!ct.trim()||!ca.trim()) return; onComment(idea.id,ca.trim(),ct.trim()); setCt(""); setCa(""); };
  return (
    <div style={{background:"#0d1117",border:"1px solid #21262d",borderRadius:6,overflow:"hidden"}}>
      <div onClick={onToggle} style={{padding:"14px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,borderBottom:expanded?"1px solid #21262d":"none"}}>
        <span style={{padding:"2px 8px",fontSize:9,fontWeight:700,fontFamily:F.m,letterSpacing:"0.08em",background:p.bg,border:`1px solid ${p.br}`,color:p.c,borderRadius:3,flexShrink:0}}>{p.l}</span>
        <span style={{padding:"2px 8px",fontSize:9,fontWeight:700,fontFamily:F.m,letterSpacing:"0.08em",background:"#161b22",border:"1px solid #30363d",color:s.c,borderRadius:3,flexShrink:0}}>{s.l}</span>
        <div style={{flex:1,minWidth:0}}><div style={{fontFamily:F.h,fontSize:15,fontWeight:600,color:"#f3f4f6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{idea.title}</div></div>
        {sg&&<span style={{padding:"2px 8px",fontSize:9,fontWeight:700,fontFamily:F.m,background:"#1e2a3b",border:"1px solid #3b82f640",color:"#60a5fa",borderRadius:3,flexShrink:0}}>→ {sg.name.toUpperCase()}</span>}
        <span style={{fontFamily:F.m,fontSize:9,color:"#4b5563",flexShrink:0}}>{idea.submitter}</span>
        <span style={{fontFamily:F.m,fontSize:9,color:"#4b5563",flexShrink:0}}>{fmtD(idea.createdAt)}</span>
        {idea.comments?.length>0&&<span style={{fontFamily:F.m,fontSize:9,color:"#6b7280",background:"#161b22",border:"1px solid #21262d",padding:"2px 6px",borderRadius:3}}>{idea.comments.length} 💬</span>}
        <span style={{fontFamily:"monospace",fontSize:12,color:"#6b7280",transform:expanded?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>▼</span>
      </div>
      {expanded&&<div style={{padding:"16px 20px"}}>
        <p style={{fontFamily:F.b,fontSize:13,color:"#d1d5db",lineHeight:1.6,margin:"0 0 16px"}}>{idea.description}</p>
        {isAdmin&&<div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap",padding:10,background:"#161b22",borderRadius:4,border:"1px solid #21262d"}}>
          <span style={{fontFamily:F.m,fontSize:9,color:"#6b7280",letterSpacing:"0.1em",alignSelf:"center",marginRight:4}}>SET STATUS:</span>
          {Object.entries(STAT).map(([k,v])=>(<button key={k} onClick={()=>onStatus(idea.id,k)} style={{padding:"3px 10px",fontSize:9,fontWeight:700,fontFamily:F.m,background:idea.status===k?"#1e3a5f":"#0d1117",border:`1px solid ${idea.status===k?v.c:"#30363d"}`,color:idea.status===k?v.c:"#6b7280",borderRadius:3,cursor:"pointer"}}>{v.l}</button>))}
        </div>}
        {idea.comments?.length>0&&<div style={{marginBottom:12}}>
          <div style={{fontFamily:F.m,fontSize:9,color:"#6b7280",letterSpacing:"0.12em",marginBottom:8,fontWeight:700}}>COMMENTS</div>
          {idea.comments.map(c=>(<div key={c.id} style={{padding:"8px 12px",background:"#161b22",border:"1px solid #21262d",borderRadius:4,marginBottom:4}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:F.m,fontSize:10,color:"#60a5fa",fontWeight:700}}>{c.author}</span><span style={{fontFamily:F.m,fontSize:9,color:"#4b5563"}}>{fmtD(c.createdAt)}</span></div>
            <p style={{fontFamily:F.b,fontSize:12,color:"#d1d5db",margin:0,lineHeight:1.4}}>{c.text}</p></div>))}
        </div>}
        <div style={{display:"flex",gap:6,alignItems:"flex-start"}}>
          <input type="text" placeholder="Your name" value={ca} onChange={e=>setCa(e.target.value)} style={{padding:"6px 10px",background:"#161b22",border:"1px solid #30363d",borderRadius:4,color:"#e5e7eb",fontFamily:F.m,fontSize:11,outline:"none",width:120}} />
          <input type="text" placeholder="Add a comment..." value={ct} onChange={e=>setCt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&post()} style={{flex:1,padding:"6px 10px",background:"#161b22",border:"1px solid #30363d",borderRadius:4,color:"#e5e7eb",fontFamily:F.m,fontSize:11,outline:"none"}} />
          <button onClick={post} style={{padding:"6px 14px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:4,color:"#93c5fd",fontFamily:F.m,fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>POST</button>
        </div>
      </div>}
    </div>);
}

export default function IdeasTab() {
  const [ideas,setIdeas]=useState([]); const [sgs,setSgs]=useState([]); const [loading,setLoading]=useState(true);
  const [expId,setExpId]=useState(null); const [isAdmin,setIsAdmin]=useState(false);
  const [title,setTitle]=useState(""); const [desc,setDesc]=useState(""); const [sub,setSub]=useState(""); const [sgId,setSgId]=useState(""); const [pri,setPri]=useState("medium");
  const [showForm,setShowForm]=useState(false); const [success,setSuccess]=useState(false);
  const [fSg,setFSg]=useState("ALL"); const [fSt,setFSt]=useState("ALL");

  const fetch2 = useCallback(async()=>{ try { const r=await fetch("/api/ideas"); const d=await r.json(); setIdeas(d.ideas||[]); setSgs(d.subgroups||[]); } catch(e){console.error(e);} finally{setLoading(false);} },[]);
  useEffect(()=>{fetch2();},[fetch2]);
  useEffect(()=>{if(sessionStorage.getItem("adminPin"))setIsAdmin(true);},[]);

  async function handleSubmit() {
    if(!title.trim()||!desc.trim()||!sub.trim()||!sgId) return;
    try { const r=await fetch("/api/ideas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:title.trim(),description:desc.trim(),submitter:sub.trim(),subgroupId:sgId,priority:pri})}); const i=await r.json(); setIdeas(p=>[i,...p]); setTitle("");setDesc("");setSub("");setSgId("");setPri("medium");setSuccess(true);setTimeout(()=>setSuccess(false),3000);setShowForm(false); } catch(e){console.error(e);}
  }
  async function handleStatus(id,st) { const pin=sessionStorage.getItem("adminPin"); try { await fetch(`/api/ideas/${id}/status`,{method:"PUT",headers:{"Content-Type":"application/json","X-Admin-Pin":pin||""},body:JSON.stringify({status:st,pin})}); setIdeas(p=>p.map(i=>i.id===id?{...i,status:st}:i)); } catch(e){console.error(e);} }
  async function handleComment(id,author,text) { try { const r=await fetch(`/api/ideas/${id}/comments`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({author,text})}); const u=await r.json(); setIdeas(p=>p.map(i=>i.id===id?u:i)); } catch(e){console.error(e);} }

  const filtered = ideas.filter(i=>{ if(fSg!=="ALL"&&i.subgroupId!==fSg) return false; if(fSt!=="ALL"&&i.status!==fSt) return false; return true; });
  const inp = { width:"100%",padding:"8px 12px",background:"#161b22",border:"1px solid #30363d",borderRadius:4,color:"#e5e7eb",fontFamily:F.m,fontSize:12,outline:"none" };
  const lbl = { fontFamily:F.m,fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.12em",marginBottom:4,display:"block" };
  const bt = (a)=>({padding:"5px 12px",fontSize:10,fontWeight:700,fontFamily:F.m,letterSpacing:"0.08em",border:a?"1px solid #60a5fa":"1px solid #30363d",background:a?"#1e3a5f":"#161b22",color:a?"#93c5fd":"#6b7280",borderRadius:4,cursor:"pointer"});

  if(loading) return <div style={{minHeight:"100vh",background:"#0a0e14",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:F.m,fontSize:12,color:"#6b7280",letterSpacing:"0.2em"}}>LOADING IDEAS...</div></div>;

  return (
    <div style={{minHeight:"100vh",background:"#0a0e14",color:"#e5e7eb",fontFamily:F.b}}>
      <div style={{background:"linear-gradient(180deg,#0d1117,#0a0e14)",borderBottom:"1px solid #21262d",padding:"20px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div><h1 style={{fontFamily:F.h,fontSize:"clamp(22px,4vw,32px)",fontWeight:700,color:"#f3f4f6",letterSpacing:"0.05em",margin:0}}>IDEA INTAKE</h1>
          <p style={{fontFamily:F.m,fontSize:11,color:"#6b7280",margin:"4px 0 0",letterSpacing:"0.05em"}}>SUBMIT AND ROUTE IDEAS TO FUNCTIONAL SUBGROUPS</p></div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:F.m,fontSize:10,color:"#4b5563"}}>{ideas.length} IDEA{ideas.length!==1?"S":""} SUBMITTED</span>
          <button onClick={()=>setShowForm(!showForm)} style={{padding:"8px 20px",fontFamily:F.m,fontSize:11,fontWeight:700,letterSpacing:"0.1em",background:showForm?"#3b1318":"#1e3a5f",border:`1px solid ${showForm?"#dc2626":"#3b82f6"}`,color:showForm?"#f87171":"#93c5fd",borderRadius:4,cursor:"pointer"}}>{showForm?"✕ CANCEL":"+ SUBMIT IDEA"}</button>
        </div></div>
      <div style={{padding:"24px 32px"}}>
        {success&&<div style={{padding:"10px 20px",background:"#0d3320",border:"1px solid #16a34a",borderRadius:6,marginBottom:16,fontFamily:F.m,fontSize:11,color:"#4ade80",letterSpacing:"0.08em"}}>✓ IDEA SUBMITTED SUCCESSFULLY</div>}
        {showForm&&<div style={{background:"#0d1117",border:"1px solid #3b82f6",borderRadius:6,padding:24,marginBottom:24,boxShadow:"0 0 20px rgba(59,130,246,0.08)"}}>
          <div style={{fontFamily:F.m,fontSize:10,fontWeight:700,color:"#60a5fa",letterSpacing:"0.15em",marginBottom:16}}>NEW IDEA SUBMISSION</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={lbl}>YOUR NAME</label><input type="text" value={sub} onChange={e=>setSub(e.target.value)} placeholder="Name / Rank" style={inp} /></div>
            <div><label style={lbl}>IDEA TITLE</label><input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Brief title" style={inp} /></div></div>
          <div style={{marginBottom:12}}><label style={lbl}>DESCRIPTION</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe the idea, expected impact..." rows={4} style={{...inp,resize:"vertical",lineHeight:1.5}} /></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div><label style={lbl}>ROUTE TO SUBGROUP</label><select value={sgId} onChange={e=>setSgId(e.target.value)} style={inp}><option value="">Select subgroup...</option>{sgs.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label style={lbl}>PRIORITY</label><div style={{display:"flex",gap:6,marginTop:2}}>
              {Object.entries(PRI).map(([k,v])=>(<button key={k} onClick={()=>setPri(k)} style={{flex:1,padding:8,fontFamily:F.m,fontSize:10,fontWeight:700,letterSpacing:"0.08em",background:pri===k?v.bg:"#161b22",border:`1px solid ${pri===k?v.br:"#30363d"}`,color:pri===k?v.c:"#6b7280",borderRadius:4,cursor:"pointer"}}>{v.l}</button>))}
            </div></div></div>
          <button onClick={handleSubmit} disabled={!title.trim()||!desc.trim()||!sub.trim()||!sgId} style={{padding:"10px 28px",fontFamily:F.m,fontSize:12,fontWeight:700,letterSpacing:"0.1em",background:"#1e3a5f",border:"1px solid #3b82f6",color:"#93c5fd",borderRadius:4,cursor:"pointer",opacity:(!title.trim()||!desc.trim()||!sub.trim()||!sgId)?0.4:1}}>SUBMIT IDEA →</button>
        </div>}

        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:16,padding:"12px 16px",background:"#0d1117",border:"1px solid #21262d",borderRadius:6}}>
          <span style={{fontFamily:F.m,fontSize:10,color:"#6b7280",letterSpacing:"0.12em"}}>SUBGROUP</span>
          <button style={bt(fSg==="ALL")} onClick={()=>setFSg("ALL")}>ALL</button>
          {sgs.map(s=><button key={s.id} style={bt(fSg===s.id)} onClick={()=>setFSg(s.id)}>{s.name.toUpperCase()}</button>)}
          <span style={{width:1,height:16,background:"#30363d"}} />
          <span style={{fontFamily:F.m,fontSize:10,color:"#6b7280",letterSpacing:"0.12em"}}>STATUS</span>
          <button style={bt(fSt==="ALL")} onClick={()=>setFSt("ALL")}>ALL</button>
          {Object.entries(STAT).map(([k,v])=><button key={k} style={bt(fSt===k)} onClick={()=>setFSt(k)}>{v.l}</button>)}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {filtered.length===0&&<div style={{padding:"48px 20px",textAlign:"center",background:"#0d1117",border:"1px solid #21262d",borderRadius:6}}>
            <div style={{fontFamily:F.h,fontSize:20,color:"#4b5563",marginBottom:8}}>{ideas.length===0?"NO IDEAS YET":"NO MATCHING IDEAS"}</div>
            <div style={{fontFamily:F.m,fontSize:11,color:"#4b5563"}}>{ideas.length===0?"Use the SUBMIT IDEA button above.":"Try adjusting filters."}</div></div>}
          {filtered.map(i=><IdeaCard key={i.id} idea={i} subgroups={sgs} isAdmin={isAdmin} expanded={expId===i.id} onToggle={()=>setExpId(expId===i.id?null:i.id)} onStatus={handleStatus} onComment={handleComment} />)}
        </div>
      </div>
    </div>);
}
