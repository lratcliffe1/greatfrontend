"use client";

import { startTransition, useMemo, useState } from "react";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { ArrayVisualization } from "@/components/visualizer/array-visualization";
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
import {
	StepVisualizerApplyButton,
	StepVisualizerInputField,
	StepVisualizerInputSection,
} from "@/components/visualizer/step-visualizer-input-section";
import { parseCommaSeparatedIntegers, parseSingleInteger } from "@/lib/utils/parse-visualizer-user-inputs";
import {
	ROTATED_ARRAY_CONSTRAINTS,
	getRotatedSearchSteps,
	type RotatedSearchStepPhase,
} from "@/solutions/blind75/09-find-element-in-rotated-array/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "export function searchInRotatedArray(numbers, target) {" },
	{ line: 2, code: "  let lo = 0, hi = numbers.length - 1;" },
	{ line: 3, code: "  while (lo <= hi) {" },
	{ line: 4, code: "    const mid = Math.floor((lo + hi) / 2);" },
	{ line: 5, code: "    if (numbers[mid] === target) return mid;" },
	{ line: 6, code: "    if (numbers[lo] <= numbers[mid]) {" },
	{ line: 7, code: "      if (target in [lo..mid)) hi = mid - 1;" },
	{ line: 8, code: "      else lo = mid + 1;" },
	{ line: 9, code: "    } else {" },
	{ line: 10, code: "      if (target in (mid..hi]) lo = mid + 1;" },
	{ line: 11, code: "      else hi = mid - 1;" },
	{ line: 12, code: "    }" },
	{ line: 13, code: "  }" },
	{ line: 14, code: "  return -1;" },
	{ line: 15, code: "}" },
];

const INITIAL_NUMBERS = "4, 7, 10, 11, 12, 2, 3";
const INITIAL_TARGET = "12";

function getPhaseVariant(phase: RotatedSearchStepPhase): "default" | "emphasized" | "warning" {
	switch (phase) {
		case "found":
			return "emphasized";
		case "notFound":
			return "warning";
		default:
			return "default";
	}
}

export function FindElementInRotatedArrayVisualizer() {
	const [numbersInput, setNumbersInput] = useState(INITIAL_NUMBERS);
	const [targetInput, setTargetInput] = useState(INITIAL_TARGET);
	const [stepIndex, setStepIndex] = useState(0);
	const { flash, tracePanelClassName } = useTraceFlash();
	const [applied, setApplied] = useState<{ numbers: number[]; target: number }>(() => {
		const nums = parseCommaSeparatedIntegers(INITIAL_NUMBERS, ROTATED_ARRAY_CONSTRAINTS);
		const t = parseSingleInteger(INITIAL_TARGET, { label: "target" });
		return {
			numbers: nums.data ?? [],
			target: t.data ?? 0,
		};
	});

	const debouncedNumbersInput = useDebouncedValue(numbersInput, 300);
	const parsedNumbers = useMemo(() => parseCommaSeparatedIntegers(debouncedNumbersInput, ROTATED_ARRAY_CONSTRAINTS), [debouncedNumbersInput]);
	const parsedTarget = useMemo(() => parseSingleInteger(targetInput, { label: "target" }), [targetInput]);

	const steps = useMemo(() => getRotatedSearchSteps(applied.numbers, applied.target), [applied.numbers, applied.target]);
	const { step, onPrev, onNext, canPrev, canNext } = useStepNavigation(steps, stepIndex, setStepIndex);
	const activeLine = step?.line ?? null;

	const canApply = !parsedNumbers.error && !parsedTarget.error && parsedNumbers.data !== null && parsedTarget.data !== null;

	const handleApply = () => {
		const numsResult = parseCommaSeparatedIntegers(numbersInput, ROTATED_ARRAY_CONSTRAINTS);
		const targetResult = parseSingleInteger(targetInput, { label: "target" });
		if (numsResult.error || numsResult.data === null || targetResult.error || targetResult.data === null) return;
		startTransition(() => {
			setApplied({ numbers: numsResult.data, target: targetResult.data });
			setStepIndex(0);
			flash();
		});
	};

	const targetIndex = step && step.result !== null && step.result >= 0 ? step.result : undefined;

	return (
		<StepVisualizerPage>
			<StepVisualizerInputSection error={parsedNumbers.error ?? parsedTarget.error}>
				<StepVisualizerInputField
					id="rotated-array-numbers-input"
					label="Numbers input"
					placeholder="Try: 2, 3, 4, 0, 1 or 0, 1, 2, 3, 4"
					value={numbersInput}
					onChange={(e) => setNumbersInput(e.target.value)}
					invalid={Boolean(parsedNumbers.error)}
				/>
				<StepVisualizerInputField
					id="rotated-array-target-input"
					label="Target"
					placeholder="0"
					value={targetInput}
					onChange={(e) => setTargetInput(e.target.value)}
					invalid={Boolean(parsedTarget.error)}
					size="secondary"
				/>
				<StepVisualizerApplyButton onClick={handleApply} disabled={!canApply} />
			</StepVisualizerInputSection>

			<StepVisualizerLayout
				codeTitle="Find Element in Rotated Array implementation"
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
								values={applied.numbers}
								activeIndex={step.mid}
								rangeStart={step.lo <= step.hi ? step.lo : undefined}
								rangeEnd={step.lo <= step.hi ? step.hi : undefined}
								targetIndex={targetIndex}
							/>
						</div>
						<TraceLine>{step.action}</TraceLine>
						<TraceLine>
							lo = {step.lo}, hi = {step.hi}
							{step.mid != null && `, mid = ${step.mid}`}
						</TraceLine>
						{step.result !== null && (
							<TraceLine variant={getPhaseVariant(step.phase)}>{step.result >= 0 ? `Result: ${step.result}` : "Result: -1 (not found)"}</TraceLine>
						)}
					</TracePanelContent>
				) : (
					<TraceEmptyState />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
