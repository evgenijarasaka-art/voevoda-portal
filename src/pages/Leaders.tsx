import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userProfilePath } from '../api/testApi';
import { IVDisplay } from '../components/PeopleSection';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.ld-card{animation:fadeUp .35s ease both}
.ld-card:nth-child(2){animation-delay:.04s}
.ld-card:nth-child(3){animation-delay:.08s}
.ld-row{transition:background .15s,box-shadow .2s}
.ld-row:hover{background:#F8FAFF!important;box-shadow:0 2px 12px rgba(55,93,251,.08)}
`;

const LEADERS = [
  { id: 1, pos: 1, name: 'Торнадо',  rank: 'Майор',         iv: 2463, rating: 5.0, courses: 12, awards: 8,  img: '/sold1.png',        city: 'Москва',    community: '«Вымпел»' },
  { id: 2, pos: 2, name: 'Коба',     rank: 'Капитан',       iv: 2340, rating: 5.0, courses: 10, awards: 12, img: '/sold2.png',        city: 'Санкт-Петербург', community: '«Страж»' },
  { id: 3, pos: 3, name: 'Призрак',  rank: 'Подполковник',  iv: 1870, rating: 4.8, courses: 7,  awards: 15, img: '/teacher1-main.jpg', city: 'Екатеринбург', community: '«Рубеж»' },
  { id: 4, pos: 4, name: 'Титан',    rank: 'Полковник',     iv: 3100, rating: 5.0, courses: 12, awards: 24, img: '/teacher2-main.jpg', city: 'Ростов-на-Дону', community: '«Донской»' },
  { id: 5, pos: 5, name: 'Волк',     rank: 'Майор',         iv: 2210, rating: 4.9, courses: 9,  awards: 18, img: '/teacher1-small1.jpg', city: 'Казань', community: '«Татарстан»' },
  { id: 6, pos: 6, name: 'Рысь',     rank: 'Лейтенант',     iv: 1540, rating: 4.6, courses: 4,  awards: 4,  img: '/teacher1-small2.jpg', city: 'Новосибирск', community: '«Сибирь»' },
  { id: 7, pos: 7, name: 'Бор',      rank: 'Ст. лейтенант', iv: 1420, rating: null, courses: 2, awards: 6,  img: '/teacher3-main.jpg',  city: 'Краснодар', community: '«Форпост»' },
  { id: 8, pos: 8, name: 'Стрелок',  rank: 'Сержант',       iv: 1380, rating: 4.5, courses: 6,  awards: 3,  img: '/sold1.png',         city: 'Ростов-на-Дону', community: '«Дон»' },
];

function injectCss() {
  if (document.getElementById('ld-css')) return;
  const s = document.createElement('style'); s.id = 'ld-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export function LeadersPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'all' | 'month' | 'week'>('all');
  injectCss();

  const sorted = [...LEADERS].sort((a, b) => b.iv - a.iv);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 60px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Назад
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Лидеры</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Рейтинг бойцов по индексу воеводы</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 3 }}>
          {([['all','Все время'],['month','Месяц'],['week','Неделя']] as const).map(([id,label]) => (
            <button key={id} onClick={() => setPeriod(id)}
              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: period === id ? '#fff' : 'transparent', color: period === id ? '#111827' : '#6B7280', fontSize: 13, fontWeight: period === id ? 700 : 500, cursor: 'pointer', boxShadow: period === id ? '0 1px 4px rgba(0,0,0,.08)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="ld-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {sorted.slice(0, 3).map((l, i) => {
          const colors = [['#F59E0B', '#FFFBEB', '#FDE68A'], ['#9CA3AF', '#F9FAFB', '#E5E7EB'], ['#CD7F32', '#FFF7ED', '#FED7AA']];
          const [accent, bg, border] = colors[i];
          return (
            <div key={l.id} onClick={() => navigate(userProfilePath(l.name))} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 18, padding: '20px 18px', textAlign: 'center', position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', width: 28, height: 28, borderRadius: '50%', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, border: `3px solid ${bg}` }}>
                {i + 1}
              </div>
              <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', margin: '6px auto 10px', border: `3px solid ${accent}` }}>
                <img src={l.img} alt={l.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 2 }}>{l.name}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{l.rank} · {l.city}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{ textAlign: 'center' }}>
                  <IVDisplay index={l.iv} rating={null} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{l.courses} курсов · {l.awards} наград</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="ld-card" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', fontSize: 12, fontWeight: 700, color: '#9CA3AF', display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 80px', gap: 10, alignItems: 'center' }}>
          <span>#</span><span>Боец</span><span style={{ textAlign: 'right' }}>ИВ</span><span style={{ textAlign: 'right' }}>Рейтинг</span><span style={{ textAlign: 'right' }}>Курсов</span><span style={{ textAlign: 'right' }}>Наград</span>
        </div>
        {sorted.map((l, i) => (
          <div key={l.id} className="ld-row" onClick={() => navigate(userProfilePath(l.name))}
            style={{ padding: '12px 20px', borderBottom: i < sorted.length - 1 ? '1px solid #F3F4F6' : 'none', display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 80px', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: i < 3 ? '#F59E0B' : '#9CA3AF' }}>{i + 1}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                <img src={l.img} alt={l.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{l.name}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{l.rank} · {l.city}</div>
              </div>
            </div>
            <span style={{ justifySelf: 'end' }} onClick={e => e.stopPropagation()}><IVDisplay index={l.iv} rating={null} /></span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B', textAlign: 'right' }}>{l.rating ? `★ ${l.rating}` : '—'}</span>
            <span style={{ fontSize: 13, color: '#374151', textAlign: 'right' }}>{l.courses}</span>
            <span style={{ fontSize: 13, color: '#374151', textAlign: 'right' }}>{l.awards}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
