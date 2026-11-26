import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "تراکنش‌ها",
  singular: "تراکنش",
  endpoint: "/api/Transactions",
  readOnly: true,
  fields: [],
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
export default function Page() { return <EducationResourceManager config={config} />; }
