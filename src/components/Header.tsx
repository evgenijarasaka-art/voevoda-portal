import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifStore } from '../store/useNotifStore';
import { useCartStore } from '../store/useCartStore';

const CITIES = ['Москва', 'Санкт-Петербург', 'Краснодар', 'Екатеринбург', 'Казань'];

function injectA11yStyles() {
  if (document.querySelector('[data-a11y-css]')) return;
  const s = document.createElement('style');
  s.setAttribute('data-a11y-css', '1');
  s.textContent = `
    html[data-a11y-size="large"] #root { zoom: 1.12; }
    html[data-a11y-size="xl"]    #root { zoom: 1.28; }
    html[data-contrast="high"] * {
      -webkit-text-stroke: 0 !important;
      text-shadow:
        0.4px  0.4px 0 currentColor,
        -0.4px -0.4px 0 currentColor,
        0.4px -0.4px 0 currentColor,
        -0.4px  0.4px 0 currentColor !important;
    }
    html[data-contrast="high"] img,
    html[data-contrast="high"] video,
    html[data-contrast="high"] canvas,
    html[data-contrast="high"] svg {
      -webkit-text-stroke: unset !important;
      text-shadow: none !important;
    }
    html[data-contrast="high"] button,
    html[data-contrast="high"] a {
      -webkit-text-stroke: 1px currentColor !important;
      text-shadow: 0 0 0.8px currentColor, 0 0 1.5px currentColor !important;
    }
    html[data-contrast="high"] h1,
    html[data-contrast="high"] h2,
    html[data-contrast="high"] h3 {
      -webkit-text-stroke: 1.2px currentColor !important;
      text-shadow: 0 0 1px currentColor, 0 0 2px currentColor !important;
    }
  `;
  document.head.appendChild(s);
}

export function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const { isAuthenticated, user, logout } = useAuth();
  const unreadCount = useNotifStore(s => s.unreadCount());
  const cartCount = useCartStore(s => s.items.length);
  const [city, setCity] = useState('Москва');
  const [showCityDrop, setShowCityDrop] = useState(false);
  const [showA11y, setShowA11y] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const [contrast, setContrast] = useState<'normal' | 'high'>('normal');

  useEffect(() => { injectA11yStyles(); }, []);

  const applyFont = (size: 'normal' | 'large' | 'xl') => {
    setFontSize(size);
    if (size === 'normal') {
      document.documentElement.removeAttribute('data-a11y-size');
    } else {
      document.documentElement.setAttribute('data-a11y-size', size);
    }
  };

  const applyContrast = (c: 'normal' | 'high') => {
    setContrast(c);
    if (c === 'high') {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
  };

  const resetA11y = () => {
    applyFont('normal');
    applyContrast('normal');
    setShowA11y(false);
  };

  const panelActive = fontSize !== 'normal' || contrast !== 'normal';

  return (
    <>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 60, background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>

        {/* Логотип — скрыт на главной */}
        {!isHome && (
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', background: '#F3F4F6', border: '1px solid #E5E7EB', flexShrink: 0 }}>
              <img src="/logo.png" alt="УТЦ Воевода" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>УТЦ Воевода</span>
          </div>
        )}

        {/* Поиск — на главной растягивается на всю доступную ширину */}
        <div style={{ flex: 1, maxWidth: 540, position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input placeholder="Поиск по сервису"
            style={{ width: '100%', padding: '9px 14px 9px 38px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', background: '#F9FAFB', color: '#111', boxSizing: 'border-box' as const }}
            onFocus={e => (e.currentTarget.style.borderColor = '#375DFB')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')} />
        </div>

        {/* Правая сторона */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginLeft: 'auto' }}>

          {/* Версия для слабовидящих */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowA11y(!showA11y)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: panelActive ? '#EBF1FF' : 'none', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: panelActive ? '#375DFB' : '#6B7280', fontSize: 13, transition: 'all .15s' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              Версия для слабовидящих
              {panelActive && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#375DFB', flexShrink: 0 }} />}
            </button>

            {showA11y && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,.12)', padding: 20, width: 300, zIndex: 500 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>Версия для слабовидящих</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 18 }}>Настройте отображение под свои нужды</div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 10, letterSpacing: '.4px', textTransform: 'uppercase' as const }}>РАЗМЕР ШРИФТА</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['normal', 'large', 'xl'] as const).map((val, i) => {
                      const labels = ['Обычный', 'Крупный', 'Очень крупный'];
                      const sizes = ['14px', '18px', '22px'];
                      return (
                        <button key={val} onClick={() => applyFont(val)}
                          style={{ flex: 1, padding: '8px 4px', border: `1.5px solid ${fontSize === val ? '#375DFB' : '#E5E7EB'}`, borderRadius: 10, background: fontSize === val ? '#EBF1FF' : '#fff', color: fontSize === val ? '#375DFB' : '#374151', cursor: 'pointer', transition: 'all .15s' }}>
                          <div style={{ fontSize: sizes[i], fontWeight: fontSize === val ? 700 : 400, lineHeight: 1.2 }}>A</div>
                          <div style={{ fontSize: 10, marginTop: 3 }}>{labels[i]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 10, letterSpacing: '.4px', textTransform: 'uppercase' as const }}>КОНТРАСТ</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => applyContrast('normal')}
                      style={{ flex: 1, padding: '12px 8px', border: `1.5px solid ${contrast === 'normal' ? '#375DFB' : '#E5E7EB'}`, borderRadius: 10, background: contrast === 'normal' ? '#EBF1FF' : '#fff', color: contrast === 'normal' ? '#375DFB' : '#374151', cursor: 'pointer', transition: 'all .15s', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 400, color: contrast === 'normal' ? '#375DFB' : '#9CA3AF', lineHeight: 1 }}>Aa</span>
                      <span style={{ fontSize: 11 }}>Обычный</span>
                    </button>
                    <button onClick={() => applyContrast('high')}
                      style={{ flex: 1, padding: '12px 8px', border: `1.5px solid ${contrast === 'high' ? '#000' : '#E5E7EB'}`, borderRadius: 10, background: contrast === 'high' ? '#000' : '#fff', color: contrast === 'high' ? '#fff' : '#374151', cursor: 'pointer', transition: 'all .15s', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 900, lineHeight: 1, WebkitTextStroke: '0.8px currentColor' } as React.CSSProperties}>Aa</span>
                      <span style={{ fontSize: 11 }}>Высокий</span>
                    </button>
                  </div>
                  {contrast === 'high' && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#000', border: '2px solid #fff', borderRadius: 10, fontSize: 13, color: '#fff', fontWeight: 700 }}>
                      ✓ Весь текст на странице стал жирным и чётким
                    </div>
                  )}
                </div>
                <button onClick={resetA11y}
                  style={{ width: '100%', padding: '11px 0', background: '#EF4444', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#DC2626')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#EF4444')}>
                  Сбросить настройки
                </button>
              </div>
            )}
          </div>

          {/* Город */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowCityDrop(!showCityDrop)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 14, fontWeight: 500 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {city}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {showCityDrop && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.1)', overflow: 'hidden', zIndex: 500, minWidth: 160 }}>
                {CITIES.map(c => (
                  <button key={c} onClick={() => { setCity(c); setShowCityDrop(false); }}
                    style={{ display: 'block', width: '100%', padding: '10px 16px', background: city === c ? '#EBF1FF' : 'none', border: 'none', textAlign: 'left', fontSize: 13, color: city === c ? '#375DFB' : '#374151', cursor: 'pointer', fontWeight: city === c ? 600 : 400 }}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Уведомления */}
          <button onClick={() => navigate('/notifications')} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6B7280' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: 0, right: 0, width: 18, height: 18, borderRadius: '50%', background: '#375DFB', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>

          {/* Избранное */}
          <button onClick={() => navigate('/favorites')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6B7280' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </button>

          {/* Кошелёк */}
          <button onClick={() => navigate('/wallet')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6B7280' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
          </button>

          {/* Корзина */}
          <button onClick={() => navigate('/cart')} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6B7280' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            {cartCount > 0 && (
              <div style={{ position: 'absolute', top: 0, right: 0, width: 18, height: 18, borderRadius: '50%', background: '#375DFB', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                {cartCount}
              </div>
            )}
          </button>

          {/* Документы */}
          <button onClick={() => navigate('/documents')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6B7280' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          </button>

          {/* Аватар / вход */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => navigate('/profile')} style={{ width: 36, height: 36, borderRadius: '50%', background: '#375DFB', border: '2px solid #C7D2FE', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
                <img src="/teacher2-main.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </button>
              <button onClick={() => { logout(); navigate('/login'); }} title="Выйти" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6B7280' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{ background: '#375DFB', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Войти</button>
          )}
        </div>
      </header>

      {(showA11y || showCityDrop) && (
        <div onClick={() => { setShowA11y(false); setShowCityDrop(false); }} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
      )}
    </>
  );
}