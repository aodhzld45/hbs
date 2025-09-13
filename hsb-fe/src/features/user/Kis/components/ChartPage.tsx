import { useKisDailyCandles } from "../hooks/useKisDailyCandles";

export default function ChartPage() {
  const { data, loading, error } = useKisDailyCandles(
    "005930",
    "2025-09-01",
    "2025-09-12",
    "D",
    "0"
  );

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p>에러: {String(error)}</p>;

  return (
    <div>
      <h2>삼성전자 캔들 데이터</h2>
      <pre>{JSON.stringify(data.slice(0, 3), null, 2)}</pre>
    </div>
  );
}
