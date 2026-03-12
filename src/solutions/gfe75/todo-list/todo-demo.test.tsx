import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@/test-utils";
import { TodoDemo } from "@/solutions/gfe75/todo-list/todo-demo";

const mockTasks: { id: number; label: string }[] = [];

function mockGraphQLResponse(body: string) {
	const parsed = JSON.parse(body) as { query?: string; variables?: Record<string, unknown> };
	const query = parsed.query ?? "";
	if (query.includes("GetTasks")) {
		return { data: { tasks: [...mockTasks] } };
	}
	if (query.includes("AddTask")) {
		const label = (parsed.variables?.label as string) ?? "";
		const task = { id: mockTasks.length + 1, label };
		mockTasks.push(task);
		return { data: { addTask: task } };
	}
	if (query.includes("RemoveTask")) {
		const id = parsed.variables?.id as number;
		const idx = mockTasks.findIndex((t) => t.id === id);
		if (idx >= 0) mockTasks.splice(idx, 1);
		return { data: { removeTask: true } };
	}
	if (query.includes("ClearTasks")) {
		mockTasks.length = 0;
		return { data: { clearTasks: true } };
	}
	return { data: {} };
}

describe("TodoDemo", () => {
	beforeEach(() => {
		mockTasks.length = 0;
		const originalFetch = global.fetch;
		global.fetch = jest.fn((url: string | URL, init?: RequestInit) => {
			if (String(url).includes("/api/graphql") && init?.method === "POST" && init?.body) {
				const res = mockGraphQLResponse(init.body as string);
				const body = JSON.stringify(res);
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(res),
					text: () => Promise.resolve(body),
					headers: new Headers({ "Content-Type": "application/json" }),
				} as Response);
			}
			return originalFetch(url as string, init);
		}) as typeof fetch;
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("loads and displays tasks", async () => {
		mockTasks.push({ id: 1, label: "Persisted task" });

		render(<TodoDemo />);

		expect(await screen.findByText("Persisted task")).toBeInTheDocument();
	});

	it("adds tasks and displays them", async () => {
		const user = userEvent.setup();
		render(<TodoDemo />);

		const input = await screen.findByLabelText("Task name");
		await user.type(input, "Write tests");
		await user.click(screen.getByRole("button", { name: "Add" }));

		await waitFor(() => {
			expect(screen.getByText("Write tests")).toBeInTheDocument();
		});
	});

	it("removes a task when Delete is clicked", async () => {
		mockTasks.push({ id: 1, label: "To delete" });
		const user = userEvent.setup();
		render(<TodoDemo />);

		expect(await screen.findByText("To delete")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Delete task To delete" }));

		await waitFor(() => {
			expect(screen.queryByText("To delete")).not.toBeInTheDocument();
		});
	});

	it("clears all tasks when Clear all is clicked", async () => {
		mockTasks.push({ id: 1, label: "First" }, { id: 2, label: "Second" });
		const user = userEvent.setup();
		render(<TodoDemo />);

		expect(await screen.findByText("First")).toBeInTheDocument();
		expect(screen.getByText("Second")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Clear all" }));

		await waitFor(() => {
			expect(screen.queryByText("First")).not.toBeInTheDocument();
			expect(screen.queryByText("Second")).not.toBeInTheDocument();
		});
	});
});
