import api from '../../../../services/api';
import { AiParams, AiResp } from '../types';

export async function aiComplete(params: AiParams, signal?: AbortSignal) {
  const { data } = await api.post<AiResp>('/ai/complete', params, { signal });
  return data;
}