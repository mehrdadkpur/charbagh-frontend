'use client';

import { useEffect, useState } from "react";
import { fetchAdminGuidances } from '@/lib/requests';
import Search from "@/app/ui/components/Search";
import toast from "react-hot-toast";
import { IContact } from "@/lib/types";
import { ShamsiDate } from "@/lib/shamsiDate";
import { API_BASE_URL } from "@/lib/config";

const Guidances = () => {
    const [guidances, setGuidances] = useState<IContact[]>([]);
    const [query, setQuery] = useState({ text: "" });
    const [filteredGuidances, setFilteredGuidances] = useState<IContact[]>([]);

    useEffect(() => {
        loadGuidances();
    }, []);

    const loadGuidances = async () => {
        try {
            const data = await fetchAdminGuidances();
            setGuidances(data);
            setFilteredGuidances(data);
        } catch (error) {
            toast.error('خطا در بارگذاری اطلاعات');
        }
    };

    const handleStatus = async (guidanceId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/Admin/update-guidance/${guidanceId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 1 })
            });

            if (res.ok) {
                setGuidances(prev => prev.map(guidance => 
                    guidance.id === guidanceId 
                        ? { ...guidance, status: 1 }
                        : guidance
                ));
                setFilteredGuidances(prev => prev.map(guidance => 
                    guidance.id === guidanceId 
                        ? { ...guidance, status: 1}
                        : guidance
                ));
                toast.success('وضعیت با موفقیت بروزرسانی شد');
            }
        } catch (error) {
            toast.error('خطا در بروزرسانی وضعیت');
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchText = e.target.value.toLowerCase();
        setQuery({ text: searchText });
        
        const filtered = guidances.filter(guidance => 
            guidance.fullname.toLowerCase().includes(searchText)
        );
        setFilteredGuidances(filtered);
    };

    const guidanceStatus = function(status:number){
        switch(status){
            case status = 0 :
            return "مشاوره نشده";
            case status = 1 :
            return "پایان مشاوره";
            case status = 2 :
                return " در انتظار مشاوره"
        }
    }    
    
    return (
        <section className="w-full flex justify-center mt-3">
            <div className="w-full p-5 flex justify-center rounded-xl">
                <div className="w-full mt-5">
                    <h1 className="w-full flex justify-center items-center font-MorabbaMedium text-3xl mb-4">
                        درخواست های پشتیبانی
                    </h1>
                    <div className="relative w-full overflow-x-auto shadow-md sm:rounded-lg">
                        <div className="w-full flex justify-center items-center gap-x-5 mb-5">
                            <Search query={query} handleSearch={handleSearch} baseSearch="نام خانوادگی" />
                        </div>
                        <table className="w-full text-sm">
                            <thead className="text-xs">
                                <tr>
                                    <th scope="col" className="px-6 py-3">نام و نام خانوادگی</th>
                                    <th scope="col" className="px-6 py-3">موبایل</th>
                                    <th scope="col" className="px-6 py-3">زمان</th>
                                    <th scope="col" className="px-6 py-3">وضعیت</th>
                                    <th scope="col" className="px-6 py-3">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGuidances.map((guidance: IContact) => (
                                    <tr key={guidance.id} className={`${guidance.status === 1 ? "bg-gray-100 dark:bg-gray-700 opacity-70" : "bg-gray-50 dark:bg-gray-500"} border-b hover:bg-gray-500`}>
                                        <td className="px-6 py-4">{guidance.fullName}</td>
                                        <td className="px-6 py-4">{guidance.mobile}</td>
                                        <td className="px-6 py-4">{ShamsiDate(guidance.createdAt)}</td>
                                        <td className="px-6 py-4">{guidanceStatus(guidance.status) }</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleStatus(guidance.id)}
                                                    disabled={guidance.status === 1}
                                                    className={`px-3 py-1.5 rounded-lg text-white transition-colors cursor-pointer ${
                                                        guidance.status === 1 
                                                            ? "bg-gray-400 cursor-not-allowed" 
                                                            : "bg-green-700 hover:bg-green-800"
                                                    }`}
                                                >
                                                    {guidance.status === 0 ? "تکمیل کردن مشاوره" : "مشاوره شد"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Guidances;
