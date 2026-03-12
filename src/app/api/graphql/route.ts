import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { executeGraphQLQuery } from "@/lib/graphql/schema";
import type { GraphQLError } from "@/lib/graphql/types";

const SESSION_COOKIE = "todo-session";

function getSessionFromCookie(cookieHeader: string | null): string | null {
	if (!cookieHeader) return null;
	const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
	return match?.[1]?.trim() ?? null;
}

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

	const cookieHeader = request.headers.get("Cookie");
	let sessionId = getSessionFromCookie(cookieHeader);
	const isNewSession = !sessionId;
	if (!sessionId) {
		sessionId = randomUUID();
	}

	const result = await executeGraphQLQuery(query, variables as Record<string, unknown> | undefined, {
		sessionId,
	});

	if (result.errors && result.errors.length > 0) {
		return NextResponse.json(
			{
				data: result.data ?? null,
				errors: result.errors.map((err: GraphQLError) => ({ message: err.message })),
			},
			{ status: 200 },
		);
	}

	const response = NextResponse.json({ data: result.data });
	if (isNewSession) {
		response.headers.append("Set-Cookie", `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`);
	}
	return response;
}
