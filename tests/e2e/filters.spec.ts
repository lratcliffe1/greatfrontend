import { expect, test } from "@playwright/test";

test("filters questions by search", async ({ page }) => {
	await page.goto("/gfe75");

	// Wait for questions to load before filtering
	await expect(page.getByTestId("question-title-debounce")).toBeVisible();

	const searchInput = page.getByTestId("filter-search");
	await searchInput.fill("Debounce");

	// Assert filtered list: exactly one question card visible, and it's Debounce
	const questionTitles = page.locator("[data-testid^='question-title-']");
	await expect(questionTitles).toHaveCount(1);
	await expect(page.getByTestId("question-title-debounce")).toBeVisible();
});

test("filters questions by category", async ({ page }) => {
	await page.goto("/gfe75");

	await page
		.getByTestId("filter-category")
		.locator("[role='combobox']")
		.click();
	await page.getByRole("option", { name: "Quiz" }).click();

	await expect(
		page.getByTestId("question-title-cookie-sessionstorage-localstorage"),
	).toBeVisible();
});

test("filters questions by status", async ({ page }) => {
	await page.goto("/gfe75");

	await page.getByTestId("filter-status").locator("[role='combobox']").click();
	await page.getByRole("option", { name: "Done" }).click();

	await expect(page.getByTestId("question-title-debounce")).toBeVisible();
	await expect(
		page.getByTestId("question-title-array-prototype-reduce"),
	).toHaveCount(0);
});

test("keeps filters below the progress summary before the wide breakpoint", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1270, height: 900 });
	await page.goto("/gfe75");

	await expect(page.getByTestId("question-title-debounce")).toBeVisible();

	const progress = page.getByTestId("track-progress");
	const categorySelect = page.getByTestId("filter-category");
	const statusSelect = page.getByTestId("filter-status");
	const searchInput = page.getByTestId("filter-search");

	await expect(progress).toBeVisible();
	await expect(categorySelect).toBeVisible();
	await expect(statusSelect).toBeVisible();
	await expect(searchInput).toBeVisible();

	const progressBox = await progress.boundingBox();
	const categoryBox = await categorySelect.boundingBox();
	const statusBox = await statusSelect.boundingBox();
	const searchBox = await searchInput.boundingBox();

	expect(progressBox).not.toBeNull();
	expect(categoryBox).not.toBeNull();
	expect(statusBox).not.toBeNull();
	expect(searchBox).not.toBeNull();

	const progressBottom = progressBox!.y + progressBox!.height;
	const firstFilterTop = Math.min(categoryBox!.y, statusBox!.y, searchBox!.y);

	expect(firstFilterTop).toBeGreaterThan(progressBottom + 4);
});
