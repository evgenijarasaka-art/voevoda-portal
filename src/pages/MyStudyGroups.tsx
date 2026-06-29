import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ExtraBadge } from '../components/PeopleSection';
import { PortalPageTop } from '../components/PortalPageTop';

/* ─── данные учебных групп ─── */
type Field = { label: string; value: string };
type StudyGroup = {
  id: number;
  title: string;
  slug: string;
  img: string;
  city: string;
  duration: string;
  groupNo: string;
  unit: string;
  series: string;
  commander: { name: string; rank: string; role: string; avatar: string };
  fields: [Field, Field, Field];
  badges: string[];      // полученные знаки (пути к картинкам)
  diploma: string | null; // картинка диплома или null = «Не получил»
};

const GROUPS: StudyGroup[] = [
  {
    id: 1,
    title: 'Курс молодого бойца V5',
    slug: 'Курс молодого бойца V5',
    img: '/military-course.jpg',
    city: 'Москва',
    duration: '1 августа - 1 октября',
    groupNo: 'КМБ-77-41',
    unit: '77 батальон, 2-я рота, 1 взвод',
    series: 'Комплексная Военная подготовка',
    commander: { name: 'Бек', rank: 'Майор', role: 'Мой командир', avatar: '/teacher2-main.jpg' },
    fields: [
      { label: 'Моя должность', value: 'Зам. командира взвода' },
      { label: 'Звание', value: 'Старший лейтенант' },
      { label: 'Специальность', value: 'Пулеметчик' },
    ],
    badges: ['/medal.png', '/2.png', '/1.png', '/cubock.png'],
    diploma: '/blag1.png',
  },
  {
    id: 2,
    title: 'Ускоренная военная подготовка',
    slug: 'Ускоренная военная подготовка',
    img: '/voendelo2.png',
    city: 'Москва',
    duration: '1 августа - 1 октября',
    groupNo: 'КМБ-77-41',
    unit: '77 батальон, 2-я рота, 1 взвод',
    series: 'Комплексная Военная подготовка',
    commander: { name: 'Бек', rank: 'Майор', role: 'Мой командир', avatar: '/teacher2-main.jpg' },
    fields: [
      { label: 'Моя должность', value: 'Старшина роты' },
      { label: 'Звание', value: 'Старшина' },
      { label: 'Должность', value: 'Связист' },
    ],
    badges: ['/medal.png', '/2.png', '/1.png', '/cubock.png', '/shevron3.png', '/shevron4.png', '/medal.png', '/cubock.png', '/shevron2.png'],
    diploma: null,
  },
  {
    id: 3,
    title: 'Курс молодого бойца V5',
    slug: 'Курс молодого бойца V5',
    img: '/kyrs3.png',
    city: 'Москва',
    duration: '1 августа - 1 октября',
    groupNo: 'КМБ-77-41',
    unit: '77 батальон, 2-я рота, 1 взвод',
    series: 'Комплексная Военная подготовка',
    commander: { name: 'Бек', rank: 'Майор', role: 'Мой командир', avatar: '/teacher2-main.jpg' },
    fields: [
      { label: 'Моя должность', value: 'Зам. командира взвода' },
      { label: 'Звание', value: 'Старший лейтенант' },
      { label: 'Должность', value: 'Пулеметчик' },
    ],
    badges: ['/medal.png', '/1.png', '/2.png', '/cubock.png'],
    diploma: '/blag2.png',
  },
];

const CSS = `
.sg-page { padding-top:60px; margin-left:56px; min-height:100vh; background:#F8F9FB; }
.sg-wrap { padding:20px 24px 56px; }
.sg-panel { background:#fff; border:1px solid #E5E7EB; border-radius:20px; overflow:hidden; animation:sgFade .4s ease both; }
@keyframes sgFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
.sg-head { display:flex; align-items:center; gap:12px; padding:22px 28px; }
.sg-head h1 { margin:0; font-size:24px; font-weight:800; color:#111; }
.sg-crumbs { display:flex; align-items:center; gap:8px; padding:13px 28px; border-top:1px solid #F0F1F3; border-bottom:1px solid #F0F1F3; font-size:13px; color:#9CA3AF; }
.sg-crumbs button { border:none; background:none; cursor:pointer; color:#9CA3AF; font:inherit; padding:0; transition:color .15s; }
.sg-crumbs button:hover { color:#375DFB; }
.sg-crumbs .cur { color:#374151; font-weight:500; }
.sg-body { padding:24px 28px 28px; display:flex; flex-direction:column; gap:20px; }

.sg-card { border:1px solid #E5E7EB; border-radius:18px; padding:22px; transition:box-shadow .25s ease,border-color .25s ease; }
.sg-card:hover { border-color:#DCE3F5; box-shadow:0 14px 36px rgba(26,39,68,.07); }

.sg-top { display:flex; gap:24px; margin-bottom:18px; }
@media(max-width:820px){ .sg-top { flex-direction:column; } .sg-img { width:100%!important; } }
.sg-img { width:300px; height:190px; flex-shrink:0; border-radius:14px; overflow:hidden; background:#EEF0F4; }
.sg-img img { width:100%; height:100%; object-fit:cover; display:block; }
.sg-info { flex:1; min-width:0; }
.sg-info h2 { margin:0 0 16px; font-size:21px; font-weight:800; color:#111; }
.sg-row { display:grid; grid-template-columns:240px 1fr; padding:7px 0; font-size:15px; }
.sg-row .k { color:#6B7280; }
.sg-row .v { color:#111; font-weight:500; }
.sg-series-dot { width:9px; height:9px; border-radius:50%; background:#22C55E; display:inline-block; margin-right:8px; }

.sg-cmd { display:flex; align-items:center; gap:12px; background:#F7F8FB; border:1px solid #EEF0F4; border-radius:14px; padding:12px 16px; margin-bottom:16px; flex-wrap:wrap; }
.sg-cmd-av { width:46px; height:46px; border-radius:50%; overflow:hidden; flex-shrink:0; background:#1a2744; }
.sg-cmd-av img { width:100%; height:100%; object-fit:cover; }
.sg-cmd-name { font-size:16px; font-weight:700; color:#111; }
.sg-cmd-sub { font-size:13px; color:#9CA3AF; }
.sg-cmd-actions { margin-left:auto; display:flex; align-items:center; gap:10px; }

.sg-pill { height:40px; padding:0 16px; border:none; border-radius:11px; background:#F1F3F7; color:#374151; font:600 13px inherit; cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:background .2s ease,color .2s ease,transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .2s ease; }
.sg-pill:hover { background:#EBF1FF; color:#375DFB; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.18); }
.sg-pill:active { transform:translateY(0) scale(.97); }
.sg-iconbtn { width:40px; height:40px; border:none; border-radius:11px; background:#F1F3F7; color:#6B7280; cursor:pointer; display:grid; place-items:center; transition:background .2s ease,color .2s ease,transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .2s ease; flex-shrink:0; }
.sg-iconbtn:hover { background:#EBF1FF; color:#375DFB; transform:translateY(-2px) rotate(-6deg); box-shadow:0 8px 18px rgba(55,93,251,.2); }
.sg-iconbtn:active { transform:scale(.92); }

.sg-fields { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:18px; }
@media(max-width:680px){ .sg-fields { grid-template-columns:1fr; } }
.sg-field { border:1px solid #E5E7EB; border-radius:14px; padding:13px 16px; }
.sg-field .k { font-size:13px; color:#9CA3AF; margin-bottom:6px; }
.sg-field .v { font-size:16px; font-weight:600; color:#111; }

.sg-badges-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.sg-badges-head .l { font-size:13px; color:#9CA3AF; }
.sg-badges-row { display:flex; align-items:stretch; gap:14px; }
.sg-badges { display:flex; align-items:center; gap:10px; flex:1; min-height:64px; flex-wrap:wrap; padding:8px 10px; border:1px solid #E8ECF3; border-radius:16px; background:linear-gradient(135deg,#FBFCFF,#F5F7FC); }
.sg-slot { width:64px; height:64px; border-radius:14px; background:#F3F4F6; display:grid; place-items:center; flex-shrink:0; overflow:hidden; transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s ease,background .25s ease; }
.sg-slot.filled { position:relative; background:linear-gradient(160deg,#FFF,#EEF2FB); border:1px solid rgba(207,215,231,.82); cursor:default; box-shadow:0 4px 12px rgba(31,45,78,.06); animation:sgBadgeIn .38s cubic-bezier(.2,.8,.2,1) both; }
.sg-slot.filled::after { content:''; position:absolute; inset:5px; z-index:0; border:1px solid rgba(255,255,255,.9); border-radius:10px; pointer-events:none; }
@keyframes sgBadgeIn { from{opacity:0;transform:translateY(8px) scale(.92)} to{opacity:1;transform:none} }
.sg-slot.filled:hover { transform:translateY(-4px) scale(1.06); box-shadow:0 12px 26px rgba(26,39,68,.16); }
.sg-slot img { position:relative; z-index:1; width:50px; height:50px; object-fit:contain; transition:transform .25s cubic-bezier(.2,.8,.2,1); }
.sg-slot.filled:hover img { transform:scale(1.08); }
.sg-slot.more { background:#EBF1FF; color:#375DFB; font-weight:800; font-size:15px; }
.sg-badges-empty { flex:1; min-height:64px; display:flex; align-items:center; gap:12px; padding:12px 14px; color:#718099; }
.sg-badges-empty-icon { width:40px; height:40px; display:grid; place-items:center; flex:0 0 auto; border-radius:12px; background:#EBF1FF; color:#375DFB; }
.sg-badges-empty b { display:block; color:#34415A; font-size:13px; }
.sg-badges-empty span { display:block; margin-top:3px; font-size:11px; line-height:1.35; }
.sg-dip { width:88px; flex-shrink:0; }
.sg-dip-img { position:relative; width:88px; height:64px; border-radius:12px; overflow:hidden; border:1px solid #E5E7EB; background:#fff; cursor:zoom-in; transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s ease,border-color .25s ease; }
.sg-dip-img:hover { transform:translateY(-3px) scale(1.04); box-shadow:0 14px 30px rgba(26,39,68,.2); border-color:#C7D2FE; }
.sg-dip-img img { width:100%; height:100%; object-fit:cover; display:block; }
.sg-dip-zoom { position:absolute; inset:0; display:grid; place-items:center; background:rgba(15,23,42,.42); color:#fff; opacity:0; transition:opacity .22s ease; }
.sg-dip-img:hover .sg-dip-zoom { opacity:1; }
.sg-dip-empty { width:88px; height:64px; border-radius:12px; background:#F3F4F6; display:grid; place-items:center; text-align:center; font-size:12px; color:#9CA3AF; line-height:1.25; }

/* лайтбокс диплома */
.sg-lb { position:fixed; inset:0; z-index:9999; display:grid; place-items:center; padding:24px; background:rgba(12,20,40,.66); backdrop-filter:blur(8px); animation:sgLbBg .22s ease both; }
@keyframes sgLbBg { from{opacity:0} to{opacity:1} }
.sg-lb-card { position:relative; background:#fff; border-radius:18px; overflow:hidden; max-width:760px; width:100%; box-shadow:0 40px 100px rgba(0,0,0,.4); animation:sgLbPop .3s cubic-bezier(.2,.8,.2,1) both; }
@keyframes sgLbPop { from{opacity:0;transform:translateY(20px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
.sg-lb-top { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 20px; border-bottom:1px solid #F0F1F3; }
.sg-lb-top h3 { margin:0; font-size:17px; font-weight:800; color:#111; }
.sg-lb-top .sub { font-size:12px; color:#9CA3AF; margin-top:2px; }
.sg-lb-close { width:38px; height:38px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#6B7280; font-size:22px; cursor:pointer; display:grid; place-items:center; transition:all .18s; flex-shrink:0; }
.sg-lb-close:hover { background:#FEF2F2; border-color:#FECACA; color:#EF4444; transform:rotate(90deg); }
.sg-lb-body { padding:22px; background:#F7F8FB; display:grid; place-items:center; max-height:64vh; overflow:auto; }
.sg-lb-body img { max-width:100%; max-height:60vh; border-radius:10px; box-shadow:0 14px 40px rgba(26,39,68,.18); }
.sg-lb-actions { display:flex; gap:10px; padding:14px 20px; border-top:1px solid #F0F1F3; }
.sg-lb-dl { flex:1; height:46px; border:none; border-radius:12px; background:#375DFB; color:#fff; font:700 14px inherit; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; transition:background .18s,transform .18s,box-shadow .18s; box-shadow:0 8px 20px rgba(55,93,251,.28); }
.sg-lb-dl:hover { background:#2D4FE0; transform:translateY(-2px); box-shadow:0 12px 26px rgba(55,93,251,.42); }
.sg-lb-secondary { height:46px; padding:0 20px; border:1px solid #E5E7EB; border-radius:12px; background:#fff; color:#374151; font:700 14px inherit; cursor:pointer; transition:all .18s; }
.sg-lb-secondary:hover { background:#F5F7FB; border-color:#DCE3F5; }

.sg-actions { display:flex; gap:10px; margin-top:18px; flex-wrap:wrap; }
.sg-act { display:inline-flex; align-items:center; gap:8px; height:42px; padding:0 18px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#374151; font:600 14px inherit; cursor:pointer; transition:background .2s ease,border-color .2s ease,color .2s ease,transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .2s ease; }
.sg-act:hover { background:#EBF1FF; border-color:#C7D2FE; color:#375DFB; transform:translateY(-2px); box-shadow:0 10px 22px rgba(55,93,251,.15); }
.sg-act:active { transform:translateY(0) scale(.98); }
.sg-act svg { transition:transform .2s ease; }
.sg-act:hover svg { transform:translateX(2px); }
.sg-act.tg, .sg-act.portal { border-color:#D4DEFA; background:#EBF1FF; color:#375DFB; }
.sg-act.tg:hover, .sg-act.portal:hover { background:#375DFB; border-color:#375DFB; color:#fff; box-shadow:0 12px 26px rgba(55,93,251,.4); }
.sg-act.tg img { transition:transform .2s ease; }
.sg-act.tg:hover img { transform:scale(1.15) rotate(-6deg); }
.sg-act.grow { margin-left:auto; }
`;

function injectCss() {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('sg-css') as HTMLStyleElement | null;
  if (existing) {
    if (existing.textContent !== CSS) existing.textContent = CSS;
    return;
  }
  const s = document.createElement('style'); s.id = 'sg-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

const MsgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

function GroupCard({ g, onDiploma }: { g: StudyGroup; onDiploma: (d: { img: string; title: string }) => void }) {
  const navigate = useNavigate();
  const VISIBLE_BADGES = 7;
  const visibleBadges = g.badges.slice(0, VISIBLE_BADGES);
  const hiddenBadges = Math.max(0, g.badges.length - VISIBLE_BADGES);

  return (
    <div className="sg-card">
      {/* верх: фото + информация */}
      <div className="sg-top">
        <div className="sg-img"><img src={g.img} alt={g.title} onError={e => { (e.currentTarget as HTMLImageElement).src = '/military-course.jpg'; }} /></div>
        <div className="sg-info">
          <h2>{g.title}</h2>
          <div className="sg-row"><span className="k">Город проведения</span><span className="v">{g.city}</span></div>
          <div className="sg-row"><span className="k">Длительность</span><span className="v">{g.duration}</span></div>
          <div className="sg-row"><span className="k">Номер группы</span><span className="v">{g.groupNo}</span></div>
          <div className="sg-row"><span className="k">Номер подразделения</span><span className="v">{g.unit}</span></div>
          <div className="sg-row"><span className="k">Курс из серии</span><span className="v"><span className="sg-series-dot" />{g.series}</span></div>
        </div>
      </div>

      {/* командир */}
      <div className="sg-cmd">
        <div className="sg-cmd-av"><img src={g.commander.avatar} alt={g.commander.name} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} /></div>
        <div>
          <div className="sg-cmd-name">{g.commander.name}</div>
          <div className="sg-cmd-sub">{g.commander.rank} • {g.commander.role}</div>
        </div>
        <div className="sg-cmd-actions">
          <button className="sg-pill" onClick={() => navigate('/commanders')}>Все командиры</button>
          <button className="sg-pill" onClick={() => navigate(`/users/${encodeURIComponent(g.commander.name)}`)}>Личное дело</button>
          <button className="sg-iconbtn" title="Связаться" onClick={() => navigate('/messages?chat=1')}><MsgIcon /></button>
        </div>
      </div>

      {/* мои поля */}
      <div className="sg-fields">
        {g.fields.map((f, i) => (
          <div key={i} className="sg-field"><div className="k">{f.label}</div><div className="v">{f.value}</div></div>
        ))}
      </div>

      {/* знаки отличия + диплом */}
      <div className="sg-badges-head">
        <span className="l">Знаки отличия и различия полученные на курсе</span>
        <span className="l">Диплом</span>
      </div>
      <div className="sg-badges-row">
        <div className="sg-badges">
          {visibleBadges.map((src, i) => (
            <div key={`${src}-${i}`} className="sg-slot filled" style={{ animationDelay: `${i * 45}ms` }}>
              <img src={src} alt={`Знак отличия ${i + 1}`} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            </div>
          ))}
          {hiddenBadges > 0 && <ExtraBadge count={hiddenBadges} size={64} onClick={() => navigate('/achievements')} title="Смотреть все знаки отличия" />}
          {g.badges.length === 0 && (
            <div className="sg-badges-empty">
              <span className="sg-badges-empty-icon" aria-hidden="true">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5" /><path d="m8.5 12-1 9 4.5-2.5 4.5 2.5-1-9" /></svg>
              </span>
              <div><b>Награды ещё впереди</b><span>Здесь появятся только реально полученные знаки — без пустых ячеек.</span></div>
            </div>
          )}
        </div>
        <div className="sg-dip">
          {g.diploma
            ? <div className="sg-dip-img" title="Открыть диплом" onClick={() => onDiploma({ img: g.diploma!, title: g.title })}>
                <img src={g.diploma} alt="Диплом" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                <div className="sg-dip-zoom"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg></div>
              </div>
            : <div className="sg-dip-empty">Не<br />получил</div>}
        </div>
      </div>

      {/* действия */}
      <div className="sg-actions">
        <button className="sg-act" onClick={() => navigate('/study-groups/structure')}>Организационно штатная структура</button>
        <button className="sg-act" onClick={() => navigate('/communities')}>Сокурсники</button>
        <button className="sg-act" onClick={() => navigate(`/courses/${encodeURIComponent(g.slug)}`)}>Страница курса</button>
        <button className="sg-act tg grow" onClick={() => window.open('https://max.ru/voevoda', '_blank', 'noopener,noreferrer')}>
          <img src="/макс2.png" alt="" style={{ width: 18, height: 18, objectFit: 'cover', borderRadius: 6 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          Чат в Макс
        </button>
        <button className="sg-act portal" onClick={() => navigate('/messages?chat=1')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          Чат на портале
        </button>
      </div>
    </div>
  );
}

function DiplomaLightbox({ data, onClose }: { data: { img: string; title: string }; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return createPortal(
    <div className="sg-lb" onClick={onClose}>
      <div className="sg-lb-card" onClick={e => e.stopPropagation()}>
        <div className="sg-lb-top">
          <div>
            <h3>Диплом / благодарственное письмо</h3>
            <div className="sub">{data.title}</div>
          </div>
          <button className="sg-lb-close" onClick={onClose} aria-label="Закрыть">×</button>
        </div>
        <div className="sg-lb-body">
          <img src={data.img} alt="Диплом" />
        </div>
        <div className="sg-lb-actions">
          <a className="sg-lb-dl" href={data.img} download>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Скачать
          </a>
          <button className="sg-lb-secondary" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function MyStudyGroups() {
  const navigate = useNavigate();
  const [diploma, setDiploma] = useState<{ img: string; title: string } | null>(null);
  injectCss();

  return (
    <div className="sg-page">
      <div className="sg-wrap">
        <div className="sg-panel">
          <PortalPageTop title="Мои учебные группы" icon={<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} />
          <div className="sg-body">
            {GROUPS.map(g => <GroupCard key={g.id} g={g} onDiploma={setDiploma} />)}
          </div>
        </div>
      </div>
      {diploma && <DiplomaLightbox data={diploma} onClose={() => setDiploma(null)} />}
    </div>
  );
}
