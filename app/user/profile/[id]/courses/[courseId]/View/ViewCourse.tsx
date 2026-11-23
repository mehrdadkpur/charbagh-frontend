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
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import CourseImage from '@/app/ui/components/Profile/Courses/CourseImage'
import EditModal from './EditModal'
import EditCourseName from '@/app/ui/components/Profile/Courses/Editors/EditCourseName'
import EditCourseDescription from '@/app/ui/components/Profile/Courses/Editors/EditCourseDescription'
import EditCourseDate from '@/app/ui/components/Profile/Courses/Editors/EditCourseDate'
import EditCourseInstrument from '@/app/ui/components/Profile/Courses/Editors/EditCourseInstrument'

import { Dispatch, SetStateAction } from 'react'

interface Props {
  course: ICourse
  setCourse: Dispatch<SetStateAction<ICourse | null>>
  instrumentName: string
}

export default function ViewCourse({course, setCourse, instrumentName}: Props) {
  const { id } = useParams();
  const router = useRouter();
  const [openModal, setOpenModal] = useState<null | 'name' | 'description' | 'date' | 'instrument'>(null)

  const truncate = (text: string, limit = 100) =>
    text.length > limit ? text.slice(0, limit) + '...' : text

  const isCourseTeacher = course.teacherId === id

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 font-Dana">

      {/* ===== Course Image ===== */}
      <CourseImage
        isCourseTeacher = {isCourseTeacher}
        courseId={course.id}
        imagePath={course.course_img}
        onUpdated={(newImage) =>setCourse((prev) => prev ? { ...prev, course_img: newImage, status: 0 } : prev
          )
        }
      />

      {/* ===== Items ===== */}
      <div className="space-y-4">

        <ItemCard
          icon={<Layers />}
          label="نام دوره"
          value={course.course_name}
          onClick={isCourseTeacher ? () => setOpenModal('name') : ()=>{}}
        />

        <ItemCard
          icon={<Guitar />}
          label="ساز"
          value={instrumentName}
          onClick={isCourseTeacher ? () => setOpenModal('instrument'): ()=>{}}
        />

        <ItemCard
          icon={<Info />}
          label="توضیحات دوره"
          value={truncate(course.course_description)}
          onClick={isCourseTeacher ?() => setOpenModal('description'): ()=>{}}
        />

        <ItemCard
          icon={<Calendar />}
          label="تاریخ شروع دوره"
          value={ShamsiDate(course.start_course_date)}
          onClick={isCourseTeacher ?() => setOpenModal('date'): ()=>{}}
        />

        <ItemCard
          icon={<GraduationCap />}
          label="وضعیت"
          value={StatusHelper(course.status)}
          onClick={() => {}}
        />

        <ItemCard
          icon={<BookOpen />}
          label="کتاب‌ها و موسیقی‌ها"
          value={<span>{course.books.map((b) => b.book_name).join('، ')}</span>}
          onClick={() => {router.push(`/user/profile/${id}/courses/${course.id}/View/books`)}}
        />
      </div>

      <Link
        href={`/user/profile/${id}/courses`}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex justify-center"
      >
        بازگشت به دوره‌ها
      </Link>

      {/* ===== Modals ===== */}

      {openModal === 'name' && (
        <EditModal title="ویرایش نام دوره" onClose={() => setOpenModal(null)}>
          <EditCourseName
            courseId={course.id}
            initialValue={course.course_name}
            onClose={() => setOpenModal(null)}
            onUpdated={(newName) =>
              setCourse((prev) =>
                prev ? { ...prev, course_name: newName, status: 0 } : prev
              )
            }
          />
        </EditModal>
      )}

      {openModal === 'description' && (
        <EditModal title="ویرایش توضیحات دوره" onClose={() => setOpenModal(null)}>
          <EditCourseDescription
            courseId={course.id}
            initialValue={course.course_description}
            onClose={() => setOpenModal(null)}
            onUpdated={(newDesc) =>
              setCourse((prev) =>
                prev
                  ? { ...prev, course_description: newDesc, status: 0 }
                  : prev
              )
            }
          />
        </EditModal>
      )}

      {openModal === 'date' && (
        <EditModal title="ویرایش تاریخ شروع" onClose={() => setOpenModal(null)}>
          <EditCourseDate
            courseId={course.id}
            initialValue={course.start_course_date}
            onClose={() => setOpenModal(null)}
            onUpdated={(newDate) =>
              setCourse((prev) =>
                prev
                  ? { ...prev, start_course_date: newDate, status: 0 }
                  : prev
              )
            }
          />
        </EditModal>
      )}

      {openModal === 'instrument' && (
        <EditModal title="ویرایش ساز دوره" onClose={() => setOpenModal(null)}>
          <EditCourseInstrument
            courseId={course.id}
            currentInstrumentId={course.instrumentId}
            onClose={() => setOpenModal(null)}
            onUpdated={(newInstrument) => {
              setCourse((prev) =>
                prev
                  ? {
                      ...prev,
                      instrumentId: newInstrument.id,
                      status: 0,
                    }
                  : prev
              )
            }}
          />
        </EditModal>
      )}
    </div>
  )
}
