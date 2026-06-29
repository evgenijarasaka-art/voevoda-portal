import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, type CartCourse, type CartProduct, type CartItem } from '../store/useCartStore';

type Tab = 'Все товары' | 'Обучение' | 'Военмаркет' | 'Каптёрка';
const TABS: Tab[] = ['Все товары', 'Обучение', 'Военмаркет', 'Каптёрка'];
const STREAMS = ['20.03.2024', '24.03.2024', '10.04.2024', 'В любое время'];

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: 'pointer', border: checked ? 'none' : '1.5px solid #D1D5DB', background: checked ? '#375DFB' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
      {checked && <svg width="11" height="9" viewBox="0 0 12 10" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? '#375DFB' : '#D1D5DB', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
    </div>
  );
}

function CourseRow({ item }: { item: CartCourse }) {
  const { toggleSelect, remove, toggleFav, setStream } = useCartStore();
  const [showStreams, setShowStreams] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid #F5F5F7', alignItems: 'flex-start' }}>
      <Checkbox checked={item.isSelected} onChange={() => toggleSelect(item.id, item.kind)} />
      <div style={{ width: 90, height: 68, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
        {!imgErr && item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={() => setImgErr(true)} /> : <div style={{ width: '100%', height: '100%', background: '#EBF1FF' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>{item.title}</div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>{item.city} · {item.duration} · {item.format}</div>
        <div style={{ display: 'flex', gap: 14 }}>
          <button onClick={() => toggleFav(item.id, item.kind)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={item.isFav ? '#EF4444' : 'none'} stroke={item.isFav ? '#EF4444' : '#CDD0D5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </button>
          <button onClick={() => remove(item.id, 'course')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CDD0D5" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: item.price === 0 ? '#10B981' : '#059669' }}>{item.price === 0 ? 'Бесплатно' : `${item.price.toLocaleString()} ₽`}</div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowStreams(!showStreams)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#F9FAFB', fontSize: 12, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Старт потока: {item.stream || 'Выбрать'}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {showStreams && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', zIndex: 100, minWidth: 160, overflow: 'hidden' }}>
              {STREAMS.map(s => (
                <button key={s} onClick={() => { setStream(item.id, s); setShowStreams(false); }} style={{ display: 'block', width: '100%', padding: '9px 14px', background: item.stream === s ? '#EBF1FF' : 'none', border: 'none', textAlign: 'left', fontSize: 13, color: item.stream === s ? '#375DFB' : '#374151', cursor: 'pointer', fontWeight: item.stream === s ? 600 : 400 }}>{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductRow({ item }: { item: CartProduct }) {
  const { toggleSelect, remove, toggleFav, updateQty } = useCartStore();
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid #F5F5F7', alignItems: 'flex-start' }}>
      <Checkbox checked={item.isSelected} onChange={() => toggleSelect(item.id, item.kind)} />
      <div style={{ width: 90, height: 68, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!imgErr && item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setImgErr(true)} /> : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>{item.title}</div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>{[item.size && `Размер: ${item.size}`, item.color && `Цвет: ${item.color}`, item.brand].filter(Boolean).join(' · ')}</div>
        <div style={{ display: 'flex', gap: 14 }}>
          <button onClick={() => toggleFav(item.id, item.kind)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={item.isFav ? '#EF4444' : 'none'} stroke={item.isFav ? '#EF4444' : '#CDD0D5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </button>
          <button onClick={() => remove(item.id, 'product')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CDD0D5" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#059669' }}>{item.price.toLocaleString()} ₽</div>
          {item.oldPrice && <div style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through', textAlign: 'right' }}>{item.oldPrice.toLocaleString()} ₽</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #E5E7EB', borderRadius: 8, padding: '4px 8px' }}>
          <button onClick={() => updateQty(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: 18, lineHeight: 1 }}>−</button>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111', minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
          <button onClick={() => updateQty(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: 18, lineHeight: 1 }}>+</button>
        </div>
      </div>
    </div>
  );
}

function OrderSummary() {
  const navigate = useNavigate();
  const { items, total, discount } = useCartStore();
  const [writeBonuses, setWriteBonuses] = useState(true);
  const [promo, setPromo] = useState('');
  const totalAmt = total();
  const discountAmt = discount();
  const selectedCount = items.filter(i => i.isSelected).length;
  return (
    <div style={{ position: 'sticky', top: 76 }}>
      <button disabled={selectedCount === 0} onClick={() => selectedCount > 0 && navigate('/checkout')} style={{ width: '100%', padding: '14px 0', background: selectedCount > 0 ? '#375DFB' : '#B8C1D6', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: selectedCount > 0 ? 'pointer' : 'not-allowed', marginBottom: 12, transition: 'background .2s' }} onMouseEnter={e => { if (selectedCount > 0) e.currentTarget.style.background = '#1E3F9F'; }} onMouseLeave={e => { if (selectedCount > 0) e.currentTarget.style.background = '#375DFB'; }}>К оформлению заказа</button>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#374151' }}>Всего:</span><span style={{ color: '#9CA3AF' }}>{selectedCount} товаров</span></div>
        {discountAmt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#374151' }}>Скидка:</span><span style={{ color: '#EF4444', fontWeight: 600 }}>−{discountAmt.toLocaleString()} ₽</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#374151' }}>Бонусы:</span><span style={{ color: '#375DFB', fontWeight: 600 }}>429 БР</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}><span style={{ color: '#374151' }}>Списать БР</span><div onClick={() => setWriteBonuses(b => !b)} style={{ cursor: 'pointer' }}><Toggle on={writeBonuses} /></div></div>
        <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Промокод" style={{ width: '100%', padding: '9px 14px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: '#111', outline: 'none', background: '#F9FAFB', boxSizing: 'border-box' }} onFocus={e => (e.currentTarget.style.borderColor = '#375DFB')} onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')} />
        <div style={{ height: 1, background: '#F0F0F0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Итого:</span><span style={{ fontSize: 22, fontWeight: 700, color: '#059669' }}>{totalAmt.toLocaleString()} ₽</span></div>
        {[['Долями', Math.ceil(totalAmt / 4)], ['В кредит', Math.ceil(totalAmt / 12)], ['В рассрочку', Math.ceil(totalAmt / 10)]].map(([l, v]) => (
          <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#9CA3AF' }}>{l}</span>
            <span style={{ color: '#6B7280' }}>от {Number(v).toLocaleString()} ₽/мес</span>
          </div>
        ))}
        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '12px 14px', border: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
          </div>
          <div><div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Получите скидку 20%</div><div style={{ fontSize: 11, color: '#9CA3AF' }}>Оплатите по СБП</div></div>
        </div>
      </div>
    </div>
  );
}

export function Cart() {
  const [activeTab, setActiveTab] = useState<Tab>('Все товары');
  const { items, selectAll, deselectAll, removeSelected } = useCartStore();
  const navigate = useNavigate();
  const filtered = activeTab === 'Все товары' ? items : activeTab === 'Обучение' ? items.filter(i => i.kind === 'course') : activeTab === 'Военмаркет' ? items.filter(i => i.kind === 'product') : [];
  const activeKind: CartItem['kind'] | undefined = activeTab === 'Обучение' ? 'course' : activeTab === 'Военмаркет' ? 'product' : undefined;
  const allSelected = filtered.length > 0 && filtered.every(i => i.isSelected);
  const someSelected = filtered.some(i => i.isSelected);

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F8F9FB' }}>
      <div style={{ padding: '24px 24px 40px' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 24px', border: '1px solid #E5E7EB', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 5, background: '#F3F4F6', borderRadius: 12, padding: 4 }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? '#111' : '#6B7280', boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>{tab}</button>
              ))}
            </div>
          </div>
        </div>
        {items.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Корзина пуста</div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>Добавьте курсы или товары</div>
            </div>
            <button onClick={() => navigate('/courses')} style={{ background: '#375DFB', border: 'none', borderRadius: 10, padding: '10px 24px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Перейти к курсам</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '0 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 0', borderBottom: '1px solid #F0F0F0' }}>  
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Checkbox checked={allSelected} onChange={() => allSelected ? deselectAll(activeKind) : selectAll(activeKind)} />
                  <span onClick={() => allSelected ? deselectAll(activeKind) : selectAll(activeKind)} style={{ fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Выбрать все {filtered.length}</span>
                </div>
                {someSelected && <button onClick={() => removeSelected(activeKind)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9CA3AF', padding: 0 }} onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')} onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>Удалить выбранные</button>}
              </div>
              {filtered.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Нет товаров в этой категории</div>
              ) : filtered.map(item => item.kind === 'course' ? <CourseRow key={item.id} item={item as CartCourse} /> : <ProductRow key={item.id} item={item as CartProduct} />)}
            </div>
            <OrderSummary />
          </div>
        )}
      </div>
    </div>
  );
}
