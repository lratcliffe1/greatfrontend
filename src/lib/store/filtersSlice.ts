import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Question, QuestionStatus, Track } from "@/content/questions";

type TrackFilters = {
	search: string;
	category: string;
	status: QuestionStatus | "all";
	difficulty: Question["difficulty"] | "all";
};

type FiltersState = {
	byTrack: Record<Track, TrackFilters>;
};

type TrackScopedPayload<TValue> = {
	track: Track;
	value: TValue;
};

function createDefaultTrackFilters(): TrackFilters {
	return {
		search: "",
		category: "all",
		status: "all",
		difficulty: "all",
	};
}

const initialState: FiltersState = {
	byTrack: {
		gfe75: createDefaultTrackFilters(),
		blind75: createDefaultTrackFilters(),
	},
};

const filtersSlice = createSlice({
	name: "filters",
	initialState,
	reducers: {
		setSearch(state, action: PayloadAction<TrackScopedPayload<string>>) {
			state.byTrack[action.payload.track].search = action.payload.value;
		},
		setCategory(state, action: PayloadAction<TrackScopedPayload<string>>) {
			state.byTrack[action.payload.track].category = action.payload.value;
		},
		setStatus(state, action: PayloadAction<TrackScopedPayload<QuestionStatus | "all">>) {
			state.byTrack[action.payload.track].status = action.payload.value;
		},
		setDifficulty(state, action: PayloadAction<TrackScopedPayload<Question["difficulty"] | "all">>) {
			state.byTrack[action.payload.track].difficulty = action.payload.value;
		},
		hydrateFiltersFromQuery(
			state,
			action: PayloadAction<{
				track: Track;
				search: string;
				category: string;
				status: QuestionStatus | "all";
				difficulty: Question["difficulty"] | "all";
			}>,
		) {
			state.byTrack[action.payload.track] = {
				search: action.payload.search,
				category: action.payload.category,
				status: action.payload.status,
				difficulty: action.payload.difficulty,
			};
		},
		// Kept for future UX flows (e.g. "Clear filters" button).
		resetFilters(state) {
			state.byTrack.gfe75 = createDefaultTrackFilters();
			state.byTrack.blind75 = createDefaultTrackFilters();
		},
		resetFiltersForTrack(state, action: PayloadAction<Track>) {
			state.byTrack[action.payload] = createDefaultTrackFilters();
		},
	},
});

export const { setSearch, setCategory, setStatus, setDifficulty, hydrateFiltersFromQuery, resetFilters, resetFiltersForTrack } = filtersSlice.actions;

export default filtersSlice.reducer;
