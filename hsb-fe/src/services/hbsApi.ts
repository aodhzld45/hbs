import api from './api';
import { HbsContent } from '../types/HbsContent';

export const fetchHbsList = async (): Promise<HbsContent[]> => {
  const res = await api.get('/content-files');
  return res.data;
};

export const fetchHbsDetail = async (id: number): Promise<HbsContent> => {
  const res = await api.get(`/hbs/${id}`);
  return res.data;
};
