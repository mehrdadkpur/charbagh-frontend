"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCurrentUser } from "@/lib/requests";
import { ApiError } from "@/helper/ApiError";

interface Props {
  children: React.ReactNode;
}

export default function DashboardAuthGuard({ children }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function checkAuthentication() {
      setLoading(true);
      setError(null);

      try {
        const user = await fetchCurrentUser();

        if (cancelled) return;

        localStorage.setItem("user", JSON.stringify(user));
        setLoading(false);
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          router.replace("/login");
          return;
        }

        if (err instanceof ApiError && err.status === 403) {
          setError("شما اجازه دسترسی به این بخش را ندارید.");
        } else {
          setError("بررسی وضعیت ورود ناموفق بود.");
        }

        setLoading(false);
      }
    }

    void checkAuthentication();

    return () => {
      cancelled = true;
    };
  }, [router, attempt]);

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"
      >
        <p className="text-gray-600 dark:text-gray-300">
          در حال بررسی وضعیت ورود...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900"
      >
        <p className="text-red-600 dark:text-red-400">{error}</p>

        <button
          onClick={() => setAttempt((value) => value + 1)}
          className="rounded-lg bg-emerald-600 px-5 py-2 text-white hover:bg-emerald-700"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return <>{children}</>;
}