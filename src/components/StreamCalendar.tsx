import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNotifStore } from '../store/useNotifStore';

/* ─── CSS ─── */
const SC_CSS = `
@keyframes sc-fadeIn{from{opacity:0}to{opacity:1}}
@keyframes sc-fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes sc-dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
@keyframes sc-gridSwap{from{opacity:.35;transform:translateX(5px)}to{opacity:1;transform:translateX(0)}}
.sc-ev{transition:box-shadow .15s,transform .12s;cursor:pointer}
.sc-ev:hover{box-shadow:0 6px 18px rgba(0,0,0,.12);transform:translateY(-2px)}
.sc-nav{transition:background .12s,border-color .12s,color .12s}
.sc-nav:hover{background:#EBF1FF!important;border-color:#C7D2FE!important;color:#375DFB!important}
.sc-day{transition:background .1s}
.sc-day.cur:hover{background:#FAFBFF!important}
.sc-mo-item:hover{background:#F9FAFB!important}
.sc-mo-item.active{background:#EBF1FF!important;color:#375DFB!important;font-weight:600!important}
.sc-grid-swap{animation:sc-gridSwap .18s ease both}
.sc-detail{display:grid;grid-template-columns:minmax(330px,.95fr) minmax(430px,1.05fr)}
.sc-detail-image{min-height:100%;overflow:hidden;position:relative;background:#dce7ff}
.sc-detail-image img{width:100%;height:100%;min-height:600px;object-fit:cover;display:block;transition:transform .7s cubic-bezier(.2,.8,.2,1)}
.sc-detail:hover .sc-detail-image img{transform:scale(1.035)}
.sc-detail-close{transition:transform .25s ease,background .25s ease,border-color .25s ease}
.sc-detail-close:hover{transform:rotate(8deg) scale(1.06);background:#fff!important;border-color:#8da8ff!important;color:#244ec5!important}
.sc-detail-action{transition:transform .25s ease,box-shadow .25s ease,background .25s ease}
.sc-detail-action:hover{transform:translateY(-2px);box-shadow:0 13px 28px rgba(55,93,251,.28)!important}
.sc-meta{transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}
.sc-meta:hover{border-color:#B9CBFB!important;box-shadow:0 6px 16px rgba(40,76,150,.1);transform:translateY(-1px)}
.sc-chip{transition:background .18s ease,border-color .18s ease,transform .18s ease}
.sc-chip:hover{background:#fff!important;border-color:#B9CBFB!important;transform:translateY(-1px)}
.sc-body-scroll{overflow-y:auto}
.sc-body-scroll::-webkit-scrollbar{width:7px}
.sc-body-scroll::-webkit-scrollbar-thumb{background:#CBD8F6;border-radius:99px}
@media(max-width:720px){.sc-detail{grid-template-columns:1fr;max-height:90vh;overflow-y:auto}.sc-detail-image{min-height:210px}.sc-detail-image img{min-height:210px;height:230px}.sc-detail-body{padding:22px!important}}
`;
function injectScCss() {
  if (document.getElementById('sc-css')) return;
  const s = document.createElement('style'); s.id = 'sc-css'; s.textContent = SC_CSS;
  document.head.appendChild(s);
}

/* ─── Types ─── */
type SEvType = 'аудитория' | 'полигон' | 'стрельбище';
interface SEvent {
  id: string;
  day: number;
  month: number; // 0-indexed
  year: number;
  title: string;
  timeStart: string;
  timeEnd: string;
  type: SEvType;
  num: number;
  instructor: string;
  description: string;
  image?: string;
  location?: string;
  format?: string;
  equipment?: string[];
  goals?: string[];
}

/* ─── Constants ─── */
const SC_MN = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const SC_DN = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];

const SC_TYPES: {id:SEvType;label:string}[] = [
  {id:'аудитория', label:'Аудитория'},
  {id:'полигон',   label:'Полигон'},
  {id:'стрельбище',label:'Стрельбище'},
];

const STC: Record<SEvType,{bg:string;tx:string;border:string;dot:string;av:string}> = {
  аудитория:  {bg:'#DBEAFE',tx:'#1E40AF',border:'#BFDBFE',dot:'#60A5FA',av:'#3B82F6'},
  полигон:    {bg:'#D1FAE5',tx:'#065F46',border:'#A7F3D0',dot:'#34D399',av:'#10B981'},
  стрельбище: {bg:'#FED7AA',tx:'#C2410C',border:'#FDBA74',dot:'#FB923C',av:'#F97316'},
};

/* ─── Seed (расписание — только просмотр) ─── */
const SC_NOW = new Date();
const SC_SEED = ([
  {id:'s01',day:1, month:2,year:2024,title:'Вводное занятие',timeStart:'10:00',timeEnd:'15:00',type:'аудитория',num:1,instructor:'Бек',description:'Знакомство с программой курса, инструктаж по безопасности.',image:'/military-course.jpg',location:'Учебный класс № 3',format:'Теория + разбор',equipment:['Блокнот','Удостоверение'],goals:['Понять структуру курса','Разобрать требования безопасности','Познакомиться с группой']},
  {id:'s02',day:5, month:2,year:2024,title:'Личная тактическая подготовка снайпера',timeStart:'10:00',timeEnd:'15:00',type:'аудитория',num:2,instructor:'Бек',description:'Основы маскировки и позиционирования на местности.',image:'/минифотоскурса.png',location:'Тактический класс',format:'Теория + тренажёр',equipment:['Камуфляж','Макет оружия'],goals:['Выбрать позицию','Подготовить маскировку','Оценить сектор наблюдения']},
  {id:'s03',day:14,month:2,year:2024,title:'Личная тактическая подготовка снайпера',timeStart:'10:00',timeEnd:'15:00',type:'полигон',num:3,instructor:'Торнадо',description:'Практика в полевых условиях: передвижение, укрытие.',image:'/фотоскурса.png',location:'Полигон «Калибр»',format:'Практика в группе',equipment:['Полевая форма','Перчатки','Защита глаз'],goals:['Скрытно сменить позицию','Работать в паре','Пройти контрольный маршрут']},
  {id:'s04',day:17,month:2,year:2024,title:'Летучка',timeStart:'10:00',timeEnd:'15:00',type:'полигон',num:4,instructor:'Торнадо',description:'Проверка усвоенного материала, командные задания.',image:'/записьсолдат.png',location:'Полигон, сектор Б',format:'Командная аттестация',equipment:['Полный комплект формы'],goals:['Сдать контрольные нормативы','Отработать связь внутри группы','Получить разбор инструктора']},
  {id:'s05',day:20,month:2,year:2024,title:'Огневая подготовка',timeStart:'10:00',timeEnd:'15:00',type:'стрельбище',num:5,instructor:'Grek',description:'Стрельба из штатного оружия, упражнения по точности.',image:'/оружие1.png',location:'Стрелковая галерея № 2',format:'Практика',equipment:['Наушники','Защитные очки','Перчатки'],goals:['Проверить вкладку','Собрать стабильную группу','Отработать смену положения']},
  {id:'s06',day:26,month:2,year:2024,title:'Азы военной топографии',timeStart:'10:00',timeEnd:'15:00',type:'аудитория',num:6,instructor:'Бек',description:'Работа с картой и компасом, азимутальные задачи.',image:'/карта.png',location:'Учебный класс № 1',format:'Практикум',equipment:['Компас','Карандаш','Линейка'],goals:['Читать условные знаки','Определять азимут','Построить маршрут']},
  {id:'s07',day:28,month:2,year:2024,title:'Технические средства разведки',timeStart:'10:00',timeEnd:'15:00',type:'аудитория',num:7,instructor:'Бек',description:'Знакомство с оптикой, наблюдением и передачей данных.',image:'/voendelo4.png',location:'Лаборатория разведки',format:'Демонстрация + практика',equipment:['Блокнот','Личная оптика при наличии'],goals:['Разобрать типы средств','Настроить наблюдение','Передать краткий доклад']},
  {id:'s08',day:30,month:2,year:2024,title:'Огневая подготовка',timeStart:'10:00',timeEnd:'15:00',type:'стрельбище',num:8,instructor:'Grek',description:'Контрольное занятие с серией упражнений.',image:'/оружие2.png',location:'Стрелковая галерея № 2',format:'Контрольная практика',equipment:['Наушники','Защитные очки','Перчатки'],goals:['Закрепить безопасное обращение','Выполнить серию упражнений','Получить персональный разбор']},
] as SEvent[]).map(event => ({
  ...event,
  month: SC_NOW.getMonth(),
  year: SC_NOW.getFullYear(),
}));

/* ─── Avatar ─── */
function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div style={{width:18,height:18,borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:'#fff',flexShrink:0,letterSpacing:0}}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── EventDetail (только просмотр, затемнение на весь экран через портал) ─── */
function SEventDetail({ event, onClose }: { event: SEvent; onClose:()=>void; }) {
  const c = STC[event.type];
  const typeLabel = SC_TYPES.find(t=>t.id===event.type)?.label ?? event.type;
  const reminderKey = `voevoda_schedule_reminder_${event.id}`;
  const [saved, setSaved] = useState(() => Boolean(localStorage.getItem(reminderKey)));
  const [imgErr, setImgErr] = useState(false);
  const addNotification = useNotifStore(s => s.add);
  const instructorAvatar = event.instructor === 'Бек' ? '/teacher1-main.jpg' : event.instructor === 'Торнадо' ? '/teacher2-main.jpg' : '/teacher3-main.jpg';
  const seats = 24;
  const taken = Math.min(seats - 1, 13 + (event.num % 9));
  const durationH = (() => {
    const [sh, sm] = event.timeStart.split(':').map(Number);
    const [eh, em] = event.timeEnd.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    return mins > 0 ? `${Math.floor(mins / 60)} ч${mins % 60 ? ` ${mins % 60} мин` : ''}` : '—';
  })();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, [onClose]);
  const toggleReminder = () => {
    const next = !saved;
    setSaved(next);
    try {
      if (next) localStorage.setItem(reminderKey, JSON.stringify({ eventId:event.id, createdAt:new Date().toISOString() }));
      else localStorage.removeItem(reminderKey);
    } catch { /* storage can be unavailable */ }
    if (next) {
      addNotification({
        kind:'course_started',
        title:'Напоминание о занятии включено',
        body:`${event.title} — ${event.day} ${SC_MN[event.month].toLowerCase()} в ${event.timeStart}`,
        link:'/courses/%D0%9E%D0%B1%D1%89%D0%B5%D0%B2%D0%BE%D0%B9%D1%81%D0%BA%D0%BE%D0%B2%D0%BE%D0%B9%20%D0%A1%D0%BD%D0%B0%D0%B9%D0%BF%D0%B5%D1%80',
      });
      if ('Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification('Воевода: напоминание сохранено', { body:event.title, icon:'/logo.png' });
      }
    }
  };
  return createPortal(
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(10,14,24,.62)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:99999,padding:16,backdropFilter:'blur(9px)',animation:'sc-fadeIn .18s ease'}}>
      <div className="sc-detail" onClick={e=>e.stopPropagation()} style={{maxWidth:980,width:'100%',maxHeight:'calc(100vh - 32px)',background:'#fff',border:'1px solid rgba(255,255,255,.7)',borderRadius:8,boxShadow:'0 32px 100px rgba(7,14,32,.42)',animation:'sc-fadeUp .28s cubic-bezier(.2,.8,.2,1)',overflow:'hidden'}}>
        <div className="sc-detail-image">
          {!imgErr
            ? <img src={event.image || '/military-course.jpg'} alt={event.title} onError={() => setImgErr(true)} />
            : <div style={{width:'100%',height:'100%',minHeight:520,background:`linear-gradient(150deg, ${c.av}, #15326B)`,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(8,13,24,.03),rgba(8,13,24,.72))'}} />
          <div style={{position:'absolute',left:18,top:18,display:'inline-flex',alignItems:'center',gap:7,padding:'7px 12px',borderRadius:8,background:'rgba(13,30,70,.42)',border:'1px solid rgba(255,255,255,.3)',backdropFilter:'blur(10px)',color:'#fff',fontSize:12,fontWeight:800}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {event.day} {SC_MN[event.month].toLowerCase()}
          </div>
          <div style={{position:'absolute',left:22,right:22,bottom:22,color:'#fff'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'6px 11px',borderRadius:8,background:'rgba(255,255,255,.18)',border:'1px solid rgba(255,255,255,.35)',fontSize:10,fontWeight:850,letterSpacing:'.08em',textTransform:'uppercase',backdropFilter:'blur(10px)',marginBottom:13}}><span style={{width:7,height:7,borderRadius:'50%',background:c.dot}} />{typeLabel}</div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:48,height:48,borderRadius:'50%',overflow:'hidden',background:c.av,border:'3px solid rgba(255,255,255,.88)',flexShrink:0,boxShadow:'0 6px 18px rgba(0,0,0,.28)'}}><img src={instructorAvatar} alt={event.instructor} style={{width:'100%',height:'100%',minHeight:0,objectFit:'cover'}} /></div>
              <div>
                <div style={{fontSize:14,fontWeight:800,lineHeight:1.2}}>{event.instructor}</div>
                <div style={{fontSize:11,opacity:.82}}>Инструктор занятия</div>
              </div>
            </div>
          </div>
        </div>
        <div className="sc-detail-body sc-body-scroll" style={{padding:'30px 32px 28px',position:'relative',display:'flex',flexDirection:'column'}}>
          <button className="sc-detail-close" onClick={onClose} aria-label="Закрыть" style={{position:'absolute',right:18,top:18,width:34,height:34,borderRadius:8,border:'1px solid #D4DEFA',background:'#F6F8FF',cursor:'pointer',fontSize:19,color:'#6B7FA9',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}>×</button>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:9,paddingRight:42}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:10,fontWeight:900,color:c.av,textTransform:'uppercase',letterSpacing:'.1em'}}><span style={{width:7,height:7,borderRadius:'50%',background:c.av}}/>{typeLabel}</span>
            <span style={{width:3,height:3,borderRadius:'50%',background:'#C2CFE8'}}/>
            <span style={{fontSize:10,fontWeight:900,color:'#8094BC',textTransform:'uppercase',letterSpacing:'.1em'}}>Занятие №{event.num}</span>
          </div>
          <h3 style={{margin:'0 0 9px',fontSize:26,lineHeight:1.16,color:'#17213A',letterSpacing:'-.03em'}}>{event.title}</h3>
          <p style={{margin:'0 0 16px',fontSize:13,color:'#5E729B',lineHeight:1.65}}>{event.description || 'Подробности занятия и задачи группы будут уточнены инструктором перед началом.'}</p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:11}}>
            {([
              { ic:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.av} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>, label:'Время', value:`${event.timeStart} — ${event.timeEnd}` },
              { ic:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.av} strokeWidth="1.8" strokeLinecap="round"><path d="M9 2h6"/><path d="M12 9v4l3 2"/><circle cx="12" cy="14" r="8"/></svg>, label:'Длительность', value:durationH },
              { ic:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.av} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>, label:'Формат', value:event.format || 'Практическое занятие' },
              { ic:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.av} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label:'Дата', value:`${event.day} ${SC_MN[event.month].toLowerCase()} ${event.year}` },
            ]).map(m=>(
              <div key={m.label} className="sc-meta" style={{display:'flex',alignItems:'center',gap:10,padding:'11px 12px',border:'1px solid #E3E8F2',borderRadius:8,background:'#FBFCFE'}}>
                <span style={{display:'grid',placeItems:'center',width:32,height:32,flex:'0 0 32px',borderRadius:8,background:`${c.av}14`}}>{m.ic}</span>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:9,color:'#8496BA',fontWeight:850,textTransform:'uppercase',letterSpacing:'.08em'}}>{m.label}</div>
                  <div style={{fontSize:12.5,color:'#294C96',fontWeight:750,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="sc-meta" style={{display:'flex',alignItems:'center',gap:11,padding:'12px 13px',border:'1px solid #E3E8F2',borderRadius:8,background:'#FBFCFE',marginBottom:11}}>
            <span style={{display:'grid',placeItems:'center',width:34,height:34,flex:'0 0 34px',borderRadius:8,background:`${c.av}14`}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.av} strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:9,color:'#8496BA',fontWeight:850,textTransform:'uppercase',letterSpacing:'.08em'}}>Место проведения</div>
              <div style={{fontSize:13,color:'#294C96',fontWeight:750,marginTop:2}}>{event.location || 'УТЦ «Воевода»'}</div>
            </div>
            <a href="https://yandex.ru/maps" target="_blank" rel="noopener noreferrer" className="sc-chip" style={{display:'inline-flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:8,background:'#fff',border:'1px solid #D6E0FA',color:'#375DFB',fontSize:11.5,fontWeight:800,textDecoration:'none',flexShrink:0}}>Маршрут<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg></a>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:12,padding:'13px 14px',border:'1px solid #E3E8F2',borderRadius:8,background:'#FBFCFE',marginBottom:16}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7}}>
                <span style={{fontSize:9,color:'#8496BA',fontWeight:850,textTransform:'uppercase',letterSpacing:'.08em'}}>Запись в группу</span>
                <span style={{fontSize:12,fontWeight:850,color:taken>=seats-2?'#C2410C':'#294C96',whiteSpace:'nowrap'}}>{taken} / {seats} мест</span>
              </div>
              <div style={{height:8,borderRadius:99,background:'#E3EAFB',overflow:'hidden'}}><div style={{height:'100%',width:`${Math.round(taken/seats*100)}%`,background:`linear-gradient(90deg, ${c.av}, ${c.dot})`,borderRadius:99,transition:'width .6s cubic-bezier(.2,.8,.2,1)'}}/></div>
              <div style={{fontSize:10.5,color:'#8496BA',fontWeight:600,marginTop:6}}>Осталось {Math.max(0,seats-taken)} {Math.max(0,seats-taken)===1?'место':'мест'} — успей записаться</div>
            </div>
          </div>

          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:850,color:'#294C96',marginBottom:9,display:'flex',alignItems:'center',gap:7}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.av} strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>Что отработаем</div>
            <div style={{display:'grid',gap:7}}>{(event.goals || ['Разобрать тему','Выполнить практическую часть','Получить обратную связь']).map(goal=><div key={goal} style={{display:'flex',gap:9,alignItems:'flex-start',fontSize:12.5,color:'#4B6090',lineHeight:1.45}}><span style={{display:'grid',placeItems:'center',width:19,height:19,flex:'0 0 19px',borderRadius:'50%',background:`${c.av}1A`,color:c.av,marginTop:1}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>{goal}</div>)}</div>
          </div>

          <div style={{marginBottom:18}}>
            <div style={{fontSize:11,fontWeight:850,color:'#294C96',marginBottom:9,display:'flex',alignItems:'center',gap:7}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.av} strokeWidth="2" strokeLinecap="round"><path d="M20 6H4l1 14h14z"/><path d="M9 6V4a3 3 0 0 1 6 0v2"/></svg>Подготовить</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:7}}>{(event.equipment || ['удобную форму','блокнот']).map(eq=><span key={eq} className="sc-chip" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 12px',background:'#F1F5FF',border:'1px solid #D6E0FA',borderRadius:8,fontSize:12,fontWeight:650,color:'#3A5694'}}><span style={{width:5,height:5,borderRadius:'50%',background:c.av,flexShrink:0}}/>{eq}</span>)}</div>
          </div>

          <div style={{display:'flex',gap:9,marginTop:'auto'}}>
            <button className="sc-detail-action" onClick={toggleReminder} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'15px 18px',background:saved?'#EAF7EF':'#375DFB',border:`1px solid ${saved?'#A7DDBB':'#375DFB'}`,borderRadius:8,color:saved?'#187446':'#fff',fontSize:13.5,fontWeight:850,cursor:'pointer',boxShadow:saved?'none':'0 9px 24px rgba(55,93,251,.26)'}}>
              {saved
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Напоминание сохранено</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Сохранить напоминание</>}
            </button>
            <button className="sc-detail-action" onClick={onClose} style={{padding:'15px 24px',background:'#fff',border:'1px solid #D5DCEB',borderRadius:8,color:'#44516D',fontSize:13.5,fontWeight:800,cursor:'pointer'}}>Закрыть</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── StreamCalendar (только просмотр) ─── */
export function StreamCalendar() {
  useEffect(()=>injectScCss(),[]);
  const today = SC_NOW;
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [drop, setDrop] = useState(false);
  const [detail, setDetail] = useState<SEvent|null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<SEvType>>(new Set(['аудитория','полигон','стрельбище']));
  const yr = viewDate.getFullYear();
  const mo = viewDate.getMonth();
  const isCurrentMonth = yr === today.getFullYear() && mo === today.getMonth();
  useEffect(()=>{
    if(!drop) return;
    const fn=()=>setDrop(false);
    document.addEventListener('mousedown',fn);
    return ()=>document.removeEventListener('mousedown',fn);
  },[drop]);
  const toggleType=(t:SEvType)=>setActiveTypes(prev=>{const n=new Set(prev);if(n.has(t)){if(n.size>1)n.delete(t);}else n.add(t);return n;});
  const changeMonth = (delta:number) => {
    setDrop(false);
    setViewDate(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };
  const prevMo=()=>changeMonth(-1);
  const nextMo=()=>changeMonth(1);
  const goToday=()=>{
    setDrop(false);
    if (!isCurrentMonth) setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };
  // Build calendar cells
  const fdow=(new Date(yr,mo,1).getDay()+6)%7;
  const daysInMonth=new Date(yr,mo+1,0).getDate();
  const prevLast=new Date(yr,mo,0).getDate();
  const cells:{day:number;cur:boolean;isToday:boolean}[]=[];
  for(let i=fdow-1;i>=0;i--) cells.push({day:prevLast-i,cur:false,isToday:false});
  for(let d=1;d<=daysInMonth;d++) cells.push({day:d,cur:true,isToday:d===today.getDate()&&mo===today.getMonth()&&yr===today.getFullYear()});
  const rem=(7-cells.length%7)%7;
  for(let d=1;d<=rem;d++) cells.push({day:d,cur:false,isToday:false});
  const getDayEvts=(d:number)=>SC_SEED.filter(e=>e.day===d&&e.month===mo&&e.year===yr&&activeTypes.has(e.type)).sort((a,b)=>a.timeStart.localeCompare(b.timeStart));
  const weeks=Math.ceil(cells.length/7);
  return (
    <div style={{background:'#fff',borderRadius:18,border:'1px solid #E5E7EB',overflow:'hidden'}}>
      {/* ── Header ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 22px',borderBottom:'1px solid #F0F0F0',flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
          {/* Month picker */}
          <div style={{position:'relative'}}>
            <button onClick={e=>{e.stopPropagation();setDrop(x=>!x);}}
              style={{display:'flex',alignItems:'center',gap:7,background:'none',border:'none',cursor:'pointer',padding:0}}>
              <span style={{fontSize:14,color:'#6B7280',fontWeight:500}}>Расписание на</span>
              <span style={{fontSize:18,fontWeight:800,color:'#111'}}>{SC_MN[mo]} {yr}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {drop&&(
              <div onMouseDown={e=>e.stopPropagation()} style={{position:'absolute',top:'calc(100% + 8px)',left:0,background:'#fff',border:'1px solid #E5E7EB',borderRadius:14,padding:8,boxShadow:'0 12px 36px rgba(0,0,0,.12)',zIndex:300,width:270,animation:'sc-dropIn .12s ease'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'2px 4px 8px',borderBottom:'1px solid #F0F0F0',marginBottom:6}}>
                  <button className="sc-nav" onClick={()=>setViewDate(current=>new Date(current.getFullYear()-1,current.getMonth(),1))} aria-label="Предыдущий год" style={{width:30,height:30,border:'1px solid #E5E7EB',background:'#F8FAFC',cursor:'pointer',display:'grid',placeItems:'center'}}>‹</button>
                  <strong style={{fontSize:14,color:'#111827'}}>{yr}</strong>
                  <button className="sc-nav" onClick={()=>setViewDate(current=>new Date(current.getFullYear()+1,current.getMonth(),1))} aria-label="Следующий год" style={{width:30,height:30,border:'1px solid #E5E7EB',background:'#F8FAFC',cursor:'pointer',display:'grid',placeItems:'center'}}>›</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
                  {SC_MN.map((m,i)=>(
                    <button key={m} className={`sc-mo-item${i===mo?' active':''}`}
                      onClick={()=>{setViewDate(new Date(yr,i,1));setDrop(false);}}
                      style={{padding:'8px 5px',textAlign:'center',background:'none',border:'none',borderRadius:8,fontSize:12,color:i===mo?'#375DFB':'#374151',cursor:'pointer',fontWeight:i===mo?700:500}}>
                      {m.slice(0,3)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Type filter chips */}
          <div style={{display:'flex',gap:12}}>
            {SC_TYPES.map(t=>{
              const on=activeTypes.has(t.id), c=STC[t.id];
              return (
                <button key={t.id} onClick={()=>toggleType(t.id)}
                  style={{display:'flex',alignItems:'center',gap:5,background:'none',border:'none',cursor:'pointer',padding:'3px 0',fontSize:12,color:on?'#374151':'#C4C9D4',fontWeight:on?500:400,transition:'all .15s'}}>
                  <span style={{width:9,height:9,borderRadius:'50%',background:on?c.dot:'#D1D5DB',display:'inline-block',flexShrink:0,transition:'background .15s'}}/>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Controls (навигация по месяцам) */}
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={prevMo} className="sc-nav"
            style={{width:34,height:34,borderRadius:9,background:'#F4F6FA',border:'1px solid #E5E7EB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="sc-nav" onClick={goToday} aria-current={isCurrentMonth ? 'date' : undefined}
            style={{padding:'6px 14px',background:isCurrentMonth?'#EBF1FF':'#fff',border:`1px solid ${isCurrentMonth?'#C7D2FE':'#E5E7EB'}`,borderRadius:9,fontSize:13,color:isCurrentMonth?'#375DFB':'#374151',cursor:isCurrentMonth?'default':'pointer',fontWeight:isCurrentMonth?700:500}}>
            Сегодня
          </button>
          <button onClick={nextMo} className="sc-nav"
            style={{width:34,height:34,borderRadius:9,background:'#F4F6FA',border:'1px solid #E5E7EB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      {/* ── Grid ── */}
      <div style={{overflowX:'auto'}}>
        <div key={`${yr}-${mo}`} className="sc-grid-swap" style={{minWidth:700}}>
          {/* Day headers */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid #F0F0F0'}}>
            {SC_DN.map(d=><div key={d} style={{padding:'10px 0',textAlign:'center',fontSize:12,fontWeight:600,color:'#9CA3AF',letterSpacing:'.3px'}}>{d}</div>)}
          </div>
          {/* Weeks */}
          {Array.from({length:weeks}).map((_,wi)=>(
            <div key={wi} style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:wi<weeks-1?'1px solid #F5F5F7':'none'}}>
              {cells.slice(wi*7,wi*7+7).map((cell,di)=>{
                const evs=cell.cur?getDayEvts(cell.day):[];
                return (
                  <div key={di} className={`sc-day${cell.cur?' cur':''}`}
                    style={{minHeight:104,padding:'6px 6px 8px',borderRight:di<6?'1px solid #F5F5F7':'none',position:'relative',background:cell.cur?'#fff':'#FAFAFA'}}>
                    {/* Day number */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'flex-start',marginBottom:4}}>
                      <span style={{
                        width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:13,fontWeight:cell.isToday?700:400,
                        color:cell.isToday?'#fff':cell.cur?'#374151':'#D1D5DB',
                        background:cell.isToday?'#EF4444':'transparent',
                      }}>
                        {cell.day}
                      </span>
                    </div>
                    {/* Events */}
                    {evs.map(ev=>{
                      const c=STC[ev.type];
                      return (
                        <div key={ev.id} className="sc-ev" onClick={()=>setDetail(ev)}
                          style={{background:c.bg,border:`1px solid ${c.border}`,borderLeft:`3px solid ${c.av}`,borderRadius:8,padding:'5px 7px',marginBottom:4}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:2}}>
                            <span style={{fontSize:10,fontWeight:700,color:c.tx,opacity:.8}}>{ev.timeStart}–{ev.timeEnd}</span>
                            <span style={{fontSize:9,fontWeight:800,color:'#fff',background:c.av,borderRadius:4,padding:'1px 5px',lineHeight:1.5}}>№{ev.num}</span>
                          </div>
                          <div style={{fontSize:11,fontWeight:700,color:c.tx,lineHeight:1.3,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.title}</div>
                          <div style={{display:'flex',alignItems:'center',gap:4}}>
                            <Avatar name={ev.instructor} color={c.av}/>
                            <span style={{fontSize:10,color:c.tx,opacity:.8,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.instructor}</span>
                          </div>
                          {ev.location&&<div style={{display:'flex',alignItems:'center',gap:3,marginTop:3}}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill={c.av} stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                            <span style={{fontSize:9,color:c.tx,opacity:.65,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.location}</span>
                          </div>}
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
      {/* ── Detail (view-only) ── */}
      {detail&&(
        <SEventDetail event={detail} onClose={()=>setDetail(null)}/>
      )}
    </div>
  );
}
