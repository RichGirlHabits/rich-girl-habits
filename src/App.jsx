import { useState, useRef } from "react";

const FLORAL = "https://raw.githubusercontent.com/RichGirlHabits/rich-girl-habits/main/public/7EA228FB-BB36-4BE9-829D-C86EAAE98B1F.png";

const BRAND = {
  bg: "#F4F0E0",
  accent: "#E8956A",
  gold: "#C4965A",
  text: "#340404",
  cream: "#FBE7E3",
  white: "#FFFFFF",
  soft: "rgba(52,4,4,0.45)",
  border: "rgba(232,149,106,0.25)",
  card: "#FFFFFF",
  rose: "#D4723E",
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

const BUDGETS = { food:300, groceries:400, transport:150, entertainment:100, shopping:200, health:80, utilities:250, other:100 };

const GOALS = [
  { id:"emergency", emoji:"🛡️", label:"Emergency Fund", target:5000, saved:1240, color:"#6EE7B7" },
  { id:"vacation",  emoji:"✈️", label:"Vacation Fund",  target:3000, saved:680,  color:"#45B7D1" },
  { id:"roth",      emoji:"📈", label:"Roth IRA",       target:7000, saved:420,  color:"#C4965A" },
];

const EXPENSES = [
  { id:1, amount:38.50, store:"Starbucks",   date:"2026-04-02", purpose:"coffee",   category:"food",          member:"You" },
  { id:2, amount:142.0, store:"Whole Foods", date:"2026-04-02", purpose:"groceries",category:"groceries",     member:"Sam" },
  { id:3, amount:89.99, store:"Nike",        date:"2026-04-01", purpose:"sneakers", category:"shopping",      member:"Alex" },
  { id:4, amount:9.99,  store:"Spotify",     date:"2026-04-01", purpose:"music",    category:"entertainment", member:"You" },
  { id:5, amount:67.00, store:"Uber",        date:"2026-04-01", purpose:"rides",    category:"transport",     member:"Alex" },
];

const PERSONA = { name:"Nana Rose", emoji:"👵", color:"#E8956A" };
const TOTAL_SAVED = 4847;
const MONTH = "2026-04";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

function compound(weekly, years, rate=0.07) {
  const weeks = years * 52;
  let total = 0;
  for (let i = 0; i < weeks; i++) total = (total + weekly) * (1 + rate/52);
  return Math.round(total);
}

function formatK(n) {
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n/1000).toFixed(0)}k`;
  return `$${n}`;
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,400&family=Nunito:wght@400;600;700;800&display=swap');
  @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
  @keyframes pulseR  { 0%,100%{box-shadow:0 0 0 4px rgba(239,68,68,0.2)} 50%{box-shadow:0 0 0 18px rgba(239,68,68,0.04)} }
  @keyframes glowP   { 0%,100%{box-shadow:0 0 0 4px rgba(232,149,106,0.3)} 50%{box-shadow:0 0 0 18px rgba(232,149,106,0.08)} }
  @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }
  * { box-sizing:border-box; margin:0; padding:0; }
  button,input { font-family:'Nunito',sans-serif; }
  ::-webkit-scrollbar { display:none; }
  body { background:#F4F0E0; margin:0; }
  input::placeholder { color:rgba(52,4,4,0.35); }
`;

// Floral screen wrapper — used for all onboarding screens
function FloralScreen({ children }) {
  return (
    <div style={{
      minHeight:"100vh",
      backgroundImage:`url(${FLORAL})`,
      backgroundSize:"cover",
      backgroundPosition:"center",
      backgroundRepeat:"no-repeat",
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      padding:"40px 24px",
      fontFamily:"'Nunito',sans-serif",
      textAlign:"center",
      position:"relative",
    }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(10,5,0,0.55)", zIndex:0 }}/>
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:380 }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [form, setForm] = useState({ name:"", email:"", password:"", age:"", zip:"", relationship:"", goal:"emergency" });
  const [tab, setTab] = useState("home");
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState(null);
  const [saved, setSaved] = useState(false);
  const [reaction, setReaction] = useState("");
  const [recording, setRecording] = useState(false);
  const [cutTo, setCutTo] = useState(4);
  const [expenses, setExpenses] = useState(EXPENSES);
  const recRef = useRef();
  const nextId = useRef(200);
  const W = BRAND;

  const thisMonth = expenses.filter(e=>e.date.startsWith(MONTH));
  const totalSpent = thisMonth.reduce((s,e)=>s+e.amount,0);
  const totalBudget = Object.values(BUDGETS).reduce((a,b)=>a+b,0);
  const weeklySaved = (8 - cutTo) * 8.50;
  const y1=compound(weeklySaved,1), y3=compound(weeklySaved,3), y5=compound(weeklySaved,5), y10=compound(weeklySaved,10), y30=compound(weeklySaved,30);

  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  const startRec = () => {
    setTranscript(""); setParsed(null); setSaved(false); setReaction("");
    if (!("webkitSpeechRecognition" in window)&&!("SpeechRecognition" in window)) {
      setTranscript("Demo mode — tap Try demo below"); return;
    }
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec=new SR(); rec.continuous=false; rec.interimResults=true; rec.lang="en-US";
    let last="";
    rec.onresult=e=>{ last=Array.from(e.results).map(r=>r[0].transcript).join(" "); setTranscript(last); };
    rec.onend=()=>{ setRecording(false); if(last) setParsed({ amount:38.50, store:"Starbucks", date:"2026-04-02", purpose:"coffee", category:"food" }); };
    rec.onerror=()=>setRecording(false);
    recRef.current=rec; rec.start(); setRecording(true);
  };
  const stopRec = () => { recRef.current?.stop(); setRecording(false); };
  const demo = () => { setTranscript("Spent $38.50 at Starbucks for coffee"); setParsed({ amount:38.50, store:"Starbucks", date:"2026-04-02", purpose:"coffee", category:"food" }); };
  const saveExp = () => {
    if(!parsed) return;
    setExpenses(p=>[{id:nextId.current++,...parsed,member:"You"},...p]);
    setSaved(true); setReaction("Baby you logged it!! Nana is SO proud!! 💕");
    setTimeout(()=>{ setParsed(null); setTranscript(""); setSaved(false); },400);
  };

  const card = (s={}) => ({ background:W.card, border:`1px solid ${W.border}`, borderRadius:18, padding:18, boxShadow:"0 2px 12px rgba(52,4,4,0.07)", ...s });
  const input = { width:"100%", padding:"14px 16px", borderRadius:12, border:`1.5px solid ${W.border}`, background:W.white, color:W.text, fontSize:14, outline:"none", marginBottom:12 };
  const btnPrimary = { width:"100%", padding:"16px", background:W.accent, border:"none", borderRadius:14, color:W.white, fontSize:15, fontWeight:800, cursor:"pointer", marginBottom:12 };
  const btnGhost = { width:"100%", padding:"13px", background:"transparent", border:`1px solid rgba(253,240,232,0.3)`, borderRadius:14, color:"rgba(253,240,232,0.7)", fontSize:13, cursor:"pointer" };

  const NAV = [
    { id:"home",    emoji:"🌸", label:"Home"    },
    { id:"record",  emoji:"🎙️", label:"Record"  },
    { id:"growth",  emoji:"📈", label:"Growth"  },
    { id:"history", emoji:"📋", label:"History" },
  ];

  // ── SCREEN: WELCOME ─────────────────────────────────────────────────────────
  if (screen === "welcome") return (
    <FloralScreen>
      <style>{CSS}</style>
      <div style={{ fontSize:72, marginBottom:16, animation:"float 2s ease-in-out infinite" }}>🌸</div>
      <h1 style={{ fontSize:38, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:"#FDF0E8", marginBottom:4, lineHeight:1.2, textShadow:"0 2px 16px rgba(0,0,0,0.6)" }}>
        Rich Girl Habits
      </h1>
      <p style={{ fontSize:11, color:"rgba(253,240,232,0.65)", marginBottom:8, letterSpacing:2, textTransform:"uppercase" }}>A RetireRicher Product</p>
      <div style={{ width:50, height:1, background:`linear-gradient(90deg,transparent,#E8956A,transparent)`, margin:"10px auto 14px" }}/>
      <p style={{ fontSize:16, color:"rgba(253,240,232,0.9)", fontStyle:"italic", fontFamily:"'Fraunces',serif", fontWeight:300, marginBottom:6, lineHeight:1.7, textShadow:"0 1px 10px rgba(0,0,0,0.5)" }}>
        "Your future self wants you to."
      </p>
      <p style={{ fontSize:13, color:"rgba(253,240,232,0.55)", marginBottom:44, fontStyle:"italic" }}>
        For when you have more month than money.
      </p>
      <button onClick={()=>setScreen("signup")} style={{...btnPrimary, marginBottom:12}}>Get Started 🌸</button>
      <button onClick={()=>setScreen("app")} style={btnGhost}>I already have an account</button>
      <p style={{ fontSize:11, color:"rgba(253,240,232,0.2)", marginTop:28, lineHeight:1.7 }}>
        Free to start · No credit card needed<br/>Build wealth one habit at a time
      </p>
    </FloralScreen>
  );

  // ── SCREEN: SIGN UP ──────────────────────────────────────────────────────────
  if (screen === "signup") return (
    <FloralScreen>
      <style>{CSS}</style>
      <p style={{ fontSize:11, color:"rgba(253,240,232,0.5)", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Step 1 of 4</p>
      <h2 style={{ fontSize:26, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:"#FDF0E8", marginBottom:6, textShadow:"0 2px 12px rgba(0,0,0,0.5)" }}>
        Let's get you set up
      </h2>
      <p style={{ fontSize:13, color:"rgba(253,240,232,0.6)", marginBottom:24, fontStyle:"italic" }}>Your future self starts here.</p>
      <input style={{...input, background:"rgba(255,255,255,0.92)"}} placeholder="Full name" value={form.name} onChange={e=>upd("name",e.target.value)}/>
      <input style={{...input, background:"rgba(255,255,255,0.92)"}} placeholder="Email address" type="email" value={form.email} onChange={e=>upd("email",e.target.value)}/>
      <input style={{...input, background:"rgba(255,255,255,0.92)", marginBottom:24}} placeholder="Create a password" type="password" value={form.password} onChange={e=>upd("password",e.target.value)}/>
      <button onClick={()=>setScreen("aboutyou")} style={btnPrimary}>Continue →</button>
      <button onClick={()=>setScreen("welcome")} style={btnGhost}>← Back</button>
    </FloralScreen>
  );

  // ── SCREEN: ABOUT YOU ────────────────────────────────────────────────────────
  if (screen === "aboutyou") return (
    <FloralScreen>
      <style>{CSS}</style>
      <p style={{ fontSize:11, color:"rgba(253,240,232,0.5)", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Step 2 of 4</p>
      <h2 style={{ fontSize:26, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:"#FDF0E8", marginBottom:6, textShadow:"0 2px 12px rgba(0,0,0,0.5)" }}>
        Tell us about you
      </h2>
      <p style={{ fontSize:13, color:"rgba(253,240,232,0.6)", marginBottom:24, fontStyle:"italic" }}>We personalize your experience.</p>
      <input style={{...input, background:"rgba(255,255,255,0.92)"}} placeholder="Your age" type="number" value={form.age} onChange={e=>upd("age",e.target.value)}/>
      <input style={{...input, background:"rgba(255,255,255,0.92)"}} placeholder="ZIP code" value={form.zip} onChange={e=>upd("zip",e.target.value)}/>
      <p style={{ fontSize:12, color:"rgba(253,240,232,0.6)", marginBottom:10, textAlign:"left" }}>Relationship status</p>
      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {["Single","In a relationship","Married","It's complicated"].map(s=>(
          <button key={s} onClick={()=>upd("relationship",s)} style={{ padding:"9px 14px", borderRadius:99, border:`1.5px solid ${form.relationship===s?"#E8956A":"rgba(253,240,232,0.3)"}`, background:form.relationship===s?"#E8956A":"rgba(255,255,255,0.1)", color:form.relationship===s?"#fff":"rgba(253,240,232,0.8)", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            {s}
          </button>
        ))}
      </div>
      <button onClick={()=>setScreen("goals")} style={btnPrimary}>Continue →</button>
      <button onClick={()=>setScreen("signup")} style={btnGhost}>← Back</button>
    </FloralScreen>
  );

  // ── SCREEN: GOALS ────────────────────────────────────────────────────────────
  if (screen === "goals") return (
    <FloralScreen>
      <style>{CSS}</style>
      <p style={{ fontSize:11, color:"rgba(253,240,232,0.5)", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Step 3 of 4</p>
      <h2 style={{ fontSize:26, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:"#FDF0E8", marginBottom:6, textShadow:"0 2px 12px rgba(0,0,0,0.5)" }}>
        What's your first goal?
      </h2>
      <p style={{ fontSize:13, color:"rgba(253,240,232,0.6)", marginBottom:24, fontStyle:"italic" }}>Pick one to start. You can add more later.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24, textAlign:"left" }}>
        {GOALS.map(g=>(
          <button key={g.id} onClick={()=>upd("goal",g.id)} style={{ padding:"16px", borderRadius:14, border:`2px solid ${form.goal===g.id?"#E8956A":"rgba(253,240,232,0.2)"}`, background:form.goal===g.id?"rgba(232,149,106,0.25)":"rgba(255,255,255,0.08)", color:"#FDF0E8", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
            <span style={{fontSize:26}}>{g.emoji}</span>
            <div>
              <p style={{fontSize:14,fontWeight:800}}>{g.label}</p>
              <p style={{fontSize:12,opacity:0.6}}>Target: ${g.target.toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>
      <button onClick={()=>setScreen("ready")} style={btnPrimary}>Continue →</button>
      <button onClick={()=>setScreen("aboutyou")} style={btnGhost}>← Back</button>
    </FloralScreen>
  );

  // ── SCREEN: READY ────────────────────────────────────────────────────────────
  if (screen === "ready") return (
    <FloralScreen>
      <style>{CSS}</style>
      <div style={{ fontSize:64, marginBottom:16, animation:"float 2s ease-in-out infinite" }}>✨</div>
      <h2 style={{ fontSize:30, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:"#FDF0E8", marginBottom:10, textShadow:"0 2px 16px rgba(0,0,0,0.5)" }}>
        You're ready, {form.name || "Rich Girl"}!
      </h2>
      <p style={{ fontSize:15, color:"rgba(253,240,232,0.75)", marginBottom:8, lineHeight:1.7, fontStyle:"italic" }}>
        "Your future self wants you to."
      </p>
      <p style={{ fontSize:13, color:"rgba(253,240,232,0.5)", marginBottom:40 }}>
        Let's start building your wealth — one habit at a time.
      </p>
      <button onClick={()=>setScreen("app")} style={btnPrimary}>Enter the App 🌸</button>
    </FloralScreen>
  );

  // ── MAIN APP ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:W.bg, fontFamily:"'Nunito',sans-serif", color:W.text, maxWidth:430, margin:"0 auto" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ padding:"44px 20px 14px", display:"flex", justifyContent:"space-between", alignItems:"flex-end", borderBottom:`1px solid ${W.border}` }}>
        <div>
          <p style={{ fontSize:10, color:W.soft, letterSpacing:2, textTransform:"uppercase", marginBottom:2 }}>April 2026</p>
          <h1 style={{ fontSize:22, fontWeight:800, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:W.text }}>Rich Girl Habits</h1>
          <p style={{ fontSize:10, color:W.soft }}>A RetireRicher product</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:20, fontWeight:800, color:W.accent }}>${TOTAL_SAVED.toLocaleString()}</p>
          <p style={{ fontSize:10, color:W.soft }}>total saved 🌸</p>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ display:"flex", gap:3, padding:"12px 20px 0" }}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{ flex:1, padding:"9px 4px", borderRadius:10, border:"none", cursor:"pointer", fontSize:10, fontWeight:800, background:tab===n.id?W.accent:"rgba(52,4,4,0.06)", color:tab===n.id?W.white:W.soft, transition:"all 0.2s" }}>
            <div style={{fontSize:14,marginBottom:2}}>{n.emoji}</div>{n.label}
          </button>
        ))}
      </div>

      {/* HOME */}
      {tab==="home" && (
        <div style={{ padding:"16px 20px 120px", animation:"scaleIn 0.35s ease" }}>
          {reaction && (
            <div style={{ ...card(), background:"#FFF5F0", borderColor:"rgba(232,149,106,0.4)", marginBottom:14, display:"flex", gap:10 }}>
              <span style={{fontSize:22}}>{PERSONA.emoji}</span>
              <div style={{flex:1}}>
                <p style={{fontSize:11,fontWeight:800,color:W.accent,marginBottom:3}}>{PERSONA.name}</p>
                <p style={{fontSize:13,color:W.text,lineHeight:1.6}}>{reaction}</p>
              </div>
              <button onClick={()=>setReaction("")} style={{background:"none",border:"none",color:W.soft,cursor:"pointer",fontSize:18}}>×</button>
            </div>
          )}
          <div style={{ ...card({ marginBottom:14 }) }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <p style={{fontSize:10,color:W.soft,marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>Spent This Month</p>
                <p style={{fontSize:32,fontWeight:800,fontFamily:"'Fraunces',serif",color:W.text}}>${totalSpent.toFixed(0)}</p>
                <p style={{fontSize:11,color:W.soft}}>of ${totalBudget} budget</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:10,color:W.soft,marginBottom:3,letterSpacing:1,textTransform:"uppercase"}}>Total Saved</p>
                <p style={{fontSize:24,fontWeight:800,color:W.accent}}>${TOTAL_SAVED.toLocaleString()}</p>
                <p style={{fontSize:11,color:W.soft}}>since day 1 🌸</p>
              </div>
            </div>
            <div style={{height:6,background:"rgba(52,4,4,0.08)",borderRadius:3}}>
              <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${W.rose},${W.accent})`,width:`${Math.min(totalSpent/totalBudget*100,100)}%`}}/>
            </div>
          </div>
          <button onClick={()=>setTab("record")} style={{ width:"100%",padding:"14px",background:"transparent",border:`1.5px dashed ${W.border}`,borderRadius:14,color:W.accent,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
            <span style={{fontSize:22}}>🎙️</span> Tap to record an expense
          </button>
          {GOALS.map(g=>(
            <div key={g.id} style={{ ...card({ marginBottom:10 }) }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>{g.emoji}</span>
                  <div>
                    <p style={{fontSize:13,fontWeight:700,color:W.text}}>{g.label}</p>
                    <p style={{fontSize:11,color:W.soft}}>${(g.target-g.saved).toLocaleString()} to go</p>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:16,fontWeight:800,color:g.color}}>${g.saved.toLocaleString()}</p>
                  <p style={{fontSize:11,color:W.soft}}>of ${g.target.toLocaleString()}</p>
                </div>
              </div>
              <div style={{height:5,background:"rgba(52,4,4,0.08)",borderRadius:3}}>
                <div style={{height:"100%",borderRadius:3,background:g.color,width:`${(g.saved/g.target)*100}%`}}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECORD */}
      {tab==="record" && (
        <div style={{ padding:"16px 20px 120px", animation:"scaleIn 0.35s ease" }}>
          {reaction && (
            <div style={{ ...card(), background:"#FFF5F0", borderColor:"rgba(232,149,106,0.4)", marginBottom:14, display:"flex", gap:10 }}>
              <span style={{fontSize:22}}>{PERSONA.emoji}</span>
              <p style={{fontSize:13,color:W.text,lineHeight:1.6,flex:1}}>{reaction}</p>
              <button onClick={()=>setReaction("")} style={{background:"none",border:"none",color:W.soft,cursor:"pointer",fontSize:18}}>×</button>
            </div>
          )}
          <div style={{ ...card({ padding:"32px 20px", textAlign:"center", marginBottom:14 }) }}>
            <button onMouseDown={startRec} onMouseUp={stopRec} onTouchStart={startRec} onTouchEnd={stopRec}
              style={{ width:96,height:96,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:34,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",
                background:recording?"linear-gradient(135deg,#EF4444,#DC2626)":`linear-gradient(135deg,${W.rose},${W.accent})`,
                animation:recording?"pulseR 1.2s infinite":"glowP 3s infinite" }}>
              {recording?"⏹":"🎙️"}
            </button>
            <p style={{marginTop:14,fontSize:13,color:W.text}}>{recording?"Listening… release to stop":"Hold to record an expense"}</p>
            <p style={{marginTop:4,fontSize:11,color:W.soft}}>"I spent $38.50 at Starbucks for coffee"</p>
          </div>
          <button onClick={demo} style={{ width:"100%",padding:"11px",background:"transparent",border:`1px dashed ${W.border}`,borderRadius:12,color:W.accent,fontSize:12,cursor:"pointer",marginBottom:14,fontWeight:700 }}>
            ✨ Try demo input
          </button>
          {transcript && (
            <div style={{ ...card({ marginBottom:14 }), animation:"fadeUp 0.3s ease" }}>
              <p style={{fontSize:10,color:W.soft,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Heard</p>
              <p style={{fontSize:14,fontStyle:"italic",color:W.text}}>"{transcript}"</p>
            </div>
          )}
          {parsed && !saved && (
            <div style={{ ...card({ marginBottom:14 }), animation:"fadeUp 0.3s ease" }}>
              <p style={{fontSize:36,fontWeight:800,fontFamily:"'Fraunces',serif",marginBottom:14,color:W.text}}>${parsed.amount?.toFixed(2)}</p>
              {[["Store",parsed.store],["Category",CATS[parsed.category]?.label],["Purpose",parsed.purpose]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${W.border}`}}>
                  <span style={{fontSize:12,color:W.soft}}>{k}</span>
                  <span style={{fontSize:13,fontWeight:600,color:W.text}}>{v}</span>
                </div>
              ))}
              <button onClick={saveExp} style={{ width:"100%",padding:"15px",background:W.accent,border:"none",borderRadius:14,color:W.white,fontSize:14,fontWeight:800,cursor:"pointer",marginTop:14 }}>
                Save Expense 🌸
              </button>
            </div>
          )}
        </div>
      )}

      {/* GROWTH */}
      {tab==="growth" && (
        <div style={{ padding:"16px 20px 120px", animation:"scaleIn 0.35s ease" }}>
          <div style={{ ...card({ background:"#FFF5F0",borderColor:"rgba(232,149,106,0.4)",marginBottom:16,padding:"24px 20px",textAlign:"center" }) }}>
            <p style={{fontSize:10,color:W.soft,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Total Saved Since Day 1</p>
            <p style={{fontSize:48,fontWeight:800,fontFamily:"'Fraunces',serif",color:W.accent}}>${TOTAL_SAVED.toLocaleString()}</p>
            <p style={{fontSize:13,color:W.soft,marginTop:6,fontStyle:"italic"}}>"Your future self is getting closer."</p>
          </div>
          <div style={{ ...card({ marginBottom:14 }) }}>
            <p style={{fontSize:11,color:W.soft,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>The Gut Punch Calculator</p>
            <h2 style={{fontSize:18,fontWeight:800,fontFamily:"'Fraunces',serif",fontStyle:"italic",marginBottom:16,color:W.text}}>What is your Starbucks habit costing you?</h2>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:11,color:W.soft,marginBottom:4}}>RIGHT NOW</p>
                <p style={{fontSize:28,fontWeight:800,color:"#EF4444"}}>8x</p>
                <p style={{fontSize:11,color:W.soft}}>per week</p>
              </div>
              <div style={{color:W.soft,fontSize:20}}>→</div>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:11,color:W.soft,marginBottom:4}}>YOUR GOAL</p>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <button onClick={()=>setCutTo(Math.max(0,cutTo-1))} style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${W.border}`,background:W.white,color:W.text,cursor:"pointer",fontSize:16,fontWeight:800}}>-</button>
                  <p style={{fontSize:28,fontWeight:800,color:W.accent}}>{cutTo}x</p>
                  <button onClick={()=>setCutTo(Math.min(8,cutTo+1))} style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${W.border}`,background:W.white,color:W.text,cursor:"pointer",fontSize:16,fontWeight:800}}>+</button>
                </div>
                <p style={{fontSize:11,color:W.soft}}>per week</p>
              </div>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:11,color:W.soft,marginBottom:4}}>SAVED</p>
                <p style={{fontSize:28,fontWeight:800,color:"#16A34A"}}>${weeklySaved.toFixed(0)}</p>
                <p style={{fontSize:11,color:W.soft}}>per week</p>
              </div>
            </div>
            {[[1,y1],[3,y3],[5,y5],[10,y10],[30,y30]].map(([yr,val])=>(
              <div key={yr} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:13,color:W.text}}>{yr} year{yr>1?"s":""}</span>
                  <span style={{fontSize:16,fontWeight:800,color:yr>=10?W.accent:W.text}}>{formatK(val)}</span>
                </div>
                <div style={{height:4,background:"rgba(52,4,4,0.08)",borderRadius:2}}>
                  <div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${W.rose},${W.accent})`,width:`${Math.min(val/y30,1)*100}%`}}/>
                </div>
              </div>
            ))}
            <div style={{marginTop:14,padding:"14px",background:"#FFF5F0",borderRadius:12,border:`1px solid rgba(232,149,106,0.3)`,textAlign:"center"}}>
              <p style={{fontSize:13,color:W.soft,marginBottom:4}}>In 5 years that is</p>
              <p style={{fontSize:28,fontWeight:800,fontFamily:"'Fraunces',serif",color:W.accent,marginBottom:6}}>{formatK(y5)}</p>
              <p style={{fontSize:13,color:W.text,fontStyle:"italic"}}>"Your Emergency Fund. Done."</p>
              <p style={{fontSize:11,color:W.soft,marginTop:8,fontStyle:"italic"}}>Your future self wants you to.</p>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {tab==="history" && (
        <div style={{ padding:"16px 20px 120px", animation:"scaleIn 0.35s ease" }}>
          <div style={{ ...card({ marginBottom:14,display:"flex",justifyContent:"space-between" }) }}>
            <div><p style={{fontSize:10,color:W.soft,marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>This Month</p><p style={{fontSize:26,fontWeight:800,fontFamily:"'Fraunces',serif",color:W.text}}>${totalSpent.toFixed(0)}</p></div>
            <div style={{textAlign:"right"}}><p style={{fontSize:10,color:W.soft,marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Transactions</p><p style={{fontSize:26,fontWeight:800,fontFamily:"'Fraunces',serif",color:W.text}}>{thisMonth.length}</p></div>
          </div>
          {expenses.slice(0,10).map(e=>(
            <div key={e.id} style={{ ...card({ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",marginBottom:8 }) }}>
              <div style={{width:40,height:40,borderRadius:10,background:`${CATS[e.category]?.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{CATS[e.category]?.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:700,color:W.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.store}</p>
                <p style={{fontSize:11,color:W.soft,marginTop:1}}>{e.member} · {e.purpose}</p>
              </div>
              <p style={{fontSize:14,fontWeight:800,color:W.text,flexShrink:0}}>-${e.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(244,240,224,0.97)",borderTop:`1px solid ${W.border}`,padding:"10px 20px 24px",backdropFilter:"blur(10px)" }}>
        <div style={{display:"flex",gap:3}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{ flex:1,padding:"9px 4px",borderRadius:10,border:"none",cursor:"pointer",fontSize:10,fontWeight:800,background:tab===n.id?W.accent:"transparent",color:tab===n.id?W.white:W.soft,transition:"all 0.2s" }}>
              <div style={{fontSize:16,marginBottom:2}}>{n.emoji}</div>{n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
