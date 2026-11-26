"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, RefreshCw, Plus, CheckCircle2, XCircle, AlertCircle, Receipt, CreditCard, Tags } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import Loading from "@/app/loading";

type Row = Record<string, unknown>;
type Invoice = { id: string; studentId: string; invoiceDate: string; subtotal: number; discountAmount: number; totalAmount: number; paidAmount: number; remainingAmount: number; status: number; description: string | null };
type Option = { id: string; name: string; price?: number; educationServiceId?: string };
const arr = (v: unknown): Row[] => {
  if (Array.isArray(v)) return v as Row[];
  const x = v && typeof v === "object" ? v as Row : {};
  if (Array.isArray(x.$values)) return x.$values as Row[];
  if (Array.isArray(x.items)) return x.items as Row[];
  if (Array.isArray(x.data)) return x.data as Row[];
  return [];
};
const money = (v: unknown) => Number(v ?? 0).toLocaleString("fa-IR");
const date = (v: unknown) => v ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(String(v))) : "—";
const statuses: Record<number,string> = {1:"پیش‌نویس",2:"پرداخت‌نشده",3:"پرداخت ناقص",4:"تسویه‌شده",5:"لغوشده"};

export default function InvoiceDetailsPage() {
  const { id } = useParams<{id:string}>();
  const [invoice,setInvoice] = useState<Invoice|null>(null);
  const [items,setItems] = useState<Row[]>([]);
  const [payments,setPayments] = useState<Row[]>([]);
  const [discount,setDiscount] = useState<Row|null>(null);
  const [services,setServices] = useState<Option[]>([]);
  const [student,setStudent] = useState<Row|null>(null);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState<string|null>(null);
  const [refresh,setRefresh] = useState(0);
  const [showItem,setShowItem] = useState(false);

  const load = useCallback(async() => {
    setLoading(true); setError(null);
    try {
      const [inv,itemRows,paymentRows,discountRow,serviceRows] = await Promise.all([
        apiFetch<Invoice>(`/api/Invoices/${id}`),
        apiFetch<unknown>(`/api/InvoiceItems/invoice/${id}`),
        apiFetch<unknown>(`/api/Payments/invoice/${id}`),
        apiFetch<Row|null>(`/api/discounts/invoice/${id}`).catch(()=>null),
        apiFetch<unknown>("/api/ServicePrices")
      ]);
      setInvoice(inv); setItems(arr(itemRows)); setPayments(arr(paymentRows)); setDiscount(discountRow); 
      setServices(arr(serviceRows).map(x=>({id:String(x.id),name:String(x.educationServiceName??x.name??x.educationServiceId),price:Number(x.price??0)})));
      const s = await apiFetch<Row>(`/api/Students/${inv.studentId}`).catch(()=>null);
      setStudent(s);
    } catch(e) { setError(e instanceof Error ? e.message : "دریافت جزئیات فاکتور ناموفق بود."); }
    finally { setLoading(false); }
  },[id]);
  useEffect(()=>{void load();},[load,refresh]);

  const runInvoiceAction = async(action:"confirm"|"cancel") => {
    if(!invoice)return;
    if(action==="cancel"&&!window.confirm("آیا از لغو این فاکتور مطمئن هستید؟"))return;
    setBusy(true);setError(null);
    try { await apiFetch(`/api/Invoices/${id}/${action}`,{method:"PATCH"});setRefresh(x=>x+1); }
    catch(e){setError(e instanceof Error?e.message:"عملیات فاکتور ناموفق بود.");}
    finally{setBusy(false);}
  };

  const addItem = async(event:FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    const type=Number(form.get("type"));
    const servicePriceId=String(form.get("servicePriceId")??"");
    const payload={invoiceId:id,type,servicePriceId:type===4||!servicePriceId?null:servicePriceId,description:String(form.get("description")??"").trim(),unitPrice:Number(form.get("unitPrice")??0),quantity:Number(form.get("quantity")??1)};
    setBusy(true);setError(null);
    try { await apiFetch("/api/InvoiceItems",{method:"POST",body:JSON.stringify(payload)});setShowItem(false);setRefresh(x=>x+1); }
    catch(e){setError(e instanceof Error?e.message:"افزودن ردیف فاکتور ناموفق بود.");}
    finally{setBusy(false);}
  };

  if(loading)return <Loading/>;
  if(!invoice)return <main dir="rtl" className="p-6"><p className="text-red-600">{error??"فاکتور پیدا نشد."}</p></main>;
  const canEdit=invoice.status===1;
  return <main dir="rtl" className="mx-auto max-w-[1400px] space-y-6 px-3 py-6 sm:px-5 lg:px-8">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-gray-500">مدیریت مالی / فاکتورها</p><h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">جزئیات فاکتور</h1><p className="mt-1 text-xs text-gray-500">شناسه: {invoice.id}</p></div><Link href="/dashboard/invoices" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm dark:border-gray-700"><ArrowRight size={16}/>بازگشت</Link></header>
    {error&&<div role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-400/10 dark:text-red-300"><AlertCircle size={17}/>{error}</div>}
    <section className="rounded-2xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">اطلاعات فاکتور</h2><p className="mt-1 text-sm text-gray-500">هنرجو: {student?[student.firstName,student.lastName].filter(Boolean).join(" "):invoice.studentId}</p><p className="mt-1 text-xs text-gray-500">تاریخ: {date(invoice.invoiceDate)} · وضعیت: {statuses[invoice.status]??invoice.status}</p></div><div className="flex flex-wrap gap-2"><button disabled={busy||!canEdit} onClick={()=>void runInvoiceAction("confirm")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><CheckCircle2 size={15}/>تأیید فاکتور</button><button disabled={busy||invoice.status===4||invoice.status===5} onClick={()=>void runInvoiceAction("cancel")} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs disabled:opacity-40 dark:border-gray-700"><XCircle size={15}/>لغو فاکتور</button><button onClick={()=>setRefresh(x=>x+1)} className="rounded-lg border p-2 dark:border-gray-700" title="بروزرسانی"><RefreshCw size={15}/></button></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Metric label="جمع جزء" value={invoice.subtotal}/><Metric label="تخفیف" value={invoice.discountAmount}/><Metric label="مبلغ کل" value={invoice.totalAmount}/><Metric label="پرداخت‌شده" value={invoice.paidAmount}/><Metric label="مانده" value={invoice.remainingAmount}/></div>{invoice.description&&<p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{invoice.description}</p>}</section>
    <section className="rounded-2xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 font-bold"><Receipt size={18}/>ردیف‌های فاکتور</h2>{canEdit&&<button onClick={()=>setShowItem(x=>!x)} className="inline-flex items-center gap-2 rounded-lg bg-elf px-3 py-2 text-xs font-semibold text-white"><Plus size={15}/>افزودن ردیف</button>}</div>
      {showItem&&<form onSubmit={addItem} className="mb-5 grid gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-950 sm:grid-cols-2 lg:grid-cols-5"><label className="text-xs">نوع ردیف<select name="type" defaultValue="4" className="mt-1 w-full rounded-lg border bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"><option value="1">جلسه آموزشی</option><option value="2">کتاب</option><option value="3">ثبت‌نام</option><option value="4">سایر</option></select></label><label className="text-xs">قیمت خدمت (برای انواع غیر از سایر)<select name="servicePriceId" className="mt-1 w-full rounded-lg border bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"><option value="">انتخاب قیمت خدمت</option>{services.map(s=><option key={s.id} value={s.id}>{s.name} — {money(s.price)}</option>)}</select></label><label className="text-xs">شرح ردیف<input name="description" required className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-gray-700 dark:bg-gray-900"/></label><label className="text-xs">قیمت واحد<input name="unitPrice" type="number" min="0" step="0.01" defaultValue="0" className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-gray-700 dark:bg-gray-900"/></label><label className="text-xs">تعداد<input name="quantity" type="number" min="1" defaultValue="1" required className="mt-1 w-full rounded-lg border p-2 text-sm dark:border-gray-700 dark:bg-gray-900"/></label><div className="flex gap-2 sm:col-span-2 lg:col-span-5"><button disabled={busy} className="rounded-lg bg-elf px-4 py-2 text-xs font-semibold text-white">ذخیره ردیف</button><button type="button" onClick={()=>setShowItem(false)} className="rounded-lg border px-4 py-2 text-xs dark:border-gray-700">انصراف</button></div></form>}
      {items.length?<div className="overflow-x-auto"><table className="w-full min-w-[600px] text-right text-sm"><thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950"><tr><th className="p-3">شرح</th><th className="p-3">نوع</th><th className="p-3">قیمت واحد</th><th className="p-3">تعداد</th><th className="p-3">جمع</th></tr></thead><tbody className="divide-y dark:divide-gray-800">{items.map(item=><tr key={String(item.id)}><td className="p-3">{String(item.description??"—")}</td><td className="p-3">{({1:"جلسه",2:"کتاب",3:"ثبت‌نام",4:"سایر"} as Record<number,string>)[Number(item.type)]??String(item.type)}</td><td className="p-3">{money(item.unitPrice)}</td><td className="p-3">{money(item.quantity)}</td><td className="p-3">{money(Number(item.unitPrice??0)*Number(item.quantity??0))}</td></tr>)}</tbody></table></div>:<p className="text-sm text-gray-500">هنوز ردیفی برای این فاکتور ثبت نشده است.</p>}
    </section>
    <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><h2 className="mb-4 flex items-center gap-2 font-bold"><CreditCard size={18}/>پرداخت‌های فاکتور</h2>{payments.length?<div className="space-y-3">{payments.map(p=><div key={String(p.id)} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-950"><div><p className="text-sm font-semibold">{money(p.amount)} </p><p className="mt-1 text-xs text-gray-500">{date(p.paymentDate)} · {String(p.referenceNumber??"بدون شماره پیگیری")}</p></div><Link href="/dashboard/payments" className="text-xs font-semibold text-elf">مدیریت پرداخت‌ها</Link></div>)}</div>:<p className="text-sm text-gray-500">پرداختی ثبت نشده است.</p>}<Link href="/dashboard/payments" className="mt-4 inline-block text-sm font-semibold text-elf">ثبت یا مدیریت پرداخت</Link></section>
    <section className="rounded-2xl border bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><h2 className="mb-4 flex items-center gap-2 font-bold"><Tags size={18}/>تخفیف فاکتور</h2>{discount?<div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950"><p className="font-semibold">{money(discount.amount)}</p><p className="mt-1 text-xs text-gray-500">مقدار: {String(discount.value)} · مبنا: {Number(discount.valueType)===2?"درصد":"مبلغ ثابت"}</p><p className="mt-1 text-sm">{String(discount.description??"")}</p></div>:<p className="text-sm text-gray-500">تخفیفی ثبت نشده است.</p>}<Link href="/dashboard/discounts" className="mt-4 inline-block text-sm font-semibold text-elf">مدیریت تخفیف‌ها</Link></section></div>
  </main>;
}
function Metric({label,value}:{label:string;value:number}){return <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-lg font-bold tabular-nums">{money(value)}</p></div>}
