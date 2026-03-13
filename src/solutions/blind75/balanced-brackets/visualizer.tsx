"use client";

import { startTransition, useState } from "react";

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
import { getBalancedBracketInputError, getBalancedBracketSteps } from "@/solutions/blind75/balanced-brackets/solution";

const CODE_LINES: CodeLine[] = [
	{ line: 1, code: 'const OPENING = new Set(["(", "{", "["]);' },
	{ line: 2, code: "const CLOSE_TO_OPEN = { ')': '(', '}': '{', ']': '[' };" },
	{ line: 3, code: "const OPEN_TO_CLOSE = { '(': ')', '{': '}', '[': ']' };" },
	{ line: 4, code: "" },
	{ line: 5, code: "export function getBalancedBracketSteps(input: string) {" },
	{ line: 6, code: "  const steps: BracketStep[] = [];" },
	{ line: 7, code: "  const stack: string[] = [];" },
	{ line: 8, code: "" },
	{ line: 9, code: "  for (const token of input) {" },
	{ line: 10, code: "    const isOpening = OPENING.has(token);" },
	{ line: 11, code: "    if (isOpening) { stack.push(token); continue; }" },
	{ line: 12, code: "" },
	{ line: 13, code: "    const expected = CLOSE_TO_OPEN[token];" },
	{ line: 14, code: "    const top = stack[stack.length - 1];" },
	{ line: 15, code: "    const valid = top === expected;" },
	{ line: 16, code: "    if (!valid) {" },
	{ line: 17, code: '      const expectedClose = top ? OPEN_TO_CLOSE[top] : "opening bracket"; return false;' },
	{ line: 18, code: "    }" },
	{ line: 19, code: "    stack.pop();" },
	{ line: 20, code: "  }" },
	{ line: 21, code: "" },
	{ line: 23, code: "  return stack.length === 0;" },
	{ line: 24, code: "}" },
];

const INITIAL_INPUT = "([]){}";

export function BalancedBracketsVisualizer() {
	const [input, setInput] = useState(INITIAL_INPUT);
	const [steps, setSteps] = useState(() => getBalancedBracketSteps(INITIAL_INPUT));
	const [stepIndex, setStepIndex] = useState(0);
	const { flash, tracePanelClassName } = useTraceFlash();

	const inputError = getBalancedBracketInputError(input);
	const { step, onPrev, onNext, canPrev, canNext } = useStepNavigation(steps, stepIndex, setStepIndex);
	const activeLine = step?.line ?? null;

	return (
		<StepVisualizerPage>
			<StepVisualizerInput
				label="Bracket input"
				hint="Use bracket characters. Only valid inputs within the problem constraints can be applied."
				inputId="bracket-input"
				placeholder="Try: ([]){}, ([)], or ((("
				value={input}
				onChange={setInput}
				error={inputError}
				onApply={() => {
					if (inputError) return;
					startTransition(() => {
						setSteps(getBalancedBracketSteps(input));
						setStepIndex(0);
						flash();
					});
				}}
				applyDisabled={Boolean(inputError)}
			/>

			<StepVisualizerLayout
				codeTitle="Balanced Brackets implementation"
				codeLines={CODE_LINES}
				activeLine={activeLine}
				traceTitle="Execution trace (step-by-step)"
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
						<TraceLine>Current token: {step.token}</TraceLine>
						<TraceLine>Action: {step.action}</TraceLine>
						<TraceLine>Stack: {step.stack.length ? step.stack.join(" ") : "(empty)"}</TraceLine>
						<TraceLine variant={step.validSoFar ? "success" : "error"}>{step.validSoFar ? "Valid so far" : "Invalid"}</TraceLine>
					</TracePanelContent>
				) : (
					<TraceEmptyState />
				)}
			</StepVisualizerLayout>
		</StepVisualizerPage>
	);
}
