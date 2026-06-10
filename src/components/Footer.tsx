import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../useMediaQuery';

const COURSES_LINKS = [
  { label: 'Огневая подготовка',       path: '/courses' },
  { label: 'Общевойсковой снайпер',    path: '/courses' },
  { label: 'Артиллерийская подготовка', path: '/courses' },
  { label: 'Общевойсковой медицины',   path: '/courses' },
  { label: 'Тыловое обеспечение',      path: '/courses' },
];

const MARKET_LINKS = [
  { label: 'Экипировка',   path: '/shop' },
  { label: 'Техника',      path: '/shop' },
  { label: 'Бронезащита',  path: '/shop' },
  { label: 'Медицина',     path: '/shop' },
];

const SECTION_LINKS = [
  { label: 'Микроблоги',  path: '/microblog' },
  { label: 'Барахолка',   path: '/kaptorka' },
  { label: 'О компании',  path: '/company' },
  { label: 'Документы',   path: '/documents' },
];

const COLS = [
  { title: 'Курсы',        items: COURSES_LINKS },
  { title: 'Маркетплейс', items: MARKET_LINKS },
  { title: 'Разделы',     items: SECTION_LINKS },
];

const CSS = `
.ft-link { transition: color .15s; cursor: pointer; }
.ft-link:hover { color: #374151 !important; }
.ft-social { transition: background .15s, border-color .15s, color .15s, transform .15s; }
.ft-social:hover { background: #F3F4F6 !important; border-color: #D1D5DB !important; color: #111827 !important; transform: translateY(-1px); }
`;

function injectCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('footer-css2')) return;
  const s = document.createElement('style'); s.id = 'footer-css2'; s.textContent = CSS;
  document.head.appendChild(s);
}

export function Footer() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  injectCss();

  const go = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ padding: isMobile ? '16px 16px 20px' : '24px 24px 28px' }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
      }}>
        {/* Main area */}
        <div style={{
          padding: isMobile ? '28px 22px' : '36px 36px 32px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '240px 1fr',
          gap: isMobile ? 28 : 48,
        }}>
          {/* Left: logo + desc + socials */}
          <div>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '1px solid #E5E7EB', background: '#F9FAFB', marginBottom: 14 }}>
              <img src="/footer-logo.png" alt="УТЦ Воевода"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 220 }}>
              Сообщество патриотов России на базе всероссийской сети центров военной и служебно-прикладной подготовки
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { title: 'Телефон',  icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.91.32 1.79.6 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.17a2 2 0 0 1 2.11-.45c.84.28 1.72.48 2.63.6A2 2 0 0 1 22 16.92Z"/></svg>, action: () => { window.location.href = 'tel:+74951234567'; } },
                { title: 'Email',    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="m22 6-10 7L2 6"/></svg>, action: () => { window.location.href = 'mailto:info@voevoda.ru'; } },
                { title: 'ВК',       icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8c.5 5 2.8 8 7.7 8h.3v-3c1.8.2 3.1 1.4 3.6 3H21c-.7-2.1-2.4-3.3-3.4-3.8 1-.7 2.4-2 2.8-4.2h-3.1c-.5 1.7-1.8 3.1-3.3 3.2V8h-3v5.6C9.4 13.2 8.1 11.4 8 8H6Z"/></svg>, action: () => window.open('https://vk.com/voevoda', '_blank', 'noopener,noreferrer') },
                { title: 'Telegram', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2.5L2.5 9.5l7 2.5m12-9.5-5 17-5-7m10-10-12 9.5"/></svg>, action: () => window.open('https://t.me/voevoda', '_blank', 'noopener,noreferrer') },
              ].map(btn => (
                <button key={btn.title} className="ft-social" title={btn.title} onClick={btn.action}
                  style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Right: 3 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 22 : 28 }}>
            {COLS.map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.items.map(item => (
                    <button key={item.label} className="ft-link"
                      onClick={() => go(item.path)}
                      style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 14, textAlign: 'left', padding: 0 }}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid #E5E7EB',
          padding: isMobile ? '14px 22px' : '14px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>© 2015–2024 УТЦ «ВОЕВОДА»</span>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>Все права защищены</span>
          <button className="ft-link" onClick={() => go('/privacy')}
            style={{ background: 'none', border: 'none', fontSize: 13, color: '#9CA3AF', padding: 0 }}>
            Политика конфиденциальности
          </button>
        </div>
      </div>
    </footer>
  );
}
