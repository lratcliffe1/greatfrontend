"use client";

import { AppButton, EditableFieldPrompt } from "@/components/ui/tailwind-primitives";

const INPUT_CLASSES = "w-full rounded-md border border-card-border bg-background px-3 py-2 text-foreground sm:flex-1";

const ERROR_CLASSES = "text-sm text-amber-600 dark:text-amber-400";

type StepVisualizerInputProps = {
	label: string;
	hint: string;
	inputId: string;
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	error: string | null;
	onApply: () => void;
	applyDisabled: boolean;
};

export function StepVisualizerInput({ label, hint, inputId, placeholder, value, onChange, error, onApply, applyDisabled }: StepVisualizerInputProps) {
	return (
		<div className="space-y-2">
			<EditableFieldPrompt htmlFor={inputId} label={label} hint={hint} />
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<input
					id={inputId}
					className={INPUT_CLASSES}
					aria-invalid={Boolean(error)}
					value={value}
					placeholder={placeholder}
					onChange={(e) => onChange(e.target.value)}
				/>
				<AppButton type="button" onClick={onApply} disabled={applyDisabled}>
					Apply input
				</AppButton>
			</div>
			<div className="min-h-10">
				{error && (
					<p className={ERROR_CLASSES} role="alert">
						{error}
					</p>
				)}
			</div>
		</div>
	);
}
