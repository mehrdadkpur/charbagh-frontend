"use client"

import AddButton from "@/app/ui/components/AddButton";
import Search from "@/app/ui/components/Search";
import Link from "next/link";
import { useEffect, useState } from "react"
import { IVideo } from "@/lib/types";
import { shamsiDate } from "@/lib/shamsiDate";
import Swal from "sweetalert2";
import { fetchAdminVideos } from "@/lib/requests";
import { API_BASE_URL } from "@/lib/config";


const Videos = () => {
    const [videos, setVideos] = useState<IVideo[]>([]);
    const [query,setQuery]=useState({text:""});
    const [filteredVideos , setFilteredVideos]=useState <IVideo[]>([]);

    useEffect(() => {
        const fetchVideosData = async () => {
            const data = await fetchAdminVideos()
            setVideos(data); 
            setFilteredVideos(data);
        }
        fetchVideosData();
    }, [])

  const handleDeleteVideo = async (videoId: string) => {
    const result = await Swal.fire({
      title: "آیا مطمئنی؟",
      text: "این عملیات قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذفش کن",
      cancelButtonText: "نه، منصرف شدم",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });
  
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/Admin/delete-video/${videoId}`, {
          method: "DELETE",
        });
  
        if (res.ok) {
          setVideos((prev) => prev.filter((video) => video.id !== videoId));
          setFilteredVideos((prev) => prev.filter((video) => video.id !== videoId));
          Swal.fire("حذف شد!", "ویدیو با موفقیت حذف شد.", "success");
        } else {
          Swal.fire("خطا", "مشکلی در حذف ویدیو رخ داد.", "error");
        }
      } catch (error) {
        Swal.fire("خطا", "مشکلی در حذف ویدیو رخ داد.", "error");
        console.error("Error deleting Video:", error);
      }
    }
  };
  

  const handleSearch=(e:React.ChangeEvent<HTMLInputElement>)=>{
    setQuery({...query , text:e.target.value});
    const allVideos = videos.filter((video)=>{
        return video.video_title.toLowerCase().includes(e.target.value.toLowerCase());
    })
    setFilteredVideos(allVideos);
  }
  
    return ( 
        <section className="w-full flex justify-center mt-3 bg-gray-50 dark:bg-gray-900 font-DanaMedium">
            <div className="w-full p-5 flex justify-center rounded-xl ">
                <div className="w-full mt-5">                   
                    <span className="w-full flex justify-center items-center font-MorabbaMedium text-3xl mb-4">فیلم های گالری</span>
                    <div className="relative w-full h-auto flex flex-col justify-center items-center sm:rounded-lg">
                                                                        {/* Search Box & Add Song Button*/}
                        <div className="w-full flex justify-center items-center gap-x-5 mb-5">
                            <Search query={query} handleSearch={handleSearch} baseSearch={"نام ویدیو"}/>
                            <AddButton route={"/dashboard/galleries/videos/add-video"} name={"ویدیو"}/>  
                        </div>

                                                                         {/* table */}   
                        {
                            videos.length === 0 ? (
                            <div className="w-full h-96 flex justify-center items-center text-xl font-DanaDemiBold">
                                <p>هنوز هیچ فیلمی اضافه نکردی. برای اضافه کردن اولین فیلم از دکمه + بالا استفاده کن.</p>
                            </div>):
                        
                        <table className="w-full text-sm">
                            <thead className="text-xs">
                                <tr>
                                    <th scope="col" className="px-6 py-3">نام فیلم  </th>
                                    <th scope="col" className="px-6 py-3">تاریخ تهیه فیلم  </th>
                                    <th scope="col" className="px-6 py-3">توضیح</th>
                                    <th scope="col" className="flex justify-center items-center py-3">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filteredVideos.map((video) => (
                                <tr key={video.id} className="border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="text-base font-semibold"> {video.video_title} </div>                                       
                                    </div>
                                    </td>            
                                    <td className="px-6 py-4">{video.video_date? shamsiDate({date:video.video_date}): "نامشخص"}</td>
                                    <td className="px-6 py-4">{video.video_description}</td>
                                    <td className="flex justify-center items-center py-4">
                                    <div className="flex items-center gap-2">
                                        <Link 
                                        href={`/dashboard/galleries/videos/${video.id}`}
                                        className="bg-green-700 px-3 py-1.5 rounded-lg text-white hover:bg-green-800 transition-colors"
                                        >
                                        مشاهده مشخصات فیلم
                                        </Link>
                                        <Link 
                                        href={`/dashboard/galleries/videos/${video.id}/edit-video`}
                                        className="bg-orange-700 px-3 py-1.5 rounded-lg text-white hover:bg-orange-800 transition-colors"
                                        >
                                        ویرایش
                                        </Link>
                                        <button 
                                        onClick={() => handleDeleteVideo(video.id)}
                                        className="bg-red-700 px-3 py-1.5 rounded-lg text-white hover:bg-red-800 transition-colors"
                                        >
                                        حذف
                                        </button>
                                    </div>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        }
                    </div>
                </div>
            </div>
        </section>

     );
}
 
export default Videos;

