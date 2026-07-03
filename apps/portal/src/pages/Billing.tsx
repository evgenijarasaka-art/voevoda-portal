import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.bill-card{animation:fadeUp .35s ease both}
.bill-card:nth-child(2){animation-delay:.07s}
.bill-card:nth-child(3){animation-delay:.14s}
.bill-plan{transition:box-shadow .2s,transform .2s,border-color .2s}
.bill-plan:hover{box-shadow:0 8px 32px rgba(55,93,251,.14);transform:translateY(-3px)}
.bill-plan.active{border-color:#375DFB!important}
.bill-btn{transition:background .15s,transform .1s}
.bill-btn:hover{transform:translateY(-1px)}
.bill-btn:active{transform:translateY(0)}
.bill-row:hover{background:#F8FAFF!important}
.bill-card-item{transition:box-shadow .2s,border-color .2s}
.bill-card-item:hover{box-shadow:0 4px 16px rgba(0,0,0,.07);border-color:#C7D2FE!important}
`;

const PLANS = [
  {
    id: 'base',
    name: 'Базовый',
    price: 490,
    period: 'мес',
    features: ['Доступ к бесплатным курсам', 'Участие в сообществах', 'Базовый журнал', 'Каптёрка (просмотр)'],
    color: '#6B7280',
    bg: '#F9FAFB',
  },
  {
    id: 'pro',
    name: 'Профессионал',
    price: 990,
    period: 'мес',
    features: ['Все курсы без ограничений', 'Персональный куратор', 'Приоритетная поддержка', 'Сертификат об обучении', 'Скидка 10% на Каптёрку'],
    color: '#375DFB',
    bg: '#EBF1FF',
    popular: true,
  },
  {
    id: 'elite',
    name: 'Элита',
    price: 1990,
    period: 'мес',
    features: ['Всё из «Профессионал»', 'Доступ к закрытым потокам', 'Индивидуальные занятия', 'Военный разбор + обратная связь', 'Бесплатный доступ к командирским курсам'],
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
];

const HISTORY = [
  { date: '15 апр 2026', plan: 'Профессионал', amount: 990, status: 'success', method: '•••• 4872' },
  { date: '15 мар 2026', plan: 'Профессионал', amount: 990, status: 'success', method: '•••• 4872' },
  { date: '15 фев 2026', plan: 'Профессионал', amount: 990, status: 'success', method: '•••• 4872' },
  { date: '15 янв 2026', plan: 'Профессионал', amount: 990, status: 'success', method: '•••• 4872' },
  { date: '15 дек 2025', plan: 'Профессионал', amount: 990, status: 'success', method: '•••• 4872' },
];

function injectCss() {
  if (document.getElementById('bill-css')) return;
  const s = document.createElement('style'); s.id = 'bill-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

export function Billing() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('pro');
  const [cancelModal, setCancelModal] = useState(false);
  const [addCardModal, setAddCardModal] = useState(false);
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [tab, setTab] = useState<'plans' | 'history'>('plans');

  injectCss();

  const nextDate = '15 мая 2026';
  const cards = [
    { id: 1, num: '•••• •••• •••• 4872', bank: 'Сбербанк', exp: '08/27', type: 'mir', default: true },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 60px' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/settings')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Настройки
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Управление подпиской</h1>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 28px' }}>Следующее списание: <strong style={{ color: '#111827' }}>{nextDate}</strong> — 990 ₽</p>

      {/* Status card */}
      <div className="bill-card" style={{ background: 'linear-gradient(135deg, #375DFB 0%, #2347e0 100%)', borderRadius: 18, padding: '22px 24px', marginBottom: 28, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontSize: 13, opacity: .75, marginBottom: 4 }}>Текущий тариф</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Профессионал</div>
          <div style={{ fontSize: 13, opacity: .8 }}>Активна до {nextDate} · 990 ₽/мес</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="bill-btn"
            onClick={() => setCancelModal(true)}
            style={{ padding: '9px 18px', background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.3)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Отменить
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {(['plans', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#111827' : '#6B7280', fontSize: 13, fontWeight: tab === t ? 700 : 500, cursor: 'pointer', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}
          >
            {t === 'plans' ? 'Тарифы' : 'История платежей'}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <>
          {/* Plans */}
          <div className="bill-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`bill-plan${currentPlan === plan.id ? ' active' : ''}`}
                style={{ background: '#fff', border: `2px solid ${currentPlan === plan.id ? plan.color : '#E5E7EB'}`, borderRadius: 16, padding: '20px 18px', position: 'relative', cursor: 'default' }}
              >
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#375DFB', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20 }}>
                    Популярный
                  </div>
                )}
                {currentPlan === plan.id && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: plan.bg, color: plan.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    Активен
                  </div>
                )}
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: plan.color }}>{plan.price} ₽</span>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>/{plan.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: '#374151' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  className="bill-btn"
                  onClick={() => setCurrentPlan(plan.id)}
                  disabled={currentPlan === plan.id}
                  style={{ width: '100%', padding: '9px', border: 'none', borderRadius: 10, background: currentPlan === plan.id ? plan.bg : plan.color, color: currentPlan === plan.id ? plan.color : '#fff', fontSize: 13, fontWeight: 700, cursor: currentPlan === plan.id ? 'default' : 'pointer' }}
                >
                  {currentPlan === plan.id ? 'Текущий тариф' : 'Выбрать тариф'}
                </button>
              </div>
            ))}
          </div>

          {/* Payment method */}
          <div className="bill-card" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Способ оплаты</div>
              <button
                className="bill-btn"
                onClick={() => setAddCardModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#F3F4F6', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Добавить карту
              </button>
            </div>
            {cards.map(card => (
              <div key={card.id} className="bill-card-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 12 }}>
                <div style={{ width: 42, height: 28, background: '#1A6B3E', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="14" viewBox="0 0 36 22" fill="none"><circle cx="13" cy="11" r="8" fill="#D42A31"/><circle cx="23" cy="11" r="8" fill="#F5A623" opacity=".8"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{card.num}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{card.bank} · до {card.exp}</div>
                </div>
                {card.default && <span style={{ fontSize: 11, fontWeight: 700, color: '#375DFB', background: '#EBF1FF', padding: '3px 9px', borderRadius: 20 }}>Основная</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="bill-card" style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', fontSize: 15, fontWeight: 700, color: '#111827' }}>История платежей</div>
          {HISTORY.map((h, i) => (
            <div key={i} className="bill-row" style={{ display: 'flex', alignItems: 'center', padding: '13px 20px', borderBottom: i < HISTORY.length - 1 ? '1px solid #F3F4F6' : 'none', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Подписка «{h.plan}»</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{h.date} · {h.method}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>−{h.amount} ₽</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: '#F0FDF4', padding: '3px 9px', borderRadius: 20 }}>Оплачено</span>
            </div>
          ))}
        </div>
      )}

      {/* Cancel modal */}
      {cancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setCancelModal(false)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px 28px 24px', maxWidth: 380, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Отменить подписку?</div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 22 }}>
              Доступ к курсам и материалам сохранится до <strong>{nextDate}</strong>. После этой даты вы перейдёте на бесплатный тариф.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCancelModal(false)} style={{ flex: 1, padding: '10px', border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Оставить</button>
              <button onClick={() => setCancelModal(false)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 10, background: '#EF4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#fff' }}>Отменить подписку</button>
            </div>
          </div>
        </div>
      )}

      {/* Add card modal */}
      {addCardModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setAddCardModal(false)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '24px 24px 22px', maxWidth: 360, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 18 }}>Добавить карту</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Номер карты</label>
                <input value={cardNum} onChange={e => setCardNum(e.target.value)} placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Срок действия</label>
                  <input value={cardExp} onChange={e => setCardExp(e.target.value)} placeholder="MM/YY" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>CVV</label>
                  <input value={cardCvc} onChange={e => setCardCvc(e.target.value)} placeholder="•••" type="password" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={() => setAddCardModal(false)} style={{ flex: 1, padding: '10px', border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Отмена</button>
              <button onClick={() => setAddCardModal(false)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 10, background: '#375DFB', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#fff' }}>Привязать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
