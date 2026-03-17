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
import { MAX_SUM_ARRAY_CONSTRAINTS, getMaxSumSteps } from "@/solutions/blind75/05-maximum-sum-in-contiguous-array/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "export function maxSumSubarray(numbers: number[]) {" },
	{ line: 2, code: "  let maxEnding = globalMax = numbers[0];" },
	{ line: 3, code: "  for (let i = 1; i < numbers.length; i++) {" },
	{ line: 4, code: "    const n = numbers[i];" },
	{ line: 5, code: "    maxEnding = max(n, maxEnding + n);" },
	{ line: 6, code: "    globalMax = max(globalMax, maxEnding);" },
	{ line: 7, code: "  }" },
	{ line: 8, code: "  return globalMax;" },
	{ line: 9, code: "}" },
];

const INITIAL_INPUT = "-1, 5, -3, 9, -11";

export function MaximumSumInContiguousArrayVisualizer() {
	const [input, setInput] = useState(INITIAL_INPUT);
	const [stepIndex, setStepIndex] = useState(0);
	const { flash, tracePanelClassName } = useTraceFlash();
	const [appliedNumbers, setAppliedNumbers] = useState(() => {
		const result = parseCommaSeparatedIntegers(INITIAL_INPUT, MAX_SUM_ARRAY_CONSTRAINTS);
		return result.data ?? [];
	});

	const debouncedInput = useDebouncedValue(input, 300);
	const parsedInput = useMemo(() => parseCommaSeparatedIntegers(debouncedInput, MAX_SUM_ARRAY_CONSTRAINTS), [debouncedInput]);
	const steps = useMemo(() => getMaxSumSteps(appliedNumbers), [appliedNumbers]);
	const { step, onPrev, onNext, canPrev, canNext } = useStepNavigation(steps, stepIndex, setStepIndex);
	const activeLine = step?.line ?? null;

	return (
		<StepVisualizerPage>
			<StepVisualizerInput
				label="Numbers input"
				inputId="max-sum-array-input"
				placeholder="Try: -1, 5, -3, 9, -11 or 1, 2, 3, 4"
				value={input}
				onChange={setInput}
				error={parsedInput.error}
				onApply={() => {
					const result = parseCommaSeparatedIntegers(input, MAX_SUM_ARRAY_CONSTRAINTS);
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
				codeTitle="Maximum Sum Subarray (Kadane's algorithm) implementation"
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
						<TraceLine>{step.action}</TraceLine>
						<TraceLine>maxEnding = {step.maxEndingHere}</TraceLine>
						<TraceLine variant="emphasized">globalMax = {step.globalMax}</TraceLine>
					</TracePanelContent>
				) : (
					<TraceEmptyState />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
