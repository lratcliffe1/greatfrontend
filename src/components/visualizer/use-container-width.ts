import { useEffect, useRef, useState } from "react";

/** Returns the content rect width of the ref'd element, updating on resize. */
export function useContainerWidth(): [React.RefObject<HTMLDivElement | null>, number] {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const ro = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) setWidth(entry.contentRect.width);
		});
		ro.observe(el);
		// Defer layout read to avoid forced reflow (reading getBoundingClientRect
		// synchronously after DOM updates triggers layout recalculation)
		const raf = requestAnimationFrame(() => {
			if (el.isConnected) setWidth(el.getBoundingClientRect().width);
		});
		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	}, []);

	return [ref, width];
}
