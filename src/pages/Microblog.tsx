import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

type FeedFilter = 'all' | 'communities' | 'friends' | 'achievements';
type FeedItemType = 'post' | 'achievement' | 'course' | 'event';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

interface FeedItem {
  id: number;
  type: FeedItemType;
  source: 'community' | 'friend' | 'system';
  author: string;
  handle: string;
  avatar: string;
  title?: string;
  text: string;
  time: string;
  image?: string;
  badge?: {
    label: string;
    tone: 'gold' | 'green' | 'blue' | 'red';
  };
  community?: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  reposts: number;
  liked: boolean;
  saved: boolean;
  celebrated?: boolean;
}

interface Person {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  following: boolean;
}

interface Community {
  id: string;
  name: string;
  avatar: string;
  members: string;
  lastUpdate: string;
  following: boolean;
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

.blog-feed-page {
  --ink: #101828;
  --muted: #667085;
  --soft: #F5F7FB;
  --line: #E1E7F0;
  --blue: #2F61F4;
  --blue-soft: #ECF2FF;
  --green: #13966D;
  --green-soft: #E9F8F1;
  --gold: #B7791F;
  --gold-soft: #FFF6DF;
  --red: #C03535;
  --red-soft: #FFF0F0;
  --panel: #FFFFFF;
  --shadow: 0 10px 30px rgba(16,24,40,.08);
  margin-left: 56px;
  padding-top: 60px;
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(47,97,244,.08), rgba(47,97,244,0) 260px),
    #F4F6FA;
  color: var(--ink);
  font-family: 'Montserrat', system-ui, sans-serif;
}

.blog-feed-page * {
  box-sizing: border-box;
}

.blog-shell {
  max-width: 1320px;
  margin: 0 auto;
  padding: 22px 24px 56px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 22px;
  align-items: start;
}

.blog-topbar {
  background: rgba(255,255,255,.88);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 8px 22px rgba(16,24,40,.05);
  backdrop-filter: blur(12px);
  margin-bottom: 14px;
}

.blog-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 7px;
}

.blog-title-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
}

.blog-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.08;
  letter-spacing: 0;
  font-weight: 900;
}

.blog-subtitle {
  max-width: 640px;
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}

.blog-stats {
  display: grid;
  grid-template-columns: repeat(3, 108px);
  gap: 8px;
}

.blog-stat {
  background: var(--soft);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
}

.blog-stat b {
  display: block;
  font-size: 17px;
  line-height: 1;
  margin-bottom: 4px;
}

.blog-stat span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}

.blog-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 14px 0;
}

.blog-tab {
  border: 1px solid var(--line);
  background: #fff;
  color: #344054;
  border-radius: 10px;
  padding: 10px 13px;
  min-height: 40px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background .16s ease, border-color .16s ease, color .16s ease, transform .16s ease;
}

.blog-tab:hover,
.blog-tab.active {
  background: var(--blue-soft);
  border-color: #B9CAFF;
  color: var(--blue);
}

.blog-tab:hover {
  transform: translateY(-1px);
}

.blog-composer,
.feed-card,
.side-panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(16,24,40,.04);
}

.blog-composer {
  padding: 16px;
  margin-bottom: 14px;
}

.composer-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: #E5EAF2;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,.8);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.composer-body {
  flex: 1;
}

.composer-input {
  width: 100%;
  min-height: 76px;
  resize: vertical;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 13px 14px;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ink);
  background: #FAFBFD;
  transition: border-color .16s ease, box-shadow .16s ease, background .16s ease;
}

.composer-input:focus {
  border-color: #98B4FF;
  box-shadow: 0 0 0 4px rgba(47,97,244,.1);
  background: #fff;
}

.composer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
}

.icon-button,
.action-button {
  border: 0;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
  color: var(--muted);
  transition: background .16s ease, color .16s ease, transform .16s ease;
}

.icon-button {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  background: #fff;
}

.icon-button:hover {
  color: var(--blue);
  background: var(--blue-soft);
  transform: translateY(-1px);
}

.publish-button {
  border: 0;
  min-height: 38px;
  border-radius: 10px;
  padding: 0 18px;
  background: var(--blue);
  color: #fff;
  font-family: inherit;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  transition: opacity .16s ease, transform .16s ease, box-shadow .16s ease;
}

.publish-button:disabled {
  cursor: not-allowed;
  opacity: .42;
}

.publish-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(47,97,244,.24);
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@keyframes feedIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.feed-card {
  overflow: hidden;
  animation: feedIn .28s ease both;
}

.feed-card-header {
  padding: 16px 16px 0;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.author-line {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.author-name {
  font-size: 14px;
  font-weight: 900;
  color: var(--ink);
}

.handle,
.time {
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
}

.source-chip,
.badge-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 800;
}

.source-chip {
  background: var(--soft);
  color: #475467;
  border: 1px solid var(--line);
}

.badge-chip.gold { background: var(--gold-soft); color: var(--gold); }
.badge-chip.green { background: var(--green-soft); color: var(--green); }
.badge-chip.blue { background: var(--blue-soft); color: var(--blue); }
.badge-chip.red { background: var(--red-soft); color: var(--red); }

.feed-card-body {
  padding: 12px 16px 0 72px;
}

.feed-title {
  margin: 0 0 7px;
  font-size: 16px;
  line-height: 1.35;
  font-weight: 900;
}

.feed-text {
  margin: 0;
  color: #344054;
  font-size: 13px;
  line-height: 1.68;
}

.feed-image {
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: #EEF2F8;
  aspect-ratio: 16 / 7;
}

.feed-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .35s ease;
}

.feed-card:hover .feed-image img {
  transform: scale(1.03);
}

.feed-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.tag-chip {
  border: 1px solid var(--line);
  background: #FAFBFD;
  color: #475467;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 700;
}

.feed-actions {
  margin-top: 14px;
  border-top: 1px solid var(--line);
  padding: 9px 16px 10px 72px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.action-button {
  border-radius: 10px;
  min-height: 34px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
}

.action-button:hover,
.action-button.active {
  background: var(--blue-soft);
  color: var(--blue);
}

.comments-box {
  border-top: 1px solid var(--line);
  background: #FAFBFD;
  padding: 12px 16px 14px 72px;
}

.comment-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-row .avatar {
  width: 30px;
  height: 30px;
}

.comment-bubble {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 9px 11px;
  flex: 1;
}

.comment-author {
  color: var(--ink);
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 3px;
}

.comment-text {
  color: #475467;
  font-size: 12px;
  line-height: 1.48;
}

.comment-form {
  display: flex;
  gap: 9px;
  align-items: center;
}

.comment-form input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 999px;
  min-height: 36px;
  padding: 0 13px;
  outline: none;
  font-family: inherit;
  font-size: 12px;
}

.comment-form input:focus {
  border-color: #98B4FF;
}

.side-column {
  position: sticky;
  top: 82px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.side-panel {
  padding: 16px;
}

.side-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.side-title h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
}

.side-title span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
}

.mini-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.mini-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.mini-copy {
  flex: 1;
  min-width: 0;
}

.mini-copy b {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.mini-copy span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--muted);
  font-size: 11px;
  margin-top: 2px;
}

.follow-button {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 9px;
  min-height: 30px;
  padding: 0 9px;
  font-family: inherit;
  color: #475467;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: background .16s ease, color .16s ease, border-color .16s ease;
}

.follow-button.active,
.follow-button:hover {
  background: var(--blue-soft);
  border-color: #B9CAFF;
  color: var(--blue);
}

.agenda {
  display: grid;
  gap: 9px;
}

.agenda-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 11px;
  background: #FAFBFD;
}

.agenda-card b {
  display: block;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 5px;
}

.agenda-card span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}

@media (max-width: 1120px) {
  .blog-shell {
    grid-template-columns: 1fr;
  }
  .side-column {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .blog-feed-page {
    margin-left: 56px;
  }
  .blog-shell {
    padding: 14px 12px 40px;
  }
  .blog-title-row {
    align-items: flex-start;
    flex-direction: column;
  }
  .blog-stats {
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
  }
  .feed-card-body,
  .feed-actions,
  .comments-box {
    padding-left: 16px;
  }
  .side-column {
    grid-template-columns: 1fr;
  }
}
`;

const initialFeed: FeedItem[] = [
  {
    id: 1,
    type: 'achievement',
    source: 'friend',
    author: 'Бек',
    handle: '@бек',
    avatar: '/teacher2-main.jpg',
    title: 'Получил награду «Отличник боевой подготовки»',
    text: 'Закрыл итоговый тест курса на 4.8 из 5. Теперь награда появилась в профиле и в ленте друзей.',
    time: '12 минут назад',
    badge: { label: 'Награда', tone: 'gold' },
    tags: ['друзья', 'награды', 'курс'],
    likes: 42,
    comments: [
      { id: 1, author: 'Торнадо', avatar: '/teacher1-main.jpg', text: 'Заслуженно. Темп держал весь поток.', time: '8 минут' },
    ],
    reposts: 4,
    liked: false,
    saved: false,
    celebrated: false,
  },
  {
    id: 2,
    type: 'post',
    source: 'community',
    author: 'Тактика малых групп',
    handle: '@small_units',
    avatar: '/soobsh2.png',
    community: 'Тактика малых групп',
    title: 'Разбор субботней тренировки',
    text: 'Выложили короткий разбор занятия: движение двойками, смена позиции, работа с условным раненым. Участникам сообщества доступен полный конспект.',
    time: '38 минут назад',
    image: '/voen3.png',
    badge: { label: 'Сообщество', tone: 'blue' },
    tags: ['сообщества', 'тактика', 'тренировка'],
    likes: 87,
    comments: [
      { id: 1, author: 'Коба', avatar: '/teacher3-main.jpg', text: 'Добавьте еще схему по отходу группы.', time: '22 минуты' },
    ],
    reposts: 13,
    liked: false,
    saved: true,
  },
  {
    id: 3,
    type: 'course',
    source: 'friend',
    author: 'Нексус',
    handle: '@нексус',
    avatar: '/logo.png',
    title: 'Завершил курс «КМБ V5»',
    text: 'Прошел финальное занятие, получил диплом и открыл следующий этап пути. В профиле уже доступен новый прогресс.',
    time: '1 час назад',
    image: '/dip1.png',
    badge: { label: 'Достижение', tone: 'green' },
    tags: ['друзья', 'курсы', 'диплом'],
    likes: 61,
    comments: [],
    reposts: 7,
    liked: true,
    saved: false,
  },
  {
    id: 4,
    type: 'event',
    source: 'community',
    author: 'Воевода Москва',
    handle: '@voevoda_msk',
    avatar: '/logo.png',
    community: 'Воевода Москва',
    title: 'Открыта запись на воскресные занятия',
    text: 'В ленту подписчиков добавлено расписание полигона на воскресенье. Доступны три окна: утро, день и вечерняя группа.',
    time: '2 часа назад',
    image: '/register-slide-2.jpg',
    badge: { label: 'Новость', tone: 'red' },
    tags: ['сообщества', 'расписание', 'москва'],
    likes: 33,
    comments: [],
    reposts: 5,
    liked: false,
    saved: false,
  },
  {
    id: 5,
    type: 'post',
    source: 'friend',
    author: 'Торнадо',
    handle: '@торнадо',
    avatar: '/teacher1-main.jpg',
    title: 'Заметка инструктора',
    text: 'Если лента показывает только общие новости, люди быстро перестают смотреть. Нужны события от своих: кто получил награду, кто закрыл курс, где активность в сообществах.',
    time: 'Вчера в 19:40',
    badge: { label: 'Друг', tone: 'blue' },
    tags: ['друзья', 'мнение', 'портал'],
    likes: 104,
    comments: [
      { id: 1, author: 'Вы', avatar: '/teacher2-main.jpg', text: 'Вот это как раз и нужно заказчику.', time: 'Вчера' },
    ],
    reposts: 18,
    liked: false,
    saved: false,
  },
];

const initialPeople: Person[] = [
  { id: 'tornado', name: 'Торнадо', role: 'Инструктор', avatar: '/teacher1-main.jpg', status: 'в сети', following: true },
  { id: 'bek', name: 'Бек', role: 'Курсант КМБ-77', avatar: '/teacher2-main.jpg', status: 'получил награду', following: true },
  { id: 'koba', name: 'Коба', role: 'Наставник', avatar: '/teacher3-main.jpg', status: 'готовит разбор', following: false },
];

const initialCommunities: Community[] = [
  { id: 'small-units', name: 'Тактика малых групп', avatar: '/soobsh2.png', members: '2 103', lastUpdate: '38 минут назад', following: true },
  { id: 'voevoda-msk', name: 'Воевода Москва', avatar: '/logo.png', members: '8 742', lastUpdate: '2 часа назад', following: true },
  { id: 'medicine', name: 'Медицина боя', avatar: '/soobsh1.png', members: '4 821', lastUpdate: 'сегодня', following: false },
];

const filterLabels: Record<FeedFilter, string> = {
  all: 'Моя лента',
  communities: 'Сообщества',
  friends: 'Друзья',
  achievements: 'Награды',
};

function Icon({ path, size = 18, fill = 'none' }: { path: string; size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="avatar">
      <img src={src} alt={alt} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
    </div>
  );
}

function FeedCard({
  item,
  onToggleLike,
  onToggleSave,
  onToggleCelebrate,
  onRepost,
  onAddComment,
}: {
  item: FeedItem;
  onToggleLike: (id: number) => void;
  onToggleSave: (id: number) => void;
  onToggleCelebrate: (id: number) => void;
  onRepost: (id: number) => void;
  onAddComment: (id: number, text: string) => void;
}) {
  const [commentsOpen, setCommentsOpen] = useState(item.comments.length > 0);
  const [commentText, setCommentText] = useState('');

  const submitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(item.id, commentText.trim());
    setCommentText('');
    setCommentsOpen(true);
  };

  const handleCommentKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') submitComment();
  };

  return (
    <article className="feed-card">
      <div className="feed-card-header">
        <Avatar src={item.avatar} alt={item.author} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="author-line">
            <span className="author-name">{item.author}</span>
            <span className="handle">{item.handle}</span>
            <span className="time">{item.time}</span>
          </div>
          <div className="author-line" style={{ marginTop: 7 }}>
            <span className="source-chip">
              {item.source === 'community' ? 'из сообщества' : item.source === 'friend' ? 'из друзей' : 'событие портала'}
            </span>
            {item.badge && <span className={`badge-chip ${item.badge.tone}`}>{item.badge.label}</span>}
          </div>
        </div>
      </div>

      <div className="feed-card-body">
        {item.title && <h2 className="feed-title">{item.title}</h2>}
        <p className="feed-text">{item.text}</p>
        {item.image && (
          <div className="feed-image">
            <img src={item.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          </div>
        )}
        <div className="feed-tags">
          {item.tags.map((tag) => <span key={tag} className="tag-chip">#{tag}</span>)}
        </div>
      </div>

      <div className="feed-actions">
        <button className={`action-button ${item.liked ? 'active' : ''}`} onClick={() => onToggleLike(item.id)}>
          <Icon path="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.3-9A2 2 0 0 0 19.6 9H14z M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          {item.likes}
        </button>
        <button className={`action-button ${commentsOpen ? 'active' : ''}`} onClick={() => setCommentsOpen((value) => !value)}>
          <Icon path="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          {item.comments.length}
        </button>
        <button className="action-button" onClick={() => onRepost(item.id)}>
          <Icon path="M17 1l4 4-4 4 M3 11V9a4 4 0 0 1 4-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 0 1-4 4H3" />
          {item.reposts}
        </button>
        {item.type === 'achievement' && (
          <button className={`action-button ${item.celebrated ? 'active' : ''}`} onClick={() => onToggleCelebrate(item.id)}>
            <Icon path="M12 2l2.4 6.9H22l-6 4.4 2.3 7-6.3-4.3-6.3 4.3L8 13.3 2 8.9h7.6z" />
            {item.celebrated ? 'Поздравлено' : 'Поздравить'}
          </button>
        )}
        <button className={`action-button ${item.saved ? 'active' : ''}`} onClick={() => onToggleSave(item.id)} style={{ marginLeft: 'auto' }}>
          <Icon path="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </button>
      </div>

      {commentsOpen && (
        <div className="comments-box">
          {item.comments.map((comment) => (
            <div key={comment.id} className="comment-row">
              <Avatar src={comment.avatar} alt={comment.author} />
              <div className="comment-bubble">
                <div className="comment-author">{comment.author} <span className="time">{comment.time}</span></div>
                <div className="comment-text">{comment.text}</div>
              </div>
            </div>
          ))}
          <div className="comment-form">
            <input value={commentText} onChange={(event) => setCommentText(event.target.value)} onKeyDown={handleCommentKey} placeholder="Написать комментарий" />
            <button className="icon-button" onClick={submitComment} title="Отправить комментарий">
              <Icon path="M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7" size={16} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export function Microblog() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [communities, setCommunities] = useState<Community[]>(initialCommunities);
  const [draft, setDraft] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const visibleFeed = useMemo(() => {
    return feed.filter((item) => {
      const byFilter =
        filter === 'all' ||
        (filter === 'communities' && item.source === 'community') ||
        (filter === 'friends' && item.source === 'friend') ||
        (filter === 'achievements' && item.type === 'achievement');
      const byTag = !selectedTag || item.tags.includes(selectedTag);
      return byFilter && byTag;
    });
  }, [feed, filter, selectedTag]);

  const allTags = useMemo(() => Array.from(new Set(feed.flatMap((item) => item.tags))).slice(0, 10), [feed]);
  const counters = {
    all: feed.length,
    communities: feed.filter((item) => item.source === 'community').length,
    friends: feed.filter((item) => item.source === 'friend').length,
    achievements: feed.filter((item) => item.type === 'achievement').length,
  };

  const publish = () => {
    if (!draft.trim()) return;
    const newItem: FeedItem = {
      id: Date.now(),
      type: 'post',
      source: 'friend',
      author: 'Вы',
      handle: '@my_profile',
      avatar: '/teacher2-main.jpg',
      title: 'Новая запись',
      text: draft.trim(),
      time: 'Только что',
      image: attachedImage ?? undefined,
      badge: { label: 'Мой пост', tone: 'blue' },
      tags: ['друзья', 'личное'],
      likes: 0,
      comments: [],
      reposts: 0,
      liked: false,
      saved: false,
    };
    setFeed((items) => [newItem, ...items]);
    setDraft('');
    setAttachedImage(null);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setAttachedImage(URL.createObjectURL(file));
  };

  const updateFeedItem = (id: number, updater: (item: FeedItem) => FeedItem) => {
    setFeed((items) => items.map((item) => (item.id === id ? updater(item) : item)));
  };

  const addComment = (id: number, text: string) => {
    updateFeedItem(id, (item) => ({
      ...item,
      comments: [
        ...item.comments,
        { id: Date.now(), author: 'Вы', avatar: '/teacher2-main.jpg', text, time: 'Только что' },
      ],
    }));
  };

  return (
    <div className="blog-feed-page">
      <style>{styles}</style>
      <div className="blog-shell">
        <main>
          <section className="blog-topbar">
            <div className="blog-title-row">
              <div>
                <div className="blog-eyebrow">
                  <Icon path="M3 11h18 M3 6h18 M3 16h18" size={15} />
                  социальная лента
                </div>
                <h1 className="blog-title">Блог</h1>
                <p className="blog-subtitle">
                  Новости от сообществ, записи друзей и события профилей: награды, завершенные курсы, новые посты и важные объявления в одной живой ленте.
                </p>
              </div>
              <div className="blog-stats">
                <div className="blog-stat"><b>{feed.length}</b><span>событий</span></div>
                <div className="blog-stat"><b>{communities.filter((item) => item.following).length}</b><span>сообщества</span></div>
                <div className="blog-stat"><b>{people.filter((item) => item.following).length}</b><span>друга</span></div>
              </div>
            </div>
          </section>

          <div className="blog-tabs">
            {(Object.keys(filterLabels) as FeedFilter[]).map((key) => (
              <button key={key} className={`blog-tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
                {key === 'all' && <Icon path="M3 12h18 M12 3v18" size={15} />}
                {key === 'communities' && <Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87" size={15} />}
                {key === 'friends' && <Icon path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8" size={15} />}
                {key === 'achievements' && <Icon path="M12 2l2.4 6.9H22l-6 4.4 2.3 7-6.3-4.3-6.3 4.3L8 13.3 2 8.9h7.6z" size={15} />}
                {filterLabels[key]}
                <span>{counters[key]}</span>
              </button>
            ))}
          </div>

          <section className="blog-composer">
            <div className="composer-row">
              <Avatar src="/teacher2-main.jpg" alt="Ваш профиль" />
              <div className="composer-body">
                <textarea
                  className="composer-input"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value.slice(0, 600))}
                  placeholder="Напишите новость для своей ленты: прогресс, заметку, фото тренировки или сообщение для друзей"
                />
                {attachedImage && (
                  <div className="feed-image" style={{ aspectRatio: '16 / 5' }}>
                    <img src={attachedImage} alt="" />
                  </div>
                )}
                <div className="composer-actions">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                    <button className="icon-button" title="Добавить фото" onClick={() => fileRef.current?.click()}>
                      <Icon path="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16 M14 14l1.6-1.6a2 2 0 0 1 2.8 0L20 14 M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                    </button>
                    <button className="icon-button" title="Добавить ссылку" onClick={() => setDraft((value) => `${value}${value.trim() ? ' ' : ''}https://voevoda.ru/journal`)}>
                      <Icon path="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1 M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="time">{draft.length}/600</span>
                    <button className="publish-button" disabled={!draft.trim()} onClick={publish}>Опубликовать</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="blog-tabs" style={{ marginTop: 0 }}>
            {allTags.map((tag) => (
              <button key={tag} className={`blog-tab ${selectedTag === tag ? 'active' : ''}`} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}>
                #{tag}
              </button>
            ))}
          </div>

          <section className="feed-list">
            {visibleFeed.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                onToggleLike={(id) => updateFeedItem(id, (entry) => ({ ...entry, liked: !entry.liked, likes: entry.liked ? entry.likes - 1 : entry.likes + 1 }))}
                onToggleSave={(id) => updateFeedItem(id, (entry) => ({ ...entry, saved: !entry.saved }))}
                onToggleCelebrate={(id) => updateFeedItem(id, (entry) => ({
                  ...entry,
                  celebrated: !entry.celebrated,
                  likes: entry.celebrated ? entry.likes - 1 : entry.likes + 1,
                }))}
                onRepost={(id) => updateFeedItem(id, (entry) => ({ ...entry, reposts: entry.reposts + 1 }))}
                onAddComment={addComment}
              />
            ))}
          </section>
        </main>

        <aside className="side-column">
          <section className="side-panel">
            <div className="side-title">
              <h3>Мои сообщества</h3>
              <span>{communities.filter((item) => item.following).length} активны</span>
            </div>
            <div className="mini-list">
              {communities.map((community) => (
                <div key={community.id} className="mini-row">
                  <Avatar src={community.avatar} alt={community.name} />
                  <div className="mini-copy">
                    <b>{community.name}</b>
                    <span>{community.members} участников · {community.lastUpdate}</span>
                  </div>
                  <button
                    className={`follow-button ${community.following ? 'active' : ''}`}
                    onClick={() => setCommunities((items) => items.map((item) => item.id === community.id ? { ...item, following: !item.following } : item))}
                  >
                    {community.following ? 'В ленте' : 'Следить'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="side-panel">
            <div className="side-title">
              <h3>Друзья</h3>
              <span>живые события</span>
            </div>
            <div className="mini-list">
              {people.map((person) => (
                <div key={person.id} className="mini-row">
                  <Avatar src={person.avatar} alt={person.name} />
                  <div className="mini-copy">
                    <b>{person.name}</b>
                    <span>{person.role} · {person.status}</span>
                  </div>
                  <button
                    className={`follow-button ${person.following ? 'active' : ''}`}
                    onClick={() => setPeople((items) => items.map((item) => item.id === person.id ? { ...item, following: !item.following } : item))}
                  >
                    {person.following ? 'Друг' : 'Следить'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="side-panel">
            <div className="side-title">
              <h3>Ближайшее</h3>
              <span>для подписок</span>
            </div>
            <div className="agenda">
              <div className="agenda-card">
                <b>Тактическое ориентирование</b>
                <span>Завтра · Воевода Москва · 18 участников</span>
              </div>
              <div className="agenda-card">
                <b>Разбор ошибок по медицине</b>
                <span>Сегодня · Медицина боя · онлайн</span>
              </div>
              <div className="agenda-card">
                <b>Новые награды недели</b>
                <span>Пятница · автоматическая публикация в ленте</span>
              </div>
            </div>
          </section>

          <section className="side-panel">
            <div className="side-title">
              <h3>Быстрые действия</h3>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <button className="blog-tab" onClick={() => navigate('/communities')}>Открыть сообщества</button>
              <button className="blog-tab" onClick={() => navigate('/achievements')}>Мои награды</button>
              <button className="blog-tab" onClick={() => navigate('/profile')}>Мой профиль</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
