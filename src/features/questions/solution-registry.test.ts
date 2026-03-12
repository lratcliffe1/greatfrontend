import { getSolutionRenderer } from "@/features/questions/solution-registry";
import { createMockQuestion } from "@/fixtures/questions";

describe("getSolutionRenderer", () => {
	it("returns null for code_and_tests solution type", () => {
		const question = createMockQuestion({ solutionType: "code_and_tests", status: "done" });
		expect(getSolutionRenderer(question)).toBeNull();
	});

	it("returns null for writeup solution type", () => {
		const question = createMockQuestion({ solutionType: "writeup", status: "done" });
		expect(getSolutionRenderer(question)).toBeNull();
	});

	it("returns null when status is not done", () => {
		const question = createMockQuestion({ solutionType: "algo_visualizer", status: "todo" });
		expect(getSolutionRenderer(question)).toBeNull();
	});

	it("returns null when no loader exists for track/path", () => {
		const question = createMockQuestion({
			track: "gfe75",
			path: "non-existent-question",
			solutionType: "algo_visualizer",
			status: "done",
		});
		expect(getSolutionRenderer(question)).toBeNull();
	});

	it("returns a component when loader exists for gfe75/debounce", () => {
		const question = createMockQuestion({
			track: "gfe75",
			path: "debounce",
			solutionType: "algo_visualizer",
			status: "done",
		});
		const renderer = getSolutionRenderer(question);
		expect(renderer).not.toBeNull();
		expect(renderer).toBeDefined();
	});
});
