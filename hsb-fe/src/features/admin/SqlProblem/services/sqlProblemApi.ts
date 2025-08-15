import api from "../../../../services/api";
import { ProblemItem } from "../types/ProblemItem";

// SQL 프로그램 목록
export const fetchProblemList = async (
  keyword: string = '',
  page: number,
  size: number,
  level?: number,
  rule?: 'SELECT_ONLY' | 'DML_ALLOWED',
  useTf?: 'Y' | 'N'
): Promise<{ items: ProblemItem[]; totalCount: number; totalPages: number }> => {
  const res = await api.get('/sql-problems', {
    params: {
      keyword,
      page,
      size,
      ...(level !== undefined && { level }),
      ...(rule && { rule }),
      ...(useTf && { useTf }),
    },
  });

  return res.data;
};