import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, within } from "@/test-utils";
import { TrackQuestionsPage } from "@/features/questions/track-questions-page";
import { mockQuestions } from "@/fixtures/questions";

jest.mock("next/navigation", () => {
	const actual = jest.requireActual<typeof import("next/navigation")>("next/navigation");
	return {
		...actual,
		useRouter: () => ({ prefetch: () => {} }),
	};
});

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

		const searchInput = screen.getByTestId("filter-search");
		await user.type(searchInput, "Debounce");

		// Search is debounced; wait for filter to apply
		await waitFor(() => {
			expect(screen.getByText(/Debounce/)).toBeInTheDocument();
			expect(screen.queryByText(/Array\.prototype\.reduce/)).not.toBeInTheDocument();
			expect(screen.getByTestId("track-progress")).toHaveTextContent("1/1 complete");
		});
	});

	it("hydrates filters from URL params", () => {
		window.history.replaceState(window.history.state, "", "/gfe75?searchGfe=reduce&statusGfe=todo&categoryGfe=JavaScript%20functions");

		render(<TrackQuestionsPage track="gfe75" questions={mockQuestions} />);

		expect(screen.getByTestId("filter-search")).toHaveValue("reduce");
		expect(within(screen.getByTestId("filter-status")).getByRole("combobox")).toHaveTextContent("To do");
		expect(within(screen.getByTestId("filter-category")).getByRole("combobox")).toHaveTextContent("JavaScript functions");
		expect(screen.queryByText(/Debounce/)).not.toBeInTheDocument();
		expect(screen.getByText(/Array\.prototype\.reduce/)).toBeInTheDocument();
		expect(screen.getByTestId("track-progress")).toHaveTextContent("0/1 complete");
	});

	it("syncs filter changes back to URL params", async () => {
		const user = userEvent.setup();
		render(<TrackQuestionsPage track="gfe75" questions={mockQuestions} />);

		const searchInput = screen.getByTestId("filter-search");
		await user.type(searchInput, "Debounce");

		// Search is debounced; URL updates after debounce
		await waitFor(
			() => {
				expect(window.location.search).toContain("searchGfe=Debounce");
			},
			{ timeout: 500 },
		);
	});
});
