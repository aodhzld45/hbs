import React from "react";
import type { MessageFeedbackSummaryResponse } from "../types/MessageFeedbackConfig";

type Props = {
  summary: MessageFeedbackSummaryResponse;
  loading?: boolean;
};

const cards = [
  { key: "totalCount", label: "전체 피드백", tone: "text-gray-900" },
  { key: "likeCount", label: "좋아요", tone: "text-emerald-700" },
  { key: "dislikeCount", label: "싫어요", tone: "text-red-700" },
  { key: "dislikeRate", label: "싫어요 비율", tone: "text-orange-700", suffix: "%" },
  { key: "recent24hDislikeCount", label: "최근 24시간 싫어요", tone: "text-purple-700" },
] as const;

const FeedbackSummaryCards: React.FC<Props> = ({ summary, loading = false }) => {
  const formatValue = (key: keyof MessageFeedbackSummaryResponse, suffix?: string) => {
    const value = summary[key] ?? 0;
    if (suffix === "%") {
      return `${Number(value).toFixed(1)}%`;
    }
    return Number(value).toLocaleString();
  };

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-5">
      {cards.map((card) => (
        <div key={card.key} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">{card.label}</div>
          <div className={`mt-2 text-2xl font-semibold ${card.tone}`}>
            {loading ? "-" : formatValue(card.key, card.suffix)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedbackSummaryCards;
