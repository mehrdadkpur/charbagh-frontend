'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/config'

interface Props {
  instrumentId: string
  initialValue: number
  onClose: () => void
  onUpdated: (newType: number) => void
}

export default function EditInstrumentType({
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
      formData.append('Instrument_type', value.toString())

      const res = await fetch(
        `${API_BASE_URL}/api/Admin/change-instrument-type/${instrumentId}`,
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
      toast.success('نوع ساز بروزرسانی شد')
      onClose()
    } catch {
      toast.error('خطا در بروزرسانی نوع ساز')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">

<div className="flex items-center gap-x-2">
          <select
            name="instrumentType"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="peer w-full h-12 px-1 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="100">نوع ساز را انتخاب کنید</option>
            <option value="0">زهی</option>
            <option value="1">صفحه کلید</option>
            <option value="2">بادی</option>
            <option value="3">کوبه‌ای</option>
            <option value="4">الکتریکی</option>
            <option value="10">سایر</option>
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
