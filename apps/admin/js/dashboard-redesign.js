const env = import.meta.env || {};

const STORAGE_KEYS = {
  adminState: "voevoda_admin_state_v2",
  legacyState: "voevoda_admin_site_data_v1",
  siteData: "site_data",
  siteCourses: "site_courses",
  roles: "voevoda_admin_roles",
  portalUsers: "voevoda_users",
  portalSession: "voevoda_session",
};

const JSONBIN = {
  binId: env.VITE_JSONBIN_BIN_ID || "",
  apiKey: env.VITE_JSONBIN_API_KEY || "",
  baseUrl: "https://api.jsonbin.io/v3/b",
};

// Адрес портала: env-переменная → если админка открыта локально, то локальный
// dev-сервер портала, иначе продакшен-портал на Vercel.
const IS_LOCAL_ADMIN = ["localhost", "127.0.0.1"].includes(location.hostname);
const PROD_PORTAL_URL = "https://portal-seven-silk.vercel.app/";
const rawPortalUrl = env.VITE_PORTAL_URL || (IS_LOCAL_ADMIN ? "http://localhost:5173/" : PROD_PORTAL_URL);
const PORTAL_URL = rawPortalUrl.endsWith("/") ? rawPortalUrl : `${rawPortalUrl}/`;
const PORTAL_HOST = new URL(PORTAL_URL).host;

// Слой синхронизации с порталом. У локального портала эндпоинты живут в dev-сервере
// vite (/__admin-sync, /__admin-images — см. apps/portal/vite.config.ts), у продакшена
// на Vercel — в serverless-функциях (/api/admin-sync, /api/admin-images —
// см. apps/portal/api/). Сюда админка пишет данные, отсюда их читает портал.
const IS_LOCAL_PORTAL = /^https?:\/\/(localhost|127\.0\.0\.1)[:/]/.test(PORTAL_URL);
const SYNC_URL = env.VITE_ADMIN_SYNC_URL || new URL(IS_LOCAL_PORTAL ? "__admin-sync" : "api/admin-sync", PORTAL_URL).href;
const IMAGES_URL = env.VITE_ADMIN_IMAGES_URL || new URL(IS_LOCAL_PORTAL ? "__admin-images" : "api/admin-images", PORTAL_URL).href;
const IMAGES_UPLOAD_URL = `${IMAGES_URL.replace(/\/+$/, "")}/upload`;

// Ключ записи на продакшен-портал: если на портале задан env ADMIN_SYNC_SECRET,
// в админке должен быть задан VITE_ADMIN_SYNC_SECRET с тем же значением.
const SYNC_SECRET = env.VITE_ADMIN_SYNC_SECRET || "";
const syncAuthHeaders = () => (SYNC_SECRET ? { "X-Admin-Key": SYNC_SECRET } : {});

// ---- Оформление админки -------------------------------------------------
// Панель кастомизации удалена: заказчик утвердил единый фирменный стиль
// (светлая тема, Inter, синий акцент — макет Figma). Чистим следы старой
// системы, чтобы сохранённые ранее настройки не искажали утверждённый вид.
try { localStorage.removeItem("voevoda_admin_appearance_v1"); } catch {}
["data-admin-theme", "data-admin-font", "data-admin-motion", "data-admin-bg"].forEach(attr => document.documentElement.removeAttribute(attr));
document.documentElement.style.removeProperty("--accent");
document.documentElement.style.removeProperty("--admin-scale");

// Диагностика синхронизации: сразу видно, КУДА админка шлёт данные. Если портал
// открыт не по этому адресу (другой порт / прод-сборка без dev-сервера) — правки
// физически не дойдут. Открой консоль (F12) на админке, чтобы это увидеть.
console.info(`%c[Воевода] Портал: ${PORTAL_URL}\n[Воевода] Синхронизация → ${SYNC_URL}`, "color:#375DFB;font-weight:700");

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const STATUS_LABELS = {
  published: "Опубликовано",
  hidden: "Скрыто",
  pending: "На проверке",
  draft: "Черновик",
  archived: "В архиве",
};
const ROLE_LABELS = {
  super: "Суперадмин",
  admin: "Администратор",
  instructor: "Инструктор",
  user: "Участник",
};

const DEMO_USERS = [
  { id: "demo-tornado", login: "tornado", name: "Александр Воеводов", callsign: "Торнадо", role: "super", email: "tornado@voevoda.demo", phone: "+7 988 222 32 24", city: "Санкт-Петербург", photo: "/teacher2-main.jpg", courses: 3 },
  { id: "demo-bek", login: "bek", name: "Бек Куратор", callsign: "Бек", role: "admin", email: "bek@voevoda.demo", phone: "+7 988 222 32 25", city: "Москва", photo: "/teacher1-main.jpg", courses: 22 },
  { id: "demo-koba", login: "koba", name: "Коба Инструктор", callsign: "Коба", role: "instructor", email: "koba@voevoda.demo", phone: "+7 988 222 32 26", city: "Москва", photo: "/teacher3-main.jpg", courses: 14 },
  { id: "demo-shooter", login: "shooter", name: "Сергей Стрелков", callsign: "Стрелок", role: "user", email: "shooter@voevoda.demo", phone: "+7 988 222 32 27", city: "Казань", photo: "/sold1.png", courses: 11 },
  { id: "demo-nexus", login: "nexus", name: "Никита Связной", callsign: "Нексус", role: "user", email: "nexus@voevoda.demo", phone: "+7 988 222 32 28", city: "Москва", photo: "/teacher2-main.jpg", courses: 8 },
];

const TRAINING_TILES = [
  { key: "training-courses", title: "Курсы", text: "Каталог, цены, фото, публикация", icon: "К" },
  { key: "training-calendar", title: "Календарь потоков", text: "Даты стартов, города и форматы", icon: "П" },
  { key: "training-landing", title: "Лендинг курса", text: "Блоки, преимущества, медиа", icon: "Л" },
  { key: "training-program", title: "Программа занятий", text: "Разделы, темы и материалы", icon: "З" },
];

const PERMISSION_SECTIONS = [
  "Учебный центр",
  "Журнал",
  "Города",
  "Соревнования",
  "Путь Воеводы",
  "Пользователи",
  "Сообщества",
  "Документы",
];

const PERMISSION_ACTIONS = [
  ["summary", "Результаты в сводке"],
  ["view", "Видеть всё"],
  ["edit", "Редактировать всё"],
  ["publish", "Публиковать"],
];

const ROLE_PERMISSION_DEFAULTS = {
  super: Object.fromEntries(PERMISSION_SECTIONS.map(section => [section, { summary: true, view: true, edit: true, publish: true }])),
  admin: Object.fromEntries(PERMISSION_SECTIONS.map(section => [section, { summary: true, view: true, edit: true, publish: true }])),
  instructor: Object.fromEntries(PERMISSION_SECTIONS.map(section => [section, { summary: section === "Учебный центр" || section === "Путь Воеводы", view: true, edit: section === "Учебный центр", publish: false }])),
  user: Object.fromEntries(PERMISSION_SECTIONS.map(section => [section, { summary: false, view: section !== "Пользователи", edit: false, publish: false }])),
};

const PAGE_ALIASES = {
  "training-courses": "courses",
  heroes: "people",
};

let activePermissionRole = "admin";
let selectedUsers = new Set();

const RESOURCE_CONFIGS = {
  courses: {
    title: "Учебный центр",
    nav: "Учебный центр",
    icon: "У",
    lead: "Все военные и профессиональные курсы портала. Изменения сохраняются в общий слой данных и видны на страницах /courses и /professional.",
    titleField: "title",
    imageField: "image",
    routeDefault: "/courses",
    fields: [
      { key: "title", label: "Название", required: true },
      { key: "category", label: "Раздел", type: "select", options: [["military", "Военная подготовка"], ["professional", "Профессиональная подготовка"]] },
      { key: "city", label: "Город" },
      { key: "duration", label: "Длительность" },
      { key: "newPrice", label: "Цена", type: "number" },
      { key: "oldPrice", label: "Старая цена", type: "number" },
      { key: "image", label: "Фото" },
      { key: "description", label: "Описание", type: "textarea" },
      { key: "format", label: "Формат" },
      { key: "type", label: "Тип" },
      { key: "published", label: "Опубликован", type: "checkbox" },
    ],
  },
  cities: {
    title: "Город",
    nav: "Город",
    icon: "Г",
    lead: "Города, которые показываются на портале, маршруты городских страниц и обложки.",
    titleField: "name",
    imageField: "image",
    routeDefault: "/city",
    fields: [
      { key: "name", label: "Город", required: true },
      { key: "count", label: "Курсов", type: "number" },
      { key: "image", label: "Фото" },
      { key: "route", label: "Путь на портале" },
    ],
  },
  competitions: {
    title: "Соревнования",
    nav: "Соревнования",
    icon: "С",
    lead: "Карточки соревнований, статусы, описания и ссылки на раздел портала.",
    titleField: "title",
    imageField: "image",
    routeDefault: "/competitions",
    fields: commonContentFields("Название"),
  },
  path: {
    title: "Путь Воеводы",
    nav: "Путь Воеводы",
    icon: "П",
    lead: "Раздел прогресса курсанта: этапы, визуалы, описания и публикация.",
    titleField: "title",
    imageField: "image",
    routeDefault: "/my-path",
    fields: commonContentFields("Этап"),
  },
  people: {
    title: "Герои и Лидеры",
    nav: "Герои и Лидеры",
    icon: "Л",
    lead: "Преподаватели, командиры и герои, которые отображаются в портале.",
    titleField: "name",
    imageField: "mainImage",
    routeDefault: "/leaders",
    fields: [
      { key: "name", label: "Имя", required: true },
      { key: "category", label: "Категория" },
      { key: "rank", label: "Звание" },
      { key: "position", label: "Должность" },
      { key: "city", label: "Город" },
      { key: "mainImage", label: "Фото" },
      { key: "route", label: "Путь на портале" },
    ],
  },
  ranks: {
    title: "Звания и награды",
    nav: "Звания и награды",
    icon: "З",
    lead: "Награды, шевроны и достижения, которые используются в профилях и разделе достижений.",
    titleField: "title",
    imageField: "image",
    routeDefault: "/achievements",
    fields: commonContentFields("Награда"),
  },
  journal: {
    title: "Журнал",
    nav: "Журнал",
    icon: "Ж",
    lead: "Новости, статьи и блоговые материалы портала с реальными ссылками на публикации.",
    titleField: "title",
    imageField: "image",
    routeDefault: "/journal",
    fields: commonContentFields("Заголовок"),
  },
  communities: {
    title: "Сообщества",
    nav: "Сообщества",
    icon: "С",
    lead: "Городские и тематические сообщества портала.",
    titleField: "title",
    imageField: "image",
    routeDefault: "/communities",
    fields: commonContentFields("Сообщество"),
  },
  products: {
    title: "Военмаркет",
    nav: "Военмаркет",
    icon: "М",
    lead: "Товары, цены, категории и публикация карточек магазина.",
    titleField: "name",
    imageField: "img",
    routeDefault: "/market",
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "brand", label: "Бренд" },
      { key: "category", label: "Категория" },
      { key: "price", label: "Цена", type: "number" },
      { key: "oldPrice", label: "Старая цена", type: "number" },
      { key: "img", label: "Фото" },
      { key: "meta", label: "Описание" },
      { key: "published", label: "Опубликован", type: "checkbox" },
    ],
  },
  reviews: {
    title: "Отзывы",
    nav: "Отзывы",
    icon: "О",
    lead: "Отзывы участников, которые могут выводиться на лендингах курсов и городов.",
    titleField: "name",
    imageField: "photo",
    routeDefault: "/courses",
    fields: [
      { key: "name", label: "Автор", required: true },
      { key: "rank", label: "Звание" },
      { key: "stars", label: "Оценка", type: "number" },
      { key: "text", label: "Текст", type: "textarea" },
      { key: "photo", label: "Фото" },
      { key: "published", label: "Опубликован", type: "checkbox" },
    ],
  },
  venues: {
    title: "Площадки",
    nav: "Площадки",
    icon: "П",
    lead: "Адреса, координаты и фото учебных площадок.",
    titleField: "name",
    imageField: "photo",
    routeDefault: "/courses",
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "address", label: "Адрес" },
      { key: "coords", label: "Координаты" },
      { key: "photo", label: "Фото" },
      { key: "status", label: "Статус", type: "select", options: statusOptions() },
      { key: "route", label: "Путь на портале" },
    ],
  },
  documents: {
    title: "Документы",
    nav: "Документы",
    icon: "Д",
    lead: "Правовые и образовательные документы портала.",
    titleField: "title",
    imageField: "",
    routeDefault: "/documents",
    fields: [
      { key: "title", label: "Название", required: true },
      { key: "category", label: "Категория" },
      { key: "pages", label: "Страниц", type: "number" },
      { key: "fileUrl", label: "Файл или путь" },
      { key: "status", label: "Статус", type: "select", options: statusOptions() },
      { key: "route", label: "Путь на портале" },
    ],
  },
  media: {
    title: "Медиа",
    nav: "Медиа",
    icon: "М",
    lead: "Фотографии и визуальные материалы, которые используются в карточках и лендингах.",
    titleField: "title",
    imageField: "image",
    routeDefault: "/courses",
    fields: [
      { key: "title", label: "Название", required: true },
      { key: "image", label: "Фото" },
      { key: "status", label: "Статус", type: "select", options: statusOptions() },
      { key: "route", label: "Путь на портале" },
    ],
  },
  users: {
    title: "Пользователи",
    nav: "Пользователи",
    icon: "У",
    lead: "Демо-пользователи быстрого входа и реальные роли. Роли администратора и суперадмина добавляют в портале пункт «Админ панель» после рекламы.",
    titleField: "name",
    imageField: "photo",
    routeDefault: "/profile",
    fields: [
      { key: "login", label: "Логин", required: true },
      { key: "name", label: "Имя", required: true },
      { key: "callsign", label: "Позывной" },
      { key: "role", label: "Роль", type: "select", options: roleOptions() },
      { key: "email", label: "Email" },
      { key: "phone", label: "Телефон" },
      { key: "city", label: "Город" },
      { key: "photo", label: "Фото" },
      { key: "courses", label: "Курсов", type: "number" },
    ],
  },
};

const NAV_ITEMS = [
  { key: "summary", nav: "Сводка", icon: "С" },
  {
    key: "training",
    nav: "Учебный центр",
    icon: "У",
    children: [
      { key: "training-courses", nav: "Курсы", icon: "К" },
      { key: "training-calendar", nav: "Календарь потоков", icon: "П" },
      { key: "training-landing", nav: "Лендинг курса", icon: "Л" },
      { key: "training-program", nav: "Программа занятий", icon: "З" },
    ],
  },
  ...["cities", "competitions", "path"].map(key => ({ key, nav: RESOURCE_CONFIGS[key].nav, icon: RESOURCE_CONFIGS[key].icon })),
  { key: "heroes", nav: "Герои и Лидеры", icon: "Г" },
  ...["ranks", "journal", "communities"].map(key => ({ key, nav: RESOURCE_CONFIGS[key].nav, icon: RESOURCE_CONFIGS[key].icon })),
  {
    key: "users-admins",
    nav: "Пользователи",
    icon: "П",
    children: [
      { key: "users-admins", nav: "Администраторы", icon: "А" },
      { key: "users-participants", nav: "Участники", icon: "У" },
      { key: "users-permissions", nav: "Настройка прав", icon: "Р" },
      { key: "users-individual", nav: "Индивидуальная настройка", icon: "И" },
    ],
  },
  ...["products", "reviews", "venues", "documents", "media"].map(key => ({ key, nav: RESOURCE_CONFIGS[key].nav, icon: RESOURCE_CONFIGS[key].icon })),
  { key: "settings", nav: "Настройки", icon: "Н" },
];

const FLAT_NAV_ITEMS = NAV_ITEMS.flatMap(item => [item, ...(item.children || [])]);
const NAV_FOLDERS = [
  { label: "Главное", keys: ["summary"] },
  { label: "Обучение", keys: ["training"] },
  { label: "Контент портала", keys: ["cities", "competitions", "path", "heroes", "ranks", "journal", "communities"] },
  { label: "Пользователи", keys: ["users-admins"] },
  { label: "Материалы", keys: ["products", "reviews", "venues", "documents", "media"] },
  { label: "Система", keys: ["settings"] },
];

// SVG-иконки разделов. Где раздел есть и на портале (apps/portal/src/components/Sidebar.tsx)
// — путь скопирован 1-в-1; остальные нарисованы в том же стиле (Lucide, stroke=currentColor).
const ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  logout: '<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 3v18"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 15H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  folder: '<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5Z"/>',
  summary: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  training: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  "training-courses": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  "training-calendar": '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  "training-landing": '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
  "training-program": '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/>',
  cities: '<path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  competitions: '<circle cx="12" cy="8" r="5"/><path d="M8.8 12 7 22l5-3 5 3-1.8-10"/><path d="m9.5 8 1.5 1.5L14.5 6"/>',
  path: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h6a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h6"/>',
  heroes: '<path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/>',
  ranks: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  journal: '<path d="M4 22h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="9" y1="8" x2="16" y2="8"/><line x1="9" y1="12" x2="16" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>',
  communities: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  "users-admins": '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  "users-participants": '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  "users-permissions": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  "users-individual": '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  products: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  reviews: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  venues: '<path d="M3 9l9-6 9 6"/><rect x="4" y="9" width="16" height="12" rx="1"/><path d="M9 21v-8h6v8"/>',
  documents: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>',
  media: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  // алиасы под ключи ресурсов / KPI / быстрых действий
  courses: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  people: '<path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  pending: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
};

function iconSvg(key) {
  const inner = ICON_PATHS[key];
  if (!inner) return "";
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

// Списочные поля (массивы строк) для студийного редактора разделов.
const RESOURCE_LISTS = {
  people: [
    { key: "achievements", label: "Награды и достижения", placeholder: "Например: Орден Мужества", addLabel: "Добавить награду" },
    { key: "skills", label: "Навыки и специализация", placeholder: "Тактическая подготовка", addLabel: "Добавить навык" },
  ],
  competitions: [
    { key: "highlights", label: "Ключевые моменты", placeholder: "Что было на соревновании", addLabel: "Добавить пункт" },
  ],
  journal: [
    { key: "tags", label: "Теги", placeholder: "тактика", addLabel: "Добавить тег" },
  ],
  communities: [
    { key: "topics", label: "Темы сообщества", placeholder: "Полевые выходы", addLabel: "Добавить тему" },
  ],
  products: [
    { key: "features", label: "Характеристики", placeholder: "Материал: кордура 1000D", addLabel: "Добавить характеристику" },
  ],
  ranks: [
    { key: "criteria", label: "Условия получения", placeholder: "Пройти базовый курс", addLabel: "Добавить условие" },
  ],
  path: [
    { key: "tasks", label: "Задачи этапа", placeholder: "Что нужно выполнить", addLabel: "Добавить задачу" },
  ],
};

let seedState = null;
let state = emptyState();
let activePage = parsePage();
let filters = { q: "", status: "all" };
// Папка-город на странице «Учебный центр»: клик по папке открывает курсы
// только этого города; сбрасывается при обычной навигации в «Курсы».
let activeCityFolder = "";
// Сортировка списка курсов: added — как добавлены, title — по алфавиту.
let courseSort = "added";
let modal = null;
let syncStatus = { online: null, lastSync: null, lastError: "" };
let activeLandingCourseId = null;
let activeCalendarCourseId = null;
let activeRecordId = {};

const app = document.getElementById("app");
const toastRoot = document.getElementById("toast-root");

if (sessionStorage.getItem("admin_auth") !== "1") {
  window.location.href = "index.html";
}

init();

async function init() {
  try {
    seedState = await loadSeed();
  } catch (error) {
    console.warn("Seed load failed", error);
    seedState = emptyState();
  }
  const localState = readJson(STORAGE_KEYS.adminState) || readJson(STORAGE_KEYS.siteData) || readJson(STORAGE_KEYS.legacyState);

  // 1) Рендерим немедленно из локальных/сид-данных — НЕ блокируемся на сети,
  //    иначе зависший запрос к порталу оставил бы пустой экран.
  applyState(seedState, localState, null);
  safeRender();

  // 2) Затем подтягиваем удалённые данные (с таймаутом) и обновляем экран.
  let remoteState = null;
  try {
    remoteState = await loadRemote();
  } catch (error) {
    console.warn("Remote load failed", error);
  }
  if (remoteState) applyState(seedState, localState, remoteState);
  // Всегда пушим актуальный стейт на портал при старте — если sync-файл пуст,
  // устарел или содержит только частичные данные, портал получит свежую версию.
  syncDirty = true;
  saveState({ silent: true, remote: true });
  safeRender();
  pingSync();
}

function applyState(seed, local, remote) {
  state = mergeStates(seed, local, remote);
  ensureDemoUsers();
  ensureTrainingStructure();
  migrateConfig();
}

function safeRender() {
  try {
    render();
  } catch (error) {
    console.error("Render failed", error);
    if (app) {
      app.innerHTML = `<div style="max-width:560px;margin:60px auto;padding:32px;font-family:Inter,sans-serif;text-align:center">
        <div style="font-size:40px;margin-bottom:8px">⚠️</div>
        <h2 style="margin:0;font-weight:900">Не удалось отрисовать панель</h2>
        <p style="color:#777;font-weight:600;margin:10px 0 18px">${escapeHtml(String(error && error.message || error))}</p>
        <button onclick="location.reload()" style="padding:11px 20px;border-radius:999px;border:1px solid #050505;background:#050505;color:#fff;font-weight:800;cursor:pointer">Перезагрузить</button>
      </div>`;
    }
  }
}

function fetchWithTimeout(url, options = {}, ms = 4500) {
  if (typeof AbortController === "undefined") return fetch(url, options);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function migrateConfig() {
  if (!state.config || typeof state.config !== "object") state.config = {};
  // Старый дефолт указывал на :3000 — переводим на актуальный порт портала.
  if (!state.config.siteUrl || /localhost:3000/.test(state.config.siteUrl)) {
    state.config.siteUrl = PORTAL_URL;
  }
}

function commonContentFields(titleLabel) {
  return [
    { key: "title", label: titleLabel, required: true },
    { key: "subtitle", label: "Подзаголовок" },
    { key: "description", label: "Описание", type: "textarea" },
    { key: "image", label: "Фото" },
    { key: "status", label: "Статус", type: "select", options: statusOptions() },
    { key: "route", label: "Путь на портале" },
  ];
}

function statusOptions() {
  return [["published", "Опубликовано"], ["pending", "На проверке"], ["draft", "Черновик"], ["archived", "В архиве"]];
}

function roleOptions() {
  return Object.entries(ROLE_LABELS);
}

function defaultStreamEvents() {
  const now = new Date();
  return [
    {
      id: 1,
      day: 5,
      month: now.getMonth(),
      year: now.getFullYear(),
      title: "Вводное занятие",
      city: "Москва",
      type: "аудитория",
      timeStart: "10:00",
      timeEnd: "15:00",
      instructor: "Бек",
      num: 1,
      description: "Знакомство с программой курса, правилами безопасности и порядком работы группы.",
      image: "/military-course.jpg",
      location: "Учебный класс № 3",
      format: "Теория и разбор",
      equipment: ["Блокнот", "Удостоверение"],
      goals: ["Понять структуру курса", "Разобрать правила безопасности", "Познакомиться с группой"],
      status: "published",
    },
    {
      id: 2,
      day: 14,
      month: now.getMonth(),
      year: now.getFullYear(),
      title: "Полевая практика",
      city: "Москва",
      type: "полигон",
      timeStart: "10:00",
      timeEnd: "15:00",
      instructor: "Торнадо",
      num: 2,
      description: "Практика на местности: передвижение, укрытие и взаимодействие в группе.",
      image: "/фотоскурса.png",
      location: "Полигон «Калибр»",
      format: "Практика в группе",
      equipment: ["Полевая форма", "Перчатки", "Защита глаз"],
      goals: ["Сменить позицию", "Работать в паре", "Пройти контрольный маршрут"],
      status: "published",
    },
    {
      id: 3,
      day: 23,
      month: now.getMonth(),
      year: now.getFullYear(),
      title: "Огневая подготовка",
      city: "Москва",
      type: "стрельбище",
      timeStart: "10:00",
      timeEnd: "15:00",
      instructor: "Грек",
      num: 3,
      description: "Безопасная работа с оружием, устойчивые положения и контроль серии упражнений.",
      image: "/оружие1.png",
      location: "Стрелковая галерея № 2",
      format: "Практическое занятие",
      equipment: ["Наушники", "Защитные очки", "Перчатки"],
      goals: ["Проверить вкладку", "Собрать устойчивую группу", "Отработать смену положения"],
      status: "published",
    },
  ];
}

function defaultCourseLanding() {
  return {
    heroTitle: "Разведывательно-штурмовая подготовка",
    heroSubtitle: "Практический курс военной подготовки для тех, кто хочет уверенно действовать в группе, понимать полевую тактику и безопасно работать с учебным оружием.",
    heroBadge: "военная подготовка",
    heroImage: "/СолдатКурса.png",
    startText: "Ближайший старт группы",
    benefits: [
      "Инструкторы ветераны спецназа и ЧВК с опытом СВО",
      "16 дней занятий по субботам и воскресеньям с 9 до 15",
      "Пройдите курс один раз и потом занимайтесь бесплатно",
      "Обучение с нуля, можно начать в обычной спортивной форме",
      "Для мужчин и женщин с 14 до 55 лет",
      "Спартанские условия обучения",
    ],
    requirements: [
      "Гражданство РФ или стран ОДКБ",
      "Мужчины и женщины от 14 до 60 лет, для подростков нужна расписка от родителей",
      "Нормальное психическое состояние, устойчивые взгляды и дисциплина",
      "Отсутствие судимости или непогашенной судимости",
      "Отсутствие проблем со здоровьем, препятствующих занятию спортом",
      "Неконфликтность и порядочность",
    ],
    photos: ["/фотоскурса.png", "/voendelo1.png", "/voendelo2.png", "/минифотоскурса.png", "/voendelo4.png", "/оружие1.png", "/картаучений.png", "/медицина1.png"],
    programIntro: "На курсе делаем акцент на подготовку бойца, способного действовать в составе подразделения против регулярной армии: от личной тактики до медицины и связи.",
    programGroups: [
      { id: 1, title: "Военное дело", items: ["Введение в военное дело", "Личная тактическая подготовка", "Действия бойца в лесу", "Учебно-боевые задачи"] },
      { id: 2, title: "Оружие", items: ["Изучение оружия и уход за ним", "Холощение с оружием", "Экипировка и снаряжение"] },
      { id: 3, title: "Медицина", items: ["Тактическая медицина", "Эвакуация раненого", "Работа с аптечкой"] },
    ],
    equipment: [
      "Военная форма или одежда, которую не жалко испачкать",
      "Берцы или треккинговая обувь с поддержкой голени",
      "Защитные очки",
      "Тактические или строительные перчатки",
      "Компас",
      "Рюкзак гражданский или военный",
    ],
    resultsText: "После курса участник понимает порядок работы в группе, уверенно проходит базовые полевые задачи и получает доступ к дальнейшим занятиям.",
    mapTitle: "Где проходит курс",
    mapSubtitle: "Полигон «Калибр» · Минское шоссе, 31-й километр, с1, Москва",
    reviewsTitle: "Отзывы о курсе",
    price: 35000,
    videoTitle: "Видео-презентация",
    videoUrl: "/video/den-rossii.mp4",
    videoPoster: "/video/den-rossii.jpg",
    instructorName: "Торнадо",
    instructorRank: "Вице-ст. сержант",
    instructorRole: "Главный инструктор",
    instructorImage: "/сержант.png",
    instructorExp: "12 лет",
    instructorTrained: "480",
    instructorCourses: "8",
    studentsCount: "14 888",
    rating: "5.0",
    reviewsCount: "192",
    seatsFree: 8,
    seatsTotal: 20,
  };
}

function emptyState() {
  return {
    version: "admin-redesign-2026-06-30",
    updatedAt: new Date().toISOString(),
    deleted: {},
    config: {
      siteName: "УТЦ «Воевода»",
      siteDescription: "Военно-патриотический тренировочный центр",
      siteUrl: PORTAL_URL,
      contacts: { phone: "+7 988 258 22 22", email: "support@voevoda.demo", address: "Москва" },
      social: { vk: "", tg: "", ok: "" },
      stats: { revenue: 0, participants: 0, visits: 0, avgTime: 0 },
    },
    cities: [],
    courses: [],
    people: [],
    competitions: [],
    communities: [],
    journal: [],
    products: [],
    reviews: [],
    venues: [],
    documents: [],
    documentCategories: [],
    media: [],
    ranks: [],
    path: [],
    users: [],
    training: {
      calendarCursor: 0,
      calendarEvents: defaultStreamEvents(),
      courseLanding: defaultCourseLanding(),
      landingBlocks: [
        { id: 1, title: "Главный экран", text: "Обложка курса, оффер и кнопка записи", visible: true },
        { id: 2, title: "Преимущества", text: "Почему курс сильнее обычной подготовки", visible: true },
        { id: 3, title: "Фотографии", text: "Галерея занятий и полигона", visible: true },
        { id: 4, title: "Отзывы", text: "Подтверждённые отзывы участников", visible: true },
      ],
      programSections: [
        { id: 1, title: "Военное дело", topics: ["Введение в военное дело", "Тактика малых групп", "Связь и управление"] },
        { id: 2, title: "Оружие", topics: ["Безопасность", "Стрелковые упражнения", "Работа на рубеже"] },
      ],
    },
    rolePermissions: ROLE_PERMISSION_DEFAULTS,
    individualAccess: {},
  };
}

async function loadSeed() {
  try {
    const response = await fetch("/admin-seed-data.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Seed ${response.status}`);
    return normalizeState(await response.json());
  } catch (error) {
    console.warn("Seed data is unavailable", error);
    return emptyState();
  }
}

async function loadRemote() {
  const fromSync = await loadFromSync();
  if (fromSync) return fromSync;

  if (!JSONBIN.binId || !JSONBIN.apiKey) return null;

  try {
    const response = await fetch(`${JSONBIN.baseUrl}/${JSONBIN.binId}/latest`, {
      headers: { "X-Master-Key": JSONBIN.apiKey },
    });
    if (!response.ok) throw new Error(`JSONBin ${response.status}`);
    const payload = await response.json();
    return payload.record ? normalizeState(payload.record) : null;
  } catch (error) {
    console.warn("Remote sync skipped", error);
    return null;
  }
}

async function loadFromSync() {
  if (!SYNC_URL) return null;
  try {
    const response = await fetchWithTimeout(SYNC_URL, { headers: { Accept: "application/json" } }, 9000);
    if (!response.ok) throw new Error(`Sync ${response.status}`);
    const record = await response.json();
    // Успешная загрузка — подтверждаем что портал доступен.
    syncFailStreak = 0;
    syncStatus.online = true;
    syncStatus.lastError = "";
    // Принимаем данные только если это настоящий снимок от админки (есть поле version).
    // Посторонние объекты ({"test":1}, {} и т.д.) намеренно игнорируем, чтобы не
    // затереть локальное состояние мусором.
    return record && record.version ? normalizeState(record) : null;
  } catch (error) {
    // НЕ флипаем онлайн-статус напрямую — pingSync управляет им через streak-счётчик.
    // Если портал только что поднялся, loadFromSync может зафейлиться раньше
    // чем сервер успел обработать запрос — это не повод сразу показывать "офлайн".
    syncStatus.lastError = String(error?.message || error);
    syncDirty = true;  // при восстановлении связи запушим актуальный стейт
    return null;
  }
}

// Нужно ли спланировать повторную попытку синхронизации после того как снова подключимся?
let syncDirty = false;
// Счётчик активных HTTP-запросов сохранения — для индикатора "Сохранение…".
let syncInFlight = 0;
// Дебаунс-таймер для полей, которые меняются на каждое нажатие клавиши (текстовые поля
// лендинга, программы и т.д.) — чтобы не слать HTTP на каждую букву.
let fieldSaveTimer = null;
function scheduleSave() {
  clearTimeout(fieldSaveTimer);
  fieldSaveTimer = setTimeout(() => saveState({ silent: true }), 700);
}

async function saveToSync(payload) {
  if (!SYNC_URL) return false;
  syncInFlight++;
  refreshSyncIndicators();
  try {
    // Длинный таймаут: Windows-файловая система + Vite HMR иногда тормозят до 8-10с.
    const response = await fetchWithTimeout(SYNC_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...syncAuthHeaders() },
      body: JSON.stringify(payload),
    }, 12000);
    if (!response.ok) throw new Error(`Sync ${response.status}`);
    syncFailStreak = 0;
    syncStatus.online = true;
    syncStatus.lastSync = new Date().toISOString();
    syncStatus.lastError = "";
    syncDirty = false;
    const courseCount = Array.isArray(payload?.courses) ? payload.courses.length : "?";
    const eventCount = payload?.training?.calendarEvents?.length ?? "?";
    console.info(`%c[Воевода] ✓ Отправлено на портал (${SYNC_URL}) — курсов: ${courseCount}, событий: ${eventCount}`, "color:#18a058;font-weight:700");
    return true;
  } catch (error) {
    // Только логируем ошибку; онлайн-статус обновит pingSync через streak-счётчик.
    syncStatus.lastError = String(error?.message || error);
    syncDirty = true;   // при восстановлении связи повторим синхронизацию
    console.warn(`[Воевода] ✗ Синхронизация не удалась (${SYNC_URL}). Портал запущен на этом адресе? Ошибка:`, error);
    return false;
  } finally {
    syncInFlight--;
    refreshSyncIndicators();
  }
}

function normalizeState(raw = {}) {
  const base = emptyState();
  const source = raw.record || raw;
  const courses = Array.isArray(source.courses) ? source.courses : source.courses?.courses;
  const deleted = normalizeDeleted(source.deleted);
  if (Array.isArray(source.hiddenCourseIds)) {
    deleted.courses = Array.from(new Set([...(deleted.courses || []), ...source.hiddenCourseIds]));
  }

  return {
    ...base,
    ...source,
    config: deepMerge(base.config, source.config || {}),
    deleted,
    cities: list(source.cities),
    courses: list(courses),
    people: list(source.people),
    competitions: list(source.competitions),
    communities: list(source.communities),
    journal: list(source.journal),
    products: list(source.products),
    reviews: list(source.reviews),
    venues: list(source.venues),
    documents: list(source.documents),
    documentCategories: normalizeDocumentCategories(source.documentCategories),
    media: list(source.media),
    ranks: list(source.ranks),
    path: list(source.path),
    users: list(source.users),
    training: deepMerge(base.training, source.training || {}),
    rolePermissions: deepMerge(base.rolePermissions, source.rolePermissions || {}),
    individualAccess: deepMerge(base.individualAccess, source.individualAccess || {}),
  };
}

function normalizeDeleted(deleted = {}) {
  return Object.fromEntries(Object.entries(deleted).map(([key, ids]) => [key, Array.isArray(ids) ? ids : []]));
}

// Категории документов — список строк. Старый баг слияния разворачивал строки
// в объекты с посимвольными ключами ({0:"П",1:"р",...}), а Set не умеет
// дедуплицировать объекты — список разрастался на каждом сохранении (до 16 МБ,
// что превышает лимит тела запроса Vercel в 4.5 МБ). Восстанавливаем строки
// и убираем дубли.
function normalizeDocumentCategories(raw) {
  const restored = list(raw).map(item => {
    if (typeof item === "string") return item.trim();
    if (item && typeof item === "object") {
      if (typeof item.title === "string") return item.title.trim();
      if (typeof item.name === "string") return item.name.trim();
      const keys = Object.keys(item);
      if (keys.length && keys.every(key => /^\d+$/.test(key))) {
        return keys.sort((a, b) => Number(a) - Number(b)).map(key => item[key]).join("").trim();
      }
    }
    return "";
  }).filter(Boolean);
  return Array.from(new Set(restored));
}

function mergeStates(...states) {
  let result = emptyState();
  states.filter(Boolean).map(normalizeState).forEach(next => {
    const previous = result;
    result = {
      ...result,
      ...next,
      config: deepMerge(previous.config, next.config || {}),
      training: deepMerge(previous.training, next.training || {}),
      rolePermissions: deepMerge(previous.rolePermissions, next.rolePermissions || {}),
      individualAccess: deepMerge(previous.individualAccess, next.individualAccess || {}),
      deleted: mergeDeleted(previous.deleted, next.deleted),
    };

    Object.keys(RESOURCE_CONFIGS).forEach(key => {
      result[key] = mergeArrays(previous[key], next[key], result.deleted[key]);
    });

    result.documentCategories = normalizeDocumentCategories([...(previous.documentCategories || []), ...(next.documentCategories || [])]);
  });

  Object.keys(RESOURCE_CONFIGS).forEach(key => {
    result[key] = applyDeleted(result[key], result.deleted[key]);
  });

  return result;
}

function mergeDeleted(a = {}, b = {}) {
  const merged = { ...a };
  Object.keys(b).forEach(key => {
    merged[key] = Array.from(new Set([...(merged[key] || []), ...(b[key] || [])]));
  });
  return merged;
}

// Детектор «сваренной» кодировки: однажды данные были залиты на прод с
// битой кодировкой, и кириллица превратилась в «??????» / «�». Такие значения
// не должны побеждать при слиянии состояний — иначе порча бесконечно
// возвращается из старых вкладок и localStorage и перезатирает чистые данные.
function valueCorrupted(value) {
  if (typeof value === "string") return /\?{3,}/.test(value) || value.includes("�");
  if (Array.isArray(value)) return value.some(valueCorrupted);
  if (value && typeof value === "object") return Object.values(value).some(valueCorrupted);
  return false;
}

// Новое значение поля побеждает, КРОМЕ случая, когда оно повреждено,
// а старое — целое: тогда оставляем старое (само-исправление данных).
function pickMergedValue(baseValue, overlayValue) {
  if (valueCorrupted(overlayValue) && baseValue != null && baseValue !== "" && !valueCorrupted(baseValue)) {
    return baseValue;
  }
  return overlayValue;
}

function mergeItem(baseItem = {}, overlayItem = {}) {
  const merged = { ...baseItem };
  Object.keys(overlayItem).forEach(key => {
    merged[key] = Object.prototype.hasOwnProperty.call(merged, key)
      ? pickMergedValue(merged[key], overlayItem[key])
      : overlayItem[key];
  });
  return merged;
}

function mergeArrays(base = [], overlay = [], deletedIds = []) {
  const deleted = new Set((deletedIds || []).map(String));
  const output = [];
  const positions = new Map();

  base.forEach(item => {
    if (item?.id != null && deleted.has(String(item.id))) return;
    positions.set(String(item?.id ?? output.length), output.length);
    output.push({ ...item });
  });

  overlay.forEach(item => {
    if (!item) return;
    if (item.id != null && deleted.has(String(item.id))) return;
    const key = String(item.id ?? `${output.length}-${titleOf(item)}`);
    if (positions.has(key)) {
      output[positions.get(key)] = mergeItem(output[positions.get(key)], item);
    } else {
      positions.set(key, output.length);
      output.push({ ...item });
    }
  });

  return output;
}

function applyDeleted(items = [], deletedIds = []) {
  const deleted = new Set((deletedIds || []).map(String));
  return items.filter(item => item?.id == null || !deleted.has(String(item.id)));
}

function ensureDemoUsers() {
  DEMO_USERS.forEach(demo => {
    const found = state.users.find(user => sameLogin(user, demo) || sameText(user.callsign, demo.callsign) || sameText(user.email, demo.email));
    if (found) {
      Object.assign(found, { ...demo, ...found, login: demo.login, role: found.role || demo.role });
    } else {
      state.users.push({ ...demo });
    }
  });

  state.users.forEach(user => {
    const login = loginOf(user);
    if (!state.individualAccess[login]) {
      state.individualAccess[login] = {
        fullAccess: user.role === "admin" || user.role === "super",
        restrictions: [],
        note: "",
      };
    }
  });
}

function ensureTrainingStructure() {
  const baseTraining = emptyState().training;
  state.training = deepMerge(baseTraining, state.training || {});

  const defaultLanding = defaultCourseLanding();
  const landing = state.training.courseLanding || {};
  state.training.courseLanding = deepMerge(defaultLanding, landing);

  ["benefits", "requirements", "photos", "programGroups", "equipment"].forEach(key => {
    if (!Array.isArray(state.training.courseLanding[key]) || !state.training.courseLanding[key].length) {
      state.training.courseLanding[key] = [...defaultLanding[key]];
    }
  });

  // Лендинги по курсам: { [ключ_курса]: landing }. Каждый курс редактируется отдельно.
  if (!state.training.courseLandings || typeof state.training.courseLandings !== "object") {
    state.training.courseLandings = {};
  }
  // Миграция старого единого лендинга: привязываем его к первому курсу (не к heroTitle,
  // иначе ключи не совпадают и лендинг "теряется" на странице курса).
  if (!Object.keys(state.training.courseLandings).length) {
    const courses = landingCourseList();
    const migrateKey = courses.length
      ? landingKey(courses[0].title || courses[0].name)
      : landingKey(state.training.courseLanding.heroTitle);
    if (migrateKey) state.training.courseLandings[migrateKey] = deepMerge(defaultLanding, state.training.courseLanding);
  }

  if (!Array.isArray(state.training.landingBlocks) || !state.training.landingBlocks.length) {
    state.training.landingBlocks = [
      { id: 1, title: "Главный экран", text: state.training.courseLanding.heroSubtitle, visible: true },
      { id: 2, title: "Преимущества", text: state.training.courseLanding.benefits.join("\n"), visible: true },
      { id: 3, title: "Фотографии", text: state.training.courseLanding.photos.join("\n"), visible: true },
      { id: 4, title: "Программа", text: state.training.courseLanding.programIntro, visible: true },
      { id: 5, title: "Расписание", text: "Данные берутся из календаря потоков", visible: true },
    ];
  }

  if (!Array.isArray(state.training.calendarEvents) || !state.training.calendarEvents.length) {
    state.training.calendarEvents = defaultStreamEvents();
  }
  state.training.calendarEvents = normalizeStreamEvents(state.training.calendarEvents);

  // Календари по курсам: { [ключ_курса]: events[] }. У каждого курса своё расписание.
  if (!state.training.courseCalendars || typeof state.training.courseCalendars !== "object") {
    state.training.courseCalendars = {};
  }
  // Миграция старого общего календаря: переносим его один раз в самый первый курс,
  // чтобы остальные курсы стартовали с чистого (своего) расписания, а не копии общего.
  if (!Object.keys(state.training.courseCalendars).length) {
    const courses = landingCourseList();
    const seedKey = courses.length ? landingKey(courses[0].title || courses[0].name) : "";
    if (seedKey && state.training.calendarEvents.length) {
      state.training.courseCalendars[seedKey] = state.training.calendarEvents;
    }
  }
  Object.keys(state.training.courseCalendars).forEach(key => {
    state.training.courseCalendars[key] = normalizeStreamEvents(state.training.courseCalendars[key] || []);
  });
}

function normalizeStreamEvents(events) {
  const now = new Date();
  return (Array.isArray(events) ? events : []).map((eventItem, index) => ({
    id: eventItem.id ?? index + 1,
    day: clampDay(eventItem.day || index + 1),
    month: Number.isFinite(Number(eventItem.month)) ? Number(eventItem.month) : now.getMonth(),
    year: Number(eventItem.year) || now.getFullYear(),
    title: eventItem.title || "Занятие",
    city: eventItem.city || "Москва",
    type: normalizeStreamType(eventItem.type),
    timeStart: eventItem.timeStart || "10:00",
    timeEnd: eventItem.timeEnd || "15:00",
    instructor: eventItem.instructor || "Бек",
    num: Number(eventItem.num) || index + 1,
    description: eventItem.description || "Описание занятия можно изменить в админке.",
    image: eventItem.image || "/military-course.jpg",
    location: eventItem.location || eventItem.city || "Учебная площадка",
    format: eventItem.format || eventItem.type || "Практическое занятие",
    equipment: Array.isArray(eventItem.equipment) ? eventItem.equipment : [],
    goals: Array.isArray(eventItem.goals) ? eventItem.goals : [],
    status: eventItem.status || "published",
  }));
}

function normalizeStreamType(value = "") {
  const text = normalizeText(value);
  if (text.includes("стрел") || text.includes("огнев")) return "стрельбище";
  if (text.includes("полиг") || text.includes("поле")) return "полигон";
  return "аудитория";
}

function clampDay(value) {
  return Math.min(31, Math.max(1, Number(value) || 1));
}

// Пишем в localStorage «мягко»: браузерное хранилище ограничено (~5 МБ), и при
// тяжёлых данных (например, картинки в base64) setItem бросает QuotaExceededError.
// Раньше это роняло весь saveState ДО отправки на портал — и правки не уходили на
// сайт. Теперь ошибка хранилища не прерывает синхронизацию: портал получает данные
// по сети независимо от localStorage.
let localQuotaWarned = false;
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`[Воевода] localStorage переполнен — ключ "${key}" не сохранён локально (на портал данные всё равно уходят).`, error?.name || error);
    return false;
  }
}

function saveState(options = {}) {
  state.updatedAt = new Date().toISOString();
  const payload = buildPortalPayload();

  // Порядок по важности; каждый вызов независим (без short-circuit), чтобы
  // переполнение на одном ключе не мешало записать остальные.
  const okData = safeSetItem(STORAGE_KEYS.siteData, JSON.stringify(payload));
  const okState = safeSetItem(STORAGE_KEYS.adminState, JSON.stringify(state));
  const okLegacy = safeSetItem(STORAGE_KEYS.legacyState, JSON.stringify(payload));
  const okCourses = safeSetItem(STORAGE_KEYS.siteCourses, JSON.stringify({ courses: state.courses, hiddenCourseIds: payload.hiddenCourseIds, updatedAt: state.updatedAt }));
  try { writeRoles(); } catch (error) { console.warn("[Воевода] writeRoles пропущен:", error); }

  if (!(okData && okState && okLegacy && okCourses) && !localQuotaWarned) {
    localQuotaWarned = true;
    toast("Локальное хранилище переполнено", "Данные всё равно уходят на портал. Причина — тяжёлые картинки в base64: замените их загрузкой файла или ссылкой.");
  }

  if (options.remote === false) {
    if (!options.silent) toast("Сохранено", "Изменения записаны в админке.");
    return;
  }

  saveRemote(payload, { toast: !options.silent });
}

function buildPortalPayload() {
  const hiddenCourseIds = new Set(state.deleted?.courses || []);
  state.courses.forEach(course => {
    if (course.published === false) hiddenCourseIds.add(course.id);
  });

  return {
    ...state,
    courses: state.courses,
    hiddenCourseIds: Array.from(hiddenCourseIds).filter(id => id != null),
  };
}

async function saveRemote(payload, options = {}) {
  const syncedLocal = await saveToSync(payload);
  const syncedJsonbin = await saveToJsonbin(payload);

  if (options.toast === false) return;

  if (syncedLocal) {
    toast("Портал обновлён", "Данные отправлены на портал — изменения появятся на сайте.");
  } else if (syncedJsonbin) {
    toast("Облако обновлено", "Общий источник (JSONBin) получил актуальную версию.");
  } else if (IS_LOCAL_PORTAL) {
    toast("Сохранено локально", "Портал не запущен. Запустите apps/portal (npm run dev), чтобы данные ушли на сайт.");
  } else {
    toast("Сохранено локально", `Портал ${PORTAL_HOST} недоступен. Проверьте деплой и подключение Vercel Blob — изменения отправятся при восстановлении связи.`);
  }
}

async function saveToJsonbin(payload) {
  if (!JSONBIN.binId || !JSONBIN.apiKey) return false;
  try {
    const response = await fetch(`${JSONBIN.baseUrl}/${JSONBIN.binId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN.apiKey,
        "X-Bin-Versioning": "false",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`JSONBin ${response.status}`);
    return true;
  } catch (error) {
    console.warn("JSONBin save skipped", error);
    return false;
  }
}

function writeRoles() {
  const roles = {};
  state.users.forEach(user => {
    const login = normalizeLogin(user.login || loginFromEmail(user.email) || user.callsign);
    if (login) roles[login] = user.role || "user";
  });
  localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(roles));

  const portalUsers = readJson(STORAGE_KEYS.portalUsers);
  if (portalUsers && typeof portalUsers === "object") {
    Object.entries(roles).forEach(([login, role]) => {
      if (portalUsers[login]?.user) {
        portalUsers[login].user.role = role;
      }
    });
    localStorage.setItem(STORAGE_KEYS.portalUsers, JSON.stringify(portalUsers));
  }

  const session = readJson(STORAGE_KEYS.portalSession);
  const sessionLogin = normalizeLogin(session?.login);
  if (sessionLogin && roles[sessionLogin]) {
    localStorage.setItem(STORAGE_KEYS.portalSession, JSON.stringify({ ...session, role: roles[sessionLogin] }));
  }
}

let previousRenderedPage = null;

function render() {
  activePage = parsePage();
  document.querySelector(".modal-backdrop")?.remove();

  // Сохраняем прокрутку и фокус, чтобы точечные обновления (поиск, инлайн-поля,
  // переключение месяца в календаре и т.д.) не "дёргали" экран — это не навигация
  // между страницами, а значит анимация входа и сброс скролла тут не нужны.
  const isNavigation = activePage !== previousRenderedPage;
  const prevMain = app.querySelector(".main");
  const prevScrollTop = prevMain ? prevMain.scrollTop : 0;
  // Прокрутка сайдбара (.nav) сохраняется ВСЕГДА — и при навигации тоже,
  // иначе каждый переход по разделам «кидает» список меню наверх.
  const prevNav = app.querySelector(".nav");
  const prevNavScroll = prevNav ? prevNav.scrollTop : 0;
  const focusInfo = captureFocusInfo();

  app.innerHTML = shellHtml(isNavigation);
  bindDynamicElements();

  const main = app.querySelector(".main");
  if (main) main.scrollTop = isNavigation ? 0 : prevScrollTop;
  const nav = app.querySelector(".nav");
  if (nav) nav.scrollTop = prevNavScroll;
  restoreFocusInfo(focusInfo);

  previousRenderedPage = activePage;

  if (modal) {
    document.body.insertAdjacentHTML("beforeend", modalHtml());
    bindModal();
  }
}

function captureFocusInfo() {
  const active = document.activeElement;
  if (!active || !app.contains(active) || !active.dataset?.action) return null;
  return {
    action: active.dataset.action,
    id: active.dataset.id,
    field: active.dataset.field,
    list: active.dataset.list,
    index: active.dataset.index,
    selectionStart: typeof active.selectionStart === "number" ? active.selectionStart : null,
    selectionEnd: typeof active.selectionEnd === "number" ? active.selectionEnd : null,
  };
}

function restoreFocusInfo(info) {
  if (!info) return;
  let selector = `[data-action="${info.action}"]`;
  if (info.id != null) selector += `[data-id="${CSS.escape(String(info.id))}"]`;
  if (info.field) selector += `[data-field="${CSS.escape(info.field)}"]`;
  if (info.list) selector += `[data-list="${CSS.escape(info.list)}"]`;
  if (info.index != null) selector += `[data-index="${CSS.escape(String(info.index))}"]`;
  const target = app.querySelector(selector);
  if (!target || typeof target.focus !== "function") return;
  target.focus();
  if (info.selectionStart != null && typeof target.setSelectionRange === "function") {
    try {
      target.setSelectionRange(info.selectionStart, info.selectionEnd);
    } catch {
      // некоторые типы input (number, email) не поддерживают выделение — игнорируем
    }
  }
}

function shellHtml(isNavigation = true) {
  return `
    <div class="admin-shell">
      <div class="admin-frame">
        ${appHeaderHtml()}
        <div class="admin-body">
          <aside class="sidebar">
            <nav class="nav">${navFoldersHtml()}</nav>
            ${sidebarFooterHtml()}
          </aside>
          <main class="main ${isNavigation ? "" : "is-update"}">
            <div class="mobile-menu">${FLAT_NAV_ITEMS.filter(item => !item.children).map(item => navButtonHtml(item, "mobile")).join("")}</div>
            <div class="page-content ${isNavigation ? "page-content-enter" : ""}">${pageContentHtml(activePage)}</div>
          </main>
        </div>
      </div>
    </div>
  `;
}

function appHeaderHtml() {
  // Реальное число позиций, ожидающих публикации; без записей значок пустой.
  const pending = pendingItems().length;
  return `
    <header class="app-header">
      ${brandHtml()}
      <label class="admin-search" aria-label="Поиск по админ панели">
        <span class="admin-search-icon">${iconSvg("search")}</span>
        <input value="${escapeAttr(filters.q)}" data-action="search" placeholder="Поиск по админ панели" />
      </label>
      <div class="header-actions">
        <button class="header-icon" type="button" data-action="navigate" data-page="summary" title="${pending ? `Ожидают публикации: ${pending}` : "Уведомлений нет"}">
          ${iconSvg("bell")}
          ${pending ? `<span class="header-badge">${pending > 9 ? "9+" : pending}</span>` : ""}
        </button>
        <button class="header-icon" type="button" data-action="open-portal" title="Открыть портал">
          ${iconSvg("logout")}
        </button>
      </div>
    </header>
  `;
}

function brandHtml() {
  return `
    <div class="brand">
      <div class="brand-mark"><img src="/logo.png" alt="Воевода" /></div>
      <div class="brand-copy">
        <div class="brand-title">УТЦ Воевода</div>
      </div>
    </div>
  `;
}

function navFoldersHtml() {
  return NAV_FOLDERS.map(folder => {
    const items = folder.keys.map(key => NAV_ITEMS.find(item => item.key === key)).filter(Boolean);
    return `
      <section class="nav-folder">
        <div class="nav-folder-title"><span></span>${escapeHtml(folder.label)}</div>
        <div class="nav-folder-items">${items.map(navItemHtml).join("")}</div>
      </section>
    `;
  }).join("");
}

function navItemHtml(item) {
  if (!item.children) return navButtonHtml(item);
  const active = isNavActive(item);
  return `
    <div class="nav-group ${active ? "open" : ""}">
      ${navButtonHtml(item)}
      <div class="nav-sub">${item.children.map(child => navButtonHtml(child, "sub")).join("")}</div>
    </div>
  `;
}

function navButtonHtml(item, variant = "") {
  const active = isNavActive(item);
  const caret = item.children && variant !== "mobile" ? `<span class="nav-caret">${iconSvg("chevron")}</span>` : "";
  const ico = iconSvg(item.key) || escapeHtml(item.icon);
  return `
    <button class="nav-button ${variant} ${active ? "active" : ""}" data-action="navigate" data-page="${escapeAttr(item.key)}" title="${escapeAttr(item.nav)}">
      <span class="nav-icon">${ico}</span>
      <span class="nav-label">${escapeHtml(item.nav)}</span>
      ${caret}
    </button>
  `;
}

function isNavActive(item) {
  return item.key === activePage || Boolean(item.children?.some(child => child.key === activePage));
}

function sidebarFooterHtml() {
  return `
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="admin-avatar">
          <img src="${escapeAttr(portalAssetUrl("/teacher2-main.jpg"))}" alt="Администратор" data-fallback="А" />
        </div>
        <div>
          <div class="footer-name">Александр В.<span class="verified-dot">✓</span></div>
          <div class="footer-email">Супер-админ</div>
        </div>
        <button class="sidebar-logout" data-action="logout" title="Выйти из админки">${iconSvg("logout")}</button>
      </div>
    </div>
  `;
}

function syncPillHtml() {
  const online = syncStatus.online;
  const saving = syncInFlight > 0;
  const stateClass = saving ? "saving" : online === true ? "online" : online === false ? "offline" : "";
  const label = saving ? "Сохранение…" : online === true ? "Портал на связи" : online === false ? "Портал недоступен" : "Проверка связи…";
  const sub = saving
    ? "изменения уходят на портал"
    : online === true
      ? (syncStatus.lastSync ? `обновлено ${formatTime(syncStatus.lastSync)}` : "изменения уходят сразу")
      : online === false
        ? (IS_LOCAL_PORTAL ? "запустите apps/portal" : "проверьте деплой портала")
        : PORTAL_HOST;
  return `
    <div class="sync-pill ${stateClass}" id="sync-pill" title="Синхронизация с порталом">
      <span class="sync-dot"></span>
      <div><b>${escapeHtml(label)}</b><span class="sync-sub">${escapeHtml(sub)}</span></div>
    </div>
  `;
}

function topbarHtml() {
  const config = pageMeta(activePage);
  const canGoBack = activePage !== "summary";

  return `
    <header class="topbar">
      <div>
        <div class="breadcrumbs">
          <button class="crumb-link" data-action="navigate" data-page="summary">Сводка</button>
          ${breadcrumbsFor(activePage).map(label => `<span>/</span><span>${escapeHtml(label)}</span>`).join("")}
        </div>
        <h1 class="page-title">${escapeHtml(config.title)}</h1>
        <p class="page-lead">${escapeHtml(config.lead || "")}</p>
      </div>
      <div class="top-actions">
        ${canGoBack ? `<button class="btn ghost" data-action="navigate" data-page="summary">Назад</button>` : ""}
        <button class="btn" data-action="open-portal">Открыть портал ↗</button>
      </div>
    </header>
  `;
}

// Вкладки подразделов на страницах — заменяют раскрытие подпунктов в сайдбаре,
// чтобы навигация слева всегда помещалась в экран без прокрутки.
const SECTION_TABS = [
  {
    match: page => page === "training" || page.startsWith("training-"),
    tabs: [
      { key: "training", label: "Обзор" },
      { key: "training-courses", label: "Курсы" },
      { key: "training-calendar", label: "Календарь потоков" },
      { key: "training-landing", label: "Лендинг курса" },
      { key: "training-program", label: "Программа занятий" },
    ],
  },
  {
    match: page => page.startsWith("users-"),
    tabs: [
      { key: "users-admins", label: "Администраторы" },
      { key: "users-participants", label: "Участники" },
      { key: "users-permissions", label: "Настройка прав" },
      { key: "users-individual", label: "Индивидуальная настройка" },
    ],
  },
];

function sectionTabsHtml(page) {
  const group = SECTION_TABS.find(section => section.match(page));
  if (!group) return "";
  return `
    <div class="section-tabs">
      ${group.tabs.map(tab => `
        <button class="section-tab ${tab.key === page ? "active" : ""}" data-action="navigate" data-page="${escapeAttr(tab.key)}">${escapeHtml(tab.label)}</button>
      `).join("")}
    </div>
  `;
}

function pageContentHtml(page) {
  return sectionTabsHtml(page) + pageInnerHtml(page);
}

function pageInnerHtml(page) {
  if (page === "summary") return figmaSummaryHtml();
  if (page === "settings") return settingsHtml();
  if (page === "training") return figmaTrainingHomeHtml();
  if (page === "training-calendar") return figmaTrainingCalendarHtml();
  if (page === "training-landing") return trainingLandingHtml();
  if (page === "training-program") return trainingProgramHtml();
  if (page === "users-admins") return figmaUsersTableHtml("admins");
  if (page === "users-participants") return figmaUsersTableHtml("participants");
  if (page === "users-permissions") return figmaPermissionsHtml();
  if (page === "users-individual") return individualUsersHtml();
  // Контент-разделы — студийный inline-редактор (как у лендинга): список + полная форма.
  const dataKey = dataKeyForPage(page);
  if (RESOURCE_CONFIGS[dataKey] && dataKey !== "courses" && dataKey !== "users") return studioHtml(page);
  return resourcePageHtml(page);
}

function pageMeta(page) {
  const meta = {
    summary: { title: "Сводка", lead: "Оперативный пульт портала: курсы, пользователи, публикации, роли и быстрые действия." },
    settings: { title: "Настройки", lead: "Глобальные параметры портала, контакты, адрес и синхронизация." },
    training: { title: "Учебный центр", lead: "Полная структура управления обучением: курсы, календарь потоков, лендинг и программа занятий." },
    "training-calendar": { title: "Календарь потоков", lead: "Планирование стартов, городов, форматов и статусов учебных потоков." },
    "training-landing": { title: "Лендинг курса", lead: "Управление блоками посадочной страницы курса: порядок, видимость и текст." },
    "training-program": { title: "Программа занятий", lead: "Разделы программы, темы занятий и быстрые правки учебного контента." },
    "users-admins": { title: "Администраторы", lead: "Пользователи с доступом к админке. Роли «Администратор» и «Суперадмин» открывают пункт «Админ панель» в портале." },
    "users-participants": { title: "Участники", lead: "Обычные пользователи и инструкторы демо-доступа. Здесь можно выдать роль администратора." },
    "users-permissions": { title: "Настройка прав", lead: "Матрица прав по ролям: что отображается в сводке, кто видит, редактирует и публикует." },
    "users-individual": { title: "Индивидуальная настройка", lead: "Точечные ограничения и полный доступ для конкретных пользователей." },
    heroes: { ...RESOURCE_CONFIGS.people, title: "Герои и Лидеры" },
  };
  if (meta[page]) return meta[page];
  return RESOURCE_CONFIGS[dataKeyForPage(page)] || { title: "Раздел", lead: "" };
}

function breadcrumbsFor(page) {
  if (page === "training") return ["Учебный центр"];
  if (page.startsWith("training-")) return ["Учебный центр", pageMeta(page).title];
  if (page.startsWith("users-")) return ["Пользователи", pageMeta(page).title];
  if (page === "heroes") return ["Герои и Лидеры"];
  if (page === "summary") return [];
  return [pageMeta(page).title];
}

function figmaBreadcrumbHtml(items = []) {
  return `
    <div class="figma-crumbs">
      <button class="crumb-link" data-action="navigate" data-page="summary">Сводка</button>
      ${items.map(item => `<span class="crumb-sep">${iconSvg("chevron")}</span><span>${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
}

function figmaPanelTitleHtml(title, iconKey = "training-courses", actions = "") {
  return `
    <div class="figma-panel-titlebar">
      <div class="figma-title">
        <span class="figma-title-icon">${iconSvg(iconKey)}</span>
        <h1>${escapeHtml(title)}</h1>
      </div>
      <div class="figma-title-actions">${actions}</div>
    </div>
  `;
}

function figmaMetaBarHtml(items = []) {
  // Дата последнего сохранения состояния админки — реальная, из saveState().
  const updated = (() => {
    if (!state.updatedAt) return "";
    const date = new Date(state.updatedAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  })();
  return `
    <div class="figma-meta-bar">
      ${figmaBreadcrumbHtml(items)}
      ${updated ? `<div class="figma-updated"><b>Изменен</b><span>${escapeHtml(updated)}</span></div>` : ""}
    </div>
  `;
}

function figmaSummaryHtml() {
  // Счётчики модулей — реальные объёмы данных админки, а не макетные числа.
  const countOf = key => formatNumber((state[key] || []).length);
  const modules = [
    { page: "training", icon: "training", title: "Учебный центр", count: countOf("courses"), text: "Курсы, календарь, лендинг" },
    { page: "cities", icon: "cities", title: "Города", count: countOf("cities"), text: "Города, мероприятия, участники" },
    { page: "competitions", icon: "competitions", title: "Соревнования", count: countOf("competitions"), text: "Создание, редактирование" },
    { page: "path", icon: "path", title: "Путь Воевода", count: countOf("path"), text: "Добавление и редактирование" },
    { page: "heroes", icon: "heroes", title: "Герои и Лидеры", count: countOf("people"), text: "Добавление и редактирование" },
    { page: "ranks", icon: "ranks", title: "Звания и награды", count: countOf("ranks"), text: "Добавление и редактирование" },
    { page: "journal", icon: "journal", title: "Журнал", count: countOf("journal"), text: "Статьи, новости, блог" },
    { page: "communities", icon: "communities", title: "Сообщества", count: countOf("communities"), text: "Управление сообществами" },
    { page: "users-admins", icon: "users", title: "Пользователи", count: countOf("users"), text: "Назначение ролей и управление" },
  ];
  const pending = pendingItems().length;
  const metrics = [
    { title: "Пользователей", period: "Всего", value: countOf("users"), icon: "users", tone: "green" },
    { title: "Курсов", period: "Всего", value: countOf("courses"), icon: "products", tone: "" },
    { title: "Публикаций в журнале", period: "Всего", value: countOf("journal"), icon: "communities", tone: "" },
    { title: "Ожидают публикации", period: "", value: String(pending), icon: "calendar", tone: pending ? "orange" : "" },
  ];
  return `
    <section class="figma-dashboard">
      <div class="summary-kpis">
        ${metrics.map(item => `
          <article class="metric-card ${item.tone}">
            <div class="metric-head">
              <span>${item.title}</span>
              ${item.period ? `<span class="metric-period">${escapeHtml(item.period)}</span>` : ""}
            </div>
            <div class="metric-value">${escapeHtml(item.value)}</div>
            <div class="metric-watermark">${iconSvg(item.icon)}</div>
          </article>
        `).join("")}
      </div>
      <div class="summary-divider"><span>⌄</span></div>
      <div class="summary-modules">
        ${modules.map(item => `
          <button class="summary-module-card" data-action="navigate" data-page="${escapeAttr(item.page)}">
            <span class="summary-module-icon">${iconSvg(item.icon)}</span>
            <span class="summary-module-title">${escapeHtml(item.title)} ${item.count ? `<b>${escapeHtml(item.count)}</b>` : ""}</span>
            <span class="summary-module-text">${escapeHtml(item.text)}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function folderIconHtml(kind = "blue") {
  return `<span class="folder-icon ${kind}"><span></span></span>`;
}

function figmaTrainingHomeHtml() {
  // Папки — реальные города из раздела «Город»; клик открывает курсы города.
  const cities = state.cities || [];
  const courseCountByCity = name => (state.courses || []).filter(course => (course.city || "").trim() === name).length;
  return `
    <section class="content-panel folder-panel">
      ${figmaPanelTitleHtml("Учебный центр", "training", `<button class="btn black" data-action="add" data-page="cities">Добавить папку</button>`)}
      ${figmaMetaBarHtml(["Учебный центр"])}
      <div class="folder-grid city-folders">
        ${cities.length ? cities.map(city => {
          const name = city.name || "Без названия";
          const count = courseCountByCity(name);
          return `
            <button class="folder-tile" data-action="open-city-courses" data-city="${escapeAttr(name)}" title="${escapeAttr(name)}${count ? ` · курсов: ${count}` : ""}">
              ${folderIconHtml("blue")}
              <span>${escapeHtml(name)}</span>
            </button>
          `;
        }).join("") : `<div class="empty">Пока нет городов. Нажмите «Добавить папку», чтобы создать первый.</div>`}
      </div>
    </section>
  `;
}

function figmaTrainingCalendarHtml() {
  const course = ensureActiveCalendar();
  const courses = landingCourseList();
  const monthDate = new Date();
  monthDate.setMonth(monthDate.getMonth() + Number(state.training.calendarCursor || 0));
  monthDate.setDate(1);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const monthLabel = monthDate.toLocaleDateString("ru-RU", { month: "long", year: "numeric" }).replace(/^./, c => c.toUpperCase());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalCells = 42;
  const today = new Date();
  const visibleEvents = state.training.calendarEvents.filter(event => Number(event.month) === month && Number(event.year) === year);
  const cells = Array.from({ length: totalCells }, (_, index) => {
    const day = index - firstOffset + 1;
    if (day < 1) return { day: prevDays + day, muted: true };
    if (day > daysInMonth) return { day: day - daysInMonth, muted: true };
    return { day, muted: false };
  });
  const courseSelector = courses.length
    ? `<select class="select calendar-course-select" data-action="select-calendar-course" title="Курс, чьё расписание редактируется">
        ${courses.map(item => `<option value="${escapeAttr(item.id)}" ${String(item.id) === String(activeCalendarCourseId) ? "selected" : ""}>${escapeHtml(item.title || item.name)}${item.category === "professional" ? " · проф." : ""}</option>`).join("")}
      </select>`
    : "";
  return `
    <section class="content-panel calendar-panel">
      <div class="figma-calendar-head">
        <div class="calendar-title"><span>Старт потоков</span><b>${escapeHtml(monthLabel)}</b>${courseSelector}</div>
        <div class="calendar-legend">
          <span><i class="legend-dot online"></i>Онлайн</span>
          <span><i class="legend-dot offline"></i>Оффлайн</span>
          <span><i class="legend-dot mixed"></i>Комбинированный</span>
        </div>
        <div class="calendar-nav">
          <button class="btn icon" data-action="calendar-prev">‹</button>
          <button class="btn" data-action="calendar-today">Сегодня</button>
          <button class="btn icon" data-action="calendar-next">›</button>
        </div>
      </div>
      ${courses.length ? "" : `<div class="empty" style="margin:20px 42px">Сначала добавьте курс в разделе «Курсы» — у каждого курса своё расписание потоков.</div>`}
      <div class="figma-calendar-grid">
        ${["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"].map(day => `<div class="figma-calendar-weekday">${day}</div>`).join("")}
        ${cells.map(cell => {
          const events = cell.muted ? [] : visibleEvents.filter(event => Number(event.day) === cell.day);
          const isToday = !cell.muted && today.getDate() === cell.day && today.getMonth() === month && today.getFullYear() === year;
          return `
            <div class="figma-calendar-cell ${cell.muted ? "muted" : ""}">
              <div class="calendar-cell-num ${isToday ? "today" : ""}">${cell.day}</div>
              ${events.map(event => `
                <button class="figma-event ${streamTypeClass(event.type)}" data-action="edit-calendar-event" data-id="${escapeAttr(event.id)}">
                  <b>${escapeHtml(event.title)}</b>
                  <span>${escapeHtml(event.city || "")}</span>
                </button>
              `).join("")}
              ${!cell.muted && course ? `
                <button class="cell-add" data-action="add-calendar-event" data-day="${cell.day}" title="Добавить событие на ${cell.day} ${escapeAttr(monthLabel)}">+</button>
              ` : ""}
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function summaryHtml() {
  const pending = pendingItems();
  return `
    ${syncBannerHtml()}
    <section class="kpi-strip">
      ${summaryStats().map((item, index) => statCardHtml(item, index)).join("")}
    </section>
    <section class="command-grid">
      <div class="command-main">
        <div class="panel">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">Активность портала</h2>
              <p class="panel-sub">Публикации и общий объём контента по месяцам</p>
            </div>
            <div class="legend"><span><i class="dot black"></i>Опубликовано</span><span><i class="dot"></i>Всего</span></div>
          </div>
          ${chartHtml()}
        </div>
        <div class="panel">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">Курсы на портале</h2>
              <p class="panel-sub">То, что прямо сейчас видят посетители сайта</p>
            </div>
            <div class="toolbar">
              <button class="btn" data-action="add" data-page="courses">Добавить курс</button>
              <button class="btn black" data-action="navigate" data-page="training-courses">Все курсы</button>
            </div>
          </div>
          ${tableHtml("courses", state.courses.slice(0, 5))}
        </div>
      </div>
      <aside class="command-side">
        <div class="panel">
          <div class="panel-head"><h2 class="panel-title">Быстрые действия</h2></div>
          ${quickActionsHtml()}
        </div>
        <div class="panel">
          <div class="panel-head">
            <h2 class="panel-title">На модерации</h2>
            ${pending.length ? `<span class="count-badge">${pending.length}</span>` : `<span class="chip green">чисто</span>`}
          </div>
          <div class="approval-list">${approvalListHtml()}</div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2 class="panel-title">Разделы портала</h2></div>
          ${sectionHealthHtml()}
        </div>
      </aside>
    </section>
  `;
}

function syncBannerHtml() {
  const online = syncStatus.online;
  const saving = syncInFlight > 0;
  const stateClass = saving ? "saving" : online === true ? "online" : online === false ? "offline" : "";
  const statusText = saving
    ? "Сохранение на портал…"
    : online === true
      ? "Изменения уходят на портал автоматически"
      : online === false
        ? "Портал офлайн — изменения сохраняются локально"
        : "Проверяем связь с порталом…";
  const updated = syncStatus.lastSync ? formatTime(syncStatus.lastSync) : (state.updatedAt ? formatTime(state.updatedAt) : "—");
  const courses = state.courses.filter(course => course.published !== false).length;
  const hint = online === false
    ? (IS_LOCAL_PORTAL ? "запустите apps/portal (npm run dev)" : `портал ${PORTAL_HOST} не отвечает — проверьте деплой и Vercel Blob`)
    : PORTAL_HOST;
  return `
    <section class="sync-banner ${stateClass}" id="sync-banner">
      <div class="sync-banner-status">
        <span class="sync-dot"></span>
        <div>
          <div class="sync-banner-title">${escapeHtml(statusText)}</div>
          <div class="sync-banner-meta">${escapeHtml(hint)} · обновлено в ${escapeHtml(updated)} · ${courses} курсов на сайте</div>
        </div>
      </div>
      <div class="sync-banner-actions">
        <button class="btn" data-action="open-portal">Открыть портал ↗</button>
      </div>
    </section>
  `;
}

function quickActionsHtml() {
  const actions = [
    { iconKey: "courses", label: "Новый курс", attrs: `data-action="add" data-page="courses"` },
    { iconKey: "calendar", label: "Новый поток", attrs: `data-action="add-calendar-event" data-day="1"` },
    { iconKey: "journal", label: "Материал журнала", attrs: `data-action="add" data-page="journal"` },
    { iconKey: "heroes", label: "Добавить лидера", attrs: `data-action="add" data-page="people"` },
    { iconKey: "users-permissions", label: "Права доступа", attrs: `data-action="navigate" data-page="users-permissions"` },
    { iconKey: "settings", label: "Настройки", attrs: `data-action="navigate" data-page="settings"` },
  ];
  return `
    <div class="quick-actions">
      ${actions.map(action => `
        <button class="quick-action" ${action.attrs}>
          <span class="quick-action-icon">${iconSvg(action.iconKey)}</span>
          <span class="quick-action-label">${escapeHtml(action.label)}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function sectionHealthHtml() {
  const sections = [
    { key: "courses", page: "training-courses" },
    { key: "cities", page: "cities" },
    { key: "journal", page: "journal" },
    { key: "competitions", page: "competitions" },
    { key: "people", page: "heroes" },
    { key: "communities", page: "communities" },
    { key: "products", page: "products" },
    { key: "documents", page: "documents" },
  ];
  return `
    <div class="section-health">
      ${sections.map(({ key, page }) => {
        const items = state[key] || [];
        const total = items.length;
        const live = items.filter(item => item.published !== false && !["draft", "archived", "pending"].includes(item.status)).length;
        const config = RESOURCE_CONFIGS[key] || {};
        return `
          <button class="section-row" data-action="navigate" data-page="${escapeAttr(page)}">
            <span class="section-ico">${iconSvg(key) || escapeHtml(config.icon || "•")}</span>
            <span class="section-name">${escapeHtml(config.title || key)}</span>
            <span class="section-count"><b>${total}</b><i>${live} на сайте</i></span>
            <span class="section-arrow">→</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function statCardHtml(item, index = 0) {
  return `
    <button class="stat-card ${item.accent ? "accent" : ""}" style="--i:${index}" data-action="navigate" data-page="${escapeAttr(item.page)}" title="${escapeAttr(item.label)}">
      <span class="stat-top">
        <span class="stat-icon">${iconSvg(item.iconKey) || escapeHtml(item.icon)}</span>
        <span class="stat-arrow">↗</span>
      </span>
      <span class="stat-value">${escapeHtml(item.value)}</span>
      <span class="stat-label">${escapeHtml(item.label)}</span>
      ${item.sub ? `<span class="stat-sub">${escapeHtml(item.sub)}</span>` : ""}
    </button>
  `;
}

function summaryStats() {
  const admins = state.users.filter(user => user.role === "admin" || user.role === "super").length;
  const activeCourses = state.courses.filter(item => item.published !== false).length;
  const pending = pendingItems().length;
  const streams = (state.training?.calendarEvents || []).length;
  return [
    { icon: "К", iconKey: "courses", value: formatNumber(activeCourses), label: "Курсы на портале", sub: `${state.courses.length} всего`, page: "training-courses", accent: true },
    { icon: "П", iconKey: "users", value: formatNumber(state.users.length), label: "Пользователи", sub: `${admins} с правами`, page: "users-admins" },
    { icon: "Г", iconKey: "cities", value: formatNumber(state.cities.length), label: "Города", sub: "география сети", page: "cities" },
    { icon: "Ж", iconKey: "journal", value: formatNumber(state.journal.length), label: "Журнал", sub: "публикации", page: "journal" },
    { icon: "С", iconKey: "calendar", value: formatNumber(streams), label: "Потоки", sub: "в календаре", page: "training-calendar" },
    { icon: "З", iconKey: "pending", value: formatNumber(pending), label: "На модерации", sub: pending ? "нужна проверка" : "всё чисто", page: "training-courses" },
  ];
}

function chartHtml() {
  const data = MONTHS.map((month, index) => ({ month, published: monthPublished(index), total: monthTotal(index) }));
  const max = niceMax(Math.max(4, ...data.map(item => item.total)));
  const ticks = 4;
  const barArea = 158;
  const axis = Array.from({ length: ticks + 1 }, (_, k) => Math.round(max - (max / ticks) * k));
  return `
    <div class="chart">
      <div class="axis-y">${axis.map(value => `<span>${formatNumber(value)}</span>`).join("")}</div>
      <div class="bars-wrap">
        ${data.map(({ month, published, total }, index) => `
          <div class="month chart-month" tabindex="0" data-index="${index}" style="--i:${index}">
            <span class="bar-tip"><b>${escapeHtml(month)}</b>опубл. ${published} · всего ${total}</span>
            <span class="bar-pair">
              <span class="bar black" style="--target:${Math.max(3, (published / max) * barArea)}px"></span>
              <span class="bar" style="--target:${Math.max(3, (total / max) * barArea)}px"></span>
            </span>
            <span class="month-label">${month}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function niceMax(value) {
  if (value <= 5) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const step = pow / 2 || 1;
  return Math.ceil(value / step) * step;
}

function monthTotal(index) {
  const base = state.courses.length + state.journal.length + state.competitions.length;
  return Math.max(1, Math.round((base * ((index % 5) + 4)) / 4));
}

function monthPublished(index) {
  const published = state.courses.filter(item => item.published !== false).length + state.journal.filter(item => item.status !== "draft").length;
  return Math.max(1, Math.round((published * ((index % 4) + 3)) / 4));
}

function approvalListHtml() {
  const items = pendingItems().slice(0, 5);
  if (!items.length) {
    return `<div class="empty">Нет ожидающих элементов. Все разделы опубликованы.</div>`;
  }
  return items.map(({ key, item }) => `
    <div class="approval-item">
      ${imageHtml(item, key, "avatar")}
      <div>
        <div class="item-title">${escapeHtml(titleOf(item, key))}</div>
        <div class="item-subtitle">${escapeHtml(RESOURCE_CONFIGS[key]?.title || key)}</div>
      </div>
      <button class="chip amber" data-action="approve" data-page="${escapeAttr(key)}" data-id="${escapeAttr(item.id)}">Одобрить</button>
    </div>
  `).join("");
}

function pendingItems() {
  return Object.keys(RESOURCE_CONFIGS).flatMap(key => (state[key] || [])
    .filter(item => item.status === "pending" || item.published === false)
    .map(item => ({ key, item })));
}

function figmaCoursesHtml(items) {
  // Фильтр по городу-папке (из «Учебного центра») и переключаемая сортировка.
  let list = activeCityFolder ? items.filter(course => (course.city || "").trim() === activeCityFolder) : items;
  if (courseSort === "title") list = [...list].sort((a, b) => titleOf(a, "courses").localeCompare(titleOf(b, "courses"), "ru"));
  const heading = activeCityFolder ? `Курсы — ${activeCityFolder}` : "Курсы";
  const crumbs = activeCityFolder ? ["Учебный центр", activeCityFolder, "Курсы"] : ["Учебный центр", "Курсы"];
  return `
    <section class="content-panel courses-panel">
      ${figmaPanelTitleHtml(heading, "training-courses", `
        ${activeCityFolder ? `<button class="btn" data-action="clear-city-folder">Все города ×</button>` : ""}
        <button class="btn sort-btn" data-action="toggle-course-sort">${courseSort === "title" ? "По алфавиту" : "По дате добавления"} <span>⌄</span></button>
        <button class="btn black" data-action="add" data-page="courses">Создать курс</button>
      `)}
      ${figmaMetaBarHtml(crumbs)}
      <div class="course-list">
        ${list.length ? list.map(figmaCourseCardHtml).join("") : `<div class="empty">${activeCityFolder ? `В городе «${escapeHtml(activeCityFolder)}» пока нет курсов.` : "Пока нет курсов. Нажмите «Создать курс», чтобы добавить первый."}</div>`}
      </div>
    </section>
  `;
}

function figmaCourseCardHtml(course, index = 0) {
  const title = titleOf(course, "courses");
  const image = course.image || "/military-course.jpg";
  // Только реальные данные курса; там, где поля не заполнены — «—», а не
  // макетные числа: админ должен видеть фактическое состояние, не витрину.
  const newPrice = course.newPrice ? `${formatNumber(course.newPrice)} ₽` : "—";
  const oldPrice = course.oldPrice ? `${formatNumber(course.oldPrice)} ₽` : "";
  const status = course.published === false ? "Черновик" : (course.status === "pending" ? "Новая группа" : "Обучаются");
  const statusClass = course.published === false ? "orange" : (status === "Новая группа" ? "violet" : "blue");
  const events = state.training.courseCalendars?.[landingKey(title)] || [];
  const firstEvent = events.length ? [...events].sort((a, b) => (a.year - b.year) || (a.month - b.month) || (a.day - b.day))[0] : null;
  const startLabel = firstEvent ? `${firstEvent.day} ${MONTHS[Number(firstEvent.month)] || ""}` : "—";
  const categoryLabel = course.category === "professional" ? "Профессиональная подготовка" : "Военная подготовка";
  const stats = [
    ["Статус", status, statusClass],
    ["Старт потока", startLabel],
    ["Потоков в календаре", events.length || "—"],
    ["Город", course.city || "—"],
    ["Длительность", course.duration || "—"],
    ["Формат", course.format || "—"],
    ["Тип", course.type || "—"],
    ["Раздел", categoryLabel],
  ];
  return `
    <article class="course-card" style="--i:${index}">
      <div class="course-hero">
        <img src="${escapeAttr(portalAssetUrl(image))}" alt="${escapeAttr(title)}" data-fallback="${escapeAttr(title)}" />
        <button class="publish-pill ${course.published === false ? "" : "on"}" data-action="toggle-publish" data-page="courses" data-id="${escapeAttr(course.id)}">
          <span>Опубликован</span><i></i>
        </button>
      </div>
      <div class="course-main">
        <div class="course-title-row">
          <div>
            <h2>${escapeHtml(title)}</h2>
            <div class="course-prices"><span>${escapeHtml(newPrice)}</span>${oldPrice ? `<del>${escapeHtml(oldPrice)}</del>` : ""}</div>
          </div>
          <div class="course-card-actions">
            <button class="btn" data-action="duplicate" data-page="courses" data-id="${escapeAttr(course.id)}">Создать копию курса</button>
            <button class="btn danger" data-action="delete" data-page="courses" data-id="${escapeAttr(course.id)}">Удалить курс</button>
          </div>
        </div>
        <div class="course-control-line">
          <span class="course-tag">${iconSvg("training-courses")} ${escapeHtml(categoryLabel)}${course.description ? ` <i></i> ${escapeHtml(String(course.description).slice(0, 80))}` : ""}</span>
        </div>
        <div class="course-stat-grid">
          ${stats.map(([label, value, cls]) => `<div><span>${escapeHtml(label)}</span><b class="${cls || ""}">${escapeHtml(String(value))}</b></div>`).join("")}
        </div>
        <div class="course-manager">
          <div class="manager-profile">
            <img src="${escapeAttr(portalAssetUrl("/teacher2-main.jpg"))}" alt="" />
            <div><b>Tornado</b><span>Главный Инструктор</span></div>
          </div>
          <div class="manager-actions">
            <button class="btn" data-action="contact-manager">Связаться</button>
            <button class="btn" data-action="navigate" data-page="training-calendar">К расписанию занятий</button>
            <button class="btn" data-action="course-chat">Чат группы в телеграм</button>
          </div>
        </div>
        <div class="course-bottom-actions">
          <button class="btn blue-soft" data-action="edit" data-page="courses" data-id="${escapeAttr(course.id)}">Общие настройки курса</button>
          <button class="btn blue-soft" data-action="navigate" data-page="training-program">Обучение</button>
          <button class="btn blue-soft" data-action="navigate" data-page="training-landing">Редактировать Лендинг</button>
        </div>
      </div>
    </article>
  `;
}

function resourcePageHtml(key) {
  const dataKey = dataKeyForPage(key);
  const config = RESOURCE_CONFIGS[dataKey];
  if (!config) return `<div class="empty">Раздел не найден.</div>`;
  const items = filteredItems(dataKey);
  if (dataKey === "courses") return figmaCoursesHtml(items);

  return `
    <section class="content-panel">
      <div class="filters">
        <input class="field" value="${escapeAttr(filters.q)}" data-action="search" placeholder="Поиск по разделу" />
        <select class="select" data-action="set-status-filter">${filterOptionsHtml()}</select>
        <button class="btn" data-action="add" data-page="${escapeAttr(dataKey)}">Добавить</button>
        <button class="btn black" data-action="export" data-page="${escapeAttr(dataKey)}">Экспорт</button>
      </div>
      ${tableHtml(dataKey, items)}
    </section>
  `;
}

function dataKeyForPage(page) {
  return PAGE_ALIASES[page] || page;
}

/* ── Студийный inline-редактор раздела (как у лендинга) ────────────────── */
function studioHtml(page) {
  const dataKey = dataKeyForPage(page);
  const config = RESOURCE_CONFIGS[dataKey];
  if (!config) return `<div class="empty">Раздел не найден.</div>`;
  const items = filteredItems(dataKey);
  const all = state[dataKey] || [];
  let active = items.find(item => String(item.id) === String(activeRecordId[dataKey]))
    || items[0]
    || all.find(item => String(item.id) === String(activeRecordId[dataKey]));
  if (active) activeRecordId[dataKey] = active.id;

  return `
    <section class="studio">
      <aside class="studio-list">
        <div class="studio-list-head">
          <input class="field" value="${escapeAttr(filters.q)}" data-action="search" placeholder="Поиск" />
          <button class="btn black studio-add" data-action="inline-add" data-page="${escapeAttr(dataKey)}" title="Добавить">+</button>
        </div>
        <div class="studio-list-meta">
          <span>${all.length} в разделе</span>
          <select class="select studio-filter" data-action="set-status-filter">${filterOptionsHtml()}</select>
        </div>
        <div class="studio-items">
          ${items.length ? items.map(item => studioListItemHtml(item, dataKey, active)).join("") : `<div class="empty">Ничего не найдено.</div>`}
        </div>
      </aside>
      <div class="studio-editor">
        ${active ? studioEditorHtml(active, dataKey, config) : `<div class="empty">В разделе пока нет элементов. Нажмите «+», чтобы создать первый.</div>`}
      </div>
    </section>
  `;
}

function studioListItemHtml(item, dataKey, active) {
  const isActive = active && String(item.id) === String(active.id);
  const status = statusOf(item);
  return `
    <button class="studio-item ${isActive ? "active" : ""}" data-action="inline-select" data-page="${escapeAttr(dataKey)}" data-id="${escapeAttr(item.id)}">
      ${imageHtml(item, dataKey, "thumb square")}
      <span class="studio-item-main">
        <span class="studio-item-title">${escapeHtml(titleOf(item, dataKey))}</span>
        <span class="studio-item-sub">${escapeHtml(subtitleOf(item, dataKey) || "—")}</span>
      </span>
      <span class="dot-status ${chipClass(status)}" title="${escapeHtml(STATUS_LABELS[status] || status)}"></span>
    </button>
  `;
}

function studioEditorHtml(item, dataKey, config) {
  const route = routeOf(item, dataKey);
  const status = statusOf(item);
  return `
    <div class="studio-editor-head">
      <div class="studio-editor-title">
        ${imageHtml(item, dataKey, "thumb square big")}
        <div class="studio-editor-titletext">
          <div class="studio-eyebrow">${escapeHtml(config.title)} · <span class="chip ${chipClass(status)}">${escapeHtml(STATUS_LABELS[status] || status)}</span></div>
          <h2>${escapeHtml(titleOf(item, dataKey))}</h2>
        </div>
      </div>
      <div class="toolbar">
        ${route ? `<button class="btn" data-action="preview" data-route="${escapeAttr(route)}">На портале ↗</button>` : ""}
        <button class="btn" data-action="duplicate" data-page="${escapeAttr(dataKey)}" data-id="${escapeAttr(item.id)}">Дублировать</button>
        <button class="btn danger" data-action="delete" data-page="${escapeAttr(dataKey)}" data-id="${escapeAttr(item.id)}">Удалить</button>
      </div>
    </div>
    ${config.imageField ? studioImageHtml(item, config, dataKey) : ""}
    <div class="studio-form form-grid">
      ${config.fields.map(field => studioFieldHtml(field, item, dataKey)).join("")}
    </div>
    ${(RESOURCE_LISTS[dataKey] || []).map(def => studioListFieldHtml(def, item, dataKey)).join("")}
    <div class="studio-foot">
      <span class="studio-saved"><span class="sync-dot online"></span>Правки сохраняются автоматически и уходят на портал</span>
      <button class="btn black" data-action="save">Синхронизировать сейчас</button>
    </div>
  `;
}

function studioImageHtml(item, config, dataKey) {
  const src = item[config.imageField];
  const inputId = `image-${dataKey}-${item.id}`;
  const target = { mode: "inline", page: dataKey, id: item.id, field: config.imageField, previewId: `${inputId}-preview`, inputId };
  return `
    <div class="studio-image">
      <div class="studio-image-preview" id="${inputId}-preview">
        ${src ? `<img src="${escapeAttr(portalAssetUrl(src))}" alt="" data-fallback="${escapeAttr(titleOf(item, dataKey))}" />` : `<span>Нет фото</span>`}
      </div>
      <div class="studio-image-field">
        <label>Ссылка на фото</label>
        <div class="image-field-row">
          <input class="field" id="${inputId}" data-action="inline-field" data-page="${escapeAttr(dataKey)}" data-id="${escapeAttr(item.id)}" data-field="${escapeAttr(config.imageField)}" data-type="text" value="${escapeAttr(src ?? "")}" placeholder="/photo.jpg или https://…" />
          <button type="button" class="btn small" data-action="open-image-picker" data-target="${escapeAttr(JSON.stringify(target))}">Выбрать фото</button>
        </div>
      </div>
    </div>
  `;
}

function studioFieldHtml(field, item, dataKey) {
  const value = item?.[field.key];
  const full = field.type === "textarea" || ["description", "text", "meta", "subtitle"].includes(field.key);
  const attrs = `data-action="inline-field" data-page="${escapeAttr(dataKey)}" data-id="${escapeAttr(item.id)}" data-field="${escapeAttr(field.key)}" data-type="${escapeAttr(field.type || "text")}"`;
  let input = "";
  if (field.type === "textarea") {
    input = `<textarea class="field" ${attrs}>${escapeHtml(value || "")}</textarea>`;
  } else if (field.type === "select") {
    input = `<select class="select" ${attrs}>${(field.options || []).map(([key, label]) => `<option value="${escapeAttr(key)}" ${String(value ?? "") === String(key) ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select>`;
  } else if (field.type === "checkbox") {
    input = `<select class="select" ${attrs}><option value="true" ${value !== false ? "selected" : ""}>Опубликован</option><option value="false" ${value === false ? "selected" : ""}>Скрыт</option></select>`;
  } else {
    input = `<input class="field" type="${field.type === "number" ? "number" : "text"}" ${attrs} value="${escapeAttr(value ?? "")}" />`;
  }
  return `<div class="form-row ${full ? "full" : ""}"><label>${escapeHtml(field.label)}</label>${input}</div>`;
}

function studioListFieldHtml(def, item, dataKey) {
  const values = Array.isArray(item[def.key]) ? item[def.key] : [];
  return `
    <div class="studio-listfield">
      <div class="section-kicker">${escapeHtml(def.label)}</div>
      <div class="studio-list-rows">
        ${values.length ? values.map((value, index) => `
          <div class="topic-row">
            <span class="chip">${index + 1}</span>
            <input class="field" data-action="inline-list-input" data-page="${escapeAttr(dataKey)}" data-id="${escapeAttr(item.id)}" data-list="${escapeAttr(def.key)}" data-index="${index}" value="${escapeAttr(value)}" placeholder="${escapeAttr(def.placeholder || "")}" />
            <button class="btn small danger" data-action="inline-list-delete" data-page="${escapeAttr(dataKey)}" data-id="${escapeAttr(item.id)}" data-list="${escapeAttr(def.key)}" data-index="${index}">Удалить</button>
          </div>
        `).join("") : `<div class="studio-list-empty">Пока пусто</div>`}
      </div>
      <button class="btn small" data-action="inline-list-add" data-page="${escapeAttr(dataKey)}" data-id="${escapeAttr(item.id)}" data-list="${escapeAttr(def.key)}" data-placeholder="${escapeAttr(def.placeholder || "")}">+ ${escapeHtml(def.addLabel || "Добавить")}</button>
    </div>
  `;
}

function inlineListArray(dataKey, id, list) {
  const item = findItem(dataKey, id);
  if (!item || !list) return null;
  if (!Array.isArray(item[list])) item[list] = [];
  return item;
}

function updateInlineListItem(dataKey, id, list, index, value) {
  const item = inlineListArray(dataKey, id, list);
  if (!item || !Number.isFinite(index)) return;
  item[list][index] = value;
  saveState({ silent: true });
}

function addInlineListItem(dataKey, id, list, placeholder) {
  const item = inlineListArray(dataKey, id, list);
  if (!item) return;
  item[list].push(placeholder || "Новый пункт");
  saveState({ silent: true });
  render();
}

function deleteInlineListItem(dataKey, id, list, index) {
  const item = inlineListArray(dataKey, id, list);
  if (!item) return;
  item[list] = item[list].filter((_, itemIndex) => itemIndex !== index);
  saveState({ silent: true });
  render();
}

function addInlineRecord(dataKey) {
  const config = RESOURCE_CONFIGS[dataKey];
  if (!config) return;
  const item = defaultItem(dataKey);
  item.id = nextId(state[dataKey] || []);
  state[dataKey] = state[dataKey] || [];
  state[dataKey].unshift(item);
  activeRecordId[dataKey] = item.id;
  filters.q = "";
  saveState({ silent: true });
  render();
  toast("Добавлено", `Новый элемент в разделе «${config.title}» — заполните поля справа.`);
}

function updateInlineField(dataKey, id, field, rawValue, type) {
  const item = findItem(dataKey, id);
  if (!item || !field) return;
  let value = rawValue;
  if (type === "number") value = rawValue === "" ? "" : Number(rawValue);
  else if (type === "checkbox") value = rawValue === "true";
  item[field] = value;
  saveState({ silent: true });
  // Перерисовываем только если правка влияет на список/заголовок/статус
  const titleField = RESOURCE_CONFIGS[dataKey]?.titleField;
  if (field === titleField || field === "title" || field === "name" || field === "status" || field === "published") {
    render();
  }
}

function filteredItems(key) {
  const q = normalizeText(filters.q);
  const status = filters.status;
  return (state[key] || []).filter(item => {
    const text = normalizeText(JSON.stringify(item));
    const itemStatusValue = statusOf(item);
    const matchesText = !q || text.includes(q);
    const matchesStatus = status === "all" || itemStatusValue === status || (status === "hidden" && item.published === false);
    return matchesText && matchesStatus;
  });
}

function filterOptionsHtml() {
  const options = [["all", "Все статусы"], ["published", "Опубликовано"], ["pending", "На проверке"], ["draft", "Черновик"], ["hidden", "Скрыто"], ["archived", "В архиве"]];
  return options.map(([value, label]) => `<option value="${value}" ${filters.status === value ? "selected" : ""}>${label}</option>`).join("");
}

function trainingHomeHtml() {
  ensureActiveCalendar();
  return `
    <section class="module-grid">
      ${TRAINING_TILES.map((tile, index) => `
        <button class="module-card" style="--i:${index}" data-action="navigate" data-page="${escapeAttr(tile.key)}">
          <span class="module-icon">${iconSvg(tile.key) || escapeHtml(tile.icon)}</span>
          <span class="module-title">${escapeHtml(tile.title)}</span>
          <span class="module-text">${escapeHtml(tile.text)}</span>
          <span class="module-arrow">↗</span>
        </button>
      `).join("")}
    </section>
    <section class="summary-panels" style="margin-top:28px">
      <div class="content-panel">
        <div class="panel-head">
          <h2 class="panel-title">Последние курсы</h2>
          <button class="btn black" data-action="navigate" data-page="training-courses">Открыть каталог</button>
        </div>
        ${tableHtml("courses", state.courses.slice(0, 4))}
      </div>
      <div class="panel">
        <div class="panel-head">
          <h2 class="panel-title">Ближайшие потоки</h2>
          <button class="btn small" data-action="calendar-today">Сегодня</button>
        </div>
        <div class="approval-list">
          ${state.training.calendarEvents.slice(0, 5).map(event => `
            <div class="approval-item">
              <span class="avatar">${event.day}</span>
              <div>
                <div class="item-title">${escapeHtml(event.title)}</div>
                <div class="item-subtitle">${escapeHtml([event.city, event.type].filter(Boolean).join(" · "))}</div>
              </div>
              <button class="chip ${chipClass(event.status || "published")}" data-action="edit-calendar-event" data-id="${escapeAttr(event.id)}">${escapeHtml(STATUS_LABELS[event.status || "published"] || "Опубликовано")}</button>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function trainingCalendarHtml() {
  const course = ensureActiveCalendar();
  const courses = landingCourseList();
  const monthDate = new Date();
  monthDate.setMonth(monthDate.getMonth() + Number(state.training.calendarCursor || 0));
  monthDate.setDate(1);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const monthLabel = monthDate.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [
    ...Array.from({ length: firstOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const visibleEvents = state.training.calendarEvents.filter(event => Number(event.month) === month && Number(event.year) === year);
  return `
    <section class="content-panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">${escapeHtml(monthLabel)}</h2>
          <p class="panel-sub">Своё расписание для каждого курса — показывается в блоке «Расписание занятий» на его странице.</p>
        </div>
        <div class="toolbar">
          <button class="btn icon" data-action="calendar-prev" title="Предыдущий месяц">‹</button>
          <button class="btn" data-action="calendar-today">Сегодня</button>
          <button class="btn icon" data-action="calendar-next" title="Следующий месяц">›</button>
          <button class="btn black" data-action="add-calendar-event" data-day="1">Добавить поток</button>
        </div>
      </div>
      ${calendarCourseSelectorHtml(course, courses)}
      <div class="stream-calendar-meta">
        <span>${visibleEvents.length} событий в этом месяце</span>
        <span>${course ? `Расписание курса «${escapeHtml(course.title || course.name)}»` : "Общее расписание"}</span>
      </div>
      <div class="calendar-layout">
        <div class="calendar-grid">
          ${["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"].map(day => `<div class="calendar-weekday">${day}</div>`).join("")}
          ${cells.map(day => {
            if (!day) return `<div class="calendar-day muted"></div>`;
            const events = visibleEvents.filter(event => Number(event.day) === day);
            return `
              <button class="calendar-day ${events.length ? "has-events" : ""}" data-action="add-calendar-event" data-day="${day}">
                <span class="calendar-number">${day}</span>
                ${events.map(event => `
                  <span class="calendar-event ${streamTypeClass(event.type)}" data-action="edit-calendar-event" data-id="${escapeAttr(event.id)}" onclick="event.stopPropagation()">
                    <b>${escapeHtml(event.timeStart || "10:00")}</b>${escapeHtml(event.title)}
                  </span>
                `).join("")}
              </button>
            `;
          }).join("")}
        </div>
        <aside class="calendar-agenda">
          <div class="calendar-agenda-head">
            <h3>Потоки этого месяца</h3>
            <span class="calendar-agenda-count">${visibleEvents.length}</span>
          </div>
          ${visibleEvents.length ? `
            <div class="calendar-agenda-list">
              ${[...visibleEvents].sort((a, b) => Number(a.day) - Number(b.day)).map(event => `
                <button class="calendar-agenda-item ${streamTypeClass(event.type)}" data-action="edit-calendar-event" data-id="${escapeAttr(event.id)}">
                  <span class="calendar-agenda-day">${event.day}</span>
                  <span class="calendar-agenda-body">
                    <span class="calendar-agenda-title">${escapeHtml(event.title)}</span>
                    <span class="calendar-agenda-sub">${escapeHtml([event.timeStart, event.city, event.type].filter(Boolean).join(" · "))}</span>
                  </span>
                  <span class="calendar-agenda-del" data-action="delete-calendar-event" data-id="${escapeAttr(event.id)}" onclick="event.stopPropagation()" title="Удалить">✕</span>
                </button>
              `).join("")}
            </div>
          ` : `
            <div class="calendar-agenda-empty">
              <p>В этом месяце пока нет потоков для этого курса.</p>
              <button class="btn black" data-action="add-calendar-event" data-day="1">Добавить поток</button>
            </div>
          `}
        </aside>
      </div>
    </section>
  `;
}

function landingKey(value) {
  return String(value || "").trim().toLowerCase();
}

function landingCourseList() {
  return (state.courses || []).filter(course => course && (course.title || course.name));
}

// Возвращает выбранный курс и наводит state.training.courseLanding на ЕГО лендинг
// (живой указатель — все обработчики лендинга работают с этим курсом).
function ensureActiveLanding() {
  if (!state.training.courseLandings || typeof state.training.courseLandings !== "object") {
    state.training.courseLandings = {};
  }
  const courses = landingCourseList();
  if (!courses.length) {
    state.training.courseLanding = deepMerge(defaultCourseLanding(), state.training.courseLanding || {});
    return null;
  }
  const course = courses.find(item => String(item.id) === String(activeLandingCourseId)) || courses[0];
  activeLandingCourseId = course.id;
  const key = landingKey(course.title || course.name);
  if (!state.training.courseLandings[key]) {
    const base = deepMerge(defaultCourseLanding(), {});
    base.heroTitle = course.title || course.name;
    if (course.description) base.heroSubtitle = course.description;
    if (course.image) base.heroImage = course.image;
    base.heroBadge = course.category === "professional" ? "профессиональная подготовка" : "военная подготовка";
    state.training.courseLandings[key] = base;
  }
  state.training.courseLanding = state.training.courseLandings[key];
  return course;
}

// Аналогично — расписание (потоки) по курсам. Наводит state.training.calendarEvents
// на массив выбранного курса, чтобы существующие обработчики работали с ним.
function ensureActiveCalendar() {
  if (!state.training.courseCalendars || typeof state.training.courseCalendars !== "object") {
    state.training.courseCalendars = {};
  }
  const courses = landingCourseList();
  if (!courses.length) return null;
  const course = courses.find(item => String(item.id) === String(activeCalendarCourseId)) || courses[0];
  activeCalendarCourseId = course.id;
  const key = landingKey(course.title || course.name);
  if (!Array.isArray(state.training.courseCalendars[key])) {
    // Новый курс начинает с пустого расписания — у каждого курса свои потоки,
    // данные другого (в т.ч. ранее активного) курса сюда не копируются.
    state.training.courseCalendars[key] = [];
  }
  state.training.calendarEvents = state.training.courseCalendars[key];
  return course;
}

function calendarCourseSelectorHtml(course, courses) {
  const previewRoute = course ? `/courses/${encodeURIComponent(course.title || course.name)}` : "/courses";
  const selector = courses.length
    ? `<select class="select landing-course-select" data-action="select-calendar-course">
        ${courses.map(item => `<option value="${escapeAttr(item.id)}" ${String(item.id) === String(activeCalendarCourseId) ? "selected" : ""}>${escapeHtml(item.title || item.name)}${item.category === "professional" ? " · проф." : ""}</option>`).join("")}
      </select>`
    : `<span class="landing-empty-hint">Сначала добавьте курс в разделе «Курсы»</span>`;
  return `
    <div class="landing-course-bar">
      <span class="landing-course-label">Расписание курса:</span>
      ${selector}
      ${course ? `<button class="btn small" data-action="preview" data-route="${escapeAttr(previewRoute)}">На портале ↗</button>` : ""}
    </div>
  `;
}

function trainingLandingHtml() {
  const course = ensureActiveLanding();
  const landing = state.training.courseLanding;
  const courses = landingCourseList();
  const previewRoute = course ? `/courses/${encodeURIComponent(course.title || course.name)}` : "/courses";
  const selector = courses.length
    ? `<select class="select landing-course-select" data-action="select-landing-course">
        ${courses.map(item => `<option value="${escapeAttr(item.id)}" ${String(item.id) === String(activeLandingCourseId) ? "selected" : ""}>${escapeHtml(item.title || item.name)}${item.category === "professional" ? " · проф." : ""}</option>`).join("")}
      </select>`
    : `<span class="landing-empty-hint">Сначала добавьте курс в разделе «Курсы»</span>`;
  return `
    <section class="content-panel landing-editor">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Лендинг курса</h2>
          <p class="panel-sub">Свой лендинг для каждого курса. Выберите курс — правки уйдут именно на его страницу.</p>
        </div>
        <div class="toolbar">
          ${course ? `<button class="btn" data-action="preview" data-route="${escapeAttr(previewRoute)}">Открыть на портале ↗</button>` : ""}
          <button class="btn black" data-action="save-landing">Сохранить лендинг</button>
        </div>
      </div>
      <div class="landing-course-bar">
        <span class="landing-course-label">Курс:</span>
        ${selector}
      </div>
      <div class="landing-grid">
        <div class="landing-section wide">
          <div class="section-kicker">Главный экран</div>
          <div class="form-grid">
            <div class="form-row"><label>Заголовок</label><input class="field" data-action="landing-field" data-field="heroTitle" value="${escapeAttr(landing.heroTitle)}" /></div>
            <div class="form-row"><label>Метка</label><input class="field" data-action="landing-field" data-field="heroBadge" value="${escapeAttr(landing.heroBadge)}" /></div>
            <div class="form-row full"><label>Описание</label><textarea class="field" data-action="landing-field" data-field="heroSubtitle">${escapeHtml(landing.heroSubtitle)}</textarea></div>
            ${landingImageFieldHtml("heroImage", "Фото главного экрана", landing.heroImage)}
            <div class="form-row"><label>Подпись старта</label><input class="field" data-action="landing-field" data-field="startText" value="${escapeAttr(landing.startText)}" /></div>
          </div>
        </div>
        ${landingListEditorHtml("benefits", "Преимущества курса", "Новое преимущество")}
        ${landingListEditorHtml("requirements", "Требования к курсантам", "Новое требование")}
        ${landingPhotosHtml()}
        <div class="landing-section wide">
          <div class="section-kicker">Программа курса</div>
          <div class="form-row full"><label>Вводный текст</label><textarea class="field" data-action="landing-field" data-field="programIntro">${escapeHtml(landing.programIntro)}</textarea></div>
          <div class="program-list compact">
            ${(landing.programGroups || []).map((group, groupIndex) => `
              <div class="program-section" style="--i:${groupIndex}">
                <div class="panel-head">
                  <input class="builder-input" data-action="landing-program-title" data-index="${groupIndex}" value="${escapeAttr(group.title)}" />
                  <div class="toolbar">
                    <button class="btn small" data-action="landing-program-add-item" data-index="${groupIndex}">Добавить тему</button>
                    <button class="btn small danger" data-action="landing-program-delete-group" data-index="${groupIndex}">Удалить раздел</button>
                  </div>
                </div>
                <div class="topic-list">
                  ${(group.items || []).map((item, itemIndex) => `
                    <div class="topic-row">
                      <span class="chip">${itemIndex + 1}</span>
                      <input class="field" data-action="landing-program-item" data-index="${groupIndex}" data-item="${itemIndex}" value="${escapeAttr(item)}" />
                      <button class="btn small danger" data-action="landing-program-delete-item" data-index="${groupIndex}" data-item="${itemIndex}">Удалить</button>
                    </div>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>
          <button class="btn" data-action="landing-program-add-group">Добавить раздел программы</button>
        </div>
        ${landingListEditorHtml("equipment", "Экипировка", "Новая рекомендация")}
        <div class="landing-section">
          <div class="section-kicker">Результаты</div>
          <textarea class="field" data-action="landing-field" data-field="resultsText">${escapeHtml(landing.resultsText)}</textarea>
        </div>
        <div class="landing-section">
          <div class="section-kicker">Карта и отзывы</div>
          <div class="form-row"><label>Заголовок карты</label><input class="field" data-action="landing-field" data-field="mapTitle" value="${escapeAttr(landing.mapTitle)}" /></div>
          <div class="form-row"><label>Адрес</label><input class="field" data-action="landing-field" data-field="mapSubtitle" value="${escapeAttr(landing.mapSubtitle)}" /></div>
          <div class="form-row"><label>Заголовок отзывов</label><input class="field" data-action="landing-field" data-field="reviewsTitle" value="${escapeAttr(landing.reviewsTitle)}" /></div>
        </div>
        <div class="landing-section wide">
          <div class="section-kicker">Цена и места</div>
          <div class="form-grid">
            <div class="form-row"><label>Цена курса, ₽</label><input class="field" type="number" data-action="landing-field" data-field="price" value="${escapeAttr(landing.price ?? "")}" /></div>
            <div class="form-row"><label>Свободно мест</label><input class="field" type="number" data-action="landing-field" data-field="seatsFree" value="${escapeAttr(landing.seatsFree ?? "")}" /></div>
            <div class="form-row"><label>Всего мест</label><input class="field" type="number" data-action="landing-field" data-field="seatsTotal" value="${escapeAttr(landing.seatsTotal ?? "")}" /></div>
          </div>
        </div>
        <div class="landing-section wide">
          <div class="section-kicker">Наставник курса</div>
          <div class="form-grid">
            <div class="form-row"><label>Имя / позывной</label><input class="field" data-action="landing-field" data-field="instructorName" value="${escapeAttr(landing.instructorName ?? "")}" /></div>
            <div class="form-row"><label>Звание</label><input class="field" data-action="landing-field" data-field="instructorRank" value="${escapeAttr(landing.instructorRank ?? "")}" /></div>
            <div class="form-row"><label>Должность</label><input class="field" data-action="landing-field" data-field="instructorRole" value="${escapeAttr(landing.instructorRole ?? "")}" /></div>
            ${landingImageFieldHtml("instructorImage", "Фото наставника", landing.instructorImage)}
            <div class="form-row"><label>Опыт</label><input class="field" data-action="landing-field" data-field="instructorExp" value="${escapeAttr(landing.instructorExp ?? "")}" /></div>
            <div class="form-row"><label>Бойцов обучено</label><input class="field" data-action="landing-field" data-field="instructorTrained" value="${escapeAttr(landing.instructorTrained ?? "")}" /></div>
            <div class="form-row"><label>Курсов проведено</label><input class="field" data-action="landing-field" data-field="instructorCourses" value="${escapeAttr(landing.instructorCourses ?? "")}" /></div>
          </div>
        </div>
        <div class="landing-section">
          <div class="section-kicker">Видео-презентация</div>
          <div class="form-row"><label>Заголовок блока</label><input class="field" data-action="landing-field" data-field="videoTitle" value="${escapeAttr(landing.videoTitle ?? "")}" /></div>
          <div class="form-row"><label>Ссылка на видео</label><input class="field" data-action="landing-field" data-field="videoUrl" value="${escapeAttr(landing.videoUrl ?? "")}" /></div>
          ${landingImageFieldHtml("videoPoster", "Постер (превью)", landing.videoPoster)}
        </div>
        <div class="landing-section">
          <div class="section-kicker">Статистика в шапке</div>
          <div class="form-row"><label>Прошло обучение</label><input class="field" data-action="landing-field" data-field="studentsCount" value="${escapeAttr(landing.studentsCount ?? "")}" /></div>
          <div class="form-row"><label>Рейтинг</label><input class="field" data-action="landing-field" data-field="rating" value="${escapeAttr(landing.rating ?? "")}" /></div>
          <div class="form-row"><label>Количество отзывов</label><input class="field" data-action="landing-field" data-field="reviewsCount" value="${escapeAttr(landing.reviewsCount ?? "")}" /></div>
        </div>
        <div class="landing-section wide">
          <div class="section-kicker">Структура блоков</div>
          <div class="builder-list">
            ${state.training.landingBlocks.map((block, index) => `
              <div class="builder-card compact" style="--i:${index}">
                <div class="builder-drag">⋮⋮</div>
                <div class="builder-main">
                  <input class="builder-input" data-action="landing-input" data-id="${escapeAttr(block.id)}" data-field="title" value="${escapeAttr(block.title)}" />
                  <textarea class="builder-textarea" data-action="landing-input" data-id="${escapeAttr(block.id)}" data-field="text">${escapeHtml(block.text)}</textarea>
                </div>
                <div class="row-actions">
                  <button class="btn small" data-action="landing-move" data-id="${escapeAttr(block.id)}" data-dir="-1">↑</button>
                  <button class="btn small" data-action="landing-move" data-id="${escapeAttr(block.id)}" data-dir="1">↓</button>
                  <button class="btn small" data-action="landing-toggle" data-id="${escapeAttr(block.id)}">${block.visible === false ? "Показать" : "Скрыть"}</button>
                  <button class="btn small danger" data-action="landing-delete" data-id="${escapeAttr(block.id)}">Удалить</button>
                </div>
              </div>
            `).join("")}
          </div>
          <div class="toolbar"><button class="btn" data-action="landing-add-block">Добавить блок</button></div>
        </div>
      </div>
    </section>
  `;
}

function landingListEditorHtml(key, title, placeholder) {
  const listItems = state.training.courseLanding[key] || [];
  return `
    <div class="landing-section">
      <div class="section-kicker">${escapeHtml(title)}</div>
      <div class="landing-list">
        ${listItems.map((item, index) => `
          <div class="topic-row">
            <span class="chip">${index + 1}</span>
            <input class="field" data-action="landing-list-input" data-list="${escapeAttr(key)}" data-index="${index}" value="${escapeAttr(item)}" />
            <button class="btn small danger" data-action="landing-list-delete" data-list="${escapeAttr(key)}" data-index="${index}">Удалить</button>
          </div>
        `).join("")}
      </div>
      <button class="btn small" data-action="landing-list-add" data-list="${escapeAttr(key)}" data-placeholder="${escapeAttr(placeholder)}">Добавить</button>
    </div>
  `;
}

function landingPhotosHtml() {
  const photos = state.training.courseLanding.photos || [];
  return `
    <div class="landing-section wide">
      <div class="section-kicker">Фотографии с курса</div>
      <div class="photo-editor-grid">
        ${photos.map((src, index) => {
          const inputId = `photo-${index}`;
          const target = { mode: "landing-list", list: "photos", index, previewId: `${inputId}-preview`, inputId };
          return `
          <div class="photo-editor-card">
            <div class="photo-preview" id="${inputId}-preview">${src ? `<img src="${escapeAttr(portalAssetUrl(src))}" alt="" data-fallback="Ф" />` : `<span>Фото</span>`}</div>
            <input class="field" id="${inputId}" data-action="landing-list-input" data-list="photos" data-index="${index}" value="${escapeAttr(src)}" />
            <div class="toolbar">
              <button type="button" class="btn small" data-action="open-image-picker" data-target="${escapeAttr(JSON.stringify(target))}">Выбрать</button>
              <button class="btn small danger" data-action="landing-list-delete" data-list="photos" data-index="${index}">Удалить</button>
            </div>
          </div>
        `;
        }).join("")}
      </div>
      <button class="btn small" data-action="landing-list-add" data-list="photos" data-placeholder="/новое-фото.png">Добавить фото</button>
    </div>
  `;
}

function landingImageFieldHtml(field, label, value) {
  const inputId = `landing-${field}`;
  const target = { mode: "landing-field", field, previewId: `${inputId}-preview`, inputId };
  return `
    <div class="form-row full">
      <label for="${inputId}">${escapeHtml(label)}</label>
      <div class="image-field">
        <div class="image-field-preview" id="${inputId}-preview">
          ${value ? `<img src="${escapeAttr(portalAssetUrl(value))}" alt="" data-fallback="Ф" />` : `<span>Нет фото</span>`}
        </div>
        <div class="image-field-row">
          <input class="field" id="${inputId}" data-action="landing-field" data-field="${escapeAttr(field)}" value="${escapeAttr(value ?? "")}" placeholder="/photo.jpg или https://…" />
          <button type="button" class="btn small" data-action="open-image-picker" data-target="${escapeAttr(JSON.stringify(target))}">Выбрать фото</button>
        </div>
      </div>
    </div>
  `;
}

function trainingProgramHtml() {
  const course = ensureActiveLanding();
  syncProgramSectionsFromLandingProgram();
  const courses = landingCourseList();
  const selector = courses.length
    ? `<select class="select landing-course-select" data-action="select-landing-course">
        ${courses.map(item => `<option value="${escapeAttr(item.id)}" ${String(item.id) === String(activeLandingCourseId) ? "selected" : ""}>${escapeHtml(item.title || item.name)}${item.category === "professional" ? " · проф." : ""}</option>`).join("")}
      </select>`
    : `<span class="landing-empty-hint">Сначала добавьте курс в разделе «Курсы»</span>`;
  return `
    <section class="content-panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Программа занятий</h2>
          <p class="panel-sub">Своя программа для каждого курса. Выберите курс — правки уйдут именно в его программу.</p>
        </div>
        <div class="toolbar">
          <button class="btn" data-action="program-add-section">Добавить раздел</button>
          <button class="btn black" data-action="save-program">Сохранить программу</button>
        </div>
      </div>
      <div class="landing-course-bar">
        <span class="landing-course-label">Курс:</span>
        ${selector}
      </div>
      <div class="program-list">
        ${state.training.programSections.map((section, sectionIndex) => `
          <div class="program-section" style="--i:${sectionIndex}">
            <div class="panel-head">
              <input class="builder-input" data-action="program-section-input" data-id="${escapeAttr(section.id)}" value="${escapeAttr(section.title)}" />
              <div class="toolbar">
                <button class="btn small" data-action="program-add-topic" data-id="${escapeAttr(section.id)}">+ тема</button>
                <button class="btn small danger" data-action="program-delete-section" data-id="${escapeAttr(section.id)}">Удалить</button>
              </div>
            </div>
            <div class="topic-list">
              ${(section.topics || []).map((topic, topicIndex) => `
                <div class="topic-row">
                  <span class="chip">${topicIndex + 1}</span>
                  <input class="field" data-action="program-topic-input" data-id="${escapeAttr(section.id)}" data-index="${topicIndex}" value="${escapeAttr(topic)}" />
                  <button class="btn small danger" data-action="program-delete-topic" data-id="${escapeAttr(section.id)}" data-index="${topicIndex}">Удалить</button>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function figmaUsersTableHtml(kind) {
  const users = filteredUsers(kind);
  const title = kind === "admins" ? "Администраторы" : "Участники";
  return `
    <section class="content-panel users-panel">
      ${figmaPanelTitleHtml(title, "users", `
        <button class="btn blue-soft" data-action="navigate" data-page="users-permissions">${iconSvg("edit")} Настройка прав</button>
        <button class="btn black" data-action="add" data-page="users">+ Добавить</button>
      `)}
      <div class="users-toolbar">
        ${figmaBreadcrumbHtml(["Пользователи", title])}
        <div class="users-tools">
          <label class="table-search">${iconSvg("search")}<input value="${escapeAttr(filters.q)}" data-action="search" placeholder="Поиск по таблице" /></label>
          <select class="select filter-select" data-action="set-status-filter">
            <option value="all" ${filters.status === "all" ? "selected" : ""}>Фильтр</option>
            ${roleOptions().map(([role, label]) => `<option value="${role}" ${filters.status === role ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="figma-table-wrap">
        <table class="figma-table users-table">
          <thead>
            <tr>
              <th>ID <span>↕</span></th>
              <th>Имя и позывной <span>↕</span></th>
              <th>Роль <span>↕</span></th>
              <th>Телефон <span>↕</span></th>
              <th>Email <span>↕</span></th>
              <th>Регистрация <span>↕</span></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${users.map((user, index) => `
              <tr>
                <td>#${String(index + 1).padStart(2, "0")}</td>
                <td>
                  <div class="user-cell">
                    <img src="${escapeAttr(portalAssetUrl(user.photo || "/teacher2-main.jpg"))}" alt="" data-fallback="${escapeAttr(user.name || "A")}" />
                    <div><b>${escapeHtml(user.name || loginOf(user) || "Без имени")}</b><span>${escapeHtml(user.callsign || loginOf(user))}</span></div>
                  </div>
                </td>
                <td>${roleSelectHtml(user)}</td>
                <td>${escapeHtml(user.phone || "—")}</td>
                <td>${escapeHtml(user.email || "—")}</td>
                <td>${escapeHtml(user.createdAt || "—")}</td>
                <td>
                  <div class="row-actions icon-actions">
                    ${user.role !== "super" ? `<button class="btn icon danger" data-action="delete" data-page="users" data-id="${escapeAttr(user.id)}">${iconSvg("trash")}</button>` : ""}
                    <button class="btn icon" data-action="edit" data-page="users" data-id="${escapeAttr(user.id)}">${iconSvg("edit")}</button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function figmaPermissionsHtml() {
  const roles = roleOptions();
  const permissions = state.rolePermissions[activePermissionRole] || {};
  const sections = PERMISSION_SECTIONS;
  return `
    <section class="content-panel permissions-panel">
      <div class="permissions-titlebar">
        <div class="figma-title">
          <span class="figma-title-icon">${iconSvg("users")}</span>
          <h1>Настройка прав роли</h1>
        </div>
        <select class="select role-main-select" data-action="permission-role">
          ${roles.map(([role, label]) => `<option value="${escapeAttr(role)}" ${role === activePermissionRole ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
        </select>
      </div>
      ${figmaMetaBarHtml(["Настроить права роли"])}
      <div class="permission-card-list">
        ${sections.map(section => {
          const sectionPerms = permissions[section] || {};
          return `
            <article class="permission-section-card">
              <h2><span>${iconSvg(section.includes("Город") ? "cities" : section.includes("Журнал") ? "journal" : section.includes("Соревн") ? "competitions" : "training")}</span>${escapeHtml(section)}</h2>
              ${PERMISSION_ACTIONS.map(([key, label]) => `
                <label class="permission-line">
                  <span><b>${escapeHtml(label)}</b><small>${key === "summary" ? "Отображение итоговых данных и показателей в сводке" : key === "view" ? "Возможность видеть всю информацию на портале" : key === "edit" ? "Возможность редактировать всю информацию во всех разделах" : "Возможность публикации и экзаменации"}</small></span>
                  <button class="switch ${sectionPerms[key] ? "on" : ""}" data-action="toggle-permission" data-role="${escapeAttr(activePermissionRole)}" data-section="${escapeAttr(section)}" data-perm="${escapeAttr(key)}" type="button"></button>
                </label>
              `).join("")}
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function usersTableHtml(kind) {
  const users = filteredUsers(kind);
  const title = kind === "admins" ? "Администраторы" : "Участники";
  return `
    <section class="content-panel">
      <div class="filters">
        <input class="field" value="${escapeAttr(filters.q)}" data-action="search" placeholder="Поиск по пользователям" />
        <select class="select" data-action="set-status-filter">
          <option value="all" ${filters.status === "all" ? "selected" : ""}>Все роли</option>
          ${roleOptions().map(([role, label]) => `<option value="${role}" ${filters.status === role ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
        </select>
        <button class="btn" data-action="add" data-page="users">Добавить</button>
        <button class="btn black" data-action="export" data-page="users">Экспорт</button>
      </div>
      <div class="panel-head">
        <h2 class="panel-title">${escapeHtml(title)}</h2>
        <div class="legend"><span><i class="dot black"></i>${users.length} записей</span><span><i class="dot"></i>данные демо-входа</span></div>
      </div>
      ${tableHtml("users", users)}
    </section>
  `;
}

function filteredUsers(kind) {
  const q = normalizeText(filters.q);
  return state.users.filter(user => {
    const isAdmin = user.role === "admin" || user.role === "super";
    const byKind = kind === "admins" ? isAdmin : !isAdmin;
    const byText = !q || normalizeText(JSON.stringify(user)).includes(q);
    const byRole = filters.status === "all" || user.role === filters.status;
    return byKind && byText && byRole;
  });
}

function permissionsHtml() {
  const roles = roleOptions();
  const permissions = state.rolePermissions[activePermissionRole] || {};
  return `
    <section class="content-panel">
      <div class="panel-head">
        <h2 class="panel-title">Роль: ${escapeHtml(ROLE_LABELS[activePermissionRole])}</h2>
        <div class="segmented">
          ${roles.map(([role, label]) => `<button class="seg-btn ${role === activePermissionRole ? "active" : ""}" data-action="permission-role" data-role="${escapeAttr(role)}">${escapeHtml(label)}</button>`).join("")}
        </div>
      </div>
      <div class="permissions-grid">
        ${PERMISSION_SECTIONS.map((section, index) => {
          const sectionPerms = permissions[section] || {};
          return `
            <div class="permission-card" style="--i:${index}">
              <div class="item-title">${escapeHtml(section)}</div>
              <div class="permission-list">
                ${PERMISSION_ACTIONS.map(([key, label]) => `
                  <label class="switch-row">
                    <span>${escapeHtml(label)}</span>
                    <button class="switch ${sectionPerms[key] ? "on" : ""}" data-action="toggle-permission" data-role="${escapeAttr(activePermissionRole)}" data-section="${escapeAttr(section)}" data-perm="${escapeAttr(key)}" type="button" aria-label="${escapeAttr(label)}"></button>
                  </label>
                `).join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function individualUsersHtml() {
  const q = normalizeText(filters.q);
  const users = state.users.filter(user => !q || normalizeText(JSON.stringify(user)).includes(q));
  return `
    <section class="content-panel">
      <div class="filters">
        <input class="field" value="${escapeAttr(filters.q)}" data-action="search" placeholder="Поиск по таблице" />
        <button class="btn" data-action="individual-edit-selected">Редактировать выбранных</button>
        <button class="btn" data-action="individual-full-selected">Дать полный доступ</button>
        <button class="btn black" data-action="export" data-page="users">Экспорт</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th></th><th>Пользователь</th><th>Роль</th><th>Доступ</th><th>Ограничения</th><th></th></tr></thead>
          <tbody>
            ${users.map(user => {
              const login = loginOf(user);
              const access = state.individualAccess[login] || {};
              return `
                <tr>
                  <td><input type="checkbox" ${selectedUsers.has(login) ? "checked" : ""} data-action="toggle-user-select" data-login="${escapeAttr(login)}" /></td>
                  <td><div class="table-title-cell">${imageHtml(user, "users", "thumb square")}<div><div class="item-title">${escapeHtml(user.name)}</div><div class="item-subtitle">${escapeHtml(user.callsign || login)}</div></div></div></td>
                  <td>${roleSelectHtml(user)}</td>
                  <td><span class="chip ${access.fullAccess ? "green" : "amber"}">${access.fullAccess ? "Полный доступ" : "Ограничен"}</span></td>
                  <td>${escapeHtml((access.restrictions || []).join(", ") || "Нет")}</td>
                  <td><div class="row-actions"><button class="btn small" data-action="individual-toggle-full" data-login="${escapeAttr(login)}">${access.fullAccess ? "Ограничить" : "Полный доступ"}</button><button class="btn small" data-action="individual-add-restriction" data-login="${escapeAttr(login)}">+ ограничение</button></div></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function tableHtml(key, items) {
  if (!items.length) return `<div class="empty">Пока пусто. Нажмите «Добавить», чтобы создать запись и синхронизировать портал.</div>`;
  const isUsers = key === "users";
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>${isUsers ? "Пользователь" : "Название"}</th>
            <th>${isUsers ? "Логин" : "Раздел"}</th>
            <th>${isUsers ? "Роль" : "Статус"}</th>
            <th>Путь</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => rowHtml(key, item)).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function rowHtml(key, item) {
  const isUsers = key === "users";
  const status = statusOf(item);
  const route = routeOf(item, key);
  return `
    <tr>
      <td>
        <div class="table-title-cell">
          ${imageHtml(item, key, "thumb square")}
          <div>
            <div class="item-title">${escapeHtml(titleOf(item, key))}</div>
            <div class="item-subtitle">${escapeHtml(subtitleOf(item, key))}</div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(isUsers ? loginOf(item) : sectionLabel(item, key))}</td>
      <td>${isUsers ? roleSelectHtml(item) : `<span class="chip ${chipClass(status)}">${escapeHtml(STATUS_LABELS[status] || status)}</span>`}</td>
      <td>${route ? `<button class="btn small" data-action="preview" data-route="${escapeAttr(route)}">${escapeHtml(route)}</button>` : `<span class="chip">Нет пути</span>`}</td>
      <td>
        <div class="row-actions">
          ${isUsers ? adminToggleButtonHtml(item) : `<button class="btn small" data-action="toggle-publish" data-page="${escapeAttr(key)}" data-id="${escapeAttr(item.id)}">${status === "hidden" ? "Показать" : "Скрыть"}</button>`}
          <button class="btn small" data-action="edit" data-page="${escapeAttr(key)}" data-id="${escapeAttr(item.id)}">Править</button>
          <button class="btn small" data-action="duplicate" data-page="${escapeAttr(key)}" data-id="${escapeAttr(item.id)}">Копия</button>
          <button class="btn small danger" data-action="delete" data-page="${escapeAttr(key)}" data-id="${escapeAttr(item.id)}">Удалить</button>
        </div>
      </td>
    </tr>
  `;
}

function roleSelectHtml(user) {
  return `
    <select class="select" data-action="role-change" data-id="${escapeAttr(user.id)}" style="min-width:160px">
      ${roleOptions().map(([role, label]) => `<option value="${role}" ${user.role === role ? "selected" : ""}>${label}</option>`).join("")}
    </select>
  `;
}

function adminToggleButtonHtml(user) {
  const isAdmin = user.role === "admin" || user.role === "super";
  return `<button class="btn small ${isAdmin ? "" : "black"}" data-action="toggle-admin" data-id="${escapeAttr(user.id)}">${isAdmin ? "Снять права" : "Дать права"}</button>`;
}

function settingsHtml() {
  const cfg = state.config || {};
  return `
    <section class="settings-grid">
      <div class="content-panel">
        <div class="panel-head">
          <h2 class="panel-title">Параметры портала</h2>
          <button class="btn black" data-action="save-settings">Сохранить</button>
        </div>
        <form id="settings-form" class="form-grid">
          ${settingsField("siteName", "Название", cfg.siteName)}
          ${settingsField("siteUrl", "Адрес портала", cfg.siteUrl)}
          ${settingsField("contacts.phone", "Телефон", cfg.contacts?.phone)}
          ${settingsField("contacts.email", "Email", cfg.contacts?.email)}
          ${settingsField("contacts.address", "Адрес", cfg.contacts?.address, true)}
          ${settingsField("siteDescription", "Описание", cfg.siteDescription, true, "textarea")}
          ${settingsField("social.vk", "VK", cfg.social?.vk)}
          ${settingsField("social.tg", "Telegram", cfg.social?.tg)}
        </form>
      </div>
      <div class="content-panel">
        <h2 class="panel-title">Сервис</h2>
        <p class="page-lead">Импорт и экспорт работают с полным снимком админки. Сброс восстанавливает исходные данные портала, включая все курсы.</p>
        <div class="grid" style="margin-top:24px">
          <button class="btn black" data-action="export-all">Экспортировать всё</button>
          <button class="btn" data-action="import-click">Импортировать файл данных</button>
          <button class="btn" data-action="reset-seed">Восстановить из портала</button>
          <button class="btn danger" data-action="logout">Выйти из админки</button>
          <input id="import-json" type="file" accept="application/json" hidden />
        </div>
      </div>
    </section>
  `;
}

function settingsField(name, label, value = "", full = false, type = "input") {
  return `
    <div class="form-row ${full ? "full" : ""}">
      <label for="setting-${escapeAttr(name)}">${escapeHtml(label)}</label>
      ${type === "textarea"
        ? `<textarea class="field" id="setting-${escapeAttr(name)}" name="${escapeAttr(name)}">${escapeHtml(value || "")}</textarea>`
        : `<input class="field" id="setting-${escapeAttr(name)}" name="${escapeAttr(name)}" value="${escapeAttr(value || "")}" />`}
    </div>
  `;
}

function modalHtml() {
  if (modal.kind === "calendar") return calendarModalHtml();
  const { page, id, mode } = modal;
  const config = RESOURCE_CONFIGS[page];
  const item = mode === "edit" ? findItem(page, id) : defaultItem(page);
  const title = mode === "edit" ? `Редактировать: ${titleOf(item, page)}` : `Добавить: ${config.title}`;

  return `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal" id="editor-form" data-page="${escapeAttr(page)}" data-id="${escapeAttr(id || "")}" data-mode="${escapeAttr(mode)}">
        <div class="modal-head">
          <h2 class="modal-title">${escapeHtml(title)}</h2>
          <button class="btn icon" type="button" data-action="close-modal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            ${config.fields.map(field => editorFieldHtml(field, item)).join("")}
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" type="button" data-action="close-modal">Отмена</button>
          <button class="btn black" type="submit">Сохранить</button>
        </div>
      </form>
    </div>
  `;
}

function calendarModalHtml() {
  const cursorDate = new Date();
  cursorDate.setMonth(cursorDate.getMonth() + Number(state.training.calendarCursor || 0));
  const event = modal.id
    ? state.training.calendarEvents.find(item => String(item.id) === String(modal.id))
    : {
      id: "",
      day: modal.day || 1,
      month: cursorDate.getMonth(),
      year: cursorDate.getFullYear(),
      title: "",
      city: "Москва",
      type: "аудитория",
      timeStart: "10:00",
      timeEnd: "15:00",
      instructor: "Бек",
      num: state.training.calendarEvents.length + 1,
      description: "",
      image: "/military-course.jpg",
      location: "Учебная площадка",
      format: "Практическое занятие",
      equipment: [],
      goals: [],
      status: "published",
    };
  return `
    <div class="modal-backdrop" data-action="close-modal">
      <form class="modal" id="calendar-form" data-id="${escapeAttr(event.id || "")}">
        <div class="modal-head">
          <h2 class="modal-title">${event.id ? "Редактировать поток" : "Добавить поток"}</h2>
          <button class="btn icon" type="button" data-action="close-modal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-row"><label>День месяца</label><input class="field" name="day" type="number" min="1" max="31" value="${escapeAttr(event.day)}" required /></div>
            <div class="form-row"><label>Месяц</label><input class="field" name="month" type="number" min="1" max="12" value="${Number(event.month ?? cursorDate.getMonth()) + 1}" required /></div>
            <div class="form-row"><label>Год</label><input class="field" name="year" type="number" min="2024" max="2035" value="${escapeAttr(event.year || cursorDate.getFullYear())}" required /></div>
            <div class="form-row"><label>Название</label><input class="field" name="title" value="${escapeAttr(event.title)}" required /></div>
            <div class="form-row"><label>Город</label><input class="field" name="city" value="${escapeAttr(event.city)}" /></div>
            <div class="form-row"><label>Тип площадки</label><select class="select" name="type">${["аудитория", "полигон", "стрельбище"].map(type => `<option value="${type}" ${normalizeStreamType(event.type) === type ? "selected" : ""}>${type}</option>`).join("")}</select></div>
            <div class="form-row"><label>Начало</label><input class="field" name="timeStart" value="${escapeAttr(event.timeStart || "10:00")}" /></div>
            <div class="form-row"><label>Окончание</label><input class="field" name="timeEnd" value="${escapeAttr(event.timeEnd || "15:00")}" /></div>
            <div class="form-row"><label>Инструктор</label><input class="field" name="instructor" value="${escapeAttr(event.instructor || "Бек")}" /></div>
            <div class="form-row"><label>Номер занятия</label><input class="field" name="num" type="number" value="${escapeAttr(event.num || 1)}" /></div>
            <div class="form-row full">
              <label for="field-calendar-image">Фото</label>
              <div class="image-field">
                <div class="image-field-preview" id="field-calendar-image-preview">
                  ${event.image ? `<img src="${escapeAttr(portalAssetUrl(event.image))}" alt="" data-fallback="Ф" />` : `<span>Нет фото</span>`}
                </div>
                <div class="image-field-row">
                  <input class="field" type="text" id="field-calendar-image" name="image" value="${escapeAttr(event.image || "/military-course.jpg")}" placeholder="/photo.jpg или https://…" />
                  <button type="button" class="btn small" data-action="open-image-picker" data-target="${escapeAttr(JSON.stringify({ mode: "dom", inputId: "field-calendar-image", previewId: "field-calendar-image-preview" }))}">Выбрать фото</button>
                </div>
              </div>
            </div>
            <div class="form-row"><label>Место</label><input class="field" name="location" value="${escapeAttr(event.location || "")}" /></div>
            <div class="form-row"><label>Формат занятия</label><input class="field" name="format" value="${escapeAttr(event.format || "")}" /></div>
            <div class="form-row full"><label>Описание</label><textarea class="field" name="description">${escapeHtml(event.description || "")}</textarea></div>
            <div class="form-row full"><label>Что отработаем, по строкам</label><textarea class="field" name="goals">${escapeHtml((event.goals || []).join("\n"))}</textarea></div>
            <div class="form-row full"><label>Что подготовить, по строкам</label><textarea class="field" name="equipment">${escapeHtml((event.equipment || []).join("\n"))}</textarea></div>
            <div class="form-row full"><label>Статус</label><select class="select" name="status">${statusOptions().map(([value, label]) => `<option value="${escapeAttr(value)}" ${event.status === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select></div>
          </div>
        </div>
        <div class="modal-foot">
          ${event.id ? `<button class="btn danger" type="button" data-action="delete-calendar-event" data-id="${escapeAttr(event.id)}">Удалить</button>` : `<span></span>`}
          <div class="toolbar"><button class="btn" type="button" data-action="close-modal">Отмена</button><button class="btn black" type="submit">Сохранить</button></div>
        </div>
      </form>
    </div>
  `;
}

function editorFieldHtml(field, item) {
  const value = item?.[field.key];
  const full = field.type === "textarea" || field.key === "description" || field.key === "text";
  const common = `id="field-${escapeAttr(field.key)}" name="${escapeAttr(field.key)}" ${field.required ? "required" : ""}`;
  let input = "";

  if (field.key === "image") {
    const inputId = `field-${field.key}`;
    const target = { mode: "dom", inputId, previewId: `${inputId}-preview` };
    return `
      <div class="form-row full">
        <label for="${inputId}">${escapeHtml(field.label)}</label>
        <div class="image-field">
          <div class="image-field-preview" id="${inputId}-preview">
            ${value ? `<img src="${escapeAttr(portalAssetUrl(value))}" alt="" data-fallback="Ф" />` : `<span>Нет фото</span>`}
          </div>
          <div class="image-field-row">
            <input class="field" type="text" ${common} value="${escapeAttr(value ?? "")}" placeholder="/photo.jpg или https://…" />
            <button type="button" class="btn small" data-action="open-image-picker" data-target="${escapeAttr(JSON.stringify(target))}">Выбрать фото</button>
          </div>
        </div>
      </div>
    `;
  }

  if (field.type === "textarea") {
    input = `<textarea class="field" ${common}>${escapeHtml(value || "")}</textarea>`;
  } else if (field.type === "select") {
    input = `<select class="select" ${common}>${(field.options || []).map(([key, label]) => `<option value="${escapeAttr(key)}" ${String(value ?? "") === String(key) ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select>`;
  } else if (field.type === "checkbox") {
    input = `<select class="select" ${common}><option value="true" ${value !== false ? "selected" : ""}>Да</option><option value="false" ${value === false ? "selected" : ""}>Нет</option></select>`;
  } else {
    input = `<input class="field" type="${field.type === "number" ? "number" : "text"}" ${common} value="${escapeAttr(value ?? "")}" />`;
  }

  return `
    <div class="form-row ${full ? "full" : ""}">
      <label for="field-${escapeAttr(field.key)}">${escapeHtml(field.label)}</label>
      ${input}
    </div>
  `;
}

function bindDynamicElements() {
  app.querySelectorAll("[data-action]").forEach(el => {
    if (el.matches("select[data-action='set-status-filter']") || el.matches("select[data-action='select-landing-course']") || el.matches("select[data-action='select-calendar-course']") || el.matches("select[data-action='permission-role']") || el.matches("[data-action='inline-field']")) {
      el.addEventListener("change", handleAction);
    } else if (el.matches("input[data-action='search']")) {
      el.addEventListener("input", handleAction);
    } else if (el.matches("select[data-action='role-change']")) {
      el.addEventListener("change", handleAction);
    } else if (el.matches("[data-action='inline-list-input']")) {
      el.addEventListener("change", handleAction);
    } else if (el.matches("[data-action='landing-input'], [data-action='landing-field'], [data-action='landing-list-input'], [data-action='landing-program-title'], [data-action='landing-program-item'], [data-action='program-section-input'], [data-action='program-topic-input']")) {
      el.addEventListener("input", handleAction);
    } else {
      el.addEventListener("click", handleAction);
    }
  });

  app.querySelectorAll("img[data-fallback]").forEach(img => {
    img.addEventListener("error", () => {
      const parent = img.parentElement;
      if (parent) {
        parent.textContent = initials(img.dataset.fallback || "В");
      } else {
        img.replaceWith(fallbackAvatarNode(img.dataset.fallback || "В", img.className));
      }
    }, { once: true });
  });

  const importInput = document.getElementById("import-json");
  if (importInput) importInput.addEventListener("change", importJson);

  bindChartHover();
}

function bindChartHover() {
  const tip = document.getElementById("chart-tip");
  const months = app.querySelectorAll(".chart-month");
  if (!tip || !months.length) return;

  const activate = month => {
    const index = Number(month.dataset.index || 0);
    tip.style.left = `${(index + 0.5) * (100 / 12)}%`;
    tip.textContent = `${month.dataset.month} · ${formatNumber(month.dataset.published)} / ${formatNumber(month.dataset.total)}`;
    months.forEach(item => item.classList.toggle("active", item === month));
  };

  months.forEach(month => {
    month.addEventListener("mouseenter", () => activate(month));
    month.addEventListener("focus", () => activate(month));
    month.addEventListener("mousemove", () => activate(month));
  });
}

function bindModal() {
  const backdrop = document.querySelector(".modal-backdrop");
  const form = document.getElementById("editor-form");
  const calendarForm = document.getElementById("calendar-form");
  backdrop?.querySelectorAll("[data-action='close-modal']").forEach(el => el.addEventListener("click", closeModal));
  backdrop?.querySelectorAll("[data-action='delete-calendar-event']").forEach(el => el.addEventListener("click", handleAction));
  backdrop?.querySelectorAll("[data-action='open-image-picker']").forEach(el => el.addEventListener("click", handleAction));
  backdrop?.addEventListener("click", event => {
    if (event.target === backdrop) closeModal();
  });
  form?.addEventListener("submit", saveEditorForm);
  calendarForm?.addEventListener("submit", saveCalendarForm);
}

function handleAction(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;
  const page = target.dataset.page;
  const id = target.dataset.id;

  if (action === "navigate") {
    // Обычная навигация в «Курсы» сбрасывает фильтр папки-города —
    // город остаётся активным только при входе через папку.
    if (page === "training-courses") activeCityFolder = "";
    setPage(page);
  } else if (action === "open-city-courses") {
    activeCityFolder = target.dataset.city || "";
    setPage("training-courses");
  } else if (action === "clear-city-folder") {
    activeCityFolder = "";
    render();
  } else if (action === "toggle-course-sort") {
    courseSort = courseSort === "added" ? "title" : "added";
    render();
  } else if (action === "contact-manager") {
    const email = state.config?.contacts?.email;
    const phone = state.config?.contacts?.phone;
    if (email) window.open(`mailto:${email}`, "_blank");
    else if (phone) window.open(`tel:${String(phone).replace(/[^\d+]/g, "")}`);
    else toast("Контакты не заполнены", "Укажите email или телефон в «Настройки → Параметры портала».");
  } else if (action === "course-chat") {
    const tg = state.config?.social?.tg;
    if (tg) window.open(tg.startsWith("http") ? tg : `https://t.me/${tg.replace(/^@/, "")}`, "_blank", "noopener");
    else toast("Ссылка не указана", "Добавьте Telegram в «Настройки → Параметры портала», чтобы кнопка вела в чат.");
  } else if (action === "save") {
    saveState();
  } else if (action === "open-portal") {
    // Всегда реальный адрес портала: siteUrl из настроек — маркетинговое поле
    // (может быть ещё не существующий домен), для перехода он не годится.
    window.open(PORTAL_URL, "_blank", "noopener");
  } else if (action === "set-status-filter") {
    filters.status = target.value;
    render();
  } else if (action === "search") {
    filters.q = target.value;
    render();
  } else if (action === "inline-select") {
    activeRecordId[page] = id;
    render();
  } else if (action === "inline-add") {
    addInlineRecord(page);
  } else if (action === "inline-field") {
    updateInlineField(page, id, target.dataset.field, target.value, target.dataset.type);
  } else if (action === "inline-list-input") {
    updateInlineListItem(page, id, target.dataset.list, Number(target.dataset.index), target.value);
  } else if (action === "inline-list-add") {
    addInlineListItem(page, id, target.dataset.list, target.dataset.placeholder);
  } else if (action === "inline-list-delete") {
    deleteInlineListItem(page, id, target.dataset.list, Number(target.dataset.index));
  } else if (action === "export") {
    exportJson(page, state[page] || []);
  } else if (action === "export-all") {
    exportJson("voevoda-admin-full", buildPortalPayload());
  } else if (action === "import-click") {
    document.getElementById("import-json")?.click();
  } else if (action === "add") {
    openModal(page, null, "add");
  } else if (action === "edit") {
    openModal(page, id, "edit");
  } else if (action === "duplicate") {
    duplicateItem(page, id);
  } else if (action === "delete") {
    deleteItem(page, id);
  } else if (action === "toggle-publish") {
    togglePublish(page, id);
  } else if (action === "approve") {
    approveItem(page, id);
  } else if (action === "preview") {
    openRoute(target.dataset.route);
  } else if (action === "role-change") {
    changeRole(id, target.value);
  } else if (action === "toggle-admin") {
    toggleAdmin(id);
  } else if (action === "save-settings") {
    saveSettings();
  } else if (action === "reset-seed") {
    resetSeed();
  } else if (action === "logout") {
    sessionStorage.removeItem("admin_auth");
    window.location.href = "index.html";
  } else if (action === "calendar-prev") {
    state.training.calendarCursor = Number(state.training.calendarCursor || 0) - 1;
    saveState({ silent: true, remote: false });
    render();
  } else if (action === "calendar-next") {
    state.training.calendarCursor = Number(state.training.calendarCursor || 0) + 1;
    saveState({ silent: true, remote: false });
    render();
  } else if (action === "calendar-today") {
    state.training.calendarCursor = 0;
    saveState({ silent: true, remote: false });
    render();
  } else if (action === "add-calendar-event") {
    openCalendarModal(null, target.dataset.day || 1);
  } else if (action === "edit-calendar-event") {
    openCalendarModal(id);
  } else if (action === "delete-calendar-event") {
    deleteCalendarEvent(id);
  } else if (action === "landing-input") {
    updateLandingBlock(target.dataset.id, target.dataset.field, target.value);
  } else if (action === "landing-field") {
    updateLandingField(target.dataset.field, target.value);
  } else if (action === "landing-list-input") {
    updateLandingListItem(target.dataset.list, Number(target.dataset.index), target.value);
  } else if (action === "landing-list-add") {
    addLandingListItem(target.dataset.list, target.dataset.placeholder);
  } else if (action === "landing-list-delete") {
    deleteLandingListItem(target.dataset.list, Number(target.dataset.index));
  } else if (action === "landing-program-title") {
    updateLandingProgramTitle(Number(target.dataset.index), target.value);
  } else if (action === "landing-program-item") {
    updateLandingProgramItem(Number(target.dataset.index), Number(target.dataset.item), target.value);
  } else if (action === "landing-program-add-group") {
    addLandingProgramGroup();
  } else if (action === "landing-program-delete-group") {
    deleteLandingProgramGroup(Number(target.dataset.index));
  } else if (action === "landing-program-add-item") {
    addLandingProgramItem(Number(target.dataset.index));
  } else if (action === "landing-program-delete-item") {
    deleteLandingProgramItem(Number(target.dataset.index), Number(target.dataset.item));
  } else if (action === "landing-add-block") {
    addLandingBlock();
  } else if (action === "landing-toggle") {
    toggleLandingBlock(id);
  } else if (action === "landing-move") {
    moveLandingBlock(id, Number(target.dataset.dir));
  } else if (action === "landing-delete") {
    deleteLandingBlock(id);
  } else if (action === "select-landing-course") {
    activeLandingCourseId = target.value;
    render();
  } else if (action === "select-calendar-course") {
    activeCalendarCourseId = target.value;
    render();
  } else if (action === "save-landing") {
    saveState({ silent: true });
    const landingCourse = landingCourseList().find(item => String(item.id) === String(activeLandingCourseId));
    toast("Лендинг сохранён", landingCourse ? `Лендинг курса «${landingCourse.title || landingCourse.name}» отправлен на портал.` : "Лендинг обновлён.");
  } else if (action === "program-section-input") {
    updateProgramSection(id, target.value);
  } else if (action === "program-topic-input") {
    updateProgramTopic(id, Number(target.dataset.index), target.value);
  } else if (action === "program-add-section") {
    addProgramSection();
  } else if (action === "program-delete-section") {
    deleteProgramSection(id);
  } else if (action === "program-add-topic") {
    addProgramTopic(id);
  } else if (action === "program-delete-topic") {
    deleteProgramTopic(id, Number(target.dataset.index));
  } else if (action === "save-program") {
    syncCourseLandingProgramFromSections();
    saveState({ silent: true });
    toast("Программа сохранена", "Темы занятий обновлены.");
  } else if (action === "permission-role") {
    activePermissionRole = target.dataset.role || target.value;
    render();
  } else if (action === "toggle-permission") {
    togglePermission(target.dataset.role, target.dataset.section, target.dataset.perm);
  } else if (action === "toggle-user-select") {
    toggleUserSelect(target.dataset.login, target.checked);
  } else if (action === "individual-toggle-full") {
    toggleIndividualFull(target.dataset.login);
  } else if (action === "individual-add-restriction") {
    addIndividualRestriction(target.dataset.login);
  } else if (action === "individual-full-selected") {
    grantSelectedFullAccess();
  } else if (action === "individual-edit-selected") {
    toast("Выбрано пользователей", selectedUsers.size ? `${selectedUsers.size} пользователей готовы к правке.` : "Сначала отметьте пользователей чекбоксами.");
  } else if (action === "open-image-picker") {
    try {
      openImagePicker(JSON.parse(target.dataset.target || "{}"));
    } catch {
      openImagePicker({ mode: "dom", inputId: "" });
    }
  }
}

function openModal(page, id, mode) {
  modal = { page, id, mode };
  render();
}

function openCalendarModal(id = null, day = 1) {
  modal = { kind: "calendar", id, day };
  render();
}

function closeModal(event) {
  event?.preventDefault();
  modal = null;
  document.querySelector(".modal-backdrop")?.remove();
}

function saveEditorForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const page = form.dataset.page;
  const mode = form.dataset.mode;
  const id = form.dataset.id;
  const config = RESOURCE_CONFIGS[page];
  const data = mode === "edit" ? { ...findItem(page, id) } : defaultItem(page);
  const formData = new FormData(form);

  config.fields.forEach(field => {
    const raw = formData.get(field.key);
    if (field.type === "number") {
      data[field.key] = raw === "" || raw == null ? null : Number(raw);
    } else if (field.type === "checkbox") {
      data[field.key] = raw === "true";
    } else {
      data[field.key] = String(raw ?? "").trim();
    }
  });

  if (page === "courses") {
    data.route = data.category === "professional" ? "/professional" : "/courses";
  }

  if (mode === "edit") {
    const index = state[page].findIndex(item => String(item.id) === String(id));
    state[page][index] = data;
  } else {
    state[page].unshift(data);
  }

  saveState({ silent: true });
  closeModal();
  render();
  toast("Запись сохранена", `${RESOURCE_CONFIGS[page].title}: ${titleOf(data, page)}`);
}

function saveCalendarForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const id = form.dataset.id;
  const data = {
    id: id ? Number(id) : nextId(state.training.calendarEvents),
    day: clampDay(formData.get("day") || 1),
    month: Math.min(11, Math.max(0, Number(formData.get("month") || 1) - 1)),
    year: Number(formData.get("year") || new Date().getFullYear()),
    title: String(formData.get("title") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    type: normalizeStreamType(formData.get("type")),
    timeStart: String(formData.get("timeStart") || "10:00").trim(),
    timeEnd: String(formData.get("timeEnd") || "15:00").trim(),
    instructor: String(formData.get("instructor") || "Бек").trim(),
    num: Number(formData.get("num") || 1),
    description: String(formData.get("description") || "").trim(),
    image: String(formData.get("image") || "/military-course.jpg").trim(),
    location: String(formData.get("location") || "").trim(),
    format: String(formData.get("format") || "").trim(),
    goals: splitLines(formData.get("goals")),
    equipment: splitLines(formData.get("equipment")),
    status: String(formData.get("status") || "published"),
  };

  if (id) {
    const index = state.training.calendarEvents.findIndex(eventItem => String(eventItem.id) === String(id));
    state.training.calendarEvents[index] = data;
  } else {
    state.training.calendarEvents.push(data);
  }

  saveState({ silent: true });
  closeModal();
  render();
  toast("Поток сохранён", data.title);
}

function deleteCalendarEvent(id) {
  const events = state.training.calendarEvents;
  const index = events.findIndex(item => String(item.id) === String(id));
  if (index === -1) return;
  const [deleted] = events.splice(index, 1);  // splice in-place keeps the array reference intact
  saveState({ silent: true });
  closeModal();
  render();
  toast("Поток удалён", deleted.title);
}

function updateLandingField(field, value) {
  if (!field) return;
  state.training.courseLanding[field] = value;
  syncLandingBlocksFromCourseLanding();
  scheduleSave();
}

function updateLandingListItem(listKey, index, value) {
  const listItems = state.training.courseLanding[listKey];
  if (!Array.isArray(listItems) || !Number.isFinite(index) || index < 0) return;
  listItems[index] = value;
  syncLandingBlocksFromCourseLanding();
  scheduleSave();
}

function addLandingListItem(listKey, placeholder = "Новый пункт") {
  state.training.courseLanding[listKey] = Array.isArray(state.training.courseLanding[listKey]) ? state.training.courseLanding[listKey] : [];
  state.training.courseLanding[listKey].push(placeholder || "Новый пункт");
  syncLandingBlocksFromCourseLanding();
  saveState({ silent: true });
  render();
}

function deleteLandingListItem(listKey, index) {
  if (!Array.isArray(state.training.courseLanding[listKey])) return;
  state.training.courseLanding[listKey] = state.training.courseLanding[listKey].filter((_, itemIndex) => itemIndex !== index);
  syncLandingBlocksFromCourseLanding();
  saveState({ silent: true });
  render();
}

function updateLandingProgramTitle(index, value) {
  const group = state.training.courseLanding.programGroups?.[index];
  if (!group) return;
  group.title = value;
  syncProgramSectionsFromLandingProgram();
  syncLandingBlocksFromCourseLanding();
  scheduleSave();
}

function updateLandingProgramItem(groupIndex, itemIndex, value) {
  const group = state.training.courseLanding.programGroups?.[groupIndex];
  if (!group || !Array.isArray(group.items)) return;
  group.items[itemIndex] = value;
  syncProgramSectionsFromLandingProgram();
  syncLandingBlocksFromCourseLanding();
  scheduleSave();
}

function addLandingProgramGroup() {
  state.training.courseLanding.programGroups = state.training.courseLanding.programGroups || [];
  state.training.courseLanding.programGroups.push({ id: nextId(state.training.courseLanding.programGroups), title: "Новый раздел", items: ["Новая тема"] });
  syncProgramSectionsFromLandingProgram();
  syncLandingBlocksFromCourseLanding();
  saveState({ silent: true });
  render();
}

function deleteLandingProgramGroup(index) {
  state.training.courseLanding.programGroups = (state.training.courseLanding.programGroups || []).filter((_, groupIndex) => groupIndex !== index);
  syncProgramSectionsFromLandingProgram();
  syncLandingBlocksFromCourseLanding();
  saveState({ silent: true });
  render();
}

function addLandingProgramItem(index) {
  const group = state.training.courseLanding.programGroups?.[index];
  if (!group) return;
  group.items = [...(group.items || []), "Новая тема"];
  syncProgramSectionsFromLandingProgram();
  syncLandingBlocksFromCourseLanding();
  saveState({ silent: true });
  render();
}

function deleteLandingProgramItem(groupIndex, itemIndex) {
  const group = state.training.courseLanding.programGroups?.[groupIndex];
  if (!group) return;
  group.items = (group.items || []).filter((_, index) => index !== itemIndex);
  syncProgramSectionsFromLandingProgram();
  syncLandingBlocksFromCourseLanding();
  saveState({ silent: true });
  render();
}

function syncLandingBlocksFromCourseLanding() {
  const landing = state.training.courseLanding || defaultCourseLanding();
  const blockText = {
    "Главный экран": landing.heroSubtitle,
    "Преимущества": (landing.benefits || []).join("\n"),
    "Фотографии": (landing.photos || []).join("\n"),
    "Программа": landing.programIntro,
    "Расписание": "Данные берутся из календаря потоков",
    "Отзывы": landing.reviewsTitle,
  };
  state.training.landingBlocks = (state.training.landingBlocks || []).map(block => ({
    ...block,
    text: blockText[block.title] ?? block.text,
  }));
}

function syncProgramSectionsFromLandingProgram() {
  state.training.programSections = (state.training.courseLanding.programGroups || []).map(group => ({
    id: group.id ?? nextId(state.training.programSections || []),
    title: group.title,
    topics: [...(group.items || [])],
  }));
}

function updateLandingBlock(id, field, value) {
  const block = state.training.landingBlocks.find(item => String(item.id) === String(id));
  if (!block || !field) return;
  block[field] = value;
  scheduleSave();
}

function addLandingBlock() {
  state.training.landingBlocks.push({ id: nextId(state.training.landingBlocks), title: "Новый блок", text: "Описание блока", visible: true });
  saveState({ silent: true });
  render();
}

function toggleLandingBlock(id) {
  const block = state.training.landingBlocks.find(item => String(item.id) === String(id));
  if (!block) return;
  block.visible = block.visible === false;
  saveState({ silent: true });
  render();
}

function moveLandingBlock(id, direction) {
  const list = state.training.landingBlocks;
  const index = list.findIndex(item => String(item.id) === String(id));
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return;
  [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
  saveState({ silent: true });
  render();
}

function deleteLandingBlock(id) {
  state.training.landingBlocks = state.training.landingBlocks.filter(item => String(item.id) !== String(id));
  saveState({ silent: true });
  render();
}

function updateProgramSection(id, title) {
  const section = state.training.programSections.find(item => String(item.id) === String(id));
  if (!section) return;
  section.title = title;
  syncCourseLandingProgramFromSections();
  scheduleSave();
}

function updateProgramTopic(id, index, title) {
  const section = state.training.programSections.find(item => String(item.id) === String(id));
  if (!section || !section.topics?.[index]) return;
  section.topics[index] = title;
  syncCourseLandingProgramFromSections();
  scheduleSave();
}

function addProgramSection() {
  state.training.programSections.push({ id: nextId(state.training.programSections), title: "Новый раздел", topics: ["Новая тема"] });
  syncCourseLandingProgramFromSections();
  saveState({ silent: true });
  render();
}

function deleteProgramSection(id) {
  state.training.programSections = state.training.programSections.filter(item => String(item.id) !== String(id));
  syncCourseLandingProgramFromSections();
  saveState({ silent: true });
  render();
}

function addProgramTopic(id) {
  const section = state.training.programSections.find(item => String(item.id) === String(id));
  if (!section) return;
  section.topics = [...(section.topics || []), "Новая тема"];
  syncCourseLandingProgramFromSections();
  saveState({ silent: true });
  render();
}

function deleteProgramTopic(id, index) {
  const section = state.training.programSections.find(item => String(item.id) === String(id));
  if (!section) return;
  section.topics = (section.topics || []).filter((_, topicIndex) => topicIndex !== index);
  syncCourseLandingProgramFromSections();
  saveState({ silent: true });
  render();
}

function syncCourseLandingProgramFromSections() {
  state.training.courseLanding = state.training.courseLanding || defaultCourseLanding();
  state.training.courseLanding.programGroups = (state.training.programSections || []).map(section => ({
    id: section.id,
    title: section.title,
    items: [...(section.topics || [])],
  }));
  syncLandingBlocksFromCourseLanding();
}

function togglePermission(role, section, permission) {
  state.rolePermissions[role] = state.rolePermissions[role] || {};
  state.rolePermissions[role][section] = state.rolePermissions[role][section] || {};
  state.rolePermissions[role][section][permission] = !state.rolePermissions[role][section][permission];
  saveState({ silent: true });
  render();
}

function toggleUserSelect(login, checked) {
  if (!login) return;
  if (checked) selectedUsers.add(login);
  else selectedUsers.delete(login);
}

function toggleIndividualFull(login) {
  if (!login) return;
  state.individualAccess[login] = state.individualAccess[login] || { restrictions: [] };
  state.individualAccess[login].fullAccess = !state.individualAccess[login].fullAccess;
  if (state.individualAccess[login].fullAccess) state.individualAccess[login].restrictions = [];
  saveState({ silent: true });
  render();
}

function addIndividualRestriction(login) {
  if (!login) return;
  state.individualAccess[login] = state.individualAccess[login] || { fullAccess: false, restrictions: [] };
  const next = state.individualAccess[login].restrictions || [];
  const pool = ["Экзамены", "Журнал", "Пользователи", "Публикация", "Документы"];
  const restriction = pool.find(item => !next.includes(item)) || `Ограничение ${next.length + 1}`;
  state.individualAccess[login].fullAccess = false;
  state.individualAccess[login].restrictions = [...next, restriction];
  saveState({ silent: true });
  render();
}

function grantSelectedFullAccess() {
  if (!selectedUsers.size) {
    toast("Никого не выбрано", "Отметьте пользователей чекбоксами.");
    return;
  }
  selectedUsers.forEach(login => {
    state.individualAccess[login] = { fullAccess: true, restrictions: [], note: "" };
  });
  saveState({ silent: true });
  render();
  toast("Полный доступ выдан", `${selectedUsers.size} пользователей обновлены.`);
}

function defaultItem(page) {
  const config = RESOURCE_CONFIGS[page];
  const item = { id: nextId(state[page]) };
  config.fields.forEach(field => {
    if (field.type === "number") item[field.key] = 0;
    else if (field.type === "checkbox") item[field.key] = true;
    else if (field.type === "select") item[field.key] = field.options?.[0]?.[0] || "";
    else item[field.key] = "";
  });
  if ("status" in item && !item.status) item.status = "published";
  if ("published" in item) item.published = true;
  if (page === "users") item.role = "user";
  return item;
}

function duplicateItem(page, id) {
  const item = findItem(page, id);
  if (!item) return;
  const copy = { ...item, id: nextId(state[page]) };
  const titleField = RESOURCE_CONFIGS[page].titleField;
  if (copy[titleField]) copy[titleField] = `${copy[titleField]} — копия`;
  state[page].unshift(copy);
  saveState({ silent: true });
  render();
  toast("Копия создана", titleOf(copy, page));
}

function deleteItem(page, id) {
  const item = findItem(page, id);
  if (!item) return;
  if (!window.confirm(`Удалить «${titleOf(item, page)}» из админки?`)) return;
  state[page] = state[page].filter(entry => String(entry.id) !== String(id));
  state.deleted[page] = Array.from(new Set([...(state.deleted[page] || []), item.id]));
  saveState({ silent: true });
  render();
  toast("Запись удалена", titleOf(item, page));
}

function togglePublish(page, id) {
  const item = findItem(page, id);
  if (!item) return;
  if ("published" in item || page === "courses" || page === "products" || page === "reviews") {
    item.published = item.published === false;
  } else {
    item.status = ["hidden", "archived"].includes(statusOf(item)) ? "published" : "archived";
  }
  saveState({ silent: true });
  render();
  toast("Статус обновлён", titleOf(item, page));
}

function approveItem(page, id) {
  const item = findItem(page, id);
  if (!item) return;
  if ("published" in item) item.published = true;
  item.status = "published";
  saveState({ silent: true });
  render();
  toast("Одобрено", titleOf(item, page));
}

function changeRole(id, role) {
  const user = findItem("users", id);
  if (!user) return;
  user.role = role;
  saveState({ silent: true });
  render();
  toast("Права обновлены", `${user.callsign || user.name}: ${ROLE_LABELS[role]}`);
}

function toggleAdmin(id) {
  const user = findItem("users", id);
  if (!user) return;
  user.role = user.role === "admin" || user.role === "super" ? "user" : "admin";
  saveState({ silent: true });
  render();
  toast("Права обновлены", `${user.callsign || user.name}: ${ROLE_LABELS[user.role]}`);
}

function saveSettings() {
  const form = document.getElementById("settings-form");
  if (!form) return;
  const formData = new FormData(form);
  for (const [key, value] of formData.entries()) {
    setPath(state.config, key, String(value).trim());
  }
  saveState({ silent: true });
  render();
  toast("Настройки сохранены", "Контакты и адрес портала обновлены.");
}

async function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    state = mergeStates(seedState, JSON.parse(text));
    ensureDemoUsers();
    ensureTrainingStructure();
    saveState({ silent: true });
    render();
    toast("Импорт завершён", file.name);
  } catch (error) {
    toast("Импорт не удался", "Проверьте, что выбран корректный файл данных.");
    console.error(error);
  } finally {
    event.target.value = "";
  }
}

function resetSeed() {
  if (!window.confirm("Восстановить исходные данные портала и вернуть все курсы?")) return;
  state = normalizeState(seedState);
  state.deleted = {};
  ensureDemoUsers();
  ensureTrainingStructure();
  saveState({ silent: true });
  render();
  toast("Данные восстановлены", "Исходные данные портала снова в админке.");
}

function exportJson(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("Экспорт готов", link.download);
}

function setPage(page) {
  if (!page) return;
  filters = { q: "", status: "all" };
  window.location.hash = page === "summary" ? "" : page;
  activePage = page;
  render();
}

function parsePage() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return FLAT_NAV_ITEMS.some(item => item.key === hash) ? hash : "summary";
}

window.addEventListener("hashchange", () => {
  activePage = parsePage();
  render();
});

function openRoute(route) {
  if (!route) return;
  const base = state.config?.siteUrl || PORTAL_URL;
  const url = route.startsWith("http") ? route : new URL(route, base).href;
  window.open(url, "_blank", "noopener");
}

function findItem(page, id) {
  return (state[page] || []).find(item => String(item.id) === String(id));
}

function nextId(items = []) {
  const numericIds = items.map(item => Number(item.id)).filter(Number.isFinite);
  return numericIds.length ? Math.max(...numericIds) + 1 : Date.now();
}

function statusOf(item) {
  if (item?.published === false) return "hidden";
  return item?.status || "published";
}

function chipClass(status) {
  if (status === "published") return "green";
  if (status === "pending" || status === "draft") return "amber";
  if (status === "hidden" || status === "archived") return "red";
  return "";
}

function streamTypeClass(type = "") {
  const normalized = normalizeStreamType(type);
  if (normalized === "полигон") return "range";
  if (normalized === "стрельбище") return "fire";
  return "room";
}

function titleOf(item, key) {
  const config = RESOURCE_CONFIGS[key] || {};
  return item?.[config.titleField] || item?.title || item?.name || item?.callsign || "Без названия";
}

function subtitleOf(item, key) {
  if (key === "courses") return [item.category === "professional" ? "Профессиональная" : "Военная", item.city, item.duration].filter(Boolean).join(" · ");
  if (key === "users") return [item.callsign, item.email].filter(Boolean).join(" · ");
  return item.subtitle || item.description || item.position || item.meta || item.category || item.address || "";
}

function sectionLabel(item, key) {
  if (key === "courses") return item.category === "professional" ? "Профессиональная" : "Военная";
  return RESOURCE_CONFIGS[key]?.title || key;
}

function routeOf(item, key) {
  if (item?.route) return item.route;
  if (key === "courses") return item.category === "professional" ? "/professional" : "/courses";
  return RESOURCE_CONFIGS[key]?.routeDefault || "/";
}

function loginOf(user) {
  return normalizeLogin(user.login || loginFromEmail(user.email) || user.callsign);
}

function imageHtml(item, key, className) {
  const field = RESOURCE_CONFIGS[key]?.imageField;
  const src = field ? item?.[field] : "";
  const fallback = initials(titleOf(item, key));
  if (!src) return `<span class="${className}">${escapeHtml(fallback)}</span>`;
  return `<span class="${className}"><img src="${escapeAttr(portalAssetUrl(src))}" alt="" data-fallback="${escapeAttr(fallback)}" /></span>`;
}

// Картинки портала лежат в apps/portal/public и отдаются с origin'а портала (:5173),
// а админка — отдельный origin (:3001). Относительные пути типа "/foto.jpg" нужно
// разворачивать в абсолютный URL портала, иначе превью 404-ит на чужом origin'е.
function portalAssetUrl(src) {
  if (!src) return "";
  if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:")) return src;
  // Превью всегда грузим с реального портала (dev: localhost:5173, прод: Vercel).
  // Раньше базой был state.config.siteUrl — маркетинговое поле «адрес сайта»
  // (например, ещё не существующий https://voevoda.ru), из-за чего ВСЕ превью
  // в админке оказывались битыми, хотя файлы лежали рядом.
  try {
    return new URL(src, PORTAL_URL).href;
  } catch {
    return src;
  }
}

// ---- Модальный выбор изображения --------------------------------------
// Заменяет поля "впиши имя файла" удобным окном: библиотека картинок портала,
// загрузка нового файла или ввод произвольной ссылки. Применение выбора зависит
// от target.mode — это разные способы привязки к данным (живой стейт vs.
// несохранённая форма модалки), см. applyImagePickerSelection().

let imagePicker = null;
let portalImagesCache = null;
let portalImagesPromise = null;

function openImagePicker(target) {
  imagePicker = { target, tab: "library", query: "", uploading: false, uploadError: "", urlDraft: undefined };
  document.querySelector(".image-picker-backdrop")?.remove();
  document.body.insertAdjacentHTML("beforeend", imagePickerHtml());
  bindImagePicker();
  if (portalImagesCache === null) loadPortalImages();
}

function closeImagePicker() {
  imagePicker = null;
  document.querySelector(".image-picker-backdrop")?.remove();
}

function refreshImagePicker() {
  if (!imagePicker) return;
  document.querySelector(".image-picker-backdrop")?.remove();
  document.body.insertAdjacentHTML("beforeend", imagePickerHtml());
  bindImagePicker();
}

async function loadPortalImages() {
  if (portalImagesPromise) return portalImagesPromise;
  portalImagesPromise = (async () => {
    try {
      const response = await fetchWithTimeout(IMAGES_URL, { headers: { Accept: "application/json" }, cache: "no-store" }, 8000);
      const data = await response.json();
      portalImagesCache = Array.isArray(data.images) ? data.images : [];
    } catch {
      portalImagesCache = [];
    }
    refreshImagePicker();
  })();
  return portalImagesPromise;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Ошибка чтения файла"));
    reader.readAsDataURL(file);
  });
}

async function handleImagePickerUpload(file) {
  if (!file || !imagePicker) return;
  if (!file.type?.startsWith("image/")) {
    imagePicker.uploadError = "Выберите файл изображения";
    refreshImagePicker();
    return;
  }
  imagePicker.uploading = true;
  imagePicker.uploadError = "";
  refreshImagePicker();
  try {
    const dataBase64 = await fileToDataUrl(file);
    const response = await fetchWithTimeout(IMAGES_UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...syncAuthHeaders() },
      body: JSON.stringify({ name: file.name, dataBase64 }),
    }, 20000);
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Не удалось загрузить файл");
    portalImagesCache = portalImagesCache ? [data.route, ...portalImagesCache.filter(item => item !== data.route)] : [data.route];
    toast("Фото загружено", data.route);
    applyImagePickerSelection(data.route);
  } catch (error) {
    if (imagePicker) {
      imagePicker.uploading = false;
      imagePicker.uploadError = String(error?.message || error);
      refreshImagePicker();
    }
  }
}

function applyImagePickerSelection(url) {
  const target = imagePicker?.target;
  closeImagePicker();
  if (!target) return;

  if (target.mode === "inline") {
    updateInlineField(target.page, target.id, target.field, url, "text");
    render();
  } else if (target.mode === "landing-field") {
    updateLandingField(target.field, url);
    render();
  } else if (target.mode === "landing-list") {
    updateLandingListItem(target.list, target.index, url);
    render();
  } else if (target.mode === "dom") {
    // Форма модалки (добавить/править, поток календаря) не привязана к стейту
    // напрямую — правим только DOM, чтобы не потерять остальные несохранённые поля.
    const input = document.getElementById(target.inputId);
    if (input) {
      input.value = url;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const preview = document.getElementById(target.previewId);
    if (preview) {
      preview.innerHTML = url
        ? `<img src="${escapeAttr(portalAssetUrl(url))}" alt="" data-fallback="Ф" />`
        : `<span>Нет фото</span>`;
    }
  }
}

function imagePickerGridItemsHtml() {
  const images = portalImagesCache;
  if (images === null) return `<div class="image-picker-loading">Загрузка библиотеки…</div>`;
  const q = (imagePicker.query || "").trim().toLowerCase();
  const filtered = q ? images.filter(src => src.toLowerCase().includes(q)) : images;
  if (!filtered.length) return `<div class="image-picker-empty">Ничего не найдено</div>`;
  return filtered.map(src => `
    <button type="button" class="image-picker-item ${src === imagePicker.target?.value ? "selected" : ""}" data-action="image-picker-select" data-src="${escapeAttr(src)}" title="${escapeAttr(src)}">
      <img src="${escapeAttr(portalAssetUrl(src))}" alt="" loading="lazy" />
    </button>
  `).join("");
}

function imagePickerHtml() {
  if (!imagePicker) return "";
  const images = portalImagesCache || [];
  return `
    <div class="image-picker-backdrop" data-action="close-image-picker">
      <div class="image-picker" onclick="event.stopPropagation()">
        <div class="image-picker-head">
          <h3>Выбор изображения</h3>
          <button type="button" class="btn icon" data-action="close-image-picker" title="Закрыть">✕</button>
        </div>
        <div class="image-picker-tabs">
          <button type="button" class="image-picker-tab ${imagePicker.tab === "library" ? "active" : ""}" data-action="image-picker-tab" data-tab="library">Библиотека · ${images.length}</button>
          <button type="button" class="image-picker-tab ${imagePicker.tab === "upload" ? "active" : ""}" data-action="image-picker-tab" data-tab="upload">Загрузить</button>
          <button type="button" class="image-picker-tab ${imagePicker.tab === "url" ? "active" : ""}" data-action="image-picker-tab" data-tab="url">Ссылка</button>
        </div>
        ${imagePicker.tab === "library" ? `
          <div class="image-picker-search">
            <input class="field" type="text" placeholder="Поиск по названию файла…" data-action="image-picker-search" value="${escapeAttr(imagePicker.query || "")}" />
          </div>
          <div class="image-picker-grid">${imagePickerGridItemsHtml()}</div>
        ` : ""}
        ${imagePicker.tab === "upload" ? `
          <div class="image-picker-upload">
            <label class="image-picker-dropzone">
              <input type="file" accept="image/*" data-action="image-picker-upload" hidden />
              <span>${imagePicker.uploading ? "Загрузка…" : "Нажмите, чтобы выбрать файл, или перетащите фото сюда"}</span>
            </label>
            ${imagePicker.uploadError ? `<p class="image-picker-error">${escapeHtml(imagePicker.uploadError)}</p>` : ""}
          </div>
        ` : ""}
        ${imagePicker.tab === "url" ? `
          <div class="image-picker-url">
            <label>Ссылка на изображение</label>
            <input class="field" type="text" placeholder="/photo.jpg или https://…" data-action="image-picker-url-input" value="${escapeAttr(imagePicker.urlDraft ?? imagePicker.target?.value ?? "")}" />
            <button type="button" class="btn black" data-action="image-picker-url-apply">Применить ссылку</button>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

function bindImagePicker() {
  const backdrop = document.querySelector(".image-picker-backdrop");
  if (!backdrop || !imagePicker) return;

  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) closeImagePicker();
  });
  backdrop.querySelectorAll("[data-action='close-image-picker']").forEach(el => el.addEventListener("click", closeImagePicker));
  backdrop.querySelectorAll("[data-action='image-picker-tab']").forEach(el => el.addEventListener("click", () => {
    imagePicker.tab = el.dataset.tab;
    refreshImagePicker();
  }));

  const search = backdrop.querySelector("[data-action='image-picker-search']");
  if (search) {
    search.addEventListener("input", () => {
      imagePicker.query = search.value;
      const grid = backdrop.querySelector(".image-picker-grid");
      if (grid) {
        grid.innerHTML = imagePickerGridItemsHtml();
        grid.querySelectorAll("[data-action='image-picker-select']").forEach(el => el.addEventListener("click", () => applyImagePickerSelection(el.dataset.src)));
      }
    });
  }
  backdrop.querySelectorAll("[data-action='image-picker-select']").forEach(el => el.addEventListener("click", () => applyImagePickerSelection(el.dataset.src)));

  const fileInput = backdrop.querySelector("[data-action='image-picker-upload']");
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (file) handleImagePickerUpload(file);
    });
  }
  const dropzone = backdrop.querySelector(".image-picker-dropzone");
  if (dropzone) {
    dropzone.addEventListener("dragover", event => { event.preventDefault(); dropzone.classList.add("drag"); });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag"));
    dropzone.addEventListener("drop", event => {
      event.preventDefault();
      dropzone.classList.remove("drag");
      const file = event.dataTransfer?.files?.[0];
      if (file) handleImagePickerUpload(file);
    });
  }

  const urlInput = backdrop.querySelector("[data-action='image-picker-url-input']");
  const urlApply = backdrop.querySelector("[data-action='image-picker-url-apply']");
  if (urlInput) {
    urlInput.addEventListener("input", () => { imagePicker.urlDraft = urlInput.value; });
    urlInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyImagePickerSelection(urlInput.value.trim());
      }
    });
  }
  if (urlApply) {
    urlApply.addEventListener("click", () => applyImagePickerSelection((imagePicker.urlDraft ?? urlInput?.value ?? "").trim()));
  }
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && imagePicker) closeImagePicker();
});

function fallbackAvatarNode(text, className = "") {
  const span = document.createElement("span");
  span.className = className || "avatar";
  span.textContent = initials(text);
  return span;
}

function toast(title, message = "") {
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `${escapeHtml(title)}${message ? `<span>${escapeHtml(message)}</span>` : ""}`;
  toastRoot.appendChild(el);
  window.setTimeout(() => el.remove(), 4200);
}

function list(value) {
  return Array.isArray(value) ? value.map(item => ({ ...item })) : [];
}

function splitLines(value = "") {
  return String(value)
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function deepMerge(base, overlay) {
  const output = { ...base };
  Object.entries(overlay || {}).forEach(([key, value]) => {
    output[key] = value && typeof value === "object" && !Array.isArray(value)
      ? deepMerge(output[key] || {}, value)
      // Повреждённые «??????»-значения не перезатирают целые (см. valueCorrupted)
      : pickMergedValue(output[key], value);
  });
  return output;
}

function setPath(target, path, value) {
  const parts = path.split(".");
  let cursor = target;
  parts.slice(0, -1).forEach(part => {
    cursor[part] = cursor[part] || {};
    cursor = cursor[part];
  });
  cursor[parts[parts.length - 1]] = value;
}

function sameLogin(user, demo) {
  return normalizeLogin(user?.login) === normalizeLogin(demo?.login);
}

function sameText(a, b) {
  return normalizeText(a) === normalizeText(b);
}

function normalizeText(value = "") {
  return String(value).trim().toLocaleLowerCase("ru-RU");
}

function normalizeLogin(value = "") {
  return String(value).trim().replace(/^@/, "").toLocaleLowerCase("ru-RU");
}

function loginFromEmail(email = "") {
  return String(email).split("@")[0] || "";
}

function initials(value = "") {
  const words = String(value).trim().split(/\s+/).filter(Boolean);
  return (words[0]?.[0] || "В").toLocaleUpperCase("ru-RU");
}

function formatNumber(value) {
  const number = Number(value) || 0;
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1).replace(".", ",")} тыс.`;
  return String(number);
}

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

let syncFailStreak = 0;

async function pingSync() {
  if (!SYNC_URL) return;
  const wasOffline = syncStatus.online !== true;
  try {
    const response = await fetchWithTimeout(SYNC_URL, { headers: { Accept: "application/json" }, cache: "no-store" }, 9000);
    if (response.ok) {
      syncFailStreak = 0;
      syncStatus.online = true;
    } else {
      syncFailStreak += 1;
      syncStatus.lastError = `Sync ${response.status}`;
      if (syncFailStreak >= 2) syncStatus.online = false;
    }
  } catch (error) {
    syncFailStreak += 1;
    syncStatus.lastError = String(error?.message || error);
    // Не гасим индикатор после единичного сбоя/таймаута — это бывает из-за HMR
    // портала; помечаем офлайн только после двух подряд неудачных пингов.
    if (syncFailStreak >= 2) syncStatus.online = false;
  }
  refreshSyncIndicators();
  // Если связь только что восстановилась и есть несохранённые изменения — пушим сейчас.
  if (wasOffline && syncStatus.online === true && syncDirty) {
    saveState({ silent: true });
  }
}

function refreshSyncIndicators() {
  const pill = document.getElementById("sync-pill");
  if (pill) pill.outerHTML = syncPillHtml();
  const banner = document.getElementById("sync-banner");
  if (banner) banner.outerHTML = syncBannerHtml();
}

window.setInterval(pingSync, 10000);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value);
}
