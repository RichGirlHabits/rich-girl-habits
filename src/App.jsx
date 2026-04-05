import { useState, useRef } from "react";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

const BRAND = {
  bg: "#0A0500",
  accent: "#E8956A",
  cream: "#FDF0E8",
  mid: "rgba(253,240,232,0.65)",
  soft: "rgba(253,240,232,0.35)",
  border: "rgba(232,149,106,0.2)",
  card: "rgba(255,245,235,0.06)",
  rose: "#D4723E",
  gold: "#C4965A",
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

const BUDGETS = {
  food:300, groceries:400, transport:150,
  entertainment:100, shopping:200, health:80,
  utilities:250, other:100
};

const ALL_GOALS = [
  { id:"emergency", emoji:"🛡️", label:"Emergency Fund",   tagline:"Sleep at night money",      target:5000,  color:"#6EE7B7" },
  { id:"vacation",  emoji:"✈️", label:"Vacation Fund",    tagline:"Because you deserve it",    target:3000,  color:"#45B7D1" },
  { id:"house",     emoji:"🏠", label:"Down Payment",     tagline:"Your name on the door",     target:20000, color:"#F4A9B8" },
  { id:"wedding",   emoji:"💍", label:"Wedding Fund",     tagline:"The day of your dreams",    target:15000, color:"#E8956A" },
  { id:"roth",      emoji:"📈", label:"Roth IRA",         tagline:"Future you says thank you", target:7000,  color:"#C4965A" },
  { id:"car",       emoji:"🚗", label:"New Car",          tagline:"Paid in full energy",       target:8000,  color:"#94A3B8" },
  { id:"kids",      emoji:"👶", label:"Kids / Education", tagline:"Their future starts now",   target:10000, color:"#4ECDC4" },
  { id:"business",  emoji:"💼", label:"Start a Business", tagline:"Be your own boss",          target:10000, color:"#F5D5B8" },
  { id:"wealth",    emoji:"💅", label:"Build Wealth",     tagline:"Rich Girl energy, always",  target:50000, color:"#E8956A" },
];

const PERSONA = { name:"Nana Rose", emoji:"👵", color:"#F4A9B8" };
const MONTH = new Date().toISOString().slice(0,7);

function compound(weekly, years, rate=0.07) {
  const weeks = years * 52;
  let total = 0;
  for (let i = 0; i < weeks; i++) total = (total + weekly) * (1 + rate/52);
  return Math.round(total);
}

function compoundLump(principal, years, rate=0.07) {
  return Math.round(principal * Math.pow(1 + rate, years));
}

function formatK(n) {
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n/1000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

function formatFull(n) {
  return "$" + Math.round(n).toLocaleString();
}

// ── RETIREMENT CALCULATOR ─────────────────────────────────────────────────────
function RetirementCalc() {
  const W = BRAND;
  const [showResult, setShowResult] = useState(false);
  const [form, setForm] = useState({
    currentAge: 28, retireAge: 65,
    currentSavings: 0, monthly401k: 0,
    pension: "no", monthlyExpenses: 3000, desiredIncome: 4000,
  });

  const years = Math.max(form.retireAge - form.currentAge, 1);
  const nestEggNeeded = form.desiredIncome * 12 * 25;
  const currentSavingsGrown = compoundLump(form.currentSavings, years);
  const monthly401kGrown = compound(form.monthly401k * 4.33, years);
  const projectedTotal = currentSavingsGrown + monthly401kGrown;
  const gap = Math.max(nestEggNeeded - projectedTotal, 0);
  const monthlyNeeded = gap > 0 ? Math.round(gap / (years * 12)) : 0;
  const pctFunded = Math.min((projectedTotal / nestEggNeeded) * 100, 100);
  const actualRetireAge = gap > 0 ? Math.min(Math.round(form.retireAge + (gap / Math.max(projectedTotal,1)) * 5), 99) : form.retireAge;

  const card = (s={}) => ({ background:W.card, border:`1px solid ${W.border}`, borderRadius:18, padding:18, ...s });

  const Slider = ({ label, value, onChange, min, max, step=1, prefix="", suffix="" }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:13, color:W.mid }}>{label}</span>
        <span style={{ fontSize:14, fontWeight:800, color:W.accent }}>{prefix}{value.toLocaleString()}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))} style={{ width:"100%", accentColor:W.accent }}/>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        <span style={{ fontSize:10, color:W.soft }}>{prefix}{Number(min).toLocaleString()}{suffix}</span>
        <span style={{ fontSize:10, color:W.soft }}>{prefix}{Number(max).toLocaleString()}{suffix}</span>
      </div>
    </div>
  );

  if (showResult) return (
    <div style={{ animation:"scaleIn 0.35s ease" }}>
      <div style={{ ...card({ background:"rgba(232,149,106,0.08)", borderColor:"rgba(232,149,106,0.33)", textAlign:"center", padding:"28px 20px", marginBottom:14 }) }}>
        <p style={{ fontSize:11, color:W.soft, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Your Retirement Number</p>
        <p style={{ fontSize:52, fontWeight:800, fontFamily:"'Fraunces',serif", color:W.accent }}>{formatK(nestEggNeeded)}</p>
        <p style={{ fontSize:13, color:W.mid, marginTop:6, fontStyle:"italic" }}>To retire at {form.retireAge} with {formatFull(form.desiredIncome)}/month</p>
      </div>
      <div style={{ ...card({ marginBottom:14 }) }}>
        <p style={{ fontSize:12, fontWeight:700, color:W.accent, marginBottom:14 }}>📊 Where You Stand Today</p>
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          <div style={{ flex:1, textAlign:"center", padding:"12px", background:"rgba(110,231,183,0.08)", borderRadius:12, border:"1px solid rgba(110,231,183,0.2)" }}>
            <p style={{ fontSize:11, color:W.soft, marginBottom:4 }}>On track to have</p>
            <p style={{ fontSize:20, fontWeight:800, color:"#6EE7B7" }}>{formatK(projectedTotal)}</p>
          </div>
          <div style={{ flex:1, textAlign:"center", padding:"12px", background:"rgba(252,165,165,0.08)", borderRadius:12, border:"1px solid rgba(252,165,165,0.2)" }}>
            <p style={{ fontSize:11, color:W.soft, marginBottom:4 }}>Gap to close</p>
            <p style={{ fontSize:20, fontWeight:800, color:"#FCA5A5" }}>{formatK(gap)}</p>
          </div>
        </div>
        <div style={{ marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:12, color:W.mid }}>Retirement funded</span>
            <span style={{ fontSize:13, fontWeight:800, color:pctFunded>=80?"#6EE7B7":pctFunded>=50?W.accent:"#FCA5A5" }}>{pctFunded.toFixed(0)}%</span>
          </div>
          <div style={{ height:8, background:"rgba(253,240,232,0.08)", borderRadius:4 }}>
            <div style={{ height:"100%", borderRadius:4, background:`linear-gradient(90deg,${W.rose},${W.accent})`, width:`${pctFunded}%`, transition:"width 0.6s ease" }}/>
          </div>
        </div>
        <p style={{ fontSize:12, color:W.soft, textAlign:"center", marginTop:10, fontStyle:"italic" }}>
          At your current pace you retire at age <span style={{ color:W.accent, fontWeight:800 }}>{actualRetireAge}</span>
        </p>
      </div>
      {gap > 0 && (
        <div style={{ ...card({ marginBottom:14 }) }}>
          <p style={{ fontSize:12, fontWeight:700, color:W.accent, marginBottom:14 }}>💡 What Needs to Change</p>
          {[
            { label:"Extra needed per month", value:formatFull(monthlyNeeded), color:"#6EE7B7" },
            { label:"That is per week", value:formatFull(monthlyNeeded/4.33), color:W.accent },
            { label:"Years you have left", value:`${years} years`, color:"#45B7D1" },
          ].map(({label,value,color})=>(
            <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid rgba(253,240,232,0.06)` }}>
              <span style={{ fontSize:13, color:W.mid }}>{label}</span>
              <span style={{ fontSize:14, fontWeight:800, color }}>{value}</span>
            </div>
          ))}
          <div style={{ marginTop:14, padding:"14px", background:"rgba(232,149,106,0.1)", borderRadius:12, textAlign:"center" }}>
            <p style={{ fontSize:13, color:W.cream, fontStyle:"italic", fontFamily:"'Fraunces',serif", lineHeight:1.6 }}>
              "{formatFull(monthlyNeeded/4.33)} a week. Less than one Starbucks a day. Your retirement is hiding in your daily habits."
            </p>
          </div>
        </div>
      )}
      <div style={{ ...card({ marginBottom:14 }) }}>
        <p style={{ fontSize:12, fontWeight:700, color:W.accent, marginBottom:14 }}>🔮 What If You Saved More?</p>
        {[100, 250, 500].map(extra=>{
          const newTotal = currentSavingsGrown + compound((form.monthly401k + extra) * 4.33, years);
          const newPct = Math.min((newTotal/nestEggNeeded)*100, 100);
          return (
            <div key={extra} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:13, color:W.mid }}>+${extra}/month more</span>
                <span style={{ fontSize:13, fontWeight:800, color:"#6EE7B7" }}>{newPct.toFixed(0)}% → {formatK(newTotal)}</span>
              </div>
              <div style={{ height:4, background:"rgba(253,240,232,0.08)", borderRadius:2 }}>
                <div style={{ height:"100%", borderRadius:2, background:"#6EE7B7", width:`${newPct}%` }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ ...card({ background:"rgba(232,149,106,0.08)", borderColor:"rgba(232,149,106,0.3)", textAlign:"center", padding:"24px 20px", marginBottom:14 }) }}>
        <p style={{ fontSize:11, color:W.soft, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>RetireRicher</p>
        <p style={{ fontSize:18, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:W.cream, marginBottom:8, lineHeight:1.4 }}>
          "I know exactly how to close this gap. Let me show you."
        </p>
        <p style={{ fontSize:12, color:W.mid, marginBottom:16, lineHeight:1.6 }}>A complimentary 20-minute call. No pressure. Just clarity on exactly what to do next.</p>
        <button style={{ width:"100%", padding:"15px", background:W.accent, border:"none", borderRadius:14, color:W.bg, fontSize:14, fontWeight:800, cursor:"pointer", marginBottom:8 }}>
          Book My Free Call →
        </button>
        <p style={{ fontSize:11, color:W.soft, fontStyle:"italic" }}>Your future self wants you to.</p>
      </div>
      <button onClick={()=>setShowResult(false)} style={{ width:"100%", padding:"12px", background:"transparent", border:`1px solid ${W.border}`, borderRadius:12, color:W.soft, fontSize:13, cursor:"pointer", marginBottom:20 }}>
        ← Recalculate
      </button>
    </div>
  );

  return (
    <div style={{ animation:"scaleIn 0.35s ease" }}>
      <div style={{ marginBottom:20 }}>
        <p style={{ fontSize:11, color:W.soft, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>Retirement Calculator</p>
        <h2 style={{ fontSize:22, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:W.cream, lineHeight:1.3 }}>How much do you actually need to retire?</h2>
        <p style={{ fontSize:13, color:W.soft, marginTop:6 }}>Move the sliders. We will find your number.</p>
      </div>
      <div style={card({ marginBottom:14 })}>
        <p style={{ fontSize:12, fontWeight:700, color:W.accent, marginBottom:16 }}>👤 About You</p>
        <Slider label="Current age" value={form.currentAge} min={18} max={60} onChange={v=>setForm(f=>({...f,currentAge:v}))} suffix=" yrs"/>
        <Slider label="I want to retire at" value={form.retireAge} min={50} max={80} onChange={v=>setForm(f=>({...f,retireAge:v}))} suffix=" yrs"/>
      </div>
      <div style={card({ marginBottom:14 })}>
        <p style={{ fontSize:12, fontWeight:700, color:W.accent, marginBottom:16 }}>💰 Your Money Right Now</p>
        <Slider label="Total savings today" value={form.currentSavings} min={0} max={500000} step={1000} onChange={v=>setForm(f=>({...f,currentSavings:v}))} prefix="$"/>
        <Slider label="Monthly contributions (401k + IRA)" value={form.monthly401k} min={0} max={3000} step={25} onChange={v=>setForm(f=>({...f,monthly401k:v}))} prefix="$" suffix="/mo"/>
        <div style={{ marginTop:4 }}>
          <p style={{ fontSize:13, color:W.mid, marginBottom:10 }}>Do you have a pension?</p>
          <div style={{ display:"flex", gap:8 }}>
            {["yes","no","not sure"].map(opt=>(
              <button key={opt} onClick={()=>setForm(f=>({...f,pension:opt}))} style={{ flex:1, padding:"10px 4px", borderRadius:10, border:`1px solid ${form.pension===opt?W.accent:W.border}`, background:form.pension===opt?"rgba(232,149,106,0.15)":"transparent", color:form.pension===opt?W.cream:W.soft, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif", textTransform:"capitalize" }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={card({ marginBottom:14 })}>
        <p style={{ fontSize:12, fontWeight:700, color:W.accent, marginBottom:16 }}>🌴 Your Retirement Vision</p>
        <Slider label="Desired monthly income in retirement" value={form.desiredIncome} min={1000} max={15000} step={100} onChange={v=>setForm(f=>({...f,desiredIncome:v}))} prefix="$" suffix="/mo"/>
        <Slider label="Current monthly expenses" value={form.monthlyExpenses} min={500} max={15000} step={100} onChange={v=>setForm(f=>({...f,monthlyExpenses:v}))} prefix="$" suffix="/mo"/>
      </div>
      <div style={{ ...card({ background:"rgba(232,149,106,0.06)", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }) }}>
        <div><p style={{ fontSize:11, color:W.soft, marginBottom:2 }}>Years to retirement</p><p style={{ fontSize:26, fontWeight:800, color:W.accent }}>{years}</p></div>
        <div style={{ textAlign:"center" }}><p style={{ fontSize:11, color:W.soft, marginBottom:2 }}>You will need</p><p style={{ fontSize:22, fontWeight:800, color:W.cream }}>{formatK(nestEggNeeded)}</p></div>
        <div style={{ textAlign:"right" }}><p style={{ fontSize:11, color:W.soft, marginBottom:2 }}>On track for</p><p style={{ fontSize:22, fontWeight:800, color:"#6EE7B7" }}>{formatK(projectedTotal)}</p></div>
      </div>
      <button onClick={()=>setShowResult(true)} style={{ width:"100%", padding:"16px", background:W.accent, border:"none", borderRadius:14, color:W.bg, fontSize:15, fontWeight:800, cursor:"pointer", marginBottom:20 }}>
        Show Me My Number 💅
      </button>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [tab, setTab] = useState("home");
  const [expenses, setExpenses] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState(null);
  const [saved, setSaved] = useState(false);
  const [reaction, setReaction] = useState("");
  const [recording, setRecording] = useState(false);
  const [cutTo, setCutTo] = useState(4);
  const [totalSaved, setTotalSaved] = useState(0);

  // Onboarding
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState(28);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [goalAmounts, setGoalAmounts] = useState({});

  const recRef = useRef();
  const nextId = useRef(1);
  const W = BRAND;

  const thisMonth = expenses.filter(e=>e.date.startsWith(MONTH));
  const totalSpent = thisMonth.reduce((s,e)=>s+e.amount,0);
  const totalBudget = Object.values(BUDGETS).reduce((a,b)=>a+b,0);
  const activeGoals = ALL_GOALS.filter(g=>selectedGoals.includes(g.id)).map(g=>({...g, target: goalAmounts[g.id] || g.target, saved:0}));

  const weeklySaved = (8 - cutTo) * 8.50;
  const y1  = compound(weeklySaved, 1);
  const y3  = compound(weeklySaved, 3);
  const y5  = compound(weeklySaved, 5);
  const y10 = compound(weeklySaved, 10);
  const y30 = compound(weeklySaved, 30);

  const toggleGoal = (id) => setSelectedGoals(prev => prev.includes(id) ? prev.filter(g=>g!==id) : [...prev,id]);

  const startRec = () => {
    setTranscript(""); setParsed(null); setSaved(false); setReaction("");
    if (!("webkitSpeechRecognition" in window)&&!("SpeechRecognition" in window)) { setTranscript("Demo mode — tap Try demo below"); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous=false; rec.interimResults=true; rec.lang="en-US";
    let last="";
    rec.onresult=e=>{ last=Array.from(e.results).map(r=>r[0].transcript).join(" "); setTranscript(last); };
    rec.onend=()=>{ setRecording(false); if(last) setParsed({ amount:0, store:"", date:new Date().toISOString().split("T")[0], purpose:"", category:"other" }); };
    rec.onerror=()=>setRecording(false);
    recRef.current=rec; rec.start(); setRecording(true);
  };
  const stopRec = () => { recRef.current?.stop(); setRecording(false); };

  const demo = () => {
    setTranscript("Spent $38.50 at Starbucks for coffee");
    setParsed({ amount:38.50, store:"Starbucks", date:new Date().toISOString().split("T")[0], purpose:"coffee", category:"food" });
  };

  const save = () => {
    if(!parsed) return;
    setExpenses(p=>[{id:nextId.current++,...parsed,member:name||"You"},...p]);
    setSaved(true);
    setReaction(`${name ? name + " baby" : "Baby"} you logged it!! Nana is SO proud!! 💕`);
    setTimeout(()=>{ setParsed(null); setTranscript(""); setSaved(false); },400);
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,400&family=Nunito:wght@400;600;700;800&display=swap');
    @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    @keyframes pulseR  { 0%,100%{box-shadow:0 0 0 4px rgba(239,68,68,0.2)} 50%{box-shadow:0 0 0 18px rgba(239,68,68,0.04)} }
    @keyframes glowP   { 0%,100%{box-shadow:0 0 0 4px rgba(232,149,106,0.2)} 50%{box-shadow:0 0 0 18px rgba(232,149,106,0.04)} }
    @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes shimmer { 0%,100%{opacity:0.7} 50%{opacity:1} }
    @keyframes confetti{ to{transform:translateY(110vh) rotate(540deg);opacity:0} }
    * { box-sizing:border-box; margin:0; padding:0; }
    button,input { font-family:'Nunito',sans-serif; }
    input[type=range] { -webkit-appearance:none; height:4px; border-radius:2px; background:rgba(232,149,106,0.2); }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; border-radius:50%; background:#E8956A; cursor:pointer; }
    input[type=text],input[type=email],input[type=tel],input[type=password] { width:100%; padding:14px 16px; background:rgba(255,255,255,0.06); border:1px solid rgba(232,149,106,0.25); border-radius:12px; color:#FDF0E8; font-size:15px; outline:none; margin-bottom:12px; }
    input[type=text]::placeholder,input[type=email]::placeholder,input[type=tel]::placeholder,input[type=password]::placeholder { color:rgba(253,240,232,0.3); }
    ::-webkit-scrollbar { display:none; }
    body { background:#0A0500; margin:0; }
  `;

  const card = (s={}) => ({ background:W.card, border:`1px solid ${W.border}`, borderRadius:18, padding:18, ...s });
  const NAV = [
    { id:"home",    emoji:"💅", label:"Home"    },
    { id:"record",  emoji:"🎙️", label:"Record"  },
    { id:"growth",  emoji:"📈", label:"Growth"  },
    { id:"retire",  emoji:"🌱", label:"Retire"  },
    { id:"history", emoji:"📋", label:"History" },
  ];

  // ── SCREEN 1 — WELCOME ──────────────────────────────────────────────────────
  if (screen === "welcome") return (
    <div style={{ minHeight:"100vh", background:W.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", fontFamily:"'Nunito',sans-serif", textAlign:"center", position:"relative", overflow:"hidden" }}>
      <style>{CSS}</style>
      <div style={{ position:"absolute", top:60, right:40, fontSize:20, animation:"shimmer 2s infinite" }}>✨</div>
      <div style={{ position:"absolute", top:100, left:30, fontSize:14, animation:"shimmer 2.5s infinite" }}>✨</div>
      <div style={{ position:"absolute", bottom:120, right:50, fontSize:16, animation:"shimmer 3s infinite" }}>✨</div>
      <div style={{ position:"absolute", top:80, left:60, fontSize:12, animation:"shimmer 3.5s infinite" }}>✨</div>

      <div style={{ fontSize:80, marginBottom:16, animation:"float 2s ease-in-out infinite" }}>💅</div>
      <h1 style={{ fontSize:38, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:W.accent, marginBottom:6, lineHeight:1.2 }}>Rich Girl Habits</h1>
      <p style={{ fontSize:12, color:W.soft, marginBottom:8, letterSpacing:2, textTransform:"uppercase" }}>A RetireRicher Product</p>
      <div style={{ width:60, height:1, background:`linear-gradient(90deg,transparent,${W.accent},transparent)`, margin:"12px auto 20px" }}/>

      <p style={{ fontSize:16, color:W.mid, fontStyle:"italic", fontFamily:"'Fraunces',serif", fontWeight:300, marginBottom:8, lineHeight:1.7 }}>
        "Your future self wants you to."
      </p>
      <p style={{ fontSize:13, color:W.soft, marginBottom:32, fontStyle:"italic" }}>
        For when you have more month than money.
      </p>

      <button onClick={()=>setScreen("signup")} style={{ width:"100%", maxWidth:320, padding:"18px", background:W.accent, border:"none", borderRadius:16, color:W.bg, fontSize:16, fontWeight:800, cursor:"pointer", marginBottom:12 }}>
        Get Started 💅
      </button>
      <button onClick={()=>setScreen("app")} style={{ width:"100%", maxWidth:320, padding:"14px", background:"transparent", border:`1px solid ${W.border}`, borderRadius:16, color:W.soft, fontSize:13, cursor:"pointer" }}>
        I already have an account
      </button>
      <p style={{ fontSize:11, color:"rgba(253,240,232,0.2)", marginTop:28, lineHeight:1.6 }}>
        Free to start · No credit card needed<br/>Build wealth one habit at a time
      </p>
    </div>
  );

  // ── SCREEN 2 — SIGN UP ──────────────────────────────────────────────────────
  if (screen === "signup") return (
    <div style={{ minHeight:"100vh", background:W.bg, display:"flex", flexDirection:"column", padding:"56px 24px 40px", fontFamily:"'Nunito',sans-serif", color:W.cream, overflowY:"auto" }}>
      <style>{CSS}</style>
      <button onClick={()=>setScreen("welcome")} style={{ background:"none", border:"none", color:W.soft, fontSize:13, cursor:"pointer", textAlign:"left", marginBottom:24, padding:0 }}>← Back</button>

      {/* Progress */}
      <div style={{ display:"flex", gap:6, marginBottom:28 }}>
        {[1,2,3].map(i=>(
          <div key={i} style={{ flex:i===1?2:1, height:4, borderRadius:2, background:i===1?W.accent:"rgba(232,149,106,0.25)", transition:"all 0.3s" }}/>
        ))}
      </div>

      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:36, marginBottom:10 }}>👋</div>
        <h2 style={{ fontSize:26, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:W.accent, marginBottom:10, lineHeight:1.2 }}>
          Welcome to Rich Girl Habits.
        </h2>
        <p style={{ fontSize:14, color:W.mid, lineHeight:1.8 }}>
          This is not just a calculator.
        </p>
        <p style={{ fontSize:13, color:W.soft, lineHeight:1.8, marginTop:6 }}>
          We help you understand where your money is really going — and what it is costing your future self. We want to help you build better financial habits and shift your money mindset.
        </p>
        <div style={{ marginTop:14, padding:"14px 16px", background:"rgba(232,149,106,0.08)", borderRadius:14, border:`1px solid ${W.border}` }}>
          <p style={{ fontSize:13, color:W.cream, fontStyle:"italic", fontFamily:"'Fraunces',serif", lineHeight:1.7 }}>
            "The more honest you are with your numbers, the better your results. The goal is simple — be proud of what you <strong>save</strong>. Not what you spend on stuff."
          </p>
        </div>
      </div>

      <label style={{ fontSize:12, fontWeight:700, color:W.mid, letterSpacing:0.5, display:"block", marginBottom:6 }}>First Name *</label>
      <input type="text" placeholder="What do we call you?" value={name} onChange={e=>setName(e.target.value)}/>

      <label style={{ fontSize:12, fontWeight:700, color:W.mid, letterSpacing:0.5, display:"block", marginBottom:6 }}>Email *</label>
      <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>

      <label style={{ fontSize:12, fontWeight:700, color:W.mid, letterSpacing:0.5, display:"block", marginBottom:6 }}>Password *</label>
      <input type="password" placeholder="Create a password" value={password} onChange={e=>setPassword(e.target.value)}/>

      <label style={{ fontSize:12, fontWeight:700, color:W.mid, letterSpacing:0.5, display:"block", marginBottom:6 }}>ZIP Code *</label>
      <input type="text" placeholder="Your ZIP code" value={zip} onChange={e=>setZip(e.target.value)} maxLength={5}/>

      <label style={{ fontSize:12, fontWeight:700, color:W.mid, letterSpacing:0.5, display:"block", marginBottom:6 }}>Phone <span style={{fontWeight:400,color:W.soft}}>(optional)</span></label>
      <input type="tel" placeholder="(555) 000-0000" value={phone} onChange={e=>setPhone(e.target.value)}/>

      <p style={{ fontSize:11, color:W.soft, marginBottom:24, lineHeight:1.6 }}>
        We will send your weekly Rich Girl Report to your email. No spam. Ever.
      </p>

      <button onClick={()=>{ if(name&&email&&password&&zip) setScreen("about"); }}
        style={{ width:"100%", padding:"16px", background:name&&email&&password&&zip?W.accent:"rgba(232,149,106,0.3)", border:"none", borderRadius:14, color:name&&email&&password&&zip?W.bg:"rgba(253,240,232,0.3)", fontSize:15, fontWeight:800, cursor:name&&email&&password&&zip?"pointer":"default", marginBottom:16 }}>
        Next → A Little About You
      </button>

      <p style={{ fontSize:11, color:W.soft, textAlign:"center", lineHeight:1.6 }}>
        By continuing you agree to our terms. A RetireRicher product.
      </p>
    </div>
  );

  // ── SCREEN 3 — ABOUT YOU ────────────────────────────────────────────────────
  if (screen === "about") return (
    <div style={{ minHeight:"100vh", background:W.bg, display:"flex", flexDirection:"column", padding:"56px 24px 60px", fontFamily:"'Nunito',sans-serif", color:W.cream, overflowY:"auto" }}>
      <style>{CSS}</style>
      <button onClick={()=>setScreen("signup")} style={{ background:"none", border:"none", color:W.soft, fontSize:13, cursor:"pointer", textAlign:"left", marginBottom:24, padding:0 }}>← Back</button>

      {/* Progress */}
      <div style={{ display:"flex", gap:6, marginBottom:28 }}>
        {[1,2,3].map(i=>(
          <div key={i} style={{ flex:i<=2?2:1, height:4, borderRadius:2, background:i<=2?W.accent:"rgba(232,149,106,0.25)", transition:"all 0.3s" }}/>
        ))}
      </div>

      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:36, marginBottom:10 }}>🌱</div>
        <h2 style={{ fontSize:26, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:W.accent, marginBottom:8, lineHeight:1.2 }}>
          A little about you{name?`, ${name}`:""}. 
        </h2>
        <p style={{ fontSize:13, color:W.soft, lineHeight:1.7 }}>
          No judgment here. Zero is a starting point too. The more honest you are, the better your personalized wealth plan will be. 💅
        </p>
      </div>

      {/* Age */}
      <div style={{ ...card({ marginBottom:14 }) }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:13, color:W.mid }}>How old are you?</span>
          <span style={{ fontSize:16, fontWeight:800, color:W.accent }}>{age}</span>
        </div>
        <input type="range" min={18} max={65} step={1} value={age} onChange={e=>setAge(Number(e.target.value))} style={{ width:"100%", accentColor:W.accent }}/>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
          <span style={{ fontSize:10, color:W.soft }}>18</span>
          <span style={{ fontSize:10, color:W.soft }}>65</span>
        </div>
      </div>

      {/* Current savings */}
      <div style={{ ...card({ marginBottom:20 }) }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:13, color:W.mid }}>What are you working with right now?</span>
          <span style={{ fontSize:16, fontWeight:800, color:W.accent }}>${currentSavings.toLocaleString()}</span>
        </div>
        <input type="range" min={0} max={100000} step={500} value={currentSavings} onChange={e=>setCurrentSavings(Number(e.target.value))} style={{ width:"100%", accentColor:W.accent }}/>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
          <span style={{ fontSize:10, color:W.soft }}>$0</span>
          <span style={{ fontSize:10, color:W.soft }}>$100k+</span>
        </div>
        <p style={{ fontSize:11, color:W.soft, marginTop:8, fontStyle:"italic" }}>Include 401k, savings, IRA — everything. Zero is perfectly fine. 💅</p>
      </div>

      {/* Goals */}
      <p style={{ fontSize:13, fontWeight:700, color:W.accent, marginBottom:4 }}>What are you building toward?</p>
      <p style={{ fontSize:12, color:W.soft, marginBottom:14, lineHeight:1.6 }}>Pick all that apply. This is YOUR wealth plan.</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
        {ALL_GOALS.map(g=>{
          const selected = selectedGoals.includes(g.id);
          return (
            <button key={g.id} onClick={()=>toggleGoal(g.id)} style={{ padding:"16px 12px", borderRadius:16, border:`2px solid ${selected?g.color:W.border}`, background:selected?`${g.color}18`:"transparent", cursor:"pointer", fontFamily:"'Nunito',sans-serif", textAlign:"center", transition:"all 0.2s", position:"relative" }}>
              {selected && <div style={{ position:"absolute", top:8, right:8, fontSize:12 }}>✨</div>}
              <div style={{ fontSize:28, marginBottom:6 }}>{g.emoji}</div>
              <p style={{ fontSize:12, fontWeight:800, color:selected?W.cream:W.mid, marginBottom:2 }}>{g.label}</p>
              <p style={{ fontSize:10, color:selected?`${g.color}`:`${W.soft}`, fontStyle:"italic" }}>{g.tagline}</p>
            </button>
          );
        })}
      </div>

      <button onClick={()=>{ if(selectedGoals.length>0) setScreen("goalamounts"); }}
        style={{ width:"100%", padding:"16px", background:selectedGoals.length>0?W.accent:"rgba(232,149,106,0.3)", border:"none", borderRadius:14, color:selectedGoals.length>0?W.bg:"rgba(253,240,232,0.3)", fontSize:15, fontWeight:800, cursor:selectedGoals.length>0?"pointer":"default", marginBottom:8 }}>
        Next → Set My Goals
      </button>
      <p style={{ fontSize:11, color:W.soft, textAlign:"center" }}>Select at least one goal to continue</p>
    </div>
  );

  // ── SCREEN 4 — GOAL AMOUNTS ─────────────────────────────────────────────────
  if (screen === "goalamounts") return (
    <div style={{ minHeight:"100vh", background:W.bg, display:"flex", flexDirection:"column", padding:"56px 24px 60px", fontFamily:"'Nunito',sans-serif", color:W.cream, overflowY:"auto" }}>
      <style>{CSS}</style>
      <button onClick={()=>setScreen("about")} style={{ background:"none", border:"none", color:W.soft, fontSize:13, cursor:"pointer", textAlign:"left", marginBottom:24, padding:0 }}>← Back</button>

      {/* Progress */}
      <div style={{ display:"flex", gap:6, marginBottom:28 }}>
        {[1,2,3].map(i=>(
          <div key={i} style={{ flex:2, height:4, borderRadius:2, background:W.accent, transition:"all 0.3s" }}/>
        ))}
      </div>

      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:36, marginBottom:10 }}>💰</div>
        <h2 style={{ fontSize:26, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:W.accent, marginBottom:8, lineHeight:1.2 }}>
          How much for each goal?
        </h2>
        <p style={{ fontSize:13, color:W.soft, lineHeight:1.7 }}>
          Set your target for each goal. You can always adjust later.
        </p>
      </div>

      {ALL_GOALS.filter(g=>selectedGoals.includes(g.id)).map(g=>{
        const amount = goalAmounts[g.id] || g.target;
        const weeklyNeeded = Math.round(amount / 52);
        return (
          <div key={g.id} style={{ ...card({ marginBottom:14, borderColor:`${g.color}44` }) }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <span style={{ fontSize:24 }}>{g.emoji}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:700, color:W.cream }}>{g.label}</p>
                <p style={{ fontSize:11, color:W.soft, fontStyle:"italic" }}>{g.tagline}</p>
              </div>
              <p style={{ fontSize:20, fontWeight:800, color:g.color }}>${amount.toLocaleString()}</p>
            </div>
            <input type="range" min={500} max={g.id==="house"?100000:g.id==="wealth"?200000:50000} step={500} value={amount}
              onChange={e=>setGoalAmounts(prev=>({...prev,[g.id]:Number(e.target.value)}))}
              style={{ width:"100%", accentColor:g.color }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
              <span style={{ fontSize:11, color:W.soft }}>$500</span>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:12, fontWeight:700, color:g.color }}>~${weeklyNeeded}/week to get there in 1 year</p>
              </div>
              <span style={{ fontSize:11, color:W.soft }}>${g.id==="house"?"100k":g.id==="wealth"?"200k":"50k"}</span>
            </div>
          </div>
        );
      })}

      <button onClick={()=>setScreen("ready")} style={{ width:"100%", padding:"16px", background:W.accent, border:"none", borderRadius:14, color:W.bg, fontSize:15, fontWeight:800, cursor:"pointer", marginTop:8 }}>
        I am ready to build wealth 💅
      </button>
    </div>
  );

  // ── SCREEN 5 — YOU ARE READY ────────────────────────────────────────────────
  if (screen === "ready") return (
    <div style={{ minHeight:"100vh", background:W.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", fontFamily:"'Nunito',sans-serif", color:W.cream, textAlign:"center", position:"relative", overflow:"hidden" }}>
      <style>{CSS}</style>

      {/* Confetti */}
      {Array.from({length:40},(_,i)=>(
        <div key={i} style={{ position:"absolute", left:`${Math.random()*100}%`, top:-20, width:8+Math.random()*8, height:8+Math.random()*8, background:["#F5D5B8","#E8956A","#C4965A","#FDF0E8","#6EE7B7"][i%5], borderRadius:i%2===0?"50%":2, animation:`confetti ${2+Math.random()*1.5}s ${Math.random()*1}s ease-in forwards` }}/>
      ))}

      <div style={{ fontSize:64, marginBottom:20 }}>🎉</div>
      <h1 style={{ fontSize:32, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:W.accent, marginBottom:16, lineHeight:1.3 }}>
        {name}, you just did something most people never do.
      </h1>

      <div style={{ background:W.card, border:`1px solid ${W.border}`, borderRadius:18, padding:"20px 18px", marginBottom:20, textAlign:"left", width:"100%" }}>
        <p style={{ fontSize:13, color:W.mid, lineHeight:1.8, fontStyle:"italic", fontFamily:"'Fraunces',serif" }}>
          "You made a plan. That is literally the whole game. Most people spend their whole lives meaning to start. You just did. Your future self wanted you to. And you listened."
        </p>
      </div>

      {/* Goals summary */}
      <div style={{ width:"100%", marginBottom:24 }}>
        <p style={{ fontSize:11, color:W.soft, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Your Wealth Plan</p>
        {ALL_GOALS.filter(g=>selectedGoals.includes(g.id)).map(g=>(
          <div key={g.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:W.card, borderRadius:12, marginBottom:6, border:`1px solid ${W.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>{g.emoji}</span>
              <span style={{ fontSize:13, fontWeight:700 }}>{g.label}</span>
            </div>
            <span style={{ fontSize:13, fontWeight:800, color:g.color }}>${(goalAmounts[g.id]||g.target).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div style={{ background:"rgba(232,149,106,0.08)", border:`1px solid ${W.border}`, borderRadius:16, padding:"14px 16px", marginBottom:24, width:"100%" }}>
        <p style={{ fontSize:13, color:W.mid, fontStyle:"italic", lineHeight:1.6 }}>
          This is your turning point. Your future self is already proud of you. 💅
        </p>
        <p style={{ fontSize:11, color:W.soft, marginTop:6 }}>— A RetireRicher product</p>
      </div>

      <button onClick={()=>setScreen("app")} style={{ width:"100%", padding:"18px", background:W.accent, border:"none", borderRadius:16, color:W.bg, fontSize:16, fontWeight:800, cursor:"pointer" }}>
        Let's Build My Wealth 💅
      </button>
    </div>
  );

  // ── MAIN APP ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:W.bg, fontFamily:"'Nunito',sans-serif", color:W.cream, maxWidth:430, margin:"0 auto" }}>
      <style>{CSS}</style>

      <div style={{ padding:"44px 20px 14px", display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <p style={{ fontSize:10, color:W.soft, letterSpacing:2, textTransform:"uppercase", marginBottom:2 }}>
            {new Date().toLocaleString("default",{month:"long",year:"numeric"})}
          </p>
          <h1 style={{ fontSize:22, fontWeight:800, fontFamily:"'Fraunces',serif", fontStyle:"italic" }}>
            {name ? `Hey ${name} 💅` : "Rich Girl Habits"}
          </h1>
          <p style={{ fontSize:10, color:W.soft }}>A RetireRicher product</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:18, fontWeight:800, color:W.accent }}>${totalSaved.toLocaleString()}</p>
          <p style={{ fontSize:10, color:W.soft }}>total saved 💅</p>
        </div>
      </div>

      <div style={{ display:"flex", gap:2, padding:"0 20px 14px" }}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{ flex:1, padding:"8px 2px", borderRadius:10, border:"none", cursor:"pointer", fontSize:9, fontWeight:800, background:tab===n.id?W.accent:"rgba(255,255,255,0.05)", color:tab===n.id?W.bg:W.soft, transition:"all 0.2s" }}>
            <div style={{fontSize:13,marginBottom:2}}>{n.emoji}</div>{n.label}
          </button>
        ))}
      </div>

      {/* HOME */}
      {tab==="home" && (
        <div style={{ padding:"0 20px 120px", animation:"scaleIn 0.35s ease" }}>
          {reaction && (
            <div style={{ ...card(), background:"rgba(244,169,184,0.1)", borderColor:"rgba(244,169,184,0.25)", marginBottom:14, display:"flex", gap:10 }}>
              <span style={{fontSize:22}}>{PERSONA.emoji}</span>
              <div style={{flex:1}}>
                <p style={{fontSize:11,fontWeight:800,color:PERSONA.color,marginBottom:3}}>{PERSONA.name}</p>
                <p style={{fontSize:13,color:W.mid,lineHeight:1.6}}>{reaction}</p>
              </div>
              <button onClick={()=>setReaction("")} style={{background:"none",border:"none",color:W.soft,cursor:"pointer",fontSize:16}}>×</button>
            </div>
          )}

          <div style={{ ...card({ marginBottom:14 }) }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <p style={{fontSize:10,color:W.soft,marginBottom:3}}>SPENT THIS MONTH</p>
                <p style={{fontSize:32,fontWeight:800,fontFamily:"'Fraunces',serif"}}>${totalSpent.toFixed(0)}</p>
                <p style={{fontSize:11,color:W.soft}}>of ${totalBudget} budget</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:10,color:W.soft,marginBottom:3}}>TOTAL SAVED</p>
                <p style={{fontSize:24,fontWeight:800,color:W.accent}}>${totalSaved.toLocaleString()}</p>
                <p style={{fontSize:11,color:W.soft}}>since day 1 💅</p>
              </div>
            </div>
            <div style={{height:5,background:"rgba(253,240,232,0.08)",borderRadius:3}}>
              <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${W.rose},${W.accent})`,width:`${Math.min(totalSpent/totalBudget*100,100)}%`}}/>
            </div>
            {totalSpent===0 && <p style={{fontSize:12,color:W.soft,marginTop:10,textAlign:"center",fontStyle:"italic"}}>No expenses yet. Tap Record to log your first one! 💅</p>}
          </div>

          <button onClick={()=>setTab("record")} style={{ width:"100%",padding:"14px",background:"transparent",border:`1.5px dashed ${W.border}`,borderRadius:14,color:W.mid,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
            <span style={{fontSize:22}}>🎙️</span> Tap to record an expense
          </button>

          <div onClick={()=>setTab("retire")} style={{ ...card({ background:"rgba(196,150,90,0.08)", borderColor:"rgba(196,150,90,0.25)", marginBottom:14, cursor:"pointer", display:"flex", alignItems:"center", gap:12 }) }}>
            <span style={{fontSize:28}}>🌱</span>
            <div style={{flex:1}}>
              <p style={{fontSize:13,fontWeight:700,color:W.cream,marginBottom:2}}>Find your retirement number</p>
              <p style={{fontSize:11,color:W.soft}}>How much do you actually need? Tap to find out.</p>
            </div>
            <span style={{color:W.soft,fontSize:18}}>→</span>
          </div>

          {activeGoals.length > 0 ? activeGoals.map(g=>(
            <div key={g.id} style={{ ...card({ marginBottom:10 }) }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>{g.emoji}</span>
                  <div>
                    <p style={{fontSize:13,fontWeight:700}}>{g.label}</p>
                    <p style={{fontSize:11,color:W.soft,fontStyle:"italic"}}>{g.tagline}</p>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:16,fontWeight:800,color:g.color}}>${g.saved.toLocaleString()}</p>
                  <p style={{fontSize:11,color:W.soft}}>of ${g.target.toLocaleString()}</p>
                </div>
              </div>
              <div style={{height:5,background:"rgba(253,240,232,0.08)",borderRadius:3}}>
                <div style={{height:"100%",borderRadius:3,background:g.color,width:`${(g.saved/g.target)*100}%`}}/>
              </div>
            </div>
          )) : (
            <div style={{ ...card({ textAlign:"center", padding:"20px" }) }}>
              <p style={{fontSize:13,color:W.soft,fontStyle:"italic"}}>Your goals will appear here after setup.</p>
            </div>
          )}
        </div>
      )}

      {/* RECORD */}
      {tab==="record" && (
        <div style={{ padding:"0 20px 120px", animation:"scaleIn 0.35s ease" }}>
          {reaction && (
            <div style={{ ...card(), background:"rgba(244,169,184,0.1)", borderColor:"rgba(244,169,184,0.25)", marginBottom:14, display:"flex", gap:10 }}>
              <span style={{fontSize:22}}>{PERSONA.emoji}</span>
              <p style={{fontSize:13,color:W.mid,lineHeight:1.6,flex:1}}>{reaction}</p>
              <button onClick={()=>setReaction("")} style={{background:"none",border:"none",color:W.soft,cursor:"pointer",fontSize:16}}>×</button>
            </div>
          )}
          <div style={{ ...card({ padding:"32px 20px", textAlign:"center", marginBottom:14 }) }}>
            <button onMouseDown={startRec} onMouseUp={stopRec} onTouchStart={startRec} onTouchEnd={stopRec}
              style={{ width:96,height:96,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:34,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",
                background:recording?"linear-gradient(135deg,#EF4444,#DC2626)":`linear-gradient(135deg,${W.rose},${W.accent})`,
                animation:recording?"pulseR 1.2s infinite":"glowP 3s infinite" }}>
              {recording?"⏹":"🎙️"}
            </button>
            <p style={{marginTop:14,fontSize:13,color:W.mid}}>{recording?"Listening… release to stop":"Hold to record an expense"}</p>
            <p style={{marginTop:4,fontSize:11,color:W.soft}}>"I spent $38.50 at Starbucks for coffee"</p>
          </div>
          <button onClick={demo} style={{ width:"100%",padding:"11px",background:"transparent",border:`1px dashed ${W.border}`,borderRadius:12,color:W.soft,fontSize:12,cursor:"pointer",marginBottom:14 }}>
            ✨ Try demo input
          </button>
          {transcript && (
            <div style={{ ...card({ marginBottom:14 }), animation:"fadeUp 0.3s ease" }}>
              <p style={{fontSize:10,color:W.soft,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Heard</p>
              <p style={{fontSize:14,fontStyle:"italic",color:W.mid}}>"{transcript}"</p>
            </div>
          )}
          {parsed && !saved && (
            <div style={{ ...card({ marginBottom:14 }), animation:"fadeUp 0.3s ease" }}>
              <p style={{fontSize:36,fontWeight:800,fontFamily:"'Fraunces',serif",marginBottom:14}}>${parsed.amount?.toFixed(2)}</p>
              {[["Store",parsed.store||"—"],["Category",CATS[parsed.category]?.label||"Other"],["Purpose",parsed.purpose||"—"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(253,240,232,0.06)"}}>
                  <span style={{fontSize:12,color:W.soft}}>{k}</span>
                  <span style={{fontSize:13,fontWeight:600}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:14}}>
                <p style={{fontSize:11,fontWeight:700,color:W.mid,marginBottom:8}}>What are you saving for?</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {activeGoals.map(g=>(
                    <div key={g.id} style={{padding:"5px 10px",background:"rgba(232,149,106,0.15)",border:`1px solid ${W.border}`,borderRadius:99,fontSize:11,color:W.cream,fontWeight:700,cursor:"pointer"}}>
                      {g.emoji} {g.label.split(" ")[0]}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={save} style={{ width:"100%",padding:"15px",background:W.accent,border:"none",borderRadius:14,color:W.bg,fontSize:14,fontWeight:800,cursor:"pointer",marginTop:14 }}>
                Save Expense 💅
              </button>
            </div>
          )}
        </div>
      )}

      {/* GROWTH */}
      {tab==="growth" && (
        <div style={{ padding:"0 20px 120px", animation:"scaleIn 0.35s ease" }}>
          <div style={{ ...card({ background:"rgba(232,149,106,0.08)",borderColor:"rgba(232,149,106,0.33)",marginBottom:16,padding:"24px 20px",textAlign:"center" }) }}>
            <p style={{fontSize:10,color:W.soft,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Total Saved Since Day 1</p>
            <p style={{fontSize:48,fontWeight:800,fontFamily:"'Fraunces',serif",color:W.accent}}>${totalSaved.toLocaleString()}</p>
            <p style={{fontSize:13,color:W.mid,marginTop:6,fontStyle:"italic"}}>"Your future self is getting closer."</p>
          </div>
          <div style={{ ...card({ marginBottom:14 }) }}>
            <p style={{fontSize:11,color:W.soft,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>The Gut Punch Calculator</p>
            <h2 style={{fontSize:18,fontWeight:800,fontFamily:"'Fraunces',serif",fontStyle:"italic",marginBottom:16,color:W.cream}}>What is your Starbucks habit costing you?</h2>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:11,color:W.soft,marginBottom:4}}>RIGHT NOW</p>
                <p style={{fontSize:28,fontWeight:800,color:"#FCA5A5"}}>8x</p>
                <p style={{fontSize:11,color:W.soft}}>per week</p>
              </div>
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
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:11,color:W.soft,marginBottom:4}}>SAVED</p>
                <p style={{fontSize:28,fontWeight:800,color:"#6EE7B7"}}>${weeklySaved.toFixed(0)}</p>
                <p style={{fontSize:11,color:W.soft}}>per week</p>
              </div>
            </div>
            {[[1,y1],[3,y3],[5,y5],[10,y10],[30,y30]].map(([yr,val])=>(
              <div key={yr} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:13,color:W.mid}}>{yr} year{yr>1?"s":""}</span>
                  <span style={{fontSize:16,fontWeight:800,color:yr>=10?W.accent:W.cream}}>{formatK(val)}</span>
                </div>
                <div style={{height:4,background:"rgba(253,240,232,0.08)",borderRadius:2}}>
                  <div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${W.rose},${W.accent})`,width:`${Math.min(val/y30,1)*100}%`}}/>
                </div>
              </div>
            ))}
            <div style={{marginTop:14,padding:"14px",background:"rgba(232,149,106,0.12)",borderRadius:12,border:"1px solid rgba(232,149,106,0.25)",textAlign:"center"}}>
              <p style={{fontSize:13,color:W.mid,marginBottom:4}}>In 5 years that is</p>
              <p style={{fontSize:28,fontWeight:800,fontFamily:"'Fraunces',serif",color:W.accent,marginBottom:6}}>{formatK(y5)}</p>
              <p style={{fontSize:13,color:W.cream,fontStyle:"italic"}}>"Your Emergency Fund. Done."</p>
              <p style={{fontSize:11,color:W.soft,marginTop:8,fontStyle:"italic"}}>Your future self wants you to.</p>
            </div>
          </div>
        </div>
      )}

      {/* RETIRE */}
      {tab==="retire" && (
        <div style={{ padding:"0 20px 120px", animation:"scaleIn 0.35s ease" }}>
          <RetirementCalc/>
        </div>
      )}

      {/* HISTORY */}
      {tab==="history" && (
        <div style={{ padding:"0 20px 120px", animation:"scaleIn 0.35s ease" }}>
          <div style={{ ...card({ marginBottom:14,display:"flex",justifyContent:"space-between" }) }}>
            <div><p style={{fontSize:10,color:W.soft,marginBottom:3}}>THIS MONTH</p><p style={{fontSize:26,fontWeight:800,fontFamily:"'Fraunces',serif"}}>${totalSpent.toFixed(0)}</p></div>
            <div style={{textAlign:"right"}}><p style={{fontSize:10,color:W.soft,marginBottom:3}}>TRANSACTIONS</p><p style={{fontSize:26,fontWeight:800,fontFamily:"'Fraunces',serif"}}>{thisMonth.length}</p></div>
          </div>
          {expenses.length === 0 ? (
            <div style={{ ...card({ textAlign:"center", padding:"32px 20px" }) }}>
              <p style={{fontSize:32,marginBottom:12}}>📋</p>
              <p style={{fontSize:14,color:W.mid,fontStyle:"italic"}}>No expenses logged yet.</p>
              <p style={{fontSize:12,color:W.soft,marginTop:6}}>Tap Record to get started! 💅</p>
            </div>
          ) : expenses.map(e=>(
            <div key={e.id} style={{ ...card({ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",marginBottom:8 }) }}>
              <div style={{width:38,height:38,borderRadius:10,background:`${CATS[e.category]?.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{CATS[e.category]?.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.store||"Expense"}</p>
                <p style={{fontSize:11,color:W.soft,marginTop:1}}>{e.member} · {e.purpose||"purchase"}</p>
              </div>
              <p style={{fontSize:14,fontWeight:800,flexShrink:0}}>-${e.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(10,5,0,0.96)",borderTop:`1px solid ${W.border}`,padding:"10px 20px 24px" }}>
        <div style={{display:"flex",gap:2}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{ flex:1,padding:"8px 2px",borderRadius:10,border:"none",cursor:"pointer",fontSize:9,fontWeight:800,background:tab===n.id?W.accent:"transparent",color:tab===n.id?W.bg:W.soft,transition:"all 0.2s" }}>
              <div style={{fontSize:13,marginBottom:2}}>{n.emoji}</div>{n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
