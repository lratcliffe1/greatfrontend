"use client";

import { useState } from "react";
import { AppButton } from "@/components/ui/tailwind-primitives";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addTask, removeTask } from "@/lib/store/todoDemoSlice";

export function TodoDemo() {
	const dispatch = useAppDispatch();
	const tasks = useAppSelector((state) => state.todoDemo.tasks);
	const [input, setInput] = useState("");

	function onSubmit(event: React.ChangeEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmed = input.trim();
		if (!trimmed) return;

		dispatch(addTask(trimmed));
		setInput("");
	}

	function deleteTask(taskId: number) {
		dispatch(removeTask(taskId));
	}

	return (
		<div className="space-y-4">
			<form className="flex gap-2" onSubmit={onSubmit}>
				<input
					aria-label="Task name"
					value={input}
					onChange={(event) => setInput(event.target.value)}
					placeholder="Add a task"
					className="flex-1 rounded-md border border-slate-300 px-3 py-2"
				/>
				<AppButton type="submit">Submit</AppButton>
			</form>

			<ul className="space-y-2">
				{tasks.map((task) => (
					<li
						key={task.id}
						className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
					>
						<span>{task.label}</span>
						<AppButton
							type="button"
							variant="dangerSubtle"
							size="sm"
							className="font-medium"
							onClick={() => deleteTask(task.id)}
						>
							Delete
						</AppButton>
					</li>
				))}
			</ul>
		</div>
	);
}
