import api, { okOrThrow } from "../../../../services/api";
import { MaintenanceConfig } from "../types/maintenanceRule";

const BASE = "/public/maintenance-config";

export const getPublicMaintenanceConfig = async (): Promise<MaintenanceConfig> => {
  return okOrThrow(api.get<MaintenanceConfig>(BASE, { params: { _ts: Date.now() } }));
};
