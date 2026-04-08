import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification, NotificationType } from '@/types';

export interface RealtimeEnergyReading {
  power: number;
  energy: number;
  timestamp: string;
  deviceId?: string;
}

export interface NotificationPreferences {
  enabledTypes: NotificationType[];
  pushEnabled: boolean;
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  notificationDrawerOpen: boolean;
  notificationPreferences: NotificationPreferences;

  // Realtime energy
  realtimeEnergy: RealtimeEnergyReading | null;

  // Loading
  globalLoading: boolean;

  // Breadcrumbs
  breadcrumbs: Array<{ label: string; path?: string }>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;

  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  toggleNotificationDrawer: () => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  setNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;

  updateRealtimeEnergy: (reading: RealtimeEnergyReading) => void;

  setGlobalLoading: (loading: boolean) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      notifications: [],
      unreadCount: 0,
      notificationDrawerOpen: false,
      notificationPreferences: {
        enabledTypes: [
          NotificationType.INFO,
          NotificationType.WARNING,
          NotificationType.ERROR,
          NotificationType.SUCCESS,
        ],
        pushEnabled: false,
      },
      realtimeEnergy: null,
      globalLoading: false,
      breadcrumbs: [],

      // Sidebar actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Notification actions
      addNotification: (notification) =>
        set((state) => {
          const enabled = state.notificationPreferences.enabledTypes.includes(notification.type);
          if (!enabled) return state;
          return {
            notifications: [notification, ...state.notifications].slice(0, 100),
            unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
          };
        }),

      markNotificationAsRead: (id) =>
        set((state) => {
          const notif = state.notifications.find((n) => n.id === id);
          if (!notif || notif.read) return state;
          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }),

      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const notif = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notif && !notif.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        }),

      toggleNotificationDrawer: () =>
        set((state) => ({ notificationDrawerOpen: !state.notificationDrawerOpen })),

      setNotificationDrawerOpen: (open) => set({ notificationDrawerOpen: open }),

      setNotificationPreferences: (prefs) =>
        set((state) => ({
          notificationPreferences: { ...state.notificationPreferences, ...prefs },
        })),

      // Realtime energy
      updateRealtimeEnergy: (reading) => set({ realtimeEnergy: reading }),

      // Other actions
      setGlobalLoading: (loading) => set({ globalLoading: loading }),
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
    }),
    {
      name: 'autouni-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        notificationPreferences: state.notificationPreferences,
      }),
    }
  )
);