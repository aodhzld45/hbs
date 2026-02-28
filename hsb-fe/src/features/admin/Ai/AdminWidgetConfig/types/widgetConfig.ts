export type WidgetConfig = {
  id: number;
  name: string;

  // 이 위젯설정을 연결할 SiteKey ID
  linkedSiteKeyId?: number | null;

  // 연결된 프롬프트 프로필
  welcomeBlocksJson?: string;

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

  /** 패널/버블 등 모서리 둥글기(px). 관리자에서 설정 가능 */
  panelBorderRadiusPx?: number | null;
  /** 버블 버튼 크기(px) */
  bubbleSizePx?: number | null;
  /** 입력창/전송 버튼 모서리 둥글기(px) */
  inputBorderRadiusPx?: number | null;
  sendButtonRadiusPx?: number | null;

  /** 타이포: 전체 폰트 패밀리 */
  fontFamily?: string | null;
  /** 기본 글자 크기(px) */
  fontSizeBasePx?: number | null;
  /** 헤더 타이틀 글자 크기(px) */
  headerFontSizePx?: number | null;

  /** 패널 box-shadow (CSS 값 문자열) */
  boxShadow?: string | null;
  /** 버블 버튼 box-shadow */
  bubbleBoxShadow?: string | null;
  /** 전송 버튼 표시: 텍스트 | 아이콘 | 아이콘+텍스트 */
  sendButtonStyle?: 'text' | 'icon' | 'icon-text' | null;

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

  options?: Record<string, null>;
  welcomeQuickRepliesJson?: string | null;

  notes?: string;

  useTf?: string;
  delTf?: string;
  regDate?: string;
  upDate?: string;
}

export type QuickReplyRow = {
  id: number;        // React key용 로컬 id
  label: string;
  payload: string;
  order: number;
};

export type WidgetConfigRequest = Omit<WidgetConfig, 'id'|'useTf'|'delTf'|'regDate'|'upDate'>;

export interface WidgetConfigListResponse {
  items: WidgetConfig[];
  totalCount: number;
  totalPages: number;
}



