import type { ReactNode } from "react";
import { CodePanel, StepControlButton, TracePanel } from "@/components/ui/tailwind-primitives";

const TRACE_CONTENT_CLASSES = "rounded border border-card-border bg-card-bg p-3 space-y-1";

export type CodeLine = {
	line: number | null;
	code: string;
};

const DEFAULT_TRACE_TITLE = "Execution trace (step-by-step)";

type StepVisualizerLayoutProps = {
	codeTitle: string;
	codeLines: CodeLine[];
	activeLine: number | null;
	traceTitle?: string;
	tracePanelClassName?: string;
	stepIndex: number;
	totalSteps: number;
	onPrev: () => void;
	onNext: () => void;
	canPrev: boolean;
	canNext: boolean;
	summary?: ReactNode;
	children: ReactNode;
};

export function StepVisualizerLayout({
	codeTitle,
	codeLines,
	activeLine,
	traceTitle = DEFAULT_TRACE_TITLE,
	tracePanelClassName,
	stepIndex,
	totalSteps,
	onPrev,
	onNext,
	canPrev,
	canNext,
	summary,
	children,
}: StepVisualizerLayoutProps) {
	return (
		<div className="grid gap-4 md:grid-cols-[4fr_1.5fr]">
			<CodePanel>
				<p className="mb-2 text-xs text-slate-400">{codeTitle}</p>
				{codeLines.map((entry, index) => {
					const isActive = entry.line !== null && activeLine === entry.line;
					return (
						<div
							key={`${entry.line ?? "none"}-${index}`}
							className={`rounded px-2 py-1 whitespace-pre-wrap wrap-break-word ${isActive ? "bg-teal-800 text-white" : "text-slate-200"}`}
						>
							<span className="mr-3 inline-block w-8 text-slate-500">{entry.line ?? ""}</span>
							<code>{entry.code}</code>
						</div>
					);
				})}
			</CodePanel>

			<TracePanel className={tracePanelClassName}>
				<h4 className="font-semibold text-foreground">{traceTitle}</h4>
				{summary}
				<div className="flex items-center gap-2">
					<StepControlButton onClick={onPrev} disabled={!canPrev}>
						Prev
					</StepControlButton>
					<StepControlButton onClick={onNext} disabled={!canNext}>
						Next
					</StepControlButton>
					<span className="text-sm text-muted">
						Step {totalSteps === 0 ? 0 : stepIndex + 1}/{totalSteps}
					</span>
				</div>
				{children}
			</TracePanel>
		</div>
	);
}

/** Wrapper for trace panel step content with consistent border and padding */
export function TracePanelContent({ children }: { children: ReactNode }) {
	return <div className={TRACE_CONTENT_CLASSES}>{children}</div>;
}

/** Empty state when no steps are available */
export function TraceEmptyState({ message = "No steps yet for this input." }: { message?: string }) {
	return <p className="text-muted">{message}</p>;
}

const TRACE_LINE_BASE = "text-sm text-foreground";
const TRACE_LINE_EMPHASIZED = "text-sm font-semibold text-emerald-700 dark:text-emerald-400";
const TRACE_LINE_SUCCESS = "text-sm font-semibold text-green-700 dark:text-green-400";
const TRACE_LINE_WARNING = "text-sm font-semibold text-amber-700 dark:text-amber-400";
const TRACE_LINE_ERROR = "text-sm font-semibold text-red-700 dark:text-red-400";

/** Single line in trace panel content */
export function TraceLine({
	children,
	variant = "default",
}: {
	children: ReactNode;
	variant?: "default" | "emphasized" | "success" | "warning" | "error";
}) {
	const className =
		variant === "emphasized"
			? TRACE_LINE_EMPHASIZED
			: variant === "success"
				? TRACE_LINE_SUCCESS
				: variant === "warning"
					? TRACE_LINE_WARNING
					: variant === "error"
						? TRACE_LINE_ERROR
						: TRACE_LINE_BASE;
	return <p className={className}>{children}</p>;
}

/** Page wrapper for step visualizers with consistent spacing */
export function StepVisualizerPage({ children }: { children: ReactNode }) {
	return <div className="space-y-4">{children}</div>;
}
