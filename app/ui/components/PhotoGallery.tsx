"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IPhoto } from "@/lib/types";
import { fetchPhotos } from "@/lib/requests";
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

export default function PhotoGallery() {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [hoveredPhotoId, setHoveredPhotoId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 12;

  // 📌 گرفتن عکس‌ها از API
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const data = await fetchPhotos();
        setPhotos(data);
      } catch (error) {
        console.error("❌ Error fetching photos:", error);
      }
    };
    loadPhotos();
  }, []);

  // 📌 فیلتر عکس‌ها بر اساس دسته‌بندی
  const filteredPhotos =
    selectedCategory === 0
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory);

  // 📌 صفحه‌بندی
  const totalPages = Math.ceil(filteredPhotos.length / photosPerPage);
  const indexOfLastPhoto = currentPage * photosPerPage;
  const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
  const currentPhotos = filteredPhotos.slice(indexOfFirstPhoto, indexOfLastPhoto);

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  // 📌 کامپوننت صفحه‌بندی
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
    <div>
      <main className="flex-1 p-4">
        {/* 📌 دکمه‌های دسته‌بندی */}
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

        {/* 📸 نمایش عکس‌ها */}
        {currentPhotos.length === 0 ? (
          <div className="w-full h-96 flex justify-center items-center text-xl font-DanaDemiBold">
            <p>هیچ عکسی در این دسته بندی وجود ندارد.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
              {currentPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onMouseEnter={() => setHoveredPhotoId(photo.id)}
                  onMouseLeave={() => setHoveredPhotoId(null)}
                  className="aspect-square relative overflow-hidden rounded-lg"
                >
                  <Image
                    src={photo.photo_url}
                    alt={photo.photo_title}
                    fill
                    sizes="(max-width: 768px) 20vw, 33vw"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute bottom-0 w-full bg-black/60 text-white px-4 py-2 transition-transform duration-500 ${
                      hoveredPhotoId === photo.id
                        ? "translate-y-0"
                        : "translate-y-full"
                    }`}
                  >
                    <div>{photo.photo_title}</div>
                    <div>{photo.photo_description}</div>
                    <div>
                      دسته بندی:{" "}
                      {categoryLabels[photo.category] || "نامشخص"}
                    </div>
                    <div>
                      {photo.photo_date
                        ? shamsiDate({ date: photo.photo_date })
                        : "تاریخ نامشخص"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination />
          </>
        )}
      </main>

      <div className="w-40 mx-auto mt-5 font-DanaMedium">
        <Link
          href={"/galleries"}
          className="w-full p-2 bg-red-600 rounded-lg text-xl text-center text-white"
        >
          بازگشت به گالری
        </Link>
      </div>
    </div>
  );
}
