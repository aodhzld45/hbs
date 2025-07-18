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

export const updateOrderSequence = async (
  id: number,
  orderSequence: number
) => {
  return api.patch(`/admin/code-groups/${id}/order`, {
    orderSequence,
  });
};

export const updateGroupUseTf = async (
  id: number,
  useTf: string,
  adminId: string
) => {
  return api.patch(
    `/admin/code-groups/${id}/use-tf`,
    { useTf },
    { params: { adminId } }
  );
};

export const updateCodeGroup = async (id: number, payload: any, adminId : string) => {
  return api.put(`/admin/code-groups/${id}`, payload, {
    params: { adminId: adminId },
  });
};

export const deleteCodeGroup = async (id: number, adminId : string) => {
  return api.delete(`/admin/code-groups/${id}`, {
    params: { adminId: adminId },
  });
};

/** CodeDetail */

export const fetchParentCodes = async (groupId: number) => {
  const res = await api.get(`/common/codes/${groupId}/parents`);
  return res.data;
};

export const fetchChildCodes = async (groupId: number, parentCodeId: string) => {
  const res = await api.get(`/common/codes/${groupId}/${parentCodeId}`);
  return res.data;
};

export const fetchAllDetails = async (groupId: number) => {
  return api.get(`/admin/code-details/all`, {
    params: { groupId },
  }).then((res) => res.data);
};

export const createCodeDetail = async (payload: any, adminId : string ) => {
  return api.post("/admin/code-details", payload, {
    params: { adminId: adminId },
  });
};

export const updateCodeOrder = async (
  id: number,
  payload: any,
  adminId: string
) => {
  return api.patch(`/admin/code-details/${id}/order`, payload, {
    params: { adminId: adminId },
  });
};

export const updateDetailUseTf = async (
  id: number,
  useTf: string,
  adminId: string
) => {
  return api.patch(
    `/admin/code-details/${id}/use-tf`,
    { useTf },
    { params: { adminId } }
  );
};

export const updateCodeDetail = async (id: number, payload: any, adminId : string) => {
  return api.put(`/admin/code-details/${id}`, payload, {
    params: { adminId: adminId },
  });
};

export const deleteCodeDetail = async (id: number, adminId : string) => {
  return api.delete(`/admin/code-details/${id}`, {
    params: { adminId: adminId },
  });
};

export const uploadCodeDetailsExcel = async (formData: FormData) => {
  return api.post(
    `/admin/code-details/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};
