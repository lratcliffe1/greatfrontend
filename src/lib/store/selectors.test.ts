import {
	selectCategory,
	selectHasActiveFilters,
	selectSearch,
	selectStatus,
} from "@/lib/store/selectors";
import { graphqlApi } from "@/lib/graphql/api";
import filtersReducer, {
	resetFilters,
	setCategory,
	setSearch,
	setStatus,
} from "@/lib/store/filtersSlice";
import todoDemoReducer from "@/lib/store/todoDemoSlice";

function getState(filters: ReturnType<typeof filtersReducer>) {
	return {
		filters,
		todoDemo: todoDemoReducer(undefined as never, { type: "init" } as never),
		[graphqlApi.reducerPath]: graphqlApi.reducer(undefined, {
			type: "init",
		}),
	};
}

describe("selectors", () => {
	it("selectSearch returns search value", () => {
		const state = getState(filtersReducer(undefined, setSearch("debounce")));
		expect(selectSearch(state)).toBe("debounce");
	});

	it("selectCategory returns category value", () => {
		const state = getState(
			filtersReducer(undefined, setCategory("JavaScript functions")),
		);
		expect(selectCategory(state)).toBe("JavaScript functions");
	});

	it("selectStatus returns status value", () => {
		const state = getState(filtersReducer(undefined, setStatus("done")));
		expect(selectStatus(state)).toBe("done");
	});

	it("selectHasActiveFilters returns false when all default", () => {
		const state = getState(filtersReducer(undefined, { type: "init" }));
		expect(selectHasActiveFilters(state)).toBe(false);
	});

	it("selectHasActiveFilters returns true when search is set", () => {
		const state = getState(filtersReducer(undefined, setSearch("todo")));
		expect(selectHasActiveFilters(state)).toBe(true);
	});

	it("selectHasActiveFilters returns true when category is not all", () => {
		const state = getState(filtersReducer(undefined, setCategory("Quiz")));
		expect(selectHasActiveFilters(state)).toBe(true);
	});

	it("selectHasActiveFilters returns false after resetFilters", () => {
		const state = getState(
			filtersReducer(filtersReducer(undefined, setSearch("x")), resetFilters()),
		);
		expect(selectHasActiveFilters(state)).toBe(false);
	});
});
