"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import {
  ArrowRight, CalendarDays, Edit3, Mail, MapPin, Phone, ShieldCheck,
  UserRound, CreditCard, FileText, AlertCircle, RefreshCw, Hash,
  Building2, GraduationCap, BriefcaseBusiness, UsersRound, KeyRound,
  CheckCircle2, Clock3,
} from "lucide-react";
import { fetchUser } from "@/lib/requests";
import type { IUserDetails, IUserProfileDetails } from "@/lib/types";
import Loading from "@/app/loading";
import StatusBadge from "@/app/ui/components/UserStatusBadge";
import { getUserGender } from "@/helper/UserGender";
import { ShamsiDate } from "@/lib/shamsiDate";
import { apiFetch } from "@/lib/apiFetch";
import { ApiError } from "@/helper/ApiError";

const EMPTY = "ثبت نشده است";

const formatDate = (value?: string | null) => {
  if (!value) return EMPTY;
  try { return ShamsiDate(value); } catch { return EMPTY; }
};

const profileStatusLabel = (status: number) =>
  ({0:"در انتظار تأیید",1:"فعال",2:"معلق",3:"مسدود"})[status] ?? "نامشخص";

function InfoSection({title,description,icon,children}:{title:string;description:string;icon:ReactNode;children:ReactNode}) {
  return <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
    <div className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-elf/10 text-elf dark:text-emerald-300">{icon}</div>
      <div><h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p></div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  </section>;
}

function InfoRow({icon,label,value,ltr=false,wide=false}:{icon:ReactNode;label:string;value:ReactNode;ltr?:boolean;wide?:boolean}) {
  const empty = value === null || value === undefined || value === "";
  return <div className={`min-w-0 rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/50 ${wide?"sm:col-span-2 lg:col-span-3":""}`}>
    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">{icon}{label}</div>
    <div dir={ltr?"ltr":undefined} className={`break-words text-sm leading-7 ${empty?"text-gray-400":"font-medium text-gray-900 dark:text-gray-100"} ${ltr?"text-right":""}`}>{empty?EMPTY:value}</div>
  </div>;
}

function ProfileCard({title,profile,href,icon}:{title:string;profile:IUserProfileDetails;href:string;icon:ReactNode}) {
  return <Link href={href} className="rounded-xl border border-gray-200 p-4 transition hover:border-elf/40 hover:bg-elf/5 dark:border-gray-700 dark:hover:bg-elf/10">
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-elf/10 text-elf dark:text-emerald-300">{icon}</div>
      <div className="min-w-0 flex-1"><p className="font-semibold text-gray-900 dark:text-white">{title}</p><p className="mt-1 text-xs text-gray-500">کد: {profile.code || "—"}</p></div>
      <span className={`rounded-full px-2.5 py-1 text-xs ${profile.status===1?"bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300":"bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>{profileStatusLabel(profile.status)}</span>
    </div>
  </Link>;
}

export default function UserDetailsPage() {
  const params = useParams<{id:string}>();
  const id = params?.id;
  const [details,setDetails] = useState<IUserDetails|null>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  const [retry,setRetry] = useState(0);
  const [imageError,setImageError] = useState(false);
  const [busy,setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) { setError("شناسه کاربر معتبر نیست."); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetchUser(id);
      setDetails(response as unknown as IUserDetails);
    } catch (err) {
      setError(err instanceof ApiError && err.status===401 ? "نشست شما منقضی شده است. دوباره وارد شوید." : err instanceof Error ? err.message : "دریافت اطلاعات کاربر ناموفق بود.");
    } finally { setLoading(false); }
  },[id]);

  useEffect(()=>{void load();},[load,retry]);

  const changeStatus = async (action:"activate"|"suspend"|"block"|"unblock") => {
    if (!details || busy) return;
    const user = details.user;
    const titles = {activate:"فعال‌سازی کاربر",suspend:"تعلیق کاربر",block:"غیرفعال کردن کاربر",unblock:"رفع مسدودی کاربر"};
    const confirm = await Swal.fire({
      title:titles[action],
      text:`آیا از اجرای این عملیات برای ${user.firstName} ${user.lastName} مطمئن هستید؟`,
      icon:"warning",showCancelButton:true,confirmButtonText:"بله، ادامه بده",cancelButtonText:"انصراف",reverseButtons:true,
    });
    if (!confirm.isConfirmed) return;
    setBusy(true);
    try {
      await apiFetch<void>(`/api/users/${user.id}/${action}`,{method:"PATCH"});
      await Swal.fire({title:"انجام شد",text:"وضعیت کاربر با موفقیت به‌روزرسانی شد.",icon:"success",confirmButtonText:"متوجه شدم"});
      await load();
    } catch(err) {
      await Swal.fire({title:"عملیات ناموفق بود",text:err instanceof Error?err.message:"خطا در تغییر وضعیت کاربر",icon:"error"});
    } finally {setBusy(false);}
  };

  if (loading) return <Loading />;
  if (error || !details) return <main dir="rtl" className="flex min-h-[60vh] items-center justify-center px-4"><div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900"><AlertCircle size={30} className="mx-auto text-red-500"/><h2 className="mt-3 font-semibold text-gray-900 dark:text-white">دریافت جزئیات کاربر ناموفق بود</h2><p className="mt-2 text-sm text-gray-500">{error??"کاربر پیدا نشد."}</p><div className="mt-5 flex justify-center gap-2"><button onClick={()=>setRetry(x=>x+1)} className="inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2 text-sm text-white"><RefreshCw size={15}/>تلاش دوباره</button><Link href="/dashboard/users" className="rounded-xl border px-4 py-2 text-sm dark:border-gray-700">بازگشت</Link></div></div></main>;

  const user = details.user;
  const fullName = `${user.firstName??""} ${user.lastName??""}`.trim() || "کاربر بدون نام";
  const photo = !imageError && user.profileImageUrl ? user.profileImageUrl : "/images/avatar.png";
  const availableActions = user.status===0 ? ["activate","block"] as const : user.status===1 ? ["suspend","block"] as const : user.status===2 ? ["activate","block"] as const : ["unblock"] as const;
  const actionLabels = {activate:"فعال‌سازی",suspend:"تعلیق",block:"غیرفعال‌سازی",unblock:"رفع مسدودی"};

  return <main dir="rtl" className="min-h-screen bg-gray-50 px-3 py-6 dark:bg-gray-950 sm:px-6 lg:px-8">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="mb-2 flex items-center gap-2 text-sm text-gray-500"><Link href="/dashboard/users" className="hover:text-elf">کاربران</Link><span>/</span><span className="text-gray-800 dark:text-gray-200">جزئیات کاربر</span></div><h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">پرونده کاربر</h1><p className="mt-1 text-sm text-gray-500">اطلاعات هویتی، پروفایل‌های سازمانی و دسترسی‌های کاربر</p></div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/users" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><ArrowRight size={16}/>بازگشت</Link>
          <Link href={`/dashboard/users/${user.id}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white"><Edit3 size={16}/>ویرایش کاربر</Link>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="h-24 bg-linear-to-l from-elf-900 via-elf-700 to-elf-300"/>
        <div className="px-5 pb-6 sm:px-8"><div className="-mt-12 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-md dark:border-gray-900"><Image src={photo} alt={fullName} fill sizes="96px" onError={()=>setImageError(true)} className="object-cover"/></div>
          <div className="min-w-0 flex-1 text-center sm:pb-1 sm:text-right"><h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2><div className="mt-2 flex flex-wrap justify-center gap-3 text-sm text-gray-500 sm:justify-start"><span dir="ltr" className="inline-flex items-center gap-1"><Phone size={14}/>{user.mobile||EMPTY}</span><span dir="ltr" className="inline-flex items-center gap-1"><Mail size={14}/>{user.email||EMPTY}</span></div></div>
          <div className="sm:pb-2"><StatusBadge status={user.status}/></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          {availableActions.map(action=><button key={action} type="button" disabled={busy} onClick={()=>void changeStatus(action)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:border-elf/40 hover:bg-elf/5 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200">{actionLabels[action]}</button>)}
        </div></div>
      </section>

      <InfoSection title="اطلاعات هویتی و تماس" description="مشخصات اصلی ثبت‌شده برای حساب کاربری" icon={<UserRound size={20}/>}>
        <InfoRow icon={<UserRound size={16}/>} label="نام و نام خانوادگی" value={fullName}/>
        <InfoRow icon={<CreditCard size={16}/>} label="کد ملی" value={user.nationalIdentificationNumber} ltr/>
        <InfoRow icon={<CreditCard size={16}/>} label="ملیت" value={user.nationality?.persianCountryName}/>
        <InfoRow icon={<UserRound size={16}/>} label="جنسیت" value={getUserGender(user.gender)}/>
        <InfoRow icon={<Phone size={16}/>} label="شماره موبایل" value={user.mobile} ltr/>
        <InfoRow icon={<Mail size={16}/>} label="ایمیل" value={user.email} ltr/>
        <InfoRow icon={<CalendarDays size={16}/>} label="تاریخ تولد" value={formatDate(user.birthDate)}/>
        <InfoRow icon={<MapPin size={16}/>} label="نشانی" value={user.address} wide/>
      </InfoSection>

      <InfoSection title="پروفایل‌ها و سمت‌های کاربر" description="نقش‌های تخصصی که برای این حساب در سامانه ایجاد شده‌اند" icon={<BriefcaseBusiness size={20}/>}>
        {details.student && <ProfileCard title="هنرآموز" profile={details.student} href={`/dashboard/students/${details.student.id}`} icon={<GraduationCap size={19}/>}/>}
        {details.teacher && <ProfileCard title="مدرس" profile={details.teacher} href={`/dashboard/teachers/${details.teacher.id}`} icon={<BriefcaseBusiness size={19}/>}/>}
        {details.parent && <ProfileCard title="والد / سرپرست" profile={details.parent} href={`/dashboard/parents/${details.parent.id}`} icon={<UsersRound size={19}/>}/>}
        {details.staff && <ProfileCard title="کارمند" profile={details.staff} href={`/dashboard/staffs/${details.staff.id}`} icon={<ShieldCheck size={19}/>}/>}
        {!details.student&&!details.teacher&&!details.parent&&!details.staff&&<p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-950 sm:col-span-2 lg:col-span-3">برای این حساب هنوز پروفایل تخصصی ایجاد نشده است.</p>}
      </InfoSection>

      <InfoSection title="شعبه‌ها و نقش‌های دسترسی" description="شعبه‌های متصل به کاربر و نقش‌های اختصاص‌یافته در هر شعبه" icon={<Building2 size={20}/>}>
        {details.branches.length===0 ? <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-950 sm:col-span-2 lg:col-span-3">این کاربر هنوز به شعبه‌ای متصل نشده است.</p> : details.branches.map(branch=><div key={branch.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 sm:col-span-2 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Building2 size={18} className="text-elf"/><h3 className="font-semibold text-gray-900 dark:text-white">{branch.branchName}</h3>{branch.isDefault&&<span className="rounded-full bg-elf/10 px-2 py-1 text-xs text-elf">شعبه پیش‌فرض</span>}</div><span className={`rounded-full px-2.5 py-1 text-xs ${branch.isActive?"bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300":"bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>{branch.isActive?"فعال":"غیرفعال"}</span></div>
          <p className="mt-1 text-xs text-gray-500">کد شعبه: {branch.branchCode||"—"} · تاریخ اتصال: {formatDate(branch.assignedAt)}</p>
          <div className="mt-3 flex flex-wrap gap-2">{branch.roles.length===0?<span className="text-xs text-gray-500">نقشی برای این شعبه ثبت نشده است.</span>:branch.roles.map(role=><span key={role.id} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200"><KeyRound size={13}/>{role.displayName}{!role.isActive?" (غیرفعال)":""}</span>)}</div>
        </div>)}
      </InfoSection>

      <InfoSection title="اطلاعات تکمیلی" description="توضیحات ثبت‌شده در پروفایل کاربر" icon={<FileText size={20}/>}>
        <InfoRow icon={<FileText size={16}/>} label="بیوگرافی" value={user.bio} wide/>
        <InfoRow icon={<CalendarDays size={16}/>} label="تاریخ ایجاد حساب" value={formatDate(user.createdAt)}/>
        <InfoRow icon={<Hash size={16}/>} label="شناسه کاربر" value={user.id} ltr/>\n        <InfoRow icon={<CheckCircle2 size={16}/>} label="تأیید شماره موبایل" value={details.mobileConfirmed?"تأیید شده":"تأیید نشده"}/>\n        <InfoRow icon={<CheckCircle2 size={16}/>} label="تأیید ایمیل" value={details.emailConfirmed?"تأیید شده":"تأیید نشده"}/>\n        <InfoRow icon={<Clock3 size={16}/>} label="آخرین ورود" value={formatDate(details.lastLoginAt)}/>
      </InfoSection>
    </div>
  </main>;
}
