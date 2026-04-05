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

const GOALS = [
  { id:"emergency", emoji:"🛡️", label:"Emergency Fund", target:5000, saved:0, color:"#6EE7B7" },
  { id:"vacation",  emoji:"✈️", label:"Vacation Fund",  target:3000, saved:0, color:"#45B7D1" },
  { id:"roth",      emoji:"📈", label:"Roth IRA",       target:7000, saved:0, color:"#C4965A" },
];

const PERSONA = { name:"Nana Rose", emoji:"👵", color:"#F4A9B8" };
const MONTH = "2026-04";

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
    currentAge: 28,
    retireAge: 65,
    currentSavings: 0,
    monthly401k: 0,
    pension: "no",
    monthlyExpenses: 3000,
    desiredIncome: 4000,
  });

  const years = Math.max(form.retireAge - form.currentAge, 1);
  const nestEggNeeded = form.desiredIncome * 12 * 25;
  const currentSavingsGrown = compoundLump(form.currentSavings, years);
  const monthly401kGrown = compound(form.monthly401k * 4.33, years);
  const projectedTotal = currentSavingsGrown + monthly401kGrown;
  const gap = Math.max(nestEggNeeded - projectedTotal, 0);
  const monthlyNeeded = gap > 0 ? Math.round(gap / (years * 12)) : 0;
  const pctFunded = Math.min((projectedTotal / nestEggNeeded) * 100, 100);
  const actualRetireAge = gap > 0
    ? Math.min(Math.round(form.currentAge + years * 1.5), 99)
    : form.retireAge;

  const card = (s={}) => ({ background:W.card, border:`1px solid ${W.border}`, borderRadius:18, padding:18, ...s });

  const Slider = ({ label, value, onChange, min, max, step=1, prefix="", suffix="" }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:13, color:W.mid }}>{label}</span>
        <span style={{ fontSize:14, fontWeight:800, color:W.accent }}>{prefix}{value.toLocaleString()}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{ width:"100%", accentColor:W.accent }}/>
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
        <p style={{ fontSize:13, color:W.mid, marginTop:6, fontStyle:"italic" }}>
          To retire at {form.retireAge} with {formatFull(form.desiredIncome)}/month
        </p>
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
            { label:"Extra needed per month",  value:formatFull(monthlyNeeded),      color:"#6EE7B7" },
            { label:"That is per week",         value:formatFull(monthlyNeeded/4.33), color:W.accent  },
            { label:"Years you have left",      value:`${years} years`,               color:"#45B7D1" },
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
        <p style={{ fontSize:12, color:W.mid, marginBottom:16, lineHeight:1.6 }}>
          A complimentary 20-minute call. No pressure. Just clarity on exactly what to do next.
        </p>
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
        <h2 style={{ fontSize:22, fontWeight:300, fontFamily:"'Fraunces',serif", fontStyle:"italic", color:W.cream, lineHeight:1.3 }}>
          How much do you actually need to retire?
        </h2>
        <p style={{ fontSize:13, color:W.soft, marginTop:6 }}>Move the sliders. We will find your number.</p>
      </div>

      <div style={card({ marginBottom:14 })}>
        <p style={{ fontSize:12, fontWeight:700, color:W.accent, marginBottom:16 }}>👤 About You</p>
        <Slider label="Current age" value={form.currentAge} min={18} max={60}
          onChange={v=>setForm(f=>({...f,currentAge:v}))} suffix=" yrs"/>
        <Slider label="I want to retire at" value={form.retireAge} min={50} max={80}
          onChange={v=>setForm(f=>({...f,retireAge:v}))} suffix=" yrs"/>
      </div>

      <div style={card({ marginBottom:14 })}>
        <p style={{ fontSize:12, fontWeight:700, color:W.accent, marginBottom:16 }}>💰 Your Money Right Now</p>
        <Slider label="Total savings today" value={form.currentSavings} min={0} max={500000} step={1000}
          onChange={v=>setForm(f=>({...f,currentSavings:v}))} prefix="$"/>
        <Slider label="Monthly contributions (401k + IRA)" value={form.monthly401k} min={0} max={3000} step={25}
          onChange={v=>setForm(f=>({...f,monthly401k:v}))} prefix="$" suffix="/mo"/>
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
        <Slider label="Desired monthly income in retirement" value={form.desiredIncome} min={1000} max={15000} step={100}
          onChange={v=>setForm(f=>({...f,desiredIncome:v}))} prefix="$" suffix="/mo"/>
        <Slider label="Current monthly expenses" value={form.monthlyExpenses} min={500} max={15000} step={100}
          onChange={v=>setForm(f=>({...f,monthlyExpenses:v}))} prefix="$" suffix="/mo"/>
      </div>

      <div style={{ ...card({ background:"rgba(232,149,106,0.06)", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }) }}>
        <div>
          <p style={{ fontSize:11, color:W.soft, marginBottom:2 }}>Years to retirement</p>
          <p style={{ fontSize:26, fontWeight:800, color:W.accent }}>{years}</p>
        </div>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:11, color:W.soft, marginBottom:2 }}>You will need</p>
          <p style={{ fontSize:22, fontWeight:800, color:W.cream }}>{formatK(nestEggNeeded)}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:11, color:W.soft, marginBottom:2 }}>On track for</p>
          <p style={{ fontSize:22, fontWeight:800, color:"#6EE7B7" }}>{formatK(projectedTotal)}</p>
        </div>
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
  const [onboardName, setOnboardName] = useState("");
  const [onboardEmail, setOnboardEmail] = useState("");
  const [onboardPhone, setOnboardPhone] = useState("");
  const recRef = useRef();
  const nextId = useRef(1);
  const W = BRAND;

  const thisMonth = expenses.filter(e=>e.date.startsWith(MONTH));
  const totalSpent = thisMonth.reduce((s,e)=>s+e.amount,0);
  const totalBudget = Object.values(BUDGETS).reduce((a,b)=>a+b,0);

  const weeklySaved = (8 - cutTo) * 8.50;
  const y1  = compound(weeklySaved, 1);
  const y3  = compound(weeklySaved, 3);
  const y5  = compound(weeklySaved, 5);
  const y10 = compound(weeklySaved, 10);
  const y30 = compound(weeklySaved, 30);

  const startRec = () => {
    setTranscript(""); setParsed(null); setSaved(false); setReaction("");
    if (!("webkitSpeechRecognition" in window)&&!("SpeechRecognition" in window)) {
      setTranscript("Demo mode — tap Try demo below"); return;
    }
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
    const newExp = {id:nextId.current++,...parsed,member:onboardName||"You"};
    setExpenses(p=>[newExp,...p]);
    setSaved(true);
    setReaction(`${onboardName ? onboardName + " you" : "Baby you"} logged it!! Nana is SO proud!! 💕`);
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
    * { box-sizing:border-box; margin:0; padding:0; }
    button,input { font-family:'Nunito',sans-serif; }
    input[type=range] { -webkit-appearance:none; height:4px; border-radius:2px; background:rgba(232,149,106,0.2); }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; border-radius:50%; background:#E8956A; cursor:pointer; }
    input[type=text],input[type=email],input[type=tel] { width:100%; padding:14px 16px; background:rgba(255,255,255,0.06); border:1px solid rgba(232,149,106,0.25); border-radius:12px; color:#FDF0E8; font-size:15px; outline:none; margin-bottom:12px; }
    input[type=text]::placeholder,input[type=email]::placeholder,input[type=tel]::placeholder { color:rgba(253,240,232,0.3); }
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

  // ── WELCOME ─────────────────────────────────────────────────────────────────
  if (screen === "welcome") return (
