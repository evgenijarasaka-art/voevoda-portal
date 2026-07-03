import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useLessonProgressStore } from '../store/useLessonProgressStore';
import { useCourseArchiveStore } from '../store/useCourseArchiveStore';
import { useLearningStore } from '../store/useLearningStore';
import { userProfilePath } from '../api/testApi';
import { IVDisplay } from '../components/PeopleSection';
import { COURSE_CARD_MOTION_CSS } from '../components/courseCardMotion';

/* ─── типы и данные ─── */
type CourseData = {
  id: number; title: string; city: string; duration: string; price: number; oldPrice: number | null;
  img: string; desc: string; seriesNum?: number; seriesId?: number; seriesName?: string;
  locked?: boolean; prerequisite?: string;
};

const SERIES_COLORS: Record<number, { num: string; pillBg: string; pillText: string }> = {
  1: { num: '#375DFB', pillBg: '#EBF1FF', pillText: '#375DFB' },
  2: { num: '#F97316', pillBg: '#FFF0E5', pillText: '#EA6B10' },
  3: { num: '#10B981', pillBg: '#ECFDF5', pillText: '#059669' },
};

const COURSES: CourseData[] = [
  { id: 101, img: '/kyrs1.png', title: 'Курс Молодого Бойца V5',              city: 'Москва',          duration: '3 месяца', price: 35000, oldPrice: null,  desc: 'Базовый курс военной подготовки для всех желающих освоить военное дело с нуля.' },
  { id: 102, img: '/kyrs2.png', title: 'Ускоренная военная подготовка',       city: 'Санкт-Петербург', duration: '3 месяца', price: 29000, oldPrice: null,  desc: 'Интенсивный курс подготовки для тех, кто хочет пройти полный курс в сжатые сроки.' },
  { id: 103, img: '/kyrs3.png', title: 'Общевойсковой снайпер V4',            city: 'Москва',          duration: '3 месяца', price: 29000, oldPrice: 40000, desc: 'Профессиональная подготовка снайперов для современных боевых условий.' },
  { id: 104, img: '/kyrs1.png', title: 'Тактическая медицина для бойца',      city: 'Санкт-Петербург', duration: '3 месяца', price: 25000, oldPrice: null,  desc: 'Курс по оказанию первой помощи и тактической медицине в боевых условиях.' },
  { id: 105, img: '/kyrs2.png', title: 'Основы военного дела',                city: 'Краснодар',       duration: '3 месяца', price: 20000, oldPrice: null,  desc: 'Фундаментальный курс по основам военного дела и тактической подготовке.' },
  { id: 106, img: '/kyrs3.png', title: 'Разведывательно-штурмовая подготовка',city: 'Москва',          duration: '3 месяца', price: 29000, oldPrice: null,  desc: 'Углублённый курс подготовки бойцов разведывательных и штурмовых подразделений.' },
];

const HOMEWORKS = [
  { id: 1, img: '/kyrs1.png', num: '01', title: 'Ориентирование в лесистой местности', deadline: 'Сдать до завтра',    deadlineColor: '#F59E0B', attempts: '1 / 3', instructor: 'Бек', instructorRole: 'Главный инструктор', instructorImg: '/teacher2-main.jpg', courseSlug: 'Курс Молодого Бойца V5' },
  { id: 2, img: '/kyrs2.png', num: '01', title: 'Внутренняя и внешняя баллистика',      deadline: 'Сдать до 14 апреля', deadlineColor: '#10B981', attempts: '2 / 3', instructor: 'Бек', instructorRole: 'Главный инструктор', instructorImg: '/teacher2-main.jpg', courseSlug: 'Общевойсковой снайпер V4' },
  { id: 3, img: '/kyrs3.png', num: '02', title: 'Огневая подготовка снайпера',          deadline: 'Сдать до 28 апреля', deadlineColor: '#10B981', attempts: '1 / 3', instructor: 'Бек', instructorRole: 'Главный инструктор', instructorImg: '/teacher2-main.jpg', courseSlug: 'Общевойсковой снайпер V4' },
];

const LESSONS = [
  { id: 1, img: '/kyrs1.png', title: 'Личная тактическая подготовка снайпера', location: 'Полигон «Калибр» - Минское шоссе, 31-й километр, с1', course: 'Общевойсковой снайпер',   datetime: '24 марта / с 09.00 – 17.00', status: 'Я в строю',    statusColor: '#10B981' },
  { id: 2, img: '/kyrs2.png', title: 'Эвакуация раненых',                       location: 'Полигон «Калибр» - Минское шоссе, 31-й километр, с1', course: 'Курс Молодого Бойца V5', datetime: '24 марта / с 09.00 – 17.00', status: 'Под вопросом', statusColor: '#F59E0B' },
  { id: 3, img: '/kyrs1.png', title: 'Личная тактическая подготовка снайпера', location: 'Полигон «Калибр» - Минское шоссе, 31-й километр, с1', course: 'Общевойсковой снайпер',   datetime: '24 марта / с 09.00 – 17.00', status: 'Я в строю',    statusColor: '#10B981' },
];

const PROGRESS = [
  { id: 1, img: '/kyrs1.png', title: 'Курс Молодого Бойца V5',         start: '24 апреля', end: '1 мая', courseProgress: 40,  hwProgress: 60,  passed: false, lessons: '8 / 19', slug: 'Курс Молодого Бойца V5' },
  { id: 2, img: '/kyrs2.png', title: 'Тактическая медицина для бойца', start: '24 апреля', end: '1 мая', courseProgress: 100, hwProgress: 100, passed: true,  rating: 5.0,       slug: 'Тактическая медицина для бойца' },
  { id: 3, img: '/kyrs3.png', title: 'Ускоренная военная подготовка',  start: '24 апреля', end: '1 мая', courseProgress: 100, hwProgress: 90,  passed: true,  rating: 5.0,       slug: 'Ускоренная военная подготовка' },
];

const RATING_USERS = [
  { id: 1, img: '/teacher1-main.jpg', name: 'Резак',  rank: 'Капитан',   specialty: 'Снайпер',     courses: 24, lessons: 341, awards: 18, index: 2463, rating: 5.0 },
  { id: 2, img: '/teacher2-main.jpg', name: 'Шторм',  rank: 'Майор',     specialty: 'Штурмовик',   courses: 22, lessons: 323, awards: 15, index: 2310, rating: 4.9 },
  { id: 3, img: '/teacher3-main.jpg', name: 'Гром',   rank: 'Майор',     specialty: 'Пулемётчик',  courses: 19, lessons: 298, awards: 12, index: 2150, rating: 4.8 },
  { id: 4, img: '/teacher1-main.jpg', name: 'Лис',    rank: 'Капитан',   specialty: 'Разведчик',   courses: 17, lessons: 276, awards: 11, index: 1980, rating: 4.7 },
  { id: 5, img: '/teacher2-main.jpg', name: 'Волк',   rank: 'Лейтенант', specialty: 'Сапёр',       courses: 14, lessons: 241, awards: 9,  index: 1760, rating: 4.6 },
  { id: 6, img: '/teacher3-main.jpg', name: 'Беркут', rank: 'Лейтенант', specialty: 'Связист',     courses: 11, lessons: 198, awards: 7,  index: 1540, rating: null },
];

/* ─── CSS ─── */
const CSS = `
  @keyframes mcFadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
  @keyframes fadeSlideUp{ from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn    { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes archiveOut { 0%{opacity:1;transform:translateX(0) scale(1);max-height:200px;padding-top:20px;padding-bottom:20px;margin-bottom:0} 60%{opacity:0;transform:translateX(110%) scale(.88)} 100%{opacity:0;transform:translateX(110%) scale(.88);max-height:0;padding-top:0;padding-bottom:0;margin-bottom:0} }
  .mc-row { transition:background .18s ease, transform .24s cubic-bezier(.2,.8,.2,1), box-shadow .24s ease; border-radius:10px; }
  .mc-row:hover { background:#F5F8FF !important; transform:translateY(-3px); box-shadow:0 10px 28px rgba(55,93,251,.1); }
  .mc-thumb { border-radius:12px; overflow:hidden; flex-shrink:0; }
  .mc-thumb img { transition:transform .6s cubic-bezier(.22,1,.36,1); transform-origin:center; object-position:center top; will-change:transform; }
  .mc-row:hover .mc-thumb img { transform:scale(1.07); }
  .mc-btn-p { transition:background .15s, box-shadow .15s, transform .12s; }
  .mc-btn-p:hover { box-shadow:0 4px 18px rgba(55,93,251,.3); transform:translateY(-1px); }
  .mc-btn-s { transition:background .15s, transform .12s; }
  .mc-btn-s:hover { background:#F3F4F6 !important; transform:translateY(-1px); }
  .mc-btn-arch { transition:background .15s, border-color .15s, color .15s, transform .12s; }
  .mc-btn-arch:hover { background:#FFF0F0 !important; border-color:#FECACA !important; color:#EF4444 !important; transform:translateY(-1px); }
  .mc-archive-nav-btn { transition:background .15s, border-color .15s, box-shadow .15s, transform .12s; }
  .mc-archive-nav-btn:hover { background:#EBF1FF !important; border-color:#C7D2FE !important; color:#375DFB !important; transform:translateY(-1px); }
  .mc-sort-btn:hover { background:#F3F4F6 !important; }
  .mc-filter-btn:hover { filter:brightness(.98); }
  .mc-fopt:hover { background:#F3F4F6 !important; }
  .course-card-shell {
    transform:translateZ(0);
    transform-origin:center;
    transition:transform .55s cubic-bezier(.22,1,.36,1);
    will-change:transform;
  }
  .course-card-shell:hover { transform:none; }
  .course-card, .course-card-surface {
    transition:border-color .35s ease, box-shadow .55s cubic-bezier(.22,1,.36,1), background .35s ease !important;
    will-change:box-shadow;
  }
  .course-card { overflow:hidden; }
  .course-card-shell:hover .course-card,
  .course-card-shell:hover .course-card-surface {
    border-color:#C7D2FE !important;
    box-shadow:0 22px 55px rgba(17,24,39,.14), 0 10px 26px rgba(55,93,251,.16) !important;
  }
  ${COURSE_CARD_MOTION_CSS}
`;

function injectCss() {
  if (document.getElementById('mc-css-v2')) return;
  const s = document.createElement('style'); s.id = 'mc-css-v2'; s.textContent = CSS;
  document.head.appendChild(s);
}

/* ─── helpers ─── */
function SectionHead({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #F5F5F7' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{icon}<span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{title}</span></div>
      {action}
    </div>
  );
}

/* Сортировка-переключатель: меняет направление и поворачивает стрелку. */
function SortToggle({ label, asc, onToggle }: { label: string; asc: boolean; onToggle: () => void }) {
  return (
    <button className="mc-sort-btn" onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'background .15s' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/></svg>
      {label}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transform: asc ? 'rotate(180deg)' : 'none', transition: 'transform .18s ease' }}><polyline points="6 9 12 15 18 9"/></svg>
    </button>
  );
}

/* Фильтр-выпадающее меню: реально сужает список секции. */
function FilterMenu({ value, options, onChange, label = 'Фильтры' }: { value: string; options: { id: string; label: string }[]; onChange: (id: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);
  const active = value !== options[0].id;
  const current = options.find(o => o.id === value);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="mc-filter-btn" onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: active ? '#EBF1FF' : '#F9FAFB', border: `1px solid ${active ? '#C7D2FE' : '#E5E7EB'}`, borderRadius: 10, padding: '8px 14px', fontSize: 13, color: active ? '#375DFB' : '#374151', fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'background .15s, border-color .15s, color .15s' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
        {active ? current?.label : label}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s ease' }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 60, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 14px 38px rgba(17,24,39,.14)', padding: 6, minWidth: 210, animation: 'mcFadeUp .16s ease both' }}>
          {options.map(o => (
            <button key={o.id} className="mc-fopt" onClick={() => { onChange(o.id); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '9px 12px', background: value === o.id ? '#EBF1FF' : 'transparent', border: 'none', borderRadius: 8, fontSize: 13, color: value === o.id ? '#375DFB' : '#374151', fontWeight: value === o.id ? 600 : 500, cursor: 'pointer', textAlign: 'left', transition: 'background .12s' }}>
              {o.label}
              {value === o.id && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2.4" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Заглушка для пустого результата фильтрации. */
function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: '40px 24px', textAlign: 'center', color: '#9CA3AF' }}>
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 8 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{text}</div>
    </div>
  );
}

function CourseCard({ c, delay }: { c: CourseData; delay: number }) {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const { toggle, has } = useFavoritesStore();
  const faved = has(c.id + 2000, 'course');
  const sc = c.seriesId ? SERIES_COLORS[c.seriesId] : null;

  // ↓ FIX: передаём title в state
  const goToDetail = () => {
    if (!c.locked) navigate(`/my-courses/${encodeURIComponent(c.title)}`, { state: { title: c.title } });
  };

  const blueBtnBase: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), #375DFB',
    boxShadow: '0 0 0 1px #375DFB, 0 1px 2px 0 rgba(37,62,167,0.48)',
    border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer',
  };

  const heartBtnStyle: React.CSSProperties = {
    marginLeft: 'auto', background: 'none', border: 'none', outline: 'none',
    padding: 0, lineHeight: 1, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    transition: 'transform .15s',
  };

  const HeartSvg = () => (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.6722 1.24558C11.3458 -0.538477 8.9574 2.09142 8.9574 2.09142C8.9574 2.09142 6.56886 -0.538485 3.24245 1.24557C-0.786482 3.4064 -1.07579 11.8683 8.9574 15.625C18.9906 11.8683 18.7012 3.40641 14.6722 1.24558Z"
        fill={faved ? '#EF4444' : 'white'} stroke={faved ? '#EF4444' : '#525866'} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );

  const CardImg = () => (
    <div className="c-card-img" style={{ height: 190, position: 'relative', background: '#F3F4F6' }}>
      {!imgErr
        ? <img src={c.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={() => setImgErr(true)} />
        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#EBF1FF,#DFE8FF)' }} />}
      <div className="c-card-overlay" />
      {c.seriesNum !== undefined && (
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 20, display: 'flex', alignItems: 'stretch', boxShadow: '0 2px 10px rgba(0,0,0,.28)', borderRadius: 8, pointerEvents: 'none' }}>
          <div style={{ background: sc?.num || '#374151', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 9px', lineHeight: 1.4, display: 'flex', alignItems: 'center', letterSpacing: .3, borderRadius: c.seriesName ? '8px 0 0 8px' : 8, flexShrink: 0 }}>{String(c.seriesNum).padStart(2, '0')}</div>
          {c.seriesName && (
            <div className="c-mil-text-wrap">
              <div className="c-mil-series-text" style={{ background: 'rgba(255,255,255,.92)', color: '#374151', fontSize: 11, fontWeight: 600, padding: '5px 9px', lineHeight: 1.4, borderRadius: '0 8px 8px 0' }}>{c.seriesName}</div>
            </div>
          )}
        </div>
      )}
      {c.oldPrice && !c.locked && c.seriesNum === undefined && (
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 6, background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 8 }}>СКИДКА</div>
      )}
      {c.locked && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4, borderRadius: '16px 16px 0 0' }}>
          <div className="c-lock-icon" style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,.4)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
        </div>
      )}
    </div>
  );

  const PriceRow = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 18, fontWeight: 800, color: c.locked ? '#9CA3AF' : '#10B981' }}>{c.price.toLocaleString('ru')} <span style={{ fontSize: 13 }}>₽</span></span>
      {c.oldPrice && <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>{(c.oldPrice as number).toLocaleString('ru')} ₽</span>}
      {!c.locked && (
        <button onClick={e => { e.stopPropagation(); toggle({ id: c.id + 2000, kind: 'course', title: c.title, city: c.city, duration: c.duration, price: c.price, format: 'Оффлайн', image: c.img }); }}
          style={heartBtnStyle}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
          <HeartSvg />
        </button>
      )}
    </div>
  );

  const LockNotice = () => c.locked && c.prerequisite && sc ? (
    <div style={{ marginBottom: 10, background: sc.pillBg, border: `1px solid ${sc.pillText}33`, borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={sc.pillText} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>Будет открыт после прохождения{' '}<span onClick={e => e.stopPropagation()} style={{ color: sc.pillText, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>{c.prerequisite}</span></div>
    </div>
  ) : null;

  return (
    <div className="c-mil-shell mc-card" style={{ cursor: c.locked ? 'default' : 'pointer' }} onClick={goToDetail}>
      <div className="c-card-wrap" data-locked={c.locked ? '' : undefined}
        style={{ animation: `fadeSlideUp 0.45s cubic-bezier(.4,0,.2,1) ${delay}ms backwards` }}>
        <CardImg />
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9CA3AF', marginBottom: 7 }}><span>{c.city}</span><span>{c.duration}</span></div>
          <div style={{ fontSize: 15, fontWeight: 700, color: c.locked ? '#6B7280' : '#111', lineHeight: 1.35, marginBottom: 10 }}>{c.title}</div>
          <PriceRow />
        </div>
      </div>
      <div className="c-expand-wrap">
        <div className="c-expand-inner">
          <div style={{ padding: '0 16px 16px' }}>
            <p className="c-oi c-oi-1" style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{c.desc}</p>
            {c.locked
              ? <div className="c-oi c-oi-2"><LockNotice /></div>
              : (
                <div className="c-oi c-oi-2" style={{ display: 'flex', gap: 8 }}>
                  <button onClick={e => { e.stopPropagation(); toggle({ id: c.id + 2000, kind: 'course', title: c.title, city: c.city, duration: c.duration, price: c.price, format: 'Оффлайн', image: c.img }); }} title={faved ? "Убрать из избранного" : "В избранное"} className="c-enroll-btn" style={{ ...blueBtnBase, width: 46, height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={faved ? '#fff' : 'none'} stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  <button onClick={e => { e.stopPropagation(); goToDetail(); }} className="c-enroll-btn" style={{ ...blueBtnBase, flex: 1, height: 46, fontSize: 14, fontWeight: 600 }}>
                    Продолжить обучение
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingRowMenu({ userId, userName }: { userId: number; userName: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', fn);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', fn);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  const toggleMenu = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 6, right: Math.max(12, window.innerWidth - rect.right) });
    }
    setOpen(value => !value);
  };

  const actions = [
    { label: 'Посмотреть профиль', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, onClick: () => { navigate(userProfilePath(userName)); setOpen(false); } },
    { label: 'Написать сообщение', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, onClick: () => { navigate('/dialogs'); setOpen(false); } },
    { label: 'Сравнить со мной', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, onClick: () => { setOpen(false); } },
  ];

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        aria-label={`Действия: ${userName}`}
        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid transparent', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', transition: 'background .15s, border-color .15s, color .15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
      {open && createPortal(
        <div ref={ref} onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: position.top, right: position.right, zIndex: 10000, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 10px 32px rgba(0,0,0,.14)', padding: '6px 0', minWidth: 200 }}>
          {actions.map(a => (
            <button key={a.label} onClick={a.onClick}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', border: 'none', background: 'none', fontSize: 13, color: '#374151', cursor: 'pointer', textAlign: 'left', transition: 'background .1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <span style={{ color: '#6B7280', flexShrink: 0 }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

export function MyCourses() {
  const navigate = useNavigate();
  const viewedLessons = useLessonProgressStore(s => s.lessons);
  const submissions = useLearningStore(s => s.submissions);
  const trackedLessonIds = ['1', '2', '3', '4', '5', '6'];
  const totalLessons = trackedLessonIds.length;
  const viewedCount = trackedLessonIds.filter(id => viewedLessons[id]?.status === 'viewed').length;
  const [ratingSort, setRatingSort] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'index', dir: 'desc' });
  const sortedRating = [...RATING_USERS].sort((a, b) => {
    const av = (a as Record<string, unknown>)[ratingSort.col], bv = (b as Record<string, unknown>)[ratingSort.col];
    const cmp = typeof av === 'string' ? av.localeCompare(String(bv)) : (Number(av) || 0) - (Number(bv) || 0);
    return ratingSort.dir === 'asc' ? cmp : -cmp;
  });
  const toggleRatingSort = (col: string) => setRatingSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'desc' });
  const lessonRows = LESSONS.map(l => ({
    ...l,
    viewed: viewedLessons[String(l.id)]?.status === 'viewed',
  }));
  const progressRows = PROGRESS.map(p => {
    const courseHwIds = HOMEWORKS.filter(h => h.courseSlug === p.slug).map(h => String(h.id));
    let hwProgress = p.hwProgress;
    if (courseHwIds.length > 0) {
      const passedCount = courseHwIds.filter(id => submissions[id]?.passed).length;
      hwProgress = Math.round((passedCount / courseHwIds.length) * 100);
    }
    if (p.id === 1) {
      const courseProgress = Math.round((viewedCount / totalLessons) * 100);
      return { ...p, viewedLessons: `${viewedCount} / ${totalLessons}`, courseProgress, hwProgress, passed: courseProgress === 100 && hwProgress === 100 };
    }
    return { ...p, hwProgress, passed: p.courseProgress === 100 && hwProgress === 100 };
  });

  /* ─── архив ─── */
  const { addToArchive, isArchived, archived } = useCourseArchiveStore();
  const [archivingIds, setArchivingIds] = useState<Set<number>>(new Set());

  const handleArchive = (p: typeof PROGRESS[0]) => {
    if (archivingIds.has(p.id)) return;
    setArchivingIds(prev => new Set([...prev, p.id]));
    setTimeout(() => {
      addToArchive({
        id: p.id, title: p.title, img: p.img, slug: p.slug,
        courseProgress: p.courseProgress, hwProgress: p.hwProgress,
        passed: p.passed, rating: (p as { rating?: number }).rating,
        start: p.start, end: p.end,
      });
      setArchivingIds(prev => { const n = new Set(prev); n.delete(p.id); return n; });
    }, 440);
  };

  /* ─── фильтры секций ─── */
  const [coursesFilter, setCoursesFilter] = useState('all');
  const [hwFilter, setHwFilter] = useState('all');
  const [hwSortAsc, setHwSortAsc] = useState(true);
  const [lessonFilter, setLessonFilter] = useState('all');
  const [lessonSortAsc, setLessonSortAsc] = useState(true);
  const [recFilter, setRecFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Мои курсы
  const filteredProgress = progressRows
    .filter(p => !isArchived(p.id))
    .filter(p => coursesFilter === 'all' ? true : coursesFilter === 'passed' ? p.passed : !p.passed);

  // Домашние задания
  const hwCourseOpts = [{ id: 'all', label: 'Все курсы' }, ...Array.from(new Set(HOMEWORKS.map(h => h.courseSlug))).map(c => ({ id: c, label: c }))];
  const hwOrder = (d: string) => d.includes('завтра') ? 0 : (parseInt(d.replace(/\D+/g, ''), 10) || 999);
  const filteredHw = HOMEWORKS
    .filter(h => hwFilter === 'all' ? true : h.courseSlug === hwFilter)
    .slice()
    .sort((a, b) => hwSortAsc ? hwOrder(a.deadline) - hwOrder(b.deadline) : hwOrder(b.deadline) - hwOrder(a.deadline));

  // Ближайшие занятия
  const filteredLessons = lessonRows
    .filter(l => lessonFilter === 'all' ? true : lessonFilter === 'viewed' ? l.viewed : !l.viewed)
    .slice()
    .sort((a, b) => lessonSortAsc ? a.id - b.id : b.id - a.id);

  // Рекомендуемые курсы
  const recCityOpts = [{ id: 'all', label: 'Все города' }, ...Array.from(new Set(COURSES.map(c => c.city))).map(c => ({ id: c, label: c }))];
  const filteredCourses = COURSES.filter(c => recFilter === 'all' ? true : c.city === recFilter);

  // Рейтинг
  const ratingSpecOpts = [{ id: 'all', label: 'Все специальности' }, ...Array.from(new Set(RATING_USERS.map(u => u.specialty))).map(s => ({ id: s, label: s }))];
  const filteredRating = sortedRating.filter(u => ratingFilter === 'all' ? true : u.specialty === ratingFilter);

  injectCss();

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F8F9FB' }}>

      <div style={{ padding: '20px 24px 40px' }}>

        {/* МОИ КУРСЫ (прогресс обучения) */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', marginBottom: 16, overflow: 'hidden' }}>
          <SectionHead
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
            title="Прогресс обучения"
            action={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="mc-archive-nav-btn"
                  onClick={() => navigate('/course-archive')}
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '7px 12px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                  Архив
                  {archived.length > 0 && (
                    <span style={{ position: 'absolute', top: -7, right: -7, minWidth: 18, height: 18, borderRadius: 9, background: '#375DFB', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxShadow: '0 2px 6px rgba(55,93,251,.45)', lineHeight: 1 }}>
                      {archived.length}
                    </span>
                  )}
                </button>
                <FilterMenu value={coursesFilter} onChange={setCoursesFilter} options={[{ id: 'all', label: 'Все курсы' }, { id: 'passed', label: 'Пройденные' }, { id: 'active', label: 'В процессе' }]} />
              </div>
            }
          />
          <div style={{ padding: '0 24px' }}>
            {filteredProgress.length === 0 && <EmptyState text="Нет курсов по выбранному фильтру" />}
            {filteredProgress.map((p, idx, arr) => (
              <div key={p.id} className={archivingIds.has(p.id) ? 'mc-row' : 'mc-row'} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 8px', borderBottom: idx < arr.length - 1 ? '1px solid #F5F5F7' : 'none', borderRadius: 10, animation: archivingIds.has(p.id) ? 'archiveOut .44s ease forwards' : `mcFadeUp .4s ease ${idx * 60}ms both`, overflow: 'hidden', pointerEvents: archivingIds.has(p.id) ? 'none' : 'auto' }}>
                {/* ↓ FIX: state с title */}
                <div className="mc-thumb" style={{ width: 155, height: 110, background: '#F3F4F6', cursor: 'pointer' }}
                  onClick={() => navigate(`/my-courses/${encodeURIComponent(p.slug)}`, { state: { title: p.title } })}>
                  <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4, cursor: 'pointer' }}
                    onClick={() => navigate(`/my-courses/${encodeURIComponent(p.slug)}`, { state: { title: p.title } })}
                    onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#111')}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
                    Начало — {p.start} <span style={{ width: 3, height: 3, background: '#D1D5DB', borderRadius: '50%', display: 'inline-block' }} /> Конец — {p.end}
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {[['Общий прогресс курса', p.courseProgress, '#C2D6FF'], ['Домашние задания', p.hwProgress, '#38C793']].map(([l, pct, color]) => (
                      <div key={String(l)} style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: '#6B7280' }}>{l}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{pct}%</span>
                        </div>
                        <div style={{ height: 5, background: '#E5E7EB', borderRadius: 3 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: String(color), borderRadius: 3, transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  {p.passed ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#ECFDF5"/><polyline points="7 13 10 16 17 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>Пройден</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Балов за курс <span style={{ fontWeight: 700, color: '#374151' }}>{(p as any).rating}</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#FEF3C7"/></svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>Курс не пройден</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>Просмотрено уроков {(p as any).viewedLessons ?? (p as any).lessons}</div>
                    </>
                  )}
                  {/* ↓ FIX: state с title */}
                  <button className="mc-btn-p"
                    onClick={() => navigate(`/my-courses/${encodeURIComponent(p.slug)}`, { state: { title: p.title } })}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 10, padding: '7px 12px', fontSize: 12, fontWeight: 600, color: '#375DFB', cursor: 'pointer' }}>
                    Подробнее <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                  <button className="mc-btn-arch"
                    onClick={() => handleArchive(p)}
                    title="Добавить в архив"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '7px 12px', fontSize: 12, fontWeight: 600, color: '#6B7280', cursor: 'pointer' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                    В архив
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ДОМАШНИЕ ЗАДАНИЯ */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', marginBottom: 16, overflow: 'hidden' }}>
          <SectionHead
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>}
            title="Домашние задания"
            action={<div style={{ display: 'flex', gap: 10 }}><SortToggle label="По дате сдачи" asc={hwSortAsc} onToggle={() => setHwSortAsc(v => !v)} /><FilterMenu value={hwFilter} onChange={setHwFilter} options={hwCourseOpts} /></div>}
          />
          <div style={{ padding: '0 24px' }}>
            {filteredHw.length === 0 && <EmptyState text="Нет заданий по выбранному фильтру" />}
            {filteredHw.map((hw, idx, arr) => (
              <div key={hw.id} className="mc-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 8px', borderBottom: idx < arr.length - 1 ? '1px solid #F5F5F7' : 'none', borderRadius: 10, animation: `mcFadeUp .4s ease ${idx * 70}ms both` }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div className="mc-thumb" style={{ width: 140, height: 100, background: '#F3F4F6' }}>
                    <img src={hw.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div style={{ position: 'absolute', top: 8, left: 8, background: '#111', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6 }}>{hw.num}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 8 }}>{hw.title}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', background: hw.deadlineColor + '1A', border: `1px solid ${hw.deadlineColor}33`, borderRadius: 8, padding: '3px 10px', fontSize: 12, color: hw.deadlineColor, fontWeight: 500, marginBottom: 12 }}>{hw.deadline}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#F3F4F6' }}>
                      <img src={hw.instructorImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{hw.instructor}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{hw.instructorRole}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>Попыток {hw.attempts}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="mc-btn-s" onClick={() => navigate('/messages?chat=1')}
                      style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                      Задать вопрос
                    </button>
                    {/* ↓ FIX: передаём courseTitle и courseSlug в state для HomeworkPage */}
                    <button className="mc-btn-p"
                      onClick={() => navigate(`/tests/${hw.id}`, {
                        state: { courseTitle: hw.courseSlug, courseSlug: encodeURIComponent(hw.courseSlug) },
                      })}
                      style={{ background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#375DFB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      К выполнению <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* БЛИЖАЙШИЕ ЗАНЯТИЯ */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', marginBottom: 16, overflow: 'hidden' }}>
          <SectionHead
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
            title="Ближайшие занятия"
            action={<div style={{ display: 'flex', gap: 10 }}><SortToggle label="По дате старта" asc={lessonSortAsc} onToggle={() => setLessonSortAsc(v => !v)} /><FilterMenu value={lessonFilter} onChange={setLessonFilter} options={[{ id: 'all', label: 'Все занятия' }, { id: 'viewed', label: 'Просмотренные' }, { id: 'pending', label: 'Не просмотренные' }]} /></div>}
          />
          <div style={{ padding: '0 24px' }}>
            {filteredLessons.length === 0 && <EmptyState text="Нет занятий по выбранному фильтру" />}
            {filteredLessons.map((l, idx, arr) => (
              <div key={l.id} className="mc-row" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 8px', borderBottom: idx < arr.length - 1 ? '1px solid #F5F5F7' : 'none', borderRadius: 10, animation: `mcFadeUp .4s ease ${idx * 60}ms both` }}>
                <div style={{ width: 140, height: 100, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                  <img src={l.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>{l.title}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>{l.location}</div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <div><div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Курс</div><div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{l.course}</div></div>
                    <div><div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Дата и время</div><div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{l.datetime}</div></div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                  <div style={{ background: (l.viewed ? '#10B981' : l.statusColor) + '1A', border: `1px solid ${l.viewed ? '#10B98133' : `${l.statusColor}33`}`, borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: l.viewed ? '#10B981' : l.statusColor }}>{l.viewed ? 'Просмотрено' : l.status}</div>
                  <button className="mc-btn-s" onClick={() => navigate('/messages?chat=7')} style={{ fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>Возьму на борт</button>
                  <button className="mc-btn-p" onClick={() => navigate(`/lessons/${l.id}`, { state: { courseTitle: l.course, courseSlug: encodeURIComponent(l.course) } })}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 10, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#375DFB', cursor: 'pointer' }}>
                    {l.viewed ? 'Открыть урок' : 'Подробнее'} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* РЕКОМЕНДУЕМЫЕ КУРСЫ */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', marginBottom: 16, overflow: 'visible' }}>
          <SectionHead
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
            title="Рекомендуемые курсы"
            action={
              <div style={{ display: 'flex', gap: 10 }}>
                <FilterMenu value={recFilter} onChange={setRecFilter} options={recCityOpts} />
                <button className="mc-btn-p" onClick={() => navigate('/courses')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#375DFB', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  Пройти новый курс +
                </button>
              </div>
            }
          />
          {filteredCourses.length === 0
            ? <EmptyState text="Нет курсов в выбранном городе" />
            : <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, overflow: 'visible' }}>
                {filteredCourses.map((c, i) => <CourseCard key={c.id} c={c} delay={i * 60} />)}
              </div>}
        </div>

        {/* ОБЩИЙ РЕЙТИНГ КУРСАНТОВ */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <SectionHead
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
            title="Общий рейтинг курсантов"
            action={<FilterMenu value={ratingFilter} onChange={setRatingFilter} options={ratingSpecOpts} />}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 200px 140px 150px 140px 44px', padding: '10px 24px', background: '#F9FAFB', borderBottom: '1px solid #F0F0F0' }}>
            {[{ label: '№', key: 'id' }, { label: 'Имя и позывной', key: 'name' }, { label: 'ИВ и рейтинг', key: 'index' }, { label: 'Завершил курсов', key: 'courses' }, { label: 'Выполнил уроков', key: 'lessons' }, { label: 'Получил наград', key: 'awards' }, { label: '', key: '_actions' }].map(h => {
              const active = ratingSort.col === h.key;
              return (
              <div key={h.key} onClick={() => toggleRatingSort(h.key)} style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#375DFB' : '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', userSelect: 'none' }}>
                {h.label}<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={active ? '#375DFB' : '#D1D5DB'} strokeWidth="2" style={{ transform: active && ratingSort.dir === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            );})}
          </div>
          {filteredRating.length === 0 && <EmptyState text="Нет курсантов по выбранной специальности" />}
          {filteredRating.map((u, idx, arr) => (
            <div key={u.id} className="mc-row" style={{ display: 'grid', gridTemplateColumns: '48px 1fr 200px 140px 150px 140px 44px', padding: '14px 24px', borderBottom: idx < arr.length - 1 ? '1px solid #F5F5F7' : 'none', cursor: 'pointer', animation: `mcFadeUp .35s ease ${idx * 40}ms both` }}
              onClick={() => navigate(userProfilePath(u.name))}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center' }}>{idx + 1}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                  <img src={u.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{u.rank} · {u.specialty}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                <IVDisplay index={u.index} rating={u.rating} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center' }}>{u.courses}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center' }}>{u.lessons}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center' }}>{u.awards}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <RatingRowMenu userId={u.id} userName={u.name} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

