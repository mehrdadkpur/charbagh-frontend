'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '@/lib/config'
import { fetchProfileInstruments } from '@/lib/requests'

interface Instrument {
  id: string
  instrument_name: string
}

interface Props {
  courseId: string
  currentInstrumentId: string
  onClose: () => void
  onUpdated: (instrument: Instrument) => void
}

export default function EditCourseInstrument({
  courseId,
  currentInstrumentId,
  onClose,
  onUpdated,
}: Props) {
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [selectedId, setSelectedId] = useState(currentInstrumentId)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadInstruments = async () => {
      try {
        const data = await fetchProfileInstruments();
        setInstruments(data)
      } catch {
        toast.error('خطا در دریافت لیست سازها')
      }
    }

    loadInstruments()
  }, [])

  const submit = async () => {
    if (!selectedId) {
      toast.error('لطفاً یک ساز انتخاب کنید')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('instrumentId', selectedId)

      const res = await fetch(
        `${API_BASE_URL}/api/profile/change-course-instrument/${courseId}`,
        {
          method: 'PUT',
          body: formData,
        }
      )

      if (!res.ok) throw new Error()

      const selectedInstrument = instruments.find(i => i.id === selectedId)!
      onUpdated(selectedInstrument)

      toast.success('ساز دوره بروزرسانی شد')
      onClose()
    } catch {
      toast.error('خطا در بروزرسانی ساز دوره')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full p-3 border rounded-lg"
      >
        <option value="">انتخاب ساز</option>
        {instruments.map((instrument) => (
          <option key={instrument.id} value={instrument.id}>
            {instrument.instrument_name}
          </option>
        ))}
      </select>

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
