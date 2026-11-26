"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, ClipboardCheck, BookOpen, GraduationCap, RefreshCw, AlertCircle, CheckCircle2, UserRound } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import Loading from "@/app/loading";

type Row = Record<string, unknown>;
type Session = {
  id: string;
  lessonAssignmentId: string;
  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number | null;
  teacherNote: string | null;
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
const value = (row: Row | null, key: string) => row?.[key] === null || row?.[key] === undefined || row[key] === "" ? "—" : String(row[key]);
const dateTime = (input: unknown) => {
  if (!input) return "—";
  const date = new Date(String(input));
  return Number.isNaN(date.getTime()) ? String(input) : new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
};
const personName = (row: Row | null) => row ? [row.firstName, row.lastName].filter(Boolean).join(" ") || "—" : "—";

export default function LessonSessionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [assignment, setAssignment] = useState<Row | null>(null);
  const [student, setStudent] = useState<Row | null>(null);
  const [teacher, setTeacher] = useState<Row | null>(null);
  const [contents, setContents] = useState<Row[]>([]);
  const [attendance, setAttendance] = useState<Row | null>(null);
  const [practices, setPractices] = useState<Row[]>([]);
  const [evaluation, setEvaluation] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const current = await apiFetch<Session>(`/api/LessonSessions/${id}`);
      setSession(current);
      const [assignmentResult, contentResult, attendanceResult, practiceResult, evaluationResult] = await Promise.all([
        apiFetch<unknown>(`/api/LessonAssignments/${current.lessonAssignmentId}`).catch(() => null),
        apiFetch<unknown>(`/api/LessonContents/session/${id}`).catch(() => []),
        apiFetch<unknown>(`/api/Attendances/session/${id}`).catch(() => null),
        apiFetch<unknown>("/api/PracticeAssignments").catch(() => []),
        apiFetch<unknown>("/api/Evaluations").catch(() => [])
      ]);
      const assignmentRow = assignmentResult ? record(assignmentResult) : null;
      setAssignment(assignmentRow);
      setContents(array(contentResult));
      setAttendance(attendanceResult ? record(attendanceResult) : null);
      setPractices(array(practiceResult).filter(item => String(item.lessonSessionId) === id));
      setEvaluation(array(evaluationResult).find(item => String(item.lessonSessionId) === id) ?? null);
      if (assignmentRow) {
        const [studentResult, teacherResult] = await Promise.all([
          assignmentRow.studentId ? apiFetch<unknown>(`/api/Students/${String(assignmentRow.studentId)}`).catch(() => null) : Promise.resolve(null),
          assignmentRow.teacherId ? apiFetch<unknown>(`/api/Teachers/${String(assignmentRow.teacherId)}`).catch(() => null) : Promise.resolve(null)
        ]);
        setStudent(studentResult ? record(studentResult) : null);
        setTeacher(teacherResult ? record(teacherResult) : null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "دریافت جزئیات جلسه ناموفق بود.");
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void load(); }, [load, refresh]);

  const runAction = async (action: string) => {
    if (!session) return;
    setBusy(true); setError(null);
    try {
      await apiFetch(`/api/LessonSessions/${session.id}/${action}`, { method: "PATCH" });
      setRefresh(x => x + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "اجرای عملیات ناموفق بود.");
    } finally { setBusy(false); }
  };

  if (loading) return <Loading />;
  if (!session) return <main dir="rtl" className="mx-auto max-w-3xl p-6"><p className="text-red-600">{error ?? "جلسه پیدا نشد."}</p><button onClick={() => setRefresh(x => x + 1)} className="mt-3 rounded-xl border px-4 py-2">تلاش دوباره</button></main>;

  return <main dir="rtl" className="mx-auto w-full max-w-[1400px] space-y-6 px-3 py-6 sm:px-5 lg:px-8">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-sm text-gray-500">مدیریت آموزش / جلسات آموزشی</p><h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">جزئیات جلسه آموزشی</h1><p className="mt-1 text-xs text-gray-500">{dateTime(session.sessionDate)}</p></div>
      <Link href="/dashboard/lesson-sessions" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm dark:border-gray-700"><ArrowRight size={16}/>بازگشت به جلسات</Link>
    </header>
    {error && <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-400/10 dark:text-red-300"><AlertCircle size={17}/>{error}</div>}
    <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">وضعیت و عملیات جلسه</h2><div className="flex flex-wrap gap-2"><button disabled={busy} onClick={() => void runAction("complete")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">تکمیل جلسه</button><button disabled={busy} onClick={() => void runAction("cancel")} className="rounded-lg bg-gray-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">لغو جلسه</button><button disabled={busy} onClick={() => void runAction("student-absent")} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50 dark:border-gray-700">غیبت هنرجو</button><button disabled={busy} onClick={() => void runAction("teacher-absent")} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50 dark:border-gray-700">غیبت مدرس</button><button onClick={() => setRefresh(x => x + 1)} className="rounded-lg border p-2 dark:border-gray-700" title="بروزرسانی"><RefreshCw size={15}/></button></div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Info label="تاریخ جلسه" value={dateTime(session.sessionDate)}/><Info label="ساعت شروع" value={value(session as unknown as Row,"startTime")}/><Info label="ساعت پایان" value={value(session as unknown as Row,"endTime")}/><Info label="مدت (دقیقه)" value={value(session as unknown as Row,"durationMinutes")}/><Info label="وضعیت" value={value(session as unknown as Row,"status")}/><Info label="یادداشت مدرس" value={session.teacherNote ?? "—"}/>
      </div>
    </section>
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><h2 className="mb-4 flex items-center gap-2 font-bold"><UserRound size={18}/>افراد و تخصیص آموزشی</h2><div className="grid gap-3 sm:grid-cols-2"><Info label="هنرجو" value={personName(student)}/><Info label="مدرس" value={personName(teacher)}/><Info label="شناسه تخصیص" value={session.lessonAssignmentId}/><Info label="هزینه جلسه" value={value(assignment,"sessionFee")}/></div><Link href={`/dashboard/lesson-assignments/${session.lessonAssignmentId}`} className="mt-4 inline-flex text-sm font-semibold text-elf">مشاهده جزئیات تخصیص آموزشی</Link></section>
      <section className="rounded-2xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><h2 className="mb-4 flex items-center gap-2 font-bold"><ClipboardCheck size={18}/>حضور و غیاب</h2>{attendance?<div className="grid gap-3 sm:grid-cols-2"><Info label="وضعیت حضور" value={value(attendance,"status")}/><Info label="ورود" value={dateTime(attendance.checkInAt)}/><Info label="خروج" value={dateTime(attendance.checkOutAt)}/><Info label="دلیل" value={value(attendance,"reason")}/><Info label="یادداشت" value={value(attendance,"note")}/></div>:<p className="text-sm text-gray-500">برای این جلسه هنوز رکورد حضور و غیاب ثبت نشده است.</p>}<Link href="/dashboard/attendance" className="mt-4 inline-flex text-sm font-semibold text-elf">مدیریت حضور و غیاب</Link></section>
      <section className="rounded-2xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><h2 className="mb-4 flex items-center gap-2 font-bold"><BookOpen size={18}/>محتوای تدریس‌شده</h2>{contents.length?<div className="space-y-3">{contents.map(item=><div key={String(item.id)} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950"><p className="font-medium">{value(item,"bookItemId")}</p><p className="mt-1 text-xs text-gray-500">{value(item,"fromReference")} تا {value(item,"toReference")}</p><p className="mt-1 text-sm">{value(item,"teacherNote")}</p></div>)}</div>:<p className="text-sm text-gray-500">محتوایی برای این جلسه ثبت نشده است.</p>}<Link href="/dashboard/lesson-contents" className="mt-4 inline-flex text-sm font-semibold text-elf">مدیریت محتوای جلسات</Link></section>
      <section className="rounded-2xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><h2 className="mb-4 flex items-center gap-2 font-bold"><GraduationCap size={18}/>تکالیف تمرینی</h2>{practices.length?<div className="space-y-3">{practices.map(item=><div key={String(item.id)} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950"><p className="font-medium">{value(item,"instruction")}</p><p className="mt-1 text-xs text-gray-500">سرفصل: {value(item,"bookItemId")} · مهلت: {value(item,"dueDate")} · اولویت: {value(item,"priority")}</p></div>)}</div>:<p className="text-sm text-gray-500">تکلیفی برای این جلسه ثبت نشده است.</p>}<Link href="/dashboard/practice-assignments" className="mt-4 inline-flex text-sm font-semibold text-elf">مدیریت تکالیف تمرینی</Link></section>
      <section className="rounded-2xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:col-span-2"><h2 className="mb-4 flex items-center gap-2 font-bold"><CheckCircle2 size={18}/>ارزیابی جلسه</h2>{evaluation?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Info label="وضعیت تمرین" value={value(evaluation,"practiceStatus")}/><Info label="امتیاز" value={value(evaluation,"score")}/><Info label="نقاط قوت" value={value(evaluation,"strengths")}/><Info label="موارد قابل بهبود" value={value(evaluation,"weaknesses")}/><div className="sm:col-span-2 lg:col-span-4"><Info label="نظر مدرس" value={value(evaluation,"teacherComment")}/></div></div>:<p className="text-sm text-gray-500">هنوز ارزیابی‌ای برای این جلسه ثبت نشده است.</p>}<Link href="/dashboard/evaluations" className="mt-4 inline-flex text-sm font-semibold text-elf">مدیریت ارزیابی‌ها</Link></section>
    </div>
  </main>;
}

function Info({label,value}:{label:string;value:string}) {
  return <div className="min-w-0 rounded-xl bg-gray-50 p-3 dark:bg-gray-950"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p></div>;
}
