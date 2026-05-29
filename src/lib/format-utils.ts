/** Formats menu and order amounts with the app's fixed USD display. */
export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

/** Formats timestamps for compact order and reservation time labels. */
export function formatClockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
