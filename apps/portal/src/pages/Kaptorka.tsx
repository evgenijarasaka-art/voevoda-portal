import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useKaptorkaStore, SELLERS, CURRENT_USER, type KaptorkaAd } from '../store/useKaptorkaStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { readAndCompressImage } from '../utils/imageUpload';
import './feature-pages.css';

const CATEGORIES = ['Все', 'Снаряжение', 'Форма', 'Оптика', 'Рюкзаки', 'Учебное', 'Обмен'];

const seller = (name: string) => SELLERS[name] ?? { name, avatar: '', chatId: 0, index: 1000, rating: 4.5, reviews: 0, ads: 0, joined: '—', verified: false };

/* ── SVG Icons ── */
const IcHeart = ({ filled, dark }: { filled?: boolean; dark?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#ff3b30' : 'none'} stroke={filled ? '#ff3b30' : dark ? '#9ca3af' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IcSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IcEye = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcMsg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);
const IcLocation = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IcCamera = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);
const IcTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);
const IcEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcPause = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);
const IcPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IcRocket = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);
const IcPackage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
/* ── Wizard step icons (наследуют цвет через currentColor) ── */
const IcStepPhoto = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);
const IcStepDetails = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
);
const IcStepContacts = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const IcCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IcArrowR = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const IcShieldMini = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

function SellerAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const s = seller(name);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a2744' }}>
      {s.avatar && !err
        ? <img src={s.avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setErr(true)} />
        : <span style={{ fontSize: size * 0.38, fontWeight: 700, color: '#f5a623', fontFamily: '"Russo One",sans-serif' }}>{name[0]}</span>}
    </div>
  );
}

const CSS = `
.kp-page { min-height:calc(100vh - 60px); margin-left:56px; padding-top:60px; background:linear-gradient(180deg,#f1f5ff 0,#f7f8fb 520px,#f5f6f8 100%); font-family:"Exo 2",sans-serif; color:#17213a; }

.kp-hero { position:relative; overflow:hidden; padding:34px 24px 30px; background:linear-gradient(125deg,#132e91 0%,#3159ee 55%,#6f91ff 100%); color:#fff; }
.kp-hero::before { content:''; position:absolute; width:560px; height:560px; right:-120px; top:-320px; border:1px solid rgba(255,255,255,.22); border-radius:50%; box-shadow:0 0 0 60px rgba(255,255,255,.045),0 0 0 120px rgba(255,255,255,.03); }
.kp-hero::after { content:''; position:absolute; inset:0; opacity:.14; background-image:linear-gradient(rgba(255,255,255,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.22) 1px,transparent 1px); background-size:48px 48px; mask-image:linear-gradient(90deg,#000,transparent 75%); }
.kp-hero-inner { position:relative; z-index:1; max-width:1280px; margin:0 auto; display:grid; grid-template-columns:minmax(0,1.35fr) minmax(330px,.65fr); gap:42px; align-items:center; }
.kp-hero-kicker { position:relative; display:inline-flex; align-items:center; gap:8px; margin-bottom:13px; padding:7px 13px; border:1px solid rgba(255,255,255,.28); border-radius:999px; background:rgba(255,255,255,.11); font-size:11px; font-weight:800; letter-spacing:.09em; text-transform:uppercase; backdrop-filter:blur(10px); animation:kpKickerBreathe 3s ease-in-out infinite; }
.kp-hero-kicker::before { content:''; width:8px; height:8px; border-radius:50%; background:#fff; animation:kpKickerDot 1.9s cubic-bezier(.4,0,.2,1) infinite; }
@keyframes kpKickerBreathe {
  0%,100% { border-color:rgba(255,255,255,.28); box-shadow:0 0 0 0 rgba(255,255,255,0); }
  50%     { border-color:rgba(255,255,255,.6); box-shadow:0 0 26px 1px rgba(150,185,255,.45), inset 0 0 14px rgba(255,255,255,.12); }
}
@keyframes kpKickerDot {
  0%   { box-shadow:0 0 0 0 rgba(255,255,255,.7), 0 0 8px 2px rgba(255,255,255,.6); opacity:1; }
  70%  { box-shadow:0 0 0 11px rgba(255,255,255,0), 0 0 8px 2px rgba(255,255,255,.2); opacity:.55; }
  100% { box-shadow:0 0 0 0 rgba(255,255,255,0), 0 0 8px 2px rgba(255,255,255,.6); opacity:1; }
}
.kp-hero h1 { max-width:720px; margin:0; font:400 clamp(34px,4vw,58px)/1.02 "Russo One",sans-serif; letter-spacing:-.025em; }
.kp-hero-copy { max-width:680px; margin:15px 0 21px; color:rgba(255,255,255,.79); font-size:16px; line-height:1.55; }
.kp-hero-search { display:flex; max-width:760px; padding:7px; border:1px solid rgba(255,255,255,.42); border-radius:17px; background:#fff; box-shadow:0 18px 42px rgba(12,29,91,.24); }
.kp-hero-search .kp-search-wrap { max-width:none; }
.kp-hero-search .kp-search { height:48px; border:0; border-radius:12px; background:#fff; }
.kp-hero-search .kp-search:focus { box-shadow:none; }
.kp-hero-search button { min-width:138px; height:48px; border:0; border-radius:12px; background:#173cae; color:#fff; font:800 14px "Exo 2",sans-serif; cursor:pointer; transition:transform .22s ease,background .22s ease; }
.kp-hero-search button:hover { transform:translateY(-1px); background:#0e2d91; }
.kp-hero-actions { display:flex; align-items:center; gap:10px; margin-top:16px; flex-wrap:wrap; }
.kp-hero-create,.kp-hero-secondary { min-height:47px; padding:0 19px; border-radius:13px; font:800 13px "Exo 2",sans-serif; cursor:pointer; transition:transform .22s ease,box-shadow .22s ease,background .22s ease; }
.kp-hero-create { border:2px solid #fff; background:#fff; color:#2349d0; box-shadow:0 12px 28px rgba(9,27,86,.22); }
.kp-hero-secondary { border:1px solid rgba(255,255,255,.38); background:rgba(255,255,255,.1); color:#fff; backdrop-filter:blur(10px); }
.kp-hero-create:hover,.kp-hero-secondary:hover { transform:translateY(-3px); }
.kp-hero-secondary:hover { background:rgba(255,255,255,.18); }
.kp-hero-stats { display:flex; gap:25px; margin-top:23px; }
.kp-hero-stat b { display:block; font:400 18px "Russo One",sans-serif; }
.kp-hero-stat span { color:rgba(255,255,255,.65); font-size:11px; }
.kp-hero-showcase { position:relative; height:275px; }
.kp-showcase-card { position:absolute; width:205px; overflow:hidden; border:5px solid rgba(255,255,255,.92); border-radius:22px; background:#fff; box-shadow:0 24px 55px rgba(8,24,77,.33); transition:transform .35s cubic-bezier(.2,.8,.2,1); }
.kp-showcase-card img { width:100%; height:135px; object-fit:cover; display:block; }
.kp-showcase-card span { display:block; padding:11px 13px 5px; color:#17213a; font-size:12px; font-weight:800; }
.kp-showcase-card b { display:block; padding:0 13px 12px; color:#3158ee; font:400 16px "Russo One",sans-serif; }
.kp-showcase-card.one { top:3px; left:0; transform:rotate(-6deg); }
.kp-showcase-card.two { right:2px; bottom:0; transform:rotate(5deg); }
.kp-hero-showcase:hover .one { transform:rotate(-8deg) translate(-5px,-5px); }
.kp-hero-showcase:hover .two { transform:rotate(7deg) translate(5px,-5px); }

/* ── Header ── */
.kp-header { background:rgba(255,255,255,.94); border-bottom:1px solid #dfe5f2; padding:12px 0; position:sticky; top:60px; z-index:90; backdrop-filter:blur(16px); box-shadow:0 8px 25px rgba(27,46,95,.06); }
.kp-header-inner { max-width:1280px; margin:0 auto; padding:0 24px; display:flex; align-items:center; gap:14px; min-height:44px; }
.kp-header-inner > * { box-sizing:border-box; }
.kp-logo { flex:0 0 auto; height:44px; border:none; background:none; cursor:default; color:#1a2744; font-family:"Russo One",sans-serif; font-size:20px; line-height:1; white-space:nowrap; display:inline-flex; align-items:center; gap:8px; padding:0; }
.kp-logo svg { color:#375dfb; display:block; flex:0 0 auto; }
.kp-search-wrap { flex:1 1 auto; position:relative; max-width:560px; height:44px; display:flex; align-items:center; }
/* В шапке поиск растягивается на всё свободное место, чтобы кнопки прижались
   к правому краю и блок был симметричным (логотип слева — кнопка справа). */
.kp-header .kp-search-wrap { max-width:none; }
.kp-search-wrap svg { position:absolute; left:14px; top:50%; transform:translateY(-50%); pointer-events:none; }
.kp-search { width:100%; height:44px; padding:0 14px 0 42px; border:1.5px solid #e5e7eb; border-radius:10px; background:#fff; font:14px "Exo 2",sans-serif; color:#1a1a2e; outline:none; transition:border-color .15s,box-shadow .15s; }
.kp-search:focus { border-color:#375dfb; box-shadow:0 0 0 3px rgba(55,93,251,.12); }
.kp-sort { flex:0 0 auto; height:44px; padding:0 14px; border:1.5px solid #e5e7eb; border-radius:10px; background:#fff; font:500 13px "Exo 2",sans-serif; color:#374151; cursor:pointer; outline:none; min-width:180px; transition:border-color .15s; }
.kp-sort:focus { border-color:#375dfb; }
.kp-btn-create { flex:0 0 auto; height:44px; padding:0 22px; border:1.5px solid #3158ee; border-radius:10px; background:linear-gradient(135deg,#2449d4,#5275ff); color:#fff; font:800 14px "Exo 2",sans-serif; cursor:pointer; white-space:nowrap; transition:transform .2s,box-shadow .2s; box-shadow:0 5px 16px rgba(55,93,251,.28); }
.kp-btn-create:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(55,93,251,.4); }

/* ── Tabs ── */
.kp-tabs { max-width:1280px; margin:0 auto; padding:18px 24px 0; display:flex; gap:8px; }
.kp-tab { padding:11px 18px; border:1px solid transparent; border-radius:12px 12px 0 0; background:none; cursor:pointer; font:700 14px "Exo 2",sans-serif; color:#7b8498; border-bottom:3px solid transparent; transition:all .2s; position:relative; }
.kp-tab:hover { color:#374151; }
.kp-tab.active { color:#375dfb; border-bottom-color:#375dfb; }
.kp-tab .kp-tab-count { display:inline-flex; align-items:center; justify-content:center; min-width:20px; height:20px; padding:0 6px; border-radius:10px; background:#eef2ff; color:#375dfb; font-size:11px; font-weight:700; margin-left:6px; }
.kp-tab.active .kp-tab-count { background:#375dfb; color:#fff; }
.kp-tab-line { max-width:1280px; margin:0 auto; height:1px; background:#e5e7eb; }

/* ── Content area ── */
.kp-content { max-width:1280px; margin:0 auto; padding:22px 24px 64px; }
.kp-cats { display:grid; grid-template-columns:repeat(7,minmax(125px,1fr)); gap:10px; margin-bottom:13px; overflow:visible; padding:6px 4px 16px; }
.kp-cat { position:relative; flex:0 0 auto; min-height:68px; padding:12px 14px; border:1px solid #e1e6f0; border-radius:16px; background:#fff; color:#35405a; cursor:pointer; font:700 13px "Exo 2",sans-serif; text-align:left; will-change:transform; transition:transform .3s cubic-bezier(.2,.8,.2,1),border-color .25s ease,color .25s ease,background .25s ease,box-shadow .3s ease; }
.kp-cat::after { content:'→'; position:absolute; right:12px; bottom:10px; color:#b1bad0; font-size:15px; transition:transform .25s cubic-bezier(.2,.8,.2,1),color .25s ease; }
.kp-cat:hover { border-color:#c7d2fe; color:#375dfb; background:#f0f4ff; transform:translateY(-4px); box-shadow:0 14px 30px rgba(37,63,135,.14); }
.kp-cat:hover::after { transform:translateX(4px); color:#375dfb; }
.kp-cat.active { border-color:transparent; background:linear-gradient(135deg,#2449d4,#5f80ff); color:#fff; font-weight:800; box-shadow:0 9px 24px rgba(55,93,251,.25); }
.kp-cat.active::after { color:#fff; }
.kp-count { color:#9ca3af; font-size:13px; margin-bottom:16px; }
.kp-service-strip { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:22px; }
.kp-service-item { display:flex; align-items:center; gap:14px; padding:14px 16px; border:1px solid #e3e8f4; border-radius:14px; background:#fff; box-shadow:0 2px 8px rgba(26,39,68,.04); transition:border-color .18s,box-shadow .18s,transform .18s; }
.kp-service-item:hover { border-color:#c7d4f5; box-shadow:0 6px 20px rgba(55,93,251,.1); transform:translateY(-2px); }
.kp-service-icon { width:40px; height:40px; flex-shrink:0; border-radius:12px; display:grid; place-items:center; background:linear-gradient(135deg,#eef2ff,#dde6ff); color:#375dfb; }
.kp-service-item b { display:block; color:#17213a; font-size:13px; font-weight:700; }
.kp-service-item span { display:block; color:#8992a6; font-size:11.5px; margin-top:2px; }

/* ── Cards grid ── */
.kp-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
@media(max-width:1100px){ .kp-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media(max-width:860px){ .kp-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:560px){
  .kp-page { margin-left:0; }
  .kp-header-inner { flex-wrap:wrap; padding:0 14px; }
  .kp-grid { grid-template-columns:1fr; }
  .kp-detail-body { grid-template-columns:1fr !important; }
  .kp-detail { width:100% !important; max-height:100vh !important; border-radius:0 !important; }
  .kp-my-row { flex-direction:column !important; }
  .kp-my-actions { flex-wrap:wrap; }
  .kp-my-stats { grid-template-columns:1fr 1fr !important; }
}

.kp-card { position:relative; background:#fff; border-radius:18px; overflow:hidden; cursor:pointer; border:1px solid #e3e7ef; transition:box-shadow .28s,transform .28s,border-color .28s; display:flex; flex-direction:column; }
.kp-card:hover { border-color:#cbd6f7; box-shadow:0 18px 42px rgba(26,39,68,.14); transform:translateY(-6px); }
.kp-card-img { position:relative; width:100%; aspect-ratio:4/3; background:#eef0f4; overflow:hidden; }
.kp-card-img img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .35s; }
.kp-card:hover .kp-card-img img { transform:scale(1.05); }
.kp-card-fav { position:absolute; top:10px; right:10px; width:36px; height:36px; border-radius:50%; background:rgba(0,0,0,.4); backdrop-filter:blur(4px); border:none; cursor:pointer; display:grid; place-items:center; transition:background .15s,transform .15s; z-index:2; }
.kp-card-fav:hover { background:rgba(0,0,0,.6); transform:scale(1.1); }
.kp-card-promo { position:absolute; top:10px; left:10px; padding:4px 10px; border-radius:6px; background:linear-gradient(135deg,#f5a623,#e8940e); color:#fff; font:700 11px "Exo 2",sans-serif; z-index:2; box-shadow:0 2px 8px rgba(245,166,35,.4); letter-spacing:.3px; }
.kp-card-body { padding:14px 14px 0; flex:1; display:flex; flex-direction:column; }
.kp-card-price { color:#1a2744; font-family:"Russo One",sans-serif; font-size:20px; margin-bottom:6px; }
.kp-card-price.exchange { color:#375dfb; font-size:16px; }
.kp-card-title { color:#1a2744; font-size:14px; font-weight:500; line-height:1.4; margin-bottom:auto; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; padding-bottom:10px; }
.kp-card-seller { display:flex; align-items:center; gap:8px; padding:10px 14px; border-top:1px solid #f0f1f3; }
.kp-card-seller-name { font-size:12px; color:#6b7280; font-weight:500; }
.kp-card-footer { display:flex; align-items:center; gap:6px; padding:0 14px 12px; }
.kp-card-loc { display:flex; align-items:center; gap:3px; color:#9ca3af; font-size:11px; }
.kp-card-date { color:#b0b5bf; font-size:11px; margin-left:auto; }

/* ── My Ads Panel ── */
.kp-my-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
.kp-my-stat { background:#fff; border-radius:14px; padding:20px; border:1px solid #e8eaee; display:flex; align-items:center; gap:14px; }
.kp-my-stat-icon { width:48px; height:48px; border-radius:14px; display:grid; place-items:center; flex-shrink:0; }
.kp-my-stat-icon.blue { background:#eef2ff; color:#375dfb; }
.kp-my-stat-icon.green { background:#e8f8f2; color:#1d9e75; }
.kp-my-stat-icon.orange { background:#fff8ed; color:#f5a623; }
.kp-my-stat-icon.purple { background:#f3e8ff; color:#8b5cf6; }
.kp-my-stat-num { font-family:"Russo One",sans-serif; font-size:26px; color:#1a2744; }
.kp-my-stat-label { color:#9ca3af; font-size:12px; font-weight:600; margin-top:2px; }

.kp-my-list { display:flex; flex-direction:column; gap:12px; }
.kp-my-row { background:#fff; border-radius:14px; border:1px solid #e8eaee; display:flex; align-items:center; gap:16px; padding:14px 18px; transition:box-shadow .15s; }
.kp-my-row:hover { box-shadow:0 6px 20px rgba(26,39,68,.08); }
.kp-my-row.inactive { opacity:.65; }
.kp-my-thumb { width:80px; height:60px; border-radius:10px; overflow:hidden; flex-shrink:0; background:#eef0f4; }
.kp-my-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.kp-my-info { flex:1; min-width:0; }
.kp-my-title { color:#1a2744; font-size:14px; font-weight:600; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.kp-my-meta { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.kp-my-price { font-family:"Russo One",sans-serif; font-size:16px; color:#1a2744; }
.kp-my-price.exchange { color:#375dfb; font-size:14px; }

.kp-status { display:inline-flex; align-items:center; height:24px; padding:0 10px; border-radius:8px; font-size:11px; font-weight:700; letter-spacing:.3px; }
.kp-status.active { background:#e8f8f2; color:#1d9e75; }
.kp-status.paused { background:#fef3c7; color:#b45309; }
.kp-status.promoted { background:#fff8ed; color:#f5a623; }

.kp-my-metrics { display:flex; align-items:center; gap:18px; flex-shrink:0; }
.kp-my-metric { display:flex; flex-direction:column; align-items:center; gap:2px; min-width:50px; }
.kp-my-metric-num { font-weight:800; font-size:16px; color:#1a2744; }
.kp-my-metric-label { font-size:10px; color:#9ca3af; font-weight:600; text-transform:uppercase; }

.kp-my-actions { display:flex; align-items:center; gap:6px; flex-shrink:0; }
.kp-act { width:36px; height:36px; border-radius:10px; border:1.5px solid #e5e7eb; background:#fff; cursor:pointer; display:grid; place-items:center; color:#6b7280; transition:all .15s; }
.kp-act:hover { border-color:#c7d2fe; color:#375dfb; background:#f0f4ff; }
.kp-act.danger:hover { border-color:#fecaca; color:#dc2626; background:#fef2f2; }
.kp-act.promote { color:#f5a623; }
.kp-act.promote:hover { border-color:#fde68a; background:#fff8ed; }
.kp-act.promote.active { background:#fff8ed; border-color:#f5a623; color:#f5a623; }

/* ── Detail modal ── */
.kp-backdrop { position:fixed; inset:0; z-index:500; display:grid; place-items:center; padding:20px; background:rgba(10,18,34,.6); backdrop-filter:blur(6px); }
.kp-detail { width:min(1080px,100%); max-height:90vh; overflow:auto; border-radius:22px; background:#fff; box-shadow:0 40px 100px rgba(0,0,0,.3); }
.kp-detail-top { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #eef0f3; }
.kp-detail-top h2 { margin:0; color:#1a2744; font-size:20px; font-weight:700; line-height:1.3; flex:1; }
.kp-detail-close { width:40px; height:40px; border:1px solid #e5e7eb; border-radius:12px; background:#fff; color:#6b7280; font-size:24px; cursor:pointer; display:grid; place-items:center; transition:background .15s; flex:0 0 auto; }
.kp-detail-close:hover { background:#f3f4f6; }
.kp-detail-body { display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:0; }
.kp-detail-main { padding:24px; border-right:1px solid #eef0f3; }
.kp-detail-gallery { width:100%; aspect-ratio:4/3; border-radius:16px; overflow:hidden; background:#eef0f4; margin-bottom:22px; }
.kp-detail-gallery img { width:100%; height:100%; object-fit:cover; display:block; }

.kp-detail-side { padding:24px; display:flex; flex-direction:column; gap:16px; }
.kp-detail-price-box { background:linear-gradient(135deg,#f8faff,#eef2ff); border:1px solid #d4ddff; border-radius:14px; padding:20px; text-align:center; }
.kp-detail-price-box .price { color:#1a2744; font-family:"Russo One",sans-serif; font-size:32px; line-height:1; }
.kp-detail-price-box .price.exchange { color:#375dfb; font-size:24px; }
.kp-detail-price-box .condition { margin-top:10px; display:inline-flex; gap:6px; }

.kp-phone-btn { width:100%; height:50px; border:2px solid #1d9e75; border-radius:12px; background:#fff; color:#1d9e75; font:700 15px "Exo 2",sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
.kp-phone-btn:hover { background:#e8f8f2; }
.kp-phone-btn.revealed { border-color:#1d9e75; background:#e8f8f2; color:#15803d; font-size:18px; font-family:"Russo One",sans-serif; letter-spacing:.5px; }
.kp-msg-btn { width:100%; height:50px; border:none; border-radius:12px; background:linear-gradient(135deg,#2F52F0,#5B7FFF); color:#fff; font:700 15px "Exo 2",sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; box-shadow:0 6px 18px rgba(55,93,251,.3); }
.kp-msg-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(55,93,251,.4); }
.kp-buy-btn { width:100%; height:46px; border:1.5px solid #e5e7eb; border-radius:12px; background:#fff; color:#374151; font:600 14px "Exo 2",sans-serif; cursor:pointer; transition:all .15s; }
.kp-buy-btn:hover { border-color:#c7d2fe; background:#f0f4ff; color:#375dfb; }

.kp-seller-card { padding:18px; border:1px solid #eef0f3; border-radius:16px; background:#fafbfc; }
.kp-seller-top { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.kp-seller-info { flex:1; }
.kp-seller-name { color:#1a2744; font-weight:700; font-size:16px; margin-bottom:2px; }
.kp-seller-rating { display:flex; align-items:center; gap:4px; color:#6b7280; font-size:12px; }
.kp-seller-verified { display:flex; align-items:center; gap:5px; color:#1d9e75; font-size:12px; font-weight:600; margin-bottom:10px; }
.kp-seller-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.kp-seller-stat { text-align:center; padding:10px 8px; border-radius:10px; background:#fff; border:1px solid #f0f1f3; }
.kp-seller-stat-num { color:#1a2744; font-size:17px; font-weight:800; }
.kp-seller-stat-label { color:#9ca3af; font-size:10px; font-weight:600; text-transform:uppercase; margin-top:2px; }

.kp-fav-btn { width:100%; height:42px; border:1.5px solid #e5e7eb; border-radius:12px; background:#fff; color:#374151; font:500 13px "Exo 2",sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all .15s; }
.kp-fav-btn:hover { border-color:#ff3b30; color:#ff3b30; background:#fff5f5; }
.kp-fav-btn.active { border-color:#ff3b30; color:#ff3b30; background:#fff5f5; }

.kp-props { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px; }
.kp-prop { padding:14px; border-radius:12px; background:#f8f9fc; border:1px solid #f0f1f3; }
.kp-prop-label { color:#9ca3af; font-size:11px; font-weight:700; text-transform:uppercase; margin-bottom:4px; }
.kp-prop-val { color:#1a2744; font-size:14px; font-weight:600; }

.kp-safety { padding:14px; border-radius:12px; background:#f0fdf4; border:1px solid #bbf7d0; font-size:12px; color:#166534; line-height:1.5; }
.kp-safety b { display:block; margin-bottom:3px; font-size:13px; }

.kp-badge { display:inline-flex; align-items:center; height:26px; padding:0 10px; border-radius:8px; font-size:12px; font-weight:700; }
.kp-badge.green { background:#e8f8f2; color:#1d9e75; }
.kp-badge.gold { background:#fff8ed; color:#b86d00; }
.kp-badge.blue { background:#eef2ff; color:#375dfb; }

.kp-empty { text-align:center; padding:80px 24px; }
.kp-empty-icon { width:80px; height:80px; margin:0 auto 18px; border-radius:50%; background:#eef2ff; display:grid; place-items:center; }
.kp-empty h2 { color:#1a2744; font-size:20px; margin:0 0 8px; }
.kp-empty p { color:#9ca3af; font-size:14px; margin:0; }

.kp-toast { position:fixed; right:24px; bottom:24px; z-index:700; padding:14px 20px; border-radius:12px; background:#1a2744; color:#fff; box-shadow:0 14px 36px rgba(26,39,68,.28); font:600 14px "Exo 2",sans-serif; display:flex; align-items:center; gap:8px; animation:kpToastIn .3s ease; }
@keyframes kpToastIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

/* ── Delete confirm ── */
.kp-confirm-backdrop { position:fixed; inset:0; z-index:600; display:grid; place-items:center; background:rgba(10,18,34,.5); backdrop-filter:blur(4px); }
.kp-confirm { background:#fff; border-radius:18px; padding:28px; width:min(420px,90vw); box-shadow:0 30px 80px rgba(0,0,0,.25); text-align:center; }
.kp-confirm h3 { margin:0 0 8px; color:#1a2744; font-size:18px; }
.kp-confirm p { margin:0 0 22px; color:#6b7280; font-size:14px; line-height:1.5; }
.kp-confirm-btns { display:flex; gap:10px; }
.kp-confirm-btns button { flex:1; height:46px; border-radius:12px; font:700 14px "Exo 2",sans-serif; cursor:pointer; transition:all .15s; }
.kp-confirm-cancel { border:1.5px solid #e5e7eb; background:#fff; color:#374151; }
.kp-confirm-cancel:hover { background:#f3f4f6; }
.kp-confirm-delete { border:none; background:#dc2626; color:#fff; box-shadow:0 4px 14px rgba(220,38,38,.3); }
.kp-confirm-delete:hover { background:#b91c1c; }

/* ── Edit modal ── */
.kp-edit-backdrop { position:fixed; inset:0; z-index:550; display:grid; place-items:center; background:rgba(10,18,34,.5); backdrop-filter:blur(4px); }
.kp-edit-modal { background:#fff; border-radius:18px; padding:28px; width:min(520px,90vw); max-height:85vh; overflow:auto; box-shadow:0 30px 80px rgba(0,0,0,.25); }
.kp-edit-modal h3 { margin:0 0 20px; color:#1a2744; font-size:18px; }
.kp-edit-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px; }
.kp-edit-grid .full { grid-column:1/-1; }
.kp-edit-grid label { display:block; color:#6b7280; font-size:12px; font-weight:600; margin-bottom:4px; }
.kp-edit-grid input, .kp-edit-grid select, .kp-edit-grid textarea { width:100%; height:42px; padding:0 12px; border:1.5px solid #e5e7eb; border-radius:10px; background:#fff; font:14px "Exo 2",sans-serif; color:#1a2744; outline:none; box-sizing:border-box; }
.kp-edit-grid input:focus, .kp-edit-grid select:focus, .kp-edit-grid textarea:focus { border-color:#375dfb; }
.kp-edit-grid textarea { height:100px; padding:12px; resize:vertical; }
.kp-edit-btns { display:flex; gap:10px; }
.kp-edit-btns button { flex:1; height:46px; border-radius:12px; font:700 14px "Exo 2",sans-serif; cursor:pointer; }
.kp-edit-save { border:none; background:linear-gradient(135deg,#2F52F0,#5B7FFF); color:#fff; box-shadow:0 4px 14px rgba(55,93,251,.3); }
.kp-edit-save:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(55,93,251,.4); }

/* ── Create wizard (пошаговое размещение объявления) ── */
.kpw-backdrop { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; padding:24px; background:rgba(0,0,0,.6); backdrop-filter:blur(3px); animation:kpwFade .2s ease; }
@keyframes kpwFade { from{opacity:0} to{opacity:1} }
@keyframes kpwSlide { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }
.kpw { width:min(900px,calc(100vw - 48px)); max-height:90vh; display:flex; flex-direction:column; background:#fff; border-radius:24px; overflow:hidden; box-shadow:0 40px 100px rgba(0,0,0,.32); }
.kpw-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:28px 32px 0; }
.kpw-head .kicker { color:#375dfb; font:900 11px "Exo 2",sans-serif; letter-spacing:.14em; text-transform:uppercase; margin-bottom:5px; }
.kpw-head h2 { margin:0; font:400 28px "Russo One",sans-serif; color:#1a2744; line-height:1.15; }
.kpw-close { width:40px; height:40px; flex:0 0 auto; border:1px solid #e5e7eb; border-radius:12px; background:#fff; color:#6b7280; font-size:24px; cursor:pointer; display:grid; place-items:center; transition:background .15s,transform .15s; }
.kpw-close:hover { background:#eef2ff; transform:rotate(5deg); }

.kpw-steps { display:flex; align-items:flex-start; padding:24px 32px 20px; }
.kpw-step { display:flex; flex-direction:column; align-items:center; gap:8px; flex:0 0 auto; width:88px; text-align:center; }
.kpw-step-ic { width:48px; height:48px; border-radius:15px; display:grid; place-items:center; background:#f0f2f7; color:#9aa3b6; border:1.5px solid #e5e7eb; transition:background .25s ease,color .25s ease,border-color .25s ease,box-shadow .25s ease,transform .25s ease; }
.kpw-step.active .kpw-step-ic { background:linear-gradient(135deg,#2449d4,#5f80ff); color:#fff; border-color:transparent; box-shadow:0 9px 22px rgba(55,93,251,.34); transform:translateY(-2px); }
.kpw-step.done .kpw-step-ic { background:#e8f0ff; color:#375dfb; border-color:#c7d2fe; }
.kpw-step-label { font:700 11.5px "Exo 2",sans-serif; color:#9aa3b6; transition:color .25s; }
.kpw-step.active .kpw-step-label, .kpw-step.done .kpw-step-label { color:#1a2744; }
.kpw-step-line { flex:1; height:3px; border-radius:2px; margin-top:22px; background:#e8ebf2; position:relative; overflow:hidden; }
.kpw-step-line::after { content:''; position:absolute; top:0; left:0; bottom:0; width:var(--fill,0%); background:linear-gradient(90deg,#2449d4,#5f80ff); border-radius:2px; transition:width .4s cubic-bezier(.2,.8,.2,1); }

.kpw-body { flex:1; overflow:auto; padding:8px 32px 28px; }
.kpw-pane { animation:kpwSlide .28s ease both; }
.kpw-pane h3 { margin:0 0 6px; font-size:21px; color:#111827; }
.kpw-pane > .hint { margin:0 0 18px; color:#6b7280; font-size:14px; line-height:1.55; }

.kpw-upload { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:9px; min-height:240px; border:2px dashed #c7d2fe; border-radius:18px; background:#f8faff; color:#375dfb; cursor:pointer; overflow:hidden; transition:border-color .18s,background .18s; }
.kpw-upload:hover { border-color:#375dfb; background:#eef2ff; }
.kpw-upload.has { min-height:0; border-style:solid; border-color:#e5e7eb; background:#0f1830; padding:0; }
.kpw-upload.has img { width:100%; height:300px; object-fit:contain; display:block; }
.kpw-upload-ic { width:56px; height:56px; border-radius:17px; display:grid; place-items:center; background:#375dfb; color:#fff; box-shadow:0 10px 24px rgba(55,93,251,.3); }
.kpw-upload strong { color:#1a2744; font-size:15px; }
.kpw-upload .sub { color:#8b95a7; font-size:12px; }
.kpw-photo-actions { display:flex; justify-content:center; margin-top:13px; }
.kpw-link { border:0; background:none; color:#ef4444; font:700 12.5px "Exo 2",sans-serif; cursor:pointer; }
.kpw-err { margin-top:9px; color:#dc2626; font-size:12px; font-weight:700; text-align:center; }
.kpw-hintbox { display:flex; gap:10px; margin-top:14px; padding:13px 14px; border:1px solid #e6ecfb; border-radius:13px; background:#f4f7ff; color:#4b5b80; font-size:12px; line-height:1.5; }
.kpw-hintbox svg { flex-shrink:0; color:#375dfb; }

.kpw-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.kpw-grid .full { grid-column:1/-1; }
.kpw-grid label.portal-label { display:block; margin-bottom:6px; }
.kpw-charhint { margin-top:5px; color:#9ca3af; font-size:11px; text-align:right; }

.kpw-review { display:grid; grid-template-columns:minmax(0,260px) 1fr; gap:18px; align-items:start; }
.kpw-review-card { border:1px solid #e5e7eb; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(15,23,42,.06); }
.kpw-review-img { height:170px; background:#eef0f4; }
.kpw-review-img img { width:100%; height:100%; object-fit:cover; }
.kpw-review-body { padding:14px; }
.kpw-review-body h4 { margin:9px 0 7px; font-size:15px; color:#111827; line-height:1.3; }
.kpw-review-price { font:400 21px "Russo One",sans-serif; color:#1a2744; }
.kpw-review-price.ex { color:#375dfb; font-size:17px; }
.kpw-review-meta { margin-top:6px; color:#9ca3af; font-size:12px; }
.kpw-review-side { display:flex; flex-direction:column; }
.kpw-review-row { display:flex; justify-content:space-between; gap:12px; padding:11px 0; border-bottom:1px solid #f0f1f4; font-size:13px; }
.kpw-review-row:last-of-type { border-bottom:0; }
.kpw-review-row .k { color:#9ca3af; }
.kpw-review-row .v { color:#1a2744; font-weight:600; text-align:right; }
.kpw-safety { margin-top:14px; display:flex; gap:10px; padding:13px 14px; border:1px solid #d1fae5; border-radius:13px; background:#ecfdf5; color:#4b5563; font-size:12px; line-height:1.45; }
.kpw-safety svg { flex-shrink:0; color:#10b981; }
.kpw-safety b { color:#047857; }

.kpw-foot { display:flex; align-items:center; gap:12px; padding:18px 32px; border-top:1px solid #eef0f3; background:#fafbfc; }
.kpw-foot .counter { color:#9ca3af; font-size:12.5px; font-weight:700; margin-right:auto; }
.kpw-btn { height:46px; padding:0 22px; border-radius:12px; font:700 14px "Exo 2",sans-serif; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:transform .15s,box-shadow .15s,background .15s,border-color .15s; }
.kpw-btn-back { border:1.5px solid #e5e7eb; background:#fff; color:#374151; }
.kpw-btn-back:hover { background:#f3f4f6; }
.kpw-btn-next { border:none; background:linear-gradient(135deg,#2449d4,#5f80ff); color:#fff; box-shadow:0 6px 18px rgba(55,93,251,.3); }
.kpw-btn-next:hover { transform:translateY(-1px); box-shadow:0 10px 26px rgba(55,93,251,.42); }
.kpw-btn-next:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }
@media(max-width:640px){
  .kpw-backdrop { padding:0; }
  .kpw { max-height:100vh; border-radius:0; }
  .kpw-review { grid-template-columns:1fr; }
  .kpw-grid { grid-template-columns:1fr; }
  .kpw-step { width:64px; }
  .kpw-step-label { font-size:10px; }
  .kpw-head, .kpw-body, .kpw-foot, .kpw-steps { padding-inline:16px; }
}

@media(max-width:1050px){
  .kp-hero-inner{grid-template-columns:1fr}
  .kp-hero-showcase{display:none}
  .kp-cats{grid-template-columns:repeat(4,minmax(140px,1fr))}
}
@media(max-width:760px){
  .kp-page{padding-top:60px}
  .kp-hero{padding:25px 16px}
  .kp-hero h1{font-size:35px}
  .kp-hero-search{flex-direction:column}
  .kp-hero-search button{width:100%}
  .kp-hero-stats{gap:14px;flex-wrap:wrap}
  .kp-header{position:relative;top:auto}
  .kp-logo{display:none}
  .kp-sort,.kp-btn-create{width:100%}
  .kp-cats{display:flex; overflow-x:auto; overflow-y:hidden; padding:6px 2px 14px; scroll-snap-type:x proximity; -webkit-overflow-scrolling:touch}
  .kp-cat{min-width:145px; scroll-snap-align:start}
  .kp-cat:hover{transform:translateY(-2px)}
  .kp-service-strip{grid-template-columns:1fr}
  .kp-tabs,.kp-content{padding-inline:14px}
}
`;

export function Kaptorka() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const ads = useKaptorkaStore((s) => s.ads);
  const addAd = useKaptorkaStore((s) => s.addAd);
  const deleteAd = useKaptorkaStore((s) => s.deleteAd);
  const toggleActive = useKaptorkaStore((s) => s.toggleActive);
  const togglePromoted = useKaptorkaStore((s) => s.togglePromoted);
  const updateAd = useKaptorkaStore((s) => s.updateAd);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const hasFavorite = useFavoritesStore((s) => s.has);
  const removeFavorite = useFavoritesStore((s) => s.remove);

  const [tab, setTab] = useState<'all' | 'my'>('all');
  const [category, setCategory] = useState('Все');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('new');
  const showCreate = searchParams.get('create') === '1';
  const [toast, setToast] = useState('');
  const [imageError, setImageError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editingAd, setEditingAd] = useState<KaptorkaAd | null>(null);
  const [editForm, setEditForm] = useState({ title: '', price: '', city: '', category: '', condition: '', desc: '' });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [form, setForm] = useState({
    title: '', category: 'Снаряжение', condition: 'Хорошее', city: 'Москва',
    price: '', phone: '', desc: '', image: '',
  });
  const [step, setStep] = useState(0);

  // Сбрасываем мастер в начало при каждом открытии формы.
  useEffect(() => { if (showCreate) setStep(0); }, [showCreate]);

  const myAds = useMemo(() => ads.filter((a) => a.seller === CURRENT_USER), [ads]);

  const notify = (text: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(text);
    timer.current = setTimeout(() => setToast(''), 2400);
  };

  const toggleFav = (ad: KaptorkaAd, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = hasFavorite(ad.id, 'kaptorka');
    toggleFavorite({
      id: ad.id,
      kind: 'kaptorka',
      title: ad.title,
      condition: ad.condition,
      price: ad.price,
      seller: ad.seller,
      city: ad.city,
      image: ad.image,
      available: ad.active !== false,
    });
    notify(isFav ? 'Убрано из избранного' : 'Добавлено в избранное');
  };

  const filtered = useMemo(() => {
    const result = ads.filter((ad) => {
      if (ad.active === false) return false;
      const matchCat = category === 'Все' || ad.category === category;
      const q = query.trim().toLowerCase();
      const matchQ = !q || `${ad.title} ${ad.city} ${ad.seller}`.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
    return [...result].sort((a, b) => {
      if (sort === 'priceUp') return a.price - b.price;
      if (sort === 'priceDown') return b.price - a.price;
      if (sort === 'views') return b.views - a.views;
      return b.id - a.id;
    });
  }, [ads, category, query, sort]);

  const myStats = useMemo(() => {
    const active = myAds.filter((a) => a.active !== false).length;
    const views = myAds.reduce((s, a) => s + a.views, 0);
    const favs = myAds.reduce((s, a) => s + (a.favorites ?? 0), 0);
    const msgs = myAds.reduce((s, a) => s + (a.messages ?? 0), 0);
    return { total: myAds.length, active, views, favs, msgs };
  }, [myAds]);

  const isExchangeForm = form.category === 'Обмен';
  const detailsValid = form.title.trim() !== '' && (isExchangeForm || form.price.trim() !== '');
  const contactsValid = form.phone.trim() !== '';

  const submitAd = () => {
    if (!form.title.trim() || (!isExchangeForm && !form.price.trim())) { setStep(1); notify('Заполните название и цену'); return; }
    if (!contactsValid) { setStep(2); notify('Укажите телефон для связи'); return; }
    const next: KaptorkaAd = {
      id: Math.max(0, ...ads.map((ad) => ad.id)) + 1, title: form.title, category: form.category,
      condition: form.condition, city: form.city, price: isExchangeForm ? 0 : Number(form.price),
      image: form.image || '/каптерка1.png', seller: CURRENT_USER, phone: form.phone,
      date: 'Только что', views: 0, active: true, favorites: 0, messages: 0,
      desc: form.desc || 'Описание будет добавлено позже.',
    };
    addAd(next);
    setSearchParams({});
    setForm({ title: '', category: 'Снаряжение', condition: 'Хорошее', city: 'Москва', price: '', phone: '', desc: '', image: '' });
    setImageError('');
    setStep(0);
    setTab('my');
    notify('Объявление опубликовано');
  };

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    try {
      const img = await readAndCompressImage(file);
      setForm((c) => ({ ...c, image: img }));
      setImageError('');
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Не удалось загрузить изображение');
    }
  };

  const openEdit = (ad: KaptorkaAd) => {
    setEditForm({ title: ad.title, price: String(ad.price), city: ad.city, category: ad.category, condition: ad.condition, desc: ad.desc });
    setEditingAd(ad);
  };

  const saveEdit = () => {
    if (!editingAd) return;
    updateAd(editingAd.id, {
      title: editForm.title, price: Number(editForm.price), city: editForm.city,
      category: editForm.category, condition: editForm.condition, desc: editForm.desc,
    });
    setEditingAd(null);
    notify('Объявление обновлено');
  };

  const handleDelete = () => {
    if (confirmDelete === null) return;
    deleteAd(confirmDelete);
    removeFavorite(confirmDelete, 'kaptorka');
    setConfirmDelete(null);
    notify('Объявление удалено');
  };

  return (
    <main className="kp-page">
      <style>{CSS}</style>

      {/* ── Sticky header ── */}
      <header className="kp-header">
        <div className="kp-header-inner">
          <div className="kp-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#375dfb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
            Каптёрка
          </div>
          <div className="kp-search-wrap">
            <IcSearch />
            <input className="kp-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по объявлениям, городу или продавцу" />
          </div>
          <select className="kp-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Сначала новые</option>
            <option value="priceUp">Сначала дешевле</option>
            <option value="priceDown">Сначала дороже</option>
            <option value="views">По просмотрам</option>
          </select>
          <button className="kp-btn-create" onClick={() => setSearchParams({ create: '1' })}>
            + Разместить
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="kp-tabs" id="kaptorka-catalog">
        <button className={`kp-tab${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>
          Все объявления
        </button>
        <button className={`kp-tab${tab === 'my' ? ' active' : ''}`} onClick={() => setTab('my')}>
          Мои объявления<span className="kp-tab-count">{myAds.length}</span>
        </button>
      </div>
      <div className="kp-tab-line" />

      {/* ── Content ── */}
      <div className="kp-content">
        {tab === 'all' ? (
          <>
            <div className="kp-cats">
              {CATEGORIES.map((c) => (
                <button key={c} className={`kp-cat${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
            <div className="kp-service-strip">
              <div className="kp-service-item">
                <div className="kp-service-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                <div><b>Профили продавцов</b><span>Рейтинг, отзывы и история на портале</span></div>
              </div>
              <div className="kp-service-item">
                <div className="kp-service-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></div>
                <div><b>Покупка или обмен</b><span>Договаривайтесь напрямую в диалогах</span></div>
              </div>
              <div className="kp-service-item">
                <div className="kp-service-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></div>
                <div><b>Безопасная сделка</b><span>Памятка и проверка товара перед оплатой</span></div>
              </div>
            </div>
            <div className="kp-count">{filtered.length} объявлени{filtered.length === 1 ? 'е' : filtered.length < 5 ? 'я' : 'й'}</div>

            {filtered.length ? (
              <div className="kp-grid">
                {filtered.map((ad) => {
                  const fav = hasFavorite(ad.id, 'kaptorka');
                  const s = seller(ad.seller);
                  return (
                    <article key={ad.id} className="kp-card" onClick={() => navigate(`/kaptorka/${ad.id}`)}>
                      <div className="kp-card-img">
                        <img src={ad.image} alt={ad.title} />
                        <button className="kp-card-fav" onClick={(e) => toggleFav(ad, e)} aria-label={fav ? 'Убрать из избранного' : 'В избранное'}>
                          <IcHeart filled={fav} />
                        </button>
                        {ad.promoted && <span className="kp-card-promo">Топ</span>}
                      </div>
                      <div className="kp-card-body">
                        <div className={`kp-card-price${ad.price === 0 ? ' exchange' : ''}`}>
                          {ad.price ? `${ad.price.toLocaleString()} ₽` : 'Обмен'}
                        </div>
                        <div className="kp-card-title">{ad.title}</div>
                      </div>
                      <div className="kp-card-seller">
                        <SellerAvatar name={ad.seller} size={28} />
                        <span className="kp-card-seller-name">{ad.seller}</span>
                        {s.verified && <IcShield />}
                      </div>
                      <div className="kp-card-footer">
                        <span className="kp-card-loc"><IcLocation />{ad.city}</span>
                        <span className="kp-card-date">{ad.date}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="kp-empty">
                <div className="kp-empty-icon"><IcSearch /></div>
                <h2>Ничего не найдено</h2>
                <p>Попробуйте изменить фильтры или разместите своё объявление</p>
              </div>
            )}
          </>
        ) : (
          /* ── My Ads panel ── */
          <>
            <div className="kp-my-stats">
              <div className="kp-my-stat">
                <div className="kp-my-stat-icon blue"><IcPackage /></div>
                <div><div className="kp-my-stat-num">{myStats.total}</div><div className="kp-my-stat-label">Объявлений</div></div>
              </div>
              <div className="kp-my-stat">
                <div className="kp-my-stat-icon green"><IcEye size={18} /></div>
                <div><div className="kp-my-stat-num">{myStats.views}</div><div className="kp-my-stat-label">Просмотров</div></div>
              </div>
              <div className="kp-my-stat">
                <div className="kp-my-stat-icon orange"><IcHeart filled dark /></div>
                <div><div className="kp-my-stat-num">{myStats.favs}</div><div className="kp-my-stat-label">В избранном</div></div>
              </div>
              <div className="kp-my-stat">
                <div className="kp-my-stat-icon purple"><IcMsg /></div>
                <div><div className="kp-my-stat-num">{myStats.msgs}</div><div className="kp-my-stat-label">Сообщений</div></div>
              </div>
            </div>

            {myAds.length ? (
              <div className="kp-my-list">
                {myAds.map((ad) => (
                  <div key={ad.id} className={`kp-my-row${ad.active === false ? ' inactive' : ''}`}>
                    <div className="kp-my-thumb" style={{ cursor: 'pointer' }} onClick={() => navigate(`/kaptorka/${ad.id}`)}>
                      <img src={ad.image} alt={ad.title} />
                    </div>
                    <div className="kp-my-info">
                      <div className="kp-my-title" style={{ cursor: 'pointer' }} onClick={() => navigate(`/kaptorka/${ad.id}`)}>{ad.title}</div>
                      <div className="kp-my-meta">
                        <span className={`kp-my-price${ad.price === 0 ? ' exchange' : ''}`}>
                          {ad.price ? `${ad.price.toLocaleString()} ₽` : 'Обмен'}
                        </span>
                        <span className={`kp-status ${ad.active !== false ? 'active' : 'paused'}`}>
                          {ad.active !== false ? 'Активно' : 'Приостановлено'}
                        </span>
                        {ad.promoted && <span className="kp-status promoted">В топе</span>}
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>{ad.city} · {ad.date}</span>
                      </div>
                    </div>
                    <div className="kp-my-metrics">
                      <div className="kp-my-metric">
                        <div className="kp-my-metric-num">{ad.views}</div>
                        <div className="kp-my-metric-label">Просм.</div>
                      </div>
                      <div className="kp-my-metric">
                        <div className="kp-my-metric-num">{ad.favorites ?? 0}</div>
                        <div className="kp-my-metric-label">Избр.</div>
                      </div>
                      <div className="kp-my-metric">
                        <div className="kp-my-metric-num">{ad.messages ?? 0}</div>
                        <div className="kp-my-metric-label">Сообщ.</div>
                      </div>
                    </div>
                    <div className="kp-my-actions">
                      <button className="kp-act" title="Редактировать" onClick={() => openEdit(ad)}><IcEdit /></button>
                      <button className="kp-act" title={ad.active !== false ? 'Приостановить' : 'Активировать'} onClick={() => { toggleActive(ad.id); notify(ad.active !== false ? 'Объявление приостановлено' : 'Объявление активировано'); }}>
                        {ad.active !== false ? <IcPause /> : <IcPlay />}
                      </button>
                      <button className={`kp-act promote${ad.promoted ? ' active' : ''}`} title={ad.promoted ? 'Убрать из топа' : 'Поднять в топ'} onClick={() => { togglePromoted(ad.id); notify(ad.promoted ? 'Убрано из топа' : 'Поднято в топ'); }}>
                        <IcRocket />
                      </button>
                      <button className="kp-act danger" title="Удалить" onClick={() => setConfirmDelete(ad.id)}><IcTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="kp-empty">
                <div className="kp-empty-icon"><IcPackage /></div>
                <h2>У вас пока нет объявлений</h2>
                <p>Разместите своё первое объявление, чтобы начать продавать</p>
                <button className="kp-btn-create" style={{ marginTop: 18 }} onClick={() => setSearchParams({ create: '1' })}>+ Разместить объявление</button>
              </div>
            )}
          </>
        )}
      </div>

      <section className="kp-hero" aria-label="Маркетплейс участников Воеводы">
        <div className="kp-hero-inner">
          <div>
            <div className="kp-hero-kicker">Маркетплейс участников «Воеводы»</div>
            <h1>Не нашли нужное? Загляните ещё раз</h1>
            <p className="kp-hero-copy">Новые объявления появляются регулярно. Вернитесь к каталогу, найдите нужное снаряжение или предложите своё.</p>
            <div className="kp-hero-search">
              <div className="kp-search-wrap">
                <IcSearch />
                <input className="kp-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Что ищем? Например, рюкзак 45 литров" />
              </div>
              <button type="button" onClick={() => document.getElementById('kaptorka-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>К покупкам</button>
            </div>
            <div className="kp-hero-actions">
              <button className="kp-hero-create" onClick={() => setSearchParams({ create: '1' })}>+ Разместить объявление</button>
              <button className="kp-hero-secondary" onClick={() => setTab('my')}>Мои объявления</button>
            </div>
            <div className="kp-hero-stats">
              <div className="kp-hero-stat"><b>{ads.filter((ad) => ad.active !== false).length}</b><span>активных объявлений</span></div>
              <div className="kp-hero-stat"><b>{Object.keys(SELLERS).length}</b><span>проверенных продавцов</span></div>
              <div className="kp-hero-stat"><b>0%</b><span>комиссия за размещение</span></div>
            </div>
          </div>
          <div className="kp-hero-showcase" aria-hidden="true">
            <div className="kp-showcase-card one"><img src={ads[0]?.image || '/каптерка1.png'} alt="" /><span>{ads[0]?.title || 'Снаряжение'}</span><b>{ads[0]?.price.toLocaleString() || '7 800'} ₽</b></div>
            <div className="kp-showcase-card two"><img src={ads[2]?.image || '/каптерка3.png'} alt="" /><span>{ads[2]?.title || 'Тактический рюкзак'}</span><b>{ads[2]?.price.toLocaleString() || '6 500'} ₽</b></div>
          </div>
        </div>
      </section>

      {toast && <div className="kp-toast">{toast}</div>}

      {/* ── Delete confirmation ── */}
      {confirmDelete !== null && (
        <div className="kp-confirm-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="kp-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Удалить объявление?</h3>
            <p>Это действие нельзя отменить. Объявление будет полностью удалено из Каптёрки.</p>
            <div className="kp-confirm-btns">
              <button className="kp-confirm-cancel" onClick={() => setConfirmDelete(null)}>Отмена</button>
              <button className="kp-confirm-delete" onClick={handleDelete}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editingAd && (
        <div className="kp-edit-backdrop" onClick={() => setEditingAd(null)}>
          <div className="kp-edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Редактировать объявление</h3>
            <div className="kp-edit-grid">
              <div className="full">
                <label>Название</label>
                <input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label>Цена, ₽</label>
                <input type="number" min="0" value={editForm.price} onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <label>Город</label>
                <input value={editForm.city} onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <label>Категория</label>
                <select value={editForm.category} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.filter((c) => c !== 'Все').map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Состояние</label>
                <select value={editForm.condition} onChange={(e) => setEditForm((p) => ({ ...p, condition: e.target.value }))}>
                  {['Новое', 'Отличное', 'Хорошее'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="full">
                <label>Описание</label>
                <textarea value={editForm.desc} onChange={(e) => setEditForm((p) => ({ ...p, desc: e.target.value }))} />
              </div>
            </div>
            <div className="kp-edit-btns">
              <button className="kp-confirm-cancel" onClick={() => setEditingAd(null)}>Отмена</button>
              <button className="kp-edit-save" onClick={saveEdit}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create wizard (пошаговое размещение) ── */}
      {showCreate && (
        <div className="kpw-backdrop" onClick={() => setSearchParams({})}>
          <section className="kpw" onClick={(e) => e.stopPropagation()}>
            <div className="kpw-head">
              <div>
                <div className="kicker">Каптёрка Воеводы</div>
                <h2>Разместить объявление</h2>
              </div>
              <button className="kpw-close" onClick={() => setSearchParams({})} aria-label="Закрыть форму">×</button>
            </div>

            {/* Прогресс-степпер: видно, что сделано, что сейчас и что впереди */}
            <div className="kpw-steps">
              {[
                { label: 'Фото', icon: <IcStepPhoto /> },
                { label: 'Детали', icon: <IcStepDetails /> },
                { label: 'Контакты', icon: <IcStepContacts /> },
              ].map((s, i, arr) => (
                <Fragment key={s.label}>
                  <div className={`kpw-step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
                    <div className="kpw-step-ic">{i < step ? <IcCheck /> : s.icon}</div>
                    <div className="kpw-step-label">{s.label}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="kpw-step-line" style={{ '--fill': step > i ? '100%' : '0%' } as React.CSSProperties} />
                  )}
                </Fragment>
              ))}
            </div>

            <div className="kpw-body">
              {step === 0 && (
                <div className="kpw-pane">
                  <h3>Фотография товара</h3>
                  <p className="hint">Объявления с фото получают в разы больше откликов. Первое фото станет обложкой.</p>
                  <label className={`kpw-upload${form.image ? ' has' : ''}`} htmlFor="kaptorka-image">
                    {form.image ? (
                      <img src={form.image} alt="Предпросмотр товара" />
                    ) : (
                      <>
                        <span className="kpw-upload-ic"><IcCamera /></span>
                        <strong>Загрузить фотографию</strong>
                        <span className="sub">JPG, PNG или WEBP до 8 МБ</span>
                      </>
                    )}
                  </label>
                  <input id="kaptorka-image" className="market-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
                  {form.image && (
                    <div className="kpw-photo-actions">
                      <button className="kpw-link" onClick={() => setForm((c) => ({ ...c, image: '' }))}>Удалить фотографию</button>
                    </div>
                  )}
                  {imageError && <div className="kpw-err">{imageError}</div>}
                  {!form.image && (
                    <div className="kpw-hintbox">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      Без фото тоже можно продолжить — мы подставим обложку по умолчанию, но со своим снимком объявление заметят быстрее.
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="kpw-pane">
                  <h3>Детали объявления</h3>
                  <p className="hint">Чем точнее описание, тем быстрее найдётся покупатель.</p>
                  <div className="kpw-grid">
                    <div className="full">
                      <label className="portal-label" htmlFor="kaptorka-title">Название</label>
                      <input id="kaptorka-title" className="portal-input" maxLength={80} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Например, разгрузочный жилет с подсумками" />
                      <div className="kpw-charhint">{form.title.length}/80</div>
                    </div>
                    <div>
                      <label className="portal-label" htmlFor="kaptorka-category">Категория</label>
                      <select id="kaptorka-category" className="portal-select" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                        {CATEGORIES.filter((c) => c !== 'Все').map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="portal-label" htmlFor="kaptorka-condition">Состояние</label>
                      <select id="kaptorka-condition" className="portal-select" value={form.condition} onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}>
                        {['Новое', 'Отличное', 'Хорошее'].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    {isExchangeForm ? (
                      <div>
                        <label className="portal-label">Цена</label>
                        <div className="portal-input" style={{ display: 'flex', alignItems: 'center', color: '#375dfb', fontWeight: 700, background: '#f0f4ff', borderColor: '#c7d2fe' }}>Обмен — без цены</div>
                      </div>
                    ) : (
                      <div>
                        <label className="portal-label" htmlFor="kaptorka-price">Цена, ₽</label>
                        <input id="kaptorka-price" className="portal-input" type="number" min="0" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="0" />
                      </div>
                    )}
                    <div>
                      <label className="portal-label" htmlFor="kaptorka-city">Город</label>
                      <input id="kaptorka-city" className="portal-input" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="Москва" />
                    </div>
                    <div className="full">
                      <label className="portal-label" htmlFor="kaptorka-desc">Описание</label>
                      <textarea id="kaptorka-desc" className="portal-textarea" style={{ minHeight: 120 }} maxLength={1500} value={form.desc} onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))} placeholder="Опишите комплектацию, размеры, следы использования и условия передачи" />
                      <div className="kpw-charhint">{form.desc.length}/1500</div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="kpw-pane">
                  <h3>Контакты и проверка</h3>
                  <p className="hint">Номер увидят только авторизованные участники портала. Проверьте, как будет выглядеть объявление.</p>
                  <div className="kpw-grid" style={{ marginBottom: 18 }}>
                    <div className="full">
                      <label className="portal-label" htmlFor="kaptorka-phone">Телефон</label>
                      <input id="kaptorka-phone" className="portal-input" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+7 999 000-00-00" />
                    </div>
                  </div>
                  <div className="kpw-review">
                    <div className="kpw-review-card">
                      <div className="kpw-review-img"><img src={form.image || '/каптерка1.png'} alt="" /></div>
                      <div className="kpw-review-body">
                        <span className={`portal-badge ${form.condition === 'Новое' ? 'green' : form.condition === 'Отличное' ? 'gold' : ''}`}>{form.condition}</span>
                        <h4>{form.title.trim() || 'Название вашего объявления'}</h4>
                        <div className={`kpw-review-price${isExchangeForm ? ' ex' : ''}`}>{isExchangeForm ? 'Обмен' : (form.price ? `${Number(form.price).toLocaleString()} ₽` : 'Укажите цену')}</div>
                        <div className="kpw-review-meta">{form.city || 'Город'} · {CURRENT_USER}</div>
                      </div>
                    </div>
                    <div className="kpw-review-side">
                      <div className="kpw-review-row"><span className="k">Категория</span><span className="v">{form.category}</span></div>
                      <div className="kpw-review-row"><span className="k">Состояние</span><span className="v">{form.condition}</span></div>
                      <div className="kpw-review-row"><span className="k">Город</span><span className="v">{form.city || '—'}</span></div>
                      <div className="kpw-review-row"><span className="k">Цена</span><span className="v">{isExchangeForm ? 'Обмен' : (form.price ? `${Number(form.price).toLocaleString()} ₽` : '—')}</span></div>
                      <div className="kpw-review-row"><span className="k">Телефон</span><span className="v">{form.phone || '—'}</span></div>
                      <div className="kpw-safety"><IcShieldMini /><span><b>Безопасная сделка.</b> Не передавайте коды подтверждения и проверяйте товар при встрече.</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="kpw-foot">
              <span className="counter">Шаг {step + 1} из 3</span>
              {step > 0 && <button className="kpw-btn kpw-btn-back" onClick={() => setStep((s) => s - 1)}>Назад</button>}
              {step < 2 ? (
                <button className="kpw-btn kpw-btn-next" disabled={step === 1 && !detailsValid} onClick={() => setStep((s) => s + 1)}>Далее <IcArrowR /></button>
              ) : (
                <button className="kpw-btn kpw-btn-next" disabled={!detailsValid || !contactsValid} onClick={submitAd}><IcCheck /> Опубликовать</button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
