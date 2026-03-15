export function toClockTime(timestamp: number): string {
	const d = new Date(timestamp);
	const hours = String(d.getHours()).padStart(2, "0");
	const mins = String(d.getMinutes()).padStart(2, "0");
	const secs = String(d.getSeconds()).padStart(2, "0");
	const ms = String(d.getMilliseconds()).padStart(3, "0");
	return `${hours}:${mins}:${secs}.${ms}`;
}
