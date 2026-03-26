import { defineConfig, devices } from "@playwright/test";

const E2E_HOST = "127.0.0.1";
const E2E_PORT = 3100;
const E2E_BASE_URL = `http://${E2E_HOST}:${E2E_PORT}`;

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: true,
	retries: 1,
	use: {
		baseURL: E2E_BASE_URL,
		trace: "on-first-retry",
	},
	webServer: {
		// Use a dedicated test port and always start a fresh server so local dev servers
		// (often on 3000) cannot leak stale assets/state into e2e runs.
		command: `npm run build && npm run start -- --hostname ${E2E_HOST} --port ${E2E_PORT}`,
		url: E2E_BASE_URL,
		reuseExistingServer: false,
	},
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		{ name: "firefox", use: { ...devices["Desktop Firefox"] } },
		{ name: "webkit", use: { ...devices["Desktop Safari"] } },
	],
});
