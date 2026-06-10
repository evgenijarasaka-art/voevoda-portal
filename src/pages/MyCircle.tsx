import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.mc-card{animation:fadeUp .35s ease both}
.mc-card:nth-child(2){animation-delay:.06s}
.mc-card:nth-child(3){animation-delay:.12s}
.mc-person{transition:box-shadow .25s ease,transform .25s ease,border-color .25s}
.mc-person:hover{box-shadow:0 8px 28px rgba(55,93,251,.12);transform:translateY(-3px);border-color:#C7D2FE!important}
.mc-btn{transition:background .15s,transform .1s}
.mc-btn:hover{transform:translateY(-1px)}
.mc-tab{transition:background .15s,color .15s}
`;

const FRIENDS = [
  { id: 1, name: 'Гром',   rank: 'Майор',    img: '/teacher1-small1.jpg', city: 'Москва',         courses: 12, mutual: true,  online: true,  status: 'Инструктор' },
  { id: 2, name: 'Буря',   rank: 'Сержант',  img: '/teacher1-small2.jpg', city: 'Краснодар',      courses: 5,  mutual: false, online: false, status: 'Курсант' },
  { id: 3, name: 'Сокол',  rank: 'Лейтенант',img: '/teacher2-main.jpg',   city: 'Санкт-Петербург',courses: 8,  mutual: true,  online: true,  status: 'Командир взвода' },
  { id: 4, name: 'Рысь',   rank: 'Капитан',  img: '/sold1.png',           city: 'Екатеринбург',   courses: 15, mutual: true,  online: false, status: 'Инструктор' },
  { id: 5, name: 'Леший',  rank: 'Рядовой',  img: '/sold2.png',           city: 'Казань',          courses: 3,  mutual: false, online: true,  status: 'Курсант' },
  { id: 6, name: 'Титан',  rank: 'Полковник', img: '/teacher1-main.jpg',   city: 'Москва',         courses: 20, mutual: true,  online: false, status: 'Командир батальона' },
];

function injectCss() {
  if (document.getElementById('mc-css')) return;
  const s = document.createElement('style'); s.id = 'mc-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

type Tab = 'all' | 'online' | 'mutual';

export function MyCircle() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  injectCss();

  const filtered = FRIENDS.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.city.toLowerCase().includes(q);
    if (tab === 'online') return matchSearch && f.online;
    if (tab === 'mutual') return matchSearch && f.mutual;
    return matchSearch;
  });

  const TABS: { id: Tab; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'online', label: 'Онлайн' },
    { id: 'mutual', label: 'Взаимные' },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 60px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Назад
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Мой круг общения</h1>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px' }}>Бойцы, с которыми вы тренируетесь и общаетесь</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 3 }}>
          {TABS.map(t => (
            <button key={t.id} className="mc-tab" onClick={() => setTab(t.id)}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#111827' : '#6B7280', fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,.08)' : 'none' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..."
            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#9CA3AF', fontSize: 14 }}>Никого не найдено</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
          {filtered.map(f => (
            <div key={f.id} className="mc-card mc-person" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: '16px 18px', cursor: 'pointer' }}
              onClick={() => navigate(`/messages?chat=${f.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                  <img src={f.img} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  {f.online && <div style={{ position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: '50%', background: '#10B981', border: '2px solid #fff' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{f.rank} · {f.city}</div>
                </div>
                {f.mutual && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#375DFB', background: '#EBF1FF', padding: '2px 8px', borderRadius: 20 }}>Друг</span>}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>{f.status} · {f.courses} курсов пройдено</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="mc-btn" onClick={e => { e.stopPropagation(); navigate(`/messages?chat=${f.id}`); }}
                  style={{ flex: 1, padding: '8px', background: '#375DFB', border: 'none', borderRadius: 9, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Написать
                </button>
                <button className="mc-btn" onClick={e => { e.stopPropagation(); navigate('/profile'); }}
                  style={{ flex: 1, padding: '8px', background: '#F3F4F6', border: 'none', borderRadius: 9, color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Профиль
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
