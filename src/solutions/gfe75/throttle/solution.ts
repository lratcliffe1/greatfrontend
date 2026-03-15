export type ThrottleTraceEvent = {
	line: 1 | 2 | 3 | 5 | 6 | 8;
	message: string;
};

export function throttle<TArgs extends unknown[]>(callback: (...args: TArgs) => void, waitMs: number, onTrace?: (event: ThrottleTraceEvent) => void) {
	let lastExecutedAt: number | null = null;

	return (...args: TArgs) => {
		onTrace?.({ line: 1, message: "Throttled wrapper invoked." });
		const now = Date.now();
		const elapsed = lastExecutedAt !== null ? now - lastExecutedAt : Infinity;
		const hasWaited = lastExecutedAt === null || elapsed >= waitMs;
		onTrace?.({
			line: 3,
			message: `hasWaited = lastExecutedAt===null || elapsed>=${waitMs} => ${hasWaited}.`,
		});
		if (hasWaited) {
			onTrace?.({ line: 5, message: "Executing callback immediately." });
			callback(...args);
			lastExecutedAt = now;
			onTrace?.({ line: 6, message: `lastExecutedAt = ${now}.` });
		} else {
			onTrace?.({ line: 8, message: "Throttled: skipping (wait period not elapsed)." });
		}
	};
}
