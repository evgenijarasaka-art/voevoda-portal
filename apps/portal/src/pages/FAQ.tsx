import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalBreadcrumb } from '../components/PortalBreadcrumb';

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=PT+Serif:ital@0;1&display=swap');

  :root {
    --navy-900: #07111F;
    --navy-800: #0D1B2A;
    --navy-700: #102236;
    --navy-600: #1A3A5C;
    --navy-500: #1E4A7A;
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
    --warn:     #C07A10;
    --warn-bg:  #FEF3DC;
    --danger:   #B91C1C;
    --radius-sm: 8px;
    --radius:   14px;
    --radius-lg:20px;
    --radius-xl:28px;
    --shadow-sm: 0 1px 3px rgba(13,27,42,.07), 0 1px 2px rgba(13,27,42,.04);
    --shadow:    0 4px 12px rgba(13,27,42,.09), 0 1px 3px rgba(13,27,42,.05);
    --shadow-lg: 0 10px 30px rgba(13,27,42,.12), 0 2px 8px rgba(13,27,42,.06);
    --font: 'Montserrat', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .faq-wrap { font-family: var(--font); }

  /* ── ANIMATIONS ── */
  @keyframes faq-slide-up {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes faq-fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes faq-expand {
    from { max-height:0; opacity:0; }
    to   { max-height:1000px; opacity:1; }
  }
  @keyframes faq-pulse-line {
    0%,100% { opacity:.4; }
    50%      { opacity:1; }
  }
  @keyframes faq-shimmer {
    from { background-position: -400px 0; }
    to   { background-position: 400px 0; }
  }
  @keyframes faq-badge-pop {
    0%   { transform: scale(.8); opacity:0; }
    60%  { transform: scale(1.06); }
    100% { transform: scale(1); opacity:1; }
  }
  @keyframes faq-hero-line {
    from { width:0; opacity:0; }
    to   { width:48px; opacity:1; }
  }
  @keyframes faq-count-up {
    from { opacity:0; transform:scale(.7); }
    to   { opacity:1; transform:scale(1); }
  }

  .faq-stagger-1 { animation: faq-slide-up .45s ease both; }
  .faq-stagger-2 { animation: faq-slide-up .45s .08s ease both; }
  .faq-stagger-3 { animation: faq-slide-up .45s .16s ease both; }
  .faq-stagger-4 { animation: faq-slide-up .45s .24s ease both; }
  .faq-stagger-5 { animation: faq-slide-up .45s .32s ease both; }
  .faq-stagger-6 { animation: faq-slide-up .45s .40s ease both; }

  /* ── HERO ── */
  .faq-hero {
    background: linear-gradient(138deg, var(--navy-900) 0%, var(--navy-700) 55%, var(--navy-600) 100%);
    border-radius: var(--radius-xl);
    position: relative;
    overflow: hidden;
  }
  .faq-hero::before {
    content:'';
    position:absolute; inset:0;
    background:
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,.024) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,.024) 40px);
  }
  .faq-hero::after {
    content:'';
    position:absolute;
    top:-100px; right:-100px;
    width:420px; height:420px;
    background: radial-gradient(circle, rgba(26,86,219,.25) 0%, transparent 70%);
    pointer-events:none;
  }

  /* ── SEARCH ── */
  .faq-search {
    display:flex; align-items:center; gap:12px;
    background:rgba(255,255,255,.08);
    border: 1.5px solid rgba(255,255,255,.14);
    border-radius: var(--radius);
    padding: 0 18px;
    backdrop-filter: blur(10px);
    transition: border-color .2s, background .2s, box-shadow .2s;
  }
  .faq-search:focus-within {
    border-color: rgba(255,255,255,.4);
    background:rgba(255,255,255,.14);
    box-shadow: 0 0 0 3px rgba(26,86,219,.22);
  }
  .faq-search input {
    flex:1; border:none; background:transparent;
    padding:14px 0; font-size:14px; color:#fff;
    outline:none; font-family:var(--font);
  }
  .faq-search input::placeholder { color:rgba(255,255,255,.4); }

  /* ── CATEGORY PILL ── */
  .faq-cat {
    display:inline-flex; align-items:center; gap:7px;
    padding:8px 16px; border-radius:30px;
    border:1.5px solid var(--border);
    background:#fff; color:var(--text-secondary);
    font-size:13px; font-weight:500;
    cursor:pointer; transition: all .18s ease;
    font-family:var(--font);
  }
  .faq-cat:hover {
    border-color: var(--accent);
    background: var(--accent-light);
    color: var(--accent);
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(26,86,219,.12);
  }
  .faq-cat.faq-cat--active {
    background: var(--accent);
    border-color: var(--accent);
    color:#fff;
    box-shadow: 0 4px 14px rgba(26,86,219,.30);
    transform: translateY(-1px);
  }
  .faq-cat .faq-cat-count {
    font-size:10px; font-weight:700; padding:1px 6px;
    border-radius:8px;
    background:rgba(255,255,255,.22);
    color:inherit;
    transition:background .18s;
  }
  .faq-cat:not(.faq-cat--active) .faq-cat-count {
    background:var(--surface-2);
    color:var(--text-muted);
  }

  /* ── ACCORDION ITEM ── */
  .faq-item {
    border-bottom: 1px solid var(--border);
    transition: background .15s;
  }
  .faq-item:last-child { border-bottom:none; }
  .faq-item:hover { background: #FAFBFF; }
  .faq-item-trigger {
    width:100%; display:flex; align-items:flex-start; gap:16px;
    padding:20px 24px; background:none; border:none; cursor:pointer;
    text-align:left; font-family:var(--font);
  }
  .faq-icon-wrap {
    width:36px; height:36px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; margin-top:1px;
    transition:background .15s, transform .2s;
  }
  .faq-item:hover .faq-icon-wrap,
  .faq-item--open .faq-icon-wrap {
    background: var(--accent-light);
    transform: scale(1.05);
  }
  .faq-chevron {
    width:28px; height:28px; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; margin-top:4px;
    background:var(--surface-2);
    transition: background .15s, transform .25s cubic-bezier(.34,1.56,.64,1);
  }
  .faq-item--open .faq-chevron {
    background:var(--accent-light);
    transform: rotate(180deg);
  }
  .faq-answer-wrap {
    animation: faq-expand .3s ease forwards;
    overflow:hidden;
  }
  .faq-answer-inner {
    padding:0 24px 22px 76px;
  }
  .faq-answer-text {
    font-size:14px; color:var(--text-secondary);
    line-height:1.8;
    background:var(--surface);
    border-radius:12px;
    padding:16px 20px;
    border-left:3px solid var(--accent);
  }
  .faq-feedback {
    display:flex; align-items:center; gap:10px;
    margin-top:14px;
  }
  .faq-feedback-btn {
    padding:5px 14px; border-radius:8px; border:1.5px solid var(--border);
    background:#fff; font-size:12px; font-weight:600;
    cursor:pointer; transition:all .15s; font-family:var(--font);
  }
  .faq-feedback-btn:hover {
    border-color:var(--accent); color:var(--accent);
    background:var(--accent-light);
  }
  .faq-feedback-btn--yes:hover {
    border-color:var(--success); color:var(--success);
    background:var(--success-bg);
  }

  /* ── STAT CARD ── */
  .faq-stat {
    background:#fff; border-radius:var(--radius-lg);
    border:1px solid var(--border);
    padding:20px 22px;
    transition:transform .2s, box-shadow .2s;
    animation: faq-count-up .4s ease both;
  }
  .faq-stat:hover {
    transform:translateY(-2px);
    box-shadow:var(--shadow);
  }

  /* ── SIDEBAR CARDS ── */
  .faq-sidebar-card {
    background:#fff; border-radius:var(--radius-lg);
    border:1px solid var(--border);
    overflow:hidden;
  }
  .faq-sidebar-header {
    padding:14px 20px; border-bottom:1px solid var(--border);
    font-size:13px; font-weight:700; color:var(--text-primary);
    display:flex; align-items:center; gap:8px;
  }
  .faq-popular-row {
    display:flex; align-items:flex-start; gap:10px;
    padding:10px 16px; cursor:pointer;
    transition:background .15s; border-radius:10px; margin:2px 4px;
  }
  .faq-popular-row:hover { background:var(--accent-light); }

  /* ── TAG ── */
  .faq-tag {
    display:inline-block; padding:5px 12px;
    border-radius:var(--radius-sm); border:1.5px solid var(--border);
    background:var(--surface); color:var(--text-secondary);
    font-size:12px; font-weight:500; cursor:pointer;
    transition:all .15s; font-family:var(--font);
  }
  .faq-tag:hover {
    border-color:var(--accent); color:var(--accent);
    background:var(--accent-light); transform:scale(1.04);
  }
  .faq-tag--active {
    border-color:var(--accent) !important;
    color:var(--accent) !important;
    background:var(--accent-light) !important;
  }

  /* ── CONTACT BLOCK ── */
  .faq-contact {
    background:linear-gradient(145deg, var(--navy-800) 0%, var(--navy-600) 100%);
    border-radius:var(--radius-lg);
    padding:22px 20px; position:relative; overflow:hidden;
  }
  .faq-contact::before {
    content:''; position:absolute; inset:0;
    background:repeating-linear-gradient(
      -45deg, transparent, transparent 12px,
      rgba(255,255,255,.018) 13px, rgba(255,255,255,.018) 14px
    );
  }
  .faq-contact-btn {
    width:100%; padding:12px; border-radius:10px;
    border:1.5px solid rgba(255,255,255,.22);
    background:rgba(255,255,255,.10); color:#fff;
    font-size:13px; font-weight:600; cursor:pointer;
    transition:all .18s; font-family:var(--font);
    backdrop-filter:blur(6px);
  }
  .faq-contact-btn:hover {
    background:rgba(255,255,255,.2);
    border-color:rgba(255,255,255,.38);
    transform:translateY(-1px);
  }

  /* ── CAT NAV ── */
  .faq-cat-nav-btn {
    display:flex; align-items:center; gap:10px;
    width:100%; padding:11px 20px; border:none;
    background:transparent; cursor:pointer; text-align:left;
    font-family:var(--font); transition:background .15s;
    border-left:3px solid transparent;
  }
  .faq-cat-nav-btn:hover { background:var(--surface); }
  .faq-cat-nav-btn--active {
    background:var(--accent-light) !important;
    border-left-color:var(--accent) !important;
    color:var(--accent) !important;
  }

  /* ── BADGE ── */
  .faq-badge {
    display:inline-flex; align-items:center;
    font-size:10px; font-weight:700; padding:2px 8px;
    border-radius:6px; letter-spacing:.4px; text-transform:uppercase;
    animation: faq-badge-pop .3s ease;
  }
  .faq-badge--hot { background:var(--warn-bg); color:var(--warn); }
  .faq-badge--cat { background:var(--surface-2); color:var(--text-muted); }

  /* ── EMPTY ── */
  .faq-empty {
    padding:60px 24px; text-align:center;
    animation: faq-fade-in .3s ease;
  }

  /* ── PROGRESS STRIPE ── */
  .faq-hero-accent-line {
    width:48px; height:3px; border-radius:2px;
    background:var(--accent-2);
    margin-top:10px; margin-bottom:20px;
    animation: faq-hero-line .6s .2s ease both;
  }

  /* ── SCROLLBAR ── */
  .faq-wrap ::-webkit-scrollbar { width:4px; }
  .faq-wrap ::-webkit-scrollbar-track { background:transparent; }
  .faq-wrap ::-webkit-scrollbar-thumb { background:var(--border-2); border-radius:4px; }
`;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  hot?: boolean;
  views: number;
}

interface Category {
  id: string;
  label: string;
  iconPath: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'all',
    label: 'Все вопросы',
    iconPath: 'M4 6h16M4 12h16M4 18h7',
  },
  {
    id: 'courses',
    label: 'Курсы',
    iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    id: 'payment',
    label: 'Оплата',
    iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  {
    id: 'docs',
    label: 'Документы',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    id: 'technical',
    label: 'Технические',
    iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    id: 'profile',
    label: 'Профиль',
    iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    id: 'community',
    label: 'Сообщества',
    iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
];

const FAQS: FaqItem[] = [
  {
    id: 1, category: 'courses', hot: true, views: 4821,
    question: 'Как записаться на курс?',
    answer: 'Для записи на курс перейдите в раздел «Военная подготовка» в главном меню портала. Выберите интересующий курс, нажмите кнопку «Записаться и оплатить» и следуйте инструкциям. После подтверждения оплаты и подписания договора через SMS вы получите уведомление на электронную почту и в личном кабинете. Обратите внимание, что серийные курсы требуют последовательного прохождения — доступ к следующему открывается по завершении предыдущего.',
  },
  {
    id: 2, category: 'courses', hot: true, views: 3540,
    question: 'Можно ли изучить программу курса до записи?',
    answer: 'Да. На публичной странице каждого курса доступно полное описание программы: список направлений (Военное дело, Оружие, Медицина), тем, количество занятий, форматы проведения и требования к курсантам. Нажмите на карточку курса — там вы найдёте детальное расписание потоков, сведения об инструкторах и командирах, а также рекомендации по экипировке.',
  },
  {
    id: 3, category: 'courses', views: 1892,
    question: 'Что делать, если я пропустил занятие?',
    answer: 'При пропуске занятия свяжитесь с инструктором через внутренний мессенджер портала или через раздел «Домашние задания» вашего курса. Практические полигонные занятия, как правило, не дублируются, однако теоретический материал доступен в разделе «К изучению». Систематические пропуски (более 20% от общего числа занятий) без уважительной причины могут стать основанием для отчисления с курса в соответствии с правилами УТЦ.',
  },
  {
    id: 4, category: 'courses', views: 2170,
    question: 'Как получить диплом или удостоверение после прохождения курса?',
    answer: 'Диплом выдаётся автоматически при соблюдении условий: выполнении всех домашних заданий, сдаче нормативов, посещении не менее 80% занятий и итоговой оценке не ниже 4,0. Документ появится в разделе «Дипломы» вашего личного дела. Физическую копию удостоверения можно запросить у администрации УТЦ «Воевода».',
  },
  {
    id: 5, category: 'courses', views: 1450,
    question: 'Что такое серии курсов и как они работают?',
    answer: 'Серия курсов — это связанная программа обучения с последовательным доступом. Например, «Общевойсковой снайпер 2» доступен только после завершения первого уровня. Курсы серии обозначены цифрами одного цвета в каталоге. Смотреть материалы закрытого уровня можно, но записаться — только при наличии отметки о прохождении предыдущего. КМБ (Курс молодого бойца) является базовым и открывает доступ ко всем связанным программам.',
  },
  {
    id: 6, category: 'payment', hot: true, views: 5100,
    question: 'Какие способы оплаты доступны на портале?',
    answer: 'Доступны следующие способы оплаты через платёжную систему ЮKassa: банковская карта (МИР, Visa, MasterCard), СБП — система быстрых платежей (скидка 20% при использовании), кошелёк ЮMoney, а также оплата Долями — сервис рассрочки без переплат. Для юридических лиц предусмотрено выставление счёта по договору. Рассрочка на 3 или 6 месяцев доступна для курсов стоимостью от 15 000 ₽.',
  },
  {
    id: 7, category: 'payment', views: 1345,
    question: 'Предусмотрен ли возврат средств при отмене записи?',
    answer: 'Возврат средств регулируется политикой УТЦ: при отмене не менее чем за 7 дней до начала курса — полный возврат; за 3–6 дней — 50% стоимости; менее чем за 72 часа — средства не возвращаются. В случае форс-мажора, болезни или документально подтверждённых обстоятельств решение принимается индивидуально. Обратитесь в техподдержку с соответствующим заявлением.',
  },
  {
    id: 8, category: 'payment', views: 987,
    question: 'Как использовать бонусные рубли при оплате?',
    answer: 'Бонусные рубли начисляются за активность на портале: победы в соревнованиях, участие в учениях, выполнение заданий и привлечение рефералов. Для применения бонусов при оплате активируйте опцию «Списать БР» в корзине или на странице оформления заказа. Бонусные рубли можно тратить только внутри системы (курсы, Военмаркет, Каптёрка); их нельзя вывести на внешний счёт.',
  },
  {
    id: 9, category: 'docs', views: 2650,
    question: 'Какие документы необходимы для записи на курс?',
    answer: 'Для большинства курсов достаточно пройти регистрацию на портале и подписать договор через SMS (простая электронная подпись). Для курсов с допуском к оружию или специальным дисциплинам дополнительно могут потребоваться: медицинская справка об отсутствии противопоказаний к физическим нагрузкам, копия военного билета или разрешения. Полный перечень документов указан на странице каждого конкретного курса.',
  },
  {
    id: 10, category: 'docs', views: 1780,
    question: 'Как подписать договор при записи на курс?',
    answer: 'Договор подписывается через механизм простой электронной подписи (ПЭП). В момент оформления заказа на экране появится модальное окно: введите номер телефона, получите SMS-код и введите его в соответствующее поле. После успешного ввода кода договор считается подписанным, а на электронную почту поступает квитанция в формате HTML и PDF. Доступ к курсу открывается автоматически.',
  },
  {
    id: 11, category: 'technical', views: 1200,
    question: 'Как изменить пароль или восстановить доступ к аккаунту?',
    answer: 'Изменить пароль можно через раздел «Профиль» → «Редактировать» → кнопка «Сбросить пароль». При утере пароля воспользуйтесь страницей восстановления: введите номер телефона, получите SMS-код, затем задайте новый пароль. Также доступно восстановление через электронную почту. Пароль должен содержать не менее 8 символов, включать буквы и цифры. Для дополнительной защиты аккаунта рекомендуется использовать уникальный надёжный пароль.',
  },
  {
    id: 12, category: 'technical', views: 890,
    question: 'Портал работает некорректно или загружается медленно — что делать?',
    answer: 'Выполните следующие шаги по порядку: очистите кэш браузера (Ctrl+Shift+Del), выполните жёсткую перезагрузку страницы (Ctrl+Shift+R), проверьте стабильность интернет-соединения, попробуйте другой браузер или режим инкогнито. Если проблема сохраняется — обратитесь в техподдержку через раздел /support. В обращении укажите: используемое устройство, браузер и версию, URL страницы, а также подробное описание проблемы и шаги для её воспроизведения.',
  },
  {
    id: 13, category: 'technical', views: 740,
    question: 'Как настроить уведомления и push-оповещения?',
    answer: 'Настройки уведомлений расположены в разделе «Уведомления» личного кабинета. Доступны три канала доставки: уведомления внутри портала, SMS и электронная почта. Включить или отключить уведомления можно по категориям: курсы и занятия, домашние задания, сообщения и чаты, учения и соревнования, системные оповещения. Браузерные уведомления настраиваются через запрос разрешения — он появится при первом посещении портала.',
  },
  {
    id: 14, category: 'profile', views: 1560,
    question: 'Как редактировать профиль и загрузить фото?',
    answer: 'Перейдите в «Профиль» → «Редактировать» (URL: /profile/edit). В верхней части страницы нажмите на фото профиля или иконку замены. Поддерживаемые форматы: JPG, PNG. Максимальный размер — 5 МБ. Рекомендуемое соотношение сторон — 1:1. Также можно обновить обложку профиля, контактные данные и описание «О себе». Звание, специальность и должность назначаются системой и не редактируются пользователем вручную.',
  },
  {
    id: 15, category: 'profile', views: 1120,
    question: 'Как настроить видимость блоков профиля?',
    answer: 'На странице своего профиля (будучи авторизованным владельцем) нажмите кнопку «Видимость блоков». Для каждого раздела — данные, тренировки, замеры, сообщества, объявления — можно выбрать один из трёх режимов: «Публично» (видят все), «Только друзьям» (видят подписчики), «Скрыто» (видите только вы). Настройки сохраняются немедленно.',
  },
  {
    id: 16, category: 'community', views: 980,
    question: 'Как вступить в сообщество на портале?',
    answer: 'Перейдите в раздел «Сообщества», найдите интересующее подразделение и нажмите «Подать заявку». Для открытых сообществ вступление происходит немедленно — вы встаёте в строй и получаете доступ к ленте постов, фотогалерее и чату группы. Для закрытых сообществ заявку рассматривает командир или администратор. Статус заявки отображается в разделе «Мои сообщества» личного кабинета.',
  },
  {
    id: 17, category: 'community', views: 650,
    question: 'Кто может создать собственное сообщество?',
    answer: 'Создание сообщества доступно пользователям, соответствующим следующим условиям: Индекс Воеводы не ниже 500 и успешное прохождение хотя бы одного курса. При выполнении условий в разделе «Сообщества» появится кнопка «Создать сообщество». Заполните: название, описание, обложку и категорию. После создания сообщество проходит модерацию администрацией УТЦ «Воевода» в течение 24 часов.',
  },
];

const POPULAR_TAGS = ['Запись', 'Оплата', 'Сертификат', 'Документы', 'Пароль', 'Сообщества', 'Курсы', 'Рассрочка', 'Возврат', 'Норматив'];

/* ─────────────────────────────────────────────
   SVG ICON HELPER
───────────────────────────────────────────── */
function Icon({ path, size = 18, stroke = 'currentColor', strokeWidth = 1.6 }: {
  path: string; size?: number; stroke?: string; strokeWidth?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {path.split(' M').map((p, i) => (
        <path key={i} d={i === 0 ? p : 'M' + p} />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string;
  color: string;
  bg: string;
  delay?: number;
  iconPath: string;
}
function StatCard({ label, value, color, bg, delay = 0, iconPath }: StatCardProps) {
  return (
    <div className="faq-stat" style={{ animationDelay: `${delay}s` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, marginBottom: 8 }}>{value}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '.3px' }}>{label}</div>
        </div>
        <div style={{
          width: 46, height: 46, borderRadius: 12, background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon path={iconPath} size={20} stroke={color} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ACCORDION ITEM
───────────────────────────────────────────── */
function AccordionItem({ item, isOpen, onToggle }: {
  item: FaqItem; isOpen: boolean; onToggle: () => void;
}) {
  const cat = CATEGORIES.find(c => c.id === item.category);
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  return (
    <div className={`faq-item${isOpen ? ' faq-item--open' : ''}`}>
      <button className="faq-item-trigger" onClick={onToggle}>
        <div className="faq-icon-wrap"
          style={{ background: isOpen ? 'var(--accent-light)' : 'var(--surface-2)' }}>
          <Icon
            path="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            size={17}
            stroke={isOpen ? 'var(--accent)' : 'var(--text-muted)'}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' }}>
            {item.hot && (
              <span className="faq-badge faq-badge--hot">Популярный</span>
            )}
            {cat && (
              <span className="faq-badge faq-badge--cat">{cat.label}</span>
            )}
          </div>
          <span style={{
            fontSize: 15, fontWeight: 600, lineHeight: 1.4, display: 'block',
            color: isOpen ? 'var(--accent)' : 'var(--text-primary)',
            transition: 'color .15s',
          }}>{item.question}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, paddingTop: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={13} stroke="var(--text-muted)" />
            {item.views.toLocaleString('ru')}
          </span>
          <div className="faq-chevron">
            <Icon
              path="M19 9l-7 7-7-7"
              size={14}
              stroke={isOpen ? 'var(--accent)' : 'var(--text-secondary)'}
              strokeWidth={2.2}
            />
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="faq-answer-wrap">
          <div className="faq-answer-inner">
            <p className="faq-answer-text">{item.answer}</p>
            <div className="faq-feedback">
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Материал был полезен?</span>
              {feedback ? (
                <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                  Спасибо за оценку
                </span>
              ) : (
                <>
                  <button className="faq-feedback-btn faq-feedback-btn--yes" onClick={() => setFeedback('yes')}>
                    Да, помогло
                  </button>
                  <button className="faq-feedback-btn" onClick={() => setFeedback('no')}>
                    Не совсем
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export function FAQ() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<number | null>(1);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = FAQS.filter(f => {
    const matchCat = activeCategory === 'all' || f.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const popular = FAQS.filter(f => f.hot).slice(0, 4);

  const handleTagClick = (tag: string) => {
    const next = activeTag === tag ? null : tag;
    setActiveTag(next);
    setSearch(next ?? '');
  };

  const handleClearSearch = () => {
    setSearch('');
    setActiveTag(null);
    searchRef.current?.focus();
  };

  return (
    <div className="faq-wrap" style={{
      paddingTop: 60, marginLeft: 56, minHeight: '100vh',
      background: 'var(--surface)', fontFamily: 'var(--font)',
    }}>
      <style>{CSS}</style>
      <div style={{ padding: '24px 28px 56px' }}>

        {/* ── HERO ── */}
        <div className="faq-hero faq-stagger-1" style={{ padding: '32px 36px 36px', marginBottom: 18 }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PortalBreadcrumb tone="inverse" items={[{ label:'Главная', to:'/' }, { label:'Вопросы и ответы' }]} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 13,
                    background: 'rgba(26,86,219,.35)', border: '1.5px solid rgba(26,86,219,.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                  }}>
                    <Icon
                      path="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      size={22} stroke="#fff" strokeWidth={1.5}
                    />
                  </div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-.4px', lineHeight: 1.1 }}>
                    Вопросы и ответы
                  </h1>
                </div>
                <div className="faq-hero-accent-line" />
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.62)', lineHeight: 1.75, maxWidth: 480, marginBottom: 26 }}>
                  Ответы на часто задаваемые вопросы о курсах, оплате, документах и работе портала.
                  Если не нашли нужного — обратитесь в службу поддержки.
                </p>

                {/* Search */}
                <div className="faq-search" style={{ maxWidth: 540 }}>
                  <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={18} stroke="rgba(255,255,255,.45)" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={e => { setSearch(e.target.value); setActiveTag(null); }}
                    placeholder="Поиск по базе знаний..."
                  />
                  {search && (
                    <button
                      onClick={handleClearSearch}
                      style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: 'rgba(255,255,255,.12)', border: 'none',
                        color: 'rgba(255,255,255,.6)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, flexShrink: 0,
                      }}
                    >×</button>
                  )}
                </div>
              </div>

              {/* Right panel: quick stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
                {[
                  { label: 'Статей в базе знаний', value: String(FAQS.length), color: 'rgba(255,255,255,.9)', dimColor: 'rgba(255,255,255,.45)' },
                  { label: 'Категорий раздела', value: String(CATEGORIES.length - 1), color: 'rgba(255,255,255,.9)', dimColor: 'rgba(255,255,255,.45)' },
                  { label: 'Просмотров всего', value: `${Math.round(FAQS.reduce((a, b) => a + b.views, 0) / 1000)}K`, color: 'rgba(255,255,255,.9)', dimColor: 'rgba(255,255,255,.45)' },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,.07)',
                    border: '1px solid rgba(255,255,255,.10)',
                    borderRadius: 12,
                    backdropFilter: 'blur(6px)',
                  }}>
                    <span style={{ fontSize: 13, color: s.dimColor }}>{s.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="faq-stagger-2" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18,
        }}>
          <StatCard delay={0} label="Статей в базе" value={String(FAQS.length)}
            color="var(--accent)" bg="var(--accent-light)"
            iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          <StatCard delay={.06} label="Категорий" value={String(CATEGORIES.length - 1)}
            color="#7C3AED" bg="#F3EEFF"
            iconPath="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          <StatCard delay={.12} label="Просмотров всего"
            value={`${Math.round(FAQS.reduce((a, b) => a + b.views, 0) / 1000)}K`}
            color="var(--success)" bg="var(--success-bg)"
            iconPath="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          <StatCard delay={.18} label="Популярных вопросов" value={String(FAQS.filter(f => f.hot).length)}
            color="var(--warn)" bg="var(--warn-bg)"
            iconPath="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 304px', gap: 18, alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div>
            {/* Category tabs */}
            <div className="faq-stagger-3" style={{
              background: '#fff', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)', padding: '16px 20px', marginBottom: 14,
            }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => {
                  const count = cat.id === 'all' ? FAQS.length : FAQS.filter(f => f.category === cat.id).length;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`faq-cat${isActive ? ' faq-cat--active' : ''}`}
                    >
                      <Icon path={cat.iconPath} size={14} stroke="currentColor" />
                      {cat.label}
                      <span className="faq-cat-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accordion block */}
            <div className="faq-stagger-4" style={{
              background: '#fff', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)', overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 24px', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon
                      path="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      size={18} stroke="var(--text-secondary)"
                    />
                  </div>
                  <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {search ? `Результаты: «${search}»` : 'База знаний'}
                  </span>
                </div>
                <div style={{
                  background: 'var(--surface-2)', borderRadius: 8,
                  padding: '3px 12px', fontSize: 12, fontWeight: 700,
                  color: 'var(--text-secondary)',
                }}>
                  {filtered.length} {filtered.length === 1 ? 'запись' : filtered.length < 5 ? 'записи' : 'записей'}
                </div>
              </div>

              {/* Items */}
              {filtered.length > 0 ? (
                filtered.map(item => (
                  <AccordionItem
                    key={item.id}
                    item={item}
                    isOpen={openId === item.id}
                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                  />
                ))
              ) : (
                <div className="faq-empty">
                  <div style={{
                    width: 60, height: 60, borderRadius: 18,
                    background: 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <Icon
                      path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      size={28} stroke="var(--border-2)"
                    />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    По запросу ничего не найдено
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
                    Измените поисковый запрос или выберите другую категорию
                  </div>
                  <button
                    onClick={() => { setSearch(''); setActiveCategory('all'); setActiveTag(null); }}
                    style={{
                      padding: '9px 22px', borderRadius: 10,
                      border: '1.5px solid var(--accent)', background: 'var(--accent-light)',
                      color: 'var(--accent)', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font)',
                    }}
                  >
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Popular questions */}
            <div className="faq-sidebar-card faq-stagger-3">
              <div className="faq-sidebar-header">
                <Icon
                  path="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  size={16} stroke="var(--warn)"
                />
                Популярные вопросы
              </div>
              <div style={{ padding: '10px 12px' }}>
                {popular.map((item, i) => (
                  <div
                    key={item.id}
                    className="faq-popular-row"
                    onClick={() => {
                      setActiveCategory('all');
                      setOpenId(item.id);
                      setSearch('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <span style={{
                      fontSize: 11, fontWeight: 800, color: 'var(--accent)',
                      width: 22, flexShrink: 0, marginTop: 2, lineHeight: 1,
                    }}>{String(i + 1).padStart(2, '0')}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13, color: 'var(--text-primary)',
                        lineHeight: 1.4, fontWeight: 500, marginBottom: 4,
                      }}>{item.question}</div>
                      <div style={{
                        fontSize: 11, color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Icon
                          path="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          size={11} stroke="var(--text-muted)"
                        />
                        {item.views.toLocaleString('ru')} просмотров
                      </div>
                    </div>
                    <Icon path="M9 18l6-6-6-6" size={14} stroke="var(--border-2)" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="faq-sidebar-card faq-stagger-4">
              <div className="faq-sidebar-header">
                <Icon path="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" size={16} stroke="var(--text-secondary)" />
                Тематические метки
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {POPULAR_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`faq-tag${activeTag === tag ? ' faq-tag--active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="faq-contact faq-stagger-5">
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.16)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                }}>
                  <Icon
                    path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    size={20} stroke="#fff" strokeWidth={1.6}
                  />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  Не нашли ответ?
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.6, marginBottom: 18 }}>
                  Обратитесь в службу технической поддержки — ответим в течение рабочего дня
                </div>
                <button className="faq-contact-btn" onClick={() => navigate('/support')}>
                  Обратиться в поддержку
                </button>
              </div>
            </div>

            {/* Category nav */}
            <div className="faq-sidebar-card faq-stagger-6">
              <div className="faq-sidebar-header">
                <Icon path="M4 6h16M4 12h16M4 18h7" size={16} stroke="var(--text-secondary)" />
                По категориям
              </div>
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                const count = FAQS.filter(f => f.category === cat.id).length;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`faq-cat-nav-btn${isActive ? ' faq-cat-nav-btn--active' : ''}`}
                    style={{
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    <Icon path={cat.iconPath} size={15} stroke="currentColor" />
                    <span style={{ flex: 1 }}>{cat.label}</span>
                    <span style={{
                      background: isActive ? 'var(--accent)' : 'var(--surface-2)',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 7,
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
