import { useCallback, useEffect, useRef, useState } from "react";

const FLASH_DURATION_MS = 720;
const FLASH_RING_CLASSES = "ring-2 ring-teal-500/70 ring-offset-2 ring-offset-background";

export function useTraceFlash() {
	const [isFlashing, setIsFlashing] = useState(false);
	const rafRef = useRef<number | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const flash = useCallback(() => {
		if (rafRef.current !== null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		setIsFlashing(false);
		rafRef.current = requestAnimationFrame(() => {
			setIsFlashing(true);
			timeoutRef.current = setTimeout(() => {
				setIsFlashing(false);
				timeoutRef.current = null;
			}, FLASH_DURATION_MS);
			rafRef.current = null;
		});
	}, []);

	useEffect(() => {
		return () => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
			}
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return { flash, tracePanelClassName: isFlashing ? FLASH_RING_CLASSES : undefined };
}
