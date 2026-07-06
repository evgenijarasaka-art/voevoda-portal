import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNotifStore } from './useNotifStore';

export interface CartCourse {
  id: number;
  kind: 'course';
  title: string;
  city: string;
  duration: string;
  price: number;
  oldPrice?: number;
  format: string;
  image: string;
  stream: string;
  isFav: boolean;
  isSelected: boolean;
}

export interface CartProduct {
  id: number;
  kind: 'product';
  title: string;
  brand: string;
  price: number;
  oldPrice?: number;
  size?: string;
  color?: string;
  qty: number;
  image: string;
  isFav: boolean;
  isSelected: boolean;
}

export type CartItem = CartCourse | CartProduct;

interface CartState {
  items: CartItem[];
  addCourse: (c: Omit<CartCourse, 'isFav' | 'isSelected'>) => void;
  addProduct: (p: Omit<CartProduct, 'isFav' | 'isSelected'>) => void;
  remove: (id: number, kind: string) => void;
  updateQty: (id: number, delta: number) => void;
  toggleSelect: (id: number, kind: CartItem['kind']) => void;
  selectAll: (kind?: CartItem['kind']) => void;
  deselectAll: (kind?: CartItem['kind']) => void;
  removeSelected: (kind?: CartItem['kind']) => void;
  toggleFav: (id: number, kind: CartItem['kind']) => void;
  setStream: (id: number, stream: string) => void;
  has: (id: number, kind: string) => boolean;
  selectedItems: () => CartItem[];
  total: () => number;
  discount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addCourse: (c) => {
        const existing = get().items.find(i => i.id === c.id && i.kind === 'course');
        set({
          items: existing
            ? get().items.map(i => i.id === c.id && i.kind === 'course'
              ? { ...i, ...c, kind: 'course' as const, isSelected: true }
              : i)
            : [...get().items, { ...c, kind: 'course', isFav: false, isSelected: true }],
        });
        useNotifStore.getState().add({
          kind: 'course_enrolled',
          title: existing ? 'Курс выбран в корзине' : 'Курс добавлен в корзину',
          body: c.title,
          link: `/checkout?item=course:${c.id}`,
        });
      },
      addProduct: (p) => {
        if (get().has(p.id, 'product')) return;
        set({ items: [...get().items, { ...p, kind: 'product', isFav: false, isSelected: true }] });
        useNotifStore.getState().add({
          kind: 'system',
          title: 'Товар добавлен в корзину',
          body: p.title,
          link: `/checkout?item=product:${p.id}`,
        });
      },
      remove: (id, kind) =>
        set({ items: get().items.filter(i => !(i.id === id && i.kind === kind)) }),
      updateQty: (id, delta) =>
        set({
          items: get().items.map(i =>
            i.id === id && i.kind === 'product'
              ? { ...i, qty: Math.max(1, (i as CartProduct).qty + delta) }
              : i
          ),
        }),
      toggleSelect: (id, kind) =>
        set({ items: get().items.map(i => i.id === id && i.kind === kind ? { ...i, isSelected: !i.isSelected } : i) }),
      selectAll: (kind) =>
        set({ items: get().items.map(i => !kind || i.kind === kind ? { ...i, isSelected: true } : i) }),
      deselectAll: (kind) =>
        set({ items: get().items.map(i => !kind || i.kind === kind ? { ...i, isSelected: false } : i) }),
      removeSelected: (kind) =>
        set({ items: get().items.filter(i => !(i.isSelected && (!kind || i.kind === kind))) }),
      toggleFav: (id, kind) =>
        set({ items: get().items.map(i => i.id === id && i.kind === kind ? { ...i, isFav: !i.isFav } : i) }),
      setStream: (id, stream) =>
        set({
          items: get().items.map(i =>
            i.id === id && i.kind === 'course' ? { ...i, stream } : i
          ),
        }),
      has: (id, kind) => get().items.some(i => i.id === id && i.kind === kind),
      selectedItems: () => get().items.filter(i => i.isSelected),
      total: () =>
        get().items
          .filter(i => i.isSelected)
          .reduce((s, i) => s + (i.kind === 'product' ? i.price * i.qty : i.price), 0),
      discount: () =>
        get().items
          .filter(i => i.isSelected && i.oldPrice)
          .reduce((s, i) => s + ((i.oldPrice ?? i.price) - i.price) * (i.kind === 'product' ? i.qty : 1), 0),
    }),
    {
      name: 'voevoda_cart',
      version: 3,
      migrate: () => ({ items: [] }),
    }
  )
);
