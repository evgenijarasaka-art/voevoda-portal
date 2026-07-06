import { useLessonProgressStore } from './useLessonProgressStore';
import { useLearningStore } from './useLearningStore';

/*
 * useLearningSummary — единая «живая» сводка прогресса обучения.
 * Считается из реальных действий пользователя, сохранённых в двух persist-сторах:
 *  - useLessonProgressStore — какие занятия открыты/просмотрены;
 *  - useLearningStore       — какие тесты сданы и с каким результатом.
 * Используется в профиле и «Моих курсах», чтобы прогресс был один и тот же
 * везде и обновлялся сразу после действий курсанта.
 */

// Эталонные объёмы активного курса (совпадают с LessonPage / TestPage)
export const LESSONS_TOTAL = 6;
export const TESTS_TOTAL = 5;
export const ACTIVE_COURSE = {
  title: 'Курс Общевойскового снайпера V5',
  slug: encodeURIComponent('Курс Общевойскового снайпера V5'),
  img: '/kyrs3.png',
};

export interface LearningSummary {
  lessonsOpened: number;
  lessonsViewed: number;
  lessonsTotal: number;
  testsAttempted: number;
  testsPassed: number;
  testsTotal: number;
  bestScore: number;
  lessonPct: number;
  testPct: number;
  overallPct: number;
  hasProgress: boolean;
  recentLessons: { id: string; title: string; courseTitle?: string; courseSlug?: string; status: string; updatedAt: string }[];
  resetAll: () => void;
}

export function useLearningSummary(): LearningSummary {
  const lessons = useLessonProgressStore(s => s.lessons);
  const submissions = useLearningStore(s => s.submissions);
  const resetLessons = useLessonProgressStore(s => s.resetAll);
  const resetTests = useLearningStore(s => s.resetAll);

  const lessonList = Object.values(lessons);
  const lessonsOpened = lessonList.length;
  const lessonsViewed = lessonList.filter(l => l.status === 'viewed').length;

  const subList = Object.values(submissions);
  const testsAttempted = subList.length;
  const testsPassed = subList.filter(s => s.passed).length;
  const bestScore = subList.reduce((max, s) => Math.max(max, s.score), 0);

  const lessonPct = Math.min(100, Math.round((lessonsViewed / LESSONS_TOTAL) * 100));
  const testPct = Math.min(100, Math.round((testsPassed / TESTS_TOTAL) * 100));
  const overallPct = Math.round(
    ((Math.min(lessonsViewed, LESSONS_TOTAL) + Math.min(testsPassed, TESTS_TOTAL)) /
      (LESSONS_TOTAL + TESTS_TOTAL)) * 100,
  );

  const recentLessons = [...lessonList]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5)
    .map(l => ({ id: l.id, title: l.title, courseTitle: l.courseTitle, courseSlug: l.courseSlug, status: l.status, updatedAt: l.updatedAt }));

  const resetAll = () => { resetLessons(); resetTests(); };

  return {
    lessonsOpened,
    lessonsViewed,
    lessonsTotal: LESSONS_TOTAL,
    testsAttempted,
    testsPassed,
    testsTotal: TESTS_TOTAL,
    bestScore,
    lessonPct,
    testPct,
    overallPct,
    hasProgress: lessonsOpened > 0 || testsAttempted > 0,
    recentLessons,
    resetAll,
  };
}
