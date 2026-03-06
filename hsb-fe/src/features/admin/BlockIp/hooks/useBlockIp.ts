import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BlockIp, BlockIpListResponse, BlockIpRequest, Yn } from '../types/BlockIp';
import {
  createBlockIp,
  fetchBlockIpActiveById,
  fetchBlockIpList,
  softDeleteBlockIp,
  updateBlockIp,
  updateBlockIpUseTf,
} from '../services/blockIpApi';

export function useBlockIpList(initial?: {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}) {
  const [keyword, setKeyword] = useState(initial?.keyword ?? '');
  const [page, setPage] = useState(initial?.page ?? 0);
  const [size, setSize] = useState(initial?.size ?? 20);
  const [sort, setSort] = useState(initial?.sort ?? 'regDate,desc');

  const [data, setData] = useState<BlockIpListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBlockIpList(
        keyword.trim(),
        Math.max(0, page),
        Math.max(1, size),
        sort
      );
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

  const setPageSafe = useCallback((p: number) => setPage(Math.max(0, p)), []);
  const setSizeSafe = useCallback((s: number) => {
    setSize(Math.max(1, s));
    setPage(0);
  }, []);

  const applyFilters = useCallback((next: { keyword?: string }) => {
    setKeyword(next.keyword ?? '');
    setPage(0);
  }, []);

  const list = useMemo(() => data?.items ?? [], [data]);

  return {
    keyword,
    setKeyword,
    page,
    setPage: setPageSafe,
    size,
    setSize: setSizeSafe,
    sort,
    setSort,
    data,
    list,
    loading,
    error,
    refresh,
    applyFilters,
  };
}

export function useBlockIpDetail(id?: number) {
  const [data, setData] = useState<BlockIp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchBlockIpActiveById(id);
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

export function useBlockIpMutations(actorId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
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
  }, []);

  return {
    loading,
    error,

    create: (req: BlockIpRequest) =>
      wrap(() => createBlockIp(req, actorId)),

    update: (id: number, req: BlockIpRequest) =>
      wrap(() => updateBlockIp(id, req, actorId)),

    toggleUse: (row: BlockIp) => {
      const next: Yn = row.useTf === 'Y' ? 'N' : 'Y';
      return wrap(() => updateBlockIpUseTf(row.id, next, actorId));
    },

    removeSoft: (id: number) =>
      wrap(() => softDeleteBlockIp(id, actorId)),
  };
}
