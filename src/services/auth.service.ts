import apiService from './api';
import { User, LoginCredentials, LoginResponse, RegisterCredentials } from '@/types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return await apiService.login(credentials);
  }

  async logout(): Promise<void> {
    await apiService.logout();
  }

  async register(data: RegisterCredentials): Promise<User> {
    return await apiService.register(data);
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    return await apiService.refreshToken(refreshToken);
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>('/auth/me');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await apiService.post('/auth/verify-email', { token });
  }
}

export const authService = new AuthService();
export default authService;