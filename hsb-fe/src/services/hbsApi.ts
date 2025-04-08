import api from './api';
import { HbsContent } from '../types/HbsContent';

export const fetchHbsList = async (): Promise<HbsContent[]> => {
  const res = await api.get('/hbs');
  return res.data;
};

export const fetchHbsDetail = async (id: number): Promise<HbsContent> => {
  const res = await api.get(`/hbs/${id}`);
  return res.data;
};
