import api from '../api';
import { RoleGroup, MenuPermission, RoleMenuResponse } from '../../types/Admin/RoleGroup'

/*
    권한 그룹 관련 API
*/

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

/*
    메뉴 권한 매핑 관련 API
*/

// 전체 메뉴 목록 조회
export const fetchMenus = async (): Promise<{ id: number; name: string }[]> => {
    const response = await api.get('/admin/menus');
    return response.data;
};

// 특정 권한 그룹의 메뉴 권한 조회
export const fetchRoleMenus = async (roleId: number): Promise<RoleMenuResponse> => {
    const response = await api.get(`/admin/roles/${roleId}/menus`);
    return response.data;
};

// 특정 권한 그룹의 메뉴 권한 저장
export const saveRoleMenus = async (
    roleId: number,
    menuPermissions: MenuPermission[]
  ): Promise<void> => {
    await api.put(`/admin/roles/${roleId}/menus`, { menuPermissions });
};
