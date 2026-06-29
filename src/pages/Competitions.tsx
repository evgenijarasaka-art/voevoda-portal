import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type Status = 'registration' | 'upcoming' | 'completed';
type Tab = 'all' | Status;

type Competition = {
  id: number;
  title: string;
  discipline: string;
  city: string;
  date: string;
  time: string;
  status: Status;
  image: string;
  participants: number;
  teams: number;
  photos: number;
  videos: number;
  readiness: number;
  prize: string;
  description: string;
  results: string[];
};

const CSS = `
@keyframes cmpFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes cmpScaleIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
.cmp-page {
  width:100%;
  max-width:1560px;
  margin:0 auto;
  padding:32px 28px 60px;
  box-sizing:border-box;
}
.cmp-command,
.cmp-panel,
.cmp-card,
.cmp-modal-card {
  background:#fff;
  border:1px solid #E1E7F0;
  box-shadow:0 16px 42px rgba(30,50,96,.07);
}
.cmp-command {
  position:relative;
  overflow:hidden;
  border-radius:20px;
  padding:26px 28px;
  animation:cmpFadeUp .38s ease both;
}
.cmp-command:before {
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(180deg,rgba(248,251,255,.92),rgba(255,255,255,0));
  pointer-events:none;
}
.cmp-command > * { position:relative; z-index:1; }
.cmp-title {
  font-size:30px;
  line-height:1.08;
  font-weight:900;
  color:#101828;
  letter-spacing:0;
  margin:0 0 10px;
}
.cmp-subtitle {
  max-width:680px;
  margin:0;
  font-size:15px;
  line-height:1.65;
  color:#667085;
}
.cmp-actions { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
.cmp-button {
  border:0;
  border-radius:10px;
  padding:12px 18px;
  min-height:44px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  font-size:14px;
  font-weight:800;
  cursor:pointer;
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease, color .18s ease;
}
.cmp-button:hover { transform:translateY(-1px); }
.cmp-button-primary {
  color:#fff;
  background:#375DFB;
  box-shadow:0 10px 24px rgba(55,93,251,.28);
}
.cmp-button-soft {
  color:#344054;
  background:#F7F9FC;
  border:1px solid #E1E7F0;
  box-shadow:none;
}
.cmp-stats {
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:14px;
  margin:16px 0;
}
.cmp-stat {
  border-radius:16px;
  padding:16px;
  background:#fff;
  border:1px solid #E1E7F0;
  animation:cmpFadeUp .38s ease both;
}
.cmp-stat:nth-child(2){animation-delay:.04s}
.cmp-stat:nth-child(3){animation-delay:.08s}
.cmp-stat:nth-child(4){animation-delay:.12s}
.cmp-stat-value { font-size:25px; font-weight:900; color:#101828; line-height:1; }
.cmp-stat-label { margin-top:7px; font-size:12px; font-weight:700; color:#8A94A6; }
.cmp-panel {
  border-radius:20px;
  overflow:hidden;
  animation:cmpFadeUp .42s .06s ease both;
}
.cmp-feature {
  display:grid;
  grid-template-columns:minmax(0,1.15fr) minmax(360px,.85fr);
  gap:0;
  margin-bottom:16px;
}
.cmp-feature-media {
  min-height:390px;
  position:relative;
  background:#EEF2F7;
  overflow:hidden;
}
.cmp-feature-media img,
.cmp-card-media img {
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center top;
  display:block;
  transition:transform .65s cubic-bezier(.22,1,.36,1);
}
.cmp-feature-media:hover img,
.cmp-card:hover .cmp-card-media img { transform:scale(1.045); }
.cmp-feature-shade {
  position:absolute;
  inset:0;
  background:linear-gradient(to top,rgba(16,24,40,.62),rgba(16,24,40,.08) 58%,rgba(16,24,40,0));
}
.cmp-feature-info {
  position:absolute;
  left:24px;
  right:24px;
  bottom:22px;
  color:#fff;
}
.cmp-kicker {
  display:inline-flex;
  align-items:center;
  gap:7px;
  padding:6px 10px;
  border-radius:999px;
  background:rgba(255,255,255,.92);
  color:#253858;
  font-size:11px;
  font-weight:900;
  text-transform:uppercase;
  letter-spacing:.5px;
}
.cmp-feature-title {
  margin:14px 0 8px;
  font-size:34px;
  line-height:1.08;
  font-weight:900;
  letter-spacing:0;
}
.cmp-feature-meta { display:flex; flex-wrap:wrap; gap:8px; color:rgba(255,255,255,.82); font-size:13px; font-weight:700; }
.cmp-feature-side { padding:24px; display:flex; flex-direction:column; gap:16px; }
.cmp-status {
  display:inline-flex;
  align-items:center;
  gap:7px;
  width:max-content;
  border-radius:999px;
  padding:6px 11px;
  font-size:12px;
  font-weight:900;
}
.cmp-status:before {
  content:"";
  width:8px;
  height:8px;
  border-radius:999px;
  background:currentColor;
}
.cmp-status-registration { color:#375DFB; background:#EEF3FF; }
.cmp-status-upcoming { color:#D97706; background:#FFF7ED; }
.cmp-status-completed { color:#059669; background:#ECFDF5; }
.cmp-description { color:#53617A; font-size:14px; line-height:1.7; margin:0; }
.cmp-progress {
  height:8px;
  border-radius:999px;
  background:#E8EEF8;
  overflow:hidden;
}
.cmp-progress span {
  display:block;
  height:100%;
  border-radius:999px;
  background:#375DFB;
  transition:width .6s cubic-bezier(.22,1,.36,1);
}
.cmp-mini-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
.cmp-mini {
  border-radius:12px;
  background:#F8FAFD;
  border:1px solid #E6ECF5;
  padding:12px;
}
.cmp-mini strong { display:block; font-size:18px; color:#111827; line-height:1; }
.cmp-mini span { display:block; margin-top:6px; font-size:11px; color:#8A94A6; font-weight:700; }
.cmp-toolbar {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin:20px 0 14px;
}
.cmp-tabs {
  display:flex;
  align-items:center;
  gap:6px;
  padding:4px;
  border:1px solid #E1E7F0;
  border-radius:12px;
  background:#F7F9FC;
  overflow-x:auto;
}
.cmp-tab {
  border:0;
  border-radius:9px;
  min-height:36px;
  padding:0 14px;
  color:#667085;
  background:transparent;
  font-size:13px;
  font-weight:800;
  white-space:nowrap;
  cursor:pointer;
  transition:background .18s ease,color .18s ease,box-shadow .18s ease;
}
.cmp-tab.is-active {
  color:#fff;
  background:#375DFB;
  box-shadow:0 8px 18px rgba(55,93,251,.22);
}
.cmp-layout {
  display:grid;
  grid-template-columns:minmax(0,1fr) 360px;
  gap:18px;
  align-items:start;
}
.cmp-cards {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:16px;
}
.cmp-card {
  border-radius:18px;
  overflow:hidden;
  cursor:pointer;
  transition:transform .24s cubic-bezier(.22,1,.36,1), box-shadow .24s ease, border-color .24s ease;
  animation:cmpFadeUp .36s ease both;
}
.cmp-card:hover {
  transform:translateY(-4px);
  border-color:#C7D2FE;
  box-shadow:0 20px 46px rgba(31,53,104,.12);
}
.cmp-card-media {
  height:208px;
  position:relative;
  overflow:hidden;
  background:#EEF2F7;
}
.cmp-card-body { padding:16px; }
.cmp-card-title { font-size:18px; line-height:1.25; font-weight:900; color:#101828; margin:0 0 8px; }
.cmp-card-meta { display:flex; flex-wrap:wrap; gap:8px; color:#667085; font-size:12px; font-weight:700; margin-bottom:13px; }
.cmp-card-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.cmp-counts { display:flex; gap:10px; color:#667085; font-size:12px; font-weight:800; }
.cmp-counts span { display:inline-flex; align-items:center; gap:4px; }
.cmp-aside { display:flex; flex-direction:column; gap:16px; position:sticky; top:76px; }
.cmp-side-block { border-radius:18px; padding:18px; background:#fff; border:1px solid #E1E7F0; box-shadow:0 14px 34px rgba(30,50,96,.06); }
.cmp-side-title { display:flex; align-items:center; gap:9px; margin:0 0 14px; font-size:17px; color:#101828; font-weight:900; }
.cmp-leader { display:grid; grid-template-columns:30px 44px 1fr auto; align-items:center; gap:10px; padding:10px 0; border-top:1px solid #F0F3F8; }
.cmp-leader:first-of-type { border-top:0; }
.cmp-rank { font-weight:900; color:#98A2B3; text-align:center; }
.cmp-leader img { width:44px; height:44px; border-radius:12px; object-fit:cover; object-position:center top; background:#F2F4F7; }
.cmp-leader-name { font-size:13px; font-weight:900; color:#101828; }
.cmp-leader-sub { margin-top:2px; font-size:11px; color:#8A94A6; font-weight:700; }
.cmp-score { font-size:13px; font-weight:900; color:#375DFB; }
.cmp-schedule-item { display:flex; gap:12px; padding:12px 0; border-top:1px solid #F0F3F8; }
.cmp-schedule-item:first-of-type { border-top:0; }
.cmp-datebox { width:52px; height:52px; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#EEF3FF; color:#375DFB; flex-shrink:0; }
.cmp-datebox strong { font-size:17px; line-height:1; }
.cmp-datebox span { font-size:10px; font-weight:900; text-transform:uppercase; margin-top:3px; }
.cmp-modal-overlay {
  position:fixed;
  inset:0;
  z-index:10000;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
  background:rgba(15,23,42,.58);
  backdrop-filter:blur(7px);
  animation:cmpScaleIn .16s ease both;
}
.cmp-modal-card {
  width:min(900px,100%);
  max-height:88vh;
  border-radius:22px;
  overflow:hidden;
  display:grid;
  grid-template-columns:minmax(0,.92fr) minmax(360px,1fr);
  box-shadow:0 34px 90px rgba(15,23,42,.32);
  animation:cmpScaleIn .2s ease both;
}
.cmp-modal-media { min-height:100%; background:#EEF2F7; position:relative; overflow:hidden; }
.cmp-modal-media img { width:100%; height:100%; object-fit:cover; object-position:center top; display:block; }
.cmp-modal-body { padding:24px; overflow:auto; }
.cmp-close {
  position:absolute;
  top:14px;
  right:14px;
  width:38px;
  height:38px;
  border-radius:10px;
  border:0;
  background:rgba(255,255,255,.92);
  color:#344054;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
}
@media(max-width:1180px){
  .cmp-layout,.cmp-feature{grid-template-columns:1fr}
  .cmp-aside{position:static;display:grid;grid-template-columns:1fr 1fr}
}
@media(max-width:860px){
  .cmp-page{padding-left:16px;padding-right:16px}
  .cmp-command{padding:22px}
  .cmp-title{font-size:25px}
  .cmp-stats,.cmp-cards,.cmp-aside,.cmp-mini-grid{grid-template-columns:1fr}
  .cmp-toolbar{align-items:stretch;flex-direction:column}
  .cmp-modal-card{grid-template-columns:1fr;max-height:90vh}
  .cmp-modal-media{height:250px}
}
`;

const COMPETITIONS: Competition[] = [
  {
    id: 1,
    title: 'Тактическое ориентирование',
    discipline: 'Командный зачёт',
    city: 'Санкт-Петербург',
    date: '5 марта, 2024',
    time: '09:00',
    status: 'completed',
    image: '/sorev1.png',
    participants: 620,
    teams: 31,
    photos: 24,
    videos: 2,
    readiness: 100,
    prize: 'Кубок навигации',
    description: 'Маршрут с контрольными точками, вводными задачами и работой связок на пересечённой местности.',
    results: ['1 место: «Вымпел», Москва', '2 место: «Рубеж», Екатеринбург', '3 место: «Страж», Санкт-Петербург'],
  },
  {
    id: 2,
    title: 'Марш-бросок на 10 км',
    discipline: 'Личный зачёт',
    city: 'Москва',
    date: '14 мая, 2024',
    time: '08:30',
    status: 'upcoming',
    image: '/sorev2.png',
    participants: 340,
    teams: 18,
    photos: 18,
    videos: 1,
    readiness: 76,
    prize: 'Знак выносливости',
    description: 'Дистанция с полной выкладкой, контрольным временем и медицинским осмотром на финише.',
    results: [],
  },
  {
    id: 3,
    title: 'Линия обороны',
    discipline: 'Тактическая группа',
    city: 'Краснодар',
    date: '16 мая, 2024',
    time: '10:00',
    status: 'upcoming',
    image: '/soobsh2.png',
    participants: 180,
    teams: 12,
    photos: 32,
    videos: 3,
    readiness: 64,
    prize: 'Командный вымпел',
    description: 'Удержание позиций, смена рубежей, эвакуация условно раненого и работа с группой связи.',
    results: [],
  },
  {
    id: 4,
    title: 'Стрельба из АК-74',
    discipline: 'Огневой рубеж',
    city: 'Москва',
    date: '20 мая, 2024',
    time: '11:00',
    status: 'registration',
    image: '/voen3.png',
    participants: 520,
    teams: 24,
    photos: 15,
    videos: 2,
    readiness: 42,
    prize: 'Лучший стрелок',
    description: 'Три дистанции, отдельный зачёт для новичков и опытных участников, фиксация результатов инструктором.',
    results: [],
  },
  {
    id: 5,
    title: 'Военный триатлон',
    discipline: 'Смешанный зачёт',
    city: 'Казань',
    date: '1 июня, 2024',
    time: '09:30',
    status: 'registration',
    image: '/voen1.png',
    participants: 250,
    teams: 16,
    photos: 0,
    videos: 0,
    readiness: 35,
    prize: 'Кубок Воеводы',
    description: 'Бег, полоса препятствий и стрелковый этап. Можно выйти личным номером или в составе отделения.',
    results: [],
  },
  {
    id: 6,
    title: 'Полоса препятствий «Рубеж»',
    discipline: 'Личный зачёт',
    city: 'Москва',
    date: '18 апреля, 2024',
    time: '10:30',
    status: 'completed',
    image: '/soobsh3.png',
    participants: 280,
    teams: 20,
    photos: 36,
    videos: 4,
    readiness: 100,
    prize: 'Шеврон «Рубеж»',
    description: 'Рукоход, стенка, перенос снаряжения и огневой рубеж с итоговым временем прохождения.',
    results: ['1 место: Торнадо', '2 место: Коба', '3 место: Бек'],
  },
];

const STATUS_LABELS: Record<Status, string> = {
  registration: 'Идёт регистрация',
  upcoming: 'Скоро старт',
  completed: 'Завершено',
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'registration', label: 'Регистрация' },
  { id: 'upcoming', label: 'Скоро' },
  { id: 'completed', label: 'Итоги' },
];

const LEADERS = [
  { name: 'Торнадо', role: 'майор, Москва', image: '/sold1.png', score: 98 },
  { name: 'Коба', role: 'капитан, Санкт-Петербург', image: '/sold2.png', score: 94 },
  { name: 'Бек', role: 'инструктор, Казань', image: '/teacher1-main.jpg', score: 91 },
  { name: 'Резак', role: 'капитан, Краснодар', image: '/teacher2-main.jpg', score: 88 },
];

function injectCss() {
  const existing = document.getElementById('competitions-page-css');
  if (existing) {
    existing.textContent = CSS;
    return;
  }
  const style = document.createElement('style');
  style.id = 'competitions-page-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}

function Icon({ type, size = 16 }: { type: 'users' | 'flag' | 'photo' | 'video' | 'award' | 'calendar'; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'users') return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  if (type === 'flag') return <svg {...common}><path d="M4 22V4" /><path d="M4 4h13l-1.6 4L17 12H4" /></svg>;
  if (type === 'photo') return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>;
  if (type === 'video') return <svg {...common}><path d="m22 8-6 4 6 4V8Z" /><rect x="2" y="6" width="14" height="12" rx="2" /></svg>;
  if (type === 'calendar') return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
  return <svg {...common}><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>;
}

function StatusPill({ status }: { status: Status }) {
  return <span className={`cmp-status cmp-status-${status}`}>{STATUS_LABELS[status]}</span>;
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="cmp-stat">
      <div className="cmp-stat-value">{typeof value === 'number' ? value.toLocaleString('ru') : value}</div>
      <div className="cmp-stat-label">{label}</div>
    </div>
  );
}

function MiniStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="cmp-mini">
      <strong>{typeof value === 'number' ? value.toLocaleString('ru') : value}</strong>
      <span>{label}</span>
    </div>
  );
}

function CompetitionCard({ competition, onOpen }: { competition: Competition; onOpen: (competition: Competition) => void }) {
  return (
    <article className="cmp-card" onClick={() => onOpen(competition)}>
      <div className="cmp-card-media">
        <img src={competition.image} alt={competition.title} onError={(event) => { event.currentTarget.src = '/sorev1.png'; }} />
        <div style={{ position: 'absolute', top: 12, left: 12 }}><StatusPill status={competition.status} /></div>
      </div>
      <div className="cmp-card-body">
        <h2 className="cmp-card-title">{competition.title}</h2>
        <div className="cmp-card-meta">
          <span>{competition.city}</span>
          <span>{competition.date}</span>
          <span>{competition.discipline}</span>
        </div>
        <div className="cmp-card-footer">
          <div className="cmp-counts">
            <span><Icon type="users" size={13} />{competition.participants}</span>
            <span><Icon type="photo" size={13} />{competition.photos}</span>
            <span><Icon type="video" size={13} />{competition.videos}</span>
          </div>
          <button className="cmp-button cmp-button-soft" style={{ minHeight: 34, padding: '8px 12px', fontSize: 12 }}>
            {competition.status === 'completed' ? 'Итоги' : 'Подробнее'}
          </button>
        </div>
      </div>
    </article>
  );
}

export function CompetitionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>('all');
  const [selected, setSelected] = useState<Competition | null>(null);
  const [registeredIds, setRegisteredIds] = useState<number[]>([]);

  useEffect(() => {
    injectCss();
  }, []);

  useEffect(() => {
    const id = Number(searchParams.get('competition'));
    if (!id) return;
    const competition = COMPETITIONS.find((item) => item.id === id);
    if (competition) setSelected(competition);
  }, [searchParams]);

  const visible = useMemo(
    () => COMPETITIONS.filter((competition) => tab === 'all' || competition.status === tab),
    [tab],
  );
  const featured = COMPETITIONS.find((competition) => competition.status === 'registration') ?? COMPETITIONS[0];
  const totalParticipants = COMPETITIONS.reduce((sum, item) => sum + item.participants, 0);
  const totalTeams = COMPETITIONS.reduce((sum, item) => sum + item.teams, 0);
  const activeCount = COMPETITIONS.filter((item) => item.status !== 'completed').length;

  const openCompetition = (competition: Competition) => {
    setSelected(competition);
    const next = new URLSearchParams(searchParams);
    next.set('competition', String(competition.id));
    setSearchParams(next);
  };

  const closeCompetition = () => {
    setSelected(null);
    if (searchParams.has('competition')) {
      const next = new URLSearchParams(searchParams);
      next.delete('competition');
      setSearchParams(next, { replace: true });
    }
  };

  const toggleRegistration = (competition: Competition) => {
    setRegisteredIds((ids) =>
      ids.includes(competition.id) ? ids.filter((id) => id !== competition.id) : [...ids, competition.id],
    );
  };

  return (
    <div className="cmp-page">
      <section className="cmp-command">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div className="cmp-kicker"><Icon type="award" size={13} /> Полигон Воеводы</div>
            <div className="cmp-title" role="heading" aria-level={1}>Соревнования</div>
            <p className="cmp-subtitle">Заявки, ближайшие старты, итоги и медиа с учебных состязаний собраны в одном строевом журнале.</p>
          </div>
          <div className="cmp-actions">
            <button className="cmp-button cmp-button-soft" onClick={() => setTab('completed')}>
              <Icon type="award" /> Смотреть итоги
            </button>
            <button className="cmp-button cmp-button-primary" onClick={() => openCompetition(featured)}>
              <Icon type="flag" /> Подать заявку
            </button>
          </div>
        </div>
      </section>

      <div className="cmp-stats">
        <Stat value={COMPETITIONS.length} label="соревнований в журнале" />
        <Stat value={activeCount} label="активных стартов" />
        <Stat value={totalParticipants} label="участников" />
        <Stat value={totalTeams} label="команд" />
      </div>

      <section className="cmp-panel cmp-feature">
        <div className="cmp-feature-media">
          <img src={featured.image} alt={featured.title} onError={(event) => { event.currentTarget.src = '/sorev1.png'; }} />
          <div className="cmp-feature-shade" />
          <div className="cmp-feature-info">
            <StatusPill status={featured.status} />
            <div className="cmp-feature-title">{featured.title}</div>
            <div className="cmp-feature-meta">
              <span>{featured.city}</span>
              <span>{featured.date}</span>
              <span>{featured.time}</span>
              <span>{featured.discipline}</span>
            </div>
          </div>
        </div>
        <div className="cmp-feature-side">
          <div>
            <div style={{ color: '#8A94A6', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 8 }}>Ближайший старт</div>
            <p className="cmp-description">{featured.description}</p>
          </div>
          <div className="cmp-mini-grid">
            <MiniStat value={featured.participants} label="участников" />
            <MiniStat value={featured.teams} label="команд" />
            <MiniStat value={featured.prize} label="награда" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8, color: '#53617A', fontSize: 12, fontWeight: 800 }}>
              <span>Готовность старта</span>
              <span>{featured.readiness}%</span>
            </div>
            <div className="cmp-progress"><span style={{ width: `${featured.readiness}%` }} /></div>
          </div>
          <button className="cmp-button cmp-button-primary" onClick={() => openCompetition(featured)}>
            {registeredIds.includes(featured.id) ? 'Заявка уже подана' : 'Открыть карточку'}
          </button>
        </div>
      </section>

      <div className="cmp-toolbar">
        <div className="cmp-tabs" aria-label="Фильтр соревнований">
          {TABS.map((item) => (
            <button key={item.id} className={`cmp-tab${tab === item.id ? ' is-active' : ''}`} onClick={() => setTab(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <div style={{ color: '#8A94A6', fontSize: 13, fontWeight: 800 }}>Показано: {visible.length}</div>
      </div>

      <div className="cmp-layout">
        <div className="cmp-cards">
          {visible.map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} onOpen={openCompetition} />
          ))}
        </div>

        <aside className="cmp-aside">
          <section className="cmp-side-block">
            <h2 className="cmp-side-title"><Icon type="award" /> Рейтинг сезона</h2>
            {LEADERS.map((leader, index) => (
              <div className="cmp-leader" key={leader.name}>
                <div className="cmp-rank">{index + 1}</div>
                <img src={leader.image} alt={leader.name} />
                <div>
                  <div className="cmp-leader-name">{leader.name}</div>
                  <div className="cmp-leader-sub">{leader.role}</div>
                </div>
                <div className="cmp-score">{leader.score}</div>
              </div>
            ))}
          </section>

          <section className="cmp-side-block">
            <h2 className="cmp-side-title"><Icon type="calendar" /> Расписание</h2>
            {COMPETITIONS.filter((competition) => competition.status !== 'completed').slice(0, 3).map((competition) => (
              <div className="cmp-schedule-item" key={competition.id}>
                <div className="cmp-datebox">
                  <strong>{competition.date.split(' ')[0]}</strong>
                  <span>{competition.date.split(' ')[1]?.slice(0, 3)}</span>
                </div>
                <div>
                  <div style={{ color: '#101828', fontSize: 13, fontWeight: 900, marginBottom: 4 }}>{competition.title}</div>
                  <div style={{ color: '#8A94A6', fontSize: 12, fontWeight: 700 }}>{competition.city} · {competition.time}</div>
                </div>
              </div>
            ))}
          </section>
        </aside>
      </div>

      {selected && (
        <div className="cmp-modal-overlay" onClick={closeCompetition}>
          <div className="cmp-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="cmp-modal-media">
              <img src={selected.image} alt={selected.title} onError={(event) => { event.currentTarget.src = '/sorev1.png'; }} />
            </div>
            <div className="cmp-modal-body">
              <button className="cmp-close" onClick={closeCompetition} aria-label="Закрыть">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
              <StatusPill status={selected.status} />
              <h2 style={{ margin: '16px 0 8px', color: '#101828', fontSize: 28, lineHeight: 1.12, fontWeight: 900 }}>{selected.title}</h2>
              <div className="cmp-card-meta" style={{ marginBottom: 18 }}>
                <span>{selected.city}</span>
                <span>{selected.date}</span>
                <span>{selected.time}</span>
                <span>{selected.discipline}</span>
              </div>
              <p className="cmp-description" style={{ marginBottom: 18 }}>{selected.description}</p>
              <div className="cmp-mini-grid" style={{ marginBottom: 18 }}>
                <MiniStat value={selected.participants} label="участников" />
                <MiniStat value={selected.teams} label="команд" />
                <MiniStat value={selected.prize} label="награда" />
              </div>
              {selected.results.length > 0 && (
                <div style={{ borderTop: '1px solid #EEF2F7', paddingTop: 14, marginBottom: 18 }}>
                  <div style={{ color: '#101828', fontSize: 14, fontWeight: 900, marginBottom: 10 }}>Итоги</div>
                  {selected.results.map((result, index) => (
                    <div key={result} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', color: '#475467', fontSize: 13, fontWeight: 700 }}>
                      <span style={{ width: 26, height: 26, borderRadius: 8, background: index === 0 ? '#FFF7ED' : '#F2F4F7', color: index === 0 ? '#D97706' : '#667085', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{index + 1}</span>
                      {result}
                    </div>
                  ))}
                </div>
              )}
              <button
                className={`cmp-button ${selected.status === 'registration' ? 'cmp-button-primary' : 'cmp-button-soft'}`}
                style={{ width: '100%' }}
                onClick={() => selected.status === 'registration' ? toggleRegistration(selected) : closeCompetition()}
              >
                {selected.status === 'registration'
                  ? registeredIds.includes(selected.id) ? 'Заявка подана · отменить' : 'Подать заявку'
                  : selected.status === 'completed' ? 'Закрыть итоги' : 'Буду следить за стартом'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
