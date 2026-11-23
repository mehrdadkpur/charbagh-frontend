'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import UploadInput from '@/app/ui/components/UploadInput';
import toast from 'react-hot-toast';
import { IBlog, IUser } from '@/lib/types';
import { fetchProfileBlog } from '@/lib/requests';
import { API_BASE_URL } from '@/lib/config';
import Image from 'next/image';
import Link from 'next/link';

const EditBlogForm = () => {
    const { id } = useParams();
    const router = useRouter();

    const [fields, setFields] = useState<IBlog>({
        id:"",
        blog_title: "",
        blog_text: "",
        blog_img: "",
        userId:"",
        status: 0,
        blog_date: "",
        updatedAt:new Date(Date.now())
      });
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null); 
    const [user, setUser] = useState<IUser>();
    const [originalFields, setOriginalFields] = useState<IBlog | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlogData = async () => {
            try {
                const data = await fetchProfileBlog(id as string);
                setFields({...data , userId:data.user?.id || ""});
                setOriginalFields({...data, userId: data.user?.id || "" });
                setUser(data.user)
                setLoading(false);
            } catch (error) {
                console.error('Error fetching Blogs:', error);
                setError('Failed to fetch Blogs data');
                setLoading(false);
            }
        };

        if (id) {
            fetchBlogData();
        }
    }, [id]);

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

        const hasChanged =
        JSON.stringify(fields) !== JSON.stringify(originalFields) || file !== null;
      
      if (!hasChanged) {
        toast.error("❗ شما هیچ تغییری نداشته‌اید");
        return;
      }
      
        const formData = new FormData();
        formData.append("blog_title",fields.blog_title);
        formData.append("blog_text",fields.blog_text);
        formData.append("updatedAt" , new Date(Date.now()).toISOString())
        if(file)formData.append("File",file);
        formData.append("status","0");
        formData.append("userId",fields.userId);
        

        try {
            const response = await fetch(`${API_BASE_URL}/api/Blog/update/${id}`, {
              method: "PUT",
              body: formData,
            });
        
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText);
            }
        
            toast.success("✅ بلاگ با موفقیت ویرایش شد");
            router.push(`/user/profile/${user?.id}/blogs`);
          } catch (error) {
            console.error("Upload failed:", error);
            toast.error("❌ خطا در ارتباط با سرور");
          } finally {
            setUploading(false);
          }
        };

    if (loading) return <Loading />;
    if (error) return <p>{error}</p>;


    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6 font-DanaMedium">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-sky-500 dark:ring-sky-700">
                <Image width={64} height={64} src={`${API_BASE_URL}${fields.blog_img}`} alt="نویسنده" className="w-full h-full object-cover" />
                </div>
                <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{user?.firstname} {user?.lastname}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">نویسنده بلاگ</p>
                </div>
            </div>
            <div className="relative">
                <input
                name="blog_title"
                required
                value={fields.blog_title}
                onChange={handleChange}
                className="peer w-full h-12 px-3 pt-5 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder=" "
                />
                <label htmlFor="blog_title" className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400 peer-focus:text-sky-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base transition-all">
                موضوع بلاگ
                </label>
            </div>
            <div className="relative">
                <textarea
                name="blog_text"
                required
                value={fields.blog_text}
                onChange={handleChange}
                className="peer w-full h-40 px-3 pt-5 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder=" "
                />
                <label htmlFor="blog_text" className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400 peer-focus:text-sky-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base transition-all">
                متن بلاگ
                </label>
            </div>
            <div className="w-full">
                <UploadInput uploadedImage={imagePreview} uploading={uploading} handleImageUpload={handlePhotoSelect} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                type="submit"
                className="flex-1 p-3 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center gap-2 transition"
                >
                ویرایش پست
                </button>
                <Link
                href={`/user/profile/${user?.id}/blogs`}
                className="flex-1 p-3 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center gap-2 transition"
                >
                انصراف
                </Link>
            </div>
        </form>
     );
 }
 export default EditBlogForm;