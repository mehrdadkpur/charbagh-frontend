"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  Hash,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Power,
  PowerOff,
  ShieldCheck,
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

const EMPTY_FORM: IBranchForm = {
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

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();

  const branchId = params.id as string;

  const [branch, setBranch] = useState<IBranch | null>(null);
  const [form, setForm] = useState<IBranchForm>(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof IBranchForm, string>>
  >({});

  const loadBranch = useCallback(async () => {
    if (!branchId) {
      setError("شناسه شعبه معتبر نیست.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await apiFetch<IBranch>(
        `/api/branches/${branchId}`
      );

      setBranch(result);

      setForm({
        name: result.name ?? "",
        code: result.code ?? "",
        phoneNumber: result.phoneNumber ?? "",
        address: result.address ?? "",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadBranch();
  }, [loadBranch]);

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

    setSuccess("");
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

    if (!branch) return;
    if (!validate()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedBranch = await apiFetch<IBranch>(
        `/api/branches/${branch.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            id: branch.id,
            name: form.name.trim(),
            code: form.code.trim() || null,
            phoneNumber: form.phoneNumber.trim() || null,
            address: form.address.trim() || null,
          }),
        }
      );

      setBranch((previous) =>
        previous ? { ...previous, ...updatedBranch } : updatedBranch
      );

      setForm({
        name: updatedBranch.name ?? "",
        code: updatedBranch.code ?? "",
        phoneNumber: updatedBranch.phoneNumber ?? "",
        address: updatedBranch.address ?? "",
      });

      setSuccess("تغییرات شعبه با موفقیت ذخیره شد.");

      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!branch) return;

    setForm({
      name: branch.name ?? "",
      code: branch.code ?? "",
      phoneNumber: branch.phoneNumber ?? "",
      address: branch.address ?? "",
    });

    setFieldErrors({});
    setError("");
    setSuccess("");
  };

  const handleStatusChange = async () => {
    if (!branch) return;

    const action = branch.isActive ? "deactivate" : "activate";

    setChangingStatus(true);
    setError("");
    setSuccess("");

    try {
      const updatedBranch = await apiFetch<IBranch>(
        `/api/branches/${branch.id}/${action}`,
        { method: "PATCH" }
      );

      setBranch((previous) =>
        previous ? { ...previous, ...updatedBranch } : updatedBranch
      );

      setSuccess(
        updatedBranch.isActive
          ? "شعبه با موفقیت فعال شد."
          : "شعبه با موفقیت غیرفعال شد."
      );

      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setChangingStatus(false);
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

  const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
        isActive
          ? "bg-elf-100 text-elf-900 dark:bg-elf-900 dark:text-elf-100"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {isActive ? <CheckCircle2 size={14} /> : <PowerOff size={14} />}
      {isActive ? "فعال" : "غیرفعال"}
    </span>
  );

  // Loading
  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[420px] items-center justify-center bg-gray-50 dark:bg-gray-950"
      >
        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
          <Loader2
            className="animate-spin text-elf-700 dark:text-elf-300"
            size={34}
          />
          <span>در حال دریافت اطلاعات شعبه...</span>
        </div>
      </div>
    );
  }

  // Error / Not Found
  if (error && !branch) {
    return (
      <div
        dir="rtl"
        className="mx-auto max-w-3xl bg-gray-50 p-6 dark:bg-gray-950"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertCircle size={24} />
            <h2 className="font-semibold">
              دریافت اطلاعات شعبه ناموفق بود
            </h2>
          </div>

          <p className="mt-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadBranch}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              تلاش مجدد
            </button>

            <Link
              href={BRANCHES_ROUTE}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              بازگشت به شعب
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div
        dir="rtl"
        className="mx-auto max-w-3xl bg-gray-50 p-6 dark:bg-gray-950"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <Building2
            className="mx-auto text-gray-400 dark:text-gray-500"
            size={40}
          />

          <h2 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
            شعبه موردنظر پیدا نشد
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            ممکن است شعبه حذف شده باشد یا شناسه آن معتبر نباشد.
          </p>

          <Link
            href={BRANCHES_ROUTE}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-elf-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-elf-700 dark:bg-elf-700 dark:hover:bg-elf-900"
          >
            <ArrowRight size={16} />
            بازگشت به فهرست شعب
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-5xl space-y-6 bg-gray-50 p-4 dark:bg-gray-950 sm:p-6"
    >
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
            <span>ویرایش شعبه</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-elf-100 p-3 text-elf-900 dark:bg-elf-900 dark:text-elf-100">
              <Building2 size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ویرایش شعبه
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                اطلاعات و وضعیت شعبه {branch.name} را مدیریت کنید.
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

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
              <div className="rounded-xl bg-white p-2.5 text-elf-900 shadow-sm dark:bg-gray-800 dark:text-elf-300">
                <Building2 size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  اطلاعات اصلی شعبه
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  مشخصات شعبه را ویرایش کنید.
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

        {/* Branch Status */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-elf-100 p-2.5 text-elf-900 dark:bg-elf-900 dark:text-elf-100">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  وضعیت شعبه
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  وضعیت فعالیت این شعبه را مدیریت کنید.
                </p>

                <div className="mt-3">
                  <StatusBadge isActive={branch.isActive} />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStatusChange}
              disabled={changingStatus}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                branch.isActive
                  ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950"
                  : "bg-elf-900 text-white hover:bg-elf-700 dark:bg-elf-700 dark:hover:bg-elf-900"
              }`}
            >
              {changingStatus ? (
                <Loader2 size={16} className="animate-spin" />
              ) : branch.isActive ? (
                <PowerOff size={16} />
              ) : (
                <Power size={16} />
              )}

              {branch.isActive ? "غیرفعال کردن شعبه" : "فعال کردن شعبه"}
            </button>
          </div>
        </section>

        {/* Information */}
        <div className="flex items-start gap-3 rounded-xl border border-elf-300 bg-elf-100/70 p-4 dark:border-elf-700 dark:bg-elf-900/40">
          <Info size={19} className="mt-0.5 shrink-0 text-elf-700 dark:text-elf-300" />

          <p className="text-sm leading-7 text-elf-900/80 dark:text-elf-100/80">
            غیرفعال کردن شعبه، وضعیت آن را تغییر می‌دهد؛ اما اطلاعات شعبه
            حذف نمی‌شود. برای استفاده مجدد، می‌توانید آن را فعال کنید.
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Link
            href={BRANCHES_ROUTE}
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
              className="inline-flex items-center gap-2 rounded-xl bg-elf-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-elf-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-elf-700 dark:hover:bg-elf-900"
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