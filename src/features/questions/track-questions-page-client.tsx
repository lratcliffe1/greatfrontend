"use client";

import dynamic from "next/dynamic";

import type { Question, Track } from "@/content/questions";

type TrackQuestionsPageProps = {
	track: Track;
	questions: Question[];
};

const TrackQuestionsPageNoSSR = dynamic(
	() => import("@/features/questions/track-questions-page").then((mod) => mod.TrackQuestionsPage),
	{
		ssr: false,
		loading: () => <div className="text-sm text-muted">Loading questions...</div>,
	},
);

export function TrackQuestionsPageClient(props: TrackQuestionsPageProps) {
	return <TrackQuestionsPageNoSSR {...props} />;
}

