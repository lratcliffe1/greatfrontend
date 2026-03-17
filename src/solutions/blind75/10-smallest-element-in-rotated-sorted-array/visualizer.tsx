"use client";

import { startTransition, useMemo, useState } from "react";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { ArrayVisualization } from "@/components/visualizer/array-visualization";
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
import { parseCommaSeparatedIntegers } from "@/lib/utils/parse-visualizer-user-inputs";
import {
	SMALLEST_ROTATED_CONSTRAINTS,
	getSmallestInRotatedSteps,
	type SmallestRotatedStepPhase,
} from "@/solutions/blind75/10-smallest-element-in-rotated-sorted-array/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "export function findMin(numbers: number[]) {" },
	{ line: 2, code: "  let lo = 0, hi = numbers.length - 1;" },
	{ line: 3, code: "  while (lo < hi) {" },
	{ line: 4, code: "    const mid = Math.floor((lo + hi) / 2);" },
	{ line: 5, code: "    if (numbers[mid] < numbers[hi]) {" },
	{ line: 6, code: "      // Right [mid..hi] sorted, min in left" },
	{ line: 7, code: "      hi = mid;" },
	{ line: 8, code: "    } else {" },
	{ line: 9, code: "      // Left sorted, min in right" },
	{ line: 10, code: "      lo = mid + 1;" },
	{ line: 11, code: "    }" },
	{ line: 12, code: "  return numbers[lo];" },
	{ line: 13, code: "}" },
];

const INITIAL_INPUT = "4, 7, 10, 11, 12, 2, 3";

function getPhaseVariant(phase: SmallestRotatedStepPhase): "default" | "emphasized" {
	return phase === "found" ? "emphasized" : "default";
}

export function SmallestInRotatedArrayVisualizer() {
	const [input, setInput] = useState(INITIAL_INPUT);
	const [stepIndex, setStepIndex] = useState(0);
	const { flash, tracePanelClassName } = useTraceFlash();
	const [appliedNumbers, setAppliedNumbers] = useState(() => {
		const result = parseCommaSeparatedIntegers(INITIAL_INPUT, SMALLEST_ROTATED_CONSTRAINTS);
		return result.data ?? [];
	});

	const debouncedInput = useDebouncedValue(input, 300);
	const parsedInput = useMemo(() => parseCommaSeparatedIntegers(debouncedInput, SMALLEST_ROTATED_CONSTRAINTS), [debouncedInput]);
	const steps = useMemo(() => getSmallestInRotatedSteps(appliedNumbers), [appliedNumbers]);
	const { step, onPrev, onNext, canPrev, canNext } = useStepNavigation(steps, stepIndex, setStepIndex);
	const activeLine = step?.line ?? null;

	const minIndex = step && step.result !== null ? step.lo : undefined;

	return (
		<StepVisualizerPage>
			<StepVisualizerInput
				label="Numbers input"
				inputId="smallest-rotated-input"
				placeholder="Try: 3, 4, 1, 2 or 6, 7, 8, -5, -4, 2"
				value={input}
				onChange={setInput}
				error={parsedInput.error}
				onApply={() => {
					const result = parseCommaSeparatedIntegers(input, SMALLEST_ROTATED_CONSTRAINTS);
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
				codeTitle="Smallest in Rotated Sorted Array implementation"
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
							<ArrayVisualization
								values={appliedNumbers}
								activeIndex={step.mid}
								rangeStart={step.lo <= step.hi ? step.lo : undefined}
								rangeEnd={step.lo <= step.hi ? step.hi : undefined}
								targetIndex={minIndex}
							/>
						</div>
						<TraceLine>{step.action}</TraceLine>
						<TraceLine>
							lo = {step.lo}, hi = {step.hi}
							{step.mid != null && `, mid = ${step.mid}`}
						</TraceLine>
						{step.result !== null && <TraceLine variant={getPhaseVariant(step.phase)}>Result: {step.result}</TraceLine>}
					</TracePanelContent>
				) : (
					<TraceEmptyState />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
