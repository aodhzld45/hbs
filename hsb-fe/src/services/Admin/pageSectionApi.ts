import api from "../api";
import { PageSectionItem } from "../../types/Admin/PageSectionItem";

// 페이지 섹션 목록
export const fetchPageSectonList = async (
  pageId: number,
  keyword: string = '',
  page: number,
  size: number
): Promise<{ items: PageSectionItem[]; totalCount: number; totalPages: number; }> => {
  const res = await api.get('/page-section', {
    params: {
      pageId,
      keyword,
      page,
      size,
    },
  });

  return res.data;
};

// 페이지 섹션 등록 API
export const fetchSectionCreate = async (formData: FormData): Promise<string> => {
    try {
      const res = await api.post('/page-section', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data; 
    } catch (error) {
      console.error('페이지 섹션 등록 실패:', error);
      throw error;
    }
  };

// 페이지 섹션 수정
export const fetchSectionUpdate = async (formData: FormData, sectionId: number) => {
  const res = await api.put(`/page-section/${sectionId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// 페이지 섹션 순서변경
export const updatePageSectionOrder = async (
  sectionOrders: { id: number; orderSeq: number }[]
): Promise<void> => {
  await api.put('/page-section/order', sectionOrders);
};

// 페이지 섹션 사용여부 변경
export const updatePageSectionUseTf = async (
  id: number,
  useTf: "Y" | "N",
  adminId: string
  ): Promise<number> => {
    const response = await api.patch(`/page-section/${id}/use-tf`, null, {
      params: {useTf, adminId}
    });
    return response.data;
  };

  /**
 * 페이지 섹션 삭제
 */
export const fetchDeletePageSection = async (
  id: number,
  adminId: string
): Promise<number> => {
 const response = await api.delete(`/page-section/${id}?adminId=${adminId}`);

 return response.data; 
};