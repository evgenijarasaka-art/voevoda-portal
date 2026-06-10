import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createWalletTopupPayment, getPaymentOrder } from '../api/payments';

// ─── TYPES ────────────────────────────────────────────────────────────────────
type TxType = 'edu' | 'income' | 'kaptorka' | 'bonus' | 'market' | 'referral' | 'expense';
type TxStatus = 'done' | 'pending' | 'error';
type ModalType = 'topup' | 'withdraw' | 'transfer' | 'addCard' | null;
type View = 'main' | 'history';
type HistoryFilter = 'all' | 'done' | 'pending' | 'error' | 'edu' | 'market';
type MonthKey = 'Ноя' | 'Дек' | 'Янв' | 'Фев' | 'Мар' | 'Апр';
type Period = 'month' | 'quarter' | 'year';

interface Transaction {
  id: number; type: TxType; title: string; sub: string;
  date: string; ord: string; amount: number; cashback: number;
  status: TxStatus; card: string; group: string;
}
interface SpendItem { label: string; value: number; color: string; }
interface MockUser { name: string; sub: string; init: string; }
interface PayCard { id: string; num: string; bank: string; exp: string; logo: string; bg: string; type: 'visa' | 'mir' | 'sbp'; }
interface MLMNode { id: string; name: string; earned: number; courses: number; level: number; parent?: string; }
interface MonthData { total: number; income: number; cashback: number; breakdown: SpendItem[]; balanceTrend: number[]; }

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ALL_MONTHS: MonthKey[] = ['Ноя', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр'];
const CAT_COLORS: Record<TxType, string> = {
  edu: '#375DFB', kaptorka: '#f57c00', income: '#1d9e75',
  expense: '#e53935', bonus: '#f5a623', market: '#7c3aed', referral: '#0ea5e9',
};

const MONTHLY_STATS: Record<MonthKey, MonthData> = {
  'Ноя': { total: 9200, income: 15000, cashback: 92, breakdown: [{ label: 'Обучение', value: 0, color: '#375DFB' }, { label: 'Военмаркет', value: 5200, color: '#7c3aed' }, { label: 'Каптёрка', value: 2000, color: '#f57c00' }, { label: 'Прочее', value: 2000, color: '#9ca3af' }], balanceTrend: [22000, 21500, 23000, 22800, 24000, 22000] },
  'Дек': { total: 12400, income: 18000, cashback: 124, breakdown: [{ label: 'Обучение', value: 6100, color: '#375DFB' }, { label: 'Военмаркет', value: 3200, color: '#7c3aed' }, { label: 'Каптёрка', value: 800, color: '#f57c00' }, { label: 'Прочее', value: 2300, color: '#9ca3af' }], balanceTrend: [22000, 25000, 26500, 28000, 27500, 28500] },
  'Янв': { total: 7800, income: 12000, cashback: 78, breakdown: [{ label: 'Обучение', value: 3200, color: '#375DFB' }, { label: 'Военмаркет', value: 1800, color: '#7c3aed' }, { label: 'Каптёрка', value: 0, color: '#f57c00' }, { label: 'Прочее', value: 2800, color: '#9ca3af' }], balanceTrend: [28500, 29000, 27000, 26500, 25000, 24200] },
  'Фев': { total: 11200, income: 16000, cashback: 112, breakdown: [{ label: 'Обучение', value: 4900, color: '#375DFB' }, { label: 'Военмаркет', value: 3500, color: '#7c3aed' }, { label: 'Каптёрка', value: 1200, color: '#f57c00' }, { label: 'Прочее', value: 1600, color: '#9ca3af' }], balanceTrend: [24200, 26000, 28000, 30000, 31500, 31000] },
  'Мар': { total: 14600, income: 14600, cashback: 146, breakdown: [{ label: 'Обучение', value: 8500, color: '#375DFB' }, { label: 'Военмаркет', value: 2800, color: '#7c3aed' }, { label: 'Каптёрка', value: 900, color: '#f57c00' }, { label: 'Прочее', value: 2400, color: '#9ca3af' }], balanceTrend: [31000, 30000, 29500, 30500, 29800, 29800] },
  'Апр': { total: 14700, income: 10000, cashback: 429, breakdown: [{ label: 'Обучение', value: 8200, color: '#375DFB' }, { label: 'Военмаркет', value: 3500, color: '#7c3aed' }, { label: 'Каптёрка', value: 2000, color: '#f57c00' }, { label: 'Прочее', value: 1000, color: '#9ca3af' }], balanceTrend: [29800, 27000, 24500, 21000, 19500, 18450] },
};

const BALANCE_HISTORY = ALL_MONTHS.map(m => ({
  month: m,
  balance: MONTHLY_STATS[m].balanceTrend[MONTHLY_STATS[m].balanceTrend.length - 1],
}));

const TRANSACTIONS: Transaction[] = [
  { id: 1, type: 'edu', title: 'Курс Молодого Бойца V5', sub: 'Обучение • Старт 10 апр', date: '12 апр 2025', ord: '#ORD-00112', amount: -4900, cashback: 49, status: 'done', card: '4242', group: 'Сегодня' },
  { id: 2, type: 'income', title: 'Пополнение через СБП', sub: 'СБП • Мгновенно', date: '10 апр 2025', ord: '#ORD-00110', amount: +10000, cashback: 0, status: 'done', card: 'СБП', group: 'Вчера' },
  { id: 7, type: 'market', title: 'Берцы тактические', sub: 'Военмаркет • р.42', date: '18 апр 2025', ord: '#ORD-00115', amount: -4800, cashback: 48, status: 'done', card: '4242', group: 'Вчера' },
  { id: 3, type: 'kaptorka', title: 'Кобура ТТ — Каптёрка', sub: 'Каптёрка • Коричневый', date: '8 апр 2025', ord: '#ORD-00105', amount: -500, cashback: 5, status: 'done', card: '4242', group: '8 апреля' },
  { id: 4, type: 'edu', title: 'Тактическая медицина', sub: 'Обучение • Старт 1 апр', date: '1 апр 2025', ord: '#ORD-00098', amount: -3200, cashback: 32, status: 'done', card: '8877', group: '1 апреля' },
  { id: 5, type: 'bonus', title: 'Реферальный бонус', sub: 'За приглашение • Иванов', date: '28 мар 2025', ord: '#ORD-00094', amount: +500, cashback: 0, status: 'done', card: '—', group: 'Март 2025' },
  { id: 6, type: 'edu', title: 'Ускоренная подготовка', sub: 'Обучение • Старт 15 мар', date: '15 мар 2025', ord: '#ORD-00087', amount: -6100, cashback: 61, status: 'done', card: '8877', group: 'Март 2025' },
  { id: 8, type: 'edu', title: 'Разведывательно-штурмовая', sub: 'Обучение • Старт 2 мар', date: '28 мар 2025', ord: '#ORD-00091', amount: -8500, cashback: 0, status: 'error', card: '4242', group: 'Март 2025' },
];

const MOCK_USERS: MockUser[] = [
  { name: 'Капитан Коба', sub: 'Вице-капитан, 77-й батальон', init: 'КБ' },
  { name: 'Сержант Кобра', sub: 'Инструктор, 12-й отряд', init: 'КР' },
  { name: 'Рядовой Медведь', sub: 'Боец, 5-й взвод', init: 'МД' },
];

const INIT_CARDS: PayCard[] = [
  { id: 'c1', num: '4242', bank: 'Тинькофф', exp: '12/26', logo: 'VISA', bg: 'linear-gradient(135deg, #fdba74 0%, #fb923c 100%)', type: 'visa' },
  { id: 'c2', num: '8877', bank: 'Сбербанк', exp: '03/27', logo: 'МИР', bg: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)', type: 'mir' },
  { id: 'c4', num: '5531', bank: 'Альфа-Банк', exp: '07/28', logo: 'VISA', bg: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)', type: 'visa' },
  { id: 'c3', num: 'СБП', bank: 'СБП', exp: '', logo: 'СБП', bg: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)', type: 'sbp' },
];
const CARD_H = 128;

const MLM_NODES: MLMNode[] = [
  { id: 'А', name: 'Иванов И.', earned: 120, courses: 3, level: 1 },
  { id: 'Б', name: 'Петров С.', earned: 85, courses: 2, level: 1 },
  { id: 'В', name: 'Сидоров А.', earned: 145, courses: 4, level: 1 },
  { id: 'Г', name: 'Козлов Р.', earned: 62, courses: 1, level: 1 },
  { id: 'Д', name: 'Морозов К.', earned: 98, courses: 2, level: 1 },
  { id: 'А1', name: 'Волков Д.', earned: 75, courses: 2, level: 2, parent: 'А' },
  { id: 'В1', name: 'Лебедев Н.', earned: 110, courses: 3, level: 2, parent: 'В' },
  { id: 'В2', name: 'Зайцев П.', earned: 88, courses: 2, level: 2, parent: 'В' },
  { id: 'В3', name: 'Новиков С.', earned: 55, courses: 1, level: 2, parent: 'В' },
  { id: 'А1а', name: 'Орлов М.', earned: 40, courses: 1, level: 3, parent: 'А1' },
];

const fmt = (n: number) => Math.abs(Math.round(n)).toLocaleString('ru-RU');

// ─── RECEIPT DOWNLOAD ─────────────────────────────────────────────────────────
function downloadReceipt(tx: Transaction) {
  const statusMap = { done: 'Оплачено', pending: 'В обработке', error: 'Ошибка' };
  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Чек ${tx.ord}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,system-ui,sans-serif;background:#f8f9fb;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}.receipt{background:#fff;border-radius:16px;padding:32px 28px;max-width:380px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.08)}.logo{text-align:center;margin-bottom:24px}.logo-text{font-size:22px;font-weight:800;color:#375DFB;letter-spacing:-0.5px}.logo-sub{font-size:12px;color:#9ca3af;margin-top:2px}.amount{text-align:center;padding:20px 0;border-top:1px dashed #e5e7eb;border-bottom:1px dashed #e5e7eb;margin:16px 0}.amount-num{font-size:40px;font-weight:900;color:${tx.amount < 0 ? '#1a1a2e' : '#1d9e75'};letter-spacing:-1px}.amount-label{font-size:12px;color:#9ca3af;margin-top:4px}.row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f5f5f7;font-size:14px}.row:last-child{border:none}.row-label{color:#9ca3af}.row-value{font-weight:600;color:#111}.status{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:${tx.status === 'done' ? '#e8f8f2' : '#fdecea'};color:${tx.status === 'done' ? '#1d9e75' : '#e53935'}}.cashback{color:#f5a623!important}.footer{text-align:center;margin-top:20px;font-size:11px;color:#c4c4c4}</style></head><body><div class="receipt"><div class="logo"><div class="logo-text">ВОЕВОДА</div><div class="logo-sub">Учебно-тренировочный центр</div></div><div style="font-size:15px;font-weight:700;color:#111;text-align:center;margin-bottom:4px">${tx.title}</div><div style="font-size:12px;color:#9ca3af;text-align:center;margin-bottom:16px">${tx.sub}</div><div class="amount"><div class="amount-num">${tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString('ru-RU')} ₽</div><div class="amount-label">${tx.amount > 0 ? 'Зачислено' : 'Списано'}</div></div><div class="row"><span class="row-label">Дата</span><span class="row-value">${tx.date}</span></div><div class="row"><span class="row-label">Заказ</span><span class="row-value" style="color:#9ca3af;font-size:12px">${tx.ord}</span></div><div class="row"><span class="row-label">Оплата</span><span class="row-value">${tx.card === 'СБП' ? 'СБП' : `Карта •••• ${tx.card}`}</span></div>${tx.cashback > 0 ? `<div class="row"><span class="row-label">Кэшбэк</span><span class="row-value cashback">+${tx.cashback} БР</span></div>` : ''}<div class="row"><span class="row-label">Статус</span><span class="status">${statusMap[tx.status]}</span></div><div class="footer">voevoda.ru · УТЦ Воевода · ${new Date().getFullYear()}</div></div></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `receipt_${tx.ord.replace('#', '')}.html`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const ANIM = `
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes checkDraw{to{stroke-dashoffset:0}}
@keyframes lineFlow{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-20}}
@keyframes cardPop{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
@keyframes balancePulse{0%{transform:scale(1)}40%{transform:scale(1.02)}100%{transform:scale(1)}}
@keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes dotPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
@keyframes emRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes emRotateRev{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
@keyframes emGlowPulse{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.9;transform:scale(1.12)}}
@keyframes emShine{0%,100%{opacity:0;transform:translateX(-20px)}45%{opacity:.6}55%{opacity:.6}100%{opacity:0;transform:translateX(20px)}}
@keyframes emFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px)}}
@keyframes heroParticle{0%{opacity:0;transform:translateY(0) scale(0)}15%{opacity:.9}75%{opacity:.3}100%{opacity:0;transform:translateY(-50px) scale(1.8)}}
@keyframes heroTick{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes heroFadeSlide{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
@keyframes heroOrb2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-25px,15px) scale(1.08)}70%{transform:translate(20px,-30px) scale(0.92)}}
@keyframes heroOrb3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(15px,20px) scale(1.06)}}
@keyframes heroShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes heroCountUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes heroPing{0%{transform:scale(1);opacity:.6}75%,100%{transform:scale(2.4);opacity:0}}
@keyframes heroScan{0%{top:-2px;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:100%;opacity:0}}

.wv-hero-action{display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.1);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .22s;backdrop-filter:blur(4px)}
.wv-hero-action:hover{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.35);transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.2)}
.wv-hero-action:active{transform:scale(.97)}
.wv-hero-pill-dark{padding:6px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:rgba(255,255,255,.9);font-size:12px;font-weight:700;cursor:pointer;transition:all .18s;backdrop-filter:blur(4px)}
.wv-hero-pill-dark:hover{background:rgba(255,255,255,.22);transform:translateY(-1px)}

.wv-mini-card{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fff;cursor:pointer;transition:all .18s}
.wv-mini-card:hover{border-color:#375DFB;box-shadow:0 4px 14px rgba(55,93,251,.12);transform:translateY(-1px)}
.wv-mini-card.selected-card{border-color:#375DFB;background:#f0f4ff;box-shadow:0 0 0 3px rgba(55,93,251,.1)}

.wv-enter{animation:fadeUp .3s ease both}
.wv-btn{transition:all .18s cubic-bezier(.4,0,.2,1);cursor:pointer}
.wv-btn:hover{transform:translateY(-1px)}
.wv-btn:active{transform:scale(.97)}

.wv-tx-row{border-left:4px solid transparent;cursor:pointer;transition:background .15s,padding-left .12s}
.wv-tx-row:hover{background:#f0f4ff;padding-left:4px}
.wv-tx-row.open{background:#f0f4ff}
.wv-tx-detail{max-height:0;overflow:hidden;transition:max-height .28s ease,opacity .22s ease;padding:0 20px 0 56px;opacity:0}
.wv-tx-row.open .wv-tx-detail{max-height:180px;padding:4px 20px 16px 56px;opacity:1}

.wv-stat-card{transition:transform .18s ease,box-shadow .18s ease}
.wv-stat-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(55,93,251,.13)!important}
.wv-card-block{transition:box-shadow .2s,transform .15s}
.wv-card-block:hover{box-shadow:0 6px 24px rgba(0,0,0,.09)!important;transform:translateY(-1px)}

.wv-hero-pill{padding:6px 14px;border-radius:8px;border:1px solid #C7D2FE;background:#F0F4FF;color:#375DFB;font-size:12px;font-weight:700;cursor:pointer;transition:all .18s}
.wv-hero-pill:hover{background:#E0E9FF;transform:translateY(-1px)}

.wv-action-btn{padding:10px 18px;border-radius:8px;border:none;background:#375DFB;color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(55,93,251,.3)}
.wv-action-btn:hover{background:#2d4fd1;transform:translateY(-2px);box-shadow:0 6px 18px rgba(55,93,251,.4)}
.wv-action-btn:active{transform:scale(.97)}

.wv-modal-pm{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;transition:all .15s;margin-bottom:8px}
.wv-modal-pm:hover{border-color:#375DFB;background:#f0f4ff}
.wv-modal-pm.selected{border-color:#375DFB;background:#f0f4ff;box-shadow:0 0 0 3px rgba(55,93,251,.1)}
.wv-modal-pm-dot{width:14px;height:14px;border-radius:50%;border:2px solid #d1d5db;transition:all .15s;flex-shrink:0}
.wv-modal-pm.selected .wv-modal-pm-dot{border-color:#375DFB;background:#375DFB}

.wv-modal-pill{padding:6px 14px;border-radius:20px;border:1px solid #e5e7eb;background:#f9fafb;font-size:13px;cursor:pointer;transition:all .15s;font-weight:500}
.wv-modal-pill:hover{border-color:#375DFB;background:#f0f4ff}
.wv-modal-pill.active{background:#375DFB;color:#fff;border-color:#375DFB}

.wv-filter-chip{padding:5px 12px;border-radius:6px;border:1px solid #e5e7eb;background:none;font-size:12px;font-weight:500;cursor:pointer;color:#6b7280;transition:all .15s}
.wv-filter-chip:hover{border-color:#375DFB;color:#375DFB}
.wv-filter-chip.active{background:#375DFB;color:#fff;border-color:#375DFB}

.wv-month-pill{padding:6px 14px;border-radius:8px;border:none;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
.wv-month-pill:hover{background:#f0f4ff;color:#375DFB}
.wv-month-pill.active{background:#375DFB;color:#fff;box-shadow:0 2px 8px rgba(55,93,251,.3)}

.wv-outline-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:6px;border:1px solid #c7d2fe;background:#f0f4ff;font-size:12px;font-weight:500;cursor:pointer;color:#375DFB;transition:all .15s}
.wv-outline-btn:hover{background:#dbeafe;border-color:#375DFB;transform:translateY(-1px)}
.wv-nav-btn{display:flex;align-items:center;gap:4px;font-size:13px;color:#375DFB;font-weight:600;background:none;border:none;cursor:pointer;transition:all .15s;padding:0}
.wv-nav-btn:hover{color:#2d4fd1;transform:translateX(2px)}
.wv-primary-btn{width:100%;padding:12px 0;border-radius:8px;border:none;background:#375DFB;color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
.wv-primary-btn:not(:disabled):hover{background:#2d4fd1;transform:translateY(-1px);box-shadow:0 4px 14px rgba(55,93,251,.35)}
.wv-primary-btn:not(:disabled):active{transform:scale(.98)}
.wv-primary-btn:disabled{background:#c7d2fe!important;cursor:default}
.wv-back-btn{display:flex;align-items:center;gap:6px;background:none;border:none;font-size:13px;color:#6b7280;cursor:pointer;padding:0;margin-bottom:16px;transition:all .15s}
.wv-back-btn:hover{color:#375DFB;transform:translateX(-3px)}
.wv-user-result{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:all .15s}
.wv-user-result:hover{background:#f0f4ff}
.wv-balance-num{animation:balancePulse .5s ease both;font-variant-numeric:tabular-nums}
.wv-payout-row{display:flex;justify-content:space-between;font-size:12px;padding:4px 6px;margin:0 -6px;transition:background .15s;border-radius:4px}
.wv-payout-row:hover{background:#f8faff}
.wv-right-col{max-height:calc(100vh - 96px);overflow-y:auto;scrollbar-width:thin;scrollbar-color:#e5e7eb transparent}
.wv-right-col::-webkit-scrollbar{width:4px}
.wv-right-col::-webkit-scrollbar-track{background:transparent}
.wv-right-col::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:2px}

/* CARDS */
.wv-cards-container{position:relative;cursor:pointer}
.wv-pay-card{position:absolute;left:0;right:0;border-radius:14px;padding:16px 18px;transition:transform .38s cubic-bezier(.34,1.2,.64,1),box-shadow .3s,opacity .22s;will-change:transform}
.wv-pay-card:hover{filter:brightness(1.06)}
.wv-cards-container:not(.wv-expanded):hover .wv-pay-card:nth-child(2){transform:translateY(var(--hover-offset-2,0)) !important}
.wv-cards-container:not(.wv-expanded):hover .wv-pay-card:nth-child(3){transform:translateY(var(--hover-offset-3,0)) !important}

/* BAR CHART */
.wv-bar-col{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;cursor:pointer;transition:opacity .2s}
.wv-bar-col:hover{opacity:.85}
.wv-bar-segment{width:100%;border-radius:4px;transition:height .5s cubic-bezier(.4,0,.2,1)}

/* MLM */
.mc-tree-bg{background:linear-gradient(135deg,#0f1b2d 0%,#1a2744 50%,#12213a 100%);border-radius:16px;overflow:hidden;position:relative}
.mc-line{stroke-dasharray:6 4;animation:lineFlow 2s linear infinite;transition:stroke .25s,stroke-width .25s}
.mlm-legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.mlm-level-row{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;transition:background .15s;cursor:default}
.mlm-level-row:hover{background:rgba(255,255,255,.06)}
`;

// ─── HERO AREA CHART (full-width) ─────────────────────────────────────────────
function HeroAreaChart() {
  const pathRef = useRef<SVGPathElement>(null);
  const W = 1000, H = 120;
  const data = BALANCE_HISTORY.map(d => d.balance);
  const min = Math.min(...data) * 0.88;
  const max = Math.max(...data) * 1.06;
  const xs = data.map((_, i) => (i / (data.length - 1)) * W);
  const ys = data.map(d => H - ((d - min) / (max - min)) * (H * 0.78) - 10);
  let linePath = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    linePath += ` C ${cx} ${ys[i - 1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  const areaPath = linePath + ` L ${W} ${H} L 0 ${H} Z`;
  useEffect(() => {
    const el = pathRef.current; if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    el.style.transition = 'none';
    requestAnimationFrame(() => setTimeout(() => {
      el.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)';
      el.style.strokeDashoffset = '0';
    }, 200));
  }, []);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="heroLineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,.25)" />
          <stop offset="50%" stopColor="rgba(255,255,255,.8)" />
          <stop offset="100%" stopColor="rgba(245,166,35,.9)" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#heroAreaGrad)" />
      <path ref={pathRef} d={linePath} fill="none" stroke="url(#heroLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((_, i) => (
        <circle key={i} cx={xs[i]} cy={ys[i]}
          r={i === data.length - 1 ? 5.5 : 3.5}
          fill={i === data.length - 1 ? '#f5a623' : 'rgba(255,255,255,.65)'}
          stroke={i === data.length - 1 ? 'rgba(255,255,255,.5)' : 'none'} strokeWidth="2" />
      ))}
      {BALANCE_HISTORY.map((d, i) => (
        <text key={i} x={xs[i]} y={H - 2} textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
          fontFamily="inherit" fontSize="11" fill="rgba(255,255,255,.5)" fontWeight="500">
          {d.month}
        </text>
      ))}
    </svg>
  );
}

// ─── THREE.JS COIN (динамический импорт, не ломает если three не установлен) ─
function Hero3DCoin({ size = 100 }: { size?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
  
    let cleanup: (() => void) | undefined;
  
    import('three').then((THREE) => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 3.2;
  
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);
      // Coin body
      const coinGeo = new THREE.CylinderGeometry(1, 1, 0.14, 64);
      const coinMat = new THREE.MeshStandardMaterial({ color: 0xf5a623, metalness: 0.95, roughness: 0.08 });
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.rotation.x = Math.PI / 8;
      scene.add(coin);
      // Edge glow ring
      const ringGeo = new THREE.TorusGeometry(1.02, 0.04, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 8;
      scene.add(ring);
      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dLight.position.set(2, 4, 3);
      scene.add(dLight);
      const bLight = new THREE.PointLight(0x375DFB, 2, 8);
      bLight.position.set(-2, -2, 2);
      scene.add(bLight);
      const rLight = new THREE.PointLight(0xf5a623, 1.5, 5);
      rLight.position.set(2, 1, 1);
      scene.add(rLight);
      let t = 0, animId: number;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        t += 0.018;
        coin.rotation.y = t;
        ring.rotation.y = t;
        coin.position.y = Math.sin(t * 0.7) * 0.08;
        ring.position.y = Math.sin(t * 0.7) * 0.08;
        renderer.render(scene, camera);
      };
      animate();
      cleanup = () => {
        cancelAnimationFrame(animId);
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    }).catch(() => { /* three not installed, skip */ });
    return () => cleanup?.();
  }, [size]);
  return <div ref={mountRef} style={{ width: size, height: size }} />;
}

// ─── ANIMATED BAR CHART (аналитика) ──────────────────────────────────────────
function StackedBarChart({ months, selectedMonth, onSelect, data }: {
  months: MonthKey[];
  selectedMonth: MonthKey;
  onSelect: (m: MonthKey) => void;
  data: Record<MonthKey, MonthData>;
}) {
  const maxTotal = Math.max(...months.map(m => data[m].total));
  const chartH = 160;
  const categories = [
    { key: 'edu' as const, label: 'Обучение', color: '#375DFB' },
    { key: 'market' as const, label: 'Маркет', color: '#7c3aed' },
    { key: 'kaptorka' as const, label: 'Каптёрка', color: '#f57c00' },
    { key: 'other' as const, label: 'Прочее', color: '#9ca3af' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: chartH, paddingBottom: 2 }}>
        {months.map(month => {
          const md = data[month];
          const total = md.total;
          const isSel = month === selectedMonth;
          const barH = (total / maxTotal) * chartH;
          return (
            <div key={month} className="wv-bar-col" onClick={() => onSelect(month)}
              style={{ opacity: isSel ? 1 : 0.6 }}>
              <div style={{ fontSize: 10, color: isSel ? '#375DFB' : '#9ca3af', fontWeight: isSel ? 700 : 400, marginBottom: 4 }}>
                {isSel ? `${fmt(total)} ₽` : ''}
              </div>
              <div style={{
                width: '100%', height: barH, position: 'relative', borderRadius: '6px 6px 0 0', overflow: 'hidden',
                transition: 'height .5s cubic-bezier(.4,0,.2,1)',
                boxShadow: isSel ? '0 4px 14px rgba(55,93,251,.3)' : 'none',
              }}>
                {md.breakdown.map((cat, ci) => {
                  const h = (cat.value / total) * 100;
                  return (
                    <div key={ci} style={{
                      position: 'absolute', left: 0, right: 0, height: `${h}%`,
                      bottom: `${md.breakdown.slice(0, ci).reduce((s, c) => s + (c.value / total) * 100, 0)}%`,
                      background: cat.color,
                      transition: 'height .5s cubic-bezier(.4,0,.2,1), bottom .5s cubic-bezier(.4,0,.2,1)',
                    }} />
                  );
                })}
              </div>
              <div style={{
                fontSize: 11, fontWeight: isSel ? 700 : 400,
                color: isSel ? '#375DFB' : '#9ca3af', marginTop: 6,
                transition: 'color .2s',
              }}>{month}</div>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
        {categories.map(c => (
          <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DONUT CHART (рабочий, с анимацией через CSS) ────────────────────────────
function AnalyticsDonut({
  data,
  total,
  animKey,
}: {
  data: SpendItem[];
  total: number;
  animKey?: number | string;
}) {
  const R = 60, cx = 76, cy = 76, stroke = 18, circ = 2 * Math.PI * R;
  const [hovered, setHovered] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(t);
  }, [animKey]);
  let offset = 0;
  const segs = data.map((d, i) => {
    const pct = total > 0 ? d.value / total : 0;
    const dash = pct * circ;
    const doff = -(offset * circ) + circ * .25;
    offset += pct;
    return { d, i, pct, dash, doff };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg viewBox={`0 0 152 152`} width="152" height="152" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f0f0f0" strokeWidth={stroke} />
        {segs.map(({ d, i, dash, doff }) => (
          <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={d.color}
            strokeWidth={hovered === i ? stroke + 4 : stroke}
            strokeDasharray={animated ? `${Math.max(dash - 2, 0)} ${circ - Math.max(dash - 2, 0) + 2}` : `0 ${circ}`}
            strokeDashoffset={doff}
            style={{ cursor: 'pointer', transition: 'stroke-dasharray .55s ease, stroke-width .15s' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontFamily="inherit" fontWeight="800" fontSize="14" fill="#111">
          {hovered !== null ? data[hovered].label : fmt(total)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontFamily="inherit" fontSize="11" fill="#9ca3af">
          {hovered !== null ? `${fmt(data[hovered].value)} ₽` : '₽'}
        </text>
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'default', padding: '4px 6px', borderRadius: 6, background: hovered === i ? '#f0f4ff' : 'transparent', transition: 'background .15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>{d.label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{fmt(d.value)} ₽</span>
            </div>
            <div style={{ height: 3, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: d.color, borderRadius: 2,
                width: animated ? `${total > 0 ? (d.value / total) * 100 : 0}%` : '0%',
                transition: 'width .6s cubic-bezier(.4,0,.2,1)',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ANALYTICS BLOCK (полная пересборка) ──────────────────────────────────────
function AnalyticsBlock() {
  const [period, setPeriod] = useState<Period>('month');
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>('Апр');
  const [animKey, setAnimKey] = useState(0);
  const handleSelectMonth = (m: MonthKey) => {
    setSelectedMonth(m);
    setAnimKey(k => k + 1);
  };
  const currentData = MONTHLY_STATS[selectedMonth];
  const quarterData = useMemo(() => {
    const qMonths: MonthKey[] = ['Фев', 'Мар', 'Апр'];
    return {
      total: qMonths.reduce((s, m) => s + MONTHLY_STATS[m].total, 0),
      income: qMonths.reduce((s, m) => s + MONTHLY_STATS[m].income, 0),
      cashback: qMonths.reduce((s, m) => s + MONTHLY_STATS[m].cashback, 0),
      breakdown: [
        { label: 'Обучение', value: qMonths.reduce((s, m) => s + MONTHLY_STATS[m].breakdown[0].value, 0), color: '#375DFB' },
        { label: 'Военмаркет', value: qMonths.reduce((s, m) => s + MONTHLY_STATS[m].breakdown[1].value, 0), color: '#7c3aed' },
        { label: 'Каптёрка', value: qMonths.reduce((s, m) => s + MONTHLY_STATS[m].breakdown[2].value, 0), color: '#f57c00' },
        { label: 'Прочее', value: qMonths.reduce((s, m) => s + MONTHLY_STATS[m].breakdown[3].value, 0), color: '#9ca3af' },
      ],
      balanceTrend: [],
    } as MonthData;
  }, []);
  const yearData = useMemo(() => ({
    total: ALL_MONTHS.reduce((s, m) => s + MONTHLY_STATS[m].total, 0),
    income: ALL_MONTHS.reduce((s, m) => s + MONTHLY_STATS[m].income, 0),
    cashback: ALL_MONTHS.reduce((s, m) => s + MONTHLY_STATS[m].cashback, 0),
    breakdown: [
      { label: 'Обучение', value: ALL_MONTHS.reduce((s, m) => s + MONTHLY_STATS[m].breakdown[0].value, 0), color: '#375DFB' },
      { label: 'Военмаркет', value: ALL_MONTHS.reduce((s, m) => s + MONTHLY_STATS[m].breakdown[1].value, 0), color: '#7c3aed' },
      { label: 'Каптёрка', value: ALL_MONTHS.reduce((s, m) => s + MONTHLY_STATS[m].breakdown[2].value, 0), color: '#f57c00' },
      { label: 'Прочее', value: ALL_MONTHS.reduce((s, m) => s + MONTHLY_STATS[m].breakdown[3].value, 0), color: '#9ca3af' },
    ],
    balanceTrend: [],
  } as MonthData), []);
  const displayData = period === 'month' ? currentData : period === 'quarter' ? quarterData : yearData;
  const displayTotal = displayData.breakdown.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      {/* Header + Period tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Аналитика трат</span>
        <div style={{ display: 'flex', gap: 4, background: '#f5f5f7', borderRadius: 8, padding: 3 }}>
          {([['month', 'Месяц'], ['quarter', 'Квартал'], ['year', 'Год']] as [Period, string][]).map(([p, l]) => (
            <button key={p} onClick={() => { setPeriod(p); setAnimKey(k => k + 1); }}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
                background: period === p ? '#fff' : 'transparent',
                color: period === p ? '#375DFB' : '#6b7280',
                cursor: 'pointer', transition: 'all .2s',
                boxShadow: period === p ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
              }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Month selector (только для period=month) */}
      {period === 'month' && (
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2, marginBottom: 16, scrollbarWidth: 'none' }}>
          {ALL_MONTHS.map(m => (
            <button key={m} className={`wv-month-pill${selectedMonth === m ? ' active' : ''}`}
              style={{ background: selectedMonth === m ? '#375DFB' : '#f5f5f7', color: selectedMonth === m ? '#fff' : '#6b7280' }}
              onClick={() => handleSelectMonth(m)}>{m}</button>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Потрачено', val: displayTotal, color: '#e53935', bg: '#fdecea', suf: ' ₽' },
          { label: 'Пополнено', val: displayData.income, color: '#1d9e75', bg: '#e8f8f2', suf: ' ₽' },
          { label: 'Кэшбэк', val: displayData.cashback, color: '#f5a623', bg: '#fff8ed', suf: ' БР' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '10px 12px', transition: 'transform .15s', cursor: 'default' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 500, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{fmt(s.val)}{s.suf}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>По месяцам</div>
          <StackedBarChart months={ALL_MONTHS} selectedMonth={selectedMonth} onSelect={handleSelectMonth} data={MONTHLY_STATS} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            {period === 'month' ? selectedMonth : period === 'quarter' ? 'Квартал (Фев–Апр)' : 'Весь год'}
          </div>
          <AnalyticsDonut key={animKey} data={displayData.breakdown} total={displayTotal} animKey={animKey} />
        </div>
      </div>
    </div>
  );
}

// ─── TX ICON ──────────────────────────────────────────────────────────────────
function TxIcon({ type }: { type: TxType }) {
  const c = CAT_COLORS[type];
  const icons: Record<TxType, React.ReactNode> = {
    edu: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>,
    income: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>,
    kaptorka: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21 10V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10" /><path d="M23 4H1l2 6h18z" /></svg>,
    bonus: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    market: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>,
    referral: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
    expense: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>,
  };
  return <>{icons[type]}</>;
}

// ─── TX ROW ───────────────────────────────────────────────────────────────────
function TxRow({ tx, isOpen, onToggle }: { tx: Transaction; isOpen: boolean; onToggle: () => void }) {
  const isPos = tx.amount > 0;
  const st = {
    done: { bg: '#e8f8f2', color: '#1d9e75', label: 'Выполнено' },
    pending: { bg: '#fff7ed', color: '#f57c00', label: 'В обработке' },
    error: { bg: '#fdecea', color: '#e53935', label: 'Ошибка' },
  };
  const s = st[tx.status];
  return (
    <div className={`wv-tx-row${isOpen ? ' open' : ''}`} style={{ borderLeftColor: CAT_COLORS[tx.type] }} onClick={onToggle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px 12px 16px' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${CAT_COLORS[tx.type]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TxIcon type={tx.type} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.title}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{tx.sub}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: isPos ? '#1d9e75' : '#111' }}>{isPos ? '+' : '-'}{fmt(tx.amount)} ₽</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{tx.date}</div>
          <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600, marginTop: 3, background: s.bg, color: s.color }}>{s.label}</span>
        </div>
      </div>
      <div className="wv-tx-detail">
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', gap: 6, fontSize: 12 }}><span style={{ color: '#9ca3af', minWidth: 130 }}>Способ оплаты:</span><span style={{ color: '#111' }}>{tx.card === 'СБП' ? 'СБП · Мгновенно' : `Карта •••• ${tx.card}`}</span></div>
          <div style={{ display: 'flex', gap: 6, fontSize: 12 }}><span style={{ color: '#9ca3af', minWidth: 130 }}>Транзакция:</span><span style={{ color: '#9ca3af', fontSize: 11 }}>#TXN-{tx.ord.replace('#ORD-', '')}</span></div>
          {tx.cashback > 0 && <div style={{ display: 'flex', gap: 6, fontSize: 12 }}><span style={{ color: '#9ca3af', minWidth: 130 }}>Кэшбэк:</span><span style={{ color: '#f5a623', fontWeight: 600 }}>+{tx.cashback} БР</span></div>}
          <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
            <button className="wv-outline-btn" onClick={e => { e.stopPropagation(); downloadReceipt(tx); }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Скачать чек
            </button>
            <button className="wv-outline-btn" onClick={e => { e.stopPropagation(); alert(`Операция: ${tx.ord}`); }}
              style={{ background: '#f5f5f7', borderColor: '#e5e7eb', color: '#6b7280' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              Детали
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TxList({ txs, limit, openId, onToggle }: { txs: Transaction[]; limit?: number; openId: number | null; onToggle: (id: number) => void }) {
  const list = limit ? txs.slice(0, limit) : txs;
  const groups: Record<string, Transaction[]> = {};
  list.forEach(tx => { if (!groups[tx.group]) groups[tx.group] = []; groups[tx.group].push(tx); });
  return <>{Object.entries(groups).map(([grp, rows]) => (
    <div key={grp}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 20px', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.8px', fontWeight: 500 }}>
        {grp}<div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
      </div>
      {rows.map(tx => <TxRow key={tx.id} tx={tx} isOpen={openId === tx.id} onToggle={() => onToggle(tx.id)} />)}
    </div>
  ))}</>;
}

// ─── MLM TREE (улучшенный с легендой и объяснением) ──────────────────────────
const MC_LAYOUT: Record<string, { x: number; y: number }> = {
  you: { x: 370, y: 195 }, А: { x: 180, y: 85 }, Б: { x: 285, y: 60 },
  В: { x: 480, y: 60 }, Г: { x: 575, y: 115 }, Д: { x: 610, y: 220 },
  А1: { x: 70, y: 185 }, В1: { x: 375, y: -10 }, В2: { x: 505, y: -10 },
  В3: { x: 625, y: 25 }, 'А1а': { x: 50, y: 295 },
};
const LEVEL_COLORS: Record<number, string> = { 0: '#f5a623', 1: '#60a5fa', 2: '#34d399', 3: '#a78bfa' };
const LEVEL_PCT = ['', '3%', '4%', '5%'];
const NODE_R_MAP: Record<string, number> = { you: 26 };
function nodeR(id: string) {
  if (NODE_R_MAP[id]) return NODE_R_MAP[id];
  const node = MLM_NODES.find(n => n.id === id);
  return node?.level === 1 ? 19 : node?.level === 2 ? 15 : 13;
}

function ImprovedMLMTree({ onCopyRef, copyDone }: { onCopyRef: () => void; copyDone: boolean }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, vpx: 0, vpy: 0 });
  const vpRef = useRef(viewport);
  useEffect(() => { vpRef.current = viewport; }, [viewport]);
  const clampS = (s: number) => Math.min(2.8, Math.max(0.35, s));
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
      const f = e.deltaY < 0 ? 1.12 : 0.88;
      setViewport(v => { const ns = clampS(v.scale * f), sf = ns / v.scale; return { x: cx - (cx - v.x) * sf, y: cy - (cy - v.y) * sf, scale: ns }; });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);
  const onMD = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) return;
    e.preventDefault();
    const vp = vpRef.current;
    isPanning.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, vpx: vp.x, vpy: vp.y };
    const onMove = (me: MouseEvent) => { if (!isPanning.current) return; setViewport(v => ({ ...v, x: dragStart.current.vpx + (me.clientX - dragStart.current.x), y: dragStart.current.vpy + (me.clientY - dragStart.current.y) })); };
    const onUp = () => { isPanning.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const allNodes = [{ id: 'you', name: 'Торнадо', earned: 1240, courses: 3, level: 0 }, ...MLM_NODES];
  const edges: [string, string][] = [['you', 'А'], ['you', 'Б'], ['you', 'В'], ['you', 'Г'], ['you', 'Д'], ['А', 'А1'], ['В', 'В1'], ['В', 'В2'], ['В', 'В3'], ['А1', 'А1а']];
  const activeEdges = new Set(edges.filter(([a, b]) => a === hovered || b === hovered || a === selected || b === selected).map(([a, b]) => `${a}-${b}`));
  const hoveredNode = hovered ? allNodes.find(n => n.id === hovered) : null;
  const selectedNode = selected ? allNodes.find(n => n.id === selected) : null;
  const totalEarned = MLM_NODES.reduce((s, n) => s + n.earned, 0);

  return (
    <div>
      {/* Explanation banner */}
      <div style={{ background: 'linear-gradient(135deg,#f0f4ff,#e0e7ff)', border: '1px solid #c7d2fe', borderRadius: 10, padding: '12px 16px', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', marginBottom: 4 }}>
              Как работает реферальная программа?
            </div>
            <div style={{ fontSize: 12, color: '#4f46e5', lineHeight: 1.5 }}>
              Вы приглашаете бойцов → они проходят курсы → вы получаете % от их покупок
            </div>
          </div>
          <button onClick={() => setShowInfo(p => !p)} style={{ flexShrink: 0, background: 'rgba(55,93,251,.12)', border: '1px solid rgba(55,93,251,.25)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#375DFB', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {showInfo ? 'Скрыть' : 'Подробнее'}
          </button>
        </div>
        {showInfo && (
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, animation: 'fadeUp .2s ease both' }}>
            {[
              { level: 1, pct: '3%', desc: 'Прямые рефералы (уровень 1)', color: '#60a5fa', example: '+85 ₽ за курс 2800₽' },
              { level: 2, pct: '4%', desc: 'Рефералы ваших рефералов (уровень 2)', color: '#34d399', example: '+112 ₽ за курс 2800₽' },
              { level: 3, pct: '5%', desc: 'Третий уровень глубины', color: '#a78bfa', example: '+140 ₽ за курс 2800₽' },
            ].map(l => (
              <div key={l.level} style={{ background: `${l.color}18`, border: `1px solid ${l.color}40`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: l.color }}>{l.pct}</span>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>· Ур.{l.level}</span>
                </div>
                <div style={{ fontSize: 11, color: '#374151', marginBottom: 2 }}>{l.desc}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>Пример: {l.example}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: '#e5e7eb' }}>
        {[
          { label: 'Ур.1 · 3%', val: '+8 бойцов', amount: '320 ₽', c: '#60a5fa' },
          { label: 'Ур.2 · 4%', val: '+3 бойца', amount: '680 ₽', c: '#34d399' },
          { label: 'Ур.3 · 5%', val: '+1 боец', amount: '240 ₽', c: '#a78bfa' },
          { label: 'Итого апрель', val: '12 рефералов', amount: `+${fmt(totalEarned)} ₽`, c: '#f5a623' },
        ].map(m => (
          <div key={m.label} style={{ background: '#fff', padding: '10px 14px', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f8faff')} onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.c }} />
              <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{m.label}</span>
            </div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>{m.val}</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: m.c }}>{m.amount}</div>
          </div>
        ))}
      </div>

      {/* Tree legend */}
      <div style={{ background: '#1a2744', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'monospace' }}>ЛЕГЕНДА:</span>
        {[
          { label: 'Вы', color: '#f5a623', ring: true },
          { label: 'Уровень 1 · 3%', color: '#60a5fa' },
          { label: 'Уровень 2 · 4%', color: '#34d399' },
          { label: 'Уровень 3 · 5%', color: '#a78bfa' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0, boxShadow: l.ring ? '0 0 6px rgba(245,166,35,.6)' : 'none' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.6)' }}>{l.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: 'monospace' }}>
          КЛИК — детали · ПКМ/колесо — навигация
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="mc-tree-bg" style={{ height: 320, position: 'relative', overflow: 'hidden', userSelect: 'none', cursor: 'default' }}
        onMouseDown={onMD} onContextMenu={e => e.preventDefault()}>
        <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 20 }}>
          {[{ l: '+', f: 1.15 }, { l: '−', f: 0.87 }].map(b => (
            <button key={b.l} onClick={() => setViewport(v => ({ ...v, scale: clampS(v.scale * b.f) }))}
              style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(8,16,30,.85)', color: 'rgba(255,255,255,.6)', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,.2)'; e.currentTarget.style.color = '#f5a623'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(8,16,30,.85)'; e.currentTarget.style.color = 'rgba(255,255,255,.6)'; }}>
              {b.l}
            </button>
          ))}
          <button onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}
            style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(8,16,30,.85)', color: 'rgba(255,255,255,.6)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,.2)'; e.currentTarget.style.color = '#f5a623'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(8,16,30,.85)'; e.currentTarget.style.color = 'rgba(255,255,255,.6)'; }}>⌂</button>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,.25)', textAlign: 'center', fontFamily: 'monospace' }}>{Math.round(viewport.scale * 100)}%</div>
        </div>

        <svg viewBox="0 0 720 320" width="100%" height="320"
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', transform: `translate(${viewport.x}px,${viewport.y}px) scale(${viewport.scale})`, transformOrigin: '0 0' }}>
          {edges.map(([from, to]) => {
            const f = MC_LAYOUT[from], t = MC_LAYOUT[to];
            const fr = nodeR(from), tr = nodeR(to);
            const key = `${from}-${to}`;
            const active = activeEdges.has(key);
            const sel = selected === from || selected === to;
            return (<line key={key} x1={f.x + fr} y1={f.y + fr} x2={t.x + tr} y2={t.y + tr}
              stroke={sel ? '#f5a623' : active ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.12)'}
              strokeWidth={sel ? 2.5 : active ? 1.8 : 1.2} strokeLinecap="round"
              strokeDasharray={sel ? 'none' : '5 4'} className={sel ? undefined : 'mc-line'}
              style={{ transition: 'stroke .2s,stroke-width .2s' }} />);
          })}
          {allNodes.map(node => {
            const p = MC_LAYOUT[node.id] || { x: 0, y: 0 };
            const r = nodeR(node.id);
            const isYou = node.id === 'you';
            const isHov = hovered === node.id;
            const isSel = selected === node.id;
            const lc = LEVEL_COLORS[node.level];
            const gf = isHov || isSel ? `brightness(1.5) drop-shadow(0 0 ${isSel ? 12 : 7}px ${lc})` : isYou ? 'drop-shadow(0 0 6px rgba(245,166,35,.35))' : 'none';
            return (
              <g key={node.id}>
                <circle cx={p.x + r} cy={p.y + r} r={r + 18} fill="transparent" style={{ cursor: 'pointer' }}
                  onMouseEnter={e => {
                    setHovered(node.id);
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) setTipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }}
                  onMouseMove={e => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) setTipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(prev => prev === node.id ? null : node.id)} />
                <g style={{ transition: 'filter .18s', filter: gf, pointerEvents: 'none' }}>
                  <circle cx={p.x + r} cy={p.y + r} r={r + 5} fill="rgba(0,0,0,.4)"
                    stroke={isSel ? lc : 'rgba(255,255,255,.06)'} strokeWidth={isSel ? 2.5 : 1} />
                  <circle cx={p.x + r} cy={p.y + r} r={r}
                    fill={isYou ? '#1a2744' : 'rgba(10,20,44,.92)'}
                    stroke={isYou ? '#f5a623' : lc} strokeWidth={isYou ? 2.5 : 1.8} />
                  <text x={p.x + r} y={p.y + r + (isYou ? 5 : 4)} textAnchor="middle"
                    fill={isYou ? '#f5a623' : isHov || isSel ? '#fff' : lc}
                    fontSize={isYou ? 11 : r < 15 ? 7 : 9} fontWeight="700" fontFamily="monospace">
                    {node.id === 'you' ? 'ТР' : node.id.substring(0, 2)}
                  </text>
                  {!isYou && node.earned > 0 && (
                    <g transform={`translate(${p.x + r * 2 - 4},${p.y - 8})`}>
                      <rect x="0" y="0" width="36" height="14" rx="7" fill={isSel ? lc : '#1d9e75'} opacity=".92" />
                      <text x="18" y="10" textAnchor="middle" fill="#fff" fontSize="7.5" fontWeight="700" fontFamily="monospace">+{node.earned}₽</text>
                    </g>
                  )}
                  {/* Level badge */}
                  {!isYou && (
                    <g transform={`translate(${p.x - 4},${p.y - 4})`}>
                      <circle cx="0" cy="0" r="7" fill={lc} opacity=".9" />
                      <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="800" fontFamily="monospace">{node.level}</text>
                    </g>
                  )}
                  {isSel && <circle cx={p.x + r} cy={p.y + r} r={r + 11} fill="none" stroke={lc} strokeWidth="1.5" opacity=".3" strokeDasharray="4 3" />}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Tooltip — position:absolute relative to container, flips up if near bottom */}
        {hoveredNode && !selected && (
          <div style={{
            position: 'absolute',
            left: Math.min(tipPos.x + 14, 560),
            top: tipPos.y > 240 ? tipPos.y - 62 : tipPos.y + 14,
            background: 'rgba(6,14,28,.97)',
            border: `1px solid ${LEVEL_COLORS[hoveredNode.level]}60`,
            borderRadius: 10,
            padding: '9px 14px',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'fadeIn .12s ease',
            boxShadow: `0 6px 24px rgba(0,0,0,.6), 0 0 0 1px ${LEVEL_COLORS[hoveredNode.level]}20`,
            minWidth: 180,
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: LEVEL_COLORS[hoveredNode.level], marginBottom: 4 }}>{hoveredNode.name}</div>
            {hoveredNode.id !== 'you' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>Уровень {hoveredNode.level} · {LEVEL_PCT[hoveredNode.level]}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>+{hoveredNode.earned} ₽</span>
                  <span style={{ color: 'rgba(255,255,255,.4)' }}>{hoveredNode.courses} курс.</span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Вы · Центральный узел</div>
            )}
          </div>
        )}

        {/* Detail panel */}
        {selectedNode && (
          <div key={selectedNode.id} style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(6,14,28,.97)', border: `1px solid ${LEVEL_COLORS[selectedNode.level]}40`, borderRadius: 12, padding: '14px 16px', minWidth: 220, animation: 'cardPop .18s ease both', boxShadow: '0 8px 32px rgba(0,0,0,.6)', zIndex: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${LEVEL_COLORS[selectedNode.level]}18`, border: `2px solid ${LEVEL_COLORS[selectedNode.level]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: LEVEL_COLORS[selectedNode.level], fontFamily: 'monospace' }}>
                {selectedNode.id === 'you' ? 'ТР' : selectedNode.id.substring(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{selectedNode.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>
                  {selectedNode.id === 'you' ? 'Вы · Центральный узел' : `Уровень ${selectedNode.level} · ${LEVEL_PCT[selectedNode.level]}`}
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 16, color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.4)'; }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { label: 'Заработано', val: `${fmt(selectedNode.earned)} ₽`, c: '#34d399' },
                { label: 'Курсов', val: String(selectedNode.courses), c: '#60a5fa' },
                { label: 'Реф. %', val: selectedNode.level === 0 ? '—' : LEVEL_PCT[selectedNode.level], c: '#f5a623' },
                { label: 'Статус', val: 'Активен', c: '#34d399' },
              ].map(row => (
                <div key={row.label} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 7, padding: '7px 10px', transition: 'background .14s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.04)')}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.28)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: .5 }}>{row.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: row.c }}>{row.val}</div>
                </div>
              ))}
            </div>
            {selectedNode.id !== 'you' && (
              <button className="wv-btn" onClick={() => navigate('/messages?chat=7')} style={{ width: '100%', marginTop: 10, padding: '8px 0', background: 'rgba(55,93,251,.15)', border: '1px solid rgba(55,93,251,.35)', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                Написать бойцу
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '14px 20px', display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: '1px solid #e5e7eb', alignItems: 'center' }}>
        <button className="wv-btn" onClick={onCopyRef}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: copyDone ? '#1d9e75' : '#375DFB', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, boxShadow: '0 2px 8px rgba(55,93,251,.3)' }}>
          {copyDone
            ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Скопировано!</>
            : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>Скопировать реф-ссылку</>}
        </button>
        <button className="wv-btn" onClick={onCopyRef} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#fff8ed', color: '#c47d0e', border: '1.5px solid #f5a623', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12v10H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></svg>
          Пригласи — получи рюкзак
        </button>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', animation: 'dotPulse 2s ease infinite' }} />
          Кликните на боёц в дереве
        </div>
      </div>
    </div>
  );
}

// ─── CARDS WIDGET (2×2 grid of real mini cards) ──────────────────────────────
function CardsWidget({ onAddCard }: { onAddCard: () => void }) {
  const [cards] = useState<PayCard[]>(INIT_CARDS);
  const [selectedCard, setSelectedCard] = useState('c1');

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Мои карты</span>
        <button className="wv-btn" onClick={onAddCard} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#375DFB', background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 6, padding: '5px 10px', fontWeight: 600 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Добавить
        </button>
      </div>

      {/* Cards list — single column */}
      <div style={{ padding: '14px 14px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cards.map((card) => {
          const isSelected = selectedCard === card.id;
          return (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card.id)}
              style={{
                background: card.bg,
                borderRadius: 14,
                padding: '16px 20px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isSelected
                  ? '0 8px 24px rgba(0,0,0,.18), 0 0 0 3px rgba(255,255,255,.9), 0 0 0 5px rgba(55,93,251,.4)'
                  : '0 4px 12px rgba(0,0,0,.1)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all .22s cubic-bezier(.34,1.2,.64,1)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -28, right: -28, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.12)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -20, right: 80, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,.08)', pointerEvents: 'none' }} />

              {/* SIM chip */}
              <svg width="26" height="20" viewBox="0 0 22 17" fill="none" style={{ flexShrink: 0, position: 'relative' }}>
                <rect width="22" height="17" rx="3" fill="rgba(255,255,255,.55)" />
                <rect x="1" y="6" width="20" height="5" fill="rgba(255,255,255,.3)" />
                <line x1="7" y1="0" x2="7" y2="17" stroke="rgba(255,255,255,.3)" strokeWidth="1" />
                <line x1="15" y1="0" x2="15" y2="17" stroke="rgba(255,255,255,.3)" strokeWidth="1" />
              </svg>

              {/* Card number + bank */}
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,.95)', letterSpacing: card.type === 'sbp' ? 0 : 2, marginBottom: 3 }}>
                  {card.type === 'sbp' ? 'Система быстрых платежей' : `•••• •••• •••• ${card.num}`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', fontWeight: 600 }}>{card.bank}</span>
                  {card.exp && <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>до {card.exp}</span>}
                  {card.type === 'sbp' && <span style={{ background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>−20% на курсы</span>}
                </div>
              </div>

              {/* Right: type label + checkmark */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0, position: 'relative' }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,.85)', letterSpacing: card.type === 'visa' ? -.3 : 0, fontStyle: card.type === 'visa' ? 'italic' : 'normal' }}>
                  {card.logo}
                </span>
                {isSelected ? (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                ) : (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)' }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add card row */}
      <div style={{ padding: '0 14px 14px' }}>
        <button className="wv-btn" onClick={onAddCard}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: '1.5px dashed #d1d5db', borderRadius: 10, background: 'transparent', cursor: 'pointer', color: '#9ca3af', fontSize: 12, fontWeight: 600, transition: 'all .18s' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#375DFB'; el.style.color = '#375DFB'; el.style.background = '#f0f4ff'; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#d1d5db'; el.style.color = '#9ca3af'; el.style.background = 'transparent'; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Добавить карту или счёт
        </button>
      </div>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h); document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, animation: 'fadeIn .18s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.28)', animation: 'fadeUp .2s ease both' }}>
        {children}
      </div>
    </div>
  );
}
function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{title}</span>
      <button className="wv-btn" onClick={onClose} style={{ background: '#f3f4f6', border: 'none', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 18 }}>×</button>
    </div>
  );
}

function TopupModal({ onClose }: { onClose: () => void }) {
  const [amt, setAmt] = useState(0); const [pm, setPm] = useState(0);
  const [email, setEmail] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');

  const handleTopup = async () => {
    setError('');
    if (!amt) return;
    if (!email.trim()) {
      setError('Укажите электронную почту для оплаты и чека.');
      return;
    }

    setIsPaying(true);
    try {
      const payment = await createWalletTopupPayment({
        amount: amt,
        email,
        return_url: `${window.location.origin}/wallet`,
      });
      if (!payment.confirmation_url) {
        throw new Error('Missing confirmation_url');
      }
      window.location.href = payment.confirmation_url;
    } catch {
      setError('Не удалось создать платеж в ЮKassa. Проверьте ключи и попробуйте еще раз.');
      setIsPaying(false);
    }
  };

  return (
    <div>
      <ModalHeader title="Пополнить баланс" onClose={onClose} />
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Сумма, ₽</div>
        <input type="number" value={amt || ''} placeholder="0" onChange={e => setAmt(+e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 24, fontWeight: 800, outline: 'none', boxSizing: 'border-box', transition: 'border .15s,box-shadow .15s' }}
          onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.boxShadow = '0 0 0 3px rgba(55,93,251,.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {[1000, 3000, 5000, 10000].map(a => <button key={a} className={`wv-modal-pill${amt === a ? ' active' : ''}`} onClick={() => setAmt(a)}>{fmt(a)}</button>)}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '16px 0 8px' }}>Электронная почта для оплаты</div>
        <input type="email" value={email} placeholder="pochta@example.ru" onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border .15s,box-shadow .15s' }}
          onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.boxShadow = '0 0 0 3px rgba(55,93,251,.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '16px 0 8px' }}>Способ оплаты</div>
        {[{ label: 'ЮKassa', sub: 'Карта, СБП и другие способы на стороне ЮKassa', bg: 'linear-gradient(135deg,#375DFB,#1e3a8a)' }].map((c, i) => (
          <div key={i} className={`wv-modal-pm${pm === i ? ' selected' : ''}`} onClick={() => setPm(i)}>
            <div className="wv-modal-pm-dot" /><div style={{ width: 36, height: 22, borderRadius: 4, background: c.bg, flexShrink: 0 }} />
            <div><div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{c.label}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{c.sub}</div></div>
          </div>
        ))}
        {error && <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: '#FEF2F2', color: '#B91C1C', fontSize: 12 }}>{error}</div>}
        <button className="wv-primary-btn" disabled={!amt || isPaying} onClick={handleTopup} style={{ marginTop: 16 }}>
          {isPaying ? 'Создаем платеж...' : amt ? `Пополнить через ЮKassa ${fmt(amt)} ₽` : 'Введите сумму'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 10, fontSize: 11, color: '#9ca3af' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
          Безопасная оплата · ЮKassa
        </div>
      </div>
    </div>
  );
}

function WithdrawModal({ balance, onClose, onConfirm }: { balance: number; onClose: () => void; onConfirm: (n: number) => void }) {
  const [amt, setAmt] = useState(0); const [wm, setWm] = useState(0);
  return (
    <div>
      <ModalHeader title="Вывести средства" onClose={onClose} />
      <div style={{ padding: '16px 20px' }}>
        <div style={{ background: '#f0f4ff', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#6b7280', border: '1px solid #c7d2fe' }}>Доступно: <strong style={{ color: '#375DFB' }}>{fmt(balance)} ₽</strong></div>
        <input type="number" value={amt || ''} placeholder="0" max={balance} onChange={e => setAmt(Math.min(+e.target.value, balance))}
          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 24, fontWeight: 800, outline: 'none', boxSizing: 'border-box', transition: 'border .15s,box-shadow .15s' }}
          onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.boxShadow = '0 0 0 3px rgba(55,93,251,.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {[500, 1000, 5000].map(a => <button key={a} className={`wv-modal-pill${amt === a ? ' active' : ''}`} onClick={() => setAmt(a)}>{fmt(a)}</button>)}
          <button className={`wv-modal-pill${amt === balance ? ' active' : ''}`} onClick={() => setAmt(balance)}>Всё</button>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '14px 0 8px' }}>Способ вывода</div>
        {[{ label: 'На карту •••• 4242', sub: 'Тинькофф Visa' }, { label: 'На карту •••• 8877', sub: 'Сбербанк МИР' }, { label: 'На расчётный счёт', sub: 'Банковский перевод' }].map((c, i) => (
          <div key={i} className={`wv-modal-pm${wm === i ? ' selected' : ''}`} onClick={() => setWm(i)}>
            <div className="wv-modal-pm-dot" /><div><div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{c.label}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{c.sub}</div></div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af', margin: '10px 0' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          Срок зачисления: 1–3 рабочих дня
        </div>
        <button className="wv-primary-btn" disabled={!amt} onClick={() => onConfirm(amt)}>{amt ? `Вывести ${fmt(amt)} ₽` : 'Введите сумму'}</button>
      </div>
    </div>
  );
}

function TransferModal({ onClose, onConfirm }: { balance: number; onClose: () => void; onConfirm: (n: number) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [query, setQuery] = useState(''); const [user, setUser] = useState<MockUser | null>(null); const [amt, setAmt] = useState(0);
  const results = query.length >= 2 ? MOCK_USERS.filter(u => u.name.toLowerCase().includes(query.toLowerCase())) : [];
  if (step === 3) return (
    <div>
      <ModalHeader title="Готово!" onClose={onClose} />
      <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8f8f2', border: '2px solid #1d9e75', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Перевод выполнен!</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{fmt(amt)} ₽ → {user?.name}</div>
        <button className="wv-primary-btn" style={{ maxWidth: 200 }} onClick={() => onConfirm(amt)}>Готово</button>
      </div>
    </div>
  );
  if (step === 2 && user) return (
    <div>
      <ModalHeader title="Перевести бойцу" onClose={onClose} />
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f0f4ff', borderRadius: 8, marginBottom: 16, border: '1px solid #c7d2fe' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#375DFB,#2d4fd1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>{user.init}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{user.name}</div><div style={{ fontSize: 12, color: '#9ca3af' }}>{user.sub}</div></div>
          <button onClick={() => { setUser(null); setStep(1); }} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, color: '#375DFB', cursor: 'pointer', fontWeight: 500, padding: '4px 10px' }}>Изменить</button>
        </div>
        <input type="number" value={amt || ''} placeholder="0" onChange={e => setAmt(+e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 24, fontWeight: 800, outline: 'none', boxSizing: 'border-box', transition: 'border .15s,box-shadow .15s', marginBottom: 10 }}
          onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.boxShadow = '0 0 0 3px rgba(55,93,251,.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>{[100, 500, 1000].map(a => <button key={a} className={`wv-modal-pill${amt === a ? ' active' : ''}`} onClick={() => setAmt(a)}>{fmt(a)}</button>)}</div>
        <button className="wv-primary-btn" disabled={!amt} onClick={() => { if (amt) setStep(3); }}>{amt ? `Перевести ${fmt(amt)} ₽` : 'Введите сумму'}</button>
      </div>
    </div>
  );
  return (
    <div>
      <ModalHeader title="Перевести бойцу" onClose={onClose} />
      <div style={{ padding: '16px 20px' }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Позывной бойца..."
            style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border .15s,box-shadow .15s' }}
            onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.boxShadow = '0 0 0 3px rgba(55,93,251,.1)'; }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
        </div>
        {results.map(u => (
          <div key={u.name} className="wv-user-result" onClick={() => { setUser(u); setStep(2); }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#375DFB,#2d4fd1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>{u.init}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{u.name}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{u.sub}</div></div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        ))}
        {query.length >= 2 && !results.length && <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Боец не найден</div>}
      </div>
    </div>
  );
}

function AddCardModal({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [num, setNum] = useState(''); const [bank, setBank] = useState(''); const [exp, setExp] = useState(''); const [type, setType] = useState<'visa' | 'mir'>('visa');
  const BG = { visa: 'linear-gradient(135deg,#375DFB,#7c3aed)', mir: 'linear-gradient(135deg,#1d9e75,#065f46)' };
  return (
    <div>
      <ModalHeader title="Добавить карту" onClose={onClose} />
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['visa', 'mir'] as const).map(t => (
            <button key={t} className="wv-btn" onClick={() => setType(t)} style={{ flex: 1, padding: '10px 0', border: `2px solid ${type === t ? '#375DFB' : '#e5e7eb'}`, borderRadius: 8, background: type === t ? '#f0f4ff' : '#fff', fontWeight: 700, fontSize: 13, color: type === t ? '#375DFB' : '#9ca3af', cursor: 'pointer' }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        {[{ label: 'Последние 4 цифры', val: num, set: setNum, ph: '4242', max: 4 }, { label: 'Банк', val: bank, set: setBank, ph: 'Тинькофф', max: 30 }, { label: 'Срок действия', val: exp, set: setExp, ph: '12/26', max: 5 }].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{f.label}</div>
            <input value={f.val} onChange={e => f.set(e.target.value.slice(0, f.max))} placeholder={f.ph}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border .15s,box-shadow .15s' }}
              onFocus={e => { e.target.style.borderColor = '#375DFB'; e.target.style.boxShadow = '0 0 0 3px rgba(55,93,251,.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
          </div>
        ))}
        <div style={{ height: 64, background: BG[type], borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', marginBottom: 16 }}>
          <span style={{ fontSize: 15, color: 'rgba(255,255,255,.85)', letterSpacing: 2.5, fontWeight: 600 }}>{num ? `•••• ${num}` : '•••• ????'}</span>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 800 }}>{type.toUpperCase()}</span>
        </div>
        <button className="wv-primary-btn wv-btn" disabled={!num || !bank || !exp}
          onClick={() => { if (num && bank && exp) onAdd(); }}>Добавить карту</button>
      </div>
    </div>
  );
}

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={`wv-card-block${className ? ' ' + className : ''}`} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', ...style }}>{children}</div>;
}

// ─── PROGRESS RING ────────────────────────────────────────────────────────────
function ProgressRing({ size, strokeW, value, max, color, trackColor, valueLabel, sublabel }: { size: number; strokeW: number; value: number; max: number; color: string; trackColor: string; valueLabel: string; sublabel: string }) {
  const progRef = useRef<SVGCircleElement>(null);
  const R = (size - strokeW) / 2, circ = 2 * Math.PI * R, pct = Math.min(value / max, 1), cx = size / 2, cy = size / 2;
  useEffect(() => {
    const el = progRef.current; if (!el) return;
    el.style.strokeDashoffset = String(circ);
    setTimeout(() => { el.style.transition = 'stroke-dashoffset .9s cubic-bezier(0.34,1.2,0.64,1)'; el.style.strokeDashoffset = String(circ - pct * circ); }, 120);
  }, [circ, pct]);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={trackColor} strokeWidth={strokeW} />
      <circle ref={progRef} cx={cx} cy={cy} r={R} fill="none" stroke={color} strokeWidth={strokeW} strokeDasharray={circ} strokeDashoffset={circ} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 5} textAnchor="middle" fontFamily="inherit" fontWeight="700" fontSize="12" fill={color}>{valueLabel}</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontFamily="inherit" fontSize="9" fill="#9ca3af">{sublabel}</text>
    </svg>
  );
}

// ─── HERO PARTICLES ───────────────────────────────────────────────────────────
const PARTICLES = [
  { x: 8,  y: 72, s: 4,  delay: 0,   dur: 5,   type: 'dot',  color: 'rgba(245,166,35,.7)' },
  { x: 22, y: 60, s: 3,  delay: 1.2, dur: 4.5, type: 'ring', color: 'rgba(99,133,255,.5)' },
  { x: 38, y: 80, s: 5,  delay: 0.5, dur: 6,   type: 'dot',  color: 'rgba(255,255,255,.4)' },
  { x: 55, y: 68, s: 3,  delay: 2.1, dur: 4,   type: 'star', color: 'rgba(245,166,35,.6)' },
  { x: 68, y: 75, s: 4,  delay: 0.8, dur: 5.5, type: 'dot',  color: 'rgba(139,92,246,.5)' },
  { x: 80, y: 55, s: 3,  delay: 1.7, dur: 4.2, type: 'ring', color: 'rgba(255,255,255,.35)' },
  { x: 90, y: 70, s: 5,  delay: 0.3, dur: 5,   type: 'dot',  color: 'rgba(99,133,255,.4)' },
  { x: 14, y: 45, s: 3,  delay: 3,   dur: 4.8, type: 'star', color: 'rgba(245,166,35,.5)' },
  { x: 48, y: 52, s: 2,  delay: 1.4, dur: 3.8, type: 'dot',  color: 'rgba(255,255,255,.3)' },
  { x: 72, y: 40, s: 4,  delay: 2.6, dur: 6.2, type: 'ring', color: 'rgba(139,92,246,.4)' },
];
function HeroParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1, borderRadius: 24 }}>
      {PARTICLES.map((p, i) => (
        p.type === 'star'
          ? <svg key={i} width={p.s * 3} height={p.s * 3} viewBox="0 0 10 10"
              style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, animation: `heroParticle ${p.dur}s ${p.delay}s ease-out infinite` }}>
              <polygon points="5,0 6.2,3.8 10,3.8 7,6.2 8.1,10 5,7.6 1.9,10 3,6.2 0,3.8 3.8,3.8" fill={p.color} />
            </svg>
          : p.type === 'ring'
          ? <div key={i} style={{
              position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
              width: p.s * 2.5, height: p.s * 2.5, borderRadius: '50%',
              border: `1.5px solid ${p.color}`,
              animation: `heroParticle ${p.dur}s ${p.delay}s ease-out infinite`,
            }} />
          : <div key={i} style={{
              position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
              width: p.s, height: p.s, borderRadius: '50%',
              background: p.color,
              animation: `heroParticle ${p.dur}s ${p.delay}s ease-out infinite`,
            }} />
      ))}
    </div>
  );
}

// ─── HERO EMBLEM (animated gold coin) ─────────────────────────────────────────
function HeroEmblem() {
  const ticks = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div style={{ width: 110, height: 110, animation: 'emFloat 4s ease-in-out infinite' }}>
      <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="emGold" cx="38%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#fff7cd" />
            <stop offset="25%"  stopColor="#fcd34d" />
            <stop offset="60%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>
          <radialGradient id="emGoldInner" cx="42%" cy="35%" r="65%">
            <stop offset="0%"   stopColor="#fef9c3" />
            <stop offset="50%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
          <radialGradient id="emGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="70%"  stopColor="#f59e0b" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <filter id="emBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Glow behind coin */}
        <circle cx="55" cy="55" r="52" fill="url(#emGlow)"
          style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'emGlowPulse 3s ease-in-out infinite' }} />

        {/* Outer tick ring — rotates */}
        <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'emRotate 10s linear infinite' }}>
          {ticks.map((_, i) => {
            const angle = (i / ticks.length) * Math.PI * 2 - Math.PI / 2;
            const isMajor = i % 5 === 0;
            const r1 = 44, r2 = isMajor ? 50 : 47;
            return (
              <line key={i}
                x1={55 + r1 * Math.cos(angle)} y1={55 + r1 * Math.sin(angle)}
                x2={55 + r2 * Math.cos(angle)} y2={55 + r2 * Math.sin(angle)}
                stroke={isMajor ? 'rgba(251,191,36,.9)' : 'rgba(251,191,36,.4)'}
                strokeWidth={isMajor ? 2.5 : 1.5} strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Counter-rotating dashed ring */}
        <circle cx="55" cy="55" r="42"
          stroke="rgba(245,166,35,.35)" strokeWidth="1.5" strokeDasharray="4 7" fill="none"
          style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'emRotateRev 15s linear infinite' }} />

        {/* Coin shadow/depth */}
        <circle cx="57" cy="57" r="34" fill="rgba(0,0,0,.25)" filter="url(#emBlur)" />

        {/* Coin body */}
        <circle cx="55" cy="55" r="34" fill="url(#emGold)" />

        {/* Coin rim (edge detail) */}
        <circle cx="55" cy="55" r="34" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" fill="none" />

        {/* Inner engraving ring */}
        <circle cx="55" cy="55" r="27" stroke="rgba(255,255,255,.15)" strokeWidth="1" fill="none" />

        {/* Inner face fill */}
        <circle cx="55" cy="55" r="26.5" fill="url(#emGoldInner)" opacity=".4" />

        {/* ₽ symbol */}
        <text x="55" y="65" textAnchor="middle" fontSize="30" fontWeight="900"
          fontFamily="Georgia,Times,serif" fill="rgba(255,255,255,.95)"
          style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.4))' }}>
          ₽
        </text>

        {/* Highlight — lens flare */}
        <ellipse cx="43" cy="41" rx="10" ry="6" fill="rgba(255,255,255,.38)"
          style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: 'rotate(-30deg)' }} />

        {/* Shine sweep — clips to coin */}
        <clipPath id="coinClip"><circle cx="55" cy="55" r="34" /></clipPath>
        <rect x="20" y="20" width="20" height="70" rx="4" fill="rgba(255,255,255,.18)"
          clipPath="url(#coinClip)"
          style={{ animation: 'emShine 4s 1s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'center' }} />
      </svg>
    </div>
  );
}

// ─── MAIN WALLET ──────────────────────────────────────────────────────────────
export function Wallet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<View>('main');
  const [balance, setBalance] = useState(18450);
  const bonusRubles = 429; const referralMoney = 1240;
  const [openTxId, setOpenTxId] = useState<number | null>(null);
  const [mlmExpanded, setMlmExpanded] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [copyDone, setCopyDone] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState('');
  const toggleTx = useCallback((id: number) => setOpenTxId(p => p === id ? null : id), []);

  // Анимация баланса
  const [displayBal, setDisplayBal] = useState(0);
  const displayBalRef = useRef(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const from = displayBalRef.current;
    const to = balance;
    const animate = (now: number) => {
      const p = Math.min((now - start) / 950, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (to - from) * e);
      displayBalRef.current = val;
      setDisplayBal(val);
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [balance]);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    if (!orderId) return;

    let stopped = false;
    let attempts = 0;
    const processedKey = `voevoda_wallet_order_${orderId}`;

    const poll = async () => {
      attempts += 1;
      try {
        const order = await getPaymentOrder(orderId);
        if (stopped) return;

        if (order.status === 'paid') {
          const amount = Math.round(Number(order.total_amount));
          if (order.purpose === 'wallet_topup' && !localStorage.getItem(processedKey)) {
            setBalance(b => b + amount);
            localStorage.setItem(processedKey, '1');
          }
          setPaymentNotice(order.purpose === 'wallet_topup' ? `Баланс пополнен на ${fmt(amount)} ₽.` : 'Платеж успешно оплачен.');
          return;
        }

        if (order.status === 'canceled' || order.status === 'failed') {
          setPaymentNotice('Оплата не прошла. Можно попробовать еще раз.');
          return;
        }

        if (attempts < 12) {
          window.setTimeout(poll, 2500);
        } else {
          setPaymentNotice('Платеж еще обрабатывается. Обновите страницу через минуту.');
        }
      } catch {
        if (!stopped) setPaymentNotice('Не удалось проверить статус платежа. Попробуйте обновить страницу.');
      }
    };

    poll();
    return () => {
      stopped = true;
    };
  }, [searchParams]);

  const handleCopyRef = () => {
    navigator.clipboard?.writeText('https://voevoda.ru/ref/tornado').catch(() => { });
    setCopyDone(true); setTimeout(() => setCopyDone(false), 2200);
  };

  const filteredTx = TRANSACTIONS.filter(tx => {
    const ms = !historySearch || tx.title.toLowerCase().includes(historySearch.toLowerCase()) || tx.ord.toLowerCase().includes(historySearch.toLowerCase());
    const mf = historyFilter === 'all' || (historyFilter === 'done' && tx.status === 'done') || (historyFilter === 'pending' && tx.status === 'pending') || (historyFilter === 'error' && tx.status === 'error') || (historyFilter === 'edu' && tx.type === 'edu') || (historyFilter === 'market' && (tx.type === 'market' || tx.type === 'kaptorka'));
    return ms && mf;
  });

  const totalSpent = TRANSACTIONS.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const successCount = TRANSACTIONS.filter(t => t.status === 'done').length;
  const pendingCount = TRANSACTIONS.filter(t => t.status === 'pending').length;
  const errorCount = TRANSACTIONS.filter(t => t.status === 'error').length;

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F8F9FB' }}>
      <style>{ANIM}</style>

      {view === 'history' ? (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 48px' }} className="wv-enter">
          <button className="wv-back-btn" onClick={() => setView('main')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            Назад к кошельку
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#375DFB' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
            </div>
            <div>
              <h1 style={{ fontFamily: 'inherit', fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>История платежей</h1>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ cursor: 'pointer', transition: 'color .15s' }} onClick={() => setView('main')} onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>Кошелёк</span>
                <span>›</span><span>История</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            {[{ val: `${fmt(totalSpent)} ₽`, label: 'Всего потрачено', color: '#111' }, { val: successCount, label: 'Успешных', color: '#1d9e75' }, { val: pendingCount, label: 'В обработке', color: '#f57c00' }, { val: errorCount, label: 'Ошибок', color: '#e53935' }].map(m => (
              <Card key={m.label} style={{ padding: '14px 18px' }} className="wv-stat-card">
                <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.val}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{m.label}</div>
              </Card>
            ))}
          </div>
          <Card style={{ padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Поиск по названию или заказу..."
                  style={{ width: '100%', padding: '9px 14px 9px 36px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border .15s' }}
                  onFocus={e => (e.target.style.borderColor = '#375DFB')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {([['all', 'Все'], ['done', 'Оплачено'], ['pending', 'В обработке'], ['error', 'Ошибки'], ['edu', 'Курсы'], ['market', 'Товары']] as [HistoryFilter, string][]).map(([k, l]) => (
                  <button key={k} className={`wv-filter-chip${historyFilter === k ? ' active' : ''}`} onClick={() => setHistoryFilter(k)}>{l}</button>
                ))}
              </div>
            </div>
          </Card>
          <Card style={{ paddingBottom: 8 }}>
            {filteredTx.length ? <div style={{ paddingTop: 8 }}><TxList txs={filteredTx} openId={openTxId} onToggle={toggleTx} /></div> : <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Ничего не найдено</div>}
          </Card>
        </div>
      ) : (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 48px' }} className="wv-enter">
          {paymentNotice && (
            <div style={{ marginBottom: 16, background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '12px 16px', color: '#047857', fontSize: 13, fontWeight: 600 }}>
              {paymentNotice}
            </div>
          )}

          {/* PAGE TITLE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#375DFB' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M16 13a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" /><path d="M2 10h20" /></svg>
            </div>
            <div>
              <h1 style={{ fontFamily: 'inherit', fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>Кошелёк</h1>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ cursor: 'pointer', transition: 'color .15s' }} onClick={() => navigate('/')} onMouseEnter={e => (e.currentTarget.style.color = '#375DFB')} onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>Главная</span>
                <span>›</span><span>Кошелёк</span>
              </div>
            </div>
          </div>

          {/* ── HERO BALANCE (full-width, dark blue) ── */}
          <div style={{ marginBottom: 20, borderRadius: 24 }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d1b4b 0%, #1a2e6e 45%, #1e3fa8 100%)',
            borderRadius: 24, position: 'relative', overflow: 'hidden',
            clipPath: 'inset(0 0 0 0 round 24px)',
          }}>
            {/* Background layers */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', borderRadius: 24 }}>
              <div style={{ position: 'absolute', top: -60, right: 60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,133,255,.26) 0%, transparent 70%)', animation: 'heroOrb1 8s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', bottom: -40, left: 80, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(55,93,251,.2) 0%, transparent 70%)', animation: 'heroOrb2 11s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', top: '40%', right: '20%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.16) 0%, transparent 70%)', animation: 'heroOrb3 7s ease-in-out infinite' }} />
              {/* Grid */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .04 }} xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="g2" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M 36 0 L 0 0 0 36" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#g2)" />
              </svg>
              {/* Scan line */}
              <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.1) 30%, rgba(99,133,255,.35) 50%, rgba(255,255,255,.1) 70%, transparent)', animation: 'heroScan 4s ease-in-out infinite' }} />
            </div>

            {/* Floating particles */}
            <HeroParticles />

            {/* Top content */}
            <div style={{ padding: '32px 36px 18px', display: 'flex', alignItems: 'flex-start', gap: 24, position: 'relative', zIndex: 2 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Live label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ position: 'relative', width: 8, height: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#34d399', animation: 'heroPing 2s ease-out infinite' }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700 }}>Основной баланс</span>
                </div>

                {/* Amount */}
                <div key={balance} style={{ animation: 'heroCountUp .6s cubic-bezier(.34,1.2,.64,1) both' }}>
                  <div style={{ fontWeight: 900, fontSize: 58, color: '#fff', lineHeight: 1, letterSpacing: '-2.5px', textShadow: '0 4px 24px rgba(55,93,251,.5)', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(displayBal)}
                    <span style={{ fontSize: 34, fontWeight: 700, color: 'rgba(255,255,255,.55)', marginLeft: 10, letterSpacing: 0 }}>₽</span>
                  </div>
                </div>

                {/* Sub row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,166,35,.14)', border: '1px solid rgba(245,166,35,.3)', borderRadius: 20, padding: '5px 12px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span style={{ fontSize: 13, color: '#f5a623', fontWeight: 800 }}>{fmt(bonusRubles)} БР</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>бонусных рублей</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 8, padding: '4px 10px' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    <span style={{ fontSize: 11, color: '#34d399', fontWeight: 700 }}>+2.4% за апрель</span>
                  </div>
                </div>

                {/* Last tx ticker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '8px 12px', background: 'rgba(255,255,255,.06)', borderRadius: 10, border: '1px solid rgba(255,255,255,.08)', width: 'fit-content', animation: 'heroFadeSlide .6s .3s ease both' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f5a623', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>Последняя: </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>−4 900 ₽ · КМБ V5</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginLeft: 4 }}>12 апр</span>
                </div>
              </div>

              {/* Coin emblem — no wrapper box */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
                <HeroEmblem />
              </div>
            </div>

            {/* Quick fill pills */}
            <div style={{ padding: '0 36px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
              {[1000, 3000, 5000, 10000].map(a => (
                <button key={a} className="wv-hero-pill-dark" onClick={() => setModal('topup')}>+{fmt(a)} ₽</button>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ padding: '0 36px 28px', display: 'flex', gap: 10, flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
              {[
                { label: 'Пополнить', fn: () => setModal('topup'), ic: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
                { label: 'Вывести', fn: () => setModal('withdraw'), ic: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 8 21 12 17 16"/><line x1="3" y1="12" x2="21" y2="12"/></svg> },
                { label: 'Перевести', fn: () => setModal('transfer'), ic: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> },
              ].map(b => <button key={b.label} className="wv-hero-action" onClick={b.fn}>{b.ic}{b.label}</button>)}
            </div>

            {/* Chart */}
            <div style={{ height: 100, position: 'relative', zIndex: 2, opacity: .65 }}>
              <HeroAreaChart />
            </div>

            {/* Bottom shimmer */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(99,133,255,.8) 30%, rgba(245,166,35,.9) 50%, rgba(99,133,255,.8) 70%, transparent)', backgroundSize: '200% 100%', animation: 'heroShimmer 3s linear infinite', zIndex: 3 }} />
          </div>
          </div>{/* /hero wrapper */}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
            {/* ══ LEFT ══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

              {/* STATS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {[
                  { ic: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>, bg: '#fdecea', val: `${fmt(14700)} ₽`, label: 'Потрачено за апрель', color: '#e53935', sub: 'рост 0.7% к марту' },
                  { ic: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>, bg: '#e8f8f2', val: `${fmt(10000)} ₽`, label: 'Пополнено за апрель', color: '#1d9e75', sub: 'меньше на 31% к марту' },
                  { ic: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>, bg: '#fff8ed', val: `${fmt(bonusRubles)} БР`, label: 'Кэшбэк за апрель', color: '#f5a623', sub: '1% с каждой покупки' },
                ].map((st, i) => (
                  <Card key={i} style={{ padding: '16px 18px' }} className="wv-stat-card">
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>{st.ic}</div>
                    <div style={{ fontWeight: 800, fontSize: 22, color: st.color, lineHeight: 1 }}>{st.val}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{st.label}</div>
                    <div style={{ fontSize: 11, color: '#c4c4c4', marginTop: 2 }}>{st.sub}</div>
                  </Card>
                ))}
              </div>

              {/* ANALYTICS (rebuilt) */}
              <Card style={{ padding: 20 }}>
                <AnalyticsBlock />
              </Card>

              {/* HISTORY */}
              <Card style={{ paddingBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>История операций</span>
                  <button className="wv-nav-btn" onClick={() => setView('history')}>
                    Все операции <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
                <TxList txs={TRANSACTIONS} limit={6} openId={openTxId} onToggle={toggleTx} />
              </Card>

              {/* MLM NETWORK */}
              <Card style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#111' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                    Боевая реферальная сеть
                  </div>
                  <button className="wv-btn" onClick={() => setMlmExpanded(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#375DFB', border: '1px solid #c7d2fe', background: '#f0f4ff', borderRadius: 6, padding: '5px 10px', fontWeight: 500 }}>
                    {mlmExpanded ? 'Свернуть' : 'Развернуть'}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">{mlmExpanded ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}</svg>
                  </button>
                </div>
                {mlmExpanded && <ImprovedMLMTree onCopyRef={handleCopyRef} copyDone={copyDone} />}
              </Card>
            </div>

            {/* ══ RIGHT COLUMN (sticky + scroll) ══ */}
            <div className="wv-right-col" style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* FUNDS */}
              <Card style={{ padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 14 }}>Мои средства</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: '#fff8ed', border: '1px solid rgba(245,166,35,.25)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      <span style={{ fontSize: 11, color: '#c47d0e', fontWeight: 600 }}>Бонусные рубли</span>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#c47d0e', lineHeight: 1, letterSpacing: '-0.5px' }}>
                      {fmt(bonusRubles)} <span style={{ fontSize: 13, fontWeight: 600, opacity: .7 }}>БР</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#c47d0e', opacity: .65, marginTop: 5 }}>Тратить на платформе</div>
                    <button
                      onClick={() => setModal('topup')}
                      style={{ marginTop: 10, width: '100%', padding: '6px 0', background: 'rgba(245,166,35,.15)', border: '1px solid rgba(245,166,35,.35)', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#c47d0e', cursor: 'pointer' }}>
                      Потратить БР
                    </button>
                  </div>
                  <div style={{ background: '#e8f8f2', border: '1px solid rgba(29,158,117,.25)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="2"><polyline points="17 8 21 12 17 16" /><line x1="3" y1="12" x2="21" y2="12" /></svg>
                      <span style={{ fontSize: 11, color: '#0f6e56', fontWeight: 600 }}>Реферальные</span>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#0f6e56', lineHeight: 1, letterSpacing: '-0.5px' }}>
                      {fmt(referralMoney)} <span style={{ fontSize: 13, fontWeight: 600, opacity: .7 }}>₽</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#0f6e56', opacity: .65, marginTop: 5 }}>Доступно к выводу</div>
                    <button
                      onClick={() => setModal('withdraw')}
                      style={{ marginTop: 10, width: '100%', padding: '6px 0', background: 'rgba(29,158,117,.15)', border: '1px solid rgba(29,158,117,.35)', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#0f6e56', cursor: 'pointer' }}>
                      Вывести
                    </button>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 10 }}>Уровень лояльности</div>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 10 }}>
                    {['Боец', 'Сержант', 'Офицер', 'Генерал'].map((name, i) => (
                      <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: i < 3 ? 1 : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0, background: i === 0 ? '#375DFB' : i === 1 ? '#fff' : '#f3f4f6', color: i === 0 ? '#fff' : i === 1 ? '#375DFB' : '#9ca3af', border: i === 1 ? '2px solid #375DFB' : 'none', boxShadow: i === 1 ? '0 0 8px rgba(55,93,251,.3)' : 'none', transition: 'all .25s' }}>{i === 0 ? '✓' : i + 1}</div>
                          {i < 3 && <div style={{ flex: 1, height: 2, background: i < 1 ? '#375DFB' : '#e5e7eb' }} />}
                        </div>
                        <div style={{ fontSize: 9, color: i <= 1 ? '#375DFB' : '#c4c4c4', fontWeight: i === 1 ? 700 : 400, marginTop: 4, whiteSpace: 'nowrap' }}>{name}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#111', marginBottom: 4 }}>До «Офицера»:</div>
                    <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.7 }}>• Кэшбэк 3% вместо 1%<br />• Приоритет на курсы<br />• Скидка 5% на Военмаркет</div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>
                        <span>Прогресс</span><span style={{ color: '#375DFB', fontWeight: 600 }}>429 / 1200 БР</span>
                      </div>
                      <div style={{ height: 4, background: '#dbeafe', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${(429 / 1200) * 100}%`, background: '#375DFB', borderRadius: 2, transition: 'width .6s ease' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* CARDS */}
              <Card style={{ padding: 0 }}>
                <CardsWidget onAddCard={() => setModal('addCard')} />
              </Card>

              {/* NEXT PAYOUT */}
              <Card style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#375DFB)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                    Выплата рефералов
                  </div>
                  <div style={{ fontSize: 12, color: '#f5a623', fontWeight: 700 }}>28 апреля</div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  {[{ label: 'Накоплено:', val: `${fmt(3420)} ₽` }, { label: 'Минимум:', val: `${fmt(5000)} ₽` }].map(r => (
                    <div key={r.label} className="wv-payout-row"><span style={{ color: '#9ca3af' }}>{r.label}</span><span style={{ fontWeight: 700, color: '#111' }}>{r.val}</span></div>
                  ))}
                  <div style={{ margin: '10px 0 6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginBottom: 5 }}>
                      <span>Прогресс</span><span>{fmt(3420)} / {fmt(5000)} ₽</span>
                    </div>
                    <div style={{ height: 5, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(3420 / 5000) * 100}%`, background: 'linear-gradient(90deg,#375DFB,#7c3aed)', borderRadius: 3, transition: 'width .6s ease' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>Осталось: <strong style={{ color: '#111' }}>{fmt(1580)} ₽</strong></div>
                  <button className="wv-nav-btn" onClick={() => navigate('/payments')}>
                    Подробнее <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
              </Card>

              {/* QUICK ACTIONS */}
              <Card style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 12 }}>Быстрые действия</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Пополнить баланс', icon: '↑', color: '#375DFB', bg: '#f0f4ff', fn: () => setModal('topup') },
                    { label: 'Вывести средства', icon: '→', color: '#1d9e75', bg: '#e8f8f2', fn: () => setModal('withdraw') },
                    { label: 'Перевести бойцу', icon: 'БР', color: '#7c3aed', bg: '#f3f0ff', fn: () => setModal('transfer') },
                  ].map(a => (
                    <button key={a.label} className="wv-btn" onClick={a.fn} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: a.bg, border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{a.icon}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{a.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {modal === 'topup' && <Modal onClose={() => setModal(null)}><TopupModal onClose={() => setModal(null)} /></Modal>}
      {modal === 'withdraw' && <Modal onClose={() => setModal(null)}><WithdrawModal balance={balance} onClose={() => setModal(null)} onConfirm={a => { setBalance(b => Math.max(0, b - a)); setModal(null); }} /></Modal>}
      {modal === 'transfer' && <Modal onClose={() => setModal(null)}><TransferModal balance={balance} onClose={() => setModal(null)} onConfirm={a => { setBalance(b => Math.max(0, b - a)); setModal(null); }} /></Modal>}
      {modal === 'addCard' && <Modal onClose={() => setModal(null)}><AddCardModal onClose={() => setModal(null)} onAdd={() => setModal(null)} /></Modal>}
    </div>
  );
}