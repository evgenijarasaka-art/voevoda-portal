import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardModal } from '../components/BoardModal';
import { RideRequestModal } from '../components/RideRequestModal';
import { PortalPageTop } from '../components/PortalPageTop';

/* ─── данные ─── */
type Leader = { name: string; rank: string; avatar: string };
type Status = 'open' | 'enrolled' | 'done';
type Exercise = {
  id: number; title: string; desc: string; img: string;
  city: string; date: string; time: string; polygon: string;
  director: Leader; sides: Leader[]; status: Status; doneDate?: string;
};

const TORNADO: Leader = { name: 'Торнадо_92', rank: 'Майор', avatar: '/teacher2-main.jpg' };
const BEK: Leader = { name: 'Бек', rank: 'Майор', avatar: '/sold1.png' };
const KOBA: Leader = { name: 'Коба', rank: 'Майор', avatar: '/sold2.png' };
const VIKHR: Leader = { name: 'Вихрь', rank: 'Капитан', avatar: '/sold4.png' };

const DESC = 'Учебное мероприятие направлено на развитие навыков военных по ориентированию в сложных природных условиях, таких как лесистая местность. В ходе учений личный состав будет обучен использованию картографических материалов, компасов, а также электронных средств.';

const EXERCISES: Exercise[] = [
  { id: 1, title: 'Ориентирование в лесистой местности', desc: DESC, img: '/military-course.jpg', city: 'Москва', date: '1 августа, 2024', time: '09:00-17:00', polygon: 'Алабино', director: TORNADO, sides: [BEK, KOBA], status: 'open' },
  { id: 2, title: 'Личная тактическая подготовка снайпера', desc: DESC, img: '/voendelo2.png', city: 'Москва', date: '1 августа, 2024', time: '09:00-17:00', polygon: 'Алабино', director: TORNADO, sides: [BEK, KOBA], status: 'enrolled' },
  { id: 3, title: 'Личная тактическая подготовка снайпера', desc: DESC, img: '/sold1.png', city: 'Москва', date: '1 августа, 2024', time: '09:00-17:00', polygon: 'Алабино', director: VIKHR, sides: [TORNADO, VIKHR], status: 'done', doneDate: '2 октября, 2024' },
];

const CITIES = ['Москва', 'Санкт-Петербург', 'Уфа', 'Воронеж', 'Ростов-на-Дону', 'Краснодар', 'Казань', 'Саратов', 'Новгород', 'Екатеринбург'];
const RANGE_OPTIONS = ['Текущий месяц', '3 месяца', '6 месяцев', '2024 год', 'За все время'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WD = ['По', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const EVENT_DAYS = [6, 23];

const CSS = `
.ex-page { padding-top:60px; margin-left:56px; min-height:100vh; background:#F8F9FB; }
.ex-wrap { padding:20px 24px 56px; }
.ex-panel { background:#fff; border:1px solid #E5E7EB; border-radius:20px; overflow:visible; animation:exFade .4s ease both; }
@keyframes exFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
.ex-head { display:flex; align-items:center; gap:12px; padding:22px 28px; flex-wrap:wrap; }
.ex-head h1 { margin:0; font-size:24px; font-weight:800; color:#111; flex:1; }
.ex-crumbs { display:flex; align-items:center; gap:8px; padding:13px 28px; border-top:1px solid #F0F1F3; border-bottom:1px solid #F0F1F3; font-size:13px; color:#9CA3AF; flex-wrap:wrap; }
.ex-crumbs button { border:none; background:none; cursor:pointer; color:#9CA3AF; font:inherit; padding:0; transition:color .15s; }
.ex-crumbs button:hover { color:#375DFB; }
.ex-crumbs .cur { color:#374151; font-weight:500; }

/* контролы даты/фильтра */
.ex-toolbar { display:flex; align-items:center; gap:10px; }
.ex-datectl { display:flex; align-items:center; border:1px solid #E5E7EB; border-radius:11px; background:#fff; height:42px; position:relative; }
.ex-datearrow { width:38px; height:100%; border:none; background:none; color:#6B7280; cursor:pointer; display:grid; place-items:center; transition:color .15s; }
.ex-datearrow:hover { color:#375DFB; }
.ex-datelabel { display:flex; align-items:center; gap:8px; height:100%; padding:0 12px; border:none; border-left:1px solid #F0F1F3; border-right:1px solid #F0F1F3; background:none; cursor:pointer; font:600 14px inherit; color:#374151; white-space:nowrap; }
.ex-datelabel:hover { color:#375DFB; }
.ex-filterbtn { display:inline-flex; align-items:center; gap:8px; height:40px; padding:0 16px; border:1.5px solid #E5E7EB; border-radius:8px; background:#fff; color:#374151; font:600 14px inherit; cursor:pointer; transition:border-color .18s,background .18s,color .18s,transform .18s,box-shadow .18s; }
.ex-filterbtn:hover { border-color:#c7d2fe; color:#375DFB; background:#EEF3FF; transform:translateY(-2px); box-shadow:0 6px 16px rgba(55,93,251,.1); }

.ex-menu { position:absolute; top:calc(100% + 8px); right:0; width:220px; background:#fff; border:1px solid #E5E7EB; border-radius:14px; box-shadow:0 16px 40px rgba(26,39,68,.16); padding:6px; z-index:60; animation:exPop .18s ease both; }
@keyframes exPop { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
.ex-menu-item { display:flex; align-items:center; justify-content:space-between; padding:11px 14px; border-radius:10px; font-size:14px; color:#374151; cursor:pointer; transition:background .15s; }
.ex-menu-item:hover { background:#F5F7FB; }
.ex-menu-item.active { color:#111; font-weight:600; }
.ex-menu-cal { padding:12px 14px 8px; border-top:1px solid #F0F1F3; margin-top:4px; color:#375DFB; font-weight:600; font-size:14px; cursor:pointer; }
.ex-menu-cal:hover { text-decoration:underline; }

/* календарь */
.ex-cal { position:absolute; top:calc(100% + 8px); right:0; width:380px; max-width:90vw; background:#fff; border:1px solid #E5E7EB; border-radius:18px; box-shadow:0 20px 50px rgba(26,39,68,.2); z-index:60; padding:14px 16px 8px; animation:exPop .18s ease both; }
.ex-cal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.ex-cal-head .m { font-size:16px; font-weight:700; color:#111; }
.ex-cal-nav { width:32px; height:32px; border:none; border-radius:9px; background:#F5F7FB; color:#374151; cursor:pointer; display:grid; place-items:center; transition:background .15s; }
.ex-cal-nav:hover { background:#EBF1FF; color:#375DFB; }
.ex-cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
.ex-cal-wd { text-align:center; font-size:12px; color:#9CA3AF; padding:6px 0; }
.ex-cal-day { position:relative; height:42px; display:grid; place-items:center; border-radius:10px; font-size:14px; color:#111; cursor:pointer; transition:background .15s; }
.ex-cal-day:hover { background:#F1F4FB; }
.ex-cal-day.out { color:#CBD0DA; cursor:default; }
.ex-cal-day.out:hover { background:none; }
.ex-cal-day.sel { background:#375DFB; color:#fff; font-weight:700; }
.ex-cal-day.sel:hover { background:#2D4FE0; }
.ex-cal-dot { position:absolute; bottom:5px; left:50%; transform:translateX(-50%); width:4px; height:4px; border-radius:50%; background:#375DFB; }
.ex-cal-day.sel .ex-cal-dot { background:#fff; }
.ex-cal-done { text-align:center; padding:12px 0 8px; border-top:1px solid #F0F1F3; margin-top:6px; color:#375DFB; font-weight:600; font-size:14px; cursor:pointer; }
.ex-cal-done:hover { text-decoration:underline; }

/* карточки учений */
.ex-list { padding:20px 28px 28px; display:flex; flex-direction:column; gap:18px; }
.ex-card { border:1px solid #E5E7EB; border-radius:14px; padding:20px; transition:box-shadow .25s ease,border-color .25s ease; cursor:pointer; }
.ex-card:hover { border-color:#DCE3F5; box-shadow:0 14px 36px rgba(26,39,68,.08); }
.ex-top { display:flex; gap:22px; margin-bottom:18px; }
@media(max-width:820px){ .ex-top { flex-direction:column; } .ex-img { width:100%!important; } }
.ex-img { width:230px; height:170px; flex-shrink:0; border-radius:14px; overflow:hidden; background:#EEF0F4; }
.ex-img img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.52s cubic-bezier(0.4,0,0.2,1); }
.ex-card:hover .ex-img img { transform:scale(1.06); }
.ex-info { flex:1; min-width:0; }
.ex-info h2 { margin:0 0 8px; font-size:20px; font-weight:800; color:#111; }
.ex-info p { margin:0 0 16px; font-size:14px; color:#6B7280; line-height:1.6; }
.ex-meta { display:flex; gap:28px; flex-wrap:wrap; }
.ex-meta .k { font-size:12px; color:#9CA3AF; margin-bottom:4px; }
.ex-meta .v { font-size:14px; color:#111; font-weight:600; }
.ex-meta .v.link { color:#375DFB; cursor:pointer; text-decoration:underline; }

.ex-leaders { display:flex; gap:18px; flex-wrap:wrap; margin-bottom:18px; }
.ex-lgroup { flex:1; min-width:220px; }
.ex-lgroup.two { flex:2; min-width:320px; }
.ex-llabel { font-size:13px; color:#9CA3AF; margin-bottom:8px; }
.ex-lrow { display:flex; gap:12px; }
.ex-leader { flex:1; min-width:0; display:flex; align-items:center; gap:12px; border:1px solid #E5E7EB; border-radius:14px; padding:12px 14px; }
.ex-leader-av { width:42px; height:42px; border-radius:50%; overflow:hidden; flex-shrink:0; background:#1a2744; }
.ex-leader-av img { width:100%; height:100%; object-fit:cover; }
.ex-leader-name { font-size:15px; font-weight:700; color:#111; }
.ex-leader-rank { font-size:12px; color:#9CA3AF; }

.ex-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding-top:16px; border-top:1px solid #F5F5F7; }
.ex-btn { display:inline-flex; align-items:center; gap:8px; height:40px; padding:0 15px; border:1.5px solid #E5E7EB; border-radius:8px; background:#fff; color:#374151; font:600 13px inherit; cursor:pointer; white-space:nowrap; transition:border-color .18s,background .18s,color .18s,transform .18s,box-shadow .18s; }
.ex-btn:hover { border-color:#c7d2fe; color:#375DFB; background:#EEF3FF; transform:translateY(-2px); box-shadow:0 6px 16px rgba(55,93,251,.12); }
.ex-btn:active { transform:translateY(0) scale(.97); box-shadow:none; }
.ex-btn svg { flex-shrink:0; }
.ex-btn.grow { margin-left:auto; }
.ex-btn.join { border-color:#c7d2fe; background:linear-gradient(135deg,#eef2ff,#dde6ff); color:#375DFB; }
.ex-btn.join:hover { background:linear-gradient(135deg,#2F52F0,#5B7FFF); border-color:transparent; color:#fff; box-shadow:0 8px 22px rgba(55,93,251,.36); }
.ex-btn.cancel { border-color:#FECACA; background:#FEF2F2; color:#EF4444; }
.ex-btn.cancel:hover { background:#FEE2E2; border-color:#FCA5A5; color:#DC2626; box-shadow:0 6px 16px rgba(239,68,68,.14); }
.ex-btn.primary { border-color:transparent; background:linear-gradient(135deg,#2F52F0,#5B7FFF); color:#fff; box-shadow:0 6px 16px rgba(55,93,251,.28); }
.ex-btn.primary:hover { box-shadow:0 10px 24px rgba(55,93,251,.42); transform:translateY(-2px); }
.ex-done { display:inline-flex; align-items:center; gap:8px; font-size:13px; color:#6B7280; background:#F1F4FB; border:1px solid #E5E9F2; border-radius:11px; padding:0 14px; height:42px; }
.ex-done svg { color:#375DFB; flex-shrink:0; }

/* фильтры-модалка */
.ex-overlay { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; padding:24px; background:rgba(10,16,32,.6); backdrop-filter:blur(6px); animation:exFade .2s ease both; }
.ex-modal { width:min(700px,100%); max-height:90vh; overflow-y:auto; background:#fff; border-radius:22px; box-shadow:0 36px 90px rgba(0,0,0,.4); animation:exModalPop .3s cubic-bezier(.2,.8,.2,1) both; }
@keyframes exModalPop { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.ex-modal-head { display:flex; align-items:center; justify-content:space-between; padding:22px 28px 14px; }
.ex-modal-title { display:flex; align-items:center; gap:12px; font-size:22px; font-weight:800; color:#111; }
.ex-close { width:40px; height:40px; border:1px solid #E5E7EB; border-radius:12px; background:#F7F8FB; color:#6B7280; font-size:22px; cursor:pointer; display:grid; place-items:center; transition:all .18s; }
.ex-close:hover { background:#FEF2F2; border-color:#FECACA; color:#EF4444; transform:rotate(90deg); }
.ex-fgroup { padding:18px 28px; border-top:1px solid #F0F1F3; }
.ex-fgroup h3 { margin:0 0 14px; font-size:17px; font-weight:700; color:#111; }
.ex-fopts { display:grid; grid-template-columns:repeat(4,1fr); gap:12px 16px; }
@media(max-width:620px){ .ex-fopts { grid-template-columns:repeat(2,1fr); } }
.ex-fopts.cols-3 { grid-template-columns:repeat(3,1fr); }
.ex-fopts.cols-2 { grid-template-columns:repeat(2,1fr); }
.ex-check { display:flex; align-items:center; gap:9px; font-size:14px; color:#374151; cursor:pointer; user-select:none; }
.ex-box { width:22px; height:22px; border-radius:7px; border:1.5px solid #D1D5DB; display:grid; place-items:center; flex-shrink:0; transition:all .15s; }
.ex-check:hover .ex-box { border-color:#375DFB; }
.ex-box.on { background:#375DFB; border-color:#375DFB; }
.ex-modal-foot { display:flex; gap:14px; padding:18px 28px 24px; border-top:1px solid #F0F1F3; position:sticky; bottom:0; background:#fff; }
.ex-foot-reset { height:52px; padding:0 30px; border:1px solid #E5E7EB; border-radius:12px; background:#F7F8FB; color:#374151; font:700 15px inherit; cursor:pointer; transition:all .2s ease; }
.ex-foot-reset:hover { background:#EEF1F6; }
.ex-foot-apply { flex:1; height:52px; border:none; border-radius:12px; background:#375DFB; color:#fff; font:700 15px inherit; cursor:pointer; transition:all .2s ease; box-shadow:0 8px 20px rgba(55,93,251,.3); }
.ex-foot-apply:hover { background:#2D4FE0; box-shadow:0 12px 26px rgba(55,93,251,.42); }

/* тост */
.ex-toast { position:fixed; left:50%; bottom:32px; transform:translateX(-50%); z-index:10001; background:#111827; color:#fff; font-size:14px; font-weight:600; padding:13px 22px; border-radius:12px; box-shadow:0 16px 40px rgba(0,0,0,.3); animation:exToast .25s ease both; }
@keyframes exToast { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
`;

function injectCss() {
  if (typeof document === 'undefined') return;
  let s = document.getElementById('ex-css') as HTMLStyleElement | null;
  if (!s) { s = document.createElement('style'); s.id = 'ex-css'; document.head.appendChild(s); }
  s.textContent = CSS;
}

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; };

function Check({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <label className="ex-check" onClick={onToggle}>
      <span className={`ex-box${on ? ' on' : ''}`}>
        {on && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
      </span>
      {label}
    </label>
  );
}

function toggleIn(arr: string[], v: string) {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

function FiltersModal({ onClose, onApply }: { onClose: () => void; onApply: (n: number) => void }) {
  const [cities, setCities] = useState<string[]>(['Москва', 'Краснодар']);
  const [place, setPlace] = useState<string[]>(['Город']);
  const [season, setSeason] = useState<string[]>(['Летние']);
  const [duration, setDuration] = useState<string[]>(['Дневные']);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const reset = () => { setCities([]); setPlace([]); setSeason([]); setDuration([]); };
  const total = cities.length + place.length + season.length + duration.length;

  return (
    <div className="ex-overlay" onClick={onClose}>
      <div className="ex-modal" onClick={e => e.stopPropagation()}>
        <div className="ex-modal-head">
          <div className="ex-modal-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
            Фильтры учений
          </div>
          <button className="ex-close" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="ex-fgroup">
          <h3>По городам</h3>
          <div className="ex-fopts">
            {CITIES.map(c => <Check key={c} label={c} on={cities.includes(c)} onToggle={() => setCities(s => toggleIn(s, c))} />)}
          </div>
        </div>
        <div className="ex-fgroup">
          <h3>Место проведения</h3>
          <div className="ex-fopts cols-3">
            {['Город', 'Лес', 'Комбинированный'].map(c => <Check key={c} label={c} on={place.includes(c)} onToggle={() => setPlace(s => toggleIn(s, c))} />)}
          </div>
        </div>
        <div className="ex-fgroup">
          <h3>Время года</h3>
          <div className="ex-fopts cols-2">
            {['Летние', 'Зимние'].map(c => <Check key={c} label={c} on={season.includes(c)} onToggle={() => setSeason(s => toggleIn(s, c))} />)}
          </div>
        </div>
        <div className="ex-fgroup">
          <h3>Продолжительность</h3>
          <div className="ex-fopts cols-3">
            {['Дневные', 'Ночные', 'Суточные'].map(c => <Check key={c} label={c} on={duration.includes(c)} onToggle={() => setDuration(s => toggleIn(s, c))} />)}
          </div>
        </div>

        <div className="ex-modal-foot">
          <button className="ex-foot-reset" onClick={reset}>Сбросить</button>
          <button className="ex-foot-apply" onClick={() => onApply(total)}>Показать результат</button>
        </div>
      </div>
    </div>
  );
}

function Calendar({ onClose, onPick }: { onClose: () => void; onPick: (label: string) => void }) {
  const [view, setView] = useState(new Date(2024, 9, 1)); // Октябрь 2024
  const [sel, setSel] = useState(11);
  const y = view.getFullYear();
  const m = view.getMonth();
  const startDow = (new Date(y, m, 1).getDay() + 6) % 7; // Пн = 0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();

  const cells: { d: number; out: boolean }[] = [];
  for (let i = 0; i < startDow; i++) cells.push({ d: prevDays - startDow + 1 + i, out: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, out: false });
  let nextD = 1;
  while (cells.length % 7 !== 0 || cells.length < 42) cells.push({ d: nextD++, out: true });

  const shift = (delta: number) => setView(new Date(y, m + delta, 1));

  return (
    <div className="ex-cal" onClick={e => e.stopPropagation()}>
      <div className="ex-cal-head">
        <button className="ex-cal-nav" onClick={() => shift(-1)} aria-label="Предыдущий месяц"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>
        <span className="m">{MONTHS[m]}, {y}</span>
        <button className="ex-cal-nav" onClick={() => shift(1)} aria-label="Следующий месяц"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>
      </div>
      <div className="ex-cal-grid">
        {WD.map(w => <div key={w} className="ex-cal-wd">{w}</div>)}
        {cells.map((c, i) => {
          const isSel = !c.out && c.d === sel;
          const hasEvent = !c.out && EVENT_DAYS.includes(c.d);
          return (
            <div key={i} className={`ex-cal-day${c.out ? ' out' : ''}${isSel ? ' sel' : ''}`} onClick={() => { if (!c.out) setSel(c.d); }}>
              {c.d}
              {hasEvent && <span className="ex-cal-dot" />}
            </div>
          );
        })}
      </div>
      <div className="ex-cal-done" onClick={() => { onPick(`${sel} ${MONTHS_GEN[m]} ${y}`); onClose(); }}>Готово</div>
    </div>
  );
}

function LeaderCard({ l }: { l: Leader }) {
  return (
    <div className="ex-leader">
      <div className="ex-leader-av"><img src={l.avatar} alt={l.name} onError={imgFallback} /></div>
      <div>
        <div className="ex-leader-name">{l.name}</div>
        <div className="ex-leader-rank">{l.rank}</div>
      </div>
    </div>
  );
}

const IcRoute = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h6a3 3 0 0 0 3-3V8" /></svg>;
const IcRide = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>;
const IcBoard = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2M9 21h6" /></svg>;
const IcReports = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg>;
const IcArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>;

function ExerciseCard({ ex, enrolled, onJoin, onToast, onBoard, onRide }: { ex: Exercise; enrolled: boolean; onJoin: () => void; onToast: (m: string) => void; onBoard: () => void; onRide: () => void }) {
  const navigate = useNavigate();
  const status: Status = ex.status === 'done' ? 'done' : (enrolled ? 'enrolled' : 'open');
  const goDetail = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('button, select, .v.link')) return;
    navigate(`/exercises/${ex.id}`);
  };

  return (
    <div className="ex-card" onClick={goDetail}>
      <div className="ex-top">
        <div className="ex-img"><img src={ex.img} alt={ex.title} onError={imgFallback} /></div>
        <div className="ex-info">
          <h2>{ex.title}</h2>
          <p>{ex.desc}</p>
          <div className="ex-meta">
            <div><div className="k">Город проведения</div><div className="v">{ex.city}</div></div>
            <div><div className="k">Дата</div><div className="v">{ex.date}</div></div>
            <div><div className="k">Время</div><div className="v">{ex.time}</div></div>
            <div><div className="k">Полигон</div><div className="v link" onClick={() => window.open(`https://yandex.ru/maps/?text=${encodeURIComponent(ex.polygon + ' полигон ' + ex.city)}`, '_blank', 'noopener,noreferrer')}>{ex.polygon}</div></div>
          </div>
        </div>
      </div>

      <div className="ex-leaders">
        <div className="ex-lgroup">
          <div className="ex-llabel">Руководитель учений</div>
          <LeaderCard l={ex.director} />
        </div>
        <div className="ex-lgroup two">
          <div className="ex-llabel">Руководители сторон</div>
          <div className="ex-lrow">{ex.sides.map((s, i) => <LeaderCard key={i} l={s} />)}</div>
        </div>
      </div>

      <div className="ex-actions">
        {status === 'done' && (
          <span className="ex-done">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            Учения завершены {ex.doneDate}
          </span>
        )}
        <button className={`ex-btn${status === 'done' ? '' : ''}`} style={status === 'done' ? { marginLeft: 'auto' } : undefined} onClick={() => window.open(`https://yandex.ru/maps/?text=${encodeURIComponent(ex.polygon + ' полигон ' + ex.city)}`, '_blank', 'noopener,noreferrer')}><IcRoute />Маршрут</button>
        {status === 'done' ? (
          <button className="ex-btn" onClick={() => navigate('/study-groups/report')}><IcReports />Изучить рапорты</button>
        ) : (
          <>
            <button className="ex-btn" onClick={onRide}><IcRide />Запросить попутку</button>
            <button className="ex-btn" onClick={onBoard}><IcBoard />Возьму на борт</button>
            {status === 'enrolled'
              ? <button className="ex-btn cancel grow" onClick={() => { onJoin(); onToast('Запись отменена'); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>Отменить запись</button>
              : <button className="ex-btn join grow" onClick={() => { onJoin(); onToast('Вы встали в строй'); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Встать в строй</button>}
          </>
        )}
        <button className="ex-btn primary" onClick={() => navigate(`/exercises/${ex.id}`)}>Подробнее <IcArrow /></button>
      </div>
    </div>
  );
}

export function Exercises() {
  const navigate = useNavigate();
  injectCss();
  const [rangeLabel, setRangeLabel] = useState('За все время');
  const [menuOpen, setMenuOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [monthIdx, setMonthIdx] = useState(9); // Октябрь
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [rideOpen, setRideOpen] = useState(false);
  const [enrolled, setEnrolled] = useState<Record<number, boolean>>({ 2: true });
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!menuOpen && !calOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.ex-datectl')) { setMenuOpen(false); setCalOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen, calOpen]);

  const shiftMonth = (delta: number) => {
    const next = (monthIdx + delta + 12) % 12;
    setMonthIdx(next);
    setRangeLabel(MONTHS[next]);
    setMenuOpen(false); setCalOpen(false);
  };

  return (
    <div className="ex-page">
      <div className="ex-wrap">
        <div className="ex-panel">
          <PortalPageTop
            title="Учения"
            icon={<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>}
            actions={<div className="ex-toolbar">
              <div className="ex-datectl">
                <button className="ex-datearrow" onClick={() => shiftMonth(-1)} aria-label="Назад"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>
                <button className="ex-datelabel" onClick={() => { setMenuOpen(o => !o); setCalOpen(false); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  {rangeLabel}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                <button className="ex-datearrow" onClick={() => shiftMonth(1)} aria-label="Вперёд"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>

                {menuOpen && (
                  <div className="ex-menu" onClick={e => e.stopPropagation()}>
                    {RANGE_OPTIONS.map(o => (
                      <div key={o} className={`ex-menu-item${rangeLabel === o ? ' active' : ''}`} onClick={() => { setRangeLabel(o); setMenuOpen(false); }}>
                        {o}
                        {rangeLabel === o && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                    ))}
                    <div className="ex-menu-cal" onClick={() => { setMenuOpen(false); setCalOpen(true); }}>Календарь</div>
                  </div>
                )}
                {calOpen && <Calendar onClose={() => setCalOpen(false)} onPick={setRangeLabel} />}
              </div>
              <button className="ex-filterbtn" onClick={() => setFiltersOpen(true)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
                Фильтры
              </button>
            </div>}
          />

          <div className="ex-list">
            {EXERCISES.map(ex => (
              <ExerciseCard key={ex.id} ex={ex} enrolled={!!enrolled[ex.id]} onJoin={() => setEnrolled(s => ({ ...s, [ex.id]: !s[ex.id] }))} onToast={setToast} onBoard={() => setBoardOpen(true)} onRide={() => setRideOpen(true)} />
            ))}
          </div>
        </div>
      </div>

      {filtersOpen && <FiltersModal onClose={() => setFiltersOpen(false)} onApply={n => { setFiltersOpen(false); setToast(`Фильтры применены${n ? ` (${n})` : ''}`); }} />}
      {boardOpen && <BoardModal onClose={() => setBoardOpen(false)} />}
      {rideOpen && <RideRequestModal onClose={() => setRideOpen(false)} />}
      {toast && <div className="ex-toast">{toast}</div>}
    </div>
  );
}
