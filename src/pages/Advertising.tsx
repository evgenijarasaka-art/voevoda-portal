import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
    --danger:   #B91C1C;
    --danger-bg:#FEF2F2;
    --radius-sm: 8px;
    --radius:   14px;
    --radius-lg:20px;
    --radius-xl:28px;
    --shadow:    0 4px 14px rgba(13,27,42,.10);
    --shadow-lg: 0 12px 32px rgba(13,27,42,.14);
    --font: 'Montserrat', sans-serif;
  }
  * { box-sizing:border-box; margin:0; padding:0; }
  .ad-wrap { font-family:var(--font); }

  /* ── ANIMATIONS ── */
  @keyframes ad-slide-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes ad-fade {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes ad-modal-in {
    from { opacity:0; transform:scale(.96) translateY(10px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes ad-check-draw {
    from { stroke-dashoffset: 40; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes ad-count-pop {
    from { opacity:0; transform:scale(.7); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes ad-bar-grow {
    from { width:0 !important; }
    to   { }
  }
  @keyframes ad-border-pulse {
    0%,100% { border-color: var(--accent); }
    50%      { border-color: var(--accent-2); }
  }
  @keyframes ad-hero-line {
    from { width:0; opacity:0; }
    to   { width:48px; opacity:1; }
  }

  .ad-s1 { animation: ad-slide-up .42s ease both; }
  .ad-s2 { animation: ad-slide-up .42s .07s ease both; }
  .ad-s3 { animation: ad-slide-up .42s .14s ease both; }
  .ad-s4 { animation: ad-slide-up .42s .21s ease both; }
  .ad-s5 { animation: ad-slide-up .42s .28s ease both; }

  /* ── HERO ── */
  .ad-hero {
    background: linear-gradient(140deg, var(--navy-900) 0%, var(--navy-700) 55%, var(--navy-600) 100%);
    border-radius: var(--radius-xl);
    position: relative; overflow: hidden;
  }
  .ad-hero::before {
    content:''; position:absolute; inset:0;
    background:
      repeating-linear-gradient(0deg,  transparent, transparent 39px, rgba(255,255,255,.022) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,.022) 40px);
  }
  .ad-hero::after {
    content:''; position:absolute;
    bottom:-100px; right:-100px;
    width:360px; height:360px;
    background: radial-gradient(circle, rgba(26,86,219,.18) 0%, transparent 70%);
  }

  /* ── STAT ── */
  .ad-stat {
    background:#fff; border-radius:var(--radius-lg);
    border:1px solid var(--border); padding:20px 22px;
    transition: transform .2s, box-shadow .2s;
    animation: ad-count-pop .4s ease both;
  }
  .ad-stat:hover { transform:translateY(-2px); box-shadow:var(--shadow); }

  /* ── TAB ── */
  .ad-tab {
    display:flex; align-items:center; gap:7px;
    padding:10px 22px; border-radius:12px;
    border:1.5px solid var(--border); background:#fff;
    color:var(--text-secondary); font-size:13px; font-weight:500;
    cursor:pointer; font-family:var(--font); transition:all .18s;
  }
  .ad-tab:hover { border-color:var(--accent); color:var(--accent); }
  .ad-tab--active {
    background:var(--accent) !important; border-color:var(--accent) !important;
    color:#fff !important; font-weight:600 !important;
    box-shadow:0 4px 14px rgba(26,86,219,.28);
  }

  /* ── TABLE ── */
  .ad-thead {
    display:grid; padding:10px 24px;
    background:var(--surface); border-bottom:1px solid var(--border);
  }
  .ad-row {
    display:grid; padding:16px 24px; align-items:center;
    border-bottom:1px solid var(--border); transition:background .15s;
    animation: ad-fade .25s ease both;
  }
  .ad-row:last-child { border-bottom:none; }
  .ad-row:hover { background:var(--surface); }

  /* ── BADGE ── */
  .ad-badge {
    display:inline-flex; align-items:center;
    font-size:11px; font-weight:700; padding:3px 10px;
    border-radius:7px; letter-spacing:.3px;
    white-space:nowrap;
  }
  .ad-badge--active   { background:var(--success-bg); color:var(--success); }
  .ad-badge--mod      { background:var(--warn-bg);    color:var(--warn); }
  .ad-badge--ended    { background:var(--surface-2);  color:var(--text-muted); }
  .ad-badge--paused   { background:var(--danger-bg);  color:var(--danger); }

  /* ── FORMAT CARD ── */
  .ad-format {
    padding:16px; border-radius:var(--radius);
    border:1.5px solid var(--border); background:var(--surface);
    cursor:pointer; text-align:left; font-family:var(--font);
    transition:all .18s; position:relative;
  }
  .ad-format:hover {
    border-color:var(--accent); background:var(--accent-light);
    transform:translateY(-1px);
    box-shadow:0 4px 14px rgba(26,86,219,.10);
  }
  .ad-format--active {
    border-color:var(--accent) !important;
    background:var(--accent-light) !important;
    box-shadow:0 0 0 3px rgba(26,86,219,.12) !important;
  }
  .ad-format-check {
    position:absolute; top:10px; right:10px;
    width:20px; height:20px; border-radius:50%;
    background:var(--accent); display:flex; align-items:center; justify-content:center;
    animation: ad-count-pop .2s ease;
  }

  /* ── SECTION CHECKBOX ── */
  .ad-check-row {
    display:flex; align-items:center; gap:12px;
    padding:11px 14px; border-radius:10px; border:1.5px solid var(--border);
    background:#fff; cursor:pointer; transition:all .15s;
  }
  .ad-check-row:hover { border-color:var(--accent-mid); background:var(--accent-light); }
  .ad-check-row--active { border-color:var(--accent); background:var(--accent-light); }
  .ad-check-box {
    width:18px; height:18px; border-radius:5px;
    border:2px solid var(--border-2); background:#fff;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; transition:all .15s;
  }
  .ad-check-box--active { background:var(--accent); border-color:var(--accent); }

  /* ── INPUT ── */
  .ad-input {
    width:100%; padding:12px 14px;
    border:1.5px solid var(--border); border-radius:var(--radius-sm);
    font-size:14px; color:var(--text-primary); outline:none;
    font-family:var(--font); background:#fff; transition:all .18s;
  }
  .ad-input:focus {
    border-color:var(--accent);
    box-shadow:0 0 0 3px rgba(26,86,219,.10);
  }
  .ad-textarea {
    width:100%; padding:12px 14px; min-height:96px; resize:vertical;
    border:1.5px solid var(--border); border-radius:var(--radius-sm);
    font-size:14px; color:var(--text-primary); outline:none;
    font-family:var(--font); background:#fff; transition:all .18s;
    line-height:1.6;
  }
  .ad-textarea:focus {
    border-color:var(--accent);
    box-shadow:0 0 0 3px rgba(26,86,219,.10);
  }
  .ad-label {
    display:block; font-size:11px; font-weight:700;
    color:var(--text-secondary); margin-bottom:7px;
    text-transform:uppercase; letter-spacing:.5px;
  }

  /* ── BUTTON ── */
  .ad-btn-primary {
    width:100%; padding:14px; border-radius:12px;
    border:none; background:var(--accent); color:#fff;
    font-size:14px; font-weight:700; cursor:pointer;
    font-family:var(--font); transition:all .18s; letter-spacing:.2px;
  }
  .ad-btn-primary:hover {
    background:var(--accent-2);
    box-shadow:0 6px 18px rgba(26,86,219,.30);
    transform:translateY(-1px);
  }
  .ad-btn-primary:disabled {
    background:var(--surface-2); color:var(--text-muted);
    cursor:not-allowed; transform:none; box-shadow:none;
  }
  .ad-btn-outline {
    padding:10px 20px; border-radius:10px;
    border:1.5px solid var(--border); background:#fff;
    color:var(--text-secondary); font-size:13px; font-weight:500;
    cursor:pointer; font-family:var(--font); transition:all .15s;
    display:flex; align-items:center; gap:7px;
  }
  .ad-btn-outline:hover { border-color:var(--accent); color:var(--accent); }

  /* ── SECTION CARD ── */
  .ad-card {
    background:#fff; border-radius:var(--radius-lg);
    border:1px solid var(--border); overflow:hidden;
    margin-bottom:16px;
  }
  .ad-card-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 24px; border-bottom:1px solid var(--border);
  }
  .ad-card-header-title {
    display:flex; align-items:center; gap:10px;
  }
  .ad-card-icon {
    width:36px; height:36px; border-radius:10px;
    background:var(--surface-2);
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  }

  /* ── PROGRESS BAR ── */
  .ad-progress { height:4px; border-radius:4px; background:var(--surface-2); overflow:hidden; }
  .ad-progress-fill {
    height:100%; border-radius:4px;
    background:linear-gradient(90deg, var(--accent), var(--accent-2));
    animation: ad-bar-grow .8s .3s cubic-bezier(.34,1,.64,1) both;
    transition:width .6s cubic-bezier(.34,1,.64,1);
  }

  /* ── SUCCESS SCREEN ── */
  .ad-success {
    padding:64px 24px; text-align:center;
    animation: ad-fade .3s ease;
  }
  .ad-success-icon {
    width:72px; height:72px; border-radius:22px;
    background:var(--success-bg); border:2px solid var(--success-mid);
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 20px;
  }
  .ad-success-check { stroke-dasharray:40; stroke-dashoffset:0; animation: ad-check-draw .5s .1s ease both; }

  /* ── ACCENT LINE ── */
  .ad-accent-line {
    width:48px; height:3px; border-radius:2px;
    background:var(--accent-2); margin:10px 0 20px;
    animation: ad-hero-line .6s .15s ease both;
  }

  /* ── BUDGET PREVIEW ── */
  .ad-budget-preview {
    background:var(--surface); border-radius:var(--radius);
    padding:18px 20px; border:1px solid var(--border);
  }

  /* ── TOOLTIP ── */
  .ad-hint {
    font-size:11px; color:var(--text-muted); margin-top:5px; line-height:1.5;
  }

  /* ── SCROLL ── */
  .ad-wrap ::-webkit-scrollbar { width:4px; }
  .ad-wrap ::-webkit-scrollbar-track { background:transparent; }
  .ad-wrap ::-webkit-scrollbar-thumb { background:var(--border-2); border-radius:4px; }
`;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
interface Campaign {
  id: number;
  name: string;
  format: string;
  sections: string[];
  budget: number;
  reach: string;
  clicks: number;
  ctr: string;
  status: 'active' | 'moderation' | 'ended' | 'paused';
  startDate: string;
  endDate: string;
}

interface AdFormat {
  id: string;
  label: string;
  size: string;
  desc: string;
  iconD: string;
}

const CAMPAIGNS: Campaign[] = [
  {
    id: 1, name: 'Снаряжение и экипировка — весна 2026',
    format: 'Баннер', sections: ['Главная', 'Военмаркет'], budget: 5000,
    reach: '12 000/день', clicks: 840, ctr: '7.0%',
    status: 'active', startDate: '1 апр 2026', endDate: '30 апр 2026',
  },
  {
    id: 2, name: 'Курс КМБ — набор на май',
    format: 'Карточка', sections: ['Каталог курсов', 'Главная'], budget: 3000,
    reach: '8 400/день', clicks: 312, ctr: '3.7%',
    status: 'moderation', startDate: 'На модерации', endDate: '—',
  },
  {
    id: 3, name: 'Зимняя экипировка 2025',
    format: 'Нативный', sections: ['Журнал'], budget: 2500,
    reach: '6 200/день', clicks: 1040, ctr: '16.8%',
    status: 'ended', startDate: '1 дек 2025', endDate: '31 дек 2025',
  },
];

const FORMATS: AdFormat[] = [
  {
    id: 'banner', label: 'Баннер', size: '1200 × 200 px',
    desc: 'Широкоформатное размещение в верхней или нижней части страницы',
    iconD: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
  },
  {
    id: 'card', label: 'Карточка', size: '300 × 250 px',
    desc: 'Компактный блок в правой колонке или сайдбаре раздела',
    iconD: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    id: 'native', label: 'Нативная публикация', size: 'Текст + фото',
    desc: 'Статья или пост в ленте Журнала с пометкой «Реклама»',
    iconD: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  },
  {
    id: 'video', label: 'Видеобаннер', size: 'MP4 · до 15 сек',
    desc: 'Автовоспроизводимый видеоролик без звука в блоке анонсов',
    iconD: 'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  },
];

const SECTIONS_MAP = [
  { name: 'Главная страница',   price: 3000, reach: '18 000' },
  { name: 'Каталог курсов',     price: 2000, reach: '9 200' },
  { name: 'Журнал',             price: 1500, reach: '6 400' },
  { name: 'Военмаркет',         price: 2500, reach: '11 000' },
  { name: 'Сообщества',         price: 1200, reach: '4 800' },
  { name: 'Путь Воеводы',       price: 1800, reach: '7 600' },
];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active:     { label: 'Активно',          cls: 'ad-badge--active' },
  moderation: { label: 'На модерации',     cls: 'ad-badge--mod' },
  ended:      { label: 'Завершено',        cls: 'ad-badge--ended' },
  paused:     { label: 'Приостановлено',   cls: 'ad-badge--paused' },
};

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

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
function CardHeader({
  iconD, title, action, count,
}: { iconD: string; title: string; action?: React.ReactNode; count?: number }) {
  return (
    <div className="ad-card-header">
      <div className="ad-card-header-title">
        <div className="ad-card-icon">
          <Icon d={iconD} size={18} stroke="var(--text-secondary)" />
        </div>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
        {count != null && (
          <span style={{
            background: 'var(--surface-2)', color: 'var(--text-muted)',
            fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 7,
          }}>{count}</span>
        )}
      </div>
      {action}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CAMPAIGNS LIST
───────────────────────────────────────────── */
function CampaignsList({ onNew }: { onNew: () => void }) {
  const activeCnt = CAMPAIGNS.filter(c => c.status === 'active').length;

  return (
    <>
      <div className="ad-card ad-s3">
        <CardHeader
          iconD="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          title="Рекламные кампании"
          count={CAMPAIGNS.length}
          action={
            <button className="ad-btn-outline" onClick={onNew}>
              <Icon d="M12 4v16m8-8H4" size={14} stroke="currentColor" />
              Новая кампания
            </button>
          }
        />

        {/* Table */}
        <div className="ad-thead" style={{ gridTemplateColumns: '1fr 110px 120px 110px 110px 120px' }}>
          {['Кампания', 'Формат', 'Охват/день', 'Бюджет', 'CTR', 'Статус'].map(h => (
            <div key={h} style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '.7px',
            }}>{h}</div>
          ))}
        </div>

        {CAMPAIGNS.map((c, i) => {
          const st = STATUS_MAP[c.status];
          return (
            <div key={c.id} className="ad-row"
              style={{ gridTemplateColumns: '1fr 110px 120px 110px 110px 120px', animationDelay: `${i * 0.05}s` }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {c.sections.join(' · ')} · {c.startDate}{c.endDate !== '—' ? ` — ${c.endDate}` : ''}
                </div>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{c.format}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.reach}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                {c.budget.toLocaleString('ru')} ₽
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: c.status === 'active' ? 'var(--success)' : 'var(--text-muted)' }}>
                {c.status === 'active' ? c.ctr : '—'}
              </span>
              <span className={`ad-badge ${st.cls}`}>{st.label}</span>
            </div>
          );
        })}

        {CAMPAIGNS.length === 0 && (
          <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            Кампаний пока нет. Создайте первое объявление.
          </div>
        )}
      </div>

      {/* Info block */}
      <div className="ad-card ad-s4" style={{ overflow: 'visible' }}>
        <CardHeader
          iconD="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          title="Условия размещения"
        />
        <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            {
              title: 'Модерация', body: 'Каждое объявление проходит проверку содержания, соответствия тематике портала и требованиям законодательства. Срок — до 24 часов.',
              iconD: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
              color: 'var(--success)', bg: 'var(--success-bg)',
            },
            {
              title: 'Оплата', body: 'Оплата производится авансом за расчётный период. Неизрасходованный остаток возвращается на баланс рекламодателя.',
              iconD: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
              color: 'var(--accent)', bg: 'var(--accent-light)',
            },
            {
              title: 'Аналитика', body: 'После запуска кампании в реальном времени доступны показатели: показы, клики, CTR и охват по разделам. Данные обновляются каждые 30 минут.',
              iconD: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
              color: 'var(--warn)', bg: 'var(--warn-bg)',
            },
          ].map((block, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              padding: '18px 20px', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: 'var(--surface)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: block.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon d={block.iconD} size={20} stroke={block.color} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{block.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{block.body}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   CREATE FORM
───────────────────────────────────────────── */
function CreateForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('banner');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const toggleSection = (s: string) =>
    setSelectedSections(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const totalCost = selectedSections.reduce((acc, s) => {
    const found = SECTIONS_MAP.find(sm => sm.name === s);
    return acc + (found?.price ?? 0);
  }, 0);

  const totalReach = selectedSections.reduce((acc, s) => {
    const found = SECTIONS_MAP.find(sm => sm.name === s);
    return acc + (found ? parseInt(found.reach.replace(/\s/g, ''), 10) : 0);
  }, 0);

  const canSubmit = name.trim() && url.trim() && selectedSections.length > 0 && budget.trim();

  return (
    <div className="ad-card ad-s3">
      <CardHeader
        iconD="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        title="Создать рекламную кампанию"
      />

      <div style={{ padding: '28px 28px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* LEFT COLUMN */}
          <div>
            <div style={{ marginBottom: 22 }}>
              <label className="ad-label">Название кампании *</label>
              <input
                className="ad-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Например: Набор на курс КМБ — июнь 2026"
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label className="ad-label">Целевой URL (посадочная страница) *</label>
              <input
                className="ad-input"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://voevoda.ru/courses/kmb-v6"
              />
              <p className="ad-hint">Адрес страницы, на которую ведёт объявление</p>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label className="ad-label">Описание / текст объявления</label>
              <textarea
                className="ad-textarea"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Краткий текст объявления, призыв к действию…"
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label className="ad-label">Формат объявления</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {FORMATS.map(f => {
                  const isActive = selectedFormat === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFormat(f.id)}
                      className={`ad-format${isActive ? ' ad-format--active' : ''}`}
                    >
                      {isActive && (
                        <span className="ad-format-check">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: isActive ? 'rgba(26,86,219,.15)' : 'var(--surface-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                      }}>
                        <Icon d={f.iconD} size={18} stroke={isActive ? 'var(--accent)' : 'var(--text-secondary)'} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? 'var(--accent)' : 'var(--text-primary)', marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.size}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{f.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File upload */}
            <div style={{ marginBottom: 22 }}>
              <label className="ad-label">Загрузить креатив</label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-2)', borderRadius: 'var(--radius)',
                  padding: '20px', textAlign: 'center', cursor: 'pointer',
                  background: 'var(--surface)', transition: 'all .18s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--accent-light)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-2)';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)';
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  onChange={e => setFileName(e.target.files?.[0]?.name ?? null)}
                />
                <Icon d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" size={28} stroke="var(--text-muted)" />
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, fontWeight: 500 }}>
                  {fileName ?? 'Нажмите для выбора файла'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  PNG, JPG, GIF, MP4 · Макс. 20 МБ
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <div style={{ marginBottom: 22 }}>
              <label className="ad-label">Разделы для размещения *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SECTIONS_MAP.map(s => {
                  const isActive = selectedSections.includes(s.name);
                  return (
                    <div
                      key={s.name}
                      onClick={() => toggleSection(s.name)}
                      className={`ad-check-row${isActive ? ' ad-check-row--active' : ''}`}
                    >
                      <div className={`ad-check-box${isActive ? ' ad-check-box--active' : ''}`}>
                        {isActive && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                          Охват: ~{s.reach}/день
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}>
                        {s.price.toLocaleString('ru')} ₽
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
              <div>
                <label className="ad-label">Дата начала</label>
                <input className="ad-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="ad-label">Дата окончания</label>
                <input className="ad-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label className="ad-label">Бюджет кампании, ₽ *</label>
              <input className="ad-input" type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="5000" />
              <p className="ad-hint">Минимальный бюджет — 1 000 ₽ за 30 дней</p>
            </div>

            {/* Budget preview */}
            <div className="ad-budget-preview" style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.5px' }}>
                Предварительный расчёт
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Разделов выбрано</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedSections.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Ожидаемый охват/день</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {totalReach > 0 ? `~${totalReach.toLocaleString('ru')}` : '—'}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Стоимость размещения / мес.</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: totalCost > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {totalCost > 0 ? `${totalCost.toLocaleString('ru')} ₽` : '—'}
                  </span>
                </div>
              </div>
              {totalCost > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="ad-progress">
                    <div className="ad-progress-fill"
                      style={{ width: `${Math.min((totalCost / 10000) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>

            <button className="ad-btn-primary" onClick={onSuccess} disabled={!canSubmit}>
              Отправить на модерацию
            </button>
            <p className="ad-hint" style={{ textAlign: 'center', marginTop: 10 }}>
              После проверки (до 24 ч.) кампания будет активирована автоматически
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ANALYTICS PANEL
───────────────────────────────────────────── */
function AnalyticsPanel() {
  const weekData = [
    { day: 'Пн', shows: 24800, clicks: 1247 },
    { day: 'Вт', shows: 21300, clicks: 1034 },
    { day: 'Ср', shows: 26100, clicks: 1380 },
    { day: 'Чт', shows: 19800, clicks: 840 },
    { day: 'Пт', shows: 28400, clicks: 1620 },
    { day: 'Сб', shows: 14200, clicks: 660 },
    { day: 'Вс', shows: 11000, clicks: 490 },
  ];
  const maxShows = Math.max(...weekData.map(d => d.shows));

  return (
    <div className="ad-card ad-s5">
      <CardHeader
        iconD="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        title="Аналитика за неделю"
      />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140, marginBottom: 8 }}>
          {weekData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%', background: 'var(--accent-light)', borderRadius: '4px 4px 0 0',
                height: `${(d.shows / maxShows) * 120}px`, position: 'relative',
                transition: 'height .6s cubic-bezier(.34,1,.64,1)', cursor: 'pointer',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-light)')}>
                <div style={{
                  position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--navy-800)', color: '#fff', fontSize: 10, fontWeight: 600,
                  padding: '3px 7px', borderRadius: 6, whiteSpace: 'nowrap', marginBottom: 4,
                  opacity: 0, transition: 'opacity .15s', pointerEvents: 'none',
                }}
                  className="ad-bar-tip">
                  {d.shows.toLocaleString('ru')} показов
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{d.day}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent-light)' }} />
            Показы
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent)' }} />
            Клики
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
type TabView = 'list' | 'create';

export function Advertising() {
  const navigate = useNavigate();
  const [view, setView] = useState<TabView>('list');
  const [submitted, setSubmitted] = useState(false);

  const handleSuccess = () => {
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setView('list'); }, 3000);
  };

  const STATS = [
    {
      label: 'Показов сегодня', value: '24 800',
      delta: '+12%', deltaPositive: true,
      iconD: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      color: 'var(--accent)', bg: 'var(--accent-light)',
    },
    {
      label: 'Кликов сегодня', value: '1 247',
      delta: '+8%', deltaPositive: true,
      iconD: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122',
      color: 'var(--success)', bg: 'var(--success-bg)',
    },
    {
      label: 'Активных кампаний', value: String(CAMPAIGNS.filter(c => c.status === 'active').length),
      delta: '', deltaPositive: true,
      iconD: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
      color: 'var(--warn)', bg: 'var(--warn-bg)',
    },
    {
      label: 'Расходы за месяц', value: '18 500 ₽',
      delta: '', deltaPositive: true,
      iconD: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: '#7C3AED', bg: '#F3EEFF',
    },
  ];

  return (
    <div className="ad-wrap" style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: 'var(--surface)' }}>
      <style>{CSS}</style>
      <div style={{ padding: '24px 28px 60px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 22 }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            Главная
          </span>
          <Icon d="M9 18l6-6-6-6" size={10} stroke="var(--border-2)" />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Рекламный кабинет</span>
        </div>

        {/* Hero */}
        <div className="ad-hero ad-s1" style={{ padding: '30px 36px 32px', marginBottom: 18 }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.44)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
                  Рекламный кабинет
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-.3px', lineHeight: 1.2 }}>
                  Размещение рекламы<br />на портале «Воевода»
                </h1>
                <div className="ad-accent-line" />
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.75, maxWidth: 480 }}>
                  Целевая аудитория — военно-патриотически ориентированные граждане.
                  Размещайте объявления в разделах портала и управляйте кампаниями в режиме реального времени.
                </p>
              </div>

              {/* Hero quick stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Активных пользователей',       val: '18 400' },
                  { label: 'Среднее время на сайте',        val: '12 мин' },
                  { label: 'Тематический CTR (среднее)',     val: '6.8%' },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,.07)',
                    border: '1px solid rgba(255,255,255,.10)',
                    borderRadius: 12, backdropFilter: 'blur(6px)',
                  }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>{s.label}</span>
                    <span style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="ad-s2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
          {STATS.map((s, i) => (
            <div key={i} className="ad-stat" style={{ animationDelay: `${i * 0.06}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
                    {s.delta && (
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: s.deltaPositive ? 'var(--success)' : 'var(--danger)',
                        background: s.deltaPositive ? 'var(--success-bg)' : 'var(--danger-bg)',
                        padding: '1px 6px', borderRadius: 6,
                      }}>{s.delta}</span>
                    )}
                  </div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon d={s.iconD} size={20} stroke={s.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="ad-s3" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setView('list')}
            className={`ad-tab${view === 'list' ? ' ad-tab--active' : ''}`}
          >
            <Icon d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" size={15} stroke="currentColor" />
            Мои кампании
          </button>
          <button
            onClick={() => setView('create')}
            className={`ad-tab${view === 'create' ? ' ad-tab--active' : ''}`}
          >
            <Icon d="M12 4v16m8-8H4" size={15} stroke="currentColor" />
            Создать объявление
          </button>
        </div>

        {/* Content */}
        {view === 'list' && (
          <>
            <CampaignsList onNew={() => setView('create')} />
            <AnalyticsPanel />
          </>
        )}

        {view === 'create' && (
          submitted ? (
            <div className="ad-card ad-s3">
              <div className="ad-success">
                <div className="ad-success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                    stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" className="ad-success-check" />
                  </svg>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                  Объявление отправлено на модерацию
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
                  Обычно проверка занимает не более 24 часов. Вы получите уведомление после принятия решения.
                </div>
                <button
                  className="ad-btn-outline"
                  style={{ margin: '0 auto' }}
                  onClick={() => setView('list')}
                >
                  <Icon d="M10 19l-7-7m0 0l7-7m-7 7h18" size={14} stroke="currentColor" />
                  К списку кампаний
                </button>
              </div>
            </div>
          ) : (
            <CreateForm onSuccess={handleSuccess} />
          )
        )}

      </div>
    </div>
  );
}