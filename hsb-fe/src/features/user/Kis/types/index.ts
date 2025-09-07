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

export type StockLite = {
  id: number; // 내부ID
  isin: string;    // ISIN (12자리)
  symbol: string;   // 6자리
  name: string;     // 종목명
  shortName: string;// 약식명
  engName?: string; // 영문명
  listedDate?: string; // 상장일 (YYYY-MM-DD)
  market: string;   // 시장(KOSPI/KOSDAQ)
  secType: string;  // 주식/ETF/ELW 등
  sector?: string;   // 산업분류
  stockType?: string; // 보통주/우선주 등
  parValue?: number; // 액면가
  listedShares?: number; // 상장주식수
  useTf?: boolean; // 사용여부
  delTf?: boolean; // 삭제여부
  regDate: string; // 등록일시 (YYYY-MM-DD HH:mm:ss)
};
