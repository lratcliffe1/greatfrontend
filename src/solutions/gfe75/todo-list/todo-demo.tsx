"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AppButton, MutedText } from "@/components/ui/tailwind-primitives";

type Task = {
	id: number;
	label: string;
};

const TODO_STORAGE_KEY = "todo-demo/tasks/v1";

function readStoredTasks(): Task[] {
	if (typeof window === "undefined") {
		return [];
	}

	try {
		const storedTasks = window.localStorage.getItem(TODO_STORAGE_KEY);
		if (!storedTasks) {
			return [];
		}

		const parsed = JSON.parse(storedTasks);
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed.filter((task): task is Task => {
			if (typeof task !== "object" || task === null) {
				return false;
			}
			const record = task as Partial<Task>;
			return typeof record.id === "number" && Number.isFinite(record.id) && typeof record.label === "string";
		});
	} catch {
		return [];
	}
}

function getNextTaskId(tasks: Task[]): number {
	return tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
}

export function TodoDemo() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [input, setInput] = useState("");
	const nextTaskIdRef = useRef(1);
	const hasHydratedFromStorageRef = useRef(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const trimmedInput = input.trim();
	const hasTasks = tasks.length > 0;
	const taskCountLabel = tasks.length === 1 ? "1 task" : `${tasks.length} tasks`;

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const scheduleFrame =
			typeof window.requestAnimationFrame === "function"
				? window.requestAnimationFrame.bind(window)
				: (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0);
		const cancelFrame =
			typeof window.cancelAnimationFrame === "function" ? window.cancelAnimationFrame.bind(window) : window.clearTimeout.bind(window);

		const animationFrameId = scheduleFrame(() => {
			const storedTasks = readStoredTasks();
			setTasks(storedTasks);
			nextTaskIdRef.current = getNextTaskId(storedTasks);
			hasHydratedFromStorageRef.current = true;
		});

		return () => {
			cancelFrame(animationFrameId);
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !hasHydratedFromStorageRef.current) {
			return;
		}

		window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(tasks));
	}, [tasks]);

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmed = input.trim();
		if (!trimmed) return;

		const nextTask: Task = {
			id: nextTaskIdRef.current,
			label: trimmed,
		};
		nextTaskIdRef.current += 1;
		setTasks((currentTasks) => [...currentTasks, nextTask]);
		setInput("");
		inputRef.current?.focus();
	}

	function onInputChange(event: ChangeEvent<HTMLInputElement>) {
		setInput(event.target.value);
	}

	function deleteTask(taskId: number) {
		setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
	}

	function removeAllTasks() {
		setTasks([]);
		inputRef.current?.focus();
	}

	return (
		<div className="space-y-4">
			<form className="flex gap-2" onSubmit={onSubmit}>
				<input
					id="task-name"
					ref={inputRef}
					autoFocus
					aria-label="Task name"
					value={input}
					onChange={onInputChange}
					placeholder="Add a task"
					maxLength={120}
					className="flex-1 rounded-md border border-slate-300 px-3 py-2"
				/>
				<AppButton type="submit" disabled={trimmedInput.length === 0}>
					Add
				</AppButton>
			</form>

			<div className="flex items-center justify-between gap-2">
				<MutedText aria-live="polite">{hasTasks ? `${taskCountLabel} in your list` : "No tasks yet. Add your first task."}</MutedText>

				<AppButton type="button" variant="dangerSubtle" size="sm" className="font-medium" onClick={removeAllTasks} disabled={tasks.length === 0}>
					Clear all
				</AppButton>
			</div>

			{hasTasks ? (
				<ul className="space-y-2">
					{tasks.map((task) => (
						<li key={task.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2">
							<span className="wrap-break-word">{task.label}</span>
							<AppButton
								type="button"
								variant="dangerSubtle"
								size="sm"
								className="font-medium"
								aria-label={`Delete task ${task.label}`}
								onClick={() => deleteTask(task.id)}
							>
								Delete
							</AppButton>
						</li>
					))}
				</ul>
			) : (
				<div className="rounded-md border border-dashed border-slate-300 px-3 py-3 text-center">
					<MutedText>Add a few tasks to plan your next steps.</MutedText>
				</div>
			)}
		</div>
	);
}
