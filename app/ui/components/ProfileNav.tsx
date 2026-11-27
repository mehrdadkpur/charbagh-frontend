
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  CircleUserRound,
  LogIn,
  LogOut,
  LoaderCircle,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Notifications from "./Notifications";
import Theme from "./Theme";
import { useClickOutside } from "@/app/Hooks/useClickOutside";
import { IUser } from "@/lib/types";
import { API_BASE_URL } from "@/lib/config";

function clearAuthentication() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("currentBranchId");
}

function getDisplayName(user: IUser): string {
  const fullName = user.fullName?.trim();

  if (fullName) {
    return fullName;
  }

  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "کاربر";
}

export default function ProfileNav() {
  const router = useRouter();

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false));

  useEffect(() => {
    let cancelled = false;

    async function fetchUserData() {
      const token =
        localStorage.getItem("accessToken") ??
        localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        if (response.status === 401) {
          clearAuthentication();

          if (!cancelled) {
            setUser(null);
            router.replace("/login");
          }

          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch current user");
        }

        const data: IUser = await response.json();

        if (!cancelled) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        }
      } catch {
        if (!cancelled) {
          toast.error("دریافت اطلاعات کاربر ناموفق بود.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchUserData();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken =
      localStorage.getItem("accessToken") ??
      localStorage.getItem("token");

    try {
      if (refreshToken && accessToken) {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/logout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refreshToken }),
          },
        );

        if (!response.ok && response.status !== 401) {
          toast.error(
            "خروج در سرور کامل نشد؛ اطلاعات محلی پاک می‌شود.",
          );
        }
      }
    } catch {
      toast.error(
        "ارتباط با سرور برقرار نشد؛ خروج محلی انجام می‌شود.",
      );
    } finally {
      clearAuthentication();

      setUser(null);
      setIsOpen(false);
      setLoggingOut(false);

      router.replace("/");
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div
        className="flex items-center gap-3"
        aria-label="در حال دریافت اطلاعات کاربر"
      >
        <div className="size-9 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="hidden space-y-2 sm:block">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-2.5 w-14 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        dir="rtl"
        className="
          flex items-center gap-2 rounded-2xl
          border border-gray-200 bg-white p-1.5
          shadow-sm
          dark:border-gray-800 dark:bg-gray-950
        "
      >
        <Link
          href="/login"
          className="
            inline-flex min-h-10 items-center gap-2
            rounded-xl bg-elf px-4 py-2
            text-sm font-semibold text-white
            transition-colors hover:bg-elf/90
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-elf/50 focus-visible:ring-offset-2
            dark:focus-visible:ring-offset-gray-950
          "
        >
          <LogIn size={17} />
          <span>ورود</span>
        </Link>

        <div className="flex size-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900">
          <Theme />
        </div>
      </div>
    );
  }

  const displayName = getDisplayName(user);
  const profileImageUrl = user.profileImageUrl?.trim();

  const showProfileImage =
    Boolean(profileImageUrl) && !imageFailed;

  return (
    <div
      dir="rtl"
      className="
        relative z-50 flex items-center gap-2
        rounded-2xl border border-gray-200/80
        bg-white p-1.5 shadow-sm
        dark:border-gray-800 dark:bg-gray-950
      "
    >
      {/* Profile menu */}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label="منوی کاربر"
          className="
            group flex min-h-10 items-center gap-2
            rounded-xl px-2 py-1.5
            transition-colors hover:bg-gray-50
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-elf/50
            dark:hover:bg-gray-900
          "
        >
          <span
            className="
              relative flex size-9 shrink-0 items-center
              justify-center overflow-hidden rounded-xl
              bg-elf/10 text-elf ring-1 ring-elf/15
              dark:bg-elf/15
            "
          >
            {showProfileImage ? (
              <Image
                width={36}
                height={36}
                src={profileImageUrl!}
                alt={displayName}
                unoptimized
                onError={() => setImageFailed(true)}
                className="size-full object-cover"
              />
            ) : (
              <CircleUserRound size={23} strokeWidth={1.8} />
            )}
          </span>

          <span className="hidden min-w-0 text-right sm:block sm:max-w-32 lg:max-w-40">
            <span className="block truncate text-sm font-bold text-gray-800 dark:text-gray-100">
              {displayName}
            </span>
            <span className="mt-0.5 block text-[11px] text-gray-500 dark:text-gray-400">
              حساب کاربری
            </span>
          </span>

          <ChevronDown
            size={15}
            className={`
              hidden shrink-0 text-gray-400
              transition-transform duration-200 sm:block
              ${isOpen ? "rotate-180" : ""}
            `}
          />
        </button>

        {isOpen && (
          <div
            role="menu"
            aria-label="گزینه‌های حساب کاربری"
            className="
              absolute left-0 top-full mt-3 w-64
              overflow-hidden rounded-2xl
              border border-gray-200 bg-white
              shadow-xl shadow-gray-900/10
              ring-1 ring-black/2
              dark:border-gray-800 dark:bg-gray-950
              dark:shadow-black/30
            "
          >
            {/* User summary */}
            <div className="border-b border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/60">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-elf/10 text-elf dark:bg-elf/15">
                  {showProfileImage ? (
                    <Image
                      width={44}
                      height={44}
                      src={profileImageUrl!}
                      alt={displayName}
                      unoptimized
                      onError={() => setImageFailed(true)}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound size={24} />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    حساب کاربری چار باغ
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="size-1.5 rounded-full bg-elf" />
                حساب شما فعال است
              </div>
            </div>

            {/* Menu options */}
            <div className="space-y-1 p-2">
              <Link
                href="/dashboard"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="
                  group flex min-h-11 items-center gap-3
                  rounded-xl px-3 py-2.5 text-sm
                  text-gray-700 transition-colors
                  hover:bg-elf/5 hover:text-elf
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-elf/50
                  dark:text-gray-200 dark:hover:bg-elf/10
                  dark:hover:text-elf
                "
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-elf/10 group-hover:text-elf dark:bg-gray-900 dark:text-gray-400 dark:group-hover:bg-elf/15">
                  <UserRound size={17} />
                </span>
                <span className="flex-1 font-medium">
                 داشبورد شما
                </span>
              </Link>

              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={loggingOut}
                className="
                  group flex min-h-11 w-full items-center
                  gap-3 rounded-xl px-3 py-2.5
                  text-sm text-red-600 transition-colors
                  hover:bg-red-50
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-red-500/50
                  disabled:cursor-not-allowed disabled:opacity-60
                  dark:text-red-400 dark:hover:bg-red-950/30
                "
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  {loggingOut ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <LogOut size={17} />
                  )}
                </span>

                <span className="flex-1 text-right font-medium">
                  {loggingOut
                    ? "در حال خروج..."
                    : "خروج از حساب"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900">
        <Notifications />
      </div>

      {/* Theme */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900">
        <Theme />
      </div>
    </div>
  );
}
