import type { Dispatch, SetStateAction } from "react";

export type StepNavigationResult<T> = {
	step: T | null;
	clampedIndex: number;
	onPrev: () => void;
	onNext: () => void;
	canPrev: boolean;
	canNext: boolean;
};

export function useStepNavigation<T>(steps: T[], stepIndex: number, setStepIndex: Dispatch<SetStateAction<number>>): StepNavigationResult<T> {
	const clampedIndex = steps.length > 0 ? Math.min(stepIndex, steps.length - 1) : 0;
	const step = steps[clampedIndex] ?? null;

	return {
		step,
		clampedIndex,
		onPrev: () => setStepIndex((c) => Math.max(c - 1, 0)),
		onNext: () => setStepIndex((c) => Math.min(c + 1, steps.length - 1)),
		canPrev: steps.length > 0 && stepIndex > 0,
		canNext: steps.length > 0 && stepIndex < steps.length - 1,
	};
}
