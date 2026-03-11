"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";
import { GraphQLClient } from "graphql-request";

import type { Question, Track } from "@/content/questions";
import { QUESTION_QUERY, QUESTIONS_QUERY } from "@/lib/graphql/documents";
import type { QuestionResponse, QuestionsResponse } from "@/lib/graphql/types";

function getGraphQLEndpoint() {
	if (typeof window === "undefined") {
		return "http://127.0.0.1:3000/api/graphql";
	}
	return `${window.location.origin}/api/graphql`;
}

const client = new GraphQLClient(getGraphQLEndpoint());

export const graphqlApi = createApi({
	reducerPath: "graphqlApi",
	baseQuery: graphqlRequestBaseQuery({ client }),
	endpoints: (builder) => ({
		questions: builder.query<Question[], { track: Track }>({
			query: ({ track }) => ({
				document: QUESTIONS_QUERY,
				variables: { track },
			}),
			transformResponse: (response: QuestionsResponse) => response.questions,
		}),
		question: builder.query<Question | null, { track: Track; slug: string }>({
			query: ({ track, slug }) => ({
				document: QUESTION_QUERY,
				variables: { track, slug },
			}),
			transformResponse: (response: QuestionResponse) => response.question,
		}),
	}),
});

export const { useQuestionsQuery, useQuestionQuery } = graphqlApi;
