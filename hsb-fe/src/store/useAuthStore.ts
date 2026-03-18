import { create } from 'zustand';
import { Admin } from '../types/Admin/Admin';
import api from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin?: Admin;
  login: (admin: Admin, token: string) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  admin: undefined,

  login: (adminData, token) => {
    localStorage.setItem('jwtToken', token);

    set({
      isAuthenticated: true,
      isLoading: false,
      admin: adminData,
    });
  },

  logout: async () => {
    try {
      await api.post('/admin/logout');
    } catch (error) {
      console.error('서버 로그아웃 실패:', error);
    } finally {
      localStorage.removeItem('jwtToken');

      set({
        isAuthenticated: false,
        isLoading: false,
        admin: undefined,
      });
    }
  },

  clearAuth: () => {
    localStorage.removeItem('jwtToken');

    set({
      isAuthenticated: false,
      isLoading: false,
      admin: undefined,
    });
  },

  checkSession: async () => {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      set({
        isAuthenticated: false,
        isLoading: false,
        admin: undefined,
      });
      return;
    }

    try {
      const response = await api.get('/admin/me');

      set({
        isAuthenticated: true,
        isLoading: false,
        admin: {
          id: response.data.adminId,
          name: response.data.name,
          email: response.data.email,
          groupId: response.data.groupId,
          isDeleted: false,
        },
      });
    } catch (error) {
      console.error('세션 체크 실패:', error);
      localStorage.removeItem('jwtToken');

      set({
        isAuthenticated: false,
        isLoading: false,
        admin: undefined,
      });
    }
  },
}));