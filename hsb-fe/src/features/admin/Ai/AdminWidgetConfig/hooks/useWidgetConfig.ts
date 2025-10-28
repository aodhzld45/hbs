import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WidgetConfig, WidgetConfigListResponse, WidgetConfigRequest } from '../types/widgetConfig';
import {
  fetchWidgetConfigList,
  fetchWidgetConfigDetail,
  fetchWidgetConfigCreate,
  fetchWidgetConfigUpdate,
  fetchWidgetConfigUpdateWithFile,
  fetchWidgetConfigCreateWithFile,
  updateWidgetConfigUseTf,
  fetchWidgetConfigDelete,
} from '../services/widgetConfigApi';

/** 목록 훅: 검색/페이징/정렬 + 재조회 */
export function useWidgetConfigList(initial?: {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}) {
  const [keyword, setKeyword] = useState(initial?.keyword ?? '');
  const [page, setPage] = useState(initial?.page ?? 0);
  const [size, setSize] = useState(initial?.size ?? 20);
  const [sort, setSort] = useState(initial?.sort ?? 'regDate,desc');

  const [data, setData] = useState<WidgetConfigListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWidgetConfigList(keyword, page, size, sort);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [keyword, page, size, sort]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

    // 페이지 변경/검색 편의 함수
  const setPageSafe = useCallback((p: number) => setPage(Math.max(0, p)), []);
  const setSizeSafe = useCallback((s: number) => {
    setSize(Math.max(1, s));
    setPage(0); // 페이지 초기화
  }, []);

    return {
    // state
    keyword, setKeyword,
    page, setPage: setPageSafe,
    size, setSize: setSizeSafe,
    sort, setSort,
    // data
    data, loading, error,
    // actions
    refresh,
  };
}

/** 상세 훅: id가 없으면 조회하지 않음 */
export function useWidgetConfigDetail(id?: number) {
  const [data, setData] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!id && id !== 0) { setData(null); return; }
    // id === 0 은 '신규 생성' 의사표시로 간주 → 서버 조회 안 함
    if (id === 0) { setData(null); return; }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWidgetConfigDetail(id as number);
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
export function useWidgetConfigMutations(actorId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

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
    create: (body: WidgetConfigRequest) =>
      wrap(() => fetchWidgetConfigCreate(body, actorId)),
    /** 수정 */
    update: (id: number, body: WidgetConfigRequest) =>
      wrap(() => fetchWidgetConfigUpdate(id, body, actorId)),
    /** 사용 여부 토글
     *  주: 현재 services 함수 시그니처가 (id, useTf, actorId)
     *  서버가 토글 방식이면 useTf 인자는 무시되더라도 전달
     */
    toggleUse: (id: number, nextUseTf: 'Y' | 'N') =>
      wrap(() => updateWidgetConfigUseTf(id, nextUseTf, actorId)),
    /** 논리 삭제 */
    softDelete: (id: number) =>
      wrap(() => fetchWidgetConfigDelete(id, actorId)),
  };
}

