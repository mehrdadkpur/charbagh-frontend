import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import type { PublicTeacher } from "@/lib/contentTypes";

function resolveProfileImage(url: string | null) {
  if (!url) return "/images/avatar.png";
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return `${API_BASE_URL}/${url}`;
}

function TeacherCard({ teacher }: { teacher: PublicTeacher }) {
  const imageUrl = resolveProfileImage(teacher.profileImageUrl);

  return (
    <article className="w-full rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800">
      <div className="flex flex-col items-center gap-4">
        <Image
          src={imageUrl}
          alt={`تصویر ${teacher.firstName} ${teacher.lastName}`}
          width={144}
          height={144}
          unoptimized={imageUrl.startsWith("http")}
          className="size-36 rounded-full border-2 border-mango object-cover"
        />
        <h3 className="text-center text-base font-DanaDemiBold text-gray-800 dark:text-gray-100">
          {teacher.firstName} {teacher.lastName}
        </h3>
        {teacher.experienceYears !== null && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{teacher.experienceYears} سال تجربه آموزشی</p>
        )}
        <Link
          href={`/teachers/${teacher.id}`}
          className="rounded-full bg-mango px-5 py-3 text-sm font-DanaMedium text-gray-900 transition hover:bg-elf hover:text-white dark:bg-elf dark:text-white dark:hover:bg-mango"
        >
          مشاهده رزومه
        </Link>
      </div>
    </article>
  );
}

export default function TeacherGrid({ teachers }: { teachers: PublicTeacher[] }) {
  const activeTeachers = teachers.filter((teacher) => teacher.status === 1);
  if (!activeTeachers.length) {
    return <p className="col-span-full py-8 text-center text-gray-500">در حال حاضر مدرسی برای نمایش وجود ندارد.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-5 p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {activeTeachers.slice(0, 4).map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)}
    </div>
  );
}
