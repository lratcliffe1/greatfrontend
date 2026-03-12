import { createSelector } from "@reduxjs/toolkit";

import type { Track } from "@/content/questions";
import type { RootState } from "@/lib/store";

const DEFAULT_TRACK_FILTERS = { search: "", category: "all", status: "all" } as const;

const selectTrackFilters = (state: RootState, track: Track) => state.filters.byTrack[track] ?? DEFAULT_TRACK_FILTERS;

export const selectSearch = createSelector(selectTrackFilters, (filters) => filters.search);

export const selectCategory = createSelector(selectTrackFilters, (filters) => filters.category);

export const selectStatus = createSelector(selectTrackFilters, (filters) => filters.status);

export const selectHasActiveFilters = createSelector(
	selectTrackFilters,
	(filters) => filters.search !== "" || filters.category !== "all" || filters.status !== "all",
);
