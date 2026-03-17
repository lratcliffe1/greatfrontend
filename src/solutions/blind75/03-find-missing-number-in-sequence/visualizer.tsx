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
import {
	MISSING_NUMBER_CONSTRAINTS,
	getMissingNumberInputError,
	getMissingNumberSteps,
} from "@/solutions/blind75/03-find-missing-number-in-sequence/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "export function findMissingNumber(numbers: number[]) {" },
	{ line: 2, code: "  const n = numbers.length;" },
	{ line: 3, code: "  const expectedSum = (n * (n + 1)) / 2;" },
	{ line: 4, code: "  let actualSum = 0;" },
	{ line: 5, code: "  for (let i = 0; i < n; i++) actualSum += numbers[i];" },
	{ line: 6, code: "  const missing = expectedSum - actualSum;" },
	{ line: 7, code: "  return missing;" },
	{ line: 8, code: "}" },
];

const INITIAL_INPUT = "1, 3, 0";

export function FindMissingNumberVisualizer() {
	const [input, setInput] = useState(INITIAL_INPUT);
	const [stepIndex, setStepIndex] = useState(0);
	const { flash, tracePanelClassName } = useTraceFlash();
	const [appliedNumbers, setAppliedNumbers] = useState(() => {
		const result = parseCommaSeparatedIntegers(INITIAL_INPUT, MISSING_NUMBER_CONSTRAINTS, getMissingNumberInputError);
		return result.data ?? [];
	});
	const debouncedInput = useDebouncedValue(input, 300);
	const parsedInput = useMemo(
		() => parseCommaSeparatedIntegers(debouncedInput, MISSING_NUMBER_CONSTRAINTS, getMissingNumberInputError),
		[debouncedInput],
	);
	const steps = useMemo(() => getMissingNumberSteps(appliedNumbers), [appliedNumbers]);
	const { step, onPrev, onNext, canPrev, canNext } = useStepNavigation(steps, stepIndex, setStepIndex);
	const activeLine = step?.line ?? null;

	return (
		<StepVisualizerPage>
			<StepVisualizerInput
				label="Numbers input"
				inputId="missing-number-array-input"
				placeholder="Try: 1, 3, 0 or 3, 0, 4, 2, 1"
				value={input}
				onChange={setInput}
				error={parsedInput.error}
				onApply={() => {
					const result = parseCommaSeparatedIntegers(input, MISSING_NUMBER_CONSTRAINTS, getMissingNumberInputError);
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
				codeTitle="Find Missing Number implementation"
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
						<TraceLine>expectedSum = {step.expectedSum ?? "null"}</TraceLine>
						<TraceLine>actualSum = {step.actualSum ?? "null"}</TraceLine>
						<TraceLine>missing = {step.missing ?? "null"}</TraceLine>
						{step.missing !== null && <TraceLine variant="emphasized">Missing number: {step.missing}</TraceLine>}
					</TracePanelContent>
				) : (
					<TraceEmptyState />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
