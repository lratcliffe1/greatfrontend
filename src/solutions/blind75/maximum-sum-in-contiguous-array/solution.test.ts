import { getMaxSumSteps } from "@/solutions/blind75/maximum-sum-in-contiguous-array/solution";

describe("getMaxSumSteps", () => {
	it("returns globalMax 11 for [-1,5,-3,9,-11] (subarray [5,-3,9])", () => {
		expect(getMaxSumSteps([-1, 5, -3, 9, -11]).at(-1)?.globalMax).toBe(11);
	});

	it("returns globalMax 9 for single-element [9]", () => {
		expect(getMaxSumSteps([9]).at(-1)?.globalMax).toBe(9);
	});

	it("returns globalMax 10 for [1,2,3,4] (whole array)", () => {
		expect(getMaxSumSteps([1, 2, 3, 4]).at(-1)?.globalMax).toBe(10);
	});

	it("handles all negative numbers", () => {
		expect(getMaxSumSteps([-1, -2, -3]).at(-1)?.globalMax).toBe(-1);
	});

	it("handles single negative", () => {
		expect(getMaxSumSteps([-5]).at(-1)?.globalMax).toBe(-5);
	});

	it("returns empty steps for empty array", () => {
		expect(getMaxSumSteps([])).toHaveLength(0);
	});

	it("includes init step for single-element array", () => {
		const steps = getMaxSumSteps([9]);
		expect(steps.at(0)?.line).toBe(2);
		expect(steps.at(-1)?.globalMax).toBe(9);
	});
});
