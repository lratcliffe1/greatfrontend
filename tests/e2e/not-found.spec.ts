import { expect, test } from "@playwright/test";

test("invalid track shows not-found page", async ({ page }) => {
	await page.goto("/invalid-track");
	await expect(page.getByTestId("not-found-title")).toBeVisible();
	await expect(page.getByTestId("not-found-message")).toBeVisible();
});

test("invalid question slug shows not-found page", async ({ page }) => {
	await page.goto("/gfe75/non-existent-question");
	await expect(page.getByTestId("not-found-title")).toBeVisible();
	await expect(page.getByTestId("not-found-message")).toBeVisible();
});
