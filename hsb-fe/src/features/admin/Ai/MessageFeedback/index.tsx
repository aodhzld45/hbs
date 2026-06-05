import React, { useState } from "react";
import AdminLayout from "../../../../components/Layout/AdminLayout";
import { useCurrentPageTitle } from "../../Common/hooks/useCurrentPageTitle";
import FeedbackDetailModal from "./components/FeedbackDetailModal";
import FeedbackFiltersBar from "./components/FeedbackFiltersBar";
import FeedbackSummaryCards from "./components/FeedbackSummaryCards";
import FeedbackTable from "./components/FeedbackTable";
import FeedbackTopDislikedCard from "./components/FeedbackTopDislikedCard";
import useMessageFeedback from "./hooks/useMessageFeedback";
import type { MessageFeedbackResponse } from "./types/MessageFeedbackConfig";

export default function AdminMessageFeedback() {
  const currentMenuTitle = useCurrentPageTitle();
  const [selected, setSelected] = useState<MessageFeedbackResponse | null>(null);

  const {
    filters,
    items,
    summary,
    topDisliked,
    totalCount,
    totalPages,
    page,
    size,
    loading,
    error,
    updateFilters,
    reload,
    setPage,
    setSize,
  } = useMessageFeedback();

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentMenuTitle || "AI 피드백 분석"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              좋아요/싫어요 피드백으로 나쁜 답변과 개선 우선순위를 빠르게 확인합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            새로고침
          </button>
        </div>

        <FeedbackFiltersBar
          filters={filters}
          loading={loading}
          onChangeFilters={updateFilters}
          onSearch={reload}
        />

        <FeedbackSummaryCards summary={summary} loading={loading} />

        <div className="mb-4">
          <FeedbackTopDislikedCard items={topDisliked} loading={loading} />
        </div>

        <FeedbackTable
          items={items}
          loading={loading}
          error={error}
          page={page}
          size={size}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onSizeChange={setSize}
          onSelect={setSelected}
        />

        <FeedbackDetailModal item={selected} onClose={() => setSelected(null)} />
      </div>
    </AdminLayout>
  );
}
