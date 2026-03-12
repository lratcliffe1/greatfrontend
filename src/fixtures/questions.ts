import type { Question, Track } from "@/content/questions";

const DEFAULT_QUESTION: Question = {
	id: "gfe-debounce",
	questionNumber: 1,
	path: "debounce",
	title: "Debounce",
	track: "gfe75",
	category: "JavaScript functions",
	difficulty: "Medium",
	sourceUrl: "https://example.com",
	solutionType: "algo_visualizer",
	status: "done",
	summary: "Delay function execution.",
	cardSummary: "Delay function execution.",
	approach: "Use a closure.",
	complexity: "O(1)",
	tags: ["timers", "closures"],
};

/** Creates a mock Question with optional overrides. */
export function createMockQuestion(overrides?: Partial<Question>): Question {
	return { ...DEFAULT_QUESTION, ...overrides };
}

/** Base mock question for tests that need a single question. */
export const mockQuestion = createMockQuestion();

/** Creates an array of mock questions. Default returns 2 questions (done + todo). */
export function createMockQuestions(overrides?: Partial<Question>[]): Question[] {
	const base = [
		createMockQuestion({ id: "q1", path: "debounce", title: "Debounce", status: "done" }),
		createMockQuestion({
			id: "q2",
			questionNumber: 2,
			path: "array-reduce",
			title: "Array.prototype.reduce",
			solutionType: "code_and_tests",
			status: "todo",
			summary: "Implement reduce.",
			cardSummary: "TODO: Add concise card summary.",
			approach: "TODO",
			complexity: "TODO",
			tags: [],
		}),
	];
	if (overrides) {
		return base.map((q, i) => (overrides[i] ? { ...q, ...overrides[i] } : q));
	}
	return base;
}

/** Pre-built array of 2 mock questions for list/grid tests. */
export const mockQuestions = createMockQuestions();

/** Track values for tests. */
export const mockTracks: Track[] = ["gfe75", "blind75"];
