import { useAccessibility } from '../hooks/useAccessibility';

export function AccessibilityButton() {
  const { enabled, toggle } = useAccessibility();
  return (
    <button onClick={toggle} title={enabled ? 'Выключить версию для слабовидящих' : 'Включить версию для слабовидящих'}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: enabled ? '#375DFB' : 'none', border: 'none', borderRadius: 8, cursor: 'pointer', color: enabled ? '#fff' : '#6B7280', fontSize: 12, fontWeight: enabled ? 600 : 400, transition: 'all .15s' }}
      onMouseEnter={e => { if (!enabled) { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#374151'; } }}
      onMouseLeave={e => { if (!enabled) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6B7280'; } }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        {enabled && <line x1="4" y1="4" x2="20" y2="20" />}
      </svg>
      Версия для слабовидящих
    </button>
  );
}

export function AccessibilityPanel() {
  const { enabled, fontSize, contrast, toggle, setFontSize, setContrast } = useAccessibility();
  if (!enabled) return null;
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, background: '#fff', borderRadius: 16, border: '2px solid #375DFB', boxShadow: '0 8px 32px rgba(55,93,251,.2)', padding: 20, width: 280, fontSize: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>♿ Версия для слабовидящих</span>
        <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 18 }}>×</button>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>РАЗМЕР ШРИФТА</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {([['normal', 'Обычный'], ['large', 'Крупный'], ['xlarge', 'Очень крупный']] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => { setFontSize(val); document.documentElement.style.fontSize = val === 'normal' ? '' : val === 'large' ? '18px' : '22px'; }}
              style={{ flex: 1, padding: '6px 0', border: `1.5px solid ${fontSize === val ? '#375DFB' : '#E5E7EB'}`, borderRadius: 8, background: fontSize === val ? '#EBF1FF' : '#fff', color: fontSize === val ? '#375DFB' : '#374151', fontSize: 11, fontWeight: fontSize === val ? 600 : 400, cursor: 'pointer' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>КОНТРАСТ</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {([['normal', 'Обычный'], ['high', 'Высокий']] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => { setContrast(val); document.documentElement.setAttribute('data-contrast', val); }}
              style={{ flex: 1, padding: '8px 0', border: `1.5px solid ${contrast === val ? '#375DFB' : '#E5E7EB'}`, borderRadius: 8, background: contrast === val ? '#EBF1FF' : '#fff', color: contrast === val ? '#375DFB' : '#374151', fontSize: 12, fontWeight: contrast === val ? 600 : 400, cursor: 'pointer' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>
      <button onClick={toggle} style={{ width: '100%', padding: '10px 0', background: '#EF4444', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Выключить</button>
    </div>
  );
}