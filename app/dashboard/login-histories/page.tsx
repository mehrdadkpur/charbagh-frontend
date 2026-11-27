"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { ShamsiDate } from "@/lib/shamsiDate";
import { RefreshCw, Search, ShieldCheck, ShieldAlert } from "lucide-react";

type LoginHistory = {
  id: string; userId: string; userFullName: string; mobile: string;
  loginAt: string; logoutAt: string | null; isSuccessful: boolean;
  failureReason: string | null; ipAddress: string | null;
  userAgent: string | null; deviceName: string | null;
};

const dateText = (value: string) => {
  try { return ShamsiDate(value); } catch { return new Date(value).toLocaleString("fa-IR"); }
};

export default function LoginHistoriesPage() {
  const [items, setItems] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [retry, setRetry] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const result = await apiFetch<LoginHistory[]>("/api/LoginHistories");
      setItems(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت تاریخچه ورود ناموفق بود.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load, retry]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return items.filter(item => {
      const matchesSearch = !term || [item.userFullName, item.mobile, item.ipAddress ?? ""].some(value => value.toLocaleLowerCase().includes(term));
      const matchesStatus = status === "all" || (status === "success" ? item.isSuccessful : !item.isSuccessful);
      return matchesSearch && matchesStatus;
    });
  }, [items, search, status]);

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1600px] space-y-5 px-3 py-6 sm:px-5 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">تاریخچه ورود کاربران</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">بررسی نشست‌ها، زمان ورود و خروج و مشخصات دستگاه کاربران</p></div>
        <button onClick={() => setRetry(x => x + 1)} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm dark:border-gray-700"><RefreshCw size={16} className={loading ? "animate-spin" : ""}/>بروزرسانی</button>
      </header>
      <section className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-[1fr_190px]">
        <label className="relative"><Search size={16} className="absolute right-3 top-3 text-gray-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو بر اساس نام، موبایل یا IP" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-9 pl-3 text-sm dark:border-gray-700 dark:bg-gray-950"/></label>
        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-950"><option value="all">همه ورودها</option><option value="success">ورود موفق</option><option value="failed">ورود ناموفق</option></select>
      </section>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
      {loading ? <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">در حال دریافت اطلاعات...</div>
      : filtered.length === 0 ? <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">رکوردی مطابق فیلترها پیدا نشد.</div>
      : <div className="space-y-3">
        <p className="text-xs text-gray-500">{filtered.length.toLocaleString("fa-IR")} رکورد</p>
        {filtered.map(item => <article key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="font-semibold text-gray-900 dark:text-white">{item.userFullName || "کاربر بدون نام"}</h2><p dir="ltr" className="mt-1 text-right text-xs text-gray-500">{item.mobile}</p></div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${item.isSuccessful ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300"}`}>{item.isSuccessful ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>} {item.isSuccessful ? "ورود موفق" : "ورود ناموفق"}</span>
          </div>
          <div className="mt-4 grid gap-2 border-t border-gray-100 pt-3 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-300 sm:grid-cols-2 lg:grid-cols-4">
            <p>ورود: {dateText(item.loginAt)}</p><p>خروج: {item.logoutAt ? dateText(item.logoutAt) : "هنوز خارج نشده"}</p><p>دستگاه: {item.deviceName || "نامشخص"}</p><p>IP: <span dir="ltr">{item.ipAddress || "—"}</span></p>
            {item.failureReason && <p className="text-red-600 dark:text-red-300 sm:col-span-2 lg:col-span-4">علت ناموفق بودن: {item.failureReason}</p>}
          </div>
        </article>)}
      </div>}
    </main>
  );
}
