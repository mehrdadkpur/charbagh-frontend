import Image from "next/image";
import Link from "next/link";
import { Instrument } from "@/lib/types";
import { API_BASE_URL } from "@/lib/config";

function resolveImage(url: string | null | undefined) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function InstrumentCard({ instrument }: { instrument: Instrument }) {
  const imageUrl = resolveImage(instrument.imageUrl);

  return (
    <Link
      href={`/instruments/${instrument.id}`}
      className="group flex h-[200px] w-full flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/5 p-4 backdrop-blur-sm transition duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/5 dark:hover:bg-gray-800"
    >
      <div className="flex w-full items-center justify-between gap-4 p-2">
        <h2 className="text-xl font-MorabbaBold text-gray-800 dark:text-white sm:text-2xl">{instrument.name}</h2>
        {imageUrl && (
          <div className="flex size-32 shrink-0 items-center justify-center">
            <Image
              src={imageUrl}
              alt={`ساز ${instrument.name}`}
              width={128}
              height={128}
              unoptimized={imageUrl.startsWith("http")}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        )}
      </div>
      {instrument.englishName && <p dir="ltr" className="text-xs text-gray-500 dark:text-gray-400">{instrument.englishName}</p>}
    </Link>
  );
}
