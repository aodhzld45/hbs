import api from '../api';
import { Admin } from '../../types/Admin/Admin';

// 관리자 상세 api 요청 
export const fetchAdminLogin = async (id: string, password: string): Promise<Admin> => {
    const response = await api.post(`/admin/login`, {id, password});
    return response.data;
  };

  export const fetchAdminAccounts = async (): Promise<Admin[]> => {
    const response = await api.get('/admin/accounts'); // 관리자 계정 목록을 반환하는 엔드포인트
    return response.data;
  };

// 관리자 등록
  export const registerAdmin = async (adminData: Admin): Promise<Admin> => {
    const response = await api.post('/admin/register', adminData);
    return response.data;
  };

// 관리자 수정
export const updateAdmin = async (adminData: Admin): Promise<Admin> => {
  const response = await api.put(`/admin/${adminData.id}`, adminData);
  return response.data;
};

// 접속 IP 가져오기  
  export const fetchGetIp = async (): Promise<string> => {
    const response = await api.get('/admin/login'); 
    return response.data.ip; 
  };
  
  
  