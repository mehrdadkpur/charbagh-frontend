
interface UserStatusBadgeProps {
  status: number;
}

const statusConfig: Record<
  number,
  { label: string; className: string; dotClassName: string }
> = {
  0: {
    label: "در انتظار تأیید",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
    dotClassName: "bg-amber-500",
  },
  1: {
    label: "فعال",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    dotClassName: "bg-emerald-500",
  },
  2: {
    label: "معلق",
    className:
      "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/20",
    dotClassName: "bg-orange-500",
  },
  3: {
    label: "غیرفعال",
    className:
      "bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-700/50 dark:text-gray-300 dark:ring-gray-500/30",
    dotClassName: "bg-gray-400",
  },
};

export default function UserStatusBadge({
  status,
}: UserStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: "نامشخص",
    className:
      "bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-700 dark:text-gray-300",
    dotClassName: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotClassName}`} />
      {config.label}
    </span>
  );
}
