import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLessonProgressStore } from '../store/useLessonProgressStore';

const CSS = `
  @keyframes cpFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes cpPulse{0%,100%{box-shadow:0 0 0 0 rgba(55,93,251,.25)}50%{box-shadow:0 0 0 8px rgba(55,93,251,0)}}
  .cp-page{min-height:100vh;background:#F6F8FC;padding:84px 28px 48px;margin-left:56px;color:#0F172A}
  .cp-shell{max-width:1240px;margin:0 auto}
  .cp-card{background:#fff;border:1px solid #E2E8F0;border-radius:18px;box-shadow:0 16px 44px rgba(15,23,42,.06)}
  .cp-btn{border:none;border-radius:12px;padding:11px 16px;font-size:13px;font-weight:850;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:transform .16s,box-shadow .16s,background .16s,border-color .16s}
  .cp-btn:hover{transform:translateY(-1px)}
  .cp-btn-primary{background:#375DFB;color:#fff;box-shadow:0 12px 26px rgba(55,93,251,.25)}
  .cp-btn-primary:hover{box-shadow:0 16px 34px rgba(55,93,251,.34)}
  .cp-btn-ghost{background:#fff;color:#334155;border:1px solid #CBD5E1}
  .cp-btn-ghost:hover{background:#F8FAFC;border-color:#AFC2FF;color:#375DFB}
  .cp-stat{animation:cpFadeUp .42s ease both}
  .cp-tab{border:none;background:transparent;color:#64748B;border-radius:12px;padding:10px 14px;font-size:13px;font-weight:850;cursor:pointer;transition:background .16s,color .16s}
  .cp-tab.active{background:#fff;color:#375DFB;box-shadow:0 2px 8px rgba(15,23,42,.08)}
  .cp-lesson{transition:transform .16s,border-color .16s,box-shadow .16s}
  .cp-lesson:hover{transform:translateY(-2px);border-color:#B8CAFE;box-shadow:0 14px 34px rgba(55,93,251,.11)}
  .cp-dot.done{animation:cpPulse 1.8s ease infinite}
  @media(max-width:920px){.cp-page{margin-left:0;padding:76px 16px 34px}.cp-hero{grid-template-columns:1fr!important}.cp-grid-4{grid-template-columns:repeat(2,1fr)!important}.cp-main{grid-template-columns:1fr!important}.cp-actions{justify-content:flex-start!important}}
  @media(max-width:620px){.cp-grid-4{grid-template-columns:1fr!important}.cp-title{font-size:30px!important}.cp-btn{width:100%}.cp-actions{display:grid!important;grid-template-columns:1fr!important;width:100%}}
`;

const injectCss = () => {
  if (typeof document === 'undefined' || document.getElementById('course-progress-redesign-css')) return;
  const style = document.createElement('style');
  style.id = 'course-progress-redesign-css';
  style.textContent = CSS;
  document.head.appendChild(style);
};

const ICONS = {
  check: 'M20 6 9 17l-5-5',
  clock: ['M12 7v5l3 2', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z'],
  book: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z'],
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z',
  download: ['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14'],
  target: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z', 'M14 2v6h6'],
  medal: ['M8 3h8l2 5-6 4-6-4 2-5Z', 'M12 12v9', 'm8 17 4-2 4 2'],
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  arrow: 'M5 12h14m-6-6 6 6-6 6',
};

function Icon({ name, size = 18, color = 'currentColor' }: { name: keyof typeof ICONS; size?: number; color?: string }) {
  const paths = Array.isArray(ICONS[name]) ? ICONS[name] as string[] : [ICONS[name] as string];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

const LESSONS = [
  { id: 1, title: 'Вводный инструктаж и безопасность', type: 'Урок', duration: '38 мин', done: true, score: 100 },
  { id: 2, title: 'Основы перемещения в группе', type: 'Практика', duration: '54 мин', done: true, score: 92 },
  { id: 3, title: 'Связь и сигналы на полигоне', type: 'Урок', duration: '42 мин', done: true, score: 88 },
  { id: 4, title: 'Топография и работа с картой', type: 'Практика', duration: '61 мин', done: false, score: 0 },
  { id: 5, title: 'Тактическая медицина', type: 'Зачет', duration: '46 мин', done: false, score: 0 },
  { id: 6, title: 'Разбор полевого занятия', type: 'Разбор', duration: '35 мин', done: false, score: 0 },
];

const HOMEWORKS = [
  { id: 1, title: 'Схема выхода группы', status: 'Принято', tone: '#16A34A' },
  { id: 2, title: 'Контрольные вопросы по связи', status: 'На проверке', tone: '#EA580C' },
  { id: 3, title: 'План маршрута до полигона', status: 'Нужно сдать', tone: '#375DFB' },
];

const ACHIEVEMENTS = [
  { title: 'Первый рубеж', desc: 'Закрыты первые 3 урока', tone: '#375DFB' },
  { title: 'Дисциплина', desc: 'Все задания сданы в срок', tone: '#16A34A' },
  { title: 'Связист группы', desc: 'Активность в учебном чате', tone: '#0EA5E9' },
];

const INSTRUCTORS = [
  { name: 'Торнадо', role: 'Главный инструктор', rank: 'Вице-ст. сержант', chatId: 1, avatar: '/сержант.png' },
  { name: 'Коба', role: 'Куратор практики', rank: 'Капитан', chatId: 3, avatar: '/teacher2-main.jpg' },
];

const COURSE_TITLES: Record<string, string> = {
  razvedka: 'Разведывательно-штурмовая подготовка',
  'course-young-fighter': 'Курс молодого бойца V5',
  'kmb-v5': 'Курс молодого бойца V5',
};

function Panel({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <section className="cp-card" style={{ padding: 22, ...style }}>{children}</section>;
}

function Stat({ label, value, icon, tone, delay }: { label: string; value: string; icon: keyof typeof ICONS; tone: string; delay: number }) {
  return (
    <div className="cp-card cp-stat" style={{ padding: 18, animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 800, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 24, color: '#0F172A', fontWeight: 950 }}>{value}</div>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${tone}12`, border: `1px solid ${tone}28`, display: 'grid', placeItems: 'center' }}>
          <Icon name={icon} color={tone} />
        </div>
      </div>
    </div>
  );
}

export function CourseProgressPage() {
  injectCss();
  const navigate = useNavigate();
  const { slug } = useParams();
  const { lessons } = useLessonProgressStore();
  const lessonsRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'lessons' | 'homework' | 'achievements'>('lessons');
  const [review, setReview] = useState(() => localStorage.getItem('voevoda_course_progress_review') || '');
  const [saved, setSaved] = useState(false);

  const completedFromStore = useMemo(() => Object.values(lessons).filter(lesson => lesson.status === 'viewed').length, [lessons]);
  const completed = Math.max(completedFromStore, LESSONS.filter(l => l.done).length);
  const percent = Math.min(100, Math.round((completed / 9) * 100));
  const decodedSlug = slug ? decodeURIComponent(slug) : '';
  const title = COURSE_TITLES[decodedSlug] || (decodedSlug ? decodedSlug.replace(/-/g, ' ') : 'Курс молодого бойца');

  const saveReview = () => {
    localStorage.setItem('voevoda_course_progress_review', review.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const downloadReport = () => {
    const body = [
      'Отчет по прогрессу курса',
      `Курс: ${title}`,
      `Прогресс: ${percent}%`,
      `Пройдено занятий: ${completed} из 9`,
      `Домашние задания: ${HOMEWORKS.length}`,
      `Дата выгрузки: ${new Date().toLocaleDateString('ru-RU')}`,
    ].join('\n');
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'course-progress-report.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="cp-page">
      <div className="cp-shell">
        <section className="cp-card cp-hero" style={{ display: 'grid', gridTemplateColumns: '1.35fr .65fr', gap: 24, padding: 28, marginBottom: 18, background: 'linear-gradient(135deg,#FFFFFF 0%,#EEF4FF 100%)', overflow: 'hidden', position: 'relative' }}>
          <div>
            <button className="cp-btn cp-btn-ghost" onClick={() => navigate(`/my-courses/${encodeURIComponent(title)}`)} style={{ marginBottom: 20 }}>
              <Icon name="arrow" size={16} /> К курсу
            </button>
            <div style={{ fontSize: 12, color: '#375DFB', fontWeight: 950, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 8 }}>Учебный прогресс</div>
            <h1 className="cp-title" style={{ margin: 0, fontSize: 44, lineHeight: 1.05, color: '#0F172A', fontWeight: 950, maxWidth: 760 }}>
              {title}
            </h1>
            <p style={{ margin: '14px 0 24px', color: '#475569', fontSize: 15, lineHeight: 1.7, maxWidth: 720 }}>
              Здесь собраны занятия, домашние задания, награды и связь с инструкторами. Все основные кнопки ведут в рабочие разделы портала.
            </p>
            <div className="cp-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="cp-btn cp-btn-primary" onClick={() => lessonsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                <Icon name="book" /> Перейти к занятиям
              </button>
              <button className="cp-btn cp-btn-ghost" onClick={downloadReport}>
                <Icon name="download" /> Скачать отчет
              </button>
              <button className="cp-btn cp-btn-ghost" onClick={() => navigate('/messages?chat=1')}>
                <Icon name="message" /> Задать вопрос
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 220, height: 220, borderRadius: '50%', background: `conic-gradient(#375DFB ${percent * 3.6}deg,#E2E8F0 0deg)`, display: 'grid', placeItems: 'center', boxShadow: '0 22px 48px rgba(55,93,251,.2)' }}>
              <div style={{ width: 168, height: 168, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: 46, fontWeight: 950, color: '#0F172A', lineHeight: 1 }}>{percent}%</div>
                  <div style={{ fontSize: 12, color: '#64748B', fontWeight: 850, marginTop: 6 }}>общий прогресс</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="cp-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          <Stat label="Пройдено занятий" value={`${completed} / 9`} icon="check" tone="#16A34A" delay={0} />
          <Stat label="Средний балл" value="91%" icon="target" tone="#375DFB" delay={60} />
          <Stat label="Домашние задания" value="3 активных" icon="file" tone="#EA580C" delay={120} />
          <Stat label="Учебные часы" value="122 ч" icon="clock" tone="#0EA5E9" delay={180} />
        </div>

        <div className="cp-main" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, alignItems: 'start' }}>
          <Panel>
            <div ref={lessonsRef}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>План прохождения</h2>
                  <p style={{ margin: '6px 0 0', color: '#64748B', fontSize: 13 }}>Переключайте разделы и открывайте нужные материалы.</p>
                </div>
                <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: '#EEF2F7' }}>
                  <button className={`cp-tab ${tab === 'lessons' ? 'active' : ''}`} onClick={() => setTab('lessons')}>Занятия</button>
                  <button className={`cp-tab ${tab === 'homework' ? 'active' : ''}`} onClick={() => setTab('homework')}>Домашние</button>
                  <button className={`cp-tab ${tab === 'achievements' ? 'active' : ''}`} onClick={() => setTab('achievements')}>Награды</button>
                </div>
              </div>

              {tab === 'lessons' && (
                <div style={{ display: 'grid', gap: 10 }}>
                  {LESSONS.map((lesson, index) => (
                    <button key={lesson.id} className="cp-lesson" onClick={() => navigate(`/lessons/${lesson.id}`)} style={{ border: '1px solid #E2E8F0', background: '#fff', borderRadius: 16, padding: 14, cursor: 'pointer', textAlign: 'left', display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: 14, alignItems: 'center' }}>
                      <span className={`cp-dot ${lesson.done ? 'done' : ''}`} style={{ width: 46, height: 46, borderRadius: 14, background: lesson.done ? '#ECFDF5' : '#F1F5F9', color: lesson.done ? '#16A34A' : '#64748B', border: `1px solid ${lesson.done ? '#BBF7D0' : '#E2E8F0'}`, display: 'grid', placeItems: 'center', fontWeight: 950 }}>
                        {lesson.done ? <Icon name="check" /> : index + 1}
                      </span>
                      <span>
                        <span style={{ display: 'block', color: '#0F172A', fontSize: 15, fontWeight: 900, marginBottom: 4 }}>{lesson.title}</span>
                        <span style={{ color: '#64748B', fontSize: 12 }}>{lesson.type} · {lesson.duration}</span>
                      </span>
                      <span style={{ color: lesson.done ? '#16A34A' : '#375DFB', fontSize: 13, fontWeight: 900 }}>{lesson.done ? `${lesson.score}%` : 'Открыть'}</span>
                    </button>
                  ))}
                </div>
              )}

              {tab === 'homework' && (
                <div style={{ display: 'grid', gap: 10 }}>
                  {HOMEWORKS.map((work) => (
                    <div key={work.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 5 }}>{work.title}</div>
                        <div style={{ color: work.tone, fontSize: 12, fontWeight: 900 }}>{work.status}</div>
                      </div>
                      <button className="cp-btn cp-btn-ghost" onClick={() => navigate(`/homework/${work.id}`)}>Открыть</button>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'achievements' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
                  {ACHIEVEMENTS.map((ach) => (
                    <div key={ach.title} style={{ border: '1px solid #E2E8F0', borderRadius: 16, padding: 16, background: '#fff' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 15, background: `${ach.tone}12`, border: `1px solid ${ach.tone}28`, display: 'grid', placeItems: 'center', color: ach.tone, marginBottom: 12 }}>
                        <Icon name="medal" />
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 950, marginBottom: 5 }}>{ach.title}</div>
                      <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{ach.desc}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          <div style={{ display: 'grid', gap: 18 }}>
            <Panel>
              <h2 style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 950 }}>Инструкторы</h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {INSTRUCTORS.map((person) => (
                  <div key={person.chatId} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, border: '1px solid #E2E8F0', borderRadius: 16, background: '#F8FAFC' }}>
                    <img src={person.avatar} alt="" style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover', background: '#E2E8F0' }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/teacher1-main.jpg'; }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#64748B', fontSize: 11, fontWeight: 850, textTransform: 'uppercase' }}>{person.rank}</div>
                      <div style={{ color: '#0F172A', fontSize: 16, fontWeight: 950 }}>{person.name}</div>
                      <div style={{ color: '#64748B', fontSize: 12 }}>{person.role}</div>
                    </div>
                    <button className="cp-btn cp-btn-primary" onClick={() => navigate(`/messages?chat=${person.chatId}`)} style={{ padding: 10, width: 42 }}>
                      <Icon name="message" />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 950 }}>Заметка по курсу</h2>
              <textarea value={review} onChange={(e) => { setReview(e.target.value); setSaved(false); }} placeholder="Напишите, что нужно повторить перед следующим занятием" style={{ width: '100%', minHeight: 118, resize: 'vertical', border: '1px solid #CBD5E1', borderRadius: 14, padding: 12, outline: 'none', font: 'inherit', fontSize: 13, lineHeight: 1.6, boxSizing: 'border-box' }} />
              <button className={`cp-btn ${saved ? 'cp-btn-ghost' : 'cp-btn-primary'}`} onClick={saveReview} style={{ marginTop: 10, width: '100%' }}>
                <Icon name={saved ? 'check' : 'file'} /> {saved ? 'Сохранено' : 'Сохранить заметку'}
              </button>
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}
