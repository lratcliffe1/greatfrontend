"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { Question } from "@/content/questions";
import { QUESTION_UI_CLASSES } from "@/features/questions/question-ui";

type SolutionComponent = ComponentType;

function SolutionLoadingState() {
	return (
		<div
			className={`rounded-md bg-slate-50 p-3 text-sm ${QUESTION_UI_CLASSES.bodyText}`}
		>
			<p>Loading solution component...</p>
		</div>
	);
}

const DebounceVisualizer = dynamic(
	() =>
		import("@/solutions/gfe-debounce/visualizer").then(
			(module) => module.DebounceVisualizer,
		),
	{
		loading: SolutionLoadingState,
	},
);

const NewsFeedDemo = dynamic(
	() =>
		import("@/solutions/gfe-news-feed/news-feed-demo").then(
			(module) => module.NewsFeedDemo,
		),
	{
		loading: SolutionLoadingState,
	},
);

const StorageComparisonDemo = dynamic(
	() =>
		import("@/solutions/gfe-storage-quiz/storage-demo").then(
			(module) => module.StorageComparisonDemo,
		),
	{
		loading: SolutionLoadingState,
	},
);

const BalancedBracketsVisualizer = dynamic(
	() =>
		import("@/solutions/blind-balanced-brackets/visualizer").then(
			(module) => module.BalancedBracketsVisualizer,
		),
	{
		loading: SolutionLoadingState,
	},
);

const FindDuplicatesInArrayVisualizer = dynamic(
	() =>
		import("@/solutions/blind-find-duplicates-in-array/visualizer").then(
			(module) => module.FindDuplicatesInArrayVisualizer,
		),
	{
		loading: SolutionLoadingState,
	},
);

const TodoDemo = dynamic(
	() =>
		import("@/solutions/gfe-todo-list/todo-demo").then(
			(module) => module.TodoDemo,
		),
	{
		loading: SolutionLoadingState,
	},
);

const QUESTION_RENDERERS: Partial<Record<Question["id"], SolutionComponent>> = {
	"gfe-debounce": DebounceVisualizer,
	"gfe-news-feed": NewsFeedDemo,
	"gfe-storage-quiz": StorageComparisonDemo,
	"blind-balanced-brackets": BalancedBracketsVisualizer,
	"blind-find-duplicates-in-array": FindDuplicatesInArrayVisualizer,
};

const SOLUTION_TYPE_RENDERERS: Partial<
	Record<Question["solutionType"], SolutionComponent>
> = {
	"ui-demo": TodoDemo,
};

export function getSolutionRenderer(
	question: Question,
): SolutionComponent | null {
	return (
		QUESTION_RENDERERS[question.id] ??
		SOLUTION_TYPE_RENDERERS[question.solutionType] ??
		null
	);
}
