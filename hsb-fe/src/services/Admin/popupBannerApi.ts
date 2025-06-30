import api from '../api';
import { PopupBannerItem } from '../../types/Admin/PopupBannerItem';

/**
 * 전체 목록 조회 (관리자용)
 */
export const fetchPopupBannerList = async (
    type: string,
    keyword: string = '',
    page: number,
    size: number
  ): Promise<{items: PopupBannerItem[]; totalCount: number; totalPages: number;}> => {
    const { data } = await api.get('/popup-banner/list', {
      params: {
        type,
        keyword,
        page,
        size,
      },
    });
    return data;
  };

/**
 * 노출용 배너/팝업 목록 조회 (메인화면용)
 */
export const fetchVisiblePopupBanners = async (): Promise<PopupBannerItem[]> => {
  const { data } = await api.get('/popup-banner/visible');
  return data;
};

/**
 * 배너 등록
 */
export const fetchPopupBannerCreate = async (
  formData: FormData,
  adminId: string
): Promise<number> => {
  const { data } = await api.post(`/popup-banner?adminId=${adminId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

/**
 * 배너 수정
 */
export const fetchPopupBannerUpdate = async (
  id: number,
  formData: FormData,
  adminId: string
): Promise<void> => {
  await api.put(`/popup-banner/${id}?adminId=${adminId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 순서 변경
 */
export const fetchPopupBannerOrder = async (
  id: number,
  direction: "up" | "down",
  adminId: string
): Promise<void> => {
  await api.put(
    `/popup-banner/${id}/order`,
    null,
    {
      params: {
        direction,
        adminId,
      },
    }
  );
};


/** 
 * 사용여부 변경
 */
export const updatePopupBannerUseTf = async (
  id: number,
  useTf: "Y" | "N",
  adminId: string
): Promise<void> => {
  await api.put(`/popup-banner/${id}/use-tf`, null, {
    params: { useTf, adminId }
  });
};

/**
 * 배너 삭제
 */
export const fetchPopupBannerDelete = async (
  id: number,
  adminId: string
): Promise<void> => {
  await api.delete(`/popup-banner/${id}?adminId=${adminId}`);
};
