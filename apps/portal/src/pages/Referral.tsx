import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalBreadcrumb } from '../components/PortalBreadcrumb';

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

  :root {
    --navy-900: #07111F;
    --navy-800: #0D1B2A;
    --navy-700: #102236;
    --navy-600: #1A3A5C;
    --accent:   #1A56DB;
    --accent-2: #2563EB;
    --accent-light: #EBF2FF;
    --accent-mid:   #C7D9FA;
    --surface:  #F4F6FB;
    --surface-2:#EEF1F8;
    --border:   #DDE3EE;
    --border-2: #C8D0E2;
    --text-primary: #0D1B2A;
    --text-secondary: #4A5568;
    --text-muted: #8A96A8;
    --success:  #1A8A57;
    --success-bg:#E8F7EE;
    --success-mid:#B3E6CC;
    --warn:     #C07A10;
    --warn-bg:  #FEF3DC;
    --gold:     #B8860B;
    --gold-bg:  #FEF9E6;
    --radius-sm: 8px;
    --radius:   14px;
    --radius-lg:20px;
    --radius-xl:28px;
    --shadow-sm: 0 1px 3px rgba(13,27,42,.07);
    --shadow:    0 4px 14px rgba(13,27,42,.10);
    --shadow-lg: 0 12px 32px rgba(13,27,42,.13);
    --font: 'Montserrat', sans-serif;
  }
  * { box-sizing:border-box; margin:0; padding:0; }
  .rf-wrap { font-family:var(--font); }

  /* ── ANIMATIONS ── */
  @keyframes rf-slide-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes rf-fade {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes rf-level-in {
    from { opacity:0; transform:translateX(-20px) scale(.94); }
    to   { opacity:1; transform:translateX(0) scale(1); }
  }
  @keyframes rf-pulse-dot {
    0%,100% { box-shadow: 0 0 0 0 rgba(26,86,219,.4); }
    50%      { box-shadow: 0 0 0 8px rgba(26,86,219,.0); }
  }
  @keyframes rf-line-grow {
    from { width:0; }
    to   { width:100%; }
  }
  @keyframes rf-count {
    from { opacity:0; transform:scale(.7) translateY(4px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes rf-modal-in {
    from { opacity:0; transform:scale(.95) translateY(12px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes rf-shimmer {
    from { background-position: -600px 0; }
    to   { background-position:  600px 0; }
  }

  .rf-s1 { animation: rf-slide-up .42s ease both; }
  .rf-s2 { animation: rf-slide-up .42s .07s ease both; }
  .rf-s3 { animation: rf-slide-up .42s .14s ease both; }
  .rf-s4 { animation: rf-slide-up .42s .21s ease both; }
  .rf-s5 { animation: rf-slide-up .42s .28s ease both; }

  /* ── HERO ── */
  .rf-hero {
    background: linear-gradient(140deg, var(--navy-900) 0%, var(--navy-700) 60%, var(--navy-600) 100%);
    border-radius: var(--radius-xl);
    position: relative;
    overflow: hidden;
  }
  .rf-hero::before {
    content:''; position:absolute; inset:0;
    background:
      repeating-linear-gradient(0deg,  transparent, transparent 39px, rgba(255,255,255,.022) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,.022) 40px);
    pointer-events:none;
  }
  .rf-hero::after {
    content:''; position:absolute;
    top:-80px; right:-80px;
    width:380px; height:380px;
    background: radial-gradient(circle, rgba(26,86,219,.2) 0%, transparent 70%);
    pointer-events:none;
  }

  /* ── LEVEL CARD ── */
  .rf-level {
    display:flex; align-items:center; gap:14px;
    padding:14px 18px; border-radius:14px;
    border:1.5px solid rgba(255,255,255,.10);
    background:rgba(255,255,255,.06);
    backdrop-filter:blur(6px);
    animation: rf-level-in .4s ease both;
    transition: border-color .2s, background .2s, transform .2s;
  }
  .rf-level:hover {
    border-color:rgba(255,255,255,.22);
    background:rgba(255,255,255,.10);
    transform:translateX(2px);
  }
  .rf-level-badge {
    width:40px; height:40px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:800; flex-shrink:0;
    border:2px solid transparent;
  }

  /* ── STAT CARD ── */
  .rf-stat {
    background:#fff; border-radius:var(--radius-lg);
    border:1px solid var(--border); padding:20px 22px;
    transition: transform .2s, box-shadow .2s;
    animation: rf-count .4s ease both;
  }
  .rf-stat:hover { transform:translateY(-2px); box-shadow:var(--shadow); }

  /* ── LINK COPY ── */
  .rf-link-wrap {
    display:flex; align-items:center; gap:10px;
    background:rgba(255,255,255,.07);
    border:1.5px solid rgba(255,255,255,.13);
    border-radius:var(--radius);
    padding: 0 6px 0 18px;
    transition: border-color .2s, background .2s;
  }
  .rf-link-wrap:hover {
    border-color:rgba(255,255,255,.26);
    background:rgba(255,255,255,.10);
  }
  .rf-link-input {
    flex:1; border:none; background:transparent;
    padding:14px 0; font-size:13px; color:rgba(255,255,255,.75);
    outline:none; font-family:var(--font);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .rf-copy-btn {
    padding:9px 18px; border-radius:10px;
    font-size:13px; font-weight:600; cursor:pointer;
    font-family:var(--font); flex-shrink:0;
    transition: all .18s;
    border:1.5px solid rgba(255,255,255,.2);
    background:rgba(26,86,219,.6);
    color:#fff;
  }
  .rf-copy-btn:hover { background:rgba(26,86,219,.85); border-color:rgba(255,255,255,.35); }
  .rf-copy-btn--success {
    background:rgba(26,138,87,.7) !important;
    border-color:rgba(26,138,87,.5) !important;
  }

  /* ── TABS ── */
  .rf-tab {
    padding:10px 22px; border-radius:12px;
    border:1.5px solid var(--border);
    background:#fff; color:var(--text-secondary);
    font-size:13px; font-weight:500; cursor:pointer;
    font-family:var(--font); transition:all .18s;
  }
  .rf-tab:hover { border-color:var(--accent); color:var(--accent); }
  .rf-tab--active {
    background:var(--accent) !important;
    border-color:var(--accent) !important;
    color:#fff !important; font-weight:600 !important;
    box-shadow: 0 4px 14px rgba(26,86,219,.28);
  }

  /* ── TABLE ── */
  .rf-table-wrap { overflow:hidden; }
  .rf-table-head {
    display:grid; padding:10px 24px;
    background:var(--surface); border-bottom:1px solid var(--border);
  }
  .rf-table-row {
    display:grid; padding:16px 24px;
    align-items:center; transition:background .15s;
    border-bottom:1px solid var(--border);
    animation: rf-fade .25s ease both;
  }
  .rf-table-row:last-child { border-bottom:none; }
  .rf-table-row:hover { background:var(--surface); }

  /* ── BADGES ── */
  .rf-badge {
    display:inline-flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:700; padding:3px 10px;
    border-radius:7px; letter-spacing:.3px;
  }
  .rf-badge--level {
    background:var(--accent-light); color:var(--accent);
  }
  .rf-badge--active {
    background:var(--success-bg); color:var(--success);
  }
  .rf-badge--inactive {
    background:var(--surface-2); color:var(--text-muted);
  }
  .rf-badge--referral {
    background:var(--accent-light); color:var(--accent);
  }
  .rf-badge--bonus {
    background:var(--warn-bg); color:var(--warn);
  }

  /* ── STEP CARD ── */
  .rf-step {
    display:flex; flex-direction:column; align-items:center; text-align:center;
    padding:20px;
    position:relative;
  }
  .rf-step:not(:last-child)::after {
    content:''; position:absolute; top:36px; left:calc(50% + 36px);
    width:calc(100% - 72px); height:1px;
    background: repeating-linear-gradient(90deg, var(--border), var(--border) 6px, transparent 6px, transparent 12px);
  }
  .rf-step-icon {
    width:70px; height:70px; border-radius:20px;
    background:var(--accent-light); border:2px solid var(--accent-mid);
    display:flex; align-items:center; justify-content:center;
    margin-bottom:16px; flex-shrink:0;
    transition:transform .2s, box-shadow .2s;
  }
  .rf-step:hover .rf-step-icon {
    transform:translateY(-3px);
    box-shadow:0 8px 20px rgba(26,86,219,.15);
  }

  /* ── INFO BLOCK ── */
  .rf-info-row {
    display:flex; align-items:flex-start; gap:10px;
    padding:8px 0; border-bottom:1px solid var(--border);
  }
  .rf-info-row:last-child { border-bottom:none; }

  /* ── MODAL ── */
  .rf-modal-overlay {
    position:fixed; inset:0; background:rgba(7,17,31,.6);
    z-index:600; display:flex; align-items:center; justify-content:center;
    padding:24px; backdrop-filter:blur(5px);
    animation:rf-fade .2s ease;
  }
  .rf-modal {
    background:#fff; border-radius:var(--radius-xl);
    max-width:460px; width:100%; padding:32px;
    box-shadow:var(--shadow-lg);
    animation:rf-modal-in .28s cubic-bezier(.34,1.56,.64,1);
  }

  /* ── INPUT ── */
  .rf-input {
    width:100%; padding:11px 14px;
    border:1.5px solid var(--border); border-radius:var(--radius-sm);
    font-size:14px; color:var(--text-primary); outline:none;
    font-family:var(--font); background:#fff;
    transition:border-color .18s, box-shadow .18s;
  }
  .rf-input:focus {
    border-color:var(--accent);
    box-shadow:0 0 0 3px rgba(26,86,219,.10);
  }

  /* ── PRIMARY BUTTON ── */
  .rf-btn-primary {
    width:100%; padding:14px; border-radius:12px;
    border:none; background:var(--accent); color:#fff;
    font-size:14px; font-weight:700; cursor:pointer;
    font-family:var(--font); transition:all .18s;
    letter-spacing:.2px;
  }
  .rf-btn-primary:hover {
    background:var(--accent-2);
    box-shadow:0 6px 18px rgba(26,86,219,.32);
    transform:translateY(-1px);
  }
  .rf-btn-primary:disabled {
    background:var(--surface-2); color:var(--text-muted); cursor:not-allowed;
    transform:none; box-shadow:none;
  }

  /* ── PROGRESS BAR ── */
  .rf-progress-track {
    height:4px; border-radius:4px; background:var(--surface-2); overflow:hidden;
  }
  .rf-progress-fill {
    height:100%; border-radius:4px;
    background:linear-gradient(90deg, var(--accent), var(--accent-2));
    transition:width .6s cubic-bezier(.34,1,.64,1);
  }

  /* ── AVATAR ── */
  .rf-avatar {
    border-radius:50%; overflow:hidden;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; background:var(--surface-2);
  }

  /* ── SECTION HEADER ── */
  .rf-section-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 24px; border-bottom:1px solid var(--border);
  }

  /* ── ACCENT LINE ── */
  .rf-accent-line {
    width:48px; height:3px; border-radius:2px;
    background:var(--accent-2); margin:10px 0 20px;
    animation: rf-line-grow .6s .15s ease both;
  }
`;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
interface HistoryItem {
  id: number;
  date: string;
  name: string;
  level: number;
  action: string;
  amount: number;
  type: 'referral' | 'bonus';
}
interface ReferralItem {
  id: number;
  name: string;
  initials: string;
  level: number;
  earned: number;
  joined: string;
  status: 'active' | 'inactive';
  purchases: number;
}

const HISTORY: HistoryItem[] = [
  { id: 1, date: '5 апр 2026',  name: 'Сергей В.',     level: 1, action: 'Оплата курса КМБ V5',           amount: 267, type: 'referral' },
  { id: 2, date: '3 апр 2026',  name: 'Алексей К.',    level: 2, action: 'Оплата — Военмаркет',            amount: 148, type: 'referral' },
  { id: 3, date: '1 апр 2026',  name: '—',             level: 0, action: 'Бонус: 1-е место в соревнованиях', amount: 500, type: 'bonus' },
  { id: 4, date: '28 мар 2026', name: 'Николай Р.',    level: 1, action: 'Оплата курса Снайпер V4',         amount: 420, type: 'referral' },
  { id: 5, date: '24 мар 2026', name: 'Иван М.',       level: 3, action: 'Оплата курса — Медицина',         amount: 195, type: 'referral' },
  { id: 6, date: '18 мар 2026', name: 'Дмитрий П.',   level: 1, action: 'Оплата курса КМБ V4',            amount: 267, type: 'referral' },
  { id: 7, date: '12 мар 2026', name: '—',             level: 0, action: 'Бонус: участие в учениях',        amount: 150, type: 'bonus' },
  { id: 8, date: '5 мар 2026',  name: 'Максим О.',     level: 2, action: 'Оплата — Военмаркет',             amount: 92,  type: 'referral' },
];

const REFERRALS: ReferralItem[] = [
  { id: 1, name: 'Сергей В.',   initials: 'СВ', level: 1, earned: 1240, joined: '15 мар 2026', status: 'active',   purchases: 4 },
  { id: 2, name: 'Алексей К.',  initials: 'АК', level: 2, earned:  680, joined: '20 фев 2026', status: 'active',   purchases: 3 },
  { id: 3, name: 'Николай Р.',  initials: 'НР', level: 1, earned:  420, joined: '12 янв 2026', status: 'active',   purchases: 2 },
  { id: 4, name: 'Иван М.',     initials: 'ИМ', level: 3, earned:  195, joined: '5 дек 2025',  status: 'inactive', purchases: 1 },
  { id: 5, name: 'Дмитрий П.',  initials: 'ДП', level: 1, earned:  267, joined: '2 мар 2026',  status: 'active',   purchases: 1 },
  { id: 6, name: 'Максим О.',   initials: 'МО', level: 2, earned:   92, joined: '1 мар 2026',  status: 'active',   purchases: 1 },
];

const LEVELS = [
  {
    level: 1, pct: '3%',
    label: 'Прямые рефералы (1-й уровень)',
    desc: 'Вы лично пригласили этого участника',
    color: '#2563EB', bg: 'rgba(37,99,235,.18)', border: 'rgba(37,99,235,.5)',
    delay: '.1s',
  },
  {
    level: 2, pct: '4%',
    label: 'Рефералы рефералов (2-й уровень)',
    desc: 'Участники, которых привлёк ваш реферал',
    color: '#10B981', bg: 'rgba(16,185,129,.18)', border: 'rgba(16,185,129,.5)',
    delay: '.18s',
  },
  {
    level: 3, pct: '5%',
    label: 'Третий уровень сети',
    desc: 'Максимальная глубина партнёрской цепочки',
    color: '#F59E0B', bg: 'rgba(245,158,11,.18)', border: 'rgba(245,158,11,.5)',
    delay: '.26s',
  },
];

/* ─────────────────────────────────────────────
   SVG ICON
───────────────────────────────────────────── */
function Icon({ d, size = 18, stroke = 'currentColor', sw = 1.6 }: {
  d: string; size?: number; stroke?: string; sw?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function DualIcon({ d1, d2, size = 18, stroke = 'currentColor', sw = 1.6 }: {
  d1: string; d2: string; size?: number; stroke?: string; sw?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d1} />
      <path d={d2} />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SUBCOMPONENTS
───────────────────────────────────────────── */
type TabKey = 'info' | 'history' | 'referrals';

function InfoTab() {
  const steps = [
    {
      n: '01', title: 'Скопируйте ссылку', text: 'Скопируйте персональную реферальную ссылку в разделе выше',
      d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    },
    {
      n: '02', title: 'Поделитесь с боевыми товарищами', text: 'Отправляйте ссылку в личных беседах или сообществах портала',
      d: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    },
    {
      n: '03', title: 'Реферал регистрируется', text: 'Товарищ проходит регистрацию на портале по вашей ссылке и совершает покупку',
      d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      n: '04', title: 'Получайте вознаграждение', text: 'Процент от покупки автоматически зачисляется на ваш счёт',
      d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  const rules = [
    'Бонусные рубли расходуются только внутри портала — на курсы, Военмаркет и Каптёрку',
    'Денежное вознаграждение можно вывести на банковскую карту от 500 ₽',
    'Вывод средств обрабатывается в течение 3–5 рабочих дней',
    'Процент начисляется с каждой покупки рефералов всех трёх уровней без ограничений',
    'Собственные покупки с реферальной ссылки не засчитываются',
    'В разделе «Военмаркет» действует отдельная ставка за помощь в продаже товаров',
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div className="rf-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={18} stroke="var(--text-secondary)" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Как работает программа</span>
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, marginBottom: 36, position: 'relative' }}>
          {steps.map((s, i) => (
            <div key={i} className="rf-step">
              <div className="rf-step-icon">
                <Icon d={s.d} size={28} stroke="var(--accent)" />
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Шаг {s.n}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.3 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.text}</div>
            </div>
          ))}
        </div>

        {/* Rules */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          padding: '20px 24px', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={17} stroke="var(--accent)" />
            Условия программы
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rules.map((r, i) => (
              <div key={i} className="rf-info-row">
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                  flexShrink: 0, marginTop: 7,
                }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ items }: { items: HistoryItem[] }) {
  const totalEarned = items.reduce((a, b) => a + b.amount, 0);
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div className="rf-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" size={18} stroke="var(--text-secondary)" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>История начислений</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
          Итого: +{totalEarned.toLocaleString('ru')} ₽
        </span>
      </div>
      <div className="rf-table-head"
        style={{ gridTemplateColumns: '130px 1fr 130px 110px 110px' }}>
        {['Дата', 'Описание', 'Уровень', 'Сумма', 'Тип'].map(h => (
          <div key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px' }}>{h}</div>
        ))}
      </div>
      {items.map((h, i) => (
        <div
          key={h.id}
          className="rf-table-row"
          style={{
            gridTemplateColumns: '130px 1fr 130px 110px 110px',
            animationDelay: `${i * 0.04}s`,
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{h.date}</span>
          <div>
            {h.name !== '—' && (
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{h.name}</div>
            )}
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{h.action}</div>
          </div>
          <div>
            {h.level > 0 && (
              <span className="rf-badge rf-badge--level">Ур. {h.level} · {LEVELS[h.level - 1].pct}</span>
            )}
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--success)' }}>
            +{h.amount.toLocaleString('ru')} ₽
          </span>
          <span className={`rf-badge rf-badge--${h.type}`}>
            {h.type === 'bonus' ? 'Бонус' : 'Реферал'}
          </span>
        </div>
      ))}
    </div>
  );
}

function ReferralsTab({ items }: { items: ReferralItem[] }) {
  const active = items.filter(r => r.status === 'active').length;
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div className="rf-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" size={18} stroke="var(--text-secondary)" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Мои рефералы</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="rf-badge rf-badge--active">{active} активных</span>
          <span className="rf-badge rf-badge--inactive">{items.length - active} неактивных</span>
        </div>
      </div>
      <div className="rf-table-head"
        style={{ gridTemplateColumns: '1fr 100px 150px 150px 120px' }}>
        {['Участник', 'Уровень', 'Заработано', 'Дата регистрации', 'Статус'].map(h => (
          <div key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px' }}>{h}</div>
        ))}
      </div>
      {items.map((r, i) => (
        <div
          key={r.id}
          className="rf-table-row"
          style={{
            gridTemplateColumns: '1fr 100px 150px 150px 120px',
            animationDelay: `${i * 0.04}s`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="rf-avatar" style={{ width: 40, height: 40 }}>
              <span style={{
                fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)',
                fontFamily: 'var(--font)',
              }}>{r.initials}</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.purchases} покупок</div>
            </div>
          </div>
          <span className="rf-badge rf-badge--level">Ур. {r.level}</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--success)' }}>
            +{r.earned.toLocaleString('ru')} ₽
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.joined}</span>
          <span className={`rf-badge rf-badge--${r.status}`}>
            {r.status === 'active' ? 'Активен' : 'Неактивен'}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   WITHDRAW MODAL
───────────────────────────────────────────── */
function WithdrawModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount]   = useState('');
  const [card, setCard]       = useState('');
  const [holder, setHolder]   = useState('');
  const [done, setDone]       = useState(false);

  const handleSubmit = () => {
    setDone(true);
    setTimeout(() => onClose(), 2200);
  };

  const canSubmit = amount.trim() && card.trim() && holder.trim() && Number(amount) >= 500;

  return (
    <div className="rf-modal-overlay" onClick={onClose}>
      <div className="rf-modal" onClick={e => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: 'var(--success-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
              border: '2px solid var(--success-mid)',
            }}>
              <Icon d="M5 13l4 4L19 7" size={28} stroke="var(--success)" sw={2.5} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Заявка принята
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Вывод будет обработан в течение 3–5 рабочих дней
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Вывод средств</h3>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', fontSize: 18,
                }}
              >×</button>
            </div>

            <div style={{
              background: 'var(--success-bg)', borderRadius: 10,
              padding: '14px 16px', marginBottom: 20,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: '1px solid var(--success-mid)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Доступно к выводу</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--success)' }}>₽ 2 535</span>
            </div>

            {[
              { label: 'Сумма вывода (минимум 500 ₽)', value: amount, onChange: setAmount, placeholder: '500', type: 'number' },
              { label: 'Номер карты (16 цифр)', value: card, onChange: setCard, placeholder: '0000 0000 0000 0000', type: 'text' },
              { label: 'ФИО держателя карты', value: holder, onChange: setHolder, placeholder: 'Иванов Иван Иванович', type: 'text' },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                  {f.label}
                </label>
                <input
                  className="rf-input"
                  type={f.type}
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  placeholder={f.placeholder}
                />
              </div>
            ))}

            <div style={{
              background: 'var(--surface)', borderRadius: 10, padding: '12px 14px',
              border: '1px solid var(--border)', marginBottom: 20,
              fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6,
            }}>
              Обработка заявки: 3–5 рабочих дней. Комиссия за вывод отсутствует. Средства поступят на карту по указанным реквизитам.
            </div>

            <button className="rf-btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
              Отправить заявку на вывод
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export function Referral() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [showWithdraw, setShowWithdraw] = useState(false);

  const refLink = 'https://voevoda.ru/ref?code=TORNADO-7742';

  const copyLink = () => {
    navigator.clipboard?.writeText(refLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const STATS = [
    {
      label: 'Бонусные рубли',
      value: '3 840 ₽',
      sub: 'Тратить внутри портала',
      color: 'var(--accent)',
      bg: 'var(--accent-light)',
      iconD: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      progress: 38,
      action: null,
    },
    {
      label: 'Деньги к выводу',
      value: '2 535 ₽',
      sub: 'Вывести на банковскую карту',
      color: 'var(--success)',
      bg: 'var(--success-bg)',
      iconD: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      progress: 25,
      action: 'Вывести',
    },
    {
      label: 'Всего рефералов',
      value: '12',
      sub: 'Активных: 9 · Неактивных: 3',
      color: '#7C3AED',
      bg: '#F3EEFF',
      iconD: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      progress: null,
      action: null,
    },
    {
      label: 'Заработано за всё время',
      value: '11 480 ₽',
      sub: 'С января 2025 года',
      color: 'var(--warn)',
      bg: 'var(--warn-bg)',
      iconD: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      progress: null,
      action: null,
    },
  ];

  return (
    <div className="rf-wrap" style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: 'var(--surface)' }}>
      <style>{CSS}</style>
      <div style={{ padding: '24px 28px 60px' }}>

        <PortalBreadcrumb items={[{ label:'Главная', to:'/' }, { label:'Личный кабинет', to:'/profile' }, { label:'Партнёрская программа' }]} />

        {/* Hero */}
        <div className="rf-hero rf-s1" style={{ padding: '32px 36px 34px', marginBottom: 18 }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'flex-start' }}>
              {/* Left */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.45)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
                  Партнёрская программа
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-.4px', marginBottom: 0 }}>
                  Приглашайте товарищей —<br />зарабатывайте вместе
                </h1>
                <div className="rf-accent-line" />
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.75, marginBottom: 26, maxWidth: 480 }}>
                  Получайте вознаграждение за каждую покупку привлечённых участников
                  на трёх уровнях партнёрской сети. Без ограничений по времени и сумме.
                </p>
                {/* Link */}
                <div className="rf-link-wrap" style={{ maxWidth: 520 }}>
                  <Icon d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" size={16} stroke="rgba(255,255,255,.45)" />
                  <input
                    className="rf-link-input"
                    readOnly
                    value={refLink}
                  />
                  <button
                    onClick={copyLink}
                    className={`rf-copy-btn${copied ? ' rf-copy-btn--success' : ''}`}
                  >
                    {copied ? 'Скопировано' : 'Копировать ссылку'}
                  </button>
                </div>
              </div>

              {/* Right: levels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
                {LEVELS.map(l => (
                  <div
                    key={l.level}
                    className="rf-level"
                    style={{ animationDelay: l.delay }}
                  >
                    <div
                      className="rf-level-badge"
                      style={{
                        background: l.bg,
                        borderColor: l.border,
                        color: l.color,
                      }}
                    >{l.level}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontWeight: 500 }}>{l.label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.44)', marginTop: 2 }}>{l.desc}</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: l.color, flexShrink: 0 }}>{l.pct}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="rf-s2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
          {STATS.map((s, i) => (
            <div key={i} className="rf-stat" style={{ animationDelay: `${i * 0.06}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon d={s.iconD} size={20} stroke={s.color} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: s.progress != null ? 10 : (s.action ? 10 : 0) }}>
                {s.sub}
              </div>
              {s.progress != null && (
                <div className="rf-progress-track">
                  <div className="rf-progress-fill" style={{ width: `${s.progress}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)` }} />
                </div>
              )}
              {s.action && (
                <button
                  onClick={() => setShowWithdraw(true)}
                  style={{
                    width: '100%', padding: '8px', background: s.bg,
                    border: `1.5px solid ${s.color}33`, borderRadius: 9,
                    color: s.color, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '.8')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {s.action}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="rf-s3" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {([
            ['info',      'Как работает',         'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'],
            ['history',   'История начислений',   'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'],
            ['referrals', 'Мои рефералы',         'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'],
          ] as [TabKey, string, string][]).map(([key, label, d]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rf-tab${activeTab === key ? ' rf-tab--active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Icon d={d} size={15} stroke="currentColor" />
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="rf-s4">
          {activeTab === 'info'      && <InfoTab />}
          {activeTab === 'history'   && <HistoryTab items={HISTORY} />}
          {activeTab === 'referrals' && <ReferralsTab items={REFERRALS} />}
        </div>
      </div>

      {/* Analytics section below tabs */}
      {activeTab === 'referrals' && (
        <div className="rf-s5" style={{ marginTop: 16 }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div className="rf-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" size={18} stroke="var(--text-secondary)" />
                </div>
                <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Сводка по уровням сети</span>
              </div>
            </div>
            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {LEVELS.map(l => {
                const refs = REFERRALS.filter(r => r.level === l.level);
                const totalEarnedLevel = refs.reduce((a, b) => a + b.earned, 0);
                const activeCount = refs.filter(r => r.status === 'active').length;
                return (
                  <div key={l.level} style={{
                    borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                    background: 'var(--surface)', padding: '20px',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', top: -20, right: -20,
                      width: 80, height: 80, borderRadius: '50%',
                      background: l.color + '12',
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: l.bg.replace('rgba', 'rgba').replace('.18', '.22'),
                        border: `2px solid ${l.color}55`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, color: l.color, flexShrink: 0,
                      }}>{l.level}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Уровень {l.level}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ставка: {l.pct}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Рефералов', value: String(refs.length) },
                        { label: 'Активных', value: String(activeCount) },
                        { label: 'Заработано', value: `${totalEarnedLevel.toLocaleString('ru')} ₽` },
                      ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <div style={{ height: 3, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 4,
                          background: l.color,
                          width: refs.length > 0 ? `${(activeCount / refs.length) * 100}%` : '0%',
                          transition: 'width .8s cubic-bezier(.34,1,.64,1)',
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                        Активность: {refs.length > 0 ? Math.round((activeCount / refs.length) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Monthly breakdown */}
            <div style={{ padding: '0 28px 28px' }}>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 22, marginTop: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                  Начисления по месяцам
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                  {[
                    { month: 'Окт', amount: 820 },
                    { month: 'Ноя', amount: 1240 },
                    { month: 'Дек', amount: 960 },
                    { month: 'Янв', amount: 1580 },
                    { month: 'Фев', amount: 1320 },
                    { month: 'Мар', amount: 2100 },
                    { month: 'Апр', amount: 1130 },
                  ].map((m, i) => {
                    const maxVal = 2100;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                          marginBottom: 2,
                        }}>
                          {m.amount >= 1000 ? `${(m.amount / 1000).toFixed(1)}K` : m.amount}
                        </div>
                        <div style={{
                          width: '100%', borderRadius: '3px 3px 0 0',
                          height: `${(m.amount / maxVal) * 80}px`,
                          background: i === 5 ? 'var(--accent)' : 'var(--accent-light)',
                          transition: 'background .15s', cursor: 'default',
                        }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                          onMouseLeave={e => (e.currentTarget.style.background = i === 5 ? 'var(--accent)' : 'var(--accent-light)')}
                        />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}
    </div>
  );
}
