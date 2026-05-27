# HSBS SaaS Chatbot 고도화 작업 문서

이 문서는 README의 포트폴리오 소개와 분리된 상세 실행 계획입니다. 목표는 HSBS Chatbot을 “스크립트 하나로 설치 가능한 SaaS 위젯”에서 “운영, 관측, 검색 품질, 배포 안정성까지 갖춘 제품형 플랫폼”으로 고도화하는 것입니다.

## 1. 현재 구현 기준

현재 `hsb-fe/public/sdk/v1/hsbs-chat.js` 기준으로 다음 흐름이 구현되어 있습니다.

1. 외부 사이트가 스크립트를 로드하고 `window.HSBS.init({ siteKey, apiBase })`를 호출한다.
2. SDK가 `siteKey`를 정규화하고 `/api/ai/ping`으로 활성 상태와 허용 도메인을 확인한다.
3. `/api/ai/public/widget-config`에서 위젯 색상, 위치, 문구, 로고, 동작 옵션을 조회한다.
4. `/api/ai/public/prompt-profile`에서 환영 문구와 WelcomeBlocks를 조회한다.
5. `hsbs-chat.css`를 스크립트와 같은 경로에서 자동 로드한다.
6. 채팅 버블, 패널, 입력창, 퀵리플라이를 DOM에 주입한다.
7. 사용자 질문을 `X-HSBS-Site-Key` 헤더와 함께 `/api/ai/complete4`로 전송한다.
8. 서버는 SiteKey 쿼터, 기본 PromptProfile, 기본 WidgetConfig, FastAPI Brain 호출, UsageLog 저장 흐름으로 처리한다.

현재 Back-Office는 다음 기능을 기준선으로 볼 수 있습니다.

- SiteKey: 생성, 수정, 상태 변경, 사용 여부, 논리삭제, 허용 도메인 검증
- WidgetConfig: 위젯 문구, 색상, 위치, 아이콘, 동작 옵션, 기본 SiteKey 연결
- PromptProfile: 시스템 프롬프트, 가드레일, 모델 옵션, WelcomeBlocks, KB 문서 연결
- KB: Source / Document CRUD, 파일 업로드, 인덱싱 Job Worker 구조
- UsageStats: 기간, 테넌트, siteKey 기반 사용량 조회, 인기 질문, 엑셀 내보내기
- Public API: ping, widget-config, prompt-profile, complete4

## 2. 핵심 방향

서비스 제공 관점에서 고도화의 중심은 네 가지입니다.

- SDK 배포 체계: 어느 웹사이트든 안전하게 붙일 수 있는 버전형 SDK 제공
- 위젯 UI 품질: 단순 채팅창이 아니라 브랜드별로 설정 가능한 제품형 위젯 제공
- 운영 안정성: 장애, timeout, CORS, CSP, 쿼터 초과 상황을 고객 사이트 UX 안에서 제어
- Hybrid RAG 검색 계층: OpenAI Vector Store에만 의존하지 않고 HSBS 자체 검색 계층 확보

OpenAI File Search와 Vector Store는 관리형 검색 도구로 좋은 선택지입니다. 다만 SaaS 운영 관점에서는 비용, 락인, 검색 튜닝 한계, 삭제/동기화 일관성, 장애 대응 문제가 생길 수 있습니다. 따라서 HSBS에서는 OpenAI Vector Store를 “검색 옵션”으로 두고, 자체 KB 인덱스를 1차 검색 계층으로 두는 구조가 더 적합합니다.

## 3. Phase 0. 기준선 정리

목표: 현재 동작 중인 SDK와 API 흐름을 서비스 기준선으로 고정합니다.

### 진행도

- 상태: 완료
- 반영일: 2026-05-26
- 공식 SDK 기준 경로를 `/sdk/v1`로 확정했다.
- 루트 public과 `/sdk/local`, `/sdk/prod`에 흩어져 있던 중복 SDK 파일을 제거했다.
- local/prod 테스트 페이지를 분리했다.
  - local: `hsb-fe/public/sdk-test-local.html`
  - prod: `hsb-fe/public/sdk-test-prod.html`
- README와 SDK v1 문서에 공개 엔드포인트 기준을 정리했다.

### 작업

- [완료] public SDK 기준 파일을 하나로 통일한다.
- [완료] 배포 기준은 `/sdk/v1/hsbs-chat.js`와 `/sdk/v1/hsbs-loader.js`로 단일화한다.
- [완료] 루트의 중복 SDK 파일은 유지하지 않는다.
- [완료] SDK 엔드포인트를 문서화한다.
  - `GET /api/ai/ping`
  - `GET /api/ai/public/widget-config`
  - `GET /api/ai/public/prompt-profile`
  - `POST /api/ai/complete4`
- [완료] BO에서 SiteKey, defaultWidgetConfig, defaultPromptProfile 연결이 비어 있으면 위젯이 뜨지 않는다는 운영 체크리스트를 추가한다.
- [완료] SDK 테스트 페이지를 prod/local로 분리하고, 테스트 siteKey와 운영 siteKey를 명확히 구분한다.

### 완료 기준

- 외부 HTML 한 장에서 script + `HSBS.init()`만으로 위젯이 뜬다.
- 허용 도메인이 아닌 곳에서는 `/api/ai/ping` 단계에서 차단된다.
- 콘솔에서 widget-config, prompt-profile, complete4 호출 흐름이 확인된다.

## 4. Phase 1. SDK 배포 체계

목표: “어느 웹사이트든 스크립트만 붙이면 HSBS API를 사용할 수 있는” 형태로 만듭니다.

### 진행도

- 상태: 진행 중
- 반영일: 2026-05-26
- `/sdk/v1/hsbs-chat.js`, `/sdk/v1/hsbs-chat.css`, `/sdk/v1/hsbs-loader.js`, `/sdk/v1/latest.js`를 생성했다.
- `hsbs-loader.js`에서 `data-site-key`, `data-api-base`, `data-theme`, `data-debug` 기반 자동 초기화를 지원한다.
- `latest.js`는 현재 v1 loader로 위임하는 호환 진입점으로 추가했다.
- `hsbs-chat.d.ts`에 `HSBSInitOptions`, `HSBSWidgetInstance`, `HSBSEventMap` 공개 타입을 추가했다.
- `onReady`, `onOpen`, `onClose`, `onMessage`, `onError`, `onQuotaExceeded` 콜백 훅과 `hsbs:*` DOM 이벤트를 표준화했다.
- BO SiteKey 목록에 운영 체크리스트를 추가해 SiteKey 활성 상태, 허용 도메인, 기본 WidgetConfig, 기본 PromptProfile 연결 누락을 확인할 수 있게 했다.
- 아직 패키지 확장과 향후 버전 경로(`/sdk/v1.2.0`) 배포는 남아 있다.

### 작업

- [진행 중] CDN/정적 경로를 버전 기반으로 고정한다.
  - `/sdk/v1/hsbs-chat.js`
  - `/sdk/v1/hsbs-chat.css`
  - `/sdk/v1/latest.js`
  - `/sdk/v1.2.0/hsbs-chat.js`는 향후 버전 배포 시 추가
- [완료] loader와 core를 분리한다.
  - `hsbs-loader.js`: siteKey, apiBase, version, theme를 읽고 실제 SDK/CSS 로드
  - `hsbs-chat.js`: 브라우저 전역 `window.HSBS` 제공
  - `hsbs-chat.css`: 위젯 기본 스타일
- [완료] 자동 초기화 방식을 추가한다.

```html
<script
  src="https://www.hsbs.kr/sdk/v1/hsbs-loader.js"
  data-site-key="{YOUR_SITE_KEY}"
  data-api-base="https://www.hsbs.kr/api"
  data-theme="auto"
  defer
></script>
```

- [완료] 명시 초기화 방식도 유지한다.

```html
<script src="https://www.hsbs.kr/sdk/v1/hsbs-chat.js"></script>
<script>
  window.HSBS.init({
    siteKey: "{YOUR_SITE_KEY}",
    apiBase: "https://www.hsbs.kr/api",
    theme: "auto"
  });
</script>
```

- [완료] 타입 선언을 제공한다.
  - `HSBSInitOptions`
  - `HSBSWidgetInstance`
  - `HSBSEventMap`
- [완료] 이벤트 훅을 표준화한다.
  - `onReady`
  - `onOpen`
  - `onClose`
  - `onMessage`
  - `onError`
  - `onQuotaExceeded`
- [이후] 패키지 확장을 준비한다.
  - `@hsbs/chat-widget`
  - React: `<HsbsChat siteKey="..." />`
  - Web Component: `<hsbs-chat site-key="..."></hsbs-chat>`

### 완료 기준

- 사용자는 loader script 한 줄 또는 init 코드 중 하나를 선택할 수 있다.
- 특정 버전에 고정 배포할 수 있고, latest 변경이 기존 고객을 깨지 않는다.
- SDK 옵션과 이벤트 타입이 문서화되어 있다.

## 5. Phase 2. SDK 운영 안정성

목표: 외부 고객 사이트에서 실패해도 사이트 자체 UX를 망치지 않습니다.

### 진행도

- 상태: 진행 중
- 반영일: 2026-05-27
- `pingTimeoutMs`, `configTimeoutMs`, `completeTimeoutMs` 기준으로 API별 timeout을 분리했다.
- `navigator.onLine` 기반 offline 감지와 안내 메시지를 추가했다.
- complete4 실패, timeout, 네트워크 오류, 429 쿼터 초과 상황에서 재시도 버튼을 표시한다.
- WidgetConfig `options`에서 fallback 메시지와 재시도 버튼 문구를 덮어쓸 수 있게 했다.
- `onQuotaExceeded` 이벤트와 `hsbs:quotaExceeded` DOM 이벤트로 쿼터 초과를 외부 페이지에서 감지할 수 있게 했다.
- CSP 가이드, SRI/hash manifest, 더 세밀한 retry 정책은 남아 있다.

### 작업

- [진행 중] 네트워크 timeout과 retry 정책을 분리한다.
  - [완료] ping/widget-config: 짧은 timeout, 실패 시 위젯 미노출
  - [완료] complete4: 사용자 안내 메시지 + 재시도 버튼
- [완료] 장애 fallback 메시지를 WidgetConfig에서 설정 가능하게 한다.
- [완료] offline 감지와 `navigator.onLine` 기반 안내를 추가한다.
- [완료] 중복 init, destroy, re-init을 안정화한다.
- [다음] CSP 가이드를 문서화한다.
  - `script-src`
  - `style-src`
  - `connect-src`
  - `img-src`
- [다음] SRI 또는 SDK hash manifest를 제공한다.
- [완료] debug 모드는 고객 콘솔을 오염시키지 않도록 명시 옵션일 때만 상세 로그를 남긴다.

### 완료 기준

- API 장애 시 위젯은 깨진 UI가 아니라 안내 상태를 보여준다.
- 고객 사이트의 기존 CSS와 충돌하지 않는다.
- `HSBS.destroy()` 후 DOM/event listener가 정리된다.

## 6. Phase 3. 위젯 디자인 고도화

목표: 단순 채팅창이 아니라 브랜드별 SaaS 위젯처럼 보이게 만듭니다.

### 작업

- 레이아웃 프리셋을 도입한다.
  - `bubble`: 현재 기본형
  - `bottom-sheet`: 모바일 중심
  - `side-panel`: 데스크톱 상담형
  - `inline-embed`: 페이지 내부 삽입형
  - `full-screen-mobile`: 앱형 모바일 UX
- WidgetConfig를 디자인 토큰 중심으로 재정리한다.
  - `primary`, `surface`, `surfaceAlt`, `text`, `mutedText`, `border`
  - `radius.sm/md/lg`, `shadow.sm/md/lg`
  - `spacing`, `fontFamily`, `fontSize`
- 아이콘 체계를 고도화한다.
  - 기본 SVG 아이콘 세트
  - 관리자 업로드 로고/버블 아이콘
  - 다크/라이트 아이콘 분리
- 메시지 UI를 개선한다.
  - 타이핑 인디케이터
  - 스트리밍 응답
  - 응답 복사
  - 재시도
  - 좋아요/싫어요 피드백
  - citation/source 펼침
- WelcomeBlocks를 CTA 영역으로 확장한다.
  - FAQ 카드
  - 이미지 카드
  - 링크 버튼
  - 문서 추천 카드
  - 상담/문의 전환 버튼
- 접근성과 모바일 대응을 포함한다.
  - focus trap
  - aria-label
  - ESC 닫기
  - reduced-motion
  - safe-area inset
  - 모바일 키보드 대응

### 완료 기준

- BO Preview에서 데스크톱/모바일/다크모드를 전환하며 확인 가능하다.
- tenant별 브랜드 톤을 WidgetConfig만으로 분리할 수 있다.
- 메시지 복사/피드백/재시도까지 기본 사용성이 완성된다.

## 7. Phase 4. Hybrid RAG 검색 계층

목표: OpenAI Vector Store에만 의존하지 않고, HSBS가 검색 품질과 비용을 제어합니다.

### 권장 구조

1. 문서 원본 계층
   - `kb_source`: 사이트키별 지식 출처
   - `kb_document`: 원본 파일, 제목, 상태, 버전
   - `kb_chunk`: 자체 청킹 결과, chunk text, section, page, token count
2. 자체 검색 계층
   - MySQL Fulltext 또는 별도 검색 엔진(Meilisearch/OpenSearch 등)
   - 자체 embedding 저장소(pgvector, Qdrant, Milvus, Chroma 중 선택 가능)
   - BM25 + vector hybrid score
3. 외부 관리형 검색 옵션
   - OpenAI Vector Store
   - OpenAI file_search
   - 향후 다른 provider connector
4. 검색 오케스트레이터
   - siteKey, tenantId, PromptProfile 기준으로 검색 범위를 제한
   - keyword search → vector search → rerank → prompt context assembly
   - 검색 결과가 부족할 때만 OpenAI Vector Store fallback
5. 답변 생성 계층
   - FastAPI Brain에서 context + prompt + guardrail 조립
   - citation/source metadata를 response와 UsageLog에 저장

### 우선 구현 순서

- 1단계: `kb_chunk` 테이블을 추가해 자체 chunk를 저장한다.
- 2단계: 기존 `kb_job`에서 문서 파싱 → chunk 생성 → status 업데이트를 처리한다.
- 3단계: MySQL Fulltext 기반 keyword search를 먼저 붙인다.
- 4단계: embedding provider 인터페이스를 만든다.
  - `EmbeddingProvider`
  - `VectorIndexProvider`
  - `RetrievalProvider`
- 5단계: Qdrant 또는 pgvector 중 하나를 붙여 자체 vector search를 제공한다.
- 6단계: OpenAI Vector Store는 `ExternalRetrievalProvider`로 분리한다.
- 7단계: PromptProfile에서 retrieval mode를 선택한다.
  - `LOCAL_ONLY`
  - `OPENAI_ONLY`
  - `HYBRID_LOCAL_FIRST`
  - `HYBRID_OPENAI_FALLBACK`
- 8단계: UsageLog에 retrieval provider, hit count, latency, citation count, fallback 여부를 저장한다.

### 완료 기준

- OpenAI Vector Store 장애 또는 비용 정책 변경이 있어도 자체 검색으로 최소 응답이 가능하다.
- tenant/siteKey별 검색 범위가 DB와 검색 인덱스 양쪽에서 격리된다.
- 검색 품질을 HSBS 내부에서 튜닝할 수 있다.

## 8. Phase 5. BO SaaS 운영 콘솔

목표: 관리자 화면을 고객 온보딩과 운영 관측까지 가능한 SaaS 콘솔로 확장합니다.

### 작업

- 온보딩 마법사
  - SiteKey 발급
  - 허용 도메인 등록
  - WidgetConfig 선택
  - PromptProfile 선택
  - KB 문서 업로드
  - 테스트 질문
  - 설치 코드 발급
- 릴리즈 관리
  - WidgetConfig draft/publish
  - PromptProfile version/rollback
  - SDK version pinning
- 운영 대시보드
  - 호출 수
  - 성공률
  - 평균 latency
  - 쿼터 소진율
  - 토큰/비용
  - RAG hit rate
  - fallback rate
- 고객 지원
  - 대화 로그 검색
  - 사용자 피드백 조회
  - 문의 전환
  - CSV/XLSX export

### 완료 기준

- 신규 고객 사이트를 BO에서 10분 안에 발급/설치/테스트할 수 있다.
- 장애와 비용, 검색 품질을 콘솔에서 확인할 수 있다.
- WidgetConfig/PromptProfile 변경을 즉시 배포하지 않고 draft로 검증할 수 있다.
