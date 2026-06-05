import { useCallback, useEffect, useState } from "react";
import {
  fetchMessageFeedbackList,
  fetchMessageFeedbackSummary,
  fetchMessageFeedbackTopDisliked,
} from "../services/messageFeedbackApi";
import type {
  MessageFeedbackFilterState,
  MessageFeedbackQuery,
  MessageFeedbackResponse,
  MessageFeedbackSummaryResponse,
  MessageFeedbackTopQuestionResponse,
} from "../types/MessageFeedbackConfig";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const defaultRange = () => {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 6);
  return {
    fromDate: formatDate(from),
    toDate: formatDate(today),
  };
};

const EMPTY_SUMMARY: MessageFeedbackSummaryResponse = {
  totalCount: 0,
  likeCount: 0,
  dislikeCount: 0,
  dislikeRate: 0,
  recent24hDislikeCount: 0,
};

export function useMessageFeedback() {
  const range = defaultRange();
  const [filters, setFilters] = useState<MessageFeedbackFilterState>({
    fromDate: range.fromDate,
    toDate: range.toDate,
    feedbackType: "",
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [items, setItems] = useState<MessageFeedbackResponse[]>([]);
  const [summary, setSummary] = useState<MessageFeedbackSummaryResponse>(EMPTY_SUMMARY);
  const [topDisliked, setTopDisliked] = useState<MessageFeedbackTopQuestionResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback((override?: Partial<{ page: number; size: number }>): MessageFeedbackQuery => ({
    ...filters,
    page: override?.page ?? page,
    size: override?.size ?? size,
    sort: "regDate,desc",
  }), [filters, page, size]);

  const load = useCallback(async (override?: Partial<{ page: number; size: number }>) => {
    setLoading(true);
    setError(null);
    const query = buildQuery(override);
    const statsQuery = { ...query, page: undefined, size: undefined, sort: undefined };

    try {
      const [listRes, summaryRes, topRes] = await Promise.all([
        fetchMessageFeedbackList(query),
        fetchMessageFeedbackSummary(statsQuery),
        fetchMessageFeedbackTopDisliked(statsQuery),
      ]);
      setItems(listRes.items ?? []);
      setTotalCount(listRes.totalCount ?? 0);
      setTotalPages(listRes.totalPages ?? 0);
      setSummary(summaryRes ?? EMPTY_SUMMARY);
      setTopDisliked(topRes ?? []);
    } catch (e: any) {
      console.error("[useMessageFeedback] fetch error", e);
      setError(e?.message ?? "AI 메시지 피드백 조회 중 오류가 발생했습니다.");
      setItems([]);
      setSummary(EMPTY_SUMMARY);
      setTopDisliked([]);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const updateFilters = useCallback((partial: Partial<MessageFeedbackFilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...partial,
    }));
    setPage(0);
  }, []);

  const reload = useCallback(() => {
    load();
  }, [load]);

  const handleSetPage = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const handleSetSize = useCallback((nextSize: number) => {
    setSize(nextSize);
    setPage(0);
  }, []);

  return {
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
    setPage: handleSetPage,
    setSize: handleSetSize,
  };
}

export default useMessageFeedback;
