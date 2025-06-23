import api from '../api'; // 공통 Axios 인스턴스

// 대시보드 콘텐츠 통계
export const fetchContentStats = async (startDate: Date, endDate: Date) => {
    const res = await api.get('/stats/content', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return res.data;
  };

// 대시보드 댓글 통계
export const fetchCommentStats = async (startDate: Date, endDate: Date) => {
  const res = await api.get('/stats/comment', {
    params: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  });
  return res.data;
};
