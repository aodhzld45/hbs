import { useCallback, useEffect, useState } from 'react';
import {
  fetchPromptProfileList,
  fetchPromptProfileDetail,
  createPromptProfile,
  updatePromptProfile,
  deletePromptProfile,
  updatePromptProfileUseTf,
} from '../services/promptProfileApi';
import type {
  PromptProfile,
  PromptProfileListResponse,
  PromptProfileRequest,
} from '../types/promptProfileConfig';

// 목록 훅: 검색/페이징/정렬 + 재조회
export function usePromptProfileList(initial?: {
  keyword?: string;
  model?: string;
  page?: number;
  size?: number;
  sort?: string;
}) {
  const [keyword, setKeyword] = useState(initial?.keyword ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [page, setPage] = useState(initial?.page ?? 0);
  const [size, setSize] = useState(initial?.size ?? 20);
  const [sort, setSort] = useState(initial?.sort ?? 'regDate,desc');

  const [data, setData] = useState<PromptProfileListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPromptProfileList(keyword, model, page, size, sort);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [keyword, model, page, size, sort]);

  // 초기 자동 로드
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,

    keyword,
    setKeyword,

    model,
    setModel,

    page,
    setPage,

    size,
    setSize,

    sort,
    setSort,

    refresh,
  };
}

// 상세 훅: id가 없으면 조회하지 않음
export function usePromptProfileDetail(id?: number) {
  const [data, setData] = useState<PromptProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPromptProfileDetail(id);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

// 변경 훅: 생성/수정/삭제/사용토글
export function usePromptProfileMutations(actorId: string | number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const create = useCallback(
    async (body: PromptProfileRequest) => {
      setLoading(true);
      setError(null);
      try {
        const res = await createPromptProfile(body, actorId);
        return res;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [actorId],
  );

  const update = useCallback(
    async (id: number, body: PromptProfileRequest) => {
      setLoading(true);
      setError(null);
      try {
        const res = await updatePromptProfile(id, body, actorId);
        return res;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [actorId],
  );

  const softDelete = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await deletePromptProfile(id, actorId);
        return res; // 삭제된 ID
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [actorId],
  );

  const changeUseTf = useCallback(
    async (id: number, newUseTf: 'Y' | 'N') => {
      setLoading(true);
      setError(null);
      try {
        const res = await updatePromptProfileUseTf(id, newUseTf, actorId);
        return res; // 변경된 ID
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [actorId],
  );

  return {
    loading,
    error,
    create,
    update,
    softDelete,
    changeUseTf,
  };
}