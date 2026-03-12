import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	{
		rules: {
			"import/first": "error",
			"import/newline-after-import": ["error", { count: 1 }],
			"import/no-duplicates": "error",
			"no-restricted-imports": [
				"error",
				{
					patterns: ["../*"],
				},
			],
		},
	},
	{
		files: ["**/*.test.{ts,tsx}", "tests/**/*.ts"],
		rules: {
			"no-restricted-globals": [
				"error",
				{ name: "fdescribe", message: "Do not commit focused test suites." },
				{ name: "fit", message: "Do not commit focused tests." },
				{ name: "xdescribe", message: "Do not commit skipped test suites." },
				{ name: "xit", message: "Do not commit skipped tests." },
				{ name: "xtest", message: "Do not commit skipped tests." },
			],
			"no-restricted-properties": [
				"error",
				{
					object: "describe",
					property: "only",
					message: "Do not commit focused test suites.",
				},
				{
					object: "it",
					property: "only",
					message: "Do not commit focused tests.",
				},
				{
					object: "test",
					property: "only",
					message: "Do not commit focused tests.",
				},
			],
		},
	},
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
		"coverage/**",
		"playwright-report/**",
		"test-results/**",
		// Avoid eslint-plugin-react bug when linting config files (getFilename is not a function)
		"eslint.config.mjs",
		"**/*.config.{js,ts,mjs,cjs}",
	]),
]);

export default eslintConfig;
