import {
  format,
  getISOWeek,
  getYear,
  startOfISOWeek,
  endOfISOWeek,
  addWeeks,
  subWeeks,
  isToday,
  isBefore,
  differenceInDays,
  parseISO,
  startOfDay,
} from 'date-fns'

export function getISOWeekYear(date: Date = new Date()) {
  return { week: getISOWeek(date), year: getYear(startOfISOWeek(date)) }
}

export function getWeekRange(week: number, year: number) {
  // Find the Monday of the given ISO week
  const jan4 = new Date(year, 0, 4) // Jan 4 is always in week 1
  const startOfW1 = startOfISOWeek(jan4)
  const start = addWeeks(startOfW1, week - 1)
  const end = endOfISOWeek(start)
  return { start, end }
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function formatShortDate(date: string | Date) {
  return formatDate(date, 'MMM d')
}

export function formatISODate(date: Date = new Date()) {
  return format(date, 'yyyy-MM-dd')
}

export function getDaysUntil(dateStr: string) {
  const target = startOfDay(parseISO(dateStr))
  const today = startOfDay(new Date())
  return differenceInDays(target, today)
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export { isToday, isBefore, parseISO, format, addWeeks, subWeeks, getISOWeek, startOfISOWeek, endOfISOWeek }
