"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  GraduationCap,
  CalendarDays,
  LoaderCircle,
  Mail,
  Pencil,
  PauseCircle,
  RefreshCw,
  RotateCcw,
  UserRound,
} from "lucide-react";

import { apiFetch } from "@/lib/apiFetch";
import { ApiError } from "@/helper/ApiError";
import { useCurrentPermissions } from "@/lib/useCurrentPermissions";
import type { IParentDetails, IParentStudentDetails } from "@/lib/types";
import Image from "next/image";

const PARENT_STATUS = {
  Pending: 0,
  Active: 1,
  Suspended: 2,
  Blocked: 3,
} as const;

type ParentAction = "activate" | "suspend" | "block" | "unblock";

const STATUS_OPTIONS = [
  { value: 0, label: "در انتظار تأیید" },
  { value: 1, label: "فعال" },
  { value: 2, label: "تعلیق‌شده" },
  { value: 3, label: "مسدودشده" },
];


function getStatusLabel(status: number) {
  return (
    STATUS_OPTIONS.find((item) => item.value === status)?.label ??
    "نامشخص"
  );
}

function getStatusClass(status: number) {
  switch (status) {
    case PARENT_STATUS.Active:
      return "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-300 dark:ring-green-400/20";

    case PARENT_STATUS.Pending:
      return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20";

    case PARENT_STATUS.Suspended:
      return "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/20";

    case PARENT_STATUS.Blocked:
      return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20";

    default:
      return "bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-300";
  }
}


function getAvailableActions(status: number) {
  switch (status) {
    case PARENT_STATUS.Pending:
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

    case PARENT_STATUS.Active:
      return [
        {
          key: "suspend" as const,
          label: "تعلیق والد",
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

    case PARENT_STATUS.Suspended:
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

    case PARENT_STATUS.Blocked:
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

function ParentAvatar({ parent }: { parent: IParentDetails }) {
  const initials = `${parent.firstName?.[0] ?? ""}${parent.lastName?.[0] ?? ""}`;

  if (parent.profileImageUrl) {
    return (
      <Image
        src={parent.profileImageUrl}
        alt={`${parent.firstName} ${parent.lastName}`}
        width={80}
        height={80}
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

        <p className="mt-1 wrap-break-word text-sm font-medium text-gray-900 dark:text-gray-100">
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

function formatStudentDate(value?: string | null) {
  if (!value) return "ثبت نشده";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ثبت نشده";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getStudentStatusLabel(status: number) {
  const labels: Record<number, string> = {
    0: "در انتظار تأیید",
    1: "فعال",
    2: "تعلیق‌شده",
    3: "مسدودشده",
  };
  return labels[status] ?? "نامشخص";
}

function getRelationshipLabel(value: number) {
  const labels: Record<number, string> = {
    1: "پدر",
    2: "مادر",
    3: "قیم",
    4: "پدربزرگ",
    5: "مادربزرگ",
    6: "برادر",
    7: "خواهر",
    99: "سایر",
  };
  return labels[value] ?? "نامشخص";
}

function ChildCard({ child }: { child: IParentStudentDetails }) {
  return (
    <Link
      href={`/dashboard/students/${child.studentId}`}
      className="group block rounded-xl border border-gray-200 p-4 transition hover:border-elf/40 hover:bg-elf/[0.03] dark:border-gray-700 dark:hover:bg-elf/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {child.profileImageUrl ? (
            <Image
              src={child.profileImageUrl}
              alt={`${child.firstName} ${child.lastName}`}
              width={52}
              height={52}
              className="size-13 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-elf/10 text-lg font-bold text-elf dark:text-emerald-300">
              {child.firstName?.[0] ?? ""}{child.lastName?.[0] ?? ""}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-gray-900 group-hover:text-elf dark:text-white">
              {child.firstName} {child.lastName}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              کد هنرآموزی: {child.studentCode}
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${child.status === 1 ? "bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300" : child.status === 0 ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
          {getStudentStatusLabel(child.status)}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-3 text-sm dark:border-gray-800 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <CalendarDays size={16} className="text-gray-400" />
          <span className="text-xs">تاریخ تولد: {formatStudentDate(child.birthDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <UserRound size={16} className="text-gray-400" />
          <span className="text-xs">نسبت: {getRelationshipLabel(child.relationship)}</span>
        </div>
      </div>
    </Link>
  );
}

function ParentDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-56 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

export default function ParentDetails({parentId,}: {parentId: string;}) {
  
  const [parent, setParent] = useState<IParentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { can } = useCurrentPermissions();

  const loadParent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<IParentDetails>(
        `/api/parents/${parentId}`
      );

      setParent(data);
    } catch (error) {
      console.error("Error loading parent:", error);

      setError(
        error instanceof ApiError && error.status === 401
          ? "نشست شما منقضی شده است. دوباره وارد شوید."
          : error instanceof Error
            ? error.message
            : "دریافت اطلاعات والد ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    void loadParent();
  }, [loadParent]);

  const handleAction = async (action: ParentAction) => {
    if (!parent || busy) return;

    const actionConfig: Record<
      ParentAction,
      {
        endpoint: string;
        title: string;
        message: string;
        success: string;
      }
    > = {
      activate: {
        endpoint: "activate",
        title: "فعال‌سازی والد؟",
        message: "وضعیت این والد فعال شود؟",
        success: "والد با موفقیت فعال شد.",
      },
      suspend: {
        endpoint: "suspend",
        title: "تعلیق والد؟",
        message: "آیا از تعلیق این والد مطمئن هستید؟",
        success: "والد با موفقیت تعلیق شد.",
      },
      block: {
        endpoint: "block",
        title: "مسدودسازی والد؟",
        message: "آیا از مسدودسازی این والد مطمئن هستید؟",
        success: "والد با موفقیت مسدود شد.",
      },
      unblock: {
        endpoint: "unblock",
        title: "رفع مسدودی والد؟",
        message: "آیا از رفع مسدودی این والد مطمئن هستید؟",
        success: "مسدودی والد با موفقیت برداشته شد.",
      },
    };

    const config = actionConfig[action];

    const result = await Swal.fire({
      title: config.title,
      text: `${parent.firstName} ${parent.lastName} — ${config.message}`,
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
        `/api/parents/${parent.id}/${config.endpoint}`,
        { method: "PATCH" }
      );

      await loadParent();

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

  const availableActions = parent
    ? getAvailableActions(parent.status)
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
          href="/dashboard/parents"
          className="transition hover:text-elf"
        >
          والد‌ها
        </Link>

        <span>/</span>

        <span className="text-gray-700 dark:text-gray-200">
          جزئیات والد
        </span>
      </div>

      {loading ? (
        <ParentDetailsSkeleton />
      ) : error || !parent ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center dark:border-gray-800 dark:bg-gray-900">
          <AlertCircle className="mx-auto text-red-500" size={30} />

          <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">
            دریافت اطلاعات والد ناموفق بود
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {error ?? "والد موردنظر پیدا نشد."}
          </p>

          <button
            type="button"
            onClick={() => void loadParent()}
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
                <ParentAvatar parent={parent} />

                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
                    {parent.firstName} {parent.lastName}
                  </h1>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                     شماره ملی: {parent.nationalIdentificationNumber}
                  </p>

                  <div className="mt-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClass(
                        parent.status
                      )}`}
                    >
                      {getStatusLabel(parent.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {can("Parents", ["Manage"]) && availableActions.map((action) => {
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
                value={parent.firstName || "ثبت نشده"}
                icon={UserRound}
              />

              <InfoItem
                label="نام خانوادگی"
                value={parent.lastName || "ثبت نشده"}
                icon={UserRound}
              />

              <InfoItem
                label="ایمیل"
                value={parent.email || "ثبت نشده"}
                icon={Mail}
              />
            </div>
          </DetailSection>

          <DetailSection title="فرزندان و هنرآموزان تحت سرپرستی" icon={GraduationCap}>
            {!parent.children?.length ? (
              <div className="py-8 text-center">
                <GraduationCap size={30} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  هنوز هیچ هنرآموزی به این والد یا سرپرست متصل نشده است.
                </p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  تعداد فرزندان و هنرآموزان متصل‌شده: {parent.children.length.toLocaleString("fa-IR")}
                </p>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {parent.children.map((child) => (
                    <ChildCard key={child.studentId} child={child} />
                  ))}
                </div>
              </>
            )}
          </DetailSection>

          {/* Professional Information */}
          <DetailSection title="اطلاعات حرفه‌ای" icon={GraduationCap}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <InfoItem
                label="شماره ملی"
                value={parent.nationalIdentificationNumber || "ثبت نشده"}
                icon={UserRound}
              />

            </div>

            <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                بیوگرافی
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-300">
                {parent.bio || "بیوگرافی ثبت نشده است."}
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