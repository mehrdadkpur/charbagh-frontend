import EducationResourceManager, { type EducationResourceConfig } from "@/app/ui/components/Admin/Education/EducationResourceManager";

const config:EducationResourceConfig={
  title:"سازهای موسیقی",
  singular:"ساز",
  endpoint:"/api/Instruments",
  fields:[
    {name:"instrumentCategoryId",label:"دسته‌بندی ساز",type:"select",optionsEndpoint:"/api/InstrumentCategories",optionLabel:"name",required:true},
    {name:"name",label:"نام ساز",required:true},
    {name:"englishName",label:"نام انگلیسی"},
    {name:"description",label:"توضیحات",type:"textarea"}
  ],
  columns:[
    {key:"name",label:"نام ساز"},
    {key:"englishName",label:"نام انگلیسی"},
    {key:"instrumentCategoryId",label:"دسته‌بندی",lookupField:"instrumentCategoryId"},
    {key:"isActive",label:"فعال"}
  ],
  statusField:"isActive",
  activatePath:"activate",
  deactivatePath:"deactivate"
};

export default function InstrumentsPage(){return <EducationResourceManager config={config}/>;}
