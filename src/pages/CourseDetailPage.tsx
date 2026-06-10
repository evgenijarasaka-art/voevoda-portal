import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useLessonProgressStore } from '../store/useLessonProgressStore';
import { CourseMetaSummary } from '../components/CourseMetaSummary';

/* ─── CSS ─── */
const CSS = `
  @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn  { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
  @keyframes countUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes starPop  { 0%{transform:scale(1)} 40%{transform:scale(1.45)} 70%{transform:scale(.88)} 100%{transform:scale(1)} }
  @keyframes lockShake{ 0%{transform:rotate(0)} 20%{transform:rotate(-8deg)} 40%{transform:rotate(8deg)} 60%{transform:rotate(-4deg)} 80%{transform:rotate(4deg)} 100%{transform:rotate(0)} }
  @keyframes vCardIn  { from{opacity:0;transform:translateY(22px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes vElita   { 0%,100%{box-shadow:0 2px 8px rgba(245,136,58,.28)} 50%{box-shadow:0 4px 18px rgba(245,136,58,.55)} }
  @keyframes vBadgeIn { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
  @keyframes tooltipIn { from{opacity:0;transform:translateX(-50%) translateY(6px) scale(.95)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
  @keyframes reviewIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .cd-section { opacity:0; transform:translateY(20px); transition:opacity .55s cubic-bezier(.4,0,.2,1), transform .55s cubic-bezier(.4,0,.2,1); }
  .cd-section.vis { opacity:1; transform:translateY(0); }

  .cd-lesson-card { transition:box-shadow .25s ease, transform .25s ease, border-color .25s ease; cursor:pointer; }
  .cd-lesson-card:hover:not(.locked) { box-shadow:0 12px 36px rgba(55,93,251,.16); transform:translateY(-5px); border-color:#B8CAFE !important; }
  .cd-lesson-card:hover:not(.locked) .cd-lesson-img { transform:scale(1.06); }
  .cd-lesson-img { transition:transform .5s cubic-bezier(.4,0,.2,1); }
  .cd-lesson-card.locked:hover .cd-lock-icon { animation:lockShake .4s ease; }

  .cd-hw-row { transition:background .15s; border-radius:14px; }
  .cd-hw-row:hover { background:#F6F8FF !important; }
  .cd-mate-row { transition:background .15s; }
  .cd-mate-row:hover { background:#F6F8FF !important; }

  .cd-star-btn { transition:transform .15s, color .15s; }
  .cd-star-btn:hover { transform:scale(1.2); }
  .cd-star-btn.active { animation:starPop .35s ease; }

  .cd-btn-prim { transition:background .15s, box-shadow .15s, transform .12s; }
  .cd-btn-prim:hover { box-shadow:0 6px 22px rgba(55,93,251,.38); transform:translateY(-2px); }
  .cd-btn-sec  { transition:background .15s, border-color .15s, transform .12s; }
  .cd-btn-sec:hover { background:#F3F4F6 !important; transform:translateY(-1px); }

  .cd-series-card { transition:box-shadow .25s ease, transform .25s ease; cursor:pointer; }
  .cd-series-card:hover:not(.locked) { box-shadow:0 14px 42px rgba(55,93,251,.15); transform:translateY(-5px); }
  .cd-series-card:hover:not(.locked) .cd-series-img { transform:scale(1.06); }
  .cd-series-img { transition:transform .5s cubic-bezier(.4,0,.2,1); }

  .cd-iv-wrap { position:relative; display:inline-flex; }
  .cd-rating-tooltip {
    position:absolute; left:50%; bottom:calc(100% + 10px);
    transform:translateX(-50%);
    background:#fff; border:1px solid #E5E7EB; border-radius:16px;
    padding:14px 18px; box-shadow:0 12px 40px rgba(0,0,0,.14);
    z-index:300; width:260px; pointer-events:none;
    animation:tooltipIn .18s ease;
  }
  .cd-rating-tooltip::after {
    content:''; position:absolute; bottom:-5px; left:50%;
    transform:translateX(-50%) rotate(45deg);
    width:10px; height:10px; background:#fff;
    border-right:1px solid #E5E7EB; border-bottom:1px solid #E5E7EB;
  }

  .cd-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn .2s ease; backdrop-filter:blur(6px); }
  .cd-modal-box { background:#fff; border-radius:22px; animation:scaleIn .22s cubic-bezier(.4,0,.2,1); }

  .cd-person-card { transition:transform .45s cubic-bezier(.22,1,.36,1), box-shadow .4s ease, border-color .25s ease; }
  .cd-person-card:hover { transform:translateY(-7px) !important; box-shadow:0 22px 60px rgba(55,93,251,.16) !important; border-color:#B8CAFE !important; }
  .cd-person-card:hover .cd-person-photo { transform:scale(1.06); }
  .cd-person-photo { transition:transform .7s cubic-bezier(.4,0,.2,1); }

  .cd-badge-box { transition:all .22s ease; }
  .cd-badge-box:hover { transform:scale(1.07) !important; box-shadow:0 6px 18px rgba(55,93,251,.14) !important; border-color:#C7D2FE !important; background:#EEF3FF !important; }

  .cd-countdown-digit { animation:countUp .35s ease; font-variant-numeric:tabular-nums; }
  .cd-meta-card { transition:box-shadow .2s, transform .2s; }
  .cd-meta-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(55,93,251,.1); }

  .cd-review-card { animation:reviewIn .3s ease backwards; transition:box-shadow .2s, transform .2s; }
  .cd-review-card:hover { box-shadow:0 6px 24px rgba(55,93,251,.1); transform:translateY(-2px); }

  .cd-bar-fill { transition:width .8s cubic-bezier(.4,0,.2,1); }

  .cd-tab-btn { transition:all .18s ease; border-bottom:2.5px solid transparent; }
  .cd-tab-btn.active { border-bottom-color:#375DFB; color:#375DFB; font-weight:700; }
  .cd-tab-btn:hover:not(.active) { color:#374151; border-bottom-color:#E5E7EB; }
`;

function injectCss(css: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style'); s.id = id; s.textContent = css;
  document.head.appendChild(s);
}

function useReveal(threshold = 0.06) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('vis'); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

function AnimSec({ children, style, id }: { children: React.ReactNode; style?: React.CSSProperties; id?: string }) {
  const ref = useReveal();
  return <div ref={ref} id={id} className="cd-section" style={style}>{children}</div>;
}

/* ─── DATA ─── */
const LESSONS = [
  { id: 1, num: '01', title: 'Введение в военное дело',     date: '3 марта, 2026',  time: 'с 9 до 17', img: '/СписокЗанятий.png', locked: false },
  { id: 2, num: '01', title: 'Холощение с оружием',         date: '3 марта, 2026',  time: 'с 9 до 17', img: '/СписокЗанятий.png', locked: false },
  { id: 3, num: '01', title: 'Действия бойца в лесу',       date: '3 марта, 2026',  time: 'с 9 до 17', img: '/СписокЗанятий.png', locked: true  },
  { id: 4, num: '01', title: 'Тактическая медицина',        date: '10 марта, 2026', time: 'с 9 до 17', img: '/СписокЗанятий.png', locked: false },
  { id: 5, num: '02', title: 'Ориентирование на местности', date: '17 марта, 2026', time: 'с 9 до 17', img: '/СписокЗанятий.png', locked: true  },
  { id: 6, num: '02', title: 'Огневая подготовка',          date: '24 марта, 2026', time: 'с 9 до 17', img: '/СписокЗанятий.png', locked: true  },
];

const HOMEWORKS = [
  { id: 1, img: '/kyrs1.png', num: '01', title: 'Ориентирование в лесистой местности', deadline: 'Сдать до завтра',   deadlineColor: '#F59E0B', attempts: '1 / 3', instructor: 'Бек', role: 'Главный инструктор', instructorImg: '/teacher2-main.jpg' },
  { id: 2, img: '/kyrs2.png', num: '01', title: 'Внутренняя и внешняя баллистика',     deadline: 'Сдать до 14 июня', deadlineColor: '#10B981', attempts: '2 / 3', instructor: 'Бек', role: 'Главный инструктор', instructorImg: '/teacher2-main.jpg' },
  { id: 3, img: '/kyrs3.png', num: '02', title: 'Огневая подготовка снайпера',         deadline: 'Сдать до 28 июня', deadlineColor: '#10B981', attempts: '1 / 3', instructor: 'Бек', role: 'Главный инструктор', instructorImg: '/teacher2-main.jpg' },
];

const SERIES_COURSES = [
  { id: 1, num: '01', title: 'Разведывательно-штурмовая подготовка', city: 'Москва', duration: '3 месяца', price: 29000, img: '/kyrs1.png', status: 'done'   },
  { id: 2, num: '02', title: 'Курс молодого бойца V5',               city: 'Москва', duration: '4 месяца', price: 35000, img: '/kyrs2.png', status: 'active'  },
  { id: 3, num: '03', title: 'Разведывательно-штурмовая подготовка', city: 'Москва', duration: '3 месяца', price: 29000, img: '/kyrs3.png', status: 'locked'  },
  { id: 4, num: '02', title: 'Ускоренная военная подготовка',        city: 'Москва', duration: '3 месяца', price: 31000, img: '/kyrs1.png', status: 'locked'  },
  { id: 5, num: '01', title: 'Тактическая медицина для бойца',       city: 'Москва', duration: '1 месяц',  price: 15000, img: '/kyrs2.png', status: 'locked'  },
  { id: 6, num: '03', title: 'Общевойсковой снайпер V4',             city: 'Москва', duration: '3 месяца', price: 29000, img: '/kyrs3.png', status: 'locked'  },
];

const CLASSMATES = [
  { id: 1, name: 'Бек',     rank: 'Майор',   specialty: 'Пулемётчик', img: '/teacher1-main.jpg', index: 1840, rating: 4.9  },
  { id: 2, name: 'Резак',   rank: 'Майор',   specialty: 'Снайпер',    img: '/teacher2-main.jpg', index: 2100, rating: 5.0  },
  { id: 3, name: 'Шторм',   rank: 'Капитан', specialty: 'Медик',      img: '/teacher3-main.jpg', index: 1560, rating: 4.7  },
  { id: 4, name: 'Лис',     rank: 'Майор',   specialty: 'Разведчик',  img: '/teacher1-main.jpg', index: 1320, rating: null },
  { id: 5, name: 'Волк',    rank: 'Майор',   specialty: 'Сапёр',      img: '/teacher2-main.jpg', index: 980,  rating: 4.8  },
];

const RATING_CRITERIA = [
  { label: 'Знание методик обучения', value: 4.9 },
  { label: 'Подготовка бойцов',       value: 5.0 },
  { label: 'Подготовка командиров',   value: 4.9 },
  { label: 'Выживаемость обученного', value: 5.0 },
  { label: 'Подготовленность',        value: 5.0 },
];

interface Review {
  id: number; name: string; rank: string; img: string;
  stars: number; date: string; text: string; likes: number;
}

const REVIEWS_DATA: Review[] = [
  { id: 1, name: 'Волк',    rank: 'Майор',             img: '/teacher2-main.jpg', stars: 5, date: '15 апр, 2026', likes: 14, text: 'Отличный курс! Преподаватели — профессионалы своего дела. Всё по делу, никакой воды. Рекомендую каждому, кто хочет реально подготовиться к боевым условиям.' },
  { id: 2, name: 'Резак',   rank: 'Капитан',           img: '/teacher1-main.jpg', stars: 5, date: '10 апр, 2026', likes: 11, text: 'Прошёл несколько курсов на портале — этот лучший. Инструктор Торнадо знает своё дело на 100%. Практика перевешивает теорию, что очень ценно для реальной подготовки.' },
  { id: 3, name: 'Лис',     rank: 'Старший лейтенант', img: '/teacher3-main.jpg', stars: 4, date: '2 апр, 2026',  likes: 7,  text: 'Хороший курс, материал подаётся структурированно. Немного не хватило практических занятий по тактической медицине, но в целом очень доволен уровнем подготовки.' },
  { id: 4, name: 'Шторм',   rank: 'Майор',             img: '/teacher2-main.jpg', stars: 5, date: '28 мар, 2026', likes: 9,  text: 'Занятия проходят в хорошем темпе. Особенно понравилась тема ориентирования — практические выходы дали реальные навыки, которые уже пригодились.' },
  { id: 5, name: 'Бек',     rank: 'Подполковник',      img: '/teacher1-main.jpg', stars: 5, date: '20 мар, 2026', likes: 18, text: 'Профессиональный подход и реальные знания от людей с боевым опытом. Именно то, что нужно бойцу. Отдельное спасибо за разбор тактических ошибок на практике.' },
  { id: 6, name: 'Гадюка',  rank: 'Лейтенант',         img: '/teacher3-main.jpg', stars: 4, date: '14 мар, 2026', likes: 5,  text: 'Отличная программа, особенно блок по огневой подготовке. Инструкторы отвечают на вопросы, разбирают ошибки. Буду проходить следующий курс серии.' },
];

interface Person {
  id: number; category: string; rank: string; name: string;
  index: number; rating: number | null; position: string;
  mainImage: string; rankImage: string; smallImages: string[];
  city: string; birthYear: string; joinedDate: string; community: string;
  coursesCompleted: number; awards: number; followers: number;
  bio: string; bioImage: string; extraCount: number; photoPosition?: string;
}

const PEOPLE: Person[] = [
  {
    id: 1, category: 'Преподаватели', rank: 'Майор', name: 'Торнадо',
    index: 2463, rating: 5.0,
    position: 'Вице-капитан, КР 2-й роты, 77-й учебный батальон, Москва',
    mainImage: '/teacher1-main.jpg', rankImage: '/погоны.png',
    smallImages: ['/1.png', '/2.png', '/3.png', '/4.png'],
    city: 'Москва', birthYear: '5 марта, 1990', joinedDate: '2 года, 9 месяцев',
    community: '«Вымпел»', coursesCompleted: 3, awards: 8, followers: 1288,
    bio: 'Попал в ВДВ не просто так. Ещё на гражданке отпрыгал в ДОСААФ три прыжка. Более 12 лет боевого опыта.',
    bioImage: '/banner.jpg', extraCount: 4, photoPosition: 'center top',
  },
  {
    id: 2, category: 'Командиры', rank: 'Майор', name: 'Коба',
    index: 2463, rating: 5.0,
    position: 'Вице-капитан, КР 2-й роты, 77-й учебный батальон, Москва',
    mainImage: '/teacher2-main.jpg', rankImage: '/погоны.png',
    smallImages: ['/1.png', '/2.png', '/3.png', '/4.png'],
    city: 'Санкт-Петербург', birthYear: '14 июня, 1988', joinedDate: '3 года, 2 месяца',
    community: '«Страж»', coursesCompleted: 5, awards: 12, followers: 2047,
    bio: 'Служил в разведке специального назначения. Участник нескольких боевых операций.',
    bioImage: '/banner.jpg', extraCount: 4, photoPosition: 'center center',
  },
  {
    id: 3, category: 'Наши герои', rank: 'Старший лейтенант', name: 'Бор',
    index: 2463, rating: null,
    position: 'Офицер морской пехоты, 77-й учебный батальон, Краснодар',
    mainImage: '/teacher3-main.jpg', rankImage: '/погоны.png',
    smallImages: ['/1.png', '/2.png', '/3.png', '/4.png'],
    city: 'Краснодар', birthYear: '22 февраля, 1992', joinedDate: '1 год, 4 месяца',
    community: '«Форпост»', coursesCompleted: 2, awards: 6, followers: 874,
    bio: 'Офицер морской пехоты. Герой портала «Воевода». Вечная память.',
    bioImage: '/banner.jpg', extraCount: 4, photoPosition: 'center 25%',
  },
];

const COURSE_TITLE_BY_SLUG: Record<string, string> = {
  razvedka: 'Разведывательно-штурмовая подготовка',
  'course-young-fighter': 'Курс молодого бойца V5',
  'kmb-v5': 'Курс молодого бойца V5',
};

const PERSON_CHAT_IDS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 2,
};

function personChatPath(personId: number) {
  return `/messages?chat=${PERSON_CHAT_IDS[personId] ?? 4}`;
}

/* ─── ICONS ─── */
function IcLock() {
  return (
    <div className="cd-lock-icon" style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,.2)' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    </div>
  );
}
function IcCheck() {
  return (
    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(16,185,129,.5)' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
  );
}

function RatingTooltip() {
  return (
    <div className="cd-rating-tooltip">
      {RATING_CRITERIA.map(({ label, value }, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < RATING_CRITERIA.length - 1 ? '1px solid #F5F5F7' : 'none' }}>
          <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: 14, color: '#111' }}>
            {value}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </span>
        </div>
      ))}
    </div>
  );
}

function IVDisplay({ index, rating }: { index: number; rating: number | null }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F9FAFB', padding: '3px 9px', borderRadius: 8, border: '1px solid #E5E7EB' }}>
        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>ИВ</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{index}</span>
      </span>
      {rating !== null && (
        <div className="cd-iv-wrap" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFBEB', padding: '3px 9px', borderRadius: 8, border: '1px solid #FDE68A', cursor: 'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{rating}</span>
          </span>
          {show && <RatingTooltip />}
        </div>
      )}
    </div>
  );
}

function ElitaBadge({ animate = false }: { animate?: boolean }) {
  return (
    <div style={{ background: 'linear-gradient(134.1deg, #FFDD2D 27.4%, #F5883A 143.8%)', borderRadius: 14, padding: '4px 12px', boxShadow: '0 2px 8px rgba(245,136,58,.32)', whiteSpace: 'nowrap' as const, alignSelf: 'flex-start', animation: animate ? 'vElita 2.6s ease-in-out infinite' : undefined }}>
      <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '.7px' }}>элита</span>
    </div>
  );
}

function BadgeBox({ src, tooltip, size = 64 }: { src: string; tooltip?: string; size?: number }) {
  const [err, setErr] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <div className="cd-badge-box" style={{ width: size, height: size, flexShrink: 0, background: '#F6F8FA', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, border: '1.5px solid #EAECF0', cursor: tooltip ? 'pointer' : 'default', position: 'relative', animation: 'vBadgeIn .4s ease backwards' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {!err
        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setErr(true)} />
        : <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}
      {tooltip && show && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: 'rgba(17,17,17,.93)', color: '#fff', fontSize: 12, padding: '7px 13px', borderRadius: 9, whiteSpace: 'nowrap', zIndex: 500, pointerEvents: 'none' }}>
          {tooltip}
          <div style={{ position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 6, height: 6, background: 'rgba(17,17,17,.93)' }} />
        </div>
      )}
    </div>
  );
}

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  return t;
}

function Countdown({ target }: { target: Date }) {
  const { days, hours, minutes, seconds } = useCountdown(target);
  const pad = (n: number) => String(n).padStart(2, '0');
  const items = [{ label: 'дней', val: days }, { label: 'часов', val: hours }, { label: 'минут', val: minutes }, { label: 'секунд', val: seconds }];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {items.map(({ label, val }, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: i < items.length - 1 ? 8 : 0 }}>
          <div style={{ textAlign: 'center', minWidth: 64, background: '#F8F9FB', borderRadius: 14, padding: '10px 8px', border: '1px solid #E5E7EB' }}>
            <div key={val} className="cd-countdown-digit" style={{ fontSize: 30, fontWeight: 800, color: '#111', lineHeight: 1 }}>{pad(val)}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, fontWeight: 500 }}>{label}</div>
          </div>
          {i < items.length - 1 && <span style={{ fontSize: 24, fontWeight: 800, color: '#D1D5DB', marginBottom: 14 }}>:</span>}
        </div>
      ))}
    </div>
  );
}

const COURSE_START_DAY = 23;
const COURSE_START_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function getNextCourseStart(reference = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), COURSE_START_DAY, 9, 0, 0);
  if (start.getTime() <= reference.getTime()) start.setMonth(start.getMonth() + 1);
  return start;
}

function formatCourseStart(date: Date, withYear = true) {
  return `${date.getDate()} ${COURSE_START_MONTHS[date.getMonth()]}${withYear ? ` ${date.getFullYear()}` : ''}`;
}

function CatIcon({ cat, size = 18 }: { cat: string; size?: number }) {
  if (cat === 'Преподаватели') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (cat === 'Командиры') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
}

const PHOTO_H = 340;
const BADGE_SIZE = 64;

function TeacherRatingDialog({ name, onClose }: { name: string; onClose: () => void }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = () => {
    setSaved(true);
    window.setTimeout(onClose, 1400);
  };

  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal-box" onClick={e => e.stopPropagation()} style={{ width: 'min(440px, 100%)', overflow: 'hidden', boxShadow: '0 28px 70px rgba(15,23,42,.28)' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid #EEF2F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#8B95A7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.9px', marginBottom: 4 }}>Оценка преподавателя</div>
            <div style={{ fontSize: 20, color: '#0F172A', fontWeight: 900 }}>{name}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: '#F3F6FB', color: '#64748B', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '24px' }}>
          {!saved ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(i)}
                    style={{ width: 44, height: 44, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, transition: 'transform .14s', transform: i <= (hover || rating) ? 'scale(1.08)' : 'scale(1)' }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill={i <= (hover || rating) ? '#F59E0B' : '#E2E8F0'} stroke="none" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Коротко напишите, что понравилось или что улучшить"
                style={{ width: '100%', minHeight: 110, resize: 'none', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '12px 14px', fontFamily: 'inherit', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
              />
              <button type="button" className="cd-btn-prim" onClick={submit} style={{ width: '100%', border: 'none', borderRadius: 14, background: '#375DFB', color: '#fff', fontSize: 14, fontWeight: 800, padding: '13px 0', cursor: 'pointer', boxShadow: '0 8px 24px rgba(55,93,251,.28)' }}>
                Сохранить оценку {rating}/5
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '22px 0 14px' }}>
              <div style={{ width: 74, height: 74, margin: '0 auto 16px', borderRadius: '50%', background: '#ECFDF5', border: '2px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scaleIn .22s ease both' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>Оценка сохранена</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>Карточка преподавателя обновится после модерации.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonCardFull({ p, onOpenModal, onOpenAll, animDelay = 0 }: { p: Person; onOpenModal: (id: number) => void; onOpenAll: () => void; animDelay?: number }) {
  const navigate = useNavigate();
  const [mErr, setMErr] = useState(false);
  const [rErr, setRErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const badges = p.smallImages.slice(0, 4);
  const badgeColW = BADGE_SIZE * 2 + 8;
  return (
    <>
    <div className="cd-person-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', border: '1.5px solid #EAECF0', boxShadow: '0 2px 16px rgba(0,0,0,.07)', animation: `vCardIn .55s ${animDelay}ms ease backwards`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CatIcon cat={p.category} /><span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{p.category}</span></div>
        <button onClick={onOpenAll} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 13px', background: hovered ? '#EBF1FF' : '#F4F6FA', border: `1.5px solid ${hovered ? '#C7D2FE' : '#E5E7EB'}`, borderRadius: 20, fontSize: 12, fontWeight: 600, color: hovered ? '#375DFB' : '#6B7280', cursor: 'pointer', transition: 'all .25s ease' }}>
          Все <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '0 14px', marginBottom: 14 }}>
        <div style={{ flex: 1, height: PHOTO_H, position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#EFF1F5' }}>
          {!mErr ? <img src={p.mainImage} alt={p.name} className="cd-person-photo" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.photoPosition ?? 'center', display: 'block' }} onError={() => setMErr(true)} /> : <div style={{ width: '100%', height: '100%', background: '#F3F4F6' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,10,20,.6) 0%, rgba(8,10,20,.06) 45%, transparent 70%)', pointerEvents: 'none' }} />
          {!rErr && <div style={{ position: 'absolute', bottom: 10, right: 10, width: 54, height: 54, zIndex: 4 }}><img src={p.rankImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 3px 10px rgba(0,0,0,.5))' }} onError={() => setRErr(true)} /></div>}
        </div>
        <div style={{ width: badgeColW, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <ElitaBadge animate />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, flex: 1, alignContent: 'start' }}>
            {badges.map((src, i) => <BadgeBox key={i} src={src} size={BADGE_SIZE} tooltip={i === 0 ? 'Шеврон «ВОЕВОДА»' : undefined} />)}
            {p.extraCount > 0 && (
              <div onClick={e => { e.stopPropagation(); navigate('/my-path'); }}
                style={{ width: BADGE_SIZE, height: BADGE_SIZE, borderRadius: 14, background: hovered ? 'linear-gradient(135deg, #375DFB, #7B9FFF)' : '#EBF1FF', border: `1.5px solid ${hovered ? 'transparent' : '#C7D2FE'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: hovered ? '#fff' : '#375DFB', cursor: 'pointer', transition: 'all .3s ease' }}>
                +{p.extraCount}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: '0 16px', flex: 1, marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '.7px', fontWeight: 600 }}>{p.rank}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 19, fontWeight: 800, color: '#0D0F14', cursor: 'pointer', letterSpacing: '-.3px', transition: 'color .18s' }} onClick={() => onOpenModal(p.id)} onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#0D0F14')}>{p.name}</span>
          <IVDisplay index={p.index} rating={p.rating} />
        </div>
        <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.55, margin: 0 }}>{p.position}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '0 14px 15px' }}>
        <button className="cd-btn-prim" onClick={() => navigate(personChatPath(p.id))} style={{ background: 'linear-gradient(135deg, #2F52F0, #6B8FFF)', border: 'none', borderRadius: 12, padding: '11px 0', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(55,93,251,.28)' }}>Связаться</button>
        <button onClick={() => navigate('/messages?chat=3')} style={{ background: '#F8F9FC', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '11px 0', color: '#374151', fontSize: 11, cursor: 'pointer', transition: 'all .2s', fontWeight: 500 }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; e.currentTarget.style.background = '#EEF3FF'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#F8F9FC'; }}>Запросить замену</button>
        <button onClick={() => setRatingOpen(true)} style={{ background: '#F8F9FC', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '11px 0', color: '#374151', fontSize: 11, cursor: 'pointer', transition: 'all .2s', fontWeight: 500 }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#FDE68A'; e.currentTarget.style.color = '#D97706'; e.currentTarget.style.background = '#FFFBEB'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#F8F9FC'; }}>Оставить оценку</button>
      </div>
    </div>
    {ratingOpen && <TeacherRatingDialog name={p.name} onClose={() => setRatingOpen(false)} />}
    </>
  );
}

function PersonRow({ p, onOpen, isLast = false }: { p: Person; onOpen: () => void; isLast?: boolean }) {
  const navigate = useNavigate();
  const [mErr, setMErr] = useState(false);
  const [rErr, setRErr] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: isLast ? 'none' : '1px solid #F5F5F7', background: hov ? '#FAFBFF' : 'transparent', transition: 'background .14s' }} onMouseOver={() => setHov(true)} onMouseOut={() => setHov(false)}>
      <div onClick={onOpen} style={{ position: 'relative', flexShrink: 0, width: 74, height: 74, cursor: 'pointer' }}>
        {!mErr ? <img src={p.mainImage} alt={p.name} style={{ width: 62, height: 62, borderRadius: 12, objectFit: 'cover', objectPosition: p.photoPosition ?? 'center', border: '1px solid #E5E7EB', display: 'block', transition: 'transform .3s', transform: hov ? 'scale(1.04)' : 'scale(1)' }} onError={() => setMErr(true)} /> : <div style={{ width: 62, height: 62, borderRadius: 12, background: '#F3F4F6', border: '1px solid #E5E7EB' }} />}
        {!rErr && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28 }}><img src={p.rankImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,.35))' }} onError={() => setRErr(true)} /></div>}
      </div>
      <div onClick={onOpen} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: '.5px' }}>{p.rank}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: hov ? '#375DFB' : '#111', transition: 'color .15s' }}>{p.name}</span>
          <IVDisplay index={p.index} rating={p.rating} />
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.position}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {p.smallImages.slice(0, 3).map((src, i) => <BadgeBox key={i} src={src} size={46} />)}
        {p.extraCount > 0 && (
          <div style={{ width: 46, height: 46, borderRadius: 12, background: '#EBF1FF', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#375DFB', cursor: 'pointer', transition: 'all .18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#375DFB,#7B9FFF)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#EBF1FF'; e.currentTarget.style.color = '#375DFB'; e.currentTarget.style.borderColor = '#C7D2FE'; }}
            onClick={() => navigate('/my-path')}>+{p.extraCount}</div>
        )}
      </div>
    </div>
  );
}

type ModalMode = { type: 'person'; personId: number } | { type: 'list'; category: string };

function PersonModal({ mode, onClose }: { mode: ModalMode; onClose: () => void }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<ModalMode>(mode);
  const [tab, setTab] = useState<'Данные' | 'Подготовка' | 'Замеры'>('Данные');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('Все города');
  const [ratingPerson, setRatingPerson] = useState<Person | null>(null);
  const categoryPeople = useMemo(() => current.type === 'list' ? PEOPLE.filter(p => p.category === current.category) : [], [current]);
  const cities = useMemo(() => ['Все города', ...Array.from(new Set(categoryPeople.map(p => p.city)))], [categoryPeople]);
  const filtered = useMemo(() => categoryPeople.filter(p => {
    const matchCity = cityFilter === 'Все города' || p.city === cityFilter;
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.rank.toLowerCase().includes(q)) && matchCity;
  }), [categoryPeople, search, cityFilter]);

  if (current.type === 'list') {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, backdropFilter: 'blur(6px)', animation: 'fadeIn .2s ease' }}>
        <div onClick={e => e.stopPropagation()} style={{ maxWidth: 740, width: '100%', background: '#fff', borderRadius: 22, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 28px 70px rgba(0,0,0,.22)', animation: 'scaleIn .22s cubic-bezier(.4,0,.2,1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid #F0F0F0', flexShrink: 0, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}><CatIcon cat={current.category} /><span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{current.category}</span><span style={{ fontSize: 13, color: '#9CA3AF' }}>({filtered.length})</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '6px 12px', flex: '0 1 180px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#111', width: '100%' }} />
            </div>
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: '#374151', background: '#F9FAFB', cursor: 'pointer', outline: 'none' }}>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0
              ? <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Ничего не найдено</div>
              : filtered.map((per, i) => <PersonRow key={per.id} p={per} isLast={i === filtered.length - 1} onOpen={() => { setCurrent({ type: 'person', personId: per.id }); setTab('Данные'); }} />)}
          </div>
        </div>
      </div>
    );
  }

  const p = PEOPLE.find(x => x.id === current.personId) ?? PEOPLE[0];
  return (
    <>
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, backdropFilter: 'blur(6px)', animation: 'fadeIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: '100%', background: '#fff', borderRadius: 22, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 28px 70px rgba(0,0,0,.22)', animation: 'scaleIn .22s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CatIcon cat={p.category} /><span style={{ fontSize: 16, fontWeight: 700 }}>{p.category}</span></div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => { setCurrent({ type: 'list', category: p.category }); setSearch(''); setCityFilter('Все города'); }} style={{ background: 'none', border: 'none', color: '#375DFB', fontSize: 13, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>Все <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg></button>
            <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: '1px solid #F0F0F0', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 68, height: 68, borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#F3F4F6' }}><img src={p.mainImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.photoPosition ?? 'center' }} /></div>
            <div style={{ position: 'absolute', bottom: -8, right: -8, width: 34, height: 34 }}><img src={p.rankImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.3))' }} /></div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '.6px', fontWeight: 600 }}>{p.rank}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 6 }}>{p.name}</div>
            <IVDisplay index={p.index} rating={p.rating} />
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{p.position}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <ElitaBadge animate />
            {p.smallImages.slice(0, 3).map((src, i) => <BadgeBox key={i} src={src} size={44} />)}
            {p.extraCount > 0 && <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EBF1FF', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#375DFB', cursor: 'pointer', transition: 'all .2s' }} onClick={() => { onClose(); navigate('/my-path'); }}>+{p.extraCount}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', padding: '0 24px' }}>
          {(['Данные', 'Подготовка', 'Замеры'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tab === t ? '2.5px solid #375DFB' : '2.5px solid transparent', color: tab === t ? '#375DFB' : '#6B7280', fontWeight: tab === t ? 700 : 400, fontSize: 13, cursor: 'pointer', marginBottom: -1, transition: 'color .15s' }}>{t}</button>
          ))}
        </div>
        <div style={{ padding: '20px 24px' }}>
          {tab === 'Данные' && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 200px' }}>
                {([['Город', p.city], ['Год рождения', p.birthYear], ['На портале', p.joinedDate], ['Сообщество', p.community], ['Прошёл курсов', String(p.coursesCompleted)], ['Наград', String(p.awards)], ['Подписчиков', p.followers.toLocaleString()]] as [string, string][]).map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #F5F5F7', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#9CA3AF', width: 110, flexShrink: 0 }}>{l}</span>
                    <span style={{ fontSize: 13, color: '#111', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ borderRadius: 12, overflow: 'hidden', height: 160, background: '#F3F4F6', marginBottom: 12 }}><img src={p.bioImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>{p.bio}</p>
              </div>
            </div>
          )}
          {tab === 'Подготовка' && <div style={{ textAlign: 'center', padding: 32, background: '#F8F9FB', borderRadius: 16, color: '#9CA3AF', fontSize: 14 }}>График подготовки доступен в полном профиле</div>}
          {tab === 'Замеры' && <div style={{ textAlign: 'center', padding: 32, background: '#F8F9FB', borderRadius: 16, color: '#9CA3AF', fontSize: 14 }}>Сводка замеров доступна в полном профиле</div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 24px 22px' }}>
          <button className="cd-btn-prim" onClick={() => { onClose(); navigate(personChatPath(p.id)); }} style={{ background: 'linear-gradient(135deg,#2F52F0,#6B8FFF)', border: 'none', borderRadius: 14, padding: '13px 0', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 5px 18px rgba(55,93,251,.32)' }}>Связаться</button>
          <button onClick={() => { onClose(); navigate('/messages?chat=3'); }} style={{ background: '#F8F9FC', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '13px 0', color: '#374151', fontSize: 13, cursor: 'pointer', transition: 'all .22s ease' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; e.currentTarget.style.background = '#EEF3FF'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#F8F9FC'; }}>Запросить замену</button>
          <button onClick={() => setRatingPerson(p)} style={{ background: '#F8F9FC', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '13px 0', color: '#374151', fontSize: 13, cursor: 'pointer', transition: 'all .22s ease' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#FDE68A'; e.currentTarget.style.color = '#D97706'; e.currentTarget.style.background = '#FFFBEB'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#F8F9FC'; }}>Оставить оценку</button>
        </div>
      </div>
    </div>
    {ratingPerson && <TeacherRatingDialog name={ratingPerson.name} onClose={() => setRatingPerson(null)} />}
    </>
  );
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(i => <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= value ? '#F59E0B' : '#E5E7EB'} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}</div>;
}

function RatingBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: '#6B7280', width: 180, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
        <div className="cd-bar-fill" style={{ height: '100%', width: `${(value / max) * 100}%`, background: 'linear-gradient(90deg, #375DFB, #7B9FFF)', borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#111', width: 30, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function ReviewCard({ r, delay = 0 }: { r: Review; delay?: number }) {
  const [liked, setLiked] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="cd-review-card" style={{ background: '#F9FAFB', borderRadius: 16, padding: '16px 18px', border: '1px solid #EAECF0', animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#EBF1FF', border: '2px solid #E5E7EB' }}>
          {!imgErr ? <img src={r.img} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErr(true)} /> : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{r.name}</span>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{r.date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stars value={r.stars} size={13} />
            <span style={{ fontSize: 11, color: '#9CA3AF', background: '#F0F0F5', padding: '1px 8px', borderRadius: 6 }}>{r.rank}</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: '0 0 12px' }}>{r.text}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <button onClick={() => setLiked(l => !l)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: liked ? '#FFF7ED' : 'transparent', border: `1px solid ${liked ? '#FDE68A' : '#E5E7EB'}`, borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: liked ? '#D97706' : '#9CA3AF', transition: 'all .18s ease' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? '#F59E0B' : 'none'} stroke={liked ? '#F59E0B' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          {r.likes + (liked ? 1 : 0)}
        </button>
      </div>
    </div>
  );
}

function RatingSection() {
  const [tab, setTab] = useState<'reviews' | 'add'>('reviews');
  const [page, setPage] = useState(0);
  const [myStars, setMyStars] = useState(5);
  const [hoverStar, setHoverStar] = useState(0);
  const [myText, setMyText] = useState('');
  const [reviews, setReviews] = useState<Review[]>(REVIEWS_DATA);
  const [submitted, setSubmitted] = useState(false);
  const PER_PAGE = 3;
  const totalPages = Math.ceil(reviews.length / PER_PAGE);
  const pageReviews = reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const avgRating = (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1);
  const distribution = [5,4,3,2,1].map(s => ({ stars: s, count: reviews.filter(r => r.stars === s).length }));

  function handleSubmit() {
    if (!myText.trim()) return;
    setReviews(prev => [{ id: Date.now(), name: 'Вы', rank: 'Боец', img: '/teacher1-main.jpg', stars: myStars, date: 'Только что', text: myText, likes: 0 }, ...prev]);
    setMyText(''); setSubmitted(true); setTab('reviews'); setPage(0);
  }

  return (
    <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' as const, overflow: 'hidden' }}>
      <div style={{ padding: '20px 22px 0', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>Отзывы о курсе</span>
          </div>
          <span style={{ fontSize: 12, color: '#9CA3AF', background: '#F4F6FA', padding: '2px 9px', borderRadius: 20, border: '1px solid #E5E7EB' }}>{reviews.length} отзывов</span>
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 16, alignItems: 'flex-start' }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#111', lineHeight: 1 }}>{avgRating}</div>
            <Stars value={Math.round(Number(avgRating))} size={16} />
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>из 5.0</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {distribution.map(({ stars, count }) => (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#9CA3AF', width: 8, textAlign: 'right', flexShrink: 0 }}>{stars}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B" stroke="none" style={{ flexShrink: 0 }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                  <div className="cd-bar-fill" style={{ height: '100%', width: `${(count / reviews.length) * 100}%`, background: stars >= 4 ? 'linear-gradient(90deg,#10B981,#34D399)' : stars === 3 ? '#F59E0B' : '#EF4444', borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 11, color: '#9CA3AF', width: 14, textAlign: 'right', flexShrink: 0 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '12px 14px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RATING_CRITERIA.map(({ label, value }) => <RatingBar key={label} label={label} value={value} />)}
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {([['reviews', 'Отзывы'], ['add', submitted ? 'Изменить отзыв' : 'Добавить отзыв']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`cd-tab-btn ${tab === key ? 'active' : ''}`}
              style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: `2.5px solid ${tab === key ? '#375DFB' : 'transparent'}`, color: tab === key ? '#375DFB' : '#6B7280', fontWeight: tab === key ? 700 : 400, fontSize: 13, cursor: 'pointer', marginBottom: -1, transition: 'all .15s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
        {tab === 'reviews' ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pageReviews.map((r, i) => <ReviewCard key={r.id} r={r} delay={i * 60} />)}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #E5E7EB', background: page === 0 ? '#F9FAFB' : '#fff', cursor: page === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 0 ? .4 : 1, transition: 'all .15s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i)} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${i === page ? '#375DFB' : '#E5E7EB'}`, background: i === page ? '#375DFB' : '#fff', color: i === page ? '#fff' : '#374151', fontSize: 13, fontWeight: i === page ? 700 : 400, cursor: 'pointer', transition: 'all .15s' }}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #E5E7EB', background: page === totalPages - 1 ? '#F9FAFB' : '#fff', cursor: page === totalPages - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages - 1 ? .4 : 1, transition: 'all .15s' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {submitted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '10px 14px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: 13, color: '#065F46', fontWeight: 500 }}>Ваш отзыв уже опубликован. Вы можете изменить его.</span>
              </div>
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Ваша оценка</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map(i => (
                  <button key={i} className={`cd-star-btn ${i <= myStars ? 'active' : ''}`} onMouseEnter={() => setHoverStar(i)} onMouseLeave={() => setHoverStar(0)} onClick={() => setMyStars(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill={i <= (hoverStar || myStars) ? '#F59E0B' : '#E5E7EB'} stroke="none" style={{ transition: 'fill .15s' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                ))}
                <span style={{ fontSize: 13, color: '#9CA3AF', marginLeft: 6, alignSelf: 'center' }}>{['', 'Плохо', 'Нормально', 'Хорошо', 'Отлично', 'Превосходно'][hoverStar || myStars]}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Ваш отзыв</div>
              <textarea value={myText} onChange={e => setMyText(e.target.value)} placeholder="Расскажите о курсе: что понравилось, что можно улучшить..." rows={4}
                style={{ width: '100%', boxSizing: 'border-box' as const, padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 14, fontSize: 13, color: '#374151', resize: 'none', outline: 'none', lineHeight: 1.6, transition: 'border-color .15s', background: '#F9FAFB', fontFamily: 'inherit' }}
                onFocus={e => (e.target.style.borderColor = '#375DFB')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: myText.length > 400 ? '#EF4444' : '#9CA3AF' }}>{myText.length}/500</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSubmit} disabled={!myText.trim()} className="cd-btn-prim"
                style={{ flex: 1, padding: '12px 0', background: myText.trim() ? 'linear-gradient(135deg, #2F52F0, #6B8FFF)' : '#E5E7EB', border: 'none', borderRadius: 14, color: myText.trim() ? '#fff' : '#9CA3AF', fontSize: 14, fontWeight: 700, cursor: myText.trim() ? 'pointer' : 'default', boxShadow: myText.trim() ? '0 5px 18px rgba(55,93,251,.32)' : 'none', transition: 'all .2s' }}>
                Опубликовать отзыв
              </button>
              <button onClick={() => setTab('reviews')} style={{ padding: '12px 20px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}>
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══ MAIN PAGE ══ */
export function CourseDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const viewedLessons = useLessonProgressStore(s => s.lessons);

  // ↓ FIX: читаем title из router state
  const stateTitle = (location.state as { title?: string } | null)?.title;

  // ↓ FIX: sessionStorage как постоянный кэш по slug
  const cacheKey = `course_title_${slug}`;
  const rawCachedTitle = slug ? sessionStorage.getItem(cacheKey) : null;
  const cachedTitle = rawCachedTitle && rawCachedTitle !== slug ? rawCachedTitle : null;

  const courseName =
    stateTitle ??
    cachedTitle ??
    (slug && COURSE_TITLE_BY_SLUG[slug] ? COURSE_TITLE_BY_SLUG[slug] : 'Разведывательно-штурмовая подготовка');

  // Сохраняем в кэш при наличии свежего title из state
  useEffect(() => {
    if (stateTitle && slug) {
      sessionStorage.setItem(cacheKey, stateTitle);
    }
  }, [stateTitle, slug, cacheKey]);

  const [personModal, setPersonModal] = useState<{ mode: ModalMode } | null>(null);
  const [soldierErr, setSoldierErr] = useState(false);
  const [sergeantErr, setSergeantErr] = useState(false);
  const targetDate = useMemo(() => getNextCourseStart(), []);
  const targetLabel = useMemo(() => formatCourseStart(targetDate), [targetDate]);
  useEffect(() => { injectCss(CSS, 'cd-css-v3'); }, []);

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F4F6FB' }}>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', animation: 'fadeIn .4s ease' }}>
        {([['Главная', '/'], ['Мои курсы', '/my-courses'], [courseName, null]] as [string, string | null][]).map(([label, path], i, arr) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {path
              ? <span onClick={() => navigate(path)} style={{ cursor: 'pointer', transition: 'color .15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}>{label}</span>
              : <span style={{ color: '#374151', fontWeight: 500 }}>{label}</span>}
            {i < arr.length - 1 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>
        ))}
      </div>

      <div style={{ padding: '24px 28px 56px' }}>

        {/* ══ DARK BANNER ══ */}
        <AnimSec style={{ marginBottom: 22 }}>
          <div style={{ position: 'relative', borderRadius: 26, overflow: 'hidden', minHeight: 440, background: '#0a0a14', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,8,20,.97) 38%, rgba(8,8,20,.25) 100%)' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '46%' }}>
              {!soldierErr ? <img src="/СолдатКурса.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} onError={() => setSoldierErr(true)} /> : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0a0a14 0%, transparent 45%)' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 2, padding: '44px 48px', maxWidth: 640 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(55,93,251,.2)', border: '1px solid rgba(55,93,251,.4)', borderRadius: 20, padding: '5px 14px', fontSize: 13, color: '#7B9FFF', marginBottom: 20, backdropFilter: 'blur(8px)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ marginRight: 6 }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                Курс
              </div>
              <h1 style={{ fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1.18, margin: '0 0 16px', animation: 'fadeUp .5s ease', letterSpacing: '-.5px' }}>{courseName}</h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, margin: '0 0 30px', animation: 'fadeUp .5s ease .08s both' }}>
                Поможем освоить все навыки с нуля за 9 месяцев.<br />В строю с подготовленными командирами Воевода.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'fadeUp .5s ease .16s both' }}>
                <button className="cd-btn-prim" onClick={() => document.getElementById('lessons-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  style={{ padding: '14px 32px', background: '#375DFB', border: 'none', borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 22px rgba(55,93,251,.5)' }}>
                  К списку занятий
                </button>
                <button onClick={() => navigate('/messages?chat=1')}
                  style={{ padding: '14px 24px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 14, color: '#fff', fontSize: 15, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background .2s, transform .12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.18)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  Задать вопрос инструктору
                </button>
                <button onClick={() => navigate('/messages?chat=4')}
                  style={{ padding: '14px 24px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 14, color: '#fff', fontSize: 15, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background .2s, transform .12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.18)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  Чат группы на портале
                </button>
                <button onClick={() => navigate(`/my-courses/${slug}/progress`, { state: { title: courseName } })}
                  style={{ padding: '14px 24px', background: 'rgba(55,93,251,.35)', border: '1px solid rgba(55,93,251,.6)', borderRadius: 14, color: '#fff', fontSize: 15, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background .2s, transform .12s', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(55,93,251,.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(55,93,251,.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Прогресс курса
                </button>
              </div>
            </div>
          </div>
        </AnimSec>

        {/* ══ METADATA ══ */}
        <AnimSec style={{ marginBottom: 22 }}>
          <CourseMetaSummary />
        </AnimSec>

        {/* ══ INSTRUCTOR + COUNTDOWN ══ */}
        <AnimSec style={{ marginBottom: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="cd-meta-card" style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 76, height: 76, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                {!sergeantErr ? <img src="/сержант.png" alt="Торнадо" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} onError={() => setSergeantErr(true)} /> : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: '.5px' }}>Вице-ст. сержант</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>Торнадо</span>
                  <IVDisplay index={2463} rating={5.0} />
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>Главный инструктор</div>
                <button className="cd-btn-prim" onClick={() => navigate('/messages?chat=1')} style={{ padding: '9px 20px', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 12, color: '#375DFB', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Задать вопрос по курсу</button>
              </div>
            </div>
            <div className="cd-meta-card" style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 20 }}>Ближайший старт группы — <span style={{ color: '#375DFB', fontWeight: 800 }}>{targetLabel}</span></div>
              <Countdown target={targetDate} />
            </div>
          </div>
        </AnimSec>

        {/* ══ LESSON LIST ══ */}
        <AnimSec id="lessons-section" style={{ marginBottom: 22 }}>
          <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                <span style={{ fontSize: 19, fontWeight: 700, color: '#111' }}>Список занятий по курсу</span>
                <span style={{ fontSize: 13, color: '#9CA3AF', background: '#F4F6FA', padding: '3px 10px', borderRadius: 20, border: '1px solid #E5E7EB' }}>{LESSONS.length} занятий</span>
              </div>
              <button onClick={() => document.querySelector('.cd-lesson-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>Фильтры
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              {LESSONS.map((l, idx) => (
                <div key={l.id} className={`cd-lesson-card ${l.locked ? 'locked' : ''}`}
                  onClick={() => !l.locked ? navigate(`/lessons/${l.id}`, { state: { courseTitle: courseName, courseSlug: slug } }) : null}
                  style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid #E5E7EB', animation: `fadeUp .45s ease ${idx * 65}ms both`, background: '#fff' }}>
                  <div style={{ height: 200, background: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
                    <img src={l.img} alt={l.title} className="cd-lesson-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: l.locked ? 'brightness(.5) saturate(.7)' : 'none', transition: 'filter .3s' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    <div style={{ position: 'absolute', inset: 0, background: l.locked ? 'rgba(0,0,0,.2)' : 'linear-gradient(to top, rgba(0,0,0,.4) 0%, transparent 55%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)' }}>{l.num}</div>
                    {viewedLessons[String(l.id)]?.status === 'viewed' && <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,.92)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 9px', borderRadius: 20, border: '1px solid rgba(255,255,255,.25)' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Просмотрено</div>}
                    {l.locked && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcLock /></div>}
                    {!l.locked && viewedLessons[String(l.id)]?.status !== 'viewed' && <div style={{ position: 'absolute', bottom: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: 'rgba(55,93,251,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(55,93,251,.4)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4C9D4" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{l.date}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4C9D4" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{l.time}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: l.locked ? '#9CA3AF' : '#111', lineHeight: 1.4 }}>{l.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimSec>

        {/* ══ HOMEWORK ══ */}
        <AnimSec style={{ marginBottom: 22 }}>
          <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 26px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="#374151" stroke="none"/><circle cx="4" cy="12" r="1" fill="#374151" stroke="none"/><circle cx="4" cy="18" r="1" fill="#374151" stroke="none"/></svg>
                <span style={{ fontSize: 19, fontWeight: 700, color: '#111' }}>Домашние задания</span>
              </div>
              <button onClick={() => document.querySelector('.cd-hw-row')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>Фильтры
              </button>
            </div>
            <div style={{ padding: '0 26px' }}>
              {HOMEWORKS.map((hw, idx) => (
                <div key={hw.id} className="cd-hw-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 18, padding: '20px 0', borderBottom: idx < HOMEWORKS.length - 1 ? '1px solid #F5F5F7' : 'none', animation: `fadeUp .4s ease ${idx * 70}ms both` }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 150, height: 106, borderRadius: 14, overflow: 'hidden', background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                      <img src={hw.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{hw.num}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 10 }}>{hw.title}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: hw.deadlineColor + '18', border: `1px solid ${hw.deadlineColor}30`, borderRadius: 8, padding: '4px 12px', fontSize: 12, color: hw.deadlineColor, fontWeight: 600, marginBottom: 14 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 5 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{hw.deadline}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', background: '#F3F4F6', flexShrink: 0 }}>
                        <img src={hw.instructorImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <div><div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{hw.instructor}</div><div style={{ fontSize: 11, color: '#9CA3AF' }}>{hw.role}</div></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: '#9CA3AF', background: '#F4F6FA', padding: '3px 10px', borderRadius: 20, border: '1px solid #E5E7EB' }}>Попыток {hw.attempts}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="cd-btn-sec" onClick={() => navigate('/messages?chat=1')} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 16px', fontSize: 13, color: '#374151', cursor: 'pointer' }}>Задать вопрос</button>
                      {/* ↓ FIX: передаём courseTitle и courseSlug для HomeworkPage */}
                      <button className="cd-btn-prim"
                        onClick={() => navigate(`/homework/${hw.id}`, { state: { courseTitle: courseName, courseSlug: slug } })}
                        style={{ background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, color: '#375DFB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        К выполнению <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimSec>

        {/* ══ SERIES COURSES ══ */}
        <AnimSec style={{ marginBottom: 22 }}>
          <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span style={{ fontSize: 19, fontWeight: 700, color: '#111' }}>Другие курсы из серии</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              {SERIES_COURSES.map((c, idx) => (
                <div key={c.id} className={`cd-series-card ${c.status === 'locked' ? 'locked' : ''}`}
                  // ↓ FIX: передаём title в state
                  onClick={() => c.status !== 'locked' ? navigate(`/my-courses/${encodeURIComponent(c.title)}`, { state: { title: c.title } }) : null}
                  style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid #E5E7EB', animation: `fadeUp .45s ease ${idx * 55}ms both`, opacity: c.status === 'locked' ? .8 : 1, background: '#fff' }}>
                  <div style={{ height: 210, background: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
                    <img src={c.img} alt="" className="cd-series-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: c.status === 'locked' ? 'brightness(.5) saturate(.7)' : 'none', transition: 'filter .3s' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 55%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)' }}>{c.num}</div>
                    {c.status === 'done' && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcCheck /></div>}
                    {c.status === 'locked' && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcLock /></div>}
                    {c.status === 'active' && <div style={{ position: 'absolute', top: 10, right: 10, background: '#375DFB', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>В процессе</div>}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}><span>{c.city}</span><span>{c.duration}</span></div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.status === 'locked' ? '#9CA3AF' : '#111', lineHeight: 1.4, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{c.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#10B981' }}>{c.price.toLocaleString('ru')} <span style={{ fontSize: 12, fontWeight: 500 }}>₽</span></span>
                      <button onClick={e => { e.stopPropagation(); navigate('/favorites'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', padding: 2, transition: 'color .15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')} onMouseLeave={e => (e.currentTarget.style.color = '#D1D5DB')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimSec>

        {/* ══ PEOPLE SECTION ══ */}
        <AnimSec style={{ marginBottom: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {PEOPLE.map((p, i) => (
              <PersonCardFull key={p.id} p={p} animDelay={i * 90}
                onOpenModal={id => setPersonModal({ mode: { type: 'person', personId: id } })}
                onOpenAll={() => setPersonModal({ mode: { type: 'list', category: p.category } })}
              />
            ))}
          </div>
        </AnimSec>

        {/* ══ CLASSMATES + RATING ══ */}
        <AnimSec style={{ marginBottom: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'stretch' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Одногруппники */}
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 22px 16px', borderBottom: '1px solid #F0F0F0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Одногруппники</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF', background: '#F4F6FA', padding: '2px 9px', borderRadius: 20, border: '1px solid #E5E7EB', marginLeft: 'auto' }}>{CLASSMATES.length} бойцов</span>
                </div>
                <div style={{ flex: 1 }}>
                  {CLASSMATES.map((m, idx) => (
                    <div key={m.id} className="cd-mate-row" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: idx < CLASSMATES.length - 1 ? '1px solid #F5F5F7' : 'none', animation: `fadeUp .35s ease ${idx * 55}ms both` }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '2px solid #E5E7EB' }}>
                        <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{m.name}</span>
                          <IVDisplay index={m.index} rating={m.rating} />
                        </div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{m.rank} · {m.specialty}</div>
                      </div>
                      <button className="cd-btn-sec" onClick={() => navigate(`/messages?chat=${m.id % 3 === 0 ? 7 : m.id % 2 === 0 ? 5 : 2}`)}
                        style={{ padding: '8px 16px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: '#374151', cursor: 'pointer', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; e.currentTarget.style.background = '#EEF3FF'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#fff'; }}>
                        Написать
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '16px 20px', borderTop: '1px solid #F0F0F0', display: 'flex', gap: 10 }}>
                  <button onClick={() => navigate('/messages?chat=4')} style={{ flex: 1, padding: '11px 0', background: '#F0F4FF', border: '1.5px solid #C7D2FE', borderRadius: 12, color: '#375DFB', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background .15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#E0E9FF'; }} onMouseLeave={e => { e.currentTarget.style.background = '#F0F4FF'; }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Группа в сообщениях
                  </button>
                  <button className="cd-btn-prim" onClick={() => navigate('/messages?chat=4')} style={{ flex: 1, padding: '11px 0', background: 'linear-gradient(135deg, #2F52F0, #6B8FFF)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 14px rgba(55,93,251,.28)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Чат на портале
                  </button>
                </div>
              </div>

              {/* Мой прогресс */}
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '20px 22px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Мой прогресс</span>
                  </div>
                  <button onClick={() => navigate(`/my-courses/${slug}/progress`, { state: { title: courseName } })}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 13px', background: '#EBF1FF', border: '1.5px solid #C7D2FE', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#375DFB', cursor: 'pointer', transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#D6E4FF'; }} onMouseLeave={e => { e.currentTarget.style.background = '#EBF1FF'; }}>
                    Подробнее <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Общий прогресс курса</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#375DFB' }}>33%</span>
                  </div>
                  <div style={{ height: 10, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                    <div className="cd-bar-fill" style={{ height: '100%', width: '33%', background: 'linear-gradient(90deg, #375DFB, #7B9FFF)', borderRadius: 99 }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {([
                    ['Занятий пройдено', '2 / 6', '#EBF1FF', '#375DFB', <svg key="a" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.5" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>],
                    ['Домашних заданий', '1 / 3', '#F0FDF4', '#10B981', <svg key="b" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="#10B981" stroke="none"/><circle cx="4" cy="12" r="1" fill="#10B981" stroke="none"/><circle cx="4" cy="18" r="1" fill="#10B981" stroke="none"/></svg>],
                    ['Часов обучения', '18 / 122', '#FFFBEB', '#D97706', <svg key="c" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>],
                    ['Мой рейтинг', '4 место', '#FFF7ED', '#F59E0B', <svg key="d" width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>],
                  ] as [string, string, string, string, React.ReactNode][]).map(([label, val, bg, color, icon]) => (
                    <div key={label} style={{ background: bg, borderRadius: 14, padding: '12px 14px', border: `1px solid ${bg === '#EBF1FF' ? '#C7D2FE' : bg === '#F0FDF4' ? '#BBF7D0' : bg === '#FFFBEB' ? '#FDE68A' : '#FDE68A'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>{icon}<span style={{ fontSize: 11, color, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.5px' }}>{label}</span></div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 2 }}>По направлениям</div>
                  {([['Тактическая подготовка', 45], ['Огневая подготовка', 20], ['Медицина', 60], ['Ориентирование', 0]] as [string, number][]).map(([label, pct]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: '#6B7280', width: 170, flexShrink: 0 }}>{label}</span>
                      <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                        <div className="cd-bar-fill" style={{ height: '100%', width: `${pct}%`, background: pct >= 50 ? 'linear-gradient(90deg,#10B981,#34D399)' : pct > 0 ? 'linear-gradient(90deg,#375DFB,#7B9FFF)' : '#F3F4F6', borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', width: 32, textAlign: 'right' as const }}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <RatingSection />
          </div>
        </AnimSec>

      </div>

      {personModal && <PersonModal mode={personModal.mode} onClose={() => setPersonModal(null)} />}
    </div>
  );
}
