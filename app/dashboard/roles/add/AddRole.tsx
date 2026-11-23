"use client";

import { ChangeEvent, FormEvent, useState } from "react";
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
} from "lucide-react";

import { ApiError, apiFetch } from "@/lib/apiFetch";

interface CreateRoleFormValues {
  name: string;
  displayName: string;
  description: string;
}

interface CreateRoleResponse {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
}

const initialState: CreateRoleFormValues = {
  name: "",
  displayName: "",
  description: "",
};

export default function AddRole() {
  const router = useRouter();

  const [fields, setFields] =
    useState<CreateRoleFormValues>(initialState);

  const [loading, setLoading] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFields((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    const name = fields.name.trim();
    const displayName = fields.displayName.trim();
    const description = fields.description.trim();

    if (!displayName) {
      toast.error("نام نمایشی نقش را وارد کنید.");
      return;
    }

    if (!name) {
      toast.error("نام فنی نقش را وارد کنید.");
      return;
    }

    if (name.length > 100) {
      toast.error("نام فنی نقش نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.");
      return;
    }

    if (displayName.length > 150) {
      toast.error("نام نمایشی نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.");
      return;
    }

    const payload = {
      name,
      displayName,
      description: description || null,
    };

    try {
      setLoading(true);

      const result = await apiFetch<CreateRoleResponse>(
        "/api/roles",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      toast.success("نقش جدید با موفقیت ایجاد شد.");

      router.push("/dashboard/roles");
      router.refresh();
    } catch (error) {
      console.error("Error creating role:", error);

      if (error instanceof ApiError) {
        if (error.status === 400) {
          toast.error(
            error.message || "اطلاعات واردشده معتبر نیست."
          );
          return;
        }

        if (error.status === 409) {
          toast.error(
            error.message || "نقشی با این نام قبلاً ثبت شده است."
          );
          return;
        }

        if (error.status === 403) {
          toast.error("شما مجوز ایجاد نقش را ندارید.");
          return;
        }

        toast.error(
          error.message || "ایجاد نقش با خطا مواجه شد."
        );
        return;
      }

      toast.error("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

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
              href="/dashboard/roles"
              className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              مدیریت نقش‌ها
            </Link>

            <span>/</span>

            <span className="text-gray-700 dark:text-gray-200">
              افزودن نقش
            </span>
          </div>

          <h1 className="text-2xl font-MorabbaBold text-gray-900 dark:text-white">
            افزودن نقش جدید
          </h1>

          <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
            اطلاعات نقش جدید را وارد کنید تا در سیستم ثبت شود.
          </p>
        </div>

        <Link
          href="/dashboard/roles"
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
            درباره ایجاد نقش
          </p>

          <p className="mt-1 text-xs leading-7 text-indigo-800/80 dark:text-indigo-300/80">
            نقش جدید به‌صورت فعال و غیراسیستمی ایجاد می‌شود.
            پس از ثبت نقش، می‌توانید آن را به کاربران و شعبه‌ها
            اختصاص دهید.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Form Header */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h2 className="font-DanaDemiBold text-gray-900 dark:text-white">
                اطلاعات نقش
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                فیلدهای ستاره‌دار الزامی هستند.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6 p-5 sm:p-6">
            {/* Display Name */}
            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="block text-sm font-DanaDemiBold text-gray-700 dark:text-gray-200"
              >
                نام نمایشی نقش
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
                  placeholder="مثلاً مدیر شعبه"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pr-11 pl-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
                />
              </div>

              <p className="text-xs text-gray-400">
                نامی که در پنل مدیریت به کاربران نمایش داده می‌شود.
              </p>
            </div>

            {/* Technical Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-DanaDemiBold text-gray-700 dark:text-gray-200"
              >
                نام فنی نقش
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <KeyRound
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
                  placeholder="BranchManager"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pr-11 pl-4 text-left text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
                />
              </div>

              <p className="text-xs leading-6 text-gray-400">
                نام فنی برای استفاده در منطق برنامه و کنترل دسترسی است.
                بهتر است از نام‌های انگلیسی و بدون فاصله استفاده کنید.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-DanaDemiBold text-gray-700 dark:text-gray-200"
              >
                توضیحات نقش
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
                  value={fields.description}
                  onChange={handleChange}
                  placeholder="توضیح مختصری درباره مسئولیت‌ها و کاربرد این نقش بنویسید..."
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm leading-7 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/30 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Link
              href="/dashboard/roles"
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
                  ثبت نقش جدید
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}