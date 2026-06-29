import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification, NotifKind, useNotifStore } from '../store/useNotifStore';
import { useCartStore } from '../store/useCartStore';
import { getFavoriteItemLink, useFavoritesStore } from '../store/useFavoritesStore';
import { useKaptorkaStore } from '../store/useKaptorkaStore';
import './feature-pages.css';
import { PortalBreadcrumb } from '../components/PortalBreadcrumb';

type Filter = 'Все' | 'Новые' | 'Соцсеть' | 'Курсы' | 'Достижения' | 'Система';

const FILTERS: Filter[] = ['Все', 'Новые', 'Соцсеть', 'Курсы', 'Достижения', 'Система'];

const IcHeart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IcComment = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IcCourseEnroll = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IcCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IcFollower = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);

const IcAchievement = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

const IcSystem = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const IcReferral = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const IcBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const VoevodaNotificationMark = () => (
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M20 3.5 32 8v9.1c0 8.1-4.7 14.7-12 18.9C12.7 31.8 8 25.2 8 17.1V8l12-4.5Z" fill="#FFFFFF" stroke="#2F52F0" strokeWidth="1.8"/>
    <path d="M25.4 18.2c0-3.3-2.1-5.9-5.4-5.9s-5.4 2.6-5.4 5.9c0 3.8-1.8 5.2-1.8 5.2h14.4s-1.8-1.4-1.8-5.2Z" fill="#EAF0FF" stroke="#375DFB" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M22.1 26.1c-.5 1-1.2 1.5-2.1 1.5s-1.6-.5-2.1-1.5" stroke="#173A9B" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="m20 7.5.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.2 1.8-.3.8-1.6Z" fill="#375DFB"/>
  </svg>
);

const IcSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/>
    <line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/>
    <line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/>
    <line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

const IcCheckAll = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 12 5 16 12 6"/>
    <polyline points="9 17 13 21 22 8"/>
  </svg>
);

const IcEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IcEyeOff = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const KIND_CFG: Record<NotifKind, { label: string; Icon: React.FC; bg: string; color: string; badge: string }> = {
  like:            { label: 'Лайк',        Icon: IcHeart,        bg: '#eef3ff', color: '#375dfb', badge: '' },
  comment:         { label: 'Комментарий', Icon: IcComment,      bg: '#eef2ff', color: '#375dfb', badge: '' },
  course_enrolled: { label: 'Запись',      Icon: IcCourseEnroll, bg: '#edf7ff', color: '#1769aa', badge: '' },
  course_started:  { label: 'Занятие',     Icon: IcCalendar,     bg: '#e8efff', color: '#244ec8', badge: '' },
  new_follower:    { label: 'Подписчик',   Icon: IcFollower,     bg: '#eef2ff', color: '#375dfb', badge: '' },
  achievement:     { label: 'Достижение',  Icon: IcAchievement,  bg: '#eaf0ff', color: '#173a9b', badge: '' },
  system:          { label: 'Система',     Icon: IcSystem,       bg: '#f1f5ff', color: '#536b9f', badge: '' },
  referral:        { label: 'Бонус',       Icon: IcReferral,     bg: '#e9f6ff', color: '#0876b9', badge: '' },
};

function matchesFilter(item: Notification, filter: Filter) {
  if (filter === 'Все') return true;
  if (filter === 'Новые') return !item.read;
  if (filter === 'Соцсеть') return item.kind === 'like' || item.kind === 'comment' || item.kind === 'new_follower';
  if (filter === 'Курсы') return item.kind === 'course_enrolled' || item.kind === 'course_started';
  if (filter === 'Достижения') return item.kind === 'achievement';
  return item.kind === 'system' || item.kind === 'referral';
}

export function Notifications() {
  const navigate = useNavigate();
  const { items, markRead, markAllRead, unreadCount } = useNotifStore();
  const cartItems = useCartStore(state => state.items);
  const favoriteItems = useFavoritesStore(state => state.items);
  const kaptorkaAds = useKaptorkaStore(state => state.ads);
  const [filter, setFilter] = useState<Filter>('Все');
  const [hidden, setHidden] = useState<number[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unread = unreadCount();

  const notify = (text: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(text);
    timer.current = setTimeout(() => setToast(''), 2200);
  };

  const filtered = useMemo(() => {
    return items.filter(item => !hidden.includes(item.id) && matchesFilter(item, filter));
  }, [filter, hidden, items]);

  const countFor = (next: Filter) => items.filter(item => !hidden.includes(item.id) && matchesFilter(item, next)).length;
  const important = filtered.filter(item => !item.read);
  const archive = filtered.filter(item => item.read);

  const openItem = (item: Notification) => {
    markRead(item.id);
    if (item.title.toLocaleLowerCase('ru-RU').includes('добавлен в корзину') || item.title.toLocaleLowerCase('ru-RU').includes('выбран в корзине')) {
      const cartItem = cartItems.find(cart => cart.title === item.body);
      if (cartItem) {
        navigate(`/checkout?item=${cartItem.kind}:${cartItem.id}`);
        return;
      }
    }
    const isLegacyFavoriteLink = item.kind === 'like'
      && item.link === '/favorites'
      && item.title.toLocaleLowerCase('ru-RU').includes('избран');
    if (isLegacyFavoriteLink) {
      const favorite = favoriteItems.find(entry => entry.title === item.body);
      if (favorite) {
        navigate(getFavoriteItemLink(favorite));
        return;
      }
      const kaptorkaAd = kaptorkaAds.find(ad => ad.title === item.body);
      if (kaptorkaAd) {
        navigate(`/kaptorka/${kaptorkaAd.id}`);
        return;
      }
    }
    if (item.link) navigate(item.link);
  };

  const renderRow = (item: Notification) => {
    const cfg = KIND_CFG[item.kind];
    const Icon = cfg.Icon;
    return (
      <div className="portal-list-row" key={item.id} onClick={() => openItem(item)}
        style={{ background: item.read ? '#fff' : 'rgba(55,93,251,.03)', borderLeft: item.read ? '3px solid transparent' : '3px solid #375dfb' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
          <Icon />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#1a2744', fontSize: 14 }}>{item.title}</span>
            <span className={`portal-badge ${cfg.badge}`} style={{ fontSize: 10 }}>{cfg.label}</span>
            {!item.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#375dfb', flexShrink: 0 }} />}
          </div>
          <div style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.45 }}>{item.body}</div>
          <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>{item.date}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {!item.read && (
            <button onClick={() => markRead(item.id)} title="Прочитано"
              style={{ width: 32, height: 32, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#6b7280', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#375dfb'; e.currentTarget.style.color = '#375dfb'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}>
              <IcEye />
            </button>
          )}
          <button onClick={() => { setHidden(prev => [...prev, item.id]); notify('Уведомление скрыто'); }} title="Скрыть"
            style={{ width: 32, height: 32, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#9ca3af', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af'; }}>
            <IcEyeOff />
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="portal-page notifications-page">
      <div className="portal-shell" style={{ maxWidth: 980 }}>
        {toast && <div className="portal-toast">{toast}</div>}

        <PortalBreadcrumb items={[{ label:'Главная', to:'/' }, { label:'Уведомления' }]} />

        <div className="portal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: 15, background: 'linear-gradient(145deg, #FFFFFF 0%, #E8EFFF 100%)', border: '1px solid #C9D7FF', boxShadow: '0 8px 22px rgba(47,82,240,.14)', display: 'grid', placeItems: 'center' }}>
              <VoevodaNotificationMark />
            </div>
            <div>
              <h1 className="portal-title" style={{ fontSize: 26 }}>Уведомления</h1>
              <div className="portal-subtitle">События курсов, сообщества, магазина и личного кабинета</div>
            </div>
          </div>
          <div className="portal-actions">
            <button className="portal-btn" onClick={() => setSettingsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IcSettings /> Настройки
            </button>
            <button className="portal-btn primary" disabled={unread === 0} onClick={() => { markAllRead(); notify('Все уведомления отмечены прочитанными'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IcCheckAll /> Прочитать все {unread > 0 ? `(${unread})` : ''}
            </button>
          </div>
        </div>

        <section style={{ marginBottom: 20, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
            <div style={{ width: 240, height: 130, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
              <img src="/уведы.png" alt="Штабной комплекс уведомлений Воеводы" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '34% 58%', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(255,255,255,.95) 100%)' }} />
            </div>
            <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ alignSelf: 'flex-start', marginBottom: 6, padding: '4px 10px', borderRadius: 999, background: '#EAF0FF', border: '1px solid #C9D7FF', color: '#244EC8', fontSize: 11, fontWeight: 800 }}>Штаб событий</span>
              <h2 style={{ margin: '0 0 5px', color: '#1a2744', fontSize: 17, fontWeight: 700, fontFamily: '"Exo 2", sans-serif' }}>Все сигналы портала в одном месте</h2>
              <div style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.5 }}>
                Реакции, записи на курсы, достижения и системные сообщения — фильтруйте и отмечайте прочитанными.
              </div>
            </div>
          </div>
        </section>

        <div className="portal-pills notifications-pills">
          {FILTERS.map(item => (
            <button key={item} className={`portal-pill ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)}>
              {item} ({countFor(item)})
            </button>
          ))}
        </div>

        {filtered.length ? (
          <section className="portal-list">
            {important.length > 0 && (
              <div style={{ padding: '9px 16px', background: 'linear-gradient(to right, #E8EFFF, #F8FAFF)', color: '#244EC8', borderBottom: '1px solid #DCE5FF', fontWeight: 800, fontSize: 11, letterSpacing: '.03em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Новые и важные
              </div>
            )}
            {important.map(renderRow)}
            {archive.length > 0 && (
              <div style={{ padding: '9px 16px', background: '#f8f9fb', color: '#9ca3af', fontWeight: 800, fontSize: 11, letterSpacing: '.03em', textTransform: 'uppercase' }}>
                Ранее
              </div>
            )}
            {archive.map(renderRow)}
          </section>
        ) : (
          <div className="portal-empty">
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f3f4f6', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: '#9ca3af' }}>
              <IcBell />
            </div>
            <h2 className="portal-name" style={{ fontSize: 18 }}>Уведомлений нет</h2>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Здесь появятся лайки, комментарии, записи на курсы, достижения и системные сообщения.</p>
          </div>
        )}
      </div>

      {settingsOpen && (
        <div className="portal-modal-backdrop" onClick={() => setSettingsOpen(false)}>
          <aside className="portal-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="portal-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(145deg,#244EC8,#6E8FFF)', display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 6px 16px rgba(55,93,251,.22)' }}>
                  <IcSettings />
                </div>
                <h2 className="portal-name" style={{ fontSize: 20, margin: 0 }}>Настройки уведомлений</h2>
              </div>
              <button className="portal-btn" onClick={() => setSettingsOpen(false)}>Закрыть</button>
            </div>
            <div className="portal-modal-body">
              {[
                { label: 'Лайки и комментарии', icon: <IcHeart />, default: true },
                { label: 'Записи на курсы', icon: <IcCourseEnroll />, default: true },
                { label: 'Достижения', icon: <IcAchievement />, default: true },
                { label: 'Системные сообщения', icon: <IcSystem />, default: true },
                { label: 'Маркет и корзина', icon: <IcReferral />, default: false },
              ].map((item) => (
                <label key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid #f0f1f3', cursor: 'pointer' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#374151', fontSize: 14 }}>
                    <span style={{ color: '#9ca3af' }}>{item.icon}</span>
                    {item.label}
                  </span>
                  <input type="checkbox" defaultChecked={item.default} style={{ width: 18, height: 18, accentColor: '#375dfb' }} />
                </label>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18, padding: '16px', background: '#f8f9fb', borderRadius: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 5, color: '#6b7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Тихий режим с</label>
                  <input className="portal-input" type="time" defaultValue="22:00" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 5, color: '#6b7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>до</label>
                  <input className="portal-input" type="time" defaultValue="08:00" />
                </div>
              </div>
              <button className="portal-btn primary" style={{ width: '100%', marginTop: 18, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => { setSettingsOpen(false); notify('Настройки сохранены'); }}>
                Сохранить настройки
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
