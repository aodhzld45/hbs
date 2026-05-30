import { useCallback, useEffect, useState } from "react";
import type { KbDocumentListResponse, KbDocumentResponse } from "../types/KbDocumentConfig";
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
    const [loadedOnce, setLoadedOnce] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // params 변경될 때마다 조회
    useEffect(() => {
    const run = async () => {
        setLoading(true);
        setError(null);
        try {
        const res = await fetchKbDocumentList(cleanParams(params));
        setData(res);
        setLoadedOnce(true);
        } catch (e: any) {
        setError(e?.message || "목록 조회 실패");
        setLoadedOnce(true);
        } finally {
        setLoading(false);
        }
    };
    run();
    }, [params]);

    // 수동 재조회 필요하면 이 함수 호출(동일 params로 set 해서 트리거)
    const refetch = useCallback(() => setParams((p) => ({ ...p })), []);

    const patchDocuments = useCallback((updates: KbDocumentResponse[]) => {
        if (updates.length === 0) return;

        setData((prev) => {
            const updateMap = new Map(updates.map((item) => [item.id, item]));
            let changed = false;

            const nextItems = prev.items.map((item) => {
                const updated = updateMap.get(item.id);
                if (!updated) return item;
                changed = true;
                return { ...item, ...updated };
            });

            if (!changed) return prev;
            return { ...prev, items: nextItems };
        });
    }, []);

    return {
        params,
        setParams, // 예: setParams(p => ({...p, keyword: v, page: 0}))
        data,      // data.items / data.totalCount / data.totalPages
        loading,
        initialLoading: loading && !loadedOnce,
        refreshing: loading && loadedOnce,
        error,
        refetch,
        patchDocuments,
      };
}
