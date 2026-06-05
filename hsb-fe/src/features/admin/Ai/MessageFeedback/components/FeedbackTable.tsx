import React from "react";
import Pagination from "../../../../../components/Common/Pagination";
import type { MessageFeedbackResponse, MessageFeedbackType } from "../types/MessageFeedbackConfig";

type Props = {
  items: MessageFeedbackResponse[];
  loading?: boolean;
  error?: string | null;
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onSelect: (item: MessageFeedbackResponse) => void;
};

const badgeStyle: Record<MessageFeedbackType, string> = {
  LIKE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DISLIKE: "bg-red-50 text-red-700 border-red-200",
};

const badgeLabel: Record<MessageFeedbackType, string> = {
  LIKE: "좋아요",
  DISLIKE: "싫어요",
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  return value.replace("T", " ").slice(0, 16);
};

const clip = (value?: string | null, max = 80) => {
  if (!value) {
    return "-";
  }
  return value.length > max ? `${value.slice(0, max)}...` : value;
};

const FeedbackTable: React.FC<Props> = ({
  items,
  loading = false,
  error,
  page,
  size,
  totalCount,
  totalPages,
  onPageChange,
  onSizeChange,
  onSelect,
}) => {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-800">최근 피드백 목록</h3>
          <p className="mt-1 text-xs text-gray-500">행을 클릭하면 질문/답변 전문을 확인할 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>전체 {totalCount.toLocaleString()}건</span>
          <select
            className="rounded border border-gray-300 px-1 py-0.5 text-xs"
            value={size}
            onChange={(event) => onSizeChange(Number(event.target.value))}
          >
            {[10, 20, 50, 100].map((option) => (
              <option key={option} value={option}>{option}개씩</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-2 rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b bg-gray-50 text-[11px] uppercase text-gray-500">
              <th className="px-3 py-2">등록일</th>
              <th className="px-3 py-2">siteKey</th>
              <th className="px-3 py-2">피드백</th>
              <th className="px-3 py-2">질문</th>
              <th className="px-3 py-2">답변</th>
              <th className="px-3 py-2">사유</th>
              <th className="px-3 py-2">clientHost</th>
              <th className="px-3 py-2">userIp</th>
              <th className="px-3 py-2">usageLogId</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-xs text-gray-500">
                  피드백 데이터를 불러오는 중입니다...
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-xs text-gray-400">
                  조회된 피드백이 없습니다.
                </td>
              </tr>
            )}

            {!loading && items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelect(item)}
                className="cursor-pointer border-b last:border-0 hover:bg-blue-50/40"
              >
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">{formatDateTime(item.regDate)}</td>
                <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-800">{item.siteKey ?? "-"}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeStyle[item.feedbackType]}`}>
                    {badgeLabel[item.feedbackType]}
                  </span>
                </td>
                <td className="min-w-[220px] px-3 py-2 text-gray-700">{clip(item.questionText)}</td>
                <td className="min-w-[260px] px-3 py-2 text-gray-600">{clip(item.answerText, 100)}</td>
                <td className="min-w-[120px] px-3 py-2 text-gray-500">{clip(item.feedbackReason, 50)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">{item.clientHost ?? "-"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">{item.userIp ?? "-"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">{item.usageLogId ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};

export default FeedbackTable;
