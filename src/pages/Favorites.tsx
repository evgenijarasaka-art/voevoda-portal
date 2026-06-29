import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavoritesStore, FavItem, FavArticle, FavCourse, FavMarket, FavKaptorka } from '../store/useFavoritesStore';
import { SELLERS, useKaptorkaStore } from '../store/useKaptorkaStore';
import { useCartStore } from '../store/useCartStore';

const FAV_CSS = `
  :root { --fav-blue:#375DFB; --fav-blue-dark:#2448D8; --fav-ink:#172033; --fav-muted:#697386; --fav-line:#DDE3EC; --fav-green:#0EAD78; }
  @keyframes cardEnter { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideOutRight { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(20px)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .fav-card-enter { animation:cardEnter 0.25s ease both; }
  .fav-grid { grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-auto-rows:1fr;align-items:stretch!important; }
  .fav-card { min-width:0;height:100%;background:#fff!important;border:1px solid var(--fav-line)!important;border-radius:16px!important;box-shadow:0 2px 5px rgba(23,32,51,.04);transition:box-shadow .28s ease,transform .28s ease,border-color .28s ease,opacity .3s;isolation:isolate; }
  .fav-card > div:first-child { height:168px!important; }
  .fav-card > div:first-child img { transition:transform .5s cubic-bezier(.2,.75,.25,1),filter .3s ease; }
  .fav-card:hover > div:first-child img { transform:scale(1.035); }
  .fav-card-body { display:flex;flex:1;flex-direction:column;gap:6px;padding:14px 16px 16px!important; }
  .fav-card-title { min-height:42px;display:block;overflow:visible;overflow-wrap:anywhere;word-break:normal;color:var(--fav-ink)!important;line-height:1.38!important;transition:color .2s ease; }
  .fav-course-details { min-height:38px;display:flex;flex-wrap:wrap;align-content:flex-start;gap:4px 7px;color:#6B7280;font-size:12px;line-height:1.4; }
  .fav-course-details span:not(:last-child)::after { content:'•';margin-left:7px;color:#C1C7D0; }
  .fav-card:hover .fav-card-title { color:var(--fav-blue)!important; }
  .fav-card-footer { display:flex;flex-direction:column;gap:7px;margin-top:auto;padding-top:5px; }
  .fav-card-primary { display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:44px!important;min-height:44px!important;box-sizing:border-box!important;padding:0 14px!important;border-radius:8px!important;line-height:1.15!important;font-size:14px!important;font-weight:600!important;letter-spacing:0;white-space:nowrap;box-shadow:none;transition:transform .2s ease,box-shadow .2s ease,background-color .2s ease,color .2s ease,border-color .2s ease; }
  .fav-card-primary--blue { background:#375DFB!important;color:#fff!important;border:none!important; }
  .fav-card-primary--blue:hover { background:#1E3F9F!important;transform:translateY(-2px);box-shadow:0 8px 18px rgba(23,32,51,.18); }
  .fav-card-primary--green:hover { background:#087E59!important;transform:translateY(-2px);box-shadow:0 8px 18px rgba(23,32,51,.16); }
  .fav-card-primary--outline:hover { background:#375DFB!important;color:#fff!important;border-color:#375DFB!important;transform:translateY(-2px);box-shadow:0 8px 18px rgba(23,32,51,.14); }
  .fav-card-primary:active { transform:translateY(0)!important;box-shadow:none!important; }
  .fav-card-primary:focus-visible,.fav-card-remove:focus-visible,.fav-action-btn:focus-visible,.fav-view-btn:focus-visible,.fav-tab-btn:focus-visible { outline:3px solid rgba(55,93,251,.24);outline-offset:2px; }
  .fav-card:hover { border-color:#fff!important;box-shadow:0 0 0 4px #fff,0 14px 32px rgba(255,255,255,.92)!important;transform:translateY(-4px); }
  .fav-card.removing { opacity:0; pointer-events:none; }
  .fav-card:hover .fav-card-actions { opacity:1; transform:translateY(0); }
  .fav-card-actions { opacity:0; transform:translateY(8px); transition:opacity .22s ease,transform .22s ease; }
  .fav-list-row { position:relative;z-index:1;transition:background .18s ease,transform .18s ease,box-shadow .18s ease; }
  .fav-list-row:hover { z-index:2;background:#fff !important;transform:translateY(-2px);box-shadow:0 8px 22px rgba(23,32,51,.07); }
  .fav-list-row--menu-open { z-index:200!important; }
  .fav-list-row--course { display:grid!important;grid-template-columns:80px minmax(220px,1fr) 120px 90px 176px 180px 34px;align-items:center!important;gap:16px!important;min-height:88px;padding:12px 8px!important; }
  .fav-course-cell { min-width:0; }
  .fav-course-cell--price { width:100%; }
  .fav-course-cell--date { text-align:center;white-space:nowrap; }
  .fav-course-cell--action { width:176px;height:42px;padding:0 16px!important;border:none;border-radius:8px!important;color:#fff;font-size:13px!important;font-weight:600!important;cursor:pointer;white-space:nowrap;transition:background-color .2s ease,transform .2s ease,box-shadow .2s ease!important; }
  .fav-course-cell--action:hover { transform:translateY(-2px);box-shadow:0 8px 18px rgba(23,32,51,.16)!important; }
  .fav-course-cell--action.is-blue:hover { background:#1E3F9F!important; }
  .fav-course-cell--action.is-green:hover { background:#087E59!important; }
  .fav-course-cell--saved { overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
  .fav-dots-menu { position:relative;z-index:1;justify-self:end; }
  .fav-dots-menu.is-open { z-index:201; }
  .fav-dots-panel { animation:favMenuIn .16s ease both; }
  @keyframes favMenuIn { from{opacity:0;transform:translateY(-4px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
  .fav-action-btn { position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:rgba(255,255,255,.94);border:1px solid rgba(221,227,236,.95);border-radius:9px;cursor:pointer;color:#375DFB;box-shadow:0 5px 14px rgba(23,32,51,.12);transition:background .18s ease,color .18s ease,transform .18s ease,box-shadow .18s ease; }
  .fav-action-btn:hover { background:#375DFB;color:#fff;transform:translateY(-3px) scale(1.04);box-shadow:0 8px 18px rgba(23,32,51,.18); }
  .fav-action-btn .fav-tooltip { position:absolute;bottom:calc(100%+6px);left:50%;transform:translateX(-50%);background:rgba(0,0,0,.8);color:#fff;font-size:11px;padding:3px 8px;border-radius:4px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .15s; }
  .fav-action-btn:hover .fav-tooltip { opacity:1; }
  .fav-progress-fill { transition:width .6s ease; }
  .fav-toast { animation:slideInRight .25s ease; }
  .fav-toast.leaving { animation:slideOutRight .25s ease forwards; }
  .fav-sort-native { position:absolute;opacity:0;top:0;left:0;width:100%;height:100%;cursor:pointer; }
  .fav-view-btn { transition:all .15s; }
  .fav-view-btn.active { background:#fff;color:#375DFB;box-shadow:0 1px 3px rgba(0,0,0,.08); }
  .fav-card-remove { transition:transform .18s ease,background .18s ease,box-shadow .18s ease; }
  .fav-card-remove:hover { transform:scale(1.1) rotate(-5deg);background:#fff!important;box-shadow:0 6px 14px rgba(23,32,51,.16)!important; }
  .fav-card-badge { transition:transform .2s ease,box-shadow .2s ease; }
  .fav-card:hover .fav-card-badge { transform:translateY(2px);box-shadow:0 4px 10px rgba(23,32,51,.12); }
  .fav-tab-btn,.fav-view-btn { transition:transform .18s ease,background .18s ease,color .18s ease,box-shadow .18s ease!important; }
  .fav-tab-btn:hover,.fav-view-btn:hover { transform:translateY(-1px);color:#375DFB!important; }
  .fav-list-row > button { transition:transform .18s ease,background-color .18s ease,box-shadow .18s ease!important; }
  .fav-list-row > button:hover { transform:translateY(-2px);box-shadow:0 6px 14px rgba(23,32,51,.13); }
  .fav-dots-item:hover { background:#F3F4F6; }
  .fav-sort-row { transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease; }
  .fav-sort-row:hover { border-color:#D1D5DB !important;box-shadow:0 5px 14px rgba(23,32,51,.07);transform:translateY(-1px); }
  @media (max-width:1180px) { .fav-grid { grid-template-columns:repeat(3,minmax(0,1fr))!important; } }
  @media (max-width:1020px) { .fav-grid { grid-template-columns:repeat(2,minmax(0,1fr))!important; } }
  @media (max-width:1180px) {
    .fav-list-row--course { grid-template-columns:72px minmax(190px,1fr) 100px 82px 150px 34px; }
    .fav-list-row--course .fav-course-cell--saved { display:none; }
    .fav-course-cell--action { width:150px; }
  }
  @media (max-width:680px) {
    .fav-grid { grid-template-columns:1fr!important; }
    .fav-card > div:first-child { height:158px!important; }
  }
`;
function injectFavCss() {
  const existing = document.getElementById('fav-page-css');
  if (existing) {
    existing.textContent = FAV_CSS;
    return;
  }
  const s = document.createElement('style'); s.id = 'fav-page-css'; s.textContent = FAV_CSS;
  document.head.appendChild(s);
}

type TabKey = 'articles' | 'courses' | 'market' | 'kaptorka';
type ViewMode = 'grid' | 'list';
type SortKey = 'date-added' | 'price-asc' | 'price-desc' | 'alpha' | 'views' | 'date-pub' | 'start-date' | 'discount' | 'date-listing';

const SORT_OPTIONS: Record<TabKey, { value: SortKey; label: string }[]> = {
  articles: [
    { value: 'date-added', label: 'По дате добавления' },
    { value: 'date-pub',   label: 'По дате публикации' },
    { value: 'alpha',      label: 'По алфавиту (А→Я)' },
    { value: 'views',      label: 'По популярности' },
  ],
  courses: [
    { value: 'date-added', label: 'По дате добавления' },
    { value: 'price-asc',  label: 'По цене (дешевле)' },
    { value: 'price-desc', label: 'По цене (дороже)' },
    { value: 'alpha',      label: 'По алфавиту' },
    { value: 'start-date', label: 'По дате старта' },
  ],
  market: [
    { value: 'date-added', label: 'По дате добавления' },
    { value: 'price-asc',  label: 'По цене (дешевле)' },
    { value: 'price-desc', label: 'По цене (дороже)' },
    { value: 'alpha',      label: 'По алфавиту' },
    { value: 'discount',   label: 'По скидке' },
  ],
  kaptorka: [
    { value: 'date-added',   label: 'По дате добавления' },
    { value: 'price-asc',    label: 'По цене (дешевле)' },
    { value: 'price-desc',   label: 'По цене (дороже)' },
    { value: 'date-listing', label: 'По дате объявления' },
  ],
};

const TAB_LABELS: Record<TabKey, string> = {
  articles: 'Статьи', courses: 'Обучение', market: 'Военмаркет', kaptorka: 'Каптёрка',
};
const ROUTE_MAP: Record<TabKey, string> = {
  articles: '/journal', courses: '/courses', market: '/market', kaptorka: '/kaptorka',
};

function courseOpenPath(item: FavCourse) {
  return item.purchased ? '/my-courses/razvedka/progress' : '/courses/razvedka';
}

function savedText(days?: number) {
  if (!days) return '';
  if (days === 1) return 'Добавлено 1 день назад';
  if (days < 5) return `Добавлено ${days} дня назад`;
  return `Добавлено ${days} дней назад`;
}

function sortItems(items: FavItem[], sort: SortKey): FavItem[] {
  const arr = [...items];
  if (sort === 'date-added') return arr.sort((a, b) => (a.savedDaysAgo ?? 99) - (b.savedDaysAgo ?? 99));
  if (sort === 'price-asc')  return arr.sort((a, b) => ((a as FavCourse).price ?? 0) - ((b as FavCourse).price ?? 0));
  if (sort === 'price-desc') return arr.sort((a, b) => ((b as FavCourse).price ?? 0) - ((a as FavCourse).price ?? 0));
  if (sort === 'alpha')      return arr.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  if (sort === 'views')      return arr.sort((a, b) => ((b as FavArticle).stats?.views ?? 0) - ((a as FavArticle).stats?.views ?? 0));
  if (sort === 'start-date') return arr.sort((a, b) => ((a as FavCourse).startDate ?? '').localeCompare((b as FavCourse).startDate ?? ''));
  if (sort === 'discount')   return arr.sort((a, b) => {
    const am = a as FavMarket, bm = b as FavMarket;
    return ((bm.oldPrice ?? bm.price) - bm.price) - ((am.oldPrice ?? am.price) - am.price);
  });
  if (sort === 'date-listing') return arr.sort((a, b) => ((a as FavKaptorka).listedHoursAgo ?? 99) - ((b as FavKaptorka).listedHoursAgo ?? 99));
  return arr;
}

/* ─── CardImage — показывает item.image или fallback-заглушку ── */
function CardImage({ src, height, grayscale, small }: { src: string; height: number; grayscale?: boolean; small?: boolean }) {
  const [err, setErr] = useState(false);
  const w = small ? (height === 60 ? 80 : 64) : '100%';
  const h = small ? height : '100%';
  const imageSrc = src || '/journal-main.jpg';
  return (
    <div style={{ width: w, height: h, background: '#F3F4F6', overflow: 'hidden', borderRadius: small ? 8 : 0, filter: grayscale ? 'grayscale(1) opacity(.6)' : undefined, flexShrink: 0 }}>
      {!err
        ? <img src={imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setErr(true)} />
        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#EAF1FF,#F8FAFC)', display: 'grid', placeItems: 'center' }}>
            <svg width={small ? 26 : 44} height={small ? 26 : 44} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="m8 14 2.4-2.4a2 2 0 0 1 2.8 0L18 16" />
              <circle cx="8.5" cy="8.5" r="1.5" />
            </svg>
          </div>}
    </div>
  );
}

function openArticle(navigate: ReturnType<typeof useNavigate>, item: FavArticle) {
  if (item.available === false) {
    navigate('/journal');
    return;
  }
  if (item.link) {
    navigate(item.link);
    return;
  }
  navigate(`/journal/${item.id}`, { state: { returnTo: '/favorites' } });
}

/* ─── TOAST ── */
type ToastData = { msg: string; action?: string; onAction?: () => void; id: number };
let toastIdSeq = 0;

function Toast({ data, onDismiss }: { data: ToastData; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.classList.add('leaving');
      setTimeout(onDismiss, 250);
    }, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div ref={ref} className="fav-toast" style={{ position: 'fixed', bottom: 24, right: 24, background: '#375DFB', color: '#fff', borderRadius: 12, padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,.2)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, zIndex: 2000, maxWidth: 340 }}>
      <span style={{ flex: 1 }}>{data.msg}</span>
      {data.action && data.onAction && (
        <button onClick={() => { data.onAction!(); onDismiss(); }} style={{ border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>{data.action}</button>
      )}
    </div>
  );
}

/* ─── DOTS MENU ── */
function DotsMenu({ items }: { items: { label: string; danger?: boolean; onClick: () => void }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  useEffect(() => {
    const row = ref.current?.closest('.fav-list-row');
    row?.classList.toggle('fav-list-row--menu-open', open);
    return () => row?.classList.remove('fav-list-row--menu-open');
  }, [open]);
  return (
    <div ref={ref} className={`fav-dots-menu${open ? ' is-open' : ''}`} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} style={{ width: 30, height: 30, border: 'none', background: 'transparent', color: '#9CA3AF', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }} onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="3" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="8" cy="13" r="1.5" /></svg>
      </button>
      {open && (
        <div className="fav-dots-panel" style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 12px 30px rgba(23,32,51,.16)', minWidth: 160, zIndex: 202, overflow: 'hidden' }}>
          {items.map((it, i) => (
            <div key={i} className="fav-dots-item" onClick={e => { e.stopPropagation(); it.onClick(); setOpen(false); }} style={{ padding: '9px 14px', fontSize: 13, color: it.danger ? '#EF4444' : '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>{it.label}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── HOVER OVERLAY ACTIONS ── */
function CardActions({ actions }: { actions: { icon: React.ReactNode; label: string; onClick: (e: React.MouseEvent) => void }[] }) {
  return (
    <div className="fav-card-actions" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.78) 52%,rgba(255,255,255,.98) 100%)', padding: '34px 8px 10px', display: 'flex', gap: 8, justifyContent: 'center' }}>
      {actions.map((a, i) => (
        <button key={i} className="fav-action-btn" onClick={e => { e.stopPropagation(); a.onClick(e); }}>
          {a.icon}
          <span className="fav-tooltip">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── REMOVE HEART ── */
function RemoveHeart({ unavailable, onClick }: { unavailable: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button className="fav-card-remove" onClick={onClick} style={{ position: 'absolute', top: 8, right: 8, zIndex: 3, width: 28, height: 28, border: 'none', background: 'rgba(255,255,255,.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.15)' }}>
      <svg width="13" height="13" fill={unavailable ? 'none' : '#EF4444'} stroke={unavailable ? '#9CA3AF' : '#EF4444'} strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" opacity={unavailable ? 0.4 : 1} /></svg>
    </button>
  );
}

/* ─── BADGE ── */
function CardBadge({ label, color, bg, right }: { label: string; color: string; bg: string; right?: boolean }) {
  return <span className="fav-card-badge" style={{ position: 'absolute', zIndex: 2, top: 10, [right ? 'right' : 'left']: right ? 40 : 10, background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, letterSpacing: '0.3px', textTransform: 'uppercase' as const }}>{label}</span>;
}

/* ─── ICONS ── */
const IcoFolder   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
const IcoShare    = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
const IcoCart     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
const IcoTrash    = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>;
const IcoChat     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IcoEye      = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const IcoComment  = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IcoHeart    = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
const IcoGrid     = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>;
const IcoList     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
const IcoChevDown = () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>;

/* ────────────────────────────────────────────────────────────────────────────
   ARTICLE CARDS
──────────────────────────────────────────────────────────────────────────── */
function ArticleCard({ item, onRemove, onShare, idx }: { item: FavArticle; onRemove: () => void; onShare: () => void; idx: number }) {
  const unavail = item.available === false;
  const navigate = useNavigate();
  return (
    <div className="fav-card fav-card-enter" onClick={() => openArticle(navigate, item)} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative', animationDelay: `${idx * 40}ms` }}>
      <div style={{ position: 'relative', height: 160, background: '#F3F4F6', flexShrink: 0, overflow: 'hidden' }}>
        <CardImage src={item.image} height={160} grayscale={unavail} />
        {item.category && <CardBadge label={item.category} bg="#375DFB" color="#fff" />}
        {unavail && <CardBadge label="Недоступно" bg="#EF4444" color="#fff" right />}
        <RemoveHeart unavailable={unavail} onClick={e => { e.stopPropagation(); onRemove(); }} />
        {!unavail && (
          <CardActions actions={[
            { icon: <IcoFolder />, label: 'В папку', onClick: e => { e.stopPropagation(); navigate('/favorites'); } },
            { icon: <IcoShare />, label: 'Поделиться', onClick: e => { e.stopPropagation(); onShare(); } },
            { icon: <IcoTrash />, label: 'Удалить', onClick: e => { e.stopPropagation(); onRemove(); } },
          ]} />
        )}
      </div>
      <div className="fav-card-body">
        <div className="fav-card-title" style={{ fontSize: 15, fontWeight: 600, color: unavail ? '#9CA3AF' : '#111', lineHeight: 1.4 }}>{item.title}</div>
        {unavail
          ? <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Статья больше не доступна</div>
          : <div style={{ fontSize: 13, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>Материал по теме {(item.category ?? 'военное дело').toLowerCase()}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#375DFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{item.author.charAt(0)}</div>
          <span>{item.author}</span>
          <span style={{ color: '#9CA3AF' }}>•</span>
          <span>{item.date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#9CA3AF' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IcoEye /> {item.stats.views}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IcoComment /> {item.stats.comments ?? 0}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IcoHeart /> {item.stats.hearts}</span>
        </div>
        <div className="fav-card-footer">
          {item.savedDaysAgo && <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>{savedText(item.savedDaysAgo)}</div>}
          {unavail
            ? <button className="fav-card-primary fav-card-primary--outline" onClick={e => { e.stopPropagation(); navigate('/journal'); }} style={{ border: '1px solid #375DFB', background: 'transparent', color: '#375DFB', cursor: 'pointer' }}>Найти похожее →</button>
            : <button className="fav-card-primary fav-card-primary--blue" onClick={e => { e.stopPropagation(); openArticle(navigate, item); }} style={{ border: 'none', background: '#375DFB', color: '#fff', cursor: 'pointer' }}>Открыть статью →</button>}
        </div>
      </div>
    </div>
  );
}

function ArticleRow({ item, onRemove, onShare, idx }: { item: FavArticle; onRemove: () => void; onShare: () => void; idx: number }) {
  const unavail = item.available === false;
  const navigate = useNavigate();
  return (
    <div className="fav-list-row fav-card-enter" onClick={() => openArticle(navigate, item)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid #E5E7EB', cursor: 'pointer', animationDelay: `${idx * 40}ms` }}>
      <CardImage src={item.image} height={60} grayscale={unavail} small />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: unavail ? '#9CA3AF' : '#111', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>{item.title}</div>
        <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}><span>{item.author}</span><span>•</span><span>{item.date}</span></div>
      </div>
      <div style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><IcoEye /> {item.stats.views}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><IcoComment /> {item.stats.comments ?? 0}</span>
      </div>
      <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{savedText(item.savedDaysAgo)}</div>
      <DotsMenu items={[
        { label: 'Поделиться', onClick: onShare },
        { label: 'Удалить', danger: true, onClick: onRemove },
      ]} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   COURSE CARDS
──────────────────────────────────────────────────────────────────────────── */
function CourseCard({ item, onRemove, onShare, onCart, navigate, idx }: { item: FavCourse; onRemove: () => void; onShare: () => void; onCart: () => void; navigate: (p: string) => void; idx: number }) {
  const unavail = item.available === false;
  if (item.purchased) {
    return (
      <div className="fav-card fav-card-enter" onClick={() => navigate(courseOpenPath(item))} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative', animationDelay: `${idx * 40}ms` }}>
        <div style={{ position: 'relative', height: 160, background: '#F3F4F6', flexShrink: 0, overflow: 'hidden' }}>
          <CardImage src={item.image} height={160} />
          <CardBadge label="Куплено" bg="#10B981" color="#fff" />
          <RemoveHeart unavailable={false} onClick={e => { e.stopPropagation(); onRemove(); }} />
          <CardActions actions={[
            { icon: <IcoShare />, label: 'Поделиться', onClick: e => { e.stopPropagation(); onShare(); } },
            { icon: <IcoTrash />, label: 'Удалить', onClick: e => { e.stopPropagation(); onRemove(); } },
          ]} />
        </div>
      <div className="fav-card-body" style={{ gap: 7 }}>
          <div className="fav-card-title" style={{ fontSize: 15, fontWeight: 600, color: '#111', lineHeight: 1.4 }}>{item.title}</div>
          <div className="fav-course-details"><span>{item.city}</span><span>{item.duration}</span><span>{item.format}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280' }}><span>Прогресс обучения</span><span style={{ fontWeight: 600, color: '#10B981' }}>40%</span></div>
          <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}><div className="fav-progress-fill" style={{ height: '100%', background: '#10B981', borderRadius: 3, width: '40%' }} /></div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>8 из 20 уроков · занятие 12 апреля</div>
          <div className="fav-card-footer">
            <button className="fav-card-primary fav-card-primary--green" onClick={e => { e.stopPropagation(); navigate(courseOpenPath(item)); }} style={{ padding: '9px 12px', border: 'none', borderRadius: 8, background: '#10B981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Продолжить обучение →</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="fav-card fav-card-enter" onClick={() => navigate(courseOpenPath(item))} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative', animationDelay: `${idx * 40}ms` }}>
      <div style={{ position: 'relative', height: 160, background: '#F3F4F6', flexShrink: 0, overflow: 'hidden' }}>
        <CardImage src={item.image} height={160} grayscale={unavail} />
        <CardBadge label={item.city} bg="rgba(55,93,251,.85)" color="#fff" />
        <CardBadge label={item.duration} bg="rgba(16,185,129,.94)" color="#FFFFFF" right />
        <RemoveHeart unavailable={unavail} onClick={e => { e.stopPropagation(); onRemove(); }} />
        {!unavail && (
          <CardActions actions={[
            { icon: <IcoShare />, label: 'Поделиться', onClick: e => { e.stopPropagation(); onShare(); } },
            { icon: <IcoCart />, label: 'В корзину', onClick: e => { e.stopPropagation(); onCart(); } },
            { icon: <IcoTrash />, label: 'Удалить', onClick: e => { e.stopPropagation(); onRemove(); } },
          ]} />
        )}
      </div>
      <div className="fav-card-body">
        <div className="fav-card-title" style={{ fontSize: 15, fontWeight: 600, color: '#111', lineHeight: 1.4 }}>{item.title}</div>
        <div className="fav-course-details"><span>{item.city}</span><span>{item.duration}</span><span>{item.format}</span></div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>{item.price.toLocaleString('ru')} ₽</div>
        {item.startDate && <div style={{ fontSize: 13, color: '#6B7280' }}>Старт: {item.startDate}</div>}
        {item.spotsLeft !== undefined && <div style={{ fontSize: 13, color: item.spotsLeft < 5 ? '#EF4444' : '#6B7280', fontWeight: item.spotsLeft < 5 ? 500 : 400 }}>Осталось мест: {item.spotsLeft}</div>}
        <div className="fav-card-footer">
          {item.savedDaysAgo && <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>{savedText(item.savedDaysAgo)}</div>}
          <button className="fav-card-primary fav-card-primary--blue" onClick={e => { e.stopPropagation(); onCart(); }} style={{ padding: '9px 12px', border: 'none', borderRadius: 8, background: '#375DFB', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Записаться и оплатить →</button>
        </div>
      </div>
    </div>
  );
}

function CourseRow({ item, onRemove, onShare, onCart, idx }: { item: FavCourse; onRemove: () => void; onShare: () => void; onCart: () => void; idx: number }) {
  const navigate = useNavigate();
  return (
    <div className="fav-list-row fav-list-row--course fav-card-enter" onClick={() => navigate(courseOpenPath(item))} style={{ borderBottom: '1px solid #E5E7EB', cursor: 'pointer', animationDelay: `${idx * 40}ms` }}>
      <CardImage src={item.image} height={60} small />
      <div className="fav-course-cell" style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
        <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', gap: 6, marginTop: 3 }}><span>{item.city}</span><span>•</span><span>{item.duration}</span></div>
      </div>
      {item.purchased
        ? <div className="fav-course-cell fav-course-cell--price" style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 3 }}>40%</div>
            <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', background: '#10B981', borderRadius: 3, width: '40%' }} /></div>
          </div>
        : <div className="fav-course-cell fav-course-cell--price" style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{item.price.toLocaleString('ru')} ₽</div>}
      <div className="fav-course-cell fav-course-cell--date" style={{ fontSize: 12, color: '#6B7280' }}>{item.startDate || '—'}</div>
      <button className={`fav-course-cell--action ${item.purchased ? 'is-green' : 'is-blue'}`} onClick={e => { e.stopPropagation(); if (item.purchased) navigate(courseOpenPath(item)); else onCart(); }} style={{ background: item.purchased ? '#10B981' : '#375DFB' }}>{item.purchased ? 'Продолжить' : 'Записаться →'}</button>
      <div className="fav-course-cell fav-course-cell--saved" style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>{savedText(item.savedDaysAgo)}</div>
      <DotsMenu items={[
        { label: 'Поделиться', onClick: onShare },
        { label: 'В корзину', onClick: onCart },
        { label: 'Удалить', danger: true, onClick: onRemove },
      ]} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   MARKET CARDS
──────────────────────────────────────────────────────────────────────────── */
function MarketCard({ item, onRemove, onShare, onCart, onFindSimilar, idx }: { item: FavMarket; onRemove: () => void; onShare: () => void; onCart: () => void; onFindSimilar: () => void; idx: number }) {
  const unavail = item.available === false;
  const hasDiscount = item.oldPrice && item.oldPrice > item.price;
  const pct = hasDiscount ? Math.round((1 - item.price / item.oldPrice!) * 100) : 0;
  const navigate = useNavigate();
  return (
    <div className="fav-card fav-card-enter" onClick={() => navigate('/market')} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative', animationDelay: `${idx * 40}ms` }}>
      <div style={{ position: 'relative', height: 180, background: '#F3F4F6', flexShrink: 0, overflow: 'hidden' }}>
        <CardImage src={item.image} height={180} grayscale={unavail} />
        {unavail && <CardBadge label="Недоступно" bg="#EF4444" color="#fff" />}
        {hasDiscount && !unavail && <CardBadge label={`−${pct}%`} bg="#EF4444" color="#fff" />}
        <RemoveHeart unavailable={unavail} onClick={e => { e.stopPropagation(); onRemove(); }} />
        {!unavail && (
          <CardActions actions={[
            { icon: <IcoShare />, label: 'Поделиться', onClick: e => { e.stopPropagation(); onShare(); } },
            { icon: <IcoCart />, label: 'В корзину', onClick: e => { e.stopPropagation(); onCart(); } },
            { icon: <IcoTrash />, label: 'Удалить', onClick: e => { e.stopPropagation(); onRemove(); } },
          ]} />
        )}
      </div>
      <div className="fav-card-body">
        <div className="fav-card-title" style={{ fontSize: 15, fontWeight: 600, color: unavail ? '#9CA3AF' : '#111', lineHeight: 1.4 }}>{item.title}</div>
        <div style={{ fontSize: 13, color: '#9CA3AF', overflowWrap:'anywhere', lineHeight:1.4 }}>{item.brand}{item.size ? ` · Размер ${item.size}` : ''}</div>
        {unavail
          ? <>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#9CA3AF' }}>Последняя цена: {item.price.toLocaleString('ru')} ₽</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>Нет в наличии</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Товар больше не продаётся</div>
              <div className="fav-card-footer">
                <button className="fav-card-primary fav-card-primary--outline" onClick={e => { e.stopPropagation(); onFindSimilar(); }} style={{ padding: '9px 12px', border: '1px solid #375DFB', borderRadius: 8, background: 'transparent', color: '#375DFB', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Найти похожее →</button>
              </div>
            </>
          : <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{item.price.toLocaleString('ru')} ₽</span>
                {hasDiscount && <span style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through' }}>{item.oldPrice!.toLocaleString('ru')} ₽</span>}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: item.inStock !== false ? '#10B981' : '#EF4444' }}>{item.inStock !== false ? 'В наличии' : 'Нет в наличии'}</div>
              <div className="fav-card-footer">
                {item.savedDaysAgo && <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>{savedText(item.savedDaysAgo)}</div>}
                <button className="fav-card-primary fav-card-primary--blue" onClick={e => { e.stopPropagation(); onCart(); }} style={{ padding: '9px 12px', border: 'none', borderRadius: 8, background: '#375DFB', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>В корзину</button>
              </div>
            </>}
      </div>
    </div>
  );
}

function MarketRow({ item, onRemove, onShare, onCart, onFindSimilar, idx }: { item: FavMarket; onRemove: () => void; onShare: () => void; onCart: () => void; onFindSimilar: () => void; idx: number }) {
  const unavail = item.available === false;
  const hasDiscount = item.oldPrice && item.oldPrice > item.price;
  const navigate = useNavigate();
  return (
    <div className="fav-list-row fav-card-enter" onClick={() => navigate('/market')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid #E5E7EB', cursor: 'pointer', animationDelay: `${idx * 40}ms` }}>
      <CardImage src={item.image} height={60} grayscale={unavail} small />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: unavail ? '#9CA3AF' : '#375DFB' }}>{item.title}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{item.brand}{item.size ? ` • Размер ${item.size}` : ''}</div>
      </div>
      <div style={{ minWidth: 90, flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{unavail ? '—' : `${item.price.toLocaleString('ru')} ₽`}</div>
        {hasDiscount && !unavail && <div style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through' }}>{item.oldPrice!.toLocaleString('ru')} ₽</div>}
      </div>
      <div style={{ flexShrink: 0 }}>
        <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: unavail ? 'rgba(229,57,53,.1)' : 'rgba(29,158,117,.1)', color: unavail ? '#EF4444' : '#10B981' }}>{unavail ? 'Недоступно' : 'В наличии'}</span>
      </div>
      {unavail
        ? <button onClick={e => { e.stopPropagation(); onFindSimilar(); }} style={{ padding: '6px 14px', border: '1px solid #375DFB', background: 'transparent', color: '#375DFB', fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}>Найти похожее</button>
        : <button onClick={e => { e.stopPropagation(); onCart(); }} style={{ padding: '6px 14px', border: 'none', background: '#375DFB', color: '#fff', fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}>В корзину</button>}
      <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{savedText(item.savedDaysAgo)}</div>
      <DotsMenu items={[
        ...(!unavail ? [{ label: 'В корзину', onClick: onCart }] : []),
        { label: 'Поделиться', onClick: onShare },
        { label: 'Удалить', danger: true, onClick: onRemove },
      ]} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   KAPTORKA CARDS
──────────────────────────────────────────────────────────────────────────── */
function KaptorkaCard({ item, onRemove, onShare, onChat, onFindSimilar, idx }: { item: FavKaptorka; onRemove: () => void; onShare: () => void; onChat: () => void; onFindSimilar: () => void; idx: number }) {
  const unavail = item.available === false;
  const navigate = useNavigate();
  const seller = SELLERS[item.seller];
  return (
    <div className="fav-card fav-card-enter" onClick={() => navigate(`/kaptorka/${item.id}`)} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative', animationDelay: `${idx * 40}ms` }}>
      <div style={{ position: 'relative', height: 160, background: '#F3F4F6', flexShrink: 0, overflow: 'hidden' }}>
        <CardImage src={item.image} height={160} grayscale={unavail} />
        {unavail
          ? <CardBadge label="Продано" bg="#374151" color="#fff" />
          : <CardBadge label={item.condition} bg="rgba(255,255,255,.9)" color="#375DFB" />}
        <RemoveHeart unavailable={unavail} onClick={e => { e.stopPropagation(); onRemove(); }} />
        {!unavail && (
          <div style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 2, width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', background: '#375DFB', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', boxShadow: '0 2px 7px rgba(0,0,0,.22)' }}>
            {seller?.avatar ? <img src={seller.avatar} alt={item.seller} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : item.seller.charAt(0).toUpperCase()}
          </div>
        )}
        {!unavail && (
          <CardActions actions={[
            { icon: <IcoShare />, label: 'Поделиться', onClick: e => { e.stopPropagation(); onShare(); } },
            { icon: <IcoChat />, label: 'Написать', onClick: e => { e.stopPropagation(); onChat(); } },
            { icon: <IcoTrash />, label: 'Удалить', onClick: e => { e.stopPropagation(); onRemove(); } },
          ]} />
        )}
      </div>
      <div className="fav-card-body">
        <div className="fav-card-title" style={{ fontSize: 15, fontWeight: 600, color: unavail ? '#9CA3AF' : '#375DFB', lineHeight: 1.4 }}>{item.title}</div>
        {unavail
          ? <>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#9CA3AF' }}>{item.price.toLocaleString('ru')} ₽</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{item.seller} · {item.city}</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Объявление больше не активно</div>
              <div className="fav-card-footer">
                <button className="fav-card-primary fav-card-primary--outline" onClick={e => { e.stopPropagation(); onFindSimilar(); }} style={{ padding: '9px 12px', border: '1px solid #375DFB', borderRadius: 8, background: 'transparent', color: '#375DFB', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Найти похожее →</button>
              </div>
            </>
          : <>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>{item.price.toLocaleString('ru')} ₽</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{item.seller}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{item.city}{item.listedHoursAgo ? ` • ${item.listedHoursAgo} ч. назад` : ''}</div>
              <div className="fav-card-footer">
                {item.savedDaysAgo && <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>{savedText(item.savedDaysAgo)}</div>}
                <button className="fav-card-primary fav-card-primary--blue" onClick={e => { e.stopPropagation(); onChat(); }} style={{ padding: '9px 12px', border: 'none', borderRadius: 8, background: '#375DFB', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Написать продавцу</button>
              </div>
            </>}
      </div>
    </div>
  );
}

function KaptorkaRow({ item, onRemove, onShare, onChat, idx }: { item: FavKaptorka; onRemove: () => void; onShare: () => void; onChat: () => void; idx: number }) {
  const unavail = item.available === false;
  const navigate = useNavigate();
  const seller = SELLERS[item.seller];
  return (
    <div className="fav-list-row fav-card-enter" onClick={() => navigate(`/kaptorka/${item.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid #E5E7EB', cursor: 'pointer', animationDelay: `${idx * 40}ms` }}>
      <CardImage src={item.image} height={64} grayscale={unavail} small />
      <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#EBF1FF', display: 'grid', placeItems: 'center', color: '#375DFB', fontWeight: 700 }}>
        {seller?.avatar ? <img src={seller.avatar} alt={item.seller} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : item.seller.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: unavail ? '#9CA3AF' : '#375DFB' }}>{item.title}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, display: 'flex', gap: 6 }}><span>{item.seller}</span><span>•</span><span>{item.city}</span></div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#111', flexShrink: 0 }}>{item.price.toLocaleString('ru')} ₽</div>
      <div style={{ flexShrink: 0 }}>
        <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: unavail ? 'rgba(55,65,81,.1)' : 'rgba(29,158,117,.1)', color: unavail ? '#374151' : '#10B981' }}>{unavail ? 'Продано' : 'Активно'}</span>
      </div>
      {!unavail && <button onClick={e => { e.stopPropagation(); onChat(); }} style={{ padding: '6px 14px', border: 'none', background: '#375DFB', color: '#fff', fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}>Написать</button>}
      {item.listedHoursAgo && <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{item.listedHoursAgo} ч. назад</div>}
      <DotsMenu items={[
        ...(!unavail ? [{ label: 'Написать продавцу', onClick: onChat }] : []),
        { label: 'Поделиться', onClick: onShare },
        { label: 'Удалить', danger: true, onClick: onRemove },
      ]} />
    </div>
  );
}

/* ─── EMPTY STATE ── */
const EMPTY_SVGS: Record<TabKey, React.ReactNode> = {
  articles: <svg width="120" height="100" viewBox="0 0 120 100" fill="none"><rect x="20" y="15" width="80" height="70" rx="5" fill="#f0f2f5" stroke="#d1d5db" strokeWidth="1.5" /><line x1="35" y1="35" x2="85" y2="35" stroke="#c8cdd5" strokeWidth="2" strokeLinecap="round" /><line x1="35" y1="47" x2="85" y2="47" stroke="#c8cdd5" strokeWidth="2" strokeLinecap="round" /><line x1="35" y1="59" x2="65" y2="59" stroke="#c8cdd5" strokeWidth="2" strokeLinecap="round" /><circle cx="90" cy="75" r="16" fill="#f0f2f5" stroke="#d1d5db" strokeWidth="1.5" /><line x1="80" y1="72" x2="95" y2="87" stroke="#b0b8c8" strokeWidth="2.5" strokeLinecap="round" /><ellipse cx="93" cy="86" rx="7" ry="3" transform="rotate(-45 93 86)" fill="#c8cdd5" /></svg>,
  courses:  <svg width="120" height="100" viewBox="0 0 120 100" fill="none"><rect x="18" y="20" width="84" height="62" rx="6" fill="#f0f2f5" stroke="#d1d5db" strokeWidth="1.5" /><path d="M18 33 Q60 26 102 33" stroke="#d1d5db" strokeWidth="1" fill="none" /><line x1="40" y1="46" x2="80" y2="46" stroke="#c8cdd5" strokeWidth="2" strokeLinecap="round" /><line x1="46" y1="55" x2="74" y2="55" stroke="#c8cdd5" strokeWidth="2" strokeLinecap="round" /><circle cx="60" cy="71" r="6" fill="none" stroke="#c8cdd5" strokeWidth="1.5" /><circle cx="28" cy="26" r="5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" /><circle cx="60" cy="23" r="5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" /><circle cx="92" cy="26" r="5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" /></svg>,
  market:   <svg width="120" height="110" viewBox="0 0 120 110" fill="none"><path d="M30 40 Q25 30 35 25 L55 22 Q65 20 70 30 L80 50 Q85 60 75 65 L45 70 Q32 72 30 60 Z" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1.5" /><path d="M35 45 L42 42 L48 58 L41 61 Z" fill="#d1d5db" /><path d="M50 42 L70 38 L75 55 L55 59 Z" fill="#d8dce4" /><path d="M30 60 Q29 72 38 78 L42 80 Q50 82 58 78 L62 76 Q70 72 75 65" stroke="#c8cdd5" strokeWidth="2" fill="none" strokeLinecap="round" /><line x1="38" y1="78" x2="38" y2="90" stroke="#c8cdd5" strokeWidth="2" strokeLinecap="round" /><line x1="62" y1="76" x2="62" y2="88" stroke="#c8cdd5" strokeWidth="2" strokeLinecap="round" /></svg>,
  kaptorka: <svg width="120" height="100" viewBox="0 0 120 100" fill="none"><rect x="20" y="45" width="80" height="45" rx="4" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1.5" /><rect x="25" y="40" width="70" height="10" rx="3" fill="#d8dce4" stroke="#c8cdd5" strokeWidth="1.5" /><path d="M20 45 Q20 25 35 22 L85 22 Q100 25 100 45" stroke="#d1d5db" strokeWidth="1.5" fill="none" /><line x1="55" y1="47" x2="65" y2="47" stroke="#b0b8c8" strokeWidth="2.5" strokeLinecap="round" /><rect x="30" y="55" width="60" height="28" rx="2" fill="none" stroke="#c8cdd5" strokeWidth="1" strokeDasharray="4 3" /><line x1="42" y1="66" x2="78" y2="66" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" /><line x1="48" y1="74" x2="72" y2="74" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" /></svg>,
};
const EMPTY_DATA: Record<TabKey, { title: string; desc: string; btn: string }> = {
  articles:  { title: 'Здесь будут сохранённые статьи', desc: 'Добавляйте интересные материалы из Журнала — они появятся здесь для быстрого доступа', btn: 'Перейти в Журнал →' },
  courses:   { title: 'Здесь будут сохранённые курсы', desc: 'Добавляйте курсы из раздела Военная подготовка — чтобы вернуться в удобный момент', btn: 'Перейти к курсам →' },
  market:    { title: 'Здесь будут товары из Военмаркета', desc: 'Сохраняйте снаряжение и экипировку — чтобы вернуться и купить позже', btn: 'Перейти в Военмаркет →' },
  kaptorka:  { title: 'Здесь будут объявления из Каптёрки', desc: 'Сохраняйте интересные объявления и возвращайтесь когда готовы', btn: 'Перейти в Каптёрку →' },
};
function EmptyState({ tab, onNav }: { tab: TabKey; onNav: () => void }) {
  const d = EMPTY_DATA[tab];
  return (
    <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 32px', gap: 16, textAlign: 'center' }}>
      {EMPTY_SVGS[tab]}
      <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{d.title}</div>
      <div style={{ fontSize: 14, color: '#6B7280', maxWidth: 360, lineHeight: 1.6 }}>{d.desc}</div>
      <button onClick={onNav} style={{ padding: '10px 24px', background: '#375DFB', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#2D4FE0'} onMouseLeave={e => e.currentTarget.style.background = '#375DFB'}>{d.btn}</button>
    </div>
  );
}

/* ─── MAIN PAGE ── */
export function Favorites() {
  const navigate = useNavigate();
  const { items, remove, toggle } = useFavoritesStore();
  const kaptorkaAds = useKaptorkaStore(s => s.ads);
  const { addCourse, addProduct } = useCartStore();
  const [activeTab, setActiveTab] = useState<TabKey>('articles');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortKey>('date-added');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [fadingTab, setFadingTab] = useState(false);

  useEffect(() => { injectFavCss(); }, []);

  const showToast = useCallback((msg: string, action?: string, onAction?: () => void) => {
    setToast({ msg, action, onAction, id: ++toastIdSeq });
  }, []);

  const handleRemove = useCallback((item: FavItem) => {
    remove(item.id, item.kind);
    showToast('Удалено из избранного', 'Отменить', () => toggle(item));
  }, [remove, toggle, showToast]);

  const handleShare = useCallback(() => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    showToast('Ссылка скопирована в буфер обмена');
  }, [showToast]);

  const handleCart = useCallback((item: FavCourse | FavMarket) => {
    if (item.kind === 'course') {
      addCourse({
        id: item.id,
        kind: 'course',
        title: item.title,
        city: item.city,
        duration: item.duration,
        price: item.price,
        format: item.format,
        image: item.image,
        stream: item.startDate || 'Ближайший поток',
      });
    } else {
      addProduct({
        id: item.id,
        kind: 'product',
        title: item.title,
        brand: item.brand,
        price: item.price,
        oldPrice: item.oldPrice,
        size: item.size,
        qty: 1,
        image: item.image,
      });
    }
    showToast('Добавлено в корзину', 'Перейти', () => navigate('/cart'));
  }, [addCourse, addProduct, navigate, showToast]);

  const handleChat = useCallback((seller?: string) => {
    const chatMap: Record<string, number> = { Бек: 2, Коба: 3, Стрелок: 5, Нексус: 7, Торнадо: 1 };
    navigate(`/messages?chat=${chatMap[seller || ''] ?? 2}`);
  }, [navigate]);

  const switchTab = (tab: TabKey) => {
    if (tab === activeTab) return;
    setFadingTab(true);
    setTimeout(() => { setActiveTab(tab); setSortBy('date-added'); setFadingTab(false); }, 100);
  };

  const getTabItems = (tab: TabKey) => {
    const kindMap: Record<TabKey, FavItem['kind']> = { articles: 'article', courses: 'course', market: 'market', kaptorka: 'kaptorka' };
    const matching = items.filter(i => i.kind === kindMap[tab]);
    if (tab !== 'kaptorka') return matching;

    return matching.flatMap(item => {
      if (item.kind !== 'kaptorka') return [];
      const ad = kaptorkaAds.find(candidate => candidate.id === item.id);
      if (!ad) return [];
      return [{
        ...item,
        title: ad.title,
        condition: ad.condition,
        price: ad.price,
        seller: ad.seller,
        city: ad.city,
        image: ad.image,
        available: ad.active !== false,
      } satisfies FavKaptorka];
    });
  };

  const tabItems = getTabItems(activeTab);
  const sorted = sortItems(tabItems, sortBy);
  const sortOpts = SORT_OPTIONS[activeTab];
  const currentSortLabel = (sortOpts.find(o => o.value === sortBy) ?? sortOpts[0]).label;

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F8F9FB' }}>
      <div style={{ padding: '24px 28px 48px' }}>

        <div style={{ display: 'flex', gap: 5, width: 'fit-content', maxWidth: '100%', overflowX: 'auto', background: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 16 }}>
          {(['articles', 'courses', 'market', 'kaptorka'] as TabKey[]).map(tab => {
            const cnt = getTabItems(tab).length;
            return (
              <button className="fav-tab-btn" key={tab} onClick={() => switchTab(tab)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 15px', border: 'none', background: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? '#111' : '#6B7280', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: 8, boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,.08)' : 'none', transition: 'all .15s', whiteSpace: 'nowrap' as const }}>
                {TAB_LABELS[tab]}
                {cnt > 0 && <span style={{ background: activeTab === tab ? '#375DFB' : '#D1D5DB', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, lineHeight: 1.4 }}>{cnt}</span>}
              </button>
            );
          })}
        </div>

        {/* ── CONTROLS ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' as const }}>
          <div className="fav-sort-row" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #E5E7EB', background: '#fff', borderRadius: 10, fontSize: 13, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
            Сортировка: {currentSortLabel} <IcoChevDown />
            <select className="fav-sort-native" value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} style={{ position: 'absolute', opacity: 0, top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}>
              {sortOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 6, overflow: 'hidden' }}>
            {(['grid', 'list'] as ViewMode[]).map((v, i) => (
              <button className="fav-view-btn" key={v} onClick={() => setViewMode(v)} title={v === 'grid' ? 'Сетка' : 'Список'} style={{ padding: '8px 14px', border: 'none', borderRight: i === 0 ? '1px solid #E5E7EB' : 'none', background: viewMode === v ? '#F3F4F6' : '#fff', color: viewMode === v ? '#111' : '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
                {v === 'grid' ? <IcoGrid /> : <IcoList />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ opacity: fadingTab ? 0 : 1, transition: 'opacity .15s' }}>
          {sorted.length === 0
            ? <div style={{ display: 'grid' }}><EmptyState tab={activeTab} onNav={() => navigate(ROUTE_MAP[activeTab])} /></div>
            : viewMode === 'grid'
              ? <div className="fav-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, alignItems: 'stretch' }}>
                  {sorted.map((item, idx) => {
                    if (item.kind === 'article')  return <ArticleCard  key={item.id} item={item} idx={idx} onRemove={() => handleRemove(item)} onShare={handleShare} />;
                    if (item.kind === 'course')   return <CourseCard   key={item.id} item={item} idx={idx} onRemove={() => handleRemove(item)} onShare={handleShare} onCart={() => handleCart(item)} navigate={navigate} />;
                    if (item.kind === 'market')   return <MarketCard   key={item.id} item={item} idx={idx} onRemove={() => handleRemove(item)} onShare={handleShare} onCart={() => handleCart(item)} onFindSimilar={() => navigate('/shop')} />;
                    if (item.kind === 'kaptorka') return <KaptorkaCard key={item.id} item={item} idx={idx} onRemove={() => handleRemove(item)} onShare={handleShare} onChat={() => handleChat(item.seller)} onFindSimilar={() => navigate('/kaptorka')} />;
                    return null;
                  })}
                </div>
              : <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '0 16px' }}>
                  {sorted.map((item, idx) => {
                    if (item.kind === 'article')  return <ArticleRow  key={item.id} item={item} idx={idx} onRemove={() => handleRemove(item)} onShare={handleShare} />;
                    if (item.kind === 'course')   return <CourseRow   key={item.id} item={item} idx={idx} onRemove={() => handleRemove(item)} onShare={handleShare} onCart={() => handleCart(item)} />;
                    if (item.kind === 'market')   return <MarketRow   key={item.id} item={item} idx={idx} onRemove={() => handleRemove(item)} onShare={handleShare} onCart={() => handleCart(item)} onFindSimilar={() => navigate('/shop')} />;
                    if (item.kind === 'kaptorka') return <KaptorkaRow key={item.id} item={item} idx={idx} onRemove={() => handleRemove(item)} onShare={handleShare} onChat={() => handleChat(item.seller)} />;
                    return null;
                  })}
                </div>}
        </div>
      </div>
      {toast && <Toast key={toast.id} data={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
