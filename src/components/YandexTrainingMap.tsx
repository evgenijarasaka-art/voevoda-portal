import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window { ymaps: any; }
}

/* ─── Types ─── */
type VenueType = 'auditorium' | 'polygon' | 'range';

interface Venue {
  id: number;
  name: string;
  address: string;
  type: VenueType;
  coords: [number, number];   // [lat, lng]
  photoCount: number;
  photo: string;
}

interface PopupState {
  venue: Venue;
  x: number;
  y: number;
}

export interface YandexTrainingMapProps {
  variant?: 'course' | 'lesson' | 'city';
  height?: number;
}

/* ─── Colours per type ─── */
const TYPE_COLOR: Record<VenueType, string> = {
  auditorium: '#1E3A8A',   // тёмно-синий
  polygon:    '#7C2D12',   // тёмно-коричневый
  range:      '#7C2D12',
};

/* ─── Marker SVG generators ─── */
// Дом/здание — для аудиторий
function buildingSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="20" fill="${color}"/>
    <polygon points="20,9 9,18 9,33 15,33 15,26 25,26 25,33 31,33 31,18" fill="white"/>
    <rect x="17" y="26" width="6" height="7" fill="${color}"/>
    <rect x="11" y="20" width="4" height="4" fill="${color}"/>
    <rect x="25" y="20" width="4" height="4" fill="${color}"/>
  </svg>`;
}

// Пистолет — для полигонов и стрельбищ
function gunSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="20" fill="${color}"/>
    <rect x="7" y="17" width="20" height="6" rx="1.5" fill="white"/>
    <rect x="17" y="12" width="8" height="5" rx="1" fill="white"/>
    <path d="M27 17 L34 14.5 L34 22.5 L27 20 Z" fill="white"/>
    <rect x="10" y="23" width="6" height="5" rx="1" fill="white"/>
  </svg>`;
}

function markerDataUrl(type: VenueType): string {
  const c = TYPE_COLOR[type];
  const svg = type === 'auditorium' ? buildingSvg(c) : gunSvg(c);
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

/* ─── Активный маркер (чуть крупнее, с кольцом) ─── */
function activeBuildingSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="24" fill="${color}" opacity="0.15"/>
    <circle cx="24" cy="24" r="20" fill="${color}"/>
    <polygon points="24,11 12,21 12,37 18,37 18,30 30,30 30,37 36,37 36,21" fill="white"/>
    <rect x="21" y="30" width="6" height="7" fill="${color}"/>
    <rect x="14" y="24" width="4" height="4" fill="${color}"/>
    <rect x="30" y="24" width="4" height="4" fill="${color}"/>
  </svg>`;
}

function activeGunSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="24" fill="${color}" opacity="0.15"/>
    <circle cx="24" cy="24" r="20" fill="${color}"/>
    <rect x="8" y="20" width="24" height="7" rx="1.5" fill="white"/>
    <rect x="20" y="14" width="10" height="6" rx="1" fill="white"/>
    <path d="M32 20 L40 17 L40 26 L32 23 Z" fill="white"/>
    <rect x="12" y="27" width="7" height="6" rx="1" fill="white"/>
  </svg>`;
}

function activeMarkerDataUrl(type: VenueType): string {
  const c = TYPE_COLOR[type];
  const svg = type === 'auditorium' ? activeBuildingSvg(c) : activeGunSvg(c);
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

/* ─── Список площадок ─── */
const VENUES: Venue[] = [
  {
    id: 1,
    name: 'УЦ «Воевода» — Зеленоград',
    address: 'Зеленоград, корп. 2006',
    type: 'auditorium',
    coords: [55.989, 37.198],
    photoCount: 8,
    photo: '/teacher1-main.jpg',
  },
  {
    id: 2,
    name: 'УЦ «Воевода» — Новопетровское',
    address: 'Новопетровское, ул. Центральная',
    type: 'auditorium',
    coords: [55.921, 36.840],
    photoCount: 4,
    photo: '/teacher2-main.jpg',
  },
  {
    id: 3,
    name: 'УЦ «Воевода» — Химки',
    address: 'ул. Родионова, 12, Химки',
    type: 'auditorium',
    coords: [55.895, 37.410],
    photoCount: 5,
    photo: '/teacher3-main.jpg',
  },
  {
    id: 4,
    name: 'УЦ «Воевода» — Подольск',
    address: 'Подольск, ул. Победы, 1',
    type: 'auditorium',
    coords: [55.431, 37.538],
    photoCount: 6,
    photo: '/teacher1-main.jpg',
  },
  {
    id: 5,
    name: 'Полигон «Калибр»',
    address: 'улица Энергетиков, 125',
    type: 'polygon',
    coords: [55.762, 37.625],
    photoCount: 12,
    photo: '/СписокЗанятий.png',
  },
  {
    id: 6,
    name: 'Полигон «Восток»',
    address: 'Балашиха, ул. Лесная, 4',
    type: 'polygon',
    coords: [55.781, 37.963],
    photoCount: 7,
    photo: '/отжимание.png',
  },
  {
    id: 7,
    name: 'Стрельбище «Орёл»',
    address: 'Минское шоссе, 31-й километр',
    type: 'range',
    coords: [55.724, 37.139],
    photoCount: 6,
    photo: '/teacher3-main.jpg',
  },
  {
    id: 8,
    name: 'Полигон «Рубеж»',
    address: 'Можайск, пер. Военный, 1',
    type: 'range',
    coords: [55.502, 36.022],
    photoCount: 9,
    photo: '/спрятался1.png',
  },
  {
    id: 9,
    name: 'Стрельбище «Южное»',
    address: 'Домодедово, ул. Северная, 5',
    type: 'range',
    coords: [55.413, 37.736],
    photoCount: 11,
    photo: '/teacher2-main.jpg',
  },
];

/* ─── Map center & zoom ─── */
const MAP_CENTER: [number, number] = [55.73, 37.38];
const MAP_ZOOM = 9;

/* ─── CSS injection ─── */
const CSS = `
  @keyframes ytm-popup-in { from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .ytm-popup { animation: ytm-popup-in .18s cubic-bezier(.4,0,.2,1) both; }
  .ytm-route-btn { transition: background .15s, box-shadow .15s, transform .1s; }
  .ytm-route-btn:hover { background: #2F52F0 !important; box-shadow: 0 6px 18px rgba(55,93,251,.38); transform: translateY(-1px); }
  .ytm-close { transition: background .12s, opacity .12s; opacity: .55; }
  .ytm-close:hover { background: #F3F4F6 !important; opacity: 1; }
`;

function injectCss() {
  if (document.getElementById('ytm-css')) return;

  const s = document.createElement('style');
  s.id = 'ytm-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ─── Coordinate → container pixel ─── */
function toContainerPx(
  map: any,
  coords: [number, number],
): { x: number; y: number } {
  try {
    const zoom = map.getZoom();
    const proj = map.options.get('projection');
    const gCenter = map.getGlobalPixelCenter();
    const [cw, ch] = map.container.getSize() as [number, number];
    const gPt = proj.toGlobalPixels(coords, zoom) as [number, number];

    return {
      x: gPt[0] - gCenter[0] + cw / 2,
      y: gPt[1] - gCenter[1] + ch / 2,
    };
  } catch {
    return { x: 0, y: 0 };
  }
}

/* ═══════════════ COMPONENT ═══════════════ */
export function YandexTrainingMap({
  height = 400,
}: YandexTrainingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const initDoneRef = useRef(false);

  const [popup, setPopup] = useState<PopupState | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  const closePopup = () => {
    // Restore active marker icon
    if (popup) {
      const pm = markersRef.current.get(popup.venue.id);

      if (pm) {
        pm.options.set('iconImageHref', markerDataUrl(popup.venue.type));
        pm.options.set('iconImageSize', [40, 40]);
        pm.options.set('iconImageOffset', [-20, -20]);
      }
    }

    setPopup(null);
  };

  /* ─── Init Yandex Maps ─── */
  useEffect(() => {
    injectCss();

    if (initDoneRef.current) return;
    initDoneRef.current = true;

    const init = () => {
      const ymaps = window.ymaps;

      if (!containerRef.current) return;

      const map = new ymaps.Map(containerRef.current, {
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
        controls: [],
      });

      mapRef.current = map;

      // Lock map — disable all interactions
      map.behaviors.disable([
        'drag',
        'scrollZoom',
        'dblClickZoom',
        'multiTouch',
        'rightMouseButtonMagnifier',
        'leftMouseButtonMagnifier',
        'kinetic',
      ]);

      // Add placemarks
      VENUES.forEach((venue) => {
        const pm = new ymaps.Placemark(
          venue.coords,
          {},
          {
            iconLayout: 'default#image',
            iconImageHref: markerDataUrl(venue.type),
            iconImageSize: [40, 40],
            iconImageOffset: [-20, -20],
            cursor: 'pointer',
          },
        );

        pm.events.add('click', (e: any) => {
          e.stopPropagation();

          if (!mapRef.current) return;

          // Deactivate previous
          if (popup) {
            const prev = markersRef.current.get(popup.venue.id);

            if (prev) {
              prev.options.set('iconImageHref', markerDataUrl(popup.venue.type));
              prev.options.set('iconImageSize', [40, 40]);
              prev.options.set('iconImageOffset', [-20, -20]);
            }
          }

          // Activate current
          pm.options.set('iconImageHref', activeMarkerDataUrl(venue.type));
          pm.options.set('iconImageSize', [48, 48]);
          pm.options.set('iconImageOffset', [-24, -24]);

          const { x, y } = toContainerPx(mapRef.current, venue.coords);
          setPopup({ venue, x, y });
        });

        markersRef.current.set(venue.id, pm);
        map.geoObjects.add(pm);
      });

      // Close popup on blank map click
      map.events.add('click', () => {
        setPopup((prev) => {
          if (prev) {
            const pm = markersRef.current.get(prev.venue.id);

            if (pm) {
              pm.options.set('iconImageHref', markerDataUrl(prev.venue.type));
              pm.options.set('iconImageSize', [40, 40]);
              pm.options.set('iconImageOffset', [-20, -20]);
            }
          }

          return null;
        });
      });

      setMapReady(true);
    };

    if (window.ymaps?.ready) {
      window.ymaps.ready(init);
      return;
    }

    if (document.getElementById('ymaps-api')) {
      document
        .getElementById('ymaps-api')!
        .addEventListener('load', () => window.ymaps.ready(init));

      return;
    }

    const script = document.createElement('script');
    script.id = 'ymaps-api';

    // Замените на реальный API-ключ: ?apikey=ВАШ_КЛЮЧ&lang=ru_RU
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&load=package.full';
    script.async = true;
    script.onload = () => window.ymaps.ready(init);
    script.onerror = () => setMapError(true);

    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Popup position with clamping ─── */
  function popupStyle(x: number, y: number): React.CSSProperties {
    const W = 284;   // popup width
    const H = 148;   // popup height (approx)
    const PAD = 10;

    const ww = wrapperRef.current?.offsetWidth ?? 800;
    const wh = wrapperRef.current?.offsetHeight ?? height;

    const left = Math.max(PAD, Math.min(x - W / 2, ww - W - PAD));
    const top = Math.max(PAD, Math.min(y - H - 18, wh - H - PAD));

    return {
      position: 'absolute',
      left,
      top,
      width: W,
      background: '#fff',
      borderRadius: 18,
      boxShadow: '0 8px 36px rgba(0,0,0,.22)',
      padding: 16,
      zIndex: 500,
    };
  }

  const handleRoute = () => {
    if (!popup) return;

    const [lat, lng] = popup.venue.coords;

    window.open(
      `https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto&z=14`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', userSelect: 'none' }}>
      {/* Map container */}
      <div ref={containerRef} style={{ height, width: '100%' }} />

      {/* Loading */}
      {!mapReady && !mapError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#EFF2F7',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#6B7280',
              fontSize: 14,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h3M19 12h3M12 2v3M12 19v3" />
            </svg>
            Загрузка карты...
          </div>
        </div>
      )}

      {/* Error */}
      {mapError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F9FAFB',
            gap: 8,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>

          <span style={{ fontSize: 13, color: '#9CA3AF' }}>
            Карта недоступна. Проверьте API-ключ Яндекс Карт.
          </span>
        </div>
      )}

      {/* Легенда */}
      {mapReady && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            background: 'rgba(255,255,255,.92)',
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            padding: '10px 14px',
            boxShadow: '0 2px 12px rgba(0,0,0,.12)',
            pointerEvents: 'none',
          }}
        >
          {([
            ['auditorium', 'Учебный центр'],
            ['polygon', 'Полигон / Стрельбище'],
          ] as [VenueType, string][]).map(([type, label]) => (
            <div
              key={type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: '#374151',
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: TYPE_COLOR[type],
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {type === 'auditorium' ? (
                  <svg width="11" height="11" viewBox="0 0 40 40">
                    <polygon
                      points="20,9 9,18 9,33 15,33 15,26 25,26 25,33 31,33 31,18"
                      fill="white"
                    />
                    <rect
                      x="17"
                      y="26"
                      width="6"
                      height="7"
                      fill={TYPE_COLOR[type]}
                    />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 40 40">
                    <rect
                      x="7"
                      y="17"
                      width="20"
                      height="6"
                      rx="1.5"
                      fill="white"
                    />
                    <rect
                      x="17"
                      y="12"
                      width="8"
                      height="5"
                      rx="1"
                      fill="white"
                    />
                  </svg>
                )}
              </div>

              {label}
            </div>
          ))}
        </div>
      )}

      {/* Popup */}
      {popup && (
        <div
          className="ytm-popup"
          style={popupStyle(popup.x, popup.y)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            className="ytm-close"
            onClick={closePopup}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 26,
              height: 26,
              borderRadius: 7,
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16,
              color: '#6B7280',
              lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* Content row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#111',
                  marginBottom: 4,
                  paddingRight: 20,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {popup.venue.name}
              </div>

              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>
                {popup.venue.address}
              </div>
            </div>

            {/* Photo */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                }}
              >
                {!imgErrors[popup.venue.id] ? (
                  <img
                    src={popup.venue.photo}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={() =>
                      setImgErrors((p) => ({
                        ...p,
                        [popup.venue.id]: true,
                      }))
                    }
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #334155, #1E3A5F)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,.5)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Photo count badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                  background: 'rgba(0,0,0,.65)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 5px',
                  borderRadius: 6,
                  lineHeight: 1.4,
                }}
              >
                {popup.venue.photoCount}
              </div>
            </div>
          </div>

          {/* Route button */}
          <button
            className="ytm-route-btn"
            onClick={handleRoute}
            style={{
              width: '100%',
              padding: '9px 14px',
              background: '#375DFB',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              boxShadow: '0 4px 14px rgba(55,93,251,.28)',
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="3" cy="6" r="2" />
              <circle cx="21" cy="6" r="2" />
              <path d="M3 8v3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8" />
              <path d="M12 14v6M9 20h6" />
            </svg>
            Построить Маршрут
          </button>
        </div>
      )}
    </div>
  );
}