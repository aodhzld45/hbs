// src/hooks/usePageLogger.ts
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getSessionId } from './useSession';
import { sendUserLog } from '../services/logApi';
import type { UserLogPayload } from '../services/logApi';

export const usePageLogger = () => {
  const location = useLocation();
  const hasLoggedRef = useRef<string | null>(null); // 이전 URL 저장

  const deviceType: 'MOBILE' | 'PC' | 'TABLET' =
    /Mobi|Android/i.test(navigator.userAgent) ? 'MOBILE' : 'PC';

  useEffect(() => {
    const currentPath = location.pathname;

    if (hasLoggedRef.current === currentPath) return;

    const sid = getSessionId();
    const logData: UserLogPayload = {
      sid,
      url: currentPath,
      referer: document.referrer,
      diviceType: deviceType,
      pageType: null,
      depth01: null,
      depth02: null,
      depth03: null,
      param01: null,
      param02: null,
      param03: null,
    };

    sendUserLog(logData)
      .then(() => {
        console.log('로그 전송 성공:', logData);
        hasLoggedRef.current = currentPath; // 경로 저장
      })
      .catch((err) => {
        console.error('🚨 로그 전송 실패:', err);
      });
  }, [location.pathname, deviceType]);
};
