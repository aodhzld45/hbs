import api from '../api';
import { ContactItem } from '../../types/Common/ContactItem'; 


// 문의 관리 목록 조회
export const fetchContactList = async (
  keyword: string = '',
  page: number,
  size: number
): Promise<{ items: ContactItem[]; totalCount: number; totalPages: number; message: string; }> => {

  const res = await api.get(`/contact`, {
    params: {
      keyword,
      page,
      size
    },
  });

  return {
    items: res.data.res.items,
    totalCount: res.data.res.totalCount,
    totalPages: res.data.res.totalPages,
    message: res.data.message,
  };
};


// 문의 등록
export const fetchContactCreate = async(data: ContactItem) => {
    const formData = new FormData();
    formData.append('companyName', data.companyName);
    formData.append('contactName', data.contactName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('title', data.title);
    formData.append('message', data.message);

    if (data.projectType) formData.append('projectType', data.projectType);
    if (data.replyMethod) formData.append('replyMethod', data.replyMethod);
    if (data.file) formData.append('file', data.file);
    formData.append('agreeTf', data.agreeTf ? 'Y' : 'N');

    const res = await api.post('/contact', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
};

