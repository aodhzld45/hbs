import api, { okOrThrow } from "../../../../../services/api";
import type {
  MessageFeedbackListResponse,
  MessageFeedbackQuery,
  MessageFeedbackSummaryResponse,
  MessageFeedbackTopQuestionResponse,
} from "../types/MessageFeedbackConfig";

const BASE = "/admin/ai/message-feedback";

const buildParams = (query: MessageFeedbackQuery = {}) => {
  const params: Record<string, string | number> = {};

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    params[key] = value as string | number;
  });

  return params;
};

export const fetchMessageFeedbackList = async (
  query: MessageFeedbackQuery
): Promise<MessageFeedbackListResponse> => {
  return okOrThrow(api.get<MessageFeedbackListResponse>(BASE, { params: buildParams(query) }));
};

export const fetchMessageFeedbackSummary = async (
  query: MessageFeedbackQuery
): Promise<MessageFeedbackSummaryResponse> => {
  return okOrThrow(api.get<MessageFeedbackSummaryResponse>(`${BASE}/summary`, { params: buildParams(query) }));
};

export const fetchMessageFeedbackTopDisliked = async (
  query: MessageFeedbackQuery
): Promise<MessageFeedbackTopQuestionResponse[]> => {
  return okOrThrow(api.get<MessageFeedbackTopQuestionResponse[]>(`${BASE}/top-disliked`, {
    params: buildParams(query),
  }));
};
