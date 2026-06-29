import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../useMediaQuery';
import { FiltersModal } from './FiltersModal';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useCartStore } from '../store/useCartStore';
import { COURSE_CARD_MOTION_CSS } from './courseCardMotion';
import { MILITARY_COURSES } from '../data/courses';

if (typeof document !== 'undefined' && !document.getElementById('courses-styles')) {
  const s = document.createElement('style');
  s.id = 'courses-styles';
  s.textContent = `
    @keyframes cCardIn    { from{opacity:0;transform:translateY(18px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes cModalIn   { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
    @keyframes cartBounce { 0%{transform:scale(1)} 20%{transform:scale(.65)} 55%{transform:scale(1.22)} 75%{transform:scale(.9)} 90%{transform:scale(1.06)} 100%{transform:scale(1)} }
    @keyframes checkPop   { from{opacity:0;transform:scale(.4) rotate(-25deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
    @keyframes lockWiggle { 0%{transform:rotate(0) scale(1)} 10%{transform:rotate(-20deg) scale(1.35)} 26%{transform:rotate(20deg) scale(1.4)} 42%{transform:rotate(-13deg) scale(1.28)} 58%{transform:rotate(13deg) scale(1.25)} 74%{transform:rotate(-6deg) scale(1.1)} 88%{transform:rotate(6deg) scale(1.05)} 100%{transform:rotate(0) scale(1)} }
    @keyframes lockGlow   { 0%{box-shadow:0 0 0 0 rgba(255,255,255,.55)} 55%{box-shadow:0 0 0 14px rgba(255,255,255,0)} 100%{box-shadow:0 0 0 0 rgba(255,255,255,0)} }
    .c-mil-shell { position:relative; z-index:1; }
    .c-card-img { overflow:hidden; }
    .c-card-img img { transition:transform .65s cubic-bezier(.4,0,.2,1); transform-origin:center; }
    .c-mil-shell:hover .c-card-img img { transform:scale(1.08); }
    .c-card-overlay { position:absolute;inset:0;pointer-events:none;background:linear-gradient(to top,rgba(17,24,39,.55) 0%,transparent 55%);opacity:0;transition:opacity .5s ease; }
    .c-mil-shell:hover .c-card-overlay { opacity:1; }
    .c-mil-text-wrap { overflow:hidden; max-width:0; transition:max-width .52s cubic-bezier(.4,0,.2,1); border-radius:0 8px 8px 0; }
    .c-mil-shell:hover .c-mil-text-wrap { max-width:300px; }
    .c-mil-series-text { white-space:nowrap; display:flex; align-items:center; opacity:0; transform:translateX(-10px); transition:opacity .38s .12s ease, transform .52s .08s cubic-bezier(.22,1,.36,1); }
    .c-mil-shell:hover .c-mil-series-text { opacity:1; transform:translateX(0); }
    .c-mil-shell:hover .c-lock-icon { animation:lockWiggle .7s .3s cubic-bezier(.36,.07,.19,.97) both, lockGlow .7s .3s ease both; }
    .c-fav-btn { transition:transform .15s, color .15s; }
    .c-fav-btn:hover { transform:scale(1.28) !important; }
    .c-enroll-btn { transition:transform .18s ease, box-shadow .18s ease !important; }
    .c-enroll-btn:hover { transform:translateY(-2px) !important; box-shadow:0 8px 20px rgba(55,93,251,.35) !important; }
    .c-modal-enter { animation:cModalIn .22s cubic-bezier(.4,0,.2,1); }
    @media (prefers-reduced-motion:reduce) {
      .c-mil-shell, .c-card-img img, .c-card-overlay, .c-mil-text-wrap, .c-mil-series-text { transition:none !important; }
    }
    ${COURSE_CARD_MOTION_CSS}
  `;
  document.head.appendChild(s);
}

const SERIES_COLORS: Record<number, { num: string; bg: string }> = {
  1: { num: '#375DFB', bg: 'rgba(255,255,255,.92)' },
  2: { num: '#F97316', bg: 'rgba(255,255,255,.92)' },
  3: { num: '#10B981', bg: 'rgba(255,255,255,.92)' },
};

interface Course {
  id: number; city: string; duration: string; title: string;
  newPrice: number; oldPrice?: number; description?: string;
  image?: string; seriesIndex?: number; seriesId?: number; seriesName?: string;
  published?: boolean; isPaid?: boolean; format?: string; type?: string;
  locked?: boolean; prerequisite?: string;
}
interface AppliedFilters { cities: string[]; places: string[]; cost: string[]; types: string[]; }

// Запасной список = единый источник данных курсов (синхронизирован со страницей /courses)
const FALLBACK: Course[] = MILITARY_COURSES;

const MONTHS  = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DAYS    = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const PERIODS = ['В текущем месяце','Ближайшие 3 месяца','6 месяцев','2024 год','За все время','Календарь'];

function buildCal(y: number, m: number) {
  const f = new Date(y, m, 1).getDay(), t = new Date(y, m + 1, 0).getDate(), o = f === 0 ? 6 : f - 1;
  const c: (number | null)[] = [];
  for (let i = 0; i < o; i++) c.push(null);
  for (let d = 1; d <= t; d++) c.push(d);
  while (c.length % 7) c.push(null);
  return c;
}

function readCourses(): Course[] {
  try {
    const sd = (window as any).siteData;
    if (sd?.initialized) {
      const a = (sd.getCourses?.() as Course[]) || [];
      const p = a.filter((c: Course) => c.published !== false);
      if (p.length > 0) return p;
    }
    const raw = localStorage.getItem('site_courses');
    if (raw) {
      const d = JSON.parse(raw);
      const l = ((d.courses as Course[]) || []).filter((c: Course) => c.published !== false);
      if (l.length > 0) return l;
    }
  } catch {}
  return FALLBACK;
}

function CourseCard({ c, idx, isFav, onToggleFav, onAddToCart, alreadyInCart }: {
  c: Course; idx: number; isFav: boolean;
  onToggleFav: (e: React.MouseEvent, c: Course) => void;
  onAddToCart: (c: Course) => void;
  alreadyInCart: boolean;
}) {
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(false);
  const sc = c.seriesId ? SERIES_COLORS[c.seriesId] : null;

  const blueBtnBase: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), #375DFB',
    boxShadow: '0 0 0 1px #375DFB, 0 1px 2px 0 rgba(37,62,167,0.48)',
    border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer',
  };

  const goCheckout = (e: React.MouseEvent) => {
    e.stopPropagation();
    const veil = document.createElement('div');
    veil.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:9999;opacity:0;pointer-events:all;transition:opacity .24s ease';
    document.body.appendChild(veil);
    requestAnimationFrame(() => requestAnimationFrame(() => { veil.style.opacity = '1'; }));
    setTimeout(() => {
      navigate('/checkout', { state: { directItem: { id:c.id, kind:'course', title:c.title, city:c.city, duration:c.duration, price:c.newPrice, oldPrice:c.oldPrice, format:c.format || 'Оффлайн', image:c.image, stream:'', isFav:false, isSelected:true } } });
      veil.style.opacity = '0';
      setTimeout(() => veil.remove(), 280);
    }, 260);
  };

  const BadgePill = () => c.seriesIndex !== undefined ? (
    <div style={{
      position: 'absolute', top: 12, left: 12, zIndex: 20,
      display: 'flex', alignItems: 'stretch',
      boxShadow: '0 2px 10px rgba(0,0,0,.28)', borderRadius: 8,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: sc?.num || '#374151', color: '#fff',
        fontSize: 12, fontWeight: 700, padding: '5px 9px', lineHeight: 1.4,
        display: 'flex', alignItems: 'center', letterSpacing: .3,
        borderRadius: c.seriesName ? '8px 0 0 8px' : 8, flexShrink: 0,
      }}>
        {String(c.seriesIndex).padStart(2, '0')}
      </div>
      {c.seriesName && (
        <div className="c-mil-text-wrap">
          <div className="c-mil-series-text" style={{
            background: sc?.bg || 'rgba(255,255,255,.92)', color: '#374151',
            fontSize: 11, fontWeight: 600, padding: '5px 9px', lineHeight: 1.4,
          }}>
            {c.seriesName}
          </div>
        </div>
      )}
    </div>
  ) : null;

  const ImgSection = () => (
    <div className="c-card-img" style={{ height: 190, overflow: 'hidden', position: 'relative', borderRadius: '16px 16px 0 0' }}>
      <img src={c.image || '/voen1.png'} alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
        onError={e => { (e.target as HTMLImageElement).src = '/voen1.png'; }} />
      <div className="c-card-overlay" />
      {c.oldPrice && !c.locked && !c.seriesIndex && (
        <div style={{ position: 'absolute', top: 12, left: 12, background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 8 }}>СКИДКА</div>
      )}
      {c.locked && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4, borderRadius: '16px 16px 0 0' }}>
          <div className="c-lock-icon" style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,.45)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
        <div title={c.isPaid !== false ? 'Платный' : 'Бесплатно'} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.1)', backdropFilter: 'blur(4px)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="10" stroke={c.isPaid !== false ? '#22C55E' : '#D1D5DB'} strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" fill={c.isPaid !== false ? '#22C55E' : '#D1D5DB'}/>
          </svg>
        </div>
        <div title={c.format || 'Оффлайн'} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.1)', backdropFilter: 'blur(4px)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.format === 'Оффлайн' ? '#6B7280' : '#D1D5DB'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20V10l8-6 8 6v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/>
          </svg>
        </div>
      </div>
    </div>
  );

  const PriceRow = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: c.locked ? '#9CA3AF' : c.isPaid === false ? '#10B981' : '#059669' }}>
          {c.isPaid === false ? 'Бесплатно' : `${c.newPrice.toLocaleString()} `}
          {c.isPaid !== false && <span style={{ fontSize: 13 }}>₽</span>}
        </span>
        {c.oldPrice && <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>{c.oldPrice.toLocaleString()} ₽</span>}
      </div>
      {!c.locked && (
        <button className="c-fav-btn" onClick={e => { e.stopPropagation(); onToggleFav(e, c); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : '#D1D5DB'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <div className="c-mil-shell">
      <BadgePill />
      <div className="c-card-wrap" data-locked={c.locked ? '' : undefined}
           style={{
             cursor: c.locked ? 'default' : 'pointer',
             animation: `cCardIn .5s ${idx * 70}ms ease backwards`,
           }}
           onClick={() => { if (!c.locked) navigate(`/courses/${encodeURIComponent(c.title)}`); }}>
        <ImgSection />
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{c.city}</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{c.duration}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: c.locked ? '#6B7280' : '#111', marginBottom: 8, lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
            {c.title}
          </h3>
          <PriceRow />
        </div>
      </div>
      <div className="c-expand-wrap">
        <div className="c-expand-inner">
          <div style={{ padding: '0 16px 16px' }}>
              {c.description && (
                <p className="c-oi c-oi-1" style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55, margin: '0 0 10px',
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                } as React.CSSProperties}>{c.description}</p>
              )}
              {c.locked && c.prerequisite && (
                <div className="c-oi c-oi-2" style={{ marginBottom: 10, background: '#EBF1FF', border: '1px solid #375DFB33', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, minWidth: 0 }}>Открывается после: <span style={{ color: '#375DFB', fontWeight: 600 }}>{c.prerequisite}</span></div>
                </div>
              )}
              {!c.locked && (
                <div className="c-oi c-oi-2" style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (!alreadyInCart) {
                        onAddToCart(c);
                        setJustAdded(true);
                        setTimeout(() => setJustAdded(false), 800);
                      }
                    }}
                    title={alreadyInCart ? 'В корзине' : 'В корзину'}
                    className="c-enroll-btn"
                    style={{ ...blueBtnBase, width: 46, height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: alreadyInCart ? 'linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,0) 100%),#059669' : blueBtnBase.background as string,
                      boxShadow: alreadyInCart ? '0 0 0 1px #059669,0 1px 2px 0 rgba(4,120,87,.48)' : blueBtnBase.boxShadow as string,
                      transition: 'background .3s ease, box-shadow .3s ease, transform .18s ease',
                      animation: justAdded ? 'cartBounce .52s cubic-bezier(.36,.07,.19,.97)' : 'none',
                    }}
                  >
                    {alreadyInCart
                      ? <svg style={{ animation: 'checkPop .35s cubic-bezier(.34,1.56,.64,1)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    }
                  </button>
                  <button onClick={goCheckout} className="c-enroll-btn" style={{ ...blueBtnBase, flex: 1, height: 46, fontSize: 14, fontWeight: 600 }}>
                    Записаться и оплатить
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Courses() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>(() => readCourses());
  const [activeTab, setActiveTab] = useState<'all' | 'series'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [period, setPeriod] = useState('За все время');
  const [showDrop, setShowDrop] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [calY, setCalY] = useState(new Date().getFullYear());
  const [calM, setCalM] = useState(new Date().getMonth());
  const [selDays, setSelDays] = useState<number[]>([]);
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'free'>('all');
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters | null>(null);
  const [page, setPage] = useState(0);
  const dropRef = useRef<HTMLDivElement>(null);

  const { toggle: toggleFav, has: hasFav } = useFavoritesStore();
  const { addCourse, has: inCart } = useCartStore();

  useEffect(() => {
    const load = () => {
      const c = readCourses();
      setCourses(p => JSON.stringify(p) === JSON.stringify(c) ? p : c);
    };
    const wait = setInterval(() => {
      if ((window as any).siteData?.initialized) {
        clearInterval(wait); load();
        (window as any).siteData!.subscribe?.((k: string) => { if (k === 'courses') load(); });
      }
    }, 500);
    const onSt = (e: StorageEvent) => { if (e.key === 'site_courses') load(); };
    window.addEventListener('storage', onSt);
    const poll = setInterval(load, 5000);
    return () => { clearInterval(wait); clearInterval(poll); window.removeEventListener('storage', onSt); };
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) { setShowDrop(false); setShowCal(false); }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  let displayed = activeTab === 'series' ? courses.filter(c => c.seriesIndex !== undefined) : courses;
  if (filterPaid === 'paid') displayed = displayed.filter(c => c.isPaid !== false);
  if (filterPaid === 'free') displayed = displayed.filter(c => c.isPaid === false);
  if (appliedFilters) {
    if (appliedFilters.cities.length > 0) displayed = displayed.filter(c => appliedFilters!.cities.some(city => c.city.includes(city)));
    if (appliedFilters.places.length > 0) displayed = displayed.filter(c => c.format && appliedFilters!.places.includes(c.format));
    if (appliedFilters.cost.length > 0) {
      const wantPaid = appliedFilters.cost.includes('Платные'), wantFree = appliedFilters.cost.includes('Бесплатные');
      if (wantPaid && !wantFree) displayed = displayed.filter(c => c.isPaid !== false);
      if (wantFree && !wantPaid) displayed = displayed.filter(c => c.isPaid === false);
    }
    if (appliedFilters.types.length > 0) displayed = displayed.filter(c => c.type && appliedFilters!.types.includes(c.type));
  }
  const VISIBLE = isMobile ? 1 : 6;
  const totalPages = Math.max(1, Math.ceil(displayed.length / VISIBLE));
  const safePage = Math.min(page, totalPages - 1);
  const pageCards = displayed.slice(safePage * VISIBLE, (safePage + 1) * VISIBLE);

  const today = new Date();
  const cells = buildCal(calY, calM);
  const handleToggleFav = (e: React.MouseEvent, c: Course) => {
    e.stopPropagation();
    toggleFav({ id: c.id, kind: 'course', title: c.title, city: c.city, duration: c.duration, price: c.newPrice, format: c.isPaid === false ? 'Бесплатно' : 'Оффлайн', image: c.image || '/military-course.jpg' });
  };
  const handleAddToCart = (c: Course) => {
    addCourse({ id: c.id, kind: 'course', title: c.title, city: c.city, duration: c.duration, price: c.newPrice, format: c.isPaid === false ? 'Бесплатно' : 'Оффлайн', image: c.image || '/military-course.jpg', stream: '' });
  };

  return (
    <>
      <section style={{ padding: isMobile ? '16px 16px 0' : '24px 24px 0' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: isMobile ? '20px' : '24px 28px', border: '1px solid #E5E7EB', animation: 'cCardIn .5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Военная подготовка</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', background: '#F9FAFB' }}>
                {(['all', 'series'] as const).map((t, i) => (
                  <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '7px 14px', border: 'none', fontSize: 12, fontWeight: activeTab === t ? 600 : 500, cursor: 'pointer', whiteSpace: 'nowrap', background: activeTab === t ? '#fff' : 'transparent', color: activeTab === t ? '#111' : '#6B7280', borderRight: i === 0 ? '1px solid #E5E7EB' : 'none', boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,.08)' : 'none', borderRadius: activeTab === t ? '6px' : '0', transition: 'background .15s, color .15s, box-shadow .15s' }}>
                    {t === 'all' ? 'Все курсы' : 'Серии курсов'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', background: '#F9FAFB' }}>
                {([['all', 'Все'], ['paid', 'Платные'], ['free', 'Бесплатные']] as const).map(([val, label], i) => (
                  <button key={val} onClick={() => setFilterPaid(val)} style={{ padding: '7px 10px', border: 'none', fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', background: filterPaid === val ? '#fff' : 'transparent', color: filterPaid === val ? '#111' : '#6B7280', borderRight: i < 2 ? '1px solid #E5E7EB' : 'none', boxShadow: filterPaid === val ? '0 1px 3px rgba(0,0,0,.08)' : 'none', margin: filterPaid === val ? '2px' : '0', borderRadius: filterPaid === val ? '6px' : '0', transition: 'all .15s' }}>{label}</button>
                ))}
              </div>
              <div style={{ position: 'relative' }} ref={dropRef}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 8, background: '#F9FAFB', overflow: 'hidden' }}>
                  <button onClick={() => { setPeriod('За все время'); setShowDrop(false); setShowCal(false); }} style={{ padding: '7px 8px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>&lsaquo;</button>
                  <button onClick={() => { setShowDrop(!showDrop); setShowCal(false); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#374151', whiteSpace: 'nowrap' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {period === 'Календарь' && selDays.length > 0 ? `${MONTHS[calM].substring(0, 3)}.` : period}
                  </button>
                  <button onClick={() => setShowDrop(!showDrop)} style={{ padding: '7px 8px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>&rsaquo;</button>
                </div>
                {showDrop && !showCal && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 300, minWidth: 200, overflow: 'hidden' }}>
                    {PERIODS.map(p => (
                      <button key={p} onClick={() => { if (p === 'Календарь') { setShowCal(true); setShowDrop(false); return; } setPeriod(p); setShowDrop(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, color: p === period ? '#375DFB' : '#374151', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #F5F5F7', transition: 'background .1s' }}
                        onMouseOver={e => (e.currentTarget.style.background = '#F9FAFB')} onMouseOut={e => (e.currentTarget.style.background = 'none')}>
                        <span>{p}</span>
                        {p === period && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                    ))}
                  </div>
                )}
                {showCal && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,.15)', zIndex: 300, width: 300 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px' }}>
                      <button onClick={() => { if (calM === 0) { setCalY(y => y - 1); setCalM(11); } else setCalM(m => m - 1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 18 }}>&lsaquo;</button>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{MONTHS[calM]}, {calY}</span>
                      <button onClick={() => { if (calM === 11) { setCalY(y => y + 1); setCalM(0); } else setCalM(m => m + 1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 18 }}>&rsaquo;</button>
                    </div>
                    <div style={{ padding: '0 14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
                        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', padding: '4px 0', fontWeight: 500 }}>{d}</div>)}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 14 }}>
                        {cells.map((d, i) => (
                          <div key={i} onClick={() => d && setSelDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])}
                            style={{ textAlign: 'center', padding: '6px 0', fontSize: 13, borderRadius: '50%', cursor: d ? 'pointer' : 'default', background: d && selDays.includes(d) ? '#375DFB' : 'transparent', color: d && selDays.includes(d) ? '#fff' : d && calY === today.getFullYear() && calM === today.getMonth() && d === today.getDate() ? '#375DFB' : d ? '#374151' : '#E5E7EB', fontWeight: d && selDays.includes(d) ? 600 : 400 }}>
                            {d || ''}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #F0F0F0', padding: 10, textAlign: 'center' }}>
                      <button onClick={() => { setPeriod('Календарь'); setShowCal(false); }} style={{ color: '#375DFB', background: 'none', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Готово</button>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setShowFilters(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#374151', background: '#F9FAFB', cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EBF1FF'; e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Фильтры
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', overflow: 'visible' }}>
            {safePage > 0 && (
              <button type="button" onClick={() => setPage(safePage - 1)}
                style={{ position: 'absolute', left: -22, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: '#fff', border: '1.5px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,.13)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, fontSize: 22, color: '#374151', flexShrink: 0, transition: 'box-shadow .15s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(55,93,251,.22)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.13)')}>‹</button>
            )}
            <div key={safePage} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20, overflow: 'visible', animation: 'cCardIn .35s ease' }}>
              {pageCards.map((c, idx) => (
                <CourseCard
                  key={c.id} c={c} idx={idx}
                  isFav={hasFav(c.id, 'course')}
                  onToggleFav={handleToggleFav}
                  onAddToCart={handleAddToCart}
                  alreadyInCart={inCart(c.id, 'course')}
                />
              ))}
            </div>
            {safePage < totalPages - 1 && (
              <button type="button" onClick={() => setPage(safePage + 1)}
                style={{ position: 'absolute', right: -22, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: '#fff', border: '1.5px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,.13)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, fontSize: 22, color: '#374151', flexShrink: 0, transition: 'box-shadow .15s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(55,93,251,.22)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.13)')}>›</button>
            )}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 }}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} type="button" onClick={() => setPage(i)}
                    style={{ width: i === safePage ? 22 : 8, height: 8, borderRadius: 4, background: i === safePage ? '#375DFB' : '#E5E7EB', border: 'none', cursor: 'pointer', padding: 0, transition: 'all .2s ease', flexShrink: 0 }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      {showFilters && <FiltersModal onClose={() => setShowFilters(false)} onApply={(f) => { setAppliedFilters(f); setShowFilters(false); }} />}
    </>
  );
}
