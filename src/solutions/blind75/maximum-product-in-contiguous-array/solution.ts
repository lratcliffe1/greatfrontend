export const MAX_PRODUCT_ARRAY_CONSTRAINTS = {
	minLength: 1,
	maxLength: 1000,
	minValue: -10,
	maxValue: 10,
} as const;

export type MaxProductStep = {
	line: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
	index: number | null;
	value: number | null;
	maxEndingHere: number;
	minEndingHere: number;
	globalMax: number;
	action: string;
};

export function getMaxProductSteps(numbers: number[]): MaxProductStep[] {
	const steps: MaxProductStep[] = [];
	const first = numbers[0];
	if (numbers.length === 0 || first === undefined) return steps;

	let maxEndingHere: number = first;
	let minEndingHere: number = first;
	let globalMax: number = first;

	const pushStep = (line: MaxProductStep["line"], index: number | null, value: number | null, action: string) => {
		steps.push({
			line,
			index,
			value,
			maxEndingHere,
			minEndingHere,
			globalMax,
			action,
		});
	};

	pushStep(2, null, null, `Initialize: maxEnding = minEnding = globalMax = numbers[0] = ${first}.`);

	for (let i = 1; i < numbers.length; i++) {
		const n = numbers[i] as number;
		const prevMax = maxEndingHere;
		const prevMin = minEndingHere;

		pushStep(4, i, n, `At index ${i}: numbers[${i}] = ${n}.`);

		maxEndingHere = Math.max(n, prevMax * n, prevMin * n);
		pushStep(5, i, n, `maxEnding = max(${n}, ${prevMax}×${n}, ${prevMin}×${n}) = max(${n}, ${prevMax * n}, ${prevMin * n}) = ${maxEndingHere}.`);

		minEndingHere = Math.min(n, prevMax * n, prevMin * n);
		pushStep(6, i, n, `minEnding = min(${n}, ${prevMax}×${n}, ${prevMin}×${n}) = min(${n}, ${prevMax * n}, ${prevMin * n}) = ${minEndingHere}.`);

		const oldGlobal = globalMax;
		globalMax = Math.max(globalMax, maxEndingHere);
		pushStep(7, i, n, `globalMax = max(${oldGlobal}, ${maxEndingHere}) = ${globalMax}.`);
	}

	pushStep(9, null, null, `Return globalMax = ${globalMax}.`);

	return steps;
}

export function maxProductSubarray(numbers: number[]): number {
	const steps = getMaxProductSteps(numbers);
	const lastStep = steps.at(-1);
	return lastStep?.globalMax ?? 0;
}
