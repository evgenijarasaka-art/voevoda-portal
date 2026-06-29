import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useReviewsStore } from '../store/useReviewsStore';
import { HOME_JOURNAL_ARTICLES, formatHomeArticleViews, getHomeArticleExcerpt } from '../data/homeJournalArticles';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useSubscriptionsStore } from '../store/useSubscriptionsStore';
import { useAuthStore } from '../store/authStore';

export const JOURNAL_SCROLL_KEY = 'voevoda_journal_scroll';

interface Article {
  id: number;
  category: 'Статьи' | 'Новости' | 'Поток' | 'Блог' | 'Видео';
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  authorFollowers: string;
  date: string;
  readTime: string;
  views: string;
  likes: number;
  comments: number;
  image: string;
  tags: string[];
  featured?: boolean;
}

const HOME_ARTICLES: Article[] = HOME_JOURNAL_ARTICLES.map((article) => ({
  id: article.id,
  category: article.category,
  title: article.title,
  excerpt: getHomeArticleExcerpt(article),
  author: article.author,
  authorAvatar: article.authorAvatar,
  authorFollowers: 'Сообщество Воеводы',
  date: article.date,
  readTime: `${article.readTime} мин`,
  views: formatHomeArticleViews(article.stats.views),
  likes: article.stats.hearts,
  comments: article.stats.jumbo,
  image: article.image,
  tags: [article.category, 'Воевода'],
}));

const REACTIONS = ['👍', '❤️', '🔥', '😮', '😂'] as const;
type Reaction = typeof REACTIONS[number];

interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  date: string;
  likes: number;
  liked: boolean;
  reactions: Record<Reaction, number>;
  myReaction: Reaction | null;
}

const mkComment = (
  id: number,
  author: string,
  avatar: string,
  text: string,
  date: string,
  likes: number,
  reactions: Partial<Record<Reaction, number>> = {}
): Comment => ({
  id,
  author,
  avatar,
  text,
  date,
  likes,
  liked: false,
  reactions: { '👍': 0, '❤️': 0, '🔥': 0, '😮': 0, '😂': 0, ...reactions },
  myReaction: null,
});

const ORIGINAL_ARTICLES: Article[] = [
  { id: 1, category: 'Статьи', title: 'Как правильно подготовиться к курсу молодого бойца: полное руководство', excerpt: 'Курс молодого бойца — это первый и важнейший этап военной подготовки. Мы расскажем, как физически и психологически подготовиться к интенсивным нагрузкам, что взять с собой и каких ошибок избежать.', author: 'Торнадо', authorAvatar: '/teacher1-main.jpg', authorFollowers: '14,2 тыс.', date: '23 марта', readTime: '8 мин', views: '121,4 тыс', likes: 2600, comments: 432, image: '/kyrs1.png', tags: ['КМБ', 'Подготовка', 'Советы'], featured: true },
  { id: 2, category: 'Новости', title: 'Открыт набор на Курс молодого бойца V5 в Москве — старт 10 мая', excerpt: 'УТЦ «Воевода» объявляет об открытии нового потока КМБ. Места ограничены — успей записаться до 30 апреля.', author: 'Редакция Воевода', authorAvatar: '/logo.png', authorFollowers: '8,7 тыс.', date: '21 марта', readTime: '2 мин', views: '45,2 тыс', likes: 890, comments: 67, image: '/voen1.png', tags: ['КМБ', 'Набор', 'Москва'] },
  { id: 3, category: 'Блог', title: 'Мой путь в ВДВ: от гражданки до десантника за 3 месяца', excerpt: 'Личный опыт прохождения КМБ и подготовки к службе в Воздушно-десантных войсках. Что меня удивило, что было тяжелее всего и как я справился.', author: 'Бек', authorAvatar: '/teacher2-main.jpg', authorFollowers: '3,1 тыс.', date: '20 марта', readTime: '12 мин', views: '88,6 тыс', likes: 3400, comments: 215, image: '/kyrs2.png', tags: ['ВДВ', 'Личный опыт', 'КМБ'] },
  { id: 4, category: 'Статьи', title: 'Тактическая медицина: 10 навыков, которые могут спасти жизнь', excerpt: 'Оказание первой помощи в боевых условиях кардинально отличается от гражданской медицины. Разбираем ключевые техники ТССС-протокола.', author: 'Коба', authorAvatar: '/teacher3-main.jpg', authorFollowers: '6,4 тыс.', date: '19 марта', readTime: '10 мин', views: '204,1 тыс', likes: 5200, comments: 381, image: '/voen2.png', tags: ['Медицина', 'ТССС', 'Навыки'] },
  { id: 5, category: 'Видео', title: 'Разбор техники стрельбы из АК-74 — урок от инструктора', excerpt: 'Инструктор Торнадо разбирает типичные ошибки при стрельбе, правильную постановку хвата и работу с прицелом.', author: 'Торнадо', authorAvatar: '/teacher1-main.jpg', authorFollowers: '14,2 тыс.', date: '18 марта', readTime: '15 мин', views: '312,8 тыс', likes: 7100, comments: 628, image: '/voen3.png', tags: ['Оружие', 'Обучение', 'АК-74'] },
  { id: 6, category: 'Новости', title: 'Результаты соревнований «Тактическое ориентирование» — Москва 2024', excerpt: 'Подводим итоги межрегионального соревнования по тактическому ориентированию.', author: 'Редакция Воевода', authorAvatar: '/logo.png', authorFollowers: '8,7 тыс.', date: '17 марта', readTime: '4 мин', views: '31,5 тыс', likes: 420, comments: 89, image: '/voen4.png', tags: ['Соревнования', 'Ориентирование', 'Результаты'] },
  { id: 7, category: 'Блог', title: 'Почему я выбрал путь инструктора: история Кобы', excerpt: 'От курсанта до главного инструктора — 8 лет пути. Рассказываю, что меня привело в педагогику.', author: 'Коба', authorAvatar: '/teacher3-main.jpg', authorFollowers: '6,4 тыс.', date: '15 марта', readTime: '9 мин', views: '67,3 тыс', likes: 1800, comments: 156, image: '/voen5.png', tags: ['Инструктор', 'История', 'Мотивация'] },
  { id: 8, category: 'Статьи', title: 'Физическая подготовка бойца: программа на 3 месяца до КМБ', excerpt: 'Детальная программа тренировок, которая подготовит вас к физическим нагрузкам курса. Бег, силовые, выносливость — всё по неделям.', author: 'Стрелок', authorAvatar: '/teacher2-main.jpg', authorFollowers: '5,9 тыс.', date: '14 марта', readTime: '14 мин', views: '156,7 тыс', likes: 4300, comments: 298, image: '/voen6.png', tags: ['Физподготовка', 'Программа', 'КМБ'] },
];

const ARTICLES: Article[] = [...HOME_ARTICLES, ...ORIGINAL_ARTICLES];

const INITIAL_COMMENTS: Record<number, Comment[]> = {
  // ── home journal articles (1001-1024) ─────────────────────────────────────
  1001: [
    mkComment(1, 'Дозор', '/teacher1-main.jpg', 'Отличный материал! Именно такие операции показывают профессионализм наших ребят.', '3 марта', 38, { '👍': 11, '❤️': 6 }),
    mkComment(2, 'ВДВ-Фан', '/logo.png', 'Спасибо за информацию, давно ждал такого репортажа.', '3 марта', 19, { '👍': 4 }),
    mkComment(3, 'Курсант-11', '/teacher2-main.jpg', 'Гидрохлорид натрия — серьёзная химия, интересно как обеспечивается безопасность личного состава.', '4 марта', 25, { '😮': 3 }),
  ],
  1002: [
    mkComment(1, 'Морпех', '/teacher3-main.jpg', 'Морская пехота — элита! Пётр Великий был мудрым стратегом.', '3 марта', 44, { '❤️': 14, '🔥': 7 }),
    mkComment(2, 'Историк', '/logo.png', 'Прекрасная статья о корнях морской пехоты России. Очень познавательно.', '3 марта', 27, { '👍': 8 }),
  ],
  1003: [
    mkComment(1, 'Рядовой', '/teacher1-main.jpg', 'Наши ребята везде успевают! Честь и слава псковским десантникам.', '3 марта', 51, { '❤️': 18, '🔥': 9 }),
    mkComment(2, 'Земляк', '/logo.png', 'Псков гордится своей дивизией. Всегда на передовой.', '4 марта', 33, { '👍': 10, '❤️': 5 }),
    mkComment(3, 'МедикВДВ', '/teacher3-main.jpg', 'Дезинфекция населённых пунктов — важнейшая гуманитарная миссия. Молодцы!', '4 марта', 22, { '👍': 7 }),
  ],
  1004: [
    mkComment(1, 'Арктик', '/teacher2-main.jpg', 'Арктические учения — это совсем другой уровень выносливости. Респект!', '2 марта', 67, { '🔥': 22, '👍': 15 }),
    mkComment(2, 'Тундра', '/logo.png', 'При -40 ещё и тактику отрабатывать... это настоящие воины.', '3 марта', 41, { '🔥': 11 }),
  ],
  1005: [
    mkComment(1, 'Понтонёр', '/teacher1-main.jpg', 'Форсирование водных преград ночью — высший пилотаж! Видел на учениях — впечатляет.', '1 марта', 36, { '👍': 9, '🔥': 6 }),
    mkComment(2, 'Сапёр-3', '/logo.png', 'Ночные переправы требуют ювелирной координации. Наши умеют.', '2 марта', 28, { '👍': 7 }),
  ],
  1006: [
    mkComment(1, 'ДронКиллер', '/teacher3-main.jpg', 'Антидроновые учения — требование времени. Отлично что готовятся серьёзно.', '28 февраля', 82, { '🔥': 28, '👍': 16 }),
    mkComment(2, 'Горный', '/teacher2-main.jpg', 'Дагестанский полигон сложный, там и без дронов непросто. Молодцы спецназ!', '29 февраля', 54, { '👍': 13 }),
    mkComment(3, 'Техник-Р', '/logo.png', 'Какие системы РЭБ используют? Есть что-то в открытом доступе?', '1 марта', 31, { '😮': 5 }),
  ],
  1007: [
    mkComment(1, 'Ратник-фан', '/teacher1-main.jpg', '«Ратник-3» — это революция в экипировке. Ждём когда поступит в войска.', '3 марта', 93, { '🔥': 35, '👍': 20 }),
    mkComment(2, 'Снабженец', '/logo.png', 'Интересно насколько вырастет стоимость по сравнению с «Ратник-2».', '3 марта', 47, { '😮': 8 }),
    mkComment(3, 'Боец22', '/teacher3-main.jpg', 'Хочу попасть в первый поток оснащения. Как вообще это происходит?', '4 марта', 35, { '👍': 6 }),
  ],
  1008: [
    mkComment(1, 'Союзник', '/teacher2-main.jpg', 'Совместные учения с Беларусью — это важно. Союзное государство должно быть единым.', '2 марта', 58, { '❤️': 17, '👍': 12 }),
    mkComment(2, 'Наблюдатель', '/logo.png', 'Масштаб учений будет значительным. Тактика и логистика на высоте.', '3 марта', 39, { '👍': 8 }),
  ],
  1009: [
    mkComment(1, 'Гражданин', '/teacher1-main.jpg', 'Добровольная подготовка — это правильное решение. Каждый должен уметь защищать Родину.', '1 марта', 71, { '❤️': 23, '👍': 15 }),
    mkComment(2, 'Юрист-А', '/logo.png', 'Важно чтобы «добровольность» была реальной, без административного давления.', '2 марта', 44, { '👍': 10 }),
    mkComment(3, 'Патриот', '/teacher3-main.jpg', 'Отличная инициатива! Записался бы сам если бы был помоложе.', '2 марта', 29, { '❤️': 7 }),
  ],
  1010: [
    mkComment(1, 'Авиатор', '/teacher2-main.jpg', 'Су-35С — красавец! Одна из лучших машин в мире по соотношению манёвренность/огневая мощь.', '28 февраля', 118, { '🔥': 45, '❤️': 22 }),
    mkComment(2, 'Техник-А', '/logo.png', 'Интересно какие доработки внесены в новую партию. Авионика, двигатели?', '29 февраля', 64, { '😮': 9 }),
    mkComment(3, 'Лётчик', '/teacher1-main.jpg', 'Летал на Су-27 — когда пересаживаешься на 35-й, разница ощущается сразу. Феноменальная машина.', '1 марта', 87, { '🔥': 28, '👍': 16 }),
  ],
  1011: [
    mkComment(1, 'Доброволец', '/teacher3-main.jpg', '12 новых полигонов — серьёзные инвестиции. Где они будут расположены?', '27 февраля', 49, { '👍': 11 }),
    mkComment(2, 'Инструктор-В', '/logo.png', 'Главное чтобы оснастили нормально, а не просто поле с флажками. Нужна реальная инфраструктура.', '28 февраля', 62, { '👍': 14, '😮': 4 }),
  ],
  1012: [
    mkComment(1, 'Контрактник', '/teacher2-main.jpg', 'Давно пора было стандарты обновить. Старые нормы уже не отражают реальных потребностей.', '26 февраля', 44, { '👍': 12 }),
    mkComment(2, 'Тренер-С', '/logo.png', 'Надеюсь учли опыт реальных боёв при составлении новых нормативов.', '27 февраля', 37, { '👍': 9, '🔥': 5 }),
  ],
  1013: [
    mkComment(1, 'Ветеран КМБ', '/teacher1-main.jpg', 'Первый марш незабываем. У меня тоже ноги отказали на 12-м километре, но дошёл!', '3 марта', 56, { '❤️': 19, '🔥': 8 }),
    mkComment(2, 'Курсант Алексей К.', '/teacher2-main.jpg', 'Спасибо за поддержку! Второй марш уже не казался таким страшным.', '4 марта', 38, { '❤️': 12 }),
    mkComment(3, 'Будущий', '/logo.png', 'Записываюсь на следующий поток. Статья добавила решимости!', '4 марта', 27, { '🔥': 7 }),
  ],
  1014: [
    mkComment(1, 'ВДВшник', '/teacher3-main.jpg', 'КМБ действительно меняет мышление. Сам прошёл — до и после небо и земля.', '2 марта', 63, { '❤️': 21, '🔥': 10 }),
    mkComment(2, 'Курсант Михаил Д.', '/teacher2-main.jpg', 'Самое сложное — первые 3 дня. Потом организм адаптируется и становится легче.', '3 марта', 48, { '👍': 14 }),
  ],
  1015: [
    mkComment(1, 'Бегун', '/teacher1-main.jpg', 'Тест Купера — классика. Молодец что отслеживаешь прогресс в цифрах!', '1 марта', 42, { '👍': 10, '🔥': 6 }),
    mkComment(2, 'Тренер-МП', '/logo.png', 'За 2 месяца такой прогресс — отличный результат. Режим питания соблюдаешь?', '2 марта', 31, { '👍': 7 }),
    mkComment(3, 'Курсант Дмитрий В.', '/teacher1-main.jpg', 'Да, питание перестроил полностью. Белок, сложные углеводы, минимум сахара.', '2 марта', 45, { '👍': 11, '❤️': 4 }),
  ],
  1016: [
    mkComment(1, 'Стратег', '/teacher3-main.jpg', 'Умение разбирать ошибки — ключевой навык офицера. Важная статья.', '29 февраля', 54, { '👍': 13, '❤️': 6 }),
    mkComment(2, 'Курсант Сергей Н.', '/teacher2-main.jpg', 'Проигрывать с достоинством — это значит сохранять боевой дух и делать выводы.', '1 марта', 67, { '❤️': 18, '🔥': 9 }),
  ],
  1017: [
    mkComment(1, 'Снаряга', '/logo.png', 'Отличный обзор! Тоже думаю над берцами — какие в итоге выбрал?', '28 февраля', 38, { '👍': 8 }),
    mkComment(2, 'Курсант Игорь Т.', '/teacher3-main.jpg', 'Взял Garsing 715 — разнашивал 3 недели, зашли отлично. Главное не жадничать на ногах.', '29 февраля', 51, { '👍': 13, '🔥': 5 }),
    mkComment(3, 'Экипировщик', '/teacher1-main.jpg', 'Согласен по рюкзаку — не надо брать огромный. 30-35 литров оптимально для курса.', '1 марта', 29, { '👍': 7 }),
  ],
  1018: [
    mkComment(1, 'Ветеран', '/teacher2-main.jpg', 'Страх и усталость — это нормально. Именно так рождается настоящий боец.', '27 февраля', 74, { '❤️': 25, '🔥': 12 }),
    mkComment(2, 'Курсант Роман Ф.', '/teacher1-main.jpg', 'Спасибо за честность! Многие скрывают страх, а это не правильно.', '28 февраля', 58, { '❤️': 16, '👍': 8 }),
  ],
  1019: [
    mkComment(1, 'Нутрициолог', '/logo.png', 'Правильно про углеводное окно после тренировки! Многие этим пренебрегают.', '3 марта', 67, { '👍': 19, '🔥': 7 }),
    mkComment(2, 'Боец-А', '/teacher3-main.jpg', 'А что по суточной калорийности во время курса? Сколько нужно потреблять?', '3 марта', 41, { '😮': 4 }),
    mkComment(3, 'Инструктор Воронов А.', '/teacher3-main.jpg', 'При интенсивных нагрузках минимум 3200-3500 ккал. Белок — 2г на кг веса.', '4 марта', 88, { '👍': 23, '🔥': 11 }),
  ],
  1020: [
    mkComment(1, 'Тактик', '/teacher2-main.jpg', 'Пять принципов звучат просто, но на практике отрабатываются месяцами.', '2 марта', 55, { '👍': 14 }),
    mkComment(2, 'Групповик', '/logo.png', 'Коммуникация внутри группы — самое сложное. Один ошибся — все страдают.', '3 марта', 72, { '🔥': 21, '👍': 13 }),
  ],
  1021: [
    mkComment(1, 'Психолог-А', '/teacher1-main.jpg', 'Хладнокровие — это тренируемый навык. Статья очень грамотная с точки зрения психологии.', '1 марта', 84, { '👍': 22, '❤️': 14 }),
    mkComment(2, 'Командир Зайцев П.', '/teacher2-main.jpg', 'Добавлю: дыхательные техники — самый быстрый способ снизить кортизол в момент стресса.', '2 марта', 97, { '🔥': 32, '👍': 18 }),
    mkComment(3, 'Рекрут', '/logo.png', 'У меня паника на учениях — теперь знаю что делать. Спасибо!', '2 марта', 46, { '❤️': 11 }),
  ],
  1022: [
    mkComment(1, 'Следопыт', '/teacher3-main.jpg', 'Азимут и звёзды — это то чему учили ещё советские разведчики. Не устареет никогда.', '29 февраля', 61, { '👍': 15, '🔥': 8 }),
    mkComment(2, 'GPS-Off', '/logo.png', 'Сколько курсантов реально умеют ориентироваться без навигатора? Думаю меньшинство.', '1 марта', 47, { '😮': 6 }),
  ],
  1023: [
    mkComment(1, 'Медик', '/teacher2-main.jpg', 'ТССС протокол — жгут, крикотиреотомия, декомпрессия. Это должен знать каждый.', '28 февраля', 78, { '👍': 22, '🔥': 13 }),
    mkComment(2, 'Курсант-М', '/logo.png', 'Есть ли в Воеводе полноценный курс по тактмеду? Хочу записаться.', '29 февраля', 35, { '👍': 7 }),
    mkComment(3, 'Командир Зайцев П.', '/teacher2-main.jpg', 'Да, тактмед входит в КМБ базово. Расширенный курс — отдельная программа.', '1 марта', 63, { '👍': 16, '❤️': 8 }),
  ],
  1024: [
    mkComment(1, 'Атлет', '/teacher1-main.jpg', 'В поле побеждает выносливость. Сила нужна, но без «дыхалки» далеко не уйдёшь.', '27 февраля', 58, { '🔥': 18, '👍': 12 }),
    mkComment(2, 'Инструктор Медведев С.', '/teacher1-main.jpg', 'Оптимально: 60% выносливость, 40% сила. Функциональный тренинг лучше изолированного.', '28 февраля', 74, { '👍': 19, '🔥': 10 }),
  ],
  // ── original articles (1-8) ───────────────────────────────────────────────
  1: [
    mkComment(1, 'Sergeant', '/teacher2-main.jpg', 'Отличная статья! Особенно полезен раздел про психологическую подготовку. Сам проходил КМБ в 2022 — всё точно описано.', '23 марта', 48, { '👍': 12, '❤️': 8 }),
    mkComment(2, 'Бек', '/teacher3-main.jpg', 'Добавлю от себя: очень важна правильная обувь. Берцы нужно разносить заранее.', '23 марта', 31, { '👍': 9 }),
    mkComment(3, 'Нексус', '/logo.png', 'Когда записываться на следующий поток? Хочу пройти именно у Торнадо.', '24 марта', 12, { '🔥': 3 }),
  ],
  2: [
    mkComment(1, 'Волк-47', '/logo.png', 'Уже записался, жду старта!', '21 марта', 22, { '❤️': 5 }),
    mkComment(2, 'Торнадо', '/teacher1-main.jpg', 'Ждём всех! Программа обновлена, добавили новые блоки по тактической медицине.', '22 марта', 67, { '👍': 22, '🔥': 15 }),
  ],
  3: [
    mkComment(1, 'Орёл', '/teacher1-main.jpg', 'Читал на одном дыхании. Узнал себя в каждом абзаце — тот же путь, те же сомнения.', '20 марта', 54, { '❤️': 20, '🔥': 7 }),
    mkComment(2, 'Скаут', '/logo.png', 'Сколько в итоге времени ушло на всю подготовку? Хочу повторить твой опыт.', '21 марта', 18, { '👍': 4 }),
    mkComment(3, 'Бек', '/teacher2-main.jpg', 'Около 3 месяцев интенсива. Главное — не пропускать тренировки, даже когда кажется что сил нет.', '21 марта', 41, { '👍': 11, '🔥': 6 }),
  ],
  4: [
    mkComment(1, 'Медик-Альфа', '/logo.png', 'ТССС-протокол — это база, без которой в реальных условиях не выжить. Спасибо за разбор.', '19 марта', 73, { '👍': 18, '❤️': 9 }),
    mkComment(2, 'Коба', '/teacher3-main.jpg', 'Практику по жгутам лучше отрабатывать вслепую — в бою темно бывает. Добавим в курс.', '19 марта', 88, { '🔥': 25, '👍': 14 }),
    mkComment(3, 'Ромео', '/teacher2-main.jpg', 'Когда будет отдельный курс по тактмеду? Очень нужно.', '20 марта', 34, { '👍': 7 }),
  ],
  5: [
    mkComment(1, 'Снайпер-22', '/logo.png', 'Наконец-то внятный разбор хвата. Гонял по этому видео всю неделю — ошибки исправились.', '18 марта', 91, { '👍': 30, '🔥': 18 }),
    mkComment(2, 'Торнадо', '/teacher1-main.jpg', 'Отдельно выйдет разбор по позициям стрельбы. Следите за обновлениями.', '18 марта', 112, { '🔥': 42, '❤️': 17 }),
    mkComment(3, 'Марк', '/logo.png', 'Можно ли применять эти советы для АК-12?', '19 марта', 22, { '😮': 2 }),
    mkComment(4, 'Инструктор К', '/teacher3-main.jpg', 'В целом да — основы хвата универсальны, но есть нюансы под складной приклад.', '19 марта', 38, { '👍': 10 }),
  ],
  6: [
    mkComment(1, 'Сова', '/logo.png', 'Был на соревнованиях, атмосфера невероятная! Ждём следующего этапа.', '17 марта', 29, { '❤️': 8, '🔥': 4 }),
    mkComment(2, 'Спектр', '/teacher2-main.jpg', 'Отличная организация, маршрут сложный, но честный. Молодцы!', '17 марта', 47, { '👍': 15 }),
  ],
  7: [
    mkComment(1, 'Рысь', '/logo.png', 'История вдохновляет. Сам думаю о смене профессии — теперь точно решусь.', '15 марта', 65, { '❤️': 22, '🔥': 11 }),
    mkComment(2, 'Коба', '/teacher3-main.jpg', 'Главное — найти своих людей. Команда Воеводы дала мне именно это.', '16 марта', 78, { '❤️': 30, '🔥': 8 }),
    mkComment(3, 'Зенит', '/teacher1-main.jpg', 'Коба, вы лучший наставник. Ваш курс изменил мою жизнь.', '16 марта', 43, { '❤️': 14 }),
  ],
  8: [
    mkComment(1, 'Гром', '/logo.png', 'Программа огонь! Уже на 3-й неделе и разница чувствуется. Спасибо, Стрелок!', '14 марта', 56, { '🔥': 20, '👍': 8 }),
    mkComment(2, 'Стрелок', '/teacher2-main.jpg', 'Главное — не форсировать нагрузку. Тело адаптируется постепенно.', '14 марта', 71, { '👍': 19, '❤️': 7 }),
    mkComment(3, 'Ягуар', '/logo.png', 'Что посоветуете вместо бега, если проблемы с коленями?', '15 марта', 24, { '😮': 3 }),
    mkComment(4, 'Стрелок', '/teacher2-main.jpg', 'Велосипед, плавание или эллипс — кардио без ударной нагрузки. Силовые оставляй.', '15 марта', 38, { '👍': 12 }),
  ],
};

function IcHeart({ active = false }: { active?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? '#EF4444' : '#D1D5DB'} stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IcThumb({ color = '#D1D5DB', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.2875 5.14073L10.0608 6.37034C9.92347 6.50803 9.92303 6.7317 10.0598 6.86993C10.2925 7.10497 10.5166 7.05021 10.654 6.91253C10.5661 7.11692 10.3904 7.6271 10.3904 8.03268C10.3904 8.51692 10.5842 8.9555 10.8981 9.27436C10.3199 9.563 9.92236 10.1628 9.92236 10.8563C9.92236 11.3405 10.1162 11.7791 10.4301 12.0979C9.85188 12.3866 9.45433 12.9864 9.45433 13.6799C9.45433 14.655 10.2404 15.445 11.2094 15.445H13.0462L14.2389 15.6895C14.0446 15.6628 13.8534 15.682 13.6769 15.7391C13.8742 15.679 14.0892 15.6664 14.3057 15.7119L15.9356 16.0551C16.5886 16.1925 17.015 16.823 16.8994 17.4803C16.7812 18.1526 16.1408 18.6022 15.4683 18.485L13.8274 18.1991C13.7873 18.1921 13.7479 18.1833 13.7093 18.1728L10.1762 17.5672C9.98064 17.5307 9.62398 17.4894 9.28237 17.4498C9.0461 17.4225 8.81699 17.3959 8.65324 17.3724C8.2522 17.3147 7.82914 17.2478 7.45795 17.1764C7.07956 17.1037 6.60792 16.9651 6.60792 16.9651C6.60792 16.9651 5.77081 16.7047 5.39742 16.5476C5.14793 16.4392 4.52031 16.168 4.26625 16.0709C4.10537 16.0094 3.88391 15.9174 3.65706 15.8207C3.1816 15.618 2.94387 15.5167 2.8058 15.3077C2.66772 15.0988 2.66772 14.8353 2.66772 14.3083L2.66772 8.84776C2.66772 8.2805 2.66772 7.99687 2.8206 7.78063C2.97347 7.56439 3.23943 7.4703 3.77132 7.28214L3.77133 7.28213C3.95772 7.21619 4.13383 7.15435 4.26754 7.10832C4.77788 6.9326 5.26832 6.68651 5.67162 6.36904L9.68343 3.21107C9.71961 3.17049 9.75882 3.13176 9.80104 3.0952L11.4081 1.70339C11.9124 1.26658 12.6725 1.30921 13.1249 1.79968C13.5873 2.30109 13.5558 3.08241 13.0545 3.54499L11.4921 4.98674C11.428 5.04593 11.3594 5.09724 11.2875 5.14073ZM14.1346 13.6799C14.1346 13.0955 13.6634 12.6213 13.0816 12.6213H11.2094C10.6276 12.6213 10.1564 13.0955 10.1564 13.6799C10.1564 14.2642 10.6276 14.7385 11.2094 14.7385H13.0816C13.6634 14.7385 14.1346 14.2642 14.1346 13.6799ZM10.6244 10.8563C10.6244 11.4406 11.0956 11.9148 11.6774 11.9148H13.5496C14.1315 11.9148 14.6027 11.4405 14.6027 10.8562C14.6027 10.2752 14.1369 9.80312 13.5598 9.79764L11.6775 9.79774C11.0956 9.79768 10.6244 10.2719 10.6244 10.8563ZM12.1455 9.09127C11.5638 9.09114 11.0924 8.61696 11.0924 8.03268C11.0924 7.44832 11.5636 6.97409 12.1455 6.97409L14.017 6.9739C14.5989 6.97392 15.0701 7.44814 15.0701 8.03248C15.0701 8.61664 14.5992 9.09075 14.0176 9.09107L13.5436 9.09112L12.1455 9.09127Z" fill={color} />
    </svg>
  );
}

function CommentItem({ comment, onLike, onReact }: { comment: Comment; onLike: () => void; onReact: (r: Reaction) => void }) {
  const [juked, setJuked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  void onReact; // reactions replaced by article-style bar

  return (
    <div className="ap-comment-item" style={{ display: 'flex', gap: 12, padding: '16px 0', borderBottom: '1px solid #F0F4FA' }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, overflow: 'hidden', background: '#E5E7EB', flexShrink: 0 }}>
        <img src={comment.avatar} alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#9CA3AF'; }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{comment.author}</span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{comment.date}</span>
        </div>
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.55, margin: '0 0 10px' }}>{comment.text}</p>

        {/* Same action bar as article, ~70% scale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onLike} className="ap-action-btn"
            style={{ minHeight: 34, display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 10, border: `1.5px solid ${comment.liked ? '#EF4444' : '#E5EAF2'}`, background: comment.liked ? '#FFF1F1' : '#fff', color: comment.liked ? '#EF4444' : '#374151', fontSize: 12, fontWeight: comment.liked ? 800 : 700, cursor: 'pointer' }}>
            <IcHeart active={comment.liked} />
            {comment.likes + (comment.liked ? 1 : 0)}
          </button>

          <button onClick={() => setJuked(j => !j)} className="ap-action-btn"
            style={{ minHeight: 34, display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 10, border: `1.5px solid ${juked ? '#10B981' : '#E5EAF2'}`, background: juked ? '#F0FDF4' : '#fff', color: juked ? '#10B981' : '#374151', fontSize: 12, fontWeight: juked ? 800 : 700, cursor: 'pointer' }}>
            <IcThumb color={juked ? '#10B981' : '#D1D5DB'} size={14} />
            Полезно
          </button>

          <button onClick={() => { setSaved(s => !s); }} className="ap-action-btn"
            style={{ minHeight: 34, display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 10, border: `1.5px solid ${saved ? '#375DFB' : '#E5EAF2'}`, background: saved ? '#EBF1FF' : '#fff', color: saved ? '#375DFB' : '#374151', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={saved ? '#375DFB' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            {saved ? 'Сохранено' : 'Сохранить'}
          </button>

          <button onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); setShared(true); setTimeout(() => setShared(false), 2000); }} className="ap-action-btn"
            style={{ marginLeft: 'auto', minHeight: 34, display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', borderRadius: 10, border: `1.5px solid ${shared ? '#10B981' : '#E5EAF2'}`, background: shared ? '#F0FDF4' : '#fff', color: shared ? '#10B981' : '#374151', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {shared ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>Скопировано!</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>Поделиться</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const STYLES = `
  @keyframes ap-page-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ap-hero-in { from { opacity: 0; transform: translateY(20px) scale(.985); filter: blur(8px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
  @keyframes ap-card-in { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ap-shine { 0% { transform: translateX(-120%) skewX(-18deg); } 45%,100% { transform: translateX(260%) skewX(-18deg); } }
  @keyframes ap-soft-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(55,93,251,.18); } 50% { box-shadow: 0 0 0 8px rgba(55,93,251,0); } }
  .ap-page { position: relative; overflow: hidden; background: #f4f5f8; color: #162033; font-family: "Exo 2", system-ui, sans-serif; }
  .ap-shell { position: relative; z-index: 1; animation: ap-page-in .45s ease both; }
  .ap-hero { animation: ap-hero-in .5s cubic-bezier(.16,1,.3,1) both; box-shadow: 0 18px 46px rgba(21,36,74,.12); }
  .ap-content { animation: ap-card-in .42s .08s cubic-bezier(.16,1,.3,1) both; box-shadow: 0 16px 44px rgba(21,36,74,.08); }
  .ap-author-row { border: 1px solid #e6ebf4; border-radius: 18px; background: #fff; padding: 16px; box-shadow: inset 0 1px 0 rgba(255,255,255,.8); }
  .ap-title { letter-spacing: 0; text-wrap: balance; }
  .ap-article-text { max-width: 860px; }
  .ap-action-btn { transition: transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease, color .18s ease !important; }
  .ap-action-btn:hover { background: #F3F6FF !important; border-color: #c7d2fe !important; transform: translateY(-2px); box-shadow: 0 10px 24px rgba(55,93,251,.12); }
  .ap-comments > div:first-child h3 { font-size: 24px !important; font-weight: 900 !important; color: #111827 !important; }
  .ap-comments > div:first-child span { background: #F2F4F7 !important; color: #667085 !important; font-size: 14px !important; font-weight: 850 !important; padding: 4px 12px !important; border-radius: 999px !important; }
  .ap-comments > div:nth-of-type(2) { gap: 14px !important; margin-bottom: 28px !important; padding: 18px !important; border: 1px solid #E3EAF6; border-radius: 18px; background: #fff; box-shadow: 0 14px 32px rgba(21,36,74,.05); }
  .ap-comments textarea { padding: 14px 16px !important; border-color: #E5EAF2 !important; border-radius: 14px !important; background: #FBFCFF !important; font-size: 15px !important; line-height: 1.6 !important; transition: border-color .15s, box-shadow .15s !important; }
  .ap-comments textarea:focus { box-shadow: 0 0 0 4px rgba(55,93,251,.12); }
  .ap-comment-item { padding: 16px 0 !important; gap: 14px !important; border-bottom-color: #EDF1F7 !important; animation: ap-card-in .42s ease both; }
  .ap-comment-item > div:first-child { width: 38px !important; height: 38px !important; border-radius: 12px !important; }
  .ap-comment-item p { font-size: 14px !important; color: #3F4A5F !important; }
  .ap-back-btn { position: fixed; left: 72px; z-index: 1250; display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border: 1.5px solid #E1E6F0; border-radius: 12px; background: rgba(255,255,255,.92); backdrop-filter: blur(10px); color: #374151; font-size: 14px; font-weight: 750; cursor: pointer; box-shadow: 0 8px 24px rgba(21,36,74,.10); will-change: top; }
  .ap-back-btn:hover { background: #F8FAFC !important; color: #111827 !important; border-color: #CBD5E1 !important; transform: translateX(-3px) !important; box-shadow: 0 10px 24px rgba(21,36,74,.14) !important; }
  .ap-tag { transition: all .15s !important; cursor: pointer; }
  .ap-tag:hover { background: rgba(255,255,255,.26) !important; transform: translateY(-2px); }
  .ap-sub-btn { transition: all .15s !important; }
  .ap-sub-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 28px rgba(55,93,251,.18); }
  @media (max-width: 900px) {
    .ap-shell { padding-left: 18px !important; padding-right: 18px !important; }
    .ap-hero { height: 360px !important; border-radius: 22px !important; }
    .ap-content > div { padding-left: 24px !important; padding-right: 24px !important; }
    .ap-back-btn { top: 68px; left: 64px; }
  }
  @media (max-width: 640px) {
    .ap-shell { padding-top: 18px !important; }
    .ap-hero { height: 300px !important; }
    .ap-content { border-radius: 20px !important; }
    .ap-author-row { align-items: flex-start !important; }
    .ap-back-btn { top: 64px; left: 60px; padding: 0 12px; font-size: 13px; }
  }
`;

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const commentsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reviews = useReviewsStore(state => state.reviews);
  const reviewArticles: Article[] = reviews.map(review => ({
    id: 100000 + review.id,
    category: 'Блог' as Article['category'],
    title: review.title,
    excerpt: review.text,
    author: review.name,
    authorAvatar: review.image,
    authorFollowers: 'Участник Воеводы',
    date: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(review.createdAt)),
    readTime: `${Math.max(1, Math.ceil(review.text.length / 700))} мин`,
    views: '0',
    likes: 0,
    comments: 0,
    image: '/journal-main.jpg',
    tags: ['Отзыв', review.city, `${review.rating} из 5`],
  }));
  const availableArticles = [...reviewArticles, ...ARTICLES];

  const articleId = Number(id);
  const article = availableArticles.find((a: Article) => a.id === articleId) ?? null;

  const [liked, setLiked] = useState(false);
  const [juked, setJuked] = useState(false);
  const { toggle: toggleFavorite, has: hasFavorite } = useFavoritesStore();
  const saved = article ? hasFavorite(article.id, 'article') : false;
  const [shared, setShared] = useState(false);

  const { subscribe, unsubscribe, isSubscribed } = useSubscriptionsStore();
  const subscribed = article ? isSubscribed(article.author) : false;
  const currentUser = useAuthStore(s => s.user);
  const myAvatar = currentUser?.avatar || '/logo.png';
  const myName = currentUser ? (currentUser.firstName || currentUser.login || 'Вы') : 'Вы';

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(
    article ? (INITIAL_COMMENTS[article.id] ?? []) : []
  );
  const [commentCount, setCommentCount] = useState<number>(article?.comments ?? 0);

  const ROUTE_HEADER_H = 60; // GlobalRouteHeader height
  const MAIN_HEADER_H  = 60; // main fixed header height
  const BTN_TOP_LOW    = MAIN_HEADER_H + ROUTE_HEADER_H + 10; // 130px — both visible
  const BTN_TOP_HIGH   = MAIN_HEADER_H + 12;                  //  72px — route header scrolled away

  const [btnTop, setBtnTop] = useState(BTN_TOP_LOW);

  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(window.scrollY / ROUTE_HEADER_H, 1);
      setBtnTop(BTN_TOP_LOW - progress * (BTN_TOP_LOW - BTN_TOP_HIGH));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);

  if (!article) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="ap-page" style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>404</div>
            <div style={{ fontSize: 16, color: '#6B7280', marginBottom: 20 }}>Статья не найдена</div>
            <button onClick={() => navigate('/journal')}
              style={{ padding: '10px 24px', background: '#375DFB', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              ← В журнал
            </button>
          </div>
        </div>
      </>
    );
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleSubmitComment = () => {
    const text = newComment.trim();
    if (!text) return;
    const next: Comment = {
      id: Date.now(),
      author: myName,
      avatar: myAvatar,
      text,
      date: 'Только что',
      likes: 0,
      liked: false,
      reactions: { '👍': 0, '❤️': 0, '🔥': 0, '😮': 0, '😂': 0 },
      myReaction: null,
    };
    setComments((prev: Comment[]) => [...prev, next]);
    setCommentCount((prev: number) => prev + 1);
    setNewComment('');
  };

  const toggleCommentLike = (cid: number) => {
    setComments((prev: Comment[]) =>
      prev.map((x: Comment) => x.id === cid ? { ...x, liked: !x.liked } : x)
    );
  };

  const handleReact = (cid: number, reaction: Reaction) => {
    setComments((prev: Comment[]) =>
      prev.map((x: Comment) => {
        if (x.id !== cid) return x;
        const prevReaction = x.myReaction;
        const newReactions = { ...x.reactions };
        if (prevReaction) newReactions[prevReaction] = Math.max(0, newReactions[prevReaction] - 1);
        const isToggle = prevReaction === reaction;
        if (!isToggle) newReactions[reaction] = newReactions[reaction] + 1;
        return { ...x, reactions: newReactions, myReaction: isToggle ? null : reaction };
      })
    );
  };

  const goBack = () => {
    const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
    if (returnTo) navigate(-1);
    else navigate('/journal');
  };

  const handleFavorite = () => {
    if (!article) return;
    toggleFavorite({
      id: article.id,
      kind: 'article',
      title: article.title,
      author: article.author,
      date: article.date,
      image: article.image,
      category: article.category,
      stats: {
        views: Number.parseInt(article.views.replace(/\D/g, ''), 10) || 0,
        hearts: article.likes,
        likes: article.likes,
        comments: article.comments,
      },
      available: true,
    });
  };

  const handleSubscribe = () => {
    if (subscribed) unsubscribe(article.author);
    else subscribe(article.author);
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* Fixed back button — smart scroll */}
      <button onClick={goBack} className="ap-back-btn" style={{ top: btnTop, transition: 'top 0.18s cubic-bezier(0.4,0,0.2,1)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Назад
      </button>

      <div className="ap-page" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="ap-shell" style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 32px 96px' }}>

          {/* Category badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ background: '#fff', color: '#667085', fontSize: 12, fontWeight: 850, padding: '7px 14px', border: '1px solid #E1E6F0', borderRadius: 999, boxShadow: '0 8px 18px rgba(21,36,74,.05)' }}>
              {article.category}
            </span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{article.date} · {article.readTime} чтения · {article.views} просмотров</span>
          </div>

          {/* Hero */}
          <div className="ap-hero" style={{ height: 430, borderRadius: 24, overflow: 'hidden', position: 'relative', marginBottom: 24, border: '1px solid rgba(203,213,225,.85)', background: '#dbe3ef' }}>
            <img src={article.image} alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#E5E7EB'; }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(8,18,42,.14) 0%, rgba(8,18,42,0) 46%)' }} />
          </div>

          {/* Content */}
          <div className="ap-content" style={{ maxWidth: 1120, margin: '0 auto', background: '#fff', borderRadius: 24, border: '1px solid #E1E7F0', overflow: 'hidden', position: 'relative', zIndex: 4 }}>
            <div style={{ padding: '42px 52px 0' }}>

              {/* Author row */}
              <div className="ap-author-row" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
                <div
                  onClick={() => navigate(`/users/${encodeURIComponent(article.author)}`)}
                  style={{ width: 58, height: 58, borderRadius: 16, overflow: 'hidden', background: '#E5E7EB', flexShrink: 0, border: '2px solid #EBF1FF', boxShadow: '0 12px 24px rgba(55,93,251,.12)', cursor: 'pointer' }}
                >
                  <img src={article.authorAvatar} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.background = '#9CA3AF'; }} />
                </div>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/users/${encodeURIComponent(article.author)}`)}>
                  <div style={{ fontSize: 18, fontWeight: 850, color: '#111827' }}>{article.author}</div>
                  <div style={{ fontSize: 13, color: '#8792A6', marginTop: 3 }}>
                    {article.authorFollowers} подписчиков
                  </div>
                </div>
                <button onClick={handleSubscribe} className="ap-sub-btn"
                  style={{ minHeight: 48, padding: '0 28px', borderRadius: 13, border: `1.5px solid ${subscribed ? '#E5E7EB' : '#375DFB'}`, background: subscribed ? '#F3F4F6' : '#375DFB', color: subscribed ? '#6B7280' : '#fff', fontSize: 15, fontWeight: 850, cursor: 'pointer', boxShadow: subscribed ? 'none' : '0 14px 30px rgba(55,93,251,.22)' }}>
                  {subscribed ? '✓ Подписан' : 'Подписаться'}
                </button>
              </div>

              <h1 className="ap-title" style={{ display: 'block', maxWidth: 900, fontSize: 42, fontWeight: 900, color: '#111827', margin: '0 0 20px', lineHeight: 1.12 }}>
                {article.title}
              </h1>
              <p className="ap-article-text" style={{ fontSize: 20, color: '#1F2937', lineHeight: 1.74, margin: '0 0 24px', fontWeight: 600 }}>{article.excerpt}</p>
              {(() => {
                const bodies: Record<string, [string, string, string]> = {
                  'Статьи': [
                    'Военная подготовка требует комплексного подхода. Физическая форма, тактическое мышление, медицинские знания — всё это необходимо для успешного прохождения курса. Начинать готовиться следует минимум за три месяца до начала обучения.',
                    'Особое внимание стоит уделить ориентированию на местности и действиям в составе малой группы. Эти навыки формируют базу, без которой невозможно двигаться к более сложным дисциплинам — снайперскому делу, тактической медицине или разведывательной подготовке.',
                    'Рекомендуется развить базовые физические показатели: пробегать 3 км за 14 минут, подтягиваться 10 раз, отжиматься 30 раз. Психологическая устойчивость не менее важна — умение действовать в условиях стресса и неопределённости формируется только в реальных полевых условиях.',
                  ],
                  'Новости': [
                    'Событие получило широкий отклик в сообществе. Эксперты отмечают, что подобные инициативы существенно повышают уровень готовности гражданского резерва и создают прочную основу для взаимодействия между профессиональными военными и добровольцами.',
                    'По словам организаторов, ключевым приоритетом остаётся качество подготовки, а не её массовость. Каждый участник проходит индивидуальное тестирование и получает персональный план развития, составленный с учётом уровня физической подготовки и предыдущего опыта.',
                    'Ожидается, что в ближайшие месяцы программа охватит дополнительные регионы страны. Подробная информация о расписании и порядке записи будет опубликована на официальных ресурсах организации.',
                  ],
                  'Поток': [
                    'Первые занятия дались непросто — физические нагрузки оказались значительно выше того, к чему я привык на гражданке. Но уже через две недели тело начало адаптироваться, и то, что казалось невозможным, стало рабочим ритмом.',
                    'Сильнее всего меня впечатлил подход инструкторов к разбору ошибок. Никакого давления — только конструктивный анализ: что произошло, почему, как избежать в следующий раз. Такой формат позволяет учиться быстро и без страха совершить промах снова.',
                    'Если вы думаете о том, чтобы записаться, — не откладывайте. Сложно только первые несколько занятий. Потом начинаешь замечать, как меняется не только физическая форма, но и способность принимать решения под давлением. Это трудно описать словами — это нужно прожить.',
                  ],
                  'Блог': [
                    'За годы практики я убедился: самые распространённые ошибки совершаются не от незнания, а от спешки. Когда есть время на подготовку, большинство бойцов справляются с задачей. Настоящая проверка — действие в условиях дефицита времени и информации.',
                    'Хорошей точкой старта служит работа над базовыми рефлексами: занятие позиции, проверка снаряжения, оценка местности. Эти действия должны выполняться автоматически, чтобы голова оставалась свободной для тактических решений.',
                    'Помните: физическая подготовка — лишь один из компонентов боеспособности. Не менее важны навыки командной работы, понимание тактики малых групп и способность сохранять спокойствие, когда план перестаёт работать. Именно на это направлены программы Воеводы.',
                  ],
                };
                const key = article.category as string;
                const paras = bodies[key] ?? bodies['Статьи'];
                return paras.map((text, i) => (
                  <p key={i} className="ap-article-text" style={{ fontSize: 18, color: '#3F4A5F', lineHeight: 1.86, marginBottom: i < paras.length - 1 ? 22 : 38 }}>{text}</p>
                ));
              })()}

              {/* Tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 30 }}>
                {article.tags.map((tag: string) => (
                  <span key={tag} className="ap-tag"
                    style={{ background: '#F3F6FF', color: '#375DFB', fontSize: 12, fontWeight: 700, padding: '6px 13px', borderRadius: 999, border: '1px solid #C7D2FE' }}>
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 26, paddingBottom: 30, borderTop: '1px solid #EDF1F7', flexWrap: 'wrap' }}>
                <button onClick={() => setLiked(!liked)} className="ap-action-btn"
                  style={{ minHeight: 46, display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRadius: 14, border: `1.5px solid ${liked ? '#EF4444' : '#E5EAF2'}`, background: liked ? '#FFF1F1' : '#fff', color: liked ? '#EF4444' : '#374151', fontSize: 14, fontWeight: liked ? 800 : 700, cursor: 'pointer' }}>
                  <IcHeart active={liked} />
                  {(article.likes + (liked ? 1 : 0)).toLocaleString('ru')}
                </button>

                <button onClick={() => setJuked(!juked)} className="ap-action-btn"
                  style={{ minHeight: 46, display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRadius: 14, border: `1.5px solid ${juked ? '#10B981' : '#E5EAF2'}`, background: juked ? '#F0FDF4' : '#fff', color: juked ? '#10B981' : '#374151', fontSize: 14, fontWeight: juked ? 800 : 700, cursor: 'pointer' }}>
                  <IcThumb color={juked ? '#10B981' : '#D1D5DB'} />
                  Полезно
                </button>

                <button onClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth' })} className="ap-action-btn"
                  style={{ minHeight: 46, display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRadius: 14, border: '1.5px solid #E5EAF2', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  {commentCount}
                </button>

                <button onClick={handleFavorite} className="ap-action-btn"
                  style={{ minHeight: 46, display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRadius: 14, border: `1.5px solid ${saved ? '#375DFB' : '#E5EAF2'}`, background: saved ? '#EBF1FF' : '#fff', color: saved ? '#375DFB' : '#374151', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? '#375DFB' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                  {saved ? 'Сохранено' : 'Сохранить'}
                </button>

                <button onClick={handleShare} className="ap-action-btn"
                  style={{ marginLeft: 'auto', minHeight: 46, display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRadius: 14, border: `1.5px solid ${shared ? '#10B981' : '#E5EAF2'}`, background: shared ? '#F0FDF4' : '#fff', color: shared ? '#10B981' : '#374151', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {shared ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      Поделиться
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Comments section */}
            <div ref={commentsRef} className="ap-comments" style={{ padding: '34px 52px 52px', borderTop: '1px solid #EDF1F7', background: 'linear-gradient(180deg,#fbfcff,#fff)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: 0 }}>Комментарии</h3>
                <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: 13, fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}>{commentCount}</span>
              </div>

              {/* New comment input */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 28, background: '#fff', border: '1px solid #E3EAF6', borderRadius: 18, padding: 18, boxShadow: '0 14px 32px rgba(21,36,74,.05)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#EBF1FF', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={myAvatar} alt={myName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <textarea
                    ref={inputRef}
                    value={newComment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmitComment();
                    }}
                    placeholder="Написать комментарий... (Ctrl+Enter для отправки)"
                    rows={3}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', fontSize: 14, color: '#111', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, transition: 'border-color .15s', boxSizing: 'border-box' }}
                    onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = '#375DFB')}
                    onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
                    <button onClick={() => setNewComment('')}
                      style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 13, cursor: 'pointer' }}>
                      Отмена
                    </button>
                    <button onClick={handleSubmitComment} disabled={!newComment.trim()}
                      style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: newComment.trim() ? '#375DFB' : '#E5E7EB', color: newComment.trim() ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: newComment.trim() ? 'pointer' : 'not-allowed', transition: 'all .15s' }}>
                      Отправить
                    </button>
                  </div>
                </div>
              </div>

              {comments.length > 0
                ? comments.map((c: Comment) => (
                    <CommentItem
                      key={c.id}
                      comment={c}
                      onLike={() => toggleCommentLike(c.id)}
                      onReact={(r) => handleReact(c.id, r)}
                    />
                  ))
                : <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF', fontSize: 14 }}>Будьте первым, кто оставит комментарий</div>}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
