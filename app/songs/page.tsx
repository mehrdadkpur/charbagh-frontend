import RoutesHeader from "@/app/ui/components/RoutesHeader";
import Link from "next/link";
import { fetchInstruments } from "@/lib/requests";
import Image from "next/image";
import { Instrument } from "@/lib/types";
import AuthGuard from "@/app/ui/components/AuthGurad";
import { API_BASE_URL } from "@/lib/config";

export const metadata = {
  title: "آموزشگاه چهارباغ | صفحه موسیقی",
  description: "این صفحه گالری عکس آموزشگاه موسیقی چهارباغ است.",
};

function InstrumentCard({ instrument }: { instrument: Instrument }) {
  return (
    <div className="w-full h-52 rounded-3xl border shadow-sm hover:shadow-xl transition">
      <Link
        href={`/songs/${instrument.id}`}
        className="w-full h-full flex justify-center items-center text-greenDark rounded-3xl dark:hover:bg-gray-800"
      >
        <div className="flex items-center gap-x-5 text-lg font-Dana">
          <div className="w-32 h-32 flex items-center justify-center">
            <Image
              src={`${API_BASE_URL}${instrument.instrument_img}`}
              alt={instrument.instrument_name}
              width={128}
              height={128}
              className="w-32 h-40 object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div>
            <h2 className="font-DanaDemiBold dark:text-gray-50">
              {instrument.instrument_name}
            </h2>
            <h5 className="text-greenDark/70 font-Dana text-sm dark:text-gray-500">
              بی کلام
            </h5>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default async function SongsCategories() {
  const { instruments } = await fetchInstruments();

  return (
    <div className="w-full bg-[#F6F4EE] dark:bg-gray-900">
      <AuthGuard />
      <RoutesHeader
        pageTitle="مجله موسیقی"
        boldText="پــخش و دانلــود"
        Highlight="موسیقــــی"
      />

      <section className="container mx-auto px-4">
        <header className="pb-10 text-center">
          <h2 className="text-3xl font-DanaDemiBold text-greenDark dark:text-gray-50">
            ساز مورد نظرتان را انتخاب کنید
          </h2>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {instruments?.map((instrument: Instrument) => (
            <InstrumentCard key={instrument.id} instrument={instrument} />
          ))}
        </div>
      </section>

      <footer className="mt-10">
        <Image
          width={1920}
          height={134}
          src="/images/shapes/footer-1.png"
          alt="footer"
          className="w-full"
        />
      </footer>
    </div>
  );
}
