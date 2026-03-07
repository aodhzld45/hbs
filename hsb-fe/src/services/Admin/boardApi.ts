import api from '../api';
import { BoardItem } from '../../types/Admin/BoardItem';

export const fetchBoardList = async (
  boardCode: string,
  keyword = '',
  page: number,
  size: number,
  useTf?: string
): Promise<{ items: BoardItem[]; notices: BoardItem[]; totalCount: number; totalPages: number }> => {
  const params: Record<string, string | number> = { boardCode, keyword, page, size };
  if (useTf) {
    params.useTf = useTf;
  }
  const res = await api.get('/board/board-list', { params });
  return res.data;
};

export const fetchBoardDetail = async (id: number): Promise<BoardItem> => {
  const res = await api.get('/board/board-detail', { params: { id } });
  return res.data;
};

export const fetchBoardCreate = async (formData: FormData): Promise<string> => {
  const res = await api.post('/board/board-create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const fetchBoardUpdate = async (formData: FormData, id: number): Promise<string> => {
  const res = await api.put(`/board/board-update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const fetchBoardDelete = async (id: number): Promise<void> => {
  await api.put(`/board/board-delete/${id}`);
};

export const updateBoardUseTf = async (
  id: number,
  useTf: 'Y' | 'N',
  adminId: string
): Promise<number> => {
  const response = await api.put(`/board/use-tf/${id}`, null, {
    params: { useTf, adminId },
  });
  return response.data;
};

export const fetchExcelDownload = async (boardCode: string, keyword = '') => {
  return api.get('/board/export', {
    params: { boardCode, keyword },
    responseType: 'blob',
  });
};
