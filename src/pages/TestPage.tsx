import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CSS = `
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
  @keyframes progress{ from{width:0} to{width:var(--w)} }
  .tp-opt { transition:all .18s ease; cursor:pointer; }
  .tp-opt:hover:not(.disabled) { border-color:#375DFB!important; background:#F0F4FF!important; }
  .tp-opt.selected { border-color:#375DFB!important; background:#EBF1FF!important; }
  .tp-opt.correct  { border-color:#10B981!important; background:#F0FDF4!important; }
  .tp-opt.wrong    { border-color:#EF4444!important; background:#FEF2F2!important; }
  .tp-btn-prim { transition:background .15s,box-shadow .15s,transform .12s; }
  .tp-btn-prim:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(55,93,251,.38); }
  .tp-btn-prim:disabled { opacity:.45; cursor:not-allowed; }
  .tp-btn-sec { transition:all .15s; }
  .tp-btn-sec:hover { background:#F3F4F6!important; }
  .tp-result-bar { height:8px; border-radius:8px; background:#E5E7EB; overflow:hidden; }
  .tp-result-fill { height:100%; border-radius:8px; transition:width 1s cubic-bezier(.4,0,.2,1); }
`;

function injectCss(css: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style'); s.id = id; s.textContent = css;
  document.head.appendChild(s);
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Что такое внешняя баллистика?',
    options: [
      'Изучает процессы, происходящие внутри ствола оружия с момента воспламенения заряда до выхода снаряда из дула',
      'Внешняя баллистика — это спорт',
      'Внешняя баллистика занимается изучением поведения снаряда после его выхода из ствола оружия до момента попадания в цель',
      'Когда порох начал гореть',
    ],
    correct: 2,
    explanation: 'Внешняя баллистика изучает движение снаряда (пули) в воздухе после выхода из ствола: траекторию, скорость, действие воздушного сопротивления.',
  },
  {
    id: 2,
    text: 'Что изучает внутренняя баллистика?',
    options: [
      'Поведение снаряда в полёте и траекторию',
      'Процессы, происходящие в канале ствола при выстреле — воспламенение, давление газов, разгон пули',
      'Устройство прицельных приспособлений',
      'Вопросы хранения боеприпасов',
    ],
    correct: 1,
    explanation: 'Внутренняя баллистика — наука о явлениях, происходящих при выстреле внутри канала ствола: горение пороха, давление газов, движение пули по стволу.',
  },
  {
    id: 3,
    text: 'Что такое начальная скорость пули?',
    options: [
      'Скорость пули в момент максимального подъёма траектории',
      'Средняя скорость пули на всём пути полёта',
      'Скорость пули у дульного среза ствола',
      'Скорость пули при ударе о цель',
    ],
    correct: 2,
    explanation: 'Начальная скорость — это скорость пули у дульного среза. Для АК-74 она составляет ≈ 900 м/с. Именно от неё зависят дальность и настильность стрельбы.',
  },
  {
    id: 4,
    text: 'Что такое деривация при стрельбе из нарезного оружия?',
    options: [
      'Снижение скорости пули под действием силы тяжести',
      'Отклонение пули от плоскости стрельбы в сторону вращения из-за гироскопического эффекта',
      'Увеличение дальности полёта за счёт ветра',
      'Рикошет пули от поверхности',
    ],
    correct: 1,
    explanation: 'Деривация — отклонение вращающейся пули в сторону её вращения (у правонарезного оружия — вправо). Обязательно учитывается при снайперской стрельбе на дальние дистанции.',
  },
  {
    id: 5,
    text: 'При стрельбе под каким углом возвышения дальность полёта пули максимальна в вакууме?',
    options: [
      '30°',
      '60°',
      '45°',
      '90°',
    ],
    correct: 2,
    explanation: 'В вакууме максимальная дальность достигается при угле 45°. В реальных условиях (с воздушным сопротивлением) оптимальный угол несколько меньше.',
  },
  {
    id: 6,
    text: 'Что такое баллистический коэффициент пули (BC)?',
    options: [
      'Масса порохового заряда в граммах',
      'Длина ствола в калибрах',
      'Показатель способности пули преодолевать сопротивление воздуха — чем выше, тем лучше',
      'Угол нарезки ствола',
    ],
    correct: 2,
    explanation: 'Баллистический коэффициент (BC) определяет, насколько эффективно пуля сохраняет скорость в полёте. Высокий BC у длинных, тяжёлых пуль с острым носом.',
  },
  {
    id: 7,
    text: 'Сила Кориолиса существенно влияет на стрельбу при:',
    options: [
      'Стрельбе на дистанции до 100 м',
      'Стрельбе на дистанции до 300 м',
      'Прицельной снайперской стрельбе на дистанции свыше 800–1000 м',
      'Стрельбе очередями',
    ],
    correct: 2,
    explanation: 'Сила Кориолиса заметна только на очень дальних дистанциях (800 м и более). На коротких дистанциях её влиянием пренебрегают.',
  },
  {
    id: 8,
    text: 'При стрельбе под углом вниз по крутому склону прицел необходимо:',
    options: [
      'Увеличить — пуля летит дальше при стрельбе вниз',
      'Уменьшить — фактическая горизонтальная дальность меньше наклонной',
      'Не изменять — угол не влияет',
      'Уменьшить вдвое независимо от дистанции',
    ],
    correct: 1,
    explanation: 'При стрельбе под уклон или на подъём поправку вносят по горизонтальной составляющей дистанции. Она всегда меньше наклонной, поэтому прицел уменьшают.',
  },
  {
    id: 9,
    text: 'Что такое гироскопическая стабилизация пули?',
    options: [
      'Стабилизация пули хвостовым оперением, как у стрелы',
      'Поддержание устойчивого положения пули в полёте за счёт быстрого вращения, придаваемого нарезами ствола',
      'Автоматическое выравнивание прицела',
      'Стабилизация оружия при стрельбе',
    ],
    correct: 1,
    explanation: 'Нарезы ствола придают пуле вращение (тысячи об/мин). Вращающееся тело (гироскоп) сохраняет ориентацию оси в пространстве — пуля летит носом вперёд.',
  },
  {
    id: 10,
    text: 'Что называется «мёртвым пространством» при стрельбе?',
    options: [
      'Зона за спиной стрелка',
      'Пространство перед целью, которое не поражается огнём из-за рельефа или укрытия',
      'Расстояние, на котором пуля теряет убойную силу',
      'Зона между стрелками в цепи',
    ],
    correct: 1,
    explanation: 'Мёртвое (непростреливаемое) пространство — участок, скрытый от огня рельефом местности или укрытиями. Командир должен учитывать его при организации системы огня.',
  },
];

type Phase = 'test' | 'review' | 'result';

export function TestPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [phase, setPhase] = useState<Phase>('test');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewStep, setReviewStep] = useState(0);
  const [reviewAns, setReviewAns] = useState<string>('Усвоил');
  const [reviewComment, setReviewComment] = useState('');
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => { injectCss(CSS, 'tp-css'); }, []);

  const q = QUESTIONS[current];
  const answered = answers.filter(a => a !== null).length;
  const correctCount = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
  const pct = Math.round((correctCount / QUESTIONS.length) * 100);

  function selectOpt(idx: number) {
    if (phase !== 'test') return;
    setSelected(idx);
  }

  function goNext() {
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setSelected(null);
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
    } else {
      setPhase('review');
    }
  }

  function goPrev() {
    if (current > 0) { setCurrent(current - 1); setSelected(answers[current - 1]); }
  }

  function skipQuestion() {
    const newAnswers = [...answers];
    newAnswers[current] = -1; // skipped marker
    setAnswers(newAnswers);
    setSelected(null);
    if (current < QUESTIONS.length - 1) setCurrent(current + 1);
  }

  function finishTest() {
    setReviewModal(true);
  }

  function submitReview() {
    if (reviewStep < 3) { setReviewStep(s => s + 1); setReviewComment(''); setReviewAns('Усвоил'); }
    else { setReviewModal(false); setReviewStep(0); setPhase('result'); }
  }

  const REVIEW_QUESTIONS = [
    'Как усвоили материал?',
    'Что было самым сложным в теме?',
    'Какие вопросы остались без ответа?',
    'Хотите дополнительные материалы по теме?',
  ];

  const progressW = `${((current + 1) / QUESTIONS.length) * 100}%`;

  /* ── RESULT SCREEN ── */
  if (phase === 'result') {
    const grade = pct >= 90 ? { label: 'Отлично', color: '#10B981', bg: '#F0FDF4', border: '#BBF7D0' }
      : pct >= 70 ? { label: 'Хорошо', color: '#375DFB', bg: '#EBF1FF', border: '#C7D2FE' }
      : pct >= 50 ? { label: 'Удовлетворительно', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' }
      : { label: 'Неудовлетворительно', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' };
    return (
      <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F4F6FB' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 28px 60px' }}>
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5E7EB', overflow: 'hidden', animation: 'scaleIn .35s ease' }}>
            {/* Result header */}
            <div style={{ background: grade.bg, border: `1px solid ${grade.border}`, padding: '32px 36px', textAlign: 'center', borderRadius: '24px 24px 0 0' }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#fff', border: `3px solid ${grade.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 8px 28px ${grade.color}30` }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: grade.color }}>{pct}%</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111', marginBottom: 8 }}>Тест завершён!</div>
              <div style={{ display: 'inline-block', background: grade.color, color: '#fff', borderRadius: 20, padding: '5px 18px', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{grade.label}</div>
              <p style={{ fontSize: 15, color: '#6B7280', margin: 0 }}>
                Правильных ответов: <strong style={{ color: '#111' }}>{correctCount}</strong> из {QUESTIONS.length}
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#F0F0F0', borderBottom: '1px solid #E5E7EB' }}>
              {[
                { label: 'Верно', val: correctCount, color: '#10B981' },
                { label: 'Неверно', val: answers.filter((a, i) => a !== null && a !== -1 && a !== QUESTIONS[i].correct).length, color: '#EF4444' },
                { label: 'Пропущено', val: answers.filter(a => a === -1 || a === null).length, color: '#9CA3AF' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Questions review */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>Разбор ответов</div>
              {QUESTIONS.map((q, qi) => {
                const userAns = answers[qi];
                const isCorrect = userAns === q.correct;
                const isSkipped = userAns === null || userAns === -1;
                return (
                  <div key={q.id} style={{ marginBottom: 20, padding: '16px 20px', background: isSkipped ? '#F9FAFB' : isCorrect ? '#F0FDF4' : '#FEF2F2', borderRadius: 16, border: `1px solid ${isSkipped ? '#E5E7EB' : isCorrect ? '#BBF7D0' : '#FECACA'}`, animation: `fadeUp .4s ease ${qi * 40}ms both` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: isSkipped ? '#9CA3AF' : isCorrect ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isSkipped
                          ? <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>—</span>
                          : isCorrect
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 8 }}>Вопрос {qi + 1}: {q.text}</div>
                        {!isSkipped && (
                          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                            Ваш ответ: <span style={{ color: isCorrect ? '#10B981' : '#EF4444', fontWeight: 600 }}>{q.options[userAns as number]}</span>
                          </div>
                        )}
                        {!isCorrect && (
                          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                            Верный ответ: <span style={{ color: '#10B981', fontWeight: 600 }}>{q.options[q.correct]}</span>
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: '#6B7280', background: 'rgba(0,0,0,.04)', borderRadius: 8, padding: '8px 12px', lineHeight: 1.5 }}>
                          <strong>Пояснение:</strong> {q.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, padding: '0 28px 28px' }}>
              <button className="tp-btn-prim" onClick={() => { setAnswers(Array(QUESTIONS.length).fill(null)); setCurrent(0); setSelected(null); setPhase('test'); }}
                style={{ flex: 1, padding: '13px 0', background: '#375DFB', border: 'none', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(55,93,251,.28)' }}>
                Пройти ещё раз
              </button>
              <button className="tp-btn-sec" onClick={() => navigate(-1)}
                style={{ flex: 1, padding: '13px 0', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, color: '#374151', fontSize: 14, cursor: 'pointer' }}>
                К занятию
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── REVIEW SCREEN ── */
  if (phase === 'review') {
    return (
      <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F4F6FB' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 28px 60px' }}>
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5E7EB', padding: '36px', animation: 'scaleIn .3s ease', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 8 }}>Все вопросы пройдены!</div>
            <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 28 }}>Проверьте ответы или завершите тест и оставьте отзыв об уроке.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="tp-btn-prim" onClick={finishTest}
                style={{ padding: '13px 32px', background: '#375DFB', border: 'none', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(55,93,251,.28)' }}>
                Сохранить и завершить
              </button>
              <button className="tp-btn-sec" onClick={() => { setCurrent(0); setPhase('test'); }}
                style={{ padding: '13px 24px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, color: '#374151', fontSize: 14, cursor: 'pointer' }}>
                Просмотреть ответы
              </button>
            </div>
          </div>
        </div>
        {reviewModal && <ReviewModal step={reviewStep} question={REVIEW_QUESTIONS[reviewStep]} answer={reviewAns} comment={reviewComment} setAnswer={setReviewAns} setComment={setReviewComment} onNext={submitReview} onClose={() => { setReviewModal(false); setPhase('result'); }} />}
      </div>
    );
  }

  /* ── TEST SCREEN ── */
  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F4F6FB' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '28px 28px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
          {/* MAIN */}
          <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #E5E7EB', overflow: 'hidden', animation: 'fadeIn .3s ease' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EBF1FF', border: '1.5px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#375DFB' }}>{current + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>Внутренняя и внешняя баллистика</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Для закрепления информации, необходимо пройти тест из {QUESTIONS.length} вопросов.</div>
              </div>
              <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                Завершить
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Progress */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>Вопрос {current + 1} / {QUESTIONS.length}</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{Math.round(((current + 1) / QUESTIONS.length) * 100)}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 6, background: '#E5E7EB', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: progressW, background: 'linear-gradient(90deg, #375DFB, #7B9FFF)', borderRadius: 6, transition: 'width .4s ease' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6B7280', flexShrink: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Займёт ≈ {Math.ceil((QUESTIONS.length - current) * 2)} мин
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Попытка 1 / 3
                </span>
              </div>
            </div>

            {/* Question */}
            <div style={{ padding: '28px 24px', animation: `fadeUp .3s ease` }} key={current}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F4F6FA', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#111', lineHeight: 1.5 }}>{q.text}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options.map((opt, oi) => (
                  <div key={oi} className={`tp-opt${selected === oi ? ' selected' : ''}`}
                    onClick={() => selectOpt(oi)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, border: `2px solid ${selected === oi ? '#375DFB' : '#E5E7EB'}`, background: selected === oi ? '#EBF1FF' : '#FAFAFA', userSelect: 'none' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${selected === oi ? '#375DFB' : '#D1D5DB'}`, background: selected === oi ? '#375DFB' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .18s' }}>
                      {selected === oi && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom nav */}
            <div style={{ padding: '16px 24px 24px', borderTop: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button className="tp-btn-sec" onClick={goPrev} disabled={current === 0}
                style={{ padding: '10px 20px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, color: '#374151', cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? .4 : 1 }}>
                Назад
              </button>
              <button onClick={skipQuestion} style={{ background: 'none', border: 'none', fontSize: 13, color: '#9CA3AF', cursor: 'pointer', padding: '8px 12px' }}>
                Ответить позже
              </button>
              <button className="tp-btn-prim" onClick={goNext} disabled={selected === null}
                style={{ padding: '10px 28px', background: '#375DFB', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#fff', cursor: selected === null ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(55,93,251,.28)' }}>
                {current < QUESTIONS.length - 1 ? 'Далее' : 'Завершить'}
              </button>
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 16 }}>
            {/* Instructor */}
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                  {!imgErr
                    ? <img src="/teacher2-main.jpg" alt="Бек" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErr(true)} />
                    : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Бек</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>Главный инструктор</div>
                </div>
              </div>
              <button onClick={() => navigate('/messages?chat=2')}
                style={{ width: '100%', padding: '10px 0', background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#375DFB', cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#D6E4FF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#EBF1FF'; }}>
                Задать вопрос
              </button>
            </div>

            {/* Questions map */}
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E5E7EB', padding: '16px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Прогресс</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {QUESTIONS.map((_, qi) => {
                  const ans = answers[qi];
                  const isCurrent = qi === current;
                  const color = isCurrent ? '#375DFB' : ans === null ? '#E5E7EB' : ans === -1 ? '#9CA3AF' : '#10B981';
                  return (
                    <div key={qi} onClick={() => { setCurrent(qi); setSelected(answers[qi]); }}
                      style={{ width: '100%', aspectRatio: '1', borderRadius: 8, background: isCurrent ? '#EBF1FF' : ans !== null ? color + '22' : '#F4F6FA', border: `1.5px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: isCurrent ? '#375DFB' : '#374151', cursor: 'pointer', transition: 'all .15s' }}>
                      {qi + 1}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14, fontSize: 11 }}>
                {[['#10B981', 'Отвечено'], ['#E5E7EB', 'Не отвечено'], ['#375DFB', 'Текущий']].map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {reviewModal && <ReviewModal step={reviewStep} question={REVIEW_QUESTIONS[reviewStep]} answer={reviewAns} comment={reviewComment} setAnswer={setReviewAns} setComment={setReviewComment} onNext={submitReview} onClose={() => { setReviewModal(false); setPhase('result'); }} />}
    </div>
  );
}

/* ── REVIEW MODAL ── */
function ReviewModal({ step, question, answer, comment, setAnswer, setComment, onNext, onClose }: {
  step: number; question: string; answer: string; comment: string;
  setAnswer: (v: string) => void; setComment: (v: string) => void;
  onNext: () => void; onClose: () => void;
}) {
  const REVIEW_QUESTIONS = ['Как усвоили материал?', 'Что было самым сложным?', 'Какие вопросы остались?', 'Нужны доп. материалы?'];
  const OPTS = ['Усвоил', 'Есть вопрос', 'Не усвоил', 'Другое'];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20, backdropFilter: 'blur(6px)', animation: 'fadeIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 460, width: '100%', background: '#fff', borderRadius: 22, boxShadow: '0 28px 70px rgba(0,0,0,.22)', animation: 'scaleIn .22s cubic-bezier(.4,0,.2,1)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EBF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Отзыв об уроке</span>
          </div>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>Вопросы {step + 1} / {REVIEW_QUESTIONS.length}</span>
        </div>
        <div style={{ padding: '28px 24px', animation: `fadeUp .25s ease` }} key={step}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EBF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 18, fontWeight: 800, color: '#375DFB' }}>
            {String(step + 1).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#111', textAlign: 'center', marginBottom: 6 }}>{question}</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 24 }}>Выберите вариант ответа ниже</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {OPTS.map(opt => (
              <button key={opt} onClick={() => setAnswer(opt)}
                style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${answer === opt ? '#375DFB' : '#E5E7EB'}`, background: answer === opt ? '#EBF1FF' : '#fff', color: answer === opt ? '#375DFB' : '#374151', fontSize: 13, fontWeight: answer === opt ? 600 : 400, cursor: 'pointer', transition: 'all .15s' }}>
                {opt}
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Напишите комментарий..."
            style={{ width: '100%', minHeight: 80, border: '1px solid #E5E7EB', borderRadius: 14, padding: '12px 14px', fontSize: 13, color: '#374151', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>
        <div style={{ padding: '0 24px 24px' }}>
          <button onClick={onNext}
            style={{ width: '100%', padding: '13px 0', background: '#375DFB', border: 'none', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(55,93,251,.28)' }}>
            {step < REVIEW_QUESTIONS.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
          </button>
        </div>
      </div>
    </div>
  );
}
