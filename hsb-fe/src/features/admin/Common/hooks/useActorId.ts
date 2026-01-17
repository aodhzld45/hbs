import { useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";

export function useActorId() {
  const { admin } = useAuth();

  const actorId = useMemo(() => {
    return String(admin?.id ?? admin?.email ?? "system");
  }, [admin?.id, admin?.email]);

  return { admin, actorId };
}