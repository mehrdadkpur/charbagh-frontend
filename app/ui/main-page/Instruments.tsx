import Link from "next/link";
import { fetchInstruments } from "@/lib/requests";
import InstrumentCard from "@/app/ui/components/InstrumentCard";
import type { Instrument } from "@/lib/types";

export default async function Instruments() {
  const { instruments } = await fetchInstruments();
  const activeInstruments = (instruments as Instrument[]).filter((instrument) => instrument.isActive);

  return (
    <section>
      <div className="flex w-full flex-col justify-between bg-[#F0EEE6] py-3 dark:bg-[#25403c]">
        <div className="container mx-auto py-16">
          <div className="flex w-full flex-col items-center justify-between gap-y-10 lg:flex-row">
            <div className="flex flex-col items-center gap-y-5 text-center lg:w-1/3 lg:pb-6">
              <p className="text-xs font-DanaMedium text-elf md:text-lg">آشنایی با سازهای موسیقی</p>
              <h2 className="w-full font-MorabbaBold text-3xl leading-relaxed text-greenDark dark:text-gray-50 md:text-4xl lg:text-5xl">
                کدام <span className="rounded-2xl bg-mango px-2 text-elf">ساز</span> برای شروع من مناسب است؟
              </h2>
              <p className="px-2 text-sm leading-8 text-greenDark dark:text-gray-50 md:text-base">
                اگر هنوز ساز مورد علاقه‌تان را انتخاب نکرده‌اید، با سازهای مختلف آشنا شوید و ویژگی‌های هرکدام را بررسی کنید.
              </p>
              <Link href="/instruments" className="rounded-full bg-mango px-6 py-3 text-sm font-DanaMedium text-gray-900 transition hover:bg-white">مشاهده همه سازها</Link>
            </div>
            <div className="grid h-full w-full grid-cols-1 justify-items-center gap-5 md:grid-cols-2 xl:w-2/3 xl:grid-cols-3">
              {activeInstruments.slice(0, 6).map((instrument) => <InstrumentCard instrument={instrument} key={instrument.id} />)}
              {!activeInstruments.length && <p className="col-span-full py-10 text-center text-gray-500">ساز فعالی برای نمایش وجود ندارد.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
