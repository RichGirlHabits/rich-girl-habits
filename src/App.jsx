import { useState, useRef, useEffect } from "react";

const W = {
  bg:"#0A0500", card:"rgba(255,245,235,0.06)", accent:"#E8956A",
  aLight:"rgba(232,149,106,0.15)", gold:"#C4965A", cream:"#FDF0E8",
  text:"#FDF0E8", mid:"rgba(253,240,232,0.65)", soft:"rgba(253,240,232,0.35)",
  border:"rgba(232,149,106,0.2)", rose:"#D4723E",
};

const CATS = {
  food:          { label:"Food & Dining",   color:"#E8956A", emoji:"🍔" },
  groceries:     { label:"Groceries",       color:"#4ECDC4", emoji:"🛒" },
  transport:     { label:"Transport",       color:"#45B7D1", emoji:"🚗" },
  entertainment: { label:"Entertainment",   color:"#C4965A", emoji:"🎬" },
  shopping:      { label:"Shopping",        color:"#E8956A", emoji:"🛍️" },
  health:        { label:"Health",          color:"#F4A9B8", emoji:"💊" },
  utilities:     { label:"Utilities",       color:"#6EE7B7", emoji:"⚡" },
  other:         { label:"Other",           color:"#94A3B8", emoji:"📦" },
};

const BUDGETS = { food:300,groceries:400,transport:150,entertainment:100,shopping:200,health:80,utilities:250,other:100 };

const GOAL_OPTIONS_MAP = {
  emergency:{emoji:"🛡️",label:"Emergency Fund", color:"#6EE7B7",presets:[1000,2000,5000]},
  debt:     {emoji:"💳",label:"Pay Off Debt",    color:"#F4A9B8",presets:[2000,5000,10000]},
  vacation: {emoji:"✈️",label:"Vacation Fund",   color:"#45B7D1",presets:[1500,3000,5000]},
  home:     {emoji:"🏠",label:"Down Payment",    color:"#C4965A",presets:[10000,20000,50000]},
  roth:     {emoji:"📈",label:"Roth IRA",        color:"#C4965A",presets:[3500,7000]},
  wedding:  {emoji:"💍",label:"Wedding Fund",    color:"#F4A9B8",presets:[5000,15000,25000]},
  kids:     {emoji:"👶",label:"Kids / Family",   color:"#45B7D1",presets:[5000,10000,20000]},
};

const PERSONAS = [
  { id:"nana",  name:"Nana Rose",   emoji:"👵", color:"#F4A9B8",
    react:(s,a)=>`Baby you spent $${a} at ${s}? Nana is right here logging it with you!`,
    save:()=>"Baby you logged it! That is half the battle!",
    resist:(s)=>`STOP! Nana is standing in front of ${s} right now. You do not need this!`,
    walkaway:()=>"You walked AWAY? Nana is calling the whole family RIGHT NOW!",
    badge:()=>"Nana is SO proud she can barely stand it! You keep going!",
  },
  { id:"moneymom", name:"Money Mom", emoji:"💁‍♀️", color:"#C4965A",
    react:(s,a)=>`$${a} at ${s}. Logged. Now let us talk about why that keeps happening.`,
    save:()=>"Logged. That is awareness. Awareness is everything.",
    resist:(s)=>`Put the phone down. Walk past ${s}. Your future self is watching.`,
    walkaway:()=>"You walked away. That is not small. That is everything.",
    badge:()=>"This badge means you are becoming someone different. Keep going.",
  },
  { id:"bestie", name:"Your Bestie", emoji:"⭐", color:"#E8956A",
    react:(s,a)=>`OKAY $${a} at ${s}?! WE LOGGING IT!! IN THIS ECONOMY!! LET'S GO!!`,
    save:()=>"LOGGED!! YOU ARE BUILT DIFFERENT!! THAT GIRL ERA!!",
    resist:(s)=>`WALK AWAY FROM ${s.toUpperCase()}!! YOUR SAVINGS ACCOUNT IS CALLING!!`,
    walkaway:()=>"YOU WALKED AWAY?! IN THIS ECONOMY?! YOU ARE LITERALLY THAT GIRL!!",
    badge:()=>"THIS BADGE?! THIS IS ELITE BEHAVIOR!! YOU ARE THAT GIRL!!",
  },
  { id:"savage", name:"Savage Chef", emoji:"👨‍🍳", color:"#D4723E",
    react:(s,a)=>`$${a} at ${s}. The baristas know your name. Your savings account does not. Yet.`,
    save:()=>"Logged. Awareness precedes change. You are aware now.",
    resist:(s)=>`${s} can survive without you today. Your emergency fund cannot.`,
    walkaway:()=>"Walking away is a skill. You just practiced it. Do it again tomorrow.",
    badge:()=>"Badges do not lie. You earned this one. Now earn the next one.",
  },
];

const BADGES = [
  { id:"welcome",     emoji:"🌸", name:"Welcome",          desc:"You showed up. That matters.",          tier:"starter" },
  { id:"week_streak", emoji:"🌱", name:"First Seed",       desc:"7 days of honest logging",              tier:"bronze"  },
  { id:"first_resist",emoji:"💪", name:"The Wall",         desc:"You resisted and saved",                tier:"bronze"  },
  { id:"five_hundred",emoji:"💧", name:"The Drop",         desc:"$500 saved total",                      tier:"silver"  },
  { id:"emergency",   emoji:"🛡️", name:"The Net",          desc:"Emergency Fund complete",               tier:"silver", retireRicher:true, rrType:"type1" },
  { id:"grand",       emoji:"💰", name:"The Grand",        desc:"$1,000 saved",                          tier:"gold",   retireRicher:true, rrType:"type1" },
  { id:"two_five",    emoji:"🏆", name:"Putting Yourself First", desc:"$2,500 saved total",             tier:"gold",   retireRicher:true, rrType:"webinar" },
  { id:"identity",    emoji:"🧠", name:"Identity Shift",   desc:"90 days consistent",                    tier:"gold",   retireRicher:true, rrType:"type2" },
];

const RR = {
  type1:{
    title:"I see what you are doing.",
    lines:["I have been watching your progress.","You are doing the right things.","The gap is closing.","But I see some things I would adjust.","Worth 20 minutes of your time."],
    cta:"See My Recommendations", ctaNote:"Complimentary · 20 minutes",
  },
  type2:{
    title:"It is time.",
    lines:["You have done what most people never do.","The foundation is there.","This is the moment where retirement planning starts.","Not when you are older. Now.","Let us talk."],
    cta:"Start Retirement Planning", ctaNote:"Book your complimentary call",
  },
  webinar:{
    title:"You earned an invite.",
    lines:["Not everyone gets this.","You saved $2,500.","That is every time you walked away.","Every habit you changed.","That is you putting yourself first."],
    cta:"Reserve My Spot", ctaNote:"Putting Yourself First · Free for members",
    event:"Putting Yourself First", eventNote:"A RetireRicher Live Event",
  },
};

const LADDER = [
  {step:1,emoji:"🛡️",name:"Emergency Fund",        desc:"1 month of spends covered"},
  {step:2,emoji:"💳",name:"Kill High-Interest Debt", desc:"Pay off cards first"},
  {step:3,emoji:"📈",name:"Retirement Match",        desc:"Get your full employer match"},
  {step:4,emoji:"✈️",name:"Vacation Fund",           desc:"Unlocks after Step 1"},
  {step:5,emoji:"🏠",name:"Down Payment",            desc:"The big goal"},
];

const FUTURE_MSGS = {
  welcome:"You just started something real. I am living proof that showing up is enough to begin.",
  week_streak:"Seven days. You were here every day. That is not nothing. That is everything.",
  first_resist:"That resistance? That is the whole game. Do it again tomorrow.",
  five_hundred:"$500. I remember this moment. This is where it started feeling real.",
  emergency:"This is the one that changes everything. No surprise can touch you the same way anymore.",
  grand:"A thousand dollars from just deciding differently. That is not luck. That is you.",
  two_five:"Twenty-five hundred dollars. You put yourself first. I have been waiting for this.",
  identity:"You are becoming me. I can feel the gap closing from here.",
  default:"You are becoming me. I can feel the gap closing from here.",
};

function compound(weekly,years,rate=0.07){const weeks=years*52;let t=0;for(let i=0;i<weeks;i++)t=(t+weekly)*(1+rate/52);return Math.round(t);}
function formatK(n){if(n>=1000000)return`$${(n/1000000).toFixed(1)}M`;if(n>=1000)return`$${(n/1000).toFixed(0)}k`;return`$${n}`;}
function todayStr(){return new Date().toISOString().slice(0,10);}
function monthStr(){return new Date().toISOString().slice(0,7);}
function monthLabel(){return new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"});}

function saveData(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch(e){}}
function loadData(key,fallback){try{const d=localStorage.getItem(key);return d?JSON.parse(d):fallback;}catch(e){return fallback;}}

// ── GHL WEBHOOK ───────────────────────────────────────────────────────────────
// Replace this URL with your GHL webhook URL from Settings → Integrations → Webhooks
const GHL_WEBHOOK_URL = "YOUR_GHL_WEBHOOK_URL_HERE";
const GHL_LOCATION_ID = "C5uKilaSC7SV3ZyeMj5t";

async function fireGHLWebhook(eventType, data) {
  if(!GHL_WEBHOOK_URL || GHL_WEBHOOK_URL === "YOUR_GHL_WEBHOOK_URL_HERE") return;
  try {
    await fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({event:eventType, location_id:GHL_LOCATION_ID, timestamp:new Date().toISOString(), ...data})
    });
  } catch(e) { console.log("GHL webhook failed:", e); }
}

function Confetti({active}){
  if(!active)return null;
  const p=Array.from({length:70},(_,i)=>({id:i,x:Math.random()*100,delay:Math.random()*1.2,dur:2+Math.random()*1.5,color:["#F5D5B8","#E8956A","#C4965A","#FDF0E8","#F4A9B8"][i%5],size:6+Math.random()*10}));
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>{p.map(x=><div key={x.id} style={{position:"absolute",left:`${x.x}%`,top:-20,width:x.size,height:x.size,background:x.color,borderRadius:x.id%2===0?"50%":2,animation:`cfFall ${x.dur}s ${x.delay}s ease-in forwards`}}/>)}</div>);
}

function Sparkle({size=16}){return(<div style={{position:"relative",width:size,height:size,flexShrink:0}}><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:1.5,height:size,background:"linear-gradient(180deg,transparent,#F5D5B8,transparent)"}}/><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:size,height:1.5,background:"linear-gradient(90deg,transparent,#F5D5B8,transparent)"}}/><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:4,height:4,borderRadius:"50%",background:"#FDF0E8"}}/></div>);}

function RRCard({type,onBook,onDismiss}){
  const data=RR[type];
  const [idx,setIdx]=useState(0);
  useEffect(()=>{if(idx<data.lines.length-1){const t=setTimeout(()=>setIdx(i=>i+1),400);return()=>clearTimeout(t);}},[idx,data.lines.length]);
  return(
    <div style={{background:"rgba(14,10,6,0.97)",border:"1px solid rgba(196,150,90,0.3)",borderRadius:20,padding:"28px 24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#C4965A,#E8A87C)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🌱</div>
        <div><p style={{fontSize:12,fontWeight:800,color:"#C4965A",letterSpacing:1}}>RETIREDRICHER</p><p style={{fontSize:11,color:W.soft}}>A personal message</p></div>
      </div>
      <h2 style={{fontSize:22,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream,marginBottom:18}}>{data.title}</h2>
      <div style={{marginBottom:20}}>{data.lines.slice(0,idx+1).map((line,i)=><p key={i} style={{fontSize:14,color:i===idx?"rgba(253,240,232,0.9)":"rgba(253,240,232,0.5)",lineHeight:1.7,marginBottom:4,fontWeight:i===idx?600:400}}>{line}</p>)}</div>
      {idx>=data.lines.length-1&&(
        <div>
          <p style={{fontSize:13,color:W.soft,fontStyle:"italic",marginBottom:14}}>— RetireRicher</p>
          {type==="webinar"&&<div style={{padding:"12px 14px",background:"rgba(196,150,90,0.08)",borderRadius:12,marginBottom:16}}><p style={{fontSize:14,fontWeight:700,color:W.cream,marginBottom:2}}>{data.event}</p><p style={{fontSize:12,color:W.soft}}>{data.eventNote}</p></div>}
          <button onClick={onBook} style={{width:"100%",padding:"15px",background:"#C4965A",border:"none",borderRadius:14,color:"#0E0A06",fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:8}}>{data.cta} →</button>
          <p style={{fontSize:11,color:W.soft,textAlign:"center",marginBottom:10}}>{data.ctaNote}</p>
          <button onClick={onDismiss} style={{width:"100%",padding:"11px",background:"transparent",border:"1px solid rgba(245,237,224,0.1)",borderRadius:12,color:W.soft,fontSize:13,cursor:"pointer"}}>I will come back to this</button>
        </div>
      )}
    </div>
  );
}

function BadgeUnlock({badge,persona,totalSaved,onClose}){
  const [phase,setPhase]=useState("badge");
  const [showC,setShowC]=useState(true);
  const tc={starter:"#94A3B8",bronze:"#C17B4E",silver:"#8B9BB4",gold:"#C4965A",platinum:"#E2E8F0"}[badge.tier]||"#C4965A";
  useEffect(()=>{const t=setTimeout(()=>setShowC(false),3500);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(10,5,0,0.97)",zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",overflowY:"auto",fontFamily:"'Nunito',sans-serif"}}>
      <Confetti active={showC}/>
      {phase==="badge"&&(
        <div style={{width:"100%",maxWidth:380,textAlign:"center"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.06)",borderRadius:99,padding:"4px 14px",marginBottom:24}}><div style={{width:8,height:8,borderRadius:"50%",background:tc}}/><span style={{fontSize:11,fontWeight:800,color:tc,letterSpacing:1.5,textTransform:"uppercase"}}>{badge.tier}</span></div>
          <div style={{fontSize:80,marginBottom:16}}>{badge.emoji}</div>
          <h1 style={{fontSize:32,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream,marginBottom:6}}>{badge.name}</h1>
          <p style={{fontSize:14,color:W.soft,marginBottom:24}}>{badge.desc}</p>
          <div style={{background:"rgba(196,150,90,0.1)",border:"1px solid rgba(196,150,90,0.2)",borderRadius:14,padding:"14px",marginBottom:20,display:"inline-block",minWidth:200}}>
            <p style={{fontSize:11,color:W.soft,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Total Saved</p>
            <p style={{fontSize:28,fontWeight:800,fontFamily:"'Fraunces',serif",color:"#C4965A"}}>${totalSaved.toLocaleString()}</p>
          </div>
          <div style={{background:"rgba(244,169,184,0.1)",border:"1px solid rgba(244,169,184,0.2)",borderRadius:14,padding:"14px 16px",marginBottom:24,textAlign:"left"}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:22,flexShrink:0}}>{persona.emoji}</span>
              <div><p style={{fontSize:11,fontWeight:800,color:persona.color,marginBottom:4}}>{persona.name}</p><p style={{fontSize:13,color:W.mid,lineHeight:1.6}}>{persona.badge()}</p></div>
            </div>
          </div>
          <button onClick={()=>setPhase("future")} style={{width:"100%",padding:"15px",background:"#C4965A",border:"none",borderRadius:14,color:"#0E0A06",fontSize:15,fontWeight:800,cursor:"pointer"}}>See what your Future Self says →</button>
        </div>
      )}
      {phase==="future"&&(
        <div style={{width:"100%",maxWidth:380}}>
          <div style={{textAlign:"center",marginBottom:24}}><span style={{fontSize:52}}>{badge.emoji}</span><h2 style={{fontSize:22,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream,marginTop:10}}>{badge.name}</h2></div>
          <div style={{background:"rgba(196,150,90,0.08)",border:"1px solid rgba(196,150,90,0.2)",borderRadius:18,padding:"18px 20px",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#C4965A,#E8A87C)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🌅</div><p style={{fontSize:11,fontWeight:800,color:"#C4965A",letterSpacing:0.5}}>YOUR FUTURE SELF</p></div>
            <p style={{fontSize:14,color:"rgba(245,237,224,0.85)",lineHeight:1.7,fontStyle:"italic",fontFamily:"'Fraunces',serif"}}>"{FUTURE_MSGS[badge.id]||FUTURE_MSGS.default}"</p>
          </div>
          {badge.retireRicher?<button onClick={()=>setPhase("rr")} style={{width:"100%",padding:"15px",background:"#C4965A",border:"none",borderRadius:14,color:"#0E0A06",fontSize:14,fontWeight:800,cursor:"pointer",marginBottom:10}}>RetireRicher has something to say →</button>:<button onClick={onClose} style={{width:"100%",padding:"15px",background:"#C4965A",border:"none",borderRadius:14,color:"#0E0A06",fontSize:15,fontWeight:800,cursor:"pointer"}}>Keep going</button>}
        </div>
      )}
      {phase==="rr"&&<div style={{width:"100%",maxWidth:380}}><RRCard type={badge.rrType} onBook={()=>{window.open("https://link.yourretirementplanningstrategist.com/widget/booking/4BfvSiRJQyoQuONKt582");onClose();}} onDismiss={onClose}/></div>}
    </div>
  );
}

function Bodyguard({zone,persona,resistanceStreak,onWalkAway,onWentIn}){
  const [phase,setPhase]=useState("intercept");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(10,5,0,0.97)",zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",fontFamily:"'Nunito',sans-serif"}}>
      {phase==="intercept"&&(
        <div style={{width:"100%",maxWidth:380}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:56,marginBottom:12}}>🚨</div>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:99,padding:"5px 14px",marginBottom:16}}><div style={{width:8,height:8,borderRadius:"50%",background:"#EF4444"}}/><span style={{fontSize:11,fontWeight:800,color:"#FCA5A5",letterSpacing:1.5}}>BUDGET BODYGUARD</span></div>
            <h2 style={{fontSize:26,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream}}>{zone.emoji} {zone.name} detected</h2>
          </div>
          <div style={{background:"rgba(244,169,184,0.1)",border:"1px solid rgba(244,169,184,0.2)",borderRadius:14,padding:"14px 16px",marginBottom:20}}>
            <div style={{display:"flex",gap:10}}><span style={{fontSize:24,flexShrink:0}}>{persona.emoji}</span><div><p style={{fontSize:11,fontWeight:800,color:persona.color,marginBottom:4}}>{persona.name}</p><p style={{fontSize:13,color:W.mid,lineHeight:1.65}}>{persona.resist(zone.name)}</p></div></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={()=>setPhase("followup")} style={{padding:"16px",background:"#C4965A",border:"none",borderRadius:14,color:"#0E0A06",fontSize:15,fontWeight:800,cursor:"pointer"}}>Walking Away</button>
            <button onClick={onWentIn} style={{padding:"14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:14,color:"#FCA5A5",fontSize:14,fontWeight:700,cursor:"pointer"}}>I am going in</button>
          </div>
        </div>
      )}
      {phase==="followup"&&(
        <div style={{width:"100%",maxWidth:380,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>👀</div>
          <h2 style={{fontSize:24,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream,marginBottom:8}}>10 minutes later...</h2>
          <p style={{fontSize:14,color:W.soft,marginBottom:24}}>Did you actually walk away?</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={onWalkAway} style={{padding:"16px",background:"#C4965A",border:"none",borderRadius:14,color:"#0E0A06",fontSize:15,fontWeight:800,cursor:"pointer"}}>Yes I did!</button>
            <button onClick={onWentIn} style={{padding:"14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,color:W.soft,fontSize:13,fontWeight:600,cursor:"pointer"}}>Okay I went in</button>
          </div>
        </div>
      )}
    </div>
  );
}

function WalkAwayResult({persona,onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(10,5,0,0.97)",zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",fontFamily:"'Nunito',sans-serif"}}>
      <Confetti active={true}/>
      <div style={{width:"100%",maxWidth:380,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:16}}>🏆</div>
        <h2 style={{fontSize:28,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream,marginBottom:16}}>You walked away.</h2>
        <div style={{background:"rgba(196,150,90,0.1)",border:"1px solid rgba(196,150,90,0.25)",borderRadius:14,padding:"16px",marginBottom:20,display:"inline-block",minWidth:220}}>
          <p style={{fontSize:11,color:W.soft,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Saved Just Now</p>
          <p style={{fontSize:32,fontWeight:800,fontFamily:"'Fraunces',serif",color:"#C4965A"}}>~$8.50</p>
        </div>
        <div style={{background:"rgba(244,169,184,0.1)",border:"1px solid rgba(244,169,184,0.2)",borderRadius:14,padding:"14px 16px",marginBottom:16,textAlign:"left"}}>
          <div style={{display:"flex",gap:10}}><span style={{fontSize:22,flexShrink:0}}>{persona.emoji}</span><p style={{fontSize:13,color:W.mid,lineHeight:1.65}}>{persona.walkaway()}</p></div>
        </div>
        <button style={{width:"100%",padding:"15px",background:"#C4965A",border:"none",borderRadius:14,color:"#0E0A06",fontSize:14,fontWeight:800,cursor:"pointer",marginBottom:10}}>Move $8.50 to savings →</button>
        <button onClick={onClose} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid rgba(245,237,224,0.1)",borderRadius:12,color:W.soft,fontSize:13,cursor:"pointer"}}>Done</button>
      </div>
    </div>
  );
}

// ── ONBOARDING ─────────────────────────────────────────────────────────────────
function Onboarding({onComplete}){
  const [screen,setScreen]=useState(0);
  const [habitLabel,setHabitLabel]=useState("");
  const [selectedGoals,setSelectedGoals]=useState([]);
  const [goalAmounts,setGoalAmounts]=useState({});
  const [weeklyCommitment,setWeeklyCommitment]=useState(null);
  const [savingFrequency,setSavingFrequency]=useState("weekly");
  const [customSavings,setCustomSavings]=useState(0);
  const [selectedPersona,setSelectedPersona]=useState(null);
  const [firstExpense,setFirstExpense]=useState(null);
  const [recording,setRecording]=useState(false);
  const [transcript,setTranscript]=useState("");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [zip,setZip]=useState("");
  const [createError,setCreateError]=useState("");
  const recRef=useRef();

  const next=()=>setScreen(s=>s+1);
  const back=()=>setScreen(s=>Math.max(0,s-1));
  const c=(s={})=>({background:W.card,border:`1px solid ${W.border}`,borderRadius:18,padding:18,...s});
  const btn=(s={})=>({width:"100%",padding:"15px",background:W.accent,border:"none",borderRadius:14,color:W.bg,fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif",...s});

  const startRec=()=>{
    setTranscript("");
    if(!("webkitSpeechRecognition" in window)&&!("SpeechRecognition" in window)){
      setTranscript("I spent $38 at Starbucks for coffee");
      setFirstExpense({amount:38,store:"Starbucks",date:todayStr(),purpose:"coffee",category:"food",member:name||"You"});
      return;
    }
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec=new SR();rec.continuous=false;rec.interimResults=true;rec.lang="en-US";
    let last="";
    rec.onresult=e=>{last=Array.from(e.results).map(r=>r[0].transcript).join(" ");setTranscript(last);};
    rec.onend=()=>{setRecording(false);if(last){setFirstExpense({amount:38,store:last,date:todayStr(),purpose:"expense",category:"other",member:name||"You"});}};
    rec.onerror=()=>setRecording(false);
    recRef.current=rec;rec.start();setRecording(true);
  };
  const stopRec=()=>{recRef.current?.stop();setRecording(false);};
  const demoEntry=()=>{
    setTranscript("I spent $38 at Starbucks for coffee");
    setFirstExpense({amount:38,store:"Starbucks",date:todayStr(),purpose:"coffee",category:"food",member:name||"You"});
  };

  const handleComplete=()=>{
    if(!name||!email){setCreateError("Please enter your name and email.");return;}
    // Fire GHL webhook on registration
    fireGHLWebhook("new_registration", {
      first_name: name,
      email: email,
      phone: "",
      zip: zip,
      habit_label: habitLabel,
      weekly_commitment: weeklyCommitment||10,
      goals: selectedGoals,
      coach: selectedPersona?.name||"Nana Rose",
      source: "rich_girl_habits_app"
    });
    const userData={name,email,password,zip,goals:selectedGoals.map(id=>({id,...GOAL_OPTIONS_MAP[id],saved:0,target:goalAmounts[id]||GOAL_OPTIONS_MAP[id].presets[1]})),persona:selectedPersona||PERSONAS[0],weeklyCommitment:weeklyCommitment||10,habitLabel,onboarded:true};
    saveData("rgh_user",userData);
    onComplete(userData,firstExpense);
  };

  const inp={width:"100%",padding:"14px",background:"rgba(255,255,255,0.05)",border:`1px solid ${W.border}`,borderRadius:12,color:W.cream,fontSize:14,outline:"none",marginBottom:12,fontFamily:"'Nunito',sans-serif"};

  const SCREENS=[
    // 0 — Splash
   <div key={0} style={{minHeight:"100vh",background:W.bg,backgroundImage:"url('/7EA228FB-BB36-4BE9-829D-C86EAAE98B1F.png')",backgroundSize:"cover",backgroundPosition:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center"}}>
      <h1 style={{fontSize:42,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.accent,marginBottom:12,lineHeight:1.1}}>Rich Girl Habits</h1>
      <p style={{fontSize:16,color:W.mid,marginBottom:8,lineHeight:1.6,fontStyle:"italic",fontFamily:"'Fraunces',serif"}}>"Your future self wants you to."</p>
      <p style={{fontSize:13,color:W.soft,marginBottom:48}}>"For when you have more month than money."</p>
      <button onClick={next} style={btn({fontSize:20,padding:"18px",marginBottom:12})}>Start your saving journey →</button>
      <p style={{fontSize:11,color:W.soft}}>A RetireRicher product</p>
    </div>,

    // 1 — Money habits
    <div key={1} style={{minHeight:"100vh",background:W.bg,display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 24px"}}>
      <h2 style={{fontSize:28,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream,marginBottom:8,textAlign:"center"}}>Tell me about your money habits</h2>
      <p style={{fontSize:14,color:W.mid,marginBottom:32,lineHeight:1.6,textAlign:"center"}}>Pick the one that sounds most like you</p>
      {[
        {emoji:"💸",label:"I spend first, save later",     desc:"Whatever is left at the end of the month... if there is anything left"},
        {emoji:"📊",label:"I track but I am inconsistent", desc:"I start strong then fall off. I know what I should do, I just do not do it"},
        {emoji:"🌱",label:"I am building good habits",     desc:"I am getting there. I save regularly but want to do more"},
        {emoji:"💎",label:"I have got this",               desc:"My habits are solid. I just want to track and grow"},
      ].map((opt,i)=>(
        <button key={i} onClick={()=>{setHabitLabel(opt.label);next();}} style={{width:"100%",padding:"16px 18px",background:W.card,border:`1.5px solid ${W.border}`,borderRadius:14,marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12,fontFamily:"'Nunito',sans-serif",textAlign:"left",transition:"all 0.2s"}}>
          <span style={{fontSize:28,flexShrink:0}}>{opt.emoji}</span>
          <div><p style={{fontSize:15,fontWeight:700,color:W.cream,marginBottom:3}}>{opt.label}</p><p style={{fontSize:12,color:W.soft}}>{opt.desc}</p></div>
        </button>
      ))}
    </div>,

    // 2 — How it works
    <div key={2} style={{minHeight:"100vh",background:W.bg,padding:"60px 24px 100px",fontFamily:"'Nunito',sans-serif"}}>
      <h2 style={{fontSize:24,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream,marginBottom:8,textAlign:"center"}}>Here is how Rich Girl Habits works</h2>
      <p style={{fontSize:13,color:W.soft,textAlign:"center",marginBottom:28}}>Four things that change everything</p>
      {[
        {emoji:"🎙️",title:"Voice logging",     desc:"Say 'I spent $38 at Starbucks' — AI parses it instantly. No typing."},
        {emoji:"👩‍💼",title:"Your coach",        desc:"Pick a coach who reacts to everything you do. In character. Always."},
        {emoji:"📧",title:"Sunday Report",     desc:"Every Sunday — your week in numbers, your pattern, your goal, what it becomes."},
        {emoji:"📈",title:"Growth tracker",    desc:"See exactly what your habits become over 1, 5, 10, 30 years."},
      ].map(item=>(
        <div key={item.emoji} style={{...c({marginBottom:12,display:"flex",gap:14,alignItems:"flex-start"})}}>
          <span style={{fontSize:28,flexShrink:0}}>{item.emoji}</span>
          <div><p style={{fontSize:14,fontWeight:700,marginBottom:4,color:W.cream}}>{item.title}</p><p style={{fontSize:13,color:W.mid,lineHeight:1.6}}>{item.desc}</p></div>
        </div>
      ))}
      <button onClick={next} style={btn({marginTop:16})}>I am ready →</button>
    </div>,

    // 3 — Goals + preset amounts
    <div key={3} style={{minHeight:"100vh",background:W.bg,padding:"60px 24px 100px",fontFamily:"'Nunito',sans-serif"}}>
      <h2 style={{fontSize:28,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream,marginBottom:12}}>What are you saving for?</h2>
      <div style={{background:"rgba(232,149,106,0.08)",border:`1px solid ${W.border}`,borderRadius:14,padding:"14px 16px",marginBottom:20}}>
        <p style={{fontSize:14,color:W.mid,lineHeight:1.7,marginBottom:6}}>Goals without a number are just wishes. The moment you attach a dollar amount to a goal it becomes a plan — and your brain starts working toward it differently.</p>
        <p style={{fontSize:13,color:W.soft,lineHeight:1.6}}>Select what you are saving for and tap a target amount. You can always adjust later.</p>
      </div>
      {Object.entries(GOAL_OPTIONS_MAP).map(([id,g])=>{
        const sel=selectedGoals.includes(id);
        const chosenAmt=goalAmounts[id];
        return(
          <div key={id} style={{marginBottom:8}}>
            <button onClick={()=>setSelectedGoals(p=>sel?p.filter(x=>x!==id):[...p,id])} style={{width:"100%",padding:"14px 16px",background:sel?W.aLight:"rgba(255,255,255,0.03)",border:`1.5px solid ${sel?W.accent:W.border}`,borderRadius:sel?"14px 14px 0 0":14,color:sel?W.cream:W.mid,cursor:"pointer",display:"flex",alignItems:"center",gap:12,fontFamily:"'Nunito',sans-serif",transition:"all 0.2s"}}>
              <span style={{fontSize:22}}>{g.emoji}</span>
              <div style={{textAlign:"left",flex:1}}><p style={{fontSize:14,fontWeight:700}}>{g.label}</p>{chosenAmt&&<p style={{fontSize:11,color:"#6EE7B7",marginTop:2}}>Target: ${chosenAmt.toLocaleString()}</p>}</div>
              <span style={{color:sel?W.accent:W.soft,fontSize:14}}>{sel?"▲":"▼"}</span>
            </button>
            {sel&&(
              <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.02)",borderRadius:"0 0 14px 14px",border:`1px solid ${W.border}`,borderTop:"none"}}>
                <p style={{fontSize:11,color:W.soft,marginBottom:8}}>Tap your target amount:</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {g.presets.map(p=>(
                    <button key={p} onClick={()=>setGoalAmounts(prev=>({...prev,[id]:p}))} style={{padding:"8px 14px",background:chosenAmt===p?"#C4965A":W.aLight,border:`1px solid ${chosenAmt===p?"#C4965A":W.border}`,borderRadius:99,fontSize:13,color:chosenAmt===p?"#0A0500":W.cream,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>${p.toLocaleString()}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <button onClick={next} disabled={selectedGoals.length===0} style={btn({opacity:selectedGoals.length>0?1:0.4,marginTop:16})}>Continue →</button>
    </div>,

    // 4 — Savings — frequency + custom amount
    <div key={4} style={{minHeight:"100vh",background:W.bg,padding:"60px 24px 100px",fontFamily:"'Nunito',sans-serif"}}>
      <h2 style={{fontSize:24,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream,marginBottom:12}}>How much can you save?</h2>
      <div style={{background:"rgba(232,149,106,0.08)",border:`1px solid ${W.border}`,borderRadius:14,padding:"14px 16px",marginBottom:20}}>
        <p style={{fontSize:14,color:W.mid,lineHeight:1.7,marginBottom:6}}>Choose the frequency that fits your life. Weekly savers build the habit faster. Monthly works better if you save from a paycheck.</p>
        <p style={{fontSize:13,color:W.soft}}>Pick one — then enter your amount below.</p>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        {["weekly","monthly"].map(f=>(
          <button key={f} onClick={()=>setSavingFrequency(f)} style={{flex:1,padding:"14px",background:savingFrequency===f?W.aLight:"rgba(255,255,255,0.03)",border:`2px solid ${savingFrequency===f?W.accent:W.border}`,borderRadius:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",transition:"all 0.2s"}}>
            <p style={{fontSize:15,fontWeight:800,color:savingFrequency===f?W.cream:W.mid,textTransform:"capitalize"}}>{f}</p>
            <p style={{fontSize:11,color:W.soft,marginTop:3}}>{f==="weekly"?"4x per month":"Once per month"}</p>
          </button>
        ))}
      </div>
      <p style={{fontSize:11,color:W.soft,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Your {savingFrequency||"weekly"} amount</p>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:22,color:W.accent,fontWeight:800,flexShrink:0}}>$</span>
        <input
          type="number"
          value={customSavings}
          onChange={e=>{setCustomSavings(e.target.value);setWeeklyCommitment(savingFrequency==="monthly"?Math.round(Number(e.target.value)/4.33):Number(e.target.value));}}
          placeholder="Enter amount"
          style={{flex:1,padding:"14px",background:"rgba(255,255,255,0.05)",border:`1.5px solid ${W.border}`,borderRadius:12,color:W.cream,fontSize:22,fontWeight:800,outline:"none",fontFamily:"'Nunito',sans-serif"}}
        />
        <span style={{fontSize:14,color:W.soft,flexShrink:0}}>/{savingFrequency||"week"}</span>
      </div>
      <p style={{fontSize:11,color:W.soft,marginBottom:6,textAlign:"center"}}>Or tap a quick amount:</p>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {(savingFrequency==="monthly"?[50,100,200,500]:[10,25,50,100]).map(amt=>(
          <button key={amt} onClick={()=>{setCustomSavings(amt);setWeeklyCommitment(savingFrequency==="monthly"?Math.round(amt/4.33):amt);}} style={{flex:1,minWidth:60,padding:"10px 8px",background:customSavings===amt?W.aLight:"rgba(255,255,255,0.03)",border:`1.5px solid ${customSavings===amt?W.accent:W.border}`,borderRadius:10,cursor:"pointer",fontFamily:"'Nunito',sans-serif",color:customSavings===amt?W.cream:W.mid,fontSize:14,fontWeight:700}}>${amt}</button>
        ))}
      </div>
      {customSavings>0&&(
        <div style={{...c({background:"rgba(110,231,183,0.08)",borderColor:"rgba(110,231,183,0.2)",textAlign:"center",marginBottom:20})}}>
          <Sparkle size={14}/>
          <p style={{fontSize:13,color:W.mid,marginTop:8,lineHeight:1.7}}>
            <strong style={{color:W.accent}}>${customSavings}/{savingFrequency==="monthly"?"mo":"wk"}</strong> becomes{" "}
            <strong style={{color:"#6EE7B7"}}>{formatK(compound(savingFrequency==="monthly"?Math.round(customSavings/4.33):customSavings,5))}</strong> in 5 years and{" "}
            <strong style={{color:"#6EE7B7"}}>{formatK(compound(savingFrequency==="monthly"?Math.round(customSavings/4.33):customSavings,30))}</strong> in 30 years.
          </p>
          <p style={{fontSize:11,color:W.soft,marginTop:4}}>at 7% annual return</p>
        </div>
      )}
      <button onClick={next} disabled={!customSavings||customSavings<=0} style={btn({opacity:customSavings>0?1:0.4})}>That is powerful →</button>
    </div>,

    // 5 — Choose your coach
    <div key={5} style={{minHeight:"100vh",background:W.bg,padding:"60px 24px 100px",fontFamily:"'Nunito',sans-serif"}}>
      <h2 style={{fontSize:24,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream,marginBottom:12}}>Choose Your Coach</h2>
      <div style={{background:"rgba(232,149,106,0.08)",border:`1px solid ${W.border}`,borderRadius:14,padding:"14px 16px",marginBottom:24}}>
        <p style={{fontSize:14,color:W.mid,lineHeight:1.7,marginBottom:6}}>Changing habits is hard alone. Your coach shows up every time you log a spend — reacting, celebrating, or pushing back — in a way that resonates with you.</p>
        <p style={{fontSize:13,color:W.soft}}>Pick the energy that fits your personality. You can change this anytime.</p>
      </div>
      {[
        {id:"nana",  name:"Nana Rose",   emoji:"👵", color:"#F4A9B8", tagline:"For when you need love and encouragement"},
        {id:"moneymom",name:"Money Mom", emoji:"💁‍♀️",color:"#C4965A", tagline:"For when you need someone to keep it real"},
        {id:"bestie",name:"Your Bestie", emoji:"⭐", color:"#E8956A", tagline:"For when you need hype and celebration"},
        {id:"savage",name:"Savage Chef", emoji:"👨‍🍳",color:"#D4723E", tagline:"For when you need brutal honesty"},
      ].map(p=>{
        const sel=selectedPersona?.id===p.id;
        const full=PERSONAS.find(x=>x.id===p.id);
        return(<button key={p.id} onClick={()=>setSelectedPersona(full||p)} style={{width:"100%",padding:"16px",background:sel?W.aLight:"rgba(255,255,255,0.03)",border:`1.5px solid ${sel?W.accent:W.border}`,borderRadius:14,marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:14,fontFamily:"'Nunito',sans-serif",transition:"all 0.2s",textAlign:"left"}}>
          <span style={{fontSize:32,flexShrink:0}}>{p.emoji}</span>
          <div style={{flex:1}}>
            <p style={{fontSize:15,fontWeight:800,color:sel?W.cream:W.mid,marginBottom:3}}>{p.name}</p>
            <p style={{fontSize:12,color:p.color,fontWeight:700,marginBottom:4}}>{p.tagline}</p>
            <p style={{fontSize:11,color:W.soft,fontStyle:"italic"}}>{full?.react("Starbucks","38").slice(0,55)}...</p>
          </div>
          {sel&&<span style={{color:W.accent,fontSize:20,flexShrink:0}}>✓</span>}
        </button>);
      })}
      <button onClick={next} disabled={!selectedPersona} style={btn({opacity:selectedPersona?1:0.4,marginTop:8})}>This is my coach →</button>
    </div>,

    // 6 — Welcome — personalized summary
    <div key={6} style={{minHeight:"100vh",background:W.bg,padding:"60px 24px 100px",fontFamily:"'Nunito',sans-serif",textAlign:"center"}}>
      <Confetti active={true}/>
      <h2 style={{fontSize:32,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.accent,marginBottom:4}}>You are ready.</h2>
      <p style={{fontSize:15,color:W.mid,marginBottom:28,lineHeight:1.6,fontStyle:"italic"}}>"Your future self wants you to."</p>
      <div style={{...c({marginBottom:14,textAlign:"left"})}}>
        <p style={{fontSize:11,color:W.soft,letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>Your Setup</p>
        {[
          ["Money habit",   habitLabel||"Building habits"],
          ["Goals",         `${selectedGoals.length} selected`],
          ["Saving target", `$${weeklyCommitment||10}/${savingFrequency==="monthly"?"mo":"wk"}`],
          ["Your coach",    `${selectedPersona?.emoji} ${selectedPersona?.name}`],
        ].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid rgba(253,240,232,0.06)`}}>
            <span style={{fontSize:13,color:W.mid}}>{k}</span>
            <span style={{fontSize:13,fontWeight:700,color:k==="Weekly target"?"#6EE7B7":W.cream}}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{...c({background:"rgba(232,149,106,0.06)",marginBottom:24,display:"flex",gap:10,alignItems:"flex-start",textAlign:"left"})}}>
        <span style={{fontSize:20}}>🌱</span>
        <div><p style={{fontSize:11,fontWeight:800,color:W.accent,marginBottom:3}}>RETIREDRICHER</p><p style={{fontSize:12,color:W.mid,lineHeight:1.6,fontStyle:"italic"}}>"Know where you are. Know where you want to be. Close the gap. You just took the first step."</p></div>
      </div>
      <button onClick={next} style={btn({fontSize:18,padding:"18px"})}>Let us log your first spend →</button>
      <p style={{fontSize:11,color:W.soft,marginTop:10}}>We will walk you through it together</p>
    </div>,

    // 7 — Recording tutorial
    <div key={7} style={{minHeight:"100vh",background:W.bg,padding:"60px 24px 100px",fontFamily:"'Nunito',sans-serif"}}>
      <h2 style={{fontSize:24,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.cream,marginBottom:12}}>Let us log your first spend</h2>
      <div style={{background:"rgba(232,149,106,0.08)",border:`1px solid ${W.border}`,borderRadius:14,padding:"14px 16px",marginBottom:24}}>
        <p style={{fontSize:14,color:W.mid,lineHeight:1.7,marginBottom:6}}>You cannot change what you cannot see. Logging your spends is not about judgment — it is about awareness. That awareness is what turns frustrated spenders into proud savers.</p>
        <p style={{fontSize:13,color:W.soft}}>It takes 5 seconds. Here is how:</p>
      </div>
      {[
        {step:"1",title:"Hold the mic button",  desc:"Press and hold the orange button below",         emoji:"🎙️"},
        {step:"2",title:"Say what you spent",      desc:"I spent $38 at Starbucks for coffee",            emoji:"🗣️"},
        {step:"3",title:"Confirm and save",      desc:"We will parse it automatically",                 emoji:"✓"},
      ].map(s=>(
        <div key={s.step} style={{...c({marginBottom:10,display:"flex",gap:14,alignItems:"center"})}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:W.aLight,border:`1.5px solid ${W.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:W.accent,flexShrink:0}}>{s.step}</div>
          <div style={{flex:1}}><p style={{fontSize:14,fontWeight:700,color:W.cream,marginBottom:2}}>{s.title}</p><p style={{fontSize:12,color:W.soft,fontStyle:"italic"}}>{s.desc}</p></div>
          <span style={{fontSize:22}}>{s.emoji}</span>
        </div>
      ))}
      <div style={{...c({background:"rgba(244,169,184,0.1)",borderColor:"rgba(244,169,184,0.2)",marginTop:16,marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"})}}>
        <span style={{fontSize:22,flexShrink:0}}>{selectedPersona?.emoji||"👵"}</span>
        <div><p style={{fontSize:11,fontWeight:800,color:"#F4A9B8",marginBottom:3}}>{selectedPersona?.name||"Nana Rose"}</p><p style={{fontSize:13,color:W.mid,lineHeight:1.6}}>I am right here with you. Just press and hold and tell me what you spent!</p></div>
      </div>
      <div style={{textAlign:"center",marginBottom:16}}>
        <button onMouseDown={startRec} onMouseUp={stopRec} onTouchStart={startRec} onTouchEnd={stopRec}
          style={{width:80,height:80,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:28,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",background:recording?"linear-gradient(135deg,#EF4444,#DC2626)":`linear-gradient(135deg,${W.rose},${W.accent})`}}>
          {recording?"⏹":"🎙️"}
        </button>
        <p style={{marginTop:10,fontSize:12,color:W.soft}}>{recording?"Listening... release to stop":"Hold to speak"}</p>
      </div>
      <button onClick={demoEntry} style={{width:"100%",padding:"11px",background:"transparent",border:`1px dashed ${W.border}`,borderRadius:12,color:W.soft,fontSize:12,cursor:"pointer",marginBottom:16}}>Or tap here for a demo entry</button>
      {transcript&&<div style={{...c({marginBottom:14})}}><p style={{fontSize:11,color:W.soft,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Heard</p><p style={{fontSize:14,fontStyle:"italic",color:W.mid}}>"{transcript}"</p></div>}
      {firstExpense&&(
        <div style={{...c({marginBottom:14,background:"rgba(110,231,183,0.08)",borderColor:"rgba(110,231,183,0.2)"})}}>
          <p style={{fontSize:11,color:"#6EE7B7",marginBottom:8,fontWeight:700}}>Logged successfully!</p>
          <p style={{fontSize:20,fontWeight:800,fontFamily:"'Fraunces',serif",marginBottom:4}}>${firstExpense.amount?.toFixed(2)}</p>
          <p style={{fontSize:13,color:W.mid}}>{firstExpense.store} · {firstExpense.purpose}</p>
          <button onClick={next} style={btn({marginTop:14})}>Save my progress →</button>
        </div>
      )}
      {!firstExpense&&<button onClick={next} style={btn({background:"transparent",border:`1px solid ${W.border}`,color:W.soft,fontSize:14})}>Skip for now →</button>}
    </div>,

    // 8 — Create account (last step — Option A)
    <div key={8} style={{minHeight:"100vh",background:W.bg,backgroundImage:"url('/7EA228FB-BB36-4BE9-829D-C86EAAE98B1F.png')",backgroundSize:"cover",backgroundPosition:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",fontFamily:"'Nunito',sans-serif"}}>
      <h2 style={{fontSize:28,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.accent,marginBottom:6,textAlign:"center"}}>Save your progress</h2>
      <p style={{fontSize:13,color:W.mid,marginBottom:28,textAlign:"center",lineHeight:1.6}}>Create your account so your data is never lost</p>
      <div style={{width:"100%",maxWidth:380,background:"rgba(10,5,0,0.85)",borderRadius:20,padding:"28px 24px",border:`1px solid ${W.border}`}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your first name" style={inp}/>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={inp}/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password" type="password" style={inp}/>
        <input value={zip} onChange={e=>setZip(e.target.value)} placeholder="ZIP code (for local insights)" style={{...inp,marginBottom:0}}/>
        {createError&&<p style={{fontSize:12,color:"#FCA5A5",marginTop:10,textAlign:"center"}}>{createError}</p>}
        <button onClick={handleComplete} style={btn({marginTop:16})}>I am ready — let's go →</button>
        <p style={{fontSize:11,color:W.soft,textAlign:"center",marginTop:12}}>Already have an account? <span onClick={()=>{}} style={{color:W.accent,cursor:"pointer",textDecoration:"underline"}}>Sign in</span></p>
      </div>
    </div>,
  ];

  return(
    <div style={{fontFamily:"'Nunito',sans-serif",color:W.cream,background:W.bg,minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,400&family=Nunito:wght@400;600;700;800&display=swap');@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes cfFall{to{transform:translateY(110vh) rotate(540deg);opacity:0}}@keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}*{box-sizing:border-box;margin:0;padding:0}button,input{font-family:'Nunito',sans-serif}::-webkit-scrollbar{display:none}body{background:#0A0500;margin:0}`}</style>
      {SCREENS[screen]}
      {screen>0&&screen<SCREENS.length-1&&<button onClick={back} style={{position:"fixed",top:20,left:20,background:"none",border:"none",color:W.soft,cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",zIndex:100}}>← Back</button>}
      <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,zIndex:100}}>
        {SCREENS.map((_,i)=><div key={i} style={{width:i===screen?20:6,height:6,borderRadius:3,background:i===screen?W.accent:"rgba(253,240,232,0.15)",transition:"all 0.3s"}}/>)}
      </div>
    </div>
  );
}

// ── RETURN VISITOR LOGIN ────────────────────────────────────────────────────────
function ReturnLogin({onLogin}){
  const [email,setEmail]=useState("");
  const [error,setError]=useState("");
  const inp={width:"100%",padding:"14px",background:"rgba(255,255,255,0.05)",border:`1px solid ${W.border}`,borderRadius:12,color:W.cream,fontSize:14,outline:"none",marginBottom:12,fontFamily:"'Nunito',sans-serif"};
  const handleLogin=()=>{
    const saved=loadData("rgh_user",null);
    if(!saved){setError("No account found. Please complete setup.");return;}
    if(saved.email===email){onLogin(saved);}
    else{setError("Email not found.");}
  };
  return(
    <div style={{minHeight:"100vh",background:W.bg,backgroundImage:"url('/7EA228FB-BB36-4BE9-829D-C86EAAE98B1F.png')",backgroundSize:"cover",backgroundPosition:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",fontFamily:"'Nunito',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,400&family=Nunito:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{background:#0A0500;}`}</style>
      <h1 style={{fontSize:36,fontWeight:300,fontFamily:"'Fraunces',serif",fontStyle:"italic",color:W.accent,marginBottom:6,textAlign:"center"}}>Welcome back</h1>
      <p style={{fontSize:13,color:W.mid,marginBottom:32,textAlign:"center",fontStyle:"italic"}}>"Your future self wants you to."</p>
      <div style={{width:"100%",maxWidth:380,background:"rgba(10,5,0,0.85)",borderRadius:20,padding:"28px 24px",border:`1px solid ${W.border}`}}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={inp}/>
        {error&&<p style={{fontSize:12,color:"#FCA5A5",marginBottom:12,textAlign:"center"}}>{error}</p>}
        <button onClick={handleLogin} style={{width:"100%",padding:"15px",background:W.accent,border:"none",borderRadius:14,color:W.bg,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Sign In →</button>
      </div>
      <p style={{fontSize:11,color:W.soft,marginTop:16,textAlign:"center"}}>A RetireRicher product</p>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App(){
  const [appState,setAppState]=useState(()=>{
    const u=loadData("rgh_user",null);
    if(!u) return "onboard";
    if(u.onboarded) return "login";
    return "onboard";
  });
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("home");
  const [expenses,setExpenses]=useState([]);
  const [goals,setGoals]=useState([]);
  const [transcript,setTranscript]=useState("");
  const [parsed,setParsed]=useState(null);
  const [saving,setSaving]=useState(false);
  const [reaction,setReaction]=useState("");
  const [recording,setRecording]=useState(false);
  const [cutTo,setCutTo]=useState(4);
  const [activeBadge,setActiveBadge]=useState(null);
  const [activeBodyguard,setActiveBodyguard]=useState(null);
  const [showWalkAway,setShowWalkAway]=useState(false);
  const [earnedBadges,setEarnedBadges]=useState(()=>loadData("rgh_badges",[]));
  const [resistanceStreak,setResistanceStreak]=useState(0);
  const [logDates,setLogDates]=useState(()=>loadData("rgh_logdates",[]));
  const recRef=useRef();
  const nextId=useRef(100);

  const persona=user?.persona||PERSONAS[0];
  const thisMonth=expenses.filter(e=>e.date?.startsWith(monthStr()));
  const totalSpent=thisMonth.reduce((s,e)=>s+e.amount,0);
  const totalBudget=Object.values(BUDGETS).reduce((a,b)=>a+b,0);
  const totalSaved=goals.reduce((s,g)=>s+(g.saved||0),0);
  const byCat={};
  thisMonth.forEach(e=>{byCat[e.category]=(byCat[e.category]||0)+e.amount;});
  const weeklySaved=(8-cutTo)*8.50;
  const y1=compound(weeklySaved,1);
  const y5=compound(weeklySaved,5);
  const y10=compound(weeklySaved,10);
  const y30=compound(weeklySaved,30);

  useEffect(()=>{saveData("rgh_expenses",expenses);},[expenses]);
  useEffect(()=>{saveData("rgh_badges",earnedBadges);},[earnedBadges]);
  useEffect(()=>{saveData("rgh_logdates",logDates);},[logDates]);

  const checkMilestoneWebhook=(totalSaved, user)=>{
    if(totalSaved >= 2500){
      fireGHLWebhook("milestone_2500", {
        first_name: user?.name,
        email: user?.email,
        total_saved: totalSaved,
        milestone: "2500",
        trigger: "webinar_invite"
      });
    } else if(totalSaved >= 1000){
      fireGHLWebhook("milestone_1000", {
        first_name: user?.name,
        email: user?.email,
        total_saved: totalSaved,
        milestone: "1000"
      });
    } else if(totalSaved >= 500){
      fireGHLWebhook("milestone_500", {
        first_name: user?.name,
        email: user?.email,
        total_saved: totalSaved,
        milestone: "500"
      });
    }
  };

  const checkBadge=(id)=>{
    if(!earnedBadges.includes(id)){
      const badge=BADGES.find(b=>b.id===id);
      if(badge){setEarnedBadges(p=>[...p,id]);setTimeout(()=>setActiveBadge(badge),300);}
    }
  };

  const checkWeekStreak=(dates)=>{
    const unique=[...new Set(dates)].sort();
    if(unique.length>=7) checkBadge("week_streak");
  };

  const startRec=()=>{
    setTranscript("");setParsed(null);setSaving(false);setReaction("");
    if(!("webkitSpeechRecognition" in window)&&!("SpeechRecognition" in window)){setTranscript("Demo mode — tap the demo button below");return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec=new SR();rec.continuous=false;rec.interimResults=true;rec.lang="en-US";
    let last="";
    rec.onresult=e=>{last=Array.from(e.results).map(r=>r[0].transcript).join(" ");setTranscript(last);};
    rec.onend=()=>{setRecording(false);if(last)setParsed({amount:38.50,store:"Starbucks",date:todayStr(),purpose:"coffee",category:"food"});};
    rec.onerror=()=>setRecording(false);
    recRef.current=rec;rec.start();setRecording(true);
  };
  const stopRec=()=>{recRef.current?.stop();setRecording(false);};
  const demo=()=>{setTranscript("I spent $38.50 at Starbucks for coffee");setParsed({amount:38.50,store:"Starbucks",date:todayStr(),purpose:"coffee",category:"food"});};

  const save=()=>{
    if(!parsed)return;
    const newExp={id:nextId.current++,...parsed,member:user?.name||"You"};
    const currentCount=expenses.length;
    setExpenses(p=>[newExp,...p]);
    setSaving(true);
    if(currentCount===0){setReaction("First one logged! Awareness is everything. You are already doing better than yesterday.");}
    else if(currentCount===1){setReaction("You logged it again! Two in a row. This is how habits form.");}
    else if(currentCount===2){setReaction("Three spends tracked! You are getting the hang of this.");}
    else{setReaction(persona.save());}
    const today=todayStr();
    const newDates=[...logDates,today];
    setLogDates(newDates);
    checkWeekStreak(newDates);
    setTimeout(()=>{setParsed(null);setTranscript("");setSaving(false);},400);
    // Check milestones after save
    setTimeout(()=>checkMilestoneWebhook(totalSaved, user), 500);
  };

  const CSS=`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,400&family=Nunito:wght@400;600;700;800&display=swap');
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
    @keyframes pulseR{0%,100%{box-shadow:0 0 0 4px rgba(239,68,68,0.2)}50%{box-shadow:0 0 0 18px rgba(239,68,68,0.04)}}
    @keyframes glowP{0%,100%{box-shadow:0 0 0 4px rgba(232,149,106,0.2)}50%{box-shadow:0 0 0 18px rgba(232,149,106,0.04)}}
    @keyframes cfFall{to{transform:translateY(110vh) rotate(540deg);opacity:0}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
    button,input{font-family:'Nunito',sans-serif;}
    ::-webkit-scrollbar{display:none;}
    body{background:#0A0500;margin:0;}
  `;

  const card=(s={})=>({background:W.card,border:`1px solid ${W.border}`,borderRadius:18,padding:18,...s});
  const NAV=[{id:"home",emoji:"🏠",label:"Home"},{id:"record",emoji:"🎙️",label:"Record"},{id:"growth",emoji:"📈",label:"Growth"},{id:"history",emoji:"📋",label:"History"}];

  // SPLASH — first screen everyone sees
  if(appState==="splash") return(
    <Onboarding user={null} onComplete={(data)=>{
      const updatedUser={...data,onboarded:true};
      saveUser(updatedUser);
      setUser(updatedUser);
      setGoals(data.goals||[]);
      if(data.firstExpense){
        const exp={id:1,...data.firstExpense};
        setExpenses([exp]);
        saveExpenses([exp]);
      }
      checkBadge("welcome");
      setAppState("app");
      setTab("home");
    }} isSplashOnly={false}/>
  );

  // ONBOARDING — no login yet
  if(appState==="onboard") return(
    <Onboarding onComplete={(userData,firstExp)=>{
      setUser(userData);
      setGoals(userData.goals||[]);
      if(firstExp){
        const exp={id:1,...firstExp};
        setExpenses([exp]);
        saveData("rgh_expenses",[exp]);
        const newDates=[todayStr()];
        setLogDates(newDates);
        saveData("rgh_logdates",newDates);
      }
      setTimeout(()=>checkBadge("welcome"),500);
      setAppState("app");
      setTab("home");
    }}/>
  );

  // RETURN VISITOR LOGIN
  if(appState==="login") return(
    <ReturnLogin onLogin={(saved)=>{
      setUser(saved);
      setGoals(saved.goals||[]);
      setExpenses(loadData("rgh_expenses",[]));
      setEarnedBadges(loadData("rgh_badges",[]));
      setLogDates(loadData("rgh_logdates",[]));
      setAppState("app");
    }}/>
  );

  // MAIN APP
  return(
    <div style={{minHeight:"100vh",background:W.bg,fontFamily:"'Nunito',sans-serif",color:W.text,maxWidth:430,margin:"0 auto"}}>
      <style>{CSS}</style>

      {activeBadge&&<BadgeUnlock badge={activeBadge} persona={persona} totalSaved={totalSaved} onClose={()=>setActiveBadge(null)}/>}
      {activeBodyguard&&!showWalkAway&&<Bodyguard zone={activeBodyguard} persona={persona} resistanceStreak={resistanceStreak} onWalkAway={()=>setShowWalkAway(true)} onWentIn={()=>{setActiveBodyguard(null);setTab("record");}}/>}
      {showWalkAway&&<WalkAwayResult persona={persona} onClose={()=>{setShowWalkAway(false);setActiveBodyguard(null);setResistanceStreak(s=>s+1);checkBadge("first_resist");checkBadge("first_save");}}/>}

      {/* HEADER */}
      <div style={{padding:"44px 20px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}><Sparkle size={14}/><p style={{fontSize:10,color:W.soft,letterSpacing:2,textTransform:"uppercase"}}>{monthLabel()}</p></div>
          <h1 style={{fontSize:22,fontWeight:800,fontFamily:"'Fraunces',serif",fontStyle:"italic"}}>Rich Girl Habits</h1>
          <p style={{fontSize:10,color:W.soft}}>A RetireRicher product</p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end",marginBottom:2}}><span style={{fontSize:16}}>{persona.emoji}</span><span style={{fontSize:11,color:W.soft}}>{user?.name||""}</span></div>
          <p style={{fontSize:18,fontWeight:800,color:W.accent,fontFamily:"'Fraunces',serif"}}>${totalSaved.toLocaleString()}</p>
          <p style={{fontSize:10,color:W.soft}}>total saved</p>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:3,padding:"0 20px 14px"}}>
        {NAV.map(n=><button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,padding:"9px 4px",borderRadius:10,border:"none",cursor:"pointer",fontSize:10,fontWeight:800,background:tab===n.id?W.accent:"rgba(255,255,255,0.05)",color:tab===n.id?W.bg:W.soft,transition:"all 0.2s"}}><div style={{fontSize:14,marginBottom:2}}>{n.emoji}</div>{n.label}</button>)}
      </div>

      {/* HOME */}
      {tab==="home"&&(
        <div style={{padding:"0 20px 120px",animation:"scaleIn 0.35s ease"}}>
          {reaction&&(
            <div style={{...card({background:"rgba(244,169,184,0.1)",borderColor:"rgba(244,169,184,0.25)",marginBottom:14,display:"flex",gap:10,alignItems:"flex-start"})}}>
              <span style={{fontSize:22}}>{persona.emoji}</span>
              <div style={{flex:1}}><p style={{fontSize:11,fontWeight:800,color:persona.color,marginBottom:3}}>{persona.name}</p><p style={{fontSize:13,color:W.mid,lineHeight:1.6}}>{reaction}</p></div>
              <button onClick={()=>setReaction("")} style={{background:"none",border:"none",color:W.soft,cursor:"pointer",fontSize:16}}>×</button>
            </div>
          )}
          <div style={{...card({marginBottom:14})}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <div><p style={{fontSize:10,color:W.soft,marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Spent This Month</p><p style={{fontSize:32,fontWeight:800,fontFamily:"'Fraunces',serif"}}>${totalSpent.toFixed(0)}</p><p style={{fontSize:11,color:W.soft}}>of ${totalBudget} budget</p></div>
              <div style={{textAlign:"right"}}><p style={{fontSize:10,color:W.soft,marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Total Saved</p><p style={{fontSize:24,fontWeight:800,color:W.accent}}>${totalSaved.toLocaleString()}</p><p style={{fontSize:11,color:W.soft}}>since day 1</p></div>
            </div>
            <div style={{height:5,background:"rgba(253,240,232,0.08)",borderRadius:3}}><div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${W.rose},${W.accent})`,width:`${Math.min(totalSpent/totalBudget*100,100)}%`,transition:"width 0.6s ease"}}/></div>
            {totalSpent===0&&<p style={{fontSize:11,color:W.soft,marginTop:8,fontStyle:"italic",textAlign:"center"}}>No spends logged yet — tap Record to start</p>}
          </div>

          <div style={{...card({background:"rgba(239,68,68,0.06)",borderColor:"rgba(239,68,68,0.2)",marginBottom:14})}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#EF4444",animation:"blink 1.5s infinite"}}/><p style={{fontSize:11,fontWeight:800,color:"#FCA5A5",letterSpacing:1}}>BUDGET BODYGUARD</p></div>
              <p style={{fontSize:11,color:W.soft}}>{resistanceStreak} resistances</p>
            </div>
            <div style={{display:"flex",gap:8}}>
              {[{id:"starbucks",name:"Starbucks",emoji:"☕",type:"trap"},{id:"target",name:"Target",emoji:"🎯",type:"caution"},{id:"amazon",name:"Amazon",emoji:"📦",type:"trap"}].map(z=>(
                <button key={z.id} onClick={()=>setActiveBodyguard(z)} style={{flex:1,padding:"10px 6px",borderRadius:12,border:`1px solid ${z.type==="trap"?"rgba(239,68,68,0.3)":"rgba(251,191,36,0.3)"}`,background:z.type==="trap"?"rgba(239,68,68,0.06)":"rgba(251,191,36,0.06)",color:W.mid,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"center"}}><div style={{fontSize:20,marginBottom:4}}>{z.emoji}</div>{z.name}</button>
              ))}
            </div>
          </div>

          <button onClick={()=>setTab("record")} style={{width:"100%",padding:"14px",background:"transparent",border:`1.5px dashed ${W.border}`,borderRadius:14,color:W.mid,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            <span style={{fontSize:22,animation:"float 2s ease-in-out infinite"}}>🎙️</span> Tap to record a spend
          </button>

          <p style={{fontSize:10,color:W.soft,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>Saving Toward</p>
          {goals.length===0?(
            <div style={{...card({textAlign:"center",padding:"24px 20px"})}}><p style={{fontSize:32,marginBottom:8}}>🎯</p><p style={{fontSize:13,color:W.soft}}>Complete setup to see your goals here</p></div>
          ):goals.map(g=>(
            <div key={g.id} style={{...card({marginBottom:10})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{g.emoji}</span><div><p style={{fontSize:13,fontWeight:700}}>{g.label}</p><p style={{fontSize:11,color:W.soft}}>${((g.target||0)-(g.saved||0)).toLocaleString()} to go</p></div></div>
                <div style={{textAlign:"right"}}><p style={{fontSize:16,fontWeight:800,color:g.color||W.accent}}>${(g.saved||0).toLocaleString()}</p><p style={{fontSize:11,color:W.soft}}>of ${(g.target||0).toLocaleString()}</p></div>
              </div>
              <div style={{height:5,background:"rgba(253,240,232,0.08)",borderRadius:3}}><div style={{height:"100%",borderRadius:3,background:g.color||W.accent,width:`${Math.min(((g.saved||0)/(g.target||1))*100,100)}%`,transition:"width 0.6s ease"}}/></div>
            </div>
          ))}

          <button onClick={()=>{setAppState("login");setUser(null);}} style={{width:"100%",padding:"10px",background:"transparent",border:`1px solid rgba(253,240,232,0.08)`,borderRadius:10,color:W.soft,fontSize:11,cursor:"pointer",marginTop:8}}>Sign out</button>
        </div>
      )}

      {/* RECORD */}
      {tab==="record"&&(
        <div style={{padding:"0 20px 120px",animation:"scaleIn 0.35s ease"}}>
          {reaction&&(
            <div style={{...card({background:"rgba(244,169,184,0.1)",borderColor:"rgba(244,169,184,0.25)",marginBottom:14,display:"flex",gap:10})}}>
              <span style={{fontSize:22}}>{persona.emoji}</span>
              <div style={{flex:1}}><p style={{fontSize:11,fontWeight:800,color:persona.color,marginBottom:3}}>{persona.name}</p><p style={{fontSize:13,color:W.mid,lineHeight:1.6}}>{reaction}</p></div>
              <button onClick={()=>setReaction("")} style={{background:"none",border:"none",color:W.soft,cursor:"pointer",fontSize:16}}>×</button>
            </div>
          )}
          <div style={{...card({padding:"32px 20px",textAlign:"center",marginBottom:14})}}>
            <button onMouseDown={startRec} onMouseUp={stopRec} onTouchStart={startRec} onTouchEnd={stopRec}
              style={{width:96,height:96,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:34,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",background:recording?"linear-gradient(135deg,#EF4444,#DC2626)":`linear-gradient(135deg,${W.rose},${W.accent})`,animation:recording?"pulseR 1.2s infinite":"glowP 3s infinite",transition:"all 0.3s"}}>
              {recording?"⏹":"🎙️"}
            </button>
            <p style={{marginTop:14,fontSize:13,color:W.mid}}>{recording?"Listening... release to stop":"Hold to record a spend"}</p>
            <p style={{marginTop:4,fontSize:11,color:W.soft}}>"I spent $38.50 at Starbucks for coffee"</p>
          </div>
          <button onClick={demo} style={{width:"100%",padding:"11px",background:"transparent",border:`1px dashed ${W.border}`,borderRadius:12,color:W.soft,fontSize:12,cursor:"pointer",marginBottom:14}}>Try a demo entry</button>
          {transcript&&<div style={{...card({marginBottom:14})}}><p style={{fontSize:10,color:W.soft,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Heard</p><p style={{fontSize:14,fontStyle:"italic",color:W.mid}}>"{transcript}"</p></div>}
          {parsed&&!saving&&(
            <div style={{...card({marginBottom:14})}}>
              <p style={{fontSize:36,fontWeight:800,fontFamily:"'Fraunces',serif",marginBottom:14}}>${parsed.amount?.toFixed(2)}</p>
              {[["Store",parsed.store],["Category",CATS[parsed.category]?.label],["Purpose",parsed.purpose]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(253,240,232,0.06)"}}><span style={{fontSize:12,color:W.soft}}>{k}</span><span style={{fontSize:13,fontWeight:600}}>{v}</span></div>
              ))}
              <div style={{marginTop:14}}>
                <p style={{fontSize:11,fontWeight:700,color:W.mid,marginBottom:8}}>What are you saving for?</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {goals.map(g=><div key={g.id} style={{padding:"5px 10px",background:W.aLight,border:`1px solid ${W.border}`,borderRadius:99,fontSize:11,color:W.cream,fontWeight:700,cursor:"pointer"}}>{g.emoji} {g.label.split(" ")[0]}</div>)}
                </div>
              </div>
              <button onClick={save} style={{width:"100%",padding:"15px",background:W.accent,border:"none",borderRadius:14,color:W.bg,fontSize:14,fontWeight:800,cursor:"pointer",marginTop:14}}>Log this spend →</button>
            </div>
          )}
        </div>
      )}

      {/* GROWTH */}
      {tab==="growth"&&(
        <div style={{padding:"0 20px 120px",animation:"scaleIn 0.35s ease"}}>
          <div style={{...card({background:"rgba(232,149,106,0.08)",borderColor:`${W.accent}33`,marginBottom:16,padding:"24px 20px",textAlign:"center"})}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:6}}><Sparkle size={14}/><p style={{fontSize:10,color:W.soft,letterSpacing:2,textTransform:"uppercase"}}>Total Saved Since Day 1</p><Sparkle size={14}/></div>
            <p style={{fontSize:48,fontWeight:800,fontFamily:"'Fraunces',serif",color:W.accent}}>${totalSaved.toLocaleString()}</p>
            <p style={{fontSize:16,color:W.mid,marginTop:6,fontStyle:"italic",fontFamily:"'Fraunces',serif"}}>"Your future self is getting closer."</p>
          </div>
          <div style={{...card({marginBottom:14})}}>
            <p style={{fontSize:11,color:W.soft,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>The Gut Punch Calculator</p>
            <h2 style={{fontSize:20,fontWeight:800,fontFamily:"'Fraunces',serif",fontStyle:"italic",marginBottom:16,color:W.cream,lineHeight:1.3}}>What is your Starbucks habit actually costing you?</h2>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{textAlign:"center"}}><p style={{fontSize:11,color:W.soft,marginBottom:4}}>RIGHT NOW</p><p style={{fontSize:28,fontWeight:800,color:"#FCA5A5"}}>8x</p><p style={{fontSize:11,color:W.soft}}>per week</p></div>
              <div style={{color:W.soft,fontSize:20}}>→</div>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:11,color:W.soft,marginBottom:4}}>YOUR GOAL</p>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <button onClick={()=>setCutTo(Math.max(0,cutTo-1))} style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${W.border}`,background:"transparent",color:W.cream,cursor:"pointer",fontSize:16}}>-</button>
                  <p style={{fontSize:28,fontWeight:800,color:W.accent}}>{cutTo}x</p>
                  <button onClick={()=>setCutTo(Math.min(8,cutTo+1))} style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${W.border}`,background:"transparent",color:W.cream,cursor:"pointer",fontSize:16}}>+</button>
                </div>
                <p style={{fontSize:11,color:W.soft}}>per week</p>
              </div>
              <div style={{textAlign:"center"}}><p style={{fontSize:11,color:W.soft,marginBottom:4}}>SAVED</p><p style={{fontSize:28,fontWeight:800,color:"#6EE7B7"}}>${weeklySaved.toFixed(0)}</p><p style={{fontSize:11,color:W.soft}}>per week</p></div>
            </div>
            {[[1,y1],[5,y5],[10,y10],[30,y30]].map(([yr,val])=>(
              <div key={yr} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,color:W.mid}}>{yr} year{yr>1?"s":""}</span><span style={{fontSize:16,fontWeight:800,color:yr>=10?W.accent:W.cream}}>{formatK(val)}</span></div>
                <div style={{height:4,background:"rgba(253,240,232,0.08)",borderRadius:2}}><div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${W.rose},${W.accent})`,width:`${Math.min(val/y30,1)*100}%`}}/></div>
              </div>
            ))}
            <div style={{marginTop:14,padding:"14px",background:"rgba(232,149,106,0.12)",borderRadius:12,border:"1px solid rgba(232,149,106,0.25)",textAlign:"center"}}>
              <Sparkle size={16}/>
              <p style={{fontSize:13,color:W.mid,marginBottom:4,marginTop:8}}>In 5 years that is</p>
              <p style={{fontSize:28,fontWeight:800,fontFamily:"'Fraunces',serif",color:W.accent,marginBottom:6}}>{formatK(y5)}</p>
              <p style={{fontSize:13,color:W.cream,fontStyle:"italic",fontFamily:"'Fraunces',serif"}}>"Your Emergency Fund. Done."</p>
              <p style={{fontSize:11,color:W.soft,marginTop:8,fontStyle:"italic"}}>Your future self wants you to.</p>
            </div>
          </div>
          <p style={{fontSize:10,color:W.soft,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>Your Badges</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
            {BADGES.map(b=>{
              const earned=earnedBadges.includes(b.id);
              const tc={starter:"#94A3B8",bronze:"#C17B4E",silver:"#8B9BB4",gold:"#C4965A",platinum:"#E2E8F0"}[b.tier];
              return(<div key={b.id} onClick={()=>earned&&setActiveBadge(b)} style={{background:earned?"rgba(196,150,90,0.1)":"rgba(255,255,255,0.03)",border:`1px solid ${earned?"rgba(196,150,90,0.3)":"rgba(255,255,255,0.06)"}`,borderRadius:14,padding:"14px 10px",textAlign:"center",cursor:earned?"pointer":"default",opacity:earned?1:0.4}}>
                <div style={{fontSize:28,marginBottom:6,filter:earned?"none":"grayscale(1)"}}>{b.emoji}</div>
                <p style={{fontSize:11,fontWeight:700,color:earned?tc:"rgba(253,240,232,0.3)",lineHeight:1.3}}>{b.name}</p>
                {earned&&<div style={{width:6,height:6,borderRadius:"50%",background:tc,margin:"6px auto 0"}}/>}
              </div>);
            })}
          </div>
          <div style={{...card({background:"rgba(232,149,106,0.06)",display:"flex",gap:10})}}>
            <span style={{fontSize:20,flexShrink:0}}>🌱</span>
            <div><p style={{fontSize:12,fontWeight:800,color:W.accent,marginBottom:4}}>RetireRicher</p><p style={{fontSize:12,color:W.mid,lineHeight:1.65,fontStyle:"italic"}}>"Know where you are. Know where you want to be. Identify the gap. That is the whole game — and you are playing it."</p></div>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {tab==="history"&&(
        <div style={{padding:"0 20px 120px",animation:"scaleIn 0.35s ease"}}>
          <div style={{...card({marginBottom:14,display:"flex",justifyContent:"space-between"})}}>
            <div><p style={{fontSize:10,color:W.soft,marginBottom:3}}>THIS MONTH</p><p style={{fontSize:26,fontWeight:800,fontFamily:"'Fraunces',serif"}}>${totalSpent.toFixed(0)}</p></div>
            <div style={{textAlign:"right"}}><p style={{fontSize:10,color:W.soft,marginBottom:3}}>TRANSACTIONS</p><p style={{fontSize:26,fontWeight:800,fontFamily:"'Fraunces',serif"}}>{thisMonth.length}</p></div>
          </div>
          {Object.keys(byCat).length>0&&(
            <div style={{...card({marginBottom:14})}}>
              <p style={{fontSize:10,color:W.soft,letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>By Category</p>
              {Object.entries(byCat).sort(([,a],[,b])=>b-a).map(([cat,spent])=>{
                const budget=BUDGETS[cat]||0,pct=budget>0?Math.min(spent/budget,1):0,over=spent>budget;
                return(<div key={cat} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12}}>{CATS[cat]?.emoji} {CATS[cat]?.label}</span><span style={{fontSize:13,fontWeight:700,color:over?"#FCA5A5":W.text}}>${spent.toFixed(0)}</span></div>
                  <div style={{height:4,background:"rgba(253,240,232,0.08)",borderRadius:2}}><div style={{height:"100%",borderRadius:2,background:over?"#EF4444":CATS[cat]?.color,width:`${pct*100}%`}}/></div>
                </div>);
              })}
            </div>
          )}
          {expenses.length===0?(
            <div style={{...card({textAlign:"center",padding:"32px 20px"})}}>
              <p style={{fontSize:32,marginBottom:12}}>🎙️</p>
              <p style={{fontSize:14,fontWeight:700,color:W.mid,marginBottom:6}}>No spends yet</p>
              <p style={{fontSize:12,color:W.soft,marginBottom:16}}>Tap Record to log your first spend</p>
              <button onClick={()=>setTab("record")} style={{padding:"12px 24px",background:W.accent,border:"none",borderRadius:12,color:W.bg,fontSize:13,fontWeight:800,cursor:"pointer"}}>Start Recording →</button>
            </div>
          ):expenses.slice(0,20).map(e=>(
            <div key={e.id} style={{...card({display:"flex",alignItems:"center",gap:12,padding:"12px 14px",marginBottom:8})}}>
              <div style={{width:38,height:38,borderRadius:10,background:`${CATS[e.category]?.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{CATS[e.category]?.emoji}</div>
              <div style={{flex:1,minWidth:0}}><p style={{fontSize:13,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.store}</p><p style={{fontSize:11,color:W.soft,marginTop:1}}>{e.member} · {e.purpose}</p></div>
              <p style={{fontSize:14,fontWeight:800,flexShrink:0}}>-${e.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(10,5,0,0.96)",borderTop:`1px solid ${W.border}`,backdropFilter:"blur(20px)",padding:"10px 20px 24px"}}>
        <div style={{display:"flex",gap:3}}>
          {NAV.map(n=><button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,padding:"9px 4px",borderRadius:10,border:"none",cursor:"pointer",fontSize:10,fontWeight:800,background:tab===n.id?W.accent:"transparent",color:tab===n.id?W.bg:W.soft,transition:"all 0.2s"}}><div style={{fontSize:16,marginBottom:2}}>{n.emoji}</div>{n.label}</button>)}
        </div>
      </div>
    </div>
  );
}
