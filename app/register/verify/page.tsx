
"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LoaderCircle,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/config";

interface VerifyResponse {
  userId: string;
  branchId?: string | null;
  firstName: string;
  lastName: string;
  mobile: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
}

export default function VerifyRegistrationPage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    document.title = "تأیید شماره موبایل | آموزشگاه موسیقی چهارباغ";

    const savedMobile = sessionStorage.getItem("registrationMobile");

    if (!savedMobile) {
      router.replace("/register");
      return;
    }

    setMobile(savedMobile);
  }, [router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = window.setTimeout(() => {
      setSecondsLeft((previous) => previous - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  function normalizeDigits(value: string): string {
    return value
      .replace(/[۰-۹]/g, (digit) =>
        String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
      )
      .replace(/[٠-٩]/g, (digit) =>
        String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
      );
  }

  function handleCodeChange(event: ChangeEvent<HTMLInputElement>) {
    const digits = normalizeDigits(event.target.value)
      .replace(/\D/g, "")
      .slice(0, 6);

    setCode(digits);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading || code.length !== 6 || !mobile) return;

    setLoading(true);
    setError("");

    try {
      const baseUrl = API_BASE_URL.replace(/\/+$/, "");

      // این مسیر و نام فیلدها باید با قرارداد واقعی بک‌اند هماهنگ باشند.
      const response = await fetch(`${baseUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ mobile, code }),
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
          throw new Error("کد تأیید نادرست یا منقضی شده است.");
        }

        if (response.status === 429) {
          throw new Error(
            "تعداد تلاش‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.",
          );
        }

        throw new Error("تأیید شماره موبایل ناموفق بود.");
      }

      const data: VerifyResponse = await response.json();

      if (!data.accessToken || !data.refreshToken) {
        throw new Error("پاسخ دریافتی از سرور معتبر نیست.");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      if (data.branchId) {
        localStorage.setItem("currentBranchId", data.branchId);
      } else {
        localStorage.removeItem("currentBranchId");
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          mobile: data.mobile,
          fullName: data.fullName,
        }),
      );

      sessionStorage.removeItem("registrationMobile");

      toast.success("شماره موبایل تأیید شد. خوش آمدید!");
      router.replace("/dashboard");
      router.refresh();
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

  async function handleResendCode() {
    if (resending || secondsLeft > 0 || !mobile) return;

    setResending(true);
    setError("");

    try {
      const baseUrl = API_BASE_URL.replace(/\/+$/, "");

      // فرض شده درخواست مجدد با همان endpoint ثبت‌نام انجام می‌شود.
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ mobile }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("برای درخواست مجدد باید کمی صبر کنید.");
        }

        throw new Error("ارسال مجدد کد ناموفق بود.");
      }

      setSecondsLeft(60);
      setCode("");
      toast.success("درخواست ارسال مجدد کد ثبت شد.");
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
      setResending(false);
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

          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-elf/10 text-elf dark:bg-elf/15">
            <MessageSquareText size={25} />
          </span>

          <h1 className="text-2xl font-extrabold text-emerald-950 dark:text-white">
            تأیید شماره موبایل
          </h1>

          <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
            کد ارسال‌شده به شماره زیر را وارد کنید.
          </p>

          <p dir="ltr" className="mt-3 font-bold tracking-wide text-gray-800 dark:text-gray-100">
            {mobile}
          </p>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-elf/15 bg-elf/5 p-4 dark:bg-elf/10">
          <ShieldCheck
            size={21}
            className="mt-0.5 shrink-0 text-elf"
          />
          <p className="text-xs leading-6 text-gray-600 dark:text-gray-300">
            کد تأیید را فقط در همین صفحه وارد کنید. آن را در اختیار دیگران قرار ندهید.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-semibold"
            >
              کد پیامکی
            </label>

            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              dir="ltr"
              value={code}
              onChange={handleCodeChange}
              placeholder="------"
              maxLength={6}
              required
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center text-xl font-bold tracking-[0.5em] outline-none transition focus:border-elf focus:bg-white focus:ring-4 focus:ring-elf/10 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:focus:bg-gray-800"
            />

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              کد باید شامل ۶ رقم باشد.
            </p>
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
            disabled={loading || code.length !== 6 || !mobile}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-elf px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-elf/25 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                <span>در حال بررسی...</span>
              </>
            ) : (
              <span>تأیید و ورود</span>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending || secondsLeft > 0 || !mobile}
            className="text-sm font-semibold text-elf transition hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline dark:disabled:text-gray-500"
          >
            {resending
              ? "در حال ارسال..."
              : secondsLeft > 0
                ? `ارسال مجدد کد پس از ${secondsLeft} ثانیه`
                : "ارسال مجدد کد"}
          </button>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center dark:border-gray-800">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-elf dark:text-gray-400"
          >
            <ArrowRight size={16} />
            تغییر شماره موبایل
          </Link>
        </div>
      </section>
    </main>
  );
}
