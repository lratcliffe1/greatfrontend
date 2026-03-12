"use client";

import { onINP, type Metric } from "web-vitals";

const INP_THRESHOLD_GOOD_MS = 200;
const INP_THRESHOLD_POOR_MS = 500;

function handleReport(metric: Metric) {
	// Log in development for debugging INP
	if (process.env.NODE_ENV === "development" && metric.name === "INP") {
		const rating = metric.value <= INP_THRESHOLD_GOOD_MS ? "good" : metric.value <= INP_THRESHOLD_POOR_MS ? "needs improvement" : "poor";
		console.log(`[INP] ${metric.value.toFixed(0)} ms (${rating})`, metric);
	}
	// Extend here to send to your analytics (e.g. Vercel Analytics custom event)
}

export function reportWebVitals() {
	// reportAllChanges: true so INP is logged whenever it updates (e.g. after each interaction),
	// not only on page unload/hide. Makes it visible in the console while developing.
	onINP(handleReport, { reportAllChanges: true });
}
