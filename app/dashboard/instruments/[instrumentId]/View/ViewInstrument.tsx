'use client'

import { useState } from 'react'
import { Instrument } from '@/lib/types'
import {
  BookOpen,
  Calendar,
  Guitar,
  GraduationCap,
  Info,
  Layers,
} from 'lucide-react'
import { ItemCard } from '@/app/ui/components/Profile/ItemCard'
import { InstrumentStatusHelper, StatusHelper } from '@/helper/StatusHelper'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import EditModal from './EditModal'
import { Dispatch, SetStateAction } from 'react'
import InstrumentImage from '@/app/ui/components/Admin/Instrument/InstrumentImage'
import EditInstrumentName from '@/app/ui/components/Admin/Instrument/Editors/EditInstrumentName'
import EditInstrumentDescription from '@/app/ui/components/Admin/Instrument/Editors/EditInstrumentDescription'
import EditInstrumentStatus from '@/app/ui/components/Admin/Instrument/Editors/EditInstrumentStatus'
import EditInstrumentType from '@/app/ui/components/Admin/Instrument/Editors/EditInstrumentType'
import EditInstrumentOrigin from '@/app/ui/components/Admin/Instrument/Editors/EditInstrumentOrigin'
import { OriginHelper, TypeHelper } from '@/helper/InstrumentTypeHelper'

interface Props {
  instrument: Instrument
  setInstrument: Dispatch<SetStateAction<Instrument | null>>
}

export default function ViewInstrument({instrument, setInstrument}: Props) {

  const router = useRouter();
  const [openModal, setOpenModal] = useState<null | 'name' | 'description' | 'status' | 'course' | 'type' | 'origin'>(null)

  const truncate = (text: string, limit = 100) =>
    text.length > limit ? text.slice(0, limit) + '...' : text

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 font-Dana">

      {/* ===== Instrument Image ===== */}
      <InstrumentImage
        instrumentId={instrument.id}
        imagePath={instrument.instrument_img}
        onUpdated={(newImage) =>
          setInstrument((prev) =>
            prev ? { ...prev, instrument_img: newImage, status: 0 } : prev
          )
        }
      />

      {/* ===== Items ===== */}
      <div className="space-y-4">

        <ItemCard
          icon={<Layers />}
          label="نام ساز"
          value={instrument.instrument_name}
          onClick={() => setOpenModal('name')}
        />

        <ItemCard
          icon={<Info />}
          label="توضیحات ساز"
          value={truncate(instrument.instrument_description)}
          onClick={() => setOpenModal('description')}
        />

        <ItemCard
          icon={<GraduationCap />}
          label="وضعیت"
          value={InstrumentStatusHelper(instrument.status)}
          onClick={() =>setOpenModal('status')}
        />

          <ItemCard
          icon={<Guitar />}
          label="نوع ساز"
          value={TypeHelper(instrument.instrumentType)}
          onClick={() => setOpenModal('type')}
        />
          <ItemCard
          icon={<Guitar />}
          label="مبدا ساز"
          value={OriginHelper(instrument.originType)}
          onClick={() => setOpenModal('origin')}
        />
        <ItemCard
          icon={<BookOpen />}
          label="دوره ها ، کتاب ها و موسیقی ها"
          value={<span>{instrument.courses.map((c) => c.course_name).join('، ')}</span>}
          onClick={() => {router.push(`/dashboard/instruments/${instrument.id}/View/courses`)}}
        />
      </div>

      <Link
        href={`/dashboard/instruments`}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex justify-center"
      >
        بازگشت به سازها
      </Link>

      {/* ===== Modals ===== */}

      {openModal === 'name' && (
        <EditModal title="ویرایش نام ساز" onClose={() => setOpenModal(null)}>
          <EditInstrumentName
            instrumentId={instrument.id}
            initialValue={instrument.instrument_name}
            onClose={() => setOpenModal(null)}
            onUpdated={(newName) =>
              setInstrument((prev) =>
                prev ? { ...prev, instrument_name: newName } : prev
              )
            }
          />
        </EditModal>
      )}

      {openModal === 'description' && (
        <EditModal title="ویرایش توضیحات ساز" onClose={() => setOpenModal(null)}>
          <EditInstrumentDescription
            instrumentId={instrument.id}
            initialValue={instrument.instrument_description}
            onClose={() => setOpenModal(null)}
            onUpdated={(newDesc) =>
              setInstrument((prev) =>
                prev
                  ? { ...prev, instrument_description: newDesc }
                  : prev
              )
            }
          />
        </EditModal>
      )}

      {openModal === 'status' && (
        <EditModal title="ویرایش وضعیت ساز" onClose={() => setOpenModal(null)}>
          <EditInstrumentStatus
            instrumentId={instrument.id}
            initialValue={instrument.status}
            onClose={() => setOpenModal(null)}
            onUpdated={(newStatus) =>
              setInstrument((prev) =>
                prev
                  ? { ...prev, status: newStatus }
                  : prev
              )
            }
          />
        </EditModal>
      )}

      {openModal === 'type' && (
        <EditModal title="ویرایش نوع ساز" onClose={() => setOpenModal(null)}>
          <EditInstrumentType
            instrumentId={instrument.id}
            initialValue={instrument.instrumentType}
            onClose={() => setOpenModal(null)}
            onUpdated={(newType) =>
              setInstrument((prev) =>
                prev ? { ...prev, instrumentType: newType } : prev
              )
            }
          />
        </EditModal>
      )}

      {openModal === 'origin' && (
        <EditModal title="ویرایش مبدا ساز" onClose={() => setOpenModal(null)}>
          <EditInstrumentOrigin
            instrumentId={instrument.id}
            initialValue={instrument.originType}
            onClose={() => setOpenModal(null)}
            onUpdated={(newOrigin) =>
              setInstrument((prev) =>
                prev ? { ...prev, originType: newOrigin } : prev
              )
            }
          />
        </EditModal>
      )}        
    </div>
  )
}
