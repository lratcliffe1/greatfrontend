/**
 * Array.prototype.myReduce - implements Array.prototype.reduce.
 * Callback receives (accumulator, currentValue, currentIndex, array).
 */
declare global {
	interface Array<T> {
		myReduce<U>(callback: (accumulator: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
		myReduce(callback: (accumulator: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
		myReduce<U>(callback: (accumulator: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue?: U): U;
	}
}

export function installMyReduce(): void {
	if (Array.prototype.myReduce !== undefined) return;

	Array.prototype.myReduce = function myReduce<T, U>(
		this: T[],
		callback: (accumulator: U, currentValue: T, currentIndex: number, array: T[]) => U,
		initialValue?: U,
	): U {
		const len = this.length;
		if (len === 0 && initialValue === undefined) {
			throw new TypeError("Reduce of empty array with no initial value");
		}
		if (len === 0) return initialValue as U;

		let acc = (initialValue !== undefined ? initialValue : this[0]) as U;
		const start = initialValue !== undefined ? 0 : 1;

		for (let i = start; i < len; i++) {
			if (i in this) acc = callback(acc, this[i] as T, i, this);
		}
		return acc;
	};
}

// --- Visualizer ---

export const REDUCE_ARRAY_CONSTRAINTS = {
	minLength: 1,
	maxLength: 12,
	minValue: -100,
	maxValue: 100,
} as const;

export type ReduceStep = {
	line: 1 | 2 | 4 | 6 | 10 | 11 | 13;
	index: number | null;
	accumulator: number;
	currentValue: number | null;
	action: string;
};

type StepLine = ReduceStep["line"];

function step(line: StepLine, index: number | null, acc: number, curr: number | null, action: string): ReduceStep {
	return { line, index, accumulator: acc, currentValue: curr, action };
}

export function getReduceSteps(numbers: number[], initialValue?: number): ReduceStep[] {
	installMyReduce();

	const steps: ReduceStep[] = [];
	const init = initialValue ?? 0;

	steps.push(step(1, null, 0, null, "Register myReduce."));
	steps.push(step(10, null, 0, null, "Call myReduce with addition callback."));
	steps.push(step(2, null, init, null, `Set acc = initialValue ?? 0 → acc = ${init}.`));

	const reducer = (prev: number, curr: number, i: number): number => {
		steps.push(step(4, i, prev, curr, `Invoke callback(${prev}, ${curr}).`));
		const next = prev + curr;
		steps.push(step(11, i, prev, curr, `Callback returns: ${prev} + ${curr} = ${next}.`));
		steps.push(step(4, i, next, curr, `acc = ${next}. Loop continues to next index.`));
		return next;
	};

	const result = numbers.myReduce(reducer, init);

	steps.push(step(6, null, result, null, `Loop complete. reduce returns accumulator = ${result}.`));
	steps.push(step(13, null, result, null, `return result = ${result}.`));
	return steps;
}
