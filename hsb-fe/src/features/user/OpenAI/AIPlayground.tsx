import Layout from '../../../components/Layout/Layout';
import api from '../../../services/api';
import React, { useEffect, useRef, useState } from 'react';

type Resp = {
  model: string;
  text: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export default function AIPlayground() {
  const [system, setSystem] = useState("You are a helpful assistant.");
  const [context, setContext] = useState("");
  const [prompt, setPrompt] = useState("이 HSBS포트폴리오는 어떻게 구성되어 있나요?");
  const [model, setModel] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(600);

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<Resp | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 429 핸들링 상태
  const MAX_AUTO_RETRIES = 2;
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null); // 남은 초
  const [retryAttempts, setRetryAttempts] = useState(0);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const scheduleAutoRetry = (seconds = 3) => {
    // 이미 진행중이면 초기화
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setRetryCountdown(seconds);

    // 1초마다 카운트다운
    countdownIntervalRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 만료 시 자동 재시도
    countdownTimerRef.current = setTimeout(() => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setRetryCountdown(null);
      run(true); // auto=true
    }, seconds * 1000);
  };

  const cancelAutoRetry = () => {
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setRetryCountdown(null);
  };

  const run = async (auto = false) => {
    if (!prompt || prompt.trim().length === 0) {
      setError("프롬프트를 입력하세요.");
      return;
    }

    // 자동 재시도 시도 횟수 제한
    if (auto && retryAttempts >= MAX_AUTO_RETRIES) {
      return; // 더 이상 자동 재시도 안 함
    }

    cancelAutoRetry();
    setLoading(true);
    setResp(null);
    setError(null);

    try {
      const r = await api.post("/ai/complete", {
        system,
        context,
        prompt,
        model,
        temperature,
        maxTokens,
      });

      setResp(r.data);
      setRetryAttempts(0); // 성공 시 초기화
    } catch (err: any) {
      console.error("AI 요청 실패:", err);

      const status = err?.response?.status;
      if (status === 429) {
        // 429: 예산 한도/레이트리밋
        setError("예산 한도 또는 레이트리밋에 도달했습니다. 잠시 후 다시 시도해 주세요.");
        const nextAttempts = auto ? retryAttempts + 1 : retryAttempts;
        setRetryAttempts(nextAttempts);

        // 자동 재시도 예약 (최대 2회, 3초 카운트다운)
        if (nextAttempts < MAX_AUTO_RETRIES) {
          scheduleAutoRetry(3);
        }
      } else {
        // 그 외 에러는 서버 메시지 표시
        if (err.response?.data) {
          const data = err.response.data;
          setError(typeof data === "string" ? data : JSON.stringify(data));
        } else {
          setError(err.message || "요청 실패");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold dark:text-gray-100">AI Playground (OpenAI)</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-gray-100">Model</label>
            <input
              className="w-full border rounded p-2"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-100">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                className="w-full border rounded p-2"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-100">Max Tokens</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value || "0"))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-gray-100">System Prompt (optional)</label>
          <textarea
            className="w-full border rounded p-2 h-20"
            value={system}
            onChange={(e) => setSystem(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-gray-100">Context (optional)</label>
          <textarea
            className="w-full border rounded p-2 h-24"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="FAQ/정책 등 배경정보를 넣을 수 있어요"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-gray-100">Prompt</label>
          <textarea
            className="w-full border rounded p-2 h-28"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => run(false)}
            disabled={loading}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50 dark:text-gray-100"
          >
            {loading ? "생성 중..." : "생성하기"}
          </button>

          {/* 429용 재시도 UI */}
          {retryCountdown !== null && (
            <div className="text-sm text-yellow-600 dark:text-yellow-300">
              잠시 후 자동 재시도합니다… ({retryCountdown}s)
            </div>
          )}
          {error && (
            <button
              type="button"
              onClick={() => { cancelAutoRetry(); run(false); }}
              className="px-3 py-2 border rounded text-sm"
              disabled={loading}
              title="즉시 재시도"
            >
              지금 재시도
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 border rounded text-red-600 bg-red-50 dark:text-gray-100">
            {error}
          </div>
        )}

        {resp && (
          <div className="space-y-3">
            <div className="text-sm text-gray-500 dark:text-gray-100">
              Model: <b>{resp.model}</b> · tokens: in {resp.inputTokens ?? "-"} / out{" "}
              {resp.outputTokens ?? "-"} / total {resp.totalTokens ?? "-"}
            </div>
            <pre className="whitespace-pre-wrap border rounded p-3 bg-gray-50">
              {resp.text}
            </pre>
          </div>
        )}
      </div>
    </Layout>
  );
}
