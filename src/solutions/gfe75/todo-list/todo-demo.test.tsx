import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";

import { TodoDemo } from "@/solutions/gfe75/todo-list/todo-demo";

const TODO_STORAGE_KEY = "todo-demo/tasks/v1";

describe("TodoDemo", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	it("hydrates tasks from localStorage", async () => {
		window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify([{ id: 1, label: "Persisted task" }]));

		render(<TodoDemo />);

		expect(await screen.findByText("Persisted task")).toBeInTheDocument();
	});

	it("persists tasks and restores them after remount", async () => {
		const user = userEvent.setup();
		const firstRender = render(<TodoDemo />);

		await user.type(screen.getByLabelText("Task name"), "Write tests");
		await user.click(screen.getByRole("button", { name: "Add" }));

		await waitFor(() => {
			const storedTasks = window.localStorage.getItem(TODO_STORAGE_KEY);
			expect(storedTasks).toContain("Write tests");
		});

		firstRender.unmount();
		render(<TodoDemo />);

		expect(await screen.findByText("Write tests")).toBeInTheDocument();
	});
});
