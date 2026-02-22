# 🧪 HSBS — AI 기반 서비스 아키텍처 설계 플랫폼

> 단순 포트폴리오가 아닌,  
> **AI + SaaS + CMS 아키텍처를 직접 설계하고 운영하는 개인 서비스 플랫폼**

HSBS는 실제 운영을 고려한 구조로 설계된 **멀티 테넌트 AI SaaS + CMS 통합 플랫폼**입니다.

- 🌐 Live: https://www.hsbs.kr
- 🔧 Backend: `hsb-bo` (Spring Boot)
- 🎨 Frontend: `hsb-fe` (React SPA)
- 🧠 AI Server: `hsb-brain` (FastAPI - Python)

---

## 🏗 Architecture Overview

### 🔹 Frontend
- React SPA 구조
- 동적 Section 기반 메인 페이지
- 관리자(Admin) CMS UI
- 위젯 미리보기(Preview) 패널

### 🔹 Backend
- Spring Boot REST API
- JWT 기반 인증 설계
- AuditBase 공통 컬럼 설계
- Soft Delete 구조
- Job Queue 기반 비동기 처리

### 🔹 AI Server (분리 아키텍처)
- FastAPI 기반 독립 서버
- OpenAI API 연동
- RAG 기반 문서 질의응답
- Reverse Proxy (Apache) 구성

### 🔹 Database
- MySQL
- 멀티 테넌트 설계 (`tenantId` / `siteKey` 기반)
- PromptProfile / KB / UsageLog 구조

### 🔹 Infra & DevOps
- OCI Ubuntu
- Apache Reverse Proxy
- systemd 서비스 운영 (`uv`, `jar`)
- GitHub Actions CI/CD 자동 배포

---

## 📺 HSBS 콘텐츠 시스템

> 내부 콘텐츠를 업로드하고 효율적으로 관리, 제공하는 통합 CMS 프로젝트

| 항목 | 내용 |
|------|------|
| 프로젝트명 | HSBS 내부 콘텐츠 시스템 |
| 목적 | 콘텐츠(뉴스, 유튜브(홍보물), 영상 등) 등록 및 열람 |
| 주요 기술 | React (Frontend), Spring Boot + JPA (Backend), MySQL |
| 배포 환경 | OCI Apache 내부 프록시 |
| 주요 대상 | 관리자 (CMS 관리자) |

### 콘텐츠 관리 (통합 등록)

하나의 등록 폼에서 **파일 타입**(`VIDEO / IMAGE / DOCUMENT / LINK`)에 따라 업로드/등록하며,  
**콘텐츠 유형**(`HSBS`, `PROMO`, `MEDIA`, `CI_BI` 등)을 선택하여 저장합니다.

- 지원 확장자: `mp4`, `png`, `jpg`, `pdf`, 링크(YouTube)
- 썸네일(업로드/자동) 및 설명 입력
- 목록/검색, 수정, 논리삭제 지원

#### 유형 매핑

| 콘텐츠 구분 | fileType | contentType | 설명 |
|------------|----------|-------------|------|
| HSBS 뉴스 | VIDEO | HSBS | 동영상 기반 뉴스 |
| 홍보물 (PDF) | DOCUMENT | PROMO | 회사소개서, 포트폴리오, 사업부 카탈로그 등 |
| 홍보 영상 | VIDEO | PROMO | 사업부 홍보용 영상 |
| 유튜브 링크 | LINK | PROMO | 유튜브 URL 등록 (썸네일 자동 추출) |
| 미디어 에셋(이미지) | IMAGE | MEDIA | 이미지 다운로드 자료 |
| 미디어 에셋(영상) | VIDEO | MEDIA | 영상 다운로드 자료 |
| CI/BI 자료 | DOCUMENT/IMAGE | CI_BI | 브랜드 가이드, 로고 등 |

> 모든 콘텐츠는 **단일 테이블**에서 `fileType` + `contentType` 조합으로 분류/조회됩니다.

---

## 🤖 HSBS SaaS Chatbot (멀티 테넌트 AI 위젯)

사내/외부 사이트에 임베드 가능한 **멀티 테넌트 AI 챗봇 플랫폼**.  
각 위젯은 `siteKey`로 식별되며, 위젯 설정 · 프롬프트 · 사용량 · 쿼터 관리까지 포함한 SaaS 구조입니다.

### 핵심 설계 흐름

**1️⃣ SiteKey 발급**
- 도메인 화이트리스트
- 플랜/상태 관리 (`ACTIVE / SUSPENDED / REVOKED`)
- 호출 수 / 토큰 기반 쿼터 제어

**2️⃣ Widget 설정**
- 테마 / 버블 / 컬러 / 위치 / 환영 문구
- JSON 기반 옵션 저장
- 실시간 Preview UI

**3️⃣ Prompt Profile**
- 시스템 프롬프트 / 가드레일 분리
- `temperature` / `maxTokens` 설정
- 버전 관리 구조
- `tenantId` 기반 독립 운영

**4️⃣ JS SDK 임베드**

```html
<script src="/hsbs/hsbs-chat.js" defer data-site-key="{YOUR_SITE_KEY}"></script>
```

- 기본 API Base: 운영/로컬 자동 스위칭
- CSS/버블/패널 동적 주입, 오픈/닫기 상태 기억
- 위젯 UI 설정 시 Option JSON으로 세부 옵션 고도화
- web/app/기타 시스템 소프트웨어 호환성 추가 (예정)

**5️⃣ 요청 처리 및 쿼터 관리**
- `/api/ai/complete` → 응답 저장/로깅
- 일일/월간 호출 수, 토큰 비용(KRW 환산) 추적
- 응답 최대 토큰 제한 + 프롬프트 길이 제한 (클라이언트/서버 이중)
- 캐싱 (FAQ/RAG 응답 캐시, 동일 질문 TTL)
- 요청 속도 제한 (테넌트별 rate limit)

### 관리자 기능

- SiteKey 목록/검색/상태변경(토글), 논리삭제
- WidgetConfig 생성/수정(파일/이미지 포함), 미리보기
- PromptProfile 등록/버전관리(시스템/가드레일)
- UsageLog 조회(필터: 기간/모델/상태), 엑셀 내보내기
- Plan/Quota 정책: 일일 요청 제한, 초과 시 차단/경고

### 보안/검증

- 위젯 초기화 시 **`X-HSBS-Site-Key`** 헤더로 핑(`/api/ai/ping`) → 허용 도메인/상태 검증
- 관리자 API는 `/api/admin/**` + **JWT 인증**

---

## 📰 CMS / 포털 기능

HSBS는 단순 소개 페이지가 아니라 **실제 회사 인트라넷 수준의 CMS + 관리자 권한 시스템**을 갖춘 구조입니다.

### 게시판 관리

- 공지 / 이벤트 / Q&A 등 카테고리별 게시판 분리
- 검색 / 페이징 / 첨부파일 업로드
- 게시글 등록 / 수정 / 삭제 (Soft Delete)
- 이벤트 게시판 전용 기능: 응모 폼 생성, 참여자 목록 관리, 엑셀 다운로드, 랜덤 추첨
- 관리자 권한별 접근 제어 (읽기/쓰기 제한)

### 팝업 / 배너 관리

- 메인 페이지용 팝업/배너 등록
- 노출 기간 설정 (시작일 / 종료일), 위치 설정
- `use_tf` 토글 제어, 포트폴리오 메인에 실시간 반영

### 문의 관리

- 사이트 내 문의/견적 폼 수집
- 상태 변경 (접수 / 처리중 / 완료)
- 이메일 알림 연동 (Thymeleaf 기반 메일 템플릿 발송)

---

## 🔐 관리자(Admin) 시스템

### 역할 기반 권한 관리 (RBAC)

- 관리자 등록 / 수정 / 비활성화, 비밀번호 암호화 (BCrypt)
- JWT 기반 인증 확장 설계
- 권한 그룹 생성 및 그룹별 접근 가능 메뉴 설정
- 메뉴 계층 구조 (`depth` / `parent_id`), 노출 순서 정렬, `use_tf` 제어
- 사용자-권한 그룹 매핑 구조, 로그인 시 권한 로딩 로직 구현

### 통계 / 로그 관리

- 콘텐츠/게시판 등록 통계
- AI 호출 로그 조회, 토큰 사용량 집계
- 사용자 활동 로그 기반 운영 데이터 확인

---

## 📈 KRX / KIS 증권 데이터 모듈

사내 포털/포트폴리오에서 **국내 주식 마스터 + 시세/캔들 차트** 제공.

### 데이터 파이프라인

1. **KRX 마스터**: 종목코드/시장/상장상태 주기적 갱신 (CSV/XLS 배치)
2. **KIS OpenAPI**: 실시간/근실시간 가격, 일/주/월 캔들 수집
3. **저장 스키마**: `stock_master`, `stock_market_price` 등 (인덱스/중복 방지)
4. **스케줄러**: 장중/장마감 동기화, 장애 시 재시도/보정 로직

### 프론트 기능

- 심볼/한글명 자동완성 (캐시 + 디바운스)
- 캔들 차트 (일/주/월)
- 호가/체결 간단 패널 (선택 사항)

### 성능/안정화

- API 호출 캐시(TTL), 백오프/리트라이
- 일중/일봉 중복 삽입 방지 (Unique Key)
- 장애 대응: 최근 N일 재빌드 잡

### 주요 컴포넌트 및 DTO

- `KisPanel`, `CandleChart`, `StockSearchBox`
- `KisPrice`, `KisDailyItem`, `CandleDto`

---

## ⚙️ 공통 설계 원칙

모든 테이블 공통 컬럼: `use_tf`, `del_tf`, `reg_adm`, `reg_date`, `up_adm`, `up_date`, `del_adm`, `del_date`

- AuditBase 기반 공통 상속 구조
- Soft Delete 전략 일관 적용
- 관리자 UI는 React 기반 모달 + 페이징 + 검색 구조 통일

---

## 🏷️ 커밋 메시지 태그 규칙

| 태그 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `post` | 새 글 추가 |
| `fix` | 자잘한 수정 (버그 아님) |
| `bugfix` | 버그 수정 |
| `refactor` | 코드 리팩토링 (기능 변화 없음) |
| `chore` | config, 라이브러리, 빌드 설정 등 프로덕션 코드 외 수정 |
| `rename` | 파일명, 변수명 수정 |
| `docs` | 문서 수정 (README 등) |
| `comment` | 주석 추가 또는 수정 |
| `remove` | 기능 또는 파일 삭제 |
| `test` | 테스트 코드 작성 |
| `hotfix` | 긴급 버그 수정 (배포 후 치명적인 문제 해결) |

---

## 📘 API 문서 (Swagger UI)

Spring Boot + OpenAPI 기반의 자동 API 문서입니다.

- **접속 주소**: [http://168.138.214.83:8080/swagger-ui/index.html](http://168.138.214.83:8080/swagger-ui/index.html)
- 실시간으로 컨트롤러 기반 API 명세 확인 가능
- 인증이 필요한 API는 `/api/admin/**` 영역이며 **JWT 토큰** 필요

---

## 🛠 운영 체크리스트

```bash
# BE 서비스 로그 확인
sudo journalctl -u hsb-bo.service -f -n 100
```

- FE 빌드/배포: GitHub Actions → `/var/www/html` 동기화
- 환경 변수: `application-prod.yml`, `.env.production` 정리

---
