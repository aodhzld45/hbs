import React, { useMemo, useState, useEffect, useMemo as useM } from 'react';
import { createPortal } from 'react-dom';
import { useAiChat } from '../hooks/useAiChat';

type Props = { inferContext: () => string };

export default function AssistantWidget({ inferContext }: Props) {
  const baseParams = useMemo(() => ({
    system: `You are an AI assistant embedded in the HSBS portfolio site.
  HSBS is a full-stack portfolio project built with React (frontend), Spring Boot (backend), and MySQL (database), deployed on OCI Ubuntu with Apache and GitHub Actions CI/CD.
  Introduce and explain 서현석 as a full-stack developer who planned and developed this project.
  Always answer in Korean, concisely (within 2~3 sentences) unless the user explicitly asks for more detail.`,
    context: inferContext(),
    model: 'gpt-4o-mini',
    temperature: 0.3,
    maxTokens: 300,
  }), [inferContext]);

  const [open, setOpen] = useState(false);
  const { messages, resp, error, loading, run, isAdmin, remaining } = useAiChat(baseParams);
  const [prompt, setPrompt] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [introShown, setIntroShown] = useState(false);
  const [showIntroMsg, setShowIntroMsg] = useState(false);

  // 모바일 전체화면 시 바디 스크롤 잠금
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  useEffect(() => {
    if (open && !introShown) {
      setShowIntroMsg(true);
      setIntroShown(true);
    }
  }, [open, introShown]);

  const introMsg = {
    role: 'assistant' as const,
    text: `반갑습니다! 👋  
  이 챗봇은 HSBS 포트폴리오 사이트의 프로토타입입니다.  

  저는 서현석이 직접 기획 · 개발한 풀스택 프로젝트 챗봇이에요.  
  포트폴리오와 관련된 궁금증을 자유롭게 물어보세요.  

  ✅ 답변은 참고용으로만 활용해 주세요.  
  ✅ 본 프로젝트는 React + Spring Boot + MySQL 기반으로 제작되었습니다.  

  📌 ABOUT  
  - 끈기 있는 개발자: 다양한 프로젝트에서 문제 해결 중심으로 접근하며 안정성과 효율성을 고민합니다.  
  - 꾸준히 성장하는 개발자: 새로운 기술에 대한 흥미와 직접 구축·운영 경험을 통해 성장합니다.  

  📌 PROJECTS  
  - 원주미래산업진흥원 구축 (PHP CMS, 회원/예약/팝업 관리)  
  - SKT OUR365 CONNECT+ 운영 (사내방송 플랫폼, 로그 개발)  
  - 천조 키오스크 및 API 유지보수 (스타필드/센텀시티)  
  - 스마일게이트 교육플랫폼 고도화 (Chart.js 통계, 시험/설문)  
  - 한양대학교 입학처 리뉴얼 (입학 페이지 개발·유지보수)  
  - 대통령경호처 인재채용사이트 (CentOS 기반 시스템 관리, 인턴십)  

  📌 SKILLS  
  프론트엔드 → 백엔드 → DevOps까지 하나의 흐름으로 연결된 개발 경험.  
  단순 사용이 아니라 문제 해결과 서비스 완성에 집중합니다.  

  📌 SECURITIES DATA  
  - 국내 증권 데이터 파이프라인 (KRX Batch + KIS OpenAPI)  
  - 종목 마스터 배치 업서트, 단건 시세 조회 연동  
  - 전체 흐름: 데이터 수집 → 정규화 → 제공  

  📌 DEPLOY  
  - React(Frontend) + Spring Boot(Backend)  
  - OCI Ubuntu + Apache 배포  
  - GitHub Actions 기반 CI/CD  

  📌 SECTIONS  
  - 관리자 페이지에서 등록한 섹션 데이터를 동적으로 조립/렌더링  
  - 정해진 틀이 아닌 콘텐츠 중심 유연 레이아웃 지원  
  - (※ 현재는 프로토타입 버전)  

  📌 OPENAI CHATBOT  
  - Model: gpt-4o-mini  
  - 백엔드 로직 & 프론트 UI: GPT를 통해 점진적으로 고도화 중 🚀  

  자, 무엇을 도와드릴까요? 🙂`
  };

  // 타자 효과
  useEffect(() => {
    if (!resp?.text) return;
    let i = 0;
    setDisplayedText('');
    const t = setInterval(() => {
      i++;
      setDisplayedText(resp.text.slice(0, i));
      if (i >= resp.text.length) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, [resp?.text]);

  // 타자 출력 중엔 messages의 마지막 assistant를 숨기기
  const lastAssistantIndex = useM(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i;
    }
    return -1;
  }, [messages]);

  const renderMessages = useM(() => {
    const hideLastAssistant = !!(resp && !loading);
    return messages.map((m, i) => {
      if (hideLastAssistant && i === lastAssistantIndex) return null;
      return (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
          {m.role === 'assistant' && (
            <img src="/image/hsbs_dog_avatar_4.png" alt="HSBS Dog" className="w-8 h-8 rounded-full self-end" />
          )}
          <div
            className={`max-w-[75%] px-3 py-2 rounded-lg ${
              m.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100'
            }`}
          >
            {m.text}
          </div>
        </div>
      );
    });
  }, [messages, resp, loading, lastAssistantIndex]);

  return createPortal(
    <>
      {/* 플로팅 오픈 버튼: 모바일에서 살짝 작게 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            fixed md:bottom-6 md:right-6 bottom-[calc(env(safe-area-inset-bottom,0)+16px)] right-4
            z-[2147483647] rounded-full p-2 bg-blue-600 text-white shadow-lg
          "
          aria-label="Open Assistant"
        >
          <div className="relative flex flex-col items-center">
            <img
              src="/image/hsbs_dog_avatar_5.png"
              alt="Open Assistant"
              className="md:w-32 md:h-32 w-20 h-20 rounded-full object-cover"
            />
          </div>
        </button>
      )}

      {open && (
        <>
          {/* 모바일 전용 백드롭 (탭으로 닫기) */}
          <div
            className="fixed inset-0 bg-black/30 md:hidden z-[2147483646]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* 컨테이너: 모바일(전체화면) vs 데스크탑(작은 패널) */}
          <div
            className="
              fixed z-[2147483647] flex flex-col
              md:bottom-6 md:right-6 md:w-[340px] md:h-[480px] md:rounded-lg
              md:bg-white md:dark:bg-[#121212] md:border md:shadow-xl
              inset-0 md:inset-auto
              w-screen h-[100dvh]  /* 모바일: 주소창 높이 반영 */
              bg-white dark:bg-[#121212] rounded-none
            "
            role="dialog"
            aria-modal="true"
          >
            {/* 헤더: 모바일에서 터치 타겟 크게 + 드래그바 느낌 */}
            <div className="p-3 border-b flex items-center justify-between md:rounded-t-lg">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm md:text-sm text-gray-900 dark:text-gray-100">AI HS봇</span>
                {isAdmin ? (
                  <span className="text-[10px] md:text-xs px-2 py-1 rounded-full bg-green-600 text-white">
                    관리자 · 무제한
                  </span>
                ) : (
                  <span className="text-[10px] md:text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 dark:text-gray-100">
                    오늘 남은 질문: {remaining}
                  </span>
                )}
              </div>
              <button
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 dark:text-gray-100"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* 본문: 모바일에서 더 넓은 패딩/스크롤 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-[15px] md:text-sm">
              {showIntroMsg && (
                <div className="flex justify-start gap-2">
                  <img src="/image/hsbs_dog_avatar_4.png" alt="HSBS Dog" className="w-8 h-8 rounded-full self-end" />
                  <div className="bg-gray-200 dark:bg-gray-100 px-3 py-2 rounded-lg whitespace-pre-wrap">
                    {introMsg.text}
                  </div>
                </div>
              )}

              {renderMessages}

              {loading && (
                <div className="flex justify-start gap-2">
                  <img src="/image/hsbs_dog_avatar_4.png" alt="HSBS Dog" className="w-8 h-8 rounded-full self-end" />
                  <div className="bg-gray-200 dark:bg-gray-100 px-3 py-2 rounded-lg">...</div>
                </div>
              )}

              {resp && !loading && (
                <div className="flex justify-start gap-2">
                  <img src="/image/hsbs_dog_avatar_4.png" alt="HSBS Dog" className="w-8 h-8 rounded-full self-end" />
                  <div className="bg-gray-200 dark:bg-gray-100 px-3 py-2 rounded-lg whitespace-pre-wrap">
                    {displayedText}
                  </div>
                </div>
              )}

              {error && <div className="text-red-600">{String(error)}</div>}
            </div>

            {/* 푸터 입력창: 모바일 세이프에어리어 고려 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!prompt.trim()) return;
                run(prompt);
                setPrompt('');
              }}
              className="
                border-t flex gap-2 p-2
                pb-[calc(env(safe-area-inset-bottom,0)+8px)]  /* iOS 하단 안전영역 */
                bg-white dark:bg-[#121212]
              "
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="무엇이든 물어보세요..."
                className="
                  flex-1 border rounded px-3 py-2 text-sm resize-none
                  max-h-32 md:max-h-24
                "
                rows={2}
                maxLength={200}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                  }
                }}
              />
              <button
                type="submit"
                disabled={loading || (!isAdmin && remaining === 0) || !prompt.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
              >
                보내기
              </button>
            </form>
          </div>
        </>
      )}
    </>,
    document.body
  );
}
