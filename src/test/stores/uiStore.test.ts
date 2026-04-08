import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@store/uiStore';
import { NotificationType } from '@/types';

const makeNotification = (overrides = {}) => ({
  id: `notif-${Date.now()}-${Math.random()}`,
  userId: 'user-1',
  type: NotificationType.INFO,
  title: 'Test',
  message: 'Test message',
  read: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('uiStore — notifications', () => {
  beforeEach(() => {
    useUIStore.setState({
      notifications: [],
      unreadCount: 0,
      notificationPreferences: {
        enabledTypes: [
          NotificationType.INFO,
          NotificationType.WARNING,
          NotificationType.ERROR,
          NotificationType.SUCCESS,
        ],
        pushEnabled: false,
      },
    });
  });

  it('adds a notification and increments unreadCount', () => {
    const notif = makeNotification();
    useUIStore.getState().addNotification(notif);
    const state = useUIStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.unreadCount).toBe(1);
  });

  it('does not increment unreadCount for already-read notifications', () => {
    const notif = makeNotification({ read: true });
    useUIStore.getState().addNotification(notif);
    expect(useUIStore.getState().unreadCount).toBe(0);
  });

  it('does not add notification if type is disabled in preferences', () => {
    useUIStore.setState({
      notificationPreferences: { enabledTypes: [NotificationType.ERROR], pushEnabled: false },
    });
    useUIStore.getState().addNotification(makeNotification({ type: NotificationType.INFO }));
    expect(useUIStore.getState().notifications).toHaveLength(0);
  });

  it('marks a single notification as read', () => {
    const notif = makeNotification();
    useUIStore.getState().addNotification(notif);
    useUIStore.getState().markNotificationAsRead(notif.id);
    const state = useUIStore.getState();
    expect(state.notifications[0].read).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it('marks all notifications as read', () => {
    useUIStore.getState().addNotification(makeNotification());
    useUIStore.getState().addNotification(makeNotification());
    useUIStore.getState().markAllNotificationsAsRead();
    const state = useUIStore.getState();
    expect(state.notifications.every((n) => n.read)).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it('removes a notification and adjusts unreadCount', () => {
    const notif = makeNotification();
    useUIStore.getState().addNotification(notif);
    useUIStore.getState().removeNotification(notif.id);
    const state = useUIStore.getState();
    expect(state.notifications).toHaveLength(0);
    expect(state.unreadCount).toBe(0);
  });

  it('caps notifications at 100 entries', () => {
    for (let i = 0; i < 105; i++) {
      useUIStore.getState().addNotification(makeNotification({ id: `n-${i}` }));
    }
    expect(useUIStore.getState().notifications.length).toBeLessThanOrEqual(100);
  });
});

describe('uiStore — sidebar', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: true, sidebarCollapsed: false });
  });

  it('toggles sidebar open state', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('toggles sidebar collapsed state', () => {
    useUIStore.getState().toggleSidebarCollapse();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
  });
});

describe('uiStore — realtime energy', () => {
  it('updates realtime energy reading', () => {
    const reading = { power: 1500, energy: 1.5, timestamp: new Date().toISOString() };
    useUIStore.getState().updateRealtimeEnergy(reading);
    expect(useUIStore.getState().realtimeEnergy).toEqual(reading);
  });
});
