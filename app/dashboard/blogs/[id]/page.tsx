"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchAdminBlog } from "@/lib/requests";
import Loading from "@/app/loading";
import Image from "next/image";
import { IBlog } from "@/lib/types";
import toast from "react-hot-toast";
import {  ShamsiDate } from "@/lib/shamsiDate";
import { StatusChanger } from "@/helper/BlogStatusButtons";
import { API_BASE_URL } from "@/lib/config";
import ErrorHandling from "@/app/ui/components/ErrorHandling";

const ViewBlog = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState<IBlog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      if (!id) return;
      try {
        const blog = await fetchAdminBlog(id as string);
        setBlog(blog);
      } catch (error) {
        console.error("Error fetching Blog:", (error as Error).message);
        toast.error("خطا در دریافت اطلاعات پست");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogData();
  }, [id]);

  const handleStatusChange = async (newStatus: 0 | 1 | 2 | 3) => {
    if (!blog || newStatus === blog.status) {
      toast("وضعیت تغییری نکرده است");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/Admin/update-blog-status/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBlog((prev) => prev ? { ...prev, status: newStatus } : prev);
        toast.success("✅ وضعیت پست بروزرسانی شد");
      } else {
        toast.error("❌ خطا در بروزرسانی وضعیت");
      }
    } catch {
      toast.error("🚨 خطای سرور هنگام بروزرسانی وضعیت");
    }
  };

  if (loading) return <Loading />;
  if (!blog) return <ErrorHandling/>;

  return (
    <div className="w-full flex justify-center mt-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl w-full p-6 rounded-xl">
        <h1 className="text-center font-MorabbaMedium text-3xl mb-6">مشخصات پست</h1>

        {/* تصویر پست */}
        <div className="flex justify-center mb-6">
          <Image
            width={400}
            height={300}
            src={`${API_BASE_URL}${blog.blog_img}`}
            alt={blog.blog_title}
            className="rounded-xl shadow-md object-cover"
          />
        </div>

        {/* اطلاعات پست */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4 font-DanaMedium">
          <InfoRow label="موضوع پست" value={blog.blog_title} />
          <InfoRow label="نویسنده" value={`${blog.author.firstname} ${blog.author.lastname}`} />
          <InfoRow label="زمان ایجاد" value={ShamsiDate(blog.blog_date)} />
          <InfoRow label="زمان ویرایش" value={blog?.updatedAt ? `${ShamsiDate(blog.updatedAt)}`: <span className='text-red-500'>بدون سابقه ویرایش</span>} />
          <InfoRow label="متن پست" value={blog.blog_text} />
          <InfoRow label="وضعیت"   value={<StatusChanger status={blog.status} onChange={(newStatus) => handleStatusChange(newStatus)}/>} />
        </div>
        <div className="flex justify-center mt-6">
          <Link
            href="/dashboard/blogs"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-lg font-DanaMedium transition"
          >
            بازگشت
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewBlog;

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2">
    <span className="text-gray-600 dark:text-gray-300">{label}:</span>
    <span className="text-gray-900 dark:text-gray-100 text-lg">{value}</span>
  </div>
);
