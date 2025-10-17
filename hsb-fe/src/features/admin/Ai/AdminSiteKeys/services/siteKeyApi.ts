import api from "../../../../../services/api";
import {
  ApiError,
  CreateRequest,
  ListQuery,
  PagedResponse,
  SiteKeyResponse,
  SiteKeySummary,
  Status,
  StatusRequest,
  UpdateRequest,
} from "../types/siteKey";


// handle API responses and errors Helper
const okOrThrow = async <T>(p: Promise<{ data: T }>) => { 
  try {
    const res = await p;
    return res.data;
  } catch (err: any) {
    const apiErr: ApiError | undefined = err?.response?.data;
    throw new Error(apiErr?.message || err?.message || "API Error");
  }
};

// 사이트키 목록 조회 API 요청
export const fetchSiteKeyList = async (
    query: ListQuery
    ): Promise<PagedResponse<SiteKeySummary>> => {
    const params = {
        keyword: query.keyword || "",
        planCode: query.planCode || "",
        status: query.status || "",
        page: query.page || 0,
        size: query.size || 10,
        sort: query.sort || "regDate,desc",
    };
    return okOrThrow(
        api.get<PagedResponse<SiteKeySummary>>("/ai/site-keys", { params })
    );
}

// 사이트키 상세 조회 API 요청
export const fetchSiteKeyDetail = async (
    id: number
    ): Promise<SiteKeyResponse> => {
    return okOrThrow(api.get<SiteKeyResponse>(`/ai/site-keys/${id}`));
}

// 사이트키 생성 API 요청
export const createSiteKey = (body: CreateRequest, actorId: string | number) =>
  okOrThrow<SiteKeyResponse>(
    api.post("/ai/site-keys", body, { params: { actor: String(actorId) } })
);

// 사이트키 수정 API 요청
export const updateSiteKey = (id: number, body: UpdateRequest, actorId: string | number) =>
  okOrThrow<SiteKeyResponse>(
    api.patch(`/ai/site-keys/${id}`, body, { params: { actor: String(actorId) } })
);

// 사이트키 상태 변경 API 요청
export const changeSiteKeyStatus = (id: number, status: Status, notes: string | undefined, actorId: string | number) =>
  okOrThrow<SiteKeyResponse>(
    api.patch(`/ai/site-keys/${id}/status`, { status, notes } as StatusRequest, {
      params: { actor: String(actorId) }
    })
  );

// 사이트키 사용여부 변경 API 요청
export const updateSiteKeyUseTf = (id: number, newUseTf: "Y" | "N", actorId: string | number) => {
  return okOrThrow<number>(
    api.patch(`/ai/site-keys/${id}/use-tf`, null, {
      params: { newUseTf, actor: String(actorId) },
    })
  )
};

// 사이트키 삭제 API 요청
export const deleteSiteKey = (id: number, actorId: string | number) => {
  return okOrThrow<number>(
    api.patch(`/ai/site-keys/${id}/del-tf`, null, {
      params: { actor: String(actorId) },
    })
  )
};

// (선택) 사이트키 검증 API 요청 - verify는 actor 안 받으면 기존대로
export const verifySiteKey = (siteKey: string, clientDomain: string) =>
  okOrThrow<{ ok: boolean; status: Status }>(
    api.post(`/ai/site-keys/verify`, { siteKey, clientDomain })
);