import api from '../../../../services/api';
import { BlockIp, BlockIpListResponse, BlockIpRequest, Yn } from '../types/BlockIp';

export const fetchBlockIpList = async (
  keyword: string,
  page: number,
  size: number,
  sort: string
): Promise<BlockIpListResponse> => {
  const res = await api.get('/admin/block-ips', {
    params: { keyword, page, size, sort },
  });
  return res.data;
};

export const fetchBlockIpActiveAll = async (): Promise<BlockIp[]> => {
  const res = await api.get('/admin/block-ips/active');
  return res.data;
};

export const fetchBlockIpActiveById = async (id: number): Promise<BlockIp> => {
  const res = await api.get(`/admin/block-ips/${id}`);
  return res.data;
};

export const createBlockIp = async (req: BlockIpRequest, actor: string): Promise<number> => {
  const res = await api.post('/admin/block-ips', req, { params: { actor } });
  return res.data.id as number;
};

export const updateBlockIp = async (id: number, req: BlockIpRequest, actor: string): Promise<number> => {
  const res = await api.patch(`/admin/block-ips/${id}`, req, { params: { actor } });
  return res.data.id as number;
};

export const updateBlockIpUseTf = async (id: number, newUseTf: Yn, actor: string): Promise<number> => {
  const res = await api.patch(`/admin/block-ips/${id}/use-tf`, null, {
    params: { newUseTf, actor },
  });
  return res.data.id as number;
};

export const softDeleteBlockIp = async (id: number, actor: string): Promise<number> => {
  const res = await api.patch(`/admin/block-ips/${id}/del-tf`, null, { params: { actor } });
  return res.data.id as number;
};

