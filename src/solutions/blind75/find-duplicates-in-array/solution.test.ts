import { getDuplicateScanSteps } from "@/solutions/blind75/find-duplicates-in-array/solution";

describe("getDuplicateScanSteps", () => {
	it("ends with complete when all numbers are unique", () => {
		expect(getDuplicateScanSteps([5, 7, 1, 3]).at(-1)?.outcome).toBe("complete");
	});

	it("ends with duplicate when a repeat exists", () => {
		expect(getDuplicateScanSteps([10, 7, 0, 0, 9]).at(-1)?.outcome).toBe("duplicate");
	});

	it("ends with duplicate when multiple values repeat", () => {
		expect(getDuplicateScanSteps([3, 2, 6, 5, 0, 3, 10, 3, 10, 5]).at(-1)?.outcome).toBe("duplicate");
	});

	it("ends with complete for empty input", () => {
		expect(getDuplicateScanSteps([]).at(-1)?.outcome).toBe("complete");
	});
});
