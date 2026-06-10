import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LessonViewStatus = 'opened' | 'viewed';

export interface LessonProgressEntry {
  id: string;
  title: string;
  courseTitle?: string;
  courseSlug?: string;
  openedAt?: string;
  viewedAt?: string;
  updatedAt: string;
  percent: number;
  status: LessonViewStatus;
}

interface TrackLessonInput {
  id: string | number;
  title?: string;
  courseTitle?: string;
  courseSlug?: string;
  percent?: number;
}

interface LessonProgressState {
  lessons: Record<string, LessonProgressEntry>;
  markLessonOpened: (input: TrackLessonInput) => void;
  markLessonViewed: (input: TrackLessonInput) => void;
  resetLesson: (id: string | number) => void;
  isLessonViewed: (id: string | number) => boolean;
  getLesson: (id: string | number) => LessonProgressEntry | undefined;
  getViewedCount: (ids?: Array<string | number>) => number;
}

const toLessonId = (id: string | number) => String(id);

export const useLessonProgressStore = create<LessonProgressState>()(
  persist(
    (set, get) => ({
      lessons: {},

      markLessonOpened: (input) => {
        const id = toLessonId(input.id);
        const existing = get().lessons[id];
        const now = new Date().toISOString();
        const nextPercent = Math.max(existing?.percent ?? 0, input.percent ?? 25);

        set({
          lessons: {
            ...get().lessons,
            [id]: {
              id,
              title: input.title ?? existing?.title ?? `Урок ${id}`,
              courseTitle: input.courseTitle ?? existing?.courseTitle,
              courseSlug: input.courseSlug ?? existing?.courseSlug,
              openedAt: existing?.openedAt ?? now,
              viewedAt: existing?.viewedAt,
              updatedAt: now,
              percent: nextPercent,
              status: existing?.status === 'viewed' ? 'viewed' : 'opened',
            },
          },
        });
      },

      markLessonViewed: (input) => {
        const id = toLessonId(input.id);
        const existing = get().lessons[id];
        const now = new Date().toISOString();

        set({
          lessons: {
            ...get().lessons,
            [id]: {
              id,
              title: input.title ?? existing?.title ?? `Урок ${id}`,
              courseTitle: input.courseTitle ?? existing?.courseTitle,
              courseSlug: input.courseSlug ?? existing?.courseSlug,
              openedAt: existing?.openedAt ?? now,
              viewedAt: now,
              updatedAt: now,
              percent: 100,
              status: 'viewed',
            },
          },
        });
      },

      resetLesson: (lessonId) => {
        const id = toLessonId(lessonId);
        const { [id]: _removed, ...rest } = get().lessons;
        set({ lessons: rest });
      },

      isLessonViewed: (lessonId) => get().lessons[toLessonId(lessonId)]?.status === 'viewed',

      getLesson: (lessonId) => get().lessons[toLessonId(lessonId)],

      getViewedCount: (ids) => {
        const lessons = get().lessons;
        const targetIds = ids?.map(toLessonId);
        return Object.values(lessons).filter((lesson) => {
          if (lesson.status !== 'viewed') return false;
          return targetIds ? targetIds.includes(lesson.id) : true;
        }).length;
      },
    }),
    { name: 'voevoda-lesson-progress-v1' },
  ),
);
