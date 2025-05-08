// src/services/api.ts
import axios from 'axios';

const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 배포 서버
const api = axios.create({
  baseURL: `${REACT_APP_API_BASE_URL}/api`, // ← 백엔드 주소에 맞게 수정
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 필요한 경우: 쿠키 포함 요청
});

// JWT 자동 첨부 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 로컬 서버
// const api = axios.create({
//   baseURL: 'http://localhost:8080/api', // ← 백엔드 주소에 맞게 수정
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true, // 필요한 경우: 쿠키 포함 요청
// });

export default api;
