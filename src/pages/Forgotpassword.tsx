import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const COUNTRIES = [
  { flag:'🇷🇺', code:'+7' },
  { flag:'🇧🇾', code:'+375' },
  { flag:'🇰🇿', code:'+7' },
];

export function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [step, setStep] = useState<1|2|3|4>(1);
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [showCountry, setShowCountry] = useState(false);
  const [code, setCode] = useState(['','','','']);
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [err, setErr] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(()=>{ if(step===2&&timer>0){ const t=setInterval(()=>setTimer(v=>v-1),1000); return ()=>clearInterval(t); } },[step,timer]);

  const handleCodeInput = (i:number, v:string) => {
    if (v.length>1) v=v.slice(-1);
    const nc=[...code]; nc[i]=v; setCode(nc);
    if (v&&i<3) { const n=document.getElementById(`fp-code-${i+1}`); if(n)(n as HTMLInputElement).focus(); }
  };

  const handleNewPassword = () => {
    if (!pass1||!pass2) { setErr('Заполните оба поля'); return; }
    if (pass1!==pass2) { setErr('Пароли не совпадают'); return; }
    resetPassword(phone, pass1);
    setStep(4);
  };

  const goBack = () => {
    if (step>1) setStep(s=>(s-1) as any);
    else navigate('/login');
    setErr('');
  };

  const card = (children: React.ReactNode) => (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#0d0d0d', position:'relative', overflow:'hidden' }}>
      <img src="/login-bg.jpg" alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.55 }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', zIndex:1, padding:20 }}>
        <div style={{ background:'#fff', borderRadius:20, padding:'36px', width:'100%', maxWidth:420, boxShadow:'0 24px 60px rgba(0,0,0,.4)' }}>
          {children}
        </div>
      </div>
      <div style={{ textAlign:'center', padding:'16px 0', color:'rgba(255,255,255,.6)', fontSize:13, position:'relative', zIndex:1 }}>© УТЦ «ВОЕВОДА» 2015-2026</div>
    </div>
  );

  const backBtn = (
    <button onClick={goBack} style={{ width:36, height:36, borderRadius:10, border:'1px solid #E5E7EB', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151', marginBottom:16 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
  );

  // ── Step 4: Success ──
  if (step===4) return card(
    <>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', border:'3px solid #D1FAE5' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#111', margin:'0 0 20px' }}>Доступ восстановлен</h2>
        <div style={{ height:1, background:'#F0F0F0', marginBottom:20 }}/>
        <button onClick={()=>navigate('/login')} style={{ width:'100%', padding:'14px', background:'#375DFB', border:'none', borderRadius:12, color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:12 }}>Войти в портал</button>
        <button onClick={()=>navigate('/support')} style={{ background:'none', border:'none', color:'#6B7280', cursor:'pointer', fontSize:14 }}>Нужна помощь</button>
      </div>
    </>
  );

  // ── Step 3: New password ──
  if (step===3) return card(
    <>
      {backBtn}
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#111', margin:'0 0 6px' }}>Придумайте новый пароль</h2>
        <p style={{ fontSize:14, color:'#6B7280', margin:0 }}>Последний шаг восстановления</p>
      </div>
      <div style={{ height:1, background:'#F0F0F0', marginBottom:20 }}/>

      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:14, fontWeight:600, color:'#111', display:'block', marginBottom:6 }}>Придумайте новый пароль</label>
        <div style={{ position:'relative' }}>
          <input type={showP1?'text':'password'} value={pass1} onChange={e=>{setPass1(e.target.value);setErr('');}} placeholder="• • • • • • • • • •"
            style={{ width:'100%', padding:'12px 44px 12px 14px', border:'1px solid #E5E7EB', borderRadius:12, fontSize:15, outline:'none', boxSizing:'border-box' }} />
          <button type="button" onClick={()=>setShowP1(!showP1)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', display:'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>{showP1&&<line x1="4" y1="4" x2="20" y2="20"/>}</svg>
          </button>
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:14, fontWeight:600, color:'#111', display:'block', marginBottom:6 }}>Повторите</label>
        <div style={{ position:'relative' }}>
          <input type={showP2?'text':'password'} value={pass2} onChange={e=>{setPass2(e.target.value);setErr('');}} placeholder="• • • • • • • • • •"
            style={{ width:'100%', padding:'12px 44px 12px 14px', border:`1px solid ${err?'#EF4444':'#E5E7EB'}`, borderRadius:12, fontSize:15, outline:'none', boxSizing:'border-box' }} />
          <button type="button" onClick={()=>setShowP2(!showP2)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', display:'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>{showP2&&<line x1="4" y1="4" x2="20" y2="20"/>}</svg>
          </button>
        </div>
        {err && <div style={{ fontSize:13, color:'#EF4444', marginTop:6, display:'flex', alignItems:'center', gap:4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444" stroke="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="16" r="1" fill="#fff"/></svg>
          {err}
        </div>}
      </div>

      <button onClick={handleNewPassword} style={{ width:'100%', padding:'14px', background:'#375DFB', border:'none', borderRadius:12, color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer' }}>Продолжить</button>
    </>
  );

  // ── Step 2: SMS code ──
  if (step===2) return card(
    <>
      {backBtn}
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#111', margin:'0 0 6px' }}>Введите коди смс</h2>
        <p style={{ fontSize:14, color:'#6B7280', margin:0 }}>Код был отправлен на номер <strong>{country.code} {phone}</strong></p>
      </div>
      <div style={{ height:1, background:'#F0F0F0', marginBottom:24 }}/>
      <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:24 }}>
        {code.map((c,i)=>(
          <input key={i} id={`fp-code-${i}`} value={c} onChange={e=>handleCodeInput(i,e.target.value)} maxLength={1}
            style={{ width:64, height:64, textAlign:'center', fontSize:24, fontWeight:600, border:'1px solid #E5E7EB', borderRadius:12, outline:'none', boxSizing:'border-box' }}
            onFocus={e=>(e.currentTarget.style.borderColor='#375DFB')} onBlur={e=>(e.currentTarget.style.borderColor='#E5E7EB')} />
        ))}
      </div>
      <button onClick={()=>setStep(3)} style={{ width:'100%', padding:'14px', background:'#375DFB', border:'none', borderRadius:12, color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:16 }}>Продолжить</button>
      <div style={{ textAlign:'center' }}>
        <button onClick={()=>setTimer(60)} disabled={timer>0} style={{ background:'none', border:'none', color:timer>0?'#9CA3AF':'#111', cursor:timer>0?'default':'pointer', fontSize:14, fontWeight:500 }}>
          Отправить код еще раз{timer>0?`  ${String(Math.floor(timer/60)).padStart(2,'0')}:${String(timer%60).padStart(2,'0')}`:''}
        </button>
      </div>
    </>
  );

  // ── Step 1: Phone ──
  return card(
    <>
      {backBtn}
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#111', margin:'0 0 6px' }}>Восстановление пароля</h2>
        <p style={{ fontSize:14, color:'#6B7280', margin:0 }}>Введите номер телефона, который привязан к аккаунту</p>
      </div>
      <div style={{ height:1, background:'#F0F0F0', marginBottom:24 }}/>

      <div style={{ marginBottom:20 }}>
        <label style={{ fontSize:14, fontWeight:600, color:'#111', display:'block', marginBottom:6 }}>Мобильный номер <span style={{ color:'#EF4444' }}>*</span></label>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ position:'relative' }}>
            <button onClick={()=>setShowCountry(!showCountry)} style={{ display:'flex', alignItems:'center', gap:4, padding:'12px 10px', border:'1px solid #E5E7EB', borderRadius:12, background:'#fff', cursor:'pointer', fontSize:14, whiteSpace:'nowrap' }}>
              {country.flag} {country.code} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showCountry && (
              <div style={{ position:'absolute', top:'calc(100%+4px)', left:0, background:'#fff', border:'1px solid #E5E7EB', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,.1)', zIndex:50, overflow:'hidden', minWidth:120 }}>
                {COUNTRIES.map(c=>(
                  <button key={c.code+c.flag} onClick={()=>{setCountry(c);setShowCountry(false);}} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 12px', border:'none', background:'#fff', cursor:'pointer', fontSize:13 }}>{c.flag} {c.code}</button>
                ))}
              </div>
            )}
          </div>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(000) 000-00-00" style={{ flex:1, padding:'12px 14px', border:'1px solid #E5E7EB', borderRadius:12, fontSize:15, outline:'none', boxSizing:'border-box' }} />
        </div>
      </div>

      <button onClick={()=>{setStep(2);setTimer(60);}} style={{ width:'100%', padding:'14px', background:'#375DFB', border:'none', borderRadius:12, color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:12 }}>Продолжить</button>
      <div style={{ textAlign:'center' }}>
        <button onClick={()=>navigate('/support')} style={{ background:'none', border:'none', color:'#6B7280', cursor:'pointer', fontSize:14 }}>Не получается восстановить</button>
      </div>
    </>
  );
}