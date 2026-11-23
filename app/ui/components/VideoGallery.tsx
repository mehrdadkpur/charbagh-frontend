"use client"
import { useEffect, useState } from 'react'
import { IVideo } from '@/lib/types'
import Link from 'next/link'
import { fetchAllVideos } from '@/lib/requests';
import { shamsiDate } from "@/lib/shamsiDate";


    // 📌 دسته‌بندی‌ها مطابق Enum
    const categories = [
        { id: 0, name: "همه دسته بندی ها" },
        { id: 1, name: "کلاسیک" },
        { id: 2, name: "پاپ" },
        { id: 3, name: "سنتی" },
        { id: 4, name: "آموزشی" },
        { id: 10, name: "سایر" },
      ];
      
      // 📌 تبدیل مقدار عددی Enum به نام دسته‌بندی
      const categoryLabels: Record<number, string> = {
        1: "کلاسیک",
        2: "پاپ",
        3: "سنتی",
        4: "آموزشی",
        10: "سایر",
      };

export default function VideoGallery() {
    const [selectedCategory, setSelectedCategory] = useState<number>(0)
    const [videos, setVideos] = useState<IVideo[]>([])
    const [hoveredVideoId, setHoveredVideoId] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const videosPerPage = 12

    useEffect(() => {
        const loadPhotos = async () => {
          try {
            const data = await fetchAllVideos();
            setVideos(data);
          } catch (error) {
            console.error("❌ Error fetching Videos:", error);
          }
        };
        loadPhotos();
      }, []);
    

    const handleCategoryClick = async (category: number) => {
        setSelectedCategory(category)
        setCurrentPage(1)
    }

    const filteredVideos = selectedCategory === 0 
    ? videos 
    : videos.filter(video => video.category === selectedCategory)

    const totalPages = Math.ceil(filteredVideos.length / videosPerPage)
    const indexOfLastVideo = currentPage * videosPerPage
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage
    const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo)

    const Pagination = () => (
        <div className="flex justify-center gap-2 mt-8 font-DanaMedium">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
          >
            قبلی
          </button>
    
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white dark:bg-elf"
                  : "bg-gray-200 dark:bg-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}
    
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 dark:bg-gray-600 text-white rounded-lg disabled:bg-gray-300"
          >
            بعدی
          </button>
        </div>
      );
      
    return (
        <div className="flex justify-center flex-col mb-10">
            <main className="flex-1 p-4">
                {/* Category Buttons */}
                <div className="flex items-center justify-center py-4 md:py-8 flex-wrap font-DanaMedium">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`${
                selectedCategory === category.id
                  ? "text-blue-700 dark:text-mango dark:border-mango dark:bg-gray-600 border-blue-600 hover:bg-blue-700 hover:text-white"
                  : "text-gray-900 dark:text-gray-50 dark:bg-gray-600 border-white hover:border-gray-200"
              } border bg-white rounded-full px-5 py-2.5 text-center me-3 mb-3`}
            >
              {category.name}
            </button>
          ))}
        </div>

                {/* videos Grid */}
                {currentVideos.length === 0 ? (
                    <div className="w-full h-96 flex justify-center items-center text-xl font-DanaDemiBold">
                        <p>هنوز هیچ فیلمی در دیتابیس وجود ندارد.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {currentVideos.map((video) => (
                                <div onMouseEnter={() => setHoveredVideoId(video.id)} onMouseLeave={() => setHoveredVideoId(null)} key={video.id} className=" relative overflow-hidden rounded-lg">
                                    <iframe className="w-full md:h-[350px] rounded-xl" src={video.video_url}  allowFullScreen ></iframe>
                                    <div className={`absolute bottom-0 w-full bg-black/40 text-white px-4 py-2 transition-transform duration-500 ${hoveredVideoId === video.id ? 'translate-y-0' : 'translate-y-full'}`}>
                                        <div>{video.video_title}</div>
                                        <div>{video.vodeo_description}</div>
                                        <div>{video.video_date? shamsiDate({ date: video.video_date }): "تاریخ نامشخص"}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination />
                    </>
                )}
            </main>
            <div className="w-40 mx-auto mt-5 font-DanaMedium">
                <Link href={"/galleries"} className="w-full p-2 bg-red-600 rounded-lg text-xl text-center text-white" > بازگشت به گالری</Link>
            </div>
        </div>
    )
}
