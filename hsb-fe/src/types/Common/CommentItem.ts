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
  }
  