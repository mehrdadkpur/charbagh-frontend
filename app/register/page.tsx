
"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, Phone, ArrowLeft, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/config";

function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
    );
}

function isValidMobile(value: string): boolean {
  return /^09\d{9}$/.test(normalizeDigits(value).trim());
}

export default function RegisterPage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "ثبت‌نام | آموزشگاه موسیقی چهارباغ";
  }, []);

  const normalizedMobile = normalizeDigits(mobile).trim();
  const isFormValid = isValidMobile(normalizedMobile);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setMobile(event.target.value);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading || !isFormValid) return;

    setLoading(true);
    setError("");

    try {
      const baseUrl = API_BASE_URL.replace(/\/+$/, "");

      // این مسیر باید با endpoint واقعی بک‌اند هماهنگ باشد.
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ mobile: normalizedMobile }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            "این شماره موبایل قبلاً ثبت شده است. از صفحه ورود استفاده کنید.",
          );
        }

        if (response.status === 400 || response.status === 422) {
          throw new Error("شماره موبایل واردشده معتبر نیست.");
        }

        if (response.status === 429) {
          throw new Error(
            "درخواست‌های زیادی ارسال شده است. کمی بعد دوباره تلاش کنید.",
          );
        }

        throw new Error("ارسال کد تأیید ناموفق بود.");
      }

      sessionStorage.setItem("registrationMobile", normalizedMobile);

      toast.success("درخواست ارسال کد ثبت شد.");
      router.push("/register/verify");
    } catch (exception) {
      const message =
        exception instanceof TypeError
          ? "ارتباط با سرور برقرار نشد."
          : exception instanceof Error
            ? exception.message
            : "خطای غیرمنتظره‌ای رخ داد.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#f6f8f5] px-4 py-8 text-slate-800 dark:bg-gray-950 dark:text-gray-100"
    >
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-8 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20">
        <div className="mb-7 flex flex-col items-center text-center">
          <Image
            src="/images/logo.png"
            alt="لوگوی آموزشگاه موسیقی چهارباغ"
            width={64}
            height={64}
            priority
            className="mb-4 size-16 rounded-2xl object-contain"
          />

          <h1 className="text-2xl font-extrabold text-emerald-950 dark:text-white">
            ساخت حساب کاربری
          </h1>

          <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
            برای شروع، شماره موبایل خود را وارد کنید.
          </p>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-elf/15 bg-elf/5 p-4 dark:bg-elf/10">
          <ShieldCheck
            size={21}
            className="mt-0.5 shrink-0 text-elf"
          />
          <p className="text-xs leading-6 text-gray-600 dark:text-gray-300">
            برای تأیید شماره و ساخت حساب، یک کد پیامکی برای شما ارسال می‌شود.
            حساب جدید با دسترسی محدود ایجاد خواهد شد.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="mobile"
              className="mb-2 block text-sm font-semibold"
            >
              شماره موبایل
            </label>

            <div className="relative">
              <Phone
                size={19}
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                value={mobile}
                onChange={handleChange}
                placeholder="09123456789"
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pe-12 ps-4 text-left text-sm outline-none transition focus:border-elf focus:bg-white focus:ring-4 focus:ring-elf/10 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:focus:bg-gray-800"
              />
            </div>

            {mobile.length > 0 && !isFormValid && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-elf px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-elf/25 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                <span>در حال ارسال...</span>
              </>
            ) : (
              <>
                <span>دریافت کد تأیید</span>
                <ArrowLeft size={17} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-gray-50 px-4 py-4 text-center dark:bg-gray-800/70">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            قبلاً حساب ساخته‌اید؟{" "}
            <Link
              href="/login"
              className="font-bold text-elf underline-offset-4 hover:underline"
            >
              وارد شوید
            </Link>
          </p>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 transition hover:text-elf dark:text-gray-400"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </section>
    </main>
  );
}
