import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useKaptorkaStore, SELLERS, CURRENT_USER, KAPTORKA_SEED_IMAGES, type KaptorkaAd } from '../store/useKaptorkaStore';
import { PortalBreadcrumb } from '../components/PortalBreadcrumb';
import { IVDisplay } from '../components/PeopleSection';
import { userProfilePath } from '../api/testApi';
import { useFavoritesStore } from '../store/useFavoritesStore';

const seller = (name: string) => SELLERS[name] ?? { name, avatar: '', chatId: 0, index: 1000, rating: 4.5, reviews: 0, ads: 0, joined: '—', verified: false };

// Реальный счётчик просмотров: каждое открытие карточки = +1.
// Дебаунс по времени отсекает двойной вызов эффекта в dev (React StrictMode).
const lastViewCountAt: Record<number, number> = {};

/* ── icons ── */
const IcHeart = ({ filled }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#ff3b30' : 'none'} stroke={filled ? '#ff3b30' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IcPhone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IcMsg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623" stroke="#f5a623" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);
const IcLocation = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IcEye = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IcChev = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IcChevBig = ({ dir = 'right' }: { dir?: 'left' | 'right' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}/>
  </svg>
);
const IcZoom = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const IcSwap = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IcInfo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const IcUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

function SellerAvatar({ name, size = 48 }: { name: string; size?: number }) {
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
.kpp-page { min-height:calc(100vh - 60px); margin-left:56px; padding:60px 0 0; background:linear-gradient(180deg,#eef3ff 0,#f5f6f8 360px,#f5f6f8 100%); font-family:"Exo 2",sans-serif; color:#17213a; }
.kpp-wrap { max-width:1240px; margin:0 auto; padding:20px 24px 70px; }
.kpp-crumbs { display:flex; align-items:center; gap:7px; font-size:13px; color:#8b93a7; margin-bottom:16px; flex-wrap:wrap; }
.kpp-crumbs button { border:none; background:none; cursor:pointer; color:#8b93a7; font:inherit; padding:0; transition:color .15s; }
.kpp-crumbs button:hover { color:#375dfb; }
.kpp-crumbs .cur { color:#1a2744; font-weight:600; }
.kpp-back { display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 15px; border:1.5px solid #dfe5f2; border-radius:11px; background:#fff; color:#35405a; font:700 13px "Exo 2",sans-serif; cursor:pointer; margin-bottom:18px; transition:all .18s; }
.kpp-back:hover { border-color:#c7d2fe; color:#375dfb; background:#f0f4ff; transform:translateX(-3px); }

.kpp-grid { display:grid; grid-template-columns:minmax(0,1fr) 388px; gap:26px; align-items:start; }
@media(max-width:980px){ .kpp-grid { grid-template-columns:1fr; } .kpp-page{ margin-left:0; } }

/* gallery */
.kpp-gallery { position:relative; border-radius:22px; overflow:hidden; background:#e9edf6; aspect-ratio:4/3; cursor:zoom-in; box-shadow:0 20px 50px rgba(26,39,68,.12); border:1px solid #e3e7ef; }
.kpp-gallery img { width:100%; height:100%; object-fit:cover; display:block; }
.kpp-gallery-badges { position:absolute; top:14px; left:14px; display:flex; gap:8px; z-index:3; }
.kpp-gbadge { padding:6px 12px; border-radius:9px; font:700 12px "Exo 2",sans-serif; color:#fff; box-shadow:0 4px 12px rgba(0,0,0,.18); backdrop-filter:blur(4px); }
.kpp-gbadge.top { background:linear-gradient(135deg,#f5a623,#e8940e); }
.kpp-gbadge.cond { background:rgba(26,39,68,.78); }
.kpp-gfav { position:absolute; top:14px; right:14px; width:42px; height:42px; border-radius:50%; border:none; cursor:pointer; background:rgba(255,255,255,.92); display:grid; place-items:center; color:#9ca3af; z-index:3; transition:transform .18s,background .18s,color .18s; box-shadow:0 4px 14px rgba(0,0,0,.14); }
.kpp-gfav:hover { transform:scale(1.1); }
.kpp-gfav.active { color:#ff3b30; }
.kpp-zoomhint { position:absolute; bottom:14px; right:14px; display:inline-flex; align-items:center; gap:6px; padding:7px 12px; border-radius:10px; background:rgba(26,39,68,.72); color:#fff; font:600 12px "Exo 2",sans-serif; z-index:3; backdrop-filter:blur(6px); pointer-events:none; opacity:.9; }
.kpp-views { position:absolute; bottom:14px; left:14px; display:inline-flex; align-items:center; gap:6px; padding:7px 12px; border-radius:10px; background:rgba(26,39,68,.72); color:#fff; font:600 12px "Exo 2",sans-serif; z-index:3; backdrop-filter:blur(6px); }

.kpp-card { background:#fff; border:1px solid #e3e7ef; border-radius:18px; padding:22px 24px; margin-top:18px; box-shadow:0 8px 26px rgba(26,39,68,.05); }
.kpp-card h3 { margin:0 0 12px; font-size:17px; font-weight:700; color:#1a2744; display:flex; align-items:center; gap:9px; }
.kpp-card p { margin:0; color:#4b5563; font-size:14.5px; line-height:1.75; white-space:pre-line; }
.kpp-specs { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.kpp-spec { padding:14px 16px; border-radius:13px; background:#f6f8fc; border:1px solid #eef1f7; }
.kpp-spec-l { color:#9ca3af; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; margin-bottom:5px; }
.kpp-spec-v { color:#1a2744; font-size:15px; font-weight:600; display:flex; align-items:center; gap:6px; }

/* right rail */
.kpp-rail { position:sticky; top:74px; display:flex; flex-direction:column; gap:14px; }
.kpp-title { font:400 24px/1.25 "Russo One",sans-serif; color:#1a2744; letter-spacing:-.01em; margin:0 0 6px; }
.kpp-sub { display:flex; align-items:center; gap:12px; color:#8b93a7; font-size:13px; margin-bottom:4px; flex-wrap:wrap; }
.kpp-sub span { display:inline-flex; align-items:center; gap:4px; }
.kpp-pricebox { background:linear-gradient(135deg,#f4f8ff,#e9eeff); border:1px solid #d4ddff; border-radius:16px; padding:22px; }
.kpp-price { font:400 36px "Russo One",sans-serif; color:#1a2744; line-height:1; }
.kpp-price.exchange { color:#375dfb; font-size:26px; }
.kpp-price-badges { margin-top:12px; display:flex; gap:7px; flex-wrap:wrap; }
.kpp-badge { display:inline-flex; align-items:center; height:26px; padding:0 11px; border-radius:8px; font:700 12px "Exo 2",sans-serif; }
.kpp-badge.green { background:#e8f8f2; color:#1d9e75; }
.kpp-badge.gold { background:#fff8ed; color:#b86d00; }
.kpp-badge.blue { background:#eef2ff; color:#375dfb; }

.kpp-btn { width:100%; height:50px; border-radius:13px; font:700 15px "Exo 2",sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .18s; }
.kpp-btn-phone { border:2px solid #1d9e75; background:#fff; color:#1d9e75; }
.kpp-btn-phone:hover { background:#e8f8f2; }
.kpp-btn-phone.revealed { background:#e8f8f2; color:#15803d; font:400 18px "Russo One",sans-serif; letter-spacing:.5px; }
.kpp-btn-msg { border:none; background:linear-gradient(135deg,#2F52F0,#5B7FFF); color:#fff; box-shadow:0 8px 22px rgba(55,93,251,.3); }
.kpp-btn-msg:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(55,93,251,.42); }
.kpp-btn-buy { height:46px; border:1.5px solid #e5e7eb; background:#fff; color:#374151; font-weight:600; }
.kpp-btn-buy:hover { border-color:#c7d2fe; background:#f0f4ff; color:#375dfb; }
.kpp-btn-fav { height:46px; border:1.5px solid #e5e7eb; background:#fff; color:#374151; font-weight:600; }
.kpp-btn-fav:hover, .kpp-btn-fav.active { border-color:#ff3b30; color:#ff3b30; background:#fff5f5; }

.kpp-seller { background:#fff; border:1px solid #e3e7ef; border-radius:16px; padding:18px; }
.kpp-seller-top { display:flex; align-items:center; gap:12px; cursor:pointer; }
.kpp-seller-name { color:#1a2744; font-weight:700; font-size:16px; display:flex; align-items:center; gap:6px; }
.kpp-seller-rating { display:flex; align-items:center; gap:5px; color:#6b7280; font-size:12px; margin-top:2px; }
.kpp-seller-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:14px; }
.kpp-seller-stat { text-align:center; padding:10px 8px; border-radius:11px; background:#f6f8fc; border:1px solid #eef1f7; }
.kpp-seller-stat b { display:block; color:#1a2744; font-size:17px; font-weight:800; }
.kpp-seller-stat span { color:#9ca3af; font-size:10px; font-weight:600; text-transform:uppercase; }
.kpp-safety { padding:14px 16px; border-radius:13px; background:#f0fdf4; border:1px solid #bbf7d0; font-size:12.5px; color:#166534; line-height:1.55; }
.kpp-safety b { display:block; margin-bottom:4px; font-size:13px; }

/* similar */
.kpp-similar { margin-top:46px; }
.kpp-similar-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
.kpp-similar-head h2 { margin:0; font:400 24px "Russo One",sans-serif; color:#1a2744; }
.kpp-similar-head button { display:inline-flex; align-items:center; gap:6px; border:1.5px solid #dfe5f2; background:#fff; color:#375dfb; font:700 13px "Exo 2",sans-serif; height:40px; padding:0 16px; border-radius:11px; cursor:pointer; transition:all .18s; }
.kpp-similar-head button:hover { background:#f0f4ff; border-color:#c7d2fe; transform:translateX(2px); }
.kpp-similar-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
@media(max-width:1100px){ .kpp-similar-grid { grid-template-columns:repeat(3,1fr); } }
@media(max-width:760px){ .kpp-similar-grid { grid-template-columns:repeat(2,1fr); } .kpp-wrap{ padding-inline:14px; } }

/* slider для похожих объявлений */
.kpp-slider-nav { display:flex; align-items:center; gap:6px; }
.kpp-slider-nav button { width:34px; height:34px; padding:0; flex:0 0 34px; border:1.5px solid #e3e7ef; border-radius:50% !important; background:#fff; color:#7b8fb5; cursor:pointer; display:grid; place-items:center; box-shadow:0 2px 8px rgba(26,39,68,.07); transition:border-color .18s,background .18s,color .18s,transform .18s,box-shadow .18s; }
.kpp-slider-nav button:hover { border-color:#375dfb; background:linear-gradient(135deg,#2F52F0,#5B7FFF); color:#fff; transform:scale(1.1); box-shadow:0 6px 18px rgba(55,93,251,.32); }
.kpp-slider-nav button:active { transform:scale(.93); box-shadow:none; }
.kpp-slider { display:flex; gap:16px; overflow-x:auto; scroll-snap-type:x mandatory; scroll-behavior:smooth; padding:4px 2px 10px; scrollbar-width:none; }
.kpp-slider::-webkit-scrollbar { display:none; }
.kpp-slider > .kpp-scard { flex:0 0 clamp(220px,23vw,264px); scroll-snap-align:start; }
@media(max-width:760px){ .kpp-wrap{ padding-inline:14px; } .kpp-slider > .kpp-scard { flex-basis:78%; } }
.kpp-scard { background:#fff; border:1px solid #e3e7ef; border-radius:16px; overflow:hidden; cursor:pointer; display:flex; flex-direction:column; transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s ease,border-color .3s ease; }
.kpp-scard:hover { transform:translateY(-6px); box-shadow:0 18px 40px rgba(26,39,68,.14); border-color:#cbd6f7; }
.kpp-scard-img { aspect-ratio:4/3; overflow:hidden; background:#eef0f4; }
.kpp-scard-img img { width:100%; height:100%; object-fit:cover; transition:transform .4s ease; }
.kpp-scard:hover .kpp-scard-img img { transform:scale(1.07); }
.kpp-scard-body { padding:13px 14px 14px; display:flex; flex-direction:column; flex:1; }
.kpp-scard-price { font:400 19px "Russo One",sans-serif; color:#1a2744; margin-bottom:5px; }
.kpp-scard-price.exchange { color:#375dfb; font-size:15px; }
.kpp-scard-title { font-size:13.5px; color:#35405a; line-height:1.4; margin-bottom:auto; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.kpp-scard-meta { display:flex; align-items:center; gap:5px; color:#9ca3af; font-size:11px; margin-top:9px; }

/* mount animation */
@keyframes kppRise { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
.kpp-rise { animation:kppRise .5s cubic-bezier(.2,.8,.2,1) both; }

.kpp-toast { position:fixed; right:24px; bottom:24px; z-index:700; padding:14px 20px; border-radius:12px; background:#1a2744; color:#fff; box-shadow:0 14px 36px rgba(26,39,68,.28); font:600 14px "Exo 2",sans-serif; animation:kppRise .3s ease; }

.kpp-missing { text-align:center; padding:90px 24px; }
.kpp-missing h2 { font:400 24px "Russo One",sans-serif; color:#1a2744; margin:0 0 10px; }
.kpp-missing p { color:#9ca3af; margin:0 0 22px; }

/* ── price box: вариант «обмен» ── */
.kpp-price-ex { display:flex; align-items:center; gap:13px; }
.kpp-price-ex-icon { width:50px; height:50px; flex-shrink:0; border-radius:15px; display:grid; place-items:center; background:linear-gradient(135deg,#2449d4,#5f80ff); color:#fff; box-shadow:0 8px 20px rgba(55,93,251,.28); }
.kpp-price-ex-text .t { font:400 24px "Russo One",sans-serif; color:#375dfb; line-height:1; }
.kpp-price-ex-text .s { color:#5b6b8c; font-size:12.5px; margin-top:5px; }

/* ── seller card (улучшенный, со знаком ИВ и рейтингом) ── */
.kpp-seller-head { display:flex; align-items:center; gap:13px; }
.kpp-seller-head .kpp-seller-name { font-size:16px; }
.kpp-seller-chev { margin-left:auto; color:#b1bad0; display:grid; place-items:center; width:30px; height:30px; border-radius:9px; transition:background .15s,color .15s,transform .15s; }
.kpp-seller-top:hover .kpp-seller-chev { background:#f0f4ff; color:#375dfb; transform:translateX(2px); }
.kpp-seller-iv { margin-top:13px; }
.kpp-seller-actions { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-top:14px; }
.kpp-seller-action { height:42px; border:1.5px solid #e5e7eb; border-radius:11px; background:#fff; color:#35405a; font:700 12.5px "Exo 2",sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:border-color .16s,background .16s,color .16s,transform .16s; }
.kpp-seller-action:hover { border-color:#c7d2fe; background:#f0f4ff; color:#375dfb; transform:translateY(-1px); }
.kpp-seller-action svg { width:15px; height:15px; }

/* ── deal / exchange modal ── */
.kpp-deal-backdrop { position:fixed; top:0; right:0; bottom:0; left:56px; z-index:600; display:grid; place-items:center; padding:20px; background:rgba(10,18,34,.62); backdrop-filter:blur(8px); animation:kppRise .22s ease; }
.kpp-deal { width:min(560px,100%); max-height:90vh; overflow:auto; background:#fff; border-radius:22px; box-shadow:0 40px 100px rgba(0,0,0,.3); }
.kpp-deal-head { position:sticky; top:0; z-index:2; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:22px 24px 16px; border-bottom:1px solid #eef0f3; background:rgba(255,255,255,.97); backdrop-filter:blur(10px); }
.kpp-deal-head .kicker { color:#375dfb; font:900 11px "Exo 2",sans-serif; letter-spacing:.13em; text-transform:uppercase; margin-bottom:6px; }
.kpp-deal-head h3 { margin:0; font:400 21px "Russo One",sans-serif; color:#1a2744; line-height:1.2; }
.kpp-deal-close { width:38px; height:38px; flex:0 0 auto; border:1px solid #e5e7eb; border-radius:11px; background:#fff; color:#6b7280; font-size:22px; cursor:pointer; display:grid; place-items:center; transition:background .15s,transform .15s; }
.kpp-deal-close:hover { background:#f3f4f6; transform:rotate(5deg); }
.kpp-deal-body { padding:20px 24px 24px; display:flex; flex-direction:column; gap:20px; }
.kpp-deal-target { display:flex; align-items:center; gap:13px; padding:13px; border:1px solid #e3e7ef; border-radius:14px; background:#f8f9fc; }
.kpp-deal-target img { width:62px; height:62px; flex-shrink:0; border-radius:11px; object-fit:cover; }
.kpp-deal-target .ti { font-size:14px; font-weight:600; color:#1a2744; line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.kpp-deal-target .tp { margin-top:4px; font:400 16px "Russo One",sans-serif; color:#375dfb; }
.kpp-deal-label { font:800 12.5px "Exo 2",sans-serif; color:#1a2744; margin-bottom:11px; display:flex; align-items:center; gap:8px; }
.kpp-deal-label span { color:#9ca3af; font-weight:600; }
.kpp-deal-items { display:flex; flex-direction:column; gap:9px; max-height:226px; overflow:auto; padding-right:2px; }
.kpp-deal-item { display:flex; align-items:center; gap:12px; padding:10px 13px; border:1.5px solid #e5e7eb; border-radius:13px; cursor:pointer; transition:border-color .15s,background .15s,box-shadow .15s; text-align:left; background:#fff; }
.kpp-deal-item:hover { border-color:#c7d2fe; background:#f8faff; }
.kpp-deal-item.sel { border-color:#375dfb; background:#f0f4ff; box-shadow:0 0 0 3px rgba(55,93,251,.12); }
.kpp-deal-item img { width:46px; height:46px; flex-shrink:0; border-radius:9px; object-fit:cover; }
.kpp-deal-item .di-title { flex:1; min-width:0; font-size:13px; font-weight:600; color:#1a2744; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.kpp-deal-item .di-price { font:400 14px "Russo One",sans-serif; color:#375dfb; flex-shrink:0; }
.kpp-deal-radio { width:20px; height:20px; flex-shrink:0; border-radius:50%; border:2px solid #cbd5e1; display:grid; place-items:center; transition:border-color .15s; }
.kpp-deal-item.sel .kpp-deal-radio { border-color:#375dfb; }
.kpp-deal-item.sel .kpp-deal-radio::after { content:''; width:10px; height:10px; border-radius:50%; background:#375dfb; }
.kpp-deal-empty { padding:22px 16px; border:1.5px dashed #d4ddf0; border-radius:14px; text-align:center; color:#6b7280; font-size:13px; background:#f8faff; }
.kpp-deal-empty b { display:block; color:#1a2744; font-size:14px; margin-bottom:5px; }
.kpp-deal-field input, .kpp-deal-field textarea { width:100%; padding:12px 14px; border:1.5px solid #e5e7eb; border-radius:12px; font:14px "Exo 2",sans-serif; color:#1a2744; outline:none; box-sizing:border-box; transition:border-color .15s,box-shadow .15s; }
.kpp-deal-field textarea { min-height:84px; resize:vertical; }
.kpp-deal-field input:focus, .kpp-deal-field textarea:focus { border-color:#375dfb; box-shadow:0 0 0 3px rgba(55,93,251,.1); }
.kpp-deal-foot { display:flex; gap:10px; }
.kpp-deal-foot button { flex:1; height:48px; border-radius:12px; font:700 14px "Exo 2",sans-serif; cursor:pointer; transition:transform .15s,box-shadow .15s,background .15s; }
.kpp-deal-cancel { border:1.5px solid #e5e7eb; background:#fff; color:#374151; }
.kpp-deal-cancel:hover { background:#f3f4f6; }
.kpp-deal-submit { border:none; background:linear-gradient(135deg,#2F52F0,#5B7FFF); color:#fff; box-shadow:0 6px 18px rgba(55,93,251,.3); display:flex; align-items:center; justify-content:center; gap:8px; }
.kpp-deal-submit:hover { transform:translateY(-1px); box-shadow:0 10px 26px rgba(55,93,251,.42); }
.kpp-deal-submit:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }

/* объявление принадлежит текущему пользователю */
.kpp-own-note { display:flex; align-items:center; gap:10px; padding:14px 16px; border-radius:13px; background:#fff8ed; border:1px solid #fde9c8; color:#92651b; font-size:13px; line-height:1.5; }
.kpp-own-note svg { flex-shrink:0; color:#f5a623; }
`;

function injectCss() {
  if (document.getElementById('kpp-css')) return;
  const s = document.createElement('style'); s.id = 'kpp-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export function KaptorkaProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ads = useKaptorkaStore((s) => s.ads);
  const incrementViews = useKaptorkaStore((s) => s.incrementViews);
  const incrementMessages = useKaptorkaStore((s) => s.incrementMessages);
  const ad = useMemo(() => ads.find((a) => a.id === Number(id)) ?? null, [ads, id]);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const hasFavorite = useFavoritesStore((s) => s.has);

  const fav = ad ? hasFavorite(ad.id, 'kaptorka') : false;
  const [phoneShown, setPhoneShown] = useState(false);
  const [toast, setToast] = useState('');
  const [zoom, setZoom] = useState({ x: 50, y: 50, active: false });
  const [dealOpen, setDealOpen] = useState(false);
  const [offerItem, setOfferItem] = useState<number | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (dir: number) => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(260, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  injectCss();

  const isOwn = ad?.seller === CURRENT_USER;
  const isExchange = ad?.price === 0;
  // Активные объявления текущего пользователя, которые можно предложить к обмену.
  const myAds = useMemo(
    () => ads.filter((a) => a.seller === CURRENT_USER && a.active !== false && a.id !== ad?.id),
    [ads, ad],
  );

  // Реальный подсчёт просмотров: +1 при каждом открытии карточки.
  useEffect(() => {
    const numId = Number(id);
    if (!Number.isFinite(numId) || !ads.some((a) => a.id === numId)) return;
    const now = Date.now();
    if (lastViewCountAt[numId] && now - lastViewCountAt[numId] < 1500) return;
    lastViewCountAt[numId] = now;
    incrementViews(numId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setPhoneShown(false);
    setZoom({ x: 50, y: 50, active: false });
    setDealOpen(false);
    setOfferItem(null);
    setOfferPrice('');
    setOfferMsg('');
  }, [id]);

  const notify = (t: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(t);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const toggleAdFavorite = () => {
    if (!ad) return;
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
    notify(fav ? 'Убрано из избранного' : 'Добавлено в избранное');
  };

  const canSubmitDeal = isExchange ? offerItem !== null : true;

  const submitDeal = () => {
    if (!ad || !canSubmitDeal) return;
    const s = seller(ad.seller);
    let text: string;
    let image: string | undefined;
    let title: string | undefined;
    if (isExchange) {
      const item = myAds.find((m) => m.id === offerItem);
      title = item?.title;
      image = item?.image;
      text = `Здравствуйте! Предлагаю обмен по объявлению «${ad.title}».\nВзамен готов предложить: «${item?.title}»${item && item.price ? ` — ${item.price.toLocaleString()} ₽` : ''}.`
        + (offerMsg.trim() ? `\n\n${offerMsg.trim()}` : '');
    } else {
      title = ad.title;
      image = ad.image;
      text = `Здравствуйте! Интересует объявление «${ad.title}».\n`
        + (offerPrice.trim() ? `Предлагаю цену: ${Number(offerPrice).toLocaleString()} ₽.` : `Готов обсудить по цене ${ad.price.toLocaleString()} ₽.`)
        + (offerMsg.trim() ? `\n\n${offerMsg.trim()}` : '');
    }
    incrementMessages(ad.id);
    setDealOpen(false);
    setOfferItem(null);
    setOfferPrice('');
    setOfferMsg('');
    // Реально пересылаем предложение в диалог с продавцом из объявления.
    navigate(`/messages?chat=${s.chatId}`, { state: { kaptorkaOffer: { id: Date.now(), chatId: s.chatId, sellerName: ad.seller, text, image, title } } });
  };

  const openDeal = () => {
    setOfferItem(null);
    setOfferPrice('');
    setOfferMsg('');
    setDealOpen(true);
  };

  const similar = useMemo(() => {
    if (!ad) return [];
    const sameCat = ads.filter((a) => a.id !== ad.id && a.active !== false && a.category === ad.category);
    const rest = ads.filter((a) => a.id !== ad.id && a.active !== false && a.category !== ad.category);
    return [...sameCat, ...rest].slice(0, 12);
  }, [ads, ad]);

  if (!ad) {
    return (
      <main className="kpp-page">
        <style>{CSS}</style>
        <div className="kpp-wrap">
          <div className="kpp-missing">
            <h2>Объявление не найдено</h2>
            <p>Возможно, оно было удалено или снято с публикации.</p>
            <button className="kpp-btn kpp-btn-msg" style={{ maxWidth: 280, margin: '0 auto' }} onClick={() => navigate('/kaptorka')}>Вернуться в Каптёрку</button>
          </div>
        </div>
      </main>
    );
  }

  const s = seller(ad.seller);
  const condClass = ad.condition === 'Новое' ? 'green' : ad.condition === 'Отличное' ? 'gold' : 'blue';
  const priceLabel = ad.price ? `${ad.price.toLocaleString()} ₽` : 'Обмен';

  return (
    <main className="kpp-page">
      <style>{CSS}</style>
      <div className="kpp-wrap">
        <PortalBreadcrumb className="kpp-rise" items={[{ label:'Главная', to:'/' }, { label:'Каптёрка', to:'/kaptorka' }, { label:ad.category, to:'/kaptorka' }, { label:ad.title }]} />
        <button className="kpp-back kpp-rise" onClick={() => navigate('/kaptorka')}><IcBack /> Все объявления</button>

        <div className="kpp-grid">
          {/* LEFT */}
          <div>
            <div
              className="kpp-gallery kpp-rise"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, active: true });
              }}
              onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
            >
              <img
                src={ad.image}
                alt={ad.title}
                style={{
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                  transform: zoom.active ? 'scale(1.9)' : 'scale(1)',
                  transition: zoom.active ? 'transform .08s ease-out' : 'transform .35s ease',
                }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = KAPTORKA_SEED_IMAGES[1]; }}
              />
              <div className="kpp-gallery-badges">
                {ad.promoted && <span className="kpp-gbadge top">★ В топе</span>}
                <span className="kpp-gbadge cond">{ad.condition}</span>
              </div>
              <button className={`kpp-gfav${fav ? ' active' : ''}`} onClick={toggleAdFavorite}>
                <IcHeart filled={fav} />
              </button>
              <span className="kpp-views"><IcEye /> {ad.views}</span>
              <span className="kpp-zoomhint"><IcZoom /> Наведите для увеличения</span>
            </div>

            <div className="kpp-card kpp-rise" style={{ animationDelay: '.06s' }}>
              <h3>Описание</h3>
              <p>{ad.desc}</p>
            </div>

            <div className="kpp-card kpp-rise" style={{ animationDelay: '.12s' }}>
              <h3>Характеристики</h3>
              <div className="kpp-specs">
                <div className="kpp-spec"><div className="kpp-spec-l">Категория</div><div className="kpp-spec-v">{ad.category}</div></div>
                <div className="kpp-spec"><div className="kpp-spec-l">Состояние</div><div className="kpp-spec-v">{ad.condition}</div></div>
                <div className="kpp-spec"><div className="kpp-spec-l">Город</div><div className="kpp-spec-v"><IcLocation /> {ad.city}</div></div>
                <div className="kpp-spec"><div className="kpp-spec-l">Просмотры</div><div className="kpp-spec-v"><IcEye /> {ad.views}</div></div>
                <div className="kpp-spec"><div className="kpp-spec-l">Размещено</div><div className="kpp-spec-v">{ad.date}</div></div>
                <div className="kpp-spec"><div className="kpp-spec-l">Продавец</div><div className="kpp-spec-v">{ad.seller}</div></div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="kpp-rail">
            <div className="kpp-rise" style={{ animationDelay: '.05s' }}>
              <h1 className="kpp-title">{ad.title}</h1>
              <div className="kpp-sub">
                <span><IcLocation /> {ad.city}</span>
                <span>{ad.date}</span>
                <span><IcEye /> {ad.views} просмотров</span>
              </div>
            </div>

            <div className="kpp-pricebox kpp-rise" style={{ animationDelay: '.1s' }}>
              {isExchange ? (
                <div className="kpp-price-ex">
                  <span className="kpp-price-ex-icon"><IcSwap /></span>
                  <div className="kpp-price-ex-text">
                    <div className="t">Обмен</div>
                    <div className="s">Автор готов обменять на равноценное снаряжение</div>
                  </div>
                </div>
              ) : (
                <div className="kpp-price">{priceLabel}</div>
              )}
              <div className="kpp-price-badges">
                <span className={`kpp-badge ${condClass}`}>{ad.condition}</span>
                {ad.promoted && <span className="kpp-badge gold">В топе</span>}
                <span className="kpp-badge blue">{ad.category}</span>
              </div>
            </div>

            <div className="kpp-rise" style={{ display: 'flex', flexDirection: 'column', gap: 10, animationDelay: '.15s' }}>
              {isOwn ? (
                <>
                  <div className="kpp-own-note"><IcInfo /> Это ваше объявление — управляйте им в разделе «Мои объявления».</div>
                  <button className="kpp-btn kpp-btn-msg" onClick={() => navigate('/kaptorka')}>Перейти в Каптёрку</button>
                  <button className={`kpp-btn kpp-btn-fav${fav ? ' active' : ''}`} onClick={toggleAdFavorite}><IcHeart filled={fav} /> {fav ? 'В избранном' : 'В избранное'}</button>
                </>
              ) : (
                <>
                  {phoneShown ? (
                    <button className="kpp-btn kpp-btn-phone revealed"><IcPhone /> {ad.phone}</button>
                  ) : (
                    <button className="kpp-btn kpp-btn-phone" onClick={() => setPhoneShown(true)}><IcPhone /> Показать телефон</button>
                  )}
                  <button className="kpp-btn kpp-btn-msg" onClick={() => navigate(`/messages?chat=${s.chatId}`)}><IcMsg /> Написать продавцу</button>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="kpp-btn kpp-btn-buy" style={{ flex: 1 }} onClick={openDeal}>
                      {isExchange ? <><IcSwap /> Предложить обмен</> : 'Купить / договориться'}
                    </button>
                    <button className={`kpp-btn kpp-btn-fav${fav ? ' active' : ''}`} style={{ width: 52, padding: 0 }} onClick={toggleAdFavorite} aria-label="В избранное">
                      <IcHeart filled={fav} />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="kpp-seller kpp-rise" style={{ animationDelay: '.2s' }}>
              <div className="kpp-seller-top kpp-seller-head" onClick={() => navigate(userProfilePath(ad.seller))} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') navigate(userProfilePath(ad.seller)); }}>
                <SellerAvatar name={ad.seller} size={52} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="kpp-seller-name">{s.name}{s.verified && <IcShield />}</div>
                  <div className="kpp-seller-rating"><IcStar /> {s.rating} · {s.reviews} отзывов</div>
                </div>
                <span className="kpp-seller-chev"><IcChev /></span>
              </div>
              <div className="kpp-seller-iv" onClick={(e) => e.stopPropagation()}>
                <IVDisplay index={s.index} rating={s.rating} />
              </div>
              <div className="kpp-seller-stats">
                <div className="kpp-seller-stat"><b>{s.ads}</b><span>Объявлений</span></div>
                <div className="kpp-seller-stat"><b>{s.reviews}</b><span>Отзывов</span></div>
                <div className="kpp-seller-stat"><b>{s.joined}</b><span>На портале</span></div>
              </div>
              <div className="kpp-seller-actions">
                <button className="kpp-seller-action" onClick={() => navigate(userProfilePath(ad.seller))}><IcUser /> Профиль</button>
                <button className="kpp-seller-action" onClick={() => navigate(`/messages?chat=${s.chatId}`)}><IcMsg /> Написать</button>
              </div>
            </div>

            <div className="kpp-safety kpp-rise" style={{ animationDelay: '.25s' }}>
              <b>Безопасная сделка</b>
              Встречайтесь в людных местах, не переводите предоплату и проверяйте товар при встрече.
            </div>
          </aside>
        </div>

        {/* SIMILAR */}
        {similar.length > 0 && (
          <section className="kpp-similar">
            <div className="kpp-similar-head kpp-rise">
              <h2>Похожие объявления</h2>
              <div className="kpp-slider-nav">
                <button onClick={() => scrollSlider(-1)} aria-label="Прокрутить назад"><IcChevBig dir="left" /></button>
                <button onClick={() => scrollSlider(1)} aria-label="Прокрутить вперёд"><IcChevBig dir="right" /></button>
              </div>
            </div>
            <div className="kpp-slider" ref={sliderRef}>
              {similar.map((a, i) => (
                <article key={a.id} className="kpp-scard kpp-rise" style={{ animationDelay: `${0.06 * i}s` }} onClick={() => navigate(`/kaptorka/${a.id}`)}>
                  <div className="kpp-scard-img"><img src={a.image} alt={a.title} onError={(e) => { (e.currentTarget as HTMLImageElement).src = KAPTORKA_SEED_IMAGES[1]; }} /></div>
                  <div className="kpp-scard-body">
                    <div className={`kpp-scard-price${a.price === 0 ? ' exchange' : ''}`}>{a.price ? `${a.price.toLocaleString()} ₽` : 'Обмен'}</div>
                    <div className="kpp-scard-title">{a.title}</div>
                    <div className="kpp-scard-meta"><IcLocation size={11} /> {a.city} · {a.date}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {dealOpen && ad && (
        <div className="kpp-deal-backdrop" onClick={() => setDealOpen(false)}>
          <div className="kpp-deal" onClick={(e) => e.stopPropagation()}>
            <div className="kpp-deal-head">
              <div>
                <div className="kicker">{isExchange ? 'Обмен снаряжением' : 'Предложение сделки'}</div>
                <h3>{isExchange ? 'Предложить обмен' : 'Купить или договориться'}</h3>
              </div>
              <button className="kpp-deal-close" onClick={() => setDealOpen(false)} aria-label="Закрыть">×</button>
            </div>
            <div className="kpp-deal-body">
              <div className="kpp-deal-target">
                <img src={ad.image} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).src = KAPTORKA_SEED_IMAGES[1]; }} />
                <div style={{ minWidth: 0 }}>
                  <div className="ti">{ad.title}</div>
                  <div className="tp">{priceLabel}</div>
                </div>
              </div>

              {isExchange ? (
                <div>
                  <div className="kpp-deal-label">Что предлагаете взамен? <span>выберите своё объявление</span></div>
                  {myAds.length ? (
                    <div className="kpp-deal-items">
                      {myAds.map((m: KaptorkaAd) => (
                        <button key={m.id} className={`kpp-deal-item${offerItem === m.id ? ' sel' : ''}`} onClick={() => setOfferItem(m.id)}>
                          <img src={m.image} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).src = KAPTORKA_SEED_IMAGES[1]; }} />
                          <span className="di-title">{m.title}</span>
                          <span className="di-price">{m.price ? `${m.price.toLocaleString()} ₽` : 'Обмен'}</span>
                          <span className="kpp-deal-radio" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="kpp-deal-empty">
                      <b>У вас нет активных объявлений</b>
                      Разместите своё снаряжение, чтобы предложить его к обмену.
                      <div style={{ marginTop: 12 }}>
                        <button className="kpp-btn kpp-btn-msg" style={{ height: 42 }} onClick={() => navigate('/kaptorka?create=1')}>Разместить объявление</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="kpp-deal-field">
                  <div className="kpp-deal-label">Ваше предложение по цене <span>необязательно</span></div>
                  <input type="number" min="0" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder={`${ad.price.toLocaleString()} ₽ — предложите свою`} />
                </div>
              )}

              <div className="kpp-deal-field">
                <div className="kpp-deal-label">Сообщение продавцу <span>необязательно</span></div>
                <textarea value={offerMsg} onChange={(e) => setOfferMsg(e.target.value)} placeholder={isExchange ? 'Опишите состояние своего снаряжения, удобное место и время встречи' : 'Уточните детали, удобное время и место сделки'} />
              </div>

              <div className="kpp-deal-foot">
                <button className="kpp-deal-cancel" onClick={() => setDealOpen(false)}>Отмена</button>
                <button className="kpp-deal-submit" disabled={!canSubmitDeal} onClick={submitDeal}><IcMsg /> Отправить продавцу</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="kpp-toast">{toast}</div>}
    </main>
  );
}
