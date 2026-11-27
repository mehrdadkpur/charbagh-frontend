"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle, Newspaper } from "lucide-react";
import toast from "react-hot-toast";
import { fetchPendingBlogs, fetchGuidances } from "@/lib/requests";
import { getStatusDisplayText } from "@/helper/notification-status";
import { IBlog, IContact } from "@/lib/types";
import { API_BASE_URL } from "@/lib/config";

const Notifications = () => {
  const [guidances, setGuidances] = useState<IContact[]>([]);
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadGuides = guidances.filter((guide) => Number(guide.status) === 0);
  const unconfirmedBlogs = blogs.filter((blog) => Number(blog.status) === 0);
  const totalNotifications = unreadGuides.length + unconfirmedBlogs.length;

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      // اعلان‌های مدیریتی فقط برای نشست واردشده دریافت می‌شوند.
      const token = localStorage.getItem("accessToken");
      const branchId = localStorage.getItem("currentBranchId");

      if (!token || !branchId) {
        if (!cancelled) {
          setGuidances([]);
          setBlogs([]);
        }
        return;
      }

      try {
        const [guidanceResult, blogResult] = await Promise.all([
          fetchGuidances(),
          fetchPendingBlogs(),
        ]);

        if (!cancelled) {
          setGuidances(guidanceResult || []);
          setBlogs(blogResult || []);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    void loadData();
    const intervalId = window.setInterval(() => void loadData(), 60000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const updateGuidanceStatus = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const branchId = localStorage.getItem("currentBranchId");

      const response = await fetch(`${API_BASE_URL}/api/Guidance/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(branchId ? { "X-Branch-Id": branchId } : {}),
        },
        body: JSON.stringify({ status: 1 }),
      });

      if (!response.ok) {
        let message = "خطا در به‌روزرسانی وضعیت";
        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch {
          // پاسخ خطا ممکن است بدنه JSON نداشته باشد.
        }
        throw new Error(message);
      }

      setGuidances((previous) =>
        previous.map((guide) =>
          guide.id === id ? { ...guide, status: 1 } : guide,
        ),
      );
      toast.success("وضعیت درخواست با موفقیت به‌روزرسانی شد");
    } catch (error) {
      console.error("Error updating guidance status:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در به‌روزرسانی وضعیت",
      );
    }
  };

  return (
    <div className="relative font-Dana" ref={notificationRef}>
      <button
        type="button"
        aria-label={totalNotifications > 0 ? `اعلان‌ها، ${totalNotifications} مورد جدید` : "اعلان‌ها"}
        aria-expanded={isOpen}
        aria-controls="notification-panel"
        onClick={() => setIsOpen((previous) => !previous)}
        className="relative flex size-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elf/50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Bell size={20} aria-hidden="true" />
        {totalNotifications > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white dark:border-gray-950">
            {totalNotifications > 99 ? "۹۹+" : totalNotifications.toLocaleString("fa-IR")}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          id="notification-panel"
          aria-label="فهرست اعلان‌ها"
          className="fixed left-3 right-3 top-[4.5rem] z-[70] max-h-[min(70vh,34rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 text-gray-800 shadow-2xl shadow-gray-950/15 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 sm:absolute sm:left-0 sm:right-auto sm:top-full sm:mt-3 sm:w-80 sm:max-w-[calc(100vw-2rem)]"
        >
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <h3 className="text-sm font-bold">اعلان‌ها</h3>
            <span className="rounded-full bg-elf/10 px-2.5 py-1 text-xs font-semibold text-elf dark:bg-elf/20">
              {totalNotifications.toLocaleString("fa-IR")} مورد جدید
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <h4 className="flex items-center gap-2 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <MessageCircle size={15} />
              درخواست‌های مشاوره
            </h4>
            {unreadGuides.length > 0 ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {unreadGuides.map((guide) => {
                  const mobile = (guide.mobile ?? "").replace(
                    /(\d{4})(\d{3})(\d{4})/,
                    "$1-$2-$3",
                  );
                  return (
                    <li key={guide.id}>
                      <button
                        type="button"
                        onClick={() => void updateGuidanceStatus(guide.id)}
                        className="w-full px-3 py-3 text-right transition-colors hover:bg-emerald-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-elf dark:hover:bg-emerald-950/20"
                      >
                        <span className="block text-sm font-semibold">{guide.fullName}</span>
                        {mobile && <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400" dir="ltr">{mobile}</span>}
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          {getStatusDisplayText(guide.status)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-3 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                درخواست مشاوره جدیدی وجود ندارد
              </p>
            )}
          </div>

          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <h4 className="flex items-center gap-2 bg-sky-50 px-3 py-2.5 text-xs font-bold text-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
              <Newspaper size={15} />
              مطالب تأییدنشده
            </h4>
            {unconfirmedBlogs.length > 0 ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {unconfirmedBlogs.map((blog) => (
                  <li key={blog.id}>
                    <Link
                      href={`/dashboard/blogs/${blog.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-3 transition-colors hover:bg-sky-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-elf dark:hover:bg-sky-950/20"
                    >
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {blog.author ? `${blog.author.firstName ?? ""} ${blog.author.lastName ?? ""}`.trim() : "کاربر"}
                      </span>
                      <span className="mt-1 block text-sm font-semibold">{blog.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                مطلب تأییدنشده‌ای وجود ندارد
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Notifications;
