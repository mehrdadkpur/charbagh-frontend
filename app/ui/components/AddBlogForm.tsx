"use client"

import { useState, ChangeEvent, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import UploadInput from "@/app/ui/components/UploadInput"
import toast from "react-hot-toast"
import { IBlog, IUser } from "@/lib/types"
import { API_BASE_URL } from "@/lib/config"
import Link from "next/link"

const AddBlogForm = ({user}: {user:IUser}) => {
    const router = useRouter()

    const [fields, setFields] = useState<IBlog>({
        id:"",
        blog_title: "",
        blog_text: "",
        blog_img: "",
        userId:user.id,
        status: 0,
        blog_date: "",
        updatedAt:""
      });

    const [file, setFile] = useState<File | null>(null); 
    const [uploading, setUploading] = useState(false)
    const [imagePreview, setImagePreview] = useState('/images/avatar.png');

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFields(prev => ({ ...prev, [name]: value }))
    }

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

          console.log(fields);
          
        const formData = new FormData();
        formData.append("blog_title",fields.blog_title);
        formData.append("blog_text",fields.blog_text);
        formData.append("blog_date",new Date().toISOString());
        formData.append("File",file);
        formData.append("status",fields.status.toString());
        formData.append("userId",fields.userId);
        

        try {
            const response = await fetch(`${API_BASE_URL}/api/Blog/add`, {
              method: "POST",
              body: formData,
            });
        
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText);
            }
        
            toast.success("✅ بلاگ با موفقیت اضافه شد");
            router.push("/user/profile");
          } catch (error) {
            console.error("Upload failed:", error);
            toast.error("❌ خطا در ارتباط با سرور");
          } finally {
            setUploading(false);
          }
        };

    return (
        <form onSubmit={handleSubmit} className="flex justify-center items-start flex-col gap-y-5 font-DanaMedium">
            <div className="w-full flex justify-center items-center gap-x-2">
                <label className="w-1/3" htmlFor="author"> نویسنده: </label>
                <input
                        name="author"
                        className="w-full h-12 border p-3 bg-gray-50 dark:bg-gray-700"
                        value={`${user.firstname} ${user.lastname}`}
                        disabled
                    />
            </div>
            <div className="w-full flex justify-center items-center gap-x-2">
                <label className="w-1/3" htmlFor="blog_title"> موضوع: </label>
                <input
                        name="blog_title"
                        className="w-full h-12 border p-3 bg-gray-50 dark:bg-gray-700"
                        placeholder="موضوع "
                        required
                        value={fields.blog_title}
                        onChange={handleChange}
                    />
            </div>
            <div className="w-full flex justify-center items-center gap-x-2">
                <label className="w-1/3" htmlFor="blog_text"> متن پست: </label>
                <textarea
                        name="blog_text"
                        className="w-full h-60 border p-3 bg-gray-50 dark:bg-gray-700"
                        placeholder="متن پست "
                        required
                        value={fields.blog_text}
                        onChange={handleChange}
                    />
            </div>
            <UploadInput uploadedImage={imagePreview} uploading={uploading} handleImageUpload={handlePhotoSelect}  />
            <div className="w-full flex justify-center items-center flex-col gap-y-3">
                <button 
                    type="submit" 
                    className="w-full p-3 bg-green-600 rounded-lg text-center text-gray-50 hover:bg-green-700 transition-colors"
                >
                    ایجاد پست
                </button>
                <Link href="/user/profile" className="w-full p-3 bg-red-600 rounded-lg text-center text-gray-50 hover:bg-red-700 transition-colors">انصراف</Link>

            </div>
        </form>
    )
}

export default AddBlogForm

