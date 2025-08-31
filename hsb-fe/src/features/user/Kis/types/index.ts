// KIS 응답은 계정/환경에 따라 필드명이 조금씩 다름.
// 최소 화면 표시에 필요한 값만 정의함.

export type KisPrice = {
  code: string;
  name?: string;
  tradePrice?: number;  // 현재가
  changeRate?: number;  // 등락률(%)
  changePrice?: number; // 전일대비
  accVol?: number;      // 거래량
  raw?: any;            // 디버깅용
};

export type KisDailyItem = {
  date: string; // YYYYMMDD
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
};

export type KisHistory = {
  code: string;
  period: 'D'|'W'|'M';
  items: KisDailyItem[];
  raw?: any;
};

// 종목 검색 결과
export interface KisSearch {
  code: string;
  name: string;
  market?: string;  // KOSPI/KOSDAQ/ETF 등 (옵션)
}
