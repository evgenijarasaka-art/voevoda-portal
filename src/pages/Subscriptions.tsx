import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ANIM = `
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.sc{animation:fadeUp .3s ease both}
.sc:nth-child(2){animation-delay:.06s}
.sc:nth-child(3){animation-delay:.12s}
.srow:hover{background:#F8FAFF!important}
.subbtn:hover{background:#DFE8FF!important;border-color:#A5B4FC!important}
.unsubbtn:hover{background:#FEE2E2!important;border-color:#FCA5A5!important;color:#EF4444!important}
`;

type SubTab = 'people' | 'communities' | 'authors';

interface Sub {
  id: number; name: string; callsign: string; img: string;
  kind: SubTab; desc: string; online: boolean; mutual: boolean;
}

const ALL_SUBS: Sub[] = [
  { id:1, name:'Гром',    callsign:'ВДВ-12',  img:'/teacher1-small1.jpg', kind:'people',      desc:'Майор • 12 курсов пройдено',          online:true,  mutual:true  },
  { id:2, name:'Буря',    callsign:'СС-7',    img:'/teacher1-small2.jpg', kind:'people',      desc:'Сержант • Военная подготовка',         online:false, mutual:false },
  { id:3, name:'Сокол',   callsign:'ВДМО-3',  img:'/teacher2-main.jpg',   kind:'people',      desc:'Лейтенант • Тактика и медицина',       online:true,  mutual:true  },
  { id:4, name:'Российское Военно-Историческое Общество', callsign:'РВИО', img:'/soobsh1.png', kind:'communities', desc:'4 821 участник • Москва',  online:false, mutual:false },
  { id:5, name:'Силы специальных операций', callsign:'ССО', img:'/soobsh2.png', kind:'communities', desc:'2 340 участника • Россия', online:false, mutual:false },
  { id:6, name:'Боевое братство', callsign:'ВДВ', img:'/soobsh3.png', kind:'communities', desc:'8 100 участников • Россия', online:false, mutual:false },
  { id:7, name:'Иванов А.В.', callsign:'Инструктор', img:'/teacher1-small1.jpg', kind:'authors', desc:'Автор 6 курсов • 2 481 подписчик', online:true,  mutual:false },
  { id:8, name:'Петров В.С.', callsign:'Методист',   img:'/teacher1-small2.jpg', kind:'authors', desc:'Автор 3 курсов • 891 подписчик',  online:false, mutual:false },
];

export function Subscriptions() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SubTab>('people');
  const [unsub, setUnsub] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  const visible = ALL_SUBS.filter(s =>
    s.kind === tab &&
    !unsub.includes(s.id) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.callsign.toLowerCase().includes(search.toLowerCase()))
  );

  const TAB_LABELS: Record<SubTab,string> = {
    people:      'Люди',
    communities: 'Сообщества',
    authors:     'Авторы курсов',
  };

  return (
    <div style={{ paddingTop:60, marginLeft:56, minHeight:'100vh', background:'#F8F9FB' }}>
      <style>{ANIM}</style>
      <div style={{ padding:'24px 24px 40px', maxWidth:860, margin:'0 auto' }}>

        <div className="sc" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#111', margin:0 }}>Подписки</h1>
          </div>
          <div style={{ display:'flex', gap:6, fontSize:12, color:'#9CA3AF', alignItems:'center' }}>
            <span style={{ cursor:'pointer' }} onClick={()=>navigate('/')}>Главная</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
            <span style={{ color:'#374151', fontWeight:500 }}>Подписки</span>
          </div>
        </div>

        <div className="sc" style={{ background:'#fff', borderRadius:20, border:'1px solid #E5E7EB' }}>
          {/* Toolbar */}
          <div style={{ padding:'16px 24px', borderBottom:'1px solid #F5F5F7', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:4, background:'#F3F4F6', borderRadius:12, padding:4 }}>
              {(Object.keys(TAB_LABELS) as SubTab[]).map(t => (
                <button key={t} onClick={()=>setTab(t)}
                  style={{ padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight: tab===t?700:500, background: tab===t?'#fff':'transparent', color: tab===t?'#111':'#6B7280', boxShadow: tab===t?'0 1px 4px rgba(0,0,0,.08)':'none', transition:'all .15s', whiteSpace:'nowrap' as const }}>
                  {TAB_LABELS[t]}
                  <span style={{ marginLeft:6, padding:'1px 7px', borderRadius:20, background: tab===t?'#EBF1FF':'#E5E7EB', color: tab===t?'#375DFB':'#9CA3AF', fontSize:11, fontWeight:600 }}>
                    {ALL_SUBS.filter(s=>s.kind===t&&!unsub.includes(s.id)).length}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ position:'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск..." style={{ padding:'8px 12px 8px 32px', border:'1px solid #E5E7EB', borderRadius:10, fontSize:13, outline:'none', width:200, boxSizing:'border-box' as const }} onFocus={e=>(e.target.style.borderColor='#375DFB')} onBlur={e=>(e.target.style.borderColor='#E5E7EB')} />
            </div>
          </div>

          <div style={{ padding:'0 24px' }}>
            {visible.length === 0 && (
              <div style={{ padding:'48px 0', textAlign:'center' }}>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.7" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
                </div>
                <div style={{ fontSize:15, fontWeight:600, color:'#374151', marginBottom:6 }}>Нет подписок</div>
                <div style={{ fontSize:13, color:'#9CA3AF' }}>Попробуйте изменить фильтр или поисковый запрос</div>
              </div>
            )}
            {visible.map((s, i) => (
              <div key={s.id} className="srow"
                style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom: i<visible.length-1?'1px solid #F5F5F7':'none', borderRadius:8, margin:'0 -8px', transition:'background .15s' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:52, height:52, borderRadius:14, overflow:'hidden', background:'#F3F4F6', border:'1px solid #E5E7EB' }}>
                    <img src={s.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
                  </div>
                  {s.online && <div style={{ position:'absolute', bottom:2, right:2, width:10, height:10, borderRadius:'50%', background:'#10B981', border:'2px solid #fff' }}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#111' }}>{s.name}</span>
                    {s.mutual && <span style={{ fontSize:10, padding:'2px 7px', background:'#EBF1FF', color:'#375DFB', borderRadius:20, fontWeight:600 }}>Взаимная</span>}
                    {s.online && <span style={{ fontSize:10, color:'#10B981', fontWeight:600 }}>онлайн</span>}
                  </div>
                  <div style={{ fontSize:12, color:'#9CA3AF' }}>{s.callsign}</div>
                  <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{s.desc}</div>
                </div>
                <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                  <button onClick={()=>navigate(s.kind==='communities'?'/communities':'/profile')} className="subbtn"
                    style={{ padding:'7px 14px', background:'#EBF1FF', border:'1px solid #C7D2FE', borderRadius:10, fontSize:12, fontWeight:600, color:'#375DFB', cursor:'pointer', transition:'all .15s' }}>
                    Перейти
                  </button>
                  <button onClick={()=>setUnsub(p=>[...p,s.id])} className="unsubbtn"
                    style={{ padding:'7px 14px', background:'#fff', border:'1px solid #E5E7EB', borderRadius:10, fontSize:12, color:'#6B7280', cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap' as const }}>
                    Отписаться
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
