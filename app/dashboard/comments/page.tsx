import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "مدیریت نظرات",
  singular: "نظر",
  endpoint: "/api/Comments",
  fields: [
    { name: "userId", label: "شناسه کاربر", editableOnUpdate: false },
    { name: "blogId", label: "شناسه مقاله", editableOnUpdate: false },
    { name: "text", label: "متن نظر", type: "textarea", editableOnUpdate: false },
    { name: "status", label: "وضعیت", type: "select", editableOnUpdate: false, options: [
      { value: 1, label: "در انتظار بررسی" },
      { value: 2, label: "تأیید شده" },
      { value: 3, label: "رد شده" },
    ] },
  ],
  columns: [
    { key: "text", label: "متن نظر" },
    { key: "userId", label: "شناسه کاربر" },
    { key: "blogId", label: "شناسه مقاله" },
    { key: "status", label: "وضعیت", enumLabels: { 1: "در انتظار بررسی", 2: "تأیید شده", 3: "رد شده" } },
  ],
  readOnly: true,
  actions: [
    { label: "تأیید نظر", path: "approve" },
    { label: "در انتظار بررسی", path: "pending" },
    { label: "رد نظر", path: "reject" },
  ],
};

export default function CommentsPage() {
  return <EducationResourceManager config={config} />;
}
