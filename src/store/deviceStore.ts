import { create } from 'zustand';
import { Device, DeviceStatus } from '@types/index';

interface DeviceState {
  devices: Record<string, Device>; // deviceId -> Device
  selectedDeviceId: string | null;
  
  // WebSocket connection status
  wsConnected: boolean;
  
  // Actions
  setDevices: (devices: Device[]) => void;
  addDevice: (device: Device) => void;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  removeDevice: (deviceId: string) => void;
  selectDevice: (deviceId: string | null) => void;
  
  // Bulk actions
  updateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  updateDeviceOnline: (deviceId: string, online: boolean) => void;
  
  setWsConnected: (connected: boolean) => void;
  
  // Getters
  getDevice: (deviceId: string) => Device | undefined;
  getDevicesByRoom: (roomId: string) => Device[];
  getOnlineDevices: () => Device[];
  getActiveDevices: () => Device[];
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: {},
  selectedDeviceId: null,
  wsConnected: false,

  setDevices: (devices) => {
    const devicesMap = devices.reduce((acc, device) => {
      acc[device.id] = device;
      return acc;
    }, {} as Record<string, Device>);
    set({ devices: devicesMap });
  },

  addDevice: (device) =>
    set((state) => ({
      devices: { ...state.devices, [device.id]: device },
    })),

  updateDevice: (deviceId, updates) =>
    set((state) => {
      const device = state.devices[deviceId];
      if (!device) return state;
      
      return {
        devices: {
          ...state.devices,
          [deviceId]: { ...device, ...updates, lastSeen: new Date().toISOString() },
        },
      };
    }),

  removeDevice: (deviceId) =>
    set((state) => {
      const { [deviceId]: removed, ...rest } = state.devices;
      return { devices: rest };
    }),

  selectDevice: (deviceId) => set({ selectedDeviceId: deviceId }),

  updateDeviceStatus: (deviceId, status) =>
    set((state) => {
      const device = state.devices[deviceId];
      if (!device) return state;
      
      return {
        devices: {
          ...state.devices,
          [deviceId]: { ...device, status, lastSeen: new Date().toISOString() },
        },
      };
    }),

  updateDeviceOnline: (deviceId, online) =>
    set((state) => {
      const device = state.devices[deviceId];
      if (!device) return state;
      
      return {
        devices: {
          ...state.devices,
          [deviceId]: { ...device, online, lastSeen: new Date().toISOString() },
        },
      };
    }),

  setWsConnected: (connected) => set({ wsConnected: connected }),

  // Getters
  getDevice: (deviceId) => get().devices[deviceId],

  getDevicesByRoom: (roomId) =>
    Object.values(get().devices).filter((device) => device.roomId === roomId),

  getOnlineDevices: () =>
    Object.values(get().devices).filter((device) => device.online),

  getActiveDevices: () =>
    Object.values(get().devices).filter(
      (device) => device.status === DeviceStatus.ON && device.online
    ),
}));