import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "فاکتورها",
  singular: "فاکتور",
  endpoint: "/api/Invoices",
  detailsPath: "/dashboard/invoices",
  fields: [
    { name: "studentId", label: "هنرجو", type: "select", optionsEndpoint: "/api/Students", optionLabel: ["firstName", "lastName"], required: true, editableOnUpdate: false },
    { name: "description", label: "شرح فاکتور", type: "textarea" },
    { name: "invoiceDate", label: "تاریخ فاکتور", type: "date", visibleOnCreate: false }
  ],
  columns: [
    { key: "invoiceDate", label: "تاریخ" },
    { key: "studentId", label: "هنرجو", lookupField: "studentId" },
    { key: "subtotal", label: "جمع جزء" },
    { key: "discountAmount", label: "تخفیف" },
    { key: "totalAmount", label: "مبلغ کل" },
    { key: "paidAmount", label: "پرداخت‌شده" },
    { key: "remainingAmount", label: "مانده" },
    { key: "status", label: "وضعیت", enumLabels: { 1: "پیش‌نویس", 2: "پرداخت‌نشده", 3: "پرداخت ناقص", 4: "تسویه‌شده", 5: "لغوشده" } }
  ],
};
export default function Page() { return <EducationResourceManager config={config} />; }
