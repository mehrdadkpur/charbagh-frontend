"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Plus, Search, UsersRound, X, RefreshCw } from "lucide-react";
import { fetchUsers } from "@/lib/requests";
import type { IUser } from "@/lib/types";
import { ApiError } from "@/helper/ApiError";
import UserAvatar from "@/app/ui/components/UserAvatar";
import UserStatusBadge from "@/app/ui/components/UserStatusBadge";
import UsersPagination from "@/app/ui/components/UsersPagination";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "all", label: "همه وضعیت‌ها" },
  { value: "0", label: "در انتظار تأیید" },
  { value: "1", label: "فعال" },
  { value: "2", label: "معلق" },
  { value: "3", label: "غیرفعال" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await fetchUsers());
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "نشست شما منقضی شده است. دوباره وارد شوید."
          : err instanceof Error
            ? err.message
            : "دریافت فهرست کاربران ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadUsers(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("fa");
    return users.filter((user) => {
      const matchesStatus = status === "all" || String(user.status) === status;
      const matchesQuery = !q || [
        user.firstName, user.lastName, user.email,
        user.nationalIdentificationNumber,
      ].some((value) => String(value ?? "").toLocaleLowerCase("fa").includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [users, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage((current) => Math.min(current, totalPages)); }, [totalPages]);

  const resetFilters = () => { setQuery(""); setStatus("all"); setPage(1); };

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1600px] space-y-6 px-3 pb-8 sm:px-5 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/dashboard" className="hover:text-elf">داشبورد</Link>
            <span>/</span><span className="text-gray-800 dark:text-gray-200">کاربران</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-elf/10 text-elf dark:text-emerald-300"><UsersRound size={24} /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مدیریت کاربران</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">فهرست کاربران و دسترسی به پرونده کامل هر کاربر</p>
            </div>
          </div>
        </div>
        <Link href="/dashboard/users/add" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white hover:bg-elf/90"><Plus size={18} />افزودن کاربر</Link>
      </header>

      <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <label className="relative block">
            <span className="sr-only">جست‌وجوی کاربران</span>
            <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="نام، نام خانوادگی، ایمیل یا کد ملی..." className="h-11 w-full rounded-xl border border-gray-200 bg-white pr-10 pl-10 text-sm outline-none focus:border-elf focus:ring-4 focus:ring-elf/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
            {query && <button type="button" onClick={() => { setQuery(""); setPage(1); }} aria-label="پاک کردن جست‌وجو" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={16} /></button>}
          </label>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-elf dark:border-gray-700 dark:bg-gray-950 dark:text-white">
            {STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        {(query || status !== "all") && <button type="button" onClick={resetFilters} className="mt-3 inline-flex items-center gap-1 text-xs text-elf hover:underline"><X size={14} />حذف فیلترها</button>}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">فهرست کاربران</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length.toLocaleString("fa-IR")} کاربر</span>
        </div>
        {loading ? (
          <div className="space-y-3 p-5">{Array.from({length:5}).map((_,i)=><div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />)}</div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <AlertCircle className="text-red-500" size={28} /><p className="text-sm text-gray-600 dark:text-gray-300">{error}</p>
            <button type="button" onClick={() => void loadUsers()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm dark:border-gray-700"><RefreshCw size={15} />تلاش دوباره</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <UsersRound className="mx-auto text-gray-400" size={30} />
            <p className="mt-3 font-semibold text-gray-800 dark:text-white">{users.length ? "کاربری با این مشخصات پیدا نشد" : "هنوز کاربری ثبت نشده است"}</p>
            <p className="mt-1 text-sm text-gray-500">عبارت جست‌وجو یا فیلتر وضعیت را تغییر دهید.</p>
            {users.length > 0 && <button type="button" onClick={resetFilters} className="mt-3 text-sm text-elf">پاک کردن فیلترها</button>}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[680px] text-right">
                <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-800/60 dark:text-gray-400"><tr><th className="px-5 py-4">کاربر</th><th className="px-5 py-4">ایمیل</th><th className="px-5 py-4">کد ملی</th><th className="px-5 py-4">وضعیت</th></tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {pageUsers.map((user) => <tr key={user.id} className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-5 py-4"><Link href={`/dashboard/users/${user.id}`} className="flex items-center gap-3 font-semibold text-gray-900 hover:text-elf dark:text-white"><UserAvatar firstName={user.firstName} lastName={user.lastName} imageUrl={user.profileImageUrl} /><span>{user.firstName} {user.lastName}</span></Link></td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300" dir="ltr">{user.email || "—"}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{user.nationalIdentificationNumber || "—"}</td>
                    <td className="px-5 py-4"><UserStatusBadge status={user.status} /></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-4 md:hidden">
              {pageUsers.map((user) => <Link key={user.id} href={`/dashboard/users/${user.id}`} className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-elf/40 dark:border-gray-700">
                <UserAvatar firstName={user.firstName} lastName={user.lastName} imageUrl={user.profileImageUrl} size="lg" />
                <div className="min-w-0 flex-1"><p className="truncate font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p><p dir="ltr" className="mt-1 truncate text-left text-xs text-gray-500">{user.email || "ایمیل ثبت نشده"}</p><p className="mt-1 text-xs text-gray-500">کد ملی: {user.nationalIdentificationNumber || "—"}</p></div>
                <UserStatusBadge status={user.status} />
              </Link>)}
            </div>
            <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
              <UsersPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
