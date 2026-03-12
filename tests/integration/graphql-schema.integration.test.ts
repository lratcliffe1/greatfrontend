import { executeGraphQLQuery } from "@/lib/graphql/schema";

describe("GraphQL schema integration", () => {
	it("returns question data for a valid query", async () => {
		const result = await executeGraphQLQuery(`
      {
        question(track: gfe75, path: "debounce") {
          id
          title
          track
          path
          status
          solutionType
        }
      }
    `);

		const payload = result as {
			data?: {
				question?: {
					id: string;
					title: string;
					track: string;
					path: string;
					status: string;
					solutionType: string;
				} | null;
			};
			errors?: Array<{ message: string }>;
		};

		expect(result.errors).toBeUndefined();
		expect(payload.errors).toBeUndefined();
		expect(payload.data?.question).toMatchObject({
			id: "gfe-debounce",
			title: "Debounce",
			track: "gfe75",
			path: "debounce",
			status: "done",
			solutionType: "algo_visualizer",
		});
	});

	it("returns errors for an invalid query", async () => {
		const result = await executeGraphQLQuery(`
      {
        missingField
      }
    `);

		const payload = result as {
			errors?: Array<{ message: string }>;
		};

		expect(payload.errors?.[0]?.message).toContain('Cannot query field "missingField" on type "Query".');
	});

	it("returns tasks and supports add/remove/clear", async () => {
		await executeGraphQLQuery(`mutation { clearTasks }`);
		const tasksResult = await executeGraphQLQuery(`{ tasks { id label } }`);
		expect(tasksResult.errors).toBeUndefined();
		expect((tasksResult.data as { tasks: { id: number; label: string }[] }).tasks).toEqual([]);

		const addResult = await executeGraphQLQuery(`mutation AddTask($label: String!) { addTask(label: $label) { id label } }`, { label: "Test task" });
		expect(addResult.errors).toBeUndefined();
		expect((addResult.data as { addTask: { id: number; label: string } }).addTask).toMatchObject({
			label: "Test task",
		});

		const tasksAfterAdd = await executeGraphQLQuery(`{ tasks { id label } }`);
		expect((tasksAfterAdd.data as { tasks: { id: number; label: string }[] }).tasks).toHaveLength(1);

		const taskId = (addResult.data as { addTask: { id: number } }).addTask.id;
		await executeGraphQLQuery(`mutation RemoveTask($id: Int!) { removeTask(id: $id) }`, { id: taskId });

		const tasksAfterRemove = await executeGraphQLQuery(`{ tasks { id label } }`);
		expect((tasksAfterRemove.data as { tasks: unknown[] }).tasks).toEqual([]);
	});

	it("returns feed page with posts", async () => {
		const result = await executeGraphQLQuery(`
      query GetFeedPage($cursor: String) {
        feedPage(cursor: $cursor) {
          posts { id author content createdAt }
          nextCursor
        }
      }
    `);
		expect(result.errors).toBeUndefined();
		const feed = (result.data as { feedPage: { posts: { author: string; content: string }[] } }).feedPage;
		expect(feed.posts).toHaveLength(4);
		expect(feed.posts[0]).toMatchObject({
			author: expect.any(String),
			content: expect.any(String),
		});
	});
});
