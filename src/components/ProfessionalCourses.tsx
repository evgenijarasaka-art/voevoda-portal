import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../useMediaQuery';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useCartStore } from '../store/useCartStore';

if (typeof document !== 'undefined' && !document.getElementById('courses-styles')) {
  const s = document.createElement('style');
  s.id = 'courses-styles';
  s.textContent = `
    @keyframes cCardIn  { from{opacity:0;transform:translateY(14px) scale(.99)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes cDescIn  { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
    @keyframes cModalIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
    .course-card-shell {
      transform:translateZ(0);
      transform-origin:center;
      transition:transform .55s cubic-bezier(.22,1,.36,1), filter .55s cubic-bezier(.22,1,.36,1);
      will-change:transform;
    }
    .course-card-shell:hover { transform:translateY(-8px) scale(1.018); }
    .course-card-surface {
      transition:border-color .35s ease, box-shadow .55s cubic-bezier(.22,1,.36,1), background .35s ease !important;
      will-change:box-shadow;
    }
    .course-card-shell:hover .course-card-surface {
      border-color:#C7D2FE !important;
      box-shadow:0 22px 55px rgba(17,24,39,.14), 0 10px 26px rgba(55,93,251,.16) !important;
    }
    .c-card-img img { transition:transform .5s cubic-bezier(.4,0,.2,1); }
    .c-fav-btn { transition:transform .15s; }
    .c-fav-btn:hover { transform:scale(1.22) !important; }
    .c-modal-enter { animation:cModalIn .22s cubic-bezier(.4,0,.2,1); }
    @media (prefers-reduced-motion: reduce) {
      .course-card-shell, .course-card-surface, .c-card-img img { transition:none !important; }
      .course-card-shell:hover { transform:none; }
    }
  `;
  document.head.appendChild(s);
}

interface ProfCourse {
  id: number; city: string; duration: string; title: string;
  newPrice: number; oldPrice?: number; description?: string;
  image: string; isPaid?: boolean; format?: string; type?: string;
}

const PROF_COURSES: ProfCourse[] = [
  { id: 101, city: 'Москва',          duration: '3 месяца',  title: 'Управление проектами (PMP)',        newPrice: 45000,               image: '/проф1.png', isPaid: true, format: 'Онлайн', type: 'Курс',         description: 'Комплексная подготовка проектных менеджеров по стандарту PMI. Все фазы жизненного цикла проекта — от инициации до закрытия.' },
  { id: 102, city: 'Москва',          duration: '6 месяцев', title: 'Data Science & Machine Learning',  newPrice: 89000,               image: '/проф2.png', isPaid: true, format: 'Онлайн', type: 'Курс',         description: 'Python, pandas, sklearn, нейросети — от основ до production-готовых решений с реальными кейсами из индустрии.' },
  { id: 103, city: 'Санкт-Петербург', duration: '4 месяца',  title: 'Финансовый аналитик CFA Level I',  newPrice: 65000, oldPrice: 80000, image: '/проф3.png', isPaid: true, format: 'Комбинированный', type: 'Курс', description: 'Подготовка к сертификации CFA. Портфельный анализ, оценка активов, корпоративные финансы и МСФО.' },
  { id: 104, city: 'Москва',          duration: '3 месяца',  title: 'Корпоративное право и M&A',         newPrice: 55000,               image: '/проф3.png', isPaid: true, format: 'Онлайн', type: 'Серия курсов', description: 'Слияния и поглощения, due diligence, структурирование сделок и договорная работа в корпоративном секторе.' },
  { id: 105, city: 'Казань',          duration: '2 месяца',  title: 'Стратегический маркетинг',          newPrice: 39000, oldPrice: 48000, image: '/проф4.png', isPaid: true, format: 'Онлайн', type: 'Тренинг',      description: 'Маркетинговая стратегия, бренд-менеджмент, performance-маркетинг и аналитика для руководителей.' },
  { id: 106, city: 'Москва',          duration: '2 месяца',  title: 'HR Business Partner',               newPrice: 35000,               image: '/проф5.png', isPaid: true, format: 'Онлайн', type: 'Тренинг',      description: 'Стратегическое управление персоналом по методологии HRBP. Оценка талантов, создание HR-стратегии.' },
];

function ProfCourseCard({ c, idx, isFav, onToggleFav, onAddToCart, alreadyInCart, isActive, onActiveChange }: {
  c: ProfCourse; idx: number; isFav: boolean;
  onToggleFav: (e: React.MouseEvent, c: ProfCourse) => void;
  onAddToCart: (c: ProfCourse) => void;
  alreadyInCart: boolean;
  isActive: boolean;
  onActiveChange: (id: number | null) => void;
}) {
  const navigate = useNavigate();
  const hov = isActive;

  const blueBtnBase: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), #375DFB',
    boxShadow: '0 0 0 1px #375DFB, 0 1px 2px 0 rgba(37,62,167,0.48)',
    border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer',
  };

  const ImgSection = ({ zoom }: { zoom: boolean }) => (
    <div className="c-card-img" style={{ height: 190, overflow: 'hidden', position: 'relative', borderRadius: '16px 16px 0 0' }}>
      <img src={c.image} alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: zoom ? 'scale(1.05)' : 'scale(1)', transition: 'transform .5s cubic-bezier(.4,0,.2,1)' }}
        onError={e => { (e.target as HTMLImageElement).src = '/проф1.png'; }} />
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.1)', backdropFilter: 'blur(4px)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
          </svg>
        </div>
      </div>
    </div>
  );

  const PriceRow = ({ showOld }: { showOld: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: '#059669' }}>
          {c.newPrice.toLocaleString()} <span style={{ fontSize: 13 }}>₽</span>
        </span>
        {showOld && c.oldPrice && (
          <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>{c.oldPrice.toLocaleString()} ₽</span>
        )}
      </div>
      <button className="c-fav-btn" onClick={e => { e.stopPropagation(); onToggleFav(e, c); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : '#D1D5DB'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>
  );

  return (
    <div
      className="course-card-shell"
      onPointerEnter={() => onActiveChange(c.id)}
      onPointerLeave={() => onActiveChange(null)}
      style={{ position: 'relative', zIndex: hov ? 30 : 1, isolation: 'isolate' }}
    >
      {/* Base card */}
      <div className="course-card-surface" style={{
        borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#fff',
        animation: `cCardIn .5s ${idx * 70}ms ease backwards`,
        opacity: hov ? 0 : 1,
        transition: 'opacity .28s ease',
      }}>
        <ImgSection zoom={false} />
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{c.city}</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{c.duration}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 12, lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
            {c.title}
          </h3>
          <PriceRow showOld={false} />
        </div>
      </div>

      {/* Hover overlay — всегда в DOM */}
      <div
        className="course-card-surface"
        onClick={() => navigate(`/courses/${encodeURIComponent(c.title)}`)}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
          borderRadius: 16, overflow: 'hidden',
          border: '1px solid #375DFB', background: '#fff',
          boxShadow: '0 8px 28px rgba(55,93,251,.18)',
          cursor: 'pointer',
          opacity: hov ? 1 : 0,
          pointerEvents: hov ? 'auto' : 'none',
          transition: 'opacity .28s ease',
        }}
      >
        <ImgSection zoom={false} />
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{c.city}</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{c.duration}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 8, lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
            {c.title}
          </h3>
          {c.description && (
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55, margin: '0 0 10px',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
              {c.description}
            </p>
          )}
          <PriceRow showOld />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={e => { e.stopPropagation(); onAddToCart(c); }}
              title={alreadyInCart ? 'В корзине' : 'В корзину'}
              style={{ ...blueBtnBase, width: 46, height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: alreadyInCart
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), #059669'
                  : blueBtnBase.background as string,
                boxShadow: alreadyInCart ? '0 0 0 1px #059669, 0 1px 2px 0 rgba(4,120,87,.48)' : blueBtnBase.boxShadow as string,
              }}>
              {alreadyInCart
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              }
            </button>
            <button
              onClick={e => { e.stopPropagation(); navigate(`/checkout`); }}
              className="c-enroll-btn"
              style={{ ...blueBtnBase, flex: 1, height: 46, fontSize: 14, fontWeight: 600 }}>
              Записаться и оплатить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfessionalCourses() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const { toggle: toggleFav, has: hasFav } = useFavoritesStore();
  const { addCourse, has: inCart } = useCartStore();
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);

  const handleToggleFav = (e: React.MouseEvent, c: ProfCourse) => {
    e.stopPropagation();
    toggleFav({ id: c.id, kind: 'course', title: c.title, city: c.city, duration: c.duration, price: c.newPrice, format: 'Онлайн', image: c.image });
  };
  const handleAddToCart = (c: ProfCourse) => {
    addCourse({ id: c.id, kind: 'course', title: c.title, city: c.city, duration: c.duration, price: c.newPrice, format: 'Онлайн', image: c.image, stream: '' });
  };

  return (
    <section style={{ padding: isMobile ? '16px 16px 0' : '24px 24px 0' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: isMobile ? '20px' : '24px 28px', border: '1px solid #E5E7EB', animation: 'cCardIn .5s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Профессиональная подготовка</h2>
          </div>
          <button onClick={() => navigate('/professional')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#374151', background: '#F9FAFB', cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EBF1FF'; e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.color = '#375DFB'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}>
            Все <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20, overflow: 'visible' }}>
          {PROF_COURSES.map((c, idx) => (
            <ProfCourseCard
              key={c.id} c={c} idx={idx}
              isFav={hasFav(c.id, 'course')}
              onToggleFav={handleToggleFav}
              onAddToCart={handleAddToCart}
              alreadyInCart={inCart(c.id, 'course')}
              isActive={activeCourseId === c.id}
              onActiveChange={setActiveCourseId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
