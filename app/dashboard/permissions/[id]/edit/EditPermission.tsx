"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileKey,
  Info,
  Layers,
  Code2,
  Type,
  AlignLeft,
  Settings2,
} from "lucide-react";

import { ApiError, apiFetch } from "@/lib/apiFetch";

interface IPermission {
  id: string;
  module: string;
  name: string;
  action: number;
  displayName: string;
  description: string | null;
  isSystem: boolean;
}

interface IPermissionForm {
  module: string;
  name: string;
  action: number | null;
  displayName: string;
  description: string;
}

const PERMISSIONS_ROUTE = "/dashboard/permissions";

const ACTION_OPTIONS = [
  { value: 1, label: "مشاهده" },
  { value: 2, label: "ایجاد" },
  { value: 3, label: "ویرایش" },
  { value: 4, label: "حذف" },
  { value: 5, label: "خروجی گرفتن" },
  { value: 6, label: "چاپ" },
  { value: 7, label: "تأیید" },
  { value: 8, label: "مدیریت" },
];

const EMPTY_FORM: IPermissionForm = {
  module: "",
  name: "",
  action: null,
  displayName: "",
  description: "",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || "خطایی در ارتباط با سرور رخ داد.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "خطای غیرمنتظره‌ای رخ داد.";
}

export default function EditPermission() {
  const router = useRouter();
  const params = useParams();

  const permissionId = params.id as string;

  const [permission, setPermission] = useState<IPermission | null>(null);
  const [form, setForm] = useState<IPermissionForm>(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof IPermissionForm, string>>
  >({});

  const loadPermission = useCallback(async () => {
    if (!permissionId) {
      setError("شناسه مجوز معتبر نیست.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await apiFetch<IPermission>(
        `/api/permissions/${permissionId}`
      );

      setPermission(result);

      setForm({
        module: result.module ?? "",
        name: result.name ?? "",
        action: Number(result.action),
        displayName: result.displayName ?? "",
        description: result.description ?? "",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [permissionId]);

  useEffect(() => {
    loadPermission();
  }, [loadPermission]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "action" ? (value ? Number(value) : null) : value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));

    setSuccess("");
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof IPermissionForm, string>> = {};

    if (!form.module.trim()) {
      errors.module = "نام ماژول الزامی است.";
    } else if (form.module.trim().length > 100) {
      errors.module = "نام ماژول نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.";
    }

    if (!form.name.trim()) {
      errors.name = "نام فنی مجوز الزامی است.";
    } else if (form.name.trim().length > 100) {
      errors.name = "نام فنی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.";
    }

    if (!form.displayName.trim()) {
      errors.displayName = "عنوان نمایشی مجوز الزامی است.";
    } else if (form.displayName.trim().length > 150) {
      errors.displayName =
        "عنوان نمایشی نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.";
    }

    if (
      form.action === null ||
      !Number.isInteger(form.action) ||
      !ACTION_OPTIONS.some((item) => item.value === form.action)
    ) {
      errors.action = "نوع عملیات را انتخاب کنید.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!permission || permission.isSystem) return;
    if (!validate()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch<IPermission>(`/api/permissions/${permission.id}`, {
        method: "PUT",
        body: JSON.stringify({
          id: permission.id,
          module: form.module.trim(),
          name: form.name.trim(),
          action: form.action,
          displayName: form.displayName.trim(),
          description: form.description.trim() || null,
        }),
      });

      setSuccess("تغییرات مجوز با موفقیت ذخیره شد.");

      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!permission) return;

    setForm({
      module: permission.module ?? "",
      name: permission.name ?? "",
      action: Number(permission.action),
      displayName: permission.displayName ?? "",
      description: permission.description ?? "",
    });

    setFieldErrors({});
    setError("");
    setSuccess("");
  };

  const FieldError = ({ message }: { message?: string }) => {
    if (!message) return null;

    return (
      <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
        <AlertCircle size={15} />
        {message}
      </p>
    );
  };

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-800 dark:focus:border-red-600 dark:focus:ring-red-950"
        : "border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 dark:border-gray-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
    }`;

  // Loading
  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[420px] items-center justify-center bg-gray-50 dark:bg-gray-950"
      >
        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
          <Loader2
            className="animate-spin text-indigo-600 dark:text-indigo-400"
            size={34}
          />
          <span>در حال دریافت اطلاعات مجوز...</span>
        </div>
      </div>
    );
  }

  // Error / Not Found
  if (error && !permission) {
    return (
      <div
        dir="rtl"
        className="mx-auto max-w-3xl bg-gray-50 p-6 dark:bg-gray-950"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertCircle size={24} />
            <h2 className="font-semibold">
              دریافت اطلاعات مجوز ناموفق بود
            </h2>
          </div>

          <p className="mt-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadPermission}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              تلاش مجدد
            </button>

            <Link
              href={PERMISSIONS_ROUTE}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              بازگشت به مجوزها
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!permission) {
    return (
      <div
        dir="rtl"
        className="mx-auto max-w-3xl bg-gray-50 p-6 dark:bg-gray-950"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <FileKey
            className="mx-auto text-gray-400 dark:text-gray-500"
            size={40}
          />

          <h2 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
            مجوز موردنظر پیدا نشد
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            ممکن است مجوز حذف شده باشد یا شناسه آن معتبر نباشد.
          </p>

          <Link
            href={PERMISSIONS_ROUTE}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <ArrowRight size={16} />
            بازگشت به فهرست مجوزها
          </Link>
        </div>
      </div>
    );
  }

  // System Permission
  if (permission.isSystem) {
    return (
      <div
        dir="rtl"
        className="mx-auto max-w-4xl space-y-6 bg-gray-50 p-4 dark:bg-gray-950 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link
                href={PERMISSIONS_ROUTE}
                className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                مجوزها
              </Link>

              <span>/</span>
              <span>ویرایش مجوز</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ویرایش مجوز
            </h1>
          </div>

          <Link
            href={PERMISSIONS_ROUTE}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowRight size={16} />
            بازگشت
          </Link>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <LockKeyhole size={24} />
            </div>

            <div>
              <h2 className="font-semibold text-amber-900 dark:text-amber-200">
                این مجوز سیستمی است
              </h2>

              <p className="mt-2 text-sm leading-7 text-amber-800 dark:text-amber-300">
                مجوزهای سیستمی در ساختار فعلی دامنه قابل ویرایش نیستند.
                برای تغییر این مجوز باید منطق و سیاست‌های مربوط به مجوزهای
                سیستمی در بک‌اند بررسی و اصلاح شود.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-900 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              عنوان مجوز
            </p>

            <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
              {permission.displayName}
            </p>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              نام فنی
            </p>

            <p
              dir="ltr"
              className="mt-1 text-left font-mono text-sm text-gray-800 dark:text-gray-200"
            >
              {permission.name}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-5xl space-y-6 bg-gray-50 p-4 dark:bg-gray-950 sm:p-6"
    >
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href={PERMISSIONS_ROUTE}
              className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              مجوزها
            </Link>

            <span>/</span>
            <span>ویرایش مجوز</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <FileKey size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ویرایش مجوز
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                اطلاعات و مشخصات مجوز انتخاب‌شده را ویرایش کنید.
              </p>
            </div>
          </div>
        </div>

        <Link
          href={PERMISSIONS_ROUTE}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <ArrowRight size={16} />
          بازگشت به مجوزها
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 text-indigo-600 shadow-sm dark:bg-gray-800 dark:text-indigo-400">
                <Settings2 size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  اطلاعات اصلی مجوز
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  مشخصات فنی و عنوان نمایشی مجوز را تنظیم کنید.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            {/* Module */}
            <div>
              <label
                htmlFor="module"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Layers size={16} className="text-gray-400 dark:text-gray-500" />
                ماژول
                <span className="text-red-500">*</span>
              </label>

              <input
                id="module"
                name="module"
                type="text"
                value={form.module}
                onChange={handleChange}
                maxLength={100}
                placeholder="مثلاً Students"
                className={inputClass(!!fieldErrors.module)}
              />

              <FieldError message={fieldErrors.module} />

              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                حداکثر ۱۰۰ کاراکتر
              </p>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Code2 size={16} className="text-gray-400 dark:text-gray-500" />
                نام فنی مجوز
                <span className="text-red-500">*</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                dir="ltr"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                placeholder="Students.View"
                className={`${inputClass(!!fieldErrors.name)} text-left font-mono`}
              />

              <FieldError message={fieldErrors.name} />

              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                نام یکتا و قابل استفاده در کد برنامه
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label
                htmlFor="displayName"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Type size={16} className="text-gray-400 dark:text-gray-500" />
                عنوان نمایشی
                <span className="text-red-500">*</span>
              </label>

              <input
                id="displayName"
                name="displayName"
                type="text"
                value={form.displayName}
                onChange={handleChange}
                maxLength={150}
                placeholder="مثلاً مشاهده هنرجویان"
                className={inputClass(!!fieldErrors.displayName)}
              />

              <FieldError message={fieldErrors.displayName} />
            </div>

            {/* Action */}
            <div>
              <label
                htmlFor="action"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <ShieldCheck
                  size={16}
                  className="text-gray-400 dark:text-gray-500"
                />
                نوع عملیات
                <span className="text-red-500">*</span>
              </label>

              <select
                id="action"
                name="action"
                value={form.action ?? ""}
                onChange={handleChange}
                className={inputClass(!!fieldErrors.action)}
              >
                <option value="">انتخاب نوع عملیات</option>

                {ACTION_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <FieldError message={fieldErrors.action} />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <AlignLeft
                  size={16}
                  className="text-gray-400 dark:text-gray-500"
                />
                توضیحات
                <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                  (اختیاری)
                </span>
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="توضیح کوتاهی درباره کاربرد این مجوز بنویسید..."
                className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
              />
            </div>
          </div>
        </section>

        {/* Permission Type */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <LockKeyhole size={21} />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                نوع مجوز
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                نوع این مجوز هنگام ایجاد مشخص شده و در صفحه ویرایش قابل تغییر نیست.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />

                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  مجوز سفارشی
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Information */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <Info
            size={19}
            className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
          />

          <p className="text-sm leading-7 text-blue-800 dark:text-blue-300">
            تغییر نام فنی یا نوع عملیات ممکن است روی تخصیص مجوز به نقش‌ها
            و بررسی دسترسی کاربران اثر بگذارد. پیش از ذخیره، وابستگی‌های
            این مجوز را بررسی کنید.
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Link
            href={PERMISSIONS_ROUTE}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            انصراف
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <RotateCcw size={16} />
              بازگردانی تغییرات
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}