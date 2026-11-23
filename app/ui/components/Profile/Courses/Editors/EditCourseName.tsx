'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/config'

interface Props {
  courseId: string
  initialValue: string
  onClose: () => void
  onUpdated: (newName: string) => void
}

export default function EditCourseName({
  courseId,
  initialValue,
  onClose,
  onUpdated,
}: Props) {
  const [value, setValue] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!value.trim()) {
      toast.error('نام دوره نمی‌تواند خالی باشد')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('course_name', value)

      const res = await fetch(
        `${API_BASE_URL}/api/Profile/change-course-name/${courseId}`,
        {
          method: 'PUT',
          body: formData,
        }
      )

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err)
      }

      onUpdated(value)
      toast.success('نام دوره بروزرسانی شد')
      onClose()
    } catch {
      toast.error('خطا در بروزرسانی نام دوره')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full p-3 border rounded-lg"
        placeholder="نام دوره"
      />

      <div className="flex justify-end gap-3">
        <button
          disabled={loading}
          onClick={submit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {loading ? 'در حال ذخیره...' : 'ذخیره'}
        </button>
      </div>
    </div>
  )
}
