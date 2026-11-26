"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, RefreshCw, Search, Pencil, Eye, Power, X, AlertCircle, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";

export type EducationField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "datetime-local" | "textarea" | "select" | "time";
  required?: boolean;
  editableOnUpdate?: boolean;
  min?: number;
  max?: number;
  options?: { value: string | number; label: string }[];
  optionsEndpoint?: string;
  optionValue?: string;
  optionLabel?: string | string[];
};

export type EducationResourceConfig = {
  title: string;
  singular: string;
  endpoint: string;
  fields: EducationField[];
  columns: { key: string; label: string; lookupField?: string; enumLabels?: Record<number, string> }[];
  statusField?: string;
  activatePath?: string;
  deactivatePath?: string;
  mapFromApi?: (record: Record<string, unknown>) => Record<string, unknown>;
  actions?: { label: string; path: string; queryParam?: string }[];
  detailsPath?: string;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? value as Record<string, unknown> : {};

const asArray = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value.map(asRecord);
  const record = asRecord(value);
  if (Array.isArray(record.$values)) return record.$values.map(asRecord);
  if (Array.isArray(record.items)) return record.items.map(asRecord);
  if (Array.isArray(record.data)) return record.data.map(asRecord);
  return [];
};

const inputValue = (type: EducationField["type"], value: unknown) => {
  if (value === null || value === undefined) return "";
  const raw = String(value);
  if (type === "date") return raw.slice(0, 10);
  if (type === "datetime-local") return raw.replace("Z", "").slice(0, 16);
  if (type === "time") return raw.slice(0, 5);
  return raw;
};

const display = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const displayWithLookup = (value: unknown, lookupField: string | undefined, options: Record<string, { value: string | number; label: string }[]>, enumLabels?: Record<number, string>) => {
  if (enumLabels && value !== null && value !== undefined && enumLabels[Number(value)] !== undefined) return enumLabels[Number(value)];
  if (lookupField && value !== null && value !== undefined) {
    const found = options[lookupField]?.find(option => String(option.value) === String(value));
    if (found) return found.label;
  }
  return display(value);
};

export default function EducationResourceManager({ config }: { config: EducationResourceConfig }) {
  const [items,setItems] = useState<Record<string,unknown>[]>([]);
  const [options,setOptions] = useState<Record<string,{value:string|number;label:string}[]>>({});
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  const [search,setSearch] = useState("");
  const [editor,setEditor] = useState<Record<string,unknown>|null>(null);
  const [creating,setCreating] = useState(false);
  const [saving,setSaving] = useState(false);
  const [detail,setDetail] = useState<Record<string,unknown>|null>(null);

  const load = useCallback(async()=>{
    setLoading(true);setError(null);
    try {
      const result = await apiFetch<unknown>(config.endpoint);
      setItems(asArray(result));
    } catch(e) {
      setError(e instanceof Error?e.message:"دریافت اطلاعات ناموفق بود.");
    } finally {setLoading(false);}
  },[config.endpoint]);

  useEffect(()=>{void load();},[load]);

  useEffect(()=>{
    let cancelled=false;
    const loadOptions=async()=>{
      const next:Record<string,{value:string|number;label:string}[]>={};
      await Promise.all(config.fields.map(async field=>{
        if(!field.optionsEndpoint)return;
        try{
          const rows=asArray(await apiFetch<unknown>(field.optionsEndpoint));
          next[field.name]=rows.map(row=>({value:(row[field.optionValue??"id"]??"") as string|number,label:Array.isArray(field.optionLabel)?field.optionLabel.map(key=>row[key]).filter(value=>value!==null&&value!==undefined&&String(value).trim()!=="").join(" "):display(row[field.optionLabel??"name"]??row[field.optionLabel??"title"])}));
        }catch{next[field.name]=[];}
      }));
      if(!cancelled)setOptions(next);
    };
    void loadOptions();
    return()=>{cancelled=true;};
  },[config.fields]);

  const filtered=useMemo(()=>{
    const q=search.trim().toLocaleLowerCase();
    if(!q)return items;
    return items.filter(item=>config.columns.some(col=>displayWithLookup(item[col.key],col.lookupField,options,col.enumLabels).toLocaleLowerCase().includes(q)));
  },[items,search,config.columns,options]);

  const beginCreate=()=>{setCreating(true);setEditor({});setDetail(null);};
  const beginEdit=(item:Record<string,unknown>)=>{setCreating(false);setEditor(item);setDetail(null);};
  const closeEditor=()=>{setEditor(null);setCreating(false);};

  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();if(!editor)return;
    const form=new FormData(event.currentTarget);
    const payload:Record<string,unknown>={};
    for(const field of config.fields){
      if(!creating&&field.editableOnUpdate===false)continue;
      const value=form.get(field.name);
      if(value===null)continue;
      if(field.type==="number")payload[field.name]=value===""?null:Number(value);
      else if(field.type==="select"){const raw=String(value).trim();const choice=[...(field.options??[]),...(options[field.name]??[])].find(option=>String(option.value)===raw);payload[field.name]=raw===""?null:(choice?.value??raw);}
      else payload[field.name]=String(value).trim()||null;
    }
    setSaving(true);
    try{
      if(creating) await apiFetch(config.endpoint,{method:"POST",body:JSON.stringify(payload)});
      else await apiFetch(`${config.endpoint}/${String(editor.id)}`,{method:"PUT",body:JSON.stringify({id:editor.id,...payload})});
      closeEditor();await load();
    }catch(e){setError(e instanceof Error?e.message:"ذخیره اطلاعات ناموفق بود.");}
    finally{setSaving(false);}
  };

  const runAction=async(item:Record<string,unknown>,action:{label:string;path:string;queryParam?:string})=>{
    if(!item.id)return;
    let query="";let body:string|undefined;
    if(action.queryParam){const value=window.prompt(`مقدار ${action.label} را وارد کنید (تاریخ با قالب YYYY-MM-DD):`);if(!value)return;query=`?${action.queryParam}=${encodeURIComponent(value)}`;}
    if(action.bodyPrompt){const value=window.prompt(`توضیحات ${action.label} را وارد کنید:`);if(value===null)return;body=JSON.stringify(value);}
    try{await apiFetch(`${config.endpoint}/${String(item.id)}/${action.path}${query}`,{method:action.method??"PATCH",...(body!==undefined?{body}:{})});await load();}
    catch(e){setError(e instanceof Error?e.message:"اجرای عملیات ناموفق بود.");}
  };

  const toggleStatus=async(item:Record<string,unknown>)=>{
    if(!config.statusField||!item.id)return;
    const active=Boolean(item[config.statusField]);
    const path=active?config.deactivatePath:config.activatePath;
    if(!path)return;
    try{await apiFetch(`${config.endpoint}/${String(item.id)}/${path}`,{method:"PATCH"});await load();}
    catch(e){setError(e instanceof Error?e.message:"تغییر وضعیت ناموفق بود.");}
  };

  return <main dir="rtl" className="mx-auto w-full max-w-[1600px] space-y-6 px-3 py-6 sm:px-5 lg:px-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h1><p className="mt-1 text-sm text-gray-500">مدیریت اطلاعات {config.singular} بر اساس سرویس‌های سامانه</p></div>
      {!config.readOnly&&<button onClick={beginCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-elf px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17}/>افزودن {config.singular}</button>}
    </header>
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm"><Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جست‌وجو..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-9 pl-3 text-sm outline-none focus:border-elf dark:border-gray-700 dark:bg-gray-950"/></div>
        <div className="flex items-center gap-3"><span className="text-xs text-gray-500">{filtered.length} مورد</span><button onClick={()=>void load()} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700"><RefreshCw size={14}/>بروزرسانی</button></div>
      </div>
      {error&&<div role="alert" className="m-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-400/10 dark:text-red-300"><AlertCircle size={17} className="mt-0.5 shrink-0"/><span>{error}</span><button onClick={()=>setError(null)} className="mr-auto"><X size={15}/></button></div>}
      {loading?<div className="p-12 text-center text-sm text-gray-500">در حال دریافت اطلاعات...</div>:filtered.length===0?<div className="p-12 text-center text-sm text-gray-500">موردی برای نمایش وجود ندارد.</div>:
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-right text-sm"><thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-950"><tr>{config.columns.map(col=><th key={col.key} className="px-4 py-3 font-medium">{col.label}</th>)}<th className="px-4 py-3">عملیات</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{filtered.map((item,index)=><tr key={String(item.id??index)} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">{config.columns.map(col=><td key={col.key} className="max-w-xs px-4 py-3 text-gray-700 dark:text-gray-200"><span className="line-clamp-2">{displayWithLookup(item[col.key],col.lookupField,options,col.enumLabels)}</span></td>)}<td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={()=>setDetail(item)} title="مشاهده" className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"><Eye size={15}/></button>{config.detailsPath&&<Link href={`${config.detailsPath}/${String(item.id)}`} title="جزئیات کامل" className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"><ExternalLink size={15}/></Link>}{!config.readOnly&&<button onClick={()=>beginEdit(item)} title="ویرایش" className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"><Pencil size={15}/></button>}{config.statusField&&<button onClick={()=>void toggleStatus(item)} title="تغییر وضعیت" className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"><Power size={15}/></button>}{config.actions?.map(action=><button key={action.path} onClick={()=>void runAction(item,action)} title={action.label} className="rounded-lg border px-2.5 py-2 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">{action.label}</button>)}</div></td></tr>)}</tbody></table></div>}
    </section>
    {(editor||detail)&&<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3" onMouseDown={e=>{if(e.target===e.currentTarget){closeEditor();setDetail(null);}}}>
      <section className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between"><h2 className="font-bold text-gray-900 dark:text-white">{detail?"جزئیات":creating?"افزودن":"ویرایش"} {config.singular}</h2><button onClick={()=>{closeEditor();setDetail(null);}} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={18}/></button></div>
        {detail?<dl className="grid gap-3 sm:grid-cols-2">{Object.entries(detail).filter(([key])=>!key.toLowerCase().includes("navigation")).map(([key,value])=><div key={key} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950"><dt className="text-xs text-gray-500">{config.fields.find(f=>f.name.toLowerCase()===key.toLowerCase())?.label??key}</dt><dd className="mt-1 break-words text-sm text-gray-900 dark:text-gray-100">{displayWithLookup(value,config.columns.find(col=>col.key.toLowerCase()===key.toLowerCase())?.lookupField??config.fields.find(f=>f.name.toLowerCase()===key.toLowerCase()&&f.type==="select")?.name,options,config.columns.find(col=>col.key.toLowerCase()===key.toLowerCase())?.enumLabels)}</dd></div>)}</dl>:
        <form onSubmit={submit} className="space-y-4">{config.fields.map(field=>{const value=editor?.[field.name];const common={name:field.name,required:field.required??false,disabled:!creating&&field.editableOnUpdate===false,defaultValue:inputValue(field.type,value),className:"w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-elf dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"};return <label key={field.name} className="block space-y-1.5"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}{field.required?" *":""}</span>{field.type==="textarea"?<textarea {...common} rows={3}/>:field.type==="select"?<select key={`${field.name}-${(field.options??options[field.name]??[]).length}`} {...common}><option value="">انتخاب کنید</option>{(field.options??options[field.name]??[]).map(option=><option key={String(option.value)} value={option.value}>{option.label}</option>)}</select>:<input {...common} type={field.type??"text"} min={field.min} max={field.max} step={field.type==="number"?"any":undefined}/>}</label>})}<div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800"><button type="button" onClick={closeEditor} className="rounded-xl border px-4 py-2 text-sm dark:border-gray-700">انصراف</button><button disabled={saving} className="rounded-xl bg-elf px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving?"در حال ذخیره...":"ذخیره"}</button></div></form>}
      </section>
    </div>}
  </main>;
}
