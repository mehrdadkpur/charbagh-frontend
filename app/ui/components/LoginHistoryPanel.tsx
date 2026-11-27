"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { ShamsiDate } from "@/lib/shamsiDate";
import { Clock3, Laptop, MapPin, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";

type LoginHistory = {
  id: string;
  userId: string | null;
  userFullName: string | null;
  mobile: string;
  loginAt: string;
  logoutAt: string | null;
  isSuccessful: boolean;
  failureReason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
};

function dateText(value: string | null) {
  if (!value) return "—";
  try { return ShamsiDate(value); } catch { return new Date(value).toLocaleString("fa-IR"); }
}

export default function LoginHistoryPanel({ userId }: { userId?: string }) {
  const [items, setItems] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = userId
        ? `/api/LoginHistories/user/${encodeURIComponent(userId)}`
        : "/api/LoginHistories/me";
      const result = await apiFetch<LoginHistory[]>(endpoint);
      setItems(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت تاریخچه ورود ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load, retry]);

  return (
    <section dir="rtl" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-elf/10 text-elf"><Clock3 size={20}/></span>
          <div><h2 className="font-semibold text-gray-900 dark:text-white">تاریخچه ورود</h2><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">سوابق ورود و خروج حساب کاربری</p></div>
        </div>
        <button type="button" onClick={() => setRetry(x => x + 1)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700"><RefreshCw size={14} className={loading ? "animate-spin" : ""}/>بروزرسانی</button>
      </div>
      {loading ? <p className="py-8 text-center text-sm text-gray-500">در حال دریافت تاریخچه...</p>
      : error ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</div>
      : items.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">هنوز سابقه‌ای برای ورود ثبت نشده است.</p>
      : <div className="space-y-3">
        {items.map(item => <article key={item.id} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-950/50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              {item.isSuccessful ? <ShieldCheck size={17} className="text-emerald-600"/> : <ShieldAlert size={17} className="text-red-500"/>}
              {item.isSuccessful ? "ورود موفق" : "ورود ناموفق"}
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs ${item.isSuccessful ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300"}`}>{item.isSuccessful ? "موفق" : "ناموفق"}</span>
          </div>
          <div className="mt-3 grid gap-2 text-xs text-gray-600 dark:text-gray-300 sm:grid-cols-2 lg:grid-cols-3">
            <p>زمان ورود: <span className="font-medium">{dateText(item.loginAt)}</span></p>
            <p>زمان خروج: <span className="font-medium">{dateText(item.logoutAt)}</span></p>
            <p className="flex items-center gap-1"><MapPin size={13}/> IP: <span dir="ltr">{item.ipAddress || "ثبت نشده"}</span></p>
            <p className="flex items-center gap-1"><Laptop size={13}/> دستگاه: {item.deviceName || "نامشخص"}</p>
            <p className="sm:col-span-2 lg:col-span-3 break-words">مرورگر و سیستم‌عامل: <span dir="auto">{item.userAgent || "ثبت نشده"}</span></p>
            {item.failureReason && <p className="sm:col-span-2 lg:col-span-3 text-red-600 dark:text-red-300">علت: {item.failureReason}</p>}
          </div>
        </article>)}
      </div>}
    </section>
  );
}
