import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Difficulty, QuestionStatus } from "@/content/questions";
import { STATUS_LABELS } from "@/lib/constants/filters";

type BaseProps = {
	children: ReactNode;
	className?: string;
};

/** Shared muted text styling. Use for secondary/helper text. */
export const MUTED_TEXT_CLASS = "text-sm [color:var(--muted)]";

const PRIMITIVE_CLASSES = {
	elevatedCard: "rounded-lg border p-4 shadow-sm [border-color:var(--card-border)] [background:var(--card-bg)]",
	surfacePanel: "rounded-md border p-3 [border-color:var(--card-border)] [background:var(--card-bg)]",
	codePanel: "rounded-md border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-100",
	tracePanel: "space-y-3 rounded-md border p-3 [border-color:var(--card-border)] [background:var(--surface)]",
	metaPill: "rounded-full px-2 py-1 text-xs font-medium [background:var(--surface)] [color:var(--muted)]",
	mutedText: MUTED_TEXT_CLASS,
} as const;

/** Shared primary button/link styling for use with AppButton or Link (teal-700 for WCAG AA contrast) */
export const PRIMARY_BUTTON_CLASSES =
	"rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus-visible:ring-teal-500";

/** Compact variant for nav links */
export const PRIMARY_BUTTON_SM_CLASSES =
	"rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus-visible:ring-teal-500";

const BUTTON_VARIANT_CLASSES = {
	primary:
		"border border-transparent bg-teal-700 text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:border-card-border disabled:[background:var(--card-bg)] disabled:text-muted disabled:hover:[background:var(--card-bg)] disabled:hover:text-muted dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus-visible:ring-teal-500 dark:disabled:[background:var(--card-bg)]",
	danger:
		"bg-red-600 text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-600",
	dangerSubtle:
		"bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-50",
} as const;

const BUTTON_SIZE_CLASSES = {
	md: "px-4 py-2 text-sm",
	sm: "px-2 py-1 text-sm",
	xs: "px-2 py-1 text-xs",
} as const;

function withClass(base: string, extra?: string) {
	return extra ? `${base} ${extra}` : base;
}

export function ElevatedCard({ children, className, ...props }: BaseProps & HTMLAttributes<HTMLElement>) {
	return (
		<article className={withClass(PRIMITIVE_CLASSES.elevatedCard, className)} {...props}>
			{children}
		</article>
	);
}

export function SurfacePanel({ children, className, ...props }: BaseProps & HTMLAttributes<HTMLElement>) {
	return (
		<section className={withClass(PRIMITIVE_CLASSES.surfacePanel, className)} {...props}>
			{children}
		</section>
	);
}

export function CodePanel({ children, className, ...props }: BaseProps & HTMLAttributes<HTMLElement>) {
	return (
		<section className={withClass(PRIMITIVE_CLASSES.codePanel, className)} {...props}>
			{children}
		</section>
	);
}

export function TracePanel({ children, className, ...props }: BaseProps & HTMLAttributes<HTMLElement>) {
	return (
		<section className={withClass(PRIMITIVE_CLASSES.tracePanel, className)} {...props}>
			{children}
		</section>
	);
}

export function MetaPill({ children }: { children: ReactNode }) {
	return <span className={PRIMITIVE_CLASSES.metaPill}>{children}</span>;
}

const DIFFICULTY_CLASSES = {
	Easy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
	Medium: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
	Hard: "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
} as const;

export function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
	return <span className={`rounded-full px-2 py-1 text-xs font-medium ${DIFFICULTY_CLASSES[difficulty]}`}>{difficulty}</span>;
}

const STATUS_CLASSES = {
	done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
	todo: "bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
	in_progress: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
} as const;

export function StatusBadge({ status }: { status: QuestionStatus }) {
	return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}>{STATUS_LABELS[status]}</span>;
}

export function AppButton({
	children,
	className,
	variant = "primary",
	size = "md",
	type = "button",
	...props
}: {
	children: ReactNode;
	className?: string;
	variant?: keyof typeof BUTTON_VARIANT_CLASSES;
	size?: keyof typeof BUTTON_SIZE_CLASSES;
	type?: "button" | "submit" | "reset";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">) {
	const baseClasses = "rounded-md font-semibold transition";
	const variantClasses = BUTTON_VARIANT_CLASSES[variant];
	const sizeClasses = BUTTON_SIZE_CLASSES[size];
	return (
		<button type={type} className={withClass(`${baseClasses} ${variantClasses} ${sizeClasses}`, className)} {...props}>
			{children}
		</button>
	);
}

export function StepControlButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick: () => void }) {
	return (
		<AppButton type="button" onClick={onClick} disabled={disabled}>
			{children}
		</AppButton>
	);
}

export function MutedText({ children, className }: { children: ReactNode; className?: string }) {
	return <p className={withClass(PRIMITIVE_CLASSES.mutedText, className)}>{children}</p>;
}

export function EditableFieldPrompt({ htmlFor, label, badgeLabel = "Editable" }: { htmlFor: string; label: string; badgeLabel?: string }) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<label className="text-sm font-medium text-foreground" htmlFor={htmlFor}>
				{label}
			</label>
			{badgeLabel && (
				<span className="rounded-full border border-teal-400/60 bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
					{badgeLabel}
				</span>
			)}
		</div>
	);
}
