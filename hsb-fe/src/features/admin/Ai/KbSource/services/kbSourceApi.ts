import api, { okOrThrow } from "../../../../../services/api";
import {KbSourceListResponse, KbSourceRequest, KbSourceResponse } from '../types/kbSourceConfig'
const BASE = '/ai/kb-source'

    // 목록 필터 + 페이징
    export async function fetchKbSourceList(params?: {
        siteKeyId?: number;
        keyword?: string;
        useTf?: "Y" | "N";
        page?: number;
        size?: number;
        sort?: string; // default: "regDate,desc"
    }): Promise<KbSourceListResponse> {
        return okOrThrow(api.get<KbSourceListResponse>(BASE, { params }));
    }
  
    // 상세
    export async function fetchKbSource(id: number): Promise<KbSourceResponse> {
        return okOrThrow(
            api.get(`${BASE}/${id}`)
        );
    }
  

    // 등록
    export async function createKbSource(
        body: KbSourceRequest,
        actor?: string
    ): Promise<KbSourceResponse> {

        const params = actor ? { actor } : undefined;
        return okOrThrow(api.post<KbSourceResponse>(BASE, body, { params }));
    }
  
    // 수정
    export const updateKbSource = async (
        id: number,
        body: KbSourceRequest,
        actor?: string
    ): Promise<KbSourceResponse> => {
        const params = actor ? { actor } : undefined;
        return okOrThrow(api.put<KbSourceResponse>(`${BASE}/${id}`, body, { params }));
    };
  

    // 사용여부 토글
    export const toggleKbSourceUseTf = async (
        id: number,
        actor?: string
    ): Promise<number> => {
        const params = actor ? { actor } : undefined;
        return okOrThrow(
        api.patch<number>(`${BASE}/${id}/use-tf`, null, { params })
        );
    };
  

    // 소프트 삭제(del_tf='Y')
    export const deleteKbSourceSoft = async (
        id: number,
        actor?: string
    ): Promise<number> => {
        const params = actor ? { actor } : undefined;
        return okOrThrow(
        api.patch<number>(`${BASE}/${id}/del-tf`, null, { params })
        );
    };