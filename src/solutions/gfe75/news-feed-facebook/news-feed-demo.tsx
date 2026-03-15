"use client";

import { ChangeEvent, startTransition, useCallback, useEffect, useRef, useState } from "react";
import { AppButton } from "@/components/ui/tailwind-primitives";
import type { FeedPost, ReactionKey } from "@/lib/graphql/api";
import { useCreatePostMutation, useFeedPageQuery, useLazyFeedPageQuery, useReactToPostMutation } from "@/lib/graphql/api";

const REACTION_KEYS: ReactionKey[] = ["like", "haha", "wow"];
const REACTION_LABELS: Record<ReactionKey, string> = {
	like: "Like",
	haha: "Haha",
	wow: "Wow",
};

function formatRelativeTime(timestamp: number) {
	const seconds = Math.round((timestamp - Date.now()) / 1000);
	const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
	if (Math.abs(seconds) < 60) return rtf.format(seconds, "second");
	const minutes = Math.round(seconds / 60);
	if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
	const hours = Math.round(minutes / 60);
	if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
	return rtf.format(Math.round(hours / 24), "day");
}

function getTotalReactions(post: FeedPost) {
	return REACTION_KEYS.reduce((total, key) => total + post.reactions[key], 0);
}

function applyReactionTransition(post: FeedPost, nextReaction: ReactionKey | null): FeedPost {
	const previousReaction = post.reactionByMe;
	const nextReactions = { ...post.reactions };
	if (previousReaction) {
		nextReactions[previousReaction] = Math.max(0, nextReactions[previousReaction] - 1);
	}
	if (nextReaction) {
		nextReactions[nextReaction] += 1;
	}
	return { ...post, reactions: nextReactions, reactionByMe: nextReaction };
}

export function NewsFeedDemo() {
	const [posts, setPosts] = useState<FeedPost[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [newPostContent, setNewPostContent] = useState("");
	const [newPostImageUrl, setNewPostImageUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const loadingMoreRef = useRef(false);

	const { data: initialPage, isLoading: isLoadingInitial } = useFeedPageQuery({ cursor: undefined });
	const [fetchMore, { data: morePage, isLoading: isLoadingMore }] = useLazyFeedPageQuery();
	const [createPost, { isLoading: isSubmitting }] = useCreatePostMutation();
	const [reactToPost] = useReactToPostMutation();

	const hasMore = nextCursor !== null;

	useEffect(() => {
		if (initialPage) {
			startTransition(() => {
				setPosts(initialPage.posts);
				setNextCursor(initialPage.nextCursor);
			});
		}
	}, [initialPage]);

	useEffect(() => {
		if (morePage) {
			startTransition(() => {
				setPosts((prev) => [...prev, ...morePage.posts.filter((p) => !prev.some((existing) => existing.id === p.id))]);
				setNextCursor(morePage.nextCursor);
				loadingMoreRef.current = false;
			});
		}
	}, [morePage]);

	const loadMore = useCallback(() => {
		if (!nextCursor || loadingMoreRef.current) return;
		loadingMoreRef.current = true;
		fetchMore({ cursor: nextCursor });
	}, [nextCursor, fetchMore]);

	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || !hasMore) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) loadMore();
			},
			{ rootMargin: "100% 0px" },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [hasMore, loadMore]);

	function onCreatePost(event: ChangeEvent<HTMLFormElement>) {
		event.preventDefault();
		const content = newPostContent.trim();
		const imageUrl = newPostImageUrl.trim();
		if (!content && !imageUrl) return;
		setError(null);
		setNewPostContent("");
		setNewPostImageUrl("");
		queueMicrotask(() => {
			createPost({
				content: content || undefined,
				imageUrl: imageUrl || undefined,
			})
				.unwrap()
				.then((created) => {
					setPosts((prev) => [created, ...prev]);
				})
				.catch(() => {
					setError("Failed to create post.");
				});
		});
	}

	function onReactToPost(postId: string, selectedReaction: ReactionKey) {
		const current = posts.find((p) => p.id === postId);
		if (!current) return;
		const previousReaction = current.reactionByMe;
		const nextReaction = previousReaction === selectedReaction ? null : selectedReaction;

		setPosts((prev) => prev.map((p) => (p.id === postId ? applyReactionTransition(p, nextReaction) : p)));
		setError(null);
		queueMicrotask(() => {
			reactToPost({ postId, reaction: nextReaction })
				.unwrap()
				.catch((caught) => {
					setPosts((prev) => prev.map((p) => (p.id === postId ? applyReactionTransition(p, previousReaction) : p)));
					setError(caught instanceof Error ? caught.message : "Failed to react.");
				});
		});
	}

	if (isLoadingInitial) {
		return <p className="text-sm text-muted">Loading feed...</p>;
	}

	return (
		<div className="space-y-5">
			<form onSubmit={onCreatePost} className="space-y-2 rounded-md border border-card-border p-3 [background:var(--card-bg)]">
				<label className="text-sm font-medium text-foreground" htmlFor="new-post">
					Create post
				</label>
				<textarea
					id="new-post"
					value={newPostContent}
					onChange={(e) => setNewPostContent(e.target.value)}
					className="min-h-24 w-full rounded-md border border-card-border px-3 py-2 [background:var(--input-bg)] text-foreground"
					placeholder="Share something..."
				/>
				<input
					id="new-post-image"
					value={newPostImageUrl}
					onChange={(e) => setNewPostImageUrl(e.target.value)}
					className="w-full rounded-md border border-card-border px-3 py-2 text-sm [background:var(--input-bg)] text-foreground"
					placeholder="Optional image URL"
				/>
				<div className="flex flex-wrap items-center gap-2">
					<AppButton type="submit" disabled={isSubmitting || (!newPostContent.trim() && !newPostImageUrl.trim())}>
						{isSubmitting ? "Publishing..." : "Publish"}
					</AppButton>
					<p className="text-xs text-muted">Supports text-only and text+image posts.</p>
				</div>
			</form>

			{error ? (
				<p role="alert" className="text-sm text-red-700 dark:text-red-300">
					{error}
				</p>
			) : null}

			<div role="feed" className="space-y-3">
				{posts.map((post) => {
					const totalReactions = getTotalReactions(post);
					return (
						<article
							key={post.id}
							role="article"
							aria-labelledby={`post-author-${post.id}`}
							className="rounded-md border border-card-border p-3 [background:var(--card-bg)]"
						>
							<div className="mb-2 flex items-center justify-between text-sm text-muted">
								<span id={`post-author-${post.id}`} className="font-semibold text-foreground">
									{post.author}
								</span>
								<span>{formatRelativeTime(post.createdAt)}</span>
							</div>
							{post.content ? <p className="mb-3 whitespace-pre-line text-foreground">{post.content}</p> : null}
							{post.imageUrl ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={post.imageUrl}
									alt="User uploaded post media"
									loading="lazy"
									className="mb-3 w-full rounded-md border border-card-border object-cover"
								/>
							) : null}
							<div className="flex flex-wrap items-center gap-2">
								{REACTION_KEYS.map((reactionKey) => {
									const active = post.reactionByMe === reactionKey;
									return (
										<AppButton
											key={reactionKey}
											type="button"
											size="xs"
											aria-pressed={active}
											onClick={() => onReactToPost(post.id, reactionKey)}
											className={active ? "ring-2 ring-teal-300/60 dark:ring-teal-400/60" : undefined}
										>
											{REACTION_LABELS[reactionKey]} • {post.reactions[reactionKey]}
										</AppButton>
									);
								})}
								<span className="text-xs text-muted">{totalReactions} total reactions</span>
							</div>
						</article>
					);
				})}
			</div>

			<div ref={sentinelRef} className="h-8" />
			{isLoadingMore && <p className="text-sm text-muted">Loading more posts...</p>}
			{!hasMore && !isLoadingMore && posts.length > 0 && <p className="text-sm text-muted">No more posts in the mock feed.</p>}
		</div>
	);
}
