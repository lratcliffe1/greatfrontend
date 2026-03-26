import { expect, test } from "@playwright/test";

/**
 * Filter UX is driven by Redux + controlled fields; Playwright often fails to move that state in prod.
 * These tests use shareable URLs instead: they assert that filter query params hydrate and the list matches.
 */
function trackUrl(params?: Record<string, string>) {
	const query = params ? new URLSearchParams(params).toString() : "";
	return query ? `/gfe75?${query}` : "/gfe75";
}

test("filters questions by search", async ({ page }) => {
	await page.goto(trackUrl({ searchGfe: "Debounce" }));
	await expect(page.getByTestId("question-title-debounce")).toBeVisible();
	await expect(page.getByTestId(/^question-title-/)).toHaveCount(1);
});

test("filters questions by category", async ({ page }) => {
	await page.goto(trackUrl({ categoryGfe: "Quiz" }));
	await expect(page.getByTestId("question-title-cookie-sessionstorage-localstorage")).toBeVisible();
});

test("filters questions by status", async ({ page }) => {
	await page.goto(trackUrl({ statusGfe: "done" }));
	await expect(page.getByTestId("question-title-debounce")).toBeVisible();
	await expect(page.getByTestId("question-title-array-prototype-reduce")).toBeVisible();
});

test("filters questions by difficulty", async ({ page }) => {
	await page.goto(trackUrl({ difficultyGfe: "Easy" }));
	await expect(page.getByTestId("question-title-array-prototype-reduce")).toBeVisible();
	await expect(page.getByTestId("question-title-debounce")).toHaveCount(0);
});

test("keeps filters below the progress summary before the wide breakpoint", async ({ page }) => {
	await page.setViewportSize({ width: 600, height: 900 });
	await page.goto(trackUrl());

	const progress = page.getByTestId("track-progress");
	const categorySelect = page.getByTestId("filter-category");
	const difficultySelect = page.getByTestId("filter-difficulty");
	const statusSelect = page.getByTestId("filter-status");
	const searchInput = page.getByTestId("filter-search");

	await expect(progress).toBeVisible();
	await expect(categorySelect).toBeVisible();
	await expect(difficultySelect).toBeVisible();
	await expect(statusSelect).toBeVisible();
	await expect(searchInput).toBeVisible();

	await expect
		.poll(async () => {
			const pb = await progress.boundingBox();
			const cb = await categorySelect.boundingBox();
			const db = await difficultySelect.boundingBox();
			const sb = await statusSelect.boundingBox();
			const sib = await searchInput.boundingBox();
			if (!pb || !cb || !db || !sb || !sib) return null;
			const progressBottom = pb.y + pb.height;
			const firstFilterTop = Math.min(cb.y, db.y, sb.y, sib.y);
			return firstFilterTop > progressBottom + 4;
		})
		.toBe(true);
});
