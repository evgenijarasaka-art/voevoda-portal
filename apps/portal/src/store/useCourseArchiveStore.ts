import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ArchivedCourse {
  id: number;
  title: string;
  img: string;
  slug: string;
  archivedAt: string;
  hiddenInProfile: boolean;
  rating?: number;
  courseProgress: number;
  hwProgress: number;
  start: string;
  end: string;
  passed: boolean;
}

interface ArchiveState {
  archived: ArchivedCourse[];
  addToArchive: (course: Omit<ArchivedCourse, 'archivedAt' | 'hiddenInProfile'>) => void;
  removeFromArchive: (id: number) => void;
  toggleHidden: (id: number) => void;
  isArchived: (id: number) => boolean;
}

export const useCourseArchiveStore = create<ArchiveState>()(
  persist(
    (set, get) => ({
      archived: [],
      addToArchive: (course) => set(s => ({
        archived: [
          ...s.archived,
          {
            ...course,
            archivedAt: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
            hiddenInProfile: false,
          },
        ],
      })),
      removeFromArchive: (id) => set(s => ({ archived: s.archived.filter(c => c.id !== id) })),
      toggleHidden: (id) => set(s => ({
        archived: s.archived.map(c => c.id === id ? { ...c, hiddenInProfile: !c.hiddenInProfile } : c),
      })),
      isArchived: (id) => get().archived.some(c => c.id === id),
    }),
    { name: 'voevoda-course-archive' }
  )
);
