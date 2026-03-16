"use client";

import { startTransition, useMemo, useState } from "react";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { ArrayVisualization } from "@/components/visualizer/array-visualization";
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
import { parseCommaSeparatedIntegers, parseK } from "@/lib/utils/parse-visualizer-user-inputs";
import { MOST_COMMON_ELEMENTS_CONSTRAINTS, getMostCommonElementsSteps } from "@/solutions/blind75/most-common-elements/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "export function mostCommonElements(numbers: number[], k: number) {" },
	{ line: 2, code: "  const freq = new Map<number, number>();" },
	{ line: 3, code: "  for (let i = 0; i < numbers.length; i++) {" },
	{ line: 4, code: "    freq.set(numbers[i], (freq.get(numbers[i]) ?? 0) + 1);" },
	{ line: 5, code: "  }" },
	{ line: 6, code: "  const sorted = [...freq.entries()].sort((a,b) =>" },
	{ line: 7, code: "    b[1] !== a[1] ? b[1] - a[1] : a[0] - b[0]);" },
	{ line: 8, code: "  return sorted.slice(0, k).map(([n]) => n);" },
	{ line: 9, code: "}" },
];

const INITIAL_NUMBERS = "4, 4, 4, 6, 6, 5, 5, 5";
const INITIAL_K = "2";

const INPUT_CLASSES = "rounded-md border border-card-border bg-background px-3 py-2 text-foreground";
const ERROR_CLASSES = "text-sm text-amber-600 dark:text-amber-400";

export function MostCommonElementsVisualizer() {
	const [numbersInput, setNumbersInput] = useState(INITIAL_NUMBERS);
	const [kInput, setKInput] = useState(INITIAL_K);
	const [stepIndex, setStepIndex] = useState(0);
	const { flash, tracePanelClassName } = useTraceFlash();
	const [applied, setApplied] = useState<{ numbers: number[]; k: number }>(() => {
		const nums = parseCommaSeparatedIntegers(INITIAL_NUMBERS, MOST_COMMON_ELEMENTS_CONSTRAINTS);
		const k = parseK(INITIAL_K);
		return {
			numbers: nums.data ?? [],
			k: k.data ?? 2,
		};
	});

	const debouncedNumbersInput = useDebouncedValue(numbersInput, 300);
	const parsedNumbers = useMemo(
		() => parseCommaSeparatedIntegers(debouncedNumbersInput, MOST_COMMON_ELEMENTS_CONSTRAINTS),
		[debouncedNumbersInput],
	);
	const parsedK = useMemo(() => parseK(kInput), [kInput]);

	const kError = useMemo(() => {
		if (parsedK.error) return parsedK.error;
		if (parsedNumbers.data && parsedK.data !== null) {
			const uniqueCount = new Set(parsedNumbers.data).size;
			if (parsedK.data > uniqueCount) {
				return `k must be between 1 and ${uniqueCount} (unique elements).`;
			}
		}
		return null;
	}, [parsedK, parsedNumbers.data]);

	const steps = useMemo(() => getMostCommonElementsSteps(applied.numbers, applied.k), [applied.numbers, applied.k]);
	const { step, onPrev, onNext, canPrev, canNext } = useStepNavigation(steps, stepIndex, setStepIndex);
	const activeLine = step?.line ?? null;

	const canApply = !parsedNumbers.error && !kError && parsedNumbers.data !== null && parsedK.data !== null;

	const handleApply = () => {
		const numsResult = parseCommaSeparatedIntegers(numbersInput, MOST_COMMON_ELEMENTS_CONSTRAINTS);
		const kResult = parseK(kInput);
		if (numsResult.error || numsResult.data === null || kResult.error || kResult.data === null) return;
		const uniqueCount = new Set(numsResult.data).size;
		if (kResult.data > uniqueCount) return;
		startTransition(() => {
			setApplied({ numbers: numsResult.data, k: kResult.data });
			setStepIndex(0);
			flash();
		});
	};

	const freqDisplay = step && !step.sorted ? [...step.freq.entries()].map(([n, c]) => `${n}:${c}`).join(", ") : null;
	const sortedDisplay = step?.sorted != null ? step.sorted.map(([n]) => n).join(", ") : null;

	return (
		<StepVisualizerPage>
			<div className="space-y-2">
				<EditableFieldPrompt
					htmlFor="most-common-numbers-input"
					label="Numbers input"
					hint="Comma-separated integers. Constraints: 1–1000 elements, each in [-10,000, 10,000]."
				/>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<input
						id="most-common-numbers-input"
						className={`${INPUT_CLASSES} w-full min-w-0 sm:flex-1`}
						aria-invalid={Boolean(parsedNumbers.error)}
						value={numbersInput}
						placeholder="Try: 4, 4, 4, 6, 6, 5, 5, 5"
						onChange={(e) => setNumbersInput(e.target.value)}
					/>
					<div className="flex shrink-0 items-center gap-2">
						<label htmlFor="most-common-k-input" className="text-sm font-medium text-foreground">
							k:
						</label>
						<input
							id="most-common-k-input"
							type="text"
							className={`${INPUT_CLASSES} w-14`}
							value={kInput}
							onChange={(e) => setKInput(e.target.value)}
							placeholder="2"
							aria-invalid={Boolean(kError)}
						/>
					</div>
					<AppButton type="button" onClick={handleApply} disabled={!canApply} className="shrink-0">
						Apply input
					</AppButton>
				</div>
				<div className="min-h-10">
					{(parsedNumbers.error || kError) && (
						<p className={ERROR_CLASSES} role="alert">
							{parsedNumbers.error ?? kError}
						</p>
					)}
				</div>
			</div>

			<StepVisualizerLayout
				codeTitle="Most Common Elements implementation"
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
							<ArrayVisualization values={applied.numbers} activeIndex={step.index} />
						</div>
						<TraceLine>{step.action}</TraceLine>
						{freqDisplay != null && <TraceLine>freq: {`{${freqDisplay}}`}</TraceLine>}
						{sortedDisplay != null && <TraceLine>sorted: [{sortedDisplay}]</TraceLine>}
						{step.result !== null && <TraceLine variant="emphasized">Result: [{step.result.join(", ")}]</TraceLine>}
					</TracePanelContent>
				) : (
					<TraceEmptyState />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
