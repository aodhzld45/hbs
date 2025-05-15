import api from '../api';
import {BoardItem, BoardType} from '../../types/Admin/BoardItem'

export const fetchBoardList = async (
    type: BoardType,
    keyword: string = '',
    page: number,
    size: number
    
  ): Promise<{ items: BoardItem[]; totalCount: number; totalPages: number; }> => {
    try {
      const res = await api.get('/board-list', {
        params: { type, keyword },
      });
      return res.data;
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      throw error;
    }
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
  



