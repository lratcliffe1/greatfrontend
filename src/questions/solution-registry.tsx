"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import { QuestionStatus, type Question } from "@/content/questions";
import { QUESTION_UI_CLASSES } from "@/questions/ui/question-ui";
import { SOLUTION_RENDERER_LOADERS } from "@/solutions/renderer-loaders";

type SolutionComponent = ComponentType;

function getRendererKey(question: Question): string {
	return `${question.track}/${question.path}`;
}

function getLoader(question: Question) {
	if (question.status !== QuestionStatus.Done) return undefined;
	const key = getRendererKey(question);
	return key in SOLUTION_RENDERER_LOADERS ? SOLUTION_RENDERER_LOADERS[key as keyof typeof SOLUTION_RENDERER_LOADERS] : undefined;
}

/** True when question is done and has a loader registered for its track/path. */
export function isRunnableQuestion(question: Question): boolean {
	return getLoader(question) !== undefined;
}

/** Returns true if a solution renderer exists (without creating it). */
export function hasSolutionRenderer(question: Question): boolean {
	return getLoader(question) !== undefined;
}

const DYNAMIC_RENDERER_CACHE = new Map<string, SolutionComponent>();

function SolutionLoadingState() {
	return (
		<div className={`rounded-md bg-card-bg p-3 text-sm ${QUESTION_UI_CLASSES.bodyText}`}>
			<p>Loading solution component...</p>
		</div>
	);
}

export function getSolutionRenderer(question: Question): SolutionComponent | null {
	const loader = getLoader(question);
	if (!loader) return null;

	const key = getRendererKey(question);
	const cached = DYNAMIC_RENDERER_CACHE.get(key);
	if (cached) return cached;

	const renderer = dynamic(loader, { loading: SolutionLoadingState });
	DYNAMIC_RENDERER_CACHE.set(key, renderer);
	return renderer;
}

function shouldPrefetch(): boolean {
	if (typeof navigator === "undefined" || !("connection" in navigator)) return true;
	const conn = navigator.connection as { effectiveType?: string; saveData?: boolean } | undefined;
	if (!conn) return true;
	if (conn.saveData) return false;
	const slow = ["slow-2g", "2g"];
	return !conn.effectiveType || !slow.includes(conn.effectiveType);
}

/** Prefetch the solution chunk on hover so it loads faster when the user clicks. Skips on slow/metered connections. */
export function prefetchSolutionRenderer(question: Question): void {
	if (!shouldPrefetch() || !isRunnableQuestion(question)) return;
	const loader = getLoader(question);
	if (loader) loader();
}
