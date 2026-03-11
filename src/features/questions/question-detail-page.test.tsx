import { render, screen } from "@/test-utils";
import { QuestionDetailPage } from "@/features/questions/question-detail-page";
import type { Question } from "@/content/questions";

const mockQuestion: Question = {
	id: "gfe-other",
	questionNumber: 1,
	path: "debounce",
	title: "Debounce",
	track: "gfe75",
	category: "JavaScript functions",
	difficulty: "Medium",
	sourceUrl: "https://www.greatfrontend.com/interviews/debounce",
	solutionType: "code_and_tests",
	status: "done",
	summary:
		"Debouncing controls how often a function is allowed to execute over time.",
	cardSummary:
		"Implement a function to limit how many times a function can be executed by delaying the execution of the function until after a specified time after its last execution attempt",
	approach:
		"Store a timeout id in closure state. On each invocation, clear the previous timeout and schedule a new one for `wait` ms.",
	complexity: "Time: O(1) per call, Space: O(1).",
	tags: ["timers", "closures"],
};

describe("QuestionDetailPage", () => {
	it("renders question details", () => {
		render(<QuestionDetailPage question={mockQuestion} />);

		expect(
			screen.getByRole("heading", { name: /Debounce/ }),
		).toBeInTheDocument();
		expect(screen.getByText("JavaScript functions")).toBeInTheDocument();
		expect(screen.getByText("Medium")).toBeInTheDocument();
		expect(screen.queryByText("Done")).not.toBeInTheDocument();
		expect(
			screen.getByText(
				"Debouncing controls how often a function is allowed to execute over time.",
			),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"Store a timeout id in closure state. On each invocation, clear the previous timeout and schedule a new one for `wait` ms.",
			),
		).toBeInTheDocument();
		expect(
			screen.getByText("Time: O(1) per call, Space: O(1)."),
		).toBeInTheDocument();
	});

	it("renders section headings", () => {
		render(<QuestionDetailPage question={mockQuestion} />);

		expect(screen.getByText("Problem summary")).toBeInTheDocument();
		expect(screen.getByText("Approach")).toBeInTheDocument();
		expect(screen.getByText("Runnable solution")).toBeInTheDocument();
		expect(screen.getByText("Complexity / tradeoffs")).toBeInTheDocument();
	});

	it("hides complexity section for conceptual questions", () => {
		const conceptualQuestion: Question = {
			...mockQuestion,
			id: "gfe-conceptual-question",
			complexity: "Conceptual question.",
		};

		render(<QuestionDetailPage question={conceptualQuestion} />);

		expect(
			screen.queryByText("Complexity / tradeoffs"),
		).not.toBeInTheDocument();
	});

	it("renders writeup solution type", () => {
		const writeupQuestion: Question = {
			...mockQuestion,
			id: "gfe-autocomplete",
			solutionType: "writeup",
		};

		render(<QuestionDetailPage question={writeupQuestion} />);

		expect(
			screen.getByText(/This writeup follows the guidance/),
		).toBeInTheDocument();
	});

	it("renders code-and-tests fallback", () => {
		const codeQuestion: Question = {
			...mockQuestion,
			id: "gfe-other",
			solutionType: "code_and_tests",
		};

		render(<QuestionDetailPage question={codeQuestion} />);

		expect(
			screen.getByText(/Code-first solution is implemented with unit tests/),
		).toBeInTheDocument();
	});

	it("renders the find-duplicates visualizer for the blind75 question id", async () => {
		const duplicateQuestion: Question = {
			...mockQuestion,
			id: "blind-find-duplicates-in-array",
			path: "find-duplicates-in-array",
			track: "blind75",
			title: "Find Duplicates in Array",
			solutionType: "algo_visualizer",
		};

		render(<QuestionDetailPage question={duplicateQuestion} />);

		expect(await screen.findByLabelText("Numbers input")).toBeInTheDocument();
		expect(
			await screen.findByText("Find Duplicates in Array implementation"),
		).toBeInTheDocument();
	});
});
