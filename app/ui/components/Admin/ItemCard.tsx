export function ItemCard({
    icon,
    label,
    value,
    onClick,
  }: {
    icon: React.ReactNode
    label: string
    value: any
    onClick: () => void
  }) {
    return (
      <div
        onClick={onClick}
        className="cursor-pointer bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition p-4 flex items-center gap-4"
      >
        <div className="text-blue-600 dark:text-blue-400">
          {icon}
        </div>
  
        <div className="flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <div className="text-base font-medium text-gray-800 dark:text-gray-100">
            {value}
          </div>
        </div>
      </div>
    )
  }
  