"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { API_BASE_URL } from "@/lib/config";
import { IBook, ICourse } from "@/lib/types";

interface Props {
  course: ICourse;
  books: IBook[];
}

export default function CourseBooks({ course, books }: Props) {
  const { instrumentId } = useParams<{ instrumentId: string }>();

  return (
    <div className="container p-4 font-Dana">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">
          کتاب‌های دوره {course.course_name}
        </h1>
      </div>

      {/* Empty state */}
      {books.length === 0 ? (
        <div className="flex items-center justify-center h-96 text-lg text-gray-500">
          هنوز کتابی برای این دوره ثبت نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map(book => (
            <Link
              key={book.id}
              href={`/dashboard/instruments/${instrumentId}/View/courses/${course.id}/View/books/${book.id}/View`}
              className="group"
            >
              <div className="h-full rounded-xl border border-gray-400 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition p-4 flex flex-col">
                {/* Image */}
                {book.book_img && (
                  <div className="h-44 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={`${API_BASE_URL}${book.book_img}`}
                      alt={book.book_name}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Title */}
                <h2 className="text-lg font-bold mb-2">
                  {book.book_name}
                </h2>

                {/* Meta */}
                <div className="mt-auto text-sm text-gray-600 dark:text-gray-300">
                  تعداد موسیقی‌ها:{" "}
                  <span className="font-DanaDemiBold">
                    {book.songs?.length ?? 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Back */}
      <div className="flex justify-center mt-12">
        <Link
          href={`/dashboard/instruments/${instrumentId}/View/courses/${course.id}/View`}
          className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
        >
          بازگشت
        </Link>
      </div>
    </div>
  );
}
