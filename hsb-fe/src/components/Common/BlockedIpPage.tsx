import React from 'react';
import ComingSoonPage from './ComingSoonPage';

const FALLBACK_MESSAGE = '접근이 차단되었습니다. 관리자에게 문의 바랍니다.';

export default function BlockedIpPage() {
  const [message, setMessage] = React.useState(FALLBACK_MESSAGE);
  const [fromPath, setFromPath] = React.useState('');

  React.useEffect(() => {
    try {
      const storedMessage = window.sessionStorage.getItem('blockedIpMessage');
      const storedFrom = window.sessionStorage.getItem('blockedIpFrom');

      if (storedMessage?.trim()) {
        setMessage(storedMessage.trim());
      }

      if (storedFrom?.trim()) {
        setFromPath(storedFrom.trim());
      }
    } catch (e) {
      console.warn('blockedIp 정보 조회 실패', e);
    }
  }, []);

  return (
    <ComingSoonPage
      type="BLOCKED_IP"
      title="접근이 차단되었습니다."
      description={message}
      helpText={
        fromPath
          ? `차단 당시 접근 경로: ${fromPath}`
          : '문제가 지속되면 관리자에게 요청 IP 확인을 문의해 주세요.'
      }
    />
  );
}