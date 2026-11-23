'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/config'
import { DateObject } from 'react-multi-date-picker'
import ShamsiDatePicker from '../../../ShamsiDatePicker'

interface Props {
  courseId: string
  initialValue: string 
  onClose: () => void
  onUpdated: (newDate: string) => void
}

export default function EditCourseDate({courseId,initialValue,onClose,onUpdated}: Props) {

  const [date, setDate] = useState<DateObject | null>( initialValue ? new DateObject({ date: new Date(initialValue) }) : null )
  const [loading, setLoading] = useState(false)

  const handleStartCourseDateChange = (gregorianIso: string) => {
    const newDate = new Date(gregorianIso)
    setDate(new DateObject({ date: newDate }))
  }
  const submit = async () => {
    if (!date) {
      toast.error('لطفاً تاریخ شروع را انتخاب کنید')
      return
    }

    try {
      setLoading(true)

      const isoDate = date.toDate().toISOString()

      const formData = new FormData()
      formData.append('start_course_date', isoDate)

      const res = await fetch(
        `${API_BASE_URL}/api/profile/change-course-start-date/${courseId}`,
        {
          method: 'PUT',
          body: formData,
        }
      )

      if (!res.ok) throw new Error()

      onUpdated(isoDate)
      toast.success('تاریخ شروع دوره بروزرسانی شد')
      onClose()
    } catch {
      toast.error('خطا در بروزرسانی تاریخ دوره')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <ShamsiDatePicker onChange={handleStartCourseDateChange} initialDate={date ? date.toDate() : new Date()}/>
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
