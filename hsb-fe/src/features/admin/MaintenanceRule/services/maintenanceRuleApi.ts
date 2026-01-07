import api, {okOrThrow} from '../../../../services/api';
import { MaintenanceConfig } from "../types/maintenanceRule";

const BASE = "/api/admin/maintenance-config";

export const getMaintenanceConfig = async (): Promise<MaintenanceConfig> => {
    return okOrThrow(
      api.get<MaintenanceConfig>(BASE)
    );
  };

export const saveMaintenanceConfig = async (cfg: MaintenanceConfig): Promise<MaintenanceConfig> => {
    return okOrThrow(
        api.put<MaintenanceConfig>(BASE, cfg)
    );
};