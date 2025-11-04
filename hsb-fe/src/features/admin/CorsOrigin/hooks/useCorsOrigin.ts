// hooks/useCorsOrigin.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CorsOrigin, CorsOriginRequest, CorsOriginListResponse } from '../types/CorsOrigin';
import {
  fetchCorsOriginList,
  createCorsOrigin,
  updateCorsOrigin,
  updateUseTf,
  softDeleteCorsOrigin,
} from '../services/corsOriginApi';

type Yn = '' | 'Y' | 'N';

export function useCorsOrigin(actor: string, initial?: {
  keyword?: string;
  useTf?: Yn;
  tenantId?: string | null;
  page?: number;     // 0-base
  size?: number;
  sort?: string;     // ex) 'regDate,desc'
}) {
  // ===== 검색/페이징/정렬 상태 =====
  const [keyword, setKeyword]   = useState(initial?.keyword  ?? '');
  const [useTf, setUseTf]       = useState<Yn>(initial?.useTf ?? '');
  const [tenantId, setTenantId] = useState<string>(initial?.tenantId ?? '');
  const [page, setPageRaw]      = useState(initial?.page     ?? 0);
  const [size, setSizeRaw]      = useState(initial?.size     ?? 20);
  const [sort, setSort]         = useState(initial?.sort     ?? 'regDate,desc');

  // ===== 데이터/상태 =====
  const [data, setData]     = useState<CorsOriginListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<unknown>(null);

  // ===== 조회 =====
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCorsOriginList(
        keyword?.trim() || '',
        Math.max(0, page),
        Math.max(1, size),
        sort,
        useTf || undefined,
        tenantId?.trim() || undefined
      );
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [keyword, page, size, sort, useTf, tenantId]);

  useEffect(() => { void refresh(); }, [refresh]);

  // ===== CRUD 액션 =====
  const create = useCallback(async (req: CorsOriginRequest) => {
    await createCorsOrigin(req, actor);
    await refresh();
  }, [actor, refresh]);

  const update = useCallback(async (id: number, req: CorsOriginRequest) => {
    await updateCorsOrigin(id, req, actor);
    await refresh();
  }, [actor, refresh]);

  const toggleUse = useCallback(async (row: CorsOrigin) => {
    const next: 'Y' | 'N' = row.useTf === 'Y' ? 'N' : 'Y';
    await updateUseTf(row.id, next, actor);
    await refresh();
  }, [actor, refresh]);

  const removeSoft = useCallback(async (id: number) => {
    await softDeleteCorsOrigin(id, actor);
    await refresh();
  }, [actor, refresh]);

  // ===== 페이지/필터 편의 함수 =====
  const setPage = useCallback((p: number) => setPageRaw(Math.max(0, p)), []);
  const setSize = useCallback((s: number) => {
    setSizeRaw(Math.max(1, s));
    setPageRaw(0); // 페이지 초기화
  }, []);
  const applyFilters = useCallback((next: {
    keyword?: string;
    useTf?: Yn;
    tenantId?: string | null;
  }) => {
    setKeyword(next.keyword ?? '');
    setUseTf(next.useTf ?? '');
    setTenantId(next.tenantId ?? '');
    setPageRaw(0);
  }, []);

  // ===== 리스트 파생 =====
  const list = useMemo(() => data?.items ?? [], [data]);

  return {
    // 검색/페이징/정렬 상태
    keyword, setKeyword,
    useTf, setUseTf,
    tenantId, setTenantId,
    page, setPage,
    size, setSize,
    sort, setSort,

    // 데이터
    data, list, loading, error,

    // 액션
    refresh,
    create,
    update,
    toggleUse,
    removeSoft,
    
    // 필터 일괄 적용
    applyFilters,
  };
}
