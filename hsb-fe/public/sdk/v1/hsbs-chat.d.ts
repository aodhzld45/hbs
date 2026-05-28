export type HSBSMessageRole = "user" | "assistant";

export type HSBSErrorCode =
  | "SITE_KEY_MISSING"
  | "PING_FAILED"
  | "PING_ERROR"
  | "OFFLINE"
  | "WIDGET_CONFIG_LOAD_FAILED"
  | "CHAT_UNAUTHORIZED"
  | "CHAT_FORBIDDEN"
  | "CHAT_HTTP_ERROR"
  | "CHAT_SERVER_ERROR"
  | "CHAT_TIMEOUT"
  | "CHAT_NETWORK_ERROR"
  | "QUOTA_EXCEEDED";

export interface HSBSReadyEvent {
  siteKey: string;
  config: Record<string, unknown>;
  instance: HSBSWidgetInstance;
}

export interface HSBSOpenEvent {
  siteKey: string;
}

export interface HSBSCloseEvent {
  reason: "user" | "destroy";
  instance?: HSBSWidgetInstance;
}

export interface HSBSMessageEvent {
  role: HSBSMessageRole;
  text: string;
  raw?: unknown;
}

export interface HSBSErrorEvent {
  code: HSBSErrorCode;
  message: string;
  status?: number;
  detail?: string;
  error?: unknown;
  response?: Response;
}

export interface HSBSQuotaExceededEvent {
  message: string;
  status: 429;
  remaining?: string | null;
  siteKeyRemaining?: string | null;
  ipRemaining?: string | null;
  error?: HSBSErrorEvent;
}

export interface HSBSEventMap {
  ready: HSBSReadyEvent;
  open: HSBSOpenEvent;
  close: HSBSCloseEvent;
  message: HSBSMessageEvent;
  error: HSBSErrorEvent;
  quotaExceeded: HSBSQuotaExceededEvent;
}

export interface HSBSInitOptions {
  siteKey: string;
  apiBase?: string;
  theme?: "auto" | "light" | "dark" | string;
  debug?: boolean;
  options?: {
    sizePreset?: "compact" | "standard" | "large-portfolio" | string;
    desktopBubbleSizePx?: number;
    mobileBubbleSizePx?: number;
    desktopBubbleIconSizePx?: number;
    mobileBubbleIconSizePx?: number;
    desktopPanelWidthPx?: number;
    desktopPanelHeightPx?: number | null;
    mobileFullscreen?: boolean;
    retryMaxAttempts?: number;
    retryBaseDelayMs?: number;
    retryMaxDelayMs?: number;
    retryOnStatusCodes?: number[] | string;
    offlineMessage?: string;
    timeoutMessage?: string;
    networkErrorMessage?: string;
    quotaExceededMessage?: string;
    serverErrorMessage?: string;
    retryButtonLabel?: string;
    [key: string]: unknown;
  };
  pingTimeoutMs?: number;
  configTimeoutMs?: number;
  completeTimeoutMs?: number;
  autoOpen?: boolean;
  position?: "left" | "right";
  onReady?: (event: HSBSReadyEvent) => void;
  onOpen?: (event: HSBSOpenEvent) => void;
  onClose?: (event: HSBSCloseEvent) => void;
  onMessage?: (event: HSBSMessageEvent) => void;
  onError?: (event: HSBSErrorEvent) => void;
  onQuotaExceeded?: (event: HSBSQuotaExceededEvent) => void;
}

export interface HSBSWidgetInstance {
  open: () => void;
  close: () => void;
  destroy: () => void;
  send: (message: string) => Promise<void>;
  root: HTMLElement;
  panel: HTMLElement;
  bubble: HTMLElement;
}

export interface HSBSGlobal {
  init: (options: HSBSInitOptions) => Promise<HSBSWidgetInstance | null>;
  destroy: () => void;
}

declare global {
  interface Window {
    HSBS?: HSBSGlobal;
  }

  interface Document {
    addEventListener<K extends keyof HSBSEventMap>(
      type: `hsbs:${K}`,
      listener: (event: CustomEvent<HSBSEventMap[K]>) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
  }
}
