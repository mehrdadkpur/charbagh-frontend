import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "روش‌های پرداخت",
  singular: "روش پرداخت",
  endpoint: "/api/PaymentMethods",
  fields: [
    { name: "name", label: "نام روش پرداخت", required: true },
    { name: "description", label: "توضیحات", type: "textarea" },
    { name: "displayOrder", label: "ترتیب نمایش", type: "number", min: 0, required: true }
  ],
  columns: [
    { key: "name", label: "نام" },
    { key: "description", label: "توضیحات" },
    { key: "displayOrder", label: "ترتیب" },
    { key: "isActive", label: "وضعیت" }
  ],
  statusField: "isActive",
  activatePath: "activate",
  deactivatePath: "deactivate"
};
export default function Page() { return <EducationResourceManager config={config} />; }
