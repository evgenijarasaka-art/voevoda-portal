import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PeopleSection } from '../components/PeopleSection';
import { usePurchasedCoursesStore } from '../store/usePurchasedCoursesStore';
import { YandexTrainingMap } from '../components/YandexTrainingMap';
import { CourseMetaSummary } from '../components/CourseMetaSummary';
import { StreamCalendar } from '../components/StreamCalendar';

const CSS = `
  @keyframes fadeIn { from{opacity:0}to{opacity:1} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
  @keyframes dropIn { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
  .cl-s{opacity:0;transform:translateY(16px);transition:opacity .5s cubic-bezier(.4,0,.2,1),transform .5s cubic-bezier(.4,0,.2,1)}
  .cl-s.v{opacity:1;transform:translateY(0)}
  .cl-enroll{transition:box-shadow .15s,transform .12s}
  .cl-enroll:hover{box-shadow:0 8px 28px rgba(55,93,251,.55)!important;transform:translateY(-2px)}
  .cl-ghost{transition:all .15s}
  .cl-ghost:hover{background:#EBF1FF!important;border-color:#C7D2FE!important;color:#375DFB!important;transform:translateY(-1px)}
  .cl-dc{transition:box-shadow .2s,transform .2s}
  .cl-dc:hover{box-shadow:0 8px 24px rgba(0,0,0,.1);transform:translateY(-3px)}
  .cl-dc:hover .cl-di{transform:scale(1.05)}
  .cl-di{transition:transform .45s cubic-bezier(.4,0,.2,1)}
  .cl-sr{transition:box-shadow .2s,transform .2s;cursor:pointer}
  .cl-sr:hover{box-shadow:0 8px 24px rgba(55,93,251,.12);transform:translateY(-3px)}
  .cl-sr:hover .cl-si{transform:scale(1.05)}
  .cl-si{transition:transform .45s cubic-bezier(.4,0,.2,1)}
  .cl-step{transition:background .15s;border-radius:14px}
  .cl-step:hover{background:#F0F4FF!important}
  .cl-letter{transition:transform .25s cubic-bezier(.4,0,.2,1),box-shadow .25s;cursor:pointer}
  .cl-letter:hover{transform:scale(1.03);box-shadow:0 10px 32px rgba(0,0,0,.16)}
  .cl-review{transition:box-shadow .2s}
  .cl-review:hover{box-shadow:0 4px 20px rgba(0,0,0,.06)}
  .cl-cal-ev{transition:opacity .15s,transform .12s;cursor:pointer}
  .cl-cal-ev:hover{opacity:.82;transform:translateY(-1px)}
  .cl-cal-btn{transition:background .15s}
  .cl-cal-btn:hover{background:#EBF1FF!important;border-color:#C7D2FE!important;color:#375DFB!important}
  .cl-photo-thumb{transition:transform .2s,box-shadow .2s;cursor:pointer}
  .cl-photo-thumb:hover{transform:scale(1.04);box-shadow:0 4px 12px rgba(0,0,0,.12)}
  .cl-thumb-nav{transition:border-color .15s,opacity .15s;cursor:pointer}
  .cl-thumb-nav:hover{opacity:.85}
  .cl-sb-item{transition:color .15s,background .15s}
  .cl-sb-item:hover{color:#375DFB!important;background:#F5F7FF!important}
`;

function injectCss(id: string, css: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style'); s.id = id; s.textContent = css;
  document.head.appendChild(s);
}
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('v'); obs.disconnect(); } }, { threshold: 0.04 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return ref;
}
function Sec({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useReveal();
  return <div ref={ref} className="cl-s" style={style}>{children}</div>;
}

/* ─── Countdown ─── */
function useCountdown(target: Date) {
  const calc = () => { const d = Math.max(0, target.getTime() - Date.now()); return { days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), minutes: Math.floor((d % 3600000) / 60000), seconds: Math.floor((d % 60000) / 1000) }; };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  return t;
}
function Countdown({ target }: { target: Date }) {
  const { days, hours, minutes, seconds } = useCountdown(target);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {([['дней', days], ['часов', hours], ['минут', minutes], ['секунд', seconds]] as [string, number][]).map(([l, v], i, arr) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: i < arr.length - 1 ? 8 : 0 }}>
          <div style={{ textAlign: 'center', minWidth: 64, background: '#F8F9FB', borderRadius: 14, padding: '10px 8px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#111', lineHeight: 1 }}>{pad(v)}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, fontWeight: 500 }}>{l}</div>
          </div>
          {i < arr.length - 1 && <span style={{ fontSize: 24, fontWeight: 800, color: '#D1D5DB', marginBottom: 14 }}>:</span>}
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

/* ─── Sidebar ─── */
const SIDEBAR_ITEMS = [
  { id: 'section-general',      label: 'Общая информация' },
  { id: 'section-video',        label: 'Видео-презентация' },
  { id: 'section-requirements', label: 'Требования к курсантам' },
  { id: 'section-photos',       label: 'Фотографии с курса' },
  { id: 'section-program',      label: 'Программа курса' },
  { id: 'section-schedule',     label: 'Расписание занятий' },
  { id: 'section-enroll',       label: 'Инструкция записи' },
  { id: 'section-reviews',      label: 'Отзывы' },
  { id: 'section-map',          label: 'Местопроведения занятий' },
];

function CourseSidebar({ onEnroll }: { onEnroll: () => void }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div style={{ width: 258, flexShrink: 0, position: 'sticky', top: 76, alignSelf: 'flex-start' }}>
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {SIDEBAR_ITEMS.map((item, i) => (
          <button
            key={item.id}
            className="cl-sb-item"
            onClick={() => scrollTo(item.id)}
            style={{
              display: 'block', width: '100%', padding: '11px 16px',
              textAlign: 'left', background: 'none',
              border: 'none', borderBottom: i < SIDEBAR_ITEMS.length - 1 ? '1px solid #F0F0F0' : 'none',
              fontSize: 13, color: '#374151', cursor: 'pointer',
            }}
          >
            {item.label}
          </button>
        ))}
        <div style={{ padding: '16px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#16A34A' }}>от 3 500 ₽/мес</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12, lineHeight: 1.5 }}>
            на 6 месяцев в рассрочку<br />или сразу — 25 000 ₽
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>5.0 рейтинг курса</span>
          </div>
          <button
            onClick={onEnroll}
            className="cl-enroll"
            style={{
              width: '100%', padding: '13px 0',
              background: 'var(--primary-base, #375DFB)',
              border: 'none', borderRadius: 12,
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(55,93,251,.38)',
            }}
          >
            Записаться и оплатить
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── DATA ─── */
const BENEFITS = [
  'Инструктора ветераны спецназа и ЧВК с опытом СВО',
  '16 дней занятий по субботам и воскресеньям с 9 до 15',
  'Пройдите курс один раз и потом занимайтесь бесплатно',
  'Обучение с нуля, можно начать в «трениках»',
  'Для мужчин и женщин с 14 до 55 лет',
  'Спартанские условия обучения',
];
const REQUIREMENTS = [
  'Гражданство РФ или стран ОДКБ',
  'Мужчины и женщины в возрасте от 14 до 60 лет, для подростков расписка от родителей',
  'Нормальное психическое состояние, религиозные и политические взгляды',
  'Отсутствие судимости или непогашенной судимости',
  'Отсутствие проблем со здоровьем, препятствующим занятию спортом',
  'Неконфликтность, порядочность',
];
const EQUIPMENT = [
  'Военная форма или одежда, которую не жалко испачкать.',
  'Берцы или треккинговая обувь с жесткой поддержкой голени.',
  'Очки защитные (тактические или строительные).',
  'Перчатки тактические или строительные.',
  'Компас',
  'Лопата МПЛ-50',
  'Рюкзак гражданский или военный',
  'ММГ АК либо страйкбольный АК либо иной макет, который может имитировать оружие',
];
const DISCIPLINES = [
  { img: '/voendelo1.png', title: 'Введение в военное дело', text: 'Так как военное дело требует высокой выучки, хитрости построенной на знаниях и опыте,' },
  { img: '/voendelo2.png', title: 'Холощение с оружием', text: 'Нам известно много случаев подписания курсантами контракта с ВС РФ после прохож' },
  { img: '/voendelo3.png', title: 'Личная тактическая подготовка', text: 'Так как военное дело требует высокой выучки, хитрости построенной на знансти и' },
  { img: '/voendelo4.png', title: 'Действия бойца в лесу', text: 'Нам известно много случаев подписания курсантами контракта' },
  { img: '/voendelo5.png', title: 'Действия мал. подразделения', text: 'Так как военное дело требует высокой выучки, хитрости построенной на знани' },
  { img: '/voendelo6.png', title: 'Учебно-боевые задачи', text: 'Так как военное дело требует высокой выучки, хитрости построенной напыте, храбрости и' },
];
const WEAPONS = [
  { img: '/оружие1.png', title: 'Изучение оружия и уход за ним', text: 'Нам известно много случаев подписания курсантами кон' },
  { img: '/оружие2.png', title: 'Экипировка и снаряжение', text: 'Так как военное дело требует высокой выучки, хенной на знаниях и опыте, храбрости и' },
  { img: '/оружие3.png', title: 'Инженерная подготовка', text: 'Так как военное дело требует высокой построенной на знаниях и опыте, храбрости и' },
];
const MEDICINE = [
  { img: '/медицина1.png', title: 'Тактическая медицина', text: 'Нам известно много случаев подписания курсантами кон' },
  { img: '/медицина2.png', title: 'Эвакуация', text: 'Так как военное дело требует высокой выучки, хной на знаниях и' },
];
const SERIES_COURSES = [
  { img: '/voendelo1.png', title: 'Разведывательно-штурмовая подготовка', slug: 'Разведывательно-штурмовая подготовка', text: 'Так как военное дело требует высокой выучки, хитрости' },
  { img: '/voendelo2.png', title: 'Специальная разведка', slug: 'Специальная разведка', text: 'Нам известно много случаев подписания курсантами контракта с' },
  { img: '/voendelo3.png', title: 'Общевойсковой снайпер', slug: 'Общевойсковой Снайпер', text: 'Так как военное дело требует высокой выучки, хитрости' },
];
const ENROLL_STEPS = [
  { n: 1, title: 'Оставьте заявку', desc: 'Наверху страницы заполните форму, корректно указав ФИО, телефон и электронную почту.' },
  { n: 2, title: 'Внесите предоплату', desc: 'Внесите предоплату 5000 руб. забронировав за собой место в группе.' },
  { n: 3, title: 'Пройдите инструктаж', desc: 'В чате группы на портале пройдите вводный инструктаж.' },
  { n: 4, title: 'Дождитесь набора группы', desc: 'Как только количество курсантов превысит 20 человек, мы запланируем дату старта.' },
  { n: 5, title: 'Оплатите полную стоимость', desc: 'К дате старта группы, оплатите остаток суммы по курсу.' },
];
const REVIEWS = [
  { id: 1, name: 'Коба', rank: 'Капитан', rating: 5, img: '/teacher2-main.jpg', title: 'Я получил все необходимые знания и навыки!', text: 'Курс "Общевойсковой Снайпер" — это отличная возможность получить все необходимые знания и навыки для выполнения задач на поле боя. Я рекомендую его всем, кто хочет стать высококвалифицированным снайпером. Нам известно много случаев подписания курсантами контракта с ВС РФ после КМБ и их командировку в зону боевых действий. Этого достаточно, чтобы достойно проявить себя на службе, но совершенно недостаточно, чтобы выживать на первой линии длительное время.' },
  { id: 2, name: 'Бек', rank: 'Майор', rating: 5, img: '/teacher1-main.jpg', title: 'Я получил все необходимые знания и навыки!', text: 'Курс "Общевойсковой Снайпер" — это отличная возможность получить все необходимые знания и навыки для выполнения задач на поле боя. Я рекомендую его всем, кто хочет стать высококвалифицированным снайпером.' },
];
const LETTERS = ['/blag1.png', '/blag2.png', '/blag1.png', '/blag2.png', '/blag1.png', '/blag2.png'];
const PHOTOS = ['/фотоскурса.png', '/voendelo1.png', '/voendelo2.png', '/минифотоскурса.png'];

const PHONE_CODES: [string, string, string][] = [
  ['🇷🇺', '+7', 'Россия'],
  ['🇧🇾', '+375', 'Беларусь'],
  ['🇰🇿', '+7', 'Казахстан'],
  ['🇦🇲', '+374', 'Армения'],
  ['🇰🇬', '+996', 'Кыргызстан'],
];

/* ══ PAGE ══ */
export function CourseLandingPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { setPending } = usePurchasedCoursesStore();
  const [imgErrs, setImgErrs] = useState<Record<string, boolean>>({});
  const setE = (k: string) => setImgErrs(p => ({ ...p, [k]: true }));
  const [activePhoto, setActivePhoto] = useState(0);
  const [letterIdx, setLetterIdx] = useState<number | null>(null);
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [contactSent, setContactSent] = useState(false);
  const [phoneCode, setPhoneCode] = useState('+7');
  const [phoneDrop, setPhoneDrop] = useState(false);
  const targetDate = useMemo(() => getNextCourseStart(), []);
  const targetLabel = useMemo(() => formatCourseStart(targetDate), [targetDate]);
  const targetShortLabel = useMemo(() => formatCourseStart(targetDate, false), [targetDate]);
  const courseName = slug ? decodeURIComponent(slug) : 'Разведывательно-штурмовая подготовка';

  useEffect(() => { injectCss('cl-page-css', CSS); }, []);

  useEffect(() => {
    if (letterIdx === null) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLetterIdx(null);
      if (e.key === 'ArrowLeft' && letterIdx > 0) setLetterIdx(l => (l ?? 0) - 1);
      if (e.key === 'ArrowRight' && letterIdx < LETTERS.length - 1) setLetterIdx(l => (l ?? 0) + 1);
    };
    window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn);
  }, [letterIdx]);

  useEffect(() => {
    if (!phoneDrop) return;
    const fn = () => setPhoneDrop(false);
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [phoneDrop]);

  const handleEnroll = () => {
    setPending({ slug: slug ?? courseName, title: courseName, price: 29000, img: '/kyrs1.png', city: 'Москва' });
    navigate('/checkout');
  };

  const EnrollBtn = ({ label = 'Записаться на курс', style }: { label?: string; style?: React.CSSProperties }) => (
    <button className="cl-enroll" onClick={handleEnroll} style={{ padding: '15px 36px', background: 'var(--primary-base, #375DFB)', border: 'none', borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 22px rgba(55,93,251,.42)', ...style }}>{label}</button>
  );

  const DiscCard = ({ img: src, title, text, idx, prefix }: { img: string; title: string; text: string; idx: number; prefix: string }) => (
    <div className="cl-dc" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#fff' }}>
      <div style={{ height: 200, overflow: 'hidden', background: '#F3F4F6' }}>
        {!imgErrs[`${prefix}${idx}`]
          ? <img src={src} alt="" className="cl-di" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setE(`${prefix}${idx}`)} />
          : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{text}</div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F8F9FB' }}>

      {/* BREADCRUMB */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', animation: 'fadeIn .4s ease' }}>
        {([['Главная', '/'], ['Военная подготовка', '/courses'], [courseName, null]] as [string, string | null][]).map(([l, p], i, arr) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {p ? <span onClick={() => navigate(p)} style={{ cursor: 'pointer', transition: 'color .15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}>{l}</span>
              : <span style={{ color: '#374151', fontWeight: 500 }}>{l}</span>}
            {i < arr.length - 1 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>
        ))}
      </div>

      {/* ══ MAIN LAYOUT: sidebar (LEFT) + content ══ */}
      <div style={{ padding: '24px 28px 0', display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* ── STICKY SIDEBAR (LEFT) ── */}
        <CourseSidebar onEnroll={handleEnroll} />

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ══ 1. HERO ══ */}
          <div id="section-general">
            <Sec style={{ marginBottom: 22 }}>
              <div style={{ position: 'relative', borderRadius: 26, overflow: 'hidden', minHeight: 500, background: '#0a0a14', display: 'flex', alignItems: 'center' }}>
                {/* Soldier image — fills right 58% */}
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '58%' }}>
                  {!imgErrs['hero']
                    ? <img src="/СолдатКурса.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} onError={() => setE('hero')} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }} />}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0a0a14 0%, rgba(10,10,20,0.55) 40%, transparent 70%)' }} />
                </div>

                {/* Left content column */}
                <div style={{ position: 'relative', zIndex: 2, padding: '44px 52px 44px', width: '52%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 500 }}>
                  <div>
                    {/* Badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 999, padding: '5px 16px', fontSize: 13, color: '#fff', marginBottom: 28, width: 'fit-content', backdropFilter: 'blur(8px)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ marginRight: 6 }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      Курс
                    </div>
                    {/* Title */}
                    <h1 style={{ fontSize: 46, fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 18px', animation: 'fadeUp .5s ease', letterSpacing: '-.6px' }}>
                      {courseName}
                    </h1>
                    {/* Subtitle */}
                    <p style={{ fontSize: 17, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, margin: 0, animation: 'fadeUp .5s ease .08s both' }}>
                      Поможем освоить все навыки с нуля за 9 месяцев.<br />В строю с подготовленными командирами Воевода.
                    </p>
                  </div>

                  {/* Bottom: date + button */}
                  <div style={{ animation: 'fadeUp .5s ease .12s both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, fontSize: 14, color: 'rgba(255,255,255,.6)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Ближайший старт — {targetShortLabel}
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.4)', display: 'inline-block' }} />
                      Осталось 12 мест
                    </div>
                    <button
                      className="cl-enroll"
                      onClick={handleEnroll}
                      style={{ width: '100%', maxWidth: 380, padding: '17px 0', background: 'var(--primary-base, #375DFB)', border: 'none', borderRadius: 16, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 22px rgba(55,93,251,.42)', display: 'block' }}
                    >
                      Записаться на курс
                    </button>
                  </div>
                </div>

                {/* Stats chips — absolute bottom-right over image */}
                <div style={{ position: 'absolute', bottom: 28, right: 28, zIndex: 3, display: 'flex', gap: 12, animation: 'fadeUp .5s ease .22s both' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '12px 18px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,.3)', flexShrink: 0, background: '#2a2a3e' }}>
                      {!imgErrs['statImg'] && <img src="/teacher1-main.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setE('statImg')} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>14 888 бойцов</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>прошло обучение</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '12px 18px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>5.0 рейтинг</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>на основе <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>192 отзыва</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </Sec>
          </div>

          {/* ══ 2. METADATA ══ */}
          <Sec style={{ marginBottom: 22 }}>
            <CourseMetaSummary />
          </Sec>

          {/* ══ 3. INSTRUCTOR + COUNTDOWN ══ */}
          <Sec style={{ marginBottom: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 76, height: 76, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                  {!imgErrs['instr'] ? <img src="/сержант.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setE('instr')} /> : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: '.5px' }}>Вице-ст. сержант</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>Торнадо</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F9FAFB', padding: '3px 8px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 12 }}>
                      <span style={{ color: '#9CA3AF' }}>ИВ</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                      <span style={{ fontWeight: 700, color: '#111' }}>2463</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFBEB', padding: '3px 8px', borderRadius: 7, border: '1px solid #FDE68A', fontSize: 12 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <span style={{ fontWeight: 700, color: '#374151' }}>5.0</span>
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>Главный инструктор</div>
                  <button className="cl-ghost" onClick={() => navigate('/messages?chat=1')} style={{ padding: '9px 20px', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 12, color: '#375DFB', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Задать вопрос по курсу</button>
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 20 }}>
                  Ближайший старт группы — <span style={{ color: '#375DFB', fontWeight: 800 }}>{targetLabel}</span>
                </div>
                <Countdown target={targetDate} />
              </div>
            </div>
          </Sec>

          {/* ══ 4. ВИДЕО-ПРЕЗЕНТАЦИЯ ══ */}
          <div id="section-video">
            <Sec style={{ marginBottom: 22 }}>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: '0 0 20px' }}>Видео-презентация</h2>
                <div style={{ borderRadius: 18, overflow: 'hidden', position: 'relative', cursor: 'pointer', background: '#1a1a2e' }}>
                  {!imgErrs['prez']
                    ? <img src="/prez.png" alt="" style={{ width: '100%', height: 460, objectFit: 'cover', display: 'block' }} onError={() => setE('prez')} />
                    : <div style={{ width: '100%', height: 460, background: 'linear-gradient(135deg,#1a1a2e,#2d3748)' }} />}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(239,68,68,.55)', transition: 'transform .15s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </Sec>
          </div>

          {/* ══ 5. ПРЕИМУЩЕСТВА ══ */}
          <Sec style={{ marginBottom: 22 }}>
            <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 24px' }}>Преимущества курса</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 48px' }}>
                {BENEFITS.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, border: '1.5px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.55 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </Sec>

          {/* ══ 6. ДИПЛОМ ══ */}
          <Sec style={{ marginBottom: 22 }}>
            <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 20px' }}>Диплом о прохождении</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: 18, color: '#374151', lineHeight: 1.75, margin: '0 0 24px' }}>
                    Нам известно много случаев подписания курсантами контракта с ВС РФ после КМБ и их командировку в зону боевых действий. Этого достаточно, чтобы достойно проявить себя на службе, но совершенно недостаточно, чтобы выживать на первой линии длительное время. Так как военное дело требует высокой выучки, хитрости построенной на знаниях и опыте, храбрости и немного удачи — невозможно этому научиться за несколько дней.
                  </p>
                  {['Возможность подписания контракта с ВС РФ', 'Получение новых знаний и навыков', 'Доступ к курсу «Разведывательно-штурмовая подготовка»'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 6, border: '1.5px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span style={{ fontSize: 17, fontWeight: 600, color: '#374151' }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,.12)' }}>
                  {!imgErrs['dip1']
                    ? <img src="/dip1.png" alt="" style={{ width: '100%', display: 'block' }} onError={() => setE('dip1')} />
                    : <div style={{ height: 300, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 14 }}>Диплом</div>}
                </div>
              </div>
            </div>
          </Sec>

          {/* ══ 7. ТРЕБОВАНИЯ ══ */}
          <div id="section-requirements">
            <Sec style={{ marginBottom: 22 }}>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 24px' }}>Требования к курсантам</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {REQUIREMENTS.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 18px', background: '#F9FAFB', borderRadius: 14, border: '1px solid #F0F0F0' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#374151' }}>{i + 1}</div>
                      <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.55, paddingTop: 8 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Sec>
          </div>

          {/* ══ 8. ФОТО ══ */}
          <div id="section-photos">
            <Sec style={{ marginBottom: 22 }}>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 20px' }}>Фотографии с курса</h2>
                <div style={{ borderRadius: 18, overflow: 'hidden', marginBottom: 16, position: 'relative', background: '#F3F4F6' }}>
                  <button onClick={() => setActivePhoto(p => Math.max(0, p - 1))} disabled={activePhoto === 0} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', cursor: activePhoto === 0 ? 'default' : 'pointer', opacity: activePhoto === 0 ? .3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  {!imgErrs[`photo${activePhoto}`]
                    ? <img src={PHOTOS[activePhoto]} alt="" style={{ width: '100%', height: 480, objectFit: 'cover', display: 'block' }} onError={() => setE(`photo${activePhoto}`)} />
                    : <div style={{ width: '100%', height: 480, background: 'linear-gradient(135deg,#F3F4F6,#E5E7EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 14 }}>Фото</div>}
                  <button onClick={() => setActivePhoto(p => Math.min(PHOTOS.length - 1, p + 1))} disabled={activePhoto === PHOTOS.length - 1} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', cursor: activePhoto === PHOTOS.length - 1 ? 'default' : 'pointer', opacity: activePhoto === PHOTOS.length - 1 ? .3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {PHOTOS.map((src, i) => (
                    <div key={i} className="cl-photo-thumb" onClick={() => setActivePhoto(i)} style={{ width: 130, height: 88, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: `2px solid ${activePhoto === i ? '#375DFB' : '#E5E7EB'}`, background: '#F3F4F6' }}>
                      {!imgErrs[`th${i}`]
                        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setE(`th${i}`)} />
                        : <div style={{ width: '100%', height: '100%', background: '#E5E7EB' }} />}
                    </div>
                  ))}
                </div>
              </div>
            </Sec>
          </div>

          {/* ══ 9. CTA BANNER 1 ══ */}
          <Sec style={{ marginBottom: 22 }}>
            <div style={{ position: 'relative', borderRadius: 26, overflow: 'hidden', minHeight: 360, background: '#0d1117', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '48%' }}>
                {!imgErrs['ctaSold']
                  ? <img src="/записьсолдат.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={() => setE('ctaSold')} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#2d1b69)' }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,#0d1117 0%,transparent 55%)' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 2, padding: '44px 48px', maxWidth: 560 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,.2)', border: '1px solid rgba(239,68,68,.4)', borderRadius: 20, padding: '5px 14px', fontSize: 13, color: '#FCA5A5', marginBottom: 20 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Скидка 20% до 15 марта
                </div>
                <h2 style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.2, margin: '0 0 16px', letterSpacing: '-.4px' }}>Становись в строй с лучшими бойцами и командирами</h2>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, margin: '0 0 20px' }}>Поможем освоить все навыки с нуля за 9 месяцев.<br />В строю с подготовленными командирами Воевода.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, fontSize: 14, color: 'rgba(255,255,255,.6)' }}>
                  <span>Ближайший старт - {targetShortLabel}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.4)', display: 'inline-block' }} />
                  <span>Осталось 12 мест</span>
                </div>
                <EnrollBtn />
              </div>
            </div>
          </Sec>

          {/* ══ 10. ПРОГРАММА КУРСА ══ */}
          <div id="section-program">
            <Sec style={{ marginBottom: 22 }}>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 16px' }}>Программа курса</h2>
                <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.75, margin: '0 0 32px' }}>
                  На курсах военной подготовки в СКВП мы делаем акцент на подготовку бойца, способного действовать в составе ВС РФ против регулярной армии. Это важное уточнение, поскольку на многих других курсах частично готовят бойцов, способных выполнять некоторые задачи полицейского спецназа против иррегулярных подразделений.
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 18px' }}>Военное дело</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 32 }}>
                  {DISCIPLINES.map((d, i) => <DiscCard key={i} img={d.img} title={d.title} text={d.text} idx={i} prefix="disc" />)}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 18px' }}>Оружие</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 32 }}>
                  {WEAPONS.map((d, i) => <DiscCard key={i} img={d.img} title={d.title} text={d.text} idx={i} prefix="wpn" />)}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 18px' }}>Медицина</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
                  {MEDICINE.map((d, i) => <DiscCard key={i} img={d.img} title={d.title} text={d.text} idx={i} prefix="med" />)}
                </div>
              </div>
            </Sec>
          </div>

          {/* ══ 11. РАСПИСАНИЕ ══ */}
          <div id="section-schedule">
            <Sec style={{ marginBottom: 22 }}>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 28px 24px' }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 20px' }}>Расписание старта потоков</h2>
                <StreamCalendar />
              </div>
            </Sec>
          </div>

          {/* ══ 12. УСЛОВИЯ + ЭКИПИРОВКА ══ */}
          <Sec style={{ marginBottom: 22 }}>
            <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 16px' }}>Условия обучения</h2>
              <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.75, margin: '0 0 12px' }}>
                Наш КМБ отличается от всего того, что существует в войсках, поскольку полностью заточен на боевую подготовку. Нам известно много случаев подписания курсантами контракта с ВС РФ после прохождения КМБ и их командировку в зону боевых действий.
              </p>
              <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.75, margin: '0 0 32px' }}>
                На курсах военной подготовки в СКВП мы делаем акцент на подготовку бойца, способного действовать в составе ВС РФ против регулярной армии. Это важное уточнение, поскольку на многих других курсах частично готовят бойцов, способных выполнять некоторые задачи полицейского спецназа против иррегулярных подразделений.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Рекомендации по экипировке</h3>
                <button className="cl-ghost" style={{ padding: '8px 16px', background: '#F4F6FA', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: '#374151', cursor: 'pointer' }} onClick={() => navigate('/kaptorka')}>Смотреть товары</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {EQUIPMENT.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '12px 18px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #F0F0F0' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>{i + 1}</div>
                    <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.55, paddingTop: 6 }}>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          </Sec>

          {/* ══ 13. РЕЗУЛЬТАТЫ + СЕРИЯ + ШАГИ ══ */}
          <div id="section-enroll">
            <Sec style={{ marginBottom: 22 }}>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 16px' }}>Результаты прохождения курса</h2>
                <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.75, margin: '0 0 32px' }}>
                  На курсах военной подготовки в СКВП мы делаем акцент на подготовку бойца, способного действовать в составе ВС РФ против регулярной армии. Это важное уточнение, поскольку на многих других курсах частично готовят бойцов, способных выполнять некоторые задачи полицейского спецназа против иррегулярных подразделений.
                </p>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 18px' }}>Другие курсы из серии</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 36 }}>
                  {SERIES_COURSES.map((c, i) => (
                    <div key={i} className="cl-sr" onClick={() => navigate(`/courses/${encodeURIComponent(c.slug)}`)} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#fff' }}>
                      <div style={{ height: 200, overflow: 'hidden', background: '#F3F4F6' }}>
                        {!imgErrs[`sr${i}`]
                          ? <img src={c.img} alt="" className="cl-si" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setE(`sr${i}`)} />
                          : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>{c.title}</div>
                        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, marginBottom: 12 }}>{c.text}</div>
                        <button className="cl-ghost" onClick={e => { e.stopPropagation(); navigate(`/courses/${encodeURIComponent(c.slug)}`); }} style={{ padding: '8px 16px', background: '#F4F6FA', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: '#374151', cursor: 'pointer' }}>Подробнее</button>
                      </div>
                    </div>
                  ))}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 18px' }}>Пошаговая инструкция записи на обучение</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ENROLL_STEPS.map((s, i) => (
                    <div key={i} className="cl-step" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 18px', background: '#F9FAFB', border: '1px solid #F0F0F0' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#374151' }}>{s.n}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>{s.title}</div>
                        <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.55 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Sec>
          </div>

          {/* ══ 14. CTA BANNER 2 — ПОДАРКИ ══ */}
          <Sec style={{ marginBottom: 22 }}>
            <div style={{ position: 'relative', borderRadius: 26, overflow: 'hidden', minHeight: 340, background: '#1A1208', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '52%' }}>
                {!imgErrs['gift']
                  ? <img src="/подарокзапрохождение.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={() => setE('gift')} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#2d1b10,#1a1208)' }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,#1A1208 0%,transparent 50%)' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 2, padding: '44px 48px', maxWidth: 560 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 20, padding: '6px 16px', fontSize: 13, color: '#fff', marginBottom: 22, backdropFilter: 'blur(8px)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                  Подарки за прохождение
                </div>
                <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.2, margin: '0 0 14px', letterSpacing: '-.4px' }}>
                  Запишись и получи бесплатно курс «Тактическая медицина»
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, margin: '0 0 18px' }}>
                  Курс появится у вас в личном кабинете. Сможете начать и проходить в удобное время в онлайн формате.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26, fontSize: 14, color: 'rgba(255,255,255,.6)' }}>
                  <span>Ближайший старт - {targetShortLabel}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.4)', display: 'inline-block' }} />
                  <span>Осталось 12 мест</span>
                </div>
                <EnrollBtn />
              </div>
            </div>
          </Sec>

          {/* ══ 15. PEOPLE SECTION ══ */}
          <Sec style={{ marginBottom: 22 }}>
            <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', overflow: 'hidden', padding: '24px 0' }}>
              <PeopleSection />
            </div>
          </Sec>

          {/* ══ 16. КАРТА ══ */}
          <div id="section-map">
            <Sec style={{ marginBottom: 22 }}>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Где проходит курс</h2>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Полигон «Калибр» · Минское шоссе, 31-й километр, с1, Москва</div>
                </div>
                <YandexTrainingMap variant="course" height={400} />
              </div>
            </Sec>
          </div>

          {/* ══ 17. ОТЗЫВЫ ══ */}
          <div id="section-reviews">
            <Sec style={{ marginBottom: 22 }}>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #F0F0F0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Отзывы о курсе</h2>
                </div>
                {REVIEWS.map((r, i) => (
                  <div key={r.id} className="cl-review" style={{ padding: '28px 0', borderBottom: i < REVIEWS.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                      <div style={{ width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '2px solid #E5E7EB' }}>
                        {!imgErrs[`rev${r.id}`] ? <img src={r.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setE(`rev${r.id}`)} /> : null}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>{r.name}</span>
                        <span style={{ fontSize: 15, color: '#9CA3AF' }}>{r.rank}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          <span style={{ fontSize: 15, color: '#374151', fontWeight: 500 }}>{r.rating} баллов</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '18px 22px', border: '1px solid #F0F0F0' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 10 }}>{r.title}</div>
                      <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}>{r.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Sec>
          </div>

          {/* ══ 18. БЛАГОДАРСТВЕННЫЕ ПИСЬМА ══ */}
          <Sec style={{ marginBottom: 22 }}>
            <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #F0F0F0' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Благодарственные письма</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {LETTERS.map((src, i) => (
                  <div key={i} className="cl-letter" onClick={() => setLetterIdx(i)} style={{ borderRadius: 12, overflow: 'hidden' }}>
                    {!imgErrs[`lt${i}`]
                      ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setE(`lt${i}`)} />
                      : <div style={{ height: 200, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Документ</div>}
                  </div>
                ))}
              </div>
            </div>
          </Sec>

          {/* ══ 19. КОНТАКТНАЯ ФОРМА ══ */}
          <Sec style={{ marginBottom: 24 }}>
            <div style={{ background: '#0F141F', borderRadius: 26, overflow: 'hidden', position: 'relative', padding: '44px 48px' }}>
              <div style={{ position: 'absolute', left: -160, top: '50%', transform: 'translateY(-50%)', width: 640, height: 640, borderRadius: '50%', background: '#1B2336', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)', width: 380, height: 380, borderRadius: '50%', background: '#1B2336', opacity: .65, pointerEvents: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: 360 }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.2, margin: '0 0 14px', letterSpacing: '-.5px' }}>Остались вопросы?</h2>
                    <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)', lineHeight: 1.7, margin: 0 }}>
                      Оставьте свои контактные данные —<br />свяжемся и ответим на все вопросы
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 48 }}>
                    <div style={{ height: 66, flexShrink: 0 }}>
                      {!imgErrs['logo']
                        ? <img src="/logo.png" alt="Воевода" style={{ height: '100%', objectFit: 'contain', display: 'block' }} onError={() => setE('logo')} />
                        : <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>ВОЕВОДА</div>}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Поддержка УТЦ «Воевода»
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', flexShrink: 0 }} />
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>на связи с понедельника по пятницу, с 9 до 20</div>
                    </div>
                  </div>
                </div>
                <div>
                  {!contactSent ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.75)', marginBottom: 6 }}>
                          Ваше имя <span style={{ color: '#375DFB' }}>*</span>
                        </label>
                        <input
                          value={contact.name}
                          onChange={e => setContact(p => ({ ...p, name: e.target.value }))}
                          placeholder="Иван"
                          style={{ width: '100%', padding: '13px 16px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, fontSize: 14, outline: 'none', background: 'rgba(255,255,255,.07)', color: '#fff', boxSizing: 'border-box' as const, transition: 'border-color .15s' }}
                          onFocus={e => (e.currentTarget.style.borderColor = '#375DFB')}
                          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)')}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.75)', marginBottom: 6 }}>
                          Мобильный номер <span style={{ color: '#375DFB' }}>*</span>
                        </label>
                        <div
                          style={{ display: 'flex', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, overflow: 'visible', position: 'relative' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,.3)'; }}
                          onMouseLeave={e => { if (!phoneDrop) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,.15)'; }}
                        >
                          <div
                            onMouseDown={e => { e.stopPropagation(); setPhoneDrop(x => !x); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '13px 14px', flexShrink: 0, cursor: 'pointer', userSelect: 'none' as const, position: 'relative' }}
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                              <g clipPath="url(#rflag)">
                                <path d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z" fill="#F0F0F0"/>
                                <path d="M19.378 13.478C19.78 12.3946 20 11.2229 20 9.99973C20 8.77652 19.78 7.6048 19.378 6.52148H0.621992C0.220039 7.6048 0 8.77652 0 9.99973C0 11.2229 0.220039 12.3946 0.621992 13.478L10 14.3475L19.378 13.478Z" fill="#0052B4"/>
                                <path d="M10.0001 20.0003C14.2997 20.0003 17.9652 17.2865 19.3781 13.4785H0.62207C2.035 17.2865 5.70043 20.0003 10.0001 20.0003Z" fill="#D80027"/>
                              </g>
                              <defs><clipPath id="rflag"><rect width="20" height="20" fill="white"/></clipPath></defs>
                            </svg>
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{phoneCode}</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                            {phoneDrop && (
                              <div
                                onMouseDown={e => e.stopPropagation()}
                                style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, background: '#1E2A3A', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, padding: '6px 0', zIndex: 400, minWidth: 190, boxShadow: '0 12px 36px rgba(0,0,0,.5)', animation: 'dropIn .12s ease' }}
                              >
                                {PHONE_CODES.map(([flag, code, name]) => (
                                  <div
                                    key={name}
                                    onMouseDown={e => { e.stopPropagation(); setPhoneCode(code); setPhoneDrop(false); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer', fontSize: 13, color: phoneCode === code && name === 'Россия' ? '#375DFB' : 'rgba(255,255,255,.8)', fontWeight: phoneCode === code && name === 'Россия' ? 600 : 400 }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.07)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                  >
                                    <span style={{ fontSize: 16 }}>{flag}</span>
                                    <span style={{ color: 'rgba(255,255,255,.45)', minWidth: 40 }}>{code}</span>
                                    <span>{name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ width: 1, background: 'rgba(255,255,255,.15)', alignSelf: 'stretch', flexShrink: 0 }} />
                          <input
                            value={contact.phone}
                            onChange={e => setContact(p => ({ ...p, phone: e.target.value }))}
                            placeholder="(000) 000-00-00"
                            style={{ flex: 1, padding: '13px 16px', border: 'none', borderRadius: 12, fontSize: 14, outline: 'none', background: 'transparent', color: '#fff', boxSizing: 'border-box' as const }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.75)', marginBottom: 6 }}>E-mail</label>
                        <input
                          value={contact.email}
                          onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                          placeholder="voevoda@mail.ru"
                          style={{ width: '100%', padding: '13px 16px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, fontSize: 14, outline: 'none', background: 'rgba(255,255,255,.07)', color: '#fff', boxSizing: 'border-box' as const, transition: 'border-color .15s' }}
                          onFocus={e => (e.currentTarget.style.borderColor = '#375DFB')}
                          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)')}
                        />
                      </div>
                      <button
                        onClick={() => { if (contact.name && contact.phone) setContactSent(true); }}
                        disabled={!contact.name || !contact.phone}
                        style={{ width: '100%', padding: '18px 0', background: 'var(--primary-base, #375DFB)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 16, fontWeight: 700, cursor: contact.name && contact.phone ? 'pointer' : 'default', opacity: contact.name && contact.phone ? 1 : .45, transition: 'opacity .15s, box-shadow .15s', boxShadow: contact.name && contact.phone ? '0 6px 22px rgba(55,93,251,.45)' : 'none', marginTop: 4 }}
                        onMouseEnter={e => { if (contact.name && contact.phone) e.currentTarget.style.boxShadow = '0 8px 28px rgba(55,93,251,.65)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = contact.name && contact.phone ? '0 6px 22px rgba(55,93,251,.45)' : 'none'; }}
                      >
                        Перезвонить мне
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,.2)', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Заявка принята!</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)' }}>Свяжемся с вами в рабочее время.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Sec>

        </div>{/* end content */}
      </div>{/* end main layout */}

      {/* Footer */}
      <div style={{ padding: '16px 28px 32px', display: 'flex', justifyContent: 'center', gap: 32, fontSize: 12, color: '#9CA3AF', flexWrap: 'wrap' }}>
        <span>© 2015–2026 УТЦ «ВОЕВОДА»</span>
        <span style={{ cursor: 'pointer' }}>Все права защищены</span>
        <span style={{ cursor: 'pointer' }}>Политика конфиденциальности</span>
        <span style={{ cursor: 'pointer' }}>Возврат</span>
      </div>

      {/* LIGHTBOX ПИСЬМА */}
      {letterIdx !== null && (
        <div onClick={() => setLetterIdx(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, backdropFilter: 'blur(5px)', animation: 'fadeIn .2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 800, width: '100%' }}>
            <button onClick={() => setLetterIdx(null)} style={{ position: 'absolute', top: -14, right: -14, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.25)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}>×</button>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 12, fontWeight: 500 }}>{letterIdx + 1} / {LETTERS.length}</div>
            <div style={{ width: '100%', background: '#1a1a2e', borderRadius: 14, overflow: 'hidden', boxShadow: '0 28px 70px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!imgErrs[`ltm${letterIdx}`]
                ? <img key={letterIdx} src={LETTERS[letterIdx]} alt="" style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', display: 'block', animation: 'fadeIn .18s ease' }} onError={() => setE(`ltm${letterIdx}`)} />
                : <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.4)' }}>Документ</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
              <button onClick={() => letterIdx > 0 && setLetterIdx(letterIdx - 1)} disabled={letterIdx === 0} style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', color: '#fff', cursor: letterIdx === 0 ? 'not-allowed' : 'pointer', opacity: letterIdx === 0 ? .35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', maxWidth: 420 }}>
                {LETTERS.map((src, i) => (
                  <div key={i} className="cl-thumb-nav" onClick={() => setLetterIdx(i)} style={{ width: 42, height: 54, flexShrink: 0, borderRadius: 6, overflow: 'hidden', border: `2px solid ${i === letterIdx ? '#375DFB' : 'rgba(255,255,255,.15)'}`, opacity: i === letterIdx ? 1 : 0.55 }}>
                    {!imgErrs[`lt${i}`] ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,.1)' }} />}
                  </div>
                ))}
              </div>
              <button onClick={() => letterIdx < LETTERS.length - 1 && setLetterIdx(letterIdx + 1)} disabled={letterIdx === LETTERS.length - 1} style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', color: '#fff', cursor: letterIdx === LETTERS.length - 1 ? 'not-allowed' : 'pointer', opacity: letterIdx === LETTERS.length - 1 ? .35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

