import React from 'react';
import type { WidgetConfigRequest } from '../types/widgetConfig';

export default function PreviewPanel({ cfg }: { cfg: Partial<WidgetConfigRequest> }) {
  const style: React.CSSProperties = {
    ['--hsbs-primary' as any]: cfg.primaryColor || '#2563eb',
    ['--hsbs-panel-bg' as any]: cfg.panelBgColor || '#ffffff',
    ['--hsbs-panel-fg' as any]: cfg.panelTextColor || '#111827',
  };

  return (
    <div className="border rounded p-3">
      <div className="text-sm mb-2">미리보기</div>
      <div
        style={style}
        className="relative w-[340px] h-[480px] rounded-lg border shadow bg-[var(--hsbs-panel-bg)] text-[var(--hsbs-panel-fg)]"
      >
        <div className="p-2 border-b">{cfg.panelTitle || 'HSBS Assistant'}</div>
        <div className="p-3 text-sm opacity-80 whitespace-pre-wrap">
          {cfg.welcomeText || '무엇을 도와드릴까요?'}
        </div>
        <div className="absolute right-4 bottom-4">
          <button
            className="w-14 h-14 rounded-full shadow"
            style={{ background: 'var(--hsbs-primary)' }}
            aria-label="Bubble"
          />
        </div>
      </div>
    </div>
  );
}
