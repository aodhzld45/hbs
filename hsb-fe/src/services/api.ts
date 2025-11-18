// src/services/api.ts
import axios, { AxiosResponse } from 'axios';

// 환경변수 없으면 기본값을 '/api' 로 사용 (Apache 프록시)
const RAW_BASE = (process.env.REACT_APP_API_BASE_URL || '/api').trim();
// 끝 슬래시 제거: '/api/' -> '/api', 'http://x/api/' -> 'http://x/api'
const BASE_URL = RAW_BASE.replace(/\/+$/, '');

const api = axios.create({
  baseURL: BASE_URL, // 여기서 추가로 '/api'를 붙이지 않기
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // 쿠키가 필요 없으면 false
  timeout: 15000,
});

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
