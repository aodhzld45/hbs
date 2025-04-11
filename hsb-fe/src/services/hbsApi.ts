import api from './api';
import { HbsContent } from '../types/HbsContent';

// hbs 목록 api 요청 
export const fetchHbsList = async (): Promise<HbsContent[]> => {
  const res = await api.get('/content-files');
  return res.data;
};

// hbs 상세 api 요청 
export const fetchHbsDetail = async (fileId: number): Promise<HbsContent> => {
  const response = await api.get(`/content-files/${fileId}`);
  return response.data;
};

// hbs 수정 api 요청
export const fetchHbsUpdate = async (formData: FormData) => {
  const fileId = formData.get('fileId');
  if (!fileId) throw new Error('fileId is missing');
  const res = await api.put(`/content-files/${fileId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};



