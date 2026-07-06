import { useEffect, useState } from 'react';
import type { Course } from './courses';

const JSONBIN_CONFIG = {
  binId: import.meta.env.VITE_JSONBIN_BIN_ID ?? '',
  apiKey: import.meta.env.VITE_JSONBIN_API_KEY ?? '',
  baseUrl: 'https://api.jsonbin.io/v3/b',
};

// Слой синхронизации с админкой. В dev это middleware vite-сервера (/__admin-sync,
// см. apps/portal/vite.config.ts), в продакшене — serverless-функция Vercel
// (/api/admin-sync, см. apps/portal/api/admin-sync.js). Оба живут на том же
// origin, что и портал. Можно переопределить через VITE_ADMIN_SYNC_URL;
// пустая строка отключает.
const SYNC_URL = import.meta.env.VITE_ADMIN_SYNC_URL
  ?? (import.meta.env.DEV ? '/__admin-sync' : '/api/admin-sync');

const SITE_DATA_KEYS = ['site_data', 'voevoda_admin_site_data_v1'];

/**
 * Тянет актуальный снимок данных портала из общего источника:
 * сначала локальный sync-эндпоинт, затем JSONBin (если настроен).
 * Результат кэшируется в localStorage['site_data'], чтобы синхронные
 * геттеры (getPublishedCoursesSync) сразу видели свежие данные.
 */
async function fetchRemoteSiteData(): Promise<AdminSiteData | null> {
  if (SYNC_URL) {
    try {
      const response = await fetch(SYNC_URL, { headers: { Accept: 'application/json' } });
      if (response.ok) {
        const record = (await response.json()) as AdminSiteData | null;
        if (record && Object.keys(record).length > 0) {
          localStorage.setItem('site_data', JSON.stringify(record));
          return record;
        }
      }
    } catch {
      // Эндпоинт недоступен (портал запущен без dev-сервера) — пробуем другие источники.
    }
  }

  if (JSONBIN_CONFIG.binId && JSONBIN_CONFIG.apiKey) {
    try {
      const response = await fetch(`${JSONBIN_CONFIG.baseUrl}/${JSONBIN_CONFIG.binId}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_CONFIG.apiKey },
      });
      if (response.ok) {
        const payload = (await response.json()) as { record?: AdminSiteData };
        if (payload.record) {
          localStorage.setItem('site_data', JSON.stringify(payload.record));
          return payload.record;
        }
      }
    } catch {
      // Оффлайн/локальная разработка — остаёмся на кэше или статике.
    }
  }

  return null;
}

export type AdminCourseScope = 'military' | 'professional' | 'all';

type AdminCourse = {
  id?: number;
  title?: string;
  city?: string;
  duration?: string;
  price?: number;
  newPrice?: number;
  oldPrice?: number | null;
  description?: string;
  desc?: string;
  image?: string;
  img?: string;
  published?: boolean;
  isPaid?: boolean;
  format?: string;
  type?: string;
  category?: AdminCourseScope;
  seriesIndex?: number;
  seriesId?: number;
  seriesName?: string;
  locked?: boolean;
  prerequisite?: string;
};

type AdminSiteData = {
  courses?: { courses?: AdminCourse[] } | AdminCourse[];
  hiddenCourseIds?: Array<number | string>;
  training?: {
    calendarEvents?: AdminStreamEvent[];
    courseCalendars?: Record<string, AdminStreamEvent[]>;
    courseLanding?: AdminCourseLanding;
    courseLandings?: Record<string, AdminCourseLanding>;
  };
};

export type AdminStreamEvent = {
  id?: number | string;
  day?: number;
  month?: number;
  year?: number;
  title?: string;
  city?: string;
  type?: string;
  timeStart?: string;
  timeEnd?: string;
  instructor?: string;
  num?: number;
  description?: string;
  image?: string;
  location?: string;
  format?: string;
  equipment?: string[];
  goals?: string[];
  status?: string;
};

export type AdminCourseLanding = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadge?: string;
  heroImage?: string;
  startText?: string;
  benefits?: string[];
  requirements?: string[];
  photos?: string[];
  programIntro?: string;
  programGroups?: Array<{ id?: number | string; title?: string; items?: string[] }>;
  equipment?: string[];
  resultsText?: string;
  mapTitle?: string;
  mapSubtitle?: string;
  reviewsTitle?: string;
  price?: number | string;
  videoTitle?: string;
  videoUrl?: string;
  videoPoster?: string;
  instructorName?: string;
  instructorRank?: string;
  instructorRole?: string;
  instructorImage?: string;
  instructorExp?: string;
  instructorTrained?: string;
  instructorCourses?: string;
  studentsCount?: string;
  rating?: string;
  reviewsCount?: string;
  seatsFree?: number | string;
  seatsTotal?: number | string;
};

export type AdminTrainingData = NonNullable<AdminSiteData['training']>;

/**
 * Лендинг конкретного курса (по имени курса = slug страницы).
 * Возвращает null, если для курса в админке нет своего лендинга —
 * тогда страница использует встроенные значения по умолчанию.
 * Глобальный courseLanding НЕ применяется ко всем курсам (это была логическая ошибка).
 */
export function getCourseLandingFor(
  training: AdminTrainingData | null | undefined,
  courseName: string | undefined,
): AdminCourseLanding | null {
  if (!training || !courseName) return null;
  const key = courseName.trim().toLowerCase();
  return training.courseLandings?.[key] ?? null;
}

/**
 * Расписание (потоки) конкретного курса. Если у курса нет своего календаря —
 * возвращает null (StreamCalendar тогда покажет встроенные занятия по умолчанию).
 */
export function getCourseCalendar(
  training: AdminTrainingData | null | undefined,
  courseName: string | undefined,
): AdminStreamEvent[] | null {
  if (!training) return null;
  if (courseName) {
    const key = courseName.trim().toLowerCase();
    const list = training.courseCalendars?.[key];
    if (Array.isArray(list) && list.length) return list;
  }
  return null;
}

function normalizeAsset(src?: string) {
  if (!src) return undefined;
  return src.replace('../portal/public/', '/').replace(/^apps\/portal\/public\//, '/');
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function getSiteDataSync() {
  for (const key of SITE_DATA_KEYS) {
    const data = readJson<AdminSiteData>(key);
    if (data) return data;
  }
  return null;
}

function extractCourses(data: AdminSiteData | null): AdminCourse[] {
  if (!data?.courses) return [];
  return Array.isArray(data.courses) ? data.courses : data.courses.courses ?? [];
}

function courseMatchesScope(course: AdminCourse, scope: AdminCourseScope) {
  if (scope === 'all') return true;
  if (!course.category) return scope === 'military';
  return course.category === scope;
}

function toPortalCourse(course: AdminCourse, fallbackIndex: number): Course {
  const newPrice = Number(course.newPrice ?? course.price ?? 0);
  const oldPrice = course.oldPrice == null ? undefined : Number(course.oldPrice);

  return {
    id: Number(course.id ?? Date.now() + fallbackIndex),
    title: course.title ?? 'Новый курс',
    city: course.city ?? 'Москва',
    duration: course.duration ?? '3 месяца',
    newPrice,
    oldPrice,
    description: course.description ?? course.desc ?? '',
    image: normalizeAsset(course.image ?? course.img) ?? '/military-course.jpg',
    published: course.published !== false,
    isPaid: course.isPaid ?? newPrice > 0,
    format: course.format ?? 'Оффлайн',
    type: course.type ?? 'Курс',
    seriesIndex: course.seriesIndex,
    seriesId: course.seriesId,
    seriesName: course.seriesName,
    locked: course.locked,
    prerequisite: course.prerequisite,
  };
}

function mergeCourses(fallback: Course[], data: AdminSiteData | null, scope: AdminCourseScope) {
  const hiddenCourseIds = new Set((data?.hiddenCourseIds ?? []).map(String));
  const fromAdmin = extractCourses(data)
    .filter(course => course.published !== false && courseMatchesScope(course, scope))
    .map(toPortalCourse);

  const visibleFallback = fallback.filter(course => !hiddenCourseIds.has(String(course.id)));
  if (!fromAdmin.length) return visibleFallback;

  const merged = new Map<number, Course>();
  visibleFallback.forEach(course => merged.set(course.id, course));
  fromAdmin.forEach(course => {
    if (hiddenCourseIds.has(String(course.id))) return;
    const original = merged.get(course.id);
    merged.set(course.id, original ? { ...original, ...course } : course);
  });

  return Array.from(merged.values());
}

export function getPublishedCoursesSync(fallback: Course[], scope: AdminCourseScope = 'military') {
  const data = getSiteDataSync();
  const syncedCourses = mergeCourses(fallback, data, scope);
  if (syncedCourses !== fallback) return syncedCourses;

  const legacy = readJson<{ courses?: AdminCourse[]; hiddenCourseIds?: Array<number | string> }>('site_courses');
  const courses = mergeCourses(fallback, { courses: legacy?.courses ?? [], hiddenCourseIds: legacy?.hiddenCourseIds }, scope);
  return courses;
}

export function getAdminTrainingSync(): AdminTrainingData | null {
  return getSiteDataSync()?.training ?? null;
}

export async function loadAdminTraining() {
  const record = await fetchRemoteSiteData();
  if (record) return record.training ?? null;
  return getAdminTrainingSync();
}

export async function loadPublishedCourses(fallback: Course[], scope: AdminCourseScope = 'military') {
  const record = await fetchRemoteSiteData();
  if (record) return mergeCourses(fallback, record, scope);
  return getPublishedCoursesSync(fallback, scope);
}

export function useAdminCourses(fallback: Course[], scope: AdminCourseScope = 'military') {
  const [courses, setCourses] = useState<Course[]>(() => getPublishedCoursesSync(fallback, scope));

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const next = await loadPublishedCourses(fallback, scope);
      if (alive) setCourses(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };

    refresh();
    const onStorage = (event: StorageEvent) => {
      if (!event.key || SITE_DATA_KEYS.includes(event.key) || event.key === 'site_courses') refresh();
    };
    window.addEventListener('storage', onStorage);
    const timer = window.setInterval(refresh, 8000);

    return () => {
      alive = false;
      window.removeEventListener('storage', onStorage);
      window.clearInterval(timer);
    };
  }, [fallback, scope]);

  return courses;
}

export function useAdminTraining() {
  const [training, setTraining] = useState<AdminTrainingData | null>(() => getAdminTrainingSync());

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const next = await loadAdminTraining();
      if (alive) setTraining(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };

    refresh();
    const onStorage = (event: StorageEvent) => {
      if (!event.key || SITE_DATA_KEYS.includes(event.key)) refresh();
    };
    window.addEventListener('storage', onStorage);
    const timer = window.setInterval(refresh, 8000);

    return () => {
      alive = false;
      window.removeEventListener('storage', onStorage);
      window.clearInterval(timer);
    };
  }, []);

  return training;
}
