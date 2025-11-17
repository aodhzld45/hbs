// src/pages/ComingSoonPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';

export default function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <Layout>
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
          {/* 상단 라벨 */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            <span className="text-lg">⚠️</span>
            <span>서비스 준비중 안내</span>
          </div>

          {/* 제목 / 설명 */}
          <h1 className="mt-6 text-2xl md:text-3xl font-bold tracking-tight">
            현재 페이지는 준비중입니다.
          </h1>

          {/* 작은 추가 안내 */}
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <p>
              주소창에 직접 입력하여 접근하신 경우, 메뉴 상태에 따라
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {' '}일시적으로 제한
              </span>
              될 수 있습니다.
            </p>
          </div>

          {/* 버튼 영역 */}
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
          </div>
        </div>
      </div>
    </Layout>
  );
}
