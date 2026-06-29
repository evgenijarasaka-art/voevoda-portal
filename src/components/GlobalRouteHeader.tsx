import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { PortalPageTop } from './PortalPageTop';
import type { BreadcrumbItem } from './PortalBreadcrumb';
import { SIDEBAR_ICONS } from './Sidebar';

type RouteHeader = {
  title: string;
  parent?: BreadcrumbItem;
  icon: string;
};

const exact: Record<string, RouteHeader> = {
  '/documents': { title:'Документы', icon:'document' },
  '/privacy': { title:'Политика конфиденциальности', icon:'document' },
  '/terms': { title:'Пользовательское соглашение', icon:'document' },
  '/cookies': { title:'Политика cookie', icon:'document' },
  '/favorites': { title:'Избранное', parent:{ label:'Личный кабинет', to:'/profile' }, icon:'favorites' },
  '/cart': { title:'Корзина', icon:'cart' },
  '/notifications': { title:'Уведомления', icon:'subscriptions' },
  '/checkout': { title:'Оформление заказа', parent:{ label:'Корзина', to:'/cart' }, icon:'shop' },
  '/courses': { title:'Военная подготовка', icon:'military' },
  '/journal': { title:'Журнал', icon:'journal' },
  '/profile': { title:'Личное дело', icon:'profile' },
  '/profile/edit': { title:'Редактирование профиля', parent:{ label:'Личное дело', to:'/profile' }, icon:'profile' },
  '/edit-profile': { title:'Редактирование профиля', parent:{ label:'Личное дело', to:'/profile' }, icon:'profile' },
  '/my-path': { title:'Путь Воеводы', icon:'path' },
  '/my-courses': { title:'Мои курсы', parent:{ label:'Личный кабинет', to:'/profile' }, icon:'courses' },
  '/study-groups': { title:'Мои учебные группы', parent:{ label:'Мои курсы', to:'/my-courses' }, icon:'subscribers' },
  '/study-groups/structure': { title:'Организационно-штатная структура', parent:{ label:'Учебные группы', to:'/study-groups' }, icon:'subscribers' },
  '/study-groups/report': { title:'Рапорт бойца', parent:{ label:'Учебные группы', to:'/study-groups' }, icon:'document' },
  '/exercises': { title:'Учения', icon:'exercises' },
  '/kaptorka': { title:'Каптёрка', icon:'kaptorka' },
  '/messages': { title:'Диалоги', icon:'dialogs' },
  '/dialogs': { title:'Диалоги', icon:'dialogs' },
  '/microblog': { title:'Блог', icon:'microblog' },
  '/shop': { title:'Военмаркет', icon:'market' },
  '/market': { title:'Военмаркет', icon:'market' },
  '/communities': { title:'Сообщества', icon:'communities' },
  '/referral': { title:'Партнёрская программа', parent:{ label:'Личный кабинет', to:'/profile' }, icon:'partner' },
  '/faq': { title:'Вопросы и ответы', icon:'qa' },
  '/qa': { title:'Вопросы и ответы', icon:'qa' },
  '/company': { title:'О компании', icon:'company' },
  '/about': { title:'О компании', icon:'company' },
  '/advertise': { title:'Рекламный кабинет', icon:'ads' },
  '/ads': { title:'Рекламный кабинет', icon:'ads' },
  '/my-circle': { title:'Мой круг', parent:{ label:'Личный кабинет', to:'/profile' }, icon:'circle' },
  '/my-journal': { title:'Мой журнал', parent:{ label:'Личный кабинет', to:'/profile' }, icon:'myjournal' },
  '/leaders': { title:'Рейтинг участников', icon:'users' },
  '/competitions': { title:'Соревнования', icon:'competitions' },
  '/wallet': { title:'Кошелёк', parent:{ label:'Личный кабинет', to:'/profile' }, icon:'payments' },
  '/payments': { title:'История платежей', parent:{ label:'Кошелёк', to:'/wallet' }, icon:'payments' },
  '/achievements': { title:'Знаки отличия', parent:{ label:'Личный кабинет', to:'/profile' }, icon:'achievements' },
  '/all-achievements': { title:'Все достижения', parent:{ label:'Мой профиль', to:'/profile' }, icon:'achievements' },
  '/subscriptions': { title:'Подписки', parent:{ label:'Сообщества', to:'/communities' }, icon:'subscriptions' },
  '/subscribers': { title:'Подписчики', parent:{ label:'Сообщества', to:'/communities' }, icon:'subscribers' },
  '/settings': { title:'Настройки', icon:'settings' },
  '/professional': { title:'Профессиональная подготовка', icon:'professional' },
  '/support': { title:'Поддержка', icon:'document' },
  '/billing': { title:'Управление подпиской', parent:{ label:'Личный кабинет', to:'/profile' }, icon:'wallet' },
  '/restore': { title:'Восстановление доступа', icon:'settings' },
  '/teachers': { title:'Преподаватели', icon:'users' },
  '/commanders': { title:'Командиры', icon:'users' },
};

function configFor(pathname: string, search = ''): RouteHeader {
  if (exact[pathname]) return exact[pathname];
  if (pathname.startsWith('/city/')) {
    const isProfessional = new URLSearchParams(search).get('track') === 'professional';
    const parent = isProfessional
      ? { label:'Профессиональная подготовка', to:'/professional' }
      : { label:'Военная подготовка', to:'/courses' };
    return { title:`${parent.label} — ${decodeURIComponent(pathname.split('/').pop() || '')}`, parent, icon:isProfessional ? 'professional' : 'book' };
  }
  if (pathname.startsWith('/courses/')) return { title:decodeURIComponent(pathname.split('/').pop() || 'Курс'), parent:{ label:'Военная подготовка', to:'/courses' }, icon:'book' };
  if (pathname.startsWith('/professional/')) return { title:decodeURIComponent(pathname.split('/').pop() || 'Курс'), parent:{ label:'Профессиональная подготовка', to:'/professional' }, icon:'professional' };
  if (pathname.startsWith('/my-courses/') && pathname.endsWith('/progress')) return { title:'Прогресс курса', parent:{ label:'Мои курсы', to:'/my-courses' }, icon:'book' };
  if (pathname.startsWith('/my-courses/')) return { title:decodeURIComponent(pathname.split('/').pop() || 'Курс'), parent:{ label:'Мои курсы', to:'/my-courses' }, icon:'book' };
  if (pathname.startsWith('/lessons/')) return { title:'Урок', parent:{ label:'Мои курсы', to:'/my-courses' }, icon:'book' };
  if (pathname.startsWith('/tests/')) return { title:'Тестирование', parent:{ label:'Мои курсы', to:'/my-courses' }, icon:'book' };
  if (pathname.startsWith('/homework/')) return { title:'Домашнее задание', parent:{ label:'Мои курсы', to:'/my-courses' }, icon:'book' };
  if (pathname.startsWith('/exercises/')) return { title:'Учения', parent:{ label:'Учения', to:'/exercises' }, icon:'book' };
  if (pathname.startsWith('/journal/')) return { title:'Статья журнала', parent:{ label:'Журнал', to:'/journal' }, icon:'journal' };
  if (pathname.startsWith('/market/') || pathname.startsWith('/shop/')) return { title:'Товар', parent:{ label:'Военмаркет', to:'/market' }, icon:'shop' };
  if (pathname.startsWith('/kaptorka/')) return { title:'Объявление', parent:{ label:'Каптёрка', to:'/kaptorka' }, icon:'shop' };
  if (pathname.startsWith('/users/')) return { title:'Профиль участника', parent:{ label:'Сообщества', to:'/communities' }, icon:'user' };
  if (pathname === '/course-archive') return { title:'Архив курсов', parent:{ label:'Профиль', to:'/profile' }, icon:'book' };
  return { title:'Страница портала', icon:'grid' };
}

function RouteIcon({ type }: { type: RouteHeader['icon'] }) {
  const aliases: Record<string, string> = {
    book: 'military', user: 'profile', users: 'communities', shop: 'market',
    wallet: 'payments', grid: 'path', document: 'journal',
  };
  return <>{SIDEBAR_ICONS[type] ?? SIDEBAR_ICONS[aliases[type]] ?? SIDEBAR_ICONS.home}</>;
}

export function GlobalRouteHeader() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const isStandaloneRoute = pathname === '/dialogs'
    || pathname === '/messages'
    || pathname === '/shop'
    || pathname === '/market'
    || pathname.startsWith('/shop/')
    || pathname.startsWith('/market/')
    || pathname === '/kaptorka'
    || pathname.startsWith('/kaptorka/');

  if (isStandaloneRoute) return null;

  const config = configFor(pathname, search);
  const isSocialRoute = ['/my-circle', '/communities', '/subscriptions', '/subscribers'].includes(pathname);
  const isCityRoute = pathname.startsWith('/city/');
  const isPathRoute = pathname === '/all-achievements';
  const breadcrumbs: BreadcrumbItem[] = [{ label:'Главная', to:'/' }];
  breadcrumbs[0] = { label:'Главная', to:'/' };
  if (config.parent) breadcrumbs.push(config.parent);
  if (isCityRoute) breadcrumbs.push({ label:'Города' });
  if (!isCityRoute) breadcrumbs.push({ label:config.title });

  const cityActions = pathname.startsWith('/city/') ? (
    <button className="cp-btn-o" onClick={() => navigate('/messages?chat=7')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Связаться с представителем
    </button>
  ) : undefined;

  const socialNavigation = isSocialRoute ? (
    <nav className="global-social-nav" aria-label="Разделы личного круга">
      <NavLink to="/my-circle" end>Друзья</NavLink>
      <NavLink to="/communities" end>Сообщества</NavLink>
      <NavLink to="/subscriptions" end>Подписки</NavLink>
      <NavLink to="/subscribers" end>Подписчики</NavLink>
    </nav>
  ) : undefined;

  return <PortalPageTop title={config.title} icon={<RouteIcon type={config.icon} />} breadcrumbs={breadcrumbs} actions={cityActions ?? socialNavigation} className={`global-route-header${isSocialRoute ? ' global-route-header--social' : ''}${isCityRoute ? ' global-route-header--city' : ''}${isPathRoute ? ' global-route-header--path' : ''}`} />;
}
