
import Link from "next/link";
import {
  Eye,
  LockKeyholeOpen,
  Pencil,
} from "lucide-react";

interface UserActionsProps {
  status: number
  userId: string;
  onUnblock: (userId: string) => void;
  disabled?: boolean;
}

const actionClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elf/40 disabled:pointer-events-none disabled:opacity-50";

export default function UserActions({
  status,
  userId,
  onUnblock,
  disabled = false,
}: UserActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/dashboard/users/${userId}`}
        title="مشاهده جزئیات"
        aria-label="مشاهده جزئیات کاربر"
        className={`${actionClass} border-gray-200 bg-white text-gray-600 hover:border-elf/30 hover:bg-elf/5 hover:text-elf dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-elf/10 dark:hover:text-emerald-300`}
      >
        <Eye size={16} />
        <span className="hidden xl:inline">مشاهده</span>
      </Link>

      <Link
        href={`/dashboard/users/${userId}/edit`}
        title="ویرایش کاربر"
        aria-label="ویرایش کاربر"
        className={`${actionClass} border-elf/20 bg-elf/5 text-elf hover:bg-elf/10 dark:border-elf/30 dark:bg-elf/10 dark:text-emerald-300 dark:hover:bg-elf/20`}
      >
        <Pencil size={16} />
        <span className="hidden xl:inline">ویرایش</span>
      </Link>

      {
         status == 0 || status == 2 || status == 3 ?
      <button
        type="button"
        onClick={() => onUnblock(userId)}
        disabled={disabled}
        title="رفع مسدودی کاربر"
        aria-label="رفع مسدودی کاربر"
        className={`${actionClass} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/20`}
      >
        <LockKeyholeOpen size={16} />
        <span className="hidden xl:inline">رفع مسدودی</span>
      </button> 
      : 

            <button
        type="button"
        onClick={() => onUnblock(userId)}
        disabled={disabled}
        title="غیرفعال کردن"
        aria-label=" غیرفعال کردن کاربر"
        className={`${actionClass} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/20`}
      >
        <LockKeyholeOpen size={16} />
        <span className="hidden xl:inline"> غیرفعال کردن</span>
      </button> 
      }
    </div>
  );
}
