import { maxProductSubarray } from "@/solutions/blind75/maximum-product-in-contiguous-array/solution";

describe("maxProductSubarray", () => {
	it("returns 5 for [1,2,-3,5,1] (subarray [5,1])", () => {
		expect(maxProductSubarray([1, 2, -3, 5, 1])).toBe(5);
	});

	it("returns 9 for single-element [9]", () => {
		expect(maxProductSubarray([9])).toBe(9);
	});

	it("returns 32 for [1,2,0,-1,8,-4] (subarray [-1,8,-4])", () => {
		expect(maxProductSubarray([1, 2, 0, -1, 8, -4])).toBe(32);
	});

	it("handles all positive numbers", () => {
		expect(maxProductSubarray([2, 3, 4])).toBe(24);
	});

	it("handles two negatives producing positive", () => {
		expect(maxProductSubarray([-2, -3])).toBe(6);
	});

	it("handles zero resetting the product", () => {
		expect(maxProductSubarray([2, 0, 3])).toBe(3);
	});

	it("returns 0 for empty array", () => {
		expect(maxProductSubarray([])).toBe(0);
	});
});
