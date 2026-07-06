// ─── ЕДИНЫЙ ИСТОЧНИК ДАННЫХ КУРСОВ ─────────────────────────────────────────────
// Один и тот же набор курсов используется и на главной (блоки «Военная подготовка»
// и «Профессиональная подготовка»), и на отдельных страницах /courses и /professional.
// Так список и «Серии курсов» на главной всегда совпадают с отдельными страницами.

export interface Course {
  id: number;
  city: string;
  duration: string;
  title: string;
  newPrice: number;
  oldPrice?: number;
  description?: string;
  image?: string;
  seriesIndex?: number;
  seriesId?: number;
  seriesName?: string;
  published?: boolean;
  isPaid?: boolean;
  format?: string;
  type?: string;
  locked?: boolean;
  prerequisite?: string;
}

// Форма курса для отдельных страниц (/courses, /professional)
export interface DedicatedCourse {
  id: number;
  title: string;
  city: string;
  duration: string;
  price: number;
  oldPrice: number | null;
  img: string;
  desc: string;
  seriesNum?: number;
  seriesId?: number;
  seriesName?: string;
  locked?: boolean;
  prerequisite?: string;
}

const MILITARY_SERIES = 'Система комплексной военной подготовки';

export const MILITARY_COURSES: Course[] = [
  { id: 1, title: 'Курс молодого бойца V5', city: 'Москва', duration: '4 месяца', newPrice: 35000, image: '/kyrs1.png', description: 'Курс молодого бойца (КМБ) является первым и обязательным этапом обучения в Системе комплексной военной подготовки.', seriesIndex: 1, seriesId: 1, seriesName: MILITARY_SERIES, isPaid: true, format: 'Оффлайн', type: 'Серия курсов', locked: false },
  { id: 2, title: 'Общевойсковой Снайпер', city: 'Санкт-Петербург', duration: '3 месяца', newPrice: 29000, image: '/kyrs2.png', description: 'Профессиональная подготовка снайперов для современных боевых условий и задач на поле боя.', isPaid: true, format: 'Оффлайн', type: 'Курс' },
  { id: 3, title: 'Разведывательно-штурмовая подготовка', city: 'Москва', duration: '3 месяца', newPrice: 29000, oldPrice: 40000, image: '/kyrs3.png', description: 'Углублённый курс подготовки бойцов по программе системы комплексной военной подготовки.', seriesIndex: 2, seriesId: 1, seriesName: MILITARY_SERIES, isPaid: true, format: 'Комбинированный', type: 'Серия курсов', locked: true, prerequisite: 'Курс молодого бойца V5' },
  { id: 4, title: 'Курс молодого бойца V5', city: 'Казань', duration: '4 месяца', newPrice: 35000, image: '/voen2.png', description: 'Базовый курс военной подготовки для всех желающих освоить военное дело.', seriesIndex: 1, seriesId: 2, seriesName: MILITARY_SERIES, isPaid: true, format: 'Оффлайн', type: 'Серия курсов', locked: false },
  { id: 5, title: 'Разведывательно-штурмовая подготовка', city: 'Москва', duration: '4 месяца', newPrice: 35000, oldPrice: 40000, image: '/voen3.png', description: 'Углублённая подготовка бойцов по программе 2-го уровня системы.', seriesIndex: 2, seriesId: 2, seriesName: MILITARY_SERIES, isPaid: true, format: 'Оффлайн', type: 'Серия курсов', locked: true, prerequisite: 'Общевойсковой снайпер' },
  { id: 6, title: 'Разведывательно-штурмовая подготовка', city: 'Краснодар', duration: '3 месяца', newPrice: 29000, image: '/voen1.png', description: 'Финальный уровень подготовки бойцов разведывательных и штурмовых подразделений.', seriesIndex: 3, seriesId: 2, seriesName: MILITARY_SERIES, isPaid: true, format: 'Онлайн', type: 'Серия курсов', locked: true, prerequisite: 'Курс молодого бойца V5' },
  { id: 7, title: 'Специальная разведка', city: 'Москва', duration: '3 месяца', newPrice: 32000, image: '/voen4.png', description: 'Четвёртый этап серии: наблюдение, скрытное перемещение, организация связи и работа разведывательной группы.', seriesIndex: 4, seriesId: 2, seriesName: MILITARY_SERIES, isPaid: true, format: 'Оффлайн', type: 'Серия курсов', locked: true, prerequisite: 'Разведывательно-штурмовая подготовка' },
];

export const PROFESSIONAL_COURSES: Course[] = [
  { id: 101, title: 'Управление проектами (PMP)', city: 'Москва', duration: '3 месяца', newPrice: 45000, image: '/проф1.png', description: 'Комплексная программа подготовки проектных менеджеров по международному стандарту PMI. Охватывает все фазы жизненного цикла проекта — от инициации до закрытия.', seriesIndex: 1, seriesId: 1, seriesName: 'Финансовый трек', isPaid: true, format: 'Онлайн', type: 'Серия курсов', locked: false },
  { id: 102, title: 'Data Science & Machine Learning', city: 'Москва', duration: '6 месяцев', newPrice: 89000, image: '/проф2.png', description: 'Профессиональный курс по анализу данных и машинному обучению. Python, pandas, sklearn, нейросети — от основ до production-готовых решений.', isPaid: true, format: 'Онлайн', type: 'Курс' },
  { id: 103, title: 'Финансовый аналитик CFA Level I', city: 'Москва', duration: '4 месяца', newPrice: 65000, oldPrice: 80000, image: '/проф3.png', description: 'Подготовка к международной сертификации CFA. Портфельный анализ, оценка активов, корпоративные финансы и финансовая отчётность по МСФО.', seriesIndex: 2, seriesId: 1, seriesName: 'Финансовый трек', isPaid: true, format: 'Комбинированный', type: 'Серия курсов', locked: true, prerequisite: 'Управление проектами (PMP)' },
  { id: 104, title: 'Корпоративное право и M&A', city: 'Москва', duration: '3 месяца', newPrice: 55000, image: '/проф1.png', description: 'Правовые основы корпоративных сделок. Слияния и поглощения, due diligence, структурирование сделок и договорная работа.', seriesIndex: 1, seriesId: 2, seriesName: 'Управленческий трек', isPaid: true, format: 'Онлайн', type: 'Серия курсов', locked: false },
  { id: 105, title: 'Стратегический маркетинг', city: 'Москва', duration: '2 месяца', newPrice: 39000, oldPrice: 48000, image: '/проф4.png', description: 'Построение маркетинговой стратегии, бренд-менеджмент, performance-маркетинг и аналитика. Курс для руководителей и senior-маркетологов.', seriesIndex: 2, seriesId: 2, seriesName: 'Управленческий трек', isPaid: true, format: 'Онлайн', type: 'Серия курсов', locked: true, prerequisite: 'Корпоративное право и M&A' },
  { id: 106, title: 'HR Business Partner', city: 'Москва', duration: '2 месяца', newPrice: 35000, image: '/проф5.png', description: 'Стратегическое управление персоналом по методологии HRBP. Оценка и развитие талантов, создание HR-стратегии, работа с вовлечённостью.', seriesIndex: 3, seriesId: 2, seriesName: 'Управленческий трек', isPaid: true, format: 'Онлайн', type: 'Серия курсов', locked: true, prerequisite: 'Корпоративное право и M&A' },
  { id: 107, title: 'Введение в управление проектами', city: 'Онлайн', duration: '2 недели', newPrice: 0, image: '/проф1.png', description: 'Бесплатный вводный курс: базовые принципы PM, жизненный цикл проекта, agile vs waterfall. Идеально для старта.', isPaid: false, format: 'Онлайн', type: 'Курс' },
  { id: 108, title: 'Основы финансовой грамотности', city: 'Онлайн', duration: '3 недели', newPrice: 0, image: '/проф3.png', description: 'Бесплатный курс по личным финансам: бюджет, накопления, инвестиции и налоги. Для тех, кто хочет взять финансы под контроль.', isPaid: false, format: 'Онлайн', type: 'Курс' },
];

// Маппер в форму отдельных страниц
export const toDedicated = (c: Course): DedicatedCourse => ({
  id: c.id,
  title: c.title,
  city: c.city,
  duration: c.duration,
  price: c.newPrice,
  oldPrice: c.oldPrice ?? null,
  img: c.image ?? '/voen1.png',
  desc: c.description ?? '',
  seriesNum: c.seriesIndex,
  seriesId: c.seriesId,
  seriesName: c.seriesName,
  locked: c.locked,
  prerequisite: c.prerequisite,
});
