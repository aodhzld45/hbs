import { useEffect, useState } from "react";
import type { KbDocumentListResponse } from "../types/KbDocumentConfig";
import { fetchKbDocumentList } from "../services/KbDocumentApi";

type Params = {
    kbSourceId?: number;
    docType?: string;
    docStatus?: string;
    category?: string;
    keyword?: string;
    useTf?: "Y" | "N";
    page?: number;
    size?: number;
    sort?: string;
}

const DEFAULT_PARAMS: Params = {
    page: 0,
    size: 20,
    sort: "regDate,desc",
  };

const normalizeSelect = (v?: string) => {
  if (v == null) return undefined;
  const t = v.trim();
  if (!t) return undefined;
  if (t === "전체" || t.toUpperCase() === "ALL") return undefined;
  return t;
};  

const cleanParams = (p: Params): Params => ({
  ...p,
  kbSourceId: p.kbSourceId ?? undefined,
  docType: normalizeSelect(p.docType),
  docStatus: normalizeSelect(p.docStatus),
  category: normalizeSelect(p.category),
  useTf: (p.useTf === ("전체" as any) ? undefined : p.useTf), // 혹시 useTf도 select로 '전체'가 올 수 있으면
  keyword: p.keyword?.trim() ? p.keyword.trim() : undefined,
});

export function useKbDocumentList(initial?: Params) {
    const [params, setParams] = useState<Params>({ ...DEFAULT_PARAMS, ...initial });

    const [data, setData] = useState<KbDocumentListResponse>({
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
        const res = await fetchKbDocumentList(cleanParams(params));
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
