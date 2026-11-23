'use client';

import Link from "next/link";
import { useState, ChangeEvent, FormEvent } from "react";
import Image from 'next/image';
import toast from "react-hot-toast";
import { Instrument } from "@/lib/types";
import { API_BASE_URL } from "@/lib/config";
import { useRouter } from "next/navigation";

const AddInstrumentForm = () => {
    const router = useRouter();

    const initialFields: Instrument = {
        id: "",
        instrument_name: "",
        instrumentType: 100,
        instrument_description: "",
        originType: 100,
        status:2,
        instrument_img: "",
        courses:[]
      };

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState('/images/avatar.png');
    const [fields, setFields] = useState<Instrument>(initialFields);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            toast.error("لطفاً یک عکس انتخاب کنید");
            return;
          }

          setUploading(true);

        const formData = new FormData();
        formData.append("instrument_name" , fields.instrument_name);
        formData.append("instrument_description" , fields.instrument_description);
        formData.append("originType" , fields.originType.toString());
        formData.append("instrumentType" , fields.instrumentType.toString());
        formData.append("status" , fields.status.toString());
        formData.append("File" , file);

        try {
            const response = await fetch(`${API_BASE_URL}/api/Admin/add-instrument`, {
                method: 'POST',
                body: formData
            });                 
            if (response.ok) {
                toast.success('ساز با موفقیت اضافه شد');
            router.push("/dashboard/instruments")    
            } else {
                const errorText = await response.text();
                toast.error(`❌ خطا: ${errorText}`);
            }
        } catch (error) {
            toast.error('خطا در ثبت ساز');
            console.error('Error adding instrument:', error);
        }finally {
            setUploading(false);
          }
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        const { name, value } = e.target;
      
        setFields(prev => ({
          ...prev,
          [name]:
            name === "instrumentType" || name === "originType"
              ? Number(value)
              : value
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

    return (
        <form onSubmit={handleSubmit} className="container mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 font-DanaMedium">
        <div className="relative">
          <div className="w-full h-64 rounded-3xl overflow-hidden ring-2 ring-sky-500 shadow">
            {imagePreview && (
             <Image
             src={imagePreview}
             alt="instrument preview"
             fill
             className="object-cover rounded-3xl"
             unoptimized
           />           
            )}
          </div>

          <label className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <span
              className={`px-4 py-2 rounded-lg text-white text-sm cursor-pointer transition
              ${uploading ? 'bg-gray-400' : 'bg-sky-600 hover:bg-sky-700'}`}
            >
              {uploading ? 'در حال آپلود...' : 'تغییر عکس'}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={handlePhotoSelect}
              />
            </span>
          </label>
        </div>
        <div className="relative">
          <input
            name="instrument_name"
            required
            value={fields.instrument_name}
            onChange={handleChange}
            className="peer w-full h-12 px-3 pt-7 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder=" "
          />
          <label htmlFor="blog_title" className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400 peer-focus:text-sky-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base transition-all">
          نام ساز
          </label>
        </div>
        <div className="flex items-center gap-x-2">
          <select
            name="instrumentType"
            value={fields.instrumentType}
            onChange={handleChange}
            className="peer w-full h-12 px-1 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="100">نوع ساز را انتخاب کنید</option>
            <option value="0">زهی</option>
            <option value="1">صفحه کلید</option>
            <option value="2">بادی</option>
            <option value="3">کوبه‌ای</option>
            <option value="4">الکتریکی</option>
            <option value="10">سایر</option>
          </select>
        </div>
        <div className="flex items-center gap-x-2">
          <select
            name="originType"
            value={fields.originType}
            onChange={handleChange}
            className="peer w-full h-12 px-1 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="100">مبدا ساز را انتخاب کنید</option>
            <option value="0">غربی</option>
            <option value="1">شرقی</option>
            <option value="2">ایرانی</option>
            <option value="10">سایر</option>
          </select>
        </div>
        <div className="relative">
            <textarea
              name="instrument_description"
              required
              value={fields.instrument_description}
              onChange={handleChange}
              className="peer w-full h-50 px-3 pt-7 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder=" "
            />
            <label htmlFor="blog_text" className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400 peer-focus:text-sky-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base transition-all">
              درباره ساز
            </label>
        </div>
      <div className="flex flex-col gap-y-3 w-full">
        <button className="w-full p-3 bg-green-600 text-white rounded-lg">ثبت ساز</button>
        <Link href="/dashboard/instruments" className="w-full p-3 bg-red-600 text-white text-center rounded-lg">
          انصراف
        </Link>
      </div>
    </form>
    );
}

export default AddInstrumentForm;
