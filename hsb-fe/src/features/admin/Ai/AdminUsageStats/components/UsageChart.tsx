import React, {useState, useMemo} from 'react'

import { UsageStatsItem, Period } from "../types/usageStats";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
  } from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Chart.js에서 사용할 스케일/요소 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);
  
type Metric = "CALLS" | "LATENCY" | "TOKENS";
  
type props = {
    items: UsageStatsItem[];
    period: Period;
    loading: boolean;
};

const UsageChart: React.FC<props> = ({ items, period, loading = false }) => {
    const [metric, setMetric] = useState<Metric>("CALLS");

    // 그래프 데이터 변환
    const { labels, datasets } = useMemo(() => {
        const data = items
        .slice()
        .reverse() // 오래된 → 최신 순
        .map((it) => {
            const totalCalls = it.totalCalls ?? 0;
            const successCalls = it.successCalls ?? 0;
            const failCalls = it.failCalls ?? 0;
            const successRate =
            totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0;

            return {
            label: it.bucketLabel,
            totalCalls,
            successCalls,
            failCalls,
            successRate,
            avgLatencyMs: it.avgLatencyMs ?? 0,
            totalTokens: it.totalTokens ?? 0,
            totalPromptTokens: it.totalPromptTokens ?? 0,
            totalCompletionTokens: it.totalCompletionTokens ?? 0,
            };
        });

        const labels = data.map((d) => d.label);

        let datasets;

        if (metric === "CALLS") {
        datasets = [
            {
            label: "총 호출 수",
            data: data.map((d) => d.totalCalls),
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            tension: 0.25,
            },
            {
            label: "성공",
            data: data.map((d) => d.successCalls),
            borderColor: "#16a34a",
            backgroundColor: "rgba(22, 163, 74, 0.2)",
            tension: 0.25,
            },
            {
            label: "실패",
            data: data.map((d) => d.failCalls),
            borderColor: "#dc2626",
            backgroundColor: "rgba(220, 38, 38, 0.2)",
            tension: 0.25,
            },
        ];
        } else if (metric === "LATENCY") {
        datasets = [
            {
            label: "평균 응답 시간(ms)",
            data: data.map((d) => d.avgLatencyMs),
            borderColor: "#f97316",
            backgroundColor: "rgba(249, 115, 22, 0.2)",
            tension: 0.25,
            },
        ];
        } else {
        // TOKENS
        datasets = [
            {
            label: "총 토큰 수",
            data: data.map((d) => d.totalTokens),
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79, 70, 229, 0.2)",
            tension: 0.25,
            },
            {
            label: "입력 토큰",
            data: data.map((d) => d.totalPromptTokens),
            borderColor: "#0ea5e9",
            backgroundColor: "rgba(14, 165, 233, 0.2)",
            tension: 0.25,
            },
            {
            label: "출력 토큰",
            data: data.map((d) => d.totalCompletionTokens),
            borderColor: "#22c55e",
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            tension: 0.25,
            },
        ];
        }

        return { labels, datasets };
    }, [items, metric]);

    const periodLabel =
        period === "DAILY" ? "일별" : period === "WEEKLY" ? "주별" : "월별";

    const metricLabel =
        metric === "CALLS" ? "호출 수" : metric === "LATENCY" ? "응답 시간(ms)" : "토큰 수";

    const options = {
        responsive: true,
        maintainAspectRatio: false as const,
        plugins: {
        legend: {
            display: true,
            labels: {
            font: { size: 11 },
            },
        },
        tooltip: {
            callbacks: {
            label: (ctx: any) => {
                const label = ctx.dataset.label || "";
                const value = ctx.parsed.y;
                return `${label}: ${value.toLocaleString()}`;
            },
            },
        },
        },
        scales: {
        x: {
            ticks: {
            maxRotation: 45,
            minRotation: 0,
            font: { size: 10 },
            },
        },
        y: {
            ticks: {
            font: { size: 10 },
            callback: (value: any) =>
                Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 }),
            },
        },
        },
    };

    return (
        <div className="mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
            <div>
            <h2 className="text-base font-semibold text-gray-800">
                {periodLabel} 사용 추이 ({metricLabel})
            </h2>
            <p className="mt-1 text-xs text-gray-500">
                조회된 기간 동안의 일/주/월 버킷별 지표 변화 차트
            </p>
            </div>

            <div className="flex items-center gap-1 text-xs">
            <span className="mr-1 text-gray-500">지표:</span>
            <button
                type="button"
                onClick={() => setMetric("CALLS")}
                className={
                "rounded-full px-2 py-1 border " +
                (metric === "CALLS"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-gray-50 text-gray-700")
                }
            >
                호출 수
            </button>
            <button
                type="button"
                onClick={() => setMetric("LATENCY")}
                className={
                "rounded-full px-2 py-1 border " +
                (metric === "LATENCY"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-gray-50 text-gray-700")
                }
            >
                응답 시간
            </button>
            <button
                type="button"
                onClick={() => setMetric("TOKENS")}
                className={
                "rounded-full px-2 py-1 border " +
                (metric === "TOKENS"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-gray-50 text-gray-700")
                }
            >
                토큰 수
            </button>
            </div>
        </div>

        {loading && (
            <div className="py-8 text-center text-sm text-gray-500">
            차트 데이터를 불러오는 중입니다...
            </div>
        )}

        {!loading && labels.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">
            표시할 데이터가 없습니다.
            </div>
        )}

        {!loading && labels.length > 0 && (
            <div className="h-80">
            <Bar
                data={{ labels, datasets }}
                options={options}
            />
            </div>
        )}
        </div>
    );
    };

    export default UsageChart;