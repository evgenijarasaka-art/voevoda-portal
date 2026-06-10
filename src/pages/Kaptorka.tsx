import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './feature-pages.css';

type Ad = {
  id: number;
  title: string;
  category: string;
  condition: string;
  city: string;
  price: number;
  image: string;
  seller: string;
  phone: string;
  date: string;
  views: number;
  desc: string;
  promoted?: boolean;
};

const CATEGORIES = ['Все', 'Снаряжение', 'Форма', 'Оптика', 'Рюкзаки', 'Учебное', 'Обмен'];

const ADS: Ad[] = [
  {
    id: 1,
    title: 'Разгрузочный жилет с подсумками, комплект',
    category: 'Снаряжение',
    condition: 'Отличное',
    city: 'Москва',
    price: 7800,
    image: '/kapt1.png',
    seller: 'Торнадо',
    phone: '+7 999 120-44-18',
    date: 'Сегодня',
    views: 142,
    promoted: true,
    desc: 'Комплект после двух тренировочных выездов. Швы целые, фурнитура работает, подсумки под магазины и аптечку в комплекте.',
  },
  {
    id: 2,
    title: 'Берцы демисезонные, размер 43',
    category: 'Форма',
    condition: 'Хорошее',
    city: 'Краснодар',
    price: 4200,
    image: '/kapt2.png',
    seller: 'Бек',
    phone: '+7 918 220-11-07',
    date: 'Вчера',
    views: 89,
    desc: 'Подойдут для полигона и марш-бросков. Носились аккуратно, подошва без трещин.',
  },
  {
    id: 3,
    title: 'Тактический рюкзак 45 литров',
    category: 'Рюкзаки',
    condition: 'Новое',
    city: 'Санкт-Петербург',
    price: 6500,
    image: '/soldier.png',
    seller: 'Коба',
    phone: '+7 921 554-09-80',
    date: '2 дня назад',
    views: 213,
    promoted: true,
    desc: 'Новый рюкзак с системой MOLLE, отделением под гидратор и плотной спинкой.',
  },
  {
    id: 4,
    title: 'Учебный набор для тактической медицины',
    category: 'Учебное',
    condition: 'Отличное',
    city: 'Казань',
    price: 3100,
    image: '/медицина1.png',
    seller: 'Сапсан',
    phone: '+7 917 444-67-32',
    date: '3 дня назад',
    views: 76,
    desc: 'Тренировочные бинты, турникет-макет, карточки алгоритмов. Для занятий в группе.',
  },
  {
    id: 5,
    title: 'Коллиматорный прицел для учебной винтовки',
    category: 'Оптика',
    condition: 'Хорошее',
    city: 'Москва',
    price: 9300,
    image: '/оружие2.png',
    seller: 'Барс',
    phone: '+7 985 012-66-55',
    date: '5 дней назад',
    views: 118,
    desc: 'Использовался только на тренировках. Стекло чистое, крепление в комплекте.',
  },
  {
    id: 6,
    title: 'Обмен: подсумки на тактические перчатки',
    category: 'Обмен',
    condition: 'Хорошее',
    city: 'Новосибирск',
    price: 0,
    image: '/specpred1.png',
    seller: 'Стриж',
    phone: '+7 913 707-15-20',
    date: 'Неделю назад',
    views: 54,
    desc: 'Отдам два подсумка под магазины, интересуют перчатки M/L или налокотники.',
  },
];

const conditionClass = (condition: string) => {
  if (condition === 'Новое') return 'green';
  if (condition === 'Отличное') return 'gold';
  return '';
};

export function Kaptorka() {
  const navigate = useNavigate();
  const [ads, setAds] = useState(ADS);
  const [category, setCategory] = useState('Все');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('new');
  const [selected, setSelected] = useState<Ad | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [shownPhone, setShownPhone] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Снаряжение',
    condition: 'Хорошее',
    city: 'Москва',
    price: '',
    phone: '',
    desc: '',
  });

  const notify = (text: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(text);
    timer.current = setTimeout(() => setToast(''), 2200);
  };

  const filtered = useMemo(() => {
    const result = ads.filter(ad => {
      const matchesCategory = category === 'Все' || ad.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || `${ad.title} ${ad.city} ${ad.seller}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });

    return [...result].sort((a, b) => {
      if (sort === 'priceUp') return a.price - b.price;
      if (sort === 'priceDown') return b.price - a.price;
      if (sort === 'views') return b.views - a.views;
      return b.id - a.id;
    });
  }, [ads, category, query, sort]);

  const submitAd = () => {
    if (!form.title.trim() || !form.price.trim() || !form.phone.trim()) {
      notify('Заполните название, цену и телефон');
      return;
    }

    const next: Ad = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      condition: form.condition,
      city: form.city,
      price: Number(form.price),
      image: '/kapt1.png',
      seller: 'Вы',
      phone: form.phone,
      date: 'Только что',
      views: 0,
      desc: form.desc || 'Описание будет добавлено позже.',
    };

    setAds(prev => [next, ...prev]);
    setShowCreate(false);
    setForm({ title: '', category: 'Снаряжение', condition: 'Хорошее', city: 'Москва', price: '', phone: '', desc: '' });
    notify('Объявление опубликовано');
  };

  return (
    <main className="portal-page">
      <div className="portal-shell">
        {toast && <div className="portal-toast">{toast}</div>}

        <div className="portal-breadcrumb">
          <button onClick={() => navigate('/')}>Главная</button>
          <span>/</span>
          <span>Каптёрка</span>
        </div>

        <div className="portal-head">
          <div>
            <h1 className="portal-title">Каптёрка</h1>
            <div className="portal-subtitle">Объявления участников: экипировка, форма, обмен и учебные комплекты</div>
          </div>
          <div className="portal-actions">
            <button className="portal-btn" onClick={() => navigate('/messages')}>Диалоги</button>
            <button className="portal-btn primary" onClick={() => setShowCreate(true)}>Разместить</button>
          </div>
        </div>

        <section className="portal-toolbar">
          <input className="portal-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по объявлениям, городу или продавцу" />
          <select className="portal-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="new">Сначала новые</option>
            <option value="priceUp">Сначала дешевле</option>
            <option value="priceDown">Сначала дороже</option>
            <option value="views">По просмотрам</option>
          </select>
          <button className="portal-btn" onClick={() => { setQuery(''); setCategory('Все'); }}>Сбросить</button>
        </section>

        <div className="portal-pills">
          {CATEGORIES.map(item => (
            <button key={item} className={`portal-pill ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <div className="portal-grid">
            {filtered.map(ad => {
              const fav = favorites.includes(ad.id);
              return (
                <article key={ad.id} className="portal-card clickable" onClick={() => setSelected(ad)}>
                  <div className="portal-img">
                    <img src={ad.image} alt={ad.title} />
                  </div>
                  <div className="portal-body">
                    <div className="portal-row" style={{ marginBottom: 8 }}>
                      <span className={`portal-badge ${conditionClass(ad.condition)}`}>{ad.condition}</span>
                      {ad.promoted && <span className="portal-badge gold">В топе</span>}
                    </div>
                    <h2 className="portal-name">{ad.title}</h2>
                    <div className="portal-price">{ad.price ? `${ad.price.toLocaleString()} ₽` : 'Обмен'}</div>
                    <div className="portal-meta">
                      <span>{ad.city}</span>
                      <span>{ad.date}</span>
                      <span>{ad.views} просмотров</span>
                    </div>
                  </div>
                  <div className="portal-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="portal-btn" onClick={() => { setFavorites(p => fav ? p.filter(id => id !== ad.id) : [...p, ad.id]); notify(fav ? 'Убрано из избранного' : 'Добавлено в избранное'); }}>
                      {fav ? 'В избранном' : 'В избранное'}
                    </button>
                    <button className="portal-btn primary" onClick={() => navigate(`/messages?chat=${ad.id}`)}>Написать</button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="portal-empty">
            <h2 className="portal-name">Объявления не найдены</h2>
            <p>Попробуйте изменить фильтры или разместите своё предложение.</p>
          </div>
        )}
      </div>

      {selected && (
        <div className="portal-modal-backdrop" onClick={() => setSelected(null)}>
          <section className="portal-modal" onClick={e => e.stopPropagation()}>
            <div className="portal-modal-head">
              <div>
                <h2 className="portal-name" style={{ fontSize: 22 }}>{selected.title}</h2>
                <div className="portal-meta">{selected.city} / {selected.date} / продавец {selected.seller}</div>
              </div>
              <button className="portal-btn" onClick={() => setSelected(null)}>Закрыть</button>
            </div>
            <div className="portal-modal-body portal-split">
              <div>
                <div className="portal-img tall" style={{ borderRadius: 14 }}>
                  <img src={selected.image} alt={selected.title} />
                </div>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>{selected.desc}</p>
              </div>
              <aside className="portal-panel">
                <div className="portal-price">{selected.price ? `${selected.price.toLocaleString()} ₽` : 'Обмен'}</div>
                <div className="portal-row" style={{ marginBottom: 14 }}>
                  <span className={`portal-badge ${conditionClass(selected.condition)}`}>{selected.condition}</span>
                  <span className="portal-badge">{selected.category}</span>
                </div>
                <div className="portal-row" style={{ marginBottom: 14 }}>
                  <div className="portal-avatar">{selected.seller[0]}</div>
                  <div>
                    <b>{selected.seller}</b>
                    <div className="portal-meta">Проверенный участник</div>
                  </div>
                </div>
                {shownPhone === selected.id ? (
                  <div className="portal-panel" style={{ marginBottom: 10, padding: 12, color: '#1d9e75', fontWeight: 800 }}>{selected.phone}</div>
                ) : (
                  <button className="portal-btn" style={{ width: '100%', marginBottom: 10 }} onClick={() => setShownPhone(selected.id)}>Показать телефон</button>
                )}
                <button className="portal-btn primary" style={{ width: '100%', marginBottom: 10 }} onClick={() => navigate(`/messages?chat=${selected.id}`)}>Написать продавцу</button>
                <button className="portal-btn gold" style={{ width: '100%' }} onClick={() => notify('Запрос на покупку отправлен')}>Купить / договориться</button>
              </aside>
            </div>
          </section>
        </div>
      )}

      {showCreate && (
        <div className="portal-modal-backdrop" onClick={() => setShowCreate(false)}>
          <section className="portal-modal" onClick={e => e.stopPropagation()}>
            <div className="portal-modal-head">
              <h2 className="portal-name" style={{ fontSize: 22 }}>Новое объявление</h2>
              <button className="portal-btn" onClick={() => setShowCreate(false)}>Закрыть</button>
            </div>
            <div className="portal-modal-body portal-form-grid">
              <div className="full">
                <label className="portal-label" htmlFor="kaptorka-title">Название</label>
                <input id="kaptorka-title" className="portal-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="portal-label" htmlFor="kaptorka-category">Категория</label>
                <select id="kaptorka-category" className="portal-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c !== 'Все').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="portal-label" htmlFor="kaptorka-condition">Состояние</label>
                <select id="kaptorka-condition" className="portal-select" value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}>
                  {['Новое', 'Отличное', 'Хорошее'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="portal-label" htmlFor="kaptorka-price">Цена</label>
                <input id="kaptorka-price" className="portal-input" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <label className="portal-label" htmlFor="kaptorka-phone">Телефон</label>
                <input id="kaptorka-phone" className="portal-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="full">
                <label className="portal-label" htmlFor="kaptorka-desc">Описание</label>
                <textarea id="kaptorka-desc" className="portal-textarea" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} />
              </div>
              <div className="full portal-actions" style={{ justifyContent: 'flex-end' }}>
                <button className="portal-btn" onClick={() => setShowCreate(false)}>Отмена</button>
                <button className="portal-btn primary" onClick={submitAd}>Опубликовать</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
