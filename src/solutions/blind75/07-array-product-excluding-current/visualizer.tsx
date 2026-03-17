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
	PRODUCT_EXCLUDING_CURRENT_CONSTRAINTS,
	getProductExcludingCurrentSteps,
} from "@/solutions/blind75/07-array-product-excluding-current/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "export function arrayProductExcludingCurrent(numbers: number[]) {" },
	{ line: 2, code: "  const result = new Array(numbers.length);" },
	{ line: 3, code: "  let left = 1;" },
	{ line: 4, code: "  for (let i = 0; i < numbers.length; i++) {" },
	{ line: 5, code: "    result[i] = left;" },
	{ line: 6, code: "    left *= numbers[i];" },
	{ line: 7, code: "  }" },
	{ line: 8, code: "  let right = 1;" },
	{ line: 9, code: "  for (let i = numbers.length - 1; i >= 0; i--) {" },
	{ line: 10, code: "    result[i] *= right;" },
	{ line: 11, code: "    right *= numbers[i];" },
	{ line: 12, code: "  }" },
	{ line: 13, code: "  return result;" },
	{ line: 14, code: "}" },
];

const INITIAL_INPUT = "1, 2, 3, 4";

export function ArrayProductExcludingCurrentVisualizer() {
	const [input, setInput] = useState(INITIAL_INPUT);
	const [stepIndex, setStepIndex] = useState(0);
	const { flash, tracePanelClassName } = useTraceFlash();
	const [appliedNumbers, setAppliedNumbers] = useState(() => {
		const result = parseCommaSeparatedIntegers(INITIAL_INPUT, PRODUCT_EXCLUDING_CURRENT_CONSTRAINTS);
		return result.data ?? [];
	});

	const debouncedInput = useDebouncedValue(input, 300);
	const parsedInput = useMemo(() => parseCommaSeparatedIntegers(debouncedInput, PRODUCT_EXCLUDING_CURRENT_CONSTRAINTS), [debouncedInput]);
	const steps = useMemo(() => getProductExcludingCurrentSteps(appliedNumbers), [appliedNumbers]);
	const { step, onPrev, onNext, canPrev, canNext } = useStepNavigation(steps, stepIndex, setStepIndex);
	const activeLine = step?.line ?? null;

	return (
		<StepVisualizerPage>
			<StepVisualizerInput
				label="Numbers input"
				inputId="product-excluding-current-input"
				placeholder="Try: 1, 2, 3 or 2, 0, 3"
				value={input}
				onChange={setInput}
				error={parsedInput.error}
				onApply={() => {
					const result = parseCommaSeparatedIntegers(input, PRODUCT_EXCLUDING_CURRENT_CONSTRAINTS);
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
				codeTitle="Array Product Excluding Current implementation"
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
							<ArrayVisualization values={appliedNumbers} activeIndex={step.index} label="Input array" />
						</div>
						<TraceLine>Pass: {step.pass}</TraceLine>
						<TraceLine>left: {step.left}</TraceLine>
						<TraceLine>right: {step.right}</TraceLine>
						<TraceLine>result: [{step.result.join(", ")}]</TraceLine>
						<TraceLine>{step.action}</TraceLine>
						{step.pass === "done" && <TraceLine variant="emphasized">Final: [{step.result.join(", ")}]</TraceLine>}
					</TracePanelContent>
				) : (
					<TraceEmptyState />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
