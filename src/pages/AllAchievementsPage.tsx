import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useProfileAchievementsStore,
  type ProfileAchievement,
  type AchievementSection,
} from '../store/useProfileAchievementsStore';
import { readAndCompressImage } from '../utils/imageUpload';

const CSS = `
  @keyframes aachIn { from { opacity:0; transform:translateY(14px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  .aach-card { transition: box-shadow .2s ease, border-color .2s ease, transform .2s ease; }
  .aach-card:hover { box-shadow: 0 8px 28px rgba(55,93,251,.15) !important; border-color: #C7D2FE !important; transform: translateY(-2px); }
  .aach-toggle-btn { transition: background .15s, border-color .15s, color .15s, transform .15s; }
  .aach-toggle-btn:hover { transform: translateY(-1px); }
  .aach-add-btn { transition: background .18s, box-shadow .18s, transform .18s; }
  .aach-add-btn:hover { background: #2D4FE0 !important; box-shadow: 0 10px 28px rgba(55,93,251,.4) !important; transform: translateY(-1px); }
`;

function AchievCard({ ach, idx, onToggle, onEdit }: {
  ach: ProfileAchievement;
  idx: number;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const inProfile = ach.showInProfile !== false;
  return (
    <div
      className="aach-card"
      style={{
        borderRadius: 16,
        background: '#fff',
        border: `1.5px solid ${inProfile ? '#C7D2FE' : '#E5E7EB'}`,
        boxShadow: inProfile ? '0 4px 16px rgba(55,93,251,.08)' : '0 2px 8px rgba(0,0,0,.04)',
        animation: `aachIn .36s ease ${idx * 40}ms both`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Image — fixed height, no aspect ratio */}
      <div style={{ height: 200, background: 'linear-gradient(135deg,#EBF1FF,#F3F6FF)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        <img
          src={ach.img}
          alt={ach.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 20, boxSizing: 'border-box' }}
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
        />
        {inProfile && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: '#375DFB', borderRadius: 8, padding: '3px 8px', fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '.04em' }}>
            В профиле
          </div>
        )}
      </div>

      {/* Info — always below image, never overlaps */}
      <div style={{ padding: '14px 14px 14px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 4, lineHeight: 1.35 }}>{ach.name}</div>
        {ach.info && <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5, marginBottom: 12 }}>{ach.info}</div>}
        <div style={{ display: 'flex', gap: 6, marginTop: ach.info ? 0 : 8 }}>
          <button
            type="button"
            className="aach-toggle-btn"
            onClick={onToggle}
            style={{ flex: 1, padding: '7px 0', borderRadius: 9, border: `1.5px solid ${inProfile ? '#FECACA' : '#C7D2FE'}`, background: inProfile ? '#FFF5F5' : '#EBF1FF', color: inProfile ? '#EF4444' : '#375DFB', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          >
            {inProfile ? 'Убрать из профиля' : 'В профиль'}
          </button>
          <button
            type="button"
            className="aach-toggle-btn"
            onClick={onEdit}
            style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditState {
  open: boolean;
  section: AchievementSection;
  id: number | null;
  name: string;
  info: string;
  img: string;
}

export function AllAchievementsPage() {
  const navigate = useNavigate();
  const { achievements, addAchievement, updateAchievement, deleteAchievement, toggleShowInProfile } = useProfileAchievementsStore();

  const [edit, setEdit] = useState<EditState>({ open: false, section: 'sport', id: null, name: '', info: '', img: '' });
  const [filter, setFilter] = useState<'all' | 'sport' | 'other'>('all');
  const [uploading, setUploading] = useState(false);

  const filtered = achievements.filter(a => filter === 'all' || a.section === filter);
  const inProfileCount = achievements.filter(a => a.showInProfile !== false).length;

  const openAdd = (section: AchievementSection = 'sport') =>
    setEdit({ open: true, section, id: null, name: '', info: '', img: '/dost1.png' });
  const openEdit = (a: ProfileAchievement) =>
    setEdit({ open: true, section: a.section, id: a.id, name: a.name, info: a.info, img: a.img });
  const closeEdit = () => setEdit(e => ({ ...e, open: false }));

  const handleSave = () => {
    if (!edit.name.trim()) return;
    if (edit.id) {
      updateAchievement(edit.id, { name: edit.name, info: edit.info, img: edit.img });
    } else {
      addAchievement({ section: edit.section, name: edit.name, info: edit.info, img: edit.img, showInProfile: true });
    }
    closeEdit();
  };

  const handleImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await readAndCompressImage(file);
      setEdit(prev => ({ ...prev, img: url }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: '100vh', background: '#F7F8FA', marginTop: 16, padding: '0 20px 48px' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
            {achievements.length} {achievements.length === 1 ? 'достижение' : achievements.length < 5 ? 'достижения' : 'достижений'} · {inProfileCount} в профиле
          </p>
          <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginLeft: 'auto' }}>
            {(['all', 'sport', 'other'] as const).map((f, i) => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                style={{ padding: '7px 14px', background: filter === f ? '#EBF1FF' : '#fff', border: 'none', borderRight: i < 2 ? '1px solid #E5E7EB' : 'none', color: filter === f ? '#375DFB' : '#6B7280', fontWeight: filter === f ? 700 : 400, fontSize: 12, cursor: 'pointer' }}>
                {f === 'all' ? 'Все' : f === 'sport' ? 'Спортивные' : 'Другие'}
              </button>
            ))}
          </div>
          <button type="button" className="aach-add-btn" onClick={() => openAdd()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#375DFB', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(55,93,251,.3)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Добавить
          </button>
        </div>

        {/* Grid — full width, bigger cards */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: 12, opacity: .35 }}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Нет достижений</div>
            <div style={{ fontSize: 13 }}>Добавьте свои достижения и выберите, что показывать в профиле</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, alignItems: 'start' }}>
            {filtered.map((a, i) => (
              <AchievCard key={a.id} ach={a} idx={i} onToggle={() => toggleShowInProfile(a.id)} onEdit={() => openEdit(a)} />
            ))}
          </div>
        )}
      </div>

      {/* Edit / Add modal */}
      {edit.open && (
        <div onClick={closeEdit}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', padding: 20, background: 'rgba(7,12,24,.65)', backdropFilter: 'blur(8px)', animation: 'aachIn .18s ease' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: 'min(460px, 100%)', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(55,93,251,.2)', border: '1px solid #C7D2FE' }}>
            <div style={{ background: 'linear-gradient(135deg,#0d1b4b,#375DFB)', padding: '18px 22px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{edit.id ? 'Редактировать достижение' : 'Добавить достижение'}</div>
            </div>
            <div style={{ padding: '20px 22px 22px' }}>
              {/* Section */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>Раздел</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['sport', 'other'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setEdit(e => ({ ...e, section: s }))}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: `1.5px solid ${edit.section === s ? '#375DFB' : '#E5E7EB'}`, background: edit.section === s ? '#EBF1FF' : '#fff', color: edit.section === s ? '#375DFB' : '#6B7280', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {s === 'sport' ? 'Спортивное' : 'Другое'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>Название *</label>
                <input value={edit.name} onChange={e => setEdit(p => ({ ...p, name: e.target.value }))}
                  placeholder="напр. КМС по жиму лёжа"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#375DFB')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                />
              </div>

              {/* Info */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>Описание</label>
                <textarea value={edit.info} onChange={e => setEdit(p => ({ ...p, info: e.target.value }))}
                  placeholder="Дата, место, организация..."
                  rows={2}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#375DFB')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                />
              </div>

              {/* Image */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>Фото</label>
                <label htmlFor="aach-photo" style={{ display: 'flex', alignItems: 'center', gap: 12, border: '2px dashed #C7D2FE', borderRadius: 12, padding: 12, cursor: 'pointer', background: '#F8FAFF' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#EBF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {edit.img ? (
                      <img src={edit.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4, boxSizing: 'border-box' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#375DFB', fontWeight: 600 }}>{uploading ? 'Загрузка...' : 'Нажмите для загрузки фото'}</span>
                  <input id="aach-photo" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={handleSave} disabled={!edit.name.trim()}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: edit.name.trim() ? '#375DFB' : '#E5E7EB', color: edit.name.trim() ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 700, cursor: edit.name.trim() ? 'pointer' : 'not-allowed', boxShadow: edit.name.trim() ? '0 6px 18px rgba(55,93,251,.3)' : 'none' }}>
                  {edit.id ? 'Сохранить' : 'Добавить'}
                </button>
                {edit.id && (
                  <button type="button" onClick={() => { deleteAchievement(edit.id!); closeEdit(); }}
                    style={{ padding: '11px 16px', borderRadius: 10, border: '1.5px solid #FECACA', background: '#FFF5F5', color: '#EF4444', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    Удалить
                  </button>
                )}
                <button type="button" onClick={closeEdit}
                  style={{ padding: '11px 16px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
