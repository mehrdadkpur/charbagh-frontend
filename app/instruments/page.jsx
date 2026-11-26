import RoutesHeader from "@/app/ui/components/RoutesHeader";
import { fetchInstruments } from "@/lib/requests";
import InstrumentCard from "../ui/components/InstrumentCard";
import Image from "next/image";
import type { Instrument } from "@/lib/types";

export const metadata = {
  title: "سازشناسی | آموزشگاه موسیقی چهارباغ",
  description: "با سازهای موسیقی و ویژگی‌های آن‌ها آشنا شوید.",
};

export default async function InstrumentsPage() {
  const { instruments } = await fetchInstruments();
  const activeInstruments = (instruments as Instrument[]).filter((instrument) => instrument.isActive);

  return (
    <section className="relative w-full bg-[#F6F4EE] dark:bg-gray-900">
      <RoutesHeader pageTitle="سازشناسی" boldText="آشنایی با سازهای" Highlight="موسیقی" />
      <div className="container mx-auto px-4">
        {activeInstruments.length ? (
          <div className="mb-20 grid w-full grid-cols-1 justify-items-center gap-x-5 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {activeInstruments.map((instrument) => <InstrumentCard instrument={instrument} key={instrument.id} />)}
          </div>
        ) : (
          <p className="my-16 rounded-2xl bg-white p-10 text-center text-gray-500 dark:bg-gray-800">در حال حاضر سازی برای نمایش وجود ندارد.</p>
        )}
      </div>
      <Image width={1920} height={134} src="/images/shapes/footer-1.png" alt="" className="w-full" />
    </section>
  );
}
