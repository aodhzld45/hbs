import React from "react";
import type { TopQuestionItem } from "../services/usageStatsApi";

type Props = {
  items: TopQuestionItem[];
  loading?: boolean;
  error?: string | null;
};

const TopQuestionsCard: React.FC<Props> = ({
  items,
  loading = false,
  error = null,
}) => {
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <h3 className="text-lg font-bold mb-3">가장 많이 물어본 질문 TOP 20</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <h3 className="text-lg font-bold mb-3">가장 많이 물어본 질문 TOP 20</h3>
      {loading ? (
        <p className="text-gray-500 text-sm">조회 중...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm">해당 기간에 질문 데이터가 없습니다.</p>
      ) : (
        <ol className="list-decimal list-inside space-y-2 text-sm">
          {items.map((item, index) => (
            <li
              key={`${index}-${item.question?.slice(0, 30)}`}
              className="flex justify-between gap-2 border-b border-gray-100 pb-1 last:border-0"
            >
              <span className="text-gray-800 truncate flex-1" title={item.question}>
                {item.question || "(빈 질문)"}
              </span>
              <span className="text-gray-500 shrink-0 font-medium">
                {item.count.toLocaleString()}회
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default TopQuestionsCard;
