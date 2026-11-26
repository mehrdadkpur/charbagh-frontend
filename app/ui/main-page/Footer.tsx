import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { href: "/courses", label: "دوره‌های آموزشی" },
  { href: "/teachers", label: "مدرسین" },
  { href: "/instruments", label: "سازشناسی" },
  { href: "/galleries", label: "گالری تصاویر و ویدئوها" },
  { href: "/blogs", label: "بلاگ و رویدادها" },
  { href: "/about", label: "درباره ما" },
  { href: "/#contact", label: "درخواست مشاوره" },
];

export default function Footer() {
  return (
    <footer className="bg-[#25403c] pt-10 text-[#F6F4EE]">
      <div className="container mx-auto grid gap-10 px-4 pb-10 md:grid-cols-3">
        <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-right">
          <Link href="/" aria-label="صفحه اصلی آموزشگاه موسیقی چهارباغ">
            <Image width={76} height={76} src="/images/logo.png" alt="لوگوی آموزشگاه موسیقی چهارباغ" />
          </Link>
          <h2 className="text-2xl font-MorabbaBold">آموزشگاه موسیقی چهارباغ</h2>
          <p className="max-w-sm text-sm leading-8 text-[#f6f4eeb3]">
            برای آشنایی با دوره‌ها، سازها و مدرسین، بخش‌های مختلف سایت را ببینید یا درخواست مشاوره ثبت کنید.
          </p>
        </div>

        <nav aria-label="پیوندهای سریع">
          <h3 className="mb-5 text-lg font-DanaDemiBold text-mango">دسترسی سریع</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-[#f6f4eeb3]">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-mango focus-visible:outline-none focus-visible:underline">{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="not-italic">
          <h3 className="mb-5 text-lg font-DanaDemiBold text-mango">اطلاعات تماس</h3>
          <dl className="space-y-4 text-sm leading-7 text-[#f6f4eeb3]">
            <div>
              <dt className="text-[#f6f4ee80]">نشانی</dt>
              <dd>اصفهان، مبارکه، بلوار شریعتی، نبش کوچه پست</dd>
            </div>
            <div>
              <dt className="text-[#f6f4ee80]">تلفن</dt>
              <dd><a dir="ltr" href="tel:0315342100" className="hover:text-mango">0315342100</a></dd>
            </div>
            <div>
              <dt className="text-[#f6f4ee80]">ایمیل</dt>
              <dd><a href="mailto:mehrdad1990.mkp@gmail.com" className="break-all hover:text-mango">mehrdad1990.mkp@gmail.com</a></dd>
            </div>
          </dl>
        </address>
      </div>

      <div className="bg-[#203734] px-4 py-5 text-center text-xs leading-7 text-[#f6f4ee80]">
        تمام حقوق مادی و معنوی این سایت متعلق به <span className="text-mango">آموزشگاه موسیقی چهارباغ</span> است.
        <p className="mt-1">طراحی و توسعه توسط <a className="hover:text-mango" href="https://www.instagram.com/mkpur69" target="_blank" rel="noreferrer">مهرداد کهن‌پور</a></p>
      </div>
    </footer>
  );
}
