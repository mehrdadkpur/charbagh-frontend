import Link from "next/link";
import RoutesHeader from "../ui/components/RoutesHeader";
import Image from "next/image";
import { fetchGalleries } from "@/lib/requests";

export const metadata = {
  title: "آموزشگاه چهارباغ | گالری",
  description: "گالری تصاویر و ویدئوهای آموزشگاه موسیقی چهارباغ.",
};

export default async function GalleryPage() {
  const { galleries } = await fetchGalleries();

  return (
    <section className="bg-[#F6F4EE] dark:bg-gray-900">
      <RoutesHeader pageTitle="گالری" boldText="گالـــــری" Highlight="تصاویر و ویدئوها" />
      <div className="container mx-auto px-4 py-8">
        {!galleries?.length ? (
          <p className="py-16 text-center">در حال حاضر گالری منتشرشده‌ای وجود ندارد.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((gallery) => (
              <Link key={gallery.id} href={`/galleries/${gallery.id}`} className="rounded-xl bg-white p-4 shadow transition hover:shadow-xl dark:bg-gray-800">
                <div className="relative mb-4 h-48 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                  {gallery.coverImageUrl ? <Image fill src={gallery.coverImageUrl} alt={gallery.title} unoptimized={gallery.coverImageUrl.startsWith("http")} className="object-cover" /> : <div className="flex h-full items-center justify-center text-gray-400">بدون تصویر کاور</div>}
                </div>
                <h2 className="font-bold">{gallery.title}</h2>
                {gallery.description && <p className="mt-2 line-clamp-2 text-sm text-gray-500">{gallery.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Image width={1920} height={134} src="/images/shapes/footer-1.png" alt="footer" className="w-full" />
    </section>
  );
}
