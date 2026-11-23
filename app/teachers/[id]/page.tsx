'use client'
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchTeacher} from "@/lib/requests"
import Loading from "@/app/loading";
import RoutesHeader from "@/app/ui/components/RoutesHeader";
import Image from "next/image";
import ErrorHandling from "@/app/ui/components/ErrorHandling";
import { API_BASE_URL } from "@/lib/config";
import { IUser } from "@/lib/types";

const Teacher = () => {
    const {id} = useParams();
    const [teacher , setTeacher] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true); 

    useEffect(()=>{
        if(teacher){
            document.title ="رزومه مدرسین" + " | "+ teacher.firstName + " " + teacher.lastName
        }
       })
    useEffect(()=>{
        const fetchTeacherData = async ()=>{
            if(!id) return;
           try{
               const data = await fetchTeacher(id as string)
               setTeacher(data);
               
           } catch(error:any){
               console.log(error.messsage);
           } finally{
            setLoading(false)
           }
       };
           if(teacher === null){
            fetchTeacherData()
           }
       },[id , teacher]);
  
       if (loading) { 
        return <Loading/>; 
    } 
    if (!teacher) { 
        return <ErrorHandling/>
    }

    console.log(teacher);
    
    return ( 
        <section>
            <div className="w-full bg-[#F6F4EE] dark:bg-gray-900">
                <RoutesHeader pageTitle={"مدرسین برتر"} boldText={"آشنایی با مدرس"} Highlight={`${teacher.firstName} ${teacher.lastName}`} />
                <div className="relative">
                    <div className=" content flex justify-center items-center flex-col">
                        <div className="w-60 h-60 md:w-96 md:h-96 absolute -top-24 md:-top-52 flex justify-center items-center p-3 bg-white dark:bg-gray-700 rounded-3xl shadow-xl">
                            <Image width={400} height={400} className=" rounded-3xl " src={`${API_BASE_URL}${teacher.profileImageUrl}`} alt="teacher" />
                        </div>
                    <div className="w-full flex flex-col justify-center items-center border">
                        <h2 className="w-full text-2xl font-DanaDemiBold">بیوگرافی:</h2>
                        <div className="w-full text-lg font-Dana dark:text-gray-50">{teacher.bio}</div>
                    </div>
                    </div>
                </div>
                <div>
                    <Image width={1920} height={134} src="/images/shapes/footer-1.png" alt="" />
                </div>
            </div>
        </section>
     );
}
 
export default Teacher;