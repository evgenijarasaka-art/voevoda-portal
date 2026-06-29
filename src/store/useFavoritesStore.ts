import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNotifStore } from './useNotifStore';

export interface FavArticle {
  id: number;
  kind: 'article';
  title: string;
  author: string;
  date: string;
  image: string;
  category?: string;
  stats: { views: number; hearts: number; likes: number; comments?: number };
  savedDaysAgo?: number;
  available?: boolean;
  link?: string;
}

export interface FavCourse {
  id: number;
  kind: 'course';
  title: string;
  city: string;
  duration: string;
  price: number;
  format: string;
  image: string;
  purchased?: boolean;
  startDate?: string;
  spotsLeft?: number;
  savedDaysAgo?: number;
  available?: boolean;
}

export interface FavMarket {
  id: number;
  kind: 'market';
  title: string;
  brand: string;
  price: number;
  oldPrice?: number;
  size?: string;
  inStock?: boolean;
  image: string;
  savedDaysAgo?: number;
  available?: boolean;
}

export interface FavKaptorka {
  id: number;
  kind: 'kaptorka';
  title: string;
  condition: string;
  price: number;
  seller: string;
  city: string;
  listedHoursAgo?: number;
  image: string;
  savedDaysAgo?: number;
  available?: boolean;
}

export type FavItem = FavArticle | FavCourse | FavMarket | FavKaptorka;

export function getFavoriteItemLink(item: FavItem) {
  if (item.kind === 'article') return item.link || `/journal/${item.id}`;
  if (item.kind === 'course') return `/courses/${encodeURIComponent(item.title)}`;
  if (item.kind === 'market') return `/market/${item.id}`;
  return `/kaptorka/${item.id}`;
}

const LEGACY_MOCK_ITEMS: FavItem[] = [
  {
    id: 9001,
    kind: 'article',
    title: 'Как готовиться к первому полевому занятию без лишнего риска',
    author: 'Редакция ВОЕВОДА',
    date: '3 марта, 2026',
    image: '/journal-main.jpg',
    category: 'Подготовка',
    stats: { views: 179, hearts: 44, likes: 44, comments: 24 },
    savedDaysAgo: 2,
    available: true,
  },
  {
    id: 9002,
    kind: 'article',
    title: 'Тактика малых групп: разбор маршрута и ролей внутри команды',
    author: 'Инструктор Торнадо',
    date: '28 февраля, 2026',
    image: '/blog6.png',
    category: 'Тактика',
    stats: { views: 340, hearts: 89, likes: 89, comments: 12 },
    savedDaysAgo: 5,
    available: true,
  },
  {
    id: 9003,
    kind: 'article',
    title: 'Снаряжение современного бойца: что действительно нужно на занятии',
    author: 'УТЦ Воевода',
    date: '15 февраля, 2026',
    image: '/voen3.png',
    category: 'Снаряжение',
    stats: { views: 512, hearts: 120, likes: 120, comments: 31 },
    savedDaysAgo: 7,
    available: true,
  },
  {
    id: 9004,
    kind: 'article',
    title: 'Работа с картой: как не потерять группу на маршруте',
    author: 'Коба',
    date: '10 февраля, 2026',
    image: '/карта.png',
    category: 'Навигация',
    stats: { views: 288, hearts: 71, likes: 71, comments: 18 },
    savedDaysAgo: 10,
    available: false,
  },
  {
    id: 6,
    kind: 'course',
    title: 'Курс молодого бойца V5',
    city: 'Москва',
    duration: '4 месяца',
    price: 35000,
    format: 'Очно',
    image: '/kyrs1.png',
    purchased: false,
    startDate: '23 июня',
    spotsLeft: 4,
    savedDaysAgo: 3,
    available: true,
  },
  {
    id: 10,
    kind: 'course',
    title: 'Огневая подготовка: базовый курс',
    city: 'Санкт-Петербург',
    duration: '2 месяца',
    price: 18000,
    format: 'Очно',
    image: '/kyrs2.png',
    purchased: false,
    startDate: '1 июля',
    spotsLeft: 12,
    savedDaysAgo: 1,
    available: true,
  },
  {
    id: 11,
    kind: 'course',
    title: 'Медицинская подготовка бойца TCCC',
    city: 'Москва',
    duration: '3 дня',
    price: 9500,
    format: 'Очно',
    image: '/медицина1.png',
    purchased: false,
    startDate: '20 июня',
    spotsLeft: 2,
    savedDaysAgo: 6,
    available: true,
  },
  {
    id: 12,
    kind: 'course',
    title: 'Горная подготовка: интенсив',
    city: 'Сочи',
    duration: '5 дней',
    price: 45000,
    format: 'Очно',
    image: '/military-course.jpg',
    purchased: true,
    startDate: '10 июля',
    spotsLeft: 8,
    savedDaysAgo: 9,
    available: true,
  },
  {
    id: 7,
    kind: 'market',
    title: 'Тактический рюкзак ALICE Pack 65L',
    brand: 'Mil-Tec',
    price: 4200,
    oldPrice: 5800,
    inStock: true,
    image: '/voen1.png',
    savedDaysAgo: 1,
    available: true,
  },
  {
    id: 8,
    kind: 'market',
    title: 'Берцы трекинговые демисезонные',
    brand: 'GARSING',
    size: '43',
    price: 6500,
    inStock: false,
    image: '/voen2.png',
    savedDaysAgo: 8,
    available: false,
  },
  {
    id: 13,
    kind: 'market',
    title: 'Плитоноска SMERSH AK',
    brand: 'Снаряжение',
    price: 8900,
    inStock: true,
    image: '/оружие1.png',
    savedDaysAgo: 3,
    available: true,
  },
  {
    id: 9,
    kind: 'kaptorka',
    title: 'Разгрузочный жилет б/у, отличное состояние',
    condition: 'Б/У',
    price: 1200,
    seller: 'Бек',
    city: 'Москва',
    listedHoursAgo: 2,
    image: '/kapt1.png',
    savedDaysAgo: 3,
    available: true,
  },
  {
    id: 15,
    kind: 'kaptorka',
    title: 'Шлем с чехлом и подшлемником',
    condition: 'Новый',
    price: 8500,
    seller: 'Стрелок',
    city: 'Самара',
    listedHoursAgo: 14,
    image: '/kapt2.png',
    savedDaysAgo: 1,
    available: true,
  },
  {
    id: 16,
    kind: 'kaptorka',
    title: 'Комплект подсумков, срочно',
    condition: 'Б/У',
    price: 3200,
    seller: 'Нексус',
    city: 'Екатеринбург',
    listedHoursAgo: 72,
    image: '/предлож2.png',
    savedDaysAgo: 5,
    available: false,
  },
];

interface FavoritesState {
  items: FavItem[];
  toggle: (item: FavItem) => void;
  remove: (id: number, kind: FavItem['kind']) => void;
  has: (id: number, kind: FavItem['kind']) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Избранное заполняется только действиями пользователя из реальных карточек.
      items: LEGACY_MOCK_ITEMS.filter(() => false),
      toggle: (item) => {
        const exists = get().items.some(i => i.id === item.id && i.kind === item.kind);
        set({
          items: exists
            ? get().items.filter(i => !(i.id === item.id && i.kind === item.kind))
            : [item, ...get().items],
        });
        if (!exists) {
          useNotifStore.getState().add({
            kind: 'like',
            title: 'Добавлено в избранное',
            body: item.title,
            link: getFavoriteItemLink(item),
          });
        }
      },
      remove: (id, kind) => {
        set({ items: get().items.filter(i => !(i.id === id && i.kind === kind)) });
      },
      has: (id, kind) => get().items.some(i => i.id === id && i.kind === kind),
    }),
    {
      name: 'voevoda_favorites',
      version: 6,
      migrate: () => ({ items: LEGACY_MOCK_ITEMS.filter(() => false) }),
    }
  )
);
