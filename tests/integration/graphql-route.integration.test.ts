/** @jest-environment node */

import { POST } from "@/app/api/graphql/route";
import { executeGraphQLQuery } from "@/lib/graphql/schema";

jest.mock("@/lib/graphql/schema", () => ({
	executeGraphQLQuery: jest.fn(),
}));

const mockExecuteGraphQLQuery = executeGraphQLQuery as jest.MockedFunction<
	typeof executeGraphQLQuery
>;

describe("GraphQL route integration", () => {
	beforeEach(() => {
		mockExecuteGraphQLQuery.mockReset();
	});

	it("returns a GraphQL-style error for invalid JSON body", async () => {
		const request = new Request("http://localhost/api/graphql", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: '{"query":',
		});

		const response = await POST(request);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			data: null,
			errors: [{ message: "Request body must be valid JSON." }],
		});
		expect(mockExecuteGraphQLQuery).not.toHaveBeenCalled();
	});

	it("returns a GraphQL-style error for non-object payloads", async () => {
		const request = new Request("http://localhost/api/graphql", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(["not-an-object"]),
		});

		const response = await POST(request);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			data: null,
			errors: [{ message: "GraphQL request body must be a JSON object." }],
		});
		expect(mockExecuteGraphQLQuery).not.toHaveBeenCalled();
	});

	it("returns a GraphQL-style error when query is missing", async () => {
		const request = new Request("http://localhost/api/graphql", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ variables: { track: "gfe75" } }),
		});

		const response = await POST(request);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			data: null,
			errors: [{ message: "GraphQL query is required." }],
		});
		expect(mockExecuteGraphQLQuery).not.toHaveBeenCalled();
	});

	it("returns mapped GraphQL errors when execution fails", async () => {
		mockExecuteGraphQLQuery.mockResolvedValue({
			data: null,
			errors: [{ message: "Validation error." }] as never,
		});

		const request = new Request("http://localhost/api/graphql", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				query:
					"query Questions($track: Track!) { questions(track: $track) { id } }",
				variables: { track: "gfe75" },
			}),
		});

		const response = await POST(request);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			data: null,
			errors: [{ message: "Validation error." }],
		});
		expect(mockExecuteGraphQLQuery).toHaveBeenCalledWith(
			"query Questions($track: Track!) { questions(track: $track) { id } }",
			{ track: "gfe75" },
		);
	});

	it("returns data payload when execution succeeds", async () => {
		mockExecuteGraphQLQuery.mockResolvedValue({
			data: { questions: [] },
		});

		const request = new Request("http://localhost/api/graphql", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				query:
					"query Questions($track: Track!) { questions(track: $track) { id } }",
				variables: { track: "gfe75" },
			}),
		});

		const response = await POST(request);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			data: { questions: [] },
		});
		expect(mockExecuteGraphQLQuery).toHaveBeenCalledWith(
			"query Questions($track: Track!) { questions(track: $track) { id } }",
			{ track: "gfe75" },
		);
	});
});
