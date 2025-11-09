import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@store/authStore';
import apiService from '@services/api';
import { LoginCredentials, User } from '@/types';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login: loginStore, logout: logoutStore } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await apiService.login(credentials);
    },
    onSuccess: (data) => {
      loginStore(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      navigate('/');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiService.logout();
    },
    onSuccess: () => {
      logoutStore();
      navigate('/login');
    },
    onError: () => {
      // Logout locally even if API call fails
      logoutStore();
      navigate('/login');
    },
  });

  const login = (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  };
};