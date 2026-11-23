'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/config'

interface Props {
  instrumentId: string
  initialValue: number
  onClose: () => void
  onUpdated: (newStatus: number) => void
}

export default function EditInstrumentStatus({
  instrumentId,
  initialValue,
  onClose,
  onUpdated,
}: Props) {
  const [value, setValue] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  const submit = async () => {

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('Status', value.toString())

      const res = await fetch(
        `${API_BASE_URL}/api/Admin/change-instrument-status/${instrumentId}`,
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
      toast.success('وضعیت ساز بروزرسانی شد')
      onClose()
    } catch {
      toast.error('خطا در بروزرسانی وضعیت ساز')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
     <div className="w-full flex justify-center items-center gap-x-2">
        <label className="w-1/3" htmlFor="status">
            وضعیت:
        </label>
        <select
          className="w-2/3 h-12 border p-3 bg-gray-50 dark:bg-gray-700"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        >
          <option value="" disabled>وضعیت</option>
          <option value={1}>فعال</option>
          <option value={2}>غیرفعال</option>
          <option value={3}>معلق</option>
        </select>
      </div>

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
