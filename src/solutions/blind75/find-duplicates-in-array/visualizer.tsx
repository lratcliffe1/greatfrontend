"use client";

import { startTransition, useMemo, useState } from "react";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { StepVisualizerInput } from "@/components/visualizer/step-visualizer-input";
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
import { ArrayVisualization } from "@/components/visualizer/array-visualization";
import { parseCommaSeparatedIntegers } from "@/lib/utils/parse-visualizer-user-inputs";
import { DUPLICATE_ARRAY_CONSTRAINTS, getDuplicateScanSteps, type DuplicateScanOutcome } from "@/solutions/blind75/find-duplicates-in-array/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "export function hasDuplicate(numbers: number[]) {" },
	{ line: 2, code: "  const seen = new Set<number>();" },
	{ line: 3, code: "  for (const [index, value] of numbers.entries()) {" },
	{ line: 4, code: "    if (seen.has(value)) {" },
	{ line: 5, code: "      return true;" },
	{ line: 6, code: "    }" },
	{ line: 7, code: "    seen.add(value);" },
	{ line: 8, code: "  }" },
	{ line: 9, code: "  return false;" },
	{ line: 10, code: "}" },
];

const INITIAL_INPUT = "10, 7, 0, 0, 9";

function getOutcomeLabel(outcome: DuplicateScanOutcome) {
	switch (outcome) {
		case "duplicate":
			return "Duplicate detected";
		case "complete":
			return "All unique";
		default:
			return "Still scanning";
	}
}

function getOutcomeVariant(outcome: DuplicateScanOutcome): "default" | "warning" | "emphasized" {
	switch (outcome) {
		case "duplicate":
			return "warning";
		case "complete":
			return "emphasized";
		default:
			return "default";
	}
}

export function FindDuplicatesInArrayVisualizer() {
	const [input, setInput] = useState(INITIAL_INPUT);
	const [stepIndex, setStepIndex] = useState(0);
	const { flash, tracePanelClassName } = useTraceFlash();
	const [appliedNumbers, setAppliedNumbers] = useState(() => {
		const result = parseCommaSeparatedIntegers(INITIAL_INPUT, DUPLICATE_ARRAY_CONSTRAINTS);
		return result.data ?? [];
	});

	const debouncedInput = useDebouncedValue(input, 300);
	const parsedInput = useMemo(() => parseCommaSeparatedIntegers(debouncedInput, DUPLICATE_ARRAY_CONSTRAINTS), [debouncedInput]);
	const steps = useMemo(() => getDuplicateScanSteps(appliedNumbers), [appliedNumbers]);
	const { step, onPrev, onNext, canPrev, canNext } = useStepNavigation(steps, stepIndex, setStepIndex);
	const activeLine = step?.line ?? null;

	return (
		<StepVisualizerPage>
			<StepVisualizerInput
				label="Numbers input"
				hint="Use comma-separated integers. Only valid inputs within the problem constraints can be applied."
				inputId="duplicate-array-input"
				placeholder="Try: 5, 7, 1, 3 or 10, 7, 0, 0, 9"
				value={input}
				onChange={setInput}
				error={parsedInput.error}
				onApply={() => {
					const result = parseCommaSeparatedIntegers(input, DUPLICATE_ARRAY_CONSTRAINTS);
					if (result.error || result.data === null) return;
					startTransition(() => {
						setAppliedNumbers(result.data);
						setStepIndex(0);
						flash();
					});
				}}
				applyDisabled={Boolean(parsedInput.error)}
			/>

			<StepVisualizerLayout
				codeTitle="Find Duplicates in Array implementation"
				codeLines={CODE_LINES}
				activeLine={activeLine}
				tracePanelClassName={tracePanelClassName}
				stepIndex={stepIndex}
				totalSteps={steps.length}
				onPrev={onPrev}
				onNext={onNext}
				canPrev={canPrev}
				canNext={canNext}
			>
				{step ? (
					<TracePanelContent>
						<div className="mb-2">
							<ArrayVisualization values={appliedNumbers} activeIndex={step.index} />
						</div>
						<TraceLine>Action: {step.action}</TraceLine>
						<TraceLine>Seen set: {step.seen.length ? step.seen.join(", ") : "(empty)"}</TraceLine>
						<TraceLine variant={getOutcomeVariant(step.outcome)}>{getOutcomeLabel(step.outcome)}</TraceLine>
					</TracePanelContent>
				) : (
					<TraceEmptyState />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
