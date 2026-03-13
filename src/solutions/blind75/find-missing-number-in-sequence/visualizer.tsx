"use client";

import { startTransition, useMemo, useState } from "react";

import { AppButton, EditableFieldPrompt } from "@/components/ui/tailwind-primitives";
import { StepVisualizerLayout, type CodeLine } from "@/components/visualizer/step-visualizer-layout";
import {
	MISSING_NUMBER_CONSTRAINTS,
	getMissingNumberInputError,
	getMissingNumberSteps,
} from "@/solutions/blind75/find-missing-number-in-sequence/solution";

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

function parseNumbersInput(rawInput: string): {
	numbers: number[];
	error: string | null;
} {
	const trimmed = rawInput.trim();
	if (!trimmed) {
		return {
			numbers: [],
			error: `Enter between ${MISSING_NUMBER_CONSTRAINTS.minLength} and ${MISSING_NUMBER_CONSTRAINTS.maxLength} comma-separated integers.`,
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
			error: "Use whole numbers only, for example: 1, 3, 0",
		};
	}

	if (parts.length < MISSING_NUMBER_CONSTRAINTS.minLength || parts.length > MISSING_NUMBER_CONSTRAINTS.maxLength) {
		return {
			numbers: [],
			error: `Use between ${MISSING_NUMBER_CONSTRAINTS.minLength} and ${MISSING_NUMBER_CONSTRAINTS.maxLength} integers.`,
		};
	}

	const inputError = getMissingNumberInputError(numbers);
	if (inputError) {
		return { numbers: [], error: inputError };
	}

	return { numbers, error: null };
}

export function FindMissingNumberVisualizer() {
	const [input, setInput] = useState(INITIAL_INPUT);
	const [appliedNumbers, setAppliedNumbers] = useState(() => parseNumbersInput(INITIAL_INPUT).numbers);
	const [stepIndex, setStepIndex] = useState(0);

	const parsedInput = useMemo(() => parseNumbersInput(input), [input]);
	const steps = useMemo(() => getMissingNumberSteps(appliedNumbers), [appliedNumbers]);
	const clampedIndex = steps.length > 0 ? Math.min(stepIndex, steps.length - 1) : 0;
	const step = steps[clampedIndex] ?? null;
	const activeLine = step?.line ?? null;

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<EditableFieldPrompt
					htmlFor="missing-number-array-input"
					label="Numbers input"
					hint="Comma-separated integers in [0, n]. Must have n distinct values with exactly one missing from [0..n]."
				/>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<input
						id="missing-number-array-input"
						className="w-full rounded-md border border-card-border bg-background px-3 py-2 text-foreground sm:flex-1"
						aria-invalid={Boolean(parsedInput.error)}
						value={input}
						placeholder="Try: 1, 3, 0 or 3, 0, 4, 2, 1"
						onChange={(event) => {
							setInput(event.target.value);
						}}
					/>
					<AppButton
						type="button"
						onClick={() => {
							if (parsedInput.error) return;
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
				<div className="min-h-10">
					{parsedInput.error && (
						<p className="text-sm text-amber-600 dark:text-amber-400" role="alert">
							{parsedInput.error}
						</p>
					)}
				</div>
			</div>

			<StepVisualizerLayout
				codeTitle="Find Missing Number implementation"
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
					<div className="rounded border border-card-border bg-card-bg p-3 space-y-1">
						<p className="text-sm text-foreground">{step.action}</p>
						<p className="text-sm text-foreground">expectedSum = {step.expectedSum ?? "null"}</p>
						<p className="text-sm text-foreground">actualSum = {step.actualSum ?? "null"}</p>
						<p className="text-sm text-foreground">missing = {step.missing ?? "null"}</p>
						{step.missing !== null && <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Missing number: {step.missing}</p>}
					</div>
				) : (
					<p className="text-muted">No steps yet for this input.</p>
				)}
			</StepVisualizerLayout>
		</div>
	);
}
