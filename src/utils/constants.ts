// API URLs
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

// App Configuration
export const APP_NAME = 'AutoUni';
export const APP_VERSION = '1.0.0';

// Energy Tariff (R$ per kWh)
export const ENERGY_TARIFF = 0.85;

// Pagination
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Date Formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

// WebSocket Events
export const WS_EVENTS = {
  DEVICE_UPDATE: 'device:update',
  DEVICE_STATUS: 'device:status',
  DEVICE_ONLINE: 'device:online',
  ENERGY_ALERT: 'energy:alert',
  NOTIFICATION: 'notification',
} as const;

// Device Types
export const DEVICE_TYPE_LABELS = {
  light: 'Iluminação',
  ac: 'Ar Condicionado',
  projector: 'Projetor',
  speaker: 'Alto-falante',
  sensor: 'Sensor',
  lock: 'Trava',
  other: 'Outro',
} as const;

// Device Status
export const DEVICE_STATUS_LABELS = {
  on: 'Ligado',
  off: 'Desligado',
  standby: 'Standby',
  error: 'Erro',
} as const;

// Room Types
export const ROOM_TYPE_LABELS = {
  classroom: 'Sala de Aula',
  lab: 'Laboratório',
  office: 'Escritório',
  auditorium: 'Auditório',
  library: 'Biblioteca',
  other: 'Outro',
} as const;

// User Roles
export const USER_ROLE_LABELS = {
  admin: 'Administrador',
  coordinator: 'Coordenador',
  technician: 'Técnico',
  viewer: 'Visualizador',
} as const;

// Report Types
export const REPORT_TYPE_LABELS = {
  energy_consumption: 'Consumo Energético',
  device_status: 'Status dos Dispositivos',
  room_usage: 'Uso de Salas',
  incidents: 'Incidentes',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
} as const;

// Chart Colors
export const CHART_COLORS = {
  primary: '#1976D2',
  secondary: '#388E3C',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#D32F2F',
  info: '#0288D1',
  purple: '#7B1FA2',
  orange: '#FF5722',
} as const;

// Notification Types
export const NOTIFICATION_TYPE_COLORS = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  success: 'success',
} as const;

// Max file sizes (in bytes)
export const MAX_FILE_SIZE = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  REPORT: 10 * 1024 * 1024, // 10MB
} as const;