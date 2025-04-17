import api from '../api';
import { CodeParent } from '../../types/Common/CodeParent';
import { CodeDetail } from '../../types/Common/CodeDetail';

// ---- CodeParent ----
export const fetchCodeParents = async (): Promise<CodeParent[]> => {
  const resp = await api.get<CodeParent[]>('/common/codes/parents');
  return resp.data;
};

export const createCodeParent = async (data: {
  pcode: string;
  pcodeNm: string;
  pcodeMemo?: string;
  pcodeSeqNo: number;
}): Promise<CodeParent> => {
  const resp = await api.post<CodeParent>('/common/codes/parent', data);
  return resp.data;
};

export const updateCodeParent = async (
  id: number,
  data: {
    pcode: string;
    pcodeNm: string;
    pcodeMemo?: string;
    pcodeSeqNo: number;
    useTf: 'Y' | 'N';
    delTf: 'Y' | 'N';
  }
): Promise<CodeParent> => {
  const resp = await api.put<CodeParent>(`/common/codes/parent/${id}`, data);
  return resp.data;
};

export const deleteCodeParent = async (id: number): Promise<void> => {
  await api.delete(`/common/codes/parent/${id}`);
};

// ---- CodeDetail ----
export const fetchCodeDetails = async (pcode: string): Promise<CodeDetail[]> => {
  const resp = await api.get<CodeDetail[]>(`/common/codes/${pcode}/details`);
  return resp.data;
};

export const createCodeDetail = async (
  pcode: string,
  data: {
    dcode: string;
    dcodeNm: string;
    dcodeExt?: string;
    dcodeSeqNo: number;
  }
): Promise<CodeDetail> => {
  const resp = await api.post<CodeDetail>(`/common/codes/${pcode}/detail`, data);
  return resp.data;
};

export const updateCodeDetail = async (
  pcode: string,
  dcodeNo: number,
  data: {
    dcode: string;
    dcodeNm: string;
    dcodeExt?: string;
    dcodeSeqNo: number;
    useTf: 'Y' | 'N';
    delTf: 'Y' | 'N';
  }
): Promise<CodeDetail> => {
  const resp = await api.put<CodeDetail>(
    `/common/codes/${pcode}/detail/${dcodeNo}`,
    data
  );
  return resp.data;
};

export const deleteCodeDetail = async (pcode: string, dcodeNo: number): Promise<void> => {
  await api.delete(`/common/codes/${pcode}/detail/${dcodeNo}`);
};
