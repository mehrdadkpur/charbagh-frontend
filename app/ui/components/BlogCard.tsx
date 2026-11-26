import { ShamsiDate } from "@/lib/shamsiDate";
import type { CmsBlog } from "@/lib/contentTypes";
import Image from "next/image";
import Link from "next/link";

export default function BlogCard({ blog }: { blog: CmsBlog }) {
  return (
    <Link href={`/blogs/${blog.id}`} className="group relative flex w-full flex-col rounded-2xl bg-white p-5 shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800 sm:w-[350px] lg:w-[400px]">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
        <Image
          fill
          src={blog.imageUrl || "/images/avatar.png"}
          alt={blog.title}
          unoptimized={Boolean(blog.imageUrl?.startsWith("http"))}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="mt-6 space-y-2 text-center">
        <time className="block text-xs text-mango">{ShamsiDate(blog.createdAt)}</time>
        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-100">{blog.firstName} {blog.lastName}</h4>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{blog.title}</h2>
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{blog.text}</p>
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
        <div className="relative flex size-14 items-center justify-center rounded-full bg-gray-100 transition-transform duration-500 group-hover:rotate-180 group-hover:scale-125 dark:bg-gray-700">
          <div className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-gray-800">
            <svg className="size-5 text-mango" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
