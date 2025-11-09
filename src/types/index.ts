// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  cpf?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  COORDINATOR = 'COORDINATOR',
  TECHNICIAN = 'TECHNICIAN',
  VIEWER = 'VIEWER',
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  cpf: string;
  role?: UserRole;
}

// Building Structure Types
export interface Building {
  id: string;
  name: string;
  description?: string;
  location: string;
  floors?: Floor[];
  totalEnergy?: number;
  activeDevices?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BuildingStats {
  totalFloors: number;
  totalRooms: number;
  totalDevices: number;
  totalEnergy: number;
  activeDevices: number;
}

export interface Floor {
  id: string;
  buildingId: string;
  number: number;
  name: string;
  rooms?: Room[];
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
  devices?: Device[];
  totalEnergy?: number;
  occupied?: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum RoomType {
  CLASSROOM = 'CLASSROOM',
  LAB = 'LAB',
  OFFICE = 'OFFICE',
  AUDITORIUM = 'AUDITORIUM',
  LIBRARY = 'LIBRARY',
  OTHER = 'OTHER',
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
  totalCost?: number; // BRL
  peakDemand?: number; // Watts
  averagePower?: number; // Watts
  period?: {
    start: string;
    end: string;
  };
  byDeviceType?: Record<DeviceType, number>;
  byRoom?: Record<string, number>;
  totalKwh?: number; // Alias for totalEnergy
  trend?: number;
  history?: Array<{ timestamp: string; value: number }>;
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

export interface AutomationStats {
  total: number;
  enabled: number;
  disabled: number;
  byType: {
    SCHEDULE: number;
    CONDITION: number;
    MANUAL: number;
  };
  recentExecutions: number;
}

export interface AutomationHistory {
  id: string;
  automationId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  executedAt: string;
  result?: string;
  error?: string;
}

export interface AutomationTrigger {
  type: TriggerType;
  schedule?: ScheduleConfig;
  condition?: ConditionConfig;
}

export enum TriggerType {
  SCHEDULE = 'SCHEDULE',
  CONDITION = 'CONDITION',
  MANUAL = 'MANUAL',
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
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
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
  updatedAt: string;
}

export enum ReportType {
  ENERGY_CONSUMPTION = 'ENERGY_CONSUMPTION',
  DEVICE_STATUS = 'DEVICE_STATUS',
  ROOM_USAGE = 'ROOM_USAGE',
  INCIDENTS = 'INCIDENTS',
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  XLSX = 'XLSX',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
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

export interface EnergyComparisonItem {
  id: string;
  name: string;
  energy: number;
  trend: number;
}

export interface DeviceStats {
  activeDevices: number;
  totalDevices: number;
  byType?: Record<DeviceType, number>;
  byStatus?: Record<DeviceStatus, number>;
}

export interface DeviceControlResponse {
  status: DeviceStatus;
  message?: string;
}

export interface BulkDeviceControlResponse {
  success: boolean;
  affectedDevices: number;
  failedDevices?: string[];
}

// Health & API Info
export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

export interface ApiWelcomeResponse {
  message: string;
}