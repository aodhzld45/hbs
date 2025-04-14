// src/hooks/useSession.ts
// 역할: SID 생성 및 localStorage 또는 cookie에 저장
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const getSessionId = (): string => {
  let sid = localStorage.getItem('SID');
  if (!sid) {
    sid = uuidv4();
    localStorage.setItem('SID', sid);
  }
  return sid;
};

export const useSessionId = () => {
  useEffect(() => {
    getSessionId(); // 초기 SID 생성
  }, []);
};
