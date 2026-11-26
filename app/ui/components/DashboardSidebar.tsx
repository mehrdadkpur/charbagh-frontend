"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Music,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
  Image as ImageIcon,
  Video,
  Tags,
  History,
  UserCog,
  CreditCard,
  RefreshCw,
  CircleAlert,
  Music2,
} from "lucide-react";

type PermissionDto = {
  module?: string;
  action?: string;
  name?: string;
  code?: string;
};

type PermissionResponse =
  | PermissionDto[]
  | {
      permissions?: PermissionDto[];
      items?: PermissionDto[];
      data?:
        | PermissionDto[]
        | { permissions?: PermissionDto[] };
    };

type MenuItem = {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  module?: string;
  actions?: string[];
  alwaysVisible?: boolean;
};

type MenuGroup = {
  title: string;
  icon: typeof LayoutDashboard;
  items: MenuItem[];
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? ""
).replace(/\/+$/, "");

const MENU_GROUPS: MenuGroup[] = [
  {
    title: "نمای کلی",
    icon: LayoutDashboard,
    items: [
      {
        title: "داشبورد",
        href: "/dashboard",
        icon: LayoutDashboard,
        module: "Dashboard",
        actions: ["View", "Manage"],
      },
    ],
  },
  {
    title: "مدیریت کاربران",
    icon: Users,
    items: [
      {
        title: "کاربران",
        href: "/dashboard/users",
        icon: Users,
        module: "Users",
        actions: ["View", "Manage"],
      },
      {
        title: "مدرسان",
        href: "/dashboard/teachers",
        icon: GraduationCap,
        module: "Teachers",
        actions: ["View", "Manage"],
      },
      {
        title: "هنرجویان",
        href: "/dashboard/students",
        icon: Users,
        module: "Students",
        actions: ["View", "Manage"],
      },
      {
        title: "والدین",
        href: "/dashboard/parents",
        icon: Users,
        module: "Parents",
        actions: ["View", "Manage"],
      },
      {
        title: "کارکنان",
        href: "/dashboard/staffs",
        icon: UserCog,
        module: "Staffs",
        actions: ["View", "Manage"],
      },
      {
        title: "نقش‌ها",
        href: "/dashboard/roles",
        icon: Shield,
        module: "Roles",
        actions: ["View", "Manage"],
      },
      {
        title: "مجوزها",
        href: "/dashboard/permissions",
        icon: ShieldCheck,
        module: "Permissions",
        actions: ["View", "Manage"],
      },
      {
        title: "شعبه‌ها",
        href: "/dashboard/branches",
        icon: Building2,
        module: "Branches",
        actions: ["View", "Manage"],
      },
    ],
  },
  {
    title: "مدیریت آموزش",
    icon: BookOpen,
    items: [
      { title: "دسته‌بندی سازها", href: "/dashboard/instrument-categories", icon: Tags, module: "InstrumentCategories", actions: ["View", "Manage"] },
      { title: "سازهای موسیقی", href: "/dashboard/instruments", icon: Music, module: "Instruments", actions: ["View", "Manage"] },
      { title: "کتاب‌های آموزشی", href: "/dashboard/books", icon: BookOpen, module: "Books", actions: ["View", "Manage"] },
      { title: "تخصص سازهای مدرسان", href: "/dashboard/teacher-instruments", icon: GraduationCap, module: "TeacherInstruments", actions: ["View", "Manage"] },
      { title: "سرفصل‌های کتاب", href: "/dashboard/book-items", icon: FileText, module: "BookItems", actions: ["View", "Manage"] },
      { title: "کلاس‌های آموزشی", href: "/dashboard/classrooms", icon: Building2, module: "Classrooms", actions: ["View", "Manage"] },
      { title: "برنامه‌های آموزشی", href: "/dashboard/teaching-plans", icon: CalendarDays, module: "TeachingPlans", actions: ["View", "Manage"] },
      { title: "تخصیص‌های آموزشی", href: "/dashboard/lesson-assignments", icon: GraduationCap, module: "LessonAssignments", actions: ["View", "Manage"] },
      { title: "جلسات آموزشی", href: "/dashboard/lesson-sessions", icon: CalendarDays, module: "LessonSessions", actions: ["View", "Manage"] },
      { title: "محتوای جلسات", href: "/dashboard/lesson-contents", icon: FileText, module: "LessonContents", actions: ["View", "Manage"] },
      { title: "حضور و غیاب", href: "/dashboard/attendance", icon: ClipboardCheck, module: "Attendances", actions: ["View", "Manage"] },
      { title: "تکالیف تمرینی", href: "/dashboard/practice-assignments", icon: BookOpen, module: "PracticeAssignments", actions: ["View", "Manage"] },
      { title: "ارزیابی‌ها", href: "/dashboard/evaluations", icon: Activity, module: "Evaluations", actions: ["View", "Manage"] },
      { title: "خدمات آموزشی", href: "/dashboard/education-services", icon: Wrench, module: "EducationServices", actions: ["View", "Manage"] },
    ],
  },
  {
    title: "مدیریت مالی",
    icon: Wallet,
    items: [
      {
        title: "فاکتورها",
        href: "/dashboard/invoices",
        icon: FileText,
        module: "Invoices",
        actions: ["View", "Manage"],
      },
      {
        title: "گزارش‌های مالی",
        href: "/dashboard/financial-reports",
        icon: Activity,
        module: "Invoices",
        actions: ["View", "Manage"],
      },
      {
        title: "پرداخت‌ها",
        href: "/dashboard/payments",
        icon: CreditCard,
        module: "Payments",
        actions: ["View", "Manage"],
      },
      {
        title: "روش‌های پرداخت",
        href: "/dashboard/payment-methods",
        icon: CreditCard,
        module: "PaymentMethods",
        actions: ["View", "Manage"],
      },
      {
        title: "تراکنش‌ها",
        href: "/dashboard/transactions",
        icon: RefreshCw,
        module: "Transactions",
        actions: ["View", "Manage"],
      },
      {
        title: "انواع تخفیف",
        href: "/dashboard/discount-types",
        icon: Tags,
        module: "DiscountTypes",
        actions: ["View", "Manage"],
      },
      {
        title: "خدمات آموزشی",
        href: "/dashboard/education-services",
        icon: Wrench,
        module: "EducationServices",
        actions: ["View", "Manage"],
      },
      {
        title: "قیمت خدمات",
        href: "/dashboard/service-prices",
        icon: Wallet,
        module: "ServicePrices",
        actions: ["View", "Manage"],
      },
      {
        title: "تخفیف‌ها",
        href: "/dashboard/discounts",
        icon: Tags,
        module: "Discounts",
        actions: ["View", "Manage"],
      },
    ],
  },
  {
    title: "مدیریت محتوا",
    icon: FileText,
    items: [
      {
        title: "مقالات",
        href: "/dashboard/blogs",
        icon: FileText,
        module: "Blogs",
        actions: ["View", "Create", "Update", "Delete", "Approve"],
      },
      {
        title: "دسته‌بندی‌ها",
        href: "/dashboard/categories",
        icon: Tags,
        module: "Categories",
        actions: ["View", "Create", "Update"],
      },
      {
        title: "برچسب‌ها",
        href: "/dashboard/tags",
        icon: Tags,
        module: "Tags",
        actions: ["View", "Create", "Update"],
      },
      {
        title: "نظرات",
        href: "/dashboard/comments",
        icon: MessageSquare,
        module: "Comments",
        actions: ["View", "Create", "Update", "Approve"],
      },
      {
        title: "گالری‌ها",
        href: "/dashboard/galleries",
        icon: ImageIcon,
        module: "Galleries",
        actions: ["View", "Create", "Update", "Delete", "Approve"],
      },
      {
        title: "تصاویر",
        href: "/dashboard/galleries/photos",
        icon: ImageIcon,
        module: "GalleryItems",
        actions: ["View", "Create", "Update", "Delete"],
      },
      {
        title: "ویدئوها",
        href: "/dashboard/galleries/videos",
        icon: Video,
        module: "GalleryItems",
        actions: ["View", "Create", "Update", "Delete"],
      },
      {
        title: "راهنماها",
        href: "/dashboard/guidances",
        icon: BookOpen,
        module: "Guidances",
        actions: ["View", "Manage"],
      },
    ],
  },
  {
    title: "امنیت و گزارش‌ها",
    icon: ShieldCheck,
    items: [
      {
        title: "تاریخچه ورود",
        href: "/dashboard/login-histories",
        icon: History,
        module: "LoginHistories",
        actions: ["View", "Manage"],
      },
      {
        title: "گزارش‌های امنیتی",
        href: "/dashboard/security-audits",
        icon: ShieldCheck,
        module: "SecurityAudits",
        actions: ["View", "Manage"],
      },
    ],
  },
  {
    title: "تنظیمات حساب",
    icon: Settings,
    items: [
      {
        title: "بازیابی رمز عبور",
        href: "/dashboard/reset-password",
        icon: Settings,
        alwaysVisible: true,
      },
    ],
  },
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function extractPermissions(
  response: PermissionResponse,
): PermissionDto[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.permissions)) {
    return response.permissions;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    response.data &&
    !Array.isArray(response.data) &&
    Array.isArray(response.data.permissions)
  ) {
    return response.data.permissions;
  }

  return [];
}

function toPermissionKeys(
  permissions: PermissionDto[],
): Set<string> {
  const result = new Set<string>();

  for (const permission of permissions) {
    const module = permission.module;
    const action = permission.action;

    if (module && action) {
      result.add(
        `${normalize(module)}.${normalize(action)}`,
      );
      continue;
    }

    const value = permission.name ?? permission.code;

    if (value) {
      result.add(normalize(value));
    }
  }

  return result;
}

function hasPermission(
  permissionKeys: Set<string>,
  module: string,
  actions: string[],
): boolean {
  const normalizedModule = normalize(module);

  return actions.some((action) =>
    permissionKeys.has(
      `${normalizedModule}.${normalize(action)}`,
    ),
  );
}

function isItemActive(
  pathname: string,
  href: string,
): boolean {

  if (href === "/dashboard") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function getInitialOpenGroups(
  pathname: string,
): Set<string> {
  const result = new Set<string>(["نمای کلی"]);

  for (const group of MENU_GROUPS) {    
    if (
      group.items.some((item) =>
        isItemActive(pathname, item.href),
      )
    ) {
      result.add(group.title);
    }
  }

  return result;
}

function SidebarSkeleton() {
  return (
    <div
      className="space-y-5 px-3 py-5"
      aria-label="در حال بارگذاری منو"
    >
      {Array.from({ length: 5 }).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

          {Array.from({
            length: groupIndex === 1 ? 4 : 2,
          }).map((__, itemIndex) => (
            <div
              key={itemIndex}
              className="flex items-center gap-3 px-3 py-2"
            >
              <div className="size-8 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 w-28 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();

  const [permissionKeys, setPermissionKeys] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => getInitialOpenGroups(pathname),
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPermissions() {
      setLoading(true);
      setError(null);

      try {
        const accessToken =
          localStorage.getItem("accessToken");
        const branchId =
          localStorage.getItem("currentBranchId");

        if (!accessToken) {
          throw new Error(
            "توکن ورود پیدا نشد. لطفاً دوباره وارد شوید.",
          );
        }

        if (!branchId) {
          throw new Error(
            "ابتدا شعبه فعال را انتخاب کنید.",
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/api/Permissions/current`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Branch-Id": branchId,
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );        

        if (!response.ok) {
          throw new Error(
            `دریافت مجوزها ناموفق بود. کد پاسخ: ${response.status}`,
          );
        }

        const body =(await response.json()) as PermissionResponse;
        const permissions = extractPermissions(body);        

        if (!cancelled) {
          setPermissionKeys(
            toPermissionKeys(permissions),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "دریافت مجوزهای کاربر ناموفق بود.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPermissions();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // با تغییر صفحه، گروه مربوط به مسیر فعال باز می‌شود.
  useEffect(() => {
    const activeGroup = MENU_GROUPS.find((group) =>
      group.items.some((item) =>
        isItemActive(pathname, item.href),
      ),
    );

    if (!activeGroup) return;

    setOpenGroups((current) => {
      if (current.has(activeGroup.title)) {
        return current;
      }

      const next = new Set(current);
      next.add(activeGroup.title);
      return next;
    });
  }, [pathname]);

  const visibleGroups = useMemo(
    () =>
      MENU_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (item.alwaysVisible) return true;

          if (!item.module || !item.actions) {
            return false;
          }

          return hasPermission(
            permissionKeys,
            item.module,
            item.actions,
          );
        }),
      })).filter((group) => group.items.length > 0),
    [permissionKeys],
  );

  const toggleGroup = useCallback(
    (groupTitle: string) => {
      setOpenGroups((current) => {
        const next = new Set(current);

        if (next.has(groupTitle)) {
          next.delete(groupTitle);
        } else {
          next.add(groupTitle);
        }

        return next;
      });
    },
    [],
  );

  return (
    <aside
      dir="rtl"
      aria-label="منوی اصلی مدیریت"
      className="
        flex h-full w-72 shrink-0 flex-col overflow-hidden
        border-l border-gray-200/80 bg-white
        shadow-sm
        dark:border-gray-800 dark:bg-gray-950
      "
    >
      {/* Brand */}
      <div className="shrink-0 border-b border-gray-200/80 p-4 dark:border-gray-800">
        <Link
          href="/dashboard"
          className="
            group flex items-center gap-3 rounded-2xl p-2
            transition-colors hover:bg-gray-50
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-elf/50
            dark:hover:bg-gray-900
          "
        >
          <span
            className="
              flex size-12 shrink-0 items-center justify-center
              rounded-2xl bg-elf text-white
              shadow-lg shadow-elf/20
              transition-transform duration-200
              group-hover:scale-105
            "
          >
            <Music2 size={25} strokeWidth={2.2} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
              چار باغ
            </span>
            <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
              پنل مدیریت آموزشگاه
            </span>
          </span>
        </Link>

        <div
          className="
            mt-4 flex items-center gap-2 rounded-xl
            border border-elf/15 bg-elf/5 px-3 py-2.5
            dark:border-elf/20 dark:bg-elf/10
          "
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-elf/10 text-elf dark:bg-elf/20">
            <LayoutDashboard size={15} />
          </span>

          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            فضای مدیریت
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="بخش‌های داشبورد"
        aria-busy={loading}
        className="
          min-h-0 flex-1 overflow-y-auto overscroll-contain
          px-3 py-4
          [scrollbar-color:var(--color-gray-300)_transparent]
          [scrollbar-width:thin]
          dark:[scrollbar-color:var(--color-gray-700)_transparent]
        "
      >
        {loading ? (
          <SidebarSkeleton />
        ) : error ? (
          <div
            role="alert"
            className="
              mx-1 rounded-2xl border border-red-200
              bg-red-50 p-4
              dark:border-red-900/60 dark:bg-red-950/30
            "
          >
            <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
              <CircleAlert size={20} />
            </span>

            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              دریافت مجوزها ناموفق بود
            </p>

            <p className="mt-2 wrap-break-word text-xs leading-6 text-red-700 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setReloadKey((current) => current + 1)
              }
              className="
                mt-4 inline-flex w-full items-center
                justify-center gap-2 rounded-xl
                bg-red-600 px-3 py-2.5 text-sm
                font-semibold text-white
                transition-colors hover:bg-red-700
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-red-500 focus-visible:ring-offset-2
                dark:focus-visible:ring-offset-gray-950
              "
            >
              <RefreshCw size={15} />
              تلاش مجدد
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="px-3 text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500">
              منوی اصلی
            </p>

            {visibleGroups.map((group) => {
              const GroupIcon = group.icon;
              const isOpen = openGroups.has(group.title);
              const activeItemExists = group.items.some(
                (item) =>
                  isItemActive(pathname, item.href),
              );

              return (
                <section
                  key={group.title}
                  className="space-y-1"
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.title)}
                    aria-expanded={isOpen}
                    className={`
                      group flex w-full items-center gap-3
                      rounded-xl px-3 py-3 text-right
                      transition-colors duration-150
                      focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-elf/50
                      ${
                        activeItemExists
                          ? "text-elf dark:text-elf"
                          : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex size-9 shrink-0 items-center
                        justify-center rounded-xl transition-colors
                        ${
                          activeItemExists
                            ? "bg-elf/10 text-elf dark:bg-elf/15"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200/70 dark:bg-gray-900 dark:text-gray-400 dark:group-hover:bg-gray-800"
                        }
                      `}
                    >
                      <GroupIcon size={18} strokeWidth={1.9} />
                    </span>

                    <span className="min-w-0 flex-1 text-sm font-semibold">
                      {group.title}
                    </span>

                    <span
                      className="
                        flex size-6 shrink-0 items-center
                        justify-center rounded-md
                        text-gray-400 transition-colors
                        group-hover:text-gray-600
                        dark:text-gray-500 dark:group-hover:text-gray-300
                      "
                    >
                      <ChevronDown
                        size={16}
                        className={`
                          transition-transform duration-200
                          ${isOpen ? "rotate-180" : ""}
                        `}
                      />
                    </span>
                  </button>

                  <div
                    className={`
                      grid transition-[grid-template-rows,opacity]
                      duration-200 ease-in-out
                      ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-70"
                      }
                    `}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <ul className="relative mr-[29px] space-y-1 border-r border-gray-200 pr-3 pt-1 dark:border-gray-800">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = isItemActive(
                            pathname,
                            item.href,
                          );

                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                aria-current={
                                  isActive ? "page" : undefined
                                }
                                className={`
                                  group/item relative flex
                                  min-h-10 items-center gap-3
                                  rounded-xl px-3 py-2.5
                                  text-sm transition-all duration-150
                                  focus-visible:outline-none
                                  focus-visible:ring-2
                                  focus-visible:ring-elf/50
                                  ${
                                    isActive
                                      ? "bg-elf/10 font-semibold text-elf dark:bg-elf/15 dark:text-elf"
                                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                                  }
                                `}
                              >
                                {isActive && (
                                  <span
                                    aria-hidden="true"
                                    className="
                                      absolute -right-[17px] top-1/2
                                      h-6 w-[3px] -translate-y-1/2
                                      rounded-l-full bg-elf
                                    "
                                  />
                                )}

                                <ItemIcon
                                  size={17}
                                  strokeWidth={isActive ? 2.2 : 1.8}
                                  className={`
                                    shrink-0 transition-colors
                                    ${
                                      isActive
                                        ? "text-elf"
                                        : "text-gray-400 group-hover/item:text-gray-700 dark:text-gray-500 dark:group-hover/item:text-gray-300"
                                    }
                                  `}
                                />

                                <span className="min-w-0 flex-1 truncate">
                                  {item.title}
                                </span>

                                {isActive && (
                                  <span
                                    aria-hidden="true"
                                    className="size-1.5 shrink-0 rounded-full bg-elf"
                                  />
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-200/80 p-4 dark:border-gray-800">
        <div
          className="
            flex items-center gap-3 rounded-2xl
            bg-gray-50 px-3 py-3
            dark:bg-gray-900/70
          "
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-elf/10 text-elf dark:bg-elf/15">
            <ShieldCheck size={18} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-700 dark:text-gray-200">
              چار باغ
            </p>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              سامانه مدیریت آموزشگاه
            </p>
          </div>

          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-full bg-elf"
          />
        </div>
      </div>
    </aside>
  );
}
