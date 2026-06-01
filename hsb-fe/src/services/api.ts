// src/services/api.ts
import axios, { AxiosResponse } from 'axios';

// 환경변수 없으면 기본값을 '/api' 로 사용 (Apache 프록시)
const RAW_BASE = (process.env.REACT_APP_API_BASE_URL || '/api').trim();
// 끝 슬래시 제거: '/api/' -> '/api', 'http://x/api/' -> 'http://x/api'
const BASE_URL = RAW_BASE.replace(/\/+$/, '');

const api = axios.create({
  baseURL: BASE_URL, // 여기서 추가로 '/api'를 붙이지 않기
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false, // 쿠키가 필요 없으면 false
  timeout: 15000,
});

export const SESSION_EXPIRED_EVENT = 'hsbs:session-expired';
export const ACCESS_DENIED_EVENT = 'hsbs:access-denied';

const getCurrentPath = () =>
  window.location.pathname + window.location.search + window.location.hash;

const getResponseCode = (data: unknown): string | undefined => {
  if (data && typeof data === 'object' && 'code' in data) {
    return String((data as { code?: unknown }).code || '');
  }
  return undefined;
};

const getResponseMessage = (data: unknown, fallback: string) => {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (typeof data === 'string' && data.trim() && !looksLikeHtml(data)) {
    return data;
  }
  return fallback;
};

const looksLikeHtml = (value: unknown) => {
  if (typeof value !== 'string') return false;
  const s = value.trim().toLowerCase();
  return s.startsWith('<!doctype html') || s.startsWith('<html');
};

const isAdminPath = () => window.location.pathname.startsWith('/admin');
const isLoginPath = () => window.location.pathname === '/admin/login';

const notifySessionExpired = (message?: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const currentPath = getCurrentPath();

  window.dispatchEvent(
    new CustomEvent(SESSION_EXPIRED_EVENT, {
      detail: {
        message: message || '인증이 만료되었습니다. 다시 로그인해주세요.',
        redirectTo: currentPath,
      },
    })
  );
};

const notifyAccessDenied = (message?: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ACCESS_DENIED_EVENT, {
      detail: {
        message: message || '접근 권한이 없습니다.',
        path: getCurrentPath(),
      },
    })
  );
};

const isAccessDenied403 = (code?: string, message?: string) => {
  const normalizedCode = (code || '').toUpperCase();
  const normalizedMessage = message || '';

  return (
    normalizedCode === 'ACCESS_DENIED' ||
    normalizedCode === 'PERMISSION_DENIED' ||
    normalizedCode === 'MENU_FORBIDDEN' ||
    normalizedMessage.includes('권한') ||
    normalizedMessage.toLowerCase().includes('permission')
  );
};

const isSessionExpiredLike403 = (data: unknown, contentType?: string, code?: string, message?: string) => {
  const hasToken = Boolean(localStorage.getItem('jwtToken'));
  const normalizedCode = (code || '').toUpperCase();
  const isHtml = looksLikeHtml(data) || (contentType || '').toLowerCase().includes('text/html');
  const isEmpty = data == null || data === '';

  return (
    isAdminPath() &&
    !isLoginPath() &&
    hasToken &&
    !isAccessDenied403(code, message) &&
    (normalizedCode === 'FORBIDDEN' || normalizedCode === 'UNAUTHORIZED' || isHtml || isEmpty)
  );
};

// ---- helper: FormData 판별 ----
const isFormData = (v: any): v is FormData =>
  typeof FormData !== 'undefined' && v instanceof FormData;

// JWT 자동 첨부 + FormData 분기
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Body가 FormData면 JSON 기본 헤더 제거 → 브라우저가 multipart 헤더 자동 세팅
    if (isFormData(config.data)) {
      if (config.headers) {
        // axios v1 타입 가드 회피용 캐스팅
        delete (config.headers as any)['Content-Type'];
      }
      // 필요 시 캐시 방지 파라미터도 추가 가능
      // (config.params = { ...(config.params||{}), _ts: Date.now() });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 아이피 차단 우회
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const headers = error?.response?.headers || {};
    const contentType = headers['content-type'] || headers['Content-Type'];
    const code = getResponseCode(data);
    const message = getResponseMessage(data, '접근이 차단되었습니다. 관리자에게 문의 바랍니다.');

    if (status === 403 && code === 'BLOCKED_IP') {
      try {
        const currentPath = getCurrentPath();

        window.sessionStorage.setItem('blockedIpMessage', message);

        if (window.location.pathname !== '/blocked-ip') {
          window.sessionStorage.setItem('blockedIpFrom', currentPath);
          window.location.replace('/blocked-ip');
        }
      } catch (e) {
        console.warn('차단 정보 저장 실패', e);
      }

      return Promise.reject(error);
    }

    if (status === 403 && isSessionExpiredLike403(data, contentType, code, message)) {
      try {
        localStorage.removeItem('jwtToken');
        notifySessionExpired('인증이 만료되었습니다. 다시 로그인해주세요.');
      } catch (e) {
        console.warn('403 세션 만료 처리 실패', e);
      }

      return Promise.reject(error);
    }

    if (status === 403 && isAdminPath() && !isLoginPath()) {
      notifyAccessDenied(message || '접근 권한이 없습니다.');
      return Promise.reject(error);
    }

    if (status === 401) {
      try {
        localStorage.removeItem('jwtToken');

        if (isAdminPath() && !isLoginPath()) {
          notifySessionExpired(getResponseMessage(data, '인증이 만료되었습니다. 다시 로그인해주세요.'));
        }
      } catch (e) {
        console.warn('세션 만료 처리 실패', e);
      }
    }

    return Promise.reject(error);
  }
);




export default api;

export type ApiError = { code: string; message: string };

export const okOrThrow = async <T>(p: Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    const res = await p;
    return res.data;
  } catch (err: any) {
    const apiErr: ApiError | undefined = err?.response?.data;
    throw new Error(apiErr?.message || err?.message || "API Error");
  }
};
