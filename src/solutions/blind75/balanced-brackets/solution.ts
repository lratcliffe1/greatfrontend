type OpeningBracket = "(" | "{" | "[";
type ClosingBracket = ")" | "}" | "]";

export const BRACKET_INPUT_CONSTRAINTS = {
	minLength: 1,
	maxLength: 1000,
} as const;

const OPENING = new Set<string>(["(", "{", "["]);

const CLOSE_TO_OPEN: Record<ClosingBracket, OpeningBracket> = {
	")": "(",
	"}": "{",
	"]": "[",
};

const OPEN_TO_CLOSE: Record<OpeningBracket, ClosingBracket> = {
	"(": ")",
	"{": "}",
	"[": "]",
};

const VALID_TOKENS = /^[()[\]{}]+$/;

export type BracketStep = {
	token: string;
	stack: string[];
	action: string;
	validSoFar: boolean;
	line: 9 | 10 | 11 | 13 | 14 | 15 | 16 | 17 | 19 | 23;
};

export function getBalancedBracketInputError(input: string) {
	if (input.length < BRACKET_INPUT_CONSTRAINTS.minLength || input.length > BRACKET_INPUT_CONSTRAINTS.maxLength) {
		return `Enter between ${BRACKET_INPUT_CONSTRAINTS.minLength} and ${BRACKET_INPUT_CONSTRAINTS.maxLength} bracket characters.`;
	}

	if (!VALID_TOKENS.test(input)) {
		return "Use only bracket characters: (), {}, and [].";
	}

	return null;
}

export function getBalancedBracketSteps(input: string): BracketStep[] {
	const steps: BracketStep[] = [];
	const stack: OpeningBracket[] = [];
	const pushStep = (line: BracketStep["line"], token: string, action: string, validSoFar: boolean) => {
		steps.push({
			token,
			stack: [...stack],
			action,
			validSoFar,
			line,
		});
	};

	for (const token of input) {
		pushStep(9, token, `Iterating token "${token}".`, true);

		const isOpening = OPENING.has(token);
		pushStep(10, token, `OPENING.has("${token}") => ${isOpening}.`, true);

		if (isOpening) {
			stack.push(token as OpeningBracket);
			pushStep(11, token, `Push "${token}" to stack.`, true);
			continue;
		}

		const expected = CLOSE_TO_OPEN[token as ClosingBracket];
		const top = stack[stack.length - 1];
		const valid = top === expected;
		pushStep(13, token, `Expected opening for "${token}" is "${expected ?? "?"}".`, true);
		pushStep(14, token, `Top of stack is "${top ?? "(none)"}".`, true);
		pushStep(15, token, `top === expected => ${valid}.`, valid);

		if (!valid) {
			pushStep(16, token, `Mismatch. Expected ${top ? OPEN_TO_CLOSE[top] : "opening bracket"}, got "${token}".`, false);
			pushStep(17, token, "Early return due to invalid bracket ordering.", false);
			return steps;
		}

		stack.pop();
		pushStep(19, token, `Pop stack for closing token "${token}".`, true);
	}

	pushStep(
		23,
		"end",
		stack.length === 0 ? "Return true: all brackets matched." : "Return false: unclosed openings remain.",
		stack.length === 0,
	);

	return steps;
}
