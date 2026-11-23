"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/apiFetch";

import StaffForm from "@/app/ui/components/StaffForm";

import type {ICreateStaffRequest, IStaff,IUser} from "@/lib/types";
import { apiFetch } from "@/lib/apiFetch";
import toast from "react-hot-toast";

type UserWithNationalCode = IUser & {
  nationalCode?: string | null;
};

function normalizeNationalCode(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    )
    .replace(/\D/g, "")
    .slice(0, 10);
}

export async function getUserByNationalCode(
  nationalCode: string
): Promise<IUser> {
  return apiFetch<IUser>(
    `/api/users/${encodeURIComponent(nationalCode)}`
  );
}

export default function AddStaffPage() {
  const router = useRouter();

  const [nationalCode, setNationalCode] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithNationalCode | null>(null);

  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchError, setSearchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNationalCodeChange = (event: React.ChangeEvent<HTMLInputElement> ) => {
    setNationalCode(normalizeNationalCode(event.target.value));
    setSelectedUser(null);
    setSearchError(null);
    setSubmitError(null);
  };

  const handleSearch = async () => {
    if (nationalCode.length !== 10) {
      setSearchError("کد ملی باید دقیقاً ۱۰ رقم باشد.");
      return;
    }

    setSearching(true);
    setSearchError(null);
    setSubmitError(null);
    setSelectedUser(null);

    try {
      const user = await getUserByNationalCode(nationalCode);      

      if (!user.nationalIdentificationNumber?.trim()) {
        setSearchError(
          "این کاربر کد ملی ندارد و امکان انتخاب او برای ایجاد کارمند وجود ندارد."
        );
        return;
      }

      setSelectedUser(user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setSearchError("کاربری با این کد ملی پیدا نشد.");
      } else {
        setSearchError(
          error instanceof Error
            ? error.message
            : "در جستجوی کاربر خطایی رخ داد."
        );
      }
    } finally {
      setSearching(false);
    }
  };
const handleCreateStaff = async (values: ICreateStaffRequest) => {
  try {
    const payload = {
      userId: values.userId,
      employmentDate: values.employmentDate,
      employmentType:values.employmentType
    };

    await apiFetch<IStaff>("/api/Staffs", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    toast.success("کارمند با موفقیت ثبت شد.");

    router.push("/dashboard/staffs");
    router.refresh();
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      toast.error("این کاربر قبلاً به‌عنوان کارمند ثبت شده است.");
    } else {
      toast.error(
        error instanceof Error
          ? error.message
          : "ثبت کارمند ناموفق بود."
      );
    }

    throw error;
  }
};

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          ایجاد کارمند جدید
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          ابتدا کاربر موردنظر را با کد ملی پیدا کنید، سپس اطلاعات
          حرفه‌ای کارمند را ثبت کنید.
        </p>
      </div>

      {/* National Code Search */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            جستجوی کاربر
          </h2>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            فقط کاربرانی که کد ملی معتبر دارند قابل انتخاب هستند.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-xs">
            <label
              htmlFor="nationalCode"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              کد ملی
            </label>

            <input
              id="nationalCode"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              dir="ltr"
              maxLength={10}
              value={nationalCode}
              onChange={handleNationalCodeChange}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  nationalCode.length === 10 &&
                  !searching
                ) {
                  void handleSearch();
                }
              }}
              placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-center tracking-widest text-gray-900 outline-none transition placeholder:tracking-normal placeholder:text-gray-400 focus:border-elf-500 focus:ring-2 focus:ring-elf-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            <div className="mt-1.5 flex justify-between text-xs text-gray-400">
              <span>۱۰ رقم</span>
              <span dir="ltr">{nationalCode.length}/10</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || nationalCode.length !== 10}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-elf px-6 text-sm font-medium text-white transition hover:bg-elf-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {searching ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                در حال جستجو...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
                جستجو
              </>
            )}
          </button>
        </div>

        {searchError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
            {searchError}
          </div>
        )}
      </section>

      {/* Selected User */}
      {selectedUser && (
        <section className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>

            <h2 className="font-semibold text-green-800 dark:text-green-300">
              کاربر پیدا شد
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                نام و نام خانوادگی
              </p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400">
                کد ملی
              </p>
              <p
                dir="ltr"
                className="mt-1 text-right font-medium text-gray-900 dark:text-white"
              >
                {selectedUser.nationalIdentificationNumber}
              </p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400">
                شماره موبایل
              </p>
              <p
                dir="ltr"
                className="mt-1 text-right font-medium text-gray-900 dark:text-white"
              >
                {selectedUser.mobile}
              </p>
            </div>

            {selectedUser.email && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  ایمیل
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {selectedUser.email}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Staff Form */}
      {selectedUser && (
        <section className="space-y-4">
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
              {submitError}
            </div>
          )}

          <StaffForm
            mode="create"
            selectedUser={selectedUser}
            onSubmit={handleCreateStaff}
          />

          {saving && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              در حال ثبت اطلاعات کارمند...
            </p>
          )}
        </section>
      )}
    </div>
  );
}