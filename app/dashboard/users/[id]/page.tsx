"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Edit3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  CreditCard,
  FileText,
  Info,
  AlertCircle,
  RefreshCw,
  Hash,
} from "lucide-react";

import { fetchUser } from "@/lib/requests";
import { IUser } from "@/lib/types";
import Loading from "@/app/loading";
import StatusBadge from "@/app/ui/components/UserStatusBadge";
import { getUserGender } from "@/helper/UserGender";
import { ShamsiDate } from "@/lib/shamsiDate";

const EMPTY_VALUE = "ثبت نشده است";

const ViewUser = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!id) {
      setUser(null);
      setError("شناسه کاربر معتبر نیست.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadUser = async () => {
      setLoading(true);
      setError(null);
      setUser(null);
      setImageError(false);

      try {
        const data = await fetchUser(id);

        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);

        if (!cancelled) {
          setError("دریافت اطلاعات کاربر با خطا مواجه شد.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error || !user) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[60vh] items-center justify-center px-4 py-10"
      >
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle size={28} />
          </div>

          <h2 className="text-lg font-DanaDemiBold text-gray-900 dark:text-white">
            {error ? "خطا در دریافت اطلاعات" : "کاربر پیدا نشد"}
          </h2>

          <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
            {error ?? "کاربر موردنظر پیدا نشد یا دیگر در دسترس نیست."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {error && id && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setUser(null);
                  // با تغییر state، useEffect دوباره اجرا نمی‌شود؛
                  // برای تلاش مجدد باید شناسه یا trigger تغییر کند.
                }}
                className="hidden"
              >
                <RefreshCw size={16} />
              </button>
            )}

            <Link
              href="/dashboard/users"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-DanaMedium text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
            >
              <ArrowRight size={17} />
              بازگشت به فهرست کاربران
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    "کاربر بدون نام";

  const profileImage =
    !imageError && user.profileImageUrl
      ? user.profileImageUrl
      : "/images/avatar.png";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Page Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link
                href="/dashboard/users"
                className="transition hover:text-elf-700 dark:hover:text-elf-900"
              >
                کاربران
              </Link>
              <span>/</span>
              <span className="text-gray-700 dark:text-gray-200">
                مشخصات کاربر
              </span>
            </div>

            <h1 className="font-MorabbaMedium text-2xl text-gray-900 dark:text-white sm:text-3xl">
              مشخصات کاربر
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              اطلاعات شخصی و وضعیت حساب کاربری را مشاهده کنید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/users"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-DanaMedium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <ArrowRight size={17} />
              بازگشت
            </Link>

            <Link
              href={`/dashboard/users/${user.id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-DanaMedium text-white shadow-sm transition hover:bg-elf-900"
            >
              <Edit3 size={17} />
              ویرایش کاربر
            </Link>
          </div>
        </header>

        {/* Profile Card */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="h-28 bg-linear-to-l from-elf-900 via-elf-700 to-elf-300 sm:h-36" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-14 flex flex-col items-center gap-4 sm:-mt-16 sm:flex-row sm:items-end">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-md dark:border-gray-900 dark:bg-gray-800 sm:h-32 sm:w-32">
                <Image
                  src={profileImage}
                  alt={`تصویر ${fullName}`}
                  fill
                  sizes="128px"
                  priority
                  onError={() => setImageError(true)}
                  className="object-cover"
                />
              </div>

              <div className="flex-1 pb-1 text-center sm:text-right">
                <h2 className="text-xl font-DanaDemiBold text-gray-900 dark:text-white sm:text-2xl">
                  {fullName}
                </h2>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5" dir="ltr">
                    <Phone size={15} />
                    {user.mobile || EMPTY_VALUE}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={15} />
                    <span dir="ltr">
                      {user.email || EMPTY_VALUE}
                    </span>
                  </span>
                </div>
              </div>

              <div className="pb-1">
                <StatusBadge status={user.status} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:grid-cols-3">
              <SummaryItem
                icon={<ShieldCheck size={18} />}
                label="وضعیت حساب"
                value={<StatusBadge status={user.status} />}
              />

              <SummaryItem
                icon={<CalendarDays size={18} />}
                label="تاریخ ثبت‌نام"
                value={formatDate(user.createdAt)}
              />

              <SummaryItem
                icon={<Hash size={18} />}
                label="شناسه کاربر"
                value={user.id}
                ltr
              />
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <InfoSection
          title="اطلاعات شخصی"
          description="مشخصات هویتی و اطلاعات تماس کاربر"
          icon={<UserRound size={20} />}
        >
          <InfoRow
            icon={<UserRound size={17} />}
            label="نام"
            value={user.firstName}
          />

          <InfoRow
            icon={<UserRound size={17} />}
            label="نام خانوادگی"
            value={user.lastName}
          />

            <InfoRow
            icon={<CreditCard size={17} />}
            label="ملیت"
            value={user.nationality.persianCountryName}
            ltr
          />

          <InfoRow
            icon={<CreditCard size={17} />}
            label="شماره ملی"
            value={user.nationalIdentificationNumber}
            ltr
          />

          <InfoRow
            icon={<UserRound size={17} />}
            label="جنسیت"
            value={getUserGender(user.gender)}
          />

          <InfoRow
            icon={<Phone size={17} />}
            label="شماره موبایل"
            value={user.mobile}
            ltr
          />

          <InfoRow
            icon={<Mail size={17} />}
            label="ایمیل"
            value={user.email}
            ltr
          />

          <InfoRow
            icon={<CalendarDays size={17} />}
            label="تاریخ تولد"
            value={formatDate(user.birthDate)}
          />

          <InfoRow
            icon={<Hash size={17} />}
            label="شماره شناسایی"
            value={user.identity_number}
            ltr
          />

          <InfoRow
            icon={<MapPin size={17} />}
            label="آدرس"
            value={user.address}
            fullWidth
          />
        </InfoSection>

        {/* Additional Information */}
        <InfoSection
          title="اطلاعات تکمیلی"
          description="توضیحات و اطلاعات تکمیلی پروفایل"
          icon={<FileText size={20} />}
        >
          <InfoRow
            icon={<FileText size={17} />}
            label="بیوگرافی"
            value={user.bio}
            fullWidth
          />
        </InfoSection>

        {/* Footer Note */}
        <div className="flex items-start gap-3 rounded-xl border border-elf-100 bg-elf-100 p-4 text-sm leading-7 text-elf dark:border-elf-900/50 dark:bg-elf-900/30 dark:text-elf-300">
          <Info size={19} className="mt-1 shrink-0" />
          <p>
            برای تغییر مشخصات کاربر، از دکمه «ویرایش کاربر» در بالای صفحه
            استفاده کنید.
          </p>
        </div>
      </div>
    </main>
  );
};

export default ViewUser;

/* ------------------------------
   Helper Components
------------------------------ */

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return EMPTY_VALUE;

  try {
    return ShamsiDate(value);
  } catch {
    return EMPTY_VALUE;
  }
}

function InfoSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
      <div className="mb-6 flex items-start gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-elf-100 text-elf-700 dark:bg-elf-900/50 dark:text-elf-300">
          {icon}
        </div>

        <div>
          <h3 className="font-DanaDemiBold text-base text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
  ltr = false,
  fullWidth = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  ltr?: boolean;
  fullWidth?: boolean;
}) {
  const isEmpty =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "");

  return (
    <div
      className={[
        "min-w-0 rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/50",
        fullWidth ? "sm:col-span-2 lg:col-span-3" : "",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        <span>{label}</span>
      </div>

      <div
        dir={ltr ? "ltr" : undefined}
        className={[
          "wrap-break-word text-sm font-DanaMedium leading-7 text-gray-900 dark:text-gray-100",
          ltr ? "text-right" : "",
          isEmpty ? "font-Dana text-gray-400 dark:text-gray-500" : "",
          fullWidth ? "whitespace-pre-wrap" : "",
        ].join(" ")}
      >
        {isEmpty ? EMPTY_VALUE : value}
      </div>
    </div>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  ltr = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  ltr?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-gray-50 p-3.5 dark:bg-gray-950/50">
      <div className="mt-0.5 text-gray-500 dark:text-gray-400">{icon}</div>

      <div className="min-w-0 flex-1">
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <div
          dir={ltr ? "ltr" : undefined}
          className="wrap-break-word text-sm font-DanaMedium text-gray-900 dark:text-gray-100"
        >
          {value || EMPTY_VALUE}
        </div>
      </div>
    </div>
  );
}
