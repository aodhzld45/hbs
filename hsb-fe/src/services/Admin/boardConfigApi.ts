import api from '../api';
import { BoardConfigItem } from '../../types/Admin/BoardConfigItem';

export interface BoardConfigListResult {
  items: BoardConfigItem[];
  totalCount: number;
  totalPages: number;
}

export const fetchBoardConfigList = async (
  keyword = '',
  page = 0,
  size = 10,
  useTf?: string
): Promise<BoardConfigListResult> => {
  const params: Record<string, string | number> = { keyword, page, size };
  if (useTf) {
    params.useTf = useTf;
  }
  const { data } = await api.get('/admin/board-config/list', { params });
  return data;
};

export const fetchActiveBoardConfigOptions = async (): Promise<BoardConfigItem[]> => {
  const result = await fetchBoardConfigList('', 0, 100, 'Y');
  return (result.items ?? []).filter((item) => item.delTf !== 'Y');
};

export const fetchBoardConfigDetail = async (id: number): Promise<BoardConfigItem> => {
  const { data } = await api.get(`/admin/board-config/${id}`);
  return data;
};

export const fetchBoardConfigByCode = async (boardCode: string): Promise<BoardConfigItem> => {
  const { data } = await api.get(`/admin/board-config/code/${encodeURIComponent(boardCode)}`);
  return data;
};

export const createBoardConfig = async (payload: Partial<BoardConfigItem>, adminId: string): Promise<number> => {
  const { data } = await api.post('/admin/board-config', payload, { params: { adminId } });
  return data;
};

export const updateBoardConfig = async (id: number, payload: Partial<BoardConfigItem>, adminId: string): Promise<void> => {
  await api.put(`/admin/board-config/${id}`, payload, { params: { adminId } });
};

export const updateBoardConfigUseTf = async (id: number, useTf: 'Y' | 'N', adminId: string): Promise<void> => {
  await api.put(`/admin/board-config/${id}/use-tf`, null, { params: { useTf, adminId } });
};

export const deleteBoardConfig = async (id: number, adminId: string): Promise<void> => {
  await api.delete(`/admin/board-config/${id}`, { params: { adminId } });
};