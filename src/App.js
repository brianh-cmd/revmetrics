import { useState, useEffect } from "react";

const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON_KEY;
const STRIPE_PK     = process.env.REACT_APP_STRIPE_PK;
const PRICE_MONTHLY = process.env.REACT_APP_STRIPE_MONTHLY;
const PRICE_ANNUAL  = process.env.REACT_APP_STRIPE_ANNUAL;

const C = {
  bg:"#0A0A0F", surface:"#13131A", card:"#1C1C26", border:"#2A2A38",
  accent:"#E8FF47", text:"#F0F0F0", muted:"#7A7A9A",
  green:"#3DFF8F", yellow:"#FFD447", red:"#FF4D6A",
};

const MARKET_DATA = {
  "Porsche 911":          {base:95000,trend:8.2, supply:"Low",     hot:true },
  "Honda S2000":          {base:28500,trend:12.4,supply:"Very Low",hot:true },
  "BMW M3":               {base:42000,trend:3.1, supply:"Medium",  hot:false},
  "Toyota Supra (A80)":   {base:52000,trend:15.7,supply:"Very Low",hot:true },
  "Mitsubishi Evo":       {base:31000,trend:9.8, supply:"Low",     hot:true },
  "Subaru STI":           {base:24000,trend:5.2, supply:"Medium",  hot:false},
  "Toyota Land Cruiser":  {base:48000,trend:11.3,supply:"Low",     hot:true },
  "Ford Bronco":          {base:52000,trend:2.1, supply:"High",    hot:false},
  "Acura NSX (NA1)":      {base:88000,trend:18.2,supply:"Very Low",hot:true },
  "BMW M5":               {base:38000,trend:4.4, supply:"Medium",  hot:false},
};
const CONDITIONS    = ["Concours","Excellent","Good","Fair","Project"];
const COND_MULT     = {Concours:1.35,Excellent:1.15,Good:1.0,Fair:0.78,Project:0.52};
const MILE_BRACKETS = ["Under 30k","30k–60k","60k–100k","100k–150k","150k+"];
const MILE_MULT     = {"Under 30k":1.18,"30k–60k":1.05,"60k–100k":1.0,"100k–150k":0.88,"150k+":0.72};

const sb = {
  async signUp(email,password){
    const r=await fetch(`${SUPABASE_URL}/auth/v1/signup`,{method:"POST",
      headers:{"apikey":SUPABASE_ANON,"Content-Type":"application/json"},
      body:JSON.stringify({email,password})});return r.json();
  },
  async signIn(email,password){
    const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:"POST",
      headers:{"apikey":SUPABASE_ANON,"Content-Type":"application/json"},
      body:JSON.stringify({email,password})});return r.json();
  },
  async getProfile(uid,tok){
    const r=await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&select=*`,
      {headers:{"apikey":SUPABASE_ANON,"Authorization":`Bearer ${tok}`}});
    const d=await r.json();return d?.[0]||null;
  },
  async upsertProfile(profile,tok){
    const r=await fetch(`${SUPABASE_URL}/rest/v1/profiles`,{method:"POST",
      headers:{"apikey":SUPABASE_ANON,"Authorization":`Bearer ${tok}`,
        "Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=representation"},
      body:JSON.stringify(profile)});return r.json();
  },
  async getComps(tok){
    const r=await fetch(`${SUPABASE_URL}/rest/v1/comps?select=*&order=created_at.desc&limit=20`,
      {headers:{"apikey":SUPABASE_ANON,"Authorization":`Bearer ${tok}`}});return r.json();
  },
  async insertComp(comp,tok){
    const r=await fetch(`${SUPABASE_URL}/rest/v1/comps`,{method:"POST",
      headers:{"apikey":SUPABASE_ANON,"Authorization":`Bearer ${tok}`,
        "Content-Type":"application/json","Prefer":"return=representation"},
      body:JSON.stringify(comp)});return r.json();
  }
};

function makeRefCode(email){
  return email.split("@")[0].toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6)+
    Math.floor(1000+Math.random()*9000);
}
function scoreDeals(market,asked,condition,mileage,year){
  const age=2026-parseInt(year||2026);
  const fair=market.base*COND_MULT[condition]*MILE_MULT[mileage]*Math.max(0.6,1-age*0.004);
  const diff=((fair-asked)/fair)*100;
  let score,label,color,summary;
  if(diff>=12){score=95;label="Great Deal";color=C.green;summary="Priced well below market. Strong buy signal."}
  else if(diff>=4){score=78;label="Good Deal";color=C.green;summary="Below market value. Worth pursuing."}
  else if(diff>=-4){score=58;label="Fair Price";color=C.yellow;summary="In line with market. Negotiate on condition."}
  else if(diff>=-12){score=35;label="Overpriced";color=C.yellow;summary="Above market. Negotiate down."}
  else{score=12;label="Walk Away";color=C.red;summary="Significantly overpriced. Better deals exist."}
  return{score,label,color,fair:Math.round(fair),diff:Math.round(diff),summary};
}

async function redirectToCheckout(priceId,email,refCode){
  const res=await fetch('/api/create-checkout-session',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({priceId,email,refCode})
  });
  const data=await res.json();
  if(data.url) window.location.href=data.url;
  else throw new Error(data.error||'Failed to create checkout session');
}

function Tag({children,color}){return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:6,padding:"2px 10px",fontSize:12,fontWeight:700}}>{children}</span>;}
function Inp({label,value,onChange,placeholder="",type="text",error=false}){return(<div style={{display:"flex",flexDirection:"column",gap:5}}>{label&&<label style={{fontSize:11,color:error?"#ff4444":C.muted,letterSpacing:1,textTransform:"uppercase"}}>{label}{error&&<span style={{marginLeft:4,fontSize:10}}>← Required</span>}</label>}<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{background:C.surface,border:`1px solid ${error?"#ff4444":C.border}`,borderRadius:10,color:C.text,padding:"12px 14px",fontSize:15,outline:"none",width:"100%",boxSizing:"border-box"}}/></div>);}
function Sel({label,value,onChange,options,error=false}){return(<div style={{display:"flex",flexDirection:"column",gap:5}}>{label&&<label style={{fontSize:11,color:error?"#ff4444":C.muted,letterSpacing:1,textTransform:"uppercase"}}>{label}{error&&<span style={{marginLeft:4,fontSize:10}}>← Required</span>}</label>}<select value={value} onChange={e=>onChange(e.target.value)} style={{background:C.surface,border:`1px solid ${error?"#ff4444":C.border}`,borderRadius:10,color:value?C.text:C.muted,padding:"12px 14px",fontSize:15,outline:"none",width:"100%",appearance:"none",cursor:"pointer"}}><option value="" disabled>Select…</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select></div>);}
function Btn({children,onClick,disabled,color=C.accent,style={}}){return(<button onClick={onClick} disabled={disabled} style={{background:color,color:C.bg,border:"none",borderRadius:12,padding:"14px",fontSize:14,fontWeight:800,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.4:1,width:"100%",letterSpacing:.5,...style}}>{children}</button>);}
function Gauge({score,color}){const r=54,cx=70,cy=70,circ=Math.PI*r,fill=(score/100)*circ;return(<svg width="140" height="80" viewBox="0 0 140 80"><path d={`M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}`} fill="none" stroke={C.border} strokeWidth="10"/><path d={`M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}`} fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.8s ease"}}/><text x={cx} y={cy-8} textAnchor="middle" fill={color} fontSize="22" fontWeight="800">{score}</text><text x={cx} y={cy+2} textAnchor="middle" fill={C.muted} fontSize="9">/100</text></svg>);}

function AuthScreen({onAuth,refCode}){
  const [mode,setMode]=useState("signin");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  async function handleSubmit(){
    if(!email||!pass){setError("Please fill in all fields.");return;}
    setLoading(true);setError("");
    try{
      if(mode==="signup"){
        const res=await sb.signUp(email,pass);
        if(res.error){setError(res.error.message);setLoading(false);return;}
        setError("✅ Check your email to confirm your account, then sign in.");
        setMode("signin");
      }else{
        const res=await sb.signIn(email,pass);
        if(res.error){setError(res.error.message);setLoading(false);return;}
        const tok=res.access_token,uid=res.user?.id;
        let profile=await sb.getProfile(uid,tok);
        if(!profile){
          const code=makeRefCode(email);
          const created=await sb.upsertProfile({id:uid,email,plan:"none",
            referral_code:code,referred_by:refCode||null,referral_credits:0},tok);
          profile=Array.isArray(created)?created[0]:created;
        }
        onAuth({token:tok,userId:uid,email,profile});
      }
    }catch(e){setError(e.message);}
    setLoading(false);
  }
  return(
    <div style={{padding:"32px 20px",display:"flex",flexDirection:"column",gap:18,maxWidth:400,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:8}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{background:C.accent,color:C.bg,fontWeight:900,fontSize:14,borderRadius:6,padding:"3px 10px"}}>REV</span>
          <span style={{fontWeight:800,fontSize:22}}>METRICS</span>
        </div>
        <div style={{fontSize:13,color:C.muted}}>Collector Car Intelligence</div>
      </div>
      {refCode&&<div style={{background:C.green+"15",border:`1px solid ${C.green}44`,borderRadius:12,padding:"10px 14px",fontSize:13,color:C.green,textAlign:"center"}}>🎉 Referral applied — 10% off your first month!</div>}
      <div style={{display:"flex",background:C.surface,borderRadius:12,padding:4,gap:4}}>
        {["signin","signup"].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px",background:mode===m?C.accent:"none",color:mode===m?C.bg:C.muted,border:"none",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer"}}>{m==="signin"?"Sign In":"Create Account"}</button>)}
      </div>
      <Inp label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email"/>
      <Inp label="Password" value={pass} onChange={setPass} placeholder="Min 6 characters" type="password"/>
      {error&&<div style={{fontSize:12,color:error.startsWith("✅")?C.green:C.red,textAlign:"center"}}>{error}</div>}
      <Btn onClick={handleSubmit} disabled={loading}>{loading?"Loading...":(mode==="signin"?"SIGN IN →":"CREATE ACCOUNT →")}</Btn>
    </div>
  );
}

function PricingScreen({email,refCode,onBack}){
  const [plan,setPlan]=useState("monthly");
  const [loading,setLoading]=useState(false);
  const annualTotal=(9.99*12*0.90).toFixed(2);
  const annualPerMo=(9.99*0.90).toFixed(2);
  const firstMonth=refCode?(9.99*0.90).toFixed(2):"9.99";
  async function handleCheckout(){
    setLoading(true);
    await redirectToCheckout(plan==="monthly"?PRICE_MONTHLY:PRICE_ANNUAL,email,refCode);
    setLoading(false);
  }
  return(
    <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",gap:16}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",textAlign:"left",padding:0}}>← Back</button>
      <div><div style={{fontSize:22,fontWeight:900}}>Choose Your Plan</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>Full access. No free tier.</div></div>
      {refCode&&<div style={{background:C.green+"15",border:`1px solid ${C.green}44`,borderRadius:12,padding:"10px 14px",fontSize:13,color:C.green}}>🎉 Referral applied — 10% off your first month!</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{id:"monthly",label:"Monthly",price:`$${refCode?firstMonth:"9.99"}`,sub:refCode?"first month, $9.99 after":"per month"},
          {id:"annual",label:"Annual",price:`$${annualPerMo}/mo`,sub:`$${annualTotal}/yr · save 10%`,badge:"BEST VALUE"}].map(p=>(
          <div key={p.id} onClick={()=>setPlan(p.id)} style={{background:plan===p.id?C.accent+"22":C.card,border:`2px solid ${plan===p.id?C.accent:C.border}`,borderRadius:14,padding:"14px 12px",cursor:"pointer",position:"relative"}}>
            {p.badge&&<div style={{position:"absolute",top:-10,right:8,background:C.accent,color:C.bg,fontSize:10,fontWeight:900,borderRadius:20,padding:"2px 8px"}}>{p.badge}</div>}
            <div style={{fontWeight:700,fontSize:13,color:plan===p.id?C.accent:C.text}}>{p.label}</div>
            <div style={{fontSize:18,fontWeight:900,marginTop:4}}>{p.price}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:2}}>{p.sub}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
        {["Unlimited deal scores","Full market overview","Community comps","Price alerts","VIN history reports","Referral rewards"].map(f=>(
          <div key={f} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
            <span style={{color:C.green}}>✓</span>{f}
          </div>
        ))}
      </div>
      <Btn onClick={handleCheckout} disabled={loading}>{loading?"Redirecting to Stripe...":"PAY WITH STRIPE →"}</Btn>
      <div style={{fontSize:11,color:C.muted,textAlign:"center"}}>Secured by Stripe · Cancel anytime</div>
    </div>
  );
}

function App({session}){
  const {token,userId,email,profile}=session;
  const [tab,setTab]=useState("scorer");
  const [vehicle,setVeh]=useState("");const [year,setYear]=useState("");
  const [condition,setCond]=useState("");const [mileage,setMile]=useState("");
  const [price,setPrice]=useState("");const [result,setResult]=useState(null);
  const [comps,setComps]=useState([]);const [compForm,setCF]=useState({vehicle:"",year:"",price:"",condition:"",mileage:"",location:""});
  const [compDone,setCD]=useState(false);const [copied,setCopied]=useState(false);
  const [loadingComps,setLC]=useState(false);
  const [scorerSubmitted,setScorerSubmitted]=useState(false);
  const refLink=`${window.location.origin}?ref=${profile?.referral_code||""}`;
  useEffect(()=>{if(tab==="comps")loadComps();},[tab]);
  async function loadComps(){setLC(true);try{const d=await sb.getComps(token);setComps(d||[]);}catch(e){console.error(e);}setLC(false);}
  async function submitComp(){
    if(!compForm.vehicle||!compForm.year||!compForm.price||!compForm.condition||!compForm.mileage)return;
    try{await sb.insertComp({user_id:userId,vehicle:compForm.vehicle,year:compForm.year,price:parseFloat(compForm.price.replace(/,/g,"")),condition:compForm.condition,mileage:compForm.mileage,location:compForm.location||"N/A"},token);
    setCF({vehicle:"",year:"",price:"",condition:"",mileage:"",location:""});setCD(true);setTimeout(()=>setCD(false),3000);loadComps();}
    catch(e){alert("Error: "+e.message);}
  }
  function runScorer(){if(!vehicle||!condition||!mileage||!price||!year)return;setResult(scoreDeals(MARKET_DATA[vehicle],parseFloat(price.replace(/,/g,"")),condition,mileage,year));}
  function copyRef(){navigator.clipboard.writeText(refLink).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2500);}
  const tabs=[{id:"scorer",label:"Scorer"},{id:"market",label:"Market"},{id:"comps",label:"Comps"},{id:"referral",label:"Refer"},{id:"account",label:"Account"}];
  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:80}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"16px 20px",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{background:C.accent,color:C.bg,fontWeight:900,fontSize:13,borderRadius:6,padding:"2px 8px"}}>REV</span>
            <span style={{fontWeight:800,fontSize:18}}>METRICS</span>
          </div>
          <Tag color={profile?.plan==="annual"?C.green:C.accent}>{profile?.plan==="annual"?"ANNUAL":"MONTHLY"}</Tag>
        </div>
      </div>
      <div style={{display:"flex",background:C.surface,borderBottom:`1px solid ${C.border}`}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 2px",background:"none",border:"none",color:tab===t.id?C.accent:C.muted,fontWeight:tab===t.id?700:500,fontSize:11,cursor:"pointer",borderBottom:tab===t.id?`2px solid ${C.accent}`:"2px solid transparent"}}>{t.label}</button>)}
      </div>
      <div style={{padding:"20px 16px"}}>
        {tab==="scorer"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><h2 style={{margin:0,fontSize:20,fontWeight:800}}>Deal Scorer</h2><p style={{margin:"4px 0 0",fontSize:13,color:C.muted}}>Instant market intelligence on any listing.</p></div>
            <Sel label="Vehicle" value={vehicle} onChange={v=>{setVeh(v);setResult(null);}} options={Object.keys(MARKET_DATA)}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Year" value={year} onChange={setYear} placeholder="2004"/><Inp label="Asking Price ($)" value={price} onChange={setPrice} placeholder="28000"/></div>
            <Sel label="Condition" value={condition} onChange={setCond} options={CONDITIONS}/>
            <Sel label="Mileage" value={mileage} onChange={setMile} options={MILE_BRACKETS}/>
            <Btn onClick={runScorer} disabled={!vehicle||!condition||!mileage||!price||!year}>SCORE THIS DEAL →</Btn>
            {result&&(
              <div style={{background:C.card,border:`2px solid ${result.color}44`,borderRadius:16,padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><Tag color={result.color}>{result.label}</Tag><div style={{fontSize:26,fontWeight:900,marginTop:10,color:result.color}}>{result.diff>=0?"+":""}{result.diff}% vs market</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>{result.summary}</div></div>
                  <Gauge score={result.score} color={result.color}/>
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,marginTop:16,paddingTop:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[["Fair Market Value",`$${result.fair.toLocaleString()}`],["Asking Price",`$${parseFloat(price.replace(/,/g,"")).toLocaleString()}`],["Difference",result.diff>=0?`Save $${Math.abs(result.fair-parseFloat(price.replace(/,/g,""))).toLocaleString()}`:`Over $${Math.abs(result.fair-parseFloat(price.replace(/,/g,""))).toLocaleString()}`],["YoY Trend",`▲ ${MARKET_DATA[vehicle]?.trend}%`]].map(([k,v])=>(
                    <div key={k} style={{background:C.surface,borderRadius:10,padding:"10px 12px"}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>{k}</div><div style={{fontSize:14,fontWeight:700,marginTop:4}}>{v}</div></div>
                  ))}
                </div>
                <div style={{marginTop:12,background:C.accent+"11",border:`1px solid ${C.accent}33`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.accent}}>
                  💡 Supply for {vehicle} is <strong>{MARKET_DATA[vehicle]?.supply}</strong> — {["Very Low","Low"].includes(MARKET_DATA[vehicle]?.supply)?"don't wait if the price is right.":"you have negotiating room."}
                </div>
              </div>
            )}
          </div>
        )}
        {tab==="market"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:800}}>Market Overview</h2>
            <p style={{margin:"0 0 8px",fontSize:13,color:C.muted}}>Fair values & trends across all tracked models.</p>
            {Object.entries(MARKET_DATA).map(([name,d])=>(
              <div key={name} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:700}}>{name}</span>{d.hot&&<Tag color={C.accent}>🔥 Hot</Tag>}</div>
                <div style={{fontSize:22,fontWeight:900,color:C.accent,marginTop:6}}>${d.base.toLocaleString()}</div>
                <div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}><Tag color={C.green}>▲ {d.trend}% YoY</Tag><span style={{fontSize:11,color:C.muted}}>Supply: {d.supply}</span></div>
              </div>
            ))}
          </div>
        )}
        {tab==="comps"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:800}}>Community Comps</h2>
            <p style={{margin:"0 0 4px",fontSize:13,color:C.muted}}>Real transactions from RevMetrics subscribers.</p>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
              <div style={{fontSize:12,color:C.accent,fontWeight:700,marginBottom:12}}>+ Submit a Transaction</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <Sel label="Vehicle" value={compForm.vehicle} onChange={v=>setCF(p=>({...p,vehicle:v}))} options={Object.keys(MARKET_DATA)}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Year" value={compForm.year} onChange={v=>setCF(p=>({...p,year:v}))} placeholder="2004"/><Inp label="Sale Price" value={compForm.price} onChange={v=>setCF(p=>({...p,price:v}))} placeholder="28500"/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Sel label="Condition" value={compForm.condition} onChange={v=>setCF(p=>({...p,condition:v}))} options={CONDITIONS}/><Sel label="Mileage" value={compForm.mileage} onChange={v=>setCF(p=>({...p,mileage:v}))} options={MILE_BRACKETS}/></div>
                <Inp label="State" value={compForm.location} onChange={v=>setCF(p=>({...p,location:v}))} placeholder="CA"/>
                <Btn onClick={submitComp} disabled={!compForm.vehicle||!compForm.year||!compForm.price||!compForm.condition||!compForm.mileage}>{compDone?"✅ Saved!":"SUBMIT COMP"}</Btn>
              </div>
            </div>
            {loadingComps?<div style={{textAlign:"center",color:C.muted,padding:20}}>Loading...</div>
              :comps.length===0?<div style={{textAlign:"center",color:C.muted,padding:20}}>No comps yet — be the first!</div>
              :comps.map((c,i)=>(
                <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontWeight:700,fontSize:14}}>{c.year} {c.vehicle}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{c.condition} · {c.mileage} · {c.location}</div></div>
                  <div style={{fontSize:20,fontWeight:800,color:C.accent}}>${Number(c.price).toLocaleString()}</div>
                </div>
              ))
            }
          </div>
        )}
        {tab==="referral"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div><h2 style={{margin:0,fontSize:20,fontWeight:800}}>Refer a Friend</h2><p style={{margin:"4px 0 0",fontSize:13,color:C.muted}}>Both of you get rewarded.</p></div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
              {[["🔗","Share your link","Send your unique link to a friend"],["🎉","Friend subscribes","They get 10% off their first month"],["💰","You get rewarded","You get 10% off your next month"]].map(([icon,title,sub])=>(
                <div key={title} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:20}}>{icon}</span><div><div style={{fontWeight:700,fontSize:13}}>{title}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{sub}</div></div></div>
              ))}
            </div>
            <div style={{background:`linear-gradient(135deg,${C.accent}18,${C.accent}06)`,border:`1px solid ${C.accent}44`,borderRadius:14,padding:18}}>
              <div style={{fontSize:11,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:.8}}>YOUR REFERRAL LINK</div>
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:12,color:C.accent,wordBreak:"break-all",marginBottom:12}}>{refLink}</div>
              <button onClick={copyRef} style={{background:copied?C.green:C.accent,color:C.bg,border:"none",borderRadius:10,padding:"12px",width:"100%",fontWeight:800,fontSize:14,cursor:"pointer",transition:"background .3s"}}>{copied?"✅ COPIED!":"COPY REFERRAL LINK"}</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Your Code",profile?.referral_code||"—"],["Credits Earned",profile?.referral_credits||0],["Status","Active"],["Plan",profile?.plan||"monthly"]].map(([k,v])=>(
                <div key={k} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>{k}</div><div style={{fontSize:16,fontWeight:800,marginTop:4,color:C.accent}}>{v}</div></div>
              ))}
            </div>
          </div>
        )}
        {tab==="account"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <h2 style={{margin:0,fontSize:20,fontWeight:800}}>Account</h2>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:18}}>
              {[["Email",email],["Plan",profile?.plan==="annual"?"Annual (10% off)":"Monthly"],["Referral code",profile?.referral_code||"—"],["Referral credits",profile?.referral_credits||0]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}><span style={{color:C.muted}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>
              ))}
            </div>
            <button onClick={()=>window.location.reload()} style={{background:"none",border:`1px solid ${C.red}44`,borderRadius:10,padding:"12px",color:C.red,fontSize:13,cursor:"pointer"}}>Sign Out</button>
          </div>
        )}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"12px 2px 10px",background:"none",border:"none",color:tab===t.id?C.accent:C.muted,fontWeight:tab===t.id?700:500,fontSize:10,cursor:"pointer",textTransform:"uppercase",borderTop:tab===t.id?`2px solid ${C.accent}`:"2px solid transparent"}}>{t.label}</button>)}
      </div>
    </div>
  );
}

export default function Root(){
  const [session,setSession]=useState(null);
  const [screen,setScreen]=useState("auth");
  const [refCode,setRefCode]=useState("");
  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    const ref=p.get("ref");const status=p.get("session");
    if(ref)setRefCode(ref);
    if(status==="success"&&session)setScreen("app");
  },[session]);
  function handleAuth(sess){
    setSession(sess);
    if(sess.profile?.plan&&sess.profile.plan!=="none")setScreen("app");
    else setScreen("pricing");
  }
  const Header=()=>(<div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"20px 20px 16px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{background:C.accent,color:C.bg,fontWeight:900,fontSize:13,borderRadius:6,padding:"2px 8px"}}>REV</span><span style={{fontWeight:800,fontSize:18}}>METRICS</span></div><div style={{fontSize:11,color:C.muted,marginTop:2}}>Collector Car Intelligence</div></div>);
  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",maxWidth:480,margin:"0 auto"}}>
      {screen==="auth"&&<><Header/><AuthScreen onAuth={handleAuth} refCode={refCode}/></>}
      {screen==="pricing"&&session&&<><Header/><PricingScreen email={session.email} refCode={refCode} onBack={()=>setScreen("auth")}/></>}
      {screen==="app"&&session&&<App session={session}/>}
      {screen==="app"&&!session&&<><Header/><AuthScreen onAuth={handleAuth} refCode={refCode}/></>}
    </div>
  );
}