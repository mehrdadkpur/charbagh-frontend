import { API_BASE_URL } from "@/lib/config";
import { ShamsiDate } from "@/lib/shamsiDate";
import { IBlog } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

interface BlogCardProps {
  blog:IBlog
}

const BlogCard = ({ blog }: BlogCardProps) => {

  return (
    <Link
      href={`/blogs/${blog.id}`}
      className="group relative flex flex-col w-full sm:w-[350px] lg:w-[400px] p-5 
                 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl 
                 transition-all duration-300"
    >
      {/* تصویر بلاگ */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl">
        <Image
          fill
          src={blog.imageUrl}
          alt={blog.title}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 
                 (max-width: 1200px) 50vw, 
                 33vw"
        />
      </div>

      {/* محتوا */}
      <div className="mt-6 text-center space-y-2">
        <time className="block text-xs sm:text-sm font-DanaMedium text-mango dark:text-mango-400">
          {ShamsiDate(blog.createdAt)}
        </time>

        <h4 className="text-sm sm:text-xs font-DanaDemiBold text-gray-600 dark:text-gray-100">
          {`${blog.firstName} ${blog.lastName}`}
        </h4>

        <h2 className="text-lg sm:text-xl font-DanaDemiBold text-gray-800 dark:text-gray-100">
          {blog.title}
        </h2>

        <p className="text-xs sm:text-sm font-DanaMedium text-gray-600 dark:text-gray-300 
                      line-clamp-2">
          {blog.text}
        </p>
      </div>

      {/* فلش پایین کارت */}
      <div className="absolute left-1/2 -bottom-8 -translate-x-1/2">
        <div className="relative size-12 sm:size-14 md:size-16 bg-gray-100 dark:bg-gray-700 
                        rounded-full transition-transform duration-500 
                        group-hover:rotate-180 group-hover:scale-125">
          <div className="absolute inset-0 m-auto size-[35px] sm:size-10 md:size-[47px] 
                          bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="size-4 sm:size-5 md:size-6 text-mango dark:text-mango-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="3"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 15.75 7.5-7.5 7.5 7.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
