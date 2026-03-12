/**
 * In-memory demo data for Todo and News Feed.
 * Data flows through GraphQL as if from a real DB; swap resolvers when adding a DB.
 * Todo tasks are isolated per session (cookie) so each browser has its own list.
 */

import type { GraphQLContext } from "@/lib/graphql/types";

const PAGE_SIZE = 4;
const VALID_REACTIONS = ["like", "haha", "wow"] as const;

export type TodoTask = { id: number; label: string };
export type ReactionKey = (typeof VALID_REACTIONS)[number];
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

type SessionStore = { tasks: TodoTask[]; nextId: number };
const sessionsStore = new Map<string, SessionStore>();

function getSessionStore(sessionId: string): SessionStore {
	let store = sessionsStore.get(sessionId);
	if (!store) {
		store = { tasks: [], nextId: 1 };
		sessionsStore.set(sessionId, store);
	}
	return store;
}

function createSeedPost(index: number): FeedPost {
	return {
		id: `post-${index + 1}`,
		author: index % 2 === 0 ? "Liam" : "Frontend Friend",
		content: `Sample post ${index + 1} in the mock feed. This demonstrates cursor pagination, feed composition, and optimistic reactions.`,
		imageUrl: index % 4 === 0 ? `https://picsum.photos/seed/news-feed-${index + 1}/720/420` : undefined,
		createdAt: Date.now() - index * 1000 * 60 * 12,
		reactions: {
			like: Math.floor(Math.random() * 40),
			haha: Math.floor(Math.random() * 20),
			wow: Math.floor(Math.random() * 10),
		},
		reactionByMe: null,
	};
}

const SEED_POSTS: FeedPost[] = Array.from({ length: 30 }).map((_, i) => createSeedPost(i));
const feedBySession = new Map<string, FeedPost[]>();

function getFeedForSession(sessionId: string): FeedPost[] {
	let feed = feedBySession.get(sessionId);
	if (!feed) {
		feed = [...SEED_POSTS];
		feedBySession.set(sessionId, feed);
	}
	return feed;
}

export const demoResolvers = {
	Query: {
		tasks: (_: unknown, __: unknown, context: GraphQLContext): TodoTask[] => {
			const sessionId = context?.sessionId ?? "default";
			return [...getSessionStore(sessionId).tasks];
		},
		feedPage: (_: unknown, { cursor }: { cursor?: string | null }, context: GraphQLContext): FeedPage => {
			const sessionId = context?.sessionId ?? "default";
			const feed = getFeedForSession(sessionId);
			const cursorVal = cursor ?? null;
			let start = 0;
			if (cursorVal) {
				const idx = feed.findIndex((p) => p.id === cursorVal);
				start = idx >= 0 ? idx + 1 : feed.length;
			}
			const pagePosts = feed.slice(start, start + PAGE_SIZE);
			const last = pagePosts[pagePosts.length - 1] ?? null;
			const nextCursor = start + pagePosts.length < feed.length && last ? last.id : null;
			return { posts: pagePosts, nextCursor };
		},
	},
	Mutation: {
		addTask: (_: unknown, { label }: { label: string }, context: GraphQLContext): TodoTask => {
			const sessionId = context?.sessionId ?? "default";
			const store = getSessionStore(sessionId);
			const trimmed = label.trim();
			if (!trimmed) throw new Error("Label cannot be empty");
			const task: TodoTask = { id: store.nextId++, label: trimmed };
			store.tasks = [...store.tasks, task];
			return task;
		},
		removeTask: (_: unknown, { id }: { id: number }, context: GraphQLContext): boolean => {
			const sessionId = context?.sessionId ?? "default";
			const store = getSessionStore(sessionId);
			store.tasks = store.tasks.filter((t) => t.id !== id);
			return true;
		},
		clearTasks: (_: unknown, __: unknown, context: GraphQLContext): boolean => {
			const sessionId = context?.sessionId ?? "default";
			const store = getSessionStore(sessionId);
			store.tasks = [];
			store.nextId = 1;
			return true;
		},
		createPost: (_: unknown, { content, imageUrl }: { content?: string; imageUrl?: string }, context: GraphQLContext): FeedPost => {
			const sessionId = context?.sessionId ?? "default";
			const feed = getFeedForSession(sessionId);
			const newPost: FeedPost = {
				id: `post-${Date.now()}`,
				author: "Liam",
				content: (content ?? "").trim(),
				imageUrl: imageUrl?.trim() || undefined,
				createdAt: Date.now(),
				reactions: { like: 0, haha: 0, wow: 0 },
				reactionByMe: null,
			};
			feed.unshift(newPost);
			return newPost;
		},
		reactToPost: (_: unknown, { postId, reaction }: { postId: string; reaction?: string | null }, context: GraphQLContext): FeedPost => {
			const sessionId = context?.sessionId ?? "default";
			const feed = getFeedForSession(sessionId);
			const reactionVal = reaction ?? null;
			const nextReaction =
				reactionVal && VALID_REACTIONS.includes(reactionVal as (typeof VALID_REACTIONS)[number])
					? (reactionVal as (typeof VALID_REACTIONS)[number])
					: null;

			const post = feed.find((p) => p.id === postId);
			if (!post) throw new Error("Post not found");

			const prev = post.reactionByMe;
			const nextReactions = { ...post.reactions };
			if (prev) nextReactions[prev] = Math.max(0, nextReactions[prev] - 1);
			if (nextReaction) nextReactions[nextReaction] += 1;

			const updated: FeedPost = {
				...post,
				reactions: nextReactions,
				reactionByMe: nextReaction,
			};
			const idx = feed.findIndex((p) => p.id === postId);
			if (idx >= 0) feed[idx] = updated;
			return updated;
		},
	},
};
