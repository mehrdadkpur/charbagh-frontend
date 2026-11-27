"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiFetch";
import type { CmsBlog, CmsCategory } from "@/lib/contentTypes";

type Props = {
  blogId?: string;
};

export default function BlogForm({ blogId }: Props) {
  const router = useRouter();
  const isEdit = Boolean(blogId);
  const [categories, setCategories] = useState<CmsCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const categoryData = await apiFetch<CmsCategory[]>("/api/Categories");
        if (!active) return;
        setCategories(categoryData.filter((category) => category.isActive));

        if (blogId) {
          const blog = await apiFetch<CmsBlog>(`/api/Blogs/${blogId}`);
          if (!active) return;
          setTitle(blog.title);
          setContent(blog.text);
          setImageUrl(blog.imageUrl ?? "");
          setCategoryId(blog.categoryId);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "بارگذاری فرم ناموفق بود.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [blogId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryId) {
      toast.error("دسته‌بندی مقاله را انتخاب کنید.");
      return;
    }

    setSaving(true);
    try {
      if (blogId) {
        await apiFetch<CmsBlog>(`/api/Blogs/${blogId}`, {
          method: "PUT",
          body: JSON.stringify({
            id: blogId,
            categoryId,
            title: title.trim(),
            text: content.trim(),
            imageUrl: imageUrl.trim() || null,
          }),
        });
        toast.success("مقاله با موفقیت ویرایش شد.");
        router.push(`/dashboard/blogs/${blogId}`);
      } else {
        const created = await apiFetch<CmsBlog>("/api/Blogs", {
          method: "POST",
          body: JSON.stringify({
            categoryId,
            title: title.trim(),
            text: content.trim(),
            imageUrl: imageUrl.trim() || null,
          }),
        });
        toast.success("مقاله به‌صورت پیش‌نویس ایجاد شد.");
        router.push(`/dashboard/blogs/${created.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیره مقاله ناموفق بود.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">در حال بارگذاری...</div>;

  return (
    <main dir="rtl" className="mx-auto mt-6 w-full max-w-4xl space-y-5 px-4 pb-10">
      <h1 className="text-center text-2xl font-bold">{isEdit ? "ویرایش مقاله" : "ایجاد مقاله جدید"}</h1>
      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-900">
        <label className="block space-y-2">
          <span className="text-sm font-semibold">دسته‌بندی</span>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required className="w-full rounded-xl border bg-transparent p-3">
            <option value="">انتخاب دسته‌بندی</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold">عنوان مقاله</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={200} className="w-full rounded-xl border bg-transparent p-3" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold">متن مقاله</span>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} required rows={12} className="w-full rounded-xl border bg-transparent p-3" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold">آدرس تصویر (اختیاری)</span>
          <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} type="url" placeholder="https://..." className="w-full rounded-xl border bg-transparent p-3" />
        </label>
        <p className="text-xs leading-6 text-gray-500">در API فعلی بارگذاری فایل وجود ندارد؛ تصویر از طریق آدرس URL ثبت می‌شود.</p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
          <button disabled={saving} className="min-h-11 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50">{saving ? "در حال ذخیره..." : "ذخیره"}</button>
          <Link href={blogId ? `/dashboard/blogs/${blogId}` : "/dashboard/blogs"} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-200 px-6 py-3 text-gray-800 dark:bg-gray-700 dark:text-white">انصراف</Link>
        </div>
      </form>
    </main>
  );
}
