import { useState, useEffect, useCallback } from "react";
const F={h:"'Oswald','Bebas Neue','Impact',sans-serif",m:"'JetBrains Mono','Fira Code','Consolas',monospace",b:"'IBM Plex Sans','Segoe UI',sans-serif"};
const COLS=["Facilities","Manpower","Equipment","Data","RFI / Intel","Status"];
const ROWS=["Operational Need / CCMD Demand","RFI / Market Research","COTS / GOTS Identification","Rapid Prototyping","Middle Tier Rapid Fielding","Contract Vehicle Selection","Funding Alignment (O&M)","Testing","Training","Standardization","Evaluation","Production / Procurement","Deployment to CENTCOM AOR","Operational Feedback"];
const CY=["none","red","yellow","green"];
const SC={none:{fill:"#30363d",border:"#21262d"},red:{fill:"#ef4444",border:"#dc2626"},yellow:{fill:"#facc15",border:"#ca8a04"},green:{fill:"#4ade80",border:"#16a34a"}};

function Cell({status="none",clickable=false,onClick}){
  const c=SC[status]||SC.none;const size=24;
  return(<div onClick={clickable?onClick:undefined} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 0",cursor:clickable?"pointer":"default"}}>
    <div style={{width:size,height:size,borderRadius:"50%",background:status==="none"?"transparent":`radial-gradient(circle at 35% 35%,${c.fill}dd,${c.fill}88 60%,${c.fill}44)`,border:`2px solid ${c.border}`,transition:"all 0.2s",opacity:status==="none"?0.3:1}} onMouseEnter={e=>{if(clickable)e.currentTarget.style.transform="scale(1.2)";}} onMouseLeave={e=>{if(clickable)e.currentTarget.style.transform="scale(1)";}}/>
  </div>);
}

export default function AcquisitionTab(){
  const [vendors,setVendors]=useState([]);const [selId,setSelId]=useState(null);const [loading,setLoading]=useState(true);const [vSearch,setVSearch]=useState("");
  const isAdmin=!!sessionStorage.getItem("adminPin");

  const fetchData=useCallback(async()=>{try{const r=await fetch("/api/vendors");const d=await r.json();setVendors(d.vendors||[]);if(!selId&&d.vendors?.length>0)setSelId(d.vendors[0].id);}catch(e){console.error(e);}finally{setLoading(false);}},[]);
  useEffect(()=>{fetchData();},[fetchData]);

  // Store DOTMLPF-P matrix per vendor in local state (keyed by vendorId)
  // Each vendor gets a matrix: { [rowIdx]: { [colIdx]: "none"|"red"|"yellow"|"green" } }
  const [matrices,setMatrices]=useState(()=>{try{return JSON.parse(localStorage.getItem("acqMatrix")||"{}}");}catch{return{};}});
  function saveMatrices(m){setMatrices(m);localStorage.setItem("acqMatrix",JSON.stringify(m));}
  function getCellStatus(vid,ri,ci){return matrices[vid]?.[ri]?.[ci]||"none";}
  function cycleCell(vid,ri,ci){const cur=getCellStatus(vid,ri,ci);const next=CY[(CY.indexOf(cur)+1)%CY.length];const m={...matrices};if(!m[vid])m[vid]={};if(!m[vid][ri])m[vid][ri]={};m[vid][ri][ci]=next;saveMatrices(m);}
  function setAllCells(vid,status){const m={...matrices};m[vid]={};for(let ri=0;ri<ROWS.length;ri++){m[vid][ri]={};for(let ci=0;ci<COLS.length;ci++)m[vid][ri][ci]=status;}saveMatrices(m);}

  const sel=vendors.find(v=>v.id===selId);
  const filtV=vSearch?vendors.filter(v=>v.name.toLowerCase().includes(vSearch.toLowerCase())):vendors;
  function vendorPct(vid){if(!matrices[vid])return 0;let g=0,t=ROWS.length*COLS.length;for(let ri=0;ri<ROWS.length;ri++)for(let ci=0;ci<COLS.length;ci++)if(matrices[vid]?.[ri]?.[ci]==="green")g++;return Math.round((g/t)*100);}

  if(loading)return(<div style={{minHeight:"100vh",background:"#0a0e14",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:F.m,fontSize:12,color:"#6b7280"}}>LOADING...</div></div>);

  return(
    <div style={{minHeight:"100vh",background:"#0a0e14",color:"#e5e7eb",fontFamily:F.b}}>
      <div style={{background:"linear-gradient(180deg,#0d1117,#0a0e14)",borderBottom:"1px solid #21262d",padding:"20px 32px"}}>
        <h1 style={{fontFamily:F.h,fontSize:"clamp(20px,3.5vw,30px)",fontWeight:700,color:"#f3f4f6",margin:0}}>DOTMLPF-P COMPLIANCE MATRIX — PER VENDOR</h1>
        <p style={{fontFamily:F.m,fontSize:11,color:"#6b7280",margin:"4px 0 0"}}>COTS/GOTS RAPID ACQUISITION TRACKER</p>
      </div>
      <div style={{display:"flex",minHeight:"calc(100vh - 80px)"}}>
        {/* SIDEBAR */}
        <div style={{width:220,flexShrink:0,background:"#0d1117",borderRight:"1px solid #21262d",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"12px 14px",borderBottom:"1px solid #21262d"}}><input type="text" placeholder="Search vendors..." value={vSearch} onChange={e=>setVSearch(e.target.value)} style={{width:"100%",padding:"6px 10px",background:"#161b22",border:"1px solid #30363d",borderRadius:4,color:"#e5e7eb",fontFamily:F.m,fontSize:10,outline:"none"}}/></div>
          <div style={{flex:1,overflowY:"auto"}}>{filtV.map(v=>{const pct=vendorPct(v.id);return(
            <div key={v.id} onClick={()=>setSelId(v.id)} style={{padding:"10px 14px",cursor:"pointer",background:v.id===selId?"#161b22":"transparent",borderLeft:v.id===selId?"3px solid #60a5fa":"3px solid transparent",borderBottom:"1px solid #21262d"}} onMouseEnter={e=>{if(v.id!==selId)e.currentTarget.style.background="#0d1117";}} onMouseLeave={e=>{if(v.id!==selId)e.currentTarget.style.background="transparent";}}>
              <div style={{fontFamily:F.b,fontSize:12,fontWeight:600,color:v.id===selId?"#e5e7eb":"#9ca3af",marginBottom:4}}>{v.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{flex:1,height:4,background:"#1a1f2e",borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:pct===100?"#16a34a":pct>0?"#ca8a04":"#dc2626",borderRadius:2}}/></div><span style={{fontFamily:F.m,fontSize:9,color:"#6b7280"}}>{pct}%</span></div>
            </div>);})}</div>
        </div>
        {/* MATRIX */}
        <div style={{flex:1,padding:"20px 24px",overflowY:"auto"}}>
          {sel?(<>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:12}}>
              <h2 style={{fontFamily:F.h,fontSize:24,fontWeight:700,color:"#f3f4f6",margin:0}}>{sel.name}</h2>
              {isAdmin&&<div style={{display:"flex",gap:6}}>
                <button onClick={()=>setAllCells(sel.id,"green")} style={{padding:"4px 12px",fontSize:9,fontFamily:F.m,fontWeight:700,background:"#0d3320",border:"1px solid #16a34a",color:"#4ade80",borderRadius:3,cursor:"pointer"}}>✓ ALL</button>
                <button onClick={()=>setAllCells(sel.id,"none")} style={{padding:"4px 12px",fontSize:9,fontFamily:F.m,fontWeight:700,background:"#3b1318",border:"1px solid #dc2626",color:"#f87171",borderRadius:3,cursor:"pointer"}}>✕ CLEAR</button>
              </div>}
            </div>

            {/* Notices */}
            {sel.notices&&sel.notices.length>0&&<div style={{marginBottom:12}}>{sel.notices.map((n,i)=>(<div key={i} style={{padding:"8px 16px",background:"#facc15",color:"#000",fontFamily:F.b,fontSize:14,fontWeight:700,borderRadius:4,marginBottom:4}}>Notice – {n.text}</div>))}</div>}
            {sel.funding&&sel.funding.bpac&&<div style={{display:"flex",gap:12,marginBottom:12,padding:"8px 16px",background:"#0d1117",border:"1px solid #21262d",borderRadius:6}}><span style={{fontFamily:F.m,fontSize:10,color:"#6b7280"}}>BPAC: <span style={{color:"#e5e7eb"}}>{sel.funding.bpac}</span></span><span style={{fontFamily:F.m,fontSize:10,color:"#6b7280"}}>FY: <span style={{color:"#e5e7eb"}}>{sel.funding.fy}</span></span><span style={{fontFamily:F.m,fontSize:10,color:"#6b7280"}}>AMT: <span style={{color:"#4ade80"}}>{sel.funding.amount}</span></span></div>}

            {/* TABLE */}
            <div style={{background:"rgba(13,34,71,0.3)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:8,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:`260px repeat(${COLS.length},1fr)`,borderBottom:"2px solid rgba(59,130,246,0.3)"}}>
                <div style={{padding:"12px 16px",background:"rgba(30,58,95,0.8)",fontFamily:F.h,fontSize:13,fontWeight:700,color:"#93c5fd",borderRight:"1px solid rgba(59,130,246,0.2)"}}>Process</div>
                {COLS.map((col,i)=>(<div key={col} style={{padding:"12px 8px",textAlign:"center",background:"rgba(30,58,95,0.8)",fontFamily:F.h,fontSize:12,fontWeight:700,color:"#93c5fd",borderRight:i<COLS.length-1?"1px solid rgba(59,130,246,0.15)":"none"}}>{col}</div>))}
              </div>
              {ROWS.map((row,ri)=>(<div key={row} style={{display:"grid",gridTemplateColumns:`260px repeat(${COLS.length},1fr)`,borderBottom:ri<ROWS.length-1?"1px solid rgba(59,130,246,0.1)":"none",background:ri%2===0?"rgba(13,34,71,0.2)":"rgba(15,45,94,0.15)"}}>
                <div style={{padding:"10px 16px",fontFamily:F.h,fontSize:13,fontWeight:500,color:"#d1d5db",borderRight:"1px solid rgba(59,130,246,0.1)",display:"flex",alignItems:"center"}}>{row}</div>
                {COLS.map((col,ci)=>(<div key={ci} style={{borderRight:ci<COLS.length-1?"1px solid rgba(59,130,246,0.07)":"none"}}><Cell status={getCellStatus(sel.id,ri,ci)} clickable={isAdmin} onClick={()=>cycleCell(sel.id,ri,ci)}/></div>))}
              </div>))}
            </div>
            <div style={{textAlign:"center",marginTop:24,fontFamily:F.h,fontSize:16,fontWeight:600,color:"#d4d4d8",fontStyle:"italic"}}>O&M Funded — USAF SECAF / CENTCOM CCMD Operations</div>
          </>):(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh"}}><div style={{fontFamily:F.h,fontSize:24,color:"#4b5563"}}>SELECT A VENDOR</div></div>)}
        </div>
      </div>
    </div>);
}
