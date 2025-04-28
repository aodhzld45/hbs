// src/services/api.ts
import axios from 'axios';

// 배포 서버
const api = axios.create({
  baseURL: 'http://43.203.62.30:8080/api', // ← 백엔드 주소에 맞게 수정
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 필요한 경우: 쿠키 포함 요청
});

// 로컬 서버
// const api = axios.create({
//   baseURL: 'http://localhost:8080/api', // ← 백엔드 주소에 맞게 수정
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true, // 필요한 경우: 쿠키 포함 요청
// });

export default api;
