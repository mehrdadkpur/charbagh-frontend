'use client'

import Image from 'next/image'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/config'
import { useParams } from 'next/navigation'
import AddButton from '@/app/ui/components/AddButton'
import { IBook, ICourse } from '@/lib/types'

export interface Props {
  course:ICourse
  books:IBook[];
}


export default function CourseBooks({books , course}:Props) {
  const { id } = useParams()

  const isCourseTeacher = course.teacherId === id
 
  return (
    <div className="p-4 font-Dana max-w-7xl mx-auto">
      <div className="w-full flex justify-between items-center gap-x-4 mb-10">
        <h1 className="text-2xl font-bold text-center">{`کتاب های دوره ${course.course_name}`}</h1>
        {
          isCourseTeacher&& (

            <AddButton name="کتاب" route={`/user/profile/${id}/courses/${course.id}/View/books/Add`} />
          )
        }
      </div>

          {books.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-96 space-y-4 font-DanaDemiBold text-xl">
              <span>تا حالا کتابی ثبت نکردی. برای شروع از دکمه + استفاده کن.</span>
            </div>
          ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map(book => (
            <Link
              key={book.id}
              href={`/user/profile/${id}/courses/${course.id}/View/books/${book.id}/View`}
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
          <div className='flex justify-center mt-10'>
            <Link href={`/user/profile/${id}/courses/${course.id}/View`} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"> بازگشت </Link>
          </div>
    </div>
  )
}
