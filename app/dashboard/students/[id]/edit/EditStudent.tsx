"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  LoaderCircle,
  Save,
} from "lucide-react";

import { apiFetch } from "@/lib/apiFetch";
import { ApiError } from "@/helper/ApiError";
import type { IStudent } from "@/lib/types";
import ShamsiDatePicker from "@/app/ui/components/ShamsiDatePicker";

interface EditStudentProps {
  studentId: string;
}

interface UpdateStudentRequest {
  id:string;
  userId: string;
  registrationDate: string;
}

export default function EditStudent({ studentId }: EditStudentProps) {
  const router = useRouter();

  const [student, setStudent] = useState<IStudent | null>(null);
  const [registrationDate, setRegistrationDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStudent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<IStudent>(
        `/api/students/${studentId}`
      );

      setStudent(data);
      setRegistrationDate(data.registrationDate ?? "");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "نشست شما منقضی شده است. دوباره وارد شوید."
          : err instanceof Error
            ? err.message
            : "دریافت اطلاعات هنرآموز ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadStudent();
  }, [loadStudent]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!student || !registrationDate || saving) return;

    setSaving(true);

    try {
      const payload: UpdateStudentRequest = {
        id: student.id,
        userId: student.userId,
        registrationDate,
      };

      await apiFetch<unknown>(`/api/student/${student.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      await Swal.fire({
        title: "ذخیره شد",
        text: "تاریخ استخدام هنرآموز با موفقیت ویرایش شد.",
        icon: "success",
        confirmButtonText: "متوجه شدم",
        buttonsStyling: false,
        customClass: {
          popup:
            "rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900",
          title: "text-lg font-semibold dark:text-white",
          htmlContainer: "text-sm dark:text-gray-300",
          confirmButton:
            "rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white",
        },
      });

      router.push(`/dashboard/students/${student.id}`);
      router.refresh();
    } catch (err) {
      await Swal.fire({
        title: "ذخیره اطلاعات ناموفق بود",
        text:
          err instanceof ApiError && err.status === 401
            ? "نشست شما منقضی شده است. دوباره وارد شوید."
            : err instanceof Error
              ? err.message
              : "هنگام ویرایش اطلاعات خطایی رخ داد.",
        icon: "error",
        confirmButtonText: "متوجه شدم",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-80 items-center justify-center"
      >
        <LoaderCircle className="animate-spin text-elf" size={32} />
      </div>
    );
  }

  if (error || !student) {
    return (
      <section
        dir="rtl"
        className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
      >
        <AlertCircle className="mx-auto text-red-500" size={32} />

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          {error ?? "هنرآموز موردنظر پیدا نشد."}
        </p>

        <button
          type="button"
          onClick={() => void loadStudent()}
          className="mt-5 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white"
        >
          تلاش مجدد
        </button>
      </section>
    );
  }

  return (
    <section
      dir="rtl"
      className="mx-auto w-full max-w-4xl space-y-6 px-3 pb-8 sm:px-5 lg:px-8"
    >
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/dashboard" className="transition hover:text-elf">
          داشبورد
        </Link>

        <span>/</span>

        <Link
          href="/dashboard/students"
          className="transition hover:text-elf"
        >
          هنرآموز‌ها
        </Link>

        <span>/</span>

        <Link
          href={`/dashboard/students/${student.id}`}
          className="transition hover:text-elf"
        >
          {student.firstName} {student.lastName}
        </Link>

        <span>/</span>

        <span className="text-gray-700 dark:text-gray-200">
          ویرایش
        </span>
      </div>

      <header>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          ویرایش اطلاعات هنرآموز
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {student.firstName} {student.lastName}
          <span className="mx-2">·</span>
          کد هنرآموزی: {student.studentCode}
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="border-b border-gray-100 p-4 dark:border-gray-800 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-elf/10 text-elf dark:text-emerald-300">
              <CalendarDays size={19} />
            </div>

            <h2 className="font-semibold text-gray-900 dark:text-white">
              اطلاعات ثبت نام
            </h2>
          </div>

          <div className="max-w-md">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              تاریخ ثبت نام
              <span className="mr-1 text-red-500">*</span>
            </label>

            <ShamsiDatePicker
              initialDate={registrationDate || null}
              onChange={setRegistrationDate}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 bg-gray-50/70 p-4 dark:bg-gray-950/40 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <Link
            href={`/dashboard/students/${student.id}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowRight size={17} />
            بازگشت
          </Link>

          <button
            type="submit"
            disabled={saving || !registrationDate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-elf px-6 text-sm font-semibold text-white transition hover:bg-elf-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}

            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </form>
    </section>
  );
}