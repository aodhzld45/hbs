export type BoardCode = string;

export interface BoardItem {
  id: number;
  boardConfigId?: number;
  boardCode: BoardCode;
  boardName?: string;
  categoryCode?: string | null;
  title: string;
  content: string;
  writerName: string;
  imagePath?: string;
  startDate?: string;
  endDate?: string;
  viewCount: number;
  noticeTf?: 'Y' | 'N';
  noticeSeq?: number;
  noticeStart?: string | null;
  noticeEnd?: string | null;
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
  originalFileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  fileExtension: string;
  dispSeq: number;
  useTf: 'Y' | 'N';
  delTf: 'Y' | 'N';
  regAdm?: string;
  regDate?: string;
  upAdm?: string;
  upDate?: string;
  delAdm?: string;
  delDate?: string;
}

export function getBoardDisplayName(boardCode?: string, boardName?: string | null): string {
  if (boardName && boardName.trim()) {
    return boardName;
  }
  return boardCode?.toUpperCase() ?? '게시판';
}