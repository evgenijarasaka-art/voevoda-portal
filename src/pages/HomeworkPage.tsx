import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const CSS = `
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
  .hw-btn-prim { transition:background .15s,box-shadow .15s,transform .12s; }
  .hw-btn-prim:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(55,93,251,.38); }
  .hw-btn-sec { transition:all .15s; }
  .hw-btn-sec:hover { background:#F3F4F6!important; }
  .hw-row { border-radius:12px; transition:background .14s; }
  .hw-row:hover { background:#F6F8FF!important; }
  .hw-mat-row { transition:background .14s; cursor:pointer; }
  .hw-mat-row:hover { background:#F6F8FF!important; }
  .hw-review-opt { transition:all .18s; cursor:pointer; }
  .hw-review-opt:hover { border-color:#375DFB!important; background:#EBF1FF!important; color:#375DFB!important; }
  .hw-review-opt.sel { border-color:#375DFB!important; background:#EBF1FF!important; color:#375DFB!important; font-weight:600; }
`;

function injectCss(css: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style'); s.id = id; s.textContent = css;
  document.head.appendChild(s);
}

const HW_DATA = [
  { id: 1, num: 1, title: 'Ориентирование в лесистой местности', sub: 'Составить конспект и выписать правила', img: '/kyrs1.png', deadline: null, deadlineColor: '#10B981', status: 'done', attempts: '1 / 3' },
  { id: 2, num: 2, title: 'Огневая подготовка снайпера', sub: 'Тест по огневой подготовке', img: '/kyrs2.png', deadline: 'Сдать до завтра', deadlineColor: '#F59E0B', status: 'retry', attempts: '2 / 3' },
  { id: 3, num: 3, title: 'Внутренняя и внешняя баллистика', sub: 'Пройдите тест на знание основ', img: '/kyrs3.png', deadline: 'Сдать до 14 апреля', deadlineColor: '#10B981', status: 'test', attempts: '1 / 3' },
  { id: 4, num: 4, title: 'Огневая подготовка снайпера', sub: 'Практика на полигоне', img: '/kyrs1.png', deadline: null, deadlineColor: '#9CA3AF', status: 'locked', attempts: '0 / 3' },
];

const MATERIALS = [
  { type: 'PDF', name: 'Рабочая тетрадь', size: '224 мб' },
  { type: 'JPG', name: 'Пример карты', size: '302 кб' },
  { type: 'MP4', name: 'Видео-материалы', size: '2.2 гб' },
];

const FILE_COLORS: Record<string, string> = { PDF: '#EF4444', JPG: '#3B82F6', MP4: '#8B5CF6' };

function downloadHomeworkMaterial(name: string, type: string) {
  const ext = type === 'JPG' ? 'jpg' : type === 'MP4' ? 'mp4' : 'pdf';
  const safeName = name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-').toLowerCase();
  const blob = new Blob([
    `Демонстрационный материал портала ВОЕВОДА\n\nФайл: ${name}\nТип: ${type}\n\nВ рабочей версии здесь будет реальная ссылка на файл домашнего задания.`,
  ], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName || 'homework-material'}.${ext}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const REVIEW_QUESTIONS = [
  'Как усвоили материал?',
  'Что было самым сложным в теме?',
  'Какие вопросы остались без ответа?',
  'Нужны ли дополнительные материалы по теме?',
];

interface ReviewModalProps {
  hwTitle: string;
  hwNum: number;
  onClose: () => void;
  onDone: () => void;
}

function ReviewModal({ hwTitle, hwNum, onClose, onDone }: ReviewModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(REVIEW_QUESTIONS.length).fill('Усвоил'));
  const [comments, setComments] = useState<string[]>(Array(REVIEW_QUESTIONS.length).fill(''));
  const OPTS = ['Усвоил', 'Есть вопрос', 'Не усвоил', 'Другое'];

  function next() {
    if (step < REVIEW_QUESTIONS.length - 1) setStep(s => s + 1);
    else onDone();
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20, backdropFilter: 'blur(6px)', animation: 'fadeIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 460, width: '100%', background: '#fff', borderRadius: 22, boxShadow: '0 28px 70px rgba(0,0,0,.22)', animation: 'scaleIn .22s cubic-bezier(.4,0,.2,1)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EBF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Отзыв об уроке</span>
          </div>
          <span style={{ fontSize: 13, color: '#9CA3AF', background: '#F4F6FA', padding: '3px 10px', borderRadius: 20, border: '1px solid #E5E7EB' }}>
            Вопросы {step + 1} / {REVIEW_QUESTIONS.length}
          </span>
        </div>
        <div style={{ height: 3, background: '#F0F0F0' }}>
          <div style={{ height: '100%', width: `${((step + 1) / REVIEW_QUESTIONS.length) * 100}%`, background: '#375DFB', transition: 'width .3s ease' }} />
        </div>
        <div style={{ padding: '28px 24px', animation: 'fadeUp .25s ease' }} key={step}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#EBF1FF', border: '2px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 20, fontWeight: 900, color: '#375DFB' }}>
            {String(step + 1).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#111', textAlign: 'center', marginBottom: 6 }}>
            {REVIEW_QUESTIONS[step]}
          </div>
          <div style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 22 }}>
            Выберите вариант ответа ниже
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {OPTS.map(opt => (
              <button key={opt} className={`hw-review-opt${answers[step] === opt ? ' sel' : ''}`}
                onClick={() => { const next = [...answers]; next[step] = opt; setAnswers(next); }}
                style={{ padding: '8px 18px', borderRadius: 24, border: `1.5px solid ${answers[step] === opt ? '#375DFB' : '#E5E7EB'}`, background: answers[step] === opt ? '#EBF1FF' : '#fff', color: answers[step] === opt ? '#375DFB' : '#374151', fontSize: 13, cursor: 'pointer' }}>
                {opt}
              </button>
            ))}
          </div>
          <textarea
            value={comments[step]}
            onChange={e => { const next = [...comments]; next[step] = e.target.value; setComments(next); }}
            placeholder="Напишите комментарий..."
            style={{ width: '100%', minHeight: 88, border: '1px solid #E5E7EB', borderRadius: 14, padding: '12px 14px', fontSize: 13, color: '#374151', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color .15s' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#C7D2FE')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
          />
        </div>
        <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
          {step > 0 && (
            <button className="hw-btn-sec" onClick={() => setStep(s => s - 1)}
              style={{ flex: '0 0 auto', padding: '12px 18px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              Назад
            </button>
          )}
          <button className="hw-btn-prim" onClick={next}
            style={{ flex: 1, padding: '12px 0', background: '#375DFB', border: 'none', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(55,93,251,.28)' }}>
            {step < REVIEW_QUESTIONS.length - 1 ? 'Следующий вопрос' : 'Завершить'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function HomeworkPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // ↓ FIX: читаем courseTitle и courseSlug из state
  const { courseTitle, courseSlug } = (location.state as {
    courseTitle?: string;
    courseSlug?: string;
  } | null) ?? {};

  // Fallback из sessionStorage, затем дефолт
  const resolvedTitle =
    courseTitle ??
    (courseSlug ? sessionStorage.getItem(`course_title_${courseSlug}`) : null) ??
    'Курс';
  const resolvedSlug = courseSlug ?? encodeURIComponent(resolvedTitle);

  // Сохраняем в sessionStorage при наличии свежего title из state
  useEffect(() => {
    if (courseTitle && courseSlug) {
      sessionStorage.setItem(`course_title_${courseSlug}`, courseTitle);
    }
  }, [courseTitle, courseSlug]);

  const [activeTab, setActiveTab] = useState<'hw' | 'study'>('hw');
  const [matTab, setMatTab] = useState<'mat' | 'comments'>('mat');
  const [reviewTarget, setReviewTarget] = useState<typeof HW_DATA[0] | null>(null);
  const [doneIds, setDoneIds] = useState<number[]>([1]);
  const [imgErr, setImgErr] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { injectCss(CSS, 'hwp-css'); }, []);

  const hwId = id ? parseInt(id) : 2;
  const hw = HW_DATA.find(h => h.id === hwId) ?? HW_DATA[1];
  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2400);
  };

  // Сокращаем длинный title для breadcrumb
  const shortTitle = resolvedTitle.length > 20 ? resolvedTitle.slice(0, 20) + '…' : resolvedTitle;

  // ↓ FIX: динамический breadcrumb — больше нет захардкоженного slug
  type Crumb = [string, string | null, Record<string, unknown> | null];
  const BREADCRUMB: Crumb[] = [
    ['Мои курсы', '/my-courses', null],
    [shortTitle, `/my-courses/${resolvedSlug}`, { title: resolvedTitle }],
    ['Личная тактическ...', `/lessons/1`, null],
    [`Домашнее задание №${hwId}`, null, null],
  ];

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F4F6FB' }}>
      {notice && (
        <div style={{ position:'fixed',right:24,bottom:24,zIndex:10000,background:'#111827',color:'#fff',borderRadius:12,padding:'12px 16px',fontSize:13,fontWeight:700,boxShadow:'0 18px 45px rgba(17,24,39,.24)' }}>
          {notice}
        </div>
      )}
      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '9px 28px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9CA3AF', flexWrap: 'wrap' }}>
        {BREADCRUMB.map(([label, path, state], i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {path
              ? <span
                  onClick={() => navigate(path, state ? { state } : {})}
                  style={{ cursor: 'pointer', transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                >{label}</span>
              : <span style={{ color: '#374151', fontWeight: 500 }}>{label}</span>}
            {i < BREADCRUMB.length - 1 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>
        ))}
      </div>

      <div style={{ padding: '24px 28px 60px', maxWidth: 1100, margin: '0 auto' }}>
        {/* HW Header */}
        <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 20, animation: 'fadeUp .4s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'stretch' }}>
            <div style={{ height: 160, background: '#F3F4F6', position: 'relative' }}>
              <img src={hw.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>
                {String(hw.num).padStart(2, '0')}
              </div>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 6 }}>{hw.title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>{hw.sub}</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {hw.deadline && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: hw.deadlineColor + '18', border: `1px solid ${hw.deadlineColor}30`, borderRadius: 8, padding: '5px 12px', fontSize: 12, color: hw.deadlineColor, fontWeight: 600 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {hw.deadline}
                    </div>
                  )}
                  <span style={{ fontSize: 12, color: '#9CA3AF', background: '#F4F6FA', padding: '4px 10px', borderRadius: 20, border: '1px solid #E5E7EB' }}>Попыток {hw.attempts}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="hw-btn-sec" onClick={() => navigate('/messages?chat=1')}
                  style={{ padding: '9px 18px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                  Задать вопрос
                </button>
                <button className="hw-btn-prim" onClick={() => navigate(`/tests/${hw.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#375DFB', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 14px rgba(55,93,251,.28)' }}>
                  К выполнению
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          {/* LEFT: tabs */}
          <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0', padding: '0 20px' }}>
              <div style={{ display: 'flex' }}>
                {[['hw', 'Домашние задания'], ['study', 'К изучению']].map(([val, label]) => (
                  <button key={val} onClick={() => setActiveTab(val as 'hw' | 'study')}
                    style={{ padding: '14px 16px', background: 'none', border: 'none', borderBottom: activeTab === val ? '2.5px solid #375DFB' : '2.5px solid transparent', color: activeTab === val ? '#375DFB' : '#6B7280', fontWeight: activeTab === val ? 700 : 400, fontSize: 14, cursor: 'pointer', marginBottom: -1, transition: 'color .15s, border-color .15s' }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '5px 12px', fontSize: 12, color: '#375DFB', fontWeight: 600 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Сдать до 9 марта
              </div>
            </div>

            {activeTab === 'hw' && (
              <div>
                {HW_DATA.map((item, idx) => (
                  <div key={item.id} className="hw-row"
                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: idx < HW_DATA.length - 1 ? '1px solid #F5F5F7' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: doneIds.includes(item.id) ? '#F0FDF4' : item.status === 'locked' ? '#F3F4F6' : '#EBF1FF', border: `1px solid ${doneIds.includes(item.id) ? '#BBF7D0' : item.status === 'locked' ? '#E5E7EB' : '#C7D2FE'}`, fontSize: 13, fontWeight: 700, color: doneIds.includes(item.id) ? '#10B981' : item.status === 'locked' ? '#D1D5DB' : '#375DFB' }}>
                      {doneIds.includes(item.id)
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        : item.status === 'locked'
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        : item.num}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: item.status === 'locked' ? '#9CA3AF' : '#111', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{item.sub}</div>
                    </div>
                    {!doneIds.includes(item.id) && item.status !== 'locked' && item.deadline && (
                      <div style={{ background: item.deadlineColor + '18', border: `1px solid ${item.deadlineColor}30`, borderRadius: 8, padding: '4px 10px', fontSize: 12, color: item.deadlineColor, fontWeight: 600, flexShrink: 0 }}>{item.deadline}</div>
                    )}
                    {!doneIds.includes(item.id) && item.status === 'retry' && (
                      <button className="hw-btn-prim" onClick={() => setReviewTarget(item)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, fontSize: 13, color: '#D97706', cursor: 'pointer', flexShrink: 0 }}>
                        Пройти снова <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    )}
                    {!doneIds.includes(item.id) && item.status === 'test' && (
                      <button className="hw-btn-prim" onClick={() => setReviewTarget(item)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#375DFB', cursor: 'pointer', flexShrink: 0 }}>
                        Пройти тест <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    )}
                    {doneIds.includes(item.id) && (
                      <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600, flexShrink: 0 }}>Выполнено</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'study' && (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EBF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>Материалы к изучению</div>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Изучите теоретический материал перед выполнением заданий</p>
                <button className="hw-btn-prim" onClick={() => navigate(`/lessons/${hwId}`)}
                  style={{ padding: '10px 24px', background: '#375DFB', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(55,93,251,.28)' }}>
                  Перейти к изучению
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Instructor + Materials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                {!imgErr
                  ? <img src="/teacher2-main.jpg" alt="Бек" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErr(true)} />
                  : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Александр Каспаров</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Главный Инструктор</div>
              </div>
              <button className="hw-btn-sec" onClick={() => navigate('/messages?chat=1')}
                style={{ padding: '7px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12, color: '#374151', cursor: 'pointer', flexShrink: 0 }}>
                Задать вопрос
              </button>
            </div>

            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0' }}>
                {[['mat', 'Материалы'], ['comments', 'Комментарии']].map(([val, label]) => (
                  <button key={val} onClick={() => setMatTab(val as 'mat' | 'comments')}
                    style={{ flex: 1, padding: '12px 10px', background: 'none', border: 'none', borderBottom: matTab === val ? '2.5px solid #375DFB' : '2.5px solid transparent', color: matTab === val ? '#375DFB' : '#6B7280', fontWeight: matTab === val ? 700 : 400, fontSize: 13, cursor: 'pointer', marginBottom: -1, transition: 'color .15s' }}>
                    {label}
                  </button>
                ))}
              </div>
              {matTab === 'mat' && (
                <div>
                  {MATERIALS.map((m, i) => (
                    <div key={m.name} className="hw-mat-row" onClick={() => { downloadHomeworkMaterial(m.name, m.type); showNotice('Материал скачан'); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < MATERIALS.length - 1 ? '1px solid #F5F5F7' : 'none' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: FILE_COLORS[m.type] + '18', border: `1px solid ${FILE_COLORS[m.type]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: FILE_COLORS[m.type] }}>{m.type}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{m.size}</div>
                      </div>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </div>
                  ))}
                </div>
              )}
              {matTab === 'comments' && (
                <div style={{ padding: '16px' }}>
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Написать комментарий..."
                    style={{ width: '100%', minHeight: 88, border: '1px solid #E5E7EB', borderRadius: 12, padding: '10px 12px', fontSize: 13, color: '#374151', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  <button className="hw-btn-prim" onClick={() => { showNotice(commentText.trim() ? 'Комментарий отправлен инструктору' : 'Напишите комментарий перед отправкой'); if (commentText.trim()) setCommentText(''); }} style={{ width: '100%', marginTop: 8, padding: '9px 0', background: '#375DFB', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Отправить</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {reviewTarget && (
        <ReviewModal
          hwTitle={reviewTarget.title}
          hwNum={reviewTarget.num}
          onClose={() => setReviewTarget(null)}
          onDone={() => {
            setDoneIds(prev => [...prev, reviewTarget.id]);
            setReviewTarget(null);
            navigate(`/tests/${reviewTarget.id}`);
          }}
        />
      )}
    </div>
  );
}

