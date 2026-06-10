import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ANIM = `
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.sc{animation:fadeUp .3s ease both}
.sc:nth-child(2){animation-delay:.06s}
.srow:hover{background:#F8FAFF!important}
.followbtn:hover{background:#EBF1FF!important;border-color:#C7D2FE!important;color:#375DFB!important}
`;

interface Follower {
  id: number; name: string; callsign: string; img: string;
  desc: string; online: boolean; isFollowing: boolean; joinDate: string;
}

const FOLLOWERS: Follower[] = [
  { id:1, name:'Вихрь',    callsign:'СС-2',   img:'/teacher1-small1.jpg', desc:'Майор • 1 288 подписчиков',    online:true,  isFollowing:false, joinDate:'3 апр 2025'  },
  { id:2, name:'Тайфун',   callsign:'ВДВ-9',  img:'/teacher1-small2.jpg', desc:'Ефрейтор • 344 подписчика',   online:true,  isFollowing:true,  joinDate:'10 мар 2025' },
  { id:3, name:'Лавина',   callsign:'ССО-5',  img:'/teacher2-main.jpg',   desc:'Сержант • 57 подписчиков',    online:false, isFollowing:false, joinDate:'1 мар 2025'  },
  { id:4, name:'Скала',    callsign:'КМБ-11', img:'/teacher1-small1.jpg', desc:'Рядовой • 12 подписчиков',    online:false, isFollowing:true,  joinDate:'20 фев 2025' },
  { id:5, name:'Метель',   callsign:'ВДВ-3',  img:'/teacher1-small2.jpg', desc:'Лейтенант • 902 подписчика',  online:true,  isFollowing:false, joinDate:'14 фев 2025' },
  { id:6, name:'Шторм',    callsign:'ВДМО-7', img:'/teacher2-main.jpg',   desc:'Майор • 3 400 подписчиков',   online:false, isFollowing:false, joinDate:'5 янв 2025'  },
  { id:7, name:'Гранит',   callsign:'СС-14',  img:'/teacher1-small1.jpg', desc:'Ефрейтор • 88 подписчиков',   online:true,  isFollowing:true,  joinDate:'29 дек 2024' },
  { id:8, name:'Поток',    callsign:'КМБ-2',  img:'/teacher1-small2.jpg', desc:'Рядовой • 5 подписчиков',     online:false, isFollowing:false, joinDate:'15 дек 2024' },
];

export function Subscribers() {
  const navigate = useNavigate();
  const [following, setFollowing] = useState<number[]>(FOLLOWERS.filter(f=>f.isFollowing).map(f=>f.id));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'mutual'|'new'>('all');

  const visible = FOLLOWERS.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.callsign.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==='all' || (filter==='mutual' && following.includes(f.id)) || (filter==='new' && f.joinDate.includes('2025'));
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ paddingTop:60, marginLeft:56, minHeight:'100vh', background:'#F8F9FB' }}>
      <style>{ANIM}</style>
      <div style={{ padding:'24px 24px 40px', maxWidth:860, margin:'0 auto' }}>

        <div className="sc" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#111', margin:0 }}>Подписчики</h1>
          </div>
          <div style={{ display:'flex', gap:6, fontSize:12, color:'#9CA3AF', alignItems:'center' }}>
            <span style={{ cursor:'pointer' }} onClick={()=>navigate('/')}>Главная</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
            <span style={{ color:'#374151', fontWeight:500 }}>Подписчики</span>
          </div>
        </div>

        {/* Stats */}
        <div className="sc" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
          {[
            { label:'Всего подписчиков', value:String(FOLLOWERS.length), icon:'users', color:'#375DFB' },
            { label:'Взаимные',          value:String(following.length),  icon:'mutual', color:'#10B981' },
            { label:'Новых за апрель',   value:String(FOLLOWERS.filter(f=>f.joinDate.includes('апр')).length), icon:'new', color:'#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', borderRadius:16, border:'1px solid #E5E7EB', padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:'#F8FAFF', color:s.color,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {s.icon === 'users' && <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.8"/></svg>}
                {s.icon === 'mutual' && <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12h8M13 7l5 5-5 5M11 17l-5-5 5-5"/></svg>}
                {s.icon === 'new' && <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8"/></svg>}
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:'#9CA3AF' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sc" style={{ background:'#fff', borderRadius:20, border:'1px solid #E5E7EB' }}>
          {/* Toolbar */}
          <div style={{ padding:'16px 24px', borderBottom:'1px solid #F5F5F7', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:6 }}>
              {([['all','Все'],['mutual','Взаимные'],['new','Новые']] as const).map(([val,lbl]) => (
                <button key={val} onClick={()=>setFilter(val)}
                  style={{ padding:'7px 14px', border:`1px solid ${filter===val?'#375DFB':'#E5E7EB'}`, borderRadius:20, background: filter===val?'#EBF1FF':'#F9FAFB', fontSize:12, fontWeight: filter===val?600:400, color: filter===val?'#375DFB':'#374151', cursor:'pointer', transition:'all .15s' }}>
                  {lbl}
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
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M9 16h6"/></svg>
                </div>
                <div style={{ fontSize:15, fontWeight:600, color:'#374151', marginBottom:6 }}>Никого не найдено</div>
                <div style={{ fontSize:13, color:'#9CA3AF' }}>Попробуйте изменить фильтр</div>
              </div>
            )}
            {visible.map((f, i) => {
              const isF = following.includes(f.id);
              return (
                <div key={f.id} className="srow"
                  style={{ display:'flex', alignItems:'center', gap:14, borderBottom: i<visible.length-1?'1px solid #F5F5F7':'none', borderRadius:8, margin:'0 -8px', padding:'14px 8px', transition:'background .15s' }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{ width:52, height:52, borderRadius:14, overflow:'hidden', background:'#F3F4F6', border:'1px solid #E5E7EB' }}>
                      <img src={f.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
                    </div>
                    {f.online && <div style={{ position:'absolute', bottom:2, right:2, width:10, height:10, borderRadius:'50%', background:'#10B981', border:'2px solid #fff' }}/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:'#111' }}>{f.name}</span>
                      {isF && <span style={{ fontSize:10, padding:'2px 7px', background:'#EBF1FF', color:'#375DFB', borderRadius:20, fontWeight:600 }}>Взаимная</span>}
                      {f.online && <span style={{ fontSize:10, color:'#10B981', fontWeight:600 }}>онлайн</span>}
                    </div>
                    <div style={{ fontSize:12, color:'#9CA3AF', marginBottom:1 }}>{f.callsign}</div>
                    <div style={{ fontSize:12, color:'#6B7280', display:'flex', gap:8, alignItems:'center' }}>
                      {f.desc}
                      <span style={{ color:'#D1D5DB' }}>·</span>
                      <span style={{ color:'#9CA3AF' }}>подписался {f.joinDate}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button onClick={()=>navigate('/profile')} style={{ padding:'7px 14px', background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:10, fontSize:12, color:'#374151', cursor:'pointer', transition:'all .15s' }}
                      onMouseEnter={e=>{e.currentTarget.style.background='#F3F4F6'}} onMouseLeave={e=>{e.currentTarget.style.background='#F9FAFB'}}>
                      Профиль
                    </button>
                    <button onClick={()=>setFollowing(p=>isF?p.filter(x=>x!==f.id):[...p,f.id])} className="followbtn"
                      style={{ padding:'7px 14px', background: isF?'#EBF1FF':'#fff', border:`1px solid ${isF?'#C7D2FE':'#E5E7EB'}`, borderRadius:10, fontSize:12, fontWeight:600, color: isF?'#375DFB':'#374151', cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap' as const }}>
                      {isF ? 'Подписан' : '+ Подписаться'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
