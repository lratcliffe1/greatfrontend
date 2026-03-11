import { expect, test } from "@playwright/test";

test("question detail page loads and shows content", async ({ page }) => {
	await page.goto("/gfe75");
	await page.getByTestId("open-solution-debounce").click();

	await expect(page).toHaveURL(/\/gfe75\/debounce$/);
	await expect(page.getByTestId("question-detail-title")).toBeVisible();
	await expect(
		page.getByText(
			"Debouncing controls how often a function is allowed to execute over time.",
		),
	).toBeVisible();
	await expect(page.getByTestId("question-summary-panel")).toBeVisible();
});

test("back to list link navigates to track", async ({ page }) => {
	await page.goto("/gfe75/debounce");
	await page.getByTestId("back-to-list-link").click();

	await expect(page).toHaveURL(/\/gfe75$/);
	await expect(page.getByTestId("track-heading-gfe75")).toBeVisible();
});
