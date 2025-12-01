// PreviewPanel.tsx
import React, { useState } from 'react';
import type { WidgetConfigRequest } from '../types/widgetConfig';

type Props = { cfg: Partial<WidgetConfigRequest> };

export default function PreviewPanel({ cfg }: Props) {
  // ===== CSS 변수 세팅(상위에서 내려준 값만 사용) =====
  const style: React.CSSProperties = {
    ['--hsbs-primary' as any]: cfg.primaryColor || '#2563eb',
    ['--hsbs-panel-bg' as any]: cfg.panelBgColor || '#111827',
    ['--hsbs-panel-fg' as any]: cfg.panelTextColor || '#e5e7eb',
    ['--hsbs-header-bg' as any]: cfg.headerBgColor || '#0b0f1a',
    ['--hsbs-header-border' as any]: cfg.headerBorderColor || '#14e1ff',
    ['--hsbs-input-bg' as any]: cfg.inputBgColor || '#000000',
    ['--hsbs-input-fg' as any]: cfg.inputTextColor || '#e5e7eb',
    ['--hsbs-bubble-bg' as any]: cfg.bubbleBgColor || (cfg.primaryColor || '#2563eb'),
    ['--hsbs-bubble-fg' as any]: cfg.bubbleFgColor || '#ffffff',
  };

  // ===== 표시 텍스트 =====
  const title = cfg.panelTitle || 'HSBS Assistant';
  const welcome = cfg.welcomeText || '무엇을 도와드릴까요?';
  const placeholder = cfg.inputPlaceholder || '질문을 입력하세요…';
  const sendLabel = cfg.sendButtonLabel || '보내기';

  // ===== 아이콘/로고 우선순위: url → 실패시 이모지 → 실패시 이니셜 =====
  const bubbleEmoji = (cfg.bubbleIconEmoji && cfg.bubbleIconEmoji.trim()) || '💬';

  const [bubbleImgOk, setBubbleImgOk] = useState(true);
  const [logoImgOk, setLogoImgOk] = useState(true);

  const bubbleImg = cfg.bubbleIconUrl?.trim();
  const logoImg = cfg.logoUrl?.trim();

  const CircleAvatar: React.FC<{
    size?: number;
    img?: string | null | undefined;
    imgOk: boolean;
    onImgError: () => void;
    emoji?: string;
    initial?: string;
    className?: string;
    title?: string;
  }> = ({ size = 40, img, imgOk, onImgError, emoji, initial, className, title }) => {
    const px = `${size}px`;
    return (
      <div
        className={`flex items-center justify-center rounded-full border shadow bg-white/90 overflow-hidden ${className || ''}`}
        style={{ width: px, height: px }}
        title={title}
      >
        {img && imgOk ? (
          <img
            src={img}
            alt={title || 'icon'}
            className="w-full h-full object-contain"
            onError={onImgError}
            draggable={false}
          />
        ) : emoji ? (
          <span className="text-xl leading-none select-none">{emoji}</span>
        ) : (
          <span className="text-sm font-semibold text-gray-700 select-none">
            {initial ?? 'H'}
          </span>
        )}
      </div>
    );
  };

  // ===== 패널 폭/높이 적용(미리보기 용) =====
  const panelWidthPx = cfg.panelWidthPx ?? 360;
  const panelHeightPx = 420; // 고정 높이 안에서만 스크롤 되도록

  return (
    <div className="border rounded p-3">
      <div className="text-sm mb-2">미리보기</div>

      {/* 패널 + 버블을 같이 감싸는 래퍼 */}
      <div style={style} className="inline-block">
        {/* 실제 패널 - 여기서 relative 추가 */}
        <div
          className="relative rounded-2xl shadow-lg border overflow-hidden bg-[var(--hsbs-panel-bg)] text-[var(--hsbs-panel-fg)] flex flex-col"
          style={{ width: panelWidthPx, height: panelHeightPx }}
        >
          {/* 헤더 */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{
              background: 'var(--hsbs-header-bg)',
              borderColor: 'var(--hsbs-header-border)',
            }}
          >
            <CircleAvatar
              size={32}
              img={logoImg}
              imgOk={logoImgOk}
              onImgError={() => setLogoImgOk(false)}
              emoji={bubbleEmoji}
              title="브랜드 로고"
              className="bg-[var(--hsbs-panel-bg)]"
            />
            <div className="truncate text-base font-semibold">{title}</div>
          </div>

          {/* 본문(웰컴 메시지 영역) - 여기만 스크롤 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 text-sm whitespace-pre-wrap">
            {welcome}
          </div>

          {/* 푸터(입력창 + 버튼) - 오른쪽 padding 을 버블만큼 확보 */}
          <div
            className="px-4 py-3 border-t pr-20"
            style={{
              background: 'var(--hsbs-header-bg)',
              borderColor: 'var(--hsbs-header-border)',
            }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2 border"
              style={{
                background: 'var(--hsbs-input-bg)',
                borderColor: 'var(--hsbs-header-border)',
                color: 'var(--hsbs-input-fg)',
              }}
            >
              <input
                className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-60"
                placeholder={placeholder}
                disabled
              />
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md shadow-sm disabled:opacity-70 border"
                style={{
                  background: 'var(--hsbs-primary)',
                  color: '#fff',
                  borderColor: 'transparent',
                }}
                disabled
              >
                {sendLabel}
              </button>
            </div>
          </div>

          {/* 버블 버튼 - 패널 안쪽, 푸터 위에 겹쳐서 항상 노출 */}
          <button
            className="absolute right-4 bottom-4 w-14 h-14 rounded-full shadow-lg border flex items-center justify-center"
            style={{
              background: 'var(--hsbs-bubble-bg)',
              color: 'var(--hsbs-bubble-fg)',
            }}
            aria-label="Bubble"
            type="button"
            disabled
          >
            <div className="w-10 h-10">
              <CircleAvatar
                size={40}
                img={bubbleImg}
                imgOk={bubbleImgOk}
                onImgError={() => setBubbleImgOk(false)}
                emoji={bubbleEmoji}
                title="채팅 아이콘"
                className="border-0 shadow-none bg-transparent"
              />
            </div>
          </button>
        </div>
      </div>

      {/* 위치 오프셋 가이드 */}
      <p className="mt-2 text-xs text-gray-500">
        * 실제 배치: position <b>{cfg.position ?? 'right'}</b>, offsetX{' '}
        <b>{cfg.offsetX ?? 20}</b>, offsetY <b>{cfg.offsetY ?? 20}</b>
      </p>
    </div>
  );
}
