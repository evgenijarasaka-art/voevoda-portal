import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.rp-card{animation:fadeUp .35s ease both}
.rp-input:focus{border-color:#375DFB!important;box-shadow:0 0 0 3px rgba(55,93,251,.08)!important;outline:none}
.rp-btn{transition:background .15s,transform .1s}
.rp-btn:hover{transform:translateY(-1px)}
.rp-btn:active{transform:translateY(0)}
`;

function injectCss() {
  if (document.getElementById('rp-css')) return;
  const s = document.createElement('style'); s.id = 'rp-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

interface Strength { score: number; label: string; color: string }

function getStrength(pass: string): Strength {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  if (score === 0) return { score: 0, label: '', color: '#E5E7EB' };
  if (score === 1) return { score: 1, label: 'Слабый', color: '#EF4444' };
  if (score === 2) return { score: 2, label: 'Средний', color: '#F59E0B' };
  if (score === 3) return { score: 3, label: 'Хороший', color: '#3B82F6' };
  return { score: 4, label: 'Надёжный', color: '#10B981' };
}

export function RestorePassword() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  injectCss();

  const strength = getStrength(pass1);

  const handleSubmit = () => {
    if (!current) { setErr('Введите текущий пароль'); return; }
    if (!pass1) { setErr('Введите новый пароль'); return; }
    if (pass1.length < 8) { setErr('Пароль должен быть не короче 8 символов'); return; }
    if (pass1 !== pass2) { setErr('Пароли не совпадают'); return; }
    setErr('');
    setDone(true);
  };

  const eye = (show: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
        {show && <line x1="4" y1="4" x2="20" y2="20"/>}
      </svg>
    </button>
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 60px' }}>
      <button
        onClick={() => navigate('/edit-profile')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Редактировать профиль
      </button>

      <div className="rp-card" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 18, padding: '28px 28px 24px' }}>
        {done ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #D1FAE5' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>Пароль изменён</div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>Новый пароль сохранён. При следующем входе используйте его.</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="rp-btn" onClick={() => navigate('/profile')} style={{ padding: '10px 20px', background: '#375DFB', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Перейти в профиль
              </button>
              <button className="rp-btn" onClick={() => navigate('/settings')} style={{ padding: '10px 20px', background: '#F3F4F6', border: 'none', borderRadius: 10, color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Настройки
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Смена пароля</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 22 }}>Придумайте надёжный пароль длиной не менее 8 символов</div>

            {/* Current password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Текущий пароль</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="rp-input"
                  type={showCurrent ? 'text' : 'password'}
                  value={current}
                  onChange={e => { setCurrent(e.target.value); setErr(''); }}
                  placeholder="Введите текущий пароль"
                  style={{ width: '100%', padding: '11px 42px 11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 11, fontSize: 14, boxSizing: 'border-box', transition: 'border-color .2s,box-shadow .2s' }}
                />
                {eye(showCurrent, () => setShowCurrent(!showCurrent))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{ marginTop: 6, background: 'none', border: 'none', color: '#375DFB', cursor: 'pointer', fontSize: 12, padding: 0 }}
              >
                Не помню текущий пароль
              </button>
            </div>

            <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0 18px' }} />

            {/* New password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Новый пароль</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="rp-input"
                  type={showP1 ? 'text' : 'password'}
                  value={pass1}
                  onChange={e => { setPass1(e.target.value); setErr(''); }}
                  placeholder="Минимум 8 символов"
                  style={{ width: '100%', padding: '11px 42px 11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 11, fontSize: 14, boxSizing: 'border-box', transition: 'border-color .2s,box-shadow .2s' }}
                />
                {eye(showP1, () => setShowP1(!showP1))}
              </div>
              {pass1 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= strength.score ? strength.color : '#E5E7EB', transition: 'background .3s' }} />
                    ))}
                  </div>
                  {strength.label && <div style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</div>}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: err ? 12 : 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Повторите новый пароль</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="rp-input"
                  type={showP2 ? 'text' : 'password'}
                  value={pass2}
                  onChange={e => { setPass2(e.target.value); setErr(''); }}
                  placeholder="Повторите пароль"
                  style={{ width: '100%', padding: '11px 42px 11px 14px', border: `1.5px solid ${pass2 && pass2 !== pass1 ? '#EF4444' : '#E5E7EB'}`, borderRadius: 11, fontSize: 14, boxSizing: 'border-box', transition: 'border-color .2s,box-shadow .2s' }}
                />
                {eye(showP2, () => setShowP2(!showP2))}
              </div>
            </div>

            {err && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#EF4444', marginBottom: 14 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444" stroke="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="16" r="1" fill="#fff"/></svg>
                {err}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="rp-btn" type="button" onClick={() => navigate(-1)} style={{ flex: 1, padding: '11px', border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Отмена
              </button>
              <button className="rp-btn" type="button" onClick={handleSubmit} style={{ flex: 2, padding: '11px', border: 'none', borderRadius: 10, background: '#375DFB', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Изменить пароль
              </button>
            </div>
          </>
        )}
      </div>

      {/* Tips */}
      <div className="rp-card" style={{ marginTop: 16, background: '#F8FAFF', border: '1.5px solid #C7D2FE', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Советы по безопасности:</div>
        {[
          'Используйте не менее 8 символов',
          'Добавьте заглавные буквы и цифры',
          'Не используйте один пароль на нескольких сайтах',
          'Не передавайте пароль третьим лицам',
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: '#6B7280', marginBottom: i < 3 ? 5 : 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20 6 9 17 4 12"/></svg>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
