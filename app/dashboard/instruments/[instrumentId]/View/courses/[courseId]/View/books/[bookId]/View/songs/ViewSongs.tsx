'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import { IBook, ICourse, Instrument, ISong } from '@/lib/types'
import { Plus, Play, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import AudioPlayerModal from '@/app/ui/components/AudioPlayerModal'
import SongFormModal from './SongFormModal'
import { API_BASE_URL } from '@/lib/config'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'

interface Props {
  instrument: Instrument
  course: ICourse
  book: IBook
  songs: ISong[];
  setSongs: Dispatch<SetStateAction<ISong[]>>;
}

export default function ViewSongs({ instrument, course, book, songs , setSongs }: Props) {

  const [playerSong, setPlayerSong] = useState<ISong | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)



  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 font-Dana">

      {/* ===== Header ===== */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          موسیقی‌های {book.book_name} ({instrument.instrument_name})
        </h1>
      </div>

      {/* ===== Songs List ===== */}
      {songs.length === 0 ? (
        <p className="text-center text-gray-500">موسیقی‌ای ثبت نشده</p>
      ) : (
        <div className="space-y-3">
          {songs.map(song => (
            <div
              key={song.id}
              className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow transition"
            >
              <div className="flex flex-col">
                <span className="font-semibold">{song.song_title}</span>
                <span className="text-sm text-gray-500">
                  {song.song_artist}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPlayerSong(song)
                    setPlayerOpen(true)
                  }}
                  className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
                >
                  <Play size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Back ===== */}
      <Link
        href={`/dashboard/instruments/${instrument.id}/View/courses/${course.id}/View/books`}
        className="block text-center bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
      >
        بازگشت
      </Link>

      {/* ===== Modals ===== */}
      {playerOpen && (
        <AudioPlayerModal
          modalIsOpen={playerOpen}
          closeModal={() => setPlayerOpen(false)}
          selectedSong={playerSong}
        />
      )}
    </div>
  )
}
