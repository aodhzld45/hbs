import api from './api';
import { HbsContent } from '../types/HbsContent';

// hbs 목록 api 요청 
export const fetchHbsList = async (): Promise<HbsContent[]> => {
  const res = await api.get('/content-files');
  return res.data;
};

// 콘텐츠 필터 목록 api 요청
export const fetchFilteredContents = async (
  fileType: string,
  contentType: string,
  keyword: string = '',
  page: number,
  size: number
): Promise<{ items: HbsContent[]; totalCount: number; totalPages: number; }> => {

  const res = await api.get(`/contents`, {
    params: {
      fileType,
      contentType,
      keyword,
      page,
      size
    },
  });
  return res.data;
};

// hbs 상세 api 요청 
export const fetchHbsDetail = async (fileId: number): Promise<HbsContent> => {
  const res = await api.get(`/content-files/${fileId}`);
  return res.data;
};

// hbs 등록 api 요청
export const fetchHbsCreate = async (formData: FormData) => {
  const res = await api.post('/content-files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// S3 콘텐츠 등록 및 업로드 api 요청
export const fetchS3Create = async (formData: FormData) => {
  const res = await api.post('/s3-upload', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
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

// hbs 삭제 api 요청
export const fetchHbsDelete = async (fileId: number) => {
  const res = await api.put(`/content-files/${fileId}/delete`);
  return res.data;
};



