import { QuestionStatus, SolutionType, Track } from "@/content/questions";
import { getSolutionRenderer, prefetchSolutionRenderer } from "@/questions/solution-registry";
import { createMockQuestion } from "@/questions/mock-questions";

describe("getSolutionRenderer", () => {
	it("returns null when done but no loader exists for path", () => {
		const question = createMockQuestion({
			solutionTypes: [SolutionType.CodeAndTests],
			status: QuestionStatus.Done,
			path: "array-prototype-reduce",
		});
		expect(getSolutionRenderer(question)).toBeNull();
	});

	it("returns null for writeup solution type when no loader exists", () => {
		const question = createMockQuestion({
			solutionTypes: [SolutionType.Writeup],
			status: QuestionStatus.Done,
			path: "autocomplete",
		});
		expect(getSolutionRenderer(question)).toBeNull();
	});

	it("returns null when status is not done", () => {
		const question = createMockQuestion({ solutionTypes: [SolutionType.AlgoVisualizer], status: QuestionStatus.Todo });
		expect(getSolutionRenderer(question)).toBeNull();
	});

	it("returns null when no loader exists for track/path", () => {
		const question = createMockQuestion({
			track: Track.Gfe75,
			path: "non-existent-question",
			solutionTypes: [SolutionType.AlgoVisualizer],
			status: QuestionStatus.Done,
		});
		expect(getSolutionRenderer(question)).toBeNull();
	});

	it("returns a component when loader exists for gfe75/debounce", () => {
		const question = createMockQuestion({
			track: Track.Gfe75,
			path: "debounce",
			solutionTypes: [SolutionType.AlgoVisualizer],
			status: QuestionStatus.Done,
		});
		const renderer = getSolutionRenderer(question);
		expect(renderer).not.toBeNull();
		expect(renderer).toBeDefined();
	});
});

describe("prefetchSolutionRenderer", () => {
	it("does not throw for runnable question with loader", () => {
		const question = createMockQuestion({
			track: Track.Gfe75,
			path: "debounce",
			solutionTypes: [SolutionType.AlgoVisualizer],
			status: QuestionStatus.Done,
		});
		expect(() => prefetchSolutionRenderer(question)).not.toThrow();
	});

	it("does not throw when no loader exists", () => {
		const question = createMockQuestion({
			solutionTypes: [SolutionType.CodeAndTests],
			status: QuestionStatus.Done,
			path: "array-prototype-reduce",
		});
		expect(() => prefetchSolutionRenderer(question)).not.toThrow();
	});

	it("does not throw when status is not done", () => {
		const question = createMockQuestion({
			track: Track.Gfe75,
			path: "debounce",
			solutionTypes: [SolutionType.AlgoVisualizer],
			status: QuestionStatus.Todo,
		});
		expect(() => prefetchSolutionRenderer(question)).not.toThrow();
	});
});
