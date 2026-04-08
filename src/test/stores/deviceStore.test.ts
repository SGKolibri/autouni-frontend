import { describe, it, expect, beforeEach } from 'vitest';
import { useDeviceStore } from '@store/deviceStore';
import { DeviceStatus, DeviceType } from '@/types';

const makeDevice = (overrides: Record<string, unknown> = {}) => ({
  id: `device-${Math.random()}`,
  name: 'Test Device',
  type: DeviceType.LIGHT,
  status: DeviceStatus.OFF,
  roomId: 'room-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('deviceStore', () => {
  beforeEach(() => {
    useDeviceStore.setState({ devices: {}, selectedDeviceId: null, wsConnected: false });
  });

  it('sets devices from array', () => {
    const devices = [makeDevice({ id: 'd1' }), makeDevice({ id: 'd2' })];
    useDeviceStore.getState().setDevices(devices);
    const state = useDeviceStore.getState();
    expect(Object.keys(state.devices)).toHaveLength(2);
    expect(state.devices['d1']).toBeDefined();
  });

  it('adds a single device', () => {
    const device = makeDevice({ id: 'd1' });
    useDeviceStore.getState().addDevice(device);
    expect(useDeviceStore.getState().devices['d1']).toEqual(device);
  });

  it('updates a device by id', () => {
    const device = makeDevice({ id: 'd1' });
    useDeviceStore.getState().addDevice(device);
    useDeviceStore.getState().updateDevice('d1', { status: DeviceStatus.ON });
    expect(useDeviceStore.getState().devices['d1'].status).toBe(DeviceStatus.ON);
  });

  it('does nothing when updating non-existent device', () => {
    const before = useDeviceStore.getState().devices;
    useDeviceStore.getState().updateDevice('nonexistent', { status: DeviceStatus.ON });
    expect(useDeviceStore.getState().devices).toEqual(before);
  });

  it('removes a device', () => {
    const device = makeDevice({ id: 'd1' });
    useDeviceStore.getState().addDevice(device);
    useDeviceStore.getState().removeDevice('d1');
    expect(useDeviceStore.getState().devices['d1']).toBeUndefined();
  });

  it('selects a device', () => {
    useDeviceStore.getState().selectDevice('d1');
    expect(useDeviceStore.getState().selectedDeviceId).toBe('d1');
  });

  it('updates device status', () => {
    useDeviceStore.getState().addDevice(makeDevice({ id: 'd1' }));
    useDeviceStore.getState().updateDeviceStatus('d1', DeviceStatus.ON);
    expect(useDeviceStore.getState().devices['d1'].status).toBe(DeviceStatus.ON);
  });

  it('updates device online state via updateDeviceOnline', () => {
    useDeviceStore.getState().addDevice(makeDevice({ id: 'd1' }));
    useDeviceStore.getState().updateDeviceOnline('d1', false);
    // online is dynamically added by the store action
    expect((useDeviceStore.getState().devices['d1'] as any).online).toBe(false);
  });

  it('sets wsConnected', () => {
    useDeviceStore.getState().setWsConnected(true);
    expect(useDeviceStore.getState().wsConnected).toBe(true);
  });

  it('getDevicesByRoom returns correct devices', () => {
    useDeviceStore.getState().addDevice(makeDevice({ id: 'd1', roomId: 'room-1' }));
    useDeviceStore.getState().addDevice(makeDevice({ id: 'd2', roomId: 'room-2' }));
    const devices = useDeviceStore.getState().getDevicesByRoom('room-1');
    expect(devices).toHaveLength(1);
    expect(devices[0].id).toBe('d1');
  });

  it('getActiveDevices returns only ON devices', () => {
    useDeviceStore.getState().addDevice(makeDevice({ id: 'd1', status: DeviceStatus.ON }));
    useDeviceStore.getState().addDevice(makeDevice({ id: 'd2', status: DeviceStatus.OFF }));
    const active = useDeviceStore.getState().getActiveDevices();
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe('d1');
  });
});
