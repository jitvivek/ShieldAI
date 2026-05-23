import { formatDistanceToNow, format } from 'date-fns';

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}
