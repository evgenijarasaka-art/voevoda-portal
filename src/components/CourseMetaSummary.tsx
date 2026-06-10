type CourseMetaItem = {
  label: string;
  value: string;
  detail: string;
  tone: string;
  icon: 'clock' | 'calendar' | 'timer' | 'target' | 'users' | 'bolt' | 'map' | 'book';
};

const ITEMS: CourseMetaItem[] = [
  { icon: 'clock', label: 'Продолжительность', value: '2 месяца', detail: 'интенсив без лишних пауз', tone: '#375DFB' },
  { icon: 'calendar', label: 'Количество', value: '16 занятий', detail: 'по выходным дням', tone: '#2563EB' },
  { icon: 'timer', label: 'В часах', value: '122 часа', detail: 'практика и разборы', tone: '#0F766E' },
  { icon: 'target', label: 'Время проведения', value: 'с 9 до 15', detail: 'понятный режим группы', tone: '#7C3AED' },
  { icon: 'map', label: 'Дни проведения', value: 'СБ и ВС', detail: 'удобно совмещать с работой', tone: '#0EA5E9' },
  { icon: 'users', label: 'Тип занятий', value: 'Аудиторные', detail: 'инструктор ведет группу', tone: '#475569' },
  { icon: 'bolt', label: 'Направления', value: '5', detail: 'единая программа подготовки', tone: '#EA580C' },
  { icon: 'book', label: 'Дисциплины', value: '12', detail: 'теория, практика, зачеты', tone: '#16A34A' },
];

function Icon({ name, color }: { name: CourseMetaItem['icon']; color: string }) {
  const common = { width: 21, height: 21, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'calendar') return <svg {...common}><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>;
  if (name === 'timer') return <svg {...common}><path d="M10 2h4M12 14l3-3" /><circle cx="12" cy="14" r="8" /></svg>;
  if (name === 'target') return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M22 12h-2M4 12H2M12 2v2M12 20v2" /></svg>;
  if (name === 'users') return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  if (name === 'bolt') return <svg {...common}><path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" /></svg>;
  if (name === 'map') return <svg {...common}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15M15 6v15" /></svg>;
  if (name === 'book') return <svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}

export function CourseMetaSummary({ compact = false }: { compact?: boolean }) {
  return (
    <section className="course-meta-summary" style={{ padding: compact ? 14 : 18 }}>
      <style>{`
        .course-meta-summary {
          background: linear-gradient(180deg,#FFFFFF 0%,#F7F9FF 100%);
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          box-shadow: 0 18px 46px rgba(15,23,42,.07);
          overflow: hidden;
        }
        .course-meta-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }
        .course-meta-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .course-meta-item {
          min-height: 112px;
          padding: 15px;
          border-radius: 16px;
          border: 1px solid #E5EAF5;
          background: #fff;
          box-shadow: 0 8px 20px rgba(15,23,42,.035);
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 12px;
          align-items: start;
        }
        @media (max-width: 1180px) {
          .course-meta-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 620px) {
          .course-meta-head { display: grid; }
          .course-meta-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="course-meta-head">
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, color: '#375DFB', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 5 }}>
            Параметры курса
          </div>
          <div style={{ fontSize: compact ? 18 : 24, fontWeight: 950, color: '#0F172A', letterSpacing: 0, lineHeight: 1.15 }}>
            Формат обучения понятен до записи
          </div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 999, background: '#ECFDF5', border: '1px solid #BBF7D0', color: '#15803D', fontSize: 12, fontWeight: 850, whiteSpace: 'nowrap' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          Данные готовы к оплате
        </div>
      </div>

      <div className="course-meta-grid">
        {ITEMS.map((item) => (
          <div key={item.label} className="course-meta-item">
            <div style={{ width: 42, height: 42, borderRadius: 14, background: `${item.tone}12`, border: `1px solid ${item.tone}24`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={item.icon} color={item.tone} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 850, marginBottom: 5, lineHeight: 1.25 }}>{item.label}</div>
              <div style={{ fontSize: compact ? 18 : 22, fontWeight: 950, color: '#0F172A', lineHeight: 1.08, overflowWrap: 'anywhere' }}>{item.value}</div>
              <div style={{ fontSize: 12, color: '#8B95A7', lineHeight: 1.45, marginTop: 7 }}>{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
