import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PurchasedCourse {
  id: string; slug: string; title: string;
  price: number; img: string; city: string;
  start: string; end: string; progress: number; hw: number; rating: number;
}
interface Pending { slug: string; title: string; price: number; img: string; city: string; }
interface State {
  courses: PurchasedCourse[];
  pending: Pending | null;
  add: (c: PurchasedCourse) => void;
  has: (slug: string) => boolean;
  setPending: (p: Pending | null) => void;
  confirmPending: () => void;
}
export const usePurchasedCoursesStore = create<State>()(
  persist(
    (set, get) => ({
      courses: [],
      pending: null,
      add: (c) => set(s => ({ courses: [...s.courses.filter(x => x.slug !== c.slug), c] })),
      has: (slug) => get().courses.some(c => c.slug === slug),
      setPending: (p) => set({ pending: p }),
      confirmPending: () => {
        const p = get().pending;
        if (!p) return;
        set(s => ({
          courses: [...s.courses.filter(x => x.slug !== p.slug), {
            id: `pc_${Date.now()}`, slug: p.slug, title: p.title,
            price: p.price, img: p.img, city: p.city,
            start: '23 мая', end: '23 июля', progress: 0, hw: 0, rating: 0,
          }],
          pending: null,
        }));
      },
    }),
    { name: 'purchased-courses-v1' }
  )
);