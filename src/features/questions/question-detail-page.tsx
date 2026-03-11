"use client";

import Link from "next/link";
import type { Question } from "@/content/questions";
import {
	DifficultyPill,
	SurfacePanel,
} from "@/components/ui/tailwind-primitives";
import {
	QUESTION_UI_CLASSES,
	SourcePromptLink,
} from "@/features/questions/question-ui";
import { getSolutionRenderer } from "@/features/questions/solution-registry";

function renderSolution(question: Question) {
	const SolutionRenderer = getSolutionRenderer(question);
	if (SolutionRenderer) {
		return <SolutionRenderer />;
	}

	if (question.solutionType === "algo-visualizer") {
		return (
			<div
				className={`rounded-md bg-slate-50 p-3 text-sm ${QUESTION_UI_CLASSES.bodyText}`}
			>
				<p>Interactive algorithm walkthrough is pending for this question.</p>
			</div>
		);
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

function shouldShowComplexity(complexity: string) {
	const normalized = complexity.trim().toLowerCase();
	if (!normalized || normalized === "todo") return false;
	if (
		normalized === "conceptual question." ||
		normalized === "conceptual question"
	) {
		return false;
	}
	return true;
}

export function QuestionDetailPage({ question }: { question: Question }) {
	const showComplexity = shouldShowComplexity(question.complexity);

	return (
		<article className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0 space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="inline-flex items-center text-sm font-semibold leading-none text-link">
							{question.category}
						</span>
						<span className="inline-flex items-center">
							<DifficultyPill difficulty={question.difficulty} />
						</span>
					</div>
					<h2 className="text-3xl font-bold text-foreground">
						#{question.questionNumber} {question.title}
					</h2>
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
				<p
					className={`${QUESTION_UI_CLASSES.bodyText} text-[8px] leading-relaxed whitespace-pre-line sm:text-xs`}
				>
					{question.summary}
				</p>
			</SurfacePanel>

			<SurfacePanel className="space-y-2">
				<h3 className={QUESTION_UI_CLASSES.panelHeading}>Approach</h3>
				<p
					className={`${QUESTION_UI_CLASSES.bodyText} text-[8px] leading-relaxed whitespace-pre-line sm:text-xs`}
				>
					{question.approach}
				</p>
			</SurfacePanel>

			<SurfacePanel className="space-y-2">
				<h3 className={QUESTION_UI_CLASSES.panelHeading}>Runnable solution</h3>
				{renderSolution(question)}
			</SurfacePanel>

			{showComplexity ? (
				<SurfacePanel className="space-y-2">
					<h3 className={QUESTION_UI_CLASSES.panelHeading}>
						Complexity / tradeoffs
					</h3>
					<p className={QUESTION_UI_CLASSES.bodyText}>{question.complexity}</p>
				</SurfacePanel>
			) : null}

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
