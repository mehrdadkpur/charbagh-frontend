"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UploadInput from "@/app/ui/components/UploadInput";
import toast from "react-hot-toast";
import { IPhoto } from "@/lib/types";
import ShamsiDatePicker from "@/app/ui/components/ShamsiDatePicker";
import { API_BASE_URL } from "@/lib/config";

const categories = [
  { id: 1, name: "کلاسیک" },
  { id: 2, name: "پاپ" },
  { id: 3, name: "سنتی" },
  { id: 4, name: "آموزشی" },
  { id: 10, name: "سایر" },
];

const AddPhotoForm = () => {
  const router = useRouter();
  const [fields, setFields] = useState<IPhoto>({
    id: "",
    photo_title: "",
    photo_url: "",
    photo_date: "",
    photo_description: "",
    category: 10,
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("/images/avatar.png");

  useEffect(() => {
    if (!fields.photo_date) {
      const today = new Date().toISOString().split("T")[0]; 
      setFields((prev) => ({ ...prev, photo_date: today }));
    }
  }, [fields.photo_date]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (gregorianDate: string) => {
    setFields((prev) => ({ ...prev, photo_date: gregorianDate }));
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFields((prev) => ({
      ...prev,
      category: parseInt(e.target.value),
    }));
  };

  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      toast.error("لطفاً یک عکس انتخاب کنید");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("File", file);
    formData.append("Photo_title", fields.photo_title);
    formData.append("Photo_description", fields.photo_description);
    if(fields.photo_date) formData.append("Photo_date", fields.photo_date);
    formData.append("Category", fields.category.toString());

    try {
      const response = await fetch(`${API_BASE_URL}/api/Admin/add-photo`, {
        method: "POST",
        body: formData,
      });      

      if (response.ok) {
        toast.success("✅ عکس با موفقیت اضافه شد");
        router.push('/dashboard/galleries/photos');
      } else {
        const errorText = await response.text();
        toast.error(`❌ خطا: ${errorText}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("❌ خطا در ارتباط با سرور");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-y-5">
      <div className="flex gap-x-2 items-center">
        <label className="w-1/3" htmlFor="photo_title">نام عکس:</label>
        <input
          name="photo_title"
          type="text"
          className="w-full h-12 border p-3 bg-gray-50 dark:bg-gray-700"
          placeholder="نام عکس"
          required
          value={fields.photo_title}
          onChange={handleChange}
        />
      </div>

      <div className="flex gap-x-2 items-center">
        <label className="w-1/3" htmlFor="photo_description">توضیحات:</label>
        <input
          name="photo_description"
          type="text"
          className="w-full h-12 border p-3 bg-gray-50 dark:bg-gray-700"
          placeholder="توضیحات"
          required
          value={fields.photo_description}
          onChange={handleChange}
        />
      </div>

      <div className="flex gap-x-2 items-center">
        <label className="w-1/3">تاریخ:</label>
        <div className="w-2/3">
          <ShamsiDatePicker
            onChange={handleDateChange}
            initialDate={
              fields.photo_date && !isNaN(Date.parse(fields.photo_date))
                ? new Date(fields.photo_date)
                : new Date()
            }
          />
        </div>
      </div>

      <div className="flex gap-x-2 items-center">
        <label className="w-1/3" htmlFor="category">دسته‌بندی:</label>
        <select
          name="category"
          className="w-2/3 h-12 border p-3 bg-gray-50 dark:bg-gray-700"
          required
          onChange={handleCategoryChange}
          value={fields.category || 10}
        >
          <option value="">انتخاب کنید</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <UploadInput uploadedImage={imagePreview} handleImageUpload={handlePhotoSelect} uploading={uploading} />

      <div className="flex flex-col gap-y-3 w-full">
        <button
          type="submit"
          disabled={uploading}
          className="w-full p-3 bg-green-600 rounded-lg text-center text-white hover:bg-green-700 transition-colors"
        >
          {uploading ? "در حال ارسال..." : "ایجاد عکس"}
        </button>
        <Link
          href="/dashboard/galleries/photos"
          className="w-full p-3 bg-red-600 rounded-lg text-center text-white hover:bg-red-700 transition-colors"
        >
          انصراف
        </Link>
      </div>
    </form>
  );
};

export default AddPhotoForm;
