import api from '../api';
import { CommentItem } from '../../types/Common/CommentItem'; 


// 댓글 등록
export const fetchCommentCreate = async (comment: {
    targetType: string;
    targetId: number;
    parentId?: number | null;
    writerName: string;
    password: string;
    content: string;
  }): Promise<CommentItem> => {
    const res = await api.post('/comments', comment);
    return res.data;
  };

// 특정 콘텐츠의 댓글 목록 조회
export const fetchCommentList = async (
    targetType: string,
    targetId: number
  ): Promise<CommentItem[]> => {
    const res = await api.get('/comments', {
      params: { targetType, targetId },
    });
    return res.data;
  };



// 댓글 수정
export const fetchUpdateComment = async (
    id: number,
    newContent: string
  ): Promise<CommentItem> => {
    const res = await api.put(`/comments/${id}`, newContent, {
      headers: { 'Content-Type': 'text/plain' }, // 문자열 직접 전송 시
    });
    return res.data;
  };
  
// 댓글 삭제 (soft delete)
export const fetchDeleteComment = async (id: number): Promise<void> => {
await api.delete(`/comments/${id}`);
};

// 비밀번호 확인
export const fetchPasswordConfirm = async (
    id: number,
    password: string
  ): Promise<boolean> => {
    const res = await api.post(`/comments/${id}/verify`, { password });
    return res.data.verified;
  };