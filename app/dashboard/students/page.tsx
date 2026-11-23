"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronDown,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserLock,
  UsersRound,
  UserX,
  X,
} from "lucide-react";

import { apiFetch } from "@/lib/apiFetch";
import { ApiError } from "@/helper/ApiError";
import type { IStudent } from "@/lib/types";
import UsersPagination from "@/app/ui/components/UsersPagination";

const PAGE_SIZE = 10;

const STUDENT_STATUS = {
  Pending: 0,
  Active: 1,
  Suspended: 2,
  Blocked: 3,
} as const;

const STATUS_OPTIONS = [
  { value: "all", label: "همه وضعیت‌ها" },
  { value: "0", label: "در انتظار تأیید" },
  { value: "1", label: "فعال" },
  { value: "2", label: "تعلیق‌شده" },
  { value: "3", label: "مسدودشده" },
];

function formatNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

function getStatusLabel(status: number) {
  return (
    STATUS_OPTIONS.find((item) => item.value === String(status))?.label ??
    "نامشخص"
  );
}

function getStatusClass(status: number) {
  switch (status) {
    case STUDENT_STATUS.Active:
      return "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-300 dark:ring-green-400/20";

    case STUDENT_STATUS.Pending:
      return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20";

    case STUDENT_STATUS.Suspended:
      return "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/20";

    case STUDENT_STATUS.Blocked:
      return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20";

    default:
      return "bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-300";
  }
}

function StudentAvatar({ student }: { student: IStudent }) {
  const initials = `${student.firstName?.[0] ?? ""}${student.lastName?.[0] ?? ""}`;

  if (student.profileImageUrl) {
    return (
      <img
        src={student.profileImageUrl}
        alt={`${student.firstName} ${student.lastName}`}
        className="size-11 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-elf/10 text-sm font-bold text-elf dark:text-emerald-300">
      {initials || "؟"}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  accent = false,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof UsersRound;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(value)}
          </p>
        </div>

        <div
          className={`flex size-11 items-center justify-center rounded-2xl ${
            accent
              ? "bg-elf/10 text-elf dark:text-emerald-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}

function StudentStatusBadge({ status }: { status: number }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClass(
        status
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function StudentSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
        >
          <div className="size-11 rounded-full bg-gray-200 dark:bg-gray-800" />

          <div className="flex-1 space-y-2">
            <div className="h-3 w-36 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState<IStudent[]>([]);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<IStudent[]>("/api/students");
      console.log(data);
      
      setStudents(data ?? []);
    } catch (error) {
      console.error("Error loading Students:", error);

      setError(
        error instanceof ApiError && error.status === 401
          ? "نشست شما منقضی شده است. دوباره وارد شوید."
          : error instanceof Error
            ? error.message
            : "دریافت فهرست هنرآموزان ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fa");

    return students.filter((student) => {
      const matchesStatus =
        selectedStatus === "all" ||
        student.status === Number(selectedStatus);

      const searchableFields = [
        student.firstName,
        student.lastName,
        student.studentCode,
      ];

      const matchesQuery =
        !normalized ||
        searchableFields.some((field) =>
          String(field ?? "").toLocaleLowerCase("fa").includes(normalized)
        );

      return matchesStatus && matchesQuery;
    });
  }, [students, query, selectedStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / PAGE_SIZE)
  );

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, currentPage]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const activeCount = students.filter(
    (student) => student.status === STUDENT_STATUS.Active
  ).length;

  const pendingCount = students.filter(
    (student) => student.status === STUDENT_STATUS.Pending
  ).length;

  const unavailableCount = students.filter(
    (student) =>
      student.status === STUDENT_STATUS.Suspended ||
      student.status === STUDENT_STATUS.Blocked
  ).length;

  const resetFilters = () => {
    setQuery("");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const hasFilters = query.trim() !== "" || selectedStatus !== "all";

  console.log(students);
  

  return (
    <section
      dir="rtl"
      className="mx-auto w-full max-w-[1600px] space-y-6 px-3 pb-8 sm:px-5 lg:px-8"
    >
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/dashboard" className="hover:text-elf">
              داشبورد
            </Link>

            <span>/</span>

            <span className="text-gray-700 dark:text-gray-200">
              هنرآموزان
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-elf/10 text-elf dark:text-emerald-300">
              <UsersRound size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                مدیریت هنرآموزان
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                مدیریت اطلاعات حرفه‌ای و وضعیت همکاری هنرآموزان
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/students/add"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-elf/90"
        >
          <Plus size={18} />
          افزودن هنرآموز
        </Link>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="کل هنرآموزان"
          value={students.length}
          icon={UsersRound}
          description="تعداد پروفایل‌های هنرآموز"
          accent
        />

        <SummaryCard
          title="مدرس‌های فعال"
          value={activeCount}
          icon={UserCheck}
          description="مدرس‌های آماده تدریس"
        />

        <SummaryCard
          title="در انتظار تأیید"
          value={pendingCount}
          icon={UserLock}
          description="مدرس‌های تأییدنشده"
        />

        <SummaryCard
          title="تعلیق‌شده یا مسدود"
          value={unavailableCount}
          icon={UserX}
          description="مدرس‌های غیرفعال برای تدریس"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_240px]">
          <div>
            <label
              htmlFor="student-search"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              جست‌وجو
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="student-search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="نام، نام خانوادگی یا کد پرسنلی..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pr-10 pl-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-elf focus:ring-4 focus:ring-elf/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="student-status"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              وضعیت هنرآموز
            </label>

            <div className="relative">
              <select
                id="student-status"
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pl-9 text-sm text-gray-800 outline-none focus:border-elf focus:ring-4 focus:ring-elf/10 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {loading
              ? "در حال دریافت اطلاعات..."
              : `${formatNumber(filteredStudents.length)} نتیجه از ${formatNumber(students.length)} هنرآموز`}
          </p>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <X size={14} />
                پاک کردن فیلترها
              </button>
            )}

            <button
              type="button"
              onClick={() => void loadStudents()}
              disabled={loading}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:bg-elf/5 hover:text-elf disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              به‌روزرسانی
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-800 sm:px-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            فهرست هنرآموزان
          </h2>

          {!loading && !error && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              صفحه {formatNumber(currentPage)} از {formatNumber(totalPages)}
            </span>
          )}
        </div>

        {loading ? (
          <StudentSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <AlertCircle size={28} className="text-red-500" />

            <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
              دریافت هنرآموزان ناموفق بود
            </h3>

            <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500 dark:text-gray-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadStudents()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white"
            >
              <RefreshCw size={16} />
              تلاش مجدد
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <UsersRound size={28} className="text-gray-400" />

            <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
              {hasFilters
                ? "نتیجه‌ای پیدا نشد"
                : "هنوز هنرآموزی ثبت نشده است"}
            </h3>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {hasFilters
                ? "عبارت جست‌وجو یا فیلتر را تغییر بده."
                : "برای شروع، اولین هنرآموز را ثبت کن."}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 text-sm font-medium text-elf"
              >
                پاک کردن فیلترها
              </button>
            ) : (
              <Link
                href="/dashboard/students/add"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={17} />
                افزودن هنرآموزان
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="space-y-3 p-3 md:hidden">
              {paginatedStudents.map((student) => (
                <article
                  key={student.id}
                  className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <StudentAvatar student={student} />

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/students/${student.id}`}
                        className="block truncate font-semibold text-gray-900 transition hover:text-elf dark:text-white dark:hover:text-emerald-300"
                      >
                        {student.firstName} {student.lastName}
                      </Link>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        کد پرسنلی: {student.studentCode}
                      </p>
                    </div>

                    <StudentStatusBadge status={student.status} />
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[650px] text-right text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-4">هنرآموز</th>
                    <th className="px-4 py-4">شماره هنرآموزی </th>
                    <th className="px-4 py-4">وضعیت</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80 dark:border-gray-800 dark:hover:bg-gray-800/40"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <StudentAvatar student={student} />

                          <Link
                            href={`/dashboard/students/${student.id}`}
                            className="font-semibold text-gray-900 transition hover:text-elf dark:text-white dark:hover:text-emerald-300"
                          >
                            {student.firstName} {student.lastName}
                          </Link>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-medium text-gray-700 dark:text-gray-300">
                        {student.studentCode}
                      </td>

                      <td className="px-4 py-4">
                        <StudentStatusBadge status={student.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <UsersPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredStudents.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </section>
  );
}