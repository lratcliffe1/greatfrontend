import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/gfe75");
	await expect(page.getByTestId("question-title-debounce")).toBeVisible();
});

test("filters questions by search", async ({ page }) => {
	const searchInput = page.getByTestId("filter-search");
	await searchInput.fill("Debounce");

	const questionTitles = page.getByTestId(/^question-title-/);
	await expect(questionTitles).toHaveCount(1);
	await expect(page.getByTestId("question-title-debounce")).toBeVisible();
});

test("filters questions by category", async ({ page }) => {
	await page.getByLabel("Filter by category").selectOption("Quiz");

	await expect(page.getByTestId("question-title-cookie-sessionstorage-localstorage")).toBeVisible();
});

test("filters questions by status", async ({ page }) => {
	await page.getByLabel("Filter by status").selectOption("done");

	await expect(page.getByTestId("question-title-debounce")).toBeVisible();
	await expect(page.getByTestId("question-title-array-prototype-reduce")).toHaveCount(0);
});

test("keeps filters below the progress summary before the wide breakpoint", async ({ page }) => {
	// Viewport < 712px so filters stack below progress (min-[712px] breakpoint)
	await page.setViewportSize({ width: 600, height: 900 });

	const progress = page.getByTestId("track-progress");
	const categorySelect = page.getByTestId("filter-category");
	const statusSelect = page.getByTestId("filter-status");
	const searchInput = page.getByTestId("filter-search");

	await expect(progress).toBeVisible();
	await expect(categorySelect).toBeVisible();
	await expect(statusSelect).toBeVisible();
	await expect(searchInput).toBeVisible();

	await expect
		.poll(async () => {
			const pb = await progress.boundingBox();
			const cb = await categorySelect.boundingBox();
			const sb = await statusSelect.boundingBox();
			const sib = await searchInput.boundingBox();
			if (!pb || !cb || !sb || !sib) return null;
			const progressBottom = pb.y + pb.height;
			const firstFilterTop = Math.min(cb.y, sb.y, sib.y);
			return firstFilterTop > progressBottom + 4;
		})
		.toBe(true);
});
