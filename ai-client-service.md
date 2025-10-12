# HSBS SaaS Chat Bot — 진행 내역 요약(Markdown)

##  오늘의 범위

* **엔드투엔드 목표:** `ai_site_key`를 중심으로 DB → BE → FE(CMS)의 **최소 가동 라인** 확보
* **진행 순서:** DDL → Entity → DTO → Mapper → Repository
* **의사결정:** 서버 **시크릿 키는 MVP에서 제외** (복잡도↓, 필요시 후도입)

---

## 1) DB 설계 (MySQL 8)

### `ai_site_key` DDL (MVP, 서버 시크릿 제외)

* **핵심 필드:**
  `site_key(UNIQUE)`, `status(ACTIVE|SUSPENDED|REVOKED)`, `plan_code`,
  `daily_call_limit`, `daily_token_limit`, `monthly_token_limit`, `rate_limit_rps`,
  `allowed_domains(JSON)`, `default_widget_config_id`, `default_prompt_profile_id`, `notes`,
  **Audit**: `use_tf, del_tf, reg_adm, reg_date, up_adm, up_date, del_adm, del_date`
* **인덱스:** `status`, `plan_code`, `reg_date`, `default_*_id`
* **메모:** `allowed_domains`는 `JSON_CONTAINS`로 검사(필요 시 정규화 테이블로 분리 가능)

---

## 2) Entity (Spring Boot + JPA)

### `SiteKey` (엔티티)

* 필드: DDL과 1:1 매핑
* `status`: **외부 enum** `com.hbs.hsbbo.admin.ai.sitekey.domain.type.Status`
* `allowedDomains`: `List<String>` ↔ MySQL `JSON` 매핑을 위한 **`StringListJsonConverter`** 사용
* 편의 메서드:

  * `isActive()`: 상태/사용 여부 종합 판단
  * `isDomainAllowed(host)`: **와일드카드(`*.example.com`) 지원** 포함

### `Status` (외부 enum)

```java
ACTIVE, SUSPENDED, REVOKED
+ parseOrDefault(String s, Status def)
```

* **대소문자/공백 허용** 및 안전 파싱(실패 시 기본값)

---

## 3) DTO (가독성/유지보수 중심, 분리형)

* `SiteKeyCreateRequest` (Create)
* `SiteKeyUpdateRequest` (Update/Partial)
* `SiteKeyStatusRequest` (상태만 변경)
* `SiteKeyQuery` (검색/페이징)
* `SiteKeyResponse` (상세)
* `SiteKeySummaryResponse` (요약 리스트)
* `PagedResponse<T>` (공통 페이지 응답)

**검증 포인트**

* `@Pattern("ACTIVE|SUSPENDED|REVOKED")` 로 1차 방어
* 길이/음수 금지, 리스트 사이즈 제한 등 적용

---

## 4) Mapper (정적 유틸)

* `toEntity(SiteKeyCreateRequest, regAdm)`

  * 문자열 `trim`, `Status.parseOrDefault(..., ACTIVE)` **기본값**
* `applyUpdate(SiteKey, SiteKeyUpdateRequest, upAdm)`

  * **null 아닌 필드만 부분 업데이트**
  * `Status.parseOrDefault(req.getStatus(), e.getStatus())`
* `toResponse(SiteKey)` / `toSummary(SiteKey)`

  * `status.name()` 문자열화, `domainCount` 계산, 감사필드 포함

---

## 5) Repository

### 기본 Repository

```java
SiteKeyRepository extends JpaRepository<SiteKey, Long>, SiteKeyRepositoryCustom
- findBySiteKey(String)
- existsBySiteKey(String)
- findAllByStatus(Status, Pageable)
- @Modifying updateStatus(id, status, upAdm)
```

### 커스텀 검색 (Criteria API)

* `Page<SiteKey> search(SiteKeyQuery query)`

  * `keyword`(siteKey/notes LIKE)
  * `planCode`(EQ)
  * `status`(enum 매핑)
  * 다중정렬 `"regDate,desc;planCode,asc"` 지원
* 페이징 + 카운트 쿼리 포함

---

## 6) 백엔드 다음 단계(예고)

### Service (권장 역할)

* **Create**

  * `siteKey` 중복 검사 → 저장
  * `allowedDomains` 정제/중복 제거
* **Update**

  * 엔티티 조회 → **Mapper.partial** → 저장
* **Status 변경**

  * `updateStatus()` JPQL 업데이트 + `upAdm` 기록
* **런타임 검증 유틸**

  * `assertActiveAndDomainAllowed(siteKey, clientDomain)`

### Controller (예고되는 엔드포인트)

* `POST /api/ai/site-keys` (Create)
* `PATCH /api/ai/site-keys/{id}` (Partial Update)
* `PATCH /api/ai/site-keys/{id}/status` (상태만)
* `GET /api/ai/site-keys` (검색/페이징)
* `GET /api/ai/site-keys/{id}` (상세)
* `GET /api/ai/site-keys/by-key/{siteKey}` (런타임 확인용)

---

## 7) 프론트엔드 CMS (스켈레톤, 예고)

* **Keys 페이지**

  * 리스트(요약), 생성/수정 모달, 상태 토글, 도메인 화이트리스트 편집
* **검증 가이드**

  * siteKey 중복 체크, 도메인 입력시 `*.example.com` 허용 안내

---

## 8) 보안/운영 결정 사항

* **서버 시크릿 키(관리/웹훅용)**: **MVP에서 제외**

  * 필요시 후속 마이그레이션/미들웨어로 도입 (회전/last4/prefix/해시 저장 패턴)
* **런타임 가드**

  * `X-Site-Key` + **도메인 화이트리스트** + 레이트리밋 + 일일쿼터
  * CORS / Origin·Referer 점검
* **로깅**

  * 모든 API에 `corrId` 주입 권장(추적성↑)

---

## 9) 완료 체크리스트

* [x] `ai_site_key` DDL 확정(MVP)
* [x] Entity + JSON 컨버터 + 외부 enum(Status)
* [x] DTO 세트(분리형)
* [x] Mapper(생성/부분수정/응답/요약)
* [x] Repository(기본 + 검색)
* [ ] **Service 구현**
* [ ] **Controller 구현**
* [ ] **CMS 화면(Keys) 스켈레톤**
* [ ] `/api/ai/complete`와의 런타임 연동 시나리오 문서화

---

