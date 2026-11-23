"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { X } from "lucide-react";

import AddButton from "@/app/ui/components/AddButton";
import { fetchProfileUser } from "@/lib/requests";
import { API_BASE_URL } from "@/lib/config";
import { ShamsiDate } from "@/lib/shamsiDate";
import { StatusHelper } from "@/helper/StatusHelper";

export interface IUserCourse {
  courseId: string;
  course_name: string;
  course_img: string;
  students:[];
  status: number;
  role: "Teacher" | "Student";
  courseRegisteryDate?: string;
}

export interface IUser {
  id: string;
  firstname: string;
  lastname: string;
  roles: { role_name: string }[];
  courses: IUserCourse[];
}

function CourseCardSkeleton() {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-800 p-4 animate-pulse">
      <div className="h-44 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-2/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  );
}


export default function UserCourses() {

  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [courses, setCourses] = useState<IUserCourse[]>([]);
  const [user, setUser] = useState<IUser>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const data = await fetchProfileUser(id);
        console.log(data)
        setUser(data);
        setCourses(data.courses || []);
      } catch (err) {
        console.error(err);
        toast.error("خطای سرور");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const isTeacher =
    user?.roles?.some(r => r.role_name === "Teacher") ?? false;

    const handleDeleteConfirm = async (courseId: string) => {
      const result = await Swal.fire({
        title: "آیا مطمئن هستید؟",
        text: "این عملیات قابل بازگشت نیست!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#2563eb",
        confirmButtonText: "بله، حذف کن",
        cancelButtonText: "لغو",
      });
  
      if (!result.isConfirmed) return;
  
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/Profile/delete-course/${courseId}`,
          { method: "DELETE" }
        );
  
        if (!res.ok) throw new Error();
  
        setCourses(prev => prev.filter(i => i.courseId !== courseId));
        await Swal.fire("حذف شد!", "دوره با موفقیت حذف شد.", "success");
      } catch {
        await Swal.fire("خطا", "خطا در حذف دوره.", "error");
      }
    };

  return (
    <div className="max-w-7xl mx-auto p-4 font-Dana">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">دوره‌های من</h1>
        {isTeacher && (
          <AddButton
            name="دوره"
            route={`/user/profile/${id}/courses/Add`}
          />
        )}
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="flex items-center justify-center h-96 text-lg text-gray-500">
          {isTeacher
            ? "تا حالا دوره‌ای ثبت نکردی."
            : "تا حالا در دوره‌ای ثبت‌نام نکردی."}
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
{courses.map(course => (
  <div
    key={course.courseId}
    onClick={() =>
      router.push(`/user/profile/${id}/courses/${course.courseId}/View`)
    }
    className="relative group cursor-pointer h-full rounded-xl border border-gray-400 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition"
  >
    {/* Delete button */}
    {isTeacher && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteConfirm(course.courseId);
        }}
        className="absolute top-3 right-3 z-20 flex items-center justify-center w-8 h-8 rounded-full
                   bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition
                   sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="حذف دوره"
      >
        <X size={16} />
      </button>
    )}

    <div className="p-4 flex flex-col h-full">
      {course.course_img && (
        <div className="h-44 rounded-lg overflow-hidden mb-4">
          <Image
            src={`${API_BASE_URL}${course.course_img}`}
            alt={course.course_name}
            width={400}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <h2 className="text-lg font-bold mb-3">
        دوره {course.course_name}
      </h2>

      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 flex-1">
        <div className="flex justify-between">
          <span>نقش</span>
          <span className="font-DanaDemiBold">
            {course.role === "Teacher" ? "مدرس" : "هنرجو"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>وضعیت</span>
          <span className="px-2 py-0.5 rounded-md text-xs bg-blue-100 text-blue-700">
            {StatusHelper(course.status)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>تعداد هنرجو</span>
          <span className="px-2 py-0.5 rounded-md text-xs bg-blue-100 text-blue-700">
            {course.students.length}
          </span>
        </div>

        {course.role === "Student" && course.courseRegisteryDate && (
          <div className="flex justify-between">
            <span>تاریخ ثبت‌نام</span>
            <span>{ShamsiDate(course.courseRegisteryDate)}</span>
          </div>
        )}
      </div>
    </div>
  </div>
))}

        </div>
      )}

      {/* Back */}
      <div className="flex justify-center mt-12">
        <Link
          href="/user/profile"
          className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
        >
          بازگشت
        </Link>
      </div>
    </div>
  );
}
