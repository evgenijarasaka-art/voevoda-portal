import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/* ─── CSS ─── */
const SC_CSS = `
@keyframes sc-fadeIn{from{opacity:0}to{opacity:1}}
@keyframes sc-fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes sc-dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.sc-ev{transition:box-shadow .15s,transform .12s;cursor:pointer}
.sc-ev:hover{box-shadow:0 6px 18px rgba(0,0,0,.12);transform:translateY(-2px)}
.sc-nav{transition:background .12s,border-color .12s,color .12s}
.sc-nav:hover{background:#EBF1FF!important;border-color:#C7D2FE!important;color:#375DFB!important}
.sc-day{transition:background .1s}
.sc-day.cur:hover{background:#FAFBFF!important}
.sc-add{opacity:0;transition:opacity .15s}
.sc-day.cur:hover .sc-add{opacity:1!important}
.sc-cinput{outline:none;border:1.5px solid #E5E7EB;border-radius:10px;padding:10px 13px;font-size:14px;width:100%;box-sizing:border-box;transition:border-color .15s;font-family:inherit;color:#111;background:#fff}
.sc-cinput:focus{border-color:#375DFB}
.sc-cinput::placeholder{color:#9CA3AF}
.sc-mo-item:hover{background:#F9FAFB!important}
.sc-mo-item.active{background:#EBF1FF!important;color:#375DFB!important;font-weight:600!important}
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
}

/* ─── Constants ─── */
const SC_MN = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const SC_DN = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];
const SC_INSTRUCTORS = ['Бек','Торнадо','Grek','Коба','Орёл'];

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

/* ─── Schema ─── */
const sZ = z.object({
  title:       z.string().min(1,'Укажите название'),
  type:        z.enum(['аудитория','полигон','стрельбище'] as const),
  day:         z.number().min(1,'Мин. 1').max(31,'Макс. 31'),
  timeStart:   z.string(),
  timeEnd:     z.string(),
  instructor:  z.string().min(1,'Выберите инструктора'),
  description: z.string(),
});
type SForm = z.infer<typeof sZ>;

/* ─── Helpers ─── */
const suid = () => Math.random().toString(36).slice(2,9);

/* ─── Seed ─── */
const SC_SEED: SEvent[] = [
  {id:'s01',day:1, month:2,year:2024,title:'Вводное занятие',                       timeStart:'10:00',timeEnd:'15:00',type:'аудитория', num:1,instructor:'Бек',    description:'Знакомство с программой курса, инструктаж по безопасности.'},
  {id:'s02',day:5, month:2,year:2024,title:'Личная тактическая подготовка снайпера', timeStart:'10:00',timeEnd:'15:00',type:'аудитория', num:2,instructor:'Бек',    description:'Основы маскировки и позиционирования на местности.'},
  {id:'s03',day:14,month:2,year:2024,title:'Личная тактическая подготовка снайпера', timeStart:'10:00',timeEnd:'15:00',type:'полигон',   num:3,instructor:'Торнадо',description:'Практика в полевых условиях: передвижение, укрытие.'},
  {id:'s04',day:17,month:2,year:2024,title:'Летучка',                                timeStart:'10:00',timeEnd:'15:00',type:'полигон',   num:4,instructor:'Торнадо',description:'Проверка усвоенного материала, командные задания.'},
  {id:'s05',day:20,month:2,year:2024,title:'Огневая подготовка',                     timeStart:'10:00',timeEnd:'15:00',type:'стрельбище',num:5,instructor:'Grek',   description:'Стрельба из штатного оружия, упражнения по точности.'},
  {id:'s06',day:26,month:2,year:2024,title:'Азы военной топографии',                 timeStart:'10:00',timeEnd:'15:00',type:'аудитория', num:6,instructor:'Бек',    description:'Работа с картой и компасом, азимутальные задачи.'},
  {id:'s07',day:28,month:2,year:2024,title:'Технические средства разведки',          timeStart:'10:00',timeEnd:'15:00',type:'аудитория', num:7,instructor:'Бек',    description:''},
  {id:'s08',day:30,month:2,year:2024,title:'Огневая подготовка',                     timeStart:'10:00',timeEnd:'15:00',type:'стрельбище',num:8,instructor:'Grek',   description:''},
];
const SC_KEY = 'voevoda_scal_v1';
function loadSEvts(): SEvent[] {
  try { const s = localStorage.getItem(SC_KEY); return s ? JSON.parse(s) as SEvent[] : SC_SEED; } catch { return SC_SEED; }
}

/* ─── Avatar ─── */
function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div style={{width:18,height:18,borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:'#fff',flexShrink:0,letterSpacing:0}}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── EventModal ─── */
function SEventModal({ initial, defaultDay, defaultMonth, defaultYear, maxNum, onSave, onDelete, onClose }: {
  initial?: SEvent; defaultDay: number; defaultMonth: number; defaultYear: number;
  maxNum: number; onSave:(ev:SEvent)=>void; onDelete?:()=>void; onClose:()=>void;
}) {
  const {register,handleSubmit,watch,setValue,formState:{errors}} = useForm<SForm>({
    resolver: zodResolver(sZ),
    defaultValues: {
      title:       initial?.title       ?? '',
      type:        initial?.type        ?? 'аудитория',
      day:         initial?.day         ?? defaultDay,
      timeStart:   initial?.timeStart   ?? '10:00',
      timeEnd:     initial?.timeEnd     ?? '15:00',
      instructor:  initial?.instructor  ?? '',
      description: initial?.description ?? '',
    },
  });
  const selType = watch('type');
  const onSubmit = (data: SForm) => {
    onSave({
      id:    initial?.id    ?? suid(),
      month: initial?.month ?? defaultMonth,
      year:  initial?.year  ?? defaultYear,
      num:   initial?.num   ?? maxNum + 1,
      ...data,
    });
  };
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:16,backdropFilter:'blur(6px)',animation:'sc-fadeIn .18s ease'}}>
      <div onClick={e=>e.stopPropagation()} style={{maxWidth:480,width:'100%',background:'#fff',borderRadius:20,boxShadow:'0 24px 60px rgba(0,0,0,.2)',animation:'sc-fadeUp .2s ease',overflow:'hidden'}}>
        <div style={{padding:'20px 22px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:15,fontWeight:700,color:'#111'}}>{initial?'Редактировать занятие':'Новое занятие'}</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:'1px solid #E5E7EB',background:'#F8F9FB',cursor:'pointer',fontSize:18,color:'#6B7280',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>×</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{padding:'14px 22px 22px'}}>
          {/* Title */}
          <div style={{marginBottom:12}}>
            <input {...register('title')} className="sc-cinput" placeholder="Название занятия" style={{fontWeight:600,fontSize:15}}/>
            {errors.title&&<div style={{color:'#EF4444',fontSize:12,marginTop:3}}>{errors.title.message}</div>}
          </div>
          {/* Location type */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Локация</div>
            <div style={{display:'flex',gap:8}}>
              {SC_TYPES.map(t=>{
                const on=selType===t.id, c=STC[t.id];
                return (
                  <button type="button" key={t.id} onClick={()=>setValue('type',t.id)}
                    style={{flex:1,padding:'7px 0',borderRadius:10,border:`1.5px solid ${on?c.dot:'#E5E7EB'}`,background:on?c.bg:'#fff',color:on?c.tx:'#9CA3AF',fontSize:12,fontWeight:on?700:400,cursor:'pointer',transition:'all .12s'}}>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Day + time */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em',display:'block',marginBottom:5}}>День</label>
              <input type="number" min={1} max={31} {...register('day',{valueAsNumber:true})} className="sc-cinput"/>
              {errors.day&&<div style={{color:'#EF4444',fontSize:11,marginTop:2}}>{errors.day.message}</div>}
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em',display:'block',marginBottom:5}}>Начало</label>
              <input type="time" {...register('timeStart')} className="sc-cinput"/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em',display:'block',marginBottom:5}}>Конец</label>
              <input type="time" {...register('timeEnd')} className="sc-cinput"/>
            </div>
          </div>
          {/* Instructor */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em',display:'block',marginBottom:5}}>Инструктор</label>
            <select {...register('instructor')} className="sc-cinput" style={{appearance:'auto'}}>
              <option value="">Выберите инструктора</option>
              {SC_INSTRUCTORS.map(i=><option key={i} value={i}>{i}</option>)}
            </select>
            {errors.instructor&&<div style={{color:'#EF4444',fontSize:12,marginTop:3}}>{errors.instructor.message}</div>}
          </div>
          {/* Description */}
          <div style={{marginBottom:18}}>
            <textarea {...register('description')} className="sc-cinput" placeholder="Описание занятия..." rows={2} style={{resize:'none',fontFamily:'inherit'}}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button type="submit" style={{flex:1,padding:'11px 0',background:'#375DFB',border:'none',borderRadius:12,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(55,93,251,.32)'}}>
              {initial?'Сохранить':'Добавить занятие'}
            </button>
            {onDelete&&(
              <button type="button" onClick={onDelete} style={{padding:'11px 16px',background:'#FFF1F2',border:'1.5px solid #FCA5A5',borderRadius:12,color:'#DC2626',cursor:'pointer',fontSize:13,fontWeight:600}}>
                Удалить
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── EventDetail ─── */
function SEventDetail({ event, onEdit, onDelete, onClose }: {
  event: SEvent; onEdit:()=>void; onDelete:()=>void; onClose:()=>void;
}) {
  const c = STC[event.type];
  const typeLabel = SC_TYPES.find(t=>t.id===event.type)?.label ?? event.type;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.48)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9998,padding:16,backdropFilter:'blur(4px)',animation:'sc-fadeIn .18s ease'}}>
      <div onClick={e=>e.stopPropagation()} style={{maxWidth:400,width:'100%',background:'#fff',borderRadius:18,boxShadow:'0 20px 50px rgba(0,0,0,.18)',animation:'sc-fadeUp .2s ease',overflow:'hidden'}}>
        <div style={{background:c.bg,padding:'16px 18px 14px',borderBottom:`1px solid ${c.border}`}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,color:c.tx,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:5,opacity:.75,display:'flex',alignItems:'center',gap:6}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:c.dot,display:'inline-block'}}/>
                {typeLabel} · Занятие №{event.num}
              </div>
              <div style={{fontSize:16,fontWeight:800,color:'#111',lineHeight:1.3}}>{event.title}</div>
            </div>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:8,border:'1px solid rgba(0,0,0,.1)',background:'rgba(255,255,255,.8)',cursor:'pointer',fontSize:16,color:'#6B7280',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,lineHeight:1}}>×</button>
          </div>
        </div>
        <div style={{padding:'14px 18px 18px'}}>
          <div style={{display:'flex',gap:18,marginBottom:12,flexWrap:'wrap'}}>
            <span style={{display:'flex',alignItems:'center',gap:5,fontSize:13,color:'#374151'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {event.timeStart} — {event.timeEnd}
            </span>
            <span style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#374151'}}>
              <Avatar name={event.instructor} color={c.av}/>
              {event.instructor}
            </span>
          </div>
          {event.description ? (
            <div style={{background:'#F8F9FB',borderRadius:10,padding:'9px 12px',fontSize:13,color:'#374151',lineHeight:1.7,marginBottom:14}}>{event.description}</div>
          ) : (
            <div style={{marginBottom:14}}/>
          )}
          <div style={{display:'flex',gap:8}}>
            <button onClick={onEdit} style={{flex:1,padding:'9px 0',background:'#375DFB',border:'none',borderRadius:11,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 12px rgba(55,93,251,.3)'}}>
              Редактировать
            </button>
            <button onClick={onDelete} style={{padding:'9px 16px',background:'#FFF1F2',border:'1.5px solid #FCA5A5',borderRadius:11,color:'#DC2626',cursor:'pointer',fontSize:13,fontWeight:600}}>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── StreamCalendar ─── */
export function StreamCalendar() {
  useEffect(()=>injectScCss(),[]);
  const today = new Date();
  const [yr, setYr] = useState(2024);
  const [mo, setMo] = useState(2);
  const [drop, setDrop] = useState(false);
  const [events, setEvents] = useState<SEvent[]>(loadSEvts);
  const [modal, setModal] = useState<{event?:SEvent;day?:number}|null>(null);
  const [detail, setDetail] = useState<SEvent|null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<SEvType>>(new Set(['аудитория','полигон','стрельбище']));
  useEffect(()=>{try{localStorage.setItem(SC_KEY,JSON.stringify(events));}catch{}},[events]);
  useEffect(()=>{
    if(!drop) return;
    const fn=()=>setDrop(false);
    document.addEventListener('mousedown',fn);
    return ()=>document.removeEventListener('mousedown',fn);
  },[drop]);
  const saveEvt=(ev:SEvent)=>{
    setEvents(prev=>{const i=prev.findIndex(e=>e.id===ev.id);if(i>=0){const n=[...prev];n[i]=ev;return n;}return [...prev,ev];});
    setModal(null);
  };
  const delEvt=(id:string)=>{setEvents(prev=>prev.filter(e=>e.id!==id));setModal(null);setDetail(null);};
  const toggleType=(t:SEvType)=>setActiveTypes(prev=>{const n=new Set(prev);if(n.has(t)){if(n.size>1)n.delete(t);}else n.add(t);return n;});
  const prevMo=()=>mo===0?(setMo(11),setYr(y=>y-1)):setMo(m=>m-1);
  const nextMo=()=>mo===11?(setMo(0),setYr(y=>y+1)):setMo(m=>m+1);
  const maxNum=useMemo(()=>Math.max(0,...events.map(e=>e.num)),[events]);
  // Build calendar cells
  const fdow=(new Date(yr,mo,1).getDay()+6)%7;
  const daysInMonth=new Date(yr,mo+1,0).getDate();
  const prevLast=new Date(yr,mo,0).getDate();
  const cells:{day:number;cur:boolean;isToday:boolean}[]=[];
  for(let i=fdow-1;i>=0;i--) cells.push({day:prevLast-i,cur:false,isToday:false});
  for(let d=1;d<=daysInMonth;d++) cells.push({day:d,cur:true,isToday:d===today.getDate()&&mo===today.getMonth()&&yr===today.getFullYear()});
  const rem=(7-cells.length%7)%7;
  for(let d=1;d<=rem;d++) cells.push({day:d,cur:false,isToday:false});
  const getDayEvts=(d:number)=>events.filter(e=>e.day===d&&e.month===mo&&e.year===yr&&activeTypes.has(e.type)).sort((a,b)=>a.timeStart.localeCompare(b.timeStart));
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
              <div style={{position:'absolute',top:'calc(100% + 8px)',left:0,background:'#fff',border:'1px solid #E5E7EB',borderRadius:14,padding:'6px 0',boxShadow:'0 12px 36px rgba(0,0,0,.12)',zIndex:300,minWidth:150,animation:'sc-dropIn .12s ease'}}>
                {SC_MN.map((m,i)=>(
                  <button key={m} className={`sc-mo-item${i===mo?' active':''}`}
                    onClick={()=>{setMo(i);setDrop(false);}}
                    style={{display:'block',width:'100%',padding:'7px 16px',textAlign:'left',background:'none',border:'none',fontSize:13,color:i===mo?'#375DFB':'#374151',cursor:'pointer',fontWeight:i===mo?600:400}}>
                    {m}
                  </button>
                ))}
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
        {/* Controls */}
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={()=>setModal({})}
            style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',background:'#375DFB',border:'none',borderRadius:9,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',boxShadow:'0 3px 10px rgba(55,93,251,.28)',transition:'box-shadow .15s'}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='0 5px 16px rgba(55,93,251,.42)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow='0 3px 10px rgba(55,93,251,.28)'}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Добавить
          </button>
          <button onClick={prevMo} className="sc-nav"
            style={{width:34,height:34,borderRadius:9,background:'#F4F6FA',border:'1px solid #E5E7EB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="sc-nav" onClick={()=>{setYr(today.getFullYear());setMo(today.getMonth());}}
            style={{padding:'6px 14px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:9,fontSize:13,color:'#374151',cursor:'pointer',fontWeight:500}}>
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
        <div style={{minWidth:700}}>
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
                    {/* Day number + add button */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{
                        width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:13,fontWeight:cell.isToday?700:400,
                        color:cell.isToday?'#fff':cell.cur?'#374151':'#D1D5DB',
                        background:cell.isToday?'#EF4444':'transparent',
                      }}>
                        {cell.day}
                      </span>
                      {cell.cur&&(
                        <button className="sc-add" onClick={()=>setModal({day:cell.day})}
                          style={{width:20,height:20,borderRadius:6,background:'#EBF1FF',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#375DFB'}}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                      )}
                    </div>
                    {/* Events */}
                    {evs.map(ev=>{
                      const c=STC[ev.type];
                      return (
                        <div key={ev.id} className="sc-ev" onClick={()=>setDetail(ev)}
                          style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:8,padding:'6px 8px',marginBottom:4}}>
                          <div style={{fontSize:12,fontWeight:700,color:c.tx,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.title}</div>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                            <span style={{fontSize:11,color:c.tx,opacity:.8}}>{ev.timeStart} – {ev.timeEnd}</span>
                            <span style={{fontSize:11,fontWeight:700,color:c.tx,opacity:.9}}>№{ev.num}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:5}}>
                            <Avatar name={ev.instructor} color={c.av}/>
                            <span style={{fontSize:11,color:c.tx,opacity:.8,fontWeight:500}}>{ev.instructor}</span>
                          </div>
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
      {/* ── Modals ── */}
      {modal&&(
        <SEventModal
          key={modal.event?.id??'new'}
          initial={modal.event}
          defaultDay={modal.day??1}
          defaultMonth={mo}
          defaultYear={yr}
          maxNum={maxNum}
          onSave={saveEvt}
          onDelete={modal.event?()=>delEvt(modal.event!.id):undefined}
          onClose={()=>setModal(null)}/>
      )}
      {detail&&(
        <SEventDetail
          event={detail}
          onEdit={()=>{setModal({event:detail});setDetail(null);}}
          onDelete={()=>delEvt(detail.id)}
          onClose={()=>setDetail(null)}/>
      )}
    </div>
  );
}