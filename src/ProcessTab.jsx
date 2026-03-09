import { useState, useEffect, useCallback } from "react";

const F = {
  h: "'Oswald','Bebas Neue','Impact',sans-serif",
  m: "'JetBrains Mono','Fira Code','Consolas',monospace",
  b: "'IBM Plex Sans','Segoe UI',sans-serif",
};
const SC = {
  red:    { bg:"#3b1318", border:"#dc2626", glow:"#dc2626", fill:"#ef4444", label:"NOT STARTED" },
  yellow: { bg:"#3b2e10", border:"#ca8a04", glow:"#ca8a04", fill:"#facc15", label:"IN PROGRESS" },
  green:  { bg:"#0d3320", border:"#16a34a", glow:"#16a34a", fill:"#4ade80", label:"COMPLETE" },
};
const CYCLE = ["red","yellow","green"];

function Light({ status, size=40, clickable=false, onClick }) {
  const c = SC[status] || SC.red;
  return (
    <div onClick={clickable ? onClick : undefined}
      style={{
        width:size, height:size, borderRadius:"50%",
        background:`radial-gradient(circle at 35% 35%, ${c.fill}dd, ${c.fill}88 60%, ${c.fill}44)`,
        border:`2px solid ${c.border}`,
        boxShadow:`0 0 ${size/3}px ${c.glow}60, inset 0 -2px 4px rgba(0,0,0,0.3)`,
        cursor:clickable?"pointer":"default", transition:"all 0.25s ease", flexShrink:0,
      }}
      onMouseEnter={e=>{ if(clickable) e.currentTarget.style.transform="scale(1.15)"; }}
      onMouseLeave={e=>{ if(clickable) e.currentTarget.style.transform="scale(1)"; }}
      title={clickable?"Click to cycle":c.label}
    />
  );
}

function GateCard({ gate, isAdmin, admins, vendorId, onStatus, onAssign }) {
  const c = SC[gate.status] || SC.red;
  const admin = admins.find(a => a.id === gate.assignedAdmin);
  const cycle = () => { const next = CYCLE[(CYCLE.indexOf(gate.status)+1)%3]; onStatus(vendorId, gate.id, next); };
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", gap:10,
      padding:"16px 12px", background:"#0d1117", border:`1px solid ${c.border}30`,
      borderRadius:8, minWidth:100, flex:"1 1 100px", boxShadow:`0 0 12px ${c.glow}10`,
    }}>
      <Light status={gate.status} size={44} clickable={isAdmin} onClick={cycle} />
      <div style={{ fontFamily:F.h, fontSize:16, fontWeight:700, color:"#e5e7eb", letterSpacing:"0.04em", textAlign:"center" }}>{gate.short}</div>
      <div style={{ fontFamily:F.m, fontSize:8, color:"#6b7280", letterSpacing:"0.1em", textAlign:"center", lineHeight:1.3, textTransform:"uppercase" }}>{gate.label}</div>
      <div style={{ fontFamily:F.m, fontSize:9, fontWeight:700, color:c.fill, letterSpacing:"0.08em" }}>{c.label}</div>
      {isAdmin && (
        <select value={gate.assignedAdmin||""} onChange={e=>onAssign(vendorId,gate.id,e.target.value)}
          style={{ width:"100%", padding:"3px 4px", fontSize:9, fontFamily:F.m, background:"#161b22", color:"#9ca3af", border:"1px solid #30363d", borderRadius:3, outline:"none", cursor:"pointer" }}>
          <option value="">Unassigned</option>
          {admins.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      )}
      {!isAdmin && admin && <div style={{ fontFamily:F.m, fontSize:9, color:"#4b5563" }}>{admin.name}</div>}
    </div>
  );
}

function VendorChip({ vendor, selected, onClick }) {
  const gates = vendor.processItems || [];
  const g = gates.filter(x=>x.status==="green").length;
  const y = gates.filter(x=>x.status==="yellow").length;
  const r = gates.filter(x=>x.status==="red").length;
  const pct = gates.length > 0 ? Math.round((g/gates.length)*100) : 0;
  return (
    <div onClick={onClick} style={{
      padding:"10px 14px", cursor:"pointer",
      background: selected ? "#161b22" : "transparent",
      borderLeft: selected ? "3px solid #60a5fa" : "3px solid transparent",
      borderBottom:"1px solid #21262d", transition:"all 0.15s ease",
    }}
      onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background="#0d1117"; }}
      onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background="transparent"; }}
    >
      <div style={{ fontFamily:F.b, fontSize:13, fontWeight:600, color:selected?"#e5e7eb":"#9ca3af", marginBottom:6, lineHeight:1.2 }}>{vendor.name}</div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ display:"flex", gap:4 }}>
          {[{n:g,c:"#4ade80"},{n:y,c:"#facc15"},{n:r,c:"#ef4444"}].map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:2 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:s.c }} />
              <span style={{ fontFamily:F.m, fontSize:9, color:s.c }}>{s.n}</span>
            </div>
          ))}
        </div>
        <div style={{ flex:1, height:4, background:"#1a1f2e", borderRadius:2, overflow:"hidden" }}>
          <div style={{ width:`${pct}%`, height:"100%", background:pct===100?"#16a34a":pct>0?"#ca8a04":"#dc2626", borderRadius:2, transition:"width 0.4s ease" }} />
        </div>
        <span style={{ fontFamily:F.m, fontSize:9, fontWeight:700, color:pct===100?"#4ade80":"#6b7280" }}>{pct}%</span>
      </div>
    </div>
  );
}

function AdminPanel({ admins, onAdd, onRemove }) {
  const [name,setName]=useState(""); const [role,setRole]=useState("");
  const add = () => { if(!name.trim()) return; onAdd(name.trim(),role.trim()); setName(""); setRole(""); };
  return (
    <div style={{ background:"#0d1117", border:"1px solid #21262d", borderRadius:6, padding:"16px 20px", marginBottom:20 }}>
      <div style={{ fontFamily:F.m, fontSize:10, fontWeight:700, color:"#60a5fa", letterSpacing:"0.15em", marginBottom:12 }}>ADMIN MANAGEMENT</div>
      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:12 }}>
        <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
          style={{ padding:"6px 10px", background:"#161b22", border:"1px solid #30363d", borderRadius:4, color:"#e5e7eb", fontFamily:F.m, fontSize:11, outline:"none", flex:1, minWidth:120 }} />
        <input type="text" placeholder="Role (optional)" value={role} onChange={e=>setRole(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
          style={{ padding:"6px 10px", background:"#161b22", border:"1px solid #30363d", borderRadius:4, color:"#e5e7eb", fontFamily:F.m, fontSize:11, outline:"none", flex:1, minWidth:120 }} />
        <button onClick={add} style={{ padding:"6px 16px", background:"#1e3a5f", border:"1px solid #3b82f6", borderRadius:4, color:"#93c5fd", fontFamily:F.m, fontSize:10, fontWeight:700, letterSpacing:"0.1em", cursor:"pointer" }}>+ ADD</button>
      </div>
      {admins.length>0 && <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {admins.map(a => (
          <div key={a.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 10px", background:"#161b22", border:"1px solid #21262d", borderRadius:4 }}>
            <span style={{ fontFamily:F.m, fontSize:11, color:"#d1d5db" }}>{a.name}</span>
            {a.role && <span style={{ fontFamily:F.m, fontSize:9, color:"#6b7280" }}>({a.role})</span>}
            <button onClick={()=>onRemove(a.id)} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:14, padding:"0 2px", fontFamily:"monospace" }}>×</button>
          </div>
        ))}
      </div>}
    </div>
  );
}

export default function ProcessTab() {
  const [vendors,setVendors] = useState([]);
  const [admins,setAdmins] = useState([]);
  const [selId,setSelId] = useState(null);
  const [isAdmin,setIsAdmin] = useState(false);
  const [pin,setPin] = useState("");
  const [showPin,setShowPin] = useState(false);
  const [pinErr,setPinErr] = useState(false);
  const [loading,setLoading] = useState(true);
  const [newVendor,setNewVendor] = useState("");
  const [showAddV,setShowAddV] = useState(false);
  const [vSearch,setVSearch] = useState("");

  const getPin = () => sessionStorage.getItem("adminPin") || "";

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/vendors");
      const data = await res.json();
      setVendors(data.vendors || []);
      setAdmins(data.admins || []);
      if (!selId && data.vendors?.length > 0) setSelId(data.vendors[0].id);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (sessionStorage.getItem("adminPin")) setIsAdmin(true); }, []);

  async function loginWithPin() {
    try {
      const res = await fetch("/api/auth/verify", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({pin}) });
      const d = await res.json();
      if (d.valid) { sessionStorage.setItem("adminPin",pin); setIsAdmin(true); setShowPin(false); setPin(""); setPinErr(false); }
      else setPinErr(true);
    } catch { setPinErr(true); }
  }

  async function handleStatus(vendorId, gateId, status) {
    setVendors(prev => prev.map(v => v.id!==vendorId ? v : {...v, processItems:v.processItems.map(g=>g.id===gateId?{...g,status}:g)}));
    try { await fetch(`/api/vendors/${vendorId}/gates/${gateId}/status`, { method:"PUT", headers:{"Content-Type":"application/json","X-Admin-Pin":getPin()}, body:JSON.stringify({status,pin:getPin()}) }); }
    catch { fetchData(); }
  }

  async function handleAssign(vendorId, gateId, adminId) {
    setVendors(prev => prev.map(v => v.id!==vendorId ? v : {...v, processItems:v.processItems.map(g=>g.id===gateId?{...g,assignedAdmin:adminId}:g)}));
    try { await fetch(`/api/vendors/${vendorId}/gates/${gateId}/admin`, { method:"PUT", headers:{"Content-Type":"application/json","X-Admin-Pin":getPin()}, body:JSON.stringify({assignedAdmin:adminId,pin:getPin()}) }); }
    catch { fetchData(); }
  }

  async function handleAddAdmin(name,role) {
    try { const r=await fetch("/api/admins",{method:"POST",headers:{"Content-Type":"application/json","X-Admin-Pin":getPin()},body:JSON.stringify({name,role,pin:getPin()})}); const a=await r.json(); if(a.id) setAdmins(p=>[...p,a]); } catch(e){console.error(e);}
  }
  async function handleRemoveAdmin(id) {
    try { await fetch(`/api/admins/${id}`,{method:"DELETE",headers:{"X-Admin-Pin":getPin(),"Content-Type":"application/json"},body:JSON.stringify({pin:getPin()})}); setAdmins(p=>p.filter(a=>a.id!==id)); } catch(e){console.error(e);}
  }

  async function handleAddVendor() {
    if(!newVendor.trim()) return;
    try {
      const r=await fetch("/api/vendors",{method:"POST",headers:{"Content-Type":"application/json","X-Admin-Pin":getPin()},body:JSON.stringify({name:newVendor.trim(),pin:getPin()})});
      const v=await r.json();
      if(v.id) { setVendors(p=>[...p,v]); setSelId(v.id); setNewVendor(""); setShowAddV(false); }
    } catch(e){console.error(e);}
  }

  async function handleDeleteVendor(vid) {
    if(!confirm("Remove this vendor and all process data?")) return;
    try {
      await fetch(`/api/vendors/${vid}`,{method:"DELETE",headers:{"X-Admin-Pin":getPin(),"Content-Type":"application/json"},body:JSON.stringify({pin:getPin()})});
      setVendors(p=>p.filter(v=>v.id!==vid));
      if(selId===vid) setSelId(vendors.find(v=>v.id!==vid)?.id||null);
    } catch(e){console.error(e);}
  }

  const sel = vendors.find(v=>v.id===selId);
  const core = sel?.processItems?.filter(g=>g.group==="core") || [];
  const otti = sel?.processItems?.filter(g=>g.group==="otti") || [];
  const ops = sel?.processItems?.filter(g=>g.group==="ops") || [];
  const allG = vendors.flatMap(v=>v.processItems||[]);
  const tG=allG.filter(g=>g.status==="green").length, tY=allG.filter(g=>g.status==="yellow").length, tR=allG.filter(g=>g.status==="red").length;
  const filtV = vSearch ? vendors.filter(v=>v.name.toLowerCase().includes(vSearch.toLowerCase())) : vendors;

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0a0e14", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:F.m, fontSize:12, color:"#6b7280", letterSpacing:"0.2em" }}>LOADING PROCESS DATA...</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0a0e14", color:"#e5e7eb", fontFamily:F.b }}>
      {/* HEADER */}
      <div style={{ background:"linear-gradient(180deg,#0d1117,#0a0e14)", borderBottom:"1px solid #21262d", padding:"20px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
        <div>
          <h1 style={{ fontFamily:F.h, fontSize:"clamp(22px,4vw,32px)", fontWeight:700, color:"#f3f4f6", letterSpacing:"0.05em", margin:0 }}>PROCESS STATUS DASHBOARD</h1>
          <p style={{ fontFamily:F.m, fontSize:11, color:"#6b7280", margin:"4px 0 0", letterSpacing:"0.05em" }}>PER-VENDOR FIELDING WORKFLOW — {vendors.length} VENDOR{vendors.length!==1?"S":""} TRACKED</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {[{s:"green",n:tG},{s:"yellow",n:tY},{s:"red",n:tR}].map(x=>(
              <div key={x.s} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <Light status={x.s} size={16} />
                <span style={{ fontFamily:F.h, fontSize:18, fontWeight:700, color:SC[x.s].fill }}>{x.n}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>isAdmin?(setIsAdmin(false),sessionStorage.removeItem("adminPin")):setShowPin(true)}
            style={{ padding:"6px 14px", fontSize:10, fontWeight:700, fontFamily:F.m, letterSpacing:"0.1em",
              border:isAdmin?"1px solid #16a34a":"1px solid #30363d", background:isAdmin?"#0d3320":"#161b22",
              color:isAdmin?"#4ade80":"#6b7280", borderRadius:4, cursor:"pointer" }}>
            {isAdmin?"🔓 ADMIN MODE":"🔒 ADMIN LOGIN"}
          </button>
        </div>
      </div>

      {/* MAIN: SIDEBAR + CONTENT */}
      <div style={{ display:"flex", minHeight:"calc(100vh - 80px)" }}>
        {/* SIDEBAR */}
        <div style={{ width:280, flexShrink:0, background:"#0d1117", borderRight:"1px solid #21262d", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"12px 14px", borderBottom:"1px solid #21262d" }}>
            <div style={{ fontFamily:F.m, fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.15em", marginBottom:8 }}>VENDORS ({vendors.length})</div>
            <input type="text" placeholder="Search vendors..." value={vSearch} onChange={e=>setVSearch(e.target.value)}
              style={{ width:"100%", padding:"6px 10px", background:"#161b22", border:"1px solid #30363d", borderRadius:4, color:"#e5e7eb", fontFamily:F.m, fontSize:10, outline:"none" }} />
          </div>
          <div style={{ flex:1, overflowY:"auto" }}>
            {filtV.map(v => <VendorChip key={v.id} vendor={v} selected={v.id===selId} onClick={()=>setSelId(v.id)} />)}
            {filtV.length===0 && <div style={{ padding:"20px 14px", textAlign:"center", fontFamily:F.m, fontSize:10, color:"#4b5563" }}>NO VENDORS MATCH</div>}
          </div>
          {isAdmin && (
            <div style={{ padding:"12px 14px", borderTop:"1px solid #21262d" }}>
              {showAddV ? (
                <div style={{ display:"flex", gap:6 }}>
                  <input type="text" placeholder="Vendor name..." value={newVendor} onChange={e=>setNewVendor(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&handleAddVendor()} autoFocus
                    style={{ flex:1, padding:"6px 8px", background:"#161b22", border:"1px solid #30363d", borderRadius:4, color:"#e5e7eb", fontFamily:F.m, fontSize:10, outline:"none" }} />
                  <button onClick={handleAddVendor} style={{ padding:"6px 10px", background:"#1e3a5f", border:"1px solid #3b82f6", borderRadius:4, color:"#93c5fd", fontFamily:F.m, fontSize:10, fontWeight:700, cursor:"pointer" }}>ADD</button>
                  <button onClick={()=>{setShowAddV(false);setNewVendor("");}} style={{ padding:"6px 8px", background:"#161b22", border:"1px solid #30363d", borderRadius:4, color:"#6b7280", fontFamily:"monospace", fontSize:12, cursor:"pointer" }}>✕</button>
                </div>
              ) : (
                <button onClick={()=>setShowAddV(true)} style={{ width:"100%", padding:8, background:"#161b22", border:"1px dashed #30363d", borderRadius:4, color:"#6b7280", fontFamily:F.m, fontSize:10, fontWeight:700, letterSpacing:"0.1em", cursor:"pointer" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#3b82f6";e.currentTarget.style.color="#93c5fd";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#30363d";e.currentTarget.style.color="#6b7280";}}>
                  + ADD VENDOR
                </button>
              )}
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div style={{ flex:1, padding:"24px 32px", overflowY:"auto" }}>
          {isAdmin && <AdminPanel admins={admins} onAdd={handleAddAdmin} onRemove={handleRemoveAdmin} />}

          {sel ? (<>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <h2 style={{ fontFamily:F.h, fontSize:26, fontWeight:700, color:"#f3f4f6", letterSpacing:"0.04em", margin:0 }}>{sel.name}</h2>
                <div style={{ fontFamily:F.m, fontSize:10, color:"#6b7280", marginTop:4, letterSpacing:"0.08em" }}>
                  {(sel.processItems||[]).filter(g=>g.status==="green").length} / {(sel.processItems||[]).length} GATES COMPLETE
                </div>
              </div>
              {isAdmin && (
                <button onClick={()=>handleDeleteVendor(sel.id)} style={{ padding:"6px 14px", fontSize:10, fontWeight:700, fontFamily:F.m, letterSpacing:"0.1em", border:"1px solid #dc262660", background:"#3b131810", color:"#f87171", borderRadius:4, cursor:"pointer" }}>
                  DELETE VENDOR
                </button>
              )}
            </div>

            {/* LEGEND */}
            <div style={{ display:"flex", gap:24, marginBottom:20, padding:"10px 16px", background:"#0d1117", border:"1px solid #21262d", borderRadius:6, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ fontFamily:F.m, fontSize:10, color:"#6b7280", letterSpacing:"0.12em" }}>LEGEND</span>
              {Object.entries(SC).map(([k,v])=>(
                <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <Light status={k} size={14} /><span style={{ fontFamily:F.m, fontSize:10, color:v.fill, letterSpacing:"0.08em" }}>{v.label}</span>
                </div>
              ))}
              {isAdmin && <><span style={{ width:1, height:16, background:"#30363d" }} /><span style={{ fontFamily:F.m, fontSize:10, color:"#60a5fa", letterSpacing:"0.08em" }}>CLICK INDICATORS TO CYCLE STATUS</span></>}
            </div>

            {/* CORE GATES */}
            <div style={{ fontFamily:F.m, fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.15em", marginBottom:10 }}>FIELDING PROCESS GATES</div>
            <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
              {core.map(g=><GateCard key={g.id} gate={g} isAdmin={isAdmin} admins={admins} vendorId={sel.id} onStatus={handleStatus} onAssign={handleAssign} />)}
            </div>

            {/* OTTI */}
            <div style={{ background:"#0d1117", border:"2px solid #8b5cf6", borderRadius:8, padding:20, marginBottom:24, boxShadow:"0 0 16px rgba(139,92,246,0.08)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ fontFamily:F.h, fontSize:20, fontWeight:700, color:"#c4b5fd", letterSpacing:"0.08em" }}>OTTI</div>
                <div style={{ fontFamily:F.m, fontSize:9, color:"#8b5cf6", letterSpacing:"0.15em", fontWeight:700, padding:"3px 10px", background:"#1e1533", border:"1px solid #8b5cf640", borderRadius:3 }}>OPERATIONAL TEST & TACTICAL INTEGRATION</div>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {otti.map(g=><GateCard key={g.id} gate={g} isAdmin={isAdmin} admins={admins} vendorId={sel.id} onStatus={handleStatus} onAssign={handleAssign} />)}
              </div>
            </div>

            {/* OPS */}
            <div style={{ fontFamily:F.m, fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.15em", marginBottom:10 }}>OPERATIONS & COORDINATION</div>
            <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
              {ops.map(g=><GateCard key={g.id} gate={g} isAdmin={isAdmin} admins={admins} vendorId={sel.id} onStatus={handleStatus} onAssign={handleAssign} />)}
            </div>

            {/* FLOW VIEW */}
            <div style={{ background:"#0d1117", border:"1px solid #21262d", borderRadius:6, padding:20 }}>
              <div style={{ fontFamily:F.m, fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.15em", marginBottom:16 }}>
                {sel.name.toUpperCase()} — FULL PROCESS FLOW
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4, overflowX:"auto", padding:"8px 0" }}>
                {(sel.processItems||[]).map((gate,idx,arr)=>{
                  const c=SC[gate.status]; const isOS=gate.id==="otti_mf"; const isOE=gate.id==="otti_eval";
                  return (
                    <div key={gate.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                      {isOS && <div style={{ fontFamily:F.m, fontSize:8, color:"#8b5cf6", letterSpacing:"0.1em", marginRight:4, writingMode:"vertical-rl", textOrientation:"mixed", fontWeight:700 }}>OTTI</div>}
                      <div style={{
                        display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                        padding:gate.group==="otti"?"8px 6px":"0 6px",
                        background:gate.group==="otti"?"#8b5cf608":"transparent",
                        borderTop:gate.group==="otti"?"1px solid #8b5cf630":"none",
                        borderBottom:gate.group==="otti"?"1px solid #8b5cf630":"none",
                        borderLeft:isOS?"1px solid #8b5cf630":"none",
                        borderRight:isOE?"1px solid #8b5cf630":"none",
                        borderRadius:isOS?"4px 0 0 4px":isOE?"0 4px 4px 0":"0",
                      }}>
                        <Light status={gate.status} size={20} clickable={isAdmin}
                          onClick={()=>handleStatus(sel.id,gate.id,CYCLE[(CYCLE.indexOf(gate.status)+1)%3])} />
                        <span style={{ fontFamily:F.m, fontSize:8, fontWeight:700, color:c.fill, letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{gate.short}</span>
                      </div>
                      {idx<arr.length-1 && (
                        <div style={{ width:isOE||gate.group!==arr[idx+1]?.group?20:12, height:2,
                          background:isOE||gate.group!==arr[idx+1]?.group?"#30363d":`linear-gradient(90deg,${c.fill}80,${SC[arr[idx+1]?.status]?.fill||"#666"}80)` }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:F.h, fontSize:24, color:"#4b5563", marginBottom:8 }}>SELECT A VENDOR</div>
                <div style={{ fontFamily:F.m, fontSize:11, color:"#4b5563" }}>Choose a vendor from the sidebar to view their process status</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PIN MODAL */}
      {showPin && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
          onClick={()=>setShowPin(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#0d1117", border:"1px solid #30363d", borderRadius:8, padding:32, width:340, textAlign:"center", boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ fontFamily:F.h, fontSize:20, fontWeight:700, color:"#e5e7eb", letterSpacing:"0.05em", marginBottom:4 }}>ADMIN ACCESS</div>
            <div style={{ fontFamily:F.m, fontSize:10, color:"#6b7280", letterSpacing:"0.1em", marginBottom:12 }}>ENTER ADMIN PIN TO MODIFY STATUS</div>
            <div style={{ fontFamily:F.m, fontSize:9, color:"#4b5563", marginBottom:12, padding:8, background:"#161b22", border:"1px solid #21262d", borderRadius:4, textAlign:"left", lineHeight:1.5 }}>
              The admin PIN is set via the <span style={{color:"#60a5fa"}}>ADMIN_PIN</span> environment variable on Railway. Default: <span style={{color:"#facc15"}}>1234</span>. Shared by all admins.
            </div>
            <input type="password" placeholder="PIN" value={pin} onChange={e=>{setPin(e.target.value);setPinErr(false);}}
              onKeyDown={e=>e.key==="Enter"&&loginWithPin()} autoFocus
              style={{ width:"100%", padding:10, fontSize:18, fontFamily:F.m, textAlign:"center", letterSpacing:"0.3em", background:"#161b22", border:`1px solid ${pinErr?"#dc2626":"#30363d"}`, borderRadius:4, color:"#e5e7eb", outline:"none", marginBottom:8 }} />
            {pinErr && <div style={{ fontFamily:F.m, fontSize:10, color:"#ef4444", marginBottom:8 }}>INVALID PIN</div>}
            <button onClick={loginWithPin} style={{ width:"100%", padding:10, fontFamily:F.m, fontSize:12, fontWeight:700, letterSpacing:"0.1em", background:"#1e3a5f", border:"1px solid #3b82f6", borderRadius:4, color:"#93c5fd", cursor:"pointer", marginTop:4 }}>AUTHENTICATE</button>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
