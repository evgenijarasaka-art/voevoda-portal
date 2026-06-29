import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../useMediaQuery';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useCartStore } from '../store/useCartStore';
import { useNotifStore } from '../store/useNotifStore';
import { PeopleSection, IVDisplay } from '../components/PeopleSection';
import { COURSE_CARD_MOTION_CSS } from '../components/courseCardMotion';
import { TEST_USERS, userProfilePath } from '../api/testApi';
import { PortalBreadcrumb } from '../components/PortalBreadcrumb';
import { MILITARY_COURSES, toDedicated } from '../data/courses';

const ANIMATIONS_CSS = `
  @keyframes fadeSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn     { from{opacity:0;transform:scale(0.98)} to{opacity:1;transform:scale(1)} }
  @keyframes dropdownIn  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tylModalIn  { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
  @keyframes descIn      { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
  @keyframes vCardIn     { from{opacity:0;transform:translateY(22px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes vElita      { 0%,100%{box-shadow:0 2px 8px rgba(245,136,58,.28)} 50%{box-shadow:0 4px 18px rgba(245,136,58,.55)} }
  @keyframes vBadgeIn    { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
  @keyframes vBioIn      { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cartBounce  { 0%{transform:scale(1)} 20%{transform:scale(.65)} 55%{transform:scale(1.22)} 75%{transform:scale(.9)} 90%{transform:scale(1.06)} 100%{transform:scale(1)} }
  @keyframes checkPop    { from{opacity:0;transform:scale(.4) rotate(-25deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
  @keyframes lockWiggle  { 0%{transform:rotate(0) scale(1)} 10%{transform:rotate(-20deg) scale(1.35)} 26%{transform:rotate(20deg) scale(1.4)} 42%{transform:rotate(-13deg) scale(1.28)} 58%{transform:rotate(13deg) scale(1.25)} 74%{transform:rotate(-6deg) scale(1.1)} 88%{transform:rotate(6deg) scale(1.05)} 100%{transform:rotate(0) scale(1)} }
  @keyframes lockGlow    { 0%{box-shadow:0 0 0 0 rgba(255,255,255,.55)} 55%{box-shadow:0 0 0 14px rgba(255,255,255,0)} 100%{box-shadow:0 0 0 0 rgba(255,255,255,0)} }
  @keyframes veilFade    { from{opacity:0} to{opacity:1} }
  .anim-section { opacity:0; transform:translateY(22px); transition:opacity .5s cubic-bezier(.4,0,.2,1), transform .5s cubic-bezier(.4,0,.2,1); }
  .anim-section.visible  { opacity:1; transform:translateY(0); }
  .course-card-shell { position:relative; z-index:1; }
  .course-card-surface {
    transition:border-color .3s ease, box-shadow .5s cubic-bezier(.22,1,.36,1) !important;
  }
  .c-img { overflow:hidden; }
  .c-img img { transition:transform .65s cubic-bezier(.4,0,.2,1); transform-origin:center; }
  .course-card-shell:hover .c-img img { transform:scale(1.08); }
  .c-card-overlay { position:absolute;inset:0;pointer-events:none;background:linear-gradient(to top,rgba(17,24,39,.55) 0%,transparent 55%);opacity:0;transition:opacity .5s ease; }
  .course-card-shell:hover .c-card-overlay { opacity:1; }
  .c-series-wrap { overflow:hidden; max-width:0; transition:max-width .52s cubic-bezier(.4,0,.2,1); border-radius:0 8px 8px 0; }
  .course-card-shell:hover .c-series-wrap { max-width:180px; }
  .c-series-text { white-space:nowrap; display:flex; align-items:center; opacity:0; transform:translateX(-10px); transition:opacity .38s .12s ease, transform .52s .08s cubic-bezier(.22,1,.36,1); }
  .course-card-shell:hover .c-series-text { opacity:1; transform:translateX(0); }
  .course-card-shell:hover .c-lock-icon { animation:lockWiggle .7s .3s cubic-bezier(.36,.07,.19,.97) both, lockGlow .7s .3s ease both; }
  .c-enroll-btn { transition:transform .18s ease, box-shadow .18s ease !important; }
  .c-enroll-btn:hover { transform:translateY(-2px) !important; box-shadow:0 8px 20px rgba(55,93,251,.35) !important; }
  .p-card { transition:box-shadow .4s ease, transform .45s cubic-bezier(.22,1,.36,1), border-color .25s ease; }
  .p-card-photo { transition:transform .7s cubic-bezier(.4,0,.2,1); }
  .offer-card { transition:box-shadow .25s ease; }
  .offer-card img { transition:transform .6s cubic-bezier(.22,1,.36,1); }
  .offer-card:hover { box-shadow:0 12px 36px rgba(0,0,0,.12); }
  .offer-card:hover img { transform:scale(1.045); }
  .city-img { transition:transform .4s cubic-bezier(.4,0,.2,1); }
  .city-card:hover .city-img { transform:scale(1.06); }
  .city-card { transition:opacity .2s; } .city-card:hover { opacity:.92; }
  .btn-primary { transition:background .15s,transform .12s; } .btn-primary:hover { transform:translateY(-1px); }
  .btn-outline { transition:background .15s,border-color .15s,color .15s,transform .12s; } .btn-outline:hover { transform:translateY(-1px); }
  .comp-row { transition:background .15s; } .comp-row:hover { background:#FAFBFF; }
  .fighter-row { transition:background .15s; } .fighter-row:hover { background:#F9FAFB; }
  .review-card { transition:box-shadow .2s ease; } .review-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.06); }
  .series-course-rail{scrollbar-width:none;scroll-snap-type:x mandatory;overscroll-behavior-inline:contain}
  .series-course-rail::-webkit-scrollbar{display:none}
  .series-course-rail>*{scroll-snap-align:start}
  .c-mil-shell--series:hover .c-expand-wrap{box-shadow:0 22px 42px rgba(17,24,39,.18)}
  .series-nav{transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
  .series-nav:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 20px rgba(55,93,251,.22);background:#375DFB!important;color:#fff!important}
  .review-card{position:relative;overflow:hidden;transition:transform .24s cubic-bezier(.2,.8,.2,1),box-shadow .24s ease,border-color .24s ease!important}
  .review-card:hover{box-shadow:0 16px 38px rgba(25,48,105,.11)!important;border-color:#C9D7FF!important}
  .letter-thumb { transition:transform .25s cubic-bezier(.4,0,.2,1),box-shadow .25s ease; cursor:pointer; }
  .letter-thumb:hover { transform:scale(1.03); box-shadow:0 10px 32px rgba(0,0,0,.16); }
  .courses-page-static .anim-section:hover,
  .courses-page-static .offer-card:hover,
  .courses-page-static .city-card:hover,
  .courses-page-static .review-card:hover,
  .courses-page-static .letter-thumb:hover,
  .courses-page-static .p-card:hover,
  .courses-page-static .comp-row:hover,
  .courses-page-static .fighter-row:hover { transform:none!important; }
  .tab-btn { transition:background .15s,border-color .15s,color .15s; }
  .apply-btn { transition:background .15s,border-color .15s,transform .12s; }
  .apply-btn:hover { background:#375DFB!important; color:#fff!important; border-color:#375DFB!important; transform:translateY(-1px); }
  .all-btn { transition:background .15s,box-shadow .15s; } .all-btn:hover { background:#F3F4F6!important; }
  .cal-btn-row { transition:background .15s; } .cal-btn-row:hover { background:#F9FAFB !important; }
  .tyl-thumb-nav { transition:border-color .15s,opacity .15s; cursor:pointer; } .tyl-thumb-nav:hover { opacity:.85; }
  .pcard-extra-btn { transition:all .3s ease; }
  .pcard-extra-btn:hover { background:linear-gradient(135deg,#375DFB,#7B9FFF) !important; color:#fff !important; border-color:transparent !important; }
  .p-btn-primary { transition:transform .22s ease,box-shadow .22s ease; }
  .p-btn-primary:hover { transform:translateY(-2px) !important; box-shadow:0 8px 26px rgba(55,93,251,.46) !important; }
  .p-btn-secondary { transition:all .22s ease; }
  .p-btn-secondary:hover { border-color:#C7D2FE !important; color:#375DFB !important; background:#EEF3FF !important; }
  @media (prefers-reduced-motion:reduce) {
    .course-card-shell, .c-img img, .c-series-wrap, .c-series-text, .c-card-overlay { transition:none !important; }
  }
  ${COURSE_CARD_MOTION_CSS}
`;

function injectCss(css: string) {
  if (document.getElementById('courses-page-css')) return;
  const s = document.createElement('style'); s.id = 'courses-page-css'; s.textContent = css;
  document.head.appendChild(s);
}
function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

type CourseData = {
  id: number; title: string; city: string; duration: string; price: number; oldPrice: number | null;
  img: string; desc: string; seriesNum?: number; seriesId?: number; seriesName?: string;
  locked?: boolean; prerequisite?: string;
};
type PeriodMode = 'current' | '3months' | '6months' | 'year' | 'all' | 'calendar';
type FilterState = { cities: string[]; venues: string[]; costs: string[]; types: string[]; };

const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

const SERIES_COLORS: Record<number, { num: string; pillBg: string; pillText: string }> = {
  1: { num: '#375DFB', pillBg: '#EBF1FF', pillText: '#375DFB' },
  2: { num: '#F97316', pillBg: '#FFF0E5', pillText: '#EA6B10' },
  3: { num: '#10B981', pillBg: '#ECFDF5', pillText: '#059669' },
};

const FILTER_CITIES = ['Москва','Санкт-Петербург','Уфа','Воронеж','Ростов-на-Дону','Краснодар','Казань','Саратов','Новгород','Екатеринбург','Нижний Новгород'];
const FILTER_VENUES = ['Оффлайн','Онлайн','Комбинированный'];
const FILTER_COSTS  = ['Платные','Бесплатные'];
const FILTER_TYPES  = ['Серия курсов','Курс','Тренинг','Интенсив','Марафон'];

// Курсы берём из единого источника — список совпадает с главной страницей
const COURSES: CourseData[] = MILITARY_COURSES.map(toDedicated);

const OFFERS = [
  { id:1, bg:'#EDE9FF', img:'/specpred1.png', title:'Подарки за полную оплату', desc:'Произведи полную оплату за курс «Общевойскового Снайпера» и получи в подарок курс «Тактическая Медицина»' },
  { id:2, bg:'#FFF0E5', img:'/specpred2.png', title:'Пригласи друга и получи бонус', desc:'Успей приобрести Курс Молодого бойца и получи скидку в 50%. Предложение действует до 20 марта включительно' },
  { id:3, bg:'#FFF0F0', img:'/skid.png',      title:'-50% на КМБ до 20 марта', desc:'Успей приобрести Курс Молодого бойца и получи скидку в 50%. Предложение действует до 20 марта включительно' },
];

const OFFER_ICON_CONFIG: Record<number, { top: number; left?: number; right?: number }> = {
  1: { top: 94, left: 36 },
  2: { top: 20, right: 20 },
  3: { top: 20, right: 20 },
};

const OFFER_ICONS: Record<number, React.ReactNode> = {
  1: (
    <svg width="72" height="72" viewBox="0 0 73 82" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M28.8765 21.0682L28.8633 21.0073C27.6374 15.5604 22.241 12.1186 16.7792 13.3133L15.5384 13.5848C14.0309 13.9145 13.0761 15.404 13.4059 16.9116C14.3352 21.1602 18.5328 23.851 22.7815 22.9216L28.985 21.5646L28.8765 21.0682ZM15.2593 6.36498C20.7202 5.17042 26.1427 6.70244 30.107 10.0509C32.3111 5.35306 36.5988 1.69692 42.0598 0.502349L43.3005 0.230934C48.6456 -0.938278 53.9264 2.4469 55.0956 7.79195C55.713 10.6139 55.4911 13.4241 54.5969 15.9622L55.135 15.8445C56.6788 15.5067 57.9761 15.2229 59.0507 15.0682C60.166 14.9077 61.27 14.8477 62.3885 15.0947C63.6553 15.3744 64.8578 15.9468 65.8339 16.8209C66.7563 17.6468 67.2517 18.6455 67.5887 19.6352C67.8937 20.5312 68.1346 21.6328 68.3951 22.824L68.4497 23.074C68.7104 24.2652 68.9515 25.3668 69.0484 26.3083C69.1554 27.3483 69.1222 28.4627 68.629 29.5982C68.1069 30.8 67.2532 31.8222 66.2189 32.6053C65.3056 33.2967 64.2775 33.7032 63.1969 34.0229C62.1559 34.331 60.8586 34.6148 59.3147 34.9525L13.9634 44.8729C12.4195 45.2107 11.1223 45.4945 10.0477 45.6492C8.93234 45.8097 7.82836 45.8697 6.70984 45.6227C5.44304 45.343 4.24051 44.7706 3.2644 43.8965C2.34207 43.0706 1.84663 42.0719 1.50966 41.0822C1.2046 40.1863 0.963728 39.0846 0.703286 37.8933L0.648615 37.6434C0.38792 36.4523 0.146816 35.3506 0.0499299 34.4091C-0.0570928 33.3691 -0.0238636 32.2548 0.469396 31.1192C0.991412 29.9174 1.84513 28.8952 2.87945 28.1121C3.79269 27.4207 4.82089 27.0143 5.9014 26.6945C6.94242 26.3864 8.23969 26.1027 9.78351 25.765L10.3218 25.6472C8.44966 23.7143 7.0748 21.2535 6.4575 18.4315C5.28829 13.0865 8.67347 7.80561 14.0185 6.6364L15.2593 6.36498ZM35.8251 19.5483L35.9337 20.0445L42.1373 18.6875C46.3859 17.7581 49.0767 13.5605 48.1473 9.31188C47.8175 7.8043 46.328 6.84951 44.8205 7.17929L43.5797 7.4507C38.1179 8.64545 34.6514 14.0261 35.8117 19.4873L35.8251 19.5483ZM42.4516 43.1864C41.7965 43.3297 41.469 43.4013 41.31 43.6494C41.151 43.8974 41.2227 44.2249 41.366 44.88L48.4293 77.1699C48.4527 77.2769 48.5583 77.3446 48.6653 77.3212C54.233 76.1033 58.6764 75.1314 62.0588 73.9006C65.553 72.629 68.2934 70.9538 70.1258 68.0952C71.9583 65.2365 72.3364 62.0471 72.0329 58.341C71.7391 54.7536 70.7671 50.3103 69.5491 44.7426L68.2462 38.7865C68.0595 37.933 67.9662 37.5063 67.6745 37.3519C67.3828 37.1976 66.9421 37.3748 66.0608 37.7291C65.496 37.9562 64.9542 38.1334 64.4572 38.2805C63.26 38.6348 61.8291 38.9477 60.3815 39.2643L42.4516 43.1864ZM8.99251 50.2126C8.04377 50.2586 7.5694 50.2816 7.36876 50.5436C7.16812 50.8057 7.26147 51.2324 7.44817 52.0859L8.75105 58.042C9.9689 63.6097 10.9408 68.0531 12.1717 71.4355C13.4432 74.9298 15.1184 77.6701 17.9771 79.5026C20.8357 81.3351 24.0252 81.7131 27.7312 81.4096C31.3186 81.1159 35.7619 80.1438 41.3296 78.9258C41.4366 78.9025 41.5043 78.7968 41.4809 78.6898L34.4176 46.4C34.2743 45.7449 34.2027 45.4173 33.9546 45.2583C33.7066 45.0993 33.379 45.171 32.7239 45.3143L14.7941 49.2364C13.3464 49.5531 11.9155 49.8662 10.6798 50.0441C10.1668 50.118 9.60054 50.1832 8.99251 50.2126Z" fill="url(#o1g)"/>
      <defs><linearGradient id="o1g" x1="9.28613" y1="10.024" x2="85.2861" y2="106.024" gradientUnits="userSpaceOnUse"><stop stopColor="#6E3FF3"/><stop offset="1" stopColor="#40258D"/></linearGradient></defs>
    </svg>
  ),
  2: (
    <svg width="80" height="80" viewBox="0 0 58 71" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M29.2616 0.457948C30.713 1.49184 32.3153 2.78974 33.6053 3.86374C36.1817 6.00877 39.6285 9.08384 43.0986 12.7999C49.9199 20.1045 57.3245 30.4011 57.5909 41.2474C57.9814 57.1487 45.4075 70.3559 29.5062 70.7464C13.6049 71.1369 0.397774 58.5629 0.00725011 42.6617C-0.259128 31.8153 6.63112 21.1676 13.0856 13.5369C13.6382 12.8837 14.4895 12.5632 15.3357 12.6898C16.1818 12.8164 16.9021 13.3721 17.2393 14.1584C18.1099 16.1889 18.6694 17.2282 19.3461 17.9831C19.6794 18.3549 20.0829 18.7024 20.66 19.0648C23.4907 13.3349 24.4464 9.28399 25.3817 2.14782C25.4943 1.28862 26.0491 0.551366 26.8436 0.205348C27.6381 -0.140678 28.5558 -0.0448032 29.2616 0.457948ZM16.9819 57.7426C15.6653 56.4891 15.6141 54.4057 16.8676 53.0891L36.1257 32.8613C37.3791 31.5447 39.4626 31.4935 40.7791 32.747C42.0957 34.0004 42.1469 36.0839 40.8934 37.4004L21.6353 57.6283C20.3819 58.9449 18.2984 58.996 16.9819 57.7426ZM18.6853 32.3254C16.868 32.37 15.431 33.8794 15.4756 35.6967C15.5202 37.514 17.0296 38.951 18.8469 38.9064L18.8823 38.9055C20.6996 38.8609 22.1366 37.3515 22.092 35.5342C22.0474 33.7169 20.538 32.2799 18.7207 32.3245L18.6853 32.3254ZM38.8777 51.5844C37.0604 51.629 35.6234 53.1384 35.668 54.9557C35.7127 56.773 37.2221 58.21 39.0393 58.1653L39.0747 58.1645C40.892 58.1198 42.3291 56.6105 42.2844 54.7932C42.2398 52.9759 40.7304 51.5389 38.9131 51.5835L38.8777 51.5844Z" fill="url(#o2g)"/>
      <defs><linearGradient id="o2g" x1="37.0488" y1="216.172" x2="27.7687" y2="0.000711352" gradientUnits="userSpaceOnUse"><stop stopColor="#8C4719"/><stop offset="1" stopColor="#F27B2C"/></linearGradient></defs>
    </svg>
  ),
  3: (
    <svg width="86" height="88" viewBox="0 0 86 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M75.3741 50.3501C75.172 49.6752 75.2903 48.9591 75.6986 48.3852L79.4835 43.0653C81.5908 40.1032 80.9773 36.0564 78.0867 33.8521L72.8952 29.893C72.3351 29.466 72.01 28.817 72.0029 28.1128L71.938 21.5842C71.9019 17.9492 69.0263 15.0356 65.3927 14.9514L58.8657 14.8001C58.1612 14.7836 57.517 14.4498 57.0974 13.8842L53.2076 8.6408C51.0417 5.72114 47.0033 5.05392 44.0136 7.12213L38.644 10.8365C38.0646 11.2372 37.3474 11.3457 36.6751 11.1351L30.4461 9.17938C26.9774 8.09004 23.3187 9.92462 22.1155 13.3549L19.9546 19.5156C19.7214 20.1802 19.2049 20.6901 18.5373 20.9145L12.3484 22.9937C8.90254 24.1512 7.02013 27.786 8.06293 31.2684L9.93582 37.5228C10.1379 38.1976 10.0196 38.9137 9.61127 39.4876L5.8264 44.8074C3.71908 47.7695 4.33264 51.8163 7.22318 54.0206L12.4147 57.9797C12.9748 58.4067 13.2999 59.0557 13.3071 59.7599L13.3719 66.2885C13.4048 69.5976 15.7898 72.3085 18.9591 72.8317C19.2712 72.8832 19.5916 72.9136 19.9174 72.9212L26.4444 73.0725C27.1484 73.0885 27.7929 73.4228 28.2127 73.9884L32.1025 79.2318C33.1856 80.6918 34.7363 81.5883 36.3905 81.8614C38.0442 82.1344 39.8018 81.7844 41.2963 80.7504L46.6659 77.0365C47.2452 76.6359 47.9625 76.5277 48.6347 76.7379L54.8637 78.6936C58.3329 79.7829 61.9912 77.9484 63.1944 74.5181L65.3554 68.3574C65.5886 67.6928 66.1052 67.183 66.7727 66.9586L72.9616 64.8793C76.4075 63.7218 78.2899 60.087 77.2471 56.6046L75.3741 50.3501ZM37.1572 22.8049C41.5796 23.5354 44.5833 27.7277 43.8528 32.15C43.1223 36.5724 38.93 39.5761 34.5076 38.8456C30.0852 38.1151 27.0816 33.9228 27.8121 29.5004C28.5426 25.078 32.7348 22.0744 37.1572 22.8049ZM27.1257 57.7896C26.6281 58.1462 26.033 58.2673 25.4733 58.1749C24.9136 58.0824 24.3889 57.7764 24.0325 57.2787C23.3194 56.2834 23.5482 54.8984 24.5435 54.1853L58.1841 30.0828C59.1792 29.3696 60.5644 29.5984 61.2775 30.5937C61.9906 31.589 61.7618 32.974 60.7665 33.6871L27.1257 57.7896ZM48.1524 65.0678C43.73 64.3373 40.7263 60.145 41.4568 55.7226C42.1873 51.3002 46.3796 48.2966 50.802 49.0271C55.2244 49.7576 58.228 53.9499 57.4975 58.3722C56.767 62.7946 52.5748 65.7983 48.1524 65.0678Z" fill="url(#o3g)"/>
      <defs><linearGradient id="o3g" x1="48.9195" y1="6.01101" x2="7.96362" y2="186.246" gradientUnits="userSpaceOnUse"><stop stopColor="#DF1C41"/><stop offset="1" stopColor="#790F23"/></linearGradient></defs>
    </svg>
  ),
};

const CITIES = [
  { id:1, name:'Москва', count:14, img:'/gorod1.png' }, { id:2, name:'Санкт-Петербург', count:12, img:'/gorod2.png' },
  { id:3, name:'Ростов-на-Дону', count:7, img:'/gorod3.png' }, { id:4, name:'Краснодар', count:4, img:'/gorod4.png' },
  { id:5, name:'Казань', count:4, img:'/gorod5.png' }, { id:6, name:'Самара', count:3, img:'/gorod6.png' },
];
const COMPETITIONS = [
  { id:1, title:'Тактическое ориентирование', date:'12 мая, 2024', bg:'#10B981' }, { id:2, title:'Марш-бросок на 10 км', date:'14 мая, 2024', bg:'#F59E0B' },
  { id:3, title:'Линия обороны', date:'16 мая, 2024', bg:'#7C3AED' }, { id:4, title:'Стрельба из АК-74', date:'16 мая, 2024', bg:'#F97316' },
  { id:5, title:'Военный триатлон', date:'16 мая, 2024', bg:'#06B6D4' },
];
const PAST_COMPETITIONS = [
  { id:2, title:'Зимний марш-бросок 10 км', date:'18 февраля, 2024', bg:'#64748B' },
  { id:4, title:'Кубок по стрельбе из АК', date:'4 февраля, 2024', bg:'#0EA5E9' },
  { id:3, title:'Турнир по тактике малых групп', date:'21 января, 2024', bg:'#7C3AED' },
  { id:1, title:'Осенний забег патриотов', date:'12 ноября, 2023', bg:'#10B981' },
];
const COMP_ICONS: Record<number, React.ReactNode> = {
  1:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>,
  2:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>,
  3:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  4:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  5:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12c2-4 4-6 6-6s4 4 6 4 4-6 6-6"/><path d="M2 18c2-4 4-6 6-6s4 4 6 4 4-6 6-6"/></svg>,
};
const FIGHTERS = TEST_USERS.map(user => ({
  id: user.id,
  name: user.callsign,
  rank: user.rank,
  city: user.city,
  img: user.avatar,
  index: user.index,
  rating: user.rating,
}));
const REVIEWS = [
  { id:1, name:'Коба', rank:'Капитан', rating:5, img:'/teacher2-main.jpg', title:'Полевые занятия — сильнейшая часть курса', text:'Инструкторы не дают спрятаться за теорией: каждый приём закрепляется на практике. После курса спокойнее оцениваю обстановку и увереннее работаю в группе.', date:'18 июня 2026' },
  { id:2, name:'Бек', rank:'Майор', rating:5, img:'/teacher1-main.jpg', title:'Системная подготовка без лишней воды', text:'Материал собран последовательно — от базы до сложных сценариев. Особенно ценны разборы после упражнений и честная обратная связь от преподавателей.', date:'11 июня 2026' },
  { id:3, name:'Стрелок', rank:'Старший лейтенант', rating:4.9, img:'/sold1.png', title:'Стало понятно, над чем работать дальше', text:'Получил не только новые навыки, но и понятный план самостоятельной подготовки. Хорошая нагрузка, сильная команда и отличная организация занятий.', date:'2 июня 2026' },
  { id:4, name:'Нексус', rank:'Лейтенант', rating:5, img:'/teacher2-main.jpg', title:'Курс, который собирает команду', text:'Здесь быстро учишься слышать напарника и отвечать за общий результат. На занятия хочется возвращаться — редкое сочетание дисциплины и живой атмосферы.', date:'27 мая 2026' },
];
const LETTERS = ['/blag1.png','/blag2.png','/blag1.png','/blag2.png','/blag1.png','/blag2.png'];

function courseEnding(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return 'курс';
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'курса';
  return 'курсов';
}

function AnimSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useReveal();
  return <div ref={ref} className="anim-section" style={style}>{children}</div>;
}
function SectionWrap({ children }: { children: React.ReactNode }) {
  return <div style={{ background:'#fff', borderRadius:20, border:'1px solid #E5E7EB', padding:'24px 28px', marginBottom:24 }}>{children}</div>;
}
function SecTitle({ icon, title, action, separator=false }: { icon:React.ReactNode; title:string; action?:React.ReactNode; separator?:boolean }) {
  return (
    <div style={{ marginBottom: separator ? 0 : 24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:separator?18:0, borderBottom:separator?'1px solid #F0F0F0':'none', marginBottom:separator?24:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>{icon}<h2 style={{ fontSize:20, fontWeight:700, color:'#111', margin:0 }}>{title}</h2></div>
        {action}
      </div>
    </div>
  );
}

function CalendarPicker({ viewDate, selectedDay, onNavigate, onSelect, onConfirm }: { viewDate: Date; selectedDay: number | null; onNavigate: (dir: -1|1) => void; onSelect: (d: number) => void; onConfirm: () => void; }) {
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawFirst = new Date(year, month, 1).getDay();
  const firstMon = rawFirst === 0 ? 6 : rawFirst - 1;
  const prevMonthDays = new Date(year, month, 0).getDate();
  type Cell = { day: number; cur: boolean };
  const cells: Cell[] = [];
  for (let i = firstMon - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, cur: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, cur: true });
  let extra = 1; while (cells.length % 7 !== 0) cells.push({ day: extra++, cur: false });
  const hlDays = month === 9 && year === 2024 ? [11,12,13,14,15,16,17,18,19,20,21] : [];
  return (
    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #E5E7EB', padding:16, width:304, boxShadow:'0 10px 36px rgba(0,0,0,.14)', animation:'dropdownIn .15s cubic-bezier(.4,0,.2,1)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <button onClick={() => onNavigate(-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', display:'flex', padding:'4px 6px', borderRadius:6 }} onMouseEnter={e=>e.currentTarget.style.color='#374151'} onMouseLeave={e=>e.currentTarget.style.color='#9CA3AF'}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <span style={{ fontSize:14, fontWeight:600, color:'#111' }}>{MONTH_NAMES[month]}, {year}</span>
        <button onClick={() => onNavigate(1)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', display:'flex', padding:'4px 6px', borderRadius:6 }} onMouseEnter={e=>e.currentTarget.style.color='#374151'} onMouseLeave={e=>e.currentTarget.style.color='#9CA3AF'}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:6 }}>
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d} style={{ textAlign:'center', fontSize:11, color:'#9CA3AF', fontWeight:500, padding:'3px 0' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {cells.map((cell, i) => {
          if (!cell.cur) return <div key={i} style={{ height:34 }} />;
          const isSel = cell.day === selectedDay, isHL = hlDays.includes(cell.day);
          return (
            <button key={i} onClick={() => onSelect(cell.day)} style={{ height:34, width:'100%', border:'none', cursor:'pointer', fontSize:13, fontWeight:isSel||isHL?600:400, background:isSel?'#375DFB':isHL?'#EBF1FF':'none', color:isSel?'#fff':isHL?'#375DFB':'#374151', borderRadius:'50%', transition:'background .15s' }}
              onMouseEnter={e=>{ if(!isSel) e.currentTarget.style.background=isHL?'#DFE8FF':'#F3F4F6'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=isSel?'#375DFB':isHL?'#EBF1FF':'none'; }}>
              {cell.day}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop:14, borderTop:'1px solid #F0F0F0', paddingTop:12, display:'flex', justifyContent:'center' }}>
        <button onClick={onConfirm} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:600, color:'#375DFB' }}>Готово</button>
      </div>
    </div>
  );
}

const PERIOD_OPTIONS: { id: PeriodMode; label: string }[] = [
  { id:'current', label:'В текущем месяце' }, { id:'3months', label:'Ближайшие 3 месяца' },
  { id:'6months', label:'6 месяцев' }, { id:'year', label:'2024 год' }, { id:'all', label:'За все время' },
];
function PeriodSelector({ periodMode, calViewDate, selectedDay, onChangePeriod, onNavigateCal, onSelectDay }: { periodMode: PeriodMode; calViewDate: Date; selectedDay: number | null; onChangePeriod: (p: PeriodMode) => void; onNavigateCal: (dir: -1|1) => void; onSelectDay: (d: number) => void; }) {
  const [open, setOpen] = useState(false), [showCal, setShowCal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setShowCal(false); } };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const navMonth = (dir: -1|1) => { onNavigateCal(dir); onChangePeriod('current'); setOpen(false); setShowCal(false); };
  const label = periodMode === 'current' ? MONTH_NAMES[calViewDate.getMonth()] : periodMode === '3months' ? '3 месяца' : periodMode === '6months' ? '6 месяцев' : periodMode === 'year' ? `${calViewDate.getFullYear()} год` : periodMode === 'all' ? 'Всё время' : selectedDay ? `${MONTH_NAMES[calViewDate.getMonth()].slice(0,3)} ${selectedDay}` : 'Дата';
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <div style={{ display:'flex', alignItems:'center', border:'1px solid #E5E7EB', borderRadius:8, background:'#fff', overflow:'hidden' }}>
        <button onClick={() => navMonth(-1)} style={{ padding:'8px 10px', border:'none', background:'none', cursor:'pointer', color:'#6B7280', display:'flex', alignItems:'center' }} onMouseEnter={e=>e.currentTarget.style.color='#375DFB'} onMouseLeave={e=>e.currentTarget.style.color='#6B7280'}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button onClick={() => { if(showCal) setShowCal(false); else setOpen(!open); }} style={{ display:'flex', alignItems:'center', gap:5, padding:'0 4px', border:'none', background:'none', cursor:'pointer', minWidth:80, justifyContent:'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span style={{ fontSize:13, fontWeight:500, color:'#111', whiteSpace:'nowrap' as const }}>{label}</span>
        </button>
        <button onClick={() => navMonth(1)} style={{ padding:'8px 10px', border:'none', background:'none', cursor:'pointer', color:'#6B7280', display:'flex', alignItems:'center' }} onMouseEnter={e=>e.currentTarget.style.color='#375DFB'} onMouseLeave={e=>e.currentTarget.style.color='#6B7280'}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
      {open && !showCal && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, background:'#fff', border:'1px solid #E5E7EB', borderRadius:12, padding:'6px 0', zIndex:200, minWidth:220, boxShadow:'0 8px 28px rgba(0,0,0,.11)' }}>
          {PERIOD_OPTIONS.map(opt => (
            <button key={opt.id} className="cal-btn-row" onClick={() => { onChangePeriod(opt.id); setOpen(false); }} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'10px 16px', border:'none', background:'none', cursor:'pointer', fontSize:14, color:'#374151', textAlign:'left' as const }}>
              {opt.label}
              {periodMode === opt.id && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          ))}
          <div style={{ borderTop:'1px solid #F0F0F0', marginTop:4, paddingTop:4 }}>
            <button className="cal-btn-row" onClick={() => { setShowCal(true); setOpen(false); }} style={{ display:'block', width:'100%', padding:'10px 16px', border:'none', background:'none', cursor:'pointer', fontSize:14, color:'#375DFB', fontWeight:500, textAlign:'left' as const }}>Календарь</button>
          </div>
        </div>
      )}
      {showCal && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:200 }}>
          <CalendarPicker viewDate={calViewDate} selectedDay={selectedDay} onNavigate={onNavigateCal} onSelect={d => { onSelectDay(d); onChangePeriod('calendar'); }} onConfirm={() => setShowCal(false)} />
        </div>
      )}
    </div>
  );
}

function FiltersModal({ filters, onApply, onClose }: { filters: FilterState; onApply: (f: FilterState) => void; onClose: () => void }) {
  const [local, setLocal] = useState<FilterState>({ cities:[...filters.cities], venues:[...filters.venues], costs:[...filters.costs], types:[...filters.types] });
  const toggle = (key: keyof FilterState, value: string) => setLocal(prev => ({ ...prev, [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value] }));
  const CheckItem = ({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) => (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' as const }}>
      <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${checked?'#375DFB':'#D1D5DB'}`, background:checked?'#375DFB':'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
        {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <span style={{ fontSize:14, color:'#374151' }}>{label}</span>
    </div>
  );
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10001, animation:'fadeIn .2s ease', backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:20, width:500, maxHeight:'88vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,.2)', animation:'scaleIn .22s cubic-bezier(.4,0,.2,1)', display:'flex', flexDirection:'column' as const }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid #F0F0F0', position:'sticky' as const, top:0, background:'#fff', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg><span style={{ fontSize:18, fontWeight:700, color:'#111' }}>Фильтры военной подготовки</span></div>
          <button onClick={onClose} style={{ background:'#F3F4F6', border:'none', width:34, height:34, borderRadius:8, cursor:'pointer', fontSize:20, color:'#6B7280', display:'flex', alignItems:'center', justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='#E5E7EB'} onMouseLeave={e=>e.currentTarget.style.background='#F3F4F6'}>×</button>
        </div>
        <div style={{ padding:'22px 24px', flex:1 }}>
          <div style={{ marginBottom:22 }}><div style={{ fontSize:15, fontWeight:600, color:'#111', marginBottom:14 }}>По городам</div><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px 20px' }}>{FILTER_CITIES.map(c => <CheckItem key={c} checked={local.cities.includes(c)} label={c} onClick={() => toggle('cities',c)} />)}</div></div>
          <div style={{ height:1, background:'#F0F0F0', marginBottom:22 }} />
          <div style={{ marginBottom:22 }}><div style={{ fontSize:15, fontWeight:600, color:'#111', marginBottom:14 }}>Место проведения</div><div style={{ display:'flex', gap:24, flexWrap:'wrap' as const }}>{FILTER_VENUES.map(v => <CheckItem key={v} checked={local.venues.includes(v)} label={v} onClick={() => toggle('venues',v)} />)}</div></div>
          <div style={{ height:1, background:'#F0F0F0', marginBottom:22 }} />
          <div style={{ marginBottom:22 }}><div style={{ fontSize:15, fontWeight:600, color:'#111', marginBottom:14 }}>Стоимость</div><div style={{ display:'flex', gap:24 }}>{FILTER_COSTS.map(v => <CheckItem key={v} checked={local.costs.includes(v)} label={v} onClick={() => toggle('costs',v)} />)}</div></div>
          <div style={{ height:1, background:'#F0F0F0', marginBottom:22 }} />
          <div><div style={{ fontSize:15, fontWeight:600, color:'#111', marginBottom:14 }}>Тип</div><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px 20px' }}>{FILTER_TYPES.map(v => <CheckItem key={v} checked={local.types.includes(v)} label={v} onClick={() => toggle('types',v)} />)}</div></div>
        </div>
        <div style={{ padding:'16px 24px', borderTop:'1px solid #F0F0F0', display:'flex', gap:12, position:'sticky' as const, bottom:0, background:'#fff' }}>
          <button onClick={() => setLocal({ cities:[], venues:[], costs:[], types:[] })} style={{ padding:'12px 28px', border:'1px solid #E5E7EB', borderRadius:8, background:'#fff', fontSize:15, fontWeight:500, color:'#374151', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>Сбросить</button>
          <button onClick={() => { onApply(local); onClose(); }} style={{ flex:1, padding:'12px 0', border:'none', borderRadius:8, background:'#375DFB', fontSize:15, fontWeight:600, color:'#fff', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#2D4FE0'} onMouseLeave={e=>e.currentTarget.style.background='#375DFB'}>Показать результат</button>
        </div>
      </div>
    </div>
  );
}

// ─── CourseCard ───────────────────────────────────────────────────────────────
function CourseCard({ c, delay, expandInFlow = false }: { c: CourseData; delay: number; expandInFlow?: boolean }) {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const { toggle, has } = useFavoritesStore();
  const { addCourse, has: inCart } = useCartStore();
  const addNotification = useNotifStore(s => s.add);
  const [justAdded, setJustAdded] = useState(false);
  const alreadyInCart = inCart(c.id, 'course');
  const faved = has(c.id + 2000, 'course');
  const sc = c.seriesId ? SERIES_COLORS[c.seriesId] : null;
  const goToDetail = () => { if (!c.locked) navigate(`/courses/${encodeURIComponent(c.title)}`); };

  const goCheckout = (e: React.MouseEvent) => {
    e.stopPropagation();
    const veil = document.createElement('div');
    veil.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:9999;opacity:0;pointer-events:all;transition:opacity .24s ease';
    document.body.appendChild(veil);
    requestAnimationFrame(() => requestAnimationFrame(() => { veil.style.opacity = '1'; }));
    setTimeout(() => {
      navigate('/checkout', { state: { directItem: { id:c.id, kind:'course', title:c.title, city:c.city, duration:c.duration, price:c.price, oldPrice:c.oldPrice ?? undefined, format:'Оффлайн', image:c.img, stream:'', isFav:false, isSelected:true } } });
      veil.style.opacity = '0';
      setTimeout(() => veil.remove(), 280);
    }, 260);
  };

  const blueBtnBase: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), #375DFB',
    boxShadow: '0 0 0 1px #375DFB, 0 1px 2px 0 rgba(37,62,167,0.48)',
    border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer',
  };

  const BadgePill = () => c.seriesNum ? (
    <div style={{ position:'absolute', top:10, left:10, display:'flex', alignItems:'stretch', zIndex:5, boxShadow:'0 2px 10px rgba(0,0,0,.22)', borderRadius:8 }}>
      <div style={{ background:sc?.num||'#374151', color:'#fff', fontSize:12, fontWeight:700, padding:'5px 9px', lineHeight:1.4, display:'flex', alignItems:'center', letterSpacing:.3, borderRadius: c.seriesName ? '8px 0 0 8px' : 8 }}>
        {String(c.seriesNum).padStart(2,'0')}
      </div>
      {c.seriesName && (
        <div className="c-mil-text-wrap">
          <div className="c-mil-series-text" style={{ background:'rgba(255,255,255,.92)', color:'#374151', fontSize:11, fontWeight:600, padding:'5px 9px', lineHeight:1.4, borderRadius:'0 8px 8px 0' }}>
            {c.seriesName}
          </div>
        </div>
      )}
    </div>
  ) : null;

  const CardImg = () => (
    <div className="c-card-img" style={{ height:190, overflow:'hidden', background:'#F3F4F6', borderRadius:'16px 16px 0 0', position:'relative' }}>
      {!imgErr
        ? <img src={c.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} onError={() => setImgErr(true)} />
        : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#EBF1FF,#DFE8FF)' }} />}
      <div className="c-card-overlay" />
      <BadgePill />
      {c.oldPrice && !c.locked && !c.seriesNum && (
        <div style={{ position:'absolute', top:10, left:10, background:'#EF4444', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 9px', borderRadius:8 }}>СКИДКА</div>
      )}
      {c.locked && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.32)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:4, borderRadius:'16px 16px 0 0' }}>
          <div className="c-lock-icon" style={{ width:56, height:56, borderRadius:'50%', background:'rgba(255,255,255,.18)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(255,255,255,.45)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
        </div>
      )}
    </div>
  );

  const HeartSvg = () => (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none">
      <path d="M14.6722 1.24558C11.3458 -0.538477 8.9574 2.09142 8.9574 2.09142C8.9574 2.09142 6.56886 -0.538485 3.24245 1.24557C-0.786482 3.4064 -1.07579 11.8683 8.9574 15.625C18.9906 11.8683 18.7012 3.40641 14.6722 1.24558Z"
        fill={faved ? '#EF4444' : 'white'} stroke={faved ? '#EF4444' : '#525866'} strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  );

  const PriceRow = () => (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ fontSize:18, fontWeight:800, color:c.locked?'#9CA3AF':'#10B981' }}>{c.price.toLocaleString('ru')} <span style={{ fontSize:13 }}>₽</span></span>
      {c.oldPrice && <span style={{ fontSize:13, color:'#9CA3AF', textDecoration:'line-through' }}>{(c.oldPrice as number).toLocaleString('ru')} ₽</span>}
      {!c.locked && (
        <button onClick={e => {
          e.stopPropagation();
          toggle({ id:c.id+2000, kind:'course', title:c.title, city:c.city, duration:c.duration, price:c.price, format:'Оффлайн', image:c.img });
          if (!faved) addNotification({ kind:'like', title:'Курс добавлен в избранное', body:c.title, link:'/favorites' });
        }}
          style={{ marginLeft:'auto', background:'none', border:'none', outline:'none', padding:0, lineHeight:1, cursor:'pointer', display:'flex', alignItems:'center', flexShrink:0, transition:'transform .15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
          <HeartSvg />
        </button>
      )}
    </div>
  );

  return (
    <div className={`c-mil-shell${expandInFlow ? ' c-mil-shell--series' : ''}`} style={{ cursor: c.locked ? 'default' : 'pointer' }} onClick={goToDetail}>
      <div className="c-card-wrap" data-locked={c.locked ? '' : undefined}
           style={{ animation:`vCardIn 0.5s ${delay}ms ease backwards` }}>
        <CardImg />
        <div style={{ padding:'14px 16px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#9CA3AF', marginBottom:7 }}><span>{c.city}</span><span>{c.duration}</span></div>
          <div style={{ fontSize:15, fontWeight:700, color:c.locked?'#6B7280':'#111', lineHeight:1.35, marginBottom:8 }}>{c.title}</div>
          <PriceRow />
        </div>
      </div>
      <div className="c-expand-wrap">
        <div className="c-expand-inner">
          <div style={{ padding:'0 16px 16px' }}>
              <p className="c-oi c-oi-1" style={{ fontSize:13, color:'#6B7280', lineHeight:1.55, margin:'0 0 8px',
                display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden',
              } as React.CSSProperties}>{c.desc}</p>

              {c.locked && c.prerequisite && sc && (
                <div className="c-oi c-oi-2" style={{ marginBottom:10, background:sc.pillBg, border:`1px solid ${sc.pillText}33`, borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'flex-start', gap:8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={sc.pillText} strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div style={{ fontSize:12, color:'#374151', lineHeight:1.5, minWidth:0 }}>Будет открыт после прохождения{' '}<span onClick={e => e.stopPropagation()} style={{ color:sc.pillText, fontWeight:600, cursor:'pointer', textDecoration:'underline' }}>{c.prerequisite}</span></div>
                </div>
              )}

              {!c.locked && (
                <div className="c-oi c-oi-2" style={{ display:'flex', gap:8 }}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (!alreadyInCart) {
                        addCourse({ id:c.id, kind:'course', title:c.title, city:c.city, duration:c.duration, price:c.price, format:'Оффлайн', image:c.img, stream:'' });
                        setJustAdded(true);
                        setTimeout(() => setJustAdded(false), 800);
                      }
                    }}
                    title={alreadyInCart ? 'В корзине' : 'В корзину'}
                    className="c-enroll-btn"
                    style={{ ...blueBtnBase, width:46, height:46, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                      background: alreadyInCart ? 'linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,0) 100%),#059669' : blueBtnBase.background as string,
                      boxShadow: alreadyInCart ? '0 0 0 1px #059669,0 1px 2px 0 rgba(4,120,87,.48)' : blueBtnBase.boxShadow as string,
                      transition:'background .3s ease, box-shadow .3s ease, transform .18s ease',
                      animation: justAdded ? 'cartBounce .52s cubic-bezier(.36,.07,.19,.97)' : 'none',
                    }}
                  >
                    {alreadyInCart
                      ? <svg style={{ animation:'checkPop .35s cubic-bezier(.34,1.56,.64,1)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    }
                  </button>
                  <button onClick={goCheckout} className="c-enroll-btn" style={{ ...blueBtnBase, flex:1, height:46, fontSize:14, fontWeight:600 }}>
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

function SeriesCourseRail({ name, color, courses, index }: { name: string | null; color: string; courses: CourseData[]; index: number }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: courses.length <= 3 });
  const updateEdges = () => {
    const el = railRef.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  const move = (direction: -1 | 1) => {
    const el = railRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(courses.length - 3, activeCard + direction));
    setActiveCard(next);
    (el.children[next] as HTMLElement | undefined)?.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'start' });
  };
  useEffect(() => { updateEdges(); window.addEventListener('resize', updateEdges); return () => window.removeEventListener('resize', updateEdges); }, [courses.length]);
  return (
    <section style={{ marginBottom:32 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, padding:'13px 16px 13px 18px', background:'#fff', borderRadius:16, border:'1px solid #DCE3F4', boxShadow:'0 7px 24px rgba(28,54,112,.06)' }}>
        <div style={{ width:11, height:30, borderRadius:99, background:color, flexShrink:0 }} />
        <div>
          <div style={{ fontSize:11, fontWeight:850, color:'#8290AD', textTransform:'uppercase', letterSpacing:'.09em' }}>Серия курсов {String(index + 1).padStart(2,'0')}</div>
          <div style={{ fontSize:16, fontWeight:800, color:'#18223A', marginTop:2 }}>{name || 'Военная подготовка'}</div>
        </div>
        <span style={{ marginLeft:'auto', fontSize:12, color:'#8A96AE', whiteSpace:'nowrap' }}>{courses.length} {courseEnding(courses.length)}</span>
        {courses.length > 3 && (
          <div style={{ display:'flex', gap:8, marginLeft:4 }}>
            <button aria-label="Предыдущие курсы" className="series-nav" disabled={edge.start} onClick={() => move(-1)} style={{ width:38,height:38,borderRadius:11,border:'1px solid #C9D7FF',background:'#F5F8FF',color:'#375DFB',cursor:edge.start?'default':'pointer',opacity:edge.start ? .38 : 1,display:'grid',placeItems:'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg></button>
            <button aria-label="Следующие курсы" className="series-nav" disabled={edge.end} onClick={() => move(1)} style={{ width:38,height:38,borderRadius:11,border:'1px solid #C9D7FF',background:'#F5F8FF',color:'#375DFB',cursor:edge.end?'default':'pointer',opacity:edge.end ? .38 : 1,display:'grid',placeItems:'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
        )}
      </div>
      <div ref={railRef} className="series-course-rail" onScroll={updateEdges} style={{ display:'grid',gridAutoFlow:'column',gridAutoColumns:'calc((100% - 40px)/3)',alignItems:'start',gap:20,overflowX:'auto',overflowY:'hidden',scrollBehavior:'smooth',padding:'2px 2px 18px' }}>
        {courses.map((course, courseIndex) => <CourseCard key={course.id} c={course} delay={courseIndex * 60} expandInFlow />)}
      </div>
    </section>
  );
}

/* ─── PAGE ─── */
export function CoursesPage() {
  const navigate = useNavigate();
  const addNotification = useNotifStore(s => s.add);
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [viewMode, setViewMode] = useState<'all'|'series'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ cities:[], venues:[], costs:[], types:[] });
  const [compTab, setCompTab] = useState<'will'|'past'>('will');
  const [citySort, setCitySort] = useState<'desc'|'asc'>('desc');
  const [imgErrs, setImgErrs] = useState<Record<string,boolean>>({});
  const [letterIdx, setLetterIdx] = useState<number|null>(null);
  const setE = (k: string) => setImgErrs(p => ({ ...p, [k]:true }));
  useEffect(() => { injectCss(ANIMATIONS_CSS); }, []);

  useEffect(() => {
    if (letterIdx === null) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLetterIdx(null);
      if (e.key === 'ArrowLeft' && letterIdx > 0) setLetterIdx(letterIdx - 1);
      if (e.key === 'ArrowRight' && letterIdx < LETTERS.length - 1) setLetterIdx(letterIdx + 1);
    };
    window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn);
  }, [letterIdx]);

  const courseMatchesFilters = (c: CourseData) => {
    if (filters.cities.length && !filters.cities.includes(c.city)) return false;
    if (filters.types.length) {
      const type = c.seriesNum ? 'Серия курсов' : 'Курс';
      if (!filters.types.includes(type)) return false;
    }
    // Все курсы платные — «Бесплатные» в одиночку даёт пустой результат
    if (filters.costs.length === 1 && filters.costs[0] === 'Бесплатные') return false;
    return true;
  };
  const displayedCourses = COURSES.filter(courseMatchesFilters);

  const seriesGroups = viewMode === 'series'
    ? Object.values(displayedCourses.filter(c => c.seriesId != null).reduce((acc, c) => {
        const key = `s${c.seriesId}`;
        if (!acc[key]) acc[key] = { name: c.seriesName || null, color: c.seriesId ? (SERIES_COLORS[c.seriesId]?.num || '#374151') : '#374151', courses: [] as CourseData[] };
        if (!acc[key].name && c.seriesName) acc[key].name = c.seriesName;
        acc[key].courses.push(c); return acc;
      }, {} as Record<string, { name: string|null; color: string; courses: CourseData[] }>))
    : null;

  const sortedCities = [...CITIES].sort((a, b) => citySort === 'desc' ? b.count - a.count : a.count - b.count);
  const competitions = compTab === 'will' ? COMPETITIONS : PAST_COMPETITIONS;
  const rankedFighters = [...FIGHTERS].sort((a, b) => b.index - a.index);
  const RANK_COLORS = ['#F59E0B', '#94A3B8', '#B45309'];

  const activeFilters = filters.cities.length + filters.venues.length + filters.costs.length + filters.types.length;

  return (
    <div className="courses-page-static" style={{ paddingTop:60, marginLeft:56, minHeight:'100vh', background:'#F8F9FB' }}>
      <div className="route-controls-toolbar" style={{ background:'#fff', borderBottom:'1px solid #E5E7EB', padding:'14px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' as const, gap:10, position:'sticky' as const, top:60, zIndex:40 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#111', margin:0 }}>Военная подготовка</h1>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' as const }}>
          <div style={{ display:'flex', border:'1px solid #E5E7EB', borderRadius:6, overflow:'hidden' }}>
            {(['all','series'] as const).map((v,i) => (
              <button key={v} className="tab-btn" onClick={() => setViewMode(v)} style={{ padding:'8px 18px', border:'none', fontSize:13, fontWeight:viewMode===v?600:400, background:viewMode===v?'#F3F4F6':'#fff', color:viewMode===v?'#111':'#6B7280', cursor:'pointer', borderRight:i===0?'1px solid #E5E7EB':'none' }}>
                {v==='all'?'Все курсы':'Серии курсов'}
              </button>
            ))}
          </div>
          <button className="btn-outline" onClick={() => setShowFilters(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', border:'1px solid #E5E7EB', borderRadius:8, background:'#fff', fontSize:13, fontWeight:500, color:'#374151', cursor:'pointer', position:'relative' as const }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Фильтры
            {activeFilters > 0 && <span style={{ background:'#375DFB', color:'#fff', fontSize:11, fontWeight:700, borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', marginLeft:2 }}>{activeFilters}</span>}
          </button>
        </div>
      </div>

      <div style={{ padding:'20px 28px 48px' }}>
        <PortalBreadcrumb items={[{ label:'Главная', to:'/' }, { label:'Военная подготовка' }]} />

        {viewMode === 'all' ? (
          displayedCourses.length ? (
            <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,minmax(0,1fr))',gap:20,marginBottom:24,overflow:'visible' }}>
              {displayedCourses.map((c,i)=><CourseCard key={c.id} c={c} delay={i*60}/>)}
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'56px 24px', color:'#9CA3AF', fontSize:15, marginBottom:24, background:'#fff', borderRadius:20, border:'1px solid #E5E7EB' }}>По выбранным фильтрам курсов не найдено</div>
          )
        ) : (
          <div style={{ marginBottom:24 }}>
            {seriesGroups?.map((group, gi) => <SeriesCourseRail key={gi} name={group.name} color={group.color} courses={group.courses} index={gi} />)}
          </div>
        )}

        <AnimSection style={{ marginBottom:24 }}>
          <SectionWrap>
            <SecTitle icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} title="Специальные предложения" separator />
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:20 }}>
              {OFFERS.map(o => {
                const iconPos = OFFER_ICON_CONFIG[o.id];
                return (
                  <div key={o.id} className="offer-card" onClick={() => navigate('/referral')} style={{ background:'#fff', borderRadius:20, border:'1px solid #E5E7EB', overflow:'hidden', cursor:'pointer' }}>
                    <div style={{ position:'relative', height:260, background:o.bg, overflow:'hidden' }}>
                      {!imgErrs[`of${o.id}`] ? (
                        <div style={{ position:'absolute', bottom:0, left: o.id===1 ? 'auto' : '50%', right: o.id===1 ? 0 : 'auto', transform: o.id===1 ? 'none' : 'translateX(-50%)', height:'95%', display:'flex', alignItems:'flex-end' }}>
                          <img src={o.img} alt="" style={{ height:'100%', objectFit:'contain', objectPosition:'bottom center', transform:o.id===3?'scaleX(-1)':'none' }} onError={() => setE(`of${o.id}`)} />
                        </div>
                      ) : null}
                      <div style={{ position:'absolute', zIndex:2, top:iconPos.top, ...(iconPos.left!==undefined?{left:iconPos.left}:{right:iconPos.right}) }}>
                        {OFFER_ICONS[o.id]}
                      </div>
                    </div>
                    <div style={{ padding:'18px 20px 22px' }}>
                      <div style={{ fontSize:16, fontWeight:700, color:'#111', marginBottom:8 }}>{o.title}</div>
                      <div style={{ fontSize:14, color:'#374151', lineHeight:1.6 }}>{o.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionWrap>
        </AnimSection>

        <AnimSection style={{ marginBottom:24 }}>
          <SectionWrap>
            <SecTitle icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>} title="Города" separator
              action={<button className="btn-outline" onClick={() => setCitySort(s => s === 'desc' ? 'asc' : 'desc')} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', border:'1px solid #E5E7EB', borderRadius:8, background:'#fff', fontSize:13, color:'#374151', cursor:'pointer' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/></svg>По количеству курсов<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: citySort === 'asc' ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}><polyline points="6 9 12 15 18 9"/></svg></button>}
            />
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(3,1fr)', gap:20 }}>
              {sortedCities.map((city,i) => (
                <div key={city.id} className="city-card" onClick={() => navigate(`/city/${encodeURIComponent(city.name.toLowerCase())}`)} style={{ cursor:'pointer', animation:`fadeSlideUp 0.4s cubic-bezier(.4,0,.2,1) ${i*60}ms both` }}>
                  <div style={{ borderRadius:14, overflow:'hidden', height:220, background:'#F3F4F6', marginBottom:12 }}>
                    {!imgErrs[`city${city.id}`] ? <img src={city.img} alt={city.name} className="city-img" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={() => setE(`city${city.id}`)} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'#375DFB' }}>{city.name[0]}</div>}
                  </div>
                  <div style={{ fontSize:17, fontWeight:700, color:'#111', marginBottom:3 }}>{city.name}</div>
                  <div style={{ fontSize:14, color:'#6B7280' }}>{city.count} {courseEnding(city.count)}</div>
                </div>
              ))}
            </div>
          </SectionWrap>
        </AnimSection>

        <AnimSection style={{ marginBottom:24 }}>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.15fr 0.85fr', gap:20 }}>
            <div style={{ background:'#fff', borderRadius:20, border:'1px solid #E5E7EB', overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid #F0F0F0', flexWrap:'wrap' as const, gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg><span style={{ fontSize:18, fontWeight:700, color:'#111' }}>Соревнования</span></div>
                <div style={{ display:'flex', gap:8 }}>
                  {(['will','past'] as const).map(t => <button key={t} className="tab-btn" onClick={() => setCompTab(t)} style={{ padding:'7px 16px', border:'1px solid', borderColor:compTab===t?'#375DFB':'#E5E7EB', borderRadius:6, background:compTab===t?'#EBF1FF':'#fff', color:compTab===t?'#375DFB':'#374151', fontSize:13, fontWeight:compTab===t?600:400, cursor:'pointer' }}>{t==='will'?'Будут':'Прошли'}</button>)}
                  <button className="btn-outline" onClick={() => setShowFilters(true)} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', border:'1px solid #E5E7EB', borderRadius:8, background:'#fff', fontSize:13, color:'#374151', cursor:'pointer' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>Фильтры</button>
                </div>
              </div>
              {competitions.map((c,i) => (
                <div key={`${compTab}-${c.id}`} className="comp-row" style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 24px', borderBottom:i<competitions.length-1?'1px solid #F5F5F7':'none' }}>
                  <div style={{ width:54, height:54, borderRadius:14, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{COMP_ICONS[c.id]}</div>
                  <div style={{ flex:1 }}><div style={{ fontSize:15, fontWeight:600, color:'#111', marginBottom:3 }}>{c.title}</div><div style={{ fontSize:13, color:'#9CA3AF' }}>{c.date}</div></div>
                  {compTab === 'will'
                    ? <button className="apply-btn" onClick={() => { addNotification({ kind:'system', title:'Заявка на соревнование принята', body:c.title, link:`/competitions?competition=${c.id}` }); navigate(`/competitions?competition=${c.id}`); }} style={{ padding:'8px 16px', border:'1px solid #C7D2FE', borderRadius:8, background:'#EBF1FF', color:'#375DFB', fontSize:13, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap' as const }}>Подать заявку</button>
                    : <button className="apply-btn" onClick={() => navigate(`/competitions?competition=${c.id}`)} style={{ padding:'8px 16px', border:'1px solid #E5E7EB', borderRadius:8, background:'#F9FAFB', color:'#374151', fontSize:13, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap' as const }}>Итоги</button>}
                </div>
              ))}
            </div>
            <div style={{ background:'#fff', borderRadius:20, border:'1px solid #E5E7EB', overflow:'hidden' }}>
              <div style={{ padding:'18px 24px', borderBottom:'1px solid #F0F0F0', display:'flex', alignItems:'center', gap:10 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg><span style={{ fontSize:18, fontWeight:700, color:'#111' }}>Общий рейтинг курсантов</span></div>
              {rankedFighters.map((f,i) => (
                <div key={f.id} className="fighter-row" style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 20px', borderBottom:i<rankedFighters.length-1?'1px solid #F5F5F7':'none', cursor:'pointer' }} onClick={() => navigate(userProfilePath(f.name))}>
                  <div style={{ width:24, flexShrink:0, textAlign:'center', fontSize:14, fontWeight:800, color: i<3 ? RANK_COLORS[i] : '#9CA3AF' }}>{i+1}</div>
                  <div style={{ width:46, height:46, borderRadius:'50%', overflow:'hidden', border:`2px solid ${i<3 ? RANK_COLORS[i] : '#E5E7EB'}`, flexShrink:0, background:'#F3F4F6' }}>{!imgErrs[`fi${f.id}`] ? <img src={f.img} alt={f.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={() => setE(`fi${f.id}`)} /> : null}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' as const, marginBottom:2 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:'#111' }}>{f.name} <span style={{ color:'#9CA3AF', fontWeight:400 }}>{f.rank}</span></span>
                      <IVDisplay index={f.index} rating={f.rating} />
                    </div>
                    <div style={{ fontSize:13, color:'#9CA3AF' }}>{f.city}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); navigate(userProfilePath(f.name)); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', padding:4, display:'flex' }} onMouseEnter={e=>e.currentTarget.style.color='#374151'} onMouseLeave={e=>e.currentTarget.style.color='#9CA3AF'}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>
                </div>
              ))}
            </div>
          </div>
        </AnimSection>

        <div style={{ marginBottom: 24 }}>
          <PeopleSection noOuterPadding />
        </div>

        <AnimSection style={{ marginBottom:24 }}>
          <SectionWrap>
            <SecTitle icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} title="Отзывы" separator />
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(2,minmax(0,1fr))', gap:16 }}>
              {REVIEWS.map(r => (
                <article key={r.id} className="review-card" style={{ minHeight:260, padding:'22px', border:'1px solid #E3E8F3', borderRadius:18, background:'linear-gradient(145deg,#FFFFFF 0%,#F8FAFF 100%)', display:'flex', flexDirection:'column' }}>
                  <svg aria-hidden="true" width="34" height="26" viewBox="0 0 40 30" fill="#DCE5FF" style={{ position:'absolute', right:18, top:16 }}><path d="M0 30V18C0 6 6 0 18 0v7c-6 0-9 3-9 9h9v14H0Zm22 0V18C22 6 28 0 40 0v7c-6 0-9 3-9 9h9v14H22Z"/></svg>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18, paddingRight:42 }}>
                    <div style={{ width:52, height:52, borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'#F3F4F6', border:'3px solid #fff', boxShadow:'0 0 0 1px #C9D7FF' }}>{!imgErrs[`rev${r.id}`] ? <img src={r.img} alt={r.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={() => setE(`rev${r.id}`)} /> : null}</div>
                    <div>
                      <div style={{ display:'flex', alignItems:'baseline', gap:7 }}><span style={{ fontSize:16, fontWeight:800, color:'#17213A' }}>{r.name}</span><span style={{ fontSize:12, color:'#8A96AE' }}>{r.rank}</span></div>
                      <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:5 }}><span style={{ display:'flex', gap:2 }}>{Array.from({length:5}).map((_,i)=><svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#F5A623"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}</span><span style={{ fontSize:11, color:'#9AA5BA' }}>{r.date}</span></div>
                    </div>
                  </div>
                  <h3 style={{ fontSize:16, lineHeight:1.35, fontWeight:800, color:'#17213A', margin:'0 0 10px' }}>{r.title}</h3>
                  <p style={{ fontSize:14, color:'#53617E', lineHeight:1.68, margin:0 }}>{r.text}</p>
                  <button onClick={() => navigate(userProfilePath(r.name))} style={{ alignSelf:'flex-start', marginTop:'auto', padding:'14px 0 0', border:0, background:'none', color:'#375DFB', fontSize:12, fontWeight:800, cursor:'pointer' }}>Профиль автора →</button>
                </article>
              ))}
            </div>
          </SectionWrap>
        </AnimSection>

        <AnimSection>
          <SectionWrap>
            <SecTitle icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>} title="Благодарственные письма" separator />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
              {LETTERS.map((src,i) => (
                <div key={i} className="letter-thumb" onClick={() => setLetterIdx(i)} style={{ borderRadius:12, overflow:'hidden' }}>
                  {!imgErrs[`lt${i}`] ? <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={() => setE(`lt${i}`)} /> : <div style={{ height:200, background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF' }}>Документ</div>}
                </div>
              ))}
            </div>
          </SectionWrap>
        </AnimSection>
      </div>

      {letterIdx !== null && (
        <div onClick={() => setLetterIdx(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.82)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000, padding:20, backdropFilter:'blur(5px)', animation:'fadeIn .2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', maxWidth:800, width:'100%', animation:'tylModalIn .22s ease' }}>
            <button onClick={() => setLetterIdx(null)} style={{ position:'absolute', top:-14, right:-14, zIndex:10, width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', color:'#fff', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,.25)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,.12)')}>×</button>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.6)', marginBottom:12, fontWeight:500 }}>{letterIdx + 1} / {LETTERS.length}</div>
            <div style={{ width:'100%', background:'#1a1a2e', borderRadius:14, overflow:'hidden', boxShadow:'0 28px 70px rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {!imgErrs[`ltm${letterIdx}`] ? <img key={letterIdx} src={LETTERS[letterIdx]} alt="" style={{ width:'100%', maxHeight:'65vh', objectFit:'contain', display:'block', animation:'tylModalIn .18s ease' }} onError={() => setE(`ltm${letterIdx}`)} /> : <div style={{ height:300, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.4)' }}>Документ</div>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:18 }}>
              <button className="voevoda-slider-arrow voevoda-slider-arrow--prev" onClick={() => letterIdx > 0 && setLetterIdx(letterIdx - 1)} disabled={letterIdx === 0} style={{ cursor:letterIdx===0?'not-allowed':'pointer', opacity:letterIdx===0?.35:1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div className="voevoda-slider-panel">{LETTERS.map((_, i) => <button key={i} className={`voevoda-slider-dot${i===letterIdx?' is-active':''}`} onClick={() => setLetterIdx(i)} aria-label={`Документ ${i+1}`} />)}</div>
              <button className="voevoda-slider-arrow voevoda-slider-arrow--next" onClick={() => letterIdx < LETTERS.length - 1 && setLetterIdx(letterIdx + 1)} disabled={letterIdx === LETTERS.length - 1} style={{ cursor:letterIdx===LETTERS.length-1?'not-allowed':'pointer', opacity:letterIdx===LETTERS.length-1?.35:1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilters && <FiltersModal filters={filters} onApply={setFilters} onClose={() => setShowFilters(false)} />}
    </div>
  );
}
