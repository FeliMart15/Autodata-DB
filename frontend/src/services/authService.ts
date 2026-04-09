import apiClient from './api';
import { LoginRequest, LoginResponse, User } from '@/types/index';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<any>('/auth/login', credentials);
    // El backend devuelve { success, message, token, refreshToken, user }
    
    // Guardar refresh token
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return {
      token: response.data.token,
      user: response.data.user
    };
  },

  logout: async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Continuar con logout local incluso si falla el backend
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<any>('/auth/me');
    // El backend devuelve { success, data }
    return response.data.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password', { oldPassword, newPassword });
    // Limpiar tokens ya que el backend revoca todos los refresh tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<any>('/auth/refresh', { refreshToken });
    
    // Guardar nuevos tokens
    const newToken = response.data.token;
    const newRefreshToken = response.data.refreshToken;
    
    localStorage.setItem('token', newToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return newToken;
  },
};
