"use client";

const SELECT_CLASSES =
	"h-10 w-full min-w-0 appearance-none rounded border border-card-border bg-background bg-size-[1.25rem] bg-position-[right_0.5rem_center] bg-no-repeat px-3 py-2 pr-8 text-xs text-foreground focus:border-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus:border-teal-500 dark:focus-visible:ring-teal-500 sm:text-sm bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')]";

export type FilterSelectOption<T extends string = string> = {
	value: T;
	label: string;
};

type FilterSelectProps<T extends string> = {
	id: string;
	label: string;
	ariaLabel: string;
	value: T | "all";
	onChange: (value: T | "all") => void;
	options: FilterSelectOption<T>[];
	includeAllOption?: boolean;
	dataTestId?: string;
};

export function FilterSelect<T extends string>({
	id,
	label,
	ariaLabel,
	value,
	onChange,
	options,
	includeAllOption = true,
	dataTestId,
}: FilterSelectProps<T>) {
	const labelId = `${id}-heading`;

	return (
		<div data-testid={dataTestId} className="min-w-0" role="group" aria-labelledby={labelId}>
			<label id={labelId} htmlFor={id} className="mb-1 block text-xs text-muted">
				{label}
			</label>
			<select
				id={id}
				value={value}
				onChange={(event) => {
					const v = event.target.value as T | "all";
					onChange(v);
				}}
				aria-label={ariaLabel}
				className={SELECT_CLASSES}
			>
				{includeAllOption && <option value="all">All</option>}
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</div>
	);
}
