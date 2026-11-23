"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import {
  AlertCircle,
  Ban,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  Mail,
  Pencil,
  PauseCircle,
  RefreshCw,
  RotateCcw,
  UserRound,
  UsersRound,
  Plus,
  Search,
  Unlink,
  X,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { apiFetch } from "@/lib/apiFetch";
import { ApiError } from "@/helper/ApiError";
import type { IStudent } from "@/lib/types";

const STUDENT_STATUS = { Pending: 0, Active: 1, Suspended: 2, Blocked: 3 } as const;
type StudentAction = "activate" | "suspend" | "block" | "unblock";
type StudentParentRelationship = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 99;

type ParentSummary = {
  id: string;
  firstName: string;
  lastName: string;
  nationalIdentificationNumber?: string | null;
  mobile?: string | null;
  profileImageUrl?: string | null;
  status?: number;
};

type StudentParentItem = {
  id: string;
  parentId: string;
  relationship: StudentParentRelationship;
  parent: ParentSummary;
};


const parentApi = {
  list: (studentId: string) => `/api/students/${studentId}/parents`,
  search: (term: string) => `/api/parents?search=${encodeURIComponent(term)}`,
  connect: "/api/studentParents",
  disconnect: (id: string) => `/api/studentParents/${id}`,
};

const RELATIONSHIPS: { value: StudentParentRelationship; label: string }[] = [
  { value: 1, label: "پدر" },
  { value: 2, label: "مادر" },
  { value: 3, label: "قیم" },
  { value: 4, label: "پدربزرگ" },
  { value: 5, label: "مادربزرگ" },
  { value: 6, label: "برادر" },
  { value: 7, label: "خواهر" },
  { value: 99, label: "سایر" },
];

const STATUS_OPTIONS = [
  { value: 0, label: "در انتظار تأیید" },
  { value: 1, label: "فعال" },
  { value: 2, label: "تعلیق‌شده" },
  { value: 3, label: "مسدودشده" },
];

function formatDate(value?: string | null) {
  if (!value) return "ثبت نشده";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ثبت نشده";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric", month: "long", day: "numeric",
  }).format(date);
}

function calculateAge(value?: string | null): number | null {
  if (!value) return null;
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!birthdayHasPassed) age -= 1;
  return age >= 0 ? age : null;
}

function getStatusLabel(status: number) {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label ?? "نامشخص";
}

function getStatusClass(status: number) {
  switch (status) {
    case STUDENT_STATUS.Active:
      return "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-400/10 dark:text-green-300 dark:ring-green-400/20";
    case STUDENT_STATUS.Pending:
      return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20";
    case STUDENT_STATUS.Suspended:
      return "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/20";
    case STUDENT_STATUS.Blocked:
      return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20";
    default:
      return "bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-300";
  }
}

function getAvailableActions(status: number) {
  switch (status) {
    case STUDENT_STATUS.Pending:
      return [
        { key: "activate" as const, label: "فعال‌سازی", icon: CheckCircle2, className: "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40" },
        { key: "block" as const, label: "مسدودسازی", icon: Ban, className: "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40" },
      ];
    case STUDENT_STATUS.Active:
      return [
        { key: "suspend" as const, label: "تعلیق هنرآموز", icon: PauseCircle, className: "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40" },
        { key: "block" as const, label: "مسدودسازی", icon: Ban, className: "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40" },
      ];
    case STUDENT_STATUS.Suspended:
      return [
        { key: "activate" as const, label: "فعال‌سازی مجدد", icon: CheckCircle2, className: "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40" },
        { key: "block" as const, label: "مسدودسازی", icon: Ban, className: "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40" },
      ];
    case STUDENT_STATUS.Blocked:
      return [{ key: "unblock" as const, label: "رفع مسدودی", icon: RotateCcw, className: "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40" }];
    default:
      return [];
  }
}

function StudentAvatar({ student }: { student: IStudent }) {
  const initials = `${student.firstName?.[0] ?? ""}${student.lastName?.[0] ?? ""}`;
  if (student.profileImageUrl) {
    return <Image priority width={80} height={80} src={student.profileImageUrl} alt={`${student.firstName} ${student.lastName}`} className="size-20 shrink-0 rounded-2xl object-cover" unoptimized />;
  }
  return <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-elf/10 text-2xl font-bold text-elf dark:text-emerald-300">{initials || "؟"}</div>;
}

function ParentAvatar({ parent }: { parent: ParentSummary }) {
  if (parent.profileImageUrl) {
    return <Image width={44} height={44} src={parent.profileImageUrl} alt={`${parent.firstName} ${parent.lastName}`} className="size-11 shrink-0 rounded-xl object-cover" unoptimized />;
  }
  return <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-elf/10 font-semibold text-elf dark:text-emerald-300">{`${parent.firstName?.[0] ?? ""}${parent.lastName?.[0] ?? ""}` || "؟"}</div>;
}

function InfoItem({ label, value, icon: Icon }: { label: string; value: string; icon: typeof UserRound }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"><Icon size={18} /></div>
      <div className="min-w-0"><p className="text-xs text-gray-500 dark:text-gray-400">{label}</p><p className="mt-1 wrap-break-word text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p></div>
    </div>
  );
}

function DetailSection({ title, icon: Icon, children }: { title: string; icon: typeof UserRound; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-gray-800"><div className="flex size-9 items-center justify-center rounded-xl bg-elf/10 text-elf dark:text-emerald-300"><Icon size={19} /></div><h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2></div>
      {children}
    </section>
  );
}

function StudentDetailsSkeleton() {
  return <div className="animate-pulse space-y-5"><div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800" /><div className="h-56 rounded-2xl bg-gray-200 dark:bg-gray-800" /><div className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800" /></div>;
}

function relationshipLabel(value: StudentParentRelationship) {
  return RELATIONSHIPS.find((item) => item.value === value)?.label ?? "نامشخص";
}

function normalizeParentList(data: unknown): StudentParentItem[] {
  if (Array.isArray(data)) return data as StudentParentItem[];
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as { items: unknown }).items)) return (data as { items: StudentParentItem[] }).items;
  return [];
}

function normalizeAvailableParents(data: unknown): ParentSummary[] {
  if (Array.isArray(data)) return data as ParentSummary[];
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as { items: unknown }).items)) return (data as { items: ParentSummary[] }).items;
  return [];
}

export default function StudentDetails({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<IStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [parents, setParents] = useState<StudentParentItem[]>([]);
  const [parentsLoading, setParentsLoading] = useState(false);
  const [parentsError, setParentsError] = useState<string | null>(null);
  const [parentModalOpen, setParentModalOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [availableParents, setAvailableParents] = useState<ParentSummary[]>([]);
  const [searchingParents, setSearchingParents] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedRelationship, setSelectedRelationship] = useState<StudentParentRelationship>(1);
  const [parentBusy, setParentBusy] = useState(false);

  const age = useMemo(() => calculateAge(student?.birthDate), [student?.birthDate]);
  const canHaveParent = age !== null && age < 18;

  const loadStudent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<IStudent>(`/api/students/${studentId}`);
      setStudent(data);
    } catch (err) {
      console.error("Error loading student:", err);
      setError(err instanceof ApiError && err.status === 401 ? "نشست شما منقضی شده است. دوباره وارد شوید." : err instanceof Error ? err.message : "دریافت اطلاعات هنرآموز ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const loadParents = useCallback(async () => {
    setParentsLoading(true);
    setParentsError(null);
    try {
      const data = await apiFetch<unknown>(parentApi.list(studentId));
      setParents(normalizeParentList(data));
      console.log(data);
      
    } catch (err) {
      console.error("Error loading student parents:", err);
      setParentsError(err instanceof ApiError && err.status === 401 ? "نشست شما منقضی شده است. دوباره وارد شوید." : err instanceof Error ? err.message : "دریافت فهرست والدین ناموفق بود.");
    } finally {
      setParentsLoading(false);
    }
  }, [studentId]);

  useEffect(() => { void loadStudent(); }, [loadStudent]);
  useEffect(() => {
    if (student && calculateAge(student.birthDate) !== null && calculateAge(student.birthDate)! < 18) void loadParents();
    else { setParents([]); setParentsLoading(false); setParentsError(null); }
  }, [student, loadParents]);

  useEffect(() => {
    if (!parentModalOpen) return;
    let cancelled = false;
    const search = async () => {
      setSearchingParents(true);
      try {
        const data = await apiFetch<unknown>(parentApi.search(parentSearch.trim()));
        if (!cancelled) setAvailableParents(normalizeAvailableParents(data));
      } catch (err) {
        if (!cancelled) {
          setAvailableParents([]);
          setParentsError(err instanceof Error ? err.message : "جست‌وجوی والدین ناموفق بود.");
        }
      } finally {
        if (!cancelled) setSearchingParents(false);
      }
    };
    const timer = window.setTimeout(() => { void search(); }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [parentModalOpen, parentSearch]);

  const handleAction = async (action: StudentAction) => {
    if (!student || busy) return;
    const actionConfig: Record<StudentAction, { endpoint: string; title: string; message: string; success: string }> = {
      activate: { endpoint: "activate", title: "فعال‌سازی هنرآموز", message: "وضعیت این هنرآموز فعال شود؟", success: "هنرآموز با موفقیت فعال شد." },
      suspend: { endpoint: "suspend", title: "تعلیق هنرآموز", message: "آیا از تعلیق این هنرآموز مطمئن هستید؟", success: "هنرآموز با موفقیت تعلیق شد." },
      block: { endpoint: "block", title: "مسدودسازی هنرآموز", message: "آیا از مسدودسازی این هنرآموز مطمئن هستید؟", success: "هنرآموز با موفقیت مسدود شد." },
      unblock: { endpoint: "unblock", title: "رفع مسدودی هنرآموز", message: "آیا از رفع مسدودی این هنرآموز مطمئن هستید؟", success: "مسدودی هنرآموز با موفقیت برداشته شد." },
    };
    const config = actionConfig[action];
    const result = await Swal.fire({
      title: config.title, text: `${student.firstName} ${student.lastName} — ${config.message}`, icon: "warning", showCancelButton: true,
      confirmButtonText: "تأیید", cancelButtonText: "انصراف", reverseButtons: true, buttonsStyling: false,
      customClass: { popup: "rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900", title: "text-lg font-semibold dark:text-white", htmlContainer: "text-sm dark:text-gray-300", actions: "gap-2", confirmButton: "rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white", cancelButton: "rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200" },
    });
    if (!result.isConfirmed) return;
    setBusy(true);
    try {
      await apiFetch<unknown>(`/api/students/${student.id}/${config.endpoint}`, { method: "PATCH" });
      await loadStudent();
      await Swal.fire({ title: "انجام شد", text: config.success, icon: "success", confirmButtonText: "متوجه شدم", buttonsStyling: false, customClass: { popup: "rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900", title: "text-lg font-semibold dark:text-white", htmlContainer: "text-sm dark:text-gray-300", confirmButton: "rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white" } });
    } catch (err) {
      await Swal.fire({ title: "عملیات ناموفق بود", text: err instanceof ApiError && err.status === 401 ? "نشست شما منقضی شده است. دوباره وارد شوید." : err instanceof Error ? err.message : "اجرای عملیات با خطا مواجه شد.", icon: "error", confirmButtonText: "متوجه شدم" });
    } finally { setBusy(false); }
  };

  const connectParent = async () => {
    if (!student || !selectedParentId || !canHaveParent || parentBusy) return;
    setParentBusy(true);
    try {
      await apiFetch<unknown>(parentApi.connect, {
        method: "POST",
        body: JSON.stringify({ studentId: student.id, parentId: selectedParentId, relationship: selectedRelationship }),
      });
      setParentModalOpen(false);
      setParentSearch("");
      setSelectedParentId("");
      await loadParents();
      await Swal.fire({ title: "انجام شد", text: "والد با موفقیت به هنرآموز متصل شد.", icon: "success", confirmButtonText: "متوجه شدم" });
    } catch (err) {
      await Swal.fire({ title: "اتصال والد ناموفق بود", text: err instanceof Error ? err.message : "امکان اتصال والد وجود ندارد.", icon: "error", confirmButtonText: "متوجه شدم" });
    } finally { setParentBusy(false); }
  };

  const disconnectParent = async (item: StudentParentItem) => {
    const result = await Swal.fire({ title: "قطع ارتباط والد", text: `ارتباط ${item.parent.firstName} ${item.parent.lastName} با این هنرآموز قطع شود؟`, icon: "warning", showCancelButton: true, confirmButtonText: "قطع ارتباط", cancelButtonText: "انصراف", reverseButtons: true });
    if (!result.isConfirmed || parentBusy) return;
    setParentBusy(true);
    try {
      await apiFetch<unknown>(parentApi.disconnect(item.id), { method: "DELETE" });
      await loadParents();
    } catch (err) {
      await Swal.fire({ title: "عملیات ناموفق بود", text: err instanceof Error ? err.message : "قطع ارتباط والد ناموفق بود.", icon: "error", confirmButtonText: "متوجه شدم" });
    } finally { setParentBusy(false); }
  };

  const availableActions = student ? getAvailableActions(student.status) : [];

  return (
    <section dir="rtl" className="mx-auto w-full max-w-[1400px] space-y-6 px-3 pb-8 sm:px-5 lg:px-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/dashboard" className="transition hover:text-elf">داشبورد</Link><span>/</span>
        <Link href="/dashboard/students" className="transition hover:text-elf">هنرآموزان</Link><span>/</span>
        <span className="text-gray-700 dark:text-gray-200">جزئیات هنرآموز</span>
      </div>

      {loading ? <StudentDetailsSkeleton /> : error || !student ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center dark:border-gray-800 dark:bg-gray-900">
          <AlertCircle className="mx-auto text-red-500" size={30} />
          <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">دریافت اطلاعات هنرآموز ناموفق بود</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error ?? "هنرآموز موردنظر پیدا نشد."}</p>
          <button type="button" onClick={() => void loadStudent()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white"><RefreshCw size={16} />تلاش مجدد</button>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4"><StudentAvatar student={student} /><div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">{student.firstName} {student.lastName}</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">کد هنرآموزی: {student.studentCode}</p>
                <div className="mt-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClass(student.status)}`}>{getStatusLabel(student.status)}</span></div>
              </div></div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/dashboard/students/${student.id}/edit`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:border-elf/30 hover:bg-elf/5 hover:text-elf dark:border-gray-700 dark:text-gray-200 dark:hover:bg-elf/10 dark:hover:text-emerald-300"><Pencil size={16} />ویرایش اطلاعات</Link>
                {availableActions.map((action) => { const Icon = action.icon; return <button key={action.key} type="button" disabled={busy} onClick={() => void handleAction(action.key)} className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${action.className}`}><Icon size={16} />{action.label}</button>; })}
              </div>
            </div>
          </section>

          <DetailSection title="اطلاعات فردی" icon={UserRound}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <InfoItem label="نام" value={student.firstName || "ثبت نشده"} icon={UserRound} />
              <InfoItem label="نام خانوادگی" value={student.lastName || "ثبت نشده"} icon={UserRound} />
              <InfoItem label="کد ملی" value={student.nationalIdentificationNumber || "ثبت نشده"} icon={ShieldCheck} />
              <InfoItem label="تاریخ تولد" value={formatDate(student.birthDate)} icon={CalendarDays} />
              <InfoItem label="سن" value={age === null ? "نامشخص" : `${age} سال`} icon={CalendarDays} />
              <InfoItem label="ایمیل" value={student.email || "ثبت نشده"} icon={Mail} />
            </div>
          </DetailSection>

          <DetailSection title="اطلاعات آموزشی" icon={GraduationCap}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <InfoItem label="شماره هنرآموزی" value={student.studentCode || "ثبت نشده"} icon={UserRound} />
              <InfoItem label="تاریخ ثبت‌نام" value={formatDate(student.registrationDate)} icon={CalendarDays} />
            </div>
            <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800"><p className="text-xs text-gray-500 dark:text-gray-400">بیوگرافی</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-300">{student.biography || "بیوگرافی ثبت نشده است."}</p></div>
          </DetailSection>

          <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-xl bg-elf/10 text-elf dark:text-emerald-300"><UsersRound size={19} /></div><div><h2 className="font-semibold text-gray-900 dark:text-white">والدین و سرپرستان</h2><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{age === null ? "سن هنرآموز مشخص نیست" : `سن هنرآموز: ${age} سال`}</p></div></div>
              {canHaveParent && <button type="button" onClick={() => { setParentModalOpen(true); setParentsError(null); }} className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl bg-elf px-4 text-sm font-semibold text-white transition hover:opacity-90"><Plus size={17} />اتصال والد</button>}
            </div>
            {!canHaveParent ? (
              <div className="px-5 py-10 text-center"><ShieldCheck size={28} className="mx-auto text-gray-400" /><p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">{age === null ? "برای تعیین امکان اتصال والد، تاریخ تولد معتبر لازم است." : "هنرآموز ۱۸ سال یا بیشتر دارد؛ اتصال والد از این بخش امکان‌پذیر نیست."}</p></div>
            ) : parentsLoading ? (
              <div className="animate-pulse space-y-3 p-5"><div className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800" /><div className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800" /></div>
            ) : parentsError ? (
              <div className="px-5 py-12 text-center"><AlertCircle size={27} className="mx-auto text-red-500" /><p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{parentsError}</p><button type="button" onClick={() => void loadParents()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white"><RefreshCw size={15} />تلاش مجدد</button></div>
            ) : parents.length === 0 ? (
              <div className="px-5 py-12 text-center"><UsersRound size={28} className="mx-auto text-gray-400" /><h3 className="mt-3 font-semibold text-gray-900 dark:text-white">هنوز والدی متصل نشده است</h3><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">برای ثبت ارتباط، از گزینه اتصال والد استفاده کنید.</p></div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {parents.map((item) => <article key={item.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex min-w-0 items-center gap-3"><ParentAvatar parent={item.parent} /><div className="min-w-0"><Link href={`/dashboard/parents/${item.parent.id}`} className="block truncate font-semibold text-gray-900 transition hover:text-elf dark:text-white dark:hover:text-emerald-300">{item.parent.firstName} {item.parent.lastName}</Link><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400"><span>کد ملی: {item.parent.nationalIdentificationNumber || "ثبت نشده"}</span>{item.parent.mobile && <span className="inline-flex items-center gap-1"><Phone size={12} />{item.parent.mobile}</span>}</div></div></div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end"><span className="rounded-full bg-elf/10 px-3 py-1.5 text-xs font-medium text-elf dark:text-emerald-300">{relationshipLabel(item.relationship)}</span><button type="button" disabled={parentBusy} onClick={() => void disconnectParent(item)} title="قطع ارتباط" className="inline-flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"><Unlink size={16} /></button></div>
                </article>)}
              </div>
            )}
          </section>
        </>
      )}

      {parentModalOpen && canHaveParent && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true" aria-labelledby="connect-parent-title">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800"><div><h2 id="connect-parent-title" className="font-semibold text-gray-900 dark:text-white">اتصال والد به هنرآموز</h2><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">ابتدا والد را جست‌وجو و سپس نسبت را مشخص کنید.</p></div><button type="button" onClick={() => setParentModalOpen(false)} className="flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="بستن"><X size={18} /></button></div>
            <div className="space-y-5 p-5">
              <div><label htmlFor="parent-search" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">جست‌وجوی والد</label><div className="relative"><Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" /><input id="parent-search" value={parentSearch} onChange={(event) => setParentSearch(event.target.value)} placeholder="نام، نام خانوادگی یا کد ملی" className="h-11 w-full rounded-xl border border-gray-200 bg-white pr-10 pl-3 text-sm text-gray-900 outline-none focus:border-elf dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></div></div>
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-100 p-2 dark:border-gray-800">
                {searchingParents ? <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500"><LoaderCircle size={17} className="animate-spin" />در حال جست‌وجو...</div> : availableParents.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">والدی با این مشخصات پیدا نشد.</p> : availableParents.map((parent) => <button type="button" key={parent.id} onClick={() => setSelectedParentId(parent.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right transition ${selectedParentId === parent.id ? "border-elf bg-elf/5 dark:bg-elf/10" : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"}`}><ParentAvatar parent={parent} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{parent.firstName} {parent.lastName}</span><span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">کد ملی: {parent.nationalIdentificationNumber || "ثبت نشده"}</span></span>{selectedParentId === parent.id && <CheckCircle2 size={19} className="text-elf" />}</button>)}
              </div>
              <div><label htmlFor="parent-relationship" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">نسبت با هنرآموز</label><select id="parent-relationship" value={selectedRelationship} onChange={(event) => setSelectedRelationship(Number(event.target.value) as StudentParentRelationship)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-elf dark:border-gray-700 dark:bg-gray-800 dark:text-white">{RELATIONSHIPS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
              <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row sm:justify-end"><button type="button" onClick={() => setParentModalOpen(false)} className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">انصراف</button><button type="button" disabled={!selectedParentId || parentBusy} onClick={() => void connectParent()} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-elf px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{parentBusy && <LoaderCircle size={16} className="animate-spin" />}اتصال والد</button></div>
            </div>
          </div>
        </div>
      )}

      {busy && <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><LoaderCircle size={17} className="animate-spin text-elf" />در حال اجرای عملیات...</div>}
    </section>
  );
}
