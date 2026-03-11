"use client";

import Link from "next/link";
import type { Question } from "@/content/questions";
import { MutedText, SurfacePanel } from "@/components/ui/tailwind-primitives";
import { BalancedBracketsVisualizer } from "@/solutions/blind-balanced-brackets/visualizer";
import { DebounceVisualizer } from "@/solutions/gfe-debounce/visualizer";
import { NewsFeedDemo } from "@/solutions/gfe-news-feed/news-feed-demo";
import { StorageComparisonDemo } from "@/solutions/gfe-storage-quiz/storage-demo";
import { TodoDemo } from "@/solutions/gfe-todo-list/todo-demo";
import { formatQuestionStatus } from "@/features/questions/helpers";
import {
	QUESTION_UI_CLASSES,
	SourcePromptLink,
} from "@/features/questions/question-ui";

function renderSolution(question: Question) {
	if (question.id === "gfe-debounce") {
		return <DebounceVisualizer />;
	}

	if (question.id === "gfe-news-feed") {
		return <NewsFeedDemo />;
	}

	if (question.id === "gfe-storage-quiz") {
		return <StorageComparisonDemo />;
	}

	if (question.solutionType === "ui-demo") {
		return <TodoDemo />;
	}

	if (question.solutionType === "algo-visualizer") {
		return <BalancedBracketsVisualizer />;
	}

	if (question.solutionType === "writeup") {
		return (
			<div className={`space-y-2 text-sm ${QUESTION_UI_CLASSES.bodyText}`}>
				<p>{question.approach}</p>
				<p>
					This writeup follows the guidance from the source prompt and captures
					practical tradeoffs for interview discussion.
				</p>
			</div>
		);
	}

	return (
		<div
			className={`rounded-md bg-slate-50 p-3 text-sm ${QUESTION_UI_CLASSES.bodyText}`}
		>
			<p>
				Code-first solution is implemented with unit tests. Open
				<code className="mx-1 rounded bg-slate-200 px-1 py-0.5">
					src/solutions
				</code>
				and
				<code className="mx-1 rounded bg-slate-200 px-1 py-0.5">
					src/solutions/**/*.test.ts
				</code>
				for details.
			</p>
		</div>
	);
}

export function QuestionDetailPage({ question }: { question: Question }) {
	return (
		<article className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0 space-y-1">
					<p className="text-sm font-semibold text-link">{question.category}</p>
					<h2 className="text-3xl font-bold text-foreground">
						#{question.questionNumber} {question.title}
					</h2>
					<MutedText>
						Difficulty: {question.difficulty} • Status:{" "}
						{formatQuestionStatus(question.status)}
					</MutedText>
				</div>
				<Link
					href={`/${question.track}`}
					className="shrink-0 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
				>
					Back to list
				</Link>
			</div>

			<SurfacePanel className="space-y-2">
				<h3 className={QUESTION_UI_CLASSES.panelHeading}>Problem summary</h3>
				<p className={QUESTION_UI_CLASSES.bodyText}>{question.summary}</p>
			</SurfacePanel>

			<SurfacePanel className="space-y-2">
				<h3 className={QUESTION_UI_CLASSES.panelHeading}>Approach</h3>
				<p className={QUESTION_UI_CLASSES.bodyText}>{question.approach}</p>
			</SurfacePanel>

			<SurfacePanel className="space-y-2">
				<h3 className={QUESTION_UI_CLASSES.panelHeading}>Runnable solution</h3>
				{renderSolution(question)}
			</SurfacePanel>

			<SurfacePanel className="space-y-2">
				<h3 className={QUESTION_UI_CLASSES.panelHeading}>
					Complexity / tradeoffs
				</h3>
				<p className={QUESTION_UI_CLASSES.bodyText}>{question.complexity}</p>
			</SurfacePanel>

			<SourcePromptLink
				sourceUrl={question.sourceUrl}
				linkLabel="Open original prompt"
				pendingLabel="Original prompt link pending."
				linkClassName={`inline-block ${QUESTION_UI_CLASSES.primaryLink}`}
				pendingClassName={`text-sm ${QUESTION_UI_CLASSES.mutedText}`}
			/>
		</article>
	);
}
