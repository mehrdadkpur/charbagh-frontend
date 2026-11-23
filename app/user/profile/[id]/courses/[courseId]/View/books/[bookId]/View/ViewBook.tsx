'use client'

import { useState } from 'react'
import { IBook, ICourse } from '@/lib/types'
import {
  BookOpen,
  Info,
  Layers,
} from 'lucide-react'
import { ItemCard } from '@/app/ui/components/Profile/ItemCard'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import BookImage from '@/app/ui/components/Profile/Books/BookImage'
import EditModal from './EditModal'
import EditBookName from '@/app/ui/components/Profile/Books/Editors/EditBookName'
import EditBookDescription from '@/app/ui/components/Profile/Books/Editors/EditBookDescription'


import { Dispatch, SetStateAction } from 'react'

interface Props {
  book: IBook
  setBook: Dispatch<SetStateAction<IBook | null>>
  course: ICourse
}

export default function ViewBook({book , course , setBook}: Props) {
  const { id } = useParams();
  const router = useRouter();

  const [openModal, setOpenModal] = useState<null | 'name' | 'description' >(null)

  const truncate = (text: string, limit = 100) =>
    text.length > limit ? text.slice(0, limit) + '...' : text

  const isCourseTeacher = course.teacherId === id

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 font-Dana">

      {/* ===== Book Image ===== */}
      <BookImage
        isCourseTeacher = {isCourseTeacher}
        bookId={book.id}
        imagePath={book.book_img}
        onUpdated={(newImage) =>
          setBook((prev) =>
            prev ? { ...prev, book_img: newImage, status: 0 } : prev
          )
        }
      />

      {/* ===== Items ===== */}
      <div className="space-y-4">

        <ItemCard
          icon={<Layers />}
          label="نام کتاب"
          value={book.book_name}
          onClick={isCourseTeacher ?() => setOpenModal('name'): ()=>{}}
        />

        <ItemCard
          icon={<Info />}
          label="توضیحات کتاب"
          value={truncate(book.book_description)}
          onClick={isCourseTeacher ?() => setOpenModal('description'): ()=>{}}
        />
  
        <ItemCard
          icon={<BookOpen />}
          label="موسیقی‌ها"
          value={<span>{book.songs.map((song) => song.song_title).join('، ')}</span>}
          onClick={() => {router.push(`/user/profile/${id}/courses/${course.id}/View/books/${book.id}/View/songs`)}}
        />
      </div>

      <Link
        href={`/user/profile/${id}/courses/${course.id}/View/books`}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex justify-center"
      >
        بازگشت به کتاب ها
      </Link>

      {/* ===== Modals ===== */}

      {openModal === 'name' && (
        <EditModal title="ویرایش نام دوره" onClose={() => setOpenModal(null)}>
          <EditBookName
            bookId={book.id}
            initialValue={book.book_name}
            onClose={() => setOpenModal(null)}
            onUpdated={(newName) =>
              setBook((prev) =>
                prev ? { ...prev, book_name: newName, status: 0 } : prev
              )
            }
          />
        </EditModal>
      )}

      {openModal === 'description' && (
        <EditModal title="ویرایش توضیحات دوره" onClose={() => setOpenModal(null)}>
          <EditBookDescription
            bookId={book.id}
            initialValue={book.book_description}
            onClose={() => setOpenModal(null)}
            onUpdated={(newDesc) =>
              setBook((prev) =>
                prev
                  ? { ...prev, book_description: newDesc, status: 0 }
                  : prev
              )
            }
          />
        </EditModal>
      )}
    </div>
  )
}
