import type { BeforeSend } from "@vercel/analytics/next";

let lastTrackedPathname: string | null = null;

function toUrl(url: string): URL | null {
	try {
		const base = typeof window !== "undefined" ? window.location.origin : "https://analytics.local";
		return new URL(url, base);
	} catch {
		return null;
	}
}

function normalizePathname(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}
	return pathname;
}

function isInternalPath(pathname: string): boolean {
	return pathname.startsWith("/_next") || pathname.startsWith("/_vercel") || pathname.startsWith("/api/");
}

export const analyticsBeforeSend: BeforeSend = (event) => {
	const parsedUrl = toUrl(event.url);
	if (!parsedUrl) {
		return event;
	}

	const pathname = normalizePathname(parsedUrl.pathname || "/");

	if (isInternalPath(pathname)) {
		return null;
	}

	if (event.type === "pageview") {
		// Filters sync to query params via replaceState; ignore repeated views on the same pathname.
		if (pathname === lastTrackedPathname) {
			return null;
		}
		lastTrackedPathname = pathname;
	}

	parsedUrl.pathname = pathname;
	parsedUrl.search = "";
	parsedUrl.hash = "";

	return { ...event, url: parsedUrl.toString() };
};
