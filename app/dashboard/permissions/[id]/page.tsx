"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, AlertCircle, RefreshCw, Pencil, KeyRound, Layers3, ShieldCheck, LockKeyhole } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/apiFetch";
import Loading from "@/app/loading";

type PermissionDetails = {
  id: string;
  module: string;
  name: string;
  action: number;
  displayName: string;
  description: string | null;
  isSystem: boolean;
};

const actionLabels: Record<number,string> = {
  1:"مشاهده",2:"ایجاد",3:"ویرایش",4:"حذف",5:"خروجی گرفتن",6:"چاپ",7:"تأیید",8:"مدیریت",
};

export default function PermissionDetailsPage() {
  const { id } = useParams<{id:string}>();
  const [permission,setPermission] = useState<PermissionDetails|null>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  const [retry,setRetry] = useState(0);

  const load = useCallback(async()=>{
    if(!id){setError("شناسه مجوز معتبر نیست.");setLoading(false);return;}
    setLoading(true);setError(null);
    try{setPermission(await apiFetch<PermissionDetails>(`/api/permissions/${id}`));}
    catch(err){setError(err instanceof ApiError?err.message:err instanceof Error?err.message:"دریافت اطلاعات مجوز ناموفق بود.");}
    finally{setLoading(false);}
  },[id]);

  useEffect(()=>{void load();},[load,retry]);

  if(loading)return <Loading/>;
  if(error||!permission)return <main dir="rtl" className="mx-auto flex min-h-[60vh] max-w-[1600px] items-center justify-center px-4"><div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"><AlertCircle size={30} className="mx-auto text-red-500"/><h1 className="mt-3 font-semibold text-gray-900 dark:text-white">دریافت مجوز ناموفق بود</h1><p className="mt-2 text-sm text-gray-500">{error??"مجوز موردنظر پیدا نشد."}</p><button onClick={()=>setRetry(x=>x+1)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm text-white"><RefreshCw size={15}/>تلاش دوباره</button></div></main>;

  const rows=[
    ["نام نمایشی",permission.displayName],
    ["شناسه فنی",permission.name],
    ["ماژول",permission.module],
    ["عملیات",actionLabels[permission.action]??"نامشخص"],
    ["نوع مجوز",permission.isSystem?"سیستمی":"سفارشی"],
    ["توضیحات",permission.description||"توضیحی ثبت نشده است"],
  ];

  return <main dir="rtl" className="mx-auto w-full max-w-[1600px] space-y-6 px-3 pb-8 sm:px-5 lg:px-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><div className="mb-2 flex items-center gap-2 text-sm text-gray-500"><Link href="/dashboard/permissions" className="hover:text-elf">مجوزها</Link><span>/</span><span className="text-gray-800 dark:text-gray-200">جزئیات مجوز</span></div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">جزئیات مجوز دسترسی</h1><p className="mt-1 text-sm text-gray-500">مشخصات و دامنه عملکرد این مجوز</p></div>
      <div className="flex gap-2"><Link href="/dashboard/permissions" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"><ArrowRight size={16}/>بازگشت</Link>{!permission.isSystem&&<Link href={`/dashboard/permissions/${permission.id}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white"><Pencil size={16}/>ویرایش مجوز</Link>}</div>
    </header>
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-elf/10 text-elf dark:text-emerald-300"><KeyRound size={26}/></div>
        <div className="min-w-0 flex-1"><h2 className="text-xl font-bold text-gray-900 dark:text-white">{permission.displayName}</h2><code dir="ltr" className="mt-1 inline-block break-all text-sm text-gray-500">{permission.name}</code></div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${permission.isSystem?"bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300":"bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"}`}>{permission.isSystem?<LockKeyhole size={14}/>:<ShieldCheck size={14}/>}{permission.isSystem?"مجوز سیستمی":"مجوز سفارشی"}</span>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">{rows.map(([label,value],i)=><div key={label} className={`rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/50 ${i===5?"sm:col-span-2 lg:col-span-3":""}`}><p className="mb-2 flex items-center gap-2 text-xs text-gray-500">{i===2?<Layers3 size={15}/>:<KeyRound size={15}/>}{label}</p><p dir={i===1?"ltr":undefined} className="break-words text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p></div>)}</div>
    </section>
  </main>;
}
