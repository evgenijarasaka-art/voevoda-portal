  import { useState, useEffect, useRef } from 'react';
  import { useLocation, useNavigate, useParams } from 'react-router-dom';
  import { useMediaQuery } from '../useMediaQuery';
  import { ElitaBadge, IVDisplay, PEOPLE, PeopleSection } from '../components/PeopleSection';
  import { BottomSection } from '../components/BottomSection';
  import { Courses } from '../components/Courses';
  import { ProfessionalCourses } from '../components/ProfessionalCourses';
  import { YandexTrainingMap } from '../components/YandexTrainingMap';
  import { useNotifStore } from '../store/useNotifStore';
  import { userProfilePath } from '../api/testApi';
  import { PortalBreadcrumb } from '../components/PortalBreadcrumb';

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
    .cp-course-card img { object-position:center top; transition:transform .65s cubic-bezier(.4,0,.2,1) !important; }
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
    .cp-chev { transition:transform .22s cubic-bezier(.22,1,.36,1); }
    .cp-chev:hover { transform:scale(1.07); }
    .cp-btn-p { transition:background .15s,transform .12s; }
    .cp-btn-p:hover { transform:translateY(-1px); }
    .cp-btn-o { transition:background .15s,border-color .15s,color .15s,transform .12s; }
    .cp-btn-o:hover { transform:translateY(-1px); background:#F9FAFB!important; }
    .cp-stat-link:hover { text-decoration:underline; }
    .city-stat-row { transition:background .16s ease, transform .16s ease, border-color .16s ease; }
    .city-stat-row[role="button"]:hover { background:#F3F6FF; transform:translateX(2px); }
    .city-stat-icon { transition:background .16s ease, color .16s ease; }
    .city-stat-row[role="button"]:hover .city-stat-icon { background:#E6EDFF !important; color:#375DFB !important; }
    .cp-notify-toggle { transition:background .25s; }
    .cl-review { transition:transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
    .cl-review:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(55,93,251,.12); border-color:#C7D2FE !important; }
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
  const COMMUNITIES = [
    { id: 1, logo: '/soobsh1.png', name: '«Вымпел»', subtitle: 'Создано 12 мая, 2022, Москва', active: 124, members: 2524, awards: 12, articles: 16, photos: 243 },
  ];
  const COMPETITIONS_DATA = [
    { id: 1, logo: '/soobsh3.png', name: 'Тактическое ориентирование', city: 'Санкт-Петербург', date: '5 марта, 2024', participants: 620, photos: 24, videos: 2 },
  ];
  const LETTERS = ['/blag1.png', '/blag2.png', '/blag1.png', '/blag2.png', '/blag1.png', '/blag2.png'];
  const LANDING_REVIEWS = [
    { id: 1, name: 'Коба', rank: 'Капитан', rating: 5, img: '/teacher2-main.jpg', title: 'Полевые занятия — сильнейшая часть курса', text: 'Инструкторы не дают спрятаться за теорией: каждый приём закрепляется на практике. После курса спокойнее оцениваю обстановку и увереннее работаю в группе.', date: '18 июня 2026' },
    { id: 2, name: 'Бек', rank: 'Майор', rating: 5, img: '/teacher1-main.jpg', title: 'Системная подготовка без лишней воды', text: 'Материал собран последовательно — от базы до сложных сценариев. Особенно ценны разборы после упражнений и честная обратная связь.', date: '11 июня 2026' },
    { id: 3, name: 'Стрелок', rank: 'Старший лейтенант', rating: 4.9, img: '/sold1.png', title: 'Стало понятно, над чем работать дальше', text: 'Получил новые навыки и понятный план самостоятельной подготовки. Хорошая нагрузка, сильная команда и отличная организация.', date: '2 июня 2026' },
    { id: 4, name: 'Нексус', rank: 'Лейтенант', rating: 5, img: '/teacher3-main.jpg', title: 'Курс, который собирает команду', text: 'Здесь быстро учишься слышать напарника и отвечать за общий результат. Редкое сочетание дисциплины и живой атмосферы.', date: '27 мая 2026' },
  ];
  const CITY_STATS = [
    { label: 'В строю',      value: 124842, link: true, to: '/leaders',       icon: 'users' },
    { label: 'Полигоны',     value: 12,     link: true, to: '#map',           icon: 'map' },
    { label: 'Учения',       value: 24,     link: true, to: '/exercises',     icon: 'target' },
    { label: 'Соревнования', value: 16,     link: true, to: '/competitions',  icon: 'trophy' },
    { label: 'Сообщества',   value: 78,     link: true, to: '/communities',   icon: 'community' },
    { label: 'Командиры',    value: 16,     link: true, to: '/commanders',    icon: 'shield' },
    { label: 'Инструктора',  value: 22,     link: true, to: '/teachers',      icon: 'instructor' },
    { label: 'Наши герои',   value: 124,    link: true, to: '/leaders',       icon: 'medal' },
  ];

  /* ─── ICONS ─── */
  function IcUsers()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
  function IcAward()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>; }
  function IcTarget()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>; }
  function IcDoc()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
  function IcPhoto()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }
  function IcCalendar()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
  function IcVideo()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>; }
  function IcCity()      { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>; }
  function IcMap()       { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>; }
  function IcTeacher()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
  function IcCommander() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
  function CityStatIcon({ type }: { type: string }) {
    const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    if (type === 'users') return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.7"/><path d="M16 3.3a4 4 0 0 1 0 7.4"/></svg>;
    if (type === 'map') return <svg {...common}><path d="M12 21s7-5.1 7-12a7 7 0 0 0-14 0c0 6.9 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/></svg>;
    if (type === 'target') return <svg {...common}><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>;
    if (type === 'trophy') return <svg {...common}><path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3M12 12v5M9 21h6M10 17h4"/></svg>;
    if (type === 'community') return <svg {...common}><path d="M7 20v-2.2A3.8 3.8 0 0 1 10.8 14h2.4a3.8 3.8 0 0 1 3.8 3.8V20"/><circle cx="12" cy="8" r="3.2"/><path d="M4 17v-1.2A3.2 3.2 0 0 1 7.2 12M20 17v-1.2A3.2 3.2 0 0 0 16.8 12"/></svg>;
    if (type === 'shield') return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9.5 12.2 11.3 14l3.6-4"/></svg>;
    if (type === 'instructor') return <svg {...common}><path d="M3 6h18"/><path d="M4 6v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6"/><path d="M9 11h6M9 15h4"/><path d="M8 3h8v3H8z"/></svg>;
    return <svg {...common}><circle cx="12" cy="8" r="5"/><path d="m8.8 12.5-1.4 8 4.6-2.8 4.6 2.8-1.4-8"/><path d="M10 8l1.4 1.4L14.5 6"/></svg>;
  }

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
      <button onClick={onClick} className="cp-all-btn voevoda-view-all" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
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
  function StatRow({ icon, label, value, link, last, onClick }: { icon: React.ReactNode; label: string; value: string | number; link?: boolean; last?: boolean; onClick?: () => void }) {
    return (
      <div
        className="city-stat-row"
        onClick={onClick}
        onKeyDown={(event) => {
          if (!onClick) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        style={{ display: 'flex', alignItems: 'center', minHeight: 46, padding: '0 10px', borderBottom: last ? 'none' : '1px solid #EEF1F5', borderRadius: 10, cursor: onClick ? 'pointer' : 'default', outline: 'none' }}
      >
        <span className="city-stat-icon" style={{ width: 32, height: 32, borderRadius: 10, background: '#F3F6FF', color: '#7A869A', display: 'grid', placeItems: 'center', flexShrink: 0, marginRight: 12 }}>{icon}</span>
        <span style={{ fontSize: 14, color: '#374151', flex: 1, fontWeight: 500 }}>{label}</span>
        <span className={link ? 'cp-stat-link' : ''} style={{ fontSize: 14, fontWeight: 800, color: link ? '#375DFB' : '#111', cursor: link ? 'pointer' : 'default' }}>
          {typeof value === 'number' ? value.toLocaleString('ru') : value}
        </span>
        {onClick && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9AA5BA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8, flexShrink: 0 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
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
    const goToBadges = (e: React.MouseEvent) => { e.stopPropagation(); navigate('/achievements'); };

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

          {/* Правая колонка: сетка шевронов */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Grid 2 колонки, каждая ячейка — квадрат через aspectRatio */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, width: '100%' }}>
              <div className="cp-chev" style={{ position:'relative', minWidth:0 }}>
                <RBadge src={badges[0]} />
                <div style={{ position:'absolute', top:-7, right:-7, zIndex:10, pointerEvents:'none' }}><ElitaBadge small /></div>
              </div>
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
          <span style={{ fontSize: 19, fontWeight: 800, color: '#111', cursor: 'pointer' }}
            onClick={() => navigate(userProfilePath(person.name))}>
            {person.name}
          </span>
          <IVDisplay index={person.index} rating={person.rating} />
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.45, marginBottom: 16 }}>{person.position}</div>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <button className="cp-btn-p" onClick={() => navigate(userProfilePath(person.name))}
            style={{ flex: 1, padding: '10px 0', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 12, color: '#375DFB', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Личное дело
          </button>
          <button className="cp-btn-o" onClick={() => navigate('/messages?chat=1')}
            style={{ flex: 1, padding: '10px 0', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, color: '#374151', fontSize: 13, cursor: 'pointer' }}>
            Написать в чат
          </button>
          {extraButtons && (
            <button className="cp-btn-o" onClick={() => navigate(userProfilePath(person.name))}
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
    const location = useLocation();
    const { slug } = useParams<{ slug: string }>();
    const isMobile = useMediaQuery('(max-width: 900px)');
    const addNotif = useNotifStore((state) => state.add);
    const [notify, setNotify] = useState(false);
    const [heroErr, setHeroErr] = useState(false);
    const [img1Err, setImg1Err] = useState(false);
    const [img2Err, setImg2Err] = useState(false);
    const [letterIdx, setLetterIdx] = useState<number | null>(null);
    const [imgErrs, setImgErrs] = useState<Record<string, boolean>>({});
    const setE = (k: string) => setImgErrs(p => ({ ...p, [k]: true }));
    useEffect(() => { injectCss(CSS); }, []);
    useEffect(() => {
      if (letterIdx === null) return;
      const handler = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setLetterIdx(null);
        if (event.key === 'ArrowLeft' && letterIdx > 0) setLetterIdx((index) => (index ?? 0) - 1);
        if (event.key === 'ArrowRight' && letterIdx < LETTERS.length - 1) setLetterIdx((index) => (index ?? 0) + 1);
      };
      window.addEventListener('keydown', handler);
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handler);
        document.body.style.overflow = previousOverflow;
      };
    }, [letterIdx]);

    // Ровно 1 человек на каждую из 4 секций
    const leader    = PEOPLE[0];
    const inService = PEOPLE[1] ?? PEOPLE[0];
    const teacher   = PEOPLE.find(p => p.category === 'Преподаватели') ?? PEOPLE[0];
    const commander = PEOPLE.find(p => p.category === 'Командиры') ?? PEOPLE[0];

    const cityName = slug
      ? decodeURIComponent(slug).replace(/^(.)/, c => c.toUpperCase())
      : 'Москва';
    const track: 'military' | 'professional' = new URLSearchParams(location.search).get('track') === 'professional' ? 'professional' : 'military';
    const parentLabel = track === 'professional' ? 'Профессиональная подготовка' : 'Военная подготовка';
    const parentPath = track === 'professional' ? '/professional' : '/courses';
    const citySectionBleed = isMobile ? -16 : -24;
    const goToCityStat = (to?: string) => {
      if (!to) return;
      if (to === '#map') {
        document.getElementById('city-map-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      navigate(to);
    };
    const toggleNotifications = () => {
      setNotify((enabled) => {
        const next = !enabled;
        addNotif({
          kind: 'system',
          title: next ? `Уведомления ${cityName} включены` : `Уведомления ${cityName} отключены`,
          body: next
            ? `Мы пришлём события, старты курсов и учения по городу ${cityName}.`
            : `Вы больше не будете получать напоминания по городу ${cityName}.`,
          link: `/city/${encodeURIComponent(cityName)}${track === 'professional' ? '?track=professional' : ''}`,
        });
        return next;
      });
    };

    return (
      <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F8F9FB' }}>
        <div style={{ padding: '20px 28px 48px' }}>
          <PortalBreadcrumb items={[{ label:'Главная', to:'/' }, { label:parentLabel, to:parentPath }, { label:'Города' }]} />

          {/* ══ HERO BLOCK ══ */}
          <AnimSection style={{ marginBottom: 24 }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '24px 28px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 28, alignItems: 'stretch' }}>
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
                <div style={{ background: '#FBFCFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 8, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.8)' }}>
                  {CITY_STATS.map((s, i) => (
                    <StatRow key={i} icon={<CityStatIcon type={s.icon} />} label={s.label} value={s.value} link={s.link} last={i === CITY_STATS.length - 1} onClick={s.link ? () => goToCityStat(s.to) : undefined} />
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
                  <div
                    onClick={toggleNotifications}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleNotifications();
                      }
                    }}
                    role="switch"
                    tabIndex={0}
                    aria-checked={notify}
                    className="cp-notify-toggle"
                    style={{ width: 44, height: 24, borderRadius: 12, background: notify ? '#375DFB' : '#D1D5DB', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 3, left: notify ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .2s cubic-bezier(.4,0,.2,1)' }} />
                  </div>
                </div>
              </div>

              {/* Правая часть — 2 фото фиксированной высоты */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ borderRadius: 16, overflow: 'hidden', height: isMobile ? 220 : 260, background: '#F3F4F6', flexShrink: 0 }}>
                  {!img1Err
                    ? <img src="/москва.png" alt="Москва" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setImg1Err(true)} />
                    : <div style={{ height: '100%', background: 'linear-gradient(135deg,#EBF1FF,#DFE8FF)' }} />}
                </div>
                <div style={{ borderRadius: 16, overflow: 'hidden', height: isMobile ? 220 : 260, background: '#F3F4F6', flexShrink: 0 }}>
                  {!img2Err
                    ? <img src="/царьпушка.png" alt="Царь-пушка" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setImg2Err(true)} />
                    : <div style={{ height: '100%', background: 'linear-gradient(135deg,#F0FDF4,#D1FAE5)' }} />}
                </div>
              </div>
            </div>
          </AnimSection>

          {/* ══ КУРСЫ ПОДГОТОВКИ — блок с главной 1 в 1 ══ */}
          <div style={{ margin: `0 ${isMobile ? -16 : -24}px 24px` }}>
            {track === 'professional' ? <ProfessionalCourses /> : <Courses />}
          </div>

          {/* ══ СООБЩЕСТВА + СОРЕВНОВАНИЯ + ГОРОДА — как на главной ══ */}
          <AnimSection style={{ margin: `0 ${citySectionBleed}px 24px` }}>
            <BottomSection />
          </AnimSection>

          {/* ══ ЛЮДИ — как на главной ══ */}
          <AnimSection style={{ margin: `0 ${citySectionBleed}px 24px` }}>
            <PeopleSection />
          </AnimSection>

          {/* ══ КАРТА ══ */}
          <AnimSection style={{ marginBottom: 24 }}>
            <div id="city-map-section" />
            <SectionWrap>
              <SecTitle icon={<IcMap />} title="Место проведения занятий" />
              <YandexTrainingMap variant="city" height={460} />
            </SectionWrap>
          </AnimSection>

          {/* ══ ОТЗЫВЫ — копия блока с лендинга курса ══ */}
          <AnimSection style={{ marginBottom: 24 }}>
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
              <div style={{ display:'grid',gridTemplateColumns:isMobile ? '1fr' : 'repeat(2,minmax(0,1fr))',gap:16 }}>
                {LANDING_REVIEWS.map(r => (
                  <article key={r.id} className="cl-review" style={{ position:'relative',minHeight:250,padding:'20px',border:'1px solid #E3E8F3',borderRadius:18,background:'linear-gradient(145deg,#FFFFFF 0%,#F5F8FF 100%)',display:'flex',flexDirection:'column',overflow:'hidden' }}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:18}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:52,height:52,borderRadius:15,overflow:'hidden',flexShrink:0,background:'#F3F4F6',border:'3px solid #fff',boxShadow:'0 0 0 1px #C9D7FF,0 7px 18px rgba(42,70,135,.13)'}}>{!imgErrs[`landingRev${r.id}`]&&<img src={r.img} alt={r.name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={()=>setE(`landingRev${r.id}`)}/>}</div>
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
          </AnimSection>

          {/* ══ БЛАГОДАРСТВЕННЫЕ ПИСЬМА ══ */}
          <AnimSection style={{ marginBottom: 22 }}>
            <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #F0F0F0' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Благодарственные письма</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 16 }}>
                {LETTERS.map((src, i) => (
                  <div key={i} className="cl-letter cp-letter-thumb" onClick={() => setLetterIdx(i)} style={{ borderRadius: 12, overflow: 'hidden' }}>
                    {!imgErrs[`lt${i}`]
                      ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setE(`lt${i}`)} />
                      : <div style={{ height: 200, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Документ</div>}
                  </div>
                ))}
              </div>
            </div>
          </AnimSection>
        </div>

        {/* LIGHTBOX ПИСЬМА */}
        {letterIdx !== null && (
          <div onClick={() => setLetterIdx(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, backdropFilter: 'blur(5px)', animation: 'fadeIn .2s ease' }}>
            <div onClick={e => e.stopPropagation()} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 800, width: '100%' }}>
              <button onClick={() => setLetterIdx(null)} style={{ position: 'absolute', top: -14, right: -14, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.2)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; }}>×</button>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 12, fontWeight: 500 }}>{letterIdx + 1} / {LETTERS.length}</div>
              <div style={{ width: '100%', background: '#1a1a2e', borderRadius: 14, overflow: 'hidden', boxShadow: '0 28px 70px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!imgErrs[`ltm${letterIdx}`]
                  ? <img key={letterIdx} src={LETTERS[letterIdx]} alt="" style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', display: 'block', animation: 'fadeIn .18s ease' }} onError={() => setE(`ltm${letterIdx}`)} />
                  : <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.4)' }}>Документ</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
                <button className="voevoda-slider-arrow voevoda-slider-arrow--prev" onClick={() => letterIdx > 0 && setLetterIdx(letterIdx - 1)} disabled={letterIdx === 0} style={{ cursor: letterIdx === 0 ? 'not-allowed' : 'pointer', opacity: letterIdx === 0 ? .35 : 1 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <div className="voevoda-slider-panel">{LETTERS.map((_, i) => <button key={i} className={`voevoda-slider-dot${i === letterIdx ? ' is-active' : ''}`} onClick={() => setLetterIdx(i)} aria-label={`Документ ${i + 1}`} />)}</div>
                <button className="voevoda-slider-arrow voevoda-slider-arrow--next" onClick={() => letterIdx < LETTERS.length - 1 && setLetterIdx(letterIdx + 1)} disabled={letterIdx === LETTERS.length - 1} style={{ cursor: letterIdx === LETTERS.length - 1 ? 'not-allowed' : 'pointer', opacity: letterIdx === LETTERS.length - 1 ? .35 : 1 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

