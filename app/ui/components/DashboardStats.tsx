interface StatCardProps {
  title: string;
  count?: number;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard = ({ title, count, icon, loading = false }: StatCardProps) => (
  <article className="flex min-w-0 items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950 sm:p-5">
    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-elf/10 text-elf dark:bg-elf/15">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="truncate text-sm text-gray-500 dark:text-gray-400">{title}</p>
      {loading ? (
        <span className="mt-2 block h-7 w-16 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
      ) : (
        <p className="mt-1 text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white">
          {count == null ? "—" : count.toLocaleString("fa-IR")}
        </p>
      )}
    </div>
  </article>
);

export default StatCard;
