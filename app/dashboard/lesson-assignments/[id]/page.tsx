"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, BookOpen, CalendarDays, GraduationCap, RefreshCw, AlertCircle, UserRound, Music2 } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import Loading from "@/app/loading";

type Row = Record<string, unknown>;
type Assignment = {
  id: string;
  studentId: string;
  teacherId: string;
  bookId: string;
  instrumentId: string;
  startDate: string;
  endDate: string | null;
  sessionFee: number;
  paymentPlan: number;
  notes: string | null;
  status: number;
};
const record = (value: unknown): Row => value && typeof value === "object" ? value as Row : {};
const array = (value: unknown): Row[] => {
  if (Array.isArray(value)) return value.map(record);
  const root = record(value);
  if (Array.isArray(root.$values)) return root.$values.map(record);
  if (Array.isArray(root.items)) return root.items.map(record);
  if (Array.isArray(root.data)) return root.data.map(record);
  return [];
};
const textValue = (row: Row | null, key: string) => row?.[key] === null || row?.[key] === undefined || row[key] === "" ? "—" : String(row[key]);
const nameOf = (row: Row | null) => row ? [row.firstName, row.lastName].filter(Boolean).join(" ") || "—" : "—";
const dateOf = (input: unknown) => {
  if (!input) return "—";
  const date = new Date(String(input));
  return Number.isNaN(date.getTime()) ? String(input) : new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(date);
};
const paymentPlan = (value: number) => ({1:"پرداخت هر جلسه",2:"پیش‌پرداخت",3:"ماهانه",4:"بسته‌ای"}[value] ?? String(value));
const assignmentStatus = (value: number) => ({1:"فعال",2:"معلق",3:"تکمیل‌شده",4:"لغوشده"}[value] ?? String(value));

export default function LessonAssignmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [student, setStudent] = useState<Row | null>(null);
  const [teacher, setTeacher] = useState<Row | null>(null);
  const [book, setBook] = useState<Row | null>(null);
  const [instrument, setInstrument] = useState<Row | null>(null);
  const [sessions, setSessions] = useState<Row[]>([]);
  const [plans, setPlans] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const current = await apiFetch<Assignment>(`/api/LessonAssignments/${id}`);
      setAssignment(current);
      const [studentResult, teacherResult, bookResult, instrumentResult, sessionResult, planResult] = await Promise.all([
        apiFetch<unknown>(`/api/Students/${current.studentId}`).catch(() => null),
        apiFetch<unknown>(`/api/Teachers/${current.teacherId}`).catch(() => null),
        apiFetch<unknown>(`/api/Books/${current.bookId}`).catch(() => null),
        apiFetch<unknown>(`/api/Instruments/${current.instrumentId}`).catch(() => null),
        apiFetch<unknown>(`/api/LessonSessions/assignment/${id}`).catch(() => []),
        apiFetch<unknown>("/api/TeachingPlans").catch(() => [])
      ]);
      setStudent(studentResult ? record(studentResult) : null);
      setTeacher(teacherResult ? record(teacherResult) : null);
      setBook(bookResult ? record(bookResult) : null);
      setInstrument(instrumentResult ? record(instrumentResult) : null);
      setSessions(array(sessionResult));
      setPlans(array(planResult).filter(plan => String(plan.lessonAssignmentId) === id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت جزئیات تخصیص آموزشی ناموفق بود.");
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void load(); }, [load, refresh]);

  const runAction = async (action: "suspend" | "resume" | "complete") => {
    if (!assignment) return;
    let query = "";
    if (action === "complete") {
      const endDate = window.prompt("تاریخ پایان را با قالب YYYY-MM-DD وارد کنید:");
      if (!endDate) return;
      query = `?EndDate=${encodeURIComponent(endDate)}`;
    }
    setBusy(true); setError(null);
    try {
      await apiFetch(`/api/LessonAssignments/${assignment.id}/${action}${query}`, { method: "PATCH" });
      setRefresh(x => x + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "اجرای عملیات ناموفق بود.");
    } finally { setBusy(false); }
  };

  if (loading) return <Loading />;
  if (!assignment) return <main dir="rtl" className="mx-auto max-w-3xl p-6"><p className="text-red-600">{error ?? "تخصیص آموزشی پیدا نشد."}</p><button onClick={() => setRefresh(x => x + 1)} className="mt-3 rounded-xl border px-4 py-2">تلاش دوباره</button></main>;

  return <main dir="rtl" className="mx-auto w-full max-w-[1400px] space-y-6 px-3 py-6 sm:px-5 lg:px-8">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-gray-500">مدیریت آموزش / تخصیص‌های آموزشی</p><h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">جزئیات تخصیص آموزشی</h1><p className="mt-1 text-xs text-gray-500">شناسه: {assignment.id}</p></div><Link href="/dashboard/lesson-assignments" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm dark:border-gray-700"><ArrowRight size={16}/>بازگشت به تخصیص‌ها</Link></header>
    {error && <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-400/10 dark:text-red-300"><AlertCircle size={17}/>{error}</div>}
    <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">وضعیت تخصیص و عملیات</h2><div className="flex flex-wrap gap-2"><button disabled={busy} onClick={() => void runAction("suspend")} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50 dark:border-gray-700">تعلیق</button><button disabled={busy} onClick={() => void runAction("resume")} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50 dark:border-gray-700">ازسرگیری</button><button disabled={busy} onClick={() => void runAction("complete")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">اتمام تخصیص</button><button onClick={() => setRefresh(x => x + 1)} className="rounded-lg border p-2 dark:border-gray-700" title="بروزرسانی"><RefreshCw size={15}/></button></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Info label="وضعیت" value={assignmentStatus(assignment.status)}/><Info label="تاریخ شروع" value={dateOf(assignment.startDate)}/><Info label="تاریخ پایان" value={dateOf(assignment.endDate)}/><Info label="هزینه هر جلسه" value={assignment.sessionFee.toLocaleString("fa-IR")}/><Info label="روش پرداخت" value={paymentPlan(assignment.paymentPlan)}/><Info label="یادداشت" value={assignment.notes ?? "—"}/></div></section>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Card icon={<UserRound size={19}/>} title="هنرجو" primary={nameOf(student)} secondary={textValue(student,"studentCode")}/><Card icon={<GraduationCap size={19}/>} title="مدرس" primary={nameOf(teacher)} secondary={textValue(teacher,"teacherCode")}/><Card icon={<BookOpen size={19}/>} title="کتاب" primary={textValue(book,"title")} secondary={textValue(book,"author")}/><Card icon={<Music2 size={19}/>} title="ساز" primary={textValue(instrument,"name")} secondary={textValue(instrument,"englishName")}/></div>
    <section className="rounded-2xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 font-bold"><CalendarDays size={18}/>جلسات این تخصیص</h2><Link href="/dashboard/lesson-sessions" className="text-sm font-semibold text-elf">مدیریت جلسات</Link></div>{sessions.length?<div className="overflow-x-auto"><table className="w-full min-w-[600px] text-right text-sm"><thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950"><tr><th className="p-3">تاریخ</th><th className="p-3">مدت</th><th className="p-3">وضعیت</th><th className="p-3">جزئیات</th></tr></thead><tbody className="divide-y dark:divide-gray-800">{sessions.map(session=><tr key={String(session.id)}><td className="p-3">{dateOf(session.sessionDate)}</td><td className="p-3">{textValue(session,"durationMinutes")}</td><td className="p-3">{textValue(session,"status")}</td><td className="p-3"><Link className="font-semibold text-elf" href={`/dashboard/lesson-sessions/${String(session.id)}`}>مشاهده جلسه</Link></td></tr>)}</tbody></table></div>:<p className="text-sm text-gray-500">هنوز جلسه‌ای برای این تخصیص ثبت نشده است.</p>}</section>
    <section className="rounded-2xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 font-bold"><BookOpen size={18}/>برنامه‌های آموزشی</h2><Link href="/dashboard/teaching-plans" className="text-sm font-semibold text-elf">مدیریت برنامه‌ها</Link></div>{plans.length?<div className="grid gap-3 sm:grid-cols-2">{plans.map(plan=><div key={String(plan.id)} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-950"><p className="font-semibold">ترتیب {textValue(plan,"displayOrder")}</p><p className="mt-1 text-xs text-gray-500">شروع: {dateOf(plan.startDate)} · پایان: {dateOf(plan.endDate)}</p><p className="mt-2 text-sm">{textValue(plan,"objective")}</p><p className="mt-1 text-xs text-gray-500">وضعیت: {textValue(plan,"status")}</p></div>)}</div>:<p className="text-sm text-gray-500">برنامه آموزشی ثبت نشده است.</p>}</section>
  </main>;
}

function Info({label,value}:{label:string;value:string}) { return <div className="min-w-0 rounded-xl bg-gray-50 p-3 dark:bg-gray-950"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p></div>; }
function Card({icon,title,primary,secondary}:{icon:ReactNode;title:string;primary:string;secondary:string}) { return <section className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900"><div className="flex items-center gap-2 text-gray-500">{icon}<span className="text-sm">{title}</span></div><p className="mt-3 font-bold text-gray-900 dark:text-white">{primary}</p><p className="mt-1 text-xs text-gray-500">{secondary}</p></section>; }
