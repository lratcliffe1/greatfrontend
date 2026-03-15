/**
 * In-memory demo data for News Feed.
 * Data flows through GraphQL as if from a real DB; swap resolvers when adding a DB.
 */

import type { GraphQLContext } from "@/lib/graphql/types";

const PAGE_SIZE = 4;
const VALID_REACTIONS = ["like", "haha", "wow"] as const;

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

export const feedResolvers = {
	Query: {
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
