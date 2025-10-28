import api from '../../../../../services/api';
import type { WidgetConfig, WidgetConfigListResponse, WidgetConfigRequest } from '../types/widgetConfig';
 
const BASE = '/ai/widget-configs';

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

// 위젯 설정 등록 API 요청 (아이콘 파일 대응)
// - iconFile 있으면: multipart(form + iconFile)
// - iconFile 없으면: 기존 JSON PUT
export async function fetchWidgetConfigCreateWithFile(
  form: WidgetConfigRequest,
  actorId: string,
  iconFile?: File | null,                      // 선택
): Promise<number> {                           // 서버가 Long(id) 반환 가정
  const fd = new FormData();

  // @RequestPart("form") 매핑용 JSON Blob
  fd.append(
    'form',
    new Blob([JSON.stringify(form)], { type: 'application/json' })
  );

  // @RequestPart("iconFile")
  if (iconFile) {
    fd.append('iconFile', iconFile);
  }

  // axios는 boundary 자동 설정 → Content-Type 지정 불필요
  const res = await api.post<number>('/api/ai/widget-configs', fd, {
    params: { actor: actorId },
  });
  return res.data;
}

// 위젯 설정 수정 API 요청 (아이콘 파일 대응)
// - iconFile 있으면: multipart(form + iconFile)
// - iconFile 없으면: 기존 JSON PUT
export const fetchWidgetConfigUpdateWithFile = async (
  id: number,
  data: WidgetConfigRequest,
  actorId: string,
  iconFile?: File | null
): Promise<WidgetConfig> => {
  if (iconFile) {
    const fd = new FormData();
    // 백엔드에서 @RequestPart("form") 로 받는 전제
    fd.append('form', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    fd.append('iconFile', iconFile);

    const res = await api.put(`${BASE}/${id}`, fd, {
      params: { actor: actorId },
      // 헤더는 axios가 자동으로 multipart boundary 지정하므로 명시 불필요
    });
    return res.data as WidgetConfig;
  }

  // 파일 없으면 기존 JSON 경로
  const res = await api.put(`${BASE}/${id}`, data, { params: { actor: actorId } });
  return res.data as WidgetConfig;
};

// 위젯 설정 수정 API 요청
export const fetchWidgetConfigUpdate = async (id: number, data: WidgetConfigRequest, actorId: string): Promise<WidgetConfig> => {
  const res = await api.put(`${BASE}/${id}`, data, { params: { actor: actorId } });
  return res.data as WidgetConfig;
};

// 위젯 설정 사용 여부 변경 API 요청
export const updateWidgetConfigUseTf = async (id: number, useTf: 'Y' | 'N', actorId: string): Promise<WidgetConfig> => {
  const res = await api.patch(`${BASE}/${id}/use-tf`, null, {
      params: { useTf, actor: String(actorId) },
  });
  return res.data as WidgetConfig;
}

// 위젯 설정 삭제 API 요청
export const fetchWidgetConfigDelete = async (id: number, actorId: string): Promise<number> => {
  await api.patch(`${BASE}/${id}/del-tf`, null, { params: { actor: actorId } });
  return id;
};
