import type { Question } from "@/content/questions";

export const STATUS_LABELS: Record<Question["status"], string> = {
	todo: "To do",
	in_progress: "In progress",
	done: "Done",
};

export const STATUS_OPTIONS: { value: Question["status"]; label: string }[] = (["todo", "in_progress", "done"] as const).map((value) => ({
	value,
	label: STATUS_LABELS[value],
}));

export const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"] as const;

export const DIFFICULTY_OPTIONS: { value: Question["difficulty"]; label: string }[] = DIFFICULTY_LEVELS.map((value) => ({ value, label: value }));
