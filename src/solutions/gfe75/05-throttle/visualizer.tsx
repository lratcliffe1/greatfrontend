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
import { throttle, type ThrottleTimelineEvent, type ThrottleTraceEvent } from "@/solutions/gfe75/05-throttle/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "return (...args) => {" },
	{ line: 2, code: "  const now = Date.now();" },
	{ line: 3, code: "  const hasWaited = lastExecutedAt === null || (now - lastExecutedAt) >= waitMs;" },
	{ line: 4, code: "  if (hasWaited) {" },
	{ line: 5, code: "    callback(...args);" },
	{ line: 6, code: "    lastExecutedAt = now;" },
	{ line: 7, code: "  } else {" },
	{ line: 8, code: "    // throttled: skip" },
	{ line: 9, code: "  }" },
	{ line: 10, code: "};" },
];

export function ThrottleVisualizer() {
	const [waitMs, setWaitMs] = useState(100);
	const [traceLogs, setTraceLogs] = useState<TraceLog[]>([]);
	const [timelineEvents, setTimelineEvents] = useState<Array<ThrottleTimelineEvent<[string]>>>([]);
	const [stepIndex, setStepIndex] = useState(0);
	const [executedPayloads, setExecutedPayloads] = useState<string[]>([]);
	const clickCounterRef = useRef(0);
	const { flash, tracePanelClassName } = useTraceFlash();

	const { step: currentStep, onPrev, onNext, canPrev, canNext } = useStepNavigation(traceLogs, stepIndex, setStepIndex);
	const activeLine = currentStep?.line ?? null;

	const throttled = useMemo(() => {
		return throttle<[string]>(
			(payload) => {
				setExecutedPayloads((previous) => [...previous, payload]);
			},
			waitMs,
			(event: ThrottleTraceEvent) => {
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
			(event: ThrottleTimelineEvent<[string]>) => {
				setTimelineEvents((prev) => [...prev, event]);
			},
		);
	}, [waitMs]);

	function triggerThrottledCall() {
		flash();
		clickCounterRef.current += 1;
		throttled(`click-${clickCounterRef.current}`);
	}

	function runThrottleScenario() {
		flash();
		// t=0: first call, executes immediately
		clickCounterRef.current += 1;
		throttled(`click-${clickCounterRef.current}`);
		// t=50: within wait, throttled
		setTimeout(() => {
			clickCounterRef.current += 1;
			throttled(`click-${clickCounterRef.current}`);
		}, 50);
		// t=101: wait elapsed, executes
		setTimeout(() => {
			clickCounterRef.current += 1;
			throttled(`click-${clickCounterRef.current}`);
		}, 101);
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
				<EditableFieldPrompt htmlFor="wait-ms" label="Wait (ms)" />
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<input
						id="wait-ms"
						type="number"
						min={100}
						step={100}
						value={waitMs}
						onChange={(event) => setWaitMs(Number(event.target.value) || 100)}
						className={`${INPUT_CLASSES} w-28`}
					/>
					<div className="flex shrink-0 flex-wrap gap-2">
						<AppButton type="button" onClick={triggerThrottledCall}>
							Trigger throttled handler
						</AppButton>
						<AppButton type="button" onClick={runThrottleScenario}>
							Run t=0, t=50, t=101 scenario
						</AppButton>
						<AppButton type="button" onClick={reset} disabled={traceLogs.length === 0}>
							Reset
						</AppButton>
					</div>
				</div>
			</div>

			<StepVisualizerLayout
				codeTitle="Throttle implementation"
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
								if (e.type === "executed") return { type: "executed" as const, label: String(e.args[0]), timestamp: e.timestamp };
								if (e.type === "skipped") return { type: "skipped" as const, label: String(e.args[0]), timestamp: e.timestamp };
								return e;
							})}
							highlightTimestamp={traceLogs[stepIndex]?.timestamp}
						/>
						<div>
							<p className="text-sm font-semibold text-foreground">Executed payloads</p>
							<p className="text-sm text-foreground">{executedPayloads.length ? executedPayloads.join(", ") : "None yet."}</p>
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
					<TraceEmptyState message="No events yet. Trigger the handler or run the scenario." />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
