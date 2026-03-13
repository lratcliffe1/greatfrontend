import { findMissingNumber } from "@/solutions/blind75/find-missing-number-in-sequence/solution";

describe("findMissingNumber", () => {
	it("returns 2 for [1,3,0]", () => {
		expect(findMissingNumber([1, 3, 0])).toBe(2);
	});

	it("returns 0 for [1]", () => {
		expect(findMissingNumber([1])).toBe(0);
	});

	it("returns 5 for [3,0,4,2,1]", () => {
		expect(findMissingNumber([3, 0, 4, 2, 1])).toBe(5);
	});

	it("returns 0 when 0 is missing from [1,2]", () => {
		expect(findMissingNumber([1, 2])).toBe(0);
	});

	it("returns 1 when 1 is missing from [0,2]", () => {
		expect(findMissingNumber([0, 2])).toBe(1);
	});
});
