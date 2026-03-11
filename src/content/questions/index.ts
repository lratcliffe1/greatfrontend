import type { Question, Track } from "./types";
import { BLIND75_QUESTIONS } from "./blind75";
import { GFE75_QUESTIONS } from "./gfe75";

export type { Question, QuestionStatus, SolutionType, Track } from "./types";

export const QUESTIONS: Question[] = [...GFE75_QUESTIONS, ...BLIND75_QUESTIONS];

export function getQuestionsByTrack(track: Track): Question[] {
	return QUESTIONS.filter((question) => question.track === track);
}

export function getQuestionBySlug(track: Track, slug: string): Question | null {
	return (
		QUESTIONS.find(
			(question) => question.track === track && question.slug === slug,
		) ?? null
	);
}
