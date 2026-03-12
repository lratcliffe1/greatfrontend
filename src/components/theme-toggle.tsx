"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme-context";

function SunIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
			<circle cx="12" cy="12" r="5" />
			<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
		</svg>
	);
}

function MoonIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	);
}

export function ThemeToggle() {
	const [mounted, setMounted] = useState(false);
	const { resolvedMode, setPreference } = useTheme();
	const isDark = resolvedMode === "dark";

	useEffect(() => {
		queueMicrotask(() => setMounted(true));
	}, []);

	if (!mounted) {
		return (
			<div className="size-9 rounded-md p-2" aria-hidden>
				<MoonIcon className="size-5 text-muted" />
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setPreference(isDark ? "light" : "dark")}
			className="rounded-md p-2 text-muted transition hover:bg-card-border hover:text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-background"
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
		>
			{isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
		</button>
	);
}
