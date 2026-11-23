"use client";

import Link from "next/link";
import type { ReactNode, ChangeEvent, FormEvent } from "react";
import {
  CalendarDays,
  CreditCard,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";

import ShamsiDatePicker from "./ShamsiDatePicker";
import StatusBadge from "@/app/ui/components/UserStatusBadge";
import { ShamsiDate } from "@/lib/shamsiDate";

export interface INationalityOption {
  id: string;
  persianCountryName: string;
  englishCountryName: string;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  mobile: string;
  nationalIdentificationNumber: string;
  email: string;
  birthDate: string;
  gender: number;
  address: string;
  bio: string;
  nationalityId: string;
}

interface UserFormProps {
    fields: UserFormValues;
    nationalities: INationalityOption[];
    loading: boolean;

    handleChange: (
        event: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => void;

    handleBirthDateChange: (date: string) => void;

    handleSubmit: (
        event: FormEvent<HTMLFormElement>
    ) => void;
}

const EMPTY_VALUE = "ثبت نشده است";

const inputClassName =
  "h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500";

const UserForm = ({
  fields,
  nationalities,
  createdAt,
  status,
  loading,
  handleChange,
  handleBirthDateChange,
  handleSubmit,
}: UserFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account summary */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-DanaDemiBold text-base text-gray-900 dark:text-white">
              وضعیت حساب کاربری
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              وضعیت فعلی حساب از این بخش فقط قابل مشاهده است.
            </p>
          </div>

          <StatusBadge status={status} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField
            icon={<CalendarDays size={17} />}
            label="تاریخ ثبت‌نام"
            value={formatDate(createdAt)}
          />

          <ReadOnlyField
            icon={<Globe size={17} />}
            label="ملیت فعلی"
            value={
              nationalities.find(
                (item) => item.id === fields.nationalityId
              )?.persianCountryName ?? EMPTY_VALUE
            }
          />
        </div>
      </section>

      {/* Personal details */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
        <SectionHeading
          icon={<UserRound size={20} />}
          title="اطلاعات شخصی"
          description="مشخصات هویتی و اطلاعات تماس کاربر"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="نام" required>
            <input
              name="firstName"
              value={fields.firstName}
              onChange={handleChange}
              className={inputClassName}
              placeholder="نام کاربر"
              autoComplete="given-name"
              required
            />
          </FormField>

          <FormField label="نام خانوادگی" required>
            <input
              name="lastName"
              value={fields.lastName}
              onChange={handleChange}
              className={inputClassName}
              placeholder="نام خانوادگی"
              autoComplete="family-name"
              required
            />
          </FormField>

          <FormField label="شماره موبایل" required>
            <div className="relative">
              <Phone
                size={17}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                name="mobile"
                value={fields.mobile}
                onChange={handleChange}
                className={`${inputClassName} pr-11`}
                placeholder="شماره موبایل"
                autoComplete="tel"
                dir="ltr"
                required
              />
            </div>
          </FormField>

          <FormField label="ایمیل">
            <div className="relative">
              <Mail
                size={17}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                name="email"
                value={fields.email}
                onChange={handleChange}
                className={`${inputClassName} pr-11`}
                placeholder="example@email.com"
                autoComplete="email"
                dir="ltr"
              />
            </div>
          </FormField>

          <FormField label="شماره ملی">
            <div className="relative">
              <CreditCard
                size={17}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                name="nationalIdentificationNumber"
                value={fields.nationalIdentificationNumber}
                onChange={handleChange}
                className={`${inputClassName} pr-11`}
                placeholder="شماره ملی"
                dir="ltr"
              />
            </div>
          </FormField>

          <FormField label="جنسیت" required>
            <select
              name="gender"
              value={fields.gender}
              onChange={handleChange}
              className={inputClassName}
              required
            >
              <option value={0}>خانم</option>
              <option value={1}>آقا</option>
              <option value={2}>سایر</option>
              <option value={3}>نامشخص</option>
            </select>
          </FormField>

          <FormField label="تاریخ تولد">
            <ShamsiDatePicker
              initialDate={fields.birthDate || null}
              onChange={handleBirthDateChange}
            />
          </FormField>

          <FormField label="ملیت">
            <select
              name="nationalityId"
              value={fields.nationalityId}
              onChange={handleChange}
              className={inputClassName}
            >
              <option value="">انتخاب ملیت</option>

              {nationalities.map((nationality) => (
                <option key={nationality.id} value={nationality.id}>
                  {nationality.persianCountryName}
                  {nationality.englishCountryName
                    ? ` (${nationality.englishCountryName})`
                    : ""}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="آدرس" fullWidth>
            <div className="relative">
              <MapPin
                size={17}
                className="absolute right-4 top-4 text-gray-400"
              />

              <textarea
                name="address"
                value={fields.address}
                onChange={handleChange}
                rows={3}
                className={`${inputClassName} h-auto resize-y py-3 pr-11`}
                placeholder="آدرس کاربر"
              />
            </div>
          </FormField>

          <FormField label="بیوگرافی" fullWidth>
            <div className="relative">
              <FileText
                size={17}
                className="absolute right-4 top-4 text-gray-400"
              />

              <textarea
                name="bio"
                value={fields.bio}
                onChange={handleChange}
                rows={4}
                className={`${inputClassName} h-auto resize-y py-3 pr-11`}
                placeholder="توضیحات تکمیلی درباره کاربر"
              />
            </div>
          </FormField>
        </div>
      </section>

      {/* Form actions */}
      <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-end dark:border-gray-800 dark:bg-gray-900/95">
        <Link
          href="/dashboard/users"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 text-sm font-DanaMedium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <X size={17} />
          انصراف
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-DanaMedium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />
          {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
};

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-gray-100 pb-5 dark:border-gray-800">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
        {icon}
      </div>

      <div>
        <h2 className="font-DanaDemiBold text-base text-gray-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function FormField({
  label,
  required = false,
  fullWidth = false,
  children,
}: {
  label: string;
  required?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`min-w-0 space-y-2 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <label className="block text-sm font-DanaMedium text-gray-700 dark:text-gray-200">
        {label}
        {required && <span className="mr-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}

function ReadOnlyField({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-950/50">
      <div className="mt-0.5 text-gray-400">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>

        <p className="mt-2 wrap-break-word text-sm font-DanaMedium text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return EMPTY_VALUE;

  try {
    return ShamsiDate(
      value instanceof Date ? value.toISOString() : value
    );
  } catch {
    return EMPTY_VALUE;
  }
}

export default UserForm;