import React from 'react';

const FALLBACK_MESSAGE = '접근이 차단되었습니다. 관리자에게 문의 바랍니다.';

export default function BlockedIpPage() {
  const [message, setMessage] = React.useState(FALLBACK_MESSAGE);

  React.useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem('blockedIpMessage');
      if (stored && stored.trim()) {
        setMessage(stored.trim());
      }
    } catch (e) {
      console.warn('blockedIpMessage 조회 실패', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl border shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">접근 차단</h1>
        <p className="mt-4 text-gray-700">{message}</p>
        <p className="mt-2 text-sm text-gray-500">
          문제가 지속되면 관리자에게 요청 IP 확인을 문의해 주세요.
        </p>
      </div>
    </div>
  );
}