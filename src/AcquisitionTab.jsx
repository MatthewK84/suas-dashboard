import { useState, useEffect } from "react";
const F={h:"'Oswald','Bebas Neue','Impact',sans-serif",m:"'JetBrains Mono','Fira Code','Consolas',monospace",b:"'IBM Plex Sans','Segoe UI',sans-serif"};

const COLS=[{id:"facilities",l:"Facilities"},{id:"manpower",l:"Manpower"},{id:"equipment",l:"Equipment"},{id:"data",l:"Data"},{id:"rfiIntel",l:"RFI / Intel"},{id:"status",l:"Status"}];
const ROWS=[
  {id:"opNeed",l:"Operational Need / CCMD Demand"},{id:"rfiMarket",l:"RFI / Market Research"},
  {id:"cotsGots",l:"COTS / GOTS Identification"},{id:"rapidProto",l:"Rapid Prototyping"},
  {id:"midTier",l:"Middle Tier Rapid Fielding"},{id:"contractVehicle",l:"Contract Vehicle Selection"},
  {id:"fundingOm",l:"Funding Alignment (O&M)"},{id:"testing",l:"Testing"},
  {id:"training",l:"Training"},{id:"standardization",l:"Standardization"},
  {id:"evaluation",l:"Evaluation"},{id:"production",l:"Production / Procurement"},
  {id:"deployment",l:"Deployment to CENTCOM AOR"},{id:"opFeedback",l:"Operational Feedback"},
];
const VENDORS=["AeroVironment","Anduril Industries","Raytheon / RTX","Lockheed Martin","L3Harris / Textron","SAIC / Northrop Grumman","SRC Inc.","D-Fend Solutions","Flex Force Enterprises","Dedrone (Axon)","Aevex Aerospace","AFRL / Leidos","Applied Physical Sciences (General Dynamics)"];

function emptyM(){const m={};ROWS.forEach(r=>{m[r.id]={};COLS.forEach(c=>{m[r.id][c.id]=false;});});return m;}
function mkVendors(){return VENDORS.map(n=>({id:n.toLowerCase().replace(/[^a-z0-9]+/g,"-"),name:n,matrix:emptyM()}));}

function Check({on,click,edit}){
  return(<td onClick={edit?click:undefined} style={{textAlign:"center",padding:"10px 8px",cursor:edit?"pointer":"default"}}
    onMouseEnter={e=>{if(edit)e.currentTarget.style.background="rgba(59,130,246,0.08)";}}
    onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
    {on?<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#16a34a,#22c55e)",color:"#fff",fontSize:16,fontWeight:700,boxShadow:"0 0 10px rgba(34,197,94,0.4),0 2px 6px rgba(0,0,0,0.3)"}}>✓</span>
      :<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:"50%",border:"2px dashed #30363d",color:"#30363d",fontSize:11,opacity:edit?0.5:0.15}}>{edit?"+":""}</span>}
  </td>);
}

function VChip({v,sel,click}){
  const total=ROWS.length*COLS.length;
  const done=Object.values(v.matrix).reduce((s,r)=>s+Object.values(r).filter(Boolean).length,0);
  const pct=total>0?Math.round(done/total*100):0;
  return(<div onClick={click} style={{padding:"10px 14px",cursor:"pointer",background:sel?"#161b22":"transparent",borderLeft:sel?"3px solid #3b82f6":"3px solid transparent",borderBottom:"1px solid #21262d"}}
    onMouseEnter={e=>{if(!sel)e.currentTarget.style.background="#0d1117";}} onMouseLeave={e=>{if(!sel)e.currentTarget.style.background="transparent";}}>
    <div style={{fontFamily:F.b,fontSize:13,fontWeight:600,color:sel?"#e5e7eb":"#9ca3af",marginBottom:6,lineHeight:1.2}}>{v.name}</div>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:4,background:"#1a1f2e",borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:pct===100?"#16a34a":pct>=50?"#ca8a04":"#dc2626",borderRadius:2,transition:"width 0.4s"}}/></div>
      <span style={{fontFamily:F.m,fontSize:9,fontWeight:700,color:pct===100?"#4ade80":"#6b7280"}}>{done}/{total}</span>
    </div>
  </div>);
}

export default function AcquisitionTab(){
  const [vendors,setVendors]=useState(mkVendors);
  const [selId,setSelId]=useState(null);
  const [vSearch,setVSearch]=useState("");
  useEffect(()=>{if(!selId&&vendors.length>0)setSelId(vendors[0].id);},[vendors]);

  function toggle(vid,rid,cid){
    setVendors(p=>p.map(v=>{if(v.id!==vid)return v;const m={...v.matrix};m[rid]={...m[rid]};m[rid][cid]=!m[rid][cid];return{...v,matrix:m};}));
  }
  function setAll(vid){setVendors(p=>p.map(v=>{if(v.id!==vid)return v;const m={};ROWS.forEach(r=>{m[r.id]={};COLS.forEach(c=>{m[r.id][c.id]=true;});});return{...v,matrix:m};}));}
  function clearAll(vid){setVendors(p=>p.map(v=>v.id===vid?{...v,matrix:emptyM()}:v));}

  const sel=vendors.find(v=>v.id===selId);
  const filtV=vSearch?vendors.filter(v=>v.name.toLowerCase().includes(vSearch.toLowerCase())):vendors;

  return(
    <div style={{minHeight:"100vh",background:"#0a0e14",color:"#e5e7eb",fontFamily:F.b}}>
      {/* HEADER — deep blue gradient matching image */}
      <div style={{background:"linear-gradient(135deg,#0c2d5a 0%,#0d1b3e 40%,#0a1628 100%)",borderBottom:"2px solid #1e3a5f",padding:"28px 32px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(59,130,246,0.03) 40px,rgba(59,130,246,0.03) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(59,130,246,0.03) 40px,rgba(59,130,246,0.03) 41px)",pointerEvents:"none"}} />
        <h1 style={{fontFamily:F.h,fontSize:"clamp(26px,4vw,40px)",fontWeight:700,color:"#f3f4f6",letterSpacing:"0.06em",margin:0,textShadow:"0 2px 12px rgba(0,0,0,0.5)",position:"relative"}}>COTS / GOTS RAPID ACQUISITION TRACKER</h1>
        <p style={{fontFamily:F.m,fontSize:11,color:"#93c5fd",margin:"8px 0 0",letterSpacing:"0.1em",position:"relative"}}>DOTMLPF-P COMPLIANCE MATRIX — PER VENDOR</p>
      </div>

      <div style={{display:"flex",minHeight:"calc(100vh - 110px)"}}>
        {/* SIDEBAR */}
        <div style={{width:260,flexShrink:0,background:"#0d1117",borderRight:"1px solid #21262d",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"12px 14px",borderBottom:"1px solid #21262d"}}>
            <div style={{fontFamily:F.m,fontSize:10,fontWeight:700,color:"#6b7280",letterSpacing:"0.15em",marginBottom:8}}>VENDORS ({vendors.length})</div>
            <input type="text" placeholder="Search..." value={vSearch} onChange={e=>setVSearch(e.target.value)}
              style={{width:"100%",padding:"6px 10px",background:"#161b22",border:"1px solid #30363d",borderRadius:4,color:"#e5e7eb",fontFamily:F.m,fontSize:10,outline:"none"}} />
          </div>
          <div style={{flex:1,overflowY:"auto"}}>{filtV.map(v=><VChip key={v.id} v={v} sel={v.id===selId} click={()=>setSelId(v.id)} />)}</div>
        </div>

        {/* MATRIX */}
        <div style={{flex:1,padding:"24px 32px",overflowX:"auto"}}>
          {sel?(<>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <h2 style={{fontFamily:F.h,fontSize:24,fontWeight:700,color:"#f3f4f6",margin:0}}>{sel.name}</h2>
                <div style={{fontFamily:F.m,fontSize:10,color:"#6b7280",marginTop:4}}>CLICK CELLS TO TOGGLE CHECKMARKS</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setAll(sel.id)} style={{padding:"6px 14px",fontSize:10,fontWeight:700,fontFamily:F.m,border:"1px solid #16a34a",background:"#0d3320",color:"#4ade80",borderRadius:4,cursor:"pointer"}}>✓ ALL</button>
                <button onClick={()=>clearAll(sel.id)} style={{padding:"6px 14px",fontSize:10,fontWeight:700,fontFamily:F.m,border:"1px solid #dc2626",background:"#3b1318",color:"#f87171",borderRadius:4,cursor:"pointer"}}>✕ CLEAR</button>
              </div>
            </div>

            <div style={{background:"linear-gradient(180deg,#0c2040,#0d1628 30%,#0a1220)",border:"1px solid #1e3a5f",borderRadius:8,overflow:"hidden",boxShadow:"0 4px 32px rgba(0,0,0,0.4),0 0 20px rgba(30,58,95,0.15)"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontFamily:F.b}}>
                <thead><tr>
                  <th style={{padding:"14px 18px",textAlign:"left",fontFamily:F.h,fontSize:14,fontWeight:700,color:"#93c5fd",letterSpacing:"0.06em",background:"rgba(30,58,95,0.6)",borderBottom:"2px solid #3b82f6"}}>Process</th>
                  {COLS.map(c=><th key={c.id} style={{padding:"14px 12px",textAlign:"center",fontFamily:F.h,fontSize:14,fontWeight:700,color:"#93c5fd",letterSpacing:"0.06em",background:"rgba(30,58,95,0.6)",borderBottom:"2px solid #3b82f6",minWidth:90}}>{c.l}</th>)}
                </tr></thead>
                <tbody>{ROWS.map((r,i)=>(
                  <tr key={r.id} style={{background:i%2===0?"rgba(13,22,40,0.5)":"rgba(20,32,56,0.3)",borderBottom:"1px solid rgba(30,58,95,0.3)"}}>
                    <td style={{padding:"12px 18px",fontFamily:F.b,fontSize:13,fontWeight:600,color:"#d1d5db",borderRight:"1px solid rgba(30,58,95,0.3)"}}>{r.l}</td>
                    {COLS.map(c=><Check key={c.id} on={sel.matrix[r.id]?.[c.id]||false} edit={true} click={()=>toggle(sel.id,r.id,c.id)} />)}
                  </tr>
                ))}</tbody>
              </table>
            </div>

            <div style={{marginTop:20,padding:"14px 20px",textAlign:"center",background:"linear-gradient(90deg,rgba(30,58,95,0.3),rgba(30,58,95,0.6),rgba(30,58,95,0.3))",borderRadius:6,border:"1px solid #1e3a5f"}}>
              <span style={{fontFamily:F.h,fontSize:14,fontWeight:600,color:"#93c5fd",letterSpacing:"0.06em",fontStyle:"italic"}}>O&M Funded – USAF SECAF / CENTCOM CCMD Operations</span>
            </div>
          </>):(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh"}}><div style={{fontFamily:F.h,fontSize:24,color:"#4b5563"}}>SELECT A VENDOR</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
