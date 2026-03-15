import { buildSchema, defaultFieldResolver, graphql, type GraphQLResolveInfo } from "graphql";

import { demoResolvers } from "@/lib/graphql/resolvers/demo-resolvers";
import type { GraphQLContext } from "@/lib/graphql/types";

const schema = buildSchema(`
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
	...demoResolvers.Query,
	...demoResolvers.Mutation,
};

export type { GraphQLContext } from "@/lib/graphql/types";

export async function executeGraphQLQuery(query: string, variables?: Record<string, unknown>, context?: GraphQLContext) {
	return graphql({
		schema,
		source: query,
		rootValue: root,
		variableValues: variables,
		contextValue: context ?? {},
		fieldResolver: rootFieldResolver,
	});
}
