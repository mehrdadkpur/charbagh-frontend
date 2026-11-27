export type PermissionDto = {
  module?: string;
  action?: string;
  name?: string;
  code?: string;
};

export type PermissionResponse =
  | PermissionDto[]
  | {
      permissions?: PermissionDto[];
      items?: PermissionDto[];
      data?: PermissionDto[] | { permissions?: PermissionDto[] };
    };

export function normalizePermissionValue(value: string): string {
  return value.trim().toLowerCase();
}

export function extractPermissions(response: PermissionResponse): PermissionDto[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.permissions)) return response.permissions;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data)) return response.data;

  if (
    response.data &&
    !Array.isArray(response.data) &&
    Array.isArray(response.data.permissions)
  ) {
    return response.data.permissions;
  }

  return [];
}

export function toPermissionKeys(permissions: PermissionDto[]): Set<string> {
  const result = new Set<string>();

  for (const permission of permissions) {
    const module = permission.module;
    const action = permission.action;

    if (module && action) {
      result.add(
        `${normalizePermissionValue(module)}.${normalizePermissionValue(action)}`,
      );
      continue;
    }

    const value = permission.name ?? permission.code;
    if (value) result.add(normalizePermissionValue(value));
  }

  return result;
}

export function hasPermission(
  permissionKeys: Set<string>,
  module: string,
  actions: string[],
): boolean {
  const normalizedModule = normalizePermissionValue(module);

  return actions.some((action) =>
    permissionKeys.has(
      `${normalizedModule}.${normalizePermissionValue(action)}`,
    ),
  );
}
