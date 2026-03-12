import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getQuestionByPath, QUESTIONS } from "@/content/questions";
import { QuestionDetailPage } from "@/features/questions/question-detail-page";
import { getTrackLabel, isTrack } from "@/lib/tracks";

export const dynamicParams = false;

export function generateStaticParams() {
	return QUESTIONS.map((question) => ({
		track: question.track,
		path: question.path,
	}));
}

export async function generateMetadata({ params }: { params: Promise<{ track: string; path: string }> }): Promise<Metadata> {
	const { track, path } = await params;
	if (!isTrack(track)) {
		return { title: "Not Found" };
	}
	const question = getQuestionByPath(track, path);
	if (!question) {
		return { title: "Question Not Found" };
	}
	const trackLabel = getTrackLabel(track);
	return {
		title: `${question.title} | ${trackLabel} | GreatFrontEnd Portfolio`,
		description: question.summary,
	};
}

export default async function QuestionPage({ params }: { params: Promise<{ track: string; path: string }> }) {
	const { track, path } = await params;

	if (!isTrack(track)) {
		notFound();
	}

	const question = getQuestionByPath(track, path);
	if (!question) {
		notFound();
	}

	return <QuestionDetailPage question={question} />;
}
