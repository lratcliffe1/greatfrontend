"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { AppButton, MutedText } from "@/components/ui/tailwind-primitives";
import { useAddTaskMutation, useClearTasksMutation, useRemoveTaskMutation, useTasksQuery } from "@/lib/graphql/api";

export function TodoDemo() {
	const inputRef = useRef<HTMLInputElement>(null);
	const { data: tasks = [], isLoading, isError } = useTasksQuery();
	const [addTask, { isLoading: isAdding }] = useAddTaskMutation();
	const [removeTask] = useRemoveTaskMutation();
	const [clearTasks, { isLoading: isClearing }] = useClearTasksMutation();

	const [input, setInput] = useState("");
	const trimmedInput = input.trim();
	const hasTasks = tasks.length > 0;
	const taskCountLabel = tasks.length === 1 ? "1 task" : `${tasks.length} tasks`;

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	function onSubmit(event: ChangeEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!trimmedInput) return;
		const label = trimmedInput;
		setInput("");
		const nativeEvent = event.nativeEvent as SubmitEvent | Event;
		if ("submitter" in nativeEvent && nativeEvent.submitter instanceof HTMLElement) {
			nativeEvent.submitter.blur();
		}
		setTimeout(() => inputRef.current?.focus(), 0);
		queueMicrotask(() => {
			addTask({ label })
				.unwrap()
				.catch(() => {
					/* RTK Query surfaces errors via mutation state */
				});
		});
	}

	function deleteTask(taskId: number) {
		queueMicrotask(() => {
			removeTask({ id: taskId })
				.unwrap()
				.catch(() => {
					/* RTK Query surfaces errors via mutation state */
				});
		});
	}

	function removeAllTasks() {
		setTimeout(() => inputRef.current?.focus(), 0);
		queueMicrotask(() => {
			clearTasks()
				.unwrap()
				.catch(() => {
					/* RTK Query surfaces errors via mutation state */
				});
		});
	}

	if (isLoading) {
		return <MutedText>Loading tasks...</MutedText>;
	}

	if (isError) {
		return (
			<p role="alert" className="text-sm text-red-700 dark:text-red-200">
				Failed to load tasks. Check that the GraphQL API is running.
			</p>
		);
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
					onChange={(e) => setInput(e.target.value)}
					placeholder="Add a task"
					maxLength={120}
					disabled={isAdding}
					className="flex-1 rounded-md border border-card-border px-3 py-2 disabled:opacity-50"
				/>
				<AppButton type="submit" disabled={trimmedInput.length === 0 || isAdding}>
					{isAdding ? "Adding..." : "Add"}
				</AppButton>
			</form>

			<div className="flex items-center justify-between gap-2">
				<MutedText aria-live="polite">{hasTasks ? `${taskCountLabel} in your list` : "No tasks yet. Add your first task."}</MutedText>

				<AppButton
					type="button"
					variant="dangerSubtle"
					size="sm"
					className="font-medium"
					onClick={removeAllTasks}
					disabled={tasks.length === 0 || isClearing}
				>
					{isClearing ? "Clearing..." : "Clear all"}
				</AppButton>
			</div>

			{hasTasks ? (
				<ul className="space-y-2">
					{tasks.map((task) => (
						<li key={task.id} className="flex items-center justify-between gap-3 rounded-md border border-card-border px-3 py-2">
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
				<div className="rounded-md border border-dashed border-card-border px-3 py-3 text-center">
					<MutedText>Add a few tasks to plan your next steps.</MutedText>
				</div>
			)}
		</div>
	);
}
