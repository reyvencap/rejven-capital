"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LineChart, Line, AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, Tooltip,
} from "recharts";
import {
  BookOpen, ArrowUpRight, ArrowLeft, Plus, Lock, Activity, Trash2, Shield,
} from "lucide-react";

/* ----------------------------------------------------------------------
   REJVEN CAPITAL — a radically transparent trade-following site
   - Email + password account gate (demo logic; swap for real auth before launch).
   - Manual trade entry (admin) + a live feed: simulated by default, real
     Finnhub quotes once FINNHUB_KEY is set (served via /api/quotes).
   - Free / public after sign-up; subscription paywall designed-in, off.
   - State is in-memory for now (resets on reload) — wire a database next.
---------------------------------------------------------------------- */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

:root{
  --paper:#F6F4EE; --card:#FFFFFF; --ink:#15130E; --muted:#8C8676;
  --brand:#0E3A46; --brand-tint:#E5EEF0;
  --gain:#1E7A4E; --loss:#B23A2E;
  --line:#E5E1D6; --line-soft:#EEEBE2;
}
*{box-sizing:border-box}
.ob-root{
  background:var(--paper); color:var(--ink);
  font-family:'Inter',system-ui,sans-serif;
  min-height:100vh; -webkit-font-smoothing:antialiased;
}
.serif{font-family:'Instrument Serif',Georgia,serif; font-weight:400; letter-spacing:-.01em;}
.num{font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums; letter-spacing:-.02em;}
.wrap{max-width:1080px; margin:0 auto; padding:0 20px;}

/* disclaimer ribbon */
.ribbon{background:var(--ink); color:var(--paper); font-size:12.5px; letter-spacing:.02em;}
.ribbon .wrap{display:flex; gap:10px; align-items:center; padding:9px 20px;}
.ribbon b{font-weight:600;}

/* live tape */
.tape{border-bottom:1px solid var(--line); background:var(--card); overflow:hidden; white-space:nowrap;}
.tape-mask{display:flex; width:max-content; animation:tape 38s linear infinite;}
.tape-item{display:inline-flex; align-items:center; gap:8px; padding:9px 18px; border-right:1px solid var(--line-soft); font-size:13px;}
.tape-item .tk{font-weight:600;}
@keyframes tape{from{transform:translateX(0)} to{transform:translateX(-50%)}}

/* masthead */
.masthead{border-bottom:1px solid var(--line);}
.masthead .wrap{display:flex; align-items:flex-end; justify-content:space-between; padding:26px 20px 22px; gap:16px; flex-wrap:wrap;}
.brandmark{display:flex; align-items:center; gap:11px;}
.brandmark .dot{width:34px;height:34px;border-radius:50%;background:var(--brand);display:grid;place-items:center;color:#fff;flex:none;}
.brandmark h1{font-size:34px; line-height:.95; margin:0;}
.tagline{color:var(--muted); font-size:13.5px; margin-top:3px;}

/* segmented toggle */
.seg{display:inline-flex; background:var(--brand-tint); border-radius:999px; padding:3px;}
.seg button{border:0; background:transparent; font:inherit; font-size:13.5px; font-weight:500; color:var(--brand);
  padding:7px 16px; border-radius:999px; cursor:pointer;}
.seg button[aria-pressed="true"]{background:var(--brand); color:#fff;}

/* section heads */
.eyebrow{font-size:11.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); font-weight:600;}
.sec-title{font-size:26px; margin:4px 0 0;}

/* fund grid + cards */
.grid{display:grid; grid-template-columns:repeat(3,1fr); gap:16px;}
.card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px;
  cursor:pointer; transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;}
.card:hover{transform:translateY(-3px); box-shadow:0 14px 30px -18px rgba(14,58,70,.35); border-color:#cfd9d2;}
.card:focus-visible{outline:2px solid var(--brand); outline-offset:3px;}
.card .fname{font-size:21px; margin:2px 0 4px;}
.card .strat{font-size:13px; color:var(--muted); min-height:34px; line-height:1.35;}
.bigval{font-size:27px; margin-top:12px;}
.row-stats{display:flex; gap:18px; margin-top:8px; font-size:13px;}
.kv .k{color:var(--muted); font-size:11px; letter-spacing:.04em; text-transform:uppercase;}
.kv .v{font-weight:600;}
.open-link{display:flex; align-items:center; gap:5px; color:var(--brand); font-weight:600; font-size:13.5px; margin-top:14px;}

.gain{color:var(--gain);} .loss{color:var(--loss);}
.flash-up{animation:fu .7s ease-out;} .flash-down{animation:fd .7s ease-out;}
@keyframes fu{from{background:rgba(30,122,78,.20)} to{background:transparent}}
@keyframes fd{from{background:rgba(178,58,46,.20)} to{background:transparent}}

/* detail */
.back{display:inline-flex; align-items:center; gap:6px; background:none; border:0; font:inherit; color:var(--brand);
  font-weight:600; cursor:pointer; padding:6px 0;}
.detail-head{display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; margin-top:6px;}
.statband{display:flex; gap:30px; flex-wrap:wrap; margin:18px 0 6px; padding:16px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line);}
.statband .k{font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted);}
.statband .v{font-size:21px; margin-top:3px;}

.panel{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px; margin-top:18px;}
.panel h3{font-size:13px; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); margin:0 0 12px; font-weight:600;}

table{width:100%; border-collapse:collapse; font-size:13.5px;}
th{text-align:right; font-size:10.5px; letter-spacing:.07em; text-transform:uppercase; color:var(--muted);
  font-weight:600; padding:0 0 9px; border-bottom:1px solid var(--line);}
th:first-child,td:first-child{text-align:left;}
td{padding:11px 0; border-bottom:1px solid var(--line-soft); text-align:right;}
tbody tr:last-child td{border-bottom:0;}
.tname{color:var(--muted); font-size:11.5px;}
.wbar{height:5px; border-radius:3px; background:var(--line); overflow:hidden; width:64px; margin-left:auto;}
.wbar i{display:block; height:100%; background:var(--brand);}
.tablescroll{overflow-x:auto;}

.ledger-row{display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--line-soft); font-size:13.5px;}
.ledger-row:last-child{border-bottom:0;}
.pill{font-size:10.5px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; padding:3px 8px; border-radius:6px;}
.pill.buy{background:rgba(30,122,78,.12); color:var(--gain);}
.pill.sell{background:rgba(178,58,46,.12); color:var(--loss);}

/* manage form */
.form-grid{display:grid; grid-template-columns:repeat(6,1fr); gap:12px;}
label.fld{display:flex; flex-direction:column; gap:5px; font-size:11.5px; color:var(--muted); letter-spacing:.04em; text-transform:uppercase; font-weight:600;}
.fld input,.fld select{font:inherit; font-size:14px; color:var(--ink); padding:9px 10px; border:1px solid var(--line);
  border-radius:9px; background:var(--card);}
.fld input:focus,.fld select:focus{outline:2px solid var(--brand); outline-offset:0; border-color:var(--brand);}
.btn{background:var(--brand); color:#fff; border:0; font:inherit; font-weight:600; font-size:14px;
  padding:11px 18px; border-radius:10px; cursor:pointer; display:inline-flex; align-items:center; gap:7px;}
.btn:hover{filter:brightness(1.08);} .btn:focus-visible{outline:2px solid var(--ink); outline-offset:2px;}
.note{font-size:12.5px; color:var(--muted); display:flex; align-items:center; gap:7px; margin-top:14px;}

.live{display:inline-flex; align-items:center; gap:6px; color:var(--gain); font-size:12px; font-weight:600;}
.live .pulse{width:7px;height:7px;border-radius:50%;background:var(--gain); animation:pulse 1.6s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:.35} 50%{opacity:1}}

footer{margin:48px 0 36px; color:var(--muted); font-size:12.5px; line-height:1.5;}
footer .wrap{padding-top:22px; border-top:1px solid var(--line);}

@media (max-width:760px){
  .grid{grid-template-columns:1fr;}
  .form-grid{grid-template-columns:1fr 1fr;}
  .brandmark h1{font-size:28px;}
  .sec-title{font-size:22px;}
}
.acct{display:flex; align-items:center; gap:9px; font-size:12.5px;}
.acct button{background:none; border:1px solid var(--line); border-radius:8px; padding:5px 10px; font:inherit; font-size:12px; color:var(--ink); cursor:pointer;}
.acct button:hover{border-color:var(--brand); color:var(--brand);}
.badge{font-size:9.5px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; padding:3px 7px; border-radius:6px; background:var(--brand); color:#fff;}
.badge.member{background:var(--brand-tint); color:var(--brand);}

/* admin console */
.fld textarea{font:inherit; font-size:14px; color:var(--ink); padding:9px 10px; border:1px solid var(--line); border-radius:9px; background:var(--card); resize:vertical; min-height:52px;}
.fld textarea:focus{outline:2px solid var(--brand); border-color:var(--brand);}
.efund{border:1px solid var(--line); border-radius:12px; padding:16px; margin-bottom:14px;}
.efund:last-child{margin-bottom:0;}
.efund .ehead{display:flex; gap:10px; align-items:flex-start;}
.iconbtn{background:none; border:1px solid var(--line); border-radius:8px; min-width:32px; height:32px; display:grid; place-items:center; cursor:pointer; color:var(--muted); flex:none;}
.iconbtn:hover{border-color:var(--loss); color:var(--loss);}
.hrow{display:flex; gap:8px; align-items:center; margin-top:8px;}
.hrow input{font:inherit; font-size:13.5px; padding:7px 9px; border:1px solid var(--line); border-radius:8px; background:var(--card); min-width:0;}
.hrow input:focus{outline:2px solid var(--brand); border-color:var(--brand);}
.hint{font-size:11.5px; color:var(--muted); background:var(--line-soft); border-radius:8px; padding:9px 11px; line-height:1.5; margin-top:14px;}

/* stock search dropdown */
.search-wrap{position:relative; margin-top:8px;}
.search-wrap > input{width:100%; font:inherit; font-size:14px; padding:10px 12px; border:1px solid var(--line); border-radius:9px; background:var(--card); color:var(--ink);}
.search-wrap > input:focus{outline:2px solid var(--brand); border-color:var(--brand);}
.results{position:absolute; z-index:30; left:0; right:0; top:calc(100% + 4px); background:var(--card); border:1px solid var(--line); border-radius:10px; box-shadow:0 16px 36px -18px rgba(20,19,14,.45); max-height:264px; overflow:auto;}
.result{display:flex; gap:10px; align-items:center; width:100%; text-align:left; background:none; border:0; border-bottom:1px solid var(--line-soft); padding:10px 12px; font:inherit; font-size:13px; cursor:pointer; color:var(--ink);}
.result:last-child{border-bottom:0;}
.result:hover{background:var(--brand-tint);}
.result .desc{color:var(--muted); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
.result .ex{color:var(--muted); font-size:11px;}

/* auth gate */
.auth{max-width:430px; margin:56px auto; padding:0 20px;}
.auth-card{background:var(--card); border:1px solid var(--line); border-radius:16px; padding:30px;}
.auth .lock{display:flex; align-items:center; gap:11px; margin-bottom:22px;}
.auth .lock .dot{width:38px;height:38px;border-radius:50%;background:var(--brand);display:grid;place-items:center;color:#fff;flex:none;}
.auth h2{font-size:28px; margin:0; line-height:1;}
.auth .tabs{display:flex; gap:4px; background:var(--brand-tint); border-radius:10px; padding:3px; margin-bottom:18px;}
.auth .tabs button{flex:1; border:0; background:transparent; font:inherit; font-size:13.5px; font-weight:500; color:var(--brand); padding:9px; border-radius:8px; cursor:pointer;}
.auth .tabs button[aria-pressed="true"]{background:#fff;}
.auth .stack{display:flex; flex-direction:column; gap:13px;}
.auth .stack .btn{width:100%; justify-content:center;}
.auth .err{color:var(--loss); font-size:12.5px;}
.auth .ghost{background:none; border:0; color:var(--brand); font:inherit; font-size:13px; cursor:pointer; text-decoration:underline; padding:2px;}
.auth .fineprint{font-size:11.5px; color:var(--muted); line-height:1.55; margin-top:16px;}

@media (prefers-reduced-motion:reduce){
  .tape-mask{animation:none;} .flash-up,.flash-down,.live .pulse{animation:none;}
  .card{transition:none;}
}
`;

/* ---------- seed data ---------- */
const seedFunds = [
  {
    id: "nordic", name: "Nordic Compounders", inception: 100000, cash: 8200,
    strategy: "High-quality Nordic & European businesses held for the long compound.",
    holdings: [
      { tk: "NVO",  name: "Novo Nordisk", shares: 220,  avg: 98.4,  price: 112.30, prev: 110.80 },
      { tk: "SPOT", name: "Spotify",      shares: 60,   avg: 305.0, price: 486.20, prev: 479.50 },
      { tk: "ASML", name: "ASML Holding", shares: 18,   avg: 690.0, price: 731.50, prev: 742.00 },
      { tk: "ERIC", name: "Ericsson",     shares: 1500, avg: 6.10,  price: 7.85,   prev: 7.78  },
    ],
    trades: [
      { date: "2026-06-22", tk: "SPOT", side: "Buy",  shares: 15, price: 482.0 },
      { date: "2026-06-18", tk: "ERIC", side: "Buy",  shares: 500, price: 7.40 },
      { date: "2026-06-11", tk: "ASML", side: "Sell", shares: 4,  price: 715.0 },
    ],
  },
  {
    id: "ai", name: "AI & Semiconductors", inception: 100000, cash: 5400,
    strategy: "Concentrated exposure to the compute build-out — silicon, tooling, hyperscale.",
    holdings: [
      { tk: "NVDA", name: "NVIDIA",            shares: 400, avg: 88.0,  price: 134.70, prev: 131.20 },
      { tk: "AMD",  name: "Advanced Micro",    shares: 150, avg: 142.0, price: 151.30, prev: 154.00 },
      { tk: "TSM",  name: "Taiwan Semi",       shares: 120, avg: 158.0, price: 191.40, prev: 188.90 },
      { tk: "MSFT", name: "Microsoft",         shares: 70,  avg: 372.0, price: 441.80, prev: 438.00 },
    ],
    trades: [
      { date: "2026-06-23", tk: "NVDA", side: "Buy",  shares: 50, price: 132.5 },
      { date: "2026-06-20", tk: "AMD",  side: "Sell", shares: 30, price: 156.0 },
      { date: "2026-06-09", tk: "TSM",  side: "Buy",  shares: 20, price: 184.0 },
    ],
  },
  {
    id: "global", name: "Global Quality", inception: 100000, cash: 12000,
    strategy: "Wide-moat global leaders bought on weakness and rarely sold.",
    holdings: [
      { tk: "AAPL",  name: "Apple",       shares: 180, avg: 178.0, price: 226.40, prev: 224.10 },
      { tk: "GOOGL", name: "Alphabet",    shares: 220, avg: 138.0, price: 179.20, prev: 181.00 },
      { tk: "V",     name: "Visa",        shares: 90,  avg: 245.0, price: 291.50, prev: 289.70 },
      { tk: "COST",  name: "Costco",      shares: 14,  avg: 720.0, price: 961.00, prev: 955.20 },
    ],
    trades: [
      { date: "2026-06-21", tk: "AAPL",  side: "Buy",  shares: 25, price: 223.0 },
      { date: "2026-06-15", tk: "COST",  side: "Buy",  shares: 4,  price: 940.0 },
      { date: "2026-06-05", tk: "GOOGL", side: "Sell", shares: 30, price: 184.5 },
    ],
  },
];

/* deterministic-ish history so charts have shape ending near current value */
function makeHistory(endValue, seed) {
  const pts = []; let v = endValue * 0.86; let s = seed;
  for (let i = 39; i >= 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280 - 0.45;
    v = v * (1 + r * 0.022 + 0.0042);
    pts.push({ t: 40 - i, v: Math.round(v) });
  }
  pts[pts.length - 1].v = Math.round(endValue);
  return pts;
}

const usd = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const usd2 = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (n) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";

function mv(f) { return (+f.cash || 0) + f.holdings.reduce((s, h) => s + (+h.shares || 0) * (+h.price || 0), 0); }
function prevMv(f) { return (+f.cash || 0) + f.holdings.reduce((s, h) => s + (+h.shares || 0) * (+h.prev || 0), 0); }

/* demo admin credentials (in production this lives in your auth provider, never in code) */
const ADMIN_EMAIL = "admin@rejven.capital";
const ADMIN_PW = "rejven-admin";

export default function OpenBook() {
  const [view, setView] = useState("follow");      // follow | manage
  const [funds, setFunds] = useState(seedFunds);
  const [openId, setOpenId] = useState(null);
  const [flash, setFlash] = useState({});           // key `${fundId}:${tk}` -> 'up'|'down'
  const [user, setUser] = useState(null);           // { email }
  const [feed, setFeed] = useState("sim");          // sim | live | error
  const histories = useMemo(
    () => Object.fromEntries(seedFunds.map((f, i) => [f.id, makeHistory(mv(f), 100 + i * 37)])),
    []
  );
  const flashTimers = useRef({});

  function doFlash(key, dir) {
    clearTimeout(flashTimers.current[key]);
    setFlash((fl) => ({ ...fl, [key]: dir }));
    flashTimers.current[key] = setTimeout(
      () => setFlash((fl) => { const c = { ...fl }; delete c[key]; return c; }), 700
    );
  }

  // Current set of tickers across all funds. Changes only when a stock is
  // added or removed — which is what re-subscribes the live feed below.
  const tickerKey = [...new Set(funds.flatMap((f) => f.holdings.map((h) => h.tk)))].sort().join(",");

  /* simulated feed — runs whenever the live feed isn't flowing */
  useEffect(() => {
    if (feed === "live") return;
    const id = setInterval(() => {
      setFunds((prev) =>
        prev.map((f) => ({
          ...f,
          holdings: f.holdings.map((h) => {
            const drift = (Math.random() - 0.5) * 0.006;          // ±0.3%
            const np = Math.max(0.5, +(h.price * (1 + drift)).toFixed(2));
            doFlash(`${f.id}:${h.tk}`, np >= h.price ? "up" : "down");
            return { ...h, price: np };
          }),
        }))
      );
    }, 2600);
    return () => { clearInterval(id); Object.values(flashTimers.current).forEach(clearTimeout); };
  }, [feed]);

  /* live feed — pulls real quotes through our own /api/quotes route, so the
     Finnhub key stays on the server. Re-subscribes whenever the ticker set
     changes (new stocks go live within one cycle), and falls back to the
     simulated feed if no key is set or the request fails. */
  useEffect(() => {
    const symbols = tickerKey ? tickerKey.split(",") : [];
    if (symbols.length === 0) return;
    let alive = true;
    async function pull() {
      try {
        const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(tickerKey)}`);
        const map = await res.json();
        if (!alive) return;
        if (map.error) { setFeed("error"); return; }
        let any = false;
        setFunds((prev) =>
          prev.map((f) => ({
            ...f,
            holdings: f.holdings.map((h) => {
              const q = map[h.tk];
              if (!q || !q.c) return h;
              any = true;
              doFlash(`${f.id}:${h.tk}`, q.c >= h.price ? "up" : "down");
              return { ...h, price: +(+q.c).toFixed(2), prev: q.pc || h.prev };
            }),
          }))
        );
        setFeed(any ? "live" : "error");
      } catch {
        if (alive) setFeed("error");
      }
    }
    pull();
    const id = setInterval(pull, 15000);
    return () => { alive = false; clearInterval(id); };
  }, [tickerKey]);

  const feedLabel = feed === "live" ? "Live · Finnhub" : feed === "error" ? "Live feed off — simulated" : "Simulated";

  const open = funds.find((f) => f.id === openId) || null;
  const allHoldings = funds.flatMap((f) => f.holdings.map((h) => ({ ...h, fid: f.id })));

  /* manual trade entry */
  function addTrade(fid, t) {
    setFunds((prev) =>
      prev.map((f) => {
        if (f.id !== fid) return f;
        const trades = [{ ...t }, ...f.trades];
        let holdings = [...f.holdings];
        const i = holdings.findIndex((h) => h.tk === t.tk);
        if (t.side === "Buy") {
          if (i >= 0) {
            const h = holdings[i], ns = h.shares + t.shares;
            holdings[i] = { ...h, shares: ns, avg: +((h.avg * h.shares + t.price * t.shares) / ns).toFixed(2) };
          } else {
            holdings.push({ tk: t.tk, name: t.tk, shares: t.shares, avg: t.price, price: t.price, prev: t.price });
          }
        } else if (i >= 0) {
          holdings[i] = { ...holdings[i], shares: Math.max(0, holdings[i].shares - t.shares) };
        }
        return { ...f, holdings: holdings.filter((h) => h.shares > 0), trades };
      })
    );
  }

  return (
    <div className="ob-root">
      <style>{STYLES}</style>

      {!user ? (
        <Auth onAuth={setUser} />
      ) : (
      <>
      {/* compliance, reframed as the product's promise */}
      <div className="ribbon">
        <div className="wrap">
          <span><b>An open book.</b> Real positions, shown for transparency &amp; education — not investment advice.</span>
        </div>
      </div>

      {/* live tape — the signature element */}
      <div className="tape" aria-hidden="true">
        <div className="tape-mask">
          {[0, 1].map((dup) => (
            <div key={dup} style={{ display: "flex" }}>
              {allHoldings.map((h) => {
                const ch = ((h.price - h.prev) / h.prev) * 100;
                return (
                  <span className="tape-item num" key={dup + h.fid + h.tk}>
                    <span className="tk">{h.tk}</span>
                    <span>{usd2(h.price)}</span>
                    <span className={ch >= 0 ? "gain" : "loss"}>{pct(ch)}</span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* masthead */}
      <header className="masthead">
        <div className="wrap">
          <div className="brandmark">
            <span className="dot"><BookOpen size={18} /></span>
            <div>
              <h1 className="serif">Rejven Capital</h1>
              <div className="tagline">Every position. Every trade. In the open.</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {user.role === "admin" && (
              <div className="seg" role="group" aria-label="Switch view">
                <button aria-pressed={view === "follow"} onClick={() => setView("follow")}>Follow</button>
                <button aria-pressed={view === "manage"} onClick={() => { setView("manage"); setOpenId(null); }}>Admin</button>
              </div>
            )}
            <div className="acct num">
              <span className={`badge ${user.role === "admin" ? "" : "member"}`}>{user.role === "admin" ? "Admin" : "Member"}</span>
              <span style={{ color: "#8C8676" }}>{user.email}</span>
              <button onClick={() => { setUser(null); setView("follow"); setOpenId(null); }}>Sign out</button>
            </div>
          </div>
        </div>
      </header>

      <main className="wrap" style={{ paddingTop: 30 }}>
        {view === "follow" && !open && (
          <Overview funds={funds} histories={histories} flash={flash} feedLabel={feedLabel} onOpen={(id) => setOpenId(id)} />
        )}
        {view === "follow" && open && (
          <Detail fund={open} history={histories[open.id]} flash={flash} feedLabel={feedLabel} onBack={() => setOpenId(null)} />
        )}
        {view === "manage" && user.role === "admin" && (
          <Manage funds={funds} setFunds={setFunds} onAdd={addTrade} feed={feed} feedLabel={feedLabel} />
        )}
      </main>

      <footer>
        <div className="wrap">
          Rejven Capital publishes its own positions and trades for transparency and educational purposes only.
          Nothing here is financial advice, a recommendation, or an offer to buy or sell any security.
          Markets are volatile and you can lose money. Live figures, when connected, are delayed and provided as-is; otherwise figures are simulated.
          Verify any regulatory requirements with qualified counsel before charging for access.
        </div>
      </footer>
      </>
      )}
    </div>
  );
}

/* ---------- Overview ---------- */
function Overview({ funds, histories, flash, feedLabel, onOpen }) {
  const total = funds.reduce((s, f) => s + mv(f), 0);
  const totalPrev = funds.reduce((s, f) => s + prevMv(f), 0);
  const dayPct = ((total - totalPrev) / totalPrev) * 100;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="eyebrow">The books</div>
          <h2 className="sec-title serif">Three funds you can follow</h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="live"><span className="pulse" /> {feedLabel}</div>
          <div className="num" style={{ fontSize: 22, marginTop: 4 }}>{usd(total)}</div>
          <div className={`num ${dayPct >= 0 ? "gain" : "loss"}`} style={{ fontSize: 13 }}>{pct(dayPct)} today</div>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 20 }}>
        {funds.map((f) => {
          const val = mv(f), dp = ((val - prevMv(f)) / prevMv(f)) * 100;
          const ret = ((val - f.inception) / f.inception) * 100;
          return (
            <div className="card" key={f.id} tabIndex={0} role="button"
                 onClick={() => onOpen(f.id)}
                 onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(f.id)}>
              <div className="eyebrow">{f.holdings.length} holdings</div>
              <div className="fname serif">{f.name}</div>
              <div className="strat">{f.strategy}</div>
              <div style={{ height: 44, margin: "12px -4px 0" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={histories[f.id] || [{ t: 0, v: mv(f) }, { t: 1, v: mv(f) }]}>
                    <Line type="monotone" dataKey="v" stroke="#0E3A46" strokeWidth={1.6} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bigval num">{usd(val)}</div>
              <div className="row-stats num">
                <div className="kv"><div className="k">Today</div><div className={`v ${dp >= 0 ? "gain" : "loss"}`}>{pct(dp)}</div></div>
                <div className="kv"><div className="k">Since start</div><div className={`v ${ret >= 0 ? "gain" : "loss"}`}>{pct(ret)}</div></div>
              </div>
              <div className="open-link">Open book <ArrowUpRight size={15} /></div>
            </div>
          );
        })}
      </div>

      {/* paywall designed-in, switched off */}
      <div className="panel" style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22 }}>
        <Lock size={18} color="#8C8676" />
        <div style={{ fontSize: 13.5, color: "#5d584c" }}>
          <b>Free while in preview.</b> When you’re ready, individual funds can sit behind a subscription — the access layer is built in, just turned off.
        </div>
      </div>
    </>
  );
}

/* ---------- Detail ---------- */
function Detail({ fund, history, flash, feedLabel, onBack }) {
  const val = mv(fund), dp = ((val - prevMv(fund)) / prevMv(fund)) * 100;
  const ret = ((val - fund.inception) / fund.inception) * 100;
  const base = (history && history.length) ? history : [{ t: 0, v: Math.round(val) }, { t: 1, v: Math.round(val) }];
  const liveHist = [...base.slice(0, -1), { t: 40, v: Math.round(val) }];
  return (
    <>
      <button className="back" onClick={onBack}><ArrowLeft size={16} /> All funds</button>
      <div className="detail-head">
        <div>
          <div className="eyebrow">{fund.holdings.length} holdings · {usd(fund.cash)} cash</div>
          <h2 className="sec-title serif">{fund.name}</h2>
          <div style={{ color: "#8C8676", fontSize: 14, maxWidth: 520, marginTop: 4 }}>{fund.strategy}</div>
        </div>
        <div className="live"><span className="pulse" /> {feedLabel}</div>
      </div>

      <div className="statband num">
        <div><div className="k">Market value</div><div className="v">{usd(val)}</div></div>
        <div><div className="k">Today</div><div className={`v ${dp >= 0 ? "gain" : "loss"}`}>{pct(dp)}</div></div>
        <div><div className="k">Since inception</div><div className={`v ${ret >= 0 ? "gain" : "loss"}`}>{pct(ret)}</div></div>
      </div>

      <div className="panel">
        <h3>Performance</h3>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveHist} margin={{ left: 6, right: 6, top: 6 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0E3A46" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#0E3A46" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide />
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Tooltip
                formatter={(v) => [usd(v), "Value"]}
                labelFormatter={() => ""}
                contentStyle={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, borderRadius: 8, border: "1px solid #E5E1D6" }}
              />
              <Area type="monotone" dataKey="v" stroke="#0E3A46" strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <h3>Holdings</h3>
        <div className="tablescroll">
          <table className="num">
            <thead>
              <tr>
                <th>Ticker</th><th>Shares</th><th>Avg cost</th><th>Last</th>
                <th>Value</th><th>Unrealised</th><th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {fund.holdings.map((h) => {
                const shares = +h.shares || 0, avg = +h.avg || 0;
                const value = shares * h.price;
                const pl = (h.price - avg) * shares;
                const plPct = avg ? ((h.price - avg) / avg) * 100 : 0;
                const denom = val - (+fund.cash || 0);
                const w = denom ? (value / denom) * 100 : 0;
                const fk = flash[`${fund.id}:${h.tk}`];
                return (
                  <tr key={h.tk}>
                    <td style={{ fontFamily: "Inter" }}>
                      <div style={{ fontWeight: 600 }} className="num">{h.tk}</div>
                      <div className="tname">{h.name}</div>
                    </td>
                    <td>{shares.toLocaleString()}</td>
                    <td>{usd2(avg)}</td>
                    <td className={fk === "up" ? "flash-up" : fk === "down" ? "flash-down" : ""} style={{ borderRadius: 6 }}>{usd2(h.price)}</td>
                    <td>{usd(value)}</td>
                    <td className={pl >= 0 ? "gain" : "loss"}>{(pl >= 0 ? "+" : "") + usd(pl)} · {pct(plPct)}</td>
                    <td><div className="wbar"><i style={{ width: Math.min(100, w) + "%" }} /></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h3>Trade ledger</h3>
        {fund.trades.map((t, i) => (
          <div className="ledger-row" key={i}>
            <span className={`pill ${t.side.toLowerCase()}`}>{t.side}</span>
            <span className="num" style={{ fontWeight: 600, minWidth: 56 }}>{t.tk}</span>
            <span className="num" style={{ color: "#8C8676" }}>{t.shares.toLocaleString()} @ {usd2(t.price)}</span>
            <span className="num" style={{ marginLeft: "auto", color: "#8C8676" }}>{t.date}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Manage (manual entry) ---------- */
function Manage({ funds, setFunds, onAdd, feed, feedLabel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [fid, setFid] = useState(funds[0]?.id || "");
  const [side, setSide] = useState("Buy");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(today);
  const [done, setDone] = useState(false);

  // stock search (same flow as "Add a stock")
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [picked, setPicked] = useState(null);   // { tk, name }
  const [loadingPrice, setLoadingPrice] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (picked || q.length < 1) { setResults([]); setSearchErr(""); setSearching(false); return; }
    let alive = true;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (!alive) return;
        if (data.error) { setSearchErr(data.error); setResults([]); }
        else { setSearchErr(""); setResults(data.result || []); }
      } catch {
        if (alive) { setSearchErr("Could not reach search."); setResults([]); }
      } finally {
        if (alive) setSearching(false);
      }
    }, 300);
    return () => { alive = false; clearTimeout(t); };
  }, [query, picked]);

  async function pick(sym, desc) {
    const name = desc || sym;
    setResults([]);
    setQuery(`${name} (${sym})`);
    setPicked({ tk: sym, name });
    setLoadingPrice(true);
    try {
      const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(sym)}`);
      const map = await res.json();
      const q = map[sym];
      if (q && q.c) setPrice(String(+(+q.c).toFixed(2)));
    } catch {
      /* leave price empty; user can type it */
    } finally {
      setLoadingPrice(false);
    }
  }

  function submit() {
    const s = +shares, p = +price;
    if (!picked || !(s > 0) || !(p > 0)) return;
    onAdd(fid, { tk: picked.tk.toUpperCase(), side, shares: s, price: p, date });
    setShares(""); setPrice(""); setQuery(""); setPicked(null); setResults([]);
    setDone(true); setTimeout(() => setDone(false), 2200);
  }

  function addFund() {
    setFunds((prev) => [...prev, {
      id: "f" + Date.now(), name: "New fund", strategy: "Describe the strategy.",
      inception: 100000, cash: 0, holdings: [], trades: [],
    }]);
  }

  return (
    <>
      <div className="eyebrow"><Shield size={12} style={{ verticalAlign: "-2px" }} /> Admin console</div>
      <h2 className="sec-title serif">Manage the books</h2>
      <div style={{ color: "#8C8676", fontSize: 14, marginTop: 4, maxWidth: 600 }}>
        Rename funds, edit holdings and cash, add or remove portfolios, log trades, and connect the live feed. Followers only ever see the read-only view.
      </div>

      {/* edit portfolios */}
      <div className="panel" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Portfolios</h3>
          <button className="btn" onClick={addFund}><Plus size={16} /> Add fund</button>
        </div>
        {funds.map((f) => <FundEditor key={f.id} fund={f} setFunds={setFunds} />)}
        {funds.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13.5 }}>No funds yet — add one to get started.</div>}
        <div className="hint">
          A stock’s ticker is its live-feed symbol. With the feed connected, a newly added stock shows your entered cost until the next pull (~15s), then tracks the real quote automatically. Use the symbol Finnhub expects (e.g. <span className="num">AAPL</span>, <span className="num">NVO</span>, <span className="num">ASML</span>).
        </div>
      </div>

      {/* log a trade */}
      <div className="panel">
        <h3>Log a trade</h3>

        <label className="fld" style={{ marginBottom: 0 }}>Stock</label>
        <div className="search-wrap">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (picked) setPicked(null); }}
            placeholder="Search any exchange — e.g. Volvo, Apple, AAPL"
            aria-label="Search for a stock"
          />
          {results.length > 0 && (
            <div className="results">
              {results.map((r) => (
                <button type="button" className="result" key={r.symbol} onClick={() => pick(r.symbol, r.description)}>
                  <span className="num" style={{ fontWeight: 600, minWidth: 70 }}>{r.displaySymbol || r.symbol}</span>
                  <span className="desc">{r.description}</span>
                  <span className="ex">{r.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {searching && <div className="note" style={{ marginTop: 6 }}>Searching…</div>}
        {searchErr && <div className="note" style={{ marginTop: 6, color: "var(--loss)" }}>{searchErr}</div>}
        {picked && (
          <div className="note" style={{ marginTop: 6, color: "#5d584c" }}>
            Selected <b className="num" style={{ marginLeft: 4 }}>{picked.tk}</b>
            {loadingPrice ? " — fetching price…" : (price ? <> · price now <b className="num">{usd2(+price)}</b> (you can edit it below)</> : "")}
          </div>
        )}

        <div className="form-grid" style={{ marginTop: 12 }}>
          <label className="fld">Fund
            <select value={fid} onChange={(e) => setFid(e.target.value)}>
              {funds.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </label>
          <label className="fld">Side
            <select value={side} onChange={(e) => setSide(e.target.value)}>
              <option>Buy</option><option>Sell</option>
            </select>
          </label>
          <label className="fld">Shares
            <input value={shares} onChange={(e) => setShares(e.target.value)} placeholder="100" inputMode="decimal" />
          </label>
          <label className="fld">Price
            <input className="num" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="—" inputMode="decimal" />
          </label>
          <label className="fld">Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
          <button className="btn" onClick={submit}
                  disabled={!picked || !(+shares > 0) || !(+price > 0)}
                  style={{ opacity: (!picked || !(+shares > 0) || !(+price > 0)) ? 0.5 : 1 }}>
            <Plus size={16} /> Add to ledger
          </button>
          {done && <span className="num gain" style={{ fontSize: 13 }}>Logged ✓</span>}
        </div>
        <div className="note">
          <Activity size={14} /> Pick a stock to auto-fill today’s price; edit it for past trades. In production this writes to your database.
        </div>
      </div>

      {/* live feed */}
      <div className="panel">
        <h3>Live price feed</h3>
        <div style={{ fontSize: 13.5, color: "#5d584c", marginBottom: 6 }}>
          Status: <span className="num" style={{ fontWeight: 600, color: feed === "live" ? "#1E7A4E" : feed === "error" ? "#B23A2E" : "#8C8676" }}>{feedLabel}</span>.
          {" "}Quotes are fetched through this site’s own <span className="num">/api/quotes</span> route every 15 seconds, so your Finnhub key stays on the server.
        </div>
        <div className="hint">
          To turn the live feed on: get a free key at <span className="num">finnhub.io</span>, then set{" "}
          <span className="num">FINNHUB_KEY</span> in <span className="num">.env.local</span> (local) or your host’s environment
          variables (Vercel → Project → Settings → Environment Variables) and redeploy. Until a key is set, prices are simulated.
        </div>
      </div>
    </>
  );
}

/* ---------- per-fund editor (admin) ---------- */
function FundEditor({ fund, setFunds }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [picked, setPicked] = useState(null);     // { tk, name, price, prev }
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [nsh, setNsh] = useState("");

  const patch = (p) => setFunds((prev) => prev.map((f) => (f.id === fund.id ? { ...f, ...p } : f)));
  const patchH = (tk, p) => setFunds((prev) => prev.map((f) => (f.id !== fund.id ? f : { ...f, holdings: f.holdings.map((h) => (h.tk === tk ? { ...h, ...p } : h)) })));
  const removeH = (tk) => setFunds((prev) => prev.map((f) => (f.id !== fund.id ? f : { ...f, holdings: f.holdings.filter((h) => h.tk !== tk) })));
  const removeFund = () => setFunds((prev) => prev.filter((f) => f.id !== fund.id));

  // Debounced symbol search against our /api/search route.
  useEffect(() => {
    const q = query.trim();
    if (picked || q.length < 1) { setResults([]); setSearchErr(""); setSearching(false); return; }
    let alive = true;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (!alive) return;
        if (data.error) { setSearchErr(data.error); setResults([]); }
        else { setSearchErr(""); setResults(data.result || []); }
      } catch {
        if (alive) { setSearchErr("Could not reach search."); setResults([]); }
      } finally {
        if (alive) setSearching(false);
      }
    }, 300);
    return () => { alive = false; clearTimeout(t); };
  }, [query, picked]);

  // When a result is chosen, fetch the current quote and use it as the cost basis.
  async function pick(sym, desc) {
    const name = desc || sym;
    setResults([]);
    setQuery(`${name} (${sym})`);
    setPicked({ tk: sym, name, price: null, prev: null });
    setLoadingPrice(true);
    try {
      const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(sym)}`);
      const map = await res.json();
      const q = map[sym];
      const price = q && q.c ? +(+q.c).toFixed(2) : null;
      const prev = q && q.pc ? +(+q.pc).toFixed(2) : price;
      setPicked({ tk: sym, name, price, prev });
    } catch {
      setPicked({ tk: sym, name, price: null, prev: null });
    } finally {
      setLoadingPrice(false);
    }
  }

  function resetPick() { setPicked(null); setQuery(""); setNsh(""); setResults([]); setSearchErr(""); }

  function addPicked() {
    const s = +nsh;
    if (!picked || picked.price == null || !(s > 0)) return;
    const t = picked.tk.toUpperCase();
    setFunds((prev) => prev.map((f) => {
      if (f.id !== fund.id) return f;
      if (f.holdings.some((h) => h.tk === t)) return f; // already held — skip duplicate
      return { ...f, holdings: [...f.holdings, { tk: t, name: picked.name, shares: s, avg: picked.price, price: picked.price, prev: picked.prev ?? picked.price }] };
    }));
    resetPick();
  }

  return (
    <div className="efund">
      <div className="ehead">
        <label className="fld" style={{ flex: 1 }}>Fund name
          <input value={fund.name} onChange={(e) => patch({ name: e.target.value })} />
        </label>
        <label className="fld" style={{ width: 120, flex: "none" }}>Cash
          <input className="num" value={fund.cash} onChange={(e) => patch({ cash: e.target.value })} inputMode="decimal" />
        </label>
        <button className="iconbtn" title="Delete this fund" aria-label="Delete fund" onClick={removeFund} style={{ marginTop: 22 }}><Trash2 size={15} /></button>
      </div>

      <label className="fld" style={{ marginTop: 10 }}>Strategy
        <textarea value={fund.strategy} onChange={(e) => patch({ strategy: e.target.value })} />
      </label>

      <div className="hrow" style={{ color: "var(--muted)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 14 }}>
        <span style={{ width: 64 }}>Ticker</span><span style={{ flex: 1 }}>Shares</span><span style={{ flex: 1 }}>Avg cost</span><span style={{ width: 32 }} />
      </div>
      {fund.holdings.map((h) => (
        <div className="hrow" key={h.tk}>
          <span className="num" style={{ width: 64, fontWeight: 600 }}>{h.tk}</span>
          <input className="num" style={{ flex: 1 }} value={h.shares} onChange={(e) => patchH(h.tk, { shares: e.target.value })} inputMode="decimal" aria-label={`${h.tk} shares`} />
          <input className="num" style={{ flex: 1 }} value={h.avg} onChange={(e) => patchH(h.tk, { avg: e.target.value })} inputMode="decimal" aria-label={`${h.tk} average cost`} />
          <button className="iconbtn" title="Remove holding" aria-label={`Remove ${h.tk}`} onClick={() => removeH(h.tk)}><Trash2 size={14} /></button>
        </div>
      ))}

      {/* search + add a stock; cost basis = live price at the moment of adding */}
      <div style={{ marginTop: 14, fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--muted)", fontWeight: 600 }}>Add a stock</div>
      <div className="search-wrap">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (picked) setPicked(null); }}
          placeholder="Search any exchange — e.g. Volvo, Apple, Novo Nordisk, AAPL"
          aria-label="Search for a stock"
        />
        {results.length > 0 && (
          <div className="results">
            {results.map((r) => (
              <button type="button" className="result" key={r.symbol} onClick={() => pick(r.symbol, r.description)}>
                <span className="num" style={{ fontWeight: 600, minWidth: 70 }}>{r.displaySymbol || r.symbol}</span>
                <span className="desc">{r.description}</span>
                <span className="ex">{r.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {searching && <div className="note" style={{ marginTop: 6 }}>Searching…</div>}
      {searchErr && <div className="note" style={{ marginTop: 6, color: "var(--loss)" }}>{searchErr}</div>}

      {picked && (
        <div className="hrow" style={{ marginTop: 10, alignItems: "center" }}>
          <span className="num" style={{ fontWeight: 600, width: 80 }}>{picked.tk}</span>
          <span style={{ flex: 1, fontSize: 12.5, color: "#5d584c" }}>
            {loadingPrice
              ? "Fetching price…"
              : picked.price != null
                ? <>Price now <b className="num">{usd2(picked.price)}</b> → becomes your cost basis</>
                : <span style={{ color: "var(--loss)" }}>No live price for this symbol</span>}
          </span>
          <input className="num" style={{ width: 84 }} value={nsh} onChange={(e) => setNsh(e.target.value)} placeholder="shares" inputMode="decimal" aria-label="Number of shares" />
          <button className="iconbtn" title="Add to fund" aria-label="Add to fund" onClick={addPicked}
                  disabled={picked.price == null || !(+nsh > 0)}
                  style={{ borderColor: "var(--brand)", color: "var(--brand)", opacity: (picked.price == null || !(+nsh > 0)) ? 0.4 : 1 }}>
            <Plus size={14} />
          </button>
          <button className="iconbtn" title="Cancel" aria-label="Cancel" onClick={resetPick}><Trash2 size={14} /></button>
        </div>
      )}
    </div>
  );
}

/* ---------- Auth gate (email + password) ---------- */
function Auth({ onAuth }) {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("Enter a valid email address.");
    if (pw.length < 8) return setErr("Use a password of at least 8 characters.");
    if (mode === "signup" && pw !== pw2) return setErr("Those passwords don’t match.");
    const isAdmin = mode === "login" && email.toLowerCase() === ADMIN_EMAIL && pw === ADMIN_PW;
    setErr(""); onAuth({ email, role: isAdmin ? "admin" : "member" });
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="lock">
          <span className="dot"><BookOpen size={20} /></span>
          <div>
            <h2 className="serif">Rejven Capital</h2>
            <div className="tagline">Follow the books in the open.</div>
          </div>
        </div>

        <div className="tabs" role="group" aria-label="Account">
          <button aria-pressed={mode === "signup"} onClick={() => { setMode("signup"); setErr(""); }}>Create account</button>
          <button aria-pressed={mode === "login"} onClick={() => { setMode("login"); setErr(""); }}>Log in</button>
        </div>

        <div className="stack">
          <label className="fld">Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </label>
          <label className="fld">Password
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && mode === "login" && submit()} placeholder="At least 8 characters" />
          </label>
          {mode === "signup" && (
            <label className="fld">Confirm password
              <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Re-enter password" />
            </label>
          )}
          {err && <div className="err">{err}</div>}
          <button className="btn" onClick={submit}>{mode === "signup" ? "Create account" : "Log in"}</button>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button className="ghost" onClick={() => onAuth({ email: "member@rejven.capital", role: "member" })}>Preview as member</button>
            <button className="ghost" onClick={() => onAuth({ email: ADMIN_EMAIL, role: "admin" })}>Preview as admin</button>
          </div>
        </div>

        <div className="hint">
          <b>Demo admin login</b> — switch to <i>Log in</i> and use<br />
          <span className="num">{ADMIN_EMAIL}</span> / <span className="num">{ADMIN_PW}</span><br />
          Any other valid sign-up or login is a read-only member.
        </div>

        <div className="fineprint">
          Preview only — no account is created, no email is sent, and nothing you type is stored or transmitted.
          In production, accounts and roles live in your auth provider and passwords are hashed server-side, never in the browser.
        </div>
      </div>
    </div>
  );
}
