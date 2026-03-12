import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, within } from "@/test-utils";
import { TrackQuestionsPage } from "@/features/questions/track-questions-page";
import type { Question } from "@/content/questions";

const mockQuestions: Question[] = [
	{
		id: "q1",
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
	},
	{
		id: "q2",
		questionNumber: 2,
		path: "array-reduce",
		title: "Array.prototype.reduce",
		track: "gfe75",
		category: "JavaScript functions",
		difficulty: "Easy",
		sourceUrl: "https://example.com",
		solutionType: "code_and_tests",
		status: "todo",
		summary: "Implement reduce.",
		cardSummary: "TODO: Add concise card summary.",
		approach: "TODO",
		complexity: "TODO",
		tags: [],
	},
];

describe("TrackQuestionsPage", () => {
	beforeEach(() => {
		window.history.replaceState(window.history.state, "", "/gfe75");
	});

	it("renders question list", () => {
		render(<TrackQuestionsPage track="gfe75" questions={mockQuestions} />);
		expect(screen.getByText(/Debounce/)).toBeInTheDocument();
		expect(screen.getByText(/Array\.prototype\.reduce/)).toBeInTheDocument();
	});

	it("renders track title and progress", () => {
		render(<TrackQuestionsPage track="gfe75" questions={mockQuestions} />);
		expect(screen.getByRole("heading", { name: "GFE 75" })).toBeInTheDocument();
		expect(screen.getByText("1/2 complete")).toBeInTheDocument();
	});

	it("filters questions by search", async () => {
		const user = userEvent.setup();
		render(<TrackQuestionsPage track="gfe75" questions={mockQuestions} />);

		const searchInput = screen.getByLabelText("Search questions");
		await user.type(searchInput, "Debounce");

		expect(screen.getByText(/Debounce/)).toBeInTheDocument();
		expect(screen.queryByText(/Array\.prototype\.reduce/)).not.toBeInTheDocument();
		expect(screen.getByTestId("track-progress")).toHaveTextContent("1/1 complete");
	});

	it("hydrates filters from URL params", () => {
		window.history.replaceState(window.history.state, "", "/gfe75?search=reduce&status=todo&category=JavaScript%20functions");

		render(<TrackQuestionsPage track="gfe75" questions={mockQuestions} />);

		expect(screen.getByLabelText("Search questions")).toHaveValue("reduce");
		expect(within(screen.getByTestId("filter-status")).getByRole("combobox")).toHaveTextContent("Todo");
		expect(within(screen.getByTestId("filter-category")).getByRole("combobox")).toHaveTextContent("JavaScript functions");
		expect(screen.queryByText(/Debounce/)).not.toBeInTheDocument();
		expect(screen.getByText(/Array\.prototype\.reduce/)).toBeInTheDocument();
		expect(screen.getByTestId("track-progress")).toHaveTextContent("0/1 complete");
	});

	it("syncs filter changes back to URL params", async () => {
		const user = userEvent.setup();
		render(<TrackQuestionsPage track="gfe75" questions={mockQuestions} />);

		const searchInput = screen.getByLabelText("Search questions");
		await user.type(searchInput, "Debounce");

		await waitFor(() => {
			expect(window.location.search).toContain("search=Debounce");
		});
	});
});
