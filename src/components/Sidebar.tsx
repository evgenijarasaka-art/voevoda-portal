import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const SIDEBAR_ICONS: Record<string, React.ReactNode> = {
  home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  profile: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  military: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  professional: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  path: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  communities: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  market: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  journal: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
      <line x1="9" y1="8" x2="17" y2="8"/>
      <line x1="9" y1="12" x2="17" y2="12"/>
      <line x1="9" y1="16" x2="14" y2="16"/>
    </svg>
  ),
  microblog: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  kaptorka: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>,
  dialogs: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  company: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  ads: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  exercises: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="1" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="23" y2="12"/></svg>,
  competitions: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M8.8 12 7 22l5-3 5 3-1.8-10"/><path d="m9.5 8 1.5 1.5L14.5 6"/></svg>,

  // ── Submenu icons ──────────────────────────────────────────────────────────
  personal: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  achievements: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  microblog_sm: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  courses: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  cart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  favorites: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  subscriptions: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  kaptorka_sm: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>,
  dialogs_sm: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  subscribers: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  payments: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  ads_sm: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  partner: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  mypath: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  circle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>,
  myjournal: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  qa: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

const NAV = [
  { key: 'home', label: 'Главная', path: '/' },
  { key: 'profile', label: 'Мой профиль', path: '/profile', hasSub: true },
  { key: 'military', label: 'Военная подготовка', path: '/courses' },
  { key: 'exercises', label: 'Учения', path: '/exercises' },
  { key: 'competitions', label: 'Соревнования', path: '/competitions' },
  { key: 'professional', label: 'Профессиональная подготовка', path: '/professional' },
  { key: 'path', label: 'Путь Воеводы', path: '/my-path' },
  { key: 'communities', label: 'Сообщества', path: '/communities' },
  { key: 'market', label: 'Военмаркет', path: '/market' },
  { key: 'journal', label: 'Журнал', path: '/journal' },
  { key: 'microblog', label: 'Блог', path: '/microblog' },
  { key: 'kaptorka', label: 'Каптёрка', path: '/kaptorka' },
  { key: 'dialogs', label: 'Диалоги', path: '/dialogs' },
];

const BOTTOM_NAV = [
  { key: 'company', label: 'О компании', path: '/company' },
  { key: 'ads', label: 'Реклама', path: '/ads' },
];

const SUBMENU = [
  { label: 'Мой профиль',          path: '/profile',       iconKey: 'personal' },
  { label: 'Достижения',           path: '/achievements',  iconKey: 'achievements' },
  { label: 'Блог',            path: '/microblog',     iconKey: 'microblog_sm' },
  { label: 'Курсы',                path: '/my-courses',    iconKey: 'courses', activePaths: ['/my-courses', '/lessons', '/tests', '/homework'] },
  { label: 'Учебные группы',       path: '/study-groups',  iconKey: 'subscribers', activePaths: ['/study-groups'] },
  { label: 'Корзина',              path: '/cart',          iconKey: 'cart' },
  { label: 'Избранное',            path: '/favorites',     iconKey: 'favorites' },
  { label: 'Подписки',             path: '/subscriptions', iconKey: 'subscriptions' },
  { label: 'Каптёрка',             path: '/kaptorka',      iconKey: 'kaptorka_sm' },
  { label: 'Диалоги',              path: '/dialogs',       iconKey: 'dialogs_sm' },
  { label: 'Подписчики',           path: '/subscribers',   iconKey: 'subscribers' },
  { label: 'Платежи',              path: '/wallet',        iconKey: 'payments' },
  { label: 'Реклама',              path: '/advertise',     iconKey: 'ads_sm' },
  { label: 'Настройки',            path: '/settings',      iconKey: 'settings' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };

  const closeSidebar = () => {
    clearClose();
    setExpanded(false);
    setSubOpen(false);
  };

  const go = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  const handleAsideEnter = () => { clearClose(); setExpanded(true); };

  const handleAsideLeave = () => {
    closeTimer.current = setTimeout(() => { setExpanded(false); setSubOpen(false); }, 180);
  };

  const PROFILE_SUB_PATHS = ['/achievements', '/all-achievements', '/wallet', '/payments', '/subscriptions', '/subscribers', '/settings', '/edit-profile', '/microblog', '/my-courses', '/favorites', '/referral'];

  const isActive = (path: string) => {
    if (location.pathname.startsWith('/city/')) {
      const track = new URLSearchParams(location.search).get('track');
      if (path === '/professional') return track === 'professional';
      if (path === '/courses') return track !== 'professional';
    }
    if (path === '/profile') return location.pathname === '/profile' || PROFILE_SUB_PATHS.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
    return path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isSubActive = (item: typeof SUBMENU[0]) => {
    if (item.activePaths) {
      return item.activePaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
    }
    return location.pathname === item.path;
  };

  return (
    <aside
      onMouseEnter={handleAsideEnter}
      onMouseLeave={handleAsideLeave}
      style={{ position: 'fixed', top: 60, left: 0, bottom: 0, zIndex: 2500, display: 'flex', flexDirection: 'row' }}
    >
      {/* Основная колонка */}
      <div style={{ width: expanded ? 240 : 56, background: '#fff', borderRight: subOpen ? 'none' : '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', transition: 'width .22s cubic-bezier(.4,0,.2,1)', overflow: 'hidden', height: '100%' }}>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
          {NAV.map(item => {
            const active = isActive(item.path);
            return (
              <div key={item.key}
                onClick={() => go(item.path)}
                onMouseEnter={() => { if (item.hasSub) setSubOpen(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', cursor: 'pointer', whiteSpace: 'nowrap', background: active ? '#EBF1FF' : 'transparent', color: active ? '#375DFB' : '#374151', borderLeft: `3px solid ${active ? '#375DFB' : 'transparent'}`, transition: 'background .15s' }}
                onMouseOver={e => { if (!active) e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseOut={e => { if (!active) e.currentTarget.style.background = active ? '#EBF1FF' : 'transparent'; }}>
                <span style={{ flexShrink: 0, color: active ? '#375DFB' : '#6B7280' }}>{SIDEBAR_ICONS[item.key]}</span>
                {expanded && (
                  <>
                    <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                    {item.hasSub && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transform: subOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {expanded && <div style={{ padding: '10px 18px 4px', fontSize: 10, fontWeight: 600, color: '#9CA3AF', letterSpacing: '.5px', textTransform: 'uppercase' }}>ДРУГОЕ</div>}
          {!expanded && <div style={{ height: 1, background: '#F0F0F0', margin: '8px 10px' }} />}

          {BOTTOM_NAV.map(item => {
            const active = isActive(item.path);
            return (
              <div key={item.key} onClick={() => go(item.path)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', cursor: 'pointer', whiteSpace: 'nowrap', background: active ? '#EBF1FF' : 'transparent', color: active ? '#375DFB' : '#374151', borderLeft: `3px solid ${active ? '#375DFB' : 'transparent'}`, transition: 'background .15s' }}
                onMouseOver={e => { if (!active) e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseOut={e => { if (!active) e.currentTarget.style.background = active ? '#EBF1FF' : 'transparent'; }}>
                <span style={{ flexShrink: 0, color: active ? '#375DFB' : '#6B7280' }}>{SIDEBAR_ICONS[item.key]}</span>
                {expanded && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{item.label}</span>}
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: '1px solid #E5E7EB', padding: '10px 8px' }}>
          {isAuthenticated && user ? (
            <div onClick={() => go('/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 8px', borderRadius: 10, transition: 'background .15s' }}
              onMouseOver={e => (e.currentTarget.style.background = '#F3F4F6')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#375DFB', flexShrink: 0, overflow: 'hidden' }}>
                <img src="/teacher2-main.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              {expanded && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {user.name}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#375DFB" stroke="none"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.177 14.828l-3.535-3.536 1.414-1.414 2.121 2.122 4.95-4.95 1.414 1.414-6.364 6.364z"/></svg>
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{user.callsign}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><polyline points="9 18 15 12 9 6" /></svg>
                </>
              )}
            </div>
          ) : (
            <div onClick={() => go('/login')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 8px' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, color: '#374151' }}>?</div>
              {expanded && <span style={{ fontSize: 13, color: '#375DFB', fontWeight: 600 }}>Войти</span>}
            </div>
          )}
        </div>
      </div>

      {/* Подменю «Мой профиль» */}
      {expanded && subOpen && (
        <div
          onMouseEnter={() => setSubOpen(true)}
          style={{ width: 260, background: '#fff', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '4px 0 16px rgba(0,0,0,.06)' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
            <div style={{ padding: '8px 20px 10px', fontSize: 10, fontWeight: 600, color: '#9CA3AF', letterSpacing: '.5px', textTransform: 'uppercase' }}>МЕНЮ ЛИЧНОГО КАБИНЕТА</div>
            {SUBMENU.map(s => {
              const active = isSubActive(s);
              return (
                <div key={s.path} onClick={() => go(s.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', background: active ? '#EBF1FF' : 'transparent', color: active ? '#375DFB' : '#374151', transition: 'background .15s' }}
                  onMouseOver={e => { if (!active) e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseOut={e => { if (!active) e.currentTarget.style.background = active ? '#EBF1FF' : 'transparent'; }}>
                  <span style={{ color: active ? '#375DFB' : '#9CA3AF', flexShrink: 0 }}>{SIDEBAR_ICONS[s.iconKey]}</span>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB' }}>
            <div onClick={() => go('/referral')}
              style={{ background: '#F0F4FF', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'background .15s' }}
              onMouseOver={e => (e.currentTarget.style.background = '#E4EBFF')}
              onMouseOut={e => (e.currentTarget.style.background = '#F0F4FF')}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#375DFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Подарок за друга</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>Зови друзей на портал</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
