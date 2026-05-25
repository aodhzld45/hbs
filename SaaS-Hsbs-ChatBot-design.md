# SaaS HSBS ChatBot 고도화 설계안 (구성도 기반)

## 1. 문서 목적
- 기존 HSBS 공용 JS 임포트 기반 챗봇을 SaaS 형태로 통합 운영한다.
- OpenAI API, RAG, NLU, ChatFlow GUI를 Back Office(BO) 중심으로 확장한다.
- 본 문서는 구현 코드가 아닌 서비스/시스템 설계 기준을 제시한다.

## 2. 목표 범위
- OpenAI API를 최대 활용한 BO 기능 고도화
- NLU 학습/평가/배포 운영 체계 수립
- ChatFlow 기반 시나리오 편집 GUI와 운영 UX 제공

## 3. 전체 아키텍처
1. 채널 계층
- 웹 위젯(SiteKey), 관리자 콘솔, 외부 SaaS 임베드, 음성 채널(STT/TTS)

2. 대화 엔진 계층
- 의도추론(RULE + ML + 사전)
- 대화처리(ChatFlow + 지식검색)
- 대화답변생성(기본답변 + 시나리오답변 + 지식답변)
- 대화이력저장(의도/흐름/툴 호출/응답)

3. 운영 계층
- 학습관리(학습, 데이터 보완/신규 생성, 자산 관리)
- 관리(모니터링, 사후관리, 테스팅)

## 4. 구성도 영역별 상세 설계

### 4.1 대화 엔진
#### 의도추론
- RULE 기반
- 금칙어, 정책 위반, 긴급 상황 키워드 탐지
- 기계학습 기반
- Intent 분류, Entity 추출, 신뢰도 점수 산출
- 사전 수정/생성
- 동의어/도메인 용어/사용자 표현 사전 운영

#### 대화처리
- 대화시나리오
- ChatFlow 노드 기반 진행(질문, 조건분기, 툴 호출, 종료)
- 지식정보검색
- OpenAI `responses.create` + `file_search(vector_store_ids)` 기반 RAG

#### 대화답변생성
- 기본답변
- FAQ/룰 기반 빠른 응답
- 대화시나리오 기반답변
- 상태/슬롯 기반 응답
- 지식정보답변
- 검색 근거 문서 포함 응답
- Function calling
- 태그 추출, 내부 API 연동, 운영 액션 수행

#### 대화이력저장
- 의도추론 이력 저장
- 대화흐름 처리 이력 저장
- RAG 검색 결과, 툴 호출 결과, 최종 응답 저장
- tenant/siteKey/conversation 단위로 분리

### 4.2 학습관리
#### 학습
- 대화 이력 기반 학습 데이터 추천
- 실패 응답, 재질문, 이탈 세션 자동 수집
- 예문 기반 학습
- Intent/Entity 학습셋 버전 관리 및 재학습

#### 데이터 보완/신규 생성
- 의도 파악 데이터 수정/생성
- 대화 시나리오 수정/생성
- 사전 수정/생성

#### 데이터
- 언어자원, 학습모델, QA Set, 시나리오, 대화이력, 챗봇관리
- 추가 관리 대상
- PromptProfile, WidgetConfig, Tool Registry, Vector Store 메타

### 4.3 관리
#### 모니터링
- 사용량, 응답률, 사용자 평가, 사용순위, 학습결과
- 토큰/비용/지연시간/모델별 성공률 대시보드

#### 사후관리
- 로그 관리(감사/오류/추론 경로)
- 사용자 만족도 측정/관리(CSAT, 해결률)

#### 테스팅
- 챗봇 시뮬레이션(시나리오 리플레이)
- 대량 테스트(회귀, A/B, 모델 비교)

## 5. OpenAI 중심 BO 기능 설계

### 5.1 Prompt/Model 운영
- PromptProfile 버전 관리
- `system_tpl`, `guardrail_tpl`, `temperature`, `top_p`, `max_tokens`
- 환경별 배포(dev/stage/prod), 롤백, A/B 테스트
- 질문 유형별 모델 라우팅(비용/지연/품질 기준)

### 5.2 RAG 운영
- 문서 업로드, 파싱, 청크, 인덱싱, 재색인 스케줄
- `responses.create(... tools=[{"type":"file_search"...}])` 운영 정책화
- 근거기반 응답률, 검색 hit-rate, 미탐지 문서 분석

### 5.3 Function Calling 운영
- 함수 스키마 레지스트리(JSON Schema)
- 호출 권한 화이트리스트 및 실패 재시도 정책
- 태그 추출 표준 함수 제공

### 5.4 운영 거버넌스
- SiteKey 기반 호출 제어 및 도메인 허용 정책
- 권한 분리(RBAC), 감사 로그, 키 로테이션
- PII 마스킹 및 보관 주기 정책

## 6. NLU 학습 설정 설계
- Intent 스키마
- 예: 상품문의, 환불문의, 배송문의, 상담원연결
- Entity 스키마
- 예: 주문번호, 상품명, 날짜, 지점명
- 학습 파이프라인
- 로그 수집 -> 라벨링 -> 데이터셋 버전 -> 학습 -> 오프라인 평가 -> 점진 배포
- 운영 파라미터
- confidence threshold, fallback 정책, 다국어 정책
- fallback 순서
- RULE -> FAQ -> RAG -> 상담원 핸드오프

## 7. ChatFlow GUI 및 UX 설계
- 드래그앤드롭 플로우 빌더
- 노드: Ask, Condition, RAG Search, Function Call, Handoff, End
- 시뮬레이터
- 테스트 대화 리플레이, 중간 노드 값 확인
- 트레이싱 뷰어
- 의도 결과, 선택 분기, 검색 문서, 함수 호출 결과 시각화
- 배포 워크플로
- Draft -> Review -> Approved -> Active

## 8. 핵심 데이터 모델(요약)
- `ai_site_key`
- 테넌트, 허용 도메인, 사용량 제한, 상태
- `ai_widget_config`
- 아이콘/테마/레이아웃/오프셋
- `ai_prompt_profile`
- 모델/프롬프트/가드레일/툴 설정
- `ai_knowledge_base`, `ai_knowledge_document`, `ai_knowledge_chunk`
- RAG 문서 자산
- `ai_intent`, `ai_entity`, `ai_nlu_dataset`, `ai_nlu_model_version`
- NLU 학습 자산
- `ai_chat_session`, `ai_chat_message`, `ai_chat_trace`
- 대화/추론/실행 로그

## 9. 단계별 추진안
1. Phase 1 (4~6주)
- PromptProfile/WidgetConfig/SiteKey 운영 안정화
- OpenAI 응답 로깅, 비용/품질 대시보드 구축

2. Phase 2 (4주)
- Vector Store 기반 RAG 운영
- 태그 추출 Function calling 및 운영 정책 적용

3. Phase 3 (4주)
- NLU 학습 루프 + ChatFlow GUI + 시뮬레이터 완성

## 10. 기대 효과
- 사이트별 맞춤형 챗봇을 중앙 BO에서 일관 운영
- 응답 품질과 운영 효율을 데이터 기반으로 개선
- 신규 도메인/고객사 온보딩 리드타임 단축
