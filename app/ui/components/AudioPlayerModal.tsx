'use client'

import { API_BASE_URL } from '@/lib/config'
import { ISong } from '@/lib/types'
import Modal from 'react-modal'

interface AudioPlayerModalProps {
  modalIsOpen: boolean
  closeModal: () => void
  selectedSong: ISong | null
}

export default function AudioPlayerModal({
  modalIsOpen,
  closeModal,
  selectedSong,
}: AudioPlayerModalProps) {
  if (!selectedSong) return null

  return (
    <Modal
      ariaHideApp={false}
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      className="flex justify-center items-center fixed bottom-1/2 left-0 right-0 z-50 outline-none"
      overlayClassName="fixed inset-0 bg-black/40"
    >
      <div className="w-full md:w-2/3 mx-2 h-20 bg-white dark:bg-gray-900 shadow-2xl flex items-center justify-center px-4 md:px-8 font-Dana rounded-lg">
        <div className="flex flex-col justify-center truncate">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
            {selectedSong.song_title}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {selectedSong.song_artist}
          </span>
        </div>
        <div className="flex-1 px-4 md:px-8">
          <audio
            autoPlay
            controls
            src={`${API_BASE_URL}${selectedSong.song_file_url}`}
            className="w-full"
          />
        </div>

        {/* ❌ Close */}
        <button
          onClick={closeModal}
          className="text-gray-500 hover:text-red-600 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

      </div>
    </Modal>
  )
}
