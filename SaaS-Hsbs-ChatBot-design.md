# 🧩 HSBS AI Chatbot CMS — 데이터베이스 설계 개요
  
> **목적**  
> 멀티 테넌트 챗봇 관리, 위젯 커스터마이징, 프롬프트 제어, 사용량/요금 추적을 지원하는 **HSBS AI Chatbot CMS**의 전체 데이터 모델 구조를 정의합니다.  
>  
> 모든 테이블은 `AuditBase` 공통 필드를 상속합니다:
> ```java
> use_tf, del_tf, reg_adm, reg_date, up_adm, up_date, del_adm, del_date
> ```
  
---
  
## 🧱 1️⃣ MVP (최소가동) — **5개 테이블**
  
> **상용 흐름 전체**를 포괄: 사이트키 발급 → 위젯 설정 → 프롬프트 적용 → 요청 한도/사용 로그.
  
| 테이블 | 목적 | 주요 컬럼 / 비고 |
|---|---|---|
| **`ai_site_key`** | 외부 사이트 식별/도메인 화이트리스트 | `site_key`, `site_name`, `allowed_domains(JSON)`, `plan_code`, `status`, FK(`widget_config_id`, `prompt_profile_id`) |
| **`ai_widget_config`** | 챗 위젯 브랜딩/레이아웃 옵션 | `theme(light/dark)`, `bubble_icon_url`, `welcome_message`, `color_primary`, `position`, `radius`, `font` 등 |
| **`ai_prompt_profile`** | 시스템/가드레일 프롬프트 설정 | `profile_name`, `system_prompt`, `temperature`, `max_tokens`, `use_for(site/chat/summary)` |
| **`ai_usage_log`** | 모든 AI 요청/응답 단위 기록 | FK(`site_key_id`), `model`, `tokens_in/out/total`, `latency_ms`, `cost_krw`, `ip`, `user_agent`, `status` |
| **`ai_quota_daily`** | 사이트키별 일일 사용 카운터 | FK(`site_key_id`), `date`, `used_count`, `quota_limit`, `overflow_flag` |
  
**✅ 결과**
- 등록 → 설정 → 한도관리까지 **SaaS 최소 기능 완결**.
- 전 테이블 `AuditBase` 상속.
  
---
  
## ⚙️ 2️⃣ Standard(운영 고도화) — **+3 ~ 4개**
  
> 피드백, 세션, 요금(모델단가), 웹훅 등 **CMS 운영 기능 확장**.
  
| 테이블 | 목적 | 주요 컬럼 / 비고 |
|---|---|---|
| **`ai_feedback`** *(선택)* | 응답 단위 사용자 피드백 | FK(`usage_log_id`), `rating(1~5)`, `comment`, `user_session_key` |
| **`ai_chat_session`** *(선택)* | 대화 세션 컨텍스트 유지 | FK(`site_key_id`), `session_key(UUID)`, `summary_text`, `last_prompt_at` |
| **`ai_model_price``** *(선택)* | OpenAI 모델별 단가 관리 | `model_name`, `input_price_per_1k`, `output_price_per_1k`, `currency`, `effective_date` |
| **`ai_webhook`** *(선택)* | 이벤트별 웹훅 등록 | FK(`site_key_id`), `event_type(limit_reached,error,feedback)`, `callback_url`, `enabled` |
  
**✅ 결과**
- 고객 피드백/세션 기반 안정 운영.
- **모델단가 관리**로 정확한 비용 산출, **외부 알림** 연계.
  
---
  
## 📊 3️⃣ Extended(분석/감사 레이어) — **+2 ~ 3개**
  
> 장기 집계/추적 데이터로 **대시보드 성능**과 **변경 이력 관리** 강화.
  
| 테이블 | 목적 | 주요 컬럼 / 비고 |
|---|---|---|
| **`ai_error_log`** | 상세 에러 추적 | FK(`site_key_id`), `status_code`, `error_message`, `trace_id`, `occurred_at` |
| **`ai_usage_daily_summary`** | 일 단위 집계 | FK(`site_key_id`), `date`, `total_calls`, `total_tokens`, `total_cost_krw` |
| **`ai_prompt_history`** | 프롬프트 버전 이력 | FK(`prompt_profile_id`), `version`, `content`, `updated_by`, `updated_at` |
  
**✅ 결과**
- 트렌드 분석/리포팅 최적화.
- 프롬프트 **버전 롤백/A·B 테스트** 및 감사를 용이하게 함.
  
---
  
## 🧩 4️⃣ 단계별 테이블 수 요약
  
| 단계 | 테이블 | 목적 | 합계 |
|---|---|---|---|
| **Phase 1 (MVP)** | `ai_site_key`, `ai_widget_config`, `ai_prompt_profile`, `ai_usage_log`, `ai_quota_daily` | 코어 SaaS 흐름 | **5** |
| **Phase 2 (Standard)** | + `ai_feedback`, `ai_chat_session`, `ai_model_price`, `ai_webhook` | 운영 고도화 | **8~9** |
| **Phase 3 (Extended)** | + `ai_error_log`, `ai_usage_daily_summary`, `ai_prompt_history` | 분석/감사 레이어 | **10~12** |
  
---
  
## 🧠 엔티티 상속 및 연관 구조
  
```
AuditBase
 ├─ 공통필드: use_tf, del_tf, reg_adm, reg_date, up_adm, up_date, del_adm, del_date
 └─ 모든 도메인 테이블이 상속(논리삭제/표시여부/감사 메타 일원화)

ai_site_key
 ├─ 1 : 1 → ai_widget_config (옵션)
 ├─ 1 : 1 → ai_prompt_profile (옵션)
 ├─ 1 : N → ai_usage_log
 ├─ 1 : N → ai_quota_daily
 ├─ 1 : N → ai_chat_session (옵션)
 ├─ 1 : N → ai_webhook (옵션)
 └─ 1 : N → ai_error_log / ai_usage_daily_summary

ai_prompt_profile
 └─ 1 : N → ai_prompt_history (버전 관리)

ai_usage_log
 └─ 1 : 1 → ai_feedback (옵션)

ai_model_price
 └─ 모델명/시점 기준의 참조(조인)로 비용 산출
```
  
---
  
## 🔎 구현 팁 & 권장 인덱스
  
- **핵심 인덱스**
  - `ai_usage_log(site_key_id, reg_date DESC)`: 최근 로그 조회 최적화
  - `ai_quota_daily(site_key_id, date UNIQUE)`: 일일 중복 방지 + upsert 편의
  - `ai_model_price(model_name, effective_date DESC)`: 최신 단가 조회
  - `ai_prompt_history(prompt_profile_id, version DESC)`: 최신 버전 빠른 접근
- **JSON 컬럼**
  - `allowed_domains`는 **정규화 vs JSON** 선택 가능. 도메인 검증 빈도↑면 별도 테이블 `ai_site_domain(site_key_id, domain)` 권장.
- **비용 산출**
  - `total_tokens * (단가/1000)` 기반으로 계산 후 `cost_krw` 스냅샷 저장(단가 변경에도 과거 정산 불변).
- **쿼터 처리**
  - `ai_quota_daily`는 **(site_key_id, date) 고유키**로 증가 연산(낙관적 잠금 또는 DB 원자 연산) 권장.
- **오류 추적**
  - `trace_id`(또는 `request_id`)를 FE/BE/LLM 호출 전 생성하여 전 구간에 전파.
  
---

  

