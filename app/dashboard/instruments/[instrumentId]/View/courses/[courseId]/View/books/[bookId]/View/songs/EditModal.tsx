'use client'

export default function EditModal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold">{title}</h2>
        {children}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  )
}
