import { buildSchema, defaultFieldResolver, graphql, type GraphQLResolveInfo } from "graphql";

import { getQuestionByPath, getQuestionsByTrack, type Question, type Track } from "@/content/questions";
import { demoResolvers } from "@/lib/graphql/demo-resolvers";

const schema = buildSchema(`
	enum Track {
		gfe75
		blind75
	}

	enum Difficulty {
		Easy
		Medium
		Hard
	}

	enum QuestionStatus {
		todo
		in_progress
		done
	}

	enum SolutionType {
		ui_demo
		algo_visualizer
		code_and_tests
		writeup
	}

	type Question {
		id: String!
		questionNumber: Int!
		path: String!
		title: String!
		track: Track!
		category: String!
		difficulty: Difficulty!
		sourceUrl: String!
		solutionType: SolutionType!
		status: QuestionStatus!
		summary: String!
		cardSummary: String!
		approach: String!
		complexity: String!
		tags: [String!]!
	}

	type TodoTask {
		id: Int!
		label: String!
	}

	type FeedPost {
		id: String!
		author: String!
		content: String!
		imageUrl: String
		createdAt: Float!
		reactions: ReactionCounts!
		reactionByMe: String
	}

	type ReactionCounts {
		like: Int!
		haha: Int!
		wow: Int!
	}

	type FeedPage {
		posts: [FeedPost!]!
		nextCursor: String
	}

	type Query {
		questions(track: Track!): [Question!]!
		question(track: Track!, path: String!): Question
		tasks: [TodoTask!]!
		feedPage(cursor: String): FeedPage!
	}

	type Mutation {
		addTask(label: String!): TodoTask!
		removeTask(id: Int!): Boolean!
		clearTasks: Boolean!
		createPost(content: String, imageUrl: String): FeedPost!
		reactToPost(postId: String!, reaction: String): FeedPost!
	}
`);

/** Custom resolver so root functions receive (source, args, context, info) correctly with buildSchema. */
function rootFieldResolver(source: unknown, args: Record<string, unknown>, contextValue: unknown, info: GraphQLResolveInfo) {
	const value =
		source != null && typeof source === "object" && info.fieldName in source ? (source as Record<string, unknown>)[info.fieldName] : undefined;
	if (typeof value === "function") {
		return (value as (...a: unknown[]) => unknown)(source, args, contextValue, info);
	}
	return defaultFieldResolver(source, args, contextValue, info);
}

const root = {
	questions: (_: unknown, { track }: { track: Track }): Question[] => getQuestionsByTrack(track),
	question: (_: unknown, { track, path }: { track: Track; path: string }): Question | null => getQuestionByPath(track, path),
	...demoResolvers.Query,
	...demoResolvers.Mutation,
};

export async function executeGraphQLQuery(query: string, variables?: Record<string, unknown>) {
	return graphql({
		schema,
		source: query,
		rootValue: root,
		variableValues: variables,
		fieldResolver: rootFieldResolver,
	});
}
