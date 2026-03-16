"use client";

type ComparisonRow = {
	property: string;
	regular: string;
	async: string;
	defer: string;
};

const COMPARISON_ROWS: ComparisonRow[] = [
	{
		property: "Parsing behavior",
		regular: "Blocks HTML parsing",
		async: "Runs parallel to parsing",
		defer: "Runs parallel to parsing",
	},
	{
		property: "Execution order",
		regular: "In order of appearance",
		async: "Not guaranteed",
		defer: "In order of appearance",
	},
	{
		property: "DOM dependency",
		regular: "No",
		async: "No",
		defer: "Yes (waits for DOM)",
	},
];

export function ScriptAsyncDeferDemo() {
	return (
		<div className="space-y-5">
			<p className="text-sm text-foreground">
				All three load and execute JavaScript, but differ in how the browser handles loading and execution relative to HTML parsing.
			</p>
			<p className="mt-2 text-xs text-muted">Use the table for interview framing, then review the examples and notes below.</p>

			<div className="overflow-x-auto rounded-md border border-card-border">
				<table className="min-w-190 w-full text-left text-xs sm:text-sm">
					<thead className="[background:var(--surface)]">
						<tr className="text-foreground">
							<th className="px-3 py-2 font-semibold">Feature</th>
							<th className="px-3 py-2 font-semibold">&lt;script&gt;</th>
							<th className="px-3 py-2 font-semibold">&lt;script async&gt;</th>
							<th className="px-3 py-2 font-semibold">&lt;script defer&gt;</th>
						</tr>
					</thead>
					<tbody>
						{COMPARISON_ROWS.map((row) => (
							<tr key={row.property} className="border-t border-card-border">
								<th className="px-3 py-2 font-medium text-foreground">{row.property}</th>
								<td className="px-3 py-2 text-muted">{row.regular}</td>
								<td className="px-3 py-2 text-muted">{row.async}</td>
								<td className="px-3 py-2 text-muted">{row.defer}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="space-y-4">
				<section className="rounded-md border border-card-border p-3 [background:var(--card-bg)]">
					<h4 className="font-semibold text-foreground">&lt;script&gt;</h4>
					<p className="mt-1 text-sm text-muted">
						HTML parsing is blocked while the script is downloaded and executed. The browser will not continue rendering until the script finishes.
					</p>
					<p className="mt-2 text-xs text-muted">Use for critical scripts the page relies on to render properly.</p>
					<pre className="mt-2 overflow-x-auto rounded bg-surface px-2 py-1.5 text-xs text-muted">{`<script src="regular.js"></script>`}</pre>
				</section>

				<section className="rounded-md border border-card-border p-3 [background:var(--card-bg)]">
					<h4 className="font-semibold text-foreground">&lt;script async&gt;</h4>
					<p className="mt-1 text-sm text-muted">
						Downloads in parallel with HTML parsing. Executes as soon as available, potentially before parsing completes. Order of execution is not
						guaranteed across multiple async scripts.
					</p>
					<p className="mt-2 text-xs text-muted">Use for independent scripts (e.g. analytics, ads) that do not depend on each other.</p>
					<pre className="mt-2 overflow-x-auto rounded bg-surface px-2 py-1.5 text-xs text-muted">{`<script async src="async.js"></script>`}</pre>
				</section>

				<section className="rounded-md border border-card-border p-3 [background:var(--card-bg)]">
					<h4 className="font-semibold text-foreground">&lt;script defer&gt;</h4>
					<p className="mt-1 text-sm text-muted">
						Downloads in parallel with HTML parsing. Execution is deferred until the document is fully parsed, before DOMContentLoaded. Multiple
						deferred scripts run in the order they appear.
					</p>
					<p className="mt-2 text-xs text-muted">Use when the script depends on a fully-parsed DOM or other deferred scripts.</p>
					<pre className="mt-2 overflow-x-auto rounded bg-surface px-2 py-1.5 text-xs text-muted">{`<script defer src="deferred.js"></script>`}</pre>
				</section>
			</div>

			<p className="font-semibold text-foreground pt-4">Notes</p>
			<ul className="mt-2 space-y-1 text-sm text-muted">
				<li>
					async and defer are ignored for inline scripts (no <code className="rounded bg-surface px-1">src</code> attribute).
				</li>
				<li>
					<code className="rounded bg-surface px-1">document.write()</code> from async/defer scripts is ignored by the browser.
				</li>
				<li>Scripts still run on the main thread; heavy scripts can freeze the UI. Partytown can offload third-party scripts to a web worker.</li>
			</ul>
		</div>
	);
}
