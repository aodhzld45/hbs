export type AiResp = {
  model: string;
  text: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type AiParams = {
  system: string;
  context: string;
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
};

export type ChatMsg = { role: 'user'|'assistant'|'system'; text: string };
