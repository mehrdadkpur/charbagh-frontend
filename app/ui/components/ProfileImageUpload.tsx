'use client'
import { API_BASE_URL } from '@/lib/config'
import Image from 'next/image'
import { useState } from 'react'

interface ProfileImageUploadProps {
  currentImage?: string
  onUpdate: (url: string) => void
  id:string
}

export default function ProfileImageUpload({ currentImage, onUpdate , id }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
  
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("File", e.target.files[0]);
  
      const response = await fetch(`${API_BASE_URL}/api/User/update-profile-image/${id}`, {
        method: "PUT",
        body: formData,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`خطا در آپلود تصویر: ${errorText}`);
      }
  
      const data = await response.json();
  
      if (data.message) {
        onUpdate(data.url || currentImage);
        window.location.reload();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("آپلود تصویر با خطا مواجه شد.");
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <div className="relative group font-DanaMedium">
      <Image width={64} height={64} src={currentImage || "/images/avatar.png"} alt="Profile" className="w-16 h-16 rounded-full object-cover"/>
      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer text-white">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        {uploading ? 'در حال آپلود...' : 'تغییر تصویر'}
      </label>
    </div>
  )
}
