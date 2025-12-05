import api, { handleApiResponse } from './api';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../types';

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return handleApiResponse<AuthResponse>(response);
  },

  // Registro
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return handleApiResponse<AuthResponse>(response);
  },

  // Obtener perfil
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    const data = handleApiResponse<{ usuario: User; estadisticas: any }>(response);
    return data.usuario;
  },

  // Actualizar perfil
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/users/profile', userData);
    return handleApiResponse<User>(response);
  },

  // Cambiar contraseña
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword,
    });
    return handleApiResponse<void>(response);
  },

  // Solicitar recuperación de contraseña
  forgotPassword: async (email: string): Promise<void> => {
    const response = await api.post('/auth/forgot-password', { email });
    return handleApiResponse<void>(response);
  },

  // Resetear contraseña
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const response = await api.put(`/auth/reset-password/${token}`, {
      newPassword,
    });
    return handleApiResponse<void>(response);
  },

  // Verificar email (legacy con token)
  verifyEmail: async (token: string): Promise<void> => {
    const response = await api.post('/auth/verify-email', { token });
    return handleApiResponse<void>(response);
  },

  // Verificar email con código
  verifyEmailWithCode: async (email: string, codigo: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/verificar-codigo', { email, codigo });
    return handleApiResponse<AuthResponse>(response);
  },

  // Reenviar código de verificación
  resendVerificationCode: async (email: string): Promise<void> => {
    const response = await api.post('/auth/reenviar-codigo', { email });
    return handleApiResponse<void>(response);
  },

  // Reenviar email de verificación (legacy)
  resendVerificationEmail: async (): Promise<void> => {
    const response = await api.post('/auth/resend-verification');
    return handleApiResponse<void>(response);
  },

  // Logout
  logout: async (): Promise<void> => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('auth-storage');
    return handleApiResponse<void>(response);
  },

  // Subir avatar
  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return handleApiResponse<User>(response);
  },

  // Subir banner (para comerciantes)
  uploadBanner: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('banner', file);
    
    const response = await api.post('/users/banner', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return handleApiResponse<User>(response);
  },

  // Eliminar cuenta
  deleteAccount: async (password: string): Promise<void> => {
    const response = await api.delete('/users/account', {
      data: { password },
    });
    return handleApiResponse<void>(response);
  },
}; 