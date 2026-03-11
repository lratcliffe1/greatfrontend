import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
	dir: "./",
});

const config: Config = {
	testEnvironment: "jsdom",
	watchman: false,
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/tests/e2e/"],
	collectCoverageFrom: [
		"src/**/*.{ts,tsx}",
		"!src/**/*.test.{ts,tsx}",
		"!src/**/index.ts",
		"!src/app/**",
		"!src/providers/**",
		"!src/solutions/**/visualizer*.tsx",
		"!src/solutions/**/*-demo.tsx",
	],
	coverageThreshold: {
		global: {
			branches: 60,
			functions: 60,
			lines: 60,
			statements: 60,
		},
	},
};

export default createJestConfig(config);
