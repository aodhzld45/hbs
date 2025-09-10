import { Database, LineChart, Webhook, Clock, Shield, Activity, GitBranch, Signal, Network } from "lucide-react";
import React from "react";

const Pill = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-block text-xs md:text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border ${className}`}>
    {children}
  </span>
);

const Step = ({ no, title, children }: { no: number; title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border bg-white dark:bg-[#141414] dark:border-gray-800 p-4 md:p-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">{no}</div>
      <h4 className="text-base md:text-lg font-semibold">{title}</h4>
    </div>
    <div className="text-sm md:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">{children}</div>
  </div>
);

export default function SecuritiesDataSection() {
  return (
    <div>
      {/* 제목 */}
        <div className="text-center mb-8">  {/* mb-12 → mb-8 로 줄임 */}
            <h2 className="text-2xl md:text-3xl font-bold">
                국내 증권 데이터 파이프라인 (KRX Batch + KIS OpenAPI)
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                KRX <b>종목 마스터</b>를 배치 업서트로 적재하고,<br />
                한국투자증권 <b>OpenAPI</b>로 단건 시세 조회를 연동했습니다.<br /> 
                <span className="opacity-80">(일별 시세 적재는 설계 단계)</span>.<br /> 
                백엔드(Spring Boot + JPA + MySQL)와 프론트(React) 기반으로 <b>데이터 수집 → 정규화 → 제공</b>의 전체 흐름을 설계/구현했습니다.
            </p>
        </div>
        

      {/* 스택/아키텍처 요약 */}
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border bg-white dark:bg-[#121212] dark:border-gray-800 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 mb-3">
                <Database size={18} />
                <h3 className="font-semibold">Data & Backend</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill>Spring Boot 3 (Java 17)</Pill>
                <Pill>JPA / Batch Upsert</Pill>
                <Pill>MySQL / MariaDB</Pill>
                <Pill>OpenCSV / XLS → CSV</Pill>
                <Pill>Unique Key & Index</Pill>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 mb-3">
                <Webhook size={18} />
                <h3 className="font-semibold">External & Realtime</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill>KRX OTP 다운로드</Pill>
                <Pill>KIS OpenAPI (REST)</Pill>
                <Pill>토큰 재발급/캐시</Pill>
                <Pill>에러/타임아웃 대응</Pill>
              </div>
            </div>
          </div>
        </div>

        {/* 성과 요약 */}
        <div className="grid gap-6 md:gap-8 mt-10">
          <Step no={1} title="핵심 성과 (What I built)">
            <ul className="list-disc ml-5 space-y-1">
              <li>
                <b>KRX 종목 마스터 업서트 파이프라인</b> — CSV/XLS 파싱 → 종목코드/종목명/시장 구분 중복 방지 업서트, 무결성/인덱스 최적화
              </li>
              <li>
                <b>KIS OpenAPI 시세 검색</b> — 단건/리스트 조회, 토큰 만료 자동 재발급, HTML 오류 응답/네트워크 예외 대비
              </li>
              <li>
                <b>도메인 정규화</b> — KOSPI/KOSDAQ 구분, 종목코드 zero-padding, 마켓/부문 표준화, 심볼-이름 매핑
              </li>
              <li>
                <b>API 경량화</b> — 메모리 TTL 캐시로 동일 파라미터 재요청 비용 절감, 응답 구조 표준화(DTO)
              </li>
            </ul>
          </Step>

          <Step no={2} title="아키텍처 흐름 (Data Flow)">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h5 className="font-semibold mb-2 flex items-center gap-2"><Clock size={16}/>일배치 (KRX)</h5>
                <ol className="list-decimal ml-5 space-y-1 text-sm">
                  <li>OTP 발급 → XLS/CSV 다운로드</li>
                  <li>파싱/정규화 → <code>stock_master</code> 업서트</li>
                  <li>로그 기록(추가 예정), 재실행 안전성(멱등) 확보</li>
                </ol>
              </div>
              <div className="rounded-lg border p-4">
                <h5 className="font-semibold mb-2 flex items-center gap-2"><Signal size={16}/>조회 (KIS REST)</h5>
                <ol className="list-decimal ml-5 space-y-1 text-sm">
                  <li>AppKey/AppSecret → Access Token 발급/캐시</li>
                  <li>시세/검색 API 호출 → DTO 매핑</li>
                  <li>오류·한도·지연 대비(재시도/폴백) 처리</li>
                </ol>
              </div>
            </div>
          </Step>

          <Step no={3} title="스키마 & 제약 (DB Highlights)">
            <ul className="list-disc ml-5 space-y-1">
              <li><code>stock_master(id PK, symbol UNIQUE, name, market, ...)</code> — <b>구현 완료</b></li>
              <li><code>stock_market_price(id PK, symbol, trade_date, open, high, low, close, volume, market, name_ko, ...)</code> — <span className="opacity-80">설계</span></li>
              <li><b>Unique</b>: <code>stock_market_price(symbol, trade_date)</code> / <b>Index</b>: <code>symbol, trade_date</code> (설계)</li>
              <li>공통 감사 컬럼: <code>use_tf, del_tf, reg_date, up_date</code> 등 일관 적용</li>
            </ul>
          </Step>

          <Step no={4} title="운영/신뢰성 (Ops & Reliability)">
            <ul className="list-disc ml-5 space-y-1">
              <li><Activity className="inline-block mr-1" size={14}/> 스케줄러(Quartz/Spring)로 평일 18:00 배치, 실패 시 재시도 & 알림</li>
              <li><Shield className="inline-block mr-1" size={14}/> Secrets 분리, 최소 권한의 DB 계정, 관리자 엔드포인트 제한</li>
              <li><GitBranch className="inline-block mr-1" size={14}/> GitHub Actions 아티팩트/프로모션, 환경별 프로파일/ENV 주입</li>
            </ul>
          </Step>

          <Step no={5} title="다음 단계 (Roadmap)">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h5 className="font-semibold mb-2 flex items-center gap-2"><LineChart size={16}/>데이터 활용</h5>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  <li>일/주/월 캔들/라인 차트, 수익률 비교(다중 종목)</li>
                  <li>자동완성 + 상세(시총/부문) 서치 UX 고도화</li>
                  <li>백테스트용 간단 전략(이동평균/RSI) 샘플</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4">
                <h5 className="font-semibold mb-2 flex items-center gap-2"><Network size={16}/>실시간/서비스화</h5>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  <li>WebSocket(호가/체결) 대시보드, 관심종목 Watchlist</li>
                  <li>조건 알림(가격/등락률), 메일/푸시 연동</li>
                  <li>메트릭/로그 대시보드(Grafana/Prometheus)</li>
                </ul>
              </div>
            </div>
          </Step>

          <Step no={6} title="임팩트 지표 (KPI)">
            <ul className="list-disc ml-5 space-y-1">
              <li>배치 안정성: 중복 0건 업서트, 재실행 멱등 성공률 ▲</li>
              <li>조회 체감: 동일 파라미터 캐시 히트율 ▲, 평균 응답시간 ▼</li>
              <li>데이터 신뢰: 무결성 제약 충돌율 ▼, 누락 감지 알림 대응 TTR ▼</li>
            </ul>
          </Step>
        </div>

        {/* 테스트 버튼 */}
        <div className="text-center mt-12">
          <a
            href="https://www.hsbs.kr/test/kis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
          >
            테스트하러 가기 →
          </a>
        </div>
      </div>
    </div>
  );
}