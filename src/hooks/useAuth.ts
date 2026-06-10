import { create } from 'zustand';

interface User {
  name: string;
  surname: string;
  login: string;
  email: string;
  phone: string;
  callsign: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (data: { name: string; surname: string; login: string; email: string; phone: string; password: string }) => boolean;
  resetPassword: (phone: string, newPassword: string) => boolean;
}

export const DEMO_ACCOUNTS = [
  { login: 'tornado', password: 'voevoda123', name: 'Александр', surname: 'Воеводов', email: 'tornado@voevoda.demo', phone: '+7 988 222 32 24', callsign: 'Торнадо' },
  { login: 'bek', password: 'voevoda123', name: 'Бек', surname: 'Куратор', email: 'bek@voevoda.demo', phone: '+7 988 222 32 25', callsign: 'Бек' },
  { login: 'koba', password: 'voevoda123', name: 'Коба', surname: 'Инструктор', email: 'koba@voevoda.demo', phone: '+7 988 222 32 26', callsign: 'Коба' },
  { login: 'shooter', password: 'voevoda123', name: 'Сергей', surname: 'Стрелков', email: 'shooter@voevoda.demo', phone: '+7 988 222 32 27', callsign: 'Стрелок' },
  { login: 'nexus', password: 'voevoda123', name: 'Никита', surname: 'Связной', email: 'nexus@voevoda.demo', phone: '+7 988 222 32 28', callsign: 'Нексус' },
];

// localStorage "DB"
function getUsers(): Record<string, { password: string; user: User }> {
  try { return JSON.parse(localStorage.getItem('voevoda_users') || '{}'); } catch { return {}; }
}
function saveUsers(users: Record<string, { password: string; user: User }>) {
  localStorage.setItem('voevoda_users', JSON.stringify(users));
}
function getSavedSession(): { isAuthenticated: boolean; user: User | null } {
  try {
    const raw = localStorage.getItem('voevoda_session');
    if (raw) { const s = JSON.parse(raw); return { isAuthenticated: true, user: s }; }
  } catch {}
  return { isAuthenticated: false, user: null };
}

// Seed demo users
(function seedDemo() {
  const users = getUsers();
  let changed = false;
  DEMO_ACCOUNTS.forEach((demo) => {
    if (!users[demo.login]) {
      users[demo.login] = {
        password: demo.password,
        user: {
          name: demo.name,
          surname: demo.surname,
          login: demo.login,
          email: demo.email,
          phone: demo.phone,
          callsign: demo.callsign,
        },
      };
      changed = true;
    } else {
      users[demo.login].user = {
        ...users[demo.login].user,
        name: demo.name,
        surname: demo.surname,
        email: demo.email,
        phone: demo.phone,
        callsign: demo.callsign,
      };
      changed = true;
    }
  });
  if (changed) {
    saveUsers(users);
  }
  try {
    const rawSession = localStorage.getItem('voevoda_session');
    if (!rawSession) return;
    const session = JSON.parse(rawSession) as User;
    const demo = DEMO_ACCOUNTS.find((account) => account.login === session.login);
    if (!demo) return;
    localStorage.setItem('voevoda_session', JSON.stringify({
      ...session,
      name: demo.name,
      surname: demo.surname,
      email: demo.email,
      phone: demo.phone,
      callsign: demo.callsign,
    }));
  } catch {}
})();

const initial = getSavedSession();

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: initial.isAuthenticated,
  user: initial.user,

  login: (username: string, password: string) => {
    const users = getUsers();
    const key = username.toLowerCase();
    const entry = users[key];
    if (entry && entry.password === password) {
      localStorage.setItem('voevoda_session', JSON.stringify(entry.user));
      set({ isAuthenticated: true, user: entry.user });
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('voevoda_session');
    set({ isAuthenticated: false, user: null });
  },

  register: (data) => {
    const users = getUsers();
    const key = data.login.toLowerCase();
    if (users[key]) return false; // already exists
    const user: User = {
      name: data.name,
      surname: data.surname,
      login: data.login,
      email: data.email,
      phone: data.phone,
      callsign: data.login,
    };
    users[key] = { password: data.password, user };
    saveUsers(users);
    return true;
  },

  resetPassword: (phone: string, newPassword: string) => {
    const users = getUsers();
    const entry = Object.entries(users).find(([, v]) => v.user.phone.replace(/\D/g, '').includes(phone.replace(/\D/g, '')));
    if (entry) {
      users[entry[0]].password = newPassword;
      saveUsers(users);
      return true;
    }
    return false;
  },
}));
