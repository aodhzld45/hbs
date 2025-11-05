// hooks/useCorsOrigin.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CorsOrigin, CorsOriginRequest, CorsOriginListResponse } from '../types/CorsOrigin';
import {
  fetchCorsOriginList,
  fetchActiveById,
  createCorsOrigin,
  updateCorsOrigin,
  updateUseTf,
  softDeleteCorsOrigin,
} from '../services/corsOriginApi';

type Yn = '' | 'Y' | 'N';

/** 목록 훅: 검색/페이징/정렬 + 재조회 */
export function useCorsOriginList(initial?: {
  keyword?: string;
  tenantId?: string | null;
  page?: number;   // 0-base
  size?: number;
  sort?: string;   // ex) 'regDate,desc'
}) {
  // 검색/필터/페이징/정렬 상태
  const [keyword, setKeyword]   = useState(initial?.keyword ?? '');
  const [tenantId, setTenantId] = useState<string>(initial?.tenantId ?? '');
  const [page, setPage]         = useState(initial?.page ?? 0);
  const [size, setSize]         = useState(initial?.size ?? 20);
  const [sort, setSort]         = useState(initial?.sort ?? 'regDate,desc');

  // ===== 데이터/상태 =====
  const [data, setData]       = useState<CorsOriginListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<unknown>(null);

  // ===== 조회 =====
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCorsOriginList(
        keyword.trim(),
        Math.max(0, page),
        Math.max(1, size),
        sort,
        tenantId.trim() || undefined
      );
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [keyword, page, size, sort, tenantId]);

  useEffect(() => { void refresh(); }, [refresh]);

  // ===== 페이지/필터 편의 함수 (안전 버전) =====
  const setPageSafe = useCallback((p: number) => setPage(Math.max(0, p)), []);
  const setSizeSafe = useCallback((s: number) => {
    setSize(Math.max(1, s));
    setPage(0); // 페이지 초기화
  }, []);
  const applyFilters = useCallback((next: {
    keyword?: string;
    useTf?: Yn;
    tenantId?: string | null;
  }) => {
    setKeyword(next.keyword ?? '');
    setTenantId(next.tenantId ?? '');
    setPage(0); // 필터 변경 시 첫 페이지로
  }, []);

  // ===== 리스트 파생 =====
  const list = useMemo(() => data?.items ?? [], [data]);

  return {
    // 검색/필터/페이징/정렬 상태
    keyword, setKeyword,
    tenantId, setTenantId,
    page, setPage: setPageSafe,
    size, setSize: setSizeSafe,
    sort, setSort,

    // 데이터
    data, list, loading, error,

    // 액션
    refresh,

    // 필터 일괄 적용
    applyFilters,
  };
}

// 상세 훅
export function useCorsOriginDetail(id?: number) {
  const [data, setData] = useState<CorsOrigin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<unknown>(null);

  useEffect(() => {
    if (!id) { setData(null); return; }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchActiveById(id as number);
        setData(res);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { data, loading, error, setData };
}

/** 변경 훅: 생성/수정/사용토글/삭제 */
export function useCorsOriginMutations(actorId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<unknown>(null);

  const wrap = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,

    /** 생성 */
    create: (req: CorsOriginRequest) =>
      wrap(() => createCorsOrigin(req, actorId)),

    /** 수정 */
    update: (id: number, req: CorsOriginRequest) =>
      wrap(() => updateCorsOrigin(id, req, actorId)),

    /** 사용 여부 토글 */
    toggleUse: (row: CorsOrigin) => {
      const next: 'Y' | 'N' = row.useTf === 'Y' ? 'N' : 'Y';
      return wrap(() => updateUseTf(row.id, next, actorId));
    },

    /** 논리 삭제 */
    removeSoft: (id: number) =>
      wrap(() => softDeleteCorsOrigin(id, actorId)),
  };
}
