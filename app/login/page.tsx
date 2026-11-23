
"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
  Phone,
} from "lucide-react";

import { API_BASE_URL } from "@/lib/config";

interface LoginFormData {
  mobile: string;
  password: string;
}

interface LoginResponse {
  userId: string;
  branchId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
}

function normalizeMobile(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
    )
    .replace(/[\s-]/g, "");
}

function isValidMobile(value: string): boolean {
  return /^09\d{9}$/.test(normalizeMobile(value));
}

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<LoginFormData>({
    mobile: "",
    password: "",
  });

  const mobile = normalizeMobile(formData.mobile);
  const password = formData.password;

  const isFormValid =
    isValidMobile(mobile) && password.trim().length > 0;

  useEffect(() => {
    document.title =
      "ورود به حساب کاربری | آموزشگاه موسیقی چهارباغ";
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading || !isFormValid) return;

    setLoading(true);
    setError("");

    try {
      const baseUrl = API_BASE_URL.replace(/\/+$/, "");

      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          mobile,
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
          throw new Error("شماره موبایل یا رمز عبور صحیح نیست.");
        }

        if (response.status === 403) {
          throw new Error("امکان ورود به این حساب وجود ندارد.");
        }

        throw new Error("ارتباط با سرور با مشکل مواجه شد.");
      }

      const data: LoginResponse = await response.json();

      if (!data.accessToken || !data.refreshToken) {
        throw new Error("پاسخ سرور معتبر نیست.");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("currentBranchId", data.branchId);

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

      toast.success("ورود با موفقیت انجام شد.");

      router.replace("/dashboard");
      router.refresh();
    } catch (exception) {
      const message =
        exception instanceof TypeError
          ? "ارتباط با سرور برقرار نشد. اتصال اینترنت و آدرس API را بررسی کنید."
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
      className="
        relative flex min-h-screen items-center justify-center
        overflow-hidden bg-gray-50 px-4 py-10 text-gray-900
        dark:bg-gray-950 dark:text-gray-100
      "
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 size-80 rounded-full bg-elf/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-amber-400/10 blur-3xl"
      />

      <section
        className="
          relative w-full max-w-md rounded-3xl
          border border-gray-200/80 bg-white p-6
          shadow-xl shadow-gray-900/5
          sm:p-9
          dark:border-gray-800 dark:bg-gray-900
          dark:shadow-black/20
        "
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-elf/10 ring-1 ring-elf/15 dark:bg-elf/15">
            <Image
              src="/images/logo.png"
              alt="لوگوی آموزشگاه موسیقی چهارباغ"
              width={52}
              height={52}
              className="size-13 object-contain"
              priority
            />
          </div>

          <p className="text-xs font-semibold text-elf">
            آموزشگاه موسیقی چهارباغ
          </p>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            ورود به حساب کاربری
          </h1>

          <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
            برای ادامه، شماره موبایل و رمز عبور خود را وارد کنید.
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
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />

              <input
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="tel"
                autoComplete="username"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="09123456789"
                required
                disabled={loading}
                aria-invalid={Boolean(formData.mobile) && !isValidMobile(mobile)}
                className="
                  w-full rounded-xl border border-gray-200
                  bg-gray-50 py-3.5 pe-11 ps-4 text-sm
                  outline-none transition
                  placeholder:text-gray-400
                  focus:border-elf focus:bg-white
                  focus:ring-4 focus:ring-elf/10
                  disabled:cursor-not-allowed disabled:opacity-60
                  dark:border-gray-700 dark:bg-gray-950
                  dark:focus:bg-gray-950
                "
              />
            </div>

            {formData.mobile && !isValidMobile(mobile) && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                شماره موبایل را با فرمت ۱۱ رقمی وارد کنید.
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="text-sm font-semibold"
              >
                رمز عبور
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-elf transition hover:underline"
              >
                فراموشی رمز عبور
              </Link>
            </div>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="رمز عبور خود را وارد کنید"
                required
                disabled={loading}
                className="
                  w-full rounded-xl border border-gray-200
                  bg-gray-50 py-3.5 pe-11 ps-12 text-sm
                  outline-none transition
                  placeholder:text-gray-400
                  focus:border-elf focus:bg-white
                  focus:ring-4 focus:ring-elf/10
                  disabled:cursor-not-allowed disabled:opacity-60
                  dark:border-gray-700 dark:bg-gray-950
                  dark:focus:bg-gray-950
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "مخفی کردن رمز عبور"
                    : "نمایش رمز عبور"
                }
                className="
                  absolute left-2 top-1/2 flex size-9
                  -translate-y-1/2 items-center justify-center
                  rounded-lg text-gray-400 transition
                  hover:bg-gray-100 hover:text-gray-700
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-elf/50
                  dark:hover:bg-gray-800 dark:hover:text-gray-200
                "
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="
                rounded-xl border border-red-200
                bg-red-50 px-4 py-3 text-sm leading-6
                text-red-700
                dark:border-red-900/60 dark:bg-red-950/30
                dark:text-red-300
              "
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="
              flex min-h-12 w-full items-center justify-center
              gap-2 rounded-xl bg-elf px-5 py-3.5
              text-sm font-bold text-white
              shadow-lg shadow-elf/15 transition
              hover:brightness-95
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-elf/50 focus-visible:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-40
              disabled:shadow-none
              dark:focus-visible:ring-offset-gray-900
            "
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                <span>در حال ورود...</span>
              </>
            ) : (
              <>
                <span>ورود به حساب کاربری</span>
                <ArrowLeft size={17} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-gray-50 px-4 py-4 text-center dark:bg-gray-950">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            حساب کاربری ندارید؟{" "}
            <Link
              href="/register"
              className="font-bold text-elf underline-offset-4 transition hover:underline"
            >
              ثبت نام کنید
            </Link>
          </p>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center dark:border-gray-800">
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
