// src/services/Admin/adminApi.ts
import api from '../api';
import { AdminMenu } from '../../types/Admin/AdminMenu';

export const fetchAdminMenus = async (): Promise<AdminMenu[]> => {
  const response = await api.get('/admin/menus');
  return response.data;
};

export const createAdminMenu = async (menu: AdminMenu): Promise<AdminMenu> => {
  const response = await api.post('/admin/menus', menu);
  return response.data;
};

export const updateAdminMenu = async (id: number, menu: AdminMenu): Promise<AdminMenu> => {
  const response = await api.put(`/admin/menus/${id}`, menu);
  return response.data;
};

export const deleteAdminMenu = async (id: number): Promise<void> => {
  await api.delete(`/admin/menus/${id}`);
};
