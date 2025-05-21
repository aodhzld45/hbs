import api from '../api';
import {BoardItem, BoardType} from '../../types/Admin/BoardItem'


// 게시글 조회 API
export const fetchBoardList = async (
    type: BoardType,
    keyword: string = '',
    page: number,
    size: number
    
  ): Promise<{ items: BoardItem[]; totalCount: number; totalPages: number; }> => {
    try {
      const res = await api.get('/board/board-list', {
        params: { type, keyword, page, size },
      });
      return res.data;
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      throw error;
    }
  };

// 게시글 상세 API
export const fetchBoardDetail = async (id: number): Promise<BoardItem> => {
  const res = await api.get('/board/board-detail', { params: { id } });
  return res.data;
};

// 게시글 등록 API
export const fetchBoardCreate = async (formData: FormData): Promise<string> => {
  try {
    const res = await api.post('/board/board-create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data; // 반드시 문자열 반환
  } catch (error) {
    console.error('게시글 등록 실패:', error);
    throw error;
  }
};

// 게시글 수정 API
export const fetchBoardUpdate = async (formData: FormData, id: number) : Promise<string> => {
  try {
    const res = await api.put(`/board/board-update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data; // 반드시 문자열 반환
  } catch (error) {
    console.error('게시글 수정 실패:', error);
    throw error;
  }
};

// 게시글 삭제 API
export const fetchBoardDelete = async (id: number): Promise<void> => {
  const res = await api.put(`/board/board-delete/${id}`);
  return res.data;
};

// 게시글 자료 엑셀 다운로드 API
export const fetchExcelDownload = async (type: string, keyword: string = '') => {
  const response = await api.get('/board/export', {
    params: { type, keyword },
    responseType: 'blob', // 엑셀 다운로드용
  });
  return response;
};
  



