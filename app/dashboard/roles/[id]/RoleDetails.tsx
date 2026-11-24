"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  ShieldCheck,
  ShieldOff,
  Users,
  Building2,
  KeyRound,
  Plus,
  Trash2,
  RefreshCw,
  RotateCcw,
  Search,
  Pencil,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  UserPlus,
  LockKeyhole,
  Info,
} from "lucide-react";
import Swal from "sweetalert2";

import { apiFetch, ApiError } from "@/lib/apiFetch";
import toast from "react-hot-toast";

interface Permission {
  id: string;
  module: string;
  name: string;
  action: number;
  displayName: string;
  description: string | null;
  isSystem: boolean;
}

interface RoleUser {
  userBranchRoleId: string;
  userBranchId: string;
  userId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string | null;
  branchId: string;
  branchName: string;
  isUserBranchActive: boolean;
  isAssignmentActive: boolean;
  assignedAt: string;
  assignedBy: string | null;
  assignedByName: string | null;
}

interface RoleDetails {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  activeAssignmentCount: number;
  uniqueUserCount: number;
  branchCount: number;
  users: RoleUser[];
  permissions: Permission[];
}

type AvailableUserBranch = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  nationalIdentificationNumber: string;
  status: number;
  userBranchId: string;
  userId: string;
};

type UserSearchResult = {
  id: string;
  firstName: string;
  lastName: string;
  nationalIdentificationNumber: string | null;
  mobile: string;
  email: string | null;
  status: number;
};

function normalizeNationalCode(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\D/g, "")
    .slice(0, 10);
}

const PAGE_SIZE = 8;

const actionLabels: Record<number, string> = {
  0: "مشاهده",
  1: "ایجاد",
  2: "ویرایش",
  3: "حذف",
  4: "مدیریت",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    return "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.";
  }

  return error instanceof Error
    ? error.message
    : "عملیات با خطا مواجه شد.";
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-DanaDemiBold ${
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      }`}
    >
      {active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {active ? "فعال" : "غیرفعال"}
    </span>
  );
}

function SystemBadge({ system }: { system: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-DanaDemiBold ${
        system
          ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
          : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
      }`}
    >
      {system ? "نقش سیستمی" : "نقش سفارشی"}
    </span>
  );
}

export default function RoleDetails({ roleId }: { roleId: string }) {
  const [role, setRole] = useState<RoleDetails | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [availableUserBranches, setAvailableUserBranches] = useState<AvailableUserBranch[]>([]);
  const [searchedUser, setSearchedUser] = useState<UserSearchResult | null>(null);
  const [nationalCode, setNationalCode] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [userPage, setUserPage] = useState(1);

  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddPermission, setShowAddPermission] = useState(false);

  const [selectedUserBranchId, setSelectedUserBranchId] = useState("");
  const [selectedPermissionId, setSelectedPermissionId] = useState("");

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [details, permissions] = await Promise.all([
        apiFetch<RoleDetails>(`/api/roles/${roleId}`),
        apiFetch<Permission[]>("/api/roles/permissions/available"),
      ]);

      setRole(details);
      setAvailablePermissions(permissions);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [roleId]);
  

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  const assignedPermissionIds = useMemo(
    () => new Set(role?.permissions.map((x) => x.id) ?? []),
    [role]
  );

  const unassignedPermissions = useMemo(() => {
    const query = permissionSearch.trim().toLocaleLowerCase("fa");

    return availablePermissions.filter((permission) => {
      if (assignedPermissionIds.has(permission.id)) return false;

      const searchable = [
        permission.displayName,
        permission.module,
        permission.name,
        permission.description,
      ];

      return (
        !query ||
        searchable.some((x) =>
          String(x ?? "").toLocaleLowerCase("fa").includes(query)
        )
      );
    });
  }, [availablePermissions, assignedPermissionIds, permissionSearch]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLocaleLowerCase("fa");

    return (role?.users ?? []).filter((user) => {
      const searchable = [
        user.firstName,
        user.lastName,
        user.mobile,
        user.email,
        user.branchName,
      ];

      return (
        !query ||
        searchable.some((x) =>
          String(x ?? "").toLocaleLowerCase("fa").includes(query)
        )
      );
    });
  }, [role, userSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * PAGE_SIZE,
    userPage * PAGE_SIZE
  );

  const permissionsByModule = useMemo(() => {
    const groups = new Map<string, Permission[]>();

    for (const permission of role?.permissions ?? []) {
      const items = groups.get(permission.module) ?? [];
      items.push(permission);
      groups.set(permission.module, items);
    }

    return Array.from(groups.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
  }, [role]);

  const handleStatusChange = async () => {
    if (!role) return;

    const activating = !role.isActive;

    if(role.isSystem){
      toast.error("نقش های سیستمی قابل تغییر نیستند")
      return;
    }

    const confirmation = await Swal.fire({
      title: activating ? "فعال‌سازی نقش" : "غیرفعال‌سازی نقش",
      text: activating
        ? `نقش «${role.displayName}» فعال شود؟`
        : `نقش «${role.displayName}» غیرفعال شود؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: activating ? "فعال شود" : "غیرفعال شود",
      cancelButtonText: "انصراف",
      confirmButtonColor: activating ? "#059669" : "#d97706",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    try {
      setBusy(true);

      await apiFetch(
        `/api/roles/${role.id}/${activating ? "activate" : "deactivate"}`,
        { method: "PATCH" }
      );

      await loadDetails();

      await Swal.fire({
        title: "عملیات موفق",
        text: activating ? "نقش فعال شد." : "نقش غیرفعال شد.",
        icon: "success",
        confirmButtonText: "متوجه شدم",
      });
    } catch (err) {
      await Swal.fire({
        title: "خطا",
        text: getErrorMessage(err),
        icon: "error",
        confirmButtonText: "متوجه شدم",
      });
    } finally {
      setBusy(false);
    }
  };

  const openAddUser = () => {
    setNationalCode("");
    setSearchedUser(null);
    setAvailableUserBranches([]);
    setSelectedUserBranchId("");
    setUserSearchError(null);
    setShowAddUser(true);
  };

  const handleNationalCodeChange = (value: string) => {
    setNationalCode(normalizeNationalCode(value));
    setSearchedUser(null);
    setAvailableUserBranches([]);
    setSelectedUserBranchId("");
    setUserSearchError(null);
  };

const handleSearchUser = async () => {
  if (nationalCode.length !== 10) {
    setUserSearchError("کد ملی باید دقیقاً ۱۰ رقم باشد.");
    return;
  }

  try {
    setSearchingUser(true);
    setUserSearchError(null);
    setSearchedUser(null);
    setAvailableUserBranches([]);
    setSelectedUserBranchId("");

    const availableUsers = await apiFetch<AvailableUserBranch[]>(
      `/api/roles/${role?.id}/available-users`
    );

    const matchedUsers = availableUsers.filter(
      (item) =>
        item.nationalIdentificationNumber?.trim() === nationalCode &&
        item.status === 1
    );

    if (matchedUsers.length === 0) {
      setUserSearchError(
        "کاربر فعالی با این کد ملی در فهرست کاربران قابل افزودن به این نقش پیدا نشد."
      );
      return;
    }

    setSearchedUser(matchedUsers[0]);
    setAvailableUserBranches(matchedUsers);

    if (matchedUsers.length === 1) {
      setSelectedUserBranchId(matchedUsers[0].userBranchId);
    }
  } catch (err) {
    setUserSearchError(getErrorMessage(err));
  } finally {
    setSearchingUser(false);
  }
};


const handleAddUser = async () => {
  if (
    !selectedUserBranchId ||
    !searchedUser ||
    searchedUser.status !== 1 ||
    !role?.id
  ) {
    return;
  }

  try {
    setBusy(true);

    await apiFetch("/api/userBranchRoles", {
      method: "POST",
      body: JSON.stringify({
        userBranchId: selectedUserBranchId,
        roleId: role.id,
        isDefault: false,
        assignedBy: null,
      }),
    });

    setShowAddUser(false);
    setSearchedUser(null);
    setNationalCode("");
    setSelectedUserBranchId("");
    setAvailableUserBranches([]);
    setUserSearchError(null);

    await loadDetails();

    await Swal.fire({
      title: "عملیات موفق",
      text: "کاربر به نقش اضافه شد.",
      icon: "success",
    });
  } catch (err) {
    await Swal.fire({
      title: "خطا",
      text: getErrorMessage(err),
      icon: "error",
    });
  } finally {
    setBusy(false);
  }
};


  const handleRemoveUser = async (user: RoleUser) => {
    const confirmation = await Swal.fire({
      title: "حذف تخصیص نقش",
      html: `تخصیص نقش از کاربر <strong>${user.firstName} ${user.lastName}</strong> در شعبه <strong>${user.branchName}</strong> غیرفعال شود؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "انصراف",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    try {
      setBusy(true);

      await apiFetch(
        `/api/userBranchRoles/${user.userBranchRoleId}/remove`,
        { method: "PATCH" }
      );

      await loadDetails();

      await Swal.fire({
        title: "عملیات موفق",
        text: "تخصیص کاربر به نقش غیرفعال شد.",
        icon: "success",
      });
    } catch (err) {
      await Swal.fire({
        title: "خطا",
        text: getErrorMessage(err),
        icon: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleReactivateUser = async (user: RoleUser) => {
    if (!user.isUserBranchActive) {
      await Swal.fire({
        title: "امکان فعال‌سازی وجود ندارد",
        text: "عضویت این کاربر در شعبه غیرفعال است. ابتدا باید عضویت کاربر در شعبه فعال شود.",
        icon: "warning",
      });
      return;
    }

    const confirmation = await Swal.fire({
      title: "فعال‌سازی مجدد تخصیص",
      html: `تخصیص نقش برای کاربر <strong>${user.firstName} ${user.lastName}</strong> در شعبه <strong>${user.branchName}</strong> دوباره فعال شود؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "بله، فعال شود",
      cancelButtonText: "انصراف",
      confirmButtonColor: "#16a34a",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    try {
      setBusy(true);

      await apiFetch(
        `/api/userBranchRoles/${user.userBranchRoleId}/activate`,
        { method: "PATCH" }
      );

      await loadDetails();

      await Swal.fire({
        title: "عملیات موفق",
        text: "تخصیص نقش مجدداً فعال شد.",
        icon: "success",
      });
    } catch (err) {
      await Swal.fire({
        title: "خطا",
        text: getErrorMessage(err),
        icon: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleAddPermission = async () => {
    if (!selectedPermissionId) return;

    try {
      setBusy(true);

      await apiFetch(
        `/api/roles/${roleId}/permissions/${selectedPermissionId}`,
        { method: "POST" }
      );

      setShowAddPermission(false);
      setSelectedPermissionId("");
      setPermissionSearch("");

      await loadDetails();

      await Swal.fire({
        title: "عملیات موفق",
        text: "مجوز به نقش اضافه شد.",
        icon: "success",
      });
    } catch (err) {
      await Swal.fire({
        title: "خطا",
        text: getErrorMessage(err),
        icon: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleRemovePermission = async (permission: Permission) => {
    const confirmation = await Swal.fire({
      title: "لغو مجوز",
      text: `مجوز «${permission.displayName}» از این نقش گرفته شود؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، لغو شود",
      cancelButtonText: "انصراف",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    try {
      setBusy(true);

      await apiFetch(
        `/api/roles/${roleId}/permissions/${permission.id}`,
        { method: "DELETE" }
      );

      await loadDetails();

      await Swal.fire({
        title: "عملیات موفق",
        text: "مجوز از نقش گرفته شد.",
        icon: "success",
      });
    } catch (err) {
      await Swal.fire({
        title: "خطا",
        text: getErrorMessage(err),
        icon: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="animate-spin text-elf" size={32} />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <AlertCircle className="mx-auto text-red-500" size={30} />
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error ?? "نقش موردنظر پیدا نشد."}
        </p>

        <button
          type="button"
          onClick={() => void loadDetails()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2 text-sm text-white"
        >
          <RefreshCw size={15} />
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-3 pb-8 sm:px-5 lg:px-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/dashboard/roles"
            className="mt-1 rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800"
            title="بازگشت به نقش‌ها"
          >
            <ArrowRight size={19} />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-DanaDemiBold text-xl text-gray-900 dark:text-white sm:text-2xl">
                {role.displayName}
              </h1>
              <StatusBadge active={role.isActive} />
              <SystemBadge system={role.isSystem} />
            </div>

            <p
              dir="ltr"
              className="mt-2 text-right text-sm text-gray-400"
            >
              {role.name}
            </p>

            {role.description && (
              <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
                {role.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || role.isSystem}
            onClick={() => void handleStatusChange()}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white transition disabled:opacity-50 ${
              role.isActive
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {role.isActive ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
            {role.isActive ? "غیرفعال کردن" : "فعال‌سازی"}
          </button>

          <Link
            href={`/dashboard/roles/${role.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Pencil size={16} />
            ویرایش نقش
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Users size={21} />}
          title="تخصیص‌های فعال"
          value={role.activeAssignmentCount}
          color="blue"
        />
        <SummaryCard
          icon={<UserPlus size={21} />}
          title="کاربران یکتا"
          value={role.uniqueUserCount}
          color="emerald"
        />
        <SummaryCard
          icon={<Building2 size={21} />}
          title="شعب فعال دارای نقش"
          value={role.branchCount}
          color="violet"
        />
        <SummaryCard
          icon={<KeyRound size={21} />}
          title="مجوزهای نقش"
          value={role.permissions.length}
          color="amber"
        />
      </div>

      {/* Role information */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <Info size={19} className="text-elf" />
          <h2 className="font-DanaDemiBold text-gray-900 dark:text-white">
            اطلاعات نقش
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoItem label="نام نمایشی" value={role.displayName} />
          <InfoItem label="نام فنی" value={role.name} dir="ltr" />
          <InfoItem label="تاریخ ایجاد" value={formatDate(role.createdAt)} />
          <InfoItem label="آخرین بروزرسانی" value={formatDate(role.updatedAt)} />
        </div>
      </section>

      {/* Users */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-DanaDemiBold text-gray-900 dark:text-white">
              <Users className="text-elf" size={19} />
              کاربران این نقش
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              تخصیص نقش به کاربران در هر شعبه به‌صورت مستقل مدیریت می‌شود.
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={openAddUser}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <UserPlus size={16} />
            افزودن کاربر
          </button>
        </div>

        <div className="relative mt-5 max-w-md">
          <Search
            size={17}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setUserPage(1);
            }}
            placeholder="جست‌وجوی نام، موبایل یا شعبه..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-3 text-sm outline-none transition focus:border-elf dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 dark:border-gray-800">
                <th className="px-3 py-3 font-medium">کاربر</th>
                <th className="px-3 py-3 font-medium">موبایل</th>
                <th className="px-3 py-3 font-medium">شعبه</th>
                <th className="px-3 py-3 font-medium">وضعیت تخصیص</th>
                <th className="px-3 py-3 font-medium">تاریخ تخصیص</th>
                <th className="px-3 py-3 font-medium">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.map((user) => {
                const active =
                  user.isAssignmentActive && user.isUserBranchActive;

                return (
                  <tr
                    key={user.userBranchRoleId}
                    className="border-b border-gray-50 last:border-0 dark:border-gray-800/70"
                  >
                    <td className="px-3 py-4">
                      <div className="font-DanaDemiBold text-gray-800 dark:text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {user.email || "بدون ایمیل"}
                      </div>
                    </td>

                    <td dir="ltr" className="px-3 py-4 text-right text-gray-500">
                      {user.mobile}
                    </td>

                    <td className="px-3 py-4 text-gray-600 dark:text-gray-300">
                      {user.branchName}
                    </td>

                    <td className="px-3 py-4">
                      <StatusBadge active={active} />
                      {!user.isUserBranchActive && (
                        <p className="mt-1 text-xs text-amber-600">
                          عضویت کاربر در شعبه غیرفعال است.
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-4 text-xs text-gray-500">
                      {formatDate(user.assignedAt)}
                    </td>

                    <td className="px-3 py-4">
                      {user.isAssignmentActive ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleRemoveUser(user)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={14} />
                          حذف تخصیص
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy || !user.isUserBranchActive}
                          onClick={() => void handleReactivateUser(user)}
                          title={
                            !user.isUserBranchActive
                              ? "ابتدا عضویت کاربر در شعبه را فعال کنید."
                              : "فعال‌سازی مجدد تخصیص نقش"
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-emerald-950/30"
                        >
                          <RotateCcw size={14} />
                          فعال‌سازی مجدد
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                    کاربری با این مشخصات پیدا نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={userPage}
          totalPages={totalPages}
          onChange={setUserPage}
        />
      </section>

      {/* Permissions */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-DanaDemiBold text-gray-900 dark:text-white">
              <LockKeyhole className="text-elf" size={19} />
              مجوزهای نقش
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              مجوزها بر اساس ماژول دسته‌بندی شده‌اند.
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => setShowAddPermission(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Plus size={16} />
            افزودن مجوز
          </button>
        </div>

        {permissionsByModule.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="mx-auto text-gray-300" size={34} />
            <p className="mt-3 text-sm text-gray-500">
              هنوز مجوزی برای این نقش ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {permissionsByModule.map(([module, permissions]) => (
              <div
                key={module}
                className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
                  <h3 dir="ltr" className="text-sm font-DanaDemiBold text-gray-800 dark:text-white">
                    {module}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatNumber(permissions.length)} مجوز
                  </span>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-DanaDemiBold text-gray-800 dark:text-white">
                            {permission.displayName}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {actionLabels[permission.action] ?? "نامشخص"}
                          </span>
                          {permission.isSystem && (
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                              سیستمی
                            </span>
                          )}
                        </div>

                        <p dir="ltr" className="mt-1 text-left text-xs text-gray-400">
                          {permission.name}
                        </p>

                        {permission.description && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {permission.description}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleRemovePermission(permission)}
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg px-3 py-2 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30 sm:self-center"
                      >
                        <Trash2 size={14} />
                        گرفتن مجوز
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add user dialog */}
      {showAddUser && (
        <Modal
          title="افزودن کاربر به نقش"
          onClose={() => {
            if (busy || searchingUser) return;
            setShowAddUser(false);
          }}
        >
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            ابتدا کد ملی کاربر را وارد و جستجو کنید.
          </p>

          <label
            htmlFor="role-user-national-code"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            کد ملی
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="role-user-national-code"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              dir="ltr"
              maxLength={10}
              value={nationalCode}
              onChange={(event) => handleNationalCodeChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && nationalCode.length === 10 && !searchingUser) {
                  void handleSearchUser();
                }
              }}
              placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-3 text-center tracking-widest text-sm outline-none focus:border-elf dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
            <button
              type="button"
              onClick={() => void handleSearchUser()}
              disabled={searchingUser || nationalCode.length !== 10 || busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-elf px-5 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searchingUser && <Loader2 size={15} className="animate-spin" />}
              {searchingUser ? "در حال جستجو..." : "جستجو"}
            </button>
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-gray-400">
            <span>کد ملی باید ۱۰ رقم باشد.</span>
            <span dir="ltr">{nationalCode.length}/10</span>
          </div>

          {userSearchError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
              {userSearchError}
            </div>
          )}

          {searchedUser && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="font-DanaDemiBold text-emerald-800 dark:text-emerald-300">
                  کاربر پیدا شد
                </span>
                <StatusBadge active={searchedUser.status === 1} />
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">نام و نام خانوادگی</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {searchedUser.firstName} {searchedUser.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">کد ملی</p>
                  <p dir="ltr" className="mt-1 text-right font-medium text-gray-900 dark:text-white">
                    {searchedUser.nationalIdentificationNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">شماره موبایل</p>
                  <p dir="ltr" className="mt-1 text-right font-medium text-gray-900 dark:text-white">
                    {searchedUser.mobile || "—"}
                  </p>
                </div>
                {searchedUser.email && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ایمیل</p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">{searchedUser.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {searchedUser && availableUserBranches.length > 0 && (
            <div className="mt-4">
              <label
                htmlFor="role-user-branch"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                شعبه موردنظر
              </label>
              <select
                id="role-user-branch"
                value={selectedUserBranchId}
                onChange={(event) => setSelectedUserBranchId(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-elf dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              >
                <option value="">انتخاب شعبه</option>
                {availableUserBranches.map((item) => (
                  <option key={item.userBranchId} value={item.userBranchId}>
                    {item.userBranchId}
                  </option>
                ))}
              </select>
            </div>
          )}

          <ModalActions
            busy={busy}
            onCancel={() => setShowAddUser(false)}
            onSubmit={() => void handleAddUser()}
            submitText="افزودن به نقش"
            disabled={!searchedUser || searchedUser.status !== 1 || !selectedUserBranchId}
          />
        </Modal>
      )}

      {/* Add permission dialog */}
      {showAddPermission && (
        <Modal
          title="افزودن مجوز به نقش"
          onClose={() => setShowAddPermission(false)}
        >
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={permissionSearch}
              onChange={(e) => setPermissionSearch(e.target.value)}
              placeholder="جست‌وجوی مجوز یا ماژول..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-10 pl-3 text-sm outline-none focus:border-elf dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </div>

          <select
            value={selectedPermissionId}
            onChange={(e) => setSelectedPermissionId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-elf dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          >
            <option value="">انتخاب مجوز</option>
            {unassignedPermissions.map((permission) => (
              <option key={permission.id} value={permission.id}>
                {permission.module} — {permission.displayName} —{" "}
                {actionLabels[permission.action] ?? "نامشخص"}
              </option>
            ))}
          </select>

          {unassignedPermissions.length === 0 && (
            <p className="mt-3 text-xs text-gray-500">
              مجوز جدیدی برای افزودن پیدا نشد.
            </p>
          )}

          <ModalActions
            busy={busy}
            onCancel={() => setShowAddPermission(false)}
            onSubmit={() => void handleAddPermission()}
            submitText="افزودن مجوز"
            disabled={!selectedPermissionId}
          />
        </Modal>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: "blue" | "emerald" | "violet" | "amber";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 font-DanaDemiBold text-2xl text-gray-900 dark:text-white">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
  dir,
}: {
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        dir={dir}
        className="mt-2 wrap-break-word text-sm font-DanaDemiBold text-gray-800 dark:text-white"
      >
        {value}
      </p>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-DanaDemiBold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <XCircle size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  busy,
  onCancel,
  onSubmit,
  submitText,
  disabled,
}: {
  busy: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  submitText: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300"
      >
        انصراف
      </button>

      <button
        type="button"
        disabled={busy || disabled}
        onClick={onSubmit}
        className="inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm text-white disabled:opacity-50"
      >
        {busy && <Loader2 size={15} className="animate-spin" />}
        {submitText}
      </button>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-xs disabled:opacity-40 dark:border-gray-700"
      >
        قبلی
      </button>

      <span className="text-xs text-gray-500">
        صفحه {formatNumber(currentPage)} از {formatNumber(totalPages)}
      </span>

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-xs disabled:opacity-40 dark:border-gray-700"
      >
        بعدی
      </button>
    </div>
  );
}