import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SellerProfile = {
  name: string;
  avatar: string;
  chatId: number;
  /** Индекс Воеводы — сводный показатель активности/репутации. */
  index: number;
  rating: number;
  reviews: number;
  ads: number;
  joined: string;
  verified: boolean;
};

// chatId совпадает с id чата на странице «Сообщения» (см. CHATS в Messages.tsx),
// чтобы переход «Написать продавцу» / обмен открывал диалог именно с этим продавцом.
export const SELLERS: Record<string, SellerProfile> = {
  'Торнадо': { name: 'Торнадо', avatar: '/sold1.png', chatId: 1, index: 2463, rating: 4.9, reviews: 18, ads: 4, joined: '2 года', verified: true },
  'Бек':     { name: 'Бек',     avatar: '/teacher1-main.jpg', chatId: 2, index: 1980, rating: 4.7, reviews: 12, ads: 3, joined: '1 год', verified: true },
  'Коба':    { name: 'Коба',    avatar: '/sold2.png', chatId: 3, index: 1840, rating: 4.8, reviews: 9, ads: 2, joined: '1.5 года', verified: true },
  'Сапсан':  { name: 'Сапсан',  avatar: '/teacher2-main.jpg', chatId: 20, index: 1320, rating: 4.6, reviews: 7, ads: 1, joined: '8 мес.', verified: false },
  'Барс':    { name: 'Барс',    avatar: '/teacher3-main.jpg', chatId: 21, index: 2510, rating: 5.0, reviews: 22, ads: 5, joined: '3 года', verified: true },
  'Стриж':   { name: 'Стриж',   avatar: '/sold3.png', chatId: 22, index: 980, rating: 4.5, reviews: 4, ads: 1, joined: '4 мес.', verified: false },
};

export const CURRENT_USER = 'Торнадо';

export type KaptorkaAd = {
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
  active?: boolean;
  favorites?: number;
  messages?: number;
};

// Фотографии шести демонстрационных объявлений.
// Чтобы заменить фото вручную, достаточно поменять путь справа у нужного ID.
// Карточки идут с другой стороны: объявление 1 использует фото 6, объявление 6 — фото 1.
export const KAPTORKA_SEED_IMAGES: Record<number, string> = {
  1: '/каптерка6.png',
  2: '/каптерка5.png',
  3: '/каптерка4.png',
  4: '/каптерка3.png',
  5: '/каптерка2.png',
  6: '/каптерка1.png',
};

export const INITIAL_KAPTORKA_ADS: KaptorkaAd[] = [
  { id: 1, title: 'Разгрузочный жилет с подсумками, комплект', category: 'Снаряжение', condition: 'Отличное', city: 'Москва', price: 7800, image: KAPTORKA_SEED_IMAGES[1], seller: 'Торнадо', phone: '+7 999 120-44-18', date: 'Сегодня', views: 142, promoted: true, active: true, favorites: 12, messages: 5, desc: 'Комплект после двух тренировочных выездов. Швы целые, фурнитура работает, подсумки под магазины и аптечку в комплекте.' },
  { id: 2, title: 'Берцы демисезонные, размер 43', category: 'Форма', condition: 'Хорошее', city: 'Краснодар', price: 4200, image: KAPTORKA_SEED_IMAGES[2], seller: 'Бек', phone: '+7 918 220-11-07', date: 'Вчера', views: 89, active: true, favorites: 4, messages: 2, desc: 'Подойдут для полигона и марш-бросков. Носились аккуратно, подошва без трещин.' },
  { id: 3, title: 'Тактический рюкзак 45 литров', category: 'Рюкзаки', condition: 'Новое', city: 'Санкт-Петербург', price: 6500, image: KAPTORKA_SEED_IMAGES[3], seller: 'Коба', phone: '+7 921 554-09-80', date: '2 дня назад', views: 213, promoted: true, active: true, favorites: 18, messages: 7, desc: 'Новый рюкзак с системой MOLLE, отделением под гидратор и плотной спинкой.' },
  { id: 4, title: 'Учебный набор для тактической медицины', category: 'Учебное', condition: 'Отличное', city: 'Казань', price: 3100, image: KAPTORKA_SEED_IMAGES[4], seller: 'Торнадо', phone: '+7 917 444-67-32', date: '3 дня назад', views: 76, active: true, favorites: 3, messages: 1, desc: 'Тренировочные бинты, турникет-макет, карточки алгоритмов. Для занятий в группе.' },
  { id: 5, title: 'Коллиматорный прицел для учебной винтовки', category: 'Оптика', condition: 'Хорошее', city: 'Москва', price: 9300, image: KAPTORKA_SEED_IMAGES[5], seller: 'Барс', phone: '+7 985 012-66-55', date: '5 дней назад', views: 118, active: true, favorites: 9, messages: 3, desc: 'Использовался только на тренировках. Стекло чистое, крепление в комплекте.' },
  { id: 6, title: 'Обмен: подсумки на тактические перчатки', category: 'Обмен', condition: 'Хорошее', city: 'Новосибирск', price: 0, image: KAPTORKA_SEED_IMAGES[6], seller: 'Стриж', phone: '+7 913 707-15-20', date: 'Неделю назад', views: 54, active: true, favorites: 1, messages: 0, desc: 'Отдам два подсумка под магазины, интересуют перчатки M/L или налокотники.' },
  { id: 7, title: 'Тактические наколенники, пара', category: 'Снаряжение', condition: 'Новое', city: 'Москва', price: 2400, image: '/specpred2.png', seller: 'Торнадо', phone: '+7 999 120-44-18', date: '4 дня назад', views: 38, active: false, favorites: 2, messages: 1, desc: 'Новые наколенники в упаковке. Универсальный размер, ударопрочный пластик.' },
];

type KaptorkaState = {
  ads: KaptorkaAd[];
  addAd: (ad: KaptorkaAd) => void;
  deleteAd: (id: number) => void;
  toggleActive: (id: number) => void;
  togglePromoted: (id: number) => void;
  updateAd: (id: number, patch: Partial<KaptorkaAd>) => void;
  incrementViews: (id: number) => void;
  incrementMessages: (id: number) => void;
};

export const useKaptorkaStore = create<KaptorkaState>()(
  persist(
    (set) => ({
      ads: INITIAL_KAPTORKA_ADS,
      addAd: (ad) => set((s) => ({ ads: [{ ...ad, active: true, favorites: 0, messages: 0 }, ...s.ads] })),
      deleteAd: (id) => set((s) => ({ ads: s.ads.filter((a) => a.id !== id) })),
      toggleActive: (id) => set((s) => ({ ads: s.ads.map((a) => a.id === id ? { ...a, active: !a.active } : a) })),
      togglePromoted: (id) => set((s) => ({ ads: s.ads.map((a) => a.id === id ? { ...a, promoted: !a.promoted } : a) })),
      updateAd: (id, patch) => set((s) => ({ ads: s.ads.map((a) => a.id === id ? { ...a, ...patch } : a) })),
      incrementViews: (id) => set((s) => ({ ads: s.ads.map((a) => a.id === id ? { ...a, views: a.views + 1 } : a) })),
      incrementMessages: (id) => set((s) => ({ ads: s.ads.map((a) => a.id === id ? { ...a, messages: (a.messages ?? 0) + 1 } : a) })),
    }),
    {
      name: 'voevoda_kaptorka_v2',
      version: 4,
      migrate: () => ({ ads: INITIAL_KAPTORKA_ADS }),
    },
  ),
);
