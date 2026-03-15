"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { hydrateFiltersFromQuery } from "@/lib/store/filtersSlice";
import { selectCategory, selectSearch, selectStatus, selectDifficulty } from "@/lib/store/selectors";
import type { Question, Track } from "@/content/questions";

export type TrackFilterValues = {
	search: string;
	category: string;
	status: Question["status"] | "all";
	difficulty: Question["difficulty"] | "all";
};

function isTrackStatus(value: string | null): value is Question["status"] {
	return value === "todo" || value === "in_progress" || value === "done";
}

function isTrackDifficulty(value: string | null): value is Question["difficulty"] {
	return value === "Easy" || value === "Medium" || value === "Hard";
}

/** Track-specific URL param names so each track's filters persist when switching. */
const URL_PARAMS = {
	gfe75: { search: "searchGfe", category: "categoryGfe", status: "statusGfe", difficulty: "difficultyGfe" },
	blind75: { search: "searchBlind", status: "statusBlind", difficulty: "difficultyBlind" },
} as const;

export function getUrlFilters(
	track: Track,
	searchString?: string,
): {
	hasFilterParams: boolean;
	filters: TrackFilterValues;
} {
	const DEFAULTS: TrackFilterValues = {
		search: "",
		category: "all",
		status: "all",
		difficulty: "all",
	};

	if (typeof window === "undefined" && searchString === undefined) {
		return { hasFilterParams: false, filters: DEFAULTS };
	}

	const queryString = searchString ?? (typeof window !== "undefined" ? window.location.search : "");
	const params = new URLSearchParams(queryString);
	const keys = URL_PARAMS[track];
	const statusParam = params.get(keys.status);
	const difficultyParam = params.get(keys.difficulty);
	const hasFilterParams =
		params.has(keys.search) || params.has(keys.status) || params.has(keys.difficulty) || (track === "gfe75" && params.has(URL_PARAMS.gfe75.category));

	return {
		hasFilterParams,
		filters: {
			search: params.get(keys.search) ?? "",
			category: track === "blind75" ? "all" : (params.get(URL_PARAMS.gfe75.category) ?? "all"),
			status: isTrackStatus(statusParam) ? statusParam : "all",
			difficulty: isTrackDifficulty(difficultyParam) ? difficultyParam : "all",
		},
	};
}

export function syncFiltersToUrl(track: Track, filters: TrackFilterValues) {
	if (typeof window === "undefined") {
		return;
	}
	if (window.location.pathname !== `/${track}`) return;

	const params = new URLSearchParams(window.location.search);
	const keys = URL_PARAMS[track];

	const normalizedSearch = filters.search.trim();
	if (normalizedSearch.length > 0) {
		params.set(keys.search, normalizedSearch);
	} else {
		params.delete(keys.search);
	}

	if (track === "gfe75" && filters.category !== "all") {
		params.set(URL_PARAMS.gfe75.category, filters.category);
	} else if (track === "gfe75") {
		params.delete(URL_PARAMS.gfe75.category);
	}

	if (filters.status !== "all") {
		params.set(keys.status, filters.status);
	} else {
		params.delete(keys.status);
	}

	if (filters.difficulty !== "all") {
		params.set(keys.difficulty, filters.difficulty);
	} else {
		params.delete(keys.difficulty);
	}

	const nextQuery = params.toString();
	const nextUrl = nextQuery ? `${window.location.pathname}?${nextQuery}` : window.location.pathname;
	window.history.replaceState(window.history.state, "", nextUrl);
}

/** Returns URL-derived filter state for initial hydration. Recomputes when track or URL changes. */
export function useUrlFilters(track: Track) {
	const searchParams = useSearchParams();
	// Use searchParams when available (Next.js); fall back to window.location in tests
	const search = searchParams?.toString();
	return useMemo(() => getUrlFilters(track, search || undefined), [track, search]);
}

/** Combines URL hydration, Redux state, and URL sync. Returns effective filter values for the given track. */
export function useFilterSync(track: Track) {
	const dispatch = useAppDispatch();
	const { hasFilterParams: hasUrlFilters, filters: initialUrlFilters } = useUrlFilters(track);
	const search = useAppSelector((state) => selectSearch(state, track));
	const category = useAppSelector((state) => selectCategory(state, track));
	const status = useAppSelector((state) => selectStatus(state, track));
	const difficulty = useAppSelector((state) => selectDifficulty(state, track));

	const [hasHydrated, setHasHydrated] = useState(false);

	// Reset hydration flag when track changes so we re-hydrate from URL on track switch
	useEffect(() => {
		startTransition(() => setHasHydrated(false));
	}, [track]);

	// Use URL params only for initial hydration; after that always use Redux so user changes work
	// (useSearchParams can be stale after replaceState, causing initialUrlFilters to override Redux)
	const shouldUseInitialUrlFilters = hasUrlFilters && !hasHydrated;
	const effectiveSearch = shouldUseInitialUrlFilters ? initialUrlFilters.search : search;
	const effectiveCategory = shouldUseInitialUrlFilters ? initialUrlFilters.category : category;
	const effectiveStatus = shouldUseInitialUrlFilters ? initialUrlFilters.status : status;
	const effectiveDifficulty = shouldUseInitialUrlFilters ? initialUrlFilters.difficulty : difficulty;

	// Hydrate Redux from URL once when we have URL params
	useEffect(() => {
		if (hasUrlFilters && !hasHydrated) {
			startTransition(() => setHasHydrated(true));
			dispatch(
				hydrateFiltersFromQuery({
					track,
					search: initialUrlFilters.search,
					category: initialUrlFilters.category,
					status: initialUrlFilters.status,
					difficulty: initialUrlFilters.difficulty,
				}),
			);
		}
	}, [dispatch, hasUrlFilters, hasHydrated, initialUrlFilters, track]);

	// Sync Redux to URL when filters change
	useEffect(() => {
		syncFiltersToUrl(track, {
			search: effectiveSearch,
			category: effectiveCategory,
			status: effectiveStatus,
			difficulty: effectiveDifficulty,
		});
	}, [effectiveCategory, effectiveDifficulty, effectiveSearch, effectiveStatus, track]);

	return { effectiveSearch, effectiveCategory, effectiveStatus, effectiveDifficulty };
}
