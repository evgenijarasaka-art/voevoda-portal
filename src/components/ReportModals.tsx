import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/*
 * Общие модалки рапортов: форма «Подать рапорт» и статус-модалка
 * (успех / ошибка). Используются на странице ОШС и на странице «Командиры».
 * Полностью самодостаточны — свой CSS (префикс rpt-), без внешних зависимостей.
 */

const CSS = `
.rpt-overlay { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; padding:24px; background:rgba(10,16,32,.6); backdrop-filter:blur(6px); animation:rptBg .2s ease both; }
@keyframes rptBg { from{opacity:0} to{opacity:1} }
@keyframes rptPop { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.rpt-modal { width:min(980px,100%); max-height:92vh; overflow-y:auto; background:#fff; border-radius:22px; box-shadow:0 36px 90px rgba(0,0,0,.4); animation:rptPop .3s cubic-bezier(.2,.8,.2,1) both; }
.rpt-head { display:flex; align-items:center; justify-content:space-between; padding:20px 28px; }
.rpt-title { display:flex; align-items:center; gap:12px; font-size:22px; font-weight:800; color:#111; }
.rpt-close { width:40px; height:40px; border:1px solid #E5E7EB; border-radius:12px; background:#F7F8FB; color:#6B7280; font-size:22px; cursor:pointer; display:grid; place-items:center; transition:all .18s; }
.rpt-close:hover { background:#FEF2F2; border-color:#FECACA; color:#EF4444; transform:rotate(90deg); }
.rpt-cols { display:flex; gap:24px; padding:8px 28px 18px; flex-wrap:wrap; }
.rpt-col { flex:1; min-width:280px; display:flex; flex-direction:column; gap:18px; }
.rpt-field { display:flex; flex-direction:column; }
.rpt-label { font-size:15px; font-weight:700; color:#111; margin-bottom:8px; }
.rpt-input { height:52px; padding:0 16px; border:1px solid #E5E7EB; border-radius:12px; background:#fff; font:15px inherit; color:#111; outline:none; box-sizing:border-box; transition:border-color .2s ease,box-shadow .2s ease; }
.rpt-input::placeholder { color:#9CA3AF; }
.rpt-input:focus { border-color:#375DFB; box-shadow:0 0 0 3px rgba(55,93,251,.12); }
.rpt-textarea { flex:1; min-height:172px; padding:14px 16px; border:1px solid #E5E7EB; border-radius:12px; background:#fff; font:15px inherit; color:#111; outline:none; resize:vertical; box-sizing:border-box; font-family:inherit; transition:border-color .2s ease,box-shadow .2s ease; }
.rpt-textarea::placeholder { color:#9CA3AF; }
.rpt-textarea:focus { border-color:#375DFB; box-shadow:0 0 0 3px rgba(55,93,251,.12); }
.rpt-date { position:relative; }
.rpt-date svg { position:absolute; right:14px; top:50%; transform:translateY(-50%); pointer-events:none; color:#9CA3AF; }
.rpt-2col { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.rpt-uploads { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; padding:6px 28px 18px; }
@media(max-width:760px){ .rpt-cols { flex-direction:column; } .rpt-uploads { grid-template-columns:1fr; } }
.rpt-drop { border:1.5px dashed #D9DEE8; border-radius:16px; padding:22px 18px; text-align:center; transition:border-color .2s ease,background .2s ease; }
.rpt-drop:hover { border-color:#C7D2FE; background:#FAFBFF; }
.rpt-drop-title { font-size:16px; font-weight:700; color:#111; margin-bottom:6px; }
.rpt-drop-sub { font-size:12px; color:#9CA3AF; line-height:1.5; margin-bottom:14px; }
.rpt-drop-btn { height:40px; padding:0 18px; border:1px solid #E5E7EB; border-radius:10px; background:#fff; color:#374151; font:600 13px inherit; cursor:pointer; transition:all .2s ease; }
.rpt-drop-btn:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.16); }
.rpt-picked { margin-top:10px; font-size:12px; color:#375DFB; font-weight:600; word-break:break-all; }
.rpt-or { font-size:12px; color:#9CA3AF; margin:10px 0; }
.rpt-foot { display:flex; align-items:center; gap:12px; padding:18px 28px 24px; border-top:1px solid #F0F1F3; flex-wrap:wrap; }
.rpt-foot .grow { margin-left:auto; }
.rpt-btn { height:52px; padding:0 26px; border-radius:12px; border:1px solid #E5E7EB; background:#fff; color:#374151; font:700 15px inherit; cursor:pointer; transition:all .2s ease; white-space:nowrap; }
.rpt-btn:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.14); }
.rpt-btn.primary { border-color:#375DFB; background:#375DFB; color:#fff; box-shadow:0 8px 20px rgba(55,93,251,.3); }
.rpt-btn.primary:hover { background:#2D4FE0; color:#fff; box-shadow:0 12px 26px rgba(55,93,251,.42); }
.rpt-btn:disabled { opacity:.45; cursor:not-allowed; transform:none!important; box-shadow:none!important; }
.rpt-error { margin:0 28px 14px; padding:10px 13px; border:1px solid #FECACA; border-radius:10px; background:#FEF2F2; color:#B91C1C; font-size:13px; font-weight:600; }

.rpt-sm-card { width:min(380px,100%); background:#fff; border-radius:20px; padding:30px 28px 26px; text-align:center; box-shadow:0 30px 80px rgba(0,0,0,.34); animation:rptPop .28s cubic-bezier(.2,.8,.2,1) both; }
.rpt-sm-icon { width:56px; height:56px; border-radius:16px; margin:0 auto 16px; display:grid; place-items:center; }
.rpt-sm-icon.ok { background:#E7F8EF; }
.rpt-sm-icon.err { background:#EF4444; }
.rpt-sm-title { font-size:20px; font-weight:800; color:#111; margin:0 0 8px; }
.rpt-sm-text { font-size:14px; color:#6B7280; line-height:1.55; margin:0 0 22px; }
.rpt-sm-btn { height:46px; padding:0 34px; border:none; border-radius:12px; background:#375DFB; color:#fff; font:700 15px inherit; cursor:pointer; transition:all .2s ease; box-shadow:0 8px 20px rgba(55,93,251,.3); }
.rpt-sm-btn:hover { background:#2D4FE0; transform:translateY(-2px); box-shadow:0 12px 26px rgba(55,93,251,.42); }
`;

function injectCss() {
  if (typeof document === 'undefined' || document.getElementById('rpt-css')) return;
  const s = document.createElement('style'); s.id = 'rpt-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export type ReportStatus = { kind: 'success' | 'error'; title: string; text: string };

export const STATUS_REQUESTED: ReportStatus = { kind: 'success', title: 'Рапорт запрошен!', text: 'Запрошенные рапорта отображаются в личном деле' };
export const STATUS_SUBMITTED: ReportStatus = { kind: 'success', title: 'Рапорт составлен!', text: 'Статус по рапортам можно отследить в личном деле.' };
export const STATUS_ERROR: ReportStatus = { kind: 'error', title: 'Ошибка!', text: 'Проверьте подключение к интернету или попробуйте снова' };

export interface ReportDraft {
  topic: string;
  description: string;
  position: string;
  rank: string;
  deadline: string;
  executionTime: string;
  attachments: { photo?: string; doc?: string; video?: string; videoLink?: string };
  contextTitle?: string;
  savedAt: string;
}

export function ReportFormModal({
  onClose,
  onSubmit,
  onSaveDraft,
  contextTitle,
}: {
  onClose: () => void;
  onSubmit: (draft: ReportDraft) => void;
  onSaveDraft?: (draft: ReportDraft) => void;
  contextTitle?: string;
}) {
  injectCss();
  const storageKey = `voevoda_report_draft_${contextTitle || 'general'}`;
  let initialDraft: ReportDraft | null = null;
  try {
    initialDraft = JSON.parse(localStorage.getItem(storageKey) || 'null') as ReportDraft | null;
  } catch { /* ignore unavailable or malformed storage */ }
  const [topic, setTopic] = useState(() => initialDraft?.topic ?? (contextTitle ? `Рапорт: ${contextTitle}` : ''));
  const [desc, setDesc] = useState(() => initialDraft?.description ?? '');
  const [position, setPosition] = useState(() => initialDraft?.position ?? 'Зам. командира взвода');
  const [rank, setRank] = useState(() => initialDraft?.rank ?? 'Капитан');
  const [deadline, setDeadline] = useState(() => {
    if (initialDraft?.deadline) return initialDraft.deadline;
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 10);
  });
  const [executionTime, setExecutionTime] = useState(() => initialDraft?.executionTime ?? '12 часов');
  const [picked, setPicked] = useState<{ photo?: string; doc?: string; video?: string }>(() => ({
    photo: initialDraft?.attachments.photo,
    doc: initialDraft?.attachments.doc,
    video: initialDraft?.attachments.video,
  }));
  const [videoLink, setVideoLink] = useState(() => initialDraft?.attachments.videoLink ?? '');
  const [error, setError] = useState('');
  const photoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  const buildDraft = (): ReportDraft => ({
    topic: topic.trim(),
    description: desc.trim(),
    position: position.trim(),
    rank: rank.trim(),
    deadline,
    executionTime: executionTime.trim(),
    attachments: { ...picked, videoLink: videoLink.trim() || undefined },
    contextTitle,
    savedAt: new Date().toISOString(),
  });
  const reset = () => {
    setTopic(contextTitle ? `Рапорт: ${contextTitle}` : '');
    setDesc('');
    setPosition('Зам. командира взвода');
    setRank('Капитан');
    setPicked({});
    setVideoLink('');
    setError('');
    localStorage.removeItem(storageKey);
  };
  const saveDraft = () => {
    const draft = buildDraft();
    localStorage.setItem(storageKey, JSON.stringify(draft));
    onSaveDraft?.(draft);
    onClose();
  };
  const submit = () => {
    if (!topic.trim() || !desc.trim()) {
      setError('Заполните тему и описание рапорта.');
      return;
    }
    const draft = buildDraft();
    localStorage.removeItem(storageKey);
    onSubmit(draft);
  };
  const pickDropped = (kind: 'photo' | 'doc' | 'video', files: FileList | null) => {
    const file = files?.[0];
    if (file) setPicked(current => ({ ...current, [kind]: file.name }));
  };
  return createPortal(
    <div className="rpt-overlay" onClick={onClose}>
      <div className="rpt-modal" onClick={e => e.stopPropagation()}>
        <div className="rpt-head">
          <div className="rpt-title">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h6M7 13h10M7 17h8" /></svg>
            Подать рапорт
          </div>
          <button className="rpt-close" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="rpt-cols">
          <div className="rpt-col">
            <div className="rpt-field">
              <label className="rpt-label">Тема рапорта</label>
              <input className="rpt-input" placeholder="Укажите тему" value={topic} onChange={e => setTopic(e.target.value)} />
            </div>
            <div className="rpt-field" style={{ flex: 1 }}>
              <label className="rpt-label">Описание</label>
              <textarea className="rpt-textarea" placeholder="Опишите задачу" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
          </div>
          <div className="rpt-col">
            <div className="rpt-field">
              <label className="rpt-label">Должность</label>
              <input className="rpt-input" value={position} onChange={e => setPosition(e.target.value)} />
            </div>
            <div className="rpt-field">
              <label className="rpt-label">Звание</label>
              <input className="rpt-input" value={rank} onChange={e => setRank(e.target.value)} />
            </div>
            <div className="rpt-2col">
              <div className="rpt-field">
                <label className="rpt-label">Срок выполнения</label>
                <div className="rpt-date">
                  <input className="rpt-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
              </div>
              <div className="rpt-field">
                <label className="rpt-label">Время выполнения</label>
                <input className="rpt-input" value={executionTime} onChange={e => setExecutionTime(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="rpt-uploads">
          <div className="rpt-drop" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); pickDropped('photo', e.dataTransfer.files); }}>
            <div className="rpt-drop-title">Фото</div>
            <div className="rpt-drop-sub">Выберите из файлов или перетащите в формате: JPEG, PNG</div>
            <input ref={photoRef} type="file" accept="image/png,image/jpeg" hidden onChange={e => setPicked(s => ({ ...s, photo: e.target.files?.[0]?.name }))} />
            <button className="rpt-drop-btn" onClick={() => photoRef.current?.click()}>Выбрать файл</button>
            {picked.photo && <div className="rpt-picked">{picked.photo}</div>}
          </div>
          <div className="rpt-drop" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); pickDropped('doc', e.dataTransfer.files); }}>
            <div className="rpt-drop-title">Файлы</div>
            <div className="rpt-drop-sub">Выберите из файлов или перетащите в зону в формате: PDF, DOC, XLS</div>
            <input ref={docRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" hidden onChange={e => setPicked(s => ({ ...s, doc: e.target.files?.[0]?.name }))} />
            <button className="rpt-drop-btn" onClick={() => docRef.current?.click()}>Выбрать файл</button>
            {picked.doc && <div className="rpt-picked">{picked.doc}</div>}
          </div>
          <div className="rpt-drop" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); pickDropped('video', e.dataTransfer.files); }}>
            <div className="rpt-drop-title">Видео</div>
            <div className="rpt-drop-sub">Выберите или перетащите: mp4, mov</div>
            <input ref={videoRef} type="file" accept="video/mp4,video/quicktime" hidden onChange={e => setPicked(s => ({ ...s, video: e.target.files?.[0]?.name }))} />
            <button className="rpt-drop-btn" onClick={() => videoRef.current?.click()}>Выбрать файл</button>
            {picked.video && <div className="rpt-picked">{picked.video}</div>}
            <div className="rpt-or">или</div>
            <input className="rpt-input" style={{ height: 40 }} placeholder="Ссылку на видео" value={videoLink} onChange={e => setVideoLink(e.target.value)} />
          </div>
        </div>

        {error && <div className="rpt-error">{error}</div>}
        <div className="rpt-foot">
          <button className="rpt-btn" onClick={reset}>Сбросить</button>
          <button className="rpt-btn grow" onClick={saveDraft}>Сохранить черновик</button>
          <button className="rpt-btn primary" disabled={!topic.trim() || !desc.trim()} onClick={submit}>Отправить рапорт</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function StatusModal({ kind, title, text, onClose }: ReportStatus & { onClose: () => void }) {
  injectCss();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <div className="rpt-overlay" onClick={onClose}>
      <div className="rpt-sm-card" onClick={e => e.stopPropagation()}>
        <div className={`rpt-sm-icon ${kind === 'success' ? 'ok' : 'err'}`}>
          {kind === 'success'
            ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="7" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
        </div>
        <h3 className="rpt-sm-title">{title}</h3>
        <p className="rpt-sm-text">{text}</p>
        <button className="rpt-sm-btn" onClick={onClose}>Хорошо</button>
      </div>
    </div>,
    document.body,
  );
}
