import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCommunitiesStore, type Community } from '../store/useCommunitiesStore';
import { userProfilePath } from '../api/testApi';
import { IVDisplay } from '../components/PeopleSection';
import { shareOrCopy } from '../utils/share';
import './communities-social.css';

const TYPES = ['Все', 'Клубы Воевод', 'ВП-клубы / отряды', 'Центры ВП', 'Ветеранские', 'ДОСААФ', 'Юнармия', 'УВЦ', 'Военные ВУЗы', 'Спортивные', 'Другое'];
const PATRIOT_INTERESTS = [
  { label: 'Снайперы', query: 'Снайперы', mark: 'СН' },
  { label: 'Экипажи БПЛА', query: 'БПЛА', mark: 'БП' },
  { label: 'Сапёры', query: 'Сап', mark: 'СП' },
  { label: 'Связисты', query: 'Связисты', mark: 'СВ' },
];

type CommunityPost = { id: number; author: string; avatar: string; time: string; text: string; image?: string; likes: number; jumbo: number; comments: number; shares: number };
type CommunityComment = { id: number; author: string; avatar: string; text: string; time: string };

const POSTS: CommunityPost[] = [
  { id: 1, author: 'Торнадо', avatar: '/teacher1-main.jpg', time: '2 часа назад', text: 'В субботу проводим открытую тренировку по тактическому перемещению. Сбор в 09:30, форма полевая, вода обязательно.', image: '/voendelo4.png', likes: 47, jumbo: 16, comments: 12, shares: 4 },
  { id: 2, author: 'Бек', avatar: '/teacher2-main.jpg', time: 'Вчера', text: 'Загрузили фото с последнего занятия. Отдельно отметили группу, которая лучше всех прошла эвакуацию условно раненого.', image: '/медицина2.png', likes: 31, jumbo: 9, comments: 8, shares: 7 },
  { id: 3, author: 'Коба', avatar: '/teacher3-main.jpg', time: '2 дня назад', text: 'Заявки на командные соревнования принимаем до пятницы. Капитаны, проверьте составы.', likes: 58, jumbo: 21, comments: 19, shares: 5 },
];

const SEED_COMMENTS: Record<number, CommunityComment[]> = {
  1: [{ id: 101, author: 'Бек', avatar: '/teacher2-main.jpg', text: 'Буду. Форму и аптечку подготовил.', time: '1 час назад' }],
  2: [{ id: 201, author: 'Коба', avatar: '/teacher3-main.jpg', text: 'Группа сработала собранно. Продолжаем в том же темпе.', time: 'Вчера' }],
};

const COMMUNITY_AVATARS = ['/logo.png', '/soobsh2.png', '/soobsh3.png', '/soobsh4.png', '/soobsh1.png', '/logo.png'];
const communityAvatar = (id: number) => COMMUNITY_AVATARS[(id - 1) % COMMUNITY_AVATARS.length];

function UsersIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 21v-2a4 4 0 0 0-3-3.8M15.5 3.2a4 4 0 0 1 0 7.6" /></svg>;
}

function CommunityCard({ item, index, onOpen, onJoin, onAwards }: { item: Community; index: number; onOpen: () => void; onJoin: () => void; onAwards: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => el.classList.add('visible'), index * 60); obs.disconnect(); }
    }, { threshold: 0.04 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  return (
    <article ref={ref} className={`community-unit-card${index === 0 ? ' featured' : ''}`}>
      <div className="community-cover" onClick={onOpen} onKeyDown={event => { if (event.key === 'Enter') onOpen(); }} role="button" tabIndex={0} aria-label={`Открыть ${item.name}`}>
        <img src={item.image} alt="" style={{ objectPosition: item.imagePosition }} />
        <span className="community-cover-shade" />
        <span className="community-type">{item.type}</span>
        {item.joined && <span className="community-formation"><i /> В строю</span>}
      </div>
      <div className="community-card-body">
        <div className="community-avatar"><img src={communityAvatar(item.id)} alt={`Аватар сообщества ${item.name}`} /></div>
        <div className="community-card-title-row">
          <div>
            <h2 onClick={onOpen}>{item.name}</h2>
            <p>{item.city} · создано {item.createdAt}</p>
          </div>
          <span className="community-active" title="Активны сейчас">{item.active}</span>
        </div>
        <p className="community-description">{item.desc}</p>
        <div className="community-metrics">
          <button onClick={onOpen}><b>{item.active.toLocaleString()}</b> в строю</button>
          <button onClick={onOpen}><b>{item.members.toLocaleString()}</b> участников</button>
          <button onClick={onAwards}><b>{item.awards}</b> наград</button>
          <button onClick={onOpen}><b>{item.posts}</b> статей</button>
          <button onClick={onOpen}><b>{item.photos}</b> фото</button>
        </div>
      </div>
      <div className="community-card-actions">
        <button className="community-button" onClick={onOpen}>Подробнее</button>
        <button className={`community-button${item.joined ? ' joined' : ' primary'}`} onClick={onJoin}>{item.joined ? 'В строю' : 'Подать заявку'}</button>
      </div>
    </article>
  );
}

function CommunityDetail({ community, onBack, onJoin }: { community: Community; onBack: () => void; onJoin: () => void }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [posts, setPosts] = useState(POSTS);
  const [liked, setLiked] = useState<number[]>([]);
  const [jumboed, setJumboed] = useState<number[]>([]);
  const [shared, setShared] = useState<number[]>([]);
  const [openComments, setOpenComments] = useState<number[]>([]);
  const [comments, setComments] = useState<Record<number, CommunityComment[]>>(SEED_COMMENTS);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [toast, setToast] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const column = sideRef.current;
    const feedList = feedRef.current;
    if (!column || !feedList) return;

    let lastScrollY = window.scrollY;
    let frame = 0;

    const feedStart = () => feedList.getBoundingClientRect().top + window.scrollY - 82;
    const clampColumnScroll = (value: number) => Math.max(0, Math.min(value, column.scrollHeight - column.clientHeight));
    const updateEdgeFades = () => {
      const maxScroll = Math.max(0, column.scrollHeight - column.clientHeight);
      column.dataset.fadeTop = column.scrollTop > 2 ? 'true' : 'false';
      column.dataset.fadeBottom = column.scrollTop < maxScroll - 2 ? 'true' : 'false';
    };

    const syncColumn = (initialize = false) => {
      if (window.innerWidth <= 1050) {
        column.scrollTop = 0;
        updateEdgeFades();
        lastScrollY = window.scrollY;
        return;
      }
      const currentScrollY = window.scrollY;
      const trigger = feedStart();
      if (initialize) {
        column.scrollTop = clampColumnScroll(Math.max(0, currentScrollY - trigger));
      } else if (currentScrollY <= trigger) {
        column.scrollTop = 0;
      } else {
        const currentActiveScroll = Math.max(0, currentScrollY - trigger);
        const previousActiveScroll = Math.max(0, lastScrollY - trigger);
        column.scrollTop = clampColumnScroll(column.scrollTop + currentActiveScroll - previousActiveScroll);
      }
      updateEdgeFades();
      lastScrollY = currentScrollY;
    };

    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => syncColumn());
    };
    const handleResize = () => {
      column.scrollTop = clampColumnScroll(column.scrollTop);
      updateEdgeFades();
      lastScrollY = window.scrollY;
    };

    syncColumn(true);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [posts.length, openComments]);

  const publish = () => {
    const text = draft.trim();
    if (!text) return;
    setPosts(current => [{ id: Date.now(), author: 'Вы', avatar: '/teacher2-main.jpg', time: 'Только что', text, likes: 0, jumbo: 0, comments: 0, shares: 0 }, ...current]);
    setDraft('');
  };

  const addComment = (postId: number) => {
    const text = (commentInputs[postId] ?? '').trim();
    if (!text) return;
    const next: CommunityComment = { id: Date.now(), author: 'Вы', avatar: '/teacher2-main.jpg', text, time: 'Только что' };
    setComments(current => ({ ...current, [postId]: [...(current[postId] ?? []), next] }));
    setCommentInputs(current => ({ ...current, [postId]: '' }));
    setOpenComments(current => current.includes(postId) ? current : [...current, postId]);
  };

  const sharePost = async (post: CommunityPost) => {
    const result = await shareOrCopy({
      title: `${community.name} — публикация`,
      text: `${post.author}: ${post.text}`,
      url: `${window.location.origin}/communities?community=${community.id}&post=${post.id}`,
    });
    if (result === 'cancelled') return;
    setShared(current => current.includes(post.id) ? current : [...current, post.id]);
    setToast(result === 'shared' ? 'Публикация отправлена' : 'Ссылка скопирована');
    window.setTimeout(() => setToast(''), 2200);
  };

  return (
    <main className="communities-page community-detail-page">
      <div className="communities-shell">
        {toast && <div className="community-toast" role="status">{toast}</div>}

        <section className="community-detail-hero">
          <img src={community.image} alt="" style={{ objectPosition: community.imagePosition }} />
          <div className="community-detail-overlay" />
          <button className="community-back-hero" onClick={onBack}>← Все сообщества</button>
          <div className="community-detail-badges"><span>{community.type}</span><span>{community.city}</span></div>
          <div className="community-detail-avatar"><img src={communityAvatar(community.id)} alt={`Аватар ${community.name}`} /></div>
          <div className="community-detail-copy">
            <h1>{community.name}</h1>
            <p>{community.desc}</p>
            <div className="community-detail-actions">
              <button className={`community-button${community.joined ? ' joined' : ' primary'}`} onClick={onJoin}>{community.joined ? 'Вы в строю' : 'Вступить в сообщество'}</button>
              <button className="community-button light" onClick={() => navigate('/messages')}>Написать сообщение</button>
            </div>
          </div>
          <div className="community-detail-rank"><b>#{community.id}</b><span>в строю портала</span></div>
        </section>

        <div className="community-detail-layout">
          <section className="community-posts" ref={feedRef}>
            <div className="community-composer">
              <img src="/teacher2-main.jpg" alt="" />
              <div>
                <textarea value={draft} onChange={event => setDraft(event.target.value.slice(0, 600))} placeholder="Сообщение для участников, отчёт с тренировки или важный анонс" />
                <footer><span>{draft.length}/600</span><button className="community-button primary" disabled={!draft.trim()} onClick={publish}>Опубликовать</button></footer>
              </div>
            </div>

            {posts.map((post, index) => {
              const isLiked = liked.includes(post.id);
              const isJumbo = jumboed.includes(post.id);
              const isShared = shared.includes(post.id);
              const isCommentsOpen = openComments.includes(post.id);
              const postComments = comments[post.id] ?? [];
              const commentText = commentInputs[post.id] ?? '';
              return (
                <article className="community-post" key={post.id} style={{ '--delay': `${index * 70}ms` } as React.CSSProperties}>
                  <header>
                    <img src={post.avatar} alt="" onClick={() => navigate(userProfilePath(post.author))} />
                    <div><b onClick={() => navigate(userProfilePath(post.author))}>{post.author}</b><span>{post.time}</span></div>
                    <em>Запись сообщества</em>
                  </header>
                  <p>{post.text}</p>
                  {post.image && <img className="community-post-image" src={post.image} alt="" />}
                  <footer>
                    <button className={isLiked ? 'active like' : ''} onClick={() => setLiked(items => isLiked ? items.filter(id => id !== post.id) : [...items, post.id])}>♡ Лайк {post.likes + (isLiked ? 1 : 0)}</button>
                    <button className={isJumbo ? 'active jumbo' : ''} onClick={() => setJumboed(items => isJumbo ? items.filter(id => id !== post.id) : [...items, post.id])}>✦ Джамбо {post.jumbo + (isJumbo ? 1 : 0)}</button>
                    <button className={isCommentsOpen ? 'active' : ''} onClick={() => setOpenComments(items => isCommentsOpen ? items.filter(id => id !== post.id) : [...items, post.id])}>Комментарий {post.comments + postComments.filter(comment => comment.author === 'Вы').length}</button>
                    <button className={isShared ? 'active' : ''} onClick={() => sharePost(post)}>Поделиться {post.shares + (isShared ? 1 : 0)}</button>
                  </footer>
                  {isCommentsOpen && (
                    <div className="community-comments">
                      <div className="community-comments-title">
                        <b>Комментарии</b>
                        <span>{post.comments + postComments.filter(comment => comment.author === 'Вы').length}</span>
                      </div>
                      {postComments.map(comment => (
                        <div className="community-comment" key={comment.id}>
                          <img src={comment.avatar} alt="" />
                          <div><header><b>{comment.author}</b><span>{comment.time}</span></header><p>{comment.text}</p></div>
                        </div>
                      ))}
                      <div className="community-comment-form">
                        <img src="/teacher2-main.jpg" alt="" />
                        <input value={commentText} onChange={event => setCommentInputs(current => ({ ...current, [post.id]: event.target.value }))} onKeyDown={event => { if (event.key === 'Enter') addComment(post.id); }} placeholder="Написать комментарий" />
                        <button disabled={!commentText.trim()} onClick={() => addComment(post.id)} aria-label="Отправить комментарий">→</button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          <aside className="community-detail-side" ref={sideRef}>
            <section className="community-info-panel">
              <div className="community-info-heading"><span>Сводка подразделения</span><UsersIcon /></div>
              <div className="community-info-grid">
                <div><b>{community.active}</b><span>в строю</span></div>
                <div><b>{community.members.toLocaleString()}</b><span>участников</span></div>
                <div><b>{community.posts + posts.length}</b><span>статей</span></div>
                <div><b>{community.photos}</b><span>фотографий</span></div>
                <div><b>{community.awards}</b><span>наград</span></div>
                <div><b>{community.createdAt}</b><span>дата создания</span></div>
              </div>
            </section>
            <section className="community-info-panel">
              <div className="community-info-heading"><span>Командный состав</span><span className="community-count-badge">3 бойца</span></div>
              {[
                { name: 'Торнадо', role: 'Командир', image: '/teacher1-main.jpg', index: 2463, rating: 5.0 },
                { name: 'Бек', role: 'Инструктор', image: '/teacher2-main.jpg', index: 1980, rating: 4.9 },
                { name: 'Коба', role: 'Наставник', image: '/teacher3-main.jpg', index: 1840, rating: 4.8 },
              ].map(({ name, role, image, index, rating }) => (
                <div className="community-member" key={name}>
                  <img src={image} alt="" onClick={() => navigate(userProfilePath(name))} />
                  <span className="community-member-id" onClick={() => navigate(userProfilePath(name))}><b>{name}</b><small>{role}</small></span>
                  <span className="community-member-iv" onClick={event => event.stopPropagation()}><IVDisplay index={index} rating={rating} /></span>
                </div>
              ))}
            </section>
            <section className="community-info-panel">
              <div className="community-info-heading"><span>Фотографии</span><span className="community-count-badge">{community.photos}</span></div>
              <div className="community-photo-grid">
                {[community.image, '/voendelo2.png', '/sorev1.png', '/медицина2.png'].map((image, index) => (
                  <button key={`${image}-${index}`} onClick={() => window.open(image, '_blank', 'noopener,noreferrer')} aria-label={`Открыть фотографию ${index + 1}`}>
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            </section>
            <button className="community-honor-link" onClick={() => navigate('/achievements?view=board')}>
              <span>✦</span><div><b>Наградная доска</b><small>Достижения участников сообщества</small></div><i>→</i>
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

export function Communities() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const communities = useCommunitiesStore(state => state.communities);
  const toggleJoin = useCommunitiesStore(state => state.toggleJoin);
  const addCommunity = useCommunitiesStore(state => state.addCommunity);
  const [type, setType] = useState('Все');
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Клубы Воевод', city: 'Москва', desc: '' });
  const selected = communities.find(item => item.id === Number(searchParams.get('community')));

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return communities.filter(item => (type === 'Все' || item.type === type) && (!needle || `${item.name} ${item.city} ${item.type}`.toLowerCase().includes(needle)));
  }, [communities, query, type]);

  const createCommunity = () => {
    if (!form.name.trim()) return;
    const community: Community = {
      id: Date.now(), name: form.name.trim(), type: form.type, city: form.city.trim() || 'Москва',
      members: 1, active: 1, posts: 0, photos: 0, awards: 0, createdAt: 'сегодня', image: '/voendelo1.png', imagePosition: 'center 42%', joined: true,
      desc: form.desc.trim() || 'Новое сообщество портала «Воевода».',
    };
    addCommunity(community);
    setShowCreate(false);
    setSearchParams({ community: String(community.id) });
  };

  if (selected) return <CommunityDetail community={selected} onBack={() => setSearchParams({})} onJoin={() => toggleJoin(selected.id)} />;

  return (
    <main className="communities-page">
      <div className="communities-shell">
        <section className="patriot-network">
          <div className="patriot-network-head">
            <div><span>Модуль 2</span><h2>Соцсеть «ПАТРИОТ»</h2></div>
            <p>Профессиональные группы, прямые эфиры, наставники и система достижений в одном строю.</p>
          </div>
          <div className="patriot-network-grid">
            <div className="patriot-interest-card">
              <strong>Группы по интересам</strong>
              <div>
                {PATRIOT_INTERESTS.map(interest => (
                  <button key={interest.label} onClick={() => { setType('Все'); setQuery(interest.query); }}>
                    <span>{interest.mark}</span>{interest.label}
                  </button>
                ))}
              </div>
            </div>
            <button className="patriot-module-card mentor" onClick={() => navigate('/teachers')}><span>01</span><b>Наставничество</b><small>Найти наставника и попасть «под крыло»</small></button>
            <button className="patriot-module-card live" onClick={() => navigate('/microblog')}><span>LIVE</span><b>Прямые Q&amp;A</b><small>Эфиры с инструкторами и командирами</small></button>
            <button className="patriot-module-card honor" onClick={() => navigate('/achievements?view=board')}><span>✦</span><b>Доска почёта</b><small>Ранги, ачивки и лучшие бойцы недели</small></button>
          </div>
        </section>

        <section className="communities-command-bar">
          <label><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Поиск по названию, городу или направлению" /></label>
          <button onClick={() => { setQuery(''); setType('Все'); }}>Сбросить</button>
        </section>

        <div className="community-type-tabs">
          {TYPES.map(item => <button key={item} className={type === item ? 'active' : ''} onClick={() => setType(item)}>{item}</button>)}
          <button className="community-button primary create community-create-tab" onClick={() => setShowCreate(true)}>+ Создать</button>
        </div>

        <div className="communities-result-line">
          <span>Найдено подразделений</span><b>{filtered.length}</b>
        </div>
        <section className="communities-grid">
          {filtered.map((item, index) => <CommunityCard key={item.id} item={item} index={index} onOpen={() => setSearchParams({ community: String(item.id) })} onJoin={() => toggleJoin(item.id)} onAwards={() => navigate('/achievements?view=board')} />)}
        </section>
      </div>

      {showCreate && (
        <div className="community-modal-backdrop" onClick={() => setShowCreate(false)}>
          <section className="community-modal" onClick={event => event.stopPropagation()}>
            <header><div><span>Новое подразделение</span><h2>Создать сообщество</h2></div><button onClick={() => setShowCreate(false)}>×</button></header>
            <label>Название<input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} autoFocus /></label>
            <div className="community-form-row">
              <label>Тип<select value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value }))}>{TYPES.slice(1).map(item => <option key={item}>{item}</option>)}</select></label>
              <label>Город<input value={form.city} onChange={event => setForm(current => ({ ...current, city: event.target.value }))} /></label>
            </div>
            <label>Описание<textarea value={form.desc} onChange={event => setForm(current => ({ ...current, desc: event.target.value }))} /></label>
            <footer><button className="community-button" onClick={() => setShowCreate(false)}>Отмена</button><button className="community-button primary" onClick={createCommunity}>Создать</button></footer>
          </section>
        </div>
      )}
    </main>
  );
}
