import { expect, test } from "@playwright/test";

test("track tabs and question cards render", async ({ page }) => {
	await page.goto("/gfe75");
	await expect(page.getByTestId("track-heading-gfe75")).toBeVisible();
	await expect(page.getByTestId("question-title-debounce")).toBeVisible();

	await page.getByTestId("track-tab-blind75").click();
	await expect(page).toHaveURL(/\/blind75$/);
	await expect(
		page.getByTestId("question-title-balanced-brackets"),
	).toBeVisible();
});
