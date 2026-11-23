
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UsersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function UsersPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: UsersPaginationProps) {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
  );

  const visiblePages: (number | "...")[] = [];

  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) {
      visiblePages.push("...");
    }
    visiblePages.push(page);
  });

  const buttonClass =
    "inline-flex size-9 items-center justify-center rounded-xl border text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        نمایش{" "}
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {start.toLocaleString("fa-IR")}
        </span>{" "}
        تا{" "}
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {end.toLocaleString("fa-IR")}
        </span>{" "}
        از{" "}
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {totalItems.toLocaleString("fa-IR")}
        </span>{" "}
        کاربر
      </p>

      <nav
        aria-label="صفحه‌بندی کاربران"
        className="flex items-center justify-center gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="صفحه قبلی"
          className={`${buttonClass} border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800`}
        >
          <ChevronRight size={17} />
        </button>

        {visiblePages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? "page" : undefined}
              className={`${buttonClass} ${
                currentPage === page
                  ? "border-elf bg-elf text-white shadow-sm shadow-elf/20"
                  : "border-gray-200 bg-white text-gray-600 hover:border-elf/30 hover:text-elf dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-elf/50"
              }`}
            >
              {page.toLocaleString("fa-IR")}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="صفحه بعدی"
          className={`${buttonClass} border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800`}
        >
          <ChevronLeft size={17} />
        </button>
      </nav>
    </div>
  );
}
