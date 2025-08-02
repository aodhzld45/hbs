export interface ContactUserItem {
    id? : number;
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    title: string;
    message: string;
    projectType?: string;
    replyMethod?: string;
    replyContent?: string;
    file?: File | null;
    filePath?: string;
    originalFileName? : string;
    agreeTf: boolean; // Y/N로 바꿔서 보내줄 것

    regDate?: string;
    useTf?: 'Y' | 'N';
    delTf?: 'Y' | 'N';
    replyTf?: 'Y' | 'N';

  }