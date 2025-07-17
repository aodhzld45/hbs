import api from '../api';
import { PageItem } from "../../types/Admin/PageItem";

/**
 * 페이지 전체 목록 조회 (관리자용)
 */
  export const fetchPageList = async (): Promise<PageItem[]> => {
    const response = await api.get('/page');
    return response.data;
  };


/**
 * 페이지 등록
 */
export const fetchPageCreate = async (
    formData: FormData,
    adminId: string
  ): Promise<number> => {
    const { data } = await api.post(`/page?adminId=${adminId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    return data;
};