import api from '../api';
import { PageItem } from "../../types/Admin/PageItem";

/**
 * URL 기준으로 페이지 정보 조회 (예: '/about' → Page ID)
 */
export const fetchPageByUrl = async (url: string): Promise<PageItem> => {
  const response = await api.get('/page/by-url', {
    params: { url }
  });
  return response.data;
};

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

/**
 * 페이지 수정
 */
export const fetchPageUpdate = async (
  id : number,
  formData: FormData,
  adminId: string
): Promise<number> => {
  const { data } = await api.put(`/page/${id}?adminId=${adminId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  return data;
};

/** 
 * 사용여부 변경
 */
export const updatePageUseTf = async (
  id: number,
  useTf: "Y" | "N",
  adminId: string
): Promise<number> => {
  const response = await api.put(`/page/${id}/use-tf`, null, {
    params: { useTf, adminId }
  });
  return response.data; 
};

/**
 * 페이지 삭제
 */
export const fetchDeletePage = async (
  id: number,
  adminId: string
): Promise<number> => {
 const response = await api.delete(`/page/${id}?adminId=${adminId}`);

 return response.data; 
};