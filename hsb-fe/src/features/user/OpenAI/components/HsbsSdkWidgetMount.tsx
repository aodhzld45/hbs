import { useEffect } from 'react';

declare global {
  interface Window {
    HSBS?: {
      init: (options: Record<string, unknown>) => Promise<unknown>;
      destroy: () => void;
    };
  }
}

const SDK_SRC = '/sdk/v1/hsbs-chat.js';
const SDK_SCRIPT_ID = 'hsbs-chat-sdk-v1';
const SITE_KEY = process.env.REACT_APP_HSBS_SDK_SITE_KEY || 'HSBS-DEMO-FREE-01';
const API_BASE = normalizeApiBase(process.env.REACT_APP_HSBS_SDK_API_BASE || '/api');

function normalizeApiBase(value: string) {
  const trimmed = value.trim();
  return (trimmed || '/api').replace(/\/+$/, '');
}

export default function HsbsSdkWidgetMount() {
  useEffect(() => {
    let cancelled = false;

    const initWidget = async () => {
      if (cancelled || !window.HSBS?.init) return;
      await window.HSBS.init({
        siteKey: SITE_KEY,
        apiBase: API_BASE,
        debug: process.env.NODE_ENV !== 'production',
        options: {
          sizePreset: 'large-portfolio',
          desktopBubbleSizePx: 128,
          mobileBubbleSizePx: 80,
          desktopBubbleIconSizePx: 104,
          mobileBubbleIconSizePx: 64,
          desktopPanelWidthPx: 340,
          desktopPanelHeightPx: 480,
          mobileFullscreen: true,
        },
      });
    };

    const existing = document.getElementById(SDK_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.HSBS?.init) {
        initWidget();
      } else {
        existing.addEventListener('load', initWidget, { once: true });
      }
    } else {
      const script = document.createElement('script');
      script.id = SDK_SCRIPT_ID;
      script.src = SDK_SRC;
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      window.HSBS?.destroy?.();
    };
  }, []);

  return null;
}
