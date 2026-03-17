"use client";

import { useMemo, useRef, useState } from "react";

import { AppButton, EditableFieldPrompt } from "@/components/ui/tailwind-primitives";
import { INPUT_CLASSES } from "@/components/visualizer/visualizer-input-constants";
import {
	StepVisualizerLayout,
	TraceEmptyState,
	TracePanelContent,
	TraceLine,
	StepVisualizerPage,
	type CodeLine,
	type TraceLog,
} from "@/components/visualizer/step-visualizer-layout";
import { TimelineVisualization } from "@/components/visualizer/timeline-visualization";
import { useTraceFlash } from "@/components/visualizer/use-trace-flash";
import { useStepNavigation } from "@/components/visualizer/use-step-navigation";
import { toClockTime } from "@/lib/utils/to-clock-time";
import { debounce, type DebounceTimelineEvent, type DebounceTraceEvent } from "@/solutions/gfe75/01-debounce/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "return (...args) => {" },
	{ line: 2, code: "  const hasActiveTimeout = timeoutId !== null;" },
	{ line: 3, code: "  if (hasActiveTimeout) {" },
	{ line: 4, code: "    clearTimeout(timeoutId);" },
	{ line: 5, code: "  }" },
	{ line: 6, code: "  timeoutId = setTimeout(() => {" },
	{ line: 7, code: "    // callback scheduled in delayMs" },
	{ line: 8, code: "    // timer fired" },
	{ line: 9, code: "    callback(...args);" },
	{ line: 10, code: "  }, delayMs);" },
	{ line: 11, code: "};" },
];

export function DebounceVisualizer() {
	const [delayMs, setDelayMs] = useState(500);
	const [traceLogs, setTraceLogs] = useState<TraceLog[]>([]);
	const [timelineEvents, setTimelineEvents] = useState<Array<DebounceTimelineEvent<[string]>>>([]);
	const [stepIndex, setStepIndex] = useState(0);
	const [executedPayloads, setExecutedPayloads] = useState<string[]>([]);
	const clickCounterRef = useRef(0);
	const { flash, tracePanelClassName } = useTraceFlash();

	const { step: currentStep, onPrev, onNext, canPrev, canNext } = useStepNavigation(traceLogs, stepIndex, setStepIndex);
	const activeLine = currentStep?.line ?? null;

	const debounced = useMemo(() => {
		return debounce<[string]>(
			(payload) => {
				setExecutedPayloads((previous) => [...previous, payload]);
			},
			delayMs,
			(event: DebounceTraceEvent) => {
				setTraceLogs((previous) => {
					const next = [
						...previous,
						{
							id: Date.now() + previous.length,
							at: toClockTime(Date.now()),
							line: event.line,
							message: event.message,
							timestamp: event.timestamp,
						},
					];
					return next;
				});
			},
			(event: DebounceTimelineEvent<[string]>) => {
				setTimelineEvents((prev) => [...prev, event]);
			},
		);
	}, [delayMs]);

	function triggerDebouncedCall() {
		flash();
		clickCounterRef.current += 1;
		debounced(`click-${clickCounterRef.current}`);
	}

	function runRapidScenario() {
		flash();
		clickCounterRef.current += 1;
		debounced(`click-${clickCounterRef.current}`);
		setTimeout(() => {
			clickCounterRef.current += 1;
			debounced(`click-${clickCounterRef.current}`);
		}, 120);
		setTimeout(() => {
			clickCounterRef.current += 1;
			debounced(`click-${clickCounterRef.current}`);
		}, 240);
	}

	function reset() {
		flash();
		setTraceLogs([]);
		setTimelineEvents([]);
		setStepIndex(0);
		setExecutedPayloads([]);
		clickCounterRef.current = 0;
	}

	return (
		<StepVisualizerPage>
			<div className="space-y-2">
				<EditableFieldPrompt htmlFor="delay-ms" label="Delay (ms)" />
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<input
						id="delay-ms"
						type="number"
						min={100}
						step={100}
						value={delayMs}
						onChange={(event) => setDelayMs(Number(event.target.value) || 100)}
						className={`${INPUT_CLASSES} w-28`}
					/>
					<div className="flex shrink-0 flex-wrap gap-2">
						<AppButton type="button" onClick={triggerDebouncedCall}>
							Trigger debounced handler
						</AppButton>
						<AppButton type="button" onClick={runRapidScenario}>
							Run rapid 3-click scenario
						</AppButton>
						<AppButton type="button" onClick={reset} disabled={traceLogs.length === 0}>
							Reset
						</AppButton>
					</div>
				</div>
			</div>

			<StepVisualizerLayout
				codeTitle="Debounce implementation"
				codeLines={CODE_LINES}
				activeLine={activeLine}
				traceTitle="Trace events (step-by-step)"
				tracePanelClassName={tracePanelClassName}
				stepIndex={stepIndex}
				totalSteps={traceLogs.length}
				onPrev={onPrev}
				onNext={onNext}
				canPrev={canPrev}
				canNext={canNext}
				footer={
					<div className="flex flex-col gap-4 rounded-lg border border-card-border bg-card-bg p-6">
						<TimelineVisualization
							events={timelineEvents.map((e) => {
								if (e.type === "invoked") return { type: "invoked" as const, label: String(e.args[0]), timestamp: e.timestamp };
								if (e.type === "cleared") return { type: "cleared" as const, timestamp: e.timestamp };
								if (e.type === "scheduled") return { type: "scheduled" as const, delayMs: e.delayMs, timestamp: e.timestamp };
								if (e.type === "executed") return { type: "executed" as const, label: "Executed", timestamp: e.timestamp };
								return e;
							})}
							highlightTimestamp={traceLogs[stepIndex]?.timestamp}
						/>
						<div>
							<p className="text-sm font-semibold text-foreground">Executed payloads</p>
							<p className="text-sm text-foreground">
								{executedPayloads.length ? executedPayloads.join(", ") : "None yet (debounce delay has not elapsed)."}
							</p>
						</div>
					</div>
				}
			>
				{currentStep ? (
					<TracePanelContent>
						<TraceLine>
							<span className="mr-2 font-medium text-muted">{currentStep.at}</span>
							{currentStep.message}
						</TraceLine>
					</TracePanelContent>
				) : (
					<TraceEmptyState message="No events yet. Trigger the handler or run the rapid scenario." />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
