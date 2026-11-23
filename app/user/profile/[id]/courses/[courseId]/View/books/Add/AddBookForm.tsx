"use client"

import Link from "next/link"
import { useState, ChangeEvent, FormEvent } from "react"
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { IBook } from "@/lib/types"
import { API_BASE_URL } from "@/lib/config"
import UploadInput from "@/app/ui/components/UploadInput"

const AddBookForm = () => {
  const router = useRouter()
  const { id, courseId } = useParams()

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState("/images/avatar.png")

  const [fields, setFields] = useState<IBook>({
    id: "",
    book_name: "",
    book_description: "",
    book_img: "",
    courseId: courseId as string,
    songs: []
  })

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("Book_name", fields.book_name)
    formData.append("Book_description", fields.book_description)
    formData.append("CourseId", fields.courseId)
    if (file) formData.append("File", file)

    try {
      const res = await fetch(`${API_BASE_URL}/api/Profile/add-book`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error()

      toast.success("کتاب با موفقیت اضافه شد")
      router.push(`/user/profile/${id}/courses/${courseId}/View/books`)
    } catch {
      toast.error("خطا در ثبت کتاب")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl p-6 space-y-5 shadow-xl"
      >
        <h2 className="text-lg font-bold text-center">
          افزودن کتاب جدید
        </h2>

        <input
          name="book_name"
          value={fields.book_name}
          onChange={handleChange}
          placeholder="نام کتاب"
          className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
          required
        />

        <textarea
          name="book_description"
          value={fields.book_description}
          onChange={handleChange}
          placeholder="توضیحات کتاب"
          className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 min-h-[120px]"
          required
        />

        <UploadInput
          uploadedImage={imagePreview}
          handleImageUpload={handlePhotoSelect}
          uploading={uploading}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Link
            href={`/user/profile/${id}/courses/${courseId}/View/books`}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            انصراف
          </Link>

          <button
            type="submit"
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ذخیره کتاب
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddBookForm
