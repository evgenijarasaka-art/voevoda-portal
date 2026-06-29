import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userProfilePath } from '../api/testApi';
import './social-pages.css';

type Mode = 'subscribers' | 'subscriptions';
type Filter = 'all' | 'mutual' | 'new' | 'people' | 'communities' | 'authors';

type Connection = {
  id: number;
  name: string;
  handle: string;
  image: string;
  description: string;
  online?: boolean;
  mutual?: boolean;
  recent?: boolean;
  type: 'people' | 'communities' | 'authors';
};

const subscribers: Connection[] = [
  { id: 1, name: 'Вихрь', handle: '@vihor · СС-2', image: '/teacher1-small1.jpg', description: 'Майор · 1 288 подписчиков · подписался 3 апреля', online: true, recent: true, type: 'people' },
  { id: 2, name: 'Тайфун', handle: '@taifun · ВДВ-9', image: '/teacher1-small2.jpg', description: 'Ефрейтор · 344 подписчика', online: true, mutual: true, type: 'people' },
  { id: 3, name: 'Лавина', handle: '@lavina · ССО-5', image: '/teacher2-main.jpg', description: 'Сержант · учебная группа КМБ-11', recent: true, type: 'people' },
  { id: 4, name: 'Скала', handle: '@skala · КМБ-11', image: '/teacher1-main.jpg', description: 'Рядовой · 12 подписчиков', mutual: true, type: 'people' },
  { id: 5, name: 'Метель', handle: '@metel · ВДВ-3', image: '/teacher3-main.jpg', description: 'Лейтенант · наставник по тактике', online: true, type: 'people' },
];

const subscriptions: Connection[] = [
  { id: 11, name: 'Гром', handle: '@grom · ВДВ-12', image: '/teacher1-small1.jpg', description: 'Майор · 12 курсов пройдено', online: true, mutual: true, type: 'people' },
  { id: 12, name: 'Сокол', handle: '@sokol · ВДМО-3', image: '/teacher2-main.jpg', description: 'Лейтенант · тактика и медицина', online: true, mutual: true, type: 'people' },
  { id: 13, name: 'Российское военно-историческое общество', handle: '@rvio', image: '/soobsh1.png', description: '4 821 участник · Москва', type: 'communities' },
  { id: 14, name: 'Силы специальных операций', handle: '@sso', image: '/soobsh2.png', description: '2 340 участников · Россия', type: 'communities' },
  { id: 15, name: 'Иванов А. В.', handle: 'Инструктор', image: '/teacher1-main.jpg', description: 'Автор 6 курсов · 2 481 подписчик', online: true, type: 'authors' },
  { id: 16, name: 'Петров В. С.', handle: 'Методист', image: '/teacher1-small2.jpg', description: 'Автор 3 курсов · 891 подписчик', type: 'authors' },
];

export function SocialConnections({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const source = mode === 'subscribers' ? subscribers : subscriptions;
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [following, setFollowing] = useState<number[]>(source.filter(item => item.mutual).map(item => item.id));
  const [hidden, setHidden] = useState<number[]>([]);

  const visible = useMemo(() => source.filter(item => {
    if (hidden.includes(item.id)) return false;
    const text = `${item.name} ${item.handle} ${item.description}`.toLowerCase();
    const matchesQuery = text.includes(query.trim().toLowerCase());
    const matchesFilter = filter === 'all'
      || (filter === 'mutual' && following.includes(item.id))
      || (filter === 'new' && item.recent)
      || item.type === filter;
    return matchesQuery && matchesFilter;
  }), [filter, following, hidden, query, source]);

  const filters: Array<[Filter, string]> = mode === 'subscribers'
    ? [['all', 'Все'], ['mutual', 'Взаимные'], ['new', 'Новые']]
    : [['all', 'Все'], ['mutual', 'Взаимные'], ['people', 'Люди'], ['communities', 'Сообщества'], ['authors', 'Авторы курсов']];

  const openConnection = (item: Connection) => navigate(item.type === 'communities' ? '/communities' : userProfilePath(item.name));

  return (
    <div className="connections-page">
      <div className="connections-shell">
        <section className="connections-head">
          <div>
            <div className="connections-kicker">социальные связи</div>
            <h1 className="connections-title">Моё окружение</h1>
            <p className="connections-copy">Подписчики и подписки на портале</p>
          </div>
        </section>

        <section className="connections-stats" aria-label="Сводка">
          <div className="connections-stat"><strong>{source.length - hidden.length}</strong><span>{mode === 'subscribers' ? 'всего подписчиков' : 'активных подписок'}</span></div>
          <div className="connections-stat"><strong>{following.length}</strong><span>взаимных связей</span></div>
          <div className="connections-stat"><strong>{mode === 'subscribers' ? source.filter(item => item.recent).length : source.filter(item => item.type === 'communities').length}</strong><span>{mode === 'subscribers' ? 'новых за месяц' : 'сообществ в ленте'}</span></div>
        </section>

        <section className="connections-panel">
          <div className="connections-toolbar">
            <div className="connections-filters">
              {filters.map(([value, label]) => (
                <button key={value} className={`connections-filter${filter === value ? ' active' : ''}`} onClick={() => setFilter(value)}>{label}</button>
              ))}
            </div>
            <input className="connections-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Поиск по имени, позывному или группе" aria-label="Поиск" />
          </div>

          <div className="connections-list">
            {visible.length === 0 && <div className="connection-empty">По этому запросу никого не найдено.</div>}
            {visible.map(item => {
              const isFollowing = following.includes(item.id);
              return (
                <article className="connection-row" key={item.id}>
                  <div className="connection-avatar">
                    <img src={item.image} alt="" />
                    {item.online && <span className="connection-online" title="В сети" />}
                  </div>
                  <div className="connection-main">
                    <div className="connection-name">
                      {item.name}
                      {isFollowing && <span className="connection-badge">Взаимная связь</span>}
                    </div>
                    <div className="connection-handle">{item.handle}</div>
                    <div className="connection-desc">{item.description}</div>
                  </div>
                  <div className="connection-actions">
                    <button className="connection-btn" onClick={() => openConnection(item)}>{item.type === 'communities' ? 'Открыть' : 'Профиль'}</button>
                    {mode === 'subscribers' ? (
                      <button className={`connection-btn${isFollowing ? ' primary' : ''}`} onClick={() => setFollowing(list => isFollowing ? list.filter(id => id !== item.id) : [...list, item.id])}>
                        {isFollowing ? 'Подписан' : 'Подписаться'}
                      </button>
                    ) : (
                      <button className="connection-btn" onClick={() => setHidden(list => [...list, item.id])}>Отписаться</button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
