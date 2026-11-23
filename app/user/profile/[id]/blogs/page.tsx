'use client'

import { useEffect, useState } from 'react'
import { IBlog } from '@/lib/types'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Loading from '@/app/loading'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { fetchProfileUser} from '@/lib/requests'
import { API_BASE_URL } from '@/lib/config'
import { ShamsiDate  } from '@/lib/shamsiDate'
import { useParams } from 'next/navigation'
import { BlogStatusHelper } from '@/helper/StatusHelper'
import AddButton from '@/app/ui/components/AddButton'

export default function UserBlogs() {
  const {id} = useParams();

  const [blogs, setBlogs] = useState<IBlog[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedBlogId, setExpandedBlogId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return;
    const fetchUserData = async () => {
      try {
        const data = await fetchProfileUser(id as string);
        setBlogs(data.blogs)
      } catch (err) {
        toast.error('خطای سرور')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [id])

  const handleDeleteConfirm = async (blogId: string) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این عملیات قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "لغو",
    })

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/Blog/${blogId}`, {
          method: "DELETE"
        })

        if (res.ok) {
          setBlogs(blogs.filter((blog) => blog.id !== blogId))
          toast.success('پست با موفقیت حذف شد', { duration: 5000 })
        }
      } catch (error) {
        toast.error('خطا در حذف پست')
        console.error("Error deleting Blog:", error)
      }
    }
  }

  return (
    <div className="p-4 font-Dana max-w-7xl mx-auto">
            <div className="flex justify-between items-center gap-x-4 mb-10">
        <h1 className="text-2xl font-bold text-center">پست های من</h1>
        {<AddButton name="پست" route={`/user/profile/${id}/blogs/Add`} />}
      </div>
      {loading && <Loading />}
      {!loading && blogs.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center h-96 space-y-4 font-DanaDemiBold text-xl">
          <span>تا حالا پستی ایجاد نکردی. برای شروع از دکمه افزودن استفاده کن.</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map(blog => (
          <div key={blog.id} className="border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 p-4 flex flex-col justify-between">
            {blog.blog_img && (
              <div className="w-full h-48 overflow-hidden rounded-xl mb-4">
                <Image
                  priority
                  width={600}
                  height={300}
                  className="w-full h-full object-cover"
                  src={`${API_BASE_URL}${blog.blog_img}`}
                  alt="blog"
                />
              </div>
            )}
            <h2 className="text-lg font-bold mb-2">{blog.blog_title}</h2>
            <div className="text-sm text-justify mb-4 relative">
              <p className={expandedBlogId === blog.id ? '' : 'line-clamp-4'}>{blog.blog_text}</p>
              {blog.blog_text.length > 200 && (
                <button
                  onClick={() =>
                    setExpandedBlogId(expandedBlogId === blog.id ? null : blog.id)
                  }
                  className="text-blue-600 hover:underline mt-2 text-xs"
                >
                  {expandedBlogId === blog.id ? 'کمتر ←' : '← بیشتر'}
                </button>
              )}
            </div>
            <div className="flex flex-col justify-between gap-y-3 mb-4 text-xs text-gray-500 dark:text-gray-300">
              {BlogStatusHelper(blog.status)}
              <div className='w-full flex flex-col gap-y-3'>
                  <span className='flex gap-x-4'>
                    <label> زمان ساخت پست: </label>
                    {ShamsiDate(blog.blog_date)}
                  </span>
                  <span className='flex gap-x-4'>
                    <label>زمان آخرین ویرایش پست:</label>
                    {blog?.updatedAt
                      ? `${ShamsiDate(blog.updatedAt)}`
                      : <span className='text-red-500'>بدون سابقه ویرایش</span> 
                    }
                  </span>

              </div>
            </div>
            <div className="flex justify-between items-center mt-auto">
              <Link
                href={`/user/profile/${blog.id}/blogs/Edit`}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                ویرایش
              </Link>
              <button
                onClick={() => handleDeleteConfirm(blog.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className='flex justify-center mt-10'>
        <Link href={`/user/profile`} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"> بازگشت </Link>
      </div>
    </div>
  )
}
