import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { usePurchasedCoursesStore } from '../store/usePurchasedCoursesStore';
import { createCheckoutPayment, getPaymentOrder, type CheckoutPaymentItem } from '../api/payments';

const COUNTRIES = [
  { code: '+7', flag: '🇷🇺' },
  { code: '+375', flag: '🇧🇾' },
  { code: '+7', flag: '🇰🇿' },
];

type PayMode = 'full' | 'credit' | 'installment' | 'parts';

const PARTS_OPTIONS = [
  { months: 4, perMonth: 10000, overpay: 0, label: 'Без переплат' },
  { months: 6, perMonth: 7000, overpay: 2000, label: 'Переплата 2000 ₽' },
  { months: 8, perMonth: 5500, overpay: 4000, label: 'Переплата 4000 ₽' },
  { months: 12, perMonth: 4500, overpay: 14000, label: 'Переплата 14 000 ₽' },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: on ? '#375DFB' : '#D1D5DB', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
    </div>
  );
}

function Field({ label, value, onChange, type, placeholder, disabled }: { label: string; value: string; onChange?: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</label>
      <input
        type={type || 'text'}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ width: '100%', padding: '11px 14px', border: `1px solid ${focused ? '#375DFB' : '#E5E7EB'}`, borderRadius: 12, fontSize: 14, outline: 'none', background: disabled ? '#F9FAFB' : '#fff', color: '#111', boxSizing: 'border-box', transition: 'border-color .15s' }}
      />
    </div>
  );
}

function PartsTimeline({ months, perMonth }: { months: number; perMonth: number }) {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 20);
  const fmt = (d: Date) => `${d.getDate()} ${['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'][d.getMonth()]}`;
  return (
    <div style={{ marginTop: 12, padding: '12px 14px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Сегодня</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#375DFB' }}>{perMonth.toLocaleString()} ₽</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{fmt(nextMonth)}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#375DFB' }}>{perMonth.toLocaleString()} ₽</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>Ещё {months - 2} платежей ежемесячно</div>
        </div>
      </div>
      <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, position: 'relative' }}>
        <div style={{ width: `${(2 / months) * 100}%`, height: '100%', background: '#375DFB', borderRadius: 2 }} />
      </div>
    </div>
  );
}

export function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, total, discount } = useCartStore();
  const { confirmPending, pending } = usePurchasedCoursesStore();
  const [form, setForm] = useState({ login: '', email: '', phone: '', countryCode: '+7' });
  const [payMode, setPayMode] = useState<PayMode>('full');
  const [selectedPart, setSelectedPart] = useState(3);
  const [writeBonuses, setWriteBonuses] = useState(true);
  const [promo, setPromo] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const totalAmt = total();
  const discountAmt = discount();
  const bonuses = 429;

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    if (!orderId) return;

    let stopped = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const order = await getPaymentOrder(orderId);
        if (stopped) return;

        if (order.status === 'paid') {
          confirmPending();
          setSuccess(true);
          return;
        }

        if (order.status === 'canceled' || order.status === 'failed') {
          setPaymentError('Оплата не прошла. Можно попробовать оплатить заказ еще раз.');
          return;
        }

        if (attempts < 12) {
          window.setTimeout(poll, 2500);
        } else {
          setPaymentError('Оплата еще обрабатывается. Обновите страницу через минуту.');
        }
      } catch {
        if (!stopped) {
          setPaymentError('Не удалось проверить статус оплаты. Попробуйте обновить страницу.');
        }
      }
    };

    poll();
    return () => {
      stopped = true;
    };
  }, [confirmPending, searchParams]);

  const buildPaymentItems = (): CheckoutPaymentItem[] => {
    const selected = items.filter(i => i.isSelected).map(item => ({
      id: String(item.id),
      kind: item.kind,
      title: item.title,
      price: item.price,
      qty: item.kind === 'product' ? item.qty : 1,
      city: item.kind === 'course' ? item.city : undefined,
      brand: item.kind === 'product' ? item.brand : undefined,
      stream: item.kind === 'course' ? item.stream : undefined,
    }));

    if (selected.length > 0) return selected;
    if (!pending) return [];

    return [{
      id: pending.slug,
      kind: 'course',
      title: pending.title,
      price: pending.price,
      qty: 1,
      city: pending.city,
    }];
  };

  const handlePay = async () => {
    setPaymentError('');
    const paymentItems = buildPaymentItems();

    if (!form.email.trim()) {
      setPaymentError('Укажите электронную почту: на неё ЮKassa отправит информацию по оплате и чек.');
      return;
    }

    if (paymentItems.length === 0) {
      setPaymentError('В заказе нет выбранных товаров или курсов.');
      return;
    }

    setIsPaying(true);
    try {
      const payment = await createCheckoutPayment({
        login: form.login,
        email: form.email,
        phone: `${form.countryCode}${form.phone}`.replace(/[^\d+]/g, ''),
        return_url: `${window.location.origin}/checkout`,
        items: paymentItems,
      });

      if (!payment.confirmation_url) {
        throw new Error('Missing confirmation_url');
      }

      window.location.href = payment.confirmation_url;
    } catch {
      setPaymentError('Не удалось создать платеж в ЮKassa. Проверьте ключи и попробуйте еще раз.');
      setIsPaying(false);
    }
  };

  if (success) {
    return (
      <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', textAlign: 'center', maxWidth: 440, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8 }}>Заказ оформлен!</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.6 }}>Квитанция отправлена на вашу почту. Доступ к курсу открыт.</p>
          <button onClick={() => navigate('/my-courses')} style={{ width: '100%', padding: '13px', background: '#375DFB', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Перейти к моим курсам</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F8F9FB' }}>
      <div style={{ padding: '24px 24px 40px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

          {/* ── Левая колонка — Оформление ── */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 24px', borderBottom: '1px solid #F0F0F0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>Оформление заказа</span>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Логин или позывной" value={form.login} onChange={v => set('login', v)} placeholder="Voevoda" />
              <Field label="Электронная почта" value={form.email} onChange={v => set('email', v)} type="email" placeholder="pochta@voevoda.ru" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Мобильный номер</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={form.countryCode} onChange={e => set('countryCode', e.target.value)} style={{ padding: '11px 10px', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, outline: 'none', background: '#fff', cursor: 'pointer', flexShrink: 0 }}>
                    {COUNTRIES.map(c => <option key={c.flag + c.code} value={c.code}>{c.flag} {c.code}</option>)}
                  </select>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(000) 000-00-00" style={{ flex: 1, padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} onFocus={e => (e.currentTarget.style.borderColor = '#375DFB')} onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
              </div>

              {items.length > 0 && (
                <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.filter(i => i.isSelected).slice(0, 3).map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                        <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{'brand' in item ? (item as any).brand : (item as any).city}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', flexShrink: 0 }}>{item.price.toLocaleString()} ₽</div>
                    </div>
                  ))}
                  {items.filter(i => i.isSelected).length > 3 && (
                    <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>+ ещё {items.filter(i => i.isSelected).length - 3} товаров</div>
                  )}
                </div>
              )}

              {items.length === 0 && (
                <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 16 }}>
                  {[{ img: '/kyrs1.png', title: 'Ремень брючный RusForce Outdoor...', brand: 'Точка Group', price: 1445 }, { img: '/kyrs2.png', title: 'Кобура поясная VEKTOR 14-26...', brand: 'Точка Group', price: 1020 }, { img: '/kyrs3.png', title: 'Ремень брючный RusForce Out...', brand: 'Точка Group', price: 12200 }].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                        <img src={item.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{item.brand}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', flexShrink: 0 }}>{item.price.toLocaleString()} ₽</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Правая колонка — Детали ── */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 24px', borderBottom: '1px solid #F0F0F0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>Детали</span>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#374151' }}>Всего:</span>
                <span style={{ color: '#9CA3AF' }}>{items.filter(i => i.isSelected).length || 3} товара</span>
              </div>
              {(discountAmt > 0 || true) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#374151' }}>Скидка:</span>
                  <span style={{ color: '#EF4444', fontWeight: 600 }}>-{(discountAmt || 8600).toLocaleString()} ₽</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#374151' }}>Бонусы:</span>
                <span style={{ color: '#375DFB', fontWeight: 600 }}>{bonuses} БР</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                <span style={{ color: '#374151' }}>Списать БР</span>
                <Toggle on={writeBonuses} onChange={() => setWriteBonuses(b => !b)} />
              </div>
              <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Промокод" style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, background: '#F9FAFB' }} onFocus={e => (e.currentTarget.style.borderColor = '#375DFB')} onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')} />
              <div style={{ height: 1, background: '#F0F0F0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>Итого:</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>{(totalAmt || 32800).toLocaleString()} ₽</span>
              </div>

              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Формы оплаты</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  {([['full', 'Полностью'], ['credit', 'Кредит'], ['installment', 'Рассрочка'], ['parts', 'Долями']] as [PayMode, string][]).map(([mode, label]) => (
                    <button key={mode} onClick={() => setPayMode(mode)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `1.5px solid ${payMode === mode ? '#375DFB' : '#E5E7EB'}`, background: payMode === mode ? '#EBF1FF' : '#fff', color: payMode === mode ? '#375DFB' : '#6B7280', fontSize: 12, fontWeight: payMode === mode ? 700 : 400, cursor: 'pointer', transition: 'all .15s' }}>{label}</button>
                  ))}
                </div>

                {payMode === 'full' && (
                  <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>Единовременный платёж</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#059669' }}>{(totalAmt || 32800).toLocaleString()} ₽</div>
                  </div>
                )}

                {payMode === 'credit' && (
                  <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>Кредит на 12 месяцев</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#374151' }}>от {Math.ceil((totalAmt || 32800) / 12).toLocaleString()} ₽/мес</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Переплата ~{Math.ceil((totalAmt || 32800) * 0.15).toLocaleString()} ₽</div>
                  </div>
                )}

                {payMode === 'installment' && (
                  <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>Рассрочка на 10 месяцев</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#374151' }}>от {Math.ceil((totalAmt || 32800) / 10).toLocaleString()} ₽/мес</div>
                    <div style={{ fontSize: 12, color: '#10B981', marginTop: 4 }}>Без переплат</div>
                  </div>
                )}

                {payMode === 'parts' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {PARTS_OPTIONS.map((opt, i) => (
                        <div key={i} onClick={() => setSelectedPart(i)} style={{ padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${selectedPart === i ? '#375DFB' : '#E5E7EB'}`, background: selectedPart === i ? '#EBF1FF' : '#F9FAFB', cursor: 'pointer', transition: 'all .15s' }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: selectedPart === i ? '#375DFB' : '#374151' }}>{opt.perMonth.toLocaleString()} ₽ × {opt.months}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{opt.label}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{opt.months} мес.</span>
                            <div style={{ flex: 1, height: 3, borderRadius: 2, background: '#E5E7EB', position: 'relative' as const }}>
                              <div style={{ width: `${(i + 1) * 25}%`, height: '100%', background: selectedPart === i ? '#375DFB' : '#D1D5DB', borderRadius: 2 }} />
                            </div>
                            {selectedPart === i && (
                              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #375DFB', background: '#375DFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <PartsTimeline months={PARTS_OPTIONS[selectedPart].months} perMonth={PARTS_OPTIONS[selectedPart].perMonth} />
                  </div>
                )}
              </div>

              {paymentError && (
                <div style={{ padding: '11px 14px', borderRadius: 12, background: '#FEF2F2', color: '#B91C1C', fontSize: 13, lineHeight: 1.45 }}>
                  {paymentError}
                </div>
              )}

              <button disabled={isPaying} onClick={handlePay} style={{ width: '100%', padding: '14px', background: isPaying ? '#9CA3AF' : '#375DFB', border: 'none', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 700, cursor: isPaying ? 'not-allowed' : 'pointer', marginTop: 4, transition: 'background .2s' }} onMouseEnter={e => { if (!isPaying) e.currentTarget.style.background = '#1E3F9F'; }} onMouseLeave={e => { if (!isPaying) e.currentTarget.style.background = '#375DFB'; }}>
                {isPaying ? 'Создаем платеж...' : 'Оплатить через ЮKassa'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Безопасная оплата
              </div>
            </div>
          </div>

        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#9CA3AF', display: 'flex', justifyContent: 'center', gap: 24 }}>
          <span>© 2015–2026 УТЦ «ВОЕВОДА»</span>
          <span style={{ cursor: 'pointer' }}>Все права защищены</span>
          <span style={{ cursor: 'pointer' }}>Политика конфиденциальности</span>
          <span style={{ cursor: 'pointer' }}>Возврат</span>
        </div>
      </div>
    </div>
  );
} 
