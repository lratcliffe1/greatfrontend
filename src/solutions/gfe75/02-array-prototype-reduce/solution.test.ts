import { installMyReduce, getReduceSteps } from "@/solutions/gfe75/02-array-prototype-reduce/solution";

beforeAll(() => {
	installMyReduce();
});

describe("getReduceSteps", () => {
	it("produces steps whose final result matches myReduce", () => {
		const arr = [1, 2, 3, 4];
		const init = 5;
		const expected = arr.myReduce((a, b) => a + b, init);
		const steps = getReduceSteps(arr, init);
		const lastStep = steps[steps.length - 1];
		expect(lastStep?.accumulator).toBe(expected);
	});

	it("handles empty array", () => {
		const steps = getReduceSteps([], 10);
		expect(steps.length).toBeGreaterThan(0);
		expect(steps[steps.length - 1]?.accumulator).toBe(10);
	});
});

describe("Array.prototype.myReduce", () => {
	it("sums with initial value 0", () => {
		expect([1, 2, 3].myReduce((prev, curr) => prev + curr, 0)).toBe(6);
	});

	it("sums with initial value 4", () => {
		expect([1, 2, 3].myReduce((prev, curr) => prev + curr, 4)).toBe(10);
	});

	it("sums without initial value", () => {
		expect([1, 2, 3].myReduce((prev, curr) => prev + curr)).toBe(6);
	});

	it("returns initial value for empty array", () => {
		expect([].myReduce((() => {}) as never, 42)).toBe(42);
	});

	it("throws TypeError for empty array without initial value", () => {
		expect(() => [].myReduce((a: number, b: number) => a + b)).toThrow(TypeError);
		expect(() => [].myReduce((a: number, b: number) => a + b)).toThrow("Reduce of empty array with no initial value");
	});

	it("returns sole element without calling callback when no initial value", () => {
		const callback = jest.fn();
		const result = [50].myReduce(callback as never);
		expect(result).toBe(50);
		expect(callback).not.toHaveBeenCalled();
	});

	it("passes correct arguments to callback (accumulator, currentValue, index, array)", () => {
		const callback = jest.fn((acc: number, curr: number) => acc + curr);
		[10, 20].myReduce(callback, 0);
		expect(callback).toHaveBeenCalledTimes(2);
		expect(callback).toHaveBeenNthCalledWith(1, 0, 10, 0, [10, 20]);
		expect(callback).toHaveBeenNthCalledWith(2, 10, 20, 1, [10, 20]);
	});

	it("skips sparse array holes", () => {
		const arr = [1, , 3];
		const callback = jest.fn((acc: number, curr: number) => acc + curr);
		const result = arr.myReduce(callback as never, 0);
		expect(callback).toHaveBeenCalledTimes(2);
		expect(result).toBe(4);
	});

	it("builds object from array", () => {
		const result = ["a", "b", "c"].myReduce(
			(acc: Record<string, number>, curr, i) => {
				acc[curr] = i;
				return acc;
			},
			{} as Record<string, number>,
		);
		expect(result).toEqual({ a: 0, b: 1, c: 2 });
	});
});
