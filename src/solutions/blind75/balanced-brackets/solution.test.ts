import { getBalancedBracketInputError, getBalancedBracketSteps } from "@/solutions/blind75/balanced-brackets/solution";

describe("getBalancedBracketSteps", () => {
	it("returns validSoFar true for balanced input", () => {
		expect(getBalancedBracketSteps("([]){}").at(-1)?.validSoFar).toBe(true);
	});

	it("returns validSoFar false for invalid ordering", () => {
		expect(getBalancedBracketSteps("([)]").at(-1)?.validSoFar).toBe(false);
	});

	it("includes end step", () => {
		const steps = getBalancedBracketSteps("[]");
		expect(steps.at(-1)?.token).toBe("end");
	});

	it("ends early for invalid ordering", () => {
		const steps = getBalancedBracketSteps("([)]");
		expect(steps.at(-1)?.validSoFar).toBe(false);
	});
});

describe("getBalancedBracketInputError", () => {
	it("reports invalid length", () => {
		expect(getBalancedBracketInputError("")).toMatch(/Enter between 1 and 1000/);
	});

	it("reports when input exceeds 1000 characters", () => {
		expect(getBalancedBracketInputError("(".repeat(1001))).toMatch(/Enter between 1 and 1000/);
	});

	it("reports unsupported characters", () => {
		expect(getBalancedBracketInputError("([a])")).toMatch(/Use only bracket characters/);
	});
});
