import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    console.log("🌐 API Base URL:", API_BASE_URL);
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

            const { accessToken } = response.data;
            localStorage.setItem("accessToken", accessToken);

            // Refaz a requisição original com novo token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.api(originalRequest);
          } catch (refreshError) {
            // Se falhar, limpa tokens e redireciona para login
            console.error("❌ Refresh token falhou, redirecionando para /login:", refreshError);
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

  // Métodos HTTP básicos
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

  // Método para upload de arquivos
  public uploadFile<T>(
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
