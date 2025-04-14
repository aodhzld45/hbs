// src/api/logApi.ts
import api from './api';

export interface UserLogPayload {
  sid: string;
  url: string;
  referer: string;
  diviceType: 'PC' | 'MOBILE' | 'TABLET';
  pageType?: string | null;
  depth01?: string | null;
  depth02?: string | null;
  depth03?: string | null;
  param01?: string | null;
  param02?: string | null;
  param03?: string | null;
}

/**
 * 사용자 로그를 백엔드로 전송합니다.
 * @param logData UserLogPayload 타입의 로그 데이터
 */
export const sendUserLog = async (logData: UserLogPayload): Promise<void> => {
  await api.post('/userlog', logData);
};
