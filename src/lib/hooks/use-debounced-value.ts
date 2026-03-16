"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced version of the value. Updates after `delayMs` of no changes.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const id = setTimeout(() => setDebouncedValue(value), delayMs);
		return () => clearTimeout(id);
	}, [value, delayMs]);

	return debouncedValue;
}
