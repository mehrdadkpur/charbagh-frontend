"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import jalaali from "jalaali-js";

interface ShamsiProps {
  onChange?: (date: string) => void;
  initialDate?: Date | string | null;
}

interface SelectedDate {
  year: string;
  month: string;
  day: string;
}

const START_YEAR = 1300;

const months = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const EMPTY_DATE: SelectedDate = {
  year: "",
  month: "",
  day: "",
};

function getCurrentJalaliYear(): number {
  return jalaali.toJalaali(new Date()).jy;
}

function getJalaliDate(
  value?: Date | string | null
): SelectedDate {
  if (!value) return { ...EMPTY_DATE };

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);

      date = new Date(year, month - 1, day);

      // جلوگیری از پذیرفتن تاریخ‌های نامعتبر مثل 2026-02-31
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        return { ...EMPTY_DATE };
      }
    } else {
      date = new Date(value);
    }
  }

  if (Number.isNaN(date.getTime())) {
    return { ...EMPTY_DATE };
  }

  const { jy, jm, jd } = jalaali.toJalaali(date);

  return {
    year: String(jy),
    month: String(jm),
    day: String(jd),
  };
}

function getDaysInMonth(year: string, month: string): number {
  if (!year || !month) return 31;

  const jalaliYear = Number(year);
  const jalaliMonth = Number(month);

  if (
    !Number.isInteger(jalaliYear) ||
    !Number.isInteger(jalaliMonth) ||
    jalaliMonth < 1 ||
    jalaliMonth > 12
  ) {
    return 31;
  }

  return jalaali.jalaaliMonthLength(jalaliYear, jalaliMonth);
}

const ShamsiDatePicker = ({
  onChange,
  initialDate,
}: ShamsiProps) => {
  const [selectedDate, setSelectedDate] = useState<SelectedDate>(
    () => getJalaliDate(initialDate)
  );

  // مقدار اولیه یا مقدار دریافتی از فرم اصلی را همگام می‌کند.
  // چون initialDate رشته است، تا وقتی مقدارش تغییر نکند
  // این effect باعث بازنشانی انتخاب کاربر نمی‌شود.
  useEffect(() => {
    setSelectedDate(getJalaliDate(initialDate));
  }, [initialDate]);

  const currentYear = getCurrentJalaliYear();

  const yearSet = new Set<number>();

  for (let year = currentYear; year >= START_YEAR; year--) {
    yearSet.add(year);
  }

  const selectedYear = Number(selectedDate.year);

  // اگر تاریخ قبلی خارج از محدوده معمول باشد،
  // همان سال را هم در گزینه‌ها قرار می‌دهیم.
  if (
    selectedDate.year &&
    Number.isInteger(selectedYear) &&
    selectedYear > 0
  ) {
    yearSet.add(selectedYear);
  }

  const years = Array.from(yearSet).sort((a, b) => b - a);

  const days = Array.from(
    {
      length: getDaysInMonth(
        selectedDate.year,
        selectedDate.month
      ),
    },
    (_, index) => index + 1
  );

  const handleDateChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    const updatedDate: SelectedDate = {
      ...selectedDate,
      [name]: value,
    };

    // اگر ماه یا سال تغییر کند و روز انتخاب‌شده در آن ماه وجود نداشته باشد،
    // روز به آخرین روز معتبر همان ماه تغییر می‌کند.
    if (
      updatedDate.year &&
      updatedDate.month &&
      updatedDate.day
    ) {
      const maxDay = getDaysInMonth(
        updatedDate.year,
        updatedDate.month
      );

      if (Number(updatedDate.day) > maxDay) {
        updatedDate.day = String(maxDay);
      }
    }

    setSelectedDate(updatedDate);

    // تاریخ ناقص یعنی تاریخ تولد پاک شده است.
    // حتماً مقدار خالی را به فرم اصلی منتقل می‌کنیم.
    if (
      !updatedDate.year ||
      !updatedDate.month ||
      !updatedDate.day
    ) {
      onChange?.("");
      return;
    }

    const jy = Number(updatedDate.year);
    const jm = Number(updatedDate.month);
    const jd = Number(updatedDate.day);

    if (!jalaali.isValidJalaaliDate(jy, jm, jd)) {
      onChange?.("");
      return;
    }

    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);

    const gregorianDate = [
      String(gy).padStart(4, "0"),
      String(gm).padStart(2, "0"),
      String(gd).padStart(2, "0"),
    ].join("-");

    onChange?.(gregorianDate);
  };

  const selectClassName =
    "h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

  return (
    <div className="grid w-full grid-cols-3 gap-2">
      <select
        name="day"
        aria-label="روز تولد"
        className={selectClassName}
        onChange={handleDateChange}
        value={selectedDate.day}
      >
        <option value="">روز</option>

        {days.map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>

      <select
        name="month"
        aria-label="ماه تولد"
        className={selectClassName}
        onChange={handleDateChange}
        value={selectedDate.month}
      >
        <option value="">ماه</option>

        {months.map((month, index) => (
          <option key={index + 1} value={index + 1}>
            {month}
          </option>
        ))}
      </select>

      <select
        name="year"
        aria-label="سال تولد"
        className={selectClassName}
        onChange={handleDateChange}
        value={selectedDate.year}
      >
        <option value="">سال</option>

        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ShamsiDatePicker;