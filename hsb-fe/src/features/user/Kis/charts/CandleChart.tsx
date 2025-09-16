// src/features/Kis/charts/CandleChart.tsx
import React, { useMemo, useRef } from 'react';
import { Chart } from 'react-chartjs-2';
import type { ChartData, ChartOptions, TooltipModel } from 'chart.js';
import './chartsSetup';
import type { CandleDto } from '../types';

type Props = { data: CandleDto[]; title?: string };
type CandlePoint = { x: number; o: number; h: number; l: number; c: number };

const COLOR = {
  open:  '#f59e0b', // 시가  : 주황
  high:  '#ef4444', // 고가  : 빨강
  low:   '#3b82f6', // 저가  : 파랑
  close: '#10b981', // 종가  : 초록
};

function toTs(ymd: string): number {
  return new Date(ymd + 'T00:00:00').getTime();
}

export default function CandleChart({ data, title }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo<ChartData<'candlestick', CandlePoint[]>>(() => {
    const rows: CandlePoint[] = (data ?? [])
      .map(d => ({ x: toTs(d.date), o: d.open, h: d.high, l: d.low, c: d.close }))
      .sort((a, b) => a.x - b.x);

    return { datasets: [{ label: title ?? 'Candles', data: rows, borderWidth: 1 }] };
  }, [data, title]);

  const options = useMemo<ChartOptions<'candlestick'>>(
    () => ({
      parsing: false,
      responsive: true,
      maintainAspectRatio: false,
      normalized: true,
      layout: { padding: { right: 8 } },
      plugins: {
        legend: { display: false },
        // ==== 커스텀 툴팁 ====
      tooltip: {
        enabled: false,
        external: (ctx) => {
          const { chart, tooltip } = ctx;

          // body 아래 전역 툴팁 엘리먼트
          let el = document.getElementById('candle-tooltip') as HTMLDivElement | null;
          if (!el) {
            el = document.createElement('div');
            el.id = 'candle-tooltip';
            el.style.cssText = [
              'position:fixed','z-index:9999','pointer-events:none',
              'background:rgba(0,0,0,.9)','color:#fff','font-size:12px',
              'padding:8px 10px','border-radius:8px','box-shadow:0 6px 20px rgba(0,0,0,.35)',
              'opacity:0','transition:opacity .06s ease'
            ].join(';');
            document.body.appendChild(el);
          }

          if (tooltip.opacity === 0) { el.style.opacity = '0'; return; }

          const dp = tooltip.dataPoints?.[0];
          if (!dp) return;
          const v = dp.raw as { o:number; h:number; l:number; c:number };
          el.innerHTML = `
            <div style="font-weight:700;margin-bottom:4px">${tooltip.title?.[0] ?? ''}</div>
            <div style="display:flex;gap:8px"><span style="color:#f59e0b">●</span>시가: ${v.o.toLocaleString('ko-KR')}</div>
            <div style="display:flex;gap:8px"><span style="color:#ef4444">●</span>고가: ${v.h.toLocaleString('ko-KR')}</div>
            <div style="display:flex;gap:8px"><span style="color:#3b82f6">●</span>저가: ${v.l.toLocaleString('ko-KR')}</div>
            <div style="display:flex;gap:8px"><span style="color:#10b981">●</span>종가: ${v.c.toLocaleString('ko-KR')}</div>
          `;

          // 차트 캔버스의 화면 좌표 + caret 오프셋
          const rect = chart.canvas.getBoundingClientRect();
          let x = rect.left + tooltip.caretX + 12;
          let y = rect.top  + tooltip.caretY + 12;

          // 화면 밖으로 나가지 않도록 클램프
          const pad = 8;
          requestAnimationFrame(() => {
            const w = el!.offsetWidth, h = el!.offsetHeight;
            x = Math.min(Math.max(pad, x), window.innerWidth  - w - pad);
            y = Math.min(Math.max(pad, y), window.innerHeight - h - pad);
            el!.style.left = `${x}px`;
            el!.style.top  = `${y}px`;
            el!.style.opacity = '1';
          });
        },
      },
        datalabels: { display: false },
      },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'day', tooltipFormat: 'yyyy-MM-dd' },
          ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
          grid: { display: false },
        },
        y: {
          type: 'linear',
          position: 'right',
          ticks: { callback: (v) => Number(v).toLocaleString('ko-KR') },
          grace: '5%',
        },
      },
    }),
    []
  );

  return (
    <div ref={wrapRef} className="relative w-full h-80">
      <Chart<'candlestick', CandlePoint[]>
        type="candlestick"
        data={chartData}
        options={options}
      />
    </div>
  );
}
