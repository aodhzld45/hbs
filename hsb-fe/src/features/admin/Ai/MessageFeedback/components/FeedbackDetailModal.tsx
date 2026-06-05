import React from "react";
import type { MessageFeedbackResponse } from "../types/MessageFeedbackConfig";

type Props = {
  item: MessageFeedbackResponse | null;
  onClose: () => void;
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  return value.replace("T", " ").slice(0, 19);
};

const Field: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="mb-1 text-[11px] font-semibold uppercase text-gray-500">{label}</div>
    <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-800">
      {value || "-"}
    </div>
  </div>
);

const TextBlock: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div>
    <div className="mb-1 text-[11px] font-semibold uppercase text-gray-500">{label}</div>
    <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-800">
      {value || "-"}
    </div>
  </div>
);

const FeedbackDetailModal: React.FC<Props> = ({ item, onClose }) => {
  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">피드백 상세</h3>
            <p className="mt-1 text-xs text-gray-500">messageId: {item.messageId ?? "-"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            닫기
          </button>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="siteKey" value={item.siteKey} />
          <Field label="feedbackType" value={item.feedbackType === "LIKE" ? "좋아요" : "싫어요"} />
          <Field label="regDate" value={formatDateTime(item.regDate)} />
          <Field label="clientHost" value={item.clientHost} />
          <Field label="userIp" value={item.userIp} />
          <Field label="usageLogId" value={item.usageLogId ?? "-"} />
        </div>

        <div className="space-y-4">
          <TextBlock label="질문 전문" value={item.questionText} />
          <TextBlock label="답변 전문" value={item.answerText} />
          <TextBlock label="피드백 사유" value={item.feedbackReason} />
          <TextBlock label="userAgent" value={item.userAgent} />
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetailModal;
