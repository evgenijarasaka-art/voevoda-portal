import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotifKind =
  | 'like'
  | 'comment'
  | 'course_enrolled'
  | 'course_started'
  | 'new_follower'
  | 'achievement'
  | 'system'
  | 'referral';

export interface Notification {
  id: number;
  kind: NotifKind;
  title: string;
  body: string;
  date: string;
  read: boolean;
  avatar?: string;
  link?: string;
}

interface NotifState {
  items: Notification[];
  add: (n: Omit<Notification, 'id' | 'read' | 'date'>) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

const SEED: Notification[] = [
  { id: 1, kind: 'like', title: 'Торнадо оценил вашу запись', body: 'Лайк к посту «Тактическая медицина в полевых условиях»', date: '2 мин назад', read: false, link: '/journal' },
  { id: 2, kind: 'comment', title: 'Коба прокомментировал', body: '«Отличный материал! Давно искал такую информацию»', date: '15 мин назад', read: false, link: '/journal' },
  { id: 3, kind: 'course_enrolled', title: 'Запись подтверждена', body: 'Вы записаны на курс «Курс молодого бойца V5» — старт 20 марта', date: '1 час назад', read: false, link: '/cart' },
  { id: 4, kind: 'new_follower', title: 'Новый подписчик', body: 'Bor подписался на вас', date: '3 часа назад', read: true, link: '/profile' },
  { id: 5, kind: 'achievement', title: 'Новое достижение', body: 'Вы получили шеврон «Первый шаг» за прохождение первого занятия', date: '5 часов назад', read: true, link: '/my-path' },
  { id: 6, kind: 'referral', title: 'Реферальный бонус', body: 'По вашей ссылке зарегистрировался новый пользователь. Начислено 429 БР', date: 'Вчера', read: true, link: '/wallet' },
  { id: 7, kind: 'system', title: 'Обновление платформы', body: 'Добавлены новые курсы и функции раздела «Путь Воеводы»', date: 'Вчера', read: true },
  { id: 8, kind: 'course_started', title: 'Занятие начинается завтра', body: 'Курс «Общевойсковой снайпер» — занятие №3 в 10:00', date: '2 дня назад', read: true, link: '/my-courses' },
  { id: 9, kind: 'like', title: 'Торнадо и ещё 5 человек оценили', body: 'Ваш комментарий к статье «Создание морской пехоты»', date: '3 дня назад', read: true, link: '/journal' },
  { id: 10, kind: 'comment', title: 'Новый комментарий', body: 'Klim: «Согласен с автором, очень полезно»', date: '3 дня назад', read: true, link: '/journal' },
];

export const useNotifStore = create<NotifState>()(
  persist(
    (set, get) => ({
      items: SEED,
      add: (n) => set({ items: [{ ...n, id: Date.now(), read: false, date: 'Только что' }, ...get().items] }),
      markRead: (id) => set({ items: get().items.map(i => i.id === id ? { ...i, read: true } : i) }),
      markAllRead: () => set({ items: get().items.map(i => ({ ...i, read: true })) }),
      unreadCount: () => get().items.filter(i => !i.read).length,
    }),
    { name: 'voevoda_notifications_v2' }
  )
);
