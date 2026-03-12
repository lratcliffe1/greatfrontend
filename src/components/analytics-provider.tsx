"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { analyticsBeforeSend } from "@/lib/analytics";
import { reportWebVitals } from "@/lib/web-vitals-report";

export function AnalyticsProvider() {
	useEffect(() => {
		reportWebVitals();
	}, []);

	return (
		<>
			<Analytics beforeSend={analyticsBeforeSend} />
			<SpeedInsights />
		</>
	);
}
