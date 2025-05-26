import { format } from 'date-fns';

export function formatDateWithTime(date: Date | string): string {
    const d = new Date(date);
    return format(d, 'dd/MM/yyyy HH:mm');
}