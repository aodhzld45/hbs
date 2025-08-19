import api from "../../../../services/api";

export type PreviewResult<T> = { ok: boolean; message: string; data?: T; errorDetail?: string };

export async function previewSchema(payload: { ddlScript: string; seedScript: string }) {
  const { data } = await api.post<PreviewResult<void>>("/sql-preview/schema", payload);
  return data;
}

export async function previewRun(payload: { ddlScript: string; seedScript: string; answerSql: string }) {
  const { data } = await api.post<PreviewResult<{ rows: any[]; rowCount: number } | string>>("/sql-preview/run", payload);
  return data;
}

export async function previewValidate(payload: {
  ddlScript: string; seedScript: string;
  testcases: Array<{ answerSql?: string; expectedSql?: string }>
}) {
  const { data } = await api.post<PreviewResult<any>>("/sql-preview/validate", payload);
  return data;
}
