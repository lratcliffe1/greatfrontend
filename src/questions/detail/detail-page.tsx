"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { startTransition, useEffect, useState } from "react";

import { SolutionType, type Question } from "@/content/questions";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { DifficultyPill, PRIMARY_BUTTON_CLASSES, SurfacePanel } from "@/components/ui/tailwind-primitives";
import { QUESTION_UI_CLASSES, SourcePromptLink } from "@/questions/ui/question-ui";
import { getSolutionRenderer, hasSolutionRenderer } from "@/questions/solution-registry";

const FALLBACK_CLASS = `rounded-md bg-card-bg p-3 text-sm ${QUESTION_UI_CLASSES.bodyText}`;

function LazySolutionRenderer({ question }: { question: Question }) {
	const [Renderer, setRenderer] = useState<ComponentType | null>(null);

	useEffect(() => {
		const component = getSolutionRenderer(question);
		if (component) {
			const id = requestAnimationFrame(() => {
				startTransition(() => setRenderer(() => component));
			});
			return () => cancelAnimationFrame(id);
		}
	}, [question]);

	if (!Renderer) {
		return (
			<div className={FALLBACK_CLASS}>
				<p>Loading solution component...</p>
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<Renderer />
		</ErrorBoundary>
	);
}

function SolutionFallback({ question }: { question: Question }) {
	if (question.solutionType === SolutionType.AlgoVisualizer) {
		return (
			<div className={FALLBACK_CLASS}>
				<p>Interactive algorithm walkthrough is pending for this question.</p>
			</div>
		);
	}

	if (question.solutionType === SolutionType.Writeup) {
		return (
			<div className={`space-y-2 text-sm ${QUESTION_UI_CLASSES.bodyText}`}>
				<p>{question.approach}</p>
				<p>This writeup follows the guidance from the source prompt and captures practical tradeoffs for interview discussion.</p>
			</div>
		);
	}

	return (
		<div className={FALLBACK_CLASS}>
			<p>
				Code-first solution is implemented with unit tests. Open
				<code className="mx-1 rounded bg-surface px-1 py-0.5">src/solutions</code>
				and
				<code className="mx-1 rounded bg-surface px-1 py-0.5">src/solutions/**/*.test.ts</code>
				for details.
			</p>
		</div>
	);
}

function shouldShowComplexity(complexity: string) {
	const normalized = complexity.trim().toLowerCase();
	if (!normalized || normalized === "todo") return false;
	if (normalized === "conceptual question." || normalized === "conceptual question") {
		return false;
	}
	return true;
}

export function QuestionDetailPage({ question }: { question: Question }) {
	const showComplexity = shouldShowComplexity(question.complexity);

	return (
		<article className="space-y-6" data-testid="question-detail-page">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0 space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="inline-flex items-center text-sm font-semibold leading-none text-link">{question.category}</span>
						<span className="inline-flex items-center">
							<DifficultyPill difficulty={question.difficulty} />
						</span>
					</div>
					<h2 className="text-3xl font-bold text-foreground" data-testid="question-detail-title">
						#{question.questionNumber} {question.title}
					</h2>
				</div>
				<Link href={`/${question.track}`} data-testid="back-to-list-link" className={`shrink-0 ${PRIMARY_BUTTON_CLASSES}`}>
					Back to list
				</Link>
			</div>

			<SurfacePanel className="space-y-2" data-testid="question-summary-panel">
				<h3 className={QUESTION_UI_CLASSES.panelHeading}>Problem summary</h3>
				<p className={`${QUESTION_UI_CLASSES.bodyText} text-[8px] leading-relaxed whitespace-pre-line sm:text-xs`}>{question.summary}</p>
			</SurfacePanel>

			<SurfacePanel className="space-y-2">
				<h3 className={QUESTION_UI_CLASSES.panelHeading}>Approach</h3>
				<p className={`${QUESTION_UI_CLASSES.bodyText} text-[8px] leading-relaxed whitespace-pre-line sm:text-xs`}>{question.approach}</p>
			</SurfacePanel>

			<SurfacePanel className="space-y-2">
				<h3 className={QUESTION_UI_CLASSES.panelHeading}>Runnable solution</h3>
				{hasSolutionRenderer(question) ? <LazySolutionRenderer question={question} /> : <SolutionFallback question={question} />}
			</SurfacePanel>

			{showComplexity ? (
				<SurfacePanel className="space-y-2">
					<h3 className={QUESTION_UI_CLASSES.panelHeading}>Complexity / tradeoffs</h3>
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
