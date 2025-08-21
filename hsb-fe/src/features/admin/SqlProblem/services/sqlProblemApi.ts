import api from "../../../../services/api";
import type { ProblemListResponse, ProblemItem, ConstraintRule } from "../types/ProblemItem";
import { ProblemPayload } from '../types/ProblemPayload';

// 제출 직전 최소 정리
const normalizePayload = (p: ProblemPayload): ProblemPayload => {
  const trim = (s?: string) => (typeof s === 'string' ? s.trim() : s);
  return {
    ...p,
    title: p.title?.trim() ?? '',
    level: p.level === undefined || p.level === null ? undefined : Number(p.level),
    tags: (p.tags ?? []).map(t => t.trim()).filter(Boolean),
    descriptionMd: p.descriptionMd?.trim(),
    schema: {
      ddlScript: p.schema.ddlScript.trim(),
      seedScript: p.schema.seedScript.trim(),
    },
    testcases: (p.testcases ?? []).map((t, i) => ({
      ...t,
      expectedMode: t.expectedMode ?? 'RESULT_SET',
      expectedSql: t.expectedSql?.replace(/;+$/g, '').trim(),
      expectedMetaJson: t.expectedMetaJson?.trim() || undefined,
      assertSql: t.assertSql?.replace(/;+$/g, '').trim() || undefined,
      expectedRows:
        t.expectedRows === undefined || t.expectedRows === null
          ? undefined
          : Number(t.expectedRows),
      orderSensitiveOverride: t.orderSensitiveOverride ?? undefined,
      seedOverride: t.seedOverride?.trim() || undefined,
      noteMd: t.noteMd?.trim() || undefined,
      sortNo: Number.isFinite(Number(t.sortNo)) ? Number(t.sortNo) : i,
    })),
  };
};

// SQL 문제 목록
export const fetchProblemList = async (
  keyword: string = '',
  page: number,
  size: number,
  level?: number,
  rule?: 'SELECT_ONLY' | 'DML_ALLOWED',
  useTf?: 'Y' | 'N'
): Promise<{ items: ProblemItem[]; totalCount: number; totalPages: number }> => {
  const res = await api.get('/sql-problems', {
    params: {
      keyword,
      page,
      size,
      ...(level !== undefined && { level }),
      ...(rule && { rule }),
      ...(useTf && { useTf }),
    },
  });

  return res.data;
};

// ===== 등록(POST) =====
export const fetchProblemCreate = async (
  payload: ProblemPayload,
  adminId: string
): Promise<{ id: number }> => {
  const body = normalizePayload(payload);
  const res = await api.post('/sql-problems', body, { params: { adminId } });
  return res.data; // { id }
};

// ====== 수정(PUT) =====
export const fetchProblemUpdate = async (
  id: number,
  payload: ProblemPayload,
  adminId: string
): Promise<void> => {
  const body = normalizePayload(payload);
  await api.put(`/sql-problems/${id}`, body, { params: { adminId } });
};

// SQL 문제 상세보기
export async function fetchProblemDetail(id: number): Promise<ProblemPayload> {
  const { data } = await api.get(`/sql-problems/${id}`);
  return data;
}