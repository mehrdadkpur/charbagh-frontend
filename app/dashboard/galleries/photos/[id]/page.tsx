"use client"
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState,useEffect } from "react";
import { fetchAdminPhoto } from "@/lib/requests";
import Loading from "@/app/loading";
import Image from "next/image";
import { IPhoto } from "@/lib/types";
import { shamsiDate } from "@/lib/shamsiDate";
import { API_BASE_URL } from "@/lib/config";

const categoryLabels: Record<number, string> = {
    1: "کلاسیک",
    2: "پاپ",
    3: "سنتی",
    4: "آموزشی",
    10: "سایر",
  };

const ViewPhoto = () => {
    const {id} = useParams();

    const [photo , setPhoto] = useState<IPhoto| null>(null);
    const [loading, setLoading] = useState(true); 


    useEffect(()=>{
        const fetchPhotoData = async ()=>{
            if(!id) return;
           try{
               const photo = await fetchAdminPhoto(id as string)
               setPhoto(photo);
               
           } catch(error:unknown){
            console.error('Error fetching photo:', (error as Error).message)
           } finally{
            setLoading(false)
           }
       };
           if(photo === null){
            fetchPhotoData()
           }
       },[id , photo]);
       
       if (loading) { 
        return <Loading/>; 
    } 
    if (!photo) { 
        return <div>Photo not found</div>; 
    }

  
    return ( 
        <div className="w-full flex justify-center pr-[340px] pl-10 mt-3">
            <div className="w-full p-5 flex justify-center rounded-xl">
                <div className="w-full flex flex-col justify-center items-center gap-y-5 ">
                    <span className="w-full flex justify-center items-center font-MorabbaMedium text-3xl mb-4"> مشخصات عکس </span>
                    <div className="w-full flex flex-col justify-center items-center sm:rounded-lg">
                        <div className="w-32 h-32 overflow-hidden rounded-full border">
                        <Image width={128} height={128} src={`${API_BASE_URL}${photo.photo_url}`} style={{ objectFit: "cover" }}  alt={photo.photo_title} className=" rounded-xl" />
                        </div>
                        <div className="w-2/3 flex flex-col justify-center gap-y-5 p-5 shadow-xl font-DanaMedium rounded-lg">
                            <div className="flex justify-start items-center gap-x-6 rounded-md p-2 hover:bg-slate-300">
                                <span>نام عکس  :</span>
                                <span className="text-xl">{photo.photo_title}</span>
                            </div>
                            <div className="flex justify-start items-center gap-x-6 rounded-md p-2 hover:bg-slate-300">
                                <span>  توضیحات:</span>
                                <span className="text-xl">{photo.photo_description}</span>
                            </div>
                            <div className="flex justify-start items-center gap-x-6 rounded-md p-2 hover:bg-slate-300">
                                <span>سال تهیه عکس:</span>
                                <span className="text-xl">
                                    {photo.photo_date ? shamsiDate({ date: photo.photo_date }) : "نامشخص"}
                                </span>
                            </div>
                            <div className="flex justify-start items-center gap-x-6 rounded-md p-2 hover:bg-slate-300">
                                <span> دسته بندی:</span>
                                <span className="text-xl">{categoryLabels[photo.category]}</span>
                            </div>                                               
                        </div>                        
                    </div>
                    <div className="w-1/5 flex justify-center items-center font-DanaMedium">
                        <Link href={"/dashboard/galleries/photos"} className="w-full p-3 bg-red-600 rounded-lg text-xl text-center" >  بازگشت</Link>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default ViewPhoto;