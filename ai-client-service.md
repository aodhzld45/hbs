# HSBS SaaS Chat Bot — 진행 내역 업데이트(Markdown)

## 오늘의 범위(업데이트)

* **엔드투엔드 목표:** `ai_site_key` 중심 **DB → BE(Service/Controller) → FE(CMS UI)** 최소 가동 라인 **완료**
* **진행 순서:** DDL → Entity → DTO → Mapper → Repository → **Service → Controller → Admin UI**
* **의사결정:** 서버 **시크릿 키는 MVP에서 제외** (복잡도↓, 필요시 후도입)

---

## 1) DB 설계 (MySQL 8)

### `ai_site_key` DDL (MVP, 서버 시크릿 제외) — ✅ 유지

* **핵심 필드:**
  `site_key(UNIQUE)`, `status(ACTIVE|SUSPENDED|REVOKED)`, `plan_code`,
  `daily_call_limit`, `daily_token_limit`, `monthly_token_limit`, `rate_limit_rps`,
  `allowed_domains(JSON)`, `default_widget_config_id`, `default_prompt_profile_id`, `notes`,
  **Audit**: `use_tf, del_tf(기본 N), reg_adm, reg_date, up_adm, up_date, del_adm, del_date`
* **인덱스:** `status`, `plan_code`, `reg_date`, `default_*_id`
* **메모:** `allowed_domains`는 JSON 컬럼(필요 시 정규화 분리 가능)

---

## 2) Entity (Spring Boot + JPA) — ✅ 완료

* `SiteKey` 엔티티: DDL 1:1 매핑, `allowedDomains` ↔ `StringListJsonConverter`
* `Status` 외부 enum: `ACTIVE|SUSPENDED|REVOKED` + `parseOrDefault(...)`
* 편의 메서드: `isActive()`, `isDomainAllowed(host)`(와일드카드 지원)
* `del_tf` 기본값 **N** 강제(생성/갱신 경로에서 N 유지)

---

## 3) DTO — ✅ 완료

* `SiteKeyCreateRequest`, `SiteKeyUpdateRequest`, `SiteKeyStatusRequest`, `SiteKeyQuery`
* `SiteKeyResponse`, `SiteKeySummaryResponse`, `PagedResponse<T>`
* 검증: `@Pattern("ACTIVE|SUSPENDED|REVOKED")`, 숫자/길이/리스트 사이즈 제한

---

## 4) Mapper — ✅ 완료

* `toEntity(...)` : 기본값/트림/상태 안전 파싱
* `applyUpdate(...)` : **partial update**
* `toResponse(...)`, `toSummary(...)` : 감사 필드/도메인 카운트 포함

---

## 5) Repository — ✅ 완료

* 기본 JPA + 커스텀 검색(Criteria)
  `findBySiteKey`, `existsBySiteKey`, `updateStatus`, `search(query)`

---

## 6) Service — ✅ 완료

* **Create/Update/ChangeStatus/Get/Search** 구현
* 도메인 정규화/검증, 상태 안전 파싱, 삭제 레코드 방지(`delTf='N'` 유지)
* 런타임 검증 `assertActiveAndDomainAllowed(siteKey, clientDomain)`

---

## 7) Controller — ✅ 완료

* `POST /api/ai/site-keys?actor=...` (Create)
* `PATCH /api/ai/site-keys/{id}?actor=...` (Partial Update)
* `PATCH /api/ai/site-keys/{id}/status?actor=...` (Status only)
* `GET /api/ai/site-keys` (검색/페이징)
* `GET /api/ai/site-keys/{id}` (상세)
* (선택) `POST /api/ai/site-keys/verify` (키/도메인 확인)
* **delTf는 위 3개 변경 API에서 항상 ‘N’** 유지

---

## 8) 프론트엔드 CMS — ✅ 완료

* **AdminSiteKeys 페이지**
  검색/페이징(공통 Pagination), 생성/수정 모달, 상태 변경, 상세 조회
  Axios `api.ts` + `services/siteKeys.ts` + `hooks/useSiteKeys.ts`
  `?actor=<admin.id>` 쿼리로 컨트롤러와 정합
* Allowed Domains(한 줄 하나) 입력, 즉시 재로딩/토스트 처리

---

## 9) 보안/운영 결정 사항 — ✅ 반영

* **서버 시크릿 키 제외**(후도입 가능)
* **도메인 화이트리스트 + 레이트리밋/쿼터 + CORS 제한** 설계
* 예외/오류 응답 `{code,message}` 매핑(전역 핸들러)
* `delTf` 기본값 N, 변경 API에서 항상 N 유지

---

## 10) 완료 체크리스트

* [x] `ai_site_key` DDL 확정(MVP)
* [x] Entity + JSON 컨버터 + 외부 enum(Status)
* [x] DTO 세트(분리형)
* [x] Mapper(생성/부분수정/응답/요약)
* [x] Repository(기본 + 검색)
* [x] **Service 구현**
* [x] **Controller 구현**
* [x] **CMS 화면(Keys) 스켈레톤 → 실제 연결**
* [x] `/api/ai/complete` 연동 시나리오(키/도메인 검증, 호출 규격) 정리

---

## 다음 작업(삭제 & 관리자 편의 기능)

### A. 삭제/복구(Soft Delete)

* **목표:** 레코드는 보존하되 운영 노출 제외
* **API**

  * `PATCH /api/ai/site-keys/{id}/delete?actor=...` → `delTf='Y'`, `delAdm`, `delDate` 세팅 (**useTf는 그대로**)
  * `PATCH /api/ai/site-keys/{id}/restore?actor=...` → `delTf='N'` 복구
* **Repo/Search 기본 조건:** `WHERE delTf='N'` 기본 필터(관리자 화면에서 “삭제 포함” 토글 제공 가능)
* **UI**

  * 리스트 행 액션: **삭제/복구** 버튼
  * “삭제 포함 보기” 체크박스 + 회색 처리

### B. 관리자 편의(Use 여부/빠른 토글 등)

* **use_tf 토글**(운영 중 임시 OFF):

  * `PATCH /api/ai/site-keys/{id}/use?actor=...` with `{use:true|false}`
  * 런타임 검증 시 `isActive()`가 **status + use_tf**를 함께 고려
* **일괄 작업(Batch)**

  * 선택행 다중 상태 변경 / use_tf 토글 / 삭제
* **검색 UX 보완**

  * 필터: `status`, `planCode`, `regDate` 범위
  * 정렬 프리셋: 최신 생성/최근 수정/플랜/상태
* **감사 추적**

  * 상태/토글/삭제 시 **notes(사유)** 입력 → `notes` 누적 또는 별도 `ai_site_key_event`(이력) 테이블
* **보기 전환**

  * 컬럼 커스터마이즈(도메인 카운트/쿼터 표시)
  * CSV 내보내기(현재 검색 결과)

### C. 운영 가드(옵션)

* **중복/오타 방지**: siteKey 정규식(`^[A-Z0-9\-]{4,64}$`) 서버·클라이언트 동시 적용
* **도메인 템플릿**: 자주 쓰는 세트(예: `localhost`, `*.school.kr`) 프리셋 삽입
* **권한**: actor 로깅 + 관리자 롤별 버튼 노출 제어

---
