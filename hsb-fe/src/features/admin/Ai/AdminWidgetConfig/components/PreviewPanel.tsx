// PreviewPanel.tsx
import React, { useState } from 'react';
import type { WidgetConfigRequest } from '../types/widgetConfig';

type Props = { cfg: Partial<WidgetConfigRequest> };

export default function PreviewPanel({ cfg }: Props) {
  // ===== CSS 변수 세팅(상위에서 내려준 값만 사용) =====
  const style: React.CSSProperties = {
    ['--hsbs-primary' as any]: cfg.primaryColor || '#2563eb',
    ['--hsbs-panel-bg' as any]: cfg.panelBgColor || '#ffffff',
    ['--hsbs-panel-fg' as any]: cfg.panelTextColor || '#111827',
    ['--hsbs-header-bg' as any]: cfg.headerBgColor || '#f9fafb',
    ['--hsbs-header-border' as any]: cfg.headerBorderColor || '#e5e7eb',
    ['--hsbs-input-bg' as any]: cfg.inputBgColor || '#f3f4f6',
    ['--hsbs-input-fg' as any]: cfg.inputTextColor || '#111827',
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
          <span className="text-sm font-semibold text-gray-700 select-none">{initial ?? 'H'}</span>
        )}
      </div>
    );
  };

  // ===== 패널 폭/오프셋 적용(미리보기 용) =====
  const panelWidthPx = cfg.panelWidthPx ?? 340;

  return (
    <div className="border rounded p-3">
      <div className="text-sm mb-2">미리보기</div>

      <div
        style={style}
        className="relative rounded-lg border shadow bg-[var(--hsbs-panel-bg)] text-[var(--hsbs-panel-fg)]"
      >
        {/* 미리보기용 크기 */}
        <div style={{ width: panelWidthPx, height: 520 }}>
          {/* 헤더 */}
          <div
            className="p-2 border-b flex items-center gap-2"
            style={{ background: 'var(--hsbs-header-bg)', borderColor: 'var(--hsbs-header-border)' }}
          >
            <CircleAvatar
              size={28}
              img={logoImg}
              imgOk={logoImgOk}
              onImgError={() => setLogoImgOk(false)}
              emoji={bubbleEmoji}
              title="브랜드 로고"
              className="bg-[var(--hsbs-panel-bg)]"
            />
            <div className="truncate text-sm font-medium">{title}</div>
          </div>

          {/* 웰컴 영역 */}
          <div className="p-3 text-sm opacity-90 whitespace-pre-wrap">{welcome}</div>

          {/* 입력창 */}
          <div className="absolute left-0 right-0 bottom-20 px-3">
            <div
              className="flex items-center gap-2 border rounded-lg px-2 py-2"
              style={{ background: 'var(--hsbs-input-bg)', color: 'var(--hsbs-input-fg)' }}
            >
              <input
                className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-60"
                placeholder={placeholder}
                disabled
              />
              <button
                type="button"
                className="px-3 py-1 text-sm rounded-md border shadow-sm disabled:opacity-70"
                style={{ background: 'var(--hsbs-primary)', color: '#fff' }}
                disabled
              >
                {sendLabel}
              </button>
            </div>
          </div>

          {/* 버블 버튼 */}
          <div className="absolute right-4 bottom-4">
            <button
              className="w-14 h-14 rounded-full shadow border flex items-center justify-center"
              style={{ background: 'var(--hsbs-bubble-bg)', color: 'var(--hsbs-bubble-fg)' }}
              aria-label="Bubble"
              type="button"
              disabled
            >
              <div className="w-9 h-9">
                <CircleAvatar
                  size={36}
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
      </div>

      {/* 위치 오프셋 가이드(미리보기 툴팁) */}
      <p className="mt-2 text-xs text-gray-500">
        * 실제 배치: position <b>{cfg.position ?? 'right'}</b>, offsetX <b>{cfg.offsetX ?? 20}</b>, offsetY{' '}
        <b>{cfg.offsetY ?? 20}</b>
      </p>
    </div>
  );
}
