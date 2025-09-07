// 날짜 관련 유틸 함수들
export function toYmd(input: unknown): string {
  if (input == null) return ""; // null/undefined
  // 이미 yyyy-mm-dd 형태면 그대로 사용
  if (typeof input === "string") {
    const s = input.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    if (/^\d{4}\d{2}\d{2}$/.test(s)) { // yyyyMMdd
      return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
    }
  }

  const d = parseToDate(input);
  if (!d) return ""; // 파싱 실패 시 빈 문자열(또는 "—")
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function parseToDate(v: unknown): Date | null {
  if (v instanceof Date && !isNaN(v.getTime())) return v;

  if (typeof v === "number") {
    // 초 단위 vs 밀리초 단위 구분
    const ms = v > 1e12 ? v : v * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof v === "string") {
    const s = v.trim();
    // "yyyy/mm/dd", "yyyy-mm-dd HH:mm:ss" 같은 흔한 포맷 보정
    const normalized =
      /^\d{4}\/\d{1,2}\/\d{1,2}/.test(s) ? s.replace(/\//g, "-") :
      /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(s) ? s.replace(" ", "T") :
      s;
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}
