"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
	Alert,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
} from "@mui/material";

import type { Question, Track } from "@/content/questions";
import {
	DifficultyPill,
	ElevatedCard,
	MutedText,
	StatusBadge,
} from "@/components/ui/tailwind-primitives";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCategory, setSearch, setStatus } from "@/lib/store/filtersSlice";
import {
	selectCategory,
	selectSearch,
	selectStatus,
} from "@/lib/store/selectors";
import { TrackTabs } from "@/components/track-tabs";
import { getTrackLabel } from "@/lib/tracks";
import {
	QUESTION_UI_CLASSES,
	SourcePromptLink,
} from "@/features/questions/question-ui";
import { useQuestionsQuery } from "@/lib/graphql/api";

function getUniqueCategories(questions: Question[]) {
	return Array.from(
		new Set(questions.map((question) => question.category)),
	).sort();
}

export function TrackQuestionsPage({ track }: { track: Track }) {
	const dispatch = useAppDispatch();
	const search = useAppSelector(selectSearch);
	const category = useAppSelector(selectCategory);
	const status = useAppSelector(selectStatus);
	const {
		data: questions = [],
		error,
		isLoading,
	} = useQuestionsQuery({ track }, { skip: !track });

	const errorMessage =
		error && typeof error === "object" && "message" in error
			? String((error as { message: unknown }).message)
			: error
				? "Failed to load questions"
				: null;

	const categories = useMemo(() => getUniqueCategories(questions), [questions]);

	const filtered = useMemo(() => {
		return questions.filter((question) => {
			const matchesSearch =
				search.length === 0 ||
				String(question.questionNumber).startsWith(search.trim()) ||
				question.title.toLowerCase().includes(search.toLowerCase()) ||
				question.tags.some((tag) =>
					tag.toLowerCase().includes(search.toLowerCase()),
				);
			const matchesCategory =
				track === "blind75" ||
				category === "all" ||
				question.category === category;
			const matchesStatus = status === "all" || question.status === status;

			return matchesSearch && matchesCategory && matchesStatus;
		});
	}, [questions, search, category, status, track]);

	const completedCount = questions.filter(
		(question) => question.status === "done",
	).length;

	return (
		<section className="min-w-0">
			<div className="mb-5 flex min-w-0 flex-wrap items-end gap-3 sm:gap-4">
				<TrackTabs />
				<div className="min-w-0">
					<h2 className="truncate text-lg font-bold text-foreground sm:text-xl md:text-2xl">
						{getTrackLabel(track)}
					</h2>
				</div>
				<p
					className={`basis-full text-xs sm:basis-auto sm:text-sm ${QUESTION_UI_CLASSES.mutedText}`}
				>
					{completedCount}/{questions.length} complete
				</p>
				<div className="flex min-w-0 max-w-full shrink-0 flex-wrap items-end gap-3 min-[1330px]:ml-auto">
					{track !== "blind75" && (
						<FormControl
							size="small"
							fullWidth
							disabled={isLoading}
							className="order-1 min-[1330px]:order-2 sm:w-auto sm:min-w-35"
						>
							<InputLabel id="category-label">Category</InputLabel>
							<Select
								labelId="category-label"
								label="Category"
								value={isLoading ? "all" : category}
								onChange={(event) =>
									dispatch(setCategory(event.target.value))
								}
							>
								<MenuItem value="all">All</MenuItem>
								{!isLoading &&
									categories.map((cat) => (
										<MenuItem key={cat} value={cat}>
											{cat}
										</MenuItem>
									))}
							</Select>
						</FormControl>
					)}
					<FormControl
						size="small"
						fullWidth
						disabled={isLoading}
						className="order-2 min-[1330px]:order-3 sm:w-auto sm:min-w-30"
					>
						<InputLabel id="status-label">Status</InputLabel>
						<Select
							labelId="status-label"
							label="Status"
							value={isLoading ? "all" : status}
							onChange={(event) =>
								dispatch(
									setStatus(
										event.target.value as Question["status"] | "all",
									),
								)
							}
						>
							<MenuItem value="all">All</MenuItem>
							{!isLoading && (
								[
									<MenuItem key="todo" value="todo">Todo</MenuItem>,
									<MenuItem key="in-progress" value="in-progress">In progress</MenuItem>,
									<MenuItem key="done" value="done">Done</MenuItem>,
								]
							)}
						</Select>
					</FormControl>
					<div className="group order-3 min-w-0 max-w-65 basis-full min-[1330px]:order-1 min-[1330px]:max-w-none min-[1330px]:basis-auto min-[1330px]:min-w-45">
						<div className="relative w-fit px-1 translate-x-2.5 translate-y-3 bg-background">
							<label
								htmlFor="search-questions"
								className="mb-1 block text-xs text-muted group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400"
							>
								Search questions
							</label>
						</div>
						<input
							id="search-questions"
							type="search"
							value={search}
							onChange={(event) =>
								dispatch(setSearch(event.target.value))
							}
							disabled={isLoading}
							className="w-full min-w-0 max-w-full rounded border border-card-border bg-background px-3 py-2 text-xs text-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:opacity-60 dark:focus:border-teal-500 dark:focus:ring-teal-500 sm:text-sm"
						/>
					</div>
				</div>
			</div>

			{errorMessage && <Alert severity="error">{errorMessage}</Alert>}

			{isLoading ? (
				<p className={QUESTION_UI_CLASSES.mutedText}>Loading questions...</p>
			) : (
				<div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
					{filtered.map((question) => (
						<ElevatedCard
							key={question.id}
							className="min-w-0 overflow-hidden p-3 sm:p-4"
						>
							<div className="mb-1.5 flex min-w-0 items-start justify-between gap-2 sm:mb-2 sm:gap-3">
								<h3 className="min-w-0 wrap-break-word text-sm font-semibold text-foreground sm:text-base">
									#{question.questionNumber} {question.title}
								</h3>
								<DifficultyPill difficulty={question.difficulty} />
							</div>
							<MutedText className="mb-2 text-xs wrap-break-word sm:mb-3 sm:text-sm">
								{question.summary}
							</MutedText>
							<div className="mb-3 flex flex-wrap items-center gap-1.5 text-[10px] sm:mb-4 sm:gap-2 sm:text-xs">
								<span className={QUESTION_UI_CLASSES.mutedText}>
									{question.category}
								</span>
								<span className={QUESTION_UI_CLASSES.mutedText}>•</span>
								<span className={QUESTION_UI_CLASSES.mutedText}>
									{question.solutionType}
								</span>
								<span className={QUESTION_UI_CLASSES.mutedText}>•</span>
								<StatusBadge status={question.status} />
							</div>
							<div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
								{question.status === "done" ? (
									<Link
										href={`/${track}/${question.slug}`}
										className="inline-flex items-center rounded-md bg-teal-600 px-2.5 py-1 font-semibold text-white transition hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 sm:px-3 sm:py-1.5"
									>
										Open solution
									</Link>
								) : (
									<span
										className="inline-flex cursor-not-allowed items-center rounded-md border border-card-border px-2.5 py-1 font-semibold opacity-50 [background:var(--card-bg)] [color:var(--muted)] sm:px-3 sm:py-1.5"
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
						</ElevatedCard>
					))}
				</div>
			)}
		</section>
	);
}
