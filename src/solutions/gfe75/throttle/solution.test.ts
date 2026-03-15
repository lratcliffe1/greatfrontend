import { throttle } from "@/solutions/gfe75/throttle/solution";

describe("throttle", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("calls callback immediately for single invocation", () => {
		const callback = jest.fn();
		const throttled = throttle(callback, 100);

		throttled("only");

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenLastCalledWith("only");
	});

	it("executes immediately at t=0, skips at t=50, executes again at t=101", () => {
		let i = 0;
		const increment = jest.fn(() => {
			i++;
		});
		const throttled = throttle(increment, 100);

		throttled();
		expect(i).toBe(1);
		expect(increment).toHaveBeenCalledTimes(1);

		jest.advanceTimersByTime(50);
		throttled();
		expect(i).toBe(1);
		expect(increment).toHaveBeenCalledTimes(1);

		jest.advanceTimersByTime(51);
		throttled();
		expect(i).toBe(2);
		expect(increment).toHaveBeenCalledTimes(2);
	});
});
