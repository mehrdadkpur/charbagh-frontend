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
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import EditModal from './EditModal'
import EditBookName from '@/app/ui/components/Profile/Books/Editors/EditBookName'
import EditBookDescription from '@/app/ui/components/Profile/Books/Editors/EditBookDescription'


import { Dispatch, SetStateAction } from 'react'
import { API_BASE_URL } from '@/lib/config'

interface Props {
  book: IBook
  setBook: Dispatch<SetStateAction<IBook | null>>
  course: ICourse
}

export default function ViewBook({book , course , setBook}: Props) {
  const { instrumentId } = useParams();
  const router = useRouter();

  const [openModal, setOpenModal] = useState<null | 'name' | 'description' >(null)

  const truncate = (text: string, limit = 100) =>
    text.length > limit ? text.slice(0, limit) + '...' : text

  return (
    <div className="max-w-3xl container mx-auto p-6 space-y-8 font-Dana">

      {/* ===== Book Image ===== */}
      <div className="relative">
      <div className="w-full h-64 rounded-3xl overflow-hidden ring-2 ring-sky-500 shadow">
        {book.book_img && (
          <Image
            src={`${API_BASE_URL}${book.book_img}`}
            alt="book"
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
          label="نام کتاب"
          value={book.book_name}
          onClick={() => {}}
        />

        <ItemCard
          icon={<Info />}
          label="توضیحات کتاب"
          value={truncate(book.book_description)}
          onClick={() => {}}
        />
  
        <ItemCard
          icon={<BookOpen />}
          label="موسیقی‌ها"
          value={<span>{book.songs.map((song) => song.song_title).join('، ')}</span>}
          onClick={() => {router.push(`/dashboard/instruments/${instrumentId}/View/courses/${course.id}/View/books/${book.id}/View/songs`)}}
        />
      </div>

      <Link
        href={`/dashboard/instruments/${instrumentId}/View/courses/${course.id}/View/books`}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex justify-center"
      >
        بازگشت به کتاب ها
      </Link>
    </div>
  )
}
