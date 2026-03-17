"use client";

import { useMemo } from "react";
import { format, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { DailyAvailability } from "@/types";
import { getCalendarRange } from "@/lib/calendar";

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  availabilities: DailyAvailability[];
}

export default function CalendarGrid({
  currentDate,
  selectedDate,
  onSelectDate,
  availabilities,
}: CalendarGridProps) {
  const daysInMonth = useMemo(() => {
    const { startDate, endDate } = getCalendarRange(currentDate);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const availabilityMap = useMemo(() => {
    const map = new Map<string, DailyAvailability[]>();
    availabilities.forEach((a) => {
      if (!map.has(a.date)) {
        map.set(a.date, []);
      }
      map.get(a.date)!.push(a);
    });
    return map;
  }, [availabilities]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[var(--card-border)]">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-[var(--muted)]">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7">
        {daysInMonth.map((day, idx) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayAvailabilities = availabilityMap.get(dateStr) || [];
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`
                min-h-[80px] p-1 sm:p-2 border-b border-r border-[var(--card-border)] cursor-pointer transition-colors
                ${idx % 7 === 6 ? "border-r-0" : ""}
                ${!isCurrentMonth ? "opacity-50 bg-[var(--background)]/50" : "hover:bg-[var(--background)]"}
                ${isSelected ? "bg-[var(--primary)]/10" : ""}
              `}
            >
              <div className={`
                text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1
                ${isSelected ? "bg-[var(--primary)] text-white" : "text-[var(--foreground)]"}
              `}>
                {format(day, "d")}
              </div>
              
              <div className="flex flex-col gap-1 mt-1">
                {dayAvailabilities.slice(0, 2).map((avail) => (
                  <div 
                    key={avail.id} 
                    className="text-[10px] sm:text-xs truncate bg-[var(--card-border)] px-1.5 py-0.5 rounded text-[var(--foreground)]"
                    title={avail.team_member?.name}
                  >
                    {avail.team_member?.name?.split(' ')[0] || "Unknown"}
                  </div>
                ))}
                {dayAvailabilities.length > 2 && (
                  <div className="text-[10px] text-[var(--muted)] text-center">
                    +{dayAvailabilities.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
