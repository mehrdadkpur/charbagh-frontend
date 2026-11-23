"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { apiFetch, ApiError } from "@/lib/apiFetch";
import { validateForm } from "@/lib/ValidateForm";

import Loading from "@/app/loading";
import UserForm from "@/app/ui/components/UserForm";

import type {
    UserFormValues,
    INationalityOption,
} from "@/app/ui/components/UserForm";

interface CreateUserResponse {
    id: string;
    firstName: string;
    lastName: string;
    mobile: string;
    nationalityId: string;
    nationalIdentificationNumber: string;
    fullName: string;
}

const initialState: UserFormValues = {
    firstName: "",
    lastName: "",
    mobile: "",
    nationalIdentificationNumber: "",
    email: "",
    birthDate: "",
    gender: 0,
    address: "",
    bio: "",
    nationalityId: "",
};

const AddUser = () => {
    const router = useRouter();

    const [fields, setFields] =
        useState<UserFormValues>(initialState);

    const [nationalities, setNationalities] =
        useState<INationalityOption[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingNationalities, setLoadingNationalities] =
        useState(true);

    const [nationalitiesError, setNationalitiesError] =
        useState<string | null>(null);

    // دریافت فهرست ملیت‌ها
    useEffect(() => {
        let isMounted = true;

        const loadNationalities = async () => {
            try {
                setLoadingNationalities(true);
                setNationalitiesError(null);

                const result = await apiFetch<INationalityOption[]>(
                    "/api/nationalities"
                );

                if (isMounted) {
                    setNationalities(result);
                }
            } catch (error) {
                console.error("Error loading nationalities:", error);

                if (isMounted) {
                    setNationalitiesError(
                        "دریافت فهرست ملیت‌ها با خطا مواجه شد."
                    );
                    toast.error(
                        "دریافت فهرست ملیت‌ها با خطا مواجه شد."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoadingNationalities(false);
                }
            }
        };

        loadNationalities();

        return () => {
            isMounted = false;
        };
    }, []);

    // تغییر اطلاعات فرم
    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        setFields((prev) => ({
            ...prev,
            [name]: name === "gender" ? Number(value) : value,
        }));
    };

    // تغییر تاریخ تولد
    const handleBirthDateChange = (gregorianDate: string) => {
        setFields((prev) => ({
            ...prev,
            birthDate: gregorianDate,
        }));
    };

    // ثبت کاربر
    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (loading) return;

        // اعتبارسنجی شماره ملی، موبایل و ایمیل
        if (
            !validateForm(
                fields.nationalIdentificationNumber,
                fields.mobile,
                fields.email
            )
        ) {
            return;
        }

        // بررسی اطلاعات ضروری
        if (!fields.firstName.trim()) {
            toast.error("نام را وارد کنید.");
            return;
        }

        if (!fields.lastName.trim()) {
            toast.error("نام خانوادگی را وارد کنید.");
            return;
        }

        if (!fields.nationalityId) {
            toast.error("ملیت را انتخاب کنید.");
            return;
        }

        if (
            !nationalities.some(
                (item) => item.id === fields.nationalityId
            )
        ) {
            toast.error("ملیت انتخاب‌شده معتبر نیست.");
            return;
        }

        const payload = {
            firstName: fields.firstName.trim(),
            lastName: fields.lastName.trim(),
            mobile: fields.mobile.trim(),
            email: fields.email.trim() || null,
            nationalityId: fields.nationalityId,
            nationalIdentificationNumber:
                fields.nationalIdentificationNumber.trim(),
            gender: fields.gender,
            birthDate: fields.birthDate || null,
            address: fields.address.trim() || null,
            bio: fields.bio.trim() || null,
        };

        setLoading(true);

        try {
            const result = await apiFetch<CreateUserResponse>(
                "/api/users",
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );

            toast.success("کاربر جدید با موفقیت ایجاد شد.");

            router.push(`/dashboard/users/${result.id}`);
            router.refresh();
        } catch (error) {
            console.error("Error creating user:", error);

            if (error instanceof ApiError) {
                if (error.status === 409) {
                    toast.error(
                        "کاربری با این شماره موبایل یا کد ملی قبلاً ثبت شده است."
                    );
                    return;
                }

                if (error.status === 400) {
                    toast.error(
                        error.message ||
                            "اطلاعات ارسال‌شده معتبر نیست."
                    );
                    return;
                }

                toast.error(
                    error.message || "ایجاد کاربر با خطا مواجه شد."
                );
                return;
            }

            toast.error("ارتباط با سرور برقرار نشد.");
        } finally {
            setLoading(false);
        }
    };

    if (loadingNationalities && nationalities.length === 0) {
        return <Loading />;
    }

    if (nationalitiesError && nationalities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
                <p className="text-red-600">
                    {nationalitiesError}
                </p>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                    تلاش مجدد
                </button>
            </div>
        );
    }

    return (
        <UserForm
            fields={fields}
            nationalities={nationalities}
            loading={loading}
            handleChange={handleChange}
            handleBirthDateChange={handleBirthDateChange}
            handleSubmit={handleSubmit}
        />
    );
};

export default AddUser;