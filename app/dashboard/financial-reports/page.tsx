"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { CalendarDays, RefreshCw, Wallet, ReceiptText, CircleDollarSign, AlertCircle } from "lucide-react";

type DailyPayment = { date: string; amount: number; count: number };
type MonthlyPayment = { month: string; amount: number; count: number };
type ServiceRevenue = { serviceName: string; amount: number; quantity: number };
type StudentBalance = { studentId: string; studentName: string; invoiceCount: number; remainingAmount: number };
type OutstandingInvoice = {
  invoiceId: string;
  invoiceDate: string;
  studentName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: number;
};
type PaymentRow = {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  paymentMethodId: string;
  referenceNumber?: string | null;
  note?: string | null;
};
type RefundRow = {
  id: string;
  paymentId: string;
  transactionDate: string;
  amount: number;
  referenceNumber?: string | null;
  description?: string | null;
};
type ReportData = {
  fromDate: string;
  toDate: string;
  invoiceCount: number;
  invoicedAmount: number;
  discountAmount: number;
  collectedAmount: number;
  paymentCount: number;
  refundAmount: number;
  refundCount: number;
  outstandingAmount: number;
  outstandingInvoiceCount: number;
  dailyPayments: DailyPayment[];
  monthlyPayments: MonthlyPayment[];
  serviceRevenue: ServiceRevenue[];
  studentBalances: StudentBalance[];
  outstandingInvoices: OutstandingInvoice[];
  payments: PaymentRow[];
  refunds: RefundRow[];
};

const money = (value: number) =>
  new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 }).format(value);

const dateText = (value: string) =>
  new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const monthAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

function SummaryCard({ title, value, icon: Icon, hint }: { title: string; value: number; icon: typeof Wallet; hint: string }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{money(value)}</p>
          <p className="mt-1 text-xs text-gray-400">{hint}</p>
        </div>
        <span className="rounded-xl bg-elf/10 p-3 text-elf"><Icon size={22} /></span>
      </div>
    </article>
  );
}

export default function FinancialReportsPage() {
  const [fromDate, setFromDate] = useState(monthAgo);
  const [toDate, setToDate] = useState(today);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ fromDate, toDate });
      const result = await apiFetch<ReportData>(`/api/FinancialReports/summary?${query.toString()}`);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت گزارش مالی ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { void load(); }, [load]);

  const maxDaily = useMemo(
    () => Math.max(1, ...(report?.dailyPayments.map(item => item.amount) ?? [])),
    [report],
  );
  const maxMonthly = useMemo(
    () => Math.max(1, ...(report?.monthlyPayments.map(item => item.amount) ?? [])),
    [report],
  );
  const maxService = useMemo(
    () => Math.max(1, ...(report?.serviceRevenue.map(item => item.amount) ?? [])),
    [report],
  );

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1600px] space-y-6 px-3 py-6 sm:px-5 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">گزارش‌های مالی</h1>
          <p className="mt-1 text-sm text-gray-500">نمای کلی درآمد، وصول مطالبات و وضعیت بدهی هنرجویان</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm dark:border-gray-700">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> بروزرسانی گزارش
        </button>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-end">
        <label className="flex-1 space-y-1.5 text-sm">
          <span className="text-gray-600 dark:text-gray-300">از تاریخ</span>
          <span className="relative block"><CalendarDays size={16} className="absolute right-3 top-3 text-gray-400" /><input type="date" value={fromDate} max={toDate} onChange={e => setFromDate(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-9 pl-3 dark:border-gray-700 dark:bg-gray-950" /></span>
        </label>
        <label className="flex-1 space-y-1.5 text-sm">
          <span className="text-gray-600 dark:text-gray-300">تا تاریخ</span>
          <span className="relative block"><CalendarDays size={16} className="absolute right-3 top-3 text-gray-400" /><input type="date" value={toDate} min={fromDate} max={today()} onChange={e => setToDate(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-9 pl-3 dark:border-gray-700 dark:bg-gray-950" /></span>
        </label>
        <button onClick={() => void load()} disabled={loading || !fromDate || !toDate} className="rounded-xl bg-elf px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">اعمال بازه</button>
      </section>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}

      {loading && !report ? <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">در حال دریافت گزارش...</div> : report && <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard title="مبلغ فاکتورهای قطعی" value={report.invoicedAmount} icon={ReceiptText} hint={`${money(report.invoiceCount)} فاکتور`} />
          <SummaryCard title="وصول خالص" value={report.collectedAmount} icon={CircleDollarSign} hint="پس از کسر بازپرداخت‌ها" />
          <SummaryCard title="بازپرداخت‌ها" value={report.refundAmount} icon={RefreshCw} hint={`${money(report.refundCount)} بازپرداخت موفق`} />
          <SummaryCard title="مانده مطالبات" value={report.outstandingAmount} icon={Wallet} hint={`${money(report.outstandingInvoiceCount)} فاکتور باز`} />
          <SummaryCard title="مجموع تخفیف‌ها" value={report.discountAmount} icon={ReceiptText} hint="روی فاکتورهای قطعی بازه" />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-bold text-gray-900 dark:text-white">روند وصول ماهانه</h2>
          <p className="mt-1 text-xs text-gray-500">تجمیع جریان نقدی خالص بر اساس ماه تقویمی</p>
          {report.monthlyPayments.length === 0 ? <p className="py-10 text-center text-sm text-gray-500">در این بازه پرداختی ثبت نشده است.</p> :
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{report.monthlyPayments.map(item => <div key={item.month} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
              <div className="flex items-center justify-between gap-2 text-sm"><span className="text-gray-600 dark:text-gray-300">{new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long" }).format(new Date(item.month))}</span><span className="font-semibold">{money(item.amount)}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"><div className="h-full rounded-full bg-elf" style={{ width: `${item.amount / maxMonthly * 100}%` }} /></div>
              <p className="mt-1 text-[11px] text-gray-400">{money(item.count)} رویداد مالی</p>
            </div>)}</div>}
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-bold text-gray-900 dark:text-white">روند وصول روزانه</h2>
            <p className="mt-1 text-xs text-gray-500">مجموع پرداخت‌هایی که در هر روز ثبت شده‌اند</p>
            {report.dailyPayments.length === 0 ? <p className="py-10 text-center text-sm text-gray-500">در این بازه پرداختی ثبت نشده است.</p> :
              <div className="mt-5 space-y-3">{report.dailyPayments.map(item => <div key={item.date} className="grid grid-cols-[92px_1fr_110px] items-center gap-3 text-xs">
                <span className="text-gray-500">{dateText(item.date)}</span>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-elf" style={{ width: `${Math.max(2, item.amount / maxDaily * 100)}%` }} /></div>
                <span className="text-left font-medium text-gray-700 dark:text-gray-200">{money(item.amount)}</span>
              </div>)}</div>}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-bold text-gray-900 dark:text-white">مبلغ خدمات به تفکیک شرح</h2>
            <p className="mt-1 text-xs text-gray-500">مبلغ خالص ردیف‌ها پس از تخصیص متناسب تخفیف فاکتور</p>
            {report.serviceRevenue.length === 0 ? <p className="py-10 text-center text-sm text-gray-500">اطلاعاتی برای نمایش وجود ندارد.</p> :
              <div className="mt-5 space-y-4">{report.serviceRevenue.map(item => <div key={item.serviceName}>
                <div className="mb-1 flex justify-between gap-3 text-sm"><span className="text-gray-700 dark:text-gray-200">{item.serviceName}</span><span className="font-semibold text-gray-900 dark:text-white">{money(item.amount)}</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-elf" style={{ width: `${item.amount / maxService * 100}%` }} /></div>
                <p className="mt-1 text-[11px] text-gray-400">{money(item.quantity)} واحد</p>
              </div>)}</div>}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 p-4 dark:border-gray-800"><h2 className="font-bold text-gray-900 dark:text-white">بدهکارترین هنرجویان</h2><p className="mt-1 text-xs text-gray-500">مانده تمام فاکتورهای باز هر هنرجو</p></div>
            {report.studentBalances.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">هنرجوی بدهکار وجود ندارد.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-right text-sm"><thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950"><tr><th className="px-4 py-3">هنرجو</th><th className="px-4 py-3">فاکتور باز</th><th className="px-4 py-3">مانده بدهی</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{report.studentBalances.map(row => <tr key={row.studentId}><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.studentName}</td><td className="px-4 py-3">{money(row.invoiceCount)}</td><td className="px-4 py-3 font-semibold text-red-600">{money(row.remainingAmount)}</td></tr>)}</tbody></table></div>}
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 p-4 dark:border-gray-800"><h2 className="font-bold text-gray-900 dark:text-white">فاکتورهای تسویه‌نشده</h2><p className="mt-1 text-xs text-gray-500">فاکتورهای پرداخت‌نشده یا دارای پرداخت ناقص</p></div>
            {report.outstandingInvoices.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">فاکتور تسویه‌نشده‌ای وجود ندارد.</p> : <div className="max-h-[420px] overflow-auto"><table className="w-full min-w-[500px] text-right text-sm"><thead className="sticky top-0 bg-gray-50 text-xs text-gray-500 dark:bg-gray-950"><tr><th className="px-4 py-3">هنرجو</th><th className="px-4 py-3">تاریخ</th><th className="px-4 py-3">مانده</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{report.outstandingInvoices.map(row => <tr key={row.invoiceId}><td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.studentName}</td><td className="px-4 py-3 text-gray-500">{dateText(row.invoiceDate)}</td><td className="px-4 py-3 font-semibold text-red-600">{money(row.remainingAmount)}</td></tr>)}</tbody></table></div>}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 p-4 dark:border-gray-800"><h2 className="font-bold text-gray-900 dark:text-white">پرداخت‌های بازه انتخابی</h2><p className="mt-1 text-xs text-gray-500">مبنای محاسبه مبلغ وصول‌شده در این گزارش</p></div>
          {report.payments.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">پرداختی در این بازه ثبت نشده است.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-right text-sm"><thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950"><tr><th className="px-4 py-3">تاریخ پرداخت</th><th className="px-4 py-3">شناسه فاکتور</th><th className="px-4 py-3">مبلغ</th><th className="px-4 py-3">شماره پیگیری</th><th className="px-4 py-3">توضیحات</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{report.payments.map(row => <tr key={row.id}><td className="px-4 py-3">{dateText(row.paymentDate)}</td><td className="px-4 py-3 font-mono text-xs">{row.invoiceId}</td><td className="px-4 py-3 font-semibold">{money(row.amount)}</td><td className="px-4 py-3">{row.referenceNumber || "—"}</td><td className="px-4 py-3">{row.note || "—"}</td></tr>)}</tbody></table></div>}
        </section>
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 p-4 dark:border-gray-800"><h2 className="font-bold text-gray-900 dark:text-white">بازپرداخت‌های موفق</h2><p className="mt-1 text-xs text-gray-500">این مبالغ از وصول خالص و روند جریان نقدی کسر شده‌اند</p></div>
          {report.refunds.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">بازپرداخت موفقی در این بازه ثبت نشده است.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-right text-sm"><thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950"><tr><th className="px-4 py-3">تاریخ بازپرداخت</th><th className="px-4 py-3">شناسه پرداخت</th><th className="px-4 py-3">مبلغ</th><th className="px-4 py-3">شماره پیگیری</th><th className="px-4 py-3">شرح</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{report.refunds.map(row => <tr key={row.id}><td className="px-4 py-3">{dateText(row.transactionDate)}</td><td className="px-4 py-3 font-mono text-xs">{row.paymentId}</td><td className="px-4 py-3 font-semibold text-red-600">{money(row.amount)}</td><td className="px-4 py-3">{row.referenceNumber || "—"}</td><td className="px-4 py-3">{row.description || "—"}</td></tr>)}</tbody></table></div>}
        </section>
        <p className="text-xs leading-6 text-gray-500">مبالغ بر اساس واحد پولی ذخیره‌شده در سامانه نمایش داده می‌شوند. فاکتورهای پیش‌نویس و لغوشده از مبلغ فاکتورهای قطعی و خدمات حذف شده‌اند. بازپرداخت‌های موفق از وصول خالص کسر می‌شوند. مانده مطالبات و بدهی هنرجویان، وضعیت فعلی تمام فاکتورهای باز را نشان می‌دهد و به بازه تاریخ محدود نیست.</p>
      </>}
    </main>
  );
}
