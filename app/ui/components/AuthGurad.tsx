'use client';

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/config";
import { IUser } from "@/lib/types";

export default function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        toast.error("لطفا وارد حساب خود شوید");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/User/current`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (res.status === 401) {
          router.replace("/login");
          toast.error("احراز هویت موفقیت آمیز نبود، دوباره وارد شوید");
          return;
        }

        if (!res.ok) {
          throw new Error("خطا در دریافت اطلاعات کاربر");
        }

        const data = await res.json();
        const fetchedUser: IUser = data.user;
        setUser(fetchedUser);

        handleAccessControl(fetchedUser, pathname);

      } catch (err) {
        if ((err as any).name === "AbortError") return;
        console.error("Error fetching user:", err);
        router.replace("/login");
      }
    };

    fetchUserData();

    return () => controller.abort();
  }, [pathname]);

  const handleAccessControl = (user: IUser, path: string) => {
    const roles = user.roles || [];

    const isAdmin = roles.includes(0);
    const isTeacher = roles.includes(1);
    const isStudent = roles.includes(2);
    
    const protectedRoutes = ["/songs", "/dashboard", "/user"];

    if (!user) {
      if (protectedRoutes.some((route) => path.startsWith(route))) {
        router.replace("/login");
      }
      return;
    }

 
    if (!isAdmin) {
 
      if (isTeacher || isStudent) {
        if (path.startsWith("/dashboard")) {
          router.replace("/unaccess");
          toast.error("دسترسی غیرمجاز");
        }
      }
    }
  };

  return null;
}
