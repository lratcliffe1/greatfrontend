import { NextResponse } from "next/server";

import { executeGraphQLQuery } from "@/lib/graphql/schema";
import type { GraphQLError } from "@/lib/graphql/types";

type GraphQLRequestBody = {
	query?: string;
	variables?: Record<string, unknown>;
};

function graphQlErrorResponse(message: string, status = 400) {
	const errors: GraphQLError[] = [{ message }];
	return NextResponse.json({ data: null, errors }, { status });
}

export async function POST(request: Request) {
	let body: GraphQLRequestBody;

	try {
		body = (await request.json()) as GraphQLRequestBody;
	} catch {
		return graphQlErrorResponse("Request body must be valid JSON.");
	}

	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return graphQlErrorResponse(
			"GraphQL request body must be a JSON object.",
		);
	}

	if (typeof body.query !== "string" || body.query.trim().length === 0) {
		return graphQlErrorResponse("GraphQL query is required.");
	}

	const result = await executeGraphQLQuery(body.query, body.variables);

	if (result.errors?.length) {
		const errors: GraphQLError[] = result.errors.map((error) => ({
			message: error.message,
		}));
		return NextResponse.json({ data: result.data ?? null, errors }, { status: 400 });
	}

	return NextResponse.json({ data: result.data });
}
