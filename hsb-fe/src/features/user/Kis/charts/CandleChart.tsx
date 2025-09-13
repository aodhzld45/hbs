// src/features/Kis/charts/CandleChart.tsx
import React, { useMemo } from 'react';
import { Chart } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import './chartsSetup'; // 반드시 한 번만 임포트되어야 함
import type { CandleDto } from '../types';

type Props = {
  data: CandleDto[];
  title?: string;
};

type CandlePoint = { x: number; o: number; h: number; l: number; c: number };

function toTs(ymd: string): number {
  return new Date(ymd + 'T00:00:00').getTime();
}

export default function CandleChart({ data, title }: Props) {
  const chartData = useMemo<ChartData<'candlestick', CandlePoint[]>>(() => {
    const rows: CandlePoint[] = (data ?? [])
      .map(d => ({
        x: toTs(d.date),
        o: d.open,
        h: d.high,
        l: d.low,
        c: d.close,
     }))
     .sort((a,b) => a.x - b.x); // 오름차순 정렬(필수)

    
    return {
      datasets: [{
        label: title ?? 'Candles',
        data: rows,
        borderWidth: 1,
      }],
    };
  }, [data, title]);

  const options = useMemo<ChartOptions<'candlestick'>>(() => ({
    parsing: false,
    responsive: true,
    maintainAspectRatio: false,
    normalized: true,
    layout: { padding: { right: 8 } },

    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(ctx) {
            const v = ctx.raw as CandlePoint;
            return `O:${v.o.toLocaleString()} H:${v.h.toLocaleString()} L:${v.l.toLocaleString()} C:${v.c.toLocaleString()}`;
          },
        },
      },
      // 전역 datalabels 플러그인 무력화 (차트 위 숫자 제거)
      datalabels: { display: false },
    },
 

    scales: {
      x: {
        type: 'time',
        time: { unit: 'day', tooltipFormat: 'yyyy-MM-dd' },
        ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
        grid: { display: false },
     },

      y: { type: 'linear', position: 'right', ticks: { callback: v => Number(v).toLocaleString() }, grace: '5%' },
    },
  }), []);

  return (
    <div className="w-full h-80">
      <Chart<'candlestick', CandlePoint[]> type="candlestick" data={chartData} options={options} />
    </div>
  );
}
