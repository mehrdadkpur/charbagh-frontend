import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "تراکنش‌ها",
  singular: "تراکنش",
  endpoint: "/api/Transactions",
  createOnly: true,
  fields: [
    { name: "paymentId", label: "پرداخت", type: "select", optionsEndpoint: "/api/Payments", optionLabel: ["invoiceId", "amount", "paymentDate"], required: true },
    { name: "createdByUserId", label: "ثبت‌کننده", type: "select", optionsEndpoint: "/api/Users", optionLabel: ["firstName", "lastName"], required: true },
    { name: "type", label: "نوع تراکنش", type: "select", options: [{ value: 1, label: "دریافت وجه" }, { value: 2, label: "بازپرداخت" }, { value: 3, label: "اصلاح حساب" }], required: true },
    { name: "amount", label: "مبلغ", type: "number", min: 0.01, required: true },
    { name: "transactionDate", label: "تاریخ تراکنش", type: "datetime-local", required: true },
    { name: "referenceNumber", label: "شماره پیگیری" },
    { name: "description", label: "شرح", type: "textarea" }
  ],
  columns: [
    { key: "paymentId", label: "شناسه پرداخت" },
    { key: "type", label: "نوع", enumLabels: { 1: "دریافت وجه", 2: "بازپرداخت", 3: "اصلاح حساب" } },
    { key: "amount", label: "مبلغ" },
    { key: "transactionDate", label: "تاریخ" },
    { key: "status", label: "وضعیت", enumLabels: { 1: "در انتظار", 2: "موفق", 3: "ناموفق", 4: "لغوشده" } },
    { key: "referenceNumber", label: "شماره پیگیری" },
    { key: "description", label: "شرح" }
  ],
  actions: [
    { label: "موفق", path: "successful" },
    { label: "ناموفق", path: "failed", bodyPrompt: true },
    { label: "لغو", path: "cancel", bodyPrompt: true }
  ]
};
export default function Page() {
  return (
    <div className="space-y-3">
      <p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
        برای قطعی‌شدن دریافت وجه، نوع «دریافت وجه» را انتخاب کنید و پس از ثبت، عملیات «موفق» را بزنید. برای برگرداندن وجه، نوع «بازپرداخت» را ثبت و فقط پس از انجام واقعی بازپرداخت، آن را موفق کنید. تراکنش ناموفق یا لغوشده روی مانده فاکتور اثر نمی‌گذارد.
      </p>
      <EducationResourceManager config={config} />
    </div>
  );
}
