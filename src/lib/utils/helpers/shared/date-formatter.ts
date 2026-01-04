import { format } from 'date-fns';

/**
 * Format a date to the standard format: dd/MM/yy HH:mm
 * @param date {Date}
 * @returns 
 */
export function standardDateFormat(date: Date): string {
  return format(date, 'dd-MMM-yy HH:mm').toUpperCase();
}

export function dateToDateInputValue(date: Date): string {
  return format(date, 'yyyy-MM-dd\'T\'HH:mm');
}