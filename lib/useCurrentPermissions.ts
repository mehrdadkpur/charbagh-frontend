"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import {
  extractPermissions,
  hasPermission,
  toPermissionKeys,
  type PermissionResponse,
} from "@/lib/dashboardPermissions";

export function useCurrentPermissions() {
  const [permissionKeys, setPermissionKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch<PermissionResponse>("/api/Permissions/current");
        if (active) setPermissionKeys(toPermissionKeys(extractPermissions(response)));
      } catch {
        // Fail closed when the permission service is unavailable.
        if (active) setPermissionKeys(new Set());
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const can = useCallback(
    (module: string, actions: string[]) => hasPermission(permissionKeys, module, actions),
    [permissionKeys],
  );

  return { can, loading };
}
