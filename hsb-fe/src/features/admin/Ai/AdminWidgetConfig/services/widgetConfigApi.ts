import api from '../../../../../services/api';
import type { WidgetConfig, WidgetConfigListResponse, WidgetConfigRequest } from '../types/widgetConfig';
 
const BASE = '/api/ai/widget-configs';

// 위젯 설정 목록 조회 API 요청
export const fetchWidgetConfigList = async (
  keyword: string = '',
  page: number,
  size: number,
  sort = 'regDate,desc'
): Promise<WidgetConfigListResponse> => {

    const res = await api.get(`${BASE}`, {
    params: {
      keyword,
      page,
      size,
      sort,
    },
  });

    return res.data as WidgetConfigListResponse;
};

// 위젯 설정 상세 조회 API 요청
export const fetchWidgetConfigDetail = async (id: number): Promise<WidgetConfig> => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data as WidgetConfig;
};

// 위젯 설정 등록 API 요청
export const fetchWidgetConfigCreate = async (data: WidgetConfigRequest, actorId: string): Promise<WidgetConfig> => {
  const res = await api.post(`${BASE}`, data, { params: { actor: actorId } });
  return res.data as WidgetConfig;
};

// 위젯 설정 수정 API 요청
export const fetchWidgetConfigUpdate = async (id: number, data: WidgetConfigRequest, actorId: string): Promise<WidgetConfig> => {
  const res = await api.put(`${BASE}/${id}`, data, { params: { actor: actorId } });
  return res.data as WidgetConfig;
};

// 위젯 설정 사용 여부 변경 API 요청
export const updateWidgetConfigUseTf = async (id: number, useTf: 'Y' | 'N', actorId: string): Promise<WidgetConfig> => {
  const res = await api.patch(`${BASE}/${id}/use-tf`, { params: useTf, actor: actorId });
  return res.data as WidgetConfig;
}

// 위젯 설정 삭제 API 요청
export const fetchWidgetConfigDelete = async (id: number, actorId: string): Promise<number> => {
  await api.patch(`${BASE}/${id}/del-tf`, null, { params: { actor: actorId } });
  return id;
};
