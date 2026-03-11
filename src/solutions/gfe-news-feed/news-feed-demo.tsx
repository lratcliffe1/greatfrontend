"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppButton } from "@/components/ui/tailwind-primitives";

type FeedPost = {
	id: string;
	author: string;
	content: string;
	createdAt: number;
	likes: number;
	likedByMe: boolean;
};

type FeedPage = {
	posts: FeedPost[];
	nextCursor: string | null;
};

const PAGE_SIZE = 4;

let dbPosts: FeedPost[] = Array.from({ length: 14 }).map((_, index) => ({
	id: `post-${index + 1}`,
	author: index % 2 === 0 ? "Liam" : "Frontend Friend",
	content: `Sample post ${index + 1} in the mock feed. This demonstrates infinite scroll and optimistic reactions.`,
	createdAt: Date.now() - index * 1000 * 60 * 12,
	likes: Math.floor(Math.random() * 80),
	likedByMe: false,
}));

function wait(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function fetchFeedPage(cursor: string | null): Promise<FeedPage> {
	await wait(350);
	const start = cursor ? Number(cursor) : 0;
	const posts = dbPosts.slice(start, start + PAGE_SIZE);
	const nextCursor =
		start + PAGE_SIZE < dbPosts.length ? String(start + PAGE_SIZE) : null;
	return { posts, nextCursor };
}

async function createPost(content: string): Promise<FeedPost> {
	await wait(250);
	const newPost: FeedPost = {
		id: `post-${Date.now()}`,
		author: "Liam",
		content,
		createdAt: Date.now(),
		likes: 0,
		likedByMe: false,
	};
	dbPosts = [newPost, ...dbPosts];
	return newPost;
}

async function persistReaction(postId: string, nextLiked: boolean) {
	await wait(220);
	if (Math.random() < 0.15) {
		throw new Error("Reaction failed on server. Try again.");
	}

	dbPosts = dbPosts.map((post) => {
		if (post.id !== postId) return post;
		const likes = post.likes + (nextLiked ? 1 : -1);
		return {
			...post,
			likedByMe: nextLiked,
			likes: Math.max(0, likes),
		};
	});
}

function formatRelativeTime(timestamp: number) {
	const minutes = Math.max(
		1,
		Math.floor((Date.now() - timestamp) / (1000 * 60)),
	);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}

export function NewsFeedDemo() {
	const [posts, setPosts] = useState<FeedPost[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [newPostContent, setNewPostContent] = useState("");
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const loadingRef = useRef(false);

	const hasMore = useMemo(() => nextCursor !== null, [nextCursor]);

	const loadPage = useCallback(async (cursor: string | null) => {
		if (loadingRef.current) return;
		loadingRef.current = true;
		setLoading(true);
		try {
			const page = await fetchFeedPage(cursor);
			setPosts((previous) =>
				cursor ? [...previous, ...page.posts] : page.posts,
			);
			setNextCursor(page.nextCursor);
			setError(null);
		} catch {
			setError("Failed to fetch feed.");
		} finally {
			loadingRef.current = false;
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadPage(null);
	}, [loadPage]);

	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || !hasMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries.some((entry) => entry.isIntersecting) &&
					nextCursor &&
					!loadingRef.current
				) {
					void loadPage(nextCursor);
				}
			},
			{ rootMargin: "300px" },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [hasMore, loadPage, nextCursor]);

	async function onCreatePost(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const content = newPostContent.trim();
		if (!content) return;

		setSubmitting(true);
		try {
			const created = await createPost(content);
			setPosts((previous) => [created, ...previous]);
			setNewPostContent("");
			setError(null);
		} catch {
			setError("Failed to create post.");
		} finally {
			setSubmitting(false);
		}
	}

	async function toggleLike(postId: string) {
		const current = posts.find((post) => post.id === postId);
		if (!current) return;
		const nextLiked = !current.likedByMe;

		setPosts((previous) =>
			previous.map((post) =>
				post.id === postId
					? {
							...post,
							likedByMe: nextLiked,
							likes: Math.max(0, post.likes + (nextLiked ? 1 : -1)),
						}
					: post,
			),
		);

		try {
			await persistReaction(postId, nextLiked);
			setError(null);
		} catch (caught) {
			setPosts((previous) =>
				previous.map((post) =>
					post.id === postId
						? {
								...post,
								likedByMe: !nextLiked,
								likes: Math.max(0, post.likes + (nextLiked ? -1 : 1)),
							}
						: post,
				),
			);
			setError(caught instanceof Error ? caught.message : "Failed to react.");
		}
	}

	return (
		<div className="space-y-5">
			<form
				onSubmit={onCreatePost}
				className="space-y-2 rounded-md border border-slate-200 p-3"
			>
				<label
					className="text-sm font-medium text-slate-700"
					htmlFor="new-post"
				>
					Create post
				</label>
				<textarea
					id="new-post"
					value={newPostContent}
					onChange={(event) => setNewPostContent(event.target.value)}
					className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2"
					placeholder="Share something..."
				/>
				<AppButton type="submit" disabled={submitting}>
					{submitting ? "Publishing..." : "Publish"}
				</AppButton>
			</form>

			{error && <p className="text-sm text-red-700">{error}</p>}

			<div role="feed" className="space-y-3">
				{posts.map((post) => (
					<article
						key={post.id}
						className="rounded-md border border-slate-200 bg-white p-3"
					>
						<div className="mb-2 flex items-center justify-between text-sm text-slate-600">
							<span className="font-semibold text-slate-900">
								{post.author}
							</span>
							<span>{formatRelativeTime(post.createdAt)}</span>
						</div>
						<p className="mb-3 text-slate-800">{post.content}</p>
						<AppButton
							type="button"
							size="sm"
							onClick={() => toggleLike(post.id)}
							className={
								post.likedByMe
									? "ring-2 ring-teal-200 dark:ring-teal-300/40"
									: undefined
							}
						>
							{post.likedByMe ? "Liked" : "Like"} • {post.likes}
						</AppButton>
					</article>
				))}
			</div>

			<div ref={sentinelRef} className="h-8" />
			{loading && (
				<p className="text-sm text-slate-600">Loading more posts...</p>
			)}
			{!hasMore && !loading && (
				<p className="text-sm text-slate-500">
					No more posts in the mock feed.
				</p>
			)}
		</div>
	);
}
