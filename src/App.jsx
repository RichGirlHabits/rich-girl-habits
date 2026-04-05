const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;import { useState, useRef } from "react";

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
