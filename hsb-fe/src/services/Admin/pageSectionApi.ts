import api from "../api";

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