import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { YandexTrainingMap } from '../components/YandexTrainingMap';
import { ReportFormModal } from '../components/ReportModals';
import { BoardModal } from '../components/BoardModal';
import { RideRequestModal } from '../components/RideRequestModal';

/* ─── данные учения ─── */
const EX = {
  title: 'Ориентирование в лесистой местности',
  desc: 'Учебное мероприятие направлено на развитие навыков военных по ориентированию в сложных природных условиях, таких как лесистая местность. В ходе учений личный состав будет обучен использованию картографических материалов, компасов, а также.',
  hero: '/military-course.jpg',
  city: 'Москва', date: '1 августа, 2024', time: '09:00-17:00', polygon: 'Алабино', coords: '55.540807, 36.923986',
  venue: { name: 'Полигон «Калибр»', address: 'Минское шоссе, 31-й километр, с1', canBoard: 7, needRide: 16 },
  director: { name: 'Торнадо_92', rank: 'Майор', role: 'Командир 2-го взвода', avatar: '/teacher2-main.jpg' },
  hidden: {
    title: 'Защитники Отечества',
    desc: 'Учения "Защитники Отечества" направлены на подготовку личного состава и гражданских специалистов к действиям в условиях военной агрессии. Основное внимание уделяется вопросам оперативного планирования, ведению боевых действий в приграничной зоне, организации оборонительных рубежей и мобилизации всех ресурсов для защиты территории.',
    legend: 'В условиях обострения международной обстановки на восточных рубежах страны, возникла угроза территориальной целостности государства. Войска и силовые структуры приведены в полную боевую готовность. Столкновение на границе неизбежно. Задача учений — моделировать защиту рубежей с применением различных видов вооружений, а также отработать координацию действий разных родов войск, спецподразделений и гражданских структур в условиях приближенных к боевым.',
    sides: [
      { flag: '🚩', title: 'Сторона №1 - Агрессор', desc: 'Задача заключается в попытке захвата стратегически важных объектов на приграничной территории. Используя мобильные ударные группы, диверсионные подразделения и авиационную поддержку, "Агрессор" должен создать плацдарм для наступления и выйти на ключевые позиции.', leader: { name: 'Торнадо_92', role: 'Командир стороны №1', rank: 'Майор', sub: 'Командир 2-го взвода', avatar: '/teacher2-main.jpg' }, extra: 9 },
      { flag: '🟢', title: 'Сторона №2 - Защитник', desc: 'Основная цель — защита государственной границы и недопущение захвата стратегически важных объектов. Необходимо организовать эшелонированную оборону, использовать имеющиеся ресурсы и эффективно координировать действия армейских подразделений, спецподразделений и гражданских сил для отражения атак "Агрессора".', leader: { name: 'Бека', role: 'Командир стороны №2', rank: 'Майор', sub: 'Командир 2-го взвода', avatar: '/sold4.png' }, extra: 9 },
    ],
  },
  rules: [
    'Ограниченное время — учения должны быть проведены в сжатые сроки, чтобы максимально приблизить условия к реальным.',
    'Использование современных средств связи и координации — все взаимодействия должны вестись с применением современных технологий.',
    'Имитация реальной боевой обстановки — будут применяться пиротехнические средства, имитаторы стрельбы и артиллерийских ударов, чтобы создать ощущение реальности угрозы.',
    'Моделирование гражданской обороны — включение гражданских организаций в учения для отработки эвакуации населения, мобилизации и работы служб поддержки.',
    'Нейтрализация диверсионных угроз — внедрение в сценарий учений диверсионных групп "Агрессора" с задачами нарушить работу связи, диверсифицировать ресурсы и провести разведывательные операции.',
  ],
  rulePhotos: ['/military-course.jpg', '/voendelo2.png', '/kyrs2.png', '/kyrs3.png'],
  mapImage: '/картаучений.png',
  avatars: ['/sold1.png', '/sold2.png', '/sold3.png', '/sold4.png'],
  faq: [
    { q: 'Как проходят учения?', a: 'Учебное мероприятие направлено на развитие навыков военных по ориентированию в сложных природных условиях, таких как лесистая местность. В ходе учений личный состав будет обучен использованию картографических материалов, компасов, а также.' },
    { q: 'Когда командир получает задание?', a: 'Командир получает вводную задачу за 24 часа до начала учений, а уточняющие задачи — непосредственно в ходе мероприятия по мере развития обстановки.' },
    { q: 'Сколько длятся учения?', a: 'Продолжительность зависит от сценария: от одного дня до нескольких суток с учётом ночных этапов и пауз на отдых личного состава.' },
    { q: 'Что я получу за успешное прохождение учений?', a: 'По итогам начисляются баллы Индекса Воеводы, знаки отличия и запись в личное дело, которые учитываются при дальнейшем распределении и присвоении званий.' },
  ],
};

const EX_TITLES: Record<string, string> = {
  '1': 'Ориентирование в лесистой местности',
  '2': 'Личная тактическая подготовка снайпера',
  '3': 'Личная тактическая подготовка снайпера',
};

const ARRIVAL_OPTIONS = ['Я в строю', 'Опоздаю', 'Не смогу прибыть'];
const VOTE_TOTALS: Record<string, number> = { 'Я в строю': 12, 'Опоздаю': 3, 'Не смогу прибыть': 2 };
const CHECKLIST = ['Удостоверение курсанта', 'Форма по погоде', 'Вода — 1.5 литра', 'Паёк на день', 'Индивидуальная аптечка', 'Компас'];

const CSS = `
.xd-page { padding-top:60px; margin-left:56px; min-height:100vh; background:#F8F9FB; font-family:"Exo 2",sans-serif; color:#17213a; }
.xd-wrap { padding:20px 24px 56px; }
.xd-panel { background:#fff; border:1px solid #E5E7EB; border-radius:20px; overflow:hidden; animation:xdFade .4s ease both; }
@keyframes xdFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes xdRise { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.xd-body { padding:26px 28px 36px; }

/* reveal-анимация секций */
.xd-sec { opacity:0; transform:translateY(16px); transition:opacity .5s cubic-bezier(.4,0,.2,1),transform .5s cubic-bezier(.4,0,.2,1); }
.xd-sec.vis { opacity:1; transform:translateY(0); }

/* верхний блок */
.xd-top { display:flex; gap:28px; flex-wrap:wrap; margin-bottom:28px; }
.xd-top-left { flex:1; min-width:300px; display:flex; flex-direction:column; gap:14px; }
.xd-top-right { flex:0 0 340px; min-width:300px; display:flex; flex-direction:column; gap:14px; }
@media(max-width:980px){ .xd-top-right { flex:1 1 100%; } }

.xd-title { font:400 22px/1.25 "Russo One",sans-serif; color:#17213a; margin:0; }
.xd-desc { font-size:14px; color:#6B7280; line-height:1.7; margin:0; }

/* мета-строки */
.xd-meta { border:1px solid #E9EDF6; border-radius:14px; overflow:hidden; }
.xd-meta-row { display:grid; grid-template-columns:160px 1fr; padding:10px 16px; font-size:13.5px; border-bottom:1px solid #F3F4F6; }
.xd-meta-row:last-child { border-bottom:none; }
.xd-meta-row .k { color:#9CA3AF; }
.xd-meta-row .v { color:#17213a; font-weight:600; }
.xd-meta-row .v.link { color:#375DFB; cursor:pointer; }
.xd-meta-row .v.link:hover { text-decoration:underline; }

/* герой и карта */
.xd-hero { width:100%; height:220px; border-radius:14px; overflow:hidden; background:#EEF0F4; flex-shrink:0; }
.xd-hero img { width:100%; height:100%; object-fit:cover; display:block; }
.xd-map-wrap { border-radius:14px; overflow:hidden; border:1px solid #E5E7EB; flex-shrink:0; }

/* мини-кнопки */
.xd-mini { display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 14px; border:1.5px solid #E5E7EB; border-radius:8px; background:#fff; color:#374151; font:600 13px "Exo 2",sans-serif; cursor:pointer; transition:border-color .18s,background .18s,color .18s,transform .18s,box-shadow .18s; white-space:nowrap; }
.xd-mini:hover { border-color:#c7d2fe; background:#EEF3FF; color:#375DFB; transform:translateY(-2px); box-shadow:0 6px 16px rgba(55,93,251,.12); }
.xd-mini:active { transform:translateY(0); box-shadow:none; }
.xd-mini.blue { border-color:#c7d2fe; background:linear-gradient(135deg,#eef2ff,#dde6ff); color:#375DFB; }
.xd-mini.blue:hover { background:linear-gradient(135deg,#2F52F0,#5B7FFF); border-color:transparent; color:#fff; box-shadow:0 8px 22px rgba(55,93,251,.36); }

/* голосование */
.xd-vote-btn { height:44px; padding:0 24px; border:none; border-radius:8px; background:linear-gradient(135deg,#2F52F0,#5B7FFF); color:#fff; font:700 14px "Exo 2",sans-serif; cursor:pointer; transition:transform .18s,box-shadow .18s; box-shadow:0 6px 18px rgba(55,93,251,.28); }
.xd-vote-btn:not(:disabled):hover { transform:translateY(-2px); box-shadow:0 10px 26px rgba(55,93,251,.42); }
.xd-vote-btn:disabled { cursor:default; }

/* руководитель */
.xd-leader { display:flex; align-items:center; gap:14px; border:1px solid #E9EDF6; background:#F7F8FB; border-radius:14px; padding:14px 18px; flex-wrap:wrap; }
.xd-leader-av { width:50px; height:50px; border-radius:50%; overflow:hidden; flex-shrink:0; background:#1a2744; }
.xd-leader-av img { width:100%; height:100%; object-fit:cover; }
.xd-leader-name { font-size:15px; font-weight:700; color:#17213a; }
.xd-leader-sub { font-size:12px; color:#9CA3AF; margin-top:2px; }
.xd-leader-actions { margin-left:auto; display:flex; gap:8px; flex-wrap:wrap; }

/* метки секций */
.xd-section-label { font:400 20px "Russo One",sans-serif; color:#17213a; margin:32px 0 14px; display:flex; align-items:center; gap:10px; }
.xd-section-label::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,#e3e7ef,transparent); }

.xd-hidden-title { font-size:15px; font-weight:700; color:#17213a; margin:0 0 7px; }
.xd-hidden-text { font-size:13.5px; color:#6B7280; line-height:1.7; margin:0 0 16px; }

/* стороны */
.xd-side { border:1px solid #E9EDF6; border-radius:14px; padding:16px 18px; margin-bottom:12px; }
.xd-side-head { font-size:15px; font-weight:700; color:#17213a; margin-bottom:6px; }
.xd-side-desc { font-size:13px; color:#6B7280; line-height:1.6; margin:0 0 14px; }
.xd-side-row { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.xd-side-leader { display:flex; align-items:center; gap:12px; min-width:0; flex:1; }
.xd-side-squad { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.xd-avatars { display:flex; align-items:center; }
.xd-avatars img { width:36px; height:36px; border-radius:50%; border:2px solid #fff; object-fit:cover; margin-left:-9px; background:#1a2744; }
.xd-avatars img:first-child { margin-left:0; }
.xd-avatars .more { width:36px; height:36px; border-radius:50%; border:2px solid #fff; background:#EBF1FF; color:#375DFB; font-size:12px; font-weight:800; display:grid; place-items:center; margin-left:-9px; }
.xd-instroy { height:36px; padding:0 16px; border:1.5px solid #E5E7EB; border-radius:8px; background:#fff; color:#6B7280; font:600 12px "Exo 2",sans-serif; cursor:default; white-space:nowrap; flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; }
@media(max-width:600px){ .xd-side-row { flex-direction:column; align-items:flex-start; } .xd-side-squad { margin-left:0; } }

/* правила */
.xd-rules-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:0 0 12px; flex-wrap:wrap; }
.xd-rules-head .t { font-size:14px; font-weight:700; color:#17213a; }
.xd-dl-btn { display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 14px; border:1.5px solid #E5E7EB; border-radius:8px; background:#fff; color:#374151; font:600 13px "Exo 2",sans-serif; cursor:pointer; transition:border-color .18s,background .18s,color .18s,transform .18s,box-shadow .18s; }
.xd-dl-btn:hover { border-color:#c7d2fe; color:#375DFB; background:#EEF3FF; transform:translateY(-1px); box-shadow:0 4px 12px rgba(55,93,251,.1); }
.xd-rules { margin:0 0 16px; padding-left:20px; }
.xd-rules li { font-size:13.5px; color:#374151; line-height:1.75; margin-bottom:8px; }

/* фото */
.xd-photos { display:flex; gap:12px; flex-wrap:wrap; }
.xd-photo { width:148px; height:94px; border-radius:10px; overflow:hidden; background:#EEF0F4; cursor:pointer; transition:transform .22s ease,box-shadow .22s ease; }
.xd-photo:hover { transform:translateY(-3px) scale(1.04); box-shadow:0 12px 28px rgba(26,39,68,.16); }
.xd-photo img { width:100%; height:100%; object-fit:cover; }

/* карта учений */
.xd-map-img { position:relative; width:100%; max-height:340px; border-radius:14px; overflow:hidden; border:1px solid #E5E7EB; background:#F3F4F6; margin-top:12px; cursor:zoom-in; }
.xd-map-img img { width:100%; display:block; max-height:340px; object-fit:contain; }
.xd-map-zoom-hint { position:absolute; top:10px; right:10px; background:rgba(0,0,0,.45); border-radius:8px; padding:5px 9px; color:#fff; display:flex; align-items:center; gap:5px; font:600 12px "Exo 2",sans-serif; pointer-events:none; }

/* задача */
.xd-task { display:flex; align-items:center; justify-content:space-between; gap:16px; border:1px solid #e9edf6; border-radius:14px; padding:18px 20px; margin-top:16px; flex-wrap:wrap; background:linear-gradient(135deg,#f8f9ff,#f0f4ff); }
.xd-task .t { font-size:14px; font-weight:700; color:#17213a; }
.xd-task .s { font-size:12.5px; color:#9CA3AF; margin-top:3px; }
.xd-timer { display:inline-flex; align-items:center; gap:7px; font-size:13px; color:#6B7280; }
.xd-timer b { font-variant-numeric:tabular-nums; color:#375DFB; font-size:18px; font-weight:700; font-family:monospace; }

/* FAQ */
.xd-faq { border:1px solid #E9EDF6; border-radius:16px; padding:22px 24px; margin-top:24px; }
.xd-faq-title { display:flex; align-items:center; gap:10px; font:400 20px "Russo One",sans-serif; color:#17213a; margin-bottom:16px; }
.xd-faq-item { border:1px solid #E9EDF6; border-radius:12px; padding:14px 16px; margin-bottom:10px; transition:border-color .2s,box-shadow .2s; }
.xd-faq-item.open { border-color:#c7d2fe; box-shadow:0 6px 18px rgba(55,93,251,.07); }
.xd-faq-q { display:flex; align-items:center; justify-content:space-between; gap:12px; cursor:pointer; font-size:14px; font-weight:600; color:#17213a; }
.xd-faq-toggle { width:28px; height:28px; border-radius:8px; background:#F1F4FB; color:#375DFB; display:grid; place-items:center; flex-shrink:0; transition:background .15s; }
.xd-faq-item.open .xd-faq-toggle { background:#EBF1FF; }
.xd-faq-a { font-size:13.5px; color:#6B7280; line-height:1.65; margin-top:10px; }

/* лайтбокс */
.xd-lb { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; padding:24px; background:rgba(8,12,24,.86); backdrop-filter:blur(6px); animation:xdFade .2s ease both; }
.xd-lb img { max-width:90vw; max-height:85vh; border-radius:12px; box-shadow:0 30px 80px rgba(0,0,0,.5); object-fit:contain; }
.xd-lb-close { position:absolute; top:20px; right:24px; width:44px; height:44px; border:none; border-radius:12px; background:rgba(255,255,255,.12); color:#fff; font-size:24px; cursor:pointer; transition:background .15s; }
.xd-lb-close:hover { background:rgba(255,255,255,.22); }
.xd-lb-nav { position:absolute; top:50%; transform:translateY(-50%); width:50px; height:50px; border:none; border-radius:50% !important; background:rgba(255,255,255,.14); color:#fff; cursor:pointer; display:grid; place-items:center; transition:background .18s,transform .18s; }
.xd-lb-nav:hover { background:rgba(255,255,255,.28); transform:translateY(-50%) scale(1.08); }
.xd-lb-prev { left:24px; } .xd-lb-next { right:24px; }

.xd-toast { position:fixed; left:50%; bottom:32px; transform:translateX(-50%); z-index:10001; background:#17213a; color:#fff; font-size:14px; font-weight:600; padding:13px 22px; border-radius:12px; box-shadow:0 16px 40px rgba(0,0,0,.3); animation:xdRise .25s ease both; }

@media(max-width:768px){ .xd-page{ margin-left:0; } .xd-wrap{ padding-inline:14px; } }

/* кастомный хедер страницы (не скрывается глобальным CSS) */
.xd-hdr { width:100%; background:#fff; }
.xd-hdr-bar { min-height:60px; padding:14px 28px; display:flex; align-items:center; gap:10px; border-bottom:1px solid #E5E7EB; }
.xd-hdr-icon { width:20px; height:20px; color:#374151; flex-shrink:0; display:grid; place-items:center; }
.xd-hdr-icon svg { width:20px; height:20px; stroke:currentColor; }
.xd-hdr-h1 { margin:0; font-size:20px; font-weight:700; color:#111; line-height:1.25; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.xd-hdr-bc { padding:16px 28px; border-bottom:1px solid #F0F1F3; display:flex; align-items:center; gap:6px; flex-wrap:wrap; font-size:13px; }
.xd-hdr-bc a { color:#374151; text-decoration:none; transition:color .15s; }
.xd-hdr-bc a:hover { color:#375DFB; }
.xd-hdr-bc .sep { color:#D1D5DB; }
.xd-hdr-bc .cur { color:#9CA3AF; }
`;

function injectCss() {
  if (typeof document === 'undefined') return;
  let s = document.getElementById('xd-css') as HTMLStyleElement | null;
  if (!s) { s = document.createElement('style'); s.id = 'xd-css'; document.head.appendChild(s); }
  s.textContent = CSS;
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('vis'); obs.disconnect(); } }, { threshold: 0.04 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return ref;
}
function Sec({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const ref = useReveal();
  return <div ref={ref} className="xd-sec" style={style}>{children}</div>;
}

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; };
const fmtTime = (sec: number) => `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

async function downloadDocsPdf() {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = EX.rules.map((r, i) => `<li><b>${i + 1}.</b> ${esc(r)}</li>`).join('');
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-100000px;top:0;width:760px;background:#fff;padding:36px 40px;box-sizing:border-box;';
  container.innerHTML = `
    <style>
      .xd-pdf * { box-sizing:border-box; font-family:'Segoe UI',Arial,sans-serif; }
      .xd-pdf .brand { font-size:12px; font-weight:800; letter-spacing:.1em; color:#375DFB; margin:0 0 10px; }
      .xd-pdf h1 { font-size:22px; margin:0 0 6px; color:#111; }
      .xd-pdf .sub { font-size:13px; color:#6B7280; margin:0 0 18px; }
      .xd-pdf ol, .xd-pdf ul { padding:0; margin:0; list-style:none; }
      .xd-pdf li { font-size:13px; line-height:1.7; color:#374151; margin-bottom:12px; }
      .xd-pdf .foot { margin-top:18px; font-size:11px; color:#9CA3AF; }
    </style>
    <div class="xd-pdf">
      <p class="brand">УТЦ «ВОЕВОДА» · ПРАВИЛА ПРОВЕДЕНИЯ УЧЕНИЙ</p>
      <h1>${esc(EX.title)}</h1>
      <p class="sub">${esc(EX.city)} · ${esc(EX.date)} · ${esc(EX.time)} · полигон «${esc(EX.polygon)}»</p>
      <ul>${rows}</ul>
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
    let position = 0; let heightLeft = imgH;
    pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH); heightLeft -= pageH;
    while (heightLeft > 0) { position -= pageH; pdf.addPage(); pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH); heightLeft -= pageH; }
    pdf.save('pravila-uchenij.pdf');
  } catch { /* ignore */ } finally { container.remove(); }
}

function Avatars({ list, extra }: { list: string[]; extra: number }) {
  return (
    <div className="xd-avatars">
      {list.map((src, i) => <img key={i} src={src} alt="" onError={imgFallback} />)}
      <span className="more">+{extra}</span>
    </div>
  );
}

const IcRoute = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h6a3 3 0 0 0 3-3V8" /></svg>;
const IcRide = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>;
const IcBoard = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2M9 21h6" /></svg>;
const IcCheck = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IcChevron = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;

export function ExerciseDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const title = EX_TITLES[id ?? '1'] ?? EX.title;
  injectCss();
  const [arrival, setArrival] = useState(ARRIVAL_OPTIONS[0]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportWorkflow, setReportWorkflow] = useState<'idle' | 'requested' | 'submitted'>('idle');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [mapZoom, setMapZoom] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [rideOpen, setRideOpen] = useState(false);
  const [voted, setVoted] = useState(false);
  const [attended, setAttended] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const [secs, setSecs] = useState(899);
  const [toast, setToast] = useState('');
  const photos = EX.rulePhotos;

  const progressSteps = [
    { label: 'Учение открыто', done: true },
    { label: 'Присутствие отмечено', done: attended },
    { label: 'Зачётный тест сдан на 80%+', done: false },
  ];
  const progressPct = Math.round(progressSteps.filter(s => s.done).length / progressSteps.length * 100);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { const t = window.setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000); return () => window.clearInterval(t); }, []);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(''), 2400); return () => window.clearTimeout(t); }, [toast]);
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      else if (e.key === 'ArrowRight') setLightbox(i => (i === null ? i : (i + 1) % photos.length));
      else if (e.key === 'ArrowLeft') setLightbox(i => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [lightbox, photos.length]);
  useEffect(() => {
    if (!mapZoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMapZoom(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [mapZoom]);

  const submitReport = () => { setReportOpen(false); setReportWorkflow('submitted'); };
  const route = () => window.open(`https://yandex.ru/maps/?text=${encodeURIComponent(EX.coords)}`, '_blank', 'noopener,noreferrer');

  return (
    <div className="xd-page">
      <div className="xd-wrap">
        <div className="xd-panel">
          <div className="xd-hdr">
            <div className="xd-hdr-bar">
              <span className="xd-hdr-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </span>
              <h1 className="xd-hdr-h1">{title}</h1>
            </div>
            <div className="xd-hdr-bc">
              <Link to="/">Главная</Link>
              <span className="sep">/</span>
              <Link to="/exercises">Учения</Link>
              <span className="sep">/</span>
              <span className="cur">{title}</span>
            </div>
          </div>

          <div className="xd-body">
            {/* ══ верх — левая + правая колонки ══ */}
            <Sec>
              <div className="xd-top">

                {/* ── левая колонка ── */}
                <div className="xd-top-left">
                  <p className="xd-desc">{EX.desc}</p>

                  <div className="xd-meta">
                    <div className="xd-meta-row"><span className="k">Город проведения</span><span className="v">{EX.city}</span></div>
                    <div className="xd-meta-row"><span className="k">Дата</span><span className="v">{EX.date}</span></div>
                    <div className="xd-meta-row"><span className="k">Время</span><span className="v">{EX.time}</span></div>
                    <div className="xd-meta-row"><span className="k">Полигон</span><span className="v">{EX.polygon}</span></div>
                    <div className="xd-meta-row"><span className="k">Адрес</span><span className="v link" onClick={route}>{EX.venue.address}</span></div>
                  </div>

                  {/* голосование */}
                  <div style={{ background: '#F9FAFB', borderRadius: 14, border: '1px solid #E5E7EB', padding: '14px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 10 }}>Голосование по прибытию</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <select
                          value={arrival}
                          onChange={e => setArrival(e.target.value)}
                          style={{ width: '100%', padding: '10px 34px 10px 12px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, color: '#374151', background: '#fff', appearance: 'none', cursor: 'pointer', outline: 'none' }}
                        >
                          {ARRIVAL_OPTIONS.map(o => <option key={o}>{o}</option>)}
                        </select>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                      <button
                        onClick={() => { setVoted(true); setToast(`Ваш голос учтён: «${arrival}»`); }}
                        disabled={voted}
                        style={{ padding: '10px 22px', background: voted ? '#10B981' : '#375DFB', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#fff', cursor: voted ? 'default' : 'pointer', boxShadow: voted ? '0 4px 14px rgba(16,185,129,.26)' : '0 4px 14px rgba(55,93,251,.28)', whiteSpace: 'nowrap', transition: 'background .2s,box-shadow .2s' }}
                      >
                        {voted ? 'Голос сохранён' : 'Проголосовать'}
                      </button>
                    </div>
                    {voted && (
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeUp .22s ease both' }}>
                        {Object.entries(VOTE_TOTALS).map(([label, total]) => {
                          const sum = Object.values(VOTE_TOTALS).reduce((a, b) => a + b, 0);
                          const pct = Math.round(total / sum * 100);
                          return (
                            <div key={label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', fontWeight: 700, marginBottom: 4 }}>
                                <span>{label}</span><span>{pct}%</span>
                              </div>
                              <div style={{ height: 7, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: label === arrival ? '#10B981' : '#93C5FD', borderRadius: 99, transition: 'width .55s cubic-bezier(.4,0,.2,1)' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* полигон / попутки */}
                  <div style={{ background: '#F9FAFB', borderRadius: 14, border: '1px solid #E5E7EB', padding: '14px 16px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 3 }}>{EX.venue.name}</div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>{EX.venue.address}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <button className="xd-mini" onClick={() => setBoardOpen(true)}><IcBoard />Возьму на борт</button>
                      <button className="xd-mini" onClick={() => setRideOpen(true)}><IcRide />Запросить попутку</button>
                      <button className="xd-mini" onClick={route}><IcRoute />Маршрут</button>
                      <button className="xd-mini" style={{ background: '#F5F8FF', borderColor: '#C7D2FE', color: '#375DFB' }} onClick={() => setBoardOpen(true)}>{EX.venue.canBoard} могут взять</button>
                      <button className="xd-mini" style={{ background: '#F5F8FF', borderColor: '#C7D2FE', color: '#375DFB' }} onClick={() => setRideOpen(true)}>{EX.venue.needRide} ищут попутку</button>
                    </div>
                    <div style={{ border: '1px solid #DBEAFE', background: '#F5F8FF', borderRadius: 12, padding: '10px 12px', fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                      «Возьму на борт» публикует свободные места, «Запросить попутку» подбирает водителей по адресу и позволяет отправить им запрос.
                    </div>
                  </div>

                  {/* рапорты */}
                  <div style={{ background: '#F9FAFB', borderRadius: 14, border: '1px solid #E5E7EB', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F4F6FA', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#111', flex: 1 }}>Рапорты</span>
                    <button
                      className="xd-mini"
                      style={reportWorkflow === 'requested' ? { background: '#EBF1FF', borderColor: '#C7D2FE', color: '#375DFB' } : undefined}
                      onClick={() => setReportWorkflow('requested')}
                    >Запросить</button>
                    <button className="xd-mini blue" onClick={() => setReportOpen(true)}>Составить</button>
                    {reportWorkflow !== 'idle' && (
                      <div style={{ flexBasis: '100%', background: '#fff', border: '1px solid #D1FAE5', borderRadius: 11, padding: '12px 14px', animation: 'fadeUp .18s ease both' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#047857', marginBottom: 4 }}>
                          {reportWorkflow === 'requested' ? 'Запрос рапорта отправлен' : 'Рапорт отправлен инструктору'}
                        </div>
                        <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5, marginBottom: 10 }}>
                          {reportWorkflow === 'requested'
                            ? 'Инструктор получит запрос и сможет выдать форму рапорта по этому учению.'
                            : 'Рапорт связан с учением и сохранён в личном деле. Его можно открыть или скачать.'}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button className="xd-mini blue" onClick={() => navigate('/study-groups/report')}>Открыть рапорт</button>
                          <button className="xd-mini" onClick={() => void downloadDocsPdf()}>Скачать шаблон</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* прогресс по учению */}
                  <div style={{ background: '#F9FAFB', borderRadius: 14, border: '1px solid #E5E7EB', padding: '15px 16px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Ваш прогресс по учению</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: progressPct === 100 ? '#10B981' : '#375DFB' }}>{progressPct}%</div>
                    </div>
                    <div style={{ height: 8, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
                      <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct === 100 ? '#10B981' : 'linear-gradient(90deg,#375DFB,#7B9FFF)', borderRadius: 99, transition: 'width .6s cubic-bezier(.4,0,.2,1)' }} />
                    </div>
                    {progressSteps.map((s, i) => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderBottom: i < progressSteps.length - 1 ? '1px solid #EEF0F4' : 'none' }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: s.done ? '#10B981' : '#fff', border: `1.5px solid ${s.done ? '#10B981' : '#D1D5DB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {s.done
                            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                            : <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D1D5DB' }} />}
                        </span>
                        <span style={{ fontSize: 13.5, fontWeight: s.done ? 600 : 500, color: s.done ? '#065F46' : '#6B7280' }}>{s.label}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 12 }}>
                      {!attended
                        ? <button className="xd-vote-btn" style={{ width: '100%', padding: '11px 0', boxShadow: '0 4px 14px rgba(55,93,251,.26)' }} onClick={() => { setAttended(true); setToast('Присутствие отмечено!'); }}>
                            Отметить присутствие
                          </button>
                        : <button className="xd-vote-btn" style={{ width: '100%', padding: '11px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }} onClick={() => navigate('/tests/1')}>
                            Перейти к зачётному тесту
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                          </button>}
                    </div>
                  </div>
                </div>

                {/* ── правая колонка ── */}
                <div className="xd-top-right">
                  <div className="xd-hero"><img src={EX.hero} alt={EX.title} onError={imgFallback} /></div>
                  <div className="xd-map-wrap"><YandexTrainingMap height={220} /></div>

                  {/* что взять с собой */}
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: '16px 18px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                      Что взять с собой
                    </div>
                    {CHECKLIST.map((item, i, arr) => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F7' : 'none' }}>
                        <span style={{ width: 20, height: 20, borderRadius: 6, background: '#EBF1FF', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IcCheck /></span>
                        <span style={{ fontSize: 13.5, color: '#374151' }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* связь и помощь */}
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 2 }}>Связь и помощь</div>
                    {([['Чат группы', '/messages?chat=7'], ['Вопрос инструктору', '/messages?chat=1']] as [string, string][]).map(([l, to]) => (
                      <button key={l} className="xd-mini" onClick={() => navigate(to)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', height: 'auto' }}>
                        {l}<IcChevron />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Sec>

            {/* ══ руководитель ══ */}
            <Sec style={{ marginTop: 0 }}>
              <div className="xd-section-label">Руководитель учений</div>
              <div className="xd-leader">
                <div className="xd-leader-av"><img src={EX.director.avatar} alt={EX.director.name} onError={imgFallback} /></div>
                <div>
                  <div className="xd-leader-name">{EX.director.name}</div>
                  <div className="xd-leader-sub">{EX.director.rank} · {EX.director.role}</div>
                </div>
                <div className="xd-leader-actions">
                  <button className="xd-mini" onClick={() => navigate(`/users/${encodeURIComponent(EX.director.name)}`)}>Личное дело</button>
                  <button className="xd-mini blue" onClick={() => navigate('/messages?chat=1')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    Связаться
                  </button>
                </div>
              </div>
            </Sec>

            {/* ══ скрытые задачи + стороны ══ */}
            <Sec>
              <div className="xd-section-label">Скрытые задачи</div>
              <div className="xd-hidden-title">{EX.hidden.title}</div>
              <p className="xd-hidden-text">{EX.hidden.desc}</p>
              <div className="xd-hidden-title">Легенда учений</div>
              <p className="xd-hidden-text">{EX.hidden.legend}</p>

              <div className="xd-section-label">Стороны</div>
              {EX.hidden.sides.map((s, i) => (
                <div key={i} className="xd-side">
                  <div className="xd-side-head">{s.flag} {s.title}</div>
                  <p className="xd-side-desc">{s.desc}</p>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                    {/* commander */}
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:38, height:38, borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'#1a2744' }}>
                        <img src={s.leader.avatar} alt="" onError={imgFallback} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:'#17213a', lineHeight:1.3 }}>{s.leader.name}</div>
                        <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>{s.leader.role} · {s.leader.rank}</div>
                      </div>
                    </div>
                    {/* squad */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      <Avatars list={EX.avatars} extra={s.extra} />
                      <span className="xd-instroy">В строю</span>
                    </div>
                  </div>
                </div>
              ))}
            </Sec>

            {/* ══ правила ══ */}
            <Sec>
              <div className="xd-section-label">Правила проведения</div>
              <div className="xd-rules-head">
                <span className="t">Регламент учений</span>
                <button className="xd-dl-btn" onClick={() => void downloadDocsPdf()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Скачать PDF
                </button>
              </div>
              <ol className="xd-rules">{EX.rules.map((r, i) => <li key={i}>{r}</li>)}</ol>
              <div className="xd-photos">
                {photos.map((src, i) => (
                  <div key={i} className="xd-photo" onClick={() => setLightbox(i)}><img src={src} alt="" onError={imgFallback} /></div>
                ))}
              </div>
            </Sec>

            {/* ══ карта учений с зумом ══ */}
            <Sec>
              <div className="xd-section-label">Карта учений</div>
              <div className="xd-map-img" onClick={() => setMapZoom(true)}>
                <img src={EX.mapImage} alt="Карта учений" onError={imgFallback} />
                <div className="xd-map-zoom-hint">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                  Увеличить
                </div>
              </div>
            </Sec>

            {/* ══ задача №2 ══ */}
            <Sec>
              <div className="xd-task">
                <div>
                  <div className="t">Задача №2</div>
                  <div className="s">Вам придёт уведомление, когда задача станет доступна</div>
                </div>
                <div className="xd-timer">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>
                  <b>{fmtTime(secs)}</b>
                </div>
              </div>
            </Sec>

            {/* ══ FAQ ══ */}
            <Sec>
              <div className="xd-faq">
                <div className="xd-faq-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  Вопросы и ответы
                </div>
                {EX.faq.map((f, i) => (
                  <div key={i} className={`xd-faq-item${faqOpen === i ? ' open' : ''}`}>
                    <div className="xd-faq-q" onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}>
                      {f.q}
                      <span className="xd-faq-toggle">
                        {faqOpen === i
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
                      </span>
                    </div>
                    {faqOpen === i && <div className="xd-faq-a">{f.a}</div>}
                  </div>
                ))}
              </div>
            </Sec>
          </div>
        </div>
      </div>

      {boardOpen && <BoardModal onClose={() => setBoardOpen(false)} />}
      {rideOpen && <RideRequestModal onClose={() => setRideOpen(false)} />}
      {reportOpen && <ReportFormModal onClose={() => setReportOpen(false)} onSubmit={submitReport} />}

      {/* фото-лайтбокс */}
      {lightbox !== null && createPortal(
        <div className="xd-lb" onClick={() => setLightbox(null)}>
          <button className="xd-lb-close" onClick={() => setLightbox(null)} aria-label="Закрыть">×</button>
          <button className="xd-lb-nav xd-lb-prev" onClick={e => { e.stopPropagation(); setLightbox(i => (i === null ? i : (i - 1 + photos.length) % photos.length)); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <img src={photos[lightbox]} alt="" onClick={e => e.stopPropagation()} onError={imgFallback} />
          <button className="xd-lb-nav xd-lb-next" onClick={e => { e.stopPropagation(); setLightbox(i => (i === null ? i : (i + 1) % photos.length)); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>,
        document.body,
      )}

      {/* зум карты учений */}
      {mapZoom && createPortal(
        <div className="xd-lb" onClick={() => setMapZoom(false)}>
          <button className="xd-lb-close" onClick={() => setMapZoom(false)} aria-label="Закрыть">×</button>
          <img src={EX.mapImage} alt="Карта учений" onClick={e => e.stopPropagation()} onError={imgFallback} />
        </div>,
        document.body,
      )}

      {toast && <div className="xd-toast">{toast}</div>}
    </div>
  );
}
