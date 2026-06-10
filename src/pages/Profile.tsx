import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IVDisplay, ElitaBadge } from '../components/PeopleSection';
import { TrainingPanel, MeasurementsPanel } from '../components/IndexCharts';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useNotifStore } from '../store/useNotifStore';
import { usePurchasedCoursesStore } from '../store/usePurchasedCoursesStore';

const ANIM = `
@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
.vc { animation: fadeUp .3s ease both; }
.vc:nth-child(2){animation-delay:.06s}
.vc:nth-child(3){animation-delay:.12s}
.vc:nth-child(4){animation-delay:.18s}
.vc:nth-child(5){animation-delay:.22s}
.vc:nth-child(6){animation-delay:.26s}
.vc:nth-child(7){animation-delay:.30s}
.vr:hover { background:#F8FAFF !important; }
.vbadge:hover { transform:scale(1.08) rotate(-2deg); }
.vblog-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.09) !important; }
.vblog-img:hover { transform:scale(1.05); }
.vbtn-p:hover { opacity:.85; transform:translateY(-1px); box-shadow:0 4px 12px rgba(55,93,251,.25); }
.vbtn-g:hover { background:#DFE8FF !important; border-color:#A5B4FC !important; }
.vbtn-w:hover { background:#F3F4F6 !important; }
.vdip:hover .vdip-preview { transform:scale(1.03); box-shadow:0 6px 16px rgba(0,0,0,.12); }
.vdip-badge:hover { filter:grayscale(0%) !important; }
.vlike:hover { transform:scale(1.18); }
.vprog { transition: width .6s cubic-bezier(.4,0,.2,1); }
.vcard:hover { box-shadow:0 4px 18px rgba(0,0,0,.06) !important; }
.vdip-card { cursor:pointer; transition: background .15s; }
.vdip-card:hover { background:#F8FAFF !important; }
.vdip-card:hover .vdip-preview { transform:scale(1.03); box-shadow:0 6px 16px rgba(0,0,0,.12); }
.vdip-nav-btn { transition: background .15s, opacity .15s; }
.vdip-nav-btn:hover { background: rgba(255,255,255,.15) !important; }
.vdip-nav-btn:disabled { opacity: .3 !important; cursor: default !important; }
.vach-row:hover .vach-actions { opacity:1 !important; }
.vedit-input:focus { border-color: #375DFB !important; background: #fff !important; }
`;

const PROFILE_INIT = {
  name: 'Торнадо', rank: 'Майор',
  position: 'КР 2-й роты, 77-й учебный батальон',
  index: 2463, rating: 5.0,
  city: 'Санкт-Петербург', birthYear: '5 марта, 1990',
  onPortal: '2 года, 9 месяцев', community: '«Вымпел»',
  courses: 3, awards: 8, followers: 1288,
  photo: '/teacher2-main.jpg', rankImage: '/rank1.png',
  badges: ['/1.png', '/2.png', '/3.png'],
  extraCount: 4,
  coverImage: '/profile.png',
  bio: 'Попал я в ВДВ не просто так. Ещё на гражданке отпрыгал в ДОСААФ три прыжка. Не знаю как сейчас, а тогда это было бесплатно. Зато почти гарантированно должен был попасть в ВДВ. Придя в военкомат, туда и направили – ВДВ. Служивый может носить любые погоны. Но если он от природы мужественен, вынослив и полон сил даже на последнем издыхании.',
};

const profileSchema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  rank: z.string().min(1, 'Обязательное поле'),
  position: z.string().min(1, 'Обязательное поле'),
  city: z.string().min(1, 'Обязательное поле'),
  birthYear: z.string().min(1, 'Обязательное поле'),
  community: z.string().min(1, 'Обязательное поле'),
  bio: z.string(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;
type ProfileData = typeof PROFILE_INIT;

const COURSES_DATA = [
  { id: 1, title: 'Тактическая медицина для бойца', start: '24 апреля', end: '1 мая', progress: 100, hw: 100, rating: 5.0, img: '/kyrs1.png' },
  { id: 2, title: 'Ускоренная военная подготовка', start: '24 апреля', end: '1 мая', progress: 100, hw: 90, rating: 5.0, img: '/kyrs2.png' },
  { id: 3, title: 'Курс Молодого Бойца V5', start: '24 апреля', end: '1 мая', progress: 100, hw: 90, rating: 5.0, img: '/kyrs3.png' },
];

const BLOG_IMGS = ['/blog1.png', '/blog2.png', '/blog3.png', '/blog4.png', '/blog5.png', '/blog6.png'];
const BLOG_TITLES = ['Создание морской пехоты неразрывно связано с именем и великими деяниями...', 'Военнослужащие псковской дивизии ВДВ помогают дезинфекции...', 'Итоги учебного квартала: лучшие результаты подразделений', 'Тактическая медицина в полевых условиях', 'Огневая подготовка: базовые принципы', 'Строевая подготовка современного бойца'];
const BLOG_POSTS = BLOG_IMGS.map((img, i) => ({ id: i + 1, img, title: BLOG_TITLES[i], date: '3 марта, 2024', views: 179, likes: 224, jumbo: 244 }));

const COMMUNITIES_DATA = [
  { id: 1, img: '/soobsh1.png', name: 'Российское Военно-Историческое Общество', date: 'Создано 12 мая, 2022, Москва' },
  { id: 2, img: '/soobsh2.png', name: 'Силы специальных операций', date: 'Создано 12 мая, 2022, Москва' },
  { id: 3, img: '/soobsh3.png', name: 'Боевое братство', date: 'Создано 12 мая, 2022, Москва' },
  { id: 4, img: '/soobsh4.png', name: 'Беркут', date: 'Создано 12 мая, 2022, Москва' },
];

const KAPTORKA_DATA = [
  { id: 1, img: '/kapt1.png', title: 'Кобура ТТ', size: '180', color: 'Коричневый', brand: 'СССР', price: 500 },
  { id: 2, img: '/kapt2.png', title: 'Планшет полевой, офицерский', size: '340x150', color: 'Коричневый', brand: 'СССР', price: 1600 },
];

const DIPLOMAS_DATA = [
  { id: 1, img: '/dip1.png', title: 'Успешное прохождение курса «Разведывательно-штурмовая подготовка»', desc: 'Ведомственный знак отличия Министерства обороны Российской Федерации, учреждённый', date: '16 мая, 2024', badges: ['/teacher1-small1.jpg', '/teacher1-small2.jpg'] },
  { id: 2, img: '/dip2.png', title: 'Успешное прохождение курса «Разведывательно-штурмовая подготовка»', desc: 'Ведомственный знак отличия Министерства обороны Российской Федерации, учреждённый', date: '16 мая, 2024', badges: ['/teacher1-small1.jpg', '/teacher1-small2.jpg'] },
  { id: 3, img: '/dip1.png', title: 'Успешное прохождение курса «КМБ V5»', desc: 'Ведомственный знак отличия Министерства обороны Российской Федерации, учреждённый для поощрения военнослужащих', date: '12 ноября, 2023', badges: ['/teacher1-small1.jpg', '/teacher1-small2.jpg'] },
];

const INIT_SPORT_ACH = [
  { id: 1, name: 'КМС по жиму лёжа', info: '2018 год, Москва, спорт-комплекс Динамо', img: '/dost1.png' },
  { id: 2, name: '2-й юношеский по шахматам', info: '12.05.2024 XXII турнир Чемпионата России по Федерация шахматного спорта РФ', img: '/dost2.png' },
];
const INIT_OTHER_ACH = [
  { id: 1, name: 'КМС по жиму лёжа', info: '2018 год, Москва, спорт-комплекс Динамо', img: '/dost3.png' },
  { id: 2, name: '2-й юношеский по шахматам', info: '12.05.2024 XXII турнир Чемпионата России по Федерация шахматного спорта РФ', img: '/dost4.png' },
];

type Achievement = { id: number; name: string; info: string; img: string };
type Tab = 'Данные' | 'График подготовки' | 'Сводка замеров';
type MeasuresView = 'history' | 'edit' | 'chart';

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="vc vcard" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', marginBottom: 12, transition: 'box-shadow .2s' }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F5F5F7' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon}
        <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{title}</span>
      </div>
      {action}
    </div>
  );
}

function IcHeart({ active }: { active?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? '#EF4444' : '#CDD0D5'} stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IcThumb({ color = '#CDD0D5' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.2875 5.14073L10.0608 6.37034C9.92347 6.50803 9.92303 6.7317 10.0598 6.86993C10.2925 7.10497 10.5166 7.05021 10.654 6.91253C10.5661 7.11692 10.3904 7.6271 10.3904 8.03268C10.3904 8.51692 10.5842 8.9555 10.8981 9.27436C10.3199 9.563 9.92236 10.1628 9.92236 10.8563C9.92236 11.3405 10.1162 11.7791 10.4301 12.0979C9.85188 12.3866 9.45433 12.9864 9.45433 13.6799C9.45433 14.655 10.2404 15.445 11.2094 15.445H13.0462L14.2389 15.6895C14.0446 15.6628 13.8534 15.682 13.6769 15.7391C13.8742 15.679 14.0892 15.6664 14.3057 15.7119L15.9356 16.0551C16.5886 16.1925 17.015 16.823 16.8994 17.4803C16.7812 18.1526 16.1408 18.6022 15.4683 18.485L13.8274 18.1991C13.7873 18.1921 13.7479 18.1833 13.7093 18.1728L10.1762 17.5672C9.98064 17.5307 9.62398 17.4894 9.28237 17.4498C9.0461 17.4225 8.81699 17.3959 8.65324 17.3724C8.2522 17.3147 7.82914 17.2478 7.45795 17.1764C7.07956 17.1037 6.60792 16.9651 6.60792 16.9651C6.60792 16.9651 5.77081 16.7047 5.39742 16.5476C5.14793 16.4392 4.52031 16.168 4.26625 16.0709C4.10537 16.0094 3.88391 15.9174 3.65706 15.8207C3.1816 15.618 2.94387 15.5167 2.8058 15.3077C2.66772 15.0988 2.66772 14.8353 2.66772 14.3083L2.66772 8.84776C2.66772 8.2805 2.66772 7.99687 2.8206 7.78063C2.97347 7.56439 3.23943 7.4703 3.77132 7.28214L3.77133 7.28213C3.95772 7.21619 4.13383 7.15435 4.26754 7.10832C4.77788 6.9326 5.26832 6.68651 5.67162 6.36904L9.68343 3.21107C9.71961 3.17049 9.75882 3.13176 9.80104 3.0952L11.4081 1.70339C11.9124 1.26658 12.6725 1.30921 13.1249 1.79968C13.5873 2.30109 13.5558 3.08241 13.0545 3.54499L11.4921 4.98674C11.428 5.04593 11.3594 5.09724 11.2875 5.14073ZM14.1346 13.6799C14.1346 13.0955 13.6634 12.6213 13.0816 12.6213H11.2094C10.6276 12.6213 10.1564 13.0955 10.1564 13.6799C10.1564 14.2642 10.6276 14.7385 11.2094 14.7385H13.0816C13.6634 14.7385 14.1346 14.2642 14.1346 13.6799ZM10.6244 10.8563C10.6244 11.4406 11.0956 11.9148 11.6774 11.9148H13.5496C14.1315 11.9148 14.6027 11.4405 14.6027 10.8562C14.6027 10.2752 14.1369 9.80312 13.5598 9.79764L11.6775 9.79774C11.0956 9.79768 10.6244 10.2719 10.6244 10.8563ZM12.1455 9.09127C11.5638 9.09114 11.0924 8.61696 11.0924 8.03268C11.0924 7.44832 11.5636 6.97409 12.1455 6.97409L14.017 6.9739C14.5989 6.97392 15.0701 7.44814 15.0701 8.03248C15.0701 8.61664 14.5992 9.09075 14.0176 9.09107L13.5436 9.09112L12.1455 9.09127Z" fill={color} />
    </svg>
  );
}
function IcBookmarkBlog({ active }: { active?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? '#EF4444' : 'none'} stroke={active ? '#EF4444' : '#CDD0D5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IcArrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'left' ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
    </svg>
  );
}

function AchieveModal({
  open, title, initial, onSave, onClose, onDelete,
}: {
  open: boolean; title: string;
  initial: { name: string; info: string } | null;
  onSave: (data: { name: string; info: string }) => void;
  onClose: () => void; onDelete?: () => void;
}) {
  const [name, setName] = useState('');
  const [info, setInfo] = useState('');
  useEffect(() => {
    if (open) { setName(initial?.name ?? ''); setInfo(initial?.info ?? ''); }
  }, [open, initial]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  const isEdit = initial !== null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, animation: 'fadeIn .18s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.35)', animation: 'fadeUp .2s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #F0F0F0' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{isEdit ? 'Редактировать достижение' : 'Добавить достижение'}</span>
          <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')} onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}>×</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Название</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="напр. КМС по жиму лёжа" style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border .15s' }} onFocus={e => (e.target.style.borderColor = '#375DFB')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Описание</label>
            <textarea value={info} onChange={e => setInfo(e.target.value)} rows={3} placeholder="напр. 2018 год, Москва, спорт-комплекс Динамо" style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', transition: 'border .15s' }} onFocus={e => (e.target.style.borderColor = '#375DFB')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
          </div>
          <div style={{ background: '#F9FAFB', border: '1px dashed #E5E7EB', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>Фотография (загрузка доступна в полной версии)</span>
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            {isEdit && onDelete && (
              <button onClick={onDelete} style={{ padding: '10px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 13, color: '#EF4444', cursor: 'pointer', fontWeight: 600, transition: 'background .15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')} onMouseLeave={e => (e.currentTarget.style.background = '#FEF2F2')}>Удалить</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: '#F3F4F6', border: 'none', borderRadius: 6, fontSize: 14, color: '#374151', cursor: 'pointer', transition: 'background .15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')} onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}>Отмена</button>
            <button onClick={() => { if (name.trim()) onSave({ name: name.trim(), info: info.trim() }); }} disabled={!name.trim()} style={{ padding: '10px 24px', background: name.trim() ? '#375DFB' : '#C7D2FE', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, color: '#fff', cursor: name.trim() ? 'pointer' : 'default', transition: 'opacity .15s' }} onMouseEnter={e => { if (name.trim()) e.currentTarget.style.opacity = '.85'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>{isEdit ? 'Сохранить' : 'Добавить'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4, display: 'block' }}>{error}</span>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB',
  borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  transition: 'border .15s', background: '#F9FAFB', fontFamily: 'inherit',
  color: '#111',
};

function ProfileEditModal({
  open, initial, onSave, onClose,
}: {
  open: boolean;
  initial: ProfileFormValues;
  onSave: (data: ProfileFormValues) => void;
  onClose: () => void;
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });
  useEffect(() => {
    if (open) reset(initial);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, padding: 20, animation: 'fadeIn .18s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,.35)', animation: 'fadeUp .2s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Редактировать профиль</span>
          </div>
          <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')} onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}>×</button>
        </div>
        <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#F9FAFB', border: '1px dashed #E5E7EB', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Фото и обложка</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Загрузка доступна в полной версии</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Псевдоним" error={errors.name?.message}>
                <input className="vedit-input" {...register('name')} style={inputStyle} placeholder="напр. Торнадо" onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB'; }} />
              </FormField>
              <FormField label="Звание" error={errors.rank?.message}>
                <input className="vedit-input" {...register('rank')} style={inputStyle} placeholder="напр. Майор" onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB'; }} />
              </FormField>
            </div>
            <FormField label="Должность" error={errors.position?.message}>
              <input className="vedit-input" {...register('position')} style={inputStyle} placeholder="напр. КР 2-й роты, 77-й учебный батальон" onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB'; }} />
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Город" error={errors.city?.message}>
                <input className="vedit-input" {...register('city')} style={inputStyle} placeholder="напр. Санкт-Петербург" onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB'; }} />
              </FormField>
              <FormField label="Дата рождения" error={errors.birthYear?.message}>
                <input className="vedit-input" {...register('birthYear')} style={inputStyle} placeholder="напр. 5 марта, 1990" onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB'; }} />
              </FormField>
            </div>
            <FormField label="Сообщество" error={errors.community?.message}>
              <input className="vedit-input" {...register('community')} style={inputStyle} placeholder="напр. «Вымпел»" onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB'; }} />
            </FormField>
            <FormField label="О себе" error={errors.bio?.message}>
              <textarea className="vedit-input" {...register('bio')} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Расскажите о себе..." onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB'; }} />
            </FormField>
          </div>
          <div style={{ padding: '16px 24px', borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#F3F4F6', border: 'none', borderRadius: 8, fontSize: 14, color: '#374151', cursor: 'pointer', transition: 'background .15s', fontWeight: 500 }} onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')} onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}>Отмена</button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 28px', background: '#375DFB', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', transition: 'opacity .15s', display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.opacity = '.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggle: toggleFav, has: isFav } = useFavoritesStore();
  const addNotif = useNotifStore(s => s.add);
  const { courses: purchasedCourses } = usePurchasedCoursesStore();

  const [profile, setProfile] = useState<ProfileData>(PROFILE_INIT);

  useEffect(() => {
    const state = location.state as { openEdit?: boolean; tab?: Tab } | null;
    if (state?.tab) setActiveTab(state.tab);
    if (state?.openEdit) navigate('/edit-profile');
    if (state?.tab || state?.openEdit) window.history.replaceState({}, '');
  }, []);

  const saveProfile = (data: ProfileFormValues) => {
    setProfile(p => ({ ...p, ...data }));
    addNotif({ kind: 'like', title: 'Профиль обновлён', body: 'Данные личного дела сохранены', link: '/profile' });
  };

  const allCourses = [
    ...COURSES_DATA,
    ...purchasedCourses.map(c => ({
      id: Number(c.id.replace('pc_', '')),
      title: c.title, start: c.start, end: c.end,
      progress: c.progress, hw: c.hw, rating: c.rating, img: c.img,
    })),
  ];

  const [activeTab, setActiveTab] = useState<Tab>('Данные');
  const [measuresView, setMeasuresView] = useState<MeasuresView>('history');
  const [courseSort, setCourseSort] = useState<'date' | 'rating'>('date');
  const [showSortDrop, setShowSortDrop] = useState(false);
  const [blogLikes, setBlogLikes] = useState<Record<number, boolean>>({});
  const [blogComments, setBlogComments] = useState<Record<number, boolean>>({});
  const [dipIndex, setDipIndex] = useState<number | null>(null);
  const [commSort, setCommSort] = useState(false);

  const [sportAch, setSportAch] = useState<Achievement[]>(INIT_SPORT_ACH);
  const [otherAch, setOtherAch] = useState<Achievement[]>(INIT_OTHER_ACH);

  const [achModal, setAchModal] = useState<{ open: boolean; section: 'sport' | 'other'; editId: number | null }>({ open: false, section: 'sport', editId: null });

  const openAddAch = (section: 'sport' | 'other') => setAchModal({ open: true, section, editId: null });
  const openEditAch = (section: 'sport' | 'other', id: number) => setAchModal({ open: true, section, editId: id });
  const closeAchModal = () => setAchModal(p => ({ ...p, open: false }));

  const achInitial = achModal.editId !== null
    ? (achModal.section === 'sport' ? sportAch : otherAch).find(a => a.id === achModal.editId) ?? null
    : null;

  const saveAch = (data: { name: string; info: string }) => {
    const setList = achModal.section === 'sport' ? setSportAch : setOtherAch;
    if (achModal.editId !== null) {
      setList(list => list.map(a => a.id === achModal.editId ? { ...a, ...data } : a));
    } else {
      setList(list => [...list, { id: Date.now(), name: data.name, info: data.info, img: achModal.section === 'sport' ? '/dost1.png' : '/dost3.png' }]);
    }
    closeAchModal();
  };

  const deleteAch = () => {
    const setList = achModal.section === 'sport' ? setSportAch : setOtherAch;
    setList(list => list.filter(a => a.id !== achModal.editId));
    closeAchModal();
  };

  const dipModal = dipIndex !== null ? DIPLOMAS_DATA[dipIndex] : null;
  const openDip = (idx: number) => setDipIndex(idx);
  const closeDip = () => setDipIndex(null);
  const prevDip = () => setDipIndex(i => i !== null ? (i - 1 + DIPLOMAS_DATA.length) % DIPLOMAS_DATA.length : null);
  const nextDip = () => setDipIndex(i => i !== null ? (i + 1) % DIPLOMAS_DATA.length : null);

  useEffect(() => {
    if (dipIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextDip();
      else if (e.key === 'ArrowLeft') prevDip();
      else if (e.key === 'Escape') closeDip();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dipIndex]);

  useEffect(() => {
    document.body.style.overflow = dipIndex !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [dipIndex]);

  const handleBlogLike = (id: number) => {
    const was = blogLikes[id];
    setBlogLikes(p => ({ ...p, [id]: !p[id] }));
    if (!was) addNotif({ kind: 'like', title: 'Вы оценили запись', body: BLOG_POSTS.find(p => p.id === id)?.title || '', link: '/profile' });
  };
  const handleBlogFav = (post: typeof BLOG_POSTS[0]) => {
    toggleFav({ id: post.id + 1000, kind: 'article', title: post.title, author: 'Торнадо', date: post.date, image: post.img, stats: { views: post.views, hearts: post.likes, likes: 0 } });
  };

  const segBtn = (active: boolean, isLast = false): React.CSSProperties => ({
    padding: '8px 18px',
    border: 'none',
    borderRight: !isLast ? '1px solid #E5E7EB' : 'none',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    background: active ? '#fff' : 'transparent',
    color: active ? '#111' : '#6B7280',
    cursor: 'pointer',
    boxShadow: active ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
    margin: active ? '2px' : '0',
    borderRadius: active ? '8px' : '0',
    transition: 'all .15s',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F8F9FB' }}>
      <style>{ANIM}</style>
      <div style={{ padding: '20px 24px 40px' }}>

        {/* ══ ЛИЧНОЕ ДЕЛО ══ */}
        <SectionCard>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F5F5F7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>Личное дело</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF' }}>
              <span onClick={() => navigate('/')} style={{ cursor: 'pointer', transition: 'color .15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}>Главная</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
              <span style={{ color: '#374151', fontWeight: 500 }}>Личное дело</span>
            </div>
          </div>

          <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 90, height: 90, borderRadius: 16, overflow: 'hidden', border: '2px solid #E5E7EB', background: '#F3F4F6', transition: 'box-shadow .2s' }} onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.14)')} onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                <img src={profile.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div style={{ position: 'absolute', bottom: -8, right: -8, width: 38, height: 38 }}>
                <img src={profile.rankImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.4))' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>{profile.rank}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6 }}>{profile.name}</div>
              <div style={{ marginBottom: 6 }}><IVDisplay index={profile.index} rating={profile.rating} /></div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{profile.position}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', paddingTop: 20 }}>
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}><ElitaBadge small /></div>
              {profile.badges.slice(0, 3).map((src, i) => (
                <div key={i} className="vbadge" style={{ width: 72, height: 72, borderRadius: 12, background: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s' }}>
                  <img src={src} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              ))}
              <div onClick={() => navigate('/my-path', { state: { scrollTo: 'znaki' } })} style={{ width: 72, height: 72, borderRadius: 12, background: '#EBF1FF', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#375DFB', cursor: 'pointer', transition: 'background .15s, transform .15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#DFE8FF'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={e => { e.currentTarget.style.background = '#EBF1FF'; e.currentTarget.style.transform = 'scale(1)'; }}>+{profile.extraCount}</div>
            </div>
          </div>

          {/* ─── ТАБЫ ─── */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', width: 'fit-content' }}>
              {(['Данные', 'График подготовки', 'Сводка замеров'] as Tab[]).map((t, i, arr) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    padding: '8px 18px', border: 'none',
                    borderRight: i < arr.length - 1 ? '1px solid #E5E7EB' : 'none',
                    fontSize: 13, fontWeight: activeTab === t ? 600 : 400,
                    background: activeTab === t ? '#fff' : 'transparent',
                    color: activeTab === t ? '#111' : '#6B7280', cursor: 'pointer',
                    boxShadow: activeTab === t ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                    margin: activeTab === t ? '2px' : '0',
                    borderRadius: activeTab === t ? '8px' : '0',
                    transition: 'all .15s', whiteSpace: 'nowrap' as const,
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: '24px 24px 20px' }}>
            {activeTab === 'Данные' && (
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'stretch', animation: 'fadeUp .25s ease both' }}>
                <div style={{ flex: '0 0 480px', minWidth: 280 }}>
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 20 }}>
                    {[
                      { l: 'Город',         v: profile.city,                       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
                      { l: 'Год рождения',  v: profile.birthYear,                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                      { l: 'На портале',    v: profile.onPortal,                   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                      { l: 'Сообщество',    v: profile.community,                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                      { l: 'Прошёл курсов', v: String(profile.courses),            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
                      { l: 'Наград',        v: String(profile.awards),             icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
                      { l: 'Подписчиков',   v: profile.followers.toLocaleString(), icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                    ].map(({ l, v, icon }, i, arr) => (
                      <div key={l} className="vr" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F7' : 'none', transition: 'background .15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{icon}<span style={{ fontSize: 15, color: '#374151' }}>{l}</span></div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                  <button className="vbtn-p" onClick={() => navigate('/edit-profile')} style={{ flex: 1, padding: '13px 0', background: '#375DFB', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                      Редактировать
                    </button>
                    <button className="vbtn-w" onClick={() => navigate('/settings')} style={{ flex: 1, padding: '13px 0', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, color: '#374151', fontSize: 14, cursor: 'pointer', transition: 'background .15s' }}>Видимость блоков</button>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, background: '#F3F4F6' }}>
                    <img src={profile.coverImage} alt="" style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block', transition: 'transform .35s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.7, margin: 0, flex: 1 }}>{profile.bio}</p>
                </div>
              </div>
            )}

            {activeTab === 'График подготовки' && (
              <div style={{ animation: 'fadeUp .25s ease both' }}><TrainingPanel /></div>
            )}

            {activeTab === 'Сводка замеров' && (
              <div style={{ animation: 'fadeUp .25s ease both' }}>
                <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginBottom: 20, width: 'fit-content' }}>
                  <button onClick={() => setMeasuresView('history')} style={segBtn(measuresView === 'history')}>Смотреть историю</button>
                  <button onClick={() => setMeasuresView('edit')} style={segBtn(measuresView === 'edit')}>Редактировать данные</button>
                  <button onClick={() => setMeasuresView('chart')} style={segBtn(measuresView === 'chart', true)}>История замеров</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <MeasurementsPanel editable={measuresView === 'edit'} showHistory={measuresView === 'chart'} />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ══ ПРОЙДЕННЫЕ КУРСЫ ══ */}
        <SectionCard>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>}
            title="Пройденные курсы"
            action={
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowSortDrop(!showSortDrop)} className="vbtn-w" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'background .15s' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    По {courseSort === 'date' ? 'дате' : 'рейтингу'}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {showSortDrop && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.1)', zIndex: 100, overflow: 'hidden', minWidth: 160, animation: 'fadeUp .15s ease both' }}>
                      {[['date', 'По дате'], ['rating', 'По рейтингу']].map(([v, l]) => (
                        <button key={v} onClick={() => { setCourseSort(v as 'date' | 'rating'); setShowSortDrop(false); }} style={{ display: 'block', width: '100%', padding: '10px 16px', background: courseSort === v ? '#EBF1FF' : 'none', border: 'none', textAlign: 'left', fontSize: 13, color: courseSort === v ? '#375DFB' : '#374151', cursor: 'pointer', fontWeight: courseSort === v ? 600 : 400, transition: 'background .12s' }}>{l}</button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="vbtn-w" onClick={() => setShowSortDrop(!showSortDrop)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'background .15s' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                  Фильтры
                </button>
              </div>
            }
          />
          <div style={{ padding: '0 24px' }}>
            {allCourses.map((c, idx) => (
              <div key={c.id} className="vr" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 0', borderBottom: idx < allCourses.length - 1 ? '1px solid #F5F5F7' : 'none', transition: 'background .15s' }}>
                <div style={{ width: 160, height: 115, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                  <img src={c.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                    Начало - {c.start} <span style={{ width: 3, height: 3, background: '#D1D5DB', borderRadius: '50%', display: 'inline-block' }} /> Конец - {c.end}
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {[['Общий прогресс курса', c.progress, '#C2D6FF'], ['Домашние задания', c.hw, '#38C793']].map(([label, pct, color]) => (
                      <div key={String(label)} style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: '#6B7280' }}>{label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{pct}%</span>
                        </div>
                        <div style={{ height: 5, background: '#E5E7EB', borderRadius: 3 }}>
                          <div className="vprog" style={{ width: `${pct}%`, height: '100%', background: String(color), borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#ECFDF5"/><polyline points="7 13 10 16 17 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>Пройден</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Балов за курс <span style={{ fontWeight: 700, color: '#374151' }}>{c.rating}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <button className="vbtn-g" onClick={() => navigate(`/my-courses/${encodeURIComponent(c.title)}`)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontWeight: 600, color: '#375DFB', cursor: 'pointer', transition: 'all .15s' }}>
                    Подробнее <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ══ МОЙ БЛОГ ══ */}
        <SectionCard>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>}
            title="Мой блог"
            action={<button className="vbtn-g" onClick={() => navigate('/microblog')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 6, padding: '8px 16px', fontSize: 13, color: '#375DFB', fontWeight: 500, cursor: 'pointer', transition: 'all .15s' }}>Добавить +</button>}
          />
          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {BLOG_POSTS.map(post => {
              const liked = blogLikes[post.id];
              const juked = blogComments[post.id];
              const favd = isFav(post.id + 1000, 'article');
              return (
                <div key={post.id} className="vblog-card" style={{ background: '#F9FAFB', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', transition: 'transform .2s, box-shadow .2s' }}>
                  <div onClick={() => navigate('/journal')} style={{ height: 180, background: '#F3F4F6', cursor: 'pointer', overflow: 'hidden' }}>
                    <img src={post.img} alt="" className="vblog-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .35s' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p onClick={() => navigate('/journal')} style={{ fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: 8, cursor: 'pointer', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color .15s' } as React.CSSProperties} onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#111')}>{post.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>ВДВ СКОВ</span>
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>{post.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => handleBlogLike(post.id)} className="vlike" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12, color: liked ? '#EF4444' : '#9CA3AF', transition: 'transform .15s, color .15s' }}><IcHeart active={liked} />{post.likes + (liked ? 1 : 0)}</button>
                      <button onClick={() => setBlogComments(p => ({ ...p, [post.id]: !p[post.id] }))} className="vlike" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12, color: juked ? '#10B981' : '#9CA3AF', transition: 'transform .15s' }}><IcThumb color={juked ? '#10B981' : '#CDD0D5'} />{post.jumbo + (juked ? 1 : 0)}</button>
                      <button onClick={() => handleBlogFav(post)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', transition: 'transform .15s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}><IcBookmarkBlog active={favd} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ══ МОИ СООБЩЕСТВА ══ */}
        <SectionCard>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            title="Мои сообщества"
            action={<button onClick={() => setCommSort(!commSort)} className="vbtn-w" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'background .15s' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/></svg>По дате подписки<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"/></svg></button>}
          />
          <div style={{ padding: '0 24px' }}>
            {COMMUNITIES_DATA.map((c, idx) => (
              <div key={c.id} className="vr" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: idx < COMMUNITIES_DATA.length - 1 ? '1px solid #F5F5F7' : 'none', transition: 'background .15s' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                  <img src={c.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 3 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{c.date}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                  <button className="vbtn-w" onClick={() => window.alert('Подписка отменена в демо-режиме')} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 14px', fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'background .15s' }}>Отписаться</button>
                  <button className="vbtn-g" onClick={() => navigate('/communities')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#375DFB', cursor: 'pointer', transition: 'all .15s' }}>Подробнее <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ══ КАПТЁРКА ══ */}
        <SectionCard>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
            title="Мои объявления в каптёрке"
            action={<button className="vbtn-g" onClick={() => navigate('/kaptorka')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 6, padding: '8px 16px', fontSize: 13, color: '#375DFB', fontWeight: 500, cursor: 'pointer', transition: 'all .15s' }}>Добавить объявление +</button>}
          />
          <div style={{ padding: '0 24px' }}>
            {KAPTORKA_DATA.map((k, idx) => (
              <div key={k.id} className="vr" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: idx < KAPTORKA_DATA.length - 1 ? '1px solid #F5F5F7' : 'none', transition: 'background .15s' }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={k.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{k.title}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>Размер: {k.size} &nbsp; Цвет: {k.color}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{k.brand}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#059669' }}>{k.price.toLocaleString()} ₽</span>
                  <button onClick={() => navigate('/kaptorka')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', fontSize: 12, color: '#9CA3AF', cursor: 'pointer', transition: 'color .15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}>К объявлению<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ══ СПОРТИВНЫЕ ДОСТИЖЕНИЯ ══ */}
        <SectionCard>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}
            title="Спортивные достижения"
            action={<button onClick={() => openAddAch('sport')} style={{ width: 34, height: 34, background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 6, fontSize: 20, color: '#375DFB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400, transition: 'background .15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#DFE8FF')} onMouseLeave={e => (e.currentTarget.style.background = '#EBF1FF')} title="Добавить достижение">+</button>}
          />
          <div style={{ padding: '0 24px' }}>
            {sportAch.length === 0 && <div style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Нет достижений. Нажмите «+» чтобы добавить.</div>}
            {sportAch.map((it, i) => (
              <div key={it.id} className="vach-row vr" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < sportAch.length - 1 ? '1px solid #F0F0F0' : 'none', transition: 'background .15s', position: 'relative' }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                  <img src={it.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 3 }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{it.info}</div>
                </div>
                <button className="vach-actions" onClick={() => openEditAch('sport', it.id)} style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', color: '#6B7280', padding: '7px 9px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s, color .15s, opacity .15s', opacity: 0 }} onMouseEnter={e => { e.currentTarget.style.background = '#EBF1FF'; e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; }} onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }} title="Редактировать">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ══ ДРУГИЕ ДОСТИЖЕНИЯ ══ */}
        <SectionCard>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}
            title="Другие достижения"
            action={<button onClick={() => openAddAch('other')} style={{ width: 34, height: 34, background: '#EBF1FF', border: '1px solid #C7D2FE', borderRadius: 6, fontSize: 20, color: '#375DFB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400, transition: 'background .15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#DFE8FF')} onMouseLeave={e => (e.currentTarget.style.background = '#EBF1FF')} title="Добавить достижение">+</button>}
          />
          <div style={{ padding: '0 24px' }}>
            {otherAch.length === 0 && <div style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Нет достижений. Нажмите «+» чтобы добавить.</div>}
            {otherAch.map((it, i) => (
              <div key={it.id} className="vach-row vr" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < otherAch.length - 1 ? '1px solid #F0F0F0' : 'none', transition: 'background .15s', position: 'relative' }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                  <img src={it.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 3 }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{it.info}</div>
                </div>
                <button className="vach-actions" onClick={() => openEditAch('other', it.id)} style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', color: '#6B7280', padding: '7px 9px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s, color .15s, opacity .15s', opacity: 0 }} onMouseEnter={e => { e.currentTarget.style.background = '#EBF1FF'; e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; }} onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }} title="Редактировать">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ══ ДИПЛОМЫ ══ */}
        <SectionCard>
          <SectionHeader
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}
            title="Дипломы от УТЦ Воевода"
          />
          <div style={{ padding: '0 24px' }}>
            {DIPLOMAS_DATA.map((d, idx) => (
              <div key={d.id} onClick={() => openDip(idx)} className="vdip-card vr" style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: idx < DIPLOMAS_DATA.length - 1 ? '1px solid #F5F5F7' : 'none', transition: 'background .15s', borderRadius: 12 }}>
                <div style={{ width: 105, height: 148, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                  <img className="vdip-preview" src={d.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .2s, box-shadow .2s' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{d.title}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12, lineHeight: 1.5 }}>{d.desc}</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {d.badges.map((b, i) => (
                      <div key={i} className="vdip-badge" style={{ width: 52, height: 52, borderRadius: 10, background: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', filter: 'grayscale(100%)', transition: 'filter .2s' }}>
                        <img src={b} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>Дата получения {d.date}</span>
                  <span style={{ fontSize: 12, color: '#375DFB', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>Открыть<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

      </div>

      <AchieveModal
        open={achModal.open}
        title={achModal.section === 'sport' ? 'Спортивные достижения' : 'Другие достижения'}
        initial={achInitial ? { name: achInitial.name, info: achInitial.info } : null}
        onSave={saveAch}
        onClose={closeAchModal}
        onDelete={achModal.editId !== null ? deleteAch : undefined}
      />

      {dipModal && dipIndex !== null && (
        <div onClick={closeDip} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, animation: 'fadeIn .18s ease' }}>
          <button onClick={e => { e.stopPropagation(); prevDip(); }} className="vdip-nav-btn" style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, backdropFilter: 'blur(4px)', transition: 'background .15s' }} aria-label="Предыдущий диплом"><IcArrow dir="left" /></button>
          <button onClick={e => { e.stopPropagation(); nextDip(); }} className="vdip-nav-btn" style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, backdropFilter: 'blur(4px)', transition: 'background .15s' }} aria-label="Следующий диплом"><IcArrow dir="right" /></button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: '100%', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.4)', animation: 'fadeUp .2s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 2 }}>{dipModal.title}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Дата получения {dipModal.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {DIPLOMAS_DATA.map((_, i) => (
                    <button key={i} onClick={() => setDipIndex(i)} style={{ width: i === dipIndex ? 20 : 8, height: 8, borderRadius: 4, background: i === dipIndex ? '#375DFB' : '#E5E7EB', border: 'none', cursor: 'pointer', padding: 0, transition: 'all .2s' }} aria-label={`Диплом ${i + 1}`}/>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: '#9CA3AF', minWidth: 36, textAlign: 'center' }}>{dipIndex + 1} / {DIPLOMAS_DATA.length}</span>
                <button onClick={closeDip} style={{ background: '#F3F4F6', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')} onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}>×</button>
              </div>
            </div>
            <div style={{ background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <img src={dipModal.img} alt="" style={{ width: '100%', maxHeight: '62vh', objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {dipModal.badges.map((b, i) => (
                  <div key={i} style={{ width: 44, height: 44, borderRadius: 9, background: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={b} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={e => { e.stopPropagation(); prevDip(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F3F4F6', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#374151', fontSize: 13, cursor: 'pointer', transition: 'background .15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')} onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}><IcArrow dir="left" /> Пред.</button>
                <button className="vbtn-p" onClick={e => {
                  e.stopPropagation();
                  const blob = new Blob([`Диплом: ${dipModal.title}\nДата получения: ${dipModal.date}`], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `profile-diploma-${dipModal.id}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }} style={{ background: '#375DFB', border: 'none', borderRadius: 6, padding: '10px 20px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>Скачать</button>
                <button onClick={e => { e.stopPropagation(); nextDip(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F3F4F6', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#374151', fontSize: 13, cursor: 'pointer', transition: 'background .15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')} onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}>След. <IcArrow dir="right" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}