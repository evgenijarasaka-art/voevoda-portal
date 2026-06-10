import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification, NotifKind, useNotifStore } from '../store/useNotifStore';
import './feature-pages.css';

type Filter = 'Все' | 'Новые' | 'Соцсеть' | 'Курсы' | 'Достижения' | 'Система';

const FILTERS: Filter[] = ['Все', 'Новые', 'Соцсеть', 'Курсы', 'Достижения', 'Система'];

const KIND_VIEW: Record<NotifKind, { label: string; icon: string; badge: string }> = {
  like: { label: 'Лайк', icon: '♥', badge: 'red' },
  comment: { label: 'Комментарий', icon: '💬', badge: '' },
  course_enrolled: { label: 'Запись', icon: '✓', badge: 'green' },
  course_started: { label: 'Занятие', icon: '📅', badge: 'gold' },
  new_follower: { label: 'Подписчик', icon: '👤', badge: '' },
  achievement: { label: 'Достижение', icon: '★', badge: 'gold' },
  system: { label: 'Система', icon: 'i', badge: '' },
  referral: { label: 'Бонус', icon: '₽', badge: 'green' },
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
  const [filter, setFilter] = useState<Filter>('Все');
  const [query, setQuery] = useState('');
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
    const q = query.trim().toLowerCase();
    return items.filter(item => {
      const visible = !hidden.includes(item.id);
      const filterOk = matchesFilter(item, filter);
      const queryOk = !q || `${item.title} ${item.body}`.toLowerCase().includes(q);
      return visible && filterOk && queryOk;
    });
  }, [filter, hidden, items, query]);

  const countFor = (next: Filter) => items.filter(item => !hidden.includes(item.id) && matchesFilter(item, next)).length;
  const important = filtered.filter(item => !item.read);
  const archive = filtered.filter(item => item.read);

  const openItem = (item: Notification) => {
    markRead(item.id);
    if (item.link) navigate(item.link);
  };

  const renderRow = (item: Notification) => {
    const view = KIND_VIEW[item.kind];
    return (
      <div className="portal-list-row" key={item.id} onClick={() => openItem(item)} style={{ background: item.read ? '#fff' : 'rgba(26,39,68,.035)' }}>
        <div className="portal-avatar" style={{ background: item.read ? '#f3f4f6' : '#1a2744', color: item.read ? '#6b7280' : '#f5a623' }}>{view.icon}</div>
        <div>
          <div className="portal-row" style={{ marginBottom: 4 }}>
            <b>{item.title}</b>
            <span className={`portal-badge ${view.badge}`}>{view.label}</span>
            {!item.read && <span className="portal-badge green">Новое</span>}
          </div>
          <div style={{ color: '#6b7280', lineHeight: 1.45 }}>{item.body}</div>
          <div className="portal-meta" style={{ marginTop: 5 }}>{item.date}</div>
        </div>
        <div className="portal-actions" onClick={e => e.stopPropagation()}>
          {!item.read && <button className="portal-btn" onClick={() => markRead(item.id)}>Прочитано</button>}
          <button className="portal-btn danger" onClick={() => { setHidden(prev => [...prev, item.id]); notify('Уведомление скрыто'); }}>Скрыть</button>
        </div>
      </div>
    );
  };

  return (
    <main className="portal-page">
      <div className="portal-shell" style={{ maxWidth: 980 }}>
        {toast && <div className="portal-toast">{toast}</div>}

        <div className="portal-breadcrumb">
          <button onClick={() => navigate('/')}>Главная</button>
          <span>/</span>
          <span>Уведомления</span>
        </div>

        <div className="portal-head">
          <div>
            <h1 className="portal-title">Уведомления</h1>
            <div className="portal-subtitle">События курсов, сообщества, магазина и личного кабинета</div>
          </div>
          <div className="portal-actions">
            <button className="portal-btn" onClick={() => setSettingsOpen(true)}>Настройки</button>
            <button className="portal-btn primary" disabled={unread === 0} onClick={() => { markAllRead(); notify('Все уведомления отмечены прочитанными'); }}>
              Прочитать все {unread > 0 ? `(${unread})` : ''}
            </button>
          </div>
        </div>

        <section className="portal-card" style={{ marginBottom: 16 }}>
          <div className="portal-row" style={{ alignItems: 'stretch' }}>
            <div className="portal-img" style={{ width: 220, height: 118, borderRadius: 14, flexShrink: 0 }}>
              <img src="/soldier2.png" alt="Курсант Воеводы" />
            </div>
            <div className="portal-body" style={{ flex: 1 }}>
              <span className="portal-badge gold">Штаб событий</span>
              <h2 className="portal-name" style={{ marginTop: 8 }}>Все сигналы портала в одном месте</h2>
              <div className="portal-meta">
                Новые реакции, записи на курсы, достижения и системные сообщения можно отфильтровать и быстро отметить прочитанными.
              </div>
            </div>
          </div>
        </section>

        <section className="portal-toolbar" style={{ gridTemplateColumns: '1fr 130px' }}>
          <input className="portal-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по уведомлениям" />
          <button className="portal-btn" onClick={() => { setQuery(''); setFilter('Все'); }}>Сбросить</button>
        </section>

        <div className="portal-pills">
          {FILTERS.map(item => (
            <button key={item} className={`portal-pill ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)}>
              {item} ({countFor(item)})
            </button>
          ))}
        </div>

        {filtered.length ? (
          <section className="portal-list">
            {important.length > 0 && (
              <div style={{ padding: '10px 16px', background: '#fff8ed', color: '#b86d00', fontWeight: 800, fontSize: 12 }}>Новые и важные</div>
            )}
            {important.map(renderRow)}
            {archive.length > 0 && (
              <div style={{ padding: '10px 16px', background: '#f5f6f8', color: '#6b7280', fontWeight: 800, fontSize: 12 }}>Ранее</div>
            )}
            {archive.map(renderRow)}
          </section>
        ) : (
          <div className="portal-empty">
            <h2 className="portal-name">Уведомлений нет</h2>
            <p>Здесь появятся лайки, комментарии, записи на курсы, достижения и системные сообщения.</p>
          </div>
        )}
      </div>

      {settingsOpen && (
        <div className="portal-modal-backdrop" onClick={() => setSettingsOpen(false)}>
          <aside className="portal-modal" style={{ maxWidth: 430 }} onClick={e => e.stopPropagation()}>
            <div className="portal-modal-head">
              <h2 className="portal-name" style={{ fontSize: 22 }}>Настройки уведомлений</h2>
              <button className="portal-btn" onClick={() => setSettingsOpen(false)}>Закрыть</button>
            </div>
            <div className="portal-modal-body">
              {['Лайки и комментарии', 'Записи на курсы', 'Достижения', 'Системные сообщения', 'Маркет и корзина'].map((label, index) => (
                <label key={label} className="portal-row" style={{ justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span>{label}</span>
                  <input type="checkbox" defaultChecked={index !== 4} />
                </label>
              ))}
              <div className="portal-form-grid" style={{ marginTop: 16 }}>
                <div>
                  <label className="portal-label">Тихий режим с</label>
                  <input className="portal-input" type="time" defaultValue="22:00" />
                </div>
                <div>
                  <label className="portal-label">до</label>
                  <input className="portal-input" type="time" defaultValue="08:00" />
                </div>
              </div>
              <button className="portal-btn primary" style={{ width: '100%', marginTop: 18 }} onClick={() => { setSettingsOpen(false); notify('Настройки сохранены'); }}>
                Сохранить настройки
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
