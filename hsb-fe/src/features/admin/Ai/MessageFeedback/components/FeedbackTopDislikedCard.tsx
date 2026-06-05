import React from "react";
import type { MessageFeedbackTopQuestionResponse } from "../types/MessageFeedbackConfig";

type Props = {
  items: MessageFeedbackTopQuestionResponse[];
  loading?: boolean;
};

const clip = (value?: string | null, max = 120) => {
  if (!value) {
    return "-";
  }
  return value.length > max ? `${value.slice(0, max)}...` : value;
};

const FeedbackTopDislikedCard: React.FC<Props> = ({ items, loading = false }) => {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">싫어요 많은 질문 TOP 10</h3>
        <span className="text-xs text-gray-500">답변 개선 우선순위</span>
      </div>

      {loading && (
        <div className="py-6 text-center text-xs text-gray-500">통계를 불러오는 중입니다...</div>
      )}

      {!loading && items.length === 0 && (
        <div className="py-6 text-center text-xs text-gray-400">조회된 싫어요 피드백이 없습니다.</div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={`${item.questionText}-${index}`} className="rounded border border-gray-100 bg-gray-50 p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-gray-500">#{index + 1}</span>
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                  싫어요 {item.dislikeCount.toLocaleString()}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-800">{clip(item.questionText, 150)}</div>
              <div className="mt-1 text-xs text-gray-500">{clip(item.answerText, 180)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackTopDislikedCard;
