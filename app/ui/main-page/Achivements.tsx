import Image from "next/image";

const highlights = [
  {
    title: "مسیر یادگیری روشن",
    description: "از آشنایی با ساز و مبانی موسیقی تا تمرین منظم و پیشرفت مرحله‌به‌مرحله.",
    icon: "♫",
  },
  {
    title: "انتخاب آگاهانه ساز",
    description: "با سازهای مختلف آشنا شوید و با توجه به علاقه و هدف خود مسیر مناسب‌تان را پیدا کنید.",
    icon: "♪",
  },
  {
    title: "همراهی آموزشی",
    description: "با بررسی دوره‌ها و آشنایی با مدرسین، برای شروع یا ادامه یادگیری تصمیم دقیق‌تری بگیرید.",
    icon: "♬",
  },
];

export default function Achievements() {
  return (
    <section className="w-full bg-[#F6F4EE] dark:bg-[#25403c]">
      <div className="container mx-auto px-4 py-14">
        <p className="pb-3 text-center text-sm font-DanaMedium text-elf dark:text-mango">تجربه یادگیری در چهارباغ</p>
        <h2 className="mb-10 text-center text-3xl font-MorabbaBold text-gray-900 dark:text-gray-50 md:text-5xl">
          موسیقی را با علاقه و برنامه دنبال کنید
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-2xl border border-elf/10 bg-white p-7 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <span aria-hidden="true" className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-mango/25 text-3xl text-elf dark:text-mango">{item.icon}</span>
              <h3 className="mb-3 text-xl font-DanaDemiBold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-sm leading-8 text-gray-600 dark:text-gray-300">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
      <Image src="/images/shapes/vector.png" alt="" width={1920} height={169} className="block w-full dark:hidden" />
      <Image src="/images/shapes/vector-dark-1.png" alt="" width={1920} height={169} className="hidden w-full dark:block" />
    </section>
  );
}
