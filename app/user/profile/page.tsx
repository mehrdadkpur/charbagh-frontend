'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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
} from '@heroicons/react/24/outline';

import StatusBadge from '@/app/ui/components/UserStatusBadge';
import AuthGuard from '@/app/ui/components/AuthGurad';
import Loading from '@/app/loading';

import { IUser } from '@/lib/types';
import { API_BASE_URL } from '@/lib/config';
import { getUserGender } from '@/helper/UserGender';
import { UserRoleDisplay } from '@/helper/UserRoleDisplay';
import { ShamsiDate } from '@/lib/shamsiDate';

export default function ProfileDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<IUser | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('کاربر وارد نشده است.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/Profile/current`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (res.status === 401) {
          setError('توکن نامعتبر است یا کاربر وارد نشده است.');
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error('خطا در دریافت اطلاعات کاربر');
        }

        const data = await res.json();
        const fetchedUser: IUser = data.user;
        setUser(fetchedUser);

        const img = fetchedUser?.user_img
          ? `${API_BASE_URL}${fetchedUser.user_img}`
          : `${API_BASE_URL}/uploads/images/profiles/avatar.jpg`;
        setProfileImage(img);
      } catch (err) {
        if ((err as any).name === 'AbortError') return;
        console.error('Error fetching user:', err);
        setError('خطا در دریافت اطلاعات کاربر');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (profileImage) {
      setCurrentImage(profileImage);
    } else if (user?.user_img) {
      setCurrentImage(`${API_BASE_URL}${user.user_img}`);
    } else {
      setCurrentImage(`${API_BASE_URL}/uploads/images/profiles/avatar.jpg`);
    }
  }, [profileImage, user]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      await fetch(`${API_BASE_URL}/api/logout`, { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/');
    }
  };

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon?: React.ReactNode;
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-200 shadow-sm">
        {icon ?? <UserIcon className="w-5 h-5" />}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-gray-500 dark:text-gray-300">{label}</div>
        <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{value ?? '-'}</div>
      </div>
    </div>
  );

  if (loading) return <Loading />;

  if (error)
    return <div className="text-center mt-20 text-red-600">{error}</div>;

  if (!user) return <div className="text-center mt-20 text-gray-600">کاربر یافت نشد</div>;

  console.log(user);
  
  return (
    <div className="w-full container mt-4">
      <AuthGuard />
      {/* Header card */}
      <div className="bg-transparent mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 transform -translate-y-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-28 h-28 rounded-full ring-2 ring-white dark:ring-gray-900 overflow-hidden bg-gray-100 shadow">
              <Image
                width={128}
                height={128}
                src={currentImage || `${API_BASE_URL}/uploads/images/profiles/avatar.jpg`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
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
              <Link
                href={`/user/profile/${user.id}/Edit-profile`}
                className="inline-flex items-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-md text-sm shadow-sm hover:bg-sky-700"
                aria-label="ویرایش پروفایل"
              >
                <PencilIcon className="w-4 h-4" />
                ویرایش پروفایل
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-500 text-white dark:text-gray-300 rounded-md text-sm border border-transparent hover:bg-red-700 dark:hover:bg-gray-800"
                aria-label="خروج"
              >
                <ArrowRightCircleIcon className="w-4 h-4" />
                خروج
              </button>
            </div>
          </div>

          {/* Blogs shortcuts */}
          <div className="mt-5 flex gap-3 overflow-x-auto py-1">
            <Link
              href={`/user/profile/${user.id}/blogs`}
              className="flex flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-300 gap-1 p-3 min-w-[140px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm"
            >
              پست های من
            </Link>
            <Link
              href={`/user/profile/${user.id}/courses`}
              className="flex flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-300 gap-1 p-3 min-w-[140px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm"
            >
              دوره های من  
            </Link>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
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
                <span className="font-medium text-gray-800 dark:text-gray-100">{ShamsiDate(user.birthdate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-4">اطلاعات تکمیلی</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={<IdentificationIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />} label="شماره شناسایی" value={user.identity_number} />
              <InfoRow icon={<UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />} label="جنسیت" value={getUserGender(user.gender)} />
              <InfoRow icon={<CalendarDaysIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />} label="تاریخ ثبت نام" value={ShamsiDate(user.registry_date)} />
              <InfoRow icon={<BanknotesIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />} label="عضویت / نقش" value={<UserRoleDisplay roles={user.roles} />} />
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">بیوگرافی</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{user.bio || 'هیچ بیوگرافی‌ای ثبت نشده است.'}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">دوره‌ها و سازها</div>
            <div className="grid grid-cols-1 gap-3">
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
  );
}
