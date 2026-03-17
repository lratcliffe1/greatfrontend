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
import { END_OF_ARRAY_CONSTRAINTS, getEndOfArrayReachableSteps } from "@/solutions/blind75/08-end-of-array-reachable/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "export function canReachEnd(numbers: number[]) {" },
	{ line: 2, code: "  let maxReach = 0;" },
	{ line: 3, code: "  const lastIndex = numbers.length - 1;" },
	{ line: 4, code: "  for (let i = 0; i < numbers.length; i++) {" },
	{ line: 5, code: "    if (i > maxReach) return false;" },
	{ line: 6, code: "    maxReach = max(maxReach, i + numbers[i]);" },
	{ line: 7, code: "    if (maxReach >= lastIndex) return true;" },
	{ line: 8, code: "  }" },
	{ line: 9, code: "  return false;" },
	{ line: 10, code: "}" },
];

const INITIAL_INPUT = "4, 1, 0, 0, 2, 0, 3";

export function EndOfArrayReachableVisualizer() {
	const [input, setInput] = useState(INITIAL_INPUT);
	const [stepIndex, setStepIndex] = useState(0);
	const { flash, tracePanelClassName } = useTraceFlash();
	const [appliedNumbers, setAppliedNumbers] = useState(() => {
		const result = parseCommaSeparatedIntegers(INITIAL_INPUT, END_OF_ARRAY_CONSTRAINTS);
		return result.data ?? [];
	});

	const debouncedInput = useDebouncedValue(input, 300);
	const parsedInput = useMemo(() => parseCommaSeparatedIntegers(debouncedInput, END_OF_ARRAY_CONSTRAINTS), [debouncedInput]);
	const steps = useMemo(() => getEndOfArrayReachableSteps(appliedNumbers), [appliedNumbers]);
	const { step, onPrev, onNext, canPrev, canNext } = useStepNavigation(steps, stepIndex, setStepIndex);
	const activeLine = step?.line ?? null;

	return (
		<StepVisualizerPage>
			<StepVisualizerInput
				label="Numbers input"
				inputId="end-of-array-input"
				placeholder="Try: 4, 1, 0, 0, 2, 0, 3 or 1, 0, 0, 0"
				value={input}
				onChange={setInput}
				error={parsedInput.error}
				onApply={() => {
					const result = parseCommaSeparatedIntegers(input, END_OF_ARRAY_CONSTRAINTS);
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
				codeTitle="End of Array Reachable (greedy) implementation"
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
							<ArrayVisualization values={appliedNumbers} activeIndex={step.index} rangeEnd={step.maxReach} targetIndex={appliedNumbers.length - 1} />
						</div>
						<TraceLine>{step.action}</TraceLine>
						<TraceLine>maxReach = {step.maxReach}</TraceLine>
						{step.reached === true && <TraceLine variant="success">Result: true — last index reachable</TraceLine>}
						{step.reached === false && <TraceLine variant="error">Result: false — last index not reachable</TraceLine>}
					</TracePanelContent>
				) : (
					<TraceEmptyState />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
