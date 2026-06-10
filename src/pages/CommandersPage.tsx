import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.cm-card{animation:fadeUp .35s ease both}
.cm-card:nth-child(2){animation-delay:.05s}
.cm-card:nth-child(3){animation-delay:.1s}
.cm-card:nth-child(4){animation-delay:.15s}
.cm-card:nth-child(5){animation-delay:.2s}
.cm-person{transition:box-shadow .25s ease,transform .25s ease,border-color .25s}
.cm-person:hover{box-shadow:0 10px 36px rgba(55,93,251,.13);transform:translateY(-4px);border-color:#C7D2FE!important}
.cm-btn{transition:background .15s,transform .1s}
.cm-btn:hover{transform:translateY(-1px)}
`;

const COMMANDERS = [
  {
    id: 1, name: 'Громов Виктор Петрович', callsign: 'Гром',
    rank: 'Полковник', role: 'Командир УТЦ', unit: '77-й батальон',
    img: '/teacher1-main.jpg', experience: 25, city: 'Москва',
    awards: ['Орден Мужества', 'Медаль «За боевые заслуги»', 'Герой России'],
    bio: 'Основатель и командир УТЦ «Воевода». Ветеран боевых действий с 25-летним стажем. Под его руководством центр подготовил более 10 000 военнослужащих.',
    courses: 0, students: 10000,
  },
  {
    id: 2, name: 'Бекасов Руслан Азимович', callsign: 'Бек',
    rank: 'Подполковник', role: 'Заместитель командира', unit: 'Штаб',
    img: '/teacher2-main.jpg', experience: 18, city: 'Москва',
    awards: ['Медаль «За доблесть»', 'Орден Мужества'],
    bio: 'Заместитель командира УТЦ по учебной работе. Организует учебный процесс, расписание и аттестацию курсантов.',
    courses: 0, students: 4200,
  },
  {
    id: 3, name: 'Орлов Константин Юрьевич', callsign: 'Сокол',
    rank: 'Майор', role: 'Командир учебной роты', unit: '1-я рота',
    img: '/teacher1-small1.jpg', experience: 14, city: 'Санкт-Петербург',
    awards: ['Медаль «За боевые заслуги»'],
    bio: 'Командует первой учебной ротой. Специализируется на подготовке стрелковых подразделений и отработке тактики малых групп.',
    courses: 2, students: 1800,
  },
  {
    id: 4, name: 'Волков Анатолий Серафимович', callsign: 'Волк',
    rank: 'Майор', role: 'Командир роты специальной подготовки', unit: '2-я рота',
    img: '/teacher1-small2.jpg', experience: 16, city: 'Краснодар',
    awards: ['Орден Мужества', 'Медаль «За доблесть»'],
    bio: 'Командует ротой специальной подготовки. Ведёт курсы по рейдовым операциям, диверсионной тактике и выживанию за линией фронта.',
    courses: 3, students: 920,
  },
  {
    id: 5, name: 'Тихонов Игорь Борисович', callsign: 'Тихий',
    rank: 'Капитан', role: 'Начальник учебного отдела', unit: 'Учебный отдел',
    img: '/teacher2-main.jpg', experience: 10, city: 'Екатеринбург',
    awards: ['Медаль «За боевые заслуги»'],
    bio: 'Начальник учебного отдела. Разрабатывает учебные программы и методические материалы для всех курсов центра.',
    courses: 4, students: 2400,
  },
];

const CITIES = ['Все города', 'Москва', 'Санкт-Петербург', 'Краснодар', 'Екатеринбург'];

function injectCss() {
  if (document.getElementById('cm-css')) return;
  const s = document.createElement('style'); s.id = 'cm-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export function CommandersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Все города');
  const [selected, setSelected] = useState<typeof COMMANDERS[0] | null>(null);

  injectCss();

  const visible = COMMANDERS.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.callsign.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
    const matchCity = city === 'Все города' || c.city === city;
    return matchSearch && matchCity;
  });

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 20px 60px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Назад
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Командиры</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Боевые офицеры и руководство УТЦ «Воевода»</p>
        </div>
        <div style={{ fontSize: 13, color: '#9CA3AF', background: '#F3F4F6', padding: '6px 14px', borderRadius: 20 }}>
          {visible.length} из {COMMANDERS.length} командиров
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени, позывному, должности..." style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #E5E7EB', borderRadius: 11, fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
        </div>
        <select value={city} onChange={e => setCity(e.target.value)} style={{ padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 11, fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none' }}>
          {CITIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Ничего не найдено</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {visible.map(c => (
            <div key={c.id} className="cm-card cm-person" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 18, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelected(c)}>
              <div style={{ position: 'relative', height: 190, background: '#1A1A2E', overflow: 'hidden' }}>
                <img src={c.img} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .85 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{c.rank}</div>
                <div style={{ position: 'absolute', top: 10, right: 10, background: '#111827', color: '#F59E0B', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>«{c.callsign}»</div>
                <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>{c.role}</div>
                </div>
              </div>
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <div style={{ flex: 1, textAlign: 'center', background: '#F9FAFB', borderRadius: 10, padding: '8px 6px' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{c.experience}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>лет службы</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', background: '#F9FAFB', borderRadius: 10, padding: '8px 6px' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{c.awards.length}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>наград</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', background: '#F9FAFB', borderRadius: 10, padding: '8px 6px' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{c.students >= 1000 ? `${(c.students / 1000).toFixed(0)}к` : c.students}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>подготовлено</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ marginRight: 4, verticalAlign: 'middle' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {c.city} · {c.unit}
                </div>
                <button className="cm-btn" onClick={e => { e.stopPropagation(); setSelected(c); }} style={{ width: '100%', padding: '9px', background: '#111827', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Подробнее
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setSelected(null)}>
          <div style={{ background: '#fff', borderRadius: 20, maxWidth: 500, width: '100%', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', height: 210 }}>
              <img src={selected.img} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.85)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 45%)' }} />
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: 10, background: 'rgba(0,0,0,.45)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div style={{ position: 'absolute', bottom: 14, left: 18 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>{selected.rank} · «{selected.callsign}» · {selected.city}</div>
              </div>
            </div>
            <div style={{ padding: '18px 22px 22px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>{selected.role} · {selected.unit}</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65, marginBottom: 14 }}>{selected.bio}</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Награды и отличия:</div>
                {selected.awards.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#374151', marginBottom: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                    {a}
                  </div>
                ))}
              </div>
              <button className="cm-btn" onClick={() => { setSelected(null); navigate('/messages'); }} style={{ width: '100%', padding: '11px', background: '#111827', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Написать командиру
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
