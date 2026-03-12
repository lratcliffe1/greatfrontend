"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";
import { GraphQLClient } from "graphql-request";

import type { Question, Track } from "@/content/questions";
import {
	ADD_TASK_MUTATION,
	CLEAR_TASKS_MUTATION,
	CREATE_POST_MUTATION,
	FEED_PAGE_QUERY,
	QUESTION_QUERY,
	QUESTIONS_QUERY,
	REACT_TO_POST_MUTATION,
	REMOVE_TASK_MUTATION,
	TASKS_QUERY,
} from "@/lib/graphql/documents";
import type { QuestionResponse, QuestionsResponse } from "@/lib/graphql/types";

export type TodoTask = { id: number; label: string };
export type ReactionKey = "like" | "haha" | "wow";
export type FeedPost = {
	id: string;
	author: string;
	content: string;
	imageUrl?: string;
	createdAt: number;
	reactions: Record<ReactionKey, number>;
	reactionByMe: ReactionKey | null;
};
export type FeedPage = { posts: FeedPost[]; nextCursor: string | null };

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
	tagTypes: ["Tasks", "Feed"],
	endpoints: (builder) => ({
		questions: builder.query<Question[], { track: Track }>({
			query: ({ track }) => ({
				document: QUESTIONS_QUERY,
				variables: { track },
			}),
			transformResponse: (response: QuestionsResponse) => response.questions,
		}),
		question: builder.query<Question | null, { track: Track; path: string }>({
			query: ({ track, path }) => ({
				document: QUESTION_QUERY,
				variables: { track, path },
			}),
			transformResponse: (response: QuestionResponse) => response.question,
		}),
		tasks: builder.query<TodoTask[], void>({
			query: () => ({ document: TASKS_QUERY }),
			transformResponse: (res: { tasks: TodoTask[] }) => res.tasks,
			providesTags: ["Tasks"],
		}),
		addTask: builder.mutation<TodoTask, { label: string }>({
			query: ({ label }) => ({
				document: ADD_TASK_MUTATION,
				variables: { label },
			}),
			transformResponse: (res: { addTask: TodoTask }) => res.addTask,
			invalidatesTags: ["Tasks"],
		}),
		removeTask: builder.mutation<boolean, { id: number }>({
			query: ({ id }) => ({
				document: REMOVE_TASK_MUTATION,
				variables: { id },
			}),
			invalidatesTags: ["Tasks"],
		}),
		clearTasks: builder.mutation<boolean, void>({
			query: () => ({ document: CLEAR_TASKS_MUTATION }),
			invalidatesTags: ["Tasks"],
		}),
		feedPage: builder.query<FeedPage, { cursor?: string | null }>({
			query: ({ cursor }) => ({
				document: FEED_PAGE_QUERY,
				variables: { cursor: cursor ?? null },
			}),
			transformResponse: (res: { feedPage: FeedPage }) => res.feedPage,
			providesTags: (result, _err, { cursor }) => (result ? [{ type: "Feed", id: cursor ?? "initial" }] : ["Feed"]),
		}),
		createPost: builder.mutation<FeedPost, { content?: string; imageUrl?: string }>({
			query: ({ content, imageUrl }) => ({
				document: CREATE_POST_MUTATION,
				variables: { content: content ?? null, imageUrl: imageUrl ?? null },
			}),
			transformResponse: (res: { createPost: FeedPost }) => res.createPost,
		}),
		reactToPost: builder.mutation<FeedPost, { postId: string; reaction: string | null }>({
			query: ({ postId, reaction }) => ({
				document: REACT_TO_POST_MUTATION,
				variables: { postId, reaction },
			}),
			transformResponse: (res: { reactToPost: FeedPost }) => res.reactToPost,
		}),
	}),
});

export const {
	useQuestionsQuery,
	useQuestionQuery,
	useTasksQuery,
	useAddTaskMutation,
	useRemoveTaskMutation,
	useClearTasksMutation,
	useFeedPageQuery,
	useLazyFeedPageQuery,
	useCreatePostMutation,
	useReactToPostMutation,
} = graphqlApi;
