"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  Hash,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Plus,
} from "lucide-react";

import { ApiError, apiFetch } from "@/lib/apiFetch";

interface IBranch {
  id: string;
  name: string;
  code: string | null;
  phoneNumber: string | null;
  address: string | null;
  isActive: boolean;
}

interface IBranchForm {
  name: string;
  code: string;
  phoneNumber: string;
  address: string;
}

const BRANCHES_ROUTE = "/dashboard/branches";

const INITIAL_FORM: IBranchForm = {
  name: "",
  code: "",
  phoneNumber: "",
  address: "",
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

export default function AddBranchPage() {
  const router = useRouter();

  const [form, setForm] = useState<IBranchForm>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof IBranchForm, string>>
  >({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));

    setError("");
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof IBranchForm, string>> = {};

    if (!form.name.trim()) {
      errors.name = "نام شعبه الزامی است.";
    } else if (form.name.trim().length > 150) {
      errors.name = "نام شعبه نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.";
    }

    if (form.code.trim().length > 50) {
      errors.code = "کد شعبه نمی‌تواند بیشتر از ۵۰ کاراکتر باشد.";
    }

    if (form.phoneNumber.trim().length > 30) {
      errors.phoneNumber = "شماره تماس نمی‌تواند بیشتر از ۳۰ کاراکتر باشد.";
    }

    if (form.address.trim().length > 500) {
      errors.address = "آدرس نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        phoneNumber: form.phoneNumber.trim() || null,
        address: form.address.trim() || null,
      };

      await apiFetch<IBranch>("/api/branches", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push(BRANCHES_ROUTE);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:border-red-800 dark:focus:ring-red-950"
        : "border-gray-200 focus:border-elf-700 focus:ring-4 focus:ring-elf-100 dark:border-gray-700 dark:focus:border-elf-300 dark:focus:ring-elf-900"
    }`;

  const FieldError = ({ message }: { message?: string }) => {
    if (!message) return null;

    return (
      <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
        <AlertCircle size={15} />
        {message}
      </p>
    );
  };

  return (
    <div dir="rtl" className="mx-auto max-w-5xl space-y-6 bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href={BRANCHES_ROUTE}
              className="transition hover:text-elf-700 dark:hover:text-elf-300"
            >
              شعب
            </Link>
            <ArrowRight size={14} />
            <span>افزودن شعبه</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-elf-100 p-3 text-elf-900 dark:bg-elf-900 dark:text-elf-100">
              <Plus size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                افزودن شعبه جدید
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                اطلاعات شعبه جدید را وارد کنید.
              </p>
            </div>
          </div>
        </div>

        <Link
          href={BRANCHES_ROUTE}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <ArrowRight size={16} />
          بازگشت به شعب
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 text-elf-900 shadow-sm dark:bg-gray-800 dark:text-elf-300">
                <Building2 size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  اطلاعات اصلی شعبه
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  نام، کد و اطلاعات تماس شعبه را مشخص کنید.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Building2 size={16} className="text-gray-400" />
                نام شعبه
                <span className="text-red-500">*</span>
              </label>

              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={150}
                placeholder="مثلاً شعبه مرکزی"
                className={inputClass(!!fieldErrors.name)}
              />

              <FieldError message={fieldErrors.name} />
            </div>

            {/* Code */}
            <div>
              <label
                htmlFor="code"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Hash size={16} className="text-gray-400" />
                کد شعبه
                <span className="text-xs font-normal text-gray-400">
                  (اختیاری)
                </span>
              </label>

              <input
                id="code"
                name="code"
                value={form.code}
                onChange={handleChange}
                maxLength={50}
                placeholder="مثلاً BR-001"
                className={inputClass(!!fieldErrors.code)}
              />

              <FieldError message={fieldErrors.code} />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Phone size={16} className="text-gray-400" />
                شماره تماس
                <span className="text-xs font-normal text-gray-400">
                  (اختیاری)
                </span>
              </label>

              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                dir="ltr"
                value={form.phoneNumber}
                onChange={handleChange}
                maxLength={30}
                placeholder="02112345678"
                className={`${inputClass(!!fieldErrors.phoneNumber)} text-left`}
              />

              <FieldError message={fieldErrors.phoneNumber} />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <MapPin size={16} className="text-gray-400" />
                آدرس شعبه
                <span className="text-xs font-normal text-gray-400">
                  (اختیاری)
                </span>
              </label>

              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                placeholder="آدرس کامل شعبه را وارد کنید..."
                className={inputClass(!!fieldErrors.address)}
              />

              <FieldError message={fieldErrors.address} />
            </div>
          </div>
        </section>

        {/* Default Status */}
        <div className="flex items-start gap-3 rounded-xl border border-elf-300 bg-elf-100/70 p-4 dark:border-elf-700 dark:bg-elf-900/40">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-elf-700 dark:text-elf-300" />
          <div>
            <p className="text-sm font-semibold text-elf-900 dark:text-elf-100">
              وضعیت اولیه شعبه
            </p>
            <p className="mt-1 text-sm leading-6 text-elf-900/80 dark:text-elf-100/80">
              شعبه پس از ایجاد به‌صورت پیش‌فرض فعال خواهد بود. پس از ثبت،
              می‌توانید وضعیت آن را از فهرست شعب تغییر دهید.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Link
            href={BRANCHES_ROUTE}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            انصراف
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-elf-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-elf-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-elf-700 dark:hover:bg-elf-900"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}

            {saving ? "در حال ثبت..." : "ثبت شعبه"}
          </button>
        </div>
      </form>
    </div>
  );
}