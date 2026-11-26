"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { Copy, KeyRound, Search, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";

type UserLookup = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  nationalIdentificationNumber: string;
  email: string | null;
  status: number;
};

type ResetPasswordResponse = {
  userId: string;
  temporaryPassword: string;
};

export default function AdminResetPasswordPage() {
  const [nationalCode, setNationalCode] = useState("");
  const [user, setUser] = useState<UserLookup | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [searching, setSearching] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSearch = async () => {
    const normalizedCode = nationalCode.trim();

    if (!normalizedCode) {
      toast.error("لطفاً کد ملی را وارد کنید.");
      return;
    }

    setSearching(true);
    setUser(null);
    setTemporaryPassword("");

    try {
      const result = await apiFetch<UserLookup>(
        `/api/Users/${encodeURIComponent(normalizedCode)}`
      );
      setUser(result);
      toast.success("حساب کاربری پیدا شد.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "جست‌وجوی کاربر ناموفق بود.");
    } finally {
      setSearching(false);
    }
  };

  const handleReset = async () => {
    if (!user) return;

    const confirmation = await Swal.fire({
      title: "بازیابی رمز عبور",
      text: `رمز عبور حساب ${user.firstName} ${user.lastName} با یک رمز موقت تصادفی و قوی جایگزین می‌شود. نشست‌های تمدیدشونده قبلی نیز باطل خواهند شد.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بازیابی رمز عبور",
      cancelButtonText: "انصراف",
      confirmButtonColor: "#b7791f",
    });

    if (!confirmation.isConfirmed) return;

    setResetting(true);
    setTemporaryPassword("");

    try {
      const result = await apiFetch<ResetPasswordResponse>(
        `/api/Users/${user.id}/reset-password`,
        { method: "POST" }
      );

      setTemporaryPassword(result.temporaryPassword);
      toast.success("رمز موقت با موفقیت تولید شد.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "بازیابی رمز عبور ناموفق بود.");
    } finally {
      setResetting(false);
    }
  };

  const copyTemporaryPassword = async () => {
    if (!temporaryPassword) return;

    try {
      await navigator.clipboard.writeText(temporaryPassword);
      toast.success("رمز موقت کپی شد.");
    } catch {
      toast.error("کپی خودکار در دسترس نیست؛ رمز را دستی کپی کنید.");
    }
  };

  return (
    <main dir="rtl" className="mx-auto mt-8 w-full max-w-2xl space-y-6 px-4 pb-10">
      <header className="text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-elf/10 text-elf">
          <KeyRound size={26} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">بازیابی رمز عبور کاربران</h1>
        <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
          کد ملی کاربر را جست‌وجو کنید و در صورت داشتن مجوز مدیریتی، برای حساب او رمز موقت جدید بسازید.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">کد ملی کاربر</span>
          <input
            value={nationalCode}
            onChange={(event) => {
              setNationalCode(event.target.value);
              setUser(null);
              setTemporaryPassword("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleSearch();
            }}
            inputMode="numeric"
            autoComplete="off"
            placeholder="کد ملی را وارد کنید"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-elf dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </label>

        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={searching}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-elf px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search size={17} />
          {searching ? "در حال جست‌وجو..." : "جست‌وجوی کاربر"}
        </button>
      </section>

      {user && (
        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
            <ShieldCheck size={18} className="text-green-600" />
            حساب کاربری پیدا شد
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
              <dt className="text-xs text-gray-500">نام و نام خانوادگی</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
              <dt className="text-xs text-gray-500">کد ملی</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{user.nationalIdentificationNumber}</dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
              <dt className="text-xs text-gray-500">شماره همراه</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.mobile}</dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
              <dt className="text-xs text-gray-500">ایمیل</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.email || "ثبت نشده"}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => void handleReset()}
            disabled={resetting}
            className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resetting ? "در حال بازیابی..." : "تولید رمز عبور موقت"}
          </button>

          {temporaryPassword && (
            <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">رمز موقت جدید — فقط همین یک‌بار نمایش داده می‌شود</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <code dir="ltr" className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-3 text-center text-sm text-gray-900 dark:bg-gray-950 dark:text-gray-100">
                  {temporaryPassword}
                </code>
                <button
                  type="button"
                  onClick={() => void copyTemporaryPassword()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-700 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-800"
                >
                  <Copy size={16} />
                  کپی رمز
                </button>
              </div>
              <p className="text-xs leading-6 text-amber-900 dark:text-amber-200">
                این رمز را از مسیر امن به صاحب حساب تحویل دهید. کد ملی کاربر به‌عنوان رمز عبور استفاده نمی‌شود.
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
