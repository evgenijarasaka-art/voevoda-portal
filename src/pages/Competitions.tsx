import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.cmp-card{animation:fadeUp .35s ease both}
.cmp-card:nth-child(2){animation-delay:.06s}
.cmp-card:nth-child(3){animation-delay:.12s}
.cmp-item{transition:box-shadow .25s ease,transform .25s ease,border-color .25s}
.cmp-item:hover{box-shadow:0 10px 36px rgba(55,93,251,.13);transform:translateY(-4px);border-color:#C7D2FE!important}
.cmp-btn{transition:background .15s,transform .1s}
.cmp-btn:hover{transform:translateY(-1px)}
.cmp-tab{transition:background .15s,color .15s}
`;

const COMPETITIONS = [
  {
    id: 1, title: 'Тактическое ориентирование', city: 'Санкт-Петербург', date: '5 марта, 2024',
    participants: 620, photos: 24, videos: 2, status: 'completed',
    img: '/soobsh3.png', desc: 'Командное соревнование по ориентированию на местности с элементами тактики. Участники проходят маршрут с контрольными точками и выполняют вводные задачи.',
    results: ['1 место: команда «Вымпел» (Москва)', '2 место: команда «Рубеж» (Екатеринбург)', '3 место: команда «Страж» (СПб)'],
  },
  {
    id: 2, title: 'Марш-бросок на 10 км', city: 'Москва', date: '14 мая, 2024',
    participants: 340, photos: 18, videos: 1, status: 'upcoming',
    img: '/soobsh1.png', desc: 'Индивидуальное состязание на выносливость. Дистанция 10 км с полной выкладкой (20 кг). Зачёт по времени.',
    results: [],
  },
  {
    id: 3, title: 'Линия обороны', city: 'Краснодар', date: '16 мая, 2024',
    participants: 180, photos: 32, videos: 3, status: 'upcoming',
    img: '/soobsh2.png', desc: 'Командные тактические учения. Удержание позиций, оборона периметра, работа в связке с сапёрной группой.',
    results: [],
  },
  {
    id: 4, title: 'Стрельба из АК-74', city: 'Москва', date: '20 мая, 2024',
    participants: 520, photos: 15, videos: 2, status: 'registration',
    img: '/soobsh4.png', desc: 'Индивидуальный зачёт по стрельбе. Дистанции 100м, 200м, 300м. Три огневых рубежа. Раздельный зачёт — новички и опытные.',
    results: [],
  },
  {
    id: 5, title: 'Военный триатлон', city: 'Казань', date: '1 июня, 2024',
    participants: 250, photos: 0, videos: 0, status: 'registration',
    img: '/soobsh3.png', desc: 'Триатлон военного формата: бег 5 км, полоса препятствий, стрелковый этап. Командный и личный зачёт.',
    results: [],
  },
];

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  completed:    { label: 'Завершено',  bg: '#F0FDF4', color: '#10B981' },
  upcoming:     { label: 'Скоро',      bg: '#FFF7ED', color: '#F59E0B' },
  registration: { label: 'Регистрация', bg: '#EBF1FF', color: '#375DFB' },
};

function injectCss() {
  if (document.getElementById('cmp-css')) return;
  const s = document.createElement('style'); s.id = 'cmp-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

type Tab = 'all' | 'registration' | 'upcoming' | 'completed';

export function CompetitionsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('all');
  const [selected, setSelected] = useState<typeof COMPETITIONS[0] | null>(null);
  injectCss();

  const visible = COMPETITIONS.filter(c => tab === 'all' || c.status === tab);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Назад
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Соревнования</h1>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px' }}>Боевые соревнования и учебные состязания УТЦ «Воевода»</p>

      <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 3, marginBottom: 24, width: 'fit-content' }}>
        {([['all','Все'],['registration','Регистрация'],['upcoming','Скоро'],['completed','Завершённые']] as [Tab, string][]).map(([id, label]) => (
          <button key={id} className="cmp-tab" onClick={() => setTab(id)}
            style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: tab === id ? '#fff' : 'transparent', color: tab === id ? '#111827' : '#6B7280', fontSize: 13, fontWeight: tab === id ? 700 : 500, cursor: 'pointer', boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,.08)' : 'none' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
        {visible.map(c => {
          const st = STATUS[c.status] || STATUS.upcoming;
          return (
            <div key={c.id} className="cmp-card cmp-item" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 18, overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setSelected(c)}>
              <div style={{ height: 160, background: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
                <img src={c.img} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div style={{ position: 'absolute', top: 10, right: 10, background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{st.label}</div>
              </div>
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1.3 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>{c.city} · {c.date}</div>
                <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{c.participants}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>участников</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{c.photos}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>фото</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{c.videos}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>видео</div>
                  </div>
                </div>
                <button className="cmp-btn" onClick={e => { e.stopPropagation(); setSelected(c); }}
                  style={{ width: '100%', padding: '9px', background: c.status === 'registration' ? '#375DFB' : '#F3F4F6', border: 'none', borderRadius: 10, color: c.status === 'registration' ? '#fff' : '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {c.status === 'registration' ? 'Зарегистрироваться' : 'Подробнее'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: '#fff', borderRadius: 20, maxWidth: 500, width: '100%', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', height: 180 }}>
              <img src={selected.img} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 50%)' }} />
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: 10, background: 'rgba(0,0,0,.4)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div style={{ position: 'absolute', bottom: 14, left: 18 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{selected.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>{selected.city} · {selected.date}</div>
              </div>
            </div>
            <div style={{ padding: '18px 22px 22px' }}>
              <div style={{ display: 'flex', gap: 18, marginBottom: 14, padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                {[['участников', selected.participants], ['фото', selected.photos], ['видео', selected.videos]].map(([label, val]) => (
                  <div key={label as string} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{val}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, marginBottom: 14 }}>{selected.desc}</div>
              {selected.results.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Результаты:</div>
                  {selected.results.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#374151', marginBottom: 4 }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : '#CD7F32', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                      {r}
                    </div>
                  ))}
                </div>
              )}
              <button className="cmp-btn" onClick={() => { setSelected(null); selected.status === 'registration' ? navigate('/courses') : null; }}
                style={{ width: '100%', padding: '11px', background: selected.status === 'registration' ? '#375DFB' : '#111827', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {selected.status === 'registration' ? 'Зарегистрироваться' : selected.status === 'completed' ? 'Смотреть фотоотчёт' : 'Подробнее'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
