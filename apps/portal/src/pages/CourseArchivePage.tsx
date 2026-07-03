import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseArchiveStore, type ArchivedCourse } from '../store/useCourseArchiveStore';

if (typeof document !== 'undefined' && !document.getElementById('archive-page-css')) {
  const s = document.createElement('style');
  s.id = 'archive-page-css';
  s.textContent = `
    @keyframes archPageIn  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes archCardIn  { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
    @keyframes archRestore { from{opacity:1;transform:translateX(0) scale(1)} to{opacity:0;transform:translateX(-60px) scale(.92)} }
    .arch-card { transition:box-shadow .22s ease, border-color .22s ease, transform .22s ease; }
    .arch-card:hover { box-shadow:0 8px 28px rgba(17,24,39,.1) !important; border-color:#C7D2FE !important; transform:translateY(-2px); }
    .arch-thumb img { transition:transform .5s cubic-bezier(.4,0,.2,1); }
    .arch-card:hover .arch-thumb img { transform:scale(1.06); }
    .arch-toggle { transition:background .18s, border-color .18s; }
    .arch-restore-btn { transition:background .15s, border-color .15s, color .15s, transform .15s; }
    .arch-restore-btn:hover { background:#EBF1FF !important; border-color:#C7D2FE !important; color:#375DFB !important; transform:translateY(-1px); }
    .arch-hide-btn { transition:background .15s, border-color .15s, color .15s; }
    .arch-hide-btn:hover { background:#FFF0F0 !important; border-color:#FECACA !important; color:#EF4444 !important; }
    .arch-show-hidden-btn { transition:all .18s; }
    .arch-show-hidden-btn:hover { background:#F3F4F6 !important; }
    .arch-back-btn { transition:color .15s, background .15s; }
    .arch-back-btn:hover { color:#375DFB !important; }
  `;
  document.head.appendChild(s);
}

function ArchiveCard({ course, idx, onRestore, onToggleHidden }: {
  course: ArchivedCourse; idx: number;
  onRestore: (id: number) => void;
  onToggleHidden: (id: number) => void;
}) {
  const [restoring, setRestoring] = useState(false);
  const handleRestore = () => { setRestoring(true); setTimeout(() => onRestore(course.id), 380); };

  return (
    <div
      className="arch-card"
      style={{
        display: 'flex', alignItems: 'center', gap: 18,
        padding: '16px 20px', background: '#fff',
        border: '1px solid #E5E7EB', borderRadius: 14,
        animation: restoring ? 'archRestore .38s ease forwards' : `archCardIn .36s ease ${idx * 55}ms both`,
        overflow: 'hidden', position: 'relative',
      }}
    >
      <div className="arch-thumb" style={{ width: 120, height: 84, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
        <img src={course.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {course.title}
          </div>
          {course.passed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#ECFDF5"/><polyline points="7 13 10 16 17 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>Пройден</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#F3F4F6"/><circle cx="12" cy="12" r="3" fill="#D1D5DB"/></svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>Не завершён</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>
          {course.start && course.end ? `${course.start} — ${course.end}  ·  ` : ''}Добавлен {course.archivedAt}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {[['Курс', course.courseProgress, '#C2D6FF'], ['ДЗ', course.hwProgress, '#38C793']].map(([l, pct, color]) => (
            <div key={String(l)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 72, height: 5, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: String(color), borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 11, color: '#6B7280', minWidth: 44 }}>{l} {pct}%</span>
            </div>
          ))}
          {course.passed && course.rating != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#F59E0B' }}>{course.rating}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', userSelect: 'none' as const }}>
          <div
            className="arch-toggle"
            onClick={() => onToggleHidden(course.id)}
            style={{
              width: 34, height: 19, borderRadius: 10,
              background: !course.hiddenInProfile ? '#375DFB' : '#E5E7EB',
              border: `1.5px solid ${!course.hiddenInProfile ? '#375DFB' : '#D1D5DB'}`,
              position: 'relative', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <div style={{
              width: 13, height: 13, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 1,
              left: !course.hiddenInProfile ? 16 : 2,
              transition: 'left .2s cubic-bezier(.4,0,.2,1)',
              boxShadow: '0 1px 3px rgba(0,0,0,.18)',
            }} />
          </div>
          <span style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' as const }}>
            {!course.hiddenInProfile ? 'Видно в профиле' : 'Скрыто'}
          </span>
        </label>
        <button
          className="arch-restore-btn"
          onClick={handleRestore}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          Восстановить
        </button>
      </div>
    </div>
  );
}

export function CourseArchivePage() {
  const navigate = useNavigate();
  const { archived, removeFromArchive, toggleHidden } = useCourseArchiveStore();
  const [showHidden, setShowHidden] = useState(false);

  const visible = archived.filter(c => !c.hiddenInProfile);
  const hidden  = archived.filter(c => c.hiddenInProfile);

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F7F8FA' }}>

      {/* Sticky toolbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 60, zIndex: 40, flexWrap: 'wrap' as const, gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round">
            <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Архив курсов</h1>
          {archived.length > 0 && (
            <span style={{
              background: '#375DFB', color: '#fff',
              fontSize: 12, fontWeight: 700,
              borderRadius: 12, padding: '2px 9px',
              minWidth: 24, textAlign: 'center' as const,
              boxShadow: '0 2px 8px rgba(55,93,251,.4)',
              lineHeight: 1.6,
            }}>
              {archived.length}
            </span>
          )}
        </div>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <button
            className="arch-back-btn"
            onClick={() => navigate('/my-courses')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#375DFB', fontWeight: 500, padding: 0, fontSize: 13 }}
          >
            Мои курсы
          </button>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: '#374151', fontWeight: 500 }}>Архив курсов</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 28px 48px' }}>

        {archived.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '64px 24px', textAlign: 'center', animation: 'archPageIn .4s ease' }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1" style={{ marginBottom: 16 }}>
              <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Архив пуст</div>
            <div style={{ fontSize: 14, color: '#9CA3AF', maxWidth: 340, margin: '0 auto 24px' }}>
              Добавьте пройденные или неактивные курсы в архив через страницу «Мои курсы»
            </div>
            <button
              onClick={() => navigate('/my-courses')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#375DFB', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
            >
              Перейти к моим курсам
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        ) : (
          <div style={{ animation: 'archPageIn .4s ease' }}>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const }}>
              {[
                { label: 'Всего в архиве', value: archived.length, dot: '#375DFB' },
                { label: 'Видно в профиле', value: visible.length, dot: '#10B981' },
                { label: 'Скрыто', value: hidden.length, dot: '#9CA3AF' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 160 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#111', lineHeight: 1.1 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visible courses */}
            {visible.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Отображаются в профиле</span>
                  <span style={{ fontSize: 12, color: '#10B981', background: '#ECFDF5', borderRadius: 20, padding: '2px 9px', fontWeight: 600 }}>{visible.length}</span>
                </div>
                <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {visible.map((c, i) => (
                    <ArchiveCard key={c.id} course={c} idx={i} onRestore={removeFromArchive} onToggleHidden={toggleHidden} />
                  ))}
                </div>
              </div>
            )}

            {/* Hidden courses */}
            {hidden.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <button
                  className="arch-show-hidden-btn"
                  onClick={() => setShowHidden(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', border: 'none', background: 'none', cursor: 'pointer', width: '100%', borderBottom: showHidden ? '1px solid #F0F0F0' : 'none' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Скрытые курсы</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF', background: '#F3F4F6', borderRadius: 20, padding: '2px 9px' }}>{hidden.length}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ marginLeft: 'auto', transform: showHidden ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {showHidden && (
                  <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    {hidden.map((c, i) => (
                      <ArchiveCard key={c.id} course={c} idx={i} onRestore={removeFromArchive} onToggleHidden={toggleHidden} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
