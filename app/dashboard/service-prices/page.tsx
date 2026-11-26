import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config: EducationResourceConfig = {
  title: "قیمت خدمات",
  singular: "قیمت خدمت",
  endpoint: "/api/ServicePrices",
  fields: [
    { name: "educationServiceId", label: "خدمت آموزشی", type: "select", optionsEndpoint: "/api/EducationServices", optionLabel: "serviceName", required: true, editableOnUpdate: false },
    { name: "price", label: "قیمت", type: "number", min: 0.01, required: true },
    { name: "effectiveFrom", label: "تاریخ شروع اعتبار", type: "date", required: true, editableOnUpdate: false }
  ],
  columns: [
    { key: "educationServiceId", label: "خدمت", lookupField: "educationServiceId" },
    { key: "price", label: "قیمت" },
    { key: "effectiveFrom", label: "شروع اعتبار" },
    { key: "effectiveTo", label: "پایان اعتبار" },
    { key: "isActive", label: "فعال" }
  ],
  actions: [{ label: "تعیین پایان اعتبار", path: "set-effectiveto", queryParam: "effectiveTo" }]
};
export default function Page() { return <EducationResourceManager config={config} />; }
