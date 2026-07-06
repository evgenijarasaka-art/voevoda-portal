import { useLocation, useNavigate } from 'react-router-dom';

type Link = { label: string; to: string };
type FooterCfg = { title: string; subtitle: string; related: Link[] };

const CORE: Link[] = [
  { label: 'Главная', to: '/' },
  { label: 'Курсы', to: '/courses' },
  { label: 'Каптёрка', to: '/kaptorka' },
  { label: 'Военторг', to: '/shop' },
  { label: 'Сообщество', to: '/communities' },
  { label: 'Журнал', to: '/journal' },
  { label: 'Профиль', to: '/profile' },
];

/* Логически связанные переходы для каждого раздела портала. */
function getConfig(pathname: string): FooterCfg {
  const seg = '/' + (pathname.split('/')[1] || '');

  const MAP: Record<string, FooterCfg> = {
    '/courses': {
      title: 'Продолжайте обучение',
      subtitle: 'Подберите курс и познакомьтесь с инструкторами',
      related: [
        { label: 'Все курсы', to: '/courses' },
        { label: 'Профессиональные', to: '/professional' },
        { label: 'Преподаватели', to: '/teachers' },
        { label: 'Командиры', to: '/commanders' },
        { label: 'Города и центры', to: '/city/Москва' },
        { label: 'Соревнования', to: '/competitions' },
      ],
    },
    '/professional': {
      title: 'Профессиональная подготовка',
      subtitle: 'Курсы, инструкторы и расписание',
      related: [
        { label: 'Все курсы', to: '/courses' },
        { label: 'Преподаватели', to: '/teachers' },
        { label: 'Командиры', to: '/commanders' },
        { label: 'Соревнования', to: '/competitions' },
        { label: 'Города и центры', to: '/city/Москва' },
      ],
    },
    '/kaptorka': {
      title: 'Маркетплейс снаряжения',
      subtitle: 'Покупайте, продавайте и обменивайтесь экипировкой',
      related: [
        { label: 'Разместить объявление', to: '/kaptorka?create=1' },
        { label: 'Военторг', to: '/shop' },
        { label: 'Избранное', to: '/favorites' },
        { label: 'Сообщения', to: '/messages' },
        { label: 'Кошелёк', to: '/wallet' },
      ],
    },
    '/shop': {
      title: 'Военторг «Воевода»',
      subtitle: 'Форма, снаряжение и экипировка с доставкой',
      related: [
        { label: 'Каталог', to: '/shop' },
        { label: 'Корзина', to: '/cart' },
        { label: 'Избранное', to: '/favorites' },
        { label: 'Оформление', to: '/checkout' },
        { label: 'Платежи', to: '/payments' },
        { label: 'Каптёрка', to: '/kaptorka' },
      ],
    },
    '/market': {
      title: 'Военторг «Воевода»',
      subtitle: 'Форма, снаряжение и экипировка с доставкой',
      related: [
        { label: 'Каталог', to: '/shop' },
        { label: 'Корзина', to: '/cart' },
        { label: 'Избранное', to: '/favorites' },
        { label: 'Оформление', to: '/checkout' },
        { label: 'Каптёрка', to: '/kaptorka' },
      ],
    },
    '/profile': {
      title: 'Личный кабинет',
      subtitle: 'Обучение, достижения и финансы',
      related: [
        { label: 'Мои курсы', to: '/my-courses' },
        { label: 'Мой путь', to: '/my-path' },
        { label: 'Достижения', to: '/achievements' },
        { label: 'Кошелёк', to: '/wallet' },
        { label: 'Подписки', to: '/subscriptions' },
        { label: 'Настройки', to: '/settings' },
      ],
    },
    '/my-courses': {
      title: 'Ваше обучение',
      subtitle: 'Курсы, уроки и домашние задания',
      related: [
        { label: 'Мой путь', to: '/my-path' },
        { label: 'Достижения', to: '/achievements' },
        { label: 'Журнал', to: '/journal' },
        { label: 'Военторг', to: '/shop' },
        { label: 'Профиль', to: '/profile' },
      ],
    },
    '/lessons': {
      title: 'Ваше обучение',
      subtitle: 'Уроки, задания и материалы',
      related: [
        { label: 'Мои курсы', to: '/my-courses' },
        { label: 'Мой путь', to: '/my-path' },
        { label: 'Достижения', to: '/achievements' },
        { label: 'Сообщения', to: '/messages' },
        { label: 'Журнал', to: '/journal' },
      ],
    },
    '/journal': {
      title: 'Журнал и сообщество',
      subtitle: 'Статьи, микроблоги и обсуждения',
      related: [
        { label: 'Все статьи', to: '/journal' },
        { label: 'Микроблог', to: '/microblog' },
        { label: 'Сообщество', to: '/communities' },
        { label: 'Соревнования', to: '/competitions' },
        { label: 'Лидеры', to: '/leaders' },
      ],
    },
    '/microblog': {
      title: 'Журнал и сообщество',
      subtitle: 'Статьи, микроблоги и обсуждения',
      related: [
        { label: 'Журнал', to: '/journal' },
        { label: 'Сообщество', to: '/communities' },
        { label: 'Мой круг', to: '/my-circle' },
        { label: 'Лидеры', to: '/leaders' },
        { label: 'Соревнования', to: '/competitions' },
      ],
    },
    '/teachers': {
      title: 'Люди «Воеводы»',
      subtitle: 'Инструкторы, командиры и лидеры',
      related: [
        { label: 'Преподаватели', to: '/teachers' },
        { label: 'Командиры', to: '/commanders' },
        { label: 'Лидеры', to: '/leaders' },
        { label: 'Сообщество', to: '/communities' },
        { label: 'Курсы', to: '/courses' },
      ],
    },
    '/commanders': {
      title: 'Люди «Воеводы»',
      subtitle: 'Инструкторы, командиры и лидеры',
      related: [
        { label: 'Командиры', to: '/commanders' },
        { label: 'Преподаватели', to: '/teachers' },
        { label: 'Лидеры', to: '/leaders' },
        { label: 'Сообщество', to: '/communities' },
        { label: 'Курсы', to: '/courses' },
      ],
    },
    '/leaders': {
      title: 'Люди «Воеводы»',
      subtitle: 'Рейтинг и достижения участников',
      related: [
        { label: 'Лидеры', to: '/leaders' },
        { label: 'Преподаватели', to: '/teachers' },
        { label: 'Командиры', to: '/commanders' },
        { label: 'Сообщество', to: '/communities' },
        { label: 'Соревнования', to: '/competitions' },
      ],
    },
    '/communities': {
      title: 'Сообщество',
      subtitle: 'Круги, подписки и общение',
      related: [
        { label: 'Мой круг', to: '/my-circle' },
        { label: 'Подписки', to: '/subscriptions' },
        { label: 'Подписчики', to: '/subscribers' },
        { label: 'Лидеры', to: '/leaders' },
        { label: 'Микроблог', to: '/microblog' },
      ],
    },
    '/company': {
      title: 'О проекте «Воевода»',
      subtitle: 'Информация, поддержка и документы',
      related: [
        { label: 'О компании', to: '/company' },
        { label: 'Реклама', to: '/advertise' },
        { label: 'Вопросы и ответы', to: '/faq' },
        { label: 'Поддержка', to: '/support' },
        { label: 'Документы', to: '/documents' },
      ],
    },
    '/faq': {
      title: 'Помощь и поддержка',
      subtitle: 'Ответы на вопросы и связь с нами',
      related: [
        { label: 'Вопросы и ответы', to: '/faq' },
        { label: 'Поддержка', to: '/support' },
        { label: 'О компании', to: '/company' },
        { label: 'Документы', to: '/documents' },
        { label: 'Реклама', to: '/advertise' },
      ],
    },
    '/support': {
      title: 'Помощь и поддержка',
      subtitle: 'Ответы на вопросы и связь с нами',
      related: [
        { label: 'Поддержка', to: '/support' },
        { label: 'Вопросы и ответы', to: '/faq' },
        { label: 'О компании', to: '/company' },
        { label: 'Документы', to: '/documents' },
      ],
    },
    '/wallet': {
      title: 'Финансы и платежи',
      subtitle: 'Кошелёк, платежи и заказы',
      related: [
        { label: 'Кошелёк', to: '/wallet' },
        { label: 'Платежи', to: '/payments' },
        { label: 'Корзина', to: '/cart' },
        { label: 'Военторг', to: '/shop' },
        { label: 'Профиль', to: '/profile' },
      ],
    },
    '/cart': {
      title: 'Оформление заказа',
      subtitle: 'Корзина, оплата и доставка',
      related: [
        { label: 'Каталог', to: '/shop' },
        { label: 'Корзина', to: '/cart' },
        { label: 'Оформление', to: '/checkout' },
        { label: 'Избранное', to: '/favorites' },
        { label: 'Платежи', to: '/payments' },
      ],
    },
    '/favorites': {
      title: 'Избранное',
      subtitle: 'Сохранённые товары и курсы',
      related: [
        { label: 'Военторг', to: '/shop' },
        { label: 'Каптёрка', to: '/kaptorka' },
        { label: 'Курсы', to: '/courses' },
        { label: 'Корзина', to: '/cart' },
      ],
    },
    '/competitions': {
      title: 'Соревнования и события',
      subtitle: 'Турниры, рейтинги и расписание',
      related: [
        { label: 'Соревнования', to: '/competitions' },
        { label: 'Лидеры', to: '/leaders' },
        { label: 'Курсы', to: '/courses' },
        { label: 'Журнал', to: '/journal' },
        { label: 'Сообщество', to: '/communities' },
      ],
    },
  };

  // Алиасы маршрутов на одинаковые конфигурации.
  const aliases: Record<string, string> = {
    '/about': '/company',
    '/advertise': '/company',
    '/ads': '/company',
    '/qa': '/faq',
    '/users': '/profile',
    '/edit-profile': '/profile',
    '/settings': '/profile',
    '/subscriptions': '/communities',
    '/subscribers': '/communities',
    '/my-circle': '/communities',
    '/my-journal': '/journal',
    '/tests': '/lessons',
    '/homework': '/lessons',
    '/achievements': '/my-courses',
    '/payments': '/wallet',
    '/billing': '/wallet',
    '/checkout': '/cart',
    '/city': '/courses',
  };

  return MAP[seg] || MAP[aliases[seg]] || {
    title: 'Навигация по порталу',
    subtitle: 'Быстрый переход в основные разделы «Воеводы»',
    related: CORE.slice(1),
  };
}

// Маршруты без быстрого футера: чат и страницы с собственным большим футером.
const SKIP = new Set(['/', '/my-path', '/privacy', '/terms', '/cookies', '/messages', '/dialogs']);

const CSS = `
.vqf { margin-left:56px; background:#F7F8FA; padding:24px; box-sizing:border-box; }
@media(max-width:560px){ .vqf { margin-left:0; padding:16px; } }
.vqf-card { max-width:1280px; margin:0 auto; background:#fff; border-radius:24px; box-shadow:0 4px 16px rgba(15,23,42,.08); overflow:hidden; }
@media(max-width:560px){ .vqf-card { border-radius:20px; } }
.vqf-inner { padding:36px 36px 28px; display:grid; grid-template-columns:minmax(0,.85fr) minmax(0,1.6fr); gap:34px; align-items:start; }
@media(max-width:860px){ .vqf-inner { grid-template-columns:1fr; gap:24px; padding:28px 22px 22px; } }
.vqf-eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:11px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:#2450D8; margin-bottom:12px; }
.vqf-eyebrow::before { content:''; width:7px; height:7px; border-radius:50%; background:#375DFB; box-shadow:0 0 0 4px rgba(55,93,251,.14); }
.vqf-title { font-size:22px; font-weight:800; color:#111827; line-height:1.2; margin-bottom:7px; letter-spacing:-.01em; }
.vqf-subtitle { font-size:14px; color:#4B5563; line-height:1.55; margin-bottom:18px; max-width:330px; }
.vqf-top { display:inline-flex; align-items:center; gap:7px; height:40px; padding:0 17px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#374151; font-size:13px; font-weight:700; cursor:pointer; transition:transform .2s ease,background .2s ease,border-color .2s ease,color .2s ease,box-shadow .2s ease; }
.vqf-top:hover { transform:translateY(-2px); border-color:#C7D2FE; color:#2450D8; background:#F3F6FF; box-shadow:0 8px 20px rgba(55,93,251,.12); }
.vqf-cols { display:grid; grid-template-columns:1fr 1fr; gap:30px; }
@media(max-width:560px){ .vqf-cols { grid-template-columns:1fr; gap:22px; } }
.vqf-col-h { font-size:13px; font-weight:800; letter-spacing:.02em; color:#111827; margin-bottom:14px; }
.vqf-chips { display:flex; flex-wrap:wrap; gap:9px; }
.vqf-chip { display:inline-flex; align-items:center; gap:7px; height:40px; padding:0 16px; border:1px solid #E5E7EB; border-radius:11px; background:#F7F9FF; color:#374151; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; transition:transform .22s cubic-bezier(.2,.8,.2,1),background .2s ease,border-color .2s ease,color .2s ease,box-shadow .2s ease; }
.vqf-chip svg { opacity:0; width:0; transition:opacity .2s ease,width .2s ease; }
.vqf-chip:hover { transform:translateY(-3px); background:#EEF4FF; border-color:#C7D2FE; color:#2450D8; box-shadow:0 10px 24px rgba(55,93,251,.14); }
.vqf-chip:hover svg { opacity:1; width:13px; }
.vqf-bottom { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:18px 36px; border-top:1px solid #F0F1F3; background:#fff; }
@media(max-width:860px){ .vqf-bottom { padding:16px 22px; } }
.vqf-bottom > span { font-size:13px; color:#6B7280; }
.vqf-bottom-links { display:flex; gap:16px; flex-wrap:wrap; }
.vqf-bottom-links button { border:none; background:none; color:#6B7280; font-size:13px; cursor:pointer; padding:0; transition:color .18s ease; }
.vqf-bottom-links button:hover { color:#2450D8; }
`;

function injectCss() {
  if (typeof document === 'undefined' || document.getElementById('vqf-css')) return;
  const s = document.createElement('style'); s.id = 'vqf-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

const Arrow = () => (
  <svg viewBox="0 0 24 24" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

export function QuickFooter() {
  const location = useLocation();
  const navigate = useNavigate();

  const seg = '/' + (location.pathname.split('/')[1] || '');
  if (SKIP.has(location.pathname) || SKIP.has(seg)) return null;

  injectCss();
  const cfg = getConfig(location.pathname);

  const go = (to: string) => {
    navigate(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const year = new Date().getFullYear();

  return (
    <footer className="vqf">
      <div className="vqf-card">
        <div className="vqf-inner">
          <div>
            <div className="vqf-eyebrow">Быстрый переход</div>
            <div className="vqf-title">{cfg.title}</div>
            <div className="vqf-subtitle">{cfg.subtitle}</div>
            <button className="vqf-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
              Наверх страницы
            </button>
          </div>
          <div className="vqf-cols">
            <div>
              <div className="vqf-col-h">Куда дальше</div>
              <div className="vqf-chips">
                {cfg.related.map((l) => (
                  <button key={l.label + l.to} className="vqf-chip" onClick={() => go(l.to)}>{l.label}<Arrow /></button>
                ))}
              </div>
            </div>
            <div>
              <div className="vqf-col-h">Разделы портала</div>
              <div className="vqf-chips">
                {CORE.map((l) => (
                  <button key={l.label} className="vqf-chip" onClick={() => go(l.to)}>{l.label}<Arrow /></button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="vqf-bottom">
          <span>© {year} УТЦ «ВОЕВОДА»</span>
          <div className="vqf-bottom-links">
            <button onClick={() => go('/company')}>О компании</button>
            <button onClick={() => go('/support')}>Поддержка</button>
            <button onClick={() => go('/privacy')}>Конфиденциальность</button>
            <button onClick={() => go('/documents')}>Документы</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
