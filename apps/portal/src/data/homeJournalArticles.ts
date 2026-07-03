export type HomeJournalCategory = 'Статьи' | 'Новости' | 'Поток' | 'Блог';

export interface HomeJournalArticle {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  date: string;
  image: string;
  category: HomeJournalCategory;
  readTime: number;
  stats: { views: number; hearts: number; jumbo: number };
  excerpt?: string;
}

export const HOME_JOURNAL_ARTICLES: HomeJournalArticle[] = [
  { id: 1001, title: 'Дороги обработали раствором гидрохлорида натрия с помощью трёх авторазливочных станций нового типа', author: 'ВДВ СКОВ', authorAvatar: '/teacher1-main.jpg', date: '3 марта, 2024', image: '/journal-main.jpg', category: 'Статьи', readTime: 4, stats: { views: 179, hearts: 224, jumbo: 244 } },
  { id: 1002, title: 'Создание морской пехоты неразрывно связано с именем Петра Великого', author: 'ВДВ СКОВ', authorAvatar: '/teacher2-main.jpg', date: '3 марта, 2024', image: '/military-course.jpg', category: 'Статьи', readTime: 3, stats: { views: 179, hearts: 224, jumbo: 244 } },
  { id: 1003, title: 'Военнослужащие псковской дивизии ВДВ помогают дезинфекции населённых пунктов', author: 'ВДВ СКОВ', authorAvatar: '/teacher3-main.jpg', date: '3 марта, 2024', image: '/banner.jpg', category: 'Статьи', readTime: 5, stats: { views: 179, hearts: 224, jumbo: 244 } },
  { id: 1004, title: 'Десантники провели учения в условиях арктического холода на полигоне Мулино', author: 'ВДВ СКОВ', authorAvatar: '/teacher1-main.jpg', date: '2 марта, 2024', image: '/flag-bg.jpg', category: 'Статьи', readTime: 6, stats: { views: 142, hearts: 188, jumbo: 201 } },
  { id: 1005, title: 'Подразделения ЦВО отработали форсирование водных преград в ночных условиях', author: 'ВДВ СКОВ', authorAvatar: '/teacher2-main.jpg', date: '1 марта, 2024', image: '/journal-main.jpg', category: 'Статьи', readTime: 4, stats: { views: 98, hearts: 134, jumbo: 156 } },
  { id: 1006, title: 'Бойцы спецназа ЮВО провели антидроновые учения на горном полигоне в Дагестане', author: 'ВДВ СКОВ', authorAvatar: '/teacher3-main.jpg', date: '28 февраля, 2024', image: '/banner.jpg', category: 'Статьи', readTime: 3, stats: { views: 211, hearts: 289, jumbo: 267 } },
  { id: 1007, title: 'Минобороны сообщило об успешных испытаниях новой боевой экипировки «Ратник-3»', author: 'Военный вестник', authorAvatar: '/teacher1-main.jpg', date: '3 марта, 2024', image: '/register-slide-1.jpg', category: 'Новости', readTime: 3, stats: { views: 312, hearts: 445, jumbo: 389 } },
  { id: 1008, title: 'Россия и Беларусь проведут совместные учения «Союзная решимость» в мае 2024 года', author: 'Военный вестник', authorAvatar: '/teacher2-main.jpg', date: '2 марта, 2024', image: '/banner.jpg', category: 'Новости', readTime: 4, stats: { views: 267, hearts: 321, jumbo: 298 } },
  { id: 1009, title: 'Государственная Дума приняла поправки о добровольной военной подготовке граждан', author: 'Военный вестник', authorAvatar: '/teacher3-main.jpg', date: '1 марта, 2024', image: '/flag-bg.jpg', category: 'Новости', readTime: 5, stats: { views: 198, hearts: 276, jumbo: 241 } },
  { id: 1010, title: 'ВКС России получили первую партию обновлённых истребителей Су-35С', author: 'Военный вестник', authorAvatar: '/teacher1-main.jpg', date: '28 февраля, 2024', image: '/journal-main.jpg', category: 'Новости', readTime: 3, stats: { views: 421, hearts: 512, jumbo: 467 } },
  { id: 1011, title: 'В России откроют 12 новых учебно-тренировочных полигонов для добровольцев', author: 'Военный вестник', authorAvatar: '/teacher2-main.jpg', date: '27 февраля, 2024', image: '/military-course.jpg', category: 'Новости', readTime: 4, stats: { views: 189, hearts: 234, jumbo: 212 } },
  { id: 1012, title: 'Новые стандарты физподготовки введут для всех контрактников с апреля 2024 года', author: 'Военный вестник', authorAvatar: '/teacher3-main.jpg', date: '26 февраля, 2024', image: '/banner.jpg', category: 'Новости', readTime: 3, stats: { views: 156, hearts: 198, jumbo: 174 } },
  { id: 1013, title: 'Как прошёл мой первый тактический марш: личный опыт курсанта «Воеводы»', author: 'Курсант Алексей К.', authorAvatar: '/teacher2-main.jpg', date: '3 марта, 2024', image: '/register-slide-2.jpg', category: 'Поток', readTime: 7, stats: { views: 89, hearts: 143, jumbo: 127 } },
  { id: 1014, title: 'Отчёт о прохождении КМБ — три недели, которые изменили моё мышление', author: 'Курсант Михаил Д.', authorAvatar: '/teacher3-main.jpg', date: '2 марта, 2024', image: '/military-course.jpg', category: 'Поток', readTime: 8, stats: { views: 76, hearts: 118, jumbo: 102 } },
  { id: 1015, title: 'Мои тренировки по Тесту Купера: прогресс за 2 месяца в цифрах и графиках', author: 'Курсант Дмитрий В.', authorAvatar: '/teacher1-main.jpg', date: '1 марта, 2024', image: '/flag-bg.jpg', category: 'Поток', readTime: 5, stats: { views: 112, hearts: 167, jumbo: 144 } },
  { id: 1016, title: 'Разбор ошибок на учениях: почему важно уметь проигрывать с достоинством', author: 'Курсант Сергей Н.', authorAvatar: '/teacher2-main.jpg', date: '29 февраля, 2024', image: '/journal-main.jpg', category: 'Поток', readTime: 6, stats: { views: 94, hearts: 131, jumbo: 119 } },
  { id: 1017, title: 'Снаряжение для первого курса: что купил, что пригодилось, от чего отказался', author: 'Курсант Игорь Т.', authorAvatar: '/teacher3-main.jpg', date: '28 февраля, 2024', image: '/banner.jpg', category: 'Поток', readTime: 5, stats: { views: 134, hearts: 178, jumbo: 156 } },
  { id: 1018, title: 'День на полигоне глазами новобранца: страх, усталость и настоящая гордость', author: 'Курсант Роман Ф.', authorAvatar: '/teacher1-main.jpg', date: '27 февраля, 2024', image: '/military-course.jpg', category: 'Поток', readTime: 6, stats: { views: 103, hearts: 149, jumbo: 133 } },
  { id: 1019, title: 'Правильное питание бойца: что есть до и после интенсивных физических нагрузок', author: 'Инструктор Воронов А.', authorAvatar: '/teacher3-main.jpg', date: '3 марта, 2024', image: '/military-course.jpg', category: 'Блог', readTime: 6, stats: { views: 234, hearts: 312, jumbo: 287 } },
  { id: 1020, title: 'Тактика малых групп: пять принципов, которые работают в любой ситуации', author: 'Инструктор Медведев С.', authorAvatar: '/teacher1-main.jpg', date: '2 марта, 2024', image: '/banner.jpg', category: 'Блог', readTime: 9, stats: { views: 189, hearts: 267, jumbo: 243 } },
  { id: 1021, title: 'Психологическая устойчивость: как сохранять хладнокровие в условиях стресса', author: 'Командир Зайцев П.', authorAvatar: '/teacher2-main.jpg', date: '1 марта, 2024', image: '/flag-bg.jpg', category: 'Блог', readTime: 7, stats: { views: 321, hearts: 398, jumbo: 356 } },
  { id: 1022, title: 'Основы ориентирования на местности без GPS: старые методы в новых реалиях', author: 'Инструктор Воронов А.', authorAvatar: '/teacher3-main.jpg', date: '29 февраля, 2024', image: '/journal-main.jpg', category: 'Блог', readTime: 5, stats: { views: 276, hearts: 334, jumbo: 301 } },
  { id: 1023, title: 'Первая помощь в полевых условиях: что нужно знать каждому курсанту', author: 'Командир Зайцев П.', authorAvatar: '/teacher2-main.jpg', date: '28 февраля, 2024', image: '/military-course.jpg', category: 'Блог', readTime: 8, stats: { views: 198, hearts: 245, jumbo: 219 } },
  { id: 1024, title: 'Выносливость против силы: что важнее для современного бойца в поле', author: 'Инструктор Медведев С.', authorAvatar: '/teacher1-main.jpg', date: '27 февраля, 2024', image: '/banner.jpg', category: 'Блог', readTime: 7, stats: { views: 167, hearts: 213, jumbo: 191 } },
];

export function getHomeArticleExcerpt(article: HomeJournalArticle) {
  if (article.excerpt) return article.excerpt;
  const introductions: Record<HomeJournalCategory, string> = {
    Статьи: 'Подробный разбор темы с фактами, экспертными комментариями и практическими рекомендациями от участников сообщества «Воевода». Материал подготовлен на основе реальных событий и проверенных источников.',
    Новости: 'Все ключевые подробности события, комментарии участников и анализ последствий. Читайте, чтобы быть в курсе самых важных новостей из мира военной подготовки и службы.',
    Поток: 'Личный дневник прохождения курса: честная рефлексия, конкретные выводы после каждого занятия и практические советы тем, кто только начинает свой путь в «Воеводе».',
    Блог: 'Практический материал от опытных инструкторов и курсантов сообщества «Воевода» — с конкретными рекомендациями, которые можно применять уже на следующей тренировке.',
  };
  return introductions[article.category];
}

export function formatHomeArticleViews(views: number) {
  return views >= 1000 ? `${(views / 1000).toFixed(1).replace('.', ',')} тыс` : String(views);
}
