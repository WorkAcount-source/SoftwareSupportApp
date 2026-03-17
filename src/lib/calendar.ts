import { startOfMonth, endOfMonth, getDay, subDays, addDays } from "date-fns";

/** Returns the start (Sunday) and end (Saturday) dates for a calendar grid. */
export function getCalendarRange(month: Date) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const startDate = subDays(start, getDay(start));
  const endDate = addDays(end, 6 - getDay(end));
  return { startDate, endDate };
}
