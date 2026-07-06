import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PortalReview = {
  id: number;
  userLogin: string;
  name: string;
  rank: string;
  rating: number;
  image: string;
  title: string;
  text: string;
  city: string;
  createdAt: string;
};

const INITIAL_REVIEWS: PortalReview[] = [
  {
    id: 1,
    userLogin: 'koba',
    name: 'Коба',
    rank: 'Капитан',
    rating: 5,
    image: '/teacher3-main.jpg',
    title: 'Я получил все необходимые знания и навыки!',
    text: 'Курс «Общевойсковой Снайпер» дал необходимую базу и уверенность в работе на полигоне. Программа выстроена грамотно: теория чередуется с практическими занятиями на полигоне, каждый блок закрепляется реальными упражнениями. Особенно ценю то, что инструкторы разбирают ошибки сразу после занятия — без этого прогресс был бы значительно медленнее. После завершения курса я чувствую уверенность при работе с оружием и понимаю тактическую картину боя на уровне, которого ожидал достичь только через год самостоятельных тренировок.',
    city: 'Москва',
    createdAt: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 2,
    userLogin: 'bek',
    name: 'Бек',
    rank: 'Майор',
    rating: 5,
    image: '/teacher1-main.jpg',
    title: 'Сильная программа подготовки',
    text: 'Последовательная программа, понятные критерии и подробный разбор ошибок после каждого этапа. Инструкторы не просто читают теорию — они передают живой опыт полевой работы. Разбор каждого упражнения с разных точек зрения помог мне понять, где именно я теряю время и допускаю тактические просчёты. Отдельно хочу отметить занятия по ориентированию и связи — темы, которые редко встречаются в гражданских курсах, но критически важны в реальных условиях. Рекомендую программу всем, кто готовится к серьёзной службе.',
    city: 'Москва',
    createdAt: '2026-05-18T12:00:00.000Z',
  },
];

type ReviewsState = {
  reviews: PortalReview[];
  addReview: (review: Omit<PortalReview, 'id' | 'createdAt'>) => void;
};

export const useReviewsStore = create<ReviewsState>()(
  persist(
    set => ({
      reviews: INITIAL_REVIEWS,
      addReview: review => set(state => ({
        reviews: [{ ...review, id: Date.now(), createdAt: new Date().toISOString() }, ...state.reviews],
      })),
    }),
    { name: 'voevoda-reviews-v2' },
  ),
);
