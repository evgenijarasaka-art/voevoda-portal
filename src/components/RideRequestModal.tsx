import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { YandexTrainingMap, type Rider } from './YandexTrainingMap';

/*
 * Модалка «Запрос попутки» — 2 шага (адрес → телефон),
 * затем результат Список/Карта с водителями.
 */

interface Driver extends Rider { seats: number; iv: number; role: string; phone: string }

const DRIVERS: Driver[] = [
  { id: 1, name: 'Торнадо', address: 'г. Москва, ул. Пушкина, д. 2', avatar: '/teacher2-main.jpg', coords: [55.80, 37.40], seats: 3, iv: 1240, role: 'Командир взвода', phone: '+79251234501' },
  { id: 2, name: 'Бек', address: 'г. Москва, ул. Донская, д. 8 стр. 1', avatar: '/sold1.png', coords: [55.72, 37.55], seats: 2, iv: 980, role: 'Снайпер', phone: '+79251234502' },
  { id: 3, name: 'Коба', address: 'г. Москва, ул. Профсоюзная, д. 3', avatar: '/sold2.png', coords: [55.74, 37.36], seats: 4, iv: 1540, role: 'Командир', phone: '+79251234503' },
  { id: 4, name: 'Воин', address: 'г. Москва, ул. Академика, д. 12', avatar: '/sold3.png', coords: [55.78, 37.62], seats: 1, iv: 760, role: 'Пехотинец', phone: '+79251234504' },
  { id: 5, name: 'Вихрь', address: 'г. Москва, Кутузовский просп., д. 5', avatar: '/teacher1-main.jpg', coords: [55.70, 37.42], seats: 3, iv: 1120, role: 'Разведчик', phone: '+79251234505' },
  { id: 6, name: 'Стрелок', address: 'г. Москва, ул. Донская, д. 8 стр. 1', avatar: '/teacher3-main.jpg', coords: [55.76, 37.70], seats: 2, iv: 870, role: 'Стрелок', phone: '+79251234506' },
];

const CSS = `
.rr-overlay { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; padding:24px; background:rgba(10,16,32,.6); backdrop-filter:blur(6px); animation:rrBg .2s ease both; }
@keyframes rrBg { from{opacity:0} to{opacity:1} }
@keyframes rrPop { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.rr-modal { width:min(620px,100%); background:#fff; border-radius:22px; box-shadow:0 36px 90px rgba(0,0,0,.4); animation:rrPop .28s cubic-bezier(.2,.8,.2,1) both; overflow:hidden; }
.rr-modal.wide { width:min(880px,100%); max-height:88vh; display:flex; flex-direction:column; }
.rr-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:20px 26px; }
.rr-title { display:flex; align-items:center; gap:12px; font-size:22px; font-weight:800; color:#111; }
.rr-close { width:40px; height:40px; border:none; border-radius:12px; background:#F1F3F7; color:#6B7280; font-size:22px; cursor:pointer; display:grid; place-items:center; transition:all .18s; flex-shrink:0; }
.rr-close:hover { background:#FEF2F2; color:#EF4444; }
.rr-toggle { display:flex; background:#F1F3F7; border-radius:11px; padding:4px; gap:4px; margin-left:auto; }
.rr-toggle button { border:none; background:none; padding:8px 18px; border-radius:8px; font:600 14px inherit; color:#6B7280; cursor:pointer; transition:all .18s; }
.rr-toggle button.active { background:#fff; color:#111; box-shadow:0 2px 8px rgba(17,24,39,.1); }

.rr-step { padding:6px 26px 24px; text-align:center; }
.rr-step-no { font-size:14px; color:#9CA3AF; margin-bottom:10px; }
.rr-q { font-size:22px; font-weight:800; color:#111; margin:0 0 22px; }
.rr-input { width:100%; height:56px; padding:0 18px; border:1px solid #E5E7EB; border-radius:14px; background:#fff; font:15px inherit; color:#111; outline:none; box-sizing:border-box; transition:border-color .2s ease,box-shadow .2s ease; }
.rr-input:focus { border-color:#375DFB; box-shadow:0 0 0 3px rgba(55,93,251,.12); }
.rr-phone { display:flex; align-items:center; height:56px; border:1px solid #E5E7EB; border-radius:14px; overflow:hidden; transition:border-color .2s ease,box-shadow .2s ease; }
.rr-phone:focus-within { border-color:#375DFB; box-shadow:0 0 0 3px rgba(55,93,251,.12); }
.rr-phone .pref { display:flex; align-items:center; gap:6px; padding:0 14px; height:100%; border-right:1px solid #E5E7EB; color:#374151; font:600 15px inherit; white-space:nowrap; flex-shrink:0; }
.rr-phone input { flex:1; height:100%; border:none; padding:0 16px; font:15px inherit; color:#111; outline:none; min-width:0; }
.rr-foot { display:flex; gap:14px; padding:0 26px 24px; }
.rr-back { height:54px; padding:0 28px; border:none; border-radius:14px; background:#F1F3F7; color:#374151; font:700 15px inherit; cursor:pointer; transition:background .2s; }
.rr-back:hover { background:#E5E7EB; }
.rr-next { flex:1; height:54px; border:none; border-radius:14px; background:linear-gradient(180deg,#4B6BFF,#375DFB); color:#fff; font:700 15px inherit; cursor:pointer; transition:all .2s ease; box-shadow:0 8px 22px rgba(55,93,251,.3); }
.rr-next:hover { filter:brightness(1.05); transform:translateY(-2px); box-shadow:0 12px 28px rgba(55,93,251,.42); }

.rr-body { overflow-y:auto; flex:1; }
.rr-row { display:flex; align-items:center; gap:14px; padding:16px 26px; border-top:1px solid #F0F1F3; flex-wrap:wrap; }
.rr-av { width:52px; height:52px; border-radius:50%; overflow:hidden; flex-shrink:0; background:#1a2744; }
.rr-av img { width:100%; height:100%; object-fit:cover; }
.rr-info { flex:1; min-width:160px; }
.rr-name { font-size:16px; font-weight:700; color:#111; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.rr-iv { display:inline-flex; align-items:center; gap:5px; background:#EBF1FF; color:#375DFB; font-size:12px; font-weight:700; padding:3px 9px; border-radius:20px; }
.rr-role { font-size:12px; color:#9CA3AF; margin-top:2px; }
.rr-from { font-size:13px; color:#9CA3AF; margin-top:3px; }
.rr-from b { color:#374151; font-weight:500; }
.rr-seats { display:inline-flex; align-items:center; gap:5px; font-size:13px; color:#374151; font-weight:600; }
.rr-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.rr-ico { width:42px; height:42px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#6B7280; cursor:pointer; display:grid; place-items:center; transition:all .2s ease; flex-shrink:0; }
.rr-ico:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; }
.rr-route { display:inline-flex; align-items:center; gap:8px; height:42px; padding:0 16px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#374151; font:600 13px inherit; cursor:pointer; transition:all .2s ease; }
.rr-route:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; }
.rr-send { height:42px; padding:0 18px; border:none; border-radius:11px; background:#375DFB; color:#fff; font:700 13px inherit; cursor:pointer; transition:all .2s ease; box-shadow:0 6px 16px rgba(55,93,251,.3); }
.rr-send:hover { background:#2D4FE0; box-shadow:0 10px 22px rgba(55,93,251,.42); transform:translateY(-1px); }
.rr-send.done { background:#16A34A; box-shadow:0 6px 16px rgba(22,163,74,.3); cursor:default; transform:none; }
.rr-send.done:hover { background:#16A34A; }
.rr-map { padding:0; }
.rr-toast { position:fixed; left:50%; bottom:32px; transform:translateX(-50%); z-index:10001; background:#111827; color:#fff; font-size:14px; font-weight:600; padding:13px 22px; border-radius:12px; box-shadow:0 16px 40px rgba(0,0,0,.3); animation:rrToast .25s ease both; }
@keyframes rrToast { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
`;

function injectCss() {
  if (typeof document === 'undefined' || document.getElementById('rr-css')) return;
  const s = document.createElement('style'); s.id = 'rr-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; };

const CarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17a2 2 0 0 1-2-2v-3l2-5a2 2 0 0 1 1.9-1.4h8.2A2 2 0 0 1 19 7l2 5v3a2 2 0 0 1-2 2M7 17v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1m15 0v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1M5 12h14" /><circle cx="7.5" cy="14.5" r="1" fill="#111" /><circle cx="16.5" cy="14.5" r="1" fill="#111" /></svg>;
const PhoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
const RouteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h6a3 3 0 0 0 3-3V8" /></svg>;
const SeatIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" /><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" /><path d="M6 19v2" /><path d="M18 19v2" /></svg>;

function routeTo(coords: [number, number]) {
  const [lat, lng] = coords;
  window.open(`https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto&z=14`, '_blank', 'noopener,noreferrer');
}

export function RideRequestModal({ onClose }: { onClose: () => void }) {
  injectCss();
  const [step, setStep] = useState<1 | 2 | 0>(1);
  const [address, setAddress] = useState('г. Москва, ул. Пушкина, д. 2');
  const [phone, setPhone] = useState('988 252 - 14 - 22');
  const [tab, setTab] = useState<'list' | 'map'>('list');
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const sendRequest = (d: Driver) => {
    setSent(s => new Set(s).add(d.id));
    setToast(`Запрос отправлен: ${d.name}`);
  };

  const wizard = (
    <div className="rr-modal" onClick={e => e.stopPropagation()}>
      <div className="rr-head">
        <div className="rr-title"><CarIcon />Запрос попутки</div>
        <button className="rr-close" onClick={onClose} aria-label="Закрыть">×</button>
      </div>
      <div className="rr-step">
        <div className="rr-step-no">{step}/2 шаг</div>
        {step === 1 && (<>
          <h3 className="rr-q">Откуда вас забирать?</h3>
          <input
            className="rr-input"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Укажите адрес"
          />
        </>)}
        {step === 2 && (<>
          <h3 className="rr-q">Укажите телефон для связи</h3>
          <div className="rr-phone">
            <span className="pref">
              🇷🇺 +7
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </span>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="900 000 - 00 - 00"
            />
          </div>
        </>)}
      </div>
      <div className="rr-foot">
        {step === 2 && <button className="rr-back" onClick={() => setStep(1)}>Назад</button>}
        <button
          className="rr-next"
          onClick={() => { if (step === 1) setStep(2); else setStep(0); }}
        >
          Продолжить
        </button>
      </div>
    </div>
  );

  const result = (
    <div className="rr-modal wide" onClick={e => e.stopPropagation()}>
      <div className="rr-head">
        <div className="rr-title"><CarIcon />Запрос попутки</div>
        <div className="rr-toggle">
          <button className={tab === 'list' ? 'active' : ''} onClick={() => setTab('list')}>Список</button>
          <button className={tab === 'map' ? 'active' : ''} onClick={() => setTab('map')}>Карта</button>
        </div>
        <button className="rr-close" onClick={onClose} aria-label="Закрыть">×</button>
      </div>
      {tab === 'list' ? (
        <div className="rr-body">
          {DRIVERS.map(d => {
            const isSent = sent.has(d.id);
            return (
              <div key={d.id} className="rr-row">
                <div className="rr-av"><img src={d.avatar} alt={d.name} onError={imgFallback} /></div>
                <div className="rr-info">
                  <div className="rr-name">
                    {d.name}
                    <span className="rr-iv">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                      {d.iv} ИВ
                    </span>
                  </div>
                  <div className="rr-role">{d.role}</div>
                  <div className="rr-from">
                    <span className="rr-seats"><SeatIcon />{d.seats} места</span>
                    {' '}·{' '}
                    Старт: <b>{d.address}</b>
                  </div>
                </div>
                <div className="rr-actions">
                  <button className="rr-ico" title="Позвонить" onClick={() => window.open(`tel:${d.phone}`, '_self')}><PhoneIcon /></button>
                  <button className="rr-route" onClick={() => routeTo(d.coords)}><RouteIcon />Маршрут</button>
                  <button
                    className={`rr-send${isSent ? ' done' : ''}`}
                    onClick={() => { if (!isSent) sendRequest(d); }}
                  >
                    {isSent
                      ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Запрос отправлен</>)
                      : 'Отправить запрос'
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rr-map">
          <YandexTrainingMap
            riders={DRIVERS as Rider[]}
            onTakeRider={d => sendRequest(d as Driver)}
            riderPopupTitle="Стартует"
            riderActionLabel="Отправить запрос"
            height={520}
          />
        </div>
      )}
    </div>
  );

  return createPortal(
    <div className="rr-overlay" onClick={onClose}>
      {step === 0 ? result : wizard}
      {toast && <div className="rr-toast">{toast}</div>}
    </div>,
    document.body,
  );
}
