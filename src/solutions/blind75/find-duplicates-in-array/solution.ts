export const DUPLICATE_ARRAY_CONSTRAINTS = {
	minLength: 1,
	maxLength: 10_000,
	minValue: -1_000_000,
	maxValue: 1_000_000,
} as const;

export type DuplicateScanOutcome = "scanning" | "duplicate" | "complete";

export type DuplicateScanStep = {
	index: number | null;
	value: number | null;
	seen: number[];
	action: string;
	outcome: DuplicateScanOutcome;
	line: 2 | 3 | 4 | 5 | 7 | 9;
};

export function getDuplicateScanSteps(numbers: number[]): DuplicateScanStep[] {
	const steps: DuplicateScanStep[] = [];
	const seen = new Set<number>();

	const pushStep = (line: DuplicateScanStep["line"], index: number | null, value: number | null, action: string, outcome: DuplicateScanOutcome) => {
		steps.push({
			index,
			value,
			seen: [...seen],
			action,
			outcome,
			line,
		});
	};

	pushStep(2, null, null, "Initialize an empty seen set.", "scanning");

	for (const [index, value] of numbers.entries()) {
		pushStep(3, index, value, `Inspect numbers[${index}] = ${value}.`, "scanning");

		const alreadySeen = seen.has(value);
		pushStep(4, index, value, `seen.has(${value}) => ${alreadySeen}.`, alreadySeen ? "duplicate" : "scanning");
		if (alreadySeen) {
			pushStep(5, index, value, `Return true: ${value} was seen earlier.`, "duplicate");
			return steps;
		}

		seen.add(value);
		pushStep(7, index, value, `Add ${value} to seen set.`, "scanning");
	}

	pushStep(9, null, null, "Return false: every value was unique.", "complete");
	return steps;
}
