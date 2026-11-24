"use client";

import { IPermission } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FilePlus2,
  Filter,
  KeyRound,
  Layers3,
  LockKeyhole,
  Pencil,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { apiFetch } from "@/lib/apiFetch";


type PermissionTypeFilter = "all" | "system" | "custom";

// --------------------------------------------------
// Constants
// --------------------------------------------------

const PAGE_SIZE = 10;

const PERMISSIONS_ROUTE = "/dashboard/permissions";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "خطایی در دریافت اطلاعات رخ داده است.";
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLocaleLowerCase("fa");
}

// --------------------------------------------------
// Page
// --------------------------------------------------

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<IPermission[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [typeFilter, setTypeFilter] =
    useState<PermissionTypeFilter>("all");

  const [currentPage, setCurrentPage] = useState(1);

  // --------------------------------------------------
  // Fetch
  // --------------------------------------------------

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiFetch<IPermission[]>("/api/permissions", {
        method: "GET",
      });

      setPermissions(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPermissions();
  }, [loadPermissions]);

  // --------------------------------------------------
  // Filters data
  // --------------------------------------------------

  const modules = useMemo(() => {
    return Array.from(
      new Set(
        permissions
          .map((permission) => permission.module)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "fa"));
  }, [permissions]);

const actions = useMemo(() => {
  return Array.from(
    new Set(
      permissions
        .map((permission) => String(permission.action))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}, [permissions]);

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const statistics = useMemo(() => {
    const systemCount = permissions.filter(
      (permission) => permission.isSystem
    ).length;

    const customCount = permissions.length - systemCount;

    return {
      total: permissions.length,
      system: systemCount,
      custom: customCount,
      modules: modules.length,
    };
  }, [permissions, modules]);

  // --------------------------------------------------
  // Filtered permissions
  // --------------------------------------------------

  const filteredPermissions = useMemo(() => {
    const query = normalize(search);

    return permissions.filter((permission) => {
      const matchesSearch =
        !query ||
        normalize(permission.displayName).includes(query) ||
        normalize(permission.name).includes(query) ||
        normalize(permission.module).includes(query) ||
        normalize(permission.description).includes(query);

      const matchesModule =
        moduleFilter === "all" ||
        permission.module === moduleFilter;

      const matchesAction =
        actionFilter === "all" ||
        String(permission.action) === actionFilter;

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "system" && permission.isSystem) ||
        (typeFilter === "custom" && !permission.isSystem);

      return (
        matchesSearch &&
        matchesModule &&
        matchesAction&&
        matchesType
      );
    });
  }, [search, permissions, moduleFilter, actionFilter, typeFilter]);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPermissions.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPermissions = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredPermissions.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredPermissions, safeCurrentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, moduleFilter, actionFilter, typeFilter]);

  // --------------------------------------------------
  // Reset filters
  // --------------------------------------------------

  const resetFilters = () => {
    setSearch("");
    setModuleFilter("all");
    setActionFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    moduleFilter !== "all" ||
    actionFilter !== "all" ||
    typeFilter !== "all";

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw
            size={30}
            className="animate-spin text-indigo-600"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            در حال دریافت مجوزها...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <AlertCircle
            size={38}
            className="mx-auto mb-3 text-red-500"
          />

          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
            دریافت مجوزها ناموفق بود
          </h2>

          <p className="mt-2 text-sm leading-7 text-red-600 dark:text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadPermissions()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <RefreshCw size={16} />
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-3 pb-8 sm:px-5 lg:px-8" dir="rtl">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/dashboard"
              className="transition hover:text-indigo-600"
            >
              داشبورد
            </Link>

            <ChevronLeft size={15} />

            <span>مدیریت دسترسی‌ها</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            مدیریت مجوزها
          </h1>

          <p className="mt-1 text-sm leading-7 text-gray-500 dark:text-gray-400">
            مشاهده و مدیریت مجوزهای دسترسی سیستم
          </p>
        </div>

        <Link
          href={`${PERMISSIONS_ROUTE}/add`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          <FilePlus2 size={17} />
          ایجاد مجوز جدید
        </Link>
      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="کل مجوزها"
          value={statistics.total}
          icon={<KeyRound size={21} />}
          color="indigo"
        />

        <StatCard
          title="مجوزهای سیستمی"
          value={statistics.system}
          icon={<ShieldCheck size={21} />}
          color="blue"
        />

        <StatCard
          title="مجوزهای سفارشی"
          value={statistics.custom}
          icon={<ClipboardList size={21} />}
          color="emerald"
        />

        <StatCard
          title="تعداد ماژول‌ها"
          value={statistics.modules}
          icon={<Layers3 size={21} />}
          color="amber"
        />
      </div>

      {/* Main Card */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

        {/* Search and Filters */}

        <div className="space-y-4 border-b border-gray-100 p-4 dark:border-gray-800 sm:p-5">

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجو بر اساس عنوان، نام، ماژول یا توضیحات..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-10 pl-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-gray-800 dark:focus:ring-indigo-500/10"
              />
            </div>

            <button
              type="button"
              onClick={() => void loadPermissions()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RefreshCw size={16} />
              بروزرسانی
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Filter size={16} />
              فیلترها:
            </div>

            {/* Module Filter */}

            <select
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="all">همه ماژول‌ها</option>

              {modules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>

            {/* Action Filter */}

            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="all">همه عملیات‌ها</option>

              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>

            {/* Permission Type Filter */}

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as PermissionTypeFilter)
              }
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="all">همه مجوزها</option>
              <option value="system">سیستمی</option>
              <option value="custom">سفارشی</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-sm text-red-500 transition hover:text-red-700"
              >
                <X size={15} />
                حذف فیلترها
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table */}

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[900px] text-right">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 dark:bg-gray-800/70 dark:text-gray-400">
              <tr>
                <th className="px-5 py-4">مجوز</th>
                <th className="px-5 py-4">ماژول</th>
                <th className="px-5 py-4">نام فنی</th>
                <th className="px-5 py-4">عملیات</th>
                <th className="px-5 py-4">نوع</th>
                <th className="px-5 py-4 text-center">عملیات مدیریتی</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedPermissions.map((permission) => (
                <tr
                  key={permission.id}
                  className="transition hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {permission.displayName}
                    </div>

                    {permission.description && (
                      <p className="mt-1 max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                        {permission.description}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <ModuleBadge module={permission.module} />
                  </td>

                  <td className="px-5 py-4">
                    <code
                      dir="ltr"
                      className="inline-block rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {permission.name}
                    </code>
                  </td>

                  <td className="px-5 py-4">
                    <ActionBadge action={permission.action} />
                  </td>

                  <td className="px-5 py-4">
                    <PermissionTypeBadge isSystem={permission.isSystem} />
                  </td>

                  <td className="px-5 py-4 text-center">
                    <PermissionActions permission={permission} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}

        <div className="grid grid-cols-1 gap-3 p-4 lg:hidden">
          {paginatedPermissions.map((permission) => (
            <div
              key={permission.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {permission.displayName}
                  </h3>

                  <code
                    dir="ltr"
                    className="mt-2 inline-block break-all rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {permission.name}
                  </code>
                </div>

                <PermissionTypeBadge isSystem={permission.isSystem} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <ModuleBadge module={permission.module} />
                <ActionBadge action={permission.action} />
              </div>

              {permission.description && (
                <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
                  {permission.description}
                </p>
              )}

              <div className="mt-4 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
                <PermissionActions permission={permission} />
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}

        {filteredPermissions.length === 0 && (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
              <KeyRound size={25} />
            </div>

            <h3 className="font-semibold text-gray-800 dark:text-white">
              مجوزی پیدا نشد
            </h3>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {hasActiveFilters
                ? "با معیارهای انتخاب‌شده مجوزی وجود ندارد."
                : "هنوز هیچ مجوزی ثبت نشده است."}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                حذف فیلترها
              </button>
            )}
          </div>
        )}

        {/* Pagination */}

        {filteredPermissions.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              نمایش{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {(safeCurrentPage - 1) * PAGE_SIZE + 1}
              </span>
              {" "}تا{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {Math.min(
                  safeCurrentPage * PAGE_SIZE,
                  filteredPermissions.length
                )}
              </span>
              {" "}از{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {filteredPermissions.length}
              </span>
              {" "}مجوز
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="صفحه قبلی"
              >
                <ChevronRight size={17} />
              </button>

              <span className="px-2 text-sm text-gray-600 dark:text-gray-300">
                صفحه {safeCurrentPage} از {totalPages}
              </span>

              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="صفحه بعدی"
              >
                <ChevronLeft size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------
// Statistics Card
// --------------------------------------------------

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "indigo" | "blue" | "emerald" | "amber";
}) {
  const colorClasses = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </p>

        <div className={`rounded-xl p-2.5 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString("fa-IR")}
      </p>
    </div>
  );
}

// --------------------------------------------------
// Module Badge
// --------------------------------------------------

function ModuleBadge({ module }: { module: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
      <Layers3 size={13} />
      {module}
    </span>
  );
}

// --------------------------------------------------
// Action Badge
// --------------------------------------------------

function ActionBadge({
  action,
}: {
  action: string | number;
}) {
  return (
    <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
      {String(action)}
    </span>
  );
}

// --------------------------------------------------
// Permission Type Badge
// --------------------------------------------------

function PermissionTypeBadge({
  isSystem,
}: {
  isSystem: boolean;
}) {
  return isSystem ? (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
      <LockKeyhole size={13} />
      سیستمی
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
      <ShieldCheck size={13} />
      سفارشی
    </span>
  );
}

// --------------------------------------------------
// Permission Actions
// --------------------------------------------------

function PermissionActions({
  permission,
}: {
  permission: IPermission;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Link
        href={`${PERMISSIONS_ROUTE}/${permission.id}`}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:border-elf/30 hover:bg-elf/5 hover:text-elf dark:border-gray-700 dark:text-gray-200 dark:hover:bg-elf/10"
      >
        <Eye size={15} />
        مشاهده
      </Link>
      {!permission.isSystem && (
        <Link
          href={`${PERMISSIONS_ROUTE}/${permission.id}/edit`}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:border-elf/30 hover:bg-elf/5 hover:text-elf dark:border-gray-700 dark:text-gray-200 dark:hover:bg-elf/10"
        >
          <Pencil size={15} />
          ویرایش
        </Link>
      )}
      {permission.isSystem && <span className="text-xs text-gray-400">سیستمی</span>}
    </div>
  );
}