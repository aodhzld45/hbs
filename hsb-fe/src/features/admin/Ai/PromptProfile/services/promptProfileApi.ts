import api, { okOrThrow } from "../../../../../services/api";
import { PromptProfile, PromptProfileListResponse, PromptProfileRequest } from '../types/promptProfileConfig';

const BASE = '/ai/prompt-profiles';

// 프롬프트 프로필 목록 조회 API 요청
export const fetchPromptProfileList = async (
  keyword: string = '',
  model: string = '',
  page: number,
  size: number,
  sort = 'regDate,desc'
): Promise<PromptProfileListResponse> => {
  const params = {
    keyword,
    model,
    page,
    size,
    sort,
  };

  return okOrThrow(
    api.get<PromptProfileListResponse>(BASE, { params })
  );
};

// 프롬프트 프로필 상세 조회 API 요청
export const fetchPromptProfileDetail = async (id: number): Promise<PromptProfile> => {
  return okOrThrow(
    api.get<PromptProfile>(`${BASE}/${id}`)
  );
}

// 프롬프트 프로필 생성 API 요청
export const createPromptProfile = async (
  body: PromptProfileRequest,
  actorId: string | number,
): Promise<PromptProfile> => {
  const params = {
    actor: String(actorId),
  };

  return okOrThrow(
    api.post<PromptProfile>(BASE, body, { params }),
  );
};

// 프롬프트 프로필 수정 API 요청
export const updatePromptProfile = async (
  id: number,
  body: PromptProfileRequest,
  actorId: string | number,
): Promise<PromptProfile> => {
  const params = {
    actor: String(actorId),
  };

  return okOrThrow(
    api.put<PromptProfile>(`${BASE}/${id}`, body, { params }),
  );
};

// 프롬프트 프로필 삭제 API 요청
export const deletePromptProfile = (id: number, actorId: string | number) => {
  return okOrThrow<number>(
    api.patch(`${BASE}/${id}/del-tf`, null, {
      params: { actor: String(actorId) },
    })
  )
};

// 사용여부 변경 API 요청
export const updatePromptProfileUseTf = (id: number, newUseTf: "Y" | "N", actorId: string | number) => {
  return okOrThrow<number>(
    api.patch(`${BASE}/${id}/use-tf`, null, {
      params: { newUseTf, actor: String(actorId) },
    })
  )
};


