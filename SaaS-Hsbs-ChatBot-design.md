# 🧩 HSBS AI Chatbot CMS — 데이터베이스 & RAG 설계 개요

> **목적**  
> 멀티 테넌트 챗봇 관리, 위젯 커스터마이징, 프롬프트 제어에 더해  
> **RAG(지식 베이스)**와 **도메인 특화 에이전트(Agent)**를 지원하는  
> **HSBS AI Chatbot CMS**의 전체 데이터 모델 구조를 정의합니다.
>
> 모든 도메인은 공통 `AuditBase` 필드를 상속합니다:
> ```java
> use_tf, del_tf,
> reg_adm, reg_date,
> up_adm,  up_date,
> del_adm, del_date
> ```

---

## 🧱 1️⃣ Phase 1 — Core SaaS (이미 구현된 영역 중심)

> **역할**  
> - 외부 사이트 식별 (SiteKey)  
> - 도메인 화이트리스트  
> - 위젯(버블/헤더/컬러/퀵리플라이 등) 설정  
> - 프롬프트 프로필(모델/파라미터/가드레일) 설정  
> - SiteKey 단위의 **호출 횟수 쿼터(dailyCallLimit)**

### 1-1. `ai_site_key` — 테넌트 & 접근 제어

| 컬럼 | 설명 |
|------|------|
| `id` (PK) | 내부 식별자 |
| `tenant_id` | (옵션) 기업/고객 단위 테넌트 식별자 |
| `site_key` | 외부에 노출되는 API 키 (예: `HSBS-DEMO-FREE-01`) |
| `site_name` | 사이트 / 서비스 명 |
| `plan_code` | FREE / PRO / ENT 등 요금제 코드 |
| `status` | ACTIVE / SUSPENDED / REVOKED |
| `daily_call_limit` | 일일 호출 횟수 한도 (정식 플랜용) |
| `daily_token_limit` | (추후) 일일 토큰 한도 |
| `monthly_token_limit` | (추후) 월간 토큰 한도 |
| `allowed_domains_json` | 도메인 화이트리스트 (`["hsbs.kr","foo.com"]`) |
| `default_widget_config_id` | 기본 위젯 설정 FK |
| `default_prompt_profile_id` | 기본 프롬프트 프로필 FK |
| `use_tf`, `del_tf`, ... | AuditBase 공통 필드 |

> **용도**  
> - `/api/ai/complete3`에서 **siteKey + host 기반 검증**  
> - siteKey별 **쿼터(dailyCallLimit)** 로직에 사용  

---

### 1-2. `ai_widget_config` — 위젯 브랜딩 & UX

| 컬럼 | 설명 |
|------|------|
| `id` (PK) | 내부 식별자 |
| `site_key_id` | 어느 SiteKey에 매핑되는지 |
| `position` | 버블 위치 (left/right) |
| `offset_x`, `offset_y` | 화면 우하단으로부터 거리(px) |
| `panel_width_px` | 패널 너비 |
| `panel_max_height_px` | 최대 높이 |
| `brand_name` | 헤더에 표시할 브랜드 명 |
| `panel_title` | 패널 타이틀 (예: "입학 상담 도우미") |
| `welcome_text` | 환영 문구 |
| `input_placeholder` | 입력창 플레이스홀더 |
| `bubble_icon_emoji` | 버블 이모지 (💬 등) |
| `logo_url` | 헤더 로고 이미지 경로 |
| `bubble_icon_url` | 버블 이미지 경로 |
| `primary_color` | 포인트 색상 |
| `panel_bg_color`, `panel_text_color` | 패널 배경/글자색 |
| `header_bg_color`, `header_border_color` | 헤더 색상 |
| `input_bg_color`, `input_text_color` | 입력창 색상 |
| `welcome_quick_replies_json` | 환영 퀵리플라이 JSON 배열 |
| `open_on_load` | 페이지 로드시 자동 열기 여부 |
| `close_on_esc`, `close_on_outside_click` | ESC/바깥 클릭 닫기 옵션 |
| `use_tf`, `del_tf`, ... | AuditBase 공통 필드 |

> **용도**  
> - `hsbs-chat.js`에서 `/ai/public/widget-config` 호출 → CSS 변수/DOM 구성에 사용  
> - 퀵리플라이, 환영 문구, 버튼 스타일, 위치 설정 등 **브랜딩 옵션 전체** 저장  

---

### 1-3. `ai_prompt_profile` — 프롬프트 & 모델 설정

| 컬럼 | 설명 |
|------|------|
| `id` (PK) | 내부 식별자 |
| `tenant_id` | 테넌트 식별자 |
| `name` | 프로필 이름 (예: “기본 Q&A”, “입학 FAQ 전용”) |
| `purpose` | 용도 설명 |
| `model` | OpenAI 모델명 (기본 `gpt-4o-mini`) |
| `temperature`, `top_p` | 샘플링 파라미터 |
| `max_tokens` | 응답 최대 토큰 |
| `freq_penalty`, `presence_penalty` | 페널티 옵션 |
| `seed` | 재현성용 seed |
| `system_tpl` | 기본 system 프롬프트 |
| `guardrail_tpl` | 가드레일 규칙 텍스트 |
| `style_json` | 말투/스타일 JSON 문자열 |
| `tools_json` | OpenAI tools 정의 JSON |
| `policies_json` | 금칙어/규정 JSON |
| `stop_json` | stop 시퀀스 JSON |
| `version` | 프로필 버전 번호 |
| `prompt_status` | DRAFT / ACTIVE / DEPRECATED 등 |
| `use_tf`, `del_tf`, ... | AuditBase 공통 필드 |

> **OpenAI 매핑 방식**  
> - `system_tpl` + `guardrail_tpl` + `style_json` + `policies_json` → 하나의 **system 메시지**로 조립  
> - `context` (RAG 결과 등) → 별도의 user 메시지로 추가  
> - 마지막 user 메시지 → 실제 사용자 질문  

---

### 1-4. 최소 쿼터 구조 (Caffeine 기반)

> 지금은 DB가 아니라 메모리(Caffeine) 기준으로 **SiteKey의 일일 호출 횟수**만 제어.

- `DailyQuotaSupport`  
  - `tryConsume("sk:" + siteKey, dailyCallLimit)`  
  - `remaining("sk:" + siteKey, dailyCallLimit)`

**정책**

- `site_key.daily_call_limit > 0`  
  → 해당 값만 기준으로 제한  
- `daily_call_limit`가 null/0 (데모키)  
  → IP 기준 기본 한도(예: 10회)만 적용  

> **추후**: 토큰 기반 쿼터는 RAG/Agent 이후로 미루고,  
> 대신 **도메인 서비스 품질(RAG/Agent)** 먼저 완성하는 전략.

---

## 📚 2️⃣ Phase 2 — RAG 지식 베이스 구조

> **목적**  
> 사이트키별로 PDF/엑셀/문서를 업로드하면,  
> 챗봇이 그 **공식 문서 내용을 찾아서 답**할 수 있도록 RAG 기반 지식 베이스를 제공.

### 2-1. `ai_knowledge_base` — 지식 베이스 단위

| 컬럼 | 설명 |
|------|------|
| `id` (PK) | 내부 식별자 |
| `site_key_id` | 어느 SiteKey에 속한 KB인지 |
| `name` | KB 이름 (예: “2026 입학요강”, “상품/배송 FAQ”) |
| `description` | 설명 |
| `vector_model` | 임베딩 모델명 (예: `text-embedding-3-small`) |
| `status` | ACTIVE / INDEXING / DISABLED |
| `use_tf`, `del_tf`, ... | AuditBase 공통 필드 |

> 한 SiteKey 안에 **여러 KB**를 둘 수 있음.  
> (예: “입학 FAQ”, “장학금 규정”, “기숙사 안내” 등)

---

### 2-2. `ai_knowledge_document` — 원문 파일 단위

| 컬럼 | 설명 |
|------|------|
| `id` (PK) | 내부 식별자 |
| `kb_id` | FK → `ai_knowledge_base.id` |
| `title` | 문서 제목 (파일명 또는 관리자 입력) |
| `file_path` | 저장된 파일 경로 (S3/local) |
| `mime_type` | pdf / xlsx / docx / txt 등 |
| `size_bytes` | 파일 크기 |
| `source_type` | FILE / URL / MANUAL 등 |
| `status` | UPLOADED / PARSED / EMBEDDED / ERROR |
| `error_message` | 파싱/임베딩 중 오류 내용 |
| `use_tf`, `del_tf`, ... | AuditBase 공통 필드 |

> 업로드 → 파싱 → chunk 생성/임베딩 단계별 상태를 관리.

---

### 2-3. `ai_knowledge_chunk` — 검색용 텍스트 조각

| 컬럼 | 설명 |
|------|------|
| `id` (PK) | 내부 식별자 |
| `kb_id` | FK → `ai_knowledge_base.id` |
| `doc_id` | FK → `ai_knowledge_document.id` |
| `seq_no` | 문서 내 순서 |
| `content` | 실제 텍스트 (문단/셀/페이지 일부) |
| `metadata_json` | `{ "page": 3, "section": "2.1 수시전형", "sheet": "상품목록", "row": 12 }` 등 |
| `embedding_key` | 외부 벡터 DB key 또는 인덱스ID |
| `use_tf`, `del_tf`, ... | AuditBase 공통 필드 |

> 벡터 자체는 외부 DB(Qdrant/Supabase 등)에 저장하고,  
> 여기에는 “어떤 chunk인지/어디서 왔는지” 메타를 관리.

---

### 2-4. 질의 시 RAG 흐름

1. `/complete3`에서 SiteKey / PromptProfile 조회
2. PromptProfile에 **RAG 옵션** 추가:
   - `use_rag` (Y/N)
   - `knowledge_base_id`
   - `rag_top_k`, `rag_max_tokens`
3. `use_rag == Y` 인 경우:
   - `ragService.retrieve(kbId, userPrompt, topK)`  
   - → 연관 chunk 리스트 + score
4. PromptProfile 조립 시:
   - context에  
     ```text
     아래는 공식 문서에서 발췌한 내용입니다. 이 정보만 근거로 답변하십시오.

     [1] ...
     [2] ...
     [3] ...
     ```
   - 또는 systemTpl에 “반드시 아래 source들만 근거로 답한다” 가드레일 추가

> 이렇게 하면 **“입학요강 PDF 기반 입시 안내 챗봇”**,  
> **“상품 스펙 엑셀 기반 쇼핑몰 챗봇”**을 HSBS에서 바로 구성 가능.

---

## 🤖 3️⃣ Phase 3 — Agent & Tools 확장

> **목적**  
> 단순 RAG를 넘어, **툴 호출 기반 Agent**로 확장  
> (예: 상품 검색, 재고 조회, 일정 조회, 신청서 작성 등).

### 3-1. `ai_tool_definition` *(선택)*

| 컬럼 | 설명 |
|------|------|
| `id` (PK) | 내부 식별자 |
| `tenant_id` | 테넌트 |
| `name` | 툴 이름 (예: `search_knowledge`, `lookup_product`) |
| `description` | 툴 설명 |
| `openai_json` | OpenAI tools 스키마(JSON) |
| `backend_endpoint` | 실제 호출할 백엔드 URL / 내부 코드 식별자 |
| `timeout_ms` | 타임아웃 |
| `use_tf`, `del_tf`, ... | AuditBase 공통 필드 |

> PromptProfile의 `tools_json`과 연결되어,  
> LLM이 Tool 호출을 결정하면 백엔드에서 실제 실행.

### 3-2. `ai_tool_call_log` *(선택)*

| 컬럼 | 설명 |
|------|------|
| `id` (PK) | |
| `usage_log_id` | 어떤 대화/요청에서 발생했는지 (나중 Phase 4에서 사용) |
| `tool_name` | 호출된 툴 이름 |
| `request_json` | 툴 인자(JSON) |
| `response_json` | 툴 응답(JSON) |
| `status` | SUCCESS / ERROR |
| `elapsed_ms` | 처리 시간 |
| `use_tf`, `del_tf`, ... | AuditBase 공통 필드 |

> 나중에 Agent 디버깅/튜닝용으로 활용.

---

## 📊 4️⃣ Phase 4 — 로그/사용량/비용 (나중에 붙이는 레이어)

> **목적**  
> 상용 서비스로 확장할 때 필요한  
> **사용량 추적, 요금 계산, 모니터링** 기능을 RAG/Agent 이후에 단계적으로 추가.

### 4-1. `ai_usage_log` — 요청/응답 단위 기록

| 컬럼 | 설명 |
|------|------|
| `id` (PK) | |
| `site_key_id` | 어느 사이트키의 호출인지 |
| `prompt_profile_id` | 사용된 프로필 |
| `model` | 실제 사용된 모델명 |
| `user_session_key` | 브라우저/세션 식별자 |
| `request_text` | 사용자 질문 (필요시 마스킹/요약) |
| `response_text` | 응답 본문 (선택 저장) |
| `input_tokens`, `output_tokens`, `total_tokens` | OpenAI usage |
| `status` | OK / 4xx / 5xx / QUOTA_EXCEEDED |
| `ip`, `host`, `user_agent` | 클라이언트 정보 |
| `elapsed_ms` | 전체 응답 시간 |
| `reg_date` | 요청 시각 (AuditBase 포함) |

---

### 4-2. `ai_quota_daily` / `ai_usage_daily_summary`

**`ai_quota_daily`** — 쿼터 관리용 (선택)  
| 컬럼 | 설명 |
|------|------|
| `id` (PK) | |
| `site_key_id` | |
| `yyyymmdd` | 날짜 (UNIQUE with site_key_id) |
| `call_count` | 누적 호출 수 |
| `token_total` | 누적 토큰 수 |
| `call_limit` | 해당 일자 한도(스냅샷) |
| `token_limit` | 토큰 한도(스냅샷) |
| `overflow_flag` | 한도 초과 여부 |

**`ai_usage_daily_summary`** — 분석용 집계 (선택)  
| 컬럼 | 설명 |
|------|------|
| `id` (PK) | |
| `site_key_id` | |
| `yyyymmdd` | 날짜 |
| `total_calls` | 호출 수 |
| `total_tokens` | 총 토큰 |
| `total_cost_krw` | 비용 스냅샷 |
| `use_tf`, `del_tf`, ... | |

---

### 4-3. 기타 운영/분석용 테이블 (옵션)

| 테이블 | 목적 (사용 시기) |
|--------|------------------|
| `ai_feedback` | 응답 단위 👍/👎 + 코멘트 저장, UX 고도화 시점 |
| `ai_chat_session` | 세션 단위 컨텍스트 요약/마지막 활동 시각 관리 |
| `ai_model_price` | 모델별 단가 관리(1000토큰당 원가/판매가) |
| `ai_webhook` | 쿼터 초과/에러/피드백 발생 시 콜백 설정 |
| `ai_error_log` | 에러 상세 정보 및 트레이스 저장 |
| `ai_prompt_history` | PromptProfile 버전 이력/롤백용 |

> 이 레이어는 **서비스가 실제로 고객에게 제공되기 시작한 이후**  
> 운영 니즈에 맞춰 점진적으로 붙이면 됨.

---

## 🧠 엔티티 상속 및 연관 구조 (요약)

```text
AuditBase
 ├─ use_tf, del_tf
 ├─ reg_adm, reg_date
 ├─ up_adm,  up_date
 └─ del_adm, del_date

ai_site_key
 ├─ 1 : N → ai_widget_config
 ├─ 1 : N → ai_prompt_profile (또는 기본 프로필 FK)
 ├─ 1 : N → ai_knowledge_base
 ├─ 1 : N → ai_usage_log (Phase 4)
 ├─ 1 : N → ai_quota_daily / ai_usage_daily_summary (Phase 4)
 └─ 1 : N → ai_chat_session / ai_webhook / ai_error_log (옵션)

ai_widget_config
 └─ N : 1 → ai_site_key

ai_prompt_profile
 ├─ N : 1 → ai_site_key (또는 tenant 단위 공유)
 └─ 1 : N → ai_prompt_history (Phase 4)

ai_knowledge_base
 ├─ N : 1 → ai_site_key
 ├─ 1 : N → ai_knowledge_document
 └─ 1 : N → ai_knowledge_chunk

ai_knowledge_document
 └─ 1 : N → ai_knowledge_chunk

ai_usage_log (Phase 4)
 ├─ N : 1 → ai_site_key
 ├─ N : 1 → ai_prompt_profile
 └─ 1 : 1 → ai_feedback, ai_tool_call_log (옵션)

ai_tool_definition / ai_tool_call_log (Phase 3)
 └─ Agent용 tool 설정 및 호출 추적
