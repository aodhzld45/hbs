// src/services/api.ts
import axios from 'axios';

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

// JWT 자동 첨부 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
