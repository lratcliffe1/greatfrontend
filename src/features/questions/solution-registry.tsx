"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { Question } from "@/content/questions";
import { QUESTION_UI_CLASSES } from "@/features/questions/question-ui";
import { SOLUTION_RENDERER_LOADERS } from "@/solutions/renderer-loaders";

type SolutionComponent = ComponentType;
function SolutionLoadingState() {
	return (
		<div className={`rounded-md bg-slate-50 p-3 text-sm ${QUESTION_UI_CLASSES.bodyText}`}>
			<p>Loading solution component...</p>
		</div>
	);
}

const DYNAMIC_RENDERER_CACHE = new Map<string, SolutionComponent>();

function isRunnableSolutionType(solutionType: Question["solutionType"]) {
	return solutionType === "algo_visualizer" || solutionType === "ui_demo";
}

export function getSolutionRenderer(question: Question): SolutionComponent | null {
	if (!isRunnableSolutionType(question.solutionType)) {
		return null;
	}

	if (question.status !== "done") {
		return null;
	}

	const rendererKey = `${question.track}/${question.path}` as keyof typeof SOLUTION_RENDERER_LOADERS;
	const cachedRenderer = DYNAMIC_RENDERER_CACHE.get(rendererKey);
	if (cachedRenderer) {
		return cachedRenderer;
	}

	const loader = SOLUTION_RENDERER_LOADERS[rendererKey];
	if (!loader) {
		return null;
	}

	const renderer = dynamic(loader, {
		loading: SolutionLoadingState,
	});
	DYNAMIC_RENDERER_CACHE.set(rendererKey, renderer);

	return renderer;
}
