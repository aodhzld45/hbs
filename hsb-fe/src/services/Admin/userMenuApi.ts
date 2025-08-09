import { UserMenuNode } from '../../types/Admin/UserMenuNode';
import api from '../api';


// 사용자 메뉴 트리 조회
export const fetchUserMenuTree = async (): Promise<UserMenuNode[]> => {
    const res = await api.get<UserMenuNode[]>('/user-menus/tree');
    return res.data;
};

export const fetchUserMenuCreate = async (form: any, adminId: string) => {
    const res = await api.post('/user-menus', form, {
      params: { adminId },
    });
    return res.data;
};

export const fetchUserMenuOrder = async (id: number, newOrder: number) => {
  const res = await api.patch(`/user-menus/${id}/order`, {orderSequence : newOrder})
  return res.data;
};

export const fetchUserMenuUpdate = async (id: number, form: any, adminId: string) => {
    const res = await api.put(`/user-menus/${id}`, form, {
      params: { adminId },
    });
    return res.data;
};
  
export const fetchUserMenuDelete = async (id: number, adminId: string) => {
    const res = await api.delete(`/user-menus/${id}`, {
      params: { adminId },
    });
    return res.data;
};

// 배포 확인용 ㅎㅎ
export const fetchUserMenuDeployCheck = async () => {
  const res = await api.get('/user-menus/_deploy-check');
  return res.data; // { service, status, time }
};