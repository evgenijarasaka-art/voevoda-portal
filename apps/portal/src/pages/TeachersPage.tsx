import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.tp-card{animation:fadeUp .35s ease both}
.tp-card:nth-child(2){animation-delay:.05s}
.tp-card:nth-child(3){animation-delay:.1s}
.tp-card:nth-child(4){animation-delay:.15s}
.tp-card:nth-child(5){animation-delay:.2s}
.tp-card:nth-child(6){animation-delay:.25s}
.tp-person{transition:box-shadow .25s ease,transform .25s ease,border-color .25s}
.tp-person:hover{box-shadow:0 10px 36px rgba(55,93,251,.13);transform:translateY(-4px);border-color:#C7D2FE!important}
.tp-btn{transition:background .15s,transform .1s,border-color .15s}
.tp-btn:hover{transform:translateY(-1px)}
.tp-filter-btn{transition:background .15s,border-color .15s,color .15s}
`;

const TEACHERS = [
  {
    id: 1, name: 'Иванов Александр Викторович', callsign: 'Сокол',
    rank: 'Полковник', spec: 'Тактика и огневая подготовка', courses: 6, students: 1240,
    img: '/teacher1-main.jpg', rating: 4.9, experience: 18, city: 'Москва',
    tags: ['Тактика', 'Огневая подготовка', 'КМБ'],
    bio: 'Боевой офицер с 18-летним стажем. Участник нескольких командировок. Специализируется на тактике городского боя и огневой подготовке личного состава.',
  },
  {
    id: 2, name: 'Петров Владимир Сергеевич', callsign: 'Беркут',
    rank: 'Майор', spec: 'Медицина и выживание', courses: 4, students: 870,
    img: '/teacher2-main.jpg', rating: 4.8, experience: 12, city: 'Санкт-Петербург',
    tags: ['Тактическая медицина', 'Выживание', 'Первая помощь'],
    bio: 'Военный медик первого класса. Преподаёт тактическую медицину и выживание в экстремальных условиях. Опыт — Афганистан, Сирия.',
  },
  {
    id: 3, name: 'Сидоров Дмитрий Николаевич', callsign: 'Гром',
    rank: 'Подполковник', spec: 'Снайперское дело', courses: 3, students: 540,
    img: '/teacher1-small1.jpg', rating: 5.0, experience: 20, city: 'Краснодар',
    tags: ['Снайпинг', 'Маскировка', 'Стрелковое дело'],
    bio: 'Инструктор высшей категории по снайперской подготовке. Разработал авторскую методику обучения маскировке и работе в паре.',
  },
  {
    id: 4, name: 'Козлов Михаил Андреевич', callsign: 'Рысь',
    rank: 'Капитан', spec: 'Рукопашный бой', courses: 5, students: 2100,
    img: '/teacher1-small2.jpg', rating: 4.7, experience: 10, city: 'Москва',
    tags: ['Рукопашный бой', 'Физическая подготовка', 'Силовые структуры'],
    bio: 'Мастер спорта по боевому самбо. Инструктор по рукопашному бою и физической подготовке. Разработчик адаптированных программ для военнослужащих.',
  },
  {
    id: 5, name: 'Новиков Сергей Игоревич', callsign: 'Орёл',
    rank: 'Майор', spec: 'Разведка и наблюдение', courses: 4, students: 780,
    img: '/teacher2-main.jpg', rating: 4.9, experience: 15, city: 'Екатеринбург',
    tags: ['Разведка', 'Наблюдение', 'Беспилотники'],
    bio: 'Специалист в области военной разведки и применения беспилотных систем. Автор методического пособия по тактической разведке.',
  },
  {
    id: 6, name: 'Морозов Андрей Павлович', callsign: 'Леший',
    rank: 'Лейтенант', spec: 'Инженерная подготовка', courses: 2, students: 430,
    img: '/teacher1-small1.jpg', rating: 4.6, experience: 8, city: 'Казань',
    tags: ['Сапёрное дело', 'Инженерная подготовка', 'Полевые укрепления'],
    bio: 'Военный инженер и инструктор по сапёрному делу. Читает курсы по разминированию и полевой фортификации.',
  },
];

const CITIES = ['Все города', 'Москва', 'Санкт-Петербург', 'Краснодар', 'Екатеринбург', 'Казань'];
const SPECS = ['Все специальности', 'Тактика', 'Медицина', 'Снайпинг', 'Рукопашный бой', 'Разведка', 'Инженерная подготовка'];

function injectCss() {
  if (document.getElementById('tp-css')) return;
  const s = document.createElement('style'); s.id = 'tp-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export function TeachersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Все города');
  const [spec, setSpec] = useState('Все специальности');
  const [selected, setSelected] = useState<typeof TEACHERS[0] | null>(null);

  injectCss();

  const visible = TEACHERS.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.callsign.toLowerCase().includes(q) || t.spec.toLowerCase().includes(q);
    const matchCity = city === 'Все города' || t.city === city;
    const matchSpec = spec === 'Все специальности' || t.tags.some(tag => tag.toLowerCase().includes(spec.toLowerCase()));
    return matchSearch && matchCity && matchSpec;
  });

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Назад
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Преподаватели</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Опытные боевые офицеры и инструкторы УТЦ «Воевода»</p>
        </div>
        <div style={{ fontSize: 13, color: '#9CA3AF', background: '#F3F4F6', padding: '6px 14px', borderRadius: 20 }}>
          {visible.length} из {TEACHERS.length} инструкторов
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени, позывному, специальности..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #E5E7EB', borderRadius: 11, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
          />
        </div>
        <select value={city} onChange={e => setCity(e.target.value)} style={{ padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 11, fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none' }}>
          {CITIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={spec} onChange={e => setSpec(e.target.value)} style={{ padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 11, fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none' }}>
          {SPECS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" style={{ marginBottom: 12, opacity: .5 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Ничего не найдено</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Попробуйте изменить фильтры</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {visible.map(t => (
            <div key={t.id} className="tp-card tp-person zoom-on-hover" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 18, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelected(t)}>
              <div style={{ position: 'relative', height: 180, background: '#F3F4F6', overflow: 'hidden' }}>
                <img src={t.img} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{t.rank}</div>
                <div style={{ position: 'absolute', top: 10, right: 10, background: '#375DFB', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>«{t.callsign}»</div>
              </div>
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 2 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>{t.spec} · {t.city}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                  {t.tags.slice(0, 2).map(tag => (
                    <span key={tag} style={{ fontSize: 11, color: '#375DFB', background: '#EBF1FF', padding: '2px 9px', borderRadius: 20 }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{t.courses}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>курсов</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{t.students.toLocaleString('ru')}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>учеников</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{t.experience}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>лет опыта</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#F59E0B' }}>★ {t.rating}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>рейтинг</div>
                  </div>
                </div>
                <button className="tp-btn" onClick={e => { e.stopPropagation(); navigate('/courses'); }} style={{ width: '100%', padding: '9px', background: '#375DFB', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Записаться на курс
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setSelected(null)}>
          <div style={{ background: '#fff', borderRadius: 20, maxWidth: 500, width: '100%', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', height: 200 }}>
              <img src={selected.img} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 50%)' }} />
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: 10, background: 'rgba(0,0,0,.4)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div style={{ position: 'absolute', bottom: 14, left: 18 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>{selected.rank} · «{selected.callsign}» · {selected.city}</div>
              </div>
            </div>
            <div style={{ padding: '20px 22px 22px' }}>
              <div style={{ display: 'flex', gap: 18, marginBottom: 16, padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                {[['курсов', selected.courses], ['учеников', selected.students.toLocaleString('ru')], ['лет опыта', selected.experience], ['★ рейтинг', selected.rating]].map(([label, val]) => (
                  <div key={label as string} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{val}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, marginBottom: 14 }}>{selected.bio}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {selected.tags.map(tag => <span key={tag} style={{ fontSize: 12, color: '#375DFB', background: '#EBF1FF', padding: '3px 11px', borderRadius: 20 }}>{tag}</span>)}
              </div>
              <button className="tp-btn" onClick={() => { setSelected(null); navigate('/courses'); }} style={{ width: '100%', padding: '11px', background: '#375DFB', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Записаться на курс
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
