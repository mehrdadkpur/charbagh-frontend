"use client";

import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiFetch";
import { useCurrentPermissions } from "@/lib/useCurrentPermissions";

type Banner = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  buttonText: string | null;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  status: number;
  createdAt: string;
};
type BannerForm = {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  startsAt: string;
  endsAt: string;
  sortOrder: number;
};
const emptyForm: BannerForm = {
  title: "", description: "", imageUrl: "", linkUrl: "", buttonText: "",
  startsAt: "", endsAt: "", sortOrder: 0,
};
const statusLabels: Record<number, string> = {
  1: "پیش‌نویس", 2: "منتشرشده", 3: "بایگانی‌شده",
};
const toLocalInput = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};
const toIsoOrNull = (value: string) => value ? new Date(value).toISOString() : null;

export default function BannersPage() {
  const { can, loading: permissionLoading } = useCurrentPermissions();
  const canView = !permissionLoading && can("Banners", ["View"]);
  const canCreate = !permissionLoading && can("Banners", ["Create"]);
  const canUpdate = !permissionLoading && can("Banners", ["Update"]);
  const canPublish = !permissionLoading && can("Banners", ["Approve"]);
  const canArchive = !permissionLoading && can("Banners", ["Delete"]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setBanners(await apiFetch<Banner[]>("/api/Banners"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "دریافت بنرها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (canView) void load(); }, [canView]);

  const reset = () => { setEditingId(null); setForm(emptyForm); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingId ? !canUpdate : !canCreate) {
      toast.error("مجوز لازم برای این عملیات را ندارید.");
      return;
    }
    if (form.endsAt && form.startsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
      toast.error("زمان پایان باید بعد از زمان شروع باشد.");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim(),
      linkUrl: form.linkUrl.trim() || null,
      buttonText: form.buttonText.trim() || null,
      startsAt: toIsoOrNull(form.startsAt),
      endsAt: toIsoOrNull(form.endsAt),
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (editingId) {
        await apiFetch<Banner>(`/api/Banners/${editingId}`, {
          method: "PUT", body: JSON.stringify(payload),
        });
        toast.success("بنر ویرایش شد.");
      } else {
        await apiFetch<Banner>("/api/Banners", {
          method: "POST", body: JSON.stringify(payload),
        });
        toast.success("بنر به‌صورت پیش‌نویس ایجاد شد.");
      }
      reset();
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیره بنر ناموفق بود.");
    } finally { setSaving(false); }
  };

  const edit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      description: banner.description ?? "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? "",
      buttonText: banner.buttonText ?? "",
      startsAt: toLocalInput(banner.startsAt),
      endsAt: toLocalInput(banner.endsAt),
      sortOrder: banner.sortOrder,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeStatus = async (banner: Banner, action: "publish" | "unpublish" | "archive" | "restore") => {
    setBusyId(banner.id);
    try {
      await apiFetch<Banner>(`/api/Banners/${banner.id}/${action}`, { method: "PATCH" });
      toast.success("وضعیت بنر تغییر کرد.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تغییر وضعیت بنر ناموفق بود.");
    } finally { setBusyId(null); }
  };

  if (permissionLoading || loading && canView) {
    return <p className="p-10 text-center">در حال بارگذاری بنرها...</p>;
  }
  if (!canView) {
    return <main dir="rtl" className="p-8"><p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800">مجوز مشاهده و مدیریت بنرها را ندارید.</p></main>;
  }

  return (
    <main dir="rtl" className="mx-auto mt-6 w-full max-w-6xl space-y-6 px-4 pb-12">
      <header>
        <h1 className="text-2xl font-extrabold">مدیریت بنرهای اطلاع‌رسانی</h1>
        <p className="mt-2 text-sm text-gray-500">بنرهای صفحه اصلی را ایجاد، زمان‌بندی، منتشر یا بایگانی کنید.</p>
      </header>

      <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 md:grid-cols-2">
        <h2 className="text-lg font-bold md:col-span-2">{editingId ? "ویرایش بنر" : "ایجاد بنر جدید"}</h2>
        <label className="space-y-2"><span className="block text-sm font-semibold">عنوان</span><input required maxLength={150} value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="w-full rounded-xl border bg-transparent p-3" /></label>
        <label className="space-y-2"><span className="block text-sm font-semibold">آدرس تصویر بنر</span><input required type="url" value={form.imageUrl} onChange={e => setForm({...form,imageUrl:e.target.value})} placeholder="https://..." className="w-full rounded-xl border bg-transparent p-3" /></label>
        <label className="space-y-2 md:col-span-2"><span className="block text-sm font-semibold">توضیحات کوتاه</span><textarea rows={2} maxLength={500} value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="w-full rounded-xl border bg-transparent p-3" /></label>
        <label className="space-y-2"><span className="block text-sm font-semibold">لینک مقصد (اختیاری)</span><input type="url" value={form.linkUrl} onChange={e => setForm({...form,linkUrl:e.target.value})} placeholder="https://..." className="w-full rounded-xl border bg-transparent p-3" /></label>
        <label className="space-y-2"><span className="block text-sm font-semibold">متن دکمه (اختیاری)</span><input maxLength={60} value={form.buttonText} onChange={e => setForm({...form,buttonText:e.target.value})} className="w-full rounded-xl border bg-transparent p-3" /></label>
        <label className="space-y-2"><span className="block text-sm font-semibold">شروع نمایش</span><input type="datetime-local" value={form.startsAt} onChange={e => setForm({...form,startsAt:e.target.value})} className="w-full rounded-xl border bg-transparent p-3" /><small className="text-gray-500">خالی باشد، بلافاصله پس از انتشار نمایش داده می‌شود.</small></label>
        <label className="space-y-2"><span className="block text-sm font-semibold">پایان نمایش</span><input type="datetime-local" value={form.endsAt} onChange={e => setForm({...form,endsAt:e.target.value})} className="w-full rounded-xl border bg-transparent p-3" /><small className="text-gray-500">خالی باشد، تاریخ پایان ندارد.</small></label>
        <label className="space-y-2"><span className="block text-sm font-semibold">ترتیب نمایش</span><input type="number" value={form.sortOrder} onChange={e => setForm({...form,sortOrder:Number(e.target.value)})} className="w-full rounded-xl border bg-transparent p-3" /></label>
        {form.imageUrl && <div className="md:col-span-2"><span className="mb-2 block text-sm font-semibold">پیش‌نمایش تصویر</span><img src={form.imageUrl} alt="پیش‌نمایش بنر" className="max-h-52 w-full rounded-xl object-cover" /></div>}
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button disabled={saving || (editingId ? !canUpdate : !canCreate)} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? "در حال ذخیره..." : editingId ? "ثبت ویرایش" : "ایجاد پیش‌نویس"}</button>
          {editingId && <button type="button" onClick={reset} className="rounded-xl bg-gray-200 px-5 py-3 dark:bg-gray-700">لغو ویرایش</button>}
        </div>
        <p className="text-xs text-gray-500 md:col-span-2">در این نسخه تصویر با URL ثبت می‌شود؛ برای بارگذاری مستقیم فایل، باید سرویس ذخیره‌سازی و endpoint آپلود جداگانه اضافه شود.</p>
      </form>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">فهرست بنرها ({banners.length})</h2>
        {banners.length === 0 ? <p className="rounded-xl border p-8 text-center text-gray-500">هنوز بنری ثبت نشده است.</p> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {banners.map(banner => (
              <article key={banner.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <img src={banner.imageUrl} alt={banner.title} className="h-44 w-full object-cover" />
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><h3 className="font-bold">{banner.title}</h3><p className="mt-1 text-sm text-gray-500">{banner.description || "بدون توضیحات"}</p></div>
                    <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">{statusLabels[banner.status] ?? "نامشخص"}</span>
                  </div>
                  <p className="text-xs text-gray-500">ترتیب: {banner.sortOrder} · شروع: {banner.startsAt ? new Date(banner.startsAt).toLocaleString("fa-IR") : "بدون محدودیت"} · پایان: {banner.endsAt ? new Date(banner.endsAt).toLocaleString("fa-IR") : "بدون محدودیت"}</p>
                  <div className="flex flex-wrap gap-2">
                    {banner.status !== 3 && canUpdate && <button onClick={() => edit(banner)} className="rounded-lg bg-amber-600 px-3 py-2 text-sm text-white">ویرایش</button>}
                    {banner.status === 1 && canPublish && <button disabled={busyId===banner.id} onClick={() => void changeStatus(banner,"publish")} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white">انتشار</button>}
                    {banner.status === 2 && canPublish && <button disabled={busyId===banner.id} onClick={() => void changeStatus(banner,"unpublish")} className="rounded-lg bg-amber-700 px-3 py-2 text-sm text-white">لغو انتشار</button>}
                    {banner.status !== 3 && canArchive && <button disabled={busyId===banner.id} onClick={() => void changeStatus(banner,"archive")} className="rounded-lg bg-red-700 px-3 py-2 text-sm text-white">بایگانی</button>}
                    {banner.status === 3 && canUpdate && <button disabled={busyId===banner.id} onClick={() => void changeStatus(banner,"restore")} className="rounded-lg bg-blue-700 px-3 py-2 text-sm text-white">بازیابی</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
