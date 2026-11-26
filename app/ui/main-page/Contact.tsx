"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/config";

interface ContactForm {
  fullName: string;
  mobile: string;
}

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[\s-]/g, "");
}

export default function Contact() {
  const [fields, setFields] = useState<ContactForm>({ fullName: "", mobile: "" });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mobile = normalizeDigits(fields.mobile);

    if (!fields.fullName.trim()) {
      toast.error("لطفاً نام و نام خانوادگی خود را وارد کنید.");
      return;
    }
    if (!/^09\d{9}$/.test(mobile)) {
      toast.error("شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.");
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ fullName: fields.fullName.trim(), mobile }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.detail || payload?.title || "ثبت درخواست با مشکل مواجه شد. لطفاً دوباره تلاش کنید.";
        throw new Error(message);
      }

      toast.success("درخواست شما ثبت شد؛ در فرصت مناسب با شما تماس می‌گیریم.");
      setFields({ fullName: "", mobile: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در ارسال درخواست.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-elf dark:bg-gray-900">
      <Image src="/images/shapes/wave-5.png" alt="" width={1920} height={169} className="block w-full dark:hidden" />
      <Image src="/images/shapes/wave-5-dark-2.png" alt="" width={1920} height={169} className="hidden w-full dark:block" />
      <div className="container mx-auto px-4 py-12">
        <div className="relative z-10 flex flex-col items-center gap-10">
          <div className="max-w-2xl text-center">
            <span className="font-Dana text-sm text-amber-400">مشاوره و راهنمایی</span>
            <h2 className="mt-4 text-2xl font-DanaDemiBold leading-relaxed text-white md:text-3xl lg:text-4xl">
              برای آشنایی بیشتر با دوره‌ها و انتخاب مسیر یادگیری موسیقی، درخواست تماس خود را ثبت کنید.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/75">
              نام و شماره موبایل خود را وارد کنید تا کارشناسان آموزشگاه با شما تماس بگیرند.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full max-w-4xl flex-col items-center justify-center gap-4 md:flex-row">
            <label className="w-full md:w-[300px]">
              <span className="sr-only">نام و نام خانوادگی</span>
              <input
                name="fullName"
                type="text"
                autoComplete="name"
                value={fields.fullName}
                onChange={handleChange}
                required
                maxLength={120}
                placeholder="نام و نام خانوادگی"
                className="h-14 w-full rounded-full bg-white px-6 text-base text-gray-800 outline-none transition focus:ring-2 focus:ring-amber-400 dark:bg-gray-800 dark:text-gray-100"
              />
            </label>
            <label className="w-full md:w-[300px]">
              <span className="sr-only">شماره موبایل</span>
              <input
                name="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                value={fields.mobile}
                onChange={handleChange}
                required
                maxLength={13}
                placeholder="09123456789"
                className="h-14 w-full rounded-full bg-white px-6 text-left text-base text-gray-800 outline-none transition focus:ring-2 focus:ring-amber-400 dark:bg-gray-800 dark:text-gray-100"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-mango px-8 py-3 font-DanaMedium text-gray-900 transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-elf dark:text-white dark:hover:bg-mango"
            >
              {submitting ? "در حال ارسال..." : "درخواست تماس"}
            </button>
          </form>
        </div>
        <Image src="/images/Music-2.png" alt="" width={300} height={300} className="pointer-events-none absolute right-5 top-10 w-1/4 rotate-12 opacity-10" />
      </div>
      <Image src="/images/shapes/footer-1.png" alt="" width={1920} height={134} className="w-full" />
    </section>
  );
}
