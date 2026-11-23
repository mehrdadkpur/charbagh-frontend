'use client'

import { useState } from 'react'
import StatusBadge from '@/app/ui/components/UserStatusBadge'
import { IUser } from '@/lib/types'
import { getUserGender } from '@/helper/UserGender'
import { UserRoleDisplay } from '@/helper/UserRoleDisplay'
import { ShamsiDate } from '@/lib/shamsiDate'
import {
  PencilIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PhoneIcon,
  IdentificationIcon,
  UserIcon,
  EnvelopeIcon,
  ArrowRightCircleIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'

interface ProfileInfosProps {
  user: IUser
  profileImage: string
}

export default function ProfileInfos({ user, profileImage }: ProfileInfosProps) {
  const [currentImage, setCurrentImage] = useState(profileImage || user?.user_img);

  const InfoRow = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 shadow-sm">
        {icon || <UserIcon className="w-5 h-5" />}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-gray-500 dark:text-gray-300">{label}</div>
        <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{value || '-'}</div>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Centered header card */}
      <div className="bg-transparent -mt-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 transform -translate-y-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-28 h-28 rounded-full ring-2 ring-white dark:ring-gray-900 overflow-hidden bg-gray-100 shadow">
              <Image width={128} height={128} src={currentImage || '/default-avatar.png'} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-3">
                <h1 className="text-md font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                  {user.firstname} {user.lastname}
                </h1>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                  <UserRoleDisplay roles={user.roles} />
                </div>
                <StatusBadge status={user.status} />
            </div>
              <div className="mr-auto flex items-center gap-2">
                <button className="inline-flex items-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-md text-sm shadow-sm hover:bg-sky-700">
                  <PencilIcon className="w-4 h-4" />
                  ویرایش پروفایل
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-2 bg-red-500 text-white dark:text-gray-300 rounded-md text-sm border border-transparent hover:bg-red-700 dark:hover:bg-gray-800">
                  <ArrowRightCircleIcon className="w-4 h-4" />
                  خروج
                </button>
              </div>  
          </div>
          {/* Blogs */}
          <div className="mt-5 flex gap-3 overflow-x-auto py-1">
            <Link href="/user/profile/blogs" className='flex flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-300 gap-1 p-3 min-w-[140px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm'>پست های من</Link>
            <Link href="/user/profile/Add-blog" className='flex flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-300 gap-1 p-3 min-w-[140px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm'>ایجاد پست جدید </Link>
            </div>
        </div>
      </div>
      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: compact cards */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">اطلاعات تماس</div>
            <div className="flex flex-col gap-2">
              <InfoRow icon={<PhoneIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />} label="موبایل" value={user.mobile} />
              <InfoRow icon={<EnvelopeIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />} label="ایمیل" value={user.email} />
              <InfoRow icon={<MapPinIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />} label="آدرس" value={user.address} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">خلاصه</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500">شماره ملی</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">{user.nationality_number || '-'}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">تاریخ تولد</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">{ShamsiDate( user.birthdate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: detailed info full width (two cols combined) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-4">اطلاعات تکمیلی</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={<IdentificationIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />} label="شماره شناسایی" value={user.identity_number} />
              <InfoRow icon={<UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />} label="جنسیت" value={getUserGender(user.gender)} />
              <InfoRow icon={<CalendarDaysIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />} label="تاریخ ثبت نام" value={shamsiDate({ date: user.registry_date })} />
              <InfoRow icon={<BanknotesIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />} label="عضویت / نقش" value={<UserRoleDisplay roles={user.roles} />} />
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">بیوگرافی</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{user.bio || 'هیچ بیوگرافی‌ای ثبت نشده است.'}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">دوره‌ها و سازها</div>
            <div className="grid grid-col-1 md:grid-col-1 gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-2">دوره‌ها</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  {user.courses?.length ? user.courses.map((c: any) => c.course_name).join('، ') : 'دوره‌ای ثبت نام نشده'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2">سازها</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  {user.instruments?.length ? user.instruments.map((i: any) => i.instrument_name).join('، ') : 'ساز ثبت نشده'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
