import api from '../api';
import { Admin } from '../../types/Admin/Admin';

// hbs 상세 api 요청 
export const fetchAdminLogin = async (id: string, password: string): Promise<Admin> => {
    const response = await api.post(`/admin/login`, {id, password});
    return response.data;
  };

  export const fetchAdminAccounts = async (): Promise<Admin[]> => {
    const response = await api.get('/admin/accounts'); // 관리자 계정 목록을 반환하는 엔드포인트
    return response.data;
  };

  export const registerAdmin = async (adminData: Admin): Promise<Admin> => {
    const response = await api.post('/admin/register', adminData);
    return response.data;
  };