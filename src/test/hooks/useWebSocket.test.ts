import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeviceStore } from '@store/deviceStore';
import { useUIStore } from '@store/uiStore';
import { NotificationType, DeviceStatus } from '@/types';

// ── Mock socket.io-client ─────────────────────────────────────────────────────
const eventHandlers: Record<string, ((...args: unknown[]) => void)[]> = {};

const mockSocket = {
  connected: false,
  on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
    eventHandlers[event] = [...(eventHandlers[event] ?? []), cb];
  }),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(() => { mockSocket.connected = false; }),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => {
    mockSocket.connected = true;
    // Fire 'connect' on next tick to simulate async connect
    setTimeout(() => eventHandlers['connect']?.forEach((h) => h()), 0);
    return mockSocket;
  }),
}));

// Helper to fire a socket event
function fireEvent(event: string, payload?: unknown) {
  eventHandlers[event]?.forEach((h) => h(payload));
}

describe('useWebSocket', () => {
  beforeEach(() => {
    Object.keys(eventHandlers).forEach((k) => delete eventHandlers[k]);
    mockSocket.connected = false;
    vi.clearAllMocks();
    useDeviceStore.setState({ devices: {}, wsConnected: false });
    useUIStore.setState({ notifications: [], unreadCount: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('marks wsConnected when connect event fires', async () => {
    const { useWebSocket } = await import('@hooks/useWebSocket');
    renderHook(() => useWebSocket());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    expect(useDeviceStore.getState().wsConnected).toBe(true);
  });

  it('adds WARNING notification when device goes offline', async () => {
    const { useWebSocket } = await import('@hooks/useWebSocket');
    renderHook(() => useWebSocket());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    act(() => {
      fireEvent('device:online', { deviceId: 'dev-1', online: false });
    });

    const notifications = useUIStore.getState().notifications;
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].type).toBe(NotificationType.WARNING);
  });

  it('updates device status on device:status event', async () => {
    const { useDeviceStore: ds } = await import('@store/deviceStore');
    const { DeviceType } = await import('@/types');
    ds.getState().addDevice({
      id: 'dev-1',
      name: 'Light',
      type: DeviceType.LIGHT,
      status: DeviceStatus.OFF,
      roomId: 'room-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const { useWebSocket } = await import('@hooks/useWebSocket');
    renderHook(() => useWebSocket());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    act(() => {
      fireEvent('device:status', { deviceId: 'dev-1', status: DeviceStatus.ON });
    });

    expect(ds.getState().devices['dev-1'].status).toBe(DeviceStatus.ON);
  });

  it('updates realtime energy on energy:update event', async () => {
    const { useWebSocket } = await import('@hooks/useWebSocket');
    renderHook(() => useWebSocket());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    const reading = { power: 1200, energy: 1.2, timestamp: new Date().toISOString() };
    act(() => { fireEvent('energy:update', reading); });

    expect(useUIStore.getState().realtimeEnergy?.power).toBe(1200);
  });

  it('adds WARNING notification on energy:alert', async () => {
    const { useWebSocket } = await import('@hooks/useWebSocket');
    renderHook(() => useWebSocket());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    act(() => { fireEvent('energy:alert', { message: 'Consumo alto' }); });

    const notifs = useUIStore.getState().notifications;
    expect(notifs.some((n) => n.type === NotificationType.WARNING && n.title === 'Alerta de Consumo')).toBe(true);
  });
});
