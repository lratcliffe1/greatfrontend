import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PortfolioHero } from "@/components/portfolio-hero";
import type { Track } from "@/content/questions";
import { getQuestionsByTrack } from "@/content/questions";
import { TrackQuestionsPage } from "@/features/questions/track-questions-page";
import { getTrackLabel, isTrack } from "@/lib/tracks";

const STATIC_TRACKS: Track[] = ["gfe75", "blind75"];

export const dynamicParams = false;

export function generateStaticParams() {
	return STATIC_TRACKS.map((track) => ({ track }));
}

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }): Promise<Metadata> {
	const { track } = await params;
	if (!isTrack(track)) {
		return { title: "Not Found" };
	}
	const label = getTrackLabel(track);
	return {
		title: `${label} | GreatFrontEnd Portfolio`,
		description: `Interview solutions for ${label} in React + TypeScript`,
	};
}

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
	const { track } = await params;

	if (!isTrack(track)) {
		notFound();
	}

	const questions = getQuestionsByTrack(track);

	return (
		<div className="space-y-6">
			<PortfolioHero />
			<TrackQuestionsPage key={track} track={track} questions={questions} />
		</div>
	);
}
