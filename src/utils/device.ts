import { Building, Device, DeviceStats, DeviceStatus, DeviceType, Floor, Room } from '@/types';

const DEVICE_STATUS_VALUES = new Set(Object.values(DeviceStatus));
const DEVICE_TYPE_VALUES = new Set(Object.values(DeviceType));

export const normalizeDeviceStatus = (status?: string | DeviceStatus): DeviceStatus => {
  if (!status) return DeviceStatus.OFF;

  const normalized = status.toString().trim().toUpperCase();

  if (DEVICE_STATUS_VALUES.has(normalized as DeviceStatus)) {
    return normalized as DeviceStatus;
  }

  return DeviceStatus.OFF;
};

export const normalizeDeviceType = (type?: string | DeviceType): DeviceType => {
  if (!type) return DeviceType.OTHER;

  const normalized = type.toString().trim().toUpperCase();

  if (DEVICE_TYPE_VALUES.has(normalized as DeviceType)) {
    return normalized as DeviceType;
  }

  return DeviceType.OTHER;
};

export const normalizeDevice = (device: Device): Device => ({
  ...device,
  status: normalizeDeviceStatus(device.status),
  type: normalizeDeviceType(device.type),
});

export const normalizeRoom = (room: Room): Room => ({
  ...room,
  devices: room.devices?.map(normalizeDevice),
});

const countActiveDevicesInRooms = (rooms?: Room[]) =>
  rooms?.reduce((total, room) => total + (room.devices?.filter((device) => normalizeDeviceStatus(device.status) === DeviceStatus.ON).length || 0), 0) || 0;

const hasNestedDeviceData = (rooms?: Room[]) =>
  rooms?.some((room) => Array.isArray(room.devices)) ?? false;

export const normalizeFloor = (floor: Floor): Floor => ({
  ...floor,
  rooms: floor.rooms?.map(normalizeRoom),
  activeDevices: hasNestedDeviceData(floor.rooms) ? countActiveDevicesInRooms(floor.rooms) : floor.activeDevices,
});

export const normalizeBuilding = (building: Building): Building => ({
  ...building,
  floors: building.floors?.map(normalizeFloor),
  activeDevices: building.floors && building.floors.some((floor) => hasNestedDeviceData(floor.rooms))
    ? building.floors.reduce((total, floor) => total + countActiveDevicesInRooms(floor.rooms), 0)
    : building.activeDevices,
});

export const buildDeviceStats = (devices: Device[]): DeviceStats => {
  const normalizedDevices = devices.map(normalizeDevice);

  const byStatus: Record<DeviceStatus, number> = {
    [DeviceStatus.ON]: 0,
    [DeviceStatus.OFF]: 0,
    [DeviceStatus.STANDBY]: 0,
    [DeviceStatus.ERROR]: 0,
  };

  const byType: Record<DeviceType, number> = {
    [DeviceType.LIGHT]: 0,
    [DeviceType.AC]: 0,
    [DeviceType.PROJECTOR]: 0,
    [DeviceType.SPEAKER]: 0,
    [DeviceType.LOCK]: 0,
    [DeviceType.SENSOR]: 0,
    [DeviceType.OTHER]: 0,
  };

  normalizedDevices.forEach((device) => {
    byStatus[device.status] += 1;
    byType[device.type] += 1;
  });

  return {
    activeDevices: byStatus[DeviceStatus.ON],
    totalDevices: normalizedDevices.length,
    byStatus,
    byType,
  };
};
