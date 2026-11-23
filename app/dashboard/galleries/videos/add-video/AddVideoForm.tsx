'use client';

import Link from 'next/link';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { IVideo } from '@/lib/types';
import ShamsiDatePicker from '@/app/ui/components/ShamsiDatePicker';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '@/lib/config';

const categories = [
  { id: 0, name: "کلاسیک" },
  { id: 1, name: "پاپ" },
  { id: 2, name: "سنتی" },
  { id: 3, name: "آموزشی" },
  { id: 10, name: "سایر" },
];

const EditVideoForm = () => {
  
  const router = useRouter();

  const [fields, setFields] = useState<IVideo>({
    id: "0", 
    video_title: "", 
    video_url: "", 
    video_date: new Date().toString(), 
    video_description: "",
    category: 0, 
  });

 
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: value }))
    }
  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFields((prev) => ({
      ...prev,
      category: parseInt(e.target.value),
    }));
  };
  const handleDateChange = (gregorianDate: string) => {
      setFields(prev => ({...prev, video_date: new Date(gregorianDate).toISOString() })); 
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: 'ثبت تغییرات؟',
      text: 'آیا از اعمال تغییرات مطمئن هستید؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'بله، ثبت کن',
      cancelButtonText: 'خیر',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });

    const formData = new FormData();
    formData.append("video_title" , fields.video_title);
    formData.append("video_url" , fields.video_url);
    formData.append("video_description" , fields.video_description);
    formData.append("category" , fields.category.toString());
    if (fields.video_date)formData.append("video_date", new Date(fields.video_date).toISOString());

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Admin/add-video`, {
          method: 'POST',
          body: formData
        });
        
        const text = await response.text();
        console.log("Server response:", text);
        if (response.ok) {
          await Swal.fire('ثبت شد!', 'ویدیو با موفقیت ثبت شد.', 'success');
          router.push('/dashboard/galleries/videos');
        } else {
          throw new Error('Failed to update video');
        }
      } catch (error) {
        console.error('Error updating video:', error);
        Swal.fire('خطا', 'مشکلی در ثبت تغییرات به وجود آمد.', 'error');
        
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto flex flex-col gap-y-6">
      <div className="flex items-center gap-x-2">
        <label className="w-1/3" htmlFor="video_title">نام فیلم:</label>
        <input
          name="video_title"
          type="text"
          className="flex-1 h-12 border p-3 rounded bg-gray-50 dark:bg-gray-700"
          placeholder="نام فیلم"
          required
          value={fields.video_title}
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center gap-x-2">
        <label className="w-1/3" htmlFor="video_description">توضیحات:</label>
        <input
          name="video_description"
          type="text"
          className="flex-1 h-12 border p-3 rounded bg-gray-50 dark:bg-gray-700"
          placeholder="توضیحات"
          required
          value={fields.video_description}
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center gap-x-2">
        <label className="w-1/3" htmlFor="video_url">آدرس فیلم:</label>
        <input
          name="video_url"
          type="text"
          className="flex-1 h-12 border p-3 rounded bg-gray-50 dark:bg-gray-700"
          placeholder="آدرس فیلم"
          required
          value={fields.video_url}
          onChange={handleChange}
        />
      </div>
      <div className="flex items-center gap-x-2">
        <label className="w-1/3">تاریخ تهیه فیلم:</label>
        <div className="flex-1">
        <ShamsiDatePicker
          onChange={handleDateChange}
          initialDate={
            fields.video_date && !isNaN(Date.parse(fields.video_date))
              ? new Date(fields.video_date)
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

      <div className="flex flex-col gap-3 mt-6">
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
        >
          ثبت
        </button>
        <Link
          href="/dashboard/galleries/videos"
          className="w-full text-center p-3 bg-red-600 rounded-lg text-white hover:bg-red-700 transition"
        >
          انصراف
        </Link>
      </div>
    </form>
  );
};

export default EditVideoForm;
