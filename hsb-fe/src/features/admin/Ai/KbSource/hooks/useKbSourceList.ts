import { useEffect, useState } from "react";
import type { KbSourceListResponse } from "../types/kbSourceConfig";
import { fetchKbSourceList } from "../services/kbSourceApi";

type Params = {
  siteKeyId?: number;
  keyword?: string;
  useTf?: "Y" | "N";
  page?: number;
  size?: number;
  sort?: string;
};

const DEFAULT_PARAMS: Params = {
  page: 0,
  size: 20,
  sort: "regDate,desc",
};

const cleanParams = (p: Params): Params => ({
  ...p,
  keyword: p.keyword?.trim() ? p.keyword.trim() : undefined,
});

export function useKbSourceList(initial?: Params) {
  const [params, setParams] = useState<Params>({ ...DEFAULT_PARAMS, ...initial });

  const [data, setData] = useState<KbSourceListResponse>({
    items: [],
    totalCount: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // params 변경될 때마다 조회
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchKbSourceList(cleanParams(params));
        setData(res);
      } catch (e: any) {
        setError(e?.message || "목록 조회 실패");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params]);

  // 수동 재조회 필요하면 이 함수 호출(동일 params로 set 해서 트리거)
  const refetch = () => setParams((p) => ({ ...p }));

  return {
    params,
    setParams, // 예: setParams(p => ({...p, keyword: v, page: 0}))
    data,      // data.items / data.totalCount / data.totalPages
    loading,
    error,
    refetch,
  };
}
