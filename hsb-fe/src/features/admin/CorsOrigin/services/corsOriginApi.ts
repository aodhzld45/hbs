import api from '../../../../services/api';
import { CorsOrigin, CorsOriginRequest, CorsOriginListResponse } from '../types/CorsOrigin';

export const fetchCorsOriginList = async (
  keyword: string,
  page: number,
  size: number,
  sort: string,
  useTf?: 'Y' | 'N',
  tenantId?: string
): Promise<CorsOriginListResponse> => {
  const res = await api.get('/admin/cors-origins', {
    params: { keyword, page, size, sort, useTf, tenantId },
  });
  return res.data;
};

export const fetchActiveAll = async (): Promise<CorsOrigin[]> => {
  const res = await api.get('/admin/cors-origins/active');
  return res.data;
};

export const fetchActiveByTenant = async (tenantId?: string | null): Promise<CorsOrigin[]> => {
  const res = await api.get('/admin/cors-origins/active/by-tenant', { params: { tenantId } });
  return res.data;
};

export const fetchActiveById = async (id: number): Promise<CorsOrigin> => {
  const res = await api.get(`/admin/cors-origins/${id}`);
  return res.data;
};

export const createCorsOrigin = async (req: CorsOriginRequest, actor: string): Promise<number> => {
  const res = await api.post('/admin/cors-origins', req, { params: { actor } });
  return res.data.id as number;
};

export const updateCorsOrigin = async (id: number, req: CorsOriginRequest, actor: string): Promise<number> => {
  const res = await api.patch(`/admin/cors-origins/${id}`, req, { params: { actor } });
  return res.data.id as number;
};

export const updateUseTf = async (id: number, newUseTf: 'Y' | 'N', actor: string): Promise<number> => {
  const res = await api.patch(`/admin/cors-origins/${id}/use-tf`, null, { params: { newUseTf, actor } });
  return res.data.id as number;
};

export const softDeleteCorsOrigin = async (id: number, actor: string): Promise<number> => {
  const res = await api.patch(`/admin/cors-origins/${id}/del-tf`, null, { params: { actor } });
  return res.data.id as number;
};