import api from '../api';
import axios from 'axios';
import { Admin } from '../../types/Admin/Admin';

type ApiErr = Error & { status?: number; code?: string; field?: string };

function normErr(e: unknown): ApiErr {
  if (axios.isAxiosError(e)) {
    const status = e.response?.status;
    const data = e.response?.data;
    const msg = typeof data === 'string' ? data : (data?.message ?? e.message);
    const err: ApiErr = Object.assign(new Error(msg), { status });
    // 서버가 코드/필드 내려줄 경우 매핑(선택)
    if (data?.code) err.code = data.code;
    if (data?.field) err.field = data.field;
    return err;
  }
  return Object.assign(new Error('요청 중 오류가 발생했습니다.'), {});
}

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
export async function registerAdmin(newAdmin: Admin, actorId?: string): Promise<Admin> {

  const payload: Admin = {
    ...newAdmin,
    id: newAdmin.id.trim(),
    email: newAdmin.email?.trim().toLowerCase(),
  };

  try {
    const response = await api.post('/admin/register', payload, {
    params: { actorId }, // 쿼리로 전송
  });
    return response.data;
  } catch (e) {
    throw normErr(e);
  }
}

// 관리자 수정
export const updateAdmin = async (adminData: Admin, actorId?: string): Promise<Admin> => {
  const response = await api.put(`/admin/${adminData.id}`, adminData, {
    params: { actorId }, // 쿼리로 전송
  });
  return response.data;
};

// 관리자 삭제
export const deleteAdmin = async (id : string) => {
  const response = await api.delete(`/admin/${id}`);
  return response.data;
};

// 접속 IP 가져오기  
  export const fetchGetIp = async (): Promise<string> => {
    const response = await api.get('/admin/login'); 
    return response.data.ip; 
  };
  
  
  