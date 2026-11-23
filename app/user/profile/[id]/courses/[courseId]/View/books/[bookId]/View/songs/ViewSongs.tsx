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
  const { id } = useParams();

  const [playerSong, setPlayerSong] = useState<ISong | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)

  const [editSong, setEditSong] = useState<ISong | null>(null)
  const [songModalOpen, setSongModalOpen] = useState(false);

  const handleDeleteConfirm = async (songId:string) => {

    const result = await Swal.fire({
        title: "آیا مطمئن هستید؟",
        text: "این عملیات قابل بازگشت نیست!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "بله، حذف کن",
        cancelButtonText: "لغو",
      });

      if(result.isConfirmed){

          
          try {
              const res = await fetch(`${API_BASE_URL}/api/Profile/delete-song/${songId}`, {
                  method: "DELETE"
                })
                
                if (res.ok) {
                    toast.success("حذف موسیقی موفقیت آمیز بود");
                    
                    const updatedSongs = songs.filter(song => song.id !== songId);
                    setSongs(updatedSongs);                    
                }
                
            } catch (error) {
                toast.error("خطا در حذف موسیقی")
                console.error("Error deleting Song:", error)
            }
        }
}

const isCourseTeacher = course.teacherId === id

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 font-Dana">

      {/* ===== Header ===== */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          موسیقی‌های {book.book_name} ({instrument.instrument_name})
        </h1>

        {isCourseTeacher&&(
          <button
            onClick={() => {
              setEditSong(null)
              setSongModalOpen(true)
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={18} />
            افزودن موسیقی
          </button>
        )}
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
                {isCourseTeacher&& (
                  <>
                <button
                  onClick={() => {
                    setEditSong(song)
                    setSongModalOpen(true)
                  }}
                  className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                  >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={()=>handleDeleteConfirm(song.id)}
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700"
                  >
                  <Trash2 size={18} />
                </button>
                  </>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Back ===== */}
      <Link
        href={`/user/profile/${id}/courses/${course.id}/View/books`}
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

      {songModalOpen && (
        <SongFormModal
          song={editSong}
          setSongs = {setSongs}
          bookId={book.id}
          onClose={() => setSongModalOpen(false)}
        />
      )}
    </div>
  )
}
