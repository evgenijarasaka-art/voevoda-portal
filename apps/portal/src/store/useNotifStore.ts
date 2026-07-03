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
  { id: 1, kind: 'like', title: 'Торнадо оценил вашу запись', body: 'Лайк к посту «Тактическая медицина в полевых условиях»', date: '2 мин назад', read: false, link: '/journal/1' },
  { id: 2, kind: 'comment', title: 'Коба прокомментировал', body: '«Отличный материал! Давно искал такую информацию»', date: '15 мин назад', read: false, link: '/journal/1' },
  { id: 3, kind: 'course_enrolled', title: 'Курс добавлен в корзину', body: 'Курс молодого бойца V5', date: '1 час назад', read: false, link: '/checkout?item=course:1' },
  { id: 4, kind: 'new_follower', title: 'Новый подписчик', body: 'Bor подписался на вас', date: '3 часа назад', read: true, link: '/subscribers' },
  { id: 5, kind: 'achievement', title: 'Новое достижение', body: 'Вы получили шеврон «Первый шаг» за прохождение первого занятия', date: '5 часов назад', read: true, link: '/achievements' },
  { id: 6, kind: 'referral', title: 'Реферальный бонус', body: 'По вашей ссылке зарегистрировался новый пользователь. Начислено 429 БР', date: 'Вчера', read: true, link: '/referral' },
  { id: 7, kind: 'system', title: 'Обновление платформы', body: 'Добавлены новые курсы и функции раздела «Путь Воеводы»', date: 'Вчера', read: true, link: '/my-path' },
  { id: 8, kind: 'course_started', title: 'Занятие начинается завтра', body: 'Курс «Общевойсковой снайпер» — занятие №3 в 10:00', date: '2 дня назад', read: true, link: '/courses/%D0%9E%D0%B1%D1%89%D0%B5%D0%B2%D0%BE%D0%B9%D1%81%D0%BA%D0%BE%D0%B2%D0%BE%D0%B9%20%D0%A1%D0%BD%D0%B0%D0%B9%D0%BF%D0%B5%D1%80' },
  { id: 9, kind: 'like', title: 'Добавлено в избранное', body: 'Курс молодого бойца V5', date: '3 дня назад', read: true, link: '/courses/%D0%9A%D1%83%D1%80%D1%81%20%D0%BC%D0%BE%D0%BB%D0%BE%D0%B4%D0%BE%D0%B3%D0%BE%20%D0%B1%D0%BE%D0%B9%D1%86%D0%B0%20V5' },
  { id: 10, kind: 'comment', title: 'Новый комментарий', body: 'Klim: «Согласен с автором, очень полезно»', date: '3 дня назад', read: true, link: '/journal/2' },
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
    { name: 'voevoda_notifications_v3' }
  )
);
