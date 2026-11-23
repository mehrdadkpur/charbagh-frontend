'use client'
import { useRouter } from "next/navigation";
import DashboardContent from "../ui/components/DashboardContent";

 export default function Dashboard (){

  const router = useRouter();

    return (
     
      <div className="relative">                                                                                                             
        <DashboardContent/>                                                           
      </div>
    )}
