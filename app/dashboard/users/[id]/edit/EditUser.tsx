"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowRight, AlertCircle } from "lucide-react";
import Loading from "@/app/loading";
import { fetchUser } from "@/lib/requests";
import { apiFetch, ApiError } from "@/lib/apiFetch";
import { validateForm } from "@/lib/ValidateForm";
import { IUserDetailsBase } from "@/lib/types";
import UserForm, { UserFormValues, INationalityOption} from "@/app/ui/components/UserForm";

const INITIAL_FIELDS: UserFormValues = {
  firstName: "",
  lastName: "",
  mobile: "",
  nationalIdentificationNumber: "",
  email: "",
  birthDate: "",
  gender: 0,
  address: "",
  bio: "",
  nationalityId: "",
};

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<IUserDetailsBase | null>(null);
  const [nationalities, setNationalities] = useState<INationalityOption[]>([]);
  const [fields, setFields] = useState<UserFormValues>(INITIAL_FIELDS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      if (!id) {
        setError("شناسه کاربر معتبر نیست.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [userData, nationalityData] = await Promise.all([
          fetchUser(id, controller.signal),
          apiFetch<INationalityOption[]>("/api/nationalities", {
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) return;

        const account = userData.user;
        setUser(account);
        setNationalities(nationalityData);

        setFields({
          firstName: account.firstName ?? "",
          lastName: account.lastName ?? "",
          mobile: account.mobile ?? "",
          nationalIdentificationNumber:
            account.nationalIdentificationNumber ?? "",
          email: account.email ?? "",
          birthDate: toDateInputValue(account.birthDate),
          gender: Number(account.gender ?? 0),
          address: account.address ?? "",
          bio: account.bio ?? "",
          nationalityId:
            account.nationality?.id ?? "",
        });
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Error loading user edit page:", err);

        setError(
          "دریافت اطلاعات کاربر یا فهرست ملیت‌ها با خطا مواجه شد."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => controller.abort();
  }, [id, retryKey]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFields((previous) => ({
      ...previous,
      [name]: name === "gender" ? Number(value) : value,
    }));
  };

  const handleBirthDateChange = (gregorianDate: string) => {
    setFields((previous) => ({
      ...previous,
      birthDate: gregorianDate,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !id || saving) return;

    if (
      !validateForm(
        fields.nationalIdentificationNumber,
        fields.mobile,
        fields.email
      )
    ) {
      return;
    }

    if (
      !fields.nationalityId ||
      !nationalities.some(
        (nationality) => nationality.id === fields.nationalityId
      )
    ) {
      toast.error("لطفاً ملیت معتبر را انتخاب کنید.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        id,
        firstName: fields.firstName.trim(),
        lastName: fields.lastName.trim(),
        mobile: fields.mobile.trim(),
        email: fields.email.trim() || null,
        nationalityId: fields.nationalityId,
        nationalIdentificationNumber:fields.nationalIdentificationNumber.trim(),
        birthDate: fields.birthDate || null ,
        gender: fields.gender,
        address: fields.address.trim() || null,
        bio: fields.bio.trim() || null,
        profileImageUrl: user.profileImageUrl ?? null,
      };

      await apiFetch<void>(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      toast.success("اطلاعات کاربر با موفقیت ویرایش شد.");

      router.push(`/dashboard/users/${id}`);
      router.refresh();
    } catch (err) {
      console.error("Error updating user:", err);

      if (err instanceof ApiError && err.status === 409) {
        toast.error("این شماره ملی قبلاً ثبت شده است.");
        return;
      }

      if (err instanceof ApiError && err.status === 400) {
        toast.error(err.message || "اطلاعات ارسال‌شده معتبر نیست.");
        return;
      }

      toast.error(
        err instanceof ApiError
          ? err.message
          : "ویرایش اطلاعات کاربر با خطا مواجه شد."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  if (error || !user) {
    return (
      <main
        dir="rtl"
        className="flex min-h-[60vh] items-center justify-center px-4"
      >
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />

          <h1 className="font-DanaDemiBold text-lg text-gray-900 dark:text-white">
            خطا در دریافت اطلاعات
          </h1>

          <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
            {error ?? "کاربر موردنظر پیدا نشد."}
          </p>

          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm text-white hover:bg-blue-700"
          >
            تلاش مجدد
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>کاربران</span>
              <span>/</span>
              <span>ویرایش کاربر</span>
            </div>

            <h1 className="font-MorabbaMedium text-2xl text-gray-900 dark:text-white sm:text-3xl">
              ویرایش مشخصات کاربر
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              اطلاعات شخصی و ملیت کاربر را ویرایش کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/dashboard/users/${id}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowRight size={17} />
            بازگشت به پروفایل
          </button>
        </header>

        <UserForm
          fields={fields}
          nationalities={nationalities}
          createdAt={user.createdAt}
          status={user.status}
          loading={saving}
          handleChange={handleChange}
          handleBirthDateChange={handleBirthDateChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </main>
  );
};

function toDateInputValue(
  value: string | Date | null | undefined
): string {
  if (!value) return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateOnly) {
    return dateOnly[0];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default EditUser;