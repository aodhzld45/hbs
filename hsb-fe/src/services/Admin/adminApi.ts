import api from '../api';
import { Admin } from '../../types/Admin/Admin';

// hbs 상세 api 요청 
export const fetchAdminLogin = async (id: string, password: string): Promise<Admin> => {
    const response = await api.post(`/admin/login`, {id, password});
    return response.data;
  };