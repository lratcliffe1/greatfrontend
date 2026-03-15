import {
	getMissingNumberInputError,
	getMissingNumberSteps,
} from "@/solutions/blind75/find-missing-number-in-sequence/solution";

describe("getMissingNumberSteps", () => {
	it("returns missing 2 for [1,3,0]", () => {
		expect(getMissingNumberSteps([1, 3, 0]).at(-1)?.missing).toBe(2);
	});

	it("returns missing 0 for [1]", () => {
		expect(getMissingNumberSteps([1]).at(-1)?.missing).toBe(0);
	});

	it("returns missing 5 for [3,0,4,2,1]", () => {
		expect(getMissingNumberSteps([3, 0, 4, 2, 1]).at(-1)?.missing).toBe(5);
	});

	it("returns missing 0 when 0 is missing from [1,2]", () => {
		expect(getMissingNumberSteps([1, 2]).at(-1)?.missing).toBe(0);
	});

	it("returns missing 1 when 1 is missing from [0,2]", () => {
		expect(getMissingNumberSteps([0, 2]).at(-1)?.missing).toBe(1);
	});
	it("ends with result phase", () => {
		const steps = getMissingNumberSteps([1, 3, 0]);
		expect(steps.at(-1)?.phase).toBe("result");
	});

	it("includes summing steps for each element", () => {
		const steps = getMissingNumberSteps([1, 3, 0]);
		const summingSteps = steps.filter((s) => s.phase === "summing");
		expect(summingSteps).toHaveLength(3);
	});
});

describe("getMissingNumberInputError", () => {
	it("reports invalid length", () => {
		expect(getMissingNumberInputError([])).toMatch(/Array length must be between/);
	});

	it("reports out-of-range value", () => {
		expect(getMissingNumberInputError([1, 2, 3, 5])).toMatch(/Each value must be an integer in/);
	});
});
