import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useLessonProgressStore } from '../store/useLessonProgressStore';
import { useLearningStore } from '../store/useLearningStore';
import { YandexTrainingMap } from '../components/YandexTrainingMap';
import { IVDisplay } from '../components/PeopleSection';
import { PortalBreadcrumb } from '../components/PortalBreadcrumb';
import { StreamCalendar } from '../components/StreamCalendar';
import { VoevodaPlayer } from '../components/VoevodaPlayer';
import { COURSE_CARD_MOTION_CSS } from '../components/courseCardMotion';
import { BoardModal } from '../components/BoardModal';
import { RideRequestModal } from '../components/RideRequestModal';
import { ReportFormModal, StatusModal, STATUS_REQUESTED, STATUS_SUBMITTED, STATUS_ERROR, type ReportDraft, type ReportStatus } from '../components/ReportModals';
import { useNotifStore } from '../store/useNotifStore';
import { userProfilePath } from '../api/testApi';

/* ─── CSS ─── */
const CSS = `
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lpCheckPop { 0%{transform:scale(0) rotate(-35deg);opacity:0} 60%{transform:scale(1.25) rotate(6deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes lpBlinkPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5);border-color:#FCA5A5} 50%{box-shadow:0 0 0 7px rgba(239,68,68,0);border-color:#EF4444} }
  .lp-blink { animation:lpBlinkPulse 1.5s ease-in-out infinite; }
  @keyframes lpDeadlineBlink { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.5);background:#FEF3C7;border-color:#FCD34D} 50%{box-shadow:0 0 0 6px rgba(245,158,11,0);background:#FDE68A;border-color:#F59E0B} }
  .lp-deadline { animation:lpDeadlineBlink 1.3s ease-in-out infinite; }
  .lp-check-pop { animation:lpCheckPop .45s cubic-bezier(.34,1.56,.64,1) both; }
  .lp-viewed-card { transition:background .45s ease, border-color .45s ease, box-shadow .25s ease; }
  .lp-viewed-card .lp-vc-icon { transition:background .45s ease; }
  .lp-viewed-badge { width:30px; transition:width .32s cubic-bezier(.22,1,.36,1),background .2s ease; overflow:hidden; }
  .lp-viewed-badge .lp-viewed-label { max-width:0; opacity:0; transform:translateX(-6px); white-space:nowrap; overflow:hidden; transition:max-width .32s cubic-bezier(.22,1,.36,1),opacity .2s ease,transform .32s cubic-bezier(.22,1,.36,1); }
  .lp-lesson-shell:hover .lp-viewed-badge { width:118px; }
  .lp-lesson-shell:hover .lp-viewed-badge .lp-viewed-label { max-width:82px; opacity:1; transform:translateX(0); }
  .lp-sec { position:relative;z-index:1;opacity:0; transform:translateY(16px); transition:opacity .5s cubic-bezier(.4,0,.2,1),transform .5s cubic-bezier(.4,0,.2,1); }
  .lp-sec.vis { opacity:1; transform:translateY(0); }
  .lp-sec:has(.c-mil-shell:hover) { z-index:80; }
  .lp-ghost { transition:background .15s,border-color .15s,color .15s,transform .12s; }
  .lp-ghost:hover { background:#EBF1FF!important; border-color:#C7D2FE!important; color:#375DFB!important; transform:translateY(-1px); }
  .lp-prim { transition:background .15s,box-shadow .15s,transform .12s; }
  .lp-prim:hover { box-shadow:0 6px 20px rgba(55,93,251,.38); transform:translateY(-2px); }
  .lp-hw:hover { background:#F6F8FF!important; }
  .lp-plan:hover { background:#F8F9FB!important; }
  .lp-mat:hover { background:#F6F8FF!important; }
  .lp-lesson-shell .c-card-img { height:200px; }
  .lp-lesson-shell .c-card-wrap { border-radius:18px; }
  .lp-ev { transition:opacity .15s,transform .12s; cursor:pointer; }
  .lp-ev:hover { opacity:.82; transform:translateY(-1px); }
  .lp-mate:hover { background:#F6F8FF!important; }
  .lp-star:hover { transform:scale(1.22); }
  .lp-tab { transition:color .15s,border-color .15s; }
  .lp-note { border-left:3px solid #375DFB; background:#F0F4FF; padding:14px 18px; border-radius:0 12px 12px 0; }
  ${COURSE_CARD_MOTION_CSS}
`;
function injectCss(css: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style'); s.id = id; s.textContent = css;
  document.head.appendChild(s);
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
function Sec({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useReveal();
  return <div ref={ref} className="lp-sec" style={style}>{children}</div>;
}

/* ─── PLAN ─── */
type PlanRow = { type: 'row'; num: string; title: string; mins: number | null; time: string; level: 0|1|2; bold?: boolean } | { type: 'sep'; title: string; desc?: string };
const PLAN: PlanRow[] = [
  { type:'row', num:'01', title:'Инструктаж инструкторов и командиров', mins:10, time:'8.45', level:0 },
  { type:'row', num:'02', title:'Общее построение. Прослушивание Гимна РФ', mins:5, time:'9.05', level:0 },
  { type:'row', num:'03', title:'Прослушивание Гимна Воевода', mins:10, time:'9.15', level:0 },
  { type:'row', num:'04', title:'Инструктаж по плану занятия', mins:10, time:'9.25', level:0 },
  { type:'row', num:'05', title:'Разминка', mins:10, time:'9.30', level:0 },
  { type:'sep', title:'Постоянная часть занятия', desc:'Учебные точки на уровне взвода, каждый командир сам определяет необходимое количество упражнений в блоке, ставя акцент на усвоение материала.' },
  { type:'row', num:'05.1', title:'Тактическая медицина', mins:2, time:'9.35', level:1, bold:true },
  { type:'row', num:'', title:'Инструктаж командиров инструктором / л.с. отдыхает', mins:null, time:'', level:1, bold:true },
  { type:'row', num:'', title:'Остановка кровотечения в красной зоне, переноска раненого в красной зоне, иммобилизация в желтой зоне', mins:13, time:'', level:2 },
  { type:'row', num:'05.2', title:'Тактико-огневая подготовка', mins:2, time:'9.45', level:1, bold:true },
  { type:'row', num:'', title:'Инструктаж командиров инструктором / л.с. отдыхает', mins:null, time:'', level:1, bold:true },
  { type:'row', num:'', title:'Выстраивается тропа мишеней при штурме здания с улицы. Малая группа проходит по маршруту поражая все мишени', mins:13, time:'', level:2 },
  { type:'row', num:'05.3', title:'Самоподготовка', mins:2, time:'9.50', level:1 },
  { type:'row', num:'', title:'Самостоятельный повтор предыдущих занятий силами самих курсантов', mins:null, time:'', level:2 },
  { type:'row', num:'05.4', title:'Технический перерыв', mins:5, time:'10.15', level:1 },
  { type:'sep', title:'Переменная часть занятий' },
  { type:'row', num:'06', title:'Теория и практика', mins:145, time:'10.20', level:0 },
  { type:'row', num:'06.1', title:'Теория', mins:2, time:'10.225', level:1 },
  { type:'row', num:'', title:'1. Распределение огневых средств.\n2. Выбор укрытия.\n3. Выбор места ведения огня.', mins:null, time:'', level:2 },
  { type:'row', num:'06.2', title:'Практика', mins:2, time:'10.30', level:1 },
  { type:'row', num:'', title:'1. Разбор работы каждого специалиста.\n2. Назначение ориентиров сектора', mins:null, time:'', level:2 },
  { type:'sep', title:'Перерыв на обед', desc:'30 минут · 12.45' },
  { type:'row', num:'07', title:'Практика', mins:145, time:'13.20', level:0 },
  { type:'row', num:'07.1', title:'Упражнения', mins:2, time:'14.45', level:1 },
  { type:'row', num:'', title:'6. Работа с одноразовым гранатомётом\n7. Отработка маневрирования', mins:null, time:'', level:2 },
  { type:'row', num:'08', title:'Учебно-боевая задача', mins:145, time:'15.20', level:0 },
  { type:'row', num:'09', title:'Заключительные упражнения на выносливость', mins:145, time:'15.20', level:0 },
  { type:'row', num:'09.1', title:'Эвакуация раненых', mins:20, time:'16.30', level:1 },
  { type:'row', num:'', title:'Проводится с места завершения тактических занятий до лагеря', mins:null, time:'', level:2 },
  { type:'row', num:'10', title:'Подведение итогов занятия и роспуск групп', mins:10, time:'17.00', level:0 },
  { type:'row', num:'11', title:'Подведение итогов с инструкторами и командирами', mins:10, time:'17.10', level:0 },
];

/* ─── LESSONS ─── */
const LESSONS = [
  { id:1, num:'01', title:'Введение в военное дело',     date:'3 марта, 2026',  time:'с 9 до 17', img:'/СписокЗанятий.png', locked:false },
  { id:2, num:'01', title:'Холощение с оружием',         date:'3 марта, 2026',  time:'с 9 до 17', img:'/СписокЗанятий.png', locked:false },
  { id:3, num:'01', title:'Действия бойца в лесу',       date:'3 марта, 2026',  time:'с 9 до 17', img:'/СписокЗанятий.png', locked:true  },
  { id:4, num:'01', title:'Тактическая медицина',        date:'10 марта, 2026', time:'с 9 до 17', img:'/СписокЗанятий.png', locked:false },
  { id:5, num:'02', title:'Ориентирование на местности', date:'17 марта, 2026', time:'с 9 до 17', img:'/СписокЗанятий.png', locked:true  },
  { id:6, num:'02', title:'Огневая подготовка',          date:'24 марта, 2026', time:'с 9 до 17', img:'/СписокЗанятий.png', locked:true  },
];

/* ─── HW / ТЕСТЫ ─── (последовательность: каждый следующий открывается после
   сдачи предыдущего минимум на 80%. Статус считается из useLearningStore.) */
const HW = [
  { id:1, num:1, testId:'1', title:'Основы баллистики', sub:'Тест на знание основ баллистики' },
  { id:2, num:2, testId:'2', title:'Огневая подготовка снайпера', sub:'Тест по огневой подготовке' },
  { id:3, num:3, testId:'3', title:'Внутренняя и внешняя баллистика', sub:'Тест на знание внутренней и внешней баллистики' },
  { id:4, num:4, testId:'4', title:'Тактика малых групп', sub:'Тест по тактике действий в составе группы' },
];
const MATS = [
  { type:'PDF', name:'Рабочая тетрадь', size:'224 мб' },
  { type:'JPG', name:'Пример карты', size:'302 кб' },
  { type:'MP4', name:'Видео-материалы', size:'2.2 гб' },
];
const FC: Record<string,string> = { PDF:'#EF4444', JPG:'#3B82F6', MP4:'#8B5CF6' };

function downloadDemoFile(name: string, type: string) {
  const ext = type === 'JPG' ? 'jpg' : type === 'MP4' ? 'mp4' : 'pdf';
  const safeName = name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-').toLowerCase();
  const blob = new Blob([
    `Демонстрационный материал портала ВОЕВОДА\n\nФайл: ${name}\nТип: ${type}\n\nВ реальной версии сюда будет подставлена ссылка на загруженный учебный материал.`,
  ], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName || 'material'}.${ext}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Скачивание плана занятия в PDF — формируется 1-в-1 из секции «План занятия».
// Содержимое рендерится в офскрин-узел, снимается html2canvas и кладётся в jsPDF,
// поэтому пользователь получает готовый .pdf-файл (без диалога печати) с кириллицей.
async function downloadPlanPdf(lessonTitle: string) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = PLAN.map(r => {
    if (r.type === 'sep') {
      return `<tr class="sep"><td colspan="4"><div class="st">${esc(r.title)}</div>${r.desc ? `<div class="sd">${esc(r.desc)}</div>` : ''}</td></tr>`;
    }
    const pl = r.level === 0 ? 0 : r.level === 1 ? 18 : 36;
    const tcls = r.bold ? 'b' : r.level === 2 ? 'muted' : '';
    return `<tr><td class="c num">${esc(r.num)}</td><td class="t ${tcls}" style="padding-left:${16 + pl}px">${esc(r.title).replace(/\n/g, '<br>')}</td><td class="c">${r.mins ?? '—'}</td><td class="c">${r.time || '—'}</td></tr>`;
  }).join('');
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-100000px;top:0;width:760px;background:#fff;padding:32px 36px;box-sizing:border-box;';
  container.innerHTML = `
    <style>
      .lp-pdf * { box-sizing:border-box; font-family:'Segoe UI',Arial,sans-serif; }
      .lp-pdf h1 { font-size:22px; margin:0 0 4px; color:#111; }
      .lp-pdf .sub { color:#6B7280; font-size:13px; margin:0 0 18px; }
      .lp-pdf table { width:100%; border-collapse:collapse; font-size:12.5px; }
      .lp-pdf thead th { background:#F3F4F6; color:#6B7280; font-weight:600; text-align:left; padding:9px 16px; border-bottom:1px solid #E5E7EB; }
      .lp-pdf thead th.c { text-align:center; }
      .lp-pdf td { padding:8px 16px; border-bottom:1px solid #F0F0F0; vertical-align:top; color:#1F2937; }
      .lp-pdf td.c { text-align:center; }
      .lp-pdf td.num { font-weight:600; }
      .lp-pdf td.t.b { font-weight:600; color:#374151; }
      .lp-pdf td.t.muted { color:#6B7280; }
      .lp-pdf tr.sep td { background:#F9FAFB; border-top:1px solid #E5E7EB; }
      .lp-pdf .st { font-weight:700; color:#374151; }
      .lp-pdf .sd { font-size:11px; color:#6B7280; margin-top:3px; }
      .lp-pdf .foot { margin-top:16px; font-size:11px; color:#9CA3AF; }
    </style>
    <div class="lp-pdf">
      <h1>План занятия</h1>
      <p class="sub">${esc(lessonTitle)} · УТЦ «ВОЕВОДА»</p>
      <table>
        <thead><tr><th class="c">№</th><th>Упражнения</th><th class="c">Выделено минут</th><th class="c">Время начала</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
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
    const safeName = lessonTitle.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-').toLowerCase();
    pdf.save(`план-занятия-${safeName || 'voevoda'}.pdf`);
  } catch {
    /* ignore */
  } finally {
    container.remove();
  }
}

/* ─── CLASSMATES (каждый со своим ИВ и рейтингом) ─── */
const MATES = [
  { id:1, chatId:2,  name:'Бек',   rank:'Майор',     spec:'Пулемётчик', img:'/teacher1-main.jpg', index:1842, rating:4.8 },
  { id:2, chatId:14, name:'Резак', rank:'Майор',     spec:'Снайпер',    img:'/teacher2-main.jpg', index:2100, rating:5.0 },
  { id:3, chatId:15, name:'Шторм', rank:'Капитан',   spec:'Медик',      img:'/teacher3-main.jpg', index:1654, rating:4.6 },
  { id:4, chatId:16, name:'Лис',   rank:'Майор',     spec:'Разведчик',  img:'/teacher1-main.jpg', index:2230, rating:4.9 },
  { id:5, chatId:17, name:'Волк',  rank:'Майор',     spec:'Сапёр',      img:'/teacher2-main.jpg', index:1980, rating:4.7 },
  { id:6, chatId:18, name:'Ghost', rank:'Лейтенант', spec:'Связист',    img:'/teacher3-main.jpg', index:1540, rating:4.5 },
];

type TeacherAssessment = {
  status: 'pending' | 'reviewing' | 'graded';
  score?: number;
  comment?: string;
  updatedAt?: string;
};

type LessonReminder = {
  label: string;
  hours: number;
  startAt: string;
  triggerAt: string;
  delivered?: boolean;
};

const REMINDER_OPTIONS = [
  { label:'за 2 часа', hours:2 },
  { label:'за день', hours:24 },
  { label:'за 3 дня', hours:72 },
  { label:'за неделю', hours:168 },
];

function getNextLessonStart(lessonId: string) {
  const lessonDays: Record<string, number> = { '1':3, '2':24, '3':3, '4':10, '5':17, '6':24 };
  const now = new Date();
  const start = new Date(now.getFullYear(), 2, lessonDays[lessonId] ?? 24, 9, 0, 0, 0);
  if (start.getTime() <= now.getTime()) start.setFullYear(start.getFullYear() + 1);
  return start;
}

const STUDY = [
  { id:'s1', img:'/спрятался1.png', title:'Снайперская тактика',
    text:['На сегодняшний день в большинстве армий существуют две основные концепции снайпинга:','1. Снайперская пара или одиночный стрелок работают в режиме «свободной охоты».','2. Снайперско-разведывательный патруль сковывает действия противника в своей зоне ответственности.'],
    note:'Для выполнения боевых задач снайпер должен располагаться на тщательно замаскированной позиции.', video:false },
  { id:'s2', img:'/спрятался2.png', title:'Маскировка и наблюдение',
    text:['О законах и приёмах маскировки и наблюдения написано достаточно. Наблюдать нужно очень внимательно, не упуская никаких мелочей.'],
    note:null, video:true },
];

function IcLock() {
  return (
    <div style={{ width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,.18)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    </div>
  );
}

/* ═══════════ PAGE ═══════════ */
export function LessonPage() {
  const navigate = useNavigate();
  const { id } = useParams<{id:string}>();
  const location = useLocation();
  const routeState = location.state as { courseTitle?: string; courseSlug?: string } | null;
  const lessonId = id ?? '1';
  const currentLesson = LESSONS.find(l => String(l.id) === lessonId) ?? LESSONS[0];
  const TITLE = currentLesson.title;
  const courseTitle = routeState?.courseTitle ?? 'Курс Общевойскового снайпера V5';
  const courseSlug = routeState?.courseSlug ?? encodeURIComponent(courseTitle);
  const viewedLessons = useLessonProgressStore(s => s.lessons);
  const lessonProgress = useLessonProgressStore(s => s.lessons[lessonId]);
  const markLessonViewed = useLessonProgressStore(s => s.markLessonViewed);
  const markLessonOpened = useLessonProgressStore(s => s.markLessonOpened);
  const submissions = useLearningStore(s => s.submissions);
  const testPassed = Object.values(submissions).some(x => x.passed);
  const addNotification = useNotifStore(s => s.add);
  const reminderKey = `voevoda_lesson_reminder_${lessonId}`;
  const assessmentKey = `voevoda_teacher_assessment_${lessonId}`;
  const [vote,setVote] = useState('Я в строю');
  const [voteSaved, setVoteSaved] = useState(false);
  const [voteTotals, setVoteTotals] = useState<Record<string, number>>({ 'Я в строю': 18, 'Отсутствую': 2, 'Под вопросом': 4 });
  const [attendancePulse, setAttendancePulse] = useState(false);
  const [lessonListFilter, setLessonListFilter] = useState<'all'|'available'|'viewed'|'unviewed'|'locked'>('all');
  const [boardOpen, setBoardOpen] = useState(false);
  const [rideOpen, setRideOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);
  const [reportWorkflow, setReportWorkflow] = useState<'idle' | 'requested' | 'draft' | 'submitted'>(() => {
    try {
      return (localStorage.getItem(`voevoda_lesson_report_${lessonId}`) as 'requested' | 'draft' | 'submitted' | null) ?? 'idle';
    } catch {
      return 'idle';
    }
  });
  const [tab,setTab] = useState<'hw'|'study'>('hw');
  const [matTab,setMatTab] = useState<'mat'|'comments'>('mat');
  const [studyDone,setStudyDone] = useState(false);
  const [notifyOpen,setNotifyOpen] = useState(false);
  const [reminder, setReminder] = useState<LessonReminder | null>(() => {
    try {
      const saved = localStorage.getItem(reminderKey);
      return saved ? JSON.parse(saved) as LessonReminder : null;
    } catch {
      return null;
    }
  });
  const [teacherAssessment, setTeacherAssessment] = useState<TeacherAssessment>(() => {
    try {
      const saved = localStorage.getItem(assessmentKey);
      return saved ? JSON.parse(saved) as TeacherAssessment : { status:'pending' };
    } catch {
      return { status:'pending' };
    }
  });
  const [e1,setE1] = useState(false);
  const [e2,setE2] = useState(false);
  const [notice, setNotice] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSent, setCommentSent] = useState(false);

  useEffect(()=>{ injectCss(CSS,'lp-v5'); },[]);

  // Открытие урока фиксируем, но «Просмотрено» ставит сам курсант кнопкой
  useEffect(() => {
    markLessonOpened({
      id: lessonId,
      title: TITLE,
      courseTitle,
      courseSlug,
    });
  }, [lessonId, TITLE, courseTitle, courseSlug, markLessonOpened]);

  useEffect(() => {
    try {
      const savedReminder = localStorage.getItem(reminderKey);
      setReminder(savedReminder ? JSON.parse(savedReminder) as LessonReminder : null);
      const savedAssessment = localStorage.getItem(assessmentKey);
      setTeacherAssessment(savedAssessment ? JSON.parse(savedAssessment) as TeacherAssessment : { status:'pending' });
    } catch {
      setReminder(null);
      setTeacherAssessment({ status:'pending' });
    }
  }, [reminderKey, assessmentKey]);

  useEffect(() => {
    if (!reminder || reminder.delivered) return;
    const delay = new Date(reminder.triggerAt).getTime() - Date.now();
    const deliver = () => {
      addNotification({
        kind:'course_started',
        title:'Занятие скоро начнётся',
        body:`${TITLE} — ${new Intl.DateTimeFormat('ru-RU', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' }).format(new Date(reminder.startAt))}`,
        link:`/lessons/${lessonId}`,
      });
      if ('Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification('Занятие скоро начнётся', { body: TITLE });
      }
      const deliveredReminder = { ...reminder, delivered:true };
      setReminder(deliveredReminder);
      try { localStorage.setItem(reminderKey, JSON.stringify(deliveredReminder)); } catch { /* ignore */ }
    };
    const timeout = window.setTimeout(deliver, Math.max(0, Math.min(delay, 2_147_483_647)));
    return () => window.clearTimeout(timeout);
  }, [reminder, reminderKey, addNotification, TITLE, lessonId]);

  useEffect(() => {
    const applyAssessment = (next: TeacherAssessment) => {
      setTeacherAssessment(previous => {
        if (next.status === 'graded' && previous.status !== 'graded') {
          addNotification({
            kind:'achievement',
            title:'Преподаватель поставил оценку',
            body:`${TITLE}: ${next.score ?? 0} из 5. ${next.comment ?? 'Комментарий доступен в занятии.'}`,
            link:`/lessons/${lessonId}`,
          });
        }
        return next;
      });
      try { localStorage.setItem(assessmentKey, JSON.stringify(next)); } catch { /* ignore */ }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== assessmentKey || !event.newValue) return;
      try { applyAssessment(JSON.parse(event.newValue) as TeacherAssessment); } catch { /* ignore */ }
    };
    const onAssessment = (event: Event) => {
      const detail = (event as CustomEvent<TeacherAssessment>).detail;
      if (detail) applyAssessment(detail);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('voevoda:teacher-assessment', onAssessment);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('voevoda:teacher-assessment', onAssessment);
    };
  }, [assessmentKey, addNotification, TITLE, lessonId]);

  const viewedAtLabel = lessonProgress?.viewedAt
    ? new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(lessonProgress.viewedAt))
    : '';
  const isViewed = lessonProgress?.status === 'viewed';
  const progressSteps = [
    { label: 'Занятие открыто', done: true },
    { label: 'Материал изучен и отмечен', done: isViewed },
    { label: 'Зачётный тест сдан на 80%+', done: testPassed },
  ];
  const progressDone = progressSteps.filter(s => s.done).length;
  const progressPct = Math.round((progressDone / progressSteps.length) * 100);
  const visibleLessons = LESSONS.filter(lesson => {
    const viewed = viewedLessons[String(lesson.id)]?.status === 'viewed';
    if (lessonListFilter === 'available') return !lesson.locked;
    if (lessonListFilter === 'viewed') return !lesson.locked && viewed;
    if (lessonListFilter === 'unviewed') return !lesson.locked && !viewed;
    if (lessonListFilter === 'locked') return lesson.locked;
    return true;
  });
  const saveLessonViewed = () => {
    markLessonViewed({ id: lessonId, title: TITLE, courseTitle, courseSlug });
    setAttendancePulse(true);
    window.setTimeout(() => setAttendancePulse(false), 1400);
  };
  const submitVote = () => {
    setVoteTotals(prev => ({ ...prev, [vote]: (prev[vote] ?? 0) + (voteSaved ? 0 : 1) }));
    setVoteSaved(true);
  };
  const setReportStep = (step: 'requested' | 'draft' | 'submitted') => {
    setReportWorkflow(step);
    try { localStorage.setItem(`voevoda_lesson_report_${lessonId}`, step); } catch { /* ignore */ }
  };
  const requestReport = () => {
    setReportStep('requested');
    setReportStatus(STATUS_REQUESTED);
  };
  const submitReport = (_draft: ReportDraft) => {
    setReportOpen(false);
    const online = typeof navigator === 'undefined' || navigator.onLine;
    if (!online) {
      setReportStatus(STATUS_ERROR);
      return;
    }
    setReportStep('submitted');
    setReportStatus(STATUS_SUBMITTED);
  };
  const saveReminder = async (option: typeof REMINDER_OPTIONS[number]) => {
    const start = getNextLessonStart(lessonId);
    const nextReminder: LessonReminder = {
      ...option,
      startAt:start.toISOString(),
      triggerAt:new Date(start.getTime() - option.hours * 60 * 60 * 1000).toISOString(),
      delivered:false,
    };
    setReminder(nextReminder);
    try { localStorage.setItem(reminderKey, JSON.stringify(nextReminder)); } catch { /* ignore */ }
    addNotification({
      kind:'system',
      title:'Напоминание настроено',
      body:`${TITLE} — уведомим ${option.label}, ${new Intl.DateTimeFormat('ru-RU', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' }).format(start)}`,
      link:`/lessons/${lessonId}`,
    });
    setNotifyOpen(false);
    showNotice(`Напоминание включено: ${option.label}`);
    if ('Notification' in window && window.Notification.permission === 'default') {
      await window.Notification.requestPermission();
    }
  };
  const requestTeacherAssessment = () => {
    if (!isViewed || !testPassed || teacherAssessment.status !== 'pending') return;
    const next: TeacherAssessment = { status:'reviewing', updatedAt:new Date().toISOString() };
    setTeacherAssessment(next);
    try { localStorage.setItem(assessmentKey, JSON.stringify(next)); } catch { /* ignore */ }
    addNotification({
      kind:'system',
      title:'Работа отправлена преподавателю',
      body:`${TITLE} — Бек проверит материал и тест. После оценки придёт уведомление.`,
      link:`/lessons/${lessonId}`,
    });
    showNotice('Работа отправлена на проверку');
  };
  const submitComment = () => {
    if (!commentText.trim()) {
      setCommentSent(false);
      return;
    }
    setCommentSent(true);
    setCommentText('');
  };
  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2400);
  };
  const BC = [{ label:'Главная', to:'/' }, { label:'Личный кабинет', to:'/profile' }, { label:'Мои курсы', to:'/my-courses' }, { label:courseTitle, to:`/my-courses/${courseSlug}` }, { label:TITLE }];

  return (
    <div style={{ paddingTop:60,marginLeft:56,minHeight:'100vh',background:'#F4F6FB' }}>
      {notice && (
        <div style={{ position:'fixed',right:24,bottom:24,zIndex:10000,background:'#111827',color:'#fff',borderRadius:12,padding:'12px 16px',fontSize:13,fontWeight:700,boxShadow:'0 18px 45px rgba(17,24,39,.24)' }}>
          {notice}
        </div>
      )}

      {/* TOP BAR */}
      <div style={{ background:'#fff',borderBottom:'1px solid #E5E7EB',padding:'12px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',animation:'fadeIn .3s ease' }}>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span style={{ fontSize:18,fontWeight:700,color:'#111' }}>{TITLE}</span>
        </div>
        <div style={{ position:'relative' }}>
          <button onClick={()=>setNotifyOpen(x=>!x)} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:'#374151',cursor:'pointer',transition:'all .15s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#C7D2FE';e.currentTarget.style.color='#375DFB';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#E5E7EB';e.currentTarget.style.color='#374151';}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Уведомить меня <span style={{ color:'#375DFB',fontWeight:600 }}>{reminder?.label ?? 'за день'}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {notifyOpen&&(
            <div style={{ position:'absolute',top:'calc(100% + 8px)',right:0,background:'#fff',border:'1px solid #E5E7EB',borderRadius:14,padding:'8px 0 10px',boxShadow:'0 12px 36px rgba(0,0,0,.12)',zIndex:200,minWidth:260,animation:'fadeUp .15s ease',overflow:'hidden' }}>
              {REMINDER_OPTIONS.map(option=>(
                <button key={option.hours} onClick={()=>void saveReminder(option)} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,width:'100%',padding:'9px 16px',textAlign:'left',background:reminder?.hours===option.hours?'#EEF3FF':'none',border:'none',fontSize:13,color:reminder?.hours===option.hours?'#2448D8':'#374151',cursor:'pointer',fontWeight:reminder?.hours===option.hours?700:500 }} onMouseEnter={e=>(e.currentTarget.style.background='#F4F6FA')} onMouseLeave={e=>(e.currentTarget.style.background=reminder?.hours===option.hours?'#EEF3FF':'none')}>
                  <span>Уведомить {option.label}</span>
                  {reminder?.hours===option.hours && <span aria-hidden="true">✓</span>}
                </button>
              ))}
              <div style={{ margin:'7px 12px 0',padding:'9px 10px',borderRadius:10,background:'#F8FAFC',fontSize:11,lineHeight:1.45,color:'#64748B' }}>
                Напоминание появится в уведомлениях портала. Если разрешены уведомления браузера — придёт и системное сообщение.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BREADCRUMB */}
      <div style={{ background:'#fff',borderBottom:'1px solid #E5E7EB',padding:'9px 28px' }}>
        <PortalBreadcrumb className="course-breadcrumb" items={BC} />
      </div>

      <div style={{ padding:'24px 28px 60px',maxWidth:1240,margin:'0 auto' }}>

        {/* ══ 1. УРОК ══ */}
        <Sec style={{ marginBottom:20 }}>
        <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',padding:'24px' }}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 420px',gap:24,alignItems:'stretch' }}>
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                {/* --- всё содержимое левой колонки без изменений --- */}
                <div>
                <h1 style={{ fontSize:22,fontWeight:800,color:'#0D0F14',margin:'0 0 10px',lineHeight:1.3 }}>{TITLE}</h1>
                <p style={{ fontSize:14,color:'#4B5563',lineHeight:1.7,margin:0 }}>Урок отличается от всего того, что существует в войсках, поскольку полностью заточен на боевую подготовку. Нам известно много случаев подписания курсантами контракта с ВС РФ после прохождения КМБ и их командировку в зону боевых действий.</p>
                </div>
                <div style={{ background:'#F9FAFB',borderRadius:14,border:'1px solid #E5E7EB',padding:'13px 16px',display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ width:34,height:34,borderRadius:9,background:'#F4F6FA',border:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'center' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <span style={{ fontSize:14,fontWeight:600,color:'#374151',flex:1 }}>Дата и время</span>
                <span style={{ fontSize:14,color:'#6B7280' }}>24 марта / с 09.00 – 17.00</span>
                </div>
                <div style={{ background:'#F9FAFB',borderRadius:14,border:'1px solid #E5E7EB',padding:'13px 16px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap' }}>
                <div style={{ width:44,height:44,borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'#F3F4F6' }}><img src="/teacher2-main.jpg" alt="Бек" style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/></div>
                <div style={{ flex:1 }}><div style={{ fontSize:15,fontWeight:700,color:'#111' }}>Бек</div><div style={{ fontSize:12,color:'#9CA3AF' }}>Главный инструктор</div></div>
                <button className="lp-ghost" onClick={()=>navigate('/messages?chat=1')} style={{ padding:'8px 14px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:'#374151',cursor:'pointer' }}>Задать вопрос</button>
                </div>
                {(() => {
                  return (
                <div className={`lp-viewed-card${isViewed ? '' : ' lp-blink'}`}
                  style={{ background:isViewed?'#F0FDF4':'#FEF2F2',borderRadius:14,border:`1px solid ${isViewed?'#BBF7D0':'#FECACA'}`,padding:'13px 16px',display:'flex',alignItems:'center',gap:12,cursor:'default',boxShadow:attendancePulse?'0 0 0 4px rgba(16,185,129,.16), 0 12px 30px rgba(16,185,129,.16)':'none',transform:attendancePulse?'scale(1.01)':'scale(1)' }}>
                <div className="lp-vc-icon" style={{ width:34,height:34,borderRadius:9,background:isViewed?'#10B981':'#EF4444',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  {isViewed
                    ? <svg key="v" className="lp-check-pop" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg key="u" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><circle cx="12" cy="16" r=".6" fill="#fff"/></svg>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:800,color:isViewed?'#065F46':'#991B1B',marginBottom:2,transition:'color .45s ease' }}>{isViewed ? 'Просмотрено' : 'Не просмотрено'}</div>
                  <div style={{ fontSize:12,color:isViewed?'#047857':'#B91C1C',transition:'color .45s ease' }}>{isViewed ? `Отметка сохранена в личном кабинете${viewedAtLabel ? `: ${viewedAtLabel}` : ''}` : 'Нажмите, чтобы отметить занятие просмотренным'}</div>
                </div>
                {!isViewed && <button onClick={(e) => { e.stopPropagation(); saveLessonViewed(); }} style={{ padding:'9px 15px',background:'#EF4444',border:'none',borderRadius:10,fontSize:12,fontWeight:700,color:'#fff',cursor:'pointer',flexShrink:0,boxShadow:'0 4px 12px rgba(239,68,68,.3)' }}>Отметить</button>}
                </div>
                  );
                })()}
                <div style={{ background:'#F9FAFB',borderRadius:14,border:'1px solid #E5E7EB',padding:'14px 16px' }}>
                <div style={{ fontSize:14,fontWeight:600,color:'#111',marginBottom:10 }}>Голосование по прибытию</div>
                <div style={{ display:'flex',gap:10 }}>
                    <div style={{ position:'relative',flex:1 }}>
                    <select value={vote} onChange={e=>setVote(e.target.value)} style={{ width:'100%',padding:'10px 34px 10px 12px',border:'1px solid #E5E7EB',borderRadius:10,fontSize:14,color:'#374151',background:'#fff',appearance:'none',cursor:'pointer',outline:'none' }}>
                        <option>Я в строю</option><option>Отсутствую</option><option>Под вопросом</option>
                    </select>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none' }}><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <button className="lp-prim" onClick={submitVote} style={{ padding:'10px 22px',background:voteSaved?'#10B981':'#375DFB',border:'none',borderRadius:10,fontSize:14,fontWeight:600,color:'#fff',cursor:'pointer',boxShadow:voteSaved?'0 4px 14px rgba(16,185,129,.26)':'0 4px 14px rgba(55,93,251,.28)' }}>{voteSaved ? 'Голос сохранён' : 'Проголосовать'}</button>
                </div>
                {voteSaved && (
                  <div style={{ marginTop:12,display:'flex',flexDirection:'column',gap:8,animation:'fadeUp .22s ease both' }}>
                    {Object.entries(voteTotals).map(([label,total]) => {
                      const sum = Object.values(voteTotals).reduce((a,b)=>a+b,0) || 1;
                      const pct = Math.round(total / sum * 100);
                      return (
                        <div key={label}>
                          <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748B',fontWeight:700,marginBottom:4 }}>
                            <span>{label}</span><span>{pct}%</span>
                          </div>
                          <div style={{ height:7,background:'#E5E7EB',borderRadius:99,overflow:'hidden' }}>
                            <div style={{ height:'100%',width:`${pct}%`,background:label===vote?'#10B981':'#93C5FD',borderRadius:99,transition:'width .55s cubic-bezier(.4,0,.2,1)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                </div>
                <div style={{ background:'#F9FAFB',borderRadius:14,border:'1px solid #E5E7EB',padding:'14px 16px' }}>
                <div style={{ fontSize:15,fontWeight:700,color:'#111',marginBottom:3 }}>Полигон «Калибр»</div>
                <div style={{ fontSize:13,color:'#6B7280',marginBottom:12 }}>Минское шоссе, 31-й километр, с1</div>
                <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:10 }}>
                  <button className="lp-ghost" onClick={() => setBoardOpen(true)} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 12px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:9,fontSize:13,color:'#374151',cursor:'pointer' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    Возьму на борт
                  </button>
                  <button className="lp-ghost" onClick={() => setRideOpen(true)} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 12px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:9,fontSize:13,color:'#374151',cursor:'pointer' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                    Запросить попутку
                  </button>
                  <button className="lp-ghost" onClick={() => window.open('https://yandex.ru/maps/?rtext=~55.714,37.192&rtt=auto&z=12', '_blank', 'noopener,noreferrer')} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 12px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:9,fontSize:13,color:'#374151',cursor:'pointer' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="3" cy="6" r="2"/><circle cx="21" cy="6" r="2"/><polyline points="3 8 3 14 21 14 21 8"/><line x1="12" y1="14" x2="12" y2="19"/></svg>
                    Маршрут
                  </button>
                  <button className="lp-ghost" type="button" onClick={() => setBoardOpen(true)} style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'7px 11px',background:'#F5F8FF',border:'1px solid #C7D2FE',borderRadius:9,color:'#375DFB',cursor:'pointer',fontSize:12,fontWeight:700 }}>7 могут взять</button>
                  <button className="lp-ghost" type="button" onClick={() => setRideOpen(true)} style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'7px 11px',background:'#F5F8FF',border:'1px solid #C7D2FE',borderRadius:9,color:'#375DFB',cursor:'pointer',fontSize:12,fontWeight:700 }}>16 ищут попутку</button>
                </div>
                <div style={{ marginTop:12,border:'1px solid #DBEAFE',background:'#F5F8FF',borderRadius:12,padding:'10px 12px',fontSize:12,color:'#475569',lineHeight:1.5 }}>
                  «Возьму на борт» публикует свободные места, «Запросить попутку» подбирает водителей по адресу и позволяет отправить им запрос.
                </div>
                </div>
                <div style={{ background:'#F9FAFB',borderRadius:14,border:'1px solid #E5E7EB',padding:'13px 16px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap' }}>
                <div style={{ width:34,height:34,borderRadius:9,background:'#F4F6FA',border:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'center' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <span style={{ fontSize:15,fontWeight:600,color:'#111',flex:1 }}>Рапорты</span>
                <button className="lp-ghost" onClick={requestReport} style={{ padding:'7px 14px',background:reportWorkflow==='requested'?'#EBF1FF':'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:reportWorkflow==='requested'?'#375DFB':'#374151',cursor:'pointer' }}>Запросить</button>
                <button className="lp-prim" onClick={() => setReportOpen(true)} style={{ padding:'7px 14px',background:'#375DFB',border:'none',borderRadius:10,fontSize:13,color:'#fff',fontWeight:700,cursor:'pointer' }}>Составить</button>
                {reportWorkflow !== 'idle' && (
                  <div style={{ flexBasis:'100%',background:'#fff',border:'1px solid #D1FAE5',borderRadius:11,padding:'12px 14px',animation:'fadeUp .18s ease both' }}>
                    <div style={{ fontSize:13,fontWeight:800,color:'#047857',marginBottom:4 }}>
                      {reportWorkflow === 'requested' ? 'Запрос рапорта отправлен' : reportWorkflow === 'draft' ? 'Черновик рапорта сохранён' : 'Рапорт отправлен инструктору'}
                    </div>
                    <div style={{ fontSize:12,color:'#4B5563',lineHeight:1.5,marginBottom:10 }}>
                      {reportWorkflow === 'requested'
                        ? 'Инструктор получит запрос и сможет выдать форму рапорта по этому занятию.'
                        : 'Рапорт связан с занятием и сохранён в личном деле. Его можно открыть или скачать.'}
                    </div>
                    <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                      <button className="lp-prim" onClick={()=>navigate('/study-groups/report')} style={{ padding:'8px 14px',background:'#375DFB',border:'none',borderRadius:9,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer' }}>Открыть рапорт</button>
                      <button className="lp-ghost" onClick={()=>downloadDemoFile('Рапорт по занятию','PDF')} style={{ padding:'8px 14px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:9,color:'#374151',fontSize:12,fontWeight:600,cursor:'pointer' }}>Скачать шаблон</button>
                    </div>
                  </div>
                )}
                </div>

                {/* Прогресс по занятию — итоговая логика урока, выравнивает левую колонку с правой */}
                <div style={{ background:'#F9FAFB',borderRadius:14,border:'1px solid #E5E7EB',padding:'15px 16px',flex:1,display:'flex',flexDirection:'column' }}>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
                    <div style={{ fontSize:15,fontWeight:700,color:'#111' }}>Ваш прогресс по занятию</div>
                    <div style={{ fontSize:14,fontWeight:800,color:progressPct===100?'#10B981':'#375DFB' }}>{progressPct}%</div>
                  </div>
                  <div style={{ height:8,background:'#E5E7EB',borderRadius:99,overflow:'hidden',marginBottom:14 }}>
                    <div style={{ height:'100%',width:`${progressPct}%`,background:progressPct===100?'#10B981':'linear-gradient(90deg,#375DFB,#7B9FFF)',borderRadius:99,transition:'width .6s cubic-bezier(.4,0,.2,1)' }} />
                  </div>
                  {progressSteps.map((s,i)=>(
                    <div key={s.label} style={{ display:'flex',alignItems:'center',gap:11,padding:'9px 0',borderBottom:i<progressSteps.length-1?'1px solid #EEF0F4':'none' }}>
                      <span style={{ width:24,height:24,borderRadius:'50%',flexShrink:0,background:s.done?'#10B981':'#fff',border:`1.5px solid ${s.done?'#10B981':'#D1D5DB'}`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                        {s.done
                          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          : <span style={{ width:7,height:7,borderRadius:'50%',background:'#D1D5DB' }} />}
                      </span>
                      <span style={{ fontSize:13.5,fontWeight:s.done?600:500,color:s.done?'#065F46':'#6B7280' }}>{s.label}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:'auto',paddingTop:12 }}>
                    {!isViewed
                      ? <button className="lp-prim" onClick={saveLessonViewed} style={{ width:'100%',padding:'11px 0',background:'#375DFB',border:'none',borderRadius:11,color:'#fff',fontSize:13.5,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(55,93,251,.26)' }}>Отметить занятие просмотренным</button>
                      : !testPassed
                      ? <button className="lp-prim" onClick={()=>navigate('/tests/1')} style={{ width:'100%',padding:'11px 0',background:'#375DFB',border:'none',borderRadius:11,color:'#fff',fontSize:13.5,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(55,93,251,.26)',display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>Перейти к зачётному тесту<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>
                      : <div style={{ textAlign:'center',padding:'11px 0',background:'#ECFDF5',border:'1px solid #A7F3D0',borderRadius:11,fontSize:13,fontWeight:700,color:'#047857' }}>Занятие полностью завершено</div>}
                  </div>
                </div>
            </div>

            {/* Правая колонка */}
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                <div style={{ borderRadius:18,overflow:'hidden',background:'#F3F4F6',height:258,flexShrink:0 }}>
                {!e1
                    ? <img src="/отжимание.png" alt="" style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} onError={()=>setE1(true)}/>
                    : <div style={{ width:'100%',height:'100%',background:'linear-gradient(135deg,#1a1a2e,#16213e)',display:'flex',alignItems:'center',justifyContent:'center' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>
                }
                </div>
                <YandexTrainingMap variant="lesson" height={232} />
                {/* Подготовка к занятию — заполняет пространство под картой */}
                <div style={{ background:'#fff',borderRadius:18,border:'1px solid #E5E7EB',padding:'16px 18px' }}>
                  <div style={{ fontSize:15,fontWeight:700,color:'#111',marginBottom:10,display:'flex',alignItems:'center',gap:8 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    Что взять с собой
                  </div>
                  {['Удостоверение курсанта','Блокнот и ручка','Форма по погоде','Вода — 1.5 литра','Перекус на день','Индивидуальная аптечка'].map((item,i,arr)=>(
                    <div key={item} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<arr.length-1?'1px solid #F5F5F7':'none' }}>
                      <span style={{ width:20,height:20,borderRadius:6,background:'#EBF1FF',border:'1px solid #C7D2FE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                      <span style={{ fontSize:13.5,color:'#374151' }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#fff',borderRadius:18,border:'1px solid #E5E7EB',padding:'16px 18px',display:'flex',flexDirection:'column',gap:9,flex:1 }}>
                  <div style={{ fontSize:15,fontWeight:700,color:'#111',marginBottom:2 }}>Связь и помощь</div>
                  {([['Чат группы','/messages?chat=7'],['Вопрос инструктору','/messages?chat=1']] as [string,string][]).map(([l,to])=>(
                    <button key={l} className="lp-ghost" onClick={()=>navigate(to)} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'10px 14px',background:'#F9FAFB',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,fontWeight:600,color:'#374151',cursor:'pointer' }}>
                      {l}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  ))}
                  <button className="lp-ghost" onClick={()=>{ setTab('study'); window.setTimeout(()=>document.querySelector('[data-study-anchor]')?.scrollIntoView({behavior:'smooth',block:'center'}),60); }} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'10px 14px',background:'#F9FAFB',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,fontWeight:600,color:'#374151',cursor:'pointer' }}>
                    Материалы к занятию<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
            </div>
            </div>
        </div>
        </Sec>

        {/* ══ 2. ПЛАН ЗАНЯТИЯ ══ */}
        <Sec style={{ marginBottom:20 }}>
          <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',overflow:'hidden' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',borderBottom:'1px solid #F0F0F0' }}>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                <span style={{ fontSize:18,fontWeight:700,color:'#111' }}>План занятия</span>
              </div>
              <button className="lp-ghost" onClick={() => downloadPlanPdf(TITLE)} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:'#374151',cursor:'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Скачать PDF
              </button>
            </div>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#F9FAFB' }}>
                  {['№','Упражнения','Выделено минут','Время начала'].map((h,i)=>(
                    <th key={h} style={{ padding:'10px 16px',fontSize:12,color:'#6B7280',fontWeight:500,textAlign:i===0?'center':i>=2?'center':'left',borderBottom:'1px solid #F0F0F0',width:i===0?70:i>=2?140:undefined }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN.map((r,idx)=>{
                  if (r.type==='sep') return (
                    <tr key={idx} style={{ background:'#F9FAFB' }}>
                      <td colSpan={4} style={{ padding:'11px 16px',borderTop:'1px solid #F0F0F0',borderBottom:'1px solid #F0F0F0' }}>
                        <div style={{ fontSize:13,fontWeight:700,color:'#374151' }}>{r.title}</div>
                        {r.desc&&<div style={{ fontSize:12,color:'#6B7280',marginTop:3,lineHeight:1.5 }}>{r.desc}</div>}
                      </td>
                    </tr>
                  );
                  const pl=r.level===0?16:r.level===1?34:52;
                  return (
                    <tr key={idx} className="lp-plan" style={{ borderBottom:'1px solid #F5F5F7',transition:'background .12s' }}>
                      <td style={{ padding:'9px 16px',textAlign:'center',fontSize:13,fontWeight:600,color:r.level===0?'#374151':'#9CA3AF' }}>{r.num}</td>
                      <td style={{ padding:`9px 16px 9px ${pl}px`,fontSize:13,color:r.bold?'#374151':r.level===2?'#6B7280':'#1F2937',fontWeight:r.bold?600:r.level===0?500:400,whiteSpace:'pre-line' }}>{r.title}</td>
                      <td style={{ padding:'9px 16px',textAlign:'center',fontSize:13,color:r.mins?'#374151':'#D1D5DB',fontWeight:r.mins?600:400 }}>{r.mins??'—'}</td>
                      <td style={{ padding:'9px 16px',textAlign:'center',fontSize:13,color:r.time?'#374151':'#D1D5DB' }}>{r.time||'—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Sec>

        {/* ══ 3. СПИСОК ЗАНЯТИЙ ══ */}
        <Sec style={{ marginBottom:20 }}>
          <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',padding:'22px 24px' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                <span style={{ fontSize:18,fontWeight:700,color:'#111' }}>Список занятий по курсу</span>
                <span style={{ fontSize:12,color:'#9CA3AF',background:'#F4F6FA',padding:'3px 9px',borderRadius:20,border:'1px solid #E5E7EB' }}>{visibleLessons.length} занятий</span>
              </div>
              <select aria-label="Фильтры занятий" value={lessonListFilter} onChange={e=>setLessonListFilter(e.target.value as typeof lessonListFilter)} style={{ padding:'8px 34px 8px 12px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:'#374151',cursor:'pointer',outline:'none' }}>
                <option value="all">Все занятия</option>
                <option value="available">Доступные</option>
                <option value="viewed">Просмотренные</option>
                <option value="unviewed">Не просмотренные</option>
                <option value="locked">Заблокированные</option>
              </select>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18 }}>
              {visibleLessons.length === 0 && <div style={{ gridColumn:'1 / -1',padding:'36px 0',textAlign:'center',fontSize:13,color:'#9CA3AF' }}>По выбранному фильтру занятий нет</div>}
              {visibleLessons.map((l,i)=>{
                const openLesson = () => { navigate(`/lessons/${l.id}`, { state: { courseTitle, courseSlug } }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
                return (
                <div key={l.id} className={`c-mil-shell lp-lesson-shell${l.locked?' locked':''}`}
                  style={{ animation:`fadeUp .4s ease ${i*55}ms backwards` }}>
                  <div className="c-card-wrap" data-locked={l.locked?'':undefined} onClick={()=>{ if(!l.locked) openLesson(); }} style={{ cursor:l.locked?'default':'pointer' }}>
                  <div className="c-card-img" style={{ position:'relative',background:'#F3F4F6' }}>
                    <img src={l.img} alt={l.title} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block',filter:l.locked?'brightness(.5) saturate(.7)':'none' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/>
                    <div style={{ position:'absolute',inset:0,background:l.locked?'rgba(0,0,0,.15)':'linear-gradient(to top, rgba(0,0,0,.35) 0%, transparent 55%)',pointerEvents:'none' }}/>
                    <div className="c-card-overlay" />
                    <div style={{ position:'absolute',top:10,left:10,zIndex:3,background:'rgba(0,0,0,.55)',backdropFilter:'blur(6px)',color:'#fff',fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:8,border:'1px solid rgba(255,255,255,.15)' }}>{l.num}</div>
                    {!l.locked&&viewedLessons[String(l.id)]?.status === 'viewed'&&<div className="lp-viewed-badge" style={{ position:'absolute',top:10,right:10,zIndex:3,height:30,display:'flex',alignItems:'center',gap:6,background:'rgba(16,185,129,.94)',backdropFilter:'blur(6px)',color:'#fff',fontSize:11,fontWeight:800,padding:'0 9px',borderRadius:20,border:'1px solid rgba(255,255,255,.25)',boxSizing:'border-box' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{flexShrink:0}}><polyline points="20 6 9 17 4 12"/></svg><span className="lp-viewed-label">Просмотрено</span></div>}
                    {l.locked&&<div className="c-lock-icon" style={{ position:'absolute',inset:0,zIndex:3,display:'flex',alignItems:'center',justifyContent:'center' }}><IcLock/></div>}
                    {!l.locked&&viewedLessons[String(l.id)]?.status !== 'viewed'&&<div style={{ position:'absolute',bottom:10,right:10,zIndex:3,width:30,height:30,borderRadius:'50%',background:'rgba(55,93,251,.85)',display:'flex',alignItems:'center',justifyContent:'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>}
                  </div>
                  <div style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'#9CA3AF',marginBottom:7 }}><span>{l.date}</span><span>{l.time}</span></div>
                    <div style={{ fontSize:14,fontWeight:700,color:l.locked?'#9CA3AF':'#111',lineHeight:1.4 }}>{l.title}</div>
                  </div>
                  </div>
                  <div className="c-expand-wrap">
                    <div className="c-expand-inner">
                      <div style={{ padding:'0 14px 14px' }}>
                        {l.locked
                          ? <div className="c-oi c-oi-1" style={{ background:'#F4F6FA',border:'1px solid #E5E7EB',borderRadius:10,padding:'10px 12px',display:'flex',alignItems:'flex-start',gap:8 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0,marginTop:1 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                              <div style={{ fontSize:12,color:'#6B7280',lineHeight:1.5 }}>Откроется после прохождения предыдущего занятия</div>
                            </div>
                          : <button className="c-oi c-oi-1 c-enroll-btn" onClick={e=>{ e.stopPropagation(); openLesson(); }} style={{ width:'100%',height:42,background:'#375DFB',border:'none',borderRadius:8,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>Перейти к занятию<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>}
                      </div>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          </div>
        </Sec>

        {/* ══ 4. РАСПИСАНИЕ ══ */}
        <Sec style={{ marginBottom:20 }}>
          <StreamCalendar />
        </Sec>

        {/* ══ 5. ОДНОГРУППНИКИ + ОЦЕНКА ══ */}
        <Sec style={{ marginBottom:20 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1.55fr 1fr',gap:20,alignItems:'stretch' }}>
            {/* Одногруппники */}
            <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',overflow:'hidden' }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,padding:'18px 24px',borderBottom:'1px solid #F0F0F0' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span style={{ fontSize:18,fontWeight:700,color:'#111' }}>Одногруппники</span>
                <span style={{ fontSize:12,color:'#9CA3AF',background:'#F4F6FA',padding:'2px 9px',borderRadius:20,border:'1px solid #E5E7EB' }}>{MATES.length}</span>
                <button className="lp-ghost" onClick={()=>navigate('/messages?chat=7')} style={{ marginLeft:'auto',padding:'7px 12px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:12,color:'#374151',cursor:'pointer',fontWeight:600 }}>Чат группы</button>
              </div>
              <div style={{ maxHeight:440,overflowY:'auto' }}>
                {MATES.map((m,idx)=>(
                  <div key={m.id} className="lp-mate"
                    style={{ display:'flex',alignItems:'center',gap:12,padding:'13px 20px',borderBottom:idx<MATES.length-1?'1px solid #F5F5F7':'none',animation:`fadeUp .35s ease ${idx*45}ms both`,transition:'background .14s',borderRadius:8 }}>
                    <div onClick={()=>navigate(userProfilePath(m.name))} title={`Открыть профиль ${m.name}`} style={{ width:46,height:46,borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'#F3F4F6',border:'2px solid #E5E7EB',cursor:'pointer' }}>
                      <img src={m.img} alt={m.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <button onClick={()=>navigate(userProfilePath(m.name))} style={{ display:'block',padding:0,margin:'0 0 3px',background:'none',border:0,fontSize:14,fontWeight:700,color:'#111',cursor:'pointer' }}>{m.name}</button>
                      <div style={{ fontSize:12,color:'#9CA3AF',marginBottom:5 }}>{m.rank} · {m.spec}</div>
                      <IVDisplay index={m.index} rating={m.rating}/>
                    </div>
                    <button className="lp-ghost" onClick={()=>navigate(`/messages?chat=${m.chatId}`)} style={{ padding:'7px 16px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,color:'#374151',cursor:'pointer',flexShrink:0 }}>Написать</button>
                  </div>
                ))}
              </div>
            </div>
            {/* Оценка преподавателя */}
            <div style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',padding:'22px 24px',display:'flex',flexDirection:'column' }}>
              <div style={{ fontSize:18,fontWeight:700,color:'#111',marginBottom:16,textAlign:'center' }}>Оценка преподавателя</div>
              <div style={{ display:'flex',justifyContent:'center',gap:6,marginBottom:20 }}>
                {[1,2,3,4,5].map(i=>(
                  <span key={i} style={{ padding:2 }}>
                    <svg width="38" height="38" viewBox="0 0 24 24" fill={teacherAssessment.status==='graded' && i<=(teacherAssessment.score ?? 0)?'#F59E0B':'#E5E7EB'} stroke="none" style={{ transition:'fill .2s' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </span>
                ))}
              </div>
              <div style={{ background:'#F9FAFB',borderRadius:14,padding:'14px 16px',marginBottom:16,border:'1px solid #E5E7EB',flex:1 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                  <div style={{ width:40,height:40,borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'#F3F4F6' }}><img src="/teacher2-main.jpg" alt="Бек" style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/></div>
                  <div><div style={{ fontSize:14,fontWeight:700,color:'#111' }}>Бек</div><div style={{ fontSize:12,color:'#9CA3AF' }}>Главный инструктор</div></div>
                </div>
                {teacherAssessment.status === 'pending' && (
                  <div style={{ fontSize:13,color:'#374151',lineHeight:1.6 }}>
                    Сначала отметьте материал изученным и сдайте зачётный тест на 80%+. После этого работу можно отправить преподавателю.
                  </div>
                )}
                {teacherAssessment.status === 'reviewing' && (
                  <div style={{ fontSize:13,color:'#374151',lineHeight:1.6 }}>
                    Работа получена. Бек проверяет прохождение материала и результат теста. Когда оценка будет выставлена, она появится здесь и в уведомлениях.
                  </div>
                )}
                {teacherAssessment.status === 'graded' && (
                  <div style={{ fontSize:13,color:'#374151',lineHeight:1.6 }}>
                    {teacherAssessment.comment ?? 'Работа проверена. Продолжайте обучение в том же темпе.'}
                    {teacherAssessment.updatedAt && <div style={{ marginTop:8,fontSize:11,color:'#94A3B8' }}>Проверено {new Intl.DateTimeFormat('ru-RU', { day:'numeric',month:'long',hour:'2-digit',minute:'2-digit' }).format(new Date(teacherAssessment.updatedAt))}</div>}
                  </div>
                )}
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button className="lp-ghost" onClick={()=>navigate('/messages?chat=1')} style={{ flex:1,padding:'10px 0',background:'#EBF1FF',border:'1px solid #C7D2FE',borderRadius:12,color:'#375DFB',fontSize:13,fontWeight:600,cursor:'pointer' }}>Задать вопрос</button>
                <button
                  className={teacherAssessment.status==='pending' && isViewed && testPassed ? 'lp-prim' : ''}
                  disabled={teacherAssessment.status!=='pending' || !isViewed || !testPassed}
                  onClick={requestTeacherAssessment}
                  style={{ flex:1,padding:'10px 8px',background:teacherAssessment.status==='graded'?'#10B981':teacherAssessment.status==='pending'&&isViewed&&testPassed?'#375DFB':'#E5E7EB',border:'none',borderRadius:12,color:teacherAssessment.status==='pending'&&(!isViewed||!testPassed)?'#94A3B8':'#fff',fontSize:13,fontWeight:600,cursor:teacherAssessment.status==='pending'&&isViewed&&testPassed?'pointer':'default',boxShadow:teacherAssessment.status==='pending'&&isViewed&&testPassed?'0 4px 14px rgba(55,93,251,.26)':'none' }}
                >
                  {teacherAssessment.status==='graded' ? `Оценка ${teacherAssessment.score ?? 0}/5` : teacherAssessment.status==='reviewing' ? 'Ожидаем оценку' : isViewed && testPassed ? 'Отправить на проверку' : 'Сначала завершите урок'}
                </button>
              </div>
              {teacherAssessment.status === 'reviewing' && (
                <div style={{ marginTop:12,background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:12,padding:'10px 12px',fontSize:12,color:'#1D4ED8',fontWeight:700,textAlign:'center',animation:'fadeUp .18s ease both' }}>
                  Запрос сохранён. Результат появится только после проверки преподавателем.
                </div>
              )}
            </div>
          </div>
        </Sec>

        {/* ══ 6. ДЗ / К ИЗУЧЕНИЮ ══ */}
        <Sec style={{ marginBottom:20 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 320px',gap:20,alignItems:'start' }}>
            <div data-study-anchor style={{ background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',overflow:'hidden' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #F0F0F0',padding:'0 20px' }}>
                <div style={{ display:'flex' }}>
                  {[['hw','Домашние задания'],['study','К изучению']].map(([v,l])=>(
                    <button key={v} className="lp-tab" onClick={()=>setTab(v as 'hw'|'study')} style={{ padding:'14px 16px',background:'none',border:'none',borderBottom:tab===v?'2.5px solid #375DFB':'2.5px solid transparent',color:tab===v?'#375DFB':'#6B7280',fontWeight:tab===v?700:400,fontSize:14,cursor:'pointer',marginBottom:-1 }}>{l}</button>
                  ))}
                </div>
                <div className="lp-deadline" style={{ display:'flex',alignItems:'center',gap:5,background:'#FEF3C7',border:'1px solid #FCD34D',borderRadius:8,padding:'5px 11px',fontSize:12,color:'#B45309',fontWeight:700 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Сдать все до 9 марта
                </div>
              </div>
              {tab==='hw'&&(
                <div>
                  {HW.map((hw,i)=>{
                    const sub = submissions[hw.testId];
                    const prevPassed = i===0 || !!submissions[HW[i-1].testId]?.passed;
                    const passed = !!sub?.passed;
                    const attempted = !!sub && !sub.passed;
                    const status: 'done'|'retry'|'test'|'locked' = !prevPassed ? 'locked' : passed ? 'done' : attempted ? 'retry' : 'test';
                    const go = () => navigate(`/tests/${hw.testId}`);
                    return (
                    <div key={hw.id} className="lp-hw" style={{ display:'flex',alignItems:'center',gap:14,padding:'15px 20px',borderBottom:i<HW.length-1?'1px solid #F5F5F7':'none',transition:'background .14s' }}>
                      <div style={{ width:34,height:34,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:status==='done'?'#F0FDF4':status==='locked'?'#F3F4F6':status==='retry'?'#FFFBEB':'#EBF1FF',border:`1px solid ${status==='done'?'#BBF7D0':status==='locked'?'#E5E7EB':status==='retry'?'#FDE68A':'#C7D2FE'}`,fontSize:13,fontWeight:700,color:status==='done'?'#10B981':status==='locked'?'#D1D5DB':status==='retry'?'#D97706':'#375DFB' }}>
                        {status==='done'?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>:status==='locked'?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>:hw.num}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14,fontWeight:600,color:status==='locked'?'#9CA3AF':'#111',marginBottom:2 }}>{hw.title}</div>
                        <div style={{ fontSize:12,color:status==='retry'?'#D97706':status==='done'?'#10B981':'#9CA3AF' }}>{status==='locked'?'Откроется после сдачи предыдущего теста на 80%':status==='done'?`Сдано на ${sub?.score}% · можно пересдать`:status==='retry'?`Попытка не зачтена (${sub?.score}%) — нужно ≥ 80%`:hw.sub}</div>
                      </div>
                      {status==='locked'&&<div style={{ display:'flex',alignItems:'center',gap:5,background:'#F3F4F6',border:'1px solid #E5E7EB',borderRadius:9,padding:'7px 12px',fontSize:12,color:'#9CA3AF',fontWeight:600,flexShrink:0 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Закрыто</div>}
                      {status==='retry'&&<button className="lp-prim" onClick={go} style={{ display:'flex',alignItems:'center',gap:4,padding:'7px 12px',background:'#FEF3C7',border:'1px solid #FDE68A',borderRadius:9,fontSize:13,fontWeight:600,color:'#D97706',cursor:'pointer',flexShrink:0 }}>Пройти снова<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>}
                      {status==='test'&&<button className="lp-prim" onClick={go} style={{ display:'flex',alignItems:'center',gap:4,padding:'7px 12px',background:'#EBF1FF',border:'1px solid #C7D2FE',borderRadius:9,fontSize:13,fontWeight:600,color:'#375DFB',cursor:'pointer',flexShrink:0 }}>Пройти тест<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>}
                      {status==='done'&&<button className="lp-ghost" onClick={go} style={{ display:'flex',alignItems:'center',gap:5,padding:'7px 12px',background:'#fff',border:'1px solid #E5E7EB',borderRadius:9,fontSize:13,fontWeight:600,color:'#374151',cursor:'pointer',flexShrink:0 }}>Пересдать</button>}
                    </div>
                    );
                  })}
                </div>
              )}
              {tab==='study'&&(
                <div style={{ padding:'22px 24px' }}>
                  {!studyDone?(
                    <>
                      {STUDY.map(s=>(
                        <div key={s.id} style={{ marginBottom:28 }}>
                          <div style={{ borderRadius:14,overflow:'hidden',height:240,background:'#F3F4F6',marginBottom:16 }}><img src={s.img} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}}/></div>
                          <h3 style={{ fontSize:17,fontWeight:700,color:'#111',margin:'0 0 10px' }}>{s.title}</h3>
                          {s.text.map((t,i)=><p key={i} style={{ fontSize:14,color:'#374151',lineHeight:1.75,margin:'0 0 10px' }}>{t}</p>)}
                          {s.note&&<div className="lp-note" style={{ margin:'12px 0' }}><span style={{ fontWeight:700,color:'#374151' }}>Заметка: </span><span style={{ fontSize:14,color:'#374151',lineHeight:1.65 }}>{s.note}</span></div>}
                          {s.video&&<div style={{ marginTop:14 }}>
                            <div style={{ fontSize:13,fontWeight:700,color:'#374151',marginBottom:8,display:'flex',alignItems:'center',gap:6 }}><span style={{ width:7,height:7,borderRadius:'50%',background:'#EF4444',display:'inline-block' }} />Видео-разбор темы</div>
                            <VoevodaPlayer src="/video/den-rossii.mp4" poster="/video/den-rossii.jpg" height={300} />
                          </div>}
                        </div>
                      ))}
                      <div style={{ background:'#F0FDF4',borderRadius:14,border:'1px solid #BBF7D0',padding:'14px 18px',display:'flex',alignItems:'flex-start',gap:10 }}>
                        <div style={{ width:22,height:22,borderRadius:'50%',background:'#10B981',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                        <div>
                          <div style={{ fontSize:14,fontWeight:700,color:'#065F46',marginBottom:3 }}>Вы изучили всю необходимую информацию по уроку!</div>
                          <div style={{ fontSize:13,color:'#047857',marginBottom:8 }}>Если что-то забыли, сможете вернуться и закрепить информацию.</div>
                          <button onClick={()=>{saveLessonViewed();setStudyDone(true);setTab('hw');}} style={{ background:'none',border:'none',fontSize:13,color:'#375DFB',cursor:'pointer',textDecoration:'underline',padding:0,fontWeight:600 }}>К домашнему заданию</button>
                        </div>
                      </div>
                    </>
                  ):(
                    <div style={{ textAlign:'center',padding:'40px 0' }}>
                      <div style={{ width:64,height:64,borderRadius:'50%',background:'#F0FDF4',border:'2px solid #10B981',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                      <div style={{ fontSize:17,fontWeight:700,color:'#111',marginBottom:6 }}>Материал изучен!</div>
                      <button onClick={()=>{saveLessonViewed();setStudyDone(false);setTab('hw');}} style={{ padding:'9px 22px',background:'#375DFB',border:'none',borderRadius:12,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer' }}>К домашним заданиям</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display:'flex',flexDirection:'column',minHeight:0,background:'#fff',borderRadius:22,border:'1px solid #E5E7EB',overflow:'hidden' }}>
              <div style={{ display:'flex',borderBottom:'1px solid #F0F0F0',flexShrink:0 }}>
                {[['mat','Материалы'],['comments','Комментарии']].map(([v,l])=>(
                  <button key={v} className="lp-tab" onClick={()=>setMatTab(v as 'mat'|'comments')} style={{ flex:1,padding:'13px 10px',background:'none',border:'none',borderBottom:matTab===v?'2.5px solid #375DFB':'2.5px solid transparent',color:matTab===v?'#375DFB':'#6B7280',fontWeight:matTab===v?700:400,fontSize:14,cursor:'pointer',marginBottom:-1 }}>{l}</button>
                ))}
              </div>
              {matTab==='mat'&&(
                <div style={{ display:'flex',flexDirection:'column',flex:1,overflow:'hidden' }}>
                  <div style={{ overflowY:'auto',flex:1 }}>
                    {MATS.map((m)=>(
                      <div key={m.name} className="lp-mat" onClick={() => downloadDemoFile(m.name, m.type)} style={{ display:'flex',alignItems:'center',gap:12,padding:'13px 16px',borderBottom:'1px solid #F5F5F7',cursor:'pointer',transition:'background .14s' }}>
                        <div style={{ width:40,height:40,borderRadius:10,background:FC[m.type]+'18',border:`1px solid ${FC[m.type]}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><span style={{ fontSize:10,fontWeight:800,color:FC[m.type] }}>{m.type}</span></div>
                        <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:600,color:'#111' }}>{m.name}</div><div style={{ fontSize:11,color:'#9CA3AF' }}>{m.size}</div></div>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:'14px 16px',borderTop:'1px solid #F0F0F0',flexShrink:0 }}>
                    <button className="lp-prim" onClick={()=>{ MATS.forEach((m,idx)=>window.setTimeout(()=>downloadDemoFile(m.name,m.type),idx*120)); showNotice('Загрузка всех материалов начата'); }} style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px 0',background:'#375DFB',border:'none',borderRadius:12,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(55,93,251,.26)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Скачать все материалы
                    </button>
                    <div style={{ marginTop:8,fontSize:11,color:'#9CA3AF',textAlign:'center' }}>3 файла · ≈ 2.5 ГБ · обновлено 24 марта</div>
                  </div>
                </div>
              )}
              {matTab==='comments'&&(
                <div style={{ padding:'16px',display:'flex',flexDirection:'column',gap:10,flex:1,overflow:'hidden' }}>
                  <textarea value={commentText} onChange={e => { setCommentText(e.target.value); setCommentSent(false); }} placeholder="Написать комментарий к занятию..." style={{ width:'100%',flex:1,border:'1px solid #E5E7EB',borderRadius:12,padding:'12px 14px',fontSize:13,color:'#374151',resize:'none',outline:'none',boxSizing:'border-box' as const,fontFamily:'inherit',lineHeight:1.6,minHeight:0 }}/>
                  <button className="lp-prim" onClick={submitComment} style={{ width:'100%',padding:'11px 0',background:commentSent?'#10B981':'#375DFB',border:'none',borderRadius:12,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',flexShrink:0 }}>{commentSent ? 'Комментарий отправлен' : 'Отправить'}</button>
                  <div style={{ fontSize:11,color:'#9CA3AF',textAlign:'center' as const,flexShrink:0 }}>{commentSent ? 'Инструктор увидит комментарий в карточке занятия.' : 'Комментарий увидят инструктор и одногруппники.'}</div>
                </div>
              )}
            </div>
          </div>
        </Sec>

      </div>

      {boardOpen && <BoardModal onClose={() => setBoardOpen(false)} />}
      {rideOpen && <RideRequestModal onClose={() => setRideOpen(false)} />}
      {reportOpen && (
        <ReportFormModal
          contextTitle={TITLE}
          onClose={() => setReportOpen(false)}
          onSaveDraft={() => setReportStep('draft')}
          onSubmit={submitReport}
        />
      )}
      {reportStatus && <StatusModal kind={reportStatus.kind} title={reportStatus.title} text={reportStatus.text} onClose={() => setReportStatus(null)} />}

    </div>
  );
}
