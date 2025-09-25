import { useRef, useState } from 'react';
import { aiComplete } from '../services/chatApi';
import type { AiParams, AiResp, ChatMsg } from '../types';

export function useAiChat(baseParams: Omit<AiParams, 'prompt'>) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [resp, setResp] = useState<AiResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ⬇ 관리자 여부를 동적으로 갱신할 수 있게 변경
  const [isAdmin, setIsAdmin] = useState<boolean>(() => !!localStorage.getItem('jwtToken'));
  // ⬇ 일반 사용자만 사용 (0~3). 관리자면 undefined 유지
  const [remaining, setRemaining] = useState<number | undefined>(undefined);

  const ctrl = useRef<AbortController | null>(null);

  const run = async (prompt: string) => {
    if (!prompt?.trim()) return;

    // 일반 사용자: 남은 횟수 0이면 선제 차단(서버에서도 한 번 더 차단)
    if (!isAdmin && remaining === 0) {
      setError('오늘 질문 3회 한도를 모두 사용했습니다. 내일 다시 시도해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setResp(null);

    // 이전 요청 취소
    ctrl.current?.abort();
    ctrl.current = new AbortController();

    try {
      const { data, remaining: remainFromHdr } =
        await aiComplete({ ...baseParams, prompt }, ctrl.current.signal);

      // ── 헤더 기반 상태 동기화 ─────────────────────────────
      if (remainFromHdr !== undefined) {
        if (remainFromHdr < 0) {
          // -1 이면 관리자(무제한)
          setIsAdmin(true);
          setRemaining(undefined);
        } else {
          setIsAdmin(false);
          setRemaining(remainFromHdr); // 0~3
        }
      }

      // 메시지 스레드 업데이트
      setMessages(m => [...m, { role: 'user', text: prompt }, { role: 'assistant', text: data.text }]);
      setResp(data);
    } catch (e: any) {
      // 취소면 조용히 종료
      const name = e?.name || e?.code;
      if (name === 'CanceledError' || name === 'AbortError') return;

      const status = e?.response?.status as number | undefined;
      const body = e?.response?.data;

      if (status === 429) {
        // 서버 메시지 우선
        const msgText =
          (typeof body === 'string' && body) ||
          (typeof body === 'object' && body?.text) ||
          '요청 한도를 초과했습니다.';
        setError(msgText);

        // 헤더로 남은 횟수 동기화 (노출 허용 필요)
        const hdr =
          e?.response?.headers?.['x-dailyreq-remaining'] ??
          e?.response?.headers?.['X-DailyReq-Remaining'];
        if (hdr !== undefined) {
          const n = Number(hdr);
          if (!Number.isNaN(n)) {
            if (n < 0) { setIsAdmin(true); setRemaining(undefined); }
            else       { setIsAdmin(false); setRemaining(n); }
          }
        } else {
          // 헤더가 없으면 안전하게 0으로 고정
          setIsAdmin(false);
          setRemaining(0);
        }
      } else {
        const msgText =
          (typeof body === 'string' && body) ||
          (typeof body === 'object' && body?.message) ||
          e?.message ||
          '요청 실패';
        setError(msgText);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    messages, resp, error, loading,
    run,
    isAdmin,
    remaining, // 일반: 0~3, 관리자: undefined
  };
}
