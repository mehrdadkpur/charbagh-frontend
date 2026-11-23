"use client"

import Search from "@/app/ui/components/Search"
import AddButton from "@/app/ui/components/AddButton"
import { fetchAdminPhotos } from "@/lib/requests"
import Link from "next/link"
import { ChangeEvent, useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import { IPhoto } from "@/lib/types"
import { shamsiDate } from "@/lib/shamsiDate"
import Swal from "sweetalert2"
import { API_BASE_URL } from "@/lib/config"

interface QueryState {
    text: string
}

const Photos = () => {

    const [photos, setPhotos] = useState<IPhoto[]>([])
    const [query, setQuery] = useState<QueryState>({ text: "" })
    const [filteredPhotos, setFilteredPhotos] = useState<IPhoto[]>([])

    
    useEffect(() => {
        const loadPhotos = async () => {
            try {
                const data = await fetchAdminPhotos()
                setPhotos(data)
                setFilteredPhotos(data);
            } catch (error) {
                console.error("Error fetching photos:", error)
            }
        }

        loadPhotos()
    }, [])

    const handleDeleteConfirm = async (photoId:string) => {

        const result = await Swal.fire({
            title: "آیا مطمئن هستید؟",
            text: "این عملیات قابل بازگشت نیست!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "بله، حذف کن",
            cancelButtonText: "لغو",
          });

          if(result.isConfirmed){

              
              try {
                  const res = await fetch(`${API_BASE_URL}/api/Admin/delete-photo/${photoId}`, {
                      method: "DELETE"
                    })
                    
                    if (res.ok) {
                        toast.success("حذف عکس موفقیت آمیز بود");
                        
                        const updatedPhotos = photos.filter(photo => photo.id !== photoId);
                        setPhotos(updatedPhotos);
                        
                        const updatedFiltered = updatedPhotos.filter(photo =>
                            photo.photo_title.toLowerCase().includes(query.text.toLowerCase())
                        );
                        setFilteredPhotos(updatedFiltered);
                    }
                    
                } catch (error) {
                    toast.error("خطا در حذف عکس")
                    console.error("Error deleting Photo:", error)
                }
            }
    }

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const searchText = e.target.value.toLowerCase()
        setQuery({ text: e.target.value })
        
        const allPhotos = photos.filter((photo) => 
            photo.photo_title.toLowerCase().includes(searchText)
        )
        setFilteredPhotos(allPhotos)
    }
      

    return ( 
        <section className="w-full flex justify-center mt-3">
            <div className="w-full p-5 flex justify-center rounded-xl ">
                <div className="w-full mt-5">                   
                    <span className="w-full flex justify-center items-center font-MorabbaMedium text-3xl mb-4">عکس های گالری</span>
                    <div className="relative w-full h-auto flex flex-col justify-center items-center sm:rounded-lg">
                                                                        {/* Search Box & Add Song Button*/}
                        <div className="w-full flex justify-center items-center gap-x-5 mb-5">
                            <Search query={query} handleSearch={handleSearch} baseSearch={"نام عکس"}/>
                            <AddButton route={"/dashboard/galleries/photos/add-photo"} name={"عکس"}/>  
                        </div>
                        {
                            photos.length === 0 ? (
                            <div className="w-full h-96 flex justify-center items-center text-xl font-DanaDemiBold">
                                <p>هنوز هیچ عکسی اضافه نکردی. برای اضافه کردن اولین عکس از دکمه + بالا استفاده کن.</p>
                            </div>):
                        
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">نام عکس  </th>
                                    <th scope="col" className="px-6 py-3">تاریخ تهیه عکس  </th>
                                    <th scope="col" className="px-6 py-3">توضیح</th>
                                    <th scope="col" className="flex justify-center items-center py-3">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filteredPhotos.map((photo) => (
                                <tr key={photo.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="overflow-hidden rounded-full">
                                            <Image width={64} height={64} className="object-cover" src={`${API_BASE_URL}${photo.photo_url}`} alt={photo.photo_title}/>
                                        </div>
                                        <div className="mr-3">
                                            <div className="text-base font-semibold"> {photo.photo_title} </div>
                                        </div>
                                    </div>
                                    </td>            
                                    <td className="px-6 py-4">{photo.photo_date ? shamsiDate({ date: photo.photo_date }) : "نامشخص"}</td>
                                    <td className="px-6 py-4">{photo.photo_description}</td>
                                    <td className="flex justify-center items-center py-4">
                                    <div className="flex items-center gap-2">
                                        <Link 
                                        href={`/dashboard/galleries/photos/${photo.id}`}
                                        className="bg-green-700 px-3 py-1.5 rounded-lg text-white hover:bg-green-800 transition-colors"
                                        >
                                        مشاهده مشخصات عکس
                                        </Link>
                                        <Link 
                                        href={`/dashboard/galleries/photos/${photo.id}/edit-photo`}
                                        className="bg-orange-700 px-3 py-1.5 rounded-lg text-white hover:bg-orange-800 transition-colors"
                                        >
                                        ویرایش
                                        </Link>
                                        <button 
                                        onClick={() => handleDeleteConfirm(photo.id)}
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
 
export default Photos;

