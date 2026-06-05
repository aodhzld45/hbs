import React, { useEffect, useMemo, useState } from "react";
import { fetchSiteKeyList } from "../../AdminSiteKeys/services/siteKeyApi";
import type { SiteKeySummary } from "../../AdminSiteKeys/types/siteKey";
import type { MessageFeedbackFilterState, MessageFeedbackType } from "../types/MessageFeedbackConfig";

type Props = {
  filters: MessageFeedbackFilterState;
  loading?: boolean;
  onChangeFilters: (partial: Partial<MessageFeedbackFilterState>) => void;
  onSearch: () => void;
};

const feedbackOptions: Array<{ value: "" | MessageFeedbackType; label: string }> = [
  { value: "", label: "전체" },
  { value: "LIKE", label: "좋아요" },
  { value: "DISLIKE", label: "싫어요" },
];

const FeedbackFiltersBar: React.FC<Props> = ({
  filters,
  loading = false,
  onChangeFilters,
  onSearch,
}) => {
  const [siteKeys, setSiteKeys] = useState<SiteKeySummary[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingKeys(true);
        const res = await fetchSiteKeyList({
          keyword: "",
          planCode: "",
          status: "ACTIVE",
          page: 0,
          size: 200,
          sort: "regDate,desc",
        });
        setSiteKeys(res.content ?? []);
      } catch (e) {
        console.error("[FeedbackFiltersBar] site key load error", e);
        setSiteKeys([]);
      } finally {
        setLoadingKeys(false);
      }
    })();
  }, []);

  const siteKeyOptions = useMemo(
    () =>
      siteKeys.map((siteKey) => ({
        value: siteKey.id,
        label: `[${siteKey.id}] ${siteKey.siteKey} (${siteKey.planCode ?? "-"}, ${siteKey.status})`,
      })),
    [siteKeys]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onChangeFilters({ [name]: value } as Partial<MessageFeedbackFilterState>);
  };

  const handleSiteKeyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChangeFilters({ siteKeyId: value === "" ? undefined : Number(value) });
  };

  const handleFeedbackTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeFilters({ feedbackType: event.target.value as "" | MessageFeedbackType });
  };

  return (
    <div className="mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-gray-600">시작일</label>
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate ?? ""}
            onChange={handleInputChange}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-gray-600">종료일</label>
          <input
            type="date"
            name="toDate"
            value={filters.toDate ?? ""}
            onChange={handleInputChange}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>

        <div className="flex min-w-[220px] flex-col">
          <label className="mb-1 text-xs font-medium text-gray-600">siteKey</label>
          <select
            value={filters.siteKeyId ?? ""}
            onChange={handleSiteKeyChange}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
            disabled={loadingKeys}
          >
            <option value="">전체 siteKey</option>
            {siteKeyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-[120px] flex-col">
          <label className="mb-1 text-xs font-medium text-gray-600">피드백</label>
          <select
            value={filters.feedbackType ?? ""}
            onChange={handleFeedbackTypeChange}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {feedbackOptions.map((option) => (
              <option key={option.value || "ALL"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-[220px] flex-col">
          <label className="mb-1 text-xs font-medium text-gray-600">질문/답변 검색</label>
          <input
            type="search"
            name="keyword"
            value={filters.keyword ?? ""}
            onChange={handleInputChange}
            placeholder="키워드"
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>

        <div className="flex min-w-[180px] flex-col">
          <label className="mb-1 text-xs font-medium text-gray-600">clientHost</label>
          <input
            type="search"
            name="clientHost"
            value={filters.clientHost ?? ""}
            onChange={handleInputChange}
            placeholder="예: hsbs.kr"
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>

        <div className="ml-auto flex items-end">
          <button
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "조회 중..." : "조회"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackFiltersBar;
