"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Track } from "@/content/questions";
import { getTrackLabel } from "@/lib/tracks";

export function TrackTabs() {
	const pathname = usePathname();

	const tabs: Track[] = ["gfe75", "blind75"];

	return (
		<div className="flex gap-2" data-testid="track-tabs">
			{tabs.map((track) => {
				const href = `/${track}`;
				const active = pathname?.startsWith(href) ?? false;
				return (
					<Link
						key={track}
						href={href}
						data-testid={`track-tab-${track}`}
						className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
							active
								? "bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
								: "[background:var(--card-bg)] text-foreground hover:[background:var(--surface)]"
						}`}
					>
						{getTrackLabel(track)}
					</Link>
				);
			})}
		</div>
	);
}
