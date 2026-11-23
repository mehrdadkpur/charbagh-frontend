"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
    Save,
    ShieldCheck,
    Info,
    Loader2,
    FileText,
    Fingerprint,
    Type,
    CircleCheck,
    X,
} from "lucide-react";

import Swal from "sweetalert2";

import { apiFetch } from "@/lib/apiFetch";

interface Role {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    isSystem: boolean;
    isActive: boolean;
    activeAssignmentCount?: number;
    branchCount?: number;
    uniqueUserCount?: number;
    createdAt?: string;
    updatedAt?: string | null;
}

interface UpdateRolePayload {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
}

interface FormErrors {
    name?: string;
    displayName?: string;
    description?: string;
}

export default function EditRolePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const [role, setRole] = useState<Role | null>(null);

    const [name, setName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [forbidden, setForbidden] = useState(false);

    const [errors, setErrors] = useState<FormErrors>({});

    const loadRole = useCallback(async () => {
        try {
            setLoading(true);

            // apiFetch خودش JSON را پردازش می‌کند.
            const data = await apiFetch(`/api/roles/${params.id}`) as Role;

            if (!data?.id) {
                throw new Error("اطلاعات نقش معتبر نیست.");
            }

            // نقش سیستمی اجازه ورود به فرم ویرایش ندارد.
            if (data.isSystem) {
                setForbidden(true);

                await Swal.fire({
                    icon: "warning",
                    title: "ویرایش غیرمجاز",
                    text: "نقش‌های سیستمی قابل ویرایش نیستند.",
                    confirmButtonText: "مشاهده جزئیات نقش",
                    confirmButtonColor: "#64748b",
                });

                router.replace(`/dashboard/roles/${data.id}`);
                return;
            }

            setRole(data);

            setName(data.name ?? "");
            setDisplayName(data.displayName ?? "");
            setDescription(data.description ?? "");

        } catch (error) {
            console.error("Load role error:", error);

            await Swal.fire({
                icon: "error",
                title: "خطا در دریافت اطلاعات",
                text:
                    error instanceof Error
                        ? error.message
                        : "دریافت اطلاعات نقش ناموفق بود.",
                confirmButtonText: "بازگشت",
            });

            router.replace("/dashboard/roles");
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        if (params.id) {
            loadRole();
        }
    }, [params.id, loadRole]);

    const validate = (): boolean => {
        const nextErrors: FormErrors = {};

        if (!displayName.trim()) {
            nextErrors.displayName = "نام نمایشی نقش الزامی است.";
        } else if (displayName.trim().length > 150) {
            nextErrors.displayName =
                "نام نمایشی نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.";
        }

        if (!name.trim()) {
            nextErrors.name = "نام فنی نقش الزامی است.";
        } else if (name.trim().length > 100) {
            nextErrors.name =
                "نام فنی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.";
        } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name.trim())) {
            nextErrors.name =
                "نام فنی باید با حروف انگلیسی شروع شود و فقط شامل حروف، اعداد و زیرخط باشد.";
        }

        if (description.trim().length > 1000) {
            nextErrors.description =
                "توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!role || role.isSystem || saving) {
            return;
        }

        if (!validate()) {
            return;
        }

        const confirmation = await Swal.fire({
            icon: "question",
            title: "ذخیره تغییرات؟",
            text: "آیا از ذخیره اطلاعات جدید این نقش اطمینان دارید؟",
            showCancelButton: true,
            confirmButtonText: "بله، ذخیره شود",
            cancelButtonText: "انصراف",
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#64748b",
            reverseButtons: true,
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        const payload: UpdateRolePayload = {
            id: role.id,
            name: name.trim(),
            displayName: displayName.trim(),
            description: description.trim() || null,
        };

        try {
            setSaving(true);

            /*
             * apiFetch در پروژه ما خروجی را JSON می‌کند.
             * بنابراین نیازی به response.ok، response.json یا response.text نیست.
             */
            await apiFetch(`/api/roles/${role.id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });

            await Swal.fire({
                icon: "success",
                title: "تغییرات ذخیره شد",
                text: "اطلاعات نقش با موفقیت به‌روزرسانی شد.",
                confirmButtonText: "مشاهده نقش",
                confirmButtonColor: "#16a34a",
            });

            router.push(`/dashboard/roles/${role.id}`);
            router.refresh();

        } catch (error) {
            console.error("Update role error:", error);

            await Swal.fire({
                icon: "error",
                title: "خطا در ذخیره تغییرات",
                text:
                    error instanceof Error
                        ? error.message
                        : "ذخیره تغییرات نقش ناموفق بود.",
                confirmButtonText: "متوجه شدم",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.push(`/dashboard/roles/${role?.id}`);
    };

    if (loading || forbidden || !role) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-elf-primary" />

                    <p className="text-sm text-muted-foreground">
                        {forbidden
                            ? "در حال انتقال..."
                            : "در حال دریافت اطلاعات نقش..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard/roles")}
                    className="transition hover:text-elf-primary"
                >
                    نقش‌ها
                </button>

                <span>/</span>

                <button
                    type="button"
                    onClick={() =>
                        router.push(`/dashboard/roles/${role.id}`)
                    }
                    className="transition hover:text-elf-primary"
                >
                    {role.displayName}
                </button>

                <span>/</span>

                <span className="font-medium text-foreground">
                    ویرایش
                </span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-elf-primary/10 text-elf-primary">
                        <ShieldCheck className="h-6 w-6" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            ویرایش نقش
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            اطلاعات پایه نقش {role.displayName} را
                            مدیریت کنید.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            role.isActive
                                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        }`}
                    >
                        {role.isActive ? "فعال" : "غیرفعال"}
                    </span>

                    <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                        نقش عادی
                    </span>
                </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Information Card */}
                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border px-5 py-4 md:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-elf-primary/10 text-elf-primary">
                                <FileText className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-foreground">
                                    اطلاعات پایه
                                </h2>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    مشخصات اصلی و توضیحات نقش
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 p-5 md:p-6">

                        {/* Display Name */}
                        <div className="space-y-2">
                            <label
                                htmlFor="displayName"
                                className="flex items-center gap-1 text-sm font-semibold text-foreground"
                            >
                                نام نمایشی
                                <span className="text-red-500">*</span>
                            </label>

                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(event) => {
                                    setDisplayName(event.target.value);

                                    if (errors.displayName) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            displayName: undefined,
                                        }));
                                    }
                                }}
                                maxLength={150}
                                placeholder="نام نمایشی نقش را وارد کنید"
                                className={`h-12 w-full rounded-xl border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-elf-primary focus:ring-4 focus:ring-elf-primary/10 ${
                                    errors.displayName
                                        ? "border-red-500"
                                        : "border-border hover:border-elf-primary/50"
                                }`}
                            />

                            {errors.displayName ? (
                                <p className="text-xs text-red-500">
                                    {errors.displayName}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    این نام در پنل مدیریت نمایش داده می‌شود.
                                </p>
                            )}
                        </div>

                        {/* Technical Name */}
                        <div className="space-y-2">
                            <label
                                htmlFor="name"
                                className="flex items-center gap-1 text-sm font-semibold text-foreground"
                            >
                                <Fingerprint className="h-4 w-4 text-elf-primary" />
                                نام فنی
                                <span className="text-red-500">*</span>
                            </label>

                            <input
                                id="name"
                                type="text"
                                dir="ltr"
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);

                                    if (errors.name) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            name: undefined,
                                        }));
                                    }
                                }}
                                maxLength={100}
                                placeholder="BranchManager"
                                className={`h-12 w-full rounded-xl border bg-background px-4 text-left text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-elf-primary focus:ring-4 focus:ring-elf-primary/10 ${
                                    errors.name
                                        ? "border-red-500"
                                        : "border-border hover:border-elf-primary/50"
                                }`}
                            />

                            {errors.name ? (
                                <p className="text-xs text-red-500">
                                    {errors.name}
                                </p>
                            ) : (
                                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
                                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />

                                    <p className="text-xs leading-6 text-amber-800 dark:text-amber-300">
                                        نام فنی در منطق برنامه و سیستم
                                        دسترسی استفاده می‌شود. تغییر آن
                                        ممکن است روی بخش‌های دیگر برنامه
                                        تأثیر بگذارد.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label
                                htmlFor="description"
                                className="flex items-center gap-1 text-sm font-semibold text-foreground"
                            >
                                <Type className="h-4 w-4 text-elf-primary" />
                                توضیحات
                                <span className="text-xs font-normal text-muted-foreground">
                                    (اختیاری)
                                </span>
                            </label>

                            <textarea
                                id="description"
                                value={description}
                                onChange={(event) => {
                                    setDescription(event.target.value);

                                    if (errors.description) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            description: undefined,
                                        }));
                                    }
                                }}
                                maxLength={1000}
                                rows={5}
                                placeholder="توضیحات و مسئولیت‌های این نقش را بنویسید..."
                                className={`w-full resize-y rounded-xl border bg-background px-4 py-3 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-elf-primary focus:ring-4 focus:ring-elf-primary/10 ${
                                    errors.description
                                        ? "border-red-500"
                                        : "border-border hover:border-elf-primary/50"
                                }`}
                            />

                            <div className="flex items-center justify-between">
                                {errors.description ? (
                                    <p className="text-xs text-red-500">
                                        {errors.description}
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        توضیح مختصری درباره کاربرد نقش
                                    </p>
                                )}

                                <span className="text-xs text-muted-foreground">
                                    {description.length} / 1000
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Role Status Card */}
                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-elf-primary/10 text-elf-primary">
                            <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="font-semibold text-foreground">
                                وضعیت و مشخصات نقش
                            </h2>

                            <p className="mt-1 text-xs text-muted-foreground">
                                این موارد در صفحه جزئیات مدیریت می‌شوند.
                            </p>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl bg-muted/50 p-3">
                                    <p className="text-xs text-muted-foreground">
                                        وضعیت
                                    </p>

                                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <CircleCheck
                                            className={`h-4 w-4 ${
                                                role.isActive
                                                    ? "text-green-500"
                                                    : "text-red-500"
                                            }`}
                                        />

                                        {role.isActive ? "فعال" : "غیرفعال"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-muted/50 p-3">
                                    <p className="text-xs text-muted-foreground">
                                        نوع نقش
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-foreground">
                                        عادی
                                    </p>
                                </div>

                                <div className="rounded-xl bg-muted/50 p-3">
                                    <p className="text-xs text-muted-foreground">
                                        کاربران منتسب
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-foreground">
                                        {role.uniqueUserCount ?? 0} کاربر
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                        انصراف
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-elf-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}

                        {saving
                            ? "در حال ذخیره..."
                            : "ذخیره تغییرات"}
                    </button>
                </div>
            </form>
        </div>
    );
}