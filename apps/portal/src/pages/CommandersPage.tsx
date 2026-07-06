import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BADGE_TOOLTIPS, IVDisplay, ElitaBadge, BadgeBox, ExtraBadge } from '../components/PeopleSection';
import { TrainingPanel, MeasurementsPanel } from '../components/IndexCharts';
import { ReportFormModal, StatusModal, STATUS_REQUESTED, STATUS_SUBMITTED, STATUS_ERROR, type ReportStatus } from '../components/ReportModals';
import { PortalPageTop } from '../components/PortalPageTop';

/* ─── данные ─── */
const BIO = 'Попал я в ВДВ не просто так. Ещё на гражданке отпрыгал в ДОСААФ три прыжка. Не знаю как сейчас, а тогда это было бесплатно. Зато почти гарантированно должен был попасть в ВДВ. Придя в военкомат, туда и направили - ВДВ. Служивый может носить любые погоны. Но если он от природы мужественен, вынослив и полон сил даже на последнем издыхании.';

type Commander = {
  name: string; rank: string; iv: number; rating: number; avatar: string; pogon: string;
  position: string; badges: string[]; extra: number;
  superior: { name: string; rank: string; role: string; avatar: string };
  jobPosition: string; zvanie: string; specialty: string;
  courseBadges: string[]; diploma: string;
  city: string; birthYear: string; onPortal: string; community: string;
  courses: number; awards: number; followers: number; bioImage: string; bio: string;
};

const SUPERIOR = { name: 'Бек', rank: 'Майор', role: 'Командир', avatar: '/sold1.png' };
const COMMON = {
  position: 'КР 2-й роты, 77-й учебный батальон',
  badges: ['/1.png', '/2.png', '/3.png', '/medal.png'], extra: 4,
  superior: SUPERIOR,
  jobPosition: 'Зам. командира взвода', zvanie: 'Старший лейтенант', specialty: 'Пулеметчик',
  courseBadges: ['/medal.png', '/1.png', '/3.png', '/2.png'], diploma: '/blag1.png',
  city: 'Москва', birthYear: '5 марта, 1990', onPortal: '2 года, 9 месяцев', community: '«Вымпел»',
  courses: 3, awards: 8, followers: 1288, bioImage: '/tank.png', bio: BIO,
};

const COMMANDERS: Commander[] = [
  { name: 'Коба', rank: 'Капитан', iv: 2463, rating: 5.0, avatar: '/sold2.png', pogon: '/rank2.png', ...COMMON },
  { name: 'Тор', rank: 'Лейтенант', iv: 2463, rating: 5.0, avatar: '/sold1.png', pogon: '/rank1.png', ...COMMON },
  { name: 'Стрелок', rank: 'Капитан', iv: 2463, rating: 5.0, avatar: '/sold3.png', pogon: '/rank2.png', ...COMMON },
];

const CSS = `
.cmd-page { padding-top:60px; margin-left:56px; min-height:100vh; background:#F8F9FB; }
.cmd-wrap { padding:20px 24px 56px; }
.cmd-panel { background:#fff; border:1px solid #E5E7EB; border-radius:20px; overflow:hidden; animation:cmdFade .4s ease both; }
@keyframes cmdFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
.cmd-head { display:flex; align-items:center; gap:12px; padding:22px 28px; }
.cmd-head h1 { margin:0; font-size:24px; font-weight:800; color:#111; }
.cmd-crumbs { display:flex; align-items:center; gap:8px; padding:13px 28px; border-top:1px solid #F0F1F3; border-bottom:1px solid #F0F1F3; font-size:13px; color:#9CA3AF; flex-wrap:wrap; }
.cmd-crumbs button { border:none; background:none; cursor:pointer; color:#9CA3AF; font:inherit; padding:0; transition:color .15s; }
.cmd-crumbs button:hover { color:#375DFB; }
.cmd-crumbs .cur { color:#374151; font-weight:500; }
.cmd-list { padding:22px 28px 28px; display:flex; flex-direction:column; gap:20px; }

.cmd-card { border:1px solid #E5E7EB; border-radius:18px; padding:22px; transition:box-shadow .25s ease,border-color .25s ease; }
.cmd-card:hover { border-color:#DCE3F5; box-shadow:0 14px 36px rgba(26,39,68,.07); }
.cmd-top { display:flex; align-items:center; gap:18px; flex-wrap:wrap; margin-bottom:18px; }
.cmd-av { position:relative; flex-shrink:0; }
.cmd-av .pic { width:104px; height:104px; border-radius:18px; overflow:hidden; border:2px solid #EAECF0; background:#1a2744; }
.cmd-av .pic img { width:100%; height:100%; object-fit:cover; display:block; }
.cmd-av .pogon { position:absolute; bottom:-10px; right:-12px; width:46px; height:46px; object-fit:contain; filter:drop-shadow(0 3px 8px rgba(0,0,0,.4)); }
.cmd-info { flex:1; min-width:200px; }
.cmd-rank { font-size:13px; color:#9CA3AF; margin-bottom:4px; }
.cmd-nameline { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:6px; }
.cmd-name { font-size:26px; font-weight:800; color:#111; letter-spacing:-.3px; }
.cmd-pos { font-size:13px; color:#6B7280; }
.cmd-badges { display:flex; align-items:center; gap:10px; }

.cmd-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px; }
.cmd-tab { padding:9px 18px; border-radius:10px; border:none; background:#F1F3F7; color:#6B7280; font:600 14px inherit; cursor:pointer; transition:all .18s; }
.cmd-tab:hover { color:#111; }
.cmd-tab.active { background:#fff; color:#111; box-shadow:0 2px 8px rgba(17,24,39,.1); border:1px solid #E5E7EB; }

.cmd-sub { font-size:14px; color:#9CA3AF; margin-bottom:10px; }
.cmd-cmd { display:flex; align-items:center; gap:14px; border:1px solid #EEF0F4; background:#F7F8FB; border-radius:16px; padding:14px 18px; flex-wrap:wrap; }
.cmd-cmd-av { width:52px; height:52px; border-radius:50%; overflow:hidden; flex-shrink:0; background:#1a2744; }
.cmd-cmd-av img { width:100%; height:100%; object-fit:cover; }
.cmd-cmd-name { font-size:17px; font-weight:700; color:#111; }
.cmd-cmd-sub { font-size:13px; color:#9CA3AF; }
.cmd-cmd-actions { margin-left:auto; display:flex; gap:10px; flex-wrap:wrap; }
.cmd-fields { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:18px; }
@media(max-width:680px){ .cmd-fields { grid-template-columns:1fr; } }
.cmd-field { border:1px solid #E5E7EB; border-radius:14px; padding:13px 16px; }
.cmd-field .k { font-size:13px; color:#9CA3AF; margin-bottom:6px; }
.cmd-field .v { font-size:16px; font-weight:600; color:#111; }
.cmd-bh { display:flex; align-items:center; justify-content:space-between; margin:22px 0 10px; }
.cmd-bh .l { font-size:13px; color:#9CA3AF; }
.cmd-brow { display:flex; gap:12px; align-items:flex-start; }
.cmd-slots { display:flex; gap:12px; flex:1; flex-wrap:wrap; }
.cmd-slot { width:74px; height:74px; border-radius:14px; background:#F3F4F6; display:grid; place-items:center; overflow:hidden; flex-shrink:0; transition:transform .25s ease,box-shadow .25s ease; }
.cmd-slot.filled { background:linear-gradient(160deg,#FCFDFF,#EEF2FB); }
.cmd-slot.filled:hover { transform:translateY(-4px) scale(1.05); box-shadow:0 12px 26px rgba(26,39,68,.16); }
.cmd-slot img { width:56px; height:56px; object-fit:contain; }
.cmd-dip { width:120px; flex-shrink:0; }
.cmd-dip-img { width:120px; height:88px; border-radius:12px; overflow:hidden; border:1px solid #E5E7EB; background:#fff; cursor:pointer; transition:transform .25s ease,box-shadow .25s ease; }
.cmd-dip-img:hover { transform:translateY(-3px) scale(1.03); box-shadow:0 14px 30px rgba(26,39,68,.2); }
.cmd-dip-img img { width:100%; height:100%; object-fit:cover; display:block; }
.cmd-data { display:flex; gap:24px; flex-wrap:wrap; }
.cmd-data-col { flex:0 0 320px; min-width:260px; }
.cmd-data-row { display:flex; align-items:center; justify-content:space-between; padding:13px 16px; border:1px solid #E5E7EB; border-radius:12px; margin-bottom:10px; }
.cmd-data-row .k { font-size:14px; color:#6B7280; }
.cmd-data-row .v { font-size:14px; font-weight:700; color:#111; }
.cmd-data-main { flex:1; min-width:240px; }
.cmd-data-img { width:100%; height:210px; border-radius:14px; overflow:hidden; background:#F3F4F6; margin-bottom:14px; }
.cmd-data-img img { width:100%; height:100%; object-fit:cover; }
.cmd-bio { font-size:14px; color:#374151; line-height:1.7; margin:0; }

.cmd-foot { display:flex; align-items:center; gap:12px; padding-top:18px; margin-top:18px; border-top:1px solid #F5F5F7; flex-wrap:wrap; }
.cmd-foot .grow { margin-left:auto; }
.cmd-pill { height:46px; padding:0 22px; border:1px solid #E5E7EB; border-radius:12px; background:#fff; color:#374151; font:700 14px inherit; cursor:pointer; transition:all .2s ease; white-space:nowrap; }
.cmd-pill:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.14); }
.cmd-pill.primary { background:#EBF1FF; border-color:#D4DEFA; color:#375DFB; }
.cmd-pill.primary:hover { background:#375DFB; border-color:#375DFB; color:#fff; box-shadow:0 10px 22px rgba(55,93,251,.4); }
.cmd-act { height:42px; padding:0 16px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#374151; font:600 13px inherit; cursor:pointer; transition:all .2s ease; white-space:nowrap; }
.cmd-act:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.14); }
.cmd-icon { width:46px; height:46px; border:1px solid #E5E7EB; border-radius:12px; background:#fff; color:#6B7280; cursor:pointer; display:grid; place-items:center; transition:all .2s ease; }
.cmd-icon:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.18); }
`;

function injectCss() {
  if (typeof document === 'undefined' || document.getElementById('cmd-css')) return;
  const s = document.createElement('style'); s.id = 'cmd-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; };
const ChatIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const MailIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>;
const PhoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;

type Tab = 'На курсе' | 'Данные' | 'Подготовка' | 'Замеры';

function CommanderCard({ c, onRequestReport, onSubmitReport }: { c: Commander; onRequestReport: () => void; onSubmitReport: () => void }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('На курсе');
  const slots = Array.from({ length: 8 }, (_, i) => c.courseBadges[i] ?? null);

  return (
    <div className="cmd-card">
      <div className="cmd-top">
        <div className="cmd-av">
          <div className="pic"><img src={c.avatar} alt={c.name} onError={imgFallback} /></div>
          <img className="pogon" src={c.pogon} alt="" onError={imgFallback} />
        </div>
        <div className="cmd-info">
          <div className="cmd-rank">{c.rank}</div>
          <div className="cmd-nameline">
            <span className="cmd-name">{c.name}</span>
            <IVDisplay index={c.iv} rating={c.rating} />
          </div>
          <div className="cmd-pos">{c.position}</div>
        </div>
        <div className="cmd-badges">
          {c.badges.map((src, i) => (
            <BadgeBox key={i} src={src} size={60} tooltip={BADGE_TOOLTIPS[i]} topRight={i === 0 ? <ElitaBadge /> : undefined} />
          ))}
          <ExtraBadge count={c.extra} size={60} onClick={() => navigate('/achievements')} />
        </div>
      </div>

      <div className="cmd-tabs">
        {(['На курсе', 'Данные', 'Подготовка', 'Замеры'] as Tab[]).map(t => (
          <button key={t} className={`cmd-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'На курсе' && (
        <>
          <div className="cmd-sub">Под командованием</div>
          <div className="cmd-cmd">
            <div className="cmd-cmd-av"><img src={c.superior.avatar} alt={c.superior.name} onError={imgFallback} /></div>
            <div>
              <div className="cmd-cmd-name">{c.superior.name}</div>
              <div className="cmd-cmd-sub">{c.superior.rank} • {c.superior.role}</div>
            </div>
            <div className="cmd-cmd-actions">
              <button className="cmd-act" onClick={() => navigate('/commanders')}>Все командиры</button>
              <button className="cmd-act" onClick={() => navigate(`/users/${encodeURIComponent(c.superior.name)}`)}>Личное дело</button>
              <button className="cmd-icon" title="Связаться" onClick={() => navigate('/messages?chat=1')}><ChatIcon /></button>
            </div>
          </div>
          <div className="cmd-fields">
            <div className="cmd-field"><div className="k">Должность</div><div className="v">{c.jobPosition}</div></div>
            <div className="cmd-field"><div className="k">Звание</div><div className="v">{c.zvanie}</div></div>
            <div className="cmd-field"><div className="k">Специальность</div><div className="v">{c.specialty}</div></div>
          </div>
          <div className="cmd-bh">
            <span className="l">Знаки отличия и различия полученные на курсе</span>
            <span className="l">Диплом</span>
          </div>
          <div className="cmd-brow">
            <div className="cmd-slots">
              {slots.map((src, i) => <div key={i} className={`cmd-slot${src ? ' filled' : ''}`}>{src && <img src={src} alt="" onError={imgFallback} />}</div>)}
            </div>
            <div className="cmd-dip">
              <div className="cmd-dip-img" title="Открыть диплом" onClick={() => window.open(c.diploma, '_blank', 'noopener,noreferrer')}>
                <img src={c.diploma} alt="Диплом" onError={imgFallback} />
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'Данные' && (
        <div className="cmd-data">
          <div className="cmd-data-col">
            {([['Город', c.city], ['Год рождения', c.birthYear], ['На портале', c.onPortal], ['Сообщество', c.community], ['Прошёл курсов', String(c.courses)], ['Наград', String(c.awards)], ['Подписчиков', c.followers.toLocaleString('ru-RU')]] as [string, string][]).map(([k, v]) => (
              <div key={k} className="cmd-data-row"><span className="k">{k}</span><span className="v">{v}</span></div>
            ))}
          </div>
          <div className="cmd-data-main">
            <div className="cmd-data-img"><img src={c.bioImage} alt="" onError={imgFallback} /></div>
            <p className="cmd-bio">{c.bio}</p>
          </div>
        </div>
      )}

      {tab === 'Подготовка' && <TrainingPanel compact />}
      {tab === 'Замеры' && <MeasurementsPanel compact />}

      <div className="cmd-foot">
        <button className="cmd-pill" onClick={onRequestReport}>Запросить рапорт</button>
        <button className="cmd-pill" onClick={onSubmitReport}>Подать рапорт</button>
        <button className="cmd-icon grow" title="Почта" onClick={() => navigate('/messages?chat=1')}><MailIcon /></button>
        <button className="cmd-icon" title="Позвонить" onClick={() => navigate('/messages?chat=1')}><PhoneIcon /></button>
        <button className="cmd-icon" title="Написать в чат" onClick={() => navigate('/messages?chat=1')}><ChatIcon /></button>
        <button className="cmd-pill primary" onClick={() => navigate(`/users/${encodeURIComponent(c.name)}`)}>Личное дело</button>
      </div>
    </div>
  );
}

export function CommandersPage() {
  const navigate = useNavigate();
  injectCss();
  const [reportOpen, setReportOpen] = useState(false);
  const [status, setStatus] = useState<ReportStatus | null>(null);

  const submitReport = () => {
    setReportOpen(false);
    const online = typeof navigator === 'undefined' || navigator.onLine;
    setStatus(online ? STATUS_SUBMITTED : STATUS_ERROR);
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="cmd-page">
      <div className="cmd-wrap">
        <div className="cmd-panel">
          <PortalPageTop title="Командиры" icon={<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>} />

          <div className="cmd-list">
            {COMMANDERS.map((c, i) => (
              <CommanderCard key={i} c={c} onRequestReport={() => setStatus(STATUS_REQUESTED)} onSubmitReport={() => setReportOpen(true)} />
            ))}
          </div>
        </div>
      </div>

      {reportOpen && <ReportFormModal onClose={() => setReportOpen(false)} onSubmit={submitReport} />}
      {status && <StatusModal kind={status.kind} title={status.title} text={status.text} onClose={() => setStatus(null)} />}
    </div>
  );
}
