"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type ChevronProps } from "react-day-picker"
import { id } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// Daftar Hari Libur Nasional Indonesia (Contoh Tahun 2026)
const holidays = [
  new Date(2026, 0, 1),   // 1 Jan: Tahun Baru Masehi
  new Date(2026, 1, 17),  // 17 Feb: Isra Mikraj Nabi Muhammad SAW
  new Date(2026, 2, 18),  // 18 Mar: Hari Suci Nyepi (Tahun Baru Saka)
  new Date(2026, 2, 20),  // 20 Mar: Hari Raya Idul Fitri 1447 H (Hari 1)
  new Date(2026, 2, 21),  // 21 Mar: Hari Raya Idul Fitri 1447 H (Hari 2)
  new Date(2026, 3, 3),   // 3 Apr: Wafat Yesus Kristus
  new Date(2026, 3, 5),   // 5 Apr: Hari Paskah
  new Date(2026, 4, 1),   // 1 Mei: Hari Buruh Internasional
  new Date(2026, 4, 14),  // 14 Mei: Kenaikan Yesus Kristus
  new Date(2026, 4, 27),  // 27 Mei: Hari Raya Waisak 2570 BE
  new Date(2026, 5, 1),   // 1 Jun: Hari Lahir Pancasila
  new Date(2026, 5, 27),  // 27 Jun: Tahun Baru Islam 1448 H (Estimasi)
  new Date(2026, 7, 17),  // 17 Agt: Hari Kemerdekaan RI
  new Date(2026, 8, 5),   // 5 Sep: Maulid Nabi Muhammad SAW (Estimasi)
  new Date(2026, 11, 25), // 25 Des: Hari Raya Natal
]

// Fungsi helper untuk mengecek apakah tanggal tertentu termasuk hari libur
const isHoliday = (date: Date) => {
  return holidays.some(
    (holiday) =>
      holiday.getFullYear() === date.getFullYear() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getDate() === date.getDate()
  )
}

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={id}
      weekStartsOn={0}
      showOutsideDays={showOutsideDays}
      modifiers={{ 
        sunday: { dayOfWeek: [0] },
        friday: { dayOfWeek: [5] },
        holiday: isHoliday 
      }}
      modifiersClassNames={{ 
        sunday: "text-red-500 font-semibold",
        friday: "text-green-600 font-semibold",
        holiday: "text-red-500 font-semibold"
      }}
      formatters={{
        formatWeekdayName: (date, options, dateLib) => {
          const formatted = dateLib ? dateLib.format(date, "eee") : date.toLocaleDateString("id-ID", { weekday: "short" })
          const clean = formatted.replace(".", "")
          return clean.charAt(0).toUpperCase() + clean.slice(1)
        }
      }}
      className={cn("p-4 bg-white rounded-xl shadow-sm border border-gray-100 relative pb-16", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4 w-full",
        month_caption: "flex justify-center pt-2 relative items-center",
        caption_label: "text-base font-bold text-gray-800 capitalize",
        nav: "absolute bottom-3 left-4 right-4 flex justify-between items-center w-[calc(100%-2rem)]",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-gray-100 rounded-full border-gray-200 transition-colors"
        ),
        button_previous: "",
        button_next: "",
        month_grid: "w-full border-collapse space-y-2 block text-gray-700 [&>thead]:block [&>thead]:w-full [&>tbody]:block [&>tbody]:w-full",
        weekdays: "grid grid-cols-7 w-full mb-2 block",
        weekday: "text-gray-500 font-semibold text-[0.85rem] flex justify-center items-center h-8 w-full block",
        weeks: "block w-full",
        week: "grid grid-cols-7 w-full gap-y-1 block",
        day: "h-10 w-full text-center text-sm p-0 flex justify-center items-center relative block focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-medium text-inherit rounded-full border border-transparent hover:border-blue-600 hover:bg-blue-50/30 transition-all aria-selected:opacity-100"
        ),
        selected:
          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white font-bold rounded-full shadow-md [&_button]:text-white [&_button]:hover:bg-transparent [&_button]:hover:border-transparent",
        today: "bg-blue-50 text-blue-700",
        outside: "day-outside text-gray-300 opacity-50 aria-selected:bg-blue-50 aria-selected:text-blue-500 aria-selected:opacity-70",
        disabled: "text-gray-300 opacity-50",
        range_middle: "aria-selected:bg-blue-50 aria-selected:text-blue-800",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...iconProps }: ChevronProps) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-5 w-5 text-gray-600", className)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("h-5 w-5 text-gray-600", className)} {...iconProps} />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
