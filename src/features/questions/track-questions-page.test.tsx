import userEvent from "@testing-library/user-event";
import { render, screen } from "@/test-utils";
import { TrackQuestionsPage } from "@/features/questions/track-questions-page";
import { useQuestionsQuery } from "@/lib/graphql/api";
import type { Question } from "@/content/questions";

const mockUseQuestionsQuery = jest.fn();
jest.mock("@/lib/graphql/api", () => ({
	...jest.requireActual("@/lib/graphql/api"),
	useQuestionsQuery: (...args: unknown[]) => mockUseQuestionsQuery(...args),
}));

const mockQuestions: Question[] = [
	{
		id: "q1",
		questionNumber: 1,
		slug: "debounce",
		title: "Debounce",
		track: "gfe75",
		category: "JavaScript functions",
		difficulty: "Medium",
		sourceUrl: "https://example.com",
		solutionType: "algo-visualizer",
		status: "done",
		summary: "Delay function execution.",
		approach: "Use a closure.",
		complexity: "O(1)",
		tags: ["timers", "closures"],
	},
	{
		id: "q2",
		questionNumber: 2,
		slug: "array-reduce",
		title: "Array.prototype.reduce",
		track: "gfe75",
		category: "JavaScript functions",
		difficulty: "Easy",
		sourceUrl: "https://example.com",
		solutionType: "code-and-tests",
		status: "todo",
		summary: "Implement reduce.",
		approach: "TODO",
		complexity: "TODO",
		tags: [],
	},
];

describe("TrackQuestionsPage", () => {
	beforeEach(() => {
		mockUseQuestionsQuery.mockReturnValue({
			data: mockQuestions,
			error: undefined,
			isLoading: false,
			isFetching: false,
			isSuccess: true,
			isError: false,
			refetch: jest.fn(),
			currentData: mockQuestions,
			dataUpdatedAt: 0,
			errorUpdatedAt: 0,
			failureCount: 0,
			failureReason: undefined,
			isUninitialized: false,
			status: "fulfilled",
			requestId: "",
			startedTimeStamp: 0,
			fulfilledTimeStamp: 0,
			isLoadingError: false,
			isRefetchError: false,
			originalArgs: { track: "gfe75" },
			endpointName: "questions",
		} as ReturnType<typeof useQuestionsQuery>);
	});

	it("renders loading state", () => {
		mockUseQuestionsQuery.mockReturnValue({
			data: undefined,
			error: undefined,
			isLoading: true,
			isFetching: true,
			isSuccess: false,
			isError: false,
			refetch: jest.fn(),
			currentData: undefined,
			dataUpdatedAt: 0,
			errorUpdatedAt: 0,
			failureCount: 0,
			failureReason: undefined,
			isUninitialized: false,
			status: "pending",
			requestId: "",
			startedTimeStamp: 0,
			fulfilledTimeStamp: 0,
			isLoadingError: false,
			isRefetchError: false,
			originalArgs: { track: "gfe75" },
			endpointName: "questions",
		} as ReturnType<typeof useQuestionsQuery>);

		render(<TrackQuestionsPage track="gfe75" />);
		expect(screen.getByText("Loading questions...")).toBeInTheDocument();
	});

	it("renders error state", () => {
		mockUseQuestionsQuery.mockReturnValue({
			data: undefined,
			error: { message: "Failed to load" },
			isLoading: false,
			isFetching: false,
			isSuccess: false,
			isError: true,
			refetch: jest.fn(),
			currentData: undefined,
			dataUpdatedAt: 0,
			errorUpdatedAt: 0,
			failureCount: 1,
			failureReason: undefined,
			isUninitialized: false,
			status: "rejected",
			requestId: "",
			startedTimeStamp: 0,
			fulfilledTimeStamp: 0,
			isLoadingError: true,
			isRefetchError: false,
			originalArgs: { track: "gfe75" },
			endpointName: "questions",
		} as ReturnType<typeof useQuestionsQuery>);

		render(<TrackQuestionsPage track="gfe75" />);
		expect(screen.getByText("Failed to load")).toBeInTheDocument();
	});

	it("renders question list when loaded", () => {
		render(<TrackQuestionsPage track="gfe75" />);
		expect(screen.getByText(/Debounce/)).toBeInTheDocument();
		expect(screen.getByText(/Array\.prototype\.reduce/)).toBeInTheDocument();
	});

	it("renders track title and progress", () => {
		render(<TrackQuestionsPage track="gfe75" />);
		expect(screen.getByRole("heading", { name: "GFE 75" })).toBeInTheDocument();
		expect(screen.getByText("1/2 complete")).toBeInTheDocument();
	});

	it("filters questions by search", async () => {
		const user = userEvent.setup();
		render(<TrackQuestionsPage track="gfe75" />);

		const searchInput = screen.getByLabelText("Search questions");
		await user.type(searchInput, "Debounce");

		expect(screen.getByText(/Debounce/)).toBeInTheDocument();
		expect(
			screen.queryByText(/Array\.prototype\.reduce/),
		).not.toBeInTheDocument();
	});
});
