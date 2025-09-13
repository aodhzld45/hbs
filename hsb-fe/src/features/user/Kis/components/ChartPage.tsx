import { useKisDailyCandles } from "../hooks/useKisDailyCandles";
import CandleChart from "../charts/CandleChart";

type Props = {
  code?: string;
  from: string;
  to: string;
  period: "D" | "W" | "M" | "Y";
  adj?: "0" | "1";
};

export default function ChartPage({ code, from, to, period, adj = "0" }: Props) {
  const { data, loading, error } = useKisDailyCandles(code, from, to, period, adj);

  if (!code) return <p className="text-gray-500">종목을 선택하세요</p>;
  if (loading) return <p>불러오는 중...</p>;
  if (error)   return <p>에러: {String(error)}</p>;
  if (!data?.length) return <p>데이터 없음</p>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold dark:text-gray-300">
        {code} 차트 ({period})
      </h2>
      <CandleChart data={data} title={`${code} (${period})`} />
    </div>
  );
}
