import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userProfilePath } from '../api/testApi';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.mc-page{min-height:100vh;background:radial-gradient(circle at 82% 4%,rgba(55,93,251,.08),transparent 280px),#f4f5fb;color:#0f172a;font-family:'Montserrat',system-ui,sans-serif}
.mc-shell{width:min(1280px,calc(100% - 48px));margin:0 auto;padding:28px 0 64px}
.mc-toolbar{display:inline-flex;gap:4px;margin-bottom:20px;padding:4px;border:1px solid #e4e8f0;border-radius:12px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.04)}
.mc-tab{min-width:112px;min-height:36px;padding:0 16px;border:0;border-radius:8px;background:transparent;color:#667085;font-size:13px;font-weight:650;cursor:pointer;transition:background .15s,color .15s,box-shadow .15s}
.mc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.mc-card{animation:fadeUp .35s ease both}
.mc-card:nth-child(2){animation-delay:.06s}
.mc-card:nth-child(3){animation-delay:.12s}
.mc-card:nth-child(4){animation-delay:.18s}
.mc-card:nth-child(5){animation-delay:.24s}
.mc-card:nth-child(6){animation-delay:.3s}
.mc-person{display:flex;min-height:210px;flex-direction:column;padding:20px 22px;border:1px solid #e2e7ef;border-radius:16px;background:#fff;cursor:pointer;box-shadow:0 5px 18px rgba(15,23,42,.045);transition:box-shadow .25s ease,transform .25s ease,border-color .25s}
.mc-person:hover{box-shadow:0 16px 36px rgba(27,44,83,.11);transform:translateY(-4px);border-color:#c4cff8}
.mc-person-head{display:grid;grid-template-columns:58px minmax(0,1fr) auto;align-items:center;gap:14px;margin-bottom:16px}
.mc-avatar{position:relative;width:58px;height:58px;overflow:hidden;flex-shrink:0;border:1px solid #e5e9f0;border-radius:15px;background:#eef1f6}
.mc-person-id{min-width:0}
.mc-person-name{overflow:hidden;color:#111827;font-size:16px;font-weight:900;line-height:1.2;text-overflow:ellipsis;white-space:nowrap}
.mc-person-meta{margin-top:4px;overflow:hidden;color:#98a2b3;font-size:12px;font-weight:650;line-height:1.35;text-overflow:ellipsis;white-space:nowrap}
.mc-friend-badge{display:inline-flex;min-height:24px;align-items:center;padding:0 10px;border-radius:999px;background:#ebf1ff;color:#375dfb;font-size:10px;font-weight:900;white-space:nowrap}
.mc-person-desc{min-height:40px;margin:0 0 18px;color:#667085;font-size:13px;font-weight:600;line-height:1.55}
.mc-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto}
.mc-btn{min-height:42px;border:1px solid #e4e8f0;border-radius:10px;background:#f3f4f6;color:#24324f;font-size:13px;font-weight:850;cursor:pointer;transition:background .15s,transform .1s,border-color .15s,color .15s,box-shadow .15s}
.mc-btn.primary{border-color:#375dfb;background:#375dfb;color:#fff;box-shadow:0 6px 18px rgba(55,93,251,.25)}
.mc-btn:hover{transform:translateY(-1px);border-color:#c7d2fe;background:#eef3ff;color:#375dfb}
.mc-btn.primary:hover{background:#294cc8;color:#fff;box-shadow:0 8px 24px rgba(55,93,251,.32)}
.mc-empty{padding:54px 20px;border:1px solid #e2e7ef;border-radius:16px;background:#fff;color:#98a2b3;text-align:center;font-size:14px;font-weight:700}
@media(max-width:1050px){.mc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:680px){.mc-shell{width:calc(100% - 24px);padding-top:18px}.mc-toolbar{display:grid;grid-template-columns:repeat(3,1fr);width:100%}.mc-tab{min-width:0}.mc-grid{grid-template-columns:1fr}.mc-person{min-height:0}}
`;

const FRIENDS = [
  { id: 1, name: 'Гром', rank: 'Майор', img: '/teacher1-small1.jpg', city: 'Москва', courses: 12, mutual: true, online: true, status: 'Инструктор' },
  { id: 2, name: 'Буря', rank: 'Сержант', img: '/teacher1-small2.jpg', city: 'Краснодар', courses: 5, mutual: false, online: false, status: 'Курсант' },
  { id: 3, name: 'Сокол', rank: 'Лейтенант', img: '/teacher2-main.jpg', city: 'Санкт-Петербург', courses: 8, mutual: true, online: true, status: 'Командир взвода' },
  { id: 4, name: 'Рысь', rank: 'Капитан', img: '/sold1.png', city: 'Екатеринбург', courses: 15, mutual: true, online: false, status: 'Инструктор' },
  { id: 5, name: 'Леший', rank: 'Рядовой', img: '/sold2.png', city: 'Казань', courses: 3, mutual: false, online: true, status: 'Курсант' },
  { id: 6, name: 'Титан', rank: 'Полковник', img: '/teacher1-main.jpg', city: 'Москва', courses: 20, mutual: true, online: false, status: 'Командир батальона' },
];

function injectCss() {
  const existing = document.getElementById('mc-css');
  if (existing) {
    existing.textContent = CSS;
    return;
  }
  const s = document.createElement('style');
  s.id = 'mc-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

type Tab = 'all' | 'online' | 'mutual';

export function MyCircle() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('all');
  injectCss();

  const filtered = FRIENDS.filter(friend => {
    if (tab === 'online') return friend.online;
    if (tab === 'mutual') return friend.mutual;
    return true;
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'online', label: 'Онлайн' },
    { id: 'mutual', label: 'Взаимные' },
  ];

  return (
    <main className="mc-page">
      <div className="mc-shell">
        <div className="mc-toolbar" aria-label="Фильтр друзей">
          {tabs.map(item => (
            <button
              key={item.id}
              className="mc-tab"
              onClick={() => setTab(item.id)}
              style={{
                background: tab === item.id ? '#fff' : 'transparent',
                color: tab === item.id ? '#111827' : '#667085',
                boxShadow: tab === item.id ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mc-empty">Никого не найдено</div>
        ) : (
          <section className="mc-grid">
            {filtered.map(friend => (
              <article key={friend.id} className="mc-card mc-person" onClick={() => navigate(`/messages?chat=${friend.id}`)}>
                <div className="mc-person-head">
                  <div className="mc-avatar">
                    <img
                      src={friend.img}
                      alt={friend.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={event => { (event.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    {friend.online && (
                      <div style={{ position: 'absolute', bottom: 2, right: 2, width: 11, height: 11, borderRadius: '50%', background: '#10B981', border: '2px solid #fff' }} />
                    )}
                  </div>
                  <div className="mc-person-id">
                    <div className="mc-person-name">{friend.name}</div>
                    <div className="mc-person-meta">{friend.rank} · {friend.city}</div>
                  </div>
                  {friend.mutual && <span className="mc-friend-badge">Друг</span>}
                </div>

                <div className="mc-person-desc">{friend.status} · {friend.courses} курсов пройдено</div>

                <div className="mc-actions">
                  <button className="mc-btn primary" onClick={event => { event.stopPropagation(); navigate(`/messages?chat=${friend.id}`); }}>
                    Написать
                  </button>
                  <button className="mc-btn" onClick={event => { event.stopPropagation(); navigate(userProfilePath(friend.name)); }}>
                    Профиль
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
