import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JOURNAL_SCROLL_KEY } from './ArticlePage';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Article {
  id: number;
  category: 'Статьи' | 'Новости' | 'Блог' | 'Видео';
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  views: string;
  likes: number;
  comments: number;
  image: string;
  tags: string[];
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ARTICLES: Article[] = [
  { id: 1, category: 'Статьи', title: 'Как правильно подготовиться к курсу молодого бойца: полное руководство', excerpt: 'Курс молодого бойца — это первый и важнейший этап военной подготовки. Мы расскажем, как физически и психологически подготовиться к интенсивным нагрузкам, что взять с собой и каких ошибок избежать.', author: 'Торнадо', authorAvatar: '/teacher1-main.jpg', date: '23 марта', readTime: '8 мин', views: '121,4 тыс', likes: 2600, comments: 432, image: '/kyrs1.png', tags: ['КМБ', 'Подготовка', 'Советы'] },
  { id: 2, category: 'Новости', title: 'Открыт набор на Курс молодого бойца V5 в Москве — старт 10 мая', excerpt: 'УТЦ «Воевода» объявляет об открытии нового потока КМБ. Места ограничены — успей записаться до 30 апреля.', author: 'Редакция Воевода', authorAvatar: '/logo.png', date: '21 марта', readTime: '2 мин', views: '45,2 тыс', likes: 890, comments: 67, image: '/voen1.png', tags: ['КМБ', 'Набор', 'Москва'] },
  { id: 3, category: 'Блог', title: 'Мой путь в ВДВ: от гражданки до десантника за 3 месяца', excerpt: 'Личный опыт прохождения КМБ и подготовки к службе в Воздушно-десантных войсках. Что меня удивило, что было тяжелее всего и как я справился.', author: 'Бек', authorAvatar: '/teacher2-main.jpg', date: '20 марта', readTime: '12 мин', views: '88,6 тыс', likes: 3400, comments: 215, image: '/kyrs2.png', tags: ['ВДВ', 'Личный опыт', 'КМБ'] },
  { id: 4, category: 'Статьи', title: 'Тактическая медицина: 10 навыков, которые могут спасти жизнь', excerpt: 'Оказание первой помощи в боевых условиях кардинально отличается от гражданской медицины. Разбираем ключевые техники ТССС-протокола.', author: 'Коба', authorAvatar: '/teacher3-main.jpg', date: '19 марта', readTime: '10 мин', views: '204,1 тыс', likes: 5200, comments: 381, image: '/voen2.png', tags: ['Медицина', 'ТССС', 'Навыки'] },
  { id: 5, category: 'Видео', title: 'Разбор техники стрельбы из АК-74 — урок от инструктора', excerpt: 'Инструктор Торнадо разбирает типичные ошибки при стрельбе, правильную постановку хвата и работу с прицелом.', author: 'Торнадо', authorAvatar: '/teacher1-main.jpg', date: '18 марта', readTime: '15 мин', views: '312,8 тыс', likes: 7100, comments: 628, image: '/voen3.png', tags: ['Оружие', 'Обучение', 'АК-74'] },
  { id: 6, category: 'Новости', title: 'Результаты соревнований «Тактическое ориентирование» — Москва 2024', excerpt: 'Подводим итоги межрегионального соревнования.', author: 'Редакция Воевода', authorAvatar: '/logo.png', date: '17 марта', readTime: '4 мин', views: '31,5 тыс', likes: 420, comments: 89, image: '/voen4.png', tags: ['Соревнования', 'Ориентирование'] },
  { id: 7, category: 'Блог', title: 'Почему я выбрал путь инструктора: история Кобы', excerpt: 'От курсанта до главного инструктора — 8 лет пути.', author: 'Коба', authorAvatar: '/teacher3-main.jpg', date: '15 марта', readTime: '9 мин', views: '67,3 тыс', likes: 1800, comments: 156, image: '/voen5.png', tags: ['Инструктор', 'История'] },
  { id: 8, category: 'Статьи', title: 'Физическая подготовка бойца: программа на 3 месяца до КМБ', excerpt: 'Детальная программа тренировок. Бег, силовые, выносливость — всё по неделям.', author: 'Стрелок', authorAvatar: '/teacher2-main.jpg', date: '14 марта', readTime: '14 мин', views: '156,7 тыс', likes: 4300, comments: 298, image: '/voen6.png', tags: ['Физподготовка', 'Программа'] },
];

const CHANNELS = [
  { id: 1, name: 'Торнадо | Инструктор', avatar: '/teacher1-main.jpg', subscribers: '14,2 тыс.', topic: 'Тактика и оружие' },
  { id: 2, name: 'Коба | Тактика', avatar: '/teacher3-main.jpg', subscribers: '6,4 тыс.', topic: 'Военная подготовка' },
  { id: 3, name: 'Медицина боя', avatar: '/voen1.png', subscribers: '4,1 тыс.', topic: 'Тактическая медицина' },
  { id: 4, name: 'Редакция Воевода', avatar: '/logo.png', subscribers: '8,7 тыс.', topic: 'Новости и события' },
];

const TRENDING = ['Курс молодого бойца V5','Тактическая медицина','Общевойсковой снайпер','Физическая подготовка','Оружие и снаряжение','Соревнования 2024','Путь Воеводы','Командирская подготовка'];
const ALL_TAGS = ['КМБ','Тактика','Медицина','ВДВ','Оружие','Подготовка','Снаряжение','Стрельба','Физподготовка','Инструктор','Советы','Мотивация'];
const CATEGORIES = ['Все','Статьи','Новости','Блог','Видео'];
const LIVE_READERS = [
  { name: 'Следопыт-42', avatar: '/teacher1-main.jpg', article: 'Тактическая медицина...' },
  { name: 'Тень', avatar: '/teacher2-main.jpg', article: 'Курс молодого бойца...' },
  { name: 'Нексус', avatar: '/logo.png', article: 'Физическая подготовка...' },
];
const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  Статьи: { bg: '#EBF1FF', text: '#375DFB' },
  Новости: { bg: '#FEF3C7', text: '#92400E' },
  Блог:    { bg: '#F0FDF4', text: '#166534' },
  Видео:   { bg: '#FEE2E2', text: '#991B1B' },
};
const STATS = [
  { label: 'Публикаций',    value: '1 247', color: '#375DFB', bg: '#EBF1FF' },
  { label: 'Авторов',       value: '384',   color: '#8B5CF6', bg: '#F3EEFF' },
  { label: 'Читателей',     value: '42,6 тыс.', color: '#10B981', bg: '#ECFDF5' },
  { label: 'Читают сейчас', value: '318',   color: '#F59E0B', bg: '#FFFBEB' },
];

// ─── ICONS (те же что в JournalPreview) ──────────────────────────────────────
function IcHeart({ active = false }: { active?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? '#EF4444' : '#D1D5DB'} stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IcThumb({ color = '#D1D5DB', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.2875 5.14073L10.0608 6.37034C9.92347 6.50803 9.92303 6.7317 10.0598 6.86993C10.2925 7.10497 10.5166 7.05021 10.654 6.91253C10.5661 7.11692 10.3904 7.6271 10.3904 8.03268C10.3904 8.51692 10.5842 8.9555 10.8981 9.27436C10.3199 9.563 9.92236 10.1628 9.92236 10.8563C9.92236 11.3405 10.1162 11.7791 10.4301 12.0979C9.85188 12.3866 9.45433 12.9864 9.45433 13.6799C9.45433 14.655 10.2404 15.445 11.2094 15.445H13.0462L14.2389 15.6895C14.0446 15.6628 13.8534 15.682 13.6769 15.7391C13.8742 15.679 14.0892 15.6664 14.3057 15.7119L15.9356 16.0551C16.5886 16.1925 17.015 16.823 16.8994 17.4803C16.7812 18.1526 16.1408 18.6022 15.4683 18.485L13.8274 18.1991C13.7873 18.1921 13.7479 18.1833 13.7093 18.1728L10.1762 17.5672C9.98064 17.5307 9.62398 17.4894 9.28237 17.4498C9.0461 17.4225 8.81699 17.3959 8.65324 17.3724C8.2522 17.3147 7.82914 17.2478 7.45795 17.1764C7.07956 17.1037 6.60792 16.9651 6.60792 16.9651C6.60792 16.9651 5.77081 16.7047 5.39742 16.5476C5.14793 16.4392 4.52031 16.168 4.26625 16.0709C4.10537 16.0094 3.88391 15.9174 3.65706 15.8207C3.1816 15.618 2.94387 15.5167 2.8058 15.3077C2.66772 15.0988 2.66772 14.8353 2.66772 14.3083L2.66772 8.84776C2.66772 8.2805 2.66772 7.99687 2.8206 7.78063C2.97347 7.56439 3.23943 7.4703 3.77132 7.28214L3.77133 7.28213C3.95772 7.21619 4.13383 7.15435 4.26754 7.10832C4.77788 6.9326 5.26832 6.68651 5.67162 6.36904L9.68343 3.21107C9.71961 3.17049 9.75882 3.13176 9.80104 3.0952L11.4081 1.70339C11.9124 1.26658 12.6725 1.30921 13.1249 1.79968C13.5873 2.30109 13.5558 3.08241 13.0545 3.54499L11.4921 4.98674C11.428 5.04593 11.3594 5.09724 11.2875 5.14073ZM14.1346 13.6799C14.1346 13.0955 13.6634 12.6213 13.0816 12.6213H11.2094C10.6276 12.6213 10.1564 13.0955 10.1564 13.6799C10.1564 14.2642 10.6276 14.7385 11.2094 14.7385H13.0816C13.6634 14.7385 14.1346 14.2642 14.1346 13.6799ZM10.6244 10.8563C10.6244 11.4406 11.0956 11.9148 11.6774 11.9148H13.5496C14.1315 11.9148 14.6027 11.4405 14.6027 10.8562C14.6027 10.2752 14.1369 9.80312 13.5598 9.79764L11.6775 9.79774C11.0956 9.79768 10.6244 10.2719 10.6244 10.8563ZM12.1455 9.09127C11.5638 9.09114 11.0924 8.61696 11.0924 8.03268C11.0924 7.44832 11.5636 6.97409 12.1455 6.97409L14.017 6.9739C14.5989 6.97392 15.0701 7.44814 15.0701 8.03248C15.0701 8.61664 14.5992 9.09075 14.0176 9.09107L13.5436 9.09112L12.1455 9.09127Z" fill={color} />
    </svg>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes jFadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes jSlideL   { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
  @keyframes jSlideR   { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
  @keyframes jScalePop { 0%{transform:scale(.94);opacity:0} 100%{transform:scale(1);opacity:1} }
  @keyframes jPulse    { 0%,100%{opacity:1} 50%{opacity:.35} }

  .jc  { animation:jFadeUp .4s ease both; transition:box-shadow .25s,transform .25s !important; }
  .jc:hover { box-shadow:0 8px 32px rgba(0,0,0,.11) !important; transform:translateY(-2px) !important; }
  .jf  { animation:jScalePop .45s ease both; transition:box-shadow .25s,transform .25s !important; }
  .jf:hover { box-shadow:0 12px 40px rgba(0,0,0,.13) !important; transform:translateY(-3px) !important; }
  .jsl { animation:jSlideL .5s ease both; }

  /* ── ПРАВАЯ СЕКЦИЯ: своя полоса скролла ── */
  .jsr {
    position: sticky !important;
    top: 84px !important;
    max-height: calc(100vh - 104px) !important;
    overflow-y: auto !important;
    scrollbar-width: thin;
    scrollbar-color: #E5E7EB transparent;
  }
  .jsr::-webkit-scrollbar { width: 4px; }
  .jsr::-webkit-scrollbar-track { background: transparent; }
  .jsr::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
  .jsr::-webkit-scrollbar-thumb:hover { background: #C7D2FE; }

  .iz  { transition:transform .5s ease !important; }
  .jc:hover .iz, .jf:hover .iz { transform:scale(1.05) !important; }
  .sw  { transition:box-shadow .2s !important; }
  .sw:hover { box-shadow:0 4px 20px rgba(0,0,0,.08) !important; }
  .tp  { transition:background .15s,color .15s,transform .15s !important; cursor:pointer; }
  .tp:hover { transform:scale(1.05) !important; }
  .cb  { transition:all .18s ease !important; }
  .cb:hover { transform:translateY(-1px) !important; }
  .ld  { animation:jPulse 1.8s ease-in-out infinite; }
  .wb  { transition:all .2s ease !important; position:relative; overflow:hidden; }
  .wb::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent); transform:translateX(-100%); transition:transform .4s; }
  .wb:hover::after { transform:translateX(100%); }
  .wb:hover { background:#2748d6 !important; box-shadow:0 6px 20px rgba(55,93,251,.4) !important; transform:translateY(-1px) !important; }
  .sbb { transition:all .15s !important; }
  .sbb:hover { transform:scale(1.04) !important; }
  .ti  { transition:all .15s !important; }
  .ti:hover .tt { color:#375DFB !important; transform:translateX(4px); }
  .tt  { transition:color .15s,transform .15s !important; display:inline-block; }
  .ar  { transition:background .15s !important; border-radius:10px; }
  .ar:hover { background:#F8F9FF !important; }

  /* ── СТРЕЛКИ — большие, заметные ── */
  .arrow-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 2px solid #C7D2FE;
    background: #fff;
    cursor: pointer;
    transition: all .2s ease !important;
    flex-shrink: 0;
  }
  .arrow-btn:hover {
    background: #375DFB !important;
    border-color: #375DFB !important;
  }
  .arrow-btn:hover svg { stroke: #fff !important; }
  .arrow-btn:active { transform: scale(.93); }
`;

// ─── FEATURED CARD ────────────────────────────────────────────────────────────
function FeaturedCard({ article, onOpen }: { article: Article; onOpen: () => void }) {
  const [liked, setLiked] = useState(false);
  const [juked, setJuked] = useState(false);
  const [saved, setSaved] = useState(false);
  const cat = CAT_COLORS[article.category] ?? { bg: '#F3F4F6', text: '#374151' };
  return (
    <div className="jf" onClick={onOpen}
      style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #E5E7EB', cursor: 'pointer', marginBottom: 16 }}>
      <div style={{ height: 340, overflow: 'hidden', position: 'relative' }}>
        <img src={article.image} alt={article.title} className="iz"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#1a1a2e'; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.75) 0%,rgba(0,0,0,.2) 50%,transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 18, left: 18, display: 'flex', gap: 8 }}>
          <span style={{ background: cat.bg, color: cat.text, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{article.category}</span>
          <span style={{ background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, backdropFilter: 'blur(6px)' }}>Редакция советует</span>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,.5)', flexShrink: 0 }}>
              <img src={article.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#9CA3AF'; }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.9)' }}>{article.author}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>· {article.date} · {article.readTime} чтения</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>{article.title}</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', margin: '0 0 16px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{article.excerpt}</p>
          {/* ── ЛАЙК + ПАЛЕЦ (как в JournalPreview под главной статьёй) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setLiked(!liked); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: 'none', background: liked ? 'rgba(239,68,68,.85)' : 'rgba(255,255,255,.15)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(6px)', transition: 'all .15s' }}>
              <IcHeart active={liked} />{(article.likes + (liked ? 1 : 0)).toLocaleString('ru')}
            </button>
            <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setJuked(!juked); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: 'none', background: juked ? 'rgba(16,185,129,.85)' : 'rgba(255,255,255,.15)', color: '#fff', fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(6px)', transition: 'all .15s' }}>
              <IcThumb color={juked ? '#fff' : 'rgba(255,255,255,.7)'} size={15} />Полезно
            </button>
            <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSaved(!saved); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: 'none', background: saved ? 'rgba(55,93,251,.9)' : 'rgba(255,255,255,.15)', color: '#fff', fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(6px)', transition: 'all .15s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? '#fff' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
              {saved ? 'Сохранено' : 'Сохранить'}
            </button>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              {article.views}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ARTICLE CARD ─────────────────────────────────────────────────────────────
function ArticleCard({ article, index, onOpen }: { article: Article; index: number; onOpen: () => void }) {
  const [liked, setLiked] = useState(false);
  const [juked, setJuked] = useState(false);
  const [saved, setSaved] = useState(false);
  const cat = CAT_COLORS[article.category] ?? { bg: '#F3F4F6', text: '#374151' };
  return (
    <div className="jc" onClick={onOpen}
      style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', cursor: 'pointer', marginBottom: 12, display: 'flex', animationDelay: `${index * 0.07}s` }}>
      <div style={{ width: 196, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
        <img src={article.image} alt={article.title} className="iz"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#E5E7EB'; }} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{ background: cat.bg, color: cat.text, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>{article.category}</span>
        </div>
      </div>
      <div style={{ flex: 1, padding: '18px 22px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: '#E5E7EB', flexShrink: 0 }}>
            <img src={article.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#9CA3AF'; }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{article.author}</span>
          <span style={{ fontSize: 11, color: '#D1D5DB' }}>·</span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{article.date} · {article.readTime}</span>
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 8px', lineHeight: 1.35, flex: 1 }}>{article.title}</h3>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{article.excerpt}</p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {article.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} onClick={(e: React.MouseEvent) => e.stopPropagation()} className="tp"
              style={{ background: '#F3F4F6', color: '#6B7280', fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 10 }}>#{tag}</span>
          ))}
        </div>
        {/* ── ЛАЙК + ПАЛЕЦ ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 10, borderTop: '1px solid #F5F5F7' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#9CA3AF' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            {article.views}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setLiked(!liked); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#EF4444' : '#9CA3AF', fontSize: 12, fontWeight: liked ? 600 : 400, padding: 0, transition: 'color .15s' }}>
              <IcHeart active={liked} />{(article.likes + (liked ? 1 : 0)).toLocaleString('ru')}
            </button>
            <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setJuked(!juked); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: juked ? '#10B981' : '#9CA3AF', fontSize: 12, padding: 0, transition: 'color .15s' }}>
              <IcThumb color={juked ? '#10B981' : '#D1D5DB'} size={14} />
            </button>
            <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSaved(!saved); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: saved ? '#375DFB' : '#9CA3AF', padding: 0, transition: 'color .15s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? '#375DFB' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────
function StatsBar() {
  const icons = [
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.6" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.6" strokeLinecap="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '18px 24px', marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
      {STATS.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', borderRight: i < 3 ? '1px solid #F0F0F0' : 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icons[i]}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111', lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
          </div>
          {s.label === 'Читают сейчас' && <div className="ld" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', marginLeft: 'auto' }} />}
        </div>
      ))}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function JournalPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Все');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [subscribedChannels, setSubscribedChannels] = useState<number[]>([]);
  const [featuredOffset, setFeaturedOffset] = useState(0);

  // Восстановление позиции после возврата
  useEffect(() => {
    const saved = sessionStorage.getItem(JOURNAL_SCROLL_KEY);
    if (saved) {
      requestAnimationFrame(() => window.scrollTo({ top: Number(saved) }));
      sessionStorage.removeItem(JOURNAL_SCROLL_KEY);
    }
  }, []);

  const filtered: Article[] = activeCategory === 'Все'
    ? ARTICLES
    : ARTICLES.filter((a: Article) => a.category === activeCategory);

  const featuredIndex = filtered.length > 0 ? featuredOffset % filtered.length : 0;
  const featured = filtered[featuredIndex];
  const rest = filtered.filter((_: Article, i: number) => i !== featuredIndex);

  // ★ Всегда navigate, никаких модалов
  const openArticle = (article: Article) => {
    sessionStorage.setItem(JOURNAL_SCROLL_KEY, String(window.scrollY));
    navigate(`/journal/${article.id}`);
  };

  const shiftFeatured = (dir: 1 | -1) => {
    if (filtered.length === 0) return;
    setFeaturedOffset((prev: number) => ((prev + dir) % filtered.length + filtered.length) % filtered.length);
  };

  const changeCategory = (cat: string) => { setActiveCategory(cat); setFeaturedOffset(0); };

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ marginTop: 60, marginLeft: 56, minHeight: 'calc(100vh - 60px)', background: '#F4F5F8', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', padding: '28px 28px 60px', display: 'grid', gridTemplateColumns: '220px 1fr 310px', gap: 24, alignItems: 'start' }}>

          {/* ─── LEFT SIDEBAR ─── */}
          <aside className="jsl" style={{ position: 'sticky', top: 84, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="sw" style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                  <line x1="9" y1="8" x2="17" y2="8" /><line x1="9" y1="12" x2="17" y2="12" /><line x1="9" y1="16" x2="14" y2="16" />
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Журнал</span>
              </div>
              {CATEGORIES.map((cat: string) => (
                <button key={cat} onClick={() => changeCategory(cat)} className="cb"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 20px', border: 'none', background: activeCategory === cat ? '#EBF1FF' : 'transparent', color: activeCategory === cat ? '#375DFB' : '#374151', fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400, cursor: 'pointer', textAlign: 'left', borderLeft: `3px solid ${activeCategory === cat ? '#375DFB' : 'transparent'}` }}>
                  {cat === 'Все' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}
                  {cat === 'Статьи' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                  {cat === 'Новости' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /></svg>}
                  {cat === 'Блог' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>}
                  {cat === 'Видео' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>}
                  {cat}
                  {activeCategory === cat && (
                    <span style={{ marginLeft: 'auto', background: '#375DFB', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
                      {cat === 'Все' ? ARTICLES.length : ARTICLES.filter((a: Article) => a.category === cat).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="sw" style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 12 }}>Популярные теги</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ALL_TAGS.map((tag: string) => (
                  <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} className="tp"
                    style={{ background: activeTag === tag ? '#EBF1FF' : '#F4F5F8', color: activeTag === tag ? '#375DFB' : '#6B7280', border: activeTag === tag ? '1px solid #C7D7FD' : '1px solid transparent', fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 10 }}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ─── MAIN FEED ─── */}
          <main>
            <StatsBar />

            {/* ── КАТЕГОРИИ + СТРЕЛКИ ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              {CATEGORIES.map((cat: string) => (
                <button key={cat} onClick={() => changeCategory(cat)} className="cb"
                  style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid', borderColor: activeCategory === cat ? '#375DFB' : '#E5E7EB', background: activeCategory === cat ? '#375DFB' : '#fff', color: activeCategory === cat ? '#fff' : '#374151', fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400, cursor: 'pointer' }}>
                  {cat}
                </button>
              ))}

              {/* ★ СТРЕЛКИ — заметный блок справа ★ */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '6px 12px' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', minWidth: 40, textAlign: 'center' }}>
                  {filtered.length > 0 ? `${featuredIndex + 1} / ${filtered.length}` : '—'}
                </span>
                <button className="arrow-btn" onClick={() => shiftFeatured(-1)} title="Предыдущая статья">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className="arrow-btn" onClick={() => shiftFeatured(1)} title="Следующая статья">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            {featured && <FeaturedCard article={featured} onOpen={() => openArticle(featured)} />}
            {rest.map((article: Article, i: number) => (
              <ArticleCard key={article.id} article={article} index={i} onOpen={() => openArticle(article)} />
            ))}
            {filtered.length === 0 && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '64px 32px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Пока пусто</div>
                <div style={{ fontSize: 14, color: '#9CA3AF' }}>В этой категории ещё нет материалов</div>
              </div>
            )}
          </main>

          {/* ─── RIGHT SIDEBAR — sticky + свой скролл ─── */}
          <aside className="jsr" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 2 }}>

            <button onClick={() => navigate('/microblog')} className="wb"
              style={{ width: '100%', padding: '16px 0', borderRadius: 8, background: 'linear-gradient(135deg,#375DFB 0%,#2240D9 100%)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>
              Написать статью
            </button>

            <div className="sw" style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div className="ld" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Читают сейчас</div>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#10B981' }}>318</span>
              </div>
              {LIVE_READERS.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < LIVE_READERS.length - 1 ? 12 : 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: '#E5E7EB', flexShrink: 0, position: 'relative' }}>
                    <img src={r.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#9CA3AF'; }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#10B981', border: '2px solid #fff' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.article}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sw" style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '18px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 16 }}>Авторы</div>
              {CHANNELS.map((ch) => (
                <div key={ch.id} className="ar" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer', padding: '6px 8px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', background: '#E5E7EB', flexShrink: 0 }}>
                    <img src={ch.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#9CA3AF'; }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{ch.subscribers} · {ch.topic}</div>
                  </div>
                  <button onClick={() => setSubscribedChannels((prev: number[]) => prev.includes(ch.id) ? prev.filter((id: number) => id !== ch.id) : [...prev, ch.id])}
                    className="sbb"
                    style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 6, border: '1px solid', borderColor: subscribedChannels.includes(ch.id) ? '#E5E7EB' : '#375DFB', background: subscribedChannels.includes(ch.id) ? '#F3F4F6' : '#EBF1FF', color: subscribedChannels.includes(ch.id) ? '#6B7280' : '#375DFB', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    {subscribedChannels.includes(ch.id) ? '✓' : 'Следить'}
                  </button>
                </div>
              ))}
            </div>

            <div className="sw" style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '18px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 16 }}>В тренде</div>
              {TRENDING.map((topic: string, i: number) => (
                <div key={i} className="ti" onClick={() => changeCategory('Все')}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < TRENDING.length - 1 ? '1px solid #F5F5F7' : 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: i < 3 ? '#375DFB' : '#D1D5DB', width: 22, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="tt" style={{ fontSize: 13, color: '#374151', lineHeight: 1.4, flex: 1 }}>{topic}</span>
                  {i < 3 && <span style={{ fontSize: 10, background: '#FEF3C7', color: '#92400E', fontWeight: 800, padding: '2px 6px', borderRadius: 8 }}>TOP</span>}
                </div>
              ))}
            </div>

            <div style={{ background: 'linear-gradient(135deg,#1e2a4a 0%,#375DFB 100%)', borderRadius: 16, padding: '20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 6, position: 'relative' }}>Стать автором</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 1.5, marginBottom: 14, position: 'relative' }}>Делитесь опытом с сообществом «Воевода»</div>
              <button onClick={() => navigate('/messages?chat=7')} style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', position: 'relative', transition: 'background .15s' }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,.28)')}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,.15)')}>
                Подать заявку →
              </button>
            </div>

          </aside>
        </div>
      </div>
    </>
  );
}

