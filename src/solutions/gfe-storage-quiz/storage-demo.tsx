"use client";

import { useState } from "react";
import { AppButton } from "@/components/ui/tailwind-primitives";

const COOKIE_KEY = "gfe_cookie_demo";
const SESSION_KEY = "gfe_session_demo";
const LOCAL_KEY = "gfe_local_demo";

function readCookie(name: string) {
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
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
			<p className="text-sm text-slate-700">
				Click each button to store demo data in your browser, then compare
				behavior.
			</p>

			<div className="grid gap-4 md:grid-cols-3">
				<section className="rounded-md border border-slate-200 bg-white p-3">
					<h4 className="font-semibold text-slate-900">Cookie</h4>
					<p className="mt-1 text-sm text-slate-700">
						Sent with HTTP requests to matching domain/path.
					</p>
					<p className="mt-2 text-xs text-slate-500">
						Current: {cookieValue ?? "(empty)"}
					</p>
					<div className="mt-3 flex gap-2">
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
							onClick={() => {
								clearCookie(COOKIE_KEY);
								refreshValues();
							}}
						>
							Clear
						</AppButton>
					</div>
				</section>

				<section className="rounded-md border border-slate-200 bg-white p-3">
					<h4 className="font-semibold text-slate-900">sessionStorage</h4>
					<p className="mt-1 text-sm text-slate-700">
						Tab-scoped storage; cleared when tab/session ends.
					</p>
					<p className="mt-2 text-xs text-slate-500">
						Current: {sessionValue ?? "(empty)"}
					</p>
					<div className="mt-3 flex gap-2">
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
							onClick={() => {
								sessionStorage.removeItem(SESSION_KEY);
								refreshValues();
							}}
						>
							Clear
						</AppButton>
					</div>
				</section>

				<section className="rounded-md border border-slate-200 bg-white p-3">
					<h4 className="font-semibold text-slate-900">localStorage</h4>
					<p className="mt-1 text-sm text-slate-700">
						Persistent browser storage (until manually cleared).
					</p>
					<p className="mt-2 text-xs text-slate-500">
						Current: {localValue ?? "(empty)"}
					</p>
					<div className="mt-3 flex gap-2">
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

			<div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
				<p className="font-semibold text-slate-900">Pros and cons</p>
				<ul className="mt-2 space-y-1">
					<li>
						Cookies: useful for server-aware sessions, but small and auto-sent
						on requests.
					</li>
					<li>sessionStorage: good for tab-local ephemeral state.</li>
					<li>
						localStorage: good for persisted client preferences, but
						JS-readable.
					</li>
				</ul>
			</div>
		</div>
	);
}
