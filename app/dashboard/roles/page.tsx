"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Search,
  Plus,
  Shield,
  ShieldCheck,
  ShieldOff,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  RotateCcw,
} from "lucide-react";

import { fetchRoles } from "@/lib/requests";
import { apiFetch } from "@/lib/apiFetch";

interface IRole {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  userCount?: number;
}

type RoleStatusFilter = "all" | "active" | "inactive";
type RoleTypeFilter = "all" | "system" | "custom";
type RoleAction = "activate" | "deactivate";

const PAGE_SIZE = 10;

const formatNumber = (value: number) =>
  new Intl.NumberFormat("fa-IR").format(value);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "خطای نامشخصی رخ داده است.";
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <p className="mt-3 text-2xl font-MorabbaBold text-gray-900 dark:text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-DanaMedium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
      <CheckCircle2 size={14} />
      فعال
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-DanaMedium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      <XCircle size={14} />
      غیرفعال
    </span>
  );
}

function SystemBadge({ isSystem }: { isSystem: boolean }) {
  return isSystem ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-DanaMedium text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
      <ShieldCheck size={14} />
      سیستمی
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-DanaMedium text-sky-700 dark:bg-sky-500/10 dark:text-sky-400">
      <Shield size={14} />
      اختصاصی
    </span>
  );
}



function RoleSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>

      <div className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-800" />

      <div className="space-y-3 rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  hasFilter,
  onReset,
}: {
  hasFilter: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
        <Shield size={30} />
      </div>

      <h3 className="mt-5 text-base font-DanaDemiBold text-gray-800 dark:text-white">
        {hasFilter ? "نقشی پیدا نشد" : "هنوز نقشی ثبت نشده است"}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-7 text-gray-500 dark:text-gray-400">
        {hasFilter
          ? "با تغییر عبارت جست‌وجو یا فیلترها می‌توانید دوباره تلاش کنید."
          : "برای شروع، اولین نقش سیستم را ایجاد کنید."}
      </p>

      {hasFilter && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <RotateCcw size={15} />
          پاک کردن فیلترها
        </button>
      )}
    </div>
  );
}

function RoleMobileCard({
  role,
  busy,
  onStatusChange,
}: {
  role: IRole;
  busy: boolean;
  onStatusChange: (role: IRole, action: RoleAction) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/dashboard/roles/${role.id}`}
            className="block truncate font-DanaDemiBold text-gray-900 transition hover:text-elf dark:text-white dark:hover:text-emerald-300"
          >
            {role.displayName}
          </Link>
        </div>


      </div>

      {role.description && (
        <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
          {role.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge isActive={role.isActive} />
        <SystemBadge isSystem={role.isSystem} />
      </div>
    </div>
  );
}

export default function Roles() {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoleStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<RoleTypeFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyRoleId, setBusyRoleId] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchRoles();

      if (!Array.isArray(data)) {
        throw new Error("ساختار اطلاعات دریافتی نقش‌ها معتبر نیست.");
      }

      setRoles(data);
    } catch (err) {
      console.error("Error loading roles:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const filteredRoles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fa");

    return roles.filter((role) => {
      const matchesQuery =
        !normalizedQuery ||
        role.displayName
          ?.toLocaleLowerCase("fa")
          .includes(normalizedQuery) ||
        role.description
          ?.toLocaleLowerCase("fa")
          .includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && role.isActive) ||
        (statusFilter === "inactive" && !role.isActive);

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "system" && role.isSystem) ||
        (typeFilter === "custom" && !role.isSystem);

      return matchesQuery && matchesStatus && matchesType;
    });
  }, [roles, query, statusFilter, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRoles.length / PAGE_SIZE)
  );

  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredRoles.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredRoles, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, typeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const total = roles.length;
    const active = roles.filter((role) => role.isActive).length;
    const inactive = total - active;
    const system = roles.filter((role) => role.isSystem).length;

    return {
      total,
      active,
      inactive,
      system,
    };
  }, [roles]);

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  const handleStatusChange = async (
    role: IRole,
    action: RoleAction
  ) => {
    const isActivating = action === "activate";

    const result = await Swal.fire({
      title: isActivating
        ? "فعال‌سازی نقش"
        : "غیرفعال کردن نقش",
      html: isActivating
        ? `آیا از فعال‌سازی نقش <strong>${role.displayName}</strong> اطمینان دارید؟`
        : `آیا از غیرفعال کردن نقش <strong>${role.displayName}</strong> اطمینان دارید؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isActivating
        ? "بله، فعال شود"
        : "بله، غیرفعال شود",
      cancelButtonText: "انصراف",
      confirmButtonColor: isActivating ? "#059669" : "#d97706",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setBusyRoleId(role.id);

      await apiFetch<void>(
        `/api/roles/${role.id}/${action}`,
        { method: "PATCH" }
      );

      await Swal.fire({
        title: "عملیات موفق",
        text: isActivating
          ? "نقش با موفقیت فعال شد."
          : "نقش با موفقیت غیرفعال شد.",
        icon: "success",
        confirmButtonText: "متوجه شدم",
      });

      await loadRoles();
    } catch (err) {
      console.error("Error changing role status:", err);

      await Swal.fire({
        title: "خطا",
        text: getErrorMessage(err),
        icon: "error",
        confirmButtonText: "متوجه شدم",
      });
    } finally {
      setBusyRoleId(null);
    }
  };

  const hasFilter =
    query.trim().length > 0 ||
    statusFilter !== "all" ||
    typeFilter !== "all";

  return (
    <section
      dir="rtl"
      className="mx-auto w-full space-y-6 px-3 pb-10 sm:px-5 lg:px-7"
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-MorabbaBold text-gray-900 dark:text-white">
            مدیریت نقش‌ها
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            مدیریت نقش‌ها و وضعیت دسترسی آن‌ها در شعبهٔ انتخاب‌شده
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadRoles()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            بروزرسانی
          </button>

          <Link
            href="/dashboard/roles/add"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-elf-700 px-4 py-3 text-sm text-white shadow-sm transition hover:bg-elf-900"
          >
            <Plus size={18} />
            افزودن نقش
          </Link>
        </div>
      </div>

      {loading && roles.length === 0 ? (
        <RoleSkeleton />
      ) : error && roles.length === 0 ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={22}
              className="mt-1 shrink-0 text-red-600"
            />

            <div className="flex-1">
              <h3 className="font-DanaDemiBold text-red-800 dark:text-red-300">
                دریافت اطلاعات نقش‌ها ناموفق بود
              </h3>

              <p className="mt-2 wrap-break-word text-sm leading-7 text-red-700 dark:text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void loadRoles()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm text-white transition hover:bg-red-700"
              >
                <RefreshCw size={15} />
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="کل نقش‌ها"
              value={formatNumber(stats.total)}
              description="تعداد نقش‌های تعریف‌شده"
              icon={Shield}
              iconClassName="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            />

            <SummaryCard
              title="نقش‌های فعال"
              value={formatNumber(stats.active)}
              description="نقش‌های قابل استفاده"
              icon={ShieldCheck}
              iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />

            <SummaryCard
              title="نقش‌های غیرفعال"
              value={formatNumber(stats.inactive)}
              description="نقش‌های غیرفعال در سیستم"
              icon={ShieldOff}
              iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2 text-sm font-DanaDemiBold text-gray-700 dark:text-gray-200">
              <Filter size={17} />
              جست‌وجو و فیلتر نقش‌ها
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="جست‌وجو بر اساس نام یا توضیحات..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-10 pl-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as RoleStatusFilter
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فقط فعال</option>
                <option value="inactive">فقط غیرفعال</option>
              </select>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value as RoleTypeFilter
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="all">همه نوع نقش‌ها</option>
                <option value="system">نقش‌های سیستمی</option>
                <option value="custom">نقش‌های اختصاصی</option>
              </select>
            </div>

            {hasFilter && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatNumber(filteredRoles.length)} نقش پیدا شد.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
                >
                  <RotateCcw size={13} />
                  پاک کردن فیلترها
                </button>
              </div>
            )}
          </div>

          {/* Error while refreshing existing data */}
          {error && roles.length > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => void loadRoles()}
                className="shrink-0 underline"
              >
                تلاش مجدد
              </button>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:block">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h2 className="font-DanaDemiBold text-gray-800 dark:text-white">
                فهرست نقش‌ها
              </h2>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatNumber(filteredRoles.length)} مورد
              </span>
            </div>

            {paginatedRoles.length === 0 ? (
              <EmptyState
                hasFilter={hasFilter}
                onReset={resetFilters}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-right text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                    <tr>
                      <th className="px-5 py-4 font-DanaMedium">
                        نام نقش
                      </th>

                      <th className="px-5 py-4 font-DanaMedium">
                        نوع نقش
                      </th>

                      <th className="px-5 py-4 font-DanaMedium">
                        وضعیت
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {paginatedRoles.map((role) => (
                      <tr
                        key={role.id}
                        className="transition hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                      >
                        <td className="max-w-[360px] px-5 py-4">
                          <Link
                            href={`/dashboard/roles/${role.id}`}
                            className="font-DanaDemiBold text-gray-900 transition hover:text-elf dark:text-white dark:hover:text-emerald-300"
                          >
                            {role.displayName}
                          </Link>

                          <p className="mt-1 truncate text-xs text-gray-400">
                            {role.description || "بدون توضیحات"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <SystemBadge isSystem={role.isSystem} />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge isActive={role.isActive} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 lg:hidden">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-DanaDemiBold text-gray-800 dark:text-white">
                فهرست نقش‌ها
              </h2>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatNumber(filteredRoles.length)} مورد
              </span>
            </div>

            {paginatedRoles.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <EmptyState
                  hasFilter={hasFilter}
                  onReset={resetFilters}
                />
              </div>
            ) : (
              paginatedRoles.map((role) => (
                <RoleMobileCard
                  key={role.id}
                  role={role}
                  busy={busyRoleId === role.id}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredRoles.length > PAGE_SIZE && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 sm:flex-row">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                نمایش{" "}
                {formatNumber((currentPage - 1) * PAGE_SIZE + 1)}{" "}
                تا{" "}
                {formatNumber(
                  Math.min(
                    currentPage * PAGE_SIZE,
                    filteredRoles.length
                  )
                )}{" "}
                از {formatNumber(filteredRoles.length)} نقش
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  aria-label="صفحه قبلی"
                >
                  <ChevronRight size={17} />
                </button>

                <span className="min-w-20 text-center text-sm text-gray-700 dark:text-gray-200">
                  صفحه {formatNumber(currentPage)} از{" "}
                  {formatNumber(totalPages)}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  aria-label="صفحه بعدی"
                >
                  <ChevronLeft size={17} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}