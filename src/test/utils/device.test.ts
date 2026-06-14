import { describe, expect, it } from 'vitest';
import { DeviceStatus, DeviceType, RoomType } from '@/types';
import { buildDeviceStats, normalizeBuilding, normalizeDeviceStatus } from '@utils/device';

describe('device utils', () => {
  it('normalizes lowercase device status values', () => {
    expect(normalizeDeviceStatus('on')).toBe(DeviceStatus.ON);
    expect(normalizeDeviceStatus('off')).toBe(DeviceStatus.OFF);
  });

  it('builds stats from normalized devices', () => {
    const stats = buildDeviceStats([
      {
        id: 'd1',
        name: 'Light',
        type: 'light' as DeviceType,
        status: 'on' as DeviceStatus,
        roomId: 'r1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'd2',
        name: 'Sensor',
        type: DeviceType.SENSOR,
        status: DeviceStatus.OFF,
        roomId: 'r1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    expect(stats.totalDevices).toBe(2);
    expect(stats.activeDevices).toBe(1);
    expect(stats.byStatus?.[DeviceStatus.ON]).toBe(1);
    expect(stats.byStatus?.[DeviceStatus.OFF]).toBe(1);
  });

  it('derives active devices on nested building data', () => {
    const building = normalizeBuilding({
      id: 'b1',
      name: 'Main',
      location: 'Campus',
      activeDevices: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      floors: [
        {
          id: 'f1',
          buildingId: 'b1',
          number: 1,
          name: '1st',
          activeDevices: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rooms: [
            {
              id: 'r1',
              floorId: 'f1',
              number: '101',
              name: 'Room 101',
              type: RoomType.CLASSROOM,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              devices: [
                {
                  id: 'd1',
                  name: 'Light',
                  type: DeviceType.LIGHT,
                  status: 'on' as DeviceStatus,
                  roomId: 'r1',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            },
          ],
        },
      ],
    });

    expect(building.activeDevices).toBe(1);
    expect(building.floors?.[0].activeDevices).toBe(1);
  });
});
