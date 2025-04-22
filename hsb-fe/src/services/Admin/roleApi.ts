import api from '../api';
import { RoleGroup } from '../../types/Admin/RoleGroup'

// 관리자 권한 그룹 목록 조회
export const fetchRoleGroups = async (): Promise<RoleGroup[]> => {
    const response = await api.get('/admin/roles');
    return response.data;
};

// 관리자 권한 그룹 등록
export const createRoleGroup = async (data: Omit<RoleGroup, 'id'>): Promise<RoleGroup> => {
    const response = await api.post('/admin/roles', data);
    return response.data;
};

// 관리자 권한 그룹 수정
export const updateRoleGroup = async (
    id: number,
    data: Omit<RoleGroup, 'id'>
  ): Promise<RoleGroup> => {
    const response = await api.put(`/admin/roles/${id}`, data);
    return response.data;
  };

// 관리자 권한 그룹 삭제
export const softDeleteRoleGroup = async (id: number): Promise<void> => {
    await api.put(`/admin/roles/${id}/delete`);
  };
