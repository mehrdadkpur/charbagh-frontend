import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "تخفیف‌ها",
  singular: "تخفیف",
  endpoint: "/api/discounts",
  fields: [
    { name: "invoiceId", label: "فاکتور", type: "select", optionsEndpoint: "/api/Invoices", optionLabel: ["studentId", "totalAmount"], required: true, editableOnUpdate: false },
    { name: "discountTypeId", label: "نوع تخفیف", type: "select", optionsEndpoint: "/api/DiscountTypes", optionLabel: "name", required: true },
    { name: "valueType", label: "مبنای تخفیف", type: "select", options: [{ value: 1, label: "مبلغ ثابت" }, { value: 2, label: "درصد" }], required: true },
    { name: "value", label: "مقدار تخفیف", type: "number", required: true, min: 0.01 },
    { name: "description", label: "توضیحات", type: "textarea" }
  ],
  columns: [
    { key: "invoiceId", label: "شناسه فاکتور" },
    { key: "discountTypeId", label: "نوع تخفیف", lookupField: "discountTypeId" },
    { key: "valueType", label: "مبنا", enumLabels: { 1: "مبلغ ثابت", 2: "درصد" } },
    { key: "value", label: "مقدار" },
    { key: "amount", label: "مبلغ محاسبه‌شده" },
    { key: "description", label: "توضیحات" }
  ]
};
export default function Page() { return <EducationResourceManager config={config} />; }
