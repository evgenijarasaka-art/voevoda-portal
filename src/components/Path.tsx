import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../useMediaQuery';

function ArrowChevron({ id, hovered = false, style }: {
  id: string;
  hovered?: boolean;
  style?: React.CSSProperties;
}) {
  const fid    = `arrowF_${id}`;
  const fidHov = `arrowFH_${id}`;
  const gidD   = `arrowGD_${id}`;  // дефолт — белый
  const gidH   = `arrowGH_${id}`;  // hover — тёмно-синий

  const PATH = 'M171.983 111.07L115.756 6.69028L112.974 1.99989L4.00001 60.7041L24.3624 98.5084L62.1656 78.1439L15.4435 233.973L67.095 249.459L113.817 93.6305L134.179 131.435L171.983 111.07Z';

  return (
    <svg width="270" height="495" viewBox="0 0 176 256" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <defs>
        {/* Дефолт: белый */}
        <linearGradient id={gidD} x1="0" y1="0" x2="0" y2="1">
          <stop offset="2.73%"  stopColor="#FFFFFF" />
          <stop offset="96.96%" stopColor="#FFFFFF" />
        </linearGradient>

        {/* Hover: тёмно-синий градиент */}
        <linearGradient id={gidH} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0A1F7A" />
          <stop offset="100%" stopColor="#1A3AC4" />
        </linearGradient>

        {/* Фильтр дефолт — синеватая тень для видимости на светлом */}
        <filter id={fid} x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="bg" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha" />
          <feOffset dx="0" dy="3" />
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.18 0 0 0 0 0.69 0 0 0 0.18 0" />
          <feBlend mode="normal" in2="bg" result="e1" />
          <feBlend mode="normal" in="SourceGraphic" in2="e1" result="shape" />
        </filter>

        {/* Фильтр hover — лёгкая тень */}
        <filter id={fidHov} x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="bg" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
          <feBlend mode="normal" in2="bg" result="e1" />
          <feBlend mode="normal" in="SourceGraphic" in2="e1" result="shape" />
        </filter>
      </defs>

      {hovered ? (
        <g filter={`url(#${fidHov})`}>
          <path d={PATH} fill={`url(#${gidH})`} />
        </g>
      ) : (
        <g filter={`url(#${fid})`}>
          <path d={PATH} fill={`url(#${gidD})`} />
        </g>
      )}
    </svg>
  );
}

export function Path() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [hovered, setHovered] = useState(false);
  const [btnHov, setBtnHov] = useState(false);
  const [s1Err, setS1Err] = useState(false);
  const [s2Err, setS2Err] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setBtnHov(false);
    setMouse({ x: 0.5, y: 0.5 });
  };

  const px = (mouse.x - 0.5);
  const py = (mouse.y - 0.5);

  const soldier1Style: React.CSSProperties = {
    height: 205,
    objectFit: 'contain',
    objectPosition: 'bottom',
    position: 'relative',
    zIndex: 3,
    marginRight: -80,
    filter: hovered ? 'drop-shadow(0 6px 24px rgba(0,0,0,.45))' : 'drop-shadow(0 2px 8px rgba(0,0,0,.18))',
    transform: hovered
      ? `translateX(${px * 18}px) translateY(${py * 8}px) scale(1.13)`
      : 'translateX(0) translateY(0) scale(1)',
    transition: hovered ? 'transform .12s ease-out, filter .35s' : 'transform .6s cubic-bezier(.4,0,.2,1), filter .35s',
  };

  const soldier2Style: React.CSSProperties = {
    height: 205,
    objectFit: 'contain',
    objectPosition: 'bottom',
    position: 'relative',
    zIndex: 2,
    filter: hovered ? 'drop-shadow(0 6px 24px rgba(0,0,0,.45))' : 'drop-shadow(0 2px 8px rgba(0,0,0,.18))',
    transform: hovered
      ? `translateX(${px * 10}px) translateY(${py * 5}px) scale(1.12)`
      : 'translateX(0) translateY(0) scale(1)',
    transition: hovered ? 'transform .15s ease-out, filter .35s' : 'transform .6s cubic-bezier(.4,0,.2,1), filter .35s',
  };

  const arrow1Style: React.CSSProperties = {
    opacity: hovered ? 0.55 : 0.35,
    transform: hovered
      ? `translateX(${-72 + px * -12}%) translateY(${-55 + py * -6}%) scale(0.90)`
      : 'translateX(-72%) translateY(-55%) scale(0.90)',
    transition: hovered ? 'transform .18s ease-out, opacity .35s' : 'transform .6s cubic-bezier(.4,0,.2,1), opacity .35s',
  };

  const arrow2Style: React.CSSProperties = {
    opacity: hovered ? 0.40 : 0.25,
    transform: hovered
      ? `translateX(${-36 + px * -8}%) translateY(${-50 + py * -4}%) scale(0.90)`
      : 'translateX(-36%) translateY(-50%) scale(0.90)',
    transition: hovered ? 'transform .2s ease-out, opacity .35s' : 'transform .6s cubic-bezier(.4,0,.2,1), opacity .35s',
  };

  const cardBg = hovered
    ? 'linear-gradient(90.79deg, #375DFB 0%, #042DD7 100%)'
    : [
        'linear-gradient(270.01deg, rgba(55,93,251,0.25) 26.81%, rgba(255,255,255,0.05) 99.99%)',
        'linear-gradient(0deg, #FFFFFF, #FFFFFF)',
      ].join(', ');

  const cardShadow = hovered
    ? '0px 8px 24px -4px rgba(55,93,251,.25), 0px 2px 4px 0px rgba(27,28,29,0.04)'
    : '0px 2px 4px 0px #1B1C1D0A';

  const titleColor   = hovered ? '#FFFFFF' : '#111111';
  const descColor    = hovered ? 'rgba(255,255,255,.85)' : '#6B7280';
  const btnBg        = hovered ? (btnHov ? '#162664' : '#FFFFFF') : '#FFFFFF';
  const btnTextColor = hovered ? (btnHov ? '#FFFFFF' : '#375DFB') : '#375DFB';
  const btnShadow    = btnHov && hovered
    ? '0px 16px 32px -12px rgba(88,92,95,0.1)'
    : '0px 2px 4px 0px rgba(27,28,29,0.04)';

  const glowStyle: React.CSSProperties = {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: '50%',
    background: hovered ? 'radial-gradient(circle, rgba(99,133,255,0.22) 0%, transparent 68%)' : 'none',
    left: `calc(${mouse.x * 100}% - 180px)`,
    top: `calc(${mouse.y * 100}% - 180px)`,
    pointerEvents: 'none',
    transition: hovered ? 'left .08s linear, top .08s linear' : 'none',
    zIndex: 1,
  };

  return (
    <section style={{ padding: isMobile ? '12px 16px 0' : '12px 24px 0' }}>
      <div
        ref={cardRef}
        onClick={() => navigate('/my-path')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          borderRadius: 16,
          background: cardBg,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          minHeight: 160,
          boxShadow: cardShadow,
          transition: 'background .35s cubic-bezier(.4,0,.2,1), box-shadow .35s',
        }}
      >
        {!isMobile && <div style={glowStyle} />}

        <div style={{ padding: isMobile ? '20px' : '28px 0 28px 40px', zIndex: 3, maxWidth: 380, flexShrink: 0, position: 'relative' }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: titleColor, margin: '0 0 10px', transition: 'color .35s' }}>
            Путь Воеводы
          </h3>
          <p style={{ fontSize: 14, color: descColor, lineHeight: 1.6, margin: 0, transition: 'color .35s' }}>
            Встань на путь преображений, работай над собой{'\n'}усердно, контролируя показатели своих достижений
          </p>
        </div>

        {!isMobile && (
          <>
            <div style={{ position: 'absolute', left: '49%', top: '140%', transformOrigin: 'center center', zIndex: 1, pointerEvents: 'none', ...arrow1Style }}>
              <ArrowChevron id="l" hovered={hovered} />
            </div>
            <div style={{ position: 'absolute', left: '55%', top: '120%', transformOrigin: 'center center', zIndex: 1, pointerEvents: 'none', ...arrow2Style }}>
              <ArrowChevron id="r" hovered={hovered} />
            </div>
          </>
        )}

        {!isMobile && (
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: -60, zIndex: 2, display: 'flex', alignItems: 'flex-end', pointerEvents: 'none' }}>
            {!s1Err && <img src="/soldier1.png" alt="" style={soldier1Style} onError={() => setS1Err(true)} />}
            {!s2Err && <img src="/soldier2.png" alt="" style={soldier2Style} onError={() => setS2Err(true)} />}
          </div>
        )}

        <div style={{ marginLeft: 'auto', padding: isMobile ? '20px' : '28px 40px 28px 0', zIndex: 3, flexShrink: 0, position: 'relative' }}>
          <button
            onClick={e => { e.stopPropagation(); navigate('/my-path'); }}
            onMouseEnter={() => setBtnHov(true)}
            onMouseLeave={() => setBtnHov(false)}
            style={{
              background: btnBg,
              border: 'none',
              borderRadius: 8,
              padding: '14px 28px',
              fontSize: 16,
              fontWeight: 600,
              color: btnTextColor,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: btnShadow,
              transition: 'all .25s ease',
            }}
          >
            Пройти испытания
          </button>
        </div>
      </div>
    </section>
  );
}