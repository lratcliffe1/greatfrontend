import { parseCommaSeparatedIntegers } from "./parse-comma-separated-integers";

const CONSTRAINTS = { minLength: 1, maxLength: 5, minValue: 0, maxValue: 10 };

describe("parseCommaSeparatedIntegers", () => {
	it("parses valid input", () => {
		const result = parseCommaSeparatedIntegers("1, 2, 3", CONSTRAINTS);
		expect(result.data).toEqual([1, 2, 3]);
		expect(result.error).toBeNull();
	});

	it("returns error for empty input", () => {
		const result = parseCommaSeparatedIntegers("", CONSTRAINTS);
		expect(result.data).toBeNull();
		expect(result.error).toMatch(/Enter between/);
	});

	it("returns error for empty entries", () => {
		const result = parseCommaSeparatedIntegers("1,,3", CONSTRAINTS);
		expect(result.data).toBeNull();
		expect(result.error).toMatch(/without empty entries/);
	});

	it("returns error for non-integers", () => {
		const result = parseCommaSeparatedIntegers("1, a, 3", CONSTRAINTS);
		expect(result.data).toBeNull();
		expect(result.error).toMatch(/whole numbers/);
	});

	it("returns error for out-of-range values", () => {
		const result = parseCommaSeparatedIntegers("1, 99, 3", CONSTRAINTS);
		expect(result.data).toBeNull();
		expect(result.error).toMatch(/within/);
	});

	it("uses custom validator when provided", () => {
		const result = parseCommaSeparatedIntegers("1, 2", { minLength: 1, maxLength: 5 }, () => "Custom error");
		expect(result.data).toBeNull();
		expect(result.error).toBe("Custom error");
	});
});
