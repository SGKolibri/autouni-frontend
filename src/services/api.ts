import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import {
  User,
  Building,
  BuildingStats,
  Floor,
  Room,
  Device,
  DeviceStatus,
  DeviceType,
  EnergyReading,
  EnergyStats,
  Automation,
  AutomationStats,
  AutomationHistory,
  Notification,
  Report,
  ReportType,
  ReportFormat,
  ReportStatus,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RoomType,
  TriggerType,
  NotificationType,
  DeviceControlResponse,
  DeviceStats,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - adiciona token JWT
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("accessToken");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - trata erros e refresh token
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Se erro 401 e não é tentativa de retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
              throw new Error("No refresh token");
            }

            // Tenta renovar o token
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { access_token } = response.data;
            localStorage.setItem("accessToken", access_token);

            // Refaz a requisição original com novo token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.api(originalRequest);
          } catch (refreshError) {
            // Se falhar, limpa tokens e redireciona para login
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // MÉTODOS HTTP BÁSICOS (mantidos para casos específicos)
  // ============================================================================
  
  public get<T>(url: string, config = {}) {
    return this.api.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config = {}) {
    return this.api.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: any, config = {}) {
    return this.api.put<T>(url, data, config);
  }

  public patch<T>(url: string, data?: any, config = {}) {
    return this.api.patch<T>(url, data, config);
  }

  public delete<T>(url: string, config = {}) {
    return this.api.delete<T>(url, config);
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  async login(credentials: LoginCredentials) {
    const response = await this.api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials) {
    const response = await this.api.post<User>("/auth/register", credentials);
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.api.post<{ access_token: string; refresh_token: string }>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data;
  }

  async logout() {
    const response = await this.api.post<{ message: string }>("/auth/logout");
    return response.data;
  }

  // ============================================================================
  // USERS
  // ============================================================================

  async getUsers() {
    const response = await this.api.get<User[]>("/users");
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.api.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(data: Partial<User> & { password: string }) {
    const response = await this.api.post<User>("/users", data);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>) {
    const response = await this.api.put<User>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.api.delete<User>(`/users/${id}`);
    return response.data;
  }

  // ============================================================================
  // BUILDINGS
  // ============================================================================

  async getBuildings() {
    const response = await this.api.get<Building[]>("/buildings");
    return response.data;
  }

  async getBuildingById(id: string) {
    const response = await this.api.get<Building>(`/buildings/${id}`);
    return response.data;
  }

  async getBuildingDetails(id: string) {
    const response = await this.api.get<Building>(`/buildings/${id}/details`);
    return response.data;
  }

  async getBuildingStats(id: string) {
    const response = await this.api.get<BuildingStats>(`/buildings/${id}/stats`);
    return response.data;
  }

  async createBuilding(data: Partial<Building>) {
    const response = await this.api.post<Building>("/buildings", data);
    return response.data;
  }

  async updateBuilding(id: string, data: Partial<Building>) {
    const response = await this.api.put<Building>(`/buildings/${id}`, data);
    return response.data;
  }

  async deleteBuilding(id: string) {
    const response = await this.api.delete<Building>(`/buildings/${id}`);
    return response.data;
  }

  // ============================================================================
  // FLOORS
  // ============================================================================

  async getFloors() {
    const response = await this.api.get<Floor[]>("/floors");
    return response.data;
  }

  async getFloorById(id: string) {
    const response = await this.api.get<Floor>(`/floors/${id}`);
    return response.data;
  }

  async getFloorDetails(id: string) {
    const response = await this.api.get<Floor>(`/floors/${id}/details`);
    return response.data;
  }

  async getFloorsByBuilding(buildingId: string) {
    const response = await this.api.get<Floor[]>(`/floors/building/${buildingId}`);
    return response.data;
  }

  async createFloor(data: Partial<Floor>) {
    const response = await this.api.post<Floor>("/floors", data);
    return response.data;
  }

  async updateFloor(id: string, data: Partial<Floor>) {
    const response = await this.api.put<Floor>(`/floors/${id}`, data);
    return response.data;
  }

  async deleteFloor(id: string) {
    const response = await this.api.delete<Floor>(`/floors/${id}`);
    return response.data;
  }

  // ============================================================================
  // ROOMS
  // ============================================================================

  async getRooms() {
    const response = await this.api.get<Room[]>("/rooms");
    return response.data;
  }

  async getRoomById(id: string) {
    const response = await this.api.get<Room>(`/rooms/${id}`);
    return response.data;
  }

  async getRoomDetails(id: string) {
    const response = await this.api.get<Room>(`/rooms/${id}/details`);
    return response.data;
  }

  async getRoomsByFloor(floorId: string) {
    const response = await this.api.get<Room[]>(`/rooms/floor/${floorId}`);
    return response.data;
  }

  async getRoomsByType(type: RoomType) {
    const response = await this.api.get<Room[]>(`/rooms/type/${type}`);
    return response.data;
  }

  async createRoom(data: Partial<Room>) {
    const response = await this.api.post<Room>("/rooms", data);
    return response.data;
  }

  async updateRoom(id: string, data: Partial<Room>) {
    const response = await this.api.put<Room>(`/rooms/${id}`, data);
    return response.data;
  }

  async deleteRoom(id: string) {
    const response = await this.api.delete<Room>(`/rooms/${id}`);
    return response.data;
  }

  // ============================================================================
  // DEVICES
  // ============================================================================

  async getDevices() {
    const response = await this.api.get<Device[]>("/devices");
    return response.data;
  }

  async getDeviceStats() {
    const response = await this.api.get<DeviceStats>("/devices/stats");
    return response.data;
  }

  async getDeviceById(id: string) {
    const response = await this.api.get<Device>(`/devices/${id}`);
    return response.data;
  }

  async getDevicesByRoom(roomId: string) {
    const response = await this.api.get<Device[]>(`/devices/room/${roomId}`);
    return response.data;
  }

  async getDevicesByStatus(status: DeviceStatus) {
    const response = await this.api.get<Device[]>(`/devices/status/${status}`);
    return response.data;
  }

  async createDevice(data: Partial<Device>) {
    const response = await this.api.post<Device>("/devices", data);
    return response.data;
  }

  async updateDevice(id: string, data: Partial<Device>) {
    const response = await this.api.put<Device>(`/devices/${id}`, data);
    return response.data;
  }

  async updateDeviceStatus(id: string, status: DeviceStatus) {
    const response = await this.api.put<Device>(`/devices/${id}/status`, { status });
    return response.data;
  }

  async updateDeviceOnline(id: string, online: boolean) {
    const response = await this.api.put<Device>(`/devices/${id}/online`, { online });
    return response.data;
  }

  async controlDevice(id: string, command: string, value?: any) {
    const response = await this.api.post<DeviceControlResponse>(
      `/devices/${id}/control`,
      { command, value }
    );
    return response.data;
  }

  async deleteDevice(id: string) {
    await this.api.delete(`/devices/${id}`);
  }

  // ============================================================================
  // ENERGY
  // ============================================================================

  async createEnergyReading(data: Partial<EnergyReading>) {
    const response = await this.api.post<EnergyReading>("/energy/readings", data);
    return response.data;
  }

  async getDeviceEnergyReadings(
    deviceId: string,
    params?: { from?: string; to?: string; limit?: number }
  ) {
    const response = await this.api.get<EnergyReading[]>(
      `/energy/devices/${deviceId}/readings`,
      { params }
    );
    return response.data;
  }

  async getDeviceEnergyStats(
    deviceId: string,
    params?: { from?: string; to?: string }
  ) {
    const response = await this.api.get<EnergyStats>(
      `/energy/devices/${deviceId}/stats`,
      { params }
    );
    return response.data;
  }

  async getRoomEnergyReadings(
    roomId: string,
    params?: { from?: string; to?: string; limit?: number }
  ) {
    const response = await this.api.get<EnergyReading[]>(
      `/energy/rooms/${roomId}/readings`,
      { params }
    );
    return response.data;
  }

  async getRoomEnergyStats(
    roomId: string,
    params?: { from?: string; to?: string }
  ) {
    const response = await this.api.get<EnergyStats>(
      `/energy/rooms/${roomId}/stats`,
      { params }
    );
    return response.data;
  }

  async getFloorEnergyStats(
    floorId: string,
    params?: { from?: string; to?: string }
  ) {
    const response = await this.api.get<EnergyStats>(
      `/energy/floors/${floorId}/stats`,
      { params }
    );
    return response.data;
  }

  async getBuildingEnergyStats(
    buildingId: string,
    params?: { from?: string; to?: string }
  ) {
    const response = await this.api.get<EnergyStats>(
      `/energy/buildings/${buildingId}/stats`,
      { params }
    );
    return response.data;
  }

  async cleanupEnergyReadings(olderThan: string) {
    const response = await this.api.delete<{ message: string; deleted: number }>(
      "/energy/readings/cleanup",
      { data: { olderThan } }
    );
    return response.data;
  }

  // ============================================================================
  // AUTOMATIONS
  // ============================================================================

  async getAutomations() {
    const response = await this.api.get<Automation[]>("/automations");
    return response.data;
  }

  async getAutomationStats() {
    const response = await this.api.get<AutomationStats>("/automations/stats");
    return response.data;
  }

  async getEnabledAutomations() {
    const response = await this.api.get<Automation[]>("/automations/enabled");
    return response.data;
  }

  async getAutomationsByCreator(creatorId: string) {
    const response = await this.api.get<Automation[]>(`/automations/creator/${creatorId}`);
    return response.data;
  }

  async getAutomationById(id: string) {
    const response = await this.api.get<Automation>(`/automations/${id}`);
    return response.data;
  }

  async getAutomationHistory(id: string, limit?: number) {
    const response = await this.api.get<AutomationHistory[]>(
      `/automations/${id}/history`,
      { params: { limit } }
    );
    return response.data;
  }

  async createAutomation(data: Partial<Automation>) {
    const response = await this.api.post<Automation>("/automations", data);
    return response.data;
  }

  async updateAutomation(id: string, data: Partial<Automation>) {
    const response = await this.api.put<Automation>(`/automations/${id}`, data);
    return response.data;
  }

  async toggleAutomation(id: string, enabled: boolean) {
    const response = await this.api.patch<Automation>(`/automations/${id}/toggle`, {
      enabled,
    });
    return response.data;
  }

  async executeAutomation(id: string) {
    const response = await this.api.post<{
      success: boolean;
      message: string;
      executedAt: string;
    }>(`/automations/${id}/execute`);
    return response.data;
  }

  async deleteAutomation(id: string) {
    await this.api.delete(`/automations/${id}`);
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  async getNotifications() {
    const response = await this.api.get<Notification[]>("/notifications");
    return response.data;
  }

  async getMyNotifications() {
    const response = await this.api.get<Notification[]>("/notifications/me");
    return response.data;
  }

  async getUnreadNotifications() {
    const response = await this.api.get<Notification[]>("/notifications/me/unread");
    return response.data;
  }

  async getUserNotifications(userId: string) {
    const response = await this.api.get<Notification[]>(`/notifications/user/${userId}`);
    return response.data;
  }

  async getNotificationById(id: string) {
    const response = await this.api.get<Notification>(`/notifications/${id}`);
    return response.data;
  }

  async createNotification(data: Partial<Notification>) {
    const response = await this.api.post<Notification>("/notifications", data);
    return response.data;
  }

  async markNotificationAsRead(id: string) {
    const response = await this.api.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.api.patch<{ message: string; updated: number }>(
      "/notifications/me/read-all"
    );
    return response.data;
  }

  async deleteNotification(id: string) {
    const response = await this.api.delete<{ message: string }>(`/notifications/${id}`);
    return response.data;
  }

  // ============================================================================
  // REPORTS
  // ============================================================================

  async getReports() {
    const response = await this.api.get<Report[]>("/reports");
    return response.data;
  }

  async getMyReports() {
    const response = await this.api.get<Report[]>("/reports/me");
    return response.data;
  }

  async getReportsByType(type: ReportType) {
    const response = await this.api.get<Report[]>(`/reports/type/${type}`);
    return response.data;
  }

  async getReportsByStatus(status: ReportStatus) {
    const response = await this.api.get<Report[]>(`/reports/status/${status}`);
    return response.data;
  }

  async getReportsByCreator(creatorId: string) {
    const response = await this.api.get<Report[]>(`/reports/creator/${creatorId}`);
    return response.data;
  }

  async getReportById(id: string) {
    const response = await this.api.get<Report>(`/reports/${id}`);
    return response.data;
  }

  async createReport(data: Partial<Report>) {
    const response = await this.api.post<Report>("/reports", data);
    return response.data;
  }

  async updateReport(id: string, data: Partial<Report>) {
    const response = await this.api.put<Report>(`/reports/${id}`, data);
    return response.data;
  }

  async updateReportStatus(id: string, status: ReportStatus, fileUrl?: string) {
    const response = await this.api.patch<Report>(`/reports/${id}/status`, {
      status,
      fileUrl,
    });
    return response.data;
  }

  async deleteReport(id: string) {
    const response = await this.api.delete<{ message: string }>(`/reports/${id}`);
    return response.data;
  }

  // ============================================================================
  // FILE UPLOAD
  // ============================================================================

  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ) {
    const formData = new FormData();
    formData.append("file", file);

    return this.api.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  }
}

export const apiService = new ApiService();
export default apiService;
