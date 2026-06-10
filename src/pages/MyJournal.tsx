import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.mj-card{animation:fadeUp .35s ease both}
.mj-card:nth-child(2){animation-delay:.06s}
.mj-card:nth-child(3){animation-delay:.12s}
.mj-entry{transition:box-shadow .25s ease,transform .25s ease,border-color .25s}
.mj-entry:hover{box-shadow:0 6px 24px rgba(55,93,251,.12);transform:translateY(-2px);border-color:#C7D2FE!important}
.mj-btn{transition:background .15s,transform .1s}
.mj-btn:hover{transform:translateY(-1px)}
`;

const ENTRIES = [
  { id: 1, date: '8 июня 2026',  title: 'Полевые учения — день 3',  text: 'Сегодня отработали выход на засаду в составе тройки. Командир отметил хорошую координацию. Нужно улучшить скорость перестроения при контакте.', tags: ['Тактика', 'Учения'], mood: 'good' },
  { id: 2, date: '5 июня 2026',  title: 'Зачёт по медподготовке',   text: 'Сдал зачёт по тактической медицине на отлично. Наложение жгута — 14 секунд (норматив 18). Транспортировка раненого — уверенно.', tags: ['Медицина', 'Зачёт'], mood: 'great' },
  { id: 3, date: '2 июня 2026',  title: 'Огневая подготовка',       text: 'Стрельба из АК-74 на 100м — 42 из 50 попаданий. Групповой огонь показал слабые результаты, нужна дополнительная тренировка упреждения.', tags: ['Огневая', 'Стрельба'], mood: 'normal' },
  { id: 4, date: '28 мая 2026',  title: 'Марш-бросок 10 км',        text: 'Прошёл марш-бросок за 58 минут с полной выкладкой. Личный рекорд. Ноги держат хорошо после тренировки по методу Лидьярда.', tags: ['Физо', 'Рекорд'], mood: 'great' },
  { id: 5, date: '25 мая 2026',  title: 'Инженерная подготовка',     text: 'Изучили устройство и обезвреживание МОН-50. Практика на макетах — работал вторым номером сапёрной пары.', tags: ['Инженерия', 'Сапёрное дело'], mood: 'normal' },
];

const MOOD: Record<string, { emoji: string; bg: string; color: string }> = {
  great:  { emoji: '🔥', bg: '#ECFDF5', color: '#10B981' },
  good:   { emoji: '✅', bg: '#EBF1FF', color: '#375DFB' },
  normal: { emoji: '📝', bg: '#F9FAFB', color: '#6B7280' },
};

function injectCss() {
  if (document.getElementById('mj-css')) return;
  const s = document.createElement('style'); s.id = 'mj-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export function MyJournal() {
  const navigate = useNavigate();
  const [showCompose, setShowCompose] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [entries, setEntries] = useState(ENTRIES);
  injectCss();

  const handleSave = () => {
    if (!newTitle.trim() || !newText.trim()) return;
    const entry = { id: Date.now(), date: 'Сегодня', title: newTitle, text: newText, tags: ['Новая запись'], mood: 'normal' };
    setEntries([entry, ...entries]);
    setNewTitle(''); setNewText(''); setShowCompose(false);
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 60px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Назад
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Мой журнал</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Дневник боевой подготовки и личных достижений</p>
        </div>
        <button className="mj-btn" onClick={() => setShowCompose(!showCompose)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#375DFB', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Новая запись
        </button>
      </div>

      {showCompose && (
        <div className="mj-card" style={{ background: '#fff', border: '1.5px solid #C7D2FE', borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Заголовок записи"
            style={{ width: '100%', padding: '10px 0', border: 'none', fontSize: 16, fontWeight: 700, color: '#111827', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
          <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Что произошло сегодня на подготовке..." rows={4}
            style={{ width: '100%', padding: '8px 0', border: 'none', fontSize: 14, color: '#374151', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="mj-btn" onClick={handleSave} style={{ padding: '9px 18px', background: '#375DFB', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Сохранить</button>
            <button className="mj-btn" onClick={() => setShowCompose(false)} style={{ padding: '9px 18px', background: '#F3F4F6', border: 'none', borderRadius: 9, color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {entries.map(e => {
          const m = MOOD[e.mood] || MOOD.normal;
          return (
            <div key={e.id} className="mj-card mj-entry" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{m.emoji}</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{e.date}</span>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {e.tags.map(t => <span key={t} style={{ fontSize: 11, color: '#375DFB', background: '#EBF1FF', padding: '2px 8px', borderRadius: 20 }}>{t}</span>)}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{e.title}</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{e.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
