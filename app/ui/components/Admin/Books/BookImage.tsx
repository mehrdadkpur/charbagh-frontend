'use client'

import Image from 'next/image'
import { ChangeEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/config'

interface Props {
  bookId: string
  imagePath: string
  onUpdated?: (newImage: string) => void
}

export default function CourseImage({ bookId, imagePath, onUpdated,}: Props) {
  const [preview, setPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (imagePath) {
      setPreview(`${API_BASE_URL}${imagePath}`)
    }
  }, [imagePath])

  const handlePhotoSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || uploading) return

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    setUploading(true)

    const formData = new FormData()
    formData.append('Book_img', file)

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/profile/change-book-image/${bookId}`,
        {
          method: 'PUT',
          body: formData,
        }
      )

      if (!res.ok) throw new Error()

      const data = await res.json()
      onUpdated?.(data.data.course_img)

      toast.success('تصویر با موفقیت بروزرسانی شد')
    } catch {
      toast.error('خطا در آپلود تصویر')

      setPreview(`${API_BASE_URL}${imagePath}`)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="relative">
      <div className="w-full h-64 rounded-3xl overflow-hidden ring-2 ring-sky-500 shadow">
        {preview && (
          <Image
            src={preview}
            alt="book"
            fill
            className="object-cover rounded-3xl"
            unoptimized
          />
        )}
      </div>

      <label className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <span
          className={`px-4 py-2 rounded-lg text-white text-sm cursor-pointer transition
          ${uploading ? 'bg-gray-400' : 'bg-sky-600 hover:bg-sky-700'}`}
        >
          {uploading ? 'در حال آپلود...' : 'تغییر عکس'}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={uploading}
            onChange={handlePhotoSelect}
          />
        </span>
      </label>
    </div>
  )
}
