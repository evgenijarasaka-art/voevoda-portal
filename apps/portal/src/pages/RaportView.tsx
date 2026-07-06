import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { VoevodaPlayer } from '../components/VoevodaPlayer';
import { PortalPageTop } from '../components/PortalPageTop';

/* ─── данные рапорта ─── */
const REPORT = {
  title: 'Улучшение физической подготовки',
  text: 'Докладываю Вам, что в 17час. 43мин. 24.04.2014 года, при несении службы по охране общественного порядка, на маршруте патрулирования «Центр» в составе старшего наряда командира отделения 3 роты батальона полиции ОВО прапорщика полиции Хватова А.П., полицейского ГЗ батальона полиции ОВО рядового полиции Шустова Р.В. было получено сообщение от оперативного дежурного по ОП № 6 о том, что во дворе дома № 65 по ул. 40 лет Победы, трое неизвестных, избивают одного гражданина, у одного из напавших имеется нож. Докладываю Вам, что в 17час. 43мин. 24.04.2014 года, при несении службы по охране общественного порядка, на маршруте патрулирования «Центр» в составе старшего наряда командира отделения 3 роты батальона полиции ОВО прапорщика полиции Хватова А.П., полицейского ГЗ батальона полиции ОВО рядового полиции Шустова Р.В. было получено сообщение от оперативного дежурного по ОП № 6 о том, что во дворе дома № 65 по ул. 40 лет Победы, трое неизвестных, избивают одного гражданина, у одного из напавших имеется нож.',
  photos: [
    '/military-course.jpg', '/sold1.png', '/sold2.png', '/voendelo2.png', '/kyrs1.png',
    '/kyrs2.png', '/kyrs3.png', '/tank.png', '/sold3.png', '/teacher1-main.jpg',
    '/teacher2-main.jpg', '/teacher3-main.jpg', '/military-course.jpg', '/voendelo2.png', '/sold1.png',
  ],
  video: '/video/den-rossii.mp4',
  videoPoster: '/video/den-rossii.jpg',
  files: [
    { name: 'otchet_po_zadacham.pdf', size: '12 мб' },
    { name: 'otchet_po_zadacham.pdf', size: '12 мб' },
  ],
  fields: [
    { label: 'Отправитель', value: 'Алексей Абрамов' },
    { label: 'Должность', value: 'Зам. командира взвода' },
    { label: 'Звание', value: 'Капитан' },
    { label: 'Позывной', value: 'Торнадо' },
    { label: 'Срок выполнения', value: '12 октября, 2024' },
    { label: 'Время выполнения', value: '12 часов' },
  ],
};

const CSS = `
.rv-page { padding-top:60px; margin-left:56px; min-height:100vh; background:#F8F9FB; }
.rv-wrap { padding:20px 24px 56px; }
.rv-panel { background:#fff; border:1px solid #E5E7EB; border-radius:20px; overflow:hidden; animation:rvFade .4s ease both; }
@keyframes rvFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
.rv-head { display:flex; align-items:center; gap:12px; padding:22px 28px; }
.rv-head h1 { margin:0; font-size:24px; font-weight:800; color:#111; }
.rv-crumbs { display:flex; align-items:center; gap:8px; padding:13px 28px; border-top:1px solid #F0F1F3; border-bottom:1px solid #F0F1F3; font-size:13px; color:#9CA3AF; flex-wrap:wrap; }
.rv-crumbs button { border:none; background:none; cursor:pointer; color:#9CA3AF; font:inherit; padding:0; transition:color .15s; }
.rv-crumbs button:hover { color:#375DFB; }
.rv-crumbs .cur { color:#374151; font-weight:500; }
.rv-body { padding:28px 36px 36px; max-width:1040px; margin:0 auto; }
.rv-title { text-align:center; font-size:24px; font-weight:800; color:#111; margin:0 0 22px; }
.rv-text { font-size:15px; color:#374151; line-height:1.85; margin:0 0 28px; }

.rv-media { display:flex; gap:24px; flex-wrap:wrap; margin-bottom:24px; }
.rv-media-photos { flex:1; min-width:280px; }
.rv-media-video { flex-shrink:0; }
.rv-mlabel { font-size:13px; color:#9CA3AF; margin-bottom:10px; }
.rv-thumbs { display:flex; gap:12px; flex-wrap:wrap; }
.rv-thumb { position:relative; width:118px; height:96px; border-radius:12px; overflow:hidden; background:#EEF0F4; cursor:pointer; transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s ease; }
.rv-thumb:hover { transform:translateY(-3px) scale(1.03); box-shadow:0 12px 26px rgba(26,39,68,.18); }
.rv-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.rv-thumb .rv-corner { position:absolute; top:0; left:0; border-width:0 16px 16px 0; border-style:solid; border-color:transparent rgba(15,23,42,.55) transparent transparent; }
.rv-thumb .rv-more { position:absolute; inset:0; background:rgba(12,20,40,.6); display:grid; place-items:center; color:#fff; font-size:22px; font-weight:800; }
.rv-thumb .rv-play { position:absolute; inset:0; display:grid; place-items:center; }
.rv-thumb .rv-play span { width:42px; height:42px; border-radius:50%; background:rgba(255,255,255,.92); display:grid; place-items:center; box-shadow:0 6px 16px rgba(0,0,0,.3); }

.rv-files-label { font-size:13px; color:#9CA3AF; margin:0 0 12px; }
.rv-files { display:flex; gap:16px; flex-wrap:wrap; margin-bottom:8px; }
.rv-file { display:flex; align-items:center; justify-content:space-between; gap:16px; width:300px; max-width:100%; border:1px solid #E5E7EB; border-radius:14px; padding:14px 18px; transition:border-color .2s ease,box-shadow .2s ease; }
.rv-file:hover { border-color:#C7D2FE; box-shadow:0 8px 18px rgba(55,93,251,.1); }
.rv-file-name { font-size:14px; font-weight:600; color:#111; }
.rv-file-size { font-size:12px; color:#9CA3AF; margin-top:3px; }
.rv-dl { width:38px; height:38px; flex-shrink:0; border:none; border-radius:10px; background:#F1F3F7; color:#6B7280; cursor:pointer; display:grid; place-items:center; transition:all .2s ease; }
.rv-dl:hover { background:#EBF1FF; color:#375DFB; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.18); }
.rv-dl:active { transform:scale(.92); }

.rv-divider { height:1px; background:#F0F1F3; margin:30px 0 26px; }
.rv-fields { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
@media(max-width:760px){ .rv-fields { grid-template-columns:1fr; } }
.rv-field { border:1px solid #E5E7EB; border-radius:14px; padding:14px 18px; }
.rv-field .k { font-size:13px; color:#9CA3AF; margin-bottom:6px; }
.rv-field .v { font-size:16px; font-weight:700; color:#111; }

/* лайтбокс фото */
.rv-lb { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; padding:24px; background:rgba(8,12,24,.86); backdrop-filter:blur(6px); animation:rvFade .2s ease both; }
.rv-lb-img { max-width:90vw; max-height:80vh; border-radius:12px; box-shadow:0 30px 80px rgba(0,0,0,.5); object-fit:contain; animation:rvLbPop .26s cubic-bezier(.2,.8,.2,1) both; }
@keyframes rvLbPop { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
.rv-lb-close { position:absolute; top:20px; right:24px; width:44px; height:44px; border:none; border-radius:12px; background:rgba(255,255,255,.12); color:#fff; font-size:24px; cursor:pointer; display:grid; place-items:center; transition:background .2s; }
.rv-lb-close:hover { background:rgba(255,255,255,.26); }
.rv-lb-nav { position:absolute; top:50%; transform:translateY(-50%); width:54px; height:54px; border:none; border-radius:50%; background:rgba(255,255,255,.14); color:#fff; cursor:pointer; display:grid; place-items:center; transition:background .2s,transform .2s; }
.rv-lb-nav:hover { background:rgba(255,255,255,.3); }
.rv-lb-prev { left:24px; } .rv-lb-next { right:24px; }
.rv-lb-count { position:absolute; bottom:24px; left:50%; transform:translateX(-50%); color:#fff; font-size:14px; font-weight:600; background:rgba(0,0,0,.5); padding:7px 16px; border-radius:20px; }
.rv-lb-strip { position:absolute; bottom:64px; left:50%; transform:translateX(-50%); display:flex; gap:8px; max-width:90vw; overflow-x:auto; padding:4px; }
.rv-lb-strip img { width:54px; height:42px; object-fit:cover; border-radius:8px; cursor:pointer; opacity:.5; border:2px solid transparent; transition:opacity .2s,border-color .2s; }
.rv-lb-strip img:hover { opacity:.85; }
.rv-lb-strip img.active { opacity:1; border-color:#fff; }

/* видео-плеер */
.rv-vid { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; padding:24px; background:rgba(8,12,24,.88); backdrop-filter:blur(6px); animation:rvFade .2s ease both; }
.rv-vid-box { width:min(1040px,94vw); position:relative; animation:rvLbPop .26s cubic-bezier(.2,.8,.2,1) both; }
.rv-vid-close { position:absolute; top:-50px; right:0; width:42px; height:42px; border:none; border-radius:11px; background:rgba(255,255,255,.14); color:#fff; font-size:22px; cursor:pointer; display:grid; place-items:center; transition:background .2s; }
.rv-vid-close:hover { background:rgba(255,255,255,.3); }
`;

function injectCss() {
  if (typeof document === 'undefined' || document.getElementById('rv-css')) return;
  const s = document.createElement('style'); s.id = 'rv-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; };

/* Реальное скачивание: контент рендерится офскрин, снимается html2canvas
   и кладётся в jsPDF — пользователь получает готовый .pdf с кириллицей. */
async function downloadReportPdf() {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = REPORT.fields.map(f => `<tr><td class="k">${esc(f.label)}</td><td class="v">${esc(f.value)}</td></tr>`).join('');
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-100000px;top:0;width:760px;background:#fff;padding:36px 40px;box-sizing:border-box;';
  container.innerHTML = `
    <style>
      .rp-pdf * { box-sizing:border-box; font-family:'Segoe UI',Arial,sans-serif; }
      .rp-pdf .brand { font-size:12px; font-weight:800; letter-spacing:.1em; color:#375DFB; margin:0 0 10px; }
      .rp-pdf h1 { font-size:22px; margin:0 0 16px; color:#111; }
      .rp-pdf p.text { font-size:13px; line-height:1.7; color:#374151; margin:0 0 20px; }
      .rp-pdf table { width:100%; border-collapse:collapse; font-size:13px; }
      .rp-pdf td { padding:9px 12px; border:1px solid #E5E7EB; }
      .rp-pdf td.k { color:#6B7280; width:42%; }
      .rp-pdf td.v { color:#111; font-weight:600; }
      .rp-pdf .foot { margin-top:18px; font-size:11px; color:#9CA3AF; }
    </style>
    <div class="rp-pdf">
      <p class="brand">УТЦ «ВОЕВОДА» · РАПОРТ БОЙЦА</p>
      <h1>${esc(REPORT.title)}</h1>
      <p class="text">${esc(REPORT.text)}</p>
      <table><tbody>${rows}</tbody></table>
      <div class="foot">Документ сформирован порталом ВОЕВОДА.</div>
    </div>`;
  document.body.appendChild(container);
  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * pageW) / canvas.width;
    let position = 0;
    let heightLeft = imgH;
    pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH);
      heightLeft -= pageH;
    }
    pdf.save('otchet_po_zadacham.pdf');
  } catch {
    /* ignore */
  } finally {
    container.remove();
  }
}

function PhotoLightbox({ photos, index, onClose, onIndex }: { photos: string[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const go = (d: number) => onIndex((index + d + photos.length) % photos.length);
  return createPortal(
    <div className="rv-lb" onClick={onClose}>
      <button className="rv-lb-close" onClick={onClose} aria-label="Закрыть">×</button>
      <button className="rv-lb-nav rv-lb-prev" onClick={e => { e.stopPropagation(); go(-1); }} aria-label="Предыдущее">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <img className="rv-lb-img" src={photos[index]} alt="" onClick={e => e.stopPropagation()} onError={imgFallback} />
      <button className="rv-lb-nav rv-lb-next" onClick={e => { e.stopPropagation(); go(1); }} aria-label="Следующее">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
      <div className="voevoda-slider-panel" onClick={e => e.stopPropagation()}>
        {photos.map((_, i) => (
          <button key={i} className={`voevoda-slider-dot${i === index ? ' is-active' : ''}`} onClick={() => onIndex(i)} aria-label={`Фото ${i + 1}`} />
        ))}
      </div>
      <div className="rv-lb-count">{index + 1} / {photos.length}</div>
    </div>,
    document.body,
  );
}

function VideoModal({ onClose }: { onClose: () => void }) {
  const h = typeof window !== 'undefined' ? Math.min(640, Math.round(window.innerHeight * 0.72)) : 560;
  return createPortal(
    <div className="rv-vid" onClick={onClose}>
      <div className="rv-vid-box" onClick={e => e.stopPropagation()}>
        <button className="rv-vid-close" onClick={onClose} aria-label="Закрыть">×</button>
        <VoevodaPlayer src={REPORT.video} poster={REPORT.videoPoster} height={h} />
      </div>
    </div>,
    document.body,
  );
}

export function RaportView() {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  injectCss();

  const photos = REPORT.photos;
  const visible = photos.slice(0, 3);
  const more = photos.length - 3;

  useEffect(() => {
    if (lightbox === null && !videoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLightbox(null); setVideoOpen(false); }
      else if (lightbox !== null && e.key === 'ArrowRight') setLightbox(i => (i === null ? i : (i + 1) % photos.length));
      else if (lightbox !== null && e.key === 'ArrowLeft') setLightbox(i => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [lightbox, videoOpen, photos.length]);

  return (
    <div className="rv-page">
      <div className="rv-wrap">
        <div className="rv-panel">
          <PortalPageTop title="Рапорт бойца" icon={<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M15 8h3M15 12h3M7 16h10" /></svg>} />

          <div className="rv-body">
            <h2 className="rv-title">{REPORT.title}</h2>
            <p className="rv-text">{REPORT.text}</p>

            {/* фото + видео */}
            <div className="rv-media">
              <div className="rv-media-photos">
                <div className="rv-mlabel">Прикрепленные фото</div>
                <div className="rv-thumbs">
                  {visible.map((src, i) => (
                    <div key={i} className="rv-thumb" onClick={() => setLightbox(i)} title="Открыть фото"><span className="rv-corner" /><img src={src} alt="" onError={imgFallback} /></div>
                  ))}
                  <div className="rv-thumb" onClick={() => setLightbox(3)} title="Смотреть все фото">
                    <img src={photos[3]} alt="" onError={imgFallback} />
                    <div className="rv-more">+{more}</div>
                  </div>
                </div>
              </div>
              <div className="rv-media-video">
                <div className="rv-mlabel">Видео</div>
                <div className="rv-thumb" onClick={() => setVideoOpen(true)} title="Смотреть видео">
                  <img src={REPORT.videoPoster} alt="" onError={imgFallback} />
                  <div className="rv-play"><span><svg width="16" height="16" viewBox="0 0 24 24" fill="#375DFB"><polygon points="6 4 20 12 6 20 6 4" /></svg></span></div>
                </div>
              </div>
            </div>

            {/* файлы */}
            <div className="rv-files-label">Файлы</div>
            <div className="rv-files">
              {REPORT.files.map((f, i) => (
                <div key={i} className="rv-file">
                  <div>
                    <div className="rv-file-name">{f.name}</div>
                    <div className="rv-file-size">{f.size}</div>
                  </div>
                  <button className="rv-dl" title="Скачать" aria-label="Скачать файл" onClick={() => void downloadReportPdf()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="rv-divider" />

            {/* поля */}
            <div className="rv-fields">
              {REPORT.fields.map((f, i) => (
                <div key={i} className="rv-field"><div className="k">{f.label}</div><div className="v">{f.value}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {lightbox !== null && <PhotoLightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />}
      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
    </div>
  );
}
