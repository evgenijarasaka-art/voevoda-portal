import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLessonProgressStore } from '../store/useLessonProgressStore';
import { YandexTrainingMap } from '../components/YandexTrainingMap';

/* ─── CSS ─── */
const CSS = `
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .lp-sec { opacity:0; transform:translateY(16px); transition:opacity .5s cubic-bezier(.4,0,.2,1),transform .5s cubic-bezier(.4,0,.2,1); }
  .lp-sec.vis { opacity:1; transform:translateY(0); }
  .lp-ghost { transition:background .15s,border-color .15s,color .15s,transform .12s; }
  .lp-ghost:hover { background:#EBF1FF!important; border-color:#C7D2FE!important; color:#375DFB!important; transform:translateY(-1px); }
  .lp-prim { transition:background .15s,box-shadow .15s,transform .12s; }
  .lp-prim:hover { box-shadow:0 6px 20px rgba(55,93,251,.38); transform:translateY(-2px); }
  .lp-hw:hover { background:#F6F8FF!important; }
  .lp-plan:hover { background:#F8F9FB!important; }
  .lp-mat:hover { background:#F6F8FF!important; }
  .lp-card { transition:box-shadow .22s,transform .22s,border-color .22s; cursor:pointer; }
  .lp-card:hover:not(.locked) { box-shadow:0 10px 32px rgba(55,93,251,.14); transform:translateY(-4px); border-color:#B8CAFE!important; }
  .lp-card:hover:not(.locked) .lp-img { transform:scale(1.05); }
  .lp-img { transition:transform .45s cubic-bezier(.4,0,.2,1); }
  .lp-ev { transition:opacity .15s,transform .12s; cursor:pointer; }
  .lp-ev:hover { opacity:.82; transform:translateY(-1px); }
  .lp-mate:hover { background:#F6F8FF!important; }
  .lp-star:hover { transform:scale(1.22); }
  .lp-tab { transition:color .15s,border-color .15s; }
  .lp-note { border-left:3px solid #375DFB; background:#F0F4FF; padding:14px 18px; border-radius:0 12px 12px 0; }
`;
function injectCss(css: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style'); s.id = id; s.textContent = css;
  document.head.appendChild(s);
}
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('vis'); obs.disconnect(); } }, { threshold: 0.04 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return ref;
}
function Sec({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useReveal();
  return <div ref={ref} className="lp-sec" style={style}>{children}</div>;
}

/* ─── IVDisplay — как в Profile ─── */
function IVDisplay({ index, rating }: { index: number; rating?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F9FAFB', padding: '3px 8px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 12 }}>
        <span style={{ color: '#9CA3AF', fontWeight: 500 }}>ИВ</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        <span style={{ fontWeight: 700, color: '#111' }}>{index}</span>
      </span>
      {rating != null && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFBEB', padding: '3px 8px', borderRadius: 7, border: '1px solid #FDE68A', fontSize: 12 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span style={{ fontWeight: 700, color: '#374151' }}>{rating}</span>
        </span>
      )}
    </div>
  );
}

/* ─── PLAN ─── */
type PlanRow = { type: 'row'; num: string; title: string; mins: number | null; time: string; level: 0|1|2; bold?: boolean } | { type: 'sep'; title: string; desc?: string };
const PLAN: PlanRow[] = [
  { type:'row', num:'01', title:'Инструктаж инструкторов и командиров', mins:10, time:'8.45', level:0 },
  { type:'row', num:'02', title:'Общее построение. Прослушивание Гимна РФ', mins:5, time:'9.05', level:0 },
  { type:'row', num:'03', title:'Прослушивание Гимна Воевода', mins:10, time:'9.15', level:0 },
  { type:'row', num:'04', title:'Инструктаж по плану занятия', mins:10, time:'9.25', level:0 },
  { type:'row', num:'05', title:'Разминка', mins:10, time:'9.30', level:0 },
  { type:'sep', title:'Постоянная часть занятия', desc:'Учебные точки на уровне взвода, каждый командир сам определяет необходимое количество упражнений в блоке, ставя акцент на усвоение материала.' },
  { type:'row', num:'05.1', title:'Тактическая медицина', mins:2, time:'9.35', level:1, bold:true },
  { type:'row', num:'', title:'Инструктаж командиров инструктором / л.с. отдыхает', mins:null, time:'', level:1, bold:true },
  { type:'row', num:'', title:'Остановка кровотечения в красной зоне, переноска раненого в красной зоне, иммобилизация в желтой зоне', mins:13, time:'', level:2 },
  { type:'row', num:'05.2', title:'Тактико-огневая подготовка', mins:2, time:'9.45', level:1, bold:true },
  { type:'row', num:'', title:'Инструктаж командиров инструктором / л.с. отдыхает', mins:null, time:'', level:1, bold:true },
  { type:'row', num:'', title:'Выстраивается тропа мишеней при штурме здания с улицы. Малая группа проходит по маршруту поражая все мишени', mins:13, time:'', level:2 },
  { type:'row', num:'05.3', title:'Самоподготовка', mins:2, time:'9.50', level:1 },
  { type:'row', num:'', title:'Самостоятельный повтор предыдущих занятий силами самих курсантов', mins:null, time:'', level:2 },
  { type:'row', num:'05.4', title:'Технический перерыв', mins:5, time:'10.15', level:1 },
  { type:'sep', title:'Переменная часть занятий' },
  { type:'row', num:'06', title:'Теория и практика', mins:145, time:'10.20', level:0 },
  { type:'row', num:'06.1', title:'Теория', mins:2, time:'10.225', level:1 },
  { type:'row', num:'', title:'1. Распределение огневых средств.\n2. Выбор укрытия.\n3. Выбор места ведения огня.', mins:null, time:'', level:2 },
  { type:'row', num:'06.2', title:'Практика', mins:2, time:'10.30', level:1 },
  { type:'row', num:'', title:'1. Разбор работы каждого специалиста.\n2. Назначение ориентиров сектора', mins:null, time:'', level:2 },
  { type:'sep', title:'Перерыв на обед', desc:'30 минут · 12.45' },
  { type:'row', num:'07', title:'Практика', mins:145, time:'13.20', level:0 },
  { type:'row', num:'07.1', title:'Упражнения', mins:2, time:'14.45', level:1 },
  { type:'row', num:'', title:'6. Работа с одноразовым гранатомётом\n7. Отработка маневрирования', mins:null, time:'', level:2 },
  { type:'row', num:'08', title:'Учебно-боевая задача', mins:145, time:'15.20', level:0 },
  { type:'row', num:'09', title:'Заключительные упражнения на выносливость', mins:145, time:'15.20', level:0 },
  { type:'row', num:'09.1', title:'Эвакуация раненых', mins:20, time:'16.30', level:1 },
  { type:'row', num:'', title:'Проводится с места завершения тактических занятий до лагеря', mins:null, time:'', level:2 },
  { type:'row', num:'10', title:'Подведение итогов занятия и роспуск групп', mins:10, time:'17.00', level:0 },
  { type:'row', num:'11', title:'Подведение итогов с инструкторами и командирами', mins:10, time:'17.10', level:0 },
];

/* ─── LESSONS ─── */
const LESSONS = [
  { id:1, num:'01', title:'Введение в военное дело',     date:'3 марта, 2026',  time:'с 9 до 17', img:'/СписокЗанятий.png', locked:false },
  { id:2, num:'01', title:'Холощение с оружием',         date:'3 марта, 2026',  time:'с 9 до 17', img:'/СписокЗанятий.png', locked:false },
  { id:3, num:'01', title:'Действия бойца в лесу',       date:'3 марта, 2026',  time:'с 9 до 17', img:'/СписокЗанятий.png', locked:true  },
  { id:4, num:'01', title:'Тактическая медицина',        date:'10 марта, 2026', time:'с 9 до 17', img:'/СписокЗанятий.png', locked:false },
  { id:5, num:'02', title:'Ориентирование на местности', date:'17 марта, 2026', time:'с 9 до 17', img:'/СписокЗанятий.png', locked:true  },
  { id:6, num:'02', title:'Огневая подготовка',          date:'24 марта, 2026', time:'с 9 до 17', img:'/СписокЗанятий.png', locked:true  },
];

/* ─── CALENDAR ─── */
type EvType = 'auditorium'|'polygon'|'range';
type CalEv = { day:number; month:number; year:number; title:string; num:number; time:string; type:EvType; instructor:string; img:string; lessonId:number };
const EVTS: CalEv[] = [
  { day:1,  month:2, year:2024, title:'Вводное занятие',                        num:1, time:'10:00 - 15:00', type:'auditorium', instructor:'Бек',     img:'/teacher1-main.jpg', lessonId:1 },
  { day:5,  month:2, year:2024, title:'Личная тактическая подготовка снайпера', num:2, time:'10:00 - 15:00', type:'auditorium', instructor:'Бек',     img:'/teacher1-main.jpg', lessonId:2 },
  { day:14, month:2, year:2024, title:'Личная тактическая подготовка снайпера', num:3, time:'10:00 - 15:00', type:'polygon',    instructor:'Торнадо', img:'/teacher2-main.jpg', lessonId:3 },
  { day:17, month:2, year:2024, title:'Летучка',                                num:4, time:'10:00 - 15:00', type:'polygon',    instructor:'Торнадо', img:'/teacher2-main.jpg', lessonId:4 },
  { day:20, month:2, year:2024, title:'Огневая подготовка',                     num:5, time:'10:00 - 15:00', type:'range',      instructor:'Grek',    img:'/teacher3-main.jpg', lessonId:5 },
  { day:26, month:2, year:2024, title:'Азы военной топографии',                 num:6, time:'10:00 - 15:00', type:'auditorium', instructor:'Бек',     img:'/teacher1-main.jpg', lessonId:6 },
  { day:28, month:2, year:2024, title:'Технические средства разведки',          num:7, time:'10:00 - 15:00', type:'auditorium', instructor:'Бек',     img:'/teacher1-main.jpg', lessonId:6 },
  { day:30, month:2, year:2024, title:'Огневая подготовка',                     num:8, time:'10:00 - 15:00', type:'range',      instructor:'Grek',    img:'/teacher3-main.jpg', lessonId:5 },
  { day:5,  month:3, year:2024, title:'Тактическая медицина',                   num:9, time:'10:00 - 15:00', type:'auditorium', instructor:'Бек',     img:'/teacher1-main.jpg', lessonId:1 },
  { day:12, month:3, year:2024, title:'Ориентирование на местности',            num:10,time:'10:00 - 15:00', type:'polygon',    instructor:'Торнадо', img:'/teacher2-main.jpg', lessonId:2 },
  { day:19, month:3, year:2024, title:'Огневая подготовка снайпера',            num:11,time:'10:00 - 15:00', type:'range',      instructor:'Grek',    img:'/teacher3-main.jpg', lessonId:3 },
  { day:26, month:3, year:2024, title:'Разведка и наблюдение',                  num:12,time:'10:00 - 15:00', type:'polygon',    instructor:'Торнадо', img:'/teacher2-main.jpg', lessonId:4 },
];
const TC: Record<EvType,{bg:string;text:string;border:string}> = {
  auditorium:{ bg:'#DBEAFE', text:'#1D4ED8', border:'#BFDBFE' },
  polygon:   { bg:'#D1FAE5', text:'#065F46', border:'#A7F3D0' },
  range:     { bg:'#FED7AA', text:'#C2410C', border:'#FDBA74' },
};
const MN = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DN = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];

/* ─── HW ─── */
const HW = [
  { id:1, num:1, title:'Ориентирование в лесистой местности', sub:'Составить конспект и выписать правила', deadline:null as string|null, dc:'#10B981', status:'done' },
  { id:2, num:2, title:'Огневая подготовка снайпера', sub:'Тест по огневой подготовке', deadline:'Сдать до завтра', dc:'#F59E0B', status:'retry' },
  { id:3, num:3, title:'Внутренняя и внешняя баллистика', sub:'Пройдите тест на знание основ', deadline:'Сдать до 14 апреля', dc:'#10B981', status:'test' },
  { id:4, num:4, title:'Огневая подготовка снайпера', sub:'Практика на полигоне', deadline:null, dc:'#9CA3AF', status:'locked' },
];
const MATS = [
  { type:'PDF', name:'Рабочая тетрадь', size:'224 мб' },
  { type:'JPG', name:'Пример карты', size:'302 кб' },
  { type:'MP4', name:'Видео-материалы', size:'2.2 гб' },
];
const FC: Record<string,string> = { PDF:'#EF4444', JPG:'#3B82F6', MP4:'#8B5CF6' };

function downloadDemoFile(name: string, type: string) {
  const ext = type === 'JPG' ? 'jpg' : type === 'MP4' ? 'mp4' : 'pdf';
  const safeName = name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-').toLowerCase();
  const blob = new Blob([
    `Демонстрационный материал портала ВОЕВОДА\n\nФайл: ${name}\nТип: ${type}\n\nВ реальной версии сюда будет подставлена ссылка на загруженный учебный материал.`,
  ], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName || 'material'}.${ext}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/* ─── CLASSMATES (каждый со своим ИВ и рейтингом) ─── */
const MATES = [
  { id:1, name:'Бек',   rank:'Майор',     spec:'Пулемётчик', img:'/teacher1-main.jpg', index:1842, rating:4.8 },
  { id:2, name:'Резак', rank:'Майор',     spec:'Снайпер',    img:'/teacher2-main.jpg', index:2100, rating:5.0 },
  { id:3, name:'Шторм', rank:'Капитан',   spec:'Медик',      img:'/teacher3-main.jpg', index:1654, rating:4.6 },
  { id:4, name:'Лис',   rank:'Майор',     spec:'Разведчик',  img:'/teacher1-main.jpg', index:2230, rating:4.9 },
  { id:5, name:'Волк',  rank:'Майор',     spec:'Сапёр',      img:'/teacher2-main.jpg', index:1980, rating:4.7 },
  { id:6, name:'Ghost', rank:'Лейтенант', spec:'Связист',    img:'/teacher3-main.jpg', index:1540, rating:4.5 },
];

const STUDY = [
  { id:'s1', img:'/спрятался1.png', title:'Снайперская тактика',
    text:['На сегодняшний день в большинстве армий существуют две основные концепции снайпинга:','1. Снайперская пара или одиночный стрелок работают в режиме «свободной охоты».','2. Снайперско-разведывательный патруль сковывает действия противника в своей зоне ответственности.'],
    note:'Для выполнения боевых задач снайпер должен располагаться на тщательно замаскированной позиции.', video:false },
  { id:'s2', img:'/спрятались2.png', title:'Маскировка и наблюдение',
    text:['О законах и приёмах маскировки и наблюдения написано достаточно. Наблюдать нужно очень внимательно, не упуская никаких мелочей.'],
    note:null, video:true },
];

function IcLock() {
  return (
    <div style={{ width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,.18)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    </div>
  );
}

function useCountdown(target: Date) {
  const calc = () => { const d = Math.max(0,target.getTime()-Date.now()); return { days:Math.floor(d/86400000),hours:Math.floor((d%86400000)/3600000),minutes:Math.floor((d%3600000)/60000),seconds:Math.floor((d%60000)/1000) }; };
  const [t,setT] = useState(calc);
  useEffect(() => { const id = setInterval(()=>setT(calc()),1000); return ()=>clearInterval(id); },[]);
  return t;
}
function Countdown({ target }: { target: Date }) {
  const {days,hours,minutes,seconds} = useCountdown(target);
  const pad = (n:number) => String(n).padStart(2,'0');
  return (
    <div style={{ display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
      {[['дней',days],['часов',hours],['минут',minutes],['секунд',seconds]].map(([l,v],i,arr)=>(
        <div key={String(l)} style={{ display:'flex',alignItems:'center',gap:i<arr.length-1?6:0 }}>
          <div style={{ textAlign:'center',minWidth:54,background:'#F8F9FB',borderRadius:12,padding:'8px 6px',border:'1px solid #E5E7EB' }}>
            <div style={{ fontSize:24,fontWeight:800,color:'#111',lineHeight:1 }}>{pad(v as number)}</div>
            <div style={{ fontSize:10,color:'#9CA3AF',marginTop:3 }}>{l}</div>
          </div>
          {i<arr.length-1&&<span style={{ fontSize:20,fontWeight:800,color:'#D1D5DB',marginBottom:10 }}>:</span>}
        </div>
      ))}
    </div>
  );
}

const COURSE_START_DAY = 23;
const COURSE_START_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function getNextCourseStart(reference = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), COURSE_START_DAY, 9, 0, 0);
  if (start.getTime() <= reference.getTime()) start.setMonth(start.getMonth() + 1);
  return start;
}

function formatCourseStart(date: Date) {
  return `${date.getDate()} ${COURSE_START_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/* ═══════════ CALENDAR ═══════════ */
function CalendarView({ onGo }: { onGo:(id:number)=>void }) {
  const today = new Date();
  const [yr,setYr] = useState(2024);
  const [mo,setMo] = useState(2);
  const [drop,setDrop] = useState(false);
  const prev = () => mo===0?(setMo(11),setYr(y=>y-1)):setMo(m=>m-1);
  const next = () => mo===11?(setMo(0),setYr(y=>y+1)):setMo(m=>m+1);
  const goToday = () => { setYr(today.getFullYear()); setMo(today.getMonth()); };
  const fdow = (new Date(yr,mo,1).getDay()+6)%7;
  const td = new Date(yr,mo+1,0).getDate();
  const prevLast = new Date(yr,mo,0).getDate();
  const cells: {day:number;cur:boolean;isToday:boolean}[] = [];
  for (let i=fdow-1;i>=0;i--) cells.push({day:prevLast-i,cur:false,isToday:false});
  for (let d=1;d<=td;d++) cells.push({day:d,cur:true,isToday:d===today.getDate()&&mo===today.getMonth()&&yr===today.getFullYear()});
  const rem=(7-(cells.length%7))%7;
  for (let d=1;d<=rem;d++) cells.push({day:d,cur:false,isToday:false});
  const dayEvts = (d:number) => EVTS.filter(e=>e.day===d&&e.month===mo&&e.year===yr);
  return (
    <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',overflow:'hidden' }}>
      {/* header */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',borderBottom:'1px solid #F0F0F0',flexWrap:'wrap',gap:12 }}>
        <div style={{ display:'flex',alignItems:'center',gap:16,flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            <button onClick={()=>setDrop(x=>!x)} style={{ display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',padding:0 }}>
              <span style={{ fontSize:15,color:'#9CA3AF' }}>Расписание на</span>
              <span style={{ fontSize:20,fontWeight:700,color:'#111' }}>{MN[mo]} {yr}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {drop&&(
              <div style={{ position:'absolute',top:'calc(100% + 8px)',left:0,background:'#fff',border:'1px solid #E5E7EB',borderRadius:14,padding:'8px 0',boxShadow:'0 12px 36px rgba(0,0,0,.12)',zIndex:300,minWidth:160,animation:'fadeUp .14s ease' }}>
                {MN.map((m,i)=>(
                  <button key={m} onClick={()=>{setMo(i);setDrop(false);}}
                    style={{ display:'block',width:'100%',padding:'8px 16px',textAlign:'left',background:i===mo?'#EBF1FF':'none',border:'none',fontSize:13,color:i===mo?'#375DFB':'#374151',cursor:'pointer',fontWeight:i===mo?600:400 }}
                    onMouseEnter={e=>{if(i!==mo)e.currentTarget.style.background='#F9FAFB';}} onMouseLeave={e=>{if(i!==mo)e.currentTarget.style.background='none';}}>
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display:'flex',gap:14,fontSize:12,color:'#6B7280' }}>
            {([['#60A5FA','Аудитория'],['#34D399','Полигон'],['#FB923C','Стрельбище']] as [string,string][]).map(([c,l])=>(
              <span key={l} style={{ display:'flex',alignItems:'center',gap:5 }}>
                <span style={{ width:9,height:9,borderRadius:'50%',background:c,flexShrink:0,display:'inline-block' }}/>{l}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display:'flex',gap:8 }}>
          <button onClick={prev} style={{ width:34,height:34,borderRadius:9,background:'#F4F6FA',border:'1px solid #E5E7EB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'background .15s' }} onMouseEnter={e=>(e.currentTarget.style.background='#EBF1FF')} onMouseLeave={e=>(e.currentTarget.style.background='#F4F6FA')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={goToday} style={{ padding:'6px 14px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:9,fontSize:13,color:'#374151',cursor:'pointer',fontWeight:500,transition:'all .15s' }} onMouseEnter={e=>{e.currentTarget.style.background='#EBF1FF';e.currentTarget.style.borderColor='#C7D2FE';e.currentTarget.style.color='#375DFB';}} onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.borderColor='#E5E7EB';e.currentTarget.style.color='#374151';}}>Сегодня</button>
          <button onClick={next} style={{ width:34,height:34,borderRadius:9,background:'#F4F6FA',border:'1px solid #E5E7EB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'background .15s' }} onMouseEnter={e=>(e.currentTarget.style.background='#EBF1FF')} onMouseLeave={e=>(e.currentTarget.style.background='#F4F6FA')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      {/* grid */}
      <div style={{ overflowX:'auto' }}>
        <div style={{ minWidth:700 }}>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid #F0F0F0' }}>
            {DN.map(d=><div key={d} style={{ padding:'10px 0',textAlign:'center',fontSize:12,fontWeight:600,color:'#9CA3AF',letterSpacing:'.3px' }}>{d}</div>)}
          </div>
          {Array.from({length:cells.length/7}).map((_,wi)=>(
            <div key={wi} style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:wi<cells.length/7-1?'1px solid #F5F5F7':'none' }}>
              {cells.slice(wi*7,wi*7+7).map((cell,di)=>{
                const evs = cell.cur?dayEvts(cell.day):[];
                return (
                  <div key={di} style={{ minHeight:100,padding:'5px 5px 7px',borderRight:di<6?'1px solid #F5F5F7':'none' }}>
                    <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:3 }}>
                      <span style={{ width:24,height:24,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:cell.isToday?700:400,color:cell.isToday?'#fff':cell.cur?'#374151':'#D1D5DB',background:cell.isToday?'#EF4444':'transparent' }}>{cell.day}</span>
                    </div>
                    <div style={{ display:'flex',flexDirection:'column',gap:3 }}>
                      {evs.map((ev,ei)=>{
                        const c=TC[ev.type];
                        return (
                          <div key={ei} className="lp-ev" onClick={()=>onGo(ev.lessonId)} style={{ background:c.bg,border:`1px solid ${c.border}`,borderRadius:7,padding:'4px 6px' }}>
                            <div style={{ fontSize:11,fontWeight:600,color:c.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',marginBottom:2 }}>{ev.title}</div>
                            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:10,color:c.text,opacity:.85,marginBottom:3 }}><span>{ev.time}</span><span style={{ fontWeight:600 }}>№{ev.num}</span></div>
                            <div style={{ display:'flex',alignItems:'center',gap:4 }}>
                              <div style={{ width:16,height:16,borderRadius:'50%',overflow:'hidden',background:'#E5E7EB',flexShrink:0 }}>
                                <img src={ev.img} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/>
                              </div>
                              <span style={{ fontSize:10,color:c.text,opacity:.9,fontWeight:500 }}>{ev.instructor}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ PAGE ═══════════ */
export function LessonPage() {
  const navigate = useNavigate();
  const { id } = useParams<{id:string}>();
  const location = useLocation();
  const routeState = location.state as { courseTitle?: string; courseSlug?: string } | null;
  const lessonId = id ?? '1';
  const currentLesson = LESSONS.find(l => String(l.id) === lessonId) ?? LESSONS[0];
  const TITLE = currentLesson.title;
  const courseTitle = routeState?.courseTitle ?? 'Курс Общевойскового снайпера V5';
  const courseSlug = routeState?.courseSlug ?? encodeURIComponent(courseTitle);
  const viewedLessons = useLessonProgressStore(s => s.lessons);
  const lessonProgress = useLessonProgressStore(s => s.lessons[lessonId]);
  const markLessonViewed = useLessonProgressStore(s => s.markLessonViewed);
  const [vote,setVote] = useState('Я в строю');
  const [voteSaved, setVoteSaved] = useState(false);
  const [voteTotals, setVoteTotals] = useState<Record<string, number>>({ 'Я в строю': 18, 'Отсутствую': 2, 'Под вопросом': 4 });
  const [attendancePulse, setAttendancePulse] = useState(false);
  const [rideMode, setRideMode] = useState<'offer' | 'request' | null>(null);
  const [reportReady, setReportReady] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [tab,setTab] = useState<'hw'|'study'>('hw');
  const [matTab,setMatTab] = useState<'mat'|'comments'>('mat');
  const [studyDone,setStudyDone] = useState(false);
  const [notifyOpen,setNotifyOpen] = useState(false);
  const [modal,setModal] = useState<typeof LESSONS[0]|null>(null);
  const [stars,setStars] = useState(5);
  const [hoverStar,setHoverStar] = useState(0);
  const [e1,setE1] = useState(false);
  const [e2,setE2] = useState(false);
  const [notice, setNotice] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSent, setCommentSent] = useState(false);

  useEffect(()=>{ injectCss(CSS,'lp-v4'); },[]);

  useEffect(() => {
    markLessonViewed({
      id: lessonId,
      title: TITLE,
      courseTitle,
      courseSlug,
    });
  }, [lessonId, TITLE, courseTitle, courseSlug, markLessonViewed]);

  const target = useMemo(() => getNextCourseStart(), []);
  const targetLabel = useMemo(() => formatCourseStart(target), [target]);
  const viewedAtLabel = lessonProgress?.viewedAt
    ? new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(lessonProgress.viewedAt))
    : '';
  const saveLessonViewed = () => {
    markLessonViewed({ id: lessonId, title: TITLE, courseTitle, courseSlug });
    setAttendancePulse(true);
    window.setTimeout(() => setAttendancePulse(false), 1400);
  };
  const submitVote = () => {
    setVoteTotals(prev => ({ ...prev, [vote]: (prev[vote] ?? 0) + (voteSaved ? 0 : 1) }));
    setVoteSaved(true);
  };
  const createReportDraft = () => {
    setReportReady(true);
  };
  const submitReview = () => {
    setReviewSaved(true);
  };
  const submitComment = () => {
    if (!commentText.trim()) {
      setCommentSent(false);
      return;
    }
    setCommentSent(true);
    setCommentText('');
  };
  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2400);
  };
  const BC: [string,string|null][] = [['Главная','/'],['Личный кабинет','/profile'],['Мои курсы','/my-courses'],[courseTitle,`/my-courses/${courseSlug}`],[TITLE,null]];

  return (
    <div style={{ paddingTop:60,marginLeft:56,minHeight:'100vh',background:'#F4F6FB' }}>
      {notice && (
        <div style={{ position:'fixed',right:24,bottom:24,zIndex:10000,background:'#111827',color:'#fff',borderRadius:12,padding:'12px 16px',fontSize:13,fontWeight:700,boxShadow:'0 18px 45px rgba(17,24,39,.24)' }}>
          {notice}
        </div>
      )}

      {/* TOP BAR */}
      <div style={{ background:'#fff',borderBottom:'1px solid #E5E7EB',padding:'12px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',animation:'fadeIn .3s ease' }}>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span style={{ fontSize:18,fontWeight:700,color:'#111' }}>{TITLE}</span>
        </div>
        <div style={{ position:'relative' }}>
          <button onClick={()=>setNotifyOpen(x=>!x)} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:'#374151',cursor:'pointer',transition:'all .15s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#C7D2FE';e.currentTarget.style.color='#375DFB';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#E5E7EB';e.currentTarget.style.color='#374151';}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Уведомить меня <span style={{ color:'#375DFB',fontWeight:600 }}>за день</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {notifyOpen&&(
            <div style={{ position:'absolute',top:'calc(100% + 8px)',right:0,background:'#fff',border:'1px solid #E5E7EB',borderRadius:14,padding:'8px 0',boxShadow:'0 12px 36px rgba(0,0,0,.12)',zIndex:200,minWidth:180,animation:'fadeUp .15s ease' }}>
              {['за 2 часа','за день','за 3 дня','за неделю'].map(o=>(
                <button key={o} onClick={()=>setNotifyOpen(false)} style={{ display:'block',width:'100%',padding:'9px 16px',textAlign:'left',background:'none',border:'none',fontSize:13,color:'#374151',cursor:'pointer' }} onMouseEnter={e=>(e.currentTarget.style.background='#F4F6FA')} onMouseLeave={e=>(e.currentTarget.style.background='none')}>Уведомить {o}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BREADCRUMB */}
      <div style={{ background:'#fff',borderBottom:'1px solid #E5E7EB',padding:'9px 28px',display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#9CA3AF',flexWrap:'wrap' }}>
        {BC.map(([l,p],i)=>(
          <span key={i} style={{ display:'flex',alignItems:'center',gap:5 }}>
            {p?<span onClick={()=>navigate(p)} style={{ cursor:'pointer',transition:'color .15s' }} onMouseEnter={e=>(e.currentTarget.style.color='#375DFB')} onMouseLeave={e=>(e.currentTarget.style.color='#9CA3AF')}>{l}</span>:<span style={{ color:'#374151',fontWeight:500 }}>{l}</span>}
            {i<BC.length-1&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>
        ))}
      </div>

      <div style={{ padding:'24px 28px 60px',maxWidth:1240,margin:'0 auto' }}>

        {/* ══ 1. УРОК ══ */}
        <Sec style={{ marginBottom:20 }}>
        <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',padding:'24px' }}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 420px',gap:24,alignItems:'start' }}>
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                {/* --- всё содержимое левой колонки без изменений --- */}
                <div>
                <h1 style={{ fontSize:22,fontWeight:800,color:'#0D0F14',margin:'0 0 10px',lineHeight:1.3 }}>{TITLE}</h1>
                <p style={{ fontSize:14,color:'#4B5563',lineHeight:1.7,margin:0 }}>Урок отличается от всего того, что существует в войсках, поскольку полностью заточен на боевую подготовку. Нам известно много случаев подписания курсантами контракта с ВС РФ после прохождения КМБ и их командировку в зону боевых действий.</p>
                </div>
                <div style={{ background:'#F9FAFB',borderRadius:14,border:'1px solid #E5E7EB',padding:'13px 16px',display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ width:34,height:34,borderRadius:9,background:'#F4F6FA',border:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'center' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <span style={{ fontSize:14,fontWeight:600,color:'#374151',flex:1 }}>Дата и время</span>
                <span style={{ fontSize:14,color:'#6B7280' }}>24 марта / с 09.00 – 17.00</span>
                </div>
                <div style={{ background:'#F9FAFB',borderRadius:14,border:'1px solid #E5E7EB',padding:'13px 16px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap' }}>
                <div style={{ width:44,height:44,borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'#F3F4F6' }}><img src="/teacher2-main.jpg" alt="Бек" style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/></div>
                <div style={{ flex:1 }}><div style={{ fontSize:15,fontWeight:700,color:'#111' }}>Бек</div><div style={{ fontSize:12,color:'#9CA3AF' }}>Главный инструктор</div></div>
                <button className="lp-ghost" onClick={()=>navigate('/messages?chat=1')} style={{ padding:'8px 14px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:'#374151',cursor:'pointer' }}>Задать вопрос</button>
                </div>
                <div style={{ background:'#F0FDF4',borderRadius:14,border:'1px solid #BBF7D0',padding:'13px 16px',display:'flex',alignItems:'center',gap:12,boxShadow:attendancePulse?'0 0 0 4px rgba(16,185,129,.14), 0 12px 30px rgba(16,185,129,.16)':'none',transform:attendancePulse?'scale(1.01)':'scale(1)',transition:'box-shadow .22s, transform .22s' }}>
                <div style={{ width:34,height:34,borderRadius:9,background:'#10B981',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:800,color:'#065F46',marginBottom:2 }}>Просмотрено</div>
                  <div style={{ fontSize:12,color:'#047857' }}>Отметка сохранена в личном кабинете{viewedAtLabel ? `: ${viewedAtLabel}` : ''}</div>
                </div>
                <button className="lp-ghost" onClick={saveLessonViewed} style={{ padding:'8px 13px',background:attendancePulse?'#DCFCE7':'#fff',border:'1px solid #BBF7D0',borderRadius:10,fontSize:12,fontWeight:700,color:'#047857',cursor:'pointer',transition:'background .18s, transform .18s',transform:attendancePulse?'translateY(-1px)':'none' }}>{attendancePulse ? 'Отметка обновлена' : 'Обновить отметку'}</button>
                </div>
                <div style={{ background:'#F9FAFB',borderRadius:14,border:'1px solid #E5E7EB',padding:'14px 16px' }}>
                <div style={{ fontSize:14,fontWeight:600,color:'#111',marginBottom:10 }}>Голосование по прибытию</div>
                <div style={{ display:'flex',gap:10 }}>
                    <div style={{ position:'relative',flex:1 }}>
                    <select value={vote} onChange={e=>setVote(e.target.value)} style={{ width:'100%',padding:'10px 34px 10px 12px',border:'1px solid #E5E7EB',borderRadius:10,fontSize:14,color:'#374151',background:'#fff',appearance:'none',cursor:'pointer',outline:'none' }}>
                        <option>Я в строю</option><option>Отсутствую</option><option>Под вопросом</option>
                    </select>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none' }}><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <button className="lp-prim" onClick={submitVote} style={{ padding:'10px 22px',background:voteSaved?'#10B981':'#375DFB',border:'none',borderRadius:10,fontSize:14,fontWeight:600,color:'#fff',cursor:'pointer',boxShadow:voteSaved?'0 4px 14px rgba(16,185,129,.26)':'0 4px 14px rgba(55,93,251,.28)' }}>{voteSaved ? 'Голос сохранён' : 'Проголосовать'}</button>
                </div>
                {voteSaved && (
                  <div style={{ marginTop:12,display:'flex',flexDirection:'column',gap:8,animation:'fadeUp .22s ease both' }}>
                    {Object.entries(voteTotals).map(([label,total]) => {
                      const sum = Object.values(voteTotals).reduce((a,b)=>a+b,0) || 1;
                      const pct = Math.round(total / sum * 100);
                      return (
                        <div key={label}>
                          <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748B',fontWeight:700,marginBottom:4 }}>
                            <span>{label}</span><span>{pct}%</span>
                          </div>
                          <div style={{ height:7,background:'#E5E7EB',borderRadius:99,overflow:'hidden' }}>
                            <div style={{ height:'100%',width:`${pct}%`,background:label===vote?'#10B981':'#93C5FD',borderRadius:99,transition:'width .55s cubic-bezier(.4,0,.2,1)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                </div>
                <div style={{ background:'#F9FAFB',borderRadius:14,border:'1px solid #E5E7EB',padding:'14px 16px' }}>
                <div style={{ fontSize:15,fontWeight:700,color:'#111',marginBottom:3 }}>Полигон «Калибр»</div>
                <div style={{ fontSize:13,color:'#6B7280',marginBottom:12 }}>Минское шоссе, 31-й километр, с1</div>
                <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:10 }}>
                    {[['Возьму на борт',<svg key="a" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>],['Запросить попутку',<svg key="b" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>],['Маршрут',<svg key="c" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="3" cy="6" r="2"/><circle cx="21" cy="6" r="2"/><polyline points="3 8 3 14 21 14 21 8"/><line x1="12" y1="14" x2="12" y2="19"/></svg>]].map(([l,ic])=>(
                    <button key={String(l)} className="lp-ghost" onClick={() => String(l).includes('Маршрут') ? window.open('https://yandex.ru/maps/?rtext=~55.714,37.192&rtt=auto&z=12', '_blank', 'noopener,noreferrer') : setRideMode(String(l).includes('Возьму') ? 'offer' : 'request')} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 12px',background:!String(l).includes('Маршрут')&&rideMode===(String(l).includes('Возьму')?'offer':'request')?'#EBF1FF':'#fff',border:'1px solid #E5E7EB',borderRadius:9,fontSize:13,color:!String(l).includes('Маршрут')&&rideMode===(String(l).includes('Возьму')?'offer':'request')?'#375DFB':'#374151',cursor:'pointer' }}>{ic}{l}</button>
                    ))}
                </div>
                <div style={{ display:'flex',gap:14,fontSize:12 }}>
                    <button type="button" onClick={() => setRideMode('offer')} style={{ border:'none',background:'transparent',color:'#375DFB',cursor:'pointer',fontSize:12,fontWeight:700,textDecoration:'underline dotted',padding:0,display:'inline-flex',alignItems:'center',gap:4 }}>7 могут взять на борт <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg></button>
                    <button type="button" onClick={() => setRideMode('request')} style={{ border:'none',background:'transparent',color:'#375DFB',cursor:'pointer',fontSize:12,fontWeight:700,textDecoration:'underline dotted',padding:0,display:'inline-flex',alignItems:'center',gap:4 }}>16 ищут попутку <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg></button>
                </div>
                {rideMode && (
                  <div style={{ marginTop:12,border:'1px solid #C7D2FE',background:'#F5F8FF',borderRadius:12,padding:'12px 14px',animation:'fadeUp .18s ease both' }}>
                    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:8 }}>
                      <div style={{ fontSize:13,fontWeight:800,color:'#172554' }}>{rideMode === 'offer' ? 'Свободные места в машинах' : 'Заявки на попутку'}</div>
                      <button onClick={() => navigate(`/messages?chat=${rideMode === 'offer' ? 7 : 4}`)} style={{ border:'none',background:'#375DFB',color:'#fff',borderRadius:9,padding:'7px 12px',fontSize:12,fontWeight:800,cursor:'pointer' }}>Открыть чат</button>
                    </div>
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
                      {(rideMode === 'offer' ? ['Нексус · 2 места', 'Бек · 1 место', 'Резак · 3 места'] : ['Стрелок · от Сокольников', 'Лис · от Митино', 'Шторм · от ВДНХ']).map(item => (
                        <div key={item} style={{ background:'#fff',border:'1px solid #DBEAFE',borderRadius:10,padding:'8px 10px',fontSize:12,color:'#334155',fontWeight:700 }}>{item}</div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
                <div style={{ background:'#F9FAFB',borderRadius:14,border:'1px solid #E5E7EB',padding:'13px 16px',display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ width:34,height:34,borderRadius:9,background:'#F4F6FA',border:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'center' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <span style={{ fontSize:15,fontWeight:600,color:'#111',flex:1 }}>Рапорты</span>
                <button className="lp-ghost" onClick={() => navigate('/messages?chat=7')} style={{ padding:'7px 14px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:'#374151',cursor:'pointer' }}>Запросить</button>
                <button className="lp-ghost" onClick={createReportDraft} style={{ padding:'7px 14px',background:reportReady?'#ECFDF5':'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:reportReady?'#047857':'#374151',cursor:'pointer' }}>{reportReady ? 'Рапорт готов' : 'Составить'}</button>
                {reportReady && (
                  <div style={{ flexBasis:'100%',background:'#fff',border:'1px solid #D1FAE5',borderRadius:11,padding:'10px 12px',fontSize:12,color:'#047857',fontWeight:700,animation:'fadeUp .18s ease both' }}>
                    Черновик рапорта создан. Можно открыть диалог с инструктором и отправить на проверку.
                  </div>
                )}
                </div>
            </div>

            {/* Правая колонка */}
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                <div style={{ borderRadius:18,overflow:'hidden',background:'#F3F4F6',height:280,flexShrink:0 }}>
                {!e1
                    ? <img src="/отжимание.png" alt="" style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} onError={()=>setE1(true)}/>
                    : <div style={{ width:'100%',height:'100%',background:'linear-gradient(135deg,#1a1a2e,#16213e)',display:'flex',alignItems:'center',justifyContent:'center' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>
                }
                </div>
                <YandexTrainingMap variant="course" height={280} />
            </div>
            </div>
        </div>
        </Sec>

        {/* ══ 2. ПЛАН ЗАНЯТИЯ ══ */}
        <Sec style={{ marginBottom:20 }}>
          <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',overflow:'hidden' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',borderBottom:'1px solid #F0F0F0' }}>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                <span style={{ fontSize:18,fontWeight:700,color:'#111' }}>План занятия</span>
              </div>
              <button className="lp-ghost" onClick={() => downloadDemoFile('План занятия', 'PDF')} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:'#374151',cursor:'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Скачать PDF
              </button>
            </div>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#F9FAFB' }}>
                  {['№','Упражнения','Выделено минут','Время начала'].map((h,i)=>(
                    <th key={h} style={{ padding:'10px 16px',fontSize:12,color:'#6B7280',fontWeight:500,textAlign:i===0?'center':i>=2?'center':'left',borderBottom:'1px solid #F0F0F0',width:i===0?70:i>=2?140:undefined }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN.map((r,idx)=>{
                  if (r.type==='sep') return (
                    <tr key={idx} style={{ background:'#F9FAFB' }}>
                      <td colSpan={4} style={{ padding:'11px 16px',borderTop:'1px solid #F0F0F0',borderBottom:'1px solid #F0F0F0' }}>
                        <div style={{ fontSize:13,fontWeight:700,color:'#374151' }}>{r.title}</div>
                        {r.desc&&<div style={{ fontSize:12,color:'#6B7280',marginTop:3,lineHeight:1.5 }}>{r.desc}</div>}
                      </td>
                    </tr>
                  );
                  const pl=r.level===0?16:r.level===1?34:52;
                  return (
                    <tr key={idx} className="lp-plan" style={{ borderBottom:'1px solid #F5F5F7',transition:'background .12s' }}>
                      <td style={{ padding:'9px 16px',textAlign:'center',fontSize:13,fontWeight:600,color:r.level===0?'#374151':'#9CA3AF' }}>{r.num}</td>
                      <td style={{ padding:`9px 16px 9px ${pl}px`,fontSize:13,color:r.bold?'#374151':r.level===2?'#6B7280':'#1F2937',fontWeight:r.bold?600:r.level===0?500:400,whiteSpace:'pre-line' }}>{r.title}</td>
                      <td style={{ padding:'9px 16px',textAlign:'center',fontSize:13,color:r.mins?'#374151':'#D1D5DB',fontWeight:r.mins?600:400 }}>{r.mins??'—'}</td>
                      <td style={{ padding:'9px 16px',textAlign:'center',fontSize:13,color:r.time?'#374151':'#D1D5DB' }}>{r.time||'—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Sec>

        {/* ══ 3. СПИСОК ЗАНЯТИЙ ══ */}
        <Sec style={{ marginBottom:20 }}>
          <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',padding:'22px 24px' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                <span style={{ fontSize:18,fontWeight:700,color:'#111' }}>Список занятий по курсу</span>
                <span style={{ fontSize:12,color:'#9CA3AF',background:'#F4F6FA',padding:'3px 9px',borderRadius:20,border:'1px solid #E5E7EB' }}>{LESSONS.length} занятий</span>
              </div>
              <button className="lp-ghost" onClick={() => document.querySelector('.lp-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:'#374151',cursor:'pointer' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Фильтры
              </button>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18 }}>
              {LESSONS.map((l,i)=>(
                <div key={l.id} className={`lp-card${l.locked?' locked':''}`} onClick={()=>!l.locked?setModal(l):null}
                  style={{ borderRadius:18,overflow:'hidden',border:'1px solid #E5E7EB',animation:`fadeUp .4s ease ${i*55}ms both`,background:'#fff' }}>
                  <div style={{ height:200,background:'#F3F4F6',position:'relative',overflow:'hidden' }}>
                    <img src={l.img} alt={l.title} className="lp-img" style={{ width:'100%',height:'100%',objectFit:'cover',display:'block',filter:l.locked?'brightness(.5) saturate(.7)':'none' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/>
                    <div style={{ position:'absolute',inset:0,background:l.locked?'rgba(0,0,0,.15)':'linear-gradient(to top, rgba(0,0,0,.35) 0%, transparent 55%)',pointerEvents:'none' }}/>
                    <div style={{ position:'absolute',top:10,left:10,background:'rgba(0,0,0,.55)',backdropFilter:'blur(6px)',color:'#fff',fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:8,border:'1px solid rgba(255,255,255,.15)' }}>{l.num}</div>
                    {viewedLessons[String(l.id)]?.status === 'viewed'&&<div style={{ position:'absolute',top:10,right:10,display:'flex',alignItems:'center',gap:5,background:'rgba(16,185,129,.92)',backdropFilter:'blur(6px)',color:'#fff',fontSize:11,fontWeight:800,padding:'4px 9px',borderRadius:20,border:'1px solid rgba(255,255,255,.25)' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Просмотрено</div>}
                    {l.locked&&<div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}><IcLock/></div>}
                    {!l.locked&&viewedLessons[String(l.id)]?.status !== 'viewed'&&<div style={{ position:'absolute',bottom:10,right:10,width:30,height:30,borderRadius:'50%',background:'rgba(55,93,251,.85)',display:'flex',alignItems:'center',justifyContent:'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>}
                  </div>
                  <div style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'#9CA3AF',marginBottom:7 }}><span>{l.date}</span><span>{l.time}</span></div>
                    <div style={{ fontSize:14,fontWeight:700,color:l.locked?'#9CA3AF':'#111',lineHeight:1.4 }}>{l.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Sec>

        {/* ══ 4. РАСПИСАНИЕ ══ */}
        <Sec style={{ marginBottom:20 }}>
          <CalendarView onGo={lid=>navigate(`/lessons/${lid}`, { state: { courseTitle, courseSlug } })}/>
        </Sec>

        {/* ══ 5. ОДНОГРУППНИКИ + ОЦЕНКА ══ */}
        <Sec style={{ marginBottom:20 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1.55fr 1fr',gap:20,alignItems:'stretch' }}>
            {/* Одногруппники */}
            <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',overflow:'hidden' }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,padding:'18px 24px',borderBottom:'1px solid #F0F0F0' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span style={{ fontSize:18,fontWeight:700,color:'#111' }}>Одногруппники</span>
                <span style={{ fontSize:12,color:'#9CA3AF',background:'#F4F6FA',padding:'2px 9px',borderRadius:20,border:'1px solid #E5E7EB' }}>{MATES.length}</span>
              </div>
              <div style={{ maxHeight:440,overflowY:'auto' }}>
                {MATES.map((m,idx)=>(
                  <div key={m.id} className="lp-mate"
                    style={{ display:'flex',alignItems:'center',gap:12,padding:'13px 20px',borderBottom:idx<MATES.length-1?'1px solid #F5F5F7':'none',animation:`fadeUp .35s ease ${idx*45}ms both`,transition:'background .14s',borderRadius:8 }}>
                    <div style={{ width:46,height:46,borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'#F3F4F6',border:'2px solid #E5E7EB' }}>
                      <img src={m.img} alt={m.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14,fontWeight:700,color:'#111',marginBottom:3 }}>{m.name}</div>
                      <div style={{ fontSize:12,color:'#9CA3AF',marginBottom:5 }}>{m.rank} · {m.spec}</div>
                      <IVDisplay index={m.index} rating={m.rating}/>
                    </div>
                    <button className="lp-ghost" onClick={()=>navigate('/messages?chat=7')} style={{ padding:'7px 16px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:'#374151',cursor:'pointer',flexShrink:0 }}>Написать</button>
                  </div>
                ))}
              </div>
            </div>
            {/* Ваша оценка */}
            <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',padding:'22px 24px',display:'flex',flexDirection:'column' }}>
              <div style={{ fontSize:18,fontWeight:700,color:'#111',marginBottom:20,textAlign:'center' }}>Ваша оценка за урок</div>
              <div style={{ display:'flex',justifyContent:'center',gap:6,marginBottom:20 }}>
                {[1,2,3,4,5].map(i=>(
                  <button key={i} className="lp-star" onMouseEnter={()=>setHoverStar(i)} onMouseLeave={()=>setHoverStar(0)} onClick={()=>setStars(i)} style={{ background:'none',border:'none',cursor:'pointer',padding:2,transition:'transform .12s' }}>
                    <svg width="38" height="38" viewBox="0 0 24 24" fill={i<=(hoverStar||stars)?'#F59E0B':'#E5E7EB'} stroke="none" style={{ transition:'fill .12s' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
              </div>
              <div style={{ background:'#F9FAFB',borderRadius:14,padding:'14px 16px',marginBottom:16,border:'1px solid #E5E7EB',flex:1 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                  <div style={{ width:40,height:40,borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'#F3F4F6' }}><img src="/teacher2-main.jpg" alt="Бек" style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/></div>
                  <div><div style={{ fontSize:14,fontWeight:700,color:'#111' }}>Бек</div><div style={{ fontSize:12,color:'#9CA3AF' }}>Главный инструктор</div></div>
                </div>
                <div style={{ fontSize:13,color:'#374151',lineHeight:1.6 }}>Молодец, так держать! Жду на следующем занятии. Советую пройтись по материалам топографии.</div>
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button className="lp-ghost" onClick={()=>navigate('/messages?chat=1')} style={{ flex:1,padding:'10px 0',background:'#EBF1FF',border:'1px solid #C7D2FE',borderRadius:12,color:'#375DFB',fontSize:13,fontWeight:600,cursor:'pointer' }}>Задать вопрос</button>
                <button className="lp-prim" onClick={submitReview} style={{ flex:1,padding:'10px 0',background:reviewSaved?'#10B981':'#375DFB',border:'none',borderRadius:12,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',boxShadow:reviewSaved?'0 4px 14px rgba(16,185,129,.24)':'0 4px 14px rgba(55,93,251,.26)' }}>{reviewSaved ? 'Отзыв сохранён' : 'Оставить отзыв'}</button>
              </div>
              {reviewSaved && (
                <div style={{ marginTop:12,background:'#ECFDF5',border:'1px solid #A7F3D0',borderRadius:12,padding:'10px 12px',fontSize:12,color:'#047857',fontWeight:700,textAlign:'center',animation:'fadeUp .18s ease both' }}>
                  Спасибо. Оценка {stars}/5 добавлена к занятию и попадёт в статистику курса.
                </div>
              )}
            </div>
          </div>
        </Sec>

        {/* ══ 6. ДЗ / К ИЗУЧЕНИЮ ══ */}
        <Sec style={{ marginBottom:20 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 320px',gap:20,alignItems:'start' }}>
            <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',overflow:'hidden' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #F0F0F0',padding:'0 20px' }}>
                <div style={{ display:'flex' }}>
                  {[['hw','Домашние задания'],['study','К изучению']].map(([v,l])=>(
                    <button key={v} className="lp-tab" onClick={()=>setTab(v as 'hw'|'study')} style={{ padding:'14px 16px',background:'none',border:'none',borderBottom:tab===v?'2.5px solid #375DFB':'2.5px solid transparent',color:tab===v?'#375DFB':'#6B7280',fontWeight:tab===v?700:400,fontSize:14,cursor:'pointer',marginBottom:-1 }}>{l}</button>
                  ))}
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:5,background:'#EBF1FF',border:'1px solid #C7D2FE',borderRadius:8,padding:'4px 10px',fontSize:12,color:'#375DFB',fontWeight:600 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Сдать все до 9 марта
                </div>
              </div>
              {tab==='hw'&&(
                <div>
                  {HW.map((hw,i)=>(
                    <div key={hw.id} className="lp-hw" style={{ display:'flex',alignItems:'center',gap:14,padding:'15px 20px',borderBottom:i<HW.length-1?'1px solid #F5F5F7':'none',transition:'background .14s' }}>
                      <div style={{ width:34,height:34,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:hw.status==='done'?'#F0FDF4':hw.status==='locked'?'#F3F4F6':'#EBF1FF',border:`1px solid ${hw.status==='done'?'#BBF7D0':hw.status==='locked'?'#E5E7EB':'#C7D2FE'}`,fontSize:13,fontWeight:700,color:hw.status==='done'?'#10B981':hw.status==='locked'?'#D1D5DB':'#375DFB' }}>
                        {hw.status==='done'?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>:hw.status==='locked'?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>:hw.num}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14,fontWeight:600,color:hw.status==='locked'?'#9CA3AF':'#111',marginBottom:2 }}>{hw.title}</div>
                        <div style={{ fontSize:12,color:'#9CA3AF' }}>{hw.sub}</div>
                      </div>
                      {hw.status!=='done'&&hw.status!=='locked'&&hw.deadline&&<div style={{ background:hw.dc+'18',border:`1px solid ${hw.dc}30`,borderRadius:8,padding:'4px 10px',fontSize:12,color:hw.dc,fontWeight:600,flexShrink:0 }}>{hw.deadline}</div>}
                      {hw.status==='retry'&&<button className="lp-prim" onClick={()=>navigate(`/tests/${hw.id}`)} style={{ display:'flex',alignItems:'center',gap:4,padding:'7px 12px',background:'#FEF3C7',border:'1px solid #FDE68A',borderRadius:9,fontSize:13,color:'#D97706',cursor:'pointer',flexShrink:0 }}>Пройти снова<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>}
                      {hw.status==='test'&&<button className="lp-prim" onClick={()=>navigate(`/tests/${hw.id}`)} style={{ display:'flex',alignItems:'center',gap:4,padding:'7px 12px',background:'#EBF1FF',border:'1px solid #C7D2FE',borderRadius:9,fontSize:13,fontWeight:600,color:'#375DFB',cursor:'pointer',flexShrink:0 }}>Пройти тест<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>}
                      {hw.status==='done'&&<span style={{ fontSize:12,color:'#10B981',fontWeight:600,flexShrink:0 }}>Выполнено</span>}
                    </div>
                  ))}
                </div>
              )}
              {tab==='study'&&(
                <div style={{ padding:'22px 24px' }}>
                  {!studyDone?(
                    <>
                      {STUDY.map(s=>(
                        <div key={s.id} style={{ marginBottom:28 }}>
                          <div style={{ borderRadius:14,overflow:'hidden',height:240,background:'#F3F4F6',marginBottom:16 }}><img src={s.img} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/></div>
                          <h3 style={{ fontSize:17,fontWeight:700,color:'#111',margin:'0 0 10px' }}>{s.title}</h3>
                          {s.text.map((t,i)=><p key={i} style={{ fontSize:14,color:'#374151',lineHeight:1.75,margin:'0 0 10px' }}>{t}</p>)}
                          {s.note&&<div className="lp-note" style={{ margin:'12px 0' }}><span style={{ fontWeight:700,color:'#374151' }}>Заметка: </span><span style={{ fontSize:14,color:'#374151',lineHeight:1.65 }}>{s.note}</span></div>}
                          {s.video&&<div style={{ borderRadius:14,overflow:'hidden',height:220,background:'#1a1a2e',position:'relative',marginTop:12,cursor:'pointer' }}><img src={s.img} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',opacity:.7 }}/><div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}><div style={{ width:50,height:50,borderRadius:'50%',background:'rgba(255,255,255,.9)',display:'flex',alignItems:'center',justifyContent:'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="#374151" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div></div>}
                        </div>
                      ))}
                      <div style={{ background:'#F0FDF4',borderRadius:14,border:'1px solid #BBF7D0',padding:'14px 18px',display:'flex',alignItems:'flex-start',gap:10 }}>
                        <div style={{ width:22,height:22,borderRadius:'50%',background:'#10B981',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                        <div>
                          <div style={{ fontSize:14,fontWeight:700,color:'#065F46',marginBottom:3 }}>Вы изучили всю необходимую информацию по уроку!</div>
                          <div style={{ fontSize:13,color:'#047857',marginBottom:8 }}>Если что-то забыли, сможете вернуться и закрепить информацию.</div>
                          <button onClick={()=>{saveLessonViewed();setStudyDone(true);setTab('hw');}} style={{ background:'none',border:'none',fontSize:13,color:'#375DFB',cursor:'pointer',textDecoration:'underline',padding:0,fontWeight:600 }}>К домашнему заданию</button>
                        </div>
                      </div>
                    </>
                  ):(
                    <div style={{ textAlign:'center',padding:'40px 0' }}>
                      <div style={{ width:64,height:64,borderRadius:'50%',background:'#F0FDF4',border:'2px solid #10B981',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                      <div style={{ fontSize:17,fontWeight:700,color:'#111',marginBottom:6 }}>Материал изучен!</div>
                      <button onClick={()=>{saveLessonViewed();setStudyDone(false);setTab('hw');}} style={{ padding:'9px 22px',background:'#375DFB',border:'none',borderRadius:12,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer' }}>К домашним заданиям</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',overflow:'hidden',position:'sticky',top:16 }}>
              <div style={{ display:'flex',borderBottom:'1px solid #F0F0F0' }}>
                {[['mat','Материалы'],['comments','Комментарии']].map(([v,l])=>(
                  <button key={v} className="lp-tab" onClick={()=>setMatTab(v as 'mat'|'comments')} style={{ flex:1,padding:'13px 10px',background:'none',border:'none',borderBottom:matTab===v?'2.5px solid #375DFB':'2.5px solid transparent',color:matTab===v?'#375DFB':'#6B7280',fontWeight:matTab===v?700:400,fontSize:14,cursor:'pointer',marginBottom:-1 }}>{l}</button>
                ))}
              </div>
              {matTab==='mat'&&MATS.map((m,i)=>(
                <div key={m.name} className="lp-mat" onClick={() => downloadDemoFile(m.name, m.type)} style={{ display:'flex',alignItems:'center',gap:12,padding:'13px 16px',borderBottom:i<MATS.length-1?'1px solid #F5F5F7':'none',cursor:'pointer',transition:'background .14s' }}>
                  <div style={{ width:40,height:40,borderRadius:10,background:FC[m.type]+'18',border:`1px solid ${FC[m.type]}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><span style={{ fontSize:10,fontWeight:800,color:FC[m.type] }}>{m.type}</span></div>
                  <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:600,color:'#111' }}>{m.name}</div><div style={{ fontSize:11,color:'#9CA3AF' }}>{m.size}</div></div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </div>
              ))}
              {matTab==='comments'&&(
                <div style={{ padding:'16px' }}>
                  <textarea value={commentText} onChange={e => { setCommentText(e.target.value); setCommentSent(false); }} placeholder="Написать комментарий..." style={{ width:'100%',minHeight:88,border:'1px solid #E5E7EB',borderRadius:12,padding:'11px 13px',fontSize:13,color:'#374151',resize:'none',outline:'none',boxSizing:'border-box',fontFamily:'inherit' }}/>
                  <button className="lp-prim" onClick={submitComment} style={{ width:'100%',marginTop:8,padding:'9px 0',background:commentSent?'#10B981':'#375DFB',border:'none',borderRadius:12,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer' }}>{commentSent ? 'Комментарий отправлен' : 'Отправить'}</button>
                  {commentSent && <div style={{ marginTop:8,fontSize:12,color:'#047857',fontWeight:700,textAlign:'center',animation:'fadeUp .18s ease both' }}>Инструктор увидит комментарий в карточке занятия.</div>}
                </div>
              )}
            </div>
          </div>
        </Sec>

        {/* ══ COUNTDOWN ══ */}
        <Sec>
          <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16 }}>
            <div style={{ fontSize:15,fontWeight:600,color:'#111' }}>Ближайший старт группы — <span style={{ color:'#375DFB',fontWeight:800 }}>{targetLabel}</span></div>
            <Countdown target={target}/>
          </div>
        </Sec>
      </div>

      {/* MODAL */}
      {modal&&(
        <div onClick={()=>setModal(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:20,backdropFilter:'blur(6px)',animation:'fadeIn .2s ease' }}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:540,width:'100%',background:'#fff',borderRadius:22,overflow:'hidden',boxShadow:'0 28px 70px rgba(0,0,0,.22)',animation:'fadeUp .22s ease' }}>
            <div style={{ height:260,overflow:'hidden',position:'relative',background:'#1a1a2e' }}>
              <img src={modal.img} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/>
              <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top, rgba(0,0,0,.75), transparent)' }}/>
              <div style={{ position:'absolute',top:12,left:12,background:'rgba(0,0,0,.6)',backdropFilter:'blur(8px)',color:'#fff',fontSize:12,fontWeight:700,padding:'4px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,.2)' }}>{modal.num}</div>
              <button onClick={()=>setModal(null)} style={{ position:'absolute',top:10,right:10,background:'rgba(0,0,0,.4)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)',width:32,height:32,borderRadius:9,cursor:'pointer',color:'#fff',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
              <div style={{ position:'absolute',bottom:16,left:18,right:18 }}><div style={{ fontSize:19,fontWeight:800,color:'#fff',lineHeight:1.25 }}>{modal.title}</div></div>
            </div>
            <div style={{ padding:'20px 24px' }}>
              <div style={{ display:'flex',gap:16,fontSize:13,color:'#6B7280',marginBottom:20 }}>
                <span style={{ display:'flex',alignItems:'center',gap:5 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{modal.date}</span>
                <span style={{ display:'flex',alignItems:'center',gap:5 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{modal.time}</span>
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button className="lp-prim" onClick={()=>{navigate(`/lessons/${modal.id}`, { state: { courseTitle, courseSlug } });setModal(null);}} style={{ flex:1,padding:'12px 0',background:'linear-gradient(135deg,#2F52F0,#6B8FFF)',border:'none',borderRadius:14,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 5px 18px rgba(55,93,251,.32)' }}>Перейти к занятию</button>
                <button onClick={()=>setModal(null)} style={{ flex:1,padding:'12px 0',background:'#fff',border:'1px solid #E5E7EB',borderRadius:14,color:'#374151',fontSize:14,cursor:'pointer' }}>Закрыть</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
