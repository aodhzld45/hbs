// src/components/Common/hooks/useSiteKeyOptions.ts
import { useEffect, useMemo, useState } from "react";
import type { SiteKeySummary } from "../../Ai/AdminSiteKeys/types/siteKey";
import { fetchSiteKeyList } from "../../Ai/AdminSiteKeys/services/siteKeyApi";

export function useSiteKeyOptions() {
  const [siteKeys, setSiteKeys] = useState<SiteKeySummary[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);
  // 사이트키 목록 로드 (ACTIVE 위주)
  useEffect(() => {
    (async () => {
      try {
        setLoadingKeys(true);
        setKeysError(null);
        const res = await fetchSiteKeyList({
          keyword: '',
          planCode: '',
          status: 'ACTIVE',
          page: 0,
          size: 200,
          sort: 'regDate,desc',
        });
        setSiteKeys(res.content ?? []);
      } catch (e: any) {
        setKeysError(e?.message ?? '사이트키 조회 실패');
      } finally {
        setLoadingKeys(false);
      }
    })();
  }, []);

  const idToNameMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const k of siteKeys as any[]) {
      // 필드명은 프로젝트 SiteKeySummary 정의에 맞게 조정
      m.set((k as any).id, (k as any).siteKeyName ?? (k as any).name ?? `#${(k as any).id}`);
    }
    return m;
  }, [siteKeys]);


    // Select 라벨 가독성 향상
  const siteKeyOptions = useMemo(
    () =>
      siteKeys.map((k) => ({
        value: k.id,
        label: `[${k.id}] ${k.siteKey} (${k.planCode ?? '-'}, ${k.status}${
          k.useTf === 'Y' ? '' : ', off'
        })`,
        disabled: k.status !== 'ACTIVE',
      })),
    [siteKeys]
  );

  return { siteKeys, loadingKeys, keysError, idToNameMap, siteKeyOptions };
}
