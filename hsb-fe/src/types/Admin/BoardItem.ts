export type BoardType = 'NOTICE' | 'EVENT' | 'FAQ';

export interface BoardItem {
    id: number;
    title: string;
    writerName: string;
    regDate: string;
    viewCount: number;
    useTf: 'Y' | 'N';
}

// 게시판 유형별 한글 이름 매핑
export const BoardTypeTitleMap: Record<BoardType, string> = {
    NOTICE: '공지사항',
    EVENT: '이벤트',
    FAQ: 'FAQ',
  };




