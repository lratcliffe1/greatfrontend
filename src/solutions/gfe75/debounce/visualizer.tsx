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
import { debounce, type DebounceTraceEvent } from "@/solutions/gfe75/debounce/solution";

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

type TraceLog = {
	id: number;
	at: string;
	line: number;
	message: string;
};

function toClockTime(timestamp: number) {
	const d = new Date(timestamp);
	const hours = String(d.getHours()).padStart(2, "0");
	const mins = String(d.getMinutes()).padStart(2, "0");
	const secs = String(d.getSeconds()).padStart(2, "0");
	const ms = String(d.getMilliseconds()).padStart(3, "0");
	return `${hours}:${mins}:${secs}.${ms}`;
}

export function DebounceVisualizer() {
	const [delayMs, setDelayMs] = useState(500);
	const [traceLogs, setTraceLogs] = useState<TraceLog[]>([]);
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
						},
					];
					return next;
				});
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
		setTraceLogs([]);
		setStepIndex(0);
		setExecutedPayloads([]);
		clickCounterRef.current += 1;
		debounced(`scenario-${clickCounterRef.current}`);
		setTimeout(() => {
			clickCounterRef.current += 1;
			debounced(`scenario-${clickCounterRef.current}`);
		}, 120);
		setTimeout(() => {
			clickCounterRef.current += 1;
			debounced(`scenario-${clickCounterRef.current}`);
		}, 240);
	}

	return (
		<StepVisualizerPage>
			<div className="space-y-2">
				<EditableFieldPrompt htmlFor="delay-ms" label="Delay (ms)" hint="Change the delay to see how debounce timing affects execution." />
				<div className="flex flex-wrap items-center gap-3">
					<input
						id="delay-ms"
						type="number"
						min={100}
						step={100}
						value={delayMs}
						onChange={(event) => setDelayMs(Number(event.target.value) || 100)}
						className="w-28 rounded-md border border-card-border bg-background px-2 py-1 text-foreground"
					/>
					<AppButton type="button" onClick={triggerDebouncedCall}>
						Trigger debounced handler
					</AppButton>
					<AppButton type="button" onClick={runRapidScenario}>
						Run rapid 3-click scenario
					</AppButton>
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

				<div>
					<p className="text-sm font-semibold text-foreground">Executed payloads</p>
					<p className="text-sm text-foreground">
						{executedPayloads.length ? executedPayloads.join(", ") : "None yet (debounce delay has not elapsed)."}
					</p>
				</div>
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
