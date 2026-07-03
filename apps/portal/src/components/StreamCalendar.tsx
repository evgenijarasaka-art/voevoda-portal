import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotifStore } from '../store/useNotifStore';
import { useAdminTraining, getCourseCalendar, type AdminStreamEvent } from '../data/adminSiteData';

type StreamType = 'аудитория' | 'полигон' | 'стрельбище';

type SEvent = {
  id: string;
  day: number;
  month: number;
  year: number;
  title: string;
  timeStart: string;
  timeEnd: string;
  type: StreamType;
  num: number;
  instructor: string;
  description: string;
  image: string;
  location: string;
  format: string;
  equipment: string[];
  goals: string[];
};

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DAYS = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];
const TYPES: Array<{ id: StreamType; label: string }> = [
  { id: 'аудитория', label: 'Аудитория' },
  { id: 'полигон', label: 'Полигон' },
  { id: 'стрельбище', label: 'Стрельбище' },
];

const COLORS: Record<StreamType, { bg: string; tx: string; border: string; dot: string; main: string }> = {
  аудитория: { bg:'#DBEAFE', tx:'#1E40AF', border:'#BFDBFE', dot:'#60A5FA', main:'#3B82F6' },
  полигон: { bg:'#D1FAE5', tx:'#065F46', border:'#A7F3D0', dot:'#34D399', main:'#10B981' },
  стрельбище: { bg:'#FED7AA', tx:'#C2410C', border:'#FDBA74', dot:'#FB923C', main:'#F97316' },
};

const CSS = `
@keyframes sc-fade{from{opacity:0}to{opacity:1}}
@keyframes sc-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes sc-grid{from{opacity:.35;transform:translateX(6px)}to{opacity:1;transform:translateX(0)}}
.sc-root{background:#fff;border-radius:18px;border:1px solid #E5E7EB;overflow:hidden}
.sc-nav,.sc-chip,.sc-event,.sc-detail-action,.sc-close{transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s ease,background .18s ease,border-color .18s ease,color .18s ease}
.sc-nav:hover,.sc-chip:hover{transform:translateY(-1px);background:#EBF1FF!important;border-color:#C7D2FE!important;color:#375DFB!important}
.sc-event:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.12)}
.sc-grid{animation:sc-grid .18s ease both}
.sc-detail{display:grid;grid-template-columns:minmax(320px,.9fr) minmax(420px,1.1fr);max-width:980px;width:100%;max-height:calc(100vh - 32px);background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 32px 100px rgba(7,14,32,.42);animation:sc-up .24s cubic-bezier(.2,.8,.2,1)}
.sc-detail-img{position:relative;min-height:100%;background:#dce7ff;overflow:hidden}
.sc-detail-img img{width:100%;height:100%;min-height:560px;object-fit:cover;display:block;transition:transform .7s cubic-bezier(.2,.8,.2,1)}
.sc-detail:hover .sc-detail-img img{transform:scale(1.035)}
.sc-close:hover{transform:rotate(8deg) scale(1.04);background:#fff!important;border-color:#8da8ff!important;color:#244ec5!important}
.sc-detail-action:hover{transform:translateY(-2px);box-shadow:0 13px 28px rgba(55,93,251,.24)!important}
@media(max-width:760px){.sc-detail{grid-template-columns:1fr;overflow:auto}.sc-detail-img,.sc-detail-img img{min-height:230px;height:230px}.sc-body{padding:22px!important}}
`;

function injectCss() {
  if (document.getElementById('stream-calendar-css')) return;
  const style = document.createElement('style');
  style.id = 'stream-calendar-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}

function defaultEvents(): SEvent[] {
  const now = new Date();
  return [
    {
      id:'s01', day:5, month:now.getMonth(), year:now.getFullYear(), title:'Вводное занятие',
      timeStart:'10:00', timeEnd:'15:00', type:'аудитория', num:1, instructor:'Бек',
      description:'Знакомство с программой курса, правилами безопасности и порядком работы группы.',
      image:'/military-course.jpg', location:'Учебный класс № 3', format:'Теория и разбор',
      equipment:['Блокнот','Удостоверение'], goals:['Понять структуру курса','Разобрать правила безопасности','Познакомиться с группой'],
    },
    {
      id:'s02', day:14, month:now.getMonth(), year:now.getFullYear(), title:'Полевая практика',
      timeStart:'10:00', timeEnd:'15:00', type:'полигон', num:2, instructor:'Торнадо',
      description:'Практика на местности: передвижение, укрытие и взаимодействие в группе.',
      image:'/фотоскурса.png', location:'Полигон «Калибр»', format:'Практика в группе',
      equipment:['Полевая форма','Перчатки','Защита глаз'], goals:['Сменить позицию','Работать в паре','Пройти контрольный маршрут'],
    },
    {
      id:'s03', day:23, month:now.getMonth(), year:now.getFullYear(), title:'Огневая подготовка',
      timeStart:'10:00', timeEnd:'15:00', type:'стрельбище', num:3, instructor:'Грек',
      description:'Безопасная работа с оружием, устойчивые положения и контроль серии упражнений.',
      image:'/оружие1.png', location:'Стрелковая галерея № 2', format:'Практическое занятие',
      equipment:['Наушники','Защитные очки','Перчатки'], goals:['Проверить вкладку','Собрать устойчивую группу','Отработать смену положения'],
    },
  ];
}

function normalizeType(value?: string): StreamType {
  const text = String(value || '').toLocaleLowerCase('ru-RU');
  if (text.includes('стрел') || text.includes('огнев')) return 'стрельбище';
  if (text.includes('полиг') || text.includes('поле')) return 'полигон';
  return 'аудитория';
}

function normalizeAsset(src?: string) {
  return (src || '/military-course.jpg').replace('../portal/public/', '/').replace(/^apps\/portal\/public\//, '/');
}

function normalizeEvents(events?: AdminStreamEvent[]) {
  if (!Array.isArray(events)) return [];
  const now = new Date();
  return events
    .filter(event => event.status !== 'archived' && event.status !== 'hidden')
    .map((event, index): SEvent => ({
      id: String(event.id ?? `admin-${index}`),
      day: Math.min(31, Math.max(1, Number(event.day) || index + 1)),
      month: Number.isFinite(Number(event.month)) ? Number(event.month) : now.getMonth(),
      year: Number(event.year) || now.getFullYear(),
      title: event.title || 'Занятие',
      timeStart: event.timeStart || '10:00',
      timeEnd: event.timeEnd || '15:00',
      type: normalizeType(event.type),
      num: Number(event.num) || index + 1,
      instructor: event.instructor || 'Бек',
      description: event.description || 'Описание занятия можно изменить в админке.',
      image: normalizeAsset(event.image),
      location: event.location || event.city || 'Учебная площадка',
      format: event.format || 'Практическое занятие',
      equipment: Array.isArray(event.equipment) ? event.equipment : [],
      goals: Array.isArray(event.goals) ? event.goals : [],
    }));
}

function EventDetail({ event, onClose }: { event: SEvent; onClose: () => void }) {
  const colors = COLORS[event.type];
  const reminderKey = `voevoda_schedule_reminder_${event.id}`;
  const [saved, setSaved] = useState(() => Boolean(localStorage.getItem(reminderKey)));
  const [imgErr, setImgErr] = useState(false);
  const addNotification = useNotifStore(s => s.add);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const toggleReminder = () => {
    const next = !saved;
    setSaved(next);
    if (next) localStorage.setItem(reminderKey, JSON.stringify({ eventId: event.id, createdAt: new Date().toISOString() }));
    else localStorage.removeItem(reminderKey);
    if (next) {
      addNotification({
        kind: 'course_started',
        title: 'Напоминание о занятии включено',
        body: `${event.title} — ${event.day} ${MONTHS[event.month].toLowerCase()} в ${event.timeStart}`,
        link: '/courses/%D0%A0%D0%B0%D0%B7%D0%B2%D0%B5%D0%B4%D1%8B%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE-%D1%88%D1%82%D1%83%D1%80%D0%BC%D0%BE%D0%B2%D0%B0%D1%8F%20%D0%BF%D0%BE%D0%B4%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D0%BA%D0%B0',
      });
    }
  };

  return createPortal(
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:99999,padding:16,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(10,14,24,.62)',backdropFilter:'blur(9px)',animation:'sc-fade .18s ease'}}>
      <div className="sc-detail" onClick={e => e.stopPropagation()}>
        <div className="sc-detail-img">
          {!imgErr
            ? <img src={event.image} alt={event.title} onError={() => setImgErr(true)} />
            : <div style={{height:'100%',minHeight:560,display:'grid',placeItems:'center',background:`linear-gradient(150deg,${colors.main},#15326B)`,color:'#fff',fontWeight:900}}>Фото занятия</div>}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(8,13,24,.04),rgba(8,13,24,.72))'}} />
          <div style={{position:'absolute',left:18,top:18,padding:'7px 12px',borderRadius:12,background:'rgba(13,30,70,.42)',border:'1px solid rgba(255,255,255,.3)',backdropFilter:'blur(10px)',color:'#fff',fontSize:12,fontWeight:850}}>
            {event.day} {MONTHS[event.month].toLowerCase()}
          </div>
          <div style={{position:'absolute',left:22,right:22,bottom:22,color:'#fff'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'6px 11px',borderRadius:999,background:'rgba(255,255,255,.18)',border:'1px solid rgba(255,255,255,.35)',fontSize:11,fontWeight:900,marginBottom:13}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:colors.dot}} />{TYPES.find(t => t.id === event.type)?.label}
            </div>
            <h3 style={{margin:0,fontSize:27,lineHeight:1.15,fontWeight:950}}>{event.title}</h3>
          </div>
        </div>
        <div className="sc-body" style={{padding:28,display:'flex',flexDirection:'column',minHeight:0,overflow:'auto'}}>
          <div style={{display:'flex',alignItems:'start',justifyContent:'space-between',gap:14,marginBottom:18}}>
            <div>
              <div style={{fontSize:12,color:'#8496BA',fontWeight:900,textTransform:'uppercase',letterSpacing:'.06em'}}>{event.format}</div>
              <h2 style={{margin:'6px 0 0',fontSize:25,lineHeight:1.2,color:'#17213A'}}>{event.instructor}</h2>
            </div>
            <button className="sc-close" onClick={onClose} style={{width:38,height:38,borderRadius:'50%',border:'1px solid #D5DCEB',background:'#F8FAFF',cursor:'pointer',fontSize:22,lineHeight:1}}>×</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,marginBottom:16}}>
            {[
              ['Время', `${event.timeStart}–${event.timeEnd}`],
              ['Дата', `${event.day} ${MONTHS[event.month].toLowerCase()} ${event.year}`],
              ['Место', event.location],
              ['Занятие', `№${event.num}`],
            ].map(([label, value]) => (
              <div key={label} style={{padding:'12px 13px',border:'1px solid #E3E8F2',borderRadius:14,background:'#FBFCFE'}}>
                <div style={{fontSize:10,color:'#8496BA',fontWeight:900,textTransform:'uppercase',letterSpacing:'.06em'}}>{label}</div>
                <div style={{fontSize:13,color:'#294C96',fontWeight:800,marginTop:3}}>{value}</div>
              </div>
            ))}
          </div>
          <p style={{fontSize:14,color:'#53617E',lineHeight:1.65,margin:'0 0 16px'}}>{event.description}</p>
          <ListBlock title="Что отработаем" items={event.goals} color={colors.main} />
          <ListBlock title="Что подготовить" items={event.equipment} color={colors.main} />
          <div style={{display:'flex',gap:9,marginTop:'auto'}}>
            <button className="sc-detail-action" onClick={toggleReminder} style={{flex:1,padding:'14px 18px',borderRadius:14,border:`1px solid ${saved ? '#A7DDBB' : '#375DFB'}`,background:saved ? '#EAF7EF' : '#375DFB',color:saved ? '#187446' : '#fff',fontSize:13,fontWeight:900,cursor:'pointer'}}>
              {saved ? 'Напоминание сохранено' : 'Сохранить напоминание'}
            </button>
            <button className="sc-detail-action" onClick={onClose} style={{padding:'14px 22px',borderRadius:14,border:'1px solid #D5DCEB',background:'#fff',color:'#44516D',fontSize:13,fontWeight:850,cursor:'pointer'}}>Закрыть</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ListBlock({ title, items, color }: { title: string; items: string[]; color: string }) {
  const list = items.length ? items : ['Детали можно изменить в админке'];
  return (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:900,color:'#294C96',marginBottom:8}}>{title}</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
        {list.map(item => (
          <span key={item} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 12px',border:'1px solid #D6E0FA',borderRadius:999,background:'#F1F5FF',fontSize:12,fontWeight:750,color:'#3A5694'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:color}} />{item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StreamCalendar({ courseName }: { courseName?: string } = {}) {
  useEffect(() => injectCss(), []);
  const adminTraining = useAdminTraining();
  const courseEvents = getCourseCalendar(adminTraining, courseName);
  const events = useMemo(() => {
    const adminEvents = normalizeEvents(courseEvents ?? adminTraining?.calendarEvents);
    return adminEvents.length ? adminEvents : defaultEvents();
  }, [courseEvents, adminTraining?.calendarEvents]);
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [detail, setDetail] = useState<SEvent | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<StreamType>>(new Set(['аудитория','полигон','стрельбище']));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ day: number; current: boolean; today: boolean }> = [];
  const prevLast = new Date(year, month, 0).getDate();
  for (let i = firstOffset - 1; i >= 0; i--) cells.push({ day: prevLast - i, current: false, today: false });
  for (let day = 1; day <= daysInMonth; day++) cells.push({ day, current: true, today: day === today.getDate() && isCurrentMonth });
  const rest = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= rest; day++) cells.push({ day, current: false, today: false });
  const weeks = Math.ceil(cells.length / 7);
  const monthEvents = events.filter(event => event.month === month && event.year === year);
  const getDayEvents = (day: number) => monthEvents
    .filter(event => event.day === day && activeTypes.has(event.type))
    .sort((a, b) => a.timeStart.localeCompare(b.timeStart));

  const changeMonth = (delta: number) => setViewDate(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  const toggleType = (type: StreamType) => setActiveTypes(previous => {
    const next = new Set(previous);
    if (next.has(type)) {
      if (next.size > 1) next.delete(type);
    } else {
      next.add(type);
    }
    return next;
  });

  return (
    <div className="sc-root">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 22px',borderBottom:'1px solid #F0F0F0',flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:18,flexWrap:'wrap'}}>
          <div>
            <span style={{fontSize:13,color:'#6B7280',fontWeight:700,marginRight:8}}>Расписание на</span>
            <strong style={{fontSize:18,color:'#111'}}>{MONTHS[month]} {year}</strong>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {TYPES.map(type => {
              const active = activeTypes.has(type.id);
              const colors = COLORS[type.id];
              return (
                <button key={type.id} className="sc-chip" onClick={() => toggleType(type.id)} style={{display:'inline-flex',alignItems:'center',gap:6,border:'none',background:'transparent',cursor:'pointer',padding:'4px 0',fontSize:12,color:active ? '#374151' : '#B9C0CE',fontWeight:active ? 750 : 500}}>
                  <span style={{width:9,height:9,borderRadius:'50%',background:active ? colors.dot : '#D1D5DB'}} />{type.label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="sc-nav" onClick={() => changeMonth(-1)} style={{width:34,height:34,borderRadius:10,border:'1px solid #E5E7EB',background:'#F4F6FA',cursor:'pointer'}}>‹</button>
          <button className="sc-nav" onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))} style={{padding:'7px 14px',borderRadius:10,border:`1px solid ${isCurrentMonth ? '#C7D2FE' : '#E5E7EB'}`,background:isCurrentMonth ? '#EBF1FF' : '#fff',color:isCurrentMonth ? '#375DFB' : '#374151',fontSize:13,fontWeight:800,cursor:'pointer'}}>Сегодня</button>
          <button className="sc-nav" onClick={() => changeMonth(1)} style={{width:34,height:34,borderRadius:10,border:'1px solid #E5E7EB',background:'#F4F6FA',cursor:'pointer'}}>›</button>
        </div>
      </div>
      <div style={{overflowX:'auto'}}>
        <div key={`${year}-${month}`} className="sc-grid" style={{minWidth:700}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid #F0F0F0'}}>
            {DAYS.map(day => <div key={day} style={{padding:'10px 0',textAlign:'center',fontSize:12,fontWeight:750,color:'#9CA3AF'}}>{day}</div>)}
          </div>
          {Array.from({ length: weeks }).map((_, weekIndex) => (
            <div key={weekIndex} style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:weekIndex < weeks - 1 ? '1px solid #F5F5F7' : 'none'}}>
              {cells.slice(weekIndex * 7, weekIndex * 7 + 7).map((cell, dayIndex) => {
                const dayEvents = cell.current ? getDayEvents(cell.day) : [];
                return (
                  <div key={`${weekIndex}-${dayIndex}`} style={{minHeight:104,padding:'6px 6px 8px',borderRight:dayIndex < 6 ? '1px solid #F5F5F7' : 'none',background:cell.current ? '#fff' : '#FAFAFA'}}>
                    <div style={{marginBottom:4}}>
                      <span style={{width:26,height:26,borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:cell.today ? 800 : 500,color:cell.today ? '#fff' : cell.current ? '#374151' : '#D1D5DB',background:cell.today ? '#EF4444' : 'transparent'}}>{cell.day}</span>
                    </div>
                    {dayEvents.map(event => {
                      const colors = COLORS[event.type];
                      return (
                        <div key={event.id} className="sc-event" onClick={() => setDetail(event)} style={{background:colors.bg,border:`1px solid ${colors.border}`,borderLeft:`3px solid ${colors.main}`,borderRadius:9,padding:'5px 7px',marginBottom:4,cursor:'pointer'}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:6,marginBottom:2}}>
                            <span style={{fontSize:10,fontWeight:800,color:colors.tx,opacity:.82}}>{event.timeStart}–{event.timeEnd}</span>
                            <span style={{fontSize:9,fontWeight:900,color:'#fff',background:colors.main,borderRadius:5,padding:'1px 5px'}}>№{event.num}</span>
                          </div>
                          <div style={{fontSize:11,fontWeight:850,color:colors.tx,lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{event.title}</div>
                          <div style={{fontSize:10,color:colors.tx,opacity:.72,fontWeight:650,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{event.instructor}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {detail && <EventDetail event={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
