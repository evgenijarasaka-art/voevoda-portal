import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './feature-pages.css';

type Community = {
  id: number; name: string; type: string; city: string;
  members: number; active: number; posts: number; photos: number;
  image: string; imagePosition: string; joined: boolean; desc: string;
};

type Comment = { id: number; author: string; text: string; time: string; };

type Post = {
  id: number; author: string; text: string;
  image?: string; imagePosition?: string;
  time: string; likes: number; comments: number;
};

const TYPES = ['Все', 'Клубы Воевод', 'Патриотические', 'Ветеранские', 'Спортивные', 'Учебные'];

const MEMBER_PHOTOS: Record<string, string> = {
  'Торнадо': '/sold1.png',
  'Бек': '/teacher1-main.jpg',
  'Коба': '/sold2.png',
  'Вы': '/teacher2-main.jpg',
};

const INITIAL_COMMUNITIES: Community[] = [
  { id: 1, name: 'Боевое братство Воеводы', type: 'Клубы Воевод', city: 'Москва', members: 7640, active: 521, posts: 312, photos: 1850, image: '/voendelo1.png', imagePosition: 'center 42%', joined: true, desc: 'Главное сообщество выпускников и курсантов. Обсуждаем тренировки, встречи, соревнования и взаимопомощь.' },
  { id: 2, name: 'Снайперы России', type: 'Спортивные', city: 'Санкт-Петербург', members: 1280, active: 84, posts: 91, photos: 430, image: '/voendelo3.png', imagePosition: 'center 45%', joined: false, desc: 'Практика точной стрельбы, разбор соревнований, подготовка к полевым занятиям и командным стартам.' },
  { id: 3, name: 'Юнармия. Южный рубеж', type: 'Патриотические', city: 'Краснодар', members: 2310, active: 176, posts: 144, photos: 920, image: '/sorev1.png', imagePosition: 'center 38%', joined: false, desc: 'Региональные сборы, наставники, городские мероприятия и волонтерские выезды.' },
  { id: 4, name: 'Ветераны наставники', type: 'Ветеранские', city: 'Москва', members: 940, active: 63, posts: 76, photos: 310, image: '/voendelo5.png', imagePosition: 'center 45%', joined: false, desc: 'Встречи с наставниками, исторические лекции и помощь в подготовке молодых бойцов.' },
  { id: 5, name: 'Тактическая медицина', type: 'Учебные', city: 'Казань', members: 1540, active: 112, posts: 88, photos: 560, image: '/медицина1.png', imagePosition: 'center 42%', joined: false, desc: 'Учебные материалы, расписание семинаров, чек-листы и разбор практических занятий.' },
  { id: 6, name: 'Полигон выходного дня', type: 'Учебные', city: 'Новосибирск', members: 870, active: 45, posts: 39, photos: 260, image: '/specpred1.png', imagePosition: 'center 40%', joined: false, desc: 'Анонсы тренировок, команды на выезд, отчеты и обмен экипировкой перед занятиями.' },
];

const INITIAL_POSTS: Post[] = [
  { id: 1, author: 'Торнадо', text: 'В субботу проводим открытую тренировку по тактическому перемещению. Сбор в 09:30, форма полевая, вода обязательно.', image: '/voendelo4.png', imagePosition: 'top', time: '2 часа назад', likes: 47, comments: 12 },
  { id: 2, author: 'Бек', text: 'Загрузили фото с последнего занятия. Отдельно отметили группу, которая лучше всех прошла эвакуацию условно раненого.', image: '/медицина2.png', imagePosition: 'center 42%', time: 'Вчера', likes: 31, comments: 8 },
  { id: 3, author: 'Коба', text: 'Напоминаю: заявки на командные соревнования принимаем до пятницы. Капитаны, проверьте составы.', time: '2 дня назад', likes: 58, comments: 19 },
];

const SEED_COMMENTS: Record<number, Comment[]> = {
  1: [
    { id: 101, author: 'Коба', text: 'Буду. Берём тройку с собой.', time: '1 час назад' },
    { id: 102, author: 'Бек', text: 'Что по снаряжению — разгрузки нужны?', time: '45 мин назад' },
  ],
  2: [
    { id: 201, author: 'Торнадо', text: 'Хорошая работа, группа молодцы!', time: 'Вчера' },
  ],
  3: [
    { id: 301, author: 'Бек', text: 'Состав отправил на почту.', time: '1 день назад' },
    { id: 302, author: 'Торнадо', text: 'У нас 4 человека, капитан — Рысь.', time: '1 день назад' },
    { id: 303, author: 'Коба', text: 'Принял, добавил в таблицу.', time: '22 часа назад' },
  ],
};

function Avatar({ name, size = 42 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const photo = MEMBER_PHOTOS[name];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a2744' }}>
      {photo && !err
        ? <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={() => setErr(true)} />
        : <span style={{ fontSize: size * 0.38, fontWeight: 700, color: '#f5a623' }}>{name[0]}</span>
      }
    </div>
  );
}

// Фото поста — натуральное соотношение сторон, без жёсткой обрезки
function PostImage({ src, position }: { src: string; position?: string }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  return (
    <div style={{ padding: '0 14px', marginBottom: 4 }}>
      <div style={{ borderRadius: 12, overflow: 'hidden', background: '#f3f4f6', lineHeight: 0 }}>
        <img
          src={src}
          alt=""
          onError={() => setErr(true)}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: 420,
            objectFit: 'cover',
            objectPosition: position ?? 'center top',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}

export function Communities() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState(INITIAL_COMMUNITIES);
  const [selected, setSelected] = useState<Community | null>(null);
  const [type, setType] = useState('Все');
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [postText, setPostText] = useState('');
  const [liked, setLiked] = useState<number[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [form, setForm] = useState({ name: '', type: 'Клубы Воевод', city: 'Москва', desc: '' });

  // Комментарии
  const [allComments, setAllComments] = useState<Record<number, Comment[]>>(SEED_COMMENTS);
  const [openComments, setOpenComments] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  const notify = (text: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(text);
    timer.current = setTimeout(() => setToast(''), 2200);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return communities.filter(item => {
      const typeOk = type === 'Все' || item.type === type;
      const queryOk = !q || `${item.name} ${item.city} ${item.type}`.toLowerCase().includes(q);
      return typeOk && queryOk;
    });
  }, [communities, query, type]);

  const toggleJoin = (id: number) => {
    setCommunities(prev => prev.map(item =>
      item.id === id ? { ...item, joined: !item.joined, members: item.joined ? item.members - 1 : item.members + 1 } : item
    ));
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, joined: !prev.joined, members: prev.joined ? prev.members - 1 : prev.members + 1 } : prev);
    }
    notify('Статус участия обновлен');
  };

  const publishPost = () => {
    if (!postText.trim()) { notify('Напишите текст поста'); return; }
    const id = Date.now();
    setPosts(prev => [{ id, author: 'Вы', text: postText, time: 'Только что', likes: 0, comments: 0 }, ...prev]);
    setAllComments(prev => ({ ...prev, [id]: [] }));
    setPostText('');
    notify('Пост опубликован');
  };

  const toggleComments = (postId: number) => {
    setOpenComments(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const submitComment = (postId: number) => {
    const text = (commentInputs[postId] ?? '').trim();
    if (!text) return;
    const newComment: Comment = { id: Date.now(), author: 'Вы', text, time: 'Только что' };
    setAllComments(prev => ({ ...prev, [postId]: [...(prev[postId] ?? []), newComment] }));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const createCommunity = () => {
    if (!form.name.trim()) { notify('Введите название сообщества'); return; }
    const next: Community = {
      id: Date.now(), name: form.name, type: form.type, city: form.city,
      members: 1, active: 1, posts: 0, photos: 0,
      image: '/voendelo1.png', imagePosition: 'center 42%',
      joined: true, desc: form.desc || 'Новое сообщество портала «Воевода».',
    };
    setCommunities(prev => [next, ...prev]);
    setSelected(next);
    setShowCreate(false);
    setForm({ name: '', type: 'Клубы Воевод', city: 'Москва', desc: '' });
    notify('Сообщество создано');
  };

  if (selected) {
    const current = communities.find(item => item.id === selected.id) ?? selected;
    return (
      <main className="portal-page">
        <div className="portal-shell">
          {toast && <div className="portal-toast">{toast}</div>}

          <div className="portal-breadcrumb">
            <button onClick={() => setSelected(null)}>Сообщества</button>
            <span>/</span>
            <span>{current.name}</span>
          </div>

          {/* Hero: квадратное фото слева + инфо справа */}
          <section style={{ marginBottom: 18, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.06)', display: 'flex', gap: 0 }}>
            <div style={{ width: 160, flexShrink: 0, overflow: 'hidden' }}>
              <img src={current.image} alt={current.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${current.imagePosition.split(' ')[0]} top`, display: 'block' }} />
            </div>
            <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
              <div>
                <h1 style={{ margin: '0 0 5px', color: '#1a2744', fontFamily: '"Russo One", sans-serif', fontSize: 22, lineHeight: 1.1 }}>{current.name}</h1>
                <div className="portal-meta">{current.city} / {current.type} / активны сейчас {current.active}</div>
              </div>
              <div className="portal-actions">
                <button className="portal-btn" onClick={() => navigate('/messages')}>Написать участникам</button>
                <button className={`portal-btn ${current.joined ? '' : 'primary'}`} onClick={() => toggleJoin(current.id)}>
                  {current.joined ? 'В строю' : 'Вступить'}
                </button>
              </div>
            </div>
          </section>

          <div className="portal-split">
            <section>
              <div className="portal-panel" style={{ marginBottom: 14 }}>
                <label className="portal-label">Новая запись</label>
                <textarea className="portal-textarea" value={postText} onChange={e => setPostText(e.target.value)} placeholder="Поделитесь новостью, анонсом или отчетом" />
                <div className="portal-actions" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
                  <button className="portal-btn primary" onClick={publishPost}>Опубликовать</button>
                </div>
              </div>

              {posts.map(post => {
                const isLiked = liked.includes(post.id);
                const isOpen = openComments.includes(post.id);
                const comments = allComments[post.id] ?? [];
                const commentText = commentInputs[post.id] ?? '';
                return (
                  <article className="portal-card" style={{ marginBottom: 14 }} key={post.id}>
                    {/* Шапка + текст */}
                    <div className="portal-body" style={{ paddingBottom: 12 }}>
                      <div className="portal-row" style={{ marginBottom: 10 }}>
                        <Avatar name={post.author} size={40} />
                        <div>
                          <b>{post.author}</b>
                          <div className="portal-meta">{post.time}</div>
                        </div>
                      </div>
                      <p style={{ color: '#4b5563', lineHeight: 1.7, margin: 0 }}>{post.text}</p>
                    </div>

                    {/* Фото — натуральные пропорции */}
                    {post.image && <PostImage src={post.image} position={post.imagePosition} />}

                    {/* Кнопки лайк / комментарии */}
                    <div className="portal-card-actions" style={{ paddingTop: 12 }}>
                      <button
                        className="portal-btn"
                        style={{ color: isLiked ? '#ef4444' : undefined, borderColor: isLiked ? '#fecaca' : undefined }}
                        onClick={() => setLiked(prev => isLiked ? prev.filter(id => id !== post.id) : [...prev, post.id])}
                      >
                        {isLiked ? '❤️' : '🤍'} Нравится {post.likes + (isLiked ? 1 : 0)}
                      </button>
                      <button
                        className="portal-btn"
                        style={{ color: isOpen ? '#375dfb' : undefined, borderColor: isOpen ? '#c7d2fe' : undefined }}
                        onClick={() => toggleComments(post.id)}
                      >
                        💬 Комментарии {post.comments + comments.filter(c => c.author === 'Вы').length}
                      </button>
                    </div>

                    {/* Раздел комментариев */}
                    {isOpen && (
                      <div style={{ padding: '0 14px 14px', borderTop: '1px solid #f0f0f0', marginTop: 4 }}>
                        {/* Список комментариев */}
                        {comments.length > 0 && (
                          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {comments.map(c => (
                              <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <Avatar name={c.author} size={32} />
                                <div style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '8px 12px', border: '1px solid #f0f0f0' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1a2744' }}>{c.author}</span>
                                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{c.time}</span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: 13, color: '#4b5563', lineHeight: 1.55 }}>{c.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {comments.length === 0 && (
                          <div style={{ marginTop: 12, fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '8px 0' }}>
                            Комментариев пока нет — будьте первым
                          </div>
                        )}

                        {/* Ввод нового комментария */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'flex-end' }}>
                          <Avatar name="Вы" size={32} />
                          <div style={{ flex: 1, position: 'relative' }}>
                            <input
                              className="portal-input"
                              style={{ paddingRight: 44, height: 38 }}
                              placeholder="Написать комментарий..."
                              value={commentText}
                              onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(post.id); } }}
                            />
                            <button
                              onClick={() => submitComment(post.id)}
                              disabled={!commentText.trim()}
                              style={{
                                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                                background: commentText.trim() ? 'linear-gradient(to right, #2F52F0, #5B7FFF)' : '#e5e7eb',
                                border: 'none', borderRadius: 6, width: 28, height: 28,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: commentText.trim() ? 'pointer' : 'default',
                                transition: 'background .2s',
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={commentText.trim() ? '#fff' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>

            <aside className="portal-panel">
              <h2 className="portal-name">О сообществе</h2>
              <p style={{ color: '#6b7280', lineHeight: 1.7 }}>{current.desc}</p>
              <div className="portal-form-grid" style={{ marginTop: 14 }}>
                {[
                  ['Участники', current.members.toLocaleString()],
                  ['Посты', String(current.posts + posts.length)],
                  ['Фото', current.photos.toLocaleString()],
                  ['Активные', String(current.active)],
                ].map(([label, value]) => (
                  <div className="portal-panel" key={label} style={{ padding: 12, textAlign: 'center' }}>
                    <div className="portal-price" style={{ fontSize: 18, margin: 0 }}>{value}</div>
                    <div className="portal-meta" style={{ justifyContent: 'center' }}>{label}</div>
                  </div>
                ))}
              </div>

              <h2 className="portal-name" style={{ marginTop: 18 }}>Участники</h2>
              {(['Торнадо', 'Бек', 'Коба'] as const).map((name, index) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={name} size={42} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2744' }}>{name}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>Участник</div>
                    </div>
                  </div>
                  <button className="portal-btn" onClick={() => navigate(`/messages?chat=${index + 1}`)}>Написать</button>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="portal-page">
      <div className="portal-shell">
        {toast && <div className="portal-toast">{toast}</div>}

        <div className="portal-breadcrumb">
          <button onClick={() => navigate('/')}>Главная</button>
          <span>/</span>
          <span>Сообщества</span>
        </div>

        <div className="portal-head">
          <div>
            <h1 className="portal-title">Сообщества</h1>
            <div className="portal-subtitle">Клубы, команды, наставники и учебные группы портала</div>
          </div>
          <button className="portal-btn primary" onClick={() => setShowCreate(true)}>Создать сообщество</button>
        </div>

        <section className="portal-toolbar">
          <input className="portal-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по названию, городу или типу" />
          <select className="portal-select" value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(item => <option key={item}>{item}</option>)}
          </select>
          <button className="portal-btn" onClick={() => { setQuery(''); setType('Все'); }}>Сбросить</button>
        </section>

        <div className="portal-pills">
          {TYPES.map(item => (
            <button key={item} className={`portal-pill ${type === item ? 'active' : ''}`} onClick={() => setType(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="portal-grid">
          {filtered.map(item => (
            <article className="portal-card clickable" key={item.id} onClick={() => setSelected(item)}>
              <div className="portal-img community-card-photo">
                <img src={item.image} alt={item.name} style={{ objectPosition: item.imagePosition }} />
              </div>
              <div className="portal-body">
                <div className="portal-row" style={{ marginBottom: 8 }}>
                  <span className="portal-badge">{item.type}</span>
                  {item.joined && <span className="portal-badge green">В строю</span>}
                </div>
                <h2 className="portal-name">{item.name}</h2>
                <div className="portal-meta">{item.city} / {item.members.toLocaleString()} участников / активны {item.active}</div>
              </div>
              <div className="portal-card-actions" onClick={e => e.stopPropagation()}>
                <button className={`portal-btn ${item.joined ? '' : 'primary'}`} onClick={() => toggleJoin(item.id)}>
                  {item.joined ? 'В строю' : 'Вступить'}
                </button>
                <button className="portal-btn" onClick={() => setSelected(item)}>Открыть</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {showCreate && (
        <div className="portal-modal-backdrop" onClick={() => setShowCreate(false)}>
          <section className="portal-modal" onClick={e => e.stopPropagation()}>
            <div className="portal-modal-head">
              <h2 className="portal-name" style={{ fontSize: 22 }}>Новое сообщество</h2>
              <button className="portal-btn" onClick={() => setShowCreate(false)}>Закрыть</button>
            </div>
            <div className="portal-modal-body portal-form-grid">
              <div className="full">
                <label className="portal-label" htmlFor="community-name">Название</label>
                <input id="community-name" className="portal-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="portal-label" htmlFor="community-type">Тип</label>
                <select id="community-type" className="portal-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {TYPES.filter(item => item !== 'Все').map(item => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="portal-label" htmlFor="community-city">Город</label>
                <input id="community-city" className="portal-input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="full">
                <label className="portal-label" htmlFor="community-desc">Описание</label>
                <textarea id="community-desc" className="portal-textarea" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} />
              </div>
              <div className="full portal-actions" style={{ justifyContent: 'flex-end' }}>
                <button className="portal-btn" onClick={() => setShowCreate(false)}>Отмена</button>
                <button className="portal-btn primary" onClick={createCommunity}>Создать</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}