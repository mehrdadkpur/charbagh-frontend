'use client'

import { useState } from 'react'
import { ICourse } from '@/lib/types'
import {
  BookOpen,
  Calendar,
  Guitar,
  GraduationCap,
  Info,
  Layers,
} from 'lucide-react'
import { ItemCard } from '@/app/ui/components/Profile/ItemCard'
import { StatusHelper } from '@/helper/StatusHelper'
import { ShamsiDate } from '@/lib/shamsiDate'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import EditModal from './EditModal'
import EditCourseName from '@/app/ui/components/Profile/Courses/Editors/EditCourseName'
import EditCourseDescription from '@/app/ui/components/Profile/Courses/Editors/EditCourseDescription'
import EditCourseDate from '@/app/ui/components/Profile/Courses/Editors/EditCourseDate'
import EditCourseInstrument from '@/app/ui/components/Profile/Courses/Editors/EditCourseInstrument'

import { Dispatch, SetStateAction } from 'react'
import EditCourseStatus from '@/app/ui/components/Admin/Courses/Editors/EditCourseStatus'
import { API_BASE_URL } from '@/lib/config'

interface Props {
  course: ICourse
  setCourse: Dispatch<SetStateAction<ICourse | null>>
  instrumentName: string
}

export default function ViewCourse({course, setCourse, instrumentName}: Props) {
  const { instrumentId } = useParams();
  const router = useRouter();
  const [openModal, setOpenModal] = useState<null | 'name' | 'description' | 'status' | 'date' | 'instrument'>(null)

  const truncate = (text: string, limit = 100) =>
    text.length > limit ? text.slice(0, limit) + '...' : text

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 font-Dana">

      {/* ===== Course Image ===== */}
      <div className="relative">
      <div className="w-full h-64 rounded-3xl overflow-hidden ring-2 ring-sky-500 shadow">
        {course.course_img && (
          <Image
            src={`${API_BASE_URL}${course.course_img}`}
            alt="course"
            fill
            className="object-cover rounded-3xl"
            unoptimized
          />
        )}
      </div>
    </div>
      {/* ===== Items ===== */}
      <div className="space-y-4">

        <ItemCard
          icon={<Layers />}
          label="نام دوره"
          value={course.course_name}
          onClick={()=> {}}
        />

        <ItemCard
          icon={<Guitar />}
          label="ساز"
          value={instrumentName}
          onClick={() => {}}
        />

        <ItemCard
          icon={<Info />}
          label="توضیحات دوره"
          value={truncate(course.course_description)}
          onClick={() => {}}
        />

        <ItemCard
          icon={<Calendar />}
          label="تاریخ شروع دوره"
          value={ShamsiDate(course.start_course_date)}
          onClick={() => {}}
        />

        <ItemCard
          icon={<GraduationCap />}
          label="وضعیت"
          value={StatusHelper(course.status)}
          onClick={() =>setOpenModal('status')}
        />

        <ItemCard
          icon={<BookOpen />}
          label="کتاب‌ها و موسیقی‌ها"
          value={<span>{course.books.map((b) => b.book_name).join('، ')}</span>}
          onClick={() => {router.push(`/dashboard/instruments/${instrumentId}/View/courses/${course.id}/View/books`)}}
        />
      </div>

      <Link
        href={`/dashboard/instruments/${instrumentId}/View/courses`}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex justify-center"
      >
        بازگشت به دوره‌ها
      </Link>

      {/* ===== Modals ===== */}

{openModal === 'status' && (
        <EditModal title="ویرایش وضعیت دوره" onClose={() => setOpenModal(null)}>
          <EditCourseStatus
            courseId={course.id}
            initialValue={course.status}
            onClose={() => setOpenModal(null)}
            onUpdated={(newStatus) =>
              setCourse((prev) =>
                prev
                  ? { ...prev, status: newStatus, }
                  : prev
              )
            }
          />
        </EditModal>
      )}

    </div>
  )
}
