import api from '../api';
import { ContactItem } from '../../types/Common/ContactItem'; 


// 문의 관리 목록 조회 API 요청
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
    items: res.data.data.items,
    totalCount: res.data.data.totalCount,
    totalPages: res.data.data.totalPages,
    message: res.data.message,
  };
};

// 문의 관리 상세 API 요청
export const fetchContactDetail = async (id: number): Promise<ContactItem> => {
  const res = await api.get('/contact/detail', { params: { id } });
  return res.data;
};


// 문의 등록 API 요청
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

// 문의 답변 API 요청
export const fetchContactReply = async (data: {
  id: number;
  replyContent: string;
  replyMethod: string; // "EMAIL", "PHONE"
}) => {
  const res = await api.post('/contact/reply', data);
  return res.data;
};

export const fetchContactDelete = async (id: number): Promise<void> => {
  const res = await api.put(`/contact/delete/${id}`);
  return res.data;
};

