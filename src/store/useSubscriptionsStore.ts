import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SubscriptionsStore {
  subscribed: Set<string>;
  subscribe: (authorId: string) => void;
  unsubscribe: (authorId: string) => void;
  isSubscribed: (authorId: string) => boolean;
}

export const useSubscriptionsStore = create<SubscriptionsStore>()(
  persist(
    (set, get) => ({
      subscribed: new Set<string>(),
      subscribe: (authorId) =>
        set((s) => ({ subscribed: new Set([...s.subscribed, authorId]) })),
      unsubscribe: (authorId) =>
        set((s) => {
          const next = new Set(s.subscribed);
          next.delete(authorId);
          return { subscribed: next };
        }),
      isSubscribed: (authorId) => get().subscribed.has(authorId),
    }),
    {
      name: 'voevoda_subscriptions',
      partialize: (s) => ({ subscribed: [...s.subscribed] }),
      merge: (persisted: unknown, current) => ({
        ...current,
        subscribed: new Set((persisted as { subscribed?: string[] })?.subscribed ?? []),
      }),
    }
  )
);
