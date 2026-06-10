  import { useState, useEffect, useRef } from 'react';
  import { useNavigate, useParams } from 'react-router-dom';
  import { useMediaQuery } from '../useMediaQuery';
  import { useFavoritesStore } from '../store/useFavoritesStore';
  import { ElitaBadge, IVDisplay, PEOPLE } from '../components/PeopleSection';
  import { YandexTrainingMap } from '../components/YandexTrainingMap';

  /* ─── CSS ─── */
  const CSS = `
    @keyframes fadeSlideUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
    @keyframes scaleIn     { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
    @keyframes hoverPanelIn{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    .cp-anim-section { opacity:0; transform:translateY(22px); transition:opacity .5s cubic-bezier(.4,0,.2,1),transform .5s cubic-bezier(.4,0,.2,1); }
    .cp-anim-section.visible { opacity:1; transform:translateY(0); }
    .cp-course-card {
      transform:translateZ(0);
      transform-origin:center bottom;
      transition:transform .5s cubic-bezier(.22,1,.36,1), border-color .3s ease, box-shadow .5s cubic-bezier(.22,1,.36,1);
      will-change:transform, box-shadow;
      position:relative;
      z-index:1;
    }
    .cp-course-card:hover {
      transform:translateY(-10px) scale(1.022) !important;
      border-color:#A5B4FC !important;
      box-shadow:0 28px 60px rgba(17,24,39,.16),0 12px 30px rgba(55,93,251,.2),0 0 0 1px rgba(165,180,252,.3) !important;
      z-index:30;
    }
    .cp-course-card img { transition:transform .65s cubic-bezier(.4,0,.2,1) !important; }
    .cp-course-card:hover img { transform:scale(1.08) !important; }
    .cp-hover-panel {
      position:absolute; left:-1px; right:-1px; top:calc(100% - 1px);
      background:#fff; border:1px solid #E5E7EB; border-top:none;
      border-radius:0 0 16px 16px; padding:12px 16px 14px;
      z-index:40; box-shadow:0 14px 36px rgba(55,93,251,.12),0 2px 8px rgba(0,0,0,.05);
      animation:hoverPanelIn .18s cubic-bezier(.4,0,.2,1);
    }
    .cp-person-card { transition:box-shadow .25s ease,transform .25s ease; }
    .cp-person-card:hover { box-shadow:0 8px 28px rgba(55,93,251,.10); transform:translateY(-2px); }
    .cp-person-photo { transition:transform .4s cubic-bezier(.4,0,.2,1); }
    .cp-person-card:hover .cp-person-photo { transform:scale(1.04); }
    .cp-review-card { transition:box-shadow .2s ease; }
    .cp-review-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.06); }
    .cp-letter-thumb { transition:transform .25s cubic-bezier(.4,0,.2,1),box-shadow .25s ease; cursor:pointer; }
    .cp-letter-thumb:hover { transform:scale(1.03); box-shadow:0 10px 32px rgba(0,0,0,.16); }
    .cp-tab-btn { transition:background .15s,border-color .15s,color .15s; }
    .cp-heart-btn { transition:color .15s,transform .15s; }
    .cp-heart-btn:hover { transform:scale(1.18); }
    .cp-all-btn { transition:background .15s,box-shadow .15s; }
    .cp-all-btn:hover { background:#F3F4F6!important; box-shadow:0 2px 8px rgba(0,0,0,.06); }
    .cp-plus-badge { transition:background .15s,transform .15s; }
    .cp-plus-badge:hover { background:#375DFB!important; color:#fff!important; transform:scale(1.06); }
    .cp-btn-p { transition:background .15s,transform .12s; }
    .cp-btn-p:hover { transform:translateY(-1px); }
    .cp-btn-o { transition:background .15s,border-color .15s,color .15s,transform .12s; }
    .cp-btn-o:hover { transform:translateY(-1px); background:#F9FAFB!important; }
    .cp-stat-link:hover { text-decoration:underline; }
    .cp-notify-toggle { transition:background .25s; }
  `;

  function injectCss(css: string) {
    if (document.getElementById('city-page-css')) return;
    const s = document.createElement('style'); s.id = 'city-page-css'; s.textContent = css;
    document.head.appendChild(s);
  }

  function useReveal(threshold = 0.08) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const el = ref.current; if (!el) return;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect(); }
      }, { threshold });
      obs.observe(el); return () => obs.disconnect();
    }, [threshold]);
    return ref;
  }

  /* ─── DATA ─── */
  const COURSES = [
    { id: 1, title: 'Курс молодого бойца V5',  city: 'Москва', duration: '4 месяца', price: 35000, oldPrice: null,  img: '/kyrs1.png',  desc: 'Курс молодого бойца (КМБ) является первым и обязательным этапом обучения в Системе комплексной военной подготовки.' },
    { id: 2, title: 'Общевойсковой Снайпер',   city: 'Москва', duration: '3 месяца', price: 29000, oldPrice: null,  img: '/kyrs2.png',  desc: 'Профессиональная подготовка снайперов для современных боевых условий и задач на поле боя.' },
    { id: 3, title: 'Курс молодого бойца V4',  city: 'Москва', duration: '3 месяца', price: 29000, oldPrice: 40000, img: '/kyrs3.png',  desc: 'Курс молодого бойца (КМБ) является первым и обязательным этапом обучения в Системе комплексной военной подготовки.' },
    { id: 4, title: 'Тактическая медицина',    city: 'Москва', duration: '1 месяц',  price: 15000, oldPrice: null,  img: '/voen2.png', desc: 'Оказание первой медицинской помощи в полевых и боевых условиях.' },
    { id: 5, title: 'Общевойсковой Снайпер 2', city: 'Москва', duration: '3 месяца', price: 35000, oldPrice: 40000, img: '/voen3.png', desc: 'Углублённая подготовка снайперов: тактика, маскировка, огневая выучка.' },
    { id: 6, title: 'Курс молодого бойца V5',  city: 'Москва', duration: '3 месяца', price: 35000, oldPrice: null,  img: '/voen1.png', desc: 'Базовый курс военной подготовки для всех желающих освоить военное дело.' },
  ];
  const COMMUNITIES = [
    { id: 1, logo: '/soobsh1.png', name: '«Вымпел»', subtitle: 'Создано 12 мая, 2022, Москва', active: 124, members: 2524, awards: 12, articles: 16, photos: 243 },
  ];
  const COMPETITIONS_DATA = [
    { id: 1, logo: '/soobsh3.png', name: 'Тактическое ориентирование', city: 'Санкт-Петербург', date: '5 марта, 2024', participants: 620, photos: 24, videos: 2 },
  ];
  const REVIEWS = [
    { id: 1, name: 'Коба', rank: 'Капитан', rating: 5, img: '/teacher2-main.jpg', title: 'Я получил все необходимые знания и навыки!', text: 'Курс "Общевойсковой Снайпер" — это отличная возможность получить все необходимые знания и навыки для выполнения задач на поле боя. Я рекомендую его всем, кто хочет стать высококвалифицированным снайпером. Нам известно много случаев подписания курсантами контракта с ВС РФ после КМБ и их командировку в зону боевых действий.' },
    { id: 2, name: 'Бек',  rank: 'Майор',   rating: 5, img: '/teacher1-main.jpg', title: 'Я получил все необходимые знания и навыки!', text: 'Курс "Общевойсковой Снайпер" — это отличная возможность получить все необходимые знания и навыки для выполнения задач на поле боя. Я рекомендую его всем, кто хочет стать высококвалифицированным снайпером.' },
  ];
  const LETTERS = ['/blag1.png', '/blag2.png', '/blag1.png', '/blag2.png', '/blag1.png', '/blag2.png'];
  const CITY_STATS = [
    { label: 'В строю',      value: 124842, link: false },
    { label: 'Полигоны',     value: 12,     link: true  },
    { label: 'Учения',       value: 24,     link: true  },
    { label: 'Соревнования', value: 16,     link: true  },
    { label: 'Сообщества',   value: 78,     link: true  },
    { label: 'Командиры',    value: 16,     link: true  },
    { label: 'Инструктора',  value: 22,     link: true  },
    { label: 'Наши герои',   value: 124,    link: true  },
  ];

  /* ─── ICONS ─── */
  function IcUsers()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
  function IcAward()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>; }
  function IcTarget()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>; }
  function IcStar()      { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
  function IcDoc()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
  function IcPhoto()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }
  function IcCalendar()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
  function IcVideo()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>; }
  function IcCity()      { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>; }
  function IcMap()       { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>; }
  function IcTeacher()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
  function IcCommander() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }

  /* ─── SHARED ─── */
  function AnimSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    const ref = useReveal();
    return <div ref={ref} className="cp-anim-section" style={style}>{children}</div>;
  }
  function SectionWrap({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '22px 24px', ...style }}>{children}</div>;
  }
  function SecTitle({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #F0F0F0', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{icon}<span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{title}</span></div>
        {action}
      </div>
    );
  }
  function AllBtn({ onClick }: { onClick: () => void }) {
    return (
      <button onClick={onClick} className="cp-all-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
        Все <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    );
  }
  function SocBtn({ primary, label, onClick }: { primary?: boolean; label: string; onClick?: () => void }) {
    return (
      <button onClick={onClick} className={primary ? 'cp-btn-p' : 'cp-btn-o'}
        style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: primary ? '1px solid #C7D2FE' : '1px solid #E5E7EB', background: primary ? '#EBF1FF' : '#fff', color: primary ? '#375DFB' : '#374151', fontSize: 13, fontWeight: primary ? 600 : 400, cursor: 'pointer' }}>
        {label}
      </button>
    );
  }
  function StatRow({ icon, label, value, link, last }: { icon: React.ReactNode; label: string; value: string | number; link?: boolean; last?: boolean }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: last ? 'none' : '1px solid #F0F0F0' }}>
        <span style={{ color: '#9CA3AF', flexShrink: 0, marginRight: 10 }}>{icon}</span>
        <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{label}</span>
        <span className={link ? 'cp-stat-link' : ''} style={{ fontSize: 13, fontWeight: 600, color: link ? '#375DFB' : '#111', cursor: link ? 'pointer' : 'default' }}>
          {typeof value === 'number' ? value.toLocaleString('ru') : value}
        </span>
      </div>
    );
  }
  function CardLogo({ src }: { src: string }) {
    const [err, setErr] = useState(false);
    return (
      <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
        {!err ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setErr(true)} /> : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
      </div>
    );
  }

  /* ─── COURSE CARD ─── */
  function CourseCard({ c, delay }: { c: typeof COURSES[0]; delay: number }) {
    const navigate = useNavigate();
    const [hov, setHov] = useState(false);
    const [imgErr, setImgErr] = useState(false);
    const { toggle, has } = useFavoritesStore();
    const faved = has(c.id + 2000, 'course');
    return (
      <div className="cp-course-card"
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        onClick={() => navigate('/courses')}
        style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'visible', cursor: 'pointer', animation: `fadeSlideUp 0.45s cubic-bezier(.4,0,.2,1) ${delay}ms both` }}>
        <div style={{ height: 200, overflow: 'hidden', background: '#F3F4F6', borderRadius: '16px 16px 0 0', position: 'relative' }}>
          {!imgErr
            ? <img src={c.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1)' }} onError={() => setImgErr(true)} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#EBF1FF,#DFE8FF)' }} />}
          {c.oldPrice && <div style={{ position: 'absolute', top: 10, left: 10, background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>СКИДКА</div>}
        </div>
        <div style={{ padding: '14px 16px', background: '#fff', borderRadius: hov ? 0 : '0 0 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9CA3AF', marginBottom: 7 }}>
            <span>{c.city}</span><span>{c.duration}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.35, marginBottom: 10 }}>{c.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#10B981' }}>{c.price.toLocaleString('ru')} <span style={{ fontSize: 13 }}>₽</span></span>
            {c.oldPrice && <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>{(c.oldPrice as number).toLocaleString('ru')} ₽</span>}
            <button className="cp-heart-btn"
              onClick={e => { e.stopPropagation(); toggle({ id: c.id + 2000, kind: 'course', title: c.title, city: c.city, duration: c.duration, price: c.price, format: 'Оффлайн', image: c.img }); }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: faved ? '#EF4444' : '#D1D5DB', padding: 2 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={faved ? '#EF4444' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
        </div>
        {hov && (
          <div className="cp-hover-panel" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{c.desc}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={e => { e.stopPropagation(); navigate('/checkout', { state: { title: c.title, amount: c.price } }); }} style={{ width: 46, height: 46, background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.background = '#DFE8FF')} onMouseLeave={e => (e.currentTarget.style.background = '#EBF1FF')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </button>
              <button className="cp-btn-p" onClick={e => { e.stopPropagation(); navigate('/courses'); }}
                style={{ flex: 1, height: 46, background: '#375DFB', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Записаться и оплатить
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── PERSON CARD ─── */

  /* Адаптивный бейдж — размер определяется grid-ячейкой, не фиксированными px */
  function RBadge({ src, label, onClick }: { src?: string; label?: string; onClick?: (e: React.MouseEvent) => void }) {
    const [err, setErr] = useState(false);
    return (
      <div onClick={onClick} style={{
        aspectRatio: '1 / 1', width: '100%', borderRadius: 12,
        background: label ? '#EBF1FF' : '#F9FAFB',
        border: `1px solid ${label ? '#C7D2FE' : '#E5E7EB'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background .15s, transform .15s',
        overflow: 'hidden',
      }}
        className={label ? 'cp-plus-badge' : ''}>
        {label
          ? <span style={{ fontSize: 'clamp(11px, 1.5vw, 15px)', fontWeight: 700, color: '#375DFB' }}>{label}</span>
          : src && !err
            ? <img src={src} alt="" style={{ width: '82%', height: '82%', objectFit: 'contain' }} onError={() => setErr(true)} />
            : <div style={{ width: '50%', height: '50%', borderRadius: '50%', background: '#E5E7EB' }} />}
      </div>
    );
  }

  function PersonCard({ person, extraButtons }: { person: typeof PEOPLE[0]; extraButtons?: boolean }) {
    const navigate = useNavigate();
    const [mErr, setMErr] = useState(false);
    const [rErr, setRErr] = useState(false);
    const badges = person.smallImages;
    const goToBadges = (e: React.MouseEvent) => { e.stopPropagation(); navigate('/my-path', { state: { scrollTo: 'diplom' } }); };

    return (
      <div className="cp-person-card" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: 18, display: 'flex', flexDirection: 'column' }}>
        {/* Верхний блок */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>

          {/* Фото — 48% ширины карточки, aspect 3/4 */}
          <div style={{ position: 'relative', flex: '0 0 48%' }}>
            <div style={{ width: '100%', paddingBottom: '133%', position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
              {!mErr
                ? <img src={person.mainImage} alt={person.name}
                    className="cp-person-photo"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={() => setMErr(true)} />
                : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#EBF1FF,#DFE8FF)' }} />}
            </div>
            {/* Погоны */}
            {!rErr && (
              <div style={{ position: 'absolute', bottom: -8, right: -8, width: 52, height: 52, zIndex: 3 }}>
                <img src={person.rankImage} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 3px 10px rgba(0,0,0,.5))' }}
                  onError={() => setRErr(true)} />
              </div>
            )}
          </div>

          {/* Правая колонка: ЭЛИТА + сетка бейджей 2×3 — 100% ширины остатка */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', paddingTop: 28 }}>
            {/* ЭЛИТА по центру сверху */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 10, whiteSpace: 'nowrap' as const }}>
              <ElitaBadge small />
            </div>
            {/* Grid 2 колонки, каждая ячейка — квадрат через aspectRatio */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, width: '100%' }}>
              <RBadge src={badges[0]} />
              <RBadge src={badges[1]} />
              <RBadge src={badges[2]} />
              <RBadge src={badges[3] ?? badges[0]} />
              <RBadge src={badges[4] ?? badges[0]} />
              <RBadge label={`+${person.extraCount}`} onClick={goToBadges} />
            </div>
          </div>
        </div>

        {/* Мета */}
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 3 }}>{person.rank}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' as const }}>
          <span style={{ fontSize: 19, fontWeight: 800, color: '#111', cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')}
            onMouseLeave={e => (e.currentTarget.style.color = '#111')}
            onClick={() => navigate('/profile')}>
            {person.name}
          </span>
          <IVDisplay index={person.index} rating={person.rating} />
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.45, marginBottom: 16 }}>{person.position}</div>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <button className="cp-btn-p" onClick={() => navigate('/profile')}
            style={{ flex: 1, padding: '10px 0', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 12, color: '#375DFB', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Личное дело
          </button>
          <button className="cp-btn-o" onClick={() => navigate('/messages?chat=1')}
            style={{ flex: 1, padding: '10px 0', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, color: '#374151', fontSize: 13, cursor: 'pointer' }}>
            Написать в чат
          </button>
          {extraButtons && (
            <button className="cp-btn-o" onClick={() => navigate('/profile')}
              style={{ flex: 1, padding: '10px 0', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, color: '#374151', fontSize: 13, cursor: 'pointer' }}>
              Видео-визитка
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ═══ PAGE ═══════════════════════════════════════════════════════════ */
  export function CityPage() {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const isMobile = useMediaQuery('(max-width: 900px)');
    const [notify, setNotify] = useState(true);
    const [heroErr, setHeroErr] = useState(false);
    const [img1Err, setImg1Err] = useState(false);
    const [img2Err, setImg2Err] = useState(false);
    const [letterModal, setLetterModal] = useState<string | null>(null);
    const [imgErrs, setImgErrs] = useState<Record<string, boolean>>({});
    const setE = (k: string) => setImgErrs(p => ({ ...p, [k]: true }));
    const [viewMode, setViewMode] = useState<'all' | 'series'>('all');
    const [month, setMonth] = useState('Октябрь');
    const MONTHS = ['Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const mIdx = MONTHS.indexOf(month);

    useEffect(() => { injectCss(CSS); }, []);

    // Ровно 1 человек на каждую из 4 секций
    const leader    = PEOPLE[0];
    const inService = PEOPLE[1] ?? PEOPLE[0];
    const teacher   = PEOPLE.find(p => p.category === 'Преподаватели') ?? PEOPLE[0];
    const commander = PEOPLE.find(p => p.category === 'Командиры') ?? PEOPLE[0];

    const cityName = slug
      ? decodeURIComponent(slug).replace(/^(.)/, c => c.toUpperCase())
      : 'Москва';

    return (
      <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F8F9FB' }}>
        {/* ── ШАПКА ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, position: 'sticky', top: 60, zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IcCity />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Город</h1>
          </div>
          <button className="cp-btn-o" onClick={() => navigate('/messages?chat=7')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Связаться с представителем
          </button>
        </div>

        <div style={{ padding: '20px 28px 48px' }}>
          {/* Хлебные крошки */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9CA3AF', marginBottom: 24, animation: 'fadeIn 0.4s ease' }}>
            {[['Главная', '/'], ['Военная подготовка', '/courses'], ['Город', null], [cityName, null]].map(([label, path], i, arr) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {path
                  ? <span onClick={() => navigate(path as string)} style={{ cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}>{label}</span>
                  : <span style={{ color: i === arr.length - 1 ? '#374151' : '#9CA3AF', fontWeight: i === arr.length - 1 ? 500 : 400 }}>{label}</span>}
                {i < arr.length - 1 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>}
              </span>
            ))}
          </div>

          {/* ══ HERO BLOCK ══ */}
          <AnimSection style={{ marginBottom: 24 }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '24px 28px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 28 }}>
              {/* Левая часть */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Герб + название */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 76, height: 76, borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB', flexShrink: 0, background: '#F3F4F6' }}>
                    {!heroErr
                      ? <img src="/всадник.png" alt="Герб" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setHeroErr(true)} />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#EBF1FF,#DFE8FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcCity /></div>}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', margin: '0 0 4px' }}>{cityName}</h2>
                    <div style={{ fontSize: 14, color: '#6B7280' }}>Центральный Федеральный Округ</div>
                  </div>
                </div>

                {/* Статистика */}
                <div style={{ background: '#F9FAFB', borderRadius: 14, border: '1px solid #E5E7EB', padding: '0 16px' }}>
                  {CITY_STATS.map((s, i) => (
                    <StatRow key={i} icon={<IcStar />} label={s.label} value={s.value} link={s.link} last={i === CITY_STATS.length - 1} />
                  ))}
                </div>

                {/* Уведомления */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: '#F0F4FF', borderRadius: 14, border: '1px solid #C7D2FE' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#375DFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>Уведомлять о предстоящих мероприятиях</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Придёт на почту voevoda@yandex.ru</div>
                  </div>
                  <div onClick={() => setNotify(!notify)} className="cp-notify-toggle"
                    style={{ width: 44, height: 24, borderRadius: 12, background: notify ? '#375DFB' : '#D1D5DB', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 3, left: notify ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .2s cubic-bezier(.4,0,.2,1)' }} />
                  </div>
                </div>
              </div>

              {/* Правая часть — 2 фото фиксированной высоты */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ borderRadius: 16, overflow: 'hidden', height: 224, background: '#F3F4F6', flexShrink: 0 }}>
                  {!img1Err
                    ? <img src="/москва.png" alt="Москва" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setImg1Err(true)} />
                    : <div style={{ height: '100%', background: 'linear-gradient(135deg,#EBF1FF,#DFE8FF)' }} />}
                </div>
                <div style={{ borderRadius: 16, overflow: 'hidden', height: 224, background: '#F3F4F6', flexShrink: 0 }}>
                  {!img2Err
                    ? <img src="/царьпушка.png" alt="Царь-пушка" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setImg2Err(true)} />
                    : <div style={{ height: '100%', background: 'linear-gradient(135deg,#F0FDF4,#D1FAE5)' }} />}
                </div>
              </div>
            </div>
          </AnimSection>

          {/* ══ ВОЕННАЯ ПОДГОТОВКА ══ */}
          <AnimSection style={{ marginBottom: 24, position: 'relative', zIndex: 10 }}>
            <SectionWrap>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18, borderBottom: '1px solid #F0F0F0', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Военная подготовка</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
                  <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                    {(['all', 'series'] as const).map((v, i) => (
                      <button key={v} className="cp-tab-btn" onClick={() => setViewMode(v)}
                        style={{ padding: '8px 16px', border: 'none', fontSize: 13, fontWeight: viewMode === v ? 600 : 400, background: viewMode === v ? '#F3F4F6' : '#fff', color: viewMode === v ? '#111' : '#6B7280', cursor: 'pointer', borderRight: i === 0 ? '1px solid #E5E7EB' : 'none' }}>
                        {v === 'all' ? 'Все курсы' : 'Серии курсов'}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                    <button onClick={() => setMonth(MONTHS[Math.max(0, mIdx - 1)])} style={{ padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 4px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#111', minWidth: 74, textAlign: 'center' as const }}>{month}</span>
                    </div>
                    <button onClick={() => setMonth(MONTHS[Math.min(MONTHS.length - 1, mIdx + 1)])} style={{ padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                  <button className="cp-btn-o" onClick={() => setViewMode(viewMode === 'all' ? 'series' : 'all')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                    Фильтры
                  </button>
                </div>
              </div>
              {/* overflow: visible + paddingBottom чтобы hover-панель не обрезалась */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20, overflow: 'visible', paddingBottom: 130, marginBottom: -106 }}>
                {COURSES.map((c, i) => <CourseCard key={c.id} c={c} delay={i * 60} />)}
              </div>
            </SectionWrap>
          </AnimSection>

          {/* ══ СООБЩЕСТВА + СОРЕВНОВАНИЯ ══ */}
          <AnimSection style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
              <SectionWrap>
                <SecTitle icon={<IcUsers />} title="Сообщества" action={<AllBtn onClick={() => navigate('/communities')} />} />
                {COMMUNITIES.map(c => (
                  <div key={c.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <CardLogo src={c.logo} />
                      <div><div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 2 }}>{c.name}</div><div style={{ fontSize: 12, color: '#9CA3AF' }}>{c.subtitle}</div></div>
                    </div>
                    <StatRow icon={<IcUsers />} label="В строю" value={c.active} />
                    <StatRow icon={<IcUsers />} label="Участников" value={c.members.toLocaleString('ru')} />
                    <StatRow icon={<IcAward />} label="Наград" value={c.awards} />
                    <StatRow icon={<IcDoc />} label="Статьи" value={c.articles} link />
                    <StatRow icon={<IcPhoto />} label="Фотографии" value={c.photos} link last />
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <SocBtn primary label="Подробнее" onClick={() => navigate('/communities')} />
                      <SocBtn label="Подать заявку" onClick={() => navigate('/communities')} />
                    </div>
                  </div>
                ))}
              </SectionWrap>
              <SectionWrap>
                <SecTitle icon={<IcTarget />} title="Соревнования" action={<AllBtn onClick={() => navigate('/competitions')} />} />
                {COMPETITIONS_DATA.map(c => (
                  <div key={c.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <CardLogo src={c.logo} />
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{c.name}</div>
                    </div>
                    <StatRow icon={<IcCity />} label="Город" value={c.city} />
                    <StatRow icon={<IcCalendar />} label="Дата" value={c.date} />
                    <StatRow icon={<IcUsers />} label="Участников" value={c.participants} />
                    <StatRow icon={<IcPhoto />} label="Фотографии" value={c.photos} link />
                    <StatRow icon={<IcVideo />} label="Видео" value={c.videos} link last />
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <SocBtn primary label="Подробнее" onClick={() => navigate('/competitions')} />
                      <SocBtn label="Участники" onClick={() => navigate('/competitions')} />
                    </div>
                  </div>
                ))}
              </SectionWrap>
            </div>
          </AnimSection>

          {/* ══ 4 СЕКЦИИ ЛЮДЕЙ — сетка 2×2, по 1 человеку в каждой ══ */}
          <AnimSection style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
              {/* Лидеры города — 2 кнопки */}
              <SectionWrap>
                <SecTitle icon={<IcAward />} title="Лидеры города" action={<AllBtn onClick={() => navigate('/leaders')} />} />
                <PersonCard person={leader} extraButtons={false} />
              </SectionWrap>

              {/* В строю — 2 кнопки */}
              <SectionWrap>
                <SecTitle icon={<IcUsers />} title="В строю" action={<AllBtn onClick={() => navigate('/profile')} />} />
                <PersonCard person={inService} extraButtons={false} />
              </SectionWrap>

              {/* Преподаватели — 3 кнопки */}
              <SectionWrap>
                <SecTitle icon={<IcTeacher />} title="Преподаватели" action={<AllBtn onClick={() => navigate('/teachers')} />} />
                <PersonCard person={teacher} extraButtons={true} />
              </SectionWrap>

              {/* Командиры — 3 кнопки */}
              <SectionWrap>
                <SecTitle icon={<IcCommander />} title="Командиры" action={<AllBtn onClick={() => navigate('/commanders')} />} />
                <PersonCard person={commander} extraButtons={true} />
              </SectionWrap>
            </div>
          </AnimSection>

          {/* ══ КАРТА ══ */}
          <AnimSection style={{ marginBottom: 24 }}>
            <SectionWrap>
              <SecTitle icon={<IcMap />} title="Место проведения занятий" />
              <YandexTrainingMap variant="city" height={460} />
            </SectionWrap>
          </AnimSection>

          {/* ══ ОТЗЫВЫ ══ */}
          <AnimSection style={{ marginBottom: 24 }}>
            <SectionWrap>
              <SecTitle
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                title="Отзывы"
                action={<button className="cp-btn-o" onClick={() => document.querySelector('.cp-review-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/></svg>
                  По дате
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>}
              />
              {REVIEWS.map((r, i) => (
                <div key={r.id} className="cp-review-card" style={{ padding: '22px 0', borderBottom: i < REVIEWS.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '2px solid #E5E7EB' }}>
                      {!imgErrs[`rev${r.id}`] ? <img src={r.img} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setE(`rev${r.id}`)} /> : null}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
                      <span style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>{r.name}</span>
                      <span style={{ fontSize: 14, color: '#9CA3AF' }}>{r.rank}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{r.rating} баллов</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '16px 20px', border: '1px solid #F0F0F0' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 8 }}>{r.title}</div>
                    <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{r.text}</div>
                  </div>
                </div>
              ))}
            </SectionWrap>
          </AnimSection>

          {/* ══ БЛАГОДАРСТВЕННЫЕ ПИСЬМА ══ */}
          <AnimSection>
            <SectionWrap>
              <SecTitle
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>}
                title="Благодарственные письма"
              />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
                {LETTERS.map((src, i) => (
                  <div key={i} className="cp-letter-thumb" onClick={() => setLetterModal(src)} style={{ borderRadius: 12, overflow: 'hidden' }}>
                    {!imgErrs[`lt${i}`]
                      ? <img src={src} alt="" style={{ width: '100%', display: 'block' }} onError={() => setE(`lt${i}`)} />
                      : <div style={{ height: 200, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>Документ</div>}
                  </div>
                ))}
              </div>
            </SectionWrap>
          </AnimSection>
        </div>

        {/* ── МОДАЛ ПИСЬМА ── */}
        {letterModal && (
          <div onClick={() => setLetterModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, animation: 'fadeIn 0.2s ease', backdropFilter: 'blur(4px)' }}>
            <div onClick={e => e.stopPropagation()} style={{ maxWidth: 800, width: '100%', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 28px 70px rgba(0,0,0,.3)', animation: 'scaleIn 0.22s cubic-bezier(.4,0,.2,1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F0F0F0' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Благодарственное письмо</span>
                <button onClick={() => setLetterModal(null)} style={{ background: '#F3F4F6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')} onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}>×</button>
              </div>
              <div style={{ background: '#F3F4F6', padding: 12 }}>
                <img src={letterModal} alt="" style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block', borderRadius: 8 }} />
              </div>
              <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="cp-btn-p" onClick={() => {
                  const url = URL.createObjectURL(new Blob(['Демонстрационное благодарственное письмо портала ВОЕВОДА'], { type: 'text/plain;charset=utf-8' }));
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'blagodarstvennoe-pismo.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }} style={{ background: '#375DFB', border: 'none', borderRadius: 10, padding: '10px 24px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Скачать</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

