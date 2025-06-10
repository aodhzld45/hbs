export interface ContactItem {
    //id : number;
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    title: string;
    message: string;
    projectType?: string;
    replyMethod?: string;
    file?: File | null;
    agreeTf: boolean; // Y/N로 바꿔서 보내줄 것
  }