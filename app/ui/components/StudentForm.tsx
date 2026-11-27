"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  LoaderCircle,
  Save,
  UserRound,
} from "lucide-react";

import type { IUser, IStudent } from "@/lib/types";
import ShamsiDatePicker from "./ShamsiDatePicker";

type StudentFormValues = {
  userId: string;
  registrationDate: string;

};

type Props = {
  mode: "create" | "edit";
  selectedUser: IUser;
  student?: IStudent;
  onSubmit: (values: StudentFormValues) => Promise<void>;
};


export default function StudentForm({
  mode,
  selectedUser,
  student,
  onSubmit,
}: Props) {
  const router = useRouter();

  const [values, setValues] = useState<StudentFormValues>({
    userId: selectedUser.id,
    registrationDate: student?.registrationDate?.slice(0, 10) ?? "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const updateField = <K extends keyof StudentFormValues>(
    field: K,
    value: StudentFormValues[K]
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (
      !selectedUser.id ||
      !selectedUser.nationalIdentificationNumber?.trim()
    ) {
      setFormError("انتخاب کاربری با کد ملی ثبت‌شده الزامی است.");
      return;
    }

    if (!values.registrationDate) {
      setFormError("تاریخ ثبت‌نام را وارد کنید.");
      return;
    }
    setSubmitting(true);

    try {
      await onSubmit({
        ...values,
        userId: selectedUser.id,
      });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "ذخیره اطلاعات هنرآموز ناموفق بود."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selected user */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-elf/10 text-elf dark:text-emerald-300">
            <UserRound size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              کاربر انتخاب‌شده
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              پروفایل هنرآموز به این حساب کاربری متصل خواهد شد.
            </p>
          </div>

          <span className="mr-auto inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-400/10 dark:text-green-300">
            <CheckCircle2 size={14} />
            تأیید شده
          </span>
        </div>

        <div className="rounded-xl border border-elf/20 bg-elf/5 p-4 dark:border-elf/30 dark:bg-elf/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-elf/10 text-lg font-bold text-elf dark:text-emerald-300">
              {selectedUser.firstName?.[0] ?? ""}
              {selectedUser.lastName?.[0] ?? ""}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600 dark:text-gray-300">
                <span>
                  کد ملی:{" "}
                  <strong className="font-semibold">
                    {selectedUser.nationalIdentificationNumber}
                  </strong>
                </span>

                {selectedUser.mobile && (
                  <span>موبایل: {selectedUser.mobile}</span>
                )}

                {selectedUser.email && (
                  <span>ایمیل: {selectedUser.email}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {mode === "edit" && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            ارتباط این پروفایل با کاربر قابل تغییر نیست.
          </p>
        )}
      </section>

      {/* Student professional information */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            اطلاعات حرفه‌ای هنرآموز
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            اطلاعات ثبت نام و سوابق حرفه‌ای را وارد کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Registration date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              تاریخ ثبت نام <span className="text-red-500">*</span>
            </label>

            <ShamsiDatePicker
              initialDate={values.registrationDate}
              onChange={(date) => updateField("registrationDate", date)}
            />
          </div>
        </div>
      </section>

      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {formError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={submitting}
          className="min-h-11 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          انصراف
        </button>

        <button
          type="submit"
          disabled={
            submitting ||
            !selectedUser.nationalIdentificationNumber?.trim()
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-elf px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-elf/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}

          {mode === "create" ? "ثبت هنرآموز" : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}