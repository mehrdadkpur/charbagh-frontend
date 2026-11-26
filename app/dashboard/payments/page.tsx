import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "پرداخت‌ها",
  singular: "پرداخت",
  endpoint: "/api/Payments",
  fields: [
    { name: "invoiceId", label: "فاکتور", type: "select", optionsEndpoint: "/api/Invoices", optionLabel: ["studentId", "totalAmount", "status"], required: true, editableOnUpdate: false },
    { name: "paymentMethodId", label: "روش پرداخت", type: "select", optionsEndpoint: "/api/PaymentMethods", optionLabel: "name", required: true },
    { name: "paidByUserId", label: "پرداخت‌کننده", type: "select", optionsEndpoint: "/api/Users", optionLabel: ["firstName", "lastName"] },
    { name: "amount", label: "مبلغ", type: "number", required: true, min: 0.01, editableOnUpdate: false },
    { name: "paymentDate", label: "تاریخ پرداخت", type: "datetime-local", required: true },
    { name: "referenceNumber", label: "شماره پیگیری" },
    { name: "note", label: "یادداشت", type: "textarea" }
  ],
  columns: [
    { key: "invoiceId", label: "فاکتور", lookupField: "invoiceId" },
    { key: "paymentMethodId", label: "روش پرداخت", lookupField: "paymentMethodId" },
    { key: "amount", label: "مبلغ" },
    { key: "paymentDate", label: "تاریخ پرداخت" },
    { key: "referenceNumber", label: "شماره پیگیری" }
  ]
};
export default function Page() {
  return (
    <div className="space-y-3">
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        ثبت پرداخت به‌تنهایی به معنی وصول قطعی نیست. پس از ثبت، در بخش تراکنش‌ها یک تراکنش «دریافت وجه» برای آن ایجاد کنید و پس از اطمینان از دریافت وجه، وضعیت آن را «موفق» کنید تا مبلغ به فاکتور اضافه شود.
      </p>
      <EducationResourceManager config={config} />
    </div>
  );
}
