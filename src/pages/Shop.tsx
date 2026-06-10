import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import './feature-pages.css';

type Product = {
  id: number;
  title: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  badge?: string;
  desc: string;
  specs: [string, string][];
};

const CATEGORIES = ['Все', 'Форма', 'Снаряжение', 'Медицина', 'Учебное', 'Сувениры'];

const PRODUCTS: Product[] = [
  {
    id: 101,
    title: 'Комплект полевой формы «Воевода»',
    brand: 'VOEVODA',
    category: 'Форма',
    price: 12900,
    oldPrice: 14900,
    rating: 4.9,
    reviews: 64,
    stock: 18,
    image: '/voen1.png',
    badge: 'Хит',
    desc: 'Прочная полевая форма для занятий на полигоне. Ткань держит форму, карманы усилены, посадка рассчитана на активное движение.',
    specs: [['Материал', 'рип-стоп'], ['Сезон', 'демисезон'], ['Размеры', '46-56'], ['Производство', 'Россия']],
  },
  {
    id: 102,
    title: 'Тактический пояс с платформой MOLLE',
    brand: 'ARSENAL',
    category: 'Снаряжение',
    price: 5700,
    rating: 4.7,
    reviews: 38,
    stock: 9,
    image: '/voen2.png',
    badge: 'Новинка',
    desc: 'Пояс под подсумки и аптечку. Удобен для коротких тренировочных задач и соревнований.',
    specs: [['Вес', '780 г'], ['Размер', 'регулируемый'], ['Цвет', 'олива'], ['Крепление', 'MOLLE']],
  },
  {
    id: 103,
    title: 'Аптечка инструктора: тренировочный набор',
    brand: 'MEDTACTIC',
    category: 'Медицина',
    price: 8400,
    oldPrice: 9200,
    rating: 4.8,
    reviews: 51,
    stock: 5,
    image: '/медицина2.png',
    badge: 'Скидка',
    desc: 'Комплект для отработки базовых действий первой помощи: макеты турникета, бинты, карточки алгоритмов и подсумок.',
    specs: [['Состав', '8 предметов'], ['Назначение', 'обучение'], ['Подсумок', 'в комплекте'], ['Гарантия', '12 месяцев']],
  },
  {
    id: 104,
    title: 'Учебный макет автомата для занятий',
    brand: 'POLYGON',
    category: 'Учебное',
    price: 18900,
    rating: 4.6,
    reviews: 27,
    stock: 3,
    image: '/оружие1.png',
    desc: 'Безопасный массогабаритный макет для отработки стойки, переносов и базовой манипуляции на занятиях.',
    specs: [['Тип', 'учебный макет'], ['Материал', 'полимер'], ['Вес', '3.1 кг'], ['Допуск', 'для тренировок']],
  },
  {
    id: 105,
    title: 'Рюкзак рейдовый 35 л',
    brand: 'SPLAV',
    category: 'Снаряжение',
    price: 9900,
    rating: 4.9,
    reviews: 84,
    stock: 24,
    image: '/voen3.png',
    badge: 'Хит',
    desc: 'Рейдовый рюкзак с жесткой спиной, боковыми стяжками и карманом под гидратор.',
    specs: [['Объем', '35 л'], ['Вес', '1.4 кг'], ['Спина', 'анатомическая'], ['Цвет', 'мультикам']],
  },
  {
    id: 106,
    title: 'Шеврон «Путь Воеводы»',
    brand: 'VOEVODA',
    category: 'Сувениры',
    price: 650,
    rating: 5,
    reviews: 112,
    stock: 70,
    image: '/shevron1.png',
    desc: 'Коллекционный шеврон для участников программы. Крепление на липучке.',
    specs: [['Размер', '80 мм'], ['Крепление', 'велкро'], ['Материал', 'ПВХ'], ['Серия', 'Путь Воеводы']],
  },
  {
    id: 107,
    title: 'Перчатки тактические тренировочные',
    brand: 'GRIP',
    category: 'Форма',
    price: 3200,
    rating: 4.5,
    reviews: 29,
    stock: 11,
    image: '/voen4.png',
    desc: 'Перчатки для полосы препятствий, работы со снаряжением и стрелковой стойки.',
    specs: [['Размеры', 'S-XL'], ['Ладонь', 'синтетическая кожа'], ['Защита', 'костяшки'], ['Сезон', 'лето/деми']],
  },
  {
    id: 108,
    title: 'Подарочный набор выпускника',
    brand: 'VOEVODA',
    category: 'Сувениры',
    price: 2500,
    rating: 4.9,
    reviews: 43,
    stock: 16,
    image: '/gift.png',
    badge: 'Подарок',
    desc: 'Подарочная коробка с шевроном, значком и сертификатом участника.',
    specs: [['Состав', '3 предмета'], ['Упаковка', 'коробка'], ['Повод', 'выпуск'], ['Наличие', 'на складе']],
  },
];

const badgeClass = (badge?: string) => {
  if (badge === 'Скидка') return 'red';
  if (badge === 'Новинка') return 'green';
  return 'gold';
};

export function Shop() {
  const navigate = useNavigate();
  const addProduct = useCartStore(s => s.addProduct);
  const updateQty = useCartStore(s => s.updateQty);
  const cartItems = useCartStore(s => s.items);
  const [category, setCategory] = useState('Все');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('popular');
  const [selected, setSelected] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [compare, setCompare] = useState<number[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (text: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(text);
    timer.current = setTimeout(() => setToast(''), 2200);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = PRODUCTS.filter(product => {
      const matchesCategory = category === 'Все' || product.category === category;
      const matchesQuery = !q || `${product.title} ${product.brand} ${product.category}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });

    return [...result].sort((a, b) => {
      if (sort === 'priceUp') return a.price - b.price;
      if (sort === 'priceDown') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      return b.reviews - a.reviews;
    });
  }, [category, query, sort]);

  const qty = (id: number) => {
    const item = cartItems.find(i => i.kind === 'product' && i.id === id);
    return item && item.kind === 'product' ? item.qty : 0;
  };

  const add = (product: Product) => {
    addProduct({
      id: product.id,
      kind: 'product',
      title: product.title,
      brand: product.brand,
      price: product.price,
      oldPrice: product.oldPrice,
      qty: 1,
      image: product.image,
    });
    notify('Товар добавлен в корзину');
  };

  return (
    <main className="portal-page">
      <div className="portal-shell">
        {toast && <div className="portal-toast">{toast}</div>}

        <div className="portal-breadcrumb">
          <button onClick={() => navigate('/')}>Главная</button>
          <span>/</span>
          <span>Военмаркет</span>
        </div>

        <div className="portal-head">
          <div>
            <h1 className="portal-title">Военмаркет</h1>
            <div className="portal-subtitle">Магазин экипировки, учебных комплектов и атрибутики УТЦ «Воевода»</div>
          </div>
          <div className="portal-actions">
            <button className="portal-btn" onClick={() => setCompare([])}>Очистить сравнение</button>
            <button className="portal-btn primary" onClick={() => navigate('/cart')}>Корзина: {cartItems.length}</button>
          </div>
        </div>

        <section className="portal-panel" style={{ marginBottom: 16, borderLeft: '4px solid #f5a623' }}>
          <div className="portal-row" style={{ justifyContent: 'space-between' }}>
            <div>
              <b>Комплектуйтесь под курс</b>
              <div className="portal-meta">Добавляйте товары в корзину, сравнивайте позиции и открывайте карточку для характеристик.</div>
            </div>
            <button className="portal-btn gold" onClick={() => navigate('/courses')}>Подобрать курс</button>
          </div>
        </section>

        <section className="portal-toolbar">
          <input className="portal-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по товарам, бренду или категории" />
          <select className="portal-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="popular">Популярные</option>
            <option value="rating">По рейтингу</option>
            <option value="priceUp">Сначала дешевле</option>
            <option value="priceDown">Сначала дороже</option>
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

        {compare.length > 0 && (
          <div className="portal-panel" style={{ marginBottom: 16 }}>
            <b>В сравнении: {compare.length}</b>
            <div className="portal-meta">{compare.map(id => PRODUCTS.find(p => p.id === id)?.title).filter(Boolean).join(' / ')}</div>
          </div>
        )}

        <div className="portal-grid market">
          {filtered.map(product => {
            const inCart = qty(product.id);
            const fav = favorites.includes(product.id);
            const compared = compare.includes(product.id);
            return (
              <article key={product.id} className="portal-card clickable" onClick={() => setSelected(product)}>
                <div className="portal-img tall">
                  <img src={product.image} alt={product.title} />
                </div>
                <div className="portal-body">
                  <div className="portal-row" style={{ marginBottom: 8 }}>
                    {product.badge && <span className={`portal-badge ${badgeClass(product.badge)}`}>{product.badge}</span>}
                    <span className="portal-badge">{product.category}</span>
                  </div>
                  <div className="portal-meta">{product.brand}</div>
                  <h2 className="portal-name">{product.title}</h2>
                  <div className="portal-meta">★ {product.rating} / {product.reviews} отзывов / {product.stock} шт.</div>
                  <div className="portal-price">{product.price.toLocaleString()} ₽</div>
                  {product.oldPrice && <div className="portal-meta" style={{ textDecoration: 'line-through' }}>{product.oldPrice.toLocaleString()} ₽</div>}
                </div>
                <div className="portal-card-actions" onClick={e => e.stopPropagation()}>
                  {inCart ? (
                    <>
                      <button className="portal-btn" onClick={() => updateQty(product.id, -1)}>-</button>
                      <button className="portal-btn primary" onClick={() => navigate('/cart')}>{inCart} в корзине</button>
                      <button className="portal-btn" onClick={() => updateQty(product.id, 1)}>+</button>
                    </>
                  ) : (
                    <button className="portal-btn primary" onClick={() => add(product)}>В корзину</button>
                  )}
                </div>
                <div className="portal-card-actions" onClick={e => e.stopPropagation()}>
                  <button className="portal-btn" onClick={() => { setFavorites(p => fav ? p.filter(id => id !== product.id) : [...p, product.id]); notify(fav ? 'Убрано из избранного' : 'Добавлено в избранное'); }}>
                    {fav ? 'Любимое' : 'Избранное'}
                  </button>
                  <button className="portal-btn" onClick={() => setCompare(p => compared ? p.filter(id => id !== product.id) : [...p, product.id].slice(-3))}>
                    {compared ? 'Сравнивается' : 'Сравнить'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="portal-modal-backdrop" onClick={() => setSelected(null)}>
          <section className="portal-modal" onClick={e => e.stopPropagation()}>
            <div className="portal-modal-head">
              <div>
                <div className="portal-meta">{selected.brand} / {selected.category}</div>
                <h2 className="portal-name" style={{ fontSize: 22 }}>{selected.title}</h2>
              </div>
              <button className="portal-btn" onClick={() => setSelected(null)}>Закрыть</button>
            </div>
            <div className="portal-modal-body portal-split">
              <div>
                <div className="portal-img tall" style={{ borderRadius: 14 }}>
                  <img src={selected.image} alt={selected.title} />
                </div>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>{selected.desc}</p>
                <div className="portal-form-grid">
                  {selected.specs.map(([key, value]) => (
                    <div className="portal-panel" key={key} style={{ padding: 12 }}>
                      <div className="portal-meta">{key}</div>
                      <b>{value}</b>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="portal-panel">
                <div className="portal-price">{selected.price.toLocaleString()} ₽</div>
                <div className="portal-meta" style={{ marginBottom: 14 }}>★ {selected.rating} / {selected.reviews} отзывов / в наличии {selected.stock}</div>
                {qty(selected.id) ? (
                  <button className="portal-btn primary" style={{ width: '100%', marginBottom: 10 }} onClick={() => navigate('/cart')}>Открыть корзину</button>
                ) : (
                  <button className="portal-btn primary" style={{ width: '100%', marginBottom: 10 }} onClick={() => add(selected)}>Добавить в корзину</button>
                )}
                <button className="portal-btn" style={{ width: '100%', marginBottom: 18 }} onClick={() => notify('Менеджер получил запрос на консультацию')}>Нужна консультация</button>
                <label className="portal-label">Оставить отзыв</label>
                <textarea className="portal-textarea" value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Что понравилось в товаре?" />
                <button className="portal-btn gold" style={{ width: '100%', marginTop: 10 }} onClick={() => { setReviewText(''); notify('Отзыв отправлен на модерацию'); }}>Опубликовать отзыв</button>
              </aside>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
