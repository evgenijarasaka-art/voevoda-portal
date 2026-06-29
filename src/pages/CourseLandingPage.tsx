import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IVDisplay, PeopleSection } from '../components/PeopleSection';
import { usePurchasedCoursesStore } from '../store/usePurchasedCoursesStore';
import { YandexTrainingMap } from '../components/YandexTrainingMap';
import { CourseMetaSummary } from '../components/CourseMetaSummary';
import { StreamCalendar } from '../components/StreamCalendar';
import { VoevodaPlayer } from '../components/VoevodaPlayer';
import { userProfilePath } from '../api/testApi';
import { useCartStore } from '../store/useCartStore';

const CSS = `
  @keyframes fadeIn { from{opacity:0}to{opacity:1} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
  @keyframes dropIn { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
  @keyframes checkDraw { from{stroke-dashoffset:24}to{stroke-dashoffset:0} }
  @keyframes softPulse { 0%,100%{box-shadow:0 0 0 0 rgba(55,93,251,0)}50%{box-shadow:0 0 0 7px rgba(55,93,251,.09)} }
  .cl-s{opacity:0;transform:translateY(16px);transition:opacity .5s cubic-bezier(.4,0,.2,1),transform .32s cubic-bezier(.2,.8,.2,1)}
  .cl-s.v{opacity:1;transform:translateY(0)}
  .cl-s.v:hover{transform:translateY(0)}
  .cl-s>div{transition:box-shadow .3s ease,border-color .3s ease}
  .cl-s.v:hover>div{box-shadow:0 18px 42px rgba(31,52,105,.09);border-color:#D7E0F4!important}
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
  .cl-series-action{margin-top:auto}
  .cl-sr:hover .cl-series-action svg{transform:translateX(3px)}
  .cl-series-action svg{transition:transform .2s ease}
  .cl-step,.cl-number-row{transition:transform .22s cubic-bezier(.2,.8,.2,1),background .22s ease,border-color .22s ease,box-shadow .22s ease;border-radius:14px}
  .cl-footer-link{position:relative;border:0;background:none;padding:5px 8px;color:#7180A0;font:inherit;font-size:12px;cursor:pointer;border-radius:8px;transition:color .2s ease,background .2s ease,transform .2s ease}
  .cl-footer-link:hover{color:#375DFB;background:#EBF1FF;transform:translateY(-2px)}
  .cl-footer-link:focus-visible{outline:3px solid rgba(55,93,251,.2);outline-offset:2px}
  .cl-step:hover,.cl-number-row:hover{transform:translateX(6px);background:#F5F8FF!important;border-color:#C9D7FF!important;box-shadow:0 10px 24px rgba(37,70,150,.08)}
  .cl-step:hover .cl-number-badge,.cl-number-row:hover .cl-number-badge{animation:softPulse .8s ease;background:#375DFB!important;border-color:#375DFB!important;color:#fff!important;transform:scale(1.06)}
  .cl-number-badge{transition:transform .22s ease,background .22s ease,border-color .22s ease,color .22s ease}
  .cl-metric{transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}
  .cl-metric:hover{transform:translateY(-5px);box-shadow:0 12px 26px rgba(34,65,140,.13);border-color:#B9C8F7!important}
  .cl-letter{transition:transform .25s cubic-bezier(.4,0,.2,1),box-shadow .25s;cursor:pointer}
  .cl-letter:hover{transform:scale(1.03);box-shadow:0 10px 32px rgba(0,0,0,.16)}
  .cl-review{transition:box-shadow .28s ease,transform .28s cubic-bezier(.2,.8,.2,1),border-color .28s ease}
  .cl-review:hover{box-shadow:0 18px 42px rgba(28,52,112,.14);transform:translateY(-6px);border-color:#AFC1FF!important}
  .cl-review::after{content:'';position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,#375DFB,#7B9FFF);transform:scaleX(0);transform-origin:left;transition:transform .3s ease}
  .cl-review:hover::after{transform:scaleX(1)}
  .cl-cal-ev{transition:opacity .15s,transform .12s;cursor:pointer}
  .cl-cal-ev:hover{opacity:.82;transform:translateY(-1px)}
  .cl-cal-btn{transition:background .15s}
  .cl-cal-btn:hover{background:#EBF1FF!important;border-color:#C7D2FE!important;color:#375DFB!important}
  .cl-photo-thumb{transition:transform .2s,box-shadow .2s;cursor:pointer}
  .cl-photo-thumb:hover{transform:scale(1.04);box-shadow:0 4px 12px rgba(0,0,0,.12)}
  .cl-thumb-nav{transition:border-color .15s,opacity .15s;cursor:pointer}
  .cl-thumb-nav:hover{opacity:.85}
  .cl-sb-item{transition:color .22s ease,background .22s ease,border-left-color .22s ease;border-left:3px solid transparent}
  .cl-sb-item:hover{color:#375DFB!important;background:#F5F7FF!important}
  .cl-sb-item.active{color:#375DFB!important;background:#EBF1FF!important;border-left-color:#375DFB!important;font-weight:600!important}
  .cl-photo-nav{transition:background .18s ease,transform .18s ease,opacity .18s ease}
  .cl-photo-nav:hover:not(:disabled){background:rgba(0,0,0,.72)!important;transform:translateY(-50%) scale(1.08)!important}
  .cl-check-row,.cl-requirement{transition:transform .22s cubic-bezier(.2,.8,.2,1),background .22s ease,border-color .22s ease,box-shadow .22s ease}
  .cl-check-row:hover{transform:translateX(5px);background:#F7F9FF;border-radius:12px}
  .cl-check-row:hover .cl-check-icon,.cl-requirement:hover .cl-requirement-number{animation:softPulse .8s ease;background:#375DFB!important;border-color:#375DFB!important;color:#fff!important}
  .cl-check-row:hover .cl-check-icon svg{stroke:#fff!important;stroke-dasharray:24;animation:checkDraw .42s ease both}
  .cl-requirement:hover{transform:translateX(6px);background:#F5F8FF!important;border-color:#C9D7FF!important;box-shadow:0 10px 24px rgba(37,70,150,.08)}
  .cl-diploma-copy>.cl-ghost{margin-top:auto!important;align-self:flex-start}
  .cl-photo-main{transition:opacity .35s ease,transform .6s cubic-bezier(.2,.8,.2,1)}
  .cl-hero-card{isolation:isolate}
  .cl-stat-chip{transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s ease}
  .cl-stat-chip:hover{transform:translateY(-3px)!important;box-shadow:0 16px 32px rgba(0,0,0,.28)!important}
  .cl-stat-chip:hover .cl-stat-avatar{transform:scale(1.18) rotate(-4deg)!important}
  .cl-stat-avatar{transition:transform .35s cubic-bezier(.2,.8,.2,1)}
  .cl-hero-media{overflow:hidden;inset:-2px -2px -2px auto!important;width:calc(58% + 4px)!important;background:#0a0a14}
  .cl-hero-image{width:calc(100% + 32px)!important;max-width:none;height:calc(100% + 8px)!important;margin:-4px 0 -4px -16px;transform:scale(1.001);transform-origin:78% 50%;transition:transform .75s cubic-bezier(.2,.8,.2,1),filter .5s ease;will-change:transform;backface-visibility:hidden}
  .cl-hero-card:hover .cl-hero-image{transform:scale(1.055);filter:saturate(1.06) contrast(1.03)}
  .cl-hero-badge{overflow:hidden;transition:padding .38s cubic-bezier(.2,.8,.2,1),background .3s ease,border-color .3s ease,box-shadow .3s ease}
  .cl-hero-badge-extra{max-width:0;opacity:0;white-space:nowrap;overflow:hidden;transition:max-width .42s cubic-bezier(.2,.8,.2,1),opacity .25s ease,margin-left .42s ease}
  .cl-hero-card:hover .cl-hero-badge{padding-right:18px!important;background:rgba(55,93,251,.24)!important;border-color:rgba(157,178,255,.62)!important;box-shadow:0 10px 26px rgba(0,0,0,.18)}
  .cl-hero-card:hover .cl-hero-badge-extra{max-width:210px;opacity:1;margin-left:7px}
  .cl-cta-card:hover .cl-cta-img{transform:scale(1.04)!important}
  .cl-cta-img{transition:transform .6s cubic-bezier(.2,.8,.2,1)}
  .cl-cta-badge{display:inline-flex;align-items:center;gap:0;overflow:hidden;transition:padding .38s cubic-bezier(.2,.8,.2,1),gap .38s cubic-bezier(.2,.8,.2,1)}
  .cl-cta-card:hover .cl-cta-badge{padding-left:14px!important;padding-right:14px!important;gap:6px}
  .cl-cta-badge-text{max-width:0;overflow:hidden;white-space:nowrap;opacity:0;transition:max-width .38s cubic-bezier(.2,.8,.2,1),opacity .28s ease}
  .cl-cta-card:hover .cl-cta-badge-text{max-width:220px;opacity:1}
  .cl-contact-form{display:flex!important;flex-direction:column;gap:14px}
`;

function injectCss(id: string, css: string) {
  const existing = document.getElementById(id);
  if (existing) {
    existing.textContent = css;
    return;
  }
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
function Sec({ children, style, id }: { children: React.ReactNode; style?: React.CSSProperties; id?: string }) {
  const ref = useReveal();
  return <div ref={ref} id={id} className="cl-s" style={style}>{children}</div>;
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
          <div className="cl-metric" style={{ textAlign: 'center', minWidth: 64, background: '#F8F9FB', borderRadius: 14, padding: '10px 8px', border: '1px solid #E5E7EB' }}>
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
  { id: 'section-course-cta',   label: 'Инструкция записи' },
  { id: 'section-reviews',      label: 'Отзывы' },
  { id: 'section-map',          label: 'Местопроведения занятий' },
];

function CourseSidebar({ onEnroll, activeId }: { onEnroll: () => void; activeId?: string }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div style={{ width: 218, flexShrink: 0, position: 'sticky', top: 76, alignSelf: 'flex-start' }}>
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div>
          {SIDEBAR_ITEMS.map((item, i) => (
          <button
            key={item.id}
            className={`cl-sb-item${activeId === item.id ? ' active' : ''}`}
            onClick={() => scrollTo(item.id)}
            style={{
              display: 'block', width: '100%', padding: '6px 12px',
              textAlign: 'left', background: 'none',
              border: 'none', borderBottom: i < SIDEBAR_ITEMS.length - 1 ? '1px solid #F0F0F0' : 'none',
              fontSize: 12, lineHeight: 1.25, color: '#374151', cursor: 'pointer',
            }}
          >
            {item.label}
          </button>
          ))}
        </div>
        <div style={{ padding: '14px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 19, fontWeight: 800, color: '#16A34A', whiteSpace:'nowrap' }}>от 3 500 ₽/мес</span>
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
  { id: 1, name: 'Коба', rank: 'Капитан', rating: 5, img: '/teacher2-main.jpg', title: 'Полевые занятия — сильнейшая часть курса', text: 'Инструкторы не дают спрятаться за теорией: каждый приём закрепляется на практике. После курса спокойнее оцениваю обстановку и увереннее работаю в группе.', date:'18 июня 2026' },
  { id: 2, name: 'Бек', rank: 'Майор', rating: 5, img: '/teacher1-main.jpg', title: 'Системная подготовка без лишней воды', text: 'Материал собран последовательно — от базы до сложных сценариев. Особенно ценны разборы после упражнений и честная обратная связь.', date:'11 июня 2026' },
  { id: 3, name: 'Стрелок', rank: 'Старший лейтенант', rating: 4.9, img: '/sold1.png', title: 'Стало понятно, над чем работать дальше', text: 'Получил новые навыки и понятный план самостоятельной подготовки. Хорошая нагрузка, сильная команда и отличная организация.', date:'2 июня 2026' },
  { id: 4, name: 'Нексус', rank: 'Лейтенант', rating: 5, img: '/teacher3-main.jpg', title: 'Курс, который собирает команду', text: 'Здесь быстро учишься слышать напарника и отвечать за общий результат. Редкое сочетание дисциплины и живой атмосферы.', date:'27 мая 2026' },
];
const LETTERS = ['/blag1.png', '/blag2.png', '/blag1.png', '/blag2.png', '/blag1.png', '/blag2.png'];
const PHOTOS = ['/фотоскурса.png', '/voendelo1.png', '/voendelo2.png', '/минифотоскурса.png', '/voendelo4.png', '/оружие1.png', '/картаучений.png', '/медицина1.png'];

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
  const addCourse = useCartStore(s => s.addCourse);
  const [imgErrs, setImgErrs] = useState<Record<string, boolean>>({});
  const setE = (k: string) => setImgErrs(p => ({ ...p, [k]: true }));
  const [activePhoto, setActivePhoto] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [letterIdx, setLetterIdx] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>('section-general');
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [contactSent, setContactSent] = useState(false);
  const [phoneCode, setPhoneCode] = useState('+7');
  const [phoneDrop, setPhoneDrop] = useState(false);
  const targetDate = useMemo(() => getNextCourseStart(), []);
  const targetLabel = useMemo(() => formatCourseStart(targetDate), [targetDate]);
  const targetShortLabel = useMemo(() => formatCourseStart(targetDate, false), [targetDate]);
  const courseName = slug ? decodeURIComponent(slug) : 'Разведывательно-штурмовая подготовка';
  const coursePrice = courseName.toLowerCase().includes('молодого бойца') ? 35000 : 29000;
  const courseCartId = useMemo(
    () => 100000 + Array.from(courseName).reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 0) % 800000,
    [courseName],
  );

  useEffect(() => { injectCss('cl-page-css', CSS); }, []);

  useEffect(() => {
    if (galleryPaused) return;
    const id = window.setInterval(() => setActivePhoto(photo => (photo + 1) % PHOTOS.length), 3100);
    return () => window.clearInterval(id);
  }, [galleryPaused]);

  useEffect(() => {
    const sectionIds = SIDEBAR_ITEMS.map(s => s.id);
    const observers: IntersectionObserver[] = [];
    const visibleMap: Record<string, number> = {};
    const pickActive = () => {
      const best = sectionIds.filter(id => visibleMap[id] > 0).sort((a, b) => {
        const ia = sectionIds.indexOf(a), ib = sectionIds.indexOf(b);
        return visibleMap[b] !== visibleMap[a] ? visibleMap[b] - visibleMap[a] : ia - ib;
      });
      if (best.length) setActiveSection(best[0]);
    };
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => {
        visibleMap[id] = e.intersectionRatio;
        pickActive();
      }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-60px 0px -20% 0px' });
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

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
    addCourse({
      id: courseCartId,
      kind: 'course',
      title: courseName,
      city: 'Москва',
      duration: '3 месяца',
      price: coursePrice,
      format: 'Оффлайн',
      image: '/kyrs1.png',
      stream: targetLabel,
    });
    setPending({ slug: slug ?? courseName, title: courseName, price: coursePrice, img: '/kyrs1.png', city: 'Москва' });
    navigate('/checkout', { state: { directItem: {
      id: courseCartId, kind: 'course', title: courseName, city: 'Москва',
      duration: '3 месяца', price: coursePrice, format: 'Оффлайн',
      image: '/kyrs1.png', stream: targetLabel, isFav: false, isSelected: true,
    } } });
  };

  const EnrollBtn = ({ label = 'Записаться на курс', style }: { label?: string; style?: React.CSSProperties }) => (
    <button className="cl-enroll" onClick={handleEnroll} style={{ padding: '15px 36px', background: 'var(--primary-base, #375DFB)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 22px rgba(55,93,251,.42)', ...style }}>{label}</button>
  );

  const DiscCard = ({ img: src, title, text, idx, prefix }: { img: string; title: string; text: string; idx: number; prefix: string }) => (
    <div className="cl-dc" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#fff' }}>
      <div style={{ height: 200, overflow: 'hidden', background: '#F3F4F6' }}>
        {!imgErrs[`${prefix}${idx}`]
          ? <img src={src} alt="" className="cl-di" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} onError={() => setE(`${prefix}${idx}`)} />
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

      {/* ══ MAIN LAYOUT: sidebar (LEFT) + content ══ */}
      <div style={{ padding: '24px 28px 0', display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* ── STICKY SIDEBAR (LEFT) ── */}
        <CourseSidebar onEnroll={handleEnroll} activeId={activeSection} />

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ══ 1. HERO ══ */}
          <div id="section-general">
            <Sec style={{ marginBottom: 22 }}>
              <div className="cl-hero-card" style={{ position: 'relative', borderRadius: 26, overflow: 'hidden', minHeight: 500, background: '#0a0a14', display: 'flex', alignItems: 'center' }}>
                {/* Soldier image — fills right 58% */}
                <div className="cl-hero-media" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '58%' }}>
                  {!imgErrs['hero']
                    ? <img className="cl-hero-image" src="/СолдатКурса.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} onError={() => setE('hero')} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }} />}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0a0a14 0%, rgba(10,10,20,0.55) 40%, transparent 70%)' }} />
                </div>

                {/* Left content column */}
                <div style={{ position: 'relative', zIndex: 2, padding: '44px 52px 44px', width: '52%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 500 }}>
                  <div>
                    {/* Badge */}
                    <div className="cl-hero-badge" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 999, padding: '5px 12px', fontSize: 13, color: '#fff', marginBottom: 28, width: 'fit-content', backdropFilter: 'blur(8px)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ marginRight: 6 }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      Курс
                      <span className="cl-hero-badge-extra">военная подготовка</span>
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
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: 'rgba(255,255,255,.6)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Ближайший старт — {targetShortLabel}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, maxWidth: 240 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12, color: 'rgba(255,255,255,.55)' }}>
                            <span>Осталось мест</span>
                            <span style={{ color: '#fff', fontWeight: 700 }}>12 / 30</span>
                          </div>
                          <div style={{ height: 5, background: 'rgba(255,255,255,.15)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: '40%', height: '100%', background: 'linear-gradient(90deg,#F59E0B,#FBBF24)', borderRadius: 99, transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
                          </div>
                        </div>
                      </div>
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
                  <div className="cl-stat-chip" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '12px 18px' }}>
                    <div className="cl-stat-avatar" style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,.3)', flexShrink: 0, background: '#2a2a3e' }}>
                      {!imgErrs['statImg'] && <img src="/teacher1-main.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setE('statImg')} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>14 888 бойцов</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>прошло обучение</div>
                    </div>
                  </div>
                  <div className="cl-stat-chip" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '12px 18px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#F59E0B" stroke="none" style={{ flexShrink: 0 }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>5.0 рейтинг</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>на основе <button type="button" onClick={() => document.getElementById('section-reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ padding: 0, border: 0, background: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>192 отзывов</button></div>
                    </div>
                  </div>
                </div>
              </div>
            </Sec>
          </div>

          {/* ══ 2. METADATA ══ */}
          <Sec id="section-meta" style={{ marginBottom: 22 }}>
            <CourseMetaSummary />
          </Sec>

          {/* ══ 3. INSTRUCTOR + COUNTDOWN ══ */}
          <Sec id="section-instructor" style={{ marginBottom: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 20, alignItems: 'stretch' }}>
              <div style={{ background: 'linear-gradient(145deg,#fff 0%,#F8FAFF 100%)', borderRadius: 22, border: '1px solid #E5E7EB', padding: '18px 24px 20px', display: 'grid', gridTemplateColumns: '1fr auto', gridTemplateRows: 'auto 1fr auto', columnGap: 22, rowGap: 14, overflow: 'hidden', position: 'relative' }}>
                <div style={{ gridColumn: 1, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: '#7180A0', textTransform: 'uppercase' as const, letterSpacing: '.08em' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 8, display: 'grid', placeItems: 'center', background: '#EBF1FF', color: '#375DFB' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="5"/><path d="M9 12 7 22l5-3 5 3-2-10"/></svg>
                  </span>
                  Наставник курса
                </div>
                <div style={{ gridColumn: 1, display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                  <div style={{ width: 88, height: 88, borderRadius: 18, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '3px solid #fff', boxShadow: '0 0 0 1px #DCE3F4,0 10px 24px rgba(34,62,128,.12)' }}>
                    {!imgErrs['instr'] ? <img src="/сержант.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setE('instr')} /> : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '.5px' }}>Вице-ст. сержант</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>Торнадо</span>
                      <IVDisplay index={2463} rating={5.0} />
                    </div>
                    <div style={{ fontSize: 13, color: '#6B7280' }}>Главный инструктор</div>
                  </div>
                </div>
                <button className="cl-ghost" onClick={() => navigate('/messages?chat=1')} style={{ gridColumn: 1, justifySelf: 'start', padding: '9px 20px', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 8, color: '#375DFB', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Задать вопрос по курсу</button>
                <div style={{ gridColumn: 2, gridRow: '1 / 4', display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0, paddingLeft: 22, borderLeft: '1px solid #E8ECF4', justifyContent: 'space-between', minWidth: 138 }}>
                  {([['Опыт', '12 лет'], ['Бойцов обучено', '480'], ['Курсов проведено', '8']] as [string, string][]).map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: '.4px' }}>{label}</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent:'center' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 16 }}>
                  Ближайший старт группы — <span style={{ color: '#375DFB', fontWeight: 800 }}>{targetLabel}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                  <Countdown target={targetDate} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minWidth: 168, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280' }}><span>Свободно мест</span><span style={{ fontWeight: 800, color: '#111' }}>8 / 20</span></div>
                    <div style={{ height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}><div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg,#375DFB,#7B9FFF)', borderRadius: 99 }} /></div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.45 }}>Группа активно набирается — успейте записаться до старта</div>
                    <EnrollBtn label="Записаться" style={{ width:'100%', padding:'11px 18px', marginTop:3 }} />
                  </div>
                </div>
              </div>
            </div>
          </Sec>

          {/* ══ 4. ВИДЕО-ПРЕЗЕНТАЦИЯ ══ */}
          <div id="section-video">
            <Sec style={{ marginBottom: 22 }}>
              <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: '0 0 20px' }}>Видео-презентация</h2>
                {/* Ролик про День России — локальный файл из /public/video (без YouTube/VPN) */}
                <VoevodaPlayer src="/video/den-rossii.mp4" poster="/video/den-rossii.jpg" height={460} />
              </div>
            </Sec>
          </div>

          {/* ══ 5. ПРЕИМУЩЕСТВА ══ */}
          <Sec id="section-benefits" style={{ marginBottom: 22 }}>
            <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 24px' }}>Преимущества курса</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 48px' }}>
                {BENEFITS.map((b, i) => (
                  <div key={i} className="cl-check-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding:'5px 7px', border:'1px solid transparent' }}>
                    <div className="cl-check-icon" style={{ width: 26, height: 26, borderRadius: 6, border: '1.5px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition:'all .2s ease' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.55 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </Sec>

          {/* ══ 6. ДИПЛОМ ══ */}
          <Sec id="section-diploma" style={{ marginBottom: 22 }}>
            <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 20px' }}>Диплом о прохождении</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 32, alignItems: 'stretch' }}>
                <div className="cl-diploma-copy" style={{ display:'flex', flexDirection:'column', minWidth:0 }}>
                  <p style={{ fontSize: 15, color: '#53617E', lineHeight: 1.7, margin: '0 0 18px', maxWidth:760 }}>
                    Нам известно много случаев подписания курсантами контракта с ВС РФ после КМБ и их командировку в зону боевых действий. Этого достаточно, чтобы достойно проявить себя на службе, но совершенно недостаточно, чтобы выживать на первой линии длительное время. Так как военное дело требует высокой выучки, хитрости построенной на знаниях и опыте, храбрости и немного удачи — невозможно этому научиться за несколько дней.
                  </p>
                  {['Возможность подписания контракта с ВС РФ', 'Получение новых знаний и навыков', 'Доступ к курсу «Разведывательно-штурмовая подготовка»'].map((item, i) => (
                    <div key={i} className="cl-check-row" style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 6, padding:'8px 10px', border:'1px solid #E3E8F3', borderRadius:12, background:'#F7F9FF' }}>
                      <div className="cl-check-icon" style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid #C9D7FF', background:'#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition:'all .2s ease' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#374151', lineHeight:1.4 }}>{item}</span>
                    </div>
                  ))}
                  <button className="cl-ghost" onClick={() => navigate('/messages?chat=1')} style={{ marginTop:14, display:'inline-flex', alignItems:'center', gap:8, padding:'11px 17px', background:'#EBF1FF', border:'1px solid #C7D2FE', borderRadius:11, color:'#375DFB', fontSize:13, fontWeight:800, cursor:'pointer' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Задать вопрос</button>
                </div>
                <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,.12)', alignSelf:'start' }}>
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
                    <div key={i} className="cl-requirement" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 18px', background: '#F9FAFB', borderRadius: 14, border: '1px solid #F0F0F0' }}>
                      <div className="cl-requirement-number" style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#374151', transition:'all .2s ease' }}>{i + 1}</div>
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
                <div onMouseEnter={() => setGalleryPaused(true)} onMouseLeave={() => setGalleryPaused(false)} style={{ borderRadius: 18, overflow: 'hidden', marginBottom: 16, position: 'relative', background: '#F3F4F6' }}>
                  <button aria-label="Предыдущее фото" className="cl-photo-nav" onClick={() => setActivePhoto(p => (p - 1 + PHOTOS.length) % PHOTOS.length)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,.58)', border: '2px solid rgba(255,255,255,.45)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,.28)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  {!imgErrs[`photo${activePhoto}`]
                    ? <img key={activePhoto} className="cl-photo-main" src={PHOTOS[activePhoto]} alt={`Фотография с курса ${activePhoto + 1}`} style={{ width: '100%', height: 480, objectFit: 'cover', objectPosition: 'center top', display: 'block', animation:'fadeIn .35s ease' }} onError={() => setE(`photo${activePhoto}`)} />
                    : <div style={{ width: '100%', height: 480, background: 'linear-gradient(135deg,#F3F4F6,#E5E7EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 14 }}>Фото</div>}
                  <button aria-label="Следующее фото" className="cl-photo-nav" onClick={() => setActivePhoto(p => (p + 1) % PHOTOS.length)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,.58)', border: '2px solid rgba(255,255,255,.45)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,.28)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                  <div className="voevoda-slider-panel">{PHOTOS.map((_,i)=><button key={i} className={`voevoda-slider-dot${i===activePhoto?' is-active':''}`} aria-label={`Фото ${i+1}`} onClick={() => setActivePhoto(i)} />)}</div>
                </div>
                <div style={{ display: 'flex', gap: 12, overflowX:'auto', padding:'2px 2px 7px', scrollbarWidth:'thin' }}>
                  {PHOTOS.map((src, i) => (
                    <div key={i} className="cl-photo-thumb" onClick={() => setActivePhoto(i)} style={{ width: 130, height: 88, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: `2px solid ${activePhoto === i ? '#375DFB' : '#E5E7EB'}`, background: '#F3F4F6' }}>
                      {!imgErrs[`th${i}`]
                        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={() => setE(`th${i}`)} />
                        : <div style={{ width: '100%', height: '100%', background: '#E5E7EB' }} />}
                    </div>
                  ))}
                </div>
              </div>
            </Sec>
          </div>

          {/* ══ 9. CTA BANNER 1 ══ */}
          <Sec id="section-course-cta" style={{ marginBottom: 22 }}>
            <div className="cl-cta-card" style={{ position: 'relative', borderRadius: 26, overflow: 'hidden', minHeight: 360, background: '#0d1117', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '48%', overflow: 'hidden' }}>
                {!imgErrs['ctaSold']
                  ? <img className="cl-cta-img" src="/записьсолдат.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={() => setE('ctaSold')} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#2d1b69)' }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,#0d1117 0%,transparent 55%)' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 2, padding: '44px 48px', maxWidth: 560 }}>
                <div className="cl-cta-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: 'rgba(239,68,68,.2)', border: '1px solid rgba(239,68,68,.4)', borderRadius: 20, padding: '5px 8px', fontSize: 13, color: '#FCA5A5', marginBottom: 20 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span className="cl-cta-badge-text">Скидка 20% до 15 марта</span>
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
          <Sec id="section-conditions" style={{ marginBottom: 22 }}>
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
                <button className="voevoda-view-all" style={{ minHeight: 38 }} onClick={() => navigate('/shop?category=Снаряжение&from=course')}>
                  Смотреть товары
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {EQUIPMENT.map((e, i) => (
                  <div key={i} className="cl-number-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '12px 18px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #F0F0F0' }}>
                    <div className="cl-number-badge" style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>{i + 1}</div>
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
                    <div key={i} className="cl-sr" role="link" tabIndex={0} aria-label={`Открыть курс «${c.title}»`} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') navigate(`/courses/${encodeURIComponent(c.slug)}`); }} onClick={() => navigate(`/courses/${encodeURIComponent(c.slug)}`)} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#fff', display:'flex', flexDirection:'column' }}>
                      <div style={{ height: 200, overflow: 'hidden', background: '#F3F4F6' }}>
                        {!imgErrs[`sr${i}`]
                          ? <img src={c.img} alt="" className="cl-si" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} onError={() => setE(`sr${i}`)} />
                          : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
                      </div>
                      <div style={{ padding: '14px 16px', display:'flex', flexDirection:'column', flex:1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>{c.title}</div>
                        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, marginBottom: 12 }}>{c.text}</div>
                        <button className="voevoda-view-all cl-series-action" onClick={e => { e.stopPropagation(); navigate(`/courses/${encodeURIComponent(c.slug)}`); }} style={{ minHeight: 38, alignSelf:'flex-start' }}>
                          Подробнее
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 18px' }}>Пошаговая инструкция записи на обучение</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ENROLL_STEPS.map((s, i) => (
                    <div key={i} className="cl-step" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 18px', background: '#F9FAFB', border: '1px solid #F0F0F0' }}>
                      <div className="cl-number-badge" style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#374151' }}>{s.n}</div>
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
          <Sec id="section-gift" style={{ marginBottom: 22 }}>
            <div className="cl-cta-card" style={{ position: 'relative', borderRadius: 26, overflow: 'hidden', minHeight: 340, background: '#1A1208', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '52%', overflow: 'hidden' }}>
                {!imgErrs['gift']
                  ? <img className="cl-cta-img" src="/подарокзапрохождение.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={() => setE('gift')} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#2d1b10,#1a1208)' }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,#1A1208 0%,transparent 50%)' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 2, padding: '44px 48px', maxWidth: 560 }}>
                <div className="cl-cta-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 20, padding: '6px 9px', fontSize: 13, color: '#fff', marginBottom: 22, backdropFilter: 'blur(8px)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{flexShrink:0}}><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                  <span className="cl-cta-badge-text">Подарки за прохождение</span>
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
          <div id="section-people" style={{ marginBottom: 22 }}>
            <PeopleSection noOuterPadding />
          </div>

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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', gap: 18, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #E8ECF4', flexWrap:'wrap' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ width:36,height:36,borderRadius:11,display:'grid',placeItems:'center',background:'#EBF1FF',color:'#375DFB' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
                      <div><h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Отзывы о курсе</h2><div style={{fontSize:12,color:'#8A96AE',marginTop:3}}>Подтверждённые участники потока</div></div>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:16,padding:'9px 13px',border:'1px solid #DCE5F5',borderRadius:14,background:'linear-gradient(135deg,#F8FAFF,#EEF3FF)'}}>
                    <div style={{fontSize:28,fontWeight:900,color:'#17213A',lineHeight:1}}>5.0</div>
                    <div><div style={{display:'flex',gap:2}}>{Array.from({length:5}).map((_,i)=><svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F5A623"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}</div><div style={{fontSize:11,color:'#8A96AE',marginTop:3}}>192 оценки</div></div>
                    <span style={{padding:'5px 8px',borderRadius:99,background:'#E9FBF2',color:'#059669',fontSize:10,fontWeight:900,textTransform:'uppercase',letterSpacing:'.06em'}}>проверено</span>
                  </div>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:16 }}>
                  {REVIEWS.map(r => (
                    <article key={r.id} className="cl-review" style={{ position:'relative',minHeight:250,padding:'20px',border:'1px solid #E3E8F3',borderRadius:18,background:'linear-gradient(145deg,#FFFFFF 0%,#F5F8FF 100%)',display:'flex',flexDirection:'column',overflow:'hidden' }}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:18}}>
                        <div style={{display:'flex',alignItems:'center',gap:12}}>
                          <div style={{width:52,height:52,borderRadius:15,overflow:'hidden',flexShrink:0,background:'#F3F4F6',border:'3px solid #fff',boxShadow:'0 0 0 1px #C9D7FF,0 7px 18px rgba(42,70,135,.13)'}}>{!imgErrs[`rev${r.id}`]&&<img src={r.img} alt={r.name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={()=>setE(`rev${r.id}`)}/>}</div>
                          <div><div style={{fontSize:16,fontWeight:850,color:'#17213A'}}>{r.name}</div><div style={{fontSize:11,color:'#8A96AE',marginTop:2}}>{r.rank} · участник курса</div></div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:5,padding:'5px 8px',borderRadius:9,background:'#FFF7E8',color:'#9A6500',fontSize:12,fontWeight:900}}><svg width="13" height="13" viewBox="0 0 24 24" fill="#F5A623"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{r.rating}</div>
                      </div>
                      <h3 style={{fontSize:16,lineHeight:1.35,fontWeight:800,color:'#17213A',margin:'0 0 10px'}}>{r.title}</h3>
                      <p style={{fontSize:14,color:'#53617E',lineHeight:1.68,margin:0}}>{r.text}</p>
                      <div style={{marginTop:'auto',paddingTop:16,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,fontSize:11,color:'#9AA5BA'}}><span>{r.date}</span><span style={{display:'flex',alignItems:'center',gap:5,color:'#059669',fontWeight:800}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>обучение подтверждено</span></div>
                      <div style={{display:'flex',gap:8,marginTop:14,paddingTop:14,borderTop:'1px solid #E8ECF4'}}>
                        <button onClick={() => navigate(userProfilePath(r.name))} style={{flex:1,padding:'9px 12px',border:'1px solid #C7D2FE',background:'#F4F7FF',color:'#375DFB',fontSize:12,fontWeight:800,cursor:'pointer'}}>Профиль</button>
                        <button onClick={() => navigate(`/messages?chat=${r.id}`)} style={{flex:1,padding:'9px 12px',border:'none',background:'#375DFB',color:'#fff',fontSize:12,fontWeight:800,cursor:'pointer'}}>Написать</button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </Sec>
          </div>

          {/* ══ 18. БЛАГОДАРСТВЕННЫЕ ПИСЬМА ══ */}
          <Sec id="section-letters" style={{ marginBottom: 22 }}>
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
          <Sec id="section-contact" style={{ marginBottom: 24 }}>
            <div style={{ background: '#0F141F', borderRadius: 26, overflow: 'hidden', position: 'relative', padding: '36px 40px' }}>
              <div style={{ position: 'absolute', left: -260, top: '50%', transform: 'translateY(-50%)', width: 520, height: 520, borderRadius: '50%', background: '#1B2336', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: 110, top: -130, width: 230, height: 230, borderRadius: '50%', border:'1px solid rgba(123,159,255,.16)', pointerEvents: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px,1fr) 620px', justifyContent:'space-between', gap: 48, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: 300 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'5px 9px',marginBottom:16,borderRadius:99,border:'1px solid rgba(123,159,255,.25)',background:'rgba(55,93,251,.1)',color:'#9DB2FF',fontSize:10,fontWeight:900,textTransform:'uppercase',letterSpacing:'.09em'}}><span style={{width:6,height:6,borderRadius:'50%',background:'#4ADE80'}}/>поддержка онлайн</div>
                    <h2 style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.08, margin: '0 0 14px', letterSpacing: '-.5px' }}>Остались<br/>вопросы?</h2>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.65, margin: 0, maxWidth:330 }}>
                      Оставьте контакты — поможем с программой, оплатой и выбором потока.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28 }}>
                    <div style={{ height: 54, flexShrink: 0 }}>
                      {!imgErrs['logo']
                        ? <img src="/logo.png" alt="Воевода" style={{ height: '100%', objectFit: 'contain', display: 'block' }} onError={() => setE('logo')} />
                        : <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>ВОЕВОДА</div>}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Поддержка УТЦ «Воевода»
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', flexShrink: 0 }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>Пн–Пт · 9:00–20:00</div>
                    </div>
                  </div>
                </div>
                <div style={{ width:'100%', maxWidth:620, justifySelf:'end' }}>
                  {!contactSent ? (
                    <div className="cl-contact-form" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                        style={{ width: '100%', padding: '16px 0', background: 'var(--primary-base, #375DFB)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 16, fontWeight: 700, cursor: contact.name && contact.phone ? 'pointer' : 'default', opacity: contact.name && contact.phone ? 1 : .45, transition: 'opacity .15s, box-shadow .15s', boxShadow: contact.name && contact.phone ? '0 6px 22px rgba(55,93,251,.45)' : 'none', marginTop: 4 }}
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
      <div style={{ padding: '16px 28px 32px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, fontSize: 12, color: '#9CA3AF', flexWrap: 'wrap' }}>
        <span>© 2015–2026 УТЦ «ВОЕВОДА»</span>
        <span>Все права защищены</span>
        <button type="button" className="cl-footer-link" onClick={() => navigate('/privacy')}>Политика конфиденциальности</button>
        <button type="button" className="cl-footer-link" onClick={() => navigate('/terms')}>Соглашение и возвраты</button>
        <button type="button" className="cl-footer-link" onClick={() => navigate('/cookies')}>Политика cookie</button>
        <button type="button" className="cl-footer-link" onClick={() => navigate('/support')}>Поддержка</button>
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
              <button className="voevoda-slider-arrow voevoda-slider-arrow--prev" onClick={() => letterIdx > 0 && setLetterIdx(letterIdx - 1)} disabled={letterIdx === 0} style={{ cursor: letterIdx === 0 ? 'not-allowed' : 'pointer', opacity: letterIdx === 0 ? .35 : 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div className="voevoda-slider-panel">{LETTERS.map((_, i) => <button key={i} className={`voevoda-slider-dot${i === letterIdx ? ' is-active' : ''}`} onClick={() => setLetterIdx(i)} aria-label={`Документ ${i + 1}`} />)}</div>
              <button className="voevoda-slider-arrow voevoda-slider-arrow--next" onClick={() => letterIdx < LETTERS.length - 1 && setLetterIdx(letterIdx + 1)} disabled={letterIdx === LETTERS.length - 1} style={{ cursor: letterIdx === LETTERS.length - 1 ? 'not-allowed' : 'pointer', opacity: letterIdx === LETTERS.length - 1 ? .35 : 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
