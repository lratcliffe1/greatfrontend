/**
 * @jest-environment node
 */
import { POST } from "@/app/api/graphql/route";
import { executeGraphQLQuery } from "@/lib/graphql/schema";

jest.mock("@/lib/graphql/schema", () => ({
	executeGraphQLQuery: jest.fn(),
}));

const mockExecuteGraphQLQuery = executeGraphQLQuery as jest.MockedFunction<typeof executeGraphQLQuery>;

describe("GraphQL API route", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("returns 400 for invalid JSON body", async () => {
		const request = new Request("http://localhost/api/graphql", {
			method: "POST",
			body: "not json",
			headers: { "Content-Type": "application/json" },
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toContain("valid JSON");
		expect(mockExecuteGraphQLQuery).not.toHaveBeenCalled();
	});

	it("returns 400 when body is not an object", async () => {
		const request = new Request("http://localhost/api/graphql", {
			method: "POST",
			body: JSON.stringify("string"),
			headers: { "Content-Type": "application/json" },
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toContain("JSON object");
		expect(mockExecuteGraphQLQuery).not.toHaveBeenCalled();
	});

	it("returns 400 when query is missing", async () => {
		const request = new Request("http://localhost/api/graphql", {
			method: "POST",
			body: JSON.stringify({ variables: {} }),
			headers: { "Content-Type": "application/json" },
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toContain("query is required");
		expect(mockExecuteGraphQLQuery).not.toHaveBeenCalled();
	});

	it("executes valid query and returns data", async () => {
		mockExecuteGraphQLQuery.mockResolvedValue({
			data: { tasks: [{ id: 1, label: "Test task" }] },
		});

		const request = new Request("http://localhost/api/graphql", {
			method: "POST",
			body: JSON.stringify({
				query: "query GetTasks { tasks { id label } }",
			}),
			headers: { "Content-Type": "application/json" },
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.data).toEqual({ tasks: [{ id: 1, label: "Test task" }] });
		expect(mockExecuteGraphQLQuery).toHaveBeenCalledWith(
			"query GetTasks { tasks { id label } }",
			undefined,
			expect.objectContaining({ sessionId: expect.any(String) }),
		);
	});

	it("returns errors in response when schema returns errors", async () => {
		mockExecuteGraphQLQuery.mockResolvedValue(
			// Minimal error shape for route mapping; graphql returns full GraphQLError
			{ data: null, errors: [{ message: "Cannot query field 'missingField' on type 'Query'." }] } as unknown as Awaited<
				ReturnType<typeof import("@/lib/graphql/schema").executeGraphQLQuery>
			>,
		);

		const request = new Request("http://localhost/api/graphql", {
			method: "POST",
			body: JSON.stringify({
				query: "{ missingField }",
			}),
			headers: { "Content-Type": "application/json" },
		});

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.errors).toHaveLength(1);
		expect(data.errors[0].message).toContain("missingField");
	});
});
