import RoutesHeader from "@/app/ui/components/RoutesHeader";
import Link from "next/link";

export const metadata = {
  title: "دیدگاه هنرجویان | آموزشگاه موسیقی چهارباغ",
  description: "دیدگاه‌ها و تجربه‌های هنرجویان آموزشگاه موسیقی چهارباغ.",
};

export default function CommentsPage() {
  return (
    <section className="min-h-[55vh] bg-[#F6F4EE] dark:bg-gray-900">
      <RoutesHeader pageTitle="دیدگاه‌ها" boldText="تجربه یادگیری" Highlight="در چهارباغ" />
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-800 md:p-12">
          <h1 className="text-2xl font-MorabbaBold md:text-3xl">دیدگاه هنرجویان</h1>
          <p className="mt-4 text-sm leading-8 text-gray-600 dark:text-gray-300">
            این بخش به‌زودی با تجربه‌ها و دیدگاه‌های منتشرشده هنرجویان تکمیل می‌شود.
          </p>
          <Link href="/courses" className="mt-7 inline-flex rounded-full bg-elf px-6 py-3 text-sm font-semibold text-white hover:bg-green-800">
            مشاهده منابع آموزشی
          </Link>
        </div>
      </div>
    </section>
  );
}
