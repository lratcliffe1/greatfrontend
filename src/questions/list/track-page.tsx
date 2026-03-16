"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { QuestionStatus, Track, type Question } from "@/content/questions";
import { FilterSelect } from "@/components/ui/filter-select";
import { DifficultyPill, ElevatedCard, MutedText, StatusBadge } from "@/components/ui/tailwind-primitives";
import { useAppDispatch } from "@/lib/store/hooks";
import { setCategory, setDifficulty, setSearch, setStatus } from "@/lib/store/filtersSlice";
import { TrackTabs } from "@/components/layout/track-tabs";
import { getTrackLabel } from "@/lib/constants";
import { getUniqueCategories } from "@/questions/helpers";
import { prefetchSolutionRenderer } from "@/questions/solution-registry";
import { QUESTION_UI_CLASSES, SourcePromptLink } from "@/questions/ui/question-ui";
import { useFilterSync } from "@/questions/hooks/use-url-filters";
import { DIFFICULTY_OPTIONS, STATUS_OPTIONS } from "@/lib/constants/filters";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants/ui";

const INITIAL_VISIBLE = 10;
const LOAD_MORE_BATCH = 10;

export function TrackQuestionsPage({ track, questions }: { track: Track; questions: Question[] }) {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { effectiveSearch, effectiveCategory, effectiveStatus, effectiveDifficulty } = useFilterSync(track);

	// Local state for search input so typing feels instant (good INP); debounce Redux updates.
	const [searchInput, setSearchInput] = useState(effectiveSearch);
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setSearchInput(effectiveSearch);
	}, [effectiveSearch]);

	useEffect(() => {
		setVisibleCount(INITIAL_VISIBLE);
	}, [effectiveSearch, effectiveCategory, effectiveStatus, effectiveDifficulty, track]);

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, []);

	const handleSearchChange = (value: string) => {
		setSearchInput(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			debounceRef.current = null;
			dispatch(setSearch({ track, value }));
		}, SEARCH_DEBOUNCE_MS);
	};

	const categories = useMemo(() => getUniqueCategories(questions), [questions]);

	const filtered = useMemo(() => {
		return questions.filter((question) => {
			const matchesSearch =
				effectiveSearch.length === 0 ||
				String(question.questionNumber).startsWith(effectiveSearch.trim()) ||
				question.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
				question.solutionTypes.some((t) => t.toLowerCase().includes(effectiveSearch.toLowerCase()));
			const matchesCategory = track === Track.Blind75 || effectiveCategory === "all" || question.category === effectiveCategory;
			const matchesStatus = effectiveStatus === "all" || question.status === effectiveStatus;
			const matchesDifficulty = effectiveDifficulty === "all" || question.difficulty === effectiveDifficulty;

			return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
		});
	}, [effectiveCategory, effectiveDifficulty, effectiveSearch, effectiveStatus, questions, track]);

	const loadMore = useCallback(() => {
		setVisibleCount((prev) => Math.min(prev + LOAD_MORE_BATCH, filtered.length));
	}, [filtered.length]);

	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || visibleCount >= filtered.length) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) loadMore();
			},
			{ rootMargin: "100% 0px" },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [visibleCount, filtered.length, loadMore]);

	const completedCount = filtered.filter((question) => question.status === QuestionStatus.Done).length;

	return (
		<section className="min-w-0" data-testid={`track-page-${track}`}>
			<div className="mb-5 flex min-w-0 flex-wrap items-end gap-3 sm:gap-4">
				<TrackTabs />
				<div className="min-w-0">
					<h2 data-testid={`track-heading-${track}`} className="truncate text-lg font-bold text-foreground sm:text-xl md:text-2xl">
						{getTrackLabel(track)}
					</h2>
				</div>
				<p
					data-testid="track-progress"
					className={`basis-full text-xs sm:basis-auto sm:text-sm ${QUESTION_UI_CLASSES.mutedText}`}
					aria-live="polite"
					aria-atomic="true"
				>
					{completedCount}/{filtered.length} complete
				</p>
				<div
					className={`grid min-w-0 max-w-full basis-full shrink-0 gap-3 min-[400px]:ml-auto min-[400px]:basis-auto min-[400px]:w-fit min-[400px]:grid-cols-2 sm:gap-4 ${
						track === Track.Blind75 ? "min-[900px]:grid-cols-[1fr_1fr_minmax(0,1fr)]" : "min-[900px]:grid-cols-[1fr_1fr_1fr_minmax(0,1fr)]"
					}`}
				>
					{track !== "blind75" && (
						<FilterSelect
							id="category-label"
							label="Category"
							ariaLabel="Filter by category"
							value={effectiveCategory}
							onChange={(value) =>
								startTransition(() => {
									dispatch(setCategory({ track, value }));
								})
							}
							options={categories.map((cat) => ({ value: cat, label: cat }))}
							dataTestId="filter-category"
						/>
					)}
					<FilterSelect
						id="difficulty-label"
						label="Difficulty"
						ariaLabel="Filter by difficulty"
						value={effectiveDifficulty}
						onChange={(value) =>
							startTransition(() => {
								dispatch(setDifficulty({ track, value }));
							})
						}
						options={DIFFICULTY_OPTIONS}
						dataTestId="filter-difficulty"
					/>
					<FilterSelect
						id="status-label"
						label="Status"
						ariaLabel="Filter by status"
						value={effectiveStatus}
						onChange={(value) =>
							startTransition(() => {
								dispatch(setStatus({ track, value }));
							})
						}
						options={STATUS_OPTIONS}
						dataTestId="filter-status"
					/>
					<div className="group min-w-0" role="search" aria-labelledby="search-questions-label">
						<div className="w-fit px-1 bg-background">
							<label
								id="search-questions-label"
								htmlFor="search-questions"
								className="mb-1 block text-xs text-muted group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400"
							>
								Search questions
							</label>
						</div>
						<input
							id="search-questions"
							type="search"
							data-testid="filter-search"
							value={searchInput}
							onChange={(event) => handleSearchChange(event.target.value)}
							className="w-full min-w-0 max-w-full rounded border border-card-border bg-background px-3 py-2 text-xs text-foreground focus:border-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus:border-teal-500 dark:focus-visible:ring-teal-500 sm:text-sm"
						/>
					</div>
				</div>
			</div>

			<div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2" data-testid="question-grid">
				{filtered.slice(0, visibleCount).map((question) => (
					<ElevatedCard
						key={question.id}
						data-testid={`question-card-${question.path}`}
						className="flex h-full min-w-0 flex-col overflow-hidden p-3 sm:p-4"
						onMouseEnter={() => {
							prefetchSolutionRenderer(question);
							if (question.status === QuestionStatus.Done) {
								router.prefetch(`/${track}/${question.path}`);
							}
						}}
					>
						<div className="mb-1.5 flex min-w-0 items-start justify-between gap-2 sm:mb-2 sm:gap-3">
							<h3
								data-testid={`question-title-${question.path}`}
								className="min-w-0 wrap-break-word text-sm font-semibold text-foreground sm:text-base"
							>
								#{question.questionNumber} {question.title}
							</h3>
							<DifficultyPill difficulty={question.difficulty} />
						</div>
						<MutedText className="text-xs wrap-break-word sm:text-sm">{question.cardSummary}</MutedText>
						<div className="mt-auto pt-3 sm:pt-4">
							<div className="mb-3 flex flex-col gap-1 text-[10px] sm:mb-4 sm:gap-1.5 sm:text-xs">
								<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
									<span className={`font-semibold ${QUESTION_UI_CLASSES.mutedText}`}>{question.category}</span>
									<StatusBadge status={question.status} />
								</div>
								<div className={`text-[10px] sm:text-[11px] ${QUESTION_UI_CLASSES.mutedText}`}>{question.solutionTypes.join(" • ")}</div>
							</div>
							<div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
								{question.status === QuestionStatus.Done ? (
									<Link
										href={`/${track}/${question.path}`}
										data-testid={`open-solution-${question.path}`}
										className="inline-flex items-center rounded-md bg-teal-700 px-2.5 py-1 font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus-visible:ring-teal-500 sm:px-3 sm:py-1.5"
									>
										Open solution
									</Link>
								) : (
									<span
										className="inline-flex cursor-not-allowed items-center rounded-md border border-card-border px-2.5 py-1 font-semibold opacity-50 [background:var(--card-bg)] text-muted sm:px-3 sm:py-1.5"
										aria-disabled="true"
									>
										Open solution
									</span>
								)}
								<SourcePromptLink
									sourceUrl={question.sourceUrl}
									linkLabel="Original prompt"
									pendingLabel="Prompt link pending"
									linkClassName={QUESTION_UI_CLASSES.primaryLink}
									pendingClassName={QUESTION_UI_CLASSES.mutedText}
								/>
							</div>
						</div>
					</ElevatedCard>
				))}
			</div>
			<div ref={sentinelRef} className="h-8" aria-hidden="true" />
			{visibleCount < filtered.length && (
				<p className="mt-3 text-xs text-muted" aria-live="polite">
					Showing {visibleCount} of {filtered.length} — scroll for more
				</p>
			)}
		</section>
	);
}
