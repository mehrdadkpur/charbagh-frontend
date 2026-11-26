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
export default function Page() { return <EducationResourceManager config={config} />; }
