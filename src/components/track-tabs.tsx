"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { Track } from "@/content/questions";
import { PRIMARY_BUTTON_CLASSES } from "@/components/ui/tailwind-primitives";
import { getTrackLabel } from "@/lib/tracks";

export function TrackTabs() {
	const tabs: Track[] = ["gfe75", "blind75"];
	const searchParams = useSearchParams();
	const search = searchParams?.toString() ?? "";

	return (
		<div className="flex gap-2" data-testid="track-tabs">
			{tabs.map((track) => {
				const href = `/${track}${search ? `?${search}` : ""}`;
				return (
					<Link key={track} href={href} data-testid={`track-tab-${track}`} className={PRIMARY_BUTTON_CLASSES}>
						{getTrackLabel(track)}
					</Link>
				);
			})}
		</div>
	);
}
