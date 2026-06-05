export type MessageFeedbackType = "LIKE" | "DISLIKE";

export interface MessageFeedbackResponse {
  id: number;
  tenantId?: string | null;
  siteKeyId?: number | null;
  siteKey?: string | null;
  usageLogId?: number | null;
  conversationId?: string | null;
  messageId?: string | null;
  questionText?: string | null;
  answerText?: string | null;
  feedbackType: MessageFeedbackType;
  feedbackReason?: string | null;
  clientHost?: string | null;
  userIp?: string | null;
  userAgent?: string | null;
  regDate?: string | null;
  upDate?: string | null;
}

export interface MessageFeedbackListResponse {
  items: MessageFeedbackResponse[];
  totalCount: number;
  totalPages: number;
}

export interface MessageFeedbackSummaryResponse {
  totalCount: number;
  likeCount: number;
  dislikeCount: number;
  dislikeRate: number;
  recent24hDislikeCount: number;
}

export interface MessageFeedbackTopQuestionResponse {
  questionText: string;
  answerText?: string | null;
  dislikeCount: number;
  lastFeedbackAt?: string | null;
}

export interface MessageFeedbackQuery {
  tenantId?: string;
  fromDate?: string;
  toDate?: string;
  siteKeyId?: number;
  feedbackType?: "" | MessageFeedbackType;
  keyword?: string;
  clientHost?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface MessageFeedbackFilterState {
  tenantId?: string;
  fromDate?: string;
  toDate?: string;
  siteKeyId?: number;
  feedbackType?: "" | MessageFeedbackType;
  keyword?: string;
  clientHost?: string;
}
