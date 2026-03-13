export type CommaSeparatedIntegerConstraints = {
	minLength: number;
	maxLength: number;
	minValue?: number;
	maxValue?: number;
};

export type ParseResult<T> =
	| {
			data: T;
			error: null;
	  }
	| {
			data: null;
			error: string;
	  };

/**
 * Parse comma-separated integers with common validation.
 * Optionally accepts a custom validator for problem-specific rules.
 */
export function parseCommaSeparatedIntegers(
	rawInput: string,
	constraints: CommaSeparatedIntegerConstraints,
	validate?: (numbers: number[]) => string | null,
): ParseResult<number[]> {
	const trimmed = rawInput.trim();
	if (!trimmed) {
		return {
			data: null,
			error: `Enter between ${constraints.minLength} and ${constraints.maxLength} comma-separated integers.`,
		};
	}

	const parts = trimmed.split(",").map((part) => part.trim());
	if (parts.some((part) => part.length === 0)) {
		return {
			data: null,
			error: "Use comma-separated integers without empty entries.",
		};
	}

	const numbers = parts.map((part) => Number(part));
	if (numbers.some((value) => !Number.isInteger(value))) {
		return {
			data: null,
			error: "Use whole numbers only, for example: 5, 7, 1, 3",
		};
	}

	if (parts.length < constraints.minLength || parts.length > constraints.maxLength) {
		return {
			data: null,
			error: `Use between ${constraints.minLength} and ${constraints.maxLength} integers.`,
		};
	}

	if (constraints.minValue !== undefined || constraints.maxValue !== undefined) {
		const min = constraints.minValue ?? -Infinity;
		const max = constraints.maxValue ?? Infinity;
		const outOfRange = numbers.find((value) => value < min || value > max);
		if (outOfRange !== undefined) {
			return {
				data: null,
				error: `Each integer must stay within ${min} and ${max}.`,
			};
		}
	}

	const customError = validate?.(numbers);
	if (customError) {
		return { data: null, error: customError };
	}

	return { data: numbers, error: null };
}
