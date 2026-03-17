"use client";

import { startTransition, useMemo, useState } from "react";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { AppButton } from "@/components/ui/tailwind-primitives";
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

function buildCodeLines(initialValue: number | undefined): CodeLine[] {
	const init = initialValue ?? 0;
	return [
		{ line: 1, code: "Array.prototype.myReduce = function(callback, initialValue) {" },
		{ line: 2, code: "  let acc = initialValue ?? 0;" },
		{ line: 3, code: "  for (let i = 0; i < this.length; i++) {" },
		{ line: 4, code: "    acc = callback(acc, this[i], i, this);" },
		{ line: 5, code: "  }" },
		{ line: 6, code: "  return acc;" },
		{ line: 7, code: "};" },
		{ line: 8, code: "" },
		{ line: 9, code: "function reduceSum(arr, initialValue) {" },
		{ line: 10, code: "  const result = arr.myReduce(" },
		{ line: 11, code: "      (prev, curr) => prev + curr" },
		{ line: 12, code: `      , ${init});` },
		{ line: 13, code: "  return result;" },
		{ line: 14, code: "}" },
	];
}

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
	const codeLines = useMemo(() => buildCodeLines(appliedInitialValue), [appliedInitialValue]);

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
			<div className="space-y-3">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
					<div className="flex-1 space-y-1">
						<label htmlFor="reduce-array-input" className="block text-sm font-medium text-foreground">
							Array
						</label>
						<input
							id="reduce-array-input"
							className="w-full rounded-md border border-card-border bg-background px-3 py-2 text-foreground sm:flex-1"
							placeholder="1, 2, 3"
							value={arrayInput}
							onChange={(e) => setArrayInput(e.target.value)}
						/>
						{arrayError && <p className="text-sm text-amber-600 dark:text-amber-400">{arrayError}</p>}
					</div>
					<div className="w-28 space-y-1">
						<label htmlFor="reduce-initial-input" className="block text-sm font-medium text-foreground">
							Initial
						</label>
						<input
							id="reduce-initial-input"
							type="text"
							placeholder="0 (or empty)"
							value={initialValueInput}
							onChange={(e) => setInitialValueInput(e.target.value)}
							className="w-full rounded-md border border-card-border bg-background px-2 py-2 text-foreground"
						/>
						{initialError && <p className="text-sm text-amber-600 dark:text-amber-400">{initialError}</p>}
					</div>
					<AppButton type="button" onClick={handleApply} disabled={!canApply}>
						Apply
					</AppButton>
				</div>
				<p className="text-xs text-slate-400">Reducer: (prev, curr) =&gt; prev + curr. Leave initial empty to simulate no initial value.</p>
			</div>

			<StepVisualizerLayout
				codeTitle="Calling arr.myReduce"
				codeLines={codeLines}
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
