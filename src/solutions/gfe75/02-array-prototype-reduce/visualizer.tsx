"use client";

import { startTransition, useMemo, useState } from "react";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import {
	StepVisualizerApplyButton,
	StepVisualizerInputField,
	StepVisualizerInputSection,
} from "@/components/visualizer/step-visualizer-input-section";
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
import { parseCommaSeparatedIntegers, parseSingleInteger } from "@/lib/utils/parse-visualizer-user-inputs";
import { REDUCE_ARRAY_CONSTRAINTS, getReduceSteps } from "@/solutions/gfe75/02-array-prototype-reduce/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "Array.prototype.myReduce = function(callback, initialValue) {" },
	{ line: 2, code: "  let acc = initialValue ?? 0;" },
	{ line: 3, code: "  for (let i = 0; i < this.length; i++) {" },
	{ line: 4, code: "    acc = callback(acc, this[i], i, this);" },
	{ line: 5, code: "  }" },
	{ line: 6, code: "  return acc;" },
	{ line: 7, code: "};" },
	{ line: 8, code: "" },
	{ line: 9, code: "export function reduceSum(arr, initialValue) {" },
	{ line: 10, code: "  const result = arr.myReduce(" },
	{ line: 11, code: "      (prev, curr) => prev + curr" },
	{ line: 12, code: "      , initialValue);" },
	{ line: 13, code: "  return result;" },
	{ line: 14, code: "}" },
];

const INITIAL_ARRAY = "1, 2, 3, 4";
const INITIAL_VALUE = "5";

export function ArrayPrototypeReduceVisualizer() {
	const [arrayInput, setArrayInput] = useState(INITIAL_ARRAY);
	const [initialValueInput, setInitialValueInput] = useState(INITIAL_VALUE);
	const [stepIndex, setStepIndex] = useState(0);
	const { flash, tracePanelClassName } = useTraceFlash();

	const [appliedArray, setAppliedArray] = useState(() => {
		const result = parseCommaSeparatedIntegers(INITIAL_ARRAY, REDUCE_ARRAY_CONSTRAINTS);
		return result.data ?? [];
	});
	const [appliedInitialValue, setAppliedInitialValue] = useState<number | undefined>(() => {
		const r = parseSingleInteger(INITIAL_VALUE.trim(), { min: -100, max: 100 });
		return r.data ?? undefined;
	});

	const debouncedArrayInput = useDebouncedValue(arrayInput, 300);
	const debouncedInitialInput = useDebouncedValue(initialValueInput, 300);

	const parsedArray = useMemo(() => parseCommaSeparatedIntegers(debouncedArrayInput, REDUCE_ARRAY_CONSTRAINTS), [debouncedArrayInput]);
	const parsedInitial = useMemo(() => {
		const trimmed = debouncedInitialInput.trim();
		if (trimmed === "") return { data: undefined as number | undefined, error: null as string | null };
		return parseSingleInteger(trimmed, { min: -100, max: 100, label: "initial value" });
	}, [debouncedInitialInput]);

	const steps = useMemo(() => getReduceSteps(appliedArray, appliedInitialValue), [appliedArray, appliedInitialValue]);

	const { step, onPrev, onNext, canPrev, canNext } = useStepNavigation(steps, stepIndex, setStepIndex);
	const activeLine = step?.line ?? null;

	const arrayError = parsedArray.error;
	const initialError = parsedInitial.error;
	const canApply = !arrayError && !initialError;

	function handleApply() {
		const arrResult = parseCommaSeparatedIntegers(arrayInput, REDUCE_ARRAY_CONSTRAINTS);
		const trimmed = initialValueInput.trim();
		const initResult =
			trimmed === "" ? { data: undefined as number | undefined, error: null as string | null } : parseSingleInteger(trimmed, { min: -100, max: 100 });
		if (arrResult.error || arrResult.data === null) return;
		if (initResult.error) return;
		startTransition(() => {
			setAppliedArray(arrResult.data);
			setAppliedInitialValue(initResult.data ?? undefined);
			setStepIndex(0);
			flash();
		});
	}

	return (
		<StepVisualizerPage>
			<StepVisualizerInputSection error={arrayError ?? initialError}>
				<StepVisualizerInputField
					id="reduce-array-input"
					label="Array input"
					placeholder="Try: 1, 2, 3, 4"
					value={arrayInput}
					onChange={(e) => setArrayInput(e.target.value)}
					invalid={Boolean(arrayError)}
				/>
				<StepVisualizerInputField
					id="reduce-initial-input"
					label="Initial"
					placeholder="0 (or empty)"
					value={initialValueInput}
					onChange={(e) => setInitialValueInput(e.target.value)}
					invalid={Boolean(initialError)}
					size="secondary"
				/>
				<StepVisualizerApplyButton onClick={handleApply} disabled={!canApply} />
			</StepVisualizerInputSection>

			<StepVisualizerLayout
				codeTitle="Array.prototype.reduce implementation"
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
							<ArrayVisualization values={appliedArray} activeIndex={step.index} label="arr" />
						</div>
						<TraceLine variant="emphasized">Accumulator: {step.accumulator}</TraceLine>
						{step.currentValue !== null && (
							<TraceLine>
								Current value: arr[{step.index}] = {step.currentValue}
							</TraceLine>
						)}
						<TraceLine>{step.action}</TraceLine>
					</TracePanelContent>
				) : (
					<TraceEmptyState />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
