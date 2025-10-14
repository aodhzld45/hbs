import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../../context/AuthContext";
import {
  CreateRequest, ListQuery, PagedResponse,
  SiteKeyResponse, SiteKeySummary, Status, UpdateRequest
} from "../types/siteKey";
import {
  changeSiteKeyStatus, createSiteKey, fetchSiteKeyDetail,
  fetchSiteKeyList, updateSiteKey
} from "../services/siteKeyApi";

export const useSiteKeys = () => {
  const { admin } = useAuth();
  const actorId = admin?.id ?? "admin-ui"; // 쿼리파라미터로 전달

  const [query, setQuery] = useState<ListQuery>({ page: 0, size: 10, sort: "regDate,desc" });
  const [data, setData] = useState<PagedResponse<SiteKeySummary> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (override?: Partial<ListQuery>) => {
    setLoading(true); setError(null);
    try {
      const merged = { ...query, ...(override || {}) };
      const res = await fetchSiteKeyList(merged);
      setData(res);
      setQuery(merged);
    } catch (e: any) {
      setError(e?.message || "목록 조회 실패");
    } finally { setLoading(false); }
  }, [query]);

  const create = useCallback(async (payload: CreateRequest) => {
    await createSiteKey(payload, actorId);
    await load({ page: 0 });
  }, [actorId, load]);

  const update = useCallback(async (id: number, payload: UpdateRequest) => {
    await updateSiteKey(id, payload, actorId);
    await load();
  }, [actorId, load]);

  const changeStatus = useCallback(async (id: number, status: Status, notes?: string) => {
    await changeSiteKeyStatus(id, status, notes, actorId);
    await load();
  }, [actorId, load]);

  const getDetail = useCallback(async (id: number) => {
    return await fetchSiteKeyDetail(id);
  }, []);

  useEffect(() => { load(); }, []); // 초기 로드

  return { query, setQuery, data, loading, error, load, create, update, changeStatus, getDetail };
};
