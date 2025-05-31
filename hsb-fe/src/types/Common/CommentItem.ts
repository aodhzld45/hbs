export interface CommentItem {
    id: number;
    targetType: string;
    targetId: number;
    parentId?: number | null;
    writerName: string;
    content: string;
    password: string;
    useTf: string;
    delTf: string;
    regDate: string;
    upDate: string;
    delDate: string;

    isReply?: boolean; // 대댓글 여부 (UI용)
    replies?: CommentItem[]; //  nested replies를 담고 싶은 경우


  }
  