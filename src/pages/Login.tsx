import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_ACCOUNTS, useAuth } from '../hooks/useAuth';
import { useMediaQuery } from '../useMediaQuery';

export function Login() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 820px)');
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const fillDemo = (loginName = 'tornado') => {
    const demo = DEMO_ACCOUNTS.find(acc => acc.login === loginName) ?? DEMO_ACCOUNTS[0];
    setUsername(demo.login);
    setPassword(demo.password);
    setError('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Заполните логин и пароль');
      return;
    }
    const ok = login(username, password);
    if (ok) navigate('/');
    else setError('Неверный логин или пароль');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0E1424', position: 'relative', overflow: 'hidden' }}>
      <img src="/login-bg.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .46 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(14,20,36,.96) 0%, rgba(14,20,36,.78) 48%, rgba(14,20,36,.9) 100%)' }} />

      <button
        type="button"
        onClick={() => navigate('/')}
        style={{ position: 'relative', zIndex: 2, margin: isMobile ? '18px 18px 0' : '26px 34px 0', display: 'inline-flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', padding: 0 }}
      >
        <span style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', overflow: 'hidden', display: 'inline-flex' }}>
          <img src="/footer-logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </span>
        <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: .2 }}>УТЦ «ВОЕВОДА»</span>
      </button>

      <main
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: 'calc(100vh - 72px)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(360px, 520px) minmax(360px, 460px)',
          gap: isMobile ? 24 : 64,
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '28px 18px 24px' : '34px 42px 42px',
        }}
      >
        <section style={{ color: '#fff', maxWidth: 560 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: 'rgba(55,93,251,.22)', border: '1px solid rgba(123,159,255,.32)', color: '#AFC2FF', fontSize: 13, fontWeight: 800, marginBottom: 20 }}>
            Личный кабинет
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: isMobile ? 34 : 46, lineHeight: 1.08, fontWeight: 950 }}>
            Вход в учебный портал
          </h1>
          <p style={{ margin: '0 0 28px', color: 'rgba(255,255,255,.72)', fontSize: 16, lineHeight: 1.75 }}>
            Курсы, расписание, домашние задания, материалы и прогресс обучения доступны после авторизации.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
            {[
              ['16', 'занятий в курсе'],
              ['33%', 'прогресс обучения'],
              ['24/7', 'доступ к материалам'],
            ].map(([value, label]) => (
              <div key={label} style={{ border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 24, fontWeight: 950, color: '#fff', marginBottom: 3 }}>{value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.62)' }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: '#fff', borderRadius: 18, padding: isMobile ? '26px 22px' : '32px 30px', boxShadow: '0 30px 80px rgba(0,0,0,.34)', border: '1px solid rgba(255,255,255,.22)' }}>
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 900, color: '#111827' }}>Войти в аккаунт</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#6B7280', lineHeight: 1.55 }}>Введите данные или используйте демонстрационный доступ.</p>
          </div>

          <button
            type="button"
            onClick={() => fillDemo()}
            style={{ width: '100%', border: '1px solid #C7D2FE', background: '#F0F4FF', color: '#375DFB', borderRadius: 12, padding: '11px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer', marginBottom: 18 }}
          >
            Заполнить демо-доступ
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 8, marginBottom: 18 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.login}
                type="button"
                onClick={() => fillDemo(acc.login)}
                title={`Войти как ${acc.callsign}`}
                style={{
                  border: username === acc.login ? '1.5px solid #375DFB' : '1px solid #E5E7EB',
                  background: username === acc.login ? '#EEF3FF' : '#fff',
                  color: username === acc.login ? '#375DFB' : '#475569',
                  borderRadius: 10,
                  padding: '9px 8px',
                  fontSize: 12,
                  fontWeight: 850,
                  cursor: 'pointer',
                }}
              >
                {acc.callsign}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 7, display: 'block' }}>Логин</span>
              <input
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="tornado"
                autoComplete="username"
                style={{ width: '100%', padding: '13px 14px', border: `1.5px solid ${error ? '#EF4444' : '#E5E7EB'}`, borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#375DFB')}
                onBlur={e => (e.currentTarget.style.borderColor = error ? '#EF4444' : '#E5E7EB')}
              />
            </label>

            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 7, display: 'block' }}>Пароль</span>
              <span style={{ position: 'relative', display: 'block' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="voevoda123"
                  autoComplete="current-password"
                  style={{ width: '100%', padding: '13px 46px 13px 14px', border: `1.5px solid ${error ? '#EF4444' : '#E5E7EB'}`, borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#375DFB')}
                  onBlur={e => (e.currentTarget.style.borderColor = error ? '#EF4444' : '#E5E7EB')}
                />
                <button type="button" title={showPass ? 'Скрыть пароль' : 'Показать пароль'} onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, border: 'none', borderRadius: 8, background: '#F3F4F6', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {showPass && <path d="M4 4l16 16" />}
                  </svg>
                </button>
              </span>
            </label>

            {error && <div style={{ fontSize: 13, color: '#B91C1C', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px' }}>{error}</div>}

            <button type="submit" style={{ width: '100%', padding: '14px', background: '#375DFB', border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 28px rgba(55,93,251,.32)' }}>
              Войти
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontSize: 13 }}>
              <button type="button" onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: '#111827', cursor: 'pointer', padding: 0, fontWeight: 800 }}>Создать аккаунт</button>
              <button type="button" onClick={() => navigate('/forgot-password')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 0 }}>Забыли пароль?</button>
            </div>
          </form>

          <div style={{ height: 1, background: '#E5E7EB', margin: '22px 0 14px' }} />
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
            <button type="button" onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 0 }}>Политика конфиденциальности</button>
            <button type="button" onClick={() => navigate('/terms')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 0 }}>Пользовательское соглашение</button>
          </div>
        </section>
      </main>
    </div>
  );
}
