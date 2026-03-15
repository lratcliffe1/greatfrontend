"use client";

import { useMemo, useRef, useState } from "react";

import { AppButton, EditableFieldPrompt } from "@/components/ui/tailwind-primitives";
import {
	StepVisualizerLayout,
	TraceEmptyState,
	TracePanelContent,
	TraceLine,
	StepVisualizerPage,
	type CodeLine,
} from "@/components/visualizer/step-visualizer-layout";
import { useTraceFlash } from "@/components/visualizer/use-trace-flash";
import { useStepNavigation } from "@/components/visualizer/use-step-navigation";
import { toClockTime } from "@/lib/to-clock-time";
import { throttle, type ThrottleTraceEvent } from "@/solutions/gfe75/throttle/solution";

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

type TraceLog = {
	id: number;
	at: string;
	line: number;
	message: string;
};

export function ThrottleVisualizer() {
	const [waitMs, setWaitMs] = useState(100);
	const [traceLogs, setTraceLogs] = useState<TraceLog[]>([]);
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
						},
					];
					return next;
				});
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
		setTraceLogs([]);
		setStepIndex(0);
		setExecutedPayloads([]);
		clickCounterRef.current = 0;
		// t=0: first call, executes immediately
		clickCounterRef.current += 1;
		throttled(`t0-${clickCounterRef.current}`);
		// t=50: within wait, throttled
		setTimeout(() => {
			clickCounterRef.current += 1;
			throttled(`t50-${clickCounterRef.current}`);
		}, 50);
		// t=101: wait elapsed, executes
		setTimeout(() => {
			clickCounterRef.current += 1;
			throttled(`t101-${clickCounterRef.current}`);
		}, 101);
	}

	return (
		<StepVisualizerPage>
			<div className="space-y-2">
				<EditableFieldPrompt htmlFor="wait-ms" label="Wait (ms)" hint="Change the wait to see how throttle timing affects execution." />
				<div className="flex flex-wrap items-center gap-3">
					<input
						id="wait-ms"
						type="number"
						min={100}
						step={100}
						value={waitMs}
						onChange={(event) => setWaitMs(Number(event.target.value) || 100)}
						className="w-28 rounded-md border border-card-border bg-background px-2 py-1 text-foreground"
					/>
					<AppButton type="button" onClick={triggerThrottledCall}>
						Trigger throttled handler
					</AppButton>
					<AppButton type="button" onClick={runThrottleScenario}>
						Run t=0, t=50, t=101 scenario
					</AppButton>
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

				<div>
					<p className="text-sm font-semibold text-foreground">Executed payloads</p>
					<p className="text-sm text-foreground">{executedPayloads.length ? executedPayloads.join(", ") : "None yet."}</p>
				</div>
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
