import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SLIDES = ['/register-slide-1.jpg','/register-slide-2.jpg','/register-slide-3.jpg'];
const COUNTRIES = [
  { flag:'🇷🇺', code:'+7', name:'Россия' },
  { flag:'🇧🇾', code:'+375', name:'Беларусь' },
  { flag:'🇰🇿', code:'+7', name:'Казахстан' },
];

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [step, setStep] = useState<'form'|'verify'|'done'>('form');
  const [slide, setSlide] = useState(0);
  const [form, setForm] = useState({ name:'', surname:'', login:'', email:'', phone:'', password:'', passwordConfirm:'' });
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [showCountry, setShowCountry] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [code, setCode] = useState(['','','','']);
  const [timer, setTimer] = useState(60);
  const [showPass, setShowPass] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  useEffect(()=>{ const t=setInterval(()=>setSlide(s=>(s+1)%SLIDES.length),5000); return ()=>clearInterval(t); },[]);
  useEffect(()=>{ if(step==='verify'&&timer>0){ const t=setInterval(()=>setTimer(v=>v-1),1000); return ()=>clearInterval(t); } },[step,timer]);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim()) e.name = 'Обязательное поле';
    if (!form.login.trim()) e.login = 'Обязательное поле';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.login)) e.login = 'Логин должен быть написан латиницей';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Проверьте правильность написания почты';
    if (!form.phone.trim()) e.phone = 'Обязательное поле';
    if (!form.password) e.password = 'Обязательное поле';
    else if (form.password.length < 8) e.password = 'Минимум 8 символов';
    if (!form.passwordConfirm) e.passwordConfirm = 'Обязательное поле';
    else if (form.password !== form.passwordConfirm) e.passwordConfirm = 'Пароли не совпадают';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendCode = () => {
    if (!validate()) return;
    setStep('verify');
    setTimer(60);
  };

  const handleVerify = () => {
    registerUser({ ...form, phone: `${country.code} ${form.phone}` });
    setStep('done');
  };

  const handleCodeInput = (i: number, v: string) => {
    if (v.length > 1) v = v.slice(-1);
    const nc = [...code]; nc[i] = v; setCode(nc);
    if (v && i < 3) { const next = document.getElementById(`reg-code-${i+1}`); if (next) (next as HTMLInputElement).focus(); }
  };

  const inputStyle = (field: string) => ({
    width:'100%', padding:'12px 14px', border:`1px solid ${errors[field]?'#EF4444':'#E5E7EB'}`, borderRadius:12, fontSize:15, outline:'none', boxSizing:'border-box' as const, background:'#fff',
  });

  const EyeIcon = ({ show }: { show: boolean }) => show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  );

  // ── DONE ──
  if (step === 'done') return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#0d0d0d', position:'relative', overflow:'hidden' }}>
      <img src="/register-slide-2.jpg" alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.55 }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', zIndex:1, padding:20 }}>
        <div style={{ background:'#fff', borderRadius:20, padding:'48px 36px', width:'100%', maxWidth:420, textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,.4)' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', border:'3px solid #D1FAE5' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize:22, fontWeight:700, color:'#111', margin:'0 0 8px' }}>Регистрация завершена!</h2>
          <p style={{ fontSize:14, color:'#6B7280', margin:'0 0 8px' }}>Вы можете войти с указанным логином и паролем</p>
          <div style={{ height:1, background:'#F0F0F0', margin:'20px 0' }}/>
          <button onClick={()=>navigate('/login')} style={{ width:'100%', padding:'14px', background:'#375DFB', border:'none', borderRadius:12, color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:12 }}>Войти в портал</button>
          <button onClick={()=>navigate('/support')} style={{ background:'none', border:'none', color:'#6B7280', cursor:'pointer', fontSize:14 }}>Нужна помощь</button>
        </div>
      </div>
      <div style={{ textAlign:'center', padding:'16px 0', color:'rgba(255,255,255,.6)', fontSize:13, position:'relative', zIndex:1 }}>© УТЦ «ВОЕВОДА» 2015-2026</div>
    </div>
  );

  // ── VERIFY ──
  if (step === 'verify') return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#0d0d0d', position:'relative', overflow:'hidden' }}>
      <img src="/register-slide-3.jpg" alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.55 }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', zIndex:1, padding:20 }}>
        <div style={{ background:'#fff', borderRadius:20, padding:'40px 36px', width:'100%', maxWidth:420, textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,.4)' }}>
          <h2 style={{ fontSize:22, fontWeight:700, color:'#111', margin:'0 0 8px' }}>Верификация аккаунта</h2>
          <p style={{ fontSize:14, color:'#6B7280', margin:'0 0 24px' }}>Код был отправлен на номер <strong>{country.code} {form.phone}</strong></p>
          <div style={{ height:1, background:'#F0F0F0', marginBottom:24 }}/>
          <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:24 }}>
            {code.map((c,i)=>(
              <input key={i} id={`reg-code-${i}`} value={c} onChange={e=>handleCodeInput(i,e.target.value)} maxLength={1}
                style={{ width:64, height:64, textAlign:'center', fontSize:24, fontWeight:600, border:'1px solid #E5E7EB', borderRadius:12, outline:'none', boxSizing:'border-box' }}
                onFocus={e=>(e.currentTarget.style.borderColor='#375DFB')} onBlur={e=>(e.currentTarget.style.borderColor='#E5E7EB')} />
            ))}
          </div>
          <button onClick={handleVerify} style={{ width:'100%', padding:'14px', background:'#375DFB', border:'none', borderRadius:12, color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:16 }}>Зарегистрироваться</button>
          <button onClick={()=>setTimer(60)} disabled={timer>0} style={{ background:'none', border:'none', color:timer>0?'#9CA3AF':'#111', cursor:timer>0?'default':'pointer', fontSize:14, fontWeight:500 }}>
            Отправить код еще раз{timer>0?` ${String(Math.floor(timer/60)).padStart(2,'0')}:${String(timer%60).padStart(2,'0')}`:' '}
          </button>
        </div>
      </div>
      <div style={{ textAlign:'center', padding:'16px 0', color:'rgba(255,255,255,.6)', fontSize:13, position:'relative', zIndex:1 }}>© УТЦ «ВОЕВОДА» 2015-2026</div>
    </div>
  );

  // ── FORM ──
  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', background:'#111' }}>
      {/* Left */}
      <div style={{ display:'flex', flexDirection:'column', padding:'32px 48px', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
          <img src="/logo.png" alt="" style={{ width:36, height:36, objectFit:'contain' }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />
          <span style={{ fontSize:16, fontWeight:700, color:'#fff' }}>УТЦ Воевода</span>
        </div>

        <div style={{ flex:1, display:'flex', alignItems:'center' }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'28px 32px', width:'100%', maxWidth:460 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:700, color:'#111' }}>Регистрация</div>
                <div style={{ fontSize:13, color:'#6B7280' }}>Укажите свои данные</div>
              </div>
            </div>
            <div style={{ height:1, background:'#F0F0F0', margin:'16px 0' }}/>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#111', display:'block', marginBottom:5 }}>Имя <span style={{ color:'#EF4444' }}>*</span></label>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Иван" style={inputStyle('name')} />
                {errors.name && <div style={{ fontSize:12, color:'#EF4444', marginTop:3 }}>{errors.name}</div>}
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#111', display:'block', marginBottom:5 }}>Фамилия</label>
                <input value={form.surname} onChange={e=>setForm(p=>({...p,surname:e.target.value}))} placeholder="Иванов" style={inputStyle('surname')} />
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#111', display:'block', marginBottom:5 }}>Логин <span style={{ color:'#EF4444' }}>*</span></label>
              <input value={form.login} onChange={e=>setForm(p=>({...p,login:e.target.value}))} placeholder="voevoda_ivan" style={inputStyle('login')} />
              {errors.login && <div style={{ fontSize:12, color:'#EF4444', marginTop:3, display:'flex', alignItems:'center', gap:4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#EF4444" stroke="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="16" r="1" fill="#fff"/></svg>
                {errors.login}
              </div>}
            </div>

            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#111', display:'block', marginBottom:5 }}>Электронная почта</label>
              <input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="pochta@voevoda.ru" style={inputStyle('email')} />
              {errors.email && <div style={{ fontSize:12, color:'#EF4444', marginTop:3 }}>{errors.email}</div>}
            </div>

            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#111', display:'block', marginBottom:5 }}>Мобильный номер <span style={{ color:'#EF4444' }}>*</span></label>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ position:'relative' }}>
                  <button onClick={()=>setShowCountry(!showCountry)} style={{ display:'flex', alignItems:'center', gap:4, padding:'12px 10px', border:'1px solid #E5E7EB', borderRadius:12, background:'#fff', cursor:'pointer', fontSize:14, whiteSpace:'nowrap' }}>
                    {country.flag} {country.code} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {showCountry && (
                    <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, background:'#fff', border:'1px solid #E5E7EB', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,.1)', zIndex:50, overflow:'hidden', minWidth:140 }}>
                      {COUNTRIES.map(c=>(
                        <button key={c.code+c.name} onClick={()=>{setCountry(c);setShowCountry(false);}} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 12px', border:'none', background:country.name===c.name?'#EBF1FF':'#fff', cursor:'pointer', fontSize:13, textAlign:'left' }}>{c.flag} {c.name} {c.code}</button>
                      ))}
                    </div>
                  )}
                </div>
                <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="(000) 000-00-00" style={{ ...inputStyle('phone'), flex:1 }} />
              </div>
              {errors.phone && <div style={{ fontSize:12, color:'#EF4444', marginTop:3 }}>{errors.phone}</div>}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#111', display:'block', marginBottom:5 }}>Пароль <span style={{ color:'#EF4444' }}>*</span></label>
                <div style={{ position:'relative' }}>
                  <input type={showPass?'text':'password'} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="Минимум 8 символов" style={{ ...inputStyle('password'), paddingRight:42 }} />
                  <button onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex' }}>
                    <EyeIcon show={showPass} />
                  </button>
                </div>
                {errors.password && <div style={{ fontSize:12, color:'#EF4444', marginTop:3 }}>{errors.password}</div>}
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#111', display:'block', marginBottom:5 }}>Повторите пароль <span style={{ color:'#EF4444' }}>*</span></label>
                <div style={{ position:'relative' }}>
                  <input type={showPassConfirm?'text':'password'} value={form.passwordConfirm} onChange={e=>setForm(p=>({...p,passwordConfirm:e.target.value}))} placeholder="Повторите пароль" style={{ ...inputStyle('passwordConfirm'), paddingRight:42 }} />
                  <button onClick={()=>setShowPassConfirm(!showPassConfirm)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex' }}>
                    <EyeIcon show={showPassConfirm} />
                  </button>
                </div>
                {errors.passwordConfirm && <div style={{ fontSize:12, color:'#EF4444', marginTop:3 }}>{errors.passwordConfirm}</div>}
              </div>
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button onClick={()=>navigate('/login')} style={{ flex:1, padding:'13px', background:'#fff', border:'1px solid #E5E7EB', borderRadius:12, fontSize:15, fontWeight:600, color:'#111', cursor:'pointer' }}>Есть аккаунт</button>
              <button onClick={handleSendCode} style={{ flex:1.3, padding:'13px', background:'#375DFB', border:'none', borderRadius:12, fontSize:15, fontWeight:700, color:'#fff', cursor:'pointer' }}>Отправить код</button>
            </div>
          </div>
        </div>

        <div style={{ color:'rgba(255,255,255,.5)', fontSize:13, marginTop:20 }}>© УТЦ «ВОЕВОДА» 2015-2026</div>
      </div>

      {/* Right - image slider */}
      <div style={{ position:'relative', overflow:'hidden', borderRadius:'24px 0 0 24px' }}>
        {SLIDES.map((src,i)=>(
          <img key={i} src={src} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:slide===i?1:0, transition:'opacity .8s ease' }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />
        ))}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(0deg, rgba(0,0,0,.7) 0%, transparent 100%)', padding:'60px 40px 40px', zIndex:2 }}>
          <h2 style={{ fontSize:28, fontWeight:700, color:'#fff', margin:'0 0 10px' }}>Вступай в сообщество патриотов России 🇷🇺</h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.8)', margin:0 }}>Общайся с единомышленниками, заводи друзей<br/>по всей стране и совершенствуй свои навыки</p>
        </div>
        <div style={{ position:'absolute', bottom:24, right:40, display:'flex', gap:8, zIndex:3 }}>
          {SLIDES.map((_,i)=>(
            <button key={i} onClick={()=>setSlide(i)} style={{ width:10, height:10, borderRadius:'50%', border:'none', background:slide===i?'#375DFB':'rgba(255,255,255,.5)', cursor:'pointer', transition:'background .3s' }}/>
          ))}
        </div>
      </div>
    </div>
  );
}
