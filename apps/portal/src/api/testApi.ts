export type TestUser = {
  id: number;
  login: string;
  name: string;
  surname: string;
  callsign: string;
  rank: string;
  position: string;
  city: string;
  birthYear: string;
  onPortal: string;
  community: string;
  index: number;
  rating: number;
  courses: number;
  awards: number;
  followers: number;
  avatar: string;
  rankImage: string;
  badges: string[];
  extraCount: number;
  coverImage: string;
  bio: string;
  email: string;
  phone: string;
  // Роль для доступа к админ-панели. Синхронизирована с admin-seed-data.json.
  role: 'super' | 'admin' | 'instructor' | 'user';
};

const COMMON_BIO = 'Пришёл в военную подготовку осознанно: хотел стать выносливее, увереннее и научиться действовать в команде. На портале фиксирую прогресс, прохожу курсы и делюсь опытом с другими участниками.';

export const TEST_USERS: TestUser[] = [
  {
    id: 1, login: 'tornado', name: 'Александр', surname: 'Воеводов', callsign: 'Торнадо', rank: 'Майор',
    position: 'КР 2-й роты, 77-й учебный батальон', city: 'Санкт-Петербург', birthYear: '5 марта, 1990',
    onPortal: '2 года, 9 месяцев', community: '«Вымпел»', index: 2463, rating: 5, courses: 3, awards: 8,
    followers: 1288, avatar: '/teacher2-main.jpg', rankImage: '/rank1.png', badges: ['/1.png', '/2.png', '/3.png'],
    extraCount: 4, coverImage: '/profile.png',
    bio: 'Попал я в ВДВ не просто так. Ещё на гражданке отпрыгал в ДОСААФ три прыжка. Служивый может носить любые погоны, но мужество, выносливость и сила проверяются поступками.',
    email: 'tornado@voevoda.demo', phone: '+7 988 222 32 24', role: 'super',
  },
  {
    id: 2, login: 'bek', name: 'Бек', surname: 'Куратор', callsign: 'Бек', rank: 'Майор',
    position: 'Главный инструктор, группа КМБ-77', city: 'Москва', birthYear: '18 сентября, 1988',
    onPortal: '3 года, 2 месяца', community: 'Боевое братство Воеводы', index: 2388, rating: 4.9, courses: 22, awards: 12,
    followers: 964, avatar: '/teacher1-main.jpg', rankImage: '/rank1.png', badges: ['/2.png', '/1.png', '/3.png'],
    extraCount: 6, coverImage: '/profile.png',
    bio: 'Веду курсантов от первого занятия до итоговой аттестации. Основные направления — огневая подготовка, тактика малых групп и разбор учебных результатов.',
    email: 'bek@voevoda.demo', phone: '+7 988 222 32 25', role: 'admin',
  },
  {
    id: 3, login: 'koba', name: 'Коба', surname: 'Инструктор', callsign: 'Коба', rank: 'Капитан',
    position: 'Наставник учебной группы', city: 'Москва', birthYear: '11 января, 1992', onPortal: '1 год, 7 месяцев',
    community: 'Тактика малых групп', index: 2214, rating: 4.8, courses: 14, awards: 9, followers: 731,
    avatar: '/teacher3-main.jpg', rankImage: '/rank1.png', badges: ['/3.png', '/2.png', '/1.png'], extraCount: 3,
    coverImage: '/profile.png', bio: COMMON_BIO, email: 'koba@voevoda.demo', phone: '+7 988 222 32 26', role: 'instructor',
  },
  {
    id: 4, login: 'shooter', name: 'Сергей', surname: 'Стрелков', callsign: 'Стрелок', rank: 'Старший лейтенант',
    position: 'Инструктор огневой подготовки', city: 'Казань', birthYear: '2 июля, 1991', onPortal: '1 год, 3 месяца',
    community: 'Снайперский рубеж', index: 2096, rating: 4.7, courses: 11, awards: 7, followers: 518,
    avatar: '/sold1.png', rankImage: '/rank1.png', badges: ['/1.png', '/3.png', '/2.png'], extraCount: 2,
    coverImage: '/profile.png', bio: COMMON_BIO, email: 'shooter@voevoda.demo', phone: '+7 988 222 32 27', role: 'user',
  },
  {
    id: 5, login: 'nexus', name: 'Никита', surname: 'Связной', callsign: 'Нексус', rank: 'Лейтенант',
    position: 'Специалист связи учебной группы', city: 'Москва', birthYear: '23 ноября, 1994', onPortal: '10 месяцев',
    community: 'Связь и управление', index: 1842, rating: 4.6, courses: 8, awards: 5, followers: 403,
    avatar: '/teacher2-main.jpg', rankImage: '/rank1.png', badges: ['/2.png', '/3.png', '/1.png'], extraCount: 1,
    coverImage: '/profile.png', bio: COMMON_BIO, email: 'nexus@voevoda.demo', phone: '+7 988 222 32 28', role: 'user',
  },
];

const normalize = (value: string) => decodeURIComponent(value).replace(/^@/, '').trim().toLocaleLowerCase('ru-RU');
const byLogin = new Map(TEST_USERS.map(user => [normalize(user.login), user]));
const byName = new Map(TEST_USERS.flatMap(user => [
  [normalize(user.callsign), user] as const,
  [normalize(user.name), user] as const,
  [normalize(`${user.name} ${user.surname}`), user] as const,
]));

function genericTestUser(login: string): TestUser {
  const normalized = normalize(login);
  const displayName = decodeURIComponent(login).replace(/[-_]+/g, ' ').replace(/^(.)/, letter => letter.toLocaleUpperCase('ru-RU'));
  return {
    ...TEST_USERS[0],
    id: Math.abs(Array.from(normalized).reduce((sum, char) => sum + char.charCodeAt(0), 0)),
    login: normalized,
    name: displayName,
    surname: 'Участник',
    callsign: displayName,
    rank: 'Курсант',
    position: 'Участник учебной группы Воеводы',
    index: 1200,
    rating: 4.5,
    courses: 2,
    awards: 3,
    followers: 128,
    bio: COMMON_BIO,
    email: `${encodeURIComponent(normalized)}@voevoda.demo`,
    phone: '+7 900 000 00 00',
    role: 'user', // не наследуем роль Торнадо при spread TEST_USERS[0]
  };
}

export function getTestUser(value?: string | null) {
  if (!value) return null;
  const normalized = normalize(value);
  return byLogin.get(normalized) || byName.get(normalized) || genericTestUser(normalized);
}

export function findTestUser(value?: string | null) {
  if (!value) return null;
  const normalized = normalize(value);
  return byLogin.get(normalized) || byName.get(normalized) || null;
}

export function userProfilePath(value?: string | null) {
  if (!value) return '/profile';
  const user = findTestUser(value);
  const login = user?.login ?? normalize(value);
  return `/users/${encodeURIComponent(login)}`;
}

const delay = <T,>(value: T) => new Promise<T>(resolve => window.setTimeout(() => resolve(value), 80));

export const testApi = {
  users: {
    list: () => delay(TEST_USERS),
    get: (login: string) => delay(getTestUser(login)),
  },
};
