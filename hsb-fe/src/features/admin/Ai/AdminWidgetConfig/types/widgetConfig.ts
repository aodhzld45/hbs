export type WidgetConfig = {
  id: number;
  name: string;

  /* 이 위젯설정을 연결할 SiteKey ID */
  linkedSiteKeyId?: number | null;

  panelTitle?: string;
  welcomeText?: string;
  inputPlaceholder?: string;
  sendButtonLabel?: string;
  language?: string;

  position: 'right' | 'left';
  offsetX: number;
  offsetY: number;
  panelWidthPx: number;
  panelMaxHeightPx?: number | null;
  zIndex: number;

  bubbleBgColor?: string;
  bubbleFgColor?: string;
  panelBgColor?: string;
  panelTextColor?: string;
  headerBgColor?: string;
  headerBorderColor?: string;
  inputBgColor?: string;
  inputTextColor?: string;
  primaryColor?: string;

  bubbleIconEmoji?: string;
  bubbleIconUrl?: string;
  logoUrl?: string;

  openOnLoad: 'Y' | 'N';
  openDelayMs?: number | null;
  greetOncePerOpen: 'Y' | 'N';
  closeOnEsc: 'Y' | 'N';
  closeOnOutsideClick: 'Y' | 'N';

  options?: Record<string, unknown>;
  notes?: string;

  useTf?: string;
  delTf?: string;
  regDate?: string;
  upDate?: string;
}

export type WidgetConfigRequest = Omit<WidgetConfig, 'id'|'useTf'|'delTf'|'regDate'|'upDate'>;

export interface WidgetConfigListResponse {
  items: WidgetConfig[];
  totalCount: number;
  totalPages: number;
}



