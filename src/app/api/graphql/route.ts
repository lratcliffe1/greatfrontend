import { NextResponse } from "next/server";
import { executeGraphQLQuery } from "@/lib/graphql/schema";
import type { GraphQLError } from "@/lib/graphql/types";

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
	}

	if (typeof body !== "object" || body === null) {
		return NextResponse.json({ error: "GraphQL request body must be a JSON object." }, { status: 400 });
	}

	const { query, variables } = body as { query?: unknown; variables?: unknown };
	if (typeof query !== "string" || !query.trim()) {
		return NextResponse.json({ error: "GraphQL query is required." }, { status: 400 });
	}

	const result = await executeGraphQLQuery(query, variables as Record<string, unknown> | undefined);

	if (result.errors && result.errors.length > 0) {
		// Return 200 with errors for GraphQL spec compliance; client can still parse
		return NextResponse.json(
			{
				data: result.data ?? null,
				errors: result.errors.map((err: GraphQLError) => ({ message: err.message })),
			},
			{ status: 200 },
		);
	}

	return NextResponse.json({ data: result.data });
}
