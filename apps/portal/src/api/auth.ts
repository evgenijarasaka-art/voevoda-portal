import apiClient from './client';
import { useAuthStore } from '../store/authStore';

export interface LoginData {
  login: string;
  password: string;
}

export interface RegisterData {
  login: string;
  password: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
}

export interface VerifyData {
  code: string;
  phone: string;
}

export const authApi = {
  login: async (data: LoginData) => {
    const response = await apiClient.post('/auth/login/', data);
    return response.data;
  },
  
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register/', data);
    return response.data;
  },
  
  verify: async (data: VerifyData) => {
    const response = await apiClient.post('/auth/verify/', data);
    return response.data;
  },
  
  logout: async () => {
    try {
      await apiClient.post('/auth/logout/');
    } finally {
      useAuthStore.getState().logout();
    }
  },
  
  getMe: async () => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },
  
  updateProfile: async (data: FormData) => {
    const response = await apiClient.patch('/auth/profile/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
