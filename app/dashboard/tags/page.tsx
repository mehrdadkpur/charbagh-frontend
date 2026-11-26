import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "مدیریت برچسب‌ها",
  singular: "برچسب",
  endpoint: "/api/Tags",
  fields: [
    { name: "name", label: "نام برچسب", required: true },
  ],
  columns: [
    { key: "name", label: "نام برچسب" },
    { key: "isActive", label: "وضعیت", enumLabels: { 0: "غیرفعال", 1: "فعال" } },
  ],
  statusField: "isActive",
  activatePath: "activate",
  deactivatePath: "deactivate",
};

export default function TagsPage() {
  return <EducationResourceManager config={config} />;
}
