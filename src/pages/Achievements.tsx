import { useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { shareOrCopy } from '../utils/share';
import { PortalBreadcrumb } from '../components/PortalBreadcrumb';

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Rarity    = 'common' | 'rare' | 'epic' | 'legend';
type Category  = 'all' | 'system' | 'edu' | 'sport' | 'war' | 'social' | 'market';
type AchStatus = 'earned' | 'inprogress' | 'locked' | 'hidden';
type ViewMode  = 'grid' | 'board';
type SvgTemplate = 'ribbon-medal' | 'cross-medal' | 'star-order' | 'grand-order' | 'shield-chevron' | 'shoulder-board';
type SvgTint     = 'silver' | 'khaki' | 'gold' | 'green' | 'purple' | 'military-green';

type Trigger = 'auto' | 'manual';

interface Achievement {
  id: number; name: string; category: Exclude<Category,'all'>; categoryLabel: string;
  condition: string; conditionFull: string; rarity: Rarity; rarityLabel: string;
  svgTemplate: SvgTemplate; svgTint: SvgTint; maxProgress: number;
  prerequisite: number | null; hidden: boolean; elite: boolean;
  points: number; trigger: Trigger;
}
interface EarnedInfo   { date: string; pct: number; }
interface ProgressInfo { current: number; max: number; }
interface Particle     { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; shape: 'circle'|'rect'|'star'; }

// ─── IMAGE MAP ────────────────────────────────────────────────────────────────
const MEDAL_IMAGE_MAP: Record<SvgTemplate, string> = {
  'ribbon-medal':   '/медаль1.png',
  'shoulder-board': '/медаль3.png',
  'shield-chevron': '/medal.png',
  'cross-medal':    '/медаль2.png',
  'star-order':     '/медаль3.png',
  'grand-order':    '/medal.png',
};
const MEDAL_IMAGE_VARIANTS = [
  '/медаль1.png', '/медаль2.png', '/медаль3.png', '/medal.png',
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const RARITY_COLOR: Record<Rarity,string> = { common:'#6B7280', rare:'#10B981', epic:'#7C3AED', legend:'#F59E0B' };
const RARITY_BG:    Record<Rarity,string> = { common:'#F3F4F6', rare:'#ECFDF5', epic:'#F5F3FF', legend:'#FFFBEB' };
const RARITY_GLOW:  Record<Rarity,string> = { common:'rgba(107,114,128,.2)', rare:'rgba(16,185,129,.25)', epic:'rgba(124,58,237,.25)', legend:'rgba(245,158,11,.3)' };
const STATUS_COLOR: Record<AchStatus,string> = { earned:'#10B981', inprogress:'#375DFB', locked:'#9CA3AF', hidden:'#6B7280' };

function CategoryIcon({ cat, size = 16, color = 'currentColor' }: { cat: Exclude<Category,'all'>; size?: number; color?: string }) {
  const common = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<Exclude<Category,'all'>, ReactNode> = {
    system: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.9-1.1L14.3 3H10l-.4 2.9A7 7 0 0 0 7.7 7L5.3 6l-2 3.4 2 1.5A7 7 0 0 0 5.2 12c0 .4 0 .8.1 1.1l-2 1.5 2 3.4 2.4-1c.6.5 1.2.8 1.9 1.1l.4 2.9h4.3l.4-2.9c.7-.3 1.3-.6 1.9-1.1l2.4 1 2-3.4-2-1.5c.1-.4.1-.7.1-1.1Z" /></>,
    edu: <><path d="M4 5h7a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4Z" /><path d="M20 5h-5a4 4 0 0 0-4 4" /></>,
    sport: <><path d="M6 16V8M18 16V8M3 13V11M21 13v-2M6 12h12" /></>,
    war: <><path d="M12 3l7 4v5c0 4.5-2.9 7.7-7 9-4.1-1.3-7-4.5-7-9V7Z" /><path d="M12 8v7M9 11h6" /></>,
    social: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.8M16 3.2a4 4 0 0 1 0 7.6" /></>,
    market: <><path d="M6 2 3 6v16h18V6l-3-4Z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></>,
  };

  return <svg width={size} height={size} viewBox="0 0 24 24" {...common}>{paths[cat]}</svg>;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const INIT_EARNED: Record<number,EarnedInfo> = {
  1:  { date:'01 января 2024',  pct:8.4  }, 2:  { date:'02 января 2024',  pct:12.1 },
  3:  { date:'02 января 2024',  pct:15.6 }, 4:  { date:'10 января 2024',  pct:31.2 },
  5:  { date:'15 февраля 2024', pct:27.8 }, 12: { date:'20 февраля 2024', pct:42.3 },
  17: { date:'01 марта 2024',   pct:38.1 }, 18: { date:'01 марта 2024',   pct:29.7 },
  24: { date:'15 марта 2024',   pct:44.5 }, 30: { date:'16 марта 2024',   pct:55.2 },
  32: { date:'20 марта 2024',   pct:47.9 }, 40: { date:'25 марта 2024',   pct:61.3 },
};
const INIT_PROGRESS: Record<number,ProgressInfo> = {
  10: { current:8,  max:10  }, 8:  { current:2,  max:4   }, 25: { current:3,  max:5   },
  21: { current:18, max:30  }, 34: { current:67, max:100 }, 38: { current:3,  max:5   },
  6:  { current:1,  max:1   },
};
// points + trigger соответствуют реестру директора (Версия 1.0, Май 2026)
// Удалены несуществующие ID 51, 52; исправлены категории ID 29 (war→social), ID 43 (social→market)
// Исправлены названия: ID 6, 12, 26
const ACHIEVEMENTS: Achievement[] = [
  // ── СИСТЕМА (7) ────────────────────────────────────────────────────────────
  { id:1,  name:'Первый шаг',                     category:'system', categoryLabel:'Система',         condition:'Зарегистрироваться на портале',                  conditionFull:'Завершите регистрацию аккаунта на портале и подтвердите номер телефона.',                                                                    rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:10,   trigger:'auto'   },
  { id:2,  name:'Личное дело открыто',             category:'system', categoryLabel:'Система',         condition:'Заполнить профиль на 100%',                       conditionFull:'Заполните все поля профиля: фото, позывной, город, дата рождения, специальность.',                                                          rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:20,   trigger:'auto'   },
  { id:3,  name:'Позывной принят',                 category:'system', categoryLabel:'Система',         condition:'Установить позывной и загрузить аватар',          conditionFull:'Установите свой военный позывной и загрузите фотографию профиля.',                                                                           rarity:'common', rarityLabel:'Обычная',     svgTemplate:'shoulder-board', svgTint:'khaki',          maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:15,   trigger:'auto'   },
  { id:46, name:'Индекс Воеводы 3.0',              category:'system', categoryLabel:'Система',         condition:'Достичь индекса Воеводы 3.0 и выше',             conditionFull:'Средний балл по всем 5 направлениям подготовки должен составить не менее 3.0.',                                                             rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:100,  trigger:'auto'   },
  { id:47, name:'Индекс Воеводы 4.5',              category:'system', categoryLabel:'Система',         condition:'Достичь индекса Воеводы 4.5 и выше',             conditionFull:'Средний балл по всем 5 направлениям должен составить не менее 4.5.',                                                                         rarity:'epic',   rarityLabel:'Эпическая',   svgTemplate:'star-order',     svgTint:'purple',         maxProgress:1,   prerequisite:46,   hidden:false, elite:false, points:250,  trigger:'auto'   },
  { id:48, name:'Я — Воевода!',                    category:'system', categoryLabel:'Система',         condition:'Индекс 5.0 по всем 5 направлениям подготовки',   conditionFull:'Достигните максимального балла 5.0 по физической, тактической, командирской, инструкторской и интеллектуальной подготовке одновременно.',  rarity:'legend', rarityLabel:'Легендарная', svgTemplate:'grand-order',    svgTint:'gold',           maxProgress:5,   prerequisite:47,   hidden:true,  elite:true,  points:1000, trigger:'auto'   },
  { id:49, name:'Год в строю',                     category:'system', categoryLabel:'Система',         condition:'Быть активным пользователем портала 365 дней',   conditionFull:'Заходите на портал и совершайте действия на протяжении 365 дней с первой активности.',                                                      rarity:'epic',   rarityLabel:'Эпическая',   svgTemplate:'star-order',     svgTint:'purple',         maxProgress:365, prerequisite:null, hidden:false, elite:false, points:300,  trigger:'auto'   },
  // ── ОБУЧЕНИЕ (15) ──────────────────────────────────────────────────────────
  { id:4,  name:'Курсант',                         category:'edu',    categoryLabel:'Обучение',        condition:'Записаться на первый курс',                       conditionFull:'Оформите запись на любой курс в разделе Военная подготовка.',                                                                                rarity:'common', rarityLabel:'Обычная',     svgTemplate:'shoulder-board', svgTint:'khaki',          maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:10,   trigger:'auto'   },
  { id:5,  name:'Первый диплом',                   category:'edu',    categoryLabel:'Обучение',        condition:'Успешно завершить первый курс',                   conditionFull:'Пройдите все занятия, сдайте все домашние задания и финальный экзамен любого курса.',                                                       rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:4,    hidden:false, elite:false, points:50,   trigger:'auto'   },
  { id:6,  name:'Отличник боевой подготовки',      category:'edu',    categoryLabel:'Обучение',        condition:'Завершить курс с итоговым баллом 4.5+',           conditionFull:'Пройдите любой курс и получите итоговый балл не ниже 4.5 из 5.0.',                                                                          rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:1,   prerequisite:5,    hidden:false, elite:false, points:150,  trigger:'auto'   },
  { id:7,  name:'Сдал на шеврон',                  category:'edu',    categoryLabel:'Обучение',        condition:'Пройти экзамен и получить шеврон Воевода',        conditionFull:'Успешно сдайте квалификационный экзамен и получите официальный шеврон УТЦ Воевода.',                                                       rarity:'epic',   rarityLabel:'Эпическая',   svgTemplate:'shield-chevron', svgTint:'military-green', maxProgress:1,   prerequisite:8,    hidden:false, elite:false, points:500,  trigger:'manual' },
  { id:8,  name:'Серия не прервана',               category:'edu',    categoryLabel:'Обучение',        condition:'Пройти все курсы одной серии подряд',             conditionFull:'Завершите все курсы одной учебной серии без пропусков.',                                                                                    rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:4,   prerequisite:5,    hidden:false, elite:false, points:200,  trigger:'auto'   },
  { id:9,  name:'Пять дисциплин',                  category:'edu',    categoryLabel:'Обучение',        condition:'Завершить курсы по 5 разным дисциплинам',         conditionFull:'Пройдите курсы из 5 дисциплин: Военное дело, Оружие, Медицина, БПЛА, Тактика.',                                                           rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:5,   prerequisite:5,    hidden:false, elite:false, points:180,  trigger:'auto'   },
  { id:10, name:'Академик',                        category:'edu',    categoryLabel:'Обучение',        condition:'Завершить 10 курсов на портале',                  conditionFull:'Успешно завершите 10 любых курсов в разделе Военная подготовка.',                                                                           rarity:'epic',   rarityLabel:'Эпическая',   svgTemplate:'star-order',     svgTint:'purple',         maxProgress:10,  prerequisite:5,    hidden:false, elite:false, points:400,  trigger:'auto'   },
  { id:11, name:'Ни одного пропуска',              category:'edu',    categoryLabel:'Обучение',        condition:'Посетить все занятия курса без пропусков',        conditionFull:'Отметьтесь «В строю» на каждом занятии одного курса при 100% посещаемости.',                                                               rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:1,   prerequisite:4,    hidden:false, elite:false, points:200,  trigger:'auto'   },
  { id:12, name:'Домашка сдана вовремя',           category:'edu',    categoryLabel:'Обучение',        condition:'Сдать 10 домашних заданий до дедлайна подряд',   conditionFull:'Сдайте 10 домашних заданий подряд, не нарушив ни одного дедлайна.',                                                                         rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:10,  prerequisite:null, hidden:false, elite:false, points:80,   trigger:'auto'   },
  { id:13, name:'Снайпер',                         category:'edu',    categoryLabel:'Обучение',        condition:'Набрать 100% в тесте с первой попытки',           conditionFull:'Ответьте правильно на все вопросы теста с первой попытки, без пересдачи.',                                                                  rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:150,  trigger:'auto'   },
  { id:14, name:'Тактик',                          category:'edu',    categoryLabel:'Обучение',        condition:'Успешно пройти тактический симулятор',            conditionFull:'Завершите интерактивный тактический симулятор в разделе Академия.',                                                                          rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'shield-chevron', svgTint:'military-green', maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:150,  trigger:'auto'   },
  { id:15, name:'Орёл',                            category:'edu',    categoryLabel:'Обучение',        condition:'Завершить курс по управлению БПЛА',               conditionFull:'Пройдите полный курс оператора БПЛА и сдайте квалификационный экзамен.',                                                                    rarity:'epic',   rarityLabel:'Эпическая',   svgTemplate:'star-order',     svgTint:'purple',         maxProgress:1,   prerequisite:10,   hidden:false, elite:false, points:400,  trigger:'auto'   },
  { id:16, name:'Медик',                           category:'edu',    categoryLabel:'Обучение',        condition:'Пройти курс тактической медицины',                conditionFull:'Завершите курс тактической медицины и получите соответствующий диплом.',                                                                    rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:1,   prerequisite:5,    hidden:false, elite:false, points:150,  trigger:'auto'   },
  { id:44, name:'ИИ-боец',                         category:'edu',    categoryLabel:'Обучение',        condition:'Пройти тест IQ (матрицы Равена)',                conditionFull:'Выполните тест интеллекта (матрицы Равена) в разделе Академия.',                                                                             rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:20,   trigger:'auto'   },
  { id:45, name:'Высокий IQ',                      category:'edu',    categoryLabel:'Обучение',        condition:'Набрать в тесте IQ более 120 баллов',            conditionFull:'Пройдите тест матриц Равена и наберите результат выше 120 стандартных баллов.',                                                              rarity:'epic',   rarityLabel:'Эпическая',   svgTemplate:'star-order',     svgTint:'purple',         maxProgress:1,   prerequisite:44,   hidden:false, elite:false, points:350,  trigger:'auto'   },
  // ── ФИЗПОДГОТОВКА (6) ──────────────────────────────────────────────────────
  { id:17, name:'Тест Купера сдан',                category:'sport',  categoryLabel:'Физподготовка',   condition:'Зафиксировать результат теста Купера',           conditionFull:'Пройдите тест Купера и внесите результат в раздел Физическая подготовка.',                                                                   rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:20,   trigger:'auto'   },
  { id:18, name:'Физическая форма',                category:'sport',  categoryLabel:'Физподготовка',   condition:'Набрать оценку физподготовки 3.0+',              conditionFull:'Ваш индекс физической подготовки по результатам тестов должен составить 3.0 или выше.',                                                     rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:17,   hidden:false, elite:false, points:50,   trigger:'auto'   },
  { id:19, name:'Атлет',                           category:'sport',  categoryLabel:'Физподготовка',   condition:'Набрать оценку физподготовки 4.5+',              conditionFull:'Достигните индекса физической подготовки 4.5 или выше.',                                                                                    rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:1,   prerequisite:18,   hidden:false, elite:false, points:200,  trigger:'auto'   },
  { id:20, name:'Элита',                           category:'sport',  categoryLabel:'Физподготовка',   condition:'Набрать максимальную оценку физподготовки 5.0',  conditionFull:'Достигните максимального индекса физической подготовки 5.0 — высшая оценка по всем показателям.',                                         rarity:'legend', rarityLabel:'Легендарная', svgTemplate:'grand-order',    svgTint:'gold',           maxProgress:1,   prerequisite:19,   hidden:true,  elite:true,  points:750,  trigger:'auto'   },
  { id:21, name:'30 тренировок',                   category:'sport',  categoryLabel:'Физподготовка',   condition:'Внести данные 30 тренировок в систему',          conditionFull:'Зафиксируйте результаты 30 тренировок в разделе Мой путь Воеводы.',                                                                        rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:30,  prerequisite:17,   hidden:false, elite:false, points:150,  trigger:'auto'   },
  { id:22, name:'Марафонец',                       category:'sport',  categoryLabel:'Физподготовка',   condition:'Принять участие в военно-спортивном марафоне',   conditionFull:'Зарегистрируйтесь и примите участие в любом военно-спортивном марафоне УТЦ Воевода.',                                                     rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:200,  trigger:'manual' },
  // ── УЧЕНИЯ/СОРЕВНОВАНИЯ (7) ────────────────────────────────────────────────
  { id:24, name:'Боевое крещение',                 category:'war',    categoryLabel:'Учения',          condition:'Принять участие в первых учениях',               conditionFull:'Запишитесь и примите участие в любых учениях, организованных УТЦ Воевода.',                                                                 rarity:'common', rarityLabel:'Обычная',     svgTemplate:'shield-chevron', svgTint:'military-green', maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:30,   trigger:'auto'   },
  { id:25, name:'5 учений',                        category:'war',    categoryLabel:'Учения',          condition:'Участвовать в 5 учениях',                        conditionFull:'Примите участие в 5 учениях суммарно.',                                                                                                      rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:5,   prerequisite:24,   hidden:false, elite:false, points:150,  trigger:'auto'   },
  { id:23, name:'Чемпион учений',                  category:'war',    categoryLabel:'Учения',          condition:'Занять 1-е место на учениях',                    conditionFull:'Участвуйте в учениях на стороне, которая победила по итогам боевых задач.',                                                                 rarity:'epic',   rarityLabel:'Эпическая',   svgTemplate:'star-order',     svgTint:'purple',         maxProgress:1,   prerequisite:25,   hidden:false, elite:false, points:400,  trigger:'manual' },
  { id:26, name:'Победитель соревнований',         category:'war',    categoryLabel:'Учения',          condition:'Занять призовое место (1–3) в соревнованиях',    conditionFull:'Займите 1-е, 2-е или 3-е место на любых официальных соревнованиях УТЦ Воевода.',                                                           rarity:'epic',   rarityLabel:'Эпическая',   svgTemplate:'star-order',     svgTint:'purple',         maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:400,  trigger:'manual' },
  { id:27, name:'Тактическое ориентирование',      category:'war',    categoryLabel:'Учения',          condition:'Участвовать в «Тактическом ориентировании»',     conditionFull:'Зарегистрируйтесь и примите участие в соревновании по тактическому ориентированию.',                                                       rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'shield-chevron', svgTint:'military-green', maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:150,  trigger:'auto'   },
  { id:28, name:'Боевая четвёрка',                 category:'war',    categoryLabel:'Учения',          condition:'Участвовать в соревновании «Боевая четвёрка»',   conditionFull:'Зарегистрируйтесь в команде из 4 человек и примите участие в соревновании.',                                                              rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'shield-chevron', svgTint:'military-green', maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:150,  trigger:'auto'   },
  { id:50, name:'Рапорт составлен',                category:'war',    categoryLabel:'Учения',          condition:'Составить и отправить первый рапорт командиру',  conditionFull:'Используйте функцию рапортов в разделе Учения и отправьте рапорт командиру через портал.',                                               rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:20,   trigger:'auto'   },
  // ── СОЦИАЛЬНАЯ СЕТЬ (11) ───────────────────────────────────────────────────
  { id:29, name:'Возьму на борт',                  category:'social', categoryLabel:'Социальная сеть', condition:'3 раза воспользоваться функцией «Возьму на борт»',conditionFull:'Используйте функцию «Возьму на борт» и дайте подвезти 3 участников на учения.',                                                           rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:3,   prerequisite:null, hidden:false, elite:false, points:30,   trigger:'auto'   },
  { id:30, name:'Свой в команде',                  category:'social', categoryLabel:'Социальная сеть', condition:'Вступить в сообщество на портале',               conditionFull:'Подайте заявку и вступите в любое сообщество в разделе Сообщества.',                                                                       rarity:'common', rarityLabel:'Обычная',     svgTemplate:'shield-chevron', svgTint:'military-green', maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:15,   trigger:'auto'   },
  { id:31, name:'Наставник',                       category:'social', categoryLabel:'Социальная сеть', condition:'Довести новичка до завершения первого курса',     conditionFull:'Возьмите новичка под наставничество и помогите ему завершить первый курс.',                                                                 rarity:'epic',   rarityLabel:'Эпическая',   svgTemplate:'star-order',     svgTint:'purple',         maxProgress:1,   prerequisite:5,    hidden:false, elite:false, points:400,  trigger:'auto'   },
  { id:32, name:'Голос в строю',                   category:'social', categoryLabel:'Социальная сеть', condition:'Опубликовать первую статью в журнале',           conditionFull:'Напишите и опубликуйте первую статью или запись в блоге в разделе Журнал.',                                                                 rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:20,   trigger:'auto'   },
  { id:33, name:'Публицист',                       category:'social', categoryLabel:'Социальная сеть', condition:'Опубликовать 10 статей или постов в блоге',      conditionFull:'Суммарно опубликуйте 10 материалов в разделе Журнал.',                                                                                      rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:10,  prerequisite:32,   hidden:false, elite:false, points:150,  trigger:'auto'   },
  { id:34, name:'100 подписчиков',                 category:'social', categoryLabel:'Социальная сеть', condition:'Набрать 100 подписчиков на профиль',             conditionFull:'Привлеките 100 подписчиков на свой профиль на портале.',                                                                                    rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:100, prerequisite:null, hidden:false, elite:false, points:150,  trigger:'auto'   },
  { id:35, name:'Народный герой',                  category:'social', categoryLabel:'Социальная сеть', condition:'Набрать 500 подписчиков на профиль',             conditionFull:'Привлеките 500 подписчиков на свой профиль.',                                                                                               rarity:'epic',   rarityLabel:'Эпическая',   svgTemplate:'star-order',     svgTint:'purple',         maxProgress:500, prerequisite:34,   hidden:true,  elite:false, points:400,  trigger:'auto'   },
  { id:36, name:'Отзыв оставлен',                  category:'social', categoryLabel:'Социальная сеть', condition:'Оставить отзыв о пройденном курсе',              conditionFull:'После завершения любого курса оставьте развёрнутый отзыв на странице курса.',                                                               rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:5,    hidden:false, elite:false, points:20,   trigger:'auto'   },
  { id:37, name:'Пригласи бойца',                  category:'social', categoryLabel:'Социальная сеть', condition:'Пригласить друга по реф-ссылке',                 conditionFull:'Поделитесь реферальной ссылкой, и ваш друг должен зарегистрироваться по ней.',                                                             rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:50,   trigger:'auto'   },
  { id:38, name:'Командир взвода',                 category:'social', categoryLabel:'Социальная сеть', condition:'Привести 5 друзей, прошедших хотя бы один курс', conditionFull:'5 пользователей по вашей реф. ссылке должны завершить хотя бы один курс.',                                                                 rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'shoulder-board', svgTint:'khaki',          maxProgress:5,   prerequisite:37,   hidden:false, elite:false, points:200,  trigger:'auto'   },
  { id:39, name:'Майор рекрутинга',                category:'social', categoryLabel:'Социальная сеть', condition:'Привести 20 активных пользователей через реф.',  conditionFull:'20 пользователей по вашей ссылке должны быть активными (прошли хотя бы один курс).',                                                      rarity:'legend', rarityLabel:'Легендарная', svgTemplate:'grand-order',    svgTint:'gold',           maxProgress:20,  prerequisite:38,   hidden:true,  elite:true,  points:750,  trigger:'auto'   },
  // ── МАРКЕТПЛЕЙС (4) ────────────────────────────────────────────────────────
  { id:40, name:'Каптёрщик',                       category:'market', categoryLabel:'Маркетплейс',     condition:'Совершить первую покупку в Военмаркете',         conditionFull:'Оформите и оплатите любой заказ в разделе Военмаркет.',                                                                                    rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:20,   trigger:'auto'   },
  { id:41, name:'Первое объявление',               category:'market', categoryLabel:'Маркетплейс',     condition:'Разместить объявление в Каптёрке',               conditionFull:'Создайте и опубликуйте объявление о продаже товара в разделе Каптёрка.',                                                                   rarity:'common', rarityLabel:'Обычная',     svgTemplate:'ribbon-medal',   svgTint:'silver',         maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:20,   trigger:'auto'   },
  { id:42, name:'Продавец',                        category:'market', categoryLabel:'Маркетплейс',     condition:'Совершить 5 успешных продаж в Каптёрке',         conditionFull:'Продайте 5 товаров через раздел Каптёрка, получив подтверждение от покупателей.',                                                         rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:5,   prerequisite:41,   hidden:false, elite:false, points:150,  trigger:'auto'   },
  { id:43, name:'Щедрость',                        category:'market', categoryLabel:'Маркетплейс',     condition:'Откликнуться на запрос благотворительной помощи',conditionFull:'Откликнитесь на запрос о помощи в разделе Благотворительная помощь.',                                                                       rarity:'rare',   rarityLabel:'Редкая',      svgTemplate:'cross-medal',    svgTint:'green',          maxProgress:1,   prerequisite:null, hidden:false, elite:false, points:150,  trigger:'auto'   },
];
const CATEGORY_STATS: { cat: Exclude<Category,'all'>; label: string; total: number; routeKey: string }[] = [
  { cat:'edu',    label:'Обучение',       total:15, routeKey:'/courses'    },
  { cat:'sport',  label:'Физподготовка',  total:6,  routeKey:'/sport'      },
  { cat:'war',    label:'Учения',         total:7,  routeKey:'/exercises'  },
  { cat:'social', label:'Социальная сеть',total:11, routeKey:'/community'  },
  { cat:'market', label:'Маркетплейс',    total:4,  routeKey:'/market'     },
  { cat:'system', label:'Система',        total:7,  routeKey:'/profile'    },
];
const DEP_CHAINS = [
  { title:'Путь курсанта',  chain:[4,5,8,7],    color:'#375DFB' },
  { title:'Путь академика', chain:[4,5,10,15],  color:'#7C3AED' },
  { title:'Путь воина',     chain:[24,25,23],   color:'#EF4444' },
  { title:'Путь рекрутёра', chain:[37,38,39],   color:'#10B981' },
  { title:'Путь атлета',    chain:[17,18,19,20],color:'#F59E0B' },
  { title:'Путь Воеводы',   chain:[46,47,48],   color:'#375DFB' },
];
const VOEVODA_INDEX = [
  { label:'Физ.', value:3.8, max:5 },
  { label:'Такт.', value:4.2, max:5 },
  { label:'Комд.', value:2.9, max:5 },
  { label:'Инстр.', value:3.5, max:5 },
  { label:'Интел.', value:4.6, max:5 },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');

* { font-family: 'Manrope', sans-serif; box-sizing: border-box; }

@keyframes fadeUp      { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn      { from{opacity:0} to{opacity:1} }
@keyframes scaleIn     { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
@keyframes slideRight  { from{width:0} to{width:var(--w)} }
@keyframes ringFill    { from{stroke-dashoffset:var(--full)} to{stroke-dashoffset:var(--offset)} }
@keyframes countUp     { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse       { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
@keyframes shimmer     { from{background-position:-400px 0} to{background-position:400px 0} }
@keyframes floatUp     { 0%{transform:translateY(0) rotate(var(--r));opacity:1} 100%{transform:translateY(-120px) rotate(calc(var(--r)+180deg));opacity:0} }
@keyframes starBurst   { 0%{transform:scale(0) rotate(0deg);opacity:1} 100%{transform:scale(3) rotate(180deg);opacity:0} }
@keyframes medalDrop   { 0%{transform:translateY(-200px) rotate(-20deg) scale(0.4);opacity:0} 55%{transform:translateY(14px) rotate(4deg) scale(1.08);opacity:1} 75%{transform:translateY(-6px) rotate(-1deg) scale(0.97)} 100%{transform:translateY(0) rotate(0) scale(1);opacity:1} }
@keyframes glowPulse   { 0%,100%{box-shadow:0 0 30px 10px var(--glow)} 50%{box-shadow:0 0 70px 30px var(--glow)} }
@keyframes textReveal  { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
@keyframes borderDraw  { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }
@keyframes nodePulse   { 0%,100%{r:20} 50%{r:22} }
@keyframes sparkle     { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
@keyframes ribbonSlide { from{transform:translateX(-100%)} to{transform:translateX(0)} }
@keyframes confettiFall{ 0%{transform:translateY(-30px) rotate(0deg) scale(1);opacity:1} 100%{transform:translateY(280px) rotate(var(--spin)) scale(0.6);opacity:0} }
@keyframes ringAppear  { from{transform:scale(0) rotate(-90deg);opacity:0} to{transform:scale(1) rotate(0deg);opacity:1} }
@keyframes tooltipIn   { from{opacity:0;transform:translateX(-50%) translateY(6px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

.ach-card { transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease, border-color .22s ease; }
.ach-card:hover { transform: translateY(-5px) scale(1.02); border-color:var(--rarity-color)!important; box-shadow:0 0 0 1px var(--rarity-color),0 12px 32px var(--rarity-glow)!important; }
.ach-card:active { transform: translateY(-2px) scale(1.01); }

.slot-drop { transition: all .2s ease; }
.slot-drop:hover { border-color: #375DFB !important; background: #EBF1FF !important; transform: scale(1.06); }

.tab-pill { transition: all .18s ease; }
.tab-pill:hover:not(.active) { border-color: #375DFB !important; color: #375DFB !important; background: #EBF1FF !important; }

.btn-primary { transition: all .18s cubic-bezier(.34,1.56,.64,1); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(55,93,251,.3); }
.btn-primary:active { transform: translateY(0); }

.tree-node { cursor:pointer; }
.tree-node-card { transition:stroke-width .18s ease,filter .18s ease,fill .18s ease; }
.tree-node:hover .tree-node-card { stroke-width:3px!important; filter:drop-shadow(0 6px 8px rgba(55,93,251,.24)) brightness(1.03)!important; }
.tree-node-label { transition:font-size .18s ease,font-weight .18s ease; }
.tree-node:hover .tree-node-label { font-size:9.5px; font-weight:800; }

.board-medal { transition: transform .2s cubic-bezier(.34,1.56,.64,1), filter .2s ease; }
.board-medal:hover { transform: scale(1.18) translateY(-4px); filter: drop-shadow(0 8px 16px rgba(0,0,0,.35)); }

.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 400px 100%;
  animation: shimmer 1.5s infinite;
}

.ring-container { animation: ringAppear .6s cubic-bezier(.34,1.56,.64,1) both; }

.vr-row { transition: background .15s ease; }
.vr-row:hover { background: #F0F4FF !important; }

.progress-bar-fill {
  animation: slideRight .8s cubic-bezier(.4,0,.2,1) both;
  animation-delay: var(--delay, 0s);
}

/* ── Achievements responsive ── */
.ach-page-shell { width: 100%; max-width: 1460px; margin: 0 auto; }
.ach-showcase-layout { display:grid; grid-template-columns:minmax(0,1fr) 250px; gap:18px; padding:20px 24px 24px; }
.ach-showcase-slots { display:grid; grid-template-columns:repeat(5,minmax(112px,1fr)); gap:12px; min-width:0; }
.ach-showcase-slot { min-height:148px; border-radius:18px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; position:relative; cursor:pointer; transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease; }
.ach-showcase-slot:hover { transform:translateY(-3px); border-color:var(--rarity-color,#375DFB)!important; box-shadow:0 0 0 1px var(--rarity-color,#375DFB),0 12px 30px var(--rarity-glow,rgba(55,93,251,.18))!important; }
.ach-rarity-option { transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease; }
.ach-rarity-option:hover { transform:translateY(-2px); border-color:var(--rarity-color)!important; box-shadow:0 0 0 1px var(--rarity-color),0 10px 28px var(--rarity-glow)!important; }
.ach-showcase-summary { border-radius:18px; padding:18px; color:#fff; background:linear-gradient(145deg,#101a31,#243c73); position:relative; overflow:hidden; }
.ach-progress-grid { display: grid; grid-template-columns: minmax(0,1.35fr) minmax(340px,.65fr); gap: 20px; padding: 24px; align-items:stretch; }
.ach-stat-rings { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ach-hero-top { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; position: relative; }
.ach-hero-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 16px 0 20px; }
.ach-next-award { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; padding: 20px 28px; }
.ach-filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(205px, 1fr)); gap: 12px; min-height: 200px; }

@media (max-width: 1100px) {
  .ach-progress-grid { grid-template-columns: 1fr; }
  .ach-showcase-layout { grid-template-columns:1fr; }
  .ach-showcase-summary { min-height:150px; }
}
@media (max-width: 900px) {
  .ach-showcase-slots { grid-template-columns:repeat(3,minmax(112px,1fr)); }
  .ach-next-award { gap: 16px; padding: 16px 20px; }
  .ach-hero-top { flex-direction: column; }
  .ach-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
}
@media (max-width: 640px) {
  .ach-stat-rings { grid-template-columns: 1fr; }
  .ach-progress-grid { padding: 16px; gap: 16px; }
  .ach-showcase-layout { padding:14px; }
  .ach-showcase-slots { grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
  .ach-showcase-slot { min-height:136px; }
  .ach-next-award { flex-direction: column; align-items: flex-start; padding: 14px 16px; }
  .ach-hero-actions { flex-direction: column; align-items: stretch; }
  .ach-filter-row { flex-direction: column; align-items: stretch; }
  .ach-grid { grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 10px; }
}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getStatus(ach: Achievement, earned: Record<number,EarnedInfo>, progress: Record<number,ProgressInfo>): AchStatus {
  if (ach.hidden && !earned[ach.id]) return 'hidden';
  if (earned[ach.id]) return 'earned';
  if (progress[ach.id]) return 'inprogress';
  return 'locked';
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const r    = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (r === 1) return one;
  if (r >= 2 && r <= 4) return few;
  return many;
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function AnimCounter({ target, duration = 1200, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay]);
  return <>{val}</>;
}

// ─── RING PROGRESS ────────────────────────────────────────────────────────────
function RingProgress({ pct, size = 72, stroke = 7, color = '#375DFB', bg = '#E5E7EB', children }: {
  pct: number; size?: number; stroke?: number; color?: string; bg?: string; children?: React.ReactNode;
}) {
  const r  = (size - stroke) / 2;
  const c  = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 4px ${color}44)` }}
      />
      {children && (
        <foreignObject x={0} y={0} width={size} height={size}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:size, height:size, transform:'rotate(90deg)' }}>
            {children}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

// ─── RADAR CHART ─────────────────────────────────────────────────────────────
function RadarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const activeIndex = hoveredIndex ?? selectedIndex;
  const activeItem = activeIndex !== null ? data[activeIndex] : null;
  const width = 360, height = 286, cx = width / 2, cy = 139, r = 91;
  const n  = data.length;
  const angle = (i: number) => (2 * Math.PI * i / n) - Math.PI / 2;
  const pt = (i: number, val: number, maxVal: number) => {
    const a = angle(i), ratio = val / maxVal;
    return { x: cx + r * ratio * Math.cos(a), y: cy + r * ratio * Math.sin(a) };
  };
  const gridPts = (lvl: number) => data.map((d, i) => {
    const a = angle(i);
    const ratio = lvl / d.max;
    return `${cx + r * ratio * Math.cos(a)},${cy + r * ratio * Math.sin(a)}`;
  }).join(' ');
  const valuePts = data.map((d, i) => { const p = pt(i, d.value, d.max); return `${p.x},${p.y}`; }).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Индекс Воеводы по направлениям"
      style={{ width:'100%', height:'auto', display:'block', overflow:'visible' }}>
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#375DFB" stopOpacity=".34" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity=".12" />
        </linearGradient>
        <filter id="radarGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {[1,2,3,4,5].map(lvl => <polygon key={lvl} points={gridPts(lvl)} fill={lvl === 5 ? 'rgba(55,93,251,.025)' : 'none'} stroke={lvl === 5 ? '#CBD5E1' : '#E7ECF5'} strokeWidth={lvl === 5 ? 1.4 : 1} />)}
      {data.map((_, i) => {
        const a = angle(i);
        const active = activeIndex === i;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)}
          stroke={active ? '#375DFB' : '#E5E7EB'} strokeWidth={active ? 2 : 1}
          style={{ transition:'stroke .18s ease,stroke-width .18s ease' }} />;
      })}
      <polygon points={valuePts} fill="url(#radarFill)" stroke="#375DFB" strokeWidth="2.5" strokeLinejoin="round"
        filter="url(#radarGlow)" style={{ animation: 'fadeIn .8s ease .4s both' }} />
      {data.map((d, i) => {
        const p = pt(i, d.value, d.max);
        const active = activeIndex === i;
        return <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => setSelectedIndex(prev => prev === i ? null : i)} style={{ cursor:'pointer' }}>
          <circle cx={p.x} cy={p.y} r={15} fill="transparent" />
          {active && <circle cx={p.x} cy={p.y} r={10} fill="rgba(55,93,251,.14)" />}
          <circle cx={p.x} cy={p.y} r={active ? 6.5 : 5} fill="#375DFB" stroke="#fff" strokeWidth="2.5"
            style={{ animation: `scaleIn .3s ease ${.4 + i*.07}s both`, transition:'r .18s ease' }} />
        </g>;
      })}
      {data.map((d, i) => {
        const a = angle(i), lx = cx + (r + 42) * Math.cos(a), ly = cy + (r + 35) * Math.sin(a);
        const active = activeIndex === i;
        return (
          <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => setSelectedIndex(prev => prev === i ? null : i)} style={{ cursor:'pointer' }}>
            <rect x={lx - 39} y={ly - 15} width="78" height="34" rx="10"
              fill={active ? '#EEF3FF' : '#fff'} stroke={active ? '#375DFB' : '#E2E8F0'} strokeWidth={active ? 1.8 : 1}
              style={{ transition:'fill .18s ease,stroke .18s ease' }} />
            <text x={lx} y={ly - 1} textAnchor="middle" fontSize="10" fill={active ? '#1D4ED8' : '#475569'} fontWeight="700">{d.label}</text>
            <text x={lx} y={ly + 12} textAnchor="middle" fontSize="11" fill="#375DFB" fontWeight="900">{d.value.toFixed(1)}</text>
          </g>
        );
      })}
      {activeItem && (
        <g pointerEvents="none">
          <rect x={cx - 47} y={cy - 24} width="94" height="48" rx="14" fill="#0F1729" opacity=".94" />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,.65)" fontWeight="700">{activeItem.label}</text>
          <text x={cx} y={cy + 13} textAnchor="middle" fontSize="16" fill="#fff" fontWeight="900">{activeItem.value.toFixed(1)} / {activeItem.max}</text>
        </g>
      )}
    </svg>
  );
}

// ─── MEDAL COMPONENT ──────────────────────────────────────────────────────────
function Medal({ template, size, achievementId, dimmed, style: s }: { template: SvgTemplate; size: number; achievementId?: number; dimmed?: boolean; style?: React.CSSProperties }) {
  const image = achievementId ? MEDAL_IMAGE_VARIANTS[(achievementId - 1) % MEDAL_IMAGE_VARIANTS.length] : MEDAL_IMAGE_MAP[template];
  return (
    <img src={image} alt="medal" width={size} height={size}
      style={{ width:size, height:size, objectFit:'contain', flexShrink:0,
        filter: dimmed ? 'grayscale(0.85) opacity(0.4)' : undefined, ...s }} />
  );
}
function HiddenMedal({ size }: { size: number }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'linear-gradient(135deg,#E5E7EB,#D1D5DB)',
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      boxShadow:'inset 0 2px 8px rgba(0,0,0,.12)' }}>
      <span style={{ fontSize:size*.36, color:'#9CA3AF', fontWeight:900 }}>?</span>
    </div>
  );
}

// ─── RARITY BADGE ─────────────────────────────────────────────────────────────
function RarityBadge({ rarity, label }: { rarity: Rarity; label: string }) {
  return (
    <span style={{ padding:'3px 10px', borderRadius:20, background:RARITY_BG[rarity], color:RARITY_COLOR[rarity],
      fontSize:11, fontWeight:700, whiteSpace:'nowrap', border:`1px solid ${RARITY_COLOR[rarity]}33` }}>
      {label}
    </span>
  );
}

// ─── SECTION CARD ─────────────────────────────────────────────────────────────
function SectionCard({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <div style={{ background:'#fff', borderRadius:20, border:'1px solid #E9ECF2', marginBottom:14,
      boxShadow:'0 2px 12px rgba(0,0,0,.04)', animation:`fadeUp .4s ease ${delay}s both`, ...style }}>
      {children}
    </div>
  );
}
function SH({ icon, title, sub, action }: { icon: React.ReactNode; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid #F0F2F8' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {icon}
        <div>
          <div style={{ fontSize:17, fontWeight:800, color:'#0F1729', lineHeight:1.2 }}>{title}</div>
          {sub && <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>{sub}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── CANVAS PARTICLES ─────────────────────────────────────────────────────────
function ParticleCanvas({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (!active || !ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const colors = ['#375DFB','#F59E0B','#10B981','#EF4444','#8B5CF6','#EC4899','#06B6D4','#FBBF24'];
    particlesRef.current = Array.from({ length: 120 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      const life  = 80 + Math.random() * 80;
      return { x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        life, maxLife: life, size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: (['circle','rect','star'] as const)[Math.floor(Math.random() * 3)] };
    });
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      for (const p of particlesRef.current) {
        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 0.05);
        if (p.shape === 'circle') {
          ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
        } else if (p.shape === 'rect') {
          ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
        } else {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const b = a + 2 * Math.PI / 5;
            if (i === 0) ctx.moveTo(Math.cos(a)*p.size/2, Math.sin(a)*p.size/2);
            else ctx.lineTo(Math.cos(a)*p.size/2, Math.sin(a)*p.size/2);
            ctx.lineTo(Math.cos(b)*p.size/4, Math.sin(b)*p.size/4);
          }
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        p.x  += p.vx; p.y += p.vy;
        p.vy += 0.18; p.vx *= 0.99;
        p.life--;
      }
      if (particlesRef.current.length > 0) rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); ctx.clearRect(0, 0, canvas.width, canvas.height); };
  }, [active]);
  if (!active) return null;
  return <canvas ref={ref} style={{ position:'fixed', inset:0, zIndex:299, pointerEvents:'none' }} />;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function Achievements() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [earned,    setEarned]    = useState<Record<number,EarnedInfo>>(INIT_EARNED);
  const [progress]                 = useState<Record<number,ProgressInfo>>(INIT_PROGRESS);
  const [showcase,  setShowcase]  = useState<(number|null)[]>([1,2,3,4,5]);
  const [slotModal, setSlotModal] = useState<number|null>(null);
  const [dragId,    setDragId]    = useState<number|null>(null);
  const [overSlot,  setOverSlot]  = useState<number|null>(null);
  const [viewMode,  setViewMode]  = useState<ViewMode>('grid');
  const [catFilter, setCatFilter] = useState<Category>('all');
  const [rarityF,   setRarityF]   = useState<Rarity|'all'>('all');
  const [statusF,   setStatusF]   = useState<AchStatus|'all'>('all');
  const [search,    setSearch]    = useState('');
  const [nearOnly,  setNearOnly]  = useState(false);
  const [treeOpen,  setTreeOpen]  = useState(false);
  const [modalId,   setModalId]   = useState<number|null>(null);
  const [profileShow, setProfileShow] = useState<Record<number,boolean>>({});
  const [unlockId,  setUnlockId]  = useState<number|null>(null);
  const [unlockVis, setUnlockVis] = useState(false);
  const [unlockPhase, setUnlockPhase] = useState<'flash'|'medal'|'text'|'done'>('flash');
  const [toastMsg,  setToastMsg]  = useState<string|null>(null);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const requestedAchievement = searchParams.get('achievement');
  const requestedView = searchParams.get('view');
  useEffect(() => {
    const id = Number(requestedAchievement);
    if (Number.isInteger(id) && ACHIEVEMENTS.some(achievement => achievement.id === id)) {
      setModalId(id);
    }
  }, [requestedAchievement]);

  useEffect(() => {
    if (requestedView === 'board') setViewMode('board');
  }, [requestedView]);

  const earnedIds   = Object.keys(earned).map(Number);
  const earnedCount = earnedIds.length;
  const totalCount  = ACHIEVEMENTS.length;
  const rareCount   = earnedIds.filter(id => { const a = ACHIEVEMENTS.find(x => x.id === id); return a && (a.rarity === 'rare' || a.rarity === 'epic' || a.rarity === 'legend'); }).length;
  const legendCount = earnedIds.filter(id => { const a = ACHIEVEMENTS.find(x => x.id === id); return a && a.rarity === 'legend'; }).length;
  const totalPct    = Math.round(earnedCount / totalCount * 100);

  const catEarned = useMemo(() => Object.fromEntries(
    CATEGORY_STATS.map(({ cat }) => [cat, ACHIEVEMENTS.filter(a => a.category === cat && earned[a.id]).length])
  ), [earned]);

  const nextAward = ACHIEVEMENTS.find(a => !earned[a.id] && !a.hidden && progress[a.id])
    ?? ACHIEVEMENTS.find(a => !earned[a.id] && !a.hidden);
  const nextProg  = nextAward ? progress[nextAward.id] : undefined;
  const nextPct   = nextProg ? Math.round(nextProg.current / nextProg.max * 100) : 0;

  const filtered = useMemo(() => ACHIEVEMENTS.filter(a => {
    const s = getStatus(a, earned, progress);
    if (catFilter !== 'all' && a.category !== catFilter) return false;
    if (rarityF   !== 'all' && a.rarity   !== rarityF)   return false;
    if (statusF   !== 'all' && s          !== statusF)    return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())
      && !a.condition.toLowerCase().includes(search.toLowerCase())) return false;
    if (nearOnly) {
      if (s === 'earned') return true;
      const p = progress[a.id];
      return !!p && p.current / p.max > 0.5;
    }
    return true;
  }), [earned, catFilter, rarityF, statusF, search, nearOnly]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { setModalId(null); setUnlockVis(false); setSlotModal(null); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  useEffect(() => {
    document.body.style.overflow = (modalId !== null || unlockVis || slotModal !== null) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalId, unlockVis, slotModal]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const triggerUnlock = useCallback((id: number) => {
    setUnlockId(id);
    setUnlockPhase('flash');
    setUnlockVis(true);
    setTimeout(() => setUnlockPhase('medal'), 300);
    setTimeout(() => setUnlockPhase('text'),  900);
    setTimeout(() => setUnlockPhase('done'),  1400);
    setTimeout(() => setUnlockVis(false), 7000);
  }, []);

  const claimUnlock = useCallback(() => {
    if (unlockId !== null) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('ru-RU', { day:'2-digit', month:'long', year:'numeric' });
      setEarned(prev => ({ ...prev, [unlockId]: { date: dateStr, pct: +(Math.random() * 12 + 1).toFixed(1) } }));
      setShowcase(prev => {
        if (prev.includes(unlockId)) return prev;
        const next = [...prev];
        const emptyIdx = next.findIndex(v => v === null);
        if (emptyIdx !== -1) next[emptyIdx] = unlockId;
        return next;
      });
      showToast('Награда добавлена в ваш профиль');
    }
    setUnlockVis(false);
  }, [unlockId, showToast]);

  const handleShare = useCallback(async (ach: Achievement) => {
    const text = `Я получил награду «${ach.name}» на Портале Воевода!`;
    const result = await shareOrCopy({ title: ach.name, text, url: `${window.location.origin}/achievements?achievement=${ach.id}` });
    if (result !== 'cancelled') showToast(result === 'shared' ? 'Награда отправлена' : 'Ссылка скопирована в буфер обмена');
  }, [showToast]);

  const onSlotDrop  = (idx: number) => {
    if (dragId === null) return;
    setShowcase(prev => { const n = [...prev]; n[idx] = dragId; return n; });
    setDragId(null); setOverSlot(null);
  };
  const removeSlot  = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowcase(prev => { const n = [...prev]; n[idx] = null; return n; });
  };
  const chooseShowcaseAward = (id: number) => {
    if (slotModal === null) return;
    setShowcase(prev => {
      const next = prev.map(v => v === id ? null : v);
      next[slotModal] = id;
      return next;
    });
    setSlotModal(null);
  };

  const unlockAch = unlockId !== null ? ACHIEVEMENTS.find(a => a.id === unlockId) : null;
  const modalAch  = modalId  !== null ? ACHIEVEMENTS.find(a => a.id === modalId)  : null;
  const catTabs: { key: Category; label: string }[] = [
    { key:'all', label:'Все' }, { key:'edu', label:'Обучение' }, { key:'sport', label:'Физподг.' },
    { key:'war', label:'Учения' }, { key:'social', label:'Соцсеть' },
    { key:'market', label:'Маркет' }, { key:'system', label:'Система' },
  ];

  return (
    <div style={{ paddingTop:60, marginLeft:56, minHeight:'100vh', background:'#EEF3FF', overflowX:'hidden' }}>
      <style>{GLOBAL_CSS}</style>

      {/* TOAST */}
      {toastMsg && (
        <div style={{ position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:9999,
          background:'#0F1729', color:'#fff', padding:'12px 24px', borderRadius:12, fontSize:14, fontWeight:600,
          boxShadow:'0 8px 32px rgba(0,0,0,.25)', animation:'fadeUp .3s ease', whiteSpace:'nowrap' }}>
          {toastMsg}
        </div>
      )}

      <div className="ach-page-shell" style={{ padding:'20px 24px 60px' }}>

        {/* ═══ HERO HEADER ═══════════════════════════════════════════════════ */}
        <SectionCard delay={0}>
          <div style={{ padding:'24px 28px 0', background:'linear-gradient(135deg,#0F1729 0%,#1a2d5a 100%)',
            borderRadius:'20px 20px 0 0', position:'relative', overflow:'hidden', minHeight:120 }}>
            {/* decoration dots */}
            {[...Array(20)].map((_,i) => (
              <div key={i} style={{ position:'absolute', width:2, height:2, borderRadius:'50%', background:'rgba(255,255,255,.15)',
                top:`${Math.random()*100}%`, left:`${Math.random()*100}%` }} />
            ))}
            <div className="ach-hero-top">
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,.5)', letterSpacing:2, textTransform:'uppercase', fontWeight:700 }}>УТЦ Воевода</span>
                  <span style={{ width:1, height:12, background:'rgba(255,255,255,.2)' }} />
                  <PortalBreadcrumb tone="inverse" className="compact-breadcrumb" items={[{ label:'Главная', to:'/' }, { label:'Знаки отличия' }]} />
                </div>
                <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', margin:'0 0 6px', letterSpacing:-.5 }}>
                  Знаки отличия
                </h1>
                <p style={{ fontSize:13, color:'rgba(255,255,255,.55)', margin:0 }}>
                  Ваши заслуги и достижения на портале
                </p>
              </div>
              {/* overall ring */}
              <div style={{ display:'flex', alignItems:'center', gap:16, background:'rgba(255,255,255,.07)',
                borderRadius:16, padding:'14px 20px', border:'1px solid rgba(255,255,255,.1)', backdropFilter:'blur(8px)' }}>
                <RingProgress pct={totalPct} size={68} stroke={7} color="#375DFB" bg="rgba(255,255,255,.12)">
                  <span style={{ fontSize:13, fontWeight:900, color:'#fff' }}>{totalPct}%</span>
                </RingProgress>
                <div>
                  <div style={{ fontSize:22, fontWeight:900, color:'#fff', lineHeight:1 }}>
                    {mounted ? <AnimCounter target={earnedCount} duration={1200} /> : earnedCount}
                    <span style={{ fontSize:13, color:'rgba(255,255,255,.4)', fontWeight:500 }}>/{totalCount}</span>
                  </div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:2, fontWeight:600 }}>Наград получено</div>
                </div>
              </div>
            </div>
            {/* view toggle + demo btn */}
            <div className="ach-hero-actions">
              <div style={{ display:'flex', gap:4 }}>
                {([['grid','Сетка'], ['board','Наградная доска']] as [ViewMode,string][]).map(([m, label]) => (
                  <button key={m} onClick={() => setViewMode(m)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px',
                      border:'1.5px solid', borderColor: viewMode===m ? '#375DFB' : 'rgba(255,255,255,.2)',
                      borderRadius:10, background: viewMode===m ? '#375DFB' : 'rgba(255,255,255,.08)',
                      color: viewMode===m ? '#fff' : 'rgba(255,255,255,.7)', fontSize:13, fontWeight:600,
                      cursor:'pointer', transition:'all .18s ease' }}
                    onMouseEnter={e => { if (viewMode!==m) e.currentTarget.style.background='rgba(255,255,255,.14)'; }}
                    onMouseLeave={e => { if (viewMode!==m) e.currentTarget.style.background='rgba(255,255,255,.08)'; }}
                  >
                    {m==='grid'
                      ? <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><rect x="0" y="0" width="5.5" height="5.5" rx="1.5"/><rect x="7.5" y="0" width="5.5" height="5.5" rx="1.5"/><rect x="0" y="7.5" width="5.5" height="5.5" rx="1.5"/><rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1.5"/></svg>
                      : <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><circle cx="2" cy="2" r="1.5"/><circle cx="6.5" cy="2" r="1.5"/><circle cx="11" cy="2" r="1.5"/><circle cx="2" cy="6.5" r="1.5"/><circle cx="6.5" cy="6.5" r="1.5"/><circle cx="11" cy="6.5" r="1.5"/><circle cx="2" cy="11" r="1.5"/><circle cx="6.5" cy="11" r="1.5"/><circle cx="11" cy="11" r="1.5"/></svg>}
                    {label}
                  </button>
                ))}
              </div>
              <button className="btn-primary"
                onClick={() => {
                  const pool = ACHIEVEMENTS.filter(a => !earned[a.id] && !a.hidden);
                  if (pool.length) triggerUnlock(pool[Math.floor(Math.random() * pool.length)].id);
                }}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 18px',
                  background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#fff', border:'none',
                  borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', letterSpacing:.3 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H13L13 2Z"/></svg>
                Демо — получить награду
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ═══ SHOWCASE ══════════════════════════════════════════════════════ */}
        {viewMode === 'grid' && (
        <SectionCard delay={.05}>
          <SH
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="#375DFB"><path d="M12 2l2 6h6l-5 3.6 2 6L12 14l-5 3.6 2-6L4 8h6Z"/></svg>}
            title="Китель — мои награды"
            sub="Перетащи медаль из сетки"
          />
          <div className="ach-showcase-layout">
            <div className="ach-showcase-slots">
              {showcase.map((slotId, idx) => {
                const sa = slotId !== null ? ACHIEVEMENTS.find(a => a.id === slotId) : null;
                const accent = sa ? RARITY_COLOR[sa.rarity] : '#94A3B8';
                return (
                  <div key={idx} className="ach-showcase-slot slot-drop"
                    onClick={() => setSlotModal(idx)}
                    onDragOver={e => { e.preventDefault(); setOverSlot(idx); }}
                    onDragLeave={() => setOverSlot(null)}
                    onDrop={() => onSlotDrop(idx)}
                    style={{
                      '--rarity-color':accent,
                      '--rarity-glow':sa ? RARITY_GLOW[sa.rarity] : 'rgba(55,93,251,.18)',
                      border:`2px ${sa ? 'solid' : 'dashed'} ${overSlot===idx ? '#375DFB' : sa ? `${accent}AA` : '#CBD5E1'}`,
                      background:overSlot===idx ? '#EEF3FF' : sa ? `linear-gradient(155deg,#fff,${RARITY_BG[sa.rarity]})` : '#F8FAFC',
                      boxShadow:sa ? `inset 0 3px 0 ${accent},0 0 0 1px ${accent}22,0 8px 22px ${RARITY_GLOW[sa.rarity]}` : 'none'
                    } as React.CSSProperties}>
                    <span style={{ position:'absolute', top:10, left:12, fontSize:9, fontWeight:800, letterSpacing:1.2, color:sa ? accent : '#94A3B8' }}>
                      {String(idx + 1).padStart(2,'0')}
                    </span>
                    {sa ? (
                      <>
                        <Medal template={sa.svgTemplate} achievementId={sa.id} size={82} />
                        <div style={{ width:'calc(100% - 20px)', fontSize:11, color:'#1E293B', fontWeight:800, textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sa.name}</div>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:9, color:accent, fontWeight:900,
                          textTransform:'uppercase', letterSpacing:.7, border:`1px solid ${accent}55`, background:RARITY_BG[sa.rarity], borderRadius:999, padding:'4px 8px' }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background:accent, boxShadow:`0 0 8px ${accent}` }} />
                          {sa.rarityLabel}
                        </div>
                        <button aria-label="Убрать награду" onClick={e => removeSlot(idx, e)} style={{ position:'absolute', top:8, right:8,
                          width:22, height:22, background:'#fff', border:'1px solid #E2E8F0', borderRadius:'50%',
                          color:'#94A3B8', fontSize:10, fontWeight:900, cursor:'pointer', boxShadow:'0 3px 8px rgba(15,23,42,.08)',
                          display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                      </>
                    ) : (
                      <>
                        <span style={{ width:44, height:44, borderRadius:14, background:'#E8EEFF', color:'#375DFB', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        </span>
                        <span style={{ fontSize:11, color:'#64748B', fontWeight:700 }}>Добавить награду</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="ach-showcase-summary">
              <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', background:'rgba(55,93,251,.22)', right:-70, bottom:-90, filter:'blur(2px)' }} />
              <div style={{ position:'relative' }}>
                <div style={{ fontSize:10, fontWeight:800, letterSpacing:1.5, color:'rgba(255,255,255,.5)', textTransform:'uppercase', marginBottom:12 }}>Парадный комплект</div>
                <div style={{ fontSize:32, fontWeight:900, lineHeight:1, marginBottom:5 }}>{showcase.filter(Boolean).length}<span style={{ fontSize:14, color:'rgba(255,255,255,.45)' }}> / {showcase.length}</span></div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.62)', lineHeight:1.55, marginBottom:18 }}>Эти знаки видны в личном деле. Нажмите на слот, чтобы заменить награду.</div>
                <div style={{ height:7, borderRadius:8, background:'rgba(255,255,255,.12)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${showcase.filter(Boolean).length / showcase.length * 100}%`, borderRadius:8, background:'linear-gradient(90deg,#6E8BFF,#B7C6FF)' }} />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
        )}

        {/* ═══ PROGRESS ═══════════════════════════════════════════════════════ */}
        {viewMode === 'grid' && (
        <SectionCard delay={.1}>
          <SH
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="0" y="14" width="5" height="10" rx="1.5" fill="#375DFB"/><rect x="9" y="8" width="5" height="16" rx="1.5" fill="#375DFB"/><rect x="18" y="2" width="5" height="22" rx="1.5" fill="#375DFB"/></svg>}
            title="Мой прогресс"
            sub="Статистика по всем направлениям"
          />
          <div className="ach-progress-grid">

            {/* LEFT — stats + bars */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {/* 4 stat rings */}
              <div className="ach-stat-rings">
                {[
                  { val:earnedCount,  label:'Получено',     color:'#375DFB', total:totalCount  },
                  { val:rareCount,    label:'Редких+',      color:'#10B981', total:earnedCount  },
                  { val:legendCount,  label:'Легендарных',  color:'#F59E0B', total:earnedCount  },
                  { val:totalCount - earnedCount, label:'Осталось', color:'#7C3AED', total:totalCount },
                ].map(({ val, label, color, total }, i) => {
                  const pct = total > 0 ? Math.round(val / total * 100) : 0;
                  return (
                    <div key={label} className="ring-container" style={{ background:'#F8FAFF', borderRadius:14, padding:'14px 12px',
                      border:'1px solid #E9ECF2', display:'flex', alignItems:'center', gap:10,
                      animationDelay: `${i*.08}s` }}>
                      <RingProgress pct={pct} size={52} stroke={6} color={color} bg="#E9ECF2">
                        <span style={{ fontSize:11, fontWeight:900, color }}>{pct}%</span>
                      </RingProgress>
                      <div>
                        <div style={{ fontSize:20, fontWeight:900, color:'#0F1729', lineHeight:1 }}>
                          {mounted ? <AnimCounter target={val} duration={1000} delay={i*100} /> : val}
                        </div>
                        <div style={{ fontSize:10, color:'#9CA3AF', fontWeight:600, marginTop:2 }}>{label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* category bars */}
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {CATEGORY_STATS.map(({ cat, label, total, routeKey }, idx) => {
                  const cnt = catEarned[cat] ?? 0;
                  const pct = Math.round(cnt / total * 100);
                  const colors = ['#375DFB','#10B981','#EF4444','#7C3AED','#F59E0B','#06B6D4'];
                  const clr   = colors[idx % colors.length];
                  return (
                    <div key={cat} className="vr-row" onClick={() => navigate(routeKey)}
                      style={{ display:'grid', gridTemplateColumns:'36px 1fr 50px', alignItems:'center',
                        gap:10, padding:'8px 10px', borderRadius:10, cursor:'pointer' }}>
                      <span style={{ width:26, height:26, borderRadius:9, background:'#EBF1FF',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <CategoryIcon cat={cat} size={15} color={clr} />
                      </span>
                      <div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:'#374151' }}>{label}</span>
                          <span style={{ fontSize:11, color:'#9CA3AF', fontWeight:600 }}>{cnt}/{total}</span>
                        </div>
                        <div style={{ height:7, background:'#E9ECF2', borderRadius:4, overflow:'hidden' }}>
                          <div className="progress-bar-fill" style={{
                            '--w': `${pct}%`, '--delay': `${.3 + idx*.08}s`,
                            height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${clr}88,${clr})`,
                            borderRadius:4
                          } as React.CSSProperties} />
                        </div>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontSize:14, fontWeight:900, color:clr }}>{pct}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT — radar chart */}
            <div style={{ display:'flex', flexDirection:'column',
              background:'linear-gradient(180deg,#F9FBFF,#F4F7FF)', borderRadius:18, border:'1px solid #DDE5F3', padding:'18px', gap:10,
              boxShadow:'inset 0 1px 0 #fff,0 10px 30px rgba(55,93,251,.07)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:900, color:'#0F1729' }}>Индекс Воеводы</div>
                  <div style={{ fontSize:10, color:'#94A3B8', marginTop:3 }}>Баланс ключевых направлений подготовки</div>
                </div>
                <div style={{ minWidth:70, borderRadius:13, padding:'8px 11px', textAlign:'center', background:'linear-gradient(135deg,#375DFB,#6E8BFF)', color:'#fff', boxShadow:'0 7px 18px rgba(55,93,251,.25)' }}>
                  <div style={{ fontSize:22, fontWeight:900, lineHeight:1 }}>
                    {(VOEVODA_INDEX.reduce((a,d) => a + d.value, 0) / VOEVODA_INDEX.length).toFixed(1)}
                  </div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,.68)', marginTop:3, fontWeight:700 }}>/ 5.0</div>
                </div>
              </div>
              <div style={{ width:'100%', maxWidth:430, margin:'0 auto' }}>
                <RadarChart data={VOEVODA_INDEX} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[...VOEVODA_INDEX].sort((a,b) => b.value - a.value).slice(0,2).map((item, i) => (
                  <div key={item.label} style={{ padding:'10px 12px', background:'#fff', border:'1px solid #E2E8F0', borderRadius:12 }}>
                    <div style={{ fontSize:9, color:i === 0 ? '#059669' : '#375DFB', fontWeight:900, textTransform:'uppercase', letterSpacing:.7 }}>{i === 0 ? 'Сильная сторона' : 'Следующий резерв'}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:8, marginTop:5 }}>
                      <span style={{ fontSize:11, color:'#475569', fontWeight:700 }}>{item.label}</span>
                      <span style={{ fontSize:12, color:'#0F1729', fontWeight:900 }}>{item.value.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
        )}

        {/* ═══ NEXT AWARD ═════════════════════════════════════════════════════ */}
        {nextAward && viewMode === 'grid' && (
          <div style={{ background:'linear-gradient(135deg,#fff 0%,#EBF1FF 100%)', borderRadius:20,
            border:'2px solid #C7D2FE', marginBottom:14, position:'relative', overflow:'hidden',
            animation:'fadeUp .4s ease .15s both', boxShadow:'0 4px 24px rgba(55,93,251,.12)' }}>
            <div className="ach-next-award">
              <div style={{ position:'relative' }}>
                <Medal template={nextAward.svgTemplate} achievementId={nextAward.id} size={88} dimmed style={{ filter:'grayscale(0.2) opacity(0.8)' }} />
                <div style={{ position:'absolute', top:-4, right:-4, width:22, height:22, background:'#375DFB',
                  borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  animation:'pulse 2s ease infinite' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H13L13 2Z"/></svg>
                </div>
              </div>
              <div style={{ flex:1, minWidth:180 }}>
                <div style={{ fontSize:10, color:'#375DFB', fontWeight:800, textTransform:'uppercase', letterSpacing:1.5, marginBottom:4 }}>Ближайшая награда</div>
                <div style={{ fontSize:18, fontWeight:900, color:'#0F1729', marginBottom:4 }}>{nextAward.name}</div>
                <div style={{ fontSize:13, color:'#6B7280', marginBottom:12 }}>{nextAward.condition}</div>
                {nextProg ? (
                  <>
                    <div style={{ height:10, background:'#E5E7EB', borderRadius:5, overflow:'hidden', marginBottom:6 }}>
                      <div style={{ width:`${nextPct}%`, height:'100%',
                        background:'linear-gradient(90deg,#375DFB,#60A5FA)', borderRadius:5,
                        transition:'width .8s cubic-bezier(.4,0,.2,1)',
                        boxShadow:'0 0 8px rgba(55,93,251,.4)' }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9CA3AF' }}>
                      <span>{nextProg.current} / {nextProg.max} выполнено</span>
                      <span style={{ fontWeight:700, color:'#375DFB' }}>{nextPct}%</span>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize:12, color:'#9CA3AF' }}>Начните выполнение для отслеживания прогресса</div>
                )}
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <button className="btn-primary" onClick={() => setModalId(nextAward.id)}
                  style={{ padding:'10px 20px', background:'#375DFB', color:'#fff', border:'none', borderRadius:10,
                    fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                  Подробнее
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button onClick={() => navigate(CATEGORY_STATS.find(c => c.cat === nextAward.category)?.routeKey ?? '/')}
                  style={{ padding:'8px 16px', background:'transparent', color:'#375DFB', border:'1.5px solid #C7D2FE',
                    borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#EBF1FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}>
                  Перейти к разделу →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ AWARD TREE ══════════════════════════════════════════════════════ */}
        {viewMode === 'grid' && (
          <SectionCard delay={.2}>
            <button onClick={() => setTreeOpen(!treeOpen)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%',
                padding:'18px 24px', background:'none', border:'none', cursor:'pointer',
                borderBottom: treeOpen ? '1px solid #F0F2F8' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="4" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="12" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/>
                  <path d="M12 6.5v5M12 11.5H9M12 11.5h3M9 14v2.7M12 14v2.7M15 14v2.7"/>
                </svg>
                <div>
                  <div style={{ fontSize:17, fontWeight:800, color:'#0F1729' }}>Дерево наград</div>
                  <div style={{ fontSize:11, color:'#9CA3AF' }}>Цепочки зависимостей · кликни на узел</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:12, color:'#375DFB', fontWeight:700, background:'#EBF1FF',
                  padding:'4px 12px', borderRadius:20 }}>{DEP_CHAINS.length} путей</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"
                  style={{ transform: treeOpen ? 'rotate(180deg)' : 'none', transition:'transform .25s ease' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </button>
            {treeOpen && (
              <div style={{ padding:'20px 24px 24px', overflowX:'auto', animation:'fadeUp .25s ease both' }}>
                <AwardTree earned={earned} progress={progress} onOpen={setModalId} />
              </div>
            )}
          </SectionCard>
        )}

        {/* ═══ FILTERS ════════════════════════════════════════════════════════ */}
        {viewMode === 'grid' && (
          <div style={{ marginBottom:14, animation:'fadeUp .4s ease .25s both' }}>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
              {catTabs.map(({ key, label }) => (
                <button key={key} className={`tab-pill${catFilter===key?' active':''}`}
                  onClick={() => setCatFilter(key)}
                  style={{ padding:'7px 14px', border:'1.5px solid', borderRadius:10, fontSize:12, fontWeight:600,
                    cursor:'pointer', whiteSpace:'nowrap', transition:'all .18s ease',
                    borderColor: catFilter===key ? '#375DFB' : '#E5E7EB',
                    background: catFilter===key ? '#375DFB' : '#fff',
                    color: catFilter===key ? '#fff' : '#6B7280' }}>
                  {key !== 'all' && <span style={{ display:'inline-flex', marginRight:5, verticalAlign:'-2px' }}>
                    <CategoryIcon cat={key as Exclude<Category,'all'>} size={14} color={catFilter===key ? '#fff' : '#6B7280'} />
                  </span>}
                  {label}
                </button>
              ))}
            </div>
            <div className="ach-filter-row">
              {[
                { label:'Редкость', val:rarityF, set:setRarityF as (v: string) => void,
                  opts:[['all','Все'],['common','Обычная'],['rare','Редкая'],['epic','Эпическая'],['legend','Легендарная']] },
                { label:'Статус',   val:statusF, set:setStatusF as (v: string) => void,
                  opts:[['all','Все'],['earned','Получено'],['inprogress','В процессе'],['locked','Заблокировано']] },
              ].map(({ label, val, set, opts }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:12, color:'#9CA3AF', fontWeight:600 }}>{label}:</span>
                  <select value={val} onChange={e => set(e.target.value)}
                    style={{ height:36, padding:'0 10px', border:'1.5px solid #E5E7EB', borderRadius:10,
                      fontSize:12, fontFamily:'inherit', outline:'none', color:'#374151', cursor:'pointer',
                      background:'#fff', fontWeight:600 }}>
                    {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ flex:1, minWidth:180, position:'relative' }}>
                <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}
                  width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="#9CA3AF" strokeWidth="1.5"/>
                  <path d="M9.5 9.5L13 13" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Поиск по названию или условию..."
                  style={{ width:'100%', height:36, paddingLeft:34, paddingRight:12, border:'1.5px solid #E5E7EB',
                    borderRadius:10, fontSize:12, fontFamily:'inherit', outline:'none', boxSizing:'border-box',
                    color:'#374151', background:'#fff', fontWeight:500, transition:'border-color .15s' }}
                  onFocus={e => (e.target.style.borderColor='#375DFB')}
                  onBlur={e => (e.target.style.borderColor='#E5E7EB')} />
              </div>
              <button onClick={() => setNearOnly(!nearOnly)}
                style={{ padding:'7px 16px', border:'1.5px solid', borderRadius:10, fontSize:12,
                  fontWeight: nearOnly ? 700 : 500, cursor:'pointer', transition:'all .18s',
                  borderColor: nearOnly ? '#375DFB' : '#E5E7EB',
                  background: nearOnly ? '#EBF1FF' : '#fff',
                  color: nearOnly ? '#375DFB' : '#6B7280', whiteSpace:'nowrap' }}>
                Почти получено
              </button>
              <span style={{ fontSize:12, color:'#9CA3AF', marginLeft:'auto' }}>
                Найдено: <b style={{ color:'#374151' }}>{filtered.length}</b>
              </span>
            </div>
          </div>
        )}

        {/* ═══ GRID ═══════════════════════════════════════════════════════════ */}
        {viewMode === 'grid' && (
          <div className="ach-grid">
            {filtered.length === 0
              ? <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color:'#9CA3AF',
                  fontSize:14, background:'#fff', borderRadius:20, border:'1px solid #E9ECF2',
                  animation:'fadeIn .3s ease' }}>
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l4.5 4.5"/>
                    </svg>
                  </div>
                  Ничего не найдено — попробуйте изменить фильтры
                </div>
              : filtered.map((ach, idx) => (
                  <AchCard key={ach.id} ach={ach} earned={earned} progress={progress}
                    idx={idx} onOpen={setModalId} onDragStart={id => { if (earned[id]) setDragId(id); }} />
                ))
            }
          </div>
        )}

        {/* ═══ BOARD VIEW ═════════════════════════════════════════════════════ */}
        {viewMode === 'board' && (
          <div id="honor-board" className="avc" style={{ borderRadius:20, overflow:'hidden', marginBottom:12 }}>
            <div style={{ background:'linear-gradient(135deg,#0F1729 0%,#162040 100%)', padding:'32px 28px 40px',
              position:'relative', overflow:'hidden' }}>
              {/* texture */}
              <div style={{ position:'absolute', inset:0, opacity:.04,
                backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
                backgroundSize:'8px 8px' }} />
              <div style={{ fontFamily:'Georgia, serif', fontSize:24, color:'#C9A84C', textAlign:'center',
                letterSpacing:4, textTransform:'uppercase', marginBottom:6, fontWeight:700,
                textShadow:'0 2px 8px rgba(201,168,76,.3)' }}>
                «Наградной лист — Боец Воевода»
              </div>
              <div style={{ textAlign:'center', color:'rgba(255,255,255,.35)', fontSize:11, letterSpacing:3, marginBottom:32, textTransform:'uppercase' }}>
                УТЦ «Воевода» · Портал подготовки · 2025
              </div>
              {/* medals grid */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
                {ACHIEVEMENTS.map((ach, i) => {
                  const isE = !!earned[ach.id];
                  return (
                    <div key={ach.id} className="board-medal"
                      onClick={() => isE ? setModalId(ach.id) : undefined}
                      title={isE ? ach.name : ''}
                      style={{ width:68, height:68, display:'flex', alignItems:'center', justifyContent:'center',
                        position:'relative', cursor: isE ? 'pointer' : 'default',
                        animation: `fadeIn .3s ease ${(i*.02).toFixed(2)}s both` }}>
                      {isE ? (
                        <Medal template={ach.svgTemplate} achievementId={ach.id} size={56}
                          style={{ filter:'drop-shadow(0 4px 12px rgba(0,0,0,.5))' }} />
                      ) : (
                        <div style={{ width:52, height:52, borderRadius:'50%',
                          border:'2px dashed rgba(255,255,255,.12)', background:'rgba(255,255,255,.03)',
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ color:'rgba(255,255,255,.15)', fontSize:18 }}>?</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop:32, textAlign:'center', display:'flex', alignItems:'center',
                justifyContent:'center', gap:20, flexWrap:'wrap' }}>
                <div style={{ background:'rgba(255,255,255,.06)', borderRadius:12, padding:'12px 20px',
                  border:'1px solid rgba(255,255,255,.1)', backdropFilter:'blur(8px)' }}>
                  <div style={{ fontSize:26, fontWeight:900, color:'#C9A84C' }}>{earnedCount}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1 }}>Получено</div>
                </div>
                <div style={{ background:'rgba(255,255,255,.06)', borderRadius:12, padding:'12px 20px',
                  border:'1px solid rgba(255,255,255,.1)', backdropFilter:'blur(8px)' }}>
                  <div style={{ fontSize:26, fontWeight:900, color:'#fff' }}>{totalCount - earnedCount}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1 }}>Осталось</div>
                </div>
                <div style={{ background:'rgba(255,255,255,.06)', borderRadius:12, padding:'12px 20px',
                  border:'1px solid rgba(255,255,255,.1)', backdropFilter:'blur(8px)' }}>
                  <div style={{ fontSize:26, fontWeight:900, color:'#10B981' }}>{totalPct}%</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1 }}>Прогресс</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ═══ MODAL ══════════════════════════════════════════════════════════ */}
      {slotModal !== null && (
        <ShowcasePicker
          slotIndex={slotModal}
          earnedIds={earnedIds}
          showcase={showcase}
          onChoose={chooseShowcaseAward}
          onClose={() => setSlotModal(null)}
        />
      )}

      {modalAch && (
        <AchModal ach={modalAch} earned={earned} progress={progress}
          profileShow={profileShow}
          onProfileToggle={id => setProfileShow(p => ({ ...p, [id]: !p[id] }))}
          onClose={() => {
            setModalId(null);
            if (searchParams.has('achievement')) {
              const next = new URLSearchParams(searchParams);
              next.delete('achievement');
              setSearchParams(next, { replace: true });
            }
          }}
          onShare={handleShare}
          onNavigate={navigate}
        />
      )}

      {/* ═══ PARTICLE CANVAS ═════════════════════════════════════════════════ */}
      <ParticleCanvas active={unlockVis} />

      {/* ═══ UNLOCK ANIMATION ════════════════════════════════════════════════ */}
      {unlockVis && unlockAch && (
        <UnlockOverlay
          ach={unlockAch} phase={unlockPhase}
          onClaim={claimUnlock} onClose={() => setUnlockVis(false)}
        />
      )}
    </div>
  );
}

function ShowcasePicker({ slotIndex, earnedIds, showcase, onChoose, onClose }: {
  slotIndex: number;
  earnedIds: number[];
  showcase: (number|null)[];
  onChoose: (id: number) => void;
  onClose: () => void;
}) {
  const available = earnedIds
    .map(id => ACHIEVEMENTS.find(a => a.id === id))
    .filter(Boolean) as Achievement[];
  const currentId = showcase[slotIndex];

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.44)',
      zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center', padding:20,
      backdropFilter:'blur(8px)', animation:'fadeIn .18s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'min(620px,100%)', maxHeight:'82vh', overflow:'hidden',
        background:'#fff', borderRadius:22, border:'1px solid #E5E7EB', boxShadow:'0 24px 70px rgba(15,23,42,.24)',
        animation:'scaleIn .2s cubic-bezier(.34,1.56,.64,1)' }}>
        <div style={{ padding:'20px 22px', borderBottom:'1px solid #EEF2F7',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:'#0F1729' }}>Выберите награду для кителя</div>
            <div style={{ fontSize:12, color:'#64748B', marginTop:3 }}>Слот {slotIndex + 1} · доступны только полученные награды</div>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, border:'none', borderRadius:12, background:'#F1F5F9',
            color:'#64748B', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{ padding:22, overflowY:'auto', maxHeight:'calc(82vh - 88px)' }}>
          {available.length === 0 ? (
            <div style={{ padding:'36px 18px', borderRadius:18, background:'#F8FAFC', border:'1px dashed #CBD5E1',
              textAlign:'center', color:'#64748B', fontSize:14 }}>
              Полученных наград пока нет. Когда награда будет заработана, она появится здесь.
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
              {available.map(ach => {
                const placed = showcase.includes(ach.id);
                const selected = currentId === ach.id;
                return (
                  <button key={ach.id} className="ach-rarity-option" onClick={() => onChoose(ach.id)}
                    style={{ '--rarity-color':RARITY_COLOR[ach.rarity], '--rarity-glow':RARITY_GLOW[ach.rarity],
                      border:'2px solid', borderColor:selected ? RARITY_COLOR[ach.rarity] : `${RARITY_COLOR[ach.rarity]}77`,
                      background:selected ? `linear-gradient(145deg,${RARITY_BG[ach.rarity]},#fff)` : '#fff', borderRadius:16, padding:'14px 12px',
                      cursor:'pointer', textAlign:'center', transition:'all .18s ease',
                      boxShadow:selected ? `0 0 0 1px ${RARITY_COLOR[ach.rarity]},0 8px 24px ${RARITY_GLOW[ach.rarity]}` : `0 4px 14px ${RARITY_GLOW[ach.rarity]}` } as React.CSSProperties}>
                    <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}>
                      <Medal template={ach.svgTemplate} achievementId={ach.id} size={58} />
                    </div>
                    <div style={{ fontSize:12, fontWeight:800, color:'#0F1729', lineHeight:1.25, minHeight:32 }}>{ach.name}</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:8, flexWrap:'wrap' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:9, fontWeight:900,
                        color:RARITY_COLOR[ach.rarity], background:RARITY_BG[ach.rarity], border:`1px solid ${RARITY_COLOR[ach.rarity]}55`, borderRadius:999, padding:'4px 8px' }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:RARITY_COLOR[ach.rarity], boxShadow:`0 0 7px ${RARITY_COLOR[ach.rarity]}` }} />
                        {ach.rarityLabel}
                      </span>
                      {placed && <span style={{ fontSize:9, fontWeight:800, color:'#059669', background:'#ECFDF5', borderRadius:999, padding:'4px 8px' }}>В кителе</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AWARD TREE ───────────────────────────────────────────────────────────────
function AwardTree({ earned, progress, onOpen }: {
  earned: Record<number,EarnedInfo>;
  progress: Record<number,ProgressInfo>;
  onOpen: (id: number) => void;
}) {
  const nW = 118, nH = 56, gap = 40, padY = 16, padX = 20;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {DEP_CHAINS.map(({ title, chain, color }) => {
        const nodes = chain.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean) as Achievement[];
        const W     = padX * 2 + nodes.length * nW + (nodes.length - 1) * gap;
        const H     = padY * 2 + nH;
        return (
          <div key={title}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:color, boxShadow:`0 0 6px ${color}66` }} />
              <span style={{ fontSize:13, fontWeight:800, color:'#0F1729' }}>{title}</span>
              <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${color}44,transparent)` }} />
              <span style={{ fontSize:11, color:'#9CA3AF' }}>
                {nodes.filter(n => earned[n.id]).length}/{nodes.length} получено
              </span>
            </div>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible', display:'block' }}>
              {/* connection lines */}
              {nodes.slice(0,-1).map((node, i) => {
                const isE  = !!earned[node.id];
                const next = nodes[i + 1];
                const nextE = !!earned[next.id];
                const nextP = !!progress[next.id];
                const x1 = padX + i * (nW + gap) + nW;
                const x2 = padX + (i + 1) * (nW + gap);
                const y  = padY + nH / 2;
                const stroke = isE && nextE ? color : isE && nextP ? color : '#D1D5DB';
                const dashed = !isE;
                return (
                  <g key={node.id}>
                    <line x1={x1+4} y1={y} x2={x2-4} y2={y}
                      stroke={stroke} strokeWidth={dashed ? 1.5 : 2.5}
                      strokeDasharray={dashed ? '5,4' : undefined}
                      style={{ transition:'stroke .4s', opacity: dashed ? .5 : 1 }} />
                    {!dashed && (
                      <polygon points={`${x2-2},${y-5} ${x2+7},${y} ${x2-2},${y+5}`} fill={stroke} />
                    )}
                    {isE && nextP && !nextE && (
                      <circle r={4} fill={color} style={{ animation:`pulse 1.5s ease infinite` }}>
                        <animateMotion dur="2s" repeatCount="indefinite"
                          path={`M${x1+4},${y} L${x2-4},${y}`} />
                      </circle>
                    )}
                  </g>
                );
              })}
              {/* nodes */}
              {nodes.map((node, i) => {
                const isE = !!earned[node.id];
                const isP = !!progress[node.id];
                const prog = progress[node.id];
                const x   = padX + i * (nW + gap);
                const y   = padY;
                const bg  = isE ? '#ECFDF5' : isP ? '#EBF1FF' : '#F8F9FB';
                const bdr = isE ? color : isP ? '#375DFB' : '#D1D5DB';
                const tc  = isE ? '#059669' : isP ? '#375DFB' : '#9CA3AF';
                const progressPct = prog ? Math.round(prog.current / prog.max * 100) : 0;
                return (
                  <g key={node.id} className="tree-node" onClick={() => onOpen(node.id)}>
                    <rect x={x} y={y} width={nW} height={nH} rx={10}
                      className="tree-node-card"
                      fill={bg} stroke={bdr} strokeWidth={isE || isP ? 2 : 1.5}
                      style={{ filter: isE ? `drop-shadow(0 2px 8px ${color}44)` : 'none', transition:'filter .2s' }} />
                    {/* status dot */}
                    <circle cx={x+nW/2} cy={y+15} r={5} fill={isE ? '#10B981' : isP ? '#375DFB' : '#CBD5E1'} />
                    <text className="tree-node-label" x={x+nW/2} y={y+32} textAnchor="middle" fontSize="9" fill={tc} fontWeight="700">
                      {node.name.length > 17 ? node.name.slice(0,16)+'…' : node.name}
                    </text>
                    {isP && prog && (
                      <g>
                        <rect x={x+8} y={y+nH-10} width={nW-16} height={4} rx={2} fill="#E5E7EB" />
                        <rect x={x+8} y={y+nH-10} width={(nW-16)*progressPct/100} height={4} rx={2}
                          fill="#375DFB" style={{ transition:'width .6s' }} />
                      </g>
                    )}
                    {isE && (
                      <circle cx={x+nW-10} cy={y+10} r={6} fill={color}>
                        <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        );
      })}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginTop:4 }}>
        {[['Получено','#10B981'],['В процессе','#375DFB'],['Заблокировано','#9CA3AF']].map(([label, color]) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#9CA3AF' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:color }} />
            {label}
          </div>
        ))}
        <span style={{ fontSize:11, color:'#9CA3AF', marginLeft:'auto' }}>Кликни на узел для деталей</span>
      </div>
    </div>
  );
}

// ─── ACH CARD ─────────────────────────────────────────────────────────────────
function AchCard({ ach, earned, progress, idx, onOpen, onDragStart }: {
  ach: Achievement; earned: Record<number,EarnedInfo>; progress: Record<number,ProgressInfo>;
  idx: number; onOpen: (id: number) => void; onDragStart: (id: number) => void;
}) {
  const status    = getStatus(ach, earned, progress);
  const prog      = progress[ach.id];
  const earnedInf = earned[ach.id];
  const isEarned  = status === 'earned';
  const isHidden  = status === 'hidden';
  const isLocked  = status === 'locked';
  const isInProg  = status === 'inprogress';
  const pct       = prog ? Math.round(prog.current / prog.max * 100) : 0;
  const prereq    = ach.prerequisite ? ACHIEVEMENTS.find(a => a.id === ach.prerequisite) : null;

  return (
    <div className="ach-card"
      draggable={isEarned}
      onDragStart={() => onDragStart(ach.id)}
      onClick={() => onOpen(ach.id)}
      style={{ background: isEarned
        ? `linear-gradient(145deg,${RARITY_BG[ach.rarity]},#fff)`
        : isLocked || isHidden ? '#F9FAFB' : '#fff',
        borderRadius:18, padding:'16px 16px 14px',
        '--rarity-color':RARITY_COLOR[ach.rarity], '--rarity-glow':RARITY_GLOW[ach.rarity],
        border: `2px solid ${isHidden ? `${RARITY_COLOR[ach.rarity]}44` : isLocked ? `${RARITY_COLOR[ach.rarity]}66` : `${RARITY_COLOR[ach.rarity]}AA`}`,
        cursor:'pointer', position:'relative', overflow:'hidden',
        boxShadow: isEarned ? `0 0 0 1px ${RARITY_COLOR[ach.rarity]}22,0 6px 22px ${RARITY_GLOW[ach.rarity]}` : `0 3px 12px ${RARITY_GLOW[ach.rarity]}`,
        animation: `fadeUp .35s ease ${Math.min(idx*.03,.5)}s both` } as React.CSSProperties}>

      {/* elite shimmer */}
      {ach.elite && isEarned && (
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,transparent 40%,rgba(245,158,11,.08) 50%,transparent 60%)',
          backgroundSize:'200% 200%', animation:'shimmer 3s linear infinite', pointerEvents:'none' }} />
      )}

      {/* top badges */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, gap:4 }}>
        <span style={{ fontSize:10, fontWeight:800, padding:'3px 9px', borderRadius:20, whiteSpace:'nowrap',
          background: isEarned ? '#ECFDF5' : isInProg ? '#EBF1FF' : isHidden ? '#F3F4F6' : '#F3F4F6',
          color: isEarned ? '#059669' : isInProg ? '#375DFB' : '#9CA3AF',
          border: `1px solid ${isEarned ? '#A7F3D0' : isInProg ? '#BFDBFE' : '#E5E7EB'}` }}>
          {isEarned ? 'Получено' : isInProg ? 'В процессе' : isLocked ? 'Заблокировано' : 'Скрытая'}
        </span>
        {ach.elite && (
          <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:20,
            background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)', color:'#D97706',
            border:'1px solid #FDE68A', whiteSpace:'nowrap' }}>ЭЛИТА</span>
        )}
      </div>

      {/* medal */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:14, position:'relative' }}>
        {isHidden ? <HiddenMedal size={76} /> : <Medal template={ach.svgTemplate} achievementId={ach.id} size={76} dimmed={!isEarned} />}
        {isInProg && prog && (
          <svg width={76} height={76} style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)' }}>
            <circle cx={38} cy={38} r={35} fill="none" stroke="#E5E7EB" strokeWidth={3} />
            <circle cx={38} cy={38} r={35} fill="none" stroke="#375DFB" strokeWidth={3} strokeLinecap="round"
              strokeDasharray={2*Math.PI*35} strokeDashoffset={2*Math.PI*35*(1-pct/100)}
              style={{ transform:'rotate(-90deg)', transformOrigin:'38px 38px', transition:'stroke-dashoffset .8s' }} />
          </svg>
        )}
      </div>

      {/* name & condition */}
      <div style={{ fontSize:13, fontWeight:800, color: isHidden ? '#9CA3AF' : '#0F1729',
        marginBottom:4, textAlign:'center', lineHeight:1.3 }}>
        {isHidden ? '??? ???' : ach.name}
      </div>
      <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:12, textAlign:'center', lineHeight:1.45,
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' } as React.CSSProperties}>
        {isHidden ? 'Условие засекречено' : ach.condition}
      </div>

      {/* footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:4, flexWrap:'wrap' }}>
        <RarityBadge rarity={ach.rarity} label={ach.rarityLabel} />
        {isEarned && earnedInf && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, color:'#9CA3AF', fontWeight:500 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 2v4M16 2v4M4 10h16M6 4h12a2 2 0 0 1 2 2v14H4V6a2 2 0 0 1 2-2Z"/>
            </svg>
            {earnedInf.date}
          </span>
        )}
        {isInProg && prog && (
          <span style={{ fontSize:11, fontWeight:800, color:'#375DFB' }}>{prog.current}/{prog.max}</span>
        )}
        {isLocked && prereq && (
          <span style={{ fontSize:10, color:'#9CA3AF', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:90 }}>
            {prereq.name}
          </span>
        )}
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:8 }}>
        <span style={{ fontSize:10, fontWeight:700, color: RARITY_COLOR[ach.rarity], background: RARITY_BG[ach.rarity],
          padding:'2px 8px', borderRadius:20 }}>+{ach.points} БР</span>
        {ach.trigger === 'manual' && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, color:'#9CA3AF', fontWeight:600 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            вручную
          </span>
        )}

      </div>

      {isEarned && (
        <div style={{ textAlign:'center', marginTop:8, fontSize:10, color:`${RARITY_COLOR[ach.rarity]}88`, fontWeight:600 }}>
          Перетащи на китель ↑
        </div>
      )}
    </div>
  );
}

// ─── ACH MODAL ────────────────────────────────────────────────────────────────
function AchModal({ ach, earned, progress, profileShow, onProfileToggle, onClose, onShare, onNavigate }: {
  ach: Achievement; earned: Record<number,EarnedInfo>; progress: Record<number,ProgressInfo>;
  profileShow: Record<number,boolean>; onProfileToggle: (id: number) => void; onClose: () => void;
  onShare: (ach: Achievement) => void; onNavigate: (path: string) => void;
}) {
  const status    = getStatus(ach, earned, progress);
  const earnedInf = earned[ach.id];
  const prog      = progress[ach.id];
  const isEarned  = status === 'earned';
  const isInProg  = status === 'inprogress';
  const isLocked  = status === 'locked';
  const isHidden  = status === 'hidden';
  const pct       = prog ? Math.round(prog.current / prog.max * 100) : 0;
  const remaining = prog ? prog.max - prog.current : 0;
  const prereq    = ach.prerequisite ? ACHIEVEMENTS.find(a => a.id === ach.prerequisite) : null;
  const showInProf = profileShow[ach.id] ?? isEarned;
  const routePath  = CATEGORY_STATS.find(c => c.cat === ach.category)?.routeKey ?? '/';

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(15,23,41,.7)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000, padding:20,
      animation:'fadeIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:24, width:'100%', maxWidth:500,
        overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.4)', animation:'scaleIn .25s cubic-bezier(.34,1.56,.64,1) both' }}>

        {/* header */}
        <div style={{ background: isEarned
          ? `linear-gradient(135deg,${RARITY_BG[ach.rarity]},#fff)`
          : 'linear-gradient(135deg,#F8FAFF,#fff)',
          padding:'20px 24px 0', borderBottom:'1px solid #F0F2F8' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                <span style={{ fontSize:11, color: RARITY_COLOR[ach.rarity], fontWeight:800,
                  textTransform:'uppercase', letterSpacing:1.2 }}>{ach.categoryLabel}</span>
                {ach.elite && <span style={{ fontSize:10, background:'#FFFBEB', color:'#D97706',
                  padding:'2px 8px', borderRadius:20, fontWeight:800, border:'1px solid #FDE68A' }}>ЭЛИТА</span>}
              </div>
              <div style={{ fontSize:20, fontWeight:900, color:'#0F1729', lineHeight:1.2 }}>
                {isHidden ? '??? Скрытая награда' : ach.name}
              </div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(0,0,0,.06)', border:'none', width:36, height:36,
              borderRadius:10, cursor:'pointer', fontSize:18, color:'#6B7280', display:'flex', alignItems:'center',
              justifyContent:'center', flexShrink:0, transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(0,0,0,.1)'; e.currentTarget.style.color='#374151'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(0,0,0,.06)'; e.currentTarget.style.color='#6B7280'; }}>
              ✕
            </button>
          </div>
          {/* medal display */}
          <div style={{ display:'flex', justifyContent:'center', paddingBottom:20, position:'relative' }}>
            {isEarned && (
              <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%',
                background:`radial-gradient(circle,${RARITY_GLOW[ach.rarity]},transparent 70%)`,
                top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
            )}
            {isHidden ? <HiddenMedal size={140} /> : <Medal template={ach.svgTemplate} achievementId={ach.id} size={140} dimmed={!isEarned} />}
          </div>
        </div>

        {/* body */}
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, maxHeight:'54vh', overflowY:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <RarityBadge rarity={ach.rarity} label={ach.rarityLabel} />
            <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'#F3F4F6', color:'#6B7280', fontWeight:600,
              display:'inline-flex', alignItems:'center', gap:5 }}>
              <CategoryIcon cat={ach.category} size={13} color="#6B7280" /> {ach.categoryLabel}
            </span>
            <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'#F3F4F6', color:'#9CA3AF', fontWeight:600 }}>
              {isEarned ? 'Получено' : isInProg ? 'В процессе' : isLocked ? 'Заблокировано' : 'Скрытая'}
            </span>
          </div>

          {/* points + trigger row */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
            background:'linear-gradient(135deg,#F8FAFF,#EBF1FF)', borderRadius:10, border:'1px solid #DBEAFE' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:28, height:28, borderRadius:8, background: RARITY_BG[ach.rarity],
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={RARITY_COLOR[ach.rarity]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5"/><path d="M15 12.5 17 22l-5-3-5 3 2-9.5"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:10, color:'#9CA3AF', fontWeight:600 }}>Бонусные рубли</div>
                <div style={{ fontSize:16, fontWeight:900, color: RARITY_COLOR[ach.rarity], lineHeight:1 }}>+{ach.points} БР</div>
              </div>
            </div>
            <div style={{ width:1, height:32, background:'#E5E7EB' }} />
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:28, height:28, borderRadius:8, background: ach.trigger==='manual' ? '#FFFBEB' : '#ECFDF5',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {ach.trigger === 'manual' ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.9-1.1L14.3 3H10l-.4 2.9A7 7 0 0 0 7.7 7L5.3 6l-2 3.4 2 1.5A7 7 0 0 0 5.2 12c0 .4 0 .8.1 1.1l-2 1.5 2 3.4 2.4-1c.6.5 1.2.8 1.9 1.1l.4 2.9h4.3l.4-2.9c.7-.3 1.3-.6 1.9-1.1l2.4 1 2-3.4-2-1.5c.1-.4.1-.7.1-1.1Z"/>
                  </svg>
                )}
              </div>
              <div>
                <div style={{ fontSize:10, color:'#9CA3AF', fontWeight:600 }}>Триггер</div>
                <div style={{ fontSize:12, fontWeight:700, color: ach.trigger==='manual' ? '#D97706' : '#059669', lineHeight:1 }}>
                  {ach.trigger === 'manual' ? 'Вручную (admin)' : 'Автоматически'}
                </div>
              </div>
            </div>
          </div>

          <p style={{ fontSize:13, color:'#374151', lineHeight:1.7, margin:0, background:'#F8FAFF',
            padding:'12px 16px', borderRadius:10, borderLeft:'3px solid #375DFB' }}>
            {isHidden ? 'Условие засекречено. Выполните особые действия на портале для раскрытия этой награды.' : ach.conditionFull}
          </p>

          {/* EARNED */}
          {isEarned && earnedInf && (
            <div style={{ display:'flex', flexDirection:'column', gap:10, borderTop:'1px solid #F0F2F8', paddingTop:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                background:'linear-gradient(135deg,#ECFDF5,#D1FAE5)', borderRadius:12,
                padding:'12px 16px', border:'1.5px solid #A7F3D0' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#10B981"/><path d="M7 12l3.5 3.5L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:'#059669' }}>Получено: {earnedInf.date}</div>
                  <div style={{ fontSize:11, color:'#6EE7B7' }}>
                    Эту награду имеют <b>{earnedInf.pct.toFixed(1)}%</b> бойцов портала
                  </div>
                </div>
              </div>

              {/* profile toggle */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 14px', background:'#F8FAFF', borderRadius:10, border:'1px solid #E9ECF2' }}>
                <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>Показать в профиле</span>
                <div onClick={() => onProfileToggle(ach.id)}
                  style={{ width:42, height:24, background: showInProf ? '#375DFB' : '#D1D5DB',
                    borderRadius:12, cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
                  <div style={{ position:'absolute', top:3, left: showInProf ? 21 : 3, width:18, height:18,
                    background:'#fff', borderRadius:'50%', transition:'left .2s',
                    boxShadow:'0 1px 4px rgba(0,0,0,.25)' }} />
                </div>
              </div>

              {/* share */}
              <button onClick={() => onShare(ach)}
                style={{ width:'100%', padding:'12px 0', background:'linear-gradient(135deg,#F59E0B,#D97706)',
                  border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:800,
                  cursor:'pointer', transition:'all .18s', display:'flex', alignItems:'center',
                  justifyContent:'center', gap:8, letterSpacing:.3 }}
                onMouseEnter={e => { e.currentTarget.style.opacity='.88'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='none'; }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
                Поделиться наградой
              </button>
            </div>
          )}

          {/* IN PROGRESS */}
          {isInProg && prog && (
            <div style={{ display:'flex', flexDirection:'column', gap:10, borderTop:'1px solid #F0F2F8', paddingTop:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:700 }}>
                <span style={{ color:'#374151' }}>Прогресс</span>
                <span style={{ color:'#375DFB' }}>{prog.current} / {prog.max} ({pct}%)</span>
              </div>
              <div style={{ height:12, background:'#E9ECF2', borderRadius:6, overflow:'hidden' }}>
                <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#375DFB,#60A5FA)',
                  borderRadius:6, transition:'width .8s cubic-bezier(.4,0,.2,1)',
                  boxShadow:'0 0 8px rgba(55,93,251,.35)' }} />
              </div>
              <div style={{ fontSize:12, color:'#6B7280', background:'#F8FAFF', padding:'8px 12px', borderRadius:8 }}>
                Осталось: <b style={{ color:'#374151' }}>{remaining}</b> {pluralize(remaining,'действие','действия','действий')}
              </div>
              <button onClick={() => onNavigate(CATEGORY_STATS.find(c => c.cat === ach.category)?.routeKey ?? '/')}
                style={{ width:'100%', padding:'12px 0', background:'linear-gradient(135deg,#375DFB,#5B7FFF)',
                  border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:800,
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  transition:'all .18s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity='.88'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='none'; }}>
                Перейти к выполнению
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}

          {/* LOCKED */}
          {isLocked && (
            <div style={{ borderTop:'1px solid #F0F2F8', paddingTop:14, display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ padding:'14px 16px', background:'#F8F9FB', border:'1.5px solid #E9ECF2', borderRadius:12,
                display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'#E9ECF2',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                    <path d="M7 11V8a5 5 0 0 1 10 0v3"/><rect x="5" y="11" width="14" height="10" rx="2"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:'#374151', marginBottom:2 }}>Награда заблокирована</div>
                  {prereq && (
                    <div style={{ fontSize:12, color:'#9CA3AF' }}>
                      Сначала получите: <b style={{ color:'#375DFB' }}>{prereq.name}</b>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => onNavigate(routePath)}
                style={{ width:'100%', padding:'11px 0', background:'#F3F4F6', border:'1.5px solid #E5E7EB',
                  borderRadius:12, color:'#374151', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#E5E7EB'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#F3F4F6'; }}>
                Перейти к разделу →
              </button>
            </div>
          )}

          {/* HIDDEN */}
          {isHidden && (
            <div style={{ borderTop:'1px solid #F0F2F8', paddingTop:14 }}>
              <div style={{ padding:'14px 16px', background:'#F8F9FB', border:'1.5px solid #E9ECF2',
                borderRadius:12, textAlign:'center' }}>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
                  <HiddenMedal size={48} />
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:'#6B7280' }}>Скрытая награда</div>
                <div style={{ fontSize:12, color:'#9CA3AF', marginTop:4 }}>
                  Выполните особые действия для раскрытия
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── UNLOCK OVERLAY ───────────────────────────────────────────────────────────
function UnlockOverlay({ ach, phase, onClaim, onClose }: {
  ach: Achievement; phase: 'flash'|'medal'|'text'|'done';
  onClaim: () => void; onClose: () => void;
}) {
  const rarityColors: Record<Rarity, [string,string]> = {
    common:  ['#6B7280','#9CA3AF'],
    rare:    ['#10B981','#34D399'],
    epic:    ['#7C3AED','#A78BFA'],
    legend:  ['#D97706','#F59E0B'],
  };
  const [c1, c2] = rarityColors[ach.rarity];

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:300, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:0,
      background:`radial-gradient(ellipse at center, rgba(15,23,41,.97) 0%, rgba(5,8,18,1) 100%)`,
      animation:'fadeIn .3s ease' }}>

      {/* ambient glow */}
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%',
        background:`radial-gradient(circle,${c1}22,transparent 70%)`,
        animation: phase !== 'flash' ? 'glowPulse 2s ease-in-out infinite' : 'none',
        '--glow': `${c1}44` } as React.CSSProperties} />

      {/* decorative rings */}
      {phase !== 'flash' && [120,160,200,240].map((r,i) => (
        <div key={r} style={{ position:'absolute', width:r*2, height:r*2, borderRadius:'50%',
          border:`1px solid ${c1}${['44','33','22','11'][i]}`,
          animation:`pulse ${2+i*.3}s ease-in-out ${i*.1}s infinite` }} />
      ))}

      {/* medal */}
      <div style={{ position:'relative', marginBottom:24, opacity: phase === 'flash' ? 0 : 1,
        animation: phase === 'medal' ? 'medalDrop .7s cubic-bezier(0.34,1.56,0.64,1) both' : 'none' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ position:'absolute', inset:-16, borderRadius:'50%', background:`radial-gradient(circle,${c1}33,transparent 70%)`,
          animation: phase !== 'flash' ? `glowPulse 1.5s ease-in-out infinite` : 'none',
          '--glow': `${c1}55` } as React.CSSProperties} />
        <Medal template={ach.svgTemplate} achievementId={ach.id} size={160}
          style={{ filter:`drop-shadow(0 0 40px ${c1}88) drop-shadow(0 16px 32px rgba(0,0,0,.6))`, position:'relative', zIndex:1 }} />
        {/* sparkles */}
        {phase === 'done' && [0,1,2,3,4,5].map(i => (
          <div key={i} style={{ position:'absolute', width:6, height:6, borderRadius:'50%',
            background: i%2===0 ? c1 : c2,
            top:`${50+40*Math.sin(i*60*Math.PI/180)}%`,
            left:`${50+40*Math.cos(i*60*Math.PI/180)}%`,
            animation:`sparkle ${1+i*.2}s ease ${i*.15}s infinite` }} />
        ))}
      </div>

      {/* text */}
      <div style={{ textAlign:'center', opacity: phase === 'text' || phase === 'done' ? 1 : 0,
        animation: phase === 'text' ? 'fadeUp .4s ease both' : 'none', position:'relative', zIndex:1 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:11, fontWeight:800, color:`${c2}`, letterSpacing:4,
          textTransform:'uppercase', marginBottom:10 }}>
          {'★'.repeat(ach.rarity === 'legend' ? 5 : ach.rarity === 'epic' ? 4 : ach.rarity === 'rare' ? 3 : 2)}
        </div>
        <div style={{ fontSize:36, fontWeight:900, color:'#fff', letterSpacing:2,
          textTransform:'uppercase', marginBottom:8,
          textShadow:`0 0 40px ${c1}88, 0 4px 8px rgba(0,0,0,.6)`,
          animation:'fadeUp .4s ease .05s both' }}>
          НАГРАДА ПОЛУЧЕНА!
        </div>
        <div style={{ fontSize:22, color: c2, fontWeight:800, marginBottom:6,
          animation:'fadeUp .4s ease .12s both' }}>
          {ach.name}
        </div>
        <div style={{ marginBottom:24, animation:'fadeUp .4s ease .18s both' }}>
          <RarityBadge rarity={ach.rarity} label={ach.rarityLabel} />
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'center', animation:'fadeUp .4s ease .25s both' }}>
          <button onClick={onClaim}
            style={{ padding:'14px 36px', border:`2px solid ${c1}`,
              background:`linear-gradient(135deg,${c1},${c2})`,
              color: ach.rarity === 'legend' ? '#1a2744' : '#fff',
              borderRadius:14, fontWeight:800, fontSize:16, cursor:'pointer',
              transition:'all .18s', letterSpacing:.5,
              boxShadow:`0 8px 32px ${c1}44` }}
            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.04) translateY(-2px)'; e.currentTarget.style.boxShadow=`0 12px 40px ${c1}66`; }}
            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow=`0 8px 32px ${c1}44`; }}>
            Получить
          </button>
          <button onClick={onClose}
            style={{ padding:'14px 24px', background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.7)',
              border:'1.5px solid rgba(255,255,255,.15)', borderRadius:14, fontSize:14, fontWeight:600,
              cursor:'pointer', transition:'all .18s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.08)'; }}>
            Закрыть
          </button>
        </div>
        <div style={{ marginTop:20, fontSize:12, color:'rgba(255,255,255,.3)', animation:'fadeUp .4s ease .35s both' }}>
          ESC или клик вне для закрытия
        </div>
      </div>
    </div>
  );
}
