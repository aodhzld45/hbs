export type BoardType = 'NOTICE' | 'EVENT' | 'FAQ';

export interface BoardItem {
    id: number;
    boardType: BoardType;

    title: string;
    content: string;
    writerName: string;

    imagePath?: string;
    startDate?: string;
    endDate?: string;

    viewCount: number;
    useTf: 'Y' | 'N';
    delTf?: 'Y' | 'N';

    regAdm?: string;
    regDate: string;
    upAdm?: string;
    upDate?: string;
    delAdm?: string;
    delDate?: string;

    hasFile?: boolean;
    files?: BoardFileItem[];
}

export interface BoardFileItem {
    id: number;
    boardId: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    fileExtension: string;
    dispSeq: number;
    useTf: 'Y' | 'N';
    delTf: 'Y' | 'N';
    regAdm: string;
    regDate: string;
    upAdm: string;
    upDate: string;
    delAdm: string;
    delDate: string;
}

// 게시판 유형별 한글 이름 매핑
export const BoardTypeTitleMap: Record<BoardType, string> = {
    NOTICE: '공지사항',
    EVENT: '이벤트',
    FAQ: 'FAQ',
  };




