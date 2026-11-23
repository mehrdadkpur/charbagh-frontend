'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/config'

interface Props {
  bookId: string
  initialValue: string
  onClose: () => void
  onUpdated: (newDescription: string) => void
}

export default function EditBookDescription({bookId, initialValue, onClose, onUpdated}: Props) {
  
  const [value, setValue] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!value.trim()) {
      toast.error('توضیحات نمی‌تواند خالی باشد')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('book_description', value)

      const res = await fetch(
        `${API_BASE_URL}/api/Profile/change-book-description/${bookId}`,
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
      toast.success('توضیحات کتاب بروزرسانی شد')
      onClose()
    } catch {
      toast.error('خطا در بروزرسانی توضیحات')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={6}
        className="w-full p-3 border rounded-lg resize-none"
        placeholder="توضیحات کتاب"
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
