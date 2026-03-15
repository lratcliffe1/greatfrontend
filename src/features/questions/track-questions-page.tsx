"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import type { Question, Track } from "@/content/questions";
import { FilterSelect } from "@/components/ui/filter-select";
import { DifficultyPill, ElevatedCard, MutedText, StatusBadge } from "@/components/ui/tailwind-primitives";
import { useAppDispatch } from "@/lib/store/hooks";
import { setCategory, setDifficulty, setSearch, setStatus } from "@/lib/store/filtersSlice";
import { TrackTabs } from "@/components/track-tabs";
import { getTrackLabel } from "@/lib/tracks";
import { prefetchSolutionRenderer } from "@/features/questions/solution-registry";
import { QUESTION_UI_CLASSES, SourcePromptLink } from "@/features/questions/question-ui";
import { useFilterSync } from "@/features/questions/use-url-filters";
import { DIFFICULTY_OPTIONS, STATUS_OPTIONS } from "@/lib/constants/filters";

const SEARCH_DEBOUNCE_MS = 150;

function getUniqueCategories(questions: Question[]) {
	return Array.from(new Set(questions.map((question) => question.category))).sort();
}

export function TrackQuestionsPage({ track, questions }: { track: Track; questions: Question[] }) {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { effectiveSearch, effectiveCategory, effectiveStatus, effectiveDifficulty } = useFilterSync(track);

	// Local state for search input so typing feels instant (good INP); debounce Redux updates.
	const [searchInput, setSearchInput] = useState(effectiveSearch);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setSearchInput(effectiveSearch);
	}, [effectiveSearch]);

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
				question.tags.some((tag) => tag.toLowerCase().includes(effectiveSearch.toLowerCase()));
			const matchesCategory = track === "blind75" || effectiveCategory === "all" || question.category === effectiveCategory;
			const matchesStatus = effectiveStatus === "all" || question.status === effectiveStatus;
			const matchesDifficulty = effectiveDifficulty === "all" || question.difficulty === effectiveDifficulty;

			return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
		});
	}, [effectiveCategory, effectiveDifficulty, effectiveSearch, effectiveStatus, questions, track]);

	const completedCount = filtered.filter((question) => question.status === "done").length;

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
				<div className="grid min-w-0 max-w-full grid-cols-1 basis-full shrink-0 gap-3 min-[400px]:grid-cols-2 min-[712px]:ml-auto min-[712px]:basis-auto min-[900px]:grid-cols-4 sm:gap-4">
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
				{filtered.map((question) => (
					<ElevatedCard
						key={question.id}
						data-testid={`question-card-${question.path}`}
						className="flex h-full min-w-0 flex-col overflow-hidden p-3 sm:p-4"
						onMouseEnter={() => {
							prefetchSolutionRenderer(question);
							if (question.status === "done") {
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
							<div className="mb-3 flex flex-wrap items-center gap-1.5 text-[10px] sm:mb-4 sm:gap-2 sm:text-xs">
								<span className={QUESTION_UI_CLASSES.mutedText}>{question.category}</span>
								<span className={QUESTION_UI_CLASSES.mutedText}>•</span>
								<span className={QUESTION_UI_CLASSES.mutedText}>{question.solutionType}</span>
								<span className={QUESTION_UI_CLASSES.mutedText}>•</span>
								<StatusBadge status={question.status} />
							</div>
							<div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
								{question.status === "done" ? (
									<Link
										href={`/${track}/${question.path}`}
										data-testid={`open-solution-${question.path}`}
										className="inline-flex items-center rounded-md bg-teal-600 px-2.5 py-1 font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-teal-500 dark:hover:bg-teal-400 dark:focus-visible:ring-teal-400 sm:px-3 sm:py-1.5"
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
		</section>
	);
}
