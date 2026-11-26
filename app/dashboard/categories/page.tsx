import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "مدیریت دسته‌بندی مقالات",
  singular: "دسته‌بندی",
  endpoint: "/api/Categories",
  fields: [
    { name: "name", label: "نام دسته‌بندی", required: true },
    { name: "description", label: "توضیحات", type: "textarea" },
  ],
  columns: [
    { key: "name", label: "نام دسته‌بندی" },
    { key: "description", label: "توضیحات" },
    { key: "isActive", label: "وضعیت", enumLabels: { 0: "غیرفعال", 1: "فعال" } },
  ],
  statusField: "isActive",
  activatePath: "activate",
  deactivatePath: "deactivate",
};

export default function CategoriesPage() {
  return <EducationResourceManager config={config} />;
}
