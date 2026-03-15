export const MAX_SUM_ARRAY_CONSTRAINTS = {
	minLength: 1,
	maxLength: 10_000,
	minValue: -10_000,
	maxValue: 10_000,
} as const;

export type MaxSumStep = {
	line: 2 | 4 | 5 | 6 | 8;
	index: number | null;
	value: number | null;
	maxEndingHere: number;
	globalMax: number;
	action: string;
};

export function getMaxSumSteps(numbers: number[]): MaxSumStep[] {
	const steps: MaxSumStep[] = [];
	const first = numbers[0];
	if (numbers.length === 0 || first === undefined) return steps;

	let maxEndingHere: number = first;
	let globalMax: number = first;

	const pushStep = (line: MaxSumStep["line"], index: number | null, value: number | null, action: string) => {
		steps.push({
			line,
			index,
			value,
			maxEndingHere,
			globalMax,
			action,
		});
	};

	pushStep(2, null, null, `Initialize: maxEnding = globalMax = numbers[0] = ${first}.`);

	for (let i = 1; i < numbers.length; i++) {
		const n = numbers[i] as number;
		const prevMax = maxEndingHere;

		pushStep(4, i, n, `At index ${i}: numbers[${i}] = ${n}.`);

		maxEndingHere = Math.max(n, prevMax + n);
		pushStep(5, i, n, `maxEnding = max(${n}, ${prevMax}+${n}) = max(${n}, ${prevMax + n}) = ${maxEndingHere}.`);

		const oldGlobal = globalMax;
		globalMax = Math.max(globalMax, maxEndingHere);
		pushStep(6, i, n, `globalMax = max(${oldGlobal}, ${maxEndingHere}) = ${globalMax}.`);
	}

	pushStep(8, null, null, `Return globalMax = ${globalMax}.`);

	return steps;
}
