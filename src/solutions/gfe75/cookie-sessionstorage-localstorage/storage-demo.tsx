"use client";

import { useState } from "react";
import { AppButton } from "@/components/ui/tailwind-primitives";

const COOKIE_KEY = "gfe_cookie_demo";
const SESSION_KEY = "gfe_session_demo";
const LOCAL_KEY = "gfe_local_demo";

type ComparisonRow = {
	property: string;
	cookie: string;
	localStorage: string;
	sessionStorage: string;
};

const COMPARISON_ROWS: ComparisonRow[] = [
	{
		property: "Initiator",
		cookie: "Client or server (Set-Cookie)",
		localStorage: "Client JavaScript",
		sessionStorage: "Client JavaScript",
	},
	{
		property: "Lifespan",
		cookie: "Session or explicit expiry",
		localStorage: "Until removed",
		sessionStorage: "Until tab/session closes",
	},
	{
		property: "Sent with HTTP requests",
		cookie: "Yes",
		localStorage: "No",
		sessionStorage: "No",
	},
	{
		property: "Typical capacity",
		cookie: "~4KB",
		localStorage: "~5MB per origin",
		sessionStorage: "~5MB per origin",
	},
	{
		property: "Access scope",
		cookie: "Domain/path rules",
		localStorage: "Across same-origin tabs/windows",
		sessionStorage: "Current tab only",
	},
	{
		property: "Security highlight",
		cookie: "Can be HttpOnly/Secure/SameSite",
		localStorage: "JS-readable",
		sessionStorage: "JS-readable",
	},
];

function readCookie(name: string) {
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
	const encodedValue = match?.[1];
	return encodedValue ? decodeURIComponent(encodedValue) : null;
}

function setCookie(name: string, value: string) {
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400; SameSite=Lax`;
}

function clearCookie(name: string) {
	document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function StorageComparisonDemo() {
	const [cookieValue, setCookieValue] = useState<string | null>(() => {
		if (typeof window === "undefined") return null;
		return readCookie(COOKIE_KEY);
	});
	const [sessionValue, setSessionValue] = useState<string | null>(() => {
		if (typeof window === "undefined") return null;
		return sessionStorage.getItem(SESSION_KEY);
	});
	const [localValue, setLocalValue] = useState<string | null>(() => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(LOCAL_KEY);
	});

	function refreshValues() {
		if (typeof window === "undefined") return;
		setCookieValue(readCookie(COOKIE_KEY));
		setSessionValue(sessionStorage.getItem(SESSION_KEY));
		setLocalValue(localStorage.getItem(LOCAL_KEY));
	}

	return (
		<div className="space-y-5">
			<p className="text-sm text-foreground">
				Cookies, local storage, and session storage all store client-side string key/value data, but differ in request behavior, scope, lifetime, and
				security characteristics.
			</p>
			<p className="mt-2 text-xs text-muted">Use the table for interview framing, then try the live controls below.</p>

			<div className="overflow-x-auto rounded-md border border-card-border">
				<table className="min-w-190 w-full text-left text-xs sm:text-sm">
					<thead className="[background:var(--surface)]">
						<tr className="text-foreground">
							<th className="px-3 py-2 font-semibold">Property</th>
							<th className="px-3 py-2 font-semibold">Cookie</th>
							<th className="px-3 py-2 font-semibold">localStorage</th>
							<th className="px-3 py-2 font-semibold">sessionStorage</th>
						</tr>
					</thead>
					<tbody>
						{COMPARISON_ROWS.map((row) => (
							<tr key={row.property} className="border-t border-card-border">
								<th className="px-3 py-2 font-medium text-foreground">{row.property}</th>
								<td className="px-3 py-2 text-muted">{row.cookie}</td>
								<td className="px-3 py-2 text-muted">{row.localStorage}</td>
								<td className="px-3 py-2 text-muted">{row.sessionStorage}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<p className="text-sm text-muted">Set values and refresh/reopen tabs to observe persistence differences.</p>

			<div className="grid gap-4 md:grid-cols-3">
				<section className="rounded-md border border-card-border p-3 [background:var(--card-bg)]">
					<h4 className="font-semibold text-foreground">Cookie</h4>
					<p className="mt-1 text-sm text-muted">Sent with HTTP requests to matching domain/path.</p>
					<p className="mt-2 text-xs text-muted">Current: {cookieValue ?? "(empty)"}</p>
					<div className="mt-3 flex flex-wrap gap-2">
						<AppButton
							type="button"
							size="xs"
							onClick={() => {
								setCookie(COOKIE_KEY, `cookie-${Date.now()}`);
								refreshValues();
							}}
						>
							Set cookie
						</AppButton>
						<AppButton
							type="button"
							size="xs"
							variant="dangerSubtle"
							className="dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30"
							onClick={() => {
								clearCookie(COOKIE_KEY);
								refreshValues();
							}}
						>
							Clear
						</AppButton>
					</div>
				</section>

				<section className="rounded-md border border-card-border p-3 [background:var(--card-bg)]">
					<h4 className="font-semibold text-foreground">sessionStorage</h4>
					<p className="mt-1 text-sm text-muted">Tab-scoped storage; cleared when tab/session ends.</p>
					<p className="mt-2 text-xs text-muted">Current: {sessionValue ?? "(empty)"}</p>
					<div className="mt-3 flex flex-wrap gap-2">
						<AppButton
							type="button"
							size="xs"
							onClick={() => {
								sessionStorage.setItem(SESSION_KEY, `session-${Date.now()}`);
								refreshValues();
							}}
						>
							Set session
						</AppButton>
						<AppButton
							type="button"
							size="xs"
							variant="dangerSubtle"
							className="dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30"
							onClick={() => {
								sessionStorage.removeItem(SESSION_KEY);
								refreshValues();
							}}
						>
							Clear
						</AppButton>
					</div>
				</section>

				<section className="rounded-md border border-card-border p-3 [background:var(--card-bg)]">
					<h4 className="font-semibold text-foreground">localStorage</h4>
					<p className="mt-1 text-sm text-muted">Persistent browser storage (until manually cleared).</p>
					<p className="mt-2 text-xs text-muted">Current: {localValue ?? "(empty)"}</p>
					<div className="mt-3 flex flex-wrap gap-2">
						<AppButton
							type="button"
							size="xs"
							onClick={() => {
								localStorage.setItem(LOCAL_KEY, `local-${Date.now()}`);
								refreshValues();
							}}
						>
							Set local
						</AppButton>
						<AppButton
							type="button"
							size="xs"
							variant="dangerSubtle"
							className="dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30"
							onClick={() => {
								localStorage.removeItem(LOCAL_KEY);
								refreshValues();
							}}
						>
							Clear
						</AppButton>
					</div>
				</section>
			</div>

			<p className="font-semibold text-foreground pt-4">Practical guidance</p>
			<ul className="mt-2 space-y-1 text-muted">
				<li>Cookies are best for small server-relevant values (session IDs, server-read flags) and can use HttpOnly/Secure/SameSite attributes.</li>
				<li>Local Storage fits persistent client preferences such as theme and layout state.</li>
				<li>Session Storage fits temporary tab-local state such as in-progress form data.</li>
				<li>Both Web Storage APIs are JavaScript-accessible, so avoid storing highly sensitive secrets there.</li>
			</ul>
		</div>
	);
}
