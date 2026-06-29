import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../useMediaQuery';

const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
  </svg>
);

const VKIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.915 13.028c-.388-.49-.277-.708 0-1.146.005-.005 3.84-5.354 4.235-7.168l.002-.001c.194-.65 0-1.127-.945-1.127h-3.123c-.796 0-1.162.418-1.356.879 0 0-1.588 3.826-3.834 6.309-.727.718-1.058.947-1.455.947-.198 0-.487-.229-.487-.879V4.714c0-.789-.231-1.128-.893-1.128H8.506c-.5 0-.798.366-.798.714 0 .747 1.13.92 1.246 3.021v4.566c0 1.002-.183 1.184-.58 1.184-.727 0-2.497-3.837-3.547-8.229C4.604 3.367 4.3 3 3.498 3H.376C-.52 3 -.7 3.418-.7 3.879c0 .826 1.33 4.918 4.765 10.33C6.315 17.38 9.017 19 11.47 19c1.452 0 1.632-.324 1.632-1.081v-2.771c0-.882.19-1.058.81-1.058.46 0 1.25.228 3.091 1.985C19.005 18.07 19.357 19 20.418 19h3.122c.896 0 1.35-.324 1.09-1.234-.285-.906-1.568-2.22-2.715-3.738z" fill="currentColor"/>
  </svg>
);


const COURSES_LINKS = [
  { label: 'Огневая подготовка', path: '/courses' },
  { label: 'Общевойсковой снайпер', path: '/courses' },
  { label: 'Артиллерийская подготовка', path: '/courses' },
  { label: 'Общевойсковой медицины', path: '/courses' },
  { label: 'Тыловое обеспечение', path: '/courses' },
];

const MARKET_LINKS = [
  { label: 'Экипировка', path: '/shop' },
  { label: 'Техника', path: '/shop' },
  { label: 'Бронезащита', path: '/shop' },
  { label: 'Медицина', path: '/shop' },
];

const SECTION_LINKS = [
  { label: 'Микроблоги', path: '/microblog' },
  { label: 'Барахолка', path: '/kaptorka' },
  { label: 'О компании', path: '/company' },
  { label: 'Документы', path: '/documents' },
];

const COLS = [
  { title: 'Курсы', items: COURSES_LINKS },
  { title: 'Маркетплейс', items: MARKET_LINKS },
  { title: 'Разделы', items: SECTION_LINKS },
];

const SOCIALS = [
  { title: 'Телефон', icon: <PhoneIcon />, img: null, action: () => { window.location.href = 'tel:+74951234567'; } },
  { title: 'Email', icon: <EmailIcon />, img: null, action: () => { window.location.href = 'mailto:info@voevoda.ru'; } },
  { title: 'ВК', icon: <VKIcon />, img: null, action: () => window.open('https://vk.com/voevoda', '_blank', 'noopener,noreferrer') },
  { title: 'Макс', icon: null, img: '/макс.png', action: () => window.open('https://max.ru/voevoda', '_blank', 'noopener,noreferrer') },
];

const CSS = `
.voevoda-footer, .voevoda-footer * { box-sizing: border-box; }

.voevoda-footer-link {
  cursor: pointer;
  position: relative;
  overflow: visible;
  transition: color .25s ease, transform .3s cubic-bezier(.34,1.56,.64,1);
}

/* Вертикальная планка слева, вырастает по высоте */
.voevoda-footer-link::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 10%;
  bottom: 10%;
  width: 3px;
  background: linear-gradient(180deg, #375DFB 0%, #7B9FFF 100%);
  border-radius: 2px;
  transform: scaleY(0);
  transform-origin: center;
  transition: transform .28s cubic-bezier(.34,1.56,.64,1);
}

.voevoda-footer-link:hover {
  color: #375DFB !important;
  transform: translateX(7px);
}

.voevoda-footer-link:hover::before {
  transform: scaleY(1);
}

.voevoda-footer-link:active {
  transform: translateX(4px);
  transition-duration: .08s;
}

.voevoda-footer-link:focus-visible {
  outline: 3px solid rgba(55,93,251,.22);
  outline-offset: 2px;
}

/* Социальные кнопки — отскок + лёгкий наклон */
.voevoda-footer-social {
  transition: transform .38s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, background .3s ease, border-color .3s ease, color .3s ease;
}

.voevoda-footer-social:hover {
  transform: scale(1.22);
  background: linear-gradient(135deg, #E8EDFF, #EEF2FF) !important;
  box-shadow: 0 8px 24px rgba(55,93,251,.22), 0 0 0 2px rgba(55,93,251,.15) !important;
  border-color: transparent !important;
  color: #375DFB !important;
}

.voevoda-footer-social:active {
  transform: scale(1.08);
  transition-duration: .1s;
}

.voevoda-footer-social img {
  display: block;
  transition: filter .3s ease;
}

.voevoda-footer-social:hover img {
  filter: brightness(0) saturate(100%) invert(31%) sepia(90%) saturate(600%) hue-rotate(210deg) brightness(100%) contrast(98%);
}
`;

function injectCss() {
  if (typeof document === 'undefined') return;

  let style = document.getElementById('voevoda-footer-same-width-css') as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement('style');
    style.id = 'voevoda-footer-same-width-css';
    document.head.appendChild(style);
  }

  style.textContent = CSS;
}

export function VoevodaSocialLinks({ size = 56, gap = 17 }: { size?: number; gap?: number }) {
  injectCss();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap }}>
      {SOCIALS.map(btn => (
        <button
          key={btn.title}
          type="button"
          className="voevoda-footer-social"
          title={btn.title}
          aria-label={btn.title}
          onClick={btn.action}
          style={{
            width: size,
            height: size,
            borderRadius: Math.max(9, Math.round(size * .22)),
            border: '1px solid #E5E7EB',
            background: '#F3F4F6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            color: '#374151',
            flexShrink: 0,
          }}
        >
          {btn.img
            ? <img src={btn.img} alt="" style={{ width: Math.round(size * .5), height: Math.round(size * .5), objectFit: 'contain', display: 'block' }} />
            : btn.icon}
        </button>
      ))}
    </div>
  );
}

export function Footer({
  noOuterPadding = false,
}: {
  noOuterPadding?: boolean;
}) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  injectCss();

  const outerPadding = noOuterPadding ? 0 : isMobile ? '16px 16px 20px' : '24px 24px 28px';

  const go = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="voevoda-footer"
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: outerPadding,
        background: '#F7F8FA',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 'none',
          height: 'auto',
          minHeight: isMobile ? 'auto' : 391,
          background: '#FFFFFF',
          borderRadius: isMobile ? 20 : 24,
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 'none',
            height: isMobile ? 'auto' : '100%',
            margin: '0 auto',
            padding: isMobile ? '28px 24px 24px' : '45px 36px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isMobile ? 'flex-start' : 'space-between',
            gap: isMobile ? 32 : 0,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(405px, 0.92fr) minmax(0, 1.55fr)',
              columnGap: isMobile ? 0 : 56,
              rowGap: 34,
            }}
          >
            <div>
              <div
                style={{
                  display: isMobile ? 'block' : 'flex',
                  alignItems: 'flex-start',
                  gap: 30,
                }}
              >
                <div
                  style={{
                    width: isMobile ? 96 : 110,
                    height: isMobile ? 96 : 110,
                    flex: '0 0 auto',
                  }}
                >
                  <img
                    src="/footer-logo.png"
                    alt="УТЦ Воевода"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>

                <p
                  style={{
                    maxWidth: 270,
                    margin: isMobile ? '16px 0 0' : '8px 0 0',
                    color: '#4B5563',
                    fontSize: 16,
                    lineHeight: '24px',
                    fontWeight: 400,
                  }}
                >
                  Сообщество патриотов России на базе всероссийской сети центров военной и служебно-прикладной подготовки
                </p>
              </div>

              <div style={{ marginTop: isMobile ? 28 : 39 }}>
                <VoevodaSocialLinks size={isMobile ? 52 : 56} gap={isMobile ? 14 : 17} />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(260px, max-content) minmax(170px, max-content) minmax(160px, max-content)',
                justifyContent: isMobile ? 'start' : 'space-between',
                columnGap: isMobile ? 0 : 48,
                rowGap: 28,
              }}
            >
              {COLS.map(col => (
                <div key={col.title}>
                  <div
                    style={{
                      fontSize: 20,
                      lineHeight: '24px',
                      fontWeight: 700,
                      color: '#111827',
                      marginBottom: 18,
                    }}
                  >
                    {col.title}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 19 }}>
                    {col.items.map(item => (
                      <button
                        key={item.label}
                        className="voevoda-footer-link"
                        onClick={() => go(item.path)}
                        style={{
                          width: 'fit-content',
                          background: 'none',
                          border: 'none',
                          color: '#4B5563',
                          fontSize: 16,
                          lineHeight: '20px',
                          fontWeight: 400,
                          textAlign: 'left',
                          padding: 0,
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
              alignItems: 'center',
              columnGap: isMobile ? 0 : 56,
              rowGap: 10,
              color: '#4B5563',
              fontSize: 14,
              lineHeight: '20px',
              fontWeight: 400,
            }}
          >
            <span>© 2015- 2024 УТЦ «ВОЕВОДА»</span>
            <div style={{ display: 'flex', gap: isMobile ? 6 : 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
              {[
                ['Политика конфиденциальности', '/privacy'],
                ['Пользовательское соглашение', '/terms'],
                ['Политика cookie', '/cookies'],
              ].map(([label, path]) => (
                <button
                  key={path}
                  className="voevoda-footer-link"
                  onClick={() => go(path)}
                  style={{ width: 'fit-content', background: 'none', border: 'none', color: '#4B5563', fontSize: 14, lineHeight: '20px', fontWeight: 400, textAlign: 'left', padding: '6px 10px' }}
                >
                  {label}
                </button>
              ))}
              <button
                className="voevoda-footer-link"
                onClick={() => window.dispatchEvent(new Event('voevoda:cookie-settings'))}
                style={{ width: 'fit-content', background: 'none', border: 'none', color: '#4B5563', fontSize: 14, lineHeight: '20px', fontWeight: 400, textAlign: 'left', padding: '6px 10px' }}
              >
                Настроить cookie
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
