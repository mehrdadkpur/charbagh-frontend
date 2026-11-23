
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  AlertCircle,
  ArrowDownWideNarrow,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  MoreVertical,
  Eye,
  Pencil,
  PauseCircle,
  Ban,
  CheckCircle,
  RotateCcw,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
  UserX,
  X,
} from "lucide-react";

import { IUser } from "@/lib/types";
import { fetchUsers } from "@/lib/requests";
import { ApiError } from "@/helper/ApiError";

import UserAvatar from "@/app/ui/components/UserAvatar";
import UserStatusBadge from "@/app/ui/components/UserStatusBadge";
import UsersPagination from "@/app/ui/components/UsersPagination";
import { apiFetch } from "@/lib/apiFetch";
import { API_BASE_URL } from "@/lib/config";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "all", label: "همه وضعیت‌ها" },
  { value: "1", label: "فعال" },
  { value: "3", label: "غیرفعال" },
  { value: "0", label: "در انتظار تأیید" },
  { value: "2", label: "معلق" },
];

function getUserRole(user: IUser): string {
  return (
    user.roles?.[0]?.role_description ||
    user.roles?.[0]?.role_name ||
    "بدون نقش"
  );
}

function getUserStatusLabel(status: number): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === String(status))
      ?.label ?? "نامشخص"
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatNumber(value: number): string {
  return value.toLocaleString("fa-IR");
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  accent = false,
}: {
  title: string;
  value: number;
  icon: typeof UsersRound;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm shadow-gray-950/2 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {formatNumber(value)}
          </p>
        </div>

        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
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

type UserActionKey = "activate" | "suspend" | "block" | "unblock";

type UserActionOption = {
  key: UserActionKey;
  label: string;
  icon: typeof CheckCircle;
  className: string;
};

const USER_STATUS = {
  Pending: 0,
  Active: 1,
  Suspended: 2,
  Blocked: 3,
} as const;

function getAvailableUserActions(status: number): UserActionOption[] {
  switch (status) {
    case USER_STATUS.Pending:
      return [
        {
          key: "activate",
          label: "فعال‌سازی کاربر",
          icon: CheckCircle,
          className:
            "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30",
        },
        {
          key: "block",
          label: "غیرفعال کردن کاربر",
          icon: Ban,
          className:
            "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
        },
      ];

    case USER_STATUS.Active:
      return [
        {
          key: "suspend",
          label: "تعلیق کاربر",
          icon: PauseCircle,
          className:
            "text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
        },
        {
          key: "block",
          label: "غیرفعال کردن کاربر",
          icon: Ban,
          className:
            "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
        },
      ];

    case USER_STATUS.Suspended:
      return [
        {
          key: "activate",
          label: "فعال‌سازی کاربر",
          icon: CheckCircle,
          className:
            "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30",
        },
        {
          key: "block",
          label: "غیرفعال کردن کاربر",
          icon: Ban,
          className:
            "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
        },
      ];

    case USER_STATUS.Blocked:
      return [
        {
          key: "unblock",
          label: "رفع غیرفعالی",
          icon: RotateCcw,
          className:
            "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30",
        },
      ];

    default:
      return [];
  }
}

function UserActions({
  userId,
  status,
  onAction,
  disabled,
}: {
  userId: string;
  status: number;
  onAction: (userId: string, action: UserActionKey) => void;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const actions = getAvailableUserActions(status);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/dashboard/users/${userId}`}
        title="مشاهده کاربر"
        aria-label="مشاهده کاربر"
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm font-medium text-gray-700 transition-colors hover:border-elf/30 hover:bg-elf/5 hover:text-elf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elf/40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-elf/10 dark:hover:text-emerald-300"
      >
        <Eye size={16} />
        <span>مشاهده</span>
      </Link>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          title="سایر عملیات"
          aria-label="سایر عملیات کاربر"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          disabled={disabled}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex size-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <MoreVertical size={18} />
        </button>

        {isOpen && (
          <div
            role="menu"
            className="absolute left-0 top-full z-50 mt-2 min-w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-900"
          >
            <Link
              href={`/dashboard/users/${userId}/edit`}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-right text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Pencil size={16} />
              ویرایش کاربر
            </Link>

            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.key}
                  type="button"
                  role="menuitem"
                  disabled={disabled}
                  onClick={() => {
                    setIsOpen(false);
                    onAction(userId, action.key);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-right text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${action.className}`}
                >
                  <Icon size={16} />
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  onAction,
  busy,
}: {
  user: IUser;
  onAction: (userId: string, action: UserActionKey) => void;
  busy: boolean;
}) {
  return (
    <tr className="group border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/80 dark:border-gray-800 dark:hover:bg-gray-800/40">
      <td className="px-4 py-4">
        <div className="flex min-w-52 items-center gap-3">
          <UserAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            imageUrl={user.profileImageUrl}
          />

          <div className="min-w-0">
            <Link
              href={`/dashboard/users/${user.id}`}
              className="block truncate font-semibold text-gray-900 transition-colors hover:text-elf dark:text-white dark:hover:text-emerald-300"
            >
              {user.firstName} {user.lastName}
            </Link>

            <p className="mt-1 max-w-56 truncate text-xs text-gray-500 dark:text-gray-400">
              {user.email || "ایمیل ثبت نشده"}
            </p>

            <span className="mt-1.5 inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {/* {getUserRole(user)} */}
            </span>
          </div>
        </div>
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
        {user.nationalIdentificationNumber || "—"}
      </td>

      <td className="px-4 py-4">
        <UserStatusBadge status={user.status} />
      </td>

      <td dir="ltr" className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-600 dark:text-gray-300">
        {user.mobile || "—"}
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
        {formatDate(user.createdAt)}
      </td>

      <td className="px-4 py-4">
        <UserActions
          status={user.status}
          userId={user.id}
          onAction={onAction}
          disabled={busy}
        />
      </td>
    </tr>
  );
}

function UserMobileCard({
  user,
  onAction,
  busy,
}: {
  user: IUser;
  onAction: (userId: string, action: UserActionKey) => void;
  busy: boolean;
}) {
  return (
    <article className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <UserAvatar
          firstName={user.firstName}
          lastName={user.lastName}
          imageUrl={user.profileImageUrl}
          size="lg"
        />

        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/users/${user.id}`}
            className="block truncate font-semibold text-gray-900 hover:text-elf dark:text-white dark:hover:text-emerald-300"
          >
            {user.firstName} {user.lastName}
          </Link>

          <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
            {user.email || "ایمیل ثبت نشده"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <UserStatusBadge status={user.status} />
            <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {/* {getUserRole(user)} */}
            </span>
          </div>
        </div>
      </div>

      <div className="my-4 grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-800/60">
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500 dark:text-gray-400">موبایل</span>
          <span dir="ltr" className="text-left text-gray-800 dark:text-gray-200">
            {user.mobile || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500 dark:text-gray-400">کد ملی</span>
          <span className="text-gray-800 dark:text-gray-200">
            {user.nationalIdentificationNumber || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500 dark:text-gray-400">تاریخ ثبت</span>
          <span className="text-gray-800 dark:text-gray-200">
            {formatDate(user.createdAt)}
          </span>
        </div>
      </div>

      <UserActions
        status={user.status}
        userId={user.id}
        onAction={onAction}
        disabled={busy}
      />
    </article>
  );
}

function UserSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800"
        >
          <div className="size-11 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-48 max-w-full rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="hidden h-8 w-24 rounded-xl bg-gray-200 dark:bg-gray-800 sm:block" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  searching,
  onReset,
}: {
  searching: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        {searching ? <Search size={25} /> : <UsersRound size={25} />}
      </div>

      <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
        {searching ? "نتیجه‌ای پیدا نشد" : "هنوز کاربری ثبت نشده است"}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
        {searching
          ? "عبارت جست‌وجو یا فیلترهای انتخاب‌شده را تغییر بده."
          : "برای شروع، اولین کاربر را به سیستم اضافه کن."}
      </p>

      {searching && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-elf transition-colors hover:bg-elf/5 dark:text-emerald-300 dark:hover:bg-elf/10"
        >
          <X size={16} />
          پاک کردن فیلترها
        </button>
      )}

      {!searching && (
        <Link
          href="/dashboard/users/add"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-elf/90"
        >
          <Plus size={17} />
          افزودن کاربر
        </Link>
      )}
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchUsers();
      setUsers(data);
      
    } catch (error) {
      console.error("Error loading users:", error);

      setError(
        error instanceof ApiError && error.status === 401
          ? "نشست شما منقضی شده یا دسترسی معتبر ندارید. دوباره وارد شوید."
          : error instanceof Error
            ? error.message
            : "دریافت فهرست کاربران با خطا مواجه شد."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const roles = useMemo(() => {
    return Array.from(
      new Set(
        users
          .map(getUserRole)
          .filter((role) => role && role !== "بدون نقش")
      )
    ).sort((a, b) => a.localeCompare(b, "fa"));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fa");

    return users.filter((user) => {
      const matchesRole =
        selectedRole === "all" || getUserRole(user) === selectedRole;

      const matchesStatus =
        selectedStatus === "all" ||
        user.status === Number(selectedStatus);

      const searchableFields = [
        user.firstName,
        user.lastName,
        user.email,
        user.mobile,
        user.nationalIdentificationNumber,
        getUserRole(user),
      ];

      const matchesQuery =
        !normalizedQuery ||
        searchableFields.some((field) =>
          String(field ?? "")
            .toLocaleLowerCase("fa")
            .includes(normalizedQuery)
        );

      return matchesRole && matchesStatus && matchesQuery;
    });
  }, [users, query, selectedRole, selectedStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const activeCount = users.filter((user) => user.status === 1).length;
  const pendingCount = users.filter((user) => user.status === 0).length;
  const suspendedCount = users.filter(
    (user) => user.status === 2 || user.status === 3
  ).length;

  const resetFilters = () => {
    setQuery("");
    setSelectedRole("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const handleUserAction = async (
    userId: string,
    action: UserActionKey
  ) => {
    const user = users.find((item) => item.id === userId);
    if (!user || busyUserId) return;

    const actionConfig: Record<
      UserActionKey,
      { title: string; confirmText: string; confirmButtonText: string; successText: string }
    > = {
      activate: {
        title: "فعال‌سازی کاربر؟",
        confirmText: `آیا از فعال‌سازی ${user.firstName} ${user.lastName} مطمئن هستی؟`,
        confirmButtonText: "بله، فعال کن",
        successText: "کاربر با موفقیت فعال شد.",
      },
      suspend: {
        title: "تعلیق کاربر؟",
        confirmText: `آیا از تعلیق ${user.firstName} ${user.lastName} مطمئن هستی؟`,
        confirmButtonText: "بله، تعلیق کن",
        successText: "کاربر با موفقیت تعلیق شد.",
      },
      block: {
        title: "غیرفعال کردن کاربر؟",
        confirmText: `آیا از غیرفعال کردن ${user.firstName} ${user.lastName} مطمئن هستی؟`,
        confirmButtonText: "بله، غیرفعال کن",
        successText: "کاربر با موفقیت غیرفعال شد.",
      },
      unblock: {
        title: "فعال‌سازی مجدد کاربر؟",
        confirmText: `آیا از فعال‌سازی مجدد ${user.firstName} ${user.lastName} مطمئن هستی؟`,
        confirmButtonText: "بله، فعال کن",
        successText: "کاربر با موفقیت فعال شد.",
      },
    };

    const config = actionConfig[action];
    const result = await Swal.fire({
      title: config.title,
      text: config.confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: config.confirmButtonText,
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

    setBusyUserId(userId);

    try {
      const token = localStorage.getItem("accessToken");
      const branchId = localStorage.getItem("currentBranchId");

      const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(branchId ? { "X-Branch-Id": branchId } : {}),
      };

      await apiFetch<void>(`/api/users/${userId}/${action}`, {
        method: "PATCH",
        headers,
      });
      await Swal.fire({
        title: "انجام شد",
        text: config.successText,
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

      await loadUsers();
    } catch (error) {
      console.error(`User action failed: ${action}`, error);

      await Swal.fire({
        title: "عملیات ناموفق بود",
        text:
          error instanceof ApiError && error.status === 401
            ? "نشست شما منقضی شده است. دوباره وارد شوید."
            : error instanceof Error
              ? error.message
              : "در اجرای عملیات کاربر خطایی رخ داد.",
        icon: "error",
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
    } finally {
      setBusyUserId(null);
    }
  };

  const hasActiveFilters =
    query.trim() !== "" ||
    selectedRole !== "all" ||
    selectedStatus !== "all";

  return (
    <section
      dir="rtl"
      className="mx-auto w-full max-w-[1600px] space-y-6 px-3 pb-8 sm:px-5 lg:px-8"
    >
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-elf dark:hover:text-emerald-300"
            >
              داشبورد
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-200">
              کاربران
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-elf/10 text-elf dark:text-emerald-300">
              <UsersRound size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                مدیریت کاربران
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                مدیریت اطلاعات، وضعیت و دسترسی کاربران
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/users/add"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-elf/20 transition-all hover:bg-elf/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elf/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
        >
          <Plus size={18} />
          افزودن کاربر
        </Link>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="کل کاربران"
          value={users.length}
          icon={UsersRound}
          description="تعداد کاربران ثبت‌شده"
          accent
        />
        <SummaryCard
          title="کاربران فعال"
          value={activeCount}
          icon={CheckCircle2}
          description="کاربرانی با وضعیت فعال"
        />
        <SummaryCard
          title="در انتظار تأیید"
          value={pendingCount}
          icon={ShieldCheck}
          description="کاربرانی که تأیید نشده‌اند"
        />
        <SummaryCard
          title="معلق یا غیرفعال"
          value={suspendedCount}
          icon={UserX}
          description="کاربرانی که وضعیت فعال ندارند"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm shadow-gray-950/2 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="users-search"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              جست‌وجو
            </label>

            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="users-search"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="نام، نام خانوادگی، ایمیل، موبایل یا کد ملی..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pr-10 pl-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-elf focus:ring-4 focus:ring-elf/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-elf"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCurrentPage(1);
                  }}
                  aria-label="پاک کردن جست‌وجو"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[420px]">
            <div>
              <label
                htmlFor="users-status"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                وضعیت
              </label>

              <div className="relative">
                <select
                  id="users-status"
                  value={selectedStatus}
                  onChange={(event) => {
                    setSelectedStatus(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pl-9 text-sm text-gray-800 outline-none transition focus:border-elf focus:ring-4 focus:ring-elf/10 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
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

            <div>
              <label
                htmlFor="users-role"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                نقش کاربر
              </label>

              <div className="relative">
                <select
                  id="users-role"
                  value={selectedRole}
                  onChange={(event) => {
                    setSelectedRole(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pl-9 text-sm text-gray-800 outline-none transition focus:border-elf focus:ring-4 focus:ring-elf/10 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                >
                  <option value="all">همه نقش‌ها</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
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
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {loading
              ? "در حال دریافت اطلاعات..."
              : `${formatNumber(filteredUsers.length)} نتیجه از ${formatNumber(users.length)} کاربر`}
          </p>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <X size={14} />
                پاک کردن فیلترها
              </button>
            )}

            <button
              type="button"
              onClick={() => void loadUsers()}
              disabled={loading}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-600 transition-colors hover:border-elf/30 hover:bg-elf/5 hover:text-elf disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-elf/10 dark:hover:text-emerald-300"
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

      {/* Data */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-gray-950/2 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2">
            <ArrowDownWideNarrow
              size={18}
              className="text-elf dark:text-emerald-300"
            />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              فهرست کاربران
            </h2>
          </div>

          {!loading && !error && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              صفحه {formatNumber(currentPage)} از {formatNumber(totalPages)}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-4 sm:p-5">
            <UserSkeleton />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-300">
              <AlertCircle size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
              دریافت کاربران ناموفق بود
            </h3>

            <p className="mt-2 max-w-lg wrap-break-word text-sm leading-6 text-gray-500 dark:text-gray-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadUsers()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-elf/90"
            >
              <RefreshCw size={16} />
              تلاش مجدد
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            searching={hasActiveFilters}
            onReset={resetFilters}
          />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 p-3 md:hidden">
              {paginatedUsers.map((user) => (
                <UserMobileCard
                  key={user.id}
                  user={user}
                  onAction={handleUserAction}
                  busy={busyUserId === user.id}
                />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[950px] text-right text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-4 py-4">
                      کاربر
                    </th>
                    <th scope="col" className="px-4 py-4">
                      کد ملی
                    </th>
                    <th scope="col" className="px-4 py-4">
                      وضعیت
                    </th>
                    <th scope="col" className="px-4 py-4">
                      موبایل
                    </th>
                    <th scope="col" className="px-4 py-4">
                      تاریخ ثبت
                    </th>
                    <th scope="col" className="px-4 py-4 text-left">
                      عملیات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onAction={handleUserAction}
                      busy={busyUserId === user.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <UsersPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {busyUserId && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          <LoaderCircle size={17} className="animate-spin text-elf" />
          در حال اجرای عملیات...
        </div>
      )}
    </section>
  );
}

