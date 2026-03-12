"use client";

import { startTransition, useMemo, useState } from "react";

import { AppButton, EditableFieldPrompt } from "@/components/ui/tailwind-primitives";
import { StepVisualizerLayout, type CodeLine } from "@/components/visualizer/step-visualizer-layout";
import { DUPLICATE_ARRAY_CONSTRAINTS, getDuplicateScanSteps, type DuplicateScanOutcome } from "@/solutions/blind75/find-duplicates-in-array/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: "export function hasDuplicate(numbers: number[]) {" },
	{ line: 2, code: "  const seen = new Set<number>();" },
	{ line: 3, code: "  for (const [index, value] of numbers.entries()) {" },
	{
		line: 4,
		code: "    if (seen.has(value)) {",
	},
	{ line: 5, code: "      return true;" },
	{ line: 6, code: "    }" },
	{ line: 7, code: "    seen.add(value);" },
	{ line: 8, code: "  }" },
	{ line: 9, code: "  return false;" },
	{ line: 10, code: "}" },
];

const INITIAL_INPUT = "10, 7, 0, 0, 9";

function parseNumbersInput(rawInput: string) {
	const trimmed = rawInput.trim();
	if (!trimmed) {
		return {
			numbers: [],
			error: `Enter between ${DUPLICATE_ARRAY_CONSTRAINTS.minLength} and ${DUPLICATE_ARRAY_CONSTRAINTS.maxLength} integers.`,
		};
	}

	const parts = trimmed.split(",").map((part) => part.trim());
	if (parts.some((part) => part.length === 0)) {
		return {
			numbers: [],
			error: "Use comma-separated integers without empty entries.",
		};
	}

	const numbers = parts.map((part) => Number(part));
	if (numbers.some((value) => !Number.isInteger(value))) {
		return {
			numbers: [],
			error: "Use whole numbers only, for example: 5, 7, 1, 3",
		};
	}

	if (parts.length < DUPLICATE_ARRAY_CONSTRAINTS.minLength || parts.length > DUPLICATE_ARRAY_CONSTRAINTS.maxLength) {
		return {
			numbers: [],
			error: `Use between ${DUPLICATE_ARRAY_CONSTRAINTS.minLength} and ${DUPLICATE_ARRAY_CONSTRAINTS.maxLength} integers.`,
		};
	}

	const outOfRangeValue = numbers.find((value) => value < DUPLICATE_ARRAY_CONSTRAINTS.minValue || value > DUPLICATE_ARRAY_CONSTRAINTS.maxValue);
	if (outOfRangeValue !== undefined) {
		return {
			numbers: [],
			error: `Each integer must stay within ${DUPLICATE_ARRAY_CONSTRAINTS.minValue} and ${DUPLICATE_ARRAY_CONSTRAINTS.maxValue}.`,
		};
	}

	return {
		numbers,
		error: null,
	};
}

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

function getOutcomeClasses(outcome: DuplicateScanOutcome) {
	switch (outcome) {
		case "duplicate":
			return "text-amber-700 dark:text-amber-400";
		case "complete":
			return "text-emerald-700 dark:text-emerald-400";
		default:
			return "text-foreground";
	}
}

export function FindDuplicatesInArrayVisualizer() {
	const [input, setInput] = useState(INITIAL_INPUT);
	const [appliedNumbers, setAppliedNumbers] = useState(parseNumbersInput(INITIAL_INPUT).numbers);
	const [stepIndex, setStepIndex] = useState(0);

	const parsedInput = useMemo(() => parseNumbersInput(input), [input]);
	const steps = useMemo(() => getDuplicateScanSteps(appliedNumbers), [appliedNumbers]);
	const step = steps[Math.min(stepIndex, Math.max(steps.length - 1, 0))] ?? null;
	const activeLine = step?.line ?? null;

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<EditableFieldPrompt
					htmlFor="duplicate-array-input"
					label="Numbers input"
					hint="Use comma-separated integers. Only valid inputs within the problem constraints can be applied."
				/>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<input
						id="duplicate-array-input"
						className="w-full rounded-md border border-card-border bg-background px-3 py-2 text-foreground sm:flex-1"
						aria-invalid={Boolean(parsedInput.error)}
						value={input}
						placeholder="Try: 5, 7, 1, 3 or 10, 7, 0, 0, 9"
						onChange={(event) => {
							setInput(event.target.value);
						}}
					/>
					<AppButton
						type="button"
						onClick={() => {
							if (parsedInput.error) return;
							// Defer so the click can paint first; step computation runs in transition (better INP).
							startTransition(() => {
								setAppliedNumbers(parsedInput.numbers);
								setStepIndex(0);
							});
						}}
						disabled={Boolean(parsedInput.error)}
					>
						Apply input
					</AppButton>
				</div>
			</div>

			<StepVisualizerLayout
				codeTitle="Find Duplicates in Array implementation"
				codeLines={CODE_LINES}
				activeLine={activeLine}
				traceTitle="Execution trace (step-by-step)"
				stepIndex={stepIndex}
				totalSteps={steps.length}
				onPrev={() => setStepIndex((current) => Math.max(current - 1, 0))}
				onNext={() => setStepIndex((current) => Math.min(current + 1, steps.length - 1))}
				canPrev={steps.length > 0 && stepIndex > 0}
				canNext={steps.length > 0 && stepIndex < steps.length - 1}
			>
				{step ? (
					<div className="rounded border border-card-border bg-card-bg p-3">
						<p className="text-sm text-foreground">Current index: {step.index ?? "(done)"}</p>
						<p className="text-sm text-foreground">Current value: {step.value ?? "(none)"}</p>
						<p className="text-sm text-foreground">Action: {step.action}</p>
						<p className="text-sm text-foreground">Seen set: {step.seen.length ? step.seen.join(", ") : "(empty)"}</p>
						<p className={`text-sm font-semibold ${getOutcomeClasses(step.outcome)}`}>{getOutcomeLabel(step.outcome)}</p>
					</div>
				) : (
					<p className="text-muted">No steps yet for this input.</p>
				)}
			</StepVisualizerLayout>
		</div>
	);
}
