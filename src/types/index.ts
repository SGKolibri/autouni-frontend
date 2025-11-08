// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  COORDINATOR = 'coordinator',
  TECHNICIAN = 'technician',
  VIEWER = 'viewer',
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Building Structure Types
export interface Building {
  id: string;
  name: string;
  description?: string;
  location: string;
  floors: Floor[];
  totalEnergy?: number;
  activeDevices?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  number: number;
  name: string;
  rooms: Room[];
  totalEnergy?: number;
  activeDevices?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  floorId: string;
  number: string;
  name: string;
  type: RoomType;
  capacity?: number;
  devices: Device[];
  totalEnergy?: number;
  occupied?: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum RoomType {
  CLASSROOM = 'classroom',
  LAB = 'lab',
  OFFICE = 'office',
  AUDITORIUM = 'auditorium',
  LIBRARY = 'library',
  OTHER = 'other',
}

// Device Types
export interface Device {
  id: string;
  roomId: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  mqttTopic?: string;
  metadata?: any; // JSON field from Prisma - pode conter brand, power, etc
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export enum DeviceType {
  LIGHT = 'LIGHT',
  AC = 'AC',
  PROJECTOR = 'PROJECTOR',
  SPEAKER = 'SPEAKER',
  LOCK = 'LOCK',
  SENSOR = 'SENSOR',
  OTHER = 'OTHER',
}

export enum DeviceStatus {
  ON = 'ON',
  OFF = 'OFF',
  STANDBY = 'STANDBY',
  ERROR = 'ERROR',
}

// Energy Monitoring Types
export interface EnergyReading {
  id: string;
  deviceId: string;
  valueWh: number; // Wh (watts-hour at moment)
  voltage?: number; // Volts (optional)
  current?: number; // Amperes (optional)
  timestamp: string;
}

export interface EnergyStats {
  totalEnergy: number; // kWh
  totalCost: number; // BRL
  peakDemand: number; // Watts
  averagePower: number; // Watts
  period: {
    start: string;
    end: string;
  };
  byDeviceType?: Record<DeviceType, number>;
  byRoom?: Record<string, number>;
}

// Automation Types
export interface Automation {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  triggerType: TriggerType;
  cron?: string; // Cron expression for SCHEDULE triggers
  condition?: string; // JSON condition for CONDITION triggers
  action: string; // JSON action
  creatorId?: string;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
}

export interface AutomationTrigger {
  type: TriggerType;
  schedule?: ScheduleConfig;
  condition?: ConditionConfig;
}

export enum TriggerType {
  SCHEDULE = 'schedule',
  CONDITION = 'condition',
  MANUAL = 'manual',
}

export interface ScheduleConfig {
  cron?: string;
  days?: number[]; // 0-6 (Sunday-Saturday)
  time: string; // HH:mm
}

export interface ConditionConfig {
  deviceId: string;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number | boolean;
}

export interface AutomationAction {
  deviceId: string;
  command: string;
  value?: string | number | boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

// Report Types
export interface Report {
  id: string;
  type: ReportType;
  title: string;
  format: ReportFormat;
  filters: ReportFilters;
  status: ReportStatus;
  fileUrl?: string;
  createdBy: string;
  createdAt: string;
}

export enum ReportType {
  ENERGY_CONSUMPTION = 'energy_consumption',
  DEVICE_STATUS = 'device_status',
  ROOM_USAGE = 'room_usage',
  INCIDENTS = 'incidents',
}

export enum ReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  XLSX = 'xlsx',
}

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  buildingIds?: string[];
  floorIds?: string[];
  roomIds?: string[];
  deviceTypes?: DeviceType[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// WebSocket Message Types
export interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: string;
}

export interface DeviceUpdateMessage {
  deviceId: string;
  status?: DeviceStatus;
  online?: boolean;
  intensity?: number;
  temperature?: number;
  energy?: EnergyReading;
}

// UI State Types
export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface DialogState {
  open: boolean;
  title?: string;
  content?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}