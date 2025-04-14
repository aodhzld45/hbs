// src/hooks/usePageLogger.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSessionId } from './useSession';
import { sendUserLog } from "../services/logApi";

export const usePageLogger = () => {
  const location = useLocation();

  const deviceType: 'MOBILE' | 'PC' | 'TABLET' =
  /Mobi|Android/i.test(navigator.userAgent) ? 'MOBILE' : 'PC';

  useEffect(() => {
    const sid = getSessionId();
  
    const logData = {
      sid,
      url: location.pathname,
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
  
    console.log('📢 [Page Logger] 로그 전송', logData);
  
    sendUserLog(logData)
      .then(() => console.log('로그 전송 성공'))
      .catch((err) => console.error('로그 전송 실패:', err));
  }, [location, deviceType]);
};
