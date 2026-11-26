import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "پرداخت‌ها",
  singular: "پرداخت",
  endpoint: "/api/Payments",
  fields: [
    { name: "invoiceId", label: "فاکتور", type: "select", optionsEndpoint: "/api/Invoices", optionLabel: ["studentId", "totalAmount", "status"], required: true, editableOnUpdate: false },
    { name: "paymentMethodId", label: "روش پرداخت", type: "select", optionsEndpoint: "/api/PaymentMethods", optionLabel: "name", required: true },
    { name: "paidByUserId", label: "پرداخت‌کننده", type: "select", optionsEndpoint: "/api/Users", optionLabel: ["firstName", "lastName"] },
    { name: "amount", label: "مبلغ", type: "number", required: true, min: 0.01 },
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
export default function Page() { return <EducationResourceManager config={config} />; }
