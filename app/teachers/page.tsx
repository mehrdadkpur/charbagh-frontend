import Image from "next/image";
import RoutesHeader from "@/app/ui/components/RoutesHeader";
import { fetchTeachers } from "@/lib/requests";
import TeacherCard from "@/app/ui/components/TeacherCard";
import type { PublicTeacher } from "@/lib/contentTypes";

export const metadata = {
  title: "مدرسین | آموزشگاه موسیقی چهارباغ",
  description: "با مدرسین فعال آموزشگاه موسیقی چهارباغ آشنا شوید.",
};

export default async function TeachersPage() {
  const teachers = (await fetchTeachers()) as PublicTeacher[];

  return (
    <section className="w-full bg-[#F6F4EE] dark:bg-gray-900">
      <RoutesHeader pageTitle="مدرسین" boldText="آشنایی با مدرسین" Highlight="آموزشگاه چهارباغ" />
      <div className="container mx-auto px-4 pb-16">
        <div className="mb-12 grid items-center gap-8 md:grid-cols-2">
          <div className="relative min-h-[240px] overflow-hidden rounded-3xl md:min-h-[320px]">
            <Image src="/images/teachers/01.jpg" alt="فضای آموزش موسیقی" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-MorabbaBold leading-relaxed text-gray-900 dark:text-white md:text-4xl">مدرس مناسب، همراه مسیر یادگیری شما</h1>
            <p className="mt-4 text-base leading-9 text-gray-600 dark:text-gray-300">
              در این بخش می‌توانید مدرسین فعال آموزشگاه را ببینید و با سوابق و معرفی‌نامه هر مدرس آشنا شوید. برای انتخاب کلاس، علاقه و سطح فعلی خود را در نظر بگیرید.
            </p>
          </div>
        </div>
        <h2 className="mb-8 text-center text-2xl font-DanaDemiBold text-gray-900 dark:text-white md:text-3xl">مدرسین آموزشگاه</h2>
        <TeacherCard teachers={teachers} />
      </div>
      <Image width={1920} height={134} src="/images/shapes/footer-1.png" alt="" className="w-full" />
    </section>
  );
}
