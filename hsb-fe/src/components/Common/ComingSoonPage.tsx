import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {format} from 'date-fns'
// import Layout from '../../components/Layout/Layout';

type NoticeType = 'MAINTENANCE' | 'COMING_SOON' | 'NOTICE';

type Props = {
  type?: NoticeType;
  title?: string;
  description?: string;
  expectedEndAt?: string; // ISO string
  helpText?: string;
  helpHref?: string;
};

function formatRemaining(ms: number) {
  if (ms <= 0) return '곧 정상화됩니다.';
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h}시간`);
  if (m) parts.push(`${m}분`);
  parts.push(`${s}초`);
  return parts.join(' ');
}

export default function ComingSoonPage({
  type = 'MAINTENANCE',
  title,
  description,
  expectedEndAt,
  helpText,
  helpHref,
}: Props) {
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());

  const meta = useMemo(() => {
    if (type === 'COMING_SOON') {
      return { emoji: '🛠️', badge: '서비스 준비중 안내' };
    }
    if (type === 'NOTICE') {
      return { emoji: '📢', badge: '안내' };
    }
    return { emoji: '⚠️', badge: '시스템 점검 안내' };
  }, [type]);

  const endMs = expectedEndAt ? new Date(expectedEndAt).getTime() : null;
  const remainingMs = endMs ? endMs - now : null;

  useEffect(() => {
    if (!endMs) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endMs]);

  return (
      <div
        className="
          min-h-screen flex items-center justify-center px-4
          bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200
          text-slate-900
          dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
          dark:text-slate-100
        "
      >
        <div
          className="
            w-full max-w-lg
            rounded-3xl border border-slate-200 bg-white/80 shadow-xl
            dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/40
            backdrop-blur
            px-8 py-10
          "
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            <span className="text-lg">{meta.emoji}</span>
            <span>{meta.badge}</span>
          </div>

          <h1 className="mt-6 text-2xl md:text-3xl font-bold tracking-tight">
            {title ?? (type === 'MAINTENANCE' ? '현재 시스템 점검 중입니다.' : '현재 페이지는 준비중입니다.')}
          </h1>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {description ?? '잠시 후 다시 이용해주세요.'}
          </p>

          {endMs && (
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <p className="font-semibold text-slate-700 dark:text-slate-100">예상 시간</p>
              <p className="mt-1">{endMs ? format(new Date(endMs), 'yyyy-MM-dd HH:mm:ss') : '-'}</p>

              <p className="mt-1">
                남은 시간:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-100">
                  {formatRemaining(remainingMs ?? 0)}
                </span>
              </p>
            </div>
          )}

          {(helpText || helpHref) && (
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              {helpHref ? (
                <a
                  href={helpHref}
                  className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
                >
                  {helpText ?? '자세히 보기'}
                </a>
              ) : (
                <p>{helpText}</p>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                inline-flex items-center justify-center
                rounded-xl border border-slate-300 bg-white/70 px-4 py-2.5 text-sm font-medium
                text-slate-700 shadow-sm
                hover:bg-slate-100 hover:border-slate-400
                dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100
                dark:hover:bg-slate-800 dark:hover:border-slate-500
                transition-colors
              "
            >
              ← 이전 페이지
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="
                inline-flex items-center justify-center
                rounded-xl px-4 py-2.5 text-sm font-semibold
                bg-indigo-600 text-white shadow-md
                hover:bg-indigo-500
                dark:bg-indigo-500 dark:hover:bg-indigo-400
                transition-colors
              "
            >
              메인으로 이동
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="
                inline-flex items-center justify-center
                rounded-xl border border-slate-300 bg-white/70 px-4 py-2.5 text-sm font-semibold
                text-slate-700 shadow-sm
                hover:bg-slate-100 hover:border-slate-400
                dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100
                dark:hover:bg-slate-800 dark:hover:border-slate-500
                transition-colors
              "
            >
              ⟳ 새로고침
            </button>
          </div>
        </div>
      </div>
  );
}
