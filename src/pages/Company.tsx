import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
  :root{--accent:#1A56DB;--accent-2:#2563EB;--accent-light:#EBF2FF;--accent-mid:#C7D9FA;--navy-900:#07111F;--navy-800:#0D1B2A;--navy-700:#102236;--navy-600:#1A3A5C;--surface:#F4F6FB;--surface-2:#EEF1F8;--border:#DDE3EE;--border-2:#C8D0E2;--text-primary:#0D1B2A;--text-secondary:#4A5568;--text-muted:#8A96A8;--success:#1A8A57;--success-bg:#E8F7EE;--warn:#C07A10;--warn-bg:#FEF3DC;--radius:14px;--radius-lg:20px;--radius-xl:28px;--shadow:0 4px 16px rgba(13,27,42,.09);--shadow-lg:0 12px 36px rgba(13,27,42,.14);--font:'Montserrat',sans-serif;}
  *{box-sizing:border-box;margin:0;padding:0;}
  .co-root{font-family:var(--font);}
  @keyframes co-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes co-fade{from{opacity:0}to{opacity:1}}
  @keyframes co-hero-line{from{width:0;opacity:0}to{width:56px;opacity:1}}
  @keyframes co-count{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
  @keyframes co-modal{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:none}}
  .co-s1{animation:co-up .42s ease both;}
  .co-s2{animation:co-up .42s .07s ease both;}
  .co-s3{animation:co-up .42s .14s ease both;}
  .co-s4{animation:co-up .42s .21s ease both;}
  .co-stat{transition:transform .2s,box-shadow .2s!important;}
  .co-stat:hover{transform:translateY(-3px)!important;box-shadow:var(--shadow)!important;}
  .co-member{cursor:pointer;transition:box-shadow .2s,transform .18s!important;}
  .co-member:hover{box-shadow:0 8px 28px rgba(13,27,42,.11)!important;transform:translateY(-2px)!important;}
  .co-member:hover .co-member-img{transform:scale(1.04);}
  .co-member-img{transition:transform .35s;}
  .co-nav-btn{display:flex;align-items:center;gap:10px;width:100%;padding:12px 18px;border:none;background:transparent;cursor:pointer;text-align:left;font-family:var(--font);transition:background .13s;border-left:3px solid transparent;}
  .co-nav-btn:hover{background:var(--surface);}
  .co-nav-btn.active{background:var(--accent-light)!important;border-left-color:var(--accent)!important;color:var(--accent)!important;}
  .co-doc-row{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-bottom:1px solid var(--border);transition:background .13s;}
  .co-doc-row:last-child{border-bottom:none;}
  .co-doc-row:hover{background:var(--surface);}
  .co-milestone{display:flex;gap:18px;position:relative;}
  .co-contact-field{width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:var(--radius);font-size:14px;color:var(--text-primary);outline:none;font-family:var(--font);background:#fff;transition:border-color .15s;}
  .co-contact-field:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(26,86,219,.09);}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:4px}
`;

const STATS=[
  {label:'Лет на рынке',value:'8+',icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',color:'var(--accent)',bg:'var(--accent-light)'},
  {label:'Выпускников',value:'12 400+',icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',color:'var(--success)',bg:'var(--success-bg)'},
  {label:'Городов',value:'23',icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',color:'var(--warn)',bg:'var(--warn-bg)'},
  {label:'Программ',value:'40+',icon:'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',color:'#7C3AED',bg:'#F3EEFF'},
];

const TEAM=[
  {name:'Александр Воронов',role:'Генеральный директор',rank:'Полковник',img:'/teacher1-main.jpg',exp:'22 года в ВС РФ',bio:'Ветеран двух боевых командировок. Основал УТЦ «Воевода» в 2016 году с целью передачи реального боевого опыта гражданскому населению. Специализация — тактическое планирование и командирская подготовка.',phone:'+7 (495) 100-00-01'},
  {name:'Дмитрий Касимов',role:'Начальник учебной части',rank:'Подполковник',img:'/teacher2-main.jpg',exp:'15 лет в спецназе',bio:'Офицер специального назначения в запасе. Разработал учебный план портала, адаптировав армейские методики для гражданских курсантов. Куратор направления тактической подготовки.',phone:'+7 (495) 100-00-02'},
  {name:'Олег Беляев',role:'Главный инструктор по физподготовке',rank:'Майор',img:'/teacher3-main.jpg',exp:'ВДВ, 14 лет',bio:'Мастер спорта по военному многоборью. Разработал систему Индекса Воеводы — уникальной метрики физической и тактической подготовленности курсанта.',phone:'+7 (495) 100-00-03'},
  {name:'Наталья Кузьмина',role:'Директор по обучению',rank:'',img:'/teacher1-main.jpg',exp:'Педагог, 12 лет',bio:'Кандидат педагогических наук. Отвечает за методологию онлайн-обучения, разработку тестов и домашних заданий. Обеспечивает соответствие программ государственным образовательным стандартам.',phone:'+7 (495) 100-00-04'},
];

const MILESTONES=[
  {year:'2016',text:'Основание УТЦ «Воевода» в Москве. Первый набор — 120 курсантов, 3 инструктора.'},
  {year:'2017',text:'Получена государственная лицензия на образовательную деятельность по программам военно-патриотической подготовки.'},
  {year:'2018',text:'Открытие филиалов в Санкт-Петербурге и Краснодаре. Запуск первой серии курсов КМБ.'},
  {year:'2020',text:'Запуск онлайн-платформы. Первые дистанционные курсанты — более 1000 человек за первый квартал.'},
  {year:'2022',text:'Сотрудничество с МО РФ. Государственная аккредитация 12 образовательных программ.'},
  {year:'2024',text:'Расширение до 23 городов присутствия. Запуск портала «Воевода» — единой платформы обучения и сообщества.'},
];

const DOCS=['Устав организации','Лицензия на образовательную деятельность','Свидетельство о государственной аккредитации','Политика конфиденциальности','Пользовательское соглашение','Реквизиты организации','Программа воспитательной работы','Антикоррупционная политика'];

const DIRECTIONS=[
  {title:'Тактическая и огневая подготовка',desc:'Боевые действия в городе, управление огнём, работа в группе',icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'},
  {title:'Медицинская подготовка',desc:'Тактическая медицина, первая помощь, эвакуация раненых',icon:'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'},
  {title:'Физическая подготовка',desc:'Боевые нормативы, тест Купера, силовые показатели',icon:'M13 10V3L4 14h7v7l9-11h-7z'},
  {title:'Военная топография',desc:'Ориентирование на местности, чтение карт, навигация',icon:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'},
  {title:'Связь и РЭБ',desc:'Радиосвязь, шифрование, противодействие РЭБ',icon:'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.143 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0'},
  {title:'Командирская подготовка',desc:'Управление личным составом, планирование операций',icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'},
  {title:'Психологическая подготовка',desc:'Стрессоустойчивость, боевой стресс, командный дух',icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'},
  {title:'Снайперская подготовка',desc:'Баллистика, маскировка, работа с оптикой',icon:'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'},
];

type Section='about'|'mission'|'team'|'history'|'directions'|'docs'|'contacts';

function Ico({d,size=18,stroke='currentColor',sw=1.6}:{d:string;size?:number;stroke?:string;sw?:number}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d.split('M').slice(1).map((seg,i)=><path key={i} d={'M'+seg}/>)}</svg>;
}

export function Company(){
  const navigate=useNavigate();
  const [active,setActive]=useState<Section>('about');
  const [selectedMember,setSelectedMember]=useState<typeof TEAM[0]|null>(null);
  const [contactForm,setContactForm]=useState({name:'',phone:'',email:'',msg:''});
  const [contactSent,setContactSent]=useState(false);
  const [partnerForm,setPartnerForm]=useState({org:'',name:'',phone:'',request:''});
  const [partnerSent,setPartnerSent]=useState(false);

  const NAV:Array<{id:Section;label:string;icon:string}> = [
    {id:'about',label:'О центре',icon:'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'},
    {id:'mission',label:'Миссия и ценности',icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'},
    {id:'team',label:'Руководство',icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'},
    {id:'history',label:'История',icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'},
    {id:'directions',label:'Направления',icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'},
    {id:'docs',label:'Документы',icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'},
    {id:'contacts',label:'Контакты',icon:'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'},
  ];

  const Card=({children,style}:{children:React.ReactNode;style?:React.CSSProperties})=>(
    <div style={{background:'#fff',borderRadius:20,border:'1px solid var(--border)',overflow:'hidden',marginBottom:16,...style}}>{children}</div>
  );

  const SHeader=({icon,title}:{icon:string;title:string})=>(
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'18px 22px',borderBottom:'1px solid var(--border)'}}>
      <div style={{width:36,height:36,borderRadius:10,background:'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <Ico d={icon} size={18} stroke="var(--text-secondary)"/>
      </div>
      <span style={{fontSize:17,fontWeight:700,color:'var(--text-primary)'}}>{title}</span>
    </div>
  );

  return(
    <div className="co-root" style={{paddingTop:60,marginLeft:56,minHeight:'100vh',background:'var(--surface)'}}>
      <style>{CSS}</style>

      <div style={{padding:'20px 24px 60px'}}>
        {/* Breadcrumb */}
        <div style={{display:'flex',gap:6,fontSize:12,color:'var(--text-muted)',marginBottom:20}}>
          <span onClick={()=>navigate('/')} style={{cursor:'pointer'}}>Главная</span><span>/</span>
          <span style={{color:'var(--text-primary)',fontWeight:500}}>О компании</span>
        </div>

        {/* Hero */}
        <div className="co-s1" style={{background:'linear-gradient(138deg,var(--navy-900) 0%,var(--navy-700) 55%,var(--navy-600) 100%)',borderRadius:24,position:'relative',overflow:'hidden',marginBottom:16}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.02) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.02) 40px)'}}/>
          <div style={{position:'absolute',top:-80,right:-80,width:380,height:380,borderRadius:'50%',background:'radial-gradient(circle,rgba(26,86,219,.18) 0%,transparent 70%)'}}/>
          <div style={{position:'relative',zIndex:1,padding:'36px 44px',display:'grid',gridTemplateColumns:'1fr 320px',gap:48,alignItems:'center'}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.4)',letterSpacing:2,textTransform:'uppercase',marginBottom:10}}>УТЦ «ВОЕВОДА» · с 2016 года</div>
              <h1 style={{fontSize:32,fontWeight:800,color:'#fff',lineHeight:1.15,letterSpacing:'-.4px',marginBottom:0}}>Военно-тактический<br/>учебный центр</h1>
              <div style={{width:56,height:3,borderRadius:2,background:'var(--accent-2)',margin:'12px 0 18px',animation:'co-hero-line .6s .2s ease both'}}/>
              <p style={{fontSize:14,color:'rgba(255,255,255,.6)',lineHeight:1.8,maxWidth:480,marginBottom:28}}>Профессиональная военная подготовка граждан России. Обучаем защищать Родину — на реальных полигонах, с ветеранами ВС РФ и спецназа.</p>
              <div style={{display:'flex',gap:12}}>
                <button onClick={()=>navigate('/courses')} style={{padding:'12px 26px',background:'var(--accent)',border:'none',borderRadius:12,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'var(--font)',transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='var(--accent-2)';e.currentTarget.style.transform='translateY(-1px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='var(--accent)';e.currentTarget.style.transform='none';}}>Записаться на курс</button>
                <button onClick={()=>setActive('contacts')} style={{padding:'12px 22px',background:'rgba(255,255,255,.1)',border:'1.5px solid rgba(255,255,255,.2)',borderRadius:12,color:'#fff',fontSize:14,cursor:'pointer',fontFamily:'var(--font)',transition:'all .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.18)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}>Связаться</button>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[['18 400','Активных пользователей'],['40+','Программ подготовки'],['23','Города присутствия']].map(([v,l])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.10)',borderRadius:12,backdropFilter:'blur(6px)'}}>
                  <span style={{fontSize:12,color:'rgba(255,255,255,.55)'}}>{l}</span>
                  <span style={{fontSize:18,fontWeight:800,color:'#fff'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="co-s2" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:16}}>
          {STATS.map((s,i)=>(
            <div key={i} className="co-stat" style={{background:'#fff',borderRadius:18,border:'1px solid var(--border)',padding:'20px 22px',animationDelay:`${i*.05}s`}}>
              <div style={{width:44,height:44,borderRadius:12,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
                <Ico d={s.icon} size={20} stroke={s.color}/>
              </div>
              <div style={{fontSize:26,fontWeight:800,color:s.color,marginBottom:4}}>{s.value}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:16,alignItems:'start'}}>
          {/* Left nav */}
          <div style={{background:'#fff',borderRadius:16,border:'1px solid var(--border)',overflow:'hidden',position:'sticky',top:80}}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>setActive(n.id)} className={`co-nav-btn${active===n.id?' active':''}`}
                style={{fontSize:13,fontWeight:active===n.id?600:400,color:active===n.id?'var(--accent)':'var(--text-secondary)'}}>
                <Ico d={n.icon} size={15} stroke="currentColor"/>
                {n.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            {active==='about'&&(
              <>
                <Card>
                  <SHeader icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" title="О нас"/>
                  <div style={{padding:'22px'}}>
                    <p style={{fontSize:15,color:'var(--text-secondary)',lineHeight:1.85,marginBottom:16}}>УТЦ «Воевода» — ведущий военно-тактический учебный центр России, специализирующийся на подготовке граждан к службе и действиям в экстремальных ситуациях. Работаем с 2016 года, подготовили более 12 000 курсантов.</p>
                    <p style={{fontSize:15,color:'var(--text-secondary)',lineHeight:1.85,marginBottom:16}}>Программы разработаны совместно с ветеранами Вооружённых Сил РФ, спецназа и МЧС — по государственным стандартам с учётом реального боевого опыта.</p>
                    <p style={{fontSize:15,color:'var(--text-secondary)',lineHeight:1.85}}>Центр имеет государственную лицензию на образовательную деятельность и аккредитацию 12 программ военно-патриотической подготовки.</p>
                  </div>
                </Card>
                <Card>
                  <SHeader icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" title="Направления подготовки"/>
                  <div style={{padding:'18px 22px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    {DIRECTIONS.slice(0,4).map(d=>(
                      <div key={d.title} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'14px',background:'var(--surface)',borderRadius:12,border:'1px solid var(--border)'}}>
                        <div style={{width:36,height:36,borderRadius:10,background:'var(--accent-light)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <Ico d={d.icon} size={16} stroke="var(--accent)"/>
                        </div>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:'var(--text-primary)',marginBottom:3}}>{d.title}</div>
                          <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.5}}>{d.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
            {active==='mission'&&(
              <Card>
                <SHeader icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" title="Миссия и ценности"/>
                <div style={{padding:'24px'}}>
                  <div style={{background:'linear-gradient(135deg,var(--accent-light),#F0F9FF)',borderRadius:16,padding:'22px',marginBottom:22,border:'1px solid var(--accent-mid)'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Миссия</div>
                    <p style={{fontSize:16,fontWeight:700,color:'var(--text-primary)',lineHeight:1.6}}>Формировать физически и морально подготовленных граждан, способных защитить себя, близких и Родину в любых условиях.</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    {[
                      {title:'Профессионализм',text:'Только подтверждённый боевой опыт. Каждый инструктор прошёл реальную службу.',icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'},
                      {title:'Патриотизм',text:'Воспитываем любовь к Родине через действие. Не слова — результат.',icon:'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9'},
                      {title:'Братство',text:'Курсанты становятся частью единого сообщества на всю жизнь.',icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'},
                      {title:'Результат',text:'Измеримые показатели подготовки. Индекс Воеводы — наша метрика.',icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'},
                    ].map(v=>(
                      <div key={v.title} style={{background:'var(--surface)',borderRadius:14,padding:'18px',border:'1px solid var(--border)'}}>
                        <div style={{width:38,height:38,borderRadius:10,background:'var(--accent-light)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}>
                          <Ico d={v.icon} size={18} stroke="var(--accent)"/>
                        </div>
                        <div style={{fontSize:14,fontWeight:700,color:'var(--text-primary)',marginBottom:6}}>{v.title}</div>
                        <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6}}>{v.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
            {active==='team'&&(
              <Card>
                <SHeader icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" title="Руководство"/>
                <div style={{padding:'20px 22px',display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
                  {TEAM.map(m=>(
                    <div key={m.name} className="co-member" onClick={()=>setSelectedMember(m)} style={{background:'var(--surface)',borderRadius:16,border:'1px solid var(--border)',overflow:'hidden'}}>
                      <div style={{height:160,overflow:'hidden',background:'var(--surface-2)'}}>
                        <img src={m.img} alt="" className="co-member-img" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
                      </div>
                      <div style={{padding:'14px 16px'}}>
                        {m.rank&&<div style={{fontSize:11,fontWeight:700,color:'var(--accent)',marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>{m.rank}</div>}
                        <div style={{fontSize:14,fontWeight:700,color:'var(--text-primary)',marginBottom:4}}>{m.name}</div>
                        <div style={{fontSize:12,color:'var(--text-secondary)',marginBottom:6}}>{m.role}</div>
                        <div style={{fontSize:11,color:'var(--text-muted)'}}>{m.exp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {active==='history'&&(
              <Card>
                <SHeader icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" title="История"/>
                <div style={{padding:'24px'}}>
                  {MILESTONES.map((m,i)=>(
                    <div key={i} className="co-milestone" style={{marginBottom:i<MILESTONES.length-1?0:0}}>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
                        <div style={{width:52,height:52,borderRadius:14,background:'var(--accent-light)',border:'2px solid var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'var(--accent)',flexShrink:0}}>{m.year}</div>
                        {i<MILESTONES.length-1&&<div style={{width:2,height:28,background:'var(--border)',margin:'4px 0'}}/>}
                      </div>
                      <div style={{paddingTop:14,paddingBottom:i<MILESTONES.length-1?20:0}}>
                        <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.7}}>{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {active==='directions'&&(
              <Card>
                <SHeader icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" title="Направления подготовки"/>
                <div style={{padding:'20px 22px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  {DIRECTIONS.map(d=>(
                    <div key={d.title} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'16px',background:'var(--surface)',borderRadius:14,border:'1px solid var(--border)',transition:'border-color .15s,box-shadow .15s',cursor:'default'}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor='var(--accent-mid)';(e.currentTarget as HTMLDivElement).style.boxShadow='var(--shadow)';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor='var(--border)';(e.currentTarget as HTMLDivElement).style.boxShadow='none';}}>
                      <div style={{width:40,height:40,borderRadius:11,background:'var(--accent-light)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <Ico d={d.icon} size={18} stroke="var(--accent)"/>
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'var(--text-primary)',marginBottom:4}}>{d.title}</div>
                        <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.55}}>{d.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {active==='docs'&&(
              <Card>
                <SHeader icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" title="Документы"/>
                <div>
                  {DOCS.map((doc,i)=>(
                    <div key={i} className="co-doc-row">
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:36,height:36,borderRadius:9,background:'var(--warn-bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <Ico d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" size={16} stroke="var(--warn)"/>
                        </div>
                        <span style={{fontSize:14,color:'var(--text-primary)'}}>{doc}</span>
                      </div>
                      <button onClick={() => {
                        const blob = new Blob([`Документ: ${doc}\n\nДемо-файл портала ВОЕВОДА.`], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${doc}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }} style={{display:'flex',alignItems:'center',gap:5,background:'var(--accent-light)',border:'1.5px solid var(--accent-mid)',borderRadius:9,padding:'6px 13px',fontSize:12,fontWeight:700,color:'var(--accent)',cursor:'pointer',fontFamily:'var(--font)',transition:'all .13s'}}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--accent-mid)'}
                        onMouseLeave={e=>e.currentTarget.style.background='var(--accent-light)'}>
                        <Ico d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={13} stroke="currentColor" sw={2}/>
                        Скачать
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {active==='contacts'&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <Card>
                  <SHeader icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" title="Контакты"/>
                  <div style={{padding:'20px 22px'}}>
                    {[{icon:'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',label:'Телефон',value:'+7 (495) 123-45-67'},
                     {icon:'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',label:'Почта',value:'info@voevoda.ru'},
                     {icon:'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',label:'ВКонтакте',value:'vk.com/voevoda'},
                     {icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',label:'Адрес',value:'г. Москва, ул. Профсоюзная, 45'}].map(c=>(
                      <div key={c.label} style={{display:'flex',gap:12,marginBottom:14}}>
                        <div style={{width:38,height:38,borderRadius:10,background:'var(--accent-light)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <Ico d={c.icon} size={16} stroke="var(--accent)"/>
                        </div>
                        <div>
                          <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:2}}>{c.label}</div>
                          <div style={{fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>{c.value}</div>
                        </div>
                      </div>
                    ))}
                    <div style={{borderTop:'1px solid var(--border)',paddingTop:16,marginTop:4}}>
                      <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:.5,marginBottom:12}}>Реквизиты</div>
                      {[['Организация','ООО ВПТЦ «Воевода»'],['ИНН','7713799300'],['ОГРН','1167746123456']].map(([l,v])=>(
                        <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                          <span style={{fontSize:12,color:'var(--text-muted)'}}>{l}</span>
                          <span style={{fontSize:12,fontWeight:600,color:'var(--text-primary)'}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <SHeader icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" title="Обратная связь"/>
                  <div style={{padding:'20px 22px'}}>
                    {contactSent?(
                      <div style={{textAlign:'center',padding:'28px 0'}}>
                        <div style={{width:56,height:56,borderRadius:16,background:'var(--success-bg)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
                          <Ico d="M5 13l4 4L19 7" size={26} stroke="var(--success)" sw={2.5}/>
                        </div>
                        <div style={{fontSize:15,fontWeight:700,color:'var(--text-primary)',marginBottom:6}}>Сообщение отправлено</div>
                        <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:18}}>Ответим в течение рабочего дня</div>
                        <button onClick={()=>{setContactSent(false);setContactForm({name:'',phone:'',email:'',msg:'',});}} style={{padding:'9px 22px',background:'var(--accent-light)',border:'1.5px solid var(--accent-mid)',borderRadius:10,color:'var(--accent)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'var(--font)'}}>Отправить ещё</button>
                      </div>
                    ):(
                      <>
                        {[{label:'Имя',key:'name',type:'text',placeholder:'Ваше имя'},{label:'Телефон',key:'phone',type:'tel',placeholder:'+7 (999) 000-00-00'},{label:'Почта',key:'email',type:'email',placeholder:'pochta@example.ru'}].map(f=>(
                          <div key={f.key} style={{marginBottom:12}}>
                            <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--text-secondary)',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>{f.label}</label>
                            <input className="co-contact-field" type={f.type} value={contactForm[f.key as keyof typeof contactForm]} onChange={e=>setContactForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}/>
                          </div>
                        ))}
                        <div style={{marginBottom:16}}>
                          <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--text-secondary)',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Сообщение</label>
                          <textarea value={contactForm.msg} onChange={e=>setContactForm(p=>({...p,msg:e.target.value}))} rows={3} placeholder="Ваш вопрос или предложение..." className="co-contact-field" style={{resize:'vertical'}}/>
                        </div>
                        <button onClick={()=>{if(contactForm.name.trim()&&contactForm.phone.trim())setContactSent(true);}} style={{width:'100%',padding:'13px',background:'var(--accent)',border:'none',borderRadius:12,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'var(--font)',transition:'all .15s'}}
                          onMouseEnter={e=>{e.currentTarget.style.background='var(--accent-2)';e.currentTarget.style.transform='translateY(-1px)';}}
                          onMouseLeave={e=>{e.currentTarget.style.background='var(--accent)';e.currentTarget.style.transform='none';}}>Отправить сообщение</button>
                      </>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Modal */}
      {selectedMember&&(
        <div onClick={()=>setSelectedMember(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:24,backdropFilter:'blur(5px)',animation:'co-fade .15s ease'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:24,maxWidth:520,width:'100%',boxShadow:'var(--shadow-lg)',animation:'co-modal .25s cubic-bezier(.34,1.56,.64,1)',overflow:'hidden'}}>
            <div style={{height:220,background:'var(--surface-2)',position:'relative'}}>
              <img src={selectedMember.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
              <button onClick={()=>setSelectedMember(null)} style={{position:'absolute',top:14,right:14,width:34,height:34,borderRadius:10,background:'rgba(255,255,255,.9)',border:'none',cursor:'pointer',fontSize:20,color:'var(--text-muted)',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            </div>
            <div style={{padding:'22px 26px'}}>
              {selectedMember.rank&&<div style={{fontSize:11,fontWeight:700,color:'var(--accent)',marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>{selectedMember.rank}</div>}
              <div style={{fontSize:20,fontWeight:800,color:'var(--text-primary)',marginBottom:4}}>{selectedMember.name}</div>
              <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:4}}>{selectedMember.role}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:14}}>{selectedMember.exp}</div>
              <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.75,background:'var(--surface)',borderRadius:12,padding:'14px',marginBottom:16}}>{selectedMember.bio}</p>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>navigate('/messages?chat=7')} style={{flex:1,padding:'11px',background:'var(--accent)',border:'none',borderRadius:11,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'var(--font)',transition:'all .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--accent-2)'} onMouseLeave={e=>e.currentTarget.style.background='var(--accent)'}>Написать в чат</button>
                <button onClick={()=>setSelectedMember(null)} style={{padding:'11px 18px',background:'var(--surface)',border:'1.5px solid var(--border)',borderRadius:11,color:'var(--text-secondary)',fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}}>Закрыть</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

