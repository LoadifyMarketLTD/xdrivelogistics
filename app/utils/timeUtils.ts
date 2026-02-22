export function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    times.push(`${hourStr}:00`);
    times.push(`${hourStr}:30`);
  }
  return times;
}

export function formatTimeDisplay(time: string): string {
  if (!time) return '';
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time.substring(0, 5);
  return time;
}

export function isValidTimeIncrement(time: string): boolean {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return false;
  const [, minutes] = time.split(':');
  return minutes === '00' || minutes === '30';
}
