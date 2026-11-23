'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ISong } from '@/lib/types'
import { API_BASE_URL } from '@/lib/config'

interface Props {
  song: ISong | null
  bookId: string
  onClose: () => void
  setSongs: Dispatch<SetStateAction<ISong[]>>;
}

export default function SongFormModal({ song, bookId, onClose , setSongs }: Props) {

    const [title, setTitle] = useState('')
    const [artist, setArtist] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (song) {
      setTitle(song.song_title)
      setArtist(song.song_artist)
    }
  }, [song])

const submit = async () => {
    try {
      setLoading(true)
  
      const formData = new FormData()
      formData.append('song_title', title)
      formData.append('song_artist', artist)
      formData.append('bookId', bookId)
      if (file) formData.append('File', file)
  
      const url = song
        ? `${API_BASE_URL}/api/profile/update-song/${song.id}`
        : `${API_BASE_URL}/api/profile/add-song`
  
      const res = await fetch(url, {
        method: song ? 'PUT' : 'POST',
        body: formData,
      })
  
      const savedSong = await res.json()
  
      toast.success(song ? 'موسیقی ویرایش شد' : 'موسیقی اضافه شد')
      onClose();
  
      setSongs(prev => song
        ? prev.map(s => s.id === savedSong.id ? savedSong : s)
        : [...prev, savedSong]
      )
    } catch {
      toast.error('خطا در ذخیره موسیقی')
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-xl">

        <h2 className="text-lg font-bold">
          {song ? 'ویرایش موسیقی' : 'افزودن موسیقی'}
        </h2>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="نام موسیقی"
          className="w-full p-3 border rounded-lg"
        />

        <input
          value={artist}
          onChange={e => setArtist(e.target.value)}
          placeholder="نام هنرمند"
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="file"
          accept="audio/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            انصراف
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
          >
            ذخیره
          </button>
        </div>
      </div>
    </div>
  )
}
