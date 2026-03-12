/**
 * In-memory demo data for Todo and News Feed.
 * Data flows through GraphQL as if from a real DB; swap resolvers when adding a DB.
 */

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

// In-memory stores (module-level; persists for process lifetime)
let tasksStore: TodoTask[] = [];
let nextIdStore = 1;

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

const feedPostsStore: FeedPost[] = Array.from({ length: 30 }).map((_, i) => createSeedPost(i));

export const demoResolvers = {
	Query: {
		tasks: (): TodoTask[] => [...tasksStore],
		feedPage: (_: unknown, { cursor }: { cursor?: string | null }): FeedPage => {
			const cursorVal = cursor ?? null;
			let start = 0;
			if (cursorVal) {
				const idx = feedPostsStore.findIndex((p) => p.id === cursorVal);
				start = idx >= 0 ? idx + 1 : feedPostsStore.length;
			}
			const pagePosts = feedPostsStore.slice(start, start + PAGE_SIZE);
			const last = pagePosts[pagePosts.length - 1] ?? null;
			const nextCursor = start + pagePosts.length < feedPostsStore.length && last ? last.id : null;
			return { posts: pagePosts, nextCursor };
		},
	},
	Mutation: {
		addTask: (_: unknown, { label }: { label: string }): TodoTask => {
			const trimmed = label.trim();
			if (!trimmed) throw new Error("Label cannot be empty");
			const task: TodoTask = { id: nextIdStore++, label: trimmed };
			tasksStore = [...tasksStore, task];
			return task;
		},
		removeTask: (_: unknown, { id }: { id: number }): boolean => {
			tasksStore = tasksStore.filter((t) => t.id !== id);
			return true;
		},
		clearTasks: (): boolean => {
			tasksStore = [];
			nextIdStore = 1;
			return true;
		},
		createPost: (_: unknown, { content, imageUrl }: { content?: string; imageUrl?: string }): FeedPost => {
			const newPost: FeedPost = {
				id: `post-${Date.now()}`,
				author: "Liam",
				content: (content ?? "").trim(),
				imageUrl: imageUrl?.trim() || undefined,
				createdAt: Date.now(),
				reactions: { like: 0, haha: 0, wow: 0 },
				reactionByMe: null,
			};
			feedPostsStore.unshift(newPost);
			return newPost;
		},
		reactToPost: (_: unknown, { postId, reaction }: { postId: string; reaction?: string | null }): FeedPost => {
			const reactionVal = reaction ?? null;
			const nextReaction =
				reactionVal && VALID_REACTIONS.includes(reactionVal as (typeof VALID_REACTIONS)[number])
					? (reactionVal as (typeof VALID_REACTIONS)[number])
					: null;

			const post = feedPostsStore.find((p) => p.id === postId);
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
			const idx = feedPostsStore.findIndex((p) => p.id === postId);
			if (idx >= 0) feedPostsStore[idx] = updated;
			return updated;
		},
	},
};
