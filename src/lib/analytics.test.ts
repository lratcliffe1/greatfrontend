import type { BeforeSendEvent } from "@vercel/analytics/next";
import { analyticsBeforeSend } from "@/lib/analytics";

describe("analyticsBeforeSend", () => {
	it("returns event when URL is valid", () => {
		const event = {
			type: "pageview",
			url: "https://example.com/gfe75",
		} as BeforeSendEvent;
		const result = analyticsBeforeSend(event);
		expect(result).not.toBeNull();
		expect(result?.url).toContain("/gfe75");
		expect(result?.url).not.toContain("?");
		expect(result?.url).not.toContain("#");
	});

	it("returns null for internal paths", () => {
		const event = {
			type: "pageview",
			url: "https://example.com/_next/static/chunk.js",
		} as BeforeSendEvent;
		const result = analyticsBeforeSend(event);
		expect(result).toBeNull();
	});

	it("returns null for api paths", () => {
		const event = {
			type: "pageview",
			url: "https://example.com/api/graphql",
		} as BeforeSendEvent;
		const result = analyticsBeforeSend(event);
		expect(result).toBeNull();
	});

	it("normalizes trailing slash in pathname", () => {
		const event = {
			type: "pageview",
			url: "https://example.com/unique-path/",
		} as BeforeSendEvent;
		const result = analyticsBeforeSend(event);
		expect(result).not.toBeNull();
		expect(result?.url).toContain("/unique-path");
		expect(result?.url).not.toMatch(/\/$/);
	});

	it("strips query and hash from URL", () => {
		const event = {
			type: "pageview",
			url: "https://example.com/another-path?search=foo&status=done#section",
		} as BeforeSendEvent;
		const result = analyticsBeforeSend(event);
		expect(result).not.toBeNull();
		expect(result?.url).not.toContain("search");
		expect(result?.url).not.toContain("status");
		expect(result?.url).not.toContain("#");
	});
});
