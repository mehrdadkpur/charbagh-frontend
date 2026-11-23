"use client";

import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  ArrowRight,
  Loader2,
  Save,
  ShieldCheck,
  Info,
  X,
  KeyRound,
  FileText,
  Layers3,
  Code2,
  LockKeyhole,
} from "lucide-react";

import { ApiError, apiFetch } from "@/lib/apiFetch";

// --------------------------------------------------
// Types
// --------------------------------------------------

interface IPermission {
  module: string;
  name: string;
  action: number | null;
  displayName: string;
  description: string;
  isSystem: boolean;
}

// --------------------------------------------------
// Constants
// --------------------------------------------------

const PERMISSIONS_ROUTE = "/dashboard/permissions";

const initialState: IPermission = {
  module: "",
  name: "",
  action: null,
  displayName: "",
  description: "",
  isSystem: false,
};

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AddPermission() {
  const router = useRouter();

  const [fields, setFields] = useState<IPermission>(initialState);
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // Handle Changes
  // --------------------------------------------------

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFields((previous) => ({
      ...previous,
      [name]: name === "action"
        ? value === ""
          ? null
          : Number(value)
        : value,
    }));
  };

  const handleSystemChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setFields((previous) => ({
      ...previous,
      isSystem: event.target.checked,
    }));
  };

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  const validate = (): boolean => {
    const module = fields.module.trim();
    const name = fields.name.trim();
    const displayName = fields.displayName.trim();

    if (!module) {
      toast.error("نام ماژول را وارد کنید.");
      return false;
    }

    if (!name) {
      toast.error("نام فنی مجوز را وارد کنید.");
      return false;
    }

    if (fields.action === null) {
      toast.error("نوع عملیات را انتخاب کنید.");
      return false;
    }

    if (!displayName) {
      toast.error("نام نمایشی مجوز را وارد کنید.");
      return false;
    }

    if (module.length > 100) {
      toast.error("نام ماژول نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.");
      return false;
    }

    if (name.length > 100) {
      toast.error("نام فنی مجوز نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.");
      return false;
    }

    if (displayName.length > 150) {
      toast.error("نام نمایشی نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.");
      return false;
    }

    if (fields.description.trim().length > 1000) {
      toast.error("توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.");
      return false;
    }

    if (
      !Number.isInteger(fields.action) ||
      fields.action < 1 ||
      fields.action > 8
    ) {
      toast.error("نوع عملیات معتبر نیست.");
      return false;
    }

    return true;
  };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading || !validate()) return;

    const payload = {
      module: fields.module.trim(),
      name: fields.name.trim(),
      action: fields.action,
      displayName: fields.displayName.trim(),
      description: fields.description.trim() || null,
      isSystem: fields.isSystem,
    };

    try {
      setLoading(true);

      await apiFetch(
        "/api/permissions",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      toast.success("مجوز جدید با موفقیت ایجاد شد.");

      router.push(PERMISSIONS_ROUTE);
      router.refresh();
    } catch (error) {
      console.error("Error creating permission:", error);

      if (error instanceof ApiError) {
        if (error.status === 400) {
          toast.error(
            error.message || "اطلاعات واردشده معتبر نیست."
          );
          return;
        }

        if (error.status === 409) {
          toast.error(
            error.message || "مجوزی با این مشخصات قبلاً ثبت شده است."
          );
          return;
        }

        if (error.status === 403) {
          toast.error("شما مجوز ایجاد مجوز جدید را ندارید.");
          return;
        }

        toast.error(
          error.message || "ایجاد مجوز با خطا مواجه شد."
        );
        return;
      }

      toast.error("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <section
      dir="rtl"
      className="mx-auto w-full space-y-6 px-3 pb-10 sm:px-5 lg:px-7"
    >
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/dashboard"
              className="transition hover:text-elf-700 dark:hover:text-elf-300"
            >
              داشبورد
            </Link>

            <span>/</span>

            <Link
              href={PERMISSIONS_ROUTE}
              className="transition hover:text-elf-700 dark:hover:text-elf-300"
            >
              مدیریت مجوزها
            </Link>

            <span>/</span>

            <span className="text-gray-700 dark:text-gray-200">
              افزودن مجوز
            </span>
          </div>

          <h1 className="text-2xl font-MorabbaBold text-gray-900 dark:text-white">
            افزودن مجوز جدید
          </h1>

          <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
            اطلاعات مجوز جدید را وارد کنید تا در سیستم ثبت شود.
          </p>
        </div>

        <Link
          href={PERMISSIONS_ROUTE}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 sm:self-auto"
        >
          <ArrowRight size={17} />
          بازگشت به فهرست
        </Link>
      </div>

      {/* Information */}

      <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Info size={19} />
        </div>

        <div>
          <p className="text-sm font-DanaDemiBold text-indigo-900 dark:text-indigo-300">
            درباره ایجاد مجوز
          </p>

          <p className="mt-1 text-xs leading-7 text-indigo-800/80 dark:text-indigo-300/80">
            مجوزها مشخص می‌کنند کاربران از طریق نقش‌های اختصاص‌یافته
            به چه بخش‌ها و عملیات‌هایی دسترسی دارند. مجوزهای سیستمی
            برای ساختار اصلی برنامه در نظر گرفته شده‌اند و قابل ویرایش نیستند.
          </p>
        </div>
      </div>

      {/* Form */}

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          {/* Form Header */}

          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h2 className="font-DanaDemiBold text-gray-900 dark:text-white">
                اطلاعات مجوز
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                فیلدهای ستاره‌دار الزامی هستند.
              </p>
            </div>
          </div>

          {/* Form Fields */}

          <div className="space-y-6 p-5 sm:p-6">

            {/* Module */}

            <div className="space-y-2">
              <label
                htmlFor="module"
                className="block text-sm font-DanaDemiBold text-gray-700 dark:text-gray-200"
              >
                نام ماژول
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <Layers3
                  size={18}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="module"
                  name="module"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="off"
                  value={fields.module}
                  onChange={handleChange}
                  placeholder="مثلاً Students"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pr-11 pl-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
                />
              </div>

              <p className="text-xs text-gray-400">
                نام بخشی از سیستم که این مجوز به آن تعلق دارد.
              </p>
            </div>

            {/* Name */}

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-DanaDemiBold text-gray-700 dark:text-gray-200"
              >
                نام فنی مجوز
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <Code2
                  size={18}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="off"
                  dir="ltr"
                  value={fields.name}
                  onChange={handleChange}
                  placeholder="Students.View"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pr-11 pl-4 text-left text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
                />
              </div>

              <p className="text-xs leading-6 text-gray-400">
                یک نام یکتا و قابل تشخیص برای استفاده در منطق دسترسی سیستم.
              </p>
            </div>

            {/* Action */}

            <div className="space-y-2">
              <label
                htmlFor="action"
                className="block text-sm font-DanaDemiBold text-gray-700 dark:text-gray-200"
              >
                نوع عملیات
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <KeyRound
                  size={18}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  id="action"
                  name="action"
                  required
                  value={fields.action ?? ""}
                  onChange={handleChange}
                  className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pr-11 pl-4 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
                >
                  <option value="">انتخاب عملیات</option>
                  <option value="1">مشاهده</option>
                  <option value="2">ایجاد</option>
                  <option value="3">بروزرسانی</option>
                  <option value="4">حذف</option>
                  <option value="5">استخراج</option>
                  <option value="6">چاپ</option>
                  <option value="7">تأیید</option>
                  <option value="8">مدیریت</option>
                </select>
              </div>

              <p className="text-xs text-gray-400">
                عملیاتی که دارنده این مجوز اجازه انجام آن را خواهد داشت.
              </p>
            </div>

            {/* Display Name */}

            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="block text-sm font-DanaDemiBold text-gray-700 dark:text-gray-200"
              >
                نام نمایشی مجوز
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <ShieldCheck
                  size={18}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  maxLength={150}
                  autoComplete="off"
                  value={fields.displayName}
                  onChange={handleChange}
                  placeholder="مثلاً مشاهده فهرست هنرجویان"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pr-11 pl-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
                />
              </div>

              <p className="text-xs text-gray-400">
                عنوانی که در پنل مدیریت برای این مجوز نمایش داده می‌شود.
              </p>
            </div>

            {/* Description */}

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-DanaDemiBold text-gray-700 dark:text-gray-200"
              >
                توضیحات مجوز
                <span className="mr-1 text-xs font-normal text-gray-400">
                  (اختیاری)
                </span>
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="absolute right-3.5 top-4 text-gray-400"
                />

                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={1000}
                  value={fields.description}
                  onChange={handleChange}
                  placeholder="توضیح مختصری درباره کاربرد این مجوز بنویسید..."
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm leading-7 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
                />
              </div>
            </div>

            {/* Is System */}

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <label
                htmlFor="isSystem"
                className="flex cursor-pointer items-start gap-3"
              >
                <input
                  id="isSystem"
                  name="isSystem"
                  type="checkbox"
                  checked={fields.isSystem}
                  onChange={handleSystemChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <LockKeyhole
                      size={16}
                      className="text-indigo-600 dark:text-indigo-400"
                    />

                    <span className="text-sm font-DanaDemiBold text-gray-800 dark:text-gray-200">
                      مجوز سیستمی
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-6 text-gray-500 dark:text-gray-400">
                    مجوز سیستمی قابل ویرایش نیست. این گزینه را فقط برای
                    مجوزهایی فعال کنید که بخشی از ساختار اصلی سیستم هستند.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Form Footer */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/30 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Link
              href={PERMISSIONS_ROUTE}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <X size={17} />
              انصراف
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-DanaDemiBold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  <Save size={17} />
                  ثبت مجوز جدید
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}