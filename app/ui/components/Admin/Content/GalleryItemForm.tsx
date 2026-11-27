"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiFetch";
import type { CmsGallery, CmsGalleryItem, GalleryMediaType } from "@/lib/contentTypes";
import { useCurrentPermissions } from "@/lib/useCurrentPermissions";

type Props = { mediaType: GalleryMediaType; itemId?: string };

export default function GalleryItemForm({ mediaType, itemId }: Props) {
  const router = useRouter();
  const isEdit = Boolean(itemId);
  const { can, loading: permissionLoading } = useCurrentPermissions();
  const canSubmit = !permissionLoading && can("GalleryItems", [isEdit ? "Update" : "Create"]);
  const [galleries, setGalleries] = useState<CmsGallery[]>([]);
  const [galleryId, setGalleryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const galleryData = await apiFetch<CmsGallery[]>("/api/Galleries");
        if (!active) return;
        setGalleries(galleryData.filter((gallery) => gallery.status !== 3));
        if (itemId) {
          const item = await apiFetch<CmsGalleryItem>(`/api/GalleryItems/${itemId}`);
          if (!active) return;
          if (item.mediaType !== mediaType) throw new Error("نوع رسانه با این صفحه مطابقت ندارد.");
          setGalleryId(item.galleryId);
          setTitle(item.title ?? "");
          setDescription(item.description ?? "");
          setFileUrl(item.fileUrl);
          setThumbnailUrl(item.thumbnailUrl ?? "");
          setSortOrder(String(item.sortOrder));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "بارگذاری فرم ناموفق بود.");
      } finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [itemId, mediaType]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) { toast.error("مجوز لازم برای این عملیات را ندارید."); return; }
    if (!isEdit && !galleryId) {
      toast.error("گالری مقصد را انتخاب کنید.");
      return;
    }
    setSaving(true);
    try {
      if (itemId) {
        await apiFetch<CmsGalleryItem>(`/api/GalleryItems/${itemId}`, {
          method: "PUT",
          body: JSON.stringify({
            id: itemId,
            title: title.trim() || null,
            description: description.trim() || null,
            thumbnailUrl: thumbnailUrl.trim() || null,
            fileUrl: fileUrl.trim(),
          }),
        });
        await apiFetch<CmsGalleryItem>(
          `/api/GalleryItems/${itemId}/change-sort-order?sortOrder=${encodeURIComponent(String(Number(sortOrder)))}`,
          { method: "PATCH" }
        );
        toast.success("رسانه ویرایش شد.");
        router.push(`/dashboard/galleries/${mediaType === 1 ? "photos" : "videos"}/${itemId}`);
      } else {
        const created = await apiFetch<CmsGalleryItem>("/api/GalleryItems", {
          method: "POST",
          body: JSON.stringify({
            galleryId,
            mediaType,
            title: title.trim() || null,
            description: description.trim() || null,
            fileUrl: fileUrl.trim(),
            thumbnailUrl: thumbnailUrl.trim() || null,
            sortOrder: Number(sortOrder),
          }),
        });
        toast.success("رسانه به گالری اضافه شد.");
        router.push(`/dashboard/galleries/${mediaType === 1 ? "photos" : "videos"}/${created.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیره رسانه ناموفق بود.");
    } finally { setSaving(false); }
  };

  if (loading) return <p className="p-8 text-center">در حال بارگذاری...</p>;

  return (
    <main dir="rtl" className="mx-auto mt-6 w-full max-w-3xl space-y-5 px-4 pb-10">
      <h1 className="text-center text-2xl font-bold">{isEdit ? "ویرایش رسانه" : mediaType === 1 ? "افزودن تصویر" : "افزودن ویدئو"}</h1>
      {galleries.length === 0 && <p className="rounded-xl bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">ابتدا باید یک گالری فعال ایجاد کنید. <Link className="underline" href="/dashboard/galleries">مدیریت گالری‌ها</Link></p>}
      {!permissionLoading && !canSubmit && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">مجوز لازم برای این عملیات را ندارید.</p>}
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        {!isEdit && <label className="block space-y-2"><span className="text-sm">گالری مقصد</span><select required value={galleryId} onChange={(event) => setGalleryId(event.target.value)} className="w-full rounded-lg border bg-transparent p-3"><option value="">انتخاب گالری</option>{galleries.map((gallery) => <option key={gallery.id} value={gallery.id}>{gallery.title}</option>)}</select></label>}
        <label className="block space-y-2"><span className="text-sm">عنوان</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-lg border bg-transparent p-3" /></label>
        <label className="block space-y-2"><span className="text-sm">توضیحات</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-lg border bg-transparent p-3" /></label>
        <label className="block space-y-2"><span className="text-sm">آدرس فایل {mediaType === 1 ? "تصویر" : "ویدئو"}</span><input required type="url" value={fileUrl} onChange={(event) => setFileUrl(event.target.value)} placeholder="https://..." dir="ltr" className="w-full rounded-lg border bg-transparent p-3" /></label>
        <label className="block space-y-2"><span className="text-sm">آدرس تصویر بندانگشتی (اختیاری)</span><input type="url" value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} placeholder="https://..." dir="ltr" className="w-full rounded-lg border bg-transparent p-3" /></label>
        <label className="block space-y-2"><span className="text-sm">ترتیب نمایش</span><input type="number" min="0" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="w-full rounded-lg border bg-transparent p-3" /></label>
        <p className="text-xs leading-6 text-gray-500">در بک‌اند فعلی endpoint بارگذاری فایل تعریف نشده است؛ آدرس فایل باید از قبل در دسترس باشد.</p>
        <div className="flex gap-3"><button disabled={saving || permissionLoading || !canSubmit || (!isEdit && galleries.length === 0)} className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50">{saving ? "در حال ذخیره..." : "ذخیره"}</button><Link href={`/dashboard/galleries/${mediaType === 1 ? "photos" : "videos"}`} className="rounded-lg bg-gray-200 px-5 py-3 dark:bg-gray-700">انصراف</Link></div>
      </form>
    </main>
  );
}
