import { getMaxProductSteps } from "@/solutions/blind75/maximum-product-in-contiguous-array/solution";

describe("getMaxProductSteps", () => {
	it("returns globalMax 5 for [1,2,-3,5,1] (subarray [5,1])", () => {
		expect(getMaxProductSteps([1, 2, -3, 5, 1]).at(-1)?.globalMax).toBe(5);
	});

	it("returns globalMax 9 for single-element [9]", () => {
		expect(getMaxProductSteps([9]).at(-1)?.globalMax).toBe(9);
	});

	it("returns globalMax 32 for [1,2,0,-1,8,-4] (subarray [-1,8,-4])", () => {
		expect(getMaxProductSteps([1, 2, 0, -1, 8, -4]).at(-1)?.globalMax).toBe(32);
	});

	it("handles all positive numbers", () => {
		expect(getMaxProductSteps([2, 3, 4]).at(-1)?.globalMax).toBe(24);
	});

	it("handles two negatives producing positive", () => {
		expect(getMaxProductSteps([-2, -3]).at(-1)?.globalMax).toBe(6);
	});

	it("handles zero resetting the product", () => {
		expect(getMaxProductSteps([2, 0, 3]).at(-1)?.globalMax).toBe(3);
	});

	it("returns empty steps for empty array", () => {
		expect(getMaxProductSteps([])).toHaveLength(0);
	});

	it("includes init step for single-element array", () => {
		const steps = getMaxProductSteps([9]);
		expect(steps.at(0)?.line).toBe(2);
		expect(steps.at(-1)?.globalMax).toBe(9);
	});
});
