"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Building2, Users, School, FileText, Wallet, Phone, MapPin,
  Hash, Pencil, ShieldCheck, ShieldOff, CheckCircle2, XCircle, Search,
  RefreshCw, Loader2, AlertCircle, Info, CalendarDays, UserRound,
  BookOpen, Receipt, CreditCard, ChevronLeft, ChevronRight, Activity, Eye,
} from "lucide-react";
import Swal from "sweetalert2";
import { apiFetch, ApiError } from "@/lib/apiFetch";

type BranchUser = {
  id: string; 
  userBranchId?: string; 
  userId?: string;
  firstName?: string | null; 
  lastName?: string | null; 
  fullName?: string | null;
  mobile?: string | null; 
  email?: string | null; 
  isActive?: boolean;
  status?: number | string | null; 
  joinedAt?: string | null; 
  createdAt?: string | null;
};
type BranchClassroom = {
  id: string; 
  name?: string | null; 
  title?: string | null; 
  code?: string | null;
  capacity?: number | null; 
  isActive?: boolean; 
  status?: number | string | null;
  createdAt?: string | null;
};
type BranchInvoice = {
  id: string; 
  invoiceNumber?: string | number | null; 
  number?: string | number | null;
  customerName?: string | null; 
  title?: string | null; 
  totalAmount?: number | null;
  amount?: number | null; 
  status?: number | string | null; 
  issuedAt?: string | null;
  createdAt?: string | null;
};
type BranchPayment = {
  id: string; 
  paymentNumber?: string | number | null; 
  trackingCode?: string | null;
  payerName?: string | null; 
  title?: string | null; 
  amount?: number | null;
  status?: number | string | null; 
  paidAt?: string | null; 
  createdAt?: string | null;
};
type BranchDetailsDto = {
  id: string; 
  name: string; 
  code?: string | null; 
  phoneNumber?: string | null;
  address?: string | null; 
  isActive: boolean; 
  createdAt?: string | null;
  updatedAt?: string | null; 
  userBranches?: BranchUser[]; 
  users?: BranchUser[];
  classrooms?: BranchClassroom[]; 
  invoices?: BranchInvoice[]; 
  payments?: BranchPayment[];
  userCount?: number; 
  activeUserCount?: number; 
  classroomCount?: number;
  invoiceCount?: number; 
  paymentCount?: number;
};
type SectionKey = "users" | "classrooms" | "invoices" | "payments";
const PAGE_SIZE = 8;
const branchApi = {
  details: (id: string) => `/api/branches/${id}`,
  activate: (id: string) => `/api/branches/${id}/activate`,
  deactivate: (id: string) => `/api/branches/${id}/deactivate`,
};

const faNumber = (n?: number | null) => new Intl.NumberFormat("fa-IR").format(n ?? 0);
const money = (n?: number | null) => n == null ? "—" : `${faNumber(n)} ریال`;

function dateText(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 401) return "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.";
  return error instanceof Error ? error.message : "عملیات با خطا مواجه شد.";
}
function StatusBadge({ active }: { active: boolean }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-DanaDemiBold ${active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
    {active ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} {active ? "فعال" : "غیرفعال"}
  </span>;
}
function SummaryCard({ icon, title, value, detail, tone = "blue" }: {
  icon: React.ReactNode; title: string; value: number; detail?: string;
  tone?: "blue" | "emerald" | "violet" | "amber";
}) {
  const colors = {
    blue: "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  };
  return <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
    <div className="flex items-center justify-between"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors[tone]}`}>{icon}</div><Activity size={17} className="text-gray-300 dark:text-gray-700"/></div>
    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{title}</p>
    <p className="mt-1 font-DanaDemiBold text-2xl text-gray-900 dark:text-white">{faNumber(value)}</p>
    {detail && <p className="mt-1 text-xs text-gray-400">{detail}</p>}
  </div>;
}
function InfoItem({ label, value, icon, dir }: { label: string; value?: string | null; icon?: React.ReactNode; dir?: "ltr" | "rtl" }) {
  return <div className="min-w-0 rounded-xl bg-gray-50 p-3.5 dark:bg-gray-800/50">
    <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">{icon}{label}</div>
    <p dir={dir} className={`wrap-break-word text-sm font-DanaDemiBold text-gray-800 dark:text-gray-100 ${dir === "ltr" ? "text-left" : ""}`}>{value?.trim() || "ثبت نشده"}</p>
  </div>;
}
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className="rounded-xl border border-dashed border-gray-200 px-4 py-12 text-center dark:border-gray-800">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">{icon}</div>
    <p className="mt-3 text-sm font-DanaDemiBold text-gray-700 dark:text-gray-200">{title}</p>
    <p className="mt-1 text-xs text-gray-400">{description}</p>
  </div>;
}
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return <div className="mt-5 flex items-center justify-center gap-3">
    <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:text-gray-300" aria-label="صفحه قبل"><ChevronRight size={17}/></button>
    <span className="text-xs text-gray-500">صفحه {faNumber(page)} از {faNumber(totalPages)}</span>
    <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:text-gray-300" aria-label="صفحه بعد"><ChevronLeft size={17}/></button>
  </div>;
}

export default function BranchDetails({ branchId }: { branchId: string }) {
  const [branch, setBranch] = useState<BranchDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState<SectionKey>("users");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await apiFetch<BranchDetailsDto>(branchApi.details(branchId));
      setBranch(data);
    } catch (e) {
      console.error(e); setError(getErrorMessage(e));
    } finally { setLoading(false); }
  }, [branchId]);
  useEffect(() => { void loadDetails(); }, [loadDetails]);

  const users = branch?.userBranches ?? branch?.users ?? [];
  const classrooms = branch?.classrooms ?? [];
  const invoices = branch?.invoices ?? [];
  const payments = branch?.payments ?? [];
  const sectionMeta = useMemo(() => ({
    users: { label: "کاربران شعبه", count: branch?.userCount ?? users.length, icon: <Users size={17}/> },
    classrooms: { label: "کلاس‌ها", count: branch?.classroomCount ?? classrooms.length, icon: <School size={17}/> },
    invoices: { label: "فاکتورها", count: branch?.invoiceCount ?? invoices.length, icon: <FileText size={17}/> },
    payments: { label: "پرداخت‌ها", count: branch?.paymentCount ?? payments.length, icon: <Wallet size={17}/> },
  }), [branch, users.length, classrooms.length, invoices.length, payments.length]);
  
  const filtered = useMemo(() => {
    const source = section === "users" ? users : section === "classrooms" ? classrooms : section === "invoices" ? invoices : payments;
    const q = search.trim().toLocaleLowerCase("fa");
    return q ? source.filter(item => Object.values(item).some(v => String(v ?? "").toLocaleLowerCase("fa").includes(q))) : source;
  }, [section, search, users, classrooms, invoices, payments]);
  
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changeSection = (key: SectionKey) => { setSection(key); setSearch(""); setPage(1); };

  const handleStatusChange = async () => {
    if (!branch) return;
    const activating = !branch.isActive;
    const confirm = await Swal.fire({
      title: activating ? "فعال‌سازی شعبه" : "غیرفعال‌سازی شعبه",
      text: activating ? `شعبه «${branch.name}» فعال شود؟` : `شعبه «${branch.name}» غیرفعال شود؟`,
      icon: "question", showCancelButton: true,
      confirmButtonText: activating ? "فعال شود" : "غیرفعال شود",
      cancelButtonText: "انصراف", confirmButtonColor: activating ? "#059669" : "#d97706", reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      setBusy(true);
      await apiFetch(activating ? branchApi.activate(branch.id) : branchApi.deactivate(branch.id), { method: "PATCH" });
      await loadDetails();
      await Swal.fire({ title: "عملیات موفق", text: activating ? "شعبه فعال شد." : "شعبه غیرفعال شد.", icon: "success" });
    } catch (e) {
      await Swal.fire({ title: "خطا", text: getErrorMessage(e), icon: "error" });
    } finally { setBusy(false); }
  };

  if (loading) return <div dir="rtl" className="flex min-h-80 items-center justify-center"><Loader2 className="animate-spin text-elf" size={32}/></div>;
  if (error || !branch) return <div dir="rtl" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
    <AlertCircle className="mx-auto text-red-500" size={30}/><p className="mt-3 text-sm text-red-600 dark:text-red-400">{error ?? "شعبه موردنظر پیدا نشد."}</p>
    <button type="button" onClick={() => void loadDetails()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2 text-sm text-white"><RefreshCw size={15}/>تلاش مجدد</button>
  </div>;

  const activeUsers = branch.activeUserCount ?? users.filter(u => u.isActive ?? u.status === 1).length;

  return <div className="mx-auto w-full max-w-[1600px] space-y-6 px-3 pb-8 sm:px-5 lg:px-8" dir="rtl">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Link href="/dashboard/branches" className="mt-1 shrink-0 rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800" title="بازگشت به شعبه‌ها"><ArrowRight size={19}/></Link>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-elf/10 text-elf"><Building2 size={21}/></span>
            <h1 className="font-DanaDemiBold text-xl text-gray-900 dark:text-white sm:text-2xl">{branch.name}</h1>
            <StatusBadge active={branch.isActive}/>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
            {branch.code && <span className="inline-flex items-center gap-1" dir="ltr"><Hash size={13}/>{branch.code}</span>}
            {branch.phoneNumber && <span className="inline-flex items-center gap-1" dir="ltr"><Phone size={13}/>{branch.phoneNumber}</span>}
            {branch.address && <span className="inline-flex min-w-0 items-center gap-1"><MapPin size={13}/><span className="line-clamp-1">{branch.address}</span></span>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex">
        <button type="button" disabled={busy} onClick={() => void handleStatusChange()} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white transition disabled:opacity-50 ${branch.isActive ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
          {branch.isActive ? <ShieldOff size={16}/> : <ShieldCheck size={16}/>} {branch.isActive ? "غیرفعال کردن" : "فعال‌سازی"}
        </button>
        <Link href={`/dashboard/branches/${branch.id}/edit`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"><Pencil size={16}/>ویرایش شعبه</Link>
      </div>
    </div>

    {/* Statistics */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard icon={<Users size={21}/>} title="کاربران شعبه" value={branch.userCount ?? users.length} detail={`${faNumber(activeUsers)} عضو فعال`} tone="blue"/>
      <SummaryCard icon={<School size={21}/>} title="کلاس‌ها" value={branch.classroomCount ?? classrooms.length} detail="کلاس‌های ثبت‌شده در شعبه" tone="emerald"/>
      <SummaryCard icon={<FileText size={21}/>} title="فاکتورها" value={branch.invoiceCount ?? invoices.length} detail="سوابق فاکتور شعبه" tone="violet"/>
      <SummaryCard icon={<Wallet size={21}/>} title="پرداخت‌ها" value={branch.paymentCount ?? payments.length} detail="سوابق پرداخت شعبه" tone="amber"/>
    </div>

    {/* Branch info */}
    <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className="mb-4 flex items-center gap-2"><Info size={19} className="text-elf"/><h2 className="font-DanaDemiBold text-gray-900 dark:text-white">اطلاعات اصلی شعبه</h2></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <InfoItem label="نام شعبه" value={branch.name} icon={<Building2 size={14}/>}/>
        <InfoItem label="کد شعبه" value={branch.code} icon={<Hash size={14}/>} dir="ltr"/>
        <InfoItem label="شماره تماس" value={branch.phoneNumber} icon={<Phone size={14}/>} dir="ltr"/>
        <div className="sm:col-span-2 xl:col-span-3"><InfoItem label="نشانی" value={branch.address} icon={<MapPin size={14}/>}/></div>
        <InfoItem label="تاریخ ایجاد" value={dateText(branch.createdAt)} icon={<CalendarDays size={14}/>}/>
        <InfoItem label="آخرین بروزرسانی" value={dateText(branch.updatedAt)} icon={<CalendarDays size={14}/>}/>
        <InfoItem label="وضعیت شعبه" value={branch.isActive ? "فعال" : "غیرفعال"} icon={<CheckCircle2 size={14}/>}/>
      </div>
    </section>

    {/* Read-only related collections */}
    <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className="mb-5"><h2 className="flex items-center gap-2 font-DanaDemiBold text-gray-900 dark:text-white"><Building2 size={19} className="text-elf"/>محتویات و سوابق شعبه</h2><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">اطلاعات زیر فقط جهت مشاهده هستند و از این صفحه قابل ویرایش نیستند.</p></div>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {(Object.keys(sectionMeta) as SectionKey[]).map(key => {
          const meta = sectionMeta[key]; const selected = section === key;
          return <button key={key} type="button" onClick={() => changeSection(key)} className={`flex min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-3 text-right transition ${selected ? "border-elf bg-elf/5 text-elf" : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/60"}`}>
            <span className="flex min-w-0 items-center gap-2">{meta.icon}<span className="truncate text-xs font-DanaDemiBold sm:text-sm">{meta.label}</span></span><span className={`rounded-lg px-2 py-1 text-xs ${selected ? "bg-elf/10" : "bg-gray-100 dark:bg-gray-800"}`}>{faNumber(meta.count)}</span>
          </button>;
        })}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 className="font-DanaDemiBold text-sm text-gray-800 dark:text-white">{sectionMeta[section].label}</h3><p className="mt-1 text-xs text-gray-400">{faNumber(filtered.length)} مورد در اطلاعات دریافت‌شده</p></div>
        <div className="relative w-full sm:max-w-xs"><Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="جست‌وجو در این بخش..." className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-9 pl-3 text-sm outline-none transition focus:border-elf dark:border-gray-700 dark:bg-gray-950 dark:text-white"/></div>
      </div>
      <div className="mt-4">
        {rows.length === 0 ? <EmptyState icon={section === "users" ? <Users size={23}/> : section === "classrooms" ? <BookOpen size={23}/> : section === "invoices" ? <Receipt size={23}/> : <CreditCard size={23}/>} title={search ? "موردی پیدا نشد" : "هنوز اطلاعاتی ثبت نشده است"} description={search ? "عبارت جست‌وجو را تغییر دهید." : "پس از ثبت اطلاعات مرتبط، موارد این بخش در این قسمت نمایش داده می‌شوند."}/> : <>
          {section === "users" && <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right text-sm"><thead><tr className="border-b border-gray-100 text-xs text-gray-500 dark:border-gray-800"><th className="px-3 py-3 font-medium">کاربر</th><th className="px-3 py-3 font-medium">موبایل</th><th className="px-3 py-3 font-medium">ایمیل</th><th className="px-3 py-3 font-medium">وضعیت عضویت</th><th className="px-3 py-3 font-medium">تاریخ عضویت</th></tr></thead><tbody>{(rows as BranchUser[]).map((u, i) => { const active = u.isActive ?? u.status === 1; return <tr key={u.id ?? u.userBranchId ?? i} className="border-b border-gray-50 last:border-0 dark:border-gray-800/70"><td className="px-3 py-4"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800"><UserRound size={15}/></span><span className="font-DanaDemiBold text-gray-800 dark:text-white">{u.fullName || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "بدون نام"}</span></div></td><td dir="ltr" className="px-3 py-4 text-right text-gray-500">{u.mobile || "—"}</td><td className="px-3 py-4 text-gray-500">{u.email || "—"}</td><td className="px-3 py-4"><StatusBadge active={active}/></td><td className="px-3 py-4 text-xs text-gray-500">{dateText(u.joinedAt ?? u.createdAt)}</td></tr>; })}</tbody></table></div>}
          {section === "classrooms" && <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-right text-sm"><thead><tr className="border-b border-gray-100 text-xs text-gray-500 dark:border-gray-800"><th className="px-3 py-3 font-medium">نام کلاس</th><th className="px-3 py-3 font-medium">کد</th><th className="px-3 py-3 font-medium">ظرفیت</th><th className="px-3 py-3 font-medium">وضعیت</th><th className="px-3 py-3 font-medium">تاریخ ثبت</th></tr></thead><tbody>{(rows as BranchClassroom[]).map((c, i) => <tr key={c.id ?? i} className="border-b border-gray-50 last:border-0 dark:border-gray-800/70"><td className="px-3 py-4 font-DanaDemiBold text-gray-800 dark:text-white">{c.name || c.title || "بدون عنوان"}</td><td dir="ltr" className="px-3 py-4 text-right text-gray-500">{c.code || "—"}</td><td className="px-3 py-4 text-gray-500">{c.capacity == null ? "—" : faNumber(c.capacity)}</td><td className="px-3 py-4"><StatusBadge active={c.isActive ?? c.status === 1}/></td><td className="px-3 py-4 text-xs text-gray-500">{dateText(c.createdAt)}</td></tr>)}</tbody></table></div>}
          {section === "invoices" && <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-right text-sm"><thead><tr className="border-b border-gray-100 text-xs text-gray-500 dark:border-gray-800"><th className="px-3 py-3 font-medium">شماره فاکتور</th><th className="px-3 py-3 font-medium">عنوان / مشتری</th><th className="px-3 py-3 font-medium">مبلغ</th><th className="px-3 py-3 font-medium">وضعیت</th><th className="px-3 py-3 font-medium">تاریخ</th></tr></thead><tbody>{(rows as BranchInvoice[]).map((v, i) => <tr key={v.id ?? i} className="border-b border-gray-50 last:border-0 dark:border-gray-800/70"><td dir="ltr" className="px-3 py-4 text-right font-DanaDemiBold text-gray-800 dark:text-white">{v.invoiceNumber ?? v.number ?? "—"}</td><td className="px-3 py-4 text-gray-600 dark:text-gray-300">{v.title || v.customerName || "—"}</td><td className="px-3 py-4 text-gray-600 dark:text-gray-300">{money(v.totalAmount ?? v.amount)}</td><td className="px-3 py-4 text-xs text-gray-500">{v.status ?? "—"}</td><td className="px-3 py-4 text-xs text-gray-500">{dateText(v.issuedAt ?? v.createdAt)}</td></tr>)}</tbody></table></div>}
          {section === "payments" && <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-right text-sm"><thead><tr className="border-b border-gray-100 text-xs text-gray-500 dark:border-gray-800"><th className="px-3 py-3 font-medium">شناسه / شماره</th><th className="px-3 py-3 font-medium">پرداخت‌کننده</th><th className="px-3 py-3 font-medium">مبلغ</th><th className="px-3 py-3 font-medium">وضعیت</th><th className="px-3 py-3 font-medium">تاریخ پرداخت</th></tr></thead><tbody>{(rows as BranchPayment[]).map((v, i) => <tr key={v.id ?? i} className="border-b border-gray-50 last:border-0 dark:border-gray-800/70"><td dir="ltr" className="px-3 py-4 text-right font-DanaDemiBold text-gray-800 dark:text-white">{v.paymentNumber ?? v.trackingCode ?? "—"}</td><td className="px-3 py-4 text-gray-600 dark:text-gray-300">{v.payerName || v.title || "—"}</td><td className="px-3 py-4 text-gray-600 dark:text-gray-300">{money(v.amount)}</td><td className="px-3 py-4 text-xs text-gray-500">{v.status ?? "—"}</td><td className="px-3 py-4 text-xs text-gray-500">{dateText(v.paidAt ?? v.createdAt)}</td></tr>)}</tbody></table></div>}
          <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
        </>}
      </div>
    </section>

    <div className="flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs leading-6 text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300"><Eye size={16} className="mt-1 shrink-0"/><p>این صفحه برای مشاهده و پایش وضعیت شعبه طراحی شده است. برای تغییر مشخصات اصلی از گزینه «ویرایش شعبه» استفاده کنید؛ سایر اطلاعات در این صفحه فقط خواندنی هستند.</p></div>
  </div>;
}
