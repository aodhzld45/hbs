import api, { okOrThrow } from "../../../../../services/api";
import {KbDocumentResponse, KbDocumentListResponse, KbDocumentRequest } from '../types/KbDocumentConfig'
const BASE = '/ai/kb-document'

// 공통
function buildKbDocumentFormData(body: KbDocumentRequest, file?: File | null) {
    const fd = new FormData();
  
    // Spring @RequestPart("body") 매핑을 위해 JSON을 Blob으로 첨부
    fd.append(
      "body",
      new Blob([JSON.stringify(body)], { type: "application/json" })
    );
  
    // Spring @RequestPart(value="file", required=false)
    if (file) {
      fd.append("file", file);
    }
  
    return fd;
  }


// 목록 필터 + 페이징 
export async function fetchKbDocumentList(params?: {
    kbSourceId?: number;
    docType?: string;
    docStatus?: string;
    category?: string;
    keyword?: string;
    useTf?: "Y" | "N";
    page?: number;
    size?: number;
    sort?: string; // default: "regDate,desc"
}): Promise<KbDocumentListResponse> {
    return okOrThrow(api.get<KbDocumentListResponse>(BASE, { params }));
}

// 상세(detail)
export async function fetchKbDocumentDetail(id: number): Promise<KbDocumentResponse> {
    return okOrThrow(
        api.get(`${BASE}/${id}`)
    );
}

// 등록 (multipart: body + file)
export async function createKbDocument(
    body: KbDocumentRequest,
    actor: string,
    file?: File | null
  ): Promise<KbDocumentResponse> {
    const formData = buildKbDocumentFormData(body, file);
  
    return okOrThrow(
      api.post<KbDocumentResponse>(BASE, formData, {
        params: { actor },
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  }

// 수정 (multipart: body + file)
export async function updateKbDocument(
    id: number,
    body: KbDocumentRequest,
    actor: string,
    file?: File | null
  ): Promise<KbDocumentResponse> {
    const formData = buildKbDocumentFormData(body, file);
  
    return okOrThrow(
      api.put<KbDocumentResponse>(`${BASE}/${id}`, formData, {
        params: { actor },
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  }


// 사용여부 토글
export const toggleKbDocumentUseTf = (id: number, newUseTf: "Y" | "N", actorId: string | number) => {
return okOrThrow<number>(
    api.patch(`${BASE}/${id}/use-tf`, null, {
    params: { newUseTf, actor: String(actorId) },
    })
)
};

// 소프트 삭제(del_tf='Y')
export const deleteKbDocumentSoft = (id: number, actorId: string | number) => {
    return okOrThrow<number>(
        api.patch(`${BASE}/${id}/del-tf`, null, {
        params: { actor: String(actorId) },
        })
    )
    };


/* 
    openAI API 
    Vector stores - end-points

    Create(생성) - POST
    https://api.openai.com/v1/vector_stores

    List(목록) - GET
    https://api.openai.com/v1/vector_stores

    Retrueve(검색) - GET
    https://api.openai.com/v1/vector_stores/{vector_store_id}

    Modify(수정) - POST
    https://api.openai.com/v1/vector_stores/{vector_store_id}

    Delete(삭제) - POST
    https://api.openai.com/v1/vector_stores/{vector_store_id}

    Search Vector Store - POST
    https://api.openai.com/v1/vector_stores/{vector_store_id}/search

*/