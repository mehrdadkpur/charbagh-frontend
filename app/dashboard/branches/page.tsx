"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Building2,
  MapPin,
  Phone,
  Pencil,
  MoreVertical,
  Power,
  PowerOff,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Filter,
} from "lucide-react";

import { ApiError, apiFetch } from "@/lib/apiFetch";

interface IBranch {
  id: string;
  name: string;
  code: string | null;
  phoneNumber: string | null;
  address: string | null;
  isActive: boolean;
}

type StatusFilter = "all" | "active" | "inactive";

const PAGE_SIZE = 8;
const BRANCHES_ROUTE = "/dashboard/branches";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || "خطایی در ارتباط با سرور رخ داد.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "خطای غیرمنتظره‌ای رخ داد.";
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const loadBranches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiFetch<IBranch[]>("/api/branches");
      setBranches(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const stats = useMemo(() => {
    const active = branches.filter((branch) => branch.isActive).length;
    const inactive = branches.length - active;

    return {
      total: branches.length,
      active,
      inactive,
    };
  }, [branches]);

  const filteredBranches = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return branches.filter((branch) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          branch.name,
          branch.code,
          branch.phoneNumber,
          branch.address,
        ].some((value) =>
          value?.toLowerCase().includes(normalizedSearch)
        );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && branch.isActive) ||
        (statusFilter === "inactive" && !branch.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [branches, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBranches.length / PAGE_SIZE)
  );

  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleStatusChange = async (branch: IBranch) => {
    const action = branch.isActive ? "deactivate" : "activate";

    setProcessingId(branch.id);
    setOpenMenuId(null);
    setError("");

    try {
      const updatedBranch = await apiFetch<IBranch>(
        `/api/branches/${branch.id}/${action}`,
        { method: "PATCH" }
      );

      setBranches((previous) =>
        previous.map((item) =>
          item.id === branch.id
            ? { ...item, ...updatedBranch }
            : item
        )
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
        isActive
          ? "bg-elf-100 text-elf-900 dark:bg-elf-900 dark:text-elf-100"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {isActive ? "فعال" : "غیرفعال"}
    </span>
  );


  return (
    <div dir="rtl" className="min-h-screen space-y-6 bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>مدیریت</span>
            <ChevronLeft size={14} />
            <span>شعب</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-elf-100 p-3 text-elf-900 dark:bg-elf-900 dark:text-elf-100">
              <Building2 size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                مدیریت شعب
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                مدیریت و بررسی اطلاعات شعب مجموعه
              </p>
            </div>
          </div>
        </div>

        <Link
          href={`${BRANCHES_ROUTE}/add`}
          className="inline-flex items-center gap-2 rounded-xl bg-elf-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-elf-700 dark:bg-elf-700 dark:hover:bg-elf-900"
        >
          <Plus size={18} />
          افزودن شعبه جدید
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                کل شعب
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.total}
              </p>
            </div>
            <div className="rounded-xl bg-elf-100 p-3 text-elf-900 dark:bg-elf-900 dark:text-elf-100">
              <Building2 size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                شعب فعال
              </p>
              <p className="mt-2 text-3xl font-bold text-elf-900 dark:text-elf-300">
                {stats.active}
              </p>
            </div>
            <div className="rounded-xl bg-elf-100 p-3 text-elf-900 dark:bg-elf-900 dark:text-elf-100">
              <CheckCircle2 size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                شعب غیرفعال
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-700 dark:text-gray-200">
                {stats.inactive}
              </p>
            </div>
            <div className="rounded-xl bg-gray-100 p-3 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <XCircle size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>

          <button
            type="button"
            onClick={loadBranches}
            className="font-medium underline"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* List */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Filters */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو در نام، کد، تلفن یا آدرس..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-elf-700 focus:ring-4 focus:ring-elf-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-elf-300 dark:focus:ring-elf-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter size={17} className="text-gray-400" />

            {[
              { value: "all", label: "همه شعب" },
              { value: "active", label: "فعال" },
              { value: "inactive", label: "غیرفعال" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setStatusFilter(item.value as StatusFilter)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  statusFilter === item.value
                    ? "bg-elf-900 text-white dark:bg-elf-700"
                    : "bg-gray-100 text-gray-600 hover:bg-elf-100 hover:text-elf-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-elf-900 dark:hover:text-elf-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin text-elf-700 dark:text-elf-300" size={30} />
            <span className="text-sm">در حال دریافت شعب...</span>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
            <div className="rounded-2xl bg-elf-100 p-4 text-elf-900 dark:bg-elf-900 dark:text-elf-100">
              <Building2 size={32} />
            </div>

            <h3 className="mt-4 font-semibold text-gray-800 dark:text-gray-100">
              {branches.length === 0
                ? "هنوز شعبه‌ای ثبت نشده است"
                : "شعبه‌ای با این مشخصات پیدا نشد"}
            </h3>

            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              {branches.length === 0
                ? "برای شروع، اولین شعبه مجموعه را ثبت کنید."
                : "عبارت جستجو یا فیلتر وضعیت را تغییر دهید."}
            </p>

            {branches.length === 0 && (
              <Link
                href={`${BRANCHES_ROUTE}/add`}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-elf-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-elf-700 dark:bg-elf-700 dark:hover:bg-elf-900"
              >
                <Plus size={17} />
                افزودن اولین شعبه
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-right">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4">شعبه</th>
                    <th className="px-6 py-4">کد شعبه</th>
                    <th className="px-6 py-4">شماره تماس</th>
                    <th className="px-6 py-4">آدرس</th>
                    <th className="px-6 py-4">وضعیت</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginatedBranches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="transition hover:bg-elf-100/40 dark:hover:bg-elf-900/20"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-elf-100 p-2.5 text-elf-900 dark:bg-elf-900 dark:text-elf-100">
                            <Building2 size={19} />
                          </div>
                            <Link
                              href={`/dashboard/branches/${branch.id}`}
                              className="block truncate font-DanaDemiBold text-gray-900 transition hover:text-elf dark:text-white dark:hover:text-emerald-300"
                            >
                              {branch.name}
                            </Link>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {branch.code || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {branch.phoneNumber || "—"}
                      </td>

                      <td className="max-w-xs px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin size={15} className="shrink-0" />
                          <span className="truncate">
                            {branch.address || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge isActive={branch.isActive} />
                      </td>


                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 p-4 md:hidden">
              {paginatedBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-xl bg-elf-100 p-2.5 text-elf-900 dark:bg-elf-900 dark:text-elf-100">
                        <Building2 size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100">
                          {branch.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          کد: {branch.code || "ثبت نشده"}
                        </p>
                      </div>
                    </div>

                    <StatusBadge isActive={branch.isActive} />
                  </div>

                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Phone size={15} className="text-gray-400" />
                      <span>{branch.phoneNumber || "شماره تماس ثبت نشده"}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
                      <span>{branch.address || "آدرس ثبت نشده"}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                    <Link
                      href={`${BRANCHES_ROUTE}/${branch.id}/edit`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-elf-100 px-3 py-2.5 text-sm font-medium text-elf-900 transition hover:bg-elf-300 dark:bg-elf-900 dark:text-elf-100 dark:hover:bg-elf-700"
                    >
                      <Pencil size={15} />
                      ویرایش
                    </Link>

                    <button
                      type="button"
                      disabled={processingId === branch.id}
                      onClick={() => handleStatusChange(branch)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {processingId === branch.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : branch.isActive ? (
                        <PowerOff size={15} className="text-red-500" />
                      ) : (
                        <Power size={15} className="text-elf-700 dark:text-elf-300" />
                      )}

                      {branch.isActive ? "غیرفعال کردن" : "فعال کردن"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                نمایش{" "}
                {filteredBranches.length === 0
                  ? 0
                  : (currentPage - 1) * PAGE_SIZE + 1}
                {" تا "}
                {Math.min(currentPage * PAGE_SIZE, filteredBranches.length)}
                {" از "}
                {filteredBranches.length} شعبه
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-elf-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-elf-900"
                  aria-label="صفحه قبل"
                >
                  <ChevronRight size={18} />
                </button>

                <span className="min-w-16 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-elf-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-elf-900"
                  aria-label="صفحه بعد"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}