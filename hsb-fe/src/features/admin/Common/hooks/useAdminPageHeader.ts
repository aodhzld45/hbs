import { useAdminMenus } from "./useAdminMenus";
import { useActorId } from "./useActorId";

export function useAdminPageHeader() {
  const { admin, actorId } = useActorId();
  const { menus, menuLoading, menuError, currentMenuTitle, reloadMenus } =
    useAdminMenus();

  return {
    admin,
    actorId,

    menus,
    menuLoading,
    menuError,
    currentMenuTitle,
    reloadMenus,
  };
}
