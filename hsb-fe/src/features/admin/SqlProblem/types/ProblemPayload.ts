// src/features/SqlProblem/types/ProblemPayload.ts
import type { ConstraintRule } from './ProblemItem';

export type TestcaseVisibility = 'PUBLIC' | 'HIDDEN';

/** 채점 모드 */
export type ExpectedMode =
  | 'SQL_EQUAL'        // SQL 문자열(정규화) 동일성
  | 'SQL_AST_PATTERN'  // AST 패턴 검사(필수/금지 구문)
  | 'RESULT_SET'       // 결과셋 비교(SELECT)
  | 'AFFECTED_ROWS'    // 영향 행 수 비교(DML)
  | 'STATE_SNAPSHOT'   // 상태 스냅샷/해시 비교
  | 'CUSTOM_ASSERT';   // 보조 검증 쿼리로 참/거짓 판정

export interface SqlTestcasePayload {
  name: string;
  visibility: TestcaseVisibility;

  /** 기준/정답 SQL (모드에 따라 필수/선택) */
  expectedSql?: string;

  /** 채점 모드 (기본 RESULT_SET) */
  expectedMode: ExpectedMode;

  /** 채점 옵션(JSON 문자열). tolerance, checkColumnNames 등 */
  expectedMetaJson?: string;

  /** 보조/검증용 SQL (CUSTOM_ASSERT/STATE_SNAPSHOT 등에서 사용) */
  assertSql?: string;

  /** DML 영향 행 수 기대값 (AFFECTED_ROWS) */
  expectedRows?: number;

  /** 이 케이스만 정렬 민감 적용 여부 (없으면 문제 기본값 따름) */
  orderSensitiveOverride?: boolean;

  /** 시드 대체 스크립트 (있으면 기본 seed 대신 실행) */
  seedOverride?: string;

  /** 관리자 메모 */
  noteMd?: string;

  /** 실행 순서 */
  sortNo?: number;
}

export interface SqlSchemaPayload {
  ddlScript: string;
  seedScript: string;
}

export interface ProblemPayload {
  // sql_problem
  title: string;
  level?: number;
  tags?: string[];
  descriptionMd?: string;
  constraintRule: ConstraintRule;      // 'SELECT_ONLY' | 'DML_ALLOWED'
  orderSensitive?: boolean;
  useTf: 'Y' | 'N';

  // sql_schema
  schema: SqlSchemaPayload;

  // sql_testcase[]
  testcases: SqlTestcasePayload[];
}
