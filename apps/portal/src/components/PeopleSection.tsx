import { useState, useMemo, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userProfilePath } from '../api/testApi';
import { useMediaQuery } from '../useMediaQuery';
import { TrainingPanel, MeasurementsPanel } from './IndexCharts';

interface Person {
  id: number; category: string; rank: string; name: string;
  index: number; rating: number | null; position: string;
  mainImage: string; rankImage: string; smallImages: string[];
  city: string; birthYear: string; joinedDate: string; community: string;
  coursesCompleted: number; awards: number; followers: number;
  bio: string; bioImage: string; extraCount: number;
  photoPosition?: string;
}

export const PEOPLE: Person[] = [
  {
    id: 1, category: 'Преподаватели', rank: 'Майор', name: 'Торнадо',
    index: 2463, rating: 5.0,
    position: 'Вице-капитан, КР 2-й роты, 77-й учебный батальон, Москва',
    mainImage: '/sold1.png', rankImage: '/rank1.png',
    smallImages: ['/1.png', '/2.png', '/3.png'],
    city: 'Москва', birthYear: '5 марта, 1990', joinedDate: '2 года, 9 месяцев',
    community: '«Вымпел»', coursesCompleted: 3, awards: 8, followers: 1288,
    bio: 'Попал я в ВДВ не просто так. Ещё на гражданке отпрыгал в ДОСААФ три прыжка.',
    bioImage: '/tank.png', extraCount: 4, photoPosition: '10% top',
  },
  {
    id: 2, category: 'Командиры', rank: 'Капитан', name: 'Коба',
    index: 2463, rating: 5.0,
    position: 'Вице-капитан, КР 2-й роты, 77-й учебный батальон, Москва',
    mainImage: '/sold2.png', rankImage: '/rank2.png',
    smallImages: ['/1.png', '/2.png', '/3.png'],
    city: 'Санкт-Петербург', birthYear: '14 июня, 1988', joinedDate: '3 года, 2 месяца',
    community: '«Страж»', coursesCompleted: 5, awards: 12, followers: 2047,
    bio: 'Служил в разведке специального назначения.',
    bioImage: '/tank.png', extraCount: 4, photoPosition: '100%',
  },
  {
    id: 3, category: 'Наши герои', rank: 'Старший лейтенант', name: 'Бор',
    index: 2463, rating: null,
    position: 'Вице-капитан, КР 2-й роты, 77-й учебный батальон, Москва',
    mainImage: '/teacher3-main.jpg', rankImage: '/rank3.png',
    smallImages: ['/1.png', '/2.png', '/3.png'],
    city: 'Краснодар', birthYear: '22 февраля, 1992', joinedDate: '1 год, 4 месяца',
    community: '«Форпост»', coursesCompleted: 2, awards: 6, followers: 874,
    bio: 'Офицер морской пехоты.',
    bioImage: '/tank.png', extraCount: 4, photoPosition: 'center 25%',
  },
  {
    id: 4, category: 'Преподаватели', rank: 'Подполковник', name: 'Призрак',
    index: 1870, rating: 4.8,
    position: 'Командир 1-го взвода, 12-й учебный батальон, Екатеринбург',
    mainImage: '/sold1.png', rankImage: '/rank2.png',
    smallImages: ['/1.png', '/2.png', '/3.png'],
    city: 'Екатеринбург', birthYear: '17 ноября, 1985', joinedDate: '4 года, 1 месяц',
    community: '«Рубеж»', coursesCompleted: 7, awards: 15, followers: 3120,
    bio: 'Ветеран боевых действий, специалист по горной подготовке.',
    bioImage: '/tank.png', extraCount: 3, photoPosition: 'center top',
  },
  {
    id: 5, category: 'Преподаватели', rank: 'Лейтенант', name: 'Рысь',
    index: 1540, rating: 4.6,
    position: 'Инструктор тактической подготовки, 3-я рота, Новосибирск',
    mainImage: '/sold2.png', rankImage: '/rank1.png',
    smallImages: ['/1.png', '/2.png', '/3.png'],
    city: 'Новосибирск', birthYear: '3 июля, 1995', joinedDate: '1 год, 8 месяцев',
    community: '«Сибирь»', coursesCompleted: 2, awards: 4, followers: 560,
    bio: 'Мастер спорта по рукопашному бою, инструктор первой помощи.',
    bioImage: '/tank.png', extraCount: 2, photoPosition: 'center 30%',
  },
  {
    id: 6, category: 'Командиры', rank: 'Полковник', name: 'Титан',
    index: 3100, rating: 5.0,
    position: 'Командир 5-го батальона, Ростов-на-Дону',
    mainImage: '/sold1.png', rankImage: '/rank3.png',
    smallImages: ['/1.png', '/2.png', '/3.png'],
    city: 'Ростов-на-Дону', birthYear: '29 января, 1980', joinedDate: '5 лет, 3 месяца',
    community: '«Донской»', coursesCompleted: 12, awards: 24, followers: 5400,
    bio: 'Командовал подразделением в нескольких учениях федерального уровня.',
    bioImage: '/tank.png', extraCount: 6, photoPosition: '40% top',
  },
  {
    id: 7, category: 'Командиры', rank: 'Майор', name: 'Волк',
    index: 2210, rating: 4.9,
    position: 'Заместитель командира роты, 8-й батальон, Казань',
    mainImage: '/sold2.png', rankImage: '/rank1.png',
    smallImages: ['/1.png', '/2.png', '/3.png'],
    city: 'Казань', birthYear: '11 апреля, 1987', joinedDate: '3 года, 6 месяцев',
    community: '«Татарстан»', coursesCompleted: 9, awards: 18, followers: 2780,
    bio: 'Специалист по тактическому планированию.',
    bioImage: '/tank.png', extraCount: 5, photoPosition: 'center 20%',
  },
];

const CATEGORIES = ['Преподаватели', 'Командиры', 'Наши герои'] as const;
const FEATURED_PEOPLE = CATEGORIES.map(cat => PEOPLE.find(p => p.category === cat)!);

const PHOTO_H = 340;
const BADGE_COL_W = 100;
const BADGE_SIZE = 76;
const PERSON_CHAT_IDS: Record<string, number> = {
  Торнадо: 1,
  Коба: 3,
  Бор: 13,
  Призрак: 18,
  Рысь: 16,
  Титан: 11,
  Волк: 17,
};

function personChatPath(name: string) {
  return `/messages?chat=${PERSON_CHAT_IDS[name] ?? 4}`;
}

if (typeof document !== 'undefined' && !document.getElementById('voevoda-ps-styles')) {
  const s = document.createElement('style');
  s.id = 'voevoda-ps-styles';
  s.textContent = `
  @keyframes vCardIn     { 0%{opacity:0;transform:translateY(10px) scaleY(0.94);max-height:0;overflow:hidden} 60%{opacity:1} 100%{transform:translateY(0) scaleY(1);max-height:1000px;overflow:visible} }
  @keyframes vElita      { 0%,100%{transform:translateY(0);box-shadow:0 3px 9px rgba(42,55,82,.16)} 50%{transform:translateY(-1px);box-shadow:0 5px 14px rgba(42,55,82,.24)} }
  @keyframes vBadgeIn    { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
  @keyframes psTooltipInTop { from{opacity:0;transform:translateX(-50%) translateY(calc(-100% + 6px)) scale(.95)} to{opacity:1;transform:translateX(-50%) translateY(-100%) scale(1)} }
  @keyframes psTooltipInBottom { from{opacity:0;transform:translateX(-50%) translateY(6px) scale(.95)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
  @keyframes psTooltipIn { from{opacity:0;transform:translateX(-50%) translateY(calc(-100% + 6px)) scale(.95)} to{opacity:1;transform:translateX(-50%) translateY(-100%) scale(1)} }
`;
  document.head.appendChild(s);
}

function CatIcon({ cat, size = 18 }: { cat: string; size?: number }) {
  if (cat === 'Преподаватели') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
  if (cat === 'Командиры') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  );
}

const RATING_CRITERIA = [
  { label: 'Знание методик обучения', value: 4.9 },
  { label: 'Подготовка бойцов',       value: 5.0 },
  { label: 'Подготовка командиров',   value: 4.9 },
  { label: 'Выживаемость обученного', value: 5.0 },
  { label: 'Подготованность',         value: 5.0 },
];

type TooltipPlacement = 'top' | 'bottom';
type TooltipPosition = { top: number; left: number; placement: TooltipPlacement };

const clampTooltip = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const BADGE_TOOLTIPS = [
  'Шеврон «ВОЕВОДА»',
  'Знак подразделения',
  'Медаль «За отличие»',
] as const;

export function IVDisplay({ index, rating }: { index: number; rating: number | null }) {
  const [openCard, setOpenCard] = useState<'iv' | 'rating' | null>(null);
  const ivRef = useRef<HTMLSpanElement>(null);
  const ratingRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<TooltipPosition>({ top: 0, left: 0, placement: 'top' });
  const handleEnter = (kind: 'iv' | 'rating', ref: React.RefObject<HTMLSpanElement | null>) => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      const width = kind === 'iv' ? 292 : 286;
      const estimatedHeight = kind === 'iv' ? 280 : 224;
      const gutter = 14;
      const minLeft = window.scrollX + gutter + width / 2;
      const maxLeft = window.scrollX + window.innerWidth - gutter - width / 2;
      const rawLeft = r.left + r.width / 2 + window.scrollX;
      const left = maxLeft > minLeft
        ? clampTooltip(rawLeft, minLeft, maxLeft)
        : window.scrollX + window.innerWidth / 2;
      const placement: TooltipPlacement = r.top > estimatedHeight + gutter ? 'top' : 'bottom';
      setPos({
        top: placement === 'top' ? r.top + window.scrollY - 11 : r.bottom + window.scrollY + 11,
        left,
        placement,
      });
    }
    setOpenCard(kind);
  };
  const tooltipStyle = (width: number): React.CSSProperties => ({
    position: 'absolute',
    top: pos.top,
    left: pos.left,
    transform: pos.placement === 'top' ? 'translateX(-50%) translateY(-100%)' : 'translateX(-50%) translateY(0)',
    width,
    overflow: 'hidden',
    background: '#fff',
    border: '1px solid #C8D6FF',
    borderRadius: 18,
    boxShadow: '0 20px 55px rgba(35,73,180,.2)',
    zIndex: 99999,
    pointerEvents: 'none',
    animation: `${pos.placement === 'top' ? 'psTooltipInTop' : 'psTooltipInBottom'} .18s ease`,
  });
  const arrowStyle = (borderColor = '#C8D6FF'): React.CSSProperties => ({
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    width: 10,
    height: 10,
    background: '#fff',
    ...(pos.placement === 'top'
      ? { bottom: -5, borderRight: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }
      : { top: -5, borderLeft: `1px solid ${borderColor}`, borderTop: `1px solid ${borderColor}` }),
  });
  const level = index >= 2200 ? 'Высокий' : index >= 1500 ? 'Уверенный' : 'Развивающийся';
  const percentile = Math.min(98, Math.max(12, Math.round(index / 28)));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span
        ref={ivRef}
        tabIndex={0}
        aria-label={`Индекс Воеводы ${index}. Наведите, чтобы узнать подробнее`}
        onMouseEnter={() => handleEnter('iv', ivRef)}
        onMouseLeave={() => setOpenCard(null)}
        onFocus={() => handleEnter('iv', ivRef)}
        onBlur={() => setOpenCard(null)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, background: openCard === 'iv' ? '#EBF1FF' : '#F9FAFB', padding: '3px 9px', borderRadius: 8, border: `1px solid ${openCard === 'iv' ? '#9DB5FF' : '#E5E7EB'}`, cursor: 'help', boxShadow: openCard === 'iv' ? '0 6px 16px rgba(55,93,251,.15)' : 'none', transform: openCard === 'iv' ? 'translateY(-1px)' : 'none', transition: 'all .2s ease', outline: 'none' }}
      >
        <span style={{ fontSize: 11, color: openCard === 'iv' ? '#375DFB' : '#9CA3AF', fontWeight: 700 }}>ИВ</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{index}</span>
      </span>
      {openCard === 'iv' && createPortal(
        <div style={tooltipStyle(292)}>
          <div style={{ padding: '14px 16px 12px', background: 'linear-gradient(135deg,#EEF4FF,#FFFFFF)', borderBottom: '1px solid #DCE5FF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ color: '#375DFB', fontSize: 10, fontWeight: 800, letterSpacing: '.09em', textTransform: 'uppercase' }}>Индекс Воеводы</div>
                <div style={{ color: '#102A72', fontSize: 24, fontWeight: 900, lineHeight: 1.15, marginTop: 3 }}>{index}</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 999, background: '#375DFB', color: '#fff', fontSize: 11, fontWeight: 800 }}>{level}</div>
            </div>
          </div>
          <div style={{ padding: '13px 16px 15px' }}>
            <p style={{ margin: '0 0 12px', color: '#4B5C80', fontSize: 12, lineHeight: 1.55 }}>Сводный показатель активности, обучения, дисциплины и вклада в сообщество.</p>
            {[['Обучение', Math.min(100, Math.round(index / 27))], ['Активность', Math.min(100, Math.round(index / 31 + 10))], ['Дисциплина', Math.min(100, Math.round(index / 29 + 6))]].map(([label, value]) => (
              <div key={label as string} style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#53648A', fontSize: 11, fontWeight: 650, marginBottom: 4 }}><span>{label}</span><span>{value}%</span></div>
                <div style={{ height: 5, borderRadius: 999, background: '#E8EEFF', overflow: 'hidden' }}><div style={{ width: `${value}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#244CD8,#6F91FF)' }} /></div>
              </div>
            ))}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #EDF1FA', color: '#375DFB', fontSize: 11, fontWeight: 750 }}>Выше, чем у {percentile}% участников</div>
          </div>
          <div style={arrowStyle()} />
        </div>,
        document.body
      )}
      {rating !== null && (
        <>
          <span
            ref={ratingRef}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFBEB', padding: '3px 9px', borderRadius: 8, border: '1px solid #FDE68A', cursor: 'pointer' }}
            onMouseEnter={() => handleEnter('rating', ratingRef)}
            onMouseLeave={() => setOpenCard(null)}
            onFocus={() => handleEnter('rating', ratingRef)}
            onBlur={() => setOpenCard(null)}
            tabIndex={0}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{rating}</span>
          </span>
          {openCard === 'rating' && createPortal(
            <div style={tooltipStyle(286)}>
              <div style={{ padding: '14px 16px 12px', background: 'linear-gradient(135deg,#EEF4FF,#FFFFFF)', borderBottom: '1px solid #DCE5FF' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ color: '#375DFB', fontSize: 10, fontWeight: 800, letterSpacing: '.09em', textTransform: 'uppercase' }}>Общий рейтинг</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#102A72', fontSize: 24, fontWeight: 900, lineHeight: 1.15, marginTop: 3 }}>
                      {rating}<svg width="17" height="17" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </div>
                  </div>
                  <div style={{ padding: '6px 10px', borderRadius: 999, background: '#375DFB', color: '#fff', fontSize: 11, fontWeight: 800 }}>Отличный</div>
                </div>
              </div>
              <div style={{ padding: '8px 16px 12px' }}>
                {RATING_CRITERIA.map(({ label, value }, i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < RATING_CRITERIA.length - 1 ? '1px solid #EDF1FA' : 'none' }}>
                    <span style={{ fontSize: 12, color: '#4B5C80' }}>{label}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 800, fontSize: 13, color: '#102A72' }}>
                      {value}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </span>
                  </div>
                ))}
              </div>
              <div style={arrowStyle()} />
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}

export function ElitaBadge({ small = false, animate = false }: { small?: boolean; animate?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      height: small ? 17 : 20,
      boxSizing: 'border-box',
      background: 'linear-gradient(180deg,#FFFFFF 0%,#F1F3F7 54%,#E5E9F0 100%)',
      border: '1px solid #B9C1CE',
      borderRadius: 999, padding: small ? '1px 7px' : '2px 9px',
      boxShadow: '0 2px 6px rgba(42,55,82,.15), inset 0 1px 0 #FFFFFF',
      whiteSpace: 'nowrap', flexShrink: 0,
      animation: animate ? 'eliteBadgeFloat 2.8s ease-in-out infinite' : undefined,
    }}>
      <span style={{
        fontSize: small ? 7 : 8, fontWeight: 900, color: '#26334B',
        textTransform: 'uppercase' as const, letterSpacing: small ? '.65px' : '.85px',
        lineHeight: 1,
      }}>элита</span>
    </div>
  );
}

// ─── ExtraBadge ─────────────────────────────────────────────────────────────
// Кнопка «+N» (показать все знаки отличия). Анимация 1-в-1 как у бейджа «+N»
// в карточках на главной (PersonCard): градиент, белый текст, scale, тень.
export function ExtraBadge({ count, size = 60, onClick, title = 'Все знаки отличия' }: { count: number; size?: number; onClick?: () => void; title?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={`Все знаки отличия, ещё ${count}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: size, height: size, borderRadius: 12, flexShrink: 0,
        background: hov ? 'linear-gradient(135deg,#375DFB,#7B9FFF)' : '#EBF1FF',
        border: `1.5px solid ${hov ? 'transparent' : '#C7D2FE'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size >= 56 ? 15 : 13, fontWeight: 800, fontFamily: 'inherit',
        color: hov ? '#fff' : '#375DFB',
        cursor: 'pointer', transition: 'all .3s ease',
        transform: hov ? 'scale(1.06)' : 'scale(1)',
        boxShadow: hov ? '0 6px 20px rgba(55,93,251,.38)' : 'none',
      }}
    >
      +{count}
    </button>
  );
}

// ─── BadgeBox ─────────────────────────────────────────────────────────────────
// Тултип рендерится через Portal в document.body — полностью вне любого
// stacking context карточки, поэтому всегда поверх ElitaBadge.
export function BadgeBox({ src, tooltip, size = 52, topRight }: { src: string; tooltip?: string; size?: number; topRight?: ReactNode }) {
  const [err, setErr] = useState(false);
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({
        top: r.top + window.scrollY,
        left: r.left + r.width / 2 + window.scrollX,
      });
    }
    setShow(true);
    setHovered(true);
  };

  return (
    <>
      <div
        ref={ref}
        style={{
          position: 'relative', width: size, height: size, flexShrink: 0,
          background: hovered ? '#EEF3FF' : '#F6F8FA', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: size >= 60 ? 13 : Math.round(size * 0.13),
          border: `1.5px solid ${hovered ? '#C7D2FE' : '#EAECF0'}`,
          transition: 'all .22s ease',
          transform: hovered ? 'scale(1.07) translateY(-1px)' : 'scale(1)',
          boxShadow: hovered ? '0 6px 18px rgba(55,93,251,.14)' : 'none',
          animation: 'vBadgeIn .4s ease backwards',
          cursor: tooltip ? 'pointer' : 'default',
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={() => { setShow(false); setHovered(false); }}
      >
        {!err
          ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setErr(true)} />
          : <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
        }
        {topRight && (
          <div style={{
            position: 'absolute', top: size <= 48 ? -7 : -8, right: size <= 48 ? -7 : -8,
            zIndex: 10, pointerEvents: 'none',
          }}>
            {topRight}
          </div>
        )}
      </div>
      {tooltip && show && createPortal(
        <div style={{
          position: 'absolute',
          top: pos.top - 10,
          left: pos.left,
          transform: 'translateX(-50%) translateY(-100%)',
          background: 'rgba(37, 62, 167, 0.48)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 13px', borderRadius: 10,
          whiteSpace: 'nowrap', zIndex: 99999, pointerEvents: 'none',
        }}>
          {tooltip}
          <div style={{
            position: 'absolute', bottom: -3, left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 7, height: 7,
            background: 'rgba(37, 62, 167, 0.48)',
            borderRight: '1px solid rgba(255,255,255,0.12)',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }} />
        </div>,
        document.body
      )}
    </>
  );
}

interface MState {
  rost: string; ves: string; vozrast: string;
  sheya: string; grud: string; biceps: string;
  taliya: string; taz: string; bedro: string;
  golen: string; lodyzhka: string;
}

const DEFAULT_M: MState = {
  rost: '182', ves: '84', vozrast: '34',
  sheya: '40', grud: '102', biceps: '38',
  taliya: '86', taz: '98', bedro: '58',
  golen: '40', lodyzhka: '24',
};

function calcIMT(ves: string, rost: string) {
  const v = parseFloat(ves), r = parseFloat(rost) / 100;
  return v && r ? (v / (r * r)).toFixed(1) : '—';
}

export function EditableMeasurements({ personId }: { personId: number }) {
  const key = `msr_${personId}`;
  const init = (): MState => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? DEFAULT_M; } catch { return DEFAULT_M; }
  };
  const [vals, setVals] = useState<MState>(init);
  const [ok, setOk] = useState(false);

  const set = (k: keyof MState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals(v => ({ ...v, [k]: e.target.value }));

  const save = () => {
    try { localStorage.setItem(key, JSON.stringify(vals)); } catch {}
    setOk(true); setTimeout(() => setOk(false), 2000);
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '7px 36px 7px 10px', border: '1.5px solid #E5E7EB',
    borderRadius: 9, fontSize: 13, color: '#111', background: '#F9FAFB',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  const Field = ({ field, label, unit }: { field: keyof MState; label: string; unit: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <input
          type="number" value={vals[field]} onChange={set(field)} style={inputBase}
          onFocus={e => { e.currentTarget.style.borderColor = '#375DFB'; e.currentTarget.style.background = '#fff'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}
        />
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#9CA3AF', pointerEvents: 'none' }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
        {[['Рост', `${vals.rost} см`], ['Вес', `${vals.ves} кг`], ['ИМТ', calcIMT(vals.ves, vals.rost)]].map(([l, v]) => (
          <div key={l} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>{l}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Основные параметры</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
        <Field field="rost" label="Рост" unit="см" />
        <Field field="ves" label="Вес" unit="кг" />
        <Field field="vozrast" label="Возраст" unit="лет" />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Обхваты тела</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field field="sheya" label="Шея" unit="см" />
        <Field field="grud" label="Грудная клетка" unit="см" />
        <Field field="biceps" label="Бицепс" unit="см" />
        <Field field="taliya" label="Талия" unit="см" />
        <Field field="taz" label="Таз" unit="см" />
        <Field field="bedro" label="Бедро" unit="см" />
        <Field field="golen" label="Голень" unit="см" />
        <Field field="lodyzhka" label="Лодыжка" unit="см" />
      </div>
      <button
        onClick={save}
        style={{
          marginTop: 18, width: '100%', padding: '12px 0',
          background: ok ? '#10B981' : '#375DFB',
          border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', transition: 'background .3s', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 7,
          boxShadow: ok ? '0 4px 14px rgba(16,185,129,.35)' : '0 4px 14px rgba(55,93,251,.3)',
        }}
      >
        {ok
          ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Сохранено</>
          : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Сохранить замеры</>
        }
      </button>
    </div>
  );
}

// ─── PersonCard ───────────────────────────────────────────────────────────────
function PersonCard({ p, onOpenModal, onOpenAll, animDelay = 0 }: {
  p: Person; onOpenModal: (id: number) => void; onOpenAll: () => void; animDelay?: number;
}) {
  const navigate = useNavigate();
  const [mErr, setMErr] = useState(false);
  const [rErr, setRErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [extraHov, setExtraHov] = useState(false);

  const goToZnaki = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/achievements');
  };

  return (
    <div
      onClick={() => onOpenModal(p.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        background: '#fff', borderRadius: 22,
        border: `1.5px solid ${hovered ? '#B8CAFE' : '#EAECF0'}`,
        boxShadow: hovered ? '0 22px 60px rgba(55,93,251,.16), 0 6px 20px rgba(0,0,0,.07)' : '0 2px 16px rgba(0,0,0,.07)',
        transform: hovered ? 'translateY(-7px)' : 'translateY(0)',
        transition: 'transform .45s cubic-bezier(.22,1,.36,1), box-shadow .4s ease, border-color .25s ease',
        animation: `vCardIn .55s ${animDelay}ms ease backwards`,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Заголовок */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CatIcon cat={p.category} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{p.category}</span>
        </div>
        <button
          className="voevoda-view-all voevoda-view-all--inverse"
          onClick={(e) => { e.stopPropagation(); onOpenAll(); }}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '5px 13px',
            background: btnHovered ? '#EBF1FF' : '#F4F6FA',
            border: `1.5px solid ${btnHovered ? '#375DFB' : '#E5E7EB'}`,
            borderRadius: 8, fontSize: 12, fontWeight: 600,
            color: btnHovered ? '#375DFB' : '#6B7280',
            cursor: 'pointer', transition: 'all .25s ease',
          }}
        >
          Все{' '}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Фото + бейджи */}
      <div style={{ display: 'flex', gap: 10, padding: '0 14px', marginBottom: 15 }}>
        <div style={{ flex: 1, height: PHOTO_H, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 14, overflow: 'hidden', background: '#EFF1F5' }}>
            {!mErr
              ? <img
                  src={p.mainImage} alt={p.name}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                    objectPosition: p.photoPosition ?? 'center center',
                    transform: hovered ? 'scale(1.06)' : 'scale(1)',
                    transition: 'transform .7s cubic-bezier(.4,0,.2,1)',
                  }}
                  onError={() => setMErr(true)}
                />
              : <div style={{ width: '100%', height: '100%', background: '#F3F4F6' }} />
            }
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,10,20,.7) 0%, rgba(8,10,20,.12) 45%, transparent 75%)', pointerEvents: 'none' }} />
          </div>
          {!rErr && (
            <div style={{
              position: 'absolute', bottom: -8, right: -28,
              width: 60, height: 60, zIndex: 4,
              transform: hovered ? 'scale(1.56)' : 'scale(1.5)',
              transition: 'transform .7s cubic-bezier(.4,0,.2,1)',
              transformOrigin: 'bottom right',
            }}>
              <img src={p.rankImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 3px 10px rgba(0,0,0,.55))' }} onError={() => setRErr(true)} />
            </div>
          )}
        </div>

        {/* Колонка бейджей */}
        <div style={{
          width: BADGE_COL_W, flexShrink: 0, alignSelf: 'flex-start',
          position: 'relative', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 8, paddingTop: 10,
        }}>
          {p.smallImages.slice(0, 3).map((src, i) => (
            <BadgeBox key={i} src={src} size={BADGE_SIZE} tooltip={BADGE_TOOLTIPS[i]}
              topRight={i === 0 ? <ElitaBadge animate /> : undefined} />
          ))}
          {p.extraCount > 0 && (
            <div
              onClick={goToZnaki}
              style={{
                width: BADGE_SIZE, height: BADGE_SIZE, borderRadius: 12,
                background: extraHov ? 'linear-gradient(135deg,#375DFB,#7B9FFF)' : '#EBF1FF',
                border: `1.5px solid ${extraHov ? 'transparent' : '#C7D2FE'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: extraHov ? '#fff' : '#375DFB',
                cursor: 'pointer', transition: 'all .3s ease',
                boxShadow: extraHov ? '0 6px 20px rgba(55,93,251,.38)' : 'none',
              }}
              onMouseEnter={e => { setExtraHov(true); e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { setExtraHov(false); e.currentTarget.style.transform = 'scale(1)'; }}
            >
              +{p.extraCount}
            </div>
          )}
        </div>
      </div>

      {/* Инфо */}
      <div style={{ padding: '0 16px', flex: 1, marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '.7px', fontWeight: 600 }}>{p.rank}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span
            style={{ fontSize: 19, fontWeight: 800, color: '#0D0F14', cursor: 'pointer', letterSpacing: '-.3px', transition: 'color .18s' }}
            onClick={(e) => { e.stopPropagation(); onOpenModal(p.id); }}
          >
            {p.name}
          </span>
          <IVDisplay index={p.index} rating={p.rating} />
        </div>
        <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.55, margin: 0 }}>{p.position}</p>
      </div>

      {/* Кнопки */}
      <div style={{ display: 'flex', gap: 9, padding: '0 14px 15px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenModal(p.id); }}
          style={{ flex: 1, background: '#375DFB', border: 'none', borderRadius: 8, padding: '12px 0', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 5px 18px rgba(55,93,251,.32)', transition: 'transform .22s ease, box-shadow .22s ease, background .22s ease' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(55,93,251,.46)'; e.currentTarget.style.background = '#1E3F9F'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 18px rgba(55,93,251,.32)'; e.currentTarget.style.background = '#375DFB'; }}
        >
          Личное дело
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(personChatPath(p.name)); }}
          style={{ flex: 1, background: '#F8F9FC', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '12px 0', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .22s ease' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; e.currentTarget.style.background = '#EEF3FF'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#F8F9FC'; }}
        >
          Написать в чат
        </button>
      </div>
    </div>
  );
}

function RowBadges({ p, onZnaki }: { p: Person; onZnaki: (e: React.MouseEvent) => void }) {
  const BR = 44;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      {p.smallImages.slice(0, 3).map((src, i) => (
        <BadgeBox key={i} src={src} size={BR} tooltip={BADGE_TOOLTIPS[i]}
          topRight={i === 0 ? <ElitaBadge small /> : undefined} />
      ))}
      {p.extraCount > 0 && (
        <div
          onClick={onZnaki}
          style={{ width: BR, height: BR, borderRadius: 12, background: '#EBF1FF', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#375DFB', cursor: 'pointer', transition: 'all .18s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#375DFB,#7B9FFF)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#EBF1FF'; e.currentTarget.style.color = '#375DFB'; e.currentTarget.style.borderColor = '#C7D2FE'; }}
        >
          +{p.extraCount}
        </div>
      )}
    </div>
  );
}

function PersonRow({ p, onOpen, onZnaki, isLast = false }: {
  p: Person; onOpen: () => void; onZnaki: (e: React.MouseEvent) => void; isLast?: boolean;
}) {
  const [mErr, setMErr] = useState(false);
  const [rErr, setRErr] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: isLast ? 'none' : '1px solid #F5F5F7', background: hov ? '#FAFBFF' : 'transparent', transition: 'background .14s' }}
      onMouseOver={() => setHov(true)} onMouseOut={() => setHov(false)}
    >
      <div onClick={onOpen} style={{ position: 'relative', flexShrink: 0, width: 74, height: 74 }}>
        {!mErr
          ? <img src={p.mainImage} alt={p.name} style={{ width: 62, height: 62, borderRadius: 12, objectFit: 'cover', objectPosition: p.photoPosition ?? 'center center', border: '1px solid #E5E7EB', display: 'block', transition: 'transform .3s', transform: hov ? 'scale(1.04)' : 'scale(1)' }} onError={() => setMErr(true)} />
          : <div style={{ width: 62, height: 62, borderRadius: 12, background: '#F3F4F6', border: '1px solid #E5E7EB' }} />
        }
        {!rErr && (
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, zIndex: 3 }}>
            <img src={p.rankImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,.35))' }} onError={() => setRErr(true)} />
          </div>
        )}
      </div>
      <div onClick={onOpen} style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: '.5px' }}>{p.rank}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{p.name}</span>
          <IVDisplay index={p.index} rating={p.rating} />
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.position}</div>
      </div>
      <RowBadges p={p} onZnaki={onZnaki} />
    </div>
  );
}

// ─── PeopleModal ──────────────────────────────────────────────────────────────
export type ModalMode = { type: 'person'; personId: number } | { type: 'list'; category: string };

export function PeopleModal({ people, mode, onClose }: { people: Person[]; mode: ModalMode; onClose: () => void }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<ModalMode>(mode);
  const [tab, setTab] = useState<'Данные' | 'Подготовка' | 'Замеры'>('Данные');
  const [activeTrainingSection, setActiveTrainingSection] = useState<string>('phys');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('Все города');
  const [showCityDD, setShowCityDD] = useState(false);
  const cityBtnRef = useRef<HTMLButtonElement>(null);
  const [cityBtnRect, setCityBtnRect] = useState<DOMRect | null>(null);

  const categoryPeople = useMemo(
    () => current.type === 'list' ? people.filter(p => p.category === current.category) : [],
    [people, current]
  );
  const cities = useMemo(
    () => ['Все города', ...Array.from(new Set(categoryPeople.map(p => p.city)))],
    [categoryPeople]
  );
  const filtered = useMemo(() => categoryPeople.filter(p => {
    const mc = cityFilter === 'Все города' || p.city === cityFilter;
    const q = search.toLowerCase();
    return mc && (!q || p.name.toLowerCase().includes(q) || p.rank.toLowerCase().includes(q) || p.position.toLowerCase().includes(q));
  }), [categoryPeople, search, cityFilter]);

  const goToZnaki = (e: React.MouseEvent) => {
    e.stopPropagation(); onClose(); navigate('/achievements');
  };

  if (current.type === 'list') {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, backdropFilter: 'blur(3px)' }}>
        <div onClick={e => e.stopPropagation()} style={{ maxWidth: 720, width: '100%', background: '#fff', borderRadius: 22, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 28px 70px rgba(0,0,0,.22)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid #F0F0F0', flexShrink: 0, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
              <CatIcon cat={current.category} size={18} />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{current.category}</span>
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>({filtered.length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '6px 12px', flex: '0 1 200px', minWidth: 120 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#111', width: '100%' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <button
                ref={cityBtnRef}
                onClick={() => {
                  if (cityBtnRef.current) setCityBtnRect(cityBtnRef.current.getBoundingClientRect());
                  setShowCityDD(v => !v);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '6px 12px', fontSize: 13, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {cityFilter} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showCityDD && cityBtnRect && createPortal(
                <div
                  style={{ position: 'fixed', top: cityBtnRect.bottom + 4, right: window.innerWidth - cityBtnRect.right, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 10px 28px rgba(0,0,0,.12)', zIndex: 100001, minWidth: 160, overflow: 'hidden' }}
                  onClick={e => e.stopPropagation()}
                >
                  {cities.map(c => (
                    <div key={c} onClick={() => { setCityFilter(c); setShowCityDD(false); }} style={{ padding: '9px 14px', fontSize: 13, cursor: 'pointer', color: c === cityFilter ? '#375DFB' : '#374151', fontWeight: c === cityFilter ? 600 : 400, background: c === cityFilter ? '#EBF1FF' : 'transparent', transition: 'background .12s' }}
                      onMouseOver={e => { if (c !== cityFilter) e.currentTarget.style.background = '#F9FAFB'; }}
                      onMouseOut={e => { if (c !== cityFilter) e.currentTarget.style.background = 'transparent'; }}
                    >{c}</div>
                  ))}
                </div>,
                document.body
              )}
            </div>
            <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')} onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}>×</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0
              ? <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Ничего не найдено</div>
              : filtered.map((per, i) => (
                  <PersonRow key={per.id} p={per} isLast={i === filtered.length - 1}
                    onOpen={() => { setCurrent({ type: 'person', personId: per.id }); setTab('Данные'); }}
                    onZnaki={goToZnaki}
                  />
                ))
            }
          </div>
        </div>
      </div>
    );
  }

  const p = people.find(x => x.id === current.personId) ?? people[0];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 10000, padding: '5vh 20px 20px', backdropFilter: 'blur(3px)', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: '100%', background: '#fff', borderRadius: 22, boxShadow: '0 28px 70px rgba(0,0,0,.22)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CatIcon cat={p.category} />
            <span style={{ fontSize: 16, fontWeight: 700 }}>{p.category}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="voevoda-view-all voevoda-view-all--inverse" onClick={() => { setCurrent({ type: 'list', category: p.category }); setSearch(''); setCityFilter('Все города'); }} style={{ background: 'none', border: 'none', color: '#375DFB', fontSize: 13, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              Все <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')} onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}>×</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: '1px solid #F0F0F0', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 68, height: 68, borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#F3F4F6' }}>
              <img src={p.mainImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.photoPosition ?? 'center center' }} />
            </div>
            <div style={{ position: 'absolute', bottom: -8, right: -8, width: 34, height: 34 }}>
              <img src={p.rankImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.3))' }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '.6px', fontWeight: 600 }}>{p.rank}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 6, letterSpacing: '-.3px' }}>{p.name}</div>
            <IVDisplay index={p.index} rating={p.rating} />
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{p.position}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {p.smallImages.map((src, i) => (
              <BadgeBox key={i} src={src} size={44} tooltip={BADGE_TOOLTIPS[i]} topRight={i === 0 ? <ElitaBadge small animate /> : undefined} />
            ))}
            {p.extraCount > 0 && (
              <div onClick={goToZnaki} style={{ width: 44, height: 44, borderRadius: 12, background: '#EBF1FF', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#375DFB', cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#375DFB,#7B9FFF)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent'; }} onMouseLeave={e => { e.currentTarget.style.background = '#EBF1FF'; e.currentTarget.style.color = '#375DFB'; e.currentTarget.style.borderColor = '#C7D2FE'; }}>
                +{p.extraCount}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', padding: '0 24px' }}>
          {(['Данные', 'Подготовка', 'Замеры'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tab === t ? '2.5px solid #375DFB' : '2.5px solid transparent', color: tab === t ? '#375DFB' : '#6B7280', fontWeight: tab === t ? 700 : 400, fontSize: 13, cursor: 'pointer', marginBottom: -1, transition: 'color .15s' }}>{t}</button>
          ))}
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div key={tab} style={{ animation: 'vCardIn .32s cubic-bezier(0.4,0,0.2,1)', transformOrigin: 'top center', overflow: 'hidden' }}>
          {tab === 'Данные' && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 240px' }}>
                {([['Город', p.city], ['Год рождения', p.birthYear], ['На портале', p.joinedDate], ['Сообщество', p.community], ['Прошёл курсов', String(p.coursesCompleted)], ['Наград', String(p.awards)], ['Подписчиков', p.followers.toLocaleString()]] as [string, string][]).map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F5F5F7' }}>
                    <span style={{ fontSize: 13, color: '#9CA3AF' }}>{l}</span>
                    <span style={{ fontSize: 14, color: '#111', fontWeight: 600, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '1 / 1', background: '#F3F4F6', marginBottom: 12 }}>
                  <img src={p.bioImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>{p.bio}</p>
              </div>
            </div>
          )}
          {tab === 'Подготовка' && (
            <TrainingPanel
              compact
              onSectionChange={s => setActiveTrainingSection(s)}
            />
          )}
          {tab === 'Замеры' && (
            <MeasurementsPanel
              compact
              onEdit={() => { onClose(); navigate('/profile', { state: { tab: 'Сводка замеров', measuresView: 'edit' } }); }}
            />
          )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 22px' }}>
          <button onClick={() => { onClose(); navigate(userProfilePath(p.name)); }} style={{ flex: 1, background: '#375DFB', border: 'none', borderRadius: 8, padding: '13px 0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 5px 18px rgba(55,93,251,.32)', transition: 'all .22s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(55,93,251,.46)'; e.currentTarget.style.background = '#1E3F9F'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 18px rgba(55,93,251,.32)'; e.currentTarget.style.background = '#375DFB'; }}>
            Личное дело
          </button>
          <button
            onClick={() => {
              onClose();
              if (tab === 'Данные') {
                navigate('/profile', { state: { openEdit: true } });
              } else if (tab === 'Подготовка') {
                navigate('/profile', { state: { tab: 'График подготовки', chartSection: activeTrainingSection, chartView: 'edit' } });
              } else {
                navigate('/profile', { state: { tab: 'Сводка замеров', measuresView: 'edit' } });
              }
            }}
            style={{ flex: 1, background: '#F8F9FC', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '13px 0', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .22s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; e.currentTarget.style.background = '#EEF3FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#F8F9FC'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
            Редактировать
          </button>
          <button onClick={() => navigate(personChatPath(p.name))} style={{ flex: 1, background: '#F8F9FC', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '13px 0', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .22s ease' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; e.currentTarget.style.background = '#EEF3FF'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#F8F9FC'; }}>
            Написать в чат
          </button>
        </div>
      </div>
    </div>
  );
}

export function PeopleSection({
  noOuterPadding = false,
}: {
  noOuterPadding?: boolean;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [modal, setModal] = useState<{ mode: ModalMode } | null>(null);

  useEffect(() => {
    if (!modal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modal]);

  return (
    <>
      <section
        style={{
          padding: noOuterPadding ? 0 : isMobile ? '16px 16px 0' : '24px 24px 0',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 18 }}>
          {FEATURED_PEOPLE.map((p, i) => (
            <PersonCard key={p.id} p={p} animDelay={i * 80}
              onOpenModal={id => setModal({ mode: { type: 'person', personId: id } })}
              onOpenAll={() => setModal({ mode: { type: 'list', category: p.category } })}
            />
          ))}
        </div>
      </section>
      {modal && createPortal(
        <PeopleModal
          people={PEOPLE}
          mode={modal.mode}
          onClose={() => setModal(null)}
        />,
        document.body
      )}
    </>
  );
}
