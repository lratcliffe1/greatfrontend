"use client";

import { GraphQLClient } from "graphql-request";

import type { Track } from "@/content/questions";
import { QUESTION_QUERY, QUESTIONS_QUERY } from "@/lib/graphql/documents";
import type { QuestionResponse, QuestionsResponse } from "@/lib/graphql/types";

function getClient() {
	const endpoint =
		typeof window === "undefined"
			? "http://127.0.0.1:3000/api/graphql"
			: `${window.location.origin}/api/graphql`;
	return new GraphQLClient(endpoint);
}

export async function fetchQuestions(track: Track) {
	const response = await getClient().request<QuestionsResponse>(
		QUESTIONS_QUERY,
		{ track },
	);
	return response.questions;
}

export async function fetchQuestion(track: Track, slug: string) {
	const response = await getClient().request<QuestionResponse>(QUESTION_QUERY, {
		track,
		slug,
	});
	return response.question;
}
