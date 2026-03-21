# HSBS LangGraph Architecture Interpretation

## 1. Overview

HSBS는 CMS + AI SaaS 구조이지만  
AI 실행 흐름 관점에서는 **Graph 기반 AI Orchestration 구조**로 해석할 수 있다.

HSBS의 핵심 특징:

- PromptProfile 기반 Prompt orchestration
- KB 기반 RAG retrieval pipeline
- Multi-tenant (siteKey) isolation
- Java → Python → OpenAI execution flow
- 정책 / 가드레일 / 스타일 / 툴 조립 구조

즉 HSBS는 내부적으로:

> Prompt Assembly Graph + Retrieval Graph + Execution Graph 구조

로 볼 수 있다.

---

## 2. Current HSBS AI Flow

현재 실제 실행 흐름:

React Admin  
→ Spring Boot  
→ PromptProfile 조립  
→ KB context 조립  
→ FastAPI Brain  
→ OpenAI 호출  
→ 응답 반환  

LangGraph 관점:

이미 Node 기반 Pipeline 구조이다.

---

## 3. LangGraph Node Mapping

### Node 1 — Tenant Resolution Node

역할:

- siteKey / tenantId 확정
- PromptProfile tenant scope 필터링

LangGraph 의미:

Graph state 초기화 노드

---

### Node 2 — PromptProfile Load Node

역할:

- PromptProfile 로딩
- 상태 필터링 (DRAFT / ACTIVE / ARCHIVED)

LangGraph 의미:

Prompt 정책 로딩 노드

---

### Node 3 — Prompt Assembly Node

역할:

- systemTpl
- guardrailTpl
- styleJson
- policiesJson
- toolsJson

조립

LangGraph 의미:

Prompt transformation node

HSBS 핵심 Brain 역할

---

### Node 4 — Retrieval Node (RAG)

역할:

- KB Document 기반 context 조립

구조:

kb_source  
→ kb_document  
→ kb_job  
→ kb_binding  

LangGraph 의미:

Retriever Node

---

### Node 5 — Quota / Guard Node

역할:

- Daily quota control
- abuse protection

LangGraph 의미:

Execution Gate Node

---

### Node 6 — LLM Execution Node

역할:

- OpenAI 호출
- HTTP 설정
- timeout / retry 관리

LangGraph 의미:

External LLM Execution Node

---

### Node 7 — Response Structuring Node

역할:

- token 정보 포함 응답 구성
- structured output 생성

LangGraph 의미:

Output Formatter Node

---

## 4. Full LangGraph Interpretation

HSBS 전체 Graph 구조:

User Input  
→ Tenant Node  
→ PromptProfile Node  
→ Prompt Assembly Node  
→ Retrieval Node  
→ Quota Node  
→ LLM Execution Node  
→ Response Node  

---

## 5. Important Insight

HSBS는 이미 LangGraph 구조로 확장 가능한 상태이다.

이유:

- Prompt Assembly 분리
- Retrieval 독립 구조
- Execution Layer Python 분리
- Multi-tenant context 존재
- Guardrail / policy 구조 존재

즉:

> HSBS는 Graph AI System으로 진화 직전 상태

---

## 6. LangGraph 적용 시 예상 Graph 구조

Graph

- resolveTenant
- loadPromptProfile
- assemblePrompt
- retrieveContext
- quotaCheck
- callLLM
- formatResponse

---

## 7. Future Evolution Possibilities

LangGraph 적용 시 가능:

- Tool routing agent
- Multi-step reasoning agent
- Self-reflection agent
- KB planner agent
- Dynamic prompt mutation
- conversation memory graph

즉:

HSBS → AI Orchestration Platform 가능

---

## 8. Architectural Conclusion

현재 HSBS:

CMS + AI 호출 시스템

LangGraph 적용 시:

AI orchestration platform