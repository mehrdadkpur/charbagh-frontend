export interface UserPermission {
  module: string;
  action: string;
}

export interface CurrentPermissionsResponse {
  branchId: string;
  permissions: UserPermission[];
}

export function hasPermission(
  permissions: UserPermission[],
  module: string,
  action = "View"
): boolean {
  return permissions.some(
    (permission) =>
      permission.module.toLowerCase() === module.toLowerCase() &&
      permission.action.toLowerCase() === action.toLowerCase()
  );
}