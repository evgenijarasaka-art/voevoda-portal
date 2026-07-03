import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AchievementSection = 'sport' | 'other';

export type ProfileAchievement = {
  id: number;
  section: AchievementSection;
  name: string;
  info: string;
  img: string;
  showInProfile?: boolean;
};

const INITIAL_ACHIEVEMENTS: ProfileAchievement[] = [
  { id: 1, section: 'sport', name: 'КМС по жиму лёжа', info: '2018 год, Москва, спорт-комплекс Динамо', img: '/dost1.png' },
  { id: 2, section: 'sport', name: '2-й юношеский по шахматам', info: '12.05.2024, XXII турнир Чемпионата России по шахматному спорту', img: '/dost2.png' },
  { id: 3, section: 'other', name: 'Лучший наставник учебной группы', info: 'Награда за подготовку курсантов и проведение полевых занятий', img: '/dost3.png' },
  { id: 4, section: 'other', name: 'Участник патриотического слёта', info: 'Москва, форум инструкторов и командиров учебных центров', img: '/dost4.png' },
];

type ProfileAchievementsState = {
  achievements: ProfileAchievement[];
  addAchievement: (achievement: Omit<ProfileAchievement, 'id'>) => void;
  updateAchievement: (id: number, data: Pick<ProfileAchievement, 'name' | 'info' | 'img'>) => void;
  deleteAchievement: (id: number) => void;
  toggleShowInProfile: (id: number) => void;
};

export const useProfileAchievementsStore = create<ProfileAchievementsState>()(
  persist(
    (set) => ({
      achievements: INITIAL_ACHIEVEMENTS,
      addAchievement: (achievement) => set((state) => ({
        achievements: [{ ...achievement, id: Date.now(), showInProfile: true }, ...state.achievements],
      })),
      updateAchievement: (id, data) => set((state) => ({
        achievements: state.achievements.map((achievement) =>
          achievement.id === id ? { ...achievement, ...data } : achievement,
        ),
      })),
      deleteAchievement: (id) => set((state) => ({
        achievements: state.achievements.filter((achievement) => achievement.id !== id),
      })),
      toggleShowInProfile: (id) => set((state) => ({
        achievements: state.achievements.map((a) =>
          a.id === id ? { ...a, showInProfile: a.showInProfile === false ? true : false } : a,
        ),
      })),
    }),
    { name: 'voevoda_profile_achievements_v2' },
  ),
);
