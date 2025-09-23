import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAiChat } from '../hooks/useAiChat';

type Props = { inferContext: () => string };

export default function AssistantWidget({ inferContext }: Props) {
  const baseParams = useMemo(() => ({
    system: 'You are a helpful assistant for the HSBS portfolio site. Reply in Korean.',
    context: inferContext(),
    model: 'gpt-4o-mini',
    temperature: 0.3,
    maxTokens: 600
  }), [inferContext]);

  const { messages, resp, error, loading, run, } = useAiChat(baseParams);
  const [prompt, setPrompt] = useState('이 페이지의 핵심만 요약해줘.');

  // 버튼 + 결과 박스를 포털로 렌더
  const portalUi = (
    <>
      <button
        className="
          fixed bottom-6 right-6 
          z-[2147483647]    /* 아주 크게 */
          rounded-full px-4 py-3 
          bg-blue-600 text-white shadow-lg
        "
        onClick={() => run(prompt)}
        disabled={loading}
      >
        {loading ? '생성 중…' : '💬 요약 받기'}
      </button>

      {(resp || error) && (
        <div
          className="
            fixed bottom-24 right-6 
            z-[2147483647]
            w-[340px] max-h-[60vh] overflow-y-auto
            bg-white dark:bg-[#121212] border rounded-lg shadow-xl p-3 text-sm
          "
        >
          {error ? (
            <div className="text-red-600">{String(error)}</div>
          ) : (
            <pre className="whitespace-pre-wrap dark:text-gray-100">{resp?.text}</pre>
          )}
        </div>
      )}
    </>
  );

  return createPortal(portalUi, document.body);
}
