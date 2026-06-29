import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import './feature-pages.css';
import './shop-brandshop.css';

const IcStar = ({ filled = true }: { filled?: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#f5a623' : '#e5e7eb'} stroke={filled ? '#f5a623' : '#e5e7eb'} strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IcHeart = ({ filled }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IcCompare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const IcSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
  </svg>
);

const IcStore = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

type BenefitIconKind = 'verified' | 'delivery' | 'payment' | 'return';
const BenefitIcon = ({ kind }: { kind: BenefitIconKind }) => {
  const paths = {
    verified: <><path d="M12 3 4.8 6v5.4c0 4.8 2.8 8.7 7.2 11 4.4-2.3 7.2-6.2 7.2-11V6L12 3Z"/><path d="m8.7 12.2 2.1 2.1 4.6-5"/></>,
    delivery: <><path d="M3 6h11v10H3z"/><path d="M14 9h3l4 4v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    payment: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></>,
    return: <><path d="M4 10a8 8 0 1 1 1.9 8.2"/><path d="M4 4v6h6"/></>,
  } satisfies Record<BenefitIconKind, React.ReactNode>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
};

const StarRating = ({ rating }: { rating: number }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:1 }}>
    {[1,2,3,4,5].map(i => <IcStar key={i} filled={i <= Math.round(rating)} />)}
  </span>
);

export type Product = {
  id: number; title: string; brand: string; category: string;
  price: number; oldPrice?: number; rating: number; reviews: number;
  stock: number; image: string; badge?: string; desc: string; specs: [string, string][];
};

const CATEGORIES = ['Все', 'Форма', 'Снаряжение', 'Медицина', 'Учебное', 'Сувениры'];

export const PRODUCTS: Product[] = [
  { id: 101, title: 'Комплект полевой формы «Воевода»', brand: 'Воевода', category: 'Форма', price: 12900, oldPrice: 14900, rating: 4.9, reviews: 64, stock: 18, image: '/военмаркет2.png', badge: 'Хит', desc: 'Прочная полевая форма для занятий на полигоне. Ткань держит форму, карманы усилены, посадка рассчитана на активное движение.', specs: [['Материал', 'рип-стоп'], ['Сезон', 'демисезон'], ['Размеры', '46-56'], ['Производство', 'Россия']] },
  { id: 102, title: 'Тактический пояс с платформой MOLLE', brand: 'Арсенал', category: 'Снаряжение', price: 5700, rating: 4.7, reviews: 38, stock: 9, image: '/военмаркет5.png', badge: 'Новинка', desc: 'Пояс под подсумки и аптечку. Удобен для коротких тренировочных задач и соревнований.', specs: [['Вес', '780 г'], ['Размер', 'регулируемый'], ['Цвет', 'олива'], ['Крепление', 'MOLLE']] },
  { id: 103, title: 'Аптечка инструктора: тренировочный набор', brand: 'МедТактик', category: 'Медицина', price: 8400, oldPrice: 9200, rating: 4.8, reviews: 51, stock: 5, image: '/военмаркет3.png', badge: 'Скидка', desc: 'Комплект для отработки базовых действий первой помощи: макеты турникета, бинты, карточки алгоритмов и подсумок.', specs: [['Состав', '8 предметов'], ['Назначение', 'обучение'], ['Подсумок', 'в комплекте'], ['Гарантия', '12 месяцев']] },
  { id: 104, title: 'Учебный макет автомата для занятий', brand: 'Полигон', category: 'Учебное', price: 18900, rating: 4.6, reviews: 27, stock: 3, image: '/военмаркет7.png', desc: 'Безопасный массогабаритный макет для отработки стойки, переносов и базовой манипуляции на занятиях.', specs: [['Тип', 'учебный макет'], ['Материал', 'полимер'], ['Вес', '3.1 кг'], ['Допуск', 'для тренировок']] },
  { id: 105, title: 'Рюкзак рейдовый 35 л', brand: 'Сплав', category: 'Снаряжение', price: 9900, rating: 4.9, reviews: 84, stock: 24, image: '/военмаркет1.png', badge: 'Хит', desc: 'Рейдовый рюкзак с жесткой спиной, боковыми стяжками и карманом под гидратор.', specs: [['Объем', '35 л'], ['Вес', '1.4 кг'], ['Спина', 'анатомическая'], ['Цвет', 'мультикам']] },
  { id: 106, title: 'Шеврон «Путь Воеводы»', brand: 'Воевода', category: 'Сувениры', price: 650, rating: 5, reviews: 112, stock: 70, image: '/shevron1.png', desc: 'Коллекционный шеврон для участников программы. Крепление на липучке.', specs: [['Размер', '80 мм'], ['Крепление', 'велкро'], ['Материал', 'ПВХ'], ['Серия', 'Путь Воеводы']] },
  { id: 107, title: 'Перчатки тактические тренировочные', brand: 'Грип', category: 'Форма', price: 3200, rating: 4.5, reviews: 29, stock: 11, image: '/военмаркет6.png', desc: 'Перчатки для полосы препятствий, работы со снаряжением и стрелковой стойки.', specs: [['Размеры', 'S-XL'], ['Ладонь', 'синтетическая кожа'], ['Защита', 'костяшки'], ['Сезон', 'лето/деми']] },
  { id: 108, title: 'Подарочный набор выпускника', brand: 'Воевода', category: 'Сувениры', price: 2500, rating: 4.9, reviews: 43, stock: 16, image: '/военмаркет4.png', badge: 'Подарок', desc: 'Подарочная коробка с шевроном, значком и сертификатом участника.', specs: [['Состав', '3 предмета'], ['Упаковка', 'коробка'], ['Повод', 'выпуск'], ['Наличие', 'на складе']] },
];

const SHOP_CSS = `
.vm-page{min-height:100vh;margin-left:56px;padding-top:60px;background:#f4f7fc;color:#15213d;font-family:"Exo 2",sans-serif}

/* ── Sticky header ── */
.vm-nav{background:rgba(255,255,255,.94);border-bottom:1px solid #dfe5f2;padding:12px 0;position:sticky;top:60px;z-index:90;backdrop-filter:blur(16px);box-shadow:0 8px 25px rgba(27,46,95,.06)}
.vm-nav-inner{max-width:1320px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:14px;min-height:44px}
.vm-brand{flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;border:0;background:none;color:#1a2744;font:400 20px "Russo One",sans-serif;line-height:1;white-space:nowrap;padding:0;cursor:default}
.vm-brand svg{color:#375dfb;display:block;flex:0 0 auto}
.vm-nav-search{position:relative;flex:1 1 auto;height:44px;display:flex;align-items:center}
.vm-nav-search svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:#9ca3af}
.vm-nav-search input{width:100%;height:44px;padding:0 14px 0 44px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font:14px "Exo 2",sans-serif;color:#1a1a2e;outline:none;transition:border-color .15s,box-shadow .15s}
.vm-nav-search input:focus{border-color:#375dfb;box-shadow:0 0 0 3px rgba(55,93,251,.12)}
.vm-sort{flex:0 0 auto;height:44px;padding:0 14px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font:500 13px "Exo 2",sans-serif;color:#374151;cursor:pointer;outline:none;min-width:180px;transition:border-color .15s}
.vm-sort:focus{border-color:#375dfb}

/* ── Content ── */
.vm-shell{max-width:1320px;margin:0 auto;padding:22px 24px 100px}

/* ── Category filters — Kaptorka style ── */
.vm-cats{display:grid;grid-template-columns:repeat(6,minmax(125px,1fr));gap:10px;margin-bottom:13px;overflow:visible;padding:6px 4px 16px}
.vm-cat{position:relative;flex:0 0 auto;min-height:68px;padding:12px 14px;border:1px solid #e1e6f0;border-radius:16px;background:#fff;color:#35405a;cursor:pointer;font:700 13px "Exo 2",sans-serif;text-align:left;will-change:transform;transition:transform .3s cubic-bezier(.2,.8,.2,1),border-color .25s,color .25s,background .25s,box-shadow .3s}
.vm-cat::after{content:'→';position:absolute;right:12px;bottom:10px;color:#b1bad0;font-size:15px;transition:transform .25s cubic-bezier(.2,.8,.2,1),color .25s}
.vm-cat:hover{border-color:#c7d2fe;color:#375dfb;background:#f0f4ff;transform:translateY(-4px);box-shadow:0 14px 30px rgba(37,63,135,.14)}
.vm-cat:hover::after{transform:translateX(4px);color:#375dfb}
.vm-cat.active{border-color:transparent;background:linear-gradient(135deg,#2449d4,#5f80ff);color:#fff;font-weight:800;box-shadow:0 9px 24px rgba(55,93,251,.25)}
.vm-cat.active::after{color:#fff}

/* ── Benefits ── */
.vm-benefits{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:28px}
.vm-benefit{display:flex;align-items:center;gap:12px;padding:15px 16px;border:1px solid #e1e7f2;border-radius:16px;background:#fff}
.vm-benefit-icon{width:39px;height:39px;border-radius:12px;display:grid;place-items:center;flex:0 0 auto;background:#eaf0ff;color:#3158ee}
.vm-benefit-icon svg{display:block;width:20px;height:20px}
.vm-benefit b{display:block;color:#18233d;font-size:12px}
.vm-benefit-copy span{display:block;margin-top:2px;color:#8993a8;font-size:11px}

/* ── Catalog head ── */
.vm-catalog-head{display:flex;justify-content:space-between;align-items:center;gap:18px;margin:8px 0 20px}
.vm-catalog-head h2{margin:0;color:#14213f;font:400 28px "Russo One",sans-serif}
.vm-catalog-head p{margin:5px 0 0;color:#8590a6;font-size:13px}
.vm-catalog-tools{display:flex;gap:9px;align-items:center}
.vm-select{height:42px;padding:0 34px 0 12px;border:1px solid #dfe5ef;border-radius:11px;background:#fff;color:#44506a;font:600 12px "Exo 2",sans-serif;cursor:pointer;outline:none}
.vm-reset{height:42px;padding:0 14px;border:1px solid #dfe5ef;border-radius:11px;background:#fff;color:#44506a;font:600 12px "Exo 2",sans-serif;cursor:pointer}
.vm-reset:hover{border-color:#b9c7ef;color:#3158ee}

/* ── Product grid ── */
.vm-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}

/* ── Product cards — Kaptorka-inspired ── */
.vm-card{position:relative;background:#fff;border-radius:18px;overflow:hidden;cursor:pointer;border:1px solid #e3e7ef;transition:box-shadow .28s,transform .28s,border-color .28s;display:flex;flex-direction:column}
.vm-card:hover{border-color:#cbd6f7;box-shadow:0 18px 42px rgba(26,39,68,.14);transform:translateY(-6px)}
.vm-card-img{position:relative;width:100%;aspect-ratio:4/3;background:#eef0f4;overflow:hidden;flex-shrink:0}
.vm-card-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s}
.vm-card:hover .vm-card-img img{transform:scale(1.05)}
.vm-card-fav{position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);border:none;cursor:pointer;display:grid;place-items:center;transition:background .15s,transform .15s;z-index:2}
.vm-card-fav:hover{background:rgba(0,0,0,.65);transform:scale(1.1)}
.vm-card-fav.active{background:rgba(239,68,68,.65)}
.vm-card-promo{position:absolute;top:10px;left:10px;padding:4px 10px;border-radius:6px;background:linear-gradient(135deg,#f5a623,#e8940e);color:#fff;font:700 11px "Exo 2",sans-serif;z-index:2;box-shadow:0 2px 8px rgba(245,166,35,.4);letter-spacing:.3px}
.vm-card-discount{position:absolute;bottom:10px;left:10px;padding:4px 10px;border-radius:6px;background:#ef4444;color:#fff;font:700 11px "Exo 2",sans-serif;z-index:2}
.vm-card-body{padding:14px 14px 0;flex:1;display:flex;flex-direction:column}
.vm-card-price{color:#1a2744;font:400 22px "Russo One",sans-serif;margin-bottom:5px;display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}
.vm-card-old{color:#9ca3af;font:400 13px "Exo 2",sans-serif;text-decoration:line-through}
.vm-card-title{color:#1a2744;font-size:14px;font-weight:500;line-height:1.4;margin-bottom:auto;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;padding-bottom:10px}
.vm-card-seller{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;border-top:1px solid #f0f1f3}
.vm-card-brand{color:#6b7280;font-size:12px;font-weight:600}
.vm-card-rating{display:flex;align-items:center;gap:4px;color:#6b7280;font-size:11px}
.vm-card-footer{display:flex;align-items:center;gap:8px;padding:0 14px 14px}
.vm-card-buy{flex:1;height:38px;border:0;border-radius:10px;background:linear-gradient(135deg,#2449d4,#5275ff);color:#fff;font:800 12px "Exo 2",sans-serif;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 12px rgba(55,93,251,.22)}
.vm-card-buy:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(55,93,251,.38)}
.vm-card-buy.in-cart{background:linear-gradient(135deg,#15803d,#22c55e);box-shadow:0 4px 12px rgba(34,197,94,.25)}
.vm-card-cmp{width:38px;height:38px;flex-shrink:0;border:1.5px solid #e5e7eb;border-radius:10px;display:grid;place-items:center;background:#fff;color:#6b7280;cursor:pointer;transition:all .15s}
.vm-card-cmp:hover{border-color:#c7d2fe;color:#375dfb;background:#f0f4ff}
.vm-card-cmp.active{border-color:#375dfb;background:#eef2ff;color:#375dfb}

.vm-empty{grid-column:1/-1;padding:70px 24px;border:1px dashed #cfd8ea;border-radius:22px;background:#fff;text-align:center}
.vm-empty-icon{width:62px;height:62px;margin:0 auto 14px;border-radius:18px;display:grid;place-items:center;background:#eaf0ff;color:#3158ee}
.vm-empty h3{margin:0 0 6px;color:#17213a;font-size:19px}
.vm-empty p{margin:0 0 17px;color:#8993a8;font-size:13px}

/* ── Comparison sticky bar ── */
.vm-cmp-bar{position:fixed;bottom:0;left:56px;right:0;z-index:200;background:#1a2744;color:#fff;box-shadow:0 -6px 28px rgba(0,0,0,.28);animation:vmCmpIn .28s cubic-bezier(.2,.8,.2,1)}
@keyframes vmCmpIn{from{transform:translateY(100%)}to{transform:translateY(0)}}
.vm-cmp-inner{max-width:1320px;margin:0 auto;padding:12px 24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.vm-cmp-label{font-size:13px;font-weight:700;white-space:nowrap;color:rgba(255,255,255,.75);flex-shrink:0}
.vm-cmp-items{display:flex;gap:8px;flex:1;min-width:0}
.vm-cmp-item{position:relative;width:52px;height:52px;border-radius:10px;overflow:hidden;border:2px solid rgba(255,255,255,.25);flex-shrink:0}
.vm-cmp-item img{width:100%;height:100%;object-fit:cover}
.vm-cmp-item-rm{position:absolute;top:-5px;right:-5px;width:18px;height:18px;border-radius:50%;background:#ef4444;border:0;color:#fff;font-size:10px;font-weight:900;display:grid;place-items:center;cursor:pointer;line-height:1}
.vm-cmp-slot{width:52px;height:52px;border-radius:10px;border:2px dashed rgba(255,255,255,.25);display:grid;place-items:center;color:rgba(255,255,255,.35);font-size:22px;flex-shrink:0}
.vm-cmp-go{height:42px;padding:0 22px;border:2px solid #fff;border-radius:12px;background:#fff;color:#1a2744;font:800 13px "Exo 2",sans-serif;cursor:pointer;flex-shrink:0;white-space:nowrap;transition:background .15s,transform .15s}
.vm-cmp-go:hover{background:#eef2ff;transform:translateY(-1px)}
.vm-cmp-go:disabled{opacity:.45;cursor:not-allowed;transform:none}
.vm-cmp-cls{height:42px;padding:0 16px;border:1px solid rgba(255,255,255,.22);border-radius:12px;background:transparent;color:rgba(255,255,255,.65);font:600 12px "Exo 2",sans-serif;cursor:pointer;flex-shrink:0}
.vm-cmp-cls:hover{border-color:rgba(255,255,255,.5);color:#fff}

/* ── Comparison modal ── */
.vm-cmp-bg{position:fixed;inset:0;z-index:10000;overflow-y:auto;padding:40px 20px 40px;background:rgba(10,18,34,.6);backdrop-filter:blur(6px)}
.vm-cmp-modal{width:min(1100px,100%);margin:0 auto;background:#fff;border-radius:22px;box-shadow:0 40px 100px rgba(0,0,0,.3);overflow:hidden}
.vm-cmp-head{display:flex;align-items:center;justify-content:space-between;padding:20px 28px;border-bottom:1px solid #eef0f3}
.vm-cmp-head h2{margin:0;font:400 22px "Russo One",sans-serif;color:#1a2744}
.vm-cmp-close{width:40px;height:40px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;color:#6b7280;font-size:24px;cursor:pointer;display:grid;place-items:center;transition:background .15s}
.vm-cmp-close:hover{background:#f3f4f6}
.vm-cmp-cols{display:grid}
.vm-cmp-col{border-right:1px solid #eef0f3;display:flex;flex-direction:column}
.vm-cmp-col:last-child{border-right:0}
.vm-cmp-col-img{height:220px;background:#f4f6fa;overflow:hidden;flex-shrink:0}
.vm-cmp-col-img img{width:100%;height:100%;object-fit:cover}
.vm-cmp-col-body{padding:18px 20px 0}
.vm-cmp-col-price{font:400 24px "Russo One",sans-serif;color:#1a2744;margin-bottom:6px;display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}
.vm-cmp-col-old{color:#9ca3af;font:400 13px "Exo 2",sans-serif;text-decoration:line-through}
.vm-cmp-col-title{font-size:14px;font-weight:600;color:#1a2744;line-height:1.4;margin-bottom:10px}
.vm-cmp-col-rating{display:flex;align-items:center;gap:5px;color:#6b7280;font-size:12px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #f3f4f6}
.vm-cmp-spec{padding:10px 20px;border-top:1px solid #f3f4f6}
.vm-cmp-spec-label{color:#9ca3af;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:3px}
.vm-cmp-spec-val{color:#1a2744;font-size:13px;font-weight:600}
.vm-cmp-col-buy{margin:16px 20px 20px;height:44px;border:0;border-radius:12px;background:linear-gradient(135deg,#2449d4,#5275ff);color:#fff;font:800 13px "Exo 2",sans-serif;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 14px rgba(55,93,251,.28)}
.vm-cmp-col-buy:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(55,93,251,.4)}

/* ── Bottom hero bar ── */
.vm-hero{position:relative;overflow:hidden;background:linear-gradient(116deg,#102b86 0%,#274fcf 58%,#6e8eff 100%);color:#fff}
.vm-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 78% 20%,rgba(255,255,255,.22),transparent 29%),linear-gradient(120deg,transparent 45%,rgba(255,255,255,.08))}
.vm-hero::after{content:'';position:absolute;right:-70px;bottom:-230px;width:520px;height:520px;border:1px solid rgba(255,255,255,.18);border-radius:50%;box-shadow:0 0 0 55px rgba(255,255,255,.04),0 0 0 110px rgba(255,255,255,.025)}
.vm-hero-inner{position:relative;z-index:1;max-width:1320px;margin:0 auto;padding:44px 52px;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(290px,.7fr);gap:40px;align-items:center}
.vm-kicker{display:inline-flex;align-items:center;gap:8px;margin-bottom:13px;color:#cdd9ff;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
.vm-kicker::before{content:'';width:26px;height:2px;background:#fff}
.vm-hero h1{max-width:690px;margin:0;font:400 clamp(30px,3.5vw,52px)/1.06 "Russo One",sans-serif;letter-spacing:-.025em}
.vm-hero-copy{max-width:630px;margin:15px 0 22px;color:rgba(255,255,255,.76);font-size:15px;line-height:1.6}
.vm-hero-actions{display:flex;gap:10px;flex-wrap:wrap}
.vm-primary,.vm-ghost{min-height:47px;padding:0 21px;border-radius:13px;font:800 13px "Exo 2",sans-serif;cursor:pointer;transition:transform .22s,box-shadow .22s,background .22s}
.vm-primary{border:2px solid #fff;background:#fff;color:#244bd3;box-shadow:0 12px 28px rgba(10,27,82,.22)}
.vm-ghost{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.1);color:#fff;backdrop-filter:blur(9px)}
.vm-primary:hover,.vm-ghost:hover{transform:translateY(-3px)}
.vm-ghost:hover{background:rgba(255,255,255,.18)}
.vm-hero-stats{display:flex;gap:25px;margin-top:22px}
.vm-hero-stat b{display:block;font:400 18px "Russo One",sans-serif}
.vm-hero-stat span{color:rgba(255,255,255,.65);font-size:11px}
.vm-hero-visual{position:relative;height:280px;display:grid;place-items:center}
.vm-product-orbit{position:absolute;inset:0;display:grid;place-items:center}
.vm-product-main{position:relative;width:230px;height:230px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);display:grid;place-items:center;box-shadow:inset 0 0 45px rgba(255,255,255,.08)}
.vm-product-main img{width:185px;height:185px;object-fit:cover;border-radius:24px;transform:rotate(3deg);box-shadow:0 25px 50px rgba(6,19,65,.36);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.vm-hero:hover .vm-product-main img{transform:rotate(0) translateY(-7px) scale(1.04)}

@media(max-width:1100px){.vm-grid{grid-template-columns:repeat(3,1fr)}.vm-benefits{grid-template-columns:repeat(2,1fr)}.vm-cats{grid-template-columns:repeat(3,1fr)}.vm-hero-inner{grid-template-columns:1fr}.vm-hero-visual{display:none}}
@media(max-width:780px){.vm-page{margin-left:0}.vm-nav{position:relative;top:auto}.vm-nav-inner{flex-wrap:wrap;padding:10px 14px}.vm-nav-search{order:3;flex-basis:100%}.vm-shell{padding:14px 14px 80px}.vm-hero-inner{padding:30px 22px}.vm-benefits{grid-template-columns:1fr}.vm-catalog-head{flex-direction:column;align-items:flex-start}.vm-catalog-tools{width:100%}.vm-select{flex:1}.vm-grid{grid-template-columns:repeat(2,1fr)}.vm-cats{grid-template-columns:repeat(2,1fr)}.vm-cmp-bar{left:0}}
@media(max-width:540px){.vm-brand span{display:none}.vm-grid{grid-template-columns:1fr}}

`;

export function Shop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addProduct = useCartStore(s => s.addProduct);
  const cartItems = useCartStore(s => s.items);
  const toggleFavorite = useFavoritesStore(s => s.toggle);
  const hasFavorite = useFavoritesStore(s => s.has);
  const requestedCategory = searchParams.get('category');
  const requestedQuery = searchParams.get('q') ?? '';
  const requestedProduct = searchParams.get('product');
  const [category, setCategory] = useState(() => requestedCategory && CATEGORIES.includes(requestedCategory) ? requestedCategory : 'Все');
  const [query, setQuery] = useState(requestedQuery);
  const [sort, setSort] = useState('popular');
  const [compare, setCompare] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [brandFilter, setBrandFilter] = useState('Все');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (text: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(text);
    timer.current = setTimeout(() => setToast(''), 2200);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...PRODUCTS.filter(p => {
      const matchCat = category === 'Все' || p.category === category;
      const matchQ = !q || `${p.title} ${p.brand} ${p.category}`.toLowerCase().includes(q);
      const matchBrand = brandFilter === 'Все' || p.brand === brandFilter;
      return matchCat && matchQ && matchBrand;
    })].sort((a, b) => {
      if (sort === 'priceUp') return a.price - b.price;
      if (sort === 'priceDown') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      return b.reviews - a.reviews;
    });
  }, [brandFilter, category, query, sort]);

  const qty = (id: number) => {
    const item = cartItems.find(i => i.kind === 'product' && i.id === id);
    return item && item.kind === 'product' ? item.qty : 0;
  };

  const add = (product: Product) => {
    addProduct({ id: product.id, kind: 'product', title: product.title, brand: product.brand, price: product.price, oldPrice: product.oldPrice, qty: 1, image: product.image });
    notify('Товар добавлен в корзину');
  };

  const brands = ['Все', ...Array.from(new Set(PRODUCTS.map(p => p.brand)))];

  const openProduct = (product: Product) => {
    navigate(`/market/${product.id}`);
  };

  useEffect(() => {
    if (!requestedProduct) return;
    const product = PRODUCTS.find(p => p.id === Number(requestedProduct));
    if (!product) return;
    navigate(`/market/${product.id}`, { replace: true });
  }, [navigate, requestedProduct]);

  const toggleProductFavorite = (product: Product) => {
    const wasFav = hasFavorite(product.id, 'market');
    toggleFavorite({ id: product.id, kind: 'market', title: product.title, brand: product.brand, price: product.price, oldPrice: product.oldPrice, inStock: product.stock > 0, image: product.image, available: product.stock > 0 });
    notify(wasFav ? 'Убрано из избранного' : 'Добавлено в избранное');
  };

  const toggleCompare = (id: number) => {
    setCompare(c => c.includes(id) ? c.filter(i => i !== id) : [...c, id].slice(-3));
  };

  const productCard = (product: Product) => {
    const inCart = qty(product.id);
    const fav = hasFavorite(product.id, 'market');
    const compared = compare.includes(product.id);
    return (
      <article key={product.id} className="vm-card" onClick={() => openProduct(product)}>
        <div className="vm-card-img">
          <img src={product.image} alt={product.title} />
          {product.badge && <span className="vm-card-promo">{product.badge}</span>}
          {product.oldPrice && (
            <span className="vm-card-discount">−{Math.round((1 - product.price / product.oldPrice) * 100)}%</span>
          )}
          <button className={`vm-card-fav${fav ? ' active' : ''}`} aria-label={fav ? 'Убрать из избранного' : 'В избранное'} onClick={(e) => { e.stopPropagation(); toggleProductFavorite(product); }}>
            <IcHeart filled={fav} />
          </button>
        </div>
        <div className="vm-card-body">
          <div className="vm-card-price">
            {product.price.toLocaleString()} ₽
            {product.oldPrice && <span className="vm-card-old">{product.oldPrice.toLocaleString()} ₽</span>}
          </div>
          <div className="vm-card-title">{product.title}</div>
        </div>
        <div className="vm-card-seller">
          <span className="vm-card-brand">{product.brand}</span>
          <div className="vm-card-rating">
            <StarRating rating={product.rating} />
            <span style={{ marginLeft: 3 }}>{product.rating}</span>
          </div>
        </div>
        <div className="vm-card-footer" onClick={(e) => e.stopPropagation()}>
          <button className={`vm-card-buy${inCart ? ' in-cart' : ''}`} onClick={() => inCart ? navigate('/cart') : add(product)}>
            {inCart ? `${inCart} в корзине` : 'В корзину'}
          </button>
          <button className={`vm-card-cmp${compared ? ' active' : ''}`} title={compared ? 'Убрать из сравнения' : 'Добавить в сравнение'} onClick={() => toggleCompare(product.id)}>
            <IcCompare />
          </button>
        </div>
      </article>
    );
  };

  return (
    <main className="vm-page">
      <style>{SHOP_CSS}</style>
      {toast && <div className="portal-toast">{toast}</div>}

      {/* ── Sticky header ── */}
      <header className="vm-nav" aria-label="Навигация Военмаркета">
        <div className="vm-nav-inner">
          <div className="vm-brand">
            <IcStore />
            <span>ВОЕНМАРКЕТ</span>
          </div>
          <label className="vm-nav-search">
            <IcSearch />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти форму, снаряжение или учебный комплект" />
          </label>
          <select className="vm-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="popular">Популярные</option>
            <option value="rating">По рейтингу</option>
            <option value="priceUp">Сначала дешевле</option>
            <option value="priceDown">Сначала дороже</option>
          </select>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="vm-shell">

        {/* Category filters */}
        <div className="vm-cats">
          {CATEGORIES.map(c => (
            <button key={c} className={`vm-cat${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        {/* Benefits */}
        <section className="vm-benefits" aria-label="Преимущества">
          {([['verified','Проверено на занятиях','рекомендации инструкторов'],['delivery','Быстрая доставка','от 2 дней по России'],['payment','Безопасная оплата','картой или частями'],['return','Возврат 30 дней','при сохранении комплекта']] as const).map(([icon,title,copy]) => (
            <div className="vm-benefit" key={title}>
              <div className="vm-benefit-icon"><BenefitIcon kind={icon} /></div>
              <div className="vm-benefit-copy"><b>{title}</b><span>{copy}</span></div>
            </div>
          ))}
        </section>

        {/* Catalog head */}
        <div className="vm-catalog-head">
          <div>
            <h2>Каталог Воеводы</h2>
            <p>{filtered.length} товаров по текущим условиям</p>
          </div>
          <div className="vm-catalog-tools">
            <select className="vm-select" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              {brands.map(b => <option key={b}>{b}</option>)}
            </select>
            <button className="vm-reset" onClick={() => { setCategory('Все'); setBrandFilter('Все'); setQuery(''); }}>
              Сбросить
            </button>
          </div>
        </div>

        {/* Product grid */}
        <div className="vm-grid">
          {filtered.length ? filtered.map(productCard) : (
            <div className="vm-empty">
              <div className="vm-empty-icon"><IcStore /></div>
              <h3>Товары не найдены</h3>
              <p>Измените запрос или сбросьте фильтры.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom hero bar ── */}
      <section className="vm-hero" aria-label="О Военмаркете">
        <div className="vm-hero-inner">
          <div>
            <span className="vm-kicker">Экипировка учебного центра</span>
            <h1>Снаряжение, проверенное на занятиях</h1>
            <p className="vm-hero-copy">Форма, медицина и учебные комплекты, которые используют инструкторы «Воеводы». Один каталог без лишней навигации.</p>
            <div className="vm-hero-actions">
              <button className="vm-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Вернуться к каталогу</button>
              <button className="vm-ghost" onClick={() => navigate('/cart')}>Моя корзина</button>
            </div>
            <div className="vm-hero-stats">
              <div className="vm-hero-stat"><b>{PRODUCTS.length}</b><span>товаров</span></div>
              <div className="vm-hero-stat"><b>{Array.from(new Set(PRODUCTS.map(p => p.brand))).length}</b><span>брендов</span></div>
              <div className="vm-hero-stat"><b>0%</b><span>наценки</span></div>
            </div>
          </div>
          <div className="vm-hero-visual" aria-hidden="true">
            <div className="vm-product-orbit">
              <div className="vm-product-main"><img src="/voen1.png" alt="" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison sticky bar ── */}
      {compare.length > 0 && (
        <div className="vm-cmp-bar">
          <div className="vm-cmp-inner">
            <span className="vm-cmp-label">Сравнение</span>
            <div className="vm-cmp-items">
              {compare.map(id => {
                const p = PRODUCTS.find(p => p.id === id)!;
                return (
                  <div key={id} className="vm-cmp-item">
                    <img src={p.image} alt={p.title} />
                    <button className="vm-cmp-item-rm" onClick={() => setCompare(c => c.filter(i => i !== id))}>×</button>
                  </div>
                );
              })}
              {compare.length < 3 && <div className="vm-cmp-slot">+</div>}
            </div>
            <button className="vm-cmp-go" disabled={compare.length < 2} onClick={() => setCompareOpen(true)}>
              {compare.length < 2 ? 'Добавьте ещё товар' : `Сравнить (${compare.length})`}
            </button>
            <button className="vm-cmp-cls" onClick={() => setCompare([])}>Очистить</button>
          </div>
        </div>
      )}

      {/* ── Comparison modal ── */}
      {compareOpen && (
        <div className="vm-cmp-bg" onClick={() => setCompareOpen(false)}>
          <div className="vm-cmp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vm-cmp-head">
              <h2>Сравнение товаров</h2>
              <button className="vm-cmp-close" onClick={() => setCompareOpen(false)}>×</button>
            </div>
            <div className="vm-cmp-cols" style={{ gridTemplateColumns: `repeat(${compare.length}, 1fr)` }}>
              {compare.map(id => {
                const p = PRODUCTS.find(p => p.id === id)!;
                const inCart = qty(p.id);
                return (
                  <div key={id} className="vm-cmp-col">
                    <div className="vm-cmp-col-img"><img src={p.image} alt={p.title} /></div>
                    <div className="vm-cmp-col-body">
                      <div className="vm-cmp-col-price">
                        {p.price.toLocaleString()} ₽
                        {p.oldPrice && <span className="vm-cmp-col-old">{p.oldPrice.toLocaleString()} ₽</span>}
                      </div>
                      <div className="vm-cmp-col-title">{p.title}</div>
                      <div className="vm-cmp-col-rating">
                        <StarRating rating={p.rating} />
                        <span>{p.rating}</span>
                        <span style={{ color: '#b0b5bf' }}>{p.reviews} отзывов</span>
                      </div>
                    </div>
                    {p.specs.map(([k, v]) => (
                      <div key={k} className="vm-cmp-spec">
                        <div className="vm-cmp-spec-label">{k}</div>
                        <div className="vm-cmp-spec-val">{v}</div>
                      </div>
                    ))}
                    <button className="vm-cmp-col-buy" onClick={() => { add(p); setCompareOpen(false); }}>
                      {inCart ? 'Открыть корзину' : 'В корзину'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
