import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window { ymaps: any; }
}

type VenueType = 'auditorium' | 'polygon' | 'range';

interface Venue {
  id: number;
  name: string;
  address: string;
  type: VenueType;
  coords: [number, number];
  photoCount: number;
  photo: string;
}

export interface Rider {
  id: number;
  name: string;
  address: string;
  avatar: string;
  coords: [number, number];
  highlight?: boolean;
  seats?: number;
  phone?: string;
}

export interface YandexTrainingMapProps {
  variant?: 'course' | 'lesson' | 'city';
  height?: number;
  riders?: Rider[];
  onTakeRider?: (rider: Rider) => void;
  riderPopupTitle?: string;
  riderActionLabel?: string;
}

const TYPE_COLOR: Record<VenueType, string> = {
  auditorium: '#1E3A8A',
  polygon: '#7C2D12',
  range: '#7C2D12',
};

const VENUES: Venue[] = [
  { id: 1, name: 'УЦ «Воевода» — Зеленоград', address: 'Зеленоград, корп. 2006', type: 'auditorium', coords: [55.989, 37.198], photoCount: 8, photo: '/teacher1-main.jpg' },
  { id: 2, name: 'УЦ «Воевода» — Новопетровское', address: 'Новопетровское, ул. Центральная', type: 'auditorium', coords: [55.921, 36.840], photoCount: 4, photo: '/teacher2-main.jpg' },
  { id: 3, name: 'УЦ «Воевода» — Химки', address: 'ул. Родионова, 12, Химки', type: 'auditorium', coords: [55.895, 37.410], photoCount: 5, photo: '/teacher3-main.jpg' },
  { id: 4, name: 'УЦ «Воевода» — Подольск', address: 'Подольск, ул. Победы, 1', type: 'auditorium', coords: [55.431, 37.538], photoCount: 6, photo: '/teacher1-main.jpg' },
  { id: 5, name: 'Полигон «Калибр»', address: 'улица Энергетиков, 125', type: 'polygon', coords: [55.762, 37.625], photoCount: 12, photo: '/СписокЗанятий.png' },
  { id: 6, name: 'Полигон «Восток»', address: 'Балашиха, ул. Лесная, 4', type: 'polygon', coords: [55.781, 37.963], photoCount: 7, photo: '/отжимание.png' },
  { id: 7, name: 'Стрельбище «Орёл»', address: 'Минское шоссе, 31-й километр', type: 'range', coords: [55.724, 37.139], photoCount: 6, photo: '/teacher3-main.jpg' },
  { id: 8, name: 'Полигон «Рубеж»', address: 'Можайск, пер. Военный, 1', type: 'range', coords: [55.502, 36.022], photoCount: 9, photo: '/спрятался1.png' },
  { id: 9, name: 'Стрельбище «Южное»', address: 'Домодедово, ул. Северная, 5', type: 'range', coords: [55.413, 37.736], photoCount: 11, photo: '/teacher2-main.jpg' },
];

const MAP_CENTER: [number, number] = [55.73, 37.38];
const MAP_ZOOM = 9;

const CSS = `
  @keyframes ytm-popup-in { from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes ytm-native-popup-in { from{opacity:0} to{opacity:1} }
  .ytm-popup { animation: ytm-popup-in .18s cubic-bezier(.4,0,.2,1) both; }
  .ytm-native-popup {
    position: absolute;
    width: 284px;
    transform: translate(-50%, calc(-100% - 22px));
    box-sizing: border-box;
    padding: 16px;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 8px 36px rgba(0,0,0,.22);
    cursor: default;
    pointer-events: auto;
    animation: ytm-native-popup-in .18s ease both;
  }
  .ytm-native-popup__head { display:flex;gap:12px;margin-bottom:12px; }
  .ytm-native-popup__copy { flex:1;min-width:0; }
  .ytm-native-popup__title { padding-right:20px;margin-bottom:4px;overflow:hidden;color:#111;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap; }
  .ytm-native-popup__address { color:#6B7280;font-size:12px;line-height:1.4; }
  .ytm-native-popup__photo { position:relative;width:62px;height:62px;flex-shrink:0;overflow:hidden;border:1px solid #E5E7EB;border-radius:12px;background:#F3F4F6; }
  .ytm-native-popup__photo img { display:block;width:100%;height:100%;object-fit:cover; }
  .ytm-native-popup__count { position:absolute;right:5px;bottom:5px;padding:2px 5px;border-radius:6px;background:rgba(0,0,0,.65);color:#fff;font-size:10px;font-weight:700; }
  .ytm-native-popup__close { position:absolute;top:8px;right:8px;width:26px;height:26px;border:0;border-radius:7px;background:transparent;color:#6B7280;font-size:18px;cursor:pointer;opacity:.55; }
  .ytm-native-popup__close:hover { background:#F3F4F6;opacity:1; }
  .ytm-native-popup__route { display:block;width:100%;box-sizing:border-box;padding:9px 14px;border-radius:12px;background:#375DFB;color:#fff;font-size:13px;font-weight:600;text-align:center;text-decoration:none;box-shadow:0 4px 14px rgba(55,93,251,.28);transition:background .15s,box-shadow .15s,transform .1s; }
  .ytm-native-popup__route:hover { background:#2F52F0;box-shadow:0 6px 18px rgba(55,93,251,.38);transform:translateY(-1px); }
  .ytm-native-popup--compact {
    width: 232px;
    padding: 10px;
    border-radius: 14px;
    transform: translate(24px, -50%);
    box-shadow: 0 7px 24px rgba(0,0,0,.2);
  }
  .ytm-native-popup--compact .ytm-native-popup__head { gap:8px;margin-bottom:8px; }
  .ytm-native-popup--compact .ytm-native-popup__title { padding-right:18px;font-size:13px; }
  .ytm-native-popup--compact .ytm-native-popup__address { overflow:hidden;font-size:11px;text-overflow:ellipsis;white-space:nowrap; }
  .ytm-native-popup--compact .ytm-native-popup__photo { width:44px;height:44px;border-radius:9px; }
  .ytm-native-popup--compact .ytm-native-popup__count { right:3px;bottom:3px;font-size:9px; }
  .ytm-native-popup--compact .ytm-native-popup__close { top:4px;right:4px;width:22px;height:22px;font-size:16px; }
  .ytm-native-popup--compact .ytm-native-popup__route { padding:7px 10px;border-radius:9px;font-size:12px; }
  .ytm-route-btn { transition: background .15s, box-shadow .15s, transform .1s; }
  .ytm-route-btn:hover { background: #2F52F0 !important; box-shadow: 0 6px 18px rgba(55,93,251,.38); transform: translateY(-1px); }
  .ytm-close { transition: background .12s, opacity .12s; opacity: .55; }
  .ytm-close:hover { background: #F3F4F6 !important; opacity: 1; }
`;

function injectCss() {
  if (document.getElementById('ytm-css')) return;
  const style = document.createElement('style');
  style.id = 'ytm-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}

function markerSvg(type: VenueType, active = false) {
  const size = active ? 48 : 40;
  const center = size / 2;
  const radius = active ? 20 : 20;
  const color = TYPE_COLOR[type];
  const ring = active ? `<circle cx="${center}" cy="${center}" r="${center}" fill="${color}" opacity=".15"/>` : '';
  const icon = type === 'auditorium'
    ? `<polygon points="${center},${center - 11} ${center - 11},${center - 2} ${center - 11},${center + 13} ${center - 5},${center + 13} ${center - 5},${center + 6} ${center + 5},${center + 6} ${center + 5},${center + 13} ${center + 11},${center + 13} ${center + 11},${center - 2}" fill="white"/>`
    : `<rect x="${center - 13}" y="${center - 3}" width="22" height="7" rx="1.5" fill="white"/><rect x="${center - 3}" y="${center - 9}" width="9" height="6" rx="1" fill="white"/><path d="M${center + 9} ${center - 3} L${center + 16} ${center - 6} L${center + 16} ${center + 3} L${center + 9} ${center} Z" fill="white"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${ring}<circle cx="${center}" cy="${center}" r="${radius}" fill="${color}"/>${icon}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

interface MapViewport {
  globalCenter?: [number, number];
  zoom?: number;
}

function toContainerPx(map: any, coords: [number, number], viewport?: MapViewport) {
  try {
    const zoom = viewport?.zoom ?? map.getZoom();
    const projection = map.options.get('projection');
    const globalCenter = viewport?.globalCenter ?? map.getGlobalPixelCenter();
    const [width, height] = map.container.getSize() as [number, number];
    const globalPoint = projection.toGlobalPixels(coords, zoom) as [number, number];
    return { x: globalPoint[0] - globalCenter[0] + width / 2, y: globalPoint[1] - globalCenter[1] + height / 2 };
  } catch {
    return { x: 0, y: 0 };
  }
}

function resetMarker(marker: any, venue: Venue) {
  marker?.options.set({
    iconImageHref: markerSvg(venue.type),
    iconImageSize: [40, 40],
    iconImageOffset: [-20, -20],
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;',
  }[character] ?? character));
}

export function YandexTrainingMap({ variant = 'course', height = 400, riders, onTakeRider, riderPopupTitle = 'Откуда забрать', riderActionLabel = 'Взять на борт' }: YandexTrainingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const venuePopupMarkerRef = useRef<any>(null);
  const activeVenueRef = useRef<Venue | null>(null);
  const initDoneRef = useRef(false);
  const syncFrameRef = useRef<number | null>(null);
  const pendingViewportRef = useRef<MapViewport | undefined>(undefined);
  const [riderPopup, setRiderPopup] = useState<{ rider: Rider; x: number; y: number } | null>(null);
  const activeRiderRef = useRef<Rider | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  const closePopup = () => {
    const active = activeVenueRef.current;
    if (active) resetMarker(markersRef.current.get(active.id), active);
    if (venuePopupMarkerRef.current && mapRef.current) {
      mapRef.current.geoObjects.remove(venuePopupMarkerRef.current);
      venuePopupMarkerRef.current = null;
    }
    activeVenueRef.current = null;
  };

  const closeRiderPopup = () => { activeRiderRef.current = null; setRiderPopup(null); };

  useEffect(() => {
    injectCss();
    if (initDoneRef.current) return;
    initDoneRef.current = true;
    let resizeObserver: ResizeObserver | undefined;

    const init = () => {
      if (!containerRef.current || mapRef.current) return;
      const ymaps = window.ymaps;
      const map = new ymaps.Map(containerRef.current, {
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
        controls: ['zoomControl'],
      }, {
        suppressMapOpenBlock: true,
      });
      mapRef.current = map;
      map.behaviors.disable('scrollZoom');

      const syncPopup = () => {
        syncFrameRef.current = null;
        const viewport = pendingViewportRef.current;
        pendingViewportRef.current = undefined;
        const rider = activeRiderRef.current;
        if (rider && mapRef.current) {
          const point = toContainerPx(mapRef.current, rider.coords, viewport);
          setRiderPopup(current => current && current.rider.id === rider.id && Math.abs(current.x - point.x) < .5 && Math.abs(current.y - point.y) < .5
            ? current
            : { rider, ...point });
        }
      };

      const schedulePopupSync = (viewport?: MapViewport) => {
        if (viewport) pendingViewportRef.current = viewport;
        if (syncFrameRef.current !== null) return;
        syncFrameRef.current = window.requestAnimationFrame(syncPopup);
      };
      const syncDuringAction = (event: any) => {
        const globalCenter = event.get('globalPixelCenter') as [number, number] | undefined;
        const zoom = event.get('zoom') as number | undefined;
        schedulePopupSync({ globalCenter, zoom });
      };

      if (riders && riders.length) {
        riders.forEach((rider) => {
          const marker = new ymaps.Placemark(rider.coords, { hintContent: rider.name }, {
            iconLayout: ymaps.templateLayoutFactory.createClass(
              `<div style="width:46px;height:46px;border-radius:50%;border:3px solid ${rider.highlight ? '#375DFB' : '#fff'};background:url('${rider.avatar}') center/cover #1a2744;box-shadow:0 3px 10px rgba(0,0,0,.35);"></div>`,
            ),
            iconShape: { type: 'Circle', coordinates: [0, 0], radius: 23 },
            cursor: 'pointer',
          });
          marker.events.add('click', (event: any) => {
            event.stopPropagation();
            activeRiderRef.current = rider;
            setRiderPopup({ rider, ...toContainerPx(map, rider.coords) });
          });
          map.geoObjects.add(marker);
        });
      } else {
        VENUES.forEach((venue) => {
          const marker = new ymaps.Placemark(venue.coords, { hintContent: venue.name }, {
            iconLayout: 'default#image',
            iconImageHref: markerSvg(venue.type),
            iconImageSize: [40, 40],
            iconImageOffset: [-20, -20],
            cursor: 'pointer',
          });

          marker.events.add('click', (event: any) => {
            event.stopPropagation();
            const previous = activeVenueRef.current;
            if (previous && previous.id !== venue.id) resetMarker(markersRef.current.get(previous.id), previous);
            if (venuePopupMarkerRef.current) map.geoObjects.remove(venuePopupMarkerRef.current);
            marker.options.set({ iconImageHref: markerSvg(venue.type, true), iconImageSize: [48, 48], iconImageOffset: [-24, -24] });
            activeVenueRef.current = venue;

            const compactPopup = variant === 'lesson' || height <= 260;
            if (compactPopup) {
              try {
                const zoom = map.getZoom();
                const projection = map.options.get('projection');
                const globalPoint = projection.toGlobalPixels(venue.coords, zoom) as [number, number];
                const [mapWidth] = map.container.getSize() as [number, number];
                map.setGlobalPixelCenter([globalPoint[0] + mapWidth / 2 - 74, globalPoint[1]]);
              } catch { /* the popup still works without recentering */ }
            }

            const [lat, lng] = venue.coords;
            const routeUrl = `https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto&z=14`;
            const popupId = `ytm-native-popup-${venue.id}`;
            const popupRootStyle = compactPopup
              ? 'position:absolute;width:232px;box-sizing:border-box;padding:10px;border-radius:14px;background:#fff;box-shadow:0 7px 24px rgba(0,0,0,.2);cursor:default;pointer-events:auto;transform:translate(24px,-50%);font-family:Arial,sans-serif;'
              : 'position:absolute;width:284px;box-sizing:border-box;padding:16px;border-radius:18px;background:#fff;box-shadow:0 8px 36px rgba(0,0,0,.22);cursor:default;pointer-events:auto;transform:translate(-50%,calc(-100% - 22px));font-family:Arial,sans-serif;';
            const photoSize = compactPopup ? 44 : 62;
            const PopupLayout = ymaps.templateLayoutFactory.createClass(
              `<div id="${popupId}" class="ytm-native-popup${compactPopup ? ' ytm-native-popup--compact' : ''}" style="${popupRootStyle}">
                <button class="ytm-native-popup__close" type="button" aria-label="Закрыть" style="position:absolute;top:${compactPopup ? 4 : 8}px;right:${compactPopup ? 4 : 8}px;width:${compactPopup ? 22 : 26}px;height:${compactPopup ? 22 : 26}px;padding:0;border:0;border-radius:7px;background:transparent;color:#6B7280;font-size:${compactPopup ? 16 : 18}px;line-height:1;cursor:pointer;">×</button>
                <div class="ytm-native-popup__head" style="display:flex;gap:${compactPopup ? 8 : 12}px;margin-bottom:${compactPopup ? 8 : 12}px;">
                  <div class="ytm-native-popup__copy" style="min-width:0;flex:1;">
                    <div class="ytm-native-popup__title" style="padding-right:${compactPopup ? 18 : 20}px;margin-bottom:4px;overflow:hidden;color:#111;font-size:${compactPopup ? 13 : 14}px;font-weight:700;line-height:1.3;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(venue.name)}</div>
                    <div class="ytm-native-popup__address" style="overflow:hidden;color:#6B7280;font-size:${compactPopup ? 11 : 12}px;line-height:1.4;text-overflow:ellipsis;white-space:${compactPopup ? 'nowrap' : 'normal'};">${escapeHtml(venue.address)}</div>
                  </div>
                  <div class="ytm-native-popup__photo" style="position:relative;width:${photoSize}px;height:${photoSize}px;flex:0 0 ${photoSize}px;overflow:hidden;border:1px solid #E5E7EB;border-radius:${compactPopup ? 9 : 12}px;background:#F3F4F6;">
                    <img src="${escapeHtml(venue.photo)}" alt="" style="display:block;width:${photoSize}px;height:${photoSize}px;max-width:${photoSize}px;max-height:${photoSize}px;object-fit:cover;">
                    <span class="ytm-native-popup__count" style="position:absolute;right:${compactPopup ? 3 : 5}px;bottom:${compactPopup ? 3 : 5}px;padding:2px 5px;border-radius:6px;background:rgba(0,0,0,.65);color:#fff;font-size:${compactPopup ? 9 : 10}px;font-weight:700;">${venue.photoCount}</span>
                  </div>
                </div>
                <a class="ytm-native-popup__route" href="${routeUrl}" target="_blank" rel="noopener noreferrer" style="display:block;width:100%;box-sizing:border-box;padding:${compactPopup ? '7px 10px' : '9px 14px'};border-radius:${compactPopup ? 9 : 12}px;background:#375DFB;color:#fff;font-size:${compactPopup ? 12 : 13}px;font-weight:600;line-height:1.35;text-align:center;text-decoration:none;box-shadow:0 4px 14px rgba(55,93,251,.28);">Построить маршрут</a>
              </div>`,
              {
                build: function() {
                  PopupLayout.superclass.build.call(this);
                  this._root = this.getParentElement()?.querySelector(`#${popupId}`);
                  this._stop = (popupEvent: Event) => popupEvent.stopPropagation();
                  this._close = (popupEvent: Event) => {
                    popupEvent.preventDefault();
                    popupEvent.stopPropagation();
                    closePopup();
                  };
                  this._root?.addEventListener('pointerdown', this._stop);
                  this._root?.addEventListener('click', this._stop);
                  this._root?.querySelector('.ytm-native-popup__close')?.addEventListener('click', this._close);
                },
                clear: function() {
                  this._root?.removeEventListener('pointerdown', this._stop);
                  this._root?.removeEventListener('click', this._stop);
                  this._root?.querySelector('.ytm-native-popup__close')?.removeEventListener('click', this._close);
                  PopupLayout.superclass.clear.call(this);
                },
              },
            );
            const popupMarker = new ymaps.Placemark(venue.coords, {}, {
              iconLayout: PopupLayout,
              iconShape: compactPopup
                ? { type:'Rectangle', coordinates:[[24, -58], [256, 58]] }
                : { type:'Rectangle', coordinates:[[-142, -190], [142, -22]] },
              zIndex: 2000,
              interactiveZIndex: 2000,
            });
            venuePopupMarkerRef.current = popupMarker;
            map.geoObjects.add(popupMarker);
          });

          markersRef.current.set(venue.id, marker);
          map.geoObjects.add(marker);
        });
      }

      map.events.add('click', () => { closePopup(); closeRiderPopup(); });
      map.events.add('actiontick', syncDuringAction);
      map.events.add('actionend', () => schedulePopupSync());
      map.events.add('boundschange', () => schedulePopupSync());
      map.events.add('sizechange', () => schedulePopupSync());
      resizeObserver = new ResizeObserver(() => {
        map.container.fitToViewport();
        schedulePopupSync();
      });
      resizeObserver.observe(containerRef.current);
      setMapReady(true);
    };

    const handleLoad = () => window.ymaps?.ready(init);
    if (window.ymaps?.ready) {
      window.ymaps.ready(init);
    } else {
      const existing = document.getElementById('ymaps-api') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', handleLoad, { once: true });
      } else {
        const params = new URLSearchParams({ lang: 'ru_RU', load: 'package.full' });
        const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY?.trim();
        if (apiKey) params.set('apikey', apiKey);
        const script = document.createElement('script');
        script.id = 'ymaps-api';
        script.src = `https://api-maps.yandex.ru/2.1/?${params.toString()}`;
        script.async = true;
        script.onload = handleLoad;
        script.onerror = () => setMapError(true);
        document.head.appendChild(script);
      }
    }

    return () => {
      resizeObserver?.disconnect();
      if (syncFrameRef.current !== null) window.cancelAnimationFrame(syncFrameRef.current);
      mapRef.current?.destroy();
      mapRef.current = null;
      venuePopupMarkerRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  function popupStyle(x: number, y: number): React.CSSProperties {
    const width = 284;
    const estimatedHeight = 148;
    const padding = 10;
    const wrapperWidth = wrapperRef.current?.offsetWidth ?? 800;
    const wrapperHeight = wrapperRef.current?.offsetHeight ?? height;
    return {
      position: 'absolute',
      left: Math.max(padding, Math.min(x - width / 2, wrapperWidth - width - padding)),
      top: Math.max(padding, Math.min(y - estimatedHeight - 18, wrapperHeight - estimatedHeight - padding)),
      width,
      background: '#fff',
      borderRadius: 18,
      boxShadow: '0 8px 36px rgba(0,0,0,.22)',
      padding: 16,
      zIndex: 500,
      boxSizing: 'border-box',
    };
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', userSelect: 'none', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ height, width: '100%' }} />

      {!mapReady && !mapError && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFF2F7', color: '#6B7280', fontSize: 14, pointerEvents: 'none' }}>
          Загрузка карты...
        </div>
      )}

      {mapError && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', gap: 8, color: '#9CA3AF', fontSize: 13 }}>
          Карта недоступна. Проверьте ключ Яндекс Карт.
        </div>
      )}

      {mapReady && !riders && (
        <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 2px 12px rgba(0,0,0,.12)', pointerEvents: 'none' }}>
          {([['auditorium', 'Учебный центр'], ['polygon', 'Полигон / Стрельбище']] as [VenueType, string][]).map(([type, label]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151', fontWeight: 500 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: TYPE_COLOR[type] }} />
              {label}
            </div>
          ))}
        </div>
      )}

      {riderPopup && (
        <div className="ytm-popup" style={popupStyle(riderPopup.x, riderPopup.y)} onClick={event => event.stopPropagation()}>
          <button className="ytm-close" onClick={closeRiderPopup} aria-label="Закрыть" style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}>×</button>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 4 }}>{riderPopupTitle}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 12, paddingRight: 20 }}>{riderPopup.rider.address}</div>
          {riderPopup.rider.seats != null && <div style={{ fontSize: 13, color: '#6B7280', margin: '-6px 0 12px', paddingTop: 10, borderTop: '1px solid #F0F1F3' }}>Осталось {riderPopup.rider.seats} места</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { onTakeRider?.(riderPopup.rider); closeRiderPopup(); }} style={{ flex: 1, padding: '9px 12px', background: '#375DFB', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(55,93,251,.28)' }}>{riderActionLabel}</button>
            <button onClick={() => { const [lat, lng] = riderPopup.rider.coords; window.open(`https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto&z=14`, '_blank', 'noopener,noreferrer'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: '#F1F4FB', border: 'none', borderRadius: 11, color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h6a3 3 0 0 0 3-3V8" /></svg>
              Маршрут
            </button>
            <button title="Позвонить" onClick={() => { if (riderPopup.rider.phone) window.location.href = `tel:${riderPopup.rider.phone}`; }} disabled={!riderPopup.rider.phone} style={{ width: 40, padding: '9px 0', background: '#F1F4FB', border: 'none', borderRadius: 11, color: '#374151', cursor: riderPopup.rider.phone ? 'pointer' : 'not-allowed', opacity: riderPopup.rider.phone ? 1 : .45, display: 'grid', placeItems: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
