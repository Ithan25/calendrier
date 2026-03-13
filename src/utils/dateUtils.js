import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay,
  addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  getHours, getMinutes, setHours, setMinutes,
  isToday, isBefore, isAfter, parseISO,
  startOfDay, endOfDay, differenceInMinutes
} from 'date-fns';
import { fr } from 'date-fns/locale';

export {
  format, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  isBefore, isAfter, parseISO, startOfDay, endOfDay,
  getHours, getMinutes, setHours, setMinutes,
  differenceInMinutes
};

export const frLocale = fr;

export function getMonthDays(date) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getWeekDays(date) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function formatDate(date, formatStr) {
  return format(date, formatStr, { locale: fr });
}

export function formatTime(date) {
  return format(date, 'HH:mm');
}

export function formatDateRange(start, end, allDay) {
  if (allDay) {
    if (isSameDay(start, end)) {
      return formatDate(start, 'EEEE d MMMM yyyy');
    }
    return `${formatDate(start, 'd MMM')} — ${formatDate(end, 'd MMM yyyy')}`;
  }
  if (isSameDay(start, end)) {
    return `${formatDate(start, 'EEEE d MMMM')} · ${formatTime(start)} — ${formatTime(end)}`;
  }
  return `${formatDate(start, 'd MMM HH:mm')} — ${formatDate(end, 'd MMM HH:mm')}`;
}

export function getEventTopOffset(date) {
  const hours = getHours(date);
  const minutes = getMinutes(date);
  return (hours * 60 + minutes);
}

export function getEventHeight(start, end) {
  const mins = differenceInMinutes(end, start);
  return Math.max(mins, 20);
}

export function toFirestoreDate(date) {
  return date instanceof Date ? date : new Date(date);
}

export function generateTimeSlots(startHour = 0, endHour = 24) {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push({ hour: h, label: `${String(h).padStart(2, '0')}:00` });
  }
  return slots;
}
