"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  AlertCircle,
  Ban,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  Mail,
  Pencil,
  PauseCircle,
  RefreshCw,
  RotateCcw,
  UserRound,
  UsersRound,
} from "lucide-react";

import { apiFetch } from "@/lib/apiFetch";
import { ApiError } from "@/helper/ApiError";
import { useCurrentPermissions } from "@/lib/useCurrentPermissions";
import type { ITeacher } from "@/lib/types";

const TEACHER_STATUS = {
  Pending: 0,
  Active: 1,
  Suspended: 2,
  Blocked: 3,
} as const;

type TeacherAction = "activate" | "suspend" | "block" | "unblock";

const STATUS_OPTIONS = [
  { value: 0, label: "در انتظار تأیید" },
  { value: 1, label: "فعال" },
  { value: 2, label: "تعلیق‌شده" },
  { value: 3, label: "مسدودشده" },
];

function formatNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

function formatDate(value?: string | null) {
  if (!value) return "ثبت نشده";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "ثبت نشده";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getStatusLabel(status: number) {
  return (
    STATUS_OPTIONS.find((item) => item.value === status)?.label ??
    "نامشخص"
  );
}

function getStatusClass(status: number) {
  switch (status) {
    case TEACHER_STATUS.Active:
      return "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-300 dark:ring-green-400/20";

    case TEACHER_STATUS.Pending:
      return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20";

    case TEACHER_STATUS.Suspended:
      return "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/20";

    case TEACHER_STATUS.Blocked:
      return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20";

    default:
      return "bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-300";
  }
}

function getEducationLabel(value?: number | null) {
  if (value == null) return "ثبت نشده";

  const labels: Record<number, string> = {
    0: "نامشخص",
    1: "دیپلم",
    2: "کاردانی",
    3: "کارشناسی",
    4: "کارشناسی ارشد",
    5: "دکتری",
  };

  return labels[value] ?? "نامشخص";
}

function getAvailableActions(status: number) {
  switch (status) {
    case TEACHER_STATUS.Pending:
      return [
        {
          key: "activate" as const,
          label: "فعال‌سازی",
          icon: CheckCircle2,
          className:
            "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40",
        },
        {
          key: "block" as const,
          label: "مسدودسازی",
          icon: Ban,
          className:
            "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40",
        },
      ];

    case TEACHER_STATUS.Active:
      return [
        {
          key: "suspend" as const,
          label: "تعلیق مدرس",
          icon: PauseCircle,
          className:
            "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40",
        },
        {
          key: "block" as const,
          label: "مسدودسازی",
          icon: Ban,
          className:
            "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40",
        },
      ];

    case TEACHER_STATUS.Suspended:
      return [
        {
          key: "activate" as const,
          label: "فعال‌سازی مجدد",
          icon: CheckCircle2,
          className:
            "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40",
        },
        {
          key: "block" as const,
          label: "مسدودسازی",
          icon: Ban,
          className:
            "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40",
        },
      ];

    case TEACHER_STATUS.Blocked:
      return [
        {
          key: "unblock" as const,
          label: "رفع مسدودی",
          icon: RotateCcw,
          className:
            "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40",
        },
      ];

    default:
      return [];
  }
}

function TeacherAvatar({ teacher }: { teacher: ITeacher }) {
  const initials = `${teacher.firstName?.[0] ?? ""}${teacher.lastName?.[0] ?? ""}`;

  if (teacher.profileImageUrl) {
    return (
      <img
        src={teacher.profileImageUrl}
        alt={`${teacher.firstName} ${teacher.lastName}`}
        className="size-20 shrink-0 rounded-2xl object-cover"
      />
    );
  }

  return (
    <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-elf/10 text-2xl font-bold text-elf dark:text-emerald-300">
      {initials || "؟"}
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof UserRound;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex size-9 items-center justify-center rounded-xl bg-elf/10 text-elf dark:text-emerald-300">
          <Icon size={19} />
        </div>

        <h2 className="font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function TeacherDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-56 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

export default function TeacherDetails({
  teacherId,
}: {
  teacherId: string;
}) {
  const [teacher, setTeacher] = useState<ITeacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { can } = useCurrentPermissions();

  const loadTeacher = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<ITeacher>(
        `/api/teachers/${teacherId}`
      );

      setTeacher(data);
    } catch (error) {
      console.error("Error loading teacher:", error);

      setError(
        error instanceof ApiError && error.status === 401
          ? "نشست شما منقضی شده است. دوباره وارد شوید."
          : error instanceof Error
            ? error.message
            : "دریافت اطلاعات مدرس ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    void loadTeacher();
  }, [loadTeacher]);

  const handleAction = async (action: TeacherAction) => {
    if (!teacher || busy) return;

    const actionConfig: Record<
      TeacherAction,
      {
        endpoint: string;
        title: string;
        message: string;
        success: string;
      }
    > = {
      activate: {
        endpoint: "activate",
        title: "فعال‌سازی مدرس؟",
        message: "وضعیت این مدرس فعال شود؟",
        success: "مدرس با موفقیت فعال شد.",
      },
      suspend: {
        endpoint: "suspend",
        title: "تعلیق مدرس؟",
        message: "آیا از تعلیق این مدرس مطمئن هستید؟",
        success: "مدرس با موفقیت تعلیق شد.",
      },
      block: {
        endpoint: "block",
        title: "مسدودسازی مدرس؟",
        message: "آیا از مسدودسازی این مدرس مطمئن هستید؟",
        success: "مدرس با موفقیت مسدود شد.",
      },
      unblock: {
        endpoint: "unblock",
        title: "رفع مسدودی مدرس؟",
        message: "آیا از رفع مسدودی این مدرس مطمئن هستید؟",
        success: "مسدودی مدرس با موفقیت برداشته شد.",
      },
    };

    const config = actionConfig[action];

    const result = await Swal.fire({
      title: config.title,
      text: `${teacher.firstName} ${teacher.lastName} — ${config.message}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "تأیید",
      cancelButtonText: "انصراف",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup:
          "rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900",
        title: "text-lg font-semibold dark:text-white",
        htmlContainer: "text-sm dark:text-gray-300",
        actions: "gap-2",
        confirmButton:
          "rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white",
        cancelButton:
          "rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200",
      },
    });

    if (!result.isConfirmed) return;

    setBusy(true);

    try {
      await apiFetch<unknown>(
        `/api/teachers/${teacher.id}/${config.endpoint}`,
        { method: "PATCH" }
      );

      await loadTeacher();

      await Swal.fire({
        title: "انجام شد",
        text: config.success,
        icon: "success",
        confirmButtonText: "متوجه شدم",
        buttonsStyling: false,
        customClass: {
          popup:
            "rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900",
          title: "text-lg font-semibold dark:text-white",
          htmlContainer: "text-sm dark:text-gray-300",
          confirmButton:
            "rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white",
        },
      });
    } catch (error) {
      await Swal.fire({
        title: "عملیات ناموفق بود",
        text:
          error instanceof ApiError && error.status === 401
            ? "نشست شما منقضی شده است. دوباره وارد شوید."
            : error instanceof Error
              ? error.message
              : "اجرای عملیات با خطا مواجه شد.",
        icon: "error",
        confirmButtonText: "متوجه شدم",
      });
    } finally {
      setBusy(false);
    }
  };

  const availableActions = teacher
    ? getAvailableActions(teacher.status)
    : [];

  return (
    <section
      dir="rtl"
      className="mx-auto w-full max-w-[1600px] space-y-6 px-3 pb-8 sm:px-5 lg:px-8"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/dashboard" className="transition hover:text-elf">
          داشبورد
        </Link>

        <span>/</span>

        <Link
          href="/dashboard/teachers"
          className="transition hover:text-elf"
        >
          مدرس‌ها
        </Link>

        <span>/</span>

        <span className="text-gray-700 dark:text-gray-200">
          جزئیات مدرس
        </span>
      </div>

      {loading ? (
        <TeacherDetailsSkeleton />
      ) : error || !teacher ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center dark:border-gray-800 dark:bg-gray-900">
          <AlertCircle className="mx-auto text-red-500" size={30} />

          <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">
            دریافت اطلاعات مدرس ناموفق بود
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {error ?? "مدرس موردنظر پیدا نشد."}
          </p>

          <button
            type="button"
            onClick={() => void loadTeacher()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white"
          >
            <RefreshCw size={16} />
            تلاش مجدد
          </button>
        </div>
      ) : (
        <>
          {/* Profile Header */}
          <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <TeacherAvatar teacher={teacher} />

                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
                    {teacher.firstName} {teacher.lastName}
                  </h1>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    کد پرسنلی: {teacher.personnelCode}
                  </p>

                  <div className="mt-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClass(
                        teacher.status
                      )}`}
                    >
                      {getStatusLabel(teacher.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {can("Teachers", ["Update"]) && <Link
                  href={`/dashboard/teachers/${teacher.id}/edit`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:border-elf/30 hover:bg-elf/5 hover:text-elf dark:border-gray-700 dark:text-gray-200 dark:hover:bg-elf/10 dark:hover:text-emerald-300"
                >
                  <Pencil size={16} />
                  ویرایش اطلاعات
                </Link>}

                {can("Teachers", ["Manage"]) && availableActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.key}
                      type="button"
                      disabled={busy}
                      onClick={() => void handleAction(action.key)}
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${action.className}`}
                    >
                      <Icon size={16} />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Personal Information */}
          <DetailSection title="اطلاعات فردی" icon={UserRound}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <InfoItem
                label="نام"
                value={teacher.firstName || "ثبت نشده"}
                icon={UserRound}
              />

              <InfoItem
                label="نام خانوادگی"
                value={teacher.lastName || "ثبت نشده"}
                icon={UserRound}
              />

              <InfoItem
                label="ایمیل"
                value={teacher.email || "ثبت نشده"}
                icon={Mail}
              />
            </div>
          </DetailSection>

          {/* Professional Information */}
          <DetailSection title="اطلاعات حرفه‌ای" icon={GraduationCap}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <InfoItem
                label="کد پرسنلی"
                value={teacher.personnelCode || "ثبت نشده"}
                icon={UserRound}
              />

              <InfoItem
                label="تاریخ استخدام"
                value={formatDate(teacher.employmentDate)}
                icon={CalendarDays}
              />

              <InfoItem
                label="تحصیلات"
                value={getEducationLabel(teacher.education)}
                icon={GraduationCap}
              />

              <InfoItem
                label="سابقه تدریس"
                value={
                  teacher.experienceYears == null
                    ? "ثبت نشده"
                    : `${formatNumber(teacher.experienceYears)} سال`
                }
                icon={CalendarDays}
              />
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                بیوگرافی
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-300">
                {teacher.biography || "بیوگرافی ثبت نشده است."}
              </p>
            </div>
          </DetailSection>
        </>
      )}

      {busy && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <LoaderCircle size={17} className="animate-spin text-elf" />
          در حال اجرای عملیات...
        </div>
      )}
    </section>
  );
}