import { create } from 'zustand';

interface User {
  id: string; email: string; firstName: string; lastName: string; role: string;
  avatar?: string; jobTitle?: string; employeeId?: string; phone?: string;
  organization?: { id: string; name: string; logo?: string };
  department?: { id: string; name: string };
  team?: { id: string; name: string };
  badges?: any[]; _count?: { feedbacks: number; complaints: number; notifications: number };
}

interface AuthState {
  user: User | null; token: string | null; isAuthenticated: boolean; isLoading: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, token: null, isAuthenticated: false, isLoading: true,
  login: (user, token, refreshToken) => {
    localStorage.setItem('pulsemind_token', token);
    localStorage.setItem('pulsemind_refresh', refreshToken);
    localStorage.setItem('pulsemind_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('pulsemind_token');
    localStorage.removeItem('pulsemind_refresh');
    localStorage.removeItem('pulsemind_user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
  setUser: (user) => {
    localStorage.setItem('pulsemind_user', JSON.stringify(user));
    set({ user });
  },
  setLoading: (isLoading) => set({ isLoading }),
  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pulsemind_token');
      const userStr = localStorage.getItem('pulsemind_user');
      if (token && userStr) {
        try { set({ user: JSON.parse(userStr), token, isAuthenticated: true, isLoading: false }); }
        catch { set({ isLoading: false }); }
      } else { set({ isLoading: false }); }
    }
  },
}));

interface ThemeState {
  isDark: boolean; toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: true,
  toggle: () => set((state) => {
    const newDark = !state.isDark;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulsemind_theme', newDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newDark);
    }
    return { isDark: newDark };
  }),
}));

interface NotificationState {
  unreadCount: number; notifications: any[];
  setUnreadCount: (count: number) => void;
  setNotifications: (notifications: any[]) => void;
  addNotification: (notification: any) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0, notifications: [],
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1,
  })),
}));
