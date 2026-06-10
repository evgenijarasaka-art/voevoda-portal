import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const JOURNAL_SCROLL_KEY = 'voevoda_journal_scroll';

interface Article {
  id: number;
  category: 'Статьи' | 'Новости' | 'Блог' | 'Видео';
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  authorFollowers: string;
  date: string;
  readTime: string;
  views: string;
  likes: number;
  comments: number;
  image: string;
  tags: string[];
  featured?: boolean;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  date: string;
  likes: number;
  liked: boolean;
}

const ARTICLES: Article[] = [
  { id: 1, category: 'Статьи', title: 'Как правильно подготовиться к курсу молодого бойца: полное руководство', excerpt: 'Курс молодого бойца — это первый и важнейший этап военной подготовки. Мы расскажем, как физически и психологически подготовиться к интенсивным нагрузкам, что взять с собой и каких ошибок избежать.', author: 'Торнадо', authorAvatar: '/teacher1-main.jpg', authorFollowers: '14,2 тыс.', date: '23 марта', readTime: '8 мин', views: '121,4 тыс', likes: 2600, comments: 432, image: '/kyrs1.png', tags: ['КМБ', 'Подготовка', 'Советы'], featured: true },
  { id: 2, category: 'Новости', title: 'Открыт набор на Курс молодого бойца V5 в Москве — старт 10 мая', excerpt: 'УТЦ «Воевода» объявляет об открытии нового потока КМБ. Места ограничены — успей записаться до 30 апреля.', author: 'Редакция Воевода', authorAvatar: '/logo.png', authorFollowers: '8,7 тыс.', date: '21 марта', readTime: '2 мин', views: '45,2 тыс', likes: 890, comments: 67, image: '/voen1.png', tags: ['КМБ', 'Набор', 'Москва'] },
  { id: 3, category: 'Блог', title: 'Мой путь в ВДВ: от гражданки до десантника за 3 месяца', excerpt: 'Личный опыт прохождения КМБ и подготовки к службе в Воздушно-десантных войсках. Что меня удивило, что было тяжелее всего и как я справился.', author: 'Бек', authorAvatar: '/teacher2-main.jpg', authorFollowers: '3,1 тыс.', date: '20 марта', readTime: '12 мин', views: '88,6 тыс', likes: 3400, comments: 215, image: '/kyrs2.png', tags: ['ВДВ', 'Личный опыт', 'КМБ'] },
  { id: 4, category: 'Статьи', title: 'Тактическая медицина: 10 навыков, которые могут спасти жизнь', excerpt: 'Оказание первой помощи в боевых условиях кардинально отличается от гражданской медицины. Разбираем ключевые техники ТССС-протокола.', author: 'Коба', authorAvatar: '/teacher3-main.jpg', authorFollowers: '6,4 тыс.', date: '19 марта', readTime: '10 мин', views: '204,1 тыс', likes: 5200, comments: 381, image: '/voen2.png', tags: ['Медицина', 'ТССС', 'Навыки'] },
  { id: 5, category: 'Видео', title: 'Разбор техники стрельбы из АК-74 — урок от инструктора', excerpt: 'Инструктор Торнадо разбирает типичные ошибки при стрельбе, правильную постановку хвата и работу с прицелом.', author: 'Торнадо', authorAvatar: '/teacher1-main.jpg', authorFollowers: '14,2 тыс.', date: '18 марта', readTime: '15 мин', views: '312,8 тыс', likes: 7100, comments: 628, image: '/voen3.png', tags: ['Оружие', 'Обучение', 'АК-74'] },
  { id: 6, category: 'Новости', title: 'Результаты соревнований «Тактическое ориентирование» — Москва 2024', excerpt: 'Подводим итоги межрегионального соревнования по тактическому ориентированию.', author: 'Редакция Воевода', authorAvatar: '/logo.png', authorFollowers: '8,7 тыс.', date: '17 марта', readTime: '4 мин', views: '31,5 тыс', likes: 420, comments: 89, image: '/voen4.png', tags: ['Соревнования', 'Ориентирование', 'Результаты'] },
  { id: 7, category: 'Блог', title: 'Почему я выбрал путь инструктора: история Кобы', excerpt: 'От курсанта до главного инструктора — 8 лет пути. Рассказываю, что меня привело в педагогику.', author: 'Коба', authorAvatar: '/teacher3-main.jpg', authorFollowers: '6,4 тыс.', date: '15 марта', readTime: '9 мин', views: '67,3 тыс', likes: 1800, comments: 156, image: '/voen5.png', tags: ['Инструктор', 'История', 'Мотивация'] },
  { id: 8, category: 'Статьи', title: 'Физическая подготовка бойца: программа на 3 месяца до КМБ', excerpt: 'Детальная программа тренировок, которая подготовит вас к физическим нагрузкам курса. Бег, силовые, выносливость — всё по неделям.', author: 'Стрелок', authorAvatar: '/teacher2-main.jpg', authorFollowers: '5,9 тыс.', date: '14 марта', readTime: '14 мин', views: '156,7 тыс', likes: 4300, comments: 298, image: '/voen6.png', tags: ['Физподготовка', 'Программа', 'КМБ'] },
];

const INITIAL_COMMENTS: Record<number, Comment[]> = {
  1: [
    { id: 1, author: 'Sergeant', avatar: '/teacher2-main.jpg', text: 'Отличная статья! Особенно полезен раздел про психологическую подготовку. Сам проходил КМБ в 2022 — всё точно описано.', date: '23 марта', likes: 48, liked: false },
    { id: 2, author: 'Бек', avatar: '/teacher3-main.jpg', text: 'Добавлю от себя: очень важна правильная обувь. Берцы нужно разносить заранее.', date: '23 марта', likes: 31, liked: false },
    { id: 3, author: 'Нексус', avatar: '/logo.png', text: 'Когда записываться на следующий поток? Хочу пройти именно у Торнадо.', date: '24 марта', likes: 12, liked: false },
  ],
  2: [
    { id: 1, author: 'Волк-47', avatar: '/logo.png', text: 'Уже записался, жду старта!', date: '21 марта', likes: 22, liked: false },
    { id: 2, author: 'Торнадо', avatar: '/teacher1-main.jpg', text: 'Ждём всех! Программа обновлена, добавили новые блоки по тактической медицине.', date: '22 марта', likes: 67, liked: false },
  ],
};

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  Статьи: { bg: '#EBF1FF', text: '#375DFB' },
  Новости: { bg: '#FEF3C7', text: '#92400E' },
  Блог:    { bg: '#F0FDF4', text: '#166534' },
  Видео:   { bg: '#FEE2E2', text: '#991B1B' },
};

function IcHeart({ active = false }: { active?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? '#EF4444' : '#D1D5DB'} stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IcThumb({ color = '#D1D5DB', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.2875 5.14073L10.0608 6.37034C9.92347 6.50803 9.92303 6.7317 10.0598 6.86993C10.2925 7.10497 10.5166 7.05021 10.654 6.91253C10.5661 7.11692 10.3904 7.6271 10.3904 8.03268C10.3904 8.51692 10.5842 8.9555 10.8981 9.27436C10.3199 9.563 9.92236 10.1628 9.92236 10.8563C9.92236 11.3405 10.1162 11.7791 10.4301 12.0979C9.85188 12.3866 9.45433 12.9864 9.45433 13.6799C9.45433 14.655 10.2404 15.445 11.2094 15.445H13.0462L14.2389 15.6895C14.0446 15.6628 13.8534 15.682 13.6769 15.7391C13.8742 15.679 14.0892 15.6664 14.3057 15.7119L15.9356 16.0551C16.5886 16.1925 17.015 16.823 16.8994 17.4803C16.7812 18.1526 16.1408 18.6022 15.4683 18.485L13.8274 18.1991C13.7873 18.1921 13.7479 18.1833 13.7093 18.1728L10.1762 17.5672C9.98064 17.5307 9.62398 17.4894 9.28237 17.4498C9.0461 17.4225 8.81699 17.3959 8.65324 17.3724C8.2522 17.3147 7.82914 17.2478 7.45795 17.1764C7.07956 17.1037 6.60792 16.9651 6.60792 16.9651C6.60792 16.9651 5.77081 16.7047 5.39742 16.5476C5.14793 16.4392 4.52031 16.168 4.26625 16.0709C4.10537 16.0094 3.88391 15.9174 3.65706 15.8207C3.1816 15.618 2.94387 15.5167 2.8058 15.3077C2.66772 15.0988 2.66772 14.8353 2.66772 14.3083L2.66772 8.84776C2.66772 8.2805 2.66772 7.99687 2.8206 7.78063C2.97347 7.56439 3.23943 7.4703 3.77132 7.28214L3.77133 7.28213C3.95772 7.21619 4.13383 7.15435 4.26754 7.10832C4.77788 6.9326 5.26832 6.68651 5.67162 6.36904L9.68343 3.21107C9.71961 3.17049 9.75882 3.13176 9.80104 3.0952L11.4081 1.70339C11.9124 1.26658 12.6725 1.30921 13.1249 1.79968C13.5873 2.30109 13.5558 3.08241 13.0545 3.54499L11.4921 4.98674C11.428 5.04593 11.3594 5.09724 11.2875 5.14073ZM14.1346 13.6799C14.1346 13.0955 13.6634 12.6213 13.0816 12.6213H11.2094C10.6276 12.6213 10.1564 13.0955 10.1564 13.6799C10.1564 14.2642 10.6276 14.7385 11.2094 14.7385H13.0816C13.6634 14.7385 14.1346 14.2642 14.1346 13.6799ZM10.6244 10.8563C10.6244 11.4406 11.0956 11.9148 11.6774 11.9148H13.5496C14.1315 11.9148 14.6027 11.4405 14.6027 10.8562C14.6027 10.2752 14.1369 9.80312 13.5598 9.79764L11.6775 9.79774C11.0956 9.79768 10.6244 10.2719 10.6244 10.8563ZM12.1455 9.09127C11.5638 9.09114 11.0924 8.61696 11.0924 8.03268C11.0924 7.44832 11.5636 6.97409 12.1455 6.97409L14.017 6.9739C14.5989 6.97392 15.0701 7.44814 15.0701 8.03248C15.0701 8.61664 14.5992 9.09075 14.0176 9.09107L13.5436 9.09112L12.1455 9.09127Z" fill={color} />
    </svg>
  );
}

function CommentItem({ comment, onLike }: { comment: Comment; onLike: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #F5F5F7' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#E5E7EB', flexShrink: 0 }}>
        <img src={comment.avatar} alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#9CA3AF'; }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{comment.author}</span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{comment.date}</span>
        </div>
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.55, margin: '0 0 8px' }}>{comment.text}</p>
        <button onClick={onLike}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: comment.liked ? '#EF4444' : '#9CA3AF', fontSize: 12, padding: 0, transition: 'color .15s' }}>
          <IcHeart active={comment.liked} />
          {comment.likes + (comment.liked ? 1 : 0)}
        </button>
      </div>
    </div>
  );
}

const STYLES = `
  @keyframes ap-fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes ap-fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  .ap-hero    { animation: ap-fadeIn .5s ease; }
  .ap-content { animation: ap-fadeUp .5s .1s ease both; }
  .ap-back-btn { transition: all .2s ease !important; }
  .ap-back-btn:hover { background: #EBF1FF !important; color: #375DFB !important; border-color: #C7D2FE !important; transform: translateX(-2px); }
  .ap-action-btn { transition: all .15s ease !important; }
  .ap-action-btn:hover { background: #F3F4F6 !important; }
  .ap-tag { transition: all .15s !important; cursor: pointer; }
  .ap-tag:hover { background: rgba(55,93,251,.25) !important; transform: scale(1.05); }
  .ap-sub-btn { transition: all .15s !important; }
  .ap-sub-btn:hover { transform: scale(1.04) !important; }
  .ap-nav-btn { transition: all .2s ease !important; }
  .ap-nav-btn:hover { border-color: #C7D2FE !important; background: #F3F6FF !important; box-shadow: 0 4px 16px rgba(55,93,251,.12) !important; }
`;

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const commentsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const articleId = Number(id);
  const article = ARTICLES.find((a: Article) => a.id === articleId) ?? null;
  const articleIndex = ARTICLES.findIndex((a: Article) => a.id === articleId);
  const prevArticle: Article | null = articleIndex > 0 ? ARTICLES[articleIndex - 1] : null;
  const nextArticle: Article | null = articleIndex < ARTICLES.length - 1 ? ARTICLES[articleIndex + 1] : null;

  const [liked, setLiked] = useState(false);
  const [juked, setJuked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(
    article ? (INITIAL_COMMENTS[article.id] ?? []) : []
  );
  const [commentCount, setCommentCount] = useState<number>(article?.comments ?? 0);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);

  if (!article) {
    return (
      <div style={{ marginTop: 60, marginLeft: 56, minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>404</div>
          <div style={{ fontSize: 16, color: '#6B7280', marginBottom: 20 }}>Статья не найдена</div>
          <button onClick={() => navigate('/journal')}
            style={{ padding: '10px 24px', background: '#375DFB', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            ← В журнал
          </button>
        </div>
      </div>
    );
  }

  const cat = CAT_COLORS[article.category] ?? { bg: '#F3F4F6', text: '#374151' };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleSubmitComment = () => {
    const text = newComment.trim();
    if (!text) return;
    const next: Comment = { id: Date.now(), author: 'Вы', avatar: '/logo.png', text, date: 'Только что', likes: 0, liked: false };
    setComments((prev: Comment[]) => [...prev, next]);
    setCommentCount((prev: number) => prev + 1);
    setNewComment('');
  };

  const toggleCommentLike = (cid: number) => {
    setComments((prev: Comment[]) =>
      prev.map((x: Comment) => x.id === cid ? { ...x, liked: !x.liked } : x)
    );
  };

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ marginTop: 60, marginLeft: 56, minHeight: 'calc(100vh - 60px)', background: '#F4F5F8', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 24px 80px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <button onClick={() => navigate('/journal')} className="ap-back-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              Назад в журнал
            </button>
            <span style={{ fontSize: 12, color: '#D1D5DB' }}>/</span>
            <span style={{ background: cat.bg, color: cat.text, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
              {article.category}
            </span>
          </div>

          {/* Hero */}
          <div className="ap-hero" style={{ height: 380, borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 32 }}>
            <img src={article.image} alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#E5E7EB'; }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,.45) 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', bottom: 24, left: 28, right: 28, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {article.tags.map((tag: string) => (
                <span key={tag} className="ap-tag"
                  style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,.2)' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="ap-content" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ padding: '32px 40px 0' }}>

              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', background: '#E5E7EB', flexShrink: 0, border: '2px solid #EBF1FF' }}>
                  <img src={article.authorAvatar} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#9CA3AF'; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{article.author}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                    {article.authorFollowers} подписчиков · {article.date} · {article.readTime} чтения
                  </div>
                </div>
                <button onClick={() => setSubscribed(!subscribed)} className="ap-sub-btn"
                  style={{ padding: '9px 22px', borderRadius: 22, border: `1.5px solid ${subscribed ? '#E5E7EB' : '#375DFB'}`, background: subscribed ? '#F3F4F6' : '#375DFB', color: subscribed ? '#6B7280' : '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {subscribed ? '✓ Подписан' : 'Подписаться'}
                </button>
              </div>

              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 18, lineHeight: 1.3 }}>
                {article.title}
              </h1>
              <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.78, marginBottom: 20 }}>{article.excerpt}</p>
              <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.78, marginBottom: 20 }}>
                Военная подготовка требует комплексного подхода. Физическая форма, тактическое мышление,
                медицинские знания — всё это необходимо для успешного прохождения курса. Начинать готовиться
                следует минимум за 3 месяца до начала обучения.
              </p>
              <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.78, marginBottom: 32 }}>
                Рекомендуется развить базовые физические показатели: пробегать 3 км за 14 минут,
                подтягиваться 10 раз, отжиматься 30 раз. Психологическая устойчивость не менее важна —
                умение действовать в условиях стресса и неопределённости.
              </p>

              {/* Action bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20, paddingBottom: 24, borderTop: '1px solid #F0F0F0', flexWrap: 'wrap' }}>
                <button onClick={() => setLiked(!liked)} className="ap-action-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 24, border: `1.5px solid ${liked ? '#EF4444' : '#E5E7EB'}`, background: liked ? '#FFF1F1' : '#fff', color: liked ? '#EF4444' : '#374151', fontSize: 14, fontWeight: liked ? 600 : 400, cursor: 'pointer' }}>
                  <IcHeart active={liked} />
                  {(article.likes + (liked ? 1 : 0)).toLocaleString('ru')}
                </button>

                <button onClick={() => setJuked(!juked)} className="ap-action-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 24, border: `1.5px solid ${juked ? '#10B981' : '#E5E7EB'}`, background: juked ? '#F0FDF4' : '#fff', color: juked ? '#10B981' : '#374151', fontSize: 14, fontWeight: juked ? 600 : 400, cursor: 'pointer' }}>
                  <IcThumb color={juked ? '#10B981' : '#D1D5DB'} />
                  Полезно
                </button>

                <button onClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth' })} className="ap-action-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 24, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  {commentCount}
                </button>

                <button onClick={() => setSaved(!saved)} className="ap-action-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 24, border: `1.5px solid ${saved ? '#375DFB' : '#E5E7EB'}`, background: saved ? '#EBF1FF' : '#fff', color: saved ? '#375DFB' : '#374151', fontSize: 14, cursor: 'pointer' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? '#375DFB' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                  {saved ? 'Сохранено' : 'Сохранить'}
                </button>

                <button onClick={handleShare} className="ap-action-btn"
                  style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 24, border: `1.5px solid ${shared ? '#10B981' : '#E5E7EB'}`, background: shared ? '#F0FDF4' : '#fff', color: shared ? '#10B981' : '#374151', fontSize: 14, cursor: 'pointer' }}>
                  {shared ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      Поделиться
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Comments section */}
            <div ref={commentsRef} style={{ padding: '28px 40px 40px', borderTop: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: 0 }}>Комментарии</h3>
                <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: 13, fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}>{commentCount}</span>
              </div>

              {/* New comment input */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EBF1FF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <textarea
                    ref={inputRef}
                    value={newComment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmitComment();
                    }}
                    placeholder="Написать комментарий... (Ctrl+Enter для отправки)"
                    rows={3}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', fontSize: 14, color: '#111', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, transition: 'border-color .15s', boxSizing: 'border-box' }}
                    onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = '#375DFB')}
                    onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
                    <button onClick={() => setNewComment('')}
                      style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 13, cursor: 'pointer' }}>
                      Отмена
                    </button>
                    <button onClick={handleSubmitComment} disabled={!newComment.trim()}
                      style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: newComment.trim() ? '#375DFB' : '#E5E7EB', color: newComment.trim() ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: newComment.trim() ? 'pointer' : 'not-allowed', transition: 'all .15s' }}>
                      Отправить
                    </button>
                  </div>
                </div>
              </div>

              {comments.length > 0
                ? comments.map((c: Comment) => (
                    <CommentItem key={c.id} comment={c} onLike={() => toggleCommentLike(c.id)} />
                  ))
                : <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF', fontSize: 14 }}>Будьте первым, кто оставит комментарий</div>}
            </div>
          </div>

          {/* ─── Prev / Next navigation — FIXED ─── */}
          {(prevArticle || nextArticle) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 24 }}>
              {prevArticle ? (
                <button onClick={() => navigate(`/journal/${prevArticle.id}`)} className="ap-nav-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, cursor: 'pointer', textAlign: 'left', overflow: 'hidden', minWidth: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4, fontWeight: 500 }}>Предыдущая</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prevArticle.title}
                    </div>
                  </div>
                </button>
              ) : <div />}

              {nextArticle ? (
                <button onClick={() => navigate(`/journal/${nextArticle.id}`)} className="ap-nav-btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14, padding: '16px 20px', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, cursor: 'pointer', textAlign: 'right', overflow: 'hidden', minWidth: 0 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4, fontWeight: 500 }}>Следующая</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {nextArticle.title}
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ) : <div />}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
