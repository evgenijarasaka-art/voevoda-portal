import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../useMediaQuery';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useNotifStore } from '../store/useNotifStore';
import { BADGE_TOOLTIPS, ElitaBadge, BadgeBox, IVDisplay, PEOPLE, PeopleModal } from './PeopleSection';
import type { ModalMode } from './PeopleSection';
import { JOURNAL_SCROLL_KEY } from '../pages/ArticlePage';
import { useReviewsStore } from '../store/useReviewsStore';
import { HOME_JOURNAL_ARTICLES, getHomeArticleExcerpt, type HomeJournalArticle } from '../data/homeJournalArticles';

if (typeof document !== 'undefined' && !document.getElementById('jp-styles')) {
  const s = document.createElement('style');
  s.id = 'jp-styles';
  s.textContent = `
    @keyframes jpCardIn  { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes jpFadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes jpSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes jpHeartPop { 0%{transform:scale(1)} 40%{transform:scale(1.55)} 70%{transform:scale(.9)} 100%{transform:scale(1)} }
    @keyframes jpNumPop  { 0%{transform:translateY(0)} 50%{transform:translateY(-3px)} 100%{transform:translateY(0)} }
    .jp-row-hover { transition:background .13s, transform .16s ease; border-radius:8px; }
    .jp-row-hover:hover { background:#FAFBFF !important; transform:translateX(2px); }
    .jp-scroll-btn { transition:all .18s ease; }
    .jp-scroll-btn:hover:not(:disabled) { background:#EBF1FF !important; border-color:#C7D2FE !important; color:#375DFB !important; transform:scale(1.08); }
    .jp-tab-btn { position:relative; transition:color .18s, background .18s; }
    .jp-tab-btn::after { content:''; position:absolute; bottom:0; left:50%; right:50%; height:2px; background:#375DFB; border-radius:2px; transition:left .22s ease, right .22s ease; }
    .jp-tab-btn.active::after { left:8px; right:8px; }
    .jp-num-badge { transition:background .18s, color .18s, transform .18s; }
    .jp-num-badge:hover { transform:scale(1.12); }
    .jp-avatar-ring { transition:box-shadow .18s, transform .18s; }
    .jp-avatar-ring:hover { box-shadow:0 0 0 2px #375DFB; transform:scale(1.1); }
    .jp-heart-pop { animation:jpHeartPop .38s cubic-bezier(.34,1.56,.64,1) both; }
    .jp-card-wrap { transition:box-shadow .22s ease, transform .22s ease; }
    .jp-card-wrap:hover { box-shadow:0 8px 28px rgba(55,93,251,.12) !important; transform:translateY(-2px); }
  `;
  document.head.appendChild(s);
}

type Article = HomeJournalArticle;

const ARTICLES: Article[] = HOME_JOURNAL_ARTICLES;


const LEADER_PERSON_ID = 1;
const TABS = ['Поток', 'Статьи', 'Новости', 'Блог'] as const;

// Каждая вкладка журнала показывает свою главную обложку, чтобы фото менялось при переключении
const TAB_HERO: Record<typeof TABS[number], string> = {
  'Поток': '/register-slide-2.jpg',
  'Статьи': '/journal-main.jpg',
  'Новости': '/register-slide-1.jpg',
  'Блог': '/military-course.jpg',
};

const LEADER_PHOTO_H = 340;
const LEADER_BADGE_COL_W = 100;
const LEADER_BADGE_SIZE = 76;

function IcHeart({ active }: { active?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={active ? '#EF4444' : '#D1D5DB'} stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IcThumb({ color = '#D1D5DB' }: { color?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.2875 5.14073L10.0608 6.37034C9.92347 6.50803 9.92303 6.7317 10.0598 6.86993C10.2925 7.10497 10.5166 7.05021 10.654 6.91253C10.5661 7.11692 10.3904 7.6271 10.3904 8.03268C10.3904 8.51692 10.5842 8.9555 10.8981 9.27436C10.3199 9.563 9.92236 10.1628 9.92236 10.8563C9.92236 11.3405 10.1162 11.7791 10.4301 12.0979C9.85188 12.3866 9.45433 12.9864 9.45433 13.6799C9.45433 14.655 10.2404 15.445 11.2094 15.445H13.0462L14.2389 15.6895C14.0446 15.6628 13.8534 15.682 13.6769 15.7391C13.8742 15.679 14.0892 15.6664 14.3057 15.7119L15.9356 16.0551C16.5886 16.1925 17.015 16.823 16.8994 17.4803C16.7812 18.1526 16.1408 18.6022 15.4683 18.485L13.8274 18.1991C13.7873 18.1921 13.7479 18.1833 13.7093 18.1728L10.1762 17.5672C9.98064 17.5307 9.62398 17.4894 9.28237 17.4498C9.0461 17.4225 8.81699 17.3959 8.65324 17.3724C8.2522 17.3147 7.82914 17.2478 7.45795 17.1764C7.07956 17.1037 6.60792 16.9651 6.60792 16.9651C6.60792 16.9651 5.77081 16.7047 5.39742 16.5476C5.14793 16.4392 4.52031 16.168 4.26625 16.0709C4.10537 16.0094 3.88391 15.9174 3.65706 15.8207C3.1816 15.618 2.94387 15.5167 2.8058 15.3077C2.66772 15.0988 2.66772 14.8353 2.66772 14.3083L2.66772 8.84776C2.66772 8.2805 2.66772 7.99687 2.8206 7.78063C2.97347 7.56439 3.23943 7.4703 3.77132 7.28214L3.77133 7.28213C3.95772 7.21619 4.13383 7.15435 4.26754 7.10832C4.77788 6.9326 5.26832 6.68651 5.67162 6.36904L9.68343 3.21107C9.71961 3.17049 9.75882 3.13176 9.80104 3.0952L11.4081 1.70339C11.9124 1.26658 12.6725 1.30921 13.1249 1.79968C13.5873 2.30109 13.5558 3.08241 13.0545 3.54499L11.4921 4.98674C11.428 5.04593 11.3594 5.09724 11.2875 5.14073ZM14.1346 13.6799C14.1346 13.0955 13.6634 12.6213 13.0816 12.6213H11.2094C10.6276 12.6213 10.1564 13.0955 10.1564 13.6799C10.1564 14.2642 10.6276 14.7385 11.2094 14.7385H13.0816C13.6634 14.7385 14.1346 14.2642 14.1346 13.6799ZM10.6244 10.8563C10.6244 11.4406 11.0956 11.9148 11.6774 11.9148H13.5496C14.1315 11.9148 14.6027 11.4405 14.6027 10.8562C14.6027 10.2752 14.1369 9.80312 13.5598 9.79764L11.6775 9.79774C11.0956 9.79768 10.6244 10.2719 10.6244 10.8563ZM12.1455 9.09127C11.5638 9.09114 11.0924 8.61696 11.0924 8.03268C11.0924 7.44832 11.5636 6.97409 12.1455 6.97409L14.017 6.9739C14.5989 6.97392 15.0701 7.44814 15.0701 8.03248C15.0701 8.61664 14.5992 9.09075 14.0176 9.09107L13.5436 9.09112L12.1455 9.09127Z" fill={color} />
    </svg>
  );
}

function IcBookmark({ active }: { active?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={active ? '#EF4444' : 'none'} stroke={active ? '#EF4444' : '#D1D5DB'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MainArticle({ article }: { article: Article }) {
  const navigate = useNavigate();
  const { toggle, has } = useFavoritesStore();
  const addNotif = useNotifStore(s => s.add);
  const [liked, setLiked] = useState(false);
  const [juked, setJuked] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const faved = has(article.id, 'article');

  const openArticle = () => {
    sessionStorage.setItem(JOURNAL_SCROLL_KEY, String(window.scrollY));
    navigate(`/journal/${article.id}`, { state: { returnTo: '/' } });
  };

  const handleLike = () => {
    setLiked(l => !l);
    if (!liked) addNotif({ kind: 'like', title: 'Вам понравилась статья', body: article.title.slice(0, 60), link: `/journal/${article.id}` });
  };
  const handleFav = () => {
    toggle({ id: article.id, kind: 'article', title: article.title, author: article.author, date: article.date, image: article.image, stats: { views: article.stats.views, hearts: article.stats.hearts, likes: article.stats.jumbo } });
  };

  return (
    <div style={{ animation: 'jpSlideUp .4s ease', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div onClick={openArticle} style={{ borderRadius: 14, overflow: 'hidden', height: 'clamp(260px, 27vw, 350px)', flexShrink: 0, background: '#F3F4F6', cursor: 'pointer', marginBottom: 14 }}>
        {!imgErr
          ? <img src={article.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s cubic-bezier(.4,0,.2,1)' }} onError={() => setImgErr(true)}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#EBF1FF,#DFE8FF)' }} />
        }
      </div>
      <h3 onClick={openArticle} style={{ fontSize: 16, fontWeight: 700, color: '#111', lineHeight: 1.45, margin: '0 0 8px', cursor: 'pointer', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {article.title}
      </h3>
      {(() => { const ex = article.excerpt || getHomeArticleExcerpt(article as HomeJournalArticle); return ex ? <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{ex}</p> : null; })()}
      {/* Author row with reactions inline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div onClick={e => { e.stopPropagation(); navigate(`/users/${encodeURIComponent(article.author)}`); }}
          className="jp-avatar-ring"
          style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid #E5E7EB', background: '#F3F4F6', cursor: 'pointer' }}>
          <img src={article.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.opacity = '0'; }} />
        </div>
        <span onClick={e => { e.stopPropagation(); navigate(`/users/${encodeURIComponent(article.author)}`); }}
          style={{ fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', flexShrink: 0 }}>{article.author}</span>
        <button onClick={e => { e.stopPropagation(); handleLike(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: liked ? '#EF4444' : '#9CA3AF', transition: 'color .15s, transform .2s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
          <IcHeart active={liked} />{article.stats.hearts + (liked ? 1 : 0)}
        </button>
        <button onClick={e => { e.stopPropagation(); setJuked(j => !j); }}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: juked ? '#10B981' : '#9CA3AF', transition: 'color .15s, transform .2s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
          <IcThumb color={juked ? '#10B981' : '#D1D5DB'} />{article.stats.jumbo + (juked ? 1 : 0)}
        </button>
        <span style={{ fontSize: 12, color: '#C4C9D4', marginLeft: 'auto', flexShrink: 0 }}>{article.date}</span>
        <button onClick={e => { e.stopPropagation(); handleFav(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0, transition: 'transform .18s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.25) rotate(-5deg)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}>
          <IcBookmark active={faved} />
        </button>
      </div>
    </div>
  );
}

function SideArticleRow({ article, index, isLast }: { article: Article; index: number; isLast?: boolean }) {
  const navigate = useNavigate();
  const { toggle, has } = useFavoritesStore();
  const [liked, setLiked] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const faved = has(article.id, 'article');

  const openArticle = () => {
    sessionStorage.setItem(JOURNAL_SCROLL_KEY, String(window.scrollY));
    navigate(`/journal/${article.id}`, { state: { returnTo: '/' } });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(l => !l);
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 380);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle({ id: article.id, kind: 'article', title: article.title, author: article.author, date: article.date, image: article.image, stats: { views: article.stats.views, hearts: article.stats.hearts, likes: article.stats.jumbo } });
  };

  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/users/${encodeURIComponent(article.author)}`);
  };

  return (
    <div onClick={openArticle} className="jp-row-hover" style={{ display: 'flex', gap: 10, padding: '11px 0', borderBottom: isLast ? 'none' : '1px solid #F3F4F6', cursor: 'pointer' }}>
      <div className="jp-num-badge" style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 6, background: index < 3 ? '#EBF1FF' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: index < 3 ? '#375DFB' : '#9CA3AF', marginTop: 1 }}>
        {index + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.4, margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
          {article.title}
        </p>
        {/* Meta row: avatar · name · ♥ · bookmark  ···  date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'nowrap', minWidth: 0 }}>
          <div onClick={goToProfile} className="jp-avatar-ring" style={{ width: 18, height: 18, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', border: '1px solid #E5E7EB', background: '#F3F4F6' }}>
            <img src={article.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#9CA3AF'; }} />
          </div>
          <span onClick={goToProfile} style={{ fontSize: 11, color: '#6B7280', cursor: 'pointer', fontWeight: 600, flexShrink: 0, maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.author}</span>
          <button onClick={handleLike}
            className={heartPop ? 'jp-heart-pop' : ''}
            style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 11, color: liked ? '#EF4444' : '#9CA3AF', transition: 'color .15s', flexShrink: 0 }}>
            <IcHeart active={liked} />{article.stats.hearts + (liked ? 1 : 0)}
          </button>
          <button onClick={handleFav} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1, display: 'flex', transition: 'transform .18s', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.25) rotate(-5deg)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}>
            <IcBookmark active={faved} />
          </button>
          <span style={{ fontSize: 11, color: '#C4C9D4', marginLeft: 'auto', flexShrink: 0 }}>{article.date}</span>
        </div>
      </div>
    </div>
  );
}

// ─── ScrollColumn ─────────────────────────────────────────────────────────────
// Стрелки: используем правильный синтаксис polyline points (координатные пары),
// а не path-синтаксис "M x y" — это была причина пустых квадратиков.
function ScrollColumn({ articles }: { articles: Article[] }) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtTop(el.scrollTop < 8);
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight <= el.clientHeight);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [articles]);

  const scrollBy = (delta: number) => scrollRef.current?.scrollBy({ top: delta, behavior: 'smooth' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 18px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{articles.length + 1} материала в разделе</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            // Стрелка вверх — правильный polyline points: "x1,y1 x2,y2 x3,y3"
            { dir: -220, points: '18,15 12,9 6,15' },
            // Стрелка вниз
            { dir:  220, points: '6,9 12,15 18,9' },
          ] as const).map(({ dir, points }, i) => {
            const disabled = i === 0 ? atTop : atBottom;
            return (
              <button
                key={i}
                onClick={() => scrollBy(dir)}
                disabled={disabled}
                className="jp-scroll-btn"
                style={{
                  width: 32, height: 32,
                  border: `1.5px solid ${disabled ? '#E5E7EB' : '#C7D2FE'}`,
                  borderRadius: 10,
                  background: disabled ? '#F9FAFB' : '#fff',
                  cursor: disabled ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: disabled ? 0.3 : 1,
                  boxShadow: disabled ? 'none' : '0 5px 14px rgba(55,93,251,.12)',
                  transition: 'opacity .15s, background .18s, border-color .18s',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={disabled ? '#9CA3AF' : '#375DFB'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points={points} />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 20, background: 'linear-gradient(to bottom, #fff 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none', opacity: atTop ? 0 : 1, transition: 'opacity .2s' }} />
        <div ref={scrollRef} style={{ height: '100%', overflowY: 'auto', padding: '0 18px', scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}>
          {articles.map((a, i) => <SideArticleRow key={a.id} article={a} index={i} isLast={i === articles.length - 1} />)}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, background: 'linear-gradient(to top, #fff 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none', opacity: atBottom ? 0 : 1, transition: 'opacity .2s' }} />
      </div>
      <div style={{ padding: '8px 18px 14px', flexShrink: 0 }}>
        <button className="voevoda-view-all voevoda-view-all--inverse" onClick={() => navigate('/journal')}
          style={{ width: '100%', padding: '9px 0', border: 'none', borderRadius: 7, background: '#375DFB', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all .15s', boxShadow: '0 2px 8px rgba(55,93,251,.28)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2D4FE0'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(55,93,251,.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#375DFB'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(55,93,251,.28)'; }}>
          Все материалы
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Leader Card ──────────────────────────────────────────────────────────────
function LeaderCard({ onOpenModal, onOpenAll }: { onOpenModal: () => void; onOpenAll: () => void }) {
  const navigate = useNavigate();
  const leader = PEOPLE.find(p => p.id === LEADER_PERSON_ID) ?? PEOPLE[0];

  const [mErr, setMErr] = useState(false);
  const [rErr, setRErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [extraHov, setExtraHov] = useState(false);

  const goToZnaki = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/achievements');
  };

  const goToChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/messages?chat=${leader.id}`);
  };

  return (
    <div
      onClick={onOpenModal}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        cursor: 'pointer',
        background: '#fff',
        borderRadius: 22,
        border: `1.5px solid ${hovered ? '#B8CAFE' : '#EAECF0'}`,
        boxShadow: hovered
          ? '0 22px 60px rgba(55,93,251,.16), 0 6px 20px rgba(0,0,0,.07)'
          : '0 2px 16px rgba(0,0,0,.07)',
        transform: hovered ? 'translateY(-7px)' : 'translateY(0)',
        transition:
          'transform .45s cubic-bezier(.22,1,.36,1), box-shadow .4s ease, border-color .25s ease',
        animation: 'jpCardIn .55s ease backwards',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Заголовок */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '15px 16px 12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4B5563"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>
            Лидеры
          </span>
        </div>

        <button
          className="voevoda-view-all voevoda-view-all--inverse"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAll();
          }}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 13px',
            background: btnHovered ? '#2D4FE0' : '#375DFB',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            color: '#fff',
            cursor: 'pointer',
            transition: 'all .25s ease',
            boxShadow: btnHovered ? '0 4px 14px rgba(55,93,251,.45)' : '0 2px 8px rgba(55,93,251,.28)',
          }}
        >
          Все
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
      </div>

      {/* Фото + знаки */}
      <div style={{ display: 'flex', gap: 10, padding: '0 14px', marginBottom: 15 }}>
        <div style={{ flex: 1, height: LEADER_PHOTO_H, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 16,
              overflow: 'hidden',
              background: '#EFF1F5',
            }}
          >
            {!mErr ? (
              <img
                src={leader.mainImage}
                alt={leader.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  objectPosition: leader.photoPosition ?? 'center center',
                  transform: hovered ? 'scale(1.06)' : 'scale(1)',
                  transition: 'transform .7s cubic-bezier(.4,0,.2,1)',
                }}
                onError={() => setMErr(true)}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#F3F4F6' }} />
            )}

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, rgba(8,10,20,.7) 0%, rgba(8,10,20,.12) 45%, transparent 75%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {!rErr && (
            <div
              style={{
                position: 'absolute',
                bottom: -8,
                right: -28,
                width: 60,
                height: 60,
                zIndex: 4,
                transform: hovered ? 'scale(1.56)' : 'scale(1.5)',
                transition: 'transform .7s cubic-bezier(.4,0,.2,1)',
                transformOrigin: 'bottom right',
              }}
            >
              <img
                src={leader.rankImage}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 3px 10px rgba(0,0,0,.55))',
                }}
                onError={() => setRErr(true)}
              />
            </div>
          )}
        </div>

        <div
          style={{
            width: LEADER_BADGE_COL_W,
            flexShrink: 0,
            alignSelf: 'flex-start',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            paddingTop: 10,
          }}
        >
          {leader.smallImages.slice(0, 3).map((src, i) => (
            <BadgeBox
              key={i}
              src={src}
              size={LEADER_BADGE_SIZE}
              tooltip={BADGE_TOOLTIPS[i]}
              topRight={i === 0 ? <ElitaBadge animate /> : undefined}
            />
          ))}

          {leader.extraCount > 0 && (
            <div
              onClick={goToZnaki}
              onMouseEnter={(e) => {
                setExtraHov(true);
                e.currentTarget.style.transform = 'scale(1.06)';
              }}
              onMouseLeave={(e) => {
                setExtraHov(false);
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{
                width: LEADER_BADGE_SIZE,
                height: LEADER_BADGE_SIZE,
                borderRadius: 12,
                background: extraHov ? 'linear-gradient(135deg,#375DFB,#7B9FFF)' : '#EBF1FF',
                border: `1.5px solid ${extraHov ? 'transparent' : '#C7D2FE'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                color: extraHov ? '#fff' : '#375DFB',
                cursor: 'pointer',
                transition: 'all .3s ease',
                boxShadow: 'none',
              }}
            >
              +{leader.extraCount}
            </div>
          )}
        </div>
      </div>

      {/* Инфо */}
      <div style={{ padding: '0 16px', flex: 1, marginBottom: 14 }}>
        <div
          style={{
            fontSize: 10,
            color: '#9CA3AF',
            marginBottom: 4,
            textTransform: 'uppercase' as const,
            letterSpacing: '.7px',
            fontWeight: 600,
          }}
        >
          {leader.rank}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 19,
              fontWeight: 800,
              color: '#0D0F14',
              cursor: 'pointer',
              letterSpacing: '-.3px',
              transition: 'color .18s',
            }}
          >
            {leader.name}
          </span>

          <IVDisplay index={leader.index} rating={leader.rating} />
        </div>

        <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.55, margin: 0 }}>
          {leader.position}
        </p>
      </div>

      {/* Кнопки */}
      <div style={{ display: 'flex', gap: 9, padding: '0 14px 15px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal();
          }}
          style={{
            flex: 1,
            background: '#375DFB',
            border: 'none',
            borderRadius: 8,
            padding: '12px 0',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 5px 18px rgba(55,93,251,.32)',
            transition: 'transform .22s ease, box-shadow .22s ease, background .22s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 26px rgba(55,93,251,.46)';
            e.currentTarget.style.background = '#1E3F9F';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 5px 18px rgba(55,93,251,.32)';
            e.currentTarget.style.background = '#375DFB';
          }}
        >
          Личное дело
        </button>

        <button
          onClick={goToChat}
          style={{
            flex: 1,
            background: '#F8F9FC',
            border: '1.5px solid #E5E7EB',
            borderRadius: 8,
            padding: '12px 0',
            color: '#374151',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all .22s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#C7D2FE';
            e.currentTarget.style.color = '#375DFB';
            e.currentTarget.style.background = '#EEF3FF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#374151';
            e.currentTarget.style.background = '#F8F9FC';
          }}
        >
          Написать в чат
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function JournalPreview() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Поток');
  const [modal, setModal] = useState<{ mode: ModalMode } | null>(null);
  const reviews = useReviewsStore((state) => state.reviews);
  const reviewArticles: Article[] = reviews.map((review) => ({
    id: 100000 + review.id,
    title: review.title,
    author: review.name,
    authorAvatar: review.image,
    date: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(review.createdAt)),
    image: '/journal-main.jpg',
    category: 'Поток' as const,
    readTime: Math.max(1, Math.ceil(review.text.length / 700)),
    stats: { views: 0, hearts: 0, jumbo: review.rating },
    excerpt: review.text.length > 20 ? (review.text.length > 220 ? review.text.slice(0, 220) + '…' : review.text) : undefined,
  }));
  const allArticles = [...reviewArticles, ...ARTICLES];

  const filtered = allArticles.filter(a => a.category === activeTab);
  const main = filtered[0];
  const sides = [
    ...filtered.slice(1),
    ...allArticles.filter(a => a.category !== activeTab).slice(0, 12),
  ];

  return (
    <>
      <section style={{ padding: isMobile ? '16px 16px 0' : '20px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 20 }}>

          {/* ── ЖУРНАЛ ── */}
          <div className="jp-card-wrap" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'jpCardIn .5s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>Журнал</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                  {TABS.map((tab, i) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`jp-tab-btn${activeTab === tab ? ' active' : ''}`}
                      style={{ padding: '7px 16px', background: activeTab === tab ? '#F3F6FF' : '#fff', border: 'none', borderRight: i < TABS.length - 1 ? '1px solid #E5E7EB' : 'none', color: activeTab === tab ? '#375DFB' : '#6B7280', fontWeight: activeTab === tab ? 600 : 400, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {tab}
                    </button>
                  ))}
                </div>
                <button className="voevoda-view-all voevoda-view-all--inverse" onClick={() => navigate('/journal')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 13px', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#fff', background: '#375DFB', cursor: 'pointer', transition: 'all .15s', boxShadow: '0 2px 8px rgba(55,93,251,.28)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#2D4FE0'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(55,93,251,.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#375DFB'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(55,93,251,.28)'; }}>
                  Все <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg>
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', flex: 1, minHeight: 0 }}>
              <div style={{ padding: '0 20px 20px', borderRight: isMobile ? 'none' : '1px solid #F0F0F0', display: 'flex', overflow: 'hidden' }}>
                {main && <MainArticle article={{ ...main, image: TAB_HERO[activeTab] ?? main.image }} />}
              </div>
              {!isMobile && (
                // Правая колонка позиционируется абсолютно, чтобы её высоту задавала
                // левая колонка (статья), а список новостей заполнял её ровно до низа —
                // без лишнего пространства под кнопкой «Все материалы».
                <div style={{ position: 'relative', minHeight: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
                    <ScrollColumn articles={sides} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── ЛИДЕРЫ ── */}
          <div style={{ display: 'flex', flexDirection: 'column', animation: 'jpCardIn .55s 80ms ease backwards' }}>
            <LeaderCard
              onOpenModal={() => setModal({ mode: { type: 'person', personId: LEADER_PERSON_ID } })}
              onOpenAll={() => setModal({ mode: { type: 'list', category: 'Преподаватели' } })}
            />
          </div>

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

