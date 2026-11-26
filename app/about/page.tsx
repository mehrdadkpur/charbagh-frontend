import Image from "next/image";
import Link from "next/link";
import RoutesHeader from "@/app/ui/components/RoutesHeader";

export const metadata = {
  title: "درباره آموزشگاه موسیقی چهارباغ",
  description: "با رویکرد آموزشی، مسیر یادگیری و فضای آموزش موسیقی در چهارباغ آشنا شوید.",
};

const values = [
  {
    title: "یادگیری متناسب با هنرجو",
    description: "مسیر یادگیری موسیقی برای هر هنرجو با توجه به سطح، علاقه و هدف او شکل می‌گیرد؛ از آشنایی اولیه با ساز تا تمرین منظم و پیشرفت مرحله‌به‌مرحله.",
  },
  {
    title: "آموزش اصولی و پیوسته",
    description: "شناخت مبانی موسیقی، تمرین هدفمند و دریافت بازخورد سازنده، بخش‌های مهم یک تجربه آموزشی مؤثر هستند.",
  },
  {
    title: "فضایی برای رشد و تجربه",
    description: "موسیقی با شنیدن، نواختن و به اشتراک گذاشتن تجربه‌ها زنده می‌شود. ما یادگیری را فرصتی برای پرورش خلاقیت و اعتمادبه‌نفس می‌دانیم.",
  },
];

export default function AboutPage() {
  return (
    <section className="bg-[#F6F4EE] text-gray-900 dark:bg-gray-900 dark:text-gray-50">
      <RoutesHeader pageTitle="درباره ما" boldText="آشنایی با" Highlight="آموزشگاه موسیقی چهارباغ" />

      <div className="container mx-auto space-y-16 px-4 py-12 md:py-16">
        <section className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <div className="relative min-h-[280px] overflow-hidden rounded-3xl md:min-h-[420px]">
            <Image src="/images/about/01.jpg" alt="فضای آموزش موسیقی" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="space-y-5">
            <p className="font-DanaMedium text-sm text-elf dark:text-mango">درباره چهارباغ</p>
            <h2 className="text-3xl font-MorabbaBold leading-relaxed md:text-5xl">موسیقی؛ مسیری برای یادگیری و بیان خلاقیت</h2>
            <p className="text-base leading-9 text-gray-700 dark:text-gray-300">
              در آموزش موسیقی، هر قدم اهمیت دارد؛ از انتخاب ساز مناسب و آشنایی با مبانی تا تمرین، تجربه و اجرای قطعات. در چهارباغ می‌توانید مسیر آموزشی مورد علاقه‌تان را بررسی کنید و با دوره‌ها و مدرسین آشنا شوید.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/courses" className="rounded-full bg-elf px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800">مشاهده دوره‌ها</Link>
              <Link href="/teachers" className="rounded-full border border-elf px-6 py-3 text-sm font-semibold text-elf transition hover:bg-elf/10 dark:border-mango dark:text-mango">آشنایی با مدرسین</Link>
            </div>
          </div>
        </section>

        <section className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <div className="order-2 space-y-5 md:order-1">
            <p className="font-DanaMedium text-sm text-elf dark:text-mango">رویکرد آموزشی</p>
            <h2 className="text-3xl font-MorabbaBold md:text-4xl">هر هنرجو، یک مسیر یادگیری</h2>
            <p className="text-base leading-9 text-gray-700 dark:text-gray-300">
              انتخاب ساز و دوره باید با علاقه، زمان در دسترس و هدف هنرجو هماهنگ باشد. آشنایی با محتوای دوره‌ها و گفت‌وگو با آموزشگاه کمک می‌کند تصمیم آگاهانه‌تری بگیرید.
            </p>
            <p className="text-base leading-9 text-gray-700 dark:text-gray-300">
              استمرار در تمرین و همراهی آموزشی، دو عامل مهم در پیشرفت هستند. به همین دلیل توصیه می‌کنیم پیش از شروع، سطح و انتظارات خود را مشخص کنید.
            </p>
          </div>
          <div className="relative order-1 min-h-[280px] overflow-hidden rounded-3xl md:order-2 md:min-h-[380px]">
            <Image src="/images/about/05.jpg" alt="تمرین و آموزش موسیقی" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {values.map((item, index) => (
            <article key={item.title} className="rounded-2xl border border-elf/10 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <span className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-mango/30 font-bold text-elf dark:text-mango">{index + 1}</span>
              <h3 className="mb-3 text-xl font-DanaDemiBold">{item.title}</h3>
              <p className="text-sm leading-8 text-gray-600 dark:text-gray-300">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="relative col-span-2 min-h-[240px] overflow-hidden rounded-3xl md:col-span-1"><Image src="/images/about/06.jpg" alt="لحظه‌ای از فضای موسیقی" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>
          <div className="relative min-h-[240px] overflow-hidden rounded-3xl"><Image src="/images/about/07.jpg" alt="تجربه یادگیری موسیقی" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" /></div>
          <div className="relative min-h-[240px] overflow-hidden rounded-3xl"><Image src="/images/about/08.jpg" alt="آموزش و تمرین ساز" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" /></div>
        </section>
      </div>
    </section>
  );
}
