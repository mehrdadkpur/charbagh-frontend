import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "انواع تخفیف",
  singular: "نوع تخفیف",
  endpoint: "/api/DiscountTypes",
  fields: [
    { name: "name", label: "عنوان نوع تخفیف", required: true },
    { name: "description", label: "توضیحات", type: "textarea" },
    { name: "displayOrder", label: "ترتیب نمایش", type: "number", min: 0, required: true }
  ],
  columns: [
    { key: "name", label: "عنوان" },
    { key: "description", label: "توضیحات" },
    { key: "displayOrder", label: "ترتیب" },
    { key: "isActive", label: "وضعیت" }
  ],
  statusField: "isActive",
  activatePath: "activate",
  deactivatePath: "deactivate"
};
export default function Page() { return <EducationResourceManager config={config} />; }
