import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PortalBreadcrumb } from '../components/PortalBreadcrumb';
import { useCartStore } from '../store/useCartStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { PRODUCTS, type Product } from './Shop';

const IcHeart = ({ filled }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#ff3b30' : 'none'} stroke={filled ? '#ff3b30' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IcBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IcCart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IcCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);
const IcStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623" stroke="#f5a623" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcZoom = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const IcChevBig = ({ dir = 'right' }: { dir?: 'left' | 'right' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}/>
  </svg>
);

const CSS = `
.mpp-page{min-height:calc(100vh - 60px);margin-left:56px;padding:60px 0 0;background:linear-gradient(180deg,#eef3ff 0,#f5f6f8 360px,#f5f6f8 100%);font-family:"Exo 2",sans-serif;color:#17213a}
.mpp-wrap{max-width:1240px;margin:0 auto;padding:20px 24px 70px}
.mpp-back{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 15px;border:1.5px solid #dfe5f2;border-radius:11px;background:#fff;color:#35405a;font:700 13px "Exo 2",sans-serif;cursor:pointer;margin-bottom:18px;transition:all .18s}
.mpp-back:hover{border-color:#c7d2fe;color:#375dfb;background:#f0f4ff;transform:translateX(-3px)}
.mpp-grid{display:grid;grid-template-columns:minmax(0,1fr) 388px;gap:26px;align-items:start}
.mpp-gallery{position:relative;border-radius:22px;overflow:hidden;background:#e9edf6;aspect-ratio:4/3;cursor:zoom-in;box-shadow:0 20px 50px rgba(26,39,68,.12);border:1px solid #e3e7ef}
.mpp-gallery img{width:100%;height:100%;object-fit:cover;display:block}
.mpp-gallery-badges{position:absolute;top:14px;left:14px;display:flex;gap:8px;z-index:3;flex-wrap:wrap}
.mpp-gbadge{padding:6px 12px;border-radius:9px;font:700 12px "Exo 2",sans-serif;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.18);backdrop-filter:blur(4px)}
.mpp-gbadge.top{background:linear-gradient(135deg,#f5a623,#e8940e)}
.mpp-gbadge.cond{background:rgba(26,39,68,.78)}
.mpp-gfav{position:absolute;top:14px;right:14px;width:42px;height:42px;border-radius:50%;border:none;cursor:pointer;background:rgba(255,255,255,.92);display:grid;place-items:center;color:#9ca3af;z-index:3;transition:transform .18s,background .18s,color .18s;box-shadow:0 4px 14px rgba(0,0,0,.14)}
.mpp-gfav:hover{transform:scale(1.1)}
.mpp-gfav.active{color:#ff3b30}
.mpp-stock,.mpp-zoomhint{position:absolute;bottom:14px;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:10px;background:rgba(26,39,68,.72);color:#fff;font:600 12px "Exo 2",sans-serif;z-index:3;backdrop-filter:blur(6px)}
.mpp-stock{left:14px}
.mpp-zoomhint{right:14px;pointer-events:none;opacity:.9}
.mpp-card{background:#fff;border:1px solid #e3e7ef;border-radius:18px;padding:22px 24px;margin-top:18px;box-shadow:0 8px 26px rgba(26,39,68,.05)}
.mpp-card h3{margin:0 0 12px;font-size:17px;font-weight:700;color:#1a2744;display:flex;align-items:center;gap:9px}
.mpp-card p{margin:0;color:#4b5563;font-size:14.5px;line-height:1.75;white-space:pre-line}
.mpp-specs{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mpp-spec{padding:14px 16px;border-radius:13px;background:#f6f8fc;border:1px solid #eef1f7}
.mpp-spec-l{color:#9ca3af;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px}
.mpp-spec-v{color:#1a2744;font-size:15px;font-weight:600;display:flex;align-items:center;gap:6px}
.mpp-rail{position:sticky;top:74px;display:flex;flex-direction:column;gap:14px}
.mpp-title{font:400 24px/1.25 "Russo One",sans-serif;color:#1a2744;letter-spacing:-.01em;margin:0 0 6px}
.mpp-sub{display:flex;align-items:center;gap:12px;color:#8b93a7;font-size:13px;margin-bottom:4px;flex-wrap:wrap}
.mpp-sub span{display:inline-flex;align-items:center;gap:4px}
.mpp-pricebox{background:linear-gradient(135deg,#f4f8ff,#e9eeff);border:1px solid #d4ddff;border-radius:16px;padding:22px}
.mpp-price{font:400 36px "Russo One",sans-serif;color:#1a2744;line-height:1}
.mpp-old{margin-top:7px;color:#a5adbc;font:700 15px "Exo 2",sans-serif;text-decoration:line-through}
.mpp-price-badges{margin-top:12px;display:flex;gap:7px;flex-wrap:wrap}
.mpp-badge{display:inline-flex;align-items:center;height:26px;padding:0 11px;border-radius:8px;font:700 12px "Exo 2",sans-serif}
.mpp-badge.green{background:#e8f8f2;color:#1d9e75}
.mpp-badge.gold{background:#fff8ed;color:#b86d00}
.mpp-badge.blue{background:#eef2ff;color:#375dfb}
.mpp-actions{display:flex;flex-direction:column;gap:10px}
.mpp-btn{width:100%;height:50px;border-radius:13px;font:700 15px "Exo 2",sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .18s}
.mpp-btn-buy{border:2px solid #1d9e75;background:#fff;color:#1d9e75}
.mpp-btn-buy:hover{background:#e8f8f2}
.mpp-btn-cart{border:none;background:linear-gradient(135deg,#2F52F0,#5B7FFF);color:#fff;box-shadow:0 8px 22px rgba(55,93,251,.3)}
.mpp-btn-cart:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(55,93,251,.42)}
.mpp-btn-fav{height:46px;border:1.5px solid #e5e7eb;background:#fff;color:#374151;font-weight:600}
.mpp-btn-fav:hover,.mpp-btn-fav.active{border-color:#ff3b30;color:#ff3b30;background:#fff5f5}
.mpp-seller{background:#fff;border:1px solid #e3e7ef;border-radius:16px;padding:18px}
.mpp-seller-top{display:flex;align-items:center;gap:12px}
.mpp-seller-avatar{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;background:#1a2744;color:#f5a623}
.mpp-seller-avatar svg{width:25px;height:25px}
.mpp-seller-name{color:#1a2744;font-weight:700;font-size:16px;display:flex;align-items:center;gap:6px}
.mpp-seller-rating{display:flex;align-items:center;gap:5px;color:#6b7280;font-size:12px;margin-top:2px}
.mpp-seller-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
.mpp-seller-stat{text-align:center;padding:10px 8px;border-radius:11px;background:#f6f8fc;border:1px solid #eef1f7}
.mpp-seller-stat b{display:block;color:#1a2744;font-size:17px;font-weight:800}
.mpp-seller-stat span{color:#9ca3af;font-size:10px;font-weight:600;text-transform:uppercase}
.mpp-safety{padding:14px 16px;border-radius:13px;background:#f0fdf4;border:1px solid #bbf7d0;font-size:12.5px;color:#166534;line-height:1.55}
.mpp-safety b{display:block;margin-bottom:4px;font-size:13px}
.mpp-similar{margin-top:46px}
.mpp-similar-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.mpp-similar-head h2{margin:0;font:400 24px "Russo One",sans-serif;color:#1a2744}
.mpp-slider-nav{display:flex;align-items:center;gap:6px}
.mpp-slider-nav button{width:34px;height:34px;padding:0;flex:0 0 34px;border:1.5px solid #e3e7ef;border-radius:50%;background:#fff;color:#7b8fb5;cursor:pointer;display:grid;place-items:center;box-shadow:0 2px 8px rgba(26,39,68,.07);transition:all .18s}
.mpp-slider-nav button:hover{border-color:#375dfb;background:linear-gradient(135deg,#2F52F0,#5B7FFF);color:#fff;transform:scale(1.1);box-shadow:0 6px 18px rgba(55,93,251,.32)}
.mpp-slider{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:4px 2px 10px;scrollbar-width:none}
.mpp-slider::-webkit-scrollbar{display:none}
.mpp-scard{flex:0 0 clamp(220px,23vw,264px);scroll-snap-align:start;background:#fff;border:1px solid #e3e7ef;border-radius:16px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s,border-color .3s}
.mpp-scard:hover{transform:translateY(-6px);box-shadow:0 18px 40px rgba(26,39,68,.14);border-color:#cbd6f7}
.mpp-scard-img{aspect-ratio:4/3;overflow:hidden;background:#eef0f4}
.mpp-scard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.mpp-scard:hover .mpp-scard-img img{transform:scale(1.07)}
.mpp-scard-body{padding:13px 14px 14px;display:flex;flex-direction:column;flex:1}
.mpp-scard-price{font:400 19px "Russo One",sans-serif;color:#1a2744;margin-bottom:5px}
.mpp-scard-title{font-size:13.5px;color:#35405a;line-height:1.4;margin-bottom:auto;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.mpp-scard-meta{color:#9ca3af;font-size:11px;margin-top:9px}
@keyframes mppRise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
.mpp-rise{animation:mppRise .5s cubic-bezier(.2,.8,.2,1) both}
.mpp-toast{position:fixed;right:24px;bottom:24px;z-index:700;padding:14px 20px;border-radius:12px;background:#1a2744;color:#fff;box-shadow:0 14px 36px rgba(26,39,68,.28);font:600 14px "Exo 2",sans-serif;animation:mppRise .3s ease}
.mpp-missing{text-align:center;padding:90px 24px}
.mpp-missing h2{font:400 24px "Russo One",sans-serif;color:#1a2744;margin:0 0 10px}
.mpp-missing p{color:#9ca3af;margin:0 0 22px}
@media(max-width:980px){.mpp-grid{grid-template-columns:1fr}.mpp-page{margin-left:0}.mpp-rail{position:static}.mpp-wrap{padding-inline:14px}}
@media(max-width:760px){.mpp-specs{grid-template-columns:1fr}.mpp-slider>.mpp-scard{flex-basis:78%}.mpp-gallery{border-radius:18px}.mpp-zoomhint{display:none}}
`;

const priceLabel = (product: Product) => `${product.price.toLocaleString()} ₽`;

export function ShopProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cartItems = useCartStore((s) => s.items);
  const addProduct = useCartStore((s) => s.addProduct);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const hasFavorite = useFavoritesStore((s) => s.has);
  const product = useMemo(() => PRODUCTS.find((p) => p.id === Number(id)) ?? null, [id]);
  const fav = product ? hasFavorite(product.id, 'market') : false;
  const [toast, setToast] = useState('');
  const [zoom, setZoom] = useState({ x: 50, y: 50, active: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const qty = (productId: number) => {
    const item = cartItems.find((i) => i.kind === 'product' && i.id === productId);
    return item && item.kind === 'product' ? item.qty : 0;
  };

  const notify = (text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const add = (item: Product) => {
    addProduct({ id: item.id, kind: 'product', title: item.title, brand: item.brand, price: item.price, oldPrice: item.oldPrice, qty: 1, image: item.image });
    notify('Товар добавлен в корзину');
  };

  const buyNow = () => {
    if (!product) return;
    if (!qty(product.id)) add(product);
    navigate(`/checkout?item=product:${product.id}`);
  };

  const toggleProductFavorite = () => {
    if (!product) return;
    toggleFavorite({
      id: product.id,
      kind: 'market',
      title: product.title,
      brand: product.brand,
      price: product.price,
      oldPrice: product.oldPrice,
      inStock: product.stock > 0,
      image: product.image,
      available: product.stock > 0,
    });
    notify(fav ? 'Убрано из избранного' : 'Добавлено в избранное');
  };

  const scrollSlider = (dir: number) => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(260, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  useEffect(() => {
    setZoom({ x: 50, y: 50, active: false });
  }, [id]);

  const similar = useMemo(() => {
    if (!product) return [];
    const sameCat = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category);
    const rest = PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category);
    return [...sameCat, ...rest].slice(0, 12);
  }, [product]);

  if (!product) {
    return (
      <main className="mpp-page">
        <style>{CSS}</style>
        <div className="mpp-wrap">
          <div className="mpp-missing">
            <h2>Товар не найден</h2>
            <p>Возможно, он был снят с продажи или изменился каталог.</p>
            <button className="mpp-btn mpp-btn-cart" style={{ maxWidth: 280, margin: '0 auto' }} onClick={() => navigate('/market')}>Вернуться в Военмаркет</button>
          </div>
        </div>
      </main>
    );
  }

  const inCart = qty(product.id);
  const specs: [string, string][] = [
    ['Категория', product.category],
    ['Бренд', product.brand],
    ['Наличие', `${product.stock} шт.`],
    ['Отзывы', String(product.reviews)],
    ...product.specs,
  ];

  return (
    <main className="mpp-page">
      <style>{CSS}</style>
      <div className="mpp-wrap">
        <PortalBreadcrumb className="mpp-rise" items={[{ label: 'Главная', to: '/' }, { label: 'Военмаркет', to: '/market' }, { label: product.category, to: `/market?category=${encodeURIComponent(product.category)}` }, { label: product.title }]} />
        <button className="mpp-back mpp-rise" onClick={() => navigate('/market')}><IcBack /> Все товары</button>

        <div className="mpp-grid">
          <div>
            <div
              className="mpp-gallery mpp-rise"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, active: true });
              }}
              onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
            >
              <img
                src={product.image}
                alt={product.title}
                style={{
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                  transform: zoom.active ? 'scale(1.9)' : 'scale(1)',
                  transition: zoom.active ? 'transform .08s ease-out' : 'transform .35s ease',
                }}
              />
              <div className="mpp-gallery-badges">
                {product.badge && <span className="mpp-gbadge top">{product.badge}</span>}
                <span className="mpp-gbadge cond">{product.category}</span>
              </div>
              <button className={`mpp-gfav${fav ? ' active' : ''}`} onClick={toggleProductFavorite} aria-label="В избранное">
                <IcHeart filled={fav} />
              </button>
              <span className="mpp-stock"><IcCheck /> {product.stock} шт. в наличии</span>
              <span className="mpp-zoomhint"><IcZoom /> Наведите для увеличения</span>
            </div>

            <div className="mpp-card mpp-rise" style={{ animationDelay: '.06s' }}>
              <h3>Описание</h3>
              <p>{product.desc}</p>
            </div>

            <div className="mpp-card mpp-rise" style={{ animationDelay: '.12s' }}>
              <h3>Характеристики</h3>
              <div className="mpp-specs">
                {specs.map(([label, value]) => (
                  <div className="mpp-spec" key={label}>
                    <div className="mpp-spec-l">{label}</div>
                    <div className="mpp-spec-v">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="mpp-rail">
            <div className="mpp-rise" style={{ animationDelay: '.05s' }}>
              <h1 className="mpp-title">{product.title}</h1>
              <div className="mpp-sub">
                <span>{product.brand}</span>
                <span>{product.category}</span>
                <span><IcStar /> {product.rating} · {product.reviews} отзывов</span>
              </div>
            </div>

            <div className="mpp-pricebox mpp-rise" style={{ animationDelay: '.1s' }}>
              <div className="mpp-price">{priceLabel(product)}</div>
              {product.oldPrice && <div className="mpp-old">{product.oldPrice.toLocaleString()} ₽</div>}
              <div className="mpp-price-badges">
                <span className="mpp-badge green">В наличии</span>
                {product.badge && <span className="mpp-badge gold">{product.badge}</span>}
                <span className="mpp-badge blue">{product.category}</span>
              </div>
            </div>

            <div className="mpp-actions mpp-rise" style={{ animationDelay: '.15s' }}>
              <button className="mpp-btn mpp-btn-buy" onClick={buyNow}><IcCheck /> Купить сейчас</button>
              <button className="mpp-btn mpp-btn-cart" onClick={() => inCart ? navigate('/cart') : add(product)}>
                <IcCart /> {inCart ? `Открыть корзину (${inCart})` : 'Добавить в корзину'}
              </button>
              <button className={`mpp-btn mpp-btn-fav${fav ? ' active' : ''}`} onClick={toggleProductFavorite}>
                <IcHeart filled={fav} /> {fav ? 'В избранном' : 'В избранное'}
              </button>
            </div>

            <div className="mpp-seller mpp-rise" style={{ animationDelay: '.2s' }}>
              <div className="mpp-seller-top">
                <div className="mpp-seller-avatar"><IcCart /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mpp-seller-name">Воевода Маркет <IcShield /></div>
                  <div className="mpp-seller-rating"><IcStar /> {product.rating} · официальный раздел</div>
                </div>
              </div>
              <div className="mpp-seller-stats">
                <div className="mpp-seller-stat"><b>{PRODUCTS.length}</b><span>товаров</span></div>
                <div className="mpp-seller-stat"><b>{product.stock}</b><span>в наличии</span></div>
                <div className="mpp-seller-stat"><b>30</b><span>дней</span></div>
              </div>
            </div>

            <div className="mpp-safety mpp-rise" style={{ animationDelay: '.25s' }}>
              <b>Безопасная покупка</b>
              Оплата проходит внутри портала. Проверьте размер, комплектацию и условия доставки перед оформлением заказа.
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mpp-similar">
            <div className="mpp-similar-head mpp-rise">
              <h2>Похожие товары</h2>
              <div className="mpp-slider-nav">
                <button onClick={() => scrollSlider(-1)} aria-label="Прокрутить назад"><IcChevBig dir="left" /></button>
                <button onClick={() => scrollSlider(1)} aria-label="Прокрутить вперед"><IcChevBig dir="right" /></button>
              </div>
            </div>
            <div className="mpp-slider" ref={sliderRef}>
              {similar.map((item, i) => (
                <article key={item.id} className="mpp-scard mpp-rise" style={{ animationDelay: `${0.06 * i}s` }} onClick={() => navigate(`/market/${item.id}`)}>
                  <div className="mpp-scard-img"><img src={item.image} alt={item.title} /></div>
                  <div className="mpp-scard-body">
                    <div className="mpp-scard-price">{priceLabel(item)}</div>
                    <div className="mpp-scard-title">{item.title}</div>
                    <div className="mpp-scard-meta">{item.brand} · {item.category}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {toast && <div className="mpp-toast">{toast}</div>}
    </main>
  );
}
