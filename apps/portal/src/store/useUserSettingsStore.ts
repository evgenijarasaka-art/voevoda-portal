import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Пользовательские настройки страницы /settings: приватность, уведомления,
// безопасность. Хранятся в localStorage — переживают перезагрузку, в отличие
// от старой версии страницы, где тумблеры были чистой декорацией на useState.

export interface NotifSettings {
  newMessage: boolean; newSubscriber: boolean; courseUpdate: boolean;
  communityPost: boolean; promoEmail: boolean; weeklyDigest: boolean;
  systemAlerts: boolean; paymentNotif: boolean;
}

export interface PrivacySettings {
  profilePublic: boolean; showOnline: boolean; showBirthday: boolean;
  showCity: boolean; allowMessages: boolean; showCourses: boolean;
}

export interface Session {
  id: string; device: string; location: string; time: string; current: boolean;
}

const DEFAULT_SESSIONS: Session[] = [
  { id: 's1', device: 'Chrome · Windows 11', location: 'Санкт-Петербург, RU', time: 'Сейчас', current: true },
  { id: 's2', device: 'Safari · iPhone 15', location: 'Москва, RU', time: '2 часа назад', current: false },
  { id: 's3', device: 'Firefox · Ubuntu', location: 'Санкт-Петербург, RU', time: 'Вчера', current: false },
];

interface UserSettingsState {
  notif: NotifSettings;
  priv: PrivacySettings;
  twoFA: boolean;
  sessions: Session[];
  setNotif: (patch: Partial<NotifSettings>) => void;
  setPriv: (patch: Partial<PrivacySettings>) => void;
  setTwoFA: (v: boolean) => void;
  endSession: (id: string) => void;
  endAllSessions: () => void;
}

export const useUserSettings = create<UserSettingsState>()(
  persist(
    (set) => ({
      notif: {
        newMessage: true, newSubscriber: true, courseUpdate: true,
        communityPost: false, promoEmail: false, weeklyDigest: true,
        systemAlerts: true, paymentNotif: true,
      },
      priv: {
        profilePublic: true, showOnline: true, showBirthday: false,
        showCity: true, allowMessages: true, showCourses: true,
      },
      twoFA: false,
      sessions: DEFAULT_SESSIONS,
      setNotif: (patch) => set(state => ({ notif: { ...state.notif, ...patch } })),
      setPriv: (patch) => set(state => ({ priv: { ...state.priv, ...patch } })),
      setTwoFA: (twoFA) => set({ twoFA }),
      endSession: (id) => set(state => ({ sessions: state.sessions.filter(s => s.id !== id || s.current) })),
      endAllSessions: () => set(state => ({ sessions: state.sessions.filter(s => s.current) })),
    }),
    { name: 'voevoda_user_settings_v1' },
  ),
);
