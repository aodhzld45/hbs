const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
// 로컬용
//export const FILE_BASE_URL = `${API_BASE_URL}`; 
// 배포용: /api → /
export const FILE_BASE_URL = API_BASE_URL.replace(/\/api/g, '');
