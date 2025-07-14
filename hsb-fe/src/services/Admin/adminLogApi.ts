import api from '../api';

import {
    AdminLogSearchParams,
    AdminLogListResponse
  } from '../../types/Admin/AdminLogItem';


  export const fetchAdminLogList = async (
    params: AdminLogSearchParams
  ): Promise<AdminLogListResponse> => {
    const res = await api.get('/admin/admin-log', { params });
    return res.data;
  };