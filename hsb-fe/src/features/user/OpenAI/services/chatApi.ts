import api from '../../../../services/api';
import { AiParams, AiResp } from '../types';

export type AiCompleteResult = {
  data: AiResp;
  remaining?: number; // 하루 남은 횟수 (일반 사용자만)
  status: number;
};

export async function aiComplete(params: AiParams, signal?: AbortSignal): Promise<AiCompleteResult> {
  // 관리자 판단: jwtToken 존재하면 Authorization 헤더 추가
  const token = localStorage.getItem('jwtToken') || undefined;

  const res = await api.post<AiResp>(
    '/ai/complete',
    params,
    {
      signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  // 백엔드가 넣는 헤더: X-DailyReq-Remaining
  const remainHeader =
    res.headers?.['x-dailyreq-remaining'] ??
    res.headers?.['X-DailyReq-Remaining']; // 환경별 호환

  const remaining = (remainHeader !== undefined && remainHeader !== null)
    ? Number(remainHeader)
    : undefined;

  return { data: res.data, remaining, status: res.status };
}
