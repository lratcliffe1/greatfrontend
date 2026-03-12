import Link from "next/link";

import type { Track } from "@/content/questions";
import { getTrackLabel } from "@/lib/tracks";

export function AppHeader() {
	const tracks: Track[] = ["gfe75", "blind75"];

	return (
		<header className="border-b [background:var(--card-bg)] border-card-border">
			<div className="flex w-full flex-col gap-4 px-8 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-12 md:px-16 lg:px-20 xl:px-24">
				<div className="min-w-0 shrink-0">
					<p className="text-sm font-semibold text-link">Liam&apos;s Portfolio</p>
					<h1 className="text-base font-bold text-foreground sm:text-lg">GreatFrontEnd Practice Hub</h1>
				</div>
				<nav className="flex shrink-0 items-center gap-2">
					{tracks.map((track) => {
						const href = `/${track}`;
						return (
							<Link
								key={track}
								href={href}
								className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
							>
								{getTrackLabel(track)}
							</Link>
						);
					})}
				</nav>
			</div>
		</header>
	);
}
