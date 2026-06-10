import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../useMediaQuery';

const COMMUNITIES = [
  { id: 1, logo: '/soobsh1.png', name: '«Вымпел»', subtitle: 'Создано 12 мая, 2022, Москва', active: 124, members: 2524, awards: 12, articles: 16, photos: 243 },
];
const COMPETITIONS = [
  { id: 1, logo: '/soobsh3.png', name: 'Тактическое ориентирование', city: 'Санкт-Петербург', date: '5 марта, 2024', participants: 620, photos: 24, videos: 2 },
];
const CITIES = [
  { id: 1, logo: '/soobsh4.png', name: 'Москва', subtitle: 'Центральный Федеральный Округ', active: 124842, commanders: 16, instructors: 22, heroes: 124, exercises: 4 },
];

function CardLogo({ src }: { src: string }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
      {!err ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setErr(true)} /> : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
    </div>
  );
}

function StatRow({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string | number; link?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F5F5F7' }}>
      <span style={{ color: '#9CA3AF', flexShrink: 0, marginRight: 10 }}>{icon}</span>
      <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: link ? '#375DFB' : '#374151', cursor: link ? 'pointer' : 'default' }}>{value}</span>
    </div>
  );
}

function Btn({ primary, label, onClick }: { primary?: boolean; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: primary ? '1px solid #C7D2FE' : '1px solid #E5E7EB', background: primary ? '#EBF1FF' : '#fff', color: primary ? '#375DFB' : '#374151', fontSize: 13, fontWeight: primary ? 600 : 400, cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.background = primary ? '#DFE8FF' : '#F9FAFB')}
      onMouseLeave={e => (e.currentTarget.style.background = primary ? '#EBF1FF' : '#fff')}>
      {label}
    </button>
  );
}

function AllBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, color: '#4B5563', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#EBF1FF'; e.currentTarget.style.color = '#375DFB'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#4B5563'; }}>
      Все <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  );
}

function IcUsers() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function IcAward() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>; }
function IcDoc() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function IcPhoto() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }
function IcCity() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>; }
function IcCalendar() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IcVideo() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>; }
function IcStar() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function IcShield() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function IcTarget() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>; }

export function BottomSection() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  return (
    <div style={{ padding: isMobile ? '16px 16px 0' : '24px 24px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>

        {/* Сообщества */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IcUsers /><span style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>Сообщества</span></div>
            <AllBtn onClick={() => navigate('/communities')} />
          </div>
          {COMMUNITIES.map(c => (
            <div key={c.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <CardLogo src={c.logo} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{c.subtitle}</div>
                </div>
              </div>
              <StatRow icon={<IcUsers />} label="В строю" value={c.active} />
              <StatRow icon={<IcUsers />} label="Участников" value={c.members.toLocaleString()} />
              <StatRow icon={<IcAward />} label="Наград" value={c.awards} />
              <StatRow icon={<IcDoc />} label="Статьи" value={c.articles} link />
              <StatRow icon={<IcPhoto />} label="Фотографии" value={c.photos} link />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Btn primary label="Подробнее" onClick={() => navigate('/communities')} />
                <Btn label="Подать заявку" />
              </div>
            </div>
          ))}
        </div>

        {/* Соревнования */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IcTarget /><span style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>Соревнования</span></div>
            <AllBtn onClick={() => navigate('/competitions')} />
          </div>
          {COMPETITIONS.map(c => (
            <div key={c.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <CardLogo src={c.logo} />
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{c.name}</div>
              </div>
              <StatRow icon={<IcCity />} label="Город" value={c.city} />
              <StatRow icon={<IcCalendar />} label="Дата" value={c.date} />
              <StatRow icon={<IcUsers />} label="Участников" value={c.participants} />
              <StatRow icon={<IcPhoto />} label="Фотографии" value={c.photos} link />
              <StatRow icon={<IcVideo />} label="Видео" value={c.videos} link />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Btn primary label="Подробнее" onClick={() => navigate('/competitions')} />
                <Btn label="Участники" />
              </div>
            </div>
          ))}
        </div>

        {/* Города */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IcCity /><span style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>Города</span></div>
            <AllBtn onClick={() => navigate('/cities')} />
          </div>
          {CITIES.map(c => (
            <div key={c.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <CardLogo src={c.logo} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{c.subtitle}</div>
                </div>
              </div>
              <StatRow icon={<IcUsers />} label="В строю" value={c.active.toLocaleString()} />
              <StatRow icon={<IcShield />} label="Командиры" value={c.commanders} link />
              <StatRow icon={<IcStar />} label="Инструктора" value={c.instructors} link />
              <StatRow icon={<IcAward />} label="Наши герои" value={c.heroes} link />
              <StatRow icon={<IcTarget />} label="Учения" value={c.exercises} link />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Btn primary label="Подробнее" onClick={() => navigate('/cities')} />
                <Btn label="Участники" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}