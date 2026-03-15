export const MISSING_NUMBER_CONSTRAINTS = {
	minLength: 1,
	maxLength: 10_000,
} as const;

export type MissingNumberStepPhase = "init" | "summing" | "result";

export type MissingNumberStep = {
	phase: MissingNumberStepPhase;
	index: number | null;
	value: number | null;
	expectedSum: number | null;
	actualSum: number | null;
	action: string;
	missing: number | null;
	line: 2 | 3 | 4 | 5 | 6 | 7;
};

export function getMissingNumberSteps(numbers: number[]): MissingNumberStep[] {
	const steps: MissingNumberStep[] = [];
	const n = numbers.length;
	const expectedSumVal = (n * (n + 1)) / 2;

	const pushStep = (
		line: MissingNumberStep["line"],
		phase: MissingNumberStepPhase,
		index: number | null,
		value: number | null,
		expectedSum: number | null,
		actualSum: number | null,
		action: string,
		missing: number | null,
	) => {
		steps.push({
			phase,
			index,
			value,
			expectedSum,
			actualSum,
			action,
			missing,
			line,
		});
	};

	pushStep(2, "init", null, null, null, null, `n = numbers.length = ${n}.`, null);
	pushStep(3, "init", null, null, expectedSumVal, null, `expectedSum = n*(n+1)/2 = ${n}*${n + 1}/2 = ${expectedSumVal}.`, null);

	let actualSumVal = 0;
	pushStep(4, "init", null, null, expectedSumVal, null, "let actualSum = 0.", null);

	for (const [i, value] of numbers.entries()) {
		actualSumVal += value;
		pushStep(5, "summing", i, value, expectedSumVal, actualSumVal, `Add numbers[${i}] = ${value} to actualSum.`, null);
	}

	const missingVal = expectedSumVal - actualSumVal;
	pushStep(
		6,
		"result",
		null,
		null,
		expectedSumVal,
		actualSumVal,
		`missing = expectedSum - actualSum = ${expectedSumVal} - ${actualSumVal} = ${missingVal}.`,
		missingVal,
	);
	pushStep(7, "result", null, null, expectedSumVal, actualSumVal, `Return ${missingVal}.`, missingVal);

	return steps;
}

export function getMissingNumberInputError(numbers: number[]): string | null {
	const n = numbers.length;
	if (n < MISSING_NUMBER_CONSTRAINTS.minLength || n > MISSING_NUMBER_CONSTRAINTS.maxLength) {
		return `Array length must be between ${MISSING_NUMBER_CONSTRAINTS.minLength} and ${MISSING_NUMBER_CONSTRAINTS.maxLength}.`;
	}
	const seen = new Set<number>();
	for (const [i, value] of numbers.entries()) {
		if (!Number.isInteger(value) || value < 0 || value > n) {
			return `Each value must be an integer in [0, ${n}]. Found ${value} at index ${i}.`;
		}
		if (seen.has(value)) {
			return `Duplicate value ${value} at index ${i}. All values must be distinct.`;
		}
		seen.add(value);
	}
	return null;
}
