"use client";

import type { ReactNode } from "react";

import { AppButton, EditableFieldPrompt } from "@/components/ui/tailwind-primitives";
import { ERROR_CLASSES, INPUT_CLASSES } from "./visualizer-input-constants";

/** Shared layout for visualizer input sections. Matches Most Common Elements pattern. */
export function StepVisualizerInputSection({
	label,
	inputId,
	error,
	alignRow,
	sectionLabelBadge = true,
	children,
}: {
	label?: string;
	inputId?: string;
	error: string | null;
	alignRow?: "start" | "end";
	/** When false, section label has no Editable badge (for group labels). */
	sectionLabelBadge?: boolean;
	children: ReactNode;
}) {
	return (
		<div className="space-y-2">
			{label != null && inputId != null && <EditableFieldPrompt htmlFor={inputId} label={label} badgeLabel={sectionLabelBadge ? "Editable" : ""} />}
			<div className={`flex flex-col gap-3 sm:flex-row sm:items-end ${alignRow === "end" ? "sm:justify-end" : ""}`}>{children}</div>
			<div className="min-h-6">
				{error && (
					<p className={ERROR_CLASSES} role="alert">
						{error}
					</p>
				)}
			</div>
		</div>
	);
}

/** Input field with label above and editable tag. Use size="secondary" for compact inputs (k, Initial, etc). */
export function StepVisualizerInputField({
	id,
	label,
	placeholder,
	value,
	onChange,
	invalid,
	size = "primary",
	type = "text",
}: {
	id: string;
	label: string;
	placeholder: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	invalid?: boolean;
	size?: "primary" | "secondary";
	type?: string;
}) {
	const isSecondary = size === "secondary";
	return (
		<div className={isSecondary ? "flex shrink-0 flex-col gap-1" : "flex min-w-0 flex-1 flex-col gap-1"}>
			<EditableFieldPrompt htmlFor={id} label={label} />
			<input
				id={id}
				type={type}
				className={isSecondary ? `${INPUT_CLASSES} w-40` : `${INPUT_CLASSES} w-full min-w-0 sm:flex-1`}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				aria-invalid={invalid}
			/>
		</div>
	);
}

/** Apply button for visualizer inputs. */
export function StepVisualizerApplyButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
	return (
		<AppButton type="button" onClick={onClick} disabled={disabled} className="mb-0.5 shrink-0 sm:mb-0.5">
			Apply input
		</AppButton>
	);
}
