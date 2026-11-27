import Image from "next/image";
import Navigation from "./Navigation";

const Header = () => {
  return (
    <section className="w-full bg-gray-50 dark:bg-gray-900">
      <div className="w-full bg-elf dark:bg-[#152422]">
        <div className="flex flex-col">
          <Navigation />
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-2 px-4 py-5 sm:gap-5 sm:px-6 md:flex-row md:gap-8 md:px-8 md:py-8 lg:gap-12">
            <div className="flex w-full items-center justify-center py-3 text-center md:w-1/2 md:py-8">
              <h1 className="w-full max-w-xl text-2xl font-MorabbaBold leading-relaxed text-white sm:text-3xl md:text-4xl lg:text-5xl">
                الهـام بخشیـــدن به زندگـی با{" "}
                <span className="mt-2 inline-block rounded-xl bg-mango px-3 py-1.5 text-elf dark:bg-mango-900 dark:text-greenDark">
                  موسیقی
                </span>
              </h1>
            </div>

            <div className="flex w-full justify-center md:w-1/2 md:justify-end">
              <Image
                src="/images/header-vector.svg"
                alt="تصویرسازی سازهای موسیقی و نت‌ها"
                width={520}
                height={440}
                priority
                className="block h-auto w-full max-w-[260px] object-contain sm:max-w-[310px] md:max-w-[340px] lg:max-w-[370px]"
              />
              <Image
                src="/images/header-vector-dark.svg"
                alt="تصویرسازی سازهای موسیقی و نت‌ها"
                width={520}
                height={440}
                priority
                className="hidden h-auto w-full max-w-[260px] object-contain dark:block sm:max-w-[310px] md:max-w-[340px] lg:max-w-[370px]"
              />
            </div>
          </div>
          <div className="w-full">
            <Image
              src="/images/shapes/header.png"
              alt=""
              aria-hidden="true"
              width={1920}
              height={169}
              className="block w-full dark:hidden"
              priority
            />
            <Image
              src="/images/shapes/header-dark.png"
              alt=""
              aria-hidden="true"
              width={1920}
              height={169}
              className="hidden w-full dark:block"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Header;
