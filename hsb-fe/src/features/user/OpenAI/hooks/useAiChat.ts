import { useRef, useState } from 'react';
import { aiComplete } from '../services/chatApi';
import type { AiParams, AiResp, ChatMsg } from '../types';

export function useAiChat(baseParams: Omit<AiParams, 'prompt'>) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [resp, setResp] = useState<AiResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ctrl = useRef<AbortController | null>(null);

  const run = async (prompt: string) => {
    if (!prompt?.trim()) return;
    setLoading(true); setError(null); setResp(null);
    ctrl.current?.abort(); ctrl.current = new AbortController();
    try {
      const data = await aiComplete({ ...baseParams, prompt }, ctrl.current.signal);
      setMessages(m => [...m, { role:'user', text: prompt }, { role:'assistant', text: data.text }]);
      setResp(data);
    } catch (e:any) {
      setError(e?.response?.data ?? e?.message ?? '요청 실패');
    } finally { setLoading(false); }
  };

  return { messages, resp, error, loading, run };
}