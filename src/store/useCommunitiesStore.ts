import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Community = {
  id: number;
  name: string;
  type: string;
  city: string;
  members: number;
  active: number;
  posts: number;
  photos: number;
  awards: number;
  createdAt: string;
  image: string;
  imagePosition: string;
  joined: boolean;
  joinedAt?: string | null;
  desc: string;
};

export const INITIAL_COMMUNITIES: Community[] = [
  { id: 1, name: 'Боевое братство Воеводы', type: 'Клубы Воевод', city: 'Москва', members: 7640, active: 521, posts: 312, photos: 1850, awards: 48, createdAt: '18 мая 2021', image: '/voendelo1.png', imagePosition: 'center 42%', joined: true, joinedAt: '2026-05-18T09:00:00.000Z', desc: 'Главное сообщество выпускников и курсантов. Обсуждаем тренировки, встречи, соревнования и взаимопомощь.' },
  { id: 2, name: 'Снайперы России', type: 'Спортивные', city: 'Санкт-Петербург', members: 1280, active: 84, posts: 91, photos: 430, awards: 17, createdAt: '7 сентября 2022', image: '/voendelo3.png', imagePosition: 'center 45%', joined: false, desc: 'Практика точной стрельбы, разбор соревнований, подготовка к полевым занятиям и командным стартам.' },
  { id: 3, name: 'Юнармия. Южный рубеж', type: 'Юнармия', city: 'Краснодар', members: 2310, active: 176, posts: 144, photos: 920, awards: 26, createdAt: '12 февраля 2020', image: '/sorev1.png', imagePosition: 'center 38%', joined: false, desc: 'Региональные сборы, наставники, городские мероприятия и волонтерские выезды.' },
  { id: 4, name: 'Ветераны-наставники', type: 'Ветеранские', city: 'Москва', members: 940, active: 63, posts: 76, photos: 310, awards: 39, createdAt: '9 мая 2019', image: '/voendelo5.png', imagePosition: 'center 45%', joined: false, desc: 'Встречи с наставниками, исторические лекции и помощь в подготовке молодых бойцов.' },
  { id: 5, name: 'Центр тактической медицины', type: 'Центры ВП', city: 'Казань', members: 1540, active: 112, posts: 88, photos: 560, awards: 21, createdAt: '23 октября 2023', image: '/медицина1.png', imagePosition: 'center 42%', joined: false, desc: 'Учебные материалы, расписание семинаров, чек-листы и разбор практических занятий.' },
  { id: 6, name: 'Полигон выходного дня', type: 'ВП-клубы / отряды', city: 'Новосибирск', members: 870, active: 45, posts: 39, photos: 260, awards: 8, createdAt: '2 апреля 2024', image: '/specpred1.png', imagePosition: 'center 40%', joined: false, desc: 'Анонсы тренировок, команды на выезд, отчеты и обмен экипировкой перед занятиями.' },
  { id: 7, name: 'ДОСААФ: крыло столицы', type: 'ДОСААФ', city: 'Москва', members: 1830, active: 97, posts: 116, photos: 680, awards: 31, createdAt: '15 января 2020', image: '/voendelo2.png', imagePosition: 'center 44%', joined: false, desc: 'Стрелковая, парашютная и техническая подготовка. Набор в городские команды и календарь сборов.' },
  { id: 8, name: 'УВЦ Северо-Запад', type: 'УВЦ', city: 'Санкт-Петербург', members: 720, active: 58, posts: 54, photos: 240, awards: 14, createdAt: '1 сентября 2021', image: '/voendelo4.png', imagePosition: 'center 42%', joined: false, desc: 'Учебные сборы, методические материалы и обмен опытом между курсантами военного учебного центра.' },
  { id: 9, name: 'Военные ВУЗы: абитуриенты и курсанты', type: 'Военные ВУЗы', city: 'Россия', members: 3260, active: 241, posts: 203, photos: 790, awards: 22, createdAt: '20 июня 2018', image: '/register-slide-1.jpg', imagePosition: 'center 42%', joined: false, desc: 'Поступление, нормативы, учеба и быт курсантов. Наставники отвечают на вопросы будущих офицеров.' },
  { id: 10, name: 'Экипажи БПЛА', type: 'ВП-клубы / отряды', city: 'Рязань', members: 1140, active: 128, posts: 109, photos: 510, awards: 19, createdAt: '11 ноября 2023', image: '/voen4.png', imagePosition: 'center 35%', joined: false, desc: 'Практика пилотирования, связь, навигация, ремонт и командная работа расчётов БПЛА.' },
  { id: 11, name: 'Сапёрное дело', type: 'Центры ВП', city: 'Тула', members: 690, active: 51, posts: 63, photos: 280, awards: 16, createdAt: '27 марта 2022', image: '/voendelo6.png', imagePosition: 'center 45%', joined: false, desc: 'Инженерная подготовка, безопасность, учебные макеты и разбор задач сапёрных групп.' },
  { id: 12, name: 'Связисты: устойчивый канал', type: 'Другое', city: 'Екатеринбург', members: 880, active: 74, posts: 72, photos: 330, awards: 12, createdAt: '8 августа 2022', image: '/specpred2.png', imagePosition: 'center 40%', joined: false, desc: 'Радиосвязь, ретрансляция, полевые сети и взаимодействие связистов внутри подразделения.' },
];

type CommunitiesState = {
  communities: Community[];
  toggleJoin: (id: number) => void;
  addCommunity: (community: Community) => void;
};

export const useCommunitiesStore = create<CommunitiesState>()(
  persist(
    (set) => ({
      communities: INITIAL_COMMUNITIES,
      toggleJoin: (id) => set((state) => ({
        communities: state.communities.map((community) =>
          community.id === id
            ? {
                ...community,
                joined: !community.joined,
                joinedAt: community.joined ? null : new Date().toISOString(),
                members: Math.max(0, community.members + (community.joined ? -1 : 1)),
              }
            : community,
        ),
      })),
      addCommunity: (community) => set((state) => ({
        communities: [community, ...state.communities],
      })),
    }),
    {
      name: 'voevoda_communities_v1',
      version: 2,
      migrate: (persisted) => {
        const previous = (persisted as Partial<CommunitiesState> | undefined)?.communities ?? [];
        const previousById = new Map(previous.map(community => [community.id, community]));
        const seeded = INITIAL_COMMUNITIES.map(seed => ({
          ...seed,
          ...previousById.get(seed.id),
          awards: previousById.get(seed.id)?.awards ?? seed.awards,
          createdAt: previousById.get(seed.id)?.createdAt ?? seed.createdAt,
        }));
        const seedIds = new Set(INITIAL_COMMUNITIES.map(community => community.id));
        const custom = previous
          .filter(community => !seedIds.has(community.id))
          .map(community => ({
            ...community,
            awards: community.awards ?? 0,
            createdAt: community.createdAt ?? 'Недавно',
          }));
        return { communities: [...seeded, ...custom] };
      },
    },
  ),
);
