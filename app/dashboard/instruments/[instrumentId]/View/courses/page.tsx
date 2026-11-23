"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

import Loading from "@/app/loading";
import { fetchAdminInstrument } from "@/lib/requests";
import { API_BASE_URL } from "@/lib/config";
import { ShamsiDate } from "@/lib/shamsiDate";
import { StatusHelper } from "@/helper/StatusHelper";
import { ICourse, Instrument } from "@/lib/types";

export default function InstrumentCourses() {
  const { instrumentId } = useParams<{ instrumentId: string }>();

  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!instrumentId) return;

    const fetchData = async () => {
      try {
        const data = await fetchAdminInstrument(instrumentId);
        setInstrument(data);
        setCourses(data.courses || []);
      } catch (err) {
        console.error(err);
        toast.error("خطا در دریافت اطلاعات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [instrumentId]);

  if (loading) return <Loading />;

  return (
    <div className="container p-4 font-Dana">
      {/* Header */}
      <div className="flex justify-between items-center my-10">
        <h1 className="text-2xl font-bold">
          دوره‌های ساز {instrument?.instrument_name}
        </h1>
      </div>

      {/* Empty state */}
      {courses.length === 0 ? (
        <div className="flex items-center justify-center h-96 text-lg text-gray-500">
          هنوز دوره‌ای برای این ساز ثبت نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses.map(course => (
            <Link
              key={course.id}
              href={`/dashboard/instruments/${instrumentId}/View/courses/${course.id}/View`}
              className="group"
            >
              <div className="h-full rounded-xl border border-gray-400 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition p-4 flex flex-col">
                {/* Image */}
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

                {/* Title */}
                <h2 className="text-lg font-bold mb-4">
                  دوره {course.course_name}
                </h2>

                {/* Info */}
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3 flex-1">
                  <div className="flex justify-between">
                    <span>تاریخ شروع</span>
                    <span className="font-DanaDemiBold">
                      {ShamsiDate(course.start_course_date)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>وضعیت</span>
                    <span className="px-2 py-0.5 rounded-md text-xs bg-blue-100 text-blue-700">
                      {StatusHelper(course.status)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>هنرآموزان</span>
                    <span>{course.students?.length ?? 0}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>کتاب‌ها</span>
                    <span>{course.books?.length ?? 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Back */}
      <div className="flex justify-center mt-12">
        <Link
          href={`/dashboard/instruments/${instrumentId}/View`}
          className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
        >
          بازگشت
        </Link>
      </div>
    </div>
  );
}
