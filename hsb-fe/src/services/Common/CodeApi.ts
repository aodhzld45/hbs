import api from '../api';

import { CodeGroup } from "../../types/Common/CodeGroup"; 
import { CodeDetail } from "../../types/Common/CodeDetail"; 

/** CodeGroup */
export const fetchCodeGroups = async () => {
  const res = await api.get("/common/codes/groups");
  return res.data;
};

export const createCodeGroup = async (payload: any, adminId : string) => {
  return api.post("/admin/code-groups", payload, {
    params: { adminId: adminId },
  });
};

export const updateCodeGroup = async (id: string, payload: any) => {
  return api.put(`/api/admin/code-groups/${id}`, payload, {
    params: { adminId: "admin" },
  });
};

export const deleteCodeGroup = async (id: string) => {
  return api.delete(`/api/admin/code-groups/${id}`, {
    params: { adminId: "admin" },
  });
};

/** CodeDetail */
export const fetchParentCodes = async (groupId: string) => {
  const res = await api.get(`/common/codes/${groupId}/parents`);
  return res.data;
};

export const fetchChildCodes = async (groupId: string, parentCodeId: string) => {
  const res = await api.get(`/common/codes/${groupId}/${parentCodeId}`);
  return res.data;
};

export const createCodeDetail = async (payload: any, adminId : string ) => {
  return api.post("/admin/code-details", payload, {
    params: { adminId: adminId },
  });
};

export const updateCodeDetail = async (id: string, payload: any) => {
  return api.put(`/admin/code-details/${id}`, payload, {
    params: { adminId: "admin" },
  });
};

export const deleteCodeDetail = async (id: string) => {
  return api.delete(`/admin/code-details/${id}`, {
    params: { adminId: "admin" },
  });
};
