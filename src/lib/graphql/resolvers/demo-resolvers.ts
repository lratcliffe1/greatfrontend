/**
 * Demo resolvers composed from domain-specific modules.
 * Data flows through GraphQL as if from a real DB; swap resolvers when adding a DB.
 */

import { feedResolvers } from "./feed-resolvers";
import { todoResolvers } from "./todo-resolvers";

export type { TodoTask } from "./todo-resolvers";
export type { FeedPost, FeedPage, ReactionKey } from "./feed-resolvers";

export const demoResolvers = {
	Query: {
		...todoResolvers.Query,
		...feedResolvers.Query,
	},
	Mutation: {
		...todoResolvers.Mutation,
		...feedResolvers.Mutation,
	},
};
