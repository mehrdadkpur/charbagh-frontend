export function Modal({
    title,
    children,
    onClose,
  }: {
    title: string
    children: React.ReactNode
    onClose: () => void
  }) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
          <h2 className="text-lg font-bold">{title}</h2>
          {children}
        </div>
      </div>
    )
  }
  
  export function ModalActions({
    loading,
    onCancel,
    onSubmit,
  }: {
    loading: boolean
    onCancel: () => void
    onSubmit: () => void
  }) {
    return (
      <div className="flex justify-end gap-3 pt-4">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
          انصراف
        </button>
        <button
          disabled={loading}
          onClick={onSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? 'در حال ذخیره...' : 'ذخیره'}
        </button>
      </div>
    )
  }
  