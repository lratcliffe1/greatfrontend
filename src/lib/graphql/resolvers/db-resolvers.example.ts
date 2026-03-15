/* eslint-disable @typescript-eslint/no-unused-vars -- example file with mock signatures */
/**
 * Example: DB-backed resolvers. Same Query/Mutation shape as demo-resolvers.
 *
 * To use:
 * 1. Add a DB client (e.g. Prisma, Drizzle) and define schema/tables.
 * 2. Replace the mock `db` below with your real client.
 * 3. In schema.ts: change `import { demoResolvers }` → `import { dbResolvers }` and spread `dbResolvers` instead.
 *
 * Schema, API route, and client stay unchanged.
 */

import type { TodoTask, FeedPost, FeedPage, ReactionKey } from "./demo-resolvers";

const VALID_REACTIONS = ["like", "haha", "wow"] as const;
const PAGE_SIZE = 4;

// Mock DB client – replace with real Prisma/Drizzle/etc.
const db = {
	task: {
		findMany: async (): Promise<TodoTask[]> => [],
		create: async (data: { label: string }): Promise<TodoTask> => ({ id: 1, label: data.label }),
		delete: async (_: { id: number }): Promise<void> => {},
		deleteMany: async (): Promise<void> => {},
	},
	post: {
		findMany: async (_: { cursor?: string; take: number }): Promise<{ posts: FeedPost[]; nextCursor: string | null }> => ({
			posts: [],
			nextCursor: null,
		}),
		create: async (data: { author: string; content: string; imageUrl?: string }): Promise<FeedPost> =>
			({
				id: `post-${Date.now()}`,
				author: data.author,
				content: data.content,
				imageUrl: data.imageUrl,
				createdAt: Date.now(),
				reactions: { like: 0, haha: 0, wow: 0 },
				reactionByMe: null,
			}) as FeedPost,
		updateReaction: async (_: { postId: string; reaction: ReactionKey | null }): Promise<FeedPost | null> => null,
	},
};

export const dbResolvers = {
	Query: {
		tasks: async (): Promise<TodoTask[]> => db.task.findMany(),
		feedPage: async (_: unknown, { cursor }: { cursor?: string | null }): Promise<FeedPage> =>
			db.post.findMany({ cursor: cursor ?? undefined, take: PAGE_SIZE }),
	},
	Mutation: {
		addTask: async (_: unknown, { label }: { label: string }): Promise<TodoTask> => {
			const trimmed = label.trim();
			if (!trimmed) throw new Error("Label cannot be empty");
			return db.task.create({ label: trimmed });
		},
		removeTask: async (_: unknown, { id }: { id: number }): Promise<boolean> => {
			await db.task.delete({ id });
			return true;
		},
		clearTasks: async (): Promise<boolean> => {
			await db.task.deleteMany();
			return true;
		},
		createPost: async (_: unknown, { content, imageUrl }: { content?: string; imageUrl?: string }): Promise<FeedPost> =>
			db.post.create({
				author: "Liam",
				content: (content ?? "").trim(),
				imageUrl: imageUrl?.trim() || undefined,
			}),
		reactToPost: async (_: unknown, { postId, reaction }: { postId: string; reaction?: string | null }): Promise<FeedPost> => {
			const nextReaction =
				reaction && VALID_REACTIONS.includes(reaction as (typeof VALID_REACTIONS)[number]) ? (reaction as (typeof VALID_REACTIONS)[number]) : null;
			const updated = await db.post.updateReaction({ postId, reaction: nextReaction });
			if (!updated) throw new Error("Post not found");
			return updated;
		},
	},
};
