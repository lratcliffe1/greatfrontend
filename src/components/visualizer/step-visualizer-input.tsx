"use client";

import { StepVisualizerApplyButton, StepVisualizerInputField, StepVisualizerInputSection } from "./step-visualizer-input-section";

type StepVisualizerInputProps = {
	label: string;
	inputId: string;
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	error: string | null;
	onApply: () => void;
	applyDisabled: boolean;
};

export function StepVisualizerInput({ label, inputId, placeholder, value, onChange, error, onApply, applyDisabled }: StepVisualizerInputProps) {
	return (
		<StepVisualizerInputSection inputId={inputId} error={error}>
			<StepVisualizerInputField
				id={inputId}
				label={label}
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				invalid={Boolean(error)}
			/>
			<StepVisualizerApplyButton onClick={onApply} disabled={applyDisabled} />
		</StepVisualizerInputSection>
	);
}
