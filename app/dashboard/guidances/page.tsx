"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiFetch";
import type { CmsContact } from "@/lib/contentTypes";
import { ShamsiDate } from "@/lib/shamsiDate";

const statusLabels: Record<number, string> = {
  1: "جدید",
  2: "در حال پیگیری",
  3: "پاسخ داده‌شده",
  4: "بسته‌شده",
};

const nextAction: Record<number, { path: string; label: string }> = {
  1: { path: "processing", label: "شروع پیگیری" },
  2: { path: "reply", label: "ثبت پاسخ" },
  3: { path: "close", label: "بستن درخواست" },
  4: { path: "reopen", label: "بازگشایی" },
};

export default function GuidancesPage() {
  const [contacts, setContacts] = useState<CmsContact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setContacts(await apiFetch<CmsContact[]>("/api/Contacts"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "دریافت درخواست‌ها ناموفق بود.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => contacts.filter((contact) =>
    `${contact.fullName} ${contact.mobile}`.toLowerCase().includes(search.toLowerCase())
  ), [contacts, search]);

  const changeStatus = async (contact: CmsContact) => {
    const action = nextAction[contact.status];
    if (!action) return;
    setBusyId(contact.id);
    try {
      const updated = await apiFetch<CmsContact>(`/api/Contacts/${contact.id}/${action.path}`, { method: "PATCH" });
      setContacts((current) => current.map((item) => item.id === contact.id ? updated : item));
      toast.success("وضعیت درخواست بروزرسانی شد.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود.");
    } finally { setBusyId(null); }
  };

  return (
    <main dir="rtl" className="mx-auto mt-6 w-full max-w-7xl space-y-5 px-4 pb-10">
      <h1 className="text-2xl font-bold">درخواست‌های پشتیبانی و مشاوره</h1>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی نام یا شماره همراه" className="w-full rounded-xl border bg-transparent p-3" />
      {loading ? <p className="py-10 text-center">در حال دریافت درخواست‌ها...</p> : filtered.length === 0 ? <p className="py-10 text-center text-gray-500">درخواستی پیدا نشد.</p> : (
        <div className="overflow-x-auto rounded-xl border dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800"><tr><th className="p-3 text-right">نام و نام خانوادگی</th><th className="p-3 text-right">موبایل</th><th className="p-3 text-right">تاریخ ثبت</th><th className="p-3 text-right">وضعیت</th><th className="p-3">عملیات</th></tr></thead>
            <tbody>{filtered.map((contact) => (
              <tr key={contact.id} className="border-t dark:border-gray-700">
                <td className="p-3">{contact.fullName}</td>
                <td className="p-3" dir="ltr">{contact.mobile}</td>
                <td className="p-3">{ShamsiDate(contact.createdAt)}</td>
                <td className="p-3">{statusLabels[contact.status]}</td>
                <td className="p-3 text-center"><button disabled={busyId === contact.id} onClick={() => void changeStatus(contact)} className="rounded-lg bg-emerald-700 px-3 py-2 text-white disabled:opacity-50">{busyId === contact.id ? "در حال ثبت..." : nextAction[contact.status]?.label ?? "—"}</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </main>
  );
}
