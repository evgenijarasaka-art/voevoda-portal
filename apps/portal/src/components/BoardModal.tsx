import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { YandexTrainingMap, type Rider } from './YandexTrainingMap';

/*
 * Модалка «Возьму на борт» — мастер из 3 шагов (откуда / сколько мест / телефон),
 * затем список/карта попутчиков. Карта переиспользует YandexTrainingMap.
 */

type Status = 'accepted' | 'pending' | 'open';
interface BoardRider extends Rider { status: Status; phone?: string }

const RIDERS: BoardRider[] = [
  { id: 1, name: 'Бек', address: 'г. Москва, ул. Пушкина, д.2', avatar: '/sold1.png', coords: [55.80, 37.40], status: 'accepted', phone: '+79881234501' },
  { id: 2, name: 'Торнадо', address: 'г. Москва, ул. Пушкина, д.2', avatar: '/sold2.png', coords: [55.72, 37.55], status: 'pending', highlight: true, phone: '+79881234502' },
  { id: 3, name: 'Воин', address: 'г. Москва, ул. Донская, д. 8 стр. 1', avatar: '/sold3.png', coords: [55.74, 37.36], status: 'open', phone: '+79881234503' },
  { id: 4, name: 'Тор', address: 'г. Москва, ул. Донская, д. 8 стр. 1', avatar: '/teacher1-main.jpg', coords: [55.78, 37.62], status: 'open', phone: '+79881234504' },
  { id: 5, name: 'Стрелок', address: 'г. Москва, ул. Донская, д. 8 стр. 1', avatar: '/teacher3-main.jpg', coords: [55.70, 37.42], status: 'open', phone: '+79881234505' },
  { id: 6, name: 'Вихрь', address: 'г. Москва, ул. Донская, д. 8 стр. 1', avatar: '/sold4.png', coords: [55.76, 37.70], status: 'open', phone: '+79881234506' },
] as BoardRider[];

const CSS = `
.bm-overlay { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; padding:24px; background:rgba(10,16,32,.6); backdrop-filter:blur(6px); animation:bmBg .2s ease both; }
@keyframes bmBg { from{opacity:0} to{opacity:1} }
@keyframes bmPop { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.bm-modal { width:min(620px,100%); background:#fff; border-radius:22px; box-shadow:0 36px 90px rgba(0,0,0,.4); animation:bmPop .28s cubic-bezier(.2,.8,.2,1) both; overflow:hidden; }
.bm-modal.wide { width:min(880px,100%); max-height:88vh; display:flex; flex-direction:column; }
.bm-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:20px 26px; }
.bm-title { display:flex; align-items:center; gap:12px; font-size:22px; font-weight:800; color:#111; }
.bm-close { width:40px; height:40px; border:none; border-radius:12px; background:#F1F3F7; color:#6B7280; font-size:22px; cursor:pointer; display:grid; place-items:center; transition:all .18s; flex-shrink:0; }
.bm-close:hover { background:#FEF2F2; color:#EF4444; }
.bm-toggle { display:flex; background:#F1F3F7; border-radius:11px; padding:4px; gap:4px; margin-left:auto; }
.bm-toggle button { border:none; background:none; padding:8px 18px; border-radius:8px; font:600 14px inherit; color:#6B7280; cursor:pointer; transition:all .18s; }
.bm-toggle button.active { background:#fff; color:#111; box-shadow:0 2px 8px rgba(17,24,39,.1); }

.bm-step { padding:6px 26px 24px; text-align:center; }
.bm-step-no { font-size:14px; color:#9CA3AF; margin-bottom:10px; }
.bm-q { font-size:22px; font-weight:800; color:#111; margin:0 0 22px; }
.bm-input { width:100%; height:56px; padding:0 18px; border:1px solid #E5E7EB; border-radius:14px; background:#fff; font:15px inherit; color:#111; outline:none; box-sizing:border-box; transition:border-color .2s ease,box-shadow .2s ease; }
.bm-input:focus { border-color:#375DFB; box-shadow:0 0 0 3px rgba(55,93,251,.12); }
.bm-seat { display:flex; align-items:center; height:56px; border:1px solid #E5E7EB; border-radius:14px; overflow:hidden; }
.bm-seat .lbl { flex:1; padding:0 18px; color:#9CA3AF; font-size:14px; text-align:left; }
.bm-seat input { width:120px; height:100%; border:none; border-left:1px solid #E5E7EB; padding:0 18px; font:15px inherit; color:#111; outline:none; }
.bm-phone { display:flex; align-items:center; height:56px; border:1px solid #E5E7EB; border-radius:14px; overflow:hidden; }
.bm-phone .pref { display:flex; align-items:center; gap:6px; padding:0 14px; height:100%; border-right:1px solid #E5E7EB; color:#374151; font:600 15px inherit; white-space:nowrap; }
.bm-phone input { flex:1; height:100%; border:none; padding:0 16px; font:15px inherit; color:#111; outline:none; }
.bm-foot { display:flex; gap:14px; padding:0 26px 24px; }
.bm-back { height:54px; padding:0 28px; border:none; border-radius:14px; background:#F1F3F7; color:#374151; font:700 15px inherit; cursor:pointer; transition:background .2s; }
.bm-back:hover { background:#E5E7EB; }
.bm-next { flex:1; height:54px; border:none; border-radius:14px; background:linear-gradient(180deg,#4B6BFF,#375DFB); color:#fff; font:700 15px inherit; cursor:pointer; transition:all .2s ease; box-shadow:0 8px 22px rgba(55,93,251,.3); }
.bm-next:hover { filter:brightness(1.05); transform:translateY(-2px); box-shadow:0 12px 28px rgba(55,93,251,.42); }

.bm-body { overflow-y:auto; }
.bm-row { display:flex; align-items:center; gap:14px; padding:16px 26px; border-top:1px solid #F0F1F3; flex-wrap:wrap; }
.bm-av { width:52px; height:52px; border-radius:50%; overflow:hidden; flex-shrink:0; background:#1a2744; }
.bm-av img { width:100%; height:100%; object-fit:cover; }
.bm-info { flex:1; min-width:160px; }
.bm-name { font-size:16px; font-weight:700; color:#111; }
.bm-from { font-size:13px; color:#9CA3AF; margin-top:2px; }
.bm-from b { color:#374151; font-weight:500; }
.bm-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.bm-status { display:inline-flex; align-items:center; gap:7px; font-size:14px; font-weight:600; }
.bm-status.ok { color:#16A34A; }
.bm-status.wait { color:#F59E0B; }
.bm-ico { width:42px; height:42px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#6B7280; cursor:pointer; display:grid; place-items:center; transition:all .2s ease; }
.bm-ico:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; }
.bm-route { display:inline-flex; align-items:center; gap:8px; height:42px; padding:0 16px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#374151; font:600 13px inherit; cursor:pointer; transition:all .2s ease; }
.bm-route:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; }
.bm-take { height:42px; padding:0 18px; border:1px solid #C7D2FE; border-radius:11px; background:#EBF1FF; color:#375DFB; font:700 13px inherit; cursor:pointer; transition:all .2s ease; }
.bm-take:hover { background:#375DFB; border-color:#375DFB; color:#fff; box-shadow:0 8px 18px rgba(55,93,251,.35); }
.bm-map { padding:0; }
.bm-toast { position:fixed; left:50%; bottom:32px; transform:translateX(-50%); z-index:10001; background:#111827; color:#fff; font-size:14px; font-weight:600; padding:13px 22px; border-radius:12px; box-shadow:0 16px 40px rgba(0,0,0,.3); }
`;

function injectCss() {
  if (typeof document === 'undefined' || document.getElementById('bm-css')) return;
  const s = document.createElement('style'); s.id = 'bm-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; };
const CarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17a2 2 0 0 1-2-2v-3l2-5a2 2 0 0 1 1.9-1.4h8.2A2 2 0 0 1 19 7l2 5v3a2 2 0 0 1-2 2M7 17v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1m15 0v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1M5 12h14" /><circle cx="7.5" cy="14.5" r="1" fill="#111" /><circle cx="16.5" cy="14.5" r="1" fill="#111" /></svg>;
const PhoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
const RouteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h6a3 3 0 0 0 3-3V8" /></svg>;

function routeTo(coords: [number, number]) {
  const [lat, lng] = coords;
  window.open(`https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto&z=14`, '_blank', 'noopener,noreferrer');
}

export function BoardModal({ onClose }: { onClose: () => void }) {
  injectCss();
  const [step, setStep] = useState<1 | 2 | 3 | 0>(1);
  const [address, setAddress] = useState('г. Москва, ул. Пушкина, д.2');
  const [seats, setSeats] = useState('4');
  const [phone, setPhone] = useState('988 252 - 14 - 22');
  const [tab, setTab] = useState<'list' | 'map'>('list');
  const [taken, setTaken] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(''), 2400); return () => window.clearTimeout(t); }, [toast]);

  const take = (r: BoardRider) => { setTaken(s => new Set(s).add(r.id)); setToast(`Приглашение отправлено: ${r.name}`); };

  const wizard = (
    <div className="bm-modal" onClick={e => e.stopPropagation()}>
      <div className="bm-head">
        <div className="bm-title"><CarIcon />Возьму на борт</div>
        <button className="bm-close" onClick={onClose} aria-label="Закрыть">×</button>
      </div>
      <div className="bm-step">
        <div className="bm-step-no">{step}/3 шаг</div>
        {step === 1 && (<>
          <h3 className="bm-q">Откуда вы выезжаете?</h3>
          <input className="bm-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Укажите адрес" />
        </>)}
        {step === 2 && (<>
          <h3 className="bm-q">Сколько человек сможете взять?</h3>
          <div className="bm-seat"><span className="lbl">Осталось мест в транспорте</span><input type="number" min="1" value={seats} onChange={e => setSeats(e.target.value)} /></div>
        </>)}
        {step === 3 && (<>
          <h3 className="bm-q">Укажите телефон для связи</h3>
          <div className="bm-phone"><span className="pref">🇷🇺 +7 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></span><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="900 000 - 00 - 00" /></div>
        </>)}
      </div>
      <div className="bm-foot">
        {step === 3 && <button className="bm-back" onClick={() => setStep(2)}>Назад</button>}
        <button className="bm-next" onClick={() => setStep(s => (s === 3 ? 0 : ((s as number) + 1) as 1 | 2 | 3))}>Продолжить</button>
      </div>
    </div>
  );

  const result = (
    <div className="bm-modal wide" onClick={e => e.stopPropagation()}>
      <div className="bm-head">
        <div className="bm-title"><CarIcon />Возьму на борт</div>
        <div className="bm-toggle">
          <button className={tab === 'list' ? 'active' : ''} onClick={() => setTab('list')}>Список</button>
          <button className={tab === 'map' ? 'active' : ''} onClick={() => setTab('map')}>Карта</button>
        </div>
        <button className="bm-close" onClick={onClose} aria-label="Закрыть">×</button>
      </div>
      {tab === 'list' ? (
        <div className="bm-body">
          {RIDERS.map(r => {
            const isTaken = taken.has(r.id);
            return (
              <div key={r.id} className="bm-row">
                <div className="bm-av"><img src={r.avatar} alt={r.name} onError={imgFallback} /></div>
                <div className="bm-info">
                  <div className="bm-name">{r.name}</div>
                  <div className="bm-from">Откуда: <b>{r.address}</b></div>
                </div>
                <div className="bm-actions">
                  {r.status === 'accepted' && !isTaken && (
                    <span className="bm-status ok"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Принял приглашения</span>
                  )}
                  {r.status === 'pending' && !isTaken && (
                    <span className="bm-status wait"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>Ожидает подтверждения</span>
                  )}
                  {isTaken && (
                    <span className="bm-status ok"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Приглашение отправлено</span>
                  )}
                  <button className="bm-ico" title="Позвонить" onClick={() => window.open(`tel:${r.phone || '+79880000000'}`, '_self')}><PhoneIcon /></button>
                  {r.status !== 'pending' && <button className="bm-route" onClick={() => routeTo(r.coords)}><RouteIcon />Маршрут</button>}
                  {r.status === 'open' && !isTaken && <button className="bm-take" onClick={() => take(r)}>Взять на борт</button>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bm-map"><YandexTrainingMap riders={RIDERS} onTakeRider={r => take(r as BoardRider)} height={520} /></div>
      )}
    </div>
  );

  return createPortal(
    <div className="bm-overlay" onClick={onClose}>
      {step === 0 ? result : wizard}
      {toast && <div className="bm-toast">{toast}</div>}
    </div>,
    document.body,
  );
}
