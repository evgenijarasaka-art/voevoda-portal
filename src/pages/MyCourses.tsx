import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useLessonProgressStore } from '../store/useLessonProgressStore';

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
  { id: 1, img: '/teacher1-main.jpg', name: 'Бек', rank: 'Майор', specialty: 'Пулемётчик', courses: 22, lessons: 323, awards: 12 },
  { id: 2, img: '/teacher2-main.jpg', name: 'Бек', rank: 'Майор', specialty: 'Пулемётчик', courses: 22, lessons: 323, awards: 12 },
  { id: 3, img: '/teacher3-main.jpg', name: 'Бек', rank: 'Майор', specialty: 'Пулемётчик', courses: 22, lessons: 323, awards: 12 },
  { id: 4, img: '/teacher1-main.jpg', name: 'Бек', rank: 'Майор', specialty: 'Пулемётчик', courses: 22, lessons: 323, awards: 12 },
  { id: 5, img: '/teacher2-main.jpg', name: 'Бек', rank: 'Майор', specialty: 'Пулемётчик', courses: 22, lessons: 323, awards: 12 },
  { id: 6, img: '/teacher3-main.jpg', name: 'Бек', rank: 'Майор', specialty: 'Пулемётчик', courses: 22, lessons: 323, awards: 12 },
];

/* ─── CSS ─── */
const CSS = `
  @keyframes mcFadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
  @keyframes fadeSlideUp{ from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn    { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  .mc-row { transition:background .15s; }
  .mc-row:hover { background:#F9FAFB !important; }
  .mc-btn-p { transition:background .15s, box-shadow .15s, transform .12s; }
  .mc-btn-p:hover { box-shadow:0 4px 18px rgba(55,93,251,.3); transform:translateY(-1px); }
  .mc-btn-s { transition:background .15s, transform .12s; }
  .mc-btn-s:hover { background:#F3F4F6 !important; transform:translateY(-1px); }
  .mc-sort-btn:hover { background:#F3F4F6 !important; }
  .mc-filter-btn:hover { background:#F3F4F6 !important; }
  .course-card-shell {
    transform:translateZ(0);
    transform-origin:center;
    transition:transform .55s cubic-bezier(.22,1,.36,1);
    will-change:transform;
  }
  .course-card-shell:hover { transform:translateY(-8px) scale(1.018); }
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
  .c-img img { transition:transform .5s cubic-bezier(.4,0,.2,1); }
  .c-enroll-btn { transition:opacity .15s,transform .12s; }
  .c-enroll-btn:hover { opacity:.88; transform:translateY(-1px); }
`;

function injectCss() {
  if (document.getElementById('mc-css')) return;
  const s = document.createElement('style'); s.id = 'mc-css'; s.textContent = CSS;
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

function SortBtn({ label }: { label: string }) {
  return (
    <button className="mc-sort-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'background .15s' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/></svg>
      {label}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
  );
}

function FilterBtn() {
  return (
    <button className="mc-filter-btn" onClick={() => document.querySelector('.mc-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'background .15s' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
      Фильтры
    </button>
  );
}

function CourseCard({ c, delay }: { c: CourseData; delay: number }) {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
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
    border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer',
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

  const CardImg = ({ zoom }: { zoom: boolean }) => (
    <div className="c-img" style={{ height: 200, overflow: 'hidden', background: '#F3F4F6', borderRadius: '16px 16px 0 0', position: 'relative' }}>
      {!imgErr
        ? <img src={c.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s cubic-bezier(.4,0,.2,1)', transform: zoom ? 'scale(1.05)' : 'scale(1)' }} onError={() => setImgErr(true)} />
        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#EBF1FF,#DFE8FF)' }} />}
      {c.seriesNum && (
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'stretch', borderRadius: 8, overflow: 'hidden', zIndex: 5, boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}>
          <div style={{ background: sc?.num || '#374151', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 8px', lineHeight: 1.4, display: 'flex', alignItems: 'center' }}>{String(c.seriesNum).padStart(2, '0')}</div>
          {c.seriesName && <div style={{ background: 'rgba(255,255,255,.88)', color: '#374151', fontSize: 11, fontWeight: 500, padding: '4px 8px', lineHeight: 1.4, display: 'flex', alignItems: 'center', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{c.seriesName}</div>}
        </div>
      )}
      {c.oldPrice && !c.locked && !c.seriesNum && (
        <div style={{ position: 'absolute', top: 10, left: 10, background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>СКИДКА</div>
      )}
      {c.locked && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4, borderRadius: '16px 16px 0 0' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,.4)' }}>
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
    <div className="course-card-shell" style={{ position: 'relative', zIndex: hov ? 30 : 1 }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={goToDetail}>
      <div className={`course-card${c.locked ? ' course-card--locked' : ''}`}
        style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', cursor: c.locked ? 'default' : 'pointer', animation: `fadeSlideUp 0.45s cubic-bezier(.4,0,.2,1) ${delay}ms both`, visibility: hov ? 'hidden' : 'visible' }}>
        <CardImg zoom={false} />
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9CA3AF', marginBottom: 7 }}><span>{c.city}</span><span>{c.duration}</span></div>
          <div style={{ fontSize: 15, fontWeight: 700, color: c.locked ? '#6B7280' : '#111', lineHeight: 1.35, marginBottom: 10 }}>{c.title}</div>
          <PriceRow />
        </div>
      </div>
      {hov && (
        <div className="course-card-surface" style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#fff', borderRadius: 16, border: `1px solid ${c.locked ? '#E5E7EB' : '#375DFB'}`, boxShadow: c.locked ? '0 8px 32px rgba(0,0,0,.10)' : '0 8px 32px rgba(55,93,251,.18)', overflow: 'hidden', zIndex: 5, cursor: c.locked ? 'default' : 'pointer', animation: 'scaleIn .15s cubic-bezier(.4,0,.2,1)' }}>
          <CardImg zoom={false} />
          <div style={{ padding: '14px 16px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9CA3AF', marginBottom: 7 }}><span>{c.city}</span><span>{c.duration}</span></div>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.locked ? '#6B7280' : '#111', lineHeight: 1.35, marginBottom: 8 }}>{c.title}</div>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{c.desc}</p>
            <LockNotice />
            <PriceRow />
            {!c.locked && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={e => e.stopPropagation()} className="c-enroll-btn" style={{ ...blueBtnBase, width: 46, height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </button>
                <button onClick={e => e.stopPropagation()} className="c-enroll-btn" style={{ ...blueBtnBase, flex: 1, height: 46, fontSize: 14, fontWeight: 600 }}>
                  Записаться и оплатить
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function MyCourses() {
  const navigate = useNavigate();
  const viewedLessons = useLessonProgressStore(s => s.lessons);
  const viewedCount = LESSONS.filter(l => viewedLessons[String(l.id)]?.status === 'viewed').length;
  const lessonRows = LESSONS.map(l => ({
    ...l,
    viewed: viewedLessons[String(l.id)]?.status === 'viewed',
  }));
  const progressRows = PROGRESS.map(p => p.id === 1
    ? {
        ...p,
        viewedLessons: `${viewedCount} / 19`,
        courseProgress: Math.max(p.courseProgress, Math.round((viewedCount / 19) * 100)),
      }
    : p);
  injectCss();

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F8F9FB' }}>

      {/* BREADCRUMB BAR */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', animation: 'fadeIn .4s ease' }}>
        {([['Главная', '/'], ['Личный кабинет', '/profile'], ['Мои курсы', null]] as [string, string | null][]).map(([label, path], i, arr) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {path
              ? <span onClick={() => navigate(path)} style={{ cursor: 'pointer', transition: 'color .15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}>{label}</span>
              : <span style={{ color: i === arr.length - 1 ? '#374151' : '#9CA3AF', fontWeight: i === arr.length - 1 ? 500 : 400 }}>{label}</span>}
            {i < arr.length - 1 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>
        ))}
      </div>

      <div style={{ padding: '20px 24px 40px' }}>

        {/* МОИ КУРСЫ */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', marginBottom: 16, overflow: 'visible' }}>
          <SectionHead
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
            title="Мои курсы"
            action={
              <div style={{ display: 'flex', gap: 10 }}>
                <FilterBtn />
                <button className="mc-btn-p" onClick={() => navigate('/courses')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#375DFB', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  Пройти новый курс +
                </button>
              </div>
            }
          />
          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, overflow: 'visible' }}>
            {COURSES.map((c, i) => <CourseCard key={c.id} c={c} delay={i * 60} />)}
          </div>
        </div>

        {/* ДОМАШНИЕ ЗАДАНИЯ */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', marginBottom: 16, overflow: 'hidden' }}>
          <SectionHead
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>}
            title="Домашние задания"
            action={<div style={{ display: 'flex', gap: 10 }}><SortBtn label="По дате сдачи" /><FilterBtn /></div>}
          />
          <div style={{ padding: '0 24px' }}>
            {HOMEWORKS.map((hw, idx) => (
              <div key={hw.id} className="mc-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 8px', borderBottom: idx < HOMEWORKS.length - 1 ? '1px solid #F5F5F7' : 'none', borderRadius: 10, animation: `mcFadeUp .4s ease ${idx * 70}ms both` }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 140, height: 100, borderRadius: 12, overflow: 'hidden', background: '#F3F4F6' }}>
                    <img src={hw.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
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
            action={<div style={{ display: 'flex', gap: 10 }}><SortBtn label="По дате старта" /><FilterBtn /></div>}
          />
          <div style={{ padding: '0 24px' }}>
            {lessonRows.map((l, idx) => (
              <div key={l.id} className="mc-row" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 8px', borderBottom: idx < lessonRows.length - 1 ? '1px solid #F5F5F7' : 'none', borderRadius: 10, animation: `mcFadeUp .4s ease ${idx * 60}ms both` }}>
                <div style={{ width: 140, height: 100, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                  <img src={l.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
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

        {/* ПРОГРЕСС ОБУЧЕНИЯ */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', marginBottom: 16, overflow: 'hidden' }}>
          <SectionHead
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
            title="Прогресс обучения"
            action={<FilterBtn />}
          />
          <div style={{ padding: '0 24px' }}>
            {progressRows.map((p, idx) => (
              <div key={p.id} className="mc-row" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 8px', borderBottom: idx < PROGRESS.length - 1 ? '1px solid #F5F5F7' : 'none', borderRadius: 10, animation: `mcFadeUp .4s ease ${idx * 60}ms both` }}>
                {/* ↓ FIX: state с title */}
                <div style={{ width: 155, height: 110, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', cursor: 'pointer' }}
                  onClick={() => navigate(`/my-courses/${encodeURIComponent(p.slug)}`, { state: { title: p.title } })}>
                  <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ОБЩИЙ РЕЙТИНГ КУРСАНТОВ */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <SectionHead
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
            title="Общий рейтинг курсантов"
            action={<FilterBtn />}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 160px 180px 160px', padding: '10px 24px', background: '#F9FAFB', borderBottom: '1px solid #F0F0F0' }}>
            {['№', 'Имя и позывной', 'Завершил курсов', 'Выполнил уроков', 'Получил наград'].map(h => (
              <div key={h} style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                {h}<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><polyline points="7 10 12 5 17 10"/><polyline points="7 14 12 19 17 14"/></svg>
              </div>
            ))}
          </div>
          {RATING_USERS.map((u, idx) => (
            <div key={u.id} className="mc-row" style={{ display: 'grid', gridTemplateColumns: '60px 1fr 160px 180px 160px', padding: '14px 24px', borderBottom: idx < RATING_USERS.length - 1 ? '1px solid #F5F5F7' : 'none', cursor: 'pointer', animation: `mcFadeUp .35s ease ${idx * 40}ms both` }}
              onClick={() => navigate('/profile')}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center' }}>{u.id}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                  <img src={u.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{u.rank} · {u.specialty}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center' }}>{u.courses}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center' }}>{u.lessons}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center' }}>{u.awards}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

